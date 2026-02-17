import { Head, useForm } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <>
            <Head title="Mot de passe oublie" />

            <Box
                sx={{
                    display: 'flex',
                    minHeight: '100vh',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                }}
            >
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ width: 400, p: 4 }}
                >
                    <Typography variant="h4" sx={{ mb: 1 }}>
                        Mot de passe oublie
                    </Typography>

                    <Typography sx={{ mb: 3, color: 'text.secondary' }}>
                        Indiquez votre adresse email et nous vous enverrons un lien de reinitialisation.
                    </Typography>

                    {status && (
                        <Typography color="success.main" sx={{ mb: 2 }}>
                            {status}
                        </Typography>
                    )}

                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        error={!!errors.email}
                        helperText={errors.email}
                        sx={{ mb: 3 }}
                    />

                    <Button
                        fullWidth
                        size="large"
                        type="submit"
                        variant="contained"
                        disabled={processing}
                    >
                        Envoyer le lien
                    </Button>
                </Box>
            </Box>
        </>
    );
}
