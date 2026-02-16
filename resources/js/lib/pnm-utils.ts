// ─── Jours fériés Antilles-Guyane 2025–2027 ────────────────────────────────
// Format ISO "YYYY-MM-DD"

const HOLIDAYS: Set<string> = new Set([
    // 2025
    '2025-01-01', // Jour de l'An
    '2025-04-18', // Vendredi Saint
    '2025-04-21', // Lundi de Pâques
    '2025-05-01', // Fête du Travail
    '2025-05-08', // Victoire 1945
    '2025-05-22', // Abolition de l'esclavage (Martinique)
    '2025-05-27', // Abolition de l'esclavage (Guadeloupe)
    '2025-05-29', // Ascension
    '2025-06-09', // Lundi de Pentecôte
    '2025-06-10', // Abolition de l'esclavage (Guyane)
    '2025-07-14', // Fête nationale
    '2025-08-15', // Assomption
    '2025-11-01', // Toussaint
    '2025-11-11', // Armistice
    '2025-12-25', // Noël

    // 2026
    '2026-01-01',
    '2026-04-03', // Vendredi Saint
    '2026-04-06', // Lundi de Pâques
    '2026-05-01',
    '2026-05-08',
    '2026-05-14', // Ascension
    '2026-05-22',
    '2026-05-25', // Lundi de Pentecôte
    '2026-05-27',
    '2026-06-10',
    '2026-07-14',
    '2026-08-15',
    '2026-11-01',
    '2026-11-11',
    '2026-12-25',

    // 2027
    '2027-01-01',
    '2027-03-26', // Vendredi Saint
    '2027-03-29', // Lundi de Pâques
    '2027-05-01',
    '2027-05-06', // Ascension
    '2027-05-08',
    '2027-05-17', // Lundi de Pentecôte
    '2027-05-22',
    '2027-05-27',
    '2027-06-10',
    '2027-07-14',
    '2027-08-15',
    '2027-11-01',
    '2027-11-11',
    '2027-12-25',
]);

function isBusinessDay(date: Date): boolean {
    const day = date.getDay();
    if (day === 0 || day === 6) return false; // dim / sam
    const iso = date.toISOString().slice(0, 10);
    return !HOLIDAYS.has(iso);
}

/** Ajoute `n` jours ouvrés à `start` (excl. sam/dim/fériés Antilles-Guyane). */
export function addBusinessDays(start: Date, n: number): Date {
    const result = new Date(start);
    let added = 0;
    while (added < n) {
        result.setDate(result.getDate() + 1);
        if (isBusinessDay(result)) added++;
    }
    return result;
}

/** Soustrait `n` jours ouvrés de `start`. */
export function subtractBusinessDays(start: Date, n: number): Date {
    const result = new Date(start);
    let removed = 0;
    while (removed < n) {
        result.setDate(result.getDate() - 1);
        if (isBusinessDay(result)) removed++;
    }
    return result;
}

/** Retourne les jours fériés entre deux dates (inclus). */
export function getHolidaysBetween(start: Date, end: Date): string[] {
    const result: string[] = [];
    const current = new Date(start);
    while (current <= end) {
        const iso = current.toISOString().slice(0, 10);
        if (HOLIDAYS.has(iso)) result.push(iso);
        current.setDate(current.getDate() + 1);
    }
    return result;
}

// ─── Opérateurs PNM ─────────────────────────────────────────────────────────

export const OPERATOR_MAP: Record<string, string> = {
    '01': 'Orange Caraïbe',
    '02': 'Digicel',
    '03': 'SFR / Only (Outremer)',
    '04': 'Dauphin Télécom',
    '05': 'UTS Caraïbe',
    '06': 'Free Caraïbe',
};

export function getOperatorName(code: string): string {
    return OPERATOR_MAP[code] ?? `Inconnu (${code})`;
}

// ─── V2 — Validation RIO ────────────────────────────────────────────────────

