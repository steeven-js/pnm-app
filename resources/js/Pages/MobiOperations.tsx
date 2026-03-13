import { useCallback, useState } from 'react';
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
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepContent from '@mui/material/StepContent';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
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

function TodoChip({ label }: { label: string }) {
  return (
    <Chip
      label={label}
      size="small"
      icon={<Iconify icon="solar:pen-bold" width={14} />}
      sx={{ bgcolor: '#f59e0b', color: '#fff', fontWeight: 600, fontSize: 11 }}
    />
  );
}

function ServerChip({ name }: { name: string }) {
  return <Chip label={name} size="small" variant="soft" sx={{ fontFamily: 'monospace', fontSize: 11 }} />;
}

// ─── Tab 1 : Procedures d'exploitation ──────────────────────────────────────

function ProceduresExploitationSection() {
  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        Procedures quotidiennes de verification des traitements CRM MOBI lies a la portabilite.
        Les bascules DAPI vers MOBI se produisent principalement a ~09h (traitement EMA/EMM)
        et potentiellement lors des 3 vacations (10h, 14h, 19h).
      </Alert>

      <SectionTitle>Deroulement quotidien</SectionTitle>

      <Stepper orientation="vertical" activeStep={-1} sx={{ mb: 3 }}>
        <Step active>
          <StepLabel
            optional={<Typography variant="caption" sx={{ color: 'text.secondary' }}>~09h00</Typography>}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Traitement EMA/EMM — Bascule DAPI</Typography>
          </StepLabel>
          <StepContent>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Les fichiers EMA et EMM sont traites par PortaSync. Les bascules de portabilite
              declenchent des appels vers MOBI via DAPI/DataPower.
            </Typography>
            <CodeBlock title="Verifier les logs EMA/EMM sur vmqproportasync01">
{`tail -n 20 /home/porta_pnmv3/PortaSync/log/EmaExtracter.log
tail -n 20 /home/porta_pnmv3/PortaSync/log/EmmExtracter.log`}
            </CodeBlock>
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
              Attendu : &quot;Check success&quot; + &quot;Fin de Traitement&quot; pour chaque operateur
            </Typography>
          </StepContent>
        </Step>

        <Step active>
          <StepLabel
            optional={<Typography variant="caption" sx={{ color: 'text.secondary' }}>~10h15</Typography>}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Vacation 1 — Verification fichiers</Typography>
          </StepLabel>
          <StepContent>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Verifier que les fichiers PNMDATA ont ete generes et envoyes correctement.
              Controler les logs MOBI pour confirmer que les bascules CRM ont abouti.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <TodoChip label="TODO: Logs cote MOBI a confirmer sur vmqpromsbox01/02" />
            </Stack>
          </StepContent>
        </Step>

        <Step active>
          <StepLabel
            optional={<Typography variant="caption" sx={{ color: 'text.secondary' }}>~14h00</Typography>}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Vacation 2 — Suivi et relances</Typography>
          </StepLabel>
          <StepContent>
            <Typography variant="body2">
              Comparer avec vacation 1. Verifier si des bascules supplementaires ont eu lieu.
              Controler les eventuels incidents detectes dans les mails de reporting.
            </Typography>
          </StepContent>
        </Step>

        <Step active>
          <StepLabel
            optional={<Typography variant="caption" sx={{ color: 'text.secondary' }}>~19h00</Typography>}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Vacation 3 — Cloture</Typography>
          </StepLabel>
          <StepContent>
            <Typography variant="body2">
              Dernier rapport du jour. Verifier que toutes les bascules CRM ont ete traitees.
              Cloturer la journee.
            </Typography>
          </StepContent>
        </Step>
      </Stepper>

      <SectionTitle>Checklist de verification</SectionTitle>

      <InfoCard title="Apres chaque vacation" icon="solar:checklist-bold-duotone" color="#16a34a">
        <Box component="ul" sx={{ pl: 2, mb: 0, '& li': { mb: 0.5 } }}>
          <li><Typography variant="body2">Verifier les logs EMA/EMM sur <ServerChip name="vmqproportasync01" /></Typography></li>
          <li><Typography variant="body2">Controler les logs MOBI sur <ServerChip name="vmqpromsbox01" /> / <ServerChip name="vmqpromsbox02" /> <TodoChip label="TODO: chemin exact des logs" /></Typography></li>
          <li><Typography variant="body2">Confirmer que les mandats bascules sont refletes dans le CRM</Typography></li>
          <li><Typography variant="body2">Verifier l{"'"}absence d{"'"}erreurs dans les mails de reporting PNM</Typography></li>
        </Box>
      </InfoCard>

      <SectionTitle>Logs a surveiller</SectionTitle>

      <SubTitle>Cote PNM (vmqproportasync01)</SubTitle>
      <CodeBlock>
{`/home/porta_pnmv3/PortaSync/log/EmaExtracter.log
/home/porta_pnmv3/PortaSync/log/EmmExtracter.log
/home/porta_pnmv3/PortaSync/log/PnmDataManager.log
/home/porta_pnmv3/PortaSync/log/PnmAckManager.log`}
      </CodeBlock>

      <SubTitle>Cote MOBI (vmqpromsbox01/02)</SubTitle>
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <TodoChip label="TODO: Chemins des logs MOBI a confirmer" />
          <Typography variant="body2">
            Demander a l{"'"}equipe MOBI les fichiers de log pertinents et leurs emplacements.
          </Typography>
        </Stack>
      </Alert>
    </>
  );
}

