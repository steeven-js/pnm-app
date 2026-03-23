import { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { Iconify } from 'src/components/iconify';
import type { EnrichedPnmEvent, EventStatus, EmailSubject } from 'src/types/monitoring';
import { SUPPORTED_EVENT_KEYS } from 'src/utils/parse-mgrntlog';
import type { ParsedIncidentEmail, ParsedIncident } from 'src/lib/pnm-utils';
import { EventChecklist } from './event-checklist';
import { EventNotes } from './event-notes';
import { LogPasteDialog } from './log-paste-dialog';

type EventDetailPanelProps = {
    event: EnrichedPnmEvent | null;
    onSave: (eventKey: string, status: EventStatus, checkedItems: string[], notes: string, metadata?: Record<string, unknown>) => void;
    saving?: boolean;
    readOnly?: boolean;
};

function EmailSubjectRow({ item }: { item: EmailSubject }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(item.subject);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [item.subject]);

    return (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.5 }}>
            <Chip
                label={item.origin === 'internal' ? 'Interne' : 'Externe'}
                size="small"
                color={item.origin === 'internal' ? 'info' : 'warning'}
                variant="soft"
                sx={{ minWidth: 64, fontSize: '0.7rem' }}
            />
            <Typography
                variant="body2"
                sx={{
                    flex: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    bgcolor: 'action.hover',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    userSelect: 'all',
                }}
            >
                {item.subject}
            </Typography>
            <Tooltip title={copied ? 'Copie !' : 'Copier pour rechercher'}>
                <IconButton size="small" onClick={handleCopy}>
                    <Iconify
                        icon={copied ? 'solar:check-circle-bold' : 'solar:copy-linear'}
                        width={18}
                        color={copied ? 'success.main' : undefined}
                    />
                </IconButton>
            </Tooltip>
        </Stack>
    );
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [text]);

    return (
        <Tooltip title={copied ? 'Copié !' : 'Copier la commande'}>
            <IconButton
                size="small"
                onClick={handleCopy}
                sx={{ position: 'absolute', top: 4, right: 4, color: 'grey.400', '&:hover': { color: 'grey.100' } }}
            >
                <Iconify icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold'} width={16} />
            </IconButton>
        </Tooltip>
    );
}

const STATUS_LABELS: Record<EventStatus, { label: string; color: 'default' | 'success' | 'error' | 'warning' }> = {
    pending: { label: 'En attente', color: 'default' },
    verified: { label: 'Vérifié', color: 'success' },
    issue: { label: 'Problème', color: 'error' },
    skipped: { label: 'Ignoré', color: 'warning' },
};

// ---------------------------------------------------------------------------
// Incident detail block — structured view of parsed incident email
// ---------------------------------------------------------------------------

const INCIDENT_TYPE_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
    refusals: { label: 'Refus 1210/1220', color: '#d32f2f', bgColor: '#d32f2f18' },
    fileErrors: { label: 'Erreurs 7000', color: '#ed6c02', bgColor: '#ed6c0218' },
    arNonRecu: { label: 'AR non-reçus', color: '#9c27b0', bgColor: '#9c27b018' },
    fileNotAck: { label: 'Non acquittés', color: '#0288d1', bgColor: '#0288d118' },
};

function SummaryChip({ type, count }: { type: string; count: number }) {
    const cfg = INCIDENT_TYPE_LABELS[type];
    if (!cfg || count === 0) return null;
    return (
        <Chip
            label={`${count} ${cfg.label}`}
            size="small"
            sx={{ bgcolor: cfg.bgColor, color: cfg.color, fontWeight: 600, fontSize: '0.75rem' }}
        />
    );
}

