import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import type { GlossaryTerm } from 'src/types';

// ----------------------------------------------------------------------

type GlossaryTooltipProps = {
  term: GlossaryTerm;
  children?: React.ReactNode;
};

export function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
  return (
    <Tooltip
      title={
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" fontWeight={600}>
            {term.abbreviation && (
              <Box component="span" sx={{ fontFamily: 'monospace', mr: 0.5 }}>
                {term.abbreviation}
              </Box>
            )}
            {term.term}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            {term.definition}
          </Typography>
        </Box>
      }
      placement="top"
    >
      <Box
        component="span"
        sx={{
          borderBottom: '1px dashed',
          borderColor: 'primary.light',
          cursor: 'help',
          fontWeight: 500,
        }}
      >
        {children || term.abbreviation || term.term}
      </Box>
    </Tooltip>
  );
}
