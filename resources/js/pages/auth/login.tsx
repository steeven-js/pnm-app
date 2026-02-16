import { Form, Head } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                id="email"
                                label="Email address"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                placeholder="email@example.com"
                                error={!!errors.email}
                                helperText={errors.email}
                                fullWidth
                            />

                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2" fontWeight={500}>
                                        Password
                                    </Typography>
                                    {canResetPassword && (
                                        <TextLink href={request()} tabIndex={5}>
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </Box>
                                <TextField
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    error={!!errors.password}
                                    helperText={errors.password}
                                    fullWidth
                                />
                            </Box>

                            <FormControlLabel
                                control={<Checkbox name="remember" tabIndex={3} size="small" />}
                                label={<Typography variant="body2">Remember me</Typography>}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                                sx={{ mt: 1 }}
                            >
                                {processing && <CircularProgress size={16} sx={{ mr: 1 }} color="inherit" />}
                                Log in
                            </Button>
                        </Box>

                        {canRegister && (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                Don't have an account?{' '}
                                <TextLink href={register()} tabIndex={5}>
                                    Sign up
                                </TextLink>
                            </Typography>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <Typography variant="body2" fontWeight={500} sx={{ color: 'success.main', textAlign: 'center', mb: 2 }}>
                    {status}
                </Typography>
            )}
        </AuthLayout>
    );
}
