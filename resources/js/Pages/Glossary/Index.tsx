import { Head, router, usePage } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

import type { GlossaryTerm } from 'src/types';

// ----------------------------------------------------------------------

type Props = {
  terms: GlossaryTerm[];
  categories: string[];
  filters: { q: string | null; category: string | null };
};

export default function GlossaryIndex() {
  const { terms, categories, filters } = usePage().props as unknown as Props;

  const grouped = terms.reduce<Record<string, GlossaryTerm[]>>((acc, term) => {
    const letter = term.term[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(term);
    return acc;
  }, {});

  const sortedLetters = Object.keys(grouped).sort();

  const handleSearch = (q: string) => {
    router.get(
      '/glossary',
      { ...(q && { q }), ...(filters.category && { category: filters.category }) },
      { preserveState: true, replace: true },
    );
  };

  const handleCategoryFilter = (category: string | null) => {
    router.get(
      '/glossary',
      { ...(filters.q && { q: filters.q }), ...(category && { category }) },
      { preserveState: true, replace: true },
    );
  };

  return (
    <DashboardLayout>
      <Head title="Glossaire" />

      <Box sx={{ p: { xs: 3, md: 5 } }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Typography
            component={RouterLink}
            href="/dashboard"
            variant="body2"
            color="text.secondary"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Dashboard
          </Typography>
          <Typography variant="body2">Glossaire</Typography>
        </Breadcrumbs>

        <Typography variant="h4" sx={{ mb: 0.5 }}>
          Glossaire
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Tous les termes techniques de la portabilité des numéros mobiles
        </Typography>

        {/* Search + category filters */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { sm: 'center' },
            gap: 1.5,
            mb: 4,
          }}
        >
          <TextField
            placeholder="Rechercher un terme..."
            defaultValue={filters.q ?? ''}
            onChange={(e) => handleSearch(e.target.value)}
            fullWidth
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:magnifer-linear" width={18} sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ maxWidth: { sm: 320 } }}
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

        {/* Terms list */}
        {terms.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Iconify icon="solar:book-2-linear" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">Aucun terme trouvé</Typography>
          </Box>
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
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: 'primary.main',
                              flexShrink: 0,
                            }}
                          >
                            {term.abbreviation}
                          </Typography>
                        )}
                        <Typography variant="body2" fontWeight={600}>
                          {term.term}
                        </Typography>
                        {term.category && (
                          <Chip
                            label={term.category}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.625rem', height: 20 }}
                          />
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
    </DashboardLayout>
  );
}
