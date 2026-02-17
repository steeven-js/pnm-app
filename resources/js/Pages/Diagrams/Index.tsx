import { useState, useRef, useEffect } from 'react';

import { Head, usePage } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

import type { Diagram, KnowledgeDomain } from 'src/types';

// ----------------------------------------------------------------------

type Props = {
  diagrams: Diagram[];
  domains: KnowledgeDomain[];
};

export default function DiagramsIndex() {
  const { diagrams, domains } = usePage().props as unknown as Props;
  const [selectedDomain, setSelectedDomain] = useState<string>('');

  const filtered = selectedDomain
    ? diagrams.filter((d) => d.domain.slug === selectedDomain)
    : diagrams;

  return (
    <DashboardLayout>
      <Head title="Diagrammes" />

      <Box sx={{ p: { xs: 3, md: 5 } }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Typography
            component={RouterLink}
            href="/dashboard"
            variant="body2"
            color="text.secondary"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Dashboard
          </Typography>
          <Typography
            component={RouterLink}
            href="/resolve"
            variant="body2"
            color="text.secondary"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Résoudre
          </Typography>
          <Typography variant="body2">Diagrammes</Typography>
        </Breadcrumbs>

        <Typography variant="h4" sx={{ mb: 1 }}>
          Diagrammes
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Diagrammes de flux et processus PNM
        </Typography>

        {/* Domain filter */}
        {domains.length > 0 && (
          <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label="Tous"
              size="small"
              variant={!selectedDomain ? 'filled' : 'outlined'}
              color={!selectedDomain ? 'primary' : 'default'}
              onClick={() => setSelectedDomain('')}
            />
            {domains.map((domain) => (
              <Chip
                key={domain.id}
                label={domain.name}
                size="small"
                variant={selectedDomain === domain.slug ? 'filled' : 'outlined'}
                color={selectedDomain === domain.slug ? 'primary' : 'default'}
                onClick={() => setSelectedDomain(domain.slug)}
              />
            ))}
          </Box>
        )}

        {filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Iconify icon="solar:diagram-up-linear" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">Aucun diagramme disponible</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {filtered.map((diagram) => (
              <DiagramCard key={diagram.id} diagram={diagram} />
            ))}
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}

// ----------------------------------------------------------------------

function DiagramCard({ diagram }: { diagram: Diagram }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      const container = containerRef.current;
      if (!container || !diagram.mermaid_source) return;

      const mermaid = (await import('mermaid')).default;
      if (cancelled) return;

      const isDark =
        document.documentElement.getAttribute('data-color-scheme') === 'dark' ||
        document.documentElement.classList.contains('dark');

      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        fontFamily: 'Public Sans, ui-sans-serif, system-ui, sans-serif',
      });

      const id = `diagram-${diagram.id}-${crypto.randomUUID().slice(0, 8)}`;
      try {
        const { svg } = await mermaid.render(id, diagram.mermaid_source);
        if (!cancelled) {
          container.innerHTML = svg;
          setRendered(true);
        }
      } catch {
        if (!cancelled) {
          container.textContent = diagram.mermaid_source;
        }
      }
    };

    render();
    return () => { cancelled = true; };
  }, [diagram]);

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {diagram.title}
            </Typography>
            <Typography
              variant="caption"
              component={RouterLink}
              href={`/knowledge/${diagram.domain.slug}/${diagram.article.slug}`}
              color="text.secondary"
              sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {diagram.article.title}
            </Typography>
          </Box>
          <Chip
            label={diagram.domain.name}
            size="small"
            variant="outlined"
            sx={diagram.domain.color ? { borderColor: diagram.domain.color, color: diagram.domain.color } : {}}
          />
        </Box>

        <Box
          ref={containerRef}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            '& svg': { maxWidth: '100%' },
            ...((!rendered) && {
              p: 2,
              bgcolor: 'background.neutral',
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              whiteSpace: 'pre-wrap',
              overflow: 'auto',
            }),
          }}
        />
      </CardContent>
    </Card>
  );
}
