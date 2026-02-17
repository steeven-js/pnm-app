import { Head, useForm, usePage } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { RouterLink } from 'src/routes/components';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

import type { PageProps } from '@/types';

// ----------------------------------------------------------------------

export default function Edit({
  mustVerifyEmail,
  status,
}: {
  mustVerifyEmail: boolean;
  status?: string;
}) {
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
    <DashboardLayout>
      <Head title="Profil" />

      <Box sx={{ p: { xs: 3, md: 5 }, maxWidth: 720 }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Typography
            component={RouterLink}
            href="/dashboard"
            variant="body2"
            color="text.secondary"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Dashboard
          </Typography>
          <Typography variant="body2">Profil</Typography>
        </Breadcrumbs>

        <Typography variant="h4" sx={{ mb: 0.5 }}>
          Profil
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Gérez vos informations personnelles
        </Typography>

        {status && (
          <Typography color="success.main" sx={{ mb: 2 }}>
            {status}
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* ---- Informations du profil ---- */}
          <Card variant="outlined">
            <CardContent
              component="form"
              onSubmit={handleProfileUpdate}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Informations du profil
              </Typography>

              <TextField
                fullWidth
                label="Nom"
                value={profileForm.data.name}
                onChange={(e) => profileForm.setData('name', e.target.value)}
                error={!!profileForm.errors.name}
                helperText={profileForm.errors.name}
                size="small"
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profileForm.data.email}
                onChange={(e) => profileForm.setData('email', e.target.value)}
                error={!!profileForm.errors.email}
                helperText={profileForm.errors.email}
                size="small"
              />

              {mustVerifyEmail && !auth.user.email_verified_at && (
                <Typography color="warning.main" variant="body2">
                  Votre adresse email n&apos;est pas vérifiée.
                </Typography>
              )}

              <Box>
                <Button type="submit" variant="contained" disabled={profileForm.processing}>
                  Enregistrer
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* ---- Modifier le mot de passe ---- */}
          <Card variant="outlined">
            <CardContent
              component="form"
              onSubmit={handlePasswordUpdate}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
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
                size="small"
              />

              <TextField
                fullWidth
                label="Nouveau mot de passe"
                type="password"
                value={passwordForm.data.password}
                onChange={(e) => passwordForm.setData('password', e.target.value)}
                error={!!passwordForm.errors.password}
                helperText={passwordForm.errors.password}
                size="small"
              />

              <TextField
                fullWidth
                label="Confirmer le mot de passe"
                type="password"
                value={passwordForm.data.password_confirmation}
                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                error={!!passwordForm.errors.password_confirmation}
                helperText={passwordForm.errors.password_confirmation}
                size="small"
              />

              <Box>
                <Button type="submit" variant="contained" disabled={passwordForm.processing}>
                  Modifier le mot de passe
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* ---- Supprimer le compte ---- */}
          <Card variant="outlined" sx={{ borderColor: 'error.main' }}>
            <CardContent
              component="form"
              onSubmit={handleDeleteAccount}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <Typography variant="subtitle1" fontWeight={600} color="error">
                Supprimer le compte
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Une fois votre compte supprimé, toutes ses données seront définitivement effacées.
              </Typography>

              <TextField
                fullWidth
                label="Mot de passe"
                type="password"
                value={deleteForm.data.password}
                onChange={(e) => deleteForm.setData('password', e.target.value)}
                error={!!deleteForm.errors.password}
                helperText={deleteForm.errors.password}
                size="small"
              />

              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  color="error"
                  disabled={deleteForm.processing}
                >
                  Supprimer le compte
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
