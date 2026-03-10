import { useState, useRef } from 'react';

import { Head } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import TextField from '@mui/material/TextField';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

import type { ParsedIncidentEmail, ParsedIncident, FilenameResult, IncidentTicket, ParsedDapiView, DapiTicketLine, LogAnalysis, LogEntry } from 'src/lib/pnm-utils';

import { parseIncidentEmail, decodeFilename, parseDapiView, parseLogOutput, TICKET_TYPE_MAP } from 'src/lib/pnm-utils';

import { lookupCode } from 'src/lib/pnm-code-dictionary';

// ----------------------------------------------------------------------

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  file_error: { label: 'Erreurs fichier', color: '#ef4444', icon: 'solar:danger-triangle-bold' },
  ar_non_recu: { label: 'AR non reçu', color: '#3b82f6', icon: 'solar:clock-circle-bold' },
  file_not_ack: { label: 'Fichier non acquitté', color: '#f97316', icon: 'solar:file-remove-bold' },
};

const SFTP_OPERATORS: Record<string, string> = {
  '01': 'Orange Caraibe',
  '02': 'Digicel',
  '03': 'SFR / Outremer',
  '04': 'Dauphin Telecom',
  '05': 'UTS Caraibe',
  '06': 'Free Caraibes',
};

const SFTP_HOST = 'sftp://porta_pnmv3@172.24.119.69';
const SFTP_BASE = '/home/porta_pnmv3/PortaSync/pnmdata';

function getSftpLocation(incident: ParsedIncident): { folder: string; sub: string; arch: string; label: string } | null {
  const fp = incident.filenameParsed;
  if (!fp.valid) return null;
  if (fp.sourceOperator === '02') {
    return { folder: fp.destOperator, sub: 'send', arch: 'arch_send', label: `${SFTP_OPERATORS[fp.destOperator] ?? fp.destOperator} (envoi)` };
  }
  return { folder: fp.sourceOperator, sub: 'recv', arch: 'arch_recv', label: `${SFTP_OPERATORS[fp.sourceOperator] ?? fp.sourceOperator} (reception)` };
}

