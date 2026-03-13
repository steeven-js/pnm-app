import { useCallback, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
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
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { DashboardLayout } from 'src/layouts/dashboard/layout';

// ─── Types ──────────────────────────────────────────────────────────────────

type Severity = 'critique' | 'majeur' | 'mineur';
type Category = 'crm' | 'portabilite' | 'webservice' | 'supervision';

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
  crm: { label: 'CRM / MasterCRM', icon: 'solar:database-bold-duotone' },
  portabilite: { label: 'Portabilite', icon: 'solar:transfer-horizontal-bold-duotone' },
  webservice: { label: 'WebService', icon: 'solar:cloud-bold-duotone' },
  supervision: { label: 'Supervision', icon: 'solar:chart-bold-duotone' },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function CodeBlock({ children }: { children: string }) {
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
        }}
        dangerouslySetInnerHTML={{ __html: children }}
      />
      <Tooltip title={copied ? 'Copie !' : 'Copier'} placement="left">
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

function InfoCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <Card variant="outlined" sx={{ my: 2, bgcolor: 'action.hover' }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Iconify icon={icon} width={20} sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle2" fontWeight="bold">{title}</Typography>
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

// ─── Cas #1 — Incident CRM pendant bascule ─────────────────────────────────

const casIncidentBascule: CasPratique = {
  id: 'incident-crm-bascule',
  title: 'Incident CRM pendant bascule de portabilite',
  date: '13/03/2026',
  severity: 'critique',
  category: 'crm',
  tags: ['CRM', 'Bascule', 'MasterCRM', 'Porta entrante', 'Porta sortante'],
  summary:
    'MOBI/MasterCRM est en incident pendant la bascule de portabilite. Les appels CRM echouent alors que la bascule DAPI est OK, impactant les porta entrantes et sortantes.',
  content: (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ce cas documente la procedure a suivre lorsque le CRM MasterCRM est en incident au moment
        de la bascule de portabilite. La bascule DAPI est effectuee avec succes mais les traitements
        CRM echouent, laissant les clients dans un etat intermediaire.
      </Typography>

      <Alert severity="error" sx={{ mb: 2 }}>
        <strong>Impact critique —</strong> Les clients porta entrante restent sur le MSISDN provisoire.
        Les clients porta sortante ne sont pas resilies et continuent a etre factures.
      </Alert>

      <StepHeader number={1} icon="solar:magnifer-bold-duotone" title="Detecter l'ecart DAPI vs CRM" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Comparer les mandats bascules dans <strong>PortaDB</strong> avec l'etat dans le <strong>CRM</strong> :
      </Typography>

      <CodeBlock>{`-- Mandats bascules OK dans PortaDB
SELECT pd.mandate_id, pd.msisdn, pd.temporary_msisdn,
       pd.status, pd.switch_date
FROM PORTAGE_DATA pd
WHERE pd.switch_date = TRUNC(SYSDATE)
  AND pd.status = 'SWITCHED';`}</CodeBlock>

      <CodeBlock>{`-- Verifier le traitement CRM correspondant
SELECT m.MSISDN_NO, m.ST_MSISDN_ID, m.MSISDN_STATUS,
       m.MS_CLASS, m.LAST_MODIFIED
FROM MSISDN m
WHERE m.MSISDN_NO IN (
  SELECT pd.msisdn FROM PORTAGE_DATA pd
  WHERE pd.switch_date = TRUNC(SYSDATE)
    AND pd.status = 'SWITCHED'
);`}</CodeBlock>

      <StepHeader number={2} icon="solar:danger-triangle-bold-duotone" title="Identifier les cas en echec" />

      <InfoCard icon="solar:transfer-horizontal-bold-duotone" title="Porta entrante — ExecuteChangeMSISDNPe">
        <Typography variant="body2">
          L'appel <code>ExecuteChangeMSISDNPe</code> echoue : le client reste sur le MSISDN provisoire
          au lieu d'etre bascule sur son MSISDN definitif.
        </Typography>
      </InfoCard>

      <InfoCard icon="solar:logout-2-bold-duotone" title="Porta sortante — ExecuteResiliationPs">
        <Typography variant="body2">
          L'appel <code>ExecuteResiliationPs</code> echoue : la ligne n'est pas resiliee dans le CRM,
          la facturation continue pour le client parti.
        </Typography>
      </InfoCard>

      <StepHeader number={3} icon="solar:wrench-bold-duotone" title="Resolution" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>1.</strong> Escalader immediatement vers l'equipe MOBI avec la liste des mandats impactes.
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>2.</strong> Fournir la liste complete des mandats bascules (export CSV depuis PortaDB).
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>3.</strong> L'equipe MOBI effectue la relance manuelle des traitements CRM.
      </Typography>

      <Alert severity="warning" sx={{ mt: 2 }}>
        <strong>Attention —</strong> Ne jamais tenter de corriger manuellement les donnees CRM sans
        validation de l'equipe MOBI. Les traitements doivent etre relances via les operations CRM standard.
      </Alert>
    </>
  ),
};

// ─── Cas #2 — MSISDN non reaffecte ─────────────────────────────────────────

const casMsisdnBloque: CasPratique = {
  id: 'msisdn-non-reaffecte',
  title: 'MSISDN non reaffecte apres porta sortante',
  date: '13/03/2026',
  severity: 'majeur',
  category: 'portabilite',
  tags: ['MSISDN', 'Porta sortante', 'CRM', 'Status'],
  summary:
    'Apres une porta sortante, le MSISDN reste bloque dans le CRM (MSISDN_STATUS != 7). Le numero ne peut pas etre reassigne.',
  content: (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Apres une porta sortante, le MSISDN doit etre libere dans le CRM pour pouvoir etre
        reattribue. Si le statut reste bloque, le numero est inutilisable.
      </Typography>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <strong>Prerequis —</strong> Verifier que la porta sortante est bien finalisee dans PortaDB
        avant toute modification dans le CRM.
      </Alert>

      <StepHeader number={1} icon="solar:magnifer-bold-duotone" title="Verifier l'etat du MSISDN" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Interroger la table MSISDN pour verifier le statut actuel :
      </Typography>

      <CodeBlock>{`SELECT operation_id, msisdn_no, ST_MSISDN_ID,
       MSISDN_STATUS, MS_CLASS
FROM MSISDN
WHERE MSISDN_no IN ('0690XXXXXX');`}</CodeBlock>

      <InfoCard icon="solar:info-circle-bold-duotone" title="Valeurs attendues apres porta sortante">
        <Typography variant="body2">
          <code>ST_MSISDN_ID = '0'</code> et <code>MSISDN_STATUS = '7'</code> (libre).
          Si ces valeurs ne correspondent pas, le MSISDN est bloque.
        </Typography>
      </InfoCard>

      <StepHeader number={2} icon="solar:wrench-bold-duotone" title="Correction manuelle" />

      <Alert severity="error" sx={{ mb: 2 }}>
        <strong>Attention —</strong> Verifier imperativement que <code>MS_CLASS = '0'</code> avant
        toute mise a jour. Ne pas modifier les MSISDN avec un MS_CLASS different.
      </Alert>

      <CodeBlock>{`UPDATE MSISDN
SET ST_MSISDN_ID = '0',
    MSISDN_STATUS = '7'
WHERE MSISDN_no IN ('0690XXXXXX')
  AND MS_CLASS = '0';

COMMIT;`}</CodeBlock>

      <StepHeader number={3} icon="solar:check-circle-bold-duotone" title="Verification post-correction" />

      <CodeBlock>{`SELECT operation_id, msisdn_no, ST_MSISDN_ID,
       MSISDN_STATUS, MS_CLASS
FROM MSISDN
WHERE MSISDN_no IN ('0690XXXXXX');
-- Resultat attendu : ST_MSISDN_ID = '0', MSISDN_STATUS = '7'`}</CodeBlock>
    </>
  ),
};

// ─── Cas #3 — WSMobiMaster ne repond pas ────────────────────────────────────

const casWsMobiMaster: CasPratique = {
  id: 'wsmobimaster-down',
  title: 'WSMobiMaster ne repond pas',
  date: '13/03/2026',
  severity: 'majeur',
  category: 'webservice',
  tags: ['WSMobiMaster', 'SoapUI', 'Connectivite', 'Microservices'],
  summary:
    'Le WebService WSMobiMaster ne repond pas aux requetes SoapUI (TestWord). Diagnostic de connectivite et verification des microservices.',
  content: (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ce cas couvre le diagnostic lorsque le WebService <strong>WSMobiMaster</strong> ne repond pas.
        Le test SoapUI <code>TestWord</code> ne renvoie aucune reponse.
      </Typography>

      <StepHeader number={1} icon="solar:magnifer-bold-duotone" title="Verifier la connectivite reseau" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Tester la connectivite vers le serveur MOBI :
      </Typography>

      <CodeBlock>{`# Ping vers le serveur MOBI
ping 172.24.4.136

# Telnet pour verifier le port
telnet 172.24.4.136 8080`}</CodeBlock>

      <StepHeader number={2} icon="solar:server-bold-duotone" title="Verifier les serveurs MOBI" />

      <InfoCard icon="solar:server-bold-duotone" title="Serveurs a verifier">
        <Typography variant="body2">
          <strong>vmqpromsbox01</strong> — Serveur principal MobiMaster<br />
          <strong>vmqpromsbox02</strong> — Serveur secondaire MobiMaster<br />
          Verifier que les deux VMs sont UP et accessibles.
        </Typography>
      </InfoCard>

      <StepHeader number={3} icon="solar:test-tube-bold-duotone" title="Test SoapUI" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Executer l'operation <code>TestWord</code> dans SoapUI pour valider la disponibilite du WS :
      </Typography>

      <CodeBlock>{`<!-- SoapUI TestWord Request -->
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ws="http://ws.mobi.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:TestWord>
      <arg0>test</arg0>
    </ws:TestWord>
  </soapenv:Body>
</soapenv:Envelope>`}</CodeBlock>

      <StepHeader number={4} icon="solar:wrench-bold-duotone" title="Resolution" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>1.</strong> Si la connectivite est KO : verifier l'etat des VMs, escalader equipe infra.
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>2.</strong> Si le serveur est UP mais le WS ne repond pas : redemarrer les microservices MOBI.
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>3.</strong> Si le probleme persiste : escalader vers l'equipe MOBI.
      </Typography>

      <Alert severity="info" sx={{ mt: 2 }}>
        <strong>Note —</strong> Toujours verifier les deux serveurs (vmqpromsbox01 et vmqpromsbox02)
        car le load balancer peut rediriger vers l'un ou l'autre.
      </Alert>
    </>
  ),
};

// ─── Cas #4 — Ecart PortaDB vs MasterCRM ────────────────────────────────────

const casEcartPortaCrm: CasPratique = {
  id: 'ecart-portadb-crm',
  title: 'Ecart entre PortaDB et MasterCRM',
  date: '13/03/2026',
  severity: 'mineur',
  category: 'supervision',
  tags: ['PortaDB', 'MasterCRM', 'Ecart', 'Verification'],
  summary:
    'Un numero est bascule dans PortaDB mais l\'etat CRM ne correspond pas. Procedure de comparaison et de relance du traitement.',
  content: (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ce cas traite les ecarts entre l'etat d'un numero dans <strong>PortaDB</strong> (bascule OK)
        et son etat dans le <strong>MasterCRM</strong> (traitement non effectue ou partiel).
      </Typography>

      <StepHeader number={1} icon="solar:magnifer-bold-duotone" title="Verification dans PortaDB" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Verifier l'etat du numero dans la base de portabilite :
      </Typography>

      <CodeBlock>{`SELECT mandate_id, msisdn, temporary_msisdn,
       status, switch_date, operator_donor, operator_recipient
FROM PORTAGE_DATA
WHERE temporary_msisdn = '0690XXXXXX'
   OR msisdn = '0690XXXXXX';`}</CodeBlock>

      <StepHeader number={2} icon="solar:database-bold-duotone" title="Verification dans MasterCRM" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Verifier l'etat correspondant dans le CRM :
      </Typography>

      <CodeBlock>{`SELECT operation_id, msisdn_no, ST_MSISDN_ID,
       MSISDN_STATUS, MS_CLASS, LAST_MODIFIED
FROM MSISDN
WHERE MSISDN_no IN ('0690XXXXXX');`}</CodeBlock>

      <StepHeader number={3} icon="solar:chart-bold-duotone" title="Comparer et identifier l'ecart" />

      <InfoCard icon="solar:list-check-bold-duotone" title="Points de comparaison">
        <Typography variant="body2">
          <strong>PortaDB status = SWITCHED</strong> mais <strong>CRM MSISDN_STATUS != attendu</strong> :
          le traitement CRM n'a pas ete execute ou a echoue silencieusement.<br /><br />
          Verifier egalement la <code>LAST_MODIFIED</code> dans le CRM : si la date ne correspond pas
          a la date de bascule, le traitement n'est pas passe.
        </Typography>
      </InfoCard>

      <StepHeader number={4} icon="solar:wrench-bold-duotone" title="Resolution" />

      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>1.</strong> Documenter l'ecart (capture des deux requetes).
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>2.</strong> Transmettre a l'equipe MOBI pour relance du traitement CRM.
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>3.</strong> Verifier apres relance que l'etat CRM correspond a l'etat PortaDB.
      </Typography>

      <Alert severity="info" sx={{ mt: 2 }}>
        <strong>Conseil —</strong> Ces ecarts sont souvent lies a un incident CRM temporaire.
        La relance du traitement suffit generalement a corriger la situation.
      </Alert>
    </>
  ),
};

// ─── Data ───────────────────────────────────────────────────────────────────

const CAS_PRATIQUES: CasPratique[] = [casIncidentBascule, casMsisdnBloque, casWsMobiMaster, casEcartPortaCrm];

// ─── Main Component ─────────────────────────────────────────────────────────

export default function MobiCasPratiques() {
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [openCas, setOpenCas] = useState<CasPratique | null>(null);

  const filtered = useMemo(() => {
    let result = CAS_PRATIQUES;
    if (selectedSeverity !== 'all') {
      result = result.filter((c) => c.severity === selectedSeverity);
    }
    if (selectedCategory !== 'all') {
      result = result.filter((c) => c.category === selectedCategory);
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
  }, [search, selectedSeverity, selectedCategory]);

  const counts = useMemo(() => {
    const bySeverity: Record<Severity, number> = { critique: 0, majeur: 0, mineur: 0 };
    const byCategory: Record<Category, number> = { crm: 0, portabilite: 0, webservice: 0, supervision: 0 };
    CAS_PRATIQUES.forEach((c) => {
      bySeverity[c.severity]++;
      byCategory[c.category]++;
    });
    return { bySeverity, byCategory };
  }, []);

  return (
    <DashboardLayout>
      <Head title="MOBI Cas Pratiques" />

      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h4">Cas Pratiques MOBI CRM</Typography>
          <Typography variant="body2" color="text.secondary">
            {CAS_PRATIQUES.length} procedures documentees pour le CRM MOBI/MasterCRM. Filtrez par gravite ou categorie.
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
            {(Object.entries(CATEGORY_CONFIG) as [Category, typeof CATEGORY_CONFIG.crm][]).map(
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
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr' },
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
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, lineHeight: 1.3 }}>
                      {cas.title}
                    </Typography>

                    {/* Summary */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, flex: 1 }}>
                      {cas.summary}
                    </Typography>

                    {/* Tags */}
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {cas.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: 10, height: 20 }}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>

        {/* Empty state */}
        {filtered.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Iconify icon="solar:magnifer-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Aucun cas pratique trouve
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Essayez de modifier vos filtres ou votre recherche.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Detail dialog */}
      <Dialog open={!!openCas} onClose={() => setOpenCas(null)} maxWidth="md" fullWidth scroll="paper">
        {openCas && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
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
                <IconButton size="small" onClick={() => setOpenCas(null)}>
                  <Iconify icon="solar:close-circle-bold" width={22} />
                </IconButton>
              </Stack>
              <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
                {openCas.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
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
