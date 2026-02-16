import { Head } from '@inertiajs/react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
    AlertTriangle,
    ChevronDown,
    ChevronRight,
    Code,
    Eraser,
    FileSearch,
    Info,
    Play,
    Search,
    Upload,
    XCircle,
} from 'lucide-react';
import { useRef, useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import {
    type FileAnalysisResult,
    type FilenameResult,
    type ParsedTicket,
    type ValidationIssue,
    analyzeFileContent,
    decodeFilename,
} from '@/lib/pnm-utils';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Vérifier', href: '/verify' },
    { title: 'Analyseur de fichier PNM', href: '/verify/filename-decoder' },
];

const TICKET_COLORS: Record<string, string> = {
    '1110': '#16a34a',
    '1120': '#16a34a',
    '1210': '#2563eb',
    '1220': '#dc2626',
    '1410': '#7c3aed',
    '1430': '#d97706',
    '1510': '#0891b2',
    '1530': '#0891b2',
    '3430': '#d97706',
    '7000': '#7c3aed',
    '0000': '#6b7280',
};

function getTicketColor(code: string): string {
    return TICKET_COLORS[code] ?? '#6b7280';
}

const EXAMPLE_CONTENT = `0123456789|PNMDATA.04.02.20260213091818.001|04|20260213091818
1110|04|02|02|03|20260210130307|0690056984|a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6|0001|04A1B2C3D4E5|20260210130307|20260213091818||||97100|20260115000000
1210|02|04|04|03|20260211093000|0690056984|a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6|0001|A001|20260211093000
1430|04|02|02|03|20260213091818|0690056984|a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6|0001|20260213092436|20260213130307
3430|04|02|02|03|20260213091818|0690056984|a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6|0001|20260213100000|20260213130307
9876543210|04|20260213091818|000004`;

type Mode = 'idle' | 'filename' | 'file';

