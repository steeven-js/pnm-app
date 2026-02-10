import { Head } from '@inertiajs/react';
import { ArticleCard } from '@/components/article-card';
import AppLayout from '@/layouts/app-layout';
import type { Article, BreadcrumbItem, KnowledgeDomain } from '@/types';

type Props = {
    domain: KnowledgeDomain;
    articles: Article[];
    readArticleIds: number[];
};

export default function DomainShow({ domain, articles, readArticleIds }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Connaissances', href: '/knowledge' },
        { title: domain.name, href: `/knowledge/${domain.slug}` },
    ];

    const readCount = articles.reduce((acc, article) => {
        let count = readArticleIds.includes(article.id) ? 1 : 0;
        if (article.children) {
            count += article.children.filter((c) => readArticleIds.includes(c.id)).length;
        }
        return acc + count;
    }, 0);

    const totalCount = articles.reduce(
        (acc, article) => acc + 1 + (article.children?.length || 0),
        0,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={domain.name} />
            <div className="flex flex-col gap-6 p-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div
                            className="flex size-10 items-center justify-center rounded-xl text-xl"
                            style={{ backgroundColor: `${domain.color}15` }}
                        >
                            {domain.icon || '📖'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{domain.name}</h1>
                            <p className="text-muted-foreground text-sm">
                                {readCount}/{totalCount} articles lus
                            </p>
                        </div>
                    </div>
                    {domain.description && (
                        <p className="text-muted-foreground mt-3 text-sm">{domain.description}</p>
                    )}
                </div>

                <div className="space-y-6">
                    {articles.map((article) => (
                        <div key={article.id}>
                            <ArticleCard
                                article={article}
                                domainSlug={domain.slug}
                                isRead={readArticleIds.includes(article.id)}
                            />
                            {article.children && article.children.length > 0 && (
                                <div className="ml-6 mt-2 space-y-2 border-l-2 pl-4">
                                    {article.children.map((child) => (
                                        <ArticleCard
                                            key={child.id}
                                            article={child}
                                            domainSlug={domain.slug}
                                            isRead={readArticleIds.includes(child.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
