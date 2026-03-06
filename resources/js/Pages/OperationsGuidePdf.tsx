import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';

// ─── Font registration (system sans-serif fallback) ─────────────────────────

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ],
});

// ─── Styles ─────────────────────────────────────────────────────────────────

const c = {
  primary: '#00A76F',
  blue: '#2563eb',
  orange: '#d97706',
  green: '#16a34a',
  purple: '#7c3aed',
  cyan: '#0891b2',
  red: '#dc2626',
  deepOrange: '#ea580c',
  grey: '#6b7280',
  dark: '#212B36',
  light: '#637381',
  bg: '#F9FAFB',
  white: '#FFFFFF',
  border: '#E5E8EB',
};

const s = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 9, color: c.dark },
  // Header / footer
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: c.border },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: c.primary },
  headerSub: { fontSize: 8, color: c.light },
  footer: { position: 'absolute', bottom: 25, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: c.light, borderTopWidth: 0.5, borderTopColor: c.border, paddingTop: 5 },
  // Sections
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: c.dark, marginTop: 16, marginBottom: 8 },
  sectionSub: { fontSize: 8, color: c.light, marginBottom: 8 },
  // Info box
  infoBox: { backgroundColor: '#E8F4FD', borderLeftWidth: 3, borderLeftColor: '#0288D1', padding: 10, marginBottom: 14, borderRadius: 3 },
  infoText: { fontSize: 8.5, lineHeight: 1.5 },
  // Diagram node
  diagramContainer: { marginBottom: 14 },
  diagramRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  diagramNode: { borderWidth: 1.5, borderRadius: 4, padding: 6, alignItems: 'center', minWidth: 90 },
  diagramNodeLabel: { fontSize: 8, fontWeight: 'bold' },
  diagramNodeSub: { fontSize: 6.5, color: c.light, marginTop: 1 },
  diagramNodeIp: { fontSize: 6, color: c.grey, marginTop: 1 },
  diagramArrow: { fontSize: 7, color: c.grey, marginHorizontal: 4 },
  diagramArrowDown: { fontSize: 7, color: c.grey, textAlign: 'center', marginVertical: 2 },
  diagramArrowLabel: { fontSize: 6, color: c.grey, textAlign: 'center' },
  // Table
  table: { marginBottom: 14 },
  tableHeader: { flexDirection: 'row', backgroundColor: c.bg, borderBottomWidth: 1, borderBottomColor: c.border, paddingVertical: 5, paddingHorizontal: 4 },
  tableHeaderCell: { fontSize: 8, fontWeight: 'bold', color: c.dark },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: c.border, paddingVertical: 4, paddingHorizontal: 4 },
  tableCell: { fontSize: 8, color: c.dark },
  tableCellLight: { fontSize: 8, color: c.light },
  // Flux steps
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  stepCircle: { width: 18, height: 18, borderRadius: 9, backgroundColor: c.primary, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  stepNumber: { color: c.white, fontSize: 9, fontWeight: 'bold' },
  stepTitle: { fontSize: 9, fontWeight: 'bold' },
  stepDesc: { fontSize: 8, color: c.light, marginTop: 1 },
  stepServer: { fontSize: 7, color: c.primary, marginTop: 1 },
  // Legend
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendText: { fontSize: 6.5, color: c.light },
  // Operator badge
  badge: { backgroundColor: c.bg, borderWidth: 0.5, borderColor: c.border, borderRadius: 2, paddingHorizontal: 4, paddingVertical: 1, fontSize: 7 },
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function DiagramNodePdf({ label, sub, ip, color, width = 100 }: { label: string; sub?: string; ip?: string; color: string; width?: number }) {
  return (
    <View style={[s.diagramNode, { borderColor: color, width }]}>
      <Text style={[s.diagramNodeLabel, { color }]}>{label}</Text>
      {sub && <Text style={s.diagramNodeSub}>{sub}</Text>}
      {ip && <Text style={s.diagramNodeIp}>{ip}</Text>}
    </View>
  );
}

function Arrow({ label, dir = 'right', color = c.grey }: { label?: string; dir?: 'right' | 'down' | 'both'; color?: string }) {
  if (dir === 'down') {
    return (
      <View style={{ alignItems: 'center', marginVertical: 2 }}>
        {label && <Text style={[s.diagramArrowLabel, { color }]}>{label}</Text>}
        <Text style={[s.diagramArrowDown, { color }]}>|</Text>
        <Text style={{ fontSize: 6, color }}>▼</Text>
      </View>
    );
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 3 }}>
      {dir === 'both' && <Text style={{ fontSize: 5, color }}>◄</Text>}
      <View style={{ width: 20, height: 1, backgroundColor: color }} />
      {label && <Text style={{ fontSize: 5.5, color, marginHorizontal: 1 }}>{label}</Text>}
      <View style={{ width: 20, height: 1, backgroundColor: color }} />
      <Text style={{ fontSize: 5, color }}>►</Text>
    </View>
  );
}

// ─── Data (duplicated here to keep PDF self-contained) ──────────────────────

