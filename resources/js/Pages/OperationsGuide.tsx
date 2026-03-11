import { useCallback, useMemo, useState } from 'react';
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

type UsefulLink = {
  label: string;
  url: string;
  description: string;
  icon: string;
};

// ─── Data ───────────────────────────────────────────────────────────────────

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
  { name: 'Synchro dimanche', time: '21h → 21h50', mailTime: '—', description: 'Synchronisation hebdomadaire par opérateur (PNMSYNC)' },
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

// ─── Scripts PortaSync (ex-page ScriptsPnm) ─────────────────────────────────

type PortaSyncScript = {
  name: string;
  description: string;
  server: string;
  disabled?: boolean;
};

const PORTASYNC_SCRIPTS: PortaSyncScript[] = [
  { name: 'EmaExtracter.sh', description: 'Traitement bascule + generation fichier routage + envoi EMA pour MAJ FNR', server: 'vmqproportasync01' },
  { name: 'EmmExtracter.sh', description: 'Generation et envoi fichier MSISDN portes vers l\'EMM', server: 'vmqproportasync01' },
  { name: 'PnmDataManager.sh', description: 'Generation des fichiers de vacation PNMDATA', server: 'vmqproportasync01' },
  { name: 'PnmDataAckManager.sh', description: 'Integration des fichiers PNMDATA + generation acquittements', server: 'vmqproportasync01' },
  { name: 'PnmDataAckGenerator.sh', description: 'Verification acquittements + generation fichiers d\'erreur', server: 'vmqproportasync01' },
  { name: 'PnmSyncManager.sh', description: 'Generation des fichiers de synchronisation PNMSYNC (remplace par scripts unitaires par operateur)', server: 'vmqproportasync01' },
  { name: 'PnmSyncAckManager.sh', description: 'Integration PNMSYNC + generation acquittements', server: 'vmqproportasync01' },
  { name: 'TraitementBascule.sh', description: 'Execute EmaExtracteur.sh, depose le fichier EMA genere sur EMA, puis archive', server: 'vmqproportasync01' },
  { name: 'TraitementValorisation.sh', description: 'Execute EmmExtracteur.sh, depose le fichier EMM genere sur EMM, puis archive', server: 'vmqproportasync01' },
  { name: 'check_envoi_vacation.sh', description: 'Verification des envois de fichiers de vacation', server: 'vmqproportasync01' },
  { name: 'porta_check.sh', description: 'Check global de vacation (verification complete)', server: 'vmqproportasync01' },
  { name: 'synchro-pnmv3.sh', description: 'Copie fichiers recus dans recv/, execute PnmAckManager.sh, envoi et archivage depuis send/', server: 'btctf' },
  { name: 'PnmMerger.sh', description: 'Merge de fichier', server: 'vmqproportasync01', disabled: true },
  { name: 'PnmSpliter.sh', description: 'Split de fichier', server: 'vmqproportasync01', disabled: true },
];

// ─── Crontab (ex-page CrontabScripts) ────────────────────────────────────────

type CronJob = {
  id: number;
  script: string;
  cron: string;
  schedule: string;
  user: string;
  log: string;
  description: string;
  category: 'vacation' | 'bascule' | 'synchro' | 'export' | 'restitution' | 'facturation' | 'ticket' | 'controle' | 'purge';
  days: string;
  server: string;
};

const CRON_CATEGORY_CONFIG: Record<string, { label: string; color: 'primary' | 'success' | 'info' | 'warning' | 'error' | 'secondary' | 'default' }> = {
  vacation: { label: 'Vacation', color: 'success' },
  bascule: { label: 'Bascule', color: 'primary' },
  synchro: { label: 'Synchro', color: 'info' },
  export: { label: 'Export', color: 'info' },
  restitution: { label: 'Restitution', color: 'success' },
  facturation: { label: 'Facturation', color: 'warning' },
  ticket: { label: 'Ticket', color: 'secondary' },
  controle: { label: 'Controle', color: 'error' },
  purge: { label: 'Purge', color: 'default' },
};

