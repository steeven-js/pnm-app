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
            <Text style={[s.tableCell, { width: '40%', fontWeight: 'bold' }]}>Destinataire attendu</Text>
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
            ['Dernier ticket', 'Ligne 66 (séquence 0065, ticket 3410 RN, MSISDN 0690660689)'],
            ['Tickets avant correction', '65 tickets (67 lignes avec entête + pied)'],
            ['Tickets après correction', '64 tickets (66 lignes avec entête + pied)'],
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
          Le fichier corrigé ne peut pas garder le même nom (rejet "fichier déjà reçu"). Mettre à jour :
        </Text>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '20%' }]}>Élément</Text>
            <Text style={[s.tableHeaderCell, { width: '40%' }]}>Avant</Text>
            <Text style={[s.tableHeaderCell, { width: '40%' }]}>Après</Text>
          </View>
          {[
            ['Nom fichier', 'PNMDATA.04.02.\n20260303123443.002', 'PNMDATA.04.02.\n20260304143000.005'],
            ['Entête (L1)', '0123456789|...20260303\n123443.002|04|20260303123443', '0123456789|...20260304\n143000.005|04|20260304143000'],
            ['Pied (dernière)', '9876543210|04|\n20260303123443|000067', '9876543210|04|\n20260304143000|000066'],
          ].map(([label, before, after]) => (
            <View key={label} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '20%', fontWeight: 'bold' }]}>{label}</Text>
              <Text style={[s.tableCellLight, { width: '40%', fontSize: 7 }]}>{before}</Text>
              <Text style={[s.tableCell, { width: '40%', fontSize: 7, color: c.green }]}>{after}</Text>
            </View>
          ))}
        </View>

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
          <Text style={s.listText}><Text style={s.bold}>Pied de page</Text> : même horodatage + compteur total (64 + 2 = 000066)</Text>
        </View>

        {/* Étape 6 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>6</Text></View>
          <Text style={s.stepTitle}>Transférer et intégrer</Text>
        </View>

        <View style={s.listItem}>
          <Text style={s.listBullet}>1.</Text>
          <Text style={s.listText}>Transférer via <Text style={s.bold}>FileZilla</Text> dans recv/ sur vmqproportasync01 :</Text>
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
          Deux portabilités entrantes vers Digicel, avec <Text style={s.bold}>Dauphin Télécom (04)</Text> comme opérateur donneur, restent bloquées au statut "En cours" depuis le 27/02/2026 sans réponse. La date de portage prévue est dépassée.
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
          Sur PortaWebUI, filtrer : Opérateur = 4-Dauphin Telecom, État = 3-entrante-En cours, case "En cours" cochée.
        </Text>

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

        <Text style={s.body}>Les mandats bloqués :</Text>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '20%' }]}>MSISDN</Text>
            <Text style={[s.tableHeaderCell, { width: '20%' }]}>Création</Text>
            <Text style={[s.tableHeaderCell, { width: '20%' }]}>Portage prévu</Text>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Dernier ticket</Text>
            <Text style={[s.tableHeaderCell, { width: '15%' }]}>Statut</Text>
          </View>
          {[
            ['0690221675', '27/02/2026', '03/03/2026', '1110 émis 27/02', 'En cours'],
            ['0690221360', '27/02/2026', '04/03/2026', '1110 émis 27/02', 'En cours'],
          ].map(([msisdn, creation, portage, ticket, statut]) => (
            <View key={msisdn} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '20%', fontWeight: 'bold' }]}>{msisdn}</Text>
              <Text style={[s.tableCellLight, { width: '20%' }]}>{creation}</Text>
              <Text style={[s.tableCell, { width: '20%', color: c.red }]}>{portage}</Text>
              <Text style={[s.tableCellLight, { width: '25%' }]}>{ticket}</Text>
              <Text style={[s.tableCell, { width: '15%', color: c.orange }]}>{statut}</Text>
            </View>
          ))}
        </View>

        <View style={s.alertInfo}>
          <Text style={s.alertTitle}>Observation clé</Text>
          <Text style={s.alertText}>
            Les deux tickets 1110 ont été envoyés dans le fichier PNMDATA.02.04.20260227140112.002. Aucune réponse (1210 ou 1220) reçue de Dauphin Télécom depuis 5 jours. Date de portage dépassée.
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
          <Text style={s.listText}>Aucun ticket 1210 (acceptation) ou 1220 (refus) reçu dans les fichiers de Dauphin</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>•</Text>
          <Text style={s.listText}>La date de portage prévue est dépassée</Text>
        </View>

        <View style={s.alertError}>
          <Text style={s.alertTitle}>Constat</Text>
          <Text style={s.alertText}>
            Retard anormal. L'opérateur donneur n'a pas répondu dans le délai réglementaire. Relance par email nécessaire.
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
          <Text style={s.stepTitle}>Rédiger et envoyer l'email de relance</Text>
        </View>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '15%' }]}>Champ</Text>
            <Text style={[s.tableHeaderCell, { width: '85%' }]}>Valeur</Text>
          </View>
          {[
            ['À', 'Correspondant PNM Dauphin Télécom'],
            ['Cc', 'FWI_PNM_SI@digicelgroup.fr ; correspondant technique Dauphin'],
            ['Objet', '[PNM] En attente de la réponse pour la portabilité du 0690221675 vers Digicel'],
          ].map(([label, value]) => (
            <View key={label} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '15%', fontWeight: 'bold' }]}>{label}</Text>
              <Text style={[s.tableCellLight, { width: '85%' }]}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={{ backgroundColor: '#F4F6F8', borderRadius: 3, padding: 8, marginVertical: 6 }}>
          <Text style={{ fontSize: 8, fontStyle: 'italic', marginBottom: 3 }}>Bonjour [Prénom],</Text>
          <Text style={{ fontSize: 8, lineHeight: 1.5 }}>
            Nous attendons la réponse pour la portabilité du 0690221675 vers Digicel.{'\n'}
            Le ticket 1110 est dans le fichier PNMDATA.02.04.20260227140112.002.{'\n'}
            Peux-tu débloquer la situation stp ?
          </Text>
        </View>

        <View style={s.alertInfo}>
          <Text style={s.alertTitle}>Astuce</Text>
          <Text style={s.alertText}>
            Si plusieurs MSISDN sont concernés pour le même opérateur, les regrouper dans un seul email en listant tous les numéros et en précisant le fichier PNMDATA commun.
          </Text>
        </View>

        {/* Étape 4 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>4</Text></View>
          <Text style={s.stepTitle}>Suivre et escalader si nécessaire</Text>
        </View>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '30%' }]}>Délai depuis relance</Text>
            <Text style={[s.tableHeaderCell, { width: '70%' }]}>Action</Text>
          </View>
          {[
            ['< 24h', 'Attendre la réponse de l\'opérateur', c.green],
            ['24h — 48h', 'Relancer une seconde fois avec mise en copie du responsable', c.orange],
            ['> 48h', 'Escalader au GPMAG (secretariat@gpmag.fr) avec historique des relances', c.red],
          ].map(([delai, action, color]) => (
            <View key={delai} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '30%', color: color as string, fontWeight: 'bold' }]}>{delai}</Text>
              <Text style={[s.tableCellLight, { width: '70%' }]}>{action}</Text>
            </View>
          ))}
        </View>

        {/* Points de vigilance */}
        <View style={[s.alertSuccess, { marginTop: 10 }]}>
          <Text style={s.alertTitle}>Points de vigilance</Text>
          <Text style={s.alertText}>• Vérifier que le 1110 a bien été émis (statut "out") avant de relancer</Text>
          <Text style={s.alertText}>• Indiquer le nom exact du fichier PNMDATA dans l'email</Text>
          <Text style={s.alertText}>• Mettre FWI_PNM_SI en copie de tous les emails de relance</Text>
          <Text style={s.alertText}>• Garder un historique : 1ère relance, 2ème relance, escalade GPMAG</Text>
          <Text style={s.alertText}>• Délai réglementaire de réponse à un 1110 = 1 jour ouvré</Text>
          <Text style={s.alertText}>• Si portage trop ancien ({'>'} 10j), envisager clôture + nouvelle demande</Text>
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
          Investigation du <Text style={s.bold}>10/03/2026</Text> suite à un email d{"'"}incident signalant que le fichier <Text style={s.bold}>PNMDATA.02.03.20260309190056.003</Text> envoyé par Digicel (02) n{"'"}a pas été acquitté par Outremer Telecom / SFR (03).
        </Text>

        <View style={s.alertWarning}>
          <Text style={s.alertTitle}>Contexte</Text>
          <Text style={s.alertText}>
            L{"'"}email d{"'"}incident contient deux alertes : (1) AR non reçu après 60 minutes et (2) fichier non acquitté par l{"'"}opérateur 03. Un ticket 0000/E011 a été émis automatiquement.
          </Text>
        </View>

        {/* Étape 1 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>1</Text></View>
          <Text style={s.stepTitle}>Email d{"'"}incident reçu</Text>
        </View>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '30%' }]}>Type</Text>
            <Text style={[s.tableHeaderCell, { width: '70%' }]}>Détail</Text>
          </View>
          {[
            ['AR non reçu', 'PNMDATA.02.03.20260309190056.003 envoyé depuis plus de 60 min'],
            ['Non acquitté', 'Fichier non acquitté par 03 (Outremer Telecom / SFR)'],
            ['Ticket émis', '[0000, 02, 03, 20260309201502, E011, 000001]'],
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
          <Text style={s.stepTitle}>Vérifier la génération (PnmDataManager.log)</Text>
        </View>

        <Text style={s.body}>Commande :</Text>
        <View style={s.codeBlock}>
          <Text style={s.codeText}>$ grep "PNMDATA.02.03.20260309190056.003" .../PnmDataManager.log</Text>
        </View>
        <Text style={s.body}>Résultat :</Text>
        <View style={s.codeBlock}>
          <Text style={s.codeText}>
            PnmDataManager.php|2026-03-09T19:01:58-04:00|{'\n'}  ........Generation du fichier PNMDATA.02.03.20260309190056.003{'\n'}  (<Text style={s.codeGreen}>#tickets: 70</Text>)
          </Text>
        </View>

        <View style={s.alertSuccess}>
          <Text style={s.alertTitle}>Constat</Text>
          <Text style={s.alertText}>Fichier généré le 09/03/2026 à 19:01:58 avec 70 tickets.</Text>
        </View>

        {/* Étape 3 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>3</Text></View>
          <Text style={s.stepTitle}>Vérifier la présence dans send/</Text>
        </View>

        <Text style={s.body}>Commande :</Text>
        <View style={s.codeBlock}>
          <Text style={s.codeText}>$ ls -la .../pnmdata/03/send/PNMDATA.02.03.20260309190056.003*</Text>
        </View>
        <Text style={s.body}>Résultat :</Text>
        <View style={s.codeBlock}>
          <Text style={s.codeText}>ls: cannot access {"'"}...{"'"}: <Text style={s.codeHighlight}>No such file or directory</Text></Text>
        </View>

        <View style={s.alertInfo}>
          <Text style={s.alertTitle}>Observation</Text>
          <Text style={s.alertText}>
            Le fichier n{"'"}est plus dans send/. Il faut vérifier les logs d{"'"}acquittement.
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
          <Text style={s.stepTitle}>Vérifier l{"'"}acquittement (PnmAckManager.log)</Text>
        </View>

        <Text style={s.body}>Commande :</Text>
        <View style={s.codeBlock}>
          <Text style={s.codeText}>$ grep "PNMDATA.02.03.20260309190056.003" .../PnmAckManager.log</Text>
        </View>
        <Text style={s.body}>Résultat :</Text>
        <View style={s.codeBlock}>
          <Text style={s.codeText}>
            ...2026-03-10T10:00:42| Accusé reçu ...003.ACR ={">"} <Text style={s.codeGreen}>E000</Text>:{'\n'}
            ...2026-03-10T10:00:42| Archivage du fichier ...003 ...{'\n'}
            ...2026-03-10T10:00:42| <Text style={s.codeHighlight}>NOT FOUND!</Text> (pnmdata/03/send/...003)
          </Text>
        </View>

        <View style={s.alertSuccess}>
          <Text style={s.alertTitle}>Découverte clé</Text>
          <Text style={s.alertText}>
            L{"'"}ACR E000 confirme la bonne réception par SFR/Outremer. Le NOT FOUND concerne uniquement l{"'"}archivage local.
          </Text>
        </View>

        {/* Étape 5 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>5</Text></View>
          <Text style={s.stepTitle}>Synthèse chronologique</Text>
        </View>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Heure</Text>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Source</Text>
            <Text style={[s.tableHeaderCell, { width: '50%' }]}>Événement</Text>
          </View>
          {[
            ['09/03 19:01:58', 'DataManager', 'Génération du fichier (70 tickets)', c.green],
            ['09/03 ~20:01', 'PortaSync', 'Timeout AR 60 min → email incident', c.orange],
            ['10/03 10:00:42', 'AckManager', 'ACR E000 reçu (réception confirmée)', c.green],
            ['10/03 10:00:42', 'AckManager', 'NOT FOUND lors de l\'archivage', c.red],
          ].map(([heure, source, event, color]) => (
            <View key={heure + event} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '25%', fontFamily: 'Courier', fontSize: 7.5 }]}>{heure}</Text>
              <Text style={[s.tableCellLight, { width: '25%' }]}>{source}</Text>
              <Text style={[s.tableCell, { width: '50%', color: color as string }]}>{event}</Text>
            </View>
          ))}
        </View>

        {/* Conclusion */}
        <View style={{ backgroundColor: '#E8F5E9', borderLeftWidth: 3, borderLeftColor: c.green, padding: 10, marginVertical: 10, borderRadius: 3 }}>
          <Text style={[s.alertTitle, { color: c.green }]}>Conclusion</Text>
          <Text style={[s.alertText, { fontWeight: 'bold' }]}>
            Pas d{"'"}impact fonctionnel. L{"'"}échange avec SFR/Outremer s{"'"}est bien déroulé (ACR E000). L{"'"}email d{"'"}incident était un faux positif — l{"'"}AR est arrivé après le délai de 60 min mais avant la prochaine vacation.
          </Text>
          <Text style={[s.alertText, { marginTop: 3 }]}>
            Impact mineur : le fichier n{"'"}est pas archivé dans arch_send/ (pas de trace locale).
          </Text>
        </View>

        {/* Points de vigilance */}
        <View style={[s.alertSuccess, { marginTop: 10 }]}>
          <Text style={s.alertTitle}>Points de vigilance</Text>
          <Text style={s.alertText}>• Un email AR non reçu ne signifie pas toujours un vrai problème — vérifier les logs</Text>
          <Text style={s.alertText}>• ACR E000 = bonne réception confirmée par l{"'"}opérateur</Text>
          <Text style={s.alertText}>• NOT FOUND à l{"'"}archivage = problème mineur de nettoyage, pas d{"'"}échange</Text>
          <Text style={s.alertText}>• Ordre d{"'"}investigation : PnmDataManager → ls send/ → PnmAckManager</Text>
          <Text style={s.alertText}>• L{"'"}analyseur d{"'"}incidents PNM App parse directement les sorties de commandes</Text>
          <Text style={s.alertText}>• Si ACR différent de E000, investiguer le code d{"'"}erreur en détail</Text>
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
          Refus de portabilité reçu le <Text style={s.bold}>10/03/2026</Text> dans le fichier PNMDATA.02.06.20260309190056.003. L{"'"}opérateur donneur <Text style={s.bold}>Free Caraïbes (06)</Text> a refusé la demande pour le MSISDN <Text style={s.bold}>0694165585</Text> avec le motif R322.
        </Text>

        <View style={s.alertError}>
          <Text style={s.alertTitle}>Impact</Text>
          <Text style={s.alertText}>
            Le code R322 signifie que la ligne a été résiliée chez l{"'"}opérateur donneur. Le numéro est définitivement perdu pour le client.
          </Text>
        </View>

        {/* Étape 1 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>1</Text></View>
          <Text style={s.stepTitle}>Réception de l{"'"}email d{"'"}incident</Text>
        </View>

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
            <Text style={[s.tableCell, { width: '65%', color: c.red, fontWeight: 'bold' }]}>R322 — Résiliation effective</Text>
          </View>
        </View>

        {/* Étape 2 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>2</Text></View>
          <Text style={s.stepTitle}>Comprendre le motif R322</Text>
        </View>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '15%' }]}>Code</Text>
            <Text style={[s.tableHeaderCell, { width: '50%' }]}>Signification</Text>
            <Text style={[s.tableHeaderCell, { width: '35%' }]}>Conséquence</Text>
          </View>
          {[
            ['R322', 'Résiliation effective de la ligne', 'Numéro perdu', c.red],
            ['R321', 'Demande de résiliation en cours', 'Potentiellement récupérable', c.orange],
            ['R502', 'Ligne résiliée (autre formulation)', 'Numéro perdu', c.red],
          ].map(([code, sig, cons, color]) => (
            <View key={code} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '15%', fontWeight: 'bold' }]}>{code}</Text>
              <Text style={[s.tableCellLight, { width: '50%' }]}>{sig}</Text>
              <Text style={[s.tableCell, { width: '35%', color: color as string }]}>{cons}</Text>
            </View>
          ))}
        </View>

        <View style={s.alertInfo}>
          <Text style={s.alertTitle}>Cas typique</Text>
          <Text style={s.alertText}>
            Le client a résilié sa ligne chez Free Caraïbes (ou Free l{"'"}a résiliée pour impayé) avant que la demande de portabilité ne soit traitée.
          </Text>
        </View>

        {/* Étape 3 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>3</Text></View>
          <Text style={s.stepTitle}>Vérifier sur PortaWs</Text>
        </View>

        <View style={s.listItem}>
          <Text style={s.listBullet}>•</Text>
          <Text style={s.listText}>Le mandat doit être passé à l{"'"}état "Refusé"</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>•</Text>
          <Text style={s.listText}>Le ticket 1220 avec code R322 doit apparaître dans l{"'"}historique</Text>
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

        <View style={{ backgroundColor: '#F4F6F8', borderRadius: 3, padding: 8, marginVertical: 6 }}>
          <Text style={{ fontSize: 8, fontStyle: 'italic', marginBottom: 3 }}>Bonjour,</Text>
          <Text style={{ fontSize: 8, lineHeight: 1.5 }}>
            La demande de portabilité pour le 0694165585 a été refusée par Free Caraïbes avec le motif R322 — Résiliation effective de la ligne.{'\n'}
            Le numéro ne peut plus être porté. Le client devra souscrire avec un nouveau numéro.
          </Text>
        </View>

        {/* Points de vigilance */}
        <View style={[s.alertSuccess, { marginTop: 10 }]}>
          <Text style={s.alertTitle}>Points de vigilance</Text>
          <Text style={s.alertText}>• R322 est un refus définitif — aucune relance possible</Text>
          <Text style={s.alertText}>• Ne pas confondre R322 (effective) avec R321 (en cours) qui peut être réversible</Text>
          <Text style={s.alertText}>• Si le client conteste, il doit contacter directement Free Caraïbes</Text>
          <Text style={s.alertText}>• Documenter le cas dans le suivi quotidien</Text>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : Refus R322</Text>
          <Text>Page 1 / 1</Text>
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
          Deux cas d{"'"}annulation de portage traités le <Text style={s.bold}>10/03/2026</Text>. Le ticket 1510 (Demande d{"'"}Annulation) suivi du 1520 (Réponse) avec code C001 (Acceptation).
        </Text>

        <View style={s.alertWarning}>
          <Text style={s.alertTitle}>Contexte</Text>
          <Text style={s.alertText}>
            L{"'"}annulation peut être initiée par l{"'"}OPR ou l{"'"}OPD avant la date de portage effective. Le code C001 confirme l{"'"}acceptation.
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
            ['Ticket', '1510 — Demande d\'Annulation'],
            ['MSISDN', '0696001019'],
            ['OPR (initiateur)', 'Digicel (02)'],
            ['OPD', 'Orange Caraïbe (01)'],
          ].map(([label, value]) => (
            <View key={label} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '35%', fontWeight: 'bold' }]}>{label}</Text>
              <Text style={[s.tableCell, { width: '65%' }]}>{value}</Text>
            </View>
          ))}
          <View style={s.tableRow}>
            <Text style={[s.tableCell, { width: '35%', fontWeight: 'bold' }]}>Code réponse</Text>
            <Text style={[s.tableCell, { width: '65%', color: c.green, fontWeight: 'bold' }]}>C001 — Acceptation</Text>
          </View>
        </View>

        <View style={s.alertInfo}>
          <Text style={s.alertTitle}>Scénario</Text>
          <Text style={s.alertText}>
            Digicel a émis un 1110 pour le 0696001019 depuis Orange, puis a annulé (1510) avant la date de portage. Orange a accepté (1520/C001). Le client reste chez Orange.
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
            ['Ticket', '1510 — Demande d\'Annulation'],
            ['MSISDN', '0696525199'],
            ['OPR', 'Digicel (02)'],
            ['OPD (initiateur)', 'Free Caraïbes (06)'],
          ].map(([label, value]) => (
            <View key={label} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '35%', fontWeight: 'bold' }]}>{label}</Text>
              <Text style={[s.tableCell, { width: '65%' }]}>{value}</Text>
            </View>
          ))}
          <View style={s.tableRow}>
            <Text style={[s.tableCell, { width: '35%', fontWeight: 'bold' }]}>Code réponse</Text>
            <Text style={[s.tableCell, { width: '65%', color: c.green, fontWeight: 'bold' }]}>C001 — Acceptation</Text>
          </View>
        </View>

        <View style={s.alertWarning}>
          <Text style={s.alertTitle}>Scénario</Text>
          <Text style={s.alertText}>
            Digicel avait demandé la portabilité du 0696525199 depuis Free. Free a annulé (1510) avant la date de portage. Le client reste chez Free. Investiguer la raison auprès de Free.
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
          <Text style={s.stepTitle}>Vérifier sur PortaWs</Text>
        </View>

        <View style={s.listItem}>
          <Text style={s.listBullet}>•</Text>
          <Text style={s.listText}>Le mandat doit être passé à l{"'"}état "Annulé"</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>•</Text>
          <Text style={s.listText}>Identifier qui a initié le 1510 (col.2 = émetteur)</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>•</Text>
          <Text style={s.listText}>Annulation par Digicel (OPR) = demande interne (commercial)</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>•</Text>
          <Text style={s.listText}>Annulation par l{"'"}OPD = contacter pour connaître le motif</Text>
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
            ['Annulation par Digicel', 'Aucune action — annulation normale suite à demande interne'],
            ['Annulation par l\'OPD', 'Contacter l\'OPD par email. Si le client souhaite toujours porter, relancer un nouveau 1110'],
            ['Client souhaite reporter', 'Créer un nouveau mandat avec une nouvelle date de portage'],
          ].map(([situation, action]) => (
            <View key={situation} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '40%', fontWeight: 'bold' }]}>{situation}</Text>
              <Text style={[s.tableCellLight, { width: '60%' }]}>{action}</Text>
            </View>
          ))}
        </View>

        <View style={[s.alertSuccess, { marginTop: 10 }]}>
          <Text style={s.alertTitle}>Points de vigilance</Text>
          <Text style={s.alertText}>• L{"'"}annulation (1510) n{"'"}est possible qu{"'"}avant la date de portage effective</Text>
          <Text style={s.alertText}>• C001 = annulation acceptée — le mandat est clos</Text>
          <Text style={s.alertText}>• Vérifier col.2 du 1510 pour identifier l{"'"}initiateur</Text>
          <Text style={s.alertText}>• Si annulation par l{"'"}OPD et inattendue, toujours contacter pour comprendre</Text>
          <Text style={s.alertText}>• Un nouveau 1110 peut être émis après une annulation</Text>
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
          Deux tickets 7000 avec code <Text style={s.bold}>E610</Text> reçus le <Text style={s.bold}>10/03/2026</Text> dans PNMDATA.02.01.20260309190056.003 envoyé par <Text style={s.bold}>Orange Caraïbe (01)</Text>. Les MSISDN concernés : 0690688569 et 0696386384.
        </Text>

        <View style={s.alertWarning}>
          <Text style={s.alertTitle}>Contexte</Text>
          <Text style={s.alertText}>
            L{"'"}erreur E610 survient quand le système reçoit un ticket qui ne correspond pas à la séquence attendue pour un portage en cours (ex: 3420 sans 3410 préalable).
          </Text>
        </View>

        {/* Étape 1 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>1</Text></View>
          <Text style={s.stepTitle}>Email d{"'"}incident</Text>
        </View>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '30%' }]}>MSISDN</Text>
            <Text style={[s.tableHeaderCell, { width: '25%' }]}>Ticket</Text>
            <Text style={[s.tableHeaderCell, { width: '45%' }]}>Erreur</Text>
          </View>
          {[
            ['0690688569', '7000', 'E610 — Flux non attendu'],
            ['0696386384', '7000', 'E610 — Flux non attendu'],
          ].map(([msisdn, ticket, erreur]) => (
            <View key={msisdn} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '30%', fontWeight: 'bold' }]}>{msisdn}</Text>
              <Text style={[s.tableCellLight, { width: '25%' }]}>{ticket}</Text>
              <Text style={[s.tableCell, { width: '45%', color: c.red }]}>{erreur}</Text>
            </View>
          ))}
        </View>

        {/* Étape 2 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>2</Text></View>
          <Text style={s.stepTitle}>Comprendre E610</Text>
        </View>

        <View style={s.alertInfo}>
          <Text style={s.alertTitle}>Flux de restitution attendu</Text>
          <Text style={s.alertText}>
            3400 (Notification) → 3410 (Demande) → 3420 (Réponse) → 3430 (Confirmation). Si un ticket arrive en dehors de cette séquence, le système génère un 7000/E610.
          </Text>
        </View>

        <View style={{ marginVertical: 6 }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '15%' }]}>Code</Text>
            <Text style={[s.tableHeaderCell, { width: '85%' }]}>Signification</Text>
          </View>
          {[
            ['E610', 'ID portage existe mais flux non attendu dans la procédure en cours'],
            ['E601', 'Date de portabilité non conforme'],
            ['E607', 'ID portage inconnu'],
          ].map(([code, sig]) => (
            <View key={code} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '15%', fontWeight: 'bold', color: code === 'E610' ? c.red : c.dark }]}>{code}</Text>
              <Text style={[s.tableCellLight, { width: '85%' }]}>{sig}</Text>
            </View>
          ))}
        </View>

        {/* Étape 3 */}
        <View style={s.stepRow}>
          <View style={s.stepCircle}><Text style={s.stepNumber}>3</Text></View>
          <Text style={s.stepTitle}>Investiguer sur PortaWs et DAPI</Text>
        </View>

        <View style={s.listItem}>
          <Text style={s.listBullet}>1.</Text>
          <Text style={s.listText}><Text style={s.bold}>PortaWebUI</Text> : Rechercher le MSISDN, vérifier l{"'"}état et l{"'"}historique des tickets</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>2.</Text>
          <Text style={s.listText}><Text style={s.bold}>DAPI PortaWs</Text> : Vérifier la séquence des tickets avec l{"'"}analyseur DAPI</Text>
        </View>
        <View style={s.listItem}>
          <Text style={s.listBullet}>3.</Text>
          <Text style={s.listText}><Text style={s.bold}>Logs serveur</Text> : Vérifier PnmDataManager.log</Text>
        </View>

        <View style={s.codeBlock}>
          <Text style={s.codeText}>$ grep -E "0690688569|0696386384" .../PnmDataManager.log</Text>
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
            ['Ticket en double', 'Pas d\'action — le système a ignoré le doublon'],
            ['Désynchronisation', 'Contacter Orange pour resynchroniser les états'],
            ['Portage terminé', 'Ignorer — vérifier que le numéro est bien attribué'],
            ['Problème récurrent', 'Escalader au GPMAG avec historique'],
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
          <Text style={s.alertText}>• E610 est souvent sans impact fonctionnel — le portage continue</Text>
          <Text style={s.alertText}>• Toujours vérifier l{"'"}état actuel du mandat sur PortaWs avant d{"'"}agir</Text>
          <Text style={s.alertText}>• L{"'"}analyseur DAPI peut visualiser la séquence et identifier l{"'"}anomalie</Text>
          <Text style={s.alertText}>• Plusieurs MSISDN impactés = même cause racine probable</Text>
          <Text style={s.alertText}>• E6xx = erreurs de procédure (séquencement), pas erreurs techniques</Text>
          <Text style={s.alertText}>• En cas de doute, escalader : secretariat@gpmag.fr</Text>
        </View>

        <View style={s.footer}>
          <Text>PNM App — Cas Pratique : Erreur E610</Text>
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
