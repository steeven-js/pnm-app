import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import type { DecisionTreeNode } from 'src/types';

import { SeverityBadge } from './severity-badge';

// ----------------------------------------------------------------------

const SEVERITY_COLORS: Record<string, string> = {
  info: '#3b82f6',
  warning: '#f59e0b',
  error: '#dc2626',
  critical: '#9333ea',
};

type Props = {
  rootNode: DecisionTreeNode;
};

export function DecisionTreePlayer({ rootNode }: Props) {
  const [history, setHistory] = useState<DecisionTreeNode[]>([]);
  const [currentNode, setCurrentNode] = useState<DecisionTreeNode>(rootNode);
  const [copied, setCopied] = useState(false);

  const navigate = (next: DecisionTreeNode) => {
    setHistory((prev) => [...prev, currentNode]);
    setCurrentNode(next);
  };

  const goBack = () => {
    const prev = [...history];
    const last = prev.pop();
    if (last) {
      setHistory(prev);
      setCurrentNode(last);
    }
  };

  const restart = () => {
    setHistory([]);
    setCurrentNode(rootNode);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Question node ──
  if (currentNode.type === 'question') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Chip label={`Étape ${history.length + 1}`} size="small" variant="outlined" />

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              {currentNode.text}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {currentNode.yes && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Iconify icon="solar:check-circle-bold" width={18} />}
                  onClick={() => navigate(currentNode.yes!)}
                  sx={{ flex: 1 }}
                >
                  Oui
                </Button>
              )}
              {currentNode.no && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Iconify icon="solar:close-circle-bold" width={18} />}
                  onClick={() => navigate(currentNode.no!)}
                  sx={{ flex: 1 }}
                >
                  Non
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* History */}
        {history.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Historique
            </Typography>
            {history.map((node, idx) => (
              <Box
                key={node.id}
                sx={{
                  pl: 2,
                  borderLeft: '2px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Étape {idx + 1}
                </Typography>
                <Typography variant="body2">{node.text}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Navigation */}
        {history.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="solar:arrow-left-linear" width={16} />}
              onClick={goBack}
            >
              Retour
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="warning"
              startIcon={<Iconify icon="solar:restart-bold" width={16} />}
              onClick={restart}
            >
              Recommencer
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  // ── Diagnosis node ──
  const borderColor = SEVERITY_COLORS[currentNode.severity ?? 'info'] ?? SEVERITY_COLORS.info;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Chip label="Diagnostic" size="small" color="success" />
        {currentNode.severity && <SeverityBadge severity={currentNode.severity} />}
      </Box>

      <Card variant="outlined" sx={{ borderLeft: 4, borderColor }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6">{currentNode.text}</Typography>

          {currentNode.diagnosis && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Analyse
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                {currentNode.diagnosis}
              </Typography>
            </Box>
          )}

          {currentNode.recommended_action && (
            <Card variant="outlined" sx={{ bgcolor: 'background.neutral' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Action recommandée
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                  {currentNode.recommended_action}
                </Typography>
              </CardContent>
            </Card>
          )}

          {currentNode.sql_query && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="subtitle2">Requête SQL</Typography>
                <IconButton size="small" onClick={() => copyToClipboard(currentNode.sql_query!)}>
                  <Iconify
                    icon={copied ? 'solar:check-circle-bold' : 'solar:copy-linear'}
                    width={16}
                    sx={{ color: copied ? 'success.main' : 'text.secondary' }}
                  />
                </IconButton>
              </Box>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: '#1e1e1e',
                  color: '#d4d4d4',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {currentNode.sql_query}
              </Box>
            </Box>
          )}

          {currentNode.related_codes && currentNode.related_codes.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Codes associés
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {currentNode.related_codes.map((rc) => (
                  <Chip
                    key={rc}
                    label={rc}
                    size="small"
                    variant="outlined"
                    component={RouterLink}
                    href={`/resolve/codes/${rc}`}
                    clickable
                    sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Historique
          </Typography>
          {history.map((node, idx) => (
            <Box
              key={node.id}
              sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}
            >
              <Typography variant="caption" color="text.secondary">
                Étape {idx + 1}
              </Typography>
              <Typography variant="body2">{node.text}</Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Navigation */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="solar:arrow-left-linear" width={16} />}
          onClick={goBack}
        >
          Retour
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="warning"
          startIcon={<Iconify icon="solar:restart-bold" width={16} />}
          onClick={restart}
        >
          Recommencer
        </Button>
      </Box>
    </Box>
  );
}
