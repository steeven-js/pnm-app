import { useCallback, useState } from 'react';
import { Head } from '@inertiajs/react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { DashboardLayout } from 'src/layouts/dashboard/layout';

// ─── Types ──────────────────────────────────────────────────────────────────

type Server = {
  name: string;
  hostname: string;
  ip: string;
  role: string;
  icon: string;
  color: string;
};

type Script = {
  server: string;
  name: string;
  actions: string;
  schedule: string;
};

type UsefulLink = {
  label: string;
  url: string;
  description: string;
  icon: string;
};

// ─── Data ───────────────────────────────────────────────────────────────────

const SERVERS: Server[] = [
  {
    name: 'vmqproportasync01',
    hostname: 'DigimqPortaSync01',
    ip: '172.24.119.69',
    role: 'Synchronisation fichiers inter-opérateurs. Contrôle, acquitte, archive les fichiers BTCTF. Demande l\'intégration et la génération des tickets dans PortaDB.',
    icon: 'solar:server-bold-duotone',
    color: '#2563eb',
  },
  {
    name: 'vmqproportawebdb01',
    hostname: 'DigimqPortaWebdb',
    ip: '172.24.119.68',
    role: 'Base de données PortaDB + PortaWebDB (MySQL :3306). Serveur central de la portabilité. Héberge les scripts de restitution et d\'export.',
    icon: 'solar:database-bold-duotone',
    color: '#d97706',
  },
  {
    name: 'btctf',
    hostname: 'BTCTF',
    ip: '172.24.119.70',
    role: 'Bouygue Telecom Caraïbe Transfer File. Hub de transfert SFTP des fichiers PNMDATA/PNMSYNC avec les 5 opérateurs. Transmet et envoie les fichiers via SCP.',
    icon: 'solar:transfer-horizontal-bold-duotone',
    color: '#16a34a',
  },
  {
    name: 'vmqproportaweb01',
    hostname: 'PortaWebUI / PortaWs',
    ip: '172.24.119.71 / .72',
    role: 'Portails web Tomcat & Glassfish. PortaWebUI (:8080) pour la gestion des dossiers. PortaWs (:4848) pour les web services SOAP.',
    icon: 'solar:monitor-bold-duotone',
    color: '#7c3aed',
  },
  {
    name: 'vmqpromsbox01/02',
    hostname: 'Micro services',
    ip: 'VIP: 172.24.119.36',
    role: 'Micro services de portabilité. Traitements métier : bascule, valorisation, notifications. VIP load-balanced.',
    icon: 'solar:widget-bold-duotone',
    color: '#0891b2',
  },
  {
    name: 'ESB DataPower',
    hostname: 'vmqprotopapi01/02',
    ip: 'VIP: f5-vip-kong',
    role: 'Proxy ESB DataPower. Passerelle XML/SOAP entre Porta et MOBI. Communication bidirectionnelle avec le SI facturation.',
    icon: 'solar:routing-bold-duotone',
    color: '#dc2626',
  },
  {
    name: 'HUB',
    hostname: 'hub.fwi.digicelgroup.local',
    ip: '—',
    role: 'Hub central Digicel FWI. Point d\'entrée réseau pour les serveurs inter-opérateurs et le BTCTF.',
    icon: 'solar:global-bold-duotone',
    color: '#6b7280',
  },
  {
    name: 'EMA / EMM',
    hostname: 'ema15-digicel',
    ip: '—',
    role: 'Serveur EMA (bascule) et EMM (valorisation). Reçoit les fichiers générés par EmaExtracteur/EmmExtracteur pour mise à jour MOBI.',
    icon: 'solar:file-send-bold-duotone',
    color: '#ea580c',
  },
];

