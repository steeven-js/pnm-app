import Chip from '@mui/material/Chip';

// ----------------------------------------------------------------------

const CONFIG: Record<string, { label: string; color: string; bgcolor: string }> = {
  info: { label: 'Info', color: '#3b82f6', bgcolor: '#dbeafe' },
  warning: { label: 'Attention', color: '#92400e', bgcolor: '#fef3c7' },
  error: { label: 'Erreur', color: '#dc2626', bgcolor: '#fee2e2' },
  critical: { label: 'Critique', color: '#9333ea', bgcolor: '#f3e8ff' },
};

type Props = {
  severity: string;
  size?: 'small' | 'medium';
};

export function SeverityBadge({ severity, size = 'small' }: Props) {
  const cfg = CONFIG[severity] ?? CONFIG.info;

  return (
    <Chip
      label={cfg.label}
      size={size}
      sx={{ color: cfg.color, bgcolor: cfg.bgcolor, fontWeight: 600 }}
    />
  );
}
