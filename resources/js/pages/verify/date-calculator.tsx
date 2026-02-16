import { Head } from '@inertiajs/react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import {
    type TimelineStep,
    type VacationId,
    VACATIONS,
    addBusinessDays,
    computePortageTimeline,
    getHolidaysBetween,
    subtractBusinessDays,
} from '@/lib/pnm-utils';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Vérifier', href: '/verify' },
    { title: 'Calculateur de dates', href: '/verify/date-calculator' },
];

type Result = {
    jd: Date;
    jd1: Date;
    jp: Date;
    jpFormatted: string;
    jd1Formatted: string;
    cancelLimitStandard: string;
    cancelLimitExtended: string;
    holidays: string[];
    timeline: TimelineStep[];
};

function formatDate(d: Date): string {
    return d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

const highlightColors: Record<string, string> = {
    green: '#22c55e',
    red: '#ef4444',
    yellow: '#f59e0b',
    blue: '#3b82f6',
};

function TimelineRow({ step }: { step: TimelineStep }) {
    const color = step.highlight ? highlightColors[step.highlight] : undefined;
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: '60px 160px 100px 1fr',
                gap: 1.5,
                alignItems: 'center',
                py: 0.75,
                px: 1,
                borderRadius: 1,
                ...(color
                    ? {
                          bgcolor: `${color}08`,
                          borderLeft: `3px solid ${color}`,
                      }
                    : { borderLeft: '3px solid transparent' }),
            }}
        >
            <Chip
                label={step.day}
                size="small"
                sx={{
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    height: 22,
                    ...(step.day === 'JP'
                        ? { bgcolor: '#3b82f6', color: '#fff' }
                        : {}),
                }}
                variant={step.day === 'JP' ? 'filled' : 'outlined'}
            />
            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                {step.vacation}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {step.direction}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {step.codes.map((c) => (
                    <Chip
                        key={c}
                        label={c}
                        size="small"
                        sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.65rem',
                            height: 20,
                            ...(c === 'Portage'
                                ? { bgcolor: '#3b82f6', color: '#fff' }
                                : {}),
                        }}
                        variant={c === 'Portage' ? 'filled' : 'outlined'}
                    />
                ))}
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 0.5 }}
                >
                    {step.description}
                </Typography>
            </Box>
        </Box>
    );
}

export default function DateCalculator() {
    const [dateInput, setDateInput] = useState('');
    const [vacationId, setVacationId] = useState<VacationId>('V1');
    const [result, setResult] = useState<Result | null>(null);

    function calculate() {
        if (!dateInput) return;
        const jd = new Date(dateInput + 'T00:00:00');
        const jd1 = addBusinessDays(jd, 1);
        const jp = addBusinessDays(jd, 2);
        const cancelExtended = subtractBusinessDays(jp, 2);
        const holidays = getHolidaysBetween(jd, jp);
        const timeline = computePortageTimeline(jd, vacationId);

        setResult({
            jd,
            jd1,
            jp,
            jpFormatted: formatDate(jp),
            jd1Formatted: formatDate(jd1),
            cancelLimitStandard: formatDate(jd),
            cancelLimitExtended: formatDate(cancelExtended),
            holidays,
            timeline,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calculateur de dates de portage" />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    p: 2,
                    maxWidth: 900,
                }}
            >
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        Calculateur de dates de portage
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Calculez JP, vacations concernées et calendrier des
                        échanges inter-opérateurs.
                    </Typography>
                </Box>

                <Card>
                    <CardContent
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        <Typography variant="subtitle2" color="text.secondary">
                            Paramètres de la demande
                        </Typography>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { sm: '1fr 1fr auto' },
                                gap: 2,
                                alignItems: 'flex-start',
                            }}
                        >
                            <TextField
                                type="date"
                                label="Date de demande (JD)"
                                value={dateInput}
                                onChange={(e) => setDateInput(e.target.value)}
                                size="small"
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                            <TextField
                                select
                                label="Vacation de soumission"
                                value={vacationId}
                                onChange={(e) =>
                                    setVacationId(e.target.value as VacationId)
                                }
                                size="small"
                            >
                                {VACATIONS.map((v) => (
                                    <MenuItem key={v.id} value={v.id}>
                                        {v.label} ({v.start}–{v.end})
                                    </MenuItem>
                                ))}
                            </TextField>
                            <Button
                                variant="contained"
                                onClick={calculate}
                                disabled={!dateInput}
                                sx={{ minWidth: 100, height: 40 }}
                            >
                                Calculer
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {result && (
                    <>
                        {/* Dates clés */}
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 2,
                                gridTemplateColumns: {
                                    sm: 'repeat(3, 1fr)',
                                },
                            }}
                        >
                            <Card>
                                <CardContent>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        JD (demande)
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        fontWeight={600}
                                    >
                                        {formatDate(result.jd)}
                                    </Typography>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        JD+1 (réponses)
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        fontWeight={600}
                                    >
                                        {result.jd1Formatted}
                                    </Typography>
                                </CardContent>
                            </Card>
                            <Card
                                sx={{
                                    borderLeft: 3,
                                    borderColor: '#3b82f6',
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        JP (portage)
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        fontWeight={700}
                                        color="primary"
                                    >
                                        {result.jpFormatted}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Bascule 8h30–10h00
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>

                        {/* Timeline des échanges */}
                        <Card>
                            <CardContent
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 0.5,
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                    gutterBottom
                                >
                                    Calendrier des échanges inter-opérateurs
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns:
                                            '60px 160px 100px 1fr',
                                        gap: 1.5,
                                        px: 1,
                                        pb: 0.5,
                                        borderBottom: 1,
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        fontWeight={700}
                                    >
                                        Jour
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        fontWeight={700}
                                    >
                                        Vacation
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        fontWeight={700}
                                    >
                                        Flux
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        fontWeight={700}
                                    >
                                        Codes / Description
                                    </Typography>
                                </Box>
                                {result.timeline.map((step, i) => (
                                    <TimelineRow key={i} step={step} />
                                ))}
                            </CardContent>
                        </Card>

                        {/* Annulation */}
                        <Card>
                            <CardContent
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5,
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                >
                                    Dates limites d'annulation
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 1,
                                        alignItems: 'center',
                                    }}
                                >
                                    <Chip
                                        label="Standard"
                                        size="small"
                                        color="info"
                                        variant="outlined"
                                    />
                                    <Typography variant="body2">
                                        {result.cancelLimitStandard}
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 1,
                                        alignItems: 'center',
                                    }}
                                >
                                    <Chip
                                        label="Étendu"
                                        size="small"
                                        color="warning"
                                        variant="outlined"
                                    />
                                    <Typography variant="body2">
                                        {result.cancelLimitExtended}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        {result.holidays.length > 0 && (
                            <Alert severity="info">
                                <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    gutterBottom
                                >
                                    Jours fériés dans la période JD → JP :
                                </Typography>
                                {result.holidays.map((h) => (
                                    <Typography key={h} variant="body2">
                                        {new Date(
                                            h + 'T00:00:00',
                                        ).toLocaleDateString('fr-FR', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </Typography>
                                ))}
                            </Alert>
                        )}

                        <Alert severity="info" sx={{ mt: -1 }}>
                            <Typography variant="body2">
                                <strong>Vacations journalières :</strong> V1
                                (10h–11h), V2 (14h–15h), V3 (19h–20h) +
                                Synchronisation dimanche (22h–24h).
                            </Typography>
                        </Alert>
                    </>
                )}
            </Box>
        </AppLayout>
    );
}
