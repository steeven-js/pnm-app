import type { PnmEventConfig } from 'src/types/monitoring';

export const pnmEventsConfig: PnmEventConfig[] = [
    // ── 04:00 ──
    {
        key: 'cto_rattrapage',
        label: 'CTO Bascule tardive/échec',
        description:
            'Email CTO de rattrapage pour bascules échouées ou tardives. Contient les fichiers Rattrapage_CTO pour MQ, GF, GP avec les MSISDN à rattraper.',
        scheduledTime: '04:00',
        icon: 'solar:danger-triangle-bold-duotone',
        category: 'bascule',
        checklist: [
            'Email CTO rattrapage reçu',
            'Lire fichiers Rattrapage_CTO_MQ.txt, _GF.txt, _GP.txt',
            'Vérifier si des MSISDN nécessitent rattrapage',
            'Pour chaque MSISDN : vérifier statut dans PORTA-V3',
            'Relancer bascule manuelle si nécessaire',
            'Escalader N+1 si échec persistant',
        ],
    },
    // ── 09:00 ──
    {
        key: 'verif_bascule_valorisation',
        label: 'Vérif bascule & valorisation PORTA',
        description:
            'Vérification serveur vmqproportasync01 : traitement bascule (EmaExtracter.log) et valorisation (EmmExtracter.log). Tous les opérateurs doivent être "Check success".',
        scheduledTime: '09:00',
        icon: 'solar:server-bold-duotone',
        category: 'supervision',
        emailSubjects: [
            { subject: '[PNMV3]Verification Bascule Porta MOBI', origin: 'internal' },
            { subject: '[PNMV3]Verification Bascule Porta MOBI : FIN', origin: 'internal' },
            { subject: '[PNM]Controle fichier batchhandler FNR_V3 sur EMA', origin: 'internal' },
        ],
        checklist: [
            // EmaExtracter — bascule
            'EmaExtracter : Orange Caraïbe Check success',
            'EmaExtracter : Digicel AFG Check success',
            'EmaExtracter : Outremer Telecom / SFR Check success',
            'EmaExtracter : Dauphin Telecom Check success',
            'EmaExtracter : UTS Caraibe Check success',
            'EmaExtracter : Free Caraibes Check success',
            'EmaExtracter : Bascules ajoutées + Fin traitement',
            // EmmExtracter — valorisation
            'EmmExtracter : Orange Caraïbe Check success',
            'EmmExtracter : Digicel AFG Check success',
            'EmmExtracter : Outremer Telecom / SFR Check success',
            'EmmExtracter : Dauphin Telecom Check success',
            'EmmExtracter : UTS Caraibe Check success',
            'EmmExtracter : Free Caraibes Check success',
            'EmmExtracter : Valorisation + Fin traitement',
        ],
    },
    {
        key: 'rio_reporting',
        label: 'Reporting RIO incorrect',
        description:
            'Reporting des RIO incorrects en entrante et sortante. Vérifier les refus liés à des RIO invalides.',
        scheduledTime: '09:00',
        icon: 'solar:card-bold-duotone',
        category: 'reporting',
        checklist: [
            'Email reporting RIO reçu',
            'Nombre de refus entrante (RIO incorrect)',
            'Nombre de refus sortante',
            'Vérifier chaque RIO via Verify/RIO Validator',
            'Relancer avec RIO corrigé ou contacter client',
        ],
    },
    // ── 09:01 ──
    {
        key: 'incidents',
        label: 'Incidents PNM détectés',
        description:
            'Email [PNM][INCIDENT] listant les incidents détectés : refus de portage (1210/1220), erreurs techniques (7000), AR non-reçus, fichiers non acquittés, conflits.',
        scheduledTime: '09:01',
        icon: 'solar:bug-bold-duotone',
        category: 'incident',
        emailSubjects: [
            { subject: '[PNM][INCIDENT]', origin: 'internal' },
            { subject: 'PNM INCIDENT : Numeros en ecart dans le fichier de synchronisation', origin: 'external' },
        ],
        checklist: [
            "Email [PNM][INCIDENT] reçu (ou aucun = pas d'incident)",
            'Refus 1210/1220 : lire motifs, traiter ou informer commercial',
            'Erreurs 7000 : vérifier données dossier',
            'AR non-reçus > 60 min : contacter opérateur',
            'Fichiers non acquittés : signaler si récurrent',
            'Conflits [OUVERT] : investiguer si récent (< 7j)',
        ],
    },
    // ── 10:15 ──
    {
        key: 'verif_generation_pnmdata',
        label: 'Vérif génération fichiers vacation',
        description:
            'Vérification serveur vmqproportasync01 : génération des fichiers PNMDATA de vacation (PnmDataManager.log). Vérifier que les fichiers ont été générés pour les 5 opérateurs avec le nombre de tickets.',
        scheduledTime: '10:15',
        icon: 'solar:file-check-bold-duotone',
        category: 'supervision',
        checklist: [
            'PnmDataManager : Fichier PNMDATA op. 01 généré',
            'PnmDataManager : Fichier PNMDATA op. 03 généré',
            'PnmDataManager : Fichier PNMDATA op. 04 généré',
            'PnmDataManager : Fichier PNMDATA op. 05 généré',
            'PnmDataManager : Fichier PNMDATA op. 06 généré',
            'PnmDataManager : Traitement terminé sans erreur',
        ],
    },
    // ── 10:16 ──
    {
        key: 'pso_jour',
        label: 'PSO du jour Forfait',
        description:
            "Email PSO (Plan de Service Opérateur) du jour avec fichier CSV contenant les actions de portabilité prévues.",
        scheduledTime: '10:16',
        icon: 'solar:clipboard-list-bold-duotone',
        category: 'reporting',
        emailSubjects: [
            { subject: '[PNM] Verification des resiliations pour PSO', origin: 'internal' },
        ],
        checklist: [
            'Email [PNMV3] PSO du jour reçu',
            'Ouvrir fichier Pnm_PSO_MOBI CSV',
            'Volumétrie cohérente avec prévisions veille',
            "Pas d'écart > 20% avec la prévision",
        ],
    },
    // ── 11:15 ──
    {
        key: 'verif_acquittements',
        label: 'Vérif acquittements & portages en cours',
        description:
            'Vérification serveur vmqproportasync01 : acquittements fichiers PNMDATA (PnmAckManager.log). Vérifier absence d\'AR SYNC non-reçu. Contrôler les portages entrants "En cours" via PortaWs.',
        scheduledTime: '11:15',
        icon: 'solar:shield-check-bold-duotone',
        category: 'supervision',
        checklist: [
            'PnmAckManager : Op. 03 — Aucun AR SYNC non-reçu',
            'PnmAckManager : Op. 04 — Aucun AR SYNC non-reçu',
            'PnmAckManager : Op. 05 — Aucun AR SYNC non-reçu',
            'PnmAckManager : Op. 06 — Aucun AR SYNC non-reçu',
            'Portages entrants "En cours" vérifiés sur PortaWs',
            'Si portage en attente > 24h : relancer opérateur donneur',
        ],
    },
    // ── 11:30 ──
    {
        key: 'tickets_attente',
        label: 'Tickets en attente',
        description:
            'Tickets 1210 (Dauphin Télécom) en attente et tickets généraux. Fichiers XLS joints à traiter par ancienneté.',
        scheduledTime: '11:30',
        icon: 'solar:ticket-bold-duotone',
        category: 'incident',
        checklist: [
            'Email tickets 1210 reçu',
            'Email tickets en attente reçu',
            'Tickets 1210 DT : < 3j surveiller, 3-5j relancer, > 5j escalader',
            'Tickets généraux : trier par ancienneté',
            'Traiter les tickets les plus anciens en priorité',
        ],
    },
    // ── 11:35 ──
    {
        key: 'vacation_1',
        label: '1ère vacation (6 opérateurs)',
        description:
            'Premier échange de fichiers PNMDATA avec les 6 opérateurs. Vérifier que tous les fichiers attendus ont été reçus et acquittés.',
        scheduledTime: '11:35',
        icon: 'solar:file-send-bold-duotone',
        category: 'vacation',
        emailSubjects: [
            { subject: '[PNM] 1ere vacation', origin: 'internal' },
        ],
        checklist: [
            'Email porta_pnmv3 vacation reçu',
            'Fichiers échangés = fichiers attendus',
            'Opérateur 01 (Orange Caraïbe) : fichier reçu + ACR OK',
            'Opérateur 03 (SFR Caraïbe) : fichier reçu + ACR OK',
            'Opérateur 04 (Dauphin Télécom) : fichier reçu + ACR OK',
            'Opérateur 05 (UTS) : fichier reçu + ACR OK',
            'Opérateur 06 (FREEC) : fichier reçu + ACR OK',
            'Aucun fichier .ERR détecté',
        ],
    },
    // ── 15:25 ──
    {
        key: 'automates_report',
        label: 'Rapport activité automates',
        description:
            "Email [PROD] Rapport d'activité automates (supervision@digicelgroup.fr) avec PJ : automates_activity.csv, automates_detail.csv, mgrntlog_global.log. Couvre BASCULE_IN, EXPLOIT, RATP_OLN, TRACE, WATCHER.",
        scheduledTime: '15:25',
        icon: 'solar:monitor-smartphone-bold-duotone',
        category: 'supervision',
        checklist: [
            'Email rapport activité automates reçu',
            'Automate BASCULE_IN : SUCCESS',
            'Durée de bascule raisonnable (< 3h)',
            'Automate EXPLOIT : SUCCESS',
            'Automate RATP_OLN : SUCCESS',
            'Automate TRACE : SUCCESS',
            'Automate WATCHER : SUCCESS',
            'Si KO : escalader supervision avec détail',
        ],
    },
    // ── 15:31 ──
    {
        key: 'prevision_portabilites',
        label: 'Portabilités prévues DIGICEL/WIZZEE',
        description:
            'Reporting des portabilités prévues pour DIGICEL et WIZZEE (entrantes/sortantes) + portabilités internes de la veille.',
        scheduledTime: '15:31',
        icon: 'solar:chart-bold-duotone',
        category: 'reporting',
        checklist: [
            'Email prévision portabilités reçu',
            'Nombre portabilités IN prévues',
            'Nombre portabilités OUT prévues',
            'Vérifier portabilités internes veille',
            'Volumétrie cohérente avec tendance',
        ],
    },
    // ── 15:35 ──
    {
        key: 'vacation_2',
        label: '2ème vacation',
        description:
            'Deuxième échange de fichiers PNMDATA. Comparer avec la 1ère vacation : les fichiers manquants en Vac1 sont-ils réapparus ?',
        scheduledTime: '15:35',
        icon: 'solar:file-download-bold-duotone',
        category: 'vacation',
        emailSubjects: [
            { subject: '[PNM] 2eme vacation', origin: 'internal' },
        ],
        checklist: [
            'Email porta_pnmv3 2ème vacation reçu',
            'Fichiers échangés = fichiers attendus',
            'Comparer avec vacation 1 : fichiers manquants réapparus ?',
            'Vérifier ACR pour tous les opérateurs',
            'Aucun fichier .ERR détecté',
        ],
    },
    // ── 20:35 ──
    {
        key: 'vacation_3',
        label: '3ème vacation + clôture',
        description:
            'Troisième et dernière vacation. Rapport envoi/réception du jour. Clôture de la journée PNM.',
        scheduledTime: '20:35',
        icon: 'solar:check-circle-bold-duotone',
        category: 'vacation',
        emailSubjects: [
            { subject: '[PNM] 3eme vacation', origin: 'internal' },
        ],
        checklist: [
            'Email porta_pnmv3 3ème vacation reçu',
            'Fichiers échangés = fichiers attendus',
            'Rapport envoi/réception du jour vérifié',
            'Tous les incidents du jour traités ou escaladés',
            'Journée PNM clôturée : bilan complet',
        ],
    },
];
