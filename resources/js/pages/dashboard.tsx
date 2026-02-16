import { Head, router } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Calculator, GraduationCap, Network, Search } from 'lucide-react';
import { DomainCard } from '@/components/domain-card';
import { IntentionCard } from '@/components/intention-card';
import { LevelBadge } from '@/components/level-badge';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, KnowledgeDomain, UserDomainProgress } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

type Props = {
    domains: KnowledgeDomain[];
    domainProgress: Record<number, UserDomainProgress>;
    user: { id: number; name: string; role: string | null; level: string; onboarding_completed: boolean };
};

export default function Dashboard({ domains, domainProgress, user }: Props) {
    if (!user.onboarding_completed) {
        router.visit('/onboarding');
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        Bonjour, {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Que souhaitez-vous faire aujourd'hui ?{' '}
                        <Box component="span" sx={{ ml: 1 }}>
                            <LevelBadge level={user.level} />
                        </Box>
                    </Typography>
                </Box>

                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
                    <IntentionCard
                        title="Apprendre"
                        description="Parcourir les modules de formation"
                        icon={GraduationCap}
                        href="/knowledge"
                        color="#3b82f6"
                    />
                    <IntentionCard
                        title="Comprendre"
                        description="Explorer l'architecture et les systèmes"
                        icon={Network}
                        href="/knowledge"
                        color="#8b5cf6"
                    />
                    <IntentionCard
                        title="Résoudre"
                        description="Arbres de décision et diagnostics"
                        icon={Search}
                        href="/resolve"
                        color="#f59e0b"
                    />
                    <IntentionCard
                        title="Vérifier"
                        description="Outils et calculateurs"
                        icon={Calculator}
                        href="/verify"
                        color="#10b981"
                    />
                </Box>

                <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
                        Progression par domaine
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
                        {domains.map((domain) => (
                            <DomainCard
                                key={domain.id}
                                domain={domain}
                                progress={domainProgress[domain.id]}
                            />
                        ))}
                    </Box>
                </Box>
            </Box>
        </AppLayout>
    );
}
