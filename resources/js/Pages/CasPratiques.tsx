import { useCallback, useState } from 'react';
import { Head } from '@inertiajs/react';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { DashboardLayout } from 'src/layouts/dashboard/layout';

// ─── Types ──────────────────────────────────────────────────────────────────

type CasPratique = {
  id: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  content: React.ReactNode;
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
              <TableCell>Escalader au <strong>GPMAG</strong> (secretariat@gpmag.fr) avec historique des relances</TableCell>
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

// ─── Liste de tous les cas pratiques ────────────────────────────────────────

const CAS_PRATIQUES: CasPratique[] = [casRelancePortabilite, casIncohCol3];

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
};

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CasPratiques() {
  const [expanded, setExpanded] = useState<string | false>(CAS_PRATIQUES[0]?.id ?? false);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);

  const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

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

      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 960, mx: 'auto' }}>
        {/* Header */}
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography variant="h4">Cas Pratiques PNM</Typography>
          <Typography variant="body2" color="text.secondary">
            Procédures documentées issues de cas réels rencontrés en exploitation. Chaque cas détaille le
            contexte, les étapes de résolution et les points de vigilance.
          </Typography>
        </Stack>

        {/* Accordion list */}
        <Stack spacing={2}>
          {CAS_PRATIQUES.map((cas) => (
            <Accordion
              key={cas.id}
              expanded={expanded === cas.id}
              onChange={handleChange(cas.id)}
              sx={{
                borderRadius: '12px !important',
                '&:before': { display: 'none' },
                boxShadow: (theme) => theme.shadows[expanded === cas.id ? 4 : 1],
              }}
            >
              <AccordionSummary
                expandIcon={<Iconify icon="solar:alt-arrow-down-bold-duotone" width={20} />}
                sx={{ px: 3, py: 1 }}
              >
                <Stack spacing={1} sx={{ flex: 1, mr: 2 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1" fontWeight="bold">
                      {cas.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {cas.date}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {cas.summary}
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.75}>
                    {cas.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        color={TAG_COLORS[tag] ?? 'default'}
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Divider sx={{ flex: 1 }} />
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<Iconify icon="solar:file-download-bold-duotone" width={18} />}
                    onClick={() => handleDownloadPdf(cas.id)}
                    disabled={pdfLoading === cas.id}
                    sx={{ ml: 2, flexShrink: 0 }}
                  >
                    {pdfLoading === cas.id ? 'Génération...' : 'Télécharger PDF'}
                  </Button>
                </Stack>
                {cas.content}
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>

        {CAS_PRATIQUES.length === 0 && (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
            <Iconify icon="solar:case-round-bold-duotone" width={48} sx={{ opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Aucun cas pratique pour le moment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Les cas documentés apparaîtront ici.
            </Typography>
          </Stack>
        )}
      </Box>
    </DashboardLayout>
  );
}
