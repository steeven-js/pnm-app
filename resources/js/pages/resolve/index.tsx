import { Head, Link } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { BookOpenText, GitBranch } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Résoudre', href: '/resolve' },
];

const tools = [
    {
        title: 'Dictionnaire des codes',
        description: 'Consultez tous les codes PNM : erreurs (E*), refus (R*), annulations (C*), tickets et opérateurs.',
        icon: BookOpenText,
        href: '/resolve/codes',
        color: '#3b82f6',
        count: 'Codes erreur, refus, tickets...',
    },
    {
        title: 'Arbres de décision',
        description: 'Diagnostiquez un problème étape par étape avec des arbres de décision interactifs.',
        icon: GitBranch,
        href: '/resolve/decision-trees',
        color: '#8b5cf6',
        count: 'Diagnostic interactif',
    },
];

export default function ResolveIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Résoudre" />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        Résoudre
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Outils de diagnostic et résolution de problèmes PNM
                    </Typography>
                </Box>

                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { sm: 'repeat(2, 1fr)' } }}>
                    {tools.map((tool) => (
                        <Link key={tool.href} href={tool.href} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                            <Card
                                sx={{
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
                                }}
                            >
                                <Box sx={{ position: 'absolute', inset: 0, bgcolor: tool.color, opacity: 0.05 }} />
                                <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            width: 48,
                                            height: 48,
                                            flexShrink: 0,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 3,
                                            bgcolor: `${tool.color}15`,
                                            color: tool.color,
                                        }}
                                    >
                                        <tool.icon size={24} />
                                    </Box>
                                    <Box>
                                        <Typography variant="body1" fontWeight={600}>
                                            {tool.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {tool.description}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
                                            {tool.count}
                                        </Typography>
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
