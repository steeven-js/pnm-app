// ---------------------------------------------------------------------------
// Parsers for monitoring auto-fill (all PNM event types)
// ---------------------------------------------------------------------------

import { parseIncidentEmail, type ParsedIncidentEmail } from 'src/lib/pnm-utils';

export type AutoFillResult = {
    checkedItems: string[];
    notes: string;
    parsedData?: unknown;
};

// ---------------------------------------------------------------------------
// Unified entry point — detects format and dispatches
// ---------------------------------------------------------------------------

export function autoFillFromPaste(
    eventKey: string,
    checklist: string[],
    content: string,
): AutoFillResult | null {
    const parser = PARSERS[eventKey] ?? (eventKey.startsWith('vacation_') ? autoFillVacation : null);
    if (!parser) return null;
    return parser(eventKey, checklist, content);
}

type ParserFn = (eventKey: string, checklist: string[], content: string) => AutoFillResult | null;

const PARSERS: Record<string, ParserFn> = {
    verif_bascule_server: autoFillVerifBascule,
    verif_bascule_email: autoFillVerifBasculeEmail,
    vacation_1: autoFillVacation,
    vacation_2: autoFillVacation,
    vacation_3: autoFillVacation,
    incidents: autoFillIncidents,
    rio_reporting: autoFillRio,
    pso_jour: autoFillPso,
    porta_prevues: autoFillPortaPrevues,
    verif_generation_pnmdata: autoFillVerifGeneration,
    verif_acquittements: autoFillVerifAcquittements,
    tickets_attente: autoFillTickets,
};

export const SUPPORTED_EVENT_KEYS = Object.keys(PARSERS);

// ===================================================================
// 1.  Vacation report parser
// ===================================================================

const OPERATORS = [
    { code: '01', name: 'Orange Caraïbe', pattern: /Orange Cara[iï]be/i },
    { code: '03', name: 'SFR Caraïbe', pattern: /SFR?C? Cara[iï]be/i },
    { code: '04', name: 'Dauphin Télécom', pattern: /Dauphin T[eé]l[eé]com/i },
    { code: '05', name: 'UTS', pattern: /\bUTS\b/i },
    { code: '06', name: 'FREEC', pattern: /\bFREEC\b/i },
];

type VacationReport = {
    filesExchanged: number;
    filesExpected: number;
    operatorSections: {
        code: string;
        name: string;
        hasReceivedFiles: boolean;
        hasReceivedAcr: boolean;
    }[];
    hasErrFiles: boolean;
};

function parseVacationReport(content: string): VacationReport | null {
    const countMatch = content.match(
        /(\d+)\s*fichiers?\s*[eé]chang[eé]s?\s*\/\s*(\d+)\s*attendus?/i,
    );
    if (!countMatch) return null;

    const filesExchanged = parseInt(countMatch[1], 10);
    const filesExpected = parseInt(countMatch[2], 10);

    const operatorSections = OPERATORS.map((op) => {
        const receivedPattern = new RegExp(
            `Fichiers re[cç]us d[e']\\s*${op.pattern.source}[\\s\\S]*?(?=Fichiers |Cordialement|$)`,
            'i',
        );
        const receivedMatch = content.match(receivedPattern);

        const hasReceivedFiles = !!receivedMatch && /PNMDATA\.\d{2}\.\d{2}\./.test(receivedMatch[0]);
        const hasReceivedAcr = !!receivedMatch && /\.ACR\b/.test(receivedMatch[0]);

        return {
            code: op.code,
            name: op.name,
            hasReceivedFiles,
            hasReceivedAcr,
        };
    });

    const hasErrFiles = /\.ERR\b/i.test(content);

    return { filesExchanged, filesExpected, operatorSections, hasErrFiles };
}

function autoFillVacation(
    _eventKey: string,
    checklist: string[],
    content: string,
): AutoFillResult | null {
    const report = parseVacationReport(content);
    if (!report) return null;

    const allFilesOk = report.filesExchanged === report.filesExpected;

    const rules: Record<string, () => boolean> = {
        'Email porta_pnmv3 vacation reçu': () => true,
        'Email porta_pnmv3 2ème vacation reçu': () => true,
        'Email porta_pnmv3 3ème vacation reçu': () => true,
        'Fichiers échangés = fichiers attendus': () => allFilesOk,
        'Aucun fichier .ERR détecté': () => !report.hasErrFiles,
        'Vérifier ACR pour tous les opérateurs': () =>
            report.operatorSections.every((op) => op.hasReceivedAcr),
        'Rapport envoi/réception du jour vérifié': () => true,
    };

    for (const op of report.operatorSections) {
        const key = `Opérateur ${op.code} (${op.name}) : fichier reçu + ACR OK`;
        rules[key] = () => op.hasReceivedFiles && op.hasReceivedAcr;
    }

    const checkedItems = checklist.filter((item) => rules[item]?.());

    const lines = [`[Auto] Rapport vacation`];
    lines.push(`Fichiers: ${report.filesExchanged}/${report.filesExpected} échangés`);
    for (const op of report.operatorSections) {
        const status = op.hasReceivedFiles
            ? op.hasReceivedAcr
                ? 'OK (fichier + ACR)'
                : 'fichier reçu, ACR manquant'
            : 'aucun fichier';
        lines.push(`  ${op.code} ${op.name}: ${status}`);
    }
    if (report.hasErrFiles) lines.push('⚠ Fichier(s) .ERR détecté(s) !');

    return { checkedItems, notes: lines.join('\n') };
}

