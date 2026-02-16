import { Head } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                width: 40,
                                height: 40,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 3,
                                fontSize: '1.25rem',
                                bgcolor: `${domain.color}15`,
                            }}
                        >
                            {domain.icon || '\u{1F4D6}'}
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight={700}>
                                {domain.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {readCount}/{totalCount} articles lus
                            </Typography>
                        </Box>
                    </Box>
                    {domain.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                            {domain.description}
                        </Typography>
                    )}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {articles.map((article) => (
                        <Box key={article.id}>
                            <ArticleCard
                                article={article}
                                domainSlug={domain.slug}
                                isRead={readArticleIds.includes(article.id)}
                            />
                            {article.children && article.children.length > 0 && (
                                <Box sx={{ ml: 3, mt: 1, display: 'flex', flexDirection: 'column', gap: 1, borderLeft: '2px solid', borderColor: 'divider', pl: 2 }}>
                                    {article.children.map((child) => (
                                        <ArticleCard
                                            key={child.id}
                                            article={child}
                                            domainSlug={domain.slug}
                                            isRead={readArticleIds.includes(child.id)}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    ))}
                </Box>
            </Box>
        </AppLayout>
    );
}