const SCRIPTS: Script[] = [
  // BTCTF
  {
    server: 'btctf',
    name: 'synchro-pnmv3.sh',
    actions: 'Intégration : copie les fichiers reçus dans /PortaSync/pnmdata/0X/recv/ et exécute PnmAckManager.sh. Envoi et archivage des fichiers générés depuis /send/ vers /arch_send/.',
    schedule: 'Lun-Ven toutes les 10 min [10h-12h] [14h-16h] [19h-21h] + Dimanche [22h-24h]',
  },
  // vmqproportasync01
  {
    server: 'vmqproportasync01',
    name: 'PnmAckManager.sh',
    actions: 'Contrôle, intégration, acquittement et archivage des fichiers reçus PNMDATA.0X.02 (de recv/ vers arch_recv/).',
    schedule: 'Déclenché par synchro-pnmv3.sh',
  },
  {
    server: 'vmqproportasync01',
    name: 'PnmDataManager.sh',
    actions: 'Génération des fichiers PNMDATA.02.0X à envoyer dans /PortaSync/pnmdata/0X/send/ pour chaque opérateur.',
    schedule: 'Lun-Ven à 10h, 14h, 19h',
  },
  {
    server: 'vmqproportasync01',
    name: 'PnmSyncManager.sh',
    actions: 'Génération des fichiers de synchronisation PNMSYNC.02.0X dans /PortaSync/pnmdata/0X/send/.',
    schedule: 'Dimanche à 23h',
  },
  {
    server: 'vmqproportasync01',
    name: 'TraitementBascule.sh',
    actions: 'Exécute EmaExtracteur.sh, dépose le fichier EMA généré sur le serveur EMA, puis archive.',
    schedule: 'Lun-Ven à 9h00',
  },
  {
    server: 'vmqproportasync01',
    name: 'TraitementValorisation.sh',
    actions: 'Exécute EmmExtracteur.sh, dépose le fichier EMM généré sur le serveur EMM, puis archive.',
    schedule: 'Lun-Ven à 9h00',
  },
  {
    server: 'vmqproportasync01',
    name: 'EmaExtracteur.sh',
    actions: 'Génération du fichier EMA et mise à jour de MOBI (via ESB) pour la bascule des portages entrants.',
    schedule: 'Appelé par TraitementBascule.sh',
  },
  {
    server: 'vmqproportasync01',
    name: 'EmmExtracteur.sh',
    actions: 'Génération du fichier EMM et mise à jour de MOBI (via ESB) pour la valorisation.',
    schedule: 'Appelé par TraitementValorisation.sh',
  },
  // vmqproportawebdb01
  {
    server: 'vmqproportawebdb01',
    name: 'PortaDB-export-csv.sh',
    actions: 'Exporte les tables de PortaDB en CSV, copie sur EMM, supprime les fichiers temporaires (besoins MIS).',
    schedule: 'Tous les jours à 00h00',
  },
  {
    server: 'vmqproportawebdb01',
    name: 'Pnm-Verif-Bascule-MOBI',
    actions: 'Valide la mise à jour des changements MSISDN et résiliations dans MOBI vs bascules PortaDB.',
    schedule: 'Après la bascule',
  },
  {
    server: 'vmqproportawebdb01',
    name: 'Pnm-Restitutions-Sortantes-Tickets.sh',
    actions: 'Extract des résiliations hors tranche dans MOBI et création des tickets 3400 (restitution) dans PortaDB.',
    schedule: 'Jeudis à 10h45',
  },
  {
    server: 'vmqproportawebdb01',
    name: 'Pnm-Restitutions-Sortantes-Bascule.sh',
    actions: 'Extract des restitutions sortantes basculées de PortaDB et mise à jour MOBI (msisdn_status).',
    schedule: 'Jeudis à 11h00',
  },
  {
    server: 'vmqproportawebdb01',
    name: 'Pnm-Restitutions-Entrantes-Bascule',
    actions: 'Extract des restitutions entrantes basculées de PortaDB et mise à jour MOBI (msisdn_status).',
    schedule: 'Lun-Ven à 21h25',
  },
];

// Timeline unifiée : serveur + mails regroupés par créneau horaire (ordre asc)
type TimelineSlotItem = {
  type: 'mail' | 'server';
  title: string;
  detail: string;
  category?: 'vacation' | 'supervision' | 'incident' | 'reporting';
  from?: string;
  commands?: string[];
  check?: string;
  server?: string;
};
type TimelineSlot = { time: string; items: TimelineSlotItem[] };

const DAILY_TIMELINE: TimelineSlot[] = [
  {
    time: '~04:00',
    items: [
      { type: 'mail', title: '[CTO] Bascule du jour tardive ou en echec', detail: 'Vérifier si des MSISDN nécessitent un rattrapage manuel. Fichiers Rattrapage_CTO_MQ/GF/GP.', category: 'supervision', from: 'APP_VENTES' },
    ],
  },
  {
    time: '~09:00',
    items: [
      { type: 'server', title: 'Bascule & Valorisation', detail: 'Tous les opérateurs "Check success" + "Fin de Traitement"', server: 'vmqproportasync01', commands: ['tail -n 12 /home/porta_pnmv3/PortaSync/log/EmaExtracter.log && tail -n 12 /home/porta_pnmv3/PortaSync/log/EmmExtracter.log'], check: 'Tous les opérateurs "Check success" + "Fin de Traitement"' },
      { type: 'mail', title: '[PNM] Reporting RIO incorrect', detail: 'Vérifier le nombre de refus entrante/sortante pour RIO incorrect. Si > 0, investiguer.', category: 'reporting', from: 'porta_pnmv3' },
      { type: 'mail', title: '[PNM][INCIDENT] Incidents détectés', detail: 'Analyser chaque incident : refus 1210/1220, erreurs 7000, AR non-reçus, conflits.', category: 'incident', from: 'porta_pnmv3' },
    ],
  },
  {
    time: '~10:15',
    items: [
      { type: 'server', title: 'Génération fichiers vacation', detail: 'Fichier PNMDATA généré pour op. 01, 03, 04, 05, 06 + "Fin de Traitement"', server: 'vmqproportasync01', commands: ['tail -n 14 /home/porta_pnmv3/PortaSync/log/PnmDataManager.log'], check: 'Fichier PNMDATA généré pour op. 01, 03, 04, 05, 06 + "Fin de Traitement"' },
      { type: 'mail', title: '[PNMV3] PSO du jour Forfait', detail: 'Ouvrir le CSV Pnm_PSO_MOBI, vérifier la volumétrie vs prévisions veille.', category: 'reporting', from: 'porta_pnmv3' },
    ],
  },
  {
    time: '~11:15',
    items: [
      { type: 'server', title: 'Acquittements fichiers', detail: '"Aucune notification d\'AR SYNC non-reçu" pour chaque opérateur', server: 'vmqproportasync01', commands: ['tail -f /home/porta_pnmv3/PortaSync/log/PnmAckManager.log'], check: '"Aucune notification d\'AR SYNC non-reçu" pour chaque opérateur' },
      { type: 'mail', title: '[PNM] Ticket(s) 1210 en attente', detail: 'Trier par ancienneté. < 3j surveiller, 3-5j relancer, > 5j escalader.', category: 'incident', from: 'porta_pnmv3' },
      { type: 'mail', title: '[PNM] Ticket(s) en attente', detail: 'Traiter les tickets les plus anciens en priorité (XLS joint).', category: 'incident', from: 'porta_pnmv3' },
      { type: 'mail', title: '[PNM] Rapport vacation 1', detail: 'Vérifier fichiers échangés = attendus, ACR OK pour les 5 opérateurs, aucun .ERR.', category: 'vacation', from: 'porta_pnmv3' },
    ],
  },
  {
    time: '~15:25',
    items: [
      { type: 'mail', title: '[PNM] Portabilités prévues DIGICEL-WIZZEE', detail: 'Vérifier IN/OUT DIGICEL + WIZZEE, portabilités internes veille.', category: 'reporting', from: 'porta_pnmv3' },
      { type: 'mail', title: '[PNM] Rapport vacation 2', detail: 'Comparer avec vacation 1 : fichiers manquants réapparus ? ACR OK.', category: 'vacation', from: 'porta_pnmv3' },
    ],
  },
  {
    time: '~20:35',
    items: [
      { type: 'mail', title: '[PNM] Rapport vacation 3 + clôture', detail: 'Dernier rapport du jour. Vérifier, clôturer la journée PNM.', category: 'vacation', from: 'porta_pnmv3' },
    ],
  },
];

