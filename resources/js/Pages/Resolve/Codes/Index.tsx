import { useState, useCallback } from 'react';

import { Head, router, usePage } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

import type { PnmCode } from 'src/types';

import { SeverityBadge } from '../components/severity-badge';

// ----------------------------------------------------------------------

type Props = {
  codes: PnmCode[];
  categories: string[];
  severities: string[];
  filters: {
    q: string | null;
    category: string | null;
    severity: string | null;
  };
};

export default function PnmCodesIndex() {
  const { codes, categories, severities, filters } = usePage().props as unknown as Props;

  const [search, setSearch] = useState(filters.q ?? '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category ?? '');
  const [selectedSeverity, setSelectedSeverity] = useState(filters.severity ?? '');

  const applyFilters = useCallback(
    (q: string, category: string, severity: string) => {
      router.get(
        '/resolve/codes',
        {
          ...(q && { q }),
          ...(category && { category }),
          ...(severity && { severity }),
        },
        { preserveState: true, replace: true },
      );
    },
    [],
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    applyFilters(value, selectedCategory, selectedSeverity);
  };

  const toggleCategory = (cat: string) => {
    const next = selectedCategory === cat ? '' : cat;
    setSelectedCategory(next);
    applyFilters(search, next, selectedSeverity);
  };

  const toggleSeverity = (sev: string) => {
    const next = selectedSeverity === sev ? '' : sev;
    setSelectedSeverity(next);
    applyFilters(search, selectedCategory, next);
  };

  return (
    <DashboardLayout>
      <Head title="Codes PNM" />

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
          <Typography
            component={RouterLink}
            href="/resolve"
            variant="body2"
            color="text.secondary"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Résoudre
          </Typography>
          <Typography variant="body2">Codes PNM</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4">Codes PNM</Typography>
          <TextField
            size="small"
            placeholder="Rechercher un code..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:magnifer-linear" width={20} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: 250 }}
          />
        </Box>

        {/* Category filters */}
        {categories.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', mr: 1 }}>
              Catégorie :
            </Typography>
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                size="small"
                variant={selectedCategory === cat ? 'filled' : 'outlined'}
                color={selectedCategory === cat ? 'primary' : 'default'}
                onClick={() => toggleCategory(cat)}
              />
            ))}
          </Box>
        )}

        {/* Severity filters */}
        {severities.length > 0 && (
          <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', mr: 1 }}>
              Sévérité :
            </Typography>
            {severities.map((sev) => (
              <Chip
                key={sev}
                label={sev}
                size="small"
                variant={selectedSeverity === sev ? 'filled' : 'outlined'}
                color={selectedSeverity === sev ? 'warning' : 'default'}
                onClick={() => toggleSeverity(sev)}
              />
            ))}
          </Box>
        )}

        {/* Results */}
        {codes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Iconify icon="solar:document-text-linear" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">Aucun code trouvé</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            }}
          >
            {codes.map((code) => (
              <Card
                key={code.id}
                component={RouterLink}
                href={`/resolve/codes/${code.code}`}
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: (theme) => theme.shadows[8], transform: 'translateY(-1px)' },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      sx={{ fontFamily: 'monospace' }}
                    >
                      {code.code}
                    </Typography>
                    <SeverityBadge severity={code.severity} />
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    <Chip label={code.category} size="small" variant="outlined" />
                    {code.subcategory && (
                      <Chip label={code.subcategory} size="small" variant="outlined" />
                    )}
                  </Box>

                  <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
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
            ))}
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}
