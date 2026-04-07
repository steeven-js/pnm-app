import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { DashboardLayout } from 'src/layouts/dashboard/layout';

// ─── Types ──────────────────────────────────────────────────────────────────

type TicketDoc = {
  id: string;
  numero: number;
  categorie: string;
  priorite: string;
  file: string;
  demandeur: string;
  date: string;
  symptome: string;
  contexte: string;
  diagnostic: string;
  solution: string;
  motsCles: string[];
};

// ─── Category config ────────────────────────────────────────────────────────

const CATEGORIES = [
  'Lib\u00e9ration IMEI',
  'Lib\u00e9ration Offre',
  'Portabilit\u00e9/PNM',
  'R\u00e9aff. Num\u00e9ro',
  'Fid\u00e9lisation',
  'R\u00e9engagement',
  'Anomalie',
  'Astreinte',
  'Autre',
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  'Lib\u00e9ration IMEI': '#22c55e',
  'Lib\u00e9ration Offre': '#3b82f6',
  'Portabilit\u00e9/PNM': '#8b5cf6',
  'R\u00e9aff. Num\u00e9ro': '#06b6d4',
  'Fid\u00e9lisation': '#f97316',
  'R\u00e9engagement': '#eab308',
  'Anomalie': '#ef4444',
  'Astreinte': '#ec4899',
  'Autre': '#94a3b8',
};

const CATEGORY_ICONS: Record<string, string> = {
  'Lib\u00e9ration IMEI': 'solar:smartphone-bold-duotone',
  'Lib\u00e9ration Offre': 'solar:tag-bold-duotone',
  'Portabilit\u00e9/PNM': 'solar:transfer-horizontal-bold-duotone',
  'R\u00e9aff. Num\u00e9ro': 'solar:refresh-bold-duotone',
  'Fid\u00e9lisation': 'solar:heart-bold-duotone',
  'R\u00e9engagement': 'solar:restart-bold-duotone',
  'Anomalie': 'solar:danger-triangle-bold-duotone',
  'Astreinte': 'solar:alarm-bold-duotone',
  'Autre': 'solar:question-circle-bold-duotone',
};

// ─── Ticket Data ────────────────────────────────────────────────────────────

