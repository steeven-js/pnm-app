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
    ],
  },
  /**
   * Outils
   */
  {
    subheader: 'Outils',
    items: [
      {
        title: 'Vérifier',
        path: paths.verify.root,
        icon: <Iconify icon="solar:check-circle-bold-duotone" width={24} />,
        children: [
          { title: 'Calcul de dates', path: paths.verify.dateCalculator },
          { title: 'Décodeur fichier', path: paths.verify.filenameDecoder },
          { title: 'ID Portage', path: paths.verify.portageId },
          { title: 'Mail Latifa', path: paths.verify.latifaMail },
        ],
      },
      {
        title: 'Résoudre',
        path: paths.resolve.root,
        icon: <Iconify icon="solar:bug-bold-duotone" width={24} />,
        children: [
          { title: 'Codes PNM', path: paths.resolve.codes },
          { title: 'Incidents', path: paths.resolve.incidents },
          { title: 'Investigations', path: paths.investigations },
        ],
      },
      {
        title: 'Generateur PNMDATA',
        path: paths.pnmdataGenerator,
        icon: <Iconify icon="solar:file-text-bold-duotone" width={24} />,
      },
    ],
  },
  /**
   * Base de Connaissances (dépliable)
   */
  {
    subheader: 'Base de Connaissances',
    items: [
      {
        title: 'PNM V3',
        path: paths.knowledge.root,
        icon: <Iconify icon="solar:notebook-bold-duotone" width={24} />,
        children: [
          { title: 'Connaissances', path: paths.knowledge.root },
          { title: 'Guide Opérations', path: paths.operationsGuide },
          { title: 'Cas Pratiques', path: paths.casPratiques },
          { title: 'Requetes SQL', path: paths.requetesPnm },
          { title: 'MOBI / CRM', path: paths.mobi.root },
          { title: 'Progression', path: paths.dashboard.progress },
        ],
      },
      {
        title: 'Base Tickets',
        path: paths.ticketsKnowledge,
        icon: <Iconify icon="solar:archive-bold-duotone" width={24} />,
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
        title: 'Contacts Operateurs',
        path: paths.contacts,
        icon: <Iconify icon="solar:users-group-rounded-bold-duotone" width={24} />,
      },
      {
        title: 'Glossaire',
        path: paths.glossary,
        icon: <Iconify icon="solar:book-bold-duotone" width={24} />,
      },
    ],
  },
];
