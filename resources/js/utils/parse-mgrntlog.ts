// ---------------------------------------------------------------------------
// Parsers for monitoring auto-fill (all PNM event types)
// ---------------------------------------------------------------------------

export type AutoFillResult = {
    checkedItems: string[];
    notes: string;
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
    cto_rattrapage: autoFillCto,
    verif_bascule_valorisation: autoFillVerifBascule,
    vacation_1: autoFillVacation,
    vacation_2: autoFillVacation,
    vacation_3: autoFillVacation,
    incidents: autoFillIncidents,
    rio_reporting: autoFillRio,
    pso_jour: autoFillPso,
    verif_generation_pnmdata: autoFillVerifGeneration,
    verif_acquittements: autoFillVerifAcquittements,
    tickets_attente: autoFillTickets,
    automates_report: (_ek, cl, c) => autoFillAutomates(cl, c),
    prevision_portabilites: autoFillPrevisions,
};

export const SUPPORTED_EVENT_KEYS = Object.keys(PARSERS);

// ===================================================================
// 1.  mgrntlog parser  (automates_report)
// ===================================================================

type MgrntlogEntry = {
    dossier: string;
    dateBascule: string | null;
    fichier: string;
    heureDebut: string;
    heureFin: string;
    statut: string;
};

function parseMgrntlog(content: string): MgrntlogEntry[] {
    const blocks = content.split(/^-{3,}$/m).filter((b) => b.trim());
    return blocks
        .map((block) => {
            const get = (key: string): string => {
                const match = block.match(new RegExp(`${key}\\s*:\\s*(.+)`, 'i'));
                return match ? match[1].trim() : '';
            };
            return {
                dossier: get('Dossier'),
                dateBascule: get('Date Bascule') || null,
                fichier: get('Fichier'),
                heureDebut: get('Heure Début') || get('Heure Debut'),
                heureFin: get('Heure Fin'),
                statut: get('Statut'),
            };
        })
        .filter((e) => e.dossier);
}

function calcDurationMinutes(start: string, end: string): number | null {
    const [sh, sm, ss] = start.split(':').map(Number);
    const [eh, em, es] = end.split(':').map(Number);
    if ([sh, sm, ss, eh, em, es].some(isNaN)) return null;
    const startMin = sh * 60 + sm + ss / 60;
    const endMin = eh * 60 + em + es / 60;
    return endMin >= startMin ? endMin - startMin : endMin + 1440 - startMin;
}

function formatDuration(start: string, end: string): string {
    const mins = calcDurationMinutes(start, end);
    if (mins === null) return '?';
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    const s = Math.round((mins % 1) * 60);
    if (h > 0) return `${h}h${String(m).padStart(2, '0')}m${String(s).padStart(2, '0')}s`;
    return `${m}m${String(s).padStart(2, '0')}s`;
}

function autoFillAutomates(checklist: string[], content: string): AutoFillResult | null {
    const entries = parseMgrntlog(content);
    if (entries.length === 0) return null;

    const rules: Record<string, () => boolean> = {
        'Email rapport activité automates reçu': () => entries.length > 0,
        'Automate BASCULE_IN : SUCCESS': () =>
            entries.find((e) => e.dossier === 'BASCULE_IN')?.statut === 'SUCCESS',
        'Durée de bascule raisonnable (< 3h)': () => {
            const bi = entries.find((e) => e.dossier === 'BASCULE_IN');
            if (!bi) return false;
            const mins = calcDurationMinutes(bi.heureDebut, bi.heureFin);
            return mins !== null && mins < 180;
        },
        'Automate EXPLOIT : SUCCESS': () =>
            entries.find((e) => e.dossier === 'EXPLOIT')?.statut === 'SUCCESS',
        'Automate RATP_OLN : SUCCESS': () =>
            entries.find((e) => e.dossier === 'RATP_OLN')?.statut === 'SUCCESS',
        'Automate TRACE : SUCCESS': () =>
            entries.find((e) => e.dossier === 'TRACE')?.statut === 'SUCCESS',
        'Automate WATCHER : SUCCESS': () =>
            entries.find((e) => e.dossier === 'WATCHER')?.statut === 'SUCCESS',
        'Si KO : escalader supervision avec détail': () => {
            const expected = ['BASCULE_IN', 'EXPLOIT', 'RATP_OLN', 'TRACE', 'WATCHER'];
            return expected.every((d) => entries.find((e) => e.dossier === d)?.statut === 'SUCCESS');
        },
    };

    const checkedItems = checklist.filter((item) => rules[item]?.());

    const bi = entries.find((e) => e.dossier === 'BASCULE_IN');
    const lines = ['[Auto] Rapport activité automates'];
    for (const e of entries) {
        const d = formatDuration(e.heureDebut, e.heureFin);
        lines.push(`${e.dossier}: ${e.heureDebut}→${e.heureFin} (${d}) — ${e.statut}`);
    }
    if (bi) {
        lines.push(`\nBASCULE_IN: ${bi.dateBascule ?? 'N/A'} | Durée: ${formatDuration(bi.heureDebut, bi.heureFin)}`);
    }

    return { checkedItems, notes: lines.join('\n') };
}

