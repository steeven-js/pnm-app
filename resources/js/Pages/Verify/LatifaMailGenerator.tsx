import { useState, useMemo } from 'react';

import { Head } from '@inertiajs/react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import { RouterLink } from 'src/routes/components';
import { Iconify } from 'src/components/iconify';
import { DashboardLayout } from 'src/layouts/dashboard/layout';

import { subtractBusinessDays, addBusinessDays } from 'src/lib/pnm-utils';

// ----------------------------------------------------------------------

/**
 * Calendrier PNM standard JD+2 jours ouvrés (Échanges Inter Opérateurs)
 *
 * Pour un portage simple (OPR → OPD) :
 *   JD   : 1110 envoyé par OPR aux vacations V1(10h), V2(14h), V3(19h)
 *   JD+1 : 1210/1220 réponse attendue de OPD aux vacations V1(10h), V2(14h), V3(19h)
 *   JP   : Bascule (8h30-10h) puis 1430 confirmations
 *
 * La deadline pour recevoir la réponse 12XX est la fin de la dernière
 * vacation de JD+1 : 19h00.
 */

type ParsedEntry = {
  msisdn: string;
  status: string;
  portageDate: string; // DD/MM/YYYY
  portageDateObj: Date;
  ticketCode: string;
  emissionDate: string; // human readable
  emissionDateObj: Date | null;
  pnmdataFile: string | null;
  jd: Date;
  jd1: Date;
};

type DeadlineInfo = {
  label: string;
  dateTime: Date;
  passed: boolean;
};

type AnalysisResult = {
  entry: ParsedEntry;
  deadlines: DeadlineInfo[];
  isOverdue: boolean;
  shouldEmail: boolean;
};

// ── Parsing ──

function parsePortageDate(str: string): Date {
  // "25/03/2026" → Date
  const [d, m, y] = str.split('/');
  return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
}

function parseEmissionDate(str: string): Date | null {
  // "Le lundi 23 mars 2026 à 16:16:03"
  const months: Record<string, number> = {
    janvier: 0, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
    juillet: 6, août: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11,
  };

  const match = str.match(/(\d{1,2})\s+(\w+)\s+(\d{4})\s+à\s+(\d{2}):(\d{2}):(\d{2})/);
  if (!match) return null;

  const [, day, monthStr, year, h, min, sec] = match;
  const monthNum = months[monthStr.toLowerCase()];
  if (monthNum === undefined) return null;

  return new Date(parseInt(year, 10), monthNum, parseInt(day, 10),
    parseInt(h, 10), parseInt(min, 10), parseInt(sec, 10));
}

function parseInput(text: string): ParsedEntry[] {
  const entries: ParsedEntry[] = [];
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  let current: Partial<ParsedEntry> | null = null;

  for (const line of lines) {
    // Line: "- Msisdn : 0690660054 (En cours) - Portage prévu le 25/03/2026 - Clôturer ce portage"
    const msisdnMatch = line.match(
      /Msisdn\s*:\s*(\d+)\s*\(([^)]+)\)\s*-\s*Portage prévu le (\d{2}\/\d{2}\/\d{4})/i,
    );
    if (msisdnMatch) {
      // Save previous entry if exists
      if (current?.msisdn) {
        finalizeEntry(current as ParsedEntry, entries);
      }
      const portageDateObj = parsePortageDate(msisdnMatch[3]);
      const jd = subtractBusinessDays(portageDateObj, 2);
      const jd1 = subtractBusinessDays(portageDateObj, 1);
      current = {
        msisdn: msisdnMatch[1],
        status: msisdnMatch[2],
        portageDate: msisdnMatch[3],
        portageDateObj,
        ticketCode: '',
        emissionDate: '',
        emissionDateObj: null,
        pnmdataFile: null,
        jd,
        jd1,
      };
      continue;
    }

    // Line: "1110 - out - 4 - émis Le mardi 24 mars 2026 à 14:01:57 - PNMDATA.02.04.20260324140127.002"
    const ticketMatch = line.match(
      /^(\d{4})\s*-\s*out\s*-\s*\d+\s*-\s*émis\s+(.*?)\s*-\s*(PNMDATA\S+)/i,
    );
    if (ticketMatch && current) {
      current.ticketCode = ticketMatch[1];
      current.emissionDate = ticketMatch[2].trim();
      current.emissionDateObj = parseEmissionDate(ticketMatch[2]);
      current.pnmdataFile = ticketMatch[3];
      continue;
    }

    // Line with ticket but no PNMDATA (internal)
    const internalMatch = line.match(
      /^(\d{4})\s*-\s*internal\s*-.*?-\s*<AUCUN>/i,
    );
    if (internalMatch && current && !current.ticketCode) {
      current.ticketCode = internalMatch[1];
    }
  }

  // Save last entry
  if (current?.msisdn) {
    finalizeEntry(current as ParsedEntry, entries);
  }

  return entries;
}

