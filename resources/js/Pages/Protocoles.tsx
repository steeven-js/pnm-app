import { useCallback, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { DashboardLayout } from 'src/layouts/dashboard/layout';

// ─── Types ──────────────────────────────────────────────────────────────────

type Category = 'liberation' | 'portabilite' | 'exploitation' | 'facturation' | 'debug';

type Protocole = {
  id: string;
  title: string;
  category: Category;
  summary: string;
  serveur: string;
  utilisateur: string;
  tags: string[];
  steps: Step[];
};

type Step = {
  title: string;
  content: string;
  code?: string;
  warning?: string;
};

// ─── Config ─────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<Category, { label: string; color: string; icon: string }> = {
  liberation: { label: 'Libération', color: '#22c55e', icon: 'solar:lock-keyhole-unlocked-bold-duotone' },
  portabilite: { label: 'Portabilité', color: '#8b5cf6', icon: 'solar:transfer-horizontal-bold-duotone' },
  exploitation: { label: 'Exploitation', color: '#3b82f6', icon: 'solar:settings-bold-duotone' },
  facturation: { label: 'Facturation', color: '#f97316', icon: 'solar:bill-list-bold-duotone' },
  debug: { label: 'Debug / Diagnostic', color: '#ef4444', icon: 'solar:bug-bold-duotone' },
};

const CATEGORIES = Object.keys(CATEGORY_CONFIG) as Category[];

// ─── Data ───────────────────────────────────────────────────────────────────

