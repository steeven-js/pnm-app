import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';

// ─── Font registration ──────────────────────────────────────────────────────

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ],
});

// ─── Colors ─────────────────────────────────────────────────────────────────

const c = {
  primary: '#00A76F',
  blue: '#2563eb',
  orange: '#d97706',
  green: '#16a34a',
  red: '#dc2626',
  grey: '#6b7280',
  dark: '#212B36',
  light: '#637381',
  bg: '#F9FAFB',
  white: '#FFFFFF',
  border: '#E5E8EB',
  purple: '#7c3aed',
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: { padding: 36, fontFamily: 'Helvetica', fontSize: 8.5, color: c.dark },
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1.5, borderBottomColor: c.primary },
  headerTitle: { fontSize: 13, fontWeight: 'bold', color: c.primary },
  headerSub: { fontSize: 7.5, color: c.light },
  headerRight: { fontSize: 7, color: c.light, textAlign: 'right' },
  // Footer
  footer: { position: 'absolute', bottom: 22, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between', fontSize: 6.5, color: c.light, borderTopWidth: 0.5, borderTopColor: c.border, paddingTop: 4 },
  // Section
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: c.dark, marginTop: 12, marginBottom: 5, borderBottomWidth: 0.5, borderBottomColor: c.border, paddingBottom: 3 },
  subTitle: { fontSize: 9.5, fontWeight: 'bold', color: c.blue, marginTop: 8, marginBottom: 4 },
  // Alerts
  alertInfo: { backgroundColor: '#E8F4FD', borderLeftWidth: 3, borderLeftColor: c.blue, padding: 7, marginBottom: 8, borderRadius: 2 },
  alertWarning: { backgroundColor: '#FFF8E1', borderLeftWidth: 3, borderLeftColor: c.orange, padding: 7, marginBottom: 8, borderRadius: 2 },
  alertError: { backgroundColor: '#FEEBEE', borderLeftWidth: 3, borderLeftColor: c.red, padding: 7, marginBottom: 8, borderRadius: 2 },
  alertSuccess: { backgroundColor: '#E8F5E9', borderLeftWidth: 3, borderLeftColor: c.green, padding: 7, marginBottom: 8, borderRadius: 2 },
  alertTitle: { fontSize: 8, fontWeight: 'bold', marginBottom: 2 },
  alertText: { fontSize: 7.5, lineHeight: 1.5 },
  // Body
  body: { fontSize: 8, lineHeight: 1.5, color: c.dark, marginBottom: 4 },
  bold: { fontWeight: 'bold' },
  mono: { fontFamily: 'Courier', fontSize: 7 },
  // Table
  tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderBottomWidth: 1, borderBottomColor: c.border, paddingVertical: 3, paddingHorizontal: 3 },
  tableHeaderCell: { fontSize: 7, fontWeight: 'bold', color: c.dark },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: c.border, paddingVertical: 2.5, paddingHorizontal: 3 },
  tableCell: { fontSize: 7.5, color: c.dark },
  tableCellBold: { fontSize: 7.5, color: c.dark, fontWeight: 'bold' },
  tableCellMono: { fontSize: 6.5, fontFamily: 'Courier', color: c.dark },
  // Code
  codeBlock: { backgroundColor: '#1e293b', borderRadius: 3, padding: 7, marginVertical: 5 },
  codeText: { fontSize: 7, fontFamily: 'Courier', color: '#e2e8f0', lineHeight: 1.4 },
  codeComment: { fontSize: 7, fontFamily: 'Courier', color: '#22c55e', lineHeight: 1.4 },
  codeHighlight: { fontSize: 7, fontFamily: 'Courier', color: '#fbbf24', lineHeight: 1.4 },
  // List
  listItem: { flexDirection: 'row', marginBottom: 2 },
  listBullet: { width: 10, fontSize: 7.5, color: c.dark },
  listText: { flex: 1, fontSize: 7.5, lineHeight: 1.5 },
  // Checkbox
  checkbox: { flexDirection: 'row', marginBottom: 2 },
  checkboxBox: { width: 8, height: 8, borderWidth: 0.5, borderColor: c.grey, marginRight: 5, marginTop: 1 },
  checkboxText: { flex: 1, fontSize: 7.5, lineHeight: 1.5, color: c.light },
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function PageHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <View style={s.header}>
      <View>
        <Text style={s.headerTitle}>{title}</Text>
        <Text style={s.headerSub}>{sub}</Text>
      </View>
      <View>
        <Text style={s.headerRight}>PNM App — MOBI CRM</Text>
        <Text style={s.headerRight}>Documentation interne</Text>
      </View>
    </View>
  );
}

