import { useCallback, useState } from 'react';
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
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { DashboardLayout } from 'src/layouts/dashboard/layout';

// ─── Types ──────────────────────────────────────────────────────────────────

type DocSection = {
  id: string;
  title: string;
  icon: string;
  content: React.ReactNode;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── Tab 1 : Table MSISDN ───────────────────────────────────────────────────

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

// ─── Tab 2 : Diagnostics porta entrante ─────────────────────────────────────

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

// ─── Tab 3 : Diagnostics porta sortante ─────────────────────────────────────

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

// ─── Tab 4 : Comparaison PortaDB vs CRM ─────────────────────────────────────

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

// ─── Section tabs ───────────────────────────────────────────────────────────

const SECTIONS: DocSection[] = [
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

// ─── Main page ──────────────────────────────────────────────────────────────

export default function MobiSqlQueries() {
  const [tab, setTab] = useState(0);

  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  }, []);

  return (
    <DashboardLayout>
      <Head title="Requetes SQL MasterCRM" />

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1200, mx: 'auto' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
          <Iconify icon="solar:database-bold-duotone" width={32} sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Requetes SQL MasterCRM
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Reference des requetes SQL pour le diagnostic et la maintenance de la base MasterCRM
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          {SECTIONS.map((section) => (
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
            {SECTIONS[tab].content}
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
