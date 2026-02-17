import type { PnmEventConfig } from 'src/types/monitoring';

export const pnmEventsConfig: PnmEventConfig[] = [
    {
        key: 'bascule_in',
        label: 'Automate BASCULE_IN',
        description:
            "L'automate BASCULE_IN démarre à 00:15. Il bascule les numéros portés vers le réseau Digicel. Vérifier que l'automate a bien démarré et terminé sans erreur.",
        scheduledTime: '00:15',
        icon: 'solar:transfer-horizontal-bold-duotone',
        category: 'bascule',
        checklist: [
            'Email mgrntlog reçu (démarrage automate)',
            'Vérifier le nombre de lignes basculées',
            'Aucune erreur de bascule signalée',
            'Durée de bascule raisonnable (< 3h)',
        ],
    },
    {
        key: 'bascule_exploit',
        label: 'BASCULE_IN terminé + EXPLOIT',
        description:
            "L'automate BASCULE_IN est terminé et l'automate EXPLOIT démarre. Vérifier la volumétrie et que l'enchaînement est correct.",
        scheduledTime: '02:06',
        icon: 'solar:settings-bold-duotone',
        category: 'bascule',
        checklist: [
            'Email mgrntlog BASCULE_IN terminé reçu',
            'Automate EXPLOIT démarré',
            'Volumétrie BASCULE_IN cohérente',
            "Pas d'erreur dans les logs",
        ],
    },
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
    {
        key: 'vacation_1',
        label: '1ère vacation (6 opérateurs)',
        description:
            'Premier échange de fichiers PNMDATA avec les 6 opérateurs. Vérifier que tous les fichiers attendus ont été reçus et acquittés.',
        scheduledTime: '09:00',
        icon: 'solar:file-send-bold-duotone',
        category: 'vacation',
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
    {
        key: 'incidents',
        label: 'Incidents PNM détectés',
        description:
            'Email [PNM][INCIDENT] listant les incidents détectés : refus de portage (1210/1220), erreurs techniques (7000), AR non-reçus, fichiers non acquittés, conflits.',
        scheduledTime: '09:01',
        icon: 'solar:bug-bold-duotone',
        category: 'incident',
        checklist: [
            "Email [PNM][INCIDENT] reçu (ou aucun = pas d'incident)",
            'Refus 1210/1220 : lire motifs, traiter ou informer commercial',
            'Erreurs 7000 : vérifier données dossier',
            'AR non-reçus > 60 min : contacter opérateur',
            'Fichiers non acquittés : signaler si récurrent',
            'Conflits [OUVERT] : investiguer si récent (< 7j)',
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
    {
        key: 'pso_jour',
        label: 'PSO du jour Forfait',
        description:
            "Email PSO (Plan de Service Opérateur) du jour avec fichier CSV contenant les actions de portabilité prévues.",
        scheduledTime: '10:16',
        icon: 'solar:clipboard-list-bold-duotone',
        category: 'reporting',
        checklist: [
            'Email [PNMV3] PSO du jour reçu',
            'Ouvrir fichier Pnm_PSO_MOBI CSV',
            'Volumétrie cohérente avec prévisions veille',
            "Pas d'écart > 20% avec la prévision",
        ],
    },
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
    {
        key: 'vacation_2',
        label: '2ème vacation',
        description:
            'Deuxième échange de fichiers PNMDATA. Comparer avec la 1ère vacation : les fichiers manquants en Vac1 sont-ils réapparus ?',
        scheduledTime: '14:00',
        icon: 'solar:file-download-bold-duotone',
        category: 'vacation',
        checklist: [
            'Email porta_pnmv3 2ème vacation reçu',
            'Fichiers échangés = fichiers attendus',
            'Comparer avec vacation 1 : fichiers manquants réapparus ?',
            'Vérifier ACR pour tous les opérateurs',
            'Aucun fichier .ERR détecté',
        ],
    },
    {
        key: 'automates_report',
        label: 'Rapport activité automates',
        description:
            "Rapport d'activité des automates : BASCULE_IN, EXPLOIT, RATP_OLN, TRACE, WATCHER. Fichiers CSV et LOG joints.",
        scheduledTime: '15:25',
        icon: 'solar:monitor-smartphone-bold-duotone',
        category: 'supervision',
        checklist: [
            'Email rapport activité automates reçu',
            'Automate BASCULE_IN : SUCCESS',
            'Automate EXPLOIT : SUCCESS',
            'Automate RATP_OLN : SUCCESS',
            'Automate TRACE : SUCCESS',
            'Automate WATCHER : SUCCESS',
            'Si KO : escalader supervision avec détail',
        ],
    },
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
    {
        key: 'vacation_3',
        label: '3ème vacation + clôture',
        description:
            'Troisième et dernière vacation. Rapport envoi/réception du jour. Clôture de la journée PNM.',
        scheduledTime: '19:00',
        icon: 'solar:check-circle-bold-duotone',
        category: 'vacation',
        checklist: [
            'Email porta_pnmv3 3ème vacation reçu',
            'Fichiers échangés = fichiers attendus',
            'Rapport envoi/réception du jour vérifié',
            'Tous les incidents du jour traités ou escaladés',
            'Journée PNM clôturée : bilan complet',
        ],
    },
];