// ===================================================================
// 3.  CTO Rattrapage parser
// ===================================================================

function autoFillCto(
    _eventKey: string,
    checklist: string[],
    content: string,
): AutoFillResult | null {
    // Match "Volumetrie des CTO du jour : 61"
    const volMatch = content.match(/Volumetrie des CTO du jour\s*:\s*(\d+)/i);
    // Match "Fin de traitement de l'automate bascule : 02:00"
    const finMatch = content.match(/Fin de traitement de l['']automate bascule\s*:\s*([\d:]+)/i);

    if (!volMatch && !finMatch) return null;

    const volume = volMatch ? parseInt(volMatch[1], 10) : null;
    const finTraitement = finMatch ? finMatch[1] : null;
    const hasCtoCsv = /Rattrapage_CTO/i.test(content);

    const rules: Record<string, () => boolean> = {
        'Email CTO rattrapage reçu': () => true,
        'Lire fichiers Rattrapage_CTO_MQ.txt, _GF.txt, _GP.txt': () => hasCtoCsv,
        'Vérifier si des MSISDN nécessitent rattrapage': () => volume !== null && volume > 0,
    };

    const checkedItems = checklist.filter((item) => rules[item]?.());

    const lines = ['[Auto] CTO Bascule rattrapage'];
    if (volume !== null) lines.push(`Volumétrie CTO du jour: ${volume}`);
    if (finTraitement) lines.push(`Fin de traitement automate bascule: ${finTraitement}`);

    return { checkedItems, notes: lines.join('\n') };
}

// ===================================================================
// 4.  Incidents PNM parser
// ===================================================================

function autoFillIncidents(
    _eventKey: string,
    checklist: string[],
    content: string,
): AutoFillResult | null {
    const isIncidentMail = /DIGICEL\.PORTA-V3/i.test(content) || /incidents?\s+(ont\s+ete|a\s+ete)\s+detect/i.test(content);
    if (!isIncidentMail) return null;

    // Use the rich parser for structured data
    const parsed = parseIncidentEmail(content);
    const { summary } = parsed;

    const arNonRecu = summary.arNonRecu > 0;
    const nonAcquitte = summary.fileNotAck > 0;
    const conflitsOuvert = /conflit\s*\[OUVERT\]/i.test(content);

    const rules: Record<string, () => boolean> = {
        "Email [PNM][INCIDENT] reçu (ou aucun = pas d'incident)": () => true,
        'Refus 1210/1220 : lire motifs, traiter ou informer commercial': () => summary.refusals === 0,
        'Erreurs 7000 : vérifier données dossier': () => summary.fileErrors === 0,
        'AR non-reçus > 60 min : contacter opérateur': () => !arNonRecu,
        'Fichiers non acquittés : signaler si récurrent': () => !nonAcquitte,
        'Conflits [OUVERT] : investiguer si récent (< 7j)': () => !conflitsOuvert,
    };

    const checkedItems = checklist.filter((item) => rules[item]?.());

    // Build text notes (kept for backwards compat)
    const lines = ['[Auto] Incidents PNM détectés'];
    lines.push(`Total incidents: ${parsed.totalCount}`);
    if (summary.refusals > 0) {
        lines.push(`\nRefus 1210/1220: ${summary.refusals} détecté(s)`);
    } else {
        lines.push('Refus 1210/1220: aucun');
    }
    if (summary.fileErrors > 0) {
        lines.push(`Erreurs 7000: ${summary.fileErrors} détectée(s)`);
    } else {
        lines.push('Erreurs 7000: aucune');
    }
    if (arNonRecu) lines.push('\n⚠ AR non-reçu(s) > 60 min détecté(s)');
    if (nonAcquitte) lines.push('⚠ Fichier(s) non acquitté(s)');
    if (conflitsOuvert) lines.push('⚠ Conflit(s) [OUVERT] détecté(s)');
    if (parsed.operatorsInvolved.length > 0) {
        lines.push(`\nOpérateurs: ${parsed.operatorsInvolved.join(', ')}`);
    }
    if (parsed.msisdnsConcerned.length > 0) {
        lines.push(`MSISDN: ${parsed.msisdnsConcerned.join(', ')}`);
    }

    return { checkedItems, notes: lines.join('\n'), parsedData: parsed };
}

