import { Head, useForm } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/confirm-password');
    };

    return (
        <>
            <Head title="Confirmer le mot de passe" />

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
                        Confirmer le mot de passe
                    </Typography>

                    <Typography sx={{ mb: 3, color: 'text.secondary' }}>
                        Ceci est une zone securisee. Veuillez confirmer votre mot de passe avant de continuer.
                    </Typography>

                    <TextField
                        fullWidth
                        label="Mot de passe"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={!!errors.password}
                        helperText={errors.password}
                        sx={{ mb: 3 }}
                    />

                    <Button
                        fullWidth
                        size="large"
                        type="submit"
                        variant="contained"
                        disabled={processing}
                    >
                        Confirmer
                    </Button>
                </Box>
            </Box>
        </>
    );
}
