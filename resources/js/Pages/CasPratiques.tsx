import { useCallback, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { DashboardLayout } from 'src/layouts/dashboard/layout';

// ─── Types ──────────────────────────────────────────────────────────────────

type Severity = 'critique' | 'majeur' | 'mineur';
type Category = 'infrastructure' | 'fichiers' | 'tickets' | 'saisie';

type CasPratique = {
  id: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  severity: Severity;
  category: Category;
  content: React.ReactNode;
};

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; icon: string; bg: string }> = {
  critique: { label: 'Critique', color: '#d32f2f', icon: 'solar:danger-triangle-bold-duotone', bg: '#fdecea' },
  majeur: { label: 'Majeur', color: '#ed6c02', icon: 'solar:shield-warning-bold-duotone', bg: '#fff4e5' },
  mineur: { label: 'Mineur', color: '#0288d1', icon: 'solar:info-circle-bold-duotone', bg: '#e5f6fd' },
};

const CATEGORY_CONFIG: Record<Category, { label: string; icon: string }> = {
  infrastructure: { label: 'Infrastructure', icon: 'solar:server-bold-duotone' },
  fichiers: { label: 'Fichiers & Echanges', icon: 'solar:document-bold-duotone' },
  tickets: { label: 'Tickets & Portabilite', icon: 'solar:ticket-bold-duotone' },
  saisie: { label: 'Saisie & Donnees', icon: 'solar:pen-bold-duotone' },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function CodeBlock({ children, strikethrough }: { children: string; strikethrough?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const plain = children.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(plain);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [children]);

  return (
    <Box sx={{ position: 'relative', my: 1.5 }}>
      <Box
        component="pre"
        sx={{
          p: 1.5,
          pr: 5,
          borderRadius: 1,
          bgcolor: '#1e293b',
          color: '#e2e8f0',
          fontSize: 13,
          fontFamily: 'monospace',
          overflowX: 'auto',
          textDecoration: strikethrough ? 'line-through' : 'none',
          opacity: strikethrough ? 0.6 : 1,
        }}
        dangerouslySetInnerHTML={{ __html: children }}
      />
      {!strikethrough && (
        <Tooltip title={copied ? 'Copié !' : 'Copier'} placement="left">
          <IconButton
            size="small"
            onClick={handleCopy}
            sx={{
              position: 'absolute',
              top: 6,
              right: 6,
              color: copied ? '#22c55e' : '#94a3b8',
              '&:hover': { color: '#e2e8f0' },
            }}
          >
            <Iconify icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold'} width={16} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

function StepHeader({ number, icon, title }: { number: number; icon: string; title: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 4, mb: 1.5 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {number}
      </Box>
      <Iconify icon={icon} width={22} sx={{ color: 'primary.main' }} />
      <Typography variant="subtitle1" fontWeight="bold">
        {title}
      </Typography>
    </Stack>
  );
}

// ─── Cas #1 — Incohérence col.3 ────────────────────────────────────────────

const casIncohCol3: CasPratique = {
  id: 'incoherence-col3-pnmdata',
  title: 'Correction d\'une incohérence col.3 dans un fichier PNMDATA',
  date: '04/03/2026',
  severity: 'mineur',
  category: 'fichiers',
  tags: ['Fichier', 'Incohérence', 'Correction manuelle', 'PNMDATA', 'col.3'],
  summary:
    'Un ticket dans PNMDATA.04.02 pointe vers Free Caraïbe (06) au lieu de Digicel (02). Procédure de remplacement de la ligne incohérente par le dernier ticket du fichier.',
  content: (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ce guide documente un cas réel rencontré le <strong>04/03/2026</strong> sur le fichier{' '}
        <code>PNMDATA.04.02.20260303123443.002</code> envoyé par <strong>Dauphin Télécom (04)</strong> à
        destination de <strong>Digicel (02)</strong>. Une incohérence a été détectée sur la colonne 3 d'un
        ticket, nécessitant une correction manuelle avant réintégration.
      </Typography>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <strong>Contexte —</strong> Ce type d'anomalie survient lorsqu'un opérateur envoie un ticket dont la
        colonne 3 (OPR — opérateur destinataire) ne correspond pas au destinataire réel du fichier. Le fichier
        est adressé à Digicel (02), mais un ticket pointe vers Free Caraïbe (06).
      </Alert>

      {/* ── Étape 1 : Détection ── */}
      <StepHeader number={1} icon="solar:magnifer-bold-duotone" title="Détecter l'incohérence" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        En analysant le fichier avec le <strong>Décodeur fichier</strong> de PNM App, l'outil détecte
        automatiquement :
      </Typography>

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Élément</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Valeur</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><strong>Fichier</strong></TableCell>
              <TableCell><code>PNMDATA.04.02.20260303123443.002</code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Ligne concernée</strong></TableCell>
              <TableCell>Ligne 12</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Type de ticket</strong></TableCell>
              <TableCell>1430 CP (Confirmation de Portage)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>MSISDN</strong></TableCell>
              <TableCell>0696861327</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Col.3 dans le ticket</strong></TableCell>
              <TableCell sx={{ color: 'warning.main', fontWeight: 'bold' }}>06 — Free Caraïbe</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Destinataire attendu (entête)</strong></TableCell>
              <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>02 — Digicel</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2">La ligne brute incriminée :</Typography>
      <CodeBlock>
        {`1430|04|<span style="color:#fbbf24;font-weight:bold">06</span>|<span style="color:#fbbf24;font-weight:bold">06</span>|03|20260226102713|0696861327|2d404a42c6d2db55116a944148c0327d|0011|20260303123659|20260303000000|`}
      </CodeBlock>

      <Typography variant="body2" sx={{ mb: 1 }}>
        On voit que les colonnes 2 et 3 contiennent <code>04|06</code> au lieu de <code>04|02</code>. Ce ticket
        aurait dû être dans le fichier <code>PNMDATA.04.06</code> (Dauphin → Free Caraïbe) et non dans{' '}
        <code>PNMDATA.04.02</code> (Dauphin → Digicel).
      </Typography>

      {/* ── Principe ── */}
      <Alert severity="info" sx={{ my: 2 }}>
        <strong>Principe —</strong> On ne peut pas simplement supprimer la ligne car cela créerait un trou dans
        la séquence des numéros de ticket. La méthode consiste à{' '}
        <strong>remplacer la ligne incohérente par le dernier ticket du fichier</strong>, en ajustant le numéro
        de séquence.
      </Alert>

      {/* ── Étape 2 : Identifier ── */}
      <StepHeader number={2} icon="solar:clipboard-list-bold-duotone" title="Identifier les éléments clés" />

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Élément</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Valeur dans notre cas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Ligne à supprimer</TableCell>
              <TableCell>Ligne 12 (séquence <code>0011</code>)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Dernier ticket du fichier</TableCell>
              <TableCell>Ligne 66 (séquence <code>0065</code>, ticket 3410 RN pour MSISDN 0690660689)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Nombre total de tickets avant</TableCell>
              <TableCell>65 tickets (67 lignes avec entête + pied de page)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Nombre total de tickets après</TableCell>
              <TableCell>64 tickets (66 lignes avec entête + pied de page)</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Étape 3 : Supprimer ── */}
      <StepHeader number={3} icon="solar:scissors-bold-duotone" title="Supprimer la ligne incohérente" />

      <Typography variant="body2">
        Ouvrir le fichier dans un éditeur de texte (Notepad++, VS Code...). Supprimer la <strong>ligne 12</strong> :
      </Typography>
      <CodeBlock strikethrough>
        {`1430|04|06|06|03|20260226102713|0696861327|2d404a42c6d2db55116a944148c0327d|0011|20260303123659|20260303000000|`}
      </CodeBlock>

      {/* ── Étape 4 : Déplacer ── */}
      <StepHeader number={4} icon="solar:sort-bold-duotone" title="Déplacer le dernier ticket à la place" />

      <Typography variant="body2">
        Prendre le <strong>dernier ticket</strong> du fichier (ancienne ligne 66) :
      </Typography>
      <CodeBlock>
        {`3410|04|00|01|04|20260227014913|0690660689|9158f2f3eecf1084d8f0b2b287b877d6|<span style="color:#fbbf24;font-weight:bold">0065</span>|20260227062551|20260303000000`}
      </CodeBlock>

      <Typography variant="body2">
        Le placer à l'emplacement de la ligne 12 et <strong>changer son numéro de séquence</strong> de{' '}
        <code>0065</code> à <code>0011</code> :
      </Typography>
      <CodeBlock>
        {`3410|04|00|01|04|20260227014913|0690660689|9158f2f3eecf1084d8f0b2b287b877d6|<span style="color:#22c55e;font-weight:bold">0011</span>|20260227062551|20260303000000`}
      </CodeBlock>

      <Alert severity="error" sx={{ my: 2 }}>
        <strong>Important —</strong> Le dernier ticket (ligne 66) est <strong>supprimé de sa position
        d'origine</strong> puisqu'il a été déplacé. On passe donc de 65 à 64 tickets.
      </Alert>

      {/* ── Étape 5 : Renommer ── */}
      <StepHeader number={5} icon="solar:pen-new-square-bold-duotone" title="Renommer le fichier avec un nouvel horodatage" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Le fichier corrigé ne peut pas garder le même nom, sinon il sera rejeté (<em>"fichier déjà reçu"</em>).
        Il faut générer un <strong>nouvel horodatage</strong> et un nouveau <strong>numéro de séquence</strong> :
      </Typography>

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Élément</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Avant</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Après (exemple)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><strong>Nom du fichier</strong></TableCell>
              <TableCell><code>PNMDATA.04.02.20260303123443.002</code></TableCell>
              <TableCell><code>PNMDATA.04.02.20260304143000.005</code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Ligne 1 (entête)</strong></TableCell>
              <TableCell sx={{ fontSize: 12 }}><code>0123456789|PNMDATA.04.02.20260303123443.002|04|20260303123443</code></TableCell>
              <TableCell sx={{ fontSize: 12 }}><code>0123456789|PNMDATA.04.02.20260304143000.005|04|20260304143000</code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Dernière ligne (pied)</strong></TableCell>
              <TableCell><code>9876543210|04|20260303123443|000067</code></TableCell>
              <TableCell><code>9876543210|04|20260304143000|000066</code></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2">Les 3 éléments à mettre à jour :</Typography>
      <Box component="ol" sx={{ pl: 2, mb: 2, '& li': { fontSize: 14, mb: 0.5 } }}>
        <li>
          <strong>Nom du fichier</strong> : nouvel horodatage + nouveau numéro de séquence
        </li>
        <li>
          <strong>Entête (ligne 1)</strong> : même horodatage que le nom
        </li>
        <li>
          <strong>Pied de page (dernière ligne)</strong> : même horodatage +{' '}
          <strong>compteur de lignes totales</strong> (entête + tickets + pied de page = 64 + 2 ={' '}
          <code>000066</code>)
        </li>
      </Box>

      {/* ── Étape 6 : Transférer ── */}
      <StepHeader number={6} icon="solar:upload-bold-duotone" title="Transférer et intégrer" />

      <Box component="ol" sx={{ pl: 2, '& li': { fontSize: 14, mb: 1 } }}>
        <li>
          Transférer le fichier corrigé via <strong>FileZilla</strong> dans le répertoire <code>recv/</code> sur
          le serveur <strong>vmqproportasync01</strong> :
          <CodeBlock>{`/home/porta_pnmv3/PortaSync/pnmdata/04/recv/`}</CodeBlock>
        </li>
        <li>
          Exécuter le script d'intégration :
          <CodeBlock>{`./PnmDataAckManager.sh -v`}</CodeBlock>
        </li>
        <li>
          Vérifier les logs :
          <CodeBlock>{`tail -f /home/porta_pnmv3/PortaSync/log/PnmDataAckManager.log`}</CodeBlock>
        </li>
      </Box>

      {/* ── Points de vigilance ── */}
      <Divider sx={{ my: 3 }} />

      <Alert severity="success" icon={<Iconify icon="solar:check-circle-bold-duotone" width={22} />}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Points de vigilance
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 0, '& li': { fontSize: 13, mb: 0.5 } }}>
          <li>Toujours vérifier la cohérence des numéros de séquence après modification</li>
          <li>Le compteur de lignes en pied de page inclut entête + tickets + pied de page</li>
          <li>Générer un horodatage <strong>postérieur</strong> à l'original pour éviter le rejet</li>
          <li>Tester avec le Décodeur fichier de PNM App avant transfert pour valider l'intégrité</li>
          <li>Ne <strong>jamais</strong> modifier le hash MD5 d'un ticket — il est calculé côté opérateur émetteur</li>
        </Box>
      </Alert>
    </>
  ),
};

// ─── Cas #2 — Relance portabilité en retard ─────────────────────────────────

const casRelancePortabilite: CasPratique = {
  id: 'relance-portabilite-retard',
  title: 'Relance opérateur donneur pour portabilité en retard',
  date: '04/03/2026',
  severity: 'majeur',
  category: 'tickets',
  tags: ['Relance', 'Ticket 1110', 'En attente', 'Dauphin Télécom', 'Email'],
  summary:
    'Deux portabilités entrantes (0690221675, 0690221360) bloquées "En cours" depuis 5 jours sans réponse 1210 de Dauphin Télécom. Procédure de diagnostic et relance par email.',
  content: (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ce cas documente une situation rencontrée le <strong>04/03/2026</strong> : deux portabilités entrantes
        vers Digicel, avec Dauphin Télécom (04) comme opérateur donneur, restent bloquées au statut{' '}
        <strong>"En cours"</strong> depuis le 27/02/2026 sans réponse de l'opérateur donneur.
      </Typography>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <strong>Contexte —</strong> Lorsqu'un ticket 1110 (Demande de Portage) est émis par Digicel et qu'aucune
        réponse 1210 (Réponse Positive) ou 1220 (Réponse Négative) n'est reçue de l'opérateur donneur dans les
        délais réglementaires, la portabilité reste bloquée "En cours". Il faut relancer l'opérateur donneur par
        email pour débloquer la situation.
      </Alert>

      {/* ── Étape 1 : Constater le blocage ── */}
      <StepHeader number={1} icon="solar:magnifer-bold-duotone" title="Constater le blocage sur PortaWebUI" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Sur <strong>PortaWebUI</strong> (<code>http://172.24.119.72:8080/PortaWs/index.jsp</code>), filtrer les
        mandats avec les critères suivants :
      </Typography>

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Critère</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Valeur</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><strong>Opérateur</strong></TableCell>
              <TableCell>4 — Dauphin Telecom</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>État</strong></TableCell>
              <TableCell>3 — entrante-En cours</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>En cours ?</strong></TableCell>
              <TableCell>Coché</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          component="img"
          src="/images/portaweb-mandat3-0690221675.png"
          alt="PortaWebUI — Filtre En cours, État 3-entrante-En cours, Opérateur 4-Dauphin Telecom — Mandat 0690221675"
          sx={{ width: '100%', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
        />
        <Box
          component="img"
          src="/images/portaweb-mandat2-0690221360.png"
          alt="PortaWebUI — Filtre En cours, État 3-entrante-En cours, Opérateur 4-Dauphin Telecom — Mandat 0690221360"
          sx={{ width: '100%', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          Captures PortaWebUI — Filtre : En cours coché, État 3-entrante-En cours, Opérateur 4-Dauphin Telecom
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ mb: 1 }}>
        Les mandats bloqués apparaissent :
      </Typography>

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>MSISDN</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date création</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date portage prévue</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Dernier ticket émis</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>1</TableCell>
              <TableCell><strong>0690221675</strong></TableCell>
              <TableCell>27/02/2026</TableCell>
              <TableCell sx={{ color: 'error.main', fontWeight: 'bold' }}>03/03/2026</TableCell>
              <TableCell>1110 émis le 27/02 à 14:01:36</TableCell>
              <TableCell sx={{ color: 'warning.main', fontWeight: 'bold' }}>En cours</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>2</TableCell>
              <TableCell><strong>0690221360</strong></TableCell>
              <TableCell>27/02/2026</TableCell>
              <TableCell sx={{ color: 'error.main', fontWeight: 'bold' }}>04/03/2026</TableCell>
              <TableCell>1110 émis le 27/02 à 14:01:36</TableCell>
              <TableCell sx={{ color: 'warning.main', fontWeight: 'bold' }}>En cours</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Observation clé —</strong> Les deux tickets 1110 ont été envoyés dans le même fichier{' '}
        <code>PNMDATA.02.04.20260227140112.002</code>. Aucune réponse (1210 ou 1220) n'a été reçue de Dauphin
        Télécom depuis <strong>5 jours</strong>. La date de portage prévue est déjà dépassée.
      </Alert>

      {/* ── Étape 2 : Analyser la situation ── */}
      <StepHeader number={2} icon="solar:clipboard-list-bold-duotone" title="Analyser la situation" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Vérifier dans le détail du mandat sur PortaWebUI :
      </Typography>

      <Box component="ul" sx={{ pl: 2, mb: 2, '& li': { fontSize: 14, mb: 0.5 } }}>
        <li>Le ticket <strong>1110</strong> a bien été créé en interne et émis (statut <code>out</code>)</li>
        <li>Le fichier <code>PNMDATA.02.04.20260227140112.002</code> a été envoyé le 27/02 à 14:01:36</li>
        <li>Aucun ticket 1210 (acceptation) ou 1220 (refus) n'est apparu dans les fichiers reçus de Dauphin</li>
        <li>La date de portage prévue est <strong>dépassée</strong> (03/03 et 04/03 vs aujourd'hui 04/03)</li>
      </Box>

      <Alert severity="error" sx={{ mb: 2 }}>
        <strong>Constat —</strong> Il y a un retard anormal. L'opérateur donneur (Dauphin Télécom) n'a pas répondu
        dans le délai réglementaire. Il faut le relancer par email.
      </Alert>

      {/* ── Étape 3 : Rédiger et envoyer l'email ── */}
      <StepHeader number={3} icon="solar:letter-bold-duotone" title="Rédiger et envoyer l'email de relance" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Envoyer un email au correspondant PNM de l'opérateur donneur avec les informations nécessaires :
      </Typography>

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Champ</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Valeur</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><strong>À</strong></TableCell>
              <TableCell>Correspondant PNM Dauphin Télécom (ex: latifa.annachachibi@dauphin­telecom.com)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Cc</strong></TableCell>
              <TableCell>FWI_PNM_SI@digicelgroup.fr ; correspondant technique Dauphin</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Objet</strong></TableCell>
              <TableCell>[PNM] En attente de la réponse pour la portabilité du 0690221675 vers Digicel</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" sx={{ mb: 1 }}>
        Contenu de l'email — éléments à inclure :
      </Typography>

      <Box
        sx={{
          my: 1.5,
          p: 2,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.neutral',
          fontSize: 13,
          fontFamily: 'inherit',
        }}
      >
        <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
          Bonjour [Prénom],
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Nous attendons la réponse pour la portabilité du <strong>0690221675</strong> vers Digicel.<br />
          Le ticket 1110 est dans le fichier <strong>PNMDATA.02.04.20260227140112.002</strong>.
        </Typography>
        <Typography variant="body2">
          Peux-tu débloquer la situation stp ?
        </Typography>
      </Box>

      <Alert severity="info" sx={{ my: 2 }}>
        <strong>Astuce —</strong> Si plusieurs MSISDN sont concernés pour le même opérateur, les regrouper dans un
        seul email en listant tous les numéros et en précisant le fichier PNMDATA commun. Exemple du 04/03 : relance
        pour les 2 numéros (0690221360 et 0690221675).
      </Alert>

      {/* ── Étape 4 : Suivi ── */}
      <StepHeader number={4} icon="solar:clock-circle-bold-duotone" title="Suivre et escalader si nécessaire" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Règles de suivi après relance :
      </Typography>

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Délai depuis relance</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ color: 'success.main' }}>&lt; 24h</TableCell>
              <TableCell>Attendre la réponse de l'opérateur</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: 'warning.main' }}>24h — 48h</TableCell>
              <TableCell>Relancer une seconde fois par email avec mise en copie du responsable</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: 'error.main' }}>&gt; 48h</TableCell>
              <TableCell>Escalader à l&apos;équipe <strong>PNM_SI</strong> avec historique des relances et créer un flashinfo</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" sx={{ mb: 1 }}>
        À chaque vacation, vérifier sur PortaWebUI si un ticket 1210 a été reçu pour les MSISDN concernés.
      </Typography>

      {/* ── Points de vigilance ── */}
      <Divider sx={{ my: 3 }} />

      <Alert severity="success" icon={<Iconify icon="solar:check-circle-bold-duotone" width={22} />}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Points de vigilance
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 0, '& li': { fontSize: 13, mb: 0.5 } }}>
          <li>Toujours vérifier sur PortaWebUI que le 1110 a bien été <strong>émis</strong> (statut <code>out</code>) avant de relancer</li>
          <li>Indiquer le <strong>nom exact du fichier PNMDATA</strong> dans l'email pour que l'opérateur puisse retrouver le ticket</li>
          <li>Mettre <strong>FWI_PNM_SI</strong> en copie de tous les emails de relance pour traçabilité</li>
          <li>Garder un historique des relances : 1ère relance, 2ème relance, escalade GPMAG</li>
          <li>Le délai réglementaire de réponse à un 1110 est de <strong>1 jour ouvré</strong></li>
          <li>Si le portage est trop ancien (&gt; 10 jours), envisager la <strong>clôture du mandat</strong> et la recréation d'une nouvelle demande</li>
        </Box>
      </Alert>
    </>
  ),
};

