import { Head } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

// ----------------------------------------------------------------------

type ChangeType = 'new' | 'improvement' | 'fix';

type ChangelogEntry = {
  version: string;
  date: string;
  changes: {
    type: ChangeType;
    description: string;
  }[];
};

const CHANGE_TYPE_CONFIG: Record<ChangeType, { label: string; color: 'success' | 'info' | 'warning' }> = {
  new: { label: 'Nouveau', color: 'success' },
  improvement: { label: 'Amélioration', color: 'info' },
  fix: { label: 'Correction', color: 'warning' },
};

const CHANGELOG: ChangelogEntry[] = [
  {
    version: '2.1.0',
    date: '26 Février 2026',
    changes: [
      { type: 'new', description: 'Auto-remplissage des checklists monitoring depuis le contenu collé (emails et logs serveur) pour les 13 événements' },
      { type: 'new', description: '3 nouvelles vérifications serveur PORTA : bascule/valorisation (EmaExtracter + EmmExtracter), génération PNMDATA, acquittements' },
      { type: 'new', description: 'Page Guide des Opérations : architecture, vérifications quotidiennes, infrastructure (serveurs + scripts), mails, contacts GPMAG et modèles de mails' },
      { type: 'new', description: 'Schémas d\'architecture interactifs : diagramme Porta Digicel (flux fichiers/SOAP) et paysage production complet (opérateurs → MOBI) avec légendes couleur' },
      { type: 'new', description: 'Export PDF du Guide des Opérations : 4 pages avec diagrammes, flux, horaires, serveurs, liens et contacts' },
      { type: 'new', description: 'Bouton "Essayer" interactif dans les articles SQL avec exécution directe des requêtes' },
      { type: 'improvement', description: 'Différenciation claire EmaExtracter.log (bascule) et EmmExtracter.log (valorisation) avec 14 items de checklist séparés' },
      { type: 'improvement', description: 'Horaires des vacations ajustés selon les heures réelles de réception des mails (11h35, 15h35, 20h35)' },
      { type: 'improvement', description: 'Schéma SQL Playground aligné avec la structure de production PortaDB' },
      { type: 'improvement', description: 'Fusion des 3 événements bascule en un seul rapport activité automates' },
      { type: 'improvement', description: 'Décodeur PNMDATA : 18 codes tickets complets selon la spec officielle (DP, DE, EP, AP, AN, CA, BI, PI, DI, CI, BR, RN, RS, CS, ER…)' },
      { type: 'fix', description: 'Opérateur 00 affiché comme « Tous (Opérateurs) » au lieu de « Inconnu »' },
      { type: 'fix', description: 'Compteur pied de page PNMDATA corrigé dans le parsing et l\'affichage : entête et pied de page exclus du décompte tickets' },
      { type: 'fix', description: 'Correction du regex accent pour le parsing des logs serveur (ajoutés/ajoutes)' },
      { type: 'fix', description: 'Ajout de user_id au modèle MonitoringEvent pour la sauvegarde' },
    ],
  },
  {
    version: '2.0.0',
    date: '17 Février 2026',
    changes: [
      { type: 'new', description: 'Refonte complète avec Laravel 12, Inertia.js, React 19 et MUI Minimals' },
      { type: 'new', description: 'Assistant IA avec streaming SSE, historique de conversations et contexte RAG' },
      { type: 'new', description: 'SQL Playground avec 18 tables PORTA, 36 scénarios et 10 articles de référence' },
      { type: 'new', description: 'Dashboard de monitoring PNM avec timeline, checklists et détection des jours fériés' },
      { type: 'new', description: 'Système de progression et suivi par domaine de connaissance' },
      { type: 'new', description: 'Parcours d\'onboarding pour les nouveaux utilisateurs' },
      { type: 'new', description: 'Page Changelog avec historique des versions' },
      { type: 'improvement', description: 'Navigation repensée avec sidebar, recherche globale et thème personnalisable' },
      { type: 'improvement', description: 'Interface responsive optimisée mobile' },
      { type: 'improvement', description: 'Dates en français, liste des jours fériés GPMAG, badge de niveau dynamique' },
      { type: 'fix', description: 'Redirection de la page d\'accueil vers le dashboard' },
      { type: 'fix', description: 'Corrections TypeScript sur la page d\'onboarding' },
    ],
  },
  {
    version: '1.2.0',
    date: '16 Février 2026',
    changes: [
      { type: 'new', description: 'Section Résoudre avec dictionnaire de codes PNM et arbres de décision' },
      { type: 'new', description: 'Section Vérifier avec 5 outils PNM (dates, RIO, MSISDN, décodeur fichier, ID portage)' },
      { type: 'new', description: 'Moteur d\'analyse de contenu de fichiers PNM' },
      { type: 'new', description: 'Bouton d\'import de fichier dans le décodeur de noms de fichiers' },
      { type: 'improvement', description: 'Migration de l\'interface de shadcn/Tailwind vers MUI' },
      { type: 'improvement', description: 'Réorganisation de la sidebar en 3 groupes avec sous-items repliables' },
      { type: 'fix', description: 'Amélioration du décodeur de fichiers avec support PNMSYNC et extensions .ACR/.ERR' },
    ],
  },
  {
    version: '1.1.0',
    date: '11 Février 2026',
    changes: [
      { type: 'new', description: 'Diagrammes Mermaid interactifs dans les 24 articles de connaissance' },
      { type: 'new', description: 'Galerie de diagrammes avec navigation zoom et panoramique' },
    ],
  },
  {
    version: '1.0.0',
    date: '10 Février 2026',
    changes: [
      { type: 'new', description: 'Lancement de la plateforme PNM Knowledge' },
      { type: 'new', description: 'Base de connaissances avec articles par domaine' },
      { type: 'new', description: 'Intégration du manuel d\'exploitation PORTA' },
      { type: 'new', description: 'Système d\'authentification et gestion des utilisateurs' },
    ],
  },
];