const CRON_JOBS: CronJob[] = [
  // ── vmqproportasync01 (porta_pnmv3) ──
  { id: 1, script: 'TraitementBascule.sh', cron: '00 09 * * 1-5', schedule: 'Lun-Ven a 09h00', user: 'porta_pnmv3', log: 'EmaExtracter.log', description: 'Bascule quotidienne (execute EmaExtracteur.sh)', category: 'bascule', days: 'Lun-Ven', server: 'vmqproportasync01' },
  { id: 2, script: 'TraitementValorisation.sh', cron: '01 09 * * 1-5', schedule: 'Lun-Ven a 09h01', user: 'porta_pnmv3', log: 'EmmExtracter.log', description: 'Valorisation (juste apres bascule, execute EmmExtracteur.sh)', category: 'bascule', days: 'Lun-Ven', server: 'vmqproportasync01' },
  { id: 3, script: 'PnmDataManager.sh -v', cron: '00 10,14,19 * * 1-5', schedule: 'Lun-Ven a 10h, 14h, 19h', user: 'porta_pnmv3', log: 'PnmDataManager.log', description: 'Generation des fichiers de vacation PNMDATA pour les 5 operateurs', category: 'vacation', days: 'Lun-Ven', server: 'vmqproportasync01' },
  { id: 4, script: 'check_envoi_vacation.sh -v', cron: '35 10,14,19 * * 1-5', schedule: 'Lun-Ven a 10h35, 14h35, 19h35', user: 'porta_pnmv3', log: 'check_envoi_vacation.log', description: 'Verification des envois de fichiers de vacation', category: 'vacation', days: 'Lun-Ven', server: 'vmqproportasync01' },
  { id: 5, script: 'PnmDataAckGenerator.sh -v', cron: '15 11,15,20 * * 1-5', schedule: 'Lun-Ven a 11h15, 15h15, 20h15', user: 'porta_pnmv3', log: 'PnmDataAckGenerator.log', description: 'Verification ACR/ERR pour chaque vacation', category: 'vacation', days: 'Lun-Ven', server: 'vmqproportasync01' },
  { id: 6, script: 'porta_check.sh', cron: '35 11,15,20 * * 1-5', schedule: 'Lun-Ven a 11h35, 15h35, 20h35', user: 'porta_pnmv3', log: '—', description: 'Check global de vacation', category: 'vacation', days: 'Lun-Ven', server: 'vmqproportasync01' },
  { id: 7, script: 'PnmSyncManager_oc.sh -v', cron: '00 21 * * 0', schedule: 'Dimanche a 21h00', user: 'porta_pnmv3', log: 'PnmSyncManager.log', description: 'Synchronisation Orange Caraibe', category: 'synchro', days: 'Dim', server: 'vmqproportasync01' },
  { id: 8, script: 'PnmSyncManager_sfrc.sh -v', cron: '20 21 * * 0', schedule: 'Dimanche a 21h20', user: 'porta_pnmv3', log: 'PnmSyncManager.log', description: 'Synchronisation SFR Caraibe', category: 'synchro', days: 'Dim', server: 'vmqproportasync01' },
  { id: 9, script: 'PnmSyncManager_dt.sh -v', cron: '30 21 * * 0', schedule: 'Dimanche a 21h30', user: 'porta_pnmv3', log: 'PnmSyncManager.log', description: 'Synchronisation Dauphin Telecom', category: 'synchro', days: 'Dim', server: 'vmqproportasync01' },
  { id: 10, script: 'PnmSyncManager_uts.sh -v', cron: '40 21 * * 0', schedule: 'Dimanche a 21h40', user: 'porta_pnmv3', log: 'PnmSyncManager.log', description: 'Synchronisation UTS Caraibe', category: 'synchro', days: 'Dim', server: 'vmqproportasync01' },
  { id: 11, script: 'PnmSyncManager_freec.sh -v', cron: '50 21 * * 0', schedule: 'Dimanche a 21h50', user: 'porta_pnmv3', log: 'PnmSyncManager.log', description: 'Synchronisation Free Caraibes', category: 'synchro', days: 'Dim', server: 'vmqproportasync01' },
  { id: 12, script: 'find ... -mtime +30 -exec rm', cron: '00 03 * * 2', schedule: 'Mardi a 03h00', user: 'porta_pnmv3', log: '—', description: 'Purge extracts > 30 jours', category: 'purge', days: 'Mar', server: 'vmqproportasync01' },
  // ── vmqproportawebdb01 ──
  { id: 13, script: 'PortaDB-export-csv.sh', cron: '00 00 * * 1-7', schedule: 'Tous les jours a 00h00', user: 'porta_pnmv3', log: 'PortaDB-export-csv.log', description: 'Export des tables de PortaDB au format CSV sur le serveur EMM pour alimentation du systeme MIS.', category: 'export', days: 'Lun-Dim', server: 'vmqproportawebdb01' },
  { id: 14, script: 'Pnm-Verif-Bascule-MOBI.sh', cron: '55 09 * * 1', schedule: 'Lundi a 09h55', user: 'root', log: 'Pnm-Verif-Bascule-MOBI.sh.log', description: 'Verification des bascules du week-end.', category: 'bascule', days: 'Lun', server: 'vmqproportawebdb01' },
  { id: 15, script: 'Pnm-Verif-Bascule-MOBI.sh', cron: '15 09 * * 2-5', schedule: 'Mar-Ven a 09h15', user: 'root', log: 'Pnm-Verif-Bascule-MOBI.sh.log', description: 'Premiere verification quotidienne des bascules du matin.', category: 'bascule', days: 'Mar-Ven', server: 'vmqproportawebdb01' },
  { id: 16, script: 'Pnm-Verif-Bascule-MOBI.sh', cron: '54 10 * * 2-5', schedule: 'Mar-Ven a 10h54', user: 'root', log: 'Pnm-Verif-Bascule-MOBI.sh.log', description: 'Seconde verification quotidienne. Detecte les bascules traitees apres la premiere.', category: 'bascule', days: 'Mar-Ven', server: 'vmqproportawebdb01' },
  { id: 17, script: 'Pnm-Restitutions-Sortantes-Bascule.sh', cron: '30 12 * * 1-5', schedule: 'Lun-Ven a 12h30', user: 'porta_pnmv3', log: 'Pnm-Restitutions-Sortantes-Bascule.sh.log', description: 'Bascule des restitutions sortantes (Saisi vers Dossier de restitution initie).', category: 'restitution', days: 'Lun-Ven', server: 'vmqproportawebdb01' },
  { id: 18, script: 'Pnm-Restitutions-Entrantes-Bascule.sh', cron: '25 21 * * 1-5', schedule: 'Lun-Ven a 21h25', user: 'porta_pnmv3', log: 'Pnm-Restitutions-Entrantes-Bascule.sh.log', description: 'Bascule des restitutions entrantes. Execution en soiree pour integration nocturne.', category: 'restitution', days: 'Lun-Ven', server: 'vmqproportawebdb01' },
  { id: 19, script: 'Pnm-Restitutions-Sortantes-Tickets.sh', cron: '15 11 * * 1-5', schedule: 'Lun-Ven a 11h15', user: 'porta_pnmv3', log: 'Pnm-Restitutions-Sortantes-Tickets.sh.log', description: 'Generation des tickets de restitution sortante pour les dossiers en cours.', category: 'ticket', days: 'Lun-Ven', server: 'vmqproportawebdb01' },
  { id: 20, script: 'Pnm_Facturation_Mensuelle_PEN.sh', cron: '05 00 1 * *', schedule: '1er de chaque mois a 00h05', user: 'porta_pnmv3', log: '—', description: 'Facturation mensuelle pour les portages entrants (PEN) inter-operateurs.', category: 'facturation', days: '1er du mois', server: 'vmqproportawebdb01' },
  { id: 21, script: 'Pnm_Facturation_Mensuelle_PSO.sh', cron: '10 00 1 * *', schedule: '1er de chaque mois a 00h10', user: 'porta_pnmv3', log: '—', description: 'Facturation mensuelle pour les portages sortants (PSO) inter-operateurs.', category: 'facturation', days: '1er du mois', server: 'vmqproportawebdb01' },
  { id: 22, script: 'Pnm_1210_awaiting.sh', cron: '30 11 * * 2-5', schedule: 'Mar-Ven a 11h30', user: 'porta_pnmv3', log: 'Pnm_1210_awaiting.log', description: 'Verification des tickets 1210 recus pour les portages prevus a J+1.', category: 'controle', days: 'Mar-Ven', server: 'vmqproportawebdb01' },
  { id: 23, script: 'Pnm_tickets_awaiting.sh', cron: '30 11 * * 1', schedule: 'Lundi a 11h30', user: 'porta_pnmv3', log: 'Pnm_tickets_awaiting.log', description: 'Verification elargie du lundi : tickets 1210/1430/3430 + rattrapage week-end.', category: 'controle', days: 'Lun', server: 'vmqproportawebdb01' },
  { id: 24, script: 'Pnm_1110_DC_vers_UTS.sh', cron: '30 11,15,20 * * 1-5', schedule: 'Lun-Ven a 11h30, 15h30, 20h30', user: 'porta_pnmv3', log: 'Pnm_1110_DC_vers_UTS.log', description: 'Verification tickets 1110 transmis a UTS. Detecte les cas necessitant un 1210 en mode degrade.', category: 'controle', days: 'Lun-Ven', server: 'vmqproportawebdb01' },
  { id: 25, script: 'refus_porta_free_b2b.sh', cron: '30 09,11,15,20 * * 1-5', schedule: 'Lun-Ven a 09h30, 11h30, 15h30, 20h30', user: 'porta_pnmv3', log: 'refus_porta_free_b2b.log', description: 'Gestion des portabilites B2B vers Free Caraibe. 4 executions quotidiennes.', category: 'controle', days: 'Lun-Ven', server: 'vmqproportawebdb01' },
  { id: 26, script: 'check_refus_porta_rio_incorrect.sh', cron: '00 09 * * 1-5', schedule: 'Lun-Ven a 09h00', user: 'porta_pnmv3', log: 'check_refus_porta_rio_incorrect.log', description: 'Rapport sur les refus de portabilite avec motif RIO incorrect.', category: 'controle', days: 'Lun-Ven', server: 'vmqproportawebdb01' },
  { id: 27, script: 'Pnm_Facturation_Annuelle_PEN.sh', cron: '@yearly', schedule: '1er janvier de chaque annee', user: 'porta_pnmv3', log: '—', description: 'Facturation annuelle pour les portages entrants (PEN).', category: 'facturation', days: '1er janvier', server: 'vmqproportawebdb01' },
];

