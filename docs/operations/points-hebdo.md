# Points hebdomadaires

**Public :** Frédéric Arduin et Benoît Pelage (mon responsable).
**Périmètre :** tout ce qui remonte dans la semaine, pas seulement la portabilité et pas seulement les vacations — PNM, MOBI/CRM, tickets RT, outillage, projets.

**But :** aide-mémoire pour l'oral. Une idée par phrase, les chiffres sont là pour être cités tels quels, pas de détail technique — il est dans les tickets référencés.

**Comment s'en servir :** le tableau ci-dessous donne l'état permanent des sujets ouverts, à relire avant d'entrer en réunion. Les sections datées en dessous racontent ce qui a bougé chaque semaine, la plus récente en premier, classées par domaine.

---

## Sujets ouverts

| Sujet | Domaine | Depuis | Où ça en est | Référence |
|-------|---------|--------|--------------|-----------|
| Accusé non généré (bug du web service) | PNM | 30/07/2026 | Ouvert chez PIL-média, **toujours pas pris en charge** | Redmine #5263 |
| Fichiers exposés sous un nom provisoire | PNM | 18/08/2026 | Ouvert chez PIL-média | Redmine #5265 |
| Écart de synchronisation Orange | PNM | 17/08/2026 | En attente d'explication sur la bascule du 24/06 | mail Fred + Willy |
| UTS ne répond plus | PNM | 19/06/2026 | Relancé début juillet, sans retour | — |

**Le levier du point hebdo :** les deux demandes chez PIL-média. #5263 traîne depuis le 30/07 sans prise en charge.

---

# Semaine du 18/08/2026

## PNM / Portabilité

### Les fichiers qu'on envoie sortent parfois avec un nom provisoire

Quand on génère un fichier pour un opérateur, il est écrit sous un nom provisoire en `.tmp` dans le répertoire où les opérateurs viennent le chercher. Il est renommé 5 secondes plus tard.

Pendant ces 5 secondes, l'opérateur peut le ramasser. Il reçoit alors un fichier au mauvais nom et le rejette.

C'est arrivé **4 fois depuis le 05/07** : deux fois chez Dauphin en juillet, une fois chez Dauphin et une fois chez Free le 17/08.

Dauphin et Free nous ont écrit pour demander quoi faire de ces fichiers. Je leur ai répondu de les ignorer et de les supprimer.

*Où ça en est :* demande **#5265** ouverte chez PIL-média le 18/08. La correction est simple — écrire le fichier ailleurs et ne le déposer qu'une fois terminé.

> À dire : « ce n'est pas grave à chaque fois, mais ça use la relation avec les opérateurs et ça finit par nous coûter du temps. »

### Cas Dauphin du 17/08 — leur accusé est inexploitable

Même cause que ci-dessus, avec une conséquence de plus.

Dauphin a accusé le fichier au mauvais nom. Notre système refuse leur accusé, parce que le nom ne correspond à rien de connu.

Leur accusé tournait en boucle toutes les 10 minutes. Je l'ai sorti à la main le 17/08, la boucle est éteinte.

Surtout : **les 21 opérations de cette vacation ne sont pas passées chez Dauphin**, puisqu'ils ont rejeté le fichier.

*Où ça en est :* c'est dans la même demande #5265.

### SFR — accusé du 13/08 jamais parti

SFR nous a relancés le 17/08 : ils n'avaient pas reçu notre accusé pour leur fichier du 13/08 au soir.

Vérification faite, leur fichier était bien arrivé et entièrement intégré, **les 34 opérations sont traitées**. Seul l'accusé manquait.

La cause est un bug connu de notre web service, qui plante pendant la génération de l'accusé.

J'ai fabriqué l'accusé à la main et je l'ai déposé le 17/08. SFR l'a récupéré dans les minutes qui ont suivi, et a été prévenu.

*Où ça en est :* bug ouvert chez PIL-média depuis le 30/07, demande **#5263**. Toujours pas pris en charge.

> À dire : « aucune donnée perdue, c'est l'accusé seul qui manquait. »

### Free — vacation du soir arrivée le lendemain

