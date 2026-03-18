import { useCallback, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
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

function CodeBlock({ title, children }: { title?: string; children: string }) {
  return (
    <Box sx={{ my: 2 }}>
      {title && (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>
          {title}
        </Typography>
      )}
      <Box
        component="pre"
        sx={{
          p: 2,
          borderRadius: 1.5,
          bgcolor: '#1e1e2e',
          color: '#cdd6f4',
          fontSize: 12,
          fontFamily: 'monospace',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {children}
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

function ServerRow({ name, host, role, ip }: { name: string; host: string; role: string; ip?: string }) {
  return (
    <TableRow>
      <TableCell sx={{ fontWeight: 600 }}>{name}</TableCell>
      <TableCell><code>{host}</code></TableCell>
      <TableCell>{ip && <Chip label={ip} size="small" variant="soft" />}</TableCell>
      <TableCell>{role}</TableCell>
    </TableRow>
  );
}

// ─── Architecture ESB DataPower ─────────────────────────────────────────────

function ArchitectureSection() {
  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        L{"'"}architecture ESB (Enterprise Service Bus) est basee sur <strong>DataPower Proxy (Spring Boot)</strong> qui sert
        d{"'"}intermediaire entre les applications clientes et les microservices backend. Le protocol est <strong>REST/JSON</strong> cote
        client et <strong>SOAP/XML</strong> cote backend.
      </Alert>

      <SectionTitle>Applications clientes</SectionTitle>
      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        Ces applications envoient des requetes au DataPower Proxy via REST/JSON ou SOAP/XML.
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Application</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Operations appelees</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Protocole</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Bill Pay Now / MDA</TableCell>
              <TableCell>GetAccountBalanceInformation, GetBillingProfileInformation, GetLastInvoiceInformation, GetLineInformation(MasterCRM), UpdatePayment</TableCell>
              <TableCell><Chip label="REST/JSON" size="small" color="primary" variant="soft" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>MasterCRM</TableCell>
              <TableCell>GetLineOfferChangeInformation, GetScoringInformation(SEV)</TableCell>
              <TableCell><Chip label="REST/JSON" size="small" color="primary" variant="soft" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>IVR Payment</TableCell>
              <TableCell>CheckEsbAccess, GetAccountBalanceInformation, GetBillingProfileInformation, GetLineInformation(SEV), SendNotification(CRM ou SMS), UpdateLineStatus, UpdatePayment</TableCell>
              <TableCell><Chip label="REST/JSON" size="small" color="primary" variant="soft" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>DAPI</TableCell>
              <TableCell>GetLineInformation(MasterCRM)</TableCell>
              <TableCell><Chip label="SOAP/XML" size="small" color="warning" variant="soft" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Payment Terminal</TableCell>
              <TableCell>CheckEsbAccess, GetAccountBalanceInformation, GetBillingProfileInformation, GetLineInformation(MasterCRM), SendNotification(CRM ou SMS), UpdateLineStatus, UpdatePayment</TableCell>
              <TableCell><Chip label="REST/JSON" size="small" color="primary" variant="soft" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>USSD</TableCell>
              <TableCell>GetRioInformation</TableCell>
              <TableCell><Chip label="REST/JSON" size="small" color="primary" variant="soft" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>IVR TopUp</TableCell>
              <TableCell>CheckEsbAccess, GetLineCounters, GetLineInformation(MasterCRM), MakeRefill, SendNotification(SMS)</TableCell>
              <TableCell><Chip label="REST/JSON" size="small" color="primary" variant="soft" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>SelfCare (Data)</TableCell>
              <TableCell>GetBillingProfileInformation, GetFleetInformation</TableCell>
              <TableCell><Chip label="REST/JSON" size="small" color="primary" variant="soft" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>WebStore</TableCell>
              <TableCell>ActivateLine, CreateMandate, GetLineInformation(SEV+MasterCRM), GetScoringInformation, MakePayment</TableCell>
              <TableCell><Chip label="REST/JSON" size="small" color="primary" variant="soft" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>SINGLEVIEW</TableCell>
              <TableCell>ServiceProvisioning</TableCell>
              <TableCell><Chip label="REST/JSON" size="small" color="primary" variant="soft" /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <SectionTitle>Microservices (via DataPower Proxy)</SectionTitle>
      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        Le DataPower Proxy route les requetes vers les microservices suivants. Le proxy utilise <strong>XToolWS (Java/Glassfish)</strong> pour certains routages.
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Microservice</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Backend WS</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Protocole backend</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>MSCustomer</TableCell>
              <TableCell>MasterCRM DB (SQL)</TableCell>
              <TableCell><Chip label="SQL" size="small" variant="soft" /></TableCell>
              <TableCell>Donnees client</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>DCAPI</TableCell>
              <TableCell>MasterCRM DB (SQL)</TableCell>
              <TableCell><Chip label="SQL" size="small" variant="soft" /></TableCell>
              <TableCell>API donnees client</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>eSIF</TableCell>
              <TableCell>MasterCRM DB (SQL)</TableCell>
              <TableCell><Chip label="SQL" size="small" variant="soft" /></TableCell>
              <TableCell>Service information facturation</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>MSLine</TableCell>
              <TableCell>MasterCRM WS</TableCell>
              <TableCell><Chip label="SOAP/XML" size="small" color="warning" variant="soft" /></TableCell>
              <TableCell>Gestion des lignes</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>MSBilling</TableCell>
              <TableCell>ESB-Billing WS</TableCell>
              <TableCell><Chip label="SOAP/XML" size="small" color="warning" variant="soft" /></TableCell>
              <TableCell>Facturation</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>MSPorta</TableCell>
              <TableCell>DAPI WS</TableCell>
              <TableCell><Chip label="SOAP/XML" size="small" color="warning" variant="soft" /></TableCell>
              <TableCell>Portabilite (interface DAPI)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>MSProvisioning</TableCell>
              <TableCell>Charging Gateway</TableCell>
              <TableCell><Chip label="SOAP/XML" size="small" color="warning" variant="soft" /></TableCell>
              <TableCell>Provisioning des services</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>MSNotif</TableCell>
              <TableCell>—</TableCell>
              <TableCell><Chip label="REST/JSON" size="small" color="primary" variant="soft" /></TableCell>
              <TableCell>Envoi de notifications</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <InfoCard title="Flux de communication" icon="solar:routing-bold-duotone" color="#2563eb">
        <Typography variant="body2">
          <strong>Client → DataPower Proxy</strong> : REST/JSON (ou SOAP/XML pour DAPI)<br />
          <strong>DataPower Proxy → XToolWS</strong> : SOAP/XML (Java/Glassfish, Log In/Out → Graylog)<br />
          <strong>XToolWS / Proxy → Microservices</strong> : REST/JSON<br />
          <strong>Microservices → Backend</strong> : SQL direct ou SOAP/XML vers WS externes
        </Typography>
      </InfoCard>

      <InfoCard title="Base de donnees centrale" icon="solar:database-bold-duotone" color="#7c3aed">
        <Typography variant="body2">
          <strong>MasterCRM DB / Blacklist / Other data</strong> — Base de donnees centrale du CRM, accedee directement (SQL) par MSCustomer, DCAPI, eSIF, et via MasterCRM WS (SOAP/XML) par MSLine.
        </Typography>
      </InfoCard>
    </>
  );
}

// ─── Infrastructure Portabilite ─────────────────────────────────────────────

function InfrastructureSection() {
  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        Vue d{"'"}ensemble de l{"'"}infrastructure de production du pole Application Portabilite. Les serveurs principaux
        et leurs roles dans le processus PNM V3.
      </Alert>

      <SectionTitle>Serveurs de production</SectionTitle>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Composant</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Hostname</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>IP</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <ServerRow name="PortaDB / PortaWebDB" host="vmqproportawebdb01" ip="172.24.119.68" role="Base de donnees Porta (PostgreSQL) — stocke tous les mandats, portages, etats" />
            <ServerRow name="Synchronisation" host="vmqproportasync01" ip="172.24.119.69" role="Traitement des fichiers (EMA/EMM/FNR), generation PNMDATA, bascules" />
            <ServerRow name="EMA" host="ema15-digicel" ip="172.24.119.140" role="Serveur EMA — reception/envoi des fichiers inter-operateurs" />
            <ServerRow name="BTCTF" host="btctf" ip="172.24.119.70" role="Serveur de fichiers inter-operateur (HUB)" />
            <ServerRow name="HUB" host="hub.fwi.digicelgroup.local" role="Hub central d'echange des fichiers portabilite entre operateurs" />
            <ServerRow name="PortaWS" host="vmqproportaws01" role="Tomcat — PortaWS (API SOAP portabilite)" />
            <ServerRow name="PortaWebUI" host="vmqproportaweb01" role="Tomcat — PortaWebUI (interface web de consultation des mandats)" />
            <ServerRow name="Micro services" host="vmqpromsbox01 / vmqpromsbox02" ip="172.24.119.96" role="Microservices MOBI (VIP: 172.24.119.96)" />
            <ServerRow name="Mobi MCST" host="vmqprombdb01" role="Base de donnees MasterCRM / MOBI" />
            <ServerRow name="FrontEnd Soap" host="DigimobillmobiI0" role="Frontend SOAP — interface SOAP pour Mobi" />
            <ServerRow name="DataPower Proxy" host="vmqprotodapi01 / vmqprotodapi02" role="Proxy ESB DataPower (Spring Boot) — VIP: f5-vip-kong" />
            <ServerRow name="FNR" host="Serveur X" role="Serveur FNR (Fichier Numero Reference)" />
          </TableBody>
        </Table>
      </TableContainer>

      <SectionTitle>Acces utilisateurs</SectionTitle>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Profil</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Acces via</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Usage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Points de vente</TableCell>
              <TableCell><code>rdp-pdvunipaas</code></TableCell>
              <TableCell>Saisie des portabilites via PortaWebUI</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Custom Care</TableCell>
              <TableCell><code>rdp-ccarecrm</code></TableCell>
              <TableCell>Consultation/correction via PortaWebUI + MasterCRM</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <InfoCard title="Flux simplifie" icon="solar:transfer-horizontal-bold-duotone" color="#16a34a">
        <Typography variant="body2">
          <strong>Operateurs externes</strong> → HUB (btctf) → <strong>Synchronisation</strong> (vmqproportasync01) → <strong>PortaDB</strong> (vmqproportawebdb01)<br />
          <strong>PortaDB</strong> → <strong>Micro services MOBI</strong> (vmqpromsbox01/02) → <strong>MasterCRM DB</strong> (vmqprombdb01)<br />
          <strong>Users PdV/CC</strong> → PortaWebUI → PortaDB
        </Typography>
      </InfoCard>
    </>
  );
}

// ─── WSMobiMaster / WSProvisioning ──────────────────────────────────────────

type WsOperation = {
  name: string;
  description: string;
  category: 'portabilite' | 'ligne' | 'paiement' | 'offre' | 'communication' | 'autre';
  pnmRelevant?: boolean;
};

const WS_OPERATIONS: WsOperation[] = [
  { name: 'Execute', description: 'Operation generique d\'execution', category: 'autre' },
  { name: 'ExecuteChangeMSISDNPe', description: 'Changement de MSISDN pour une portabilite entrante — remplace le MSISDN provisoire par le numero porte', category: 'portabilite', pnmRelevant: true },
  { name: 'ExecuteDigicelPlus', description: 'Execution d\'une operation Digicel+', category: 'offre' },
  { name: 'ExecuteResiliationPs', description: 'Resiliation d\'une ligne pour une portabilite sortante — resilier la ligne du client qui quitte Digicel', category: 'portabilite', pnmRelevant: true },
  { name: 'InfoLine', description: 'Recuperer les informations d\'une ligne (MSISDN, statut, offre, etc.)', category: 'ligne' },
  { name: 'TestWord', description: 'Test de connectivite au WS', category: 'autre' },
  { name: 'CreateLineGP', description: 'Creation d\'une nouvelle ligne Grand Public', category: 'ligne' },
  { name: 'InsertOption', description: 'Ajouter une option a une ligne', category: 'offre' },
  { name: 'TransferLineGP', description: 'Transfert d\'une ligne Grand Public', category: 'ligne' },
  { name: 'DeleteOption', description: 'Supprimer une option d\'une ligne', category: 'offre' },
  { name: 'SIMChange', description: 'Changement de carte SIM', category: 'ligne' },
  { name: 'RegisterWebPayment', description: 'Enregistrer un paiement web', category: 'paiement' },
  { name: 'UpdateEmailing', description: 'Mettre a jour les preferences emailing du client', category: 'communication' },
  { name: 'RecompileAllWSProc', description: 'Recompiler toutes les procedures stockees du WS', category: 'autre' },
  { name: 'OfferChange', description: 'Changement d\'offre d\'une ligne', category: 'offre' },
  { name: 'ExecuteRequest', description: 'Execution d\'une requete generique', category: 'autre' },
  { name: 'AddItem', description: 'Ajouter un item (equipement/accessoire)', category: 'offre' },
  { name: 'RemoveItem', description: 'Retirer un item', category: 'offre' },
  { name: 'InfosOfferItems', description: 'Informations sur les items d\'une offre', category: 'offre' },
  { name: 'GetUncheckedEmails', description: 'Recuperer les emails non verifies', category: 'communication' },
  { name: 'ExecuteChangeMailStatut', description: 'Changer le statut d\'un mail', category: 'communication' },
  { name: 'PSPCBResponse', description: 'Reponse callback PSP (prestataire de paiement)', category: 'paiement' },
];

const CATEGORY_CONFIG: Record<string, { label: string; color: 'error' | 'primary' | 'success' | 'warning' | 'info' | 'default' }> = {
  portabilite: { label: 'Portabilite', color: 'error' },
  ligne: { label: 'Ligne', color: 'primary' },
  paiement: { label: 'Paiement', color: 'success' },
  offre: { label: 'Offre', color: 'warning' },
  communication: { label: 'Communication', color: 'info' },
  autre: { label: 'Autre', color: 'default' },
};

function WsMobiSection() {
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(
    () => filter === 'all' ? WS_OPERATIONS : WS_OPERATIONS.filter((op) => op.category === filter),
    [filter]
  );

  return (
    <>
      <Alert severity="warning" sx={{ mb: 3 }}>
        <strong>WSMobiMaster - WSProvisioning</strong> est le web service SOAP principal de MOBI/MasterCRM.
        C{"'"}est lui qui est appele par le systeme PNM (via DAPI) pour effectuer les changements de MSISDN
        (portabilite entrante) et les resiliations (portabilite sortante) dans le CRM.
      </Alert>

      <InfoCard title="Lien avec la portabilite" icon="solar:link-bold-duotone" color="#dc2626">
        <Typography variant="body2">
          Lors de la <strong>bascule</strong> d{"'"}une portabilite :<br />
          - <strong>Porta entrante</strong> : DAPI appelle <code>ExecuteChangeMSISDNPe</code> pour remplacer le MSISDN provisoire par le numero porte dans MasterCRM<br />
          - <strong>Porta sortante</strong> : DAPI appelle <code>ExecuteResiliationPs</code> pour resilier la ligne du client dans MasterCRM<br /><br />
          Si le CRM (MOBI) est en incident, ces operations ne sont pas executees → <strong>cas pratique #6</strong>
        </Typography>
      </InfoCard>

      <SubTitle>Connexion SoapUI</SubTitle>
      <CodeBlock title="Projet SoapUI (PROD)">
{`Projet : WSMobiMaster - WSProvisioning - PROD
Binding : BasicHttpBinding_Provisioning
Endpoint PROD : (voir configuration SoapUI)
Endpoint INT  : WSDL MOBI - INT (dans SoapUI > Porta - INT)`}
      </CodeBlock>

      <SubTitle>Operations disponibles ({filtered.length})</SubTitle>

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Chip
          label={`Tous (${WS_OPERATIONS.length})`}
          onClick={() => setFilter('all')}
          variant={filter === 'all' ? 'filled' : 'outlined'}
          color="primary"
          size="small"
        />
        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
          const count = WS_OPERATIONS.filter((op) => op.category === key).length;
          return (
            <Chip
              key={key}
              label={`${cfg.label} (${count})`}
              onClick={() => setFilter(key)}
              variant={filter === key ? 'filled' : 'outlined'}
              color={cfg.color}
              size="small"
            />
          );
        })}
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Operation</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Categorie</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>PNM</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((op) => (
              <TableRow key={op.name} sx={op.pnmRelevant ? { bgcolor: 'error.lighter' } : undefined}>
                <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>{op.name}</TableCell>
                <TableCell>
                  <Chip label={CATEGORY_CONFIG[op.category].label} color={CATEGORY_CONFIG[op.category].color} size="small" variant="soft" />
                </TableCell>
                <TableCell>{op.description}</TableCell>
                <TableCell>
                  {op.pnmRelevant && <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: 'error.main' }} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

// ─── Interaction PNM ↔ MOBI ────────────────────────────────────────────────

function InteractionPnmMobiSection() {
  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        Cette section documente comment le systeme PNM interagit avec MOBI/MasterCRM lors des bascules de portabilite.
      </Alert>

      <SectionTitle>Flux de bascule — Portabilite entrante</SectionTitle>

      <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 2, mb: 3, fontFamily: 'monospace', fontSize: 12, lineHeight: 2 }}>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
          1. <strong>PortaSync</strong> (vmqproportasync01) detecte les mandats a basculer<br />
          2. Traitement <strong>EMA/EMM</strong> → bascule DAPI (changement operateur dans la base nationale)<br />
          3. DAPI appelle <strong>MSPorta</strong> (microservice) via DataPower Proxy<br />
          4. MSPorta appelle <strong>DAPI WS</strong> (SOAP/XML) pour la bascule technique<br />
          5. En parallele, DAPI appelle <strong>WSMobiMaster</strong> :<br />
          &nbsp;&nbsp;&nbsp;→ <code>ExecuteChangeMSISDNPe</code> : remplacer MSISDN provisoire par numero porte dans CRM<br />
          6. MasterCRM met a jour la ligne du client avec le nouveau MSISDN
        </Typography>
      </Box>

      <SectionTitle>Flux de bascule — Portabilite sortante</SectionTitle>

      <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 2, mb: 3, fontFamily: 'monospace', fontSize: 12, lineHeight: 2 }}>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
          1. <strong>PortaSync</strong> (vmqproportasync01) detecte les mandats sortants a basculer<br />
          2. Traitement <strong>EMA/EMM</strong> → bascule DAPI<br />
          3. DAPI appelle <strong>WSMobiMaster</strong> :<br />
          &nbsp;&nbsp;&nbsp;→ <code>ExecuteResiliationPs</code> : resilier la ligne du client dans CRM<br />
          4. MasterCRM desactive la ligne et met fin a la facturation
        </Typography>
      </Box>

      <SectionTitle>Cas d{"'"}incident CRM (cas pratique #6)</SectionTitle>

      <InfoCard title="Bascules non traitees dans le CRM" icon="solar:danger-triangle-bold-duotone" color="#d97706">
        <Typography variant="body2">
          Si MOBI/MasterCRM est en incident pendant la bascule :<br /><br />
          <strong>Porta entrante</strong> : pas de changement de MSISDN → le client reste sur son MSISDN provisoire dans le CRM<br />
          <strong>Porta sortante</strong> : pas de resiliation → la ligne n{"'"}est pas desactivee, facturation continue<br /><br />
          <strong>Resolution</strong> : Escalader a l{"'"}equipe MOBI pour relancer les traitements CRM en attente.
          Fournir la liste des mandats bascules (MSISDN, date, type entrant/sortant).
        </Typography>
      </InfoCard>

      <SectionTitle>Endpoints et connectivite</SectionTitle>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Composant</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Appelle</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Protocole</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Operation PNM</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>DAPI</TableCell>
              <TableCell>DataPower Proxy</TableCell>
              <TableCell><Chip label="SOAP/XML" size="small" color="warning" variant="soft" /></TableCell>
              <TableCell>GetLineInformation(MasterCRM)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>DataPower Proxy</TableCell>
              <TableCell>MSPorta</TableCell>
              <TableCell><Chip label="REST/JSON" size="small" color="primary" variant="soft" /></TableCell>
              <TableCell>Bascule portabilite</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>MSPorta</TableCell>
              <TableCell>DAPI WS</TableCell>
              <TableCell><Chip label="SOAP/XML" size="small" color="warning" variant="soft" /></TableCell>
              <TableCell>ExecuteChangeMSISDNPe / ExecuteResiliationPs</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>SINGLEVIEW</TableCell>
              <TableCell>SINGLEVIEW WS</TableCell>
              <TableCell><Chip label="SOAP/XML" size="small" color="warning" variant="soft" /></TableCell>
              <TableCell>ServiceProvisioning</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <SectionTitle>Endpoints REST des microservices</SectionTitle>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Microservice</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Endpoint</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>MSLine</TableCell>
              <TableCell><code style={{ fontSize: 11 }}>http://172.24.119.36:3002/v1/checkEligibility/msisdn/:msisdn/rio/:rio</code></TableCell>
              <TableCell>Verification d{"'"}eligibilite d{"'"}un MSISDN a la portabilite (controle RIO + MSISDN)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>MSPorta</TableCell>
              <TableCell><code style={{ fontSize: 11 }}>http://172.24.119.36:3003/v1/notifyPorta</code></TableCell>
              <TableCell>Notification de portabilite — appele par DAPI pour signaler une bascule au CRM</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <SectionTitle>Requetes SQL — BDD MasterCRM (table MSISDN)</SectionTitle>

      <InfoCard title="Verification disponibilite en reaffectation" icon="solar:database-bold-duotone" color="#7c3aed">
        <Typography variant="body2" sx={{ mb: 1 }}>
          Apres une bascule, pour verifier si un MSISDN est disponible en reaffectation dans le CRM :
        </Typography>
      </InfoCard>

      <CodeBlock title="Verifier le statut d'un MSISDN dans MasterCRM">
{`-- Sur la BDD CRM (MOBI) cote Digicel
SELECT operation_id, msisdn_no, ST_MSISDN_ID, MSISDN_STATUS, MS_CLASS
FROM MSISDN
WHERE MSISDN_no IN ('0690XXXXXX');

-- MSISDN_STATUS = '7' → reaffectable
-- MS_CLASS = '0' → classe normale Digicel`}
      </CodeBlock>

      <CodeBlock title="Rendre un MSISDN reaffectable (apres validation)">
{`-- MAJ du MSISDN - Statut reaffectable
UPDATE MSISDN
SET ST_MSISDN_ID = '0', MSISDN_STATUS = '7'
WHERE MSISDN_no IN ('0690XXXXXX')
AND MS_CLASS = '0';
COMMIT;`}
      </CodeBlock>
    </>
  );
}

