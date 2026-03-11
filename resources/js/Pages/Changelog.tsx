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
    version: '2.5.0',
    date: '11 Mars 2026',
    changes: [
      { type: 'new', description: 'PDF Architecture des Serveurs PNM (5 pages) : vue d\'ensemble, détail des 6 serveurs, arborescence vmqproportasync01, webservices SOAP, interactions, mRemoteNG, aide-mémoire SSH' },
      { type: 'new', description: '5 nouveaux cas pratiques enrichis avec données de production : PortaWs inaccessible, HUB en panne, aucun fichier reçu, FNR non transmis, MSISDN provisoire erroné' },
      { type: 'new', description: 'Analyseur de fichiers .ERR dans le décodeur PNMDATA : détection E011 (AR non reçu), conclusion automatique avec chemins SFTP' },
      { type: 'new', description: 'Pages d\'investigation interactives pour incidents PNM et vacations' },
      { type: 'new', description: 'Cas Pratique #7 : Fichier déjà reçu (E008) avec export PDF' },
      { type: 'new', description: 'Boutons copier sur les commandes dans la section Vérifications quotidiennes du Guide des Opérations' },
      { type: 'improvement', description: 'Commandes Bascule & Valorisation fusionnées en une seule avec &&' },
      { type: 'improvement', description: 'CDC = Chargé De Clientèle (correction terminologie)' },
      { type: 'improvement', description: 'Escalade PNM_SI + flashinfo au lieu de GPMAG/secretariat@gpmag.fr' },
      { type: 'fix', description: 'Correction du calcul Mi-Carême : Pâques - 24 jours (au lieu de 25)' },
      { type: 'fix', description: 'Chemin logs Tomcat corrigé : /opt/tomcat9/logs/catalina.out' },
      { type: 'fix', description: 'Suppression de la commande cat .ERR non fiable dans le workflow vacation (remplacée par find)' },
    ],
  },
  {
    version: '2.4.0',
    date: '10 Mars 2026',
    changes: [
      { type: 'new', description: 'Cas Pratique #4 : Refus R322 (résiliation effective) — investigation Free Caraïbes' },
      { type: 'new', description: 'Cas Pratique #5 : Annulation 1510/C001 — deux exemples Digicel→Orange et Free→Digicel' },
      { type: 'new', description: 'Cas Pratique #6 : Erreur E610 (flux non attendu) — investigation restitution Orange Caraïbe' },
      { type: 'new', description: 'Analyseur DAPI PortaWs avec support E610 dans l\'analyseur d\'incidents' },
      { type: 'new', description: 'Analyseur de logs serveur et Cas Pratique #3 (investigation AR non reçu)' },
      { type: 'improvement', description: 'Support annulations dans l\'analyseur d\'incidents avec compteur et étapes d\'investigation' },
      { type: 'fix', description: 'Suppression de l\'événement « Rapport activité automates » (timeline, PDF, config, parsers)' },
    ],
  },
  {
    version: '2.3.0',
    date: '9 Mars 2026',
    changes: [
      { type: 'fix', description: 'Noms de tables MySQL en majuscules pour correspondre au schéma de production PortaDB' },
      { type: 'fix', description: 'Suppression des pages Validation RIO, Vérificateur MSISDN et SQL Playground de la section Vérifier' },
      { type: 'fix', description: 'Suppression des Arbres de décision et Diagrammes de la section Résoudre' },
      { type: 'fix', description: 'Section « Points importants » des PDF ne se coupe plus entre deux pages' },
    ],
  },
  {
    version: '2.2.1',
    date: '6 Mars 2026',
    changes: [
      { type: 'new', description: 'Page 6 du PDF Guide des Opérations : Scripts PNM & logs associés avec catégories et commandes tail' },
      { type: 'improvement', description: 'Fusion script + log en cartes unifiées dans le PDF' },
    ],
  },
  {
    version: '2.2.0',
    date: '5 Mars 2026',
    changes: [
      { type: 'new', description: 'Pages Scripts PNM, Requêtes SQL PNM et Cas Pratiques' },
      { type: 'new', description: 'Bloc détail structuré après auto-remplissage des incidents avec explications pour débutants' },
      { type: 'fix', description: 'Désactivation de l\'autocomplétion navigateur sur les zones de texte de collage de logs' },
      { type: 'fix', description: 'Correction erreur TypeScript dans CasPratiquesPdf' },
    ],
  },
  {
    version: '2.1.1',
    date: '27 Février 2026',
    changes: [
      { type: 'new', description: 'Navigation par date sur le dashboard monitoring : boutons jour précédent/suivant, sélecteur de date et bouton « Aujourd\'hui » pour revenir au mode live' },
      { type: 'new', description: 'Consultation en lecture seule des événements des jours passés avec checklists et notes sauvegardées' },
      { type: 'improvement', description: 'Détection des jours fériés fonctionnelle aussi sur les dates historiques' },
    ],
  },
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
      { type: 'improvement', description: 'Fusion des 3 événements bascule en un seul événement consolidé' },
      { type: 'improvement', description: 'Décodeur PNMDATA : 18 codes tickets complets selon la spec officielle (DP, DE, EP, AP, AN, CA, BI, PI, DI, CI, BR, RN, RS, CS, ER…)' },
      { type: 'improvement', description: 'Lecture contextuelle des tickets PNMDATA : colonnes 2/3/5 adaptées aux 3 contextes (portage, portage inverse, restitution) avec badge et labels dynamiques' },
      { type: 'new', description: 'Validation col. 3 vs destinataire fichier : alerte si l\'opérateur destination d\'un ticket ne correspond pas au destinataire déclaré dans l\'entête' },
      { type: 'new', description: 'Panneau d\'incohérences enrichi : détails structurés (ligne, code, MSISDN, comparaison col.3 vs entête), badge « Incohérence » sur les tickets concernés et alerte inline dans le détail étendu' },
      { type: 'new', description: 'Lecture en langage naturel des tickets PNMDATA : chaque ticket est expliqué sous forme de phrase (ex. « L\'opérateur X informe l\'opérateur Y que le numéro… ») pour les 18 types de tickets dans les 3 contextes' },
      { type: 'improvement', description: 'Timeline vérifications quotidiennes unifiée : serveur SSH et mails regroupés par créneau horaire en ordre ascendant (6 cartes au lieu de 14 éléments séparés)' },
      { type: 'fix', description: 'Opérateur 00 affiché comme « Tous (Opérateurs) » au lieu de « Inconnu »' },
      { type: 'fix', description: 'Compteur pied de page PNMDATA corrigé dans le parsing et l\'affichage : entête et pied de page exclus du décompte tickets' },
      { type: 'fix', description: 'Correction du regex accent pour le parsing des logs serveur (ajoutés/ajoutes)' },
      { type: 'fix', description: 'Ajout de user_id au modèle MonitoringEvent pour la sauvegarde' },
      { type: 'fix', description: 'Timeline Dashboard monitoring réordonnée en ordre chronologique ascendant (les événements apparaissaient dans le désordre, ex. 11h35 entre 09h00 et 09h01)' },
      { type: 'new', description: 'Sujets email avec bouton copier sur les événements monitoring pour rechercher facilement dans la boite mail (internes et externes)' },
      { type: 'new', description: 'Détection nom de fichier importé vs en-tête PNMDATA : alerte si le fichier physique ne correspond pas au nom déclaré dans la première ligne' },
      { type: 'new', description: 'Détection hash MD5 invalide : alerte rouge si un identifiant de portage contient des caractères non-hexadécimaux' },
      { type: 'new', description: 'Détection doublons de séquence : alerte si deux tickets partagent le même numéro de séquence dans un fichier' },
      { type: 'new', description: 'Détection tickets en doublon : alerte si un même ticket (code + MSISDN + hash) apparaît plusieurs fois' },
      { type: 'new', description: 'Détection incohérence temporelle en-tête/pied de page : alerte si le timestamp de l\'en-tête est postérieur à celui du pied de page' },
      { type: 'improvement', description: 'Séparation vérif. bascule serveur (SSH logs EmaExtracter/EmmExtracter) et vérif. bascule email ([PNMV3] FIN + [PNM] Controle fichier EMA) en deux étapes distinctes' },
      { type: 'improvement', description: 'Code couleur email/serveur SSH : petite icône colorée (enveloppe ambre, écran cyan) sous chaque nœud de la timeline au lieu d\'un anneau englobant, légende et badge dans le détail' },
      { type: 'fix', description: 'Suppression de l\'étape CTO Bascule tardive/échec (changement d\'offre, pas de portabilité) et Portabilités prévues DIGICEL/WIZZEE (surcouche inutile)' },
      { type: 'fix', description: 'Parser auto-remplissage bascule email : nouveau parser dédié pour les emails [PNMV3] FIN et [PNM] Controle EMA (distinct du parser logs serveur)' },
      { type: 'fix', description: 'Parser acquittements réécrit pour le vrai format PnmDataAckManager.php : détection par nom d\'opérateur (Check success), comptage ACR (E000) et alertes NOT FOUND' },
      { type: 'fix', description: 'Bouton auto-remplissage adapté au type d\'événement : « depuis log serveur » pour les vérifications SSH, « depuis email » pour les mails' },
      { type: 'improvement', description: 'Détection log tronqué : avertissement actionnable si des opérateurs manquent dans le contenu collé (acquittements, bascule serveur, génération PNMDATA) avec suggestion de tail -n plus large' },
      { type: 'improvement', description: 'Commandes tail avec chemins complets du serveur vmqproportasync01 dans les descriptions des dialogs auto-remplissage' },
      { type: 'new', description: 'Dictionnaire complet des codes PNM : 25 codes (17 réponses R1xx-R5xx + 8 erreurs E0xx-E6xx) avec label, description, catégorie, sévérité et action recommandée' },
      { type: 'new', description: 'Procédures d\'investigation par type d\'incident : étapes numérotées avec vérifications PortaWs, contrôles RIO, commandes SSH copiables (logs, SFTP), contacts opérateur et escalade GPMAG' },
      { type: 'improvement', description: 'Analyseur d\'incidents enrichi : chaque ticket affiche le détail du code (description + action) depuis le dictionnaire, avec couleur de sévérité' },
      { type: 'new', description: 'Encart « Localisation SFTP (FileZilla) » dans chaque procédure d\'investigation : adresse serveur copiable, arborescence des 6 dossiers opérateurs (01-06) avec sous-dossiers send/recv/arch_send/arch_recv, chemin exact du fichier incident avec dossier et opérateur surlignés' },
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