// ===================================================================
// 2.  Vacation report parser
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

    // Count incident types
    const refusCount = (content.match(/refu\(s\)\s*\(1210\/1220\)/gi) || []).length;
    const erreurCount = (content.match(/erreur\(s\)\s*\(7000\)/gi) || []).length;
    const arNonRecu = /AR non-recu/i.test(content);
    const nonAcquitte = /n['']a pas [eé]t[eé] acquit[eé]/i.test(content);
    const conflitsOuvert = /conflit\s*\[OUVERT\]/i.test(content);

    // Extract ticket details for notes
    const ticketLines = content.match(/\[[\d, ]+,.*?\]/g) || [];
    const refusTickets = ticketLines.filter((t) => t.startsWith('[1210') || t.startsWith('[1220'));
    const erreurTickets = ticketLines.filter((t) => t.startsWith('[7000'));

    // Count total incidents from subject line
    const totalMatch = content.match(/(\d+)\s*incidents?\s+(ont\s+ete|a\s+ete)\s+detect/i);
    const totalIncidents = totalMatch ? parseInt(totalMatch[1], 10) : null;

    const rules: Record<string, () => boolean> = {
        "Email [PNM][INCIDENT] reçu (ou aucun = pas d'incident)": () => true,
        'Refus 1210/1220 : lire motifs, traiter ou informer commercial': () => refusCount === 0,
        'Erreurs 7000 : vérifier données dossier': () => erreurCount === 0,
        'AR non-reçus > 60 min : contacter opérateur': () => !arNonRecu,
        'Fichiers non acquittés : signaler si récurrent': () => !nonAcquitte,
        'Conflits [OUVERT] : investiguer si récent (< 7j)': () => !conflitsOuvert,
    };

    const checkedItems = checklist.filter((item) => rules[item]?.());

    const lines = ['[Auto] Incidents PNM détectés'];
    if (totalIncidents !== null) lines.push(`Total incidents: ${totalIncidents}`);
    if (refusCount > 0) {
        lines.push(`\nRefus 1210/1220: ${refusCount} détecté(s)`);
        for (const t of refusTickets.slice(0, 5)) {
            // Extract MSISDN from ticket: [1220, from, to, op1, op2, date, MSISDN, ...]
            const parts = t.split(',').map((s) => s.trim());
            const msisdn = parts[6] || '?';
            const motif = parts.slice(-1)[0]?.replace(/]$/, '').trim() || '?';
            lines.push(`  - ${msisdn}: ${motif}`);
        }
    } else {
        lines.push('Refus 1210/1220: aucun');
    }
    if (erreurCount > 0) {
        lines.push(`\nErreurs 7000: ${erreurCount} détectée(s)`);
        for (const t of erreurTickets.slice(0, 5)) {
            const parts = t.split(',').map((s) => s.trim());
            const msisdn = parts[5] || '?';
            const errCode = parts[7] || '?';
            lines.push(`  - ${msisdn}: ${errCode}`);
        }
    } else {
        lines.push('Erreurs 7000: aucune');
    }
    if (arNonRecu) lines.push('\n⚠ AR non-reçu(s) > 60 min détecté(s)');
    if (nonAcquitte) lines.push('⚠ Fichier(s) non acquitté(s)');
    if (conflitsOuvert) lines.push('⚠ Conflit(s) [OUVERT] détecté(s)');

    return { checkedItems, notes: lines.join('\n') };
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
    const isCsv = /RECORD_NO.*ACTION_COD/i.test(content) || /;RLPS;/i.test(content);

    if (!isEmail && !isCsv) return null;

    let rowCount: number | null = null;
    if (isCsv) {
        // Count data rows (lines containing RLPS)
        const dataLines = content.split('\n').filter((l) => /;RLPS;/i.test(l));
        rowCount = dataLines.length;
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
        lines.push(`Volumétrie PSO: ${rowCount} lignes`);
    }

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

