// ----------------------------------------------------------------------
// SQL Scenarios configuration — grouped by difficulty level
// Each scenario documents a SQL concept with a PNM context
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
          "SELECT * retourne toutes les colonnes d'une table. La table porta_operateur contient les 6 operateurs telecoms des Antilles-Guyane (Digicel, Orange, SFR, etc.).",
        concepts: ['SELECT *', 'FROM'],
        sql: 'SELECT * FROM porta_operateur;',
      },
      {
        id: 'deb-02',
        label: 'Colonnes specifiques',
        description:
          "Au lieu de *, on peut selectionner uniquement les colonnes utiles. C'est plus performant et plus lisible. ORDER BY trie les resultats.",
        concepts: ['SELECT colonnes', 'ORDER BY'],
        sql: 'SELECT code, name, label FROM porta_code_ticket\nORDER BY code;',
      },
      {
        id: 'deb-03',
        label: 'Jours feries 2026',
        description:
          "Les jours feries des 4 DOM (Martinique, Guadeloupe, Saint-Martin, Guyane). Le PNM est suspendu ces jours-la -- aucun portage ne doit etre programme.",
        concepts: ['SELECT *', 'ORDER BY'],
        sql: 'SELECT * FROM porta_ferryday\nORDER BY ferryday;',
      },
      {
        id: 'deb-04',
        label: 'Filtrer avec WHERE',
        description:
          "WHERE filtre les lignes selon une condition. Ici, seuls les MSISDN dont l'operateur actuel est '02' (Digicel). LIMIT restreint le nombre de resultats retournes.",
        concepts: ['WHERE', 'LIMIT'],
        sql: "SELECT msisdn, operateur_id_actuel\nFROM porta_msisdn\nWHERE operateur_id_actuel = '02'\nLIMIT 20;",
      },
      {
        id: 'deb-05',
        label: 'Trier du plus recent',
        description:
          'ORDER BY date DESC trie du plus recent au plus ancien. Combine avec LIMIT, cela donne les N derniers elements. Utile pour voir les derniers echanges inter-operateurs.',
        concepts: ['ORDER BY DESC', 'LIMIT'],
        sql: 'SELECT id, filename, date, type\nFROM porta_fichier\nORDER BY date DESC\nLIMIT 10;',
      },
      {
        id: 'deb-06',
        label: 'Compter les lignes',
        description:
          "COUNT(*) compte le nombre total de lignes. Ici, combien de numeros sont enregistres dans la base. C'est une fonction d'agregation.",
        concepts: ['COUNT(*)'],
        sql: 'SELECT COUNT(*) AS total_numeros\nFROM porta_msisdn;',
      },
      {
        id: 'deb-07',
        label: 'Valeurs uniques',
        description:
          "DISTINCT elimine les doublons. Ici, on obtient la liste des types de fichiers existants (data, ack, sync) sans repetition.",
        concepts: ['DISTINCT'],
        sql: 'SELECT DISTINCT type\nFROM porta_fichier\nORDER BY type;',
      },
      {
        id: 'deb-08',
        label: 'Filtres multiples',
        description:
          "AND combine plusieurs conditions : les deux doivent etre vraies. Ici, fichiers de type 'data' envoyes depuis un mois. BETWEEN definit un intervalle de dates.",
        concepts: ['WHERE AND', 'BETWEEN', 'CURRENT_DATE'],
        sql: "SELECT id, filename, date\nFROM porta_fichier\nWHERE type = 'data'\n  AND date BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE\nORDER BY date DESC;",
      },
      {
        id: 'deb-09',
        label: 'Recherche de texte',
        description:
          "LIKE avec % permet la recherche partielle. '%DIGICEL%' trouve tout texte contenant 'DIGICEL'. Le % remplace n'importe quel nombre de caracteres.",
        concepts: ['LIKE', '%'],
        sql: "SELECT id, filename\nFROM porta_fichier\nWHERE filename LIKE '%DIG%'\nORDER BY date DESC\nLIMIT 10;",
      },
      {
        id: 'deb-10',
        label: 'Valeurs dans une liste',
        description:
          "IN remplace plusieurs OR. Au lieu de type = 'data' OR type = 'ack', on ecrit type IN ('data', 'ack'). Plus lisible avec beaucoup de valeurs.",
        concepts: ['IN'],
        sql: "SELECT id, filename, type, date\nFROM porta_fichier\nWHERE type IN ('data', 'ack')\nORDER BY date DESC\nLIMIT 15;",
      },
      {
        id: 'deb-11',
        label: 'Chercher les valeurs NULL',
        description:
          "IS NULL trouve les lignes ou une colonne est vide. Attention : on n'ecrit PAS = NULL mais IS NULL. Ici, les numeros sans operateur actuel.",
        concepts: ['IS NULL'],
        sql: 'SELECT msisdn\nFROM porta_msisdn\nWHERE operateur_id_actuel IS NULL;',
      },
      {
        id: 'deb-12',
        label: 'Alias de colonnes',
        description:
          "AS renomme une colonne dans les resultats. Utile pour rendre le resultat plus lisible : 'code' devient 'Code Operateur', etc.",
        concepts: ['AS alias'],
        sql: "SELECT code AS \"Code\", nom AS \"Nom Operateur\", type AS \"Type\"\nFROM porta_operateur\nORDER BY nom;",
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
          "JOIN relie deux tables par une colonne commune. Ici, porta_portage et porta_etat via etat_id_actuel. Les alias 'p' et 'e' raccourcissent les noms de table.",
        concepts: ['JOIN', 'ON', 'alias'],
        sql: "SELECT p.id, p.msisdn, p.date_portage, e.label AS etat\nFROM porta_portage p\nJOIN porta_etat e ON e.id = p.etat_id_actuel\nORDER BY p.date_portage DESC\nLIMIT 20;",
      },
      {
        id: 'int-02',
        label: 'Compter par groupe',
        description:
          "GROUP BY regroupe les lignes ayant la meme valeur, puis COUNT(*) compte chaque groupe. Ici, combien de portages par etat. ORDER BY total DESC montre les plus frequents en premier.",
        concepts: ['GROUP BY', 'COUNT(*)', 'ORDER BY agrege'],
        sql: 'SELECT e.label AS etat, COUNT(*) AS total\nFROM porta_portage p\nJOIN porta_etat e ON e.id = p.etat_id_actuel\nGROUP BY e.label\nORDER BY total DESC;',
      },
      {
        id: 'int-03',
        label: 'Volume quotidien de fichiers',
        description:
          "Combine WHERE (filtre type = 'data') et GROUP BY (regroupe par jour). Montre le volume d'echanges quotidien. Un jour sans fichier peut indiquer un probleme technique.",
        concepts: ['WHERE + GROUP BY'],
        sql: "SELECT date, COUNT(*) AS nb_fichiers\nFROM porta_fichier\nWHERE type = 'data'\nGROUP BY date\nORDER BY date DESC;",
      },
      {
        id: 'int-04',
        label: 'TOP motifs de refus',
        description:
          "Le ticket 1220 est un refus de portage. Cette requete JOIN 3 tables pour classer les motifs du plus frequent au moins frequent. Utile pour identifier les causes recurrentes.",
        concepts: ['JOIN multiple', 'GROUP BY', 'COUNT'],
        sql: "SELECT cr.label AS motif, COUNT(*) AS total\nFROM porta_data d\nJOIN porta_code_reponse cr ON cr.code = d.code_motif\nWHERE d.code_ticket = '1220'\nGROUP BY cr.label\nORDER BY total DESC;",
      },
      {
        id: 'int-05',
        label: 'Portages sortants par operateur',
        description:
          "Compte les dossiers de portage sortants par operateur d'origine. Un nombre eleve peut indiquer un operateur qui perd beaucoup de clients (churn important).",
        concepts: ['GROUP BY', 'COUNT', 'analyse metier'],
        sql: "SELECT o.nom AS operateur, COUNT(*) AS portages_sortants\nFROM porta_dossier d\nJOIN porta_operateur o ON o.code = d.operateur_id_origine\nGROUP BY o.nom\nORDER BY portages_sortants DESC;",
      },
      {
        id: 'int-06',
        label: 'LEFT JOIN : fichiers et ACR',
        description:
          "LEFT JOIN garde TOUTES les lignes de la table de gauche, meme sans correspondance a droite (NULL). Ici, chaque fichier avec son ACR s'il existe, NULL sinon.",
        concepts: ['LEFT JOIN', 'NULL a droite'],
        sql: "SELECT f.id, f.filename, f.date,\n       a.date_reception AS date_acr\nFROM porta_fichier f\nLEFT JOIN porta_ack a ON a.fichier_id = f.id\nWHERE f.type = 'data'\nORDER BY f.date DESC\nLIMIT 20;",
      },
      {
        id: 'int-07',
        label: 'HAVING : filtrer apres GROUP BY',
        description:
          "HAVING filtre APRES le GROUP BY (contrairement a WHERE qui filtre AVANT). Ici, on ne garde que les operateurs ayant plus de 5 portages. HAVING s'utilise avec les fonctions d'agregation.",
        concepts: ['HAVING', 'COUNT > N'],
        sql: "SELECT o.nom AS operateur, COUNT(*) AS total\nFROM porta_dossier d\nJOIN porta_operateur o ON o.code = d.operateur_id_origine\nGROUP BY o.nom\nHAVING COUNT(*) > 5\nORDER BY total DESC;",
      },
      {
        id: 'int-08',
        label: 'Plusieurs agregations',
        description:
          "On peut utiliser plusieurs fonctions d'agregation en meme temps : COUNT, MIN, MAX. Ici, pour chaque etat de portage, on voit le nombre, la date la plus ancienne et la plus recente.",
        concepts: ['COUNT', 'MIN', 'MAX'],
        sql: 'SELECT e.label AS etat,\n       COUNT(*) AS nb_portages,\n       MIN(p.date_portage) AS plus_ancien,\n       MAX(p.date_portage) AS plus_recent\nFROM porta_portage p\nJOIN porta_etat e ON e.id = p.etat_id_actuel\nGROUP BY e.label\nORDER BY nb_portages DESC;',
      },
      {
        id: 'int-09',
        label: 'Historique complet d\'un numero',
        description:
          "Jointure avec porta_operateur pour afficher les noms lisibles. Retrace tout l'historique d'un MSISDN : chez quel operateur, depuis quand, jusqu'a quand. NULL dans date_fin = actuellement actif.",
        concepts: ['JOIN', 'WHERE', 'IS NULL', 'historique'],
        sql: "SELECT mh.msisdn, o.nom AS operateur,\n       mh.date_debut, mh.date_fin,\n       mh.portage_id\nFROM porta_msisdn_historique mh\nJOIN porta_operateur o ON o.code = mh.operateur_id\nWHERE mh.msisdn = (SELECT msisdn FROM porta_msisdn LIMIT 1)\nORDER BY mh.date_debut;",
      },
      {
        id: 'int-10',
        label: 'Tickets par code et par jour',
        description:
          "Analyse croisee : GROUP BY sur deux colonnes (code_ticket + date). Montre la distribution temporelle des differents types de tickets. Utile pour detecter des pics d'activite.",
        concepts: ['GROUP BY multiple', 'analyse temporelle'],
        sql: "SELECT d.code_ticket, ct.label, f.date,\n       COUNT(*) AS nb_tickets\nFROM porta_data d\nJOIN porta_code_ticket ct ON ct.code = d.code_ticket\nJOIN porta_fichier f ON f.id = d.fichier_id\nGROUP BY d.code_ticket, ct.label, f.date\nORDER BY f.date DESC, nb_tickets DESC\nLIMIT 30;",
      },
      {
        id: 'int-11',
        label: 'Transitions possibles entre etats',
        description:
          "La table porta_transition definit les changements d'etat autorises. Cette requete montre toutes les transitions avec les noms lisibles des etats source et destination.",
        concepts: ['Self-JOIN (2 fois la meme table)'],
        sql: "SELECT e_from.label AS de_etat,\n       e_to.label AS vers_etat,\n       t.code_ticket_declencheur\nFROM porta_transition t\nJOIN porta_etat e_from ON e_from.id = t.etat_id_from\nJOIN porta_etat e_to ON e_to.id = t.etat_id_to\nORDER BY e_from.label, e_to.label;",
      },
      {
        id: 'int-12',
        label: 'Tranches numeriques par operateur',
        description:
          "Les tranches MSISDN (06XX, 09XX) sont attribuees aux operateurs. Cette requete montre quelle tranche appartient a quel operateur. Utile pour le routage reseau.",
        concepts: ['JOIN', 'ORDER BY multiple'],
        sql: 'SELECT t.prefix, t.debut, t.fin,\n       o.nom AS operateur\nFROM porta_tranche t\nJOIN porta_operateur o ON o.code = t.operateur_id\nORDER BY t.prefix, t.debut;',
      },
    ],
  },

  investigation: {
    key: 'investigation',
    title: 'Investigation',
    subtitle: 'Scenarios reels de detection d\'anomalies PNM',
    color: 'error',
    icon: 'solar:shield-warning-bold-duotone',
    scenarios: [
      {
        id: 'inv-01',
        label: 'Fichiers sans accuse de reception (ACR)',
        description:
          "LEFT JOIN + WHERE IS NULL : technique fondamentale pour trouver les elements SANS correspondance. Chaque fichier 'data' envoye a un operateur doit recevoir un ACR. S'il manque, l'operateur destinataire n'a pas confirme la reception -- les tickets contenus dans ce fichier sont peut-etre perdus.",
        concepts: ['LEFT JOIN', 'IS NULL', 'detection absence'],
        sql: "SELECT f.id, f.filename, f.date,\n       o.nom AS destinataire\nFROM porta_fichier f\nLEFT JOIN porta_ack a ON a.fichier_id = f.id\nJOIN porta_operateur o ON o.code = f.destinataire\nWHERE a.id IS NULL\n  AND f.type = 'data'\nORDER BY f.date DESC;",
      },
      {
        id: 'inv-02',
        label: 'Portages bloques depuis plus de 5 jours',
        description:
          "Jointures multiples (4 JOINs) pour afficher les noms lisibles des operateurs. INTERVAL '5 days' calcule une date dans le passe. Un portage en classe 'encours' depuis plus de 5 jours ouvrables est anormal -- il devrait etre cloture ou en phase de bascule.",
        concepts: ['JOIN multiple', 'INTERVAL', 'CURRENT_DATE', 'analyse delai'],
        sql: "SELECT p.msisdn, p.date_portage, e.label AS etat,\n       op_orig.nom AS de, op_dest.nom AS vers\nFROM porta_portage p\nJOIN porta_etat e ON e.id = p.etat_id_actuel\nJOIN porta_dossier d ON d.id = p.dossier_id\nJOIN porta_operateur op_orig ON op_orig.code = d.operateur_id_origine\nJOIN porta_operateur op_dest ON op_dest.code = d.operateur_id_destination\nWHERE e.classe = 'encours'\n  AND p.date_portage < CURRENT_DATE - INTERVAL '5 days'\nORDER BY p.date_portage;",
      },
      {
        id: 'inv-03',
        label: 'Bascule technique sans confirmation 1430',
        description:
          "LEFT JOIN avec condition double (id_portage ET code_ticket = '1430'). Le ticket 1430 confirme que la bascule technique a ete realisee. S'il manque, le numero est marque comme 'bascule' mais sans preuve technique -- risque de routage incorrect des appels.",
        concepts: ['LEFT JOIN condition multiple', 'detection absence specifique'],
        sql: "SELECT p.msisdn, p.date_portage, e.label AS etat\nFROM porta_portage p\nJOIN porta_etat e ON e.id = p.etat_id_actuel\nLEFT JOIN porta_data d2 ON d2.id_portage = p.id_portage\n  AND d2.code_ticket = '1430'\nWHERE e.classe = 'bascule'\n  AND d2.id IS NULL;",
      },
      {
        id: 'inv-04',
        label: 'Refus pour RIO invalide',
        description:
          "IN ('R100', 'R110') filtre sur plusieurs codes motif. R100 = RIO inexistant dans la base EGP, R110 = RIO ne correspondant pas au MSISDN. Le client a fourni un mauvais code RIO -- souvent une erreur de saisie en boutique ou un RIO expire.",
        concepts: ['IN', 'JOIN', 'codes metier PNM'],
        sql: "SELECT d.msisdn, d.rio, cr.label AS motif, f.date\nFROM porta_data d\nJOIN porta_code_reponse cr ON cr.code = d.code_motif\nJOIN porta_fichier f ON f.id = d.fichier_id\nWHERE d.code_ticket = '1220'\n  AND d.code_motif IN ('R100', 'R110')\nORDER BY f.date DESC;",
      },
      {
        id: 'inv-05',
        label: 'Conflits de synchronisation SYNC',
        description:
          "Chaque dimanche, les operateurs echangent des fichiers PNMSYNC contenant la liste de leurs numeros portes. Un conflit (is_conflict = true) signifie qu'un numero apparait chez deux operateurs differents -- le routage reseau est potentiellement incorrect pour ces numeros.",
        concepts: ['JOIN', 'WHERE boolean', 'fichiers SYNC'],
        sql: "SELECT s.msisdn, s.date_portage,\n       o.nom AS operateur_receveur,\n       ss.commentaire\nFROM porta_sync_status ss\nJOIN porta_sync s ON s.id = ss.sync_id\nJOIN porta_operateur o ON o.code = s.operateur_receveur\nWHERE ss.is_conflict = true;",
      },
      {
        id: 'inv-06',
        label: 'MSISDN enregistre chez 2 operateurs',
        description:
          "Sous-requete (SELECT dans un SELECT) : le SELECT interne utilise GROUP BY + HAVING COUNT(*) > 1 pour trouver les MSISDN ayant plus d'une entree active (date_fin IS NULL). Le SELECT externe affiche les details. Anomalie grave : un numero ne peut legalement appartenir qu'a un seul operateur a la fois.",
        concepts: ['Sous-requete', 'IN (SELECT)', 'HAVING', 'anomalie grave'],
        sql: "SELECT mh.msisdn, o.nom AS operateur,\n       mh.date_debut, mh.portage_id\nFROM porta_msisdn_historique mh\nJOIN porta_operateur o ON o.code = mh.operateur_id\nWHERE mh.date_fin IS NULL\n  AND mh.msisdn IN (\n    SELECT msisdn\n    FROM porta_msisdn_historique\n    WHERE date_fin IS NULL\n    GROUP BY msisdn\n    HAVING COUNT(*) > 1\n  )\nORDER BY mh.msisdn, mh.date_debut;",
      },
      {
        id: 'inv-07',
        label: 'Portage programme un jour ferie',
        description:
          "JOIN entre portages et jours feries sur la date. Un portage programme un jour ferie est interdit par la reglementation PNM -- les automates sont censes bloquer ces dates. Si cette requete retourne des resultats, c'est un bug du systeme de controle.",
        concepts: ['JOIN sur date', 'controle reglementaire'],
        sql: "SELECT p.msisdn, p.date_portage, fd.ferryday,\n       e.label AS etat\nFROM porta_portage p\nJOIN porta_ferryday fd ON fd.ferryday = p.date_portage\nJOIN porta_etat e ON e.id = p.etat_id_actuel\nWHERE fd.is_active = true;",
      },
      {
        id: 'inv-08',
        label: 'Erreurs techniques 7000',
        description:
          "Le ticket 7000 signale une erreur technique dans le traitement automatique du PNM. Ces erreurs necessitent une intervention manuelle et doivent etre traitees en priorite car elles bloquent le processus de portage pour le client concerne.",
        concepts: ['WHERE code_ticket', 'priorisation'],
        sql: "SELECT d.msisdn, d.rio, d.id_portage,\n       f.filename, f.date\nFROM porta_data d\nJOIN porta_fichier f ON f.id = d.fichier_id\nWHERE d.code_ticket = '7000'\nORDER BY f.date DESC;",
      },
      {
        id: 'inv-09',
        label: 'Diagnostic croise SYNC vs portage',
        description:
          "CASE WHEN cree une colonne calculee avec une logique conditionnelle. LEFT JOIN sur porta_portage car un portage peut ne pas exister. Cette requete croise les donnees SYNC avec les portages reels pour diagnostiquer la nature du conflit.",
        concepts: ['CASE WHEN', 'LEFT JOIN', 'diagnostic'],
        sql: "SELECT\n    s.msisdn,\n    s.date_portage AS date_sync,\n    p.date_portage AS date_portage_reel,\n    e.label AS etat_portage,\n    CASE\n        WHEN p.id IS NULL THEN 'PAS DE PORTAGE TROUVE'\n        WHEN e.classe = 'cloture' THEN 'OK - Cloture'\n        ELSE 'ATTENTION - ' || e.label\n    END AS diagnostic\nFROM porta_sync s\nJOIN porta_sync_status ss ON ss.sync_id = s.id\nLEFT JOIN porta_portage p ON p.msisdn = s.msisdn\nLEFT JOIN porta_etat e ON e.id = p.etat_id_actuel\nWHERE ss.is_conflict = true\nORDER BY s.msisdn;",
      },
      {
        id: 'inv-10',
        label: 'Tickets vieux de plus de 3 jours',
        description:
          "Les tickets PNM doivent etre traites dans les delais reglementaires. Un ticket data de plus de 3 jours sans cloture indique un retard de traitement. AGE() calcule la duree depuis une date.",
        concepts: ['INTERVAL', 'AGE()', 'delai reglementaire'],
        sql: "SELECT d.id, d.msisdn, d.code_ticket,\n       ct.label AS type_ticket,\n       f.date AS date_fichier,\n       AGE(CURRENT_DATE, f.date) AS anciennete\nFROM porta_data d\nJOIN porta_code_ticket ct ON ct.code = d.code_ticket\nJOIN porta_fichier f ON f.id = d.fichier_id\nWHERE f.date < CURRENT_DATE - INTERVAL '3 days'\n  AND d.code_ticket NOT IN ('1430', '1440')\nORDER BY f.date ASC\nLIMIT 30;",
      },
      {
        id: 'inv-11',
        label: 'MSISDN avec historique incomplet',
        description:
          "Detecte les portages dont le MSISDN n'a pas d'entree dans l'historique. Chaque portage devrait generer une ligne dans porta_msisdn_historique. L'absence signale une desynchronisation entre les tables.",
        concepts: ['LEFT JOIN absence', 'coherence inter-tables'],
        sql: "SELECT p.id, p.msisdn, p.date_portage,\n       e.label AS etat\nFROM porta_portage p\nJOIN porta_etat e ON e.id = p.etat_id_actuel\nLEFT JOIN porta_msisdn_historique mh ON mh.portage_id = p.id_portage\nWHERE mh.id IS NULL\n  AND e.classe IN ('cloture', 'bascule')\nORDER BY p.date_portage DESC;",
      },
      {
        id: 'inv-12',
        label: 'Rapport complet anomalies du jour',
        description:
          "UNION ALL combine les resultats de plusieurs requetes en un seul tableau. Chaque sous-requete detecte un type d'anomalie different et les etiquette. C'est la requete de synthese qu'un agent PNM executerait chaque matin.",
        concepts: ['UNION ALL', 'sous-requetes combinees', 'rapport quotidien'],
        sql: "SELECT 'Fichier sans ACR' AS anomalie, f.filename AS detail, f.date::text AS info\nFROM porta_fichier f\nLEFT JOIN porta_ack a ON a.fichier_id = f.id\nWHERE a.id IS NULL AND f.type = 'data'\n\nUNION ALL\n\nSELECT 'Portage bloque', p.msisdn, p.date_portage::text\nFROM porta_portage p\nJOIN porta_etat e ON e.id = p.etat_id_actuel\nWHERE e.classe = 'encours'\n  AND p.date_portage < CURRENT_DATE - INTERVAL '5 days'\n\nUNION ALL\n\nSELECT 'Erreur 7000', d.msisdn, f.date::text\nFROM porta_data d\nJOIN porta_fichier f ON f.id = d.fichier_id\nWHERE d.code_ticket = '7000'\n\nORDER BY anomalie, info DESC;",
      },
    ],
  },
};

export const LEVEL_KEYS = ['debutant', 'intermediaire', 'investigation'] as const;
export type LevelKey = (typeof LEVEL_KEYS)[number];
