import { useState, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import { Document, Page as PdfPage, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { DashboardLayout } from 'src/layouts/dashboard/layout';

// ─── Types ──────────────────────────────────────────────────────────────────

type Contact = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string[];
  role?: string;
};

type Operateur = {
  code: string;
  nom: string;
  color: string;
  icon: string;
  emailGenerique?: string;
  contacts: Contact[];
};

// ─── Data ───────────────────────────────────────────────────────────────────

const OPERATEURS: Operateur[] = [
  {
    code: '01',
    nom: 'Orange Caraibe',
    color: '#ff6600',
    icon: 'solar:sun-bold-duotone',
    emailGenerique: 'oag.pnm-si@orange.com',
    contacts: [
      {
        nom: 'CHENEVIER',
        prenom: 'Gerard',
        email: 'gerard.chenevier@orange.com',
        telephone: ['0590 38 52 33', '0690 49 50 31'],
        role: 'Correspondant PNM',
      },
    ],
  },
  {
    code: '03',
    nom: 'Outremer Telecom / SFR',
    color: '#e4002b',
    icon: 'solar:phone-calling-bold-duotone',
    emailGenerique: 'pnm@outremer-telecom.fr',
    contacts: [
      {
        nom: 'HONORE',
        prenom: 'G.',
        email: 'g.honore@outremer-telecom.fr',
        telephone: ['0596 89 85 54', '0696 88 88 88'],
        role: 'Correspondant PNM',
      },
    ],
  },
  {
    code: '04',
    nom: 'Dauphin Telecom',
    color: '#0072bc',
    icon: 'solar:dolphin-bold-duotone',
    contacts: [
      {
        nom: 'ANNACHACHIBI',
        prenom: 'Latifa',
        email: 'latifa.annachachibi@dauphintelecom.com',
        telephone: ['0590 77 40 97', '0690 88 00 97'],
        role: 'Correspondante PNM',
      },
      {
        nom: 'SAINT-FLEUR',
        prenom: 'Daniel',
        email: 'daniel.saintfleur@dauphintelecom.com',
        telephone: [],
        role: 'Contact secondaire',
      },
    ],
  },
  {
    code: '05',
    nom: 'UTS Caraibe',
    color: '#00a651',
    icon: 'solar:global-bold-duotone',
    emailGenerique: 'uts-french-portability@cwc.com',
    contacts: [
      {
        nom: 'TJINASIOE',
        prenom: 'Winifred',
        email: 'winifred.tjinasioe@cwc.com',
        telephone: ['+1 (721) 588 1010 ext. 2210', '+1 (721) 580 8846'],
        role: 'Correspondante PNM',
      },
      {
        nom: 'PAQUETTE',
        prenom: 'Martin',
        email: 'martin.paquette@libertycaribbean.com',
        telephone: [],
        role: 'Contact secondaire',
      },
    ],
  },
  {
    code: '06',
    nom: 'Free Caraibe',
    color: '#cd1e25',
    icon: 'solar:wifi-router-bold-duotone',
    contacts: [
      {
        nom: 'MERLE-REMOND',
        prenom: 'F.',
        email: 'fmerleremond@iliad-free.fr',
        telephone: ['06 62 03 36 50'],
        role: 'Correspondant PNM',
      },
      {
        nom: 'PAN',
        prenom: '',
        email: 'pan@fm.proxad.net',
        telephone: [],
        role: 'Automate / mails PNM',
      },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function CopyButton({ text, tooltip }: { text: string; tooltip?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <Tooltip title={copied ? 'Copie !' : tooltip || 'Copier'}>
      <IconButton size="small" onClick={handleCopy} sx={{ ml: 0.5 }}>
        <Iconify icon={copied ? 'solar:check-circle-bold' : 'solar:copy-linear'} width={16} color={copied ? 'success.main' : undefined} />
      </IconButton>
    </Tooltip>
  );
}

function ContactCard({ contact, operateurColor }: { contact: Contact; operateurColor: string }) {
  return (
    <Box sx={{ py: 1.5, px: 2, borderLeft: 3, borderColor: operateurColor, bgcolor: 'background.neutral', borderRadius: 1, mb: 1 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {contact.prenom} {contact.nom}
        </Typography>
        {contact.role && (
          <Chip label={contact.role} size="small" variant="soft" color="default" sx={{ fontSize: '0.7rem', height: 22 }} />
        )}
      </Stack>

      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.25 }}>
        <Iconify icon="solar:letter-bold" width={14} sx={{ color: 'text.secondary' }} />
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
          {contact.email}
        </Typography>
        <CopyButton text={contact.email} tooltip="Copier l'email" />
      </Stack>

      {contact.telephone.length > 0 && contact.telephone.map((tel) => (
        <Stack key={tel} direction="row" alignItems="center" spacing={0.5}>
          <Iconify icon="solar:phone-bold" width={14} sx={{ color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
            {tel}
          </Typography>
          <CopyButton text={tel.replace(/\s/g, '')} tooltip="Copier le numero" />
        </Stack>
      ))}
    </Box>
  );
}

// ─── PDF ────────────────────────────────────────────────────────────────────

Font.register({
  family: 'Helvetica',
  fonts: [{ src: 'Helvetica' }, { src: 'Helvetica-Bold', fontWeight: 'bold' }],
});

const ps = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 9, color: '#212B36' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#E5E8EB' },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: '#00A76F' },
  headerSub: { fontSize: 8, color: '#637381' },
  footer: { position: 'absolute', bottom: 25, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#637381', borderTopWidth: 0.5, borderTopColor: '#E5E8EB', paddingTop: 5 },
  opCard: { marginBottom: 14, borderWidth: 0.5, borderColor: '#E5E8EB', borderRadius: 4, padding: 10 },
  opHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, paddingBottom: 6, borderBottomWidth: 0.5, borderBottomColor: '#E5E8EB' },
  opName: { fontSize: 12, fontWeight: 'bold' },
  opCode: { fontSize: 8, color: '#637381', marginLeft: 8, backgroundColor: '#F9FAFB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, borderWidth: 0.5, borderColor: '#E5E8EB' },
  opEmail: { fontSize: 8, color: '#637381', marginBottom: 6 },
  contactRow: { marginBottom: 6, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: '#E5E8EB' },
  contactName: { fontSize: 9, fontWeight: 'bold', marginBottom: 1 },
  contactRole: { fontSize: 7.5, color: '#637381', marginBottom: 2 },
  contactDetail: { fontSize: 8, color: '#212B36', marginBottom: 1 },
  contactLabel: { fontSize: 7, color: '#637381' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F4F6F8', paddingVertical: 4, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: '#E5E8EB', marginTop: 14 },
  tableHeaderCell: { fontSize: 8, fontWeight: 'bold', color: '#212B36' },
  tableRow: { flexDirection: 'row', paddingVertical: 3, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: '#E5E8EB' },
  tableCell: { fontSize: 8, color: '#212B36' },
});

function ContactsPdf() {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Document>
      <PdfPage size="A4" style={ps.page}>
        <View style={ps.header}>
          <View>
            <Text style={ps.headerTitle}>Contacts Operateurs — GPMAG</Text>
            <Text style={ps.headerSub}>Annuaire des correspondants PNM — Digicel Antilles-Guyane</Text>
          </View>
          <Text style={ps.headerSub}>{today}</Text>
        </View>

        {OPERATEURS.map((op) => (
          <View key={op.code} style={[ps.opCard, { borderLeftWidth: 3, borderLeftColor: op.color }]} wrap={false}>
            <View style={ps.opHeader}>
              <Text style={ps.opName}>{op.nom}</Text>
              <Text style={ps.opCode}>Code {op.code}</Text>
            </View>

            {op.emailGenerique && (
              <Text style={ps.opEmail}>Email generique : {op.emailGenerique}</Text>
            )}

            {op.contacts.map((contact) => (
              <View key={contact.email} style={ps.contactRow}>
                <Text style={ps.contactName}>{contact.prenom} {contact.nom}</Text>
                {contact.role && <Text style={ps.contactRole}>{contact.role}</Text>}
                <Text style={ps.contactDetail}>{contact.email}</Text>
                {contact.telephone.map((tel) => (
                  <Text key={tel} style={ps.contactDetail}>{tel}</Text>
                ))}
              </View>
            ))}
          </View>
        ))}

        <View style={ps.tableHeader}>
          <Text style={[ps.tableHeaderCell, { width: '15%' }]}>Code</Text>
          <Text style={[ps.tableHeaderCell, { width: '25%' }]}>Operateur</Text>
          <Text style={[ps.tableHeaderCell, { width: '30%' }]}>Email generique</Text>
          <Text style={[ps.tableHeaderCell, { width: '30%' }]}>Contact principal</Text>
        </View>
        {OPERATEURS.map((op) => (
          <View key={op.code} style={ps.tableRow}>
            <Text style={[ps.tableCell, { width: '15%', fontWeight: 'bold' }]}>{op.code}</Text>
            <Text style={[ps.tableCell, { width: '25%' }]}>{op.nom}</Text>
            <Text style={[ps.tableCell, { width: '30%' }]}>{op.emailGenerique || '—'}</Text>
            <Text style={[ps.tableCell, { width: '30%' }]}>{op.contacts[0]?.email || '—'}</Text>
          </View>
        ))}

        <View style={ps.footer}>
          <Text>PNM App — Contacts Operateurs GPMAG</Text>
          <Text>Page 1 / 1</Text>
        </View>
      </PdfPage>
    </Document>
  );
}

async function downloadContactsPdf() {
  const blob = await pdf(<ContactsPdf /> as React.ReactElement<import('@react-pdf/renderer').DocumentProps>).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Contacts-Operateurs-GPMAG.pdf';
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main ───────────────────────────────────────────────────────────────────

export default function Contacts() {
  const [search, setSearch] = useState('');

  const filtered = OPERATEURS.filter((op) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      op.nom.toLowerCase().includes(s) ||
      op.code.includes(s) ||
      op.contacts.some(
        (c) =>
          c.nom.toLowerCase().includes(s) ||
          c.prenom.toLowerCase().includes(s) ||
          c.email.toLowerCase().includes(s)
      )
    );
  });

  return (
    <DashboardLayout>
      <Head title="Contacts Operateurs" />

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 900, mx: 'auto' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Iconify icon="solar:users-group-rounded-bold-duotone" width={32} sx={{ color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Contacts Operateurs
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Annuaire des correspondants PNM des operateurs du GPMAG
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="solar:file-download-bold-duotone" width={18} />}
            onClick={downloadContactsPdf}
          >
            PDF
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <TextField
          fullWidth
          size="small"
          placeholder="Rechercher par operateur, nom, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 3 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:magnifer-bold" width={18} />
                </InputAdornment>
              ),
            },
          }}
        />

        <Stack spacing={2}>
          {filtered.map((op) => (
            <Card key={op.code} variant="outlined">
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                  <Iconify icon={op.icon} width={24} sx={{ color: op.color }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {op.nom}
                  </Typography>
                  <Chip label={`Code ${op.code}`} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }} />
                </Stack>

                {op.emailGenerique && (
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1.5, pl: 0.5 }}>
                    <Iconify icon="solar:mailbox-bold" width={16} sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                      Email generique :
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600 }}>
                      {op.emailGenerique}
                    </Typography>
                    <CopyButton text={op.emailGenerique} tooltip="Copier l'email generique" />
                  </Stack>
                )}

                {op.contacts.map((contact) => (
                  <ContactCard key={contact.email} contact={contact} operateurColor={op.color} />
                ))}
              </CardContent>
            </Card>
          ))}
        </Stack>

        {filtered.length === 0 && (
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
            Aucun contact trouve pour "{search}"
          </Typography>
        )}
      </Box>
    </DashboardLayout>
  );
}
