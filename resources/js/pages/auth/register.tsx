import { Form, Head } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                id="name"
                                label="Name"
                                type="text"
                                name="name"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="name"
                                placeholder="Full name"
                                error={!!errors.name}
                                helperText={errors.name}
                                fullWidth
                            />

                            <TextField
                                id="email"
                                label="Email address"
                                type="email"
                                name="email"
                                required
                                tabIndex={2}
                                autoComplete="email"
                                placeholder="email@example.com"
                                error={!!errors.email}
                                helperText={errors.email}
                                fullWidth
                            />

                            <TextField
                                id="password"
                                label="Password"
                                type="password"
                                name="password"
                                required
                                tabIndex={3}
                                autoComplete="new-password"
                                placeholder="Password"
                                error={!!errors.password}
                                helperText={errors.password}
                                fullWidth
                            />

                            <TextField
                                id="password_confirmation"
                                label="Confirm password"
                                type="password"
                                name="password_confirmation"
                                required
                                tabIndex={4}
                                autoComplete="new-password"
                                placeholder="Confirm password"
                                error={!!errors.password_confirmation}
                                helperText={errors.password_confirmation}
                                fullWidth
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                tabIndex={5}
                                data-test="register-user-button"
                                sx={{ mt: 1 }}
                            >
                                {processing && <CircularProgress size={16} sx={{ mr: 1 }} color="inherit" />}
                                Create account
                            </Button>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={6}>
                                Log in
                            </TextLink>
                        </Typography>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