// ─── Cas #3 — AR non reçu : investigation logs serveur ──────────────────────

const casArNonRecuInvestigation: CasPratique = {
  id: 'ar-non-recu-investigation-logs',
  title: 'AR non reçu — Investigation par analyse des logs serveur',
  date: '10/03/2026',
  severity: 'majeur',
  category: 'fichiers',
  tags: ['AR non reçu', 'Logs serveur', 'ACR E000', 'Archivage', 'SFR / Outremer'],
  summary:
    'Un fichier PNMDATA.02.03 signalé "non acquitté" par l\'email d\'incident. L\'investigation via les logs PnmDataManager et PnmAckManager révèle que l\'ACR E000 a bien été reçu (réception confirmée) mais le fichier était absent de send/ lors de l\'archivage. Pas d\'impact fonctionnel.',
  content: (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ce cas documente une investigation menée le <strong>10/03/2026</strong> suite à un email d&apos;incident
        signalant que le fichier <code>PNMDATA.02.03.20260309190056.003</code> envoyé par{' '}
        <strong>Digicel (02)</strong> n&apos;a pas été acquitté par <strong>Outremer Telecom / SFR (03)</strong>.
        L&apos;analyse des logs serveur sur <strong>vmqproportasync01</strong> permet de conclure à un faux positif.
      </Typography>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <strong>Contexte —</strong> L&apos;email d&apos;incident contient deux alertes : (1) AR non reçu après 60 minutes
        et (2) fichier non acquitté par l&apos;opérateur 03. Un ticket 0000/E011 a été émis automatiquement.
        L&apos;investigation consiste à vérifier les logs pour confirmer ou infirmer le problème.
      </Alert>

      {/* ── Étape 1 : Email d'incident ── */}
      <StepHeader number={1} icon="solar:letter-bold-duotone" title="Réception de l'email d'incident" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        L&apos;email automatique <code>[PNM][INCIDENT]</code> signale :
      </Typography>

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Détail</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><strong>AR non reçu</strong></TableCell>
              <TableCell>PNMDATA.02.03.20260309190056.003 envoyé depuis plus de 60 minutes par 02 (Digicel AFG)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Non acquitté</strong></TableCell>
              <TableCell>Le fichier n&apos;a pas été acquitté par 03 (Outremer Telecom / SFR)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Ticket émis</strong></TableCell>
              <TableCell><code>[0000, 02, 03, 20260309201502, E011, 000001, AR non-recu]</code></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Étape 2 : Vérifier PnmDataManager ── */}
      <StepHeader number={2} icon="solar:server-bold-duotone" title="Vérifier la génération dans PnmDataManager.log" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Se connecter à <strong>vmqproportasync01</strong> et rechercher le fichier dans les logs de génération :
      </Typography>

      <CodeBlock>
        {`<span style="color:#94a3b8">$</span> grep "PNMDATA.02.03.20260309190056.003" /home/porta_pnmv3/PortaSync/log/PnmDataManager.log`}
      </CodeBlock>

      <Typography variant="body2" sx={{ mb: 1 }}>Résultat :</Typography>

      <CodeBlock>
        {`PnmDataManager.php|2026-03-09T19:01:58-04:00| ..........Generation du fichier PNMDATA.02.03.20260309190056.003 (<span style="color:#22c55e;font-weight:bold">#tickets: 70</span>)`}
      </CodeBlock>

      <Alert severity="success" sx={{ mb: 2 }}>
        <strong>Constat —</strong> Le fichier a bien été généré le 09/03/2026 à 19:01:58 avec 70 tickets.
      </Alert>

      {/* ── Étape 3 : Vérifier send/ ── */}
      <StepHeader number={3} icon="solar:folder-check-bold-duotone" title="Vérifier la présence dans send/" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Vérifier si le fichier est encore dans le répertoire d&apos;envoi :
      </Typography>

      <CodeBlock>
        {`<span style="color:#94a3b8">$</span> ls -la /home/porta_pnmv3/PortaSync/pnmdata/03/send/PNMDATA.02.03.20260309190056.003*`}
      </CodeBlock>

      <Typography variant="body2" sx={{ mb: 1 }}>Résultat :</Typography>

      <CodeBlock>
        {`ls: cannot access '/home/porta_pnmv3/PortaSync/pnmdata/03/send/PNMDATA.02.03.20260309190056.003*': <span style="color:#ef4444;font-weight:bold">No such file or directory</span>`}
      </CodeBlock>

      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Observation —</strong> Le fichier n&apos;est plus dans <code>send/</code>. Il a été récupéré par
        l&apos;opérateur 03 ou déplacé. Il faut vérifier les logs d&apos;acquittement pour savoir si un ACR a été reçu.
      </Alert>

      {/* ── Étape 4 : Vérifier PnmAckManager ── */}
      <StepHeader number={4} icon="solar:inbox-in-bold-duotone" title="Vérifier l'acquittement dans PnmAckManager.log" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Rechercher l&apos;ACR (accusé de réception) dans les logs d&apos;acquittement :
      </Typography>

      <CodeBlock>
        {`<span style="color:#94a3b8">$</span> grep "PNMDATA.02.03.20260309190056.003" /home/porta_pnmv3/PortaSync/log/PnmAckManager.log`}
      </CodeBlock>

      <Typography variant="body2" sx={{ mb: 1 }}>Résultat :</Typography>

      <CodeBlock>
        {`PnmDataAckManager.php|2026-03-10T10:00:42-04:00| .........Accusé reçu PNMDATA.02.03.20260309190056.003.ACR => <span style="color:#22c55e;font-weight:bold">E000</span>:
PnmDataAckManager.php|2026-03-10T10:00:42-04:00| .........Archivage du fichier PNMDATA.02.03.20260309190056.003 ...
PnmDataAckManager.php|2026-03-10T10:00:42-04:00| <span style="color:#ef4444;font-weight:bold">NOT FOUND!</span> (pnmdata/03/send/PNMDATA.02.03.20260309190056.003)`}
      </CodeBlock>

      <Alert severity="success" sx={{ mb: 2 }}>
        <strong>Découverte clé —</strong> L&apos;ACR a bien été reçu le 10/03 à 10:00:42 avec le code{' '}
        <strong>E000</strong> (succès). L&apos;opérateur SFR/Outremer a confirmé la bonne réception du fichier.
        Cependant, au moment de l&apos;archivage, le fichier n&apos;était plus dans <code>send/</code>.
      </Alert>

      {/* ── Étape 5 : Analyse et conclusion ── */}
      <StepHeader number={5} icon="solar:stethoscope-bold-duotone" title="Analyse et conclusion" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Synthèse chronologique :
      </Typography>

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Heure</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Source</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Événement</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>09/03 19:01:58</TableCell>
              <TableCell>PnmDataManager</TableCell>
              <TableCell sx={{ color: 'success.main' }}>Génération du fichier (70 tickets)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>09/03 ~20:01</TableCell>
              <TableCell>PortaSync</TableCell>
              <TableCell sx={{ color: 'warning.main' }}>Timeout AR 60 min → email d&apos;incident</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>10/03 10:00:42</TableCell>
              <TableCell>PnmAckManager</TableCell>
              <TableCell sx={{ color: 'success.main' }}>ACR E000 reçu (réception confirmée par SFR)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>10/03 10:00:42</TableCell>
              <TableCell>PnmAckManager</TableCell>
              <TableCell sx={{ color: 'error.main' }}>NOT FOUND lors de l&apos;archivage</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Diagnostic —</strong> Le fichier a été généré, envoyé et <strong>reçu avec succès</strong> par SFR
        (ACR E000). L&apos;email d&apos;incident était un <strong>faux positif</strong> : l&apos;AR est arrivé après le
        délai de 60 minutes mais avant la prochaine vacation. Le &laquo; NOT FOUND &raquo; concerne uniquement
        l&apos;archivage local — le fichier a probablement été nettoyé de <code>send/</code> entre-temps.
      </Alert>

      <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: '#f0fdf4', border: '1px solid', borderColor: '#86efac', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ color: '#16a34a', mb: 0.5 }}>
          Conclusion
        </Typography>
        <Typography variant="body2">
          <strong>Pas d&apos;impact fonctionnel.</strong> L&apos;échange avec SFR/Outremer s&apos;est bien déroulé.
          Impact mineur : le fichier n&apos;est pas archivé dans <code>arch_send/</code> (pas de trace locale).
        </Typography>
      </Box>

      {/* ── Points de vigilance ── */}
      <Divider sx={{ my: 3 }} />

      <Alert severity="success" icon={<Iconify icon="solar:check-circle-bold-duotone" width={22} />}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Points de vigilance
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 0, '& li': { fontSize: 13, mb: 0.5 } }}>
          <li>Un email d&apos;incident <strong>AR non reçu</strong> ne signifie pas toujours un vrai problème — toujours vérifier les logs d&apos;acquittement</li>
          <li>Le code <strong>ACR E000</strong> confirme la bonne réception du fichier par l&apos;opérateur</li>
          <li>Le &laquo; NOT FOUND &raquo; lors de l&apos;archivage est un problème mineur de nettoyage, pas un problème d&apos;échange</li>
          <li>L&apos;ordre d&apos;investigation : <strong>PnmDataManager</strong> (génération) → <strong>ls send/</strong> (présence) → <strong>PnmAckManager</strong> (acquittement)</li>
          <li>L&apos;analyseur d&apos;incidents de PNM App peut parser directement les sorties de ces commandes</li>
          <li>Si l&apos;ACR reçu est différent de E000, investiguer plus en détail le code d&apos;erreur</li>
        </Box>
      </Alert>
    </>
  ),
};

