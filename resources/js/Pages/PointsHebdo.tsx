import { Head } from '@inertiajs/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { DashboardLayout } from 'src/layouts/dashboard/layout';

// ----------------------------------------------------------------------

type OpenSubject = {
  subject: string;
  domain: string;
  since: string;
  status: string;
  ref: string;
};

type Item = {
  title: string;
  body: string[];
  where?: string;
  say?: string;
};

type Domain = {
  domain: string;
  items: Item[];
};

type Week = {
  week: string;
  domains: Domain[];
};

const OPEN_SUBJECTS: OpenSubject[] = [
  {
    subject: 'Accusé non généré (bug du web service)',
    domain: 'PNM',
    since: '30/07/2026',
    status: 'Ouvert chez PIL-média, toujours pas pris en charge',
    ref: 'Redmine #5263',
  },
  {
    subject: 'Fichiers exposés sous un nom provisoire',
    domain: 'PNM',
    since: '18/08/2026',
    status: 'Ouvert chez PIL-média, complété le 18/08 avec un troisième symptôme',
    ref: 'Redmine #5265',
  },
  {
    subject: 'Écart de synchronisation Orange',
    domain: 'PNM',
    since: '17/08/2026',
    status: "En attente d'explication sur la bascule du 24/06",
    ref: 'Mail Fred + Willy',
  },
  {
    subject: 'UTS ne répond plus',
    domain: 'PNM',
    since: '19/06/2026',
    status: 'Relancé début juillet, sans retour',
    ref: '—',
  },
];