// ─── Tab 2 : Gestion des incidents ──────────────────────────────────────────

function GestionIncidentsSection() {
  return (
    <>
      <Alert severity="warning" sx={{ mb: 3 }}>
        En cas d{"'"}incident impliquant le CRM MOBI pendant les bascules de portabilite, suivre les procedures
        d{"'"}escalade ci-dessous. Toujours fournir un maximum d{"'"}informations a l{"'"}equipe MOBI.
      </Alert>

      <SectionTitle>Procedure d{"'"}escalade</SectionTitle>

      <Stepper orientation="vertical" activeStep={-1} sx={{ mb: 3 }}>
        <Step active>
          <StepLabel>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Identifier l{"'"}incident</Typography>
          </StepLabel>
          <StepContent>
            <Typography variant="body2">
              Verifier les logs PNM (EmaExtracter.log, EmmExtracter.log) pour identifier
              les mandats dont la bascule CRM a echoue.
            </Typography>
          </StepContent>
        </Step>

        <Step active>
          <StepLabel>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Collecter les informations</Typography>
          </StepLabel>
          <StepContent>
            <InfoCard title="Informations a fournir a l'equipe MOBI" icon="solar:document-bold-duotone" color="#2563eb">
              <Box component="ul" sx={{ pl: 2, mb: 0, '& li': { mb: 0.5 } }}>
                <li><Typography variant="body2"><strong>MSISDN</strong> concernes (liste complete)</Typography></li>
                <li><Typography variant="body2"><strong>Date et heure</strong> de la bascule</Typography></li>
                <li><Typography variant="body2"><strong>Type</strong> : portabilite entrante (PE) ou sortante (PS)</Typography></li>
                <li><Typography variant="body2"><strong>Erreurs</strong> observees dans les logs</Typography></li>
                <li><Typography variant="body2"><strong>Numero de mandat</strong> Porta correspondant</Typography></li>
              </Box>
            </InfoCard>
          </StepContent>
        </Step>

        <Step active>
          <StepLabel>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Escalader</Typography>
          </StepLabel>
          <StepContent>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Contacter l{"'"}equipe MOBI avec les informations collectees.
            </Typography>
            <Stack direction="row" spacing={1}>
              <TodoChip label="TODO: Contacts equipe MOBI a documenter" />
            </Stack>
          </StepContent>
        </Step>

        <Step active>
          <StepLabel>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Suivi et resolution</Typography>
          </StepLabel>
          <StepContent>
            <Typography variant="body2">
              Suivre la resolution avec l{"'"}equipe MOBI. Verifier dans le CRM que les mandats
              ont ete correctement traites apres la correction.
            </Typography>
          </StepContent>
        </Step>
      </Stepper>

      <SectionTitle>Incidents courants</SectionTitle>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" width={20} />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="1" size="small" color="error" />
            <Typography variant="subtitle2">CRM en panne pendant la bascule</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Le CRM MOBI/MasterCRM est indisponible au moment ou DAPI tente d{"'"}executer les operations
            <code> ExecuteChangeMSISDNPe</code> ou <code>ExecuteResiliationPs</code>.
          </Typography>
          <InfoCard title="Resolution" icon="solar:shield-check-bold-duotone" color="#16a34a">
            <Typography variant="body2">
              <strong>Action</strong> : Relance manuelle des traitements CRM une fois le service retabli.<br />
              Fournir la liste des mandats non traites a l{"'"}equipe MOBI pour relance.
            </Typography>
          </InfoCard>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" width={20} />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="2" size="small" color="error" />
            <Typography variant="subtitle2">Timeout des appels WS</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Les appels SOAP vers WSMobiMaster expirent sans reponse.
          </Typography>
          <InfoCard title="Resolution" icon="solar:shield-check-bold-duotone" color="#2563eb">
            <Typography variant="body2">
              <strong>Verifier</strong> : DataPower Proxy sur <ServerChip name="vmqprotodapi01" /> / <ServerChip name="vmqprotodapi02" /><br />
              <strong>Tester</strong> : Operation <code>TestWord</code> via SoapUI pour confirmer la connectivite.<br />
              <strong>Escalader</strong> : Si le proxy ne repond pas, verifier le load balancer F5 (VIP f5-vip-kong).
            </Typography>
          </InfoCard>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" width={20} />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="3" size="small" color="error" />
            <Typography variant="subtitle2">MSPorta repond en erreur</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Le microservice MSPorta retourne une erreur lors de la notification de portabilite.
          </Typography>
          <InfoCard title="Resolution" icon="solar:shield-check-bold-duotone" color="#7c3aed">
            <Typography variant="body2">
              <strong>Verifier</strong> : Etat des microservices sur <ServerChip name="vmqpromsbox01" /> / <ServerChip name="vmqpromsbox02" /> (VIP 172.24.119.96)<br />
              <strong>Tester</strong> : Endpoint REST MSPorta <code>http://172.24.119.36:3003/v1/notifyPorta</code><br />
              <strong>Logs</strong> : Consulter les logs applicatifs du microservice.
            </Typography>
          </InfoCard>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" width={20} />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="4" size="small" color="error" />
            <Typography variant="subtitle2">DataPower Proxy down</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Le proxy DataPower (Spring Boot) ne repond plus. Aucun appel WS ne passe vers les microservices.
          </Typography>
          <InfoCard title="Resolution" icon="solar:shield-check-bold-duotone" color="#dc2626">
            <Typography variant="body2">
              <strong>Verifier</strong> : <ServerChip name="vmqprotodapi01" /> et <ServerChip name="vmqprotodapi02" /><br />
              <strong>Load balancer</strong> : Verifier la VIP <code>f5-vip-kong</code> — les deux serveurs sont-ils actifs ?<br />
              <strong>Escalader</strong> : Si le proxy est completement down, escalader immediatement a l{"'"}equipe infrastructure.
            </Typography>
          </InfoCard>
        </AccordionDetails>
      </Accordion>

      <SectionTitle>Contacts et escalade</SectionTitle>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <TodoChip label="TODO: Documenter les contacts de l'equipe MOBI" />
          <Typography variant="body2">
            Noms, numeros, adresses email, canal Teams/Slack a ajouter.
          </Typography>
        </Stack>
      </Alert>
    </>
  );
}

