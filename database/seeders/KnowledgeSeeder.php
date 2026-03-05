<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\GlossaryTerm;
use App\Models\KnowledgeDomain;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class KnowledgeSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedDomains();
        $this->seedGlossaryTerms();
        $this->seedArticles();
        $this->seedArticleGlossaryLinks();
    }

    private function seedDomains(): void
    {
        $domains = [
            ['name' => 'PNM V3', 'slug' => 'pnm-v3', 'description' => 'Portabilité des Numéros Mobiles V3 — processus, acteurs, tickets et réglementation ARCEP pour les Antilles-Guyane.', 'icon' => 'solar:smartphone-bold-duotone', 'color' => '#3b82f6', 'sort_order' => 1],
            ['name' => 'Systèmes d\'Information', 'slug' => 'systemes-information', 'description' => 'Organisation SI de Digicel — équipes, architecture BSS, PortaDB, ESB DataPower et flux de données.', 'icon' => 'solar:monitor-bold-duotone', 'color' => '#8b5cf6', 'sort_order' => 2],
            ['name' => 'Réseau & Infrastructure', 'slug' => 'reseau-infrastructure', 'description' => 'Architecture réseau télécom — Core Network, composants, routage et impact de la portabilité.', 'icon' => 'solar:global-bold-duotone', 'color' => '#10b981', 'sort_order' => 3],
            ['name' => 'Inter-opérateurs & GPMAG', 'slug' => 'inter-operateurs-gpmag', 'description' => 'Échanges inter-opérateurs — GPMAG, fichiers PNMDATA/PNMSYNC, vacations et flux ACR/ERR.', 'icon' => 'solar:hand-shake-bold-duotone', 'color' => '#f59e0b', 'sort_order' => 4],
            ['name' => 'Outils & Scripts', 'slug' => 'outils-scripts', 'description' => 'Outils internes — PortaSync, scripts de bascule, serveurs, monitoring et procédures opérationnelles.', 'icon' => 'solar:settings-bold-duotone', 'color' => '#ef4444', 'sort_order' => 5],
            ['name' => 'SQL & Investigation', 'slug' => 'sql-investigation', 'description' => 'Apprentissage SQL progressif et scénarios d\'investigation sur les tables PORTA simulées.', 'icon' => 'solar:code-bold-duotone', 'color' => '#06b6d4', 'sort_order' => 6],
        ];

        foreach ($domains as $domain) {
            KnowledgeDomain::create($domain);
        }
    }

    private function seedGlossaryTerms(): void
    {
        $terms = [
            ['term' => 'Portabilité des Numéros Mobiles', 'abbreviation' => 'PNM', 'definition' => 'Mécanisme permettant à un abonné mobile de conserver son numéro de téléphone lorsqu\'il change d\'opérateur.', 'category' => 'PNM'],
            ['term' => 'Opérateur Receveur', 'abbreviation' => 'OPR', 'definition' => 'Opérateur vers lequel le client souhaite porter son numéro. Il initie la demande de portage.', 'category' => 'PNM'],
            ['term' => 'Opérateur Donneur', 'abbreviation' => 'OPD', 'definition' => 'Opérateur qui perd le client suite au portage. Il vérifie l\'éligibilité et transmet les informations nécessaires.', 'category' => 'PNM'],
            ['term' => 'Opérateur Attributaire', 'abbreviation' => 'OPA', 'definition' => 'Opérateur à qui le numéro a été initialement attribué par l\'ARCEP.', 'category' => 'PNM'],
            ['term' => 'Relevé d\'Identité Opérateur', 'abbreviation' => 'RIO', 'definition' => 'Code unique de 12 caractères identifiant un abonné auprès de son opérateur. Format : OO-Q-RRRRRR-CCC.', 'category' => 'PNM'],
            ['term' => 'Jour de Demande', 'abbreviation' => 'JD', 'definition' => 'Jour calendaire où l\'OPR transmet la demande de portage à l\'OPD via le ticket 1110.', 'category' => 'PNM'],
            ['term' => 'Jour de Portage', 'abbreviation' => 'JP', 'definition' => 'Jour effectif de bascule du numéro. JP = JD + 2 jours ouvrés pour la PNM V3 Antilles-Guyane.', 'category' => 'PNM'],
            ['term' => 'Groupement de Portabilité des Numéros Mobiles Antilles-Guyane', 'abbreviation' => 'GPMAG', 'definition' => 'Structure de gouvernance regroupant les opérateurs mobiles des Antilles-Guyane pour la gestion de la portabilité.', 'category' => 'PNM'],
            ['term' => 'Autorité de Régulation des Communications Électroniques', 'abbreviation' => 'ARCEP', 'definition' => 'Autorité administrative indépendante qui régule les télécommunications en France, y compris la portabilité.', 'category' => 'Réglementation'],
            ['term' => 'PortaDB', 'abbreviation' => 'PortaDB', 'definition' => 'Base de données centrale de la portabilité chez Digicel.', 'category' => 'Systèmes'],
            ['term' => 'PortaSync', 'abbreviation' => 'PortaSync', 'definition' => 'Service de synchronisation entre PortaDB et les systèmes inter-opérateurs.', 'category' => 'Systèmes'],
            ['term' => 'Enterprise Service Bus', 'abbreviation' => 'ESB', 'definition' => 'Bus d\'intégration (IBM DataPower) assurant la communication entre PortaDB et MOBI.', 'category' => 'Systèmes'],
            ['term' => 'DataPower', 'abbreviation' => 'DataPower', 'definition' => 'Appliance IBM servant de bus d\'intégration (ESB) entre les systèmes PNM et les systèmes d\'activation opérateur.', 'category' => 'Systèmes'],
            ['term' => 'MOBI', 'abbreviation' => 'MOBI', 'definition' => 'Système de gestion des abonnés mobiles Digicel.', 'category' => 'Systèmes'],
            ['term' => 'Home Location Register', 'abbreviation' => 'HLR', 'definition' => 'Base de données réseau contenant les informations de localisation et de profil de chaque abonné mobile (2G/3G).', 'category' => 'Réseau'],
            ['term' => 'Home Subscriber Server', 'abbreviation' => 'HSS', 'definition' => 'Équivalent 4G/LTE du HLR.', 'category' => 'Réseau'],
            ['term' => 'Evolved Packet Core', 'abbreviation' => 'EPC', 'definition' => 'Cœur de réseau 4G/LTE.', 'category' => 'Réseau'],
            ['term' => 'IP Multimedia Subsystem', 'abbreviation' => 'IMS', 'definition' => 'Architecture réseau pour la convergence voix/data/multimédia.', 'category' => 'Réseau'],
            ['term' => 'Mobile Switching Center', 'abbreviation' => 'MSC', 'definition' => 'Commutateur central du réseau mobile 2G/3G.', 'category' => 'Réseau'],
            ['term' => 'PNMDATA', 'abbreviation' => 'PNMDATA', 'definition' => 'Fichier d\'échange inter-opérateurs contenant les demandes de portage, réponses et notifications.', 'category' => 'Inter-opérateurs'],
            ['term' => 'PNMSYNC', 'abbreviation' => 'PNMSYNC', 'definition' => 'Fichier de synchronisation hebdomadaire contenant la liste complète des MSISDN portés.', 'category' => 'Inter-opérateurs'],
            ['term' => 'ACR', 'abbreviation' => 'ACR', 'definition' => 'Accusé de réception technique confirmant la bonne réception d\'un fichier PNMDATA.', 'category' => 'Inter-opérateurs'],
            ['term' => 'ERR', 'abbreviation' => 'ERR', 'definition' => 'Fichier d\'erreur retourné quand un PNMDATA est corrompu ou mal formaté.', 'category' => 'Inter-opérateurs'],
            ['term' => 'Mobile Station International Subscriber Directory Number', 'abbreviation' => 'MSISDN', 'definition' => 'Numéro de téléphone mobile international au format E.164.', 'category' => 'Réseau'],
            ['term' => 'Business Support System', 'abbreviation' => 'BSS', 'definition' => 'Ensemble des systèmes IT supportant les processus métier.', 'category' => 'Systèmes'],
            ['term' => 'Operations Support System', 'abbreviation' => 'OSS', 'definition' => 'Ensemble des systèmes IT supportant les opérations réseau.', 'category' => 'Systèmes'],
            ['term' => 'Customer Relationship Management', 'abbreviation' => 'CRM', 'definition' => 'Système de gestion de la relation client.', 'category' => 'Systèmes'],
            ['term' => 'Data Warehouse', 'abbreviation' => 'DW', 'definition' => 'Entrepôt de données pour le reporting.', 'category' => 'Systèmes'],
            ['term' => 'Management Information System', 'abbreviation' => 'MIS', 'definition' => 'Système d\'information décisionnel.', 'category' => 'Systèmes'],
            ['term' => 'Radio Access Network', 'abbreviation' => 'RAN', 'definition' => 'Réseau d\'accès radio.', 'category' => 'Réseau'],
            ['term' => 'Secure File Transfer Protocol', 'abbreviation' => 'sFTP', 'definition' => 'Protocole de transfert de fichiers sécurisé.', 'category' => 'Inter-opérateurs'],
            ['term' => 'Vacation', 'abbreviation' => null, 'definition' => 'Créneau horaire fixe pour l\'échange de fichiers entre opérateurs. Trois vacations quotidiennes : V10, V14, V19.', 'category' => 'Inter-opérateurs'],
            ['term' => 'EMA/EMM', 'abbreviation' => 'EMA/EMM', 'definition' => 'Systèmes de gestion des équipements mobiles utilisés lors du processus de bascule.', 'category' => 'Systèmes'],
            ['term' => 'BTCTF', 'abbreviation' => 'BTCTF', 'definition' => 'Serveur dédié aux échanges inter-opérateurs de fichiers de portabilité via sFTP.', 'category' => 'Systèmes'],
            ['term' => 'Digicel Application Portability Interface', 'abbreviation' => 'DAPI', 'definition' => 'Couche d\'interfaces web services exposée par les composants PNM de Digicel.', 'category' => 'Systèmes'],
            ['term' => 'PortaWs', 'abbreviation' => 'PortaWs', 'definition' => 'Portail web et services DAPI pour la consultation des portages en cours.', 'category' => 'Systèmes'],
            ['term' => 'PortaWebUi', 'abbreviation' => 'PortaWebUi', 'definition' => 'Interface d\'administration web PNM.', 'category' => 'Systèmes'],
            ['term' => 'Acquittement', 'abbreviation' => 'AR', 'definition' => 'Message de confirmation envoyé par un opérateur après réception d\'un fichier PNMDATA.', 'category' => 'Inter-opérateurs'],
        ];

        foreach ($terms as $term) {
            GlossaryTerm::create([
                ...$term,
                'slug' => Str::slug($term['abbreviation'] ?? $term['term']),
            ]);
        }
    }

    private function seedArticles(): void
    {
        $dataPath = database_path('seeders/data/articles');

        $domains = KnowledgeDomain::all()->keyBy('slug');

        $articleDefinitions = [
            ['domain' => 'pnm-v3', 'title' => 'Introduction à la PNM V3', 'slug' => 'introduction', 'excerpt' => 'Qu\'est-ce que la portabilité des numéros mobiles et pourquoi est-elle essentielle ?', 'file' => 'pnm-introduction.html', 'level' => 'decouverte', 'sort_order' => 1, 'reading_time' => 5],
            ['domain' => 'pnm-v3', 'title' => 'Les acteurs du portage : OPR, OPD, OPA', 'slug' => 'acteurs-roles', 'excerpt' => 'Comprendre les rôles et responsabilités de chaque opérateur.', 'file' => 'pnm-acteurs-roles.html', 'level' => 'decouverte', 'sort_order' => 2, 'reading_time' => 4],
            ['domain' => 'pnm-v3', 'title' => 'Processus de portage standard', 'slug' => 'processus-portage', 'excerpt' => 'Le parcours complet d\'une demande de portage.', 'file' => 'pnm-processus-portage.html', 'level' => 'comprehension', 'sort_order' => 3, 'reading_time' => 7],
            ['domain' => 'pnm-v3', 'title' => 'Catalogue des types de tickets', 'slug' => 'tickets-types', 'excerpt' => 'Tous les types de tickets PNM.', 'file' => 'pnm-tickets-types.html', 'level' => 'comprehension', 'sort_order' => 4, 'reading_time' => 6],
            ['domain' => 'pnm-v3', 'title' => 'Décoder le RIO', 'slug' => 'rio-decoder', 'excerpt' => 'Comprendre la structure du Relevé d\'Identité Opérateur.', 'file' => 'pnm-rio-decoder.html', 'level' => 'decouverte', 'sort_order' => 5, 'reading_time' => 4],
            ['domain' => 'pnm-v3', 'title' => 'Motifs de refus d\'éligibilité', 'slug' => 'motifs-refus', 'excerpt' => 'Les raisons de refus d\'un portage et actions correctives.', 'file' => 'pnm-motifs-refus.html', 'level' => 'comprehension', 'sort_order' => 6, 'reading_time' => 5],
            ['domain' => 'systemes-information', 'title' => 'Organisation du SI Digicel', 'slug' => 'organisation', 'excerpt' => 'Les 6 équipes SI, leurs missions et outils principaux.', 'file' => 'si-organisation.html', 'level' => 'decouverte', 'sort_order' => 1, 'reading_time' => 5],
            ['domain' => 'systemes-information', 'title' => 'Architecture BSS', 'slug' => 'architecture-bss', 'excerpt' => 'Le flux CRM → Facturation → Activation → Selfcare.', 'file' => 'si-architecture-bss.html', 'level' => 'comprehension', 'sort_order' => 2, 'reading_time' => 5],
            ['domain' => 'systemes-information', 'title' => 'PortaDB — Base de données PNM', 'slug' => 'portadb', 'excerpt' => 'Architecture et rôle de PortaDB.', 'file' => 'si-portadb.html', 'level' => 'comprehension', 'sort_order' => 3, 'reading_time' => 6],
            ['domain' => 'systemes-information', 'title' => 'ESB DataPower', 'slug' => 'esb-datapower', 'excerpt' => 'Le bus d\'intégration entre PortaDB et MOBI.', 'file' => 'si-esb-datapower.html', 'level' => 'maitrise', 'sort_order' => 4, 'reading_time' => 6],
            ['domain' => 'reseau-infrastructure', 'title' => 'Architecture réseau télécom', 'slug' => 'architecture', 'excerpt' => 'Vue d\'ensemble du réseau Digicel.', 'file' => 'reseau-architecture.html', 'level' => 'decouverte', 'sort_order' => 1, 'reading_time' => 5],
            ['domain' => 'reseau-infrastructure', 'title' => 'Composants réseau clés', 'slug' => 'composants', 'excerpt' => 'HLR, HSS, EPC, IMS, MSC — rôle de chaque composant.', 'file' => 'reseau-composants.html', 'level' => 'comprehension', 'sort_order' => 2, 'reading_time' => 5],
            ['domain' => 'reseau-infrastructure', 'title' => 'Impact de la portabilité sur le routage', 'slug' => 'impact-portage', 'excerpt' => 'Comment un numéro porté est routé.', 'file' => 'reseau-impact-portage.html', 'level' => 'maitrise', 'sort_order' => 3, 'reading_time' => 4],
            ['domain' => 'inter-operateurs-gpmag', 'title' => 'Le GPMAG et ses opérateurs', 'slug' => 'gpmag', 'excerpt' => 'Structure de gouvernance de la zone Antilles-Guyane.', 'file' => 'interop-gpmag.html', 'level' => 'decouverte', 'sort_order' => 1, 'reading_time' => 6],
            ['domain' => 'inter-operateurs-gpmag', 'title' => 'Anatomie d\'un fichier PNMDATA', 'slug' => 'fichiers-pnmdata', 'excerpt' => 'Structure et convention de nommage.', 'file' => 'interop-fichiers-pnmdata.html', 'level' => 'comprehension', 'sort_order' => 2, 'reading_time' => 6],
            ['domain' => 'inter-operateurs-gpmag', 'title' => 'Fichiers PNMSYNC et synchronisation', 'slug' => 'fichiers-pnmsync', 'excerpt' => 'Le processus de synchronisation hebdomadaire.', 'file' => 'interop-fichiers-pnmsync.html', 'level' => 'comprehension', 'sort_order' => 3, 'reading_time' => 4],
            ['domain' => 'inter-operateurs-gpmag', 'title' => 'Le système de vacations', 'slug' => 'vacations', 'excerpt' => 'Les 3 créneaux quotidiens d\'échange.', 'file' => 'interop-vacations.html', 'level' => 'decouverte', 'sort_order' => 4, 'reading_time' => 5],
            ['domain' => 'inter-operateurs-gpmag', 'title' => 'Cycle de vie ACR/ERR', 'slug' => 'flux-acr-err', 'excerpt' => 'Du PNMDATA à l\'accusé de réception.', 'file' => 'interop-flux-acr-err.html', 'level' => 'maitrise', 'sort_order' => 5, 'reading_time' => 4],
            ['domain' => 'outils-scripts', 'title' => 'PortaSync — Service de synchronisation', 'slug' => 'portasync', 'excerpt' => 'Rôle et fonctionnement de PortaSync.', 'file' => 'outils-portasync.html', 'level' => 'comprehension', 'sort_order' => 1, 'reading_time' => 4],
            ['domain' => 'outils-scripts', 'title' => 'Catalogue des scripts', 'slug' => 'scripts-catalogue', 'excerpt' => 'TraitementBascule.sh, exports CSV — scripts clés.', 'file' => 'outils-scripts-catalogue.html', 'level' => 'comprehension', 'sort_order' => 2, 'reading_time' => 8],
            ['domain' => 'outils-scripts', 'title' => 'Inventaire des serveurs', 'slug' => 'serveurs', 'excerpt' => 'Rôle de chaque serveur PNM.', 'file' => 'outils-serveurs.html', 'level' => 'decouverte', 'sort_order' => 3, 'reading_time' => 5],
            ['domain' => 'outils-scripts', 'title' => 'Processus de bascule', 'slug' => 'bascule', 'excerpt' => 'Le script TraitementBascule.sh en détail.', 'file' => 'outils-bascule.html', 'level' => 'maitrise', 'sort_order' => 4, 'reading_time' => 6],
            ['domain' => 'outils-scripts', 'title' => 'Monitoring et santé des systèmes', 'slug' => 'monitoring', 'excerpt' => 'Indicateurs de santé et résolution.', 'file' => 'outils-monitoring.html', 'level' => 'maitrise', 'sort_order' => 5, 'reading_time' => 5],
            ['domain' => 'outils-scripts', 'title' => 'Exploitation quotidienne', 'slug' => 'exploitation-quotidienne', 'excerpt' => 'Procédures opérationnelles PORTA.', 'file' => 'outils-exploitation-quotidienne.html', 'level' => 'maitrise', 'sort_order' => 6, 'reading_time' => 8],
            ['domain' => 'outils-scripts', 'title' => 'Cas pratique — Correction incohérence col.3', 'slug' => 'cas-pratique-incoherence-col3', 'excerpt' => 'Procédure complète pour corriger un ticket avec une col.3 incohérente dans un fichier PNMDATA reçu.', 'file' => 'outils-cas-pratique-incoherence.html', 'level' => 'maitrise', 'sort_order' => 7, 'reading_time' => 10],
            // SQL & Investigation
            ['domain' => 'sql-investigation', 'title' => 'C\'est quoi une base de données ?', 'slug' => 'base-de-donnees', 'excerpt' => 'Les 18 tables PORTA, à quoi sert chacune, le schéma relationnel.', 'file' => 'sql-01-base-de-donnees.html', 'level' => 'decouverte', 'sort_order' => 1, 'reading_time' => 6],
            ['domain' => 'sql-investigation', 'title' => 'SELECT — Lire des données', 'slug' => 'select', 'excerpt' => 'SELECT, LIMIT, ORDER BY, COUNT, DISTINCT — les bases de la lecture SQL.', 'file' => 'sql-02-select.html', 'level' => 'decouverte', 'sort_order' => 2, 'reading_time' => 5],
            ['domain' => 'sql-investigation', 'title' => 'WHERE — Filtrer les résultats', 'slug' => 'where', 'excerpt' => 'AND, OR, IN, BETWEEN, LIKE, IS NULL — filtrer avec précision.', 'file' => 'sql-03-where.html', 'level' => 'decouverte', 'sort_order' => 3, 'reading_time' => 6],
            ['domain' => 'sql-investigation', 'title' => 'JOIN — Croiser deux tables', 'slug' => 'join', 'excerpt' => 'INNER JOIN, LEFT JOIN — relier les tables pour obtenir une vue complète.', 'file' => 'sql-04-join.html', 'level' => 'comprehension', 'sort_order' => 4, 'reading_time' => 7],
            ['domain' => 'sql-investigation', 'title' => 'GROUP BY — Compter et résumer', 'slug' => 'group-by', 'excerpt' => 'COUNT, SUM, AVG, HAVING — résumer les données pour le reporting.', 'file' => 'sql-05-group-by.html', 'level' => 'comprehension', 'sort_order' => 5, 'reading_time' => 6],
            ['domain' => 'sql-investigation', 'title' => 'Enquête : trouver un numéro', 'slug' => 'enquete-numero', 'excerpt' => 'Scénario "le client dit que son numéro ne marche pas" — MSISDN → PORTAGE → ÉTAT → HISTORIQUE.', 'file' => 'sql-06-enquete-numero.html', 'level' => 'comprehension', 'sort_order' => 6, 'reading_time' => 7],
            ['domain' => 'sql-investigation', 'title' => 'Enquête : fichiers et ACR manquants', 'slug' => 'enquete-acr', 'excerpt' => 'Scénario "un fichier n\'a pas reçu d\'ACR" — FICHIER LEFT JOIN ACK.', 'file' => 'sql-07-enquete-acr.html', 'level' => 'comprehension', 'sort_order' => 7, 'reading_time' => 7],
            ['domain' => 'sql-investigation', 'title' => 'Enquête : refus de portage', 'slug' => 'enquete-refus', 'excerpt' => 'Scénario refus 1210/1220/7000 — DATA + CODE_REPONSE + CODE_TICKET.', 'file' => 'sql-08-enquete-refus.html', 'level' => 'maitrise', 'sort_order' => 8, 'reading_time' => 8],
            ['domain' => 'sql-investigation', 'title' => 'Enquête : suivi d\'une bascule', 'slug' => 'enquete-bascule', 'excerpt' => 'Scénario "bascule incomplète" — PORTAGE + HISTORIQUE + TRANSITION.', 'file' => 'sql-09-enquete-bascule.html', 'level' => 'maitrise', 'sort_order' => 9, 'reading_time' => 8],
            ['domain' => 'sql-investigation', 'title' => 'Enquête : conflits de synchronisation', 'slug' => 'enquete-sync', 'excerpt' => 'Scénario "conflit SYNC ouvert" — SYNC + SYNC_STATUS + MSISDN_HISTORIQUE.', 'file' => 'sql-10-enquete-sync.html', 'level' => 'maitrise', 'sort_order' => 10, 'reading_time' => 8],
        ];

        foreach ($articleDefinitions as $def) {
            $domain = $domains[$def['domain']];
            $filePath = $dataPath.'/'.$def['file'];
            $content = file_exists($filePath) ? file_get_contents($filePath) : '<p>Contenu à venir.</p>';

            Article::create([
                'domain_id' => $domain->id,
                'title' => $def['title'],
                'slug' => $def['slug'],
                'excerpt' => $def['excerpt'],
                'content' => $content,
                'level' => $def['level'],
                'sort_order' => $def['sort_order'],
                'reading_time_minutes' => $def['reading_time'],
                'is_published' => true,
            ]);
        }
    }

    private function seedArticleGlossaryLinks(): void
    {
        $articleTermMap = [
            'introduction' => ['PNM', 'ARCEP', 'GPMAG', 'OPR', 'OPD', 'OPA'],
            'acteurs-roles' => ['OPR', 'OPD', 'OPA', 'RIO', 'MSISDN'],
            'processus-portage' => ['OPR', 'OPD', 'RIO', 'PNM', 'GPMAG'],
            'tickets-types' => ['PNM', 'OPR', 'OPD', 'OPA'],
            'rio-decoder' => ['RIO', 'OPR', 'OPD', 'MSISDN'],
            'motifs-refus' => ['RIO', 'OPR', 'OPD', 'PNM'],
            'organisation' => ['BSS', 'OSS', 'CRM', 'DW', 'MIS'],
            'architecture-bss' => ['BSS', 'CRM', 'MOBI'],
            'portadb' => ['PortaDB', 'PortaSync', 'ESB', 'DataPower', 'MOBI', 'PortaWs'],
            'esb-datapower' => ['ESB', 'DataPower', 'PortaDB', 'MOBI', 'DAPI', 'PortaWs', 'PortaWebUi'],
            'architecture' => ['HLR', 'HSS', 'EPC', 'IMS', 'MSC', 'RAN'],
            'composants' => ['HLR', 'HSS', 'EPC', 'IMS', 'MSC'],
            'impact-portage' => ['HLR', 'HSS', 'MOBI', 'MSISDN', 'PNM'],
            'gpmag' => ['GPMAG', 'sFTP', 'PNMDATA', 'PNMSYNC', 'AR'],
            'fichiers-pnmdata' => ['PNMDATA', 'ACR', 'ERR', 'MSISDN', 'sFTP'],
            'fichiers-pnmsync' => ['PNMSYNC', 'MSISDN', 'sFTP'],
            'vacations' => ['PNMDATA', 'PNMSYNC', 'sFTP'],
            'flux-acr-err' => ['ACR', 'ERR', 'PNMDATA', 'sFTP'],
            'portasync' => ['PortaSync', 'PortaDB', 'BTCTF', 'sFTP'],
            'scripts-catalogue' => ['PortaDB', 'MOBI', 'EMA/EMM', 'DW', 'PortaSync'],
            'serveurs' => ['PortaDB', 'PortaSync', 'BTCTF', 'PortaWs', 'PortaWebUi', 'DAPI'],
            'bascule' => ['EMA/EMM', 'MOBI', 'PortaDB', 'PortaSync'],
            'monitoring' => ['PortaDB', 'PortaSync', 'ESB', 'BTCTF'],
            'exploitation-quotidienne' => ['PortaSync', 'PortaDB', 'EMA/EMM', 'PNMDATA', 'MOBI', 'PortaWs', 'PortaWebUi', 'DAPI', 'AR'],
            'cas-pratique-incoherence-col3' => ['PNMDATA', 'OPR', 'OPD', 'MSISDN', 'ACR', 'PortaSync', 'BTCTF', 'sFTP'],
            // SQL & Investigation
            'base-de-donnees' => ['PortaDB', 'PNM', 'MSISDN', 'PNMDATA', 'PNMSYNC', 'ACR'],
            'select' => ['PortaDB', 'MSISDN'],
            'where' => ['PortaDB', 'MSISDN', 'RIO'],
            'join' => ['PortaDB', 'MSISDN', 'ACR', 'PNMDATA'],
            'group-by' => ['PortaDB', 'MSISDN', 'PNMDATA'],
            'enquete-numero' => ['MSISDN', 'OPR', 'OPD', 'RIO', 'PNM'],
            'enquete-acr' => ['ACR', 'ERR', 'PNMDATA', 'sFTP'],
            'enquete-refus' => ['RIO', 'OPR', 'OPD', 'PNM'],
            'enquete-bascule' => ['OPR', 'OPD', 'GPMAG', 'PNM'],
            'enquete-sync' => ['PNMSYNC', 'MSISDN', 'GPMAG'],
        ];

        $articles = Article::all()->keyBy('slug');
        $terms = GlossaryTerm::all()->keyBy('abbreviation');

        foreach ($articleTermMap as $articleSlug => $termAbbreviations) {
            $article = $articles[$articleSlug] ?? null;
            if (! $article) {
                continue;
            }

            $termIds = [];
            foreach ($termAbbreviations as $abbr) {
                $term = $terms[$abbr] ?? null;
                if ($term) {
                    $termIds[] = $term->id;
                }
            }

            if (! empty($termIds)) {
                $article->glossaryTerms()->attach($termIds);
            }
        }
    }
}
