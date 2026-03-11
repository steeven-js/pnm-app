import type { WorkflowDefinition, InvestigationContext, StepAnalysis } from './types';

// ─── Email parser ───────────────────────────────────────────────────────────

const OPERATOR_MAP: Record<string, string> = {
  '01': 'Orange Caraibe', '02': 'Digicel', '03': 'SFR/Only',
  '04': 'Dauphin Telecom', '05': 'UTS Caraibe', '06': 'Free Caraibe',
};

function parseIncidentEmail(text: string): InvestigationContext | null {
  const ctx: InvestigationContext = {};

  // Extract MSISDN (069x format)
  const msisdns = [...new Set(text.match(/06[0-9]{8}/g) ?? [])];
  if (msisdns.length > 0) {
    ctx.msisdn = msisdns[0];
    ctx.all_msisdns = msisdns;
  }

  // Extract filenames (PNMDATA.XX.XX...)
  const filenames = [...new Set(text.match(/PNMDATA\.\d{2}\.\d{2}\.\d{14}\.\d{3}/g) ?? [])];
  if (filenames.length > 0) {
    ctx.filename = filenames[0];
    ctx.all_filenames = filenames;
  }

  // Extract operator codes from filenames
  if (ctx.filename) {
    const parts = (ctx.filename as string).split('.');
    ctx.op_expediteur = parts[1];
    ctx.op_destinataire = parts[2];
    ctx.op_expediteur_name = OPERATOR_MAP[parts[1]] ?? parts[1];
    ctx.op_destinataire_name = OPERATOR_MAP[parts[2]] ?? parts[2];
  }

  // Extract ticket codes (1110, 1210, 1220, etc.)
  const tickets = [...new Set(text.match(/\b(1110|1120|1210|1220|1410|1430|1510|1520|1530|2400|2410|2420|2430|3400|3410|3420|3430|7000)\b/g) ?? [])];
  if (tickets.length > 0) ctx.ticket_codes = tickets;

  // Extract dates (DD/MM/YYYY or YYYY-MM-DD)
  const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})/);
  if (dateMatch) ctx.date_incident = dateMatch[1];

  // Extract error codes (refus, code reponse)
  const codeRefus = text.match(/code[_ ]?(?:refus|reponse|erreur)\s*[:=]\s*(\d+)/i);
  if (codeRefus) ctx.code_refus = codeRefus[1];

  // Extract hash MD5
  const hash = text.match(/\b[a-f0-9]{32}\b/);
  if (hash) ctx.hash_portage = hash[0];

  // Extract RIO
  const rio = text.match(/\b\d{2}[A-Z]\d{6}[A-Z0-9]{3}\b/);
  if (rio) ctx.rio = rio[0];

  // Incident type keywords
  if (/refus|1220|rejet/i.test(text)) ctx.incident_type = 'refus';
  else if (/bloqu|en\s*cours|attente|retard/i.test(text)) ctx.incident_type = 'blocage';
  else if (/7000|erreur|err/i.test(text)) ctx.incident_type = 'erreur_technique';
  else if (/conflit|ecart|sync/i.test(text)) ctx.incident_type = 'conflit_sync';
  else if (/ack|acquit/i.test(text)) ctx.incident_type = 'ack_manquant';
  else ctx.incident_type = 'autre';

  return Object.keys(ctx).length > 0 ? ctx : null;
}

// ─── Result analyzers ───────────────────────────────────────────────────────

function analyzePortageStatus(output: string, ctx: InvestigationContext): StepAnalysis {
  const lower = output.toLowerCase();

  if (!output.trim()) {
    return { status: 'warning', message: 'Aucun resultat retourne. Le MSISDN n\'existe peut-etre pas dans la base.' };
  }

  // Check for common states
  if (/termin/i.test(output)) {
    return {
      status: 'success',
      message: 'Le portage est termine.',
      details: ['Le portage a ete mene a bien. Verifier si le probleme signale est encore d\'actualite.'],
    };
  }

  if (/en\s*cours|encours/i.test(output)) {
    const dateMatch = output.match(/\d{4}-\d{2}-\d{2}/);
    return {
      status: 'warning',
      message: 'Le portage est toujours en cours.',
      details: [
        dateMatch ? `Date de portage souhaitee : ${dateMatch[0]}` : 'Verifier la date de portage souhaitee.',
        'Passer a l\'etape suivante pour verifier les tickets recus.',
      ],
      extractedValues: dateMatch ? { date_portage: dateMatch[0] } : undefined,
    };
  }

  if (/refus|refuse/i.test(output)) {
    return {
      status: 'error',
      message: 'Le portage a ete refuse.',
      details: ['Verifier le code de refus dans les tickets pour comprendre le motif.'],
      nextStepId: 'check-refus-detail',
    };
  }

  if (/annul/i.test(output)) {
    return {
      status: 'info',
      message: 'Le portage a ete annule.',
      details: ['Verifier qui a initie l\'annulation (OPR ou OPD).'],
    };
  }

  return {
    status: 'info',
    message: 'Etat du portage recupere. Analyser les details ci-dessus.',
  };
}