// ─── Cas #4 — Refus R322 : résiliation effective ─────────────────────────────

const casRefusR322: CasPratique = {
  id: 'refus-r322-resiliation-effective',
  title: 'Refus R322 — Résiliation effective hors demande de portabilité',
  date: '10/03/2026',
  severity: 'majeur',
  category: 'tickets',
  tags: ['Refus', 'R322', 'Résiliation', 'Free Caraïbes', 'Numéro perdu'],
  summary:
    'Un ticket 1220 avec le code R322 (Résiliation effective de la ligne) est reçu de Free Caraïbes (06) pour le MSISDN 0694165585. Le numéro a été résilié par l\'opérateur donneur avant que la portabilité ne soit finalisée.',
  content: (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ce cas documente un refus de portabilité reçu le <strong>10/03/2026</strong> dans le fichier{' '}
        <code>PNMDATA.02.06.20260309190056.003</code>. L&apos;opérateur donneur <strong>Free Caraïbes (06)</strong>{' '}
        a refusé la demande de portabilité pour le MSISDN <strong>0694165585</strong> avec le motif{' '}
        <strong>R322 — Résiliation effective de la ligne objet de la demande</strong>.
      </Typography>

      <Alert severity="error" sx={{ mb: 2 }}>
        <strong>Impact —</strong> Le code R322 signifie que la ligne a été résiliée chez l&apos;opérateur donneur.
        Le numéro est <strong>définitivement perdu</strong> pour le client. Il ne pourra plus être porté.
        Le client devra obtenir un nouveau numéro.
      </Alert>

      {/* ── Étape 1 : Réception du refus ── */}
      <StepHeader number={1} icon="solar:letter-bold-duotone" title="Réception de l'email d'incident" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        L&apos;email automatique <code>[PNM][INCIDENT]</code> signale 1 refus dans le fichier :
      </Typography>

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Élément</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Valeur</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><strong>Fichier</strong></TableCell>
              <TableCell><code>PNMDATA.02.06.20260309190056.003</code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Ticket</strong></TableCell>
              <TableCell>1220 — Réponse Négative (RN)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>MSISDN</strong></TableCell>
              <TableCell><strong>0694165585</strong></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Code refus</strong></TableCell>
              <TableCell sx={{ color: 'error.main', fontWeight: 'bold' }}>R322 — Résiliation effective de la ligne</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Opérateur donneur</strong></TableCell>
              <TableCell>Free Caraïbes (06)</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Étape 2 : Comprendre R322 ── */}
      <StepHeader number={2} icon="solar:info-circle-bold-duotone" title="Comprendre le motif R322" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Le code <strong>R322</strong> appartient à la famille des refus définitifs (R3xx) :
      </Typography>

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Signification</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Conséquence</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><strong>R322</strong></TableCell>
              <TableCell>Résiliation effective de la ligne objet de la demande de portabilité</TableCell>
              <TableCell sx={{ color: 'error.main' }}>Numéro perdu — non récupérable</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>R321</TableCell>
              <TableCell>Demande de résiliation en cours</TableCell>
              <TableCell sx={{ color: 'warning.main' }}>Potentiellement récupérable si résiliation annulée</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>R502</TableCell>
              <TableCell>Ligne résiliée (autre formulation)</TableCell>
              <TableCell sx={{ color: 'error.main' }}>Numéro perdu</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Cas typique —</strong> Le client a résilié sa ligne chez Free Caraïbes (ou Free l&apos;a résiliée
        pour impayé) <strong>avant</strong> que la demande de portabilité vers Digicel ne soit traitée. La portabilité
        ne peut aboutir car la ligne n&apos;existe plus chez l&apos;opérateur donneur.
      </Alert>

      {/* ── Étape 3 : Vérifier sur PortaWs ── */}
      <StepHeader number={3} icon="solar:magnifer-bold-duotone" title="Vérifier le dossier sur PortaWs" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Sur <strong>PortaWebUI</strong>, rechercher le MSISDN <code>0694165585</code> pour confirmer :
      </Typography>

      <Box component="ul" sx={{ pl: 2, mb: 2, '& li': { fontSize: 14, mb: 0.5 } }}>
        <li>Le mandat doit être passé à l&apos;état <strong>&quot;Refusé&quot;</strong></li>
        <li>Le ticket 1110 (Demande de Portage) a été émis par Digicel</li>
        <li>Le ticket 1220 (Réponse Négative) a été reçu de Free avec le code R322</li>
        <li>Aucune action corrective possible côté Digicel</li>
      </Box>

      {/* ── Étape 4 : Informer ── */}
      <StepHeader number={4} icon="solar:user-speak-bold-duotone" title="Informer le commercial et le client" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Le commercial qui a initié la demande de portabilité doit être informé :
      </Typography>

      <Box sx={{
        my: 1.5, p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider',
        bgcolor: 'background.neutral', fontSize: 13, fontFamily: 'inherit',
      }}>
        <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
          Bonjour,
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          La demande de portabilité pour le <strong>0694165585</strong> a été refusée par Free Caraïbes
          avec le motif <strong>R322 — Résiliation effective de la ligne</strong>.
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Le numéro a été résilié chez l&apos;opérateur donneur et ne peut plus être porté.
          Le client devra souscrire avec un nouveau numéro.
        </Typography>
      </Box>

      {/* ── Points de vigilance ── */}
      <Divider sx={{ my: 3 }} />

      <Alert severity="success" icon={<Iconify icon="solar:check-circle-bold-duotone" width={22} />}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Points de vigilance
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 0, '& li': { fontSize: 13, mb: 0.5 } }}>
          <li>R322 est un refus <strong>définitif</strong> — aucune relance possible</li>
          <li>Ne pas confondre R322 (résiliation effective) avec R321 (résiliation en cours) qui peut être réversible</li>
          <li>Vérifier si le client a d&apos;autres lignes en cours de portabilité qui pourraient être impactées</li>
          <li>Si le client conteste la résiliation, il doit contacter directement Free Caraïbes — Digicel n&apos;a aucun levier</li>
          <li>Documenter le cas dans le suivi quotidien pour traçabilité</li>
        </Box>
      </Alert>
    </>
  ),
};

// ─── Cas #5 — Annulation 1510/C001 ──────────────────────────────────────────

const casAnnulation1510: CasPratique = {
  id: 'annulation-1510-c001',
  title: 'Annulation d\'un portage — Tickets 1510/1520 avec code C001',
  date: '10/03/2026',
  severity: 'mineur',
  category: 'tickets',
  tags: ['Annulation', 'Ticket 1510', 'C001', 'Orange Caraïbe', 'Free Caraïbes'],
  summary:
    'Deux cas d\'annulation de portage : (1) Digicel annule un portage vers Orange Caraïbe pour le 0696001019, (2) Free Caraïbes annule un portage vers Digicel pour le 0696525199. Le code C001 confirme l\'acceptation de l\'annulation.',
  content: (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ce cas documente deux annulations de portage traitées le <strong>10/03/2026</strong>.
        Une annulation est signalée par un ticket <strong>1510</strong> (Demande d&apos;Annulation) suivi d&apos;un
        ticket <strong>1520</strong> (Réponse d&apos;Annulation) avec le code <strong>C001</strong> (Acceptation).
      </Typography>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <strong>Contexte —</strong> L&apos;annulation d&apos;un portage peut être initiée par l&apos;OPR (opérateur
        receveur) ou l&apos;OPD (opérateur donneur) <strong>avant</strong> la date de portage effective. Une fois la
        date de portage passée, l&apos;annulation n&apos;est plus possible. Le code C001 dans le ticket 1520 confirme
        que l&apos;annulation est acceptée.
      </Alert>

      {/* ── Cas A : Digicel annule ── */}
      <StepHeader number={1} icon="solar:arrow-right-bold-duotone" title="Cas A — Digicel (OPR) annule un portage sortant" />

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Élément</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Valeur</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><strong>Fichier</strong></TableCell>
              <TableCell><code>PNMDATA.02.01.20260309190056.003</code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Ticket</strong></TableCell>
              <TableCell>1510 — Demande d&apos;Annulation (DA)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>MSISDN</strong></TableCell>
              <TableCell><strong>0696001019</strong></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>OPR (receveur)</strong></TableCell>
              <TableCell>Digicel (02) — initiateur de l&apos;annulation</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>OPD (donneur)</strong></TableCell>
              <TableCell>Orange Caraïbe (01)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Code réponse</strong></TableCell>
              <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>C001 — Acceptation de l&apos;annulation</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Scénario —</strong> Digicel a émis une demande de portabilité (1110) pour le 0696001019 depuis
        Orange Caraïbe, puis a décidé d&apos;annuler (1510) avant la date de portage. Orange a accepté (1520/C001).
        Le client reste chez Orange Caraïbe.
      </Alert>

      {/* ── Cas B : Free annule ── */}
      <StepHeader number={2} icon="solar:arrow-left-bold-duotone" title="Cas B — Free Caraïbes (OPD) annule un portage entrant" />

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Élément</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Valeur</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><strong>Fichier</strong></TableCell>
              <TableCell><code>PNMDATA.06.02.20260309180222.001</code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Ticket</strong></TableCell>
              <TableCell>1510 — Demande d&apos;Annulation (DA)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>MSISDN</strong></TableCell>
              <TableCell><strong>0696525199</strong></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>OPR (receveur)</strong></TableCell>
              <TableCell>Digicel (02)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>OPD (donneur)</strong></TableCell>
              <TableCell>Free Caraïbes (06) — initiateur de l&apos;annulation</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Code réponse</strong></TableCell>
              <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>C001 — Acceptation de l&apos;annulation</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <strong>Scénario —</strong> Digicel avait demandé la portabilité (1110) du 0696525199 depuis Free Caraïbes.
        Free a annulé la demande (1510) avant la date de portage. Le système a automatiquement accepté (1520/C001).
        Le client reste chez Free Caraïbes. Il faut investiguer la raison auprès de Free.
      </Alert>

      {/* ── Étape 3 : Investigation ── */}
      <StepHeader number={3} icon="solar:magnifer-bold-duotone" title="Vérifier sur PortaWs et comprendre" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Pour chaque annulation, vérifier sur <strong>PortaWebUI</strong> :
      </Typography>

      <Box component="ul" sx={{ pl: 2, mb: 2, '& li': { fontSize: 14, mb: 0.5 } }}>
        <li>Le mandat doit être passé à l&apos;état <strong>&quot;Annulé&quot;</strong></li>
        <li>Identifier qui a initié le 1510 : <strong>OPR</strong> (col.2 = code opérateur émetteur du 1510) ou <strong>OPD</strong></li>
        <li>Si annulation par <strong>Digicel (OPR)</strong> : le commercial a probablement demandé l&apos;annulation (client a changé d&apos;avis)</li>
        <li>Si annulation par <strong>l&apos;OPD</strong> : contacter l&apos;opérateur pour connaître le motif (erreur, client a repris contact, etc.)</li>
      </Box>

      {/* ── Étape 4 : Actions ── */}
      <StepHeader number={4} icon="solar:user-speak-bold-duotone" title="Actions à mener" />

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Situation</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Annulation par Digicel (demandée)</TableCell>
              <TableCell>Aucune action — annulation normale suite à demande interne</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Annulation par l&apos;OPD (inattendue)</TableCell>
              <TableCell>Contacter l&apos;OPD par email pour connaître le motif. Si le client souhaite toujours porter, relancer une nouvelle demande 1110</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Client souhaite reporter la portabilité</TableCell>
              <TableCell>Créer un nouveau mandat avec une nouvelle date de portage</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Points de vigilance ── */}
      <Divider sx={{ my: 3 }} />

      <Alert severity="success" icon={<Iconify icon="solar:check-circle-bold-duotone" width={22} />}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Points de vigilance
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 0, '& li': { fontSize: 13, mb: 0.5 } }}>
          <li>L&apos;annulation (1510) n&apos;est possible que <strong>avant</strong> la date de portage effective</li>
          <li>Le code <strong>C001</strong> signifie que l&apos;annulation est acceptée — le mandat est clos</li>
          <li>Si l&apos;annulation est refusée (code différent de C001), le portage continue normalement</li>
          <li>Vérifier dans la colonne 2 du ticket 1510 qui est l&apos;émetteur pour identifier l&apos;initiateur</li>
          <li>Si l&apos;annulation vient de l&apos;OPD et est inattendue, <strong>toujours contacter</strong> pour comprendre</li>
          <li>Un nouveau 1110 peut être émis après une annulation si le client souhaite toujours porter</li>
        </Box>
      </Alert>
    </>
  ),
};