const WEEKS: Week[] = [
  {
    week: 'Semaine du 18/08/2026',
    domains: [
      {
        domain: 'PNM / Portabilité',
        items: [
          {
            title: 'La vacation de 14h du 18/08 — le même bug dans les deux sens à la même seconde',
            body: [
              'Le bug du web service est retombé à 14:00:09, cette fois sur les deux flux en même temps.',
              "Côté SFR, l'accusé de leur fichier n'a pas été généré. Côté Orange, notre fichier de la vacation n'est jamais parti, il est resté bloqué.",
              "Puis un effet de bord qu'on n'avait pas identifié : comme notre base n'a pas enregistré le fichier envoyé à Orange, on est devenus incapables d'accepter leur accusé. Ils ont bien reçu et validé notre fichier, mais leur réponse a été refusée chez nous et s'est mise à tourner en boucle.",
              'Trois interventions manuelles pour une seule vacation. Rien de perdu au final : les 15 opérations de SFR sont en base, les 9 d\'Orange sont chez eux, acquittées deux minutes après le dépôt.',
            ],
            where: 'Tout est rétabli le jour même. La demande #5265 a été complétée avec ces éléments.',
            say: "Le problème n'est pas qu'on perde des données, c'est qu'on n'en perd pas et que personne ne s'en rende compte. Ça n'a alerté nulle part, c'est moi qui suis allé voir.",
          },
          {
            title: "Un cas identique du 24/07 retrouvé, jamais détecté à l'époque",
            body: [
              "En cherchant les fichiers restés bloqués, j'en ai trouvé un du 24 juillet au soir, vers Orange, coincé de la même façon.",
              "Personne ne l'a vu à l'époque. Les opérations sont reparties d'elles-mêmes à la vacation suivante, le lundi matin — donc pas de perte, mais un décalage de deux jours et demi qu'aucune alerte n'a signalé.",
              "La cause technique n'était d'ailleurs pas la même que celle d'aujourd'hui : deux défauts différents produisent exactement le même symptôme.",
            ],
            say: "Ça montre que le cas n'est pas nouveau, juste invisible. On ne le voit que quand on va le chercher.",
          },
          {
            title: "Les fichiers qu'on envoie sortent parfois avec un nom provisoire",
            body: [
              "Quand on génère un fichier pour un opérateur, il est écrit sous un nom provisoire dans le répertoire où les opérateurs viennent le chercher. Il est renommé 5 secondes plus tard.",
              "Pendant ces 5 secondes, l'opérateur peut le ramasser. Il reçoit alors un fichier au mauvais nom et le rejette.",
              "C'est arrivé 4 fois depuis le 05/07 : deux fois chez Dauphin en juillet, une fois chez Dauphin et une fois chez Free le 17/08.",
              "Dauphin et Free nous ont écrit pour demander quoi faire de ces fichiers. Je leur ai répondu de les ignorer et de les supprimer.",
            ],
            where: 'Demande #5265 ouverte chez PIL-média le 18/08. La correction est simple — écrire le fichier ailleurs et ne le déposer qu\'une fois terminé.',
            say: "Ce n'est pas grave à chaque fois, mais ça use la relation avec les opérateurs et ça finit par nous coûter du temps.",
          },
          {
            title: 'SFR — accusé du 13/08 jamais parti',
            body: [
              "SFR nous a relancés le 17/08 : ils n'avaient pas reçu notre accusé pour leur fichier du 13/08 au soir.",
              'Vérification faite, leur fichier était bien arrivé et entièrement intégré, les 34 opérations sont traitées. Seul l\'accusé manquait.',
              "J'ai fabriqué l'accusé à la main et je l'ai déposé le 17/08. SFR l'a récupéré dans les minutes qui ont suivi, et a été prévenu.",
            ],
            where: 'Bug ouvert chez PIL-média depuis le 30/07, demande #5263. Toujours pas pris en charge.',
            say: "Aucune donnée perdue, c'est l'accusé seul qui manquait.",
          },
          {
            title: 'Free — vacation du soir arrivée le lendemain',
            body: [
              'Leur fichier du 17/08 19:15 nous est arrivé le 18/08 à 10h00, soit 15 heures de retard. Le retard vient de chez eux.',
              "On l'a traité et accusé en 30 secondes une fois arrivé.",
              "C'est exceptionnel : sur 901 fichiers depuis le 1er mai, c'est le seul qui ait mis plus de 12 heures. 898 sont accusés en moins d'une heure.",
            ],
            where: 'Rien à faire de notre côté, échange clos avec Free.',
            say: "Notre seuil d'alerte à 60 minutes est bien calibré, on est hors norme dans 99,7 % des cas au-delà.",
          },
          {
            title: 'Orange — 20 numéros en écart sur le fichier de synchro',
            body: [
              'Orange nous signale le 17/08 que 20 numéros ne concordent pas entre leur référentiel et le nôtre.',
              '12 des 20 ont été modifiés par la même bascule, celle du 24/06.',
              "Sur au moins 3 numéros, c'est nous qui avons tort : ils étaient partis chez Free depuis 2022 et on les redéclare à nous. Sur 2 autres, c'est Orange qui est en retard.",
              "Ce qu'on ne sait pas encore : pourquoi la bascule du 24/06 a repris ces numéros. Tant qu'on ne le sait pas, on ne corrige pas — sinon on risque de défaire quelque chose de voulu.",
            ],
            where: 'Mail prêt pour Fred et Willy, pas encore envoyé.',
            say: "Je ne veux pas corriger à l'aveugle, j'attends de savoir ce qu'était cette bascule.",
          },
          {
            title: 'UTS — toujours muet',
            body: [
              "L'opérateur UTS ne répond plus depuis le 19/06. 122 de nos fichiers sont partis sans jamais recevoir d'accusé.",
            ],
            where: 'Mail envoyé sans retour, relance début juillet.',
            say: "Ce n'est pas un problème technique chez nous, c'est un opérateur qui ne répond pas. À escalader si ça dure.",
          },
          {
            title: 'Bruit récurrent à ne pas confondre avec un incident',
            body: [
              "On envoie à Dauphin une alerte « accusé non reçu » chaque lundi matin, alors qu'ils n'accusent que le dimanche soir suivant. Faux positif hebdomadaire, systématique. Même mécanique avec UTS.",
            ],
            say: "Quand on voit ces alertes, ce n'est pas la peine de partir en investigation, c'est connu.",
          },
        ],
      },
      {
        domain: 'MOBI / CRM',
        items: [
          {
            title: 'Accès Topage — une demande restée cinq mois sans intervenant',
            body: [
              "Demande de mars pour ouvrir l'onglet Topage à un agent. Elle était encore en statut « nouveau », sans intervenant assigné. Traitée le 17/08.",
            ],
            say: "Le sujet n'est pas l'accès en lui-même, c'est qu'une demande puisse rester cinq mois sans que personne ne se l'attribue.",
          },
        ],
      },
      {
        domain: 'Outillage',
        items: [
          {
            title: 'Un script pour les demandes de droits CRM',
            body: [
              "Il n'existait aucun script pour ouvrir un droit sur un compte CRM existant — seulement des scripts de création de compte, qui clonent tous les droits d'un compte modèle et ne conviennent donc pas.",
              "J'en ai écrit un. Il vérifie que le compte existe, que le groupe existe, que le droit n'est pas déjà posé, demande confirmation, puis poste automatiquement sa trace en commentaire du ticket.",
            ],
            where: 'En place et testé. Réutilisable pour les prochaines demandes du même type, qui reviennent régulièrement.',
            say: "Une demande récurrente qui prenait du temps à la main est maintenant outillée, avec la traçabilité automatique dans le ticket.",
          },
        ],
      },
      {
        domain: 'Reporting',
        items: [
          {
            title: 'Liste de diffusion du rapport PSO',
            body: [
              "Ajout d'un destinataire au rapport quotidien, sur demande du CC. Fait le 14/08, effectif au premier envoi suivant.",
              'Demande récurrente et sans difficulté, mentionnée seulement pour le volume.',
            ],
          },
        ],
      },
    ],
  },
];