// ===================================================================
// 5.  RIO Reporting parser
// ===================================================================

function autoFillRio(
    _eventKey: string,
    checklist: string[],
    content: string,
): AutoFillResult | null {
    // Match "Il y a X cas de refus en porta entrante"
    const entranteMatch = content.match(/(\d+)\s*cas de refus en porta entrante/i);
    // Match "Il y a X cas de refus en porta sortante"
    const sortanteMatch = content.match(/(\d+)\s*cas de refus en porta sortante/i);

    if (!entranteMatch && !sortanteMatch) return null;

    const refusEntrante = entranteMatch ? parseInt(entranteMatch[1], 10) : null;
    const refusSortante = sortanteMatch ? parseInt(sortanteMatch[1], 10) : null;
    const totalRefus = (refusEntrante ?? 0) + (refusSortante ?? 0);

    const rules: Record<string, () => boolean> = {
        'Email reporting RIO reçu': () => true,
        'Nombre de refus entrante (RIO incorrect)': () => true,
        'Nombre de refus sortante': () => true,
        'Vérifier chaque RIO via Verify/RIO Validator': () => totalRefus === 0,
        'Relancer avec RIO corrigé ou contacter client': () => totalRefus === 0,
    };

    const checkedItems = checklist.filter((item) => rules[item]?.());

    const lines = ['[Auto] Reporting RIO incorrect'];
    lines.push(`Refus entrante: ${refusEntrante ?? '?'}`);
    lines.push(`Refus sortante: ${refusSortante ?? '?'}`);
    if (totalRefus === 0) {
        lines.push('Aucun refus RIO incorrect - RAS');
    } else {
        lines.push(`⚠ ${totalRefus} refus RIO à traiter`);
    }

    return { checkedItems, notes: lines.join('\n') };
}

// ===================================================================
// 6.  PSO du jour parser
// ===================================================================

function autoFillPso(
    _eventKey: string,
    checklist: string[],
    content: string,
): AutoFillResult | null {
    // Detect PSO email body or CSV content
    const isEmail = /PSO du jour/i.test(content) || /ci-joint le detail des PSO/i.test(content);
    const isCsv = /RECORD_NO.*ACTION_COD/i.test(content) || /[;\s]RL[PW]S?[;\s]/i.test(content);

    if (!isEmail && !isCsv) return null;

    let rowCount: number | null = null;
    let rlpsCount = 0;
    let rlwCount = 0;
    if (isCsv) {
        // Count data rows (lines containing RLPS or RLW — separated by ; or spaces)
        const dataLines = content.split('\n').filter((l) => /\bRLPS\b|\bRLW\b/i.test(l));
        rowCount = dataLines.length;
        rlpsCount = dataLines.filter((l) => /\bRLPS\b/i.test(l)).length;
        rlwCount = dataLines.filter((l) => /\bRLW\b/i.test(l)).length;
    }

    const rules: Record<string, () => boolean> = {
        'Email [PNMV3] PSO du jour reçu': () => true,
        'Ouvrir fichier Pnm_PSO_MOBI CSV': () => isCsv,
    };

    const checkedItems = checklist.filter((item) => rules[item]?.());

    const lines = ['[Auto] PSO du jour'];
    if (isEmail && !isCsv) {
        lines.push('Email PSO reçu - fichier CSV à ouvrir');
    }
    if (rowCount !== null) {
        lines.push(`Volumétrie PSO: ${rowCount} lignes (GPMAG: ${rlpsCount}, WIZZEE: ${rlwCount})`);
    }

    return { checkedItems, notes: lines.join('\n') };
}

// ===================================================================
// 6b. Portabilités prévues DIGICEL/WIZZEE parser
// ===================================================================

