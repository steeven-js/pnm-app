import type { WorkflowDefinition, InvestigationContext, StepAnalysis } from './types';

// ─── Operator map ───────────────────────────────────────────────────────────

const OPERATOR_MAP: Record<string, string> = {
  '01': 'Orange Caraibe', '02': 'Digicel', '03': 'SFR/Only',
  '04': 'Dauphin Telecom', '05': 'UTS Caraibe', '06': 'Free Caraibe',
};

// ─── Email parser ───────────────────────────────────────────────────────────

function parseArEmail(text: string): InvestigationContext | null {
  const ctx: InvestigationContext = {};

  // Extract filenames (PNMDATA or PNMSYNC)
  const filenames = [...new Set(text.match(/PNM(?:DATA|SYNC)\.\d{2}\.\d{2}\.\d{14}\.\d{3}/g) ?? [])];
  if (filenames.length > 0) {
    ctx.filename = filenames[0];
    ctx.all_filenames = filenames;
    ctx.nb_fichiers = String(filenames.length);
    ctx.file_type = filenames[0].startsWith('PNMSYNC') ? 'PNMSYNC' : 'PNMDATA';
  }

  // Extract MSISDN
  const msisdns = [...new Set(text.match(/06[0-9]{8}/g) ?? [])];
  if (msisdns.length > 0) {
    ctx.msisdn = msisdns[0];
    ctx.all_msisdns = msisdns;
    ctx.nb_msisdns = String(msisdns.length);
  }

  // Extract operator codes from filenames
  if (ctx.filename) {
    const parts = (ctx.filename as string).split('.');
    ctx.op_expediteur = parts[1];
    ctx.op_destinataire = parts[2];
    ctx.op_expediteur_name = OPERATOR_MAP[parts[1]] ?? parts[1];
    ctx.op_destinataire_name = OPERATOR_MAP[parts[2]] ?? parts[2];
  }

  // Extract error ticket format [0000, 02, 04, timestamp, Ecode, ...]
  const errTicket = text.match(/\[\s*\d{4}\s*,\s*(\d{2})\s*,\s*(\d{2})\s*,\s*\d{14}\s*,\s*(E\d{3})/);
  if (errTicket) {
    ctx.op_expediteur = errTicket[1];
    ctx.op_destinataire = errTicket[2];
    ctx.op_expediteur_name = OPERATOR_MAP[errTicket[1]] ?? errTicket[1];
    ctx.op_destinataire_name = OPERATOR_MAP[errTicket[2]] ?? errTicket[2];
    ctx.error_code = errTicket[3];
  }

  // Extract delay from "envoye depuis plus de XX minutes"
  const delayMinMatch = text.match(/depuis\s+plus\s+de\s+(\d+)\s*minutes/i);
  if (delayMinMatch) ctx.delay_minutes = delayMinMatch[1];

  // Detect AR type
  if (/AR\s*(SYNC|sync)|non.recu.*PNMSYNC|PNMSYNC.*non.recu/i.test(text)) ctx.ar_type = 'SYNC';
  else if (/ACR/i.test(text)) ctx.ar_type = 'ACR';
  else if (/12[12]0|en attente|attente/i.test(text)) ctx.ar_type = 'ticket_1210';
  else if (/non.recu|non-recu|non recu/i.test(text)) ctx.ar_type = 'AR_non_recu';
  else ctx.ar_type = 'inconnu';

  // Extract delay (minutes)
  const delayMatch = text.match(/(\d+)\s*(?:min|minutes)/i);
  if (delayMatch) ctx.delay_minutes = delayMatch[1];

  // Extract ticket codes
  const tickets = [...new Set(text.match(/\b(1110|1210|1220|1410|1430|7000)\b/g) ?? [])];
  if (tickets.length > 0) ctx.ticket_codes = tickets;

  // Count "Attente" lines (from Excel summary in email)
  const attenteMatch = text.match(/Attente\s+12XX\s+\w+\s+vers\s+\w+\s*:\s*(\d+)/gi);
  if (attenteMatch) {
    ctx.nb_attente_total = String(attenteMatch.reduce((sum, m) => {
      const n = m.match(/:\s*(\d+)/);
      return sum + (n ? parseInt(n[1], 10) : 0);
    }, 0));
  }

  // Detect source operator from email patterns
  if (/Free\s*Caraibe/i.test(text)) ctx.operateur_source = 'Free Caraibe';
  else if (/Orange/i.test(text)) ctx.operateur_source = 'Orange Caraibe';
  else if (/SFR|Outremer/i.test(text)) ctx.operateur_source = 'SFR/Only';
  else if (/Dauphin/i.test(text)) ctx.operateur_source = 'Dauphin Telecom';
  else if (/UTS/i.test(text)) ctx.operateur_source = 'UTS Caraibe';

  ctx.incident_type = 'ar_non_recu';

  return Object.keys(ctx).length > 0 ? ctx : null;
}

// ─── Result analyzers ───────────────────────────────────────────────────────

function analyzeArSummary(output: string, ctx: InvestigationContext): StepAnalysis {
  if (!output.trim()) {
    return { status: 'warning', message: 'Aucun contenu colle. Collez le contenu du mail ou du fichier Excel.' };
  }

  const msisdns = [...new Set(output.match(/06[0-9]{8}/g) ?? [])];
  const filenames = [...new Set(output.match(/PNM(?:DATA|SYNC)\.\d{2}\.\d{2}\.\d{14}\.\d{3}/g) ?? [])];

  // Extract error ticket [0000, XX, YY, timestamp, Exxx, ...]
  const errTicket = output.match(/\[\s*\d{4}\s*,\s*(\d{2})\s*,\s*(\d{2})\s*,\s*\d{14}\s*,\s*(E\d{3})/);
  const hasArNonRecu = /AR\s*non.recu|non.acquit|envoye\s+depuis\s+plus/i.test(output);

  const details: string[] = [];
  if (msisdns.length > 0) details.push(`${msisdns.length} MSISDN detecte(s).`);
  if (filenames.length > 0) {
    const syncCount = filenames.filter(f => f.startsWith('PNMSYNC')).length;
    const dataCount = filenames.filter(f => f.startsWith('PNMDATA')).length;
    if (syncCount > 0) details.push(`${syncCount} fichier(s) PNMSYNC concerne(s).`);
    if (dataCount > 0) details.push(`${dataCount} fichier(s) PNMDATA concerne(s).`);
  }
  if (errTicket) {
    const opExp = OPERATOR_MAP[errTicket[1]] ?? errTicket[1];
    const opDest = OPERATOR_MAP[errTicket[2]] ?? errTicket[2];
    details.push(`Ticket d'erreur detecte : ${opExp} → ${opDest}, code ${errTicket[3]}.`);
  }
  if (hasArNonRecu) {
    details.push('Type d\'incident : AR non-recu (acquittement manquant).');
  }

  const extractedValues: Record<string, string | string[]> = {};
  if (msisdns.length > 0) { extractedValues.all_msisdns = msisdns; extractedValues.msisdn = msisdns[0]; extractedValues.nb_msisdns = String(msisdns.length); }
  if (filenames.length > 0) { extractedValues.all_filenames = filenames; extractedValues.filename = filenames[0]; extractedValues.nb_fichiers = String(filenames.length); }
  if (errTicket) {
    extractedValues.op_expediteur = errTicket[1];
    extractedValues.op_destinataire = errTicket[2];
    extractedValues.op_expediteur_name = OPERATOR_MAP[errTicket[1]] ?? errTicket[1];
    extractedValues.op_destinataire_name = OPERATOR_MAP[errTicket[2]] ?? errTicket[2];
    extractedValues.error_code = errTicket[3];
  }

  if (msisdns.length === 0 && filenames.length === 0 && !errTicket && !hasArNonRecu) {
    return { status: 'warning', message: 'Aucun MSISDN, fichier ni ticket d\'erreur detecte dans le contenu colle.' };
  }

  const totalItems = msisdns.length + filenames.length + (errTicket ? 1 : 0);
  return {
    status: 'info',
    message: `${totalItems} element(s) identifie(s). Passez a la verification.`,
    details,
    extractedValues,
  };
}

function analyzeAcrSearch(output: string, _ctx: InvestigationContext): StepAnalysis {
  const lower = output.toLowerCase();

  if (!output.trim()) {
    return {
      status: 'warning',
      message: 'Aucune sortie. Verifiez la commande et reessayez.',
    };
  }

  // Check if ACR found
  const hasAcr = /\.ACR/i.test(output) || /acquit/i.test(output);
  const hasSuccess = /success|ok|recu|received/i.test(output);
  const hasTmpErr = /\.tmp\.ERR/i.test(output);
  const hasError = /\.ERR/i.test(output) || /error|erreur/i.test(output);
  const noResult = output.trim().split('\n').length <= 1 && !/PNMDATA/.test(output);

  // Special case: .tmp.ERR files stuck in recv/
  if (hasTmpErr) {
    const tmpFiles = [...new Set(output.match(/[\w./]+\.tmp\.ERR/g) ?? [])];
    const isDauphinOrUts = /\/04\/|\/05\/|dauphin|uts/i.test(output);

    const details: string[] = [
      `Fichier(s) .tmp.ERR detecte(s) : ${tmpFiles.join(', ')}`,
      'Un .tmp.ERR dans recv/ est un fichier BLOQUE qui empeche le traitement.',
      'Etape 1 : Verifier dans arch_recv/ si le fichier original a deja ete traite.',
      'Etape 2 : Si le fichier existe dans arch_recv/, le .tmp.ERR peut etre supprime en toute securite.',
      'Etape 3 : Utiliser la commande "rm" proposee ci-dessus pour supprimer le .tmp.ERR.',
    ];

    if (isDauphinOrUts) {
      details.push('Note : Dauphin Telecom (04) et UTS (05) generent regulierement ce type de fichier. C\'est un incident recurrent chez ces petits operateurs.');
    }

    return {
      status: 'warning',
      message: 'Fichier .tmp.ERR bloque detecte dans recv/. Verification et suppression necessaires.',
      details,
      extractedValues: { acr_found: 'tmp_err', has_tmp_err: 'oui' },
    };
  }

  if (noResult) {
    return {
      status: 'error',
      message: 'Aucun ACR trouve. L\'operateur n\'a toujours pas acquitte le fichier.',
      details: [
        'Le fichier PNMDATA envoye n\'a pas ete acquitte par l\'operateur.',
        'Si le delai depasse 24h, envisager une relance.',
      ],
      extractedValues: { acr_found: 'non' },
    };
  }

  if (hasError) {
    const details: string[] = [
      'Le fichier a ete rejete (fichier .ERR present).',
    ];

    // Parse ERR content for common error codes
    if (/E008/i.test(output)) details.push('Code E008 : Fichier deja recu (doublon). Pas d\'action necessaire.');
    else if (/E003/i.test(output)) details.push('Code E003 : Erreur de format dans le fichier.');
    else if (/E001/i.test(output)) details.push('Code E001 : Fichier non attendu par l\'operateur.');
    else if (/E002/i.test(output)) details.push('Code E002 : Numero de sequence invalide.');
    else if (/E004/i.test(output)) details.push('Code E004 : Emetteur non reconnu.');
    else if (/E005/i.test(output)) details.push('Code E005 : Destinataire incorrect.');
    else if (/E006/i.test(output)) details.push('Code E006 : Nombre de lignes incorrect.');
    else if (/E000/i.test(output)) details.push('Code E000 : Aucune erreur (acquittement OK).');
    else details.push('Utiliser la commande "cat" pour lire le contenu du .ERR et connaitre le motif.');

    // Extract ERR filenames for context
    const errFiles = [...new Set(output.match(/[\w./]+\.ERR/g) ?? [])];
    if (errFiles.length > 0) details.push(`Fichier(s) .ERR : ${errFiles.join(', ')}`);

    return {
      status: /E000/.test(output) ? 'success' : 'error',
      message: /E000/.test(output) ? 'Acquittement recu (E000). Le fichier a ete traite.' : 'Un fichier .ERR a ete detecte. L\'operateur a rejete le fichier.',
      details,
      extractedValues: { acr_found: /E000/.test(output) ? 'oui' : 'err' },
    };
  }

  if (hasAcr || hasSuccess) {
    return {
      status: 'success',
      message: 'ACR trouve ! L\'operateur a acquitte le fichier.',
      details: [
        'L\'acquittement a ete recu depuis l\'envoi du mail d\'incident.',
        'Cet incident est probablement resolu — le traitement a eu lieu avec un delai.',
        'Verifier que le ticket 1210 a bien ete emis suite a l\'acquittement.',
      ],
      extractedValues: { acr_found: 'oui' },
    };
  }

  return {
    status: 'info',
    message: 'Resultat recupere. Analyser manuellement si l\'ACR est present.',
    extractedValues: { acr_found: 'a_verifier' },
  };
}

function analyzeTicketCheck(output: string, _ctx: InvestigationContext): StepAnalysis {
  if (!output.trim()) {
    return { status: 'warning', message: 'Aucun resultat. Verifiez la requete.' };
  }

  const has1210 = /1210/.test(output);
  const has1220 = /1220/.test(output);
  const has1430 = /1430/.test(output);

  if (has1430) {
    return {
      status: 'success',
      message: 'Le portage est confirme (ticket 1430 present). L\'incident est resolu.',
      details: ['Le ticket 1430 (Confirmation de Portage) est present.', 'Le processus s\'est termine normalement, avec du retard.'],
    };
  }

  if (has1210) {
    return {
      status: 'success',
      message: 'La reponse 1210 a ete emise. Le ticket en attente est maintenant traite.',
      details: ['Le ticket 1210 (Reponse positive) a ete envoye.', 'L\'incident est resolu — la reponse etait en attente au moment du mail.'],
    };
  }

  if (has1220) {
    const refusDetails: string[] = ['Le portage a ete refuse via un ticket 1220.'];

    // Detect specific refusal codes
    const REFUS_CODES: Record<string, string> = {
      R322: 'Resiliation effective — la ligne du client a ete resiliee. On ne peut pas porter une ligne resiliee.',
      R320: 'Numero non attribue — le MSISDN n\'est pas attribue chez l\'operateur donneur.',
      R310: 'RIO invalide — le RIO fourni ne correspond pas au MSISDN.',
      R311: 'RIO expire — le RIO a expire, le client doit en redemander un.',
      R330: 'Portage deja en cours — une demande de portage est deja active pour ce numero.',
      R340: 'Delai non respecte — le delai reglementaire n\'est pas respecte.',
      R350: 'Opposition du titulaire — le titulaire de la ligne s\'oppose au portage.',
      R360: 'Numero suspendu — la ligne est suspendue (impaye, fraude...).',
    };

    const foundCodes: string[] = [];
    for (const [code, desc] of Object.entries(REFUS_CODES)) {
      if (new RegExp(code, 'i').test(output)) {
        foundCodes.push(code);
        refusDetails.push(`Code ${code} : ${desc}`);
      }
    }

    if (foundCodes.length === 0) {
      refusDetails.push('Code de refus non identifie automatiquement. Verifier le champ code_motif dans le resultat.');
    }

    // Specific guidance per refusal type
    if (foundCodes.includes('R322')) {
      refusDetails.push('Action : Informer le CDC que la portabilite n\'est pas possible sur une ligne resiliee. Le client doit d\'abord reactiver sa ligne chez l\'operateur donneur.');
    } else if (foundCodes.includes('R310') || foundCodes.includes('R311')) {
      refusDetails.push('Action : Demander au client de fournir un nouveau RIO valide (via appel USSD aupres de son operateur).');
    } else if (foundCodes.includes('R330')) {
      refusDetails.push('Action : Attendre la fin du portage en cours ou annuler la demande precedente.');
    } else if (foundCodes.includes('R360')) {
      refusDetails.push('Action : Le client doit regulariser sa situation (paiement) aupres de son operateur actuel avant de pouvoir porter.');
    }

    return {
      status: 'error',
      message: `Le portage a ete refuse (1220)${foundCodes.length > 0 ? ` — Code ${foundCodes.join(', ')}` : ''}.`,
      details: refusDetails,
      extractedValues: foundCodes.length > 0 ? { code_refus: foundCodes[0] } : undefined,
    };
  }

  return {
    status: 'warning',
    message: 'Aucune reponse (1210/1220) trouvee. Le ticket est toujours en attente.',
    details: [
      'Aucune reponse n\'a encore ete emise pour ce MSISDN.',
      'Verifier si le traitement a eu lieu (logs serveur).',
      'Si > 24h d\'attente, relancer l\'operateur donneur.',
    ],
  };
}

function analyzeDelay(output: string, _ctx: InvestigationContext): StepAnalysis {
  if (!output.trim()) {
    return { status: 'info', message: 'Indiquez le delai ou la date du mail incident.' };
  }

  // Try to parse a number (hours)
  const hoursMatch = output.match(/(\d+)\s*h/i);
  const daysMatch = output.match(/(\d+)\s*j/i);
  const minutesMatch = output.match(/(\d+)\s*min/i);

  let totalHours = 0;
  if (daysMatch) totalHours = parseInt(daysMatch[1], 10) * 24;
  else if (hoursMatch) totalHours = parseInt(hoursMatch[1], 10);
  else if (minutesMatch) totalHours = parseInt(minutesMatch[1], 10) / 60;
  else {
    // Try bare number as hours
    const bare = output.trim().match(/^\d+$/);
    if (bare) totalHours = parseInt(bare[0], 10);
  }

  if (totalHours === 0) {
    return { status: 'info', message: 'Delai non detecte. Indiquez en heures (ex: "4h", "2j", "30min").' };
  }

  if (totalHours < 4) {
    return {
      status: 'success',
      message: `Delai : ~${totalHours}h. C'est normal — attendre la prochaine vacation.`,
      details: [
        'Un delai de quelques heures est courant entre l\'envoi et l\'acquittement.',
        'Le mail d\'incident a ete envoye avant que la vacation traite le fichier.',
        'Action : rien a faire, le traitement suivra son cours normal.',
      ],
    };
  }

  if (totalHours < 24) {
    return {
      status: 'warning',
      message: `Delai : ~${totalHours}h. Surveiller — le traitement devrait avoir lieu dans la journee.`,
      details: [
        'Le delai est significatif mais pas encore critique.',
        'Verifier les logs serveur pour confirmer que le traitement est en cours.',
        'Si toujours en attente demain, relancer l\'operateur.',
      ],
    };
  }

  if (totalHours < 72) {
    return {
      status: 'error',
      message: `Delai : ~${Math.round(totalHours / 24)}j (${totalHours}h). Relancer l'operateur donneur.`,
      details: [
        'Le delai depasse 24h, ce qui est anormal.',
        'Envoyer un email de relance a l\'operateur concerne.',
        'Mettre FWI_PNM_SI@digicelgroup.fr en copie.',
      ],
    };
  }

  return {
    status: 'error',
    message: `Delai critique : ~${Math.round(totalHours / 24)}j. Escalader immediatement.`,
    details: [
      'Le delai depasse 3 jours — situation critique.',
      'Escalader au support N2 Porta et au secretariat GPMAG si necessaire.',
      'Envoyer un email de relance urgent a l\'operateur.',
    ],
  };
}

// ─── Workflow definition ────────────────────────────────────────────────────

export const arWorkflow: WorkflowDefinition = {
  id: 'ar-non-recu',
  title: '[PNM] AR non-reçus / Tickets en attente',
  icon: 'solar:clock-circle-bold-duotone',
  color: '#f59e0b',
  description: 'Investigation des acquittements non-recus et tickets 12XX en attente. Guide la verification et la priorisation.',
  emailSubjects: ['[PNM] Ticket 12XX en attente', '[PNM] Tickets 12XX en attente', '[PNM] AR SYNC non-recu', 'Attente 12XX'],
  parseEmail: parseArEmail,
  steps: [
    {
      id: 'parse-incident',
      title: 'Analyser le mail d\'incident',
      icon: 'solar:letter-opened-bold-duotone',
      description: 'Collez le contenu du mail (ou du fichier Excel) pour identifier les MSISDN et fichiers concernes.',
      expectsResult: true,
      resultPlaceholder: 'Collez ici le contenu du mail ou le contenu CSV/Excel...\n\nExemple :\nAttente 12XX DC vers Free : 5\n\nOu les lignes du fichier Excel avec les MSISDN et fichiers PNMDATA.',
      analyzeResult: analyzeArSummary,
      tips: [
        'Le mail "[PNM] Tickets 12XX en attente" est souvent envoye AVANT la premiere vacation (10h-11h).',
        'Les MSISDN listes sont dans la majorite des cas traites lors de cette vacation.',
        'Un mail recu a 09h ne signifie pas forcement un vrai incident.',
      ],
    },
    {
      id: 'check-acr',
      title: 'Verifier si l\'ACR a ete recu depuis',
      icon: 'solar:magnifer-bold-duotone',
      description: 'Rechercher sur le serveur si l\'acquittement (ACR) du fichier a ete recu entre-temps.',
      commands: [
        {
          type: 'ssh',
          label: 'Rechercher l\'ACR du fichier dans les archives',
          server: 'vmqproportasync01',
          template: 'ls -la /home/porta_pnmv3/PortaSync/pnmdata/{{op_expediteur}}/arch_recv/ | grep -i "ACR\\|$(date +%Y%m%d)" | tail -n 20',
        },
        {
          type: 'ssh',
          label: 'Rechercher le fichier specifique dans les logs',
          server: 'vmqproportasync01',
          template: 'grep "{{filename}}" /home/porta_pnmv3/PortaSync/log/PnmAckManager.log | tail -n 10',
        },
        {
          type: 'ssh',
          label: 'Verifier les fichiers .ERR recents',
          server: 'vmqproportasync01',
          template: 'find /home/porta_pnmv3/PortaSync/pnmdata/ -name "*.ERR" -mtime -3 -ls',
        },
        {
          type: 'ssh',
          label: 'Lire le contenu d\'un fichier .ERR',
          server: 'vmqproportasync01',
          template: 'cat /home/porta_pnmv3/PortaSync/pnmdata/{{op_destinataire}}/arch_send/*.ERR 2>/dev/null | head -50',
        },
        {
          type: 'ssh',
          label: 'Chercher les .tmp.ERR bloques dans recv/',
          server: 'vmqproportasync01',
          template: 'find /home/porta_pnmv3/PortaSync/pnmdata/ -name "*.tmp.ERR" -ls',
        },
        {
          type: 'ssh',
          label: 'Verifier si le fichier original est dans arch_recv/',
          server: 'vmqproportasync01',
          template: 'ls -la /home/porta_pnmv3/PortaSync/pnmdata/{{op_destinataire}}/arch_recv/ | tail -n 10',
        },
        {
          type: 'ssh',
          label: 'Supprimer le .tmp.ERR bloque (APRES verification)',
          server: 'vmqproportasync01',
          template: 'rm /home/porta_pnmv3/PortaSync/pnmdata/{{op_destinataire}}/recv/*.tmp.ERR',
        },
      ],
      expectsResult: true,
      resultPlaceholder: 'Collez ici le resultat de la commande...',
      analyzeResult: analyzeAcrSearch,
      tips: [
        'Si l\'ACR est present, l\'incident est resolu — le mail a ete envoye avant le traitement.',
        'Un fichier .ERR signifie un rejet par l\'operateur (a investiguer).',
        'Un fichier .tmp.ERR dans recv/ est un fichier BLOQUE. Verifier dans arch_recv/ si le fichier original a ete traite. Si oui → supprimer le .tmp.ERR.',
        'Dauphin Telecom (04) et UTS Caraibe (05) sont des petits operateurs avec des irregularites frequentes. Les .tmp.ERR sont recurrents chez eux.',
        'Utiliser "cat" pour lire le contenu du .ERR et connaitre le motif du rejet.',
      ],
    },
    {
      id: 'check-ticket-status',
      title: 'Verifier le ticket 1210 dans PortaDB',
      icon: 'solar:ticket-bold-duotone',
      description: 'Verifier si le ticket 1210 (reponse) a ete emis pour les MSISDN concernes.',
      commands: [
        {
          type: 'sql',
          label: 'Verifier les tickets emis pour le MSISDN',
          template: `SELECT d.code_ticket, d.msisdn, d.date_creation_ticket,
  d.operateur_origine, d.operateur_destination, d.code_motif
FROM DATA d
WHERE d.msisdn = '{{msisdn}}'
ORDER BY d.date_creation_ticket DESC
LIMIT 10;`,
        },
        {
          type: 'sql',
          label: 'Verifier l\'etat du portage',
          template: `SELECT p.msisdn, e.label AS etat, e.classe,
  DATE(p.date_portage) AS date_portage, DATE(p.date_debut) AS date_debut
FROM PORTAGE p
JOIN DOSSIER dos ON p.dossier_id = dos.id
JOIN ETAT e ON dos.etat_id_actuel = e.id
WHERE p.msisdn = '{{msisdn}}'
ORDER BY p.date_debut DESC
LIMIT 5;`,
        },
      ],
      expectsResult: true,
      resultPlaceholder: 'Collez ici le resultat de la requete SQL...',
      analyzeResult: analyzeTicketCheck,
      tips: [
        'Si le ticket 1210 est present avec une date recente, l\'incident est resolu.',
        'Si aucun 1210, verifier si le traitement de la vacation a bien eu lieu (etape suivante).',
        'Executer ces requetes sur PortaDB (vmqproportawebdb01).',
      ],
    },
    {
      id: 'evaluate-delay',
      title: 'Evaluer le delai et prioriser',
      icon: 'solar:clock-circle-bold-duotone',
      description: 'Indiquez depuis combien de temps le ticket est en attente pour determiner l\'action a mener.',
      inputs: [
        {
          key: 'delai_attente',
          label: 'Delai depuis le mail d\'incident',
          placeholder: 'Ex: 2h, 1j, 30min',
          type: 'text',
        },
      ],
      expectsResult: true,
      resultPlaceholder: 'Indiquez le delai (ex: "2h", "1j", "48h", "3j")...',
      analyzeResult: analyzeDelay,
      tips: [
        '< 4h : Normal, attendre la prochaine vacation.',
        '4h-24h : Surveiller, le traitement devrait avoir lieu.',
        '24h-72h : Relancer l\'operateur par email.',
        '> 72h : Escalader au support N2 et au GPMAG.',
      ],
    },
    {
      id: 'conclusion',
      title: 'Conclusion et action',
      icon: 'solar:check-circle-bold-duotone',
      description: 'Synthese de l\'investigation et actions a entreprendre.',
      tips: [
        'Mail "[PNM] Tickets 12XX" recu AVANT vacation → dans 90% des cas, se resout seul apres la 1ere vacation.',
        'Si ACR recu depuis → incident resolu, rien a faire.',
        'Si toujours en attente < 24h → surveiller, re-verifier apres la prochaine vacation.',
        'Si > 24h sans reponse → relancer l\'operateur donneur par email.',
        'Si > 72h → escalader au support N2 Porta + secretariat GPMAG.',
        'Toujours mettre FWI_PNM_SI@digicelgroup.fr en copie des relances.',
        'Pour Free Caraibe : le mail est envoye a ~09h, avant la vacation 1 → faux positifs frequents.',
      ],
    },
  ],
};
