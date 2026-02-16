import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { ThemeProvider } from '@mui/material/styles';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import { buildMuiTheme } from './theme';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) =>
    createInertiaApp({
        page,
        render: (element) => {
            const cache = createCache({ key: 'mui' });
            const { extractCriticalToChunks, constructStyleTagsFromChunks } =
                createEmotionServer(cache);

            const theme = buildMuiTheme('light');

            const html = ReactDOMServer.renderToString(
                <CacheProvider value={cache}>
                    <ThemeProvider theme={theme}>{element}</ThemeProvider>
                </CacheProvider>,
            );

            const emotionChunks = extractCriticalToChunks(html);
            const emotionCss = constructStyleTagsFromChunks(emotionChunks);

            return `${emotionCss}${html}`;
        },
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) =>
            resolvePageComponent(
                `./pages/${name}.tsx`,
                import.meta.glob('./pages/**/*.tsx'),
            ),
        setup: ({ App, props }) => {
            return <App {...props} />;
        },
    }),
);
