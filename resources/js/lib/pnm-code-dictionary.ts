// ─── Dictionnaire complet des codes PNM (réponses, refus, erreurs) ───────────
// Source : Spécification PNM V3 GPMAG + retours terrain PORTA Digicel

export type CodeSeverity = 'info' | 'warning' | 'error' | 'critical';

export type CodeCategory =
    | 'accord'
    | 'refus_rio'
    | 'refus_numero'
    | 'refus_technique'
    | 'refus_delai'
    | 'refus_statut'
    | 'erreur_technique'
    | 'erreur_fichier'
    | 'erreur_ar';

export type PnmCodeEntry = {
    code: string;
    label: string;
    description: string;
    category: CodeCategory;
    severity: CodeSeverity;
    action: string;
};

// ═══════════════════════════════════════════════════════════════════════
// Codes réponse — tickets 1210 (RP+) / 1220 (RP-)
// ═══════════════════════════════════════════════════════════════════════

const RESPONSE_CODES: PnmCodeEntry[] = [
    // ── Accord ──
    {
        code: 'A001',
        label: 'Accord de portage',
        description: "L'opérateur donneur accepte la demande de portabilité. Le portage suivra son cours normal.",
        category: 'accord',
        severity: 'info',
        action: 'Aucune action requise. Vérifier que le portage suit le calendrier prévu.',
    },

    // ── R1xx — Refus liés au RIO ──
    {
        code: 'R101',
        label: 'RIO non communiqué',
        description: "Le RIO (Relevé d'Identité Opérateur) n'a pas été fourni dans la demande de portage.",
        category: 'refus_rio',
        severity: 'warning',
        action: 'Demander au client de fournir son RIO (appeler 3179 depuis la ligne concernée ou contacter son opérateur).',
    },
    {
        code: 'R102',
        label: 'RIO non conforme',
        description: "Le format du RIO est incorrect (nombre de caractères, checksum invalide).",
        category: 'refus_rio',
        severity: 'warning',
        action: "Vérifier le RIO via l'outil Vérifier/RIO Validator. Demander au client un nouveau RIO.",
    },
    {
        code: 'R103',
        label: 'RIO incorrect',
        description: "Le RIO fourni ne correspond pas au numéro de téléphone ou à l'opérateur donneur.",
        category: 'refus_rio',
        severity: 'warning',
        action: "Vérifier la correspondance RIO/MSISDN via l'outil Vérifier/RIO. Le client a peut-être fourni le RIO d'une autre ligne.",
    },
    {
        code: 'R123',
        label: 'RIO invalide ou expiré',
        description: "Le RIO est expiré (validité dépassée) ou ne correspond plus au numéro (changement d'opérateur intermédiaire).",
        category: 'refus_rio',
        severity: 'warning',
        action: 'Demander au client de générer un nouveau RIO à jour (3179). Relancer la demande avec le nouveau RIO.',
    },

    // ── R2xx — Refus liés au numéro / abonné ──
    {
        code: 'R201',
        label: "Numéro non attribué à l'opérateur",
        description: "Le MSISDN n'est pas reconnu comme attribué à l'opérateur donneur déclaré dans la demande.",
        category: 'refus_numero',
        severity: 'error',
        action: "Vérifier le MSISDN et l'opérateur donneur. Le numéro a peut-être déjà été porté vers un autre opérateur.",
    },
    {
        code: 'R202',
        label: 'Numéro non éligible (engagement en cours)',
        description: "Le numéro est encore sous engagement contractuel auprès de l'opérateur donneur.",
        category: 'refus_numero',
        severity: 'warning',
        action: "Informer le client de son engagement en cours. Le client peut demander à son opérateur la date de fin d'engagement. Le portage reste possible moyennant frais de résiliation anticipée.",
    },
    {
        code: 'R203',
        label: 'Demande en cours sur ce numéro',
        description: "Une autre demande de portage est déjà en cours de traitement pour ce MSISDN.",
        category: 'refus_numero',
        severity: 'warning',
        action: "Vérifier dans PortaWs s'il existe un portage en cours. Attendre la résolution du portage existant ou l'annuler avant de relancer.",
    },
    {
        code: 'R204',
        label: 'Numéro déjà porté',
        description: "Le numéro a déjà fait l'objet d'un portage récent et le délai minimum entre deux portages n'est pas respecté.",
        category: 'refus_numero',
        severity: 'warning',
        action: 'Vérifier la date du dernier portage. Attendre le délai réglementaire avant de relancer.',
    },
    {
        code: 'R205',
        label: 'Numéro en instance de résiliation',
        description: "Une demande de résiliation est en cours chez l'opérateur donneur pour ce numéro.",
        category: 'refus_numero',
        severity: 'error',
        action: "Le client doit annuler sa demande de résiliation auprès de son opérateur avant de demander le portage. Le portage prime sur la résiliation si la demande est antérieure.",
    },
    {
        code: 'R206',
        label: 'Numéro en cours de migration interne',
        description: "Le numéro fait l'objet d'une migration interne (changement d'offre, changement de réseau) chez l'opérateur donneur.",
        category: 'refus_numero',
        severity: 'warning',
        action: 'Attendre la fin de la migration interne. Relancer la demande de portage une fois la migration terminée.',
    },
    {
        code: 'R221',
        label: "Numéro hors département d'attribution",
        description: "Le MSISDN est attribué à un département (Martinique, Guadeloupe, Guyane) différent de celui de l'opérateur receveur. Le portage inter-département n'est pas autorisé.",
        category: 'refus_numero',
        severity: 'error',
        action: "Vérifier le préfixe du MSISDN et le département d'attribution (0690/0694 = Martinique+Guadeloupe, 0694 = aussi Guyane). Informer le client que le portage n'est pas possible entre départements.",
    },

    // ── R3xx — Refus liés aux données techniques ──
    {
        code: 'R301',
        label: 'Données incohérentes',
        description: "Les données du dossier de portage sont incohérentes (ex: opérateur donneur ≠ opérateur qui détient le numéro).",
        category: 'refus_technique',
        severity: 'error',
        action: "Vérifier toutes les données du dossier : MSISDN, opérateur donneur, RIO. Corriger les incohérences et relancer.",
    },
    {
        code: 'R302',
        label: 'Format de données invalide',
        description: "Le format d'un ou plusieurs champs du dossier ne respecte pas la spécification PNM V3.",
        category: 'refus_technique',
        severity: 'error',
        action: "Vérifier le format des données : MSISDN (10 chiffres, commence par 06), hash MD5 (32 hex), timestamps (14 chiffres). Corriger et relancer.",
    },
    {
        code: 'R303',
        label: 'Date de portage invalide',
        description: "La date de portage demandée est invalide (jour non ouvré, férié, ou hors délai réglementaire).",
        category: 'refus_technique',
        severity: 'warning',
        action: "Vérifier que la date demandée est un jour ouvré, hors jours fériés GPMAG. Utiliser l'outil Vérifier/Dates PNM pour calculer la bonne date.",
    },
    {
        code: 'R304',
        label: 'Identifiant de portage invalide',
        description: "Le hash MD5 identifiant le portage est invalide ou ne correspond pas au dossier.",
        category: 'refus_technique',
        severity: 'error',
        action: "Vérifier le hash via l'outil Vérifier/ID Portage. Doit être 32 caractères hexadécimaux (a-f, 0-9).",
    },
    {
        code: 'R322',
        label: 'Résiliation effective hors demande de portabilité',
        description: "Le numéro a été résilié indépendamment de la demande de portage. La résiliation est effective et le numéro n'est plus actif chez l'opérateur donneur.",
        category: 'refus_statut',
        severity: 'error',
        action: "Informer le commercial et le client. Le numéro est résilié, le portage n'est plus possible. Le client devra souscrire un nouveau numéro ou contacter son ancien opérateur pour réactivation.",
    },

    // ── R4xx — Refus liés aux délais ──
    {
        code: 'R401',
        label: "Délai de réponse opérateur donneur dépassé",
        description: "L'opérateur donneur n'a pas répondu dans le délai réglementaire (1 jour ouvré pour un simple portage).",
        category: 'refus_delai',
        severity: 'warning',
        action: "Contacter l'opérateur donneur pour relancer. Si récurrent, signaler au GPMAG.",
    },
    {
        code: 'R402',
        label: 'Délai de portage dépassé',
        description: "Le portage n'a pas été effectué dans le délai prévu après l'accord.",
        category: 'refus_delai',
        severity: 'error',
        action: "Investiguer la cause du retard. Contacter l'opérateur donneur. Si nécessaire, relancer une nouvelle demande.",
    },

    // ── R5xx — Refus liés au statut du numéro ──
    {
        code: 'R501',
        label: 'Numéro en cours de suspension',
        description: "Le numéro est temporairement suspendu (impayé, demande du client, opposition).",
        category: 'refus_statut',
        severity: 'warning',
        action: "Le client doit régulariser sa situation auprès de son opérateur (paiement, levée de suspension) avant de demander le portage.",
    },
    {
        code: 'R502',
        label: 'Numéro résilié',
        description: "Le numéro est résilié et n'est plus actif dans le réseau de l'opérateur donneur.",
        category: 'refus_statut',
        severity: 'error',
        action: "Informer le client. Un numéro résilié ne peut pas être porté. Le client peut contacter son ancien opérateur pour une éventuelle réactivation dans le délai de quarantaine.",
    },
    {
        code: 'R503',
        label: 'Numéro en opposition (perdu/volé)',
        description: "Le numéro est déclaré perdu ou volé et fait l'objet d'une opposition.",
        category: 'refus_statut',
        severity: 'critical',
        action: "Le client doit lever l'opposition auprès de son opérateur (déclaration de retrouvaille ou nouvelle SIM) avant de demander le portage.",
    },
];

