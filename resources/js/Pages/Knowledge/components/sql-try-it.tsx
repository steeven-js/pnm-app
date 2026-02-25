import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import axios from 'axios';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type QueryResult = {
  columns: string[];
  rows: Record<string, unknown>[];
  row_count: number;
  truncated: boolean;
};

type SqlTryItProps = {
  initialSql: string;
};

export function SqlTryIt({ initialSql }: SqlTryItProps) {
  const [open, setOpen] = useState(false);
  const [sql, setSql] = useState(initialSql);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('/api/sql-playground', { sql: sql.trim() });
      setResult(response.data as QueryResult);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.response?.data?.error || 'Erreur lors de l\'exécution';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [sql]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      execute();
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      {/* Try it button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -0.5, mb: 1 }}>
        <Button
          size="small"
          variant={open ? 'contained' : 'soft'}
          color="success"
          startIcon={<Iconify icon="solar:play-bold" width={16} />}
          onClick={() => {
            setOpen(!open);
            if (!open) {
              setSql(initialSql);
              setResult(null);
              setError(null);
            }
          }}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Essayer
        </Button>
      </Box>

      {/* Collapsible editor + results */}
      <Collapse in={open}>
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.5,
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          {/* SQL editor */}
          <Box sx={{ position: 'relative' }}>
            <Box
              component="textarea"
              value={sql}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSql(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              sx={{
                width: '100%',
                minHeight: 100,
                p: 2,
                border: 'none',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                bgcolor: 'grey.900',
                color: 'common.white',
              }}
            />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1,
                bgcolor: 'grey.800',
              }}
            >
              <Typography variant="caption" sx={{ color: 'grey.500' }}>
                {navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}+Entrée pour exécuter
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="text"
                  color="inherit"
                  onClick={() => {
                    setSql(initialSql);
                    setResult(null);
                    setError(null);
                  }}
                  sx={{ color: 'grey.400', textTransform: 'none', minWidth: 'auto' }}
                >
                  Réinitialiser
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={execute}
                  disabled={loading || !sql.trim()}
                  startIcon={
                    loading ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <Iconify icon="solar:play-bold" width={14} />
                    )
                  }
                  sx={{ textTransform: 'none' }}
                >
                  Exécuter
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Error */}
          {error && (
            <Box sx={{ px: 2, py: 1.5, bgcolor: 'error.lighter', color: 'error.darker' }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {error}
              </Typography>
            </Box>
          )}

          {/* Results */}
          {result && (
            <Box>
              {/* Result header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  py: 1,
                  bgcolor: 'success.lighter',
                }}
              >
                <Typography variant="caption" sx={{ color: 'success.darker', fontWeight: 600 }}>
                  {result.row_count} ligne{result.row_count > 1 ? 's' : ''} retournée
                  {result.row_count > 1 ? 's' : ''}
                  {result.truncated && ' (tronqué à 100)'}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    const header = result.columns.join('\t');
                    const rows = result.rows
                      .map((r) => result.columns.map((c) => String(r[c] ?? '')).join('\t'))
                      .join('\n');
                    navigator.clipboard.writeText(`${header}\n${rows}`);
                  }}
                  title="Copier les résultats"
                >
                  <Iconify icon="solar:copy-bold" width={16} />
                </IconButton>
              </Box>

              {/* Results table */}
              {result.columns.length > 0 && (
                <Box sx={{ overflow: 'auto', maxHeight: 400 }}>
                  <Box
                    component="table"
                    sx={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                      '& th, & td': {
                        px: 1.5,
                        py: 0.75,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        textAlign: 'left',
                        whiteSpace: 'nowrap',
                      },
                      '& th': {
                        bgcolor: 'background.neutral',
                        fontWeight: 700,
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                      },
                      '& tr:hover td': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <thead>
                      <tr>
                        {result.columns.map((col) => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row, i) => (
                        <tr key={i}>
                          {result.columns.map((col) => (
                            <td key={col}>
                              {row[col] === null ? (
                                <Box component="span" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                                  NULL
                                </Box>
                              ) : (
                                String(row[col])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                </Box>
              )}

              {/* Empty result */}
              {result.columns.length === 0 && (
                <Box sx={{ px: 2, py: 2, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    La requête n'a retourné aucun résultat.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
