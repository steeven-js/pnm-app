import 'src/global.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import { themeConfig, ThemeProvider } from 'src/theme';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { SettingsProvider, defaultSettings } from 'src/components/settings';

// ----------------------------------------------------------------------

const appName = import.meta.env.VITE_APP_NAME || 'PNM App';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <SettingsProvider defaultSettings={defaultSettings}>
                <ThemeProvider
                    modeStorageKey={themeConfig.modeStorageKey}
                    defaultMode={themeConfig.defaultMode}
                >
                    <MotionLazy>
                        <App {...props} />
                    </MotionLazy>
                </ThemeProvider>
            </SettingsProvider>
        );
    },
    progress: {
        color: '#00A76F', // Minimals primary color
    },
});
