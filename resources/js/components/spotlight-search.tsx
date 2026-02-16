import { router } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { BookOpen, FileText, Hash, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SearchResults } from '@/types';

export function SpotlightSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResults>({ articles: [], glossary: [], pnmCodes: [] });
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
            setResults({ articles: [], glossary: [], pnmCodes: [] });
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
        setResults({ articles: [], glossary: [], pnmCodes: [] });
        router.visit(url);
    };

    const hasResults = results.articles.length > 0 || results.glossary.length > 0 || results.pnmCodes.length > 0;

    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    position: 'fixed',
                    top: '20%',
                    m: 0,
                    borderRadius: 2,
                    overflow: 'hidden',
                },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <TextField
                    value={query}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="Rechercher articles, termes..."
                    fullWidth
                    autoFocus
                    variant="standard"
                    slotProps={{
                        input: {
                            disableUnderline: true,
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={16} style={{ opacity: 0.5 }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Chip label="\u2318K" size="small" variant="outlined" sx={{ fontSize: '0.625rem', height: 20, fontFamily: 'monospace' }} />
                                </InputAdornment>
                            ),
                            sx: { py: 1.5 },
                        },
                    }}
                />
            </Box>

            {query.length >= 2 && (
                <DialogContent sx={{ maxHeight: 320, p: 1 }}>
                    {loading && (
                        <Typography color="text.secondary" variant="body2" sx={{ p: 2, textAlign: 'center' }}>
                            Recherche...
                        </Typography>
                    )}

                    {!loading && !hasResults && (
                        <Typography color="text.secondary" variant="body2" sx={{ p: 2, textAlign: 'center' }}>
                            Aucun résultat pour &quot;{query}&quot;
                        </Typography>
                    )}

                    {results.articles.length > 0 && (
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ px: 1, py: 0.75, display: 'block', fontWeight: 500 }}>
                                Articles
                            </Typography>
                            {results.articles.map((article) => (
                                <Box
                                    key={article.id}
                                    component="button"
                                    onClick={() => navigate(`/knowledge/${article.domain.slug}/${article.slug}`)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 1.5,
                                        width: '100%',
                                        px: 1,
                                        py: 1,
                                        textAlign: 'left',
                                        borderRadius: 1,
                                        border: 'none',
                                        bgcolor: 'transparent',
                                        cursor: 'pointer',
                                        color: 'inherit',
                                        '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                >
                                    <FileText size={16} style={{ opacity: 0.5, marginTop: 2, flexShrink: 0 }} />
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography variant="body2" fontWeight={500} noWrap>
                                            {article.title}
                                        </Typography>
                                        {article.excerpt && (
                                            <Typography variant="caption" color="text.secondary" noWrap component="p">
                                                {article.excerpt}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Chip
                                        label={article.domain.name}
                                        size="small"
                                        sx={{
                                            mt: 0.25,
                                            ml: 'auto',
                                            flexShrink: 0,
                                            fontSize: '0.625rem',
                                            height: 20,
                                            bgcolor: article.domain.color || '#6b7280',
                                            color: '#fff',
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    )}

                    {results.glossary.length > 0 && (
                        <Box>
                            {results.articles.length > 0 && <Divider sx={{ my: 1 }} />}
                            <Typography variant="caption" color="text.secondary" sx={{ px: 1, py: 0.75, display: 'block', fontWeight: 500 }}>
                                Glossaire
                            </Typography>
                            {results.glossary.map((term) => (
                                <Box
                                    key={term.id}
                                    component="button"
                                    onClick={() => navigate(`/glossary?q=${encodeURIComponent(term.term)}`)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 1.5,
                                        width: '100%',
                                        px: 1,
                                        py: 1,
                                        textAlign: 'left',
                                        borderRadius: 1,
                                        border: 'none',
                                        bgcolor: 'transparent',
                                        cursor: 'pointer',
                                        color: 'inherit',
                                        '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                >
                                    <BookOpen size={16} style={{ opacity: 0.5, marginTop: 2, flexShrink: 0 }} />
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="body2" fontWeight={500}>
                                            {term.abbreviation && (
                                                <Box component="span" sx={{ fontFamily: 'monospace', color: 'primary.main', mr: 0.5 }}>
                                                    {term.abbreviation}
                                                </Box>
                                            )}
                                            {term.term}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" noWrap component="p">
                                            {term.definition}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {results.pnmCodes.length > 0 && (
                        <Box>
                            {(results.articles.length > 0 || results.glossary.length > 0) && <Divider sx={{ my: 1 }} />}
                            <Typography variant="caption" color="text.secondary" sx={{ px: 1, py: 0.75, display: 'block', fontWeight: 500 }}>
                                Codes PNM
                            </Typography>
                            {results.pnmCodes.map((code) => (
                                <Box
                                    key={code.id}
                                    component="button"
                                    onClick={() => navigate(`/resolve/codes/${code.code}`)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 1.5,
                                        width: '100%',
                                        px: 1,
                                        py: 1,
                                        textAlign: 'left',
                                        borderRadius: 1,
                                        border: 'none',
                                        bgcolor: 'transparent',
                                        cursor: 'pointer',
                                        color: 'inherit',
                                        '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                >
                                    <Hash size={16} style={{ opacity: 0.5, marginTop: 2, flexShrink: 0 }} />
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography variant="body2" fontWeight={500}>
                                            <Box component="span" sx={{ fontFamily: 'monospace', color: 'primary.main', mr: 0.5 }}>
                                                {code.code}
                                            </Box>
                                            {code.label}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" noWrap component="p">
                                            {code.category}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                </DialogContent>
            )}
        </Dialog>
    );
}
