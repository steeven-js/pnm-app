import { useEffect, useRef, type RefObject } from 'react';

export function useMermaid(containerRef: RefObject<HTMLDivElement | null>, content: string) {
    const sourcesRef = useRef<Map<Element, string>>(new Map());

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let cancelled = false;

        const renderDiagrams = async () => {
            const mermaid = (await import('mermaid')).default;
            if (cancelled) return;

            const isDark = document.documentElement.classList.contains('dark');
            mermaid.initialize({
                startOnLoad: false,
                theme: isDark ? 'dark' : 'default',
                fontFamily: 'Instrument Sans, ui-sans-serif, system-ui, sans-serif',
            });

            const pres = container.querySelectorAll<HTMLPreElement>('pre.mermaid');

            for (const pre of pres) {
                // Store original source on first encounter
                if (!sourcesRef.current.has(pre)) {
                    sourcesRef.current.set(pre, pre.textContent?.trim() ?? '');
                }

                const source = sourcesRef.current.get(pre);
                if (!source) continue;

                // Reset element for re-rendering
                pre.removeAttribute('data-processed');
                pre.innerHTML = source;

                const id = `mermaid-${crypto.randomUUID().slice(0, 8)}`;
                try {
                    const { svg } = await mermaid.render(id, source);
                    if (!cancelled) {
                        pre.innerHTML = svg;
                    }
                } catch {
                    // Leave original text if rendering fails
                    pre.innerHTML = source;
                }
            }
        };

        renderDiagrams();

        // Watch for dark class changes to re-render with correct theme
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.attributeName === 'class') {
                    renderDiagrams();
                    break;
                }
            }
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => {
            cancelled = true;
            observer.disconnect();
        };
    }, [containerRef, content]);
}
