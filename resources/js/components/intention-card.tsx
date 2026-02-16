import { Link } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import type { LucideIcon } from 'lucide-react';

type IntentionCardProps = {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    color: string;
    disabled?: boolean;
};

export function IntentionCard({ title, description, icon: Icon, href, color, disabled }: IntentionCardProps) {
    const content = (
        <Card
            sx={{
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s',
                ...(disabled
                    ? { opacity: 0.5, cursor: 'not-allowed' }
                    : { cursor: 'pointer', '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' } }),
            }}
        >
            <Box sx={{ position: 'absolute', inset: 0, bgcolor: color, opacity: 0.05 }} />
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                    sx={{
                        display: 'flex',
                        width: 48,
                        height: 48,
                        flexShrink: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 3,
                        bgcolor: `${color}15`,
                        color,
                    }}
                >
                    <Icon size={24} />
                </Box>
                <Box>
                    <Typography variant="body1" fontWeight={600}>
                        {title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {description}
                    </Typography>
                </Box>
            </CardContent>
            {disabled && (
                <Chip
                    label="Phase 2"
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        fontSize: '0.625rem',
                        height: 20,
                    }}
                />
            )}
        </Card>
    );

    if (disabled) return content;

    return (
        <Link href={href} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            {content}
        </Link>
    );
}