function PageFooter({ title, page, total }: { title: string; page: number; total: number }) {
  return (
    <View style={s.footer}>
      <Text>{title}</Text>
      <Text>Page {page} / {total}</Text>
    </View>
  );
}

function Checkbox({ text }: { text: string }) {
  return (
    <View style={s.checkbox}>
      <View style={s.checkboxBox} />
      <Text style={s.checkboxText}>{text}</Text>
    </View>
  );
}

// ─── Fiche 1 : Architecture ─────────────────────────────────────────────────

function Fiche1Architecture() {
  return (
    <>
      <Page size="A4" style={s.page}>
        <PageHeader title="Fiche #1 — Architecture technique" sub="MOBI CRM — Niveau 1 Fondations — 13/03/2026" />

        <View style={s.alertInfo}>
          <Text style={s.alertTitle}>Vue d{"'"}ensemble</Text>
          <Text style={s.alertText}>L{"'"}architecture MOBI repose sur un modele ESB (Enterprise Service Bus) avec un point central : le <Text style={s.bold}>DataPower Proxy (Spring Boot)</Text>. Les requetes transitent par 4 couches : Applications → Proxy → Microservices → Backends.</Text>
        </View>

        <Text style={s.sectionTitle}>Les 4 couches</Text>
        <View style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 3, marginBottom: 8 }}>
          <Text style={{ ...s.body, fontFamily: 'Courier', fontSize: 7.5 }}>
            [Applications clientes]{'\n'}
            {'     '}| REST/JSON (ou SOAP/XML pour DAPI){'\n'}
            {'     '}v{'\n'}
            [DataPower Proxy — Spring Boot]{'\n'}
            {'     '}| REST/JSON{'\n'}
            {'     '}v{'\n'}
            [Microservices MOBI]{'\n'}
            {'     '}| SQL direct ou SOAP/XML{'\n'}
            {'     '}v{'\n'}
            [Backends : MasterCRM DB, WS externes]
          </Text>
        </View>

        <Text style={s.sectionTitle}>DataPower Proxy (Spring Boot)</Text>
        <Text style={s.body}><Text style={s.bold}>Role :</Text> Aiguilleur central — recoit toutes les requetes et les route vers le bon microservice.</Text>
        <Text style={s.body}><Text style={s.bold}>Serveurs :</Text> vmqprotodapi01 / vmqprotodapi02 — <Text style={s.bold}>VIP :</Text> f5-vip-kong (load balancing F5)</Text>
        <Text style={s.body}><Text style={s.bold}>Entrant :</Text> REST/JSON (apps) ou SOAP/XML (DAPI) — <Text style={s.bold}>Sortant :</Text> REST/JSON (vers MS)</Text>

        <Text style={s.sectionTitle}>XToolWS (Java/Glassfish)</Text>
        <Text style={s.body}>Intermediaire utilise par le DataPower Proxy pour certains routages. Logs envoyes dans <Text style={s.bold}>Graylog</Text>.</Text>

        <Text style={s.sectionTitle}>Protocoles</Text>
        <View style={{ marginVertical: 4 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Protocole</Text>
            <Text style={[s.tableHeaderCell, { width: '40%' }]}>Utilise par</Text>
            <Text style={[s.tableHeaderCell, { width: '35%' }]}>Direction</Text>
          </View>
          <View style={s.tableRow}>
            <Text style={[s.tableCellBold, { width: '25%', color: c.blue }]}>REST/JSON</Text>
            <Text style={[s.tableCell, { width: '40%' }]}>Bill Pay Now, MasterCRM, IVR, USSD, SelfCare, WebStore, SINGLEVIEW</Text>
            <Text style={[s.tableCell, { width: '35%' }]}>Apps → Proxy → Microservices</Text>
          </View>
          <View style={s.tableRow}>
            <Text style={[s.tableCellBold, { width: '25%', color: c.orange }]}>SOAP/XML</Text>
            <Text style={[s.tableCell, { width: '40%' }]}>DAPI (vers Proxy), MS → MasterCRM WS, ESB-Billing, DAPI WS, Charging GW</Text>
            <Text style={[s.tableCell, { width: '35%' }]}>Microservices → Backends</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Chemin critique — Portabilite entrante</Text>
        <View style={{ marginVertical: 4 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '8%' }]}>#</Text>
            <Text style={[s.tableHeaderCell, { width: '30%' }]}>Composant</Text>
            <Text style={[s.tableHeaderCell, { width: '40%' }]}>Action</Text>
            <Text style={[s.tableHeaderCell, { width: '22%' }]}>Protocole</Text>
          </View>
          {[
            ['1', 'PortaSync', 'Lance la bascule', 'Interne'],
            ['2', 'DAPI → DataPower', 'Envoie requete', 'SOAP/XML'],
            ['3', 'Proxy → MSPorta', 'Route (172.24.119.36:3003)', 'REST/JSON'],
            ['4', 'MSPorta → WSMobi', 'ExecuteChangeMSISDNPe', 'SOAP/XML'],
            ['5', 'MasterCRM DB', 'MSISDN provisoire → porte', 'SQL'],
          ].map(([n, comp, action, proto], i) => (
            <View key={i} style={[s.tableRow, i % 2 === 0 ? { backgroundColor: '#f8fafc' } : {}]}>
              <Text style={[s.tableCellBold, { width: '8%' }]}>{n}</Text>
              <Text style={[s.tableCellBold, { width: '30%' }]}>{comp}</Text>
              <Text style={[s.tableCell, { width: '40%' }]}>{action}</Text>
              <Text style={[s.tableCell, { width: '22%' }]}>{proto}</Text>
            </View>
          ))}
        </View>

        <Text style={s.sectionTitle}>A documenter</Text>
        <Checkbox text="Acces Graylog : URL, identifiants, filtres" />
        <Checkbox text="XToolWS : quand est-il utilise vs routage direct ?" />
        <Checkbox text="f5-vip-kong : qui gere le load balancer ?" />
        <Checkbox text="Peut-on tracer une requete de bout en bout en temps reel ?" />
        <Checkbox text="Diagramme de sequence temporel ?" />

        <PageFooter title="Fiche #1 — Architecture technique" page={1} total={1} />
      </Page>
    </>
  );
}