function autoFillPortaPrevues(
    _eventKey: string,
    checklist: string[],
    content: string,
): AutoFillResult | null {
    // Detect the reporting email
    const isEmail = /portabilit[eé]s\s*(internes|pr[eé]vues)/i.test(content)
        || /DIGICEL.*\nIN:/i.test(content)
        || /WIZZEE.*\nIN:/i.test(content);

    if (!isEmail) return null;

    // Extract portabilités internes veille
    const internesMatch = content.match(/portabilit[eé]s\s*internes\s*(?:de\s*la\s*veille)?\s*:?\s*(\d+)/i);
    const internes = internesMatch ? parseInt(internesMatch[1], 10) : null;

    // Extract DIGICEL IN/OUT
    const digicelBlock = content.match(/DIGICEL[\s\S]*?IN\s*:\s*(\d+)[\s\S]*?OUT\s*:\s*(\d+)/i);
    const digicelIn = digicelBlock ? parseInt(digicelBlock[1], 10) : null;
    const digicelOut = digicelBlock ? parseInt(digicelBlock[2], 10) : null;

    // Extract WIZZEE IN/OUT
    const wizzeeBlock = content.match(/WIZZEE[\s\S]*?IN\s*:\s*(\d+)[\s\S]*?OUT\s*:\s*(\d+)/i);
    const wizzeeIn = wizzeeBlock ? parseInt(wizzeeBlock[1], 10) : null;
    const wizzeeOut = wizzeeBlock ? parseInt(wizzeeBlock[2], 10) : null;

    const totalIn = (digicelIn ?? 0) + (wizzeeIn ?? 0);
    const totalOut = (digicelOut ?? 0) + (wizzeeOut ?? 0);

    const rules: Record<string, () => boolean> = {
        'Email portabilités prévues reçu': () => true,
        'Vérifier IN/OUT DIGICEL': () => digicelIn !== null,
        'Vérifier IN/OUT WIZZEE': () => wizzeeIn !== null,
        'Vérifier portabilités internes veille': () => internes !== null,
        'Comparer volumétrie avec PSO du matin': () => false, // manual
    };

    const checkedItems = checklist.filter((item) => rules[item]?.());

    const lines = ['[Auto] Portabilités prévues'];
    if (internes !== null) lines.push(`Portabilités internes veille: ${internes}`);
    if (digicelIn !== null && digicelOut !== null) lines.push(`DIGICEL — IN: ${digicelIn} / OUT: ${digicelOut}`);
    if (wizzeeIn !== null && wizzeeOut !== null) lines.push(`WIZZEE — IN: ${wizzeeIn} / OUT: ${wizzeeOut}`);
    if (totalIn > 0 || totalOut > 0) lines.push(`TOTAL — IN: ${totalIn} / OUT: ${totalOut}`);

    return { checkedItems, notes: lines.join('\n') };
}

// ===================================================================
// 7.  Tickets en attente parser
// ===================================================================

function autoFillTickets(
    _eventKey: string,
    checklist: string[],
    content: string,
): AutoFillResult | null {
    // Match "Il y a X ticket(s) 1210 en attente"
    const tickets1210Match = content.match(/(\d+)\s*ticket\(s\)\s*1210\s*en attente/i);
    // Match "Il y a X ticket(s) en attente" (general)
    const ticketsGenMatch = content.match(/(\d+)\s*ticket\(s\)\s*en attente/i);

    if (!tickets1210Match && !ticketsGenMatch) return null;

    const tickets1210 = tickets1210Match ? parseInt(tickets1210Match[1], 10) : null;
    // General match might also catch the 1210 match, so check for the non-1210 one
    const ticketsGen = ticketsGenMatch && !tickets1210Match ? parseInt(ticketsGenMatch[1], 10) : null;

    // If both emails are pasted together
    const has1210 = tickets1210 !== null;
    const hasGen = ticketsGen !== null || (ticketsGenMatch && tickets1210Match);

    const rules: Record<string, () => boolean> = {
        'Email tickets 1210 reçu': () => has1210,
        'Email tickets en attente reçu': () => !!hasGen,
    };

    const checkedItems = checklist.filter((item) => rules[item]?.());

    const lines = ['[Auto] Tickets en attente'];
    if (tickets1210 !== null) lines.push(`Tickets 1210 DT: ${tickets1210} en attente`);
    if (ticketsGen !== null) lines.push(`Tickets généraux: ${ticketsGen} en attente`);
    // If user pasted both mails
    if (tickets1210 !== null && ticketsGenMatch && !ticketsGen) {
        const genCount = parseInt(ticketsGenMatch[1], 10);
        if (genCount !== tickets1210) {
            lines.push(`Tickets généraux: ${genCount} en attente`);
        }
    }

    return { checkedItems, notes: lines.join('\n') };
}

// ===================================================================
// 8.  Prévision portabilités parser
// ===================================================================