// ─── BDD MasterCRM ──────────────────────────────────────────────────────────

function BddMasterCrmSection() {
  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        La BDD <strong>MasterCRM</strong> est la base centrale du CRM Digicel. Elle stocke les informations clients,
        lignes, offres et facturation. Serveur : <code>vmqprombdb01</code>.
      </Alert>

      <SectionTitle>Table MSISDN — Structure</SectionTitle>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Colonne</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Valeurs cles</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>operation_id</TableCell>
              <TableCell>Identifiant de l{"'"}operation</TableCell>
              <TableCell>—</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>msisdn_no</TableCell>
              <TableCell>Le numero de telephone</TableCell>
              <TableCell><code>0690XXXXXX</code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>ST_MSISDN_ID</TableCell>
              <TableCell>Statut MSISDN (identifiant)</TableCell>
              <TableCell><code>0</code> = libre</TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: 'warning.lighter' }}>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>MSISDN_STATUS</TableCell>
              <TableCell>Statut du MSISDN</TableCell>
              <TableCell><Chip label="7 = reaffectable" size="small" color="success" variant="soft" /></TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: 'info.lighter' }}>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>MS_CLASS</TableCell>
              <TableCell>Classe du MSISDN</TableCell>
              <TableCell><Chip label="0 = classe normale Digicel" size="small" color="primary" variant="soft" /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <SectionTitle>Acces a la base</SectionTitle>

      <InfoCard title="Connexion" icon="solar:database-bold-duotone" color="#7c3aed">
        <Typography variant="body2">
          <strong>Serveur</strong> : vmqprombdb01<br />
          <strong>Type de BDD</strong> : A confirmer (Oracle ? SQL Server ? PostgreSQL ?)<br />
          <strong>Outil</strong> : A confirmer (SQL Developer ? pgAdmin ? SSMS ?)<br />
          <strong>Acces lecture</strong> : A demander a l{"'"}equipe MOBI
        </Typography>
      </InfoCard>

      <SectionTitle>Acces en lecture/ecriture</SectionTitle>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Composant</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Mode d{"'"}acces</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Protocole</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>MSCustomer</TableCell>
              <TableCell>SQL direct</TableCell>
              <TableCell><Chip label="SQL" size="small" variant="soft" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>DCAPI</TableCell>
              <TableCell>SQL direct</TableCell>
              <TableCell><Chip label="SQL" size="small" variant="soft" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>eSIF</TableCell>
              <TableCell>SQL direct</TableCell>
              <TableCell><Chip label="SQL" size="small" variant="soft" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>MSLine</TableCell>
              <TableCell>Via MasterCRM WS</TableCell>
              <TableCell><Chip label="SOAP/XML" size="small" color="warning" variant="soft" /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <SectionTitle>PortaDB vs MasterCRM — Difference</SectionTitle>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
        <InfoCard title="PortaDB" icon="solar:database-bold-duotone" color="#2563eb">
          <Typography variant="body2">
            <strong>Serveur</strong> : vmqproportawebdb01 (172.24.119.68)<br />
            <strong>Contenu</strong> : Mandats de portabilite, etats, tickets, PORTAGE_DATA<br />
            <strong>Usage</strong> : Tout le processus PNM (demandes, accords, bascules)<br />
            <strong>Cle</strong> : <code>PORTAGE_DATA.temporary_msisdn</code>
          </Typography>
        </InfoCard>
        <InfoCard title="MasterCRM DB" icon="solar:database-bold-duotone" color="#7c3aed">
          <Typography variant="body2">
            <strong>Serveur</strong> : vmqprombdb01<br />
            <strong>Contenu</strong> : Clients, lignes, offres, facturation<br />
            <strong>Usage</strong> : CRM operationnel Digicel<br />
            <strong>Cle</strong> : <code>MSISDN.msisdn_no</code>
          </Typography>
        </InfoCard>
      </Box>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <strong>Pas de lien SQL direct</strong> entre PortaDB et MasterCRM (bases sur des serveurs differents).
        Le lien se fait via les WS : DAPI appelle WSMobiMaster qui modifie MasterCRM DB
        en se basant sur les infos de PortaDB.
      </Alert>

      <SectionTitle>Tables a documenter</SectionTitle>
      <Box component="ul" sx={{ pl: 2, '& li': { mb: 1 } }}>
        <li><Typography variant="body2"><Chip label="TODO" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', mr: 1 }} />Table principale &quot;ligne&quot; client (nom, statut ligne, offre)</Typography></li>
        <li><Typography variant="body2"><Chip label="TODO" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', mr: 1 }} />Table &quot;client&quot; (coordonnees, compte)</Typography></li>
        <li><Typography variant="body2"><Chip label="TODO" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', mr: 1 }} />Tables modifiees par ExecuteChangeMSISDNPe</Typography></li>
        <li><Typography variant="body2"><Chip label="TODO" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', mr: 1 }} />Tables modifiees par ExecuteResiliationPs</Typography></li>
        <li><Typography variant="body2"><Chip label="TODO" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', mr: 1 }} />Vues et procedures stockees existantes</Typography></li>
      </Box>
    </>
  );
}

