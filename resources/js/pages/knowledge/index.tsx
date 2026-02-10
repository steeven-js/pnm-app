import { Head } from '@inertiajs/react';
import { DomainCard } from '@/components/domain-card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, KnowledgeDomain } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Connaissances', href: '/knowledge' },
];

type Props = {
    domains: KnowledgeDomain[];
};

export default function KnowledgeIndex({ domains }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Base de connaissances" />
            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Base de connaissances</h1>
                    <p className="text-muted-foreground text-sm">
                        Explorez les domaines de l'architecture entreprise Digicel
                    </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {domains.map((domain) => (
                        <DomainCard
                            key={domain.id}
                            domain={domain}
                            showProgress={false}
                        />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
