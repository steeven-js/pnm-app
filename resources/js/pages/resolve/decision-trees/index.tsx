import { Head, Link } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { ArrowRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, DecisionTree } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Résoudre', href: '/resolve' },
    { title: 'Arbres de décision', href: '/resolve/decision-trees' },
];

type Props = {
    trees: Pick<DecisionTree, 'id' | 'title' | 'slug' | 'description' | 'icon'>[];
};

export default function DecisionTreesIndex({ trees }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Arbres de décision" />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        Arbres de décision
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Diagnostiquez un problème étape par étape
                    </Typography>
                </Box>

                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
                    {trees.map((tree) => (
                        <Link
                            key={tree.id}
                            href={`/resolve/decision-trees/${tree.slug}`}
                            style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                        >
                            <Card
                                sx={{
                                    height: '100%',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    '&:hover': { boxShadow: 3, transform: 'translateY(-1px)' },
                                }}
                            >
                                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        {tree.icon && (
                                            <Typography variant="h5" component="span">
                                                {tree.icon}
                                            </Typography>
                                        )}
                                        <Typography variant="body1" fontWeight={600}>
                                            {tree.title}
                                        </Typography>
                                    </Box>
                                    {tree.description && (
                                        <Typography variant="body2" color="text.secondary">
                                            {tree.description}
                                        </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main', mt: 'auto' }}>
                                        <Typography variant="body2" fontWeight={500}>
                                            Commencer
                                        </Typography>
                                        <ArrowRight size={16} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </Box>
            </Box>
        </AppLayout>
    );
}
