import { Head, useForm } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export default function ResetPassword({ token, email }: { token: string; email: string }) {
    const { data, setData, post, processing, errors } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/reset-password');
    };

    return (
        <>
            <Head title="Reinitialiser le mot de passe" />

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
                    <Typography variant="h4" sx={{ mb: 3 }}>
                        Reinitialiser le mot de passe
                    </Typography>

                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        error={!!errors.email}
                        helperText={errors.email}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Nouveau mot de passe"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={!!errors.password}
                        helperText={errors.password}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Confirmer le mot de passe"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        error={!!errors.password_confirmation}
                        helperText={errors.password_confirmation}
                        sx={{ mb: 3 }}
                    />

                    <Button
                        fullWidth
                        size="large"
                        type="submit"
                        variant="contained"
                        disabled={processing}
                    >
                        Reinitialiser
                    </Button>
                </Box>
            </Box>
        </>
    );
}