export type RioResult =
    | {
          valid: true;
          operator: string;
          operatorName: string;
          qualifier: string;
          reference: string;
          controlKey: string;
      }
    | { valid: false; error: string };

export function validateRio(rio: string): RioResult {
    // Supprimer espaces et tirets pour normaliser
    const cleaned = rio.replace(/[\s-]/g, '').toUpperCase();

    if (cleaned.length !== 12) {
        return {
            valid: false,
            error: `Le RIO doit contenir 12 caractères (reçu : ${cleaned.length}).`,
        };
    }

    if (!/^[A-Z0-9]{12}$/.test(cleaned)) {
        return {
            valid: false,
            error: 'Le RIO ne doit contenir que des caractères alphanumériques.',
        };
    }

    const operator = cleaned.slice(0, 2);
    const qualifier = cleaned.slice(2, 3);
    const reference = cleaned.slice(3, 9);
    const controlKey = cleaned.slice(9, 12);

    const operatorName = OPERATOR_MAP[operator];
    if (!operatorName) {
        return {
            valid: false,
            error: `Code opérateur inconnu : ${operator}. Codes valides : ${Object.keys(OPERATOR_MAP).join(', ')}.`,
        };
    }

    return {
        valid: true,
        operator,
        operatorName,
        qualifier,
        reference,
        controlKey,
    };
}

// ─── V3 — Décodeur de nom de fichier PNMDATA ───────────────────────────────

export type FilenameResult =
    | {
          valid: true;
          prefix: string;
          sourceOperator: string;
          sourceOperatorName: string;
          destOperator: string;
          destOperatorName: string;
          timestamp: string;
          formattedDate: string;
          sequence: string;
      }
    | { valid: false; error: string };

export function decodeFilename(filename: string): FilenameResult {
    // Retirer uniquement les extensions fichier connues (.csv, .txt, .dat, .xml)
    const name = filename.replace(/\.(csv|txt|dat|xml)$/i, '');

    // Format attendu : PNMDATA.XX.YY.AAAAMMJJHHMMSS.ZZZ
    const parts = name.split('.');

    if (parts.length !== 5) {
        return {
            valid: false,
            error: `Format attendu : PNMDATA.XX.YY.AAAAMMJJHHMMSS.ZZZ (reçu ${parts.length} segments au lieu de 5).`,
        };
    }

    const [prefix, sourceOp, destOp, timestamp, sequence] = parts;

    if (prefix !== 'PNMDATA') {
        return {
            valid: false,
            error: `Le préfixe doit être "PNMDATA" (reçu : "${prefix}").`,
        };
    }

    if (!/^\d{2}$/.test(sourceOp)) {
        return {
            valid: false,
            error: `Code opérateur source invalide : "${sourceOp}" (attendu : 2 chiffres).`,
        };
    }

    if (!/^\d{2}$/.test(destOp)) {
        return {
            valid: false,
            error: `Code opérateur destination invalide : "${destOp}" (attendu : 2 chiffres).`,
        };
    }

    if (!/^\d{14}$/.test(timestamp)) {
        return {
            valid: false,
            error: `Timestamp invalide : "${timestamp}" (attendu : 14 chiffres AAAAMMJJHHMMSS).`,
        };
    }

    if (!/^\d{3}$/.test(sequence)) {
        return {
            valid: false,
            error: `Numéro de séquence invalide : "${sequence}" (attendu : 3 chiffres).`,
        };
    }

    const year = timestamp.slice(0, 4);
    const month = timestamp.slice(4, 6);
    const day = timestamp.slice(6, 8);
    const hour = timestamp.slice(8, 10);
    const min = timestamp.slice(10, 12);
    const sec = timestamp.slice(12, 14);
    const formattedDate = `${day}/${month}/${year} à ${hour}:${min}:${sec}`;

    return {
        valid: true,
        prefix,
        sourceOperator: sourceOp,
        sourceOperatorName: getOperatorName(sourceOp),
        destOperator: destOp,
        destOperatorName: getOperatorName(destOp),
        timestamp,
        formattedDate,
        sequence,
    };
}

