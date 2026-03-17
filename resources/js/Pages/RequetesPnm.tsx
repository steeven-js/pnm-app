import { useState, useCallback } from 'react';
import { Head } from '@inertiajs/react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { DashboardLayout } from 'src/layouts/dashboard/layout';

// ─── Types ──────────────────────────────────────────────────────────────────

type SqlQuery = {
  title: string;
  description: string;
  sql: string;
  icon: string;
  color: string;
};

type QueryCategory = {
  title: string;
  shortTitle: string;
  icon: string;
  queries: SqlQuery[];
};

type Domain = 'pnm' | 'crm';

type DocSection = {
  id: string;
  title: string;
  icon: string;
  content: React.ReactNode;
};

// ─── PNM Data ────────────────────────────────────────────────────────────────

const QUERY_CATEGORIES: QueryCategory[] = [
  {
    title: 'Identification & recherche',
    shortTitle: 'Identification',
    icon: 'solar:magnifer-bold-duotone',
    queries: [
      {
        title: 'Chez quel operateur est un MSISDN ?',
        description: 'Identifie l\'operateur actuel d\'un numero.',
        icon: 'solar:phone-calling-bold-duotone',
        color: 'primary',
        sql: `SELECT m.msisdn, o.nom AS operateur, o.code AS code_operateur
FROM MSISDN m
JOIN OPERATEUR o ON o.code = m.operateur_id_actuel
WHERE m.msisdn = '0691XXXXXX';`,
      },
      {
        title: 'Retrouver un MSISDN a partir d\'un ID de portage',
        description: 'Recherche inverse : ID portage → MSISDN + etat.',
        icon: 'solar:transfer-horizontal-bold-duotone',
        color: 'info',
        sql: `SELECT p.id, p.portage_msisdn AS msisdn, e.etat_name AS etat,
  p.portage_date_creation
FROM PORTAGE p
JOIN ETAT e ON e.id = p.portage_etat
WHERE p.id = 12345;`,
      },
      {
        title: 'A quelle tranche appartient un numero ?',
        description: 'Retrouve l\'operateur d\'attribution d\'origine via les tranches MSISDN.',
        icon: 'solar:hashtag-bold-duotone',
        color: 'secondary',
        sql: `SELECT t.id, t.debut, t.fin, o.nom AS operateur, t.is_active
FROM TRANCHE t
JOIN OPERATEUR o ON o.code = t.operateur_id
WHERE '0691XXXXXX' BETWEEN t.debut AND t.fin
ORDER BY t.debut;`,
      },
      {
        title: 'Historique complet d\'un MSISDN',
        description: 'Tous les changements d\'operateur d\'un numero.',
        icon: 'solar:history-bold-duotone',
        color: 'info',
        sql: `SELECT mh.id, mh.msisdn, mh.date
FROM MSISDN_HISTORIQUE mh
WHERE mh.msisdn = '0691XXXXXX'
ORDER BY mh.date ASC;`,
      },
      {
        title: 'Liste des operateurs actifs',
        description: 'Tous les operateurs enregistres dans le systeme PNM.',
        icon: 'solar:buildings-bold-duotone',
        color: 'primary',
        sql: `SELECT code, nom, is_active, is_actor, contact, email
FROM OPERATEUR
WHERE is_active = true
ORDER BY nom;`,
      },
    ],
  },
  {
    title: 'Suivi des portages',
    shortTitle: 'Portages',
    icon: 'solar:transfer-horizontal-bold-duotone',
    queries: [
      {
        title: 'Date de souscription d\'un portage',
        description: 'Retrouve la date de creation du dossier et la date souhaitee.',
        icon: 'solar:calendar-bold-duotone',
        color: 'success',
        sql: `SELECT d.id AS id_dossier, p.portage_msisdn AS msisdn, p.id AS id_portage,
  d.portage_date_creation, d.portage_date_souhaitee, e.etat_name AS etat
FROM DOSSIER d
JOIN PORTAGE p ON p.dossier_id = d.id
JOIN ETAT e ON e.id = d.portage_etat
WHERE p.portage_msisdn = '0691XXXXXX'
ORDER BY d.portage_date_creation DESC;`,
      },
      {
        title: 'Historique des etats d\'un portage',
        description: 'Trace de tous les changements d\'etat (chronologique).',
        icon: 'solar:history-bold-duotone',
        color: 'info',
        sql: `SELECT ph.id, p.portage_msisdn AS msisdn, ph.etat, ph.date, ph.commentaire
FROM PORTAGE_HISTORIQUE ph
JOIN PORTAGE p ON p.id = ph.id_portage
WHERE p.portage_msisdn = '0691XXXXXX'
ORDER BY ph.date ASC;`,
      },
      {
        title: 'Bascules prevues a une date donnee',
        description: 'Liste des portages dont la bascule est programmee a une date.',
        icon: 'solar:restart-bold-duotone',
        color: 'primary',
        sql: `SELECT p.id, p.portage_msisdn AS msisdn, e.etat_name AS etat,
  p.portage_date_souhaitee, p.portage_type_demande,
  o_d.nom AS operateur_donneur, o_r.nom AS operateur_receveur
FROM PORTAGE p
JOIN ETAT e ON e.id = p.portage_etat
JOIN DOSSIER d ON d.id = p.dossier_id
JOIN OPERATEUR o_d ON o_d.code = d.operateur_id_donneur
JOIN OPERATEUR o_r ON o_r.code = d.operateur_id_receveur
WHERE CAST(p.portage_date_souhaitee AS DATE) = '2026-03-04'  -- ou CURRENT_DATE
ORDER BY p.portage_date_souhaitee ASC;`,
      },
      {
        title: 'Dossier complet d\'un portage',
        description: 'Toutes les infos du dossier : MSISDN, RIO, nom, prenom, operateurs.',
        icon: 'solar:folder-open-bold-duotone',
        color: 'warning',
        sql: `SELECT d.id AS id_dossier, d.portage_msisdn, d.portage_rio,
  d.portage_nom, d.portage_prenom, d.portage_type_demande,
  d.portage_date_souhaitee, e.etat_name AS etat,
  o_d.nom AS operateur_donneur, o_r.nom AS operateur_receveur, d.remarque
FROM DOSSIER d
JOIN ETAT e ON e.id = d.portage_etat
JOIN OPERATEUR o_d ON o_d.code = d.operateur_id_donneur
JOIN OPERATEUR o_r ON o_r.code = d.operateur_id_receveur
WHERE d.portage_msisdn = '0691XXXXXX'
ORDER BY d.portage_date_creation DESC;`,
      },
    ],
  },
  {
    title: 'Tickets & fichiers',
    shortTitle: 'Tickets',
    icon: 'solar:ticket-bold-duotone',
    queries: [
      {
        title: 'Date de reception d\'un ticket pour un MSISDN',
        description: 'Recherche de tickets (1110, 1210, 1430, 3430...) recus pour un numero.',
        icon: 'solar:ticket-bold-duotone',
        color: 'warning',
        sql: `-- Remplacer le code_ticket par : 1110, 1210, 1430, 3430, etc.
SELECT pd.id, p.portage_msisdn AS msisdn, pd.code_ticket,
  ct.description AS ticket_desc, pd.date, pd.date_traitement
FROM DATA pd
JOIN PORTAGE p ON p.id = pd.id_portage
JOIN CODE_TICKET ct ON ct.code = pd.code_ticket
WHERE p.portage_msisdn = '0691XXXXXX'
  AND pd.code_ticket = 1110
ORDER BY pd.date DESC;`,
      },
      {
        title: 'Tous les tickets d\'un portage',
        description: 'Liste complete des evenements/tickets pour un portage donne.',
        icon: 'solar:list-bold-duotone',
        color: 'info',
        sql: `SELECT pd.id, pd.code_ticket, ct.description AS ticket_desc,
  pd.code_reponse, cr.description AS reponse_desc,
  pd.date, pd.date_traitement, pd.etat, pd.commentaire
FROM DATA pd
JOIN CODE_TICKET ct ON ct.code = pd.code_ticket
LEFT JOIN CODE_REPONSE cr ON cr.code = pd.code_reponse
WHERE pd.id_portage = 12345
ORDER BY pd.date ASC;`,
      },
      {
        title: 'Fichiers PNMDATA recus/envoyes pour un operateur',
        description: 'Liste les fichiers echanges avec un operateur sur une periode.',
        icon: 'solar:file-send-bold-duotone',
        color: 'secondary',
        sql: `SELECT f.id, f.nom, f.type, f.date_creation, f.date_import,
  f.taille, o_exp.nom AS expediteur, o_dest.nom AS destinataire
FROM FICHIER f
JOIN OPERATEUR o_exp ON o_exp.code = f.expediteur
JOIN OPERATEUR o_dest ON o_dest.code = f.destinataire
WHERE (f.expediteur = 1 OR f.destinataire = 1)  -- code operateur
  AND f.date_creation >= '2026-03-01'
ORDER BY f.date_creation DESC;`,
      },
      {
        title: 'Fichiers de synchronisation PNMSYNC a une date',
        description: 'Fichiers SYNC transmis par un operateur a une date donnee.',
        icon: 'solar:refresh-bold-duotone',
        color: 'primary',
        sql: `SELECT s.id, s.msisdn, s.date, s.date_portage,
  o.nom AS operateur, ss.statut_name AS statut_sync
FROM SYNC s
JOIN OPERATEUR o ON o.code = s.operateur_id
LEFT JOIN SYNC_STATUS ss ON ss.id = s.sync_status
WHERE s.operateur_id = 1  -- code operateur
  AND CAST(s.date AS DATE) = '2026-03-04'
ORDER BY s.date DESC;`,
      },
      {
        title: 'Acquittements (ACK) recus pour un fichier',
        description: 'Verifie si un fichier a bien ete acquitte.',
        icon: 'solar:check-read-bold-duotone',
        color: 'success',
        sql: `SELECT a.id, a.file_name, a.type, a.date, a.content
FROM ACK a
WHERE a.file_name LIKE '%PNMDATA%'  -- ou nom exact du fichier
ORDER BY a.date DESC;`,
      },
    ],
  },
  {
    title: 'Anomalies & problemes courants',
    shortTitle: 'Anomalies',
    icon: 'solar:danger-triangle-bold-duotone',
    queries: [
      {
        title: 'Portages bloques depuis plus de N jours',
        description: 'Detecte les portages en cours qui n\'avancent plus.',
        icon: 'solar:alarm-bold-duotone',
        color: 'error',
        sql: `SELECT p.id, p.portage_msisdn AS msisdn, e.etat_name AS etat,
  p.portage_date_creation, p.portage_date_souhaitee,
  CURRENT_DATE - CAST(p.portage_date_creation AS DATE) AS jours_en_cours
FROM PORTAGE p
JOIN ETAT e ON e.id = p.portage_etat
WHERE CURRENT_DATE - CAST(p.portage_date_creation AS DATE) > 5  -- modifier le seuil
  AND e.etat_name NOT IN ('Termine', 'Annule', 'Refuse')
ORDER BY p.portage_date_creation ASC;`,
      },
      {
        title: 'Portages refuses — motifs de refus',
        description: 'Liste les refus recents avec le code et la description du motif.',
        icon: 'solar:close-circle-bold-duotone',
        color: 'error',
        sql: `SELECT p.id, p.portage_msisdn AS msisdn, pd.code_ticket,
  cr.code AS code_refus, cr.description AS motif_refus, pd.date
FROM DATA pd
JOIN PORTAGE p ON p.id = pd.id_portage
JOIN CODE_REPONSE cr ON cr.code = pd.code_reponse
WHERE pd.code_reponse IS NOT NULL
  AND pd.date >= CURRENT_DATE - INTERVAL '7 days'  -- modifier la periode
ORDER BY pd.date DESC;`,
      },
      {
        title: 'Refus pour RIO incorrect',
        description: 'Cas specifique : refus lies a un probleme de RIO.',
        icon: 'solar:shield-warning-bold-duotone',
        color: 'warning',
        sql: `SELECT p.id, p.portage_msisdn AS msisdn, p.portage_rio,
  cr.description AS motif, pd.date, pd.commentaire
FROM DATA pd
JOIN PORTAGE p ON p.id = pd.id_portage
JOIN CODE_REPONSE cr ON cr.code = pd.code_reponse
WHERE cr.description ILIKE '%rio%incorrect%'
  OR cr.description ILIKE '%rio%invalide%'
ORDER BY pd.date DESC;`,
      },
      {
        title: 'Fichiers sans acquittement (ACK manquant)',
        description: 'Fichiers envoyes dont on n\'a pas recu d\'acquittement.',
        icon: 'solar:danger-triangle-bold-duotone',
        color: 'warning',
        sql: `SELECT f.id, f.nom AS nom_fichier, f.type, f.date_creation,
  o_exp.nom AS expediteur, o_dest.nom AS destinataire
FROM FICHIER f
LEFT JOIN ACK a ON a.file_name = f.nom
JOIN OPERATEUR o_exp ON o_exp.code = f.expediteur
JOIN OPERATEUR o_dest ON o_dest.code = f.destinataire
WHERE a.id IS NULL
  AND f.date_creation >= CURRENT_DATE - INTERVAL '3 days'
ORDER BY f.date_creation DESC;`,
      },
      {
        title: 'Portages programmes un jour ferie',
        description: 'Detecte les bascules planifiees sur un jour ferie.',
        icon: 'solar:calendar-minimalistic-bold-duotone',
        color: 'warning',
        sql: `SELECT p.id, p.portage_msisdn AS msisdn, p.portage_date_souhaitee,
  ff.ferryday AS jour_ferie, e.etat_name AS etat
FROM PORTAGE p
JOIN FERRYDAY ff ON CAST(p.portage_date_souhaitee AS DATE) = ff.ferryday
JOIN ETAT e ON e.id = p.portage_etat
WHERE p.portage_date_souhaitee >= CURRENT_DATE
ORDER BY p.portage_date_souhaitee ASC;`,
      },
      {
        title: 'Conflits de synchronisation SYNC',
        description: 'Enregistrements SYNC en erreur ou avec un statut anormal.',
        icon: 'solar:shield-warning-bold-duotone',
        color: 'error',
        sql: `SELECT s.msisdn, o.nom AS operateur, s.sync_status,
  ss.statut_name, s.date, s.date_portage
FROM SYNC s
JOIN OPERATEUR o ON o.code = s.operateur_id
LEFT JOIN SYNC_STATUS ss ON ss.id = s.sync_status
WHERE s.date >= CURRENT_DATE - INTERVAL '7 days'
  AND s.sync_status IS NOT NULL
  AND s.sync_status != 0
ORDER BY s.date DESC;`,
      },
      {
        title: 'MSISDN avec plusieurs portages actifs (doublon)',
        description: 'Detecte les numeros ayant plus d\'un portage non termine (anomalie).',
        icon: 'solar:copy-bold-duotone',
        color: 'error',
        sql: `SELECT p.portage_msisdn AS msisdn, COUNT(*) AS nb_portages_actifs
FROM PORTAGE p
JOIN ETAT e ON e.id = p.portage_etat
WHERE e.etat_name NOT IN ('Termine', 'Annule', 'Refuse')
GROUP BY p.portage_msisdn
HAVING COUNT(*) > 1
ORDER BY nb_portages_actifs DESC;`,
      },
      {
        title: 'Portages termines sans historique',
        description: 'Portages marques comme termines mais sans trace dans l\'historique.',
        icon: 'solar:ghost-bold-duotone',
        color: 'secondary',
        sql: `SELECT p.id, p.portage_msisdn AS msisdn, e.etat_name AS etat,
  p.portage_date_creation
FROM PORTAGE p
JOIN ETAT e ON e.id = p.portage_etat
LEFT JOIN PORTAGE_HISTORIQUE ph ON ph.id_portage = p.id
WHERE e.etat_name = 'Termine'
  AND ph.id IS NULL
ORDER BY p.portage_date_creation DESC;`,
      },
    ],
  },
  {
    title: 'Statistiques & reporting',
    shortTitle: 'Stats',
    icon: 'solar:chart-2-bold-duotone',
    queries: [
      {
        title: 'Volume de portages par operateur sur une periode',
        description: 'Compteur de portages (total, termines, refuses, annules) par operateur donneur.',
        icon: 'solar:chart-2-bold-duotone',
        color: 'success',
        sql: `SELECT o.nom AS operateur_donneur, COUNT(*) AS nb_portages,
  SUM(CASE WHEN e.etat_name = 'Termine' THEN 1 ELSE 0 END) AS termines,
  SUM(CASE WHEN e.etat_name = 'Refuse' THEN 1 ELSE 0 END) AS refuses,
  SUM(CASE WHEN e.etat_name = 'Annule' THEN 1 ELSE 0 END) AS annules
FROM DOSSIER d
JOIN PORTAGE p ON p.dossier_id = d.id
JOIN ETAT e ON e.id = p.portage_etat
JOIN OPERATEUR o ON o.code = d.operateur_id_donneur
WHERE d.portage_date_creation BETWEEN '2026-03-01' AND '2026-03-31'
GROUP BY o.nom
ORDER BY nb_portages DESC;`,
      },
      {
        title: 'Tickets recus par jour et par type',
        description: 'Volume quotidien de tickets ventile par code ticket.',
        icon: 'solar:graph-new-bold-duotone',
        color: 'info',
        sql: `SELECT CAST(pd.date AS DATE) AS jour, pd.code_ticket,
  ct.description AS ticket_desc, COUNT(*) AS nb_tickets
FROM DATA pd
JOIN CODE_TICKET ct ON ct.code = pd.code_ticket
WHERE pd.date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY CAST(pd.date AS DATE), pd.code_ticket, ct.description
ORDER BY jour DESC, pd.code_ticket;`,
      },
      {
        title: 'Volume de fichiers echanges par jour',
        description: 'Nombre de fichiers recus/envoyes par jour et par type.',
        icon: 'solar:chart-bold-duotone',
        color: 'warning',
        sql: `SELECT CAST(f.date_creation AS DATE) AS jour, f.type,
  COUNT(*) AS nb_fichiers, SUM(f.taille) AS taille_totale
FROM FICHIER f
WHERE f.date_creation >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY CAST(f.date_creation AS DATE), f.type
ORDER BY jour DESC, f.type;`,
      },
      {
        title: 'Top motifs de refus',
        description: 'Classement des motifs de refus les plus frequents.',
        icon: 'solar:sort-from-top-to-bottom-bold-duotone',
        color: 'error',
        sql: `SELECT cr.code, cr.description AS motif, COUNT(*) AS nb_refus
FROM DATA pd
JOIN CODE_REPONSE cr ON cr.code = pd.code_reponse
WHERE pd.code_reponse IS NOT NULL
  AND pd.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY cr.code, cr.description
ORDER BY nb_refus DESC;`,
      },
      {
        title: 'Jours feries a venir',
        description: 'Liste des jours feries actifs a venir (impact planning bascules).',
        icon: 'solar:calendar-bold-duotone',
        color: 'primary',
        sql: `SELECT ferryday, is_active
FROM FERRYDAY
WHERE ferryday >= CURRENT_DATE
  AND is_active = true
ORDER BY ferryday ASC;`,
      },
      {
        title: 'Transitions d\'etats possibles',
        description: 'Reference des transitions d\'etat autorisees dans le systeme PNM.',
        icon: 'solar:routing-bold-duotone',
        color: 'secondary',
        sql: `SELECT t.code, t.etat_initial, t.etat_final, t.description
FROM TRANSITION t
ORDER BY t.code;`,
      },
    ],
  },
];

