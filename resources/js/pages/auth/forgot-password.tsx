import { Form, Head } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Forgot password"
            description="Enter your email to receive a password reset link"
        >
            <Head title="Forgot password" />

            {status && (
                <Typography variant="body2" fontWeight={500} sx={{ color: 'success.main', textAlign: 'center', mb: 2 }}>
                    {status}
                </Typography>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <TextField
                                id="email"
                                label="Email address"
                                type="email"
                                name="email"
                                autoComplete="off"
                                autoFocus
                                placeholder="email@example.com"
                                error={!!errors.email}
                                helperText={errors.email}
                                fullWidth
                            />

                            <Box sx={{ my: 3 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && <CircularProgress size={16} sx={{ mr: 1 }} color="inherit" />}
                                    Email password reset link
                                </Button>
                            </Box>
                        </>
                    )}
                </Form>

                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Or, return to{' '}
                    <TextLink href={login()}>log in</TextLink>
                </Typography>
            </Box>
        </AuthLayout>
    );
}
