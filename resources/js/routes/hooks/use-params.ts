import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';

// ----------------------------------------------------------------------

export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  const { props } = usePage();

  return useMemo(() => (props as any).routeParams ?? ({} as T), [props]);
}
