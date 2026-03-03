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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { DashboardLayout } from 'src/layouts/dashboard/layout';

// ─── Types ──────────────────────────────────────────────────────────────────

type CronJob = {
  id: number;
  script: string;
  cron: string;
  schedule: string;
  user: string;
  log: string;
  description: string;
  category: 'export' | 'bascule' | 'restitution' | 'facturation' | 'ticket' | 'controle';
  days: string;
};

type DisabledJob = {
  script: string;
  oldSchedule: string;
  description: string;
  reason: string;
};

type TimelineEntry = {
  time: string;
  scripts: { name: string; detail: string; days: string }[];
};

// ─── Data ───────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { label: string; color: 'primary' | 'success' | 'info' | 'warning' | 'error' | 'secondary' }> = {
  export: { label: 'Export', color: 'info' },
  bascule: { label: 'Bascule', color: 'primary' },
  restitution: { label: 'Restitution', color: 'success' },
  facturation: { label: 'Facturation', color: 'warning' },
  ticket: { label: 'Ticket', color: 'secondary' },
  controle: { label: 'Contrôle', color: 'error' },
};

const CRON_JOBS: CronJob[] = [
  {
    id: 1,
    script: 'PortaDB-export-csv.sh',
    cron: '00 00 * * 1-7',
    schedule: 'Tous les jours à 00h00',
    user: 'porta_pnmv3',
    log: 'PortaDB-export-csv.log',
    description: 'Export des tables de PortaDB au format CSV sur le serveur EMM pour alimentation du système MIS.',
    category: 'export',
    days: 'Lun-Dim',
  },
  {
    id: 2,
    script: 'Pnm-Verif-Bascule-MOBI.sh',
    cron: '55 09 * * 1',
    schedule: 'Lundi à 09h55',
    user: 'root',
    log: 'Pnm-Verif-Bascule-MOBI.sh.log',
    description: 'Vérification des bascules du week-end. Horaire décalé pour laisser le temps au traitement des bascules accumulées.',
    category: 'bascule',
    days: 'Lun',
  },
  {
    id: 3,
    script: 'Pnm-Verif-Bascule-MOBI.sh',
    cron: '15 09 * * 2-5',
    schedule: 'Mardi à vendredi à 09h15',
    user: 'root',
    log: 'Pnm-Verif-Bascule-MOBI.sh.log',
    description: 'Première vérification quotidienne des bascules du matin.',
    category: 'bascule',
    days: 'Mar-Ven',
  },
  {
    id: 4,
    script: 'Pnm-Verif-Bascule-MOBI.sh',
    cron: '54 10 * * 2-5',
    schedule: 'Mardi à vendredi à 10h54',
    user: 'root',
    log: 'Pnm-Verif-Bascule-MOBI.sh.log',
    description: 'Seconde vérification quotidienne. Détecte les bascules traitées après la première vérification.',
    category: 'bascule',
    days: 'Mar-Ven',
  },
  {
    id: 5,
    script: 'Pnm-Restitutions-Sortantes-Bascule.sh',
    cron: '30 12 * * 1-5',
    schedule: 'Lundi à vendredi à 12h30',
    user: 'porta_pnmv3',
    log: 'Pnm-Restitutions-Sortantes-Bascule.sh.log',
    description: 'Bascule des restitutions sortantes (statut Saisi vers Dossier de restitution initié). Concerne les numéros que Digicel restitue à un autre opérateur.',
    category: 'restitution',
    days: 'Lun-Ven',
  },
  {
    id: 6,
    script: 'Pnm-Restitutions-Entrantes-Bascule.sh',
    cron: '25 21 * * 1-5',
    schedule: 'Lundi à vendredi à 21h25',
    user: 'porta_pnmv3',
    log: 'Pnm-Restitutions-Entrantes-Bascule.sh.log',
    description: 'Bascule des restitutions entrantes. Concerne les numéros restitués à Digicel par un autre opérateur. Exécution en soirée pour intégration nocturne.',
    category: 'restitution',
    days: 'Lun-Ven',
  },
  {
    id: 7,
    script: 'Pnm-Restitutions-Sortantes-Tickets.sh',
    cron: '15 11 * * 1-5',
    schedule: 'Lundi à vendredi à 11h15',
    user: 'porta_pnmv3',
    log: 'Pnm-Restitutions-Sortantes-Tickets.sh.log',
    description: 'Génération des tickets de restitution sortante pour les dossiers en cours.',
    category: 'ticket',
    days: 'Lun-Ven',
  },
  {
    id: 8,
    script: 'Pnm_Facturation_Mensuelle_PEN.sh',
    cron: '05 00 1 * *',
    schedule: '1er de chaque mois à 00h05',
    user: 'porta_pnmv3',
    log: '—',
    description: 'Génération des fichiers de facturation mensuelle pour les portages entrants (PEN) inter-opérateurs. Exécution obligatoire le 1er de chaque mois.',
    category: 'facturation',
    days: '1er du mois',
  },
  {
    id: 9,
    script: 'Pnm_Facturation_Mensuelle_PSO.sh',
    cron: '10 00 1 * *',
    schedule: '1er de chaque mois à 00h10',
    user: 'porta_pnmv3',
    log: '—',
    description: 'Génération des fichiers de facturation mensuelle pour les portages sortants (PSO) inter-opérateurs. Exécution obligatoire le 1er de chaque mois.',
    category: 'facturation',
    days: '1er du mois',
  },
  {
    id: 10,
    script: 'Pnm_1210_awaiting.sh',
    cron: '30 11 * * 2-5',
    schedule: 'Mardi à vendredi à 11h30',
    user: 'porta_pnmv3',
    log: 'Pnm_1210_awaiting.log',
    description: 'Vérification des tickets 1210 reçus pour les portages prévus à J+1. Le ticket 1210 correspond à l\'accusé de réception de la demande de portage.',
    category: 'controle',
    days: 'Mar-Ven',
  },
  {
    id: 11,
    script: 'Pnm_tickets_awaiting.sh',
    cron: '30 11 * * 1',
    schedule: 'Lundi à 11h30',
    user: 'porta_pnmv3',
    log: 'Pnm_tickets_awaiting.log',
    description: 'Vérification élargie du lundi : tickets 1210 pour portages à J+1 et tickets 1430/3430 reçus à S-1 (semaine précédente). Couvre le rattrapage du week-end.',
    category: 'controle',
    days: 'Lun',
  },
  {
    id: 12,
    script: 'Pnm_1110_DC_vers_UTS.sh',
    cron: '30 11,15,20 * * 1-5',
    schedule: 'Lundi à vendredi à 11h30, 15h30, 20h30',
    user: 'porta_pnmv3',
    log: 'Pnm_1110_DC_vers_UTS.log',
    description: 'Vérification des tickets 1110 transmis à UTS. Détecte les cas nécessitant la création d\'un ticket 1210 en mode dégradé (procédure de secours).',
    category: 'controle',
    days: 'Lun-Ven',
  },
  {
    id: 13,
    script: 'refus_porta_free_b2b.sh',
    cron: '30 09,11,15,20 * * 1-5',
    schedule: 'Lundi à vendredi à 09h30, 11h30, 15h30, 20h30',
    user: 'porta_pnmv3',
    log: 'refus_porta_free_b2b.log',
    description: 'Gestion des portabilités B2B (Business to Business) vers Free Caraïbe. Quatre exécutions quotidiennes pour un traitement en temps quasi-réel.',
    category: 'controle',
    days: 'Lun-Ven',
  },
  {
    id: 14,
    script: 'check_refus_porta_rio_incorrect.sh',
    cron: '00 09 * * 1-5',
    schedule: 'Lundi à vendredi à 09h00',
    user: 'porta_pnmv3',
    log: 'check_refus_porta_rio_incorrect.log',
    description: 'Rapport sur les cas de refus de portabilité avec motif « RIO incorrect ». Détecte les problèmes de saisie ou de synchronisation des RIO.',
    category: 'controle',
    days: 'Lun-Ven',
  },
  {
    id: 15,
    script: 'Pnm_Facturation_Annuelle_PEN.sh',
    cron: '@yearly',
    schedule: '1er janvier de chaque année',
    user: 'porta_pnmv3',
    log: '—',
    description: 'Génération du mail de facturation annuelle pour les portages entrants (PEN) inter-opérateurs.',
    category: 'facturation',
    days: '1er janvier',
  },
];

