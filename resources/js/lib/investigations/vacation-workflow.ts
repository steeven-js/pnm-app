import type { WorkflowDefinition, InvestigationContext, StepAnalysis } from './types';

// ─── Email parser ───────────────────────────────────────────────────────────

const OPERATOR_MAP: Record<string, string> = {
  '01': 'Orange Caraibe', '02': 'Digicel', '03': 'SFR/Only',
  '04': 'Dauphin Telecom', '05': 'UTS Caraibe', '06': 'Free Caraibe',
};

function parseVacationEmail(text: string): InvestigationContext | null {
  const ctx: InvestigationContext = {};

  // Detect vacation number
  const vacMatch = text.match(/(1ere|2eme|3eme|1ère|2ème|3ème)\s*vacation/i);
  if (vacMatch) {
    const num = vacMatch[1].toLowerCase();
    if (num.startsWith('1')) ctx.vacation_num = '1';
    else if (num.startsWith('2')) ctx.vacation_num = '2';
    else if (num.startsWith('3')) ctx.vacation_num = '3';
    ctx.vacation_label = `Vacation ${ctx.vacation_num}`;
  }

  // Extract date
  const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})/);
  if (dateMatch) ctx.date_vacation = dateMatch[1];

  // Extract PNMDATA filenames
  const filenames = [...new Set(text.match(/PNMDATA\.\d{2}\.\d{2}\.\d{14}\.\d{3}/g) ?? [])];
  if (filenames.length > 0) {
    ctx.all_filenames = filenames;
    ctx.filename = filenames[0];
  }

  // Extract operator codes mentioned
  const opCodes = [...new Set(text.match(/\b0[1-6]\b/g) ?? [])];
  ctx.operator_codes = opCodes;

  // Detect anomalies in email
  const anomalies: string[] = [];
  if (/\.ERR/i.test(text)) anomalies.push('Fichier .ERR detecte');
  if (/manquant|absent|missing/i.test(text)) anomalies.push('Fichier manquant signale');
  if (/ACR.*manquant|sans.*ACR|no.*ACR/i.test(text)) anomalies.push('ACR manquant');
  if (/erreur|error/i.test(text)) anomalies.push('Erreur mentionnee');
  if (/ecart|incoher/i.test(text)) anomalies.push('Ecart/incoherence detecte');
  if (anomalies.length > 0) ctx.anomalies = anomalies;

  // Extract MSISDN if present
  const msisdns = [...new Set(text.match(/06[0-9]{8}/g) ?? [])];
  if (msisdns.length > 0) {
    ctx.msisdn = msisdns[0];
    ctx.all_msisdns = msisdns;
  }

  // Count files mentioned per operator
  const filesByOp: Record<string, number> = {};
  filenames.forEach(f => {
    const parts = f.split('.');
    const key = `${parts[1]}->${parts[2]}`;
    filesByOp[key] = (filesByOp[key] ?? 0) + 1;
  });
  if (Object.keys(filesByOp).length > 0) {
    ctx.files_summary = Object.entries(filesByOp).map(([k, v]) => `${k}: ${v} fichier(s)`);
  }

  return Object.keys(ctx).length > 0 ? ctx : null;
}

// ─── Result analyzers ───────────────────────────────────────────────────────

