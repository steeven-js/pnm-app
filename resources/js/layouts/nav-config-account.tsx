import type { AccountDrawerProps } from './components/account-drawer';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export const _account: AccountDrawerProps['data'] = [
  { label: 'Home', href: '/', icon: <Iconify icon="solar:home-angle-bold-duotone" /> },
  {
    label: 'Profil',
    href: '/profile',
    icon: <Iconify icon="solar:user-bold-duotone" />,
  },
];
