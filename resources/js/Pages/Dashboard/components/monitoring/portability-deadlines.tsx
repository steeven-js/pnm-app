import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Liste des jours feries GPMAG 2026 (format YYYY-MM-DD) */
const HOLIDAYS_2026 = [
  '2026-01-01', // Jour de l'an
  '2026-02-17', // Mardi Gras
  '2026-02-18', // Mercredi des Cendres
  '2026-03-12', // Mi-Careme
  '2026-04-03', // Vendredi Saint
  '2026-04-06', // Lundi de Paques
  '2026-05-01', // Fete du travail
  '2026-05-08', // Armistice 1945
  '2026-05-14', // Ascension
  '2026-05-22', // Abolition esclavage Martinique
  '2026-05-25', // Lundi de Pentecote
  '2026-05-27', // Abolition esclavage Guadeloupe
  '2026-05-28', // Abolition esclavage Saint-Martin
  '2026-06-10', // Abolition esclavage Guyane
  '2026-07-14', // Fete nationale
  '2026-08-15', // Assomption
  '2026-10-09', // Abolition esclavage Saint-Barthelemy
  '2026-11-01', // Toussaint
  '2026-11-02', // Lendemain Toussaint
  '2026-11-11', // Armistice 1918
  '2026-12-25', // Noel
];

function isHoliday(date: Date): boolean {
  const str = date.toISOString().slice(0, 10);
  return HOLIDAYS_2026.includes(str);
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isWorkingDay(date: Date): boolean {
  return !isWeekend(date) && !isHoliday(date);
}

/** Retourne le prochain jour ouvre a partir d'une date */
function nextWorkingDay(from: Date): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + 1);
  while (!isWorkingDay(d)) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

/** Retourne JD+N jours ouvres */
function addWorkingDays(from: Date, n: number): Date {
  let d = new Date(from);
  let count = 0;
  while (count < n) {
    d = nextWorkingDay(d);
    count++;
  }
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatDateTime(date: Date, time: string): string {
  return `${formatDate(date)} a ${time}`;
}

// ─── Types ──────────────────────────────────────────────────────────────────

type Deadline = {
  label: string;
  ticket: string;
  description: string;
  dateTime: string;
  icon: string;
  color: string;
};

// ─── Component ──────────────────────────────────────────────────────────────

export function PortabilityDeadlines() {
  const deadlines = useMemo(() => {
    const now = new Date();
    let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Si aujourd'hui n'est pas un jour ouvre, prendre le prochain
    if (!isWorkingDay(today)) {
      today = nextWorkingDay(new Date(today.getTime() - 86400000));
    }

    const JD = today; // Jour de la demande
    const JD1 = addWorkingDays(JD, 1); // JD + 1 jour ouvre
    const JP = addWorkingDays(JD, 2); // JD + 2 jours ouvres = jour de portage

    const items: Deadline[] = [
      {
        label: 'Envoi demandes 1110/1120',
        ticket: '1110 / 1120',
        description: `Demandes de portage emises aujourd'hui (JD) doivent etre envoyees a l'OPD`,
        dateTime: formatDateTime(JD, '19H00'),
        icon: 'solar:letter-bold-duotone',
        color: '#f97316',
      },
      {
        label: 'Reponse eligibilite 1210/1220',
        ticket: '1210 / 1220',
        description: `L'OPD doit repondre (acceptation ou refus) au plus tard`,
        dateTime: formatDateTime(JD1, '10H00'),
        icon: 'solar:check-circle-bold-duotone',
        color: '#22c55e',
      },
      {
        label: 'Envoi donnees portage 1410',
        ticket: '1410',
        description: `L'OPR envoie les donnees de portage a tous les operateurs au plus tard`,
        dateTime: formatDateTime(JD1, '14H00'),
        icon: 'solar:document-bold-duotone',
        color: '#3b82f6',
      },
      {
        label: 'Bascule SIM (portage effectif)',
        ticket: 'Bascule',
        description: `Fenetre de bascule : 08H30 a 10H00 (max 1H30)`,
        dateTime: formatDateTime(JP, '08H30 - 10H00'),
        icon: 'solar:transfer-horizontal-bold-duotone',
        color: '#8b5cf6',
      },
      {
        label: 'Confirmation portage 1430',
        ticket: '1430',
        description: `Tous les operateurs confirment la bascule au plus tard`,
        dateTime: formatDateTime(JP, '19H00'),
        icon: 'solar:verified-check-bold-duotone',
        color: '#06b6d4',
      },
    ];

    return { JD, JD1, JP, items };
  }, []);

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
      <Stack spacing={2}>
        {/* Header */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Iconify icon="solar:calendar-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Echeances portabilite — Cas standard JD+2
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Demandes deposees aujourd&apos;hui ({formatDate(deadlines.JD)}) — Portage prevu le {formatDate(deadlines.JP)}
            </Typography>
          </Box>
          {(isWeekend(new Date()) || isHoliday(new Date())) && (
            <Chip label="Jour non ouvre" size="small" color="warning" variant="outlined" />
          )}
        </Stack>

        {/* Deadlines */}
        <Stack spacing={1}>
          {deadlines.items.map((d) => (
            <Box
              key={d.ticket}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 1,
                bgcolor: `${d.color}08`,
                border: `1px solid ${d.color}20`,
              }}
            >
              <Iconify icon={d.icon} width={20} sx={{ color: d.color, flexShrink: 0 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={d.ticket}
                    size="small"
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      height: 20,
                      bgcolor: `${d.color}18`,
                      color: d.color,
                    }}
                  />
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {d.label}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {d.description}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ color: d.color, whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                {d.dateTime}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Source */}
        <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'right' }}>
          Source : GPMAG ANNEXE 1 Ter — Processus Client Guichet Unique PNM V3 (20/12/2012)
        </Typography>
      </Stack>
    </Paper>
  );
}