function autoFillVerifBascule(
    _eventKey: string,
    checklist: string[],
    content: string,
): AutoFillResult | null {
    const hasEma = /EmaExtracter/i.test(content);
    const hasEmm = /EmmExtracter/i.test(content);

    if (!hasEma && !hasEmm) return null;

    // EmaExtracter operator checks
    const emaOperators: Record<string, string> = {
        'Orange Caraibe': 'EmaExtracter : Opérateur Orange Caraïbe Check success',
        'Digicel AFG': 'EmaExtracter : Opérateur Digicel AFG Check success',
        'Outremer Telecom': 'EmaExtracter : Opérateur Outremer Telecom / SFR Check success',
        'Dauphin Telecom': 'EmaExtracter : Opérateur Dauphin Telecom Check success',
        'UTS Caraibe': 'EmaExtracter : Opérateur UTS Caraibe Check success',
        'Free Caraibes': 'EmaExtracter : Opérateur Free Caraibes Check success',
    };

    // Extract bascule count from EmaExtracter
    const basculeMatch = content.match(/EmaExtracter.*?(\d+)\s*bascules?\s*ajoute/i);
    const basculeCount = basculeMatch ? parseInt(basculeMatch[1], 10) : null;

    // EmmExtracter checks
    const emmAllSuccess = hasEmm && Object.keys(emaOperators).every((op) => {
        const pattern = new RegExp(`EmmExtracter.*${op}.*Check success`, 'i');
        return pattern.test(content);
    });
    const emmFinished = /EmmExtracter.*Fin de Traitement/i.test(content);
    const valorisationMatch = content.match(/EmmExtracter.*?(\d+)\s*bascules?\s*ajoute/i);
    const valorisationCount = valorisationMatch ? parseInt(valorisationMatch[1], 10) : null;

    const rules: Record<string, () => boolean> = {};

    for (const [opKey, checklistItem] of Object.entries(emaOperators)) {
        const pattern = new RegExp(`EmaExtracter.*${opKey}.*Check success`, 'i');
        rules[checklistItem] = () => pattern.test(content);
    }

    rules['EmaExtracter : Bascules ajoutées (nombre)'] = () => basculeCount !== null && basculeCount > 0;
    rules['EmmExtracter : Tous opérateurs Check success'] = () => emmAllSuccess;
    rules['EmmExtracter : Valorisation terminée'] = () => emmFinished;

    const checkedItems = checklist.filter((item) => rules[item]?.());

    const lines = ['[Auto] Vérification bascule & valorisation'];
    if (hasEma) {
        lines.push('\nEmaExtracter (bascule):');
        for (const opKey of Object.keys(emaOperators)) {
            const pattern = new RegExp(`EmaExtracter.*${opKey}.*Check success`, 'i');
            const status = pattern.test(content) ? 'OK' : 'ECHEC';
            lines.push(`  ${opKey}: ${status}`);
        }
        if (basculeCount !== null) lines.push(`  Bascules ajoutées: ${basculeCount}`);
    }
    if (hasEmm) {
        lines.push('\nEmmExtracter (valorisation):');
        lines.push(`  Tous opérateurs OK: ${emmAllSuccess ? 'OUI' : 'NON'}`);
        if (valorisationCount !== null) lines.push(`  Enregistrements: ${valorisationCount}`);
        lines.push(`  Traitement terminé: ${emmFinished ? 'OUI' : 'NON'}`);
    }

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

    const lines = ['[Auto] Génération fichiers vacation PNMDATA'];
    for (const code of opCodes) {
        const g = generated[code];
        if (g) {
            lines.push(`  Op. ${code}: ${g.file} (${g.tickets} tickets)`);
        } else {
            lines.push(`  Op. ${code}: non généré`);
        }
    }
    lines.push(`Traitement terminé: ${finTraitement ? 'OUI' : 'NON'}`);

    return { checkedItems, notes: lines.join('\n') };
}

// ===================================================================
// 11. Vérif acquittements (PnmSyncAckManager.log)
// ===================================================================

function autoFillVerifAcquittements(
    _eventKey: string,
    checklist: string[],
    content: string,
): AutoFillResult | null {
    if (!/PnmSyncAckManager|PnmAckManager|Aucune notification/i.test(content)) return null;

    const opChecks: Record<string, boolean> = {};
    for (const code of ['03', '04', '05', '06']) {
        const pattern = new RegExp(
            `Traitement operateur ${code}[\\s\\S]*?Aucune notification d['']AR SYNC non-recu`,
            'i',
        );
        opChecks[code] = pattern.test(content);
    }

    const rules: Record<string, () => boolean> = {
        'PnmAckManager : Op. 03 — Aucun AR SYNC non-reçu': () => opChecks['03'],
        'PnmAckManager : Op. 04 — Aucun AR SYNC non-reçu': () => opChecks['04'],
        'PnmAckManager : Op. 05 — Aucun AR SYNC non-reçu': () => opChecks['05'],
        'PnmAckManager : Op. 06 — Aucun AR SYNC non-reçu': () => opChecks['06'],
    };

    const checkedItems = checklist.filter((item) => rules[item]?.());

    const opNames: Record<string, string> = { '03': 'SFR Caraïbe', '04': 'Dauphin Télécom', '05': 'UTS', '06': 'FREEC' };
    const lines = ['[Auto] Vérification acquittements PNMDATA'];
    for (const code of ['03', '04', '05', '06']) {
        const status = opChecks[code] ? 'OK (aucun AR non-reçu)' : '⚠ AR SYNC non-reçu détecté';
        lines.push(`  Op. ${code} (${opNames[code]}): ${status}`);
    }

    return { checkedItems, notes: lines.join('\n') };
}
