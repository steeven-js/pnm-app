import { Head, usePage } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import LinearProgress from '@mui/material/LinearProgress';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

import type {
  KnowledgeDomain,
  ProgressStats,
  UserArticleProgress,
  UserDomainProgress,
} from 'src/types';

// ----------------------------------------------------------------------

type Props = {
  domains: KnowledgeDomain[];
  domainProgress: Record<number, UserDomainProgress>;
  recentlyRead: (UserArticleProgress & {
    article: {
      id: number;
      title: string;
      slug: string;
      domain_id: number;
      reading_time_minutes: number;
      domain: { id: number; slug: string; name: string; color: string };
    };
  })[];
  stats: ProgressStats;
};

const LEVEL_CONFIG: Record<string, { label: string; color: 'default' | 'primary' | 'secondary' }> = {
  decouverte: { label: 'Découverte', color: 'secondary' },
  comprehension: { label: 'Compréhension', color: 'default' },
  maitrise: { label: 'Maîtrise', color: 'primary' },
  expertise: { label: 'Expertise', color: 'primary' },
};

const STAT_CARDS = (stats: ProgressStats) => [
  {
    icon: 'solar:book-bold-duotone',
    iconColor: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    value: String(stats.totalRead),
    label: 'Articles lus',
  },
  {
    icon: 'solar:check-circle-bold-duotone',
    iconColor: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    value: `${stats.completionPercentage}%`,
    label: 'Complété',
  },
  {
    icon: 'solar:cup-star-bold-duotone',
    iconColor: '#a855f7',
    bg: 'rgba(168,85,247,0.08)',
    value: null,
    level: stats.level,
    label: 'Niveau actuel',
  },
  {
    icon: 'solar:clock-circle-bold-duotone',
    iconColor: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    value: String(stats.totalArticles),
    label: 'Articles disponibles',
  },
];

export default function ProgressIndex() {
  const { domains, domainProgress, recentlyRead, stats } = usePage().props as unknown as Props;

  return (
    <DashboardLayout>
      <Head title="Progression" />

      <Box sx={{ p: { xs: 3, md: 5 } }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Typography
            component={RouterLink}
            href="/dashboard"
            variant="body2"
            color="text.secondary"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Dashboard
          </Typography>
          <Typography variant="body2">Progression</Typography>
        </Breadcrumbs>

        <Typography variant="h4" sx={{ mb: 0.5 }}>
          Ma progression
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Suivez votre avancement
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Stats cards */}
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            }}
          >
            {STAT_CARDS(stats).map((card) => (
              <Card key={card.label} variant="outlined">
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      width: 40,
                      height: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                      bgcolor: card.bg,
                    }}
                  >
                    <Iconify icon={card.icon} width={20} sx={{ color: card.iconColor }} />
                  </Box>
                  <Box>
                    {card.level ? (
                      <Chip
                        label={LEVEL_CONFIG[card.level]?.label ?? card.level}
                        color={LEVEL_CONFIG[card.level]?.color ?? 'default'}
                        size="small"
                        variant={LEVEL_CONFIG[card.level]?.color === 'default' ? 'outlined' : 'filled'}
                      />
                    ) : (
                      <Typography variant="h5" fontWeight={700}>
                        {card.value}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {card.label}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Domain progress */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Progression par domaine
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {domains.map((domain) => {
                  const progress = domainProgress[domain.id];
                  return (
                    <Box key={domain.id}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          component={RouterLink}
                          href={`/knowledge/${domain.slug}`}
                          variant="body2"
                          color="text.primary"
                          sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                          {domain.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {progress?.articles_read || 0}/{domain.articles_count || 0}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, progress?.completion_percentage ?? 0)}
                        sx={{
                          height: 8,
                          borderRadius: 99,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: domain.color || '#6b7280',
                            borderRadius: 99,
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>

          {/* Recently read */}
          {recentlyRead.length > 0 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Articles récemment lus
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {recentlyRead.map((item) => (
                    <Box
                      key={item.id}
                      component={RouterLink}
                      href={`/knowledge/${item.article.domain.slug}/${item.article.slug}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: 2,
                        px: 1.5,
                        py: 1,
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify
                          icon="solar:check-circle-bold"
                          width={16}
                          sx={{ color: '#22c55e' }}
                        />
                        <Typography variant="body2">{item.article.title}</Typography>
                      </Box>
                      <Chip
                        label={item.article.domain.name}
                        size="small"
                        sx={{
                          fontSize: '0.625rem',
                          height: 20,
                          bgcolor: item.article.domain.color || '#6b7280',
                          color: '#fff',
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </DashboardLayout>
  );
}