// ─── Tab 3 : Infrastructure & Monitoring ────────────────────────────────────

function InfrastructureMonitoringSection() {
  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        Infrastructure des serveurs MOBI/MasterCRM et outils de monitoring associes.
      </Alert>

      <SectionTitle>Inventaire des serveurs MOBI</SectionTitle>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Composant</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Hostname</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>IP / VIP</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Microservices MOBI</TableCell>
              <TableCell><ServerChip name="vmqpromsbox01" /> <ServerChip name="vmqpromsbox02" /></TableCell>
              <TableCell><Chip label="VIP 172.24.119.96" size="small" color="primary" variant="soft" /></TableCell>
              <TableCell>Microservices CRM (MSPorta, MSLine, MSCustomer, etc.)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>MasterCRM DB</TableCell>
              <TableCell><ServerChip name="vmqprombdb01" /></TableCell>
              <TableCell><TodoChip label="TODO: IP" /></TableCell>
              <TableCell>Base de donnees MasterCRM / MOBI</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>DataPower Proxy</TableCell>
              <TableCell><ServerChip name="vmqprotodapi01" /> <ServerChip name="vmqprotodapi02" /></TableCell>
              <TableCell><Chip label="VIP f5-vip-kong" size="small" color="warning" variant="soft" /></TableCell>
              <TableCell>Proxy ESB DataPower (Spring Boot) — routage des appels WS</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <SectionTitle>Architecture reseau</SectionTitle>

      <InfoCard title="Load balancing F5" icon="solar:routing-bold-duotone" color="#2563eb">
        <Typography variant="body2">
          Un <strong>F5 load balancer</strong> est place devant les serveurs DataPower Proxy
          (<ServerChip name="vmqprotodapi01" /> / <ServerChip name="vmqprotodapi02" />).<br />
          La VIP <code>f5-vip-kong</code> distribue le trafic entre les deux instances du proxy.<br />
          Les microservices MOBI sont accessibles via la VIP <code>172.24.119.96</code>.
        </Typography>
      </InfoCard>

      <InfoCard title="Flux reseau simplifie" icon="solar:transfer-horizontal-bold-duotone" color="#16a34a">
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 2 }}>
          DAPI (PortaSync) → <strong>f5-vip-kong</strong> (F5 LB)<br />
          &nbsp;&nbsp;→ vmqprotodapi01/02 (DataPower Proxy)<br />
          &nbsp;&nbsp;&nbsp;&nbsp;→ <strong>172.24.119.96</strong> (VIP Microservices)<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ vmqpromsbox01/02 (MSPorta, MSLine, ...)<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ vmqprombdb01 (MasterCRM DB)
        </Typography>
      </InfoCard>

      <SectionTitle>Monitoring</SectionTitle>

      <SubTitle>Graylog</SubTitle>
      <Card variant="outlined" sx={{ mb: 2, borderLeft: 4, borderLeftColor: '#f59e0b' }}>
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Iconify icon="solar:monitor-bold-duotone" width={20} sx={{ color: '#f59e0b' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Graylog — Logs centralises</Typography>
            <TodoChip label="TODO: URL Graylog a confirmer" />
          </Stack>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Les appels passant par XToolWS (Java/Glassfish) sont logues dans Graylog (Log In/Out).
            Cela permet de tracer les flux DAPI → DataPower → Microservices.
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Filtres utiles : rechercher par MSISDN, par type d{"'"}operation (ExecuteChangeMSISDNPe, ExecuteResiliationPs),
            par code de retour HTTP.
          </Typography>
        </CardContent>
      </Card>

      <SubTitle>Health checks</SubTitle>
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <TodoChip label="TODO: Health checks a documenter" />
          <Typography variant="body2">
            Definir les endpoints de health check pour chaque microservice et le proxy DataPower.
          </Typography>
        </Stack>
      </Alert>

      <SectionTitle>Questions ouvertes</SectionTitle>

      <InfoCard title="Points a clarifier avec l'equipe MOBI" icon="solar:question-circle-bold-duotone" color="#f59e0b">
        <Box component="ul" sx={{ pl: 2, mb: 0, '& li': { mb: 1 } }}>
          <li>
            <Typography variant="body2">
              <strong>Type de BDD MasterCRM</strong> : Oracle ? SQL Server ? PostgreSQL ? <TodoChip label="TODO" />
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Monitoring existant</strong> : Nagios ? Zabbix ? Prometheus/Grafana ? <TodoChip label="TODO" />
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Stack technique microservices</strong> : Docker ? JVM (Spring Boot) ? Node.js ? <TodoChip label="TODO" />
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Procedure de redemarrage</strong> des microservices en cas de panne <TodoChip label="TODO" />
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Backups</strong> : frequence et procedure de restauration de la BDD MasterCRM <TodoChip label="TODO" />
            </Typography>
          </li>
        </Box>
      </InfoCard>
    </>
  );
}

