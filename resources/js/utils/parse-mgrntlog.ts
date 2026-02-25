// ---------------------------------------------------------------------------
// Parser for mgrntlog_global_*.log files
// Format:  blocks separated by "-----" lines, each containing key: value pairs
// ---------------------------------------------------------------------------

export type MgrntlogEntry = {
    dossier: string;
    dateBascule: string | null;
    fichier: string;
    heureDebut: string;
    heureFin: string;
    modifieLe: string;
    statut: string;
};

export function parseMgrntlog(content: string): MgrntlogEntry[] {
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
                modifieLe: get('Modifié le') || get('Modifie le'),
                statut: get('Statut'),
            };
        })
        .filter((e) => e.dossier);
}

// ---------------------------------------------------------------------------
// Duration helpers
// ---------------------------------------------------------------------------

function calcDurationMinutes(start: string, end: string): number | null {
    const [sh, sm, ss] = start.split(':').map(Number);
    const [eh, em, es] = end.split(':').map(Number);
    if ([sh, sm, ss, eh, em, es].some(isNaN)) return null;
    const startMin = sh * 60 + sm + ss / 60;
    const endMin = eh * 60 + em + es / 60;
    // handle midnight crossing
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

// ---------------------------------------------------------------------------
// Auto-fill rules per event key
// ---------------------------------------------------------------------------

type AutoFillRules = {
    checkRules: Record<string, (entries: MgrntlogEntry[]) => boolean>;
    generateNotes: (entries: MgrntlogEntry[]) => string;
};

const AUTO_FILL_RULES: Record<string, AutoFillRules> = {
    automates_report: {
        checkRules: {
            'Email rapport activité automates reçu': (entries) => entries.length > 0,
            'Automate BASCULE_IN : SUCCESS': (entries) =>
                entries.find((e) => e.dossier === 'BASCULE_IN')?.statut === 'SUCCESS',
            'Durée de bascule raisonnable (< 3h)': (entries) => {
                const bi = entries.find((e) => e.dossier === 'BASCULE_IN');
                if (!bi) return false;
                const mins = calcDurationMinutes(bi.heureDebut, bi.heureFin);
                return mins !== null && mins < 180;
            },
            'Automate EXPLOIT : SUCCESS': (entries) =>
                entries.find((e) => e.dossier === 'EXPLOIT')?.statut === 'SUCCESS',
            'Automate RATP_OLN : SUCCESS': (entries) =>
                entries.find((e) => e.dossier === 'RATP_OLN')?.statut === 'SUCCESS',
            'Automate TRACE : SUCCESS': (entries) =>
                entries.find((e) => e.dossier === 'TRACE')?.statut === 'SUCCESS',
            'Automate WATCHER : SUCCESS': (entries) =>
                entries.find((e) => e.dossier === 'WATCHER')?.statut === 'SUCCESS',
            'Si KO : escalader supervision avec détail': (entries) => {
                const expected = ['BASCULE_IN', 'EXPLOIT', 'RATP_OLN', 'TRACE', 'WATCHER'];
                return expected.every(
                    (d) => entries.find((e) => e.dossier === d)?.statut === 'SUCCESS',
                );
            },
        },
        generateNotes: (entries) => {
            const bi = entries.find((e) => e.dossier === 'BASCULE_IN');
            const lines = ['[Auto] Rapport activité automates'];
            for (const e of entries) {
                const d = formatDuration(e.heureDebut, e.heureFin);
                lines.push(`${e.dossier}: ${e.heureDebut}→${e.heureFin} (${d}) — ${e.statut}`);
            }
            if (bi) {
                const duration = formatDuration(bi.heureDebut, bi.heureFin);
                lines.push(`\nBASCULE_IN: ${bi.dateBascule ?? 'N/A'} | Durée: ${duration}`);
            }
            return lines.join('\n');
        },
    },
};

export const SUPPORTED_EVENT_KEYS = Object.keys(AUTO_FILL_RULES);

export type AutoFillResult = {
    checkedItems: string[];
    notes: string;
};

export function autoFillFromLog(
    eventKey: string,
    checklist: string[],
    entries: MgrntlogEntry[],
): AutoFillResult | null {
    const rules = AUTO_FILL_RULES[eventKey];
    if (!rules) return null;

    const checkedItems: string[] = [];
    for (const item of checklist) {
        const rule = rules.checkRules[item];
        if (rule && rule(entries)) {
            checkedItems.push(item);
        }
    }

    return {
        checkedItems,
        notes: rules.generateNotes(entries),
    };
}