// ─── SoapUI Projets ─────────────────────────────────────────────────────────

function SoapUiSection() {
  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        SoapUI est utilise pour tester les web services SOAP de l{"'"}ecosysteme Porta/MOBI. Voici les projets
        configures et leurs bindings.
      </Alert>

      <SectionTitle>Projets SoapUI configures</SectionTitle>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" width={20} />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="INT" size="small" color="info" variant="soft" />
            <Typography variant="subtitle2">Porta - INT</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            Environnement d{"'"}integration — pour les tests avant mise en production.
          </Typography>
          <Box component="ul" sx={{ pl: 2, '& li': { mb: 0.5 } }}>
            <li><Typography variant="body2">DigicelFwiEsbWs4PortaSoapBinding</Typography></li>
            <li><Typography variant="body2">DigicelFwiEsbWs4USSDSoapBinding</Typography></li>
            <li><Typography variant="body2">DigicelFwiPortaUiWs4EsbSoapBinding</Typography></li>
            <li><Typography variant="body2">DigicelFwiPortaWs4EsbSoapBinding</Typography></li>
            <li><Typography variant="body2">DigicelFwiPortaWs4PortaSyncSoapBinding</Typography></li>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" width={20} />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="PROD" size="small" color="error" variant="soft" />
            <Typography variant="subtitle2">Porta - PROD</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            Environnement de production — memes bindings que INT.
          </Typography>
          <Box component="ul" sx={{ pl: 2, '& li': { mb: 0.5 } }}>
            <li><Typography variant="body2">DigicelFwiEsbWs4PortaSoapBinding</Typography></li>
            <li><Typography variant="body2">DigicelFwiEsbWs4USSDSoapBinding</Typography></li>
            <li><Typography variant="body2">DigicelFwiPortaUiWs4EsbSoapBinding</Typography></li>
            <li><Typography variant="body2">DigicelFwiPortaWs4EsbSoapBinding</Typography></li>
            <li><Typography variant="body2">DigicelFwiPortaWs4PortaSyncSoapBinding</Typography></li>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" width={20} />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="MOBI" size="small" color="warning" variant="soft" />
            <Typography variant="subtitle2">PoleAPP - WSMobiwithGroovy</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Projet MOBI avec scripts Groovy integres pour automatiser certains tests.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" width={20} />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="WSDL" size="small" variant="soft" />
            <Typography variant="subtitle2">WSDL MOBI - INT / PROD</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Box component="ul" sx={{ pl: 2, '& li': { mb: 0.5 } }}>
            <li><Typography variant="body2">WSDL MOBI - INT</Typography></li>
            <li><Typography variant="body2">WSDL MOBI - PROD - 172.24.4.136</Typography></li>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" width={20} />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="PROD" size="small" color="error" variant="soft" />
            <Typography variant="subtitle2">WSMobiMaster - WSProvisioning - PROD</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            <strong>Binding</strong> : BasicHttpBinding_Provisioning — C{"'"}est le WS principal pour toutes les operations CRM (voir onglet "WS Mobi").
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            22 operations disponibles couvrant : portabilite, gestion de lignes, paiements, offres, communications.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </>
  );
}

// ─── Notes & A venir ────────────────────────────────────────────────────────

