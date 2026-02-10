import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { GlossaryTooltip } from '@/components/glossary-tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
            <div className="flex flex-col gap-6 p-4 lg:flex-row">
                <div className="min-w-0 flex-1">
                    <div className="mb-4">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{levelLabels[article.level] || article.level}</Badge>
                            <span className="text-muted-foreground flex items-center gap-1 text-xs">
                                <Clock className="size-3" />
                                {article.reading_time_minutes} min de lecture
                            </span>
                            {isRead && (
                                <span className="flex items-center gap-1 text-xs text-green-600">
                                    <CheckCircle2 className="size-3" />
                                    Lu
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold">{article.title}</h1>
                        {article.excerpt && (
                            <p className="text-muted-foreground mt-1">{article.excerpt}</p>
                        )}
                    </div>

                    <div
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: article.content || '' }}
                    />

                    <div className="mt-6 flex items-center justify-between border-t pt-4">
                        <div>
                            {prevArticle && (
                                <Link
                                    href={`/knowledge/${domain.slug}/${prevArticle.slug}`}
                                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
                                >
                                    <ArrowLeft className="size-4" />
                                    {prevArticle.title}
                                </Link>
                            )}
                        </div>
                        <div>
                            {nextArticle && (
                                <Link
                                    href={`/knowledge/${domain.slug}/${nextArticle.slug}`}
                                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
                                >
                                    {nextArticle.title}
                                    <ArrowRight className="size-4" />
                                </Link>
                            )}
                        </div>
                    </div>

                    {!isRead && (
                        <div className="mt-4">
                            <Button onClick={markAsRead} className="w-full sm:w-auto">
                                <CheckCircle2 className="mr-2 size-4" />
                                Marquer comme lu
                            </Button>
                        </div>
                    )}
                </div>

                {article.glossary_terms && article.glossary_terms.length > 0 && (
                    <aside className="w-full shrink-0 lg:w-72">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Termes techniques</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {article.glossary_terms.map((term: GlossaryTerm) => (
                                    <div key={term.id}>
                                        <GlossaryTooltip term={term}>
                                            {term.abbreviation || term.term}
                                        </GlossaryTooltip>
                                        <p className="text-muted-foreground mt-0.5 text-xs line-clamp-2">
                                            {term.definition}
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </aside>
                )}
            </div>
        </AppLayout>
    );
}