const DISABLED_JOBS: DisabledJob[] = [
  {
    script: 'PortaDB-export-csv.sh',
    oldSchedule: '12h00, tous les jours',
    description: 'Second export CSV quotidien',
    reason: 'Doublon — un seul export à minuit suffit',
  },
  {
    script: 'Pnm-Verif-Bascule-MOBI_CCA.sh',
    oldSchedule: '10h30, lun-ven',
    description: 'Vérification bascule — envoi CCARE',
    reason: 'Fonctionnalité transférée ou obsolète',
  },
  {
    script: 'Pnm-Restitutions-Sortantes-Tickets-ratp.sh',
    oldSchedule: '12h00, lun-ven',
    description: 'Tickets restitutions sortantes RATP en masse',
    reason: 'Traitement ponctuel (RT#254708) terminé',
  },
  {
    script: 'Pnm_Stats_Bascule_ESB.sh',
    oldSchedule: '09h55, lun-ven',
    description: 'Rapports statistiques ESB du jour',
    reason: 'Reporting ESB désactivé',
  },
];

const TIMELINE: TimelineEntry[] = [
  {
    time: '00:00',
    scripts: [
      { name: 'PortaDB-export-csv.sh', detail: 'Export CSV PortaDB vers EMM/MIS', days: 'Tous les jours' },
    ],
  },
  {
    time: '00:05',
    scripts: [
      { name: 'Pnm_Facturation_Mensuelle_PEN.sh', detail: 'Facturation mensuelle PEN', days: '1er du mois' },
      { name: 'Pnm_Facturation_Mensuelle_PSO.sh', detail: 'Facturation mensuelle PSO', days: '1er du mois' },
    ],
  },
  {
    time: '09:00',
    scripts: [
      { name: 'check_refus_porta_rio_incorrect.sh', detail: 'Reporting refus RIO incorrect', days: 'Lun-Ven' },
    ],
  },
  {
    time: '09:15',
    scripts: [
      { name: 'Pnm-Verif-Bascule-MOBI.sh', detail: '1ère vérification bascule', days: 'Mar-Ven' },
    ],
  },
  {
    time: '09:30',
    scripts: [
      { name: 'refus_porta_free_b2b.sh', detail: 'Portabilités B2B Free Caraïbe', days: 'Lun-Ven' },
    ],
  },
  {
    time: '09:55',
    scripts: [
      { name: 'Pnm-Verif-Bascule-MOBI.sh', detail: 'Vérification bascule (lundi)', days: 'Lun' },
    ],
  },
  {
    time: '10:54',
    scripts: [
      { name: 'Pnm-Verif-Bascule-MOBI.sh', detail: '2ème vérification bascule', days: 'Mar-Ven' },
    ],
  },
  {
    time: '11:15',
    scripts: [
      { name: 'Pnm-Restitutions-Sortantes-Tickets.sh', detail: 'Génération tickets restitutions sortantes', days: 'Lun-Ven' },
    ],
  },
  {
    time: '11:30',
    scripts: [
      { name: 'Pnm_1210_awaiting.sh', detail: 'Vérification tickets 1210 à J+1', days: 'Mar-Ven' },
      { name: 'Pnm_tickets_awaiting.sh', detail: 'Vérification tickets 1210 + 1430 + 3430', days: 'Lun' },
      { name: 'Pnm_1110_DC_vers_UTS.sh', detail: 'Tickets 1110 transmis à UTS', days: 'Lun-Ven' },
      { name: 'refus_porta_free_b2b.sh', detail: 'Portabilités B2B Free Caraïbe', days: 'Lun-Ven' },
    ],
  },
  {
    time: '12:30',
    scripts: [
      { name: 'Pnm-Restitutions-Sortantes-Bascule.sh', detail: 'Bascule restitutions sortantes', days: 'Lun-Ven' },
    ],
  },
  {
    time: '15:30',
    scripts: [
      { name: 'Pnm_1110_DC_vers_UTS.sh', detail: 'Tickets 1110 transmis à UTS', days: 'Lun-Ven' },
      { name: 'refus_porta_free_b2b.sh', detail: 'Portabilités B2B Free Caraïbe', days: 'Lun-Ven' },
    ],
  },
  {
    time: '20:30',
    scripts: [
      { name: 'Pnm_1110_DC_vers_UTS.sh', detail: 'Tickets 1110 transmis à UTS', days: 'Lun-Ven' },
      { name: 'refus_porta_free_b2b.sh', detail: 'Portabilités B2B Free Caraïbe', days: 'Lun-Ven' },
    ],
  },
  {
    time: '21:25',
    scripts: [
      { name: 'Pnm-Restitutions-Entrantes-Bascule.sh', detail: 'Bascule restitutions entrantes', days: 'Lun-Ven' },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function CrontabScripts() {
  const [tab, setTab] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filteredJobs = categoryFilter
    ? CRON_JOBS.filter((job) => job.category === categoryFilter)
    : CRON_JOBS;

  return (
    <DashboardLayout>
      <Head title="Scripts Crontab" />

      <Box sx={{ p: { xs: 3, md: 5 } }}>
        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4">Scripts Crontab</Typography>
          <Typography sx={{ mt: 1, color: 'text.secondary' }}>
            Tâches planifiées sur le serveur <strong>vmqproportawebdb01</strong> — documentation du fichier <code>/etc/crontab</code>
          </Typography>
        </Box>

        {/* Server info */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
                <Iconify icon="solar:server-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
                <Box>
                  <Typography variant="subtitle2">Serveur</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>vmqproportawebdb01</Typography>
                </Box>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
                <Iconify icon="solar:user-bold-duotone" width={24} sx={{ color: 'info.main' }} />
                <Box>
                  <Typography variant="subtitle2">Utilisateur</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>porta_pnmv3</Typography>
                </Box>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
                <Iconify icon="solar:folder-bold-duotone" width={24} sx={{ color: 'warning.main' }} />
                <Box>
                  <Typography variant="subtitle2">Répertoire scripts</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>/home/porta_pnmv3/Scripts/</Typography>
                </Box>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
                <Iconify icon="solar:document-bold-duotone" width={24} sx={{ color: 'success.main' }} />
                <Box>
                  <Typography variant="subtitle2">Répertoire logs</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>/home/porta_pnmv3/Log/</Typography>
                </Box>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 0 }}>
          <Tab
            label="Tâches actives"
            icon={<Iconify icon="solar:play-circle-bold-duotone" width={20} />}
            iconPosition="start"
          />
          <Tab
            label="Planning horaire"
            icon={<Iconify icon="solar:clock-circle-bold-duotone" width={20} />}
            iconPosition="start"
          />
          <Tab
            label="Tâches désactivées"
            icon={<Iconify icon="solar:close-circle-bold-duotone" width={20} />}
            iconPosition="start"
          />
        </Tabs>

        <Divider />

        {/* ─── Tab 1: Active jobs ─────────────────────────────────────── */}
        <TabPanel value={tab} index={0}>
          {/* Category filters */}
          <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label="Toutes"
              variant={categoryFilter === null ? 'filled' : 'outlined'}
              color="default"
              onClick={() => setCategoryFilter(null)}
              size="small"
            />
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <Chip
                key={key}
                label={config.label}
                variant={categoryFilter === key ? 'filled' : 'outlined'}
                color={config.color}
                onClick={() => setCategoryFilter(categoryFilter === key ? null : key)}
                size="small"
              />
            ))}
          </Stack>

          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            {filteredJobs.length} tâche{filteredJobs.length > 1 ? 's' : ''} affichée{filteredJobs.length > 1 ? 's' : ''}
          </Typography>

          <Stack spacing={2}>
            {filteredJobs.map((job) => {
              const cat = CATEGORY_CONFIG[job.category];
              return (
                <Card key={job.id} variant="outlined">
                  <CardContent sx={{ pb: '16px !important' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'flex-start' }}>
                      {/* Left: script name + category */}
                      <Box sx={{ minWidth: 320 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                          <Iconify icon="solar:file-bold-duotone" width={20} sx={{ color: 'text.secondary' }} />
                          <Typography variant="subtitle1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                            {job.script}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip label={cat.label} size="small" color={cat.color} variant="soft" />
                          {job.user === 'root' && (
                            <Chip label="root" size="small" color="error" variant="outlined" />
                          )}
                        </Stack>
                      </Box>

                      {/* Right: details */}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ mb: 1.5 }}>
                          {job.description}
                        </Typography>

                        <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', gap: 1 }}>
                          <Tooltip title="Expression cron">
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Iconify icon="solar:clock-circle-bold-duotone" width={16} sx={{ color: 'text.disabled' }} />
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                                {job.cron}
                              </Typography>
                            </Stack>
                          </Tooltip>

                          <Tooltip title="Planification">
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Iconify icon="solar:calendar-bold-duotone" width={16} sx={{ color: 'text.disabled' }} />
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {job.schedule}
                              </Typography>
                            </Stack>
                          </Tooltip>

                          <Tooltip title="Jours d'exécution">
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Iconify icon="solar:calendar-date-bold-duotone" width={16} sx={{ color: 'text.disabled' }} />
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {job.days}
                              </Typography>
                            </Stack>
                          </Tooltip>

                          {job.log !== '—' && (
                            <Tooltip title="Fichier de log">
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Iconify icon="solar:document-bold-duotone" width={16} sx={{ color: 'text.disabled' }} />
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                                  {job.log}
                                </Typography>
                              </Stack>
                            </Tooltip>
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </TabPanel>

        {/* ─── Tab 2: Timeline ────────────────────────────────────────── */}
        <TabPanel value={tab} index={1}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Vue chronologique de toutes les exécutions sur une journée ouvrable type (lundi à vendredi). Les tâches mensuelles et annuelles sont incluses à leurs horaires respectifs.
          </Alert>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 100, fontWeight: 'bold' }}>Heure</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Script</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ width: 120, fontWeight: 'bold' }}>Jours</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {TIMELINE.map((slot) =>
                  slot.scripts.map((script, i) => (
                    <TableRow key={`${slot.time}-${i}`} hover>
                      {i === 0 && (
                        <TableCell
                          rowSpan={slot.scripts.length}
                          sx={{
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            verticalAlign: 'top',
                            borderRight: '2px solid',
                            borderRightColor: 'divider',
                          }}
                        >
                          {slot.time}
                        </TableCell>
                      )}
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                        {script.name}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{script.detail}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={script.days} size="small" variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>Week-end (samedi et dimanche)</Typography>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Iconify icon="solar:clock-circle-bold-duotone" width={20} sx={{ color: 'text.secondary' }} />
                <Typography variant="body2">
                  <strong>00h00</strong> — <code>PortaDB-export-csv.sh</code> — Seule tâche exécutée le week-end (export CSV quotidien)
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </TabPanel>

        {/* ─── Tab 3: Disabled jobs ───────────────────────────────────── */}
        <TabPanel value={tab} index={2}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Ces tâches sont commentées dans le crontab et ne sont plus exécutées.
          </Alert>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Script</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ancienne planification</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Raison de désactivation</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DISABLED_JOBS.map((job) => (
                  <TableRow key={job.script} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                      {job.script}
                    </TableCell>
                    <TableCell>{job.oldSchedule}</TableCell>
                    <TableCell>{job.description}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        {job.reason}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Notes */}
        <Box sx={{ mt: 5 }}>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>Notes opérationnelles</Typography>
          <Stack spacing={1.5}>
            {[
              'Tous les scripts actifs utilisent l\'option -v (mode verbose) pour un suivi détaillé dans les logs.',
              'Les logs sont en mode append (>>) : ils grossissent continuellement et doivent être purgés régulièrement.',
              'Les scripts de facturation (PEN et PSO mensuels) n\'ont pas de redirection de log explicite.',
              'Les vérifications de bascule tournent sous root (privilèges élevés), les autres scripts sous porta_pnmv3.',
              'Ordre d\'exécution critique : les tickets de restitution sortante (11h15) sont générés avant la bascule (12h30).',
            ].map((note, i) => (
              <Stack key={i} direction="row" alignItems="flex-start" spacing={1}>
                <Iconify icon="solar:info-circle-bold-duotone" width={18} sx={{ color: 'info.main', mt: 0.25, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{note}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
