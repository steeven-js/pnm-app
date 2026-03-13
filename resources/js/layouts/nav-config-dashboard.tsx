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
          { title: 'Décodeur fichier', path: paths.verify.filenameDecoder },
          { title: 'ID Portage', path: paths.verify.portageId },
        ],
      },
      {
        title: 'Résoudre',
        path: paths.resolve.root,
        icon: <Iconify icon="solar:bug-bold-duotone" width={24} />,
        children: [
          { title: 'Codes PNM', path: paths.resolve.codes },
          { title: 'Incidents', path: paths.resolve.incidents },
        ],
      },
      {
        title: 'Investigations',
        path: paths.investigations,
        icon: <Iconify icon="solar:magnifer-zoom-in-bold-duotone" width={24} />,
      },
      {
        title: 'Guide Opérations',
        path: paths.operationsGuide,
        icon: <Iconify icon="solar:clipboard-check-bold-duotone" width={24} />,
      },
      {
        title: 'Cas Pratiques',
        path: paths.casPratiques,
        icon: <Iconify icon="solar:case-round-bold-duotone" width={24} />,
      },
      {
        title: 'Requetes SQL',
        path: paths.requetesPnm,
        icon: <Iconify icon="solar:database-bold-duotone" width={24} />,
      },
      {
        title: 'MOBI / CRM',
        path: paths.mobi.root,
        icon: <Iconify icon="solar:server-bold-duotone" width={24} />,
        children: [
          { title: 'Documentation', path: paths.mobi.root },
          { title: 'Cas Pratiques MOBI', path: paths.mobi.casPratiques },
          { title: 'Requetes SQL CRM', path: paths.mobi.sql },
          { title: 'Operations MOBI', path: paths.mobi.operations },
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
