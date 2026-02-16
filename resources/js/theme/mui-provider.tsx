import { ThemeProvider } from '@mui/material/styles';
import { useMemo } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import { buildMuiTheme } from './mui-theme';

export function MuiProvider({ children }: { children: React.ReactNode }) {
    const { resolvedAppearance } = useAppearance();

    const theme = useMemo(
        () => buildMuiTheme(resolvedAppearance),
        [resolvedAppearance],
    );

    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