function finalizeEntry(entry: ParsedEntry, entries: ParsedEntry[]) {
  if (!entry.ticketCode) entry.ticketCode = '1110';
  entries.push(entry);
}

// ── Analysis ──

function analyzeEntry(entry: ParsedEntry, now: Date): AnalysisResult {
  const { jd1 } = entry;

  // Deadlines for 1210/1220 response on JD+1
  const deadlines: DeadlineInfo[] = [
    {
      label: `JD+1 V1 (10h00)`,
      dateTime: new Date(jd1.getFullYear(), jd1.getMonth(), jd1.getDate(), 10, 0, 0),
      passed: false,
    },
    {
      label: `JD+1 V2 (14h00)`,
      dateTime: new Date(jd1.getFullYear(), jd1.getMonth(), jd1.getDate(), 14, 0, 0),
      passed: false,
    },
    {
      label: `JD+1 V3 (19h00)`,
      dateTime: new Date(jd1.getFullYear(), jd1.getMonth(), jd1.getDate(), 19, 0, 0),
      passed: false,
    },
  ];

  deadlines.forEach((d) => {
    d.passed = now >= d.dateTime;
  });

  // Overdue if the first vacation deadline has passed (response should have started arriving)
  const isOverdue = deadlines[0].passed;
  // Should email as soon as any vacation deadline has passed — response is late
  const shouldEmail = isOverdue;

  return { entry, deadlines, isOverdue, shouldEmail };
}

// ── Email generation ──

function generateSubject(entries: ParsedEntry[]): string {
  if (entries.length === 1) {
    return `[PNM] En attente de la réponse pour la portabilité du ${entries[0].msisdn} vers Digicel`;
  }
  return `[PNM] En attente de la réponse pour ${entries.length} portabilités vers Digicel`;
}

function generateEmailBody(results: AnalysisResult[]): string {
  const entries = results.map((r) => r.entry);

  if (entries.length === 1) {
    const e = entries[0];
    const lines = [
      'Bonjour Latifa,',
      '',
      `Nous attendons la réponse pour la portabilité du ${e.msisdn} vers Digicel.`,
      `Le ticket ${e.ticketCode} est dans le fichier ${e.pnmdataFile || '(non trouvé)'}`,
      'Peux-tu débloquer la situation stp ?',
      '',
      '',
      'Cordialement,',
    ];
    return lines.join('\n');
  }

  // Multiple MSISDNs
  const lines = [
    'Bonjour Latifa,',
    '',
    `Nous attendons la réponse pour les portabilités suivantes vers Digicel :`,
    '',
  ];

  for (const e of entries) {
    lines.push(`- ${e.msisdn} : ticket ${e.ticketCode} dans le fichier ${e.pnmdataFile || '(non trouvé)'}`);
  }

  lines.push('', 'Peux-tu débloquer la situation stp ?', '', '', 'Cordialement,');
  return lines.join('\n');
}

function generateSignature(): string {
  return [
    'Digicel',
    '',
    'Steeven JACQUES',
    "Chargé d'applications (DSI) | Application Team",
    'Digicel Antilles-Guyane',
    '+596 696 307 631',
  ].join('\n');
}

// ── Format helpers ──

