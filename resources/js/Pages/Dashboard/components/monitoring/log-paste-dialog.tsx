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
    onApply: (checkedItems: string[], notes: string, parsedData?: unknown, metadata?: Record<string, unknown>) => void;
};

const DIALOG_CONFIG: Record<string, { title: string; description: string; placeholder: string }> = {
    vacation: {
        title: 'Auto-remplir depuis le rapport vacation',
        description: "Collez le contenu de l'email [PNM] vacation (rapport envoi/réception) pour remplir automatiquement la checklist.",
        placeholder: `Collez le contenu du mail ici...\n\nRapport envoi/réception des vacations du 16-02-2026\n\nNombre de fichiers transférés : 20 fichiers échangés / 20 attendus\n\nFichiers reçus d'Orange Caraïbe:\n/home/porta_pnmv3/.../PNMDATA.01.02...\n...`,
    },
    incidents: {
        title: 'Auto-remplir depuis le mail incidents',
        description: "Collez le contenu de l'email [PNM][INCIDENT] pour analyser les incidents détectés et remplir la checklist.",
        placeholder: `Collez le contenu du mail ici...\n\nCe mail a ete genere automatiquement par l'application DIGICEL.PORTA-V3.\n\n1 - Les incidents suivant ont ete detectes...\n  - 1 refu(s) (1210/1220) ;\n...`,
    },
    rio_reporting: {
        title: 'Auto-remplir depuis le reporting RIO',
        description: "Collez le contenu de l'email [PNM] Reporting RIO incorrect pour remplir automatiquement la checklist.",
        placeholder: `Collez le contenu du mail ici...\n\nStats du 11/02/2026 pour les demandes de portabilite refusees pour motif RIO incorrect :\n\nIl y a 0 cas de refus en porta entrante.\n\nIl y a 0 cas de refus en porta sortante.`,
    },
    pso_jour: {
        title: 'Auto-remplir depuis le PSO',
        description: "Collez le contenu de l'email [PNMV3] PSO du jour ou le contenu du fichier CSV joint pour remplir la checklist.",
        placeholder: `Collez le contenu du mail ou du CSV ici...\n\nBonjour,\nVeuillez trouver ci-joint le detail des PSO du jour.\n\n--- ou le CSV ---\n\nRECORD_NO;ACTION_COD;OPERATEUR;N_DE_MOBILE...\n72035481;RLPS;GPMAG;0690199788...`,
    },
    tickets_attente: {
        title: 'Auto-remplir depuis les mails tickets',
        description: "Collez le contenu de l'email [PNM] Ticket(s) 1210 en attente et/ou Ticket(s) en attente pour remplir la checklist.",
        placeholder: `Collez le contenu du/des mail(s) ici...\n\nIl y a 1 ticket(s) 1210 en attente.\nVeuillez trouver ci-joint les portages en attente de reponse.\n\n---\n\nIl y a 23 ticket(s) en attente.\nVeuillez trouver ci-joint les portages en attente de tickets.`,
    },
    verif_bascule_server: {
        title: 'Auto-remplir depuis les logs serveur',
        description: 'Collez le résultat des deux commandes : tail -n 12 /home/porta_pnmv3/PortaSync/log/EmaExtracter.log puis tail -n 12 /home/porta_pnmv3/PortaSync/log/EmmExtracter.log (les deux l\'un après l\'autre).',
        placeholder: `--- tail -n 12 EmaExtracter.log ---\nEmaExtracter.php|2026-02-26T09:00:01-04:00| Initialisation\nEmaExtracter.php|..| ..Verification operateur Orange Caraibe : Check success\nEmaExtracter.php|..| ..Verification operateur Digicel AFG : Check success\n...\nEmaExtracter.php|..| ..........194 bascules ajoutés.\nEmaExtracter.php|..| Fin de Traitement 63.46secondes.\n\n--- tail -n 12 EmmExtracter.log ---\nEmmExtracter.php|2026-02-26T09:01:01-04:00| Initialisation\nEmmExtracter.php|..| ..Verification operateur Orange Caraibe : Check success\n...\nEmmExtracter.php|..| ..........353361 bascules ajoutés.\nEmmExtracter.php|..| Fin de Traitement 13.54secondes.`,
    },
    verif_bascule_email: {
        title: 'Auto-remplir depuis les emails bascule',
        description: 'Collez le contenu de l\'email [PNMV3] Verification Bascule Porta MOBI : FIN et/ou [PNM] Controle fichier batchhandler FNR_V3 sur EMA.',
        placeholder: `Collez le contenu du/des mail(s) ici...`,
    },
    verif_generation_pnmdata: {
        title: 'Auto-remplir depuis PnmDataManager.log',
        description: 'Collez le contenu de PnmDataManager.log (tail -n 14 /home/porta_pnmv3/PortaSync/log/PnmDataManager.log) pour vérifier la génération des fichiers PNMDATA de vacation.',
        placeholder: `Collez le résultat de tail ici...\n\nPnmDataManager.php|...| Traitement operateur 01\nPnmDataManager.php|...| ..........Generation du fichier PNMDATA.02.01... (#tickets: 360)\n...\nPnmDataManager.php|...| Fin de Traitement`,
    },
    porta_prevues: {
        title: 'Auto-remplir depuis le mail Portabilités prévues',
        description: 'Collez le contenu du mail [PNM] Reporting - Portabilités DIGICEL/WIZZEE prévues pour extraire les volumes IN/OUT et les stocker pour comparaison avec le PSO du lendemain.',
        placeholder: `Collez le contenu du mail ici...\n\nNombre de portabilités internes de la veille: 4\n\nNombre de portabilités prévues le 23/03/2026:\n\nDIGICEL\nIN: 13\nOUT: 36\n\nWIZZEE\nIN: 4\nOUT: 16`,
    },
    verif_acquittements: {
        title: 'Auto-remplir depuis PnmAckManager.log',
        description: 'Collez le contenu de PnmAckManager.log (tail -n 50 /home/porta_pnmv3/PortaSync/log/PnmAckManager.log) pour vérifier les acquittements des fichiers PNMDATA.',
        placeholder: `Collez le résultat de tail -n 50 ici...\n\nPnmDataAckManager.php|...| Initialisation\nPnmDataAckManager.php|...| ..Verification operateur Orange Caraibe : Check success\nPnmDataAckManager.php|...| ..Verification operateur Digicel AFG : Check success\nPnmDataAckManager.php|...| ..Verification operateur Outremer Telecom / SFR : Check success\nPnmDataAckManager.php|...| ..Verification operateur Dauphin Telecom : Check success\nPnmDataAckManager.php|...| ..Verification operateur UTS Caraibe : Check success\nPnmDataAckManager.php|...| ..Verification operateur Free Caraibes : Check success\nPnmDataAckManager.php|...| Fin Initialisation\nPnmDataAckManager.php|...| .........Accusé reçu PNMDATA.02.01...ACR => E000:\nPnmDataAckManager.php|...| Fin de Traitement 9.44secondes.`,
    },
};

function getConfig(eventKey: string) {
    if (eventKey.startsWith('vacation_')) return DIALOG_CONFIG.vacation;
    return DIALOG_CONFIG[eventKey] ?? DIALOG_CONFIG.vacation;
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
            onApply(preview.checkedItems, preview.notes, preview.parsedData, preview.metadata);
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
                    autoComplete="off"
                    inputProps={{ autoComplete: 'off', 'data-form-type': 'other' }}
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
