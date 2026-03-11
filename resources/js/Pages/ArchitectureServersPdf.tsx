import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';

// ─── Fonts ───────────────────────────────────────────────────────────────────

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ],
});

// ─── Colors & Styles ─────────────────────────────────────────────────────────

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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 8, borderBottomWidth: 1.5, borderBottomColor: c.primary },
  headerTitle: { fontSize: 15, fontWeight: 'bold', color: c.primary },
  headerSub: { fontSize: 8, color: c.light },
  footer: { position: 'absolute', bottom: 25, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: c.light, borderTopWidth: 0.5, borderTopColor: c.border, paddingTop: 5 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: c.dark, marginTop: 14, marginBottom: 6 },
  sectionSub: { fontSize: 8, color: c.light, marginBottom: 8 },
  infoBox: { backgroundColor: '#E8F4FD', borderLeftWidth: 3, borderLeftColor: '#0288D1', padding: 10, marginBottom: 12, borderRadius: 3 },
  infoText: { fontSize: 8.5, lineHeight: 1.5 },
  table: { marginBottom: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: c.bg, borderBottomWidth: 1, borderBottomColor: c.border, paddingVertical: 5, paddingHorizontal: 4 },
  tableHeaderCell: { fontSize: 8, fontWeight: 'bold', color: c.dark },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: c.border, paddingVertical: 4, paddingHorizontal: 4 },
  tableCell: { fontSize: 8, color: c.dark },
  tableCellLight: { fontSize: 8, color: c.light },
  // Diagram
  diagramRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  diagramNode: { borderWidth: 1.5, borderRadius: 4, padding: 6, alignItems: 'center' },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendText: { fontSize: 6.5, color: c.light },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Node({ label, sub, ip, color, width = 100 }: { label: string; sub?: string; ip?: string; color: string; width?: number }) {
  return (
    <View style={[s.diagramNode, { borderColor: color, width }]}>
      <Text style={{ fontSize: 8, fontWeight: 'bold', color }}>{label}</Text>
      {sub && <Text style={{ fontSize: 6.5, color: c.light, marginTop: 1 }}>{sub}</Text>}
      {ip && <Text style={{ fontSize: 6, color: c.grey, marginTop: 1 }}>{ip}</Text>}
    </View>
  );
}

function Arrow({ label, dir = 'right', color = c.grey }: { label?: string; dir?: 'right' | 'down' | 'both'; color?: string }) {
  if (dir === 'down') {
    return (
      <View style={{ alignItems: 'center', marginVertical: 2 }}>
        {label && <Text style={{ fontSize: 5.5, color }}>{label}</Text>}
        <Text style={{ fontSize: 6, color }}>▼</Text>
      </View>
    );
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 3 }}>
      {dir === 'both' && <Text style={{ fontSize: 5, color }}>◄</Text>}
      <View style={{ width: 18, height: 1, backgroundColor: color }} />
      {label && <Text style={{ fontSize: 5.5, color, marginHorizontal: 1 }}>{label}</Text>}
      <View style={{ width: 18, height: 1, backgroundColor: color }} />
      <Text style={{ fontSize: 5, color }}>►</Text>
    </View>
  );
}

