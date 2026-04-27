import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type OperationStatus = 'CRITIQUE' | 'EN COURS' | 'PLANIFIE' | 'A PLANIFIER' | 'EN ATTENTE';

type OperationCardProps = CardProps & {
  title: string;
  description: string;
  icon: string;
  href: string;
  status: OperationStatus;
  deadline?: string;
  color?: string;
};

const STATUS_COLORS: Record<OperationStatus, { bg: string; fg: string }> = {
  CRITIQUE:      { bg: 'rgba(255, 86, 48, 0.16)',  fg: '#B71D18' },
  'EN COURS':    { bg: 'rgba(255, 171, 0, 0.16)',  fg: '#B76E00' },
  PLANIFIE:      { bg: 'rgba(0, 184, 217, 0.16)',  fg: '#006C9C' },
  'A PLANIFIER': { bg: 'rgba(145, 158, 171, 0.16)', fg: '#637381' },
  'EN ATTENTE':  { bg: 'rgba(145, 158, 171, 0.16)', fg: '#637381' },
};

function isExternal(href: string) {
  return href.startsWith('http://') || href.startsWith('https://');
}

export function OperationCard({
  title,
  description,
  icon,
  href,
  status,
  deadline,
  color,
  sx,
  ...other
}: OperationCardProps) {
  const statusColor = STATUS_COLORS[status];
  const external = isExternal(href);

  const actionAreaProps = external
    ? { component: 'a' as const, href, target: '_blank', rel: 'noopener noreferrer' }
    : { component: RouterLink, href };

  return (
    <Card sx={{ height: 200, ...sx }} {...other}>
      <CardActionArea
        {...actionAreaProps}
        sx={{
          p: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          gap: 1.5,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
          <Iconify
            icon={icon}
            width={36}
            sx={{ color: color ?? 'primary.main' }}
          />
          <Box
            sx={{
              ml: 'auto',
              px: 1,
              py: 0.25,
              borderRadius: 0.75,
              fontSize: 11,
              fontWeight: 700,
              bgcolor: statusColor.bg,
              color: statusColor.fg,
            }}
          >
            {status}
          </Box>
        </Stack>

        <Typography variant="subtitle1">{title}</Typography>

        {deadline && (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {deadline}
          </Typography>
        )}

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {description}
        </Typography>
      </CardActionArea>
    </Card>
  );
}
