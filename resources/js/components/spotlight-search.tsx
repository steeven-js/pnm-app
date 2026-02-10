import { router } from '@inertiajs/react';
import { BookOpen, FileText, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { SearchResults } from '@/types';

export function SpotlightSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResults>({ articles: [], glossary: [] });
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);


    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const search = useCallback((q: string) => {
        if (q.length < 2) {
            setResults({ articles: [], glossary: [] });
            return;
        }
        setLoading(true);
        fetch(`/api/search?q=${encodeURIComponent(q)}`)
            .then((r) => r.json())
            .then((data: SearchResults) => {
                setResults(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleChange = (value: string) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(value), 300);
    };

    const navigate = (url: string) => {
        setOpen(false);
        setQuery('');
        setResults({ articles: [], glossary: [] });
        router.visit(url);
    };

    const hasResults = results.articles.length > 0 || results.glossary.length > 0;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="top-[20%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl">
                <DialogTitle className="sr-only">Rechercher</DialogTitle>
                <DialogDescription className="sr-only">
                    Rechercher des articles et termes du glossaire
                </DialogDescription>
                <div className="flex items-center border-b px-3">
                    <Search className="text-muted-foreground mr-2 size-4 shrink-0" />
                    <Input
                        value={query}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder="Rechercher articles, termes..."
                        className="h-12 border-0 shadow-none focus-visible:ring-0"
                    />
                    <kbd className="bg-muted text-muted-foreground pointer-events-none ml-2 inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </div>

                {query.length >= 2 && (
                    <div className="max-h-80 overflow-y-auto p-2">
                        {loading && (
                            <p className="text-muted-foreground p-4 text-center text-sm">
                                Recherche...
                            </p>
                        )}

                        {!loading && !hasResults && (
                            <p className="text-muted-foreground p-4 text-center text-sm">
                                Aucun résultat pour &quot;{query}&quot;
                            </p>
                        )}

                        {results.articles.length > 0 && (
                            <div>
                                <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                                    Articles
                                </p>
                                {results.articles.map((article) => (
                                    <button
                                        key={article.id}
                                        onClick={() =>
                                            navigate(
                                                `/knowledge/${article.domain.slug}/${article.slug}`,
                                            )
                                        }
                                        className="hover:bg-accent flex w-full items-start gap-3 rounded-md px-2 py-2 text-left"
                                    >
                                        <FileText className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">
                                                {article.title}
                                            </p>
                                            {article.excerpt && (
                                                <p className="text-muted-foreground truncate text-xs">
                                                    {article.excerpt}
                                                </p>
                                            )}
                                        </div>
                                        <span
                                            className="mt-0.5 ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
                                            style={{
                                                backgroundColor: article.domain.color || '#6b7280',
                                            }}
                                        >
                                            {article.domain.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {results.glossary.length > 0 && (
                            <div className={results.articles.length > 0 ? 'mt-2 border-t pt-2' : ''}>
                                <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                                    Glossaire
                                </p>
                                {results.glossary.map((term) => (
                                    <button
                                        key={term.id}
                                        onClick={() => navigate(`/glossary?q=${encodeURIComponent(term.term)}`)}
                                        className="hover:bg-accent flex w-full items-start gap-3 rounded-md px-2 py-2 text-left"
                                    >
                                        <BookOpen className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium">
                                                {term.abbreviation && (
                                                    <span className="text-primary mr-1 font-mono">
                                                        {term.abbreviation}
                                                    </span>
                                                )}
                                                {term.term}
                                            </p>
                                            <p className="text-muted-foreground line-clamp-1 text-xs">
                                                {term.definition}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
