import { Head, Link } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MuiLink from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Maximize2, Minus, Plus, Search } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useMermaid } from '@/hooks/use-mermaid';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Diagram, KnowledgeDomain } from '@/types';

const ZOOM_STEP = 0.25;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;

function MermaidPreview({ source }: { source: string }) {
    const mermaidRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

    useMermaid(mermaidRef, source);

    const zoomIn = useCallback(() => setZoom((z) => Math.min(z + ZOOM_STEP, ZOOM_MAX)), []);
    const zoomOut = useCallback(() => setZoom((z) => Math.max(z - ZOOM_STEP, ZOOM_MIN)), []);
    const zoomReset = useCallback(() => setZoom(1), []);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoom((z) => {
                const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
                return Math.min(Math.max(z + delta, ZOOM_MIN), ZOOM_MAX);
            });
        }
    }, []);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        const el = scrollRef.current;
        if (!el) return;
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
        el.setPointerCapture(e.pointerId);
    }, []);

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!isDragging) return;
            const el = scrollRef.current;
            if (!el) return;
            el.scrollLeft = dragStart.current.scrollLeft - (e.clientX - dragStart.current.x);
            el.scrollTop = dragStart.current.scrollTop - (e.clientY - dragStart.current.y);
        },
        [isDragging],
    );

    const handlePointerUp = useCallback(() => setIsDragging(false), []);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                <IconButton size="small" onClick={zoomOut} disabled={zoom <= ZOOM_MIN}>
                    <Minus size={14} />
                </IconButton>
                <Button variant="outlined" size="small" onClick={zoomReset} sx={{ minWidth: 56, fontSize: '0.75rem', fontFamily: 'monospace', height: 28 }}>
                    {Math.round(zoom * 100)}%
                </Button>
                <IconButton size="small" onClick={zoomIn} disabled={zoom >= ZOOM_MAX}>
                    <Plus size={14} />
                </IconButton>
            </Box>
            <Box
                ref={scrollRef}
                sx={{
                    flex: 1,
                    overflow: 'auto',
                    userSelect: 'none',
                    cursor: isDragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default',
                }}
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                <Box ref={mermaidRef} sx={{ p: 3 }} style={{ width: `${zoom * 100}%` }}>
                    <pre className="mermaid">{source}</pre>
                </Box>
            </Box>
        </Box>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Diagrammes', href: '/diagrams' },
];

type Props = {
    diagrams: Diagram[];
    domains: Pick<KnowledgeDomain, 'id' | 'name' | 'slug' | 'color'>[];
};

export default function DiagramsIndex({ diagrams, domains }: Props) {
    const [search, setSearch] = useState('');
    const [activeDomain, setActiveDomain] = useState<number | null>(null);
    const [selectedDiagram, setSelectedDiagram] = useState<Diagram | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const filtered = useMemo(() => {
        return diagrams.filter((d) => {
            if (activeDomain && d.domain.id !== activeDomain) return false;
            if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [diagrams, search, activeDomain]);

    const contentKey = filtered.map((d) => d.id).join(',');
    useMermaid(containerRef, contentKey);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Diagrammes" />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        Diagrammes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Tous les diagrammes techniques extraits des articles —{' '}
                        <Typography component="span" fontWeight={500}>
                            {filtered.length}
                        </Typography>{' '}
                        diagramme{filtered.length !== 1 ? 's' : ''}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, gap: 1.5 }}>
                    <TextField
                        placeholder="Rechercher un diagramme..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        fullWidth
                        size="small"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={16} style={{ opacity: 0.5 }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        <Chip
                            label="Tous"
                            size="small"
                            color={activeDomain === null ? 'primary' : 'default'}
                            variant={activeDomain === null ? 'filled' : 'outlined'}
                            onClick={() => setActiveDomain(null)}
                        />
                        {domains.map((domain) => (
                            <Chip
                                key={domain.id}
                                label={domain.name}
                                size="small"
                                variant={activeDomain === domain.id ? 'filled' : 'outlined'}
                                onClick={() => setActiveDomain(activeDomain === domain.id ? null : domain.id)}
                                sx={
                                    activeDomain === domain.id && domain.color
                                        ? { bgcolor: domain.color, borderColor: domain.color, color: '#fff' }
                                        : undefined
                                }
                            />
                        ))}
                    </Box>
                </Box>

                {filtered.length === 0 ? (
                    <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>
                        Aucun diagramme trouvé
                    </Typography>
                ) : (
                    <Box ref={containerRef} sx={{ display: 'grid', gap: 3, gridTemplateColumns: { lg: 'repeat(2, 1fr)' } }}>
                        {filtered.map((diagram) => (
                            <Card
                                key={diagram.id}
                                sx={{ minWidth: 0, cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 3 } }}
                                onClick={() => setSelectedDiagram(diagram)}
                            >
                                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                                        <Typography variant="body2" fontWeight={600}>
                                            {diagram.title}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                                            {diagram.domain.color && (
                                                <Chip
                                                    label={diagram.domain.name}
                                                    size="small"
                                                    sx={{
                                                        fontSize: '0.625rem',
                                                        height: 20,
                                                        bgcolor: `${diagram.domain.color}20`,
                                                        color: diagram.domain.color,
                                                    }}
                                                />
                                            )}
                                            <Maximize2 size={14} style={{ opacity: 0.3 }} />
                                        </Box>
                                    </Box>
                                    <MuiLink
                                        component={Link}
                                        href={`/knowledge/${diagram.domain.slug}/${diagram.article.slug}`}
                                        underline="hover"
                                        variant="caption"
                                        color="text.secondary"
                                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                    >
                                        {diagram.article.title} &rarr;
                                    </MuiLink>
                                </CardContent>
                                <CardContent sx={{ overflow: 'hidden', pt: 0 }}>
                                    <pre className="mermaid">{diagram.mermaid_source}</pre>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </Box>

            <Dialog
                open={selectedDiagram !== null}
                onClose={() => setSelectedDiagram(null)}
                maxWidth={false}
                PaperProps={{ sx: { maxHeight: '90vh', width: 'calc(100% - 2rem)', maxWidth: 1152 } }}
            >
                {selectedDiagram && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
                                <Box>
                                    <Typography variant="h6" fontWeight={600}>
                                        {selectedDiagram.title}
                                    </Typography>
                                    <MuiLink
                                        component={Link}
                                        href={`/knowledge/${selectedDiagram.domain.slug}/${selectedDiagram.article.slug}`}
                                        underline="hover"
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {selectedDiagram.article.title} &rarr;
                                    </MuiLink>
                                </Box>
                                {selectedDiagram.domain.color && (
                                    <Chip
                                        label={selectedDiagram.domain.name}
                                        size="small"
                                        sx={{
                                            flexShrink: 0,
                                            fontSize: '0.625rem',
                                            height: 20,
                                            bgcolor: `${selectedDiagram.domain.color}20`,
                                            color: selectedDiagram.domain.color,
                                        }}
                                    />
                                )}
                            </Box>
                        </DialogTitle>
                        <DialogContent sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                            <MermaidPreview key={selectedDiagram.id} source={selectedDiagram.mermaid_source} />
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </AppLayout>
    );
}