// ─── V4 — Calcul ID de portage (MD5) ────────────────────────────────────────

/** Calcul MD5 via Web Crypto (SHA n'est pas MD5, on implémente un MD5 léger). */
export async function computeMd5(input: string): Promise<string> {
    return md5(input);
}

// Implémentation MD5 légère (RFC 1321)
function md5(string: string): string {
    function md5cycle(x: number[], k: number[]) {
        let a = x[0],
            b = x[1],
            c = x[2],
            d = x[3];

        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17, 606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897);
        d = ff(d, a, b, c, k[5], 12, 1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341);
        b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416);
        d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063);
        b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682);
        d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290);
        b = ff(b, c, d, a, k[15], 22, 1236535329);

        a = gg(a, b, c, d, k[1], 5, -165796510);
        d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14, 643717713);
        b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691);
        d = gg(d, a, b, c, k[10], 9, 38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335);
        b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438);
        d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961);
        b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467);
        d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14, 1735328473);
        b = gg(b, c, d, a, k[12], 20, -1926607734);

        a = hh(a, b, c, d, k[5], 4, -378558);
        d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16, 1839030562);
        b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060);
        d = hh(d, a, b, c, k[4], 11, 1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632);
        b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174);
        d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979);
        b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487);
        d = hh(d, a, b, c, k[12], 11, -421815835);
        c = hh(c, d, a, b, k[15], 16, 530742520);
        b = hh(b, c, d, a, k[2], 23, -995338651);

        a = ii(a, b, c, d, k[0], 6, -198630844);
        d = ii(d, a, b, c, k[7], 10, 1126891415);
        c = ii(c, d, a, b, k[14], 15, -1416354905);
        b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571);
        d = ii(d, a, b, c, k[3], 10, -1894986606);
        c = ii(c, d, a, b, k[10], 15, -1051523);
        b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359);
        d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380);
        b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070);
        d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15, 718787259);
        b = ii(b, c, d, a, k[9], 21, -343485551);

        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);
    }

    function cmn(
        q: number,
        a: number,
        b: number,
        x: number,
        s: number,
        t: number,
    ) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
    }

    function ff(
        a: number,
        b: number,
        c: number,
        d: number,
        x: number,
        s: number,
        t: number,
    ) {
        return cmn((b & c) | (~b & d), a, b, x, s, t);
    }

    function gg(
        a: number,
        b: number,
        c: number,
        d: number,
        x: number,
        s: number,
        t: number,
    ) {
        return cmn((b & d) | (c & ~d), a, b, x, s, t);
    }

    function hh(
        a: number,
        b: number,
        c: number,
        d: number,
        x: number,
        s: number,
        t: number,
    ) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function ii(
        a: number,
        b: number,
        c: number,
        d: number,
        x: number,
        s: number,
        t: number,
    ) {
        return cmn(c ^ (b | ~d), a, b, x, s, t);
    }

    function md5blk(s: string) {
        const md5blks: number[] = [];
        for (let i = 0; i < 64; i += 4) {
            md5blks[i >> 2] =
                s.charCodeAt(i) +
                (s.charCodeAt(i + 1) << 8) +
                (s.charCodeAt(i + 2) << 16) +
                (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
    }

    const hexChr = '0123456789abcdef'.split('');

    function rhex(n: number) {
        let s = '';
        for (let j = 0; j < 4; j++)
            s +=
                hexChr[(n >> (j * 8 + 4)) & 0x0f] +
                hexChr[(n >> (j * 8)) & 0x0f];
        return s;
    }

    function hex(x: number[]) {
        return x.map(rhex).join('');
    }

    function add32(a: number, b: number) {
        return (a + b) & 0xffffffff;
    }

    function md5str(s: string) {
        const n = s.length;
        const state = [1732584193, -271733879, -1732584194, 271733878];
        let i: number;

        for (i = 64; i <= n; i += 64) {
            md5cycle(state, md5blk(s.substring(i - 64, i)));
        }

        s = s.substring(i - 64);
        const tail = Array(16).fill(0);
        for (i = 0; i < s.length; i++)
            tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        tail[i >> 2] |= 0x80 << ((i % 4) << 3);

        if (i > 55) {
            md5cycle(state, tail);
            tail.fill(0);
        }

        tail[14] = n * 8;
        md5cycle(state, tail);
        return hex(state);
    }

    return md5str(string);
}

// ─── V5 — Vérificateur MSISDN ───────────────────────────────────────────────

export type MsisdnPrefix = {
    prefix: string;
    operator: string;
    zone: string;
};

// Tranches de numérotation connues Antilles-Guyane
export const MSISDN_PREFIXES: MsisdnPrefix[] = [
    // Guadeloupe
    { prefix: '0690', operator: 'Orange Caraïbe', zone: 'Guadeloupe' },
    {
        prefix: '0691',
        operator: 'Orange Caraïbe',
        zone: 'Guadeloupe / Martinique',
    },
    { prefix: '0694', operator: 'Digicel', zone: 'Guadeloupe / Martinique' },
    // Martinique
    { prefix: '0696', operator: 'Orange Caraïbe', zone: 'Martinique' },
    { prefix: '0697', operator: 'Orange Caraïbe', zone: 'Martinique' },
    // Guyane
    { prefix: '0694', operator: 'Digicel', zone: 'Guyane / Antilles' },
    // Opérateurs alternatifs
    { prefix: '0695', operator: 'Digicel', zone: 'Antilles-Guyane' },
    { prefix: '0694', operator: 'Digicel', zone: 'Antilles-Guyane' },
];

// Table plus fine par préfixe 5 chiffres quand disponible
const MSISDN_FINE_PREFIXES: {
    prefix: string;
    operator: string;
    zone: string;
}[] = [
    { prefix: '06900', operator: 'Orange Caraïbe', zone: 'Guadeloupe' },
    { prefix: '06901', operator: 'Orange Caraïbe', zone: 'Guadeloupe' },
    { prefix: '06902', operator: 'Orange Caraïbe', zone: 'Guadeloupe' },
    { prefix: '06903', operator: 'Orange Caraïbe', zone: 'Guadeloupe' },
    { prefix: '06904', operator: 'Digicel', zone: 'Guadeloupe' },
    { prefix: '06905', operator: 'Digicel', zone: 'Guadeloupe' },
    { prefix: '06906', operator: 'Dauphin Télécom', zone: 'Guadeloupe' },
    {
        prefix: '06910',
        operator: 'Orange Caraïbe',
        zone: 'Guadeloupe / Martinique',
    },
    { prefix: '06940', operator: 'Digicel', zone: 'Antilles-Guyane' },
    { prefix: '06941', operator: 'Digicel', zone: 'Antilles-Guyane' },
    {
        prefix: '06942',
        operator: 'SFR / Only (Outremer)',
        zone: 'Antilles-Guyane',
    },
    { prefix: '06943', operator: 'Free Caraïbe', zone: 'Antilles-Guyane' },
    { prefix: '06944', operator: 'UTS Caraïbe', zone: 'Antilles-Guyane' },
    { prefix: '06950', operator: 'Digicel', zone: 'Antilles-Guyane' },
    { prefix: '06951', operator: 'Digicel', zone: 'Antilles-Guyane' },
    { prefix: '06960', operator: 'Orange Caraïbe', zone: 'Martinique' },
    { prefix: '06961', operator: 'Orange Caraïbe', zone: 'Martinique' },
    { prefix: '06962', operator: 'Orange Caraïbe', zone: 'Martinique' },
    { prefix: '06963', operator: 'Orange Caraïbe', zone: 'Martinique' },
    { prefix: '06964', operator: 'Digicel', zone: 'Martinique' },
    { prefix: '06970', operator: 'Orange Caraïbe', zone: 'Martinique' },
    { prefix: '06971', operator: 'Orange Caraïbe', zone: 'Martinique' },
];

export type MsisdnResult =
    | { valid: true; formatted: string; operator: string; zone: string }
    | { valid: false; error: string };

export function checkMsisdn(msisdn: string): MsisdnResult {
    const cleaned = msisdn.replace(/[\s.\-/]/g, '');

    if (!/^\d+$/.test(cleaned)) {
        return {
            valid: false,
            error: 'Le numéro ne doit contenir que des chiffres.',
        };
    }

    if (cleaned.length !== 10) {
        return {
            valid: false,
            error: `Le numéro doit contenir 10 chiffres (reçu : ${cleaned.length}).`,
        };
    }

    if (!cleaned.startsWith('06')) {
        return {
            valid: false,
            error: 'Le numéro doit commencer par 06 (numérotation mobile Antilles-Guyane).',
        };
    }

    // Chercher d'abord par préfixe fin (5 chiffres)
    const prefix5 = cleaned.slice(0, 5);
    const fine = MSISDN_FINE_PREFIXES.find((p) => p.prefix === prefix5);
    if (fine) {
        return {
            valid: true,
            formatted: cleaned.replace(
                /(\d{4})(\d{2})(\d{2})(\d{2})/,
                '$1 $2 $3 $4',
            ),
            operator: fine.operator,
            zone: fine.zone,
        };
    }

    // Sinon par préfixe 4 chiffres
    const prefix4 = cleaned.slice(0, 4);
    const coarse = MSISDN_PREFIXES.find((p) => p.prefix === prefix4);
    if (coarse) {
        return {
            valid: true,
            formatted: cleaned.replace(
                /(\d{4})(\d{2})(\d{2})(\d{2})/,
                '$1 $2 $3 $4',
            ),
            operator: coarse.operator,
            zone: coarse.zone,
        };
    }

    return {
        valid: false,
        error: `Préfixe ${prefix4} non reconnu dans les tranches Antilles-Guyane connues.`,
    };
}

// ─── Vacations PNM ───────────────────────────────────────────────────────────

export type VacationId = 'V1' | 'V2' | 'V3';

export type Vacation = {
    id: VacationId;
    label: string;
    start: string;
    end: string;
};

export const VACATIONS: Vacation[] = [
    { id: 'V1', label: 'Vacation 1', start: '10h00', end: '11h00' },
    { id: 'V2', label: 'Vacation 2', start: '14h00', end: '15h00' },
    { id: 'V3', label: 'Vacation 3', start: '19h00', end: '20h00' },
];

export function getVacationById(id: VacationId): Vacation {
    return VACATIONS.find((v) => v.id === id)!;
}

/** Retourne les vacations restantes le jour de soumission (à partir de la vacation choisie incluse). */
export function getRemainingVacations(from: VacationId): Vacation[] {
    const idx = VACATIONS.findIndex((v) => v.id === from);
    return VACATIONS.slice(idx);
}

// ─── Timeline de portage ─────────────────────────────────────────────────────

export type TimelineStep = {
    day: string; // "JD", "JD+1", "JP"
    date: Date;
    dateFormatted: string;
    vacation: string; // "V1 (10h–11h)" ou "Bascule (8h30–10h)"
    direction: string; // "OPR → OPD", etc.
    codes: string[];
    description: string;
    highlight?: 'green' | 'red' | 'yellow' | 'blue';
};

function fmtDate(d: Date): string {
    return d.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function vacLabel(v: Vacation): string {
    return `${v.id} (${v.start}–${v.end})`;
}

/**
 * Calcule la timeline complète des échanges inter-opérateurs
 * à partir de JD et de la vacation de soumission.
 *
 * Basé sur le calendrier PNM standard JD+2 jours ouvrés (slide 7 PNMV3).
 */
export function computePortageTimeline(
    jd: Date,
    submissionVacation: VacationId,
): TimelineStep[] {
    const jd1 = addBusinessDays(jd, 1);
    const jp = addBusinessDays(jd, 2);
    const steps: TimelineStep[] = [];

    const remaining = getRemainingVacations(submissionVacation);

    // ── JD : OPR → OPD ──
    // 1110 (demande) envoyé à toutes les vacations restantes le jour JD
    for (const v of remaining) {
        steps.push({
            day: 'JD',
            date: jd,
            dateFormatted: fmtDate(jd),
            vacation: vacLabel(v),
            direction: 'OPR → OPD',
            codes: ['1110'],
            description: 'Envoi de la demande de portage',
            highlight: 'green',
        });
    }

    // 1120 (confirmation) envoyé aux vacations après la première
    const afterFirst = remaining.slice(1);
    for (const v of afterFirst) {
        steps.push({
            day: 'JD',
            date: jd,
            dateFormatted: fmtDate(jd),
            vacation: vacLabel(v),
            direction: 'OPR → OPD',
            codes: ['1120'],
            description: 'Confirmation de la demande',
            highlight: 'green',
        });
    }

    // 1510 (éligibilité) si la demande est en V1, envoyé en V2/V3 de JD
    // sinon en vacations de JD+1
    if (submissionVacation === 'V1' && remaining.length > 1) {
        for (const v of remaining.slice(1)) {
            steps.push({
                day: 'JD',
                date: jd,
                dateFormatted: fmtDate(jd),
                vacation: vacLabel(v),
                direction: 'OPR → OPD',
                codes: ['1510'],
                description: "Demande d'éligibilité",
            });
        }
    }

    // ── JD+1 : OPD → OPR (réponse) ──
    for (const v of VACATIONS) {
        steps.push({
            day: 'JD+1',
            date: jd1,
            dateFormatted: fmtDate(jd1),
            vacation: vacLabel(v),
            direction: 'OPD → OPR',
            codes: ['1210', '1220'],
            description:
                'Accusé réception (1210) + Accord/Refus du portage (1220)',
            highlight: 'red',
        });
    }

    // 1530 en V2/V3 de JD+1
    for (const v of VACATIONS.slice(1)) {
        steps.push({
            day: 'JD+1',
            date: jd1,
            dateFormatted: fmtDate(jd1),
            vacation: vacLabel(v),
            direction: 'OPD → OPR',
            codes: ['1530'],
            description: "Réponse d'éligibilité",
        });
    }

    // OPR → OPX : 1410 (notification aux opérateurs tiers) toutes vacations JD+1
    for (const v of VACATIONS) {
        steps.push({
            day: 'JD+1',
            date: jd1,
            dateFormatted: fmtDate(jd1),
            vacation: vacLabel(v),
            direction: 'OPR → OPX',
            codes: ['1410'],
            description: 'Notification aux opérateurs tiers',
            highlight: 'yellow',
        });
    }

    // ── JP : Bascule + OPX → OPR ──
    steps.push({
        day: 'JP',
        date: jp,
        dateFormatted: fmtDate(jp),
        vacation: 'Bascule (8h30–10h00)',
        direction: 'OPX',
        codes: ['Portage'],
        description: 'Exécution du portage (bascule technique)',
        highlight: 'blue',
    });

    for (const v of VACATIONS) {
        steps.push({
            day: 'JP',
            date: jp,
            dateFormatted: fmtDate(jp),
            vacation: vacLabel(v),
            direction: 'OPX → OPR',
            codes: ['1430'],
            description: 'Confirmation de portage effectué',
        });
    }

    return steps;
}
