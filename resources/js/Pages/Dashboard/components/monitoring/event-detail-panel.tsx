import { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';

import { Iconify } from 'src/components/iconify';
import type { EnrichedPnmEvent, EventStatus } from 'src/types/monitoring';
import { EventChecklist } from './event-checklist';
import { EventNotes } from './event-notes';

type EventDetailPanelProps = {
    event: EnrichedPnmEvent | null;
    onSave: (eventKey: string, status: EventStatus, checkedItems: string[], notes: string) => void;
    saving?: boolean;
    readOnly?: boolean;
};

const STATUS_LABELS: Record<EventStatus, { label: string; color: 'default' | 'success' | 'error' | 'warning' }> = {
    pending: { label: 'En attente', color: 'default' },
    verified: { label: 'Vérifié', color: 'success' },
    issue: { label: 'Problème', color: 'error' },
    skipped: { label: 'Ignoré', color: 'warning' },
};

export function EventDetailPanel({ event, onSave, saving = false, readOnly = false }: EventDetailPanelProps) {
    const [checkedItems, setCheckedItems] = useState<string[]>([]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (event) {
            setCheckedItems(event.dbEvent?.checked_items ?? []);
            setNotes(event.dbEvent?.notes ?? '');
        }
    }, [event?.key, event?.dbEvent]);

    const handleSave = useCallback(
        (status: EventStatus) => {
            if (!event) return;
            onSave(event.key, status, checkedItems, notes);
        },
        [event, checkedItems, notes, onSave],
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
                        <Chip label={STATUS_LABELS[event.status].label} color={STATUS_LABELS[event.status].color} size="small" />
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{event.description}</Typography>

                    <Divider sx={{ mb: 2 }} />

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
                </Box>
            )}
        </Collapse>
    );
}
