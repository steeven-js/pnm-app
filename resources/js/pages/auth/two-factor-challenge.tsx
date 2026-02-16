import { Form, Head } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/two-factor/login';

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: 'Recovery Code',
                description:
                    'Please confirm access to your account by entering one of your emergency recovery codes.',
                toggleText: 'login using an authentication code',
            };
        }

        return {
            title: 'Authentication Code',
            description:
                'Enter the authentication code provided by your authenticator application.',
            toggleText: 'login using a recovery code',
        };
    }, [showRecoveryInput]);

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    return (
        <AuthLayout
            title={authConfigContent.title}
            description={authConfigContent.description}
        >
            <Head title="Two-Factor Authentication" />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Form
                    {...store.form()}
                    resetOnError
                    resetOnSuccess={!showRecoveryInput}
                >
                    {({ errors, processing, clearErrors }) => (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {showRecoveryInput ? (
                                <>
                                    <TextField
                                        name="recovery_code"
                                        type="text"
                                        placeholder="Enter recovery code"
                                        autoFocus={showRecoveryInput}
                                        required
                                        fullWidth
                                    />
                                    <InputError message={errors.recovery_code} />
                                </>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, textAlign: 'center' }}>
                                    <input type="hidden" name="code" value={code} />
                                    <MuiOtpInput
                                        value={code}
                                        onChange={setCode}
                                        length={OTP_MAX_LENGTH}
                                        autoFocus
                                        TextFieldsProps={{ size: 'small', disabled: processing }}
                                    />
                                    <InputError message={errors.code} />
                                </Box>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={processing}
                            >
                                Continue
                            </Button>

                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                or you can{' '}
                                <Box
                                    component="button"
                                    type="button"
                                    onClick={() => toggleRecoveryMode(clearErrors)}
                                    sx={{
                                        cursor: 'pointer',
                                        color: 'text.primary',
                                        textDecoration: 'underline',
                                        textUnderlineOffset: 4,
                                        border: 'none',
                                        bgcolor: 'transparent',
                                        p: 0,
                                        font: 'inherit',
                                    }}
                                >
                                    {authConfigContent.toggleText}
                                </Box>
                            </Typography>
                        </Box>
                    )}
                </Form>
            </Box>
        </AuthLayout>
    );
}