function autoFillPrevisions(
    _eventKey: string,
    checklist: string[],
    content: string,
): AutoFillResult | null {
    // Match "Nombre de portabilites internes de la veille: 9"
    const internesMatch = content.match(/portabilit[eé]s?\s*internes?\s*(?:de la veille)?\s*:\s*(\d+)/i);
    // Match DIGICEL IN/OUT and WIZZEE IN/OUT
    const digicelInMatch = content.match(/DIGICEL[\s\S]*?IN\s*:\s*(\d+)/i);
    const digicelOutMatch = content.match(/DIGICEL[\s\S]*?OUT\s*:\s*(\d+)/i);
    const wizzeeInMatch = content.match(/WIZZEE[\s\S]*?IN\s*:\s*(\d+)/i);
    const wizzeeOutMatch = content.match(/WIZZEE[\s\S]*?OUT\s*:\s*(\d+)/i);

    const hasAnyData = internesMatch || digicelInMatch || wizzeeInMatch;
    if (!hasAnyData) return null;

    const internes = internesMatch ? parseInt(internesMatch[1], 10) : null;
    const digicelIn = digicelInMatch ? parseInt(digicelInMatch[1], 10) : null;
    const digicelOut = digicelOutMatch ? parseInt(digicelOutMatch[1], 10) : null;
    const wizzeeIn = wizzeeInMatch ? parseInt(wizzeeInMatch[1], 10) : null;
    const wizzeeOut = wizzeeOutMatch ? parseInt(wizzeeOutMatch[1], 10) : null;

    const totalIn = (digicelIn ?? 0) + (wizzeeIn ?? 0);
    const totalOut = (digicelOut ?? 0) + (wizzeeOut ?? 0);

    const rules: Record<string, () => boolean> = {
        'Email prévision portabilités reçu': () => true,
        'Nombre portabilités IN prévues': () => digicelIn !== null || wizzeeIn !== null,
        'Nombre portabilités OUT prévues': () => digicelOut !== null || wizzeeOut !== null,
        'Vérifier portabilités internes veille': () => internes !== null,
    };

    const checkedItems = checklist.filter((item) => rules[item]?.());

    const lines = ['[Auto] Prévision portabilités'];
    if (internes !== null) lines.push(`Portabilités internes veille: ${internes}`);
    lines.push('');
    lines.push('Portabilités prévues:');
    if (digicelIn !== null || digicelOut !== null) {
        lines.push(`  DIGICEL  IN: ${digicelIn ?? '?'}  OUT: ${digicelOut ?? '?'}`);
    }
    if (wizzeeIn !== null || wizzeeOut !== null) {
        lines.push(`  WIZZEE   IN: ${wizzeeIn ?? '?'}  OUT: ${wizzeeOut ?? '?'}`);
    }
    lines.push(`  Total    IN: ${totalIn}  OUT: ${totalOut}`);

    return { checkedItems, notes: lines.join('\n') };
}

// ===================================================================
// 9.  Vérif bascule & valorisation (EmaExtracter.log + EmmExtracter.log)
// ===================================================================

const VERIF_OPERATORS = [
    'Orange Caraibe',
    'Digicel AFG',
    'Outremer Telecom',
    'Dauphin Telecom',
    'UTS Caraibe',
    'Free Caraibes',
] as const;

/** Map operator log names to checklist label suffixes */
const OP_CHECKLIST_LABELS: Record<string, string> = {
    'Orange Caraibe': 'Orange Caraïbe',
    'Digicel AFG': 'Digicel AFG',
    'Outremer Telecom': 'Outremer Telecom / SFR',
    'Dauphin Telecom': 'Dauphin Telecom',
    'UTS Caraibe': 'UTS Caraibe',
    'Free Caraibes': 'Free Caraibes',
};

function extractLogSection(content: string, prefix: 'EmaExtracter' | 'EmmExtracter') {
    // Extract only lines belonging to this log file
    const lines = content.split('\n').filter((l) => l.includes(prefix));
    const section = lines.join('\n');

    const opResults: Record<string, boolean> = {};
    for (const op of VERIF_OPERATORS) {
        // Pattern from real log: "..Verification operateur Orange Caraibe : Check success"
        const pat = new RegExp(`${prefix}.*${op}.*Check success`, 'i');
        opResults[op] = pat.test(section);
    }

    const countMatch = section.match(/\.{5,}(\d+)\s*bascules?\s*ajout/i);
    const count = countMatch ? parseInt(countMatch[1], 10) : null;

    const durationMatch = section.match(/Fin de Traitement\s+([\d.]+)\s*secondes/i);
    const duration = durationMatch ? parseFloat(durationMatch[1]) : null;

    const finished = /Fin de Traitement/i.test(section);

    return { opResults, count, duration, finished, hasContent: lines.length > 0 };
}