// ─── Tab 4 : SoapUI & Tests ────────────────────────────────────────────────

function SoapUiTestsSection() {
  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        Utilisation de SoapUI pour tester les web services MOBI/MasterCRM.
        Ces tests permettent de verifier la connectivite et de diagnostiquer les problemes.
      </Alert>

      <Alert severity="error" sx={{ mb: 3 }}>
        <strong>REGLE DE SECURITE ABSOLUE</strong> : Ne jamais executer d{"'"}operations en ecriture (ExecuteChangeMSISDNPe,
        ExecuteResiliationPs, etc.) en PROD sans autorisation explicite de l{"'"}equipe MOBI et du responsable PNM.
      </Alert>

      <SectionTitle>Operations de test</SectionTitle>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" width={20} />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="Lecture" size="small" color="success" variant="soft" />
            <Typography variant="subtitle2">TestWord — Test de connectivite</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Operation la plus simple. Permet de verifier que le web service MOBI est accessible
            et repond correctement. <strong>Sans risque</strong> — aucune modification de donnees.
          </Typography>
          <InfoCard title="Quand utiliser" icon="solar:check-circle-bold-duotone" color="#16a34a">
            <Typography variant="body2">
              En premier recours lors d{"'"}un incident CRM pour confirmer si le WS repond.
              Si TestWord echoue, le probleme est au niveau de la connectivite (reseau, proxy, serveur).
            </Typography>
          </InfoCard>
          <CodeBlock title="Projet SoapUI">
{`Projet : WSMobiMaster - WSProvisioning - PROD
Binding : BasicHttpBinding_Provisioning
Operation : TestWord`}
          </CodeBlock>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" width={20} />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="Lecture" size="small" color="success" variant="soft" />
            <Typography variant="subtitle2">InfoLine — Diagnostic en lecture seule</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Recupere les informations d{"'"}une ligne (MSISDN, statut, offre, etc.) depuis MasterCRM.
            <strong> Lecture seule</strong> — aucune modification de donnees.
          </Typography>
          <InfoCard title="Quand utiliser" icon="solar:eye-bold-duotone" color="#2563eb">
            <Typography variant="body2">
              Pour verifier l{"'"}etat d{"'"}une ligne apres une bascule de portabilite.
              Permet de confirmer si le changement de MSISDN a bien ete effectue dans le CRM.
            </Typography>
          </InfoCard>
          <CodeBlock title="Parametres">
{`Operation : InfoLine
Parametre : MSISDN (ex: 0690XXXXXX)
Retour : statut de la ligne, offre, informations client`}
          </CodeBlock>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" width={20} />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="ECRITURE" size="small" color="error" />
            <Typography variant="subtitle2">ExecuteChangeMSISDNPe — Changement de MSISDN (PE)</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>ATTENTION EXTREME</strong> — Cette operation modifie les donnees dans le CRM de production.
            Ne jamais executer sans autorisation explicite et sans avoir verifie les parametres.
          </Alert>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Remplace le MSISDN provisoire par le numero porte dans MasterCRM lors d{"'"}une portabilite entrante.
            Cette operation est normalement appelee automatiquement par DAPI lors de la bascule.
          </Typography>
          <InfoCard title="Usage manuel" icon="solar:danger-triangle-bold-duotone" color="#dc2626">
            <Typography variant="body2">
              Utiliser uniquement en cas de relance manuelle apres un incident CRM
              (cas pratique #6). Toujours verifier le MSISDN et le mandat avant execution.
            </Typography>
          </InfoCard>
        </AccordionDetails>
      </Accordion>

      <SectionTitle>Endpoints WSDL</SectionTitle>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Environnement</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Endpoint</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Chip label="INT" size="small" color="info" variant="soft" />
              </TableCell>
              <TableCell>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11 }}>—</Typography>
                  <TodoChip label="TODO: Endpoint INT a confirmer" />
                </Stack>
              </TableCell>
              <TableCell><Chip label="A confirmer" size="small" sx={{ bgcolor: '#f59e0b', color: '#fff' }} /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Chip label="PROD" size="small" color="error" variant="soft" />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                  WSDL MOBI - PROD - 172.24.4.136
                </Typography>
              </TableCell>
              <TableCell><Chip label="Actif" size="small" color="success" variant="soft" /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <SectionTitle>Regles de securite</SectionTitle>

      <InfoCard title="Regles imperatives pour les tests SoapUI" icon="solar:shield-bold-duotone" color="#dc2626">
        <Box component="ol" sx={{ pl: 2, mb: 0, '& li': { mb: 1 } }}>
          <li>
            <Typography variant="body2">
              <strong>Toujours commencer par TestWord</strong> pour verifier la connectivite
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Utiliser InfoLine</strong> pour le diagnostic — lecture seule, sans risque
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Ne jamais executer d{"'"}operations en ecriture en PROD</strong> sans autorisation
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Verifier deux fois les parametres</strong> (MSISDN, mandat) avant toute operation en ecriture
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Privilegier l{"'"}environnement INT</strong> pour les tests exploratoires
            </Typography>
          </li>
        </Box>
      </InfoCard>
    </>
  );
}

