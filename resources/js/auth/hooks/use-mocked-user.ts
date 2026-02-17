import { usePage } from '@inertiajs/react';

import type { PageProps } from 'src/types';

// ----------------------------------------------------------------------

export function useMockedUser() {
  const { auth } = usePage<PageProps>().props;

  const user = auth?.user
    ? {
        id: String(auth.user.id),
        displayName: auth.user.name,
        email: auth.user.email,
        photoURL: '',
        role: (auth.user as any).role ?? 'user',
      }
    : null;

  return { user };
}