function autoFillVerifBascule(
    _eventKey: string,
    checklist: string[],
    content: string,
): AutoFillResult | null {
    const hasEma = /EmaExtracter/i.test(content);
    const hasEmm = /EmmExtracter/i.test(content);

    if (!hasEma && !hasEmm) return null;

    const ema = extractLogSection(content, 'EmaExtracter');
    const emm = extractLogSection(content, 'EmmExtracter');

    const rules: Record<string, () => boolean> = {};

    // EmaExtracter per-operator rules
    for (const op of VERIF_OPERATORS) {
        const label = OP_CHECKLIST_LABELS[op];
        rules[`EmaExtracter : ${label} Check success`] = () => ema.opResults[op];
    }
    rules['EmaExtracter : Bascules ajoutées + Fin traitement'] = () =>
        ema.count !== null && ema.count > 0 && ema.finished;

    // EmmExtracter per-operator rules
    for (const op of VERIF_OPERATORS) {
        const label = OP_CHECKLIST_LABELS[op];
        rules[`EmmExtracter : ${label} Check success`] = () => emm.opResults[op];
    }
    rules['EmmExtracter : Valorisation + Fin traitement'] = () =>
        emm.count !== null && emm.count > 0 && emm.finished;

    const checkedItems = checklist.filter((item) => rules[item]?.());

    // Build notes with clear separation
    const lines = ['[Auto] Vérification bascule & valorisation'];

    if (ema.hasContent) {
        const missingEma = VERIF_OPERATORS.filter((op) => !ema.opResults[op]);
        lines.push('');
        lines.push('--- EmaExtracter.log (bascule) ---');
        for (const op of VERIF_OPERATORS) {
            const status = ema.opResults[op] ? 'Check success' : '⚠ Non détecté';
            lines.push(`  ${op}: ${status}`);
        }
        if (ema.count !== null) lines.push(`  Bascules ajoutées: ${ema.count}`);
        if (ema.duration !== null) lines.push(`  Durée traitement: ${ema.duration}s`);
        lines.push(`  Fin traitement: ${ema.finished ? 'OUI' : 'NON'}`);
        if (missingEma.length > 0) {
            lines.push(`  ⚠ ${missingEma.length} opérateur(s) non détecté(s) — le log est peut-être tronqué, réessayez avec plus de lignes`);
        }
    }

    if (emm.hasContent) {
        const missingEmm = VERIF_OPERATORS.filter((op) => !emm.opResults[op]);
        lines.push('');
        lines.push('--- EmmExtracter.log (valorisation) ---');
        for (const op of VERIF_OPERATORS) {
            const status = emm.opResults[op] ? 'Check success' : '⚠ Non détecté';
            lines.push(`  ${op}: ${status}`);
        }
        if (emm.count !== null) lines.push(`  Enregistrements valorisés: ${emm.count}`);
        if (emm.duration !== null) lines.push(`  Durée traitement: ${emm.duration}s`);
        lines.push(`  Fin traitement: ${emm.finished ? 'OUI' : 'NON'}`);
        if (missingEmm.length > 0) {
            lines.push(`  ⚠ ${missingEmm.length} opérateur(s) non détecté(s) — le log est peut-être tronqué, réessayez avec plus de lignes`);
        }
    }

    if (!ema.hasContent) lines.push('\n⚠ EmaExtracter.log non détecté dans le contenu collé');
    if (!emm.hasContent) lines.push('\n⚠ EmmExtracter.log non détecté dans le contenu collé');

    return { checkedItems, notes: lines.join('\n') };
}

// ===================================================================
// 10. Vérif génération fichiers vacation (PnmDataManager.log)
// ===================================================================

function autoFillVerifGeneration(
    _eventKey: string,
    checklist: string[],
    content: string,
): AutoFillResult | null {
    if (!/PnmDataManager/i.test(content) && !/Generation du fichier PNMDATA/i.test(content)) return null;

    const opCodes = ['01', '03', '04', '05', '06'];
    const generated: Record<string, { file: string; tickets: number } | null> = {};

    for (const code of opCodes) {
        const pattern = new RegExp(
            `Traitement operateur ${code}[\\s\\S]*?Generation du fichier (PNMDATA\\.\\S+).*?#tickets:\\s*(\\d+)`,
            'i',
        );
        const match = content.match(pattern);
        generated[code] = match ? { file: match[1], tickets: parseInt(match[2], 10) } : null;
    }

    const finTraitement = /Fin de Traitement/i.test(content);

    const rules: Record<string, () => boolean> = {
        'PnmDataManager : Fichier PNMDATA op. 01 généré': () => !!generated['01'],
        'PnmDataManager : Fichier PNMDATA op. 03 généré': () => !!generated['03'],
        'PnmDataManager : Fichier PNMDATA op. 04 généré': () => !!generated['04'],
        'PnmDataManager : Fichier PNMDATA op. 05 généré': () => !!generated['05'],
        'PnmDataManager : Fichier PNMDATA op. 06 généré': () => !!generated['06'],
        'PnmDataManager : Traitement terminé sans erreur': () => finTraitement,
    };

    const checkedItems = checklist.filter((item) => rules[item]?.());

    const missingOps = opCodes.filter((code) => !generated[code]);

    const lines = ['[Auto] Génération fichiers vacation PNMDATA'];
    for (const code of opCodes) {
        const g = generated[code];
        if (g) {
            lines.push(`  Op. ${code}: ${g.file} (${g.tickets} tickets)`);
        } else {
            lines.push(`  Op. ${code}: ⚠ non détecté`);
        }
    }
    lines.push(`Traitement terminé: ${finTraitement ? 'OUI' : 'NON'}`);

    if (missingOps.length > 0 && !finTraitement) {
        lines.push(`\n⚠ ${missingOps.length} opérateur(s) non détecté(s) et pas de Fin de Traitement — le log est peut-être tronqué, réessayez avec plus de lignes (ex. tail -n 20).`);
    }

    return { checkedItems, notes: lines.join('\n') };
}