// ═══════════════════════════════════════════════════════════════════════
// Codes erreur — tickets 7000 / 0000
// ═══════════════════════════════════════════════════════════════════════

const ERROR_CODES: PnmCodeEntry[] = [
    {
        code: 'E011',
        label: 'AR non-reçu',
        description: "L'accusé de réception du fichier PNMDATA n'a pas été reçu dans les 60 minutes suivant l'envoi.",
        category: 'erreur_ar',
        severity: 'error',
        action: "Vérifier la connectivité avec l'opérateur. Contacter l'opérateur pour confirmer la réception. Si récurrent, signaler au GPMAG.",
    },
    {
        code: 'E205',
        label: 'Champ obligatoire non renseigné',
        description: "Un champ obligatoire est manquant dans le ticket PNMDATA (MSISDN, opérateur, hash, etc.).",
        category: 'erreur_fichier',
        severity: 'error',
        action: "Analyser le ticket via le décodeur PNMDATA pour identifier le champ manquant. Corriger les données dans PORTA et renvoyer.",
    },
    {
        code: 'E601',
        label: 'Code ticket inconnu',
        description: "Le code de ticket dans le fichier PNMDATA ne correspond à aucun code valide de la spécification PNM V3.",
        category: 'erreur_fichier',
        severity: 'error',
        action: "Vérifier le fichier PNMDATA via le décodeur. Signaler à l'opérateur émetteur du fichier.",
    },
    {
        code: 'E602',
        label: 'Format de fichier invalide',
        description: "Le fichier PNMDATA ne respecte pas le format attendu (en-tête/pied de page invalide, séparateurs incorrects).",
        category: 'erreur_fichier',
        severity: 'error',
        action: "Analyser le fichier via le décodeur PNMDATA. Vérifier la conformité de l'en-tête et du pied de page. Contacter l'opérateur émetteur.",
    },
    {
        code: 'E603',
        label: 'Numéro de séquence invalide',
        description: "Le numéro de séquence d'un ticket est invalide (doublon, hors plage, non numérique).",
        category: 'erreur_fichier',
        severity: 'warning',
        action: "Vérifier les séquences dans le fichier via le décodeur PNMDATA. Si doublon, signaler à l'opérateur émetteur.",
    },
    {
        code: 'E604',
        label: 'Opérateur source invalide',
        description: "Le code opérateur source dans le ticket ne correspond pas à l'émetteur déclaré dans l'en-tête du fichier.",
        category: 'erreur_fichier',
        severity: 'error',
        action: "Comparer col.2 du ticket avec le code émetteur de l'en-tête. Signaler l'incohérence à l'opérateur.",
    },
    {
        code: 'E605',
        label: 'Valeur opérateur inattendue',
        description: "Un code opérateur dans le ticket (col.2, col.3 ou col.5) ne correspond à aucun opérateur PNM enregistré (01 à 06).",
        category: 'erreur_fichier',
        severity: 'error',
        action: "Analyser le ticket : vérifier les colonnes opérateur. Les codes valides sont 01 (Orange), 02 (Digicel), 03 (SFR/Outremer), 04 (Dauphin), 05 (UTS), 06 (Free). Contacter l'opérateur émetteur.",
    },
    {
        code: 'E606',
        label: 'Timestamp invalide',
        description: "Le timestamp dans le ticket ne respecte pas le format attendu (YYYYMMDDHHMMSS, 14 chiffres).",
        category: 'erreur_fichier',
        severity: 'warning',
        action: "Vérifier le format du timestamp dans le ticket. Signaler à l'opérateur émetteur.",
    },
    {
        code: 'E607',
        label: 'Hash MD5 invalide',
        description: "L'identifiant de portage (hash MD5) contient des caractères non-hexadécimaux ou n'a pas 32 caractères.",
        category: 'erreur_fichier',
        severity: 'error',
        action: "Vérifier le hash via l'outil Vérifier/ID Portage. Doit être exactement 32 caractères [0-9a-f].",
    },
];

