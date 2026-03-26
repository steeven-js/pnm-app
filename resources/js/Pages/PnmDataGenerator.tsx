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

// ─── MD5 implementation ─────────────────────────────────────────────────────
// Compact MD5 (RFC 1321) — needed for ID Portage calculation

function md5(input: string): string {
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    return (((x >> 16) + (y >> 16) + (lsw >> 16)) << 16) | (lsw & 0xffff);
  }
  function bitRotateLeft(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  function binlMD5(x: number[], len: number) {
    x[len >> 5] |= 0x80 << (len % 32);
    x[((len + 64) >>> 9 << 4) + 14] = len;
    let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
    for (let i = 0; i < x.length; i += 16) {
      const olda = a, oldb = b, oldc = c, oldd = d;
      a = md5ff(a, b, c, d, x[i], 7, -680876936); d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
      c = md5ff(c, d, a, b, x[i + 2], 17, 606105819); b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
      a = md5ff(a, b, c, d, x[i + 4], 7, -176418897); d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
      c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341); b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
      a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416); d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
      c = md5ff(c, d, a, b, x[i + 10], 17, -42063); b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
      a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682); d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
      c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290); b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
      a = md5gg(a, b, c, d, x[i + 1], 5, -165796510); d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
      c = md5gg(c, d, a, b, x[i + 11], 14, 643717713); b = md5gg(b, c, d, a, x[i], 20, -373897302);
      a = md5gg(a, b, c, d, x[i + 5], 5, -701558691); d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
      c = md5gg(c, d, a, b, x[i + 15], 14, -660478335); b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
      a = md5gg(a, b, c, d, x[i + 9], 5, 568446438); d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
      c = md5gg(c, d, a, b, x[i + 3], 14, -187363961); b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
      a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467); d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
      c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473); b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
      a = md5hh(a, b, c, d, x[i + 5], 4, -378558); d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
      c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562); b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
      a = md5hh(a, b, c, d, x[i], 4, -1530992060); d = md5hh(d, a, b, c, x[i + 3], 11, 1272893353);
      c = md5hh(c, d, a, b, x[i + 6], 16, -155497632); b = md5hh(b, c, d, a, x[i + 9], 23, -1094730640);
      a = md5hh(a, b, c, d, x[i + 12], 4, 681279174); d = md5hh(d, a, b, c, x[i + 15], 11, -358537222);
      c = md5hh(c, d, a, b, x[i + 2], 16, -722521979); b = md5hh(b, c, d, a, x[i + 5], 23, 76029189);
      a = md5hh(a, b, c, d, x[i + 8], 4, -640364487); d = md5hh(d, a, b, c, x[i + 11], 11, -421815835);
      c = md5hh(c, d, a, b, x[i + 14], 16, 530742520); b = md5hh(b, c, d, a, x[i + 1], 23, -995338651);
      a = md5ii(a, b, c, d, x[i], 6, -198630844); d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
      c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905); b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
      a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571); d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
      c = md5ii(c, d, a, b, x[i + 10], 15, -1051523); b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
      a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359); d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
      c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380); b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
      a = md5ii(a, b, c, d, x[i + 4], 6, -145523070); d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
      c = md5ii(c, d, a, b, x[i + 2], 15, 718787259); b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
      a = safeAdd(a, olda); b = safeAdd(b, oldb); c = safeAdd(c, oldc); d = safeAdd(d, oldd);
    }
    return [a, b, c, d];
  }

  function rstrMD5(s: string) {
    const x: number[] = [];
    for (let i = 0; i < s.length * 8; i += 8) {
      x[i >> 5] |= (s.charCodeAt(i / 8) & 0xff) << (i % 32);
    }
    const hash = binlMD5(x, s.length * 8);
    let output = '';
    const hex = '0123456789abcdef';
    for (let i = 0; i < hash.length * 4; i++) {
      output += hex.charAt((hash[i >> 2] >> ((i % 4) * 8 + 4)) & 0x0f) +
                hex.charAt((hash[i >> 2] >> ((i % 4) * 8)) & 0x0f);
    }
    return output;
  }

  return rstrMD5(input);
}

// ─── Types ──────────────────────────────────────────────────────────────────

