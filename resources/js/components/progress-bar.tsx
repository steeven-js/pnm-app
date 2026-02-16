import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

type ProgressBarProps = {
    value: number;
    color?: string;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
};

const heights = { sm: 4, md: 8, lg: 12 };

export function ProgressBar({ value, color = '#3b82f6', size = 'md', showLabel = true }: ProgressBarProps) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
                variant="determinate"
                value={Math.min(100, value)}
                sx={{
                    flex: 1,
                    height: heights[size],
                    borderRadius: 99,
                    bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                        bgcolor: color,
                        borderRadius: 99,
                    },
                }}
            />
            {showLabel && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums', minWidth: '2.5em', textAlign: 'right' }}
                >
                    {Math.round(value)}%
                </Typography>
            )}
        </Box>
    );
}
