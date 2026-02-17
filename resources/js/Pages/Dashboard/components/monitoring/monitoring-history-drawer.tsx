import { useState, useCallback } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import dayjs from 'dayjs';

import { Iconify } from 'src/components/iconify';
import type { MonitoringEvent, EventStatus } from 'src/types/monitoring';
import { pnmEventsConfig } from 'src/config/pnm-events-config';

function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

type MonitoringHistoryDrawerProps = { open: boolean; onClose: () => void };

const STATUS_COLORS: Record<EventStatus, 'default' | 'success' | 'error' | 'warning'> = {
    pending: 'default', verified: 'success', issue: 'error', skipped: 'warning',
};
const STATUS_LABELS: Record<EventStatus, string> = {
    pending: 'En attente', verified: 'Vérifié', issue: 'Problème', skipped: 'Ignoré',
};

export function MonitoringHistoryDrawer({ open, onClose }: MonitoringHistoryDrawerProps) {
    const [selectedDate, setSelectedDate] = useState(dayjs().subtract(1, 'day').format('YYYY-MM-DD'));
    const [events, setEvents] = useState<MonitoringEvent[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchHistory = useCallback(async (date: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/monitoring?date=${date}`, {
                headers: { Accept: 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
                credentials: 'same-origin',
            });
            if (response.ok) {
                const data = await response.json();
                setEvents(data.events);
            }
        } catch { /* silently fail */ } finally { setLoading(false); }
    }, []);

    const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value;
        setSelectedDate(date);
        if (date) fetchHistory(date);
    }, [fetchHistory]);

    const eventMap = new Map<string, MonitoringEvent>();
    for (const ev of events) eventMap.set(ev.event_type, ev);

    return (
        <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}>
            <Box sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>Historique Monitoring</Typography>
                    <IconButton onClick={onClose} size="small"><Iconify icon="solar:close-circle-bold" width={20} /></IconButton>
                </Stack>

                <TextField type="date" label="Date" value={selectedDate} onChange={handleDateChange} size="small" fullWidth
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: dayjs().subtract(1, 'day').format('YYYY-MM-DD') } }} />

                <Divider sx={{ my: 2 }} />

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={32} /></Box>
                ) : events.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        Aucun événement enregistré pour cette date.
                    </Typography>
                ) : (
                    <Stack spacing={1.5}>
                        {pnmEventsConfig.map((config) => {
                            const dbEvent = eventMap.get(config.key);
                            if (!dbEvent) return null;
                            return (
                                <Box key={config.key} sx={{ p: 1.5, borderRadius: 1.5, border: 1, borderColor: 'divider' }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Iconify icon={config.icon} width={18} />
                                        <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>{config.label}</Typography>
                                        <Chip label={STATUS_LABELS[dbEvent.status as EventStatus]} color={STATUS_COLORS[dbEvent.status as EventStatus]} size="small" />
                                    </Stack>
                                    {dbEvent.notes && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{dbEvent.notes}</Typography>}
                                    {dbEvent.verified_at && <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>Vérifié le {dayjs(dbEvent.verified_at).format('DD/MM HH:mm')}</Typography>}
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </Box>
        </Drawer>
    );
}