// ═══════════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════════

/** Dictionnaire complet indexé par code */
export const PNM_CODE_DICTIONARY: Record<string, PnmCodeEntry> = {};
for (const entry of [...RESPONSE_CODES, ...ERROR_CODES]) {
    PNM_CODE_DICTIONARY[entry.code] = entry;
}

/** Tous les codes sous forme de tableau */
export const PNM_ALL_CODES: PnmCodeEntry[] = [...RESPONSE_CODES, ...ERROR_CODES];

/** Map simplifiée code → label (backward-compatible avec RESPONSE_CODE_MAP) */
export const RESPONSE_CODE_LABELS: Record<string, string> = {};
for (const entry of RESPONSE_CODES) {
    RESPONSE_CODE_LABELS[entry.code] = entry.label;
}

/** Map simplifiée code → label (backward-compatible avec ERROR_CODE_MAP) */
export const ERROR_CODE_LABELS: Record<string, string> = {};
for (const entry of ERROR_CODES) {
    ERROR_CODE_LABELS[entry.code] = entry.label;
}

/** Catégories avec labels français */
export const CATEGORY_LABELS: Record<CodeCategory, string> = {
    accord: 'Accord',
    refus_rio: 'Refus RIO',
    refus_numero: 'Refus numéro/abonné',
    refus_technique: 'Refus technique',
    refus_delai: 'Refus délai',
    refus_statut: 'Refus statut',
    erreur_technique: 'Erreur technique',
    erreur_fichier: 'Erreur fichier',
    erreur_ar: 'Erreur AR',
};

/** Lookup rapide : renvoie l'entrée complète ou null */
export function lookupCode(code: string): PnmCodeEntry | null {
    return PNM_CODE_DICTIONARY[code] ?? null;
}
