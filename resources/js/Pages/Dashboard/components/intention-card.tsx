import type { CardProps } from '@mui/material/Card';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type IntentionCardProps = CardProps & {
  title: string;
  description: string;
  icon: string;
  href: string;
  color?: string;
};

export function IntentionCard({ title, description, icon, href, color, sx, ...other }: IntentionCardProps) {
  return (
    <Card sx={sx} {...other}>
      <CardActionArea
        component={RouterLink}
        href={href}
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 1.5,
        }}
      >
        <Iconify
          icon={icon}
          width={40}
          sx={{ color: color ?? 'primary.main' }}
        />

        <Typography variant="h6">{title}</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {description}
        </Typography>
      </CardActionArea>
    </Card>
  );
}