export default function FilenameDecoder() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<Mode>('idle');
    const [filenameResult, setFilenameResult] = useState<FilenameResult | null>(null);
    const [fileResult, setFileResult] = useState<FileAnalysisResult | null>(null);
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [msisdnSearch, setMsisdnSearch] = useState('');
    const [expandedTickets, setExpandedTickets] = useState<Set<number>>(new Set());

    function analyze() {
        const trimmed = input.trim();
        if (!trimmed) return;

        // Single line without pipes → filename decode
        const isFilename = !trimmed.includes('\n') && !trimmed.includes('|');
        if (isFilename) {
            setMode('filename');
            setFilenameResult(decodeFilename(trimmed));
            setFileResult(null);
        } else {
            setMode('file');
            setFileResult(analyzeFileContent(trimmed));
            setFilenameResult(null);
        }
        setTypeFilter(null);
        setMsisdnSearch('');
        setExpandedTickets(new Set());
    }

    function clear() {
        setInput('');
        setMode('idle');
        setFilenameResult(null);
        setFileResult(null);
        setTypeFilter(null);
        setMsisdnSearch('');
        setExpandedTickets(new Set());
    }

    function loadExample() {
        setInput(EXAMPLE_CONTENT);
    }

    function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const content = evt.target?.result;
            if (typeof content === 'string') {
                setInput(content);
            }
        };
        reader.readAsText(file);

        // Reset so re-importing the same file triggers onChange
        e.target.value = '';
    }

    function toggleTicket(idx: number) {
        setExpandedTickets((prev) => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    }

    const filteredTickets = useMemo(() => {
        if (!fileResult) return [];
        let tickets = fileResult.tickets;
        if (typeFilter) tickets = tickets.filter((t) => t.common.code === typeFilter);
        if (msisdnSearch.trim()) {
            const q = msisdnSearch.replace(/\s/g, '');
            tickets = tickets.filter((t) => t.common.msisdn.includes(q));
        }
        return tickets;
    }, [fileResult, typeFilter, msisdnSearch]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analyseur de fichier PNM" />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2, maxWidth: 1100 }}>
                {/* Title */}
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        Analyseur de fichier PNM
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Collez un nom de fichier ou le contenu complet d'un fichier PNMDATA / PNMSYNC.
                    </Typography>
                </Box>

                {/* Input */}
                <Card>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Contenu à analyser
                        </Typography>
                        <TextField
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Collez le contenu d'un fichier PNM ou un nom de fichier seul..."
                            multiline
                            minRows={6}
                            maxRows={16}
                            size="small"
                            InputProps={{ sx: { fontFamily: 'monospace', fontSize: 13 } }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) analyze();
                            }}
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".acr,.err,.txt"
                            onChange={handleFileImport}
                            hidden
                        />
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                startIcon={<Play size={16} />}
                                onClick={analyze}
                                disabled={!input.trim()}
                            >
                                Analyser
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Upload size={16} />}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Importer
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Eraser size={16} />}
                                onClick={clear}
                                disabled={!input}
                            >
                                Effacer
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Code size={16} />}
                                onClick={loadExample}
                                color="secondary"
                            >
                                Exemple
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {/* Filename-only result (fallback) */}
                {mode === 'filename' && filenameResult && (
                    <>
                        {!filenameResult.valid && (
                            <Alert severity="error">{filenameResult.error}</Alert>
                        )}
                        {filenameResult.valid && (
                            <>
                                <Alert severity="success">Nom de fichier valide</Alert>
                                <Card sx={{ borderLeft: 3, borderColor: '#f59e0b' }}>
                                    <CardContent>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Informations décodées
                                        </Typography>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 1, alignItems: 'baseline' }}>
                                            <LabelValue label="Préfixe" value={filenameResult.prefix} />
                                            <LabelValue label="Opérateur source" value={`${filenameResult.sourceOperator} — ${filenameResult.sourceOperatorName}`} />
                                            <LabelValue label="Opérateur destination" value={`${filenameResult.destOperator} — ${filenameResult.destOperatorName}`} />
                                            <LabelValue label="Date / heure" value={filenameResult.formattedDate} />
                                            <LabelValue label="Timestamp brut" value={filenameResult.timestamp} mono />
                                            <LabelValue label="N° de séquence" value={filenameResult.sequence} mono />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </>
                )}

                {/* Full file analysis result */}
                {mode === 'file' && fileResult && (
                    <>
                        {/* Summary cards */}
                        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                            {/* Header card */}
                            <Card sx={{ borderLeft: 3, borderColor: '#3b82f6' }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        En-tête
                                    </Typography>
                                    {fileResult.header ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>
                                                {fileResult.header.filename}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>{fileResult.header.operatorName}</strong> ({fileResult.header.operatorCode})
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {fileResult.header.formattedDate}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="error">Non détecté</Typography>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Footer / Validation card */}
                            <Card sx={{ borderLeft: 3, borderColor: fileResult.footer && fileResult.footer.declaredCount === fileResult.tickets.length ? '#16a34a' : '#dc2626' }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Pied de page / Validation
                                    </Typography>
                                    {fileResult.footer ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            <Typography variant="body2">
                                                Déclaré : <strong>{fileResult.footer.declaredCount}</strong> lignes
                                            </Typography>
                                            <Typography variant="body2">
                                                Effectif : <strong>{fileResult.tickets.length}</strong> tickets
                                            </Typography>
                                            <Chip
                                                label={
                                                    fileResult.footer.declaredCount === fileResult.tickets.length
                                                        ? 'Compteur valide'
                                                        : 'Compteur invalide'
                                                }
                                                color={
                                                    fileResult.footer.declaredCount === fileResult.tickets.length
                                                        ? 'success'
                                                        : 'error'
                                                }
                                                size="small"
                                                sx={{ mt: 0.5, width: 'fit-content' }}
                                            />
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="error">Non détecté</Typography>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Tickets summary card */}
                            <Card sx={{ borderLeft: 3, borderColor: '#f59e0b' }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Tickets ({fileResult.tickets.length})
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                        {fileResult.ticketSummary.map((s) => (
                                            <Chip
                                                key={s.code}
                                                label={`${s.abbrev} (${s.count})`}
                                                size="small"
                                                sx={{
                                                    bgcolor: `${getTicketColor(s.code)}18`,
                                                    color: getTicketColor(s.code),
                                                    fontWeight: 600,
                                                    fontSize: 12,
                                                }}
                                            />
                                        ))}
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {fileResult.uniqueMsisdns.length} MSISDN unique{fileResult.uniqueMsisdns.length > 1 ? 's' : ''}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>

                        {/* Ticket list with filters */}
                        {fileResult.tickets.length > 0 && (
                            <Card>
                                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                                        <Typography variant="subtitle2">
                                            Détail des tickets
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                            {/* Type filter chips */}
                                            <Chip
                                                label="Tous"
                                                size="small"
                                                variant={typeFilter === null ? 'filled' : 'outlined'}
                                                onClick={() => setTypeFilter(null)}
                                            />
                                            {fileResult.ticketSummary.map((s) => (
                                                <Chip
                                                    key={s.code}
                                                    label={`${s.code} ${s.abbrev}`}
                                                    size="small"
                                                    variant={typeFilter === s.code ? 'filled' : 'outlined'}
                                                    onClick={() => setTypeFilter(typeFilter === s.code ? null : s.code)}
                                                    sx={{
                                                        borderColor: getTicketColor(s.code),
                                                        color: typeFilter === s.code ? '#fff' : getTicketColor(s.code),
                                                        bgcolor: typeFilter === s.code ? getTicketColor(s.code) : 'transparent',
                                                        '&:hover': { bgcolor: `${getTicketColor(s.code)}22` },
                                                    }}
                                                />
                                            ))}
                                            {/* MSISDN search */}
                                            <TextField
                                                value={msisdnSearch}
                                                onChange={(e) => setMsisdnSearch(e.target.value)}
                                                placeholder="MSISDN..."
                                                size="small"
                                                sx={{ width: 160 }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Search size={14} />
                                                        </InputAdornment>
                                                    ),
                                                    sx: { fontSize: 13 },
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    {/* Ticket rows */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {filteredTickets.length === 0 && (
                                            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                                                Aucun ticket ne correspond aux filtres.
                                            </Typography>
                                        )}
                                        {filteredTickets.map((ticket, idx) => (
                                            <TicketRow
                                                key={idx}
                                                ticket={ticket}
                                                expanded={expandedTickets.has(idx)}
                                                onToggle={() => toggleTicket(idx)}
                                            />
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* Validation issues */}
                        {fileResult.issues.length > 0 && (
                            <Card>
                                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Typography variant="subtitle2">
                                        Avertissements ({fileResult.issues.length})
                                    </Typography>
                                    {fileResult.issues.map((issue, i) => (
                                        <IssueRow key={i} issue={issue} />
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </Box>
        </AppLayout>
    );
}

// ── Sub-components ──

function LabelValue({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <>
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={mono ? { fontFamily: 'monospace' } : undefined}>
                {value}
            </Typography>
        </>
    );
}

function TicketRow({ ticket, expanded, onToggle }: { ticket: ParsedTicket; expanded: boolean; onToggle: () => void }) {
    const color = getTicketColor(ticket.common.code);
    const hasSpecific = Object.keys(ticket.specific).length > 0;

    return (
        <Box sx={{ borderLeft: 3, borderColor: color, borderRadius: 1, bgcolor: `${color}08`, overflow: 'hidden' }}>
            {/* Main row */}
            <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1, cursor: 'pointer', '&:hover': { bgcolor: `${color}12` } }}
                onClick={onToggle}
            >
                <IconButton size="small" sx={{ p: 0 }}>
                    {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </IconButton>
                <Chip
                    label={`${ticket.common.code} ${ticket.common.typeInfo.abbrev}`}
                    size="small"
                    sx={{ bgcolor: `${color}20`, color, fontWeight: 700, fontSize: 12, minWidth: 80 }}
                />
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {ticket.common.msisdn || '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                    {ticket.common.formattedDate}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, ml: 'auto' }}>
                    {ticket.common.oprName} → {ticket.common.opdName}
                </Typography>
            </Box>

            {/* Expanded details */}
            <Collapse in={expanded}>
                <Box sx={{ px: 2, pb: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {/* Common fields */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 0.5, fontSize: 13 }}>
                        <Typography variant="caption" color="text.secondary">OPR (receveur)</Typography>
                        <Typography variant="caption">{ticket.common.opr} — {ticket.common.oprName}</Typography>
                        <Typography variant="caption" color="text.secondary">OPD (donneur)</Typography>
                        <Typography variant="caption">{ticket.common.opd} — {ticket.common.opdName}</Typography>
                        <Typography variant="caption" color="text.secondary">OPA (attributaire)</Typography>
                        <Typography variant="caption">{ticket.common.opa} — {ticket.common.opaName}</Typography>
                        <Typography variant="caption" color="text.secondary">OPX (exploitant)</Typography>
                        <Typography variant="caption">{ticket.common.opx} — {ticket.common.opxName}</Typography>
                        <Typography variant="caption" color="text.secondary">Hash MD5</Typography>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-all' }}>
                            {ticket.common.hash || '—'}
                        </Typography>
                    </Box>

                    {/* Specific fields */}
                    {hasSpecific && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 0.5, pt: 0.5, borderTop: '1px dashed', borderColor: 'divider' }}>
                            {Object.entries(ticket.specific).map(([key, val]) => (
                                <Box key={key} sx={{ display: 'contents' }}>
                                    <Typography variant="caption" color="text.secondary">{key}</Typography>
                                    <Typography variant="caption" fontWeight={600}>{val}</Typography>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {/* Raw line */}
                    <Box sx={{ mt: 0.5, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-all', color: 'text.secondary' }}>
                            {ticket.raw}
                        </Typography>
                    </Box>
                </Box>
            </Collapse>
        </Box>
    );
}

function IssueRow({ issue }: { issue: ValidationIssue }) {
    const icon =
        issue.severity === 'error' ? <XCircle size={16} color="#dc2626" /> :
        issue.severity === 'warning' ? <AlertTriangle size={16} color="#d97706" /> :
        <Info size={16} color="#2563eb" />;

    const color =
        issue.severity === 'error' ? '#dc2626' :
        issue.severity === 'warning' ? '#d97706' :
        '#2563eb';

    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: 0.5 }}>
            <Box sx={{ flexShrink: 0, mt: 0.25 }}>{icon}</Box>
            <Typography variant="body2" sx={{ color }}>
                {issue.message}
            </Typography>
        </Box>
    );
}
