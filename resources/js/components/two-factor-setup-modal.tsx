import { Form } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Check, Copy, ScanLine } from 'lucide-react';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { useAppearance } from '@/hooks/use-appearance';
import { useClipboard } from '@/hooks/use-clipboard';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { confirm } from '@/routes/two-factor';
import AlertError from './alert-error';

function GridScanIcon() {
    return (
        <Box
            sx={{
                mb: 1.5,
                display: 'inline-flex',
                borderRadius: '50%',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                p: 0.25,
                boxShadow: 1,
            }}
        >
            <Box
                sx={{
                    borderRadius: '50%',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'action.hover',
                    p: 1.25,
                    display: 'flex',
                }}
            >
                <ScanLine size={24} />
            </Box>
        </Box>
    );
}

function TwoFactorSetupStep({
    qrCodeSvg,
    manualSetupKey,
    buttonText,
    onNextStep,
    errors,
}: {
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    buttonText: string;
    onNextStep: () => void;
    errors: string[];
}) {
    const { resolvedAppearance } = useAppearance();
    const [copiedText, copy] = useClipboard();
    const IconComponent = copiedText === manualSetupKey ? Check : Copy;

    return (
        <>
            {errors?.length ? (
                <AlertError errors={errors} />
            ) : (
                <>
                    <Box sx={{ mx: 'auto', maxWidth: 'md', overflow: 'hidden' }}>
                        <Box
                            sx={{
                                mx: 'auto',
                                aspectRatio: '1',
                                width: 256,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 2.5,
                            }}
                        >
                            {qrCodeSvg ? (
                                <Box
                                    sx={{
                                        aspectRatio: '1',
                                        width: '100%',
                                        borderRadius: 2,
                                        bgcolor: 'white',
                                        p: 1,
                                        '& svg': { width: '100%', height: '100%' },
                                    }}
                                    dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                                    style={{
                                        filter: resolvedAppearance === 'dark' ? 'invert(1) brightness(1.5)' : undefined,
                                    }}
                                />
                            ) : (
                                <CircularProgress size={24} />
                            )}
                        </Box>
                    </Box>

                    <Button variant="contained" fullWidth onClick={onNextStep}>
                        {buttonText}
                    </Button>

                    <Divider>or, enter the code manually</Divider>

                    <Box sx={{ display: 'flex', border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
                        {!manualSetupKey ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', bgcolor: 'action.hover', p: 1.5 }}>
                                <CircularProgress size={20} />
                            </Box>
                        ) : (
                            <>
                                <TextField
                                    value={manualSetupKey}
                                    slotProps={{ input: { readOnly: true } }}
                                    variant="standard"
                                    fullWidth
                                    sx={{
                                        '& .MuiInput-root': { p: 1.5 },
                                        '& .MuiInput-root::before, & .MuiInput-root::after': { display: 'none' },
                                    }}
                                />
                                <IconButton
                                    onClick={() => copy(manualSetupKey)}
                                    sx={{ borderLeft: '1px solid', borderColor: 'divider', borderRadius: 0 }}
                                >
                                    <IconComponent size={16} />
                                </IconButton>
                            </>
                        )}
                    </Box>
                </>
            )}
        </>
    );
}

function TwoFactorVerificationStep({
    onClose,
    onBack,
}: {
    onClose: () => void;
    onBack: () => void;
}) {
    const [code, setCode] = useState<string>('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTimeout(() => {
            containerRef.current?.querySelector('input')?.focus();
        }, 0);
    }, []);

    return (
        <Form
            {...confirm.form()}
            onSuccess={() => onClose()}
            resetOnError
            resetOnSuccess
        >
            {({
                processing,
                errors,
            }: {
                processing: boolean;
                errors?: { confirmTwoFactorAuthentication?: { code?: string } };
            }) => (
                <Box ref={containerRef} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 1 }}>
                        <input type="hidden" name="code" value={code} />
                        <MuiOtpInput
                            value={code}
                            onChange={setCode}
                            length={OTP_MAX_LENGTH}
                            autoFocus
                            TextFieldsProps={{ size: 'small', disabled: processing }}
                        />
                        <InputError message={errors?.confirmTwoFactorAuthentication?.code} />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2.5 }}>
                        <Button variant="outlined" fullWidth onClick={onBack} disabled={processing}>
                            Back
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={processing || code.length < OTP_MAX_LENGTH}
                        >
                            Confirm
                        </Button>
                    </Box>
                </Box>
            )}
        </Form>
    );
}

type Props = {
    isOpen: boolean;
    onClose: () => void;
    requiresConfirmation: boolean;
    twoFactorEnabled: boolean;
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    clearSetupData: () => void;
    fetchSetupData: () => Promise<void>;
    errors: string[];
};

export default function TwoFactorSetupModal({
    isOpen,
    onClose,
    requiresConfirmation,
    twoFactorEnabled,
    qrCodeSvg,
    manualSetupKey,
    clearSetupData,
    fetchSetupData,
    errors,
}: Props) {
    const [showVerificationStep, setShowVerificationStep] = useState<boolean>(false);

    const modalConfig = useMemo<{
        title: string;
        description: string;
        buttonText: string;
    }>(() => {
        if (twoFactorEnabled) {
            return {
                title: 'Two-Factor Authentication Enabled',
                description:
                    'Two-factor authentication is now enabled. Scan the QR code or enter the setup key in your authenticator app.',
                buttonText: 'Close',
            };
        }

        if (showVerificationStep) {
            return {
                title: 'Verify Authentication Code',
                description: 'Enter the 6-digit code from your authenticator app',
                buttonText: 'Continue',
            };
        }

        return {
            title: 'Enable Two-Factor Authentication',
            description:
                'To finish enabling two-factor authentication, scan the QR code or enter the setup key in your authenticator app',
            buttonText: 'Continue',
        };
    }, [twoFactorEnabled, showVerificationStep]);

    const handleModalNextStep = useCallback(() => {
        if (requiresConfirmation) {
            setShowVerificationStep(true);
            return;
        }
        clearSetupData();
        onClose();
    }, [requiresConfirmation, clearSetupData, onClose]);

    const resetModalState = useCallback(() => {
        setShowVerificationStep(false);
        if (twoFactorEnabled) {
            clearSetupData();
        }
    }, [twoFactorEnabled, clearSetupData]);

    useEffect(() => {
        if (isOpen && !qrCodeSvg) {
            fetchSetupData();
        }
    }, [isOpen, qrCodeSvg, fetchSetupData]);

    const handleClose = useCallback(() => {
        resetModalState();
        onClose();
    }, [onClose, resetModalState]);

    return (
        <Dialog open={isOpen} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <GridScanIcon />
                    <Typography variant="h6" fontWeight={600}>
                        {modalConfig.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {modalConfig.description}
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
                    {showVerificationStep ? (
                        <TwoFactorVerificationStep
                            onClose={onClose}
                            onBack={() => setShowVerificationStep(false)}
                        />
                    ) : (
                        <TwoFactorSetupStep
                            qrCodeSvg={qrCodeSvg}
                            manualSetupKey={manualSetupKey}
                            buttonText={modalConfig.buttonText}
                            onNextStep={handleModalNextStep}
                            errors={errors}
                        />
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
}