const USEFUL_LINKS: UsefulLink[] = [
  { label: 'PortaWebUI', url: 'http://172.24.119.71:8080/PortaWebUi', description: 'Interface web de gestion des dossiers de portabilité', icon: 'solar:monitor-bold-duotone' },
  { label: 'PortaWs', url: 'http://172.24.119.72:8080/PortaWs', description: 'Web services SOAP pour les opérations de portabilité', icon: 'solar:code-bold-duotone' },
  { label: 'GPMAG Portail', url: 'https://portail.gpmag.fr', description: 'Portail du GPMAG (Groupement de Portabilité Mobile Antilles-Guyane)', icon: 'solar:global-bold-duotone' },
  { label: 'vmqproportasync01 (SSH)', url: 'ssh://172.24.119.69', description: 'Serveur de synchronisation — logs dans /home/porta_pnmv3/PortaSync/log/', icon: 'solar:server-bold-duotone' },
  { label: 'vmqproportawebdb01 (SSH)', url: 'ssh://172.24.119.68', description: 'Serveur PortaDB — MySQL :3306, scripts dans /home/porta/', icon: 'solar:database-bold-duotone' },
  { label: 'Micro services (VIP)', url: 'http://172.24.119.36', description: 'VIP des micro services portabilité (vmqpromsbox01/02)', icon: 'solar:widget-bold-duotone' },
];

const CONTACTS = [
  { name: 'GPMAG (Secrétariat)', email: 'secretariat@gpmag.fr', phone: '—', role: 'Coordination inter-opérateurs, conflits, escalades' },
  { name: 'Supervision Digicel', email: 'supervision@digicelgroup.fr', phone: '—', role: 'Rapports automates, alertes serveur, incidents production' },
  { name: 'Support N2 Porta', email: 'support.porta@digicelgroup.fr', phone: '—', role: 'Escalade incidents techniques, bugs applicatifs' },
];

const MAIL_CATEGORY_CONFIG: Record<string, { label: string; color: 'success' | 'info' | 'warning' | 'error' }> = {
  vacation: { label: 'Vacation', color: 'success' },
  supervision: { label: 'Supervision', color: 'info' },
  incident: { label: 'Incident', color: 'error' },
  reporting: { label: 'Reporting', color: 'warning' },
};

const VACATION_SCHEDULE = [
  { name: 'Vacation 1', time: '10h → 11h', mailTime: '~11h35', description: 'Premier échange de fichiers PNMDATA avec les 5 opérateurs' },
  { name: 'Vacation 2', time: '14h → 15h', mailTime: '~15h35', description: 'Deuxième échange. Comparer avec vacation 1' },
  { name: 'Vacation 3', time: '19h → 20h', mailTime: '~20h35', description: 'Troisième et dernier échange. Clôture journée' },
  { name: 'Synchro dimanche', time: '22h → 00h', mailTime: '—', description: 'Synchronisation hebdomadaire (PNMSYNC)' },
];

