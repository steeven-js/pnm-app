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
import { autoFillFromPaste, type AutoFillResult } from 'src/utils/parse-mgrntlog';

type LogPasteDialogProps = {
    open: boolean;
    onClose: () => void;
    eventKey: string;
    checklist: string[];
    onApply: (checkedItems: string[], notes: string) => void;
};

const DIALOG_CONFIG: Record<string, { title: string; description: string; placeholder: string }> = {
    automates_report: {
        title: 'Auto-remplir depuis le log',
        description: 'Collez le contenu du fichier mgrntlog_global_*.log pour remplir automatiquement la checklist.',
        placeholder: `Collez le contenu du fichier .log ici...\n\n---------------------------------------------\nDossier        : BASCULE_IN\nDate Bascule   : 24/02/2026 MODE : NORMAL\n...`,
    },
    vacation: {
        title: 'Auto-remplir depuis le rapport vacation',
        description: "Collez le contenu de l'email [PNM] vacation (rapport envoi/réception) pour remplir automatiquement la checklist.",
        placeholder: `Collez le contenu du mail ici...\n\nRapport envoi/réception des vacations du 16-02-2026\n\nNombre de fichiers transférés : 20 fichiers échangés / 20 attendus\n\nFichiers reçus d'Orange Caraïbe:\n/home/porta_pnmv3/.../PNMDATA.01.02...\n...`,
    },
};

function getConfig(eventKey: string) {
    if (eventKey.startsWith('vacation_')) return DIALOG_CONFIG.vacation;
    return DIALOG_CONFIG[eventKey] ?? DIALOG_CONFIG.automates_report;
}

export function LogPasteDialog({ open, onClose, eventKey, checklist, onApply }: LogPasteDialogProps) {
    const [pastedContent, setPastedContent] = useState('');
    const [preview, setPreview] = useState<AutoFillResult | null>(null);
    const [error, setError] = useState('');

    const config = getConfig(eventKey);

    const handleParse = () => {
        setError('');
        setPreview(null);

        const result = autoFillFromPaste(eventKey, checklist, pastedContent);
        if (!result) {
            setError('Impossible de parser le contenu collé. Vérifiez le format.');
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
        setPastedContent('');
        setPreview(null);
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:clipboard-text-bold-duotone" width={24} />
                {config.title}
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {config.description}
                </Typography>

                <TextField
                    multiline
                    minRows={6}
                    maxRows={12}
                    fullWidth
                    size="small"
                    placeholder={config.placeholder}
                    value={pastedContent}
                    onChange={(e) => {
                        setPastedContent(e.target.value);
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
                    <Button variant="contained" onClick={handleParse} disabled={!pastedContent.trim()}
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
