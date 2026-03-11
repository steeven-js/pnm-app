import { Document, Page, Text, View, Image, StyleSheet, Font, pdf } from '@react-pdf/renderer';

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
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 9, color: c.dark },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: c.border },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: c.primary },
  headerSub: { fontSize: 8, color: c.light },
  footer: { position: 'absolute', bottom: 25, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: c.light, borderTopWidth: 0.5, borderTopColor: c.border, paddingTop: 5 },
  // Sections
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: c.dark, marginTop: 14, marginBottom: 6 },
  // Alerts
  alertWarning: { backgroundColor: '#FFF8E1', borderLeftWidth: 3, borderLeftColor: c.orange, padding: 8, marginBottom: 10, borderRadius: 3 },
  alertInfo: { backgroundColor: '#E8F4FD', borderLeftWidth: 3, borderLeftColor: c.blue, padding: 8, marginBottom: 10, borderRadius: 3 },
  alertError: { backgroundColor: '#FEEBEE', borderLeftWidth: 3, borderLeftColor: c.red, padding: 8, marginBottom: 10, borderRadius: 3 },
  alertSuccess: { backgroundColor: '#E8F5E9', borderLeftWidth: 3, borderLeftColor: c.green, padding: 8, marginBottom: 10, borderRadius: 3 },
  alertText: { fontSize: 8, lineHeight: 1.5 },
  alertTitle: { fontSize: 8.5, fontWeight: 'bold', marginBottom: 2 },
  // Steps
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 12, marginBottom: 4 },
  stepCircle: { width: 18, height: 18, borderRadius: 9, backgroundColor: c.primary, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  stepNumber: { color: c.white, fontSize: 9, fontWeight: 'bold' },
  stepTitle: { fontSize: 10, fontWeight: 'bold' },
  // Table
  tableHeader: { flexDirection: 'row', backgroundColor: c.bg, borderBottomWidth: 1, borderBottomColor: c.border, paddingVertical: 4, paddingHorizontal: 4 },
  tableHeaderCell: { fontSize: 8, fontWeight: 'bold', color: c.dark },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: c.border, paddingVertical: 3, paddingHorizontal: 4 },
  tableCell: { fontSize: 8, color: c.dark },
  tableCellLight: { fontSize: 8, color: c.light },
  // Code
  codeBlock: { backgroundColor: '#1e293b', borderRadius: 3, padding: 8, marginVertical: 6 },
  codeText: { fontSize: 7.5, fontFamily: 'Courier', color: '#e2e8f0', lineHeight: 1.4 },
  codeHighlight: { color: '#fbbf24', fontWeight: 'bold' },
  codeGreen: { color: '#22c55e', fontWeight: 'bold' },
  // Tags
  tag: { borderWidth: 0.5, borderColor: c.border, borderRadius: 3, paddingHorizontal: 5, paddingVertical: 2, fontSize: 7, backgroundColor: c.bg, marginRight: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10, gap: 2 },
  // Body
  body: { fontSize: 8.5, lineHeight: 1.5, color: c.dark },
  bodyLight: { fontSize: 8.5, lineHeight: 1.5, color: c.light },
  bold: { fontWeight: 'bold' },
  code: { fontFamily: 'Courier', fontSize: 7.5, backgroundColor: c.bg, paddingHorizontal: 2, borderRadius: 1 },
  listItem: { flexDirection: 'row', marginBottom: 3 },
  listBullet: { width: 12, fontSize: 8, color: c.dark },
  listText: { flex: 1, fontSize: 8.5, lineHeight: 1.5 },
});

// ─── Cas #1 — Incohérence col.3 PDF ────────────────────────────────────────

