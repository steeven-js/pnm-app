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
import Breadcrumbs from '@mui/material/Breadcrumbs';
import CardActionArea from '@mui/material/CardActionArea';
import Stack from '@mui/material/Stack';

import { Iconify } from 'src/components/iconify';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

import { SCENARIO_LEVELS, LEVEL_KEYS } from 'src/config/sql-scenarios';

import type { ScenarioLevel, SqlScenario, LevelKey } from 'src/config/sql-scenarios';

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

type SqlScenariosProps = {
  schema: TableSchema;
  level: LevelKey;
};

// ----------------------------------------------------------------------

export default function SqlScenarios() {
  const { schema, level } = usePage().props as unknown as SqlScenariosProps;
  const levelConfig = SCENARIO_LEVELS[level];

  const [selectedScenario, setSelectedScenario] = useState<SqlScenario | null>(null);
  const [sql, setSql] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [schemaDrawer, setSchemaDrawer] = useState(false);
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedResults, setCopiedResults] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Navigation between levels
  const currentIdx = LEVEL_KEYS.indexOf(level);
  const prevLevel = currentIdx > 0 ? LEVEL_KEYS[currentIdx - 1] : null;
  const nextLevel = currentIdx < LEVEL_KEYS.length - 1 ? LEVEL_KEYS[currentIdx + 1] : null;

  const selectScenario = useCallback((scenario: SqlScenario) => {
    setSelectedScenario(scenario);
    setSql(scenario.sql);
    setResult(null);
    // Scroll to editor
    setTimeout(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const executeQuery = useCallback(async () => {
    if (!sql.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post('/api/sql-playground', { sql: sql.trim() });
      setResult(response.data as QueryResult);
    } catch (err: unknown) {
      const errorData = (err as { response?: { data?: QueryResult } })?.response?.data;
      setResult({
        success: false,
        error: errorData?.error ?? 'Erreur de connexion au serveur',
      });
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

  if (!levelConfig) {
    return (
      <DashboardLayout>
        <Head title="SQL Playground" />
        <Box sx={{ p: 5 }}>
          <Alert severity="error">Niveau introuvable</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head title={`SQL — ${levelConfig.title}`} />

      <Box sx={{ p: { xs: 2, md: 5 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/sql-playground" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
              SQL Playground
            </Typography>
          </Link>
          <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
            {levelConfig.title}
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${levelConfig.color}.lighter`,
                color: `${levelConfig.color}.main`,
              }}
            >
              <Iconify icon={levelConfig.icon} width={28} />
            </Box>
            <Box>
              <Typography variant="h4">{levelConfig.title}</Typography>
              <Typography sx={{ color: 'text.secondary' }}>{levelConfig.subtitle}</Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:database-bold-duotone" />}
            onClick={() => setSchemaDrawer(true)}
          >
            Schema
          </Button>
        </Box>

        {/* Scenario cards */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          {levelConfig.scenarios.length} scenarios
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {levelConfig.scenarios.map((scenario) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={scenario.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.2s',
                  border: 2,
                  borderColor:
                    selectedScenario?.id === scenario.id ? `${levelConfig.color}.main` : 'transparent',
                  '&:hover': {
                    boxShadow: (theme) => theme.shadows[8],
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardActionArea
                  onClick={() => selectScenario(scenario)}
                  sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, width: '100%' }}>
                    <Typography variant="subtitle2" sx={{ flex: 1 }}>
                      {scenario.label}
                    </Typography>
                    {selectedScenario?.id === scenario.id && (
                      <Iconify icon="solar:check-circle-bold" sx={{ color: `${levelConfig.color}.main` }} width={20} />
                    )}
                  </Box>

                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, flex: 1 }}>
                    {scenario.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {scenario.concepts.map((concept) => (
                      <Chip
                        key={concept}
                        label={concept}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: 11,
                          height: 22,
                          fontFamily: 'monospace',
                          borderColor: `${levelConfig.color}.main`,
                          color: `${levelConfig.color}.dark`,
                        }}
                      />
                    ))}
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* SQL Editor — appears when a scenario is selected */}
        {selectedScenario && (
          <Box ref={editorRef}>
            <Card sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Iconify icon={levelConfig.icon} sx={{ color: `${levelConfig.color}.main` }} width={20} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {selectedScenario.label}
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }} icon={<Iconify icon="solar:info-circle-bold" width={20} />}>
                {selectedScenario.description}
              </Alert>

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

            {/* Results */}
            {result && !result.success && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {result.error}
              </Alert>
            )}

            {result && result.success && (
              <Card sx={{ mb: 3 }}>
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
                    <Chip label="Resultats limites a 100 lignes" color="warning" size="small" variant="outlined" />
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
          </Box>
        )}

        {/* Level navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          {prevLevel ? (
            <Button
              component={Link}
              href={`/sql-playground/${prevLevel}`}
              startIcon={<Iconify icon="solar:arrow-left-bold" />}
              variant="outlined"
            >
              {SCENARIO_LEVELS[prevLevel].title}
            </Button>
          ) : (
            <Box />
          )}
          {nextLevel ? (
            <Button
              component={Link}
              href={`/sql-playground/${nextLevel}`}
              endIcon={<Iconify icon="solar:arrow-right-bold" />}
              variant="contained"
              color={SCENARIO_LEVELS[nextLevel].color as 'success' | 'warning' | 'error'}
            >
              {SCENARIO_LEVELS[nextLevel].title}
            </Button>
          ) : (
            <Box />
          )}
        </Box>
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
            Cliquez sur une table pour voir ses colonnes.
          </Typography>

          <List disablePadding>
            {tableNames.map((tableName) => (
              <Box key={tableName}>
                <ListItemButton
                  onClick={() => setExpandedTable(expandedTable === tableName ? null : tableName)}
                  sx={{ borderRadius: 1 }}
                >
                  <Iconify icon="solar:database-bold-duotone" width={20} sx={{ mr: 1.5, color: 'primary.main' }} />
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