// ─── Shared helpers ─────────────────────────────────────────────────────────

function highlightSql(sql: string): React.ReactNode[] {
  const keywords = /\b(SELECT|FROM|WHERE|IN|AND|OR|SET|UPDATE|COMMIT|INSERT|DELETE|INTO|VALUES|JOIN|LEFT|RIGHT|INNER|ON|AS|IS|NOT|NULL|ORDER|BY|GROUP|HAVING|LIKE|BETWEEN|EXISTS|DISTINCT|COUNT|SUM|AVG|MAX|MIN|CREATE|ALTER|DROP|TABLE|INDEX|VIEW|GRANT|REVOKE)\b/gi;
  const stringLiteral = /'[^']*'/g;
  const commentLine = /--[^\n]*/g;

  const parts: { start: number; end: number; type: 'keyword' | 'string' | 'comment'; text: string }[] = [];

  let match: RegExpExecArray | null;

  // eslint-disable-next-line no-cond-assign
  while ((match = commentLine.exec(sql)) !== null) {
    parts.push({ start: match.index, end: match.index + match[0].length, type: 'comment', text: match[0] });
  }
  // eslint-disable-next-line no-cond-assign
  while ((match = stringLiteral.exec(sql)) !== null) {
    if (!parts.some((p) => match!.index >= p.start && match!.index < p.end)) {
      parts.push({ start: match.index, end: match.index + match[0].length, type: 'string', text: match[0] });
    }
  }
  // eslint-disable-next-line no-cond-assign
  while ((match = keywords.exec(sql)) !== null) {
    if (!parts.some((p) => match!.index >= p.start && match!.index < p.end)) {
      parts.push({ start: match.index, end: match.index + match[0].length, type: 'keyword', text: match[0] });
    }
  }

  parts.sort((a, b) => a.start - b.start);

  const result: React.ReactNode[] = [];
  let cursor = 0;

  parts.forEach((part, i) => {
    if (part.start > cursor) {
      result.push(sql.slice(cursor, part.start));
    }
    const color = part.type === 'keyword' ? '#93c5fd' : part.type === 'string' ? '#86efac' : '#94a3b8';
    result.push(
      <span key={i} style={{ color }}>
        {part.text}
      </span>
    );
    cursor = part.end;
  });

  if (cursor < sql.length) {
    result.push(sql.slice(cursor));
  }

  return result;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 3 }}>
      {children}
    </Typography>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
      {children}
    </Typography>
  );
}