// ----------------------------------------------------------------------

export default function PointsHebdo() {
  return (
    <DashboardLayout>
      <Head title="Points hebdomadaires" />

      <Box sx={{ p: { xs: 3, md: 5 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4">Points hebdomadaires</Typography>
          <Typography sx={{ mt: 1, color: 'text.secondary' }}>
            Aide-mémoire pour le point avec Frédéric Arduin et Benoît Pelage. Une idée par phrase, les
            chiffres sont là pour être cités tels quels — le détail technique est dans les tickets.
          </Typography>
        </Box>

        <Card sx={{ p: 3, mb: 5 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Sujets ouverts
          </Typography>

          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sujet</TableCell>
                  <TableCell>Domaine</TableCell>
                  <TableCell>Depuis</TableCell>
                  <TableCell>Où ça en est</TableCell>
                  <TableCell>Référence</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {OPEN_SUBJECTS.map((s) => (
                  <TableRow key={s.subject}>
                    <TableCell sx={{ fontWeight: 'fontWeightMedium' }}>{s.subject}</TableCell>
                    <TableCell>
                      <Chip label={s.domain} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{s.since}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{s.status}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{s.ref}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography sx={{ mt: 2, color: 'text.secondary' }}>
            <strong>Le levier du point :</strong> les deux demandes chez PIL-média. #5263 traîne depuis
            le 30/07 sans prise en charge.
          </Typography>
        </Card>

        {WEEKS.map((week) => (
          <Box key={week.week} sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              {week.week}
            </Typography>

            {week.domains.map((domain) => (
              <Box key={domain.domain} sx={{ mb: 4 }}>
                <Typography
                  variant="overline"
                  sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}
                >
                  {domain.domain}
                </Typography>

                <Stack spacing={2}>
                  {domain.items.map((item) => (
                    <Card key={item.title} sx={{ p: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                        {item.title}
                      </Typography>

                      {item.body.map((p) => (
                        <Typography key={p} sx={{ mb: 1.5, color: 'text.secondary' }}>
                          {p}
                        </Typography>
                      ))}

                      {item.where && (
                        <Typography sx={{ mb: 1.5, fontStyle: 'italic' }}>
                          Où ça en est : {item.where}
                        </Typography>
                      )}

                      {item.say && (
                        <Box
                          sx={{
                            mt: 2,
                            p: 2,
                            borderLeft: (theme) => `3px solid ${theme.palette.primary.main}`,
                            bgcolor: 'background.neutral',
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            À dire
                          </Typography>
                          <Typography>« {item.say} »</Typography>
                        </Box>
                      )}
                    </Card>
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </DashboardLayout>
  );
}
