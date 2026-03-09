// ----------------------------------------------------------------------
// SQL Scenarios configuration — grouped by difficulty level
// Each scenario documents a SQL concept with a PNM context
// Structure des tables alignée sur la BDD de production PortaDB
// ----------------------------------------------------------------------

export type SqlScenario = {
  id: string;
  label: string;
  description: string;
  concepts: string[];
  sql: string;
};

export type ScenarioLevel = {
  key: string;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  scenarios: SqlScenario[];
};

// ----------------------------------------------------------------------

export const SCENARIO_LEVELS: Record<string, ScenarioLevel> = {
  debutant: {
    key: 'debutant',
    title: 'Debutant',
    subtitle: 'Les bases de SQL : SELECT, WHERE, ORDER BY, LIMIT',
    color: 'success',
    icon: 'solar:star-bold-duotone',
    scenarios: [
      {
        id: 'deb-01',
        label: 'Tous les operateurs',
        description:
          "SELECT * retourne toutes les colonnes d'une table. La table OPERATEUR contient les operateurs telecoms des Antilles-Guyane (Digicel, Orange, SFR, etc.) avec leur code, nom, statut et coordonnees.",
        concepts: ['SELECT *', 'FROM'],
        sql: 'SELECT * FROM OPERATEUR;',
      },
      {
        id: 'deb-02',
        label: 'Codes ticket',
        description:
          "Au lieu de *, on peut selectionner uniquement les colonnes utiles. C'est plus performant et plus lisible. ORDER BY trie les resultats par code croissant.",
        concepts: ['SELECT colonnes', 'ORDER BY'],
        sql: 'SELECT code, description FROM CODE_TICKET\nORDER BY code;',
      },
      {
        id: 'deb-03',
        label: 'Jours feries 2026',
        description:
          "Les jours feries des 4 DOM (Martinique, Guadeloupe, Saint-Martin, Guyane). Le PNM est suspendu ces jours-la -- aucun portage ne doit etre programme.",
        concepts: ['SELECT *', 'ORDER BY'],
        sql: 'SELECT * FROM FERRYDAY\nORDER BY ferryday;',
      },
      {
        id: 'deb-04',
        label: 'Filtrer avec WHERE',
        description:
          "WHERE filtre les lignes selon une condition. Ici, seuls les MSISDN dont l'operateur actuel est 2 (Digicel). LIMIT restreint le nombre de resultats retournes.",
        concepts: ['WHERE', 'LIMIT'],
        sql: 'SELECT msisdn, operateur_id_actuel\nFROM MSISDN\nWHERE operateur_id_actuel = 2\nLIMIT 20;',
      },
      {
        id: 'deb-05',
        label: 'Trier du plus recent',
        description:
          "ORDER BY date_creation DESC trie du plus recent au plus ancien. Combine avec LIMIT, cela donne les N derniers elements. La colonne nom contient le nom du fichier PNM echange.",
        concepts: ['ORDER BY DESC', 'LIMIT'],
        sql: 'SELECT id, nom, date_creation, type\nFROM FICHIER\nORDER BY date_creation DESC\nLIMIT 10;',
      },
      {
        id: 'deb-06',
        label: 'Compter les lignes',
        description:
          "COUNT(*) compte le nombre total de lignes. Ici, combien de numeros sont enregistres dans la base. C'est une fonction d'agregation.",
        concepts: ['COUNT(*)'],
        sql: 'SELECT COUNT(*) AS total_numeros\nFROM MSISDN;',
      },
      {
        id: 'deb-07',
        label: 'Valeurs uniques',
        description:
          "DISTINCT elimine les doublons. Ici, on obtient la liste des types de fichiers existants (data, sync) sans repetition.",
        concepts: ['DISTINCT'],
        sql: 'SELECT DISTINCT type\nFROM FICHIER\nORDER BY type;',
      },
      {
        id: 'deb-08',
        label: 'Filtres multiples',
        description:
          "AND combine plusieurs conditions : les deux doivent etre vraies. Ici, fichiers de type 'data' crees depuis un mois. BETWEEN definit un intervalle de dates.",
        concepts: ['WHERE AND', 'BETWEEN', 'CURRENT_DATE'],
        sql: "SELECT id, nom, date_creation\nFROM FICHIER\nWHERE type = 'data'\n  AND date_creation BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE\nORDER BY date_creation DESC;",
      },
      {
        id: 'deb-09',
        label: 'Recherche de texte',
        description:
          "LIKE avec % permet la recherche partielle. '%SYNC%' trouve tous les fichiers de synchronisation. Le % remplace n'importe quel nombre de caracteres.",
        concepts: ['LIKE', '%'],
        sql: "SELECT id, nom, date_creation\nFROM FICHIER\nWHERE nom LIKE '%SYNC%'\nORDER BY date_creation DESC\nLIMIT 10;",
      },
      {
        id: 'deb-10',
        label: 'Valeurs dans une liste',
        description:
          "IN remplace plusieurs OR. Au lieu de type = 'data' OR type = 'sync', on ecrit type IN ('data', 'sync'). Plus lisible avec beaucoup de valeurs.",
        concepts: ['IN'],
        sql: "SELECT id, nom, type, date_creation\nFROM FICHIER\nWHERE type IN ('data', 'sync')\nORDER BY date_creation DESC\nLIMIT 15;",
      },
      {
        id: 'deb-11',
        label: 'Chercher les valeurs NULL',
        description:
          "IS NULL trouve les lignes ou une colonne est vide. Attention : on n'ecrit PAS = NULL mais IS NULL. Ici, les numeros sans portage actuel.",
        concepts: ['IS NULL'],
        sql: 'SELECT msisdn, operateur_id_actuel\nFROM MSISDN\nWHERE portage_id_actuel IS NULL\nLIMIT 20;',
      },
      {
        id: 'deb-12',
        label: 'Alias de colonnes',
        description:
          "AS renomme une colonne dans les resultats. Utile pour rendre le resultat plus lisible : 'code' devient 'Code', 'nom' devient 'Nom Operateur', etc.",
        concepts: ['AS alias'],
        sql: 'SELECT code AS "Code", nom AS "Nom Operateur",\n       is_active AS "Actif", email AS "Contact Email"\nFROM OPERATEUR\nORDER BY nom;',
      },
    ],
  },

  intermediaire: {
    key: 'intermediaire',
    title: 'Intermediaire',
    subtitle: 'JOIN, GROUP BY, HAVING, fonctions agregees',
    color: 'warning',
    icon: 'solar:star-shine-bold-duotone',
    scenarios: [
      {
        id: 'int-01',
        label: 'Premier JOIN',
        description:
          "JOIN relie deux tables par une colonne commune. Ici, PORTAGE et ETAT via portage_etat. L'alias 'p' et 'e' raccourcissent les noms de table.",
        concepts: ['JOIN', 'ON', 'alias'],
        sql: "SELECT p.id, p.portage_msisdn, p.portage_date_souhaitee,\n       e.etat_name AS etat\nFROM PORTAGE p\nJOIN ETAT e ON e.id = p.portage_etat\nORDER BY p.portage_date_souhaitee DESC\nLIMIT 20;",
      },
      {
        id: 'int-02',
        label: 'Compter par groupe',
        description:
          "GROUP BY regroupe les lignes ayant la meme valeur, puis COUNT(*) compte chaque groupe. Ici, combien de portages par etat. ORDER BY total DESC montre les plus frequents en premier.",
        concepts: ['GROUP BY', 'COUNT(*)', 'ORDER BY agrege'],
        sql: 'SELECT e.etat_name AS etat, COUNT(*) AS total\nFROM PORTAGE p\nJOIN ETAT e ON e.id = p.portage_etat\nGROUP BY e.etat_name\nORDER BY total DESC;',
      },
      {
        id: 'int-03',
        label: 'Volume quotidien de fichiers',
        description:
          "Combine WHERE (filtre type = 'data') et GROUP BY (regroupe par jour). Montre le volume d'echanges quotidien. Un jour sans fichier peut indiquer un probleme technique.",
        concepts: ['WHERE + GROUP BY', 'cast date'],
        sql: "SELECT date_creation::date AS jour, COUNT(*) AS nb_fichiers\nFROM FICHIER\nWHERE type = 'data'\nGROUP BY date_creation::date\nORDER BY jour DESC;",
      },
      {
        id: 'int-04',
        label: 'TOP motifs de refus',
        description:
          "Le ticket 500 est un refus de portage. Cette requete JOIN DATA et CODE_REPONSE pour classer les motifs du plus frequent au moins frequent.",
        concepts: ['JOIN multiple', 'GROUP BY', 'COUNT'],
        sql: 'SELECT cr.description AS motif, COUNT(*) AS total\nFROM DATA pd\nJOIN CODE_REPONSE cr ON cr.code = pd.code_reponse\nWHERE pd.code_ticket = 500\nGROUP BY cr.description\nORDER BY total DESC;',
      },
      {
        id: 'int-05',
        label: 'Portages sortants par operateur',
        description:
          "Compte les dossiers de portage sortants par operateur donneur. Un nombre eleve peut indiquer un operateur qui perd beaucoup de clients (churn important).",
        concepts: ['GROUP BY', 'COUNT', 'analyse metier'],
        sql: 'SELECT o.nom AS operateur, COUNT(*) AS portages_sortants\nFROM DOSSIER d\nJOIN OPERATEUR o ON o.code = d.operateur_id_donneur\nGROUP BY o.nom\nORDER BY portages_sortants DESC;',
      },
      {
        id: 'int-06',
        label: 'LEFT JOIN : fichiers et ACK',
        description:
          "LEFT JOIN garde TOUTES les lignes de la table de gauche, meme sans correspondance a droite (NULL). Ici, chaque fichier avec son accuse de reception (ACK) s'il existe. La jointure se fait sur le nom du fichier (file_name = nom).",
        concepts: ['LEFT JOIN', 'NULL a droite'],
        sql: "SELECT f.id, f.nom, f.date_creation,\n       a.date AS date_ack\nFROM FICHIER f\nLEFT JOIN ACK a ON a.file_name = f.nom\nWHERE f.type = 'data'\nORDER BY f.date_creation DESC\nLIMIT 20;",
      },
      {
        id: 'int-07',
        label: 'HAVING : filtrer apres GROUP BY',
        description:
          "HAVING filtre APRES le GROUP BY (contrairement a WHERE qui filtre AVANT). Ici, on ne garde que les operateurs ayant plus de 5 portages. HAVING s'utilise avec les fonctions d'agregation.",
        concepts: ['HAVING', 'COUNT > N'],
        sql: 'SELECT o.nom AS operateur, COUNT(*) AS total\nFROM DOSSIER d\nJOIN OPERATEUR o ON o.code = d.operateur_id_donneur\nGROUP BY o.nom\nHAVING COUNT(*) > 5\nORDER BY total DESC;',
      },
      {
        id: 'int-08',
        label: 'Plusieurs agregations',
        description:
          "On peut utiliser plusieurs fonctions d'agregation en meme temps : COUNT, MIN, MAX. Ici, pour chaque etat de portage, on voit le nombre, la date la plus ancienne et la plus recente.",
        concepts: ['COUNT', 'MIN', 'MAX'],
        sql: 'SELECT e.etat_name AS etat,\n       COUNT(*) AS nb_portages,\n       MIN(p.portage_date_souhaitee) AS plus_ancien,\n       MAX(p.portage_date_souhaitee) AS plus_recent\nFROM PORTAGE p\nJOIN ETAT e ON e.id = p.portage_etat\nGROUP BY e.etat_name\nORDER BY nb_portages DESC;',
      },
      {
        id: 'int-09',
        label: "Historique d'etat d'un portage",
        description:
          "Jointure avec PORTAGE pour afficher le MSISDN. La table PORTAGE_HISTORIQUE retrace les changements d'etat. ORDER BY date retrace la chronologie complete.",
        concepts: ['JOIN', 'WHERE subquery', 'historique'],
        sql: "SELECT ph.id, p.portage_msisdn AS msisdn,\n       ph.etat, ph.date, ph.commentaire\nFROM PORTAGE_HISTORIQUE ph\nJOIN PORTAGE p ON p.id = ph.id_portage\nWHERE p.portage_msisdn = (\n  SELECT portage_msisdn FROM PORTAGE LIMIT 1\n)\nORDER BY ph.date;",
      },
      {
        id: 'int-10',
        label: 'Tickets par code et par jour',
        description:
          "Analyse croisee : GROUP BY sur deux colonnes (code_ticket + date). Montre la distribution temporelle des types de tickets. Utile pour detecter des pics d'activite.",
        concepts: ['GROUP BY multiple', 'analyse temporelle'],
        sql: 'SELECT pd.code_ticket, ct.description,\n       pd.date::date AS jour,\n       COUNT(*) AS nb_tickets\nFROM DATA pd\nJOIN CODE_TICKET ct ON ct.code = pd.code_ticket\nGROUP BY pd.code_ticket, ct.description, pd.date::date\nORDER BY jour DESC, nb_tickets DESC\nLIMIT 30;',
      },
      {
        id: 'int-11',
        label: 'Transitions possibles entre etats',
        description:
          "La table TRANSITION definit les changements d'etat autorises. Les colonnes etat_initial et etat_final contiennent les noms d'etat (varchar). On peut joindre ETAT pour obtenir le code associe.",
        concepts: ['JOIN sur varchar', 'machine a etats'],
        sql: 'SELECT t.etat_initial AS de_etat,\n       t.etat_final AS vers_etat,\n       t.code AS code_transition,\n       t.description\nFROM TRANSITION t\nORDER BY t.etat_initial, t.etat_final;',
      },
      {
        id: 'int-12',
        label: 'Tranches numeriques par operateur',
        description:
          "Les tranches MSISDN (0690, 0694, 0696) sont attribuees aux operateurs. Cette requete montre quelle plage de numeros appartient a quel operateur. Utile pour le routage reseau.",
        concepts: ['JOIN', 'ORDER BY multiple'],
        sql: 'SELECT t.debut, t.fin,\n       o.nom AS operateur\nFROM TRANCHE t\nJOIN OPERATEUR o ON o.code = t.operateur_id\nORDER BY t.debut;',
      },
    ],
  },

  investigation: {
    key: 'investigation',
    title: 'Investigation',
    subtitle: "Scenarios reels de detection d'anomalies PNM",
    color: 'error',
    icon: 'solar:shield-warning-bold-duotone',
    scenarios: [
      {
        id: 'inv-01',
        label: 'Fichiers sans accuse de reception (ACK)',
        description:
          "LEFT JOIN + WHERE IS NULL : technique fondamentale pour trouver les elements SANS correspondance. Chaque fichier 'data' envoye doit recevoir un ACK. La jointure se fait par nom de fichier (file_name = nom). S'il manque, le destinataire n'a pas confirme la reception.",
        concepts: ['LEFT JOIN', 'IS NULL', 'detection absence'],
        sql: "SELECT f.id, f.nom, f.date_creation, f.destinataire\nFROM FICHIER f\nLEFT JOIN ACK a ON a.file_name = f.nom\nWHERE a.id IS NULL\n  AND f.type = 'data'\nORDER BY f.date_creation DESC;",
      },
      {
        id: 'inv-02',
        label: 'Portages bloques depuis plus de 5 jours',
        description:
          "Jointures multiples (3 JOINs) pour afficher les noms lisibles des operateurs via opr_e_actuel et opr_e_d_attribution. Un portage en etat 'enCours' depuis plus de 5 jours ouvrables est anormal.",
        concepts: ['JOIN multiple', 'INTERVAL', 'CURRENT_DATE', 'analyse delai'],
        sql: "SELECT p.portage_msisdn, p.portage_date_souhaitee,\n       e.etat_name AS etat,\n       op_orig.nom AS de, op_dest.nom AS vers\nFROM PORTAGE p\nJOIN ETAT e ON e.id = p.portage_etat\nJOIN OPERATEUR op_orig ON op_orig.code = p.opr_e_actuel\nJOIN OPERATEUR op_dest ON op_dest.code = p.opr_e_d_attribution\nWHERE e.etat_name = 'enCours'\n  AND p.portage_date_souhaitee < CURRENT_DATE - INTERVAL '5 days'\nORDER BY p.portage_date_souhaitee;",
      },
      {
        id: 'inv-03',
        label: 'Portage accepte sans confirmation (ticket 600)',
        description:
          "LEFT JOIN avec condition double (id_portage ET code_ticket = 600). Le ticket 600 confirme le portage. S'il manque, le portage est marque 'accepte' sans preuve de confirmation -- risque de routage incorrect.",
        concepts: ['LEFT JOIN condition multiple', 'detection absence specifique'],
        sql: "SELECT p.portage_msisdn, p.portage_date_souhaitee,\n       e.etat_name AS etat\nFROM PORTAGE p\nJOIN ETAT e ON e.id = p.portage_etat\nLEFT JOIN DATA pd ON pd.id_portage = p.id\n  AND pd.code_ticket = 600\nWHERE e.etat_name = 'accepte'\n  AND pd.id IS NULL;",
      },
      {
        id: 'inv-04',
        label: 'Refus pour delai ou format invalide',
        description:
          "IN (10, 20) filtre sur plusieurs codes reponse. 10 = delai trop court, 20 = erreur format. On joint PORTAGE pour recuperer le MSISDN et le RIO du portage concerne.",
        concepts: ['IN', 'JOIN', 'codes metier PNM'],
        sql: 'SELECT p.portage_msisdn, p.portage_rio,\n       cr.description AS motif, pd.date\nFROM DATA pd\nJOIN PORTAGE p ON p.id = pd.id_portage\nJOIN CODE_REPONSE cr ON cr.code = pd.code_reponse\nWHERE pd.code_ticket = 500\n  AND pd.code_reponse IN (10, 20)\nORDER BY pd.date DESC;',
      },
      {
        id: 'inv-05',
        label: 'Conflits de synchronisation SYNC',
        description:
          "Chaque dimanche, les operateurs echangent des fichiers PNMSYNC. Un statut LOCKED signifie qu'un numero apparait chez deux operateurs differents -- le routage reseau est potentiellement incorrect.",
        concepts: ['JOIN', 'WHERE sur FK', 'fichiers SYNC'],
        sql: "SELECT s.msisdn, s.date_portage,\n       o.nom AS operateur,\n       ss.statut_name, ss.commentaire\nFROM SYNC s\nJOIN SYNC_STATUS ss ON ss.id = s.sync_status\nJOIN OPERATEUR o ON o.code = s.operateur_id\nWHERE ss.statut_name = 'LOCKED';",
      },
      {
        id: 'inv-06',
        label: 'MSISDN avec plusieurs portages actifs',
        description:
          "Sous-requete (SELECT dans un SELECT) : le SELECT interne utilise GROUP BY + HAVING COUNT(*) > 1 pour trouver les MSISDN ayant plus d'un portage non cloture. Anomalie grave : un numero ne peut etre porte qu'une seule fois a la fois.",
        concepts: ['Sous-requete', 'IN (SELECT)', 'HAVING', 'anomalie grave'],
        sql: "SELECT p.portage_msisdn, p.id AS id_portage,\n       e.etat_name AS etat, p.portage_date_souhaitee\nFROM PORTAGE p\nJOIN ETAT e ON e.id = p.portage_etat\nWHERE e.etat_name NOT IN ('termine', 'refuse', 'annule')\n  AND p.portage_msisdn IN (\n    SELECT portage_msisdn\n    FROM PORTAGE p2\n    JOIN ETAT e2 ON e2.id = p2.portage_etat\n    WHERE e2.etat_name NOT IN ('termine', 'refuse', 'annule')\n    GROUP BY portage_msisdn\n    HAVING COUNT(*) > 1\n  )\nORDER BY p.portage_msisdn, p.portage_date_souhaitee;",
      },
      {
        id: 'inv-07',
        label: 'Portage programme un jour ferie',
        description:
          "JOIN entre portages et jours feries sur la date. Un portage programme un jour ferie est interdit par la reglementation PNM. Si cette requete retourne des resultats, c'est un bug du systeme.",
        concepts: ['JOIN sur date', 'controle reglementaire'],
        sql: "SELECT p.portage_msisdn, p.portage_date_souhaitee,\n       fd.ferryday, e.etat_name AS etat\nFROM PORTAGE p\nJOIN FERRYDAY fd\n  ON fd.ferryday = p.portage_date_souhaitee::date\nJOIN ETAT e ON e.id = p.portage_etat\nWHERE fd.is_active = true;",
      },
      {
        id: 'inv-08',
        label: 'Erreurs techniques (code_reponse = 20)',
        description:
          "Le code_reponse 20 signale une erreur de format dans le traitement. Ces erreurs necessitent une intervention manuelle. On joint PORTAGE pour obtenir le MSISDN concerne.",
        concepts: ['WHERE code_reponse', 'priorisation'],
        sql: 'SELECT p.portage_msisdn, p.portage_rio,\n       pd.id_portage, pd.date,\n       cr.description AS motif_erreur\nFROM DATA pd\nJOIN PORTAGE p ON p.id = pd.id_portage\nJOIN CODE_REPONSE cr ON cr.code = pd.code_reponse\nWHERE pd.code_reponse = 20\nORDER BY pd.date DESC;',
      },
      {
        id: 'inv-09',
        label: 'Diagnostic croise SYNC vs portage',
        description:
          "CASE WHEN cree une colonne calculee avec une logique conditionnelle. LEFT JOIN sur PORTAGE car un portage peut ne pas exister. Cette requete croise les donnees SYNC avec les portages reels pour diagnostiquer la nature du conflit.",
        concepts: ['CASE WHEN', 'LEFT JOIN', 'diagnostic'],
        sql: "SELECT\n    s.msisdn,\n    s.date_portage AS date_sync,\n    p.portage_date_souhaitee AS date_portage_reel,\n    e.etat_name AS etat_portage,\n    CASE\n        WHEN p.id IS NULL THEN 'PAS DE PORTAGE TROUVE'\n        WHEN e.etat_name = 'termine' THEN 'OK - Termine'\n        ELSE 'ATTENTION - ' || e.etat_name\n    END AS diagnostic\nFROM SYNC s\nJOIN SYNC_STATUS ss ON ss.id = s.sync_status\nLEFT JOIN PORTAGE p ON p.portage_msisdn = s.msisdn\nLEFT JOIN ETAT e ON e.id = p.portage_etat\nWHERE ss.statut_name = 'LOCKED'\nORDER BY s.msisdn;",
      },
      {
        id: 'inv-10',
        label: 'Tickets vieux de plus de 3 jours',
        description:
          "Les tickets PNM doivent etre traites dans les delais reglementaires. Un ticket de plus de 3 jours sans cloture indique un retard de traitement. AGE() calcule la duree depuis une date.",
        concepts: ['INTERVAL', 'AGE()', 'delai reglementaire'],
        sql: "SELECT pd.id, p.portage_msisdn, pd.code_ticket,\n       ct.description AS type_ticket,\n       pd.date AS date_ticket,\n       AGE(CURRENT_DATE, pd.date) AS anciennete\nFROM DATA pd\nJOIN PORTAGE p ON p.id = pd.id_portage\nJOIN CODE_TICKET ct ON ct.code = pd.code_ticket\nWHERE pd.date < CURRENT_DATE - INTERVAL '3 days'\n  AND pd.code_ticket NOT IN (730, 800)\nORDER BY pd.date ASC\nLIMIT 30;",
      },
      {
        id: 'inv-11',
        label: 'Portages termines sans historique',
        description:
          "Detecte les portages dont l'etat est 'termine' ou 'accepte' mais sans aucune entree dans PORTAGE_HISTORIQUE. L'absence signale une desynchronisation entre les tables.",
        concepts: ['LEFT JOIN absence', 'coherence inter-tables'],
        sql: "SELECT p.id, p.portage_msisdn,\n       p.portage_date_souhaitee, e.etat_name AS etat\nFROM PORTAGE p\nJOIN ETAT e ON e.id = p.portage_etat\nLEFT JOIN PORTAGE_HISTORIQUE ph\n  ON ph.id_portage = p.id\nWHERE ph.id IS NULL\n  AND e.etat_name IN ('termine', 'accepte')\nORDER BY p.portage_date_souhaitee DESC;",
      },
      {
        id: 'inv-12',
        label: 'Rapport complet anomalies du jour',
        description:
          "UNION ALL combine les resultats de plusieurs requetes en un seul tableau. Chaque sous-requete detecte un type d'anomalie different et les etiquette. C'est la requete de synthese qu'un agent PNM executerait chaque matin.",
        concepts: ['UNION ALL', 'sous-requetes combinees', 'rapport quotidien'],
        sql: "SELECT 'Fichier sans ACK' AS anomalie,\n       f.nom AS detail, f.date_creation::text AS info\nFROM FICHIER f\nLEFT JOIN ACK a ON a.file_name = f.nom\nWHERE a.id IS NULL AND f.type = 'data'\n\nUNION ALL\n\nSELECT 'Portage bloque',\n       p.portage_msisdn, p.portage_date_souhaitee::text\nFROM PORTAGE p\nJOIN ETAT e ON e.id = p.portage_etat\nWHERE e.etat_name = 'enCours'\n  AND p.portage_date_souhaitee < CURRENT_DATE - INTERVAL '5 days'\n\nUNION ALL\n\nSELECT 'Erreur technique',\n       p.portage_msisdn, pd.date::text\nFROM DATA pd\nJOIN PORTAGE p ON p.id = pd.id_portage\nWHERE pd.code_reponse = 20\n\nORDER BY anomalie, info DESC;",
      },
    ],
  },
};

export const LEVEL_KEYS = ['debutant', 'intermediaire', 'investigation'] as const;
export type LevelKey = (typeof LEVEL_KEYS)[number];