function NotesSection() {
  return (
    <>
      <Alert severity="warning" sx={{ mb: 3 }}>
        Cette page est en cours de construction. Des informations supplementaires seront ajoutees au fur et a mesure
        de la documentation du systeme MOBI/MasterCRM.
      </Alert>

      <SectionTitle>A documenter</SectionTitle>

      <Box component="ul" sx={{ pl: 2, '& li': { mb: 1 } }}>
        <li>
          <Typography variant="body2">
            <strong>Requetes SOAP</strong> — Exemples complets de requetes/reponses pour <code>ExecuteChangeMSISDNPe</code> et <code>ExecuteResiliationPs</code>
          </Typography>
        </li>
        <li>
          <Typography variant="body2">
            <strong>Logs MOBI</strong> — Ou trouver les logs des traitements CRM et comment les interpreter
          </Typography>
        </li>
        <li>
          <Typography variant="body2">
            <strong>Tables MasterCRM</strong> — Structure des tables principales du CRM liees a la portabilite
          </Typography>
        </li>
        <li>
          <Typography variant="body2">
            <strong>Procedure de relance</strong> — Etapes detaillees pour relancer les bascules non traitees dans le CRM
          </Typography>
        </li>
        <li>
          <Typography variant="body2">
            <strong>Monitoring</strong> — Dashboards et alertes existants pour detecter les incidents CRM
          </Typography>
        </li>
        <li>
          <Typography variant="body2">
            <strong>WSDL details</strong> — Contenu des WSDL MOBI INT et PROD
          </Typography>
        </li>
      </Box>

      <SectionTitle>Sources</SectionTitle>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Source</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Contenu</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>PNMV3-Transfert de co SI App-v4.0_2026.pptx</TableCell>
              <TableCell><Chip label="PowerPoint" size="small" variant="soft" /></TableCell>
              <TableCell>Architecture globale, schemas des flux, infrastructure, scripts</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>SoapUI (local)</TableCell>
              <TableCell><Chip label="Outil" size="small" variant="soft" /></TableCell>
              <TableCell>Projets SOAP Porta INT/PROD + WSMobiMaster</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Echange Frederic Arduin (11/03/2026)</TableCell>
              <TableCell><Chip label="Oral" size="small" variant="soft" /></TableCell>
              <TableCell>Cas pratique #6 — Incident CRM / bascules non traitees</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

// ─── MicroServices ──────────────────────────────────────────────────────────

function MicroServicesSection() {
  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        Cette section documente les 10 endpoints des 3 microservices centraux de l{"'"}architecture KAIZEN/PNM :
        <strong> MS_Line</strong> (gestion des lignes), <strong>MS_Porta</strong> (portabilite) et <strong>MS_Ressources</strong> (referentiel MasterCRM).
        Chaque endpoint est explique de maniere narrative pour comprendre son role, ses interactions et sa logique metier.
      </Alert>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MS_LINE                                                          */}
      {/* ══════════════════════════════════════════════════════════════════ */}

      <SectionTitle>MS_Line — Microservice de gestion des lignes</SectionTitle>

      <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
        <strong>MS_Line</strong> est le microservice central de l{"'"}architecture. Il sert d{"'"}abstraction entre les CRM
        (MasterCRM et KAIZEN) et le reste de l{"'"}ecosysteme PNM. Son role principal est de determiner a quel CRM
        appartient une ligne (via <code>GetLine</code>) et de router les operations vers le bon systeme.
        Il expose 6 endpoints couvrant la consultation, la modification, la resiliation et la notification des lignes.
      </Typography>

      {/* ── GetLine ── */}

      <SubTitle>GET /v1/getLine/msisdn/{'{msisdn}'} — Obtenir les informations d{"'"}une ligne</SubTitle>

      <InfoCard title="Point d'entree pivot" icon="solar:star-bold-duotone" color="#f59e0b">
        <Typography variant="body2">
          <strong>Parametres IN :</strong> MSISDN &nbsp;|&nbsp;
          <strong>Parametres OUT :</strong> Informations ligne, CRM_Owner, Code Error
        </Typography>
      </InfoCard>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        <code>GetLine</code> est l{"'"}endpoint le plus fondamental de toute l{"'"}architecture. Lorsqu{"'"}un autre microservice
        a besoin de savoir a quel CRM appartient un MSISDN, c{"'"}est cet endpoint qu{"'"}il interroge. Le processus suit
        une logique de <strong>fallback</strong> en deux etapes : d{"'"}abord, MS_Line interroge <strong>MasterCRM</strong> via
        l{"'"}appel <code>InfoLine(MSISDN)</code>. Si MasterCRM repond que la ligne est active, les informations sont retournees
        avec <code>CRM_Owner = MasterCRM</code>. Si en revanche la ligne n{"'"}est pas trouvee ou inactive dans MasterCRM,
        MS_Line effectue un second appel vers <strong>KAIZEN</strong> via <code>InfoLine(MSISDN)</code>. Si KAIZEN confirme que
        la ligne est active, les informations sont retournees avec <code>CRM_Owner = KAIZEN</code>. Si aucun des deux CRM
        ne reconnait le MSISDN, une erreur {"\""}Ligne non trouvee{"\""} est generee.
      </Typography>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Ce mecanisme de fallback est essentiel car, durant la periode de transition entre MasterCRM et KAIZEN,
        certaines lignes existent dans l{"'"}un ou l{"'"}autre systeme. <code>GetLine</code> garantit une resolution
        transparente quel que soit le CRM proprietaire.
      </Typography>

      <CodeBlock title="Appels externes">
{`MasterCRM → InfoLine(MSISDN)        // Recherche prioritaire
KAIZEN    → InfoLine(MSISDN)        // Fallback si non trouve dans MasterCRM
Retour    → { informations_ligne, CRM_Owner, code_error }`}
      </CodeBlock>

      <Divider sx={{ my: 3 }} />

      {/* ── GetRIO ── */}

      <SubTitle>GET /v1/getRio/msisdn/{'{msisdn}'} — Obtenir le RIO d{"'"}un MSISDN</SubTitle>

      <InfoCard title="Chaine d'appels" icon="solar:link-bold-duotone" color="#8b5cf6">
        <Typography variant="body2">
          <strong>Parametres IN :</strong> MSISDN &nbsp;|&nbsp;
          <strong>Chaine :</strong> MSLine.GetLine → MSPorta.CalculateRIO
        </Typography>
      </InfoCard>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        L{"'"}obtention du RIO (Releve d{"'"}Identite Operateur) a partir d{"'"}un MSISDN est un processus en deux etapes
        qui illustre bien l{"'"}interdependance des microservices. D{"'"}abord, <code>GetRIO</code> appelle son propre
        microservice <code>MSLine.GetLine(MSISDN)</code> pour recuperer les informations de la ligne : notamment
        le <strong>CustomerType</strong> (type de client : particulier/professionnel), le <strong>CustomerID</strong> (identifiant client)
        et l{"'"}<strong>OperatorID</strong> (identifiant operateur).
      </Typography>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Une fois ces informations obtenues et validees (controle des informations de la ligne), MS_Line appelle
        <code> MSPorta.CalculateRIO(MSISDN, CustomerType, CustomerID, OperatorID)</code>. Ce second appel delegue
        le calcul effectif du RIO au microservice MSPorta, qui utilise l{"'"}outil <strong>XTools</strong> pour generer
        le code RIO selon l{"'"}algorithme reglementaire. Le RIO calcule est ensuite retourne a l{"'"}appelant.
      </Typography>

      <CodeBlock title="Chaine d'appels">
{`MSLine.GetLine(MSISDN)
  → { CustomerType, CustomerID, OperatorID }
MSPorta.CalculateRIO(MSISDN, CustomerType, CustomerID, OperatorID)
  → RIO`}
      </CodeBlock>

      <Divider sx={{ my: 3 }} />

      {/* ── CheckEligibility ── */}

      <SubTitle>GET /v1/checkEligibility/msisdn/{'{msisdn}'}/rio/{'{rio}'} — Verifier l{"'"}eligibilite</SubTitle>

      <InfoCard title="Verification croisee" icon="solar:shield-check-bold-duotone" color="#10b981">
        <Typography variant="body2">
          <strong>Parametres IN :</strong> MSISDN, RIO &nbsp;|&nbsp;
          <strong>Appel :</strong> MSPorta.GetRio(MSISDN) pour comparaison
        </Typography>
      </InfoCard>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Cet endpoint verifie si un MSISDN est eligible a la portabilite en comparant le RIO fourni par le client
        avec le RIO reel calcule par le systeme. Apres validation des parametres d{"'"}entree (MSISDN et RIO),
        MS_Line appelle <code>MSPorta.GetRio(MSISDN)</code> qui retourne le RIO officiel du numero.
      </Typography>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Le systeme compare ensuite le RIO fourni en parametre avec le RIO retourne par MSPorta. Si les deux
        correspondent, le MSISDN est declare <strong>eligible</strong> a la portabilite. Si les RIO different,
        cela signifie que le client a fourni un RIO errone ou obsolete, et la portabilite est refusee.
        L{"'"}etape <code>PostCommand</code> finalise le processus en enregistrant le resultat de la verification.
      </Typography>

      <CodeBlock title="Logique de verification">
{`// Parametres entrants
MSISDN, RIO (fourni par le client)

// Verification
MSPorta.GetRio(MSISDN) → RIO_calcule
Comparaison: RIO_fourni === RIO_calcule ?
  → Eligible / Non eligible
PostCommand → enregistrement du resultat`}
      </CodeBlock>

      <Divider sx={{ my: 3 }} />

      {/* ── ChangeMSISDN ── */}

      <SubTitle>POST /v1/ChangeMSISDN — Changement de MSISDN (provisoire → a porter)</SubTitle>

      <InfoCard title="Routage par CRM Owner" icon="solar:transfer-horizontal-bold-duotone" color="#2563eb">
        <Typography variant="body2">
          <strong>Parametres IN :</strong> MSISDN Provisoire, MSISDN A Porter, Contexte &nbsp;|&nbsp;
          <strong>Pattern :</strong> GetLine → routage CRM
        </Typography>
      </InfoCard>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Cet endpoint est appele lors de la finalisation d{"'"}une portabilite pour remplacer le MSISDN provisoire
        par le MSISDN definitif (le numero que le client souhaitait conserver). C{"'"}est une operation critique
        car elle modifie le numero attache a la ligne dans le CRM proprietaire.
      </Typography>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Le processus commence par determiner quel CRM est proprietaire de la ligne. Pour cela, MS_Line s{"'"}appelle
        lui-meme via <code>GetLine(MSISDN)</code> afin de recuperer le <strong>crmOwner</strong>. Ensuite, selon
        la valeur du crmOwner, l{"'"}operation est routee vers le bon systeme :
      </Typography>

      <Typography component="div" variant="body2" sx={{ mb: 2, lineHeight: 1.8, pl: 2 }}>
        • Si <code>CRMOwner = MasterCRM</code> → appel a <code>MasterCRM.ChangeMSISDN(MSISDN_Provisoire, MSISDN_A_Porter)</code><br />
        • Si <code>CRMOwner = KAIZEN</code> → appel a <code>KAIZEN.ChangeMSISDN(MSISDN_Provisoire, MSISDN_A_Porter)</code><br />
        • Si le crmOwner n{"'"}est ni MasterCRM ni KAIZEN → une erreur est retournee
      </Typography>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Ce pattern de routage par crmOwner est fondamental dans l{"'"}architecture. On le retrouve egalement
        dans l{"'"}endpoint <code>NotifySystem</code>. Il garantit que chaque operation est executee dans le bon CRM,
        quelle que soit la repartition des lignes entre MasterCRM et KAIZEN.
      </Typography>

      <CodeBlock title="Pattern de routage">
{`MSLine.GetLine(MSISDN) → { CRMOwner }

if CRMOwner === "MasterCRM":
    MasterCRM.ChangeMSISDN(MSISDN_Provisoire, MSISDN_A_Porter)
elif CRMOwner === "KAIZEN":
    KAIZEN.ChangeMSISDN(MSISDN_Provisoire, MSISDN_A_Porter)
else:
    → Error`}
      </CodeBlock>

      <Divider sx={{ my: 3 }} />

      {/* ── TerminateLine ── */}

      <SubTitle>POST /v1/terminateLine — Resiliation d{"'"}une ligne dans MasterCRM</SubTitle>

      <InfoCard title="Resiliation + surveillance" icon="solar:close-circle-bold-duotone" color="#ef4444">
        <Typography variant="body2">
          <strong>Parametres IN :</strong> MSISDN, CRM Owner = MasterCRM &nbsp;|&nbsp;
          <strong>Parametres OUT :</strong> Code Error
        </Typography>
      </InfoCard>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Cet endpoint est specifique a <strong>MasterCRM</strong> — il est appele lorsqu{"'"}une ligne doit etre resiliee
        dans le cadre d{"'"}une portabilite sortante (le client quitte Digicel). Apres validation des parametres,
        MS_Line appelle <code>MasterCRM.TerminateLine(MSISDN)</code> pour executer la demande de resiliation.
      </Typography>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Si MasterCRM confirme la prise en compte de la resiliation, MS_Line depose ensuite une demande de surveillance
        aupres de <strong>MS_WatcherMOBI</strong> via <code>WatchLineTermination(MSISDN, requestID)</code>.
        Le WatcherMOBI va alors surveiller periodiquement dans la base MasterCRM (table <code>Send_Actions</code>)
        que la resiliation se termine effectivement. Ce mecanisme de surveillance est necessaire car la resiliation
        dans MasterCRM est un processus <strong>asynchrone</strong> : la demande est deposee puis traitee par batch.
      </Typography>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Si la demande de resiliation echoue (prise en compte = No), aucune surveillance n{"'"}est mise en place
        et un code erreur est retourne directement.
      </Typography>

      <CodeBlock title="Flux de resiliation">
{`MasterCRM.TerminateLine(MSISDN)
  → Prise en compte OK ?
    OUI → MS_WatcherMOBI.WatchLineTermination(MSISDN, requestID)
          // Surveillance asynchrone de la resiliation
    NON → Code Error retourne`}
      </CodeBlock>

      <Divider sx={{ my: 3 }} />

      {/* ── NotifySystem ── */}

      <SubTitle>POST /v1/NotifySystem — Notification d{"'"}un CRM apres un evenement</SubTitle>

      <InfoCard title="Meme pattern que ChangeMSISDN" icon="solar:bell-bold-duotone" color="#06b6d4">
        <Typography variant="body2">
          <strong>Parametres IN :</strong> MSISDN Provisoire, Evenement, Contexte &nbsp;|&nbsp;
          <strong>Pattern :</strong> GetLine → routage CRM
        </Typography>
      </InfoCard>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Cet endpoint notifie le CRM proprietaire d{"'"}une ligne qu{"'"}un evenement s{"'"}est produit (par exemple,
        la fin d{"'"}une portabilite, un changement de statut, etc.). Il suit exactement le <strong>meme pattern
        de routage que ChangeMSISDN</strong> : d{"'"}abord un appel a <code>GetLine(MSISDN)</code> pour determiner
        le crmOwner, puis un routage conditionnel.
      </Typography>

      <Typography component="div" variant="body2" sx={{ mb: 2, lineHeight: 1.8, pl: 2 }}>
        • Si <code>CRMOwner = MasterCRM</code> → <code>MasterCRM.NotifySystem(MSISDN, Event)</code><br />
        • Si <code>CRMOwner = KAIZEN</code> → <code>KAIZEN.NotifySystem(MSISDN, Event)</code><br />
        • Sinon → Code Error
      </Typography>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        La notification permet au CRM de mettre a jour ses propres donnees en fonction de l{"'"}evenement recu.
        Par exemple, apres une portabilite entrante reussie, le CRM est notifie pour actualiser le statut de la ligne.
      </Typography>

      <CodeBlock title="Pattern de notification (identique a ChangeMSISDN)">
{`MSLine.GetLine(MSISDN) → { CRMOwner }

if CRMOwner === "MasterCRM":
    MasterCRM.NotifySystem(MSISDN, Event)
elif CRMOwner === "KAIZEN":
    KAIZEN.NotifySystem(MSISDN, Event)
else:
    → Error`}
      </CodeBlock>

      <Divider sx={{ my: 4 }} />

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MS_PORTA                                                         */}
      {/* ══════════════════════════════════════════════════════════════════ */}

      <SectionTitle>MS_Porta — Microservice de portabilite</SectionTitle>

      <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
        <strong>MS_Porta</strong> gere les operations directement liees a la portabilite des numeros. Il expose 2 endpoints :
        la creation d{"'"}un mandat de portage (qui communique avec la plateforme reglementaire DAPI) et le calcul du RIO
        (via l{"'"}outil XTools). Ce microservice est utilise par MS_Line et par l{"'"}interface PortaWebUI.
      </Typography>

      {/* ── CreatePorta ── */}

      <SubTitle>POST /v1/createPorta — Creation d{"'"}un mandat de portage</SubTitle>

      <InfoCard title="Interface avec DAPI" icon="solar:document-add-bold-duotone" color="#2563eb">
        <Typography variant="body2">
          <strong>Parametres IN :</strong> MSISDN, RIO, MSISDN provisoire, Nom/Prenom, Code PDV &nbsp;|&nbsp;
          <strong>Parametres OUT :</strong> IDPortage, Date Portage
        </Typography>
      </InfoCard>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Cet endpoint cree un mandat de portage officiel aupres de la plateforme reglementaire <strong>DAPI</strong>
        (Dispositif d{"'"}Aide a la Portabilite Inter-operateurs). Lorsqu{"'"}un client souhaite conserver son numero
        en changeant d{"'"}operateur, le conseiller en point de vente fournit toutes les informations necessaires :
        le MSISDN a porter, le RIO du client, le MSISDN provisoire attribue, les coordonnees du client
        (nom, prenom) et le code du point de vente.
      </Typography>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Apres validation de ces parametres, MS_Porta appelle <code>DAPI.CreatePortaParticulier()</code> qui enregistre
        le mandat de portage au niveau reglementaire. La DAPI retourne un <strong>IDPortage</strong> (identifiant unique
        du portage) et une <strong>Date Portage</strong> (date prevue de basculement du numero). L{"'"}etape <code>PostCommand</code>
        finalise le processus en enregistrant ces informations dans la base PNM.
      </Typography>

      <CodeBlock title="Creation du mandat">
{`// Parametres
MSISDN, RIO, MSISDN_provisoire, Nom, Prenom, Code_PDV

// Appel reglementaire
DAPI.CreatePortaParticulier()
  → { IDPortage, DatePortage }

// PostCommand → sauvegarde dans PNM`}
      </CodeBlock>

      <Divider sx={{ my: 3 }} />

      {/* ── CalculateRIO ── */}

      <SubTitle>POST /v1/calculateRio — Calcul du RIO</SubTitle>

      <InfoCard title="Algorithme reglementaire via XTools" icon="solar:calculator-bold-duotone" color="#8b5cf6">
        <Typography variant="body2">
          <strong>Parametres IN :</strong> MSISDN, CustomerType, CustomerID, OperatorID
        </Typography>
      </InfoCard>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Le RIO (Releve d{"'"}Identite Operateur) est un code unique qui identifie de maniere certaine un abonne
        et son operateur. Son calcul suit un algorithme reglementaire defini par l{"'"}ARCEP.
        Cet endpoint recoit les 4 parametres necessaires au calcul : le <strong>MSISDN</strong> du client,
        le <strong>CustomerType</strong> (particulier ou professionnel), le <strong>CustomerID</strong> (identifiant interne du client)
        et l{"'"}<strong>OperatorID</strong> (identifiant de l{"'"}operateur dans le referentiel GPMAG).
      </Typography>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Apres validation des parametres, MS_Porta delegue le calcul a l{"'"}outil <strong>XTools</strong> via
        l{"'"}appel <code>CalculateRIO</code>. XTools applique l{"'"}algorithme reglementaire et retourne le code RIO.
        Cet endpoint est principalement appele par <code>MSLine.GetRIO</code> qui lui fournit les parametres
        obtenus via <code>GetLine</code>.
      </Typography>

      <CodeBlock title="Calcul du RIO">
{`// Parametres
MSISDN, CustomerType, CustomerID, OperatorID

// Delegation
XTools.CalculateRIO(MSISDN, CustomerType, CustomerID, OperatorID)
  → RIO`}
      </CodeBlock>

      <Divider sx={{ my: 4 }} />

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MS_RESSOURCES                                                    */}
      {/* ══════════════════════════════════════════════════════════════════ */}

      <SectionTitle>MS_Ressources — Microservice de synchronisation du referentiel MasterCRM</SectionTitle>

      <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
        <strong>MS_Ressources</strong> assure la synchronisation entre KAIZEN et le referentiel MasterCRM. Lorsqu{"'"}une action
        est effectuee dans KAIZEN (activation de SIM, changement de statut MSISDN), MS_Ressources met a jour
        les tables correspondantes dans la base de donnees MasterCRM. Il expose 2 endpoints qui maintiennent
        la coherence des donnees entre les deux systemes pendant la periode de cohabitation.
      </Typography>

      {/* ── UpdateSimStatus ── */}

      <SubTitle>POST /v1/UpdateSimStatus — Mise a jour du statut SIM</SubTitle>

      <InfoCard title="Synchronisation SIM" icon="solar:sim-card-bold-duotone" color="#10b981">
        <Typography variant="body2">
          <strong>Parametres IN :</strong> Order ID, SIM, SimStatus (Active/Inactive)
        </Typography>
      </InfoCard>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Cet endpoint met a jour le statut d{"'"}une carte SIM dans le referentiel MasterCRM suite a une action
        effectuee depuis KAIZEN. Lorsqu{"'"}un conseiller active ou desactive une SIM dans KAIZEN, cette modification
        doit etre repercutee dans MasterCRM pour maintenir la coherence du referentiel.
      </Typography>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Apres validation des parametres, le systeme verifie que le <code>SimStatus</code> est une valeur autorisee
        (<code>Active</code> ou <code>Inactive</code>). Si la valeur est valide, MS_Ressources execute un
        <code> UPDATE</code> sur la <strong>Table SIM</strong> de la base de donnees MasterCRM. Si le statut fourni
        n{"'"}est ni Active ni Inactive, l{"'"}operation est refusee et un code erreur est retourne.
      </Typography>

      <CodeBlock title="Mise a jour SIM">
{`// Validation
SimStatus ∈ { "Active", "Inactive" } ?
  OUI → UPDATE Table SIM SET Status = SimStatus WHERE SIM = :sim
  NON → Code Error`}
      </CodeBlock>

      <Divider sx={{ my: 3 }} />

      {/* ── UpdateMSISDNStatus ── */}

      <SubTitle>POST /v1/UpdateMSISDNStatus — Mise a jour du statut MSISDN + notification P1</SubTitle>

      <InfoCard title="Synchronisation MSISDN + evenement VAS" icon="solar:phone-bold-duotone" color="#f59e0b">
        <Typography variant="body2">
          <strong>Parametres IN :</strong> MSISDN, Status (Assigned/Released), PortedOut (Boolean)
        </Typography>
      </InfoCard>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Cet endpoint est plus complexe que <code>UpdateSimStatus</code> car, en plus de mettre a jour le referentiel
        MasterCRM, il declenche des evenements aupres du systeme VAS <strong>P1</strong>. Deux scenarios sont possibles
        selon la valeur du parametre <code>Status</code> :
      </Typography>

      <Typography component="div" variant="body2" sx={{ mb: 2, lineHeight: 1.8, pl: 2 }}>
        • <strong>Status = Assigned</strong> : le MSISDN est marque comme attribue dans la base MasterCRM
        (<code>UPDATE MSISDN Status = Assigned</code>). En parallele, P1 enregistre un evenement
        <code> RegisterEvent(Line_Terminate, MSISDN)</code>. Cela peut paraitre contre-intuitif, mais dans le contexte
        de la portabilite, {"\""}assigner{"\""} un MSISDN provisoire implique de {"\""}terminer{"\""} l{"'"}ancienne ligne associee
        a ce numero dans le systeme VAS.<br /><br />

        • <strong>Status = Released</strong> : le MSISDN est marque comme libere dans MasterCRM
        (<code>UPDATE MSISDN Status = Released</code>). P1 enregistre alors un evenement
        <code> RegisterEvent(Line_Activate, MSISDN)</code>. Le numero libere redevient disponible pour une nouvelle
        attribution, et l{"'"}evenement Line_Activate permet au systeme VAS de preparer les services pour ce numero.
      </Typography>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Le parametre <code>PortedOut</code> (Boolean) indique si le MSISDN est un numero porte vers un autre operateur.
        Si le statut n{"'"}est ni Assigned ni Released, aucune action n{"'"}est effectuee et un code erreur est retourne.
      </Typography>

      <CodeBlock title="Logique de mise a jour">
{`if Status === "Assigned":
    BDD MasterCRM → UPDATE MSISDN Status = Assigned
    P1 → RegisterEvent(Line_Terminate, MSISDN)

elif Status === "Released":
    BDD MasterCRM → UPDATE MSISDN Status = Released
    P1 → RegisterEvent(Line_Activate, MSISDN)

else:
    → Code Error`}
      </CodeBlock>

      <Divider sx={{ my: 4 }} />

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TABLEAU RECAPITULATIF                                            */}
      {/* ══════════════════════════════════════════════════════════════════ */}

      <SectionTitle>Tableau recapitulatif des 10 endpoints</SectionTitle>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Microservice</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Endpoint</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Methode</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Systemes appeles</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell rowSpan={6}><Chip label="MS_Line" size="small" color="primary" /></TableCell>
              <TableCell><code>/v1/getLine</code></TableCell>
              <TableCell>GET</TableCell>
              <TableCell>Infos ligne + CRM Owner</TableCell>
              <TableCell>MasterCRM, KAIZEN (fallback)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>/v1/getRio</code></TableCell>
              <TableCell>GET</TableCell>
              <TableCell>Obtenir le RIO</TableCell>
              <TableCell>MSLine.GetLine → MSPorta.CalculateRIO</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>/v1/checkEligibility</code></TableCell>
              <TableCell>GET</TableCell>
              <TableCell>Eligibilite MSISDN/RIO</TableCell>
              <TableCell>MSPorta.GetRio</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>/v1/ChangeMSISDN</code></TableCell>
              <TableCell>POST</TableCell>
              <TableCell>Changement MSISDN</TableCell>
              <TableCell>GetLine → MasterCRM ou KAIZEN</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>/v1/terminateLine</code></TableCell>
              <TableCell>POST</TableCell>
              <TableCell>Resiliation ligne</TableCell>
              <TableCell>MasterCRM, MS_WatcherMOBI</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>/v1/NotifySystem</code></TableCell>
              <TableCell>POST</TableCell>
              <TableCell>Notification CRM</TableCell>
              <TableCell>GetLine → MasterCRM ou KAIZEN</TableCell>
            </TableRow>
            <TableRow>
              <TableCell rowSpan={2}><Chip label="MS_Porta" size="small" color="secondary" /></TableCell>
              <TableCell><code>/v1/createPorta</code></TableCell>
              <TableCell>POST</TableCell>
              <TableCell>Creer mandat portage</TableCell>
              <TableCell>DAPI</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>/v1/calculateRio</code></TableCell>
              <TableCell>POST</TableCell>
              <TableCell>Calculer le RIO</TableCell>
              <TableCell>XTools</TableCell>
            </TableRow>
            <TableRow>
              <TableCell rowSpan={2}><Chip label="MS_Ressources" size="small" color="warning" /></TableCell>
              <TableCell><code>/v1/UpdateSimStatus</code></TableCell>
              <TableCell>POST</TableCell>
              <TableCell>MAJ statut SIM</TableCell>
              <TableCell>BDD MasterCRM</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>/v1/UpdateMSISDNStatus</code></TableCell>
              <TableCell>POST</TableCell>
              <TableCell>MAJ statut MSISDN</TableCell>
              <TableCell>BDD MasterCRM, P1 [VAS]</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Alert severity="warning" sx={{ mt: 3 }}>
        <strong>Pattern cle a retenir :</strong> les endpoints <code>ChangeMSISDN</code> et <code>NotifySystem</code>
        utilisent le meme pattern de routage : appel a <code>GetLine()</code> pour determiner le <code>crmOwner</code>,
        puis redirection vers MasterCRM ou KAIZEN. Ce pattern est central dans la cohabitation des deux CRM.
      </Alert>
    </>
  );
}