// ─── Fiche 2 : Microservices ────────────────────────────────────────────────

function Fiche2Microservices() {
  return (
    <>
      <Page size="A4" style={s.page}>
        <PageHeader title="Fiche #2 — Microservices MOBI" sub="MOBI CRM — Niveau 1-2 — 13/03/2026" />

        <View style={s.alertInfo}>
          <Text style={s.alertTitle}>Hebergement</Text>
          <Text style={s.alertText}>Serveurs : <Text style={s.bold}>vmqpromsbox01 / vmqpromsbox02</Text> — VIP : <Text style={s.bold}>172.24.119.96</Text></Text>
        </View>

        <Text style={s.sectionTitle}>Inventaire des microservices</Text>
        <View style={{ marginVertical: 4 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '15%' }]}>MS</Text>
            <Text style={[s.tableHeaderCell, { width: '10%' }]}>Port</Text>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Backend</Text>
            <Text style={[s.tableHeaderCell, { width: '15%' }]}>Protocole</Text>
            <Text style={[s.tableHeaderCell, { width: '35%' }]}>Role</Text>
          </View>
          {[
            ['MSLine', '3002', 'MasterCRM WS', 'SOAP/XML', 'Gestion lignes, checkEligibility'],
            ['MSPorta', '3003', 'DAPI WS', 'SOAP/XML', 'Notification portabilite'],
            ['MSCustomer', '?', 'MasterCRM DB', 'SQL', 'Donnees client'],
            ['DCAPI', '?', 'MasterCRM DB', 'SQL', 'API donnees client'],
            ['eSIF', '?', 'MasterCRM DB', 'SQL', 'Info facturation'],
            ['MSBilling', '?', 'ESB-Billing WS', 'SOAP/XML', 'Facturation'],
            ['MSProvision.', '?', 'Charging GW', 'SOAP/XML', 'Provisioning services'],
            ['MSNotif', '?', '—', 'REST/JSON', 'Notifications SMS/CRM'],
          ].map(([ms, port, backend, proto, role], i) => (
            <View key={i} style={[s.tableRow, i < 2 ? { backgroundColor: '#fef2f2' } : i % 2 === 0 ? { backgroundColor: '#f8fafc' } : {}]}>
              <Text style={[s.tableCellBold, { width: '15%' }]}>{ms}</Text>
              <Text style={[s.tableCellMono, { width: '10%' }]}>{port}</Text>
              <Text style={[s.tableCell, { width: '25%' }]}>{backend}</Text>
              <Text style={[s.tableCell, { width: '15%' }]}>{proto}</Text>
              <Text style={[s.tableCell, { width: '35%' }]}>{role}</Text>
            </View>
          ))}
        </View>
        <Text style={{ fontSize: 6.5, color: c.red, marginTop: 2 }}>Les lignes en rouge sont les MS critiques pour la portabilite</Text>

        <Text style={s.sectionTitle}>Endpoints connus</Text>
        <View style={s.codeBlock}>
          <Text style={s.codeComment}>// MSLine — Verification eligibilite</Text>
          <Text style={s.codeText}>GET http://172.24.119.36:3002/v1/checkEligibility/msisdn/:msisdn/rio/:rio</Text>
          <Text style={s.codeText}> </Text>
          <Text style={s.codeComment}>// MSPorta — Notification portabilite</Text>
          <Text style={s.codeText}>POST http://172.24.119.36:3003/v1/notifyPorta</Text>
        </View>

        <Text style={s.sectionTitle}>A documenter</Text>
        <Checkbox text="MSCustomer vs DCAPI — quelle difference ?" />
        <Checkbox text="Comment acceder a vmqpromsbox01/02 ? (SSH ?)" />
        <Checkbox text="Comment savoir si un MS est UP ou DOWN ?" />
        <Checkbox text="Comment redemarrer un MS individuel ?" />
        <Checkbox text="Ou sont les logs ? Quel repertoire ?" />
        <Checkbox text="MSBilling — lien avec la portabilite ?" />
        <Checkbox text="MSProvisioning — quels services provisionnes ?" />
        <Checkbox text="MSNotif — quelles notifications pour la portabilite ?" />
        <Checkbox text="Les MS tournent dans Docker ? JVM ? Node.js ?" />
        <Checkbox text="Monitoring (Nagios, Zabbix) pour les MS ?" />

        <PageFooter title="Fiche #2 — Microservices MOBI" page={1} total={1} />
      </Page>
    </>
  );
}

