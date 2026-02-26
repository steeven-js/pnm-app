import { useState } from 'react';
import { Head } from '@inertiajs/react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
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

type DailyMail = {
  time: string;
  subject: string;
  from: string;
  action: string;
  category: 'vacation' | 'supervision' | 'incident' | 'reporting';
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

const DAILY_MAILS: DailyMail[] = [
  { time: '~04:00', subject: '[CTO] Bascule du jour tardive ou en echec', from: 'APP_VENTES', action: 'Vérifier si des MSISDN nécessitent un rattrapage manuel. Fichiers Rattrapage_CTO_MQ/GF/GP.', category: 'supervision' },
  { time: '~09:00', subject: '[PNM] Reporting RIO incorrect', from: 'porta_pnmv3', action: 'Vérifier le nombre de refus entrante/sortante pour RIO incorrect. Si > 0, investiguer.', category: 'reporting' },
  { time: '~09:01', subject: '[PNM][INCIDENT] Incidents détectés', from: 'porta_pnmv3', action: 'Analyser chaque incident : refus 1210/1220, erreurs 7000, AR non-reçus, conflits.', category: 'incident' },
  { time: '~10:16', subject: '[PNMV3] PSO du jour Forfait', from: 'porta_pnmv3', action: 'Ouvrir le CSV Pnm_PSO_MOBI, vérifier la volumétrie vs prévisions veille.', category: 'reporting' },
  { time: '~11:30', subject: '[PNM] Ticket(s) 1210 en attente', from: 'porta_pnmv3', action: 'Trier par ancienneté. < 3j surveiller, 3-5j relancer, > 5j escalader.', category: 'incident' },
  { time: '~11:30', subject: '[PNM] Ticket(s) en attente', from: 'porta_pnmv3', action: 'Traiter les tickets les plus anciens en priorité (XLS joint).', category: 'incident' },
  { time: '~11:35', subject: '[PNM] Rapport vacation 1', from: 'porta_pnmv3', action: 'Vérifier fichiers échangés = attendus, ACR OK pour les 5 opérateurs, aucun .ERR.', category: 'vacation' },
  { time: '~15:25', subject: '[PROD] Rapport activité automates', from: 'supervision@digicelgroup.fr', action: 'Vérifier SUCCESS pour BASCULE_IN, EXPLOIT, RATP_OLN, TRACE, WATCHER.', category: 'supervision' },
  { time: '~15:31', subject: '[PNM] Portabilités prévues DIGICEL-WIZZEE', from: 'porta_pnmv3', action: 'Vérifier IN/OUT DIGICEL + WIZZEE, portabilités internes veille.', category: 'reporting' },
  { time: '~15:35', subject: '[PNM] Rapport vacation 2', from: 'porta_pnmv3', action: 'Comparer avec vacation 1 : fichiers manquants réapparus ? ACR OK.', category: 'vacation' },
  { time: '~20:35', subject: '[PNM] Rapport vacation 3 + clôture', from: 'porta_pnmv3', action: 'Dernier rapport du jour. Vérifier, clôturer la journée PNM.', category: 'vacation' },
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
        subtitle="Checklist chronologique des vérifications à effectuer chaque jour ouvré"
      />

      <Alert severity="warning" sx={{ mb: 3 }} icon={<Iconify icon="solar:info-circle-bold" width={24} />}>
        Les heures indiquées sont approximatives. Utiliser le <strong>Dashboard Monitoring</strong> pour le suivi en temps réel avec auto-remplissage.
      </Alert>

      {/* Server checks */}
      <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
        <Iconify icon="solar:server-bold-duotone" width={22} sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
        Vérifications serveur (SSH)
      </Typography>

      <Stack spacing={2} sx={{ mb: 4 }}>
        {[
          {
            time: '09:00',
            title: 'Bascule & Valorisation',
            server: 'vmqproportasync01',
            commands: [
              'tail -n 12 /home/porta_pnmv3/PortaSync/log/EmaExtracter.log',
              'tail -n 12 /home/porta_pnmv3/PortaSync/log/EmmExtracter.log',
            ],
            check: 'Tous les opérateurs "Check success" + "Fin de Traitement"',
          },
          {
            time: '10:15',
            title: 'Génération fichiers vacation',
            server: 'vmqproportasync01',
            commands: ['tail -n 14 /home/porta_pnmv3/PortaSync/log/PnmDataManager.log'],
            check: 'Fichier PNMDATA généré pour op. 01, 03, 04, 05, 06 + "Fin de Traitement"',
          },
          {
            time: '11:15',
            title: 'Acquittements fichiers',
            server: 'vmqproportasync01',
            commands: ['tail -f /home/porta_pnmv3/PortaSync/log/PnmAckManager.log'],
            check: '"Aucune notification d\'AR SYNC non-reçu" pour chaque opérateur',
          },
        ].map((check) => (
          <Card key={check.title} variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Chip label={check.time} size="small" color="primary" />
                <Typography variant="subtitle2">{check.title}</Typography>
                <Chip label={check.server} size="small" variant="outlined" sx={{ ml: 'auto', fontFamily: 'monospace', fontSize: '0.7rem' }} />
              </Stack>
              <Box sx={{ bgcolor: 'grey.900', color: 'grey.100', borderRadius: 1, p: 1.5, mb: 1.5, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {check.commands.map((cmd, i) => (
                  <Box key={i}>$ {cmd}</Box>
                ))}
              </Box>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="solar:check-circle-bold" width={16} color="success.main" />
                <Typography variant="body2" color="text.secondary">{check.check}</Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Mail checks */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        <Iconify icon="solar:letter-bold-duotone" width={22} sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
        Mails à vérifier (chronologique)
      </Typography>

      <TableContainer component={Card}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={80}>Heure</TableCell>
              <TableCell width={100}>Type</TableCell>
              <TableCell>Objet du mail</TableCell>
              <TableCell>Expéditeur</TableCell>
              <TableCell>Action requise</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {DAILY_MAILS.map((mail, i) => {
              const cat = MAIL_CATEGORY_CONFIG[mail.category];
              return (
                <TableRow key={i} hover>
                  <TableCell><Typography variant="body2" fontFamily="monospace" fontWeight={600}>{mail.time}</Typography></TableCell>
                  <TableCell><Chip label={cat.label} size="small" color={cat.color} variant="soft" /></TableCell>
                  <TableCell><Typography variant="body2" fontWeight={500}>{mail.subject}</Typography></TableCell>
                  <TableCell><Typography variant="caption" color="text.secondary">{mail.from}</Typography></TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{mail.action}</Typography></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
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

export default function OperationsGuide() {
  const [tab, setTab] = useState('overview');

  return (
    <DashboardLayout>
      <Head title="Guide des Opérations" />

      <Box sx={{ p: { xs: 3, md: 5 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4">Guide des Opérations PNM</Typography>
          <Typography sx={{ mt: 1, color: 'text.secondary' }}>
            Documentation complète : architecture, vérifications quotidiennes, infrastructure, contacts
          </Typography>
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