// ─── Cas #6 — Erreur E610 : flux non attendu ────────────────────────────────

const casErreurE610: CasPratique = {
  id: 'erreur-e610-flux-non-attendu',
  title: 'Erreur E610 — Flux non attendu dans la procédure de restitution',
  date: '10/03/2026',
  severity: 'majeur',
  category: 'tickets',
  tags: ['Erreur', 'E610', 'Restitution', 'Orange Caraïbe', 'Ticket 7000'],
  summary:
    'Deux tickets 7000 (erreur) avec le code E610 reçus dans un fichier PNMDATA.02.01 pour les MSISDN 0690688569 et 0696386384. L\'erreur survient lors d\'une procédure de restitution quand un flux (ticket) inattendu est reçu pour un ID portage existant.',
  content: (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ce cas documente deux erreurs E610 reçues le <strong>10/03/2026</strong> dans le fichier{' '}
        <code>PNMDATA.02.01.20260309190056.003</code> envoyé par <strong>Orange Caraïbe (01)</strong>.
        Les tickets 7000 signalent un <strong>flux non attendu dans la procédure</strong> pour deux MSISDN
        en cours de restitution.
      </Typography>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <strong>Contexte —</strong> L&apos;erreur E610 survient quand le système reçoit un ticket qui ne correspond
        pas à la séquence attendue pour un portage en cours. Par exemple, recevoir un 3420 (Réponse de Restitution)
        alors qu&apos;aucun 3410 (Demande de Restitution) n&apos;a été émis pour cet ID portage, ou un ticket
        dans une procédure déjà terminée.
      </Alert>

      {/* ── Étape 1 : Comprendre l'incident ── */}
      <StepHeader number={1} icon="solar:letter-bold-duotone" title="Réception de l'email d'incident" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        L&apos;email <code>[PNM][INCIDENT]</code> signale 2 erreurs dans le fichier :
      </Typography>

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>MSISDN</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Ticket</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Erreur</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><strong>0690688569</strong></TableCell>
              <TableCell>7000 — Signalement d&apos;erreur</TableCell>
              <TableCell sx={{ color: 'error.main', fontWeight: 'bold' }}>E610 — Flux non attendu dans la procédure</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>0696386384</strong></TableCell>
              <TableCell>7000 — Signalement d&apos;erreur</TableCell>
              <TableCell sx={{ color: 'error.main', fontWeight: 'bold' }}>E610 — Flux non attendu dans la procédure</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Étape 2 : Comprendre E610 ── */}
      <StepHeader number={2} icon="solar:info-circle-bold-duotone" title="Comprendre l'erreur E610" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        L&apos;E610 appartient à la famille des erreurs de procédure (E6xx) :
      </Typography>

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Signification</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: 'error.main' }}>E610</TableCell>
              <TableCell>L&apos;ID portage existe déjà mais un flux (ticket) non attendu a été reçu dans la procédure en cours</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>E601</TableCell>
              <TableCell>Date de portabilité non conforme</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>E607</TableCell>
              <TableCell>ID portage inconnu</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Flux de restitution attendu —</strong> La procédure de restitution suit la séquence :
        <strong> 3400</strong> (Notification) → <strong>3410</strong> (Demande) → <strong>3420</strong> (Réponse)
        → <strong>3430</strong> (Confirmation). Si un ticket arrive en dehors de cette séquence, le système
        génère un 7000/E610.
      </Alert>

      {/* ── Étape 3 : Investiguer ── */}
      <StepHeader number={3} icon="solar:magnifer-bold-duotone" title="Investiguer sur PortaWs et DAPI" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Pour chaque MSISDN concerné :
      </Typography>

      <Box component="ol" sx={{ pl: 2, mb: 2, '& li': { fontSize: 14, mb: 1 } }}>
        <li>
          <strong>PortaWebUI</strong> : Rechercher le MSISDN dans Supervision → Liste des mandats.
          Vérifier l&apos;état actuel et l&apos;historique des tickets reçus/émis.
        </li>
        <li>
          <strong>DAPI PortaWs</strong> : Dans la vue portage du MSISDN, vérifier la séquence des tickets.
          L&apos;analyseur d&apos;incidents peut parser la vue DAPI pour identifier le ticket manquant ou en trop.
        </li>
        <li>
          <strong>Logs serveur</strong> : Vérifier dans <code>PnmDataManager.log</code> si des tickets liés
          à ces MSISDN ont été générés récemment.
        </li>
      </Box>

      <CodeBlock>
        {`<span style="color:#94a3b8">$</span> grep -E "0690688569|0696386384" /home/porta_pnmv3/PortaSync/log/PnmDataManager.log`}
      </CodeBlock>

      {/* ── Étape 4 : Actions ── */}
      <StepHeader number={4} icon="solar:settings-bold-duotone" title="Actions selon le diagnostic" />

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Diagnostic</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Ticket reçu en double (duplicata)</TableCell>
              <TableCell>Pas d&apos;action — le système a ignoré le doublon. Surveiller que le portage continue normalement.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Désynchronisation OPR/OPD</TableCell>
              <TableCell>Contacter Orange Caraïbe pour resynchroniser les états du portage. Fournir les détails des tickets.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Portage déjà terminé</TableCell>
              <TableCell>Si le portage/restitution est déjà finalisé, ignorer l&apos;erreur. Vérifier que le numéro est bien attribué au bon opérateur.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Problème récurrent</TableCell>
              <TableCell>Si E610 récurrent avec le même opérateur, escalader au GPMAG avec l&apos;historique.</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Points de vigilance ── */}
      <Divider sx={{ my: 3 }} />

      <Alert severity="success" icon={<Iconify icon="solar:check-circle-bold-duotone" width={22} />}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Points de vigilance
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 0, '& li': { fontSize: 13, mb: 0.5 } }}>
          <li>E610 est souvent <strong>sans impact fonctionnel</strong> — le portage continue malgré l&apos;erreur</li>
          <li>Toujours vérifier l&apos;état actuel du mandat sur PortaWs avant d&apos;agir</li>
          <li>L&apos;analyseur DAPI de PNM App peut aider à visualiser la séquence des tickets et identifier l&apos;anomalie</li>
          <li>Si plusieurs MSISDN sont impactés dans le même fichier, ils partagent probablement la même cause racine</li>
          <li>Les erreurs E6xx sont des erreurs de <strong>procédure</strong>, pas des erreurs techniques — elles reflètent un problème de séquencement</li>
          <li>En cas de doute, escalader à l&apos;équipe <strong>PNM_SI</strong> et créer un flashinfo si l&apos;incident dure</li>
        </Box>
      </Alert>
    </>
  ),
};

// ─── Cas #7 — Fichier déjà reçu (E008) : suppression manuelle ───────────────

const casFichierDejaRecu: CasPratique = {
  id: 'fichier-deja-recu-e008',
  title: 'Fichier déjà reçu (E008) — Suppression manuelle depuis FileZilla',
  date: '10/03/2026',
  severity: 'mineur',
  category: 'fichiers',
  tags: ['E008', 'Fichier doublon', 'FileZilla', 'SFR / Outremer', 'Suppression manuelle'],
  summary:
    'L\'opérateur SFR/Outremer (03) a renvoyé le fichier PNMDATA.03.02.20260309161154.001 déjà présent dans arch_recv/. Le PnmDataAckManager retourne une erreur E008 "Fichier déjà reçu". Le fichier doit être supprimé manuellement de recv/ via FileZilla.',
  content: (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ce cas documente un incident rencontré le <strong>10/03/2026</strong> : le fichier{' '}
        <code>PNMDATA.03.02.20260309161154.001</code> envoyé par <strong>SFR / Outremer Telecom (03)</strong>{' '}
        a été déposé une seconde fois dans le répertoire <code>recv/</code> alors qu&apos;il avait déjà été traité
        et archivé dans <code>arch_recv/</code>. Le script <code>PnmDataAckManager</code> retourne l&apos;erreur{' '}
        <strong>E008 — Fichier déjà reçu</strong>.
      </Typography>

      <Alert severity="error" sx={{ mb: 2 }}>
        <strong>Impact —</strong> Tant que le fichier doublon reste dans <code>recv/</code>, le script{' '}
        <code>PnmDataAckManager</code> tente de le traiter à chaque exécution et échoue avec l&apos;erreur E008.
        Le log est pollué par les enveloppes SOAP XML du fichier et le message d&apos;erreur. Le fichier doit
        être supprimé manuellement.
      </Alert>

      {/* ── Étape 1 : Détection ── */}
      <StepHeader number={1} icon="solar:bug-bold-duotone" title="Détection dans les logs PnmAckManager" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        En exécutant <code>tail -f PnmAckManager.log</code> ou <code>./PnmDataAckManager.sh -v</code>,
        on observe les messages suivants :
      </Typography>

      <CodeBlock>
        {`<span style="color:#94a3b8">PnmDataAckManager.php|2026-03-10T15:50:01-04:00|</span> Initialisation
<span style="color:#22c55e">..Verification operateur Orange Caraibe : Check success</span>
<span style="color:#22c55e">..Verification operateur Digicel AFG : Check success</span>
<span style="color:#22c55e">..Verification operateur Outremer Telecom / SFR : Check success</span>
<span style="color:#22c55e">..Verification operateur Dauphin Telecom : Check success</span>
<span style="color:#22c55e">..Verification operateur UTS Caraibe : Check success</span>
<span style="color:#22c55e">..Verification operateur Free Caraibes : Check success</span>
Fin Initialisation

<span style="color:#94a3b8">&lt;?xml version="1.0" ...&gt; &lt;SOAP-ENV:Envelope ...&gt;</span>
<span style="color:#94a3b8">(enveloppe SOAP XML complète du fichier PNMDATA — 169 tickets)</span>

<span style="color:#ef4444;font-weight:bold">Error Message : Exception during service.registerFichier(...)
  porta.exception._E0XX.PnmExceptionE008:
  [E008:0] Fichier déja reçus : PNMDATA.03.02.20260309161154.001</span>

<span style="color:#ef4444">..........ERREUR : Echec de notification pour fichier reçu
  PNMDATA.03.02.20260309161154.001 : l'appel au WS a retourné une erreur!</span>
Fin de Traitement 0.04secondes.`}
      </CodeBlock>

      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Observation clé —</strong> L&apos;erreur <code>PnmExceptionE008</code> indique que le fichier
        est déjà enregistré dans le système (présent dans <code>arch_recv/</code>). Le script affiche l&apos;intégralité
        de l&apos;enveloppe SOAP XML du fichier dans le log, ce qui le rend difficilement lisible.
      </Alert>

      {/* ── Étape 2 : Vérification ── */}
      <StepHeader number={2} icon="solar:folder-check-bold-duotone" title="Vérifier la présence du fichier" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Confirmer que le fichier est bien dans <code>recv/</code> (doublon) et dans <code>arch_recv/</code> (original) :
      </Typography>

      <CodeBlock>
        {`<span style="color:#94a3b8">$</span> ls -la /home/porta_pnmv3/PortaSync/pnmdata/03/recv/PNMDATA.03.02.20260309161154.001
<span style="color:#22c55e">-rw-r--r-- 1 porta_pnmv3 ... PNMDATA.03.02.20260309161154.001</span>

<span style="color:#94a3b8">$</span> ls -la /home/porta_pnmv3/PortaSync/pnmdata/03/arch_recv/PNMDATA.03.02.20260309161154.001
<span style="color:#22c55e">-rw-r--r-- 1 porta_pnmv3 ... PNMDATA.03.02.20260309161154.001</span>`}
      </CodeBlock>

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Répertoire</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Fichier présent ?</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Signification</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><code>recv/</code></TableCell>
              <TableCell sx={{ color: 'error.main', fontWeight: 'bold' }}>Oui (doublon)</TableCell>
              <TableCell>Fichier renvoyé par l&apos;opérateur — à supprimer</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>arch_recv/</code></TableCell>
              <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>Oui (original)</TableCell>
              <TableCell>Fichier déjà traité et archivé — preuve que le traitement initial a fonctionné</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Étape 3 : Suppression ── */}
      <StepHeader number={3} icon="solar:trash-bin-trash-bold-duotone" title="Supprimer le fichier doublon de recv/" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Supprimer le fichier doublon via <strong>FileZilla</strong> (connexion SFTP vers vmqproportasync01) :
      </Typography>

      <Box component="ol" sx={{ pl: 2, mb: 2, '& li': { fontSize: 14, mb: 1 } }}>
        <li>
          Se connecter à <strong>vmqproportasync01</strong> via FileZilla
        </li>
        <li>
          Naviguer vers le répertoire de l&apos;opérateur concerné :
          <CodeBlock>{`/home/porta_pnmv3/PortaSync/pnmdata/03/recv/`}</CodeBlock>
        </li>
        <li>
          Sélectionner le fichier <code>PNMDATA.03.02.20260309161154.001</code> et le <strong>supprimer</strong>
        </li>
        <li>
          Vérifier que le fichier n&apos;est plus dans <code>recv/</code> :
          <CodeBlock>
            {`<span style="color:#94a3b8">$</span> ls /home/porta_pnmv3/PortaSync/pnmdata/03/recv/PNMDATA.03.02.20260309161154.001
ls: cannot access '...': <span style="color:#ef4444">No such file or directory</span>`}
          </CodeBlock>
        </li>
      </Box>

      {/* ── Étape 4 : Vérification post-suppression ── */}
      <StepHeader number={4} icon="solar:check-circle-bold-duotone" title="Vérifier le bon fonctionnement" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Relancer le script pour confirmer que l&apos;erreur a disparu :
      </Typography>

      <CodeBlock>
        {`<span style="color:#94a3b8">$</span> ./PnmDataAckManager.sh -v
PnmDataAckManager.php|2026-03-10T16:38:58-04:00| Initialisation
<span style="color:#22c55e">..Verification operateur Orange Caraibe : Check success</span>
<span style="color:#22c55e">..Verification operateur Digicel AFG : Check success</span>
<span style="color:#22c55e">..Verification operateur Outremer Telecom / SFR : Check success</span>
<span style="color:#22c55e">..Verification operateur Dauphin Telecom : Check success</span>
<span style="color:#22c55e">..Verification operateur UTS Caraibe : Check success</span>
<span style="color:#22c55e">..Verification operateur Free Caraibes : Check success</span>
Fin Initialisation
<span style="color:#22c55e;font-weight:bold">Fin de Traitement 0.01secondes.</span>`}
      </CodeBlock>

      <Alert severity="success" sx={{ mb: 2 }}>
        <strong>Résultat —</strong> Le script s&apos;exécute sans erreur. Aucun fichier à traiter, fin de traitement
        immédiate (0.01s vs 0.04s avec le fichier doublon). Le problème est résolu.
      </Alert>

      {/* ── Points de vigilance ── */}
      <Divider sx={{ my: 3 }} />

      <Alert severity="success" icon={<Iconify icon="solar:check-circle-bold-duotone" width={22} />}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Points de vigilance
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 0, '& li': { fontSize: 13, mb: 0.5 } }}>
          <li>Toujours vérifier que le fichier existe dans <code>arch_recv/</code> <strong>avant</strong> de supprimer celui de <code>recv/</code></li>
          <li>Ne <strong>jamais</strong> supprimer le fichier de <code>arch_recv/</code> — c&apos;est la trace du traitement original</li>
          <li>L&apos;erreur E008 est <strong>sans impact fonctionnel</strong> sur les portabilités — le fichier a déjà été traité</li>
          <li>Si le même opérateur renvoie régulièrement des fichiers en double, signaler le problème par email</li>
          <li>Le log SOAP XML dans <code>PnmAckManager.log</code> peut être très volumineux — ne pas s&apos;alarmer de la taille</li>
          <li>Après suppression, toujours relancer <code>./PnmDataAckManager.sh -v</code> pour confirmer la résolution</li>
        </Box>
      </Alert>
    </>
  ),
};