type DisabledCronJob = {
  script: string;
  oldSchedule: string;
  description: string;
  reason: string;
  server: string;
};

const DISABLED_CRON_JOBS: DisabledCronJob[] = [
  { script: 'PnmSyncManager.sh', oldSchedule: 'Dimanche 21h', description: 'Synchro globale tous operateurs', reason: 'Remplace par scripts unitaires par operateur (_oc, _sfrc, _dt, _uts, _freec)', server: 'vmqproportasync01' },
  { script: 'PortaDB-export-csv.sh', oldSchedule: '12h00, tous les jours', description: 'Second export CSV quotidien', reason: 'Doublon — un seul export a minuit suffit', server: 'vmqproportawebdb01' },
  { script: 'Pnm-Verif-Bascule-MOBI_CCA.sh', oldSchedule: '10h30, lun-ven', description: 'Verification bascule — envoi CCARE', reason: 'Fonctionnalite transferee ou obsolete', server: 'vmqproportawebdb01' },
  { script: 'Pnm-Restitutions-Sortantes-Tickets-ratp.sh', oldSchedule: '12h00, lun-ven', description: 'Tickets restitutions sortantes RATP en masse', reason: 'Traitement ponctuel (RT#254708) termine', server: 'vmqproportawebdb01' },
  { script: 'Pnm_Stats_Bascule_ESB.sh', oldSchedule: '09h55, lun-ven', description: 'Rapports statistiques ESB du jour', reason: 'Reporting ESB desactive', server: 'vmqproportawebdb01' },
];