function analyzeVacationFiles(output: string, ctx: InvestigationContext): StepAnalysis {
  if (!output.trim()) {
    return { status: 'warning', message: 'Aucun resultat. Verifier le chemin et la date.' };
  }

  const lines = output.split('\n').filter(l => l.trim());
  const errFiles = lines.filter(l => /\.ERR/i.test(l));
  const acrFiles = lines.filter(l => /\.ACR/i.test(l));
  const dataFiles = lines.filter(l => /PNMDATA\.\d{2}\.\d{2}/ .test(l) && !/\.ACR|\.ERR/.test(l));

  const details: string[] = [];
  details.push(`${dataFiles.length} fichier(s) PNMDATA trouves.`);
  details.push(`${acrFiles.length} acquittement(s) ACR trouves.`);

  if (errFiles.length > 0) {
    details.push(`${errFiles.length} fichier(s) .ERR detectes !`);
    return {
      status: 'error',
      message: `${errFiles.length} fichier(s) en erreur detectes.`,
      details,
      extractedValues: { err_files: errFiles.map(l => l.trim()) },
      nextStepId: 'check-err-files',
    };
  }

  // Check if we expect 5 operators (01,03,04,05,06)
  const ops = new Set<string>();
  lines.forEach(l => {
    const m = l.match(/PNMDATA\.(\d{2})\.02/);
    if (m) ops.add(m[1]);
  });

  if (ops.size < 5) {
    const missing = ['01', '03', '04', '05', '06'].filter(c => !ops.has(c));
    details.push(`Operateur(s) manquant(s) : ${missing.map(c => `${c} (${OPERATOR_MAP[c]})`).join(', ')}`);
    return {
      status: 'warning',
      message: `Fichiers recus de ${ops.size}/5 operateurs.`,
      details,
      extractedValues: { missing_operators: missing },
    };
  }

  return {
    status: 'success',
    message: 'Tous les fichiers et ACR sont presents.',
    details,
  };
}

function analyzeAckManagerLog(output: string, _ctx: InvestigationContext): StepAnalysis {
  const details: string[] = [];

  if (/Fin de Traitement/i.test(output)) {
    details.push('"Fin de Traitement" present — script termine.');
  } else {
    details.push('"Fin de Traitement" ABSENT — verifier si le script est encore en cours.');
  }

  // Check for AR non-recu
  const arNonRecu = output.match(/notification.*AR.*non[- ]?re[cç]u/gi);
  if (arNonRecu && arNonRecu.length > 0) {
    details.push(`${arNonRecu.length} notification(s) d'AR non-recu detectee(s).`);
  }

  if (/Aucune notification/i.test(output)) {
    details.push('Aucune notification d\'AR non-recu — tous les operateurs ont acquitte.');
  }

  // Check for errors
  if (/error|erreur|exception/i.test(output)) {
    return {
      status: 'error',
      message: 'Erreurs detectees dans PnmAckManager.',
      details,
    };
  }

  if (arNonRecu && arNonRecu.length > 0) {
    return {
      status: 'warning',
      message: 'Des AR sont manquants.',
      details,
    };
  }

  if (!/Fin de Traitement/i.test(output)) {
    return {
      status: 'warning',
      message: 'Le script ne semble pas termine.',
      details,
    };
  }

  return {
    status: 'success',
    message: 'PnmAckManager s\'est execute correctement.',
    details,
  };
}

function analyzeDataManagerLog(output: string, ctx: InvestigationContext): StepAnalysis {
  const details: string[] = [];

  if (/Fin de Traitement/i.test(output)) {
    details.push('"Fin de Traitement" present.');
  } else {
    details.push('"Fin de Traitement" ABSENT.');
  }

  // Check per operator
  ['01', '03', '04', '05', '06'].forEach(op => {
    const opName = OPERATOR_MAP[op] ?? op;
    const regex = new RegExp(`PNMDATA\\.02\\.${op}`, 'g');
    const matches = output.match(regex);
    if (matches) {
      details.push(`${opName} (${op}) : ${matches.length} fichier(s) genere(s).`);
    } else {
      details.push(`${opName} (${op}) : aucun fichier genere.`);
    }
  });

  if (!/Fin de Traitement/i.test(output)) {
    return {
      status: 'warning',
      message: 'La generation des fichiers ne semble pas terminee.',
      details,
    };
  }

  return {
    status: 'success',
    message: 'Fichiers generes pour tous les operateurs.',
    details,
  };
}