function CasIncohCol3Pdf() {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Document>
      {/* PAGE 1 — Détection & Analyse */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Cas Pratique — Incohérence col.3 PNMDATA</Text>
            <Text style={s.headerSub}>Portabilité des Numéros Mobiles V3 — Digicel Antilles-Guyane</Text>
          </View>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        {/* Tags */}
        <View style={s.tagRow}>
          {['Fichier', 'Incohérence', 'Correction manuelle', 'PNMDATA', 'col.3'].map((tag) => (
            <Text key={tag} style={s.tag}>{tag}</Text>
          ))}
        </View>

        {/* Contexte */}
        <Text style={s.body}>
          Ce guide documente un cas réel rencontré le <Text style={s.bold}>04/03/2026</Text> sur le fichier PNMDATA.04.02.20260303123443.002 envoyé par <Text style={s.bold}>Dauphin Télécom (04)</Text> à destination de <Text style={s.bold}>Digicel (02)</Text>. Une incohérence a été détectée sur la colonne 3 d'un ticket, nécessitant une correction manuelle avant réintégration.
        </Text>

        <View style={s.alertWarning}>
          <Text style={s.alertTitle}>Contexte</Text>
          <Text style={s.alertText}>
            Ce type d'anomalie survient lorsqu'un opérateur envoie un ticket dont la colonne 3 (OPR — opérateur destinataire) ne correspond pas au destinataire réel du fichier. Le fichier est adressé à Digicel (02), mais un ticket pointe vers Free Caraïbe (06).
          </Text>
        </View>

        {/* Étape 1 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>1</Text></View>
          <Text style={s.stepTitle}>Détecter l'incohérence</Text>
        </View>

        <Text style={s.body}>
          En analysant le fichier avec le Décodeur fichier de PNM App, l'outil détecte automatiquement :
        </Text>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '40%' }]}>Élément</Text>
            <Text style={[s.tableHeaderCell, { width: '60%' }]}>Valeur</Text>
          </View>
          {[
            ['Fichier', 'PNMDATA.04.02.20260303123443.002'],
            ['Ligne concernée', 'Ligne 12'],
            ['Type de ticket', '1430 CP (Confirmation de Portage)'],
            ['MSISDN', '0696861327'],
          ].map(([label, value]) => (
            <View key={label} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '40%', fontWeight: 'bold' }]}>{label}</Text>
              <Text style={[s.tableCell, { width: '60%' }]}>{value}</Text>
            </View>
          ))}
          <View style={s.tableRow}>
            <Text style={[s.tableCell, { width: '40%', fontWeight: 'bold' }]}>Col.3 dans le ticket</Text>
            <Text style={[s.tableCell, { width: '60%', color: c.orange, fontWeight: 'bold' }]}>06 — Free Caraïbe</Text>
          </View>
          <View style={s.tableRow}>
            <Text style={[s.tableCell, { width: '40%', fontWeight: 'bold' }]}>Destinataire attendu (entête)</Text>
            <Text style={[s.tableCell, { width: '60%', color: c.green, fontWeight: 'bold' }]}>02 — Digicel</Text>
          </View>
        </View>

        <Text style={s.body}>La ligne brute incriminée :</Text>
        <View style={s.codeBlock}>
          <Text style={s.codeText}>
            1430|04|<Text style={s.codeHighlight}>06</Text>|<Text style={s.codeHighlight}>06</Text>|03|20260226102713|0696861327|2d404a42c6d2db55116a944148c0327d|0011|20260303123659|20260303000000|
          </Text>
        </View>

        <Text style={s.body}>
          Les colonnes 2 et 3 contiennent 04|06 au lieu de 04|02. Ce ticket aurait dû être dans PNMDATA.04.06 (Dauphin → Free Caraïbe) et non dans PNMDATA.04.02 (Dauphin → Digicel).
        </Text>

        {/* Principe */}
        <View style={s.alertInfo}>
          <Text style={s.alertTitle}>Principe</Text>
          <Text style={s.alertText}>
            On ne peut pas simplement supprimer la ligne car cela créerait un trou dans la séquence des numéros de ticket. La méthode consiste à remplacer la ligne incohérente par le dernier ticket du fichier, en ajustant le numéro de séquence.
          </Text>
        </View>

        {/* Étape 2 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>2</Text></View>
          <Text style={s.stepTitle}>Identifier les éléments clés</Text>
        </View>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '45%' }]}>Élément</Text>
            <Text style={[s.tableHeaderCell, { width: '55%' }]}>Valeur</Text>
          </View>
          {[
            ['Ligne à supprimer', 'Ligne 12 (séquence 0011)'],
            ['Dernier ticket du fichier', 'Ligne 66 (séquence 0065, ticket 3410 RN pour MSISDN 0690660689)'],
            ['Nombre total de tickets avant', '65 tickets (67 lignes avec entête + pied de page)'],
            ['Nombre total de tickets après', '64 tickets (66 lignes avec entête + pied de page)'],
          ].map(([label, value]) => (
            <View key={label} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '45%', fontWeight: 'bold' }]}>{label}</Text>
              <Text style={[s.tableCell, { width: '55%' }]}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : Incohérence col.3</Text>
          <Text>Page 1 / 2</Text>
        </View>
      </Page>

      {/* PAGE 2 — Correction & Transfert */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Correction & Réintégration</Text>
            <Text style={s.headerSub}>Suite de la procédure</Text>
          </View>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        {/* Étape 3 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>3</Text></View>
          <Text style={s.stepTitle}>Supprimer la ligne incohérente</Text>
        </View>

        <Text style={s.body}>
          Ouvrir le fichier dans un éditeur de texte (Notepad++, VS Code...). Supprimer la ligne 12 :
        </Text>
        <View style={[s.codeBlock, { opacity: 0.6 }]}>
          <Text style={[s.codeText, { textDecoration: 'line-through' }]}>
            1430|04|06|06|03|20260226102713|0696861327|2d404a42c6d2db55116a944148c0327d|0011|20260303123659|20260303000000|
          </Text>
        </View>

        {/* Étape 4 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>4</Text></View>
          <Text style={s.stepTitle}>Déplacer le dernier ticket à la place</Text>
        </View>

        <Text style={s.body}>Prendre le dernier ticket du fichier (ancienne ligne 66) :</Text>
        <View style={s.codeBlock}>
          <Text style={s.codeText}>
            3410|04|00|01|04|20260227014913|0690660689|9158f2f3eecf1084d8f0b2b287b877d6|<Text style={s.codeHighlight}>0065</Text>|20260227062551|20260303000000
          </Text>
        </View>

        <Text style={s.body}>Le placer à l'emplacement de la ligne 12 et changer le numéro de séquence de 0065 à 0011 :</Text>
        <View style={s.codeBlock}>
          <Text style={s.codeText}>
            3410|04|00|01|04|20260227014913|0690660689|9158f2f3eecf1084d8f0b2b287b877d6|<Text style={s.codeGreen}>0011</Text>|20260227062551|20260303000000
          </Text>
        </View>

        <View style={s.alertError}>
          <Text style={s.alertTitle}>Important</Text>
          <Text style={s.alertText}>
            Le dernier ticket (ligne 66) est supprimé de sa position d'origine puisqu'il a été déplacé. On passe donc de 65 à 64 tickets.
          </Text>
        </View>

        {/* Étape 5 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>5</Text></View>
          <Text style={s.stepTitle}>Renommer le fichier avec un nouvel horodatage</Text>
        </View>

        <Text style={s.body}>
          Le fichier corrigé ne peut pas garder le même nom, sinon il sera rejeté ("fichier déjà reçu"). Il faut générer un <Text style={s.bold}>nouvel horodatage</Text> et un nouveau <Text style={s.bold}>numéro de séquence</Text> :
        </Text>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '20%' }]}>Élément</Text>
            <Text style={[s.tableHeaderCell, { width: '40%' }]}>Avant</Text>
            <Text style={[s.tableHeaderCell, { width: '40%' }]}>Après (exemple)</Text>
          </View>
          {[
            ['Nom du fichier', 'PNMDATA.04.02.\n20260303123443.002', 'PNMDATA.04.02.\n20260304143000.005'],
            ['Ligne 1 (entête)', '0123456789|PNMDATA.04.02.\n20260303123443.002|04|\n20260303123443', '0123456789|PNMDATA.04.02.\n20260304143000.005|04|\n20260304143000'],
            ['Dernière ligne\n(pied)', '9876543210|04|\n20260303123443|000067', '9876543210|04|\n20260304143000|000066'],
          ].map(([label, before, after]) => (
            <View key={label} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '20%', fontWeight: 'bold' }]}>{label}</Text>
              <Text style={[s.tableCellLight, { width: '40%', fontSize: 7 }]}>{before}</Text>
              <Text style={[s.tableCell, { width: '40%', fontSize: 7, color: c.green }]}>{after}</Text>
            </View>
          ))}
        </View>

        <Text style={s.body}>Les 3 éléments à mettre à jour :</Text>
        <View style={s.listItem}>
          <Text style={s.listBullet}>1.</Text>
          <Text style={s.listText}><Text style={s.bold}>Nom du fichier</Text> : nouvel horodatage + nouveau numéro de séquence</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>2.</Text>
          <Text style={s.listText}><Text style={s.bold}>Entête (ligne 1)</Text> : même horodatage que le nom</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>3.</Text>
          <Text style={s.listText}><Text style={s.bold}>Pied de page (dernière ligne)</Text> : même horodatage + compteur de lignes totales (entête + tickets + pied de page = 64 + 2 = 000066)</Text>
        </View>

        {/* Étape 6 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>6</Text></View>
          <Text style={s.stepTitle}>Transférer et intégrer</Text>
        </View>

        <View style={s.listItem}>
          <Text style={s.listBullet}>1.</Text>
          <Text style={s.listText}>Transférer le fichier corrigé via <Text style={s.bold}>FileZilla</Text> dans le répertoire recv/ sur le serveur <Text style={s.bold}>vmqproportasync01</Text> :</Text>
        </View>
        <View style={s.codeBlock}>
          <Text style={s.codeText}>/home/porta_pnmv3/PortaSync/pnmdata/04/recv/</Text>
        </View>

        <View style={s.listItem}>
          <Text style={s.listBullet}>2.</Text>
          <Text style={s.listText}>Exécuter le script d'intégration :</Text>
        </View>
        <View style={s.codeBlock}>
          <Text style={s.codeText}>./PnmDataAckManager.sh -v</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>3.</Text>
          <Text style={s.listText}>Vérifier les logs :</Text>
        </View>
        <View style={s.codeBlock}>
          <Text style={s.codeText}>tail -f /home/porta_pnmv3/PortaSync/log/PnmDataAckManager.log</Text>
        </View>

        {/* Points de vigilance */}
        <View style={[s.alertSuccess, { marginTop: 10 }]}>
          <Text style={s.alertTitle}>Points de vigilance</Text>
          <Text style={s.alertText}>• Toujours vérifier la cohérence des numéros de séquence après modification</Text>
          <Text style={s.alertText}>• Le compteur en pied de page inclut entête + tickets + pied de page</Text>
          <Text style={s.alertText}>• Générer un horodatage postérieur à l'original pour éviter le rejet</Text>
          <Text style={s.alertText}>• Tester avec le Décodeur fichier avant transfert pour valider l'intégrité</Text>
          <Text style={s.alertText}>• Ne jamais modifier le hash MD5 — calculé côté opérateur émetteur</Text>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : Incohérence col.3</Text>
          <Text>Page 2 / 2</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── Cas #2 — Relance portabilité en retard ─────────────────────────────────

function CasRelancePortabilitePdf() {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Cas Pratique — Relance portabilité en retard</Text>
            <Text style={s.headerSub}>Portabilité des Numéros Mobiles V3 — Digicel Antilles-Guyane</Text>
          </View>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        {/* Tags */}
        <View style={s.tagRow}>
          {['Relance', 'Ticket 1110', 'En attente', 'Dauphin Télécom', 'Email'].map((tag) => (
            <Text key={tag} style={s.tag}>{tag}</Text>
          ))}
        </View>

        <Text style={s.body}>
          Ce cas documente une situation rencontrée le <Text style={s.bold}>04/03/2026</Text> : deux portabilités entrantes vers Digicel, avec Dauphin Télécom (04) comme opérateur donneur, restent bloquées au statut <Text style={s.bold}>"En cours"</Text> depuis le 27/02/2026 sans réponse de l{"'"}opérateur donneur.
        </Text>

        <View style={s.alertWarning}>
          <Text style={s.alertTitle}>Contexte</Text>
          <Text style={s.alertText}>
            Lorsqu'un ticket 1110 (Demande de Portage) est émis par Digicel et qu'aucune réponse 1210 (Réponse Positive) ou 1220 (Réponse Négative) n'est reçue de l'opérateur donneur dans les délais réglementaires, la portabilité reste bloquée "En cours". Il faut relancer l'opérateur donneur par email.
          </Text>
        </View>

        {/* Étape 1 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>1</Text></View>
          <Text style={s.stepTitle}>Constater le blocage sur PortaWebUI</Text>
        </View>

        <Text style={s.body}>
          Sur <Text style={s.bold}>PortaWebUI</Text> (http://172.24.119.72:8080/PortaWs/index.jsp), filtrer les mandats avec les critères suivants :
        </Text>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '35%' }]}>Critère</Text>
            <Text style={[s.tableHeaderCell, { width: '65%' }]}>Valeur</Text>
          </View>
          {[
            ['Opérateur', '4 — Dauphin Telecom'],
            ['État', '3 — entrante-En cours'],
            ['En cours ?', 'Coché'],
          ].map(([label, value]) => (
            <View key={label} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '35%', fontWeight: 'bold' }]}>{label}</Text>
              <Text style={[s.tableCell, { width: '65%' }]}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Screenshots PortaWebUI */}
        <Image
          src="/images/portaweb-mandat3-0690221675.png"
          style={{ width: '100%', marginVertical: 4, borderRadius: 3 }}
        />
        <Image
          src="/images/portaweb-mandat2-0690221360.png"
          style={{ width: '100%', marginVertical: 4, borderRadius: 3 }}
        />
        <Text style={[s.bodyLight, { fontSize: 7, textAlign: 'center', marginBottom: 6 }]}>
          Captures PortaWebUI — Filtre : En cours coché, État 3-entrante-En cours, Opérateur 4-Dauphin Telecom
        </Text>

        <Text style={s.body}>Les mandats bloqués apparaissent :</Text>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '5%' }]}>#</Text>
            <Text style={[s.tableHeaderCell, { width: '18%' }]}>MSISDN</Text>
            <Text style={[s.tableHeaderCell, { width: '17%' }]}>Date création</Text>
            <Text style={[s.tableHeaderCell, { width: '17%' }]}>Date portage prévue</Text>
            <Text style={[s.tableHeaderCell, { width: '28%' }]}>Dernier ticket émis</Text>
            <Text style={[s.tableHeaderCell, { width: '15%' }]}>Statut</Text>
          </View>
          {[
            ['1', '0690221675', '27/02/2026', '03/03/2026', '1110 émis le 27/02 à 14:01:36', 'En cours'],
            ['2', '0690221360', '27/02/2026', '04/03/2026', '1110 émis le 27/02 à 14:01:36', 'En cours'],
          ].map(([num, msisdn, creation, portage, ticket, statut]) => (
            <View key={msisdn} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '5%' }]}>{num}</Text>
              <Text style={[s.tableCell, { width: '18%', fontWeight: 'bold' }]}>{msisdn}</Text>
              <Text style={[s.tableCellLight, { width: '17%' }]}>{creation}</Text>
              <Text style={[s.tableCell, { width: '17%', color: c.red, fontWeight: 'bold' }]}>{portage}</Text>
              <Text style={[s.tableCellLight, { width: '28%' }]}>{ticket}</Text>
              <Text style={[s.tableCell, { width: '15%', color: c.orange, fontWeight: 'bold' }]}>{statut}</Text>
            </View>
          ))}
        </View>

        <View style={s.alertInfo}>
          <Text style={s.alertTitle}>Observation clé</Text>
          <Text style={s.alertText}>
            Les deux tickets 1110 ont été envoyés dans le même fichier PNMDATA.02.04.20260227140112.002. Aucune réponse (1210 ou 1220) n{"'"}a été reçue de Dauphin Télécom depuis <Text style={s.alertTitle}>5 jours</Text>. La date de portage prévue est déjà dépassée.
          </Text>
        </View>

        {/* Étape 2 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>2</Text></View>
          <Text style={s.stepTitle}>Analyser la situation</Text>
        </View>

        <Text style={s.body}>Vérifier dans le détail du mandat sur PortaWebUI :</Text>

        <View style={s.listItem}>
          <Text style={s.listBullet}>•</Text>
          <Text style={s.listText}>Le ticket 1110 a bien été créé en interne et émis (statut "out")</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>•</Text>
          <Text style={s.listText}>Le fichier PNMDATA.02.04.20260227140112.002 a été envoyé le 27/02 à 14:01:36</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>•</Text>
          <Text style={s.listText}>Aucun ticket 1210 (acceptation) ou 1220 (refus) n{"'"}est apparu dans les fichiers reçus de Dauphin</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>•</Text>
          <Text style={s.listText}>La date de portage prévue est <Text style={s.bold}>dépassée</Text> (03/03 et 04/03 vs aujourd{"'"}hui 04/03)</Text>
        </View>

        <View style={s.alertError}>
          <Text style={s.alertTitle}>Constat</Text>
          <Text style={s.alertText}>
            Il y a un retard anormal. L{"'"}opérateur donneur (Dauphin Télécom) n{"'"}a pas répondu dans le délai réglementaire. Il faut le relancer par email.
          </Text>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : Relance portabilité en retard</Text>
          <Text>Page 1 / 2</Text>
        </View>
      </Page>

      {/* PAGE 2 — Email & Suivi */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Email de relance & Suivi</Text>
            <Text style={s.headerSub}>Suite de la procédure</Text>
          </View>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        {/* Étape 3 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>3</Text></View>
          <Text style={s.stepTitle}>Rédiger et envoyer l{"'"}email de relance</Text>
        </View>

        <Text style={s.body}>
          Envoyer un email au correspondant PNM de l{"'"}opérateur donneur avec les informations nécessaires :
        </Text>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '15%' }]}>Champ</Text>
            <Text style={[s.tableHeaderCell, { width: '85%' }]}>Valeur</Text>
          </View>
          {[
            ['À', 'Correspondant PNM Dauphin Télécom (ex: latifa.annachachibi@dauphin-telecom.com)'],
            ['Cc', 'FWI_PNM_SI@digicelgroup.fr ; correspondant technique Dauphin'],
            ['Objet', '[PNM] En attente de la réponse pour la portabilité du 0690221675 vers Digicel'],
          ].map(([label, value]) => (
            <View key={label} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '15%', fontWeight: 'bold' }]}>{label}</Text>
              <Text style={[s.tableCellLight, { width: '85%' }]}>{value}</Text>
            </View>
          ))}
        </View>

        <Text style={s.body}>Contenu de l{"'"}email — éléments à inclure :</Text>

        <View style={{ backgroundColor: '#F4F6F8', borderRadius: 3, padding: 8, marginVertical: 6 }}>
          <Text style={{ fontSize: 8, fontStyle: 'italic', marginBottom: 3 }}>Bonjour [Prénom],</Text>
          <Text style={{ fontSize: 8, lineHeight: 1.5 }}>
            Nous attendons la réponse pour la portabilité du <Text style={s.bold}>0690221675</Text> vers Digicel.{'\n'}
            Le ticket 1110 est dans le fichier <Text style={s.bold}>PNMDATA.02.04.20260227140112.002</Text>.{'\n'}
            Peux-tu débloquer la situation stp ?
          </Text>
        </View>

        <View style={s.alertInfo}>
          <Text style={s.alertTitle}>Astuce</Text>
          <Text style={s.alertText}>
            Si plusieurs MSISDN sont concernés pour le même opérateur, les regrouper dans un seul email en listant tous les numéros et en précisant le fichier PNMDATA commun. Exemple du 04/03 : relance pour les 2 numéros (0690221360 et 0690221675).
          </Text>
        </View>

        {/* Étape 4 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>4</Text></View>
          <Text style={s.stepTitle}>Suivre et escalader si nécessaire</Text>
        </View>

        <Text style={s.body}>Règles de suivi après relance :</Text>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '30%' }]}>Délai depuis relance</Text>
            <Text style={[s.tableHeaderCell, { width: '70%' }]}>Action</Text>
          </View>
          {[
            ['< 24h', 'Attendre la réponse de l\'opérateur', c.green],
            ['24h — 48h', 'Relancer une seconde fois par email avec mise en copie du responsable', c.orange],
            ['> 48h', 'Escalader à l\'équipe PNM_SI avec historique des relances et créer un flashinfo', c.red],
          ].map(([delai, action, color]) => (
            <View key={delai} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '30%', color: color as string, fontWeight: 'bold' }]}>{delai}</Text>
              <Text style={[s.tableCellLight, { width: '70%' }]}>{action}</Text>
            </View>
          ))}
        </View>

        <Text style={s.body}>
          À chaque vacation, vérifier sur PortaWebUI si un ticket 1210 a été reçu pour les MSISDN concernés.
        </Text>

        {/* Points de vigilance */}
        <View style={[s.alertSuccess, { marginTop: 10 }]}>
          <Text style={s.alertTitle}>Points de vigilance</Text>
          <Text style={s.alertText}>• Toujours vérifier sur PortaWebUI que le 1110 a bien été émis (statut "out") avant de relancer</Text>
          <Text style={s.alertText}>• Indiquer le nom exact du fichier PNMDATA dans l{"'"}email pour que l{"'"}opérateur puisse retrouver le ticket</Text>
          <Text style={s.alertText}>• Mettre FWI_PNM_SI en copie de tous les emails de relance pour traçabilité</Text>
          <Text style={s.alertText}>• Garder un historique des relances : 1ère relance, 2ème relance, escalade GPMAG</Text>
          <Text style={s.alertText}>• Le délai réglementaire de réponse à un 1110 est de 1 jour ouvré</Text>
          <Text style={s.alertText}>• Si le portage est trop ancien ({'>'} 10 jours), envisager la clôture du mandat et la recréation d{"'"}une nouvelle demande</Text>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : Relance portabilité en retard</Text>
          <Text>Page 2 / 2</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── Cas #3 — AR non reçu : investigation logs serveur ──────────────────────

function CasArNonRecuLogsPdf() {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Document>
      {/* PAGE 1 — Incident & Investigation */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Cas Pratique — AR non reçu : Investigation logs</Text>
            <Text style={s.headerSub}>Portabilité des Numéros Mobiles V3 — Digicel Antilles-Guyane</Text>
          </View>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        <View style={s.tagRow}>
          {['AR non reçu', 'Logs serveur', 'ACR E000', 'Archivage', 'SFR / Outremer'].map((tag) => (
            <Text key={tag} style={s.tag}>{tag}</Text>
          ))}
        </View>

        <Text style={s.body}>
          Ce cas documente une investigation menée le <Text style={s.bold}>10/03/2026</Text> suite à un email d{"'"}incident signalant que le fichier PNMDATA.02.03.20260309190056.003 envoyé par <Text style={s.bold}>Digicel (02)</Text> n{"'"}a pas été acquitté par <Text style={s.bold}>Outremer Telecom / SFR (03)</Text>. L{"'"}analyse des logs serveur sur <Text style={s.bold}>vmqproportasync01</Text> permet de conclure à un faux positif.
        </Text>

        <View style={s.alertWarning}>
          <Text style={s.alertTitle}>Contexte</Text>
          <Text style={s.alertText}>
            L{"'"}email d{"'"}incident contient deux alertes : (1) AR non reçu après 60 minutes et (2) fichier non acquitté par l{"'"}opérateur 03. Un ticket 0000/E011 a été émis automatiquement. L{"'"}investigation consiste à vérifier les logs pour confirmer ou infirmer le problème.
          </Text>
        </View>

        {/* Étape 1 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>1</Text></View>
          <Text style={s.stepTitle}>Réception de l{"'"}email d{"'"}incident</Text>
        </View>

        <Text style={s.body}>
          L{"'"}email automatique [PNM][INCIDENT] signale :
        </Text>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '30%' }]}>Type</Text>
            <Text style={[s.tableHeaderCell, { width: '70%' }]}>Détail</Text>
          </View>
          {[
            ['AR non reçu', 'PNMDATA.02.03.20260309190056.003 envoyé depuis plus de 60 minutes par 02 (Digicel AFG)'],
            ['Non acquitté', 'Le fichier n\'a pas été acquitté par 03 (Outremer Telecom / SFR)'],
            ['Ticket émis', '[0000, 02, 03, 20260309201502, E011, 000001, AR non-recu]'],
          ].map(([type, detail]) => (
            <View key={type} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '30%', fontWeight: 'bold' }]}>{type}</Text>
              <Text style={[s.tableCellLight, { width: '70%', fontSize: 7.5 }]}>{detail}</Text>
            </View>
          ))}
        </View>

        {/* Étape 2 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>2</Text></View>
          <Text style={s.stepTitle}>Vérifier la génération dans PnmDataManager.log</Text>
        </View>

        <Text style={s.body}>
          Se connecter à <Text style={s.bold}>vmqproportasync01</Text> et rechercher le fichier dans les logs de génération :
        </Text>
        <View style={s.codeBlock}>
          <Text style={s.codeText}>$ grep "PNMDATA.02.03.20260309190056.003" /home/porta_pnmv3/PortaSync/log/PnmDataManager.log</Text>
        </View>
        <Text style={s.body}>Résultat :</Text>
        <View style={s.codeBlock}>
          <Text style={s.codeText}>
            PnmDataManager.php|2026-03-09T19:01:58-04:00| ..........Generation du fichier PNMDATA.02.03.20260309190056.003 (<Text style={s.codeGreen}>#tickets: 70</Text>)
          </Text>
        </View>

        <View style={s.alertSuccess}>
          <Text style={s.alertTitle}>Constat</Text>
          <Text style={s.alertText}>Le fichier a bien été généré le 09/03/2026 à 19:01:58 avec 70 tickets.</Text>
        </View>

        {/* Étape 3 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>3</Text></View>
          <Text style={s.stepTitle}>Vérifier la présence dans send/</Text>
        </View>

        <Text style={s.body}>
          Vérifier si le fichier est encore dans le répertoire d{"'"}envoi :
        </Text>
        <View style={s.codeBlock}>
          <Text style={s.codeText}>$ ls -la /home/porta_pnmv3/PortaSync/pnmdata/03/send/PNMDATA.02.03.20260309190056.003*</Text>
        </View>
        <Text style={s.body}>Résultat :</Text>
        <View style={s.codeBlock}>
          <Text style={s.codeText}>ls: cannot access {"'"}...{"'"}: <Text style={s.codeHighlight}>No such file or directory</Text></Text>
        </View>

        <View style={s.alertInfo}>
          <Text style={s.alertTitle}>Observation</Text>
          <Text style={s.alertText}>
            Le fichier n{"'"}est plus dans send/. Il a été récupéré par l{"'"}opérateur 03 ou déplacé. Il faut vérifier les logs d{"'"}acquittement pour savoir si un ACR a été reçu.
          </Text>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : AR non reçu — Investigation logs</Text>
          <Text>Page 1 / 2</Text>
        </View>
      </Page>

      {/* PAGE 2 — Acquittement & Conclusion */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Acquittement & Conclusion</Text>
            <Text style={s.headerSub}>Suite de l{"'"}investigation</Text>
          </View>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        {/* Étape 4 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>4</Text></View>
          <Text style={s.stepTitle}>Vérifier l{"'"}acquittement dans PnmAckManager.log</Text>
        </View>

        <Text style={s.body}>
          Rechercher l{"'"}ACR (accusé de réception) dans les logs d{"'"}acquittement :
        </Text>
        <View style={s.codeBlock}>
          <Text style={s.codeText}>$ grep "PNMDATA.02.03.20260309190056.003" /home/porta_pnmv3/PortaSync/log/PnmAckManager.log</Text>
        </View>
        <Text style={s.body}>Résultat :</Text>
        <View style={s.codeBlock}>
          <Text style={s.codeText}>
            PnmDataAckManager.php|2026-03-10T10:00:42-04:00| .........Accusé reçu PNMDATA.02.03.20260309190056.003.ACR ={">"} <Text style={s.codeGreen}>E000</Text>:{'\n'}
            PnmDataAckManager.php|2026-03-10T10:00:42-04:00| .........Archivage du fichier PNMDATA.02.03.20260309190056.003 ...{'\n'}
            PnmDataAckManager.php|2026-03-10T10:00:42-04:00| <Text style={s.codeHighlight}>NOT FOUND!</Text> (pnmdata/03/send/PNMDATA.02.03.20260309190056.003)
          </Text>
        </View>

        <View style={s.alertSuccess}>
          <Text style={s.alertTitle}>Découverte clé</Text>
          <Text style={s.alertText}>
            L{"'"}ACR a bien été reçu le 10/03 à 10:00:42 avec le code E000 (succès). L{"'"}opérateur SFR/Outremer a confirmé la bonne réception du fichier. Cependant, au moment de l{"'"}archivage, le fichier n{"'"}était plus dans send/.
          </Text>
        </View>

        {/* Étape 5 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>5</Text></View>
          <Text style={s.stepTitle}>Analyse et conclusion</Text>
        </View>

        <Text style={s.body}>Synthèse chronologique :</Text>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Heure</Text>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Source</Text>
            <Text style={[s.tableHeaderCell, { width: '50%' }]}>Événement</Text>
          </View>
          {[
            ['09/03 19:01:58', 'PnmDataManager', 'Génération du fichier (70 tickets)', c.green],
            ['09/03 ~20:01', 'PortaSync', 'Timeout AR 60 min → email d\'incident', c.orange],
            ['10/03 10:00:42', 'PnmAckManager', 'ACR E000 reçu (réception confirmée par SFR)', c.green],
            ['10/03 10:00:42', 'PnmAckManager', 'NOT FOUND lors de l\'archivage', c.red],
          ].map(([heure, source, event, color]) => (
            <View key={heure + event} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '25%', fontFamily: 'Courier', fontSize: 7.5 }]}>{heure}</Text>
              <Text style={[s.tableCellLight, { width: '25%' }]}>{source}</Text>
              <Text style={[s.tableCell, { width: '50%', color: color as string }]}>{event}</Text>
            </View>
          ))}
        </View>

        {/* Diagnostic */}
        <View style={s.alertInfo}>
          <Text style={s.alertTitle}>Diagnostic</Text>
          <Text style={s.alertText}>
            Le fichier a été généré, envoyé et <Text style={[s.alertText, { fontWeight: 'bold' }]}>reçu avec succès</Text> par SFR (ACR E000). L{"'"}email d{"'"}incident était un <Text style={[s.alertText, { fontWeight: 'bold' }]}>faux positif</Text> : l{"'"}AR est arrivé après le délai de 60 minutes mais avant la prochaine vacation. Le « NOT FOUND » concerne uniquement l{"'"}archivage local — le fichier a probablement été nettoyé de send/ entre-temps.
          </Text>
        </View>

        {/* Conclusion */}
        <View style={{ backgroundColor: '#E8F5E9', borderLeftWidth: 3, borderLeftColor: c.green, padding: 10, marginVertical: 10, borderRadius: 3 }}>
          <Text style={[s.alertTitle, { color: c.green }]}>Conclusion</Text>
          <Text style={[s.alertText, { fontWeight: 'bold' }]}>
            Pas d{"'"}impact fonctionnel. L{"'"}échange avec SFR/Outremer s{"'"}est bien déroulé.
          </Text>
          <Text style={[s.alertText, { marginTop: 3 }]}>
            Impact mineur : le fichier n{"'"}est pas archivé dans arch_send/ (pas de trace locale).
          </Text>
        </View>

        {/* Points de vigilance */}
        <View style={[s.alertSuccess, { marginTop: 10 }]}>
          <Text style={s.alertTitle}>Points de vigilance</Text>
          <Text style={s.alertText}>• Un email d{"'"}incident AR non reçu ne signifie pas toujours un vrai problème — toujours vérifier les logs d{"'"}acquittement</Text>
          <Text style={s.alertText}>• Le code ACR E000 confirme la bonne réception du fichier par l{"'"}opérateur</Text>
          <Text style={s.alertText}>• Le « NOT FOUND » lors de l{"'"}archivage est un problème mineur de nettoyage, pas un problème d{"'"}échange</Text>
          <Text style={s.alertText}>• L{"'"}ordre d{"'"}investigation : PnmDataManager (génération) → ls send/ (présence) → PnmAckManager (acquittement)</Text>
          <Text style={s.alertText}>• L{"'"}analyseur d{"'"}incidents de PNM App peut parser directement les sorties de ces commandes</Text>
          <Text style={s.alertText}>• Si l{"'"}ACR reçu est différent de E000, investiguer plus en détail le code d{"'"}erreur</Text>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : AR non reçu — Investigation logs</Text>
          <Text>Page 2 / 2</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── Cas #4 — Refus R322 PDF ─────────────────────────────────────────────────

function CasRefusR322Pdf() {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Cas Pratique — Refus R322 : Résiliation effective</Text>
            <Text style={s.headerSub}>Portabilité des Numéros Mobiles V3 — Digicel Antilles-Guyane</Text>
          </View>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        <View style={s.tagRow}>
          {['Refus', 'R322', 'Résiliation', 'Free Caraïbes', 'Numéro perdu'].map((tag) => (
            <Text key={tag} style={s.tag}>{tag}</Text>
          ))}
        </View>

        <Text style={s.body}>
          Ce cas documente un refus de portabilité reçu le <Text style={s.bold}>10/03/2026</Text> dans le fichier PNMDATA.02.06.20260309190056.003. L{"'"}opérateur donneur <Text style={s.bold}>Free Caraïbes (06)</Text> a refusé la demande de portabilité pour le MSISDN <Text style={s.bold}>0694165585</Text> avec le motif <Text style={s.bold}>R322 — Résiliation effective de la ligne objet de la demande</Text>.
        </Text>

        <View style={s.alertError}>
          <Text style={s.alertTitle}>Impact</Text>
          <Text style={s.alertText}>
            Le code R322 signifie que la ligne a été résiliée chez l{"'"}opérateur donneur. Le numéro est définitivement perdu pour le client. Il ne pourra plus être porté. Le client devra obtenir un nouveau numéro.
          </Text>
        </View>

        {/* Étape 1 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>1</Text></View>
          <Text style={s.stepTitle}>Réception de l{"'"}email d{"'"}incident</Text>
        </View>

        <Text style={s.body}>
          L{"'"}email automatique [PNM][INCIDENT] signale 1 refus dans le fichier :
        </Text>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '35%' }]}>Élément</Text>
            <Text style={[s.tableHeaderCell, { width: '65%' }]}>Valeur</Text>
          </View>
          {[
            ['Fichier', 'PNMDATA.02.06.20260309190056.003'],
            ['Ticket', '1220 — Réponse Négative (RN)'],
            ['MSISDN', '0694165585'],
            ['Opérateur donneur', 'Free Caraïbes (06)'],
          ].map(([label, value]) => (
            <View key={label} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '35%', fontWeight: 'bold' }]}>{label}</Text>
              <Text style={[s.tableCell, { width: '65%' }]}>{value}</Text>
            </View>
          ))}
          <View style={s.tableRow}>
            <Text style={[s.tableCell, { width: '35%', fontWeight: 'bold' }]}>Code refus</Text>
            <Text style={[s.tableCell, { width: '65%', color: c.red, fontWeight: 'bold' }]}>R322 — Résiliation effective de la ligne</Text>
          </View>
        </View>

        {/* Étape 2 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>2</Text></View>
          <Text style={s.stepTitle}>Comprendre le motif R322</Text>
        </View>

        <Text style={s.body}>
          Le code <Text style={s.bold}>R322</Text> appartient à la famille des refus définitifs (R3xx) :
        </Text>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '15%' }]}>Code</Text>
            <Text style={[s.tableHeaderCell, { width: '50%' }]}>Signification</Text>
            <Text style={[s.tableHeaderCell, { width: '35%' }]}>Conséquence</Text>
          </View>
          {[
            ['R322', 'Résiliation effective de la ligne objet de la demande de portabilité', 'Numéro perdu — non récupérable', c.red],
            ['R321', 'Demande de résiliation en cours', 'Potentiellement récupérable si résiliation annulée', c.orange],
            ['R502', 'Ligne résiliée (autre formulation)', 'Numéro perdu', c.red],
          ].map(([code, sig, cons, color]) => (
            <View key={code} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '15%', fontWeight: 'bold' }]}>{code}</Text>
              <Text style={[s.tableCellLight, { width: '50%' }]}>{sig}</Text>
              <Text style={[s.tableCell, { width: '35%', color: color as string }]}>{cons}</Text>
            </View>
          ))}
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : Refus R322</Text>
          <Text>Page 1 / 2</Text>
        </View>
      </Page>

      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Cas Pratique — Refus R322 : Résiliation effective (suite)</Text>
            <Text style={s.headerSub}>Portabilité des Numéros Mobiles V3 — Digicel Antilles-Guyane</Text>
          </View>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        <View style={s.alertInfo}>
          <Text style={s.alertTitle}>Cas typique</Text>
          <Text style={s.alertText}>
            Le client a résilié sa ligne chez Free Caraïbes (ou Free l{"'"}a résiliée pour impayé) avant que la demande de portabilité vers Digicel ne soit traitée. La portabilité ne peut aboutir car la ligne n{"'"}existe plus chez l{"'"}opérateur donneur.
          </Text>
        </View>

        {/* Étape 3 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>3</Text></View>
          <Text style={s.stepTitle}>Vérifier le dossier sur PortaWs</Text>
        </View>

        <Text style={s.body}>
          Sur <Text style={s.bold}>PortaWebUI</Text>, rechercher le MSISDN 0694165585 pour confirmer :
        </Text>

        <View style={s.listItem}>
          <Text style={s.listBullet}>•</Text>
          <Text style={s.listText}>Le mandat doit être passé à l{"'"}état <Text style={s.bold}>"Refusé"</Text></Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>•</Text>
          <Text style={s.listText}>Le ticket 1110 (Demande de Portage) a été émis par Digicel</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>•</Text>
          <Text style={s.listText}>Le ticket 1220 (Réponse Négative) a été reçu de Free avec le code R322</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>•</Text>
          <Text style={s.listText}>Aucune action corrective possible côté Digicel</Text>
        </View>

        {/* Étape 4 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>4</Text></View>
          <Text style={s.stepTitle}>Informer le commercial et le client</Text>
        </View>

        <Text style={s.body}>
          Le commercial qui a initié la demande de portabilité doit être informé :
        </Text>

        <View style={{ backgroundColor: '#F4F6F8', borderRadius: 3, padding: 8, marginVertical: 6 }}>
          <Text style={{ fontSize: 8, fontStyle: 'italic', marginBottom: 3 }}>Bonjour,</Text>
          <Text style={{ fontSize: 8, lineHeight: 1.5 }}>
            La demande de portabilité pour le <Text style={s.bold}>0694165585</Text> a été refusée par Free Caraïbes avec le motif <Text style={s.bold}>R322 — Résiliation effective de la ligne</Text>.{'\n'}
            Le numéro a été résilié chez l{"'"}opérateur donneur et ne peut plus être porté.{'\n'}
            Le client devra souscrire avec un nouveau numéro.
          </Text>
        </View>

        {/* Points de vigilance */}
        <View style={[s.alertSuccess, { marginTop: 10 }]}>
          <Text style={s.alertTitle}>Points de vigilance</Text>
          <Text style={s.alertText}>• R322 est un refus définitif — aucune relance possible</Text>
          <Text style={s.alertText}>• Ne pas confondre R322 (résiliation effective) avec R321 (résiliation en cours) qui peut être réversible</Text>
          <Text style={s.alertText}>• Vérifier si le client a d{"'"}autres lignes en cours de portabilité qui pourraient être impactées</Text>
          <Text style={s.alertText}>• Si le client conteste la résiliation, il doit contacter directement Free Caraïbes — Digicel n{"'"}a aucun levier</Text>
          <Text style={s.alertText}>• Documenter le cas dans le suivi quotidien pour traçabilité</Text>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : Refus R322</Text>
          <Text>Page 2 / 2</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── Cas #5 — Annulation 1510/C001 PDF ───────────────────────────────────────

function CasAnnulation1510Pdf() {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Document>
      {/* PAGE 1 */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Cas Pratique — Annulation 1510/C001</Text>
            <Text style={s.headerSub}>Portabilité des Numéros Mobiles V3 — Digicel Antilles-Guyane</Text>
          </View>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        <View style={s.tagRow}>
          {['Annulation', 'Ticket 1510', 'C001', 'Orange Caraïbe', 'Free Caraïbes'].map((tag) => (
            <Text key={tag} style={s.tag}>{tag}</Text>
          ))}
        </View>

        <Text style={s.body}>
          Ce cas documente deux annulations de portage traitées le <Text style={s.bold}>10/03/2026</Text>. Une annulation est signalée par un ticket <Text style={s.bold}>1510</Text> (Demande d{"'"}Annulation) suivi d{"'"}un ticket <Text style={s.bold}>1520</Text> (Réponse d{"'"}Annulation) avec le code <Text style={s.bold}>C001</Text> (Acceptation).
        </Text>

        <View style={s.alertWarning}>
          <Text style={s.alertTitle}>Contexte</Text>
          <Text style={s.alertText}>
            L{"'"}annulation d{"'"}un portage peut être initiée par l{"'"}OPR (opérateur receveur) ou l{"'"}OPD (opérateur donneur) <Text style={s.bold}>avant</Text> la date de portage effective. Une fois la date de portage passée, l{"'"}annulation n{"'"}est plus possible. Le code C001 dans le ticket 1520 confirme que l{"'"}annulation est acceptée.
          </Text>
        </View>

        {/* Cas A */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>A</Text></View>
          <Text style={s.stepTitle}>Digicel (OPR) annule un portage sortant</Text>
        </View>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '35%' }]}>Élément</Text>
            <Text style={[s.tableHeaderCell, { width: '65%' }]}>Valeur</Text>
          </View>
          {[
            ['Fichier', 'PNMDATA.02.01.20260309190056.003'],
            ['Ticket', '1510 — Demande d\'Annulation (DA)'],
            ['MSISDN', '0696001019'],
            ['OPR (receveur)', 'Digicel (02) — initiateur de l\'annulation'],
            ['OPD (donneur)', 'Orange Caraïbe (01)'],
          ].map(([label, value]) => (
            <View key={label} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '35%', fontWeight: 'bold' }]}>{label}</Text>
              <Text style={[s.tableCell, { width: '65%' }]}>{value}</Text>
            </View>
          ))}
          <View style={s.tableRow}>
            <Text style={[s.tableCell, { width: '35%', fontWeight: 'bold' }]}>Code réponse</Text>
            <Text style={[s.tableCell, { width: '65%', color: c.green, fontWeight: 'bold' }]}>C001 — Acceptation de l{"'"}annulation</Text>
          </View>
        </View>

        <View style={s.alertInfo}>
          <Text style={s.alertTitle}>Scénario</Text>
          <Text style={s.alertText}>
            Digicel a émis une demande de portabilité (1110) pour le 0696001019 depuis Orange Caraïbe, puis a décidé d{"'"}annuler (1510) avant la date de portage. Orange a accepté (1520/C001). Le client reste chez Orange Caraïbe.
          </Text>
        </View>

        {/* Cas B */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>B</Text></View>
          <Text style={s.stepTitle}>Free Caraïbes (OPD) annule un portage entrant</Text>
        </View>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '35%' }]}>Élément</Text>
            <Text style={[s.tableHeaderCell, { width: '65%' }]}>Valeur</Text>
          </View>
          {[
            ['Fichier', 'PNMDATA.06.02.20260309180222.001'],
            ['Ticket', '1510 — Demande d\'Annulation (DA)'],
            ['MSISDN', '0696525199'],
            ['OPR (receveur)', 'Digicel (02)'],
            ['OPD (donneur)', 'Free Caraïbes (06) — initiateur de l\'annulation'],
          ].map(([label, value]) => (
            <View key={label} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '35%', fontWeight: 'bold' }]}>{label}</Text>
              <Text style={[s.tableCell, { width: '65%' }]}>{value}</Text>
            </View>
          ))}
          <View style={s.tableRow}>
            <Text style={[s.tableCell, { width: '35%', fontWeight: 'bold' }]}>Code réponse</Text>
            <Text style={[s.tableCell, { width: '65%', color: c.green, fontWeight: 'bold' }]}>C001 — Acceptation de l{"'"}annulation</Text>
          </View>
        </View>

        <View style={s.alertWarning}>
          <Text style={s.alertTitle}>Scénario</Text>
          <Text style={s.alertText}>
            Digicel avait demandé la portabilité (1110) du 0696525199 depuis Free Caraïbes. Free a annulé la demande (1510) avant la date de portage. Le système a automatiquement accepté (1520/C001). Le client reste chez Free Caraïbes. Il faut investiguer la raison auprès de Free.
          </Text>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : Annulation 1510/C001</Text>
          <Text>Page 1 / 2</Text>
        </View>
      </Page>

      {/* PAGE 2 — Investigation & Actions */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Investigation & Actions</Text>
            <Text style={s.headerSub}>Suite de la procédure</Text>
          </View>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>3</Text></View>
          <Text style={s.stepTitle}>Vérifier sur PortaWs et comprendre</Text>
        </View>

        <Text style={s.body}>Pour chaque annulation, vérifier sur <Text style={s.bold}>PortaWebUI</Text> :</Text>

        <View style={s.listItem}>
          <Text style={s.listBullet}>•</Text>
          <Text style={s.listText}>Le mandat doit être passé à l{"'"}état <Text style={s.bold}>"Annulé"</Text></Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>•</Text>
          <Text style={s.listText}>Identifier qui a initié le 1510 : <Text style={s.bold}>OPR</Text> (col.2 = code opérateur émetteur du 1510) ou <Text style={s.bold}>OPD</Text></Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>•</Text>
          <Text style={s.listText}>Si annulation par <Text style={s.bold}>Digicel (OPR)</Text> : le commercial a probablement demandé l{"'"}annulation (client a changé d{"'"}avis)</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>•</Text>
          <Text style={s.listText}>Si annulation par <Text style={s.bold}>l{"'"}OPD</Text> : contacter l{"'"}opérateur pour connaître le motif (erreur, client a repris contact, etc.)</Text>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>4</Text></View>
          <Text style={s.stepTitle}>Actions à mener</Text>
        </View>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '40%' }]}>Situation</Text>
            <Text style={[s.tableHeaderCell, { width: '60%' }]}>Action</Text>
          </View>
          {[
            ['Annulation par Digicel (demandée)', 'Aucune action — annulation normale suite à demande interne'],
            ['Annulation par l\'OPD (inattendue)', 'Contacter l\'OPD par email pour connaître le motif. Si le client souhaite toujours porter, relancer une nouvelle demande 1110'],
            ['Client souhaite reporter la portabilité', 'Créer un nouveau mandat avec une nouvelle date de portage'],
          ].map(([situation, action]) => (
            <View key={situation} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '40%', fontWeight: 'bold' }]}>{situation}</Text>
              <Text style={[s.tableCellLight, { width: '60%' }]}>{action}</Text>
            </View>
          ))}
        </View>

        <View style={[s.alertSuccess, { marginTop: 10 }]}>
          <Text style={s.alertTitle}>Points de vigilance</Text>
          <Text style={s.alertText}>• L{"'"}annulation (1510) n{"'"}est possible que <Text style={s.bold}>avant</Text> la date de portage effective</Text>
          <Text style={s.alertText}>• Le code <Text style={s.bold}>C001</Text> signifie que l{"'"}annulation est acceptée — le mandat est clos</Text>
          <Text style={s.alertText}>• Si l{"'"}annulation est refusée (code différent de C001), le portage continue normalement</Text>
          <Text style={s.alertText}>• Vérifier dans la colonne 2 du ticket 1510 qui est l{"'"}émetteur pour identifier l{"'"}initiateur</Text>
          <Text style={s.alertText}>• Si l{"'"}annulation vient de l{"'"}OPD et est inattendue, <Text style={s.bold}>toujours contacter</Text> pour comprendre</Text>
          <Text style={s.alertText}>• Un nouveau 1110 peut être émis après une annulation si le client souhaite toujours porter</Text>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : Annulation 1510/C001</Text>
          <Text>Page 2 / 2</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── Cas #6 — Erreur E610 PDF ────────────────────────────────────────────────

