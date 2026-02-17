import { Head, usePage } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

import type { Article, KnowledgeDomain } from 'src/types';

import { ArticleCard } from './components/article-card';

// ----------------------------------------------------------------------

type Props = {
  domain: KnowledgeDomain;
  articles: Article[];
  readArticleIds: number[];
};

export default function DomainShow() {
  const { domain, articles, readArticleIds } = usePage().props as unknown as Props;

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
    <DashboardLayout>
      <Head title={domain.name} />

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
            href="/knowledge"
            variant="body2"
            color="text.secondary"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Connaissances
          </Typography>
          <Typography variant="body2">{domain.name}</Typography>
        </Breadcrumbs>

        {/* Domain header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                width: 44,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                bgcolor: `${domain.color}15`,
              }}
            >
              <Iconify
                icon={domain.icon || 'solar:document-bold-duotone'}
                width={24}
                sx={{ color: domain.color ?? 'primary.main' }}
              />
            </Box>
            <Box>
              <Typography variant="h4">{domain.name}</Typography>
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

        {/* Articles list */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {articles.map((article) => (
            <Box key={article.id}>
              <ArticleCard
                article={article}
                domainSlug={domain.slug}
                isRead={readArticleIds.includes(article.id)}
              />
              {article.children && article.children.length > 0 && (
                <Box
                  sx={{
                    ml: 3,
                    mt: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    borderLeft: '2px solid',
                    borderColor: 'divider',
                    pl: 2,
                  }}
                >
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
    </DashboardLayout>
  );
}
