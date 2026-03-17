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

// ─── Flux KAIZEN ─────────────────────────────────────────────────────────────

function FluxKaizenSection() {
  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        Cette section documente les 4 flux de portabilite KAIZEN issus des diagrammes de sequence PDF.
        Chaque flux decrit les interactions entre KAIZEN, les microservices PNM et le CRM.
      </Alert>

      {/* ── Flow 1: Externe Entrante ─────────────────────────────────────── */}

      <SectionTitle>Flux 1 — Portabilite Externe Entrante (GPMAG → Digicel/KAIZEN)</SectionTitle>

      <InfoCard title="Contexte" icon="solar:info-circle-bold-duotone" color="#2563eb">
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
          crmOwner=n/a &nbsp;|&nbsp; crmRequestor=KAIZEN &nbsp;|&nbsp; portaDirection=In &nbsp;|&nbsp; portaType=External
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          <strong>Acteurs :</strong> PortaWebUI, PortaWs, MS Porta, KAIZEN, MS Ressources [MasterCRM], P1 [VAS]
        </Typography>
      </InfoCard>

      <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 2, mb: 3, fontFamily: 'monospace', fontSize: 12, lineHeight: 2 }}>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
          <strong>1.</strong> Activation KAIZEN — saisie MSISDN provisoire + MSISDN a porter + RIO<br />
          <strong>2.</strong> <code>MS_Ressources / UpdateMsisdnStatus(MSISDN Provisoire, Assigned, PortedOut=false)</code><br />
          <strong>3.</strong> <code>P1 / registerEvent(Line_Terminate, MSISDN Provisoire)</code><br />
          <strong>4.</strong> <code>MS_Ressources / UpdateSimStatus(Sim, Active)</code><br />
          <strong>5.</strong> <code>PortaUI / CreatePortaParticulier</code> (sans contexte) → <code>MS Porta / CreatePortaGP</code><br />
          <strong>6.</strong> <code>PortaWS / BindPorta</code> → enrichissement contexte<br />
          <strong>7.</strong> PNMV3 echanges inter-operateurs<br />
          <strong>8.</strong> Bascule J+2/3 — <code>MS Porta / NotifyPorta(IDPortage, MSISDN provisoire, MSISDN a porter, RIO, Statut, Contexte)</code><br />
          <strong>9.</strong> <code>KAIZEN / NotifyPorta(IDPortage, MSISDN a porter, MandateStatus, MandateComment, Contexte)</code> → traitement interne<br />
          <strong>10.</strong> <code>MS_Ressources / UpdateMsisdnStatus(MSISDN a porter, Assigned, PortedOut=false)</code><br />
          <strong>11.</strong> <code>P1 / registerEvent(Line_Terminate, MSISDN a porter)</code><br />
          <strong>12.</strong> <code>MS_Ressources / UpdateMsisdnStatus(MSISDN Provisoire, Released, PortedOut=false)</code><br />
          <strong>13.</strong> <code>P1 / registerEvent(Line_Activate, MSISDN provisoire)</code>
        </Typography>
      </Box>

      <CodeBlock title="Appels cles — Externe Entrante">
{`MS_Ressources / UpdateMsisdnStatus(MSISDN Provisoire, Assigned, PortedOut=false)
MS_Ressources / UpdateSimStatus(Sim, Active)
PortaUI / CreatePortaParticulier → MS Porta / CreatePortaGP
PortaWS / BindPorta
MS Porta / NotifyPorta(IDPortage, MSISDN provisoire, MSISDN a porter, RIO, Statut, Contexte)
KAIZEN / NotifyPorta(IDPortage, MSISDN a porter, MandateStatus, MandateComment, Contexte)
P1 / registerEvent(Line_Terminate | Line_Activate, MSISDN)`}
      </CodeBlock>

      {/* ── Flow 2: Externe Sortante ─────────────────────────────────────── */}

      <SectionTitle>Flux 2 — Portabilite Externe Sortante (Digicel/KAIZEN → GPMAG) — via GetRio</SectionTitle>

      <InfoCard title="Contexte" icon="solar:info-circle-bold-duotone" color="#2563eb">
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
          crmOwner=KAIZEN &nbsp;|&nbsp; crmRequestor=n/a &nbsp;|&nbsp; portaDirection=Out &nbsp;|&nbsp; portaType=External
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          <strong>Acteurs :</strong> Systeme Externe (PDV GPMAG), PortaWs, KAIZEN, MS_Ressources, MS_Line, MS_Porta, P1 [VAS]
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          <strong>Declencheur :</strong> Client KAIZEN au PDV GPMAG → USSD <code>#317#</code>
        </Typography>
      </InfoCard>

      <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 2, mb: 3, fontFamily: 'monospace', fontSize: 12, lineHeight: 2 }}>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
          <strong>1.</strong> <code>ESB / GetRIO</code> → <code>MS_Line / getRio(MSISDN)</code> + <code>KAIZEN / GetRio()</code><br />
          <strong>2.</strong> <code>MS_Line / CheckEligibility(MSISDN, RIO)</code> + <code>KAIZEN / GetRio()</code><br />
          <strong>3.</strong> CheckEligibility → PNMV3 Process (echanges, ticket 1110)<br />
          <strong>4.</strong> <code>MS Porta / NotifyPorta(IDPortage, MSISDN a porter, RIO, Status)</code><br />
          <strong>5.</strong> <code>KAIZEN / Notify(IDPortage, MSISDN a porter, MandateStatus, MandateComment)</code> → traitement interne + modification statut ligne<br />
          <strong>6.</strong> <code>PortaWs / BindPorta(IDPortage, Contexte)</code><br />
          <strong>7.</strong> Bascule J+2/3 — <code>MS Porta / NotifyPorta(IDPortage, MSISDN provisoire, MSISDN a porter, RIO, Statut, Contexte)</code><br />
          <strong>8.</strong> <code>KAIZEN / NotifyPorta(IDPortage, MSISDN a porter, MandateStatus, MandateComment, Contexte)</code> → traitement interne<br />
          <strong>9.</strong> <code>MS_Ressources / UpdateMsisdnStatus(MSISDN, Released, PortedOut=True)</code><br />
          <strong>10.</strong> <code>P1 / registerEvent(Line_Activate, MSISDN)</code><br />
          <strong>11.</strong> <code>MS_Ressources / UpdateSimStatus(Sim, Inactive)</code>
        </Typography>
      </Box>

      <CodeBlock title="Appels cles — Externe Sortante (GetRio)">
{`ESB / GetRIO → MS_Line / getRio(MSISDN) + KAIZEN / GetRio()
MS_Line / CheckEligibility(MSISDN, RIO)
MS Porta / NotifyPorta(IDPortage, MSISDN a porter, RIO, Status)
KAIZEN / Notify(IDPortage, MSISDN a porter, MandateStatus, MandateComment)
PortaWs / BindPorta(IDPortage, Contexte)
MS_Ressources / UpdateMsisdnStatus(MSISDN, Released, PortedOut=True)
MS_Ressources / UpdateSimStatus(Sim, Inactive)`}
      </CodeBlock>

      {/* ── Flow 3: Variante GetLine ─────────────────────────────────────── */}

      <SectionTitle>Flux 3 — Portabilite Externe Sortante — variante GetLine</SectionTitle>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <strong>Variante GetLine :</strong> flux identique au Flux 2 (Externe Sortante) sauf que les appels{' '}
        <code>KAIZEN / GetRio()</code> sont remplaces par <code>KAIZEN / GetLine()</code>.
      </Alert>

      {/* ── Flow 4: Interne Entrante ─────────────────────────────────────── */}

      <SectionTitle>Flux 4 — Portabilite Interne Entrante (MasterCRM → KAIZEN)</SectionTitle>

      <InfoCard title="Contexte" icon="solar:info-circle-bold-duotone" color="#2563eb">
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
          Initial : crmOwner=n/a &nbsp;|&nbsp; crmRequestor=KAIZEN &nbsp;|&nbsp; portaDirection=In &nbsp;|&nbsp; portaType=n/a
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12, mt: 0.5 }}>
          Enrichi : crmOwner=MasterCRM
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          <strong>Acteurs :</strong> MS Porta, KAIZEN, MS_Ressources, MasterCRM, MS_Line, MS_WatcherMOBI, P1 [VAS]
        </Typography>
      </InfoCard>

      <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 2, mb: 3, fontFamily: 'monospace', fontSize: 12, lineHeight: 2 }}>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
          <strong>1.</strong> Activation KAIZEN — MSISDN provisoire + saisie MSISDN Digicel / RIO Digicel<br />
          <strong>2.</strong> <code>MS_Ressources / UpdateMsisdnStatus(MSISDN Provisoire, Assigned, Ported=false)</code><br />
          <strong>3.</strong> <code>P1 / registerEvent(Line_Terminate, MSISDN provisoire)</code><br />
          <strong>4.</strong> <code>MS_Ressources / UpdateSimStatus(Sim, Active)</code><br />
          <strong>5.</strong> <code>CreatePortaGP</code> avec mandat portage + contexte initial<br />
          <strong>6.</strong> <code>MS Line / CheckEligibility(MSISDN Digicel / RIO Digicel)</code> → <code>GetRio()</code><br />
          <strong>7.</strong> Traitement interne → enrichissement contexte <code>crmOwner=MasterCRM</code><br />
          <strong>8.</strong> <code>MS Line / TerminateLinePorta(MSISDN Digicel, contexte(crmOwner=MasterCRM, crmRequestor=KAIZEN, portaDirection=In, portaType=n/a))</code><br />
          <strong>9.</strong> MasterCRM : Demande de Resiliation<br />
          <strong>10.</strong> <code>MS WatcherMOBI / (MSISDN Digicel, contexte, URLCallBack)</code> → requete SQL MOBI : <code>Select RL, Status from Send_Actions</code><br />
          <strong>11.</strong> <code>KAIZEN / Notify(MSISDN Digicel, MandateStatus, MandateComment, Contexte)</code><br />
          <strong>12.</strong> <code>MS_Ressources / UpdateMsisdnStatus(MSISDN Provisoire, Released, PortedOut=False)</code><br />
          <strong>13.</strong> <code>P1 / registerEvent(Line_Activate, MSISDN Provisoire)</code><br />
          <strong>14.</strong> <code>MS_Ressources / UpdateMsisdnStatus(MSISDN Digicel, Assigned, PortedOut=false)</code><br />
          <strong>15.</strong> <code>P1 / registerEvent(Line_Terminate, MSISDN Digicel)</code>
        </Typography>
      </Box>

      <CodeBlock title="Appels cles — Interne Entrante">
{`MS_Ressources / UpdateMsisdnStatus(MSISDN Provisoire, Assigned, Ported=false)
MS_Ressources / UpdateSimStatus(Sim, Active)
CreatePortaGP (mandat portage + contexte initial)
MS Line / CheckEligibility(MSISDN Digicel / RIO Digicel) → GetRio()
MS Line / TerminateLinePorta(MSISDN Digicel, contexte(crmOwner=MasterCRM, crmRequestor=KAIZEN))
MS WatcherMOBI / (MSISDN Digicel, contexte, URLCallBack) → SQL: Select RL, Status from Send_Actions
KAIZEN / Notify(MSISDN Digicel, MandateStatus, MandateComment, Contexte)`}
      </CodeBlock>

      {/* ── Summary table ────────────────────────────────────────────────── */}

      <SectionTitle>Tableau recapitulatif des flux KAIZEN</SectionTitle>

      <TableContainer>
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
              <TableCell>n/a</TableCell>
              <TableCell>KAIZEN</TableCell>
              <TableCell>In</TableCell>
              <TableCell>External</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Externe Sortante</TableCell>
              <TableCell>KAIZEN</TableCell>
              <TableCell>n/a</TableCell>
              <TableCell>Out</TableCell>
              <TableCell>External</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Interne Entrante</TableCell>
              <TableCell>MasterCRM (enrichi)</TableCell>
              <TableCell>KAIZEN</TableCell>
              <TableCell>In</TableCell>
              <TableCell>n/a</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Alert severity="warning" sx={{ mt: 3 }}>
        Le flux Porta Interne Sortante (KAIZEN → MasterCRM) n{"'"}est pas encore documente.
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