function CodeBlock({ title, children }: { title?: string; children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Box sx={{ my: 2 }}>
      {title && (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>
          {title}
        </Typography>
      )}
      <Box sx={{ position: 'relative' }}>
        <Box
          component="pre"
          sx={{
            p: 2,
            pr: 5,
            borderRadius: 1.5,
            bgcolor: '#1e293b',
            color: '#e2e8f0',
            fontSize: 12,
            fontFamily: 'monospace',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {highlightSql(children)}
        </Box>
        <Tooltip title={copied ? 'Copie !' : 'Copier'}>
          <IconButton
            onClick={handleCopy}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: copied ? '#86efac' : '#94a3b8',
              '&:hover': { color: '#e2e8f0' },
            }}
          >
            <Iconify icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold'} width={18} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

function InfoCard({ title, icon, color, children }: { title: string; icon: string; color: string; children: React.ReactNode }) {
  return (
    <Card variant="outlined" sx={{ mb: 2, borderLeft: 4, borderLeftColor: color }}>
      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Iconify icon={icon} width={20} sx={{ color }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{title}</Typography>
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

// ─── PNM SQL Block ──────────────────────────────────────────────────────────

function SqlBlock({ query }: { query: SqlQuery }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(query.sql).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [query.sql]);

  return (
    <Card variant="outlined">
      <CardContent sx={{ pb: '16px !important' }}>
        {/* Header */}
        <Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ mb: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${query.color}.lighter`,
              color: `${query.color}.main`,
              flexShrink: 0,
              mt: 0.25,
            }}
          >
            <Iconify icon={query.icon} width={20} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2">{query.title}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {query.description}
            </Typography>
          </Box>
          <Tooltip title={copied ? 'Copie !' : 'Copier la requete'}>
            <IconButton onClick={handleCopy} size="small">
              <Iconify
                icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold'}
                width={20}
                sx={{ color: copied ? 'success.main' : 'text.secondary' }}
              />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* SQL code */}
        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: 'grey.900',
            color: 'grey.300',
            fontFamily: 'monospace',
            fontSize: 13,
            lineHeight: 1.6,
            whiteSpace: 'pre',
            overflowX: 'auto',
          }}
        >
          {query.sql}
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── CRM Sections (from MobiSqlQueries) ─────────────────────────────────────

function TableMsisdnSection() {
  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        La table <strong>MSISDN</strong> est la table centrale de MasterCRM pour la gestion des numeros.
        Elle permet de verifier le statut d{"'"}un numero et de le rendre reaffectable apres une portabilite sortante.
      </Alert>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Chip label="Serveur : vmqprombdb01" color="primary" size="small" variant="soft" />
        <Chip label="BDD : MasterCRM" color="warning" size="small" variant="soft" />
        <Chip label="Type : Oracle / SQL" size="small" variant="soft" />
      </Stack>

      <SectionTitle>Structure de la table</SectionTitle>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Colonne</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Valeurs remarquables</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>operation_id</TableCell>
              <TableCell>Identifiant de l{"'"}operation associee</TableCell>
              <TableCell>—</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>msisdn_no</TableCell>
              <TableCell>Numero de telephone (format 0690XXXXXX)</TableCell>
              <TableCell>—</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>ST_MSISDN_ID</TableCell>
              <TableCell>Identifiant de statut du MSISDN</TableCell>
              <TableCell><Chip label="0 = libre" size="small" variant="soft" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>MSISDN_STATUS</TableCell>
              <TableCell>Statut courant du MSISDN</TableCell>
              <TableCell><Chip label="7 = reaffectable" size="small" color="success" variant="soft" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>MS_CLASS</TableCell>
              <TableCell>Classe du MSISDN</TableCell>
              <TableCell><Chip label="0 = classe normale Digicel" size="small" color="primary" variant="soft" /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <SectionTitle>Requetes courantes</SectionTitle>

      <SubTitle>Verifier le statut d{"'"}un MSISDN</SubTitle>

      <CodeBlock title="Verification statut MSISDN">
{`-- Verifier le statut d'un ou plusieurs MSISDN dans MasterCRM
SELECT operation_id, msisdn_no, ST_MSISDN_ID, MSISDN_STATUS, MS_CLASS
FROM MSISDN
WHERE MSISDN_no IN ('0690XXXXXX');`}
      </CodeBlock>

      <SubTitle>Rendre un MSISDN reaffectable</SubTitle>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <strong>ATTENTION</strong> : L{"'"}UPDATE doit imperativement inclure la condition <code>MS_CLASS = {"'"}0{"'"}</code> pour
        ne modifier que les numeros de classe normale Digicel. Ne jamais executer sans cette verification.
      </Alert>

      <CodeBlock title="MAJ statut reaffectable">
{`-- Rendre le MSISDN reaffectable (apres validation)
UPDATE MSISDN
SET ST_MSISDN_ID = '0', MSISDN_STATUS = '7'
WHERE MSISDN_no IN ('0690XXXXXX')
AND MS_CLASS = '0';
COMMIT;`}
      </CodeBlock>

      <InfoCard title="Quand utiliser cette requete ?" icon="solar:question-circle-bold-duotone" color="#2563eb">
        <Typography variant="body2">
          Apres une <strong>portabilite sortante</strong>, si le MSISDN n{"'"}a pas ete automatiquement passe en statut
          reaffectable par le systeme (incident CRM, bascule partielle), il faut le faire manuellement via cette requete.
          Toujours verifier le statut actuel avant de modifier.
        </Typography>
      </InfoCard>
    </>
  );
}

function DiagPortaEntranteSection() {
  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        Requetes de diagnostic pour verifier qu{"'"}une <strong>portabilite entrante</strong> a ete correctement traitee
        dans MasterCRM. A executer apres la bascule pour valider le changement de MSISDN.
      </Alert>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Chip label="Serveur : vmqprombdb01" color="primary" size="small" variant="soft" />
        <Chip label="Contexte : Porta entrante" color="success" size="small" variant="soft" />
      </Stack>

      <SectionTitle>Verifier le changement de MSISDN</SectionTitle>

      <InfoCard title="Apres bascule porta entrante" icon="solar:transfer-horizontal-bold-duotone" color="#16a34a">
        <Typography variant="body2">
          Lors d{"'"}une porta entrante, le MSISDN provisoire (attribue a l{"'"}activation) doit etre remplace par le numero
          porte du client. La requete ci-dessous permet de verifier que le changement a bien eu lieu.
        </Typography>
      </InfoCard>

      <CodeBlock title="Verifier que la ligne est active sous le nouveau numero">
{`-- Verifier que le MSISDN porte est bien actif dans le CRM
SELECT operation_id, msisdn_no, ST_MSISDN_ID, MSISDN_STATUS, MS_CLASS
FROM MSISDN
WHERE MSISDN_no IN ('0690XXXXXX');

-- Le MSISDN porte doit apparaitre avec un statut actif
-- Si le MSISDN provisoire apparait encore → la bascule CRM n'a pas eu lieu`}
      </CodeBlock>

      <SectionTitle>Verifier la facturation</SectionTitle>

      <SubTitle>Controle de l{"'"}offre associee</SubTitle>

      <CodeBlock title="Verifier l'offre sur la ligne portee">
{`-- Verifier que l'offre est correctement associee au MSISDN porte
SELECT operation_id, msisdn_no, ST_MSISDN_ID, MSISDN_STATUS, MS_CLASS
FROM MSISDN
WHERE MSISDN_no IN ('0690XXXXXX')
AND MS_CLASS = '0';

-- MS_CLASS = '0' confirme que le numero est en classe normale Digicel
-- Si absent → verifier si le changement MSISDN a ete effectue`}
      </CodeBlock>

      <Alert severity="warning" sx={{ mb: 2, mt: 2 }}>
        <strong>Point de vigilance</strong> : Si le MSISDN provisoire est toujours present et actif dans le CRM apres la bascule,
        cela signifie que l{"'"}appel <code>ExecuteChangeMSISDNPe</code> via WSMobiMaster a echoue. Escalader a l{"'"}equipe MOBI.
      </Alert>

      <InfoCard title="Checklist diagnostic porta entrante" icon="solar:checklist-bold-duotone" color="#7c3aed">
        <Typography variant="body2" component="div">
          <Box component="ol" sx={{ pl: 2, '& li': { mb: 0.5 } }}>
            <li>Verifier que le MSISDN porte existe dans la table MSISDN</li>
            <li>Verifier que le statut est actif (pas reaffectable)</li>
            <li>Verifier que l{"'"}offre est correcte (MS_CLASS = {"'"}0{"'"})</li>
            <li>Verifier que le MSISDN provisoire a ete libere</li>
          </Box>
        </Typography>
      </InfoCard>
    </>
  );
}

function DiagPortaSortanteSection() {
  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        Requetes de diagnostic pour verifier qu{"'"}une <strong>portabilite sortante</strong> a ete correctement traitee
        dans MasterCRM. A executer apres la bascule pour confirmer la resiliation.
      </Alert>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Chip label="Serveur : vmqprombdb01" color="primary" size="small" variant="soft" />
        <Chip label="Contexte : Porta sortante" color="error" size="small" variant="soft" />
      </Stack>

      <SectionTitle>Verifier la resiliation de la ligne</SectionTitle>

      <InfoCard title="Apres bascule porta sortante" icon="solar:close-circle-bold-duotone" color="#dc2626">
        <Typography variant="body2">
          Lors d{"'"}une porta sortante, la ligne du client qui quitte Digicel doit etre resiliee dans MasterCRM.
          L{"'"}operation <code>ExecuteResiliationPs</code> est appelee par DAPI via WSMobiMaster.
        </Typography>
      </InfoCard>

      <CodeBlock title="Verifier que la ligne est resiliee">
{`-- Verifier le statut du MSISDN apres porta sortante
SELECT operation_id, msisdn_no, ST_MSISDN_ID, MSISDN_STATUS, MS_CLASS
FROM MSISDN
WHERE MSISDN_no IN ('0690XXXXXX');

-- Apres resiliation :
-- La ligne ne doit plus etre en statut actif
-- MSISDN_STATUS devrait indiquer une resiliation`}
      </CodeBlock>

      <SectionTitle>Verifier l{"'"}arret de la facturation</SectionTitle>

      <CodeBlock title="Controle facturation arretee">
{`-- Verifier que la facturation est bien arretee pour le MSISDN sorti
SELECT operation_id, msisdn_no, ST_MSISDN_ID, MSISDN_STATUS, MS_CLASS
FROM MSISDN
WHERE MSISDN_no IN ('0690XXXXXX');

-- Si MSISDN_STATUS est toujours actif → la resiliation CRM n'a pas eu lieu
-- Escalader a l'equipe MOBI pour relancer ExecuteResiliationPs`}
      </CodeBlock>

      <SectionTitle>Statut reaffectable</SectionTitle>

      <SubTitle>Verifier si le MSISDN est reaffectable</SubTitle>

      <CodeBlock title="Controle reaffectation">
{`-- Verifier si le MSISDN sorti est reaffectable
SELECT operation_id, msisdn_no, ST_MSISDN_ID, MSISDN_STATUS, MS_CLASS
FROM MSISDN
WHERE MSISDN_no IN ('0690XXXXXX');

-- MSISDN_STATUS = '7' → reaffectable (ok)
-- MSISDN_STATUS != '7' → pas encore reaffectable, MAJ manuelle si necessaire`}
      </CodeBlock>

      <Alert severity="error" sx={{ mb: 2 }}>
        <strong>ATTENTION</strong> : Ne rendre un MSISDN reaffectable qu{"'"}apres avoir confirme que la resiliation
        est effective et que la facturation est arretee. Un MSISDN reaffecte alors que la facturation court toujours
        entrainera des anomalies de facturation.
      </Alert>

      <InfoCard title="Checklist diagnostic porta sortante" icon="solar:checklist-bold-duotone" color="#d97706">
        <Typography variant="body2" component="div">
          <Box component="ol" sx={{ pl: 2, '& li': { mb: 0.5 } }}>
            <li>Verifier que la ligne est resiliee dans le CRM</li>
            <li>Verifier que la facturation est arretee</li>
            <li>Verifier le statut MSISDN (reaffectable ou non)</li>
            <li>Si besoin, rendre reaffectable manuellement (voir onglet Table MSISDN)</li>
          </Box>
        </Typography>
      </InfoCard>
    </>
  );
}

function ComparaisonPortaCrmSection() {
  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        Les bases <strong>PortaDB</strong> et <strong>MasterCRM</strong> sont sur des serveurs distincts et n{"'"}ont
        <strong> aucun lien SQL direct</strong>. La liaison se fait via les web services (DAPI → WSMobiMaster).
      </Alert>

      <SectionTitle>Requetes PortaDB</SectionTitle>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Chip label="Serveur : vmqproportawebdb01" color="success" size="small" variant="soft" />
        <Chip label="IP : 172.24.119.68" size="small" variant="soft" />
        <Chip label="BDD : PostgreSQL" color="info" size="small" variant="soft" />
      </Stack>

      <CodeBlock title="Rechercher un portage par MSISDN provisoire">
{`-- Rechercher les donnees de portage dans PortaDB
SELECT *
FROM PORTAGE_DATA
WHERE temporary_msisdn = '0690XXXXXX';`}
      </CodeBlock>

      <InfoCard title="Champ change_date" icon="solar:calendar-bold-duotone" color="#d97706">
        <Typography variant="body2">
          Le champ <code>change_date</code> est <strong>NULL</strong> tant que la bascule n{"'"}a pas eu lieu.
          Une fois la bascule effectuee, il contient la date et l{"'"}heure de la bascule.
          C{"'"}est un indicateur fiable pour savoir si le portage a ete execute cote PortaDB.
        </Typography>
      </InfoCard>

      <SectionTitle>Requetes MasterCRM</SectionTitle>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Chip label="Serveur : vmqprombdb01" color="primary" size="small" variant="soft" />
        <Chip label="BDD : MasterCRM (Oracle / SQL)" color="warning" size="small" variant="soft" />
      </Stack>

      <CodeBlock title="Verification MSISDN dans MasterCRM">
{`-- Verifier le statut du MSISDN dans MasterCRM
SELECT operation_id, msisdn_no, ST_MSISDN_ID, MSISDN_STATUS, MS_CLASS
FROM MSISDN
WHERE MSISDN_no IN ('0690XXXXXX');`}
      </CodeBlock>

      <SectionTitle>Liaison entre les deux bases</SectionTitle>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <strong>Pas de lien SQL direct</strong> entre PortaDB (PostgreSQL sur vmqproportawebdb01) et MasterCRM
        (Oracle/SQL sur vmqprombdb01). La synchronisation passe par les web services.
      </Alert>

      <InfoCard title="Architecture de liaison" icon="solar:link-bold-duotone" color="#2563eb">
        <Typography variant="body2">
          <strong>PortaDB</strong> → <strong>DAPI</strong> (appelle WSMobiMaster) → <strong>MasterCRM DB</strong><br /><br />
          Le flux est le suivant :<br />
          1. DAPI lit les informations de portage dans <strong>PortaDB</strong><br />
          2. DAPI appelle <strong>WSMobiMaster</strong> (SOAP) pour appliquer les changements dans le CRM<br />
          3. WSMobiMaster modifie la base <strong>MasterCRM</strong> (changement MSISDN ou resiliation)<br /><br />
          En cas d{"'"}incident CRM, la bascule dans PortaDB est faite mais pas dans MasterCRM → desynchronisation.
        </Typography>
      </InfoCard>

      <SubTitle>Diagnostic de desynchronisation</SubTitle>

      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        Pour identifier une desynchronisation entre PortaDB et MasterCRM, comparer manuellement :
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Verification</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>PortaDB</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>MasterCRM</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Si incoherent</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Porta entrante</TableCell>
              <TableCell>change_date renseigne dans PORTAGE_DATA</TableCell>
              <TableCell>MSISDN porte present et actif</TableCell>
              <TableCell>Relancer ExecuteChangeMSISDNPe</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Porta sortante</TableCell>
              <TableCell>change_date renseigne dans PORTAGE_DATA</TableCell>
              <TableCell>Ligne resiliee, MSISDN reaffectable</TableCell>
              <TableCell>Relancer ExecuteResiliationPs + MAJ manuelle</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <InfoCard title="Procedure en cas de desynchronisation" icon="solar:danger-triangle-bold-duotone" color="#dc2626">
        <Typography variant="body2" component="div">
          <Box component="ol" sx={{ pl: 2, '& li': { mb: 0.5 } }}>
            <li>Verifier dans PortaDB que le portage est bien bascule (change_date non NULL)</li>
            <li>Verifier dans MasterCRM que le MSISDN est dans l{"'"}etat attendu</li>
            <li>Si desynchronisation confirmee, escalader a l{"'"}equipe MOBI avec le MSISDN et la date de bascule</li>
            <li>Pour une porta sortante, si urgent : MAJ manuelle du statut reaffectable (voir onglet Table MSISDN)</li>
          </Box>
        </Typography>
      </InfoCard>
    </>
  );
}

// ─── CRM Section tabs ───────────────────────────────────────────────────────

const CRM_SECTIONS: DocSection[] = [
  {
    id: 'table-msisdn',
    title: 'Table MSISDN',
    icon: 'solar:database-bold-duotone',
    content: <TableMsisdnSection />,
  },
  {
    id: 'diag-porta-entrante',
    title: 'Diag. porta entrante',
    icon: 'solar:login-3-bold-duotone',
    content: <DiagPortaEntranteSection />,
  },
  {
    id: 'diag-porta-sortante',
    title: 'Diag. porta sortante',
    icon: 'solar:logout-3-bold-duotone',
    content: <DiagPortaSortanteSection />,
  },
  {
    id: 'comparaison-porta-crm',
    title: 'PortaDB vs CRM',
    icon: 'solar:transfer-horizontal-bold-duotone',
    content: <ComparaisonPortaCrmSection />,
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function RequetesPnm() {
  const [domain, setDomain] = useState<Domain>('pnm');
  const [pnmTab, setPnmTab] = useState(0);
  const [crmTab, setCrmTab] = useState(0);

  const totalQueries = QUERY_CATEGORIES.reduce((sum, cat) => sum + cat.queries.length, 0);

  const handleDomainChange = useCallback((_: React.MouseEvent<HTMLElement>, newDomain: Domain | null) => {
    if (newDomain !== null) {
      setDomain(newDomain);
    }
  }, []);

  const handleCrmTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setCrmTab(newValue);
  }, []);

  return (
    <DashboardLayout>
      <Head title="Requetes SQL — PNM & CRM" />

      <Box sx={{ p: { xs: 3, md: 5 } }}>
        {/* Header */}
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4">Requetes SQL — PNM & CRM</Typography>
            <Typography sx={{ mt: 1, color: 'text.secondary' }}>
              {domain === 'pnm'
                ? `${totalQueries} requetes PNM pretes a copier-coller dans Workbench, organisees par cas d'usage.`
                : 'Requetes SQL pour le diagnostic et la maintenance de la base MasterCRM.'}
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={domain}
            exclusive
            onChange={handleDomainChange}
            size="small"
            sx={{ flexShrink: 0 }}
          >
            <ToggleButton value="pnm">
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Iconify icon="solar:server-bold-duotone" width={18} />
                <span>PNM</span>
              </Stack>
            </ToggleButton>
            <ToggleButton value="crm">
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Iconify icon="solar:database-bold-duotone" width={18} />
                <span>CRM</span>
              </Stack>
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {/* ─── PNM domain ──────────────────────────────────────────────── */}
        {domain === 'pnm' && (
          <>
            {/* Category tabs */}
            <Tabs
              value={pnmTab}
              onChange={(_, v) => setPnmTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 0 }}
            >
              {QUERY_CATEGORIES.map((cat) => (
                <Tab
                  key={cat.title}
                  label={cat.shortTitle}
                  icon={<Iconify icon={cat.icon} width={20} />}
                  iconPosition="start"
                />
              ))}
            </Tabs>

            <Divider />

            {/* Tab panels */}
            {QUERY_CATEGORIES.map((category, idx) => (
              pnmTab === idx ? (
                <Box key={category.title} sx={{ pt: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                    <Typography variant="h6">{category.title}</Typography>
                    <Chip
                      label={`${category.queries.length} requete${category.queries.length > 1 ? 's' : ''}`}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>

                  <Stack spacing={2.5}>
                    {category.queries.map((query) => (
                      <SqlBlock key={query.title} query={query} />
                    ))}
                  </Stack>
                </Box>
              ) : null
            ))}
          </>
        )}

        {/* ─── CRM domain ──────────────────────────────────────────────── */}
        {domain === 'crm' && (
          <>
            <Tabs
              value={crmTab}
              onChange={handleCrmTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              {CRM_SECTIONS.map((section) => (
                <Tab
                  key={section.id}
                  label={
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Iconify icon={section.icon} width={18} />
                      <span>{section.title}</span>
                    </Stack>
                  }
                />
              ))}
            </Tabs>

            <Card>
              <CardContent sx={{ p: 3 }}>
                {CRM_SECTIONS[crmTab].content}
              </CardContent>
            </Card>
          </>
        )}
      </Box>
    </DashboardLayout>
  );
}
