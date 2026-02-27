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
    '00': 'Tous (Opérateurs)',
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
    // Retirer uniquement les extensions fichier connues (.csv, .txt, .dat, .xml, .ACR, .ERR)
    const name = filename.replace(/\.(csv|txt|dat|xml|acr|err)$/i, '');

    // Format attendu : PNMDATA.XX.YY.AAAAMMJJHHMMSS.ZZZ
    const parts = name.split('.');

    if (parts.length !== 5) {
        return {
            valid: false,
            error: `Format attendu : PNMDATA.XX.YY.AAAAMMJJHHMMSS.ZZZ (reçu ${parts.length} segments au lieu de 5).`,
        };
    }

    const [prefix, sourceOp, destOp, timestamp, sequence] = parts;

    if (prefix !== 'PNMDATA' && prefix !== 'PNMSYNC') {
        return {
            valid: false,
            error: `Le préfixe doit être "PNMDATA" ou "PNMSYNC" (reçu : "${prefix}").`,
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

// ─── V3b — Analyseur complet de fichier PNM ─────────────────────────────────

// ── Maps ──

export const TICKET_TYPE_MAP: Record<string, { label: string; abbrev: string; direction: string }> = {
    '0000': { label: 'Ticket générique', abbrev: 'GEN', direction: '—' },
    // Portage simple
    '1110': { label: 'Demande de portage (particulier)', abbrev: 'DP', direction: 'OPR → OPD' },
    '1120': { label: 'Demande de portage (personne morale)', abbrev: 'DE', direction: 'OPR → OPD' },
    '1210': { label: 'Réponse — acceptation', abbrev: 'RP+', direction: 'OPD → OPR' },
    '1220': { label: 'Réponse — refus', abbrev: 'RP−', direction: 'OPD → OPR' },
    '1410': { label: 'Envoi des données de portage', abbrev: 'EP', direction: 'OPR → OPX' },
    '1430': { label: 'Confirmation de portage', abbrev: 'CP', direction: 'OPX → OPR' },
    // Annulation
    '1510': { label: 'Annulation OPR avant information opérateurs', abbrev: 'AP', direction: 'OPR → OPD' },
    '1520': { label: 'Annulation OPD d\'un numéro', abbrev: 'AN', direction: 'OPD → OPR' },
    '1530': { label: 'Confirmation d\'annulation', abbrev: 'CA', direction: 'OPD → OPR' },
    // Portage inverse
    '2400': { label: 'Bon accord portage inverse', abbrev: 'BI', direction: 'OPD → OPR' },
    '2410': { label: 'Envoi des données de portage inverse', abbrev: 'PI', direction: 'OPR → OPX' },
    '2420': { label: 'Confirmation prise en compte portage inverse', abbrev: 'DI', direction: 'OPX → OPR' },
    '2430': { label: 'Confirmation portage inverse', abbrev: 'CI', direction: 'OPX → OPR' },
    // Restitution
    '3400': { label: 'Bon accord pour restitution', abbrev: 'BR', direction: 'OPD → OPR' },
    '3410': { label: 'Envoi des données de restitution', abbrev: 'RN', direction: 'OPR → OPX' },
    '3420': { label: 'Prise en compte des données de restitution', abbrev: 'RS', direction: 'OPX → OPR' },
    '3430': { label: 'Confirmation mise à jour opérateurs', abbrev: 'CS', direction: 'OPX → OPR' },
    // Erreurs
    '7000': { label: 'Erreurs et dysfonctionnements', abbrev: 'ER', direction: '—' },
};

// ── Rôles des colonnes 2 (Opérateur Origine) et 3 (Opérateur Destination) par type de ticket ──
// Selon la spec GPMAG Annexe 4 ter, les colonnes 2 et 3 changent de signification
// en fonction du contexte : portage normal, portage inverse, restitution.

export type TicketContext = 'portage' | 'inverse' | 'restitution' | 'erreur';

export const TICKET_COLUMN_ROLES: Record<string, { context: TicketContext; col2Role: string; col3Role: string; col5Label: string }> = {
    // Portage normal
    '1110': { context: 'portage', col2Role: 'OPR', col3Role: 'OPD', col5Label: 'OPD' },
    '1120': { context: 'portage', col2Role: 'OPR', col3Role: 'OPD', col5Label: 'OPD' },
    '1210': { context: 'portage', col2Role: 'OPD', col3Role: 'OPR', col5Label: 'OPD' },
    '1220': { context: 'portage', col2Role: 'OPD', col3Role: 'OPR', col5Label: 'OPD' },
    '1410': { context: 'portage', col2Role: 'OPR', col3Role: 'Tous (00)', col5Label: 'OPD' },
    '1430': { context: 'portage', col2Role: 'OPX', col3Role: 'OPR', col5Label: 'OPD' },
    // Annulation
    '1510': { context: 'portage', col2Role: 'OPR', col3Role: 'OPD', col5Label: 'OPD' },
    '1520': { context: 'portage', col2Role: 'OPD', col3Role: 'OPR', col5Label: 'OPD' },
    '1530': { context: 'portage', col2Role: 'OPD/OPR', col3Role: 'OPR/OPD', col5Label: 'OPD' },
    // Portage inverse — OPR initial = ancien OPR, OPD initial = ancien OPD
    '2400': { context: 'inverse', col2Role: 'OPR initial', col3Role: 'OPD initial', col5Label: 'OPD initial' },
    '2410': { context: 'inverse', col2Role: 'OPD initial', col3Role: 'Tous (00)', col5Label: 'OPD initial' },
    '2420': { context: 'inverse', col2Role: 'OPX', col3Role: 'OPD initial', col5Label: 'OPD initial' },
    '2430': { context: 'inverse', col2Role: 'OPX', col3Role: 'OPD initial', col5Label: 'OPD initial' },
    // Restitution — OPA remplace OPD (opérateur attributaire de la tranche)
    '3400': { context: 'restitution', col2Role: 'OPR', col3Role: 'OPA', col5Label: 'OPA' },
    '3410': { context: 'restitution', col2Role: 'OPA', col3Role: 'Tous (00)', col5Label: 'OPA' },
    '3420': { context: 'restitution', col2Role: 'OPX', col3Role: 'OPA', col5Label: 'OPA' },
    '3430': { context: 'restitution', col2Role: 'OPX', col3Role: 'OPA', col5Label: 'OPA' },
    // Erreurs
    '7000': { context: 'erreur', col2Role: 'Émetteur', col3Role: 'Destinataire', col5Label: '—' },
};

// ── Lecture en langage naturel d'un ticket ──────────────────────────────────
// Génère une phrase explicative du type :
// "L'opérateur X informe l'opérateur Y que le numéro XXXXXXXXXX est …"
// Les champs opr/opd/opa/opx correspondent aux colonnes 2/3/4/5.

export function getTicketReadableSentence(t: TicketCommonFields): string {
    const m = t.msisdn || '(inconnu)';
    // col2 = t.opr/oprName, col3 = t.opd/opdName, col4 = t.opa/opaName, col5 = t.opx/opxName
    switch (t.code) {
        // ── Portage normal ──
        case '1110': // DP — OPR → OPD
            return `L'opérateur receveur ${t.oprName} demande à l'opérateur donneur ${t.opdName} le portage du numéro ${m} (abonné particulier).`;
        case '1120': // DE — OPR → OPD
            return `L'opérateur receveur ${t.oprName} demande à l'opérateur donneur ${t.opdName} le portage du numéro ${m} (personne morale).`;
        case '1210': // RP+ — OPD → OPR
            return `L'opérateur donneur ${t.oprName} accepte la demande de portage du numéro ${m} vers l'opérateur receveur ${t.opdName}.`;
        case '1220': // RP− — OPD → OPR
            return `L'opérateur donneur ${t.oprName} refuse la demande de portage du numéro ${m} à l'opérateur receveur ${t.opdName}.`;
        case '1410': // EP — OPR → Tous (col5 = OPD)
            return `L'opérateur receveur ${t.oprName} informe tous les opérateurs que le numéro ${m} va être porté (donneur : ${t.opxName}).`;
        case '1430': // CP — OPX → OPR (col5 = OPD)
            return `L'opérateur ${t.oprName} confirme à l'opérateur receveur ${t.opdName} la prise en compte du portage du numéro ${m} (donneur : ${t.opxName}).`;

        // ── Annulation ──
        case '1510': // AP — OPR → OPD
            return `L'opérateur receveur ${t.oprName} annule la demande de portage du numéro ${m} auprès de l'opérateur donneur ${t.opdName}.`;
        case '1520': // AN — OPD → OPR
            return `L'opérateur donneur ${t.oprName} annule le portage du numéro ${m} et en informe l'opérateur receveur ${t.opdName}.`;
        case '1530': // CA — confirmation d'annulation
            return `Confirmation de l'annulation du portage du numéro ${m} entre ${t.oprName} et ${t.opdName}.`;

        // ── Portage inverse ──
        case '2400': // BI — OPR initial → OPD initial
            return `L'opérateur receveur initial ${t.oprName} donne son accord pour le portage inverse du numéro ${m} à l'opérateur donneur initial ${t.opdName}.`;
        case '2410': // PI — OPD initial → Tous
            return `L'opérateur donneur initial ${t.oprName} informe tous les opérateurs du portage inverse du numéro ${m}.`;
        case '2420': // DI — OPX → OPD initial
            return `L'opérateur ${t.oprName} confirme à l'opérateur donneur initial ${t.opdName} la prise en compte du portage inverse du numéro ${m}.`;
        case '2430': // CI — OPX → OPD initial
            return `L'opérateur ${t.oprName} confirme à l'opérateur donneur initial ${t.opdName} la mise à jour du portage inverse du numéro ${m}.`;

        // ── Restitution ──
        case '3400': // BR — OPR → OPA
            return `L'opérateur receveur ${t.oprName} donne son accord pour la restitution du numéro ${m} à l'opérateur attributaire ${t.opdName}.`;
        case '3410': // RN — OPA → Tous
            return `L'opérateur attributaire ${t.oprName} informe tous les opérateurs de la restitution du numéro ${m}.`;
        case '3420': // RS — OPX → OPA
            return `L'opérateur ${t.oprName} confirme à l'opérateur attributaire ${t.opdName} la prise en compte de la restitution du numéro ${m}.`;
        case '3430': // CS — OPX → OPA
            return `L'opérateur ${t.oprName} confirme à l'opérateur attributaire ${t.opdName} la mise à jour pour la restitution du numéro ${m}.`;

        // ── Erreur ──
        case '7000': // ER
            return `L'opérateur ${t.oprName} signale une erreur ou un dysfonctionnement à l'opérateur ${t.opdName} concernant le numéro ${m}.`;

        default:
            return `Ticket ${t.code} concernant le numéro ${m} de ${t.oprName} vers ${t.opdName}.`;
    }
}

import { RESPONSE_CODE_LABELS, ERROR_CODE_LABELS } from './pnm-code-dictionary';

export const RESPONSE_CODE_MAP = RESPONSE_CODE_LABELS;

// ── Types ──

export type ParsedHeader = {
    sentinel: string;
    filename: string;
    filenameDecoded: FilenameResult;
    operatorCode: string;
    operatorName: string;
    timestamp: string;
    formattedDate: string;
};

export type ParsedFooter = {
    sentinel: string;
    operatorCode: string;
    operatorName: string;
    timestamp: string;
    formattedDate: string;
    declaredCount: number;
};

export type TicketCommonFields = {
    code: string;
    typeInfo: { label: string; abbrev: string; direction: string };
    context: TicketContext;
    col2Role: string; // Rôle sémantique de la colonne 2 (Opérateur Origine)
    col3Role: string; // Rôle sémantique de la colonne 3 (Opérateur Destination)
    col5Label: string; // Libellé de la colonne 5 (OPD, OPA, OPD initial...)
    opr: string;
    oprName: string;
    opd: string;
    opdName: string;
    opa: string;
    opaName: string;
    opx: string;
    opxName: string;
    timestamp: string;
    formattedDate: string;
    msisdn: string;
    hash: string;
};

export type TicketSpecificFields = Record<string, string>;

export type ParsedTicket = {
    lineNumber: number;
    raw: string;
    common: TicketCommonFields;
    specific: TicketSpecificFields;
};

export type ValidationIssue = {
    severity: 'error' | 'warning' | 'info';
    message: string;
    /** Line number in the file (1-based) — links the issue to a specific ticket row */
    lineNumber?: number;
    /** Short machine-readable type for UI styling */
    type?: 'col3_mismatch' | 'unknown_code' | 'count_mismatch' | 'bad_header' | 'bad_footer' | 'format'
        | 'filename_mismatch' | 'timestamp_order' | 'bad_hash' | 'duplicate_sequence' | 'duplicate_ticket';
    /** Extra structured details for rich UI display */
    details?: Record<string, string>;
};

export type TicketSummary = {
    code: string;
    label: string;
    abbrev: string;
    count: number;
};

export type FileAnalysisResult = {
    header: ParsedHeader | null;
    footer: ParsedFooter | null;
    tickets: ParsedTicket[];
    ticketSummary: TicketSummary[];
    uniqueMsisdns: string[];
    operatorsInvolved: string[];
    issues: ValidationIssue[];
};

// ── Helpers ──

export function formatPnmTimestamp(ts: string): string {
    if (!/^\d{14}$/.test(ts)) return ts;
    const y = ts.slice(0, 4);
    const m = ts.slice(4, 6);
    const d = ts.slice(6, 8);
    const h = ts.slice(8, 10);
    const mi = ts.slice(10, 12);
    const s = ts.slice(12, 14);
    return `${d}/${m}/${y} à ${h}:${mi}:${s}`;
}

// ── Parsing functions ──

export function parseHeader(line: string): ParsedHeader | null {
    if (!line.startsWith('0123456789|')) return null;
    const parts = line.split('|');
    if (parts.length < 4) return null;
    const [sentinel, filename, opCode, ts] = parts;
    return {
        sentinel,
        filename,
        filenameDecoded: decodeFilename(filename),
        operatorCode: opCode,
        operatorName: getOperatorName(opCode),
        timestamp: ts,
        formattedDate: formatPnmTimestamp(ts),
    };
}

export function parseFooter(line: string): ParsedFooter | null {
    if (!line.startsWith('9876543210|')) return null;
    const parts = line.split('|');
    if (parts.length < 4) return null;
    const [sentinel, opCode, ts, countStr] = parts;
    return {
        sentinel,
        operatorCode: opCode,
        operatorName: getOperatorName(opCode),
        timestamp: ts,
        formattedDate: formatPnmTimestamp(ts),
        declaredCount: parseInt(countStr, 10) || 0,
    };
}

function parseTicketCommon(fields: string[]): TicketCommonFields {
    const code = fields[0] ?? '';
    const col2 = fields[1] ?? ''; // Opérateur Origine (rôle variable selon contexte)
    const col3 = fields[2] ?? ''; // Opérateur Destination (rôle variable selon contexte)
    const col4 = fields[3] ?? ''; // OPR (toujours OPR)
    const col5 = fields[4] ?? ''; // OPD/OPA/OPD initial (selon contexte)
    const ts = fields[5] ?? '';
    const msisdn = fields[6] ?? '';
    const hash = fields[7] ?? '';

    const roles = TICKET_COLUMN_ROLES[code];

    return {
        code,
        typeInfo: TICKET_TYPE_MAP[code] ?? { label: `Ticket inconnu (${code})`, abbrev: '???', direction: '—' },
        context: roles?.context ?? 'portage',
        col2Role: roles?.col2Role ?? 'Origine',
        col3Role: roles?.col3Role ?? 'Destination',
        col5Label: roles?.col5Label ?? 'OPD',
        opr: col2,
        oprName: getOperatorName(col2),
        opd: col3,
        opdName: getOperatorName(col3),
        opa: col4,
        opaName: getOperatorName(col4),
        opx: col5,
        opxName: getOperatorName(col5),
        timestamp: ts,
        formattedDate: formatPnmTimestamp(ts),
        msisdn,
        hash,
    };
}

function parseTicketSpecific(code: string, fields: string[]): TicketSpecificFields {
    // fields starts at index 8 (after common fields)
    const extra = fields.slice(8);
    const result: TicketSpecificFields = {};

    switch (code) {
        case '1110': // DP
            if (extra[0]) result['Séquence'] = extra[0];
            if (extra[1]) result['RIO'] = extra[1];
            if (extra[2]) result['Date envoi'] = formatPnmTimestamp(extra[2]);
            if (extra[3]) result['Date portage'] = formatPnmTimestamp(extra[3]);
            if (extra[6]) result['Code postal'] = extra[6];
            if (extra[7]) result['Date souscription'] = formatPnmTimestamp(extra[7]);
            break;
        case '1120': // DE — demande portage personne morale
            if (extra[0]) result['Séquence'] = extra[0];
            if (extra[1]) result['RIO'] = extra[1];
            if (extra[2]) result['Date envoi'] = formatPnmTimestamp(extra[2]);
            if (extra[3]) result['Date portage'] = formatPnmTimestamp(extra[3]);
            break;
        case '1210': // RP+
            if (extra[0]) result['Séquence'] = extra[0];
            if (extra[1]) result['Code réponse'] = extra[1];
            if (extra[1] && RESPONSE_CODE_MAP[extra[1]]) result['Libellé réponse'] = RESPONSE_CODE_MAP[extra[1]];
            if (extra[2]) result['Date réponse'] = formatPnmTimestamp(extra[2]);
            break;
        case '1220': // RP-
            if (extra[0]) result['Séquence'] = extra[0];
            if (extra[1]) result['Code refus'] = extra[1];
            if (extra[1] && RESPONSE_CODE_MAP[extra[1]]) result['Libellé refus'] = RESPONSE_CODE_MAP[extra[1]];
            if (extra[2]) result['Date refus'] = formatPnmTimestamp(extra[2]);
            if (extra[4]) result['Motif refus'] = extra[4];
            break;
        case '1410': // EP — envoi données de portage
            if (extra[0]) result['Séquence'] = extra[0];
            if (extra[1]) result['Date envoi'] = formatPnmTimestamp(extra[1]);
            if (extra[2]) result['Date portage'] = formatPnmTimestamp(extra[2]);
            break;
        case '1430': // CP
            if (extra[0]) result['Séquence'] = extra[0];
            if (extra[1]) result['Date confirmation'] = formatPnmTimestamp(extra[1]);
            if (extra[2]) result['Date effectif'] = formatPnmTimestamp(extra[2]);
            break;
        case '1510': // AP — annulation OPR
        case '1520': // AN — annulation OPD
            if (extra[0]) result['Séquence'] = extra[0];
            if (extra[1]) result['Date annulation'] = formatPnmTimestamp(extra[1]);
            break;
        case '1530': // CA — confirmation annulation
            if (extra[0]) result['Séquence'] = extra[0];
            if (extra[1]) result['Date confirmation'] = formatPnmTimestamp(extra[1]);
            break;
        case '2400': // BI — bon accord portage inverse
            if (extra[0]) result['Séquence'] = extra[0];
            if (extra[1]) result['Date accord'] = formatPnmTimestamp(extra[1]);
            break;
        case '2410': // PI — envoi données portage inverse
            if (extra[0]) result['Séquence'] = extra[0];
            if (extra[1]) result['Date envoi'] = formatPnmTimestamp(extra[1]);
            if (extra[2]) result['Date portage'] = formatPnmTimestamp(extra[2]);
            break;
        case '2420': // DI — confirmation prise en compte portage inverse
            if (extra[0]) result['Séquence'] = extra[0];
            if (extra[1]) result['Date prise en compte'] = formatPnmTimestamp(extra[1]);
            if (extra[2]) result['Date portage'] = formatPnmTimestamp(extra[2]);
            break;
        case '2430': // CI — confirmation portage inverse
            if (extra[0]) result['Séquence'] = extra[0];
            if (extra[1]) result['Date confirmation'] = formatPnmTimestamp(extra[1]);
            if (extra[2]) result['Date effectif'] = formatPnmTimestamp(extra[2]);
            break;
        case '3400': // BR — bon accord restitution
            if (extra[0]) result['Séquence'] = extra[0];
            if (extra[1]) result['Date restitution'] = formatPnmTimestamp(extra[1]);
            if (extra[2]) result['Date cible'] = formatPnmTimestamp(extra[2]);
            if (extra[3]) result['Hash portage'] = extra[3];
            break;
        case '3410': // RN — envoi données restitution
            if (extra[0]) result['Séquence'] = extra[0];
            if (extra[1]) result['Date envoi'] = formatPnmTimestamp(extra[1]);
            if (extra[2]) result['Date restitution'] = formatPnmTimestamp(extra[2]);
            break;
        case '3420': // RS — prise en compte restitution
            if (extra[0]) result['Séquence'] = extra[0];
            if (extra[1]) result['Date prise en compte'] = formatPnmTimestamp(extra[1]);
            if (extra[2]) result['Date effectif'] = formatPnmTimestamp(extra[2]);
            break;
        case '3430': // CS — confirmation mise à jour opérateurs
            if (extra[0]) result['Séquence'] = extra[0];
            if (extra[1]) result['Date sync'] = formatPnmTimestamp(extra[1]);
            if (extra[2]) result['Date cible'] = formatPnmTimestamp(extra[2]);
            break;
        default: {
            // Format variable → rawExtra
            const raw = extra.filter(Boolean).join(' | ');
            if (raw) result['Données supplémentaires'] = raw;
            break;
        }
    }

    return result;
}

export function analyzeFileContent(content: string, importedFilename?: string): FileAnalysisResult {
    const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
    const issues: ValidationIssue[] = [];

    if (lines.length === 0) {
        issues.push({ severity: 'error', message: 'Le contenu est vide.' });
        return { header: null, footer: null, tickets: [], ticketSummary: [], uniqueMsisdns: [], operatorsInvolved: [], issues };
    }

    // Parse header (first line)
    const header = parseHeader(lines[0]);
    if (!header) {
        issues.push({ severity: 'warning', message: `En-tête non reconnu (sentinelle 0123456789 attendue). Ligne : "${lines[0].slice(0, 60)}…"` });
    }

    // Parse footer (last line)
    const footer = lines.length > 1 ? parseFooter(lines[lines.length - 1]) : null;
    if (!footer && lines.length > 1) {
        issues.push({ severity: 'warning', message: `Pied de page non reconnu (sentinelle 9876543210 attendue). Ligne : "${lines[lines.length - 1].slice(0, 60)}…"` });
    }

    // ── Validate: imported filename vs header filename ──
    if (importedFilename && header) {
        const cleanImported = importedFilename.replace(/^.*[\\/]/, ''); // strip path
        const headerFilename = header.filename;
        if (cleanImported !== headerFilename) {
            issues.push({
                severity: 'error',
                message: `Nom du fichier importé « ${cleanImported} » ≠ nom déclaré dans l'en-tête « ${headerFilename} ».`,
                type: 'filename_mismatch',
                details: {
                    importedFilename: cleanImported,
                    headerFilename,
                },
            });
        }
    }

    // ── Validate: header timestamp ≤ footer timestamp ──
    if (header && footer && header.timestamp && footer.timestamp) {
        if (header.timestamp > footer.timestamp) {
            issues.push({
                severity: 'warning',
                message: `Timestamp en-tête (${formatPnmTimestamp(header.timestamp)}) postérieur au timestamp pied de page (${formatPnmTimestamp(footer.timestamp)}).`,
                type: 'timestamp_order',
                details: {
                    headerTimestamp: header.timestamp,
                    headerFormatted: formatPnmTimestamp(header.timestamp),
                    footerTimestamp: footer.timestamp,
                    footerFormatted: formatPnmTimestamp(footer.timestamp),
                },
            });
        }
    }

    // Parse tickets (lines between header and footer)
    const ticketLines = lines.slice(
        header ? 1 : 0,
        footer ? lines.length - 1 : lines.length,
    );

    const tickets: ParsedTicket[] = [];
    const MD5_REGEX = /^[0-9a-f]{32}$/;
    for (let i = 0; i < ticketLines.length; i++) {
        const raw = ticketLines[i];
        const fields = raw.split('|').map((f) => f.trim());
        const lineNum = (header ? 2 : 1) + i;

        if (fields.length < 2) {
            issues.push({ severity: 'warning', message: `Ligne ${lineNum} : format non reconnu (moins de 2 champs).`, lineNumber: lineNum, type: 'format' });
            continue;
        }

        const common = parseTicketCommon(fields);
        const specific = parseTicketSpecific(common.code, fields);

        if (!TICKET_TYPE_MAP[common.code]) {
            issues.push({ severity: 'info', message: `Ligne ${lineNum} : code ticket inconnu "${common.code}".`, lineNumber: lineNum, type: 'unknown_code' });
        }

        // ── Validate: MD5 hash format ──
        if (common.hash && !MD5_REGEX.test(common.hash)) {
            issues.push({
                severity: 'error',
                message: `Ligne ${lineNum} (${common.typeInfo.abbrev}) : hash MD5 invalide « ${common.hash} » — attendu 32 caractères hexadécimaux [0-9a-f].`,
                lineNumber: lineNum,
                type: 'bad_hash',
                details: { hash: common.hash, msisdn: common.msisdn },
            });
        }

        // Validate: col3 (Opérateur Destination) must match the file's destination operator
        // extracted from the header filename (PNMDATA.SOURCE.DEST.timestamp.seq)
        // Exception: col3 = '00' means broadcast to all operators
        if (header?.filenameDecoded.valid && header.filenameDecoded.destOperator) {
            const fileDestOp = header.filenameDecoded.destOperator;
            const ticketCol3 = common.opd; // col3 = Opérateur Destination du ticket
            if (ticketCol3 !== '00' && ticketCol3 !== fileDestOp) {
                const roles = TICKET_COLUMN_ROLES[common.code];
                const col3Label = roles?.col3Role ?? 'Destination';
                issues.push({
                    severity: 'warning',
                    message: `Ligne ${lineNum} (${common.typeInfo.abbrev}) : col. 3 « ${col3Label} » = ${getOperatorName(ticketCol3)} (${ticketCol3}) ≠ destinataire fichier ${getOperatorName(fileDestOp)} (${fileDestOp}).`,
                    lineNumber: lineNum,
                    type: 'col3_mismatch',
                    details: {
                        ticketCode: common.code,
                        ticketAbbrev: common.typeInfo.abbrev,
                        col3Role: col3Label,
                        col3Value: ticketCol3,
                        col3Name: getOperatorName(ticketCol3),
                        expectedValue: fileDestOp,
                        expectedName: getOperatorName(fileDestOp),
                        msisdn: common.msisdn,
                    },
                });
            }
        }

        tickets.push({
            lineNumber: lineNum,
            raw,
            common,
            specific,
        });
    }

    // ── Validate: duplicate sequence numbers ──
    const seqMap = new Map<string, number[]>(); // sequence → line numbers
    for (const t of tickets) {
        const seq = t.specific['Séquence'];
        if (seq) {
            const arr = seqMap.get(seq) ?? [];
            arr.push(t.lineNumber);
            seqMap.set(seq, arr);
        }
    }
    for (const [seq, lineNums] of seqMap) {
        if (lineNums.length > 1) {
            issues.push({
                severity: 'error',
                message: `N° de séquence « ${seq} » en doublon sur les lignes ${lineNums.join(', ')}.`,
                type: 'duplicate_sequence',
                details: { sequence: seq, lines: lineNums.join(', ') },
            });
            // Tag each involved line
            for (const ln of lineNums) {
                issues.push({
                    severity: 'error',
                    message: `Séquence « ${seq} » dupliquée (aussi en ligne${lineNums.length > 2 ? 's' : ''} ${lineNums.filter((n) => n !== ln).join(', ')}).`,
                    lineNumber: ln,
                    type: 'duplicate_sequence',
                    details: { sequence: seq, lines: lineNums.join(', ') },
                });
            }
        }
    }

    // ── Validate: duplicate tickets (same code + MSISDN + hash) ──
    const ticketSigMap = new Map<string, number[]>(); // signature → line numbers
    for (const t of tickets) {
        if (t.common.msisdn && t.common.hash) {
            const sig = `${t.common.code}|${t.common.msisdn}|${t.common.hash}`;
            const arr = ticketSigMap.get(sig) ?? [];
            arr.push(t.lineNumber);
            ticketSigMap.set(sig, arr);
        }
    }
    for (const [sig, lineNums] of ticketSigMap) {
        if (lineNums.length > 1) {
            const [code, msisdn] = sig.split('|');
            const abbrev = TICKET_TYPE_MAP[code]?.abbrev ?? code;
            issues.push({
                severity: 'warning',
                message: `Ticket en doublon (${abbrev}, MSISDN ${msisdn}) sur les lignes ${lineNums.join(', ')}.`,
                type: 'duplicate_ticket',
                details: { code, abbrev, msisdn, lines: lineNums.join(', ') },
            });
            for (const ln of lineNums) {
                issues.push({
                    severity: 'warning',
                    message: `Doublon détecté — même ${abbrev} pour ${msisdn} (aussi ligne${lineNums.length > 2 ? 's' : ''} ${lineNums.filter((n) => n !== ln).join(', ')}).`,
                    lineNumber: ln,
                    type: 'duplicate_ticket',
                    details: { code, abbrev, msisdn, lines: lineNums.join(', ') },
                });
            }
        }
    }

    // Validate footer count
    // The footer declares total lines (tickets + header + footer = tickets + 2)
    if (footer) {
        const actualCount = tickets.length;
        const expectedTickets = footer.declaredCount - 2; // subtract header + footer
        if (expectedTickets !== actualCount) {
            issues.push({
                severity: 'error',
                message: `Compteur pied de page (${footer.declaredCount} lignes = ${expectedTickets} tickets attendus) ≠ nombre réel de tickets (${actualCount}).`,
                type: 'count_mismatch',
            });
        }
    }

    // Build summary
    const countByCode: Record<string, number> = {};
    const msisdnSet = new Set<string>();
    const operatorSet = new Set<string>();

    for (const t of tickets) {
        const c = t.common.code;
        countByCode[c] = (countByCode[c] ?? 0) + 1;
        if (t.common.msisdn) msisdnSet.add(t.common.msisdn);
        if (t.common.oprName) operatorSet.add(t.common.oprName);
        if (t.common.opdName) operatorSet.add(t.common.opdName);
    }

    const ticketSummary: TicketSummary[] = Object.entries(countByCode)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([code, count]) => {
            const info = TICKET_TYPE_MAP[code] ?? { label: `Inconnu (${code})`, abbrev: '???' };
            return { code, label: info.label, abbrev: info.abbrev, count };
        });

    return {
        header,
        footer,
        tickets,
        ticketSummary,
        uniqueMsisdns: [...msisdnSet].sort(),
        operatorsInvolved: [...operatorSet].sort(),
        issues,
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
// ─── V6 — Analyseur d'incidents PNM (emails DIGICEL.PORTA-V3) ───────────────

export const ERROR_CODE_MAP = ERROR_CODE_LABELS;

export type IncidentTicket = {
    raw: string;
    code: string;
    codeLabel: string;
    opr: string;
    oprName: string;
    opd: string;
    opdName: string;
    opa: string;
    opaName: string;
    opx: string;
    opxName: string;
    msisdn: string;
    hash: string;
    timestamp: string;
    formattedDate: string;
    sequence: string;
    responseCode: string;
    responseCodeLabel: string;
    errorCode: string;
    errorCodeLabel: string;
    description: string;
};

export type IncidentFileError = {
    type: 'file_error';
    filename: string;
    filenameParsed: FilenameResult;
    errorCount: number;
    refusalCount: number;
    tickets: IncidentTicket[];
};

export type IncidentArNonRecu = {
    type: 'ar_non_recu';
    filename: string;
    filenameParsed: FilenameResult;
    senderCode: string;
    senderName: string;
    delayMinutes: number;
};

export type IncidentFileNotAck = {
    type: 'file_not_ack';
    filename: string;
    filenameParsed: FilenameResult;
    recipientCode: string;
    recipientName: string;
    errorTicket: IncidentTicket | null;
};

export type ParsedIncident = IncidentFileError | IncidentArNonRecu | IncidentFileNotAck;

export type ParsedIncidentEmail = {
    incidents: ParsedIncident[];
    totalCount: number;
    summary: {
        fileErrors: number;
        refusals: number;
        arNonRecu: number;
        fileNotAck: number;
    };
    operatorsInvolved: string[];
    msisdnsConcerned: string[];
};

function extractTicketStrings(text: string): string[] {
    const results: string[] = [];
    const startPattern = /\[\d{4},/g;
    let match;

    while ((match = startPattern.exec(text)) !== null) {
        const startIdx = match.index;
        let depth = 0;
        let endIdx = -1;

        for (let i = startIdx; i < text.length; i++) {
            if (text[i] === '[') depth++;
            if (text[i] === ']') {
                depth--;
                if (depth === 0) {
                    endIdx = i;
                    break;
                }
            }
        }

        if (endIdx > startIdx) {
            const full = text.substring(startIdx, endIdx + 1);
            const content = text.substring(startIdx + 1, endIdx);
            results.push(content + '|||' + full);
        }
    }

    return results;
}

function parseIncidentTicket(contentAndRaw: string): IncidentTicket {
    const [content, raw] = contentAndRaw.split('|||');
    const fields = content.split(',').map((f) => f.trim());
    const code = fields[0] ?? '';

    const ticket: IncidentTicket = {
        raw: raw ?? content,
        code,
        codeLabel: TICKET_TYPE_MAP[code]?.label ?? `Ticket inconnu (${code})`,
        opr: '', oprName: '',
        opd: '', opdName: '',
        opa: '', opaName: '',
        opx: '', opxName: '',
        msisdn: '',
        hash: '',
        timestamp: '', formattedDate: '',
        sequence: '',
        responseCode: '', responseCodeLabel: '',
        errorCode: '', errorCodeLabel: '',
        description: '',
    };

    if (code === '1220' || code === '1210') {
        // [code, opr, opd, opa, opx, ts, msisdn, hash, seq, respCode, respTs, , desc...]
        ticket.opr = fields[1] ?? '';
        ticket.oprName = getOperatorName(ticket.opr);
        ticket.opd = fields[2] ?? '';
        ticket.opdName = getOperatorName(ticket.opd);
        ticket.opa = fields[3] ?? '';
        ticket.opaName = getOperatorName(ticket.opa);
        ticket.opx = fields[4] ?? '';
        ticket.opxName = getOperatorName(ticket.opx);
        ticket.timestamp = fields[5] ?? '';
        ticket.formattedDate = formatPnmTimestamp(ticket.timestamp);
        ticket.msisdn = fields[6] ?? '';
        ticket.hash = fields[7] ?? '';
        ticket.sequence = fields[8] ?? '';
        ticket.responseCode = fields[9] ?? '';
        ticket.responseCodeLabel = RESPONSE_CODE_MAP[ticket.responseCode] ?? '';
        ticket.description = fields.slice(12).map((f) => f.trim()).filter(Boolean).join(', ');
    } else if (code === '7000') {
        // [code, opr, opd, opa, opx, msisdn, hash, errCode, ??, ts, hash2, relCode, desc...]
        ticket.opr = fields[1] ?? '';
        ticket.oprName = getOperatorName(ticket.opr);
        ticket.opd = fields[2] ?? '';
        ticket.opdName = getOperatorName(ticket.opd);
        ticket.opa = fields[3] ?? '';
        ticket.opaName = getOperatorName(ticket.opa);
        ticket.opx = fields[4] ?? '';
        ticket.opxName = getOperatorName(ticket.opx);
        ticket.msisdn = fields[5] ?? '';
        ticket.hash = fields[6] ?? '';
        ticket.errorCode = fields[7] ?? '';
        ticket.errorCodeLabel = ERROR_CODE_MAP[ticket.errorCode] ?? '';
        ticket.timestamp = fields[9] ?? '';
        ticket.formattedDate = formatPnmTimestamp(ticket.timestamp);
        const desc = fields.slice(12).join(',').trim();
        ticket.description = desc.replace(/^\[/, '').replace(/\]$/, '');
    } else if (code === '0000') {
        // [code, opr, opd, ts, errCode, seq, desc...]
        ticket.opr = fields[1] ?? '';
        ticket.oprName = getOperatorName(ticket.opr);
        ticket.opd = fields[2] ?? '';
        ticket.opdName = getOperatorName(ticket.opd);
        ticket.timestamp = fields[3] ?? '';
        ticket.formattedDate = formatPnmTimestamp(ticket.timestamp);
        ticket.errorCode = fields[4] ?? '';
        ticket.errorCodeLabel = ERROR_CODE_MAP[ticket.errorCode] ?? '';
        ticket.sequence = fields[5] ?? '';
        ticket.description = fields.slice(6).map((f) => f.trim()).filter(Boolean).join(', ');
    } else {
        // Generic: try common format
        ticket.opr = fields[1] ?? '';
        ticket.oprName = getOperatorName(ticket.opr);
        ticket.opd = fields[2] ?? '';
        ticket.opdName = getOperatorName(ticket.opd);
        ticket.description = fields.slice(3).map((f) => f.trim()).filter(Boolean).join(', ');
    }

    return ticket;
}

function parseIncidentBlock(block: string): ParsedIncident | null {
    // Type: file_not_ack (check first — most specific)
    const notAckMatch = block.match(
        /(PNMDATA\.\d{2}\.\d{2}\.\d{14}\.\d{3})\s+n'a pas ete acquite par\s+(\d{2})\s*\(([^)]+)\)/,
    );
    if (notAckMatch) {
        const filename = notAckMatch[1];
        const ticketStrings = extractTicketStrings(block);
        const tickets = ticketStrings.map(parseIncidentTicket);
        return {
            type: 'file_not_ack',
            filename,
            filenameParsed: decodeFilename(filename),
            recipientCode: notAckMatch[2],
            recipientName: notAckMatch[3],
            errorTicket: tickets.length > 0 ? tickets[0] : null,
        };
    }

    // Type: ar_non_recu
    const arMatch = block.match(
        /AR non-recu\s*:\s*(PNMDATA\.\d{2}\.\d{2}\.\d{14}\.\d{3})\s+envoye depuis plus de\s+(\d+)\s+minutes?\s+par\s+(\d{2})\s*\(([^)]+)\)/,
    );
    if (arMatch) {
        return {
            type: 'ar_non_recu',
            filename: arMatch[1],
            filenameParsed: decodeFilename(arMatch[1]),
            senderCode: arMatch[3],
            senderName: arMatch[4],
            delayMinutes: parseInt(arMatch[2]),
        };
    }

    // Type: file_error
    const fileErrorMatch = block.match(
        /dans le fichier\s+(PNMDATA\.\d{2}\.\d{2}\.\d{14}\.\d{3})/,
    );
    if (fileErrorMatch) {
        const filename = fileErrorMatch[1];
        const errorCountMatch = block.match(/(\d+)\s+erreur\(s\)\s+\(7000\)/);
        const refusalCountMatch = block.match(/(\d+)\s+refu\(s\)\s+\(1210\/1220\)/);
        const errorCount = errorCountMatch ? parseInt(errorCountMatch[1]) : 0;
        const refusalCount = refusalCountMatch ? parseInt(refusalCountMatch[1]) : 0;
        const ticketStrings = extractTicketStrings(block);
        const tickets = ticketStrings.map(parseIncidentTicket);

        return {
            type: 'file_error',
            filename,
            filenameParsed: decodeFilename(filename),
            errorCount,
            refusalCount,
            tickets,
        };
    }

    return null;
}

function normalizeIncidentText(text: string): string {
    return text
        .replace(/[\u2013\u2014]/g, '-')   // en-dash / em-dash → hyphen
        .replace(/[\u2018\u2019\u201A]/g, "'") // smart quotes → apostrophe
        .replace(/[\u201C\u201D\u201E]/g, '"') // smart double quotes
        .replace(/\u00A0/g, ' ')              // non-breaking space → space
        .replace(/\r\n/g, '\n')               // normalize line endings
        .replace(/\r/g, '\n');
}

export function parseIncidentEmail(text: string): ParsedIncidentEmail {
    // Normalize Unicode variants (en-dashes, smart quotes, etc.)
    text = normalizeIncidentText(text);

    // Split text into incident blocks by "N - " at line start (allow leading whitespace)
    const blockStarts: number[] = [];
    const pattern = /^\s*(\d+)\s*-\s+/gm;
    let m;
    while ((m = pattern.exec(text)) !== null) {
        blockStarts.push(m.index);
    }

    const blocks: string[] = [];
    for (let i = 0; i < blockStarts.length; i++) {
        const start = blockStarts[i];
        const end = i + 1 < blockStarts.length ? blockStarts[i + 1] : text.length;
        blocks.push(text.substring(start, end));
    }

    const incidents: ParsedIncident[] = [];
    for (const block of blocks) {
        const incident = parseIncidentBlock(block);
        if (incident) incidents.push(incident);
    }

    // Build summary
    let fileErrors = 0;
    let refusals = 0;
    let arNonRecu = 0;
    let fileNotAck = 0;
    const operatorSet = new Set<string>();
    const msisdnSet = new Set<string>();

    for (const inc of incidents) {
        if (inc.type === 'file_error') {
            fileErrors += inc.errorCount;
            refusals += inc.refusalCount;
            if (inc.filenameParsed.valid) {
                operatorSet.add(inc.filenameParsed.sourceOperatorName);
                operatorSet.add(inc.filenameParsed.destOperatorName);
            }
            for (const t of inc.tickets) {
                if (t.msisdn) msisdnSet.add(t.msisdn);
                if (t.oprName && t.oprName !== 'Inconnu ()') operatorSet.add(t.oprName);
                if (t.opdName && t.opdName !== 'Inconnu ()') operatorSet.add(t.opdName);
            }
        } else if (inc.type === 'ar_non_recu') {
            arNonRecu++;
            operatorSet.add(inc.senderName);
            if (inc.filenameParsed.valid) {
                operatorSet.add(inc.filenameParsed.destOperatorName);
            }
        } else if (inc.type === 'file_not_ack') {
            fileNotAck++;
            operatorSet.add(inc.recipientName);
            if (inc.filenameParsed.valid) {
                operatorSet.add(inc.filenameParsed.sourceOperatorName);
            }
        }
    }

    return {
        incidents,
        totalCount: incidents.length,
        summary: { fileErrors, refusals, arNonRecu, fileNotAck },
        operatorsInvolved: [...operatorSet].sort(),
        msisdnsConcerned: [...msisdnSet].sort(),
    };
}

// ─── Timeline de portage ─────────────────────────────────────────────────────

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
