import { useState, useCallback } from 'react';
import { Head } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
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

// ─── Data ───────────────────────────────────────────────────────────────────

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

// ─── SQL Code Block ─────────────────────────────────────────────────────────

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

// ─── Component ──────────────────────────────────────────────────────────────

export default function RequetesPnm() {
  const [tab, setTab] = useState(0);

  const totalQueries = QUERY_CATEGORIES.reduce((sum, cat) => sum + cat.queries.length, 0);

  return (
    <DashboardLayout>
      <Head title="Requetes SQL PNM" />

      <Box sx={{ p: { xs: 3, md: 5 } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4">Requetes SQL PNM</Typography>
          <Typography sx={{ mt: 1, color: 'text.secondary' }}>
            {totalQueries} requetes pretes a copier-coller dans Workbench, organisees par cas d&apos;usage.
          </Typography>
        </Box>

        {/* Category tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
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
          tab === idx ? (
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
      </Box>
    </DashboardLayout>
  );
}
