import { Head } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

// ----------------------------------------------------------------------

const TOOLS = [
  {
    title: 'Codes PNM',
    description: 'Dictionnaire complet des codes PNM avec recherche et filtres par catégorie et sévérité.',
    icon: 'solar:code-scan-bold-duotone',
    href: '/resolve/codes',
  },
  {
    title: 'Incidents',
    description: 'Analysez les emails d\'incidents DIGICEL.PORTA-V3 et extrayez les informations clés.',
    icon: 'solar:danger-triangle-bold-duotone',
    href: '/resolve/incidents',
  },
];

export default function ResolveIndex() {
  return (
    <DashboardLayout>
      <Head title="Résoudre" />

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
          <Typography variant="body2">Résoudre</Typography>
        </Breadcrumbs>

        <Typography variant="h4" sx={{ mb: 1 }}>
          Résoudre
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Outils de diagnostic et résolution de problèmes PNM
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          }}
        >
          {TOOLS.map((tool) => (
            <Card
              key={tool.href}
              component={RouterLink}
              href={tool.href}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: (theme) => theme.shadows[8], transform: 'translateY(-2px)' },
              }}
            >
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
                <Iconify icon={tool.icon} width={32} sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  {tool.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                  {tool.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main' }}>
                  <Typography variant="body2" fontWeight={500}>
                    Accéder
                  </Typography>
                  <Iconify icon="solar:arrow-right-linear" width={16} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </DashboardLayout>
  );
}