// ─── Flux KAIZEN ─────────────────────────────────────────────────────────────

function FluxKaizenSection() {
  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        Cette section documente en detail les 4 flux de portabilite KAIZEN, issus des diagrammes de sequence officiels.
        Chaque etape est expliquee de maniere narrative pour faciliter la comprehension du processus complet.
      </Alert>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* FLUX 1 — EXTERNE ENTRANTE                                        */}
      {/* ══════════════════════════════════════════════════════════════════ */}

      <SectionTitle>Flux 1 — Portabilite Externe Entrante (GPMAG → Digicel/KAIZEN)</SectionTitle>

      <InfoCard title="Contexte du flux" icon="solar:info-circle-bold-duotone" color="#2563eb">
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
          crmOwner=n/a &nbsp;|&nbsp; crmRequestor=KAIZEN &nbsp;|&nbsp; portaDirection=In &nbsp;|&nbsp; portaType=External
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          <strong>Acteurs :</strong> PortaWebUI, PortaWs, MS Porta, KAIZEN, MS Ressources [MasterCRM], P1 [VAS]
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Ce flux decrit le parcours complet lorsqu{"'"}un client d{"'"}un operateur externe du GPMAG (Orange, Free, SFR...)
          souhaite rejoindre Digicel via le CRM KAIZEN.
        </Typography>
      </InfoCard>

      <SubTitle>Etape 1 — Activation dans KAIZEN</SubTitle>
      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Le processus demarre lorsqu{"'"}un client d{"'"}un autre operateur du GPMAG souhaite rejoindre Digicel.
        Le conseiller en point de vente active une nouvelle ligne dans KAIZEN en saisissant un <strong>MSISDN provisoire</strong> (numero
        temporaire attribue au client), le <strong>MSISDN a porter</strong> (le numero que le client souhaite conserver)
        et le <strong>RIO</strong> (Releve d{"'"}Identite Operateur, obtenu aupres de l{"'"}operateur donneur via le code USSD).
        Ce mandat de portage contient egalement le nom, prenom du client et le code du point de vente.
      </Typography>

      <SubTitle>Etape 2 — Reservation du MSISDN provisoire</SubTitle>
      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Des que l{"'"}activation est lancee, le microservice <strong>MS_Ressources</strong> (qui gere le referentiel MasterCRM)
        est appele pour marquer le MSISDN provisoire comme <code>Assigned</code> avec <code>PortedOut=false</code>.
        Cela reserve le numero provisoire dans le CRM et empeche qu{"'"}il soit attribue a un autre client.
        En parallele, le systeme VAS <strong>P1</strong> enregistre un evenement <code>Line_Terminate</code> sur le MSISDN provisoire
        pour preparer le terrain, et MS_Ressources active la SIM associee via <code>UpdateSimStatus(Sim, Active)</code>.
      </Typography>

      <SubTitle>Etape 3 — Creation du portage dans PNM V3</SubTitle>
      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        L{"'"}interface <strong>PortaWebUI</strong> appelle <code>PortaUI / CreatePortaParticulier</code> sans contexte
        specifique. Cet appel est relaye vers <strong>MS Porta</strong> qui cree le portage dans la base PNM via <code>CreatePortaGP</code>.
        Un objet <strong>Portage</strong> est cree avec un ID unique (IDPortage), le MSISDN, le MSISDN provisoire, le RIO,
        la date de portage, l{"'"}operateur donneur et l{"'"}operateur receveur.
      </Typography>

      <SubTitle>Etape 4 — Enrichissement du contexte</SubTitle>
      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        <strong>PortaWS</strong> appelle ensuite <code>BindPorta</code> pour enrichir le contexte du portage avec les
        informations KAIZEN : <code>crmOwner=n/a</code> (le client ne vient pas du CRM Digicel), <code>crmRequestor=KAIZEN</code>
        (c{"'"}est KAIZEN qui a initie la demande), <code>portaDirection=In</code> (portabilite entrante) et <code>portaType=External</code>
        (le numero vient d{"'"}un operateur externe). Ce contexte sera transmis a chaque etape suivante pour que
        chaque microservice sache comment traiter le portage.
      </Typography>

      <SubTitle>Etape 5 — Echanges inter-operateurs PNM V3</SubTitle>
      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Le processus PNM V3 prend le relais pour gerer les echanges avec l{"'"}operateur donneur : envoi du ticket 1110
        (demande de portage), reception du ticket 1210 (accord) ou 1220 (refus), echanges de fichiers PNMDATA via SFTP.
        Cette phase dure en general <strong>J+2 a J+3 jours ouvres</strong> avant la bascule effective.
      </Typography>

      <SubTitle>Etape 6 — Bascule (J+2/3)</SubTitle>
      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Le jour de la bascule, PNM V3 declenche le processus. <strong>MS Porta</strong> appelle <code>NotifyPorta</code> en transmettant
        l{"'"}IDPortage, le MSISDN provisoire, le MSISDN a porter, le RIO, le statut et le contexte complet.
        KAIZEN recoit cette notification via <code>KAIZEN / NotifyPorta</code> et effectue son traitement interne
        pour finaliser l{"'"}activation de la ligne avec le numero porte.
      </Typography>

      <SubTitle>Etape 7 — Mise a jour finale des ressources</SubTitle>
      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Une fois la bascule reussie, plusieurs mises a jour sont effectuees dans l{"'"}ordre :
        le MSISDN a porter est marque comme <code>Assigned, PortedOut=false</code> dans MS_Ressources (il appartient
        desormais a Digicel), P1 enregistre un <code>Line_Terminate</code> sur le MSISDN a porter,
        puis le MSISDN provisoire est libere (<code>Released, PortedOut=false</code>) car il n{"'"}est plus necessaire,
        et P1 enregistre un <code>Line_Activate</code> sur le MSISDN provisoire pour finaliser la transition dans le VAS.
      </Typography>

      <CodeBlock title="Appels API cles — Externe Entrante">
{`// Reservation
MS_Ressources / UpdateMsisdnStatus(MSISDN Provisoire, Assigned, PortedOut=false)
MS_Ressources / UpdateSimStatus(Sim, Active)

// Creation portage
PortaUI / CreatePortaParticulier → MS Porta / CreatePortaGP
PortaWS / BindPorta (enrichissement contexte)

// Post-bascule
KAIZEN / NotifyPorta(IDPortage, MSISDN a porter, MandateStatus, MandateComment, Contexte)
MS_Ressources / UpdateMsisdnStatus(MSISDN a porter, Assigned, PortedOut=false)
MS_Ressources / UpdateMsisdnStatus(MSISDN Provisoire, Released, PortedOut=false)`}
      </CodeBlock>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* FLUX 2 — EXTERNE SORTANTE                                        */}
      {/* ══════════════════════════════════════════════════════════════════ */}

      <SectionTitle>Flux 2 — Portabilite Externe Sortante (Digicel/KAIZEN → GPMAG)</SectionTitle>

      <InfoCard title="Contexte du flux" icon="solar:info-circle-bold-duotone" color="#2563eb">
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
          crmOwner=KAIZEN &nbsp;|&nbsp; crmRequestor=n/a &nbsp;|&nbsp; portaDirection=Out &nbsp;|&nbsp; portaType=External
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          <strong>Acteurs :</strong> Systeme Externe (PDV GPMAG), PortaWs, KAIZEN, MS_Ressources, MS_Line, MS_Porta, P1 [VAS]
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Ce flux decrit le parcours lorsqu{"'"}un client Digicel (gere dans KAIZEN) souhaite quitter Digicel
          pour un autre operateur du GPMAG.
        </Typography>
      </InfoCard>

      <SubTitle>Etape 1 — Declenchement par le client</SubTitle>
      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Le processus est declenche lorsque le client Digicel/KAIZEN se rend dans un point de vente d{"'"}un autre
        operateur du GPMAG et demande la portabilite de son numero. Le systeme externe appelle le code USSD
        Digicel <code>#317#</code> pour obtenir le RIO du client. Cet appel transite par l{"'"}ESB qui
        interroge <code>MS_Line / getRio(MSISDN)</code> et en parallele <code>KAIZEN / GetRio()</code> pour
        recuperer le Releve d{"'"}Identite Operateur du client.
      </Typography>

      <SubTitle>Etape 2 — Verification d{"'"}eligibilite</SubTitle>
      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Avant de lancer le portage, le systeme verifie que le MSISDN est eligible au portage via
        <code> MS_Line / CheckEligibility(MSISDN, RIO)</code>. Cette verification controle notamment que le numero
        n{"'"}est pas deja en cours de portage, qu{"'"}il n{"'"}est pas suspendu, et que le RIO est valide.
        KAIZEN est de nouveau sollicite via <code>GetRio()</code> pour confirmer la coherence des informations.
      </Typography>

      <SubTitle>Etape 3 — Echanges PNM V3 et notification</SubTitle>
      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Si l{"'"}eligibilite est confirmee, le processus PNM V3 demarre les echanges inter-operateurs.
        Un ticket 1110 (demande de portage) est emis par l{"'"}operateur receveur. <strong>MS Porta</strong> notifie
        ensuite KAIZEN via <code>NotifyPorta(IDPortage, MSISDN a porter, RIO, Status)</code> pour l{"'"}informer
        qu{"'"}une demande de portage sortant a ete deposee pour ce client.
        KAIZEN recoit la notification via <code>Notify(IDPortage, MSISDN a porter, MandateStatus, MandateComment)</code>
        et effectue son traitement interne, notamment la modification du statut de la ligne dans son systeme.
      </Typography>

      <SubTitle>Etape 4 — Liaison du portage au contexte KAIZEN</SubTitle>
      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        <strong>PortaWs</strong> appelle <code>BindPorta(IDPortage, Contexte)</code> pour associer le portage
        au contexte KAIZEN : <code>crmOwner=KAIZEN</code> (le client appartient a KAIZEN), <code>crmRequestor=n/a</code>
        (la demande ne vient pas du CRM Digicel mais de l{"'"}exterieur), <code>portaDirection=Out</code> et <code>portaType=External</code>.
        Ce contexte permet aux microservices en aval de savoir que c{"'"}est un depart client KAIZEN vers l{"'"}exterieur.
      </Typography>

      <SubTitle>Etape 5 — Bascule (J+2/3)</SubTitle>
      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Le jour de la bascule, PNM V3 declenche le processus via <code>Bascule()</code>.
        <strong> MS Porta</strong> notifie a nouveau KAIZEN avec le statut final. KAIZEN effectue son traitement
        interne de cloture du client.
      </Typography>

      <SubTitle>Etape 6 — Liberation des ressources</SubTitle>
      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Apres la bascule, les ressources Digicel sont liberees : le MSISDN est marque comme
        <code> Released, PortedOut=True</code> dans MS_Ressources (le numero a ete porte vers un autre operateur),
        P1 enregistre un <code>Line_Activate</code> sur le MSISDN (evenement VAS de fin),
        et la SIM est desactivee via <code>UpdateSimStatus(Sim, Inactive)</code>.
        Le client n{"'"}est plus gere par Digicel.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Variante GetLine :</strong> il existe une variante de ce flux ou les appels <code>KAIZEN / GetRio()</code> sont
        remplaces par <code>KAIZEN / GetLine()</code>. Le reste du flux est strictement identique.
        La difference porte uniquement sur la methode utilisee par KAIZEN pour recuperer les informations
        de la ligne du client (GetRio renvoie le RIO, GetLine renvoie les details complets de la ligne).
      </Alert>

      <CodeBlock title="Appels API cles — Externe Sortante">
{`// Obtention RIO et eligibilite
ESB / GetRIO → MS_Line / getRio(MSISDN) + KAIZEN / GetRio()
MS_Line / CheckEligibility(MSISDN, RIO)

// Notification et liaison contexte
MS Porta / NotifyPorta(IDPortage, MSISDN a porter, RIO, Status)
KAIZEN / Notify(IDPortage, MSISDN a porter, MandateStatus, MandateComment)
PortaWs / BindPorta(IDPortage, Contexte)

// Post-bascule — liberation
MS_Ressources / UpdateMsisdnStatus(MSISDN, Released, PortedOut=True)
MS_Ressources / UpdateSimStatus(Sim, Inactive)`}
      </CodeBlock>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* FLUX 3 — INTERNE ENTRANTE                                        */}
      {/* ══════════════════════════════════════════════════════════════════ */}

      <SectionTitle>Flux 3 — Portabilite Interne Entrante (MasterCRM → KAIZEN)</SectionTitle>

      <InfoCard title="Contexte du flux" icon="solar:info-circle-bold-duotone" color="#2563eb">
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
          Initial : crmOwner=n/a &nbsp;|&nbsp; crmRequestor=KAIZEN &nbsp;|&nbsp; portaDirection=In &nbsp;|&nbsp; portaType=n/a
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12, mt: 0.5 }}>
          Enrichi apres CheckEligibility : crmOwner=MasterCRM
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          <strong>Acteurs :</strong> MS Porta, KAIZEN, MS_Ressources, MasterCRM, MS_Line, MS_WatcherMOBI, P1 [VAS]
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Ce flux est specifique aux portages <strong>internes a Digicel</strong> : un client deja chez Digicel mais gere
          dans le CRM MasterCRM souhaite migrer vers le CRM KAIZEN. Il n{"'"}y a pas d{"'"}echange inter-operateurs PNM V3,
          mais les microservices internes orchestrent la migration entre les deux CRM.
        </Typography>
      </InfoCard>

      <SubTitle>Etape 1 — Activation dans KAIZEN</SubTitle>
      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Le processus demarre dans KAIZEN lorsque le conseiller en point de vente saisit un MSISDN provisoire
        ainsi que le MSISDN Digicel du client (son numero actuel) et son RIO Digicel. Le mandat de portage
        est constitue avec ces informations, le nom/prenom du client, le code du point de vente et le code postal.
        Le contexte initial est <code>crmOwner=n/a</code> (pas encore determine), <code>crmRequestor=KAIZEN</code>,
        <code> portaDirection=In</code> et <code>portaType=n/a</code> (ce n{"'"}est pas un portage externe).
      </Typography>

      <SubTitle>Etape 2 — Reservation du MSISDN provisoire</SubTitle>
      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Comme pour le flux externe entrante, <strong>MS_Ressources</strong> reserve le MSISDN provisoire en le marquant
        <code> Assigned, Ported=false</code>. Le systeme VAS P1 enregistre un evenement <code>Line_Terminate</code>
        sur le MSISDN provisoire, et la SIM est activee via <code>UpdateSimStatus(Sim, Active)</code>.
      </Typography>

      <SubTitle>Etape 3 — Creation du portage et verification d{"'"}eligibilite</SubTitle>
      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        <strong>MS Porta</strong> cree le portage via <code>CreatePortaGP</code> avec le mandat et le contexte initial.
        Ensuite, <code>MS Line / CheckEligibility(MSISDN Digicel, RIO Digicel)</code> est appele pour verifier que
        le numero du client est eligible. MS_Line appelle egalement <code>GetRio()</code> pour valider le RIO.
      </Typography>

      <SubTitle>Etape 4 — Enrichissement du contexte et identification du CRM source</SubTitle>
      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        C{"'"}est une etape cruciale propre au portage interne. Le retour de <code>CheckEligibility()</code> permet
        au systeme d{"'"}identifier que le MSISDN Digicel du client est actuellement gere dans <strong>MasterCRM</strong>.
        Le contexte est alors enrichi : <code>crmOwner</code> passe de <code>n/a</code> a <code>MasterCRM</code>.
        Cette information est essentielle car elle determine quel CRM doit effectuer la resiliation de la ligne.
      </Typography>

      <SubTitle>Etape 5 — Resiliation dans MasterCRM</SubTitle>
      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        <strong>MS Line</strong> appelle <code>TerminateLinePorta(MSISDN Digicel, contexte)</code> pour declencher
        la resiliation de la ligne dans MasterCRM. Le contexte transmis contient <code>crmOwner=MasterCRM</code>
        et <code>crmRequestor=KAIZEN</code>, ce qui indique a MasterCRM que c{"'"}est KAIZEN qui recupere le client.
        MasterCRM recoit la demande de resiliation et la traite.
      </Typography>

      <SubTitle>Etape 6 — Surveillance MOBI et verification CRM</SubTitle>
      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Le microservice <strong>MS_WatcherMOBI</strong> est sollicite pour surveiller le traitement de la resiliation
        dans MasterCRM. Il recoit le MSISDN Digicel, le contexte complet et une URL de callback. En interne,
        il execute la requete SQL MOBI <code>Select RL, Status from Send_Actions</code> pour verifier que
        la resiliation a bien ete prise en compte par le CRM MasterCRM. Cette etape est importante car elle
        assure que la migration CRM est effective avant de finaliser le portage.
      </Typography>

      <SubTitle>Etape 7 — Notification KAIZEN et finalisation</SubTitle>
      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Une fois la resiliation confirmee dans MasterCRM, KAIZEN est notifie via
        <code> Notify(MSISDN Digicel, MandateStatus, MandateComment, Contexte)</code>.
        Les ressources sont ensuite mises a jour : le MSISDN provisoire est libere
        (<code>Released, PortedOut=False</code>), P1 enregistre un <code>Line_Activate</code> sur le MSISDN provisoire,
        le MSISDN Digicel du client est marque comme <code>Assigned, PortedOut=false</code>
        (il reste chez Digicel mais passe sous KAIZEN), et P1 enregistre un <code>Line_Terminate</code>
        sur le MSISDN Digicel pour finaliser la transition VAS.
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <strong>Difference cle avec le portage externe :</strong> dans un portage interne, il n{"'"}y a pas d{"'"}echange
        de fichiers PNMDATA ni de tickets 1110/1210 inter-operateurs. Tout se passe en interne entre les microservices
        Digicel. La complexite reside dans la coordination entre les deux CRM (MasterCRM et KAIZEN) et la surveillance
        via MS_WatcherMOBI.
      </Alert>

      <CodeBlock title="Appels API cles — Interne Entrante">
{`// Reservation
MS_Ressources / UpdateMsisdnStatus(MSISDN Provisoire, Assigned, Ported=false)
MS_Ressources / UpdateSimStatus(Sim, Active)

// Creation et eligibilite
MS Porta / CreatePortaGP (mandat portage + contexte initial)
MS Line / CheckEligibility(MSISDN Digicel, RIO Digicel) → GetRio()

// Enrichissement contexte → crmOwner = MasterCRM
MS Line / TerminateLinePorta(MSISDN Digicel, contexte(crmOwner=MasterCRM, crmRequestor=KAIZEN))

// Surveillance CRM
MS WatcherMOBI / (MSISDN Digicel, contexte, URLCallBack)
  → SQL: Select RL, Status from Send_Actions

// Finalisation
KAIZEN / Notify(MSISDN Digicel, MandateStatus, MandateComment, Contexte)
MS_Ressources / UpdateMsisdnStatus(MSISDN Provisoire, Released, PortedOut=False)
MS_Ressources / UpdateMsisdnStatus(MSISDN Digicel, Assigned, PortedOut=false)`}
      </CodeBlock>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TABLEAU RECAPITULATIF                                            */}
      {/* ══════════════════════════════════════════════════════════════════ */}

      <SectionTitle>Tableau recapitulatif des contextes KAIZEN</SectionTitle>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        Le contexte est l{"'"}element central qui permet a chaque microservice de savoir comment traiter le portage.
        Il est constitue de 4 champs qui definissent la nature et la direction du portage :
      </Typography>

      <TableContainer sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Flux</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>crmOwner</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>crmRequestor</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>portaDirection</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>portaType</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Externe Entrante</TableCell>
              <TableCell><code>n/a</code></TableCell>
              <TableCell><code>KAIZEN</code></TableCell>
              <TableCell><code>In</code></TableCell>
              <TableCell><code>External</code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Externe Sortante</TableCell>
              <TableCell><code>KAIZEN</code></TableCell>
              <TableCell><code>n/a</code></TableCell>
              <TableCell><code>Out</code></TableCell>
              <TableCell><code>External</code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Interne Entrante</TableCell>
              <TableCell><code>MasterCRM</code> (enrichi)</TableCell>
              <TableCell><code>KAIZEN</code></TableCell>
              <TableCell><code>In</code></TableCell>
              <TableCell><code>n/a</code></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        <strong>crmOwner</strong> designe le CRM qui gere actuellement le client. Pour un portage entrant depuis
        l{"'"}exterieur, il vaut <code>n/a</code> car le client n{"'"}est pas encore chez Digicel. Pour un portage sortant,
        il vaut <code>KAIZEN</code> car le client part de KAIZEN. Pour un portage interne, il est enrichi
        dynamiquement a <code>MasterCRM</code> apres verification d{"'"}eligibilite.
      </Typography>

      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
        <strong>crmRequestor</strong> designe le CRM qui a initie la demande de portage. Dans les flux entrants,
        c{"'"}est toujours <code>KAIZEN</code> qui demande. Dans les flux sortants, la demande vient de l{"'"}exterieur
        donc il vaut <code>n/a</code>.
      </Typography>

      <Alert severity="warning" sx={{ mt: 2 }}>
        <strong>Note :</strong> le flux <strong>Porta Interne Sortante</strong> (KAIZEN → MasterCRM) n{"'"}est pas encore
        documente. Il correspondrait au cas inverse du Flux 3 : un client KAIZEN qui souhaite migrer vers MasterCRM.
      </Alert>
    </>
  );
}

