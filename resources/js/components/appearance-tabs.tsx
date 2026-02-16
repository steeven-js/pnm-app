import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';

export default function AppearanceToggleTab() {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    return (
        <ToggleButtonGroup
            value={appearance}
            exclusive
            onChange={(_: React.MouseEvent<HTMLElement>, value: Appearance | null) => value && updateAppearance(value)}
            size="small"
        >
            {tabs.map(({ value, icon: Icon, label }) => (
                <ToggleButton key={value} value={value} sx={{ textTransform: 'none', gap: 0.75, px: 2 }}>
                    <Icon size={16} />
                    {label}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}
