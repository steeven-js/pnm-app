import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import type { EnrichedPnmEvent, EventStatus, CheckType } from 'src/types/monitoring';

const STATUS_COLORS: Record<EventStatus, string> = {
    pending: 'text.disabled',
    verified: 'success.main',
    issue: 'error.main',
    skipped: 'warning.main',
};

const CHECK_TYPE_RING: Record<CheckType, string> = {
    email: '#f59e0b',   // amber
    server: '#06b6d4',  // cyan
};

const CHECK_TYPE_LABEL: Record<CheckType, string> = {
    email: 'Email',
    server: 'Serveur',
};

type TimelineNodeProps = {
    event: EnrichedPnmEvent;
    isSelected: boolean;
    onClick: () => void;
};

export function TimelineNode({ event, isSelected, onClick }: TimelineNodeProps) {
    const theme = useTheme();
    const color = event.isCurrent && event.status === 'pending' ? 'info.main' : STATUS_COLORS[event.status];
    const ringColor = CHECK_TYPE_RING[event.checkType];

    return (
        <Tooltip title={`${event.label} — ${event.scheduledTime} — ${CHECK_TYPE_LABEL[event.checkType]}`} arrow>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, flex: 1, minWidth: 0 }}>
                <Box sx={{
                    width: 46, height: 46, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `3px solid ${ringColor}`,
                    opacity: isSelected ? 1 : 0.7,
                    transition: 'opacity 0.2s',
                }}>
                    <ButtonBase
                        onClick={onClick}
                        sx={{
                            width: 36, height: 36, borderRadius: '50%', bgcolor: color, color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s',
                            boxShadow: isSelected ? `0 0 0 3px ${theme.palette.primary.main}40` : 'none',
                            ...(event.isCurrent && event.status === 'pending' && {
                                animation: 'nodePulse 2s infinite',
                                '@keyframes nodePulse': {
                                    '0%': { boxShadow: `0 0 0 0 ${theme.palette.info.main}60` },
                                    '70%': { boxShadow: '0 0 0 8px transparent' },
                                    '100%': { boxShadow: '0 0 0 0 transparent' },
                                },
                            }),
                            '&:hover': { transform: 'scale(1.1)' },
                        }}
                    >
                        <Iconify icon={event.icon} width={16} />
                    </ButtonBase>
                </Box>
                <Typography variant="caption" sx={{
                    fontSize: '0.65rem', color: 'text.secondary',
                    fontVariantNumeric: 'tabular-nums', fontWeight: event.isCurrent ? 700 : 400,
                }}>
                    {event.scheduledTime}
                </Typography>
            </Box>
        </Tooltip>
    );
}
