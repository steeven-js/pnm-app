import { Head, useForm } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const ROLES = [
  {
    value: 'charge_application',
    label: 'Chargé d\'application',
    description: 'Gestion et suivi des applications PNM',
    icon: 'solar:monitor-bold-duotone',
    color: '#00A76F',
  },
  {
    value: 'developpeur',
    label: 'Développeur',
    description: 'Développement et maintenance technique',
    icon: 'solar:code-bold-duotone',
    color: '#00B8D9',
  },
  {
    value: 'reseau',
    label: 'Réseau',
    description: 'Infrastructure et connectivité réseau',
    icon: 'solar:server-bold-duotone',
    color: '#FFAB00',
  },
  {
    value: 'support',
    label: 'Support',
    description: 'Assistance et résolution d\'incidents',
    icon: 'solar:chat-round-call-bold-duotone',
    color: '#FF5630',
  },
  {
    value: 'manager',
    label: 'Manager',
    description: 'Pilotage et supervision des équipes',
    icon: 'solar:users-group-rounded-bold-duotone',
    color: '#8E33FF',
  },
];

// ----------------------------------------------------------------------

export default function OnboardingIndex() {
  const { data, setData, post, processing } = useForm({ role: '' });

  const handleSubmit = () => {
    if (!data.role) return;
    post('/onboarding');
  };

  return (
    <>
      <Head title="Onboarding" />

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Box sx={{ maxWidth: 560, width: 1, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Bienvenue sur PNM App
          </Typography>

          <Typography sx={{ mb: 5, color: 'text.secondary' }}>
            Sélectionnez votre rôle pour personnaliser votre expérience
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 5 }}>
            {ROLES.map((role) => (
              <Card
                key={role.value}
                variant="outlined"
                sx={{
                  borderColor: data.role === role.value ? role.color : 'divider',
                  borderWidth: data.role === role.value ? 2 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <CardActionArea
                  onClick={() => setData('role', role.value)}
                  sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      flexShrink: 0,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: `${role.color}14`,
                    }}
                  >
                    <Iconify icon={role.icon} width={28} sx={{ color: role.color }} />
                  </Box>

                  <Box sx={{ textAlign: 'left', flex: 1 }}>
                    <Typography variant="subtitle1">{role.label}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {role.description}
                    </Typography>
                  </Box>

                  {data.role === role.value && (
                    <Iconify
                      icon="solar:check-circle-bold"
                      width={24}
                      sx={{ color: role.color, flexShrink: 0 }}
                    />
                  )}
                </CardActionArea>
              </Card>
            ))}
          </Box>

          <Button
            fullWidth
            size="large"
            variant="contained"
            color="inherit"
            disabled={!data.role || processing}
            onClick={handleSubmit}
          >
            {processing ? 'Enregistrement...' : 'Continuer'}
          </Button>
        </Box>
      </Box>
    </>
  );
}
