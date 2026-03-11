// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  // AUTH
  auth: {
    signIn: '/login',
    signUp: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    jwt: {
      signIn: '/login',
      signUp: '/register',
    },
    firebase: {
      signIn: '/login',
      signUp: '/register',
      verify: '/verify',
      resetPassword: '/forgot-password',
    },
    amplify: {
      signIn: '/login',
      signUp: '/register',
      verify: '/verify',
      resetPassword: '/forgot-password',
      updatePassword: '/reset-password',
    },
    auth0: {
      signIn: '/login',
    },
    supabase: {
      signIn: '/login',
      signUp: '/register',
      verify: '/verify',
      resetPassword: '/forgot-password',
      updatePassword: '/reset-password',
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    progress: '/progress',
  },
  // VERIFY TOOLS
  verify: {
    root: '/verify',
    dateCalculator: '/verify/date-calculator',
    rioValidator: '/verify/rio-validator',
    filenameDecoder: '/verify/filename-decoder',
    portageId: '/verify/portage-id',
    msisdnChecker: '/verify/msisdn-checker',
  },
  // RESOLVE TOOLS
  resolve: {
    root: '/resolve',
    codes: '/resolve/codes',
    codeShow: (code: string) => `/resolve/codes/${code}`,
    decisionTrees: '/resolve/decision-trees',
    decisionTreeShow: (slug: string) => `/resolve/decision-trees/${slug}`,
    incidents: '/resolve/incidents',
    diagrams: '/diagrams',
  },
  // KNOWLEDGE
  knowledge: {
    root: '/knowledge',
    domain: (slug: string) => `/knowledge/${slug}`,
    article: (domainSlug: string, articleSlug: string) => `/knowledge/${domainSlug}/${articleSlug}`,
  },
  // SQL PLAYGROUND
  sqlPlayground: {
    root: '/sql-playground',
    debutant: '/sql-playground/debutant',
    intermediaire: '/sql-playground/intermediaire',
    investigation: '/sql-playground/investigation',
  },
  // OPERATIONS GUIDE
  operationsGuide: '/operations-guide',
  // REQUETES PNM
  requetesPnm: '/requetes-pnm',
  // INVESTIGATIONS
  investigations: '/investigations',
  // CAS PRATIQUES
  casPratiques: '/cas-pratiques',
  // GLOSSARY
  glossary: '/glossary',
  // CHANGELOG
  changelog: '/changelog',
};
