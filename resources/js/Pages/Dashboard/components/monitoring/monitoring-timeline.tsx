import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { Iconify } from 'src/components/iconify';
import type { MonitoringData, EventStatus, MonitoringEvent } from 'src/types/monitoring';
import { useMartiniqueTime } from 'src/hooks/use-martinique-time';
import { usePnmEvents } from 'src/hooks/use-pnm-events';

import { TimelineClock } from './timeline-clock';
import { HolidayBanner } from './holiday-banner';
import { TimelineTrack } from './timeline-track';
import { TimelineLegend } from './timeline-legend';
import { EventDetailPanel } from './event-detail-panel';
import { MonitoringHistoryDrawer } from './monitoring-history-drawer';

function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

type MonitoringTimelineProps = { monitoring: MonitoringData };

export function MonitoringTimeline({ monitoring }: MonitoringTimelineProps) {
    const { timeString, dateString, now } = useMartiniqueTime();
    const [dbEvents, setDbEvents] = useState<MonitoringEvent[]>(monitoring.events);
    const enrichedEvents = usePnmEvents(dbEvents, now.format('HH:mm'));

    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success',
    });

    const selectedEvent = enrichedEvents.find((e) => e.key === selectedKey) ?? null;

    const handleSelect = useCallback((key: string) => {
        setSelectedKey((prev) => (prev === key ? null : key));
    }, []);

    const handleSave = useCallback(async (eventKey: string, status: EventStatus, checkedItems: string[], notes: string) => {
        setSaving(true);
        try {
            const response = await fetch('/api/monitoring', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
                credentials: 'same-origin',
                body: JSON.stringify({
                    event_type: eventKey, event_date: now.format('YYYY-MM-DD'), status, checked_items: checkedItems, notes: notes || null,
                }),
            });
            if (!response.ok) throw new Error('Save failed');

            const savedEvent: MonitoringEvent = await response.json();
            setDbEvents((prev) => {
                const idx = prev.findIndex((e) => e.event_type === eventKey);
                if (idx >= 0) { const next = [...prev]; next[idx] = savedEvent; return next; }
                return [...prev, savedEvent];
            });
            setSnackbar({ open: true, message: `Événement marqué comme "${status}"`, severity: 'success' });
        } catch {
            setSnackbar({ open: true, message: 'Erreur lors de la sauvegarde', severity: 'error' });
        } finally { setSaving(false); }
    }, [now]);

    const totalEvents = enrichedEvents.length;
    const treatedEvents = enrichedEvents.filter((e) => e.status !== 'pending').length;
    const progressPercent = totalEvents > 0 ? (treatedEvents / totalEvents) * 100 : 0;

    return (
        <>
            <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
                    <TimelineClock timeString={timeString} dateString={dateString} />
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Box sx={{ minWidth: 160 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
                                <Typography variant="caption" fontWeight={600}>{treatedEvents}/{totalEvents}</Typography>
                                <Typography variant="caption" color="text.secondary">traités</Typography>
                            </Stack>
                            <LinearProgress variant="determinate" value={progressPercent} color="success" sx={{ height: 6, borderRadius: 3 }} />
                        </Box>
                        <Button size="small" variant="outlined" startIcon={<Iconify icon="solar:clock-circle-bold-duotone" width={18} />} onClick={() => setDrawerOpen(true)}>
                            Historique
                        </Button>
                    </Stack>
                </Stack>

                {monitoring.isHoliday && <HolidayBanner holidayDetails={monitoring.holidayDetails} />}

                <Box sx={{ overflow: 'auto', pb: 1 }}>
                    <Box sx={{ minWidth: 700 }}>
                        <TimelineTrack events={enrichedEvents} selectedKey={selectedKey} onSelect={handleSelect} />
                    </Box>
                </Box>

                <Box sx={{ mt: 1.5, mb: 0.5 }}><TimelineLegend /></Box>

                <EventDetailPanel event={selectedEvent} onSave={handleSave} saving={saving} />
            </Paper>

            <MonitoringHistoryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </>
    );
}