const TICKETS: TicketDoc[] = [
  {
    id: 't1',
    numero: 276549,
    categorie: 'R\u00e9aff. Num\u00e9ro',
    priorite: 'Normale',
    file: 'Support N2',
    demandeur: 'Service Commercial',
    date: '2025-03-10',
    symptome: 'R\u00e9affectation MSISDN interne Digicel \u2014 collaborateur demande r\u00e9cup\u00e9ration d\'un num\u00e9ro.',
    contexte: 'Un collaborateur Digicel souhaite r\u00e9cup\u00e9rer un MSISDN pr\u00e9c\u00e9demment utilis\u00e9 en interne. Le num\u00e9ro est en statut inactif dans la base.',
    diagnostic: 'Le MSISDN est au statut 0 (inactif) avec MS_CLASS=0. Il faut le passer en statut 7 (disponible) puis r\u00e9activer avec MS_CLASS=73 apr\u00e8s activation.',
    solution: `SQL: UPDATE MSISDN SET ST_MSISDN_ID='0', MSISDN_STATUS='7', MS_CLASS='0' WHERE MSISDN='XXXXXXXXXX';
-- Apr\u00e8s activation par le commercial :
UPDATE MSISDN SET MS_CLASS='73' WHERE MSISDN='XXXXXXXXXX';`,
    motsCles: ['MSISDN', 'r\u00e9affectation', 'collaborateur', 'MS_CLASS', 'MSISDN_STATUS'],
  },
  {
    id: 't2',
    numero: 276537,
    categorie: 'Lib\u00e9ration Offre',
    priorite: 'Normale',
    file: 'Support N2',
    demandeur: 'Service B2B',
    date: '2025-03-09',
    symptome: 'LIB\u00c9RATION D\'OFFRE \u2014 pack_id customer_package bloqu\u00e9, client ne peut pas changer d\'offre.',
    contexte: 'Client B2B avec pack_id actif dans customer_package emp\u00each le changement d\'offre. La lib\u00e9ration manuelle est n\u00e9cessaire.',
    diagnostic: 'Le pack_id est toujours actif dans customer_package. Il faut forcer la date de fin d\'activation pour lib\u00e9rer l\'offre.',
    solution: `SQL: UPDATE customer_package SET pack_end_activation='YYYY-MM-DD' WHERE pack_id IN ('XXXX');`,
    motsCles: ['offre', 'lib\u00e9ration', 'IMEI', 'B2B', 'customer_package', 'pack_id'],
  },
  {
    id: 't3',
    numero: 276534,
    categorie: 'Anomalie',
    priorite: 'Haute',
    file: 'Support N2',
    demandeur: 'Service Client',
    date: '2025-03-08',
    symptome: 'Anomalie appel entrant apr\u00e8s changement MSISDN rejet\u00e9 \u2014 client injoignable sur appels entrants.',
    contexte: 'Suite \u00e0 un changement de MSISDN rejet\u00e9, le client ne re\u00e7oit plus d\'appels entrants. Le terminal fonctionne en sortant.',
    diagnostic: 'Le changement MSISDN a \u00e9chou\u00e9 mais a partiellement modifi\u00e9 le routage. Un rattrapage de la ligne est n\u00e9cessaire.',
    solution: 'Rattrapage de la ligne c\u00f4t\u00e9 r\u00e9seau. Le client doit relancer son terminal (red\u00e9marrage) apr\u00e8s la correction pour forcer la r\u00e9inscription sur le r\u00e9seau.',
    motsCles: ['anomalie', 'appel entrant', 'injoignable', 'changement MSISDN', 'rattrapage'],
  },
  {
    id: 't4',
    numero: 276521,
    categorie: 'Lib\u00e9ration IMEI',
    priorite: 'Normale',
    file: 'Support N2',
    demandeur: 'Service Commercial',
    date: '2025-03-07',
    symptome: 'Lib\u00e9ration IMEI via APP_OCS \u2014 script oracle pour d\u00e9bloquer un IMEI.',
    contexte: 'Un IMEI est verrouill\u00e9 dans le syst\u00e8me et doit \u00eatre lib\u00e9r\u00e9 pour permettre une nouvelle activation.',
    diagnostic: 'L\'IMEI est bloqu\u00e9 dans APP_OCS. Il faut ex\u00e9cuter le script de lib\u00e9ration Oracle.',
    solution: 'Ex\u00e9cuter le script de lib\u00e9ration IMEI via APP_OCS (script Oracle d\u00e9di\u00e9).',
    motsCles: ['IMEI', 'lib\u00e9ration', 'oracle', 'APP_OCS'],
  },
  {
    id: 't5',
    numero: 276515,
    categorie: 'Lib\u00e9ration IMEI',
    priorite: 'Normale',
    file: 'Support N2',
    demandeur: 'Service B2B',
    date: '2025-03-06',
    symptome: 'Lib\u00e9ration IMEI multiple (2 IMEI) Business \u2014 client B2B avec deux terminaux bloqu\u00e9s.',
    contexte: 'Client Business avec deux IMEI bloqu\u00e9s suite \u00e0 un probl\u00e8me de gestion de flotte. Les deux doivent \u00eatre lib\u00e9r\u00e9s simultan\u00e9ment.',
    diagnostic: 'Les deux IMEI sont verrouill\u00e9s dans APP_OCS. Lib\u00e9ration en batch n\u00e9cessaire.',
    solution: 'Ex\u00e9cuter APP_OCS pour chacun des 2 IMEI Business. Lib\u00e9ration s\u00e9quentielle.',
    motsCles: ['IMEI', 'lib\u00e9ration', 'multiple', 'B2B', 'APP_OCS'],
  },
  {
    id: 't6',
    numero: 276514,
    categorie: 'Lib\u00e9ration Offre',
    priorite: 'Normale',
    file: 'Support N2',
    demandeur: 'Service Commercial',
    date: '2025-03-06',
    symptome: 'Mise en disponibilit\u00e9 offre / CTO item transition \u2014 offre bloqu\u00e9e lors d\'un changement tarifaire.',
    contexte: 'Lors d\'une transition CTO (Changement Tarifaire Offre), l\'item CTO reste bloqu\u00e9 emp\u00eachant la mise en disponibilit\u00e9 de l\'offre.',
    diagnostic: 'L\'item CTO n\'a pas \u00e9t\u00e9 correctement transition\u00e9. Le SQL de correction est attach\u00e9 en PJ du ticket original.',
    solution: 'SQL attach\u00e9 en PJ du ticket RT \u2014 ex\u00e9cuter le script de transition CTO item pour d\u00e9bloquer l\'offre.',
    motsCles: ['offre', 'CTO', 'changement tarifaire', 'transition', 'item CTO'],
  },
  {
    id: 't7',
    numero: 276492,
    categorie: 'R\u00e9engagement',
    priorite: 'Haute',
    file: 'Support N2',
    demandeur: 'Service Fid\u00e9lisation',
    date: '2025-03-05',
    symptome: 'R\u00e9activation forfait + lib\u00e9ration IMEI + MAJ FID multi-\u00e9tapes \u2014 proc\u00e9dure compl\u00e8te.',
    contexte: 'Client en r\u00e9engagement n\u00e9cessitant une r\u00e9activation compl\u00e8te : forfait, IMEI et mise \u00e0 jour fid\u00e9lisation en plusieurs \u00e9tapes.',
    diagnostic: 'Trois op\u00e9rations n\u00e9cessaires : suppression package_right, mise \u00e0 jour customer_package, et ex\u00e9cution APP_OCS 11561.',
    solution: `\u00c9tape 1 : DELETE FROM package_right WHERE ...;
\u00c9tape 2 : UPDATE customer_package SET ...;
\u00c9tape 3 : APP_OCS 11561 pour MAJ engagement et FID.`,
    motsCles: ['r\u00e9activation', 'forfait', 'package_right', 'customer_package', 'fid\u00e9lisation', 'APP_OCS', '11561'],
  },
  {
    id: 't8',
    numero: 276470,
    categorie: 'Lib\u00e9ration Offre',
    priorite: 'Normale',
    file: 'Support N2',
    demandeur: 'Service Commercial',
    date: '2025-03-04',
    symptome: 'R\u00e9affectation offre r\u00e9tractation client \u2014 forfait bloqu\u00e9 vs d\u00e9bloqu\u00e9, probl\u00e8me international.',
    contexte: 'Client ayant fait une r\u00e9tractation, son forfait est bloqu\u00e9 (notamment sur l\'international) au lieu d\'\u00eatre d\u00e9bloqu\u00e9.',
    diagnostic: 'Le pack_end_activation n\'a pas \u00e9t\u00e9 mis \u00e0 jour suite \u00e0 la r\u00e9tractation, laissant le forfait dans un \u00e9tat incoh\u00e9rent.',
    solution: `SQL: UPDATE customer_package SET pack_end_activation='YYYY-MM-DD' WHERE ...;
V\u00e9rifier que le forfait passe bien en "d\u00e9bloqu\u00e9" apr\u00e8s la MAJ, notamment pour les options internationales.`,
    motsCles: ['offre', 'r\u00e9tractation', 'forfait bloqu\u00e9', 'd\u00e9bloqu\u00e9', 'international'],
  },
  {
    id: 't9',
    numero: 276462,
    categorie: 'Lib\u00e9ration IMEI',
    priorite: 'Normale',
    file: 'Support N2',
    demandeur: 'Service B2B',
    date: '2025-03-03',
    symptome: 'Lib\u00e9ration IMEI multiple Business \u2014 plusieurs terminaux \u00e0 d\u00e9bloquer pour un client entreprise.',
    contexte: 'Client Business avec plusieurs IMEI bloqu\u00e9s n\u00e9cessitant une lib\u00e9ration en lot.',
    diagnostic: 'Plusieurs IMEI verrouill\u00e9s dans APP_OCS pour un m\u00eame client Business.',
    solution: 'Ex\u00e9cuter APP_OCS pour chaque IMEI. Lib\u00e9ration s\u00e9quentielle, v\u00e9rifier chaque IMEI apr\u00e8s lib\u00e9ration.',
    motsCles: ['IMEI', 'lib\u00e9ration', 'multiple', 'Business', 'APP_OCS'],
  },
  {
    id: 't10',
    numero: 276434,
    categorie: 'R\u00e9engagement',
    priorite: 'Normale',
    file: 'Support N2',
    demandeur: 'Service Fid\u00e9lisation',
    date: '2025-03-02',
    symptome: 'R\u00e9engagement ligne 24 mois via APP_OCS 11561 \u2014 mise \u00e0 jour de la date de fin d\'abonnement.',
    contexte: 'Client \u00e0 r\u00e9engager pour 24 mois. La date_fin_abo doit \u00eatre mise \u00e0 jour via APP_OCS.',
    diagnostic: 'La date_fin_abo n\'est pas \u00e0 jour. APP_OCS 11561 doit \u00eatre ex\u00e9cut\u00e9 pour prolonger l\'engagement.',
    solution: 'APP_OCS 11561 \u2014 mettre \u00e0 jour la date_fin_abo pour un r\u00e9engagement de 24 mois.',
    motsCles: ['r\u00e9engagement', '24 mois', 'date_fin_abo', 'APP_OCS', '11561'],
  },
  {
    id: 't11',
    numero: 276432,
    categorie: 'Fid\u00e9lisation',
    priorite: 'Haute',
    file: 'Support N2',
    demandeur: 'Service Fid\u00e9lisation',
    date: '2025-03-02',
    symptome: 'Report mois fid\u00e9lisation entre dossiers apr\u00e8s r\u00e9siliation pour impay\u00e9 \u2014 transfert de mois FID.',
    contexte: 'Suite \u00e0 une r\u00e9siliation pour impay\u00e9, les mois de fid\u00e9lisation doivent \u00eatre report\u00e9s sur un nouveau dossier. Incident li\u00e9 au pr\u00e9l\u00e8vement.',
    diagnostic: 'Les mois FID sont perdus lors de la r\u00e9siliation. APP_OCS 11561 permet de les reporter via MAJ_date_engagement_et_FID.',
    solution: 'APP_OCS 11561 \u2014 MAJ_date_engagement_et_FID pour reporter les mois de fid\u00e9lisation du dossier r\u00e9sili\u00e9 vers le nouveau dossier.',
    motsCles: ['fid\u00e9lisation', 'report', 'transfert', 'dossier', 'incident pr\u00e9l\u00e8vement', 'APP_OCS', '11561'],
  },
  {
    id: 't12',
    numero: 276424,
    categorie: 'R\u00e9aff. Num\u00e9ro',
    priorite: 'Normale',
    file: 'Support N2',
    demandeur: 'Service Commercial',
    date: '2025-03-01',
    symptome: 'Demande de num\u00e9ro r\u00e9affectation SQL \u2014 remettre un MSISDN en disponibilit\u00e9.',
    contexte: 'Un num\u00e9ro MSISDN doit \u00eatre remis en disponibilit\u00e9 (statut 7) pour r\u00e9affectation.',
    diagnostic: 'Le MSISDN est au statut inactif avec MS_CLASS=0. Il faut le passer en statut 7.',
    solution: `SQL: UPDATE MSISDN SET ST_MSISDN_ID='0', MSISDN_STATUS='7' WHERE MS_CLASS='0' AND MSISDN='XXXXXXXXXX';`,
    motsCles: ['MSISDN', 'num\u00e9ro', 'r\u00e9affectation', 'MSISDN_STATUS', 'statut 7'],
  },
  {
    id: 't13',
    numero: 276421,
    categorie: 'Lib\u00e9ration IMEI',
    priorite: 'Normale',
    file: 'Support N2',
    demandeur: 'Service Commercial',
    date: '2025-02-28',
    symptome: 'Lib\u00e9ration IMEI + MSISDN stock 211 \u2014 d\u00e9blocage combin\u00e9 IMEI et num\u00e9ro.',
    contexte: 'Un IMEI et un MSISDN sont bloqu\u00e9s dans le stock 211. Les deux doivent \u00eatre lib\u00e9r\u00e9s.',
    diagnostic: 'L\'IMEI et le MSISDN sont verrouill\u00e9s dans le stock 211. Lib\u00e9ration via APP_OCS requise.',
    solution: 'APP_OCS pour lib\u00e9rer l\'IMEI, puis lib\u00e9ration du MSISDN du stock 211.',
    motsCles: ['IMEI', 'MSISDN', 'lib\u00e9ration', 'stock 211', 'APP_OCS'],
  },
  {
    id: 't14',
    numero: 276399,
    categorie: 'Fid\u00e9lisation',
    priorite: 'Haute',
    file: 'Support N2',
    demandeur: 'Service Fid\u00e9lisation',
    date: '2025-02-27',
    symptome: 'Annulation FID + lib\u00e9ration IMEI multi-\u00e9tapes 3 jours \u2014 proc\u00e9dure sur plusieurs jours.',
    contexte: 'Suite \u00e0 un changement de terminal, il faut annuler la fid\u00e9lisation et lib\u00e9rer l\'IMEI. Proc\u00e9dure en plusieurs \u00e9tapes sur 3 jours.',
    diagnostic: 'La fid\u00e9lisation doit \u00eatre annul\u00e9e via APP_OCS 11605 avant la lib\u00e9ration de l\'IMEI.',
    solution: 'APP_OCS 11605 pour annulation FID, puis lib\u00e9ration IMEI. Proc\u00e9dure multi-\u00e9tapes sur 3 jours.',
    motsCles: ['fid\u00e9lisation', 'annulation', 'IMEI', 'changement terminal', 'APP_OCS', '11605'],
  },
  {
    id: 't15',
    numero: 276367,
    categorie: 'Astreinte',
    priorite: 'Haute',
    file: 'Support N2',
    demandeur: 'Astreinte',
    date: '2025-02-26',
    symptome: 'Astreinte semaine \u2014 check WIZZEE SIM_SWAP retry, v\u00e9rifications hebdomadaires.',
    contexte: 'Proc\u00e9dure d\'astreinte hebdomadaire : v\u00e9rifier les SIM_SWAP WIZZEE en retry et traiter les cas en \u00e9chec via EMA.',
    diagnostic: 'Des SIM_SWAP WIZZEE sont en statut retry et n\u00e9cessitent un check manuel.',
    solution: 'V\u00e9rifier les SIM_SWAP WIZZEE en retry dans EMA. Relancer les cas en \u00e9chec.',
    motsCles: ['astreinte', 'WIZZEE', 'check', 'SIM_SWAP', 'retry', 'EMA'],
  },
  // ── Batch Frédéric 27/03/2026 ──────────────────────────────────────────────
  {
    id: 't16',
    numero: 275903,
    categorie: 'Autre',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Emma Debaere',
    date: '2026-02-23',
    symptome: 'Demande de numéro — client dit que son numéro résilié chez Orange est encore chez Digicel.',
    contexte: 'Mr Goindin 0690087320 est allé chez Orange pour reprendre son numéro résilié. Orange indique que le numéro est encore chez Digicel.',
    diagnostic: 'Vérification dans la base : le MSISDN est chez Orange Caraïbe depuis Février 2020. Le numéro n\'appartient plus à Digicel.',
    solution: 'Confirmation au demandeur que le MSISDN est chez Orange Caraïbe depuis 2020. Aucune action requise côté Digicel. Ticket fermé.',
    motsCles: ['MSISDN', 'numéro', 'Orange Caraïbe', 'résiliation', 'vérification appartenance'],
  },
  {
    id: 't17',
    numero: 275916,
    categorie: 'Fidélisation',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Berry Marc Andrew Solis Meus',
    date: '2026-02-24',
    symptome: 'Réactivation forfait LIFE Premium 100Go bloqué SM[24] — MME LAURENTIN EDELINE — Client 2315747.',
    contexte: 'Client GP 2315747, MSISDN 0694144332. Forfait LIFE Premium 100Go bloqué SM[24]. La ligne a été activée avec succès, demande d\'ajout de mois de fidélité avec engagement 24 mois.',
    diagnostic: 'La ligne est active mais la date de fidélisation doit être mise à jour via APP_OCS 11561 (MAJ_date_FID).',
    solution: `APP_OCS 11561 — MAJ_date_FID pour le MSISDN 0694144332, compte BM615558.
Trace : date_eligible_fid = 24/06/2020, type_trace = MAJ_date_FID, code requete : 11561.`,
    motsCles: ['fidélisation', 'LIFE Premium 100Go', 'APP_OCS', '11561', 'MAJ_date_FID', 'réactivation', 'engagement 24 mois'],
  },
  {
    id: 't18',
    numero: 275922,
    categorie: 'Libération IMEI',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Adeley Dory Belfort',
    date: '2026-02-24',
    symptome: 'Libération IMEI — KS AND CO — Client Business 1869023.',
    contexte: 'Client Business 1869023. Demande de libération IMEI 353956846254288 pour affectation à la ligne 0694093399.',
    diagnostic: 'IMEI 353956846254288 verrouillé dans APP_OCS. Libération standard requise.',
    solution: 'APP_OCS — Libération IMEI 353956846254288. PJ : liberation_imei_info_20260224_1036.txt.',
    motsCles: ['IMEI', 'libération', 'APP_OCS', 'Business', 'KS AND CO'],
  },
  {
    id: 't19',
    numero: 275709,
    categorie: 'Anomalie',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Jolie Rose Abelard',
    date: '2026-02-11',
    symptome: 'Remise offre famille non appliquée — Client 2309181 — 0690211037.',
    contexte: 'MME HAMILTON DAPHNE, MSISDN 0690211037. L\'option Famille est activée dans le système mais la remise de 10€ n\'est pas appliquée sur la facture.',
    diagnostic: 'L\'item offre famille (code 3920854) n\'est pas correctement lié dans RATP_ITEM / line_active_item. Procédure en 3 étapes : suppression item existant, réinsertion, MAJ dates.',
    solution: `Étape 1 — Suppression item existant :
INSERT INTO RATP_ITEM SELECT li_customer_no, dossier_no, line_no, 3920854,'I',TO_DATE(sysdate,'DD/MM/YYYY'),' ',0,'SUPPRESSION' FROM line WHERE line_msisdn_active IN ('0690211037');
BEGIN PB.SUPP_ITEM_MASSE; COMMIT; END;

Étape 2 — Réinsertion item offre famille :
INSERT INTO RATP_ITEM SELECT li.li_CUSTOMER_NO, li.DOSSIER_NO, li.LINE_NO,3920854,'I',TO_DATE(sysdate,'DD/MM/YYYY'),' ',1,'AJOUT' FROM line li WHERE li.line_msisdn_active IN ('0690211037');
BEGIN PB.RATP_ITEM_MANQUANT_2; COMMIT; END;

Étape 3 — MAJ dates dans line_active_item :
UPDATE line_active_item SET LI_END_BILL_DATE='31/12/2050', LI_END_LINKAFTER='31/12/2050' WHERE line_no='7394758' AND item_code='3920854';`,
    motsCles: ['offre famille', 'remise', 'RATP_ITEM', 'line_active_item', 'item 3920854', 'SUPP_ITEM_MASSE', 'RATP_ITEM_MANQUANT_2'],
  },
  {
    id: 't20',
    numero: 275949,
    categorie: 'Libération IMEI',
    priorite: 'Haute',
    file: 'APPLICATIONS',
    demandeur: 'Yamiley Petit Frere',
    date: '2026-02-25',
    symptome: 'Libération IMEI — RECTORAT DE L\'ACADEMIE GUYANE — Client Business 1494785.',
    contexte: 'Client Business 1494785, MSISDN 0694135065. Demande de libération IMEI 353012077587002 pour réaffectation.',
    diagnostic: 'IMEI 353012077587002 verrouillé dans APP_OCS. Libération standard requise.',
    solution: 'APP_OCS — Libération IMEI 353012077587002. PJ : liberation_imei_info_20260225_0949.txt.',
    motsCles: ['IMEI', 'libération', 'APP_OCS', 'Business', 'Rectorat Guyane', 'réaffectation'],
  },
  {
    id: 't21',
    numero: 275948,
    categorie: 'Libération Offre',
    priorite: 'Haute',
    file: 'APPLICATIONS',
    demandeur: 'Yamiley Petit Frere',
    date: '2026-02-25',
    symptome: 'Mise à disposition d\'offre — RECTORAT DE L\'ACADEMIE GUYANE — Client Business 1494785.',
    contexte: 'Client Business 1494785. Demande de mise à disposition d\'offre pour le Rectorat de l\'Académie de Guyane.',
    diagnostic: 'Offre bloquée dans customer_package nécessitant une libération manuelle.',
    solution: 'SQL: UPDATE customer_package SET pack_end_activation pour libérer l\'offre du client Business.',
    motsCles: ['offre', 'libération', 'mise à disposition', 'Business', 'customer_package', 'Rectorat Guyane'],
  },
  {
    id: 't22',
    numero: 275955,
    categorie: 'Réaff. Numéro',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Stephanie Julien',
    date: '2026-02-25',
    symptome: 'Libération numéro — COLLÈGE ALEXANDRE STELLIO — Client 2000272.',
    contexte: 'Client 2000272. Demande de libération de numéro MSISDN pour le Collège Alexandre Stellio.',
    diagnostic: 'MSISDN en statut inactif, doit être remis en disponibilité (statut 7) pour réaffectation.',
    solution: 'SQL: UPDATE MSISDN SET ST_MSISDN_ID=\'0\', MSISDN_STATUS=\'7\', MS_CLASS=\'0\' WHERE MSISDN=\'XXXXXXXXXX\';',
    motsCles: ['MSISDN', 'libération numéro', 'réaffectation', 'MSISDN_STATUS', 'statut 7'],
  },
  {
    id: 't23',
    numero: 275968,
    categorie: 'Réaff. Numéro',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Mardochee Alerte Deroly',
    date: '2026-02-26',
    symptome: 'Libération numéro — SARL SOCARCOM — Client 1696037.',
    contexte: 'Client 1696037. Demande de libération de numéro pour la SARL SOCARCOM.',
    diagnostic: 'MSISDN en statut inactif, doit être remis en disponibilité pour réaffectation.',
    solution: 'SQL: UPDATE MSISDN SET ST_MSISDN_ID=\'0\', MSISDN_STATUS=\'7\', MS_CLASS=\'0\' WHERE MSISDN=\'XXXXXXXXXX\';',
    motsCles: ['MSISDN', 'libération numéro', 'réaffectation', 'SOCARCOM', 'MSISDN_STATUS'],
  },
  {
    id: 't24',
    numero: 275985,
    categorie: 'Réaff. Numéro',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Peterson Maurice',
    date: '2026-02-26',
    symptome: 'Demande de réaffectation de numéro MSISDN.',
    contexte: 'Demande de réaffectation d\'un MSISDN — remise en disponibilité pour un nouveau client.',
    diagnostic: 'MSISDN en statut inactif (MS_CLASS=0), doit être passé en statut 7 (disponible).',
    solution: 'SQL: UPDATE MSISDN SET ST_MSISDN_ID=\'0\', MSISDN_STATUS=\'7\', MS_CLASS=\'0\' WHERE MSISDN=\'XXXXXXXXXX\';',
    motsCles: ['MSISDN', 'réaffectation', 'MSISDN_STATUS', 'statut 7', 'MS_CLASS'],
  },
  {
    id: 't25',
    numero: 276009,
    categorie: 'Libération IMEI',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Lynda Justin',
    date: '2026-02-27',
    symptome: 'Libération IMEI 862416078673857 — IDOM TECHNOLOGIES — Client 1731562.',
    contexte: 'Client 1731562, IDOM TECHNOLOGIES. Demande de libération IMEI 862416078673857.',
    diagnostic: 'IMEI 862416078673857 verrouillé dans APP_OCS. Libération standard requise.',
    solution: 'APP_OCS — Libération IMEI 862416078673857.',
    motsCles: ['IMEI', 'libération', 'APP_OCS', 'IDOM TECHNOLOGIES'],
  },
  {
    id: 't26',
    numero: 276010,
    categorie: 'Autre',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Frédéric Arduin',
    date: '2026-02-27',
    symptome: '[PROV] Décommissionnement EVENT_SUBSCRIPTION_BOX4G_GP — BOX 4G.',
    contexte: 'Demande de décommissionnement de l\'event de provisioning EVENT_SUBSCRIPTION_BOX4G_GP lié aux offres BOX 4G.',
    diagnostic: 'L\'event de subscription BOX 4G doit être désactivé/décommissionné dans le système de provisioning.',
    solution: 'Décommissionnement de l\'event EVENT_SUBSCRIPTION_BOX4G_GP dans le système de provisioning.',
    motsCles: ['provisioning', 'décommissionnement', 'BOX 4G', 'EVENT_SUBSCRIPTION', 'PROV'],
  },
  {
    id: 't27',
    numero: 276013,
    categorie: 'Anomalie',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Dimitri Cenac',
    date: '2026-02-27',
    symptome: '[CCA] SIM non fonctionnel — 0694452432.',
    contexte: 'Client avec MSISDN 0694452432 signale une carte SIM non fonctionnelle.',
    diagnostic: 'Problème de SIM nécessitant une intervention technique (remplacement ou réactivation).',
    solution: 'Diagnostic SIM et intervention technique pour rétablir le fonctionnement de la ligne 0694452432.',
    motsCles: ['SIM', 'non fonctionnel', 'CCA', 'anomalie'],
  },
  {
    id: 't28',
    numero: 275627,
    categorie: 'Anomalie',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Aneesa Hardat',
    date: '2026-02-06',
    symptome: 'Remise non appliquée — 0690469672.',
    contexte: 'Client avec MSISDN 0690469672. Une remise prévue n\'est pas appliquée sur la facture.',
    diagnostic: 'L\'item de remise n\'est pas correctement positionné dans RATP_ITEM / line_active_item.',
    solution: 'Insertion de l\'item de remise via RATP_ITEM + exécution de la procédure PB.RATP_ITEM_MANQUANT_2, puis MAJ des dates dans line_active_item.',
    motsCles: ['remise', 'RATP_ITEM', 'line_active_item', 'facturation', 'anomalie'],
  },
  {
    id: 't29',
    numero: 276079,
    categorie: 'Libération IMEI',
    priorite: 'Haute',
    file: 'APPLICATIONS',
    demandeur: 'Adeley Dory Belfort',
    date: '2026-03-03',
    symptome: 'Libération IMEI en urgence — SAS SOPAM ANTILLES.',
    contexte: 'Client SAS SOPAM ANTILLES. Demande urgente de libération d\'IMEI.',
    diagnostic: 'IMEI verrouillé dans APP_OCS. Libération urgente requise.',
    solution: 'APP_OCS — Libération IMEI en urgence pour SAS SOPAM ANTILLES.',
    motsCles: ['IMEI', 'libération', 'urgence', 'APP_OCS', 'SOPAM ANTILLES'],
  },
  {
    id: 't30',
    numero: 276087,
    categorie: 'Autre',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Emma Debaere',
    date: '2026-03-03',
    symptome: 'Demande de numéro — vérification appartenance MSISDN.',
    contexte: 'Demande de vérification d\'appartenance d\'un numéro MSISDN.',
    diagnostic: 'Vérification dans la base MasterCRM de l\'état et de l\'appartenance du MSISDN demandé.',
    solution: 'Vérification de l\'état du MSISDN dans la base et communication du résultat au demandeur.',
    motsCles: ['MSISDN', 'numéro', 'vérification', 'appartenance'],
  },
  // ── Batch Frédéric 07/04/2026 ──────────────────────────────────────────────
  {
    id: 't46',
    numero: 276775,
    categorie: 'Autre',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Service Commercial',
    date: '2026-04-07',
    symptome: 'Demande de désactivation code agence MARIGOT 7140003.',
    contexte: 'Le point de vente Boutique Digicel Marigot (code agence 7140003) doit être désactivé et supprimé de la base MOBI. Le profil est déjà en statut DESACTIVE.',
    diagnostic: 'Profil PDV avec 273 packages et 8347 items_right à supprimer. Groupes associés : 2G SUNSET B2B, PDV.',
    solution: `Script : /dbs01/bcd/production/script/Del_profil_Mobi_ss_validation.sh 7140003 276775
Le script vérifie les users, groupes, packages et items, puis supprime les droits automatiquement.`,
    motsCles: ['PDV', 'point de vente', 'désactivation', 'code agence', 'Del_profil_Mobi', 'MARIGOT', '7140003'],
  },
  // ── Batch Frédéric 01/04/2026 ──────────────────────────────────────────────
  {
    id: 't31',
    numero: 275748,
    categorie: 'Libération IMEI',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Harold FARIAL',
    date: '2026-02-12',
    symptome: 'Libération IMEI + annulation FID — Client 1973900 — 0694920925. Cliente a changé d\'avis après validation FID.',
    contexte: 'Après validation de la FID, la cliente ne veut plus du mobile. Demande de remettre l\'ancienneté (54 mois), remettre l\'ancien IMEI, et libérer le nouveau IMEI. Ancien IMEI : 354510915799878, Nouveau IMEI : 355604933249617.',
    diagnostic: 'Double action nécessaire : libération IMEI via APP_OCS puis annulation FID via APP_OCS 11605 (MAJ_suite_annulation_FID).',
    solution: `Étape 1 : APP_OCS — Libération IMEI (ticket 275748). PJ : liberation_imei_info_20260212_1517.txt.
Étape 2 : APP_OCS 11605 — MAJ_suite_annulation_FID.
Trace : msisdn='0694920925', date_fin_abo=04/08/2023, date_ref_anciennete=05/08/2021, date_eligible_fid=04/08/2022, code requete : 11605.`,
    motsCles: ['IMEI', 'libération', 'annulation FID', 'APP_OCS', '11605', 'ancienneté', 'changement terminal'],
  },
  {
    id: 't32',
    numero: 275764,
    categorie: 'Réaff. Numéro',
    priorite: 'Haute',
    file: 'APPLICATIONS',
    demandeur: 'Yamiley Horeb',
    date: '2026-02-13',
    symptome: 'Libération MSISDN pour réaffectation — SC SERVICE DBS DIGICEL — Client Business 2037236 — 0690112580.',
    contexte: 'Demande de libération de la ligne 0690112580 pour réaffectation comme ligne de prêt. Client Business.',
    diagnostic: 'MSISDN en statut inactif avec MS_CLASS=0. Mise à jour vers statut réaffectable (MSISDN_STATUS=7).',
    solution: `SQL: UPDATE MSISDN SET ST_MSISDN_ID='0', MSISDN_STATUS='7'
WHERE MSISDN_no IN ('0690112580') AND MS_CLASS='0';
COMMIT;`,
    motsCles: ['MSISDN', 'réaffectation', 'MSISDN_STATUS', 'statut 7', 'Business', 'ligne de prêt'],
  },
  {
    id: 't33',
    numero: 275767,
    categorie: 'Libération IMEI',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Lynda Justin',
    date: '2026-02-13',
    symptome: 'Libération 4 IMEI fictifs — SC SERVICE DBS DIGICEL — Client Business 2037236.',
    contexte: 'Client Business 2037236. Demande de libération de 4 IMEI fictifs : 100000000000527, 100000000000528, 100000000000530, 100000000000531.',
    diagnostic: 'IMEI fictifs verrouillés dans APP_OCS. Libération en batch requise.',
    solution: 'APP_OCS — Libération des 4 IMEI fictifs. PJ : liberation_imei_info_20260213_1143.txt.',
    motsCles: ['IMEI', 'libération', 'multiple', 'fictif', 'APP_OCS', 'Business'],
  },
  {
    id: 't34',
    numero: 275778,
    categorie: 'Anomalie',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Lynda Justin',
    date: '2026-02-13',
    symptome: 'Incident réception d\'appels — SARL TRANSMADOM — Client 1529214 — 0696450394.',
    contexte: 'L\'utilisateur de la ligne 0696450394 n\'arrive pas à recevoir d\'appels depuis plus de 3 mois. Message d\'erreur : "le téléphone de votre interlocuteur n\'est pas accessible". Appels sortants et internet fonctionnent. Changement de carte SIM déjà effectué sans succès.',
    diagnostic: 'Problème côté portabilité. Ligne réinitialisée par l\'équipe application.',
    solution: 'Réinitialisation de la ligne. Client doit relancer son terminal et tester.',
    motsCles: ['appels entrants', 'réception', 'réinitialisation', 'portabilité', 'TRANSMADOM'],
  },
  {
    id: 't35',
    numero: 275787,
    categorie: 'Anomalie',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Barbra Rose Sophiane Saint-Jean',
    date: '2026-02-13',
    symptome: 'Incident suite portabilité entrante — 0696231753 — NON ENREGISTRÉ SUR LE RÉSEAU.',
    contexte: 'Portabilité entrante le 07/02/2026. Depuis, cliente ne peut pas passer d\'appels ni utiliser les données mobiles. Message "NON ENREGISTRÉ SUR LE RÉSEAU". Test croisé, changement SIM et réinitialisation profil HLR effectués sans succès. Au recontact le 13/02, message "numéro non attribué".',
    diagnostic: 'Problème de profil réseau suite à la portabilité entrante. Reset de la ligne nécessaire.',
    solution: 'Reset de la ligne effectué par l\'équipe application. Client doit relancer son terminal. Ligne fonctionnelle après reset.',
    motsCles: ['portabilité entrante', 'NON ENREGISTRÉ', 'reset ligne', 'HLR', 'numéro non attribué'],
  },
  {
    id: 't36',
    numero: 275788,
    categorie: 'Libération IMEI',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Namanaka Diomete',
    date: '2026-02-13',
    symptome: 'Demande de libération de matériel.',
    contexte: 'Demande standard de libération de matériel (IMEI).',
    diagnostic: 'IMEI verrouillé dans APP_OCS. Libération standard requise.',
    solution: 'APP_OCS — Libération IMEI.',
    motsCles: ['IMEI', 'libération', 'matériel', 'APP_OCS'],
  },
  {
    id: 't37',
    numero: 275793,
    categorie: 'Autre',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Dixon Diogene',
    date: '2026-02-14',
    symptome: 'Demande de libération de carte SIM.',
    contexte: 'Demande de libération d\'une carte SIM bloquée dans le système.',
    diagnostic: 'SIM bloquée dans un stock. Libération nécessaire pour réaffectation.',
    solution: 'Libération de la SIM dans la base MOBI (UPDATE SIM SET SIM_STATUS=\'0\', ST_SIM_ID=\'0\').',
    motsCles: ['SIM', 'libération', 'carte SIM', 'ICCID'],
  },
  {
    id: 't38',
    numero: 275871,
    categorie: 'Autre',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Jean Ceant',
    date: '2026-02-20',
    symptome: 'Demande de disponibilité forfait.',
    contexte: 'Demande de mise en disponibilité d\'un forfait pour un client.',
    diagnostic: 'Forfait bloqué dans customer_package nécessitant une libération manuelle.',
    solution: 'SQL: UPDATE customer_package SET pack_end_activation pour libérer le forfait.',
    motsCles: ['forfait', 'disponibilité', 'customer_package', 'libération offre'],
  },
  {
    id: 't39',
    numero: 275879,
    categorie: 'Portabilité/PNM',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Aneesa Hardat',
    date: '2026-02-21',
    symptome: 'Réclamation portabilité — 0690772037.',
    contexte: 'Réclamation client suite à un problème de portabilité sur le numéro 0690772037.',
    diagnostic: 'Vérification du portage dans PortaDB et correction si nécessaire.',
    solution: 'Vérification et correction du portage dans PortaDB. Communication du résultat au demandeur.',
    motsCles: ['portabilité', 'réclamation', 'PortaDB', 'portage'],
  },
  {
    id: 't40',
    numero: 275892,
    categorie: 'Portabilité/PNM',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'oraclevmqprostdb01',
    date: '2026-02-23',
    symptome: '[PNM] Vérification des résiliations pour PSO du 23/02/2026.',
    contexte: 'Vérification automatique des résiliations pour les portabilités sortantes (PSO) du jour.',
    diagnostic: 'Script automatique de vérification PSO. Identification des MSISDN non résiliés.',
    solution: 'Vérification des résiliations PSO. Si MSISDN non résilié, résiliation manuelle via SoapUI (Cas Pratique #18).',
    motsCles: ['PSO', 'résiliation', 'vérification', 'portabilité sortante', 'SoapUI'],
  },
  {
    id: 't41',
    numero: 275763,
    categorie: 'Portabilité/PNM',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Frédéric Arduin',
    date: '2026-02-13',
    symptome: '[DAPI] Modification crontab en PROD pour exception des jours fériés 17/02 et 18/02.',
    contexte: 'Les jours fériés du 17 et 18 février nécessitent une modification du crontab en production pour désactiver les traitements PNM automatiques.',
    diagnostic: 'Modification temporaire du crontab pour exclure les jours fériés de la planification.',
    solution: 'Modification du crontab sur vmqproportawebdb01 pour désactiver les traitements les 17 et 18/02, puis remise en place après les jours fériés.',
    motsCles: ['DAPI', 'crontab', 'jours fériés', 'modification PROD', 'planification'],
  },
  {
    id: 't42',
    numero: 275894,
    categorie: 'Anomalie',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Rose Philiza',
    date: '2026-02-23',
    symptome: '[CCARE] — 0694136600 — Incident de rattrapage.',
    contexte: 'Incident nécessitant un rattrapage de ligne sur le numéro 0694136600.',
    diagnostic: 'Problème réseau suite à un incident. Rattrapage de la ligne nécessaire.',
    solution: 'Rattrapage de la ligne côté réseau. Client doit redémarrer son terminal après correction.',
    motsCles: ['rattrapage', 'incident', 'CCARE', 'réseau', 'ligne'],
  },
  {
    id: 't43',
    numero: 275690,
    categorie: 'Astreinte',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Frédéric Arduin',
    date: '2026-02-11',
    symptome: '[AST] — Astreinte FARDUIN — Semaine du 09/02/2026 au 16/02/2026.',
    contexte: 'Ticket d\'astreinte hebdomadaire couvrant la semaine du 09 au 16 février 2026.',
    diagnostic: 'Surveillance des systèmes PNM et MOBI pendant la semaine d\'astreinte.',
    solution: 'Vérifications quotidiennes : bascule, FNR, vacations, acquittements, SIM_SWAP WIZZEE. Résumé en fin de semaine.',
    motsCles: ['astreinte', 'hebdomadaire', 'surveillance', 'PNM', 'MOBI'],
  },
  {
    id: 't44',
    numero: 275900,
    categorie: 'Libération IMEI',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Nicolas Pohl',
    date: '2026-02-23',
    symptome: 'Libération IMEI.',
    contexte: 'Demande standard de libération d\'IMEI.',
    diagnostic: 'IMEI verrouillé dans APP_OCS. Libération standard requise.',
    solution: 'APP_OCS — Libération IMEI.',
    motsCles: ['IMEI', 'libération', 'APP_OCS'],
  },
  {
    id: 't45',
    numero: 275901,
    categorie: 'Libération IMEI',
    priorite: 'Normale',
    file: 'APPLICATIONS',
    demandeur: 'Stephanie Julien',
    date: '2026-02-23',
    symptome: 'Libération IMEI et numéro — COLLÈGE ALEXANDRE STELLIO — Client 2000272.',
    contexte: 'Demande de libération combinée IMEI + MSISDN pour le Collège Alexandre Stellio, client 2000272.',
    diagnostic: 'IMEI et MSISDN verrouillés. Double libération nécessaire : APP_OCS pour IMEI puis SQL pour MSISDN.',
    solution: 'APP_OCS — Libération IMEI, puis UPDATE MSISDN SET MSISDN_STATUS=\'7\' pour le numéro.',
    motsCles: ['IMEI', 'MSISDN', 'libération', 'combinée', 'APP_OCS', 'Collège Stellio'],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function getCategoryCount(categorie: string): number {
  return TICKETS.filter((t) => t.categorie === categorie).length;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

function isCodeBlock(text: string): boolean {
  return /\b(SQL:|UPDATE |DELETE |SELECT |INSERT |APP_OCS|SET |WHERE |FROM )/i.test(text);
}

// ─── Components ─────────────────────────────────────────────────────────────

function CategoryBadge({ categorie }: { categorie: string }) {
  const color = CATEGORY_COLORS[categorie] || CATEGORY_COLORS.Autre;
  const icon = CATEGORY_ICONS[categorie] || CATEGORY_ICONS.Autre;
  return (
    <Chip
      icon={<Iconify icon={icon} width={16} />}
      label={categorie}
      size="small"
      sx={{
        bgcolor: `${color}18`,
        color,
        fontWeight: 700,
        fontSize: '0.75rem',
        border: `1px solid ${color}40`,
        '& .MuiChip-icon': { color },
      }}
    />
  );
}

function SimilarBadge({ count }: { count: number }) {
  if (count <= 1) return null;
  return (
    <Chip
      label={`\u00d7${count} similaires`}
      size="small"
      variant="outlined"
      sx={{ fontSize: '0.7rem', height: 22, color: 'text.secondary' }}
    />
  );
}

function SolutionBlock({ text }: { text: string }) {
  if (isCodeBlock(text)) {
    return (
      <Box
        component="pre"
        sx={{
          bgcolor: 'grey.900',
          color: '#22c55e',
          p: 1.5,
          borderRadius: 1,
          fontSize: '0.78rem',
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          m: 0,
          lineHeight: 1.6,
        }}
      >
        {text}
      </Box>
    );
  }
  return (
    <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
      {text}
    </Typography>
  );
}

function TicketDetailDialog({
  ticket,
  open,
  onClose,
}: {
  ticket: TicketDoc | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!ticket) return null;
  const catColor = CATEGORY_COLORS[ticket.categorie] || CATEGORY_COLORS.Autre;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography
              variant="h6"
              sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.main' }}
            >
              #{ticket.numero}
            </Typography>
            <CategoryBadge categorie={ticket.categorie} />
            {ticket.priorite === 'Haute' && (
              <Chip
                icon={<Iconify icon="solar:danger-bold" width={14} />}
                label="Haute"
                size="small"
                color="error"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 22 }}
              />
            )}
          </Stack>
          <IconButton onClick={onClose} size="small">
            <Iconify icon="solar:close-circle-bold" width={22} />
          </IconButton>
        </Stack>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {ticket.date} &middot; {ticket.file} &middot; {ticket.demandeur}
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2.5}>
          {/* Symptome */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
              <Iconify icon="solar:eye-bold-duotone" width={18} sx={{ color: 'warning.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Sympt\u00f4me
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              {ticket.symptome}
            </Typography>
          </Box>

          {/* Contexte */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
              <Iconify icon="solar:document-text-bold-duotone" width={18} sx={{ color: 'info.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Contexte
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              {ticket.contexte}
            </Typography>
          </Box>

          {/* Diagnostic */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
              <Iconify icon="solar:stethoscope-bold-duotone" width={18} sx={{ color: 'error.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Diagnostic
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              {ticket.diagnostic}
            </Typography>
          </Box>

          {/* Solution */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
              <Iconify icon="solar:check-read-bold-duotone" width={18} sx={{ color: 'success.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Solution
              </Typography>
            </Stack>
            <SolutionBlock text={ticket.solution} />
          </Box>

          {/* Mots-cles */}
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
              Mots-cl\u00e9s
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.5}>
              {ticket.motsCles.map((mc) => (
                <Chip
                  key={mc}
                  label={mc}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 22, fontFamily: 'monospace' }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────

export default function TicketsKnowledge() {
  const [search, setSearch] = useState('');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketDoc | null>(null);

  const toggleCategory = (cat: string) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const filtered = useMemo(() => {
    let result = TICKETS;

    if (activeCategories.length > 0) {
      result = result.filter((t) => activeCategories.includes(t.categorie));
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.numero.toString().includes(s) ||
          t.categorie.toLowerCase().includes(s) ||
          t.symptome.toLowerCase().includes(s) ||
          t.contexte.toLowerCase().includes(s) ||
          t.diagnostic.toLowerCase().includes(s) ||
          t.solution.toLowerCase().includes(s) ||
          t.motsCles.some((mc) => mc.toLowerCase().includes(s)) ||
          t.demandeur.toLowerCase().includes(s)
      );
    }

    return result;
  }, [search, activeCategories]);

  return (
    <DashboardLayout>
      <Head title="Base de Connaissances Tickets" />

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
          <Iconify icon="solar:archive-bold-duotone" width={32} sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Base de Connaissances Tickets
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Historique des tickets r&eacute;solus &mdash; Probl&egrave;mes et solutions document&eacute;s par Fr&eacute;d&eacute;ric Arduin
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Rechercher par num\u00e9ro, mot-cl\u00e9, SQL, sympt\u00f4me..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:magnifer-bold" width={18} />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Filter chips */}
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategories.includes(cat);
            const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Autre;
            const count = getCategoryCount(cat);
            if (count === 0) return null;
            return (
              <Chip
                key={cat}
                label={`${cat} (${count})`}
                size="small"
                onClick={() => toggleCategory(cat)}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  bgcolor: isActive ? `${color}20` : 'transparent',
                  color: isActive ? color : 'text.secondary',
                  border: `1px solid ${isActive ? color : 'rgba(145,158,171,0.32)'}`,
                  '&:hover': { bgcolor: `${color}14` },
                }}
              />
            );
          })}
          {activeCategories.length > 0 && (
            <Chip
              label="Effacer filtres"
              size="small"
              onDelete={() => setActiveCategories([])}
              sx={{ fontSize: '0.75rem' }}
            />
          )}
        </Stack>

        {/* Results count */}
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
          {filtered.length} ticket{filtered.length !== 1 ? 's' : ''} trouv\u00e9{filtered.length !== 1 ? 's' : ''}
        </Typography>

        {/* Ticket grid */}
        <Grid container spacing={2}>
          {filtered.map((ticket) => {
            const catColor = CATEGORY_COLORS[ticket.categorie] || CATEGORY_COLORS.Autre;
            const catCount = getCategoryCount(ticket.categorie);

            return (
              <Grid key={ticket.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    borderLeft: 4,
                    borderLeftColor: catColor,
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: 6 },
                  }}
                >
                  <CardActionArea
                    onClick={() => setSelectedTicket(ticket)}
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start' }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, flex: 1 }}>
                      {/* Header row */}
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.main' }}
                        >
                          #{ticket.numero}
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          {ticket.priorite === 'Haute' && (
                            <Iconify icon="solar:danger-bold" width={16} sx={{ color: 'error.main' }} />
                          )}
                          <SimilarBadge count={catCount} />
                        </Stack>
                      </Stack>

                      {/* Category badge */}
                      <Box sx={{ mb: 1.5 }}>
                        <CategoryBadge categorie={ticket.categorie} />
                      </Box>

                      {/* Symptome */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.82rem',
                          lineHeight: 1.5,
                          mb: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {ticket.symptome}
                      </Typography>

                      {/* Solution preview */}
                      <Box
                        sx={{
                          bgcolor: 'grey.900',
                          color: '#22c55e',
                          p: 1,
                          borderRadius: 0.5,
                          fontSize: '0.72rem',
                          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.4,
                        }}
                      >
                        {truncate(ticket.solution.split('\n')[0], 80)}
                      </Box>

                      {/* Date */}
                      <Typography variant="caption" sx={{ color: 'text.disabled', mt: 1, display: 'block' }}>
                        {ticket.date}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {filtered.length === 0 && (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <Iconify icon="solar:ghost-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              Aucun ticket trouv&eacute; pour &laquo; {search} &raquo;
            </Typography>
          </Stack>
        )}
      </Box>

      {/* Detail dialog */}
      <TicketDetailDialog
        ticket={selectedTicket}
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />
    </DashboardLayout>
  );
}
