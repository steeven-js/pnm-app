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
    title: 'Calculateur de dates',
    description:
      "Calculez les dates de portage (JP), fenêtres de bascule et délais d'annulation à partir d'une date de demande.",
    icon: 'solar:calendar-bold-duotone',
    href: '/verify/date-calculator',
    color: '#3b82f6',
    count: 'Jours ouvrés, fériés, vacations',
  },
  {
    title: 'Validateur de RIO',
    description:
      "Validez et décodez un Relevé d'Identité Opérateur : opérateur, qualifiant, référence et clé de contrôle.",
    icon: 'solar:shield-check-bold-duotone',
    href: '/verify/rio-validator',
    color: '#8b5cf6',
    count: 'Format OO-Q-RRRRRR-CCC',
  },
  {
    title: 'Analyseur de fichier PNM',
    description:
      "Analysez le contenu complet d'un fichier PNMDATA ou PNMSYNC : en-tête, tickets, pied de page et validation.",
    icon: 'solar:file-check-bold-duotone',
    href: '/verify/filename-decoder',
    color: '#f59e0b',
    count: 'En-tête, tickets, validation',
  },
  {
    title: "Calculateur d'ID portage",
    description:
      "Générez le hash MD5 d'identification de portage à partir des codes opérateur, date et MSISDN.",
    icon: 'solar:hash-circle-bold-duotone',
    href: '/verify/portage-id',
    color: '#ef4444',
    count: 'Hash MD5 : OPR + OPD + Date + MSISDN',
  },
  {
    title: 'Vérificateur de MSISDN',
    description:
      'Vérifiez un numéro mobile Antilles-Guyane : format, opérateur attributaire et zone géographique.',
    icon: 'solar:phone-bold-duotone',
    href: '/verify/msisdn-checker',
    color: '#10b981',
    count: 'Tranches 069x, opérateurs, zones',
  },
];

export default function VerifyIndex() {
  return (
    <DashboardLayout>
      <Head title="Vérifier" />

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
          <Typography variant="body2">Vérifier</Typography>
        </Breadcrumbs>

        <Typography variant="h4" sx={{ mb: 0.5 }}>
          Vérifier
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Outils et calculateurs pour les opérations PNM
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          }}
        >
          {TOOLS.map((tool) => (
            <Card
              key={tool.href}
              component={RouterLink}
              href={tool.href}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: (theme) => theme.shadows[8], transform: 'translateY(-2px)' },
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
                  <Iconify icon={tool.icon} width={24} />
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {tool.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {tool.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}
                  >
                    {tool.count}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </DashboardLayout>
  );
}