function CasErreurE610Pdf() {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Cas Pratique — Erreur E610 : Flux non attendu</Text>
            <Text style={s.headerSub}>Portabilité des Numéros Mobiles V3 — Digicel Antilles-Guyane</Text>
          </View>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        <View style={s.tagRow}>
          {['Erreur', 'E610', 'Restitution', 'Orange Caraïbe', 'Ticket 7000'].map((tag) => (
            <Text key={tag} style={s.tag}>{tag}</Text>
          ))}
        </View>

        <Text style={s.body}>
          Ce cas documente deux erreurs E610 reçues le <Text style={s.bold}>10/03/2026</Text> dans le fichier <Text style={s.code}>PNMDATA.02.01.20260309190056.003</Text> envoyé par <Text style={s.bold}>Orange Caraïbe (01)</Text>. Les tickets 7000 signalent un <Text style={s.bold}>flux non attendu dans la procédure</Text> pour deux MSISDN en cours de restitution.
        </Text>

        <View style={s.alertWarning}>
          <Text style={s.alertTitle}>Contexte</Text>
          <Text style={s.alertText}>
            L{"'"}erreur E610 survient quand le système reçoit un ticket qui ne correspond pas à la séquence attendue pour un portage en cours. Par exemple, recevoir un 3420 (Réponse de Restitution) alors qu{"'"}aucun 3410 (Demande de Restitution) n{"'"}a été émis pour cet ID portage, ou un ticket dans une procédure déjà terminée.
          </Text>
        </View>

        {/* Étape 1 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>1</Text></View>
          <Text style={s.stepTitle}>Réception de l{"'"}email d{"'"}incident</Text>
        </View>

        <Text style={s.body}>L{"'"}email <Text style={s.code}>[PNM][INCIDENT]</Text> signale 2 erreurs dans le fichier :</Text>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '30%' }]}>MSISDN</Text>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Ticket</Text>
            <Text style={[s.tableHeaderCell, { width: '45%' }]}>Erreur</Text>
          </View>
          {[
            ['0690688569', '7000 — Signalement d\'erreur', 'E610 — Flux non attendu dans la procédure'],
            ['0696386384', '7000 — Signalement d\'erreur', 'E610 — Flux non attendu dans la procédure'],
          ].map(([msisdn, ticket, erreur]) => (
            <View key={msisdn} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '30%', fontWeight: 'bold' }]}>{msisdn}</Text>
              <Text style={[s.tableCellLight, { width: '25%' }]}>{ticket}</Text>
              <Text style={[s.tableCell, { width: '45%', color: c.red, fontWeight: 'bold' }]}>{erreur}</Text>
            </View>
          ))}
        </View>

        {/* Étape 2 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>2</Text></View>
          <Text style={s.stepTitle}>Comprendre l{"'"}erreur E610</Text>
        </View>

        <Text style={s.body}>L{"'"}E610 appartient à la famille des erreurs de procédure (E6xx) :</Text>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '15%' }]}>Code</Text>
            <Text style={[s.tableHeaderCell, { width: '85%' }]}>Signification</Text>
          </View>
          {[
            ['E610', 'L\'ID portage existe déjà mais un flux (ticket) non attendu a été reçu dans la procédure en cours'],
            ['E601', 'Date de portabilité non conforme'],
            ['E607', 'ID portage inconnu'],
          ].map(([code, sig]) => (
            <View key={code} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '15%', fontWeight: 'bold', color: code === 'E610' ? c.red : c.dark }]}>{code}</Text>
              <Text style={[s.tableCellLight, { width: '85%' }]}>{sig}</Text>
            </View>
          ))}
        </View>

        <View style={s.alertInfo}>
          <Text style={s.alertTitle}>Flux de restitution attendu</Text>
          <Text style={s.alertText}>
            La procédure de restitution suit la séquence : <Text style={s.alertTitle}>3400</Text> (Notification) → <Text style={s.alertTitle}>3410</Text> (Demande) → <Text style={s.alertTitle}>3420</Text> (Réponse) → <Text style={s.alertTitle}>3430</Text> (Confirmation). Si un ticket arrive en dehors de cette séquence, le système génère un 7000/E610.
          </Text>
        </View>

        {/* Étape 3 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>3</Text></View>
          <Text style={s.stepTitle}>Investiguer sur PortaWs et DAPI</Text>
        </View>

        <Text style={s.body}>Pour chaque MSISDN concerné :</Text>

        <View style={s.listItem}>
          <Text style={s.listBullet}>1.</Text>
          <Text style={s.listText}><Text style={s.bold}>PortaWebUI</Text> : Rechercher le MSISDN dans Supervision → Liste des mandats. Vérifier l{"'"}état actuel et l{"'"}historique des tickets reçus/émis.</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>2.</Text>
          <Text style={s.listText}><Text style={s.bold}>DAPI PortaWs</Text> : Dans la vue portage du MSISDN, vérifier la séquence des tickets. L{"'"}analyseur d{"'"}incidents peut parser la vue DAPI pour identifier le ticket manquant ou en trop.</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>3.</Text>
          <Text style={s.listText}><Text style={s.bold}>Logs serveur</Text> : Vérifier dans <Text style={s.code}>PnmDataManager.log</Text> si des tickets liés à ces MSISDN ont été générés récemment.</Text>
        </View>

        <View style={s.codeBlock}>
          <Text style={s.codeText}>$ grep -E "0690688569|0696386384" /home/porta_pnmv3/PortaSync/log/PnmDataManager.log</Text>
        </View>

        {/* Étape 4 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>4</Text></View>
          <Text style={s.stepTitle}>Actions selon le diagnostic</Text>
        </View>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '35%' }]}>Diagnostic</Text>
            <Text style={[s.tableHeaderCell, { width: '65%' }]}>Action</Text>
          </View>
          {[
            ['Ticket reçu en double (duplicata)', 'Pas d\'action — le système a ignoré le doublon. Surveiller que le portage continue normalement.'],
            ['Désynchronisation OPR/OPD', 'Contacter Orange Caraïbe pour resynchroniser les états du portage. Fournir les détails des tickets.'],
            ['Portage déjà terminé', 'Si le portage/restitution est déjà finalisé, ignorer l\'erreur. Vérifier que le numéro est bien attribué au bon opérateur.'],
            ['Problème récurrent', 'Si E610 récurrent avec le même opérateur, escalader au GPMAG avec l\'historique.'],
          ].map(([diag, action]) => (
            <View key={diag} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '35%', fontWeight: 'bold' }]}>{diag}</Text>
              <Text style={[s.tableCellLight, { width: '65%' }]}>{action}</Text>
            </View>
          ))}
        </View>

        {/* Points de vigilance */}
        <View style={[s.alertSuccess, { marginTop: 10 }]}>
          <Text style={s.alertTitle}>Points de vigilance</Text>
          <Text style={s.alertText}>• E610 est souvent <Text style={s.bold}>sans impact fonctionnel</Text> — le portage continue malgré l{"'"}erreur</Text>
          <Text style={s.alertText}>• Toujours vérifier l{"'"}état actuel du mandat sur PortaWs avant d{"'"}agir</Text>
          <Text style={s.alertText}>• L{"'"}analyseur DAPI de PNM App peut aider à visualiser la séquence des tickets et identifier l{"'"}anomalie</Text>
          <Text style={s.alertText}>• Si plusieurs MSISDN sont impactés dans le même fichier, ils partagent probablement la même cause racine</Text>
          <Text style={s.alertText}>• Les erreurs E6xx sont des erreurs de <Text style={s.bold}>procédure</Text>, pas des erreurs techniques — elles reflètent un problème de séquencement</Text>
          <Text style={s.alertText}>• En cas de doute, escalader à l{"'"}équipe <Text style={s.bold}>PNM_SI</Text> et créer un flashinfo si l{"'"}incident dure</Text>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : Erreur E610</Text>
          <Text>Page 1 / 1</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── Cas 7 : Fichier déjà reçu E008 ─────────────────────────────────────────

function CasFichierDejaRecuPdf() {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Cas Pratique — Fichier déjà reçu (E008)</Text>
            <Text style={s.headerSub}>Portabilité des Numéros Mobiles V3 — Digicel Antilles-Guyane</Text>
          </View>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        <View style={s.tagRow}>
          {['E008', 'Fichier doublon', 'FileZilla', 'SFR / Outremer', 'Suppression manuelle'].map((tag) => (
            <Text key={tag} style={s.tag}>{tag}</Text>
          ))}
        </View>

        <Text style={s.body}>
          Ce cas documente un incident rencontré le <Text style={s.bold}>10/03/2026</Text> : le fichier <Text style={s.code}>PNMDATA.03.02.20260309161154.001</Text> envoyé par <Text style={s.bold}>SFR / Outremer Telecom (03)</Text> a été déposé une seconde fois dans le répertoire <Text style={s.code}>recv/</Text> alors qu{"'"}il avait déjà été traité et archivé dans <Text style={s.code}>arch_recv/</Text>. Le script <Text style={s.code}>PnmDataAckManager</Text> retourne l{"'"}erreur <Text style={{ ...s.bold, color: c.red }}>E008 — Fichier déjà reçu</Text>.
        </Text>

        <View style={s.alertError}>
          <Text style={s.alertTitle}>Impact</Text>
          <Text style={s.alertText}>
            Tant que le fichier doublon reste dans <Text style={s.alertTitle}>recv/</Text>, le script <Text style={s.alertTitle}>PnmDataAckManager</Text> tente de le traiter à chaque exécution et échoue avec l{"'"}erreur E008. Le log est pollué par les enveloppes SOAP XML du fichier et le message d{"'"}erreur. Le fichier doit être supprimé manuellement.
          </Text>
        </View>

        {/* Étape 1 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>1</Text></View>
          <Text style={s.stepTitle}>Détection dans les logs PnmAckManager</Text>
        </View>

        <Text style={s.body}>En exécutant <Text style={s.bold}>tail -f PnmAckManager.log</Text> ou <Text style={s.bold}>./PnmDataAckManager.sh -v</Text>, on observe les messages suivants :</Text>

        <View style={s.codeBlock}>
          <Text style={s.codeText}>PnmDataAckManager.php|2026-03-10T15:50:01-04:00| Initialisation</Text>
          <Text style={{ ...s.codeText, color: c.green }}>..Verification operateur Orange Caraibe : Check success</Text>
          <Text style={{ ...s.codeText, color: c.green }}>..Verification operateur Digicel AFG : Check success</Text>
          <Text style={{ ...s.codeText, color: c.green }}>..Verification operateur Outremer Telecom / SFR : Check success</Text>
          <Text style={{ ...s.codeText, color: c.green }}>..Verification operateur Dauphin Telecom : Check success</Text>
          <Text style={{ ...s.codeText, color: c.green }}>..Verification operateur UTS Caraibe : Check success</Text>
          <Text style={{ ...s.codeText, color: c.green }}>..Verification operateur Free Caraibes : Check success</Text>
          <Text style={s.codeText}>Fin Initialisation</Text>
          <Text style={s.codeText}>(enveloppe SOAP XML complète du fichier PNMDATA — 169 tickets)</Text>
          <Text style={s.codeText}> </Text>
          <Text style={{ ...s.codeText, color: c.red }}>Error Message : Exception during service.registerFichier(...)</Text>
          <Text style={{ ...s.codeText, color: c.red }}>  porta.exception._E0XX.PnmExceptionE008:</Text>
          <Text style={{ ...s.codeText, color: c.red }}>  [E008:0] Fichier déja reçus : PNMDATA.03.02.20260309161154.001</Text>
          <Text style={s.codeText}> </Text>
          <Text style={{ ...s.codeText, color: c.red }}>..........ERREUR : Echec de notification pour fichier reçu</Text>
          <Text style={{ ...s.codeText, color: c.red }}>  PNMDATA.03.02.20260309161154.001 : l{"'"}appel au WS a retourné une erreur!</Text>
          <Text style={s.codeText}>Fin de Traitement 0.04secondes.</Text>
        </View>

        <View style={s.alertInfo}>
          <Text style={s.alertTitle}>Observation clé</Text>
          <Text style={s.alertText}>
            L{"'"}erreur <Text style={s.alertTitle}>PnmExceptionE008</Text> indique que le fichier est déjà enregistré dans le système (présent dans <Text style={s.alertTitle}>arch_recv/</Text>). Le script affiche l{"'"}intégralité de l{"'"}enveloppe SOAP XML du fichier dans le log, ce qui le rend difficilement lisible.
          </Text>
        </View>

        {/* Étape 2 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>2</Text></View>
          <Text style={s.stepTitle}>Vérifier la présence du fichier</Text>
        </View>

        <Text style={s.body}>Confirmer que le fichier est bien dans <Text style={s.code}>recv/</Text> (doublon) et dans <Text style={s.code}>arch_recv/</Text> (original) :</Text>

        <View style={s.codeBlock}>
          <Text style={s.codeText}>$ ls -la /home/porta_pnmv3/PortaSync/pnmdata/03/recv/PNMDATA.03.02.20260309161154.001</Text>
          <Text style={{ ...s.codeText, color: c.green }}>-rw-r--r-- 1 porta_pnmv3 ... PNMDATA.03.02.20260309161154.001</Text>
          <Text style={s.codeText}> </Text>
          <Text style={s.codeText}>$ ls -la /home/porta_pnmv3/PortaSync/pnmdata/03/arch_recv/PNMDATA.03.02.20260309161154.001</Text>
          <Text style={{ ...s.codeText, color: c.green }}>-rw-r--r-- 1 porta_pnmv3 ... PNMDATA.03.02.20260309161154.001</Text>
        </View>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Répertoire</Text>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Fichier présent ?</Text>
            <Text style={[s.tableHeaderCell, { width: '50%' }]}>Signification</Text>
          </View>
          {[
            ['recv/', 'Oui (doublon)', 'Fichier renvoyé par l\'opérateur — à supprimer'],
            ['arch_recv/', 'Oui (original)', 'Fichier déjà traité et archivé — preuve que le traitement initial a fonctionné'],
          ].map(([rep, present, sig]) => (
            <View key={rep} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '25%', fontWeight: 'bold' }]}>{rep}</Text>
              <Text style={[s.tableCell, { width: '25%', color: rep === 'recv/' ? c.red : c.green, fontWeight: 'bold' }]}>{present}</Text>
              <Text style={[s.tableCellLight, { width: '50%' }]}>{sig}</Text>
            </View>
          ))}
        </View>

        {/* Étape 3 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>3</Text></View>
          <Text style={s.stepTitle}>Supprimer le fichier doublon de recv/</Text>
        </View>

        <View style={s.listItem}>
          <Text style={s.listBullet}>1.</Text>
          <Text style={s.listText}>Se connecter à <Text style={s.bold}>vmqproportasync01</Text> via FileZilla (SFTP)</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>2.</Text>
          <Text style={s.listText}>Naviguer vers <Text style={s.bold}>/home/porta_pnmv3/PortaSync/pnmdata/03/recv/</Text></Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>3.</Text>
          <Text style={s.listText}>Sélectionner <Text style={s.bold}>PNMDATA.03.02.20260309161154.001</Text> et le supprimer</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>4.</Text>
          <Text style={s.listText}>Vérifier que le fichier n{"'"}est plus dans recv/</Text>
        </View>

        {/* Étape 4 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>4</Text></View>
          <Text style={s.stepTitle}>Vérifier le bon fonctionnement</Text>
        </View>

        <Text style={s.body}>Relancer le script pour confirmer que l{"'"}erreur a disparu :</Text>

        <View style={s.codeBlock}>
          <Text style={s.codeText}>$ ./PnmDataAckManager.sh -v</Text>
          <Text style={s.codeText}>PnmDataAckManager.php|2026-03-10T16:38:58-04:00| Initialisation</Text>
          <Text style={{ ...s.codeText, color: c.green }}>..Verification operateur Orange Caraibe : Check success</Text>
          <Text style={{ ...s.codeText, color: c.green }}>..Verification operateur Digicel AFG : Check success</Text>
          <Text style={{ ...s.codeText, color: c.green }}>..Verification operateur Outremer Telecom / SFR : Check success</Text>
          <Text style={{ ...s.codeText, color: c.green }}>..Verification operateur Dauphin Telecom : Check success</Text>
          <Text style={{ ...s.codeText, color: c.green }}>..Verification operateur UTS Caraibe : Check success</Text>
          <Text style={{ ...s.codeText, color: c.green }}>..Verification operateur Free Caraibes : Check success</Text>
          <Text style={s.codeText}>Fin Initialisation</Text>
          <Text style={{ ...s.codeText, color: c.green, fontWeight: 'bold' }}>Fin de Traitement 0.01secondes.</Text>
        </View>

        <View style={s.alertSuccess}>
          <Text style={s.alertTitle}>Résultat</Text>
          <Text style={s.alertText}>
            Le script s{"'"}exécute sans erreur. Aucun fichier à traiter, fin de traitement immédiate (0.01s vs 0.04s avec le fichier doublon). Le problème est résolu.
          </Text>
        </View>

        {/* Points de vigilance */}
        <View style={[s.alertSuccess, { marginTop: 10 }]}>
          <Text style={s.alertTitle}>Points de vigilance</Text>
          <Text style={s.alertText}>• Toujours vérifier que le fichier existe dans arch_recv/ AVANT de supprimer celui de recv/</Text>
          <Text style={s.alertText}>• Ne JAMAIS supprimer le fichier de arch_recv/ — c{"'"}est la trace du traitement original</Text>
          <Text style={s.alertText}>• L{"'"}erreur E008 est sans impact fonctionnel — le fichier a déjà été traité</Text>
          <Text style={s.alertText}>• Si le même opérateur renvoie régulièrement des fichiers en double, signaler le problème par email</Text>
          <Text style={s.alertText}>• Le log SOAP XML dans PnmAckManager.log peut être très volumineux — ne pas s{"'"}alarmer de la taille</Text>
          <Text style={s.alertText}>• Après suppression, toujours relancer <Text style={s.code}>./PnmDataAckManager.sh -v</Text> pour confirmer la résolution</Text>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : Fichier déjà reçu E008</Text>
          <Text>Page 1 / 1</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── Cas #8 — PortaWs Inaccessible PDF ──────────────────────────────────────

function CasPortaWsInaccessiblePdf() {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Cas Pratique — PortaWs inaccessible</Text>
            <Text style={s.headerSub}>Portabilité des Numéros Mobiles V3 — Digicel Antilles-Guyane</Text>
          </View>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        <View style={s.tagRow}>
          {['PortaWs', 'Portail', 'Incident', 'Tomcat', 'Infrastructure'].map((tag) => (
            <Text key={tag} style={s.tag}>{tag}</Text>
          ))}
        </View>

        <Text style={s.body}>
          Le portail <Text style={s.bold}>PortaWebUI</Text> ne répond plus. L{"'"}accès par le navigateur retourne une page blanche, un timeout ou une erreur HTTP (502, 503). Ce cas couvre les différentes causes possibles et la démarche de diagnostic.
        </Text>

        <View style={s.alertError}>
          <Text style={s.alertTitle}>Impact</Text>
          <Text style={s.alertText}>Sans PortaWs, impossible de consulter les mandats, vérifier les états de portabilité ou utiliser le DAPI. Les opérations de portabilité continuent en arrière-plan mais la visibilité est perdue.</Text>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>1</Text></View>
          <Text style={s.stepTitle}>Diagnostic initial</Text>
        </View>

        <Text style={s.body}>Vérifier d{"'"}abord si le problème est local ou général :</Text>

        <View style={s.listItem}>
          <Text style={s.listBullet}>1.</Text>
          <Text style={s.listText}>Tester l{"'"}accès depuis un autre navigateur / poste</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>2.</Text>
          <Text style={s.listText}>Vérifier que le VPN est connecté (si accès distant)</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>3.</Text>
          <Text style={s.listText}>Tester un <Text style={s.code}>ping</Text> vers le serveur PortaWs</Text>
        </View>

        <View style={s.alertInfo}>
          <Text style={s.alertTitle}>Serveurs et URLs de production</Text>
          <Text style={s.alertText}>{"•"} <Text style={{ fontWeight: 'bold' }}>PortaWebUi</Text> (CDC) : http://172.24.119.71:8080/PortaWebUi/ — serveur <Text style={{ fontWeight: 'bold' }}>vmqproportaweb01</Text></Text>
          <Text style={s.alertText}>{"•"} <Text style={{ fontWeight: 'bold' }}>PortaWs</Text> (Admin) : http://172.24.119.72:8080/PortaWs/ — serveur <Text style={{ fontWeight: 'bold' }}>vmqproportaws01</Text></Text>
          <Text style={s.alertText}>{"•"} <Text style={{ fontWeight: 'bold' }}>Base de données</Text> : vmqproportawebdb01 — MySQL :3306 (PortaDB + PortaWebDB)</Text>
          <Text style={s.alertText}>{"•"} <Text style={{ fontWeight: 'bold' }}>Nagios PortaWebUi</Text> : http://digimqmon05/nagios/cgi-bin/extinfo.cgi?type=1&amp;host=vmqproportaweb01</Text>
          <Text style={s.alertText}>{"•"} <Text style={{ fontWeight: 'bold' }}>Nagios PortaWs</Text> : http://digimqmon05/nagios/cgi-bin/extinfo.cgi?type=1&amp;host=vmqproportaws01</Text>
        </View>

        <View style={s.codeBlock}>
          <Text style={s.codeText}># Vérifier les portails</Text>
          <Text style={s.codeText}>ping 172.24.119.71    # vmqproportaweb01 (PortaWebUi)</Text>
          <Text style={s.codeText}>ping 172.24.119.72    # vmqproportaws01 (PortaWs)</Text>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique — PortaWs inaccessible</Text>
          <Text>Page 1 / 3</Text>
        </View>
      </Page>

      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Cas Pratique — PortaWs inaccessible (suite)</Text>
            <Text style={s.headerSub}>Portabilité des Numéros Mobiles V3 — Digicel Antilles-Guyane</Text>
          </View>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>2</Text></View>
          <Text style={s.stepTitle}>Arbre de décision</Text>
        </View>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '22%' }]}>Symptôme</Text>
            <Text style={[s.tableHeaderCell, { width: '22%' }]}>Cause probable</Text>
            <Text style={[s.tableHeaderCell, { width: '28%' }]}>Vérification</Text>
            <Text style={[s.tableHeaderCell, { width: '28%' }]}>Résolution</Text>
          </View>
          <View style={s.tableRow}>
            <Text style={[s.tableCell, { width: '22%', fontWeight: 'bold' }]}>Timeout / connexion refusée</Text>
            <Text style={[s.tableCell, { width: '22%', color: c.red }]}>Tomcat arrêté</Text>
            <Text style={[s.tableCellLight, { width: '28%' }]}>Nagios : systemctl status tomcat</Text>
            <Text style={[s.tableCellLight, { width: '28%' }]}>Recharger via http://172.24.119.72:8080/manager/html ou systemctl restart tomcat</Text>
          </View>
          <View style={s.tableRow}>
            <Text style={[s.tableCell, { width: '22%', fontWeight: 'bold' }]}>Erreur 502 / 503</Text>
            <Text style={[s.tableCell, { width: '22%', color: c.red }]}>Application non déployée ou crash</Text>
            <Text style={[s.tableCellLight, { width: '28%' }]}>Logs Tomcat : catalina.out</Text>
            <Text style={[s.tableCellLight, { width: '28%' }]}>Si Tomcat bloqué : kill -9 sur le PID Java puis systemctl restart tomcat</Text>
          </View>
          <View style={s.tableRow}>
            <Text style={[s.tableCell, { width: '22%', fontWeight: 'bold' }]}>Page blanche / erreur DB</Text>
            <Text style={[s.tableCell, { width: '22%', color: c.orange }]}>Base PortaDB injoignable</Text>
            <Text style={[s.tableCellLight, { width: '28%' }]}>Tester MySQL :3306 sur vmqproportawebdb01</Text>
            <Text style={[s.tableCellLight, { width: '28%' }]}>Vérifier le service MySQL, espace disque sur vmqproportawebdb01 (172.24.119.68)</Text>
          </View>
          <View style={s.tableRow}>
            <Text style={[s.tableCell, { width: '22%', fontWeight: 'bold' }]}>Erreur certificat / HTTPS</Text>
            <Text style={[s.tableCell, { width: '22%', color: c.orange }]}>Certificat SSL expiré</Text>
            <Text style={[s.tableCellLight, { width: '28%' }]}>Vérifier la date d{"'"}expiration du certificat</Text>
            <Text style={[s.tableCellLight, { width: '28%' }]}>Renouveler le certificat, redémarrer Tomcat</Text>
          </View>
          <View style={s.tableRow}>
            <Text style={[s.tableCell, { width: '22%', fontWeight: 'bold' }]}>Ping OK mais HTTP timeout</Text>
            <Text style={[s.tableCell, { width: '22%', color: c.blue }]}>Pare-feu / port bloqué</Text>
            <Text style={[s.tableCellLight, { width: '28%' }]}>telnet &lt;adresse&gt; 8443</Text>
            <Text style={[s.tableCellLight, { width: '28%' }]}>Contacter l{"'"}équipe réseau pour ouvrir le port</Text>
          </View>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique — PortaWs inaccessible</Text>
          <Text>Page 2 / 3</Text>
        </View>
      </Page>

      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Cas Pratique — PortaWs inaccessible (suite)</Text>
            <Text style={s.headerSub}>Portabilité des Numéros Mobiles V3 — Digicel Antilles-Guyane</Text>
          </View>
          <Text style={s.headerSub}>{today}</Text>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>3</Text></View>
          <Text style={s.stepTitle}>Vérifications sur le serveur</Text>
        </View>

        <Text style={s.body}>Se connecter en SSH et vérifier selon le portail concerné :</Text>

        <View style={s.codeBlock}>
          <Text style={s.codeText}># === PortaWs (vmqproportaws01 — 172.24.119.72) ===</Text>
          <Text style={s.codeText}># Se connecter en root sur vmqproportaws01</Text>
          <Text style={s.codeText}> </Text>
          <Text style={s.codeText}># 1. Vérifier Tomcat</Text>
          <Text style={s.codeText}>systemctl status tomcat</Text>
          <Text style={s.codeText}> </Text>
          <Text style={s.codeText}># 2. Si Tomcat est down → le relancer</Text>
          <Text style={{ ...s.codeText, color: '#fbbf24' }}>systemctl restart tomcat</Text>
          <Text style={s.codeText}> </Text>
          <Text style={s.codeText}># 3. Si Tomcat est bloqué (refuse de redémarrer) → kill -9 puis relancer</Text>
          <Text style={s.codeText}>ps aux | grep java   # trouver le PID</Text>
          <Text style={{ ...s.codeText, color: '#fbbf24' }}>kill -9 &lt;PID_JAVA&gt;</Text>
          <Text style={{ ...s.codeText, color: '#fbbf24' }}>systemctl restart tomcat</Text>
          <Text style={s.codeText}> </Text>
          <Text style={s.codeText}># 4. Alternative : recharger l{"'"}app via l{"'"}interface Tomcat Manager</Text>
          <Text style={s.codeText}># http://172.24.119.72:8080/manager/html</Text>
          <Text style={s.codeText}> </Text>
          <Text style={s.codeText}># 5. Vérifier les logs</Text>
          <Text style={s.codeText}>tail -n 50 /opt/tomcat9/logs/catalina.out</Text>
          <Text style={s.codeText}> </Text>
          <Text style={s.codeText}># 6. Vérifier l{"'"}espace disque</Text>
          <Text style={s.codeText}>df -h</Text>
          <Text style={s.codeText}> </Text>
          <Text style={s.codeText}># === PortaWebUi (vmqproportaweb01 — 172.24.119.71) ===</Text>
          <Text style={s.codeText}># Même procédure mais sur vmqproportaweb01</Text>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>4</Text></View>
          <Text style={s.stepTitle}>Escalade si non résolu</Text>
        </View>

        <View style={s.alertInfo}>
          <Text style={s.alertText}>Si le problème persiste après les vérifications :</Text>
        </View>

        <View style={s.listItem}>
          <Text style={s.listBullet}>1.</Text>
          <Text style={s.listText}>Vérifier la sonde <Text style={s.bold}>Nagios</Text> pour le serveur concerné</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>2.</Text>
          <Text style={s.listText}>Suivre la procédure d{"'"}incident « Portails DAPI indisponibles » sur le SharePoint Astreinte</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>3.</Text>
          <Text style={s.listText}>Si le portail n{"'"}est toujours pas disponible → <Text style={s.bold}>Escalader à l{"'"}équipe SYSTEM</Text></Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>4.</Text>
          <Text style={s.listText}>Communiquer à l{"'"}équipe <Text style={s.bold}>PNM_SI</Text> si l{"'"}indisponibilité dure et créer un flashinfo</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>5.</Text>
          <Text style={s.listText}>Les portabilités continuent en arrière-plan — seule la consultation est impactée</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>6.</Text>
          <Text style={s.listText}>Identifiants/mots de passe disponibles sur le <Text style={s.bold}>Secret Server</Text> : <Text style={s.code}>https://vmqpropass01</Text></Text>
        </View>

        <View style={[s.alertSuccess, { marginTop: 10 }]}>
          <Text style={s.alertTitle}>Points de vigilance</Text>
          <Text style={s.alertText}>{"•"} Un <Text style={{ fontWeight: 'bold' }}>redémarrage Tomcat</Text> suffit dans la majorité des cas</Text>
          <Text style={s.alertText}>{"•"} Un <Text style={{ fontWeight: 'bold' }}>disque plein</Text> est une cause fréquente de crash silencieux</Text>
          <Text style={s.alertText}>{"•"} Les portabilités continuent même si le portail est down — seule la visibilité est perdue</Text>
          <Text style={s.alertText}>{"•"} <Text style={{ fontWeight: 'bold' }}>Documenter</Text> l{"'"}incident dans le rapport de vacation</Text>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique — PortaWs inaccessible</Text>
          <Text>Page 3 / 3</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── Cas #9 — HUB Portabilites Echec PDF ─────────────────────────────────────