function analyzeTicketHistory(output: string, _ctx: InvestigationContext): StepAnalysis {
  if (!output.trim()) {
    return { status: 'warning', message: 'Aucun ticket trouve pour ce portage.' };
  }

  const has1110 = /1110/.test(output);
  const has1210 = /1210/.test(output);
  const has1220 = /1220/.test(output);
  const has1430 = /1430/.test(output);
  const has7000 = /7000/.test(output);

  const details: string[] = [];
  if (has1110) details.push('Ticket 1110 (Demande de portage) present.');
  if (has1210) details.push('Ticket 1210 (Reponse positive) present.');
  if (has1220) details.push('Ticket 1220 (Reponse negative / refus) present.');
  if (has1430) details.push('Ticket 1430 (Confirmation de portage) present.');
  if (has7000) details.push('Ticket 7000 (Erreur technique) detecte !');

  if (has1110 && !has1210 && !has1220) {
    return {
      status: 'warning',
      message: 'Demande envoyee (1110) mais aucune reponse recue (ni 1210 ni 1220).',
      details: [...details, 'L\'operateur donneur n\'a pas encore repondu. Envisager une relance.'],
      nextStepId: 'check-logs',
    };
  }

  if (has1220) {
    return {
      status: 'error',
      message: 'Le portage a ete refuse (1220 present).',
      details,
      nextStepId: 'check-refus-detail',
    };
  }

  if (has7000) {
    return {
      status: 'error',
      message: 'Erreur technique detectee (7000).',
      details,
      nextStepId: 'check-logs',
    };
  }

  return {
    status: 'info',
    message: `${details.length} type(s) de ticket trouves.`,
    details,
  };
}

function analyzeLogOutput(output: string, _ctx: InvestigationContext): StepAnalysis {
  const lower = output.toLowerCase();
  const details: string[] = [];

  if (/fin de traitement/i.test(output)) {
    details.push('"Fin de Traitement" trouve — le script s\'est execute correctement.');
  } else {
    details.push('"Fin de Traitement" ABSENT — le script ne s\'est peut-etre pas termine.');
  }

  if (/check success/i.test(output)) {
    details.push('"Check success" present.');
  }

  if (/error|erreur|exception|failed/i.test(output)) {
    return {
      status: 'error',
      message: 'Erreurs detectees dans les logs.',
      details,
    };
  }

  if (!/fin de traitement/i.test(output)) {
    return {
      status: 'warning',
      message: 'Le script ne semble pas s\'etre termine correctement.',
      details,
    };
  }

  return {
    status: 'success',
    message: 'Les logs semblent normaux.',
    details,
  };
}

function analyzeRefusDetail(output: string, _ctx: InvestigationContext): StepAnalysis {
  if (!output.trim()) {
    return { status: 'warning', message: 'Aucun detail de refus trouve.' };
  }

  const details: string[] = [];
  // Common refusal codes
  if (/10\b/.test(output)) details.push('Code 10 : Delai insuffisant.');
  if (/20\b/.test(output)) details.push('Code 20 : Erreur de format.');
  if (/30\b/.test(output)) details.push('Code 30 : RIO incorrect.');
  if (/40\b/.test(output)) details.push('Code 40 : Numero non eligible.');
  if (/50\b/.test(output)) details.push('Code 50 : Demande en doublon.');

  return {
    status: 'error',
    message: 'Details du refus recuperes.',
    details: details.length > 0 ? details : ['Analyser le code de refus manuellement.'],
  };
}

// ─── Workflow definition ────────────────────────────────────────────────────

