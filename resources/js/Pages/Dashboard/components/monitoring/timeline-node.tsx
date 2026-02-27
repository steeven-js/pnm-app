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

const CHECK_TYPE_CONFIG: Record<CheckType, { icon: string; color: string; label: string }> = {
    email: { icon: 'solar:letter-bold', color: '#f59e0b', label: 'Email' },
    server: { icon: 'solar:monitor-bold', color: '#06b6d4', label: 'Serveur' },
};

type TimelineNodeProps = {
    event: EnrichedPnmEvent;
    isSelected: boolean;
    onClick: () => void;
};

export function TimelineNode({ event, isSelected, onClick }: TimelineNodeProps) {
    const theme = useTheme();
    const color = event.isCurrent && event.status === 'pending' ? 'info.main' : STATUS_COLORS[event.status];
    const ct = CHECK_TYPE_CONFIG[event.checkType];

    return (
        <Tooltip title={`${event.label} — ${event.scheduledTime} — ${ct.label}`} arrow>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25, flex: 1, minWidth: 0 }}>
                <ButtonBase
                    onClick={onClick}
                    sx={{
                        width: 40, height: 40, borderRadius: '50%', bgcolor: color, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                        border: isSelected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                        boxShadow: isSelected ? `0 0 0 3px ${theme.palette.primary.main}40` : 'none',
                        ...(event.isCurrent && event.status === 'pending' && {
                            animation: 'nodePulse 2s infinite',
                            '@keyframes nodePulse': {
                                '0%': { boxShadow: `0 0 0 0 ${theme.palette.info.main}60` },
                                '70%': { boxShadow: '0 0 0 8px transparent' },
                                '100%': { boxShadow: '0 0 0 0 transparent' },
                            },
                        }),
                        '&:hover': { transform: 'scale(1.15)' },
                    }}
                >
                    <Iconify icon={event.icon} width={18} />
                </ButtonBase>
                <Typography variant="caption" sx={{
                    fontSize: '0.65rem', color: 'text.secondary',
                    fontVariantNumeric: 'tabular-nums', fontWeight: event.isCurrent ? 700 : 400,
                }}>
                    {event.scheduledTime}
                </Typography>
                <Iconify icon={ct.icon} width={14} sx={{ color: ct.color, opacity: 0.85 }} />
            </Box>
        </Tooltip>
    );
}
