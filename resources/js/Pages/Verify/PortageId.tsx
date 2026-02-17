import { useState } from 'react';

import { Head } from '@inertiajs/react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

import { OPERATOR_MAP, computeMd5 } from 'src/lib/pnm-utils';

// ----------------------------------------------------------------------

const operators = Object.entries(OPERATOR_MAP).map(([code, name]) => ({ code, name }));

export default function PortageId() {
  const [opr, setOpr] = useState('');
  const [opd, setOpd] = useState('');
  const [date, setDate] = useState('');
  const [msisdn, setMsisdn] = useState('');
  const [hash, setHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [concatenated, setConcatenated] = useState('');

  const canCalculate = opr && opd && date && msisdn;

  async function calculate() {
    if (!canCalculate) return;
    const input = opr + opd + date + msisdn;
    setConcatenated(input);
    const md5 = await computeMd5(input);
    setHash(md5);
    setCopied(false);
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <DashboardLayout>
      <Head title="Calculateur d'ID portage (MD5)" />

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
          <Typography variant="body2">ID Portage</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="h4">Calculateur d&apos;ID portage</Typography>
            <Typography variant="body2" color="text.secondary">
              Générez le hash MD5 d&apos;identification de portage : MD5(OPR + OPD + DateSouscription + MSISDN).
            </Typography>
          </Box>

          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  select
                  label="Opérateur receveur (OPR)"
                  value={opr}
                  onChange={(e) => setOpr(e.target.value)}
                  size="small"
                >
                  {operators.map((op) => (
                    <MenuItem key={op.code} value={op.code}>
                      {op.code} — {op.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Opérateur donneur (OPD)"
                  value={opd}
                  onChange={(e) => setOpd(e.target.value)}
                  size="small"
                >
                  {operators.map((op) => (
                    <MenuItem key={op.code} value={op.code}>
                      {op.code} — {op.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <TextField
                type="date"
                label="Date de souscription"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <TextField
                label="MSISDN"
                value={msisdn}
                onChange={(e) => setMsisdn(e.target.value)}
                placeholder="Ex : 0690123456"
                size="small"
                onKeyDown={(e) => e.key === 'Enter' && calculate()}
              />

              <Button variant="contained" onClick={calculate} disabled={!canCalculate}>
                Calculer le MD5
              </Button>
            </CardContent>
          </Card>

          {hash && (
            <>
              <Card sx={{ borderLeft: 3, borderColor: '#ef4444' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Chaîne concaténée
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {concatenated}
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ borderLeft: 3, borderColor: '#ef4444' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Hash MD5 (ID portage)
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontFamily: 'monospace', fontWeight: 700, wordBreak: 'break-all', flex: 1 }}
                    >
                      {hash}
                    </Typography>
                    <Tooltip title={copied ? 'Copié !' : 'Copier'}>
                      <IconButton onClick={copyToClipboard} size="small">
                        <Iconify
                          icon={copied ? 'solar:check-circle-bold' : 'solar:copy-linear'}
                          width={18}
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>

              <Alert severity="info">
                Le hash est calculé entièrement côté client — aucune donnée n&apos;est envoyée au serveur.
              </Alert>
            </>
          )}
        </Box>
      </Box>
    </DashboardLayout>
  );
}
