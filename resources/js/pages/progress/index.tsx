import { Head, Link } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { BookOpen, CheckCircle2, Clock, Trophy } from 'lucide-react';
import { LevelBadge } from '@/components/level-badge';
import { ProgressBar } from '@/components/progress-bar';
import AppLayout from '@/layouts/app-layout';
import type {
    BreadcrumbItem,
    KnowledgeDomain,
    ProgressStats,
    UserArticleProgress,
    UserDomainProgress,
} from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Progression', href: '/progress' },
];

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

const statCards = (stats: ProgressStats) => [
    {
        icon: BookOpen,
        iconColor: '#3b82f6',
        bgLight: 'rgba(59,130,246,0.08)',
        bgDark: 'rgba(59,130,246,0.12)',
        value: stats.totalRead,
        label: 'Articles lus',
    },
    {
        icon: CheckCircle2,
        iconColor: '#22c55e',
        bgLight: 'rgba(34,197,94,0.08)',
        bgDark: 'rgba(34,197,94,0.12)',
        value: `${stats.completionPercentage}%`,
        label: 'Complété',
    },
    {
        icon: Trophy,
        iconColor: '#a855f7',
        bgLight: 'rgba(168,85,247,0.08)',
        bgDark: 'rgba(168,85,247,0.12)',
        value: null,
        levelBadge: stats.level,
        label: 'Niveau actuel',
    },
    {
        icon: Clock,
        iconColor: '#f59e0b',
        bgLight: 'rgba(245,158,11,0.08)',
        bgDark: 'rgba(245,158,11,0.12)',
        value: stats.totalArticles,
        label: 'Articles disponibles',
    },
];

export default function Progress({ domains, domainProgress, recentlyRead, stats }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Progression" />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        Ma progression
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Suivez votre avancement
                    </Typography>
                </Box>

                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
                    {statCards(stats).map((card) => (
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
                                        bgcolor: (t) => (t.palette.mode === 'dark' ? card.bgDark : card.bgLight),
                                    }}
                                >
                                    <card.icon size={20} color={card.iconColor} />
                                </Box>
                                <Box>
                                    {card.levelBadge ? (
                                        <LevelBadge level={card.levelBadge} />
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                            <MuiLink
                                                component={Link}
                                                href={`/knowledge/${domain.slug}`}
                                                underline="hover"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                {domain.name}
                                            </MuiLink>
                                            <Typography variant="caption" color="text.secondary">
                                                {progress?.articles_read || 0}/{domain.articles_count || 0}
                                            </Typography>
                                        </Box>
                                        <ProgressBar
                                            value={progress?.completion_percentage ?? 0}
                                            color={domain.color || '#6b7280'}
                                        />
                                    </Box>
                                );
                            })}
                        </Box>
                    </CardContent>
                </Card>

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
                                        component={Link}
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
                                            <CheckCircle2 size={16} color="#22c55e" />
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
        </AppLayout>
    );
}
