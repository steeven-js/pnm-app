// ---------------------------------------------------------------------------
// Parsers for monitoring auto-fill:
//   1. mgrntlog_global_*.log  (automates report)
//   2. Vacation email body     (vacation 1/2/3)
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
    if (eventKey.startsWith('vacation_')) {
        return autoFillVacation(eventKey, checklist, content);
    }
    if (eventKey === 'automates_report') {
        return autoFillAutomates(checklist, content);
    }
    return null;
}

export const SUPPORTED_EVENT_KEYS = [
    'automates_report',
    'vacation_1',
    'vacation_2',
    'vacation_3',
];

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
    // Match "X fichiers échangés / Y attendus"
    const countMatch = content.match(
        /(\d+)\s*fichiers?\s*[eé]chang[eé]s?\s*\/\s*(\d+)\s*attendus?/i,
    );
    if (!countMatch) return null;

    const filesExchanged = parseInt(countMatch[1], 10);
    const filesExpected = parseInt(countMatch[2], 10);

    // Detect operator sections
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
    eventKey: string,
    checklist: string[],
    content: string,
): AutoFillResult | null {
    const report = parseVacationReport(content);
    if (!report) return null;

    const allFilesOk = report.filesExchanged === report.filesExpected;

    // Build operator check rules: match checklist items like "Opérateur 01 (Orange Caraïbe) : ..."
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

    // Per-operator rules
    for (const op of report.operatorSections) {
        const key = `Opérateur ${op.code} (${op.name}) : fichier reçu + ACR OK`;
        rules[key] = () => op.hasReceivedFiles && op.hasReceivedAcr;
    }

    const checkedItems = checklist.filter((item) => rules[item]?.());

    // Generate notes
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
