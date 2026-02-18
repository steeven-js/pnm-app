import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export const navData: NavSectionProps['data'] = [
  /**
   * Navigation
   */
  {
    subheader: 'Navigation',
    items: [
      {
        title: 'Dashboard',
        path: paths.dashboard.root,
        icon: <Iconify icon="solar:home-angle-bold-duotone" width={24} />,
      },
      {
        title: 'Connaissances',
        path: paths.knowledge.root,
        icon: <Iconify icon="solar:notebook-bold-duotone" width={24} />,
      },
      {
        title: 'Progression',
        path: paths.dashboard.progress,
        icon: <Iconify icon="solar:chart-bold-duotone" width={24} />,
      },
    ],
  },
  /**
   * Outils PNM
   */
  {
    subheader: 'Outils PNM',
    items: [
      {
        title: 'Vérifier',
        path: paths.verify.root,
        icon: <Iconify icon="solar:check-circle-bold-duotone" width={24} />,
        children: [
          { title: 'Calcul de dates', path: paths.verify.dateCalculator },
          { title: 'Validation RIO', path: paths.verify.rioValidator },
          { title: 'Décodeur fichier', path: paths.verify.filenameDecoder },
          { title: 'ID Portage', path: paths.verify.portageId },
          { title: 'Vérif. MSISDN', path: paths.verify.msisdnChecker },
          { title: 'SQL Playground', path: paths.sqlPlayground.root },
        ],
      },
      {
        title: 'Résoudre',
        path: paths.resolve.root,
        icon: <Iconify icon="solar:bug-bold-duotone" width={24} />,
        children: [
          { title: 'Codes PNM', path: paths.resolve.codes },
          { title: 'Arbres de décision', path: paths.resolve.decisionTrees },
          { title: 'Incidents', path: paths.resolve.incidents },
          { title: 'Diagrammes', path: paths.resolve.diagrams },
        ],
      },
    ],
  },
  /**
   * Référence
   */
  {
    subheader: 'Référence',
    items: [
      {
        title: 'Glossaire',
        path: paths.glossary,
        icon: <Iconify icon="solar:book-bold-duotone" width={24} />,
      },
    ],
  },
];