export default function IncidentsPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ParsedIncidentEmail | null>(null);
  const [dapiResult, setDapiResult] = useState<ParsedDapiView | null>(null);
  const [logResult, setLogResult] = useState<LogAnalysis | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = () => {
    if (!input.trim()) return;
    setDapiResult(parseDapiView(input));
    setLogResult(parseLogOutput(input));
    setResult(parseIncidentEmail(input));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setInput(text);
      setDapiResult(parseDapiView(text));
      setLogResult(parseLogOutput(text));
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
          Collez le contenu d&apos;un email d&apos;incident DIGICEL.PORTA-V3 ou d&apos;une vue DAPI PortaWs pour l&apos;analyser
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
                  onClick={() => { setInput(''); setResult(null); setDapiResult(null); setLogResult(null); }}
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={18} />}
                >
                  Effacer
                </Button>
              )}
            </Box>
          </Box>

          {/* Results area */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {!result && !dapiResult && !logResult ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Iconify icon="solar:letter-linear" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">
                  Collez un email d&apos;incident ou une vue DAPI PortaWs et cliquez sur Analyser
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* DAPI Analysis */}
                {dapiResult && <DapiAnalysisCard dapi={dapiResult} />}

                {/* Log Analysis */}
                {logResult && <LogAnalysisCard log={logResult} />}

                {/* Email Incident Summary */}
                {result && result.totalCount > 0 && <Card variant="outlined">
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
                </Card>}

                {/* Incident cards */}
                {result && result.incidents.map((incident, idx) => (
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

// ----------------------------------------------------------------------

const LOG_IMPACT_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  none: { color: '#10b981', icon: 'solar:check-circle-bold', label: 'Aucun impact' },
  minor: { color: '#f59e0b', icon: 'solar:info-circle-bold', label: 'Impact mineur' },
  major: { color: '#ef4444', icon: 'solar:danger-triangle-bold', label: 'Impact majeur' },
  critical: { color: '#dc2626', icon: 'solar:shield-warning-bold', label: 'Impact critique' },
};

const LOG_ENTRY_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  generation: { color: '#10b981', icon: 'solar:file-bold', label: 'Génération' },
  acr_received: { color: '#3b82f6', icon: 'solar:inbox-in-bold', label: 'ACR reçu' },
  archival: { color: '#8b5cf6', icon: 'solar:archive-bold', label: 'Archivage' },
  not_found: { color: '#ef4444', icon: 'solar:close-circle-bold', label: 'NOT FOUND' },
  ls_not_found: { color: '#ef4444', icon: 'solar:folder-error-bold', label: 'Fichier absent' },
  ls_found: { color: '#10b981', icon: 'solar:folder-check-bold', label: 'Fichier trouvé' },
  other: { color: '#6b7280', icon: 'solar:document-bold', label: 'Autre' },
};

function LogAnalysisCard({ log }: { log: LogAnalysis }) {
  const impactCfg = LOG_IMPACT_CONFIG[log.diagnosis.impactLevel] ?? LOG_IMPACT_CONFIG.minor;

  return (
    <Card variant="outlined" sx={{ borderLeft: 4, borderColor: impactCfg.color }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Iconify icon="solar:server-bold" width={20} sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle1" fontWeight={700}>
            Analyse des logs serveur
          </Typography>
          <Chip
            label={impactCfg.label}
            size="small"
            sx={{ color: impactCfg.color, bgcolor: `${impactCfg.color}15` }}
            icon={<Iconify icon={impactCfg.icon} width={14} sx={{ color: `${impactCfg.color} !important` }} />}
          />
        </Box>

        {/* File info */}
        {log.filename && (
          <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.neutral', mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Fichier analysé</Typography>
            <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace' }}>{log.filename}</Typography>
            {log.filenameParsed?.valid && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                <Chip label={log.filenameParsed.sourceOperatorName} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.65rem' }} />
                <Iconify icon="solar:arrow-right-linear" width={14} sx={{ alignSelf: 'center', color: 'text.disabled' }} />
                <Chip label={log.filenameParsed.destOperatorName} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.65rem' }} />
                {log.ticketCount && <Chip label={`${log.ticketCount} tickets`} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.65rem' }} />}
              </Box>
            )}
          </Box>
        )}

        {/* Timeline */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
            <Iconify icon="solar:timeline-up-bold" width={16} sx={{ color: 'info.main' }} />
            <Typography variant="subtitle2" color="info.main">
              Chronologie ({log.entries.length} entrées)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {log.timeline.map((entry, i) => {
              const cfg = LOG_ENTRY_CONFIG[entry.type] ?? LOG_ENTRY_CONFIG.other;
              return (
                <Box key={i} sx={{ display: 'flex', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.5 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: cfg.color, flexShrink: 0 }} />
                    {i < log.timeline.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: 'divider', mt: 0.5 }} />}
                  </Box>
                  <Box sx={{ flex: 1, p: 1, borderRadius: 1, bgcolor: entry.type === 'not_found' || entry.type === 'ls_not_found' ? '#fef2f2' : 'background.neutral', mb: 0.25 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25, flexWrap: 'wrap' }}>
                      <Iconify icon={cfg.icon} width={14} sx={{ color: cfg.color }} />
                      <Chip label={cfg.label} size="small" sx={{ fontSize: '0.65rem', height: 20, color: cfg.color, bgcolor: `${cfg.color}15` }} />
                      {entry.timestamp && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {entry.timestamp}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="caption" display="block" sx={{ fontWeight: 600 }}>
                      {entry.detail}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Diagnosis */}
        <Divider sx={{ mb: 1.5 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
          <Iconify icon="solar:stethoscope-bold" width={16} sx={{ color: impactCfg.color }} />
          <Typography variant="subtitle2" sx={{ color: impactCfg.color }}>
            Diagnostic
          </Typography>
        </Box>

        <Box sx={{ p: 1.25, borderRadius: 1, bgcolor: log.diagnosis.impactLevel === 'minor' || log.diagnosis.impactLevel === 'none' ? '#f0fdf4' : '#fef2f2', mb: 1.5 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            {log.diagnosis.summary}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            {log.diagnosis.impact}
          </Typography>
        </Box>

        {/* Status indicators */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          <Chip
            icon={<Iconify icon={log.wasGenerated ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} width={14} />}
            label={log.wasGenerated ? 'Généré' : 'Non généré'}
            size="small"
            color={log.wasGenerated ? 'success' : 'error'}
            variant="outlined"
            sx={{ height: 24 }}
          />
          <Chip
            icon={<Iconify icon={log.acrReceived ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} width={14} />}
            label={log.acrReceived ? `ACR ${log.acrCode}` : 'Pas d\'ACR'}
            size="small"
            color={log.acrReceived && log.acrCode === 'E000' ? 'success' : log.acrReceived ? 'warning' : 'error'}
            variant="outlined"
            sx={{ height: 24 }}
          />
          <Chip
            icon={<Iconify icon={log.archivalFailed ? 'solar:danger-triangle-bold' : 'solar:check-circle-bold'} width={14} />}
            label={log.archivalFailed ? 'Archivage échoué' : 'Archivé'}
            size="small"
            color={log.archivalFailed ? 'warning' : 'success'}
            variant="outlined"
            sx={{ height: 24 }}
          />
        </Box>

        {/* Actions */}
        {log.diagnosis.actions.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
              <Iconify icon="solar:lightbulb-bolt-bold" width={16} sx={{ color: '#f59e0b' }} />
              <Typography variant="subtitle2" sx={{ color: '#f59e0b' }}>
                Actions recommandées
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {log.diagnosis.actions.map((action, i) => (
                <Box key={i} sx={{ p: 1, borderRadius: 0.75, bgcolor: 'background.neutral', display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: 'primary.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0, mt: 0.1 }}>
                    {i + 1}
                  </Box>
                  <Typography variant="caption">{action}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

const DAPI_DIRECTION_COLORS: Record<string, string> = {
  in: '#3b82f6',
  out: '#10b981',
  internal: '#f59e0b',
};

const DAPI_DIRECTION_ICONS: Record<string, string> = {
  in: 'solar:inbox-in-bold',
  out: 'solar:inbox-out-bold',
  internal: 'solar:settings-bold',
};

function DapiAnalysisCard({ dapi }: { dapi: ParsedDapiView }) {
  const { portage, tickets, errors, diagnosis } = dapi;

  return (
    <Card variant="outlined" sx={{ borderLeft: 4, borderColor: diagnosis.hasError ? '#ef4444' : '#10b981' }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Iconify icon="solar:clipboard-text-bold" width={20} sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle1" fontWeight={700}>
            Analyse DAPI PortaWs
          </Typography>
          {diagnosis.hasError && (
            <Chip label="Erreur détectée" size="small" sx={{ color: '#ef4444', bgcolor: '#fee2e2' }} />
          )}
        </Box>

        {/* Portage info */}
        <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.neutral', mb: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
            {portage.msisdn && (
              <Box>
                <Typography variant="caption" color="text.secondary">MSISDN</Typography>
                <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace' }}>{portage.msisdn}</Typography>
              </Box>
            )}
            {portage.procedure && (
              <Box>
                <Typography variant="caption" color="text.secondary">Procédure</Typography>
                <Typography variant="body2" fontWeight={600}>{portage.procedure}</Typography>
              </Box>
            )}
            {portage.etat && (
              <Box>
                <Typography variant="caption" color="text.secondary">État</Typography>
                <Chip label={portage.etat} size="small" variant="outlined" />
              </Box>
            )}
            {portage.datePortage && (
              <Box>
                <Typography variant="caption" color="text.secondary">Date portage</Typography>
                <Typography variant="body2">{portage.datePortage}</Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {portage.receveur && (
              <Box>
                <Typography variant="caption" color="text.secondary">Receveur</Typography>
                <Typography variant="body2">{portage.receveur}</Typography>
              </Box>
            )}
            {portage.donneur && (
              <Box>
                <Typography variant="caption" color="text.secondary">Donneur</Typography>
                <Typography variant="body2">{portage.donneur}</Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Ticket timeline */}
        {tickets.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
              <Iconify icon="solar:timeline-up-bold" width={16} sx={{ color: 'info.main' }} />
              <Typography variant="subtitle2" color="info.main">
                Chronologie des tickets ({tickets.length})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {tickets.map((t, i) => (
                <DapiTicketRow key={i} ticket={t} index={i} isLast={i === tickets.length - 1} />
              ))}
            </Box>
          </Box>
        )}

        {/* Diagnosis */}
        <Divider sx={{ mb: 1.5 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
          <Iconify icon="solar:stethoscope-bold" width={16} sx={{ color: diagnosis.hasError ? '#ef4444' : '#10b981' }} />
          <Typography variant="subtitle2" sx={{ color: diagnosis.hasError ? '#ef4444' : '#10b981' }}>
            Diagnostic
          </Typography>
        </Box>

        <Box sx={{ p: 1.25, borderRadius: 1, bgcolor: diagnosis.hasError ? '#fef2f2' : '#f0fdf4', mb: 1.5 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            {diagnosis.summary}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            {diagnosis.currentState}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            {diagnosis.expectedNextStep}
          </Typography>
        </Box>

        {/* Solutions */}
        {diagnosis.solutions.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
              <Iconify icon="solar:lightbulb-bolt-bold" width={16} sx={{ color: '#f59e0b' }} />
              <Typography variant="subtitle2" sx={{ color: '#f59e0b' }}>
                Solutions potentielles
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {diagnosis.solutions.map((sol, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 1,
                    borderRadius: 0.75,
                    bgcolor: sol.startsWith('→') ? 'background.neutral' : '#fffbeb',
                    borderLeft: sol.startsWith('→') ? 0 : 3,
                    borderColor: '#f59e0b',
                    ml: sol.startsWith('→') ? 2 : 0,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: sol.startsWith('→') ? 400 : 600 }}>
                    {sol}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Error code dictionary entries */}
        {diagnosis.errorCodes.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 1.5 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
              <Iconify icon="solar:book-bold" width={16} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle2" color="primary.main">
                Référence codes erreur
              </Typography>
            </Box>
            {diagnosis.errorCodes.map((code) => {
              const entry = lookupCode(code);
              if (!entry) return (
                <Box key={code} sx={{ p: 1, borderRadius: 0.75, bgcolor: 'background.neutral', mb: 0.5 }}>
                  <Typography variant="caption" fontWeight={700}>{code}</Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Code non référencé dans le dictionnaire PNM
                  </Typography>
                </Box>
              );
              const sevColor = SEVERITY_COLORS[entry.severity] ?? '#6b7280';
              return (
                <Box key={code} sx={{ p: 1, borderRadius: 0.75, bgcolor: `${sevColor}10`, borderLeft: 3, borderColor: sevColor, mb: 0.5 }}>
                  <Typography variant="caption" fontWeight={700} sx={{ color: sevColor }}>
                    {entry.code} — {entry.label}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
                    {entry.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                    <Iconify icon="solar:lightbulb-bolt-bold" width={14} sx={{ color: '#f59e0b', mt: 0.25, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                      {entry.action}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function DapiTicketRow({ ticket, index, isLast }: { ticket: DapiTicketLine; index: number; isLast: boolean }) {
  const color = ticket.code === '7000' || ticket.errorCode
    ? '#ef4444'
    : DAPI_DIRECTION_COLORS[ticket.direction] ?? '#6b7280';
  const icon = ticket.code === '7000'
    ? 'solar:danger-triangle-bold'
    : DAPI_DIRECTION_ICONS[ticket.direction] ?? 'solar:document-bold';

  return (
    <Box sx={{ display: 'flex', gap: 1.5 }}>
      {/* Timeline dot + line */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.5 }}>
        <Box
          sx={{
            width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0,
          }}
        />
        {!isLast && <Box sx={{ width: 2, flex: 1, bgcolor: 'divider', mt: 0.5 }} />}
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1, p: 1, borderRadius: 1, bgcolor: ticket.code === '7000' ? '#fef2f2' : 'background.neutral',
          mb: 0.25,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25, flexWrap: 'wrap' }}>
          <Iconify icon={icon} width={14} sx={{ color }} />
          <Chip
            label={`${ticket.code} ${ticket.codeLabel}`}
            size="small"
            sx={{ fontSize: '0.65rem', height: 20, color, bgcolor: `${color}15` }}
          />
          <Chip
            label={ticket.directionLabel}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.65rem', height: 20 }}
          />
          {ticket.sequence && (
            <Typography variant="caption" color="text.secondary">
              seq. {ticket.sequence}
            </Typography>
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" display="block">
          {ticket.dateTime}
        </Typography>

        {ticket.filename && (
          <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', fontWeight: 600, mt: 0.25 }}>
            {ticket.filename}
          </Typography>
        )}

        {ticket.errorCode && (
          <Box sx={{ mt: 0.5, p: 0.75, borderRadius: 0.5, bgcolor: '#fee2e2' }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: '#ef4444' }}>
              {ticket.errorCode}
            </Typography>
            {ticket.errorDetail && (
              <Typography variant="caption" display="block" sx={{ mt: 0.25 }}>
                {ticket.errorDetail}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
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
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {incident.tickets.map((t, i) => (
                  <TicketDetail key={i} ticket={t} />
                ))}
              </Box>
            )}
            <InvestigationPanel type="file_error" incident={incident} />
          </Box>
        )}

        {incident.type === 'ar_non_recu' && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="body2">
              Envoyé par {incident.senderName} ({incident.senderCode}) depuis {incident.delayMinutes} minutes
            </Typography>
            <InvestigationPanel type="ar_non_recu" incident={incident} />
          </Box>
        )}

        {incident.type === 'file_not_ack' && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="body2">
              Non acquitté par {incident.recipientName} ({incident.recipientCode})
            </Typography>
            {incident.errorTicket && (
              <TicketDetail ticket={incident.errorTicket} />
            )}
            <InvestigationPanel type="file_not_ack" incident={incident} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

const SEVERITY_COLORS: Record<string, string> = {
  info: '#3b82f6',
  warning: '#f59e0b',
  error: '#ef4444',
  critical: '#dc2626',
};

function TicketDetail({ ticket }: { ticket: IncidentTicket }) {
  const actionCode = ticket.responseCode || ticket.errorCode;
  const dictEntry = actionCode ? lookupCode(actionCode) : null;
  const sevColor = dictEntry ? SEVERITY_COLORS[dictEntry.severity] ?? '#6b7280' : undefined;

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1,
        bgcolor: 'background.neutral',
        fontSize: '0.75rem',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Typography variant="caption" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
          {ticket.code} — {ticket.codeLabel}
        </Typography>
      </Box>

      {ticket.msisdn && (
        <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace' }}>
          MSISDN : {ticket.msisdn}
        </Typography>
      )}
      {ticket.responseCode && (
        <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace' }}>
          Réponse : <Box component="span" sx={{ fontWeight: 700, color: sevColor }}>{ticket.responseCode}</Box> {ticket.responseCodeLabel && `— ${ticket.responseCodeLabel}`}
        </Typography>
      )}
      {ticket.errorCode && (
        <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace' }}>
          Erreur : <Box component="span" sx={{ fontWeight: 700, color: sevColor }}>{ticket.errorCode}</Box> {ticket.errorCodeLabel && `— ${ticket.errorCodeLabel}`}
        </Typography>
      )}
      {ticket.description && (
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.25 }}>
          {ticket.description}
        </Typography>
      )}

      {dictEntry && (
        <Box sx={{ mt: 1, p: 1, borderRadius: 0.75, bgcolor: `${sevColor}10`, borderLeft: 3, borderColor: sevColor }}>
          <Typography variant="caption" display="block" sx={{ fontWeight: 600, color: sevColor, mb: 0.25 }}>
            {dictEntry.label}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
            {dictEntry.description}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
            <Iconify icon="solar:lightbulb-bolt-bold" width={14} sx={{ color: '#f59e0b', mt: 0.25, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {dictEntry.action}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

type InvestigationStep = {
  icon: string;
  label: string;
  detail: string;
  command?: string;
};

function getInvestigationSteps(type: string, incident: ParsedIncident): InvestigationStep[] {
  if (type === 'file_error') {
    const hasRefusal = 'refusalCount' in incident && (incident as any).refusalCount > 0;
    const hasError = 'errorCount' in incident && (incident as any).errorCount > 0;
    const steps: InvestigationStep[] = [];

    if (hasRefusal) {
      steps.push(
        {
          icon: 'solar:magnifer-bold',
          label: 'Vérifier le dossier dans PortaWs',
          detail: `Rechercher le(s) MSISDN concerné(s) dans PortaWs (172.24.119.72:8080) → Supervision → Liste des mandats. Vérifier l'état du portage et l'historique.`,
        },
        {
          icon: 'solar:card-search-bold',
          label: 'Contrôler le RIO si refus R1xx',
          detail: `Si le motif est lié au RIO (R101/R102/R103/R123), vérifier le RIO via l'outil Vérifier → RIO Validator. Demander au client un nouveau RIO (appeler le 3179).`,
        },
        {
          icon: 'solar:user-speak-bold',
          label: 'Informer le commercial / client',
          detail: `Selon le motif de refus : résiliation (R322/R502) → numéro perdu, engagement (R202) → attendre fin engagement, RIO (R1xx) → relancer avec bon RIO. Transmettre le motif de refus au commercial.`,
        },
      );
    }

    if (hasError) {
      steps.push(
        {
          icon: 'solar:file-check-bold',
          label: 'Analyser le fichier PNMDATA',
          detail: `Utiliser l'outil Vérifier → Décodeur de fichiers pour analyser le fichier ${incident.filename}. Vérifier les colonnes opérateur, les hash MD5 et les timestamps.`,
        },
        {
          icon: 'solar:server-bold',
          label: 'Consulter les logs PORTA',
          detail: 'Vérifier les logs de traitement sur vmqproportasync01 pour identifier la cause technique.',
          command: `tail -n 50 /home/porta_pnmv3/PortaSync/log/PnmDataManager.log`,
        },
        {
          icon: 'solar:phone-calling-bold',
          label: "Contacter l'opérateur émetteur",
          detail: `Si l'erreur provient du fichier reçu, contacter l'opérateur émetteur pour signaler le problème. Fournir le nom du fichier et le détail de l'erreur.`,
        },
      );
    }

    steps.push({
      icon: 'solar:clipboard-list-bold',
      label: 'Documenter et suivre',
      detail: 'Si non résolu immédiatement : noter dans les notes du monitoring, créer un ticket de suivi si > 24h. Si récurrent avec le même opérateur ou le même motif, escalader vers le GPMAG.',
    });

    return steps;
  }

  if (type === 'ar_non_recu') {
    return [
      {
        icon: 'solar:server-bold',
        label: 'Vérifier PnmAckManager.log',
        detail: `Vérifier si l'AR est arrivé entre-temps dans les logs d'acquittement.`,
        command: `tail -n 50 /home/porta_pnmv3/PortaSync/log/PnmAckManager.log`,
      },
      {
        icon: 'solar:folder-check-bold',
        label: 'Vérifier le répertoire SFTP',
        detail: `Vérifier que le fichier a bien été déposé dans le répertoire d'envoi de l'opérateur destinataire (send/). Si absent, vérifier dans arch_send/.`,
        command: `ls -la /home/porta_pnmv3/PortaSync/pnmdata/${incident.filenameParsed?.valid ? incident.filenameParsed.destOperator : 'XX'}/send/`,
      },
      {
        icon: 'solar:refresh-bold',
        label: "Vérifier l'arrivée différée",
        detail: `L'AR peut arriver avec retard. Revérifier après la prochaine vacation (toutes les ~4-5h). Si l'AR arrive, le ticket 0000/E011 sera automatiquement clos.`,
      },
      {
        icon: 'solar:phone-calling-bold',
        label: "Contacter l'opérateur",
        detail: `Si l'AR n'arrive toujours pas après 2 vacations : contacter l'opérateur destinataire par email en indiquant le nom du fichier ${incident.filename} et l'heure d'envoi.`,
      },
      {
        icon: 'solar:danger-triangle-bold',
        label: 'Escalader si récurrent',
        detail: `Si cet opérateur accumule les AR en retard (> 3 fois/semaine), signaler au GPMAG avec les dates et fichiers concernés.`,
      },
    ];
  }

  if (type === 'file_not_ack') {
    return [
      {
        icon: 'solar:server-bold',
        label: 'Vérifier les logs d\'envoi',
        detail: `Vérifier dans PnmDataManager.log que le fichier a bien été généré et envoyé.`,
        command: `grep "${incident.filename}" /home/porta_pnmv3/PortaSync/log/PnmDataManager.log`,
      },
      {
        icon: 'solar:folder-check-bold',
        label: 'Vérifier le dépôt SFTP',
        detail: `Confirmer que le fichier est bien présent dans le répertoire d'envoi de l'opérateur (send/). Si absent, vérifier dans arch_send/.`,
        command: `ls -la /home/porta_pnmv3/PortaSync/pnmdata/${incident.filenameParsed?.valid ? incident.filenameParsed.destOperator : 'XX'}/send/${incident.filename}*`,
      },
      {
        icon: 'solar:shield-check-bold',
        label: 'Vérifier PnmAckManager.log',
        detail: 'Chercher si un AR a été reçu tardivement pour ce fichier.',
        command: `grep "${incident.filename}" /home/porta_pnmv3/PortaSync/log/PnmAckManager.log`,
      },
      {
        icon: 'solar:phone-calling-bold',
        label: `Contacter ${'recipientName' in incident ? (incident as any).recipientName : 'l\'opérateur'}`,
        detail: `Envoyer un email à ${'recipientName' in incident ? (incident as any).recipientName : 'l\'opérateur'} (${'recipientCode' in incident ? (incident as any).recipientCode : '??'}) pour vérifier la réception du fichier. Joindre le nom du fichier et demander le renvoi de l'AR.`,
      },
      {
        icon: 'solar:danger-triangle-bold',
        label: 'Escalader si persistant',
        detail: 'Si le fichier n\'est toujours pas acquitté après 24h et que l\'opérateur ne répond pas, escalader au GPMAG en fournissant les détails : fichier, date d\'envoi, opérateur destinataire.',
      },
    ];
  }

  return [];
}

function InvestigationPanel({ type, incident }: { type: string; incident: ParsedIncident }) {
  const [copied, setCopied] = useState<string | null>(null);
  const steps = getInvestigationSteps(type, incident);
  const sftp = getSftpLocation(incident);

  if (steps.length === 0) return null;

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(cmd);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ mb: 1.5 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
        <Iconify icon="solar:checklist-bold" width={16} sx={{ color: 'primary.main' }} />
        <Typography variant="subtitle2" color="primary.main">
          Procédure d&apos;investigation
        </Typography>
      </Box>

      {/* SFTP folder structure */}
      <Box sx={{ mb: 1.5, p: 1.25, borderRadius: 1, border: '1px dashed', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
          <Iconify icon="solar:folder-with-files-bold" width={15} sx={{ color: 'info.main' }} />
          <Typography variant="caption" fontWeight={700} sx={{ color: 'info.main' }}>
            Localisation SFTP (FileZilla)
          </Typography>
        </Box>

        <Box
          sx={{
            p: 0.75,
            borderRadius: 0.5,
            bgcolor: 'grey.900',
            color: '#4ade80',
            fontFamily: 'monospace',
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            mb: 1,
          }}
        >
          <code>{SFTP_HOST}</code>
          <Button
            size="small"
            onClick={() => handleCopy(SFTP_HOST)}
            sx={{ minWidth: 'auto', p: 0.25, color: copied === SFTP_HOST ? '#4ade80' : 'grey.500' }}
          >
            <Iconify icon={copied === SFTP_HOST ? 'solar:check-circle-bold' : 'solar:copy-linear'} width={14} />
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontFamily: 'monospace', mb: 0.75 }}>
          {SFTP_BASE}/
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.75 }}>
          {Object.entries(SFTP_OPERATORS).map(([code, name]) => (
            <Chip
              key={code}
              label={`${code} ${name}`}
              size="small"
              variant={sftp?.folder === code ? 'soft' : 'outlined'}
              color={sftp?.folder === code ? 'primary' : 'default'}
              sx={{ fontSize: '0.65rem', height: 22 }}
            />
          ))}
        </Box>

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
          Sous-dossiers de chaque operateur :
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: sftp ? 1 : 0 }}>
          {['send', 'recv', 'arch_send', 'arch_recv'].map((f) => (
            <Chip
              key={f}
              label={`${f}/`}
              size="small"
              variant={sftp?.sub === f ? 'soft' : 'outlined'}
              color={sftp?.sub === f ? 'info' : 'default'}
              sx={{ fontSize: '0.65rem', height: 22, fontFamily: 'monospace' }}
            />
          ))}
        </Box>

        {sftp && (
          <Box sx={{ p: 0.75, borderRadius: 0.5, bgcolor: 'primary.lighter', display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Iconify icon="solar:arrow-right-bold" width={14} sx={{ color: 'primary.main', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
              pnmdata/{sftp.folder}/{sftp.sub}/{incident.filename}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              (si absent : {sftp.arch}/)
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {steps.map((step, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              gap: 1.5,
              p: 1.25,
              borderRadius: 1,
              bgcolor: 'background.neutral',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', pt: 0.25 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </Box>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                <Iconify icon={step.icon} width={14} sx={{ color: 'text.secondary' }} />
                <Typography variant="caption" fontWeight={700}>
                  {step.label}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" display="block">
                {step.detail}
              </Typography>
              {step.command && (
                <Box
                  sx={{
                    mt: 0.75,
                    p: 0.75,
                    borderRadius: 0.5,
                    bgcolor: 'grey.900',
                    color: '#4ade80',
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <Box component="code" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    $ {step.command}
                  </Box>
                  <Button
                    size="small"
                    onClick={() => handleCopy(step.command!)}
                    sx={{ minWidth: 'auto', p: 0.25, color: copied === step.command ? '#4ade80' : 'grey.500' }}
                  >
                    <Iconify icon={copied === step.command ? 'solar:check-circle-bold' : 'solar:copy-linear'} width={14} />
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
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
