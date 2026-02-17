import { Head, usePage } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { RouterLink } from 'src/routes/components';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

import type { PnmCode } from 'src/types';

import { SeverityBadge } from '../components/severity-badge';

// ----------------------------------------------------------------------

const SEVERITY_COLORS: Record<string, string> = {
  info: '#3b82f6',
  warning: '#f59e0b',
  error: '#dc2626',
  critical: '#9333ea',
};

type Props = {
  code: PnmCode;
};

export default function PnmCodeShow() {
  const { code } = usePage().props as unknown as Props;

  const borderColor = SEVERITY_COLORS[code.severity] ?? SEVERITY_COLORS.info;

  return (
    <DashboardLayout>
      <Head title={`Code ${code.code}`} />

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
            href="/resolve/codes"
            variant="body2"
            color="text.secondary"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Codes PNM
          </Typography>
          <Typography variant="body2">{code.code}</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Typography variant="h4" sx={{ fontFamily: 'monospace' }}>
              {code.code}
            </Typography>
            <SeverityBadge severity={code.severity} size="medium" />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            <Chip label={code.category} size="small" variant="outlined" />
            {code.subcategory && <Chip label={code.subcategory} size="small" variant="outlined" />}
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            {code.label}
          </Typography>
        </Box>

        {/* Description */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Description
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                {code.description}
              </Typography>
            </CardContent>
          </Card>

          {/* Probable cause */}
          {code.probable_cause && (
            <Card variant="outlined" sx={{ borderLeft: 4, borderColor }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Cause probable
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                  {code.probable_cause}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Recommended action */}
          {code.recommended_action && (
            <Card variant="outlined" sx={{ borderLeft: 4, borderColor }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Action recommandée
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                  {code.recommended_action}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </DashboardLayout>
  );
}
