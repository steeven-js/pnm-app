import { useState, useCallback, useRef, useEffect } from 'react';

import { Head, usePage, Link } from '@inertiajs/react';
import axios from 'axios';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import CardActionArea from '@mui/material/CardActionArea';

import { Iconify } from 'src/components/iconify';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

import { SCENARIO_LEVELS, LEVEL_KEYS } from 'src/config/sql-scenarios';

// ----------------------------------------------------------------------

type ColumnSchema = {
  column: string;
  type: string;
  nullable: boolean;
};

type TableSchema = Record<string, ColumnSchema[]>;

type QueryResult = {
  success: boolean;
  columns?: string[];
  rows?: Record<string, unknown>[];
  row_count?: number;
  truncated?: boolean;
  error?: string;
};

type HistoryEntry = {
  sql: string;
  timestamp: number;
  success: boolean;
  rowCount: number;
};

type SqlPlaygroundProps = {
  schema: TableSchema;
};

// ----------------------------------------------------------------------

export default function SqlPlayground() {
  const { schema } = usePage().props as unknown as SqlPlaygroundProps;

  const [sql, setSql] = useState('SELECT * FROM porta_operateur');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('sql-playground-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [schemaDrawer, setSchemaDrawer] = useState(false);
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedResults, setCopiedResults] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sql-playground-history', JSON.stringify(history.slice(0, 50)));
    } catch {
      /* ignore */
    }
  }, [history]);

  const executeQuery = useCallback(async () => {
    if (!sql.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post('/api/sql-playground', { sql: sql.trim() });
      const data = response.data as QueryResult;

      setResult(data);
      setHistory((prev) => [
        { sql: sql.trim(), timestamp: Date.now(), success: data.success, rowCount: data.row_count ?? 0 },
        ...prev,
      ]);
    } catch (err: unknown) {
      const errorData = (err as { response?: { data?: QueryResult } })?.response?.data;
      setResult({
        success: false,
        error: errorData?.error ?? 'Erreur de connexion au serveur',
      });
      setHistory((prev) => [
        { sql: sql.trim(), timestamp: Date.now(), success: false, rowCount: 0 },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  }, [sql]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        executeQuery();
      }
    },
    [executeQuery]
  );

  const copySql = useCallback(() => {
    navigator.clipboard.writeText(sql).then(() => {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    });
  }, [sql]);

  const copyResultsAsCsv = useCallback(() => {
    if (!result?.columns || !result?.rows) return;
    const header = result.columns.join('\t');
    const rows = result.rows.map((row) =>
      result.columns!.map((col) => (row[col] === null ? '' : String(row[col]))).join('\t')
    );
    navigator.clipboard.writeText([header, ...rows].join('\n')).then(() => {
      setCopiedResults(true);
      setTimeout(() => setCopiedResults(false), 2000);
    });
  }, [result]);

  const tableNames = Object.keys(schema);

  return (
    <DashboardLayout>
      <Head title="SQL Playground" />

      <Box sx={{ p: { xs: 2, md: 5 } }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4">SQL Playground</Typography>
            <Typography sx={{ mt: 0.5, color: 'text.secondary' }}>
              Pratiquez SQL sur les tables PORTA simulees — choisissez votre niveau ou utilisez l&apos;editeur libre
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:database-bold-duotone" />}
            onClick={() => setSchemaDrawer(true)}
          >
            Schema
          </Button>
        </Box>

        {/* Level cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {LEVEL_KEYS.map((key) => {
            const lvl = SCENARIO_LEVELS[key];
            return (
              <Grid size={{ xs: 12, md: 4 }} key={key}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: (theme) => theme.shadows[12],
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardActionArea
                    component={Link}
                    href={`/sql-playground/${key}`}
                    sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: `${lvl.color}.lighter`,
                        color: `${lvl.color}.main`,
                        mb: 2,
                      }}
                    >
                      <Iconify icon={lvl.icon} width={32} />
                    </Box>

                    <Typography variant="h5" sx={{ mb: 0.5 }}>
                      {lvl.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      {lvl.subtitle}
                    </Typography>

                    <Chip
                      label={`${lvl.scenarios.length} scenarios`}
                      size="small"
                      color={lvl.color as 'success' | 'warning' | 'error'}
                      variant="outlined"
                      sx={{ mt: 'auto' }}
                    />
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Free SQL Editor */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Editeur libre
              </Typography>

              <TextField
                inputRef={textareaRef}
                multiline
                fullWidth
                minRows={5}
                maxRows={15}
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tapez votre requete SQL ici..."
                slotProps={{
                  input: {
                    sx: {
                      fontFamily: 'monospace',
                      fontSize: 14,
                    },
                  },
                }}
              />

              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={
                    loading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <Iconify icon="solar:play-bold" />
                    )
                  }
                  onClick={executeQuery}
                  disabled={loading || !sql.trim()}
                >
                  {loading ? 'Execution...' : 'Executer'}
                </Button>

                <Tooltip title="Copier la requete">
                  <IconButton onClick={copySql} disabled={!sql.trim()} size="small">
                    <Iconify
                      icon={copiedSql ? 'solar:check-circle-bold' : 'solar:copy-bold'}
                      sx={{ color: copiedSql ? 'success.main' : undefined }}
                    />
                  </IconButton>
                </Tooltip>

                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  Cmd+Entree pour executer
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* Results */}
          <Grid size={{ xs: 12 }}>
            {result && !result.success && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {result.error}
              </Alert>
            )}

            {result && result.success && (
              <Card>
                <Box
                  sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: 1, borderColor: 'divider' }}
                >
                  <Chip
                    icon={<Iconify icon="solar:check-circle-bold" />}
                    label={`${result.row_count} resultat${(result.row_count ?? 0) > 1 ? 's' : ''}`}
                    color="success"
                    size="small"
                  />
                  {result.truncated && (
                    <Chip
                      label="Resultats limites a 100 lignes"
                      color="warning"
                      size="small"
                      variant="outlined"
                    />
                  )}

                  <Box sx={{ flex: 1 }} />

                  <Tooltip title={copiedResults ? 'Copie !' : 'Copier les resultats'}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={
                        <Iconify icon={copiedResults ? 'solar:check-circle-bold' : 'solar:copy-bold'} />
                      }
                      onClick={copyResultsAsCsv}
                      color={copiedResults ? 'success' : 'inherit'}
                    >
                      {copiedResults ? 'Copie' : 'Copier'}
                    </Button>
                  </Tooltip>
                </Box>

                {result.columns && result.columns.length > 0 ? (
                  <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 500 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          {result.columns.map((col) => (
                            <TableCell key={col} sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                              {col}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result.rows?.map((row, idx) => (
                          <TableRow key={idx} hover>
                            {result.columns?.map((col) => (
                              <TableCell
                                key={col}
                                sx={{ fontFamily: 'monospace', fontSize: 13, whiteSpace: 'nowrap' }}
                              >
                                {row[col] === null ? (
                                  <Typography
                                    component="span"
                                    sx={{ color: 'text.disabled', fontStyle: 'italic' }}
                                  >
                                    NULL
                                  </Typography>
                                ) : (
                                  String(row[col])
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography sx={{ color: 'text.secondary' }}>Aucun resultat</Typography>
                  </Box>
                )}
              </Card>
            )}
          </Grid>

          {/* History */}
          {history.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Card sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Historique</Typography>
                  <Button size="small" color="error" onClick={() => setHistory([])}>
                    Effacer
                  </Button>
                </Box>

                {history.slice(0, 10).map((entry, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      borderRadius: 1,
                      bgcolor: 'background.neutral',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => setSql(entry.sql)}
                  >
                    <Iconify
                      icon={entry.success ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                      sx={{ color: entry.success ? 'success.main' : 'error.main', flexShrink: 0 }}
                      width={20}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: 12,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {entry.sql}
                    </Typography>
                    <Chip label={`${entry.rowCount} rows`} size="small" variant="outlined" sx={{ flexShrink: 0 }} />
                  </Box>
                ))}
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Schema Drawer */}
      <Drawer
        anchor="right"
        open={schemaDrawer}
        onClose={() => setSchemaDrawer(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">Schema des tables</Typography>
            <IconButton onClick={() => setSchemaDrawer(false)}>
              <Iconify icon="solar:close-circle-bold" />
            </IconButton>
          </Box>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Cliquez sur une table pour voir ses colonnes. Cliquez sur un nom de colonne pour l&apos;inserer dans
            l&apos;editeur.
          </Typography>

          <List disablePadding>
            {tableNames.map((tableName) => (
              <Box key={tableName}>
                <ListItemButton
                  onClick={() => setExpandedTable(expandedTable === tableName ? null : tableName)}
                  sx={{ borderRadius: 1 }}
                >
                  <Iconify
                    icon="solar:database-bold-duotone"
                    width={20}
                    sx={{ mr: 1.5, color: 'primary.main' }}
                  />
                  <ListItemText
                    primary={tableName}
                    secondary={`${schema[tableName].length} colonnes`}
                    primaryTypographyProps={{ variant: 'subtitle2', fontFamily: 'monospace', fontSize: 13 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Iconify
                    icon={
                      expandedTable === tableName ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'
                    }
                    width={20}
                  />
                </ListItemButton>

                <Collapse in={expandedTable === tableName}>
                  <Box sx={{ pl: 5, pr: 2, pb: 1 }}>
                    {schema[tableName].map((col) => (
                      <Tooltip key={col.column} title={`Inserer "${col.column}"`} placement="left">
                        <Box
                          sx={{
                            py: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover', borderRadius: 0.5 },
                            px: 1,
                          }}
                          onClick={() => {
                            setSql((prev) => prev + col.column);
                            textareaRef.current?.focus();
                          }}
                        >
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                            {col.column}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Chip
                              label={col.type}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: 10, height: 20 }}
                            />
                            {col.nullable && (
                              <Chip
                                label="null"
                                size="small"
                                sx={{ fontSize: 10, height: 20, bgcolor: 'warning.lighter' }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Tooltip>
                    ))}
                  </Box>
                </Collapse>
              </Box>
            ))}
          </List>
        </Box>
      </Drawer>
    </DashboardLayout>
  );
}
