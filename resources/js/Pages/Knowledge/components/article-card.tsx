import { Link } from '@inertiajs/react';

import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import type { Article } from 'src/types';

// ----------------------------------------------------------------------

type ArticleCardProps = {
  article: Article;
  domainSlug: string;
  isRead?: boolean;
};

export function ArticleCard({ article, domainSlug, isRead }: ArticleCardProps) {
  return (
    <ListItemButton
      component={Link}
      href={`/knowledge/${domainSlug}/${article.slug}`}
      sx={{
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        px: 2,
        py: 1.5,
      }}
    >
      <ListItemIcon sx={{ minWidth: 36 }}>
        {isRead ? (
          <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: 'success.main' }} />
        ) : (
          <Iconify icon="solar:document-text-bold" width={20} sx={{ color: 'text.disabled' }} />
        )}
      </ListItemIcon>
      <ListItemText
        primary={article.title}
        secondary={article.excerpt}
        primaryTypographyProps={{ variant: 'body2', fontWeight: 500, noWrap: true }}
        secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1, flexShrink: 0 }}>
        <Iconify icon="solar:clock-circle-outline" width={12} sx={{ color: 'text.disabled' }} />
        <Typography variant="caption" color="text.secondary">
          {article.reading_time_minutes} min
        </Typography>
      </Box>
    </ListItemButton>
  );
}