// ─── Tab Scripts & Crontab ──────────────────────────────────────────────────

function TabScriptsCrontab() {
  const [cronTab, setCronTab] = useState(0);
  const [serverFilter, setServerFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filteredJobs = useMemo(() => {
    let jobs = CRON_JOBS;
    if (serverFilter) jobs = jobs.filter((j) => j.server === serverFilter);
    if (categoryFilter) jobs = jobs.filter((j) => j.category === categoryFilter);
    return jobs;
  }, [serverFilter, categoryFilter]);

  return (
    <Box>
      {/* ── Section 1: Scripts PortaSync ── */}
      <SectionTitle icon="solar:code-square-bold-duotone" title="Scripts PortaSync" subtitle="Scripts de synchronisation et traitement des fichiers PNM" />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="solar:server-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">vmqproportasync01</Typography>
                <Typography variant="caption" display="block" fontFamily="monospace" color="text.disabled">/home/porta_pnmv3/PortaSync/</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="solar:folder-bold-duotone" width={20} sx={{ color: 'warning.main' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Logs</Typography>
                <Typography variant="caption" display="block" fontFamily="monospace" color="text.disabled">/home/porta_pnmv3/PortaSync/log/</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <TableContainer component={Card} sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Script</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Serveur</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {PORTASYNC_SCRIPTS.map((script) => (
              <TableRow key={script.name} hover sx={{ opacity: script.disabled ? 0.5 : 1 }}>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" fontWeight={600} fontFamily="monospace">{script.name}</Typography>
                    {script.disabled && <Chip label="non utilise" size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" fontFamily="monospace" sx={{ bgcolor: 'action.hover', px: 0.75, py: 0.25, borderRadius: 0.5 }}>
                    {script.server}
                  </Typography>
                </TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{script.description}</Typography></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 4 }} />

      {/* ── Section 2: Tâches Crontab ── */}
      <SectionTitle icon="solar:clock-circle-bold-duotone" title="Taches Crontab" subtitle="Taches planifiees sur vmqproportasync01 et vmqproportawebdb01" />

      <Tabs value={cronTab} onChange={(_, v) => setCronTab(v)} sx={{ mb: 2 }}>
        <Tab label="Taches actives" icon={<Iconify icon="solar:play-circle-bold-duotone" width={18} />} iconPosition="start" sx={{ minHeight: 42 }} />
        <Tab label="Taches desactivees" icon={<Iconify icon="solar:close-circle-bold-duotone" width={18} />} iconPosition="start" sx={{ minHeight: 42 }} />
      </Tabs>

      {cronTab === 0 && (
        <Box>
          {/* Filters */}
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Chip label="Tous serveurs" size="small" variant={serverFilter === null ? 'filled' : 'outlined'} onClick={() => setServerFilter(null)} />
            <Chip label="vmqproportasync01" size="small" variant={serverFilter === 'vmqproportasync01' ? 'filled' : 'outlined'} color="primary" onClick={() => setServerFilter(serverFilter === 'vmqproportasync01' ? null : 'vmqproportasync01')} />
            <Chip label="vmqproportawebdb01" size="small" variant={serverFilter === 'vmqproportawebdb01' ? 'filled' : 'outlined'} color="warning" onClick={() => setServerFilter(serverFilter === 'vmqproportawebdb01' ? null : 'vmqproportawebdb01')} />
            <Divider orientation="vertical" flexItem />
            {Object.entries(CRON_CATEGORY_CONFIG).map(([key, cfg]) => (
              <Chip key={key} label={cfg.label} size="small" variant={categoryFilter === key ? 'filled' : 'outlined'} color={cfg.color} onClick={() => setCategoryFilter(categoryFilter === key ? null : key)} />
            ))}
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            {filteredJobs.length} tache{filteredJobs.length > 1 ? 's' : ''} affichee{filteredJobs.length > 1 ? 's' : ''}
          </Typography>

          <TableContainer component={Card}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Script</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Serveur</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Planification</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cat.</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredJobs.map((job) => {
                  const cat = CRON_CATEGORY_CONFIG[job.category];
                  return (
                    <TableRow key={job.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} fontFamily="monospace" sx={{ fontSize: 12 }}>{job.script}</Typography>
                        {job.user === 'root' && <Chip label="root" size="small" color="error" variant="outlined" sx={{ height: 18, fontSize: 10, mt: 0.5 }} />}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" fontFamily="monospace" sx={{ bgcolor: job.server === 'vmqproportasync01' ? 'primary.lighter' : 'warning.lighter', px: 0.75, py: 0.25, borderRadius: 0.5, fontSize: 10 }}>
                          {job.server}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{job.schedule}</Typography>
                        <Typography variant="caption" display="block" fontFamily="monospace" color="text.disabled" sx={{ fontSize: 10 }}>{job.cron}</Typography>
                      </TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>{job.description}</Typography></TableCell>
                      <TableCell><Chip label={cat?.label} size="small" color={cat?.color} variant="soft" sx={{ height: 22, fontSize: 10 }} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {cronTab === 1 && (
        <Box>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Ces taches sont commentees dans le crontab et ne sont plus executees.
          </Alert>
          <TableContainer component={Card}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Script</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Serveur</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ancienne planification</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Raison</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DISABLED_CRON_JOBS.map((job) => (
                  <TableRow key={job.script} hover>
                    <TableCell><Typography variant="body2" fontFamily="monospace" sx={{ fontSize: 12 }}>{job.script}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="caption" fontFamily="monospace" sx={{ bgcolor: 'action.hover', px: 0.75, py: 0.25, borderRadius: 0.5, fontSize: 10 }}>
                        {job.server}
                      </Typography>
                    </TableCell>
                    <TableCell>{job.oldSchedule}</TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: 12 }}>{job.reason}</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Notes */}
      <Box sx={{ mt: 4 }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Notes operationnelles</Typography>
        <Stack spacing={1}>
          {[
            'L\'ancien PnmSyncManager.sh global est commente dans le crontab, remplace par les scripts unitaires par operateur (_oc, _sfrc, _dt, _uts, _freec)',
            'porta_pnmv3 n\'a pas acces aux logs systeme (/var/log/messages, /var/log/secure) — besoin de root',
            'Les scripts de verification de bascule tournent sous root sur vmqproportawebdb01',
            'Synchro dimanche : scripts echelonnes toutes les 10 min de 21h00 a 21h50',
            'Identifiants sur le Secret Server : https://vmqpropass01',
          ].map((note, i) => (
            <Stack key={i} direction="row" alignItems="flex-start" spacing={1}>
              <Iconify icon="solar:info-circle-bold-duotone" width={16} sx={{ color: 'info.main', mt: 0.25, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12 }}>{note}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

const TABS = [
  { value: 'overview', label: 'Vue d\'ensemble', icon: 'solar:map-bold-duotone' },
  { value: 'daily', label: 'Verifications', icon: 'solar:checklist-minimalistic-bold-duotone' },
  { value: 'scripts', label: 'Scripts & Crontab', icon: 'solar:code-square-bold-duotone' },
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
  const [archPdfLoading, setArchPdfLoading] = useState(false);

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const { generateOperationsGuidePdf } = await import('./OperationsGuidePdf');
      await generateOperationsGuidePdf();
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadArchPdf = async () => {
    setArchPdfLoading(true);
    try {
      const { generateArchitectureServersPdf } = await import('./ArchitectureServersPdf');
      await generateArchitectureServersPdf();
    } finally {
      setArchPdfLoading(false);
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
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Iconify icon="solar:file-download-bold-duotone" width={20} />}
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
            >
              {pdfLoading ? 'Génération...' : 'Guide PDF'}
            </Button>
            <Button
              variant="outlined"
              color="info"
              startIcon={<Iconify icon="solar:server-square-bold-duotone" width={20} />}
              onClick={handleDownloadArchPdf}
              disabled={archPdfLoading}
            >
              {archPdfLoading ? 'Génération...' : 'Architecture PDF'}
            </Button>
          </Stack>
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
        {tab === 'scripts' && <TabScriptsCrontab />}
        {tab === 'contacts' && <TabLinksContacts />}
      </Box>
    </DashboardLayout>
  );
}