function formatDateFr(d: Date): string {
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTimeFr(d: Date): string {
  return d.toLocaleString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Component ──

export default function LatifaMailGenerator() {
  const [input, setInput] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  const now = useMemo(() => new Date(), []);

  const results = useMemo(() => {
    if (!input.trim()) return null;
    const entries = parseInput(input);
    if (entries.length === 0) return null;
    return entries.map((e) => analyzeEntry(e, now));
  }, [input, now]);

  const entriesToEmail = results?.filter((r) => r.shouldEmail) ?? [];
  const subject = entriesToEmail.length > 0 ? generateSubject(entriesToEmail.map((r) => r.entry)) : '';
  const body = entriesToEmail.length > 0 ? generateEmailBody(entriesToEmail) : '';
  const signature = generateSignature();

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => {
      setSnackbar({ open: true, message: `${label} copié !` });
    });
  }

  return (
    <DashboardLayout>
      <Head title="Mail Latifa — Relance portage" />

      <Box sx={{ p: { xs: 3, md: 5 }, maxWidth: 900 }}>
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
          <Typography variant="body2">Mail Latifa</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="h4">Relance portage — Mail Latifa</Typography>
            <Typography variant="body2" color="text.secondary">
              Collez les informations de portage depuis l&apos;Admin-Portal pour vérifier les deadlines
              et générer un mail de relance.
            </Typography>
          </Box>

          {/* Current time */}
          <Alert severity="info" icon={<Iconify icon="solar:clock-circle-bold" width={20} />}>
            Date et heure actuelles : <strong>{formatDateTimeFr(now)}</strong>
          </Alert>

          {/* Input */}
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Coller les informations du portage
              </Typography>
              <TextField
                multiline
                fullWidth
                minRows={6}
                maxRows={20}
                placeholder={`- Msisdn : 0690660054 (En cours) - Portage prévu le 25/03/2026 - Clôturer ce portage\n1110 - internal - créé en interne Le lundi 23 mars 2026 à 16:16:03 - <AUCUN>\n1110 - out - 4 - émis Le lundi 23 mars 2026 à 19:02:06 - PNMDATA.02.04.20260323190135.003`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
            </CardContent>
          </Card>

          {/* Analysis results */}
          {results && results.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Analyse des deadlines
                </Typography>

                {results.map((r, idx) => (
                  <Box key={r.entry.msisdn + idx} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                        {r.entry.msisdn}
                      </Typography>
                      <Chip
                        label={r.entry.status}
                        size="small"
                        color={r.entry.status === 'En cours' ? 'warning' : 'default'}
                      />
                      {r.shouldEmail ? (
                        <Chip label="RELANCE" size="small" color="error" />
                      ) : (
                        <Chip label="DANS LES TEMPS" size="small" color="success" />
                      )}
                    </Box>

                    <Box sx={{ pl: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Portage (JP) : <strong>{r.entry.portageDate}</strong> — {formatDateFr(r.entry.portageDateObj)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Jour de demande (JD) : <strong>{formatDateFr(r.entry.jd)}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Jour de réponse (JD+1) : <strong>{formatDateFr(r.entry.jd1)}</strong>
                      </Typography>
                      {r.entry.pnmdataFile && (
                        <Typography variant="body2" color="text.secondary">
                          Fichier : <strong style={{ fontFamily: 'monospace' }}>{r.entry.pnmdataFile}</strong>
                        </Typography>
                      )}

                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                          Vacations de réponse (1210/1220) attendues le {formatDateFr(r.entry.jd1)} :
                        </Typography>
                        {r.deadlines.map((dl) => (
                          <Box
                            key={dl.label}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              py: 0.25,
                            }}
                          >
                            <Iconify
                              icon={dl.passed ? 'solar:close-circle-bold' : 'solar:clock-circle-bold'}
                              width={16}
                              sx={{ color: dl.passed ? 'error.main' : 'success.main' }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                color: dl.passed ? 'error.main' : 'text.secondary',
                                fontWeight: dl.passed ? 700 : 400,
                              }}
                            >
                              {dl.label}
                              {dl.passed ? ' — dépassée' : ' — en attente'}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    {idx < results.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Verdict */}
          {results && results.length > 0 && (
            <Box>
              {entriesToEmail.length > 0 ? (
                <Alert severity="error" icon={<Iconify icon="solar:letter-bold" width={20} />}>
                  <strong>{entriesToEmail.length}</strong> portage(s) en attente de réponse — deadline dépassée.
                  Il faut envoyer le mail de relance à Latifa.
                </Alert>
              ) : (
                <Alert severity="success">
                  Toutes les portabilités sont dans les temps. Pas besoin d&apos;envoyer de mail.
                </Alert>
              )}
            </Box>
          )}

          {/* Generated email */}
          {entriesToEmail.length > 0 && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Mail généré
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Copier le sujet">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Iconify icon="solar:copy-bold" width={16} />}
                        onClick={() => copyToClipboard(subject, 'Sujet')}
                      >
                        Sujet
                      </Button>
                    </Tooltip>
                    <Tooltip title="Copier le corps du mail">
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Iconify icon="solar:copy-bold" width={16} />}
                        onClick={() => copyToClipboard(`${body}\n\n${signature}`, 'Corps du mail')}
                      >
                        Corps
                      </Button>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Subject */}
                <Box
                  sx={{
                    p: 1.5,
                    mb: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                    Objet :
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {subject}
                  </Typography>
                </Box>

                {/* Body */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'sans-serif',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                  }}
                >
                  {renderEmailWithBold(body)}
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                      {signature}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* No entries parsed */}
          {input.trim() && (!results || results.length === 0) && (
            <Alert severity="warning">
              Aucune entrée reconnue. Vérifiez le format du texte collé.
              Le format attendu commence par une ligne <code>- Msisdn : 06XXXXXXXX (En cours) - Portage prévu le JJ/MM/AAAA</code>.
            </Alert>
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </DashboardLayout>
  );
}

// ── Render helpers ──

/** Highlight MSISDN (06...) and PNMDATA filenames in bold in the email preview */
function renderEmailWithBold(text: string) {
  const parts = text.split(/(06\d{8}|PNMDATA\.\S+)/g);
  return parts.map((part, i) => {
    if (/^06\d{8}$/.test(part) || /^PNMDATA\./.test(part)) {
      return (
        <strong key={i}>{part}</strong>
      );
    }
    return part;
  });
}
