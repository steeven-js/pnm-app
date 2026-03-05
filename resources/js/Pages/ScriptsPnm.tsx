import { Head } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { DashboardLayout } from 'src/layouts/dashboard/layout';

// ─── Types ──────────────────────────────────────────────────────────────────

type PortaSyncScript = {
  name: string;
  description: string;
  disabled?: boolean;
};

// ─── Data ───────────────────────────────────────────────────────────────────

const PORTASYNC_SCRIPTS: PortaSyncScript[] = [
  {
    name: 'EmaExtracter.sh',
    description:
      'Traitement bascule + generation fichier routage + envoi EMA pour MAJ FNR',
  },
  {
    name: 'EmmExtracter.sh',
    description:
      'Generation et envoi fichier MSISDN portes vers l\'EMM',
  },
  {
    name: 'PnmDataManager.sh',
    description: 'Generation des fichiers de vacation PNMDATA',
  },
  {
    name: 'PnmDataAckManager.sh',
    description:
      'Integration des fichiers PNMDATA + generation acquittements',
  },
  {
    name: 'PnmDataAckGenerator.sh',
    description:
      'Verification acquittements + generation fichiers d\'erreur',
  },
  {
    name: 'PnmSyncManager.sh',
    description:
      'Generation des fichiers de synchronisation PNMSYNC',
  },
  {
    name: 'PnmSyncAckManager.sh',
    description: 'Integration PNMSYNC + generation acquittements',
  },
  {
    name: 'PnmMerger.sh',
    description: 'Merge de fichier',
    disabled: true,
  },
  {
    name: 'PnmSpliter.sh',
    description: 'Split de fichier',
    disabled: true,
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function ScriptsPnm() {
  return (
    <DashboardLayout>
      <Head title="Scripts PortaSync" />

      <Box sx={{ p: { xs: 3, md: 5 } }}>
        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4">Scripts PortaSync</Typography>
          <Typography sx={{ mt: 1, color: 'text.secondary' }}>
            Documentation des scripts de synchronisation PortaSync sur le serveur PNM.
          </Typography>
        </Box>

        {/* Server info */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
                <Iconify icon="solar:server-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
                <Box>
                  <Typography variant="subtitle2">Serveur</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>vmqproportawebdb01</Typography>
                </Box>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
                <Iconify icon="solar:folder-bold-duotone" width={24} sx={{ color: 'warning.main' }} />
                <Box>
                  <Typography variant="subtitle2">Repertoire scripts</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                    /opt/portasync/
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          {PORTASYNC_SCRIPTS.length} scripts documentes
        </Typography>

        <Stack spacing={2}>
          {PORTASYNC_SCRIPTS.map((script) => (
            <Card key={script.name} variant="outlined" sx={{ opacity: script.disabled ? 0.6 : 1 }}>
              <CardContent sx={{ pb: '16px !important' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 280 }}>
                    <Iconify
                      icon="solar:file-bold-duotone"
                      width={20}
                      sx={{ color: script.disabled ? 'text.disabled' : 'primary.main' }}
                    />
                    <Typography
                      variant="subtitle1"
                      sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                    >
                      {script.name}
                    </Typography>
                    {script.disabled && (
                      <Chip label="non utilise" size="small" color="default" variant="outlined" />
                    )}
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary', flex: 1 }}>
                    {script.description}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </DashboardLayout>
  );
}
