import type { WorkflowDefinition, InvestigationContext, StepAnalysis } from './types';

// ─── Operator map ───────────────────────────────────────────────────────────

const OPERATOR_MAP: Record<string, string> = {
  '01': 'Orange Caraibe', '02': 'Digicel', '03': 'SFR/Only',
  '04': 'Dauphin Telecom', '05': 'UTS Caraibe', '06': 'Free Caraibe',
};

const SMALL_OPERATORS = ['04', '05'];

// ─── Email parser ───────────────────────────────────────────────────────────

function parseSyncEmail(text: string): InvestigationContext | null {
  const ctx: InvestigationContext = {};

  // Extract PNMSYNC filenames
  const syncFiles = [...new Set(text.match(/PNMSYNC\.\d{2}\.\d{2}\.\d{14}\.\d{3}/g) ?? [])];
  if (syncFiles.length > 0) {
    ctx.filename = syncFiles[0];
    ctx.all_filenames = syncFiles;
    ctx.nb_fichiers = String(syncFiles.length);
    ctx.file_type = 'PNMSYNC';
  }

  // Also catch PNMDATA
  const dataFiles = [...new Set(text.match(/PNMDATA\.\d{2}\.\d{2}\.\d{14}\.\d{3}/g) ?? [])];
  if (dataFiles.length > 0 && !ctx.filename) {
    ctx.filename = dataFiles[0];
    ctx.all_filenames = dataFiles;
    ctx.nb_fichiers = String(dataFiles.length);
    ctx.file_type = 'PNMDATA';
  }

  // Extract operator codes from filename
  if (ctx.filename) {
    const parts = (ctx.filename as string).split('.');
    ctx.op_expediteur = parts[1];
    ctx.op_destinataire = parts[2];
    ctx.op_expediteur_name = OPERATOR_MAP[parts[1]] ?? parts[1];
    ctx.op_destinataire_name = OPERATOR_MAP[parts[2]] ?? parts[2];
    ctx.is_small_operator = SMALL_OPERATORS.includes(parts[2]) ? 'oui' : 'non';
  }

  // Extract error ticket [0000, 02, 04, timestamp, Exxx, ...]
  const errTicket = text.match(/\[\s*\d{4}\s*,\s*(\d{2})\s*,\s*(\d{2})\s*,\s*\d{14}\s*,\s*(E\d{3})/);
  if (errTicket) {
    ctx.op_expediteur = errTicket[1];
    ctx.op_destinataire = errTicket[2];
    ctx.op_expediteur_name = OPERATOR_MAP[errTicket[1]] ?? errTicket[1];
    ctx.op_destinataire_name = OPERATOR_MAP[errTicket[2]] ?? errTicket[2];
    ctx.error_code = errTicket[3];
    ctx.is_small_operator = SMALL_OPERATORS.includes(errTicket[2]) ? 'oui' : 'non';
  }

  // Extract delay
  const delayMatch = text.match(/depuis\s+plus\s+de\s+(\d+)\s*minutes/i);
  if (delayMatch) ctx.delay_minutes = delayMatch[1];

  // Extract MSISDN (rare in SYNC incidents but possible)
  const msisdns = [...new Set(text.match(/06[0-9]{8}/g) ?? [])];
  if (msisdns.length > 0) {
    ctx.msisdn = msisdns[0];
    ctx.all_msisdns = msisdns;
  }

  ctx.incident_type = 'sync_ar_non_recu';

  return Object.keys(ctx).length > 0 ? ctx : null;
}

// ─── Result analyzers ───────────────────────────────────────────────────────

function analyzeSyncParse(output: string, ctx: InvestigationContext): StepAnalysis {
  if (!output.trim()) {
    return { status: 'warning', message: 'Aucun contenu colle.' };
  }

  const syncFiles = [...new Set(output.match(/PNMSYNC\.\d{2}\.\d{2}\.\d{14}\.\d{3}/g) ?? [])];
  const dataFiles = [...new Set(output.match(/PNMDATA\.\d{2}\.\d{2}\.\d{14}\.\d{3}/g) ?? [])];
  const allFiles = [...syncFiles, ...dataFiles];
  const errTicket = output.match(/\[\s*\d{4}\s*,\s*(\d{2})\s*,\s*(\d{2})\s*,\s*\d{14}\s*,\s*(E\d{3})/);
  const hasArNonRecu = /AR\s*non.recu|non.acquit|envoye\s+depuis/i.test(output);

  const details: string[] = [];
  const extractedValues: Record<string, string | string[]> = {};

  if (allFiles.length > 0) {
    details.push(`${syncFiles.length} PNMSYNC + ${dataFiles.length} PNMDATA detecte(s).`);
    extractedValues.filename = allFiles[0];
    extractedValues.all_filenames = allFiles;

    const parts = allFiles[0].split('.');
    extractedValues.op_expediteur = parts[1];
    extractedValues.op_destinataire = parts[2];
    extractedValues.op_expediteur_name = OPERATOR_MAP[parts[1]] ?? parts[1];
    extractedValues.op_destinataire_name = OPERATOR_MAP[parts[2]] ?? parts[2];
    extractedValues.is_small_operator = SMALL_OPERATORS.includes(parts[2]) ? 'oui' : 'non';

    if (SMALL_OPERATORS.includes(parts[2])) {
      details.push(`Operateur ${OPERATOR_MAP[parts[2]]} (${parts[2]}) = petit operateur avec irregularites frequentes.`);
    }
  }

  if (errTicket) {
    details.push(`Ticket d'erreur : ${OPERATOR_MAP[errTicket[1]] ?? errTicket[1]} → ${OPERATOR_MAP[errTicket[2]] ?? errTicket[2]}, code ${errTicket[3]}.`);
    extractedValues.error_code = errTicket[3];
  }

  if (hasArNonRecu) {
    details.push('Type : AR non-recu (fichier SYNC non acquitte par l\'operateur).');
  }

  if (allFiles.length === 0 && !errTicket && !hasArNonRecu) {
    return { status: 'warning', message: 'Aucun fichier PNMSYNC/PNMDATA ni ticket d\'erreur detecte.' };
  }

  return {
    status: 'info',
    message: `Incident SYNC identifie. ${allFiles.length} fichier(s) concerne(s).`,
    details,
    extractedValues,
  };
}

function analyzeTmpErr(output: string, ctx: InvestigationContext): StepAnalysis {
  if (!output.trim()) {
    return { status: 'info', message: 'Aucune sortie. Executez les commandes ci-dessus.' };
  }

  const hasTmpErr = /\.tmp\.ERR/i.test(output);
  const hasAcr = /\.ACR/i.test(output);
  const isDauphinOrUts = ctx.is_small_operator === 'oui' || /\/04\/|\/05\//i.test(output);

  // Case 1: .tmp.ERR found
  if (hasTmpErr) {
    const tmpFiles = [...new Set(output.match(/[\w./]+\.tmp\.ERR/g) ?? [])];
    const details: string[] = [
      `${tmpFiles.length} fichier(s) .tmp.ERR detecte(s) dans recv/.`,
      '',
      'PROCEDURE :',
      '1. Verifier dans arch_recv/ si le fichier original a ete traite',
      '2. Si present dans arch_recv/ → le .tmp.ERR est un residu',
      '3. Lire le contenu du .tmp.ERR avec "cat" pour comprendre l\'erreur',
      '4. Supprimer le .tmp.ERR avec la commande "rm"',
    ];

    if (isDauphinOrUts) {
      details.push('');
      details.push('NOTE : Dauphin (04) et UTS (05) sont des petits operateurs avec des irregularites frequentes.');
      details.push('Les .tmp.ERR sont recurrents chez eux — la suppression apres verification est la procedure standard.');
    }

    return {
      status: 'warning',
      message: 'Fichier(s) .tmp.ERR bloque(s) detecte(s). Verification et suppression necessaires.',
      details,
      extractedValues: { has_tmp_err: 'oui' },
    };
  }

  // Case 2: ACR found, no .tmp.ERR
  if (hasAcr) {
    return {
      status: 'success',
      message: 'ACR recu, pas de .tmp.ERR. L\'incident est resolu.',
      details: [
        'L\'acquittement a ete recu depuis l\'envoi du mail.',
        'Aucun fichier bloque en recv/.',
        'Rien a faire — l\'incident s\'est resolu naturellement.',
      ],
    };
  }

  // Case 3: Nothing found
  const hasErr = /\.ERR/i.test(output) && !hasTmpErr;
  if (hasErr) {
    // Parse ERR content
    const details: string[] = ['Fichier .ERR detecte (pas .tmp.ERR).'];
    if (/E000/i.test(output)) details.push('Code E000 : Acquittement OK.');
    else if (/E008/i.test(output)) details.push('Code E008 : Fichier deja recu (doublon). Pas d\'action.');
    else if (/E010/i.test(output)) details.push('Code E010 : Erreur dans le fichier SYNC.');
    else if (/E011/i.test(output)) details.push('Code E011 : AR non-recu apres delai.');
    else details.push('Verifier le code erreur dans le contenu du .ERR.');

    return {
      status: /E000/.test(output) ? 'success' : 'warning',
      message: /E000/.test(output) ? 'Acquittement OK (E000).' : 'Fichier .ERR detecte — verifier le code erreur.',
      details,
    };
  }

  return {
    status: 'info',
    message: 'Pas de .tmp.ERR ni .ERR detecte. Verifier manuellement.',
  };
}

function analyzeArchRecv(output: string, ctx: InvestigationContext): StepAnalysis {
  if (!output.trim()) {
    return { status: 'info', message: 'Executez la commande pour verifier arch_recv/.' };
  }

  const filename = ctx.filename as string | undefined;
  const baseName = filename?.replace(/\.tmp\.ERR$/, '').replace(/\.ERR$/, '').replace(/\.ACR$/, '') ?? '';

  // Check if the base filename appears in arch_recv
  const hasOriginal = baseName && output.includes(baseName.split('.').slice(0, 5).join('.'));

  if (hasOriginal) {
    return {
      status: 'success',
      message: 'Le fichier original est present dans arch_recv/. Le .tmp.ERR peut etre supprime.',
      details: [
        'Le fichier a ete traite avec succes et archive.',
        'Le .tmp.ERR dans recv/ est un residu qui bloque le systeme.',
        'Action : supprimer le .tmp.ERR avec la commande "rm" ci-dessus.',
      ],
    };
  }

  return {
    status: 'warning',
    message: 'Le fichier original n\'a pas ete trouve dans arch_recv/. Investiguer avant de supprimer.',
    details: [
      'Le fichier n\'apparait pas dans les archives.',
      'Ne PAS supprimer le .tmp.ERR tant que la situation n\'est pas clarifiee.',
      'Verifier les logs PnmAckManager pour plus de details.',
    ],
  };
}

// ─── Workflow definition ────────────────────────────────────────────────────

export const syncWorkflow: WorkflowDefinition = {
  id: 'sync-incident',
  title: '[PNM] SYNC / .tmp.ERR (Dauphin, UTS...)',
  icon: 'solar:refresh-circle-bold-duotone',
  color: '#8b5cf6',
  description: 'Investigation des fichiers PNMSYNC non acquittes et .tmp.ERR bloques. Procedure directe pour Dauphin Telecom, UTS et autres petits operateurs.',
  emailSubjects: ['PNMSYNC', 'AR non-recu', '.tmp.ERR', 'non acquite'],
  parseEmail: parseSyncEmail,
  steps: [
    {
      id: 'parse-sync',
      title: 'Identifier l\'incident SYNC',
      icon: 'solar:letter-opened-bold-duotone',
      description: 'Collez le contenu du mail d\'incident pour identifier le fichier SYNC et l\'operateur concerne.',
      expectsResult: true,
      resultPlaceholder: 'Collez ici le contenu du mail d\'incident...\n\nExemple :\n3 - Le fichier PNMSYNC.02.04.20260322231627.001 n\'a pas ete acquite par 04 (Dauphin Telecom)\n[0000, 02, 04, 20260323100212, E011, 000001, AR non-recu : PNMSYNC.02.04.20260322231627.001 envoye depuis plus de 60 minutes]',
      analyzeResult: analyzeSyncParse,
      tips: [
        'Les incidents PNMSYNC concernent les fichiers de synchronisation (pas les fichiers de vacation PNMDATA).',
        'Dauphin Telecom (04) et UTS Caraibe (05) sont des petits operateurs avec des irregularites frequentes.',
        'Ce type d\'incident est souvent recurrent et se resout par suppression du .tmp.ERR.',
      ],
    },
    {
      id: 'check-tmp-err',
      title: 'Chercher les .tmp.ERR et verifier',
      icon: 'solar:danger-triangle-bold-duotone',
      description: 'Verifier si un .tmp.ERR est bloque dans recv/ et si le fichier original a ete traite.',
      commands: [
        {
          type: 'ssh',
          label: 'Lister les .tmp.ERR bloques sur le serveur',
          server: 'vmqproportasync01',
          template: 'find /home/porta_pnmv3/PortaSync/pnmdata/ -name "*.tmp.ERR" -ls',
        },
        {
          type: 'ssh',
          label: 'Verifier le fichier dans les logs PnmAckManager',
          server: 'vmqproportasync01',
          template: 'grep "{{filename}}" /home/porta_pnmv3/PortaSync/log/PnmAckManager.log | tail -n 10',
        },
        {
          type: 'ssh',
          label: 'Lire le contenu du .tmp.ERR',
          server: 'vmqproportasync01',
          template: 'cat /home/porta_pnmv3/PortaSync/pnmdata/{{op_destinataire}}/recv/*.tmp.ERR 2>/dev/null',
        },
      ],
      expectsResult: true,
      resultPlaceholder: 'Collez ici le resultat des commandes...',
      analyzeResult: analyzeTmpErr,
      tips: [
        'Un .tmp.ERR dans recv/ bloque le traitement des prochains fichiers de cet operateur.',
        'Il faut verifier que le fichier original a bien ete traite avant de supprimer.',
        'Utiliser FileZilla (sftp://172.24.119.69) pour naviguer visuellement si besoin.',
      ],
    },
    {
      id: 'verify-arch',
      title: 'Confirmer dans arch_recv/',
      icon: 'solar:folder-check-bold-duotone',
      description: 'Verifier que le fichier original a bien ete archive dans arch_recv/ avant de supprimer le .tmp.ERR.',
      commands: [
        {
          type: 'ssh',
          label: 'Lister les fichiers recents dans arch_recv/',
          server: 'vmqproportasync01',
          template: 'ls -la /home/porta_pnmv3/PortaSync/pnmdata/{{op_destinataire}}/arch_recv/ | tail -n 15',
        },
        {
          type: 'ssh',
          label: 'Chercher le fichier specifique dans arch_recv/',
          server: 'vmqproportasync01',
          template: 'ls -la /home/porta_pnmv3/PortaSync/pnmdata/{{op_destinataire}}/arch_recv/ | grep "{{filename}}"',
        },
      ],
      expectsResult: true,
      resultPlaceholder: 'Collez ici le resultat de ls arch_recv/...',
      analyzeResult: analyzeArchRecv,
      tips: [
        'Si le fichier apparait dans arch_recv/, il a ete traite → le .tmp.ERR peut etre supprime.',
        'Si le fichier N\'apparait PAS, ne pas supprimer le .tmp.ERR et investiguer davantage.',
      ],
    },
    {
      id: 'cleanup',
      title: 'Supprimer le .tmp.ERR',
      icon: 'solar:trash-bin-minimalistic-bold-duotone',
      description: 'Apres confirmation que le fichier est dans arch_recv/, supprimer le .tmp.ERR bloque.',
      commands: [
        {
          type: 'ssh',
          label: 'Supprimer le .tmp.ERR (operateur concerne)',
          server: 'vmqproportasync01',
          template: 'rm /home/porta_pnmv3/PortaSync/pnmdata/{{op_destinataire}}/recv/*.tmp.ERR',
        },
        {
          type: 'ssh',
          label: 'Verifier qu\'il n\'y a plus de .tmp.ERR',
          server: 'vmqproportasync01',
          template: 'find /home/porta_pnmv3/PortaSync/pnmdata/{{op_destinataire}}/recv/ -name "*.tmp.ERR" -ls',
        },
      ],
      tips: [
        'ATTENTION : ne supprimer que si l\'etape precedente a confirme la presence dans arch_recv/.',
        'Apres suppression, le prochain traitement SYNC devrait fonctionner normalement.',
        'Si le probleme se reproduit le lendemain, c\'est un comportement recurrent de l\'operateur.',
      ],
    },
    {
      id: 'conclusion',
      title: 'Conclusion',
      icon: 'solar:check-circle-bold-duotone',
      description: 'Synthese et suivi.',
      tips: [
        'Incident SYNC .tmp.ERR resolu par suppression apres verification.',
        'Ce type d\'incident est RECURRENT pour Dauphin Telecom (04) et UTS Caraibe (05).',
        'Pas besoin d\'escalader sauf si le probleme bloque les vacations pendant > 24h.',
        'Si le .tmp.ERR revient chaque jour pour le meme operateur, signaler a l\'equipe PNM_SI.',
        'Outils : SSH vmqproportasync01 (172.24.119.69) / FileZilla (sftp://172.24.119.69).',
      ],
    },
  ],
};
