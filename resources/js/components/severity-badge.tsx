import Chip from '@mui/material/Chip';

const severityConfig: Record<string, { label: string; color: string; bgcolor: string }> = {
    info: { label: 'Info', color: '#1e40af', bgcolor: '#dbeafe' },
    warning: { label: 'Warning', color: '#92400e', bgcolor: '#fef3c7' },
    error: { label: 'Erreur', color: '#991b1b', bgcolor: '#fee2e2' },
    critical: { label: 'Critique', color: '#581c87', bgcolor: '#f3e8ff' },
};

export function SeverityBadge({ severity, size = 'small' }: { severity: string; size?: 'small' | 'medium' }) {
    const config = severityConfig[severity] ?? severityConfig.info;

    return (
        <Chip
            label={config.label}
            size={size}
            sx={{
                color: config.color,
                bgcolor: config.bgcolor,
                fontWeight: 600,
                fontSize: size === 'small' ? '0.625rem' : '0.75rem',
                height: size === 'small' ? 20 : 24,
            }}
        />
    );
}
