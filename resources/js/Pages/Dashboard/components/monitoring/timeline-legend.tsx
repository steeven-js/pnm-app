import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

const LEGEND_ITEMS = [
    { label: 'En attente', color: 'text.disabled' },
    { label: 'Vérifié', color: 'success.main' },
    { label: 'Problème', color: 'error.main' },
    { label: 'Ignoré', color: 'warning.main' },
] as const;

export function TimelineLegend() {
    const theme = useTheme();
    return (
        <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
            {LEGEND_ITEMS.map((item) => (
                <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                </Box>
            ))}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{
                    width: 10, height: 10, borderRadius: '50%', bgcolor: 'info.main',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                        '0%': { boxShadow: `0 0 0 0 ${theme.palette.info.main}80` },
                        '70%': { boxShadow: '0 0 0 6px transparent' },
                        '100%': { boxShadow: '0 0 0 0 transparent' },
                    },
                }} />
                <Typography variant="caption" color="text.secondary">En cours</Typography>
            </Box>
        </Box>
    );
}
