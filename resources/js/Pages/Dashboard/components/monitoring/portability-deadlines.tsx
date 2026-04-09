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

function addWorkingDays(from: Date, n: number): Date {
  let d = new Date(from);
  let count = 0;
  while (count < n) {
    d.setDate(d.getDate() + 1);
    while (!isWorkingDay(d)) d.setDate(d.getDate() + 1);
    count++;
  }
  return d;
}

function subtractWorkingDays(from: Date, n: number): Date {
  let d = new Date(from);
  let count = 0;
  while (count < n) {
    d.setDate(d.getDate() - 1);
    while (!isWorkingDay(d)) d.setDate(d.getDate() - 1);
    count++;
  }
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

function formatDateLong(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

// ─── Vacations et echeances ─────────────────────────────────────────────────

type VacationSlot = { hour: number; label: string };

const VACATIONS: VacationSlot[] = [
  { hour: 10, label: '10H' },
  { hour: 14, label: '14H' },
  { hour: 19, label: '19H' },
];

/** Determine la prochaine vacation 1210 possible par rapport a maintenant */
function getNextDeadlineInfo(jpDate: Date, now: Date) {
  // JD+1 = veille ouvrée du portage
  const jd1 = subtractWorkingDays(jpDate, 1);
  // Deadline 1210 = JD+1 a 10H max
  const deadline1210 = new Date(jd1);
  deadline1210.setHours(10, 0, 0, 0);

  // Deadline 1410 = JD+1 a 14H max
  const deadline1410 = new Date(jd1);
  deadline1410.setHours(14, 0, 0, 0);

  const isPast1210 = now > deadline1210;
  const isPast1410 = now > deadline1410;

  // Prochaine vacation pour 1210
  let nextVacation1210 = '';
  if (!isPast1210) {
    // JD = 2 jours ouvres avant JP
    const jd = subtractWorkingDays(jpDate, 2);
    // 1210 peut arriver a JD 14H, JD 19H, ou JD+1 10H
    const slots = [
      { date: jd, hour: 14 },
      { date: jd, hour: 19 },
      { date: jd1, hour: 10 },
    ];
    for (const slot of slots) {
      const slotTime = new Date(slot.date);
      slotTime.setHours(slot.hour, 0, 0, 0);
      if (now < slotTime) {
        nextVacation1210 = `${formatDate(slot.date)} ${slot.hour}H`;
        break;
      }
    }
    if (!nextVacation1210) nextVacation1210 = `${formatDate(jd1)} 10H`;
  }

  return { deadline1210, deadline1410, isPast1210, isPast1410, nextVacation1210 };
}

// ─── Component ──────────────────────────────────────────────────────────────

export function PortabilityDeadlines() {
  const data = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Trouver les 3 prochains jours de portage
    const items: {
      jpDate: Date;
      label: string;
      tag: string | null;
      tagColor: 'primary' | 'warning' | 'default';
      info: ReturnType<typeof getNextDeadlineInfo>;
    }[] = [];

    let checkDate = new Date(today);
    for (let i = 0; i < 10 && items.length < 3; i++) {
      if (isWorkingDay(checkDate)) {
        const jp = new Date(checkDate);
        const isToday = jp.toDateString() === today.toDateString();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const isTomorrow = jp.toDateString() === tomorrow.toDateString();

        items.push({
          jpDate: jp,
          label: formatDateLong(jp),
          tag: isToday ? "AUJOURD'HUI" : isTomorrow ? 'DEMAIN' : null,
          tagColor: isToday ? 'primary' : 'warning',
          info: getNextDeadlineInfo(jp, now),
        });
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }

    return items;
  }, []);

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
      <Stack spacing={2}>
        {/* Header */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="solar:calendar-bold-duotone" width={22} sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle1" fontWeight={700}>
            Echeances portabilite
          </Typography>
          <Typography variant="caption" color="text.secondary">
            — Cas standard JD+2
          </Typography>
        </Stack>

        {/* Portage dates */}
        <Stack spacing={1.5}>
          {data.map((item) => {
            const { info } = item;
            return (
              <Box
                key={item.jpDate.toISOString()}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1.5,
                  borderRadius: 1.5,
                  border: item.tag === "AUJOURD'HUI" ? '2px solid' : '1px solid',
                  borderColor: item.tag === "AUJOURD'HUI" ? 'primary.main' : 'divider',
                  bgcolor: item.tag === "AUJOURD'HUI" ? 'primary.lighter' : 'transparent',
                }}
              >
                {/* Date portage */}
                <Box sx={{ minWidth: 120, flexShrink: 0 }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Iconify icon="solar:transfer-horizontal-bold-duotone" width={18} sx={{ color: '#8b5cf6' }} />
                    <Typography variant="body2" fontWeight={700}>
                      {formatDate(item.jpDate)}
                    </Typography>
                  </Stack>
                  {item.tag && (
                    <Chip label={item.tag} size="small" color={item.tagColor} sx={{ fontSize: '0.6rem', height: 18, fontWeight: 800, mt: 0.5 }} />
                  )}
                </Box>

                {/* Echeance 1210 */}
                <Box sx={{ flex: 1 }}>
                  {info.isPast1210 ? (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Iconify icon="solar:check-circle-bold" width={16} sx={{ color: '#22c55e' }} />
                      <Typography variant="body2" color="text.secondary">
                        Delai 1210 expire
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="body2">
                      <Typography component="span" variant="body2" fontWeight={700} sx={{ color: '#22c55e' }}>
                        1210
                      </Typography>
                      {' attendu avant '}
                      <Typography component="span" variant="body2" fontWeight={700}>
                        {info.nextVacation1210}
                      </Typography>
                    </Typography>
                  )}
                </Box>

                {/* Echeance 1410 */}
                <Box sx={{ flex: 1 }}>
                  {info.isPast1410 ? (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Iconify icon="solar:check-circle-bold" width={16} sx={{ color: '#3b82f6' }} />
                      <Typography variant="body2" color="text.secondary">
                        Delai 1410 expire
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="body2">
                      <Typography component="span" variant="body2" fontWeight={700} sx={{ color: '#3b82f6' }}>
                        1410
                      </Typography>
                      {' avant '}
                      <Typography component="span" variant="body2" fontWeight={700}>
                        {formatDate(subtractWorkingDays(item.jpDate, 1))} 14H
                      </Typography>
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
}
