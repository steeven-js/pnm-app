import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function Heading({
    title,
    description,
    variant = 'default',
}: {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
}) {
    return (
        <Box
            component="header"
            sx={variant === 'small' ? {} : { mb: 4, display: 'flex', flexDirection: 'column', gap: 0.25 }}
        >
            <Typography
                variant={variant === 'small' ? 'body1' : 'h6'}
                sx={{
                    fontWeight: variant === 'small' ? 500 : 600,
                    ...(variant === 'small' ? { mb: 0.25 } : { letterSpacing: '-0.025em' }),
                }}
            >
                {title}
            </Typography>
            {description && (
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
            )}
        </Box>
    );
}
