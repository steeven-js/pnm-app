import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type TimelineClockProps = {
    timeString: string;
    dateString: string;
};

export function TimelineClock({ timeString, dateString }: TimelineClockProps) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <Typography variant="h4" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, letterSpacing: 1 }}>
                {timeString}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                {dateString}
            </Typography>
        </Box>
    );
}
