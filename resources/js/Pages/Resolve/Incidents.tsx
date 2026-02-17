import { useState, useRef } from 'react';

import { Head } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import TextField from '@mui/material/TextField';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

import type { ParsedIncidentEmail, ParsedIncident, FilenameResult } from 'src/lib/pnm-utils';

import { parseIncidentEmail, decodeFilename } from 'src/lib/pnm-utils';

// ----------------------------------------------------------------------

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  file_error: { label: 'Erreurs fichier', color: '#ef4444', icon: 'solar:danger-triangle-bold' },
  ar_non_recu: { label: 'AR non reçu', color: '#3b82f6', icon: 'solar:clock-circle-bold' },
  file_not_ack: { label: 'Fichier non acquitté', color: '#f97316', icon: 'solar:file-remove-bold' },
};

export default function IncidentsPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ParsedIncidentEmail | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = () => {
    if (!input.trim()) return;
    setResult(parseIncidentEmail(input));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setInput(text);
      setResult(parseIncidentEmail(text));
    };
    reader.readAsText(file);
  };

  const copyToClipboard = () => {
    if (!result) return;
    const summary = [
      `Incidents : ${result.totalCount}`,
      `Erreurs fichier : ${result.summary.fileErrors}`,
      `Refus : ${result.summary.refusals}`,
      `AR non reçus : ${result.summary.arNonRecu}`,
      `Fichiers non acquittés : ${result.summary.fileNotAck}`,
      `Opérateurs : ${result.operatorsInvolved.join(', ')}`,
      `MSISDN : ${result.msisdnsConcerned.join(', ')}`,
    ].join('\n');
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <Head title="Incidents" />

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
          <Typography variant="body2">Incidents</Typography>
        </Breadcrumbs>

        <Typography variant="h4" sx={{ mb: 1 }}>
          Analyseur d&apos;incidents
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Collez le contenu d&apos;un email d&apos;incident DIGICEL.PORTA-V3 pour l&apos;analyser
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
          {/* Input area */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              multiline
              rows={20}
              fullWidth
              placeholder="Collez ici le contenu de l'email d'incident..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={handleAnalyze}
                disabled={!input.trim()}
                startIcon={<Iconify icon="solar:magnifer-bold" width={18} />}
              >
                Analyser
              </Button>
              <Button
                variant="outlined"
                onClick={() => fileRef.current?.click()}
                startIcon={<Iconify icon="solar:upload-minimalistic-bold" width={18} />}
              >
                Importer un fichier
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.eml"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              {input && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => { setInput(''); setResult(null); }}
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={18} />}
                >
                  Effacer
                </Button>
              )}
            </Box>
          </Box>

          {/* Results area */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {!result ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Iconify icon="solar:letter-linear" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">
                  Collez un email et cliquez sur Analyser
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Summary */}
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {result.totalCount} incident{result.totalCount > 1 ? 's' : ''} détecté{result.totalCount > 1 ? 's' : ''}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={copyToClipboard}
                        startIcon={
                          <Iconify
                            icon={copied ? 'solar:check-circle-bold' : 'solar:copy-linear'}
                            width={16}
                          />
                        }
                      >
                        {copied ? 'Copié' : 'Copier'}
                      </Button>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {result.summary.fileErrors > 0 && (
                        <Chip
                          label={`${result.summary.fileErrors} erreur(s)`}
                          size="small"
                          sx={{ color: '#ef4444', bgcolor: '#fee2e2' }}
                        />
                      )}
                      {result.summary.refusals > 0 && (
                        <Chip
                          label={`${result.summary.refusals} refus`}
                          size="small"
                          sx={{ color: '#dc2626', bgcolor: '#fee2e2' }}
                        />
                      )}
                      {result.summary.arNonRecu > 0 && (
                        <Chip
                          label={`${result.summary.arNonRecu} AR non reçu(s)`}
                          size="small"
                          sx={{ color: '#3b82f6', bgcolor: '#dbeafe' }}
                        />
                      )}
                      {result.summary.fileNotAck > 0 && (
                        <Chip
                          label={`${result.summary.fileNotAck} non acquitté(s)`}
                          size="small"
                          sx={{ color: '#f97316', bgcolor: '#fff7ed' }}
                        />
                      )}
                    </Box>

                    {result.operatorsInvolved.length > 0 && (
                      <Box sx={{ mt: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Opérateurs : {result.operatorsInvolved.join(', ')}
                        </Typography>
                      </Box>
                    )}
                    {result.msisdnsConcerned.length > 0 && (
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          MSISDN : {result.msisdnsConcerned.join(', ')}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Incident cards */}
                {result.incidents.map((incident, idx) => (
                  <IncidentCard key={idx} incident={incident} />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}

// ----------------------------------------------------------------------

function IncidentCard({ incident }: { incident: ParsedIncident }) {
  const cfg = TYPE_CONFIG[incident.type] ?? TYPE_CONFIG.file_error;

  return (
    <Card variant="outlined" sx={{ borderLeft: 4, borderColor: cfg.color }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Iconify icon={cfg.icon} width={18} sx={{ color: cfg.color }} />
          <Chip label={cfg.label} size="small" sx={{ color: cfg.color, bgcolor: `${cfg.color}15` }} />
        </Box>

        <DecodedFilename filename={incident.filename} parsed={incident.filenameParsed} />

        {incident.type === 'file_error' && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="body2">
              {incident.errorCount} erreur(s), {incident.refusalCount} refus
            </Typography>
            {incident.tickets.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {incident.tickets.map((t, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 1,
                      borderRadius: 0.5,
                      bgcolor: 'background.neutral',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                    }}
                  >
                    <Typography variant="caption" fontWeight={600}>
                      {t.code} — {t.codeLabel}
                    </Typography>
                    {t.msisdn && (
                      <Typography variant="caption" display="block">
                        MSISDN : {t.msisdn}
                      </Typography>
                    )}
                    {t.responseCode && (
                      <Typography variant="caption" display="block">
                        Réponse : {t.responseCode} {t.responseCodeLabel && `(${t.responseCodeLabel})`}
                      </Typography>
                    )}
                    {t.errorCode && (
                      <Typography variant="caption" display="block">
                        Erreur : {t.errorCode} {t.errorCodeLabel && `(${t.errorCodeLabel})`}
                      </Typography>
                    )}
                    {t.description && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {t.description}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {incident.type === 'ar_non_recu' && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="body2">
              Envoyé par {incident.senderName} ({incident.senderCode}) depuis {incident.delayMinutes} minutes
            </Typography>
          </Box>
        )}

        {incident.type === 'file_not_ack' && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="body2">
              Non acquitté par {incident.recipientName} ({incident.recipientCode})
            </Typography>
            {incident.errorTicket && (
              <Box
                sx={{
                  mt: 1,
                  p: 1,
                  borderRadius: 0.5,
                  bgcolor: 'background.neutral',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                }}
              >
                <Typography variant="caption" fontWeight={600}>
                  {incident.errorTicket.code} — {incident.errorTicket.codeLabel}
                </Typography>
                {incident.errorTicket.description && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    {incident.errorTicket.description}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

function DecodedFilename({ filename, parsed }: { filename: string; parsed: FilenameResult }) {
  return (
    <Box>
      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
        {filename}
      </Typography>
      {parsed.valid && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
          <Chip label={parsed.sourceOperatorName} size="small" variant="outlined" />
          <Iconify icon="solar:arrow-right-linear" width={14} sx={{ alignSelf: 'center', color: 'text.disabled' }} />
          <Chip label={parsed.destOperatorName} size="small" variant="outlined" />
          <Chip label={parsed.formattedDate} size="small" variant="outlined" />
        </Box>
      )}
    </Box>
  );
}