// ─── Section tabs ───────────────────────────────────────────────────────────

const SECTIONS: DocSection[] = [
  {
    id: 'procedures',
    title: "Procedures d'exploitation",
    icon: 'solar:checklist-bold-duotone',
    content: <ProceduresExploitationSection />,
  },
  {
    id: 'incidents',
    title: 'Gestion des incidents',
    icon: 'solar:danger-triangle-bold-duotone',
    content: <GestionIncidentsSection />,
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure & Monitoring',
    icon: 'solar:server-square-cloud-bold-duotone',
    content: <InfrastructureMonitoringSection />,
  },
  {
    id: 'soapui',
    title: 'SoapUI & Tests',
    icon: 'solar:test-tube-bold-duotone',
    content: <SoapUiTestsSection />,
  },
];

// ─── Main page ──────────────────────────────────────────────────────────────

export default function MobiOperations() {
  const [tab, setTab] = useState(0);

  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  }, []);

  return (
    <DashboardLayout>
      <Head title="MOBI — Operations" />

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1200, mx: 'auto' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
          <Iconify icon="solar:settings-bold-duotone" width={32} sx={{ color: 'warning.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              MOBI — Guide d{"'"}exploitation
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Procedures operationnelles, gestion des incidents et infrastructure CRM MOBI/MasterCRM
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
