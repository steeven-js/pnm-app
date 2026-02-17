import { Head, usePage } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

import type { DecisionTree } from 'src/types';

// ----------------------------------------------------------------------

type Props = {
  trees: DecisionTree[];
};

export default function DecisionTreesIndex() {
  const { trees } = usePage().props as unknown as Props;

  return (
    <DashboardLayout>
      <Head title="Arbres de décision" />

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
          <Typography variant="body2">Arbres de décision</Typography>
        </Breadcrumbs>

        <Typography variant="h4" sx={{ mb: 1 }}>
          Arbres de décision
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Diagnostiquez un problème étape par étape
        </Typography>

        {trees.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Iconify icon="solar:branching-paths-up-linear" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">Aucun arbre de décision disponible</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            }}
          >
            {trees.map((tree) => (
              <Card
                key={tree.id}
                component={RouterLink}
                href={`/resolve/decision-trees/${tree.slug}`}
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: (theme) => theme.shadows[8], transform: 'translateY(-1px)' },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {tree.icon && (
                      <Typography variant="h5">{tree.icon}</Typography>
                    )}
                    <Typography variant="subtitle1" fontWeight={600}>
                      {tree.title}
                    </Typography>
                  </Box>

                  {tree.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {tree.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main' }}>
                    <Typography variant="body2" fontWeight={500}>
                      Commencer
                    </Typography>
                    <Iconify icon="solar:arrow-right-linear" width={16} />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}
