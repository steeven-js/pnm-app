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