const OPERATORS = [
  { code: '01', name: 'Orange Caraïbe', role: 'Opérateur historique' },
  { code: '02', name: 'Digicel', role: 'Notre opérateur (OPR)' },
  { code: '03', name: 'SFR / Only (Outremer)', role: 'Opérateur tiers' },
  { code: '04', name: 'Dauphin Télécom', role: 'Opérateur tiers' },
  { code: '05', name: 'UTS Caraïbe', role: 'Opérateur tiers' },
  { code: '06', name: 'Free Caraïbe', role: 'Opérateur tiers' },
];

const FLUX_STEPS = [
  { step: 1, title: 'Génération des fichiers', description: 'PnmDataManager.sh génère les fichiers PNMDATA.02.0X pour chaque opérateur dans /PortaSync/pnmdata/0X/send/', server: 'vmqproportasync01' },
  { step: 2, title: 'Transfert SFTP via BTCTF', description: 'synchro-pnmv3.sh copie les fichiers depuis send/ vers le serveur BTCTF qui les transmet aux opérateurs via SFTP', server: 'btctf' },
  { step: 3, title: 'Réception & intégration', description: 'Les fichiers reçus des opérateurs sont copiés dans recv/. PnmAckManager.sh contrôle, intègre, acquitte et archive', server: 'vmqproportasync01' },
  { step: 4, title: 'Traitement dans PortaDB', description: 'Les tickets sont intégrés dans la base PortaDB via DigimqPortaWebdb. Communication XML/SOAP avec le SI', server: 'vmqproportawebdb01' },
  { step: 5, title: 'Bascule & Valorisation', description: 'EmaExtracteur (bascule) et EmmExtracteur (valorisation) mettent à jour MOBI via l\'ESB DataPower', server: 'vmqproportasync01' },
  { step: 6, title: 'Vérification & Rapport', description: 'Emails de rapport envoyés : vacations, incidents, automates. Vérification via PortaWebUI et logs serveur', server: 'Tous' },
];

const VACATION_SCHEDULE = [
  { name: 'Vacation 1', time: '10h → 11h', mailTime: '~11h35', description: 'Premier échange de fichiers PNMDATA avec les 5 opérateurs' },
  { name: 'Vacation 2', time: '14h → 15h', mailTime: '~15h35', description: 'Deuxième échange. Comparer avec vacation 1' },
  { name: 'Vacation 3', time: '19h → 20h', mailTime: '~20h35', description: 'Troisième et dernier échange. Clôture journée' },
  { name: 'Synchro dimanche', time: '22h → 00h', mailTime: '—', description: 'Synchronisation hebdomadaire (PNMSYNC)' },
];

const LEGEND_ITEMS = [
  { color: c.green, label: 'SFTP / SCP (fichiers plats)' },
  { color: c.blue, label: 'Synchronisation interne' },
  { color: c.orange, label: 'Base de données MySQL' },
  { color: c.red, label: 'XML / SOAP (ESB)' },
  { color: c.deepOrange, label: 'Fichiers EMA / EMM' },
  { color: c.purple, label: 'Portails Web' },
];

// Timeline vérifications quotidiennes
type TimelineSlotItem = {
  type: 'mail' | 'server';
  title: string;
  detail: string;
  category?: 'vacation' | 'supervision' | 'incident' | 'reporting';
  from?: string;
  commands?: string[];
  check?: string;
  server?: string;
};
type TimelineSlot = { time: string; items: TimelineSlotItem[] };