// ===================================================================
// 11. Vérif bascule email ([PNMV3] FIN + [PNM] Controle EMA)
// ===================================================================

function autoFillVerifBasculeEmail(
    _eventKey: string,
    checklist: string[],
    content: string,
): AutoFillResult | null {
    // Detect [PNMV3] Verification Bascule Porta MOBI : FIN email
    const hasBasculeFinEmail =
        /Verification Bascule Porta MOBI/i.test(content) ||
        /\bFIN\b.*bascule/i.test(content) ||
        /Rapport RL/i.test(content) ||
        /Tout est OK pour la prochaine bascule/i.test(content);

    // Detect [PNM] Controle fichier batchhandler FNR_V3 sur EMA email
    const hasControleEmaEmail =
        /Controle fichier batchhandler/i.test(content) ||
        /FNR_V3/i.test(content) ||
        /Verification integrite.*PORTAGE_DATA/i.test(content);

    if (!hasBasculeFinEmail && !hasControleEmaEmail) return null;

    // --- Parse bascule FIN email ---
    const rlMatch = content.match(/(\d+)\s*RL\s*OK\s*sur\s*un\s*total\s*de\s*(\d+)/i);
    const rlOk = rlMatch ? parseInt(rlMatch[1], 10) : null;
    const rlTotal = rlMatch ? parseInt(rlMatch[2], 10) : null;
    const allRlOk = rlOk !== null && rlTotal !== null && rlOk === rlTotal;
    const toutEstOk = /Tout est OK pour la prochaine bascule/i.test(content);
    const basculeFin = /FIN/i.test(content) && hasBasculeFinEmail;
    const basculeNoError = toutEstOk || allRlOk || /aucune?\s*erreur/i.test(content);

    // --- Parse controle EMA email ---
    const integriteOk =
        /Pas d['']information erron[eé]e/i.test(content) ||
        /aucune?\s*erreur.*PORTAGE_DATA/i.test(content) ||
        /integrite.*OK/i.test(content);
    const controleOk = hasControleEmaEmail && (integriteOk || /traitement.*OK/i.test(content) || /Pas d['']information erron/i.test(content));

    const rules: Record<string, () => boolean> = {
        'Email [PNMV3] Verification Bascule Porta MOBI : FIN reçu': () => hasBasculeFinEmail,
        'Bascule terminée sans erreur': () => basculeNoError,
        'Email [PNM] Controle fichier batchhandler FNR_V3 sur EMA reçu': () => hasControleEmaEmail,
        'Fichiers EMA traités correctement': () => controleOk,
    };

    const checkedItems = checklist.filter((item) => rules[item]?.());

    const lines = ['[Auto] Contrôle bascule & fichiers EMA (emails)'];

    if (hasBasculeFinEmail) {
        lines.push('');
        lines.push('--- [PNMV3] Verification Bascule Porta MOBI : FIN ---');
        if (rlOk !== null && rlTotal !== null) {
            lines.push(`  Rapport RL: ${rlOk}/${rlTotal} OK`);
        }
        if (toutEstOk) lines.push('  Tout est OK pour la prochaine bascule');
        lines.push(`  Bascule sans erreur: ${basculeNoError ? 'OUI' : 'NON'}`);
    }

    if (hasControleEmaEmail) {
        lines.push('');
        lines.push('--- [PNM] Controle fichier batchhandler FNR_V3 sur EMA ---');
        if (integriteOk) {
            lines.push('  Intégrité PORTAGE_DATA: OK (pas d\'information erronée)');
        } else {
            lines.push('  ⚠ Intégrité PORTAGE_DATA: à vérifier');
        }
        lines.push(`  Fichiers EMA: ${controleOk ? 'OK' : 'à vérifier'}`);
    }

    if (!hasBasculeFinEmail) lines.push('\n⚠ Email [PNMV3] FIN non détecté');
    if (!hasControleEmaEmail) lines.push('\n⚠ Email [PNM] Controle EMA non détecté');

    return { checkedItems, notes: lines.join('\n') };
}

