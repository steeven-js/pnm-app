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
            ['name' => 'PNM V3', 'slug' => 'pnm-v3', 'description' => 'Portabilité des Numéros Mobiles V3 — processus, acteurs, tickets et réglementation ARCEP pour les Antilles-Guyane.', 'icon' => '📱', 'color' => '#3b82f6', 'sort_order' => 1],
            ['name' => 'Systèmes d\'Information', 'slug' => 'systemes-information', 'description' => 'Organisation SI de Digicel — équipes, architecture BSS, PortaDB, ESB DataPower et flux de données.', 'icon' => '💻', 'color' => '#8b5cf6', 'sort_order' => 2],
            ['name' => 'Réseau & Infrastructure', 'slug' => 'reseau-infrastructure', 'description' => 'Architecture réseau télécom — Core Network, composants, routage et impact de la portabilité.', 'icon' => '🌐', 'color' => '#10b981', 'sort_order' => 3],
            ['name' => 'Inter-opérateurs & GPMAG', 'slug' => 'inter-operateurs-gpmag', 'description' => 'Échanges inter-opérateurs — GPMAG, fichiers PNMDATA/PNMSYNC, vacations et flux ACR/ERR.', 'icon' => '🤝', 'color' => '#f59e0b', 'sort_order' => 4],
            ['name' => 'Outils & Scripts', 'slug' => 'outils-scripts', 'description' => 'Outils internes — PortaSync, scripts de bascule, serveurs, monitoring et procédures opérationnelles.', 'icon' => '🔧', 'color' => '#ef4444', 'sort_order' => 5],
        ];

        foreach ($domains as $domain) {
            KnowledgeDomain::create($domain);
        }
    }

    private function seedGlossaryTerms(): void
    {
        $terms = [
            // PNM
            ['term' => 'Portabilité des Numéros Mobiles', 'abbreviation' => 'PNM', 'definition' => 'Mécanisme permettant à un abonné mobile de conserver son numéro de téléphone lorsqu\'il change d\'opérateur.', 'category' => 'PNM'],
            ['term' => 'Opérateur Receveur', 'abbreviation' => 'OPR', 'definition' => 'Opérateur vers lequel le client souhaite porter son numéro. Il initie la demande de portage.', 'category' => 'PNM'],
            ['term' => 'Opérateur Donneur', 'abbreviation' => 'OPD', 'definition' => 'Opérateur qui perd le client suite au portage. Il vérifie l\'éligibilité et transmet les informations nécessaires.', 'category' => 'PNM'],
            ['term' => 'Opérateur Attributaire', 'abbreviation' => 'OPA', 'definition' => 'Opérateur à qui le numéro a été initialement attribué par l\'ARCEP.', 'category' => 'PNM'],
            ['term' => 'Relevé d\'Identité Opérateur', 'abbreviation' => 'RIO', 'definition' => 'Code unique de 12 caractères identifiant un abonné auprès de son opérateur. Format : OO-Q-RRRRRR-CCC.', 'category' => 'PNM'],
            ['term' => 'Jour de Demande', 'abbreviation' => 'JD', 'definition' => 'Jour calendaire où l\'OPR transmet la demande de portage à l\'OPD via le ticket 1110.', 'category' => 'PNM'],
            ['term' => 'Jour de Portage', 'abbreviation' => 'JP', 'definition' => 'Jour effectif de bascule du numéro. JP = JD + 2 jours ouvrés pour la PNM V3 Antilles-Guyane.', 'category' => 'PNM'],
            ['term' => 'Groupement de Portabilité des Numéros Mobiles Antilles-Guyane', 'abbreviation' => 'GPMAG', 'definition' => 'Structure de gouvernance regroupant les opérateurs mobiles des Antilles-Guyane pour la gestion de la portabilité.', 'category' => 'PNM'],
            ['term' => 'Autorité de Régulation des Communications Électroniques', 'abbreviation' => 'ARCEP', 'definition' => 'Autorité administrative indépendante qui régule les télécommunications en France, y compris la portabilité.', 'category' => 'Réglementation'],

            // Systèmes
            ['term' => 'PortaDB', 'abbreviation' => 'PortaDB', 'definition' => 'Base de données centrale de la portabilité chez Digicel. Stocke les demandes de portage, historiques et états des numéros portés.', 'category' => 'Systèmes'],
            ['term' => 'PortaSync', 'abbreviation' => 'PortaSync', 'definition' => 'Service de synchronisation entre PortaDB et les systèmes inter-opérateurs. Gère les échanges de fichiers PNMDATA via sFTP.', 'category' => 'Systèmes'],
            ['term' => 'Enterprise Service Bus', 'abbreviation' => 'ESB', 'definition' => 'Bus d\'intégration (IBM DataPower) assurant la communication entre PortaDB et MOBI pour les mises à jour de portabilité.', 'category' => 'Systèmes'],
            ['term' => 'DataPower', 'abbreviation' => 'DataPower', 'definition' => 'Appliance IBM servant de bus d\'intégration (ESB) entre les systèmes PNM et les systèmes d\'activation opérateur.', 'category' => 'Systèmes'],
            ['term' => 'MOBI', 'abbreviation' => 'MOBI', 'definition' => 'Système de gestion des abonnés mobiles Digicel. Reçoit les instructions de bascule de portabilité via l\'ESB.', 'category' => 'Systèmes'],
            ['term' => 'EMA/EMM', 'abbreviation' => 'EMA/EMM', 'definition' => 'Systèmes de gestion des équipements mobiles utilisés lors du processus de bascule de portabilité.', 'category' => 'Systèmes'],
            ['term' => 'BTCTF', 'abbreviation' => 'BTCTF', 'definition' => 'Serveur dédié aux échanges inter-opérateurs de fichiers de portabilité via sFTP sécurisé.', 'category' => 'Systèmes'],
            ['term' => 'Business Support System', 'abbreviation' => 'BSS', 'definition' => 'Ensemble des systèmes IT supportant les processus métier : CRM, facturation, activation, selfcare.', 'category' => 'Systèmes'],
            ['term' => 'Operations Support System', 'abbreviation' => 'OSS', 'definition' => 'Ensemble des systèmes IT supportant les opérations réseau : supervision, gestion des pannes, performance.', 'category' => 'Systèmes'],
            ['term' => 'Customer Relationship Management', 'abbreviation' => 'CRM', 'definition' => 'Système de gestion de la relation client, premier point de contact pour les demandes de portage côté commercial.', 'category' => 'Systèmes'],
            ['term' => 'Data Warehouse', 'abbreviation' => 'DW', 'definition' => 'Entrepôt de données alimenté par les exports PortaDB pour le reporting et l\'analyse des portabilités.', 'category' => 'Systèmes'],

            // Réseau
            ['term' => 'Home Location Register', 'abbreviation' => 'HLR', 'definition' => 'Base de données réseau contenant les informations de localisation et de profil de chaque abonné mobile (2G/3G).', 'category' => 'Réseau'],
            ['term' => 'Home Subscriber Server', 'abbreviation' => 'HSS', 'definition' => 'Équivalent 4G/LTE du HLR. Base de données centralisée des profils abonnés pour le réseau EPC.', 'category' => 'Réseau'],
            ['term' => 'Evolved Packet Core', 'abbreviation' => 'EPC', 'definition' => 'Cœur de réseau 4G/LTE gérant la connectivité data, la mobilité et la qualité de service.', 'category' => 'Réseau'],
            ['term' => 'IP Multimedia Subsystem', 'abbreviation' => 'IMS', 'definition' => 'Architecture réseau pour la convergence voix/data/multimédia. Support de la VoLTE et des services enrichis.', 'category' => 'Réseau'],
            ['term' => 'Mobile Switching Center', 'abbreviation' => 'MSC', 'definition' => 'Commutateur central du réseau mobile 2G/3G. Gère les appels, SMS et la mobilité des abonnés.', 'category' => 'Réseau'],
            ['term' => 'Radio Access Network', 'abbreviation' => 'RAN', 'definition' => 'Réseau d\'accès radio composé des antennes (eNodeB/gNodeB) connectant les terminaux au cœur de réseau.', 'category' => 'Réseau'],

            // Inter-op
            ['term' => 'PNMDATA', 'abbreviation' => 'PNMDATA', 'definition' => 'Fichier d\'échange inter-opérateurs contenant les demandes de portage, réponses et notifications. Échangé via sFTP lors des vacations.', 'category' => 'Inter-opérateurs'],
            ['term' => 'PNMSYNC', 'abbreviation' => 'PNMSYNC', 'definition' => 'Fichier de synchronisation hebdomadaire contenant la liste complète des MSISDN portés par chaque opérateur. Échangé le dimanche.', 'category' => 'Inter-opérateurs'],
            ['term' => 'ACR', 'abbreviation' => 'ACR', 'definition' => 'Accusé de réception technique confirmant la bonne réception d\'un fichier PNMDATA par l\'opérateur destinataire.', 'category' => 'Inter-opérateurs'],
            ['term' => 'ERR', 'abbreviation' => 'ERR', 'definition' => 'Fichier d\'erreur retourné quand un PNMDATA est corrompu, mal formaté ou contient des incohérences.', 'category' => 'Inter-opérateurs'],
            ['term' => 'Vacation', 'abbreviation' => null, 'definition' => 'Créneau horaire fixe pour l\'échange de fichiers entre opérateurs. Trois vacations quotidiennes : V10 (10h), V14 (14h), V19 (19h).', 'category' => 'Inter-opérateurs'],
            ['term' => 'Secure File Transfer Protocol', 'abbreviation' => 'sFTP', 'definition' => 'Protocole de transfert de fichiers sécurisé utilisé pour les échanges de fichiers PNMDATA/PNMSYNC entre opérateurs.', 'category' => 'Inter-opérateurs'],
            ['term' => 'Mobile Station International Subscriber Directory Number', 'abbreviation' => 'MSISDN', 'definition' => 'Numéro de téléphone mobile international au format E.164 (ex: +596696XXXXXX).', 'category' => 'Réseau'],

            // Scripts & Outils
            ['term' => 'TraitementBascule.sh', 'abbreviation' => null, 'definition' => 'Script principal exécutant la bascule de portabilité : lecture des tickets 1410, envoi vers EMA/EMM, mise à jour MOBI.', 'category' => 'Scripts'],
            ['term' => 'PortaDB-export-csv.sh', 'abbreviation' => null, 'definition' => 'Script d\'export des données PortaDB au format CSV vers le Data Warehouse pour le reporting.', 'category' => 'Scripts'],
            ['term' => 'Mode dégradé', 'abbreviation' => null, 'definition' => 'Procédure d\'urgence activée quand une liaison sFTP ou un composant est indisponible. Implique retransmission manuelle et notifications.', 'category' => 'Opérations'],
            ['term' => 'Clé SSH', 'abbreviation' => 'SSH Key', 'definition' => 'Paire de clés cryptographiques (publique/privée) utilisée pour authentifier les connexions sFTP entre opérateurs.', 'category' => 'Sécurité'],
            ['term' => 'Management Information System', 'abbreviation' => 'MIS', 'definition' => 'Système d\'information décisionnel exploitant les données du Data Warehouse pour les rapports de pilotage.', 'category' => 'Systèmes'],
            ['term' => 'Mise en Production', 'abbreviation' => 'MEP', 'definition' => 'Déploiement d\'une application ou modification en environnement de production, après validation en recette.', 'category' => 'Opérations'],

            // Termes PORTA exploitation
            ['term' => 'Digicel Application Portability Interface', 'abbreviation' => 'DAPI', 'definition' => 'Couche d\'interfaces web services (WSDL/SOAP) exposée par les composants PNM de Digicel. Comprend les services DigicelFwiEsbWs4Porta, DigicelFwiPortaWs4Esb, DigicelFwiPortaWs4PortaSync et DigicelFwiPortaUiWs4Esb.', 'category' => 'Systèmes'],
            ['term' => 'Valorisation', 'abbreviation' => null, 'definition' => 'Opération de modification de l\'opérateur hébergeant dans les tables de routage réseau via une commande EMM. Correspond à un portage inverse (numéro déjà porté qui change à nouveau d\'opérateur).', 'category' => 'Opérations'],
            ['term' => 'Acquittement', 'abbreviation' => 'AR', 'definition' => 'Message de confirmation envoyé par un opérateur après réception et traitement d\'un fichier PNMDATA. L\'AR SYNC confirme la bonne synchronisation des données entre opérateurs.', 'category' => 'Inter-opérateurs'],
            ['term' => 'PortaWs', 'abbreviation' => 'PortaWs', 'definition' => 'Portail web et services DAPI hébergés sur vmqproportasync01 (http://172.24.119.72:8080/PortaWs/). Permet la consultation des portages en cours et expose les web services DigicelFwiPortaWs4Esb et DigicelFwiPortaWs4PortaSync.', 'category' => 'Systèmes'],
            ['term' => 'PortaWebUi', 'abbreviation' => 'PortaWebUi', 'definition' => 'Interface d\'administration web PNM hébergée sur vmqproportasync01 (http://172.24.119.71:8080/PortaWebUi/). Expose le service DigicelFwiPortaUiWs4Esb pour les opérations via l\'interface utilisateur.', 'category' => 'Systèmes'],
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
            // PNM V3
            ['domain' => 'pnm-v3', 'title' => 'Introduction à la PNM V3', 'slug' => 'introduction', 'excerpt' => 'Qu\'est-ce que la portabilité des numéros mobiles et pourquoi est-elle essentielle ?', 'file' => 'pnm-introduction.html', 'level' => 'decouverte', 'sort_order' => 1, 'reading_time' => 5],
            ['domain' => 'pnm-v3', 'title' => 'Les acteurs du portage : OPR, OPD, OPA', 'slug' => 'acteurs-roles', 'excerpt' => 'Comprendre les rôles et responsabilités de chaque opérateur dans le processus de portage.', 'file' => 'pnm-acteurs-roles.html', 'level' => 'decouverte', 'sort_order' => 2, 'reading_time' => 4],
            ['domain' => 'pnm-v3', 'title' => 'Processus de portage standard', 'slug' => 'processus-portage', 'excerpt' => 'Le parcours complet d\'une demande de portage, du ticket 1110 au 1430.', 'file' => 'pnm-processus-portage.html', 'level' => 'comprehension', 'sort_order' => 3, 'reading_time' => 7],
            ['domain' => 'pnm-v3', 'title' => 'Catalogue des types de tickets', 'slug' => 'tickets-types', 'excerpt' => 'Tous les types de tickets PNM : standard (1xxx), inverse (2xxx), restitution (3xxx).', 'file' => 'pnm-tickets-types.html', 'level' => 'comprehension', 'sort_order' => 4, 'reading_time' => 6],
            ['domain' => 'pnm-v3', 'title' => 'Décoder le RIO', 'slug' => 'rio-decoder', 'excerpt' => 'Comprendre la structure du Relevé d\'Identité Opérateur et sa validation.', 'file' => 'pnm-rio-decoder.html', 'level' => 'decouverte', 'sort_order' => 5, 'reading_time' => 4],
            ['domain' => 'pnm-v3', 'title' => 'Motifs de refus d\'éligibilité', 'slug' => 'motifs-refus', 'excerpt' => 'Les raisons de refus d\'un portage et les actions correctives pour chaque cas.', 'file' => 'pnm-motifs-refus.html', 'level' => 'comprehension', 'sort_order' => 6, 'reading_time' => 5],

            // Systèmes d'Information
            ['domain' => 'systemes-information', 'title' => 'Organisation du SI Digicel', 'slug' => 'organisation', 'excerpt' => 'Les 6 équipes SI, leurs missions et outils principaux.', 'file' => 'si-organisation.html', 'level' => 'decouverte', 'sort_order' => 1, 'reading_time' => 5],
            ['domain' => 'systemes-information', 'title' => 'Architecture BSS', 'slug' => 'architecture-bss', 'excerpt' => 'Le flux CRM → Facturation → Activation → Selfcare expliqué.', 'file' => 'si-architecture-bss.html', 'level' => 'comprehension', 'sort_order' => 2, 'reading_time' => 5],
            ['domain' => 'systemes-information', 'title' => 'PortaDB — Base de données PNM', 'slug' => 'portadb', 'excerpt' => 'Architecture, tables principales et rôle de PortaDB dans le processus de portabilité.', 'file' => 'si-portadb.html', 'level' => 'comprehension', 'sort_order' => 3, 'reading_time' => 6],
            ['domain' => 'systemes-information', 'title' => 'ESB DataPower', 'slug' => 'esb-datapower', 'excerpt' => 'Le bus d\'intégration entre PortaDB et MOBI : flux, transformations et monitoring.', 'file' => 'si-esb-datapower.html', 'level' => 'maitrise', 'sort_order' => 4, 'reading_time' => 6],

            // Réseau & Infrastructure
            ['domain' => 'reseau-infrastructure', 'title' => 'Architecture réseau télécom', 'slug' => 'architecture', 'excerpt' => 'Vue d\'ensemble du réseau Digicel : du terminal mobile au cœur de réseau.', 'file' => 'reseau-architecture.html', 'level' => 'decouverte', 'sort_order' => 1, 'reading_time' => 5],
            ['domain' => 'reseau-infrastructure', 'title' => 'Composants réseau clés', 'slug' => 'composants', 'excerpt' => 'HLR, HSS, EPC, IMS, MSC — rôle de chaque composant et impact en cas de panne.', 'file' => 'reseau-composants.html', 'level' => 'comprehension', 'sort_order' => 2, 'reading_time' => 5],
            ['domain' => 'reseau-infrastructure', 'title' => 'Impact de la portabilité sur le routage', 'slug' => 'impact-portage', 'excerpt' => 'Comment un numéro porté est routé à travers le réseau et les mises à jour nécessaires.', 'file' => 'reseau-impact-portage.html', 'level' => 'maitrise', 'sort_order' => 3, 'reading_time' => 4],

            // Inter-opérateurs & GPMAG
            ['domain' => 'inter-operateurs-gpmag', 'title' => 'Le GPMAG et ses opérateurs', 'slug' => 'gpmag', 'excerpt' => 'Structure de gouvernance, opérateurs membres et liaisons de la zone Antilles-Guyane.', 'file' => 'interop-gpmag.html', 'level' => 'decouverte', 'sort_order' => 1, 'reading_time' => 6],
            ['domain' => 'inter-operateurs-gpmag', 'title' => 'Anatomie d\'un fichier PNMDATA', 'slug' => 'fichiers-pnmdata', 'excerpt' => 'Structure, champs et convention de nommage des fichiers d\'échange de portabilité.', 'file' => 'interop-fichiers-pnmdata.html', 'level' => 'comprehension', 'sort_order' => 2, 'reading_time' => 6],
            ['domain' => 'inter-operateurs-gpmag', 'title' => 'Fichiers PNMSYNC et synchronisation', 'slug' => 'fichiers-pnmsync', 'excerpt' => 'Le processus de synchronisation hebdomadaire des bases de numéros portés.', 'file' => 'interop-fichiers-pnmsync.html', 'level' => 'comprehension', 'sort_order' => 3, 'reading_time' => 4],
            ['domain' => 'inter-operateurs-gpmag', 'title' => 'Le système de vacations', 'slug' => 'vacations', 'excerpt' => 'Les 3 créneaux quotidiens d\'échange de fichiers et la synchronisation du dimanche.', 'file' => 'interop-vacations.html', 'level' => 'decouverte', 'sort_order' => 4, 'reading_time' => 5],
            ['domain' => 'inter-operateurs-gpmag', 'title' => 'Cycle de vie ACR/ERR', 'slug' => 'flux-acr-err', 'excerpt' => 'Du PNMDATA à l\'accusé de réception — gestion des erreurs et retransmissions.', 'file' => 'interop-flux-acr-err.html', 'level' => 'maitrise', 'sort_order' => 5, 'reading_time' => 4],

            // Outils & Scripts
            ['domain' => 'outils-scripts', 'title' => 'PortaSync — Service de synchronisation', 'slug' => 'portasync', 'excerpt' => 'Rôle, fonctionnement et gestion du service PortaSync.', 'file' => 'outils-portasync.html', 'level' => 'comprehension', 'sort_order' => 1, 'reading_time' => 4],
            ['domain' => 'outils-scripts', 'title' => 'Catalogue des scripts', 'slug' => 'scripts-catalogue', 'excerpt' => 'TraitementBascule.sh, exports CSV, restitutions — tous les scripts clés expliqués.', 'file' => 'outils-scripts-catalogue.html', 'level' => 'comprehension', 'sort_order' => 2, 'reading_time' => 8],
            ['domain' => 'outils-scripts', 'title' => 'Inventaire des serveurs', 'slug' => 'serveurs', 'excerpt' => 'vmqproportawebdb01, vmqproportasync01, BTCTF — rôle de chaque serveur.', 'file' => 'outils-serveurs.html', 'level' => 'decouverte', 'sort_order' => 3, 'reading_time' => 5],
            ['domain' => 'outils-scripts', 'title' => 'Processus de bascule', 'slug' => 'bascule', 'excerpt' => 'Le script TraitementBascule.sh et le flux EMA/EMM → MOBI en détail.', 'file' => 'outils-bascule.html', 'level' => 'maitrise', 'sort_order' => 4, 'reading_time' => 6],
            ['domain' => 'outils-scripts', 'title' => 'Monitoring et santé des systèmes', 'slug' => 'monitoring', 'excerpt' => 'Quoi vérifier au quotidien, indicateurs de santé et résolution des problèmes courants.', 'file' => 'outils-monitoring.html', 'level' => 'maitrise', 'sort_order' => 5, 'reading_time' => 5],
            ['domain' => 'outils-scripts', 'title' => 'Exploitation quotidienne', 'slug' => 'exploitation-quotidienne', 'excerpt' => 'Procédures opérationnelles PORTA : vérifications à 9h, 10h15 et 11h15, commandes SSH et emails de supervision.', 'file' => 'outils-exploitation-quotidienne.html', 'level' => 'maitrise', 'sort_order' => 6, 'reading_time' => 8],
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