function CasHubPortabilitesEchecPdf() {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Cas Pratique : Portabilites HUB en echec</Text>
            <Text style={s.headerSub}>Les portabilites depuis le HUB ne fonctionnent plus — 11/03/2026</Text>
          </View>
          <Text style={{ fontSize: 8, color: c.light }}>PNM App</Text>
        </View>

        <View style={s.tagRow}>
          {['HUB', 'PortaWs', 'SOAP', 'Incident', 'Infrastructure'].map((tag) => (
            <Text key={tag} style={s.tag}>{tag}</Text>
          ))}
        </View>

        <Text style={s.body}>Les demandes de portabilite saisies par les CDC (Charges De Clientele) via le <Text style={s.bold}>HUB</Text> (ou WebStore / Wizzee) retournent un message d{"'"}erreur. Aucun mandat n{"'"}apparait sur <Text style={s.bold}>PortaWebUI</Text>, ce qui signifie que la requete n{"'"}atteint pas le webservice SOAP.</Text>

        <View style={s.alertInfo}>
          <Text style={s.alertTitle}>Chaine de webservices impliques</Text>
          <Text style={s.alertText}>{"•"} <Text style={{ fontWeight: 'bold' }}>HUB / WebStore / Wizzee</Text> {"→"} PortaUiWs4Esb sur vmqproportaweb01 : http://172.24.119.71:8080/PortaWebUi/DigicelFwiPortaUiWs4Esb?wsdl</Text>
          <Text style={s.alertText}>{"•"} <Text style={{ fontWeight: 'bold' }}>PortaWebUi</Text> {"→"} PortaWs4Esb sur vmqproportaws01 : http://172.24.119.72:8080/PortaWs/DigicelFwiPortaWs4Esb?wsdl</Text>
          <Text style={s.alertText}>{"•"} <Text style={{ fontWeight: 'bold' }}>DAPI</Text> {"→"} ESB DataProxy {"→"} DigicelFwiEsbWs4Porta : http://172.24.116.76:8000/.../DigicelFwiEsbWs4Porta.wsdl</Text>
          <Text style={s.alertText}>{"•"} <Text style={{ fontWeight: 'bold' }}>Traitement interne</Text> {"→"} PortaWs4PortaSync : http://172.24.119.72:8080/PortaWs/DigicelFwiPortaWs4PortaSync?wsdl</Text>
        </View>

        <View style={s.alertError}>
          <Text style={s.alertTitle}>CRITIQUE — Impact</Text>
          <Text style={s.alertText}>Aucune nouvelle portabilite ne peut etre saisie. Les portabilites deja en cours continuent leur cycle normalement. Seules les <Text style={{ fontWeight: 'bold' }}>nouvelles demandes</Text> sont bloquees.</Text>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>1</Text></View>
          <Text style={s.stepTitle}>Qualifier le probleme</Text>
        </View>

        <Text style={s.body}>Recueillir les informations aupres du CDC :</Text>
        <View style={s.listItem}>
          <Text style={s.listBullet}>1.</Text>
          <Text style={s.listText}><Text style={s.bold}>Message d{"'"}erreur exact</Text> affiche sur le HUB (capture d{"'"}ecran si possible)</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>2.</Text>
          <Text style={s.listText}><Text style={s.bold}>MSISDN</Text> de la portabilite tentee</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>3.</Text>
          <Text style={s.listText}>Le probleme touche-t-il <Text style={s.bold}>un seul CDC</Text> ou <Text style={s.bold}>tous les CDC</Text> ?</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>4.</Text>
          <Text style={s.listText}>Depuis <Text style={s.bold}>quand</Text> le probleme est apparu ?</Text>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>2</Text></View>
          <Text style={s.stepTitle}>Arbre de decision selon le message d{"'"}erreur</Text>
        </View>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '30%' }]}>Message d{"'"}erreur / Symptome</Text>
            <Text style={[s.tableHeaderCell, { width: '30%' }]}>Cause probable</Text>
            <Text style={[s.tableHeaderCell, { width: '40%' }]}>Resolution</Text>
          </View>
          {[
            ['Connection refused / Timeout', 'PortaWs est down ou injoignable', 'Verifier PortaWs (cf. Cas Pratique "PortaWs inaccessible")'],
            ['SOAP Fault / Internal Server Error (500)', 'Erreur applicative cote PortaWs', 'Verifier les logs Tomcat (catalina.out), possible bug ou donnees invalides'],
            ['Erreur d\'authentification / 401 Unauthorized', 'Credentials HUB→PortaWs expires', 'Verifier la config du HUB, renouveler les credentials si besoin'],
            ['Pas de trace dans PortaWebUI', 'La requete ne parvient pas au WS', 'Verifier connectivite reseau HUB→PortaWs, pare-feu, proxy'],
            ['Erreur sur un seul MSISDN', 'Donnees de portabilite invalides (RIO, dates)', 'Verifier le RIO, la date de portabilite, le MSISDN via les outils Verifier'],
          ].map(([msg, cause, action]) => (
            <View key={msg} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '30%', fontWeight: 'bold' }]}>{msg}</Text>
              <Text style={[s.tableCell, { width: '30%', color: c.red }]}>{cause}</Text>
              <Text style={[s.tableCellLight, { width: '40%' }]}>{action}</Text>
            </View>
          ))}
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : Portabilites HUB en echec</Text>
          <Text>Page 1 / 2</Text>
        </View>
      </Page>

      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Cas Pratique : Portabilites HUB en echec (suite)</Text>
            <Text style={s.headerSub}>Les portabilites depuis le HUB ne fonctionnent plus — 11/03/2026</Text>
          </View>
          <Text style={{ fontSize: 8, color: c.light }}>PNM App</Text>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>3</Text></View>
          <Text style={s.stepTitle}>Verifications techniques</Text>
        </View>

        <Text style={s.body}>Si le probleme touche <Text style={s.bold}>tous les CDC</Text>, c{"'"}est un probleme d{"'"}infrastructure :</Text>

        <View style={s.codeBlock}>
          <Text style={s.codeText}># 1. Verifier que le WS PortaUiWs4Esb repond (appele par le HUB)</Text>
          <Text style={s.codeText}>curl -s http://172.24.119.71:8080/PortaWebUi/DigicelFwiPortaUiWs4Esb?wsdl | head -5</Text>
          <Text style={s.codeText}> </Text>
          <Text style={s.codeText}># 2. Verifier que le WS PortaWs4Esb repond (appele par PortaWebUi)</Text>
          <Text style={s.codeText}>curl -s http://172.24.119.72:8080/PortaWs/DigicelFwiPortaWs4Esb?wsdl | head -5</Text>
          <Text style={s.codeText}> </Text>
          <Text style={s.codeText}># 3. Si timeout {"→"} Tomcat est down sur le serveur concerne</Text>
          <Text style={s.codeText}># Sur vmqproportaweb01 (PortaWebUi) :</Text>
          <Text style={s.codeText}>systemctl status tomcat</Text>
          <Text style={s.codeText}> </Text>
          <Text style={s.codeText}># Sur vmqproportaws01 (PortaWs) :</Text>
          <Text style={s.codeText}>systemctl status tomcat</Text>
          <Text style={s.codeText}> </Text>
          <Text style={s.codeText}># 4. Verifier les logs pour des erreurs SOAP</Text>
          <Text style={s.codeText}>tail -n 100 /opt/tomcat9/logs/catalina.out | grep -i "error\|exception\|fault"</Text>
        </View>

        <Text style={{ ...s.body, marginTop: 8 }}>Si le probleme touche <Text style={s.bold}>un seul CDC</Text>, c{"'"}est un probleme de donnees :</Text>
        <View style={s.listItem}>
          <Text style={s.listBullet}>1.</Text>
          <Text style={s.listText}>Verifier le <Text style={s.bold}>RIO</Text> avec l{"'"}outil Verifier {"→"} RIO Validator</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>2.</Text>
          <Text style={s.listText}>Verifier que le <Text style={s.bold}>MSISDN</Text> n{"'"}a pas deja un portage en cours sur PortaWebUI</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>3.</Text>
          <Text style={s.listText}>Verifier que la <Text style={s.bold}>date de portabilite</Text> est dans le futur (J+7 minimum)</Text>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>4</Text></View>
          <Text style={s.stepTitle}>Escalade</Text>
        </View>

        <View style={s.alertWarning}>
          <Text style={s.alertText}>Si le probleme est general et persiste :</Text>
        </View>

        <View style={s.listItem}>
          <Text style={s.listBullet}>1.</Text>
          <Text style={s.listText}>Contacter l{"'"}equipe <Text style={s.bold}>infrastructure</Text> avec le message d{"'"}erreur exact et les logs</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>2.</Text>
          <Text style={s.listText}>Si PortaWs est down : priorite haute, redemarrer Tomcat en urgence</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>3.</Text>
          <Text style={s.listText}>Informer les CDC que les saisies seront possibles apres resolution</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>4.</Text>
          <Text style={s.listText}>Communiquer a l{"'"}equipe <Text style={s.bold}>PNM_SI</Text> si l{"'"}indisponibilite dure et creer un flashinfo</Text>
        </View>

        <View style={[s.alertSuccess, { marginTop: 10 }]}>
          <Text style={s.alertTitle}>Points de vigilance</Text>
          <Text style={s.alertText}>{"•"} Toujours demander le <Text style={{ fontWeight: 'bold' }}>message d{"'"}erreur exact</Text> au CDC avant de diagnostiquer</Text>
          <Text style={s.alertText}>{"•"} Un probleme sur un seul CDC ≠ un probleme d{"'"}infrastructure</Text>
          <Text style={s.alertText}>{"•"} Les portabilites deja en cours ne sont <Text style={{ fontWeight: 'bold' }}>pas impactees</Text> — seules les nouvelles saisies sont bloquees</Text>
          <Text style={s.alertText}>{"•"} Apres resolution, demander au CDC de <Text style={{ fontWeight: 'bold' }}>re-saisir</Text> la portabilite (elle n{"'"}a pas ete enregistree)</Text>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : Portabilites HUB en echec</Text>
          <Text>Page 2 / 2</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── Cas #10 — Aucun fichier recu operateurs PDF ────────────────────────────

