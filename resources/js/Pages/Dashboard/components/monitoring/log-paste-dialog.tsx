import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import { Iconify } from 'src/components/iconify';
import { parseMgrntlog, autoFillFromLog, type AutoFillResult } from 'src/utils/parse-mgrntlog';

type LogPasteDialogProps = {
    open: boolean;
    onClose: () => void;
    eventKey: string;
    checklist: string[];
    onApply: (checkedItems: string[], notes: string) => void;
};

export function LogPasteDialog({ open, onClose, eventKey, checklist, onApply }: LogPasteDialogProps) {
    const [logContent, setLogContent] = useState('');
    const [preview, setPreview] = useState<AutoFillResult | null>(null);
    const [error, setError] = useState('');

    const handleParse = () => {
        setError('');
        setPreview(null);

        const entries = parseMgrntlog(logContent);
        if (entries.length === 0) {
            setError('Aucun bloc automate trouvé dans le contenu collé.');
            return;
        }

        const result = autoFillFromLog(eventKey, checklist, entries);
        if (!result) {
            setError("Cet événement ne supporte pas l'auto-remplissage.");
            return;
        }

        setPreview(result);
    };

    const handleApply = () => {
        if (preview) {
            onApply(preview.checkedItems, preview.notes);
            handleClose();
        }
    };

    const handleClose = () => {
        setLogContent('');
        setPreview(null);
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:clipboard-text-bold-duotone" width={24} />
                Auto-remplir depuis le log
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Collez le contenu du fichier <strong>mgrntlog_global_*.log</strong> pour remplir
                    automatiquement la checklist et les notes.
                </Typography>

                <TextField
                    multiline
                    minRows={6}
                    maxRows={12}
                    fullWidth
                    size="small"
                    placeholder={`Collez le contenu du fichier .log ici...\n\n---------------------------------------------\nDossier        : BASCULE_IN\nDate Bascule   : 24/02/2026 MODE : NORMAL\n...`}
                    value={logContent}
                    onChange={(e) => {
                        setLogContent(e.target.value);
                        setPreview(null);
                        setError('');
                    }}
                    sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                />

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}

                {preview && (
                    <Box sx={{ mt: 2 }}>
                        <Alert severity="success" icon={false}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Iconify icon="solar:check-circle-bold" width={20} color="success.main" />
                                <Typography variant="subtitle2">
                                    {preview.checkedItems.length}/{checklist.length} items cochés
                                </Typography>
                            </Box>
                            {checklist.map((item) => (
                                <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1, mb: 0.25 }}>
                                    {preview.checkedItems.includes(item) ? (
                                        <Iconify icon="solar:check-circle-bold" width={16} color="success.main" />
                                    ) : (
                                        <Iconify icon="solar:close-circle-bold" width={16} color="text.disabled" />
                                    )}
                                    <Typography
                                        variant="caption"
                                        color={preview.checkedItems.includes(item) ? 'text.primary' : 'text.disabled'}
                                    >
                                        {item}
                                    </Typography>
                                </Box>
                            ))}
                            <Typography
                                variant="body2"
                                component="pre"
                                sx={{ mt: 1.5, p: 1, bgcolor: 'action.hover', borderRadius: 1, whiteSpace: 'pre-wrap', fontSize: '0.75rem', fontFamily: 'monospace' }}
                            >
                                {preview.notes}
                            </Typography>
                        </Alert>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Annuler</Button>
                {!preview ? (
                    <Button variant="contained" onClick={handleParse} disabled={!logContent.trim()}
                        startIcon={<Iconify icon="solar:magnifer-bold-duotone" width={18} />}>
                        Analyser
                    </Button>
                ) : (
                    <Button variant="contained" color="success" onClick={handleApply}
                        startIcon={<Iconify icon="solar:check-circle-bold" width={18} />}>
                        Appliquer
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