const DAILY_TIMELINE: TimelineSlot[] = [
  {
    time: '~04:00',
    items: [
      { type: 'mail', title: '[CTO] Bascule du jour tardive ou en echec', detail: 'Vérifier si des MSISDN nécessitent un rattrapage manuel. Fichiers Rattrapage_CTO_MQ/GF/GP.', category: 'supervision', from: 'APP_VENTES' },
    ],
  },
  {
    time: '~09:00',
    items: [
      { type: 'server', title: 'Bascule & Valorisation', detail: 'Tous les opérateurs "Check success" + "Fin de Traitement"', server: 'vmqproportasync01', commands: ['tail -n 12 /home/porta_pnmv3/PortaSync/log/EmaExtracter.log', 'tail -n 12 /home/porta_pnmv3/PortaSync/log/EmmExtracter.log'], check: 'Tous les opérateurs "Check success" + "Fin de Traitement"' },
      { type: 'mail', title: '[PNM] Reporting RIO incorrect', detail: 'Vérifier le nombre de refus entrante/sortante pour RIO incorrect. Si > 0, investiguer.', category: 'reporting', from: 'porta_pnmv3' },
      { type: 'mail', title: '[PNM][INCIDENT] Incidents détectés', detail: 'Analyser chaque incident : refus 1210/1220, erreurs 7000, AR non-reçus, conflits.', category: 'incident', from: 'porta_pnmv3' },
    ],
  },
  {
    time: '~10:15',
    items: [
      { type: 'server', title: 'Génération fichiers vacation', detail: 'Fichier PNMDATA généré pour op. 01, 03, 04, 05, 06 + "Fin de Traitement"', server: 'vmqproportasync01', commands: ['tail -n 14 /home/porta_pnmv3/PortaSync/log/PnmDataManager.log'], check: 'Fichier PNMDATA généré pour op. 01, 03, 04, 05, 06 + "Fin de Traitement"' },
      { type: 'mail', title: '[PNMV3] PSO du jour Forfait', detail: 'Ouvrir le CSV Pnm_PSO_MOBI, vérifier la volumétrie vs prévisions veille.', category: 'reporting', from: 'porta_pnmv3' },
    ],
  },
  {
    time: '~11:15',
    items: [
      { type: 'server', title: 'Acquittements fichiers', detail: '"Aucune notification d\'AR SYNC non-reçu" pour chaque opérateur', server: 'vmqproportasync01', commands: ['tail -f /home/porta_pnmv3/PortaSync/log/PnmAckManager.log'], check: '"Aucune notification d\'AR SYNC non-reçu" pour chaque opérateur' },
      { type: 'mail', title: '[PNM] Ticket(s) 1210 en attente', detail: 'Trier par ancienneté. < 3j surveiller, 3-5j relancer, > 5j escalader.', category: 'incident', from: 'porta_pnmv3' },
      { type: 'mail', title: '[PNM] Ticket(s) en attente', detail: 'Traiter les tickets les plus anciens en priorité (XLS joint).', category: 'incident', from: 'porta_pnmv3' },
      { type: 'mail', title: '[PNM] Rapport vacation 1', detail: 'Vérifier fichiers échangés = attendus, ACR OK pour les 5 opérateurs, aucun .ERR.', category: 'vacation', from: 'porta_pnmv3' },
    ],
  },
  {
    time: '~15:25',
    items: [
      { type: 'mail', title: '[PROD] Rapport activité automates', detail: 'Vérifier SUCCESS pour BASCULE_IN, EXPLOIT, RATP_OLN, TRACE, WATCHER.', category: 'supervision', from: 'supervision@digicelgroup.fr' },
      { type: 'mail', title: '[PNM] Portabilités prévues DIGICEL-WIZZEE', detail: 'Vérifier IN/OUT DIGICEL + WIZZEE, portabilités internes veille.', category: 'reporting', from: 'porta_pnmv3' },
      { type: 'mail', title: '[PNM] Rapport vacation 2', detail: 'Comparer avec vacation 1 : fichiers manquants réapparus ? ACR OK.', category: 'vacation', from: 'porta_pnmv3' },
    ],
  },
  {
    time: '~20:35',
    items: [
      { type: 'mail', title: '[PNM] Rapport vacation 3 + clôture', detail: 'Dernier rapport du jour. Vérifier, clôturer la journée PNM.', category: 'vacation', from: 'porta_pnmv3' },
    ],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  vacation: c.green,
  supervision: c.blue,
  incident: c.red,
  reporting: c.orange,
};

const CATEGORY_LABELS: Record<string, string> = {
  vacation: 'Vacation',
  supervision: 'Supervision',
  incident: 'Incident',
  reporting: 'Reporting',
};

// Scripts PNM et logs associés
const PNM_SCRIPTS = [
  {
    script: 'EmaExtracter.sh',
    description: 'Traitement de la bascule et génération du fichier de mise à jour du routage + envoi du fichier via EMA pour mise à jour sur le FNR',
    log: 'EmaExtracter.log',
    logPath: '/home/porta_pnmv3/PortaSync/log/EmaExtracter.log',
    server: 'vmqproportasync01',
    schedule: 'Quotidien ~08h30 (après bascule)',
    category: 'Bascule',
  },
  {
    script: 'EmmExtracter.sh',
    description: 'Génération et envoi du fichier répertoriant tous les MSISDN portés vers l\'EMM',
    log: 'EmmExtracter.log',
    logPath: '/home/porta_pnmv3/PortaSync/log/EmmExtracter.log',
    server: 'vmqproportasync01',
    schedule: 'Quotidien ~08h30 (après bascule)',
    category: 'Valorisation',
  },
  {
    script: 'PnmDataManager.sh',
    description: 'Génération des fichiers de vacation PNMDATA pour chaque opérateur (01, 03, 04, 05, 06)',
    log: 'PnmDataManager.log',
    logPath: '/home/porta_pnmv3/PortaSync/log/PnmDataManager.log',
    server: 'vmqproportasync01',
    schedule: '3x/jour (V1: 10h, V2: 14h, V3: 19h)',
    category: 'Vacation',
  },
  {
    script: 'PnmDataAckManager.sh',
    description: 'Intégration des fichiers de vacation PNMDATA reçus des opérateurs et génération des fichiers d\'acquittement (ACR)',
    log: 'PnmAckManager.log',
    logPath: '/home/porta_pnmv3/PortaSync/log/PnmAckManager.log',
    server: 'vmqproportasync01',
    schedule: '3x/jour (après chaque vacation)',
    category: 'Acquittement',
  },
  {
    script: 'PnmDataAckGenerator.sh',
    description: 'Vérification des fichiers d\'acquittement et génération des fichiers d\'erreur si anomalie détectée',
    log: 'PnmDataAckGenerator.log',
    logPath: '/home/porta_pnmv3/PortaSync/log/PnmDataAckGenerator.log',
    server: 'vmqproportasync01',
    schedule: 'Après réception des ACR',
    category: 'Acquittement',
  },
  {
    script: 'PnmSyncManager.sh',
    description: 'Génération des fichiers de synchronisation PNMSYNC (mise à jour complète de la base inter-opérateurs)',
    log: 'PnmSyncManager.log',
    logPath: '/home/porta_pnmv3/PortaSync/log/PnmSyncManager.log',
    server: 'vmqproportasync01',
    schedule: 'Dimanche soir (~22h)',
    category: 'Synchronisation',
  },
  {
    script: 'PnmSyncAckManager.sh',
    description: 'Intégration des fichiers de synchronisation PNMSYNC reçus et génération des fichiers d\'acquittement correspondants',
    log: 'PnmAckManager.log',
    logPath: '/home/porta_pnmv3/PortaSync/log/PnmAckManager.log',
    server: 'vmqproportasync01',
    schedule: 'Dimanche soir (après PNMSYNC)',
    category: 'Synchronisation',
  },
];

const SCRIPT_CATEGORY_COLORS: Record<string, string> = {
  Bascule: c.red,
  Valorisation: c.deepOrange,
  Vacation: c.green,
  Acquittement: c.blue,
  Synchronisation: c.purple,
};

const PROD_LEGEND = [
  { color: c.green, label: 'SFTP (opérateurs)' },
  { color: c.blue, label: 'SCP / Sync interne' },
  { color: c.orange, label: 'Base de données' },
  { color: c.red, label: 'ESB / SOAP' },
  { color: '#9333ea', label: 'SI MOBI' },
  { color: c.cyan, label: 'Micro services' },
  { color: c.purple, label: 'Portails Web' },
  { color: '#059669', label: 'Utilisateurs finaux' },
];

// ─── PDF Document ───────────────────────────────────────────────────────────

function OperationsGuidePdfDocument() {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Document>
      {/* PAGE 1 — Architecture & Diagrams */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Guide des Opérations PNM — Vue d'ensemble</Text>
            <Text style={s.headerSub}>Portabilité des Numéros Mobiles V3 — Digicel Antilles-Guyane</Text>
          </View>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        {/* Info box */}
        <View style={s.infoBox}>
          <Text style={s.infoText}>
            Le système PNM V3 gère la portabilité des numéros mobiles entre les 6 opérateurs des Antilles-Guyane. Les échanges se font par fichiers plats (PNMDATA/PNMSYNC) transférés en SFTP via le serveur BTCTF, avec 3 vacations par jour ouvré et une synchronisation le dimanche.
          </Text>
        </View>

        {/* Diagram 1: Architecture Porta Digicel */}
        <Text style={s.sectionTitle}>Architecture Porta Digicel</Text>
        <Text style={s.sectionSub}>Flux de données entre les serveurs internes et les opérateurs externes via BTCTF</Text>

        <View style={s.diagramContainer}>
          {/* Operators row */}
          <View style={[s.diagramRow, { gap: 4 }]}>
            {['01 Orange', '03 SFR', '04 Dauphin', '05 UTS', '06 Free'].map((op) => (
              <DiagramNodePdf key={op} label={op} color={c.grey} width={80} />
            ))}
          </View>

          <View style={{ alignItems: 'center' }}>
            <Arrow label="SFTP (fichiers plats)" dir="both" color={c.green} />
          </View>

          {/* BTCTF */}
          <View style={s.diagramRow}>
            <DiagramNodePdf label="BTCTF" sub="Hub transfert SFTP" ip="172.24.119.70" color={c.green} width={160} />
          </View>

          <View style={{ alignItems: 'center' }}>
            <Arrow label="SCP (fichiers plats)" dir="both" color={c.blue} />
          </View>

          {/* Sync ↔ DB */}
          <View style={s.diagramRow}>
            <DiagramNodePdf label="DigimqPortaSync01" sub="Synchronisation" ip="172.24.119.69" color={c.blue} width={140} />
            <Arrow label="XML/SOAP" dir="right" color={c.orange} />
            <DiagramNodePdf label="DigimqPortaWebdb" sub="PortaDB / PortaWebDB" ip="172.24.119.68 — MySQL :3306" color={c.orange} width={160} />
          </View>

          {/* Branches: EMA/EMM and ESB */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 50, marginTop: 4 }}>
            <View style={{ alignItems: 'center' }}>
              <Arrow label="Fichiers EMA/EMM" dir="down" color={c.deepOrange} />
              <DiagramNodePdf label="EMA / EMM" sub="ema15-digicel" color={c.deepOrange} width={110} />
            </View>
            <View style={{ alignItems: 'center' }}>
              <Arrow label="XML/SOAP" dir="down" color={c.red} />
              <DiagramNodePdf label="ESB DataPower" sub="Proxy SOAP" ip="VIP f5-vip-kong" color={c.red} width={120} />
              <Arrow label="SOAP" dir="down" color={c.red} />
              <DiagramNodePdf label="MOBI" sub="SI Facturation" color="#9333ea" width={100} />
            </View>
          </View>

          {/* Portails */}
          <View style={[s.diagramRow, { marginTop: 8, gap: 10 }]}>
            <DiagramNodePdf label="PortaWebUI" sub="Gestion dossiers (:8080)" color={c.purple} width={120} />
            <DiagramNodePdf label="PortaWs" sub="Web services (:4848)" color={c.purple} width={120} />
          </View>
        </View>

        {/* Legend */}
        <View style={s.legendRow}>
          {LEGEND_ITEMS.map((item) => (
            <View key={item.label} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: item.color }]} />
              <Text style={s.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.footer}>
          <Text>PNM App — Guide des Opérations</Text>
          <Text>Page 1 / 6</Text>
        </View>
      </Page>

      {/* PAGE 2 — Production Landscape & Flux */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Paysage Portabilité — Production</Text>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        <Text style={s.sectionSub}>Vue complète de l'environnement de production : du réseau opérateurs jusqu'au SI Facturation MOBI</Text>

        <View style={s.diagramContainer}>
          {/* External operators */}
          <View style={{ borderWidth: 0.5, borderColor: c.border, borderRadius: 4, padding: 8, backgroundColor: c.bg, marginBottom: 4 }}>
            <Text style={{ fontSize: 7, fontWeight: 'bold', color: c.grey, marginBottom: 4 }}>OPÉRATEURS EXTERNES</Text>
            <View style={[s.diagramRow, { gap: 4 }]}>
              {['Orange', 'SFR/Only', 'Dauphin', 'UTS', 'Free'].map((op) => (
                <DiagramNodePdf key={op} label={op} color={c.grey} width={75} />
              ))}
            </View>
          </View>

          <View style={{ alignItems: 'center' }}>
            <Arrow label="SFTP" dir="down" color={c.green} />
          </View>

          {/* BTCTF + HUB */}
          <View style={[s.diagramRow, { gap: 6 }]}>
            <DiagramNodePdf label="btctf" sub="Transfert fichiers" ip="172.24.119.70" color={c.green} width={130} />
            <Arrow dir="both" color={c.grey} />
            <DiagramNodePdf label="HUB" sub="hub.fwi.digicelgroup.local" color={c.grey} width={150} />
          </View>

          <View style={{ alignItems: 'center' }}>
            <Arrow label="SCP" dir="down" color={c.blue} />
          </View>

          {/* Infrastructure Porta */}
          <View style={{ borderWidth: 1, borderColor: c.primary, borderStyle: 'dashed', borderRadius: 4, padding: 10, marginBottom: 4 }}>
            <Text style={{ fontSize: 7, fontWeight: 'bold', color: c.primary, marginBottom: 6 }}>INFRASTRUCTURE PORTA DIGICEL</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 8 }}>
              {/* Sync + EMA */}
              <View style={{ alignItems: 'center', gap: 3 }}>
                <DiagramNodePdf label="vmqproportasync01" sub="Synchronisation" ip="172.24.119.69" color={c.blue} width={130} />
                <Text style={{ fontSize: 5.5, color: c.deepOrange }}>EMA/EMM ▼</Text>
                <DiagramNodePdf label="ema15-digicel" sub="EMA + EMM" color={c.deepOrange} width={110} />
              </View>

              <Arrow dir="both" color={c.orange} />

              {/* DB */}
              <View style={{ alignItems: 'center' }}>
                <DiagramNodePdf label="vmqproportawebdb01" sub="PortaDB (MySQL :3306)" ip="172.24.119.68" color={c.orange} width={140} />
              </View>

              <Arrow dir="right" color={c.purple} />

              {/* Portails */}
              <View style={{ alignItems: 'center', gap: 3 }}>
                <DiagramNodePdf label="PortaWebUI" sub="vmqproportaweb01" ip=":8080" color={c.purple} width={110} />
                <DiagramNodePdf label="PortaWs" sub="vmqproportaws01" ip=":4848" color={c.purple} width={110} />
              </View>
            </View>
          </View>

          <View style={{ alignItems: 'center' }}>
            <Arrow label="XML / SOAP" dir="down" color={c.red} />
          </View>

          {/* SI Facturation */}
          <View style={{ borderWidth: 0.5, borderColor: c.border, borderRadius: 4, padding: 8, backgroundColor: c.bg, marginBottom: 4 }}>
            <Text style={{ fontSize: 7, fontWeight: 'bold', color: c.grey, marginBottom: 4 }}>SI FACTURATION & SERVICES</Text>
            <View style={[s.diagramRow, { gap: 4 }]}>
              <DiagramNodePdf label="Micro Services" sub="vmqpromsbox01/02" ip="VIP: 172.24.119.36" color={c.cyan} width={115} />
              <Arrow dir="right" color={c.red} />
              <DiagramNodePdf label="ESB DataPower" sub="vmqprotopapi01/02" color={c.red} width={115} />
              <Arrow dir="right" color={c.red} />
              <DiagramNodePdf label="FrontEnd SOAP" sub="Digimqbillmobi0" color="#b91c1c" width={105} />
              <Arrow dir="right" color="#9333ea" />
              <DiagramNodePdf label="MOBI MCST" sub="vmqprombdb01" color="#9333ea" width={100} />
            </View>
          </View>

          {/* Users */}
          <View style={[s.diagramRow, { gap: 6, marginTop: 4 }]}>
            <DiagramNodePdf label="Points de vente" sub="rdp-pdvunipaas" color="#059669" width={110} />
            <DiagramNodePdf label="Custom Care" sub="rdp-ccarecrm" color="#059669" width={110} />
            <DiagramNodePdf label="FNR" sub="Fichier National Routage" color={c.grey} width={110} />
          </View>
        </View>

        {/* Legend */}
        <View style={s.legendRow}>
          {PROD_LEGEND.map((item) => (
            <View key={item.label} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: item.color }]} />
              <Text style={s.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.footer}>
          <Text>PNM App — Guide des Opérations</Text>
          <Text>Page 2 / 6</Text>
        </View>
      </Page>

      {/* PAGE 3 — Flux & Vacations */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Flux des échanges & Horaires</Text>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        {/* Flux des échanges */}
        <Text style={s.sectionTitle}>Flux des échanges</Text>
        <Text style={s.sectionSub}>Les 6 étapes du cycle de portabilité quotidien</Text>

        {FLUX_STEPS.map((step) => (
          <View key={step.step} style={s.stepRow}>
            <View style={s.stepCircle}>
              <Text style={s.stepNumber}>{step.step}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.stepTitle}>{step.title}</Text>
              <Text style={s.stepDesc}>{step.description}</Text>
              <Text style={s.stepServer}>Serveur : {step.server}</Text>
            </View>
          </View>
        ))}

        {/* Vacation schedule */}
        <Text style={s.sectionTitle}>Horaires des vacations</Text>
        <Text style={s.sectionSub}>Plages d'échange de fichiers inter-opérateurs</Text>

        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '20%' }]}>Vacation</Text>
            <Text style={[s.tableHeaderCell, { width: '18%' }]}>Plage d'échange</Text>
            <Text style={[s.tableHeaderCell, { width: '15%' }]}>Réception mail</Text>
            <Text style={[s.tableHeaderCell, { width: '47%' }]}>Description</Text>
          </View>
          {VACATION_SCHEDULE.map((v) => (
            <View key={v.name} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '20%', fontWeight: 'bold' }]}>{v.name}</Text>
              <Text style={[s.tableCell, { width: '18%', color: c.primary }]}>{v.time}</Text>
              <Text style={[s.tableCell, { width: '15%' }]}>{v.mailTime}</Text>
              <Text style={[s.tableCellLight, { width: '47%' }]}>{v.description}</Text>
            </View>
          ))}
        </View>

        {/* Operators */}
        <Text style={s.sectionTitle}>Opérateurs PNM</Text>
        <Text style={s.sectionSub}>Les 6 opérateurs participant aux échanges</Text>

        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '12%' }]}>Code</Text>
            <Text style={[s.tableHeaderCell, { width: '35%' }]}>Opérateur</Text>
            <Text style={[s.tableHeaderCell, { width: '53%' }]}>Rôle dans le fichier</Text>
          </View>
          {OPERATORS.map((op) => (
            <View key={op.code} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '12%' }]}>{op.code}</Text>
              <Text style={[s.tableCell, { width: '35%', fontWeight: 'bold' }]}>{op.name}</Text>
              <Text style={[s.tableCellLight, { width: '53%' }]}>{op.role}</Text>
            </View>
          ))}
        </View>

        <View style={s.footer}>
          <Text>PNM App — Guide des Opérations</Text>
          <Text>Page 3 / 6</Text>
        </View>
      </Page>

      {/* PAGE 4 — Servers */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Infrastructure — Serveurs</Text>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        <Text style={s.sectionTitle}>Serveurs de la portabilité</Text>
        <Text style={s.sectionSub}>Ensemble des serveurs impliqués dans le système PNM V3</Text>

        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '22%' }]}>Serveur</Text>
            <Text style={[s.tableHeaderCell, { width: '18%' }]}>Hostname</Text>
            <Text style={[s.tableHeaderCell, { width: '15%' }]}>IP</Text>
            <Text style={[s.tableHeaderCell, { width: '45%' }]}>Rôle</Text>
          </View>
          {[
            { name: 'vmqproportasync01', hostname: 'DigimqPortaSync01', ip: '172.24.119.69', role: 'Synchronisation fichiers inter-opérateurs. Contrôle, acquitte, archive les fichiers BTCTF.' },
            { name: 'vmqproportawebdb01', hostname: 'DigimqPortaWebdb', ip: '172.24.119.68', role: 'Base de données PortaDB + PortaWebDB (MySQL :3306). Serveur central de la portabilité.' },
            { name: 'btctf', hostname: 'BTCTF', ip: '172.24.119.70', role: 'Hub de transfert SFTP des fichiers PNMDATA/PNMSYNC avec les 5 opérateurs.' },
            { name: 'vmqproportaweb01', hostname: 'PortaWebUI / PortaWs', ip: '.71 / .72', role: 'Portails web Tomcat & Glassfish. PortaWebUI (:8080) et PortaWs (:4848).' },
            { name: 'vmqpromsbox01/02', hostname: 'Micro services', ip: 'VIP: .36', role: 'Micro services de portabilité. Traitements métier : bascule, valorisation, notifications.' },
            { name: 'ESB DataPower', hostname: 'vmqprotopapi01/02', ip: 'VIP Kong', role: 'Proxy ESB DataPower. Passerelle XML/SOAP entre Porta et MOBI.' },
            { name: 'HUB', hostname: 'hub.fwi.digicelgroup.local', ip: '—', role: 'Hub central Digicel FWI. Point d\'entrée réseau inter-opérateurs et BTCTF.' },
            { name: 'EMA / EMM', hostname: 'ema15-digicel', ip: '—', role: 'Serveur EMA (bascule) et EMM (valorisation). Mise à jour MOBI via EmaExtracteur/EmmExtracteur.' },
          ].map((srv) => (
            <View key={srv.name} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '22%', fontWeight: 'bold' }]}>{srv.name}</Text>
              <Text style={[s.tableCellLight, { width: '18%' }]}>{srv.hostname}</Text>
              <Text style={[s.tableCell, { width: '15%' }]}>{srv.ip}</Text>
              <Text style={[s.tableCellLight, { width: '45%' }]}>{srv.role}</Text>
            </View>
          ))}
        </View>

        {/* Quick reference */}
        <Text style={[s.sectionTitle, { marginTop: 20 }]}>Liens d'accès rapide</Text>

        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Service</Text>
            <Text style={[s.tableHeaderCell, { width: '40%' }]}>URL / Accès</Text>
            <Text style={[s.tableHeaderCell, { width: '35%' }]}>Description</Text>
          </View>
          {[
            { service: 'PortaWebUI', url: 'http://172.24.119.71:8080/PortaWebUi', desc: 'Gestion des dossiers de portabilité' },
            { service: 'PortaWs', url: 'http://172.24.119.72:8080/PortaWs', desc: 'Web services SOAP' },
            { service: 'GPMAG Portail', url: 'https://portail.gpmag.fr', desc: 'Portail GPMAG' },
            { service: 'Sync (SSH)', url: 'ssh 172.24.119.69', desc: 'Logs : /home/porta_pnmv3/PortaSync/log/' },
            { service: 'PortaDB (SSH)', url: 'ssh 172.24.119.68', desc: 'MySQL :3306, scripts : /home/porta/' },
          ].map((link) => (
            <View key={link.service} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '25%', fontWeight: 'bold' }]}>{link.service}</Text>
              <Text style={[s.tableCell, { width: '40%', color: c.primary }]}>{link.url}</Text>
              <Text style={[s.tableCellLight, { width: '35%' }]}>{link.desc}</Text>
            </View>
          ))}
        </View>

        {/* Contacts */}
        <Text style={[s.sectionTitle, { marginTop: 20 }]}>Contacts</Text>

        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Contact</Text>
            <Text style={[s.tableHeaderCell, { width: '35%' }]}>Email</Text>
            <Text style={[s.tableHeaderCell, { width: '40%' }]}>Rôle</Text>
          </View>
          {[
            { name: 'GPMAG (Secrétariat)', email: 'secretariat@gpmag.fr', role: 'Coordination inter-opérateurs, conflits, escalades' },
            { name: 'Supervision Digicel', email: 'supervision@digicelgroup.fr', role: 'Rapports automates, alertes serveur, incidents' },
            { name: 'Support N2 Porta', email: 'support.porta@digicelgroup.fr', role: 'Escalade incidents techniques, bugs applicatifs' },
          ].map((contact) => (
            <View key={contact.name} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '25%', fontWeight: 'bold' }]}>{contact.name}</Text>
              <Text style={[s.tableCell, { width: '35%' }]}>{contact.email}</Text>
              <Text style={[s.tableCellLight, { width: '40%' }]}>{contact.role}</Text>
            </View>
          ))}
        </View>

        <View style={s.footer}>
          <Text>PNM App — Guide des Opérations</Text>
          <Text>Page 4 / 6</Text>
        </View>
      </Page>

      {/* PAGE 5 — Vérifications quotidiennes */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Vérifications quotidiennes</Text>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        <View style={s.infoBox}>
          <Text style={s.infoText}>
            Chronologie des vérifications à effectuer chaque jour ouvré : contrôles serveur et emails de rapport. Chaque créneau regroupe les actions à réaliser dans l'ordre.
          </Text>
        </View>

        {DAILY_TIMELINE.map((slot) => (
          <View key={slot.time} style={{ marginBottom: 10 }} wrap={false}>
            {/* Time header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <View style={{ backgroundColor: c.primary, borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: c.white }}>{slot.time}</Text>
              </View>
              <View style={{ flex: 1, height: 0.5, backgroundColor: c.border, marginLeft: 6 }} />
            </View>

            {/* Items */}
            {slot.items.map((item, idx) => (
              <View key={idx} style={{ flexDirection: 'row', marginBottom: 3, paddingLeft: 4 }}>
                {/* Type indicator */}
                <View style={{ width: 50, flexDirection: 'row', alignItems: 'flex-start', gap: 2, paddingTop: 1 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.type === 'server' ? c.blue : (item.category ? CATEGORY_COLORS[item.category] || c.grey : c.grey), marginTop: 2 }} />
                  <Text style={{ fontSize: 6.5, color: c.light }}>{item.type === 'server' ? 'Serveur' : (item.category ? CATEGORY_LABELS[item.category] || '' : 'Mail')}</Text>
                </View>

                {/* Content */}
                <View style={{ flex: 1, paddingLeft: 4 }}>
                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: c.dark }}>{item.title}</Text>
                  <Text style={{ fontSize: 7.5, color: c.light, marginTop: 1 }}>{item.detail}</Text>
                  {item.check && (
                    <Text style={{ fontSize: 7, color: c.green, marginTop: 1 }}>✓ {item.check}</Text>
                  )}
                  {item.commands && item.commands.length > 0 && (
                    <View style={{ backgroundColor: '#F4F6F8', borderRadius: 2, padding: 3, marginTop: 2 }}>
                      {item.commands.map((cmd, ci) => (
                        <Text key={ci} style={{ fontSize: 6.5, fontFamily: 'Courier', color: c.dark }}>$ {cmd}</Text>
                      ))}
                    </View>
                  )}
                  {item.server && (
                    <Text style={{ fontSize: 6.5, color: c.primary, marginTop: 1 }}>Serveur : {item.server}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Legend */}
        <View style={[s.legendRow, { marginTop: 8 }]}>
          {[
            { color: c.blue, label: 'Contrôle serveur' },
            { color: c.green, label: 'Vacation' },
            { color: c.orange, label: 'Reporting' },
            { color: c.red, label: 'Incident' },
            { color: c.blue, label: 'Supervision' },
          ].map((item) => (
            <View key={item.label} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: item.color }]} />
              <Text style={s.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.footer}>
          <Text>PNM App — Guide des Opérations</Text>
          <Text>Page 5 / 6</Text>
        </View>
      </Page>

      {/* PAGE 6 — Scripts PNM & Logs */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Scripts PNM & Logs associés</Text>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        <View style={s.infoBox}>
          <Text style={s.infoText}>
            Liste des scripts exécutés par le crontab sur le serveur vmqproportasync01 (172.24.119.69). Chaque script génère un fichier de log dans /home/porta_pnmv3/PortaSync/log/. Ces logs sont essentiels pour vérifier le bon déroulement des traitements quotidiens.
          </Text>
        </View>

        {/* Scripts table */}
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '22%' }]}>Script</Text>
            <Text style={[s.tableHeaderCell, { width: '10%' }]}>Type</Text>
            <Text style={[s.tableHeaderCell, { width: '46%' }]}>Description</Text>
            <Text style={[s.tableHeaderCell, { width: '22%' }]}>Planification</Text>
          </View>
          {PNM_SCRIPTS.map((script) => (
            <View key={script.script} style={s.tableRow} wrap={false}>
              <View style={{ width: '22%' }}>
                <Text style={[s.tableCell, { fontWeight: 'bold', fontSize: 7.5 }]}>{script.script}</Text>
              </View>
              <View style={{ width: '10%' }}>
                <View style={{ backgroundColor: (SCRIPT_CATEGORY_COLORS[script.category] || c.grey) + '18', borderRadius: 2, paddingHorizontal: 3, paddingVertical: 1, alignSelf: 'flex-start' }}>
                  <Text style={{ fontSize: 6, color: SCRIPT_CATEGORY_COLORS[script.category] || c.grey, fontWeight: 'bold' }}>{script.category}</Text>
                </View>
              </View>
              <Text style={[s.tableCellLight, { width: '46%' }]}>{script.description}</Text>
              <Text style={[s.tableCellLight, { width: '22%', fontSize: 7 }]}>{script.schedule}</Text>
            </View>
          ))}
        </View>

        {/* Logs reference */}
        <Text style={s.sectionTitle}>Fichiers de logs</Text>
        <Text style={s.sectionSub}>Correspondance entre chaque script et son fichier de log. Tous les logs sont dans /home/porta_pnmv3/PortaSync/log/</Text>

        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Script</Text>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Fichier de log</Text>
            <Text style={[s.tableHeaderCell, { width: '50%' }]}>Commande de vérification</Text>
          </View>
          {PNM_SCRIPTS.map((script) => (
            <View key={script.script + '-log'} style={s.tableRow} wrap={false}>
              <Text style={[s.tableCell, { width: '25%', fontWeight: 'bold', fontSize: 7.5 }]}>{script.script}</Text>
              <Text style={[s.tableCell, { width: '25%', color: c.primary, fontSize: 7.5 }]}>{script.log}</Text>
              <View style={{ width: '50%', backgroundColor: '#F4F6F8', borderRadius: 2, padding: 2 }}>
                <Text style={{ fontSize: 6, fontFamily: 'Courier', color: c.dark }}>$ tail -n 15 {script.logPath}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Important notes */}
        <View style={[s.infoBox, { marginTop: 12, backgroundColor: '#FFF3E0', borderLeftColor: c.orange }]}>
          <Text style={[s.infoText, { fontWeight: 'bold', marginBottom: 3 }]}>Points importants</Text>
          <Text style={s.infoText}>• PnmDataAckManager.sh et PnmSyncAckManager.sh écrivent tous les deux dans le même fichier PnmAckManager.log</Text>
          <Text style={s.infoText}>• Vérifier systématiquement la présence de "Fin de Traitement" dans chaque log pour confirmer l'exécution complète</Text>
          <Text style={s.infoText}>• Vérifier "Check success" pour chaque opérateur dans les logs EmaExtracter et EmmExtracter</Text>
          <Text style={s.infoText}>• En cas d'anomalie, vérifier d'abord le log concerné avant d'escalader</Text>
        </View>

        {/* Legend */}
        <View style={[s.legendRow, { marginTop: 8 }]}>
          {Object.entries(SCRIPT_CATEGORY_COLORS).map(([label, color]) => (
            <View key={label} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: color }]} />
              <Text style={s.legendText}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={s.footer}>
          <Text>PNM App — Guide des Opérations</Text>
          <Text>Page 6 / 6</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── Export function ────────────────────────────────────────────────────────

export async function generateOperationsGuidePdf(): Promise<void> {
  const blob = await pdf(<OperationsGuidePdfDocument />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Guide-Operations-PNM-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
