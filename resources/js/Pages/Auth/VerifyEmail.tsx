import { Head, useForm } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const handleResend = (e: React.FormEvent) => {
        e.preventDefault();
        post('/email/verification-notification');
    };

    return (
        <>
            <Head title="Verification de l'email" />

            <Box
                sx={{
                    display: 'flex',
                    minHeight: '100vh',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                }}
            >
                <Box sx={{ width: 400, p: 4 }}>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                        Verification de l'email
                    </Typography>

                    <Typography sx={{ mb: 3, color: 'text.secondary' }}>
                        Merci de votre inscription ! Veuillez verifier votre adresse email en cliquant sur le lien que
                        nous venons de vous envoyer.
                    </Typography>

                    {status === 'verification-link-sent' && (
                        <Typography color="success.main" sx={{ mb: 2 }}>
                            Un nouveau lien de verification a ete envoye a votre adresse email.
                        </Typography>
                    )}

                    <Box component="form" onSubmit={handleResend}>
                        <Button
                            fullWidth
                            size="large"
                            type="submit"
                            variant="contained"
                            disabled={processing}
                        >
                            Renvoyer l'email de verification
                        </Button>
                    </Box>
                </Box>
            </Box>
        </>
    );
}