export const incidentWorkflow: WorkflowDefinition = {
  id: 'incident',
  title: '[PNM][INCIDENT]',
  icon: 'solar:danger-triangle-bold-duotone',
  color: '#ef4444',
  description: 'Investigation d\'un email d\'incident PNM : refus, blocage, erreur technique, conflit.',
  emailSubjects: ['[PNM][INCIDENT]', '[PNM] INCIDENT'],
  parseEmail: parseIncidentEmail,
  steps: [
    {
      id: 'check-portage',
      title: 'Verifier l\'etat du portage',
      icon: 'solar:magnifer-bold-duotone',
      description: 'Rechercher le portage dans la base PortaDB pour connaitre son etat actuel.',
      commands: [
        {
          type: 'sql',
          label: 'Etat actuel du portage',
          template: `SELECT p.id, p.portage_msisdn AS msisdn, e.etat_name AS etat,
  p.portage_date_souhaitee, p.portage_date_creation
FROM PORTAGE p
JOIN ETAT e ON e.id = p.portage_etat
WHERE p.portage_msisdn = '{{msisdn}}'
ORDER BY p.portage_date_creation DESC
LIMIT 5;`,
        },
      ],
      expectsResult: true,
      resultPlaceholder: 'Collez ici le resultat de la requete SQL...',
      analyzeResult: analyzePortageStatus,
      tips: [
        'Executer cette requete sur PortaDB (vmqproportawebdb01 — MySQL :3306).',
        'Si plusieurs resultats, le plus recent est en premier.',
      ],
    },
    {
      id: 'check-tickets',
      title: 'Verifier les tickets echanges',
      icon: 'solar:ticket-bold-duotone',
      description: 'Lister tous les tickets (1110, 1210, 1220, 1430...) pour ce portage.',
      commands: [
        {
          type: 'sql',
          label: 'Historique des tickets',
          template: `SELECT pd.id, pd.code_ticket, ct.description AS ticket_desc,
  pd.code_reponse, pd.date, pd.commentaire
FROM DATA pd
JOIN PORTAGE p ON p.id = pd.id_portage
JOIN CODE_TICKET ct ON ct.code = pd.code_ticket
WHERE p.portage_msisdn = '{{msisdn}}'
ORDER BY pd.date ASC;`,
        },
      ],
      expectsResult: true,
      resultPlaceholder: 'Collez ici le resultat de la requete SQL...',
      analyzeResult: analyzeTicketHistory,
    },
    {
      id: 'check-refus-detail',
      title: 'Analyser le motif de refus',
      icon: 'solar:close-circle-bold-duotone',
      description: 'Si un refus (1220) a ete detecte, recuperer le code et le motif.',
      commands: [
        {
          type: 'sql',
          label: 'Detail du refus',
          template: `SELECT p.portage_msisdn, pd.code_ticket, pd.code_reponse,
  cr.description AS motif_refus, pd.date, pd.commentaire
FROM DATA pd
JOIN PORTAGE p ON p.id = pd.id_portage
JOIN CODE_REPONSE cr ON cr.code = pd.code_reponse
WHERE p.portage_msisdn = '{{msisdn}}'
  AND pd.code_ticket = 1220
ORDER BY pd.date DESC;`,
        },
      ],
      expectsResult: true,
      resultPlaceholder: 'Collez ici le resultat...',
      analyzeResult: analyzeRefusDetail,
    },
    {
      id: 'check-logs',
      title: 'Verifier les logs serveur',
      icon: 'solar:server-bold-duotone',
      description: 'Consulter les logs sur vmqproportasync01 pour verifier le traitement.',
      commands: [
        {
          type: 'ssh',
          label: 'Log PnmAckManager (acquittements)',
          server: 'vmqproportasync01',
          template: 'tail -n 50 /home/porta_pnmv3/PortaSync/log/PnmAckManager.log',
        },
        {
          type: 'ssh',
          label: 'Log PnmDataManager (vacations)',
          server: 'vmqproportasync01',
          template: 'tail -n 30 /home/porta_pnmv3/PortaSync/log/PnmDataManager.log',
        },
        {
          type: 'ssh',
          label: 'Rechercher le MSISDN dans les logs',
          server: 'vmqproportasync01',
          template: 'grep -r "{{msisdn}}" /home/porta_pnmv3/PortaSync/log/ --include="*.log" | tail -n 20',
        },
      ],
      expectsResult: true,
      resultPlaceholder: 'Collez ici la sortie des logs...',
      analyzeResult: analyzeLogOutput,
      tips: [
        'Se connecter en SSH : ssh 172.24.119.69',
        'Chercher "Fin de Traitement" pour confirmer l\'execution complete.',
      ],
    },
    {
      id: 'check-fichiers',
      title: 'Verifier les fichiers echanges',
      icon: 'solar:file-check-bold-duotone',
      description: 'Verifier si les fichiers PNMDATA ont bien ete envoyes/recus pour l\'operateur concerne.',
      commands: [
        {
          type: 'ssh',
          label: 'Fichiers envoyes a l\'operateur',
          server: 'vmqproportasync01',
          template: 'ls -la /home/porta_pnmv3/PortaSync/pnmdata/{{op_expediteur}}/arch_send/ | tail -n 10',
        },
        {
          type: 'ssh',
          label: 'Fichiers recus de l\'operateur',
          server: 'vmqproportasync01',
          template: 'ls -la /home/porta_pnmv3/PortaSync/pnmdata/{{op_expediteur}}/arch_recv/ | tail -n 10',
        },
        {
          type: 'ssh',
          label: 'Fichiers en erreur (.ERR)',
          server: 'vmqproportasync01',
          template: 'find /home/porta_pnmv3/PortaSync/pnmdata/ -name "*.ERR" -mtime -3 -ls',
        },
      ],
      tips: [
        'Les fichiers .ERR indiquent un rejet par l\'operateur.',
        'arch_send = fichiers envoyes, arch_recv = fichiers recus.',
      ],
    },
    {
      id: 'conclusion',
      title: 'Conclusion et action',
      icon: 'solar:check-circle-bold-duotone',
      description: 'Synthese de l\'investigation et actions a entreprendre.',
      tips: [
        'Si blocage sans reponse > 3 jours : relancer l\'operateur donneur par email.',
        'Si refus RIO incorrect : demander un nouveau RIO au client.',
        'Si erreur technique (7000) : escalader au support N2 Porta.',
        'Si conflit SYNC : ouvrir un ticket GPMAG (secretariat@gpmag.fr).',
        'Toujours mettre FWI_PNM_SI@digicelgroup.fr en copie des relances.',
      ],
    },
  ],
};
