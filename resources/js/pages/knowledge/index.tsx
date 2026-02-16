import { Head } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        Base de connaissances
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Explorez les domaines de l'architecture entreprise Digicel
                    </Typography>
                </Box>
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
                    {domains.map((domain) => (
                        <DomainCard
                            key={domain.id}
                            domain={domain}
                            showProgress={false}
                        />
                    ))}
                </Box>
            </Box>
        </AppLayout>
    );
}