function analyzeErrFile(output: string, _ctx: InvestigationContext): StepAnalysis {
  if (!output.trim()) {
    return { status: 'info', message: 'Fichier vide ou introuvable.' };
  }

  const details = output.split('\n').filter(l => l.trim()).slice(0, 10).map(l => l.trim());

  return {
    status: 'error',
    message: 'Contenu du fichier .ERR recupere. Analyser le motif de rejet.',
    details,
  };
}

function analyzeBasculeLog(output: string, _ctx: InvestigationContext): StepAnalysis {
  const details: string[] = [];
  const lower = output.toLowerCase();

  if (/fin de traitement/i.test(output)) {
    details.push('"Fin de Traitement" present.');
  } else {
    details.push('"Fin de Traitement" ABSENT.');
  }

  // Check per operator
  const checkSuccess = output.match(/check success/gi);
  if (checkSuccess) {
    details.push(`${checkSuccess.length} "Check success" trouves.`);
  }

  if (/error|erreur|failed/i.test(output)) {
    return { status: 'error', message: 'Erreurs dans les logs EmaExtracter/EmmExtracter.', details };
  }

  if (!checkSuccess || checkSuccess.length < 5) {
    return { status: 'warning', message: 'Certains operateurs n\'ont pas "Check success".', details };
  }

  return { status: 'success', message: 'Bascule et valorisation OK pour tous les operateurs.', details };
}

// ─── Workflow definition ────────────────────────────────────────────────────