Leur fichier du 17/08 19:15 nous est arrivé le 18/08 à 10h00, soit **15 heures de retard**. Le retard vient de chez eux.

On l'a traité et accusé en 30 secondes une fois arrivé.

C'est exceptionnel : sur **901 fichiers depuis le 1er mai**, c'est le seul qui ait mis plus de 12 heures. 898 sont accusés en moins d'une heure.

*Où ça en est :* rien à faire de notre côté, échange clos avec Free.

> À dire : « notre seuil d'alerte à 60 minutes est bien calibré, on est hors norme dans 99,7 % des cas au-delà. »

### Orange — 20 numéros en écart sur le fichier de synchro

Orange nous signale le 17/08 que **20 numéros** ne concordent pas entre leur référentiel et le nôtre.

**12 des 20** ont été modifiés par la même bascule, celle du 24/06.

Sur au moins 3 numéros, c'est nous qui avons tort : ils étaient partis chez Free depuis 2022 et on les redéclare à nous. Sur 2 autres, c'est Orange qui est en retard.

Ce qu'on ne sait pas encore : pourquoi la bascule du 24/06 a repris ces numéros. Tant qu'on ne le sait pas, on ne corrige pas — sinon on risque de défaire quelque chose de voulu.

*Où ça en est :* mail prêt pour Fred et Willy, pas encore envoyé.

> À dire : « je ne veux pas corriger à l'aveugle, j'attends de savoir ce qu'était cette bascule. »

### UTS — toujours muet

L'opérateur UTS ne répond plus depuis le 19/06. **122 de nos fichiers** sont partis sans jamais recevoir d'accusé.

*Où ça en est :* mail envoyé sans retour, relance début juillet.

> À dire : « ce n'est pas un problème technique chez nous, c'est un opérateur qui ne répond pas. À escalader si ça dure. »

### Bruit récurrent à ne pas confondre avec un incident

On envoie à Dauphin une alerte « accusé non reçu » chaque lundi matin, alors qu'ils n'accusent que le dimanche soir suivant. Faux positif hebdomadaire, systématique. Même mécanique avec UTS.

> À dire : « quand on voit ces alertes, ce n'est pas la peine de partir en investigation, c'est connu. »

## MOBI / CRM

### Accès Topage — une demande restée cinq mois sans intervenant

Demande de mars pour ouvrir l'onglet Topage à un agent. Elle était encore en statut « nouveau », sans intervenant assigné. Traitée le 17/08.

> À dire : « le sujet n'est pas l'accès en lui-même, c'est qu'une demande puisse rester cinq mois sans que personne ne se l'attribue. »

## Outillage

### Un script pour les demandes de droits CRM

Il n'existait aucun script pour ouvrir **un** droit sur un compte CRM existant — seulement des scripts de création de compte, qui clonent tous les droits d'un compte modèle et ne conviennent donc pas.

J'en ai écrit un. Il vérifie que le compte existe, que le groupe existe, que le droit n'est pas déjà posé, demande confirmation, puis **poste automatiquement sa trace en commentaire du ticket**.

*Où ça en est :* en place et testé. Réutilisable pour les prochaines demandes du même type, qui reviennent régulièrement.

> À dire : « une demande récurrente qui prenait du temps à la main est maintenant outillée, avec la traçabilité automatique dans le ticket. »

## Reporting

### Liste de diffusion du rapport PSO

Ajout d'un destinataire au rapport quotidien, sur demande du CC. Fait le 14/08, effectif au premier envoi suivant.

Demande récurrente et sans difficulté, mentionnée seulement pour le volume.

---

<!--
MODÈLE POUR LA SEMAINE SUIVANTE — copier ce bloc au-dessus de la semaine précédente

# Semaine du JJ/MM/AAAA

## PNM / Portabilité
## MOBI / CRM
## Tickets RT
## Outillage
## Projets
## Reporting

Pour chaque point : quelques phrases courtes, une ligne *Où ça en est :*,
et un « À dire » quand la formulation orale mérite d'être préparée.
Supprimer les sections de domaine sans actualité.
-->
