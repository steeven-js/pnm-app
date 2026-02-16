import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { ArrowLeft, Check, Copy, RotateCcw, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { SeverityBadge } from '@/components/severity-badge';
import type { DecisionTreeNode } from '@/types';

type Props = {
    rootNode: DecisionTreeNode;
};

export function DecisionTreePlayer({ rootNode }: Props) {
    const [history, setHistory] = useState<DecisionTreeNode[]>([]);
    const [currentNode, setCurrentNode] = useState<DecisionTreeNode>(rootNode);
    const [copied, setCopied] = useState(false);

    const navigate = useCallback((node: DecisionTreeNode) => {
        setHistory((prev) => [...prev, currentNode]);
        setCurrentNode(node);
    }, [currentNode]);

    const goBack = useCallback(() => {
        const prev = history[history.length - 1];
        if (prev) {
            setHistory((h) => h.slice(0, -1));
            setCurrentNode(prev);
        }
    }, [history]);

    const restart = useCallback(() => {
        setHistory([]);
        setCurrentNode(rootNode);
    }, [rootNode]);

    const copyToClipboard = useCallback((text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, []);

    const stepNumber = history.length + 1;

    if (currentNode.type === 'diagnosis') {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Card sx={{ borderLeft: 4, borderColor: currentNode.severity === 'critical' ? 'error.main' : currentNode.severity === 'error' ? 'error.light' : currentNode.severity === 'warning' ? 'warning.main' : 'info.main' }}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label={`Diagnostic`} size="small" color="success" />
                            {currentNode.severity && <SeverityBadge severity={currentNode.severity} />}
                        </Box>

                        <Typography variant="h6" fontWeight={700}>
                            {currentNode.text}
                        </Typography>

                        {currentNode.diagnosis && (
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Analyse
                                </Typography>
                                <Typography variant="body2">
                                    {currentNode.diagnosis}
                                </Typography>
                            </Box>
                        )}

                        {currentNode.recommended_action && (
                            <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 1.5 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Action recommandée
                                </Typography>
                                <Typography variant="body2">
                                    {currentNode.recommended_action}
                                </Typography>
                            </Box>
                        )}

                        {currentNode.sql_query && (
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Requête SQL
                                    </Typography>
                                    <IconButton size="small" onClick={() => copyToClipboard(currentNode.sql_query!)}>
                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                    </IconButton>
                                </Box>
                                <Box
                                    sx={{
                                        bgcolor: '#1e1e1e',
                                        color: '#d4d4d4',
                                        p: 1.5,
                                        borderRadius: 1,
                                        fontFamily: 'monospace',
                                        fontSize: '0.75rem',
                                        lineHeight: 1.6,
                                        overflowX: 'auto',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-all',
                                    }}
                                >
                                    {currentNode.sql_query}
                                </Box>
                            </Box>
                        )}

                        {currentNode.related_codes && currentNode.related_codes.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Codes associés
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {currentNode.related_codes.map((code) => (
                                        <Chip
                                            key={code}
                                            label={code}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                                            component="a"
                                            href={`/resolve/codes/${code}`}
                                            clickable
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </CardContent>
                </Card>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    {history.length > 0 && (
                        <Button variant="outlined" size="small" startIcon={<ArrowLeft size={16} />} onClick={goBack}>
                            Retour
                        </Button>
                    )}
                    <Button variant="outlined" size="small" startIcon={<RotateCcw size={16} />} onClick={restart}>
                        Recommencer
                    </Button>
                </Box>
            </Box>
        );
    }

    // Question node
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Chip label={`Étape ${stepNumber}`} size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }} />

                    <Typography variant="h6" fontWeight={600}>
                        {currentNode.text}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        {currentNode.yes && (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<Check size={16} />}
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
                                startIcon={<X size={16} />}
                                onClick={() => navigate(currentNode.no!)}
                                sx={{ flex: 1 }}
                            >
                                Non
                            </Button>
                        )}
                    </Box>
                </CardContent>
            </Card>

            {history.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" size="small" startIcon={<ArrowLeft size={16} />} onClick={goBack}>
                        Retour
                    </Button>
                    <Button variant="outlined" size="small" startIcon={<RotateCcw size={16} />} onClick={restart}>
                        Recommencer
                    </Button>
                </Box>
            )}

            {history.length > 0 && (
                <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        Historique ({history.length} étape{history.length > 1 ? 's' : ''})
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                        {history.map((node, i) => (
                            <Typography key={node.id} variant="caption" color="text.secondary" sx={{ pl: 1, borderLeft: 2, borderColor: 'divider' }}>
                                {i + 1}. {node.text}
                            </Typography>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
}
