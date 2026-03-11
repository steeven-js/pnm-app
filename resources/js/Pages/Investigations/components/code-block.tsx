import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ─── CodeBlock ──────────────────────────────────────────────────────────────

type CodeBlockProps = {
  children: string;
  label?: string;
  server?: string;
  type?: 'ssh' | 'sql';
};

export function CodeBlock({ children, label, server, type }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [children]);

  return (
    <Box sx={{ my: 1.5 }}>
      {(label || server) && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
          {type && (
            <Chip
              label={type.toUpperCase()}
              size="small"
              color={type === 'ssh' ? 'info' : 'warning'}
              variant="outlined"
              sx={{ fontSize: 10, height: 20 }}
            />
          )}
          {server && (
            <Chip
              label={server}
              size="small"
              variant="filled"
              sx={{ fontSize: 10, height: 20, bgcolor: 'grey.200', color: 'grey.700' }}
            />
          )}
          {label && (
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          )}
        </Stack>
      )}

      <Box sx={{ position: 'relative' }}>
        <Box
          component="pre"
          sx={{
            p: 1.5,
            pr: 5,
            borderRadius: 1,
            bgcolor: '#1e293b',
            color: '#e2e8f0',
            fontSize: 13,
            fontFamily: 'monospace',
            lineHeight: 1.6,
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {children}
        </Box>
        <Tooltip title={copied ? 'Copie !' : 'Copier'} placement="left">
          <IconButton
            size="small"
            onClick={handleCopy}
            sx={{
              position: 'absolute',
              top: 6,
              right: 6,
              color: copied ? '#22c55e' : '#94a3b8',
              '&:hover': { color: '#e2e8f0' },
            }}
          >
            <Iconify icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold'} width={16} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