// ─── Fiche 3 : Web Services SOAP ───────────────────────────────────────────

function Fiche3WebServices() {
  return (
    <>
      <Page size="A4" style={s.page}>
        <PageHeader title="Fiche #3 — Web Services SOAP (WSMobiMaster)" sub="MOBI CRM — Niveau 1-2 — 13/03/2026" />

        <View style={s.alertWarning}>
          <Text style={s.alertTitle}>WSMobiMaster - WSProvisioning</Text>
          <Text style={s.alertText}>Web service SOAP principal de MOBI. Point d{"'"}entree pour toutes les operations CRM. Projet SoapUI : <Text style={s.bold}>WSMobiMaster - WSProvisioning - PROD</Text>, Binding : <Text style={s.bold}>BasicHttpBinding_Provisioning</Text></Text>
        </View>

        <Text style={s.sectionTitle}>Operations critiques portabilite</Text>

        <View style={[s.alertError, { marginBottom: 6 }]}>
          <Text style={s.alertTitle}>ExecuteChangeMSISDNPe — Porta ENTRANTE</Text>
          <Text style={s.alertText}>Remplace le MSISDN provisoire par le numero porte dans MasterCRM. Appele apres la bascule DAPI. Si echoue → client reste sur MSISDN provisoire.</Text>
        </View>

        <View style={[s.alertError, { marginBottom: 6 }]}>
          <Text style={s.alertTitle}>ExecuteResiliationPs — Porta SORTANTE</Text>
          <Text style={s.alertText}>Resilie la ligne du client dans MasterCRM. Appele apres la bascule DAPI. Si echoue → ligne non resiliee, facturation continue.</Text>
        </View>

        <Text style={s.sectionTitle}>Toutes les operations (22)</Text>
        <View style={{ marginVertical: 4 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '30%' }]}>Operation</Text>
            <Text style={[s.tableHeaderCell, { width: '15%' }]}>Categorie</Text>
            <Text style={[s.tableHeaderCell, { width: '8%' }]}>PNM</Text>
            <Text style={[s.tableHeaderCell, { width: '47%' }]}>Description</Text>
          </View>
          {[
            ['ExecuteChangeMSISDNPe', 'Porta', 'OUI', 'Changement MSISDN porta entrante'],
            ['ExecuteResiliationPs', 'Porta', 'OUI', 'Resiliation porta sortante'],
            ['InfoLine', 'Ligne', '', 'Infos ligne (diagnostic)'],
            ['TestWord', 'Autre', '', 'Test connectivite WS'],
            ['CreateLineGP', 'Ligne', '', 'Creation ligne Grand Public'],
            ['TransferLineGP', 'Ligne', '', 'Transfert ligne GP'],
            ['SIMChange', 'Ligne', '', 'Changement SIM'],
            ['InsertOption', 'Offre', '', 'Ajouter option'],
            ['DeleteOption', 'Offre', '', 'Supprimer option'],
            ['OfferChange', 'Offre', '', 'Changement offre'],
            ['AddItem', 'Offre', '', 'Ajouter item'],
            ['RemoveItem', 'Offre', '', 'Retirer item'],
            ['InfosOfferItems', 'Offre', '', 'Infos items offre'],
            ['ExecuteDigicelPlus', 'Offre', '', 'Operation Digicel+'],
            ['RegisterWebPayment', 'Paiement', '', 'Paiement web'],
            ['PSPCBResponse', 'Paiement', '', 'Callback PSP'],
            ['UpdateEmailing', 'Comm.', '', 'Preferences emailing'],
            ['GetUncheckedEmails', 'Comm.', '', 'Emails non verifies'],
            ['ExecuteChangeMailStatut', 'Comm.', '', 'Changer statut mail'],
            ['Execute', 'Autre', '', 'Operation generique'],
            ['ExecuteRequest', 'Autre', '', 'Requete generique'],
            ['RecompileAllWSProc', 'Autre', '', 'Recompiler proc. stockees'],
          ].map(([op, cat, pnm, desc], i) => (
            <View key={i} style={[s.tableRow, pnm === 'OUI' ? { backgroundColor: '#fef2f2' } : i % 2 === 0 ? { backgroundColor: '#f8fafc' } : {}]}>
              <Text style={[s.tableCellMono, { width: '30%', fontWeight: pnm ? 'bold' : 'normal' }]}>{op}</Text>
              <Text style={[s.tableCell, { width: '15%' }]}>{cat}</Text>
              <Text style={[s.tableCellBold, { width: '8%', color: c.red }]}>{pnm}</Text>
              <Text style={[s.tableCell, { width: '47%' }]}>{desc}</Text>
            </View>
          ))}
        </View>

        <Text style={s.sectionTitle}>A documenter</Text>
        <Checkbox text="Requete SOAP complete ExecuteChangeMSISDNPe (enveloppe XML)" />
        <Checkbox text="Requete SOAP complete ExecuteResiliationPs" />
        <Checkbox text="Structure reponse InfoLine (quels champs ?)" />
        <Checkbox text="Codes erreur WS et interpretation" />
        <Checkbox text="WSDL accessible via navigateur ?" />

        <PageFooter title="Fiche #3 — Web Services SOAP" page={1} total={1} />
      </Page>
    </>
  );
}

