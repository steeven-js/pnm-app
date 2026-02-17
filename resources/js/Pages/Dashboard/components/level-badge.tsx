import Chip from '@mui/material/Chip';

// ----------------------------------------------------------------------

const LEVEL_CONFIG: Record<string, { label: string; color: 'info' | 'warning' | 'success' }> = {
  decouverte: { label: 'Découverte', color: 'info' },
  comprehension: { label: 'Compréhension', color: 'warning' },
  maitrise: { label: 'Maîtrise', color: 'success' },
};

type LevelBadgeProps = {
  level: string;
};

export function LevelBadge({ level }: LevelBadgeProps) {
  const config = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.decouverte;

  return <Chip label={config.label} color={config.color} size="small" variant="soft" />;
}
