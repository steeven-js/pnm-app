import { Head, router } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Search } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, GlossaryTerm } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Glossaire', href: '/glossary' },
];

type Props = {
    terms: GlossaryTerm[];
    categories: string[];
    filters: { q: string | null; category: string | null };
};

export default function GlossaryIndex({ terms, categories, filters }: Props) {
    const grouped = terms.reduce<Record<string, GlossaryTerm[]>>((acc, term) => {
        const letter = term.term[0].toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(term);
        return acc;
    }, {});

    const sortedLetters = Object.keys(grouped).sort();

    const handleSearch = (q: string) => {
        router.get('/glossary', { q: q || undefined, category: filters.category || undefined }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleCategoryFilter = (category: string | null) => {
        router.get('/glossary', { q: filters.q || undefined, category: category || undefined }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Glossaire" />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        Glossaire
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Tous les termes techniques de l'architecture Digicel
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, gap: 1.5 }}>
                    <TextField
                        placeholder="Rechercher un terme..."
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
                            label="Tous"
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
                </Box>

                {terms.length === 0 ? (
                    <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>
                        Aucun terme trouvé
                    </Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {sortedLetters.map((letter) => (
                            <Box key={letter}>
                                <Typography variant="h6" fontWeight={700} sx={{ pb: 0.5 }}>
                                    {letter}
                                </Typography>
                                <Divider />
                                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {grouped[letter].map((term) => (
                                        <Box key={term.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                                {term.abbreviation && (
                                                    <Typography
                                                        variant="body2"
                                                        component="span"
                                                        sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main', flexShrink: 0 }}
                                                    >
                                                        {term.abbreviation}
                                                    </Typography>
                                                )}
                                                <Typography variant="body2" fontWeight={600}>
                                                    {term.term}
                                                </Typography>
                                                {term.category && (
                                                    <Chip label={term.category} size="small" variant="outlined" sx={{ fontSize: '0.625rem', height: 20 }} />
                                                )}
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                                {term.definition}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </AppLayout>
    );
}
