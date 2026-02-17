import { useMemo } from 'react';

import { usePage } from '@inertiajs/react';

import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

import { navData as staticNavData } from './nav-config-dashboard';

// ----------------------------------------------------------------------

type KnowledgeDomain = {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
};

export function useNavData(): NavSectionProps['data'] {
  const { knowledgeDomains } = usePage().props as { knowledgeDomains: KnowledgeDomain[] };

  return useMemo(() => {
    const domains = knowledgeDomains ?? [];

    if (domains.length === 0) {
      return staticNavData;
    }

    const knowledgeSection: NavSectionProps['data'][number] = {
      subheader: 'Base de connaissances',
      items: domains.map((domain) => ({
        title: domain.name,
        path: paths.knowledge.domain(domain.slug),
        icon: (
          <Iconify
            icon={domain.icon || 'solar:document-bold-duotone'}
            width={24}
            sx={domain.color ? { color: domain.color } : undefined}
          />
        ),
      })),
    };

    // Insert knowledge section before the last section (Référence)
    const navSections = [...staticNavData];
    navSections.splice(navSections.length - 1, 0, knowledgeSection);

    return navSections;
  }, [knowledgeDomains]);
}