function CasAucunFichierRecuPdf() {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Cas Pratique : Aucun fichier recu des operateurs</Text>
            <Text style={s.headerSub}>On ne recoit plus aucun fichier des operateurs sur vmqproportasync01 — 11/03/2026</Text>
          </View>
          <Text style={{ fontSize: 8, color: c.light }}>PNM App</Text>
        </View>

        <View style={s.tagRow}>
          {['SFTP', 'vmqproportasync01', 'Fichiers', 'Incident', 'Infrastructure', 'Cron'].map((tag) => (
            <Text key={tag} style={s.tag}>{tag}</Text>
          ))}
        </View>

        <View style={s.alertError}>
          <Text style={s.alertTitle}>CRITIQUE — Impact</Text>
          <Text style={s.alertText}>Aucun fichier PNMDATA n{"'"}a ete depose dans les repertoires recv/. Le rapport de vacation indique 0 fichiers recus. Les tickets (1210, 1430, etc.) des autres operateurs ne sont pas traites. Incident critique a resoudre rapidement.</Text>
        </View>

        <View style={s.alertInfo}>
          <Text style={s.alertTitle}>Architecture des echanges de fichiers</Text>
          <Text style={s.alertText}>{"•"} <Text style={{ fontWeight: 'bold' }}>BTCTF</Text> (172.24.119.70) : serveur d{"'"}echange de fichiers (Bouygues Telecom Caraibe Transfert File). Les operateurs y deposent leurs fichiers via SFTP</Text>
          <Text style={s.alertText}>{"•"} <Text style={{ fontWeight: 'bold' }}>vmqproportasync01</Text> (172.24.119.69) : recupere les fichiers depuis BTCTF, les acquitte, et les archive dans arch_recv/</Text>
          <Text style={s.alertText}>{"•"} <Text style={{ fontWeight: 'bold' }}>Vacations</Text> : 10h-11h, 14h-15h, 19h-20h + synchro dimanche 22h-24h</Text>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>1</Text></View>
          <Text style={s.stepTitle}>Diagnostic rapide — est-ce nous ou eux ?</Text>
        </View>

        <View style={s.codeBlock}>
          <Text style={s.codeText}>for op in 01 03 04 05 06; do</Text>
          <Text style={s.codeText}>  echo "=== Operateur $op ==="</Text>
          <Text style={s.codeText}>  ls -lt /home/porta_pnmv3/PortaSync/pnmdata/$op/arch_recv/ | head -n 3</Text>
          <Text style={s.codeText}>done</Text>
        </View>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '40%' }]}>Constat</Text>
            <Text style={[s.tableHeaderCell, { width: '30%' }]}>Signification</Text>
            <Text style={[s.tableHeaderCell, { width: '30%' }]}>Action</Text>
          </View>
          {[
            ['AUCUN operateur n\'a depose', 'Probleme cote notre serveur (SFTP, cron, disque)', 'Passer a l\'etape 2'],
            ['UN SEUL operateur manquant', 'Probleme cote cet operateur', 'Contacter l\'operateur concerne, puis passer a l\'etape 4'],
          ].map(([constat, sig, action]) => (
            <View key={constat} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '40%', fontWeight: 'bold' }]}>{constat}</Text>
              <Text style={[s.tableCell, { width: '30%' }]}>{sig}</Text>
              <Text style={[s.tableCellLight, { width: '30%' }]}>{action}</Text>
            </View>
          ))}
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>2</Text></View>
          <Text style={s.stepTitle}>Verifier le serveur vmqproportasync01</Text>
        </View>

        <View style={s.codeBlock}>
          <Text style={s.codeText}># 1. Espace disque — un disque plein bloque les ecritures SFTP</Text>
          <Text style={s.codeText}>df -h</Text>
          <Text style={s.codeText}> </Text>
          <Text style={s.codeText}># 2. Service SFTP — doit etre actif pour que les operateurs deposent</Text>
          <Text style={s.codeText}>systemctl status sshd</Text>
          <Text style={s.codeText}> </Text>
          <Text style={s.codeText}># 3. Cron PortaSync — verifier que les crons de recuperation tournent</Text>
          <Text style={s.codeText}>crontab -l | grep -i "porta\|pnm\|sync"</Text>
          <Text style={s.codeText}> </Text>
          <Text style={s.codeText}># 4. Logs systeme — erreurs recentes</Text>
          <Text style={s.codeText}>tail -n 50 /var/log/messages | grep -i "error\|fail\|denied"</Text>
          <Text style={s.codeText}>tail -n 50 /var/log/secure | grep -i "sftp\|porta"</Text>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>3</Text></View>
          <Text style={s.stepTitle}>Verifier les repertoires et permissions</Text>
        </View>

        <View style={s.codeBlock}>
          <Text style={s.codeText}># Verifier que les repertoires recv/ existent et sont accessibles</Text>
          <Text style={s.codeText}>for op in 01 03 04 05 06; do</Text>
          <Text style={s.codeText}>  echo "=== Operateur $op ==="</Text>
          <Text style={s.codeText}>  ls -ld /home/porta_pnmv3/PortaSync/pnmdata/$op/recv/</Text>
          <Text style={s.codeText}>done</Text>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : Aucun fichier recu des operateurs</Text>
          <Text>Page 1 / 2</Text>
        </View>
      </Page>

      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Cas Pratique : Aucun fichier recu des operateurs (suite)</Text>
            <Text style={s.headerSub}>On ne recoit plus aucun fichier des operateurs sur vmqproportasync01 — 11/03/2026</Text>
          </View>
          <Text style={{ fontSize: 8, color: c.light }}>PNM App</Text>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>4</Text></View>
          <Text style={s.stepTitle}>Relancer les vacations manquantes</Text>
        </View>

        <Text style={s.body}>Si le probleme est resolu et que des vacations n{"'"}ont pas ete generees, les relancer par operateur (se connecter sur <Text style={s.bold}>vmqproportasync01</Text> avec porta_pnmv3) :</Text>

        <View style={s.codeBlock}>
          <Text style={s.codeText}>cd ~/PortaSync/</Text>
          <Text style={s.codeText}> </Text>
          <Text style={s.codeText}># 1. Verifier quelles vacations ont ete generees</Text>
          <Text style={s.codeText}>tail -n 30 log/PnmDataManager.log</Text>
          <Text style={s.codeText}> </Text>
          <Text style={s.codeText}># 2. Verifier les fichiers deja presents ou en .tmp</Text>
          <Text style={s.codeText}>ls -la pnmdata/01/arch_send/ pnmdata/01/send/</Text>
          <Text style={s.codeText}> </Text>
          <Text style={s.codeText}># 3. Relancer la vacation par operateur :</Text>
          <Text style={s.codeText}>./PnmDataManager_oc.sh -v     <Text style={{ color: '#22c55e' }}># Orange Caraibe (01)</Text></Text>
          <Text style={s.codeText}>./PnmDataManager_sfrc.sh -v   <Text style={{ color: '#22c55e' }}># SFR Caraibe (03)</Text></Text>
          <Text style={s.codeText}>./PnmDataManager_dt.sh -v     <Text style={{ color: '#22c55e' }}># Dauphin Telecom (04)</Text></Text>
          <Text style={s.codeText}>./PnmDataManager_uts.sh -v    <Text style={{ color: '#22c55e' }}># UTS Caraibe (05)</Text></Text>
          <Text style={s.codeText}>./PnmDataManager_freec.sh -v  <Text style={{ color: '#22c55e' }}># Free Caraibes (06)</Text></Text>
        </View>

        <View style={s.alertWarning}>
          <Text style={s.alertTitle}>Procedure de relance</Text>
          <Text style={s.alertText}>A effectuer tous les lundis matin apres 10h et avant 10h30, au cas par cas. Ne relancer que pour les operateurs qui n{"'"}ont pas eu de fichier genere.</Text>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>5</Text></View>
          <Text style={s.stepTitle}>Escalade et communication</Text>
        </View>

        <View style={s.listItem}>
          <Text style={s.listBullet}>1.</Text>
          <Text style={s.listText}><Text style={s.bold}>Probleme cote notre serveur :</Text> Escalader a l{"'"}equipe <Text style={s.bold}>SYSTEM</Text> en urgence avec les elements collectes (espace disque, etat sshd, erreurs logs)</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>2.</Text>
          <Text style={s.listText}><Text style={s.bold}>Probleme cote un operateur :</Text> Contacter l{"'"}operateur concerne par email (voir Guide des Operations {"→"} Contacts). A la fin de chaque vacation, transmettre un mail a l{"'"}operateur qui n{"'"}a pas depose son fichier</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>3.</Text>
          <Text style={s.listText}>Communiquer a l{"'"}equipe <Text style={s.bold}>PNM_SI</Text> si le probleme dure plus d{"'"}une vacation et creer un flashinfo</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>4.</Text>
          <Text style={s.listText}><Text style={s.bold}>Documenter</Text> l{"'"}incident dans le rapport de vacation avec l{"'"}heure de detection et les actions prises</Text>
        </View>

        <View style={[s.alertSuccess, { marginTop: 8 }]}>
          <Text style={s.alertTitle}>Points de vigilance</Text>
          <Text style={s.alertText}>{"•"} Un disque plein est la cause n°1 de panne silencieuse sur les serveurs SFTP</Text>
          <Text style={s.alertText}>{"•"} Si <Text style={{ fontWeight: 'bold' }}>tous</Text> les operateurs sont concernes = probleme chez nous. Si <Text style={{ fontWeight: 'bold' }}>un seul</Text> = probleme chez eux</Text>
          <Text style={s.alertText}>{"•"} Verifier les .ERR dans arch_send/ — des E011 massifs confirment l{"'"}absence de communication</Text>
          <Text style={s.alertText}>{"•"} Apres resolution, les fichiers en retard arrivent generalement a la vacation suivante</Text>
          <Text style={s.alertText}>{"•"} Les fichiers transitent via <Text style={{ fontWeight: 'bold' }}>BTCTF</Text> (172.24.119.70) — si BTCTF est down, tous les operateurs sont impactes</Text>
          <Text style={s.alertText}>{"•"} Identifiants sur le <Text style={{ fontWeight: 'bold' }}>Secret Server</Text> : https://vmqpropass01</Text>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : Aucun fichier recu des operateurs</Text>
          <Text>Page 2 / 2</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── Cas #11 — FNR non transmis EMA PDF ──────────────────────────────────────