function ServerCard({ name, ip, role, apps, color, user }: { name: string; ip: string; role: string; apps: string[]; color: string; user?: string }) {
  return (
    <View style={{ borderWidth: 1, borderColor: color, borderRadius: 4, marginBottom: 8, overflow: 'hidden' }} wrap={false}>
      <View style={{ flexDirection: 'row', backgroundColor: color + '12', paddingVertical: 5, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: color, alignItems: 'center' }}>
        <Text style={{ fontSize: 10, fontWeight: 'bold', color, flex: 1 }}>{name}</Text>
        <Text style={{ fontSize: 8, color: c.light }}>{ip}</Text>
      </View>
      <View style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
        <Text style={{ fontSize: 8.5, color: c.dark, lineHeight: 1.4, marginBottom: 4 }}>{role}</Text>
        {user && (
          <Text style={{ fontSize: 7.5, color: c.primary, marginBottom: 3 }}>Connexion : ssh {user}@{ip}</Text>
        )}
        {apps.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
            {apps.map((app) => (
              <View key={app} style={{ backgroundColor: c.bg, borderWidth: 0.5, borderColor: c.border, borderRadius: 2, paddingHorizontal: 4, paddingVertical: 1 }}>
                <Text style={{ fontSize: 7, color: c.dark }}>{app}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

const PORTA_SERVERS = [
  {
    name: 'vmqproportasync01',
    ip: '172.24.119.69',
    hostname: 'DigimqPortaSync01',
    role: 'Serveur de synchronisation. Il est le coeur des échanges fichiers : il génère les fichiers de vacation PNMDATA pour chaque opérateur, récupère les fichiers reçus depuis BTCTF, les contrôle, les acquitte (ACR) et les archive. Il exécute aussi la bascule (EmaExtracter) et la valorisation (EmmExtracter).',
    apps: ['PnmDataManager', 'PnmAckManager', 'EmaExtracter', 'EmmExtracter', 'PnmSyncManager', 'synchro-pnmv3'],
    color: c.blue,
    user: 'porta_pnmv3',
    logs: '/home/porta_pnmv3/PortaSync/log/',
    paths: [
      'log/ — Logs de tous les scripts PNM',
      'pnmdata/01/ — Fichiers Orange Caraïbe (send/, recv/, arch_send/, arch_recv/)',
      'pnmdata/03/ — Fichiers SFR/Only',
      'pnmdata/04/ — Fichiers Dauphin Télécom',
      'pnmdata/05/ — Fichiers UTS Caraïbe',
      'pnmdata/06/ — Fichiers Free Caraïbe',
    ],
  },
  {
    name: 'vmqproportawebdb01',
    ip: '172.24.119.68',
    hostname: 'DigimqPortaWebdb',
    role: 'Serveur de base de données central. Il héberge les bases PortaDB (mandats, tickets, portabilités) et PortaWebDB (utilisateurs, configurations portail). MySQL sur le port 3306. Contient aussi les scripts de restitution et d\'export.',
    apps: ['MySQL :3306', 'PortaDB', 'PortaWebDB', 'Scripts export'],
    color: c.orange,
    user: 'porta_pnmv3',
    logs: '',
    paths: [],
  },
  {
    name: 'BTCTF',
    ip: '172.24.119.70',
    hostname: 'BTCTF',
    role: 'Bouygues Telecom Caraïbe Transfer File. Hub central d\'échange de fichiers via SFTP. Digicel et les 5 opérateurs y déposent et récupèrent les fichiers PNMDATA et PNMSYNC. vmqproportasync01 communique avec BTCTF par SCP.',
    apps: ['SFTP', 'SCP', 'Échange fichiers'],
    color: c.green,
    user: '',
    logs: '',
    paths: [],
  },
  {
    name: 'vmqproportaweb01',
    ip: '172.24.119.71',
    hostname: 'DigimqPortaWeb01',
    role: 'Serveur applicatif hébergeant PortaWebUi (portail CDC) sous Tomcat. Les Chargés De Clientèle (CDC) y consultent les mandats et l\'historique. Le HUB, le WebStore et Wizzee appellent le webservice PortaUiWs4Esb hébergé sur ce serveur pour créer les mandats de portage.',
    apps: ['Tomcat 9', 'PortaWebUi (:8080)', 'PortaUiWs4Esb (WSDL)'],
    color: c.purple,
    user: 'porta_pnmv3',
    logs: '/opt/tomcat9/logs/catalina.out',
    paths: [],
  },
  {
    name: 'vmqproportaws01',
    ip: '172.24.119.72',
    hostname: 'DigimqPortaWs01',
    role: 'Serveur applicatif hébergeant PortaWs (portail administrateur) sous Tomcat. Utilisé par l\'équipe APPLI pour l\'administration : saisie de portabilités, gestion des erreurs, clôture manuelle. Héberge les webservices PortaWs4Esb et PortaWs4PortaSync.',
    apps: ['Tomcat 9', 'PortaWs (:8080)', 'PortaWs4Esb (WSDL)', 'PortaWs4PortaSync (WSDL)'],
    color: c.purple,
    user: 'porta_pnmv3',
    logs: '/opt/tomcat9/logs/catalina.out',
    paths: [],
  },
  {
    name: 'EMA15-Digicel',
    ip: '172.24.119.140',
    hostname: 'ema15-digicel',
    role: 'Serveur EMA (Ericsson Mobile Application). Gère le FNR (Fichier National de Routage) qui permet d\'acheminer les appels vers le bon opérateur après un portage. Après la bascule quotidienne, le fichier de mise à jour du FNR est exécuté ici via un batchhandler en telnet.',
    apps: ['FNR', 'batchhandler', 'Telnet :3333'],
    color: c.deepOrange,
    user: 'batchuser',
    logs: '~/LogFiles/',
    paths: [],
  },
];

const WEBSERVICES = [
  { ws: 'PortaUiWs4Esb', server: 'vmqproportaweb01', url: 'http://172.24.119.71:8080/PortaWebUi/DigicelFwiPortaUiWs4Esb?wsdl', callers: 'HUB, WebStore, Wizzee', purpose: 'Création des mandats de portage depuis les CDC' },
  { ws: 'PortaWs4Esb', server: 'vmqproportaws01', url: 'http://172.24.119.72:8080/PortaWs/DigicelFwiPortaWs4Esb?wsdl', callers: 'PortaWebUi', purpose: 'Traitement des demandes de portabilité' },
  { ws: 'PortaWs4PortaSync', server: 'vmqproportaws01', url: 'http://172.24.119.72:8080/PortaWs/DigicelFwiPortaWs4PortaSync?wsdl', callers: 'vmqproportasync01', purpose: 'Traitement interne : intégration fichiers et tickets' },
  { ws: 'DigicelFwiEsbWs4Porta', server: 'ESB DataProxy', url: 'http://172.24.116.76:8000/.../DigicelFwiEsbWs4Porta.wsdl', callers: 'DAPI', purpose: 'Transmission des événements DAPI vers Porta' },
];

const INTERACTIONS = [
  { from: 'CDC (via HUB)', to: 'vmqproportaweb01', protocol: 'SOAP', desc: 'Les CDC saisissent un mandat de portage via le HUB → appel SOAP au WS PortaUiWs4Esb' },
  { from: 'vmqproportaweb01', to: 'vmqproportaws01', protocol: 'SOAP', desc: 'PortaWebUi transmet la demande à PortaWs4Esb pour traitement et enregistrement dans PortaDB' },
  { from: 'vmqproportaws01', to: 'vmqproportawebdb01', protocol: 'MySQL', desc: 'PortaWs lit/écrit les mandats, tickets et portabilités dans PortaDB (MySQL :3306)' },
  { from: 'vmqproportasync01', to: 'BTCTF', protocol: 'SCP', desc: 'Les fichiers PNMDATA générés sont copiés vers BTCTF qui les distribue aux opérateurs via SFTP' },
  { from: 'BTCTF', to: 'vmqproportasync01', protocol: 'SCP', desc: 'Les fichiers PNMDATA des opérateurs sont récupérés depuis BTCTF pour contrôle et intégration' },
  { from: 'vmqproportasync01', to: 'vmqproportaws01', protocol: 'SOAP', desc: 'Après intégration des fichiers, appel SOAP à PortaWs4PortaSync pour créer les tickets dans PortaDB' },
  { from: 'vmqproportasync01', to: 'EMA15-Digicel', protocol: 'Fichier', desc: 'Après la bascule, le fichier FNR est transmis à EMA pour mise à jour du routage des appels' },
  { from: 'vmqproportasync01', to: 'ESB DataPower', protocol: 'SOAP', desc: 'Bascule (EmaExtracter) et valorisation (EmmExtracter) envoient les mises à jour au SI MOBI via l\'ESB' },
];

const INTEG_SERVERS = [
  { name: 'vmqportapresync01', role: 'Serveur de synchro (équivalent de vmqproportasync01 en intégration)' },
  { name: 'vmqportaprewebdb01', role: 'Héberge les 2 applications web, les webservices et les bases de données (intégration)' },
];

const USEFUL_URLS = [
  { service: 'PortaWebUi (CDC)', url: 'http://172.24.119.71:8080/PortaWebUi/', env: 'PROD' },
  { service: 'PortaWs (Admin)', url: 'http://172.24.119.72:8080/PortaWs/', env: 'PROD' },
  { service: 'PortaWebUi (Intégration)', url: 'http://172.24.114.86:8080/PortaWebUi/', env: 'INT' },
  { service: 'Tomcat Manager (PortaWs)', url: 'http://172.24.119.72:8080/manager/html', env: 'PROD' },
  { service: 'Tomcat Manager (PortaWebUi)', url: 'http://172.24.119.71:8080/manager/html', env: 'PROD' },
  { service: 'Nagios vmqproportaweb01', url: 'http://digimqmon05/nagios/cgi-bin/extinfo.cgi?type=1&host=vmqproportaweb01', env: 'Monitoring' },
  { service: 'Nagios vmqproportaws01', url: 'http://digimqmon05/nagios/cgi-bin/extinfo.cgi?type=1&host=vmqproportaws01', env: 'Monitoring' },
  { service: 'Supervision DSI', url: 'http://172.24.114.165/OCS/SupervisionDSI_WD.php', env: 'Monitoring' },
  { service: 'Génération RIO en masse', url: 'http://digimqapi01.fwi.digicelgroup.local/porta/accueil_rio.html', env: 'Outil' },
  { service: 'Secret Server', url: 'https://vmqpropass01', env: 'Sécurité' },
];

// ─── PDF Document ────────────────────────────────────────────────────────────

function ArchitectureServersPdfDocument() {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Document>
      {/* ── PAGE 1 : Introduction + Vue d'ensemble ── */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Architecture des Serveurs PNM</Text>
            <Text style={s.headerSub}>Portabilité des Numéros Mobiles V3 — Digicel Antilles-Guyane — Guide débutant</Text>
          </View>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        <View style={s.infoBox}>
          <Text style={s.infoText}>
            Ce document décrit les serveurs impliqués dans le système de Portabilité des Numéros Mobiles (PNM) V3 de Digicel Antilles-Guyane. Il détaille le rôle de chaque serveur, les applications qu{"'"}il héberge, et comment les serveurs communiquent entre eux. Tous les identifiants/mots de passe sont stockés sur le Secret Server : https://vmqpropass01
          </Text>
        </View>

        {/* Schéma simplifié */}
        <Text style={s.sectionTitle}>Vue d{"'"}ensemble — Comment les serveurs communiquent</Text>
        <Text style={s.sectionSub}>Flux simplifié : des opérateurs jusqu{"'"}au SI Facturation</Text>

        <View style={{ marginBottom: 10 }}>
          {/* Operators */}
          <View style={{ borderWidth: 0.5, borderColor: c.border, borderRadius: 4, padding: 8, backgroundColor: '#F8FAFC', marginBottom: 4 }}>
            <Text style={{ fontSize: 7, fontWeight: 'bold', color: c.grey, marginBottom: 4 }}>5 OPÉRATEURS ANTILLES-GUYANE</Text>
            <View style={[s.diagramRow, { gap: 4 }]}>
              {['01 Orange', '03 SFR/Only', '04 Dauphin', '05 UTS', '06 Free'].map((op) => (
                <Node key={op} label={op} color={c.grey} width={78} />
              ))}
            </View>
          </View>

          <View style={{ alignItems: 'center' }}>
            <Arrow label="SFTP (dépôt/récupération fichiers)" dir="both" color={c.green} />
          </View>

          {/* BTCTF */}
          <View style={s.diagramRow}>
            <Node label="BTCTF" sub="Hub transfert fichiers" ip="172.24.119.70" color={c.green} width={180} />
          </View>

          <View style={{ alignItems: 'center' }}>
            <Arrow label="SCP (copie fichiers)" dir="both" color={c.blue} />
          </View>

          {/* Infra Porta */}
          <View style={{ borderWidth: 1, borderColor: c.primary, borderStyle: 'dashed', borderRadius: 4, padding: 10, marginBottom: 4 }}>
            <Text style={{ fontSize: 7, fontWeight: 'bold', color: c.primary, marginBottom: 6 }}>INFRASTRUCTURE PORTA DIGICEL (6 serveurs)</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 6 }}>
              {/* Left: Sync */}
              <View style={{ alignItems: 'center', gap: 3 }}>
                <Node label="vmqproportasync01" sub="Synchronisation" ip="172.24.119.69" color={c.blue} width={130} />
              </View>

              <Arrow dir="both" label="SOAP" color={c.orange} />

              {/* Center: DB */}
              <View style={{ alignItems: 'center' }}>
                <Node label="vmqproportawebdb01" sub="Base de données MySQL" ip="172.24.119.68" color={c.orange} width={140} />
              </View>

              <Arrow dir="both" color={c.purple} />

              {/* Right: Portails */}
              <View style={{ alignItems: 'center', gap: 3 }}>
                <Node label="vmqproportaweb01" sub="PortaWebUi (CDC)" ip="172.24.119.71" color={c.purple} width={120} />
                <Node label="vmqproportaws01" sub="PortaWs (Admin)" ip="172.24.119.72" color={c.purple} width={120} />
              </View>
            </View>

            {/* EMA below sync */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginTop: 6, paddingLeft: 30 }}>
              <View style={{ alignItems: 'center' }}>
                <Arrow label="Fichier FNR" dir="down" color={c.deepOrange} />
                <Node label="EMA15-Digicel" sub="Routage FNR" ip="172.24.119.140" color={c.deepOrange} width={120} />
              </View>
            </View>
          </View>

          <View style={{ alignItems: 'center' }}>
            <Arrow label="XML/SOAP (bascule, valorisation)" dir="down" color={c.red} />
          </View>

          {/* SI */}
          <View style={{ borderWidth: 0.5, borderColor: c.border, borderRadius: 4, padding: 6, backgroundColor: '#F8FAFC' }}>
            <Text style={{ fontSize: 7, fontWeight: 'bold', color: c.grey, marginBottom: 3 }}>SI FACTURATION</Text>
            <View style={[s.diagramRow, { gap: 4 }]}>
              <Node label="ESB DataPower" sub="Proxy SOAP" color={c.red} width={100} />
              <Arrow dir="right" color={c.red} />
              <Node label="MOBI" sub="Facturation" color="#9333ea" width={80} />
            </View>
          </View>
        </View>

        {/* Legend */}
        <View style={s.legendRow}>
          {[
            { color: c.green, label: 'SFTP / SCP (fichiers)' },
            { color: c.blue, label: 'Synchronisation' },
            { color: c.orange, label: 'Base de données' },
            { color: c.purple, label: 'Portails Web' },
            { color: c.deepOrange, label: 'EMA / FNR' },
            { color: c.red, label: 'ESB / SOAP' },
          ].map((item) => (
            <View key={item.label} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: item.color }]} />
              <Text style={s.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.footer}>
          <Text>PNM App — Architecture des Serveurs</Text>
          <Text>Page 1 / 6</Text>
        </View>
      </Page>

      {/* ── PAGE 2 : Détail de chaque serveur PROD ── */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Serveurs de Production — Détail</Text>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        <View style={s.infoBox}>
          <Text style={s.infoText}>
            Chaque serveur est accessible en SSH avec l{"'"}utilisateur indiqué. La section "PORTA" dans mRemoteNG regroupe tous ces serveurs. Se référer au Secret Server pour les mots de passe.
          </Text>
        </View>

        {PORTA_SERVERS.slice(0, 4).map((srv) => (
          <ServerCard key={srv.name} name={srv.name} ip={srv.ip} role={srv.role} apps={srv.apps} color={srv.color} user={srv.user || undefined} />
        ))}

        <View style={s.footer}>
          <Text>PNM App — Architecture des Serveurs</Text>
          <Text>Page 2 / 6</Text>
        </View>
      </Page>

      {/* ── PAGE 3 : Suite serveurs + Arborescence ── */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Serveurs de Production — Suite</Text>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        {PORTA_SERVERS.slice(4).map((srv) => (
          <ServerCard key={srv.name} name={srv.name} ip={srv.ip} role={srv.role} apps={srv.apps} color={srv.color} user={srv.user || undefined} />
        ))}

        {/* Arborescence sync01 */}
        <Text style={s.sectionTitle}>Arborescence sur vmqproportasync01</Text>
        <Text style={s.sectionSub}>Répertoire principal : /home/porta_pnmv3/PortaSync/</Text>

        <View style={{ backgroundColor: '#1E293B', borderRadius: 4, padding: 10, marginBottom: 10 }}>
          {[
            '~/PortaSync/',
            '  ├── log/                          ← Logs de tous les scripts PNM',
            '  │   ├── EmaExtracter.log           (bascule)',
            '  │   ├── EmmExtracter.log           (valorisation)',
            '  │   ├── PnmDataManager.log         (génération fichiers vacation)',
            '  │   └── PnmAckManager.log          (acquittements)',
            '  ├── pnmdata/',
            '  │   ├── 01/                        ← Orange Caraïbe',
            '  │   │   ├── send/                  fichiers à envoyer',
            '  │   │   ├── arch_send/             fichiers envoyés (archivés)',
            '  │   │   ├── recv/                  fichiers reçus (en attente)',
            '  │   │   └── arch_recv/             fichiers reçus (archivés)',
            '  │   ├── 03/                        ← SFR / Only',
            '  │   ├── 04/                        ← Dauphin Télécom',
            '  │   ├── 05/                        ← UTS Caraïbe',
            '  │   └── 06/                        ← Free Caraïbe',
            '  ├── PnmDataManager_oc.sh           relance vacation Orange',
            '  ├── PnmDataManager_sfrc.sh         relance vacation SFR',
            '  ├── PnmDataManager_dt.sh           relance vacation Dauphin',
            '  ├── PnmDataManager_uts.sh          relance vacation UTS',
            '  └── PnmDataManager_freec.sh        relance vacation Free',
          ].map((line, i) => (
            <Text key={i} style={{ fontSize: 7.5, fontFamily: 'Courier', color: line.startsWith('~') ? '#22D3EE' : '#CBD5E1', lineHeight: 1.5 }}>{line}</Text>
          ))}
        </View>

        {/* Intégration */}
        <Text style={s.sectionTitle}>Environnement d{"'"}intégration</Text>
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '35%' }]}>Serveur</Text>
            <Text style={[s.tableHeaderCell, { width: '65%' }]}>Rôle</Text>
          </View>
          {INTEG_SERVERS.map((srv) => (
            <View key={srv.name} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '35%', fontWeight: 'bold' }]}>{srv.name}</Text>
              <Text style={[s.tableCellLight, { width: '65%' }]}>{srv.role}</Text>
            </View>
          ))}
        </View>

        <View style={s.footer}>
          <Text>PNM App — Architecture des Serveurs</Text>
          <Text>Page 3 / 6</Text>
        </View>
      </Page>

      {/* ── PAGE 4 : Webservices + Interactions ── */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Webservices SOAP & Interactions</Text>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        <View style={s.infoBox}>
          <Text style={s.infoText}>
            Pour vérifier qu{"'"}un webservice répond : curl -s [URL] | head -5. Si le résultat contient {"<"}definitions{">"}, le WS est opérationnel. Si timeout : Tomcat est probablement arrêté sur le serveur.
          </Text>
        </View>

        <Text style={s.sectionTitle}>Webservices SOAP</Text>
        <Text style={s.sectionSub}>Les 4 webservices du système PNM et leurs appelants</Text>

        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '18%' }]}>Webservice</Text>
            <Text style={[s.tableHeaderCell, { width: '16%' }]}>Serveur</Text>
            <Text style={[s.tableHeaderCell, { width: '15%' }]}>Appelé par</Text>
            <Text style={[s.tableHeaderCell, { width: '51%' }]}>Rôle</Text>
          </View>
          {WEBSERVICES.map((ws) => (
            <View key={ws.ws} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '18%', fontWeight: 'bold', color: c.primary }]}>{ws.ws}</Text>
              <Text style={[s.tableCell, { width: '16%' }]}>{ws.server}</Text>
              <Text style={[s.tableCell, { width: '15%', color: c.blue }]}>{ws.callers}</Text>
              <Text style={[s.tableCellLight, { width: '51%' }]}>{ws.purpose}</Text>
            </View>
          ))}
        </View>

        {/* Chaîne d'appel */}
        <View style={[s.infoBox, { backgroundColor: '#F0FDF4', borderLeftColor: c.green }]}>
          <Text style={[s.infoText, { fontWeight: 'bold', marginBottom: 3 }]}>Chaîne d{"'"}appel pour une nouvelle portabilité :</Text>
          <Text style={s.infoText}>CDC (HUB) → PortaUiWs4Esb (vmqproportaweb01) → PortaWs4Esb (vmqproportaws01) → PortaDB (vmqproportawebdb01)</Text>
          <Text style={[s.infoText, { marginTop: 2, color: c.light }]}>Si un maillon est cassé, aucune nouvelle portabilité ne peut être saisie. Tester chaque WS avec curl pour isoler le problème.</Text>
        </View>

        <Text style={s.sectionTitle}>Interactions entre serveurs</Text>
        <Text style={s.sectionSub}>Qui communique avec qui, et comment</Text>

        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '18%' }]}>De</Text>
            <Text style={[s.tableHeaderCell, { width: '18%' }]}>Vers</Text>
            <Text style={[s.tableHeaderCell, { width: '10%' }]}>Proto</Text>
            <Text style={[s.tableHeaderCell, { width: '54%' }]}>Description</Text>
          </View>
          {INTERACTIONS.map((inter, i) => (
            <View key={i} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '18%', fontWeight: 'bold' }]}>{inter.from}</Text>
              <Text style={[s.tableCell, { width: '18%', color: c.primary }]}>{inter.to}</Text>
              <Text style={[s.tableCell, { width: '10%', color: inter.protocol === 'SOAP' ? c.red : inter.protocol === 'SCP' ? c.blue : inter.protocol === 'MySQL' ? c.orange : c.deepOrange }]}>{inter.protocol}</Text>
              <Text style={[s.tableCellLight, { width: '54%' }]}>{inter.desc}</Text>
            </View>
          ))}
        </View>

        <View style={s.footer}>
          <Text>PNM App — Architecture des Serveurs</Text>
          <Text>Page 4 / 6</Text>
        </View>
      </Page>

      {/* ── PAGE 5 : URLs utiles + mRemoteNG ── */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.headerTitle}>URLs utiles & Connexions</Text>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        <Text style={s.sectionTitle}>URLs d{"'"}accès</Text>

        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Service</Text>
            <Text style={[s.tableHeaderCell, { width: '55%' }]}>URL</Text>
            <Text style={[s.tableHeaderCell, { width: '20%' }]}>Environnement</Text>
          </View>
          {USEFUL_URLS.map((link) => (
            <View key={link.service} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '25%', fontWeight: 'bold' }]}>{link.service}</Text>
              <Text style={[s.tableCell, { width: '55%', color: c.primary, fontSize: 7 }]}>{link.url}</Text>
              <Text style={[s.tableCellLight, { width: '20%' }]}>{link.env}</Text>
            </View>
          ))}
        </View>

        {/* mRemoteNG tree */}
        <Text style={s.sectionTitle}>Arborescence mRemoteNG — Section PORTA</Text>
        <Text style={s.sectionSub}>Structure des connexions dans mRemoteNG (outil de gestion des sessions SSH/RDP)</Text>

        <View wrap={false} style={{ backgroundColor: '#1E293B', borderRadius: 4, padding: 10, marginBottom: 10 }}>
          {[
            'PORTA',
            '  digimqema01           — OLD EMA (ancien serveur EMA)',
            '  EMA15-Digicel         — EMA (routage FNR, 172.24.119.140)',
            '  vmqproportasync01     — SYNC (synchronisation, 172.24.119.69)',
            '  vmqproportawebdb01    — Base de données (MySQL, 172.24.119.68)',
            '  vmqproportaweb01      — WebUi (portail CDC, 172.24.119.71)',
            '  vmqportapresync01     — Intégration : synchro',
            '  vmqportaprewebdb01    — Intégration : DB + portails',
            '  vmqproportaws01       — Ws (admin + webservices, 172.24.119.72)',
            '  BTCTF                 — Hub transfert fichiers (172.24.119.70)',
          ].map((line, i) => (
            <Text key={i} style={{ fontSize: 7.5, fontFamily: 'Courier', color: line.startsWith('  ') ? '#CBD5E1' : '#22D3EE', lineHeight: 1.6 }}>{line}</Text>
          ))}
        </View>

        <View style={s.footer}>
          <Text>PNM App — Architecture des Serveurs</Text>
          <Text>Page 5 / 6</Text>
        </View>
      </Page>

      {/* ── PAGE 6 : Aide-mémoire SSH + Ressources ── */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Aide-mémoire & Ressources</Text>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        <Text style={s.sectionTitle}>Aide-mémoire — Connexions SSH rapides</Text>

        <View wrap={false} style={{ backgroundColor: '#1E293B', borderRadius: 4, padding: 10, marginBottom: 10 }}>
          {[
            '# Synchronisation (logs, fichiers, scripts vacation)',
            'ssh porta_pnmv3@172.24.119.69',
            '',
            '# Base de données (MySQL)',
            'ssh porta_pnmv3@172.24.119.68',
            '',
            '# PortaWebUi — logs Tomcat',
            'ssh porta_pnmv3@172.24.119.71',
            'tail -n 50 /opt/tomcat9/logs/catalina.out',
            '',
            '# PortaWs — logs Tomcat',
            'ssh porta_pnmv3@172.24.119.72',
            'tail -n 50 /opt/tomcat9/logs/catalina.out',
            '',
            '# EMA — vérifier FNR',
            'ssh batchuser@172.24.119.140',
            'cd LogFiles/ && ls -lt | head -5',
          ].map((line, i) => (
            <Text key={i} style={{ fontSize: 7.5, fontFamily: 'Courier', color: line.startsWith('#') ? '#6EE7B7' : line === '' ? '#1E293B' : '#CBD5E1', lineHeight: 1.5 }}>{line || ' '}</Text>
          ))}
        </View>

        <View wrap={false} style={[s.infoBox, { backgroundColor: '#FFF3E0', borderLeftColor: c.orange }]}>
          <Text style={[s.infoText, { fontWeight: 'bold', marginBottom: 3 }]}>Ressources complémentaires</Text>
          <Text style={s.infoText}>• Partage réseau : \\mqfiles002.digicelgroup.local\Services\DRSI\DSI\APPLICATION\Domaines\Portabilité</Text>
          <Text style={s.infoText}>• SharePoint incidents : https://digicelja.sharepoint.com/.../Gestion des incidents/Portails DAPI indisponibles.aspx</Text>
          <Text style={s.infoText}>• Source : APP_OCS_ProcéduresProduction (1 à 4) — OneNote FWI IT App</Text>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Architecture des Serveurs</Text>
          <Text>Page 6 / 6</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── Export ──────────────────────────────────────────────────────────────────

export async function generateArchitectureServersPdf(): Promise<void> {
  const blob = await pdf(<ArchitectureServersPdfDocument />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Architecture-Serveurs-PNM-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
