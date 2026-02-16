import { Form } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { Eye, EyeOff, LockKeyhole, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { regenerateRecoveryCodes } from '@/routes/two-factor';
import AlertError from './alert-error';

type Props = {
    recoveryCodesList: string[];
    fetchRecoveryCodes: () => Promise<void>;
    errors: string[];
};

export default function TwoFactorRecoveryCodes({
    recoveryCodesList,
    fetchRecoveryCodes,
    errors,
}: Props) {
    const [codesAreVisible, setCodesAreVisible] = useState<boolean>(false);
    const codesSectionRef = useRef<HTMLDivElement | null>(null);
    const canRegenerateCodes = recoveryCodesList.length > 0 && codesAreVisible;

    const toggleCodesVisibility = useCallback(async () => {
        if (!codesAreVisible && !recoveryCodesList.length) {
            await fetchRecoveryCodes();
        }

        setCodesAreVisible(!codesAreVisible);

        if (!codesAreVisible) {
            setTimeout(() => {
                codesSectionRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            });
        }
    }, [codesAreVisible, recoveryCodesList.length, fetchRecoveryCodes]);

    useEffect(() => {
        if (!recoveryCodesList.length) {
            fetchRecoveryCodes();
        }
    }, [recoveryCodesList.length, fetchRecoveryCodes]);

    const RecoveryCodeIconComponent = codesAreVisible ? EyeOff : Eye;

    return (
        <Card variant="outlined" sx={{ width: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <LockKeyhole size={16} />
                    <Typography variant="subtitle2">2FA Recovery Codes</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Recovery codes let you regain access if you lose your 2FA
                    device. Store them in a secure password manager.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 1.5, userSelect: 'none' }}>
                    <Button
                        variant="contained"
                        onClick={toggleCodesVisibility}
                        startIcon={<RecoveryCodeIconComponent size={16} />}
                        aria-expanded={codesAreVisible}
                        aria-controls="recovery-codes-section"
                    >
                        {codesAreVisible ? 'Hide' : 'View'} Recovery Codes
                    </Button>

                    {canRegenerateCodes && (
                        <Form
                            {...regenerateRecoveryCodes.form()}
                            options={{ preserveScroll: true }}
                            onSuccess={fetchRecoveryCodes}
                        >
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    startIcon={<RefreshCw size={16} />}
                                    aria-describedby="regenerate-warning"
                                >
                                    Regenerate Codes
                                </Button>
                            )}
                        </Form>
                    )}
                </Box>

                <Box
                    id="recovery-codes-section"
                    sx={{
                        overflow: 'hidden',
                        transition: 'all 0.3s',
                        height: codesAreVisible ? 'auto' : 0,
                        opacity: codesAreVisible ? 1 : 0,
                    }}
                    aria-hidden={!codesAreVisible}
                >
                    <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {errors?.length ? (
                            <AlertError errors={errors} />
                        ) : (
                            <>
                                <Box
                                    ref={codesSectionRef}
                                    sx={{
                                        display: 'grid',
                                        gap: 0.5,
                                        borderRadius: 2,
                                        bgcolor: 'action.hover',
                                        p: 2,
                                        fontFamily: 'monospace',
                                        fontSize: '0.875rem',
                                    }}
                                    role="list"
                                    aria-label="Recovery codes"
                                >
                                    {recoveryCodesList.length ? (
                                        recoveryCodesList.map((code, index) => (
                                            <Box key={index} role="listitem" sx={{ userSelect: 'text' }}>
                                                {code}
                                            </Box>
                                        ))
                                    ) : (
                                        <Box aria-label="Loading recovery codes">
                                            {Array.from({ length: 8 }, (_, index) => (
                                                <Skeleton key={index} height={16} sx={{ my: 0.5 }} />
                                            ))}
                                        </Box>
                                    )}
                                </Box>

                                <Typography variant="caption" color="text.secondary" sx={{ userSelect: 'none' }}>
                                    <span id="regenerate-warning">
                                        Each recovery code can be used once to
                                        access your account and will be removed
                                        after use. If you need more, click{' '}
                                        <strong>Regenerate Codes</strong> above.
                                    </span>
                                </Typography>
                            </>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
