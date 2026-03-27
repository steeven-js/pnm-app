import type { NavSectionProps } from 'src/components/nav-section';

import { navData as staticNavData } from './nav-config-dashboard';

// ----------------------------------------------------------------------

export function useNavData(): NavSectionProps['data'] {
  return staticNavData;
}