const PROTOCOLES: Protocole[] = [
  // ── Libération IMEI ──
  {
    id: 'p1',
    title: 'Libération IMEI',
    category: 'liberation',
    summary: 'Débloquer un IMEI verrouillé dans APP_OCS pour permettre une nouvelle affectation.',
    serveur: 'vmqprostdb01',
    utilisateur: 'oracle',
    tags: ['IMEI', 'APP_OCS', 'liberation_IMEI.sh', 'MasterCRM'],
    steps: [
      {
        title: 'Connexion au serveur',
        content: 'Se connecter en SSH au serveur de production.',
        code: 'ssh oracle@vmqprostdb01',
      },
      {
        title: 'Accéder au répertoire',
        content: 'Naviguer vers le répertoire de libération IMEI.',
        code: 'cd ~/script/LIBERATION/IMEI/',
      },
      {
        title: 'Lancer le script',
        content: 'Exécuter le script en mode verbose. Il demande le numéro de ticket RT puis le ou les IMEI.',
        code: './liberation_IMEI.sh -v',
      },
      {
        title: 'Contrôle visuel',
        content: 'Le script affiche les informations de l\'IMEI :\n• HD_IMEI_NUMBER : numéro IMEI\n• HA_INTERNAL_NAME : modèle terminal (ex: Samsung Galaxy A17 5G)\n• STATUS : statut actuel (7 = vendu)\n• LAST_STOCK : dernier stock\n• LINE_NO / LINE_MSISDN_ACT : ligne associée\n\nVérifier les informations puis appuyer sur "Sortir" pour valider.',
      },
      {
        title: 'Vérifier le résultat',
        content: 'Le script affiche "Mail envoyé en commentaire sur le ticket XXXXXX". Un fichier liberation_imei_info_*.txt est posté automatiquement en PJ sur le ticket RT.',
      },
      {
        title: 'Fermer le ticket RT',
        content: 'Répondre au demandeur sur le ticket RT :\n\n"Bonjour,\nL\'IMEI a été libéré.\nJe ferme donc le ticket.\n--\nCdt,\n[Prénom NOM]\nEquipe Application"\n\nPuis fermer le ticket (statut : résolu).',
      },
    ],
  },

  // ── Libération MSISDN ──
  {
    id: 'p2',
    title: 'Libération MSISDN (Réaffectation numéro)',
    category: 'liberation',
    summary: 'Remettre un numéro MSISDN en disponibilité (statut 7) pour réaffectation.',
    serveur: 'vmqprostdb01',
    utilisateur: 'oracle',
    tags: ['MSISDN', 'réaffectation', 'MSISDN_STATUS', 'MS_CLASS', 'statut 7'],
    steps: [
      {
        title: 'Connexion au serveur',
        content: 'Se connecter en SSH au serveur de production.',
        code: 'ssh oracle@vmqprostdb01',
      },
      {
        title: 'Option A — Script automatisé',
        content: 'Naviguer vers le répertoire et lancer le script.',
        code: 'cd ~/script/LIBERATION/\n./liberation_MSISDN.sh -v',
      },
      {
        title: 'Option B — SQL manuel : Vérifier l\'état',
        content: 'Se connecter à Oracle MOBI et vérifier l\'état du MSISDN.',
        code: 'sqlplus pb/gaston@MCST50A.BTC.COM\n\nSELECT MSISDN_NO, ST_MSISDN_ID, MSISDN_STATUS, MS_CLASS, MSISDN_CHANGE\nFROM MSISDN\nWHERE MSISDN_NO = \'069XXXXXXX\';',
      },
      {
        title: 'Option B — SQL manuel : Remettre en disponibilité',
        content: 'Passer le MSISDN en statut 7 (disponible).',
        code: 'UPDATE MSISDN\nSET ST_MSISDN_ID = \'0\',\n    MSISDN_STATUS = \'7\',\n    MS_CLASS = \'0\'\nWHERE MSISDN_NO = \'069XXXXXXX\';\nCOMMIT;',
        warning: 'Après activation par le commercial, mettre à jour MS_CLASS : UPDATE MSISDN SET MS_CLASS=\'73\' WHERE MSISDN_NO=\'069XXXXXXX\'; COMMIT;',
      },
      {
        title: 'Vérifier dans PortaDB',
        content: 'Avant toute action, vérifier que le numéro est bien chez Digicel (operateur_id_actuel = 2).',
        code: 'mysql -e "SELECT msisdn, operateur_id_actuel FROM PortaDB.MSISDN WHERE msisdn = \'069XXXXXXX\';"',
        warning: 'Si operateur_id_actuel != 2, le numéro n\'est plus chez Digicel. Informer le demandeur.',
      },
      {
        title: 'Fermer le ticket RT',
        content: '"Bonjour,\nLe numéro a été remis en disponibilité.\nLe commercial peut procéder à l\'activation.\nJe ferme le ticket.\n--\nCdt,\n[Prénom NOM]\nEquipe Application"',
      },
    ],
  },

  // ── Libération SIM ──
  {
    id: 'p3',
    title: 'Libération SIM (Carte SIM)',
    category: 'liberation',
    summary: 'Détacher une carte SIM d\'une ligne ou d\'un stock pour permettre sa réaffectation.',
    serveur: 'vmqprostdb01',
    utilisateur: 'oracle',
    tags: ['SIM', 'ICCID', 'SIM_STATUS', 'carte SIM'],
    steps: [
      {
        title: 'Connexion au serveur',
        content: 'Se connecter en SSH au serveur de production.',
        code: 'ssh oracle@vmqprostdb01',
      },
      {
        title: 'Accéder au répertoire',
        content: 'Naviguer vers le répertoire de libération SIM.',
        code: 'cd ~/script/LIBERATION/SIM/',
      },
      {
        title: 'Vérifier l\'état de la SIM',
        content: 'Se connecter à Oracle MOBI et vérifier l\'état actuel.\nFormat ICCID Digicel : 8959620XXXXXXXXXXXX (19-20 chiffres).',
        code: 'sqlplus pb/gaston@MCST50A.BTC.COM\n\nSELECT SIM_NO, SIM_STATUS, ST_SIM_ID, SIM_STOCK_CODE, SIM_CHANGE\nFROM SIM\nWHERE SIM_NO = \'8959620XXXXXXXXXXXX\';',
      },
      {
        title: 'Vérifier que la SIM n\'est pas sur une ligne active',
        content: 'Important : ne PAS libérer une SIM associée à une ligne active.',
        code: 'SELECT LINE_NO, LINE_MSISDN_ACTIVE, LINE_STATUS\nFROM LINE\nWHERE LINE_SIM_NO = \'8959620XXXXXXXXXXXX\';',
        warning: 'Si une ligne active est associée, NE PAS libérer. Informer le demandeur.',
      },
      {
        title: 'Libérer la SIM',
        content: 'Remettre la SIM en stock disponible.',
        code: 'UPDATE SIM\nSET SIM_STATUS = \'0\',\n    ST_SIM_ID = \'0\',\n    SIM_CHANGE = TRUNC(SYSDATE)\nWHERE SIM_NO = \'8959620XXXXXXXXXXXX\';\nCOMMIT;',
      },
      {
        title: 'Fermer le ticket RT',
        content: '"Bonjour,\nLa carte SIM a été libérée.\nJe ferme le ticket.\n--\nCdt,\n[Prénom NOM]\nEquipe Application"',
      },
    ],
  },

  // ── Libération Offre ──
  {
    id: 'p4',
    title: 'Libération Offre (customer_package)',
    category: 'liberation',
    summary: 'Libérer une offre bloquée dans customer_package pour permettre un changement d\'offre.',
    serveur: 'vmqprostdb01',
    utilisateur: 'oracle',
    tags: ['offre', 'customer_package', 'pack_end_activation', 'CTO'],
    steps: [
      {
        title: 'Connexion à Oracle MOBI',
        content: 'Se connecter au serveur puis à la base Oracle.',
        code: 'ssh oracle@vmqprostdb01\nsqlplus pb/gaston@MCST50A.BTC.COM',
      },
      {
        title: 'Identifier le pack_id bloqué',
        content: 'Rechercher les packages actifs du client.',
        code: 'SELECT PACK_ID, PACK_CODE, PACK_START_ACTIVATION, PACK_END_ACTIVATION\nFROM CUSTOMER_PACKAGE\nWHERE LI_CUSTOMER_NO = XXXXXXX\nAND PACK_END_ACTIVATION IS NULL;',
      },
      {
        title: 'Forcer la date de fin d\'activation',
        content: 'Mettre à jour pack_end_activation pour libérer l\'offre.',
        code: 'UPDATE CUSTOMER_PACKAGE\nSET PACK_END_ACTIVATION = TRUNC(SYSDATE)\nWHERE PACK_ID IN (\'XXXX\');\nCOMMIT;',
        warning: 'Vérifier le PACK_ID avant de mettre à jour. Ne pas libérer un package actif légitime.',
      },
      {
        title: 'Fermer le ticket RT',
        content: '"Bonjour,\nL\'offre a été libérée. Le changement d\'offre peut maintenant être effectué.\nJe ferme le ticket.\n--\nCdt,\n[Prénom NOM]\nEquipe Application"',
      },
    ],
  },

  // ── Remise offre famille ──
  {
    id: 'p5',
    title: 'Remise offre famille non appliquée',
    category: 'debug',
    summary: 'Corriger une remise offre famille (item 3920854) qui n\'apparaît pas sur la facture malgré l\'activation.',
    serveur: 'vmqprostdb01',
    utilisateur: 'oracle',
    tags: ['remise', 'offre famille', 'RATP_ITEM', 'line_active_item', 'item 3920854'],
    steps: [
      {
        title: 'Connexion à Oracle MOBI',
        content: 'Se connecter au serveur puis à la base Oracle.',
        code: 'ssh oracle@vmqprostdb01\nsqlplus pb/gaston@MCST50A.BTC.COM',
      },
      {
        title: 'Supprimer l\'item existant (nettoyage)',
        content: 'Insérer une demande de suppression dans RATP_ITEM puis exécuter la procédure.',
        code: '-- Suppression item existant\nINSERT INTO RATP_ITEM\nSELECT li_customer_no, dossier_no, line_no, 3920854, \'I\',\n       TO_DATE(sysdate,\'DD/MM/YYYY\'), \' \', 0, \'SUPPRESSION\'\nFROM LINE\nWHERE line_msisdn_active IN (\'069XXXXXXX\');\nCOMMIT;\n\n-- Exécution procédure de suppression\nBEGIN\n  PB.SUPP_ITEM_MASSE;\n  COMMIT;\nEND;',
      },
      {
        title: 'Réinsérer l\'item offre famille',
        content: 'Insérer l\'item et exécuter la procédure d\'insertion.',
        code: '-- Ajout item offre famille\nINSERT INTO RATP_ITEM\nSELECT li.li_CUSTOMER_NO, li.DOSSIER_NO, li.LINE_NO, 3920854, \'I\',\n       TO_DATE(sysdate,\'DD/MM/YYYY\'), \' \', 1, \'AJOUT\'\nFROM LINE li\nWHERE li.line_msisdn_active IN (\'069XXXXXXX\');\nCOMMIT;\n\n-- Exécution procédure d\'insertion dans la LAI\nBEGIN\n  PB.RATP_ITEM_MANQUANT_2;\n  COMMIT;\nEND;',
      },
      {
        title: 'Mettre à jour les dates dans line_active_item',
        content: 'Mettre les dates de fin à 31/12/2050 pour que la remise reste active.',
        code: 'UPDATE LINE_ACTIVE_ITEM\nSET LI_END_BILL_DATE = \'31/12/2050\',\n    LI_END_LINKAFTER = \'31/12/2050\'\nWHERE LINE_NO = \'XXXXXXX\'     -- le line_no du client\nAND ITEM_CODE = \'3920854\';     -- l\'item offre famille\nCOMMIT;',
        warning: 'Récupérer le LINE_NO correct avant d\'exécuter. Vérifier avec : SELECT LINE_NO FROM LINE WHERE LINE_MSISDN_ACTIVE = \'069XXXXXXX\';',
      },
      {
        title: 'Fermer le ticket RT',
        content: '"Bonjour,\nLa remise a été insérée.\nJe ferme donc le ticket.\n--\nCdt,\n[Prénom NOM]\nEquipe Application"',
      },
    ],
  },

  // ── MAJ Fidélisation APP_OCS 11561 ──
  {
    id: 'p6',
    title: 'MAJ Fidélisation / Réengagement (APP_OCS 11561)',
    category: 'exploitation',
    summary: 'Mettre à jour la date de fidélisation ou réengager une ligne via APP_OCS requête 11561.',
    serveur: 'vmqprostdb01',
    utilisateur: 'oracle',
    tags: ['fidélisation', 'réengagement', 'APP_OCS', '11561', 'MAJ_date_FID', 'date_fin_abo'],
    steps: [
      {
        title: 'Accéder à APP_OCS',
        content: 'Ouvrir l\'interface web APP_OCS supervision.',
        code: 'http://172.24.114.165/OCS/supervision/index.php',
      },
      {
        title: 'Exécuter la requête 11561',
        content: 'APP_OCS 11561 permet de mettre à jour :\n• date_fin_abo : date de fin d\'abonnement\n• date_ref_anciennete : date de référence ancienneté\n• date_eligible_fid : date éligibilité fidélisation\n\nRenseigner :\n• MSISDN du client\n• Numéro de ticket RT\n• Type de trace : MAJ_date_FID ou MAJ_date_engagement_et_FID',
      },
      {
        title: 'Vérifier la trace automatique',
        content: 'APP_OCS envoie automatiquement un commentaire sur le ticket RT avec la trace :\nmsisdn, date_fin_abo, date_ref_anciennete, date_eligible_fid, numero_rt, type_trace, code_user_trace, code requete : 11561\n\nPJ : Trace_actions_bd_user.log',
      },
      {
        title: 'Fermer le ticket RT',
        content: '"Bonjour,\nLa mise à jour a été effectuée.\nJe ferme donc le ticket.\n--\nCdt,\n[Prénom NOM]\nEquipe Application"',
      },
    ],
  },

  // ── Annulation FID APP_OCS 11605 ──
  {
    id: 'p7',
    title: 'Annulation Fidélisation (APP_OCS 11605)',
    category: 'exploitation',
    summary: 'Annuler une fidélisation avant libération IMEI, via APP_OCS requête 11605.',
    serveur: 'vmqprostdb01',
    utilisateur: 'oracle',
    tags: ['fidélisation', 'annulation', 'APP_OCS', '11605', 'changement terminal'],
    steps: [
      {
        title: 'Accéder à APP_OCS',
        content: 'Ouvrir l\'interface web APP_OCS supervision.',
        code: 'http://172.24.114.165/OCS/supervision/index.php',
      },
      {
        title: 'Exécuter la requête 11605',
        content: 'APP_OCS 11605 annule la fidélisation en cours.\nRenseigner le MSISDN et le numéro de ticket RT.',
        warning: 'Procédure multi-étapes sur 3 jours. Étape 1 : annulation FID (11605), puis libération IMEI après confirmation.',
      },
      {
        title: 'Libérer l\'IMEI',
        content: 'Après annulation FID confirmée, procéder à la libération IMEI (voir protocole Libération IMEI).',
      },
      {
        title: 'Fermer le ticket RT',
        content: 'Fermer le ticket après toutes les étapes complétées.',
      },
    ],
  },

  // ── Vérification bascule ──
  {
    id: 'p8',
    title: 'Vérification Bascule Porta / MOBI',
    category: 'portabilite',
    summary: 'Vérifier quotidiennement que les bascules PNM ont été correctement appliquées dans MOBI.',
    serveur: 'vmqproportawebdb01',
    utilisateur: 'porta_pnmv3',
    tags: ['bascule', 'Verif-Bascule-MOBI', 'EmaExtracter', 'EmmExtracter'],
    steps: [
      {
        title: 'Le script s\'exécute automatiquement',
        content: 'Le script Pnm-Verif-Bascule-MOBI.sh est planifié par crontab sur vmqproportawebdb01.\nIl s\'exécute chaque jour ouvré après la bascule.',
      },
      {
        title: 'Vérifier l\'email de bascule',
        content: 'Un email "[PNMV3] Verification Bascule Porta MOBI" est envoyé à fwi_pnm_si.\n\nVérifier :\n• EmaExtracter : tous les opérateurs OK (entrantes)\n• EmmExtracter : tous les opérateurs OK (sortantes)\n• Aucune bascule KO\n• Fin de traitement confirmée',
      },
      {
        title: 'Vérifier l\'email FIN',
        content: 'Un second email "[PNMV3] Verification Bascule Porta MOBI : FIN" confirme la fin complète.\n\nVérifier :\n• Rapport RL : X/X OK\n• Fichier fnr_action_v3.bh : présent\n• Commandes OK : pourcentage acceptable (> 50%)',
      },
      {
        title: 'En cas de bascule KO',
        content: 'Si des MSISDN sont en erreur :\n1. Identifier les MSISDN KO dans l\'email\n2. Vérifier leur état dans PortaDB et MOBI\n3. Corriger manuellement si nécessaire\n4. Escalader si problème systémique',
      },
    ],
  },

  // ── Vérification acquittements ──
  {
    id: 'p9',
    title: 'Vérification Acquittements PNMDATA',
    category: 'portabilite',
    summary: 'Vérifier que les fichiers PNMDATA ont été acquittés par tous les opérateurs.',
    serveur: 'vmqproportasync01',
    utilisateur: 'porta_pnmv3',
    tags: ['acquittements', 'PnmAckManager', 'ACR', 'E000'],
    steps: [
      {
        title: 'Consulter le log PnmAckManager',
        content: 'Le script PnmDataAckManager vérifie automatiquement les acquittements.',
        code: 'ssh porta_pnmv3@vmqproportasync01\ntail -f /home/porta_pnmv3/PortaSync/log/PnmAckManager.log',
      },
      {
        title: 'Vérifier chaque opérateur',
        content: 'Chaque opérateur doit afficher "Check success" :\n• Orange Caraïbe\n• Digicel AFG\n• Outremer Telecom / SFR\n• Dauphin Telecom\n• UTS Caraïbe\n• Free Caraïbes\n\nPuis "Fin de Traitement" à la fin.',
      },
      {
        title: 'En cas de NOT FOUND',
        content: 'Si un fichier ACR n\'est pas trouvé :\n1. Vérifier sur le sFTP que le fichier .ACR a été déposé\n2. Vérifier les erreurs dans le log\n3. Relancer manuellement si nécessaire',
      },
    ],
  },

  // ── Génération fichiers vacation ──
  {
    id: 'p10',
    title: 'Vérification Génération PNMDATA',
    category: 'portabilite',
    summary: 'Vérifier la génération des fichiers PNMDATA pour chaque vacation.',
    serveur: 'vmqproportawebdb01',
    utilisateur: 'porta_pnmv3',
    tags: ['PNMDATA', 'PnmDataManager', 'vacation', 'fichiers'],
    steps: [
      {
        title: 'Consulter le log PnmDataManager',
        content: 'Le PnmDataManager génère les fichiers PNMDATA aux horaires de vacation (10h, 14h, 19h).',
        code: 'ssh porta_pnmv3@vmqproportawebdb01\ntail -50 /home/porta_pnmv3/PortaSync/log/PnmDataManager.log',
      },
      {
        title: 'Vérifier la génération par opérateur',
        content: 'Pour chaque opérateur (01, 03, 04, 05, 06), vérifier :\n• "Generation du fichier PNMDATA.02.XX..." avec le nombre de tickets\n• "Fin de Traitement" sans erreur',
      },
      {
        title: 'Vérifier les fichiers sur le sFTP',
        content: 'Les fichiers sont déposés sur le sFTP inter-opérateurs.',
        code: 'sftp pnm_02@193.251.160.208\nls -la /home/pnm_02/out/',
      },
    ],
  },

  // ── Résiliation manuelle PSO ──
  {
    id: 'p11',
    title: 'Résiliation manuelle PSO (SoapUI)',
    category: 'portabilite',
    summary: 'Effectuer manuellement la résiliation d\'un MSISDN en portabilité sortante non résilié automatiquement.',
    serveur: 'vmqproportaweb01 (DAPI)',
    utilisateur: 'porta_pnmv3',
    tags: ['PSO', 'résiliation', 'SoapUI', 'DAPI', 'portabilité sortante'],
    steps: [
      {
        title: 'Identifier les MSISDN non résiliés',
        content: 'Le script Pnm_pso_lignes_non_resiliees.sh ou le monitoring PNM App détecte les MSISDN PSO non résiliés.',
      },
      {
        title: 'Ouvrir SoapUI',
        content: 'Ouvrir SoapUI et se connecter au DAPI (PortaWs).\nURL : http://172.24.119.72:8080/PortaWs/',
      },
      {
        title: 'Exécuter la résiliation',
        content: 'Appeler le Web Service de résiliation pour chaque MSISDN concerné.\nVoir Cas Pratique #18 pour la procédure détaillée SoapUI.',
        warning: 'Vérifier dans PortaDB que le portage sortant est bien confirmé avant de résilier.',
      },
      {
        title: 'Vérifier dans MOBI',
        content: 'Confirmer que la ligne est bien résiliée dans MasterCRM après l\'appel WS.',
      },
    ],
  },

  // ── Export PortaDB CSV ──
  {
    id: 'p12',
    title: 'Export PortaDB vers CSV (MIS)',
    category: 'exploitation',
    summary: 'Export quotidien automatique de 16 tables PortaDB en CSV vers le serveur EMM pour le reporting MIS.',
    serveur: 'vmqproportawebdb01',
    utilisateur: 'porta_pnmv3',
    tags: ['export', 'CSV', 'EMM', 'MIS', 'PortaDB-export-csv.sh'],
    steps: [
      {
        title: 'Exécution automatique',
        content: 'Le script PortaDB-export-csv.sh s\'exécute tous les jours à 00h00 via crontab.\n\n16 tables exportées : ACK, CODE_REPONSE, CODE_TICKET, DATA, DOSSIER, ETAT, FERRYDAY, FICHIER, MSISDN, MSISDN_HISTORIQUE, OPERATEUR, PORTAGE, PORTAGE_DATA, PORTAGE_HISTORIQUE, TRANCHE, TRANSITION.',
      },
      {
        title: 'Exécution manuelle si nécessaire',
        content: 'En cas d\'échec, relancer manuellement.',
        code: 'ssh porta_pnmv3@vmqproportawebdb01\ncd ~/scripts/\n./PortaDB-export-csv.sh',
      },
      {
        title: 'Vérifier sur le serveur EMM',
        content: 'Les fichiers CSV sont copiés vers le serveur EMM.',
        code: 'ssh pnm@172.24.27.144\nls -lrth /mediation/DIGICEL/input/PORTA/',
      },
    ],
  },

  // ── Facturation mensuelle ──
  {
    id: 'p13',
    title: 'Facturation mensuelle PEN / PSO',
    category: 'facturation',
    summary: 'Génération automatique des rapports de facturation mensuels pour les portabilités entrantes (PEN) et sortantes (PSO).',
    serveur: 'vmqproportawebdb01',
    utilisateur: 'porta_pnmv3',
    tags: ['facturation', 'PEN', 'PSO', 'mensuel', 'ticket 1410', 'ticket 1210'],
    steps: [
      {
        title: 'Exécution automatique',
        content: 'Les scripts s\'exécutent mensuellement via crontab :\n• Pnm_Facturation_Mensuelle_PEN.sh — portabilités entrantes (ticket 1410)\n• Pnm_Facturation_Mensuelle_PSO.sh — portabilités sortantes (ticket 1210)\n\nEmails envoyés à fwi_pnm_si + comptabilité.',
      },
      {
        title: 'Contenu du rapport',
        content: 'Par opérateur (OC, SFRC, DT, UTS, FREEC) :\n• Type de mandat : simple ou multiple\n• ID portage\n• Date mandat / transaction\n• Nombre de lignes\n• Premier numéro éligible',
      },
      {
        title: 'Exécution manuelle',
        content: 'Si le rapport n\'a pas été envoyé, relancer manuellement.',
        code: 'ssh porta_pnmv3@vmqproportawebdb01\ncd ~/scripts/\n./Pnm_Facturation_Mensuelle_PEN.sh\n./Pnm_Facturation_Mensuelle_PSO.sh',
      },
    ],
  },

  // ── Vérification appartenance numéro ──
  {
    id: 'p14',
    title: 'Vérification appartenance d\'un numéro',
    category: 'debug',
    summary: 'Vérifier chez quel opérateur se trouve un MSISDN dans PortaDB.',
    serveur: 'vmqproportawebdb01',
    utilisateur: 'porta_pnmv3',
    tags: ['MSISDN', 'vérification', 'appartenance', 'opérateur'],
    steps: [
      {
        title: 'Se connecter à PortaDB',
        content: 'Se connecter en SSH et interroger MySQL.',
        code: 'ssh porta_pnmv3@vmqproportawebdb01',
      },
      {
        title: 'Requête de vérification',
        content: 'Interroger la table MSISDN pour connaître l\'opérateur actuel.',
        code: 'mysql -e "SELECT M.msisdn, M.operateur_id_actuel, O.nom\nFROM PortaDB.MSISDN M\nINNER JOIN PortaDB.OPERATEUR O ON M.operateur_id_actuel = O.code\nWHERE M.msisdn = \'069XXXXXXX\';"',
      },
      {
        title: 'Interpréter le résultat',
        content: 'Codes opérateurs :\n• 1 = Orange Caraïbe\n• 2 = Digicel AFG\n• 3 = Outremer Telecom / SFR\n• 4 = Dauphin Telecom\n• 5 = UTS Caraïbe\n• 6 = Free Caraïbes',
      },
    ],
  },

  // ── Interrogation FNR ──
  {
    id: 'p15',
    title: 'Interrogation / Gestion FNR',
    category: 'debug',
    summary: 'Interroger, créer, modifier ou supprimer un MSISDN dans le FNR (Forward Number Routing).',
    serveur: 'DAPI (172.24.2.21)',
    utilisateur: 'N/A (interface web)',
    tags: ['FNR', 'DAPI', 'routage', 'fnr-get-info', 'fnr-create', 'fnr-update', 'fnr-delete'],
    steps: [
      {
        title: 'Interroger un MSISDN dans le FNR',
        content: 'Vérifier le routage actuel d\'un numéro.',
        code: 'http://172.24.2.21/apis/porta/fnr-get-info.html',
      },
      {
        title: 'Créer un MSISDN dans le FNR',
        content: 'Ajouter un nouveau numéro au FNR (après portabilité entrante).',
        code: 'http://172.24.2.21/apis/porta/fnr-create.php',
      },
      {
        title: 'Changer le réseau d\'un MSISDN',
        content: 'Modifier le routage réseau d\'un numéro existant.',
        code: 'http://172.24.2.21/apis/porta/fnr-update.php',
      },
      {
        title: 'Supprimer un MSISDN du FNR',
        content: 'Retirer un numéro du FNR (après portabilité sortante / restitution).',
        code: 'http://172.24.2.21/apis/porta/fnr-delete.html',
      },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [children]);

  return (
    <Box sx={{ position: 'relative', my: 1 }}>
      <Tooltip title={copied ? 'Copié !' : 'Copier'}>
        <IconButton
          size="small"
          onClick={handleCopy}
          sx={{ position: 'absolute', top: 4, right: 4, color: 'grey.400' }}
        >
          <Iconify icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold'} width={16} />
        </IconButton>
      </Tooltip>
      <Box
        component="pre"
        sx={{
          bgcolor: '#1e1e2e',
          color: '#cdd6f4',
          p: 2,
          pr: 5,
          borderRadius: 1,
          fontSize: '0.8rem',
          fontFamily: 'monospace',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

// ─── Components ─────────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: Category }) {
  const cfg = CATEGORY_CONFIG[category];
  return (
    <Chip
      icon={<Iconify icon={cfg.icon} width={16} />}
      label={cfg.label}
      size="small"
      sx={{
        bgcolor: `${cfg.color}18`,
        color: cfg.color,
        fontWeight: 700,
        fontSize: '0.75rem',
        border: `1px solid ${cfg.color}40`,
        '& .MuiChip-icon': { color: cfg.color },
      }}
    />
  );
}

function ProtocoleCard({ protocole, onClick }: { protocole: Protocole; onClick: () => void }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <CategoryBadge category={protocole.category} />
              <Chip label={`${protocole.steps.length} étapes`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
            </Stack>
            <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.3 }}>
              {protocole.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
              {protocole.summary}
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<Iconify icon="solar:server-bold-duotone" width={14} />}
                label={protocole.serveur}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 22 }}
              />
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function ProtocoleDetail({ protocole, open, onClose }: { protocole: Protocole | null; open: boolean; onClose: () => void }) {
  if (!protocole) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={1}>
            <CategoryBadge category={protocole.category} />
            <Typography variant="h5" fontWeight={700}>
              {protocole.title}
            </Typography>
          </Stack>
          <IconButton onClick={onClose}>
            <Iconify icon="solar:close-circle-bold" width={24} />
          </IconButton>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {protocole.summary}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip icon={<Iconify icon="solar:server-bold-duotone" width={14} />} label={protocole.serveur} size="small" variant="outlined" />
          <Chip icon={<Iconify icon="solar:user-bold-duotone" width={14} />} label={protocole.utilisateur} size="small" variant="outlined" />
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {protocole.steps.map((step, idx) => (
            <Box key={idx}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: CATEGORY_CONFIG[protocole.category].color,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {step.title}
                </Typography>
              </Stack>
              <Box sx={{ pl: 5.5 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: step.code ? 1 : 0 }}>
                  {step.content}
                </Typography>
                {step.code && <CodeBlock>{step.code}</CodeBlock>}
                {step.warning && (
                  <Box
                    sx={{
                      mt: 1,
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: '#fff4e5',
                      border: '1px solid #ffb74d',
                      fontSize: '0.82rem',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Iconify icon="solar:danger-triangle-bold-duotone" width={18} sx={{ color: '#ed6c02', mt: 0.2, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: '#663c00' }}>
                        {step.warning}
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </Box>
              {idx < protocole.steps.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </Stack>

        {protocole.tags.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {protocole.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
              ))}
            </Stack>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function Protocoles() {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<Category | 'all'>('all');
  const [selected, setSelected] = useState<Protocole | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PROTOCOLES.filter((p) => {
      if (filterCat !== 'all' && p.category !== filterCat) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.serveur.toLowerCase().includes(q) ||
        p.steps.some((s) => s.content.toLowerCase().includes(q) || (s.code?.toLowerCase().includes(q) ?? false))
      );
    });
  }, [search, filterCat]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { all: PROTOCOLES.length };
    for (const cat of CATEGORIES) counts[cat] = PROTOCOLES.filter((p) => p.category === cat).length;
    return counts;
  }, []);

  return (
    <DashboardLayout>
      <Head title="Protocoles" />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                Protocoles
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {PROTOCOLES.length} protocoles documentés — Procédures opérationnelles PNM / MOBI
              </Typography>
            </Box>
          </Stack>

          {/* Search + Filters */}
          <Stack spacing={2}>
            <TextField
              placeholder="Rechercher un protocole..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:magnifer-bold-duotone" width={20} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')}>
                      <Iconify icon="solar:close-circle-bold" width={18} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              <Chip
                label={`Tous (${catCounts.all})`}
                size="small"
                variant={filterCat === 'all' ? 'filled' : 'outlined'}
                onClick={() => setFilterCat('all')}
              />
              {CATEGORIES.map((cat) => {
                const cfg = CATEGORY_CONFIG[cat];
                return (
                  <Chip
                    key={cat}
                    icon={<Iconify icon={cfg.icon} width={16} />}
                    label={`${cfg.label} (${catCounts[cat]})`}
                    size="small"
                    variant={filterCat === cat ? 'filled' : 'outlined'}
                    onClick={() => setFilterCat(filterCat === cat ? 'all' : cat)}
                    sx={
                      filterCat === cat
                        ? { bgcolor: `${cfg.color}18`, color: cfg.color, '& .MuiChip-icon': { color: cfg.color } }
                        : {}
                    }
                  />
                );
              })}
            </Stack>
          </Stack>

          {/* Grid */}
          <Grid container spacing={2}>
            {filtered.map((p) => (
              <Grid item key={p.id} xs={12} sm={6} md={4}>
                <ProtocoleCard protocole={p} onClick={() => setSelected(p)} />
              </Grid>
            ))}
            {filtered.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                  <Iconify icon="solar:document-bold-duotone" width={48} sx={{ opacity: 0.3, mb: 1 }} />
                  <Typography>Aucun protocole trouvé</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Stack>
      </Box>

      <ProtocoleDetail protocole={selected} open={!!selected} onClose={() => setSelected(null)} />
    </DashboardLayout>
  );
}
