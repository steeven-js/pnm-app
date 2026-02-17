import { Head, router, usePage } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

import type { Article, GlossaryTerm, KnowledgeDomain } from 'src/types';

import { ArticleContent } from './components/article-content';
import { GlossaryTooltip } from './components/glossary-tooltip';

// ----------------------------------------------------------------------

type Props = {
  domain: KnowledgeDomain;
  article: Article;
  isRead: boolean;
  prevArticle: { id: number; title: string; slug: string } | null;
  nextArticle: { id: number; title: string; slug: string } | null;
};

const LEVEL_LABELS: Record<string, string> = {
  decouverte: 'Découverte',
  comprehension: 'Compréhension',
  maitrise: 'Maîtrise',
  expertise: 'Expertise',
};

export default function ArticleShow() {
  const { domain, article, isRead, prevArticle, nextArticle } = usePage().props as unknown as Props;

  const markAsRead = () => {
    router.post(`/articles/${article.id}/mark-read`, {}, { preserveScroll: true });
  };

  return (
    <DashboardLayout>
      <Head title={article.title} />

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
          <Typography
            component={RouterLink}
            href={`/knowledge/${domain.slug}`}
            variant="body2"
            color="text.secondary"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {domain.name}
          </Typography>
          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
            {article.title}
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
          {/* Main content */}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            {/* Article header */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip
                  label={LEVEL_LABELS[article.level] || article.level}
                  size="small"
                  variant="outlined"
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Iconify icon="solar:clock-circle-outline" width={14} sx={{ color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary">
                    {article.reading_time_minutes} min de lecture
                  </Typography>
                </Box>
                {isRead && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Iconify icon="solar:check-circle-bold" width={14} sx={{ color: 'success.main' }} />
                    <Typography variant="caption" sx={{ color: 'success.main' }}>
                      Lu
                    </Typography>
                  </Box>
                )}
              </Box>
              <Typography variant="h4">{article.title}</Typography>
              {article.excerpt && (
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  {article.excerpt}
                </Typography>
              )}
            </Box>

            {/* Article body */}
            <ArticleContent content={article.content || ''} />

            {/* Prev / Next navigation */}
            <Box
              sx={{
                mt: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid',
                borderColor: 'divider',
                pt: 2,
              }}
            >
              <Box>
                {prevArticle && (
                  <Typography
                    component={RouterLink}
                    href={`/knowledge/${domain.slug}/${prevArticle.slug}`}
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      textDecoration: 'none',
                      '&:hover': { color: 'text.primary' },
                    }}
                  >
                    <Iconify icon="solar:arrow-left-linear" width={16} />
                    {prevArticle.title}
                  </Typography>
                )}
              </Box>
              <Box>
                {nextArticle && (
                  <Typography
                    component={RouterLink}
                    href={`/knowledge/${domain.slug}/${nextArticle.slug}`}
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      textDecoration: 'none',
                      '&:hover': { color: 'text.primary' },
                    }}
                  >
                    {nextArticle.title}
                    <Iconify icon="solar:arrow-right-linear" width={16} />
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Mark as read */}
            {!isRead && (
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={markAsRead}
                  startIcon={<Iconify icon="solar:check-circle-bold" width={18} />}
                >
                  Marquer comme lu
                </Button>
              </Box>
            )}
          </Box>

          {/* Glossary sidebar */}
          {article.glossary_terms && article.glossary_terms.length > 0 && (
            <Box component="aside" sx={{ width: { xs: '100%', lg: 288 }, flexShrink: 0 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                    Termes techniques
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {article.glossary_terms.map((term: GlossaryTerm) => (
                      <Box key={term.id}>
                        <GlossaryTooltip term={term}>
                          {term.abbreviation || term.term}
                        </GlossaryTooltip>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            mt: 0.25,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
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
      </Box>
    </DashboardLayout>
  );
}
