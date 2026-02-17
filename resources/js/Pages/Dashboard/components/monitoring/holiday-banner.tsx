import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import type { HolidayDetail } from 'src/types/monitoring';

type HolidayBannerProps = { holidayDetails: HolidayDetail[] };

export function HolidayBanner({ holidayDetails }: HolidayBannerProps) {
    if (holidayDetails.length === 0) return null;
    return (
        <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>Jour férié — Pas d'opérations PNM aujourd'hui</AlertTitle>
            <Tooltip title="Règle OR : si un seul département est férié, toutes les opérations PNM sont suspendues" arrow>
                <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                    {holidayDetails.map((h) => (
                        <Chip key={h.code} label={`${h.department} — ${h.name}`} size="small" color="warning" variant="outlined" />
                    ))}
                </Stack>
            </Tooltip>
        </Alert>
    );
}