// ─── Fiche 4 : BDD MasterCRM ───────────────────────────────────────────────

function Fiche4BddMasterCrm() {
  return (
    <>
      <Page size="A4" style={s.page}>
        <PageHeader title="Fiche #4 — Base de donnees MasterCRM" sub="MOBI CRM — Niveau 2 Approfondissement — 13/03/2026" />

        <View style={s.alertWarning}>
          <Text style={s.alertTitle}>Serveur : vmqprombdb01</Text>
          <Text style={s.alertText}>Type de BDD : <Text style={s.bold}>A CONFIRMER</Text> (Oracle ? SQL Server ?) — Outil connexion : <Text style={s.bold}>A CONFIRMER</Text></Text>
        </View>

        <Text style={s.sectionTitle}>Table MSISDN (connue)</Text>
        <View style={{ marginVertical: 4 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Colonne</Text>
            <Text style={[s.tableHeaderCell, { width: '75%' }]}>Description</Text>
          </View>
          {[
            ['operation_id', 'Identifiant operation'],
            ['msisdn_no', 'Le numero de telephone'],
            ['ST_MSISDN_ID', 'Statut MSISDN (0 = disponible)'],
            ['MSISDN_STATUS', 'Statut (7 = reaffectable)'],
            ['MS_CLASS', 'Classe (0 = normale Digicel)'],
          ].map(([col, desc], i) => (
            <View key={i} style={[s.tableRow, i % 2 === 0 ? { backgroundColor: '#f8fafc' } : {}]}>
              <Text style={[s.tableCellMono, { width: '25%', fontWeight: 'bold' }]}>{col}</Text>
              <Text style={[s.tableCell, { width: '75%' }]}>{desc}</Text>
            </View>
          ))}
        </View>

        <Text style={s.subTitle}>Requete : Verifier un MSISDN</Text>
        <View style={s.codeBlock}>
          <Text style={s.codeComment}>-- Sur la BDD CRM (MOBI) cote Digicel</Text>
          <Text style={s.codeText}>SELECT operation_id, msisdn_no,</Text>
          <Text style={s.codeText}>       ST_MSISDN_ID, MSISDN_STATUS, MS_CLASS</Text>
          <Text style={s.codeText}>FROM MSISDN</Text>
          <Text style={s.codeText}>WHERE MSISDN_no IN ({"'"}0690XXXXXX{"'"});</Text>
        </View>

        <Text style={s.subTitle}>Requete : Rendre reaffectable</Text>
        <View style={s.codeBlock}>
          <Text style={s.codeHighlight}>UPDATE MSISDN</Text>
          <Text style={s.codeHighlight}>SET ST_MSISDN_ID = {"'"}0{"'"}, MSISDN_STATUS = {"'"}7{"'"}</Text>
          <Text style={s.codeText}>WHERE MSISDN_no IN ({"'"}0690XXXXXX{"'"})</Text>
          <Text style={s.codeText}>AND MS_CLASS = {"'"}0{"'"};</Text>
          <Text style={s.codeHighlight}>COMMIT;</Text>
        </View>

        <Text style={s.sectionTitle}>PortaDB vs MasterCRM DB</Text>
        <View style={{ marginVertical: 4 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '20%' }]}>Base</Text>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Serveur</Text>
            <Text style={[s.tableHeaderCell, { width: '55%' }]}>Contenu</Text>
          </View>
          <View style={[s.tableRow, { backgroundColor: '#f0fdf4' }]}>
            <Text style={[s.tableCellBold, { width: '20%' }]}>PortaDB</Text>
            <Text style={[s.tableCellMono, { width: '25%' }]}>172.24.119.68</Text>
            <Text style={[s.tableCell, { width: '55%' }]}>Mandats portabilite, etats, tickets, PORTAGE_DATA (temporary_msisdn)</Text>
          </View>
          <View style={[s.tableRow, { backgroundColor: '#eff6ff' }]}>
            <Text style={[s.tableCellBold, { width: '20%' }]}>MasterCRM</Text>
            <Text style={[s.tableCellMono, { width: '25%' }]}>vmqprombdb01</Text>
            <Text style={[s.tableCell, { width: '55%' }]}>Clients, lignes, offres, facturation (table MSISDN)</Text>
          </View>
        </View>
        <Text style={{ ...s.body, fontStyle: 'italic', fontSize: 7.5 }}>Pas de lien SQL direct entre les deux bases. Le lien se fait via les WS (DAPI appelle WSMobiMaster).</Text>

        <Text style={s.sectionTitle}>A documenter</Text>
        <Checkbox text="Type exact de BDD (Oracle, SQL Server, PostgreSQL) ?" />
        <Checkbox text="Outil de connexion recommande ?" />
        <Checkbox text="Tables modifiees par ExecuteChangeMSISDNPe ?" />
        <Checkbox text="Tables modifiees par ExecuteResiliationPs ?" />
        <Checkbox text="Requetes diagnostiques apres bascule (entrante + sortante)" />
        <Checkbox text="Schema de BDD documente quelque part ?" />

        <PageFooter title="Fiche #4 — BDD MasterCRM" page={1} total={1} />
      </Page>
    </>
  );
}

// ─── Fiche 5 : Interactions DAPI ↔ MOBI ────────────────────────────────────

function Fiche5Interactions() {
  return (
    <>
      <Page size="A4" style={s.page}>
        <PageHeader title="Fiche #5 — Interactions DAPI / MOBI" sub="MOBI CRM — Niveau 1-2 — 13/03/2026" />

        <Text style={s.sectionTitle}>Bascule ENTRANTE (client arrive chez Digicel)</Text>
        <View style={{ marginVertical: 4 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '8%' }]}>#</Text>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Composant</Text>
            <Text style={[s.tableHeaderCell, { width: '42%' }]}>Action</Text>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Protocole</Text>
          </View>
          {[
            ['1', 'PortaSync', 'Detecte mandat pret a basculer', 'Interne'],
            ['2', 'PortaSync', 'Traitement EMA/EMM', 'Fichiers'],
            ['3', 'DAPI', 'Bascule base nationale (FNR)', '—'],
            ['4', 'DAPI → Proxy', 'Envoie requete', 'SOAP/XML'],
            ['5', 'Proxy → MSPorta', '172.24.119.36:3003/v1/notifyPorta', 'REST/JSON'],
            ['6', 'MSPorta → WSMobi', 'ExecuteChangeMSISDNPe', 'SOAP/XML'],
            ['7', 'MasterCRM DB', 'MSISDN provisoire → numero porte', 'SQL'],
          ].map(([n, comp, action, proto], i) => (
            <View key={i} style={[s.tableRow, i % 2 === 0 ? { backgroundColor: '#f0fdf4' } : {}]}>
              <Text style={[s.tableCellBold, { width: '8%' }]}>{n}</Text>
              <Text style={[s.tableCellBold, { width: '25%' }]}>{comp}</Text>
              <Text style={[s.tableCell, { width: '42%' }]}>{action}</Text>
              <Text style={[s.tableCell, { width: '25%' }]}>{proto}</Text>
            </View>
          ))}
        </View>

        <Text style={s.sectionTitle}>Bascule SORTANTE (client quitte Digicel)</Text>
        <View style={{ marginVertical: 4 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '8%' }]}>#</Text>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Composant</Text>
            <Text style={[s.tableHeaderCell, { width: '42%' }]}>Action</Text>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Protocole</Text>
          </View>
          {[
            ['1', 'PortaSync', 'Detecte mandat sortant', 'Interne'],
            ['2', 'PortaSync', 'Traitement EMA/EMM', 'Fichiers'],
            ['3', 'DAPI', 'Bascule base nationale (FNR)', '—'],
            ['4', 'DAPI → Proxy', 'Envoie requete', 'SOAP/XML'],
            ['5', 'Proxy → MSPorta', 'Route vers microservice', 'REST/JSON'],
            ['6', 'MSPorta → WSMobi', 'ExecuteResiliationPs', 'SOAP/XML'],
            ['7', 'MasterCRM DB', 'Ligne resiliee, facturation arretee', 'SQL'],
          ].map(([n, comp, action, proto], i) => (
            <View key={i} style={[s.tableRow, i % 2 === 0 ? { backgroundColor: '#fef2f2' } : {}]}>
              <Text style={[s.tableCellBold, { width: '8%' }]}>{n}</Text>
              <Text style={[s.tableCellBold, { width: '25%' }]}>{comp}</Text>
              <Text style={[s.tableCell, { width: '42%' }]}>{action}</Text>
              <Text style={[s.tableCell, { width: '25%' }]}>{proto}</Text>
            </View>
          ))}
        </View>

        <Text style={s.sectionTitle}>Incident CRM (Cas pratique #6)</Text>
        <View style={s.alertError}>
          <Text style={s.alertTitle}>Si MOBI est en incident pendant la bascule</Text>
          <Text style={s.alertText}>
            <Text style={s.bold}>Bascule DAPI : OK</Text> (numero transfere dans la base nationale){'\n'}
            <Text style={s.bold}>Appel CRM : ECHOUE</Text>{'\n'}{'\n'}
            Porta entrante : client reste sur MSISDN provisoire dans le CRM{'\n'}
            Porta sortante : ligne non resiliee, facturation continue{'\n'}{'\n'}
            <Text style={s.bold}>Resolution :</Text> Escalader equipe MOBI avec liste mandats (MSISDN, date, type)
          </Text>
        </View>

        <Text style={s.sectionTitle}>A documenter</Text>
        <Checkbox text="Payload exact de notifyPorta (quels champs JSON ?)" />
        <Checkbox text="checkEligibility : qui appelle ? Quand dans le processus ?" />
        <Checkbox text="Gestion erreurs : retry automatique ? Timeout ?" />
        <Checkbox text="Logs MOBI : equivalent du EmaExtracter.log cote CRM ?" />
        <Checkbox text="Rapport automatique ecarts PortaDB OK / CRM KO ?" />
        <Checkbox text="Le sens MOBI → DAPI existe-t-il ? (callback ?)" />

        <PageFooter title="Fiche #5 — Interactions DAPI / MOBI" page={1} total={1} />
      </Page>
    </>
  );
}