type Parsed1110 = {
  raw: string;
  ticketType: string;
  opr: string;
  opd: string;
  opr2: string;
  opd2: string;
  datetime: string;
  msisdn: string;
  rio: string;
  seq: string;
  rioRef: string;
  dateEmission: string;
  datePortage: string;
  codePostal: string;
  dateDemande: string;
  valid: boolean;
  error?: string;
};

type TicketType = '1210' | '1220' | '1230';

type MsisdnEntry = {
  msisdn: string;
  rio: string;
};

// ─── Constants ──────────────────────────────────────────────────────────────

const OPERATORS: Record<string, string> = {
  '01': 'Orange Caraibe',
  '02': 'Digicel AFG',
  '03': 'Outremer Telecom / SFR',
  '04': 'Dauphin Telecom',
  '05': 'UTS Caraibe',
  '06': 'Free Caraibes',
};

const TICKET_TYPES: { value: TicketType; label: string; code: string }[] = [
  { value: '1210', label: '1210 — Accord simple', code: 'A001' },
  { value: '1220', label: '1220 — Refus simple', code: 'R001' },
  { value: '1230', label: '1230 — Accord complexe', code: 'A001' },
];

const RESPONSE_CODES: Record<TicketType, { value: string; label: string }[]> = {
  '1210': [{ value: 'A001', label: 'A001 — Accord' }],
  '1220': [
    { value: 'R001', label: 'R001 — RIO incorrect' },
    { value: 'R002', label: 'R002 — MSISDN inconnu' },
    { value: 'R003', label: 'R003 — Ligne suspendue' },
    { value: 'R004', label: 'R004 — Engagement en cours' },
    { value: 'R005', label: 'R005 — Autre motif' },
  ],
  '1230': [{ value: 'A001', label: 'A001 — Accord' }],
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function OperatorChip({ code }: { code: string }) {
  const name = OPERATORS[code] || `Op ${code}`;
  const colors: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'error' | 'default'> = {
    '01': 'warning', '02': 'error', '03': 'info', '04': 'default', '05': 'success', '06': 'primary',
  };
  return <Chip label={`${code} — ${name}`} size="small" color={colors[code] || 'default'} variant="soft" />;
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return (
    <Tooltip title={copied ? 'Copie !' : (label || 'Copier')}>
      <IconButton size="small" onClick={handleCopy}>
        <Iconify icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold-duotone'} width={18}
          sx={{ color: copied ? 'success.main' : undefined }} />
      </IconButton>
    </Tooltip>
  );
}

function OutputBlock({ content, fileName }: { content: string; fileName: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>{fileName}</Typography>
        <CopyButton text={fileName} label="Copier le nom du fichier" />
      </Stack>
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Box component="pre" sx={{
          p: 2, pr: 6, borderRadius: 1.5, bgcolor: '#1e293b', color: '#e2e8f0',
          fontSize: 12, fontFamily: 'monospace', overflow: 'auto', whiteSpace: 'pre-wrap',
          wordBreak: 'break-all', border: '2px solid', borderColor: 'success.main',
        }}>
          {content}
        </Box>
        <Tooltip title={copied ? 'Copie !' : 'Copier le contenu'}>
          <IconButton onClick={handleCopy} sx={{
            position: 'absolute', top: 8, right: 8,
            color: copied ? 'success.main' : 'grey.400',
            bgcolor: 'rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
          }}>
            <Iconify icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold-duotone'} width={20} />
          </IconButton>
        </Tooltip>
      </Box>
    </>
  );
}

function toTimestamp(date: string, time: string): string {
  if (!date || !time) return '';
  return date.replace(/-/g, '') + time.replace(/:/g, '') + '00';
}

// ─── Parser ─────────────────────────────────────────────────────────────────

function parse1110Line(raw: string): Parsed1110 {
  const line = raw.trim().replace(/^\|/, '').replace(/\|$/, '');
  const parts = line.split('|');
  const empty: Parsed1110 = {
    raw, ticketType: '', opr: '', opd: '', opr2: '', opd2: '',
    datetime: '', msisdn: '', rio: '', seq: '', rioRef: '',
    dateEmission: '', datePortage: '', codePostal: '', dateDemande: '',
    valid: false,
  };

  if (parts.length < 10) return { ...empty, error: `${parts.length} champs (min 10)` };
  if (parts[0] !== '1110') return { ...empty, ticketType: parts[0], error: `Type ${parts[0]} (attendu: 1110)` };

  return {
    raw, ticketType: '1110', valid: true,
    opr: parts[1], opd: parts[2], opr2: parts[3], opd2: parts[4],
    datetime: parts[5], msisdn: parts[6], rio: parts[7], seq: parts[8],
    rioRef: parts[9] || '', dateEmission: parts[10] || '', datePortage: parts[11] || '',
    codePostal: parts[14] || '', dateDemande: parts[15] || '',
  };
}

// ─── 1210 Generator ─────────────────────────────────────────────────────────

function generate1210PnmData(
  tickets: Parsed1110[], ticketType: TicketType, responseCode: string,
  fileTimestamp: string, fileSequence: string,
): string {
  const valid = tickets.filter((t) => t.valid);
  if (valid.length === 0) return '';
  const { opd, opr } = valid[0];
  const fn = `PNMDATA.${opd}.${opr}.${fileTimestamp}.${fileSequence}`;
  const total = String(valid.length + 2).padStart(6, '0');
  const header = `0123456789|${fn}|${opd}|${fileTimestamp}`;
  const lines = valid.map((t) =>
    `${ticketType}|${t.opd}|${t.opr}|${t.opr}|${t.opd}|${t.datetime}|${t.msisdn}|${t.rio}|${t.seq}|${responseCode}|${fileTimestamp}||`
  );
  const footer = `9876543210|${opd}|${fileTimestamp}|${total}`;
  return [header, ...lines, footer].join('\n');
}

// ─── 1110 Generator ─────────────────────────────────────────────────────────

function generate1110PnmData(
  opr: string, opd: string, entries: MsisdnEntry[],
  dateSouscription: string, dateCreation: string, datePortage: string,
  codePostal: string, dateDemande: string,
  fileTimestamp: string, fileSequence: string,
): string {
  const validEntries = entries.filter((e) => e.msisdn.length === 10 && e.rio.length >= 1);
  if (validEntries.length === 0) return '';

  const fn = `PNMDATA.${opr}.${opd}.${fileTimestamp}.${fileSequence}`;
  const total = String(validEntries.length + 2).padStart(6, '0');
  const header = `0123456789|${fn}|${opr}|${fileTimestamp}`;

  const lines = validEntries.map((entry, i) => {
    const seq = String(i + 1).padStart(4, '0');
    // ID Portage = MD5(OPR + OPD + DateSouscription + MSISDN)
    const idPortage = md5(opr + opd + dateSouscription + entry.msisdn);
    // 1110|OPR|OPD|OPR|OPD|dateSouscription|msisdn|idPortage|seq|rio|dateCreation|datePortage|||codePostal|dateDemande|
    return `1110|${opr}|${opd}|${opr}|${opd}|${dateSouscription}|${entry.msisdn}|${idPortage}|${seq}|${entry.rio}|${dateCreation}|${datePortage}|||${codePostal}|${dateDemande}|`;
  });

  const footer = `9876543210|${opr}|${fileTimestamp}|${total}`;
  return [header, ...lines, footer].join('\n');
}

// ─── Tab: 1110 → 1210 ──────────────────────────────────────────────────────

function Tab1210() {
  const [inputText, setInputText] = useState('');
  const [ticketType, setTicketType] = useState<TicketType>('1210');
  const [responseCode, setResponseCode] = useState('A001');
  const [fileDate, setFileDate] = useState('');
  const [fileTime, setFileTime] = useState('21:00');
  const [fileSequence, setFileSequence] = useState('005');
  const [dateAutoSet, setDateAutoSet] = useState(false);

  const parsedTickets = useMemo(() => {
    if (!inputText.trim()) return [];
    const tickets = inputText.split('\n').map((l) => l.trim()).filter(Boolean).map(parse1110Line);
    if (!dateAutoSet && tickets.length > 0) {
      const first = tickets.find((t) => t.valid);
      if (first) {
        const dt = first.dateEmission || first.datetime;
        if (dt?.length >= 8) {
          setFileDate(`${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}`);
          setDateAutoSet(true);
        }
      }
    }
    return tickets;
  }, [inputText, dateAutoSet]);

  const validTickets = useMemo(() => parsedTickets.filter((t) => t.valid), [parsedTickets]);
  const fileTimestamp = useMemo(() => toTimestamp(fileDate, fileTime), [fileDate, fileTime]);

  const output = useMemo(() => {
    if (!validTickets.length || !fileTimestamp) return '';
    return generate1210PnmData(validTickets, ticketType, responseCode, fileTimestamp, fileSequence.padStart(3, '0'));
  }, [validTickets, ticketType, responseCode, fileTimestamp, fileSequence]);

  const fileName = useMemo(() => {
    if (!validTickets.length || !fileTimestamp) return '';
    return `PNMDATA.${validTickets[0].opd}.${validTickets[0].opr}.${fileTimestamp}.${fileSequence.padStart(3, '0')}`;
  }, [validTickets, fileTimestamp, fileSequence]);

  return (
    <Stepper orientation="vertical" sx={{ mb: 3 }}>
      <Step active expanded>
        <StepLabel><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Coller les tickets 1110</Typography></StepLabel>
        <StepContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Collez les lignes 1110 depuis PortaWebUI (Liste des Fichiers). Une ligne par ticket.
          </Typography>
          <TextField multiline rows={5} fullWidth
            placeholder={`|1110|02|05|02|05|20260313111929|0690100733|bd1ad95b...|0001|05P056159ZHT|20260313140212|20260317111849|||97100|20260313|`}
            value={inputText}
            onChange={(e) => { setInputText(e.target.value); setDateAutoSet(false); }}
            sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: 12 }, mb: 2 }}
          />
          {parsedTickets.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {validTickets.length} ticket(s) detecte(s)
                {parsedTickets.length !== validTickets.length && <Chip label={`${parsedTickets.length - validTickets.length} erreur(s)`} size="small" color="error" sx={{ ml: 1 }} />}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>MSISDN</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>ID Portage</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Receveur</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Donneur</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Date souscription</TableCell>
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
                          {t.datetime ? `${t.datetime.slice(0, 4)}-${t.datetime.slice(4, 6)}-${t.datetime.slice(6, 8)} ${t.datetime.slice(8, 10)}:${t.datetime.slice(10, 12)}` : '—'}
                        </TableCell>
                        <TableCell>
                          {t.valid ? <Chip label="OK" size="small" color="success" variant="soft" />
                            : <Tooltip title={t.error || ''}><Chip label="Erreur" size="small" color="error" variant="soft" /></Tooltip>}
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

      <Step active expanded>
        <StepLabel><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Configurer le fichier PNMDATA</Typography></StepLabel>
        <StepContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Plage horaire</strong> : 14h — 22h (Annexe 4). <strong>Vacations</strong> : ~10h, ~14h, ~19h.
            Creneau recommande : <strong>21h00 — 22h00</strong>.
          </Alert>
          <Stack spacing={2} sx={{ mb: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField select label="Type de ticket" value={ticketType} size="small" sx={{ minWidth: 250 }}
                onChange={(e) => { setTicketType(e.target.value as TicketType); setResponseCode(RESPONSE_CODES[e.target.value as TicketType][0].value); }}>
                {TICKET_TYPES.map((tt) => <MenuItem key={tt.value} value={tt.value}>{tt.label}</MenuItem>)}
              </TextField>
              <TextField select label="Code reponse" value={responseCode} size="small" sx={{ minWidth: 250 }}
                onChange={(e) => setResponseCode(e.target.value)}>
                {RESPONSE_CODES[ticketType].map((rc) => <MenuItem key={rc.value} value={rc.value}>{rc.label}</MenuItem>)}
              </TextField>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField type="date" label="Date du fichier" value={fileDate} size="small" sx={{ minWidth: 180 }}
                onChange={(e) => setFileDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField type="time" label="Heure du fichier" value={fileTime} size="small" sx={{ minWidth: 150 }}
                onChange={(e) => setFileTime(e.target.value)} slotProps={{ inputLabel: { shrink: true } }}
                helperText="21h-22h (hors vacations)" />
              <TextField label="Sequence" value={fileSequence} size="small" sx={{ minWidth: 120 }}
                onChange={(e) => setFileSequence(e.target.value)}
                helperText="Si E008, incrementer (005→006→007...)" />
            </Stack>
          </Stack>
          {validTickets.length > 0 && fileTimestamp && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Fichier</strong> : {fileName}<br />
              <strong>Sens</strong> : {OPERATORS[validTickets[0].opd]} → {OPERATORS[validTickets[0].opr]}<br />
              <strong>Tickets</strong> : {validTickets.length} x {ticketType} ({responseCode})
            </Alert>
          )}
        </StepContent>
      </Step>

      <Step active expanded>
        <StepLabel><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Resultat</Typography></StepLabel>
        <StepContent>
          {!output ? (
            <Alert severity="warning">Collez des tickets 1110 et configurez la date/heure.</Alert>
          ) : (
            <>
              <OutputBlock content={output} fileName={fileName} />
              <Alert severity="warning">
                Placez le fichier dans <code>/home/porta_pnmv3/PortaSync/pnmdata/{fileName.split('.')[2]}/recv/{fileName}</code> puis lancez <code>./PnmDataAckManager.sh -v</code>.
              </Alert>
            </>
          )}
        </StepContent>
      </Step>
    </Stepper>
  );
}

// ─── Tab: Generer 1110 ──────────────────────────────────────────────────────

function Tab1110() {
  const [opr, setOpr] = useState('02');
  const [opd, setOpd] = useState('05');
  const [entries, setEntries] = useState<MsisdnEntry[]>([{ msisdn: '', rio: '' }]);
  const [dateSouscription, setDateSouscription] = useState('');
  const [timeSouscription, setTimeSouscription] = useState('');
  const [dateCreation, setDateCreation] = useState('');
  const [timeCreation, setTimeCreation] = useState('');
  const [datePortageVal, setDatePortageVal] = useState('');
  const [timePortage, setTimePortage] = useState('08:00');
  const [codePostal, setCodePostal] = useState('97100');
  const [dateDemande, setDateDemande] = useState('');
  const [fileDate, setFileDate] = useState('');
  const [fileTime, setFileTime] = useState('14:00');
  const [fileSequence, setFileSequence] = useState('002');

  // Add/remove MSISDN entries
  const addEntry = useCallback(() => setEntries((prev) => [...prev, { msisdn: '', rio: '' }]), []);
  const removeEntry = useCallback((idx: number) => setEntries((prev) => prev.filter((_, i) => i !== idx)), []);
  const updateEntry = useCallback((idx: number, field: keyof MsisdnEntry, value: string) => {
    setEntries((prev) => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  }, []);

  // Computed timestamps
  const tsSouscription = useMemo(() => toTimestamp(dateSouscription, timeSouscription), [dateSouscription, timeSouscription]);
  const tsCreation = useMemo(() => toTimestamp(dateCreation, timeCreation), [dateCreation, timeCreation]);
  const tsPortage = useMemo(() => toTimestamp(datePortageVal, timePortage), [datePortageVal, timePortage]);
  const tsFile = useMemo(() => toTimestamp(fileDate, fileTime), [fileDate, fileTime]);
  const dateDemandeFmt = useMemo(() => dateDemande ? dateDemande.replace(/-/g, '') : '', [dateDemande]);

  // Computed ID portage for preview
  const computedIds = useMemo(() => {
    if (!tsSouscription) return [];
    return entries.map((e) => {
      if (e.msisdn.length !== 10) return '';
      const input = opr + opd + tsSouscription + e.msisdn;
      return md5(input);
    });
  }, [entries, opr, opd, tsSouscription]);

  // Valid entries
  const validEntries = useMemo(() => entries.filter((e) => e.msisdn.length === 10 && e.rio.length >= 1), [entries]);

  // Output
  const output = useMemo(() => {
    if (!validEntries.length || !tsSouscription || !tsCreation || !tsPortage || !tsFile || !dateDemandeFmt) return '';
    return generate1110PnmData(opr, opd, validEntries, tsSouscription, tsCreation, tsPortage,
      codePostal, dateDemandeFmt, tsFile, fileSequence.padStart(3, '0'));
  }, [validEntries, opr, opd, tsSouscription, tsCreation, tsPortage, codePostal, dateDemandeFmt, tsFile, fileSequence]);

  const fileName = useMemo(() => {
    if (!tsFile) return '';
    return `PNMDATA.${opr}.${opd}.${tsFile}.${fileSequence.padStart(3, '0')}`;
  }, [opr, opd, tsFile, fileSequence]);

  return (
    <Stepper orientation="vertical" sx={{ mb: 3 }}>
      {/* Step 1: Opérateurs */}
      <Step active expanded>
        <StepLabel><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Operateurs</Typography></StepLabel>
        <StepContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField select label="OPR — Receveur (Digicel)" value={opr} size="small" sx={{ minWidth: 250 }}
              onChange={(e) => setOpr(e.target.value)}>
              {Object.entries(OPERATORS).map(([code, name]) => (
                <MenuItem key={code} value={code}>{code} — {name}</MenuItem>
              ))}
            </TextField>
            <TextField select label="OPD — Donneur" value={opd} size="small" sx={{ minWidth: 250 }}
              onChange={(e) => setOpd(e.target.value)}>
              {Object.entries(OPERATORS).map(([code, name]) => (
                <MenuItem key={code} value={code}>{code} — {name}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </StepContent>
      </Step>

      {/* Step 2: MSISDN + RIO */}
      <Step active expanded>
        <StepLabel><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>MSISDN et RIO</Typography></StepLabel>
        <StepContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>RIO</strong> : 12 caracteres, format <code>OOTRRRRRRCCC</code> (ex: 05P056159ZHT).<br />
            <strong>ID Portage</strong> : calcule automatiquement — <code>MD5(OPR + OPD + DateSouscription + MSISDN)</code> (Annexe 4).
          </Alert>
          {entries.map((entry, i) => (
            <Stack key={i} direction="row" spacing={1} sx={{ mb: 1 }} alignItems="center">
              <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 30 }}>#{String(i + 1).padStart(2, '0')}</Typography>
              <TextField label="MSISDN" value={entry.msisdn} size="small" sx={{ width: 140 }}
                placeholder="0690XXXXXX"
                onChange={(e) => updateEntry(i, 'msisdn', e.target.value)}
                error={entry.msisdn.length > 0 && entry.msisdn.length !== 10}
              />
              <TextField label="RIO" value={entry.rio} size="small" sx={{ width: 160 }}
                placeholder="05P056159ZHT"
                onChange={(e) => updateEntry(i, 'rio', e.target.value)}
              />
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', minWidth: 280, fontSize: 11 }}>
                ID: {computedIds[i] ? computedIds[i] : '—'}
              </Typography>
              {entries.length > 1 && (
                <IconButton size="small" onClick={() => removeEntry(i)} color="error">
                  <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                </IconButton>
              )}
            </Stack>
          ))}
          <Button size="small" startIcon={<Iconify icon="solar:add-circle-bold" width={18} />}
            onClick={addEntry} sx={{ mt: 1 }}>
            Ajouter un MSISDN
          </Button>
        </StepContent>
      </Step>

      {/* Step 3: Dates */}
      <Step active expanded>
        <StepLabel><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Dates</Typography></StepLabel>
        <StepContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField type="date" label="Date souscription (#5)" value={dateSouscription} size="small"
                onChange={(e) => setDateSouscription(e.target.value)} slotProps={{ inputLabel: { shrink: true } }}
                helperText="Date de la demande client" />
              <TextField type="time" label="Heure" value={timeSouscription} size="small" sx={{ width: 130 }}
                onChange={(e) => setTimeSouscription(e.target.value)} slotProps={{ inputLabel: { shrink: true } }}
                inputProps={{ step: 1 }} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField type="date" label="Date creation ticket (#10)" value={dateCreation} size="small"
                onChange={(e) => setDateCreation(e.target.value)} slotProps={{ inputLabel: { shrink: true } }}
                helperText="Quand le ticket est emis" />
              <TextField type="time" label="Heure" value={timeCreation} size="small" sx={{ width: 130 }}
                onChange={(e) => setTimeCreation(e.target.value)} slotProps={{ inputLabel: { shrink: true } }}
                inputProps={{ step: 1 }} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField type="date" label="Date portage (#11)" value={datePortageVal} size="small"
                onChange={(e) => setDatePortageVal(e.target.value)} slotProps={{ inputLabel: { shrink: true } }}
                helperText="Date de bascule prevue (J+2 ouvre)" />
              <TextField type="time" label="Heure" value={timePortage} size="small" sx={{ width: 130 }}
                onChange={(e) => setTimePortage(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField type="date" label="Date demande portage (#15)" value={dateDemande} size="small"
                onChange={(e) => setDateDemande(e.target.value)} slotProps={{ inputLabel: { shrink: true } }}
                helperText="AAAAMMJJ — jour de la demande" />
              <TextField label="Code postal (#14)" value={codePostal} size="small" sx={{ width: 120 }}
                onChange={(e) => setCodePostal(e.target.value)} />
            </Stack>
          </Stack>
        </StepContent>
      </Step>

      {/* Step 4: Fichier PNMDATA */}
      <Step active expanded>
        <StepLabel><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Fichier PNMDATA</Typography></StepLabel>
        <StepContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Le 1110 est emis par l{"'"}OPR (Digicel). Le fichier PNMDATA est donc <code>PNMDATA.{opr}.{opd}</code>.
          </Alert>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField type="date" label="Date fichier" value={fileDate} size="small"
              onChange={(e) => setFileDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField type="time" label="Heure fichier" value={fileTime} size="small" sx={{ width: 130 }}
              onChange={(e) => setFileTime(e.target.value)} slotProps={{ inputLabel: { shrink: true } }}
              helperText="14h-22h" />
            <TextField label="Sequence" value={fileSequence} size="small" sx={{ width: 100 }}
              onChange={(e) => setFileSequence(e.target.value)} helperText="Ex: 002" />
          </Stack>
        </StepContent>
      </Step>

      {/* Step 5: Resultat */}
      <Step active expanded>
        <StepLabel><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Resultat</Typography></StepLabel>
        <StepContent>
          {!output ? (
            <Alert severity="warning">Remplissez tous les champs obligatoires pour generer le ticket 1110.</Alert>
          ) : (
            <>
              <OutputBlock content={output} fileName={fileName} />
              {/* ID Portage verification */}
              <Card variant="outlined" sx={{ mb: 2, borderLeft: 4, borderLeftColor: 'info.main' }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    <Iconify icon="solar:key-bold-duotone" width={16} sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    ID Portage (MD5)
                  </Typography>
                  {validEntries.map((entry, i) => {
                    const input = opr + opd + tsSouscription + entry.msisdn;
                    return (
                      <Stack key={i} spacing={0.5} sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          <strong>{entry.msisdn}</strong> : MD5(<code>{input}</code>)
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11, color: 'success.main' }}>
                          = {md5(input)}
                        </Typography>
                      </Stack>
                    );
                  })}
                </CardContent>
              </Card>
              <Alert severity="warning">
                Placez le fichier dans <code>/home/porta_pnmv3/PortaSync/pnmdata/{fileName.split('.')[2]}/recv/{fileName}</code> puis lancez <code>./PnmDataAckManager.sh -v</code>.
              </Alert>
            </>
          )}
        </StepContent>
      </Step>
    </Stepper>
  );
}

// ─── Ticket type catalog (Annexe 4 / PortaWs) ───────────────────────────────

const ALL_TICKET_TYPES = [
  { code: '1110', abbr: 'DP', label: 'Demande de portage (particulier)', ready: true },
  { code: '1120', abbr: 'DE', label: 'Demande de portage (personne morale)', ready: false },
  { code: '1210', abbr: 'RP', label: 'Reponse : acceptation de la demande', ready: true },
  { code: '1220', abbr: 'RP', label: 'Reponse : refus de la demande', ready: true },
  { code: '1410', abbr: 'EP', label: 'Envoi des donnees de portage', ready: false },
  { code: '1430', abbr: 'CP', label: 'Confirmation de l\'operation de portage', ready: false },
  { code: '1510', abbr: 'AP', label: 'Annulation OPR avant information operateurs', ready: false },
  { code: '1520', abbr: 'AN', label: 'Annulation OPD d\'un numero', ready: false },
  { code: '1530', abbr: 'CA', label: 'Confirmation d\'annulation (OPR/OPD)', ready: false },
  { code: '2400', abbr: 'BI', label: 'Bon accord portage inverse', ready: false },
  { code: '2410', abbr: 'PI', label: 'Envoi des donnees de portage inverse', ready: false },
  { code: '2420', abbr: 'DI', label: 'Confirmation prise en compte portage inverse', ready: false },
  { code: '2430', abbr: 'CI', label: 'Confirmation portage inverse', ready: false },
  { code: '3400', abbr: 'BR', label: 'Bon accord restitution', ready: false },
  { code: '3410', abbr: 'RN', label: 'Envoi des donnees de restitution', ready: false },
  { code: '3420', abbr: 'RS', label: 'Prise en compte des donnees restitution', ready: false },
  { code: '3430', abbr: 'RC', label: 'Confirmation mise a jour operateurs', ready: false },
  { code: '7000', abbr: 'ER', label: 'Erreurs et dysfonctionnement', ready: false },
] as const;

function ComingSoon({ code, label }: { code: string; label: string }) {
  return (
    <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
      <Iconify icon="solar:hourglass-bold-duotone" width={48} sx={{ color: 'text.disabled' }} />
      <Typography variant="h6" sx={{ color: 'text.secondary' }}>
        {code} — {label}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.disabled' }}>
        Ce generateur sera disponible prochainement.
      </Typography>
    </Stack>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function PnmDataGenerator() {
  const [selectedCode, setSelectedCode] = useState('');

  const renderContent = () => {
    switch (selectedCode) {
      case '1110': return <Tab1110 />;
      case '1210':
      case '1220': return <Tab1210 />;
      default: {
        const tt = ALL_TICKET_TYPES.find((t) => t.code === selectedCode);
        return tt ? <ComingSoon code={tt.code} label={tt.label} /> : null;
      }
    }
  };

  return (
    <DashboardLayout>
      <Head title="Generateur PNMDATA" />
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1200, mx: 'auto' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
          <Iconify icon="solar:file-text-bold-duotone" width={32} sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Generateur PNMDATA</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Generer des fichiers PNMDATA — tous types de tickets (Annexe 4)
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Selectionnez un ticket a generer
        </Typography>

        <TextField
          select
          label="code_ticket"
          value={selectedCode}
          onChange={(e) => setSelectedCode(e.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 3, maxWidth: 600 }}
        >
          <MenuItem value="" disabled><em>— Choisir un type de ticket —</em></MenuItem>
          {ALL_TICKET_TYPES.map((tt) => (
            <MenuItem key={tt.code} value={tt.code}>
              {tt.code} - {tt.abbr} - {tt.label}
            </MenuItem>
          ))}
        </TextField>

        {selectedCode && (
          <Card>
            <CardContent sx={{ p: 3 }}>
              {renderContent()}
            </CardContent>
          </Card>
        )}

        {/* Reference card */}
        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              <Iconify icon="solar:info-circle-bold-duotone" width={20} sx={{ mr: 1, verticalAlign: 'middle' }} />
              Reference — Format des tickets (Annexe 4)
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>1110 — Demande de portage</Typography>
                <Box component="pre" sx={{ p: 1.5, borderRadius: 1, bgcolor: '#f8fafc', fontSize: 11, fontFamily: 'monospace', border: '1px solid', borderColor: 'divider' }}>
{`#01 Code Transaction    : 1110
#02 Op. Origine (OPR)   : nn
#03 Op. Destination (OPD): nn
#04 OPR                  : nn
#05 OPD                  : nn
#06 Date souscription    : AAAAMMJJHHMMSS
#07 MSISDN               : 0690XXXXXX
#08 ID Portage           : MD5(OPR+OPD+DateSousc+MSISDN)
#09 N° Ligne             : nnnn
#10 RIO                  : OOTRRRRRRCCC
#11 Date creation ticket : AAAAMMJJHHMMSS
#12 Date portage client  : AAAAMMJJHHMMSS
#13 ID Portage Multiple  : MD5 (optionnel)
#14 Nb lignes a porter   : nnn (optionnel)
#15 Code postal emetteur : nnnnn
#16 Date demande portage : AAAAMMJJ`}
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>1210/1220 — Reponse</Typography>
                <Box component="pre" sx={{ p: 1.5, borderRadius: 1, bgcolor: '#f8fafc', fontSize: 11, fontFamily: 'monospace', border: '1px solid', borderColor: 'divider' }}>
{`#01 Code Transaction    : 1210/1220
#02 Op. Origine (OPD)   : nn
#03 Op. Destination (OPR): nn
#04 OPR                  : nn
#05 OPD                  : nn
#06 Date souscription    : (du 1110)
#07 MSISDN               : (du 1110)
#08 ID Portage           : (du 1110)
#09 N° Ligne             : (du 1110)
#10 Code Acceptation/Refus: Annn/Rnnn
#11 Date creation ticket : AAAAMMJJHHMMSS
#12 ID Portage Multiple  : (optionnel)
#13 Commentaire          : (optionnel)`}
                </Box>
              </Box>
            </Stack>
            <Alert severity="error" sx={{ mt: 2 }}>
              <strong>E003</strong> — Conflit origine header/footer vs tickets.{' '}
              <strong>E008</strong> — Fichier deja recu (changer timestamp/sequence).
            </Alert>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