// ─── Section tabs ───────────────────────────────────────────────────────────

const SECTIONS: DocSection[] = [
  {
    id: 'architecture',
    title: 'Architecture ESB',
    icon: 'solar:server-bold-duotone',
    content: <ArchitectureSection />,
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure',
    icon: 'solar:server-square-cloud-bold-duotone',
    content: <InfrastructureSection />,
  },
  {
    id: 'ws-mobi',
    title: 'WS Mobi',
    icon: 'solar:code-bold-duotone',
    content: <WsMobiSection />,
  },
  {
    id: 'interaction-pnm',
    title: 'PNM ↔ MOBI',
    icon: 'solar:transfer-horizontal-bold-duotone',
    content: <InteractionPnmMobiSection />,
  },
  {
    id: 'flux-kaizen',
    title: 'Flux KAIZEN',
    icon: 'solar:routing-bold-duotone',
    content: <FluxKaizenSection />,
  },
  {
    id: 'microservices',
    title: 'MicroServices',
    icon: 'solar:cpu-bolt-bold-duotone',
    content: <MicroServicesSection />,
  },
  {
    id: 'bdd',
    title: 'BDD MasterCRM',
    icon: 'solar:database-bold-duotone',
    content: <BddMasterCrmSection />,
  },
  {
    id: 'soapui',
    title: 'SoapUI',
    icon: 'solar:test-tube-bold-duotone',
    content: <SoapUiSection />,
  },
  {
    id: 'notes',
    title: 'Notes & A venir',
    icon: 'solar:notes-bold-duotone',
    content: <NotesSection />,
  },
];

// ─── Main page ──────────────────────────────────────────────────────────────

export default function MobiCrm() {
  const [tab, setTab] = useState(0);

  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  }, []);

  return (
    <DashboardLayout>
      <Head title="MOBI / MasterCRM" />

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1200, mx: 'auto' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
          <Iconify icon="solar:server-bold-duotone" width={32} sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              MOBI / MasterCRM
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Documentation du CRM Digicel et de son integration avec le systeme PNM V3
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