function CasFnrNonTransmisEmaPdf() {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Cas Pratique : FNR non transmis a EMA</Text>
            <Text style={s.headerSub}>Le fichier FNR n{"'"}a pas ete transmis a EMA — Alerte batchhandler — 11/03/2026</Text>
          </View>
          <Text style={{ fontSize: 8, color: c.light }}>PNM App</Text>
        </View>

        <View style={s.tagRow}>
          {['FNR', 'EMA', 'Bascule', 'Alerte', 'batchhandler'].map((tag) => (
            <Text key={tag} style={s.tag}>{tag}</Text>
          ))}
        </View>

        <Text style={s.body}>Le systeme a envoye l{"'"}alerte <Text style={s.bold}>[PNM] Controle fichier batchhandler FNR_V3 sur EMA</Text>. Cela signifie que le fichier de bascule FNR (Flexible Number Register) n{"'"}a pas ete correctement transmis ou traite par EMA. Ce fichier est <Text style={s.bold}>critique</Text> : sans lui, les appels vers les numeros portes ne sont pas routes correctement.</Text>

        <View style={s.alertError}>
          <Text style={s.alertTitle}>Impact</Text>
          <Text style={s.alertText}>Les numeros portes lors de la derniere bascule ne sont pas mis a jour dans le FNR. Les appels vers ces numeros peuvent etre mal routes (envoyes a l{"'"}ancien operateur au lieu du nouveau). <Text style={{ fontWeight: 'bold' }}>Incident critique a traiter en priorite.</Text></Text>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>1</Text></View>
          <Text style={s.stepTitle}>Comprendre le flux FNR</Text>
        </View>

        <View style={s.alertInfo}>
          <Text style={s.alertTitle}>Flux normal</Text>
          <Text style={s.alertText}>Apres la bascule (EmaExtracter), le systeme genere un fichier FNR contenant la liste des numeros a basculer. Ce fichier est envoye a EMA via le batchhandler. EMA l{"'"}integre pour mettre a jour le routage des appels. Un controle automatique verifie ensuite que le fichier a bien ete traite.</Text>
          <Text style={s.alertText}> </Text>
          <Text style={s.alertText}>Bascule (EmaExtracter) {"→"} Generation fichier FNR {"→"} Envoi a EMA (batchhandler) {"→"} Controle automatique</Text>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>2</Text></View>
          <Text style={s.stepTitle}>Verifier la bascule et le log FNR sur EMA</Text>
        </View>

        <Text style={s.body}><Text style={s.bold}>1.</Text> Verifier que la bascule a eu lieu sur <Text style={s.bold}>vmqproportasync01</Text> (user <Text style={{ fontFamily: 'Courier', fontSize: 7 }}>porta_pnmv3</Text>) :</Text>

        <View style={s.codeBlock}>
          <Text style={{ ...s.codeText, color: '#22c55e' }}># Verifier le log de bascule (la bascule a lieu a 9h)</Text>
          <Text style={s.codeText}>tail -n 30 /home/porta_pnmv3/PortaSync/log/EmaExtracter.log</Text>
          <Text style={s.codeText}> </Text>
          <Text style={{ ...s.codeText, color: '#22c55e' }}># Verifier l{"'"}etat des dossiers de portabilite du jour sur PortaWs</Text>
          <Text style={{ ...s.codeText, color: '#22c55e' }}># Si statut "Bascule" ou "Cloture" → ne rien faire</Text>
          <Text style={{ ...s.codeText, color: '#22c55e' }}># Si autre statut → relancer le script :</Text>
          <Text style={{ ...s.codeText, color: '#fbbf24' }}>./EmaExtracter.sh -v</Text>
        </View>

        <Text style={[s.body, { marginTop: 8 }]}><Text style={s.bold}>2.</Text> A partir de <Text style={s.bold}>10h</Text>, verifier le traitement du FNR sur <Text style={s.bold}>EMA15-Digicel</Text> (172.24.119.140) :</Text>

        <View style={s.codeBlock}>
          <Text style={s.codeText}>ssh batchuser@172.24.119.140</Text>
          <Text style={s.codeText}>cd ~/LogFiles/</Text>
          <Text style={s.codeText}>ls -lt *fnr_action_v3* | head -3</Text>
          <Text style={s.codeText}>tail -f {"<"}dernier_fichier_log{">"}</Text>
          <Text style={s.codeText}> </Text>
          <Text style={{ ...s.codeText, color: '#22c55e' }}># Exemple de log normal :</Text>
          <Text style={{ ...s.codeText, color: '#22c55e' }}># DELETE:NPSUB:MSISDN,590690675667;</Text>
          <Text style={{ ...s.codeText, color: '#22c55e' }}># RESP:0;</Text>
          <Text style={{ ...s.codeText, color: '#22c55e' }}># BatchJob started at: 2026-03-11 09:15:06;</Text>
          <Text style={{ ...s.codeText, color: '#22c55e' }}># BatchJob finished at: 2026-03-11 09:15:10.</Text>
          <Text style={{ ...s.codeText, color: '#22c55e' }}># Totally 104 commands are successful.</Text>
          <Text style={{ ...s.codeText, color: '#22c55e' }}># Totally 0 commands failed.</Text>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : FNR non transmis a EMA</Text>
          <Text>Page 1 / 3</Text>
        </View>
      </Page>

      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Cas Pratique : FNR non transmis a EMA (suite)</Text>
            <Text style={s.headerSub}>Le fichier FNR n{"'"}a pas ete transmis a EMA — Alerte batchhandler — 11/03/2026</Text>
          </View>
          <Text style={{ fontSize: 8, color: c.light }}>PNM App</Text>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>3</Text></View>
          <Text style={s.stepTitle}>Diagnostic et resolution selon le cas</Text>
        </View>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '35%' }]}>Constat</Text>
            <Text style={[s.tableHeaderCell, { width: '30%' }]}>Cause</Text>
            <Text style={[s.tableHeaderCell, { width: '35%' }]}>Resolution</Text>
          </View>
          {[
            ['Le fichier log FNR n\'existe pas sur EMA', 'Le script fnr_action_v3.bh ne s\'est pas execute', 'Executer manuellement depuis EMA15-Digicel (voir etape 4)'],
            ['Log existe mais commands failed > 0', 'Certaines commandes FNR ont echoue', 'Le mail contient le log d\'erreur. Corriger les MSISDN un par un (GET/CREATE/SET/DELETE)'],
            ['La bascule n\'a pas eu lieu (EmaExtracter.log en erreur)', 'Pas de fichier FNR genere', 'Relancer ./EmaExtracter.sh -v sur vmqproportasync01 puis attendre le FNR'],
            ['Bascule OK mais pas de log FNR', 'Echec de transfert vers EMA', 'Verifier la connectivite vmqproportasync01 → EMA15 (172.24.119.140)'],
          ].map(([constat, cause, resolution]) => (
            <View key={constat} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '35%', fontWeight: 'bold' }]}>{constat}</Text>
              <Text style={[s.tableCell, { width: '30%', color: c.red }]}>{cause}</Text>
              <Text style={[s.tableCellLight, { width: '35%' }]}>{resolution}</Text>
            </View>
          ))}
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>4</Text></View>
          <Text style={s.stepTitle}>Executer le FNR manuellement sur EMA</Text>
        </View>

        <Text style={s.body}>Si le fichier log FNR n{"'"}existe pas, executer le script <Text style={s.bold}>fnr_action_v3.bh</Text> manuellement :</Text>

        <View style={s.codeBlock}>
          <Text style={s.codeText}># Depuis EMA15-Digicel (172.24.119.140) avec l{"'"}user batchuser :</Text>
          <Text style={s.codeText}>(echo "LOGIN:batchuser:123batchuser;";sleep 5;</Text>
          <Text style={s.codeText}> echo "SET:BATCHJOB:FILE,DEF,fnr_action_v3.bh;";</Text>
          <Text style={s.codeText}> sleep 5; echo "LOGOUT;";sleep 5)| telnet 0 3333</Text>
        </View>

        <View style={[s.alertInfo, { marginTop: 8 }]}>
          <Text style={s.alertTitle}>Methode recommandee — Pages web FNR</Text>
          <Text style={s.alertText}>Pour intervenir sur des MSISDN individuellement, utiliser les pages dediees FNR sur 172.24.2.21 plutot que la ligne de commande EMA. Ces pages sont documentees dans la procedure OneNote sur le SharePoint (onglet Production {"&"} Astreinte).</Text>
        </View>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '18%' }]}>Action</Text>
            <Text style={[s.tableHeaderCell, { width: '50%' }]}>Page web FNR</Text>
            <Text style={[s.tableHeaderCell, { width: '32%' }]}>Usage</Text>
          </View>
          {[
            ['Verifier', 'http://172.24.2.21/apis/porta/fnr-get-info.html', 'Verifier si un MSISDN est dans le FNR'],
            ['Creer', 'http://172.24.2.21/apis/porta/fnr-create.php', 'Ajouter un MSISDN (selectionner operateur)'],
            ['Modifier', 'http://172.24.2.21/apis/porta/fnr-update.php', 'Changer le reseau (selectionner operateur)'],
            ['Supprimer', 'http://172.24.2.21/apis/porta/fnr-delete.html', 'Retirer un MSISDN du FNR'],
          ].map(([action, url, usage]) => (
            <View key={action} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '18%', fontWeight: 'bold' }]}>{action}</Text>
              <Text style={[s.tableCell, { width: '50%', fontFamily: 'Courier', fontSize: 6.5 }]}>{url}</Text>
              <Text style={[s.tableCellLight, { width: '32%' }]}>{usage}</Text>
            </View>
          ))}
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : FNR non transmis a EMA</Text>
          <Text>Page 2 / 3</Text>
        </View>
      </Page>

      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Cas Pratique : FNR non transmis a EMA (suite)</Text>
            <Text style={s.headerSub}>Le fichier FNR n{"'"}a pas ete transmis a EMA — Alerte batchhandler — 11/03/2026</Text>
          </View>
          <Text style={{ fontSize: 8, color: c.light }}>PNM App</Text>
        </View>

        <Text style={[s.body, { marginTop: 4 }]}><Text style={s.bold}>Alternative — Commandes FNR unitaires en CLI</Text> (depuis EMA15-Digicel, si les pages web ne sont pas accessibles) :</Text>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '20%' }]}>Action</Text>
            <Text style={[s.tableHeaderCell, { width: '45%' }]}>Commande FNR</Text>
            <Text style={[s.tableHeaderCell, { width: '35%' }]}>Usage</Text>
          </View>
          {[
            ['Verifier (GET)', 'GET:NPSUB:MSISDN,590XXXXXXXXX;', 'Verifier si un MSISDN est dans le FNR'],
            ['Creer (CREATE)', 'CREATE:NPSUB:MSISDN,590XXXXXXXXX;', 'Ajouter un MSISDN au FNR'],
            ['Modifier (SET)', 'SET:NPSUB:MSISDN,590XXXXXXXXX;', 'Changer le reseau d\'un MSISDN'],
            ['Supprimer (DELETE)', 'DELETE:NPSUB:MSISDN,590XXXXXXXXX;', 'Retirer un MSISDN du FNR'],
          ].map(([action, cmd, usage]) => (
            <View key={action} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '20%', fontWeight: 'bold' }]}>{action}</Text>
              <Text style={[s.tableCell, { width: '45%', fontFamily: 'Courier', fontSize: 7 }]}>{cmd}</Text>
              <Text style={[s.tableCellLight, { width: '35%' }]}>{usage}</Text>
            </View>
          ))}
        </View>

        <Text style={[s.body, { marginTop: 8 }]}><Text style={s.bold}>Verification en masse</Text> dans le FNR (preparer un fichier <Text style={s.bold}>check_msisdn_fnr.txt</Text> avec 1 MSISDN par ligne au format international) :</Text>

        <View style={s.codeBlock}>
          <Text style={s.codeText}># Depuis EMA15-Digicel :</Text>
          <Text style={s.codeText}>(echo -e {"'"}LOGIN:sogadm:sogadm;\n{"'"} ; for i in `cat check_msisdn_fnr.txt`;</Text>
          <Text style={s.codeText}>do echo -e {"'"}GET:NPSUB:MSISDN,{"'"}$i{"'"};\n{"'"}; sleep 1; done )</Text>
          <Text style={s.codeText}>| telnet 172.24.119.140 3300 {">"} resultat_check_msisdn_fnr.txt</Text>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>5</Text></View>
          <Text style={s.stepTitle}>Escalade — incident critique</Text>
        </View>

        <View style={s.alertError}>
          <Text style={s.alertText}>Un fichier FNR non transmis est un <Text style={s.bold}>incident critique</Text>. Les appels vers les numeros portes sont mal routes tant que le FNR n{"'"}est pas mis a jour.</Text>
        </View>

        <View style={s.listItem}>
          <Text style={s.listBullet}>1.</Text>
          <Text style={s.listText}>Si le FNR ne s{"'"}est pas execute : l{"'"}executer manuellement (etape 4)</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>2.</Text>
          <Text style={s.listText}>Si des commandes ont echoue : corriger les MSISDN un par un avec les commandes GET/CREATE/SET/DELETE</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>3.</Text>
          <Text style={s.listText}>Si le probleme est reseau : contacter l{"'"}equipe <Text style={s.bold}>SYSTEM</Text></Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>4.</Text>
          <Text style={s.listText}>Communiquer a l{"'"}equipe <Text style={s.bold}>PNM_SI</Text> et creer un flashinfo si l{"'"}incident dure</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>5.</Text>
          <Text style={s.listText}>Apres correction, verifier avec un GET sur les MSISDN concernes</Text>
        </View>

        <View style={[s.alertSuccess, { marginTop: 8 }]}>
          <Text style={s.alertTitle}>Points de vigilance</Text>
          <Text style={s.alertText}>{"•"} Le FNR est <Text style={{ fontWeight: 'bold' }}>critique</Text> — sans lui, les appels sont mal routes (impact utilisateur final)</Text>
          <Text style={s.alertText}>{"•"} La verification FNR doit se faire <Text style={{ fontWeight: 'bold' }}>a partir de 10h</Text> (apres la bascule de 9h)</Text>
          <Text style={s.alertText}>{"•"} Serveur EMA : <Text style={{ fontWeight: 'bold' }}>EMA15-Digicel</Text> (172.24.119.140), user <Text style={{ fontFamily: 'Courier', fontSize: 7 }}>batchuser</Text></Text>
          <Text style={s.alertText}>{"•"} Le mail d{"'"}alerte <Text style={{ fontWeight: 'bold' }}>[PNM] Controle fichier batchhandler FNR_V3 sur EMA</Text> contient le detail des erreurs</Text>
          <Text style={s.alertText}>{"•"} Les MSISDN dans le FNR sont au <Text style={{ fontWeight: 'bold' }}>format international</Text> (590...)</Text>
          <Text style={s.alertText}>{"•"} Documenter l{"'"}incident — le GPMAG peut demander un rapport</Text>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : FNR non transmis a EMA</Text>
          <Text>Page 3 / 3</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── Cas #12 — MSISDN provisoire erreur PDF ─────────────────────────────────

