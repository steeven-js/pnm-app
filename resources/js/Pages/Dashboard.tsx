import { Head, usePage } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

import type { KnowledgeDomain, DomainProgress, MonitoringData } from 'src/types';

import { LevelBadge } from './Dashboard/components/level-badge';
import { IntentionCard } from './Dashboard/components/intention-card';
import { DomainCard } from './Dashboard/components/domain-card';
import { MonitoringTimeline } from './Dashboard/components/monitoring/monitoring-timeline';

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

const INTENTIONS = [
  {
    title: 'Apprendre',
    description: 'Parcourir la base de connaissances PNM',
    icon: 'solar:book-bold-duotone',
    href: paths.knowledge.root,
    color: '#00A76F',
  },
  {
    title: 'Comprendre',
    description: 'Consulter le glossaire des termes PNM',
    icon: 'solar:lightbulb-bold-duotone',
    href: paths.glossary,
    color: '#FFAB00',
  },
  {
    title: 'Résoudre',
    description: 'Diagnostiquer un problème de portabilité',
    icon: 'solar:bug-bold-duotone',
    href: paths.resolve.root,
    color: '#FF5630',
  },
  {
    title: 'Vérifier',
    description: 'Utiliser les outils de vérification PNM',
    icon: 'solar:check-circle-bold-duotone',
    href: paths.verify.root,
    color: '#00B8D9',
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

        {/* Intention Cards */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {INTENTIONS.map((item) => (
            <Grid key={item.title} size={{ xs: 6, md: 3 }}>
              <IntentionCard
                title={item.title}
                description={item.description}
                icon={item.icon}
                href={item.href}
                color={item.color}
              />
            </Grid>
          ))}
        </Grid>

        {/* Domain Progress */}
        {domains && domains.length > 0 && (
          <>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Progression par domaine
            </Typography>

            <Grid container spacing={3}>
              {domains.map((domain) => (
                <Grid key={domain.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <DomainCard
                    domain={domain}
                    progress={domainProgress?.[domain.id]}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
    </DashboardLayout>
  );
}
