import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CardActionArea from '@mui/material/CardActionArea';

import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

import type { KnowledgeDomain, DomainProgress } from 'src/types';

// ----------------------------------------------------------------------

type DomainCardProps = CardProps & {
  domain: KnowledgeDomain;
  progress?: DomainProgress;
};

export function DomainCard({ domain, progress, sx, ...other }: DomainCardProps) {
  const percentage = progress?.completion_percentage ?? 0;
  const articlesRead = progress?.articles_read ?? 0;
  const articlesTotal = domain.articles_count ?? 0;

  return (
    <Card sx={sx} {...other}>
      <CardActionArea
        component={RouterLink}
        href={paths.knowledge.domain(domain.slug)}
        sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: 1 }}>
          <Iconify
            icon={domain.icon || 'solar:document-bold-duotone'}
            width={28}
            sx={{ color: domain.color ?? 'primary.main' }}
          />
          <Typography variant="subtitle1" sx={{ flex: 1 }}>
            {domain.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {articlesRead}/{articlesTotal}
          </Typography>
        </Box>

        <Box sx={{ width: 1 }}>
          <LinearProgress
            variant="determinate"
            value={Number(percentage)}
            color="primary"
            sx={{ height: 6, borderRadius: 1 }}
          />
        </Box>
      </CardActionArea>
    </Card>
  );
}
