import { useRef, useMemo } from 'react';

import Box from '@mui/material/Box';

import { useMermaid } from 'src/hooks/use-mermaid';

import { SqlTryIt } from './sql-try-it';

// ----------------------------------------------------------------------

type Segment =
  | { type: 'html'; html: string }
  | { type: 'sql'; html: string; sql: string };

/**
 * Check if a SQL string looks like an executable SELECT query on w3_ tables.
 */
function isExecutableSql(sql: string): boolean {
  const trimmed = sql.trim();
  if (!/^(SELECT|WITH)\s/i.test(trimmed)) return false;
  if (!/\bw3_\w+/i.test(trimmed)) return false;
  if (/\bnom_de_la_table\b/i.test(trimmed)) return false;
  if (/\bcolonne1\b/i.test(trimmed)) return false;
  if (/\bvaleur1\b/i.test(trimmed)) return false;
  if (/\btable1\b/i.test(trimmed)) return false;
  return true;
}

/**
 * Decode HTML entities in a string (used to extract raw SQL from HTML).
 */
function decodeHtml(html: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

/**
 * Parse article HTML content and split into segments:
 * - Regular HTML segments
 * - SQL code blocks that get a "Try it" button
 */
function parseContent(content: string): Segment[] {
  // Match <pre><code>...</code></pre> blocks (with optional whitespace/attributes)
  const preCodeRegex = /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi;

  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = preCodeRegex.exec(content)) !== null) {
    // Add HTML before this match
    if (match.index > lastIndex) {
      segments.push({ type: 'html', html: content.slice(lastIndex, match.index) });
    }

    const fullMatch = match[0];
    const codeInnerHtml = match[1];
    const rawSql = decodeHtml(codeInnerHtml);

    if (isExecutableSql(rawSql)) {
      segments.push({ type: 'sql', html: fullMatch, sql: rawSql.trim() });
    } else {
      segments.push({ type: 'html', html: fullMatch });
    }

    lastIndex = match.index + fullMatch.length;
  }

  // Add remaining HTML after last match
  if (lastIndex < content.length) {
    segments.push({ type: 'html', html: content.slice(lastIndex) });
  }

  return segments;
}

// Shared sx styles for article HTML
const articleSx = {
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
} as const;

// ----------------------------------------------------------------------

export function ArticleContent({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useMermaid(ref, content);

  const segments = useMemo(() => parseContent(content), [content]);

  // If no SQL blocks found, render as before (simpler path, supports mermaid)
  const hasSql = segments.some((s) => s.type === 'sql');

  if (!hasSql) {
    return (
      <Box
        ref={ref}
        sx={articleSx}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <Box ref={ref} sx={articleSx}>
      {segments.map((segment, i) => {
        if (segment.type === 'html') {
          return (
            <Box
              key={i}
              dangerouslySetInnerHTML={{ __html: segment.html }}
            />
          );
        }

        // SQL block: render the code block + TryIt button
        return (
          <Box key={i}>
            <Box dangerouslySetInnerHTML={{ __html: segment.html }} />
            <SqlTryIt initialSql={segment.sql} />
          </Box>
        );
      })}
    </Box>
  );
}
