import { useRef } from 'react';

import Box from '@mui/material/Box';

import { useMermaid } from 'src/hooks/use-mermaid';

// ----------------------------------------------------------------------

export function ArticleContent({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useMermaid(ref, content);

  return (
    <Box
      ref={ref}
      sx={{
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          mt: 3,
          mb: 1.5,
          fontWeight: 600,
        },
        '& p': { mb: 2, lineHeight: 1.7 },
        '& ul, & ol': { mb: 2, pl: 3 },
        '& li': { mb: 0.5 },
        '& pre:not(.mermaid)': {
          p: 2,
          borderRadius: 1.5,
          overflow: 'auto',
          bgcolor: 'background.neutral',
        },
        '& pre.mermaid': {
          display: 'flex',
          justifyContent: 'center',
          my: 3,
          '& svg': { maxWidth: '100%' },
        },
        '& code': {
          px: 0.75,
          py: 0.25,
          borderRadius: 0.5,
          fontSize: '0.875em',
          bgcolor: 'background.neutral',
        },
        '& pre code': { p: 0, bgcolor: 'transparent' },
        '& blockquote': {
          borderLeft: '4px solid',
          borderColor: 'primary.main',
          pl: 2,
          ml: 0,
          fontStyle: 'italic',
          color: 'text.secondary',
        },
        '& table': {
          width: '100%',
          borderCollapse: 'collapse',
          mb: 2,
        },
        '& th, & td': {
          border: '1px solid',
          borderColor: 'divider',
          px: 1.5,
          py: 1,
          textAlign: 'left',
        },
        '& th': {
          bgcolor: 'background.neutral',
          fontWeight: 600,
        },
        '& img': {
          maxWidth: '100%',
          borderRadius: 1.5,
        },
        '& a': {
          color: 'primary.main',
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' },
        },
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
