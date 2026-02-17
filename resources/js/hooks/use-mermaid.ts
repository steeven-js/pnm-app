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

      const isDark = document.documentElement.getAttribute('data-color-scheme') === 'dark'
        || document.documentElement.classList.contains('dark');

      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        fontFamily: 'Public Sans, ui-sans-serif, system-ui, sans-serif',
      });

      const pres = container.querySelectorAll<HTMLPreElement>('pre.mermaid');

      for (const pre of pres) {
        if (!sourcesRef.current.has(pre)) {
          sourcesRef.current.set(pre, pre.textContent?.trim() ?? '');
        }

        const source = sourcesRef.current.get(pre);
        if (!source) continue;

        pre.removeAttribute('data-processed');
        pre.innerHTML = source;

        const id = `mermaid-${crypto.randomUUID().slice(0, 8)}`;
        try {
          const { svg } = await mermaid.render(id, source);
          if (!cancelled) {
            pre.innerHTML = svg;
          }
        } catch {
          pre.innerHTML = source;
        }
      }
    };

    renderDiagrams();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class' || mutation.attributeName === 'data-color-scheme') {
          renderDiagrams();
          break;
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-color-scheme'] });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [containerRef, content]);
}
