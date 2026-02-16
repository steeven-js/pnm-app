import { Link } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import type { KnowledgeDomain, UserDomainProgress } from '@/types';

const domainIcons: Record<string, string> = {
    'pnm-v3': '\u{1F4F1}',
    'systemes-information': '\u{1F4BB}',
    'reseau-infrastructure': '\u{1F310}',
    'inter-operateurs-gpmag': '\u{1F91D}',
    'outils-scripts': '\u{1F527}',
};

type DomainCardProps = {
    domain: KnowledgeDomain;
    progress?: UserDomainProgress;
    showProgress?: boolean;
};

export function DomainCard({ domain, progress, showProgress = true }: DomainCardProps) {
    const percentage = progress?.completion_percentage ?? 0;

    return (
        <Card
            component={Link}
            href={`/knowledge/${domain.slug}`}
            sx={{
                textDecoration: 'none',
                color: 'inherit',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: 4,
                    width: '100%',
                    bgcolor: domain.color || '#6b7280',
                }}
            />
            <CardContent sx={{ pb: showProgress ? 2 : undefined }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography component="span" sx={{ fontSize: '1.5rem' }}>
                        {domainIcons[domain.slug] || '\u{1F4D6}'}
                    </Typography>
                    <Box>
                        <Typography variant="body2" fontWeight={600}>
                            {domain.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {domain.articles_count || 0} articles
                        </Typography>
                    </Box>
                </Box>
                {showProgress && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                        <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{
                                flex: 1,
                                height: 6,
                                borderRadius: 99,
                                bgcolor: 'action.hover',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: domain.color || '#6b7280',
                                    borderRadius: 99,
                                },
                            }}
                        />
                        <Typography variant="caption" color="text.secondary">
                            {Math.round(percentage)}%
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
