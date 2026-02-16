import { Head, Link, router } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Search } from 'lucide-react';
import { SeverityBadge } from '@/components/severity-badge';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PnmCode } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Résoudre', href: '/resolve' },
    { title: 'Codes PNM', href: '/resolve/codes' },
];

type Props = {
    codes: PnmCode[];
    categories: string[];
    severities: string[];
    filters: { q: string | null; category: string | null; severity: string | null };
};

export default function CodesIndex({ codes, categories, severities, filters }: Props) {
    const handleSearch = (q: string) => {
        router.get('/resolve/codes', {
            q: q || undefined,
            category: filters.category || undefined,
            severity: filters.severity || undefined,
        }, { preserveState: true, replace: true });
    };

    const handleCategoryFilter = (category: string | null) => {
        router.get('/resolve/codes', {
            q: filters.q || undefined,
            category: category || undefined,
            severity: filters.severity || undefined,
        }, { preserveState: true, replace: true });
    };

    const handleSeverityFilter = (severity: string | null) => {
        router.get('/resolve/codes', {
            q: filters.q || undefined,
            category: filters.category || undefined,
            severity: severity || undefined,
        }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Codes PNM" />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        Dictionnaire des codes PNM
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {codes.length} code{codes.length > 1 ? 's' : ''} — erreurs, refus, annulations, tickets et opérateurs
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <TextField
                        placeholder="Rechercher un code (ex: E600, R123, 1110)..."
                        defaultValue={filters.q || ''}
                        onChange={(e) => handleSearch(e.target.value)}
                        fullWidth
                        size="small"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={16} style={{ opacity: 0.5 }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        <Chip
                            label="Toutes catégories"
                            size="small"
                            color={!filters.category ? 'primary' : 'default'}
                            variant={!filters.category ? 'filled' : 'outlined'}
                            onClick={() => handleCategoryFilter(null)}
                        />
                        {categories.map((cat) => (
                            <Chip
                                key={cat}
                                label={cat}
                                size="small"
                                color={filters.category === cat ? 'primary' : 'default'}
                                variant={filters.category === cat ? 'filled' : 'outlined'}
                                onClick={() => handleCategoryFilter(cat)}
                            />
                        ))}
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        <Chip
                            label="Toutes sévérités"
                            size="small"
                            color={!filters.severity ? 'primary' : 'default'}
                            variant={!filters.severity ? 'filled' : 'outlined'}
                            onClick={() => handleSeverityFilter(null)}
                        />
                        {severities.map((sev) => (
                            <Chip
                                key={sev}
                                label={sev}
                                size="small"
                                color={filters.severity === sev ? 'primary' : 'default'}
                                variant={filters.severity === sev ? 'filled' : 'outlined'}
                                onClick={() => handleSeverityFilter(sev)}
                            />
                        ))}
                    </Box>
                </Box>

                {codes.length === 0 ? (
                    <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>
                        Aucun code trouvé
                    </Typography>
                ) : (
                    <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
                        {codes.map((code) => (
                            <Link
                                key={code.id}
                                href={`/resolve/codes/${code.code}`}
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
                                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, pb: '12px !important' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Typography
                                                variant="body2"
                                                sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}
                                            >
                                                {code.code}
                                            </Typography>
                                            <SeverityBadge severity={code.severity} />
                                        </Box>
                                        <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                                            {code.label}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {code.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </Box>
                )}
            </Box>
        </AppLayout>
    );
}
