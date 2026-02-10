import { Badge } from '@/components/ui/badge';

const levelConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    decouverte: { label: 'Découverte', variant: 'secondary' },
    comprehension: { label: 'Compréhension', variant: 'outline' },
    maitrise: { label: 'Maîtrise', variant: 'default' },
    expertise: { label: 'Expertise', variant: 'default' },
};

type LevelBadgeProps = {
    level: string;
};

export function LevelBadge({ level }: LevelBadgeProps) {
    const config = levelConfig[level] || levelConfig.decouverte;

    return <Badge variant={config.variant}>{config.label}</Badge>;
}
