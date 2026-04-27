# PILMEDIA — Points à discuter avec Sarah

**Date :** 23/04/2026

## 1. Fusion processeurs ACK (ticket #5175)

Max propose de fusionner `PnmDataAckGenerator` dans `PnmDataAckManager`.

**Situation actuelle :**

| Processeur | Périmètre | Scripts | Session ACK |
|------------|-----------|---------|-------------|
| `PnmAckManager` | DATA + SYNC | 1 | `ACK` |
| `PnmSyncAckManager` | SYNC seul | 1 | `ACK_SYNC` |
| `PnmDataAckManager` + `PnmDataAckGenerator` | DATA seul | 2 | `ACK_DATA` |

**Proposition :** passer de 2 scripts à 1 pour le DATA ACK, comme les deux autres.

**Position :** fusion envisageable, vérifier l'impact sur l'acquittement et l'intégration des fichiers.

→ À valider avec Sarah. Voir aussi [processeurs-ack-staging.md](processeurs-ack-staging.md).

## 2. Tests scripts PortaSync (staging)

Max a déployé les scripts refactorisés sur staging. Code refondu en profondeur, pas de changement de comportement annoncé.

**Plan de test :**

1. Créer des mandats de portage en mode dégradé
2. Lancer les scripts sur staging
3. Attendre une bascule, vérifier `EmaExtracter`
4. Comparer résultats staging

**Deadline :** avant la prochaine release PILMEDIA.

## 3. Envoi SMS depuis DAPI (ticket #4986)

Pas prioritaire. À voir avec Sarah pour la planification, après la correction des bugs importants.

## 4. Emails DAPI d'intégration

Voir avec Sarah : garder l'email de l'équipe ou mettre uniquement celui de Steeven pour les emails DAPI d'intégration.

**Config actuelle :** http://172.24.114.86:8080/PortaWs/index.jsp?m=operateur (page Admin Portal — Liste des opérateurs, champ « email »).

## Actions

- [ ] Valider la fusion ACK avec Sarah
- [ ] Planifier les tests staging avec Max
- [ ] Décider de la config email DAPI avec Sarah
- [ ] Répondre à Max sur le ticket #4986 (SMS)