// ─── Fiche 6 : Retranscription interactions (resume) ───────────────────────

function Fiche6Resume() {
  return (
    <>
      <Page size="A4" style={s.page}>
        <PageHeader title="Fiche #6 — Resume des interactions DAPI / MOBI / WS" sub="Retranscription narrative — 13/03/2026" />

        <View style={s.alertSuccess}>
          <Text style={s.alertTitle}>Objectif de cette fiche</Text>
          <Text style={s.alertText}>Retranscription simplifiee des schemas d{"'"}architecture sous forme de phrases pour faciliter la comprehension et la memorisation des flux.</Text>
        </View>

        <Text style={s.sectionTitle}>Le DataPower Proxy — L{"'"}aiguilleur</Text>
        <Text style={s.body}>Le DataPower Proxy est le point central de communication. C{"'"}est un serveur Spring Boot qui recoit toutes les requetes des applications clientes et les redirige vers les bons microservices. Chaque application lui envoie une requete en REST/JSON, et lui sait vers quel microservice la router.</Text>

        <Text style={s.sectionTitle}>Comment DAPI communique avec MOBI</Text>
        <Text style={s.body}>DAPI envoie une requete SOAP/XML au DataPower Proxy. Le Proxy la transmet au microservice concerne (MSPorta pour la portabilite). DAPI appelle notamment {"'"}GetLineInformation(MasterCRM){"'"} pour recuperer les informations d{"'"}une ligne.</Text>

        <Text style={s.sectionTitle}>Porta entrante — Client arrive chez Digicel</Text>
        <Text style={s.body}>1. PortaSync detecte le mandat pret a basculer{'\n'}2. Traitement EMA/EMM genere les fichiers{'\n'}3. Bascule DAPI : le numero est officiellement chez Digicel{'\n'}4. DAPI appelle WSMobiMaster → <Text style={s.bold}>ExecuteChangeMSISDNPe</Text>{'\n'}5. Le MSISDN provisoire est remplace par le vrai numero porte dans MasterCRM{'\n'}6. Le client est joignable sous son vrai numero, facturation correcte</Text>

        <Text style={s.sectionTitle}>Porta sortante — Client quitte Digicel</Text>
        <Text style={s.body}>1. PortaSync detecte le mandat sortant{'\n'}2. Traitement EMA/EMM + bascule DAPI{'\n'}3. DAPI appelle WSMobiMaster → <Text style={s.bold}>ExecuteResiliationPs</Text>{'\n'}4. La ligne est desactivee dans MasterCRM, facturation arretee{'\n'}5. Le client n{"'"}est plus abonne Digicel</Text>

        <Text style={s.sectionTitle}>Si le CRM est en panne (Cas pratique #6)</Text>
        <View style={s.alertError}>
          <Text style={s.alertText}>
            Les bascules DAPI se font normalement, MAIS les operations CRM echouent :{'\n'}{'\n'}
            <Text style={s.bold}>Entrante :</Text> ExecuteChangeMSISDNPe echoue → client reste sur MSISDN provisoire{'\n'}
            <Text style={s.bold}>Sortante :</Text> ExecuteResiliationPs echoue → ligne non resiliee, facturation continue{'\n'}{'\n'}
            <Text style={s.bold}>Resolution :</Text> Escalader a l{"'"}equipe MOBI pour relancer les traitements manuellement.
          </Text>
        </View>

        <Text style={s.sectionTitle}>Les microservices — Qui fait quoi</Text>
        <Text style={s.body}><Text style={s.bold}>MSCustomer / DCAPI</Text> : Acces SQL a la BDD CRM (donnees client)</Text>
        <Text style={s.body}><Text style={s.bold}>MSLine</Text> : Operations lignes via MasterCRM WS (SOAP/XML) — checkEligibility :3002</Text>
        <Text style={s.body}><Text style={s.bold}>MSPorta</Text> : Portabilite via DAPI WS (SOAP/XML) — notifyPorta :3003</Text>
        <Text style={s.body}><Text style={s.bold}>MSBilling</Text> : Facturation via ESB-Billing WS</Text>
        <Text style={s.body}><Text style={s.bold}>MSProvisioning</Text> : Provisioning via Charging Gateway</Text>
        <Text style={s.body}><Text style={s.bold}>MSNotif</Text> : Notifications (SMS, CRM) en REST/JSON</Text>

        <Text style={s.sectionTitle}>Resume simplifie</Text>
        <View style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 3 }}>
          <Text style={{ ...s.body, fontFamily: 'Courier', fontSize: 7 }}>
            Porta entrante :{'\n'}
            Op. externe → HUB → PortaSync → DAPI → ExecuteChangeMSISDNPe → CRM OK{'\n'}{'\n'}
            Porta sortante :{'\n'}
            PortaSync → DAPI → ExecuteResiliationPs → CRM resilie la ligne{'\n'}{'\n'}
            Incident CRM :{'\n'}
            DAPI OK → CRM ECHOUE → Escalade equipe MOBI → Relance manuelle
          </Text>
        </View>

        <PageFooter title="Fiche #6 — Resume interactions" page={1} total={1} />
      </Page>
    </>
  );
}

// ─── Document complet ───────────────────────────────────────────────────────

function MobiCrmDocumentPdf() {
  return (
    <Document>
      <Fiche1Architecture />
      <Fiche2Microservices />
      <Fiche3WebServices />
      <Fiche4BddMasterCrm />
      <Fiche5Interactions />
      <Fiche6Resume />
    </Document>
  );
}

// ─── Export ─────────────────────────────────────────────────────────────────

export async function generateMobiCrmPdf(): Promise<void> {
  const blob = await pdf(<MobiCrmDocumentPdf /> as React.ReactElement<import('@react-pdf/renderer').DocumentProps>).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `MOBI-CRM-Documentation-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
