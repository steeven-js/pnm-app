import { Head, router } from '@inertiajs/react';
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
            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Bonjour, {user.name}</h1>
                    <p className="text-muted-foreground text-sm">
                        Que souhaitez-vous faire aujourd'hui ?
                        <span className="ml-2">
                            <LevelBadge level={user.level} />
                        </span>
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                        href="/knowledge"
                        color="#f59e0b"
                        disabled
                    />
                    <IntentionCard
                        title="Vérifier"
                        description="Outils et calculateurs"
                        icon={Calculator}
                        href="/knowledge"
                        color="#10b981"
                        disabled
                    />
                </div>

                <div>
                    <h2 className="mb-3 text-lg font-semibold">Progression par domaine</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {domains.map((domain) => (
                            <DomainCard
                                key={domain.id}
                                domain={domain}
                                progress={domainProgress[domain.id]}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
