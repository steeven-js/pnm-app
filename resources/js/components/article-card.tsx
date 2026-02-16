import { Link } from '@inertiajs/react';
import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { CheckCircle2, Clock, FileText } from 'lucide-react';
import type { Article } from '@/types';

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
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                px: 2,
                py: 1.5,
            }}
        >
            <ListItemIcon sx={{ minWidth: 36 }}>
                {isRead ? (
                    <CheckCircle2 size={20} color="#22c55e" />
                ) : (
                    <FileText size={20} style={{ opacity: 0.5 }} />
                )}
            </ListItemIcon>
            <ListItemText
                primary={article.title}
                secondary={article.excerpt}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 500, noWrap: true }}
                secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1, flexShrink: 0 }}>
                <Clock size={12} style={{ opacity: 0.5 }} />
                <Typography variant="caption" color="text.secondary">
                    {article.reading_time_minutes} min
                </Typography>
            </Box>
        </ListItemButton>
    );
}