// ===================================================================
// 12. Vérif acquittements (PnmAckManager.log / PnmDataAckManager.php)
// ===================================================================

/** Map operator log names → codes */
const ACK_OP_MAP: { name: string; pattern: RegExp; code: string }[] = [
    { name: 'Outremer Telecom / SFR', pattern: /Outremer Telecom|SFR/i, code: '03' },
    { name: 'Dauphin Telecom', pattern: /Dauphin Telecom/i, code: '04' },
    { name: 'UTS Caraibe', pattern: /UTS Caraibe/i, code: '05' },
    { name: 'Free Caraibes', pattern: /Free Caraibes/i, code: '06' },
];

function autoFillVerifAcquittements(
    _eventKey: string,
    checklist: string[],
    content: string,
): AutoFillResult | null {
    // Accept both PnmDataAckManager.php and PnmSyncAckManager.php formats
    if (!/PnmDataAckManager|PnmAckManager|PnmSyncAckManager|Accus[eé] re[cç]u/i.test(content)) return null;

    // --- Detect operator verifications (Check success) ---
    const opChecks: Record<string, boolean> = {};
    for (const op of ACK_OP_MAP) {
        const pat = new RegExp(`Verification operateur\\s+${op.pattern.source}.*Check success`, 'i');
        opChecks[op.code] = pat.test(content);
    }

    // --- Count ACR received (Accusé reçu ... => E000) ---
    const acrReceivedMatches = content.match(/Accus[eé] re[cç]u\s+\S+\.ACR\s*=>\s*E000/gi) || [];
    const acrCount = acrReceivedMatches.length;

    // --- Count NOT FOUND errors ---
    const notFoundMatches = content.match(/NOT FOUND!/gi) || [];
    const notFoundCount = notFoundMatches.length;

    // --- Fin de Traitement ---
    const finTraitement = /Fin de Traitement/i.test(content);

    // --- Legacy format support: "Aucune notification d'AR SYNC non-recu" ---
    for (const op of ACK_OP_MAP) {
        if (!opChecks[op.code]) {
            const legacyPat = new RegExp(
                `Traitement operateur ${op.code}[\\s\\S]*?Aucune notification d['']AR SYNC non-recu`,
                'i',
            );
            if (legacyPat.test(content)) opChecks[op.code] = true;
        }
    }

    const rules: Record<string, () => boolean> = {
        'PnmAckManager : Op. 03 — Aucun AR SYNC non-reçu': () => opChecks['03'],
        'PnmAckManager : Op. 04 — Aucun AR SYNC non-reçu': () => opChecks['04'],
        'PnmAckManager : Op. 05 — Aucun AR SYNC non-reçu': () => opChecks['05'],
        'PnmAckManager : Op. 06 — Aucun AR SYNC non-reçu': () => opChecks['06'],
    };

    const checkedItems = checklist.filter((item) => rules[item]?.());

    const opNames: Record<string, string> = { '03': 'SFR Caraïbe', '04': 'Dauphin Télécom', '05': 'UTS', '06': 'FREEC' };
    const missingOps = ACK_OP_MAP.filter((op) => !opChecks[op.code]);

    const lines = ['[Auto] Vérification acquittements PNMDATA'];
    for (const op of ACK_OP_MAP) {
        const status = opChecks[op.code] ? 'OK (Check success)' : '⚠ Non détecté';
        lines.push(`  Op. ${op.code} (${opNames[op.code]}): ${status}`);
    }
    if (acrCount > 0) lines.push(`\nACR traités: ${acrCount} accusé(s) reçu(s) (E000)`);
    if (notFoundCount > 0) lines.push(`⚠ ${notFoundCount} fichier(s) NOT FOUND`);
    lines.push(`Fin de traitement: ${finTraitement ? 'OUI' : 'NON'}`);

    if (missingOps.length > 0) {
        lines.push(`\n⚠ ${missingOps.length} opérateur(s) non détecté(s) dans le contenu collé (${missingOps.map((o) => o.name).join(', ')}). Le log est peut-être tronqué — réessayez avec plus de lignes (ex. tail -n 100).`);
    }

    return { checkedItems, notes: lines.join('\n') };
}
