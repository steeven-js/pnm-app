import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/fr';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('fr');

import { Iconify } from 'src/components/iconify';
import type { MonitoringData, EventStatus, MonitoringEvent } from 'src/types/monitoring';
import { useMartiniqueTime } from 'src/hooks/use-martinique-time';
import { usePnmEvents } from 'src/hooks/use-pnm-events';

import { TimelineClock } from './timeline-clock';
import { HolidayBanner } from './holiday-banner';
import { TimelineTrack } from './timeline-track';
import { TimelineLegend } from './timeline-legend';
import { EventDetailPanel } from './event-detail-panel';

const TZ = 'America/Martinique';

function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

type MonitoringTimelineProps = { monitoring: MonitoringData };

export function MonitoringTimeline({ monitoring }: MonitoringTimelineProps) {
    const { timeString, dateString, now } = useMartiniqueTime();
    const todayStr = now.format('YYYY-MM-DD');

    // Date navigation state
    const [viewDate, setViewDate] = useState<string | null>(null); // null = today (live)
    const [historyEvents, setHistoryEvents] = useState<MonitoringEvent[]>([]);
    const [historyHoliday, setHistoryHoliday] = useState<{ isHoliday: boolean; holidayDetails: MonitoringData['holidayDetails'] }>({ isHoliday: false, holidayDetails: [] });
    const [loadingHistory, setLoadingHistory] = useState(false);

    const isToday = viewDate === null;
    const displayDate = isToday ? todayStr : viewDate;

    // Today's events (live)
    const [dbEvents, setDbEvents] = useState<MonitoringEvent[]>(monitoring.events);
    const currentTimeForEnrichment = isToday ? now.format('HH:mm') : '23:59';
    const activeDbEvents = isToday ? dbEvents : historyEvents;
    const enrichedEvents = usePnmEvents(activeDbEvents, currentTimeForEnrichment);

    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success',
    });

    const selectedEvent = enrichedEvents.find((e) => e.key === selectedKey) ?? null;

    // Fetch events for a specific date
    const fetchDateEvents = useCallback(async (date: string) => {
        setLoadingHistory(true);
        setSelectedKey(null);
        try {
            const response = await fetch(`/api/monitoring?date=${date}`, {
                headers: { Accept: 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
                credentials: 'same-origin',
            });
            if (response.ok) {
                const data = await response.json();
                setHistoryEvents(data.events);
                setHistoryHoliday({ isHoliday: data.is_holiday, holidayDetails: data.holiday_details ?? [] });
            }
        } catch { /* silently fail */ } finally { setLoadingHistory(false); }
    }, []);

    const navigateDate = useCallback((direction: 'prev' | 'next') => {
        const current = dayjs(displayDate).tz(TZ);
        const target = direction === 'prev' ? current.subtract(1, 'day') : current.add(1, 'day');
        const targetStr = target.format('YYYY-MM-DD');

        if (targetStr === todayStr) {
            setViewDate(null);
            setSelectedKey(null);
        } else if (targetStr <= todayStr) {
            setViewDate(targetStr);
            fetchDateEvents(targetStr);
        }
    }, [displayDate, todayStr, fetchDateEvents]);

    const goToToday = useCallback(() => {
        setViewDate(null);
        setSelectedKey(null);
    }, []);

    const handleDatePick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value;
        if (!date) return;
        if (date === todayStr) { goToToday(); return; }
        if (date > todayStr) return;
        setViewDate(date);
        fetchDateEvents(date);
    }, [todayStr, goToToday, fetchDateEvents]);

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

    const isHoliday = isToday ? monitoring.isHoliday : historyHoliday.isHoliday;
    const holidayDetails = isToday ? monitoring.holidayDetails : historyHoliday.holidayDetails;

    const canGoNext = !isToday && viewDate! < todayStr;
    const formattedViewDate = viewDate ? dayjs(viewDate).tz(TZ).format('dddd D MMMM YYYY') : '';

    return (
        <>
            <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
                    {/* Left side: clock or date navigation */}
                    {isToday ? (
                        <TimelineClock timeString={timeString} dateString={dateString} />
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                                icon={<Iconify icon="solar:history-bold" width={16} />}
                                label={formattedViewDate}
                                color="warning"
                                variant="soft"
                                sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                            />
                        </Box>
                    )}

                    {/* Right side: progress + date nav */}
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box sx={{ minWidth: 140 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
                                <Typography variant="caption" fontWeight={600}>{treatedEvents}/{totalEvents}</Typography>
                                <Typography variant="caption" color="text.secondary">traités</Typography>
                            </Stack>
                            <LinearProgress variant="determinate" value={progressPercent} color="success" sx={{ height: 6, borderRadius: 3 }} />
                        </Box>

                        {/* Date navigation */}
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                            <IconButton size="small" onClick={() => navigateDate('prev')} title="Jour précédent">
                                <Iconify icon="solar:alt-arrow-left-bold" width={18} />
                            </IconButton>

                            <Box
                                component="input"
                                type="date"
                                value={displayDate}
                                max={todayStr}
                                onChange={handleDatePick}
                                sx={{
                                    border: 1, borderColor: 'divider', borderRadius: 1,
                                    px: 1, py: 0.5, fontSize: '0.75rem',
                                    bgcolor: 'background.paper', cursor: 'pointer',
                                    '&::-webkit-calendar-picker-indicator': { cursor: 'pointer' },
                                }}
                            />

                            <IconButton size="small" onClick={() => navigateDate('next')} disabled={!canGoNext} title="Jour suivant">
                                <Iconify icon="solar:alt-arrow-right-bold" width={18} />
                            </IconButton>

                            {!isToday && (
                                <Button size="small" variant="soft" color="primary" onClick={goToToday} startIcon={<Iconify icon="solar:refresh-bold" width={16} />}>
                                    Aujourd&apos;hui
                                </Button>
                            )}
                        </Stack>
                    </Stack>
                </Stack>

                {isHoliday && <HolidayBanner holidayDetails={holidayDetails} />}

                {loadingHistory ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress size={32} />
                    </Box>
                ) : (
                    <>
                        <Box sx={{ overflow: 'auto', pb: 1 }}>
                            <Box sx={{ minWidth: 700 }}>
                                <TimelineTrack events={enrichedEvents} selectedKey={selectedKey} onSelect={handleSelect} />
                            </Box>
                        </Box>

                        <Box sx={{ mt: 1.5, mb: 0.5 }}><TimelineLegend /></Box>

                        <EventDetailPanel event={selectedEvent} onSave={handleSave} saving={saving} readOnly={!isToday} />
                    </>
                )}
            </Paper>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </>
    );
}
