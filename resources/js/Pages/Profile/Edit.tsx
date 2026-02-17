import { Head, useForm, usePage } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { PageProps } from '@/types';

// ----------------------------------------------------------------------

export default function Edit({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<PageProps>().props;

    const profileForm = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const deleteForm = useForm({
        password: '',
    });

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.patch('/profile');
    };

    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put('/password', {
            onSuccess: () => passwordForm.reset(),
        });
    };

    const handleDeleteAccount = (e: React.FormEvent) => {
        e.preventDefault();
        deleteForm.delete('/profile');
    };

    return (
        <>
            <Head title="Profil" />

            <Box sx={{ maxWidth: 600, mx: 'auto', p: 4 }}>
                <Typography variant="h4" sx={{ mb: 4 }}>
                    Profil
                </Typography>

                {status && (
                    <Typography color="success.main" sx={{ mb: 2 }}>
                        {status}
                    </Typography>
                )}

                {/* ---- Informations du profil ---- */}
                <Box
                    component="form"
                    onSubmit={handleProfileUpdate}
                    sx={{ mb: 5 }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Informations du profil
                    </Typography>

                    <TextField
                        fullWidth
                        label="Nom"
                        value={profileForm.data.name}
                        onChange={(e) => profileForm.setData('name', e.target.value)}
                        error={!!profileForm.errors.name}
                        helperText={profileForm.errors.name}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={profileForm.data.email}
                        onChange={(e) => profileForm.setData('email', e.target.value)}
                        error={!!profileForm.errors.email}
                        helperText={profileForm.errors.email}
                        sx={{ mb: 2 }}
                    />

                    {mustVerifyEmail && !auth.user.email_verified_at && (
                        <Typography color="warning.main" sx={{ mb: 2 }}>
                            Votre adresse email n'est pas verifiee.
                        </Typography>
                    )}

                    <Button
                        size="large"
                        type="submit"
                        variant="contained"
                        disabled={profileForm.processing}
                    >
                        Enregistrer
                    </Button>
                </Box>

                {/* ---- Modifier le mot de passe ---- */}
                <Box
                    component="form"
                    onSubmit={handlePasswordUpdate}
                    sx={{ mb: 5 }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Modifier le mot de passe
                    </Typography>

                    <TextField
                        fullWidth
                        label="Mot de passe actuel"
                        type="password"
                        value={passwordForm.data.current_password}
                        onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                        error={!!passwordForm.errors.current_password}
                        helperText={passwordForm.errors.current_password}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Nouveau mot de passe"
                        type="password"
                        value={passwordForm.data.password}
                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                        error={!!passwordForm.errors.password}
                        helperText={passwordForm.errors.password}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Confirmer le mot de passe"
                        type="password"
                        value={passwordForm.data.password_confirmation}
                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                        error={!!passwordForm.errors.password_confirmation}
                        helperText={passwordForm.errors.password_confirmation}
                        sx={{ mb: 3 }}
                    />

                    <Button
                        size="large"
                        type="submit"
                        variant="contained"
                        disabled={passwordForm.processing}
                    >
                        Modifier le mot de passe
                    </Button>
                </Box>

                {/* ---- Supprimer le compte ---- */}
                <Box component="form" onSubmit={handleDeleteAccount}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Supprimer le compte
                    </Typography>

                    <Typography sx={{ mb: 2, color: 'text.secondary' }}>
                        Une fois votre compte supprime, toutes ses donnees seront definitivement effacees.
                    </Typography>

                    <TextField
                        fullWidth
                        label="Mot de passe"
                        type="password"
                        value={deleteForm.data.password}
                        onChange={(e) => deleteForm.setData('password', e.target.value)}
                        error={!!deleteForm.errors.password}
                        helperText={deleteForm.errors.password}
                        sx={{ mb: 3 }}
                    />

                    <Button
                        size="large"
                        type="submit"
                        variant="contained"
                        color="error"
                        disabled={deleteForm.processing}
                    >
                        Supprimer le compte
                    </Button>
                </Box>
            </Box>
        </>
    );
}
