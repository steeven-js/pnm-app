import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

const shared: ThemeOptions = {
    typography: {
        fontFamily: `'Instrument Sans', 'Public Sans Variable', 'Inter Variable', ui-sans-serif, system-ui, sans-serif`,
    },
    shape: {
        borderRadius: 10,
    },
    components: {
        MuiButtonBase: {
            defaultProps: {
                disableRipple: true,
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                },
            },
        },
        MuiCard: {
            defaultProps: {
                variant: 'outlined',
            },
        },
        MuiTextField: {
            defaultProps: {
                size: 'small',
                variant: 'outlined',
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                },
            },
        },
        MuiDialog: {
            defaultProps: {
                PaperProps: {
                    elevation: 0,
                },
            },
        },
        MuiTooltip: {
            defaultProps: {
                arrow: true,
            },
        },
    },
};

export function buildMuiTheme(mode: 'light' | 'dark') {
    return createTheme({
        ...shared,
        cssVariables: false,
        palette: {
            mode,
            ...(mode === 'light'
                ? {
                      background: { default: '#ffffff', paper: '#ffffff' },
                      text: { primary: '#1b1b18', secondary: '#737370' },
                      primary: { main: '#1b1b18', contrastText: '#fafafa' },
                      secondary: { main: '#f5f5f5', contrastText: '#1b1b18' },
                      error: { main: '#dc2626' },
                      divider: '#e5e5e5',
                      action: { hover: 'rgba(0,0,0,0.04)' },
                  }
                : {
                      background: { default: '#0a0a0a', paper: '#161615' },
                      text: { primary: '#fafafa', secondary: '#a1a09a' },
                      primary: { main: '#fafafa', contrastText: '#1b1b18' },
                      secondary: { main: '#262626', contrastText: '#fafafa' },
                      error: { main: '#ef4444' },
                      divider: '#262626',
                      action: { hover: 'rgba(255,255,255,0.06)' },
                  }),
        },
    });
}