function CasMsisdnProvisoireErreurPdf() {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Cas Pratique : Le CDC s{"'"}est trompe de MSISDN provisoire</Text>
            <Text style={s.headerSub}>Le CDC s{"'"}est trompe de MSISDN provisoire — Comment le corriger ? — 11/03/2026</Text>
          </View>
          <Text style={{ fontSize: 8, color: c.light }}>PNM App</Text>
        </View>

        <View style={s.tagRow}>
          {['MSISDN provisoire', 'CDC', 'Saisie', 'Correction', 'PortaWs', 'Annulation'].map((tag) => (
            <Text key={tag} style={s.tag}>{tag}</Text>
          ))}
        </View>

        <Text style={s.body}>Un CDC signale qu{"'"}il s{"'"}est trompe en saisissant le <Text style={s.bold}>MSISDN provisoire</Text> (numero temporaire attribue au client en attendant le portage). Le MSISDN provisoire est celui sur lequel le client est joignable chez Digicel en attendant que la portabilite soit effective.</Text>

        <View style={s.alertError}>
          <Text style={s.alertTitle}>Impact</Text>
          <Text style={s.alertText}>Si le MSISDN provisoire est faux, la bascule va se faire sur un <Text style={{ fontWeight: 'bold' }}>mauvais numero</Text> (donc sur un autre client), ou <Text style={{ fontWeight: 'bold' }}>pas du tout</Text> (si le numero n{"'"}existe pas ou plus). Le MSISDN provisoire dans la porta ne sert qu{"'"}a faire le <Text style={{ fontWeight: 'bold' }}>changement de MSISDN le jour de la bascule</Text>.</Text>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>1</Text></View>
          <Text style={s.stepTitle}>Identifier l{"'"}etat du mandat sur PortaWs</Text>
        </View>

        <Text style={s.body}>Rechercher le mandat sur <Text style={s.bold}>PortaWebUI</Text> avec le MSISDN a porter (pas le provisoire) :</Text>

        <View style={s.listItem}>
          <Text style={s.listBullet}>1.</Text>
          <Text style={s.listText}>Se connecter a <Text style={s.bold}>PortaWs</Text> : <Text style={{ fontFamily: 'Courier', fontSize: 7 }}>http://172.24.119.72:8080/PortaWs/</Text></Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>2.</Text>
          <Text style={s.listText}>Rechercher par le <Text style={s.bold}>MSISDN du client</Text> (numero a porter)</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>3.</Text>
          <Text style={s.listText}>Noter l{"'"}<Text style={s.bold}>etat du mandat</Text> et la <Text style={s.bold}>date de portabilite prevue</Text></Text>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>2</Text></View>
          <Text style={s.stepTitle}>Solutions selon l{"'"}etat du mandat</Text>
        </View>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '30%' }]}>Etat du mandat</Text>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Solution</Text>
            <Text style={[s.tableHeaderCell, { width: '45%' }]}>Procedure</Text>
          </View>
          <View style={[s.tableRow, { backgroundColor: '#f0fdf4' }]}>
            <Text style={[s.tableCell, { width: '30%', fontWeight: 'bold' }]}>Pas encore basculee{'\n'}(1110 envoye, ou 1210 recu)</Text>
            <Text style={[s.tableCell, { width: '25%', color: '#16a34a', fontWeight: 'bold' }]}>Modifier le numero dans la base de donnees</Text>
            <Text style={[s.tableCellLight, { width: '45%' }]}>Solution la plus simple : corriger le MSISDN provisoire directement dans la base de donnees PortaDB tant que la portabilite n{"'"}est pas encore basculee</Text>
          </View>
          <View style={[s.tableRow, { backgroundColor: '#fffbeb' }]}>
            <Text style={[s.tableCell, { width: '30%', fontWeight: 'bold' }]}>Pas encore basculee{'\n'}(alternative si modif BDD impossible)</Text>
            <Text style={[s.tableCell, { width: '25%', color: c.orange, fontWeight: 'bold' }]}>Annuler et re-saisir</Text>
            <Text style={[s.tableCellLight, { width: '45%' }]}>1. Envoyer une annulation (ticket 1510/C001){'\n'}2. Attendre la confirmation d{"'"}annulation (1530){'\n'}3. Re-saisir la portabilite avec le bon MSISDN provisoire</Text>
          </View>
          <View style={[s.tableRow, { backgroundColor: '#fef2f2' }]}>
            <Text style={[s.tableCell, { width: '30%', fontWeight: 'bold' }]}>Deja basculee{'\n'}Trop tard</Text>
            <Text style={[s.tableCell, { width: '25%', color: c.red, fontWeight: 'bold' }]}>Changement de numero par le CDC</Text>
            <Text style={[s.tableCellLight, { width: '45%' }]}>1. Il est trop tard pour corriger dans le systeme PNM{'\n'}2. Le CDC devra faire un changement de numero pour le client{'\n'}3. S{"'"}assurer que le MSISDN est disponible en reaffectation</Text>
          </View>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>3</Text></View>
          <Text style={s.stepTitle}>Modifier le numero dans la base de donnees (cas le plus simple)</Text>
        </View>

        <Text style={s.body}>Si la portabilite <Text style={s.bold}>n{"'"}est pas encore basculee</Text>, la solution la plus simple est de corriger le MSISDN provisoire directement dans la base de donnees :</Text>

        <View style={s.listItem}>
          <Text style={s.listBullet}>1.</Text>
          <Text style={s.listText}>Se connecter a la base <Text style={s.bold}>PortaDB</Text> sur <Text style={{ fontFamily: 'Courier', fontSize: 7 }}>vmqproportawebdb01</Text> (172.24.119.68)</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>2.</Text>
          <Text style={s.listText}>Identifier le mandat concerne par le MSISDN a porter</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>3.</Text>
          <Text style={s.listText}><Text style={s.bold}>Modifier le MSISDN provisoire</Text> par la bonne valeur</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>4.</Text>
          <Text style={s.listText}>Verifier sur <Text style={s.bold}>PortaWs</Text> que le mandat affiche desormais le bon MSISDN provisoire</Text>
        </View>

        <View style={[s.alertInfo, { marginTop: 8 }]}>
          <Text style={s.alertTitle}>Alternative — Annulation et re-saisie</Text>
          <Text style={s.alertText}>Si la modification en BDD n{"'"}est pas possible, envoyer une annulation (1510 / C001), attendre la confirmation (1530), puis re-saisir avec le bon MSISDN provisoire. <Text style={{ fontWeight: 'bold' }}>Attention :</Text> le delai J+7 repart a zero. Informer le client du nouveau delai.</Text>
        </View>

        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>4</Text></View>
          <Text style={s.stepTitle}>Si la portabilite est deja basculee — trop tard</Text>
        </View>

        <View style={s.alertError}>
          <Text style={s.alertText}>Si la portabilite est deja basculee, il est <Text style={{ fontWeight: 'bold' }}>trop tard</Text> pour corriger dans le systeme PNM. La bascule s{"'"}est faite sur un mauvais numero (un autre client) ou pas du tout.</Text>
        </View>

        <View style={s.listItem}>
          <Text style={s.listBullet}>1.</Text>
          <Text style={s.listText}>Le CDC devra faire un <Text style={s.bold}>changement de numero</Text> pour le client</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>2.</Text>
          <Text style={s.listText}>S{"'"}assurer que le MSISDN est <Text style={s.bold}>disponible en reaffectation</Text></Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>3.</Text>
          <Text style={s.listText}>Verifier que le client est bien joignable sur son numero porte une fois la correction effectuee</Text>
        </View>

        <View style={[s.alertSuccess, { marginTop: 10 }]}>
          <Text style={s.alertTitle}>Points de vigilance</Text>
          <Text style={s.alertText}>{"•"} Un mauvais MSISDN provisoire fait basculer sur un <Text style={{ fontWeight: 'bold' }}>autre client</Text> ou <Text style={{ fontWeight: 'bold' }}>pas du tout</Text></Text>
          <Text style={s.alertText}>{"•"} La <Text style={{ fontWeight: 'bold' }}>modification en base de donnees</Text> est la solution la plus simple si la porta n{"'"}est pas encore basculee</Text>
          <Text style={s.alertText}>{"•"} L{"'"}annulation + re-saisie est une alternative mais fait repartir le delai <Text style={{ fontWeight: 'bold' }}>J+7</Text></Text>
          <Text style={s.alertText}>{"•"} Si deja basculee : <Text style={{ fontWeight: 'bold' }}>trop tard</Text> — le CDC doit faire un changement de numero + verifier disponibilite en reaffectation</Text>
          <Text style={s.alertText}>{"•"} Toujours <Text style={{ fontWeight: 'bold' }}>informer le client</Text> du delai supplementaire en cas d{"'"}annulation</Text>
          <Text style={s.alertText}>{"•"} Demander au CDC de <Text style={{ fontWeight: 'bold' }}>verifier systematiquement</Text> le MSISDN provisoire avant validation</Text>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : MSISDN provisoire errone</Text>
          <Text>Page 1 / 1</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── Export functions ───────────────────────────────────────────────────────

