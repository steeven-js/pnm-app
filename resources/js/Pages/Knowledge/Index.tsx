import { Head, usePage } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import CardActionArea from '@mui/material/CardActionArea';

import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

import type { KnowledgeDomain } from 'src/types';

// ----------------------------------------------------------------------

type Props = {
  domains: KnowledgeDomain[];
};

export default function KnowledgeIndex() {
  const { domains } = usePage().props as unknown as Props;

  return (
    <DashboardLayout>
      <Head title="Base de connaissances" />

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
          <Typography variant="body2">Connaissances</Typography>
        </Breadcrumbs>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4">Base de connaissances</Typography>
          <Typography sx={{ mt: 0.5, color: 'text.secondary' }}>
            Explorez les domaines de l&apos;architecture entreprise Digicel
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {domains.map((domain) => (
            <Grid key={domain.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardActionArea
                  component={RouterLink}
                  href={paths.knowledge.domain(domain.slug)}
                  sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: 1 }}>
                    <Iconify
                      icon={domain.icon || 'solar:document-bold-duotone'}
                      width={32}
                      sx={{ color: domain.color ?? 'primary.main' }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1">{domain.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {domain.articles_count || 0} articles
                      </Typography>
                    </Box>
                  </Box>

                  {domain.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {domain.description}
                    </Typography>
                  )}
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
