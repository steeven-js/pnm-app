# PILMEDIA — Processeurs ACK & scripts PortaSync staging

**Date :** 23/04/2026
**Participants :** Sarah Mogade, Steeven Jacques, Max Morawski

## 1. Fusion des processeurs ACK (mail du 21/04/2026)

### Contexte

Max a identifié 3 catégories de processeurs ACK avec une incohérence dans la structure :

- **`PnmAckManager`** → traite PNMDATA + PNMSYNC ensemble (session type : `ACK`)
- **`PnmSyncAckManager`** → traite PNMSYNC uniquement (session type : `ACK_SYNC`)
- **`PnmDataAckManager`** → traite PNMDATA uniquement
  **`PnmDataAckGenerator`** → se synchronise avec le serveur (session type : `ACK_DATA`)

Le cas DATA est divisé en 2 scripts alors que les deux autres n'en utilisent qu'un seul chacun.

### Proposition de Max

Fusionner `PnmDataAckGenerator` dans `PnmDataAckManager` pour aligner le fonctionnement avec `PnmAckManager` et `PnmSyncAckManager`.

### Notre position

La fusion est envisageable **mais** il faut vérifier l'impact sur :

- L'acquittement des fichiers PNMDATA
- L'intégration des fichiers par les opérateurs
- Le timing des ACR (V1, V2, V3)
- Le comportement de `check_envoi_vacation.sh` (timeout 60 min)

### Questions à poser à Max

- La fusion modifie-t-elle le timing d'envoi des ACR ?
- Y a-t-il un risque de régression sur l'acquittement ?
- Peut-on tester en staging avec des fichiers réels ?

**Lien :** ticket PILMEDIA #5175.

## 2. Scripts PortaSync mis à jour en staging (mail du 22/04/2026)

### Contexte

Max a déployé les scripts PortaSync refactorisés sur le serveur de staging. Le code a changé en profondeur mais sans changement de comportement annoncé.

### Plan de test proposé

#### Étape 1 — Créer des mandats de portage en mode dégradé

Créer manuellement des fichiers PNMDATA de test contenant :

- 1110 (demande de portage)
- 1210 (réponse OPD)
- 1410 (ordre de portage)
- 1430 (confirmation portage)

Les déposer dans les répertoires d'entrée du staging.

#### Étape 2 — Lancer les scripts et vérifier le traitement

Exécuter les scripts sur staging :

- `PnmDataManager.sh` (intégration fichiers)
- `PnmAckManager.sh` (génération ACR)
- `PnmDataAckManager.sh` (acquittement PNMDATA)
- `PnmSyncManager.sh` (si sync concerné)

Vérifier :

- Les fichiers sont correctement déplacés (`recv` → `arch_recv`)
- Les ACR sont générés (`arch_send`)
- Pas d'erreur dans les logs

#### Étape 3 — Attendre une bascule et vérifier `EmaExtracter`

Si possible, laisser un cycle complet se dérouler :

- Bascule automatique (si mandats de test acceptés)
- `EmaExtracter` / `EmmExtracter`
- Vérifier que les scripts de post-bascule fonctionnent

#### Étape 4 — Comparer les résultats staging vs production

Comparer les logs et fichiers générés entre staging et production pour s'assurer qu'il n'y a pas de divergence.

### Deadline

Avant la prochaine release PILMEDIA (date à confirmer avec Max).

## 3. Ticket #4986 — Envoi SMS depuis DAPI

### Contexte

Implémentation de la fonctionnalité d'envoi de SMS depuis DAPI. Max demande si c'est prioritaire ou si ça peut attendre.

### Notre position

- Pas prioritaire
- À voir avec Sarah pour la planification
- Après la correction des bugs importants (dont #5175)

## Actions à mener

- [ ] Discuter avec Sarah de la fusion des processeurs ACK
- [ ] Planifier les tests des scripts staging avec Max
- [ ] Créer des fichiers PNMDATA de test pour le staging
- [ ] Tester les scripts refactorisés (avant prochaine release)
- [ ] Répondre à Max sur la priorité du ticket #4986 (SMS)
- [ ] Vérifier les « chemins étranges » corrigés par Max
