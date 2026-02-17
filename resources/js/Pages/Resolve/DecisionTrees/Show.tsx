import { Head, usePage } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { RouterLink } from 'src/routes/components';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

import type { DecisionTree } from 'src/types';

import { DecisionTreePlayer } from '../components/decision-tree-player';

// ----------------------------------------------------------------------

type Props = {
  tree: DecisionTree;
};

export default function DecisionTreeShow() {
  const { tree } = usePage().props as unknown as Props;

  return (
    <DashboardLayout>
      <Head title={tree.title} />

      <Box sx={{ p: { xs: 3, md: 5 }, maxWidth: 720 }}>
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
          <Typography
            component={RouterLink}
            href="/resolve/decision-trees"
            variant="body2"
            color="text.secondary"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Arbres de décision
          </Typography>
          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
            {tree.title}
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            {tree.icon && <Typography variant="h5">{tree.icon}</Typography>}
            <Typography variant="h4">{tree.title}</Typography>
          </Box>
          {tree.description && (
            <Typography color="text.secondary">{tree.description}</Typography>
          )}
        </Box>

        <DecisionTreePlayer rootNode={tree.tree_data} />
      </Box>
    </DashboardLayout>
  );
}
