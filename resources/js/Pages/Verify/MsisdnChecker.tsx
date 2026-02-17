import { useState } from 'react';

import { Head } from '@inertiajs/react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { RouterLink } from 'src/routes/components';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

import type { MsisdnResult } from 'src/lib/pnm-utils';

import { checkMsisdn } from 'src/lib/pnm-utils';

// ----------------------------------------------------------------------

export default function MsisdnChecker() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<MsisdnResult | null>(null);

  function check() {
    if (!input.trim()) return;
    setResult(checkMsisdn(input.trim()));
  }

  return (
    <DashboardLayout>
      <Head title="Vérificateur de MSISDN" />

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
            href="/verify"
            variant="body2"
            color="text.secondary"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Vérifier
          </Typography>
          <Typography variant="body2">Vérificateur MSISDN</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="h4">Vérificateur de MSISDN</Typography>
            <Typography variant="body2" color="text.secondary">
              Vérifiez un numéro mobile Antilles-Guyane : format, opérateur et zone géographique.
            </Typography>
          </Box>

          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Numéro de téléphone
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ex : 0690123456"
                  size="small"
                  sx={{ flex: 1 }}
                  onKeyDown={(e) => e.key === 'Enter' && check()}
                />
                <Button variant="contained" onClick={check} disabled={!input.trim()}>
                  Vérifier
                </Button>
              </Box>
            </CardContent>
          </Card>

          {result && !result.valid && <Alert severity="error">{result.error}</Alert>}

          {result && result.valid && (
            <>
              <Alert severity="success">Numéro valide</Alert>

              <Card sx={{ borderLeft: 3, borderColor: '#10b981' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Informations
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '140px 1fr',
                      gap: 1,
                      alignItems: 'baseline',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">Numéro formaté</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                      {result.formatted}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">Opérateur (OPA)</Typography>
                    <Typography variant="body2" fontWeight={600}>{result.operator}</Typography>

                    <Typography variant="body2" color="text.secondary">Zone</Typography>
                    <Typography variant="body2" fontWeight={600}>{result.zone}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </>
          )}
        </Box>
      </Box>
    </DashboardLayout>
  );
}