export async function generateCasPratiquePdf(casId: string): Promise<void> {
  // Map cas IDs to their PDF documents and filenames
  const pdfMap: Record<string, { document: React.ReactElement; filename: string }> = {
    'incoherence-col3-pnmdata': {
      document: <CasIncohCol3Pdf />,
      filename: 'Cas-Pratique-Incoherence-Col3-PNMDATA',
    },
    'relance-portabilite-retard': {
      document: <CasRelancePortabilitePdf />,
      filename: 'Cas-Pratique-Relance-Portabilite-Retard',
    },
    'ar-non-recu-investigation-logs': {
      document: <CasArNonRecuLogsPdf />,
      filename: 'Cas-Pratique-AR-Non-Recu-Investigation-Logs',
    },
    'refus-r322-resiliation-effective': {
      document: <CasRefusR322Pdf />,
      filename: 'Cas-Pratique-Refus-R322-Resiliation',
    },
    'annulation-1510-c001': {
      document: <CasAnnulation1510Pdf />,
      filename: 'Cas-Pratique-Annulation-1510-C001',
    },
    'erreur-e610-flux-non-attendu': {
      document: <CasErreurE610Pdf />,
      filename: 'Cas-Pratique-Erreur-E610-Flux-Non-Attendu',
    },
    'fichier-deja-recu-e008': {
      document: <CasFichierDejaRecuPdf />,
      filename: 'Cas-Pratique-Fichier-Deja-Recu-E008',
    },
    'portaws-inaccessible': {
      document: <CasPortaWsInaccessiblePdf />,
      filename: 'Cas-Pratique-PortaWs-Inaccessible',
    },
    'hub-portabilites-echec': {
      document: <CasHubPortabilitesEchecPdf />,
      filename: 'Cas-Pratique-HUB-Portabilites-Echec',
    },
    'aucun-fichier-recu-operateurs': {
      document: <CasAucunFichierRecuPdf />,
      filename: 'Cas-Pratique-Aucun-Fichier-Recu-Operateurs',
    },
    'fnr-non-transmis-ema': {
      document: <CasFnrNonTransmisEmaPdf />,
      filename: 'Cas-Pratique-FNR-Non-Transmis-EMA',
    },
    'msisdn-provisoire-erreur': {
      document: <CasMsisdnProvisoireErreurPdf />,
      filename: 'Cas-Pratique-MSISDN-Provisoire-Erreur',
    },
  };

  const config = pdfMap[casId];
  if (!config) return;

  const blob = await pdf(config.document as React.ReactElement<import('@react-pdf/renderer').DocumentProps>).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${config.filename}-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
