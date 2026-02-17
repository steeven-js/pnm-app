import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';

// ----------------------------------------------------------------------

export function usePathname() {
  const { url } = usePage();

  return useMemo(() => {
    // Remove query string to get just the pathname
    const pathname = url.split('?')[0];
    return pathname;
  }, [url]);
}