const FLUX_STEPS = [
  { step: 1, title: 'Génération des fichiers', description: 'PnmDataManager.sh génère les fichiers PNMDATA.02.0X pour chaque opérateur dans /PortaSync/pnmdata/0X/send/', server: 'vmqproportasync01', icon: 'solar:file-bold-duotone' },
  { step: 2, title: 'Transfert SFTP via BTCTF', description: 'synchro-pnmv3.sh copie les fichiers depuis send/ vers le serveur BTCTF qui les transmet aux opérateurs via SFTP', server: 'btctf', icon: 'solar:transfer-horizontal-bold-duotone' },
  { step: 3, title: 'Réception & intégration', description: 'Les fichiers reçus des opérateurs sont copiés dans recv/. PnmAckManager.sh contrôle, intègre, acquitte et archive', server: 'vmqproportasync01', icon: 'solar:inbox-bold-duotone' },
  { step: 4, title: 'Traitement dans PortaDB', description: 'Les tickets sont intégrés dans la base PortaDB via DigimqPortaWebdb. Communication XML/SOAP avec le SI', server: 'vmqproportawebdb01', icon: 'solar:database-bold-duotone' },
  { step: 5, title: 'Bascule & Valorisation', description: 'EmaExtracteur (bascule) et EmmExtracteur (valorisation) mettent à jour MOBI via l\'ESB DataPower', server: 'vmqproportasync01', icon: 'solar:refresh-bold-duotone' },
  { step: 6, title: 'Vérification & Rapport', description: 'Emails de rapport envoyés : vacations, incidents, automates. Vérification via PortaWebUI et logs serveur', server: 'Tous', icon: 'solar:check-circle-bold-duotone' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function SectionTitle({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Iconify icon={icon} width={28} sx={{ color: 'primary.main' }} />
        <Typography variant="h5">{title}</Typography>
      </Stack>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: 5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

function ServerCard({ server }: { server: Server }) {
  return (
    <Card sx={{ borderLeft: 4, borderColor: server.color }}>
      <CardContent>
        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
          <Iconify icon={server.icon} width={28} sx={{ color: server.color, mt: 0.25 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>{server.name}</Typography>
            <Typography variant="caption" color="text.disabled">{server.hostname} — {server.ip}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>{server.role}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Architecture Diagram Components ────────────────────────────────────────

type DiagramNodeProps = {
  label: string;
  sublabel?: string;
  ip?: string;
  color: string;
  icon: string;
  width?: number;
  small?: boolean;
};

function DiagramNode({ label, sublabel, ip, color, icon, width = 170, small }: DiagramNodeProps) {
  return (
    <Box sx={{
      width, minHeight: small ? 56 : 72, border: 2, borderColor: color, borderRadius: 2,
      bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', px: 1.5, py: small ? 0.75 : 1, position: 'relative',
      boxShadow: `0 2px 8px ${color}22`, transition: 'all 0.2s',
      '&:hover': { boxShadow: `0 4px 16px ${color}44`, transform: 'translateY(-2px)' },
    }}>
      <Stack direction="row" alignItems="center" spacing={0.75}>
        <Iconify icon={icon} width={small ? 16 : 20} sx={{ color }} />
        <Typography variant={small ? 'caption' : 'body2'} fontWeight={700} noWrap>{label}</Typography>
      </Stack>
      {sublabel && <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', mt: 0.25 }}>{sublabel}</Typography>}
      {ip && <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.6rem', color: 'text.disabled' }}>{ip}</Typography>}
    </Box>
  );
}

function ConnectionArrow({ label, direction = 'right', color = '#94a3b8' }: { label: string; direction?: 'right' | 'down' | 'both'; color?: string }) {
  const isVertical = direction === 'down';
  return (
    <Box sx={{
      display: 'flex', flexDirection: isVertical ? 'column' : 'row', alignItems: 'center',
      gap: 0.5, color, mx: isVertical ? 0 : 0.5, my: isVertical ? 0.5 : 0,
    }}>
      {direction === 'both' && <Typography sx={{ fontSize: '0.7rem' }}>◄</Typography>}
      <Box sx={{
        [isVertical ? 'height' : 'width']: isVertical ? 24 : 40,
        [isVertical ? 'width' : 'height']: 2,
        bgcolor: color, borderRadius: 1,
      }} />
      <Typography variant="caption" sx={{
        fontSize: '0.6rem', fontWeight: 600, whiteSpace: 'nowrap',
        position: isVertical ? 'relative' : 'absolute',
        ...(isVertical ? {} : { top: -14, left: '50%', transform: 'translateX(-50%)' }),
      }}>{label}</Typography>
      <Box sx={{
        [isVertical ? 'height' : 'width']: isVertical ? 24 : 40,
        [isVertical ? 'width' : 'height']: 2,
        bgcolor: color, borderRadius: 1,
      }} />
      {direction !== 'both' && <Typography sx={{ fontSize: '0.7rem' }}>{isVertical ? '▼' : '►'}</Typography>}
      {direction === 'both' && <Typography sx={{ fontSize: '0.7rem' }}>►</Typography>}
    </Box>
  );
}

function ArchitectureDiagramPorta() {
  return (
    <Card sx={{ p: 3, mb: 3, overflow: 'auto' }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>Architecture Porta Digicel</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
        Flux de données entre les serveurs internes et les opérateurs externes via BTCTF
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minWidth: 700, py: 2 }}>
        {/* Row 1: Operators */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
          {['01 Orange', '03 SFR', '04 Dauphin', '05 UTS', '06 Free'].map((op) => (
            <DiagramNode key={op} label={op} color="#6b7280" icon="solar:user-rounded-bold-duotone" width={110} small />
          ))}
        </Box>

        <ConnectionArrow label="SFTP (fichiers plats)" direction="both" color="#16a34a" />

        {/* Row 2: BTCTF */}
        <DiagramNode label="BTCTF" sublabel="Hub transfert SFTP" ip="172.24.119.70" color="#16a34a" icon="solar:transfer-horizontal-bold-duotone" width={240} />

        <ConnectionArrow label="SCP (fichiers plats)" direction="both" color="#2563eb" />

        {/* Row 3: Main servers */}
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <DiagramNode label="DigimqPortaSync01" sublabel="Synchronisation" ip="172.24.119.69" color="#2563eb" icon="solar:server-bold-duotone" width={190} />

          <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <Box sx={{ width: 60, height: 2, bgcolor: '#d97706' }} />
            <Typography variant="caption" sx={{ fontSize: '0.6rem', position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', color: '#d97706', fontWeight: 600, whiteSpace: 'nowrap' }}>XML/SOAP</Typography>
            <Box sx={{ fontSize: '0.7rem', color: '#d97706' }}>►</Box>
          </Box>

          <DiagramNode label="DigimqPortaWebdb" sublabel="PortaDB / PortaWebDB" ip="172.24.119.68 — MySQL :3306" color="#d97706" icon="solar:database-bold-duotone" width={220} />
        </Box>

        {/* Row 4: Connections down from Sync and DB */}
        <Box sx={{ display: 'flex', gap: 6, mt: 1 }}>
          {/* Left: EMA/EMM from Sync */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ConnectionArrow label="Fichiers EMA/EMM" direction="down" color="#ea580c" />
            <DiagramNode label="EMA / EMM" sublabel="ema15-digicel" color="#ea580c" icon="solar:file-send-bold-duotone" width={160} />
          </Box>

          {/* Right: ESB from DB */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ConnectionArrow label="XML/SOAP" direction="down" color="#dc2626" />
            <DiagramNode label="ESB DataPower" sublabel="Proxy SOAP" ip="VIP f5-vip-kong" color="#dc2626" icon="solar:routing-bold-duotone" width={170} />
            <ConnectionArrow label="SOAP" direction="down" color="#dc2626" />
            <DiagramNode label="MOBI" sublabel="SI Facturation" color="#9333ea" icon="solar:bill-list-bold-duotone" width={140} />
          </Box>
        </Box>

        {/* Row 5: Portails */}
        <Divider sx={{ width: '80%', my: 2 }} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <DiagramNode label="PortaWebUI" sublabel="Gestion dossiers" ip=":8080" color="#7c3aed" icon="solar:monitor-bold-duotone" width={150} />
          <DiagramNode label="PortaWs" sublabel="Web services" ip=":4848" color="#7c3aed" icon="solar:code-bold-duotone" width={150} />
        </Box>
      </Box>

      {/* Legend */}
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" flexWrap="wrap" gap={2}>
        {[
          { color: '#16a34a', label: 'SFTP / SCP (fichiers plats)' },
          { color: '#2563eb', label: 'Synchronisation interne' },
          { color: '#d97706', label: 'Base de données MySQL' },
          { color: '#dc2626', label: 'XML / SOAP (ESB)' },
          { color: '#ea580c', label: 'Fichiers EMA / EMM' },
          { color: '#7c3aed', label: 'Portails Web (Tomcat / Glassfish)' },
        ].map((item) => (
          <Stack key={item.label} direction="row" alignItems="center" spacing={0.75}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
            <Typography variant="caption" color="text.secondary">{item.label}</Typography>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}

function ArchitectureDiagramProduction() {
  return (
    <Card sx={{ p: 3, mb: 4, overflow: 'auto' }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>Paysage Portabilité — Production</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
        Vue complète de l'environnement de production : du réseau opérateurs jusqu'au SI Facturation MOBI
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minWidth: 800, py: 2 }}>
        {/* Top: External operators */}
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2, bgcolor: 'action.hover', width: '90%' }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>OPÉRATEURS EXTERNES</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Orange', 'SFR/Only', 'Dauphin', 'UTS', 'Free'].map((op) => (
              <DiagramNode key={op} label={op} color="#6b7280" icon="solar:user-rounded-bold-duotone" width={100} small />
            ))}
          </Box>
        </Box>

        <ConnectionArrow label="SFTP" direction="down" color="#16a34a" />

        {/* BTCTF + HUB */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <DiagramNode label="btctf" sublabel="Transfert fichiers" ip="172.24.119.70" color="#16a34a" icon="solar:transfer-horizontal-bold-duotone" width={170} />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.7rem', color: '#6b7280' }}>◄</Typography>
            <Box sx={{ width: 40, height: 2, bgcolor: '#6b7280' }} />
            <Typography sx={{ fontSize: '0.7rem', color: '#6b7280' }}>►</Typography>
          </Box>
          <DiagramNode label="HUB" sublabel="hub.fwi.digicelgroup.local" color="#6b7280" icon="solar:global-bold-duotone" width={200} />
        </Box>

        <ConnectionArrow label="SCP" direction="down" color="#2563eb" />

        {/* Core: Sync → DB → Portails */}
        <Box sx={{ border: 1, borderColor: 'primary.main', borderRadius: 2, p: 2.5, width: '95%', borderStyle: 'dashed' }}>
          <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ mb: 2, display: 'block' }}>INFRASTRUCTURE PORTA DIGICEL</Typography>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            {/* Sync server */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <DiagramNode label="vmqproportasync01" sublabel="Synchronisation" ip="172.24.119.69" color="#2563eb" icon="solar:server-bold-duotone" width={190} />
              <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#ea580c', fontWeight: 600 }}>EMA/EMM ▼</Typography>
              <DiagramNode label="ema15-digicel" sublabel="EMA (bascule) + EMM (valo)" color="#ea580c" icon="solar:file-send-bold-duotone" width={190} small />
            </Box>

            {/* Arrow Sync → DB */}
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#d97706' }}>◄</Typography>
              <Box sx={{ width: 30, height: 2, bgcolor: '#d97706' }} />
              <Typography sx={{ fontSize: '0.7rem', color: '#d97706' }}>►</Typography>
            </Box>

            {/* DB server */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <DiagramNode label="vmqproportawebdb01" sublabel="PortaDB (MySQL :3306)" ip="172.24.119.68" color="#d97706" icon="solar:database-bold-duotone" width={200} />
            </Box>

            {/* Arrow DB → Portails */}
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
              <Box sx={{ width: 20, height: 2, bgcolor: '#7c3aed' }} />
              <Typography sx={{ fontSize: '0.7rem', color: '#7c3aed' }}>►</Typography>
            </Box>

            {/* Portails */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <DiagramNode label="PortaWebUI" sublabel="vmqproportaweb01" ip=":8080" color="#7c3aed" icon="solar:monitor-bold-duotone" width={160} />
              <DiagramNode label="PortaWs" sublabel="vmqproportaws01" ip=":4848" color="#7c3aed" icon="solar:code-bold-duotone" width={160} />
            </Box>
          </Box>
        </Box>

        <ConnectionArrow label="XML / SOAP" direction="down" color="#dc2626" />

        {/* Bottom: ESB → MOBI chain */}
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2, width: '90%', bgcolor: 'action.hover' }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>SI FACTURATION & SERVICES</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <DiagramNode label="Micro Services" sublabel="vmqpromsbox01/02" ip="VIP: 172.24.119.36" color="#0891b2" icon="solar:widget-bold-duotone" width={170} />

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 20, height: 2, bgcolor: '#dc2626' }} />
              <Typography sx={{ fontSize: '0.7rem', color: '#dc2626' }}>►</Typography>
            </Box>

            <DiagramNode label="ESB DataPower" sublabel="vmqprotopapi01/02" ip="Proxy SOAP" color="#dc2626" icon="solar:routing-bold-duotone" width={170} />

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 20, height: 2, bgcolor: '#dc2626' }} />
              <Typography sx={{ fontSize: '0.7rem', color: '#dc2626' }}>►</Typography>
            </Box>

            <DiagramNode label="FrontEnd SOAP" sublabel="Digimqbillmobi0" color="#b91c1c" icon="solar:server-2-bold-duotone" width={160} />

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 20, height: 2, bgcolor: '#9333ea' }} />
              <Typography sx={{ fontSize: '0.7rem', color: '#9333ea' }}>►</Typography>
            </Box>

            <DiagramNode label="MOBI MCST" sublabel="vmqprombdb01" ip="SI Facturation" color="#9333ea" icon="solar:bill-list-bold-duotone" width={160} />
          </Box>
        </Box>

        {/* Users */}
        <Divider sx={{ width: '60%', my: 1 }} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <DiagramNode label="Points de vente" sublabel="rdp-pdvunipaas" color="#059669" icon="solar:shop-bold-duotone" width={160} small />
          <DiagramNode label="Custom Care" sublabel="rdp-ccarecrm" color="#059669" icon="solar:headphones-round-bold-duotone" width={160} small />
          <DiagramNode label="FNR" sublabel="Fichier National Routage" color="#6b7280" icon="solar:routing-2-bold-duotone" width={160} small />
        </Box>
      </Box>

      {/* Legend */}
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" flexWrap="wrap" gap={2}>
        {[
          { color: '#16a34a', label: 'SFTP (opérateurs)' },
          { color: '#2563eb', label: 'SCP / Sync interne' },
          { color: '#d97706', label: 'Base de données' },
          { color: '#dc2626', label: 'ESB / SOAP' },
          { color: '#9333ea', label: 'SI MOBI' },
          { color: '#0891b2', label: 'Micro services' },
          { color: '#7c3aed', label: 'Portails Web' },
          { color: '#059669', label: 'Utilisateurs finaux' },
        ].map((item) => (
          <Stack key={item.label} direction="row" alignItems="center" spacing={0.75}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
            <Typography variant="caption" color="text.secondary">{item.label}</Typography>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}

// ─── Tab Panels ─────────────────────────────────────────────────────────────

function TabOverview() {
  return (
    <Box>
      {/* Architecture narrative */}
      <SectionTitle icon="solar:map-bold-duotone" title="Architecture globale" subtitle="Vue d'ensemble du système de portabilité PNM V3 Digicel" />

      <Alert severity="info" sx={{ mb: 3 }}>
        Le système PNM V3 gère la <strong>portabilité des numéros mobiles</strong> entre les 6 opérateurs des Antilles-Guyane.
        Les échanges se font par <strong>fichiers plats (PNMDATA/PNMSYNC)</strong> transférés en SFTP via le serveur BTCTF,
        avec 3 vacations par jour ouvré et une synchronisation le dimanche.
      </Alert>

      {/* Architecture diagrams */}
      <ArchitectureDiagramPorta />
      <ArchitectureDiagramProduction />

      {/* Flux step by step */}
      <SectionTitle icon="solar:routing-bold-duotone" title="Flux des échanges" subtitle="Les 6 étapes du cycle de portabilité quotidien" />

      <Stack spacing={2} sx={{ mb: 4 }}>
        {FLUX_STEPS.map((step) => (
          <Card key={step.step} variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Stack direction="row" alignItems="flex-start" spacing={2}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', color: 'primary.contrastText',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0,
                }}>
                  {step.step}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon={step.icon} width={20} />
                    <Typography variant="subtitle2">{step.title}</Typography>
                    <Chip label={step.server} size="small" variant="outlined" sx={{ ml: 'auto' }} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{step.description}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Vacation schedule */}
      <SectionTitle icon="solar:clock-circle-bold-duotone" title="Horaires des vacations" subtitle="Plages d'échange de fichiers inter-opérateurs" />

      <TableContainer component={Card} sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Vacation</TableCell>
              <TableCell>Plage d'échange</TableCell>
              <TableCell>Réception mail</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {VACATION_SCHEDULE.map((v) => (
              <TableRow key={v.name}>
                <TableCell><Typography variant="subtitle2">{v.name}</Typography></TableCell>
                <TableCell><Chip label={v.time} size="small" color="primary" variant="soft" /></TableCell>
                <TableCell><Typography variant="body2" fontFamily="monospace">{v.mailTime}</Typography></TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{v.description}</Typography></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Operators */}
      <SectionTitle icon="solar:users-group-rounded-bold-duotone" title="Opérateurs PNM" subtitle="Les 6 opérateurs participant aux échanges" />
      <Card sx={{ mb: 4 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Opérateur</TableCell>
                <TableCell>Rôle dans le fichier</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { code: '01', name: 'Orange Caraïbe', role: 'Opérateur historique' },
                { code: '02', name: 'Digicel', role: 'Notre opérateur (OPR)' },
                { code: '03', name: 'SFR / Only (Outremer)', role: 'Opérateur tiers' },
                { code: '04', name: 'Dauphin Télécom', role: 'Opérateur tiers' },
                { code: '05', name: 'UTS Caraïbe', role: 'Opérateur tiers' },
                { code: '06', name: 'Free Caraïbe', role: 'Opérateur tiers' },
              ].map((op) => (
                <TableRow key={op.code}>
                  <TableCell><Chip label={op.code} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} /></TableCell>
                  <TableCell><Typography variant="subtitle2">{op.name}</Typography></TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{op.role}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}

function TabDailyChecks() {
  return (
    <Box>
      <SectionTitle
        icon="solar:checklist-minimalistic-bold-duotone"
        title="Vérifications quotidiennes"
        subtitle="Timeline chronologique des vérifications à effectuer chaque jour ouvré"
      />

      <Alert severity="warning" sx={{ mb: 3 }} icon={<Iconify icon="solar:info-circle-bold" width={24} />}>
        Les heures indiquées sont approximatives. Utiliser le <strong>Dashboard Monitoring</strong> pour le suivi en temps réel avec auto-remplissage.
      </Alert>

      <Stack spacing={2}>
        {DAILY_TIMELINE.map((slot) => (
          <Card key={slot.time} variant="outlined">
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                <Chip label={slot.time} color="primary" size="small" sx={{ fontFamily: 'monospace', fontWeight: 700, minWidth: 64 }} />
                <Typography variant="caption" color="text.secondary">
                  {slot.items.length} vérification{slot.items.length > 1 ? 's' : ''}
                </Typography>
              </Stack>

              <Stack spacing={1.5}>
                {slot.items.map((item, i) => {
                  const cat = item.category ? MAIL_CATEGORY_CONFIG[item.category] : null;
                  return (
                    <Box key={i} sx={{ pl: 2, borderLeft: 2, borderColor: item.type === 'server' ? 'primary.main' : (cat ? `${cat.color}.main` : 'divider') }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
                        <Iconify
                          icon={item.type === 'server' ? 'solar:server-bold-duotone' : 'solar:letter-bold-duotone'}
                          width={16}
                          sx={{ color: item.type === 'server' ? 'primary.main' : 'text.secondary', flexShrink: 0 }}
                        />
                        <Typography variant="subtitle2" sx={{ fontSize: '0.8rem' }}>{item.title}</Typography>
                        {cat && <Chip label={cat.label} size="small" color={cat.color} variant="soft" sx={{ height: 20, fontSize: '0.65rem' }} />}
                        {item.server && <Chip label={item.server} size="small" variant="outlined" sx={{ height: 20, fontFamily: 'monospace', fontSize: '0.65rem' }} />}
                      </Stack>

                      {item.commands && (
                        <Box sx={{ position: 'relative', my: 0.5 }}>
                          <Box sx={{ bgcolor: 'grey.900', color: 'grey.100', borderRadius: 1, p: 1, pr: 4, fontFamily: 'monospace', fontSize: '0.7rem' }}>
                            {item.commands.map((cmd, j) => (
                              <Box key={j}>$ {cmd}</Box>
                            ))}
                          </Box>
                          <CopyCommandButton commands={item.commands} />
                        </Box>
                      )}

                      {item.check && (
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                          <Iconify icon="solar:check-circle-bold" width={14} color="success.main" />
                          <Typography variant="caption" color="text.secondary">{item.check}</Typography>
                        </Stack>
                      )}

                      {item.type === 'mail' && (
                        <Typography variant="caption" color="text.secondary">{item.detail}</Typography>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

function TabInfrastructure() {
  return (
    <Box>
      <SectionTitle icon="solar:server-square-bold-duotone" title="Serveurs" subtitle="Infrastructure de la portabilité PNM" />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 4 }}>
        {SERVERS.map((server) => (
          <ServerCard key={server.name} server={server} />
        ))}
      </Box>

      <Divider sx={{ my: 4 }} />

      <SectionTitle icon="solar:code-square-bold-duotone" title="Scripts & Planification" subtitle="Ensemble des scripts automatisés et leur ordonnancement" />

      <TableContainer component={Card}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Serveur</TableCell>
              <TableCell>Script</TableCell>
              <TableCell>Actions</TableCell>
              <TableCell width={200}>Planification</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {SCRIPTS.map((script, i) => (
              <TableRow key={i} hover>
                <TableCell>
                  <Typography variant="caption" fontFamily="monospace" sx={{ bgcolor: 'action.hover', px: 0.75, py: 0.25, borderRadius: 0.5 }}>
                    {script.server}
                  </Typography>
                </TableCell>
                <TableCell><Typography variant="body2" fontWeight={600} fontFamily="monospace">{script.name}</Typography></TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{script.actions}</Typography></TableCell>
                <TableCell><Chip label={script.schedule} size="small" variant="soft" color="info" sx={{ whiteSpace: 'normal', height: 'auto', '& .MuiChip-label': { whiteSpace: 'normal' } }} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function TabLinksContacts() {
  return (
    <Box>
      <SectionTitle icon="solar:link-round-bold-duotone" title="Liens utiles" subtitle="Accès rapide aux outils et portails de la portabilité" />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 4 }}>
        {USEFUL_LINKS.map((link) => (
          <Card key={link.label} variant="outlined" sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Iconify icon={link.icon} width={24} sx={{ color: 'primary.main' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">{link.label}</Typography>
                  <Typography variant="caption" color="text.disabled" fontFamily="monospace">{link.url}</Typography>
                </Box>
                <Iconify icon="solar:arrow-right-bold" width={18} sx={{ color: 'text.disabled' }} />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{link.description}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Divider sx={{ my: 4 }} />

      <SectionTitle icon="solar:phone-calling-bold-duotone" title="Contacts GPMAG & Support" subtitle="Contacts clés pour les escalades et la coordination" />

      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Contact</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rôle / Quand contacter</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {CONTACTS.map((contact) => (
              <TableRow key={contact.name} hover>
                <TableCell><Typography variant="subtitle2">{contact.name}</Typography></TableCell>
                <TableCell><Typography variant="body2" fontFamily="monospace">{contact.email}</Typography></TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{contact.role}</Typography></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 4 }} />

      <SectionTitle icon="solar:letter-bold-duotone" title="Modèles de mails" subtitle="Exemples de mails types pour les communications inter-opérateurs" />

      <Stack spacing={2}>
        {[
          {
            title: 'Relance opérateur donneur (AR non-reçu > 60 min)',
            to: 'portabilite@[operateur].fr',
            subject: '[PNM] Relance AR — MSISDN 06XXXXXXXX',
            body: 'Bonjour,\n\nNous n\'avons pas reçu l\'accusé de réception pour le dossier de portabilité du MSISDN 06XXXXXXXX (ticket XXXX) envoyé le JJ/MM/AAAA à HH:MM.\n\nMerci de bien vouloir vérifier et nous transmettre l\'AR dans les meilleurs délais.\n\nCordialement,\nÉquipe Portabilité Digicel',
          },
          {
            title: 'Escalade GPMAG (conflit ouvert > 7 jours)',
            to: 'secretariat@gpmag.fr',
            subject: '[PNM] Escalade conflit — MSISDN 06XXXXXXXX',
            body: 'Bonjour,\n\nNous souhaitons escalader le conflit suivant qui est ouvert depuis plus de 7 jours :\n\n- MSISDN : 06XXXXXXXX\n- Opérateur donneur : [NOM]\n- Date d\'ouverture : JJ/MM/AAAA\n- Détail : [description du problème]\n\nMerci pour votre intervention.\n\nCordialement,\nÉquipe Portabilité Digicel',
          },
          {
            title: 'Signalement fichier .ERR détecté',
            to: 'support.porta@digicelgroup.fr',
            subject: '[PNM] Fichier .ERR détecté — Vacation X du JJ/MM',
            body: 'Bonjour,\n\nUn fichier .ERR a été détecté lors de la vacation X du JJ/MM/AAAA :\n\n- Fichier : PNMDATA.0X.02.XXXXXXXXXXXXXX.001.ERR\n- Opérateur : [NOM]\n- Contenu de l\'erreur : [détail]\n\nMerci de bien vouloir investiguer.\n\nCordialement,\nÉquipe Portabilité Digicel',
          },
        ].map((template) => (
          <Card key={template.title} variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                <Iconify icon="solar:letter-bold-duotone" width={18} sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                {template.title}
              </Typography>
              <Box sx={{ bgcolor: 'background.neutral', borderRadius: 1, p: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block"><strong>To:</strong> {template.to}</Typography>
                <Typography variant="caption" color="text.secondary" display="block"><strong>Objet:</strong> {template.subject}</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.8rem', m: 0 }}>
                  {template.body}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

const TABS = [
  { value: 'overview', label: 'Vue d\'ensemble', icon: 'solar:map-bold-duotone' },
  { value: 'daily', label: 'Vérifications', icon: 'solar:checklist-minimalistic-bold-duotone' },
  { value: 'infra', label: 'Infrastructure', icon: 'solar:server-square-bold-duotone' },
  { value: 'contacts', label: 'Mails & Contacts', icon: 'solar:letter-bold-duotone' },
];

function CopyCommandButton({ commands }: { commands: string[] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(commands.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [commands]);

  return (
    <Tooltip title={copied ? 'Copié !' : 'Copier'}>
      <IconButton
        size="small"
        onClick={handleCopy}
        sx={{ position: 'absolute', top: 4, right: 4, color: 'grey.400', '&:hover': { color: 'grey.100' } }}
      >
        <Iconify icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold'} width={16} />
      </IconButton>
    </Tooltip>
  );
}

export default function OperationsGuide() {
  const [tab, setTab] = useState('overview');
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const { generateOperationsGuidePdf } = await import('./OperationsGuidePdf');
      await generateOperationsGuidePdf();
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Head title="Guide des Opérations" />

      <Box sx={{ p: { xs: 3, md: 5 } }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4">Guide des Opérations PNM</Typography>
            <Typography sx={{ mt: 1, color: 'text.secondary' }}>
              Documentation complète : architecture, vérifications quotidiennes, infrastructure, contacts
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Iconify icon="solar:file-download-bold-duotone" width={20} />}
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            sx={{ flexShrink: 0 }}
          >
            {pdfLoading ? 'Génération...' : 'Télécharger PDF'}
          </Button>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
        >
          {TABS.map((t) => (
            <Tab
              key={t.value}
              value={t.value}
              label={t.label}
              icon={<Iconify icon={t.icon} width={20} />}
              iconPosition="start"
            />
          ))}
        </Tabs>

        {tab === 'overview' && <TabOverview />}
        {tab === 'daily' && <TabDailyChecks />}
        {tab === 'infra' && <TabInfrastructure />}
        {tab === 'contacts' && <TabLinksContacts />}
      </Box>
    </DashboardLayout>
  );
}