function IncidentDetailBlock({ data }: { data: ParsedIncidentEmail }) {
    const { incidents, summary, operatorsInvolved, msisdnsConcerned } = data;
    const hasAny = summary.refusals + summary.fileErrors + summary.arNonRecu + summary.fileNotAck > 0;
    if (!hasAny) return null;

    const fileErrors = incidents.filter((i): i is Extract<ParsedIncident, { type: 'file_error' }> => i.type === 'file_error');
    const arNonRecus = incidents.filter((i): i is Extract<ParsedIncident, { type: 'ar_non_recu' }> => i.type === 'ar_non_recu');
    const fileNotAcks = incidents.filter((i): i is Extract<ParsedIncident, { type: 'file_not_ack' }> => i.type === 'file_not_ack');

    return (
        <Box sx={{ mb: 2, p: 2, borderRadius: 1.5, bgcolor: '#fff3e018', border: '1px solid', borderColor: 'warning.light' }}>
            {/* Title */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                Analyse de l'email incident
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                Le systeme PNM envoie un email automatique quand des anomalies sont detectees lors des echanges de fichiers de portabilite entre operateurs.
                Voici le detail des incidents trouves dans cet email.
            </Typography>

            {/* Summary chips */}
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                <SummaryChip type="refusals" count={summary.refusals} />
                <SummaryChip type="fileErrors" count={summary.fileErrors} />
                <SummaryChip type="arNonRecu" count={summary.arNonRecu} />
                <SummaryChip type="fileNotAck" count={summary.fileNotAck} />
            </Stack>

            {/* Operators involved */}
            {operatorsInvolved.length > 0 && (
                <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                        Operateurs concernes
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.5 }}>
                        Les operateurs impliques dans les incidents (expediteur et destinataire des fichiers PNMDATA).
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {operatorsInvolved.map((op) => (
                            <Chip key={op} label={op} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                        ))}
                    </Stack>
                </Box>
            )}

            {/* MSISDN concerned */}
            {msisdnsConcerned.length > 0 && (
                <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                        Numeros de telephone (MSISDN) concernes
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.5 }}>
                        Les numeros de mobile dont le portage a rencontre un probleme. Vous pouvez les rechercher dans l'outil Verify pour plus de details.
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontSize: '0.75rem', bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 0.75 }}
                    >
                        {msisdnsConcerned.join(', ')}
                    </Typography>
                </Box>
            )}

            <Divider sx={{ my: 1.5 }} />

            {/* File errors detail */}
            {fileErrors.length > 0 && (
                <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" fontWeight={600} sx={{ color: INCIDENT_TYPE_LABELS.fileErrors.color, display: 'block', mb: 0.25 }}>
                        Erreurs dans les fichiers ({fileErrors.length})
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.75 }}>
                        Des tickets de portage contenus dans un fichier PNMDATA ont ete rejetes ou ont provoque une erreur.
                        Les refus (1210/1220) signifient que l'operateur destinataire a refuse le portage.
                        Les erreurs 7000 indiquent un dysfonctionnement technique (ex: doublon, donnees incoherentes).
                    </Typography>
                    {fileErrors.map((fe, idx) => (
                        <Box key={idx} sx={{ mb: 1, pl: 1, borderLeft: '2px solid', borderColor: 'warning.light' }}>
                            <Typography variant="caption" fontWeight={600} sx={{ fontFamily: 'monospace', display: 'block' }}>
                                {fe.filenameParsed.valid
                                    ? `${fe.filenameParsed.sourceOperatorName} \u2192 ${fe.filenameParsed.destOperatorName} (${fe.filename})`
                                    : fe.filename}
                            </Typography>
                            {fe.filenameParsed.valid && (
                                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.25 }}>
                                    Fichier envoye le {fe.filenameParsed.formattedDate}
                                </Typography>
                            )}
                            <Stack direction="row" spacing={0.5} sx={{ mb: 0.25 }}>
                                {fe.refusalCount > 0 && (
                                    <Chip label={`${fe.refusalCount} refus`} size="small" sx={{ bgcolor: '#d32f2f18', color: '#d32f2f', fontSize: '0.7rem', height: 20 }} />
                                )}
                                {fe.errorCount > 0 && (
                                    <Chip label={`${fe.errorCount} erreurs 7000`} size="small" sx={{ bgcolor: '#ed6c0218', color: '#ed6c02', fontSize: '0.7rem', height: 20 }} />
                                )}
                            </Stack>
                            {fe.tickets.length > 0 && (
                                <Box component="table" sx={{ mt: 0.5, width: '100%', fontSize: '0.7rem', fontFamily: 'monospace', '& td, & th': { px: 0.75, py: 0.25, textAlign: 'left' }, '& th': { fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' } }}>
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>MSISDN</th>
                                            <th>Motif</th>
                                            <th>Operateurs</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fe.tickets.slice(0, 10).map((t, ti) => (
                                            <tr key={ti}>
                                                <td>{t.code}</td>
                                                <td>{t.msisdn || '\u2014'}</td>
                                                <td title={t.description}>{t.errorCodeLabel || t.responseCodeLabel || '\u2014'}</td>
                                                <td>{[t.oprName, t.opdName].filter(Boolean).join(' \u2192 ') || '\u2014'}</td>
                                                <td>{t.formattedDate || '\u2014'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Box>
                            )}
                        </Box>
                    ))}
                </Box>
            )}

            {/* AR non reçus */}
            {arNonRecus.length > 0 && (
                <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" fontWeight={600} sx={{ color: INCIDENT_TYPE_LABELS.arNonRecu.color, display: 'block', mb: 0.25 }}>
                        Accuses de reception non recus ({arNonRecus.length})
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.75 }}>
                        Quand un operateur envoie un fichier PNMDATA, l'operateur destinataire doit renvoyer un accuse de reception (AR) dans un delai de 60 minutes.
                        Si l'AR n'est pas recu a temps, cela peut indiquer un probleme chez l'operateur destinataire. Il faut le contacter.
                    </Typography>
                    {arNonRecus.map((ar, idx) => (
                        <Box key={idx} sx={{ pl: 1, mb: 0.5, borderLeft: '2px solid', borderColor: '#9c27b040' }}>
                            <Typography variant="caption" fontWeight={600} sx={{ fontFamily: 'monospace', display: 'block' }}>
                                {ar.filenameParsed.valid
                                    ? `${ar.filenameParsed.sourceOperatorName} \u2192 ${ar.filenameParsed.destOperatorName}`
                                    : ar.filename}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Envoye par {ar.senderName} (code {ar.senderCode}) - en attente depuis {ar.delayMinutes} min
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}

            {/* Fichiers non acquittés */}
            {fileNotAcks.length > 0 && (
                <Box>
                    <Typography variant="caption" fontWeight={600} sx={{ color: INCIDENT_TYPE_LABELS.fileNotAck.color, display: 'block', mb: 0.25 }}>
                        Fichiers non acquittes ({fileNotAcks.length})
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.75 }}>
                        Un fichier PNMDATA envoye a un operateur n'a pas ete acquitte (confirme comme recu et traite).
                        Si ce probleme se repete sur plusieurs vacations, il faut le signaler a la supervision.
                    </Typography>
                    {fileNotAcks.map((fna, idx) => (
                        <Box key={idx} sx={{ pl: 1, mb: 0.5, borderLeft: '2px solid', borderColor: '#0288d140' }}>
                            <Typography variant="caption" fontWeight={600} sx={{ fontFamily: 'monospace', display: 'block' }}>
                                {fna.filenameParsed.valid
                                    ? `${fna.filenameParsed.sourceOperatorName} \u2192 ${fna.filenameParsed.destOperatorName}`
                                    : fna.filename}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                L'operateur {fna.recipientName} (code {fna.recipientCode}) n'a pas acquitte ce fichier
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}

export function EventDetailPanel({ event, onSave, saving = false, readOnly = false }: EventDetailPanelProps) {
    const [checkedItems, setCheckedItems] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [logDialogOpen, setLogDialogOpen] = useState(false);
    const [incidentData, setIncidentData] = useState<ParsedIncidentEmail | null>(null);
    const [eventMetadata, setEventMetadata] = useState<Record<string, unknown> | undefined>(undefined);

    const supportsLogPaste = event
        ? SUPPORTED_EVENT_KEYS.includes(event.key) || event.key.startsWith('vacation_')
        : false;

    const handleLogApply = useCallback((autoChecked: string[], autoNotes: string, parsedData?: unknown, metadata?: Record<string, unknown>) => {
        setCheckedItems((prev) => [...new Set([...prev, ...autoChecked])]);
        setNotes((prev) => (prev ? `${prev}\n\n${autoNotes}` : autoNotes));
        if (parsedData && typeof parsedData === 'object' && 'incidents' in parsedData) {
            setIncidentData(parsedData as ParsedIncidentEmail);
        }
        if (metadata) {
            setEventMetadata((prev) => ({ ...prev, ...metadata }));
        }
    }, []);

    useEffect(() => {
        if (event) {
            setCheckedItems(event.dbEvent?.checked_items ?? []);
            setNotes(event.dbEvent?.notes ?? '');
            setIncidentData(null);
            setEventMetadata(undefined);
        }
    }, [event?.key, event?.dbEvent]);

    const handleSave = useCallback(
        (status: EventStatus) => {
            if (!event) return;
            onSave(event.key, status, checkedItems, notes, eventMetadata);
        },
        [event, checkedItems, notes, eventMetadata, onSave],
    );

    return (
        <Collapse in={event !== null} timeout={300}>
            {event && (
                <Box sx={{ mt: 2, p: 2.5, borderRadius: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                        <Iconify icon={event.icon} width={24} />
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight={700}>{event.label}</Typography>
                            <Typography variant="caption" color="text.secondary">{event.scheduledTime} — {event.category}</Typography>
                        </Box>
                        <Chip
                            icon={<Iconify icon={event.checkType === 'server' ? 'solar:monitor-bold' : 'solar:letter-bold'} width={14} />}
                            label={event.checkType === 'server' ? 'Serveur' : 'Email'}
                            size="small"
                            sx={{
                                bgcolor: event.checkType === 'server' ? '#06b6d418' : '#f59e0b18',
                                color: event.checkType === 'server' ? '#06b6d4' : '#f59e0b',
                                fontWeight: 600, fontSize: 11,
                            }}
                        />
                        <Chip label={STATUS_LABELS[event.status].label} color={STATUS_LABELS[event.status].color} size="small" />
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{event.description}</Typography>

                    {event.emailSubjects && event.emailSubjects.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                Rechercher dans la boite mail
                            </Typography>
                            {event.emailSubjects.map((es) => (
                                <EmailSubjectRow key={es.subject} item={es} />
                            ))}
                        </Box>
                    )}

                    <Divider sx={{ mb: 2 }} />

                    {event.sshCommands && event.sshCommands.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                Commande SSH (vmqproportasync01)
                            </Typography>
                            {event.sshCommands.map((cmd, idx) => (
                                <Box key={idx} sx={{ position: 'relative', mb: 0.5 }}>
                                    <Box sx={{ bgcolor: 'grey.900', color: 'grey.100', borderRadius: 1, p: 1, pr: 5, fontFamily: 'monospace', fontSize: '0.75rem', overflowX: 'auto' }}>
                                        $ {cmd}
                                    </Box>
                                    <CopyButton text={cmd} />
                                </Box>
                            ))}
                        </Box>
                    )}

                    {supportsLogPaste && !readOnly && (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Iconify icon="solar:clipboard-text-bold-duotone" width={18} />}
                            onClick={() => setLogDialogOpen(true)}
                            sx={{ mb: 1.5 }}
                        >
                            Auto-remplir depuis {event.checkType === 'server' ? 'log serveur' : 'email'}
                        </Button>
                    )}

                    {incidentData && <IncidentDetailBlock data={incidentData} />}

                    <EventChecklist items={event.checklist} checkedItems={checkedItems} onChange={setCheckedItems} readOnly={readOnly} />
                    <Box sx={{ mt: 2 }} />
                    <EventNotes value={notes} onChange={setNotes} readOnly={readOnly} />

                    {!readOnly && (
                        <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'flex-end' }}>
                            <Button variant="outlined" color="warning" size="small" onClick={() => handleSave('skipped')} disabled={saving}>Ignorer</Button>
                            <Button variant="outlined" color="error" size="small" onClick={() => handleSave('issue')} disabled={saving}>Signaler problème</Button>
                            <Button variant="contained" color="success" size="small" onClick={() => handleSave('verified')} disabled={saving}
                                startIcon={<Iconify icon="solar:check-circle-bold" width={18} />}>
                                Marquer vérifié
                            </Button>
                        </Stack>
                    )}

                    {supportsLogPaste && (
                        <LogPasteDialog
                            open={logDialogOpen}
                            onClose={() => setLogDialogOpen(false)}
                            eventKey={event.key}
                            checklist={event.checklist}
                            onApply={handleLogApply}
                        />
                    )}
                </Box>
            )}
        </Collapse>
    );
}