// ─── Cas 8 : PortaWs inaccessible ────────────────────────────────────────────

const casPortaWsInaccessible: CasPratique = {
  id: 'portaws-inaccessible',
  title: 'Le portail PortaWs ne s\'affiche plus — Diagnostic et résolution',
  date: '11/03/2026',
  severity: 'critique',
  category: 'infrastructure',
  tags: ['PortaWs', 'Portail', 'Incident', 'Tomcat', 'Infrastructure'],
  summary:
    'Le portail PortaWebUI est inaccessible (page blanche, timeout, erreur 502/503). Plusieurs causes possibles : Tomcat arrêté, base de données PortaDB injoignable, problème réseau ou certificat expiré.',
  content: (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Le portail <strong>PortaWebUI</strong> ne répond plus. L&apos;accès par le navigateur retourne une page blanche,
        un timeout ou une erreur HTTP (502, 503). Ce cas couvre les différentes causes possibles et la démarche
        de diagnostic.
      </Typography>

      <Alert severity="error" sx={{ mb: 2 }}>
        <strong>Impact —</strong> Sans PortaWs, impossible de consulter les mandats, vérifier les états de portabilité
        ou utiliser le DAPI. Les opérations de portabilité continuent en arrière-plan mais la visibilité est perdue.
      </Alert>

      {/* ── Étape 1 : Diagnostic initial ── */}
      <StepHeader number={1} icon="solar:magnifer-bold-duotone" title="Diagnostic initial" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Vérifier d&apos;abord si le problème est local ou général :
      </Typography>

      <Box component="ol" sx={{ pl: 2, mb: 2, '& li': { fontSize: 14, mb: 1 } }}>
        <li>Tester l&apos;accès depuis un autre navigateur / poste</li>
        <li>Vérifier que le VPN est connecté (si accès distant)</li>
        <li>Tester un <code>ping</code> vers le serveur PortaWs</li>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Serveurs et URLs de production :</strong>
        <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5, '& li': { fontSize: 13, mb: 0.5 } }}>
          <li><strong>PortaWebUi</strong> (CDC) : <code>http://172.24.119.71:8080/PortaWebUi/</code> — serveur <strong>vmqproportaweb01</strong></li>
          <li><strong>PortaWs</strong> (Admin) : <code>http://172.24.119.72:8080/PortaWs/</code> — serveur <strong>vmqproportaws01</strong></li>
          <li><strong>Base de données</strong> : <code>vmqproportawebdb01</code> — MySQL :3306 (PortaDB + PortaWebDB)</li>
          <li><strong>Nagios PortaWebUi</strong> : <code>http://digimqmon05/nagios/cgi-bin/extinfo.cgi?type=1&amp;host=vmqproportaweb01</code></li>
          <li><strong>Nagios PortaWs</strong> : <code>http://digimqmon05/nagios/cgi-bin/extinfo.cgi?type=1&amp;host=vmqproportaws01</code></li>
        </Box>
      </Alert>

      <CodeBlock>{`# Vérifier les portails
ping 172.24.119.71    # vmqproportaweb01 (PortaWebUi)
ping 172.24.119.72    # vmqproportaws01 (PortaWs)`}</CodeBlock>

      {/* ── Étape 2 : Arbre de décision ── */}
      <StepHeader number={2} icon="solar:routing-bold-duotone" title="Arbre de décision" />

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Symptôme</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Cause probable</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Vérification</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Résolution</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Timeout / connexion refusée</TableCell>
              <TableCell sx={{ color: 'error.main' }}>Tomcat arrêté</TableCell>
              <TableCell>Nagios : <code>systemctl status tomcat</code></TableCell>
              <TableCell>Recharger via <code>http://172.24.119.72:8080/manager/html</code> ou <code>systemctl restart tomcat</code> sur vmqproportaws01</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Erreur 502 / 503</TableCell>
              <TableCell sx={{ color: 'error.main' }}>Application non déployée ou crash</TableCell>
              <TableCell>Logs Tomcat : <code>catalina.out</code></TableCell>
              <TableCell>Si Tomcat bloqué : <code>kill -9</code> sur le PID Java puis <code>systemctl restart tomcat</code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Page blanche / erreur DB</TableCell>
              <TableCell sx={{ color: 'warning.main' }}>Base PortaDB injoignable</TableCell>
              <TableCell>Tester MySQL :3306 sur vmqproportawebdb01</TableCell>
              <TableCell>Vérifier le service MySQL, espace disque sur vmqproportawebdb01 (172.24.119.68)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Erreur certificat / HTTPS</TableCell>
              <TableCell sx={{ color: 'warning.main' }}>Certificat SSL expiré</TableCell>
              <TableCell>Vérifier la date d&apos;expiration du certificat</TableCell>
              <TableCell>Renouveler le certificat, redémarrer Tomcat</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Ping OK mais HTTP timeout</TableCell>
              <TableCell sx={{ color: 'info.main' }}>Pare-feu / port bloqué</TableCell>
              <TableCell><code>telnet &lt;adresse&gt; 8443</code></TableCell>
              <TableCell>Contacter l&apos;équipe réseau pour ouvrir le port</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Étape 3 : Vérifications serveur ── */}
      <StepHeader number={3} icon="solar:server-bold-duotone" title="Vérifications sur le serveur" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Se connecter en SSH et vérifier selon le portail concerné :
      </Typography>

      <CodeBlock>
        {`# === PortaWs (vmqproportaws01 — 172.24.119.72) ===
# Se connecter en root sur vmqproportaws01

# 1. Vérifier Tomcat
systemctl status tomcat

# 2. Si Tomcat est down → le relancer
systemctl restart tomcat

# 3. Si Tomcat est bloqué (refuse de redémarrer) → kill -9 puis relancer
ps aux | grep java   # trouver le PID
kill -9 <PID_JAVA>
systemctl restart tomcat

# 4. Alternative : recharger l'app via l'interface Tomcat Manager
# http://172.24.119.72:8080/manager/html

# 5. Vérifier les logs
tail -n 50 /opt/tomcat9/logs/catalina.out

# 6. Vérifier l'espace disque
df -h

# === PortaWebUi (vmqproportaweb01 — 172.24.119.71) ===
# Même procédure mais sur vmqproportaweb01`}
      </CodeBlock>

      {/* ── Étape 4 : Escalade ── */}
      <StepHeader number={4} icon="solar:phone-calling-bold-duotone" title="Escalade si non résolu" />

      <Alert severity="info" sx={{ mb: 2 }}>
        Si le problème persiste après les vérifications :
      </Alert>

      <Box component="ol" sx={{ pl: 2, mb: 2, '& li': { fontSize: 14, mb: 1 } }}>
        <li>Vérifier la sonde <strong>Nagios</strong> pour le serveur concerné</li>
        <li>Suivre la procédure d&apos;incident « Portails DAPI indisponibles » sur le SharePoint Astreinte</li>
        <li>Si le portail n&apos;est toujours pas disponible → <strong>Escalader à l&apos;équipe SYSTEM</strong></li>
        <li>Communiquer à l&apos;équipe <strong>PNM_SI</strong> si l&apos;indisponibilité dure et créer un flashinfo</li>
        <li>Les portabilités continuent en arrière-plan — seule la consultation est impactée</li>
        <li>Identifiants/mots de passe disponibles sur le <strong>Secret Server</strong> : <code>https://vmqpropass01</code></li>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Alert severity="success" icon={<Iconify icon="solar:check-circle-bold-duotone" width={22} />}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Points de vigilance</Typography>
        <Box component="ul" sx={{ pl: 2, mb: 0, '& li': { fontSize: 13, mb: 0.5 } }}>
          <li>Un redémarrage Tomcat suffit dans la majorité des cas</li>
          <li>Un disque plein est une cause fréquente de crash silencieux</li>
          <li>Les portabilités continuent même si le portail est down — seule la visibilité est perdue</li>
          <li>Documenter l&apos;incident dans le rapport de vacation</li>
        </Box>
      </Alert>
    </>
  ),
};

// ─── Cas 9 : Portabilités HUB en échec ──────────────────────────────────────

