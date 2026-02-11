import { Head, Link } from '@inertiajs/react';
import { Maximize2, Minus, Plus, Search } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="border-border flex items-center justify-end gap-1 border-b pb-2">
                <Button variant="outline" size="icon" className="size-7" onClick={zoomOut} disabled={zoom <= ZOOM_MIN}>
                    <Minus className="size-3.5" />
                </Button>
                <Button variant="outline" size="sm" className="h-7 min-w-[3.5rem] text-xs font-mono" onClick={zoomReset}>
                    {Math.round(zoom * 100)}%
                </Button>
                <Button variant="outline" size="icon" className="size-7" onClick={zoomIn} disabled={zoom >= ZOOM_MAX}>
                    <Plus className="size-3.5" />
                </Button>
            </div>
            <div
                ref={scrollRef}
                className="flex-1 overflow-auto select-none"
                style={{ cursor: isDragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default' }}
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                <div ref={mermaidRef} className="p-6" style={{ width: `${zoom * 100}%` }}>
                    <pre className="mermaid">{source}</pre>
                </div>
            </div>
        </div>
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
            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Diagrammes</h1>
                    <p className="text-muted-foreground text-sm">
                        Tous les diagrammes techniques extraits des articles —{' '}
                        <span className="font-medium">{filtered.length}</span> diagramme{filtered.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                            placeholder="Rechercher un diagramme..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        <Badge
                            variant={activeDomain === null ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => setActiveDomain(null)}
                        >
                            Tous
                        </Badge>
                        {domains.map((domain) => (
                            <Badge
                                key={domain.id}
                                variant={activeDomain === domain.id ? 'default' : 'outline'}
                                className="cursor-pointer"
                                style={
                                    activeDomain === domain.id && domain.color
                                        ? { backgroundColor: domain.color, borderColor: domain.color }
                                        : undefined
                                }
                                onClick={() => setActiveDomain(activeDomain === domain.id ? null : domain.id)}
                            >
                                {domain.name}
                            </Badge>
                        ))}
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center text-sm">Aucun diagramme trouvé</p>
                ) : (
                    <div ref={containerRef} className="grid gap-6 lg:grid-cols-2">
                        {filtered.map((diagram) => (
                            <Card
                                key={diagram.id}
                                className="group min-w-0 cursor-pointer transition-shadow hover:shadow-md"
                                onClick={() => setSelectedDiagram(diagram)}
                            >
                                <CardHeader className="space-y-1.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-sm font-semibold leading-tight">{diagram.title}</h3>
                                        <div className="flex shrink-0 items-center gap-1.5">
                                            {diagram.domain.color && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px]"
                                                    style={{ backgroundColor: `${diagram.domain.color}20`, color: diagram.domain.color }}
                                                >
                                                    {diagram.domain.name}
                                                </Badge>
                                            )}
                                            <Maximize2 className="text-muted-foreground size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                                        </div>
                                    </div>
                                    <Link
                                        href={`/knowledge/${diagram.domain.slug}/${diagram.article.slug}`}
                                        className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {diagram.article.title} →
                                    </Link>
                                </CardHeader>
                                <CardContent className="overflow-hidden">
                                    <pre className="mermaid">{diagram.mermaid_source}</pre>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={selectedDiagram !== null} onOpenChange={(open) => !open && setSelectedDiagram(null)}>
                <DialogContent className="flex max-h-[90vh] w-full max-w-[calc(100%-2rem)] flex-col sm:max-w-6xl">
                    {selectedDiagram && (
                        <>
                            <DialogHeader>
                                <div className="flex items-start justify-between gap-3 pr-6">
                                    <div className="space-y-1">
                                        <DialogTitle>{selectedDiagram.title}</DialogTitle>
                                        <DialogDescription asChild>
                                            <Link
                                                href={`/knowledge/${selectedDiagram.domain.slug}/${selectedDiagram.article.slug}`}
                                                className="hover:text-foreground text-xs transition-colors"
                                            >
                                                {selectedDiagram.article.title} →
                                            </Link>
                                        </DialogDescription>
                                    </div>
                                    {selectedDiagram.domain.color && (
                                        <Badge
                                            variant="secondary"
                                            className="shrink-0 text-[10px]"
                                            style={{
                                                backgroundColor: `${selectedDiagram.domain.color}20`,
                                                color: selectedDiagram.domain.color,
                                            }}
                                        >
                                            {selectedDiagram.domain.name}
                                        </Badge>
                                    )}
                                </div>
                            </DialogHeader>
                            <MermaidPreview key={selectedDiagram.id} source={selectedDiagram.mermaid_source} />
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
