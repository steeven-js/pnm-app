import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ─── Helpers ────────────────────────────────────────────────────────────────

const HOLIDAYS_2026 = [
  '2026-01-01', '2026-02-17', '2026-02-18', '2026-03-12', '2026-04-03',
  '2026-04-06', '2026-05-01', '2026-05-08', '2026-05-14', '2026-05-22',
  '2026-05-25', '2026-05-27', '2026-05-28', '2026-06-10', '2026-07-14',
  '2026-08-15', '2026-10-09', '2026-11-01', '2026-11-02', '2026-11-11',
  '2026-12-25',
];

function isHoliday(date: Date): boolean {
  return HOLIDAYS_2026.includes(date.toISOString().slice(0, 10));
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isWorkingDay(date: Date): boolean {
  return !isWeekend(date) && !isHoliday(date);
}

function nextWorkingDay(from: Date): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + 1);
  while (!isWorkingDay(d)) d.setDate(d.getDate() + 1);
  return d;
}

function addWorkingDays(from: Date, n: number): Date {
  let d = new Date(from);
  let count = 0;
  while (count < n) {
    d = nextWorkingDay(d);
    count++;
  }
  return d;
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

function formatDateFull(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── Component ──────────────────────────────────────────────────────────────

type PortageDateInfo = {
  jpDate: Date;
  jpLabel: string;
  jdDate: Date;
  deadlines: { ticket: string; date: string; time: string; color: string }[];
  isToday: boolean;
  isTomorrow: boolean;
};

export function PortabilityDeadlines() {
  const data = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Trouver les prochains jours de portage (JP) pour les 5 prochains jours ouvres
    const portageDates: PortageDateInfo[] = [];
    let checkDate = new Date(today);

    // On cherche les JP a venir (portages prevus dans les prochains jours)
    for (let i = 0; i < 7; i++) {
      if (isWorkingDay(checkDate)) {
        const jp = checkDate;
        // JD = JP - 2 jours ouvres (la demande a ete faite 2 jours ouvres avant)
        let jdCandidate = new Date(jp);
        let workDaysBack = 0;
        while (workDaysBack < 2) {
          jdCandidate.setDate(jdCandidate.getDate() - 1);
          if (isWorkingDay(jdCandidate)) workDaysBack++;
        }
        const jd = jdCandidate;
        const jd1 = addWorkingDays(jd, 1);

        const isJpToday = jp.toDateString() === today.toDateString();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const isJpTomorrow = jp.toDateString() === tomorrow.toDateString();

        let jpLabel: string;
        if (isJpToday) jpLabel = "Aujourd'hui";
        else if (isJpTomorrow) jpLabel = 'Demain';
        else jpLabel = formatDateShort(jp);

        portageDates.push({
          jpDate: jp,
          jpLabel,
          jdDate: jd,
          isToday: isJpToday,
          isTomorrow: isJpTomorrow,
          deadlines: [
            {
              ticket: '1210/1220',
              date: formatDateShort(jd1),
              time: '10H00',
              color: '#22c55e',
            },
            {
              ticket: '1410',
              date: formatDateShort(jd1),
              time: '14H00',
              color: '#3b82f6',
            },
            {
              ticket: 'Bascule',
              date: formatDateShort(jp),
              time: '08H30-10H00',
              color: '#8b5cf6',
            },
            {
              ticket: '1430',
              date: formatDateShort(jp),
              time: '19H00',
              color: '#06b6d4',
            },
          ],
        });

        if (portageDates.length >= 3) break;
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }

    return portageDates;
  }, []);

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
      <Stack spacing={2.5}>
        {/* Header */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Iconify icon="solar:calendar-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Prochaines echeances de portage
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Cas standard JD+2 jours ouvres — Hors week-end et jours feries GPMAG
            </Typography>
          </Box>
        </Stack>

        {/* Portage dates */}
        <Stack spacing={2}>
          {data.map((portage) => (
            <Box
              key={portage.jpDate.toISOString()}
              sx={{
                p: 2,
                borderRadius: 1.5,
                border: portage.isToday ? '2px solid' : '1px solid',
                borderColor: portage.isToday ? 'primary.main' : 'divider',
                bgcolor: portage.isToday ? 'primary.lighter' : 'transparent',
              }}
            >
              {/* Date de portage */}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <Iconify
                  icon="solar:transfer-horizontal-bold-duotone"
                  width={20}
                  sx={{ color: portage.isToday ? 'primary.main' : 'text.secondary' }}
                />
                <Typography variant="subtitle2" fontWeight={700}>
                  Portage prevu : {portage.jpLabel}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({formatDateFull(portage.jpDate)})
                </Typography>
                {portage.isToday && (
                  <Chip label="AUJOURD'HUI" size="small" color="primary" sx={{ fontSize: '0.65rem', height: 20, fontWeight: 800 }} />
                )}
                {portage.isTomorrow && (
                  <Chip label="DEMAIN" size="small" color="warning" sx={{ fontSize: '0.65rem', height: 20, fontWeight: 800 }} />
                )}
              </Stack>

              {/* Demande JD */}
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Demandes deposees le {formatDateShort(portage.jdDate)} (JD)
              </Typography>

              {/* Deadlines row */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {portage.deadlines.map((d) => (
                  <Box
                    key={d.ticket}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 1,
                      bgcolor: `${d.color}10`,
                      border: `1px solid ${d.color}30`,
                    }}
                  >
                    <Chip
                      label={d.ticket}
                      size="small"
                      sx={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        height: 18,
                        bgcolor: `${d.color}20`,
                        color: d.color,
                      }}
                    />
                    <Typography variant="caption" fontWeight={700} sx={{ color: d.color }}>
                      {d.date} {d.time}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>

        {/* Source */}
        <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'right' }}>
          Source : GPMAG ANNEXE 1 Ter — Cas standard JD+2 jours ouvres
        </Typography>
      </Stack>
    </Paper>
  );
}