const casHubEnPanne: CasPratique = {
  id: 'hub-portabilites-echec',
  title: 'Les portabilités depuis le HUB ne fonctionnent plus',
  date: '11/03/2026',
  severity: 'critique',
  category: 'infrastructure',
  tags: ['HUB', 'PortaWs', 'SOAP', 'Incident', 'Infrastructure'],
  summary:
    'Les demandes de portabilité saisies via le HUB échouent avec un message d\'erreur. Aucune trace n\'apparaît sur le portail PortaWebUI. Causes possibles : webservice SOAP PortaWs injoignable, problème de connectivité HUB→PortaWs, ou quota dépassé.',
  content: (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Les demandes de portabilité saisies par les CDC (Chargés De Clientèle) via le <strong>HUB</strong> (ou WebStore / Wizzee) retournent
        un message d&apos;erreur. Aucun mandat n&apos;apparaît sur <strong>PortaWebUI</strong>, ce qui signifie que la
        requête n&apos;atteint pas le webservice SOAP.
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Chaîne de webservices impliqués :</strong>
        <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5, '& li': { fontSize: 13, mb: 0.5 } }}>
          <li><strong>HUB / WebStore / Wizzee</strong> → <code>PortaUiWs4Esb</code> sur vmqproportaweb01 : <code>http://172.24.119.71:8080/PortaWebUi/DigicelFwiPortaUiWs4Esb?wsdl</code></li>
          <li><strong>PortaWebUi</strong> → <code>PortaWs4Esb</code> sur vmqproportaws01 : <code>http://172.24.119.72:8080/PortaWs/DigicelFwiPortaWs4Esb?wsdl</code></li>
          <li><strong>DAPI</strong> → ESB DataProxy → <code>DigicelFwiEsbWs4Porta</code> : <code>http://172.24.116.76:8000/.../DigicelFwiEsbWs4Porta.wsdl</code></li>
          <li><strong>Traitement interne</strong> → <code>PortaWs4PortaSync</code> : <code>http://172.24.119.72:8080/PortaWs/DigicelFwiPortaWs4PortaSync?wsdl</code></li>
        </Box>
      </Alert>

      <Alert severity="error" sx={{ mb: 2 }}>
        <strong>Impact —</strong> Aucune nouvelle portabilité ne peut être saisie. Les portabilités déjà en cours
        continuent leur cycle normalement. Seules les <strong>nouvelles demandes</strong> sont bloquées.
      </Alert>

      {/* ── Étape 1 : Qualifier le problème ── */}
      <StepHeader number={1} icon="solar:magnifer-bold-duotone" title="Qualifier le problème" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Recueillir les informations auprès du CDC :
      </Typography>

      <Box component="ol" sx={{ pl: 2, mb: 2, '& li': { fontSize: 14, mb: 1 } }}>
        <li><strong>Message d&apos;erreur exact</strong> affiché sur le HUB (capture d&apos;écran si possible)</li>
        <li><strong>MSISDN</strong> de la portabilité tentée</li>
        <li>Le problème touche-t-il <strong>un seul CDC</strong> ou <strong>tous les CDC</strong> ?</li>
        <li>Depuis <strong>quand</strong> le problème est apparu ?</li>
      </Box>

      {/* ── Étape 2 : Arbre de décision ── */}
      <StepHeader number={2} icon="solar:routing-bold-duotone" title="Arbre de décision selon le message d'erreur" />

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Message d&apos;erreur / Symptôme</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Cause probable</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Résolution</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><code>Connection refused</code> / <code>Timeout</code></TableCell>
              <TableCell sx={{ color: 'error.main' }}>PortaWs est down ou injoignable</TableCell>
              <TableCell>Vérifier PortaWs (cf. Cas Pratique &quot;PortaWs inaccessible&quot;)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>SOAP Fault</code> / <code>Internal Server Error (500)</code></TableCell>
              <TableCell sx={{ color: 'error.main' }}>Erreur applicative côté PortaWs</TableCell>
              <TableCell>Vérifier les logs Tomcat (<code>catalina.out</code>), possible bug ou données invalides</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Erreur d&apos;authentification / <code>401 Unauthorized</code></TableCell>
              <TableCell sx={{ color: 'warning.main' }}>Credentials HUB→PortaWs expirés</TableCell>
              <TableCell>Vérifier la config du HUB, renouveler les credentials si besoin</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Pas de trace dans PortaWebUI</TableCell>
              <TableCell sx={{ color: 'warning.main' }}>La requête ne parvient pas au WS</TableCell>
              <TableCell>Vérifier connectivité réseau HUB→PortaWs, pare-feu, proxy</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Erreur sur <strong>un seul MSISDN</strong></TableCell>
              <TableCell sx={{ color: 'info.main' }}>Données de portabilité invalides (RIO, dates)</TableCell>
              <TableCell>Vérifier le RIO, la date de portabilité, le MSISDN via les outils Vérifier</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Étape 3 : Vérifications techniques ── */}
      <StepHeader number={3} icon="solar:server-bold-duotone" title="Vérifications techniques" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Si le problème touche <strong>tous les CDC</strong>, c&apos;est un problème d&apos;infrastructure :
      </Typography>

      <CodeBlock>
        {`# 1. Vérifier que le WS PortaUiWs4Esb répond (appelé par le HUB)
curl -s http://172.24.119.71:8080/PortaWebUi/DigicelFwiPortaUiWs4Esb?wsdl | head -5

# 2. Vérifier que le WS PortaWs4Esb répond (appelé par PortaWebUi)
curl -s http://172.24.119.72:8080/PortaWs/DigicelFwiPortaWs4Esb?wsdl | head -5

# 3. Si timeout → Tomcat est down sur le serveur concerné
# Sur vmqproportaweb01 (PortaWebUi) :
systemctl status tomcat

# Sur vmqproportaws01 (PortaWs) :
systemctl status tomcat

# 4. Vérifier les logs pour des erreurs SOAP
tail -n 100 /opt/tomcat9/logs/catalina.out | grep -i "error\\|exception\\|fault"`}
      </CodeBlock>

      <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
        Si le problème touche <strong>un seul CDC</strong>, c&apos;est un problème de données :
      </Typography>

      <Box component="ol" sx={{ pl: 2, mb: 2, '& li': { fontSize: 14, mb: 1 } }}>
        <li>Vérifier le <strong>RIO</strong> avec l&apos;outil Vérifier → RIO Validator</li>
        <li>Vérifier que le <strong>MSISDN</strong> n&apos;a pas déjà un portage en cours sur PortaWebUI</li>
        <li>Vérifier que la <strong>date de portabilité</strong> est dans le futur (J+7 minimum)</li>
      </Box>

      {/* ── Étape 4 : Escalade ── */}
      <StepHeader number={4} icon="solar:phone-calling-bold-duotone" title="Escalade" />

      <Alert severity="warning" sx={{ mb: 2 }}>
        Si le problème est général et persiste :
      </Alert>

      <Box component="ol" sx={{ pl: 2, mb: 2, '& li': { fontSize: 14, mb: 1 } }}>
        <li>Contacter l&apos;équipe <strong>infrastructure</strong> avec le message d&apos;erreur exact et les logs</li>
        <li>Si PortaWs est down : priorité haute, redémarrer Tomcat en urgence</li>
        <li>Informer les CDC que les saisies seront possibles après résolution</li>
        <li>Communiquer à l&apos;équipe <strong>PNM_SI</strong> si l&apos;indisponibilité dure et créer un flashinfo</li>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Alert severity="success" icon={<Iconify icon="solar:check-circle-bold-duotone" width={22} />}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Points de vigilance</Typography>
        <Box component="ul" sx={{ pl: 2, mb: 0, '& li': { fontSize: 13, mb: 0.5 } }}>
          <li>Toujours demander le <strong>message d&apos;erreur exact</strong> au CDC avant de diagnostiquer</li>
          <li>Un problème sur un seul CDC ≠ un problème d&apos;infrastructure</li>
          <li>Les portabilités déjà en cours ne sont <strong>pas impactées</strong> — seules les nouvelles saisies sont bloquées</li>
          <li>Après résolution, demander au CDC de <strong>re-saisir</strong> la portabilité (elle n&apos;a pas été enregistrée)</li>
        </Box>
      </Alert>
    </>
  ),
};

// ─── Cas 10 : Plus aucun fichier reçu des opérateurs ─────────────────────────

const casAucunFichierRecu: CasPratique = {
  id: 'aucun-fichier-recu-operateurs',
  title: 'On ne reçoit plus aucun fichier des opérateurs sur vmqproportasync01',
  date: '11/03/2026',
  severity: 'critique',
  category: 'infrastructure',
  tags: ['SFTP', 'vmqproportasync01', 'Fichiers', 'Incident', 'Infrastructure', 'Cron'],
  summary:
    'Aucun fichier PNMDATA n\'est reçu dans les répertoires recv/ des opérateurs sur le serveur vmqproportasync01. Les vacations précédentes n\'ont rien déposé. Causes possibles : service SFTP down, cron PortaSync arrêté, espace disque saturé, ou problème réseau/firewall.',
  content: (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Lors de la vérification des vacations, on constate qu&apos;aucun fichier PNMDATA n&apos;a été déposé dans les
        répertoires <code>recv/</code> des opérateurs. Le rapport de vacation indique <strong>0 fichiers reçus</strong>.
        Ce cas couvre le diagnostic complet.
      </Typography>

      <Alert severity="error" sx={{ mb: 2 }}>
        <strong>Impact —</strong> Sans fichiers reçus, les portabilités en cours ne peuvent pas avancer.
        Les tickets (1210, 1430, etc.) des autres opérateurs ne sont pas traités. Incident critique à résoudre rapidement.
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Architecture des échanges de fichiers :</strong>
        <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5, '& li': { fontSize: 13, mb: 0.5 } }}>
          <li><strong>BTCTF</strong> (172.24.119.70) : serveur d&apos;échange de fichiers (Bouygues Telecom Caraïbe Transfert File). Les opérateurs y déposent leurs fichiers via SFTP</li>
          <li><strong>vmqproportasync01</strong> (172.24.119.69) : récupère les fichiers depuis BTCTF, les acquitte, et les archive dans <code>arch_recv/</code></li>
          <li><strong>Vacations</strong> : 10h-11h, 14h-15h, 19h-20h + synchro dimanche 22h-24h</li>
        </Box>
      </Alert>

      {/* ── Étape 1 : Diagnostic rapide ── */}
      <StepHeader number={1} icon="solar:magnifer-bold-duotone" title="Diagnostic rapide — est-ce nous ou eux ?" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Vérifier si le problème touche <strong>tous les opérateurs</strong> ou un seul :
      </Typography>

      <CodeBlock>
        {`# Lister les derniers fichiers reçus de chaque opérateur
for op in 01 03 04 05 06; do
  echo "=== Operateur $op ==="
  ls -lt /home/porta_pnmv3/PortaSync/pnmdata/$op/arch_recv/ | head -n 3
done`}
      </CodeBlock>

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Constat</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Signification</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><strong>Aucun</strong> opérateur n&apos;a déposé</TableCell>
              <TableCell sx={{ color: 'error.main' }}>Problème côté notre serveur (SFTP, cron, disque)</TableCell>
              <TableCell>Passer à l&apos;étape 2</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Un seul</strong> opérateur manquant</TableCell>
              <TableCell sx={{ color: 'warning.main' }}>Problème côté cet opérateur</TableCell>
              <TableCell>Contacter l&apos;opérateur concerné, puis passer à l&apos;étape 4</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Étape 2 : Vérifier le serveur ── */}
      <StepHeader number={2} icon="solar:server-bold-duotone" title="Vérifier le serveur vmqproportasync01" />

      <CodeBlock>
        {`# 1. Espace disque — un disque plein bloque les écritures SFTP
df -h

# 2. Service SFTP — doit être actif pour que les opérateurs déposent
systemctl status sshd

# 3. Cron PortaSync — vérifier que les crons de récupération tournent
crontab -l | grep -i "porta\|pnm\|sync"

# 4. Logs système — erreurs récentes
tail -n 50 /var/log/messages | grep -i "error\|fail\|denied"
tail -n 50 /var/log/secure | grep -i "sftp\|porta"`}
      </CodeBlock>

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Vérification</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Résultat anormal</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Résolution</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><code>df -h</code></TableCell>
              <TableCell sx={{ color: 'error.main' }}>Filesystem à 100%</TableCell>
              <TableCell>Libérer de l&apos;espace (purger les anciens logs, archives), puis redémarrer sshd</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>systemctl status sshd</code></TableCell>
              <TableCell sx={{ color: 'error.main' }}>Service arrêté / failed</TableCell>
              <TableCell><code>systemctl restart sshd</code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>crontab -l</code></TableCell>
              <TableCell sx={{ color: 'warning.main' }}>Cron absent ou commenté</TableCell>
              <TableCell>Rétablir les entrées cron de PortaSync</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Logs <code>/var/log/secure</code></TableCell>
              <TableCell sx={{ color: 'warning.main' }}>Connexions SFTP refusées</TableCell>
              <TableCell>Vérifier les permissions, le chroot SFTP, les clés SSH</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Étape 3 : Vérifier les répertoires ── */}
      <StepHeader number={3} icon="solar:folder-check-bold-duotone" title="Vérifier les répertoires et permissions" />

      <CodeBlock>
        {`# Vérifier que les répertoires recv/ existent et sont accessibles
for op in 01 03 04 05 06; do
  echo "=== Operateur $op ==="
  ls -ld /home/porta_pnmv3/PortaSync/pnmdata/$op/recv/
done

# Vérifier s'il y a des fichiers en attente dans recv/ (non encore traités)
for op in 01 03 04 05 06; do
  echo "=== Operateur $op ==="
  ls -la /home/porta_pnmv3/PortaSync/pnmdata/$op/recv/ 2>/dev/null
done`}
      </CodeBlock>

      {/* ── Étape 4 : Relancer les vacations manuellement ── */}
      <StepHeader number={4} icon="solar:restart-bold-duotone" title="Relancer les vacations manquantes" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Si le problème est résolu et que des vacations n&apos;ont pas été générées, les relancer par opérateur
        (se connecter sur <strong>vmqproportasync01</strong> avec <code>porta_pnmv3</code>) :
      </Typography>

      <CodeBlock>
        {`cd ~/PortaSync/

# 1. Vérifier quelles vacations ont été générées
tail -n 30 log/PnmDataManager.log

# 2. Vérifier les fichiers déjà présents ou en .tmp
# (vérifier dans arch_send ET send pour chaque opérateur)
ls -la pnmdata/01/arch_send/ pnmdata/01/send/

# 3. Si un fichier est en .tmp → supprimer l'extension .tmp

# 4. Relancer la vacation par opérateur :
./PnmDataManager_oc.sh -v     # Orange Caraïbe (01)
./PnmDataManager_sfrc.sh -v   # SFR Caraïbe (03)
./PnmDataManager_dt.sh -v     # Dauphin Télécom (04)
./PnmDataManager_uts.sh -v    # UTS Caraïbe (05)
./PnmDataManager_freec.sh -v  # Free Caraïbes (06)`}
      </CodeBlock>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <strong>Procédure de relance à effectuer tous les lundis matin</strong> après 10h et avant 10h30, au cas par cas.
        Ne relancer que pour les opérateurs qui n&apos;ont pas eu de fichier généré.
      </Alert>

      {/* ── Étape 5 : Escalade ── */}
      <StepHeader number={5} icon="solar:phone-calling-bold-duotone" title="Escalade et communication" />

      <Box component="ol" sx={{ pl: 2, mb: 2, '& li': { fontSize: 14, mb: 1 } }}>
        <li>
          <strong>Problème côté notre serveur :</strong> Escalader à l&apos;équipe <strong>SYSTEM</strong> en urgence avec les éléments
          collectés (espace disque, état sshd, erreurs logs)
        </li>
        <li>
          <strong>Problème côté un opérateur :</strong> Contacter l&apos;opérateur concerné par email (voir Guide des Opérations → Contacts).
          À la fin de chaque vacation, transmettre un mail à l&apos;opérateur qui n&apos;a pas déposé son fichier
        </li>
        <li>
          Communiquer à l&apos;équipe <strong>PNM_SI</strong> si le problème dure plus d&apos;une vacation et créer un flashinfo
        </li>
        <li>
          <strong>Documenter</strong> l&apos;incident dans le rapport de vacation avec l&apos;heure de détection et les actions prises
        </li>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Alert severity="success" icon={<Iconify icon="solar:check-circle-bold-duotone" width={22} />}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Points de vigilance</Typography>
        <Box component="ul" sx={{ pl: 2, mb: 0, '& li': { fontSize: 13, mb: 0.5 } }}>
          <li>Un disque plein est la cause n°1 de panne silencieuse sur les serveurs SFTP</li>
          <li>Si <strong>tous</strong> les opérateurs sont concernés = problème chez nous. Si <strong>un seul</strong> = problème chez eux</li>
          <li>Vérifier les <code>.ERR</code> dans <code>arch_send/</code> — des E011 massifs confirment l&apos;absence de communication</li>
          <li>Après résolution, les fichiers en retard arrivent généralement à la vacation suivante</li>
          <li>Les fichiers transitent via <strong>BTCTF</strong> (172.24.119.70) — si BTCTF est down, tous les opérateurs sont impactés</li>
          <li>Identifiants sur le <strong>Secret Server</strong> : <code>https://vmqpropass01</code></li>
        </Box>
      </Alert>
    </>
  ),
};

// ─── Cas 11 : Fichier FNR non transmis à EMA ────────────────────────────────