// ----------------------------------------------------------------------

export default function Changelog() {
  return (
    <DashboardLayout>
      <Head title="Changelog" />

      <Box sx={{ p: { xs: 3, md: 5 } }}>
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4">Changelog</Typography>
          <Typography sx={{ mt: 1, color: 'text.secondary' }}>
            Historique des mises à jour de l'application
          </Typography>
        </Box>

        <Timeline
          sx={{
            p: 0,
            m: 0,
            [`& .MuiTimelineItem-root`]: { '&:before': { display: 'none' } },
          }}
        >
          {CHANGELOG.map((entry, index) => (
            <TimelineItem key={entry.version}>
              <TimelineSeparator>
                <TimelineDot
                  color={index === 0 ? 'primary' : 'grey'}
                  variant={index === 0 ? 'filled' : 'outlined'}
                />
                {index < CHANGELOG.length - 1 && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent sx={{ pb: 5 }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="h5">v{entry.version}</Typography>
                  {index === 0 && (
                    <Chip label="Dernière version" size="small" color="primary" variant="soft" />
                  )}
                </Box>

                <Typography variant="caption" sx={{ color: 'text.disabled', mb: 2, display: 'block' }}>
                  {entry.date}
                </Typography>

                <Card sx={{ p: 3 }}>
                  <Stack spacing={1.5}>
                    {entry.changes.map((change, i) => {
                      const config = CHANGE_TYPE_CONFIG[change.type];
                      return (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <Chip
                            label={config.label}
                            size="small"
                            color={config.color}
                            variant="soft"
                            sx={{ minWidth: 100 }}
                          />
                          <Typography variant="body2" sx={{ pt: 0.25 }}>
                            {change.description}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                </Card>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Box>
    </DashboardLayout>
  );
}
