import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';

// ----------------------------------------------------------------------

export function useSearchParams() {
  const { url } = usePage();

  return useMemo(() => {
    const queryString = url.split('?')[1] ?? '';
    return new URLSearchParams(queryString);
  }, [url]);
}