const casFnrNonTransmis: CasPratique = {
  id: 'fnr-non-transmis-ema',
  title: 'Le fichier FNR n\'a pas été transmis à EMA — Alerte batchhandler',
  date: '11/03/2026',
  severity: 'critique',
  category: 'infrastructure',
  tags: ['FNR', 'EMA', 'Bascule', 'Alerte', 'batchhandler'],
  summary:
    'On a reçu le mail d\'alerte « [PNM] Controle fichier batchhandler FNR_V3 sur EMA » indiquant que le fichier de mise à jour du FNR n\'a pas été transmis correctement à EMA (Ericsson Mobile Application). Ce fichier est critique car il met à jour la base FNR qui route les appels vers le bon opérateur.',
  content: (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Le système a envoyé l&apos;alerte <strong>[PNM] Controle fichier batchhandler FNR_V3 sur EMA</strong>.
        Cela signifie que le fichier de bascule FNR (Flexible Number Register) n&apos;a pas été correctement transmis
        ou traité par EMA. Ce fichier est <strong>critique</strong> : sans lui, les appels vers les numéros portés
        ne sont pas routés correctement.
      </Typography>

      <Alert severity="error" sx={{ mb: 2 }}>
        <strong>Impact —</strong> Les numéros portés lors de la dernière bascule ne sont pas mis à jour dans le FNR.
        Les appels vers ces numéros peuvent être mal routés (envoyés à l&apos;ancien opérateur au lieu du nouveau).
        <strong> Incident critique à traiter en priorité.</strong>
      </Alert>

      {/* ── Étape 1 : Comprendre le flux ── */}
      <StepHeader number={1} icon="solar:book-bookmark-bold-duotone" title="Comprendre le flux FNR" />

      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Flux normal :</strong> Après la bascule (EmaExtracter), le système génère un fichier FNR contenant
        la liste des numéros à basculer. Ce fichier est envoyé à EMA via le batchhandler. EMA l&apos;intègre pour
        mettre à jour le routage des appels. Un contrôle automatique vérifie ensuite que le fichier a bien été traité.
      </Alert>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, px: 1 }}>
        {['Bascule (EmaExtracter)', '→', 'Génération fichier FNR', '→', 'Envoi à EMA (batchhandler)', '→', 'Contrôle automatique'].map((step, i) => (
          <Chip
            key={i}
            label={step}
            size="small"
            variant={step === '→' ? 'outlined' : 'filled'}
            color={step === '→' ? 'default' : i <= 4 ? 'success' : i === 8 ? 'info' : 'warning'}
            sx={step === '→' ? { border: 'none', minWidth: 20 } : undefined}
          />
        ))}
      </Box>

      {/* ── Étape 2 : Vérifier la bascule et le log FNR sur EMA ── */}
      <StepHeader number={2} icon="solar:magnifer-bold-duotone" title="Vérifier la bascule et le log FNR sur EMA" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>1.</strong> Vérifier que la bascule a eu lieu sur <strong>vmqproportasync01</strong> (user <code>porta_pnmv3</code>) :
      </Typography>

      <CodeBlock>
        {`# Vérifier le log de bascule (la bascule a lieu à 9h)
tail -n 30 /home/porta_pnmv3/PortaSync/log/EmaExtracter.log

# Vérifier l'état des dossiers de portabilité du jour sur PortaWs
# Si statut "Basculé" ou "Cloturé" → ne rien faire
# Si autre statut → relancer le script :
./EmaExtracter.sh -v`}
      </CodeBlock>

      <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
        <strong>2.</strong> À partir de <strong>10h</strong>, vérifier le traitement du FNR sur <strong>EMA15-Digicel</strong> (172.24.119.140) :
      </Typography>

      <CodeBlock>
        {`# Se connecter à EMA15-Digicel avec l'user batchuser
ssh batchuser@172.24.119.140

# Vérifier le log FNR du jour (format: YYYY-MM-DD_HH.MM.SS_fnr_action_v3.bh.log)
cd ~/LogFiles/
ls -lt *fnr_action_v3* | head -3
tail -f <dernier_fichier_log>

# Exemple de log normal :
# DELETE:NPSUB:MSISDN,590690675667;
# RESP:0;
# BatchJob started at: 2026-03-11 09:15:06;
# BatchJob finished at: 2026-03-11 09:15:10.
# Totally 104 commands are successful.
# Totally 0 commands failed.`}
      </CodeBlock>

      {/* ── Étape 3 : Arbre de décision ── */}
      <StepHeader number={3} icon="solar:routing-bold-duotone" title="Diagnostic et résolution selon le cas" />

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Constat</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Cause</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Résolution</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Le fichier log FNR <strong>n&apos;existe pas</strong> sur EMA</TableCell>
              <TableCell sx={{ color: 'error.main' }}>Le script <code>fnr_action_v3.bh</code> ne s&apos;est pas exécuté</TableCell>
              <TableCell>Exécuter manuellement depuis EMA15-Digicel (voir commande ci-dessous)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Log existe mais <strong>commands failed &gt; 0</strong></TableCell>
              <TableCell sx={{ color: 'error.main' }}>Certaines commandes FNR ont échoué</TableCell>
              <TableCell>Le mail contient le log d&apos;erreur. Corriger les MSISDN un par un (GET/CREATE/SET/DELETE)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>La bascule n&apos;a <strong>pas eu lieu</strong> (EmaExtracter.log en erreur)</TableCell>
              <TableCell sx={{ color: 'error.main' }}>Pas de fichier FNR généré</TableCell>
              <TableCell>Relancer <code>./EmaExtracter.sh -v</code> sur vmqproportasync01 puis attendre le FNR</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bascule OK mais <strong>pas de log FNR</strong></TableCell>
              <TableCell sx={{ color: 'warning.main' }}>Échec de transfert vers EMA</TableCell>
              <TableCell>Vérifier la connectivité vmqproportasync01 → EMA15 (172.24.119.140)</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Étape 4 : Exécution manuelle du FNR ── */}
      <StepHeader number={4} icon="solar:play-bold-duotone" title="Exécuter le FNR manuellement sur EMA" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Si le fichier log FNR n&apos;existe pas, exécuter le script <code>fnr_action_v3.bh</code> manuellement :
      </Typography>

      <CodeBlock>
        {`# Depuis EMA15-Digicel (172.24.119.140) avec l'user batchuser :
(echo "LOGIN:batchuser:123batchuser;";sleep 5;echo "SET:BATCHJOB:FILE,DEF,fnr_action_v3.bh;"; sleep 5; echo "LOGOUT;";sleep 5)| telnet 0 3333`}
      </CodeBlock>

      <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
        <strong>Méthode recommandée — Pages web FNR</strong> : pour intervenir sur des MSISDN individuellement,
        utiliser les pages dédiées FNR sur <code>172.24.2.21</code> plutôt que la ligne de commande EMA.
        Ces pages sont documentées dans la procédure OneNote sur le SharePoint (onglet <strong>Production &amp; Astreinte</strong>).
      </Alert>

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Page web FNR</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Usage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><strong>Vérifier</strong></TableCell>
              <TableCell><code>http://172.24.2.21/apis/porta/fnr-get-info.html</code></TableCell>
              <TableCell>Vérifier si un MSISDN est dans le FNR</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Créer</strong></TableCell>
              <TableCell><code>http://172.24.2.21/apis/porta/fnr-create.php</code></TableCell>
              <TableCell>Ajouter un MSISDN au FNR (sélectionner l&apos;opérateur)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Modifier</strong></TableCell>
              <TableCell><code>http://172.24.2.21/apis/porta/fnr-update.php</code></TableCell>
              <TableCell>Changer le réseau d&apos;un MSISDN (sélectionner l&apos;opérateur)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Supprimer</strong></TableCell>
              <TableCell><code>http://172.24.2.21/apis/porta/fnr-delete.html</code></TableCell>
              <TableCell>Retirer un MSISDN du FNR</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
        <strong>Alternative — Commandes FNR unitaires en CLI</strong> (depuis EMA15-Digicel, uniquement si les pages web ne sont pas accessibles) :
      </Typography>

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Commande FNR</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Usage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><strong>Vérifier</strong> (GET)</TableCell>
              <TableCell><code>GET:NPSUB:MSISDN,590XXXXXXXXX;</code></TableCell>
              <TableCell>Vérifier si un MSISDN est dans le FNR</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Créer</strong> (CREATE)</TableCell>
              <TableCell><code>CREATE:NPSUB:MSISDN,590XXXXXXXXX;</code></TableCell>
              <TableCell>Ajouter un MSISDN au FNR</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Modifier</strong> (SET)</TableCell>
              <TableCell><code>SET:NPSUB:MSISDN,590XXXXXXXXX;</code></TableCell>
              <TableCell>Changer le réseau d&apos;un MSISDN</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Supprimer</strong> (DELETE)</TableCell>
              <TableCell><code>DELETE:NPSUB:MSISDN,590XXXXXXXXX;</code></TableCell>
              <TableCell>Retirer un MSISDN du FNR</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>Vérification en masse</strong> dans le FNR (préparer un fichier <code>check_msisdn_fnr.txt</code> avec 1 MSISDN par ligne au format international) :
      </Typography>

      <CodeBlock>
        {`# Depuis EMA15-Digicel :
(echo -e 'LOGIN:sogadm:sogadm;\\n' ; for i in \`cat check_msisdn_fnr.txt\`; do echo -e 'GET:NPSUB:MSISDN,'$i';\\n'; sleep 1; done ) | telnet 172.24.119.140 3300 > resultat_check_msisdn_fnr.txt`}
      </CodeBlock>

      {/* ── Étape 5 : Escalade ── */}
      <StepHeader number={5} icon="solar:phone-calling-bold-duotone" title="Escalade — incident critique" />

      <Alert severity="error" sx={{ mb: 2 }}>
        Un fichier FNR non transmis est un <strong>incident critique</strong>. Les appels vers les numéros portés
        sont mal routés tant que le FNR n&apos;est pas mis à jour.
      </Alert>

      <Box component="ol" sx={{ pl: 2, mb: 2, '& li': { fontSize: 14, mb: 1 } }}>
        <li>Si le FNR ne s&apos;est pas exécuté : l&apos;exécuter manuellement (étape 4)</li>
        <li>Si des commandes ont échoué : corriger les MSISDN un par un avec les commandes GET/CREATE/SET/DELETE</li>
        <li>Si le problème est réseau : contacter l&apos;équipe <strong>SYSTEM</strong></li>
        <li>Communiquer à l&apos;équipe <strong>PNM_SI</strong> et créer un flashinfo si l&apos;incident dure</li>
        <li>Après correction, vérifier avec un GET sur les MSISDN concernés</li>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Alert severity="success" icon={<Iconify icon="solar:check-circle-bold-duotone" width={22} />}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Points de vigilance</Typography>
        <Box component="ul" sx={{ pl: 2, mb: 0, '& li': { fontSize: 13, mb: 0.5 } }}>
          <li>Le FNR est <strong>critique</strong> — sans lui, les appels sont mal routés (impact utilisateur final)</li>
          <li>La vérification FNR doit se faire <strong>à partir de 10h</strong> (après la bascule de 9h)</li>
          <li>Serveur EMA : <strong>EMA15-Digicel</strong> (172.24.119.140), user <code>batchuser</code></li>
          <li>Le mail d&apos;alerte <strong>[PNM] Controle fichier batchhandler FNR_V3 sur EMA</strong> contient le détail des erreurs</li>
          <li>Les MSISDN dans le FNR sont au <strong>format international</strong> (590...)</li>
          <li>Documenter l&apos;incident — le GPMAG peut demander un rapport</li>
        </Box>
      </Alert>
    </>
  ),
};

// ─── Cas 12 : Erreur de MSISDN provisoire ───────────────────────────────────

