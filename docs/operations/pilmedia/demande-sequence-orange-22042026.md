# Demande PILMEDIA — Anomalie séquence PNMDATA Orange du 22/04/2026

**Date :** 23/04/2026
**Plateforme :** Extranet PIL-média (https://extranet.pil-media.com/issues/new)

## Formulaire

| Champ | Valeur |
|-------|--------|
| Projet | DAPI (Porta-v3) |
| Tracker | Anomalie |
| Sujet | Réinitialisation séquence PNMDATA Orange (V2/V3) du 22/04/2026 |
| Statut | Nouveau |
| Priorité | Normal |
| Assigné à | *(à définir)* |
| Début | 23/04/2026 |
| Échéance | *(vide)* |
| Observateurs | Steeven JACQUES, Sarah Mogade, Frédéric Arduin |

## Description

Anomalie de séquence sur les fichiers PNMDATA envoyés à Orange Caraïbe le 22/04/2026.

### Constat

Le compteur de séquence a été réinitialisé entre V1 et V2 pour Orange uniquement :

| Vacation | Fichier | Séquence | Attendu |
|----------|---------|----------|---------|
| V1 | `PNMDATA.02.01.20260422100001.001` | .001 | .001 (OK) |
| V2 | `PNMDATA.02.01.20260422140001.001` | .001 | .002 |
| V3 | `PNMDATA.02.01.20260422190001.002` | .002 | .003 |

### Périmètre

- Opérateur impacté : **Orange Caraïbe (01) uniquement**
- Les autres opérateurs (SFR, DT, UTS, Free) ont des séquences correctes le 22/04
- Le 20/04 et 21/04, les séquences Orange étaient correctes (.001, .002, .003)
- Le 23/04, la V1 est repartie normalement en .001
- Les autres opérateurs (SFR, DT, UTS, Free) n'étaient pas impactés le 22/04

### Impact

- Pas d'impact fonctionnel (ACR Orange reçus pour V1 et V2)
- Supervision APP_OCS remonte V2 et V3 en KO

### Également constaté en V3 (sans lien direct)

- Fichier `.ERR` pour SFR : `PNMDATA.02.03.20260422190020.003.ERR`
- Erreur E011 : ACR non reçu de SFR après 60 minutes
- Pas d'impact, le fichier a bien été envoyé

### Demande

Identifier la cause de la réinitialisation du compteur de séquence Orange entre V1 et V2 le 22/04.
