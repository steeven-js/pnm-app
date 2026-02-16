import Chip from '@mui/material/Chip';

const levelConfig: Record<string, { label: string; color: 'default' | 'primary' | 'secondary' }> = {
    decouverte: { label: 'Découverte', color: 'secondary' },
    comprehension: { label: 'Compréhension', color: 'default' },
    maitrise: { label: 'Maîtrise', color: 'primary' },
    expertise: { label: 'Expertise', color: 'primary' },
};

type LevelBadgeProps = {
    level: string;
};

export function LevelBadge({ level }: LevelBadgeProps) {
    const config = levelConfig[level] || levelConfig.decouverte;

    return <Chip label={config.label} color={config.color} size="small" variant={config.color === 'default' ? 'outlined' : 'filled'} />;
}