const casMsisdnProvisoireErreur: CasPratique = {
  id: 'msisdn-provisoire-erreur',
  title: 'Le CDC s\'est trompé de MSISDN provisoire — Comment le corriger ?',
  date: '11/03/2026',
  severity: 'mineur',
  category: 'saisie',
  tags: ['MSISDN provisoire', 'CDC', 'Saisie', 'Correction', 'PortaWs', 'Annulation'],
  summary:
    'Un Chargé De Clientèle (CDC) a saisi un mauvais MSISDN provisoire lors de la demande de portabilité entrante. Selon l\'état d\'avancement du mandat, plusieurs solutions sont possibles : modification directe, annulation/re-saisie, ou intervention manuelle.',
  content: (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Un CDC signale qu&apos;il s&apos;est trompé en saisissant le <strong>MSISDN provisoire</strong> (numéro temporaire
        attribué au client en attendant le portage). Le MSISDN provisoire est celui sur lequel le client est joignable
        chez Digicel en attendant que la portabilité soit effective.
      </Typography>

      <Alert severity="error" sx={{ mb: 2 }}>
        <strong>Impact —</strong> Si le MSISDN provisoire est faux, la bascule va se faire sur un <strong>mauvais
        numéro</strong> (donc sur un autre client), ou <strong>pas du tout</strong> (si le numéro n&apos;existe pas ou plus).
        Le MSISDN provisoire dans la porta ne sert qu&apos;à faire le <strong>changement de MSISDN le jour de la bascule</strong>.
      </Alert>

      {/* ── Étape 1 : Identifier l'état du mandat ── */}
      <StepHeader number={1} icon="solar:magnifer-bold-duotone" title="Identifier l'état du mandat sur PortaWs" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Rechercher le mandat sur <strong>PortaWebUI</strong> avec le MSISDN à porter (pas le provisoire) :
      </Typography>

      <Box component="ol" sx={{ pl: 2, mb: 2, '& li': { fontSize: 14, mb: 1 } }}>
        <li>Se connecter à <strong>PortaWs</strong> : <code>http://172.24.119.72:8080/PortaWs/</code></li>
        <li>Rechercher par le <strong>MSISDN du client</strong> (numéro à porter)</li>
        <li>Noter l&apos;<strong>état du mandat</strong> et la <strong>date de portabilité prévue</strong></li>
      </Box>

      {/* ── Étape 2 : Arbre de décision ── */}
      <StepHeader number={2} icon="solar:routing-bold-duotone" title="Solutions selon l'état du mandat" />

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>État du mandat</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Solution</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Procédure</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ bgcolor: 'success.lighter' }}>
              <TableCell><strong>Pas encore basculée</strong><br />(1110 envoyé, ou 1210 reçu)</TableCell>
              <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>Modifier le numéro dans la base de données</TableCell>
              <TableCell>
                Solution la plus simple : corriger le MSISDN provisoire directement dans la base de données
                PortaDB tant que la portabilité n&apos;est pas encore basculée
              </TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: 'warning.lighter' }}>
              <TableCell><strong>Pas encore basculée</strong><br />(alternative si modification BDD impossible)</TableCell>
              <TableCell sx={{ color: 'warning.main', fontWeight: 'bold' }}>Annuler et re-saisir</TableCell>
              <TableCell>
                1. Envoyer une annulation (ticket 1510/C001)<br />
                2. Attendre la confirmation d&apos;annulation (1530)<br />
                3. Re-saisir la portabilité avec le bon MSISDN provisoire
              </TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: 'error.lighter' }}>
              <TableCell><strong>Déjà basculée</strong><br />Trop tard</TableCell>
              <TableCell sx={{ color: 'error.main', fontWeight: 'bold' }}>Changement de numéro par le CDC</TableCell>
              <TableCell>
                1. Il est trop tard pour corriger dans le système PNM<br />
                2. Le CDC devra faire un <strong>changement de numéro</strong> pour le client<br />
                3. S&apos;assurer que le MSISDN est disponible en <strong>réaffectation</strong>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Étape 3 : Correction en BDD (cas le plus simple) ── */}
      <StepHeader number={3} icon="solar:database-bold-duotone" title="Modifier le numéro dans la base de données (cas le plus simple)" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Si la portabilité <strong>n&apos;est pas encore basculée</strong>, la solution la plus simple est de corriger
        le MSISDN provisoire directement dans la base de données :
      </Typography>

      <Box component="ol" sx={{ pl: 2, mb: 2, '& li': { fontSize: 14, mb: 1 } }}>
        <li>
          Se connecter à la base <strong>PortaDB</strong> sur <code>vmqproportawebdb01</code> (172.24.119.68)
        </li>
        <li>
          Identifier le mandat concerné par le MSISDN à porter
        </li>
        <li>
          <strong>Modifier le MSISDN provisoire</strong> par la bonne valeur
        </li>
        <li>
          Vérifier sur <strong>PortaWs</strong> que le mandat affiche désormais le bon MSISDN provisoire
        </li>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Alternative — Annulation et re-saisie :</strong> si la modification en BDD n&apos;est pas possible,
        envoyer une annulation (<code>1510</code> / <code>C001</code>), attendre la confirmation (<code>1530</code>),
        puis re-saisir avec le bon MSISDN provisoire. <strong>Attention :</strong> le délai J+7 repart à zéro.
        Informer le client du nouveau délai.
      </Alert>

      {/* ── Étape 4 : Si déjà basculée ── */}
      <StepHeader number={4} icon="solar:danger-triangle-bold-duotone" title="Si la portabilité est déjà basculée — trop tard" />

      <Alert severity="error" sx={{ mb: 2 }}>
        Si la portabilité est déjà basculée, il est <strong>trop tard</strong> pour corriger dans le système PNM.
        La bascule s&apos;est faite sur un mauvais numéro (un autre client) ou pas du tout.
      </Alert>

      <Box component="ol" sx={{ pl: 2, mb: 2, '& li': { fontSize: 14, mb: 1 } }}>
        <li>
          Le CDC devra faire un <strong>changement de numéro</strong> pour le client
        </li>
        <li>
          S&apos;assurer que le MSISDN est <strong>disponible en réaffectation</strong>
        </li>
        <li>
          Vérifier que le client est bien joignable sur son numéro porté une fois la correction effectuée
        </li>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Alert severity="success" icon={<Iconify icon="solar:check-circle-bold-duotone" width={22} />}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Points de vigilance</Typography>
        <Box component="ul" sx={{ pl: 2, mb: 0, '& li': { fontSize: 13, mb: 0.5 } }}>
          <li>Un mauvais MSISDN provisoire fait basculer sur un <strong>autre client</strong> ou <strong>pas du tout</strong></li>
          <li>La <strong>modification en base de données</strong> est la solution la plus simple si la porta n&apos;est pas encore basculée</li>
          <li>L&apos;annulation + re-saisie est une alternative mais fait repartir le délai <strong>J+7</strong></li>
          <li>Si déjà basculée : <strong>trop tard</strong> — le CDC doit faire un changement de numéro + vérifier disponibilité en réaffectation</li>
          <li>Toujours <strong>informer le client</strong> du délai supplémentaire en cas d&apos;annulation</li>
          <li>Demander au CDC de <strong>vérifier systématiquement</strong> le MSISDN provisoire avant validation</li>
        </Box>
      </Alert>
    </>
  ),
};

// ─── Liste de tous les cas pratiques ────────────────────────────────────────

const CAS_PRATIQUES: CasPratique[] = [
  casPortaWsInaccessible,
  casHubEnPanne,
  casAucunFichierRecu,
  casFnrNonTransmis,
  casMsisdnProvisoireErreur,
  casArNonRecuInvestigation,
  casFichierDejaRecu,
  casRefusR322,
  casAnnulation1510,
  casErreurE610,
  casRelancePortabilite,
  casIncohCol3,
];

// ─── Tag colors ─────────────────────────────────────────────────────────────

const TAG_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  Fichier: 'primary',
  Incohérence: 'warning',
  'Correction manuelle': 'error',
  PNMDATA: 'info',
  'col.3': 'secondary',
  Relance: 'warning',
  'Ticket 1110': 'info',
  'En attente': 'error',
  'Dauphin Télécom': 'default',
  Email: 'primary',
  'AR non reçu': 'error',
  'Logs serveur': 'secondary',
  'ACR E000': 'success',
  Archivage: 'warning',
  'SFR / Outremer': 'default',
  Refus: 'error',
  R322: 'error',
  Résiliation: 'error',
  'Free Caraïbes': 'default',
  'Numéro perdu': 'error',
  Annulation: 'warning',
  'Ticket 1510': 'info',
  C001: 'success',
  'Orange Caraïbe': 'default',
  Erreur: 'error',
  E610: 'error',
  Restitution: 'info',
  'Ticket 7000': 'error',
  E008: 'error',
  'Fichier doublon': 'warning',
  FileZilla: 'info',
  'Suppression manuelle': 'error',
  PortaWs: 'primary',
  Portail: 'info',
  Incident: 'error',
  Tomcat: 'warning',
  Infrastructure: 'secondary',
  HUB: 'primary',
  SOAP: 'info',
  SFTP: 'info',
  vmqproportasync01: 'secondary',
  Fichiers: 'primary',
  Cron: 'warning',
  FNR: 'error',
  EMA: 'warning',
  Bascule: 'info',
  Alerte: 'error',
  batchhandler: 'secondary',
  'MSISDN provisoire': 'primary',
  CDC: 'info',
  Saisie: 'default',
  Correction: 'warning',
};

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CasPratiques() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'all'>('all');
  const [openCas, setOpenCas] = useState<CasPratique | null>(null);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = CAS_PRATIQUES;
    if (selectedCategory !== 'all') {
      result = result.filter((c) => c.category === selectedCategory);
    }
    if (selectedSeverity !== 'all') {
      result = result.filter((c) => c.severity === selectedSeverity);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [search, selectedCategory, selectedSeverity]);

  const counts = useMemo(() => {
    const bySeverity: Record<Severity, number> = { critique: 0, majeur: 0, mineur: 0 };
    const byCategory: Record<Category, number> = { infrastructure: 0, fichiers: 0, tickets: 0, saisie: 0 };
    CAS_PRATIQUES.forEach((c) => {
      bySeverity[c.severity]++;
      byCategory[c.category]++;
    });
    return { bySeverity, byCategory };
  }, []);

  const handleDownloadPdf = async (casId: string) => {
    setPdfLoading(casId);
    try {
      const { generateCasPratiquePdf } = await import('./CasPratiquesPdf');
      await generateCasPratiquePdf(casId);
    } finally {
      setPdfLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <Head title="Cas Pratiques" />

      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h4">Cas Pratiques PNM</Typography>
          <Typography variant="body2" color="text.secondary">
            {CAS_PRATIQUES.length} procedures documentees issues de cas reels. Filtrez par gravite ou categorie.
          </Typography>
        </Stack>

        {/* Severity stats */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          {(Object.entries(SEVERITY_CONFIG) as [Severity, typeof SEVERITY_CONFIG.critique][]).map(
            ([sev, cfg]) => (
              <Card
                key={sev}
                onClick={() => setSelectedSeverity(selectedSeverity === sev ? 'all' : sev)}
                sx={{
                  flex: 1,
                  cursor: 'pointer',
                  border: 2,
                  borderColor: selectedSeverity === sev ? cfg.color : 'transparent',
                  bgcolor: selectedSeverity === sev ? cfg.bg : 'background.paper',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: cfg.color, bgcolor: cfg.bg },
                }}
              >
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon={cfg.icon} width={28} sx={{ color: cfg.color }} />
                    <Box>
                      <Typography variant="h5" sx={{ color: cfg.color, lineHeight: 1 }}>
                        {counts.bySeverity[sev]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cfg.label}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )
          )}
        </Stack>

        {/* Search + Category filter */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <TextField
            size="small"
            placeholder="Rechercher un cas pratique..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:magnifer-bold-duotone" width={20} sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')}>
                      <Iconify icon="solar:close-circle-bold" width={18} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />
          <ToggleButtonGroup
            size="small"
            value={selectedCategory}
            exclusive
            onChange={(_, val) => val !== null && setSelectedCategory(val)}
          >
            <ToggleButton value="all">
              <Tooltip title="Tous">
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Iconify icon="solar:widget-bold-duotone" width={18} />
                  <Typography variant="caption" sx={{ display: { xs: 'none', md: 'block' } }}>
                    Tous ({CAS_PRATIQUES.length})
                  </Typography>
                </Stack>
              </Tooltip>
            </ToggleButton>
            {(Object.entries(CATEGORY_CONFIG) as [Category, typeof CATEGORY_CONFIG.infrastructure][]).map(
              ([cat, cfg]) => (
                <ToggleButton key={cat} value={cat}>
                  <Tooltip title={cfg.label}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Iconify icon={cfg.icon} width={18} />
                      <Typography variant="caption" sx={{ display: { xs: 'none', md: 'block' } }}>
                        {cfg.label} ({counts.byCategory[cat]})
                      </Typography>
                    </Stack>
                  </Tooltip>
                </ToggleButton>
              )
            )}
          </ToggleButtonGroup>
        </Stack>

        {/* Cards grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
            gap: 2,
          }}
        >
          {filtered.map((cas) => {
            const sevCfg = SEVERITY_CONFIG[cas.severity];
            const catCfg = CATEGORY_CONFIG[cas.category];
            return (
              <Card
                key={cas.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  borderLeft: 4,
                  borderColor: sevCfg.color,
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: (theme) => theme.shadows[8] },
                }}
              >
                <CardActionArea
                  onClick={() => setOpenCas(cas)}
                  sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                    {/* Top row: severity + category + date */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip
                          label={sevCfg.label}
                          size="small"
                          icon={<Iconify icon={sevCfg.icon} width={14} />}
                          sx={{
                            bgcolor: sevCfg.bg,
                            color: sevCfg.color,
                            fontWeight: 700,
                            fontSize: 11,
                            height: 24,
                            '& .MuiChip-icon': { color: sevCfg.color },
                          }}
                        />
                        <Chip
                          label={catCfg.label}
                          size="small"
                          variant="outlined"
                          icon={<Iconify icon={catCfg.icon} width={14} />}
                          sx={{ fontSize: 11, height: 24 }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.disabled">
                        {cas.date}
                      </Typography>
                    </Stack>

                    {/* Title */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1,
                        fontWeight: 700,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.4,
                      }}
                    >
                      {cas.title}
                    </Typography>

                    {/* Summary */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1.5,
                        flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: 13,
                        lineHeight: 1.5,
                      }}
                    >
                      {cas.summary}
                    </Typography>

                    {/* Tags */}
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {cas.tags.slice(0, 4).map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          color={TAG_COLORS[tag] ?? 'default'}
                          variant="outlined"
                          sx={{ fontSize: 11, height: 22 }}
                        />
                      ))}
                      {cas.tags.length > 4 && (
                        <Chip label={`+${cas.tags.length - 4}`} size="small" sx={{ fontSize: 11, height: 22 }} />
                      )}
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>

        {/* Empty state */}
        {filtered.length === 0 && (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
            <Iconify icon="solar:magnifer-bold-duotone" width={48} sx={{ opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Aucun cas pratique trouve
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Essayez de modifier vos filtres ou votre recherche.
            </Typography>
            <Button
              variant="text"
              size="small"
              sx={{ mt: 1 }}
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setSelectedSeverity('all');
              }}
            >
              Reinitialiser les filtres
            </Button>
          </Stack>
        )}
      </Box>

      {/* Detail dialog */}
      <Dialog
        open={!!openCas}
        onClose={() => setOpenCas(null)}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}
      >
        {openCas && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Chip
                      label={SEVERITY_CONFIG[openCas.severity].label}
                      size="small"
                      icon={<Iconify icon={SEVERITY_CONFIG[openCas.severity].icon} width={14} />}
                      sx={{
                        bgcolor: SEVERITY_CONFIG[openCas.severity].bg,
                        color: SEVERITY_CONFIG[openCas.severity].color,
                        fontWeight: 700,
                        fontSize: 11,
                        '& .MuiChip-icon': { color: SEVERITY_CONFIG[openCas.severity].color },
                      }}
                    />
                    <Chip
                      label={CATEGORY_CONFIG[openCas.category].label}
                      size="small"
                      variant="outlined"
                      icon={<Iconify icon={CATEGORY_CONFIG[openCas.category].icon} width={14} />}
                      sx={{ fontSize: 11 }}
                    />
                    <Typography variant="caption" color="text.disabled">
                      {openCas.date}
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ lineHeight: 1.3 }}>
                    {openCas.title}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                  <Tooltip title="Telecharger PDF">
                    <IconButton
                      size="small"
                      onClick={() => handleDownloadPdf(openCas.id)}
                      disabled={pdfLoading === openCas.id}
                    >
                      <Iconify icon="solar:file-download-bold-duotone" width={22} />
                    </IconButton>
                  </Tooltip>
                  <IconButton size="small" onClick={() => setOpenCas(null)}>
                    <Iconify icon="solar:close-circle-bold" width={22} />
                  </IconButton>
                </Stack>
              </Stack>
              <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
                {openCas.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    color={TAG_COLORS[tag] ?? 'default'}
                    variant="outlined"
                    sx={{ fontSize: 11 }}
                  />
                ))}
              </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 2 }}>{openCas.content}</DialogContent>
          </>
        )}
      </Dialog>
    </DashboardLayout>
  );
}
