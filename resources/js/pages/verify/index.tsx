import { Head, Link } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Calendar, FileText, Hash, Phone, ShieldCheck } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Vérifier', href: '/verify' },
];

const tools = [
    {
        title: 'Calculateur de dates',
        description:
            "Calculez les dates de portage (JP), fenêtres de bascule et délais d'annulation à partir d'une date de demande.",
        icon: Calendar,
        href: '/verify/date-calculator',
        color: '#3b82f6',
        count: 'Jours ouvrés, fériés, vacations',
    },
    {
        title: 'Validateur de RIO',
        description:
            "Validez et décodez un Relevé d'Identité Opérateur : opérateur, qualifiant, référence et clé de contrôle.",
        icon: ShieldCheck,
        href: '/verify/rio-validator',
        color: '#8b5cf6',
        count: 'Format OO-Q-RRRRRR-CCC',
    },
    {
        title: 'Décodeur fichier PNMDATA',
        description:
            'Décodez un nom de fichier PNMDATA pour identifier les opérateurs source/destination, la date et la séquence.',
        icon: FileText,
        href: '/verify/filename-decoder',
        color: '#f59e0b',
        count: 'PNMDATA.XX.YY.timestamp.seq',
    },
    {
        title: "Calculateur d'ID portage",
        description:
            "Générez le hash MD5 d'identification de portage à partir des codes opérateur, date et MSISDN.",
        icon: Hash,
        href: '/verify/portage-id',
        color: '#ef4444',
        count: 'Hash MD5 : OPR + OPD + Date + MSISDN',
    },
    {
        title: 'Vérificateur de MSISDN',
        description:
            'Vérifiez un numéro mobile Antilles-Guyane : format, opérateur attributaire et zone géographique.',
        icon: Phone,
        href: '/verify/msisdn-checker',
        color: '#10b981',
        count: 'Tranches 069x, opérateurs, zones',
    },
];

export default function VerifyIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vérifier" />
            <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2 }}
            >
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        Vérifier
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Outils et calculateurs pour les opérations PNM
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: { sm: 'repeat(2, 1fr)' },
                    }}
                >
                    {tools.map((tool) => (
                        <Link
                            key={tool.href}
                            href={tool.href}
                            style={{
                                display: 'block',
                                textDecoration: 'none',
                                color: 'inherit',
                            }}
                        >
                            <Card
                                sx={{
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        boxShadow: 3,
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        inset: 0,
                                        bgcolor: tool.color,
                                        opacity: 0.05,
                                    }}
                                />
                                <CardContent
                                    sx={{
                                        display: 'flex',
                                        gap: 2,
                                        alignItems: 'flex-start',
                                    }}
                                >
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
                                        <Typography
                                            variant="body1"
                                            fontWeight={600}
                                        >
                                            {tool.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mt: 0.5 }}
                                        >
                                            {tool.description}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                                mt: 1,
                                                display: 'block',
                                                fontStyle: 'italic',
                                            }}
                                        >
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
