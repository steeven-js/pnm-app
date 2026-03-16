import { useCallback, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepContent from '@mui/material/StepContent';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { DashboardLayout } from 'src/layouts/dashboard/layout';

// ─── Types ──────────────────────────────────────────────────────────────────

type Parsed1110 = {
  raw: string;
  ticketType: string;
  opr: string;        // opérateur receveur
  opd: string;        // opérateur donneur
  opr2: string;
  opd2: string;
  datetime: string;   // datetime de création du 1110
  msisdn: string;
  rio: string;
  seq: string;        // numéro de ligne (0001, 0002...)
  rioRef: string;
  dateEmission: string;
  datePortage: string;
  codePostal: string;
  dateDemande: string;
  valid: boolean;
  error?: string;
};

type TicketType = '1210' | '1220' | '1230';

// ─── Constants ──────────────────────────────────────────────────────────────

const OPERATORS: Record<string, string> = {
  '01': 'Orange Caraibe',
  '02': 'Digicel AFG',
  '03': 'Outremer Telecom / SFR',
  '04': 'Dauphin Telecom',
  '05': 'UTS Caraibe',
  '06': 'Free Caraibes',
};

const TICKET_TYPES: { value: TicketType; label: string; description: string; code: string }[] = [
  { value: '1210', label: '1210 — Accord simple', description: 'Accord du donneur pour portabilite entrante', code: 'A001' },
  { value: '1220', label: '1220 — Refus simple', description: 'Refus du donneur pour portabilite entrante', code: 'R001' },
  { value: '1230', label: '1230 — Accord complexe', description: 'Accord du donneur pour portabilite complexe', code: 'A001' },
];

const RESPONSE_CODES: Record<TicketType, { value: string; label: string }[]> = {
  '1210': [
    { value: 'A001', label: 'A001 — Accord' },
  ],
  '1220': [
    { value: 'R001', label: 'R001 — RIO incorrect' },
    { value: 'R002', label: 'R002 — MSISDN inconnu' },
    { value: 'R003', label: 'R003 — Ligne suspendue' },
    { value: 'R004', label: 'R004 — Engagement en cours' },
    { value: 'R005', label: 'R005 — Autre motif' },
  ],
  '1230': [
    { value: 'A001', label: 'A001 — Accord' },
  ],
};

// ─── Parser ─────────────────────────────────────────────────────────────────

function parse1110Line(raw: string): Parsed1110 {
  const line = raw.trim().replace(/^\|/, '').replace(/\|$/, '');
  const parts = line.split('|');

  if (parts.length < 10) {
    return {
      raw, ticketType: '', opr: '', opd: '', opr2: '', opd2: '',
      datetime: '', msisdn: '', rio: '', seq: '', rioRef: '',
      dateEmission: '', datePortage: '', codePostal: '', dateDemande: '',
      valid: false, error: `Format invalide : ${parts.length} champs (minimum 10 attendus)`,
    };
  }

  const ticketType = parts[0];
  if (ticketType !== '1110') {
    return {
      raw, ticketType, opr: parts[1] || '', opd: parts[2] || '',
      opr2: parts[3] || '', opd2: parts[4] || '',
      datetime: parts[5] || '', msisdn: parts[6] || '', rio: parts[7] || '',
      seq: parts[8] || '', rioRef: parts[9] || '',
      dateEmission: parts[10] || '', datePortage: parts[11] || '',
      codePostal: parts[14] || '', dateDemande: parts[15] || '',
      valid: false, error: `Type de ticket ${ticketType} (attendu: 1110)`,
    };
  }

  return {
    raw,
    ticketType,
    opr: parts[1],       // 02 (Digicel = receveur)
    opd: parts[2],       // 05 (UTS = donneur)
    opr2: parts[3],      // 02
    opd2: parts[4],      // 05
    datetime: parts[5],  // 20260313111929
    msisdn: parts[6],    // 0690100733
    rio: parts[7],       // hash
    seq: parts[8],       // 0001
    rioRef: parts[9] || '',
    dateEmission: parts[10] || '',
    datePortage: parts[11] || '',
    codePostal: parts[14] || '',
    dateDemande: parts[15] || '',
    valid: true,
  };
}

// ─── Generator ──────────────────────────────────────────────────────────────

function generatePnmData(
  tickets: Parsed1110[],
  ticketType: TicketType,
  responseCode: string,
  fileTimestamp: string,
  fileSequence: string,
): string {
  const validTickets = tickets.filter((t) => t.valid);
  if (validTickets.length === 0) return '';

  // L'opérateur donneur (OPD) envoie le fichier au receveur (OPR)
  const { opd, opr } = validTickets[0];
  const fileName = `PNMDATA.${opd}.${opr}.${fileTimestamp}.${fileSequence}`;
  const totalLines = String(validTickets.length + 2).padStart(6, '0'); // header + tickets + footer

  const header = `0123456789|${fileName}|${opd}|${fileTimestamp}`;

  const ticketLines = validTickets.map((t) =>
    // 1210|OPD|OPR|OPR|OPD|datetime_1110|msisdn|rio|seq|code_reponse|timestamp_fichier||
    `${ticketType}|${t.opd}|${t.opr}|${t.opr}|${t.opd}|${t.datetime}|${t.msisdn}|${t.rio}|${t.seq}|${responseCode}|${fileTimestamp}||`
  );

  const footer = `9876543210|${opd}|${fileTimestamp}|${totalLines}`;

  return [header, ...ticketLines, footer].join('\n');
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTimestamp(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}${m}${d}${h}${min}${s}`;
}

function OperatorChip({ code }: { code: string }) {
  const name = OPERATORS[code] || `Operateur ${code}`;
  const colors: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'error' | 'default'> = {
    '01': 'warning', '02': 'error', '03': 'info', '04': 'default', '05': 'success', '06': 'primary',
  };
  return <Chip label={`${code} — ${name}`} size="small" color={colors[code] || 'default'} variant="soft" />;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function PnmDataGenerator() {
  const [inputText, setInputText] = useState('');
  const [ticketType, setTicketType] = useState<TicketType>('1210');
  const [responseCode, setResponseCode] = useState('A001');
  const [fileDate, setFileDate] = useState('');
  const [fileTime, setFileTime] = useState('');
  const [fileSequence, setFileSequence] = useState('005');
  const [copied, setCopied] = useState(false);
  const [copiedFileName, setCopiedFileName] = useState(false);

  // Parse input tickets
  const parsedTickets = useMemo(() => {
    if (!inputText.trim()) return [];
    return inputText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map(parse1110Line);
  }, [inputText]);

  const validTickets = useMemo(() => parsedTickets.filter((t) => t.valid), [parsedTickets]);

  // Build file timestamp
  const fileTimestamp = useMemo(() => {
    if (fileDate && fileTime) {
      return fileDate.replace(/-/g, '') + fileTime.replace(/:/g, '') + '00';
    }
    return '';
  }, [fileDate, fileTime]);

  // Generate output
  const output = useMemo(() => {
    if (validTickets.length === 0 || !fileTimestamp) return '';
    const seq = fileSequence.padStart(3, '0');
    return generatePnmData(validTickets, ticketType, responseCode, fileTimestamp, seq);
  }, [validTickets, ticketType, responseCode, fileTimestamp, fileSequence]);

  // File name for display
  const fileName = useMemo(() => {
    if (validTickets.length === 0 || !fileTimestamp) return '';
    const { opd, opr } = validTickets[0];
    return `PNMDATA.${opd}.${opr}.${fileTimestamp}.${fileSequence.padStart(3, '0')}`;
  }, [validTickets, fileTimestamp, fileSequence]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleCopyFileName = useCallback(() => {
    navigator.clipboard.writeText(fileName);
    setCopiedFileName(true);
    setTimeout(() => setCopiedFileName(false), 2000);
  }, [fileName]);

  // Update response code when ticket type changes
  const handleTicketTypeChange = useCallback((value: TicketType) => {
    setTicketType(value);
    setResponseCode(RESPONSE_CODES[value][0].value);
  }, []);

  return (
    <DashboardLayout>
      <Head title="Generateur PNMDATA" />

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
          <Iconify icon="solar:file-text-bold-duotone" width={32} sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Generateur PNMDATA
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Generer des fichiers PNMDATA (1210/1220/1230) a partir de tickets 1110
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stepper orientation="vertical" sx={{ mb: 3 }}>
          {/* Step 1: Coller les tickets 1110 */}
          <Step active expanded>
            <StepLabel>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Coller les tickets 1110
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Collez les lignes 1110 depuis PortaWebUI (Liste des Fichiers). Une ligne par ticket.
              </Typography>

              <TextField
                multiline
                rows={5}
                fullWidth
                placeholder={`|1110|02|05|02|05|20260313111929|0690100733|bd1ad95b207e761023579243b6a566b3|0001|05P056159ZHT|20260313140212|20260317111849|||97100|20260313|\n|1110|02|05|02|05|20260313122138|0690103635|ef0c9e6b5c2bd46f66231f918cd7b7a6|0002|05P6515442V2|20260313140212|20260317121946|||97100|20260313|`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                sx={{
                  '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: 12 },
                  mb: 2,
                }}
              />

              {/* Parsed tickets summary */}
              {parsedTickets.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {validTickets.length} ticket(s) 1110 detecte(s)
                    {parsedTickets.length !== validTickets.length && (
                      <Chip label={`${parsedTickets.length - validTickets.length} erreur(s)`} size="small" color="error" sx={{ ml: 1 }} />
                    )}
                  </Typography>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>MSISDN</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>RIO</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Receveur</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Donneur</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Date creation</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {parsedTickets.map((t, i) => (
                          <TableRow key={i} sx={!t.valid ? { bgcolor: 'error.lighter' } : undefined}>
                            <TableCell>{t.seq || String(i + 1)}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{t.msisdn}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>{t.rio ? `${t.rio.slice(0, 8)}...` : '—'}</TableCell>
                            <TableCell>{t.opr ? <OperatorChip code={t.opr} /> : '—'}</TableCell>
                            <TableCell>{t.opd ? <OperatorChip code={t.opd} /> : '—'}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                              {t.datetime ? `${t.datetime.slice(0, 4)}-${t.datetime.slice(4, 6)}-${t.datetime.slice(6, 8)} ${t.datetime.slice(8, 10)}:${t.datetime.slice(10, 12)}:${t.datetime.slice(12, 14)}` : '—'}
                            </TableCell>
                            <TableCell>
                              {t.valid
                                ? <Chip label="OK" size="small" color="success" variant="soft" />
                                : <Tooltip title={t.error || ''}><Chip label="Erreur" size="small" color="error" variant="soft" /></Tooltip>
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </StepContent>
          </Step>

          {/* Step 2: Configurer le fichier */}
          <Step active expanded>
            <StepLabel>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Configurer le fichier PNMDATA
              </Typography>
            </StepLabel>
            <StepContent>
              <Stack spacing={2} sx={{ mb: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    select
                    label="Type de ticket reponse"
                    value={ticketType}
                    onChange={(e) => handleTicketTypeChange(e.target.value as TicketType)}
                    sx={{ minWidth: 250 }}
                    size="small"
                  >
                    {TICKET_TYPES.map((tt) => (
                      <MenuItem key={tt.value} value={tt.value}>
                        {tt.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Code reponse"
                    value={responseCode}
                    onChange={(e) => setResponseCode(e.target.value)}
                    sx={{ minWidth: 250 }}
                    size="small"
                  >
                    {RESPONSE_CODES[ticketType].map((rc) => (
                      <MenuItem key={rc.value} value={rc.value}>
                        {rc.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    type="date"
                    label="Date du fichier"
                    value={fileDate}
                    onChange={(e) => setFileDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    size="small"
                    sx={{ minWidth: 180 }}
                  />
                  <TextField
                    type="time"
                    label="Heure du fichier"
                    value={fileTime}
                    onChange={(e) => setFileTime(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    size="small"
                    sx={{ minWidth: 150 }}
                  />
                  <TextField
                    label="Sequence fichier"
                    value={fileSequence}
                    onChange={(e) => setFileSequence(e.target.value)}
                    size="small"
                    sx={{ minWidth: 120 }}
                    helperText="Si E008, incrementer (005→006→007...)"
                  />
                </Stack>
              </Stack>

              {/* Info récap */}
              {validTickets.length > 0 && fileTimestamp && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>Fichier</strong> : {fileName}<br />
                  <strong>Sens</strong> : {OPERATORS[validTickets[0].opd]} ({validTickets[0].opd}) → {OPERATORS[validTickets[0].opr]} ({validTickets[0].opr})<br />
                  <strong>Tickets</strong> : {validTickets.length} x {ticketType} ({responseCode})<br />
                  <strong>Total lignes</strong> : {validTickets.length + 2} (header + {validTickets.length} tickets + footer)
                </Alert>
              )}
            </StepContent>
          </Step>

          {/* Step 3: Résultat */}
          <Step active expanded>
            <StepLabel>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Resultat — Fichier PNMDATA
              </Typography>
            </StepLabel>
            <StepContent>
              {!output && (
                <Alert severity="warning">
                  Collez des tickets 1110 et configurez la date/heure pour generer le fichier.
                </Alert>
              )}

              {output && (
                <>
                  {/* File name with copy */}
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                      {fileName}
                    </Typography>
                    <Tooltip title={copiedFileName ? 'Copie !' : 'Copier le nom du fichier'}>
                      <IconButton size="small" onClick={handleCopyFileName}>
                        <Iconify icon={copiedFileName ? 'solar:check-circle-bold' : 'solar:copy-bold-duotone'} width={18} />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                  {/* Output box */}
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <Box
                      component="pre"
                      sx={{
                        p: 2,
                        pr: 6,
                        borderRadius: 1.5,
                        bgcolor: '#1e293b',
                        color: '#e2e8f0',
                        fontSize: 12,
                        fontFamily: 'monospace',
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        border: '2px solid',
                        borderColor: 'success.main',
                      }}
                    >
                      {output}
                    </Box>
                    <Tooltip title={copied ? 'Copie !' : 'Copier le contenu'}>
                      <IconButton
                        onClick={handleCopy}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          color: copied ? 'success.main' : 'grey.400',
                          bgcolor: 'rgba(0,0,0,0.3)',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
                        }}
                      >
                        <Iconify icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold-duotone'} width={20} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Validation checks */}
                  <Card variant="outlined" sx={{ mb: 2, borderLeft: 4, borderLeftColor: 'success.main' }}>
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Verification</Typography>
                      <Stack spacing={0.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Iconify icon="solar:check-circle-bold" width={16} sx={{ color: 'success.main' }} />
                          <Typography variant="body2">Header : origine = <code>{validTickets[0]?.opd}</code> ({OPERATORS[validTickets[0]?.opd]})</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Iconify icon="solar:check-circle-bold" width={16} sx={{ color: 'success.main' }} />
                          <Typography variant="body2">Footer : origine = <code>{validTickets[0]?.opd}</code>, nb lignes = <code>{String(validTickets.length + 2).padStart(6, '0')}</code></Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Iconify icon="solar:check-circle-bold" width={16} sx={{ color: 'success.main' }} />
                          <Typography variant="body2">Tickets {ticketType} : OPD|OPR|OPR|OPD = <code>{validTickets[0]?.opd}|{validTickets[0]?.opr}|{validTickets[0]?.opr}|{validTickets[0]?.opd}</code></Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Iconify icon="solar:check-circle-bold" width={16} sx={{ color: 'success.main' }} />
                          <Typography variant="body2">Nom fichier : PNMDATA.<code>{validTickets[0]?.opd}</code>.<code>{validTickets[0]?.opr}</code> (donneur vers receveur)</Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>

                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <strong>Rappel</strong> : Apres avoir copie le contenu, creez le fichier <code>{fileName}</code> dans le
                    repertoire PNMDATA du serveur, puis lancez <code>./PnmDataAckManager.sh -v</code> pour verifier.
                  </Alert>
                </>
              )}
            </StepContent>
          </Step>
        </Stepper>

        {/* Reference: Format documentation */}
        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              <Iconify icon="solar:info-circle-bold-duotone" width={20} sx={{ mr: 1, verticalAlign: 'middle' }} />
              Reference — Format PNMDATA
            </Typography>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>Transformation 1110 → 1210</Typography>
            <TableContainer sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Champ</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>1110 (entree)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>1210 (sortie)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Regle</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Type ticket</TableCell>
                    <TableCell><code>1110</code></TableCell>
                    <TableCell><code>1210</code></TableCell>
                    <TableCell>Change selon le type choisi</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Champs 2-5</TableCell>
                    <TableCell><code>OPR|OPD|OPR|OPD</code></TableCell>
                    <TableCell><code>OPD|OPR|OPR|OPD</code></TableCell>
                    <TableCell>Positions 2 et 3 inversees</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Datetime</TableCell>
                    <TableCell><code>20260313111929</code></TableCell>
                    <TableCell><code>20260313111929</code></TableCell>
                    <TableCell>Conserve du 1110</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>MSISDN + RIO</TableCell>
                    <TableCell><code>0690100733|hash</code></TableCell>
                    <TableCell><code>0690100733|hash</code></TableCell>
                    <TableCell>Conserves du 1110</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Seq</TableCell>
                    <TableCell><code>0001</code></TableCell>
                    <TableCell><code>0001</code></TableCell>
                    <TableCell>Conserve du 1110</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Code reponse</TableCell>
                    <TableCell><code>05P056159ZHT</code> (ref RIO)</TableCell>
                    <TableCell><code>A001</code></TableCell>
                    <TableCell>Remplace par code accord/refus</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell><code>20260313140212</code> (emission)</TableCell>
                    <TableCell><code>timestamp_fichier</code></TableCell>
                    <TableCell>Timestamp du fichier PNMDATA</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Fin de ligne</TableCell>
                    <TableCell><code>|||97100|20260313|</code></TableCell>
                    <TableCell><code>||</code></TableCell>
                    <TableCell>Champs restants supprimes</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>Header / Footer</Typography>
            <Box
              component="pre"
              sx={{
                p: 1.5, borderRadius: 1, bgcolor: '#f8fafc', fontSize: 12,
                fontFamily: 'monospace', border: '1px solid', borderColor: 'divider',
              }}
            >
{`Header : 0123456789|PNMDATA.OPD.OPR.TIMESTAMP.SEQ|OPD|TIMESTAMP
Footer : 9876543210|OPD|TIMESTAMP|TOTAL_LIGNES

OPD = operateur donneur (celui qui envoie le fichier)
OPR = operateur receveur (Digicel = 02)
TOTAL_LIGNES = header + tickets + footer`}
            </Box>

            <Alert severity="error" sx={{ mt: 2 }}>
              <strong>Erreurs courantes</strong> :<br />
              <strong>E003</strong> — Conflit origine : le code operateur dans le header/footer ne correspond pas aux tickets.<br />
              <strong>E008</strong> — Fichier deja recu : changer le timestamp ou la sequence du fichier.
            </Alert>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
