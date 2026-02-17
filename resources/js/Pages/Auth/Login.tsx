import { Head, useForm, Link as InertiaLink, usePage, router } from '@inertiajs/react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import { AuthSplitLayout } from 'src/layouts/auth-split';

// ----------------------------------------------------------------------

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
    const { appEnv } = usePage().props as { appEnv?: string };
    const showPassword = useBoolean();

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <AuthSplitLayout
            slotProps={{
                section: {
                    title: 'Bienvenue',
                    subtitle: 'Portabilité des Numéros Mobiles — Digicel',
                    methods: undefined,
                    method: undefined,
                },
            }}
        >
            <Head title="Connexion" />

            {/* Header */}
            <Box sx={{ mb: 5, gap: 1.5, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5">
                    Connectez-vous
                </Typography>

                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {"Pas encore de compte ? "}
                    <Link
                        component={InertiaLink}
                        href="/register"
                        variant="subtitle2"
                    >
                        Commencer
                    </Link>
                </Typography>
            </Box>

            {/* Status message */}
            {status && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {status}
                </Alert>
            )}

            {/* Error messages */}
            {(errors.email || errors.password) && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {errors.email || errors.password}
                </Alert>
            )}

            {/* Form */}
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}
            >
                <TextField
                    fullWidth
                    label="Adresse email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={!!errors.email}
                    slotProps={{ inputLabel: { shrink: true } }}
                />

                <Box sx={{ gap: 1.5, display: 'flex', flexDirection: 'column' }}>
                    {canResetPassword && (
                        <Link
                            component={InertiaLink}
                            href="/forgot-password"
                            variant="body2"
                            color="inherit"
                            sx={{ alignSelf: 'flex-end' }}
                        >
                            Mot de passe oublié ?
                        </Link>
                    )}

                    <TextField
                        fullWidth
                        label="Mot de passe"
                        placeholder="6+ caractères"
                        type={showPassword.value ? 'text' : 'password'}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={!!errors.password}
                        slotProps={{
                            inputLabel: { shrink: true },
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={showPassword.onToggle} edge="end">
                                            <Iconify
                                                icon={
                                                    showPassword.value
                                                        ? 'solar:eye-bold'
                                                        : 'solar:eye-closed-bold'
                                                }
                                            />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Box>

                <Button
                    fullWidth
                    color="inherit"
                    size="large"
                    type="submit"
                    variant="contained"
                    disabled={processing}
                >
                    {processing ? 'Connexion...' : 'Se connecter'}
                </Button>
            </Box>

            {appEnv === 'local' && (
                <>
                    <Divider sx={{ my: 3, typography: 'overline', color: 'text.disabled' }}>
                        DEV
                    </Divider>

                    <Button
                        fullWidth
                        size="large"
                        variant="soft"
                        color="warning"
                        onClick={() => router.post('/dev-login')}
                        startIcon={<Iconify icon="solar:bolt-bold" />}
                    >
                        Connexion Dev (1 clic)
                    </Button>
                </>
            )}
        </AuthSplitLayout>
    );
}
