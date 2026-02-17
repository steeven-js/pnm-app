import { router } from '@inertiajs/react';
import { useMemo, useCallback } from 'react';

// ----------------------------------------------------------------------

export function useRouter() {
  const push = useCallback((href: string) => {
    router.visit(href);
  }, []);

  const replace = useCallback((href: string) => {
    router.visit(href, { replace: true });
  }, []);

  const back = useCallback(() => {
    window.history.back();
  }, []);

  const forward = useCallback(() => {
    window.history.forward();
  }, []);

  const refresh = useCallback(() => {
    router.reload();
  }, []);

  return useMemo(
    () => ({ push, replace, back, forward, refresh }),
    [push, replace, back, forward, refresh]
  );
}
