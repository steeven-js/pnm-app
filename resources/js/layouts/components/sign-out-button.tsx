import type { ButtonProps } from '@mui/material/Button';

import { useCallback } from 'react';

import Button from '@mui/material/Button';

import { router } from '@inertiajs/react';

// ----------------------------------------------------------------------

type Props = ButtonProps & {
  onClose?: () => void;
};

export function SignOutButton({ onClose, sx, ...other }: Props) {
  const handleLogout = useCallback(() => {
    router.post('/logout', {}, {
      onFinish: () => {
        onClose?.();
      },
    });
  }, [onClose]);

  return (
    <Button
      fullWidth
      variant="soft"
      size="large"
      color="error"
      onClick={handleLogout}
      sx={sx}
      {...other}
    >
      Déconnexion
    </Button>
  );
}
