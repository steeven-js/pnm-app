import { Head, usePage } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

import type { KnowledgeDomain, DomainProgress, MonitoringData } from 'src/types';

import { LevelBadge } from './Dashboard/components/level-badge';
import { OperationCard } from './Dashboard/components/operation-card';
import { DomainCard } from './Dashboard/components/domain-card';
import { MonitoringTimeline } from './Dashboard/components/monitoring/monitoring-timeline';
import { PortabilityDeadlines } from './Dashboard/components/monitoring/portability-deadlines';

// ----------------------------------------------------------------------

type DashboardPageProps = {
  domains: KnowledgeDomain[];
  domainProgress: Record<string, DomainProgress>;
  monitoring: MonitoringData;
  user: {
    id: number;
    name: string;
    role: string | null;
    level: string;
    onboarding_completed: boolean;
  };
};

const OPERATIONS_DOCS_BASE =
  'https://github.com/steeven-js/pnm-app/blob/main/docs/operations';

const OPERATIONS_EN_COURS = [
  {
    title: 'Dump FNR Orange',
    deadline: 'Jeudi 30/04 — après 9h',
    description:
      'Coordination CORE/MIS pour le dump FNR juste après la bascule, en vue de la migration des préfixes Orange.',
    icon: 'solar:database-bold-duotone',
    href: `${OPERATIONS_DOCS_BASE}/gpmag/gpmag-evolutions-arcep.md`,
    status: 'EN COURS' as const,
    color: '#FFAB00',
  },
  {
    title: 'Migration anciens portages',
    deadline: 'Nuit dim 03/05 → lun 04/05',
    description:
      'Sarah migre les anciens portages vers les nouveaux préfixes OC sur les 3 départements. Monitoring lundi matin.',
    icon: 'solar:transfer-horizontal-bold-duotone',
    href: `${OPERATIONS_DOCS_BASE}/gpmag/gpmag-evolutions-arcep.md`,
    status: 'PLANIFIE' as const,
    color: '#00B8D9',
  },
  {
    title: 'SMS portés Orange',
    deadline: 'Depuis 31/03/2026',
    description:
      '13 tickets RT clients. Routage SRI for SM cassé entre Orange IC et BICS. Attente trace forwarding Orange IC.',
    icon: 'solar:chat-square-arrow-bold-duotone',
    href: `${OPERATIONS_DOCS_BASE}/gpmag/sms-portes-orange-diagnostic.md`,
    status: 'CRITIQUE' as const,
    color: '#FF5630',
  },
  {
    title: 'PILMEDIA / Max Morawski',
    deadline: 'À planifier avec Sarah',
    description:
      '4 sujets ouverts : fusion ACK #5175, tests scripts staging, SMS DAPI #4986, config emails DAPI.',
    icon: 'solar:users-group-rounded-bold-duotone',
    href: `${OPERATIONS_DOCS_BASE}/pilmedia/points-actuels.md`,
    status: 'A PLANIFIER' as const,
    color: '#00A76F',
  },
];

export default function Dashboard() {
  const { domains, domainProgress, monitoring, user } = usePage().props as unknown as DashboardPageProps;

  return (
    <DashboardLayout>
      <Head title="Dashboard" />

      <Box sx={{ p: { xs: 3, md: 5 } }}>
        {/* Welcome */}
        <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="h4">
              Bonjour, {user?.name ?? 'Utilisateur'}
            </Typography>
            <Typography sx={{ mt: 0.5, color: 'text.secondary' }}>
              Bienvenue sur votre espace PNM
            </Typography>
          </Box>
          {user?.level && <LevelBadge level={user.level} />}
        </Box>

        {/* Monitoring Timeline */}
        {monitoring && (
          <Box sx={{ mb: 5 }}>
            <MonitoringTimeline monitoring={monitoring} />
          </Box>
        )}

        {/* Portability Deadlines */}
        <Box sx={{ mb: 5 }}>
          <PortabilityDeadlines />
        </Box>

        {/* Operations en cours */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Opérations en cours</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Dossiers nécessitant votre attention ou intervention.
          </Typography>
        </Box>
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {OPERATIONS_EN_COURS.map((item) => (
            <Grid key={item.title} size={{ xs: 12, md: 6, lg: 3 }}>
              <OperationCard
                title={item.title}
                description={item.description}
                deadline={item.deadline}
                icon={item.icon}
                href={item.href}
                status={item.status}
                color={item.color}
              />
            </Grid>
          ))}
        </Grid>

        {/* Domain Progress — déplacé dans la page Progression */}
      </Box>
    </DashboardLayout>
  );
}
