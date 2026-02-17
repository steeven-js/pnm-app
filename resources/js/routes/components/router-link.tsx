import type { InertiaLinkProps } from '@inertiajs/react';

import { Link } from '@inertiajs/react';

// ----------------------------------------------------------------------

interface RouterLinkProps extends Omit<InertiaLinkProps, 'href'> {
  href: string;
  ref?: React.RefObject<HTMLAnchorElement | null>;
}

export function RouterLink({ href, ref, ...other }: RouterLinkProps) {
  return <Link ref={ref} href={href} {...other} />;
}
