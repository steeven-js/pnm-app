import { Head, Link, router } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { ArticleContent } from '@/components/article-content';
import { GlossaryTooltip } from '@/components/glossary-tooltip';
import AppLayout from '@/layouts/app-layout';
import type { Article, BreadcrumbItem, GlossaryTerm, KnowledgeDomain } from '@/types';

type Props = {
    domain: KnowledgeDomain;
    article: Article;
    isRead: boolean;
    prevArticle: { id: number; title: string; slug: string } | null;
    nextArticle: { id: number; title: string; slug: string } | null;
};

const levelLabels: Record<string, string> = {
    decouverte: 'Découverte',
    comprehension: 'Compréhension',
    maitrise: 'Maîtrise',
    expertise: 'Expertise',
};

export default function ArticleShow({ domain, article, isRead, prevArticle, nextArticle }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Connaissances', href: '/knowledge' },
        { title: domain.name, href: `/knowledge/${domain.slug}` },
        { title: article.title, href: `/knowledge/${domain.slug}/${article.slug}` },
    ];

    const markAsRead = () => {
        router.post(`/articles/${article.id}/mark-read`, {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={article.title} />
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, p: 2 }}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip label={levelLabels[article.level] || article.level} size="small" variant="outlined" />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Clock size={12} style={{ opacity: 0.5 }} />
                                <Typography variant="caption" color="text.secondary">
                                    {article.reading_time_minutes} min de lecture
                                </Typography>
                            </Box>
                            {isRead && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CheckCircle2 size={12} color="#16a34a" />
                                    <Typography variant="caption" sx={{ color: '#16a34a' }}>
                                        Lu
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        <Typography variant="h5" fontWeight={700}>
                            {article.title}
                        </Typography>
                        {article.excerpt && (
                            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                                {article.excerpt}
                            </Typography>
                        )}
                    </Box>

                    <ArticleContent content={article.content || ''} />

                    <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
                        <Box>
                            {prevArticle && (
                                <MuiLink
                                    component={Link}
                                    href={`/knowledge/${domain.slug}/${prevArticle.slug}`}
                                    underline="hover"
                                    color="text.secondary"
                                    variant="body2"
                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { color: 'text.primary' } }}
                                >
                                    <ArrowLeft size={16} />
                                    {prevArticle.title}
                                </MuiLink>
                            )}
                        </Box>
                        <Box>
                            {nextArticle && (
                                <MuiLink
                                    component={Link}
                                    href={`/knowledge/${domain.slug}/${nextArticle.slug}`}
                                    underline="hover"
                                    color="text.secondary"
                                    variant="body2"
                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { color: 'text.primary' } }}
                                >
                                    {nextArticle.title}
                                    <ArrowRight size={16} />
                                </MuiLink>
                            )}
                        </Box>
                    </Box>

                    {!isRead && (
                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                onClick={markAsRead}
                                startIcon={<CheckCircle2 size={16} />}
                            >
                                Marquer comme lu
                            </Button>
                        </Box>
                    )}
                </Box>

                {article.glossary_terms && article.glossary_terms.length > 0 && (
                    <Box component="aside" sx={{ width: { xs: '100%', lg: 288 }, flexShrink: 0 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>
                                    Termes techniques
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {article.glossary_terms.map((term: GlossaryTerm) => (
                                        <Box key={term.id}>
                                            <GlossaryTooltip term={term}>
                                                {term.abbreviation || term.term}
                                            </GlossaryTooltip>
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {term.definition}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </Box>
        </AppLayout>
    );
}