export const vacationWorkflow: WorkflowDefinition = {
  id: 'vacation',
  title: '[PNM] Rapport vacation',
  icon: 'solar:clock-circle-bold-duotone',
  color: '#16a34a',
  description: 'Verification d\'un rapport de vacation : fichiers echanges, ACR, logs, bascule.',
  emailSubjects: [
    '[PNM] 1ere vacation', '[PNM] 2eme vacation', '[PNM] 3eme vacation',
    '[PNM] 1ère vacation', '[PNM] 2ème vacation', '[PNM] 3ème vacation',
  ],
  parseEmail: parseVacationEmail,
  steps: [
    {
      id: 'check-generation',
      title: 'Verifier la generation des fichiers',
      icon: 'solar:file-bold-duotone',
      description: 'Verifier que PnmDataManager a genere les fichiers pour les 5 operateurs.',
      commands: [
        {
          type: 'ssh',
          label: 'Log PnmDataManager',
          server: 'vmqproportasync01',
          template: 'tail -n 30 /home/porta_pnmv3/PortaSync/log/PnmDataManager.log',
        },
      ],
      expectsResult: true,
      resultPlaceholder: 'Collez ici le log de PnmDataManager...',
      analyzeResult: analyzeDataManagerLog,
      tips: [
        'Se connecter : ssh 172.24.119.69',
        'Chercher "Fin de Traitement" et un fichier PNMDATA.02.XX pour chaque operateur (01,03,04,05,06).',
      ],
    },
    {
      id: 'check-fichiers-vacation',
      title: 'Verifier les fichiers envoyes/recus',
      icon: 'solar:folder-open-bold-duotone',
      description: 'Lister les fichiers archives pour cette vacation.',
      commands: [
        {
          type: 'ssh',
          label: 'Fichiers envoyes (arch_send) — tous operateurs',
          server: 'vmqproportasync01',
          template: 'for op in 01 03 04 05 06; do echo "=== Operateur $op ===" && ls -la /home/porta_pnmv3/PortaSync/pnmdata/$op/arch_send/ | grep "$(date +%Y%m%d)" | tail -n 6; done',
        },
        {
          type: 'ssh',
          label: 'Fichiers recus (arch_recv) — tous operateurs',
          server: 'vmqproportasync01',
          template: 'for op in 01 03 04 05 06; do echo "=== Operateur $op ===" && ls -la /home/porta_pnmv3/PortaSync/pnmdata/$op/arch_recv/ | grep "$(date +%Y%m%d)" | tail -n 6; done',
        },
        {
          type: 'ssh',
          label: 'Fichiers .ERR recents',
          server: 'vmqproportasync01',
          template: 'find /home/porta_pnmv3/PortaSync/pnmdata/ -name "*.ERR" -mtime -1 -ls',
        },
      ],
      expectsResult: true,
      resultPlaceholder: 'Collez ici le listing des fichiers...',
      analyzeResult: analyzeVacationFiles,
    },
    {
      id: 'check-ack',
      title: 'Verifier les acquittements (ACR)',
      icon: 'solar:check-read-bold-duotone',
      description: 'Verifier que tous les fichiers ont ete acquittes par les operateurs.',
      commands: [
        {
          type: 'ssh',
          label: 'Log PnmAckManager',
          server: 'vmqproportasync01',
          template: 'tail -n 40 /home/porta_pnmv3/PortaSync/log/PnmAckManager.log',
        },
      ],
      expectsResult: true,
      resultPlaceholder: 'Collez ici le log de PnmAckManager...',
      analyzeResult: analyzeAckManagerLog,
      tips: [
        'Chercher "Aucune notification d\'AR SYNC non-recu" = tout est OK.',
        'Si des AR manquent, noter les operateurs concernes.',
      ],
    },
    {
      id: 'check-err-files',
      title: 'Analyser les fichiers en erreur',
      icon: 'solar:danger-triangle-bold-duotone',
      description: 'Si des fichiers .ERR ont ete detectes, examiner leur contenu.',
      commands: [
        {
          type: 'ssh',
          label: 'Lire le contenu du fichier .ERR',
          server: 'vmqproportasync01',
          template: 'cat /home/porta_pnmv3/PortaSync/pnmdata/{{op_expediteur}}/arch_send/*.ERR 2>/dev/null | head -n 20',
        },
        {
          type: 'ssh',
          label: 'Chercher tous les .ERR du jour',
          server: 'vmqproportasync01',
          template: 'find /home/porta_pnmv3/PortaSync/pnmdata/ -name "*.ERR" -mtime -1 -exec echo "--- {} ---" \\; -exec head -n 5 {} \\;',
        },
      ],
      expectsResult: true,
      resultPlaceholder: 'Collez ici le contenu du fichier .ERR...',
      analyzeResult: analyzeErrFile,
      tips: [
        'Un fichier .ERR signifie que l\'operateur a rejete notre fichier.',
        'Le contenu du .ERR indique generalement le motif (format, sequence, horodatage...).',
      ],
    },
    {
      id: 'check-bascule',
      title: 'Verifier la bascule et valorisation',
      icon: 'solar:restart-bold-duotone',
      description: 'Verifier les logs EmaExtracter (bascule) et EmmExtracter (valorisation).',
      commands: [
        {
          type: 'ssh',
          label: 'Log EmaExtracter (bascule)',
          server: 'vmqproportasync01',
          template: 'tail -n 20 /home/porta_pnmv3/PortaSync/log/EmaExtracter.log',
        },
        {
          type: 'ssh',
          label: 'Log EmmExtracter (valorisation)',
          server: 'vmqproportasync01',
          template: 'tail -n 20 /home/porta_pnmv3/PortaSync/log/EmmExtracter.log',
        },
      ],
      expectsResult: true,
      resultPlaceholder: 'Collez ici les logs EmaExtracter/EmmExtracter...',
      analyzeResult: analyzeBasculeLog,
      tips: [
        'Verifier "Check success" pour chaque operateur.',
        '"Fin de Traitement" doit etre present dans les deux logs.',
      ],
    },
    {
      id: 'conclusion',
      title: 'Synthese de la vacation',
      icon: 'solar:check-circle-bold-duotone',
      description: 'Resume de la verification de la vacation.',
      tips: [
        'Si tout est OK : cloturer la verification.',
        'Si fichier .ERR : investiguer le motif et corriger si necessaire.',
        'Si ACR manquant : attendre la prochaine vacation puis relancer l\'operateur.',
        'Si bascule KO : escalader a l\'equipe technique.',
        'Comparer avec les vacations precedentes pour detecter des patterns.',
      ],
    },
  ],
};
