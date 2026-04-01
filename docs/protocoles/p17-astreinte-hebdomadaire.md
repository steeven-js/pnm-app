# P17 — Astreinte hebdomadaire

**Categorie :** Exploitation
**Serveur :** Tous serveurs PNM/MOBI
**Utilisateur :** porta_pnmv3 / oracle
**Declencheur :** Semaine d'astreinte assignee
**Frequence :** ~499 tickets/an categorie "Astreinte"

---

## Contexte

L'astreinte couvre la surveillance des systemes PNM et MOBI en dehors des heures ouvrables. Un ticket RT d'astreinte est ouvert en debut de semaine avec le format : `[AST] - Astreinte [NOM] - Semaine du XX/XX/XXXX au XX/XX/XXXX`.

Le ticket sert de **journal de bord** : chaque action effectuee pendant l'astreinte est documentee comme commentaire (date, heure, action, resultat).

## Verifications quotidiennes (jours ouvres)

### 1. Bascule (9H00)

- Verifier l'email `[PNMV3] Verification Bascule Porta MOBI`
- Tous les operateurs OK (EmaExtracter + EmmExtracter) ?
- Fin de traitement confirmee ?
- Si KO → voir protocole P16 (Rollback DAPI)

### 2. FNR (apres bascule)

- Verifier l'email `[PNM] Presence batchhandler FNR_V3 sur EMA`
- Fichier present ? Commandes OK > 50% ?
- Si KO → voir protocole P27 (Controle FNR)

### 3. Generation PNMDATA (10H, 14H, 19H)

- Verifier les logs PnmDataManager
- 5 operateurs generes (01, 03, 04, 05, 06) ?
- Voir protocole P10

### 4. Acquittements (apres chaque vacation)

- Verifier les logs PnmAckManager
- Tous les operateurs "Check success" ?
- Voir protocole P09

### 5. Vacations (11H35, 15H35, 20H35)

- Verifier les fichiers echanges sur le sFTP
- Pas de fichier .ERR ?

### 6. PSO — Resiliations

- Verifier si des MSISDN PSO non resilies
- Si oui → voir protocole P11 (Resiliation manuelle)

## Verifications specifiques astreinte (week-end)

### 7. Check WIZZEE quotidien

Le check WIZZEE est la tache principale du week-end. Il consiste a verifier dans EMA les erreurs de traitement WIZZEE et les corriger.

**Types d'erreurs rencontrees :**

| Erreur | Description | Action |
|--------|-------------|--------|
| Change resource SIM_SWAP problem | Echec du changement de SIM | Retry via EMA. Si persiste apres 2 retries → creer ticket @DEV |
| createChargesAndDueBalances_1=204 | Erreur de facturation WIZZEE | Checker avec team WIZZEE (noter le billingAccountOuid) |
| createNetworkExchange_1=408 | Timeout echange reseau | Retry — generalement OK au 2e essai |
| Termination on EMA failed | Echec resiliation sur EMA | Retry — generalement OK au 2e essai |

**Procedure de retry :**
1. Identifier l'erreur dans le dashboard EMA
2. Cliquer sur "Retry" pour chaque cas en erreur
3. Verifier que le retry a abouti (statut OK)
4. Si echec persistant apres 2 retries : escalader vers @DEV ou team WIZZEE
5. Documenter chaque action dans le ticket RT d'astreinte

(Voir ticket #276367 — exemple d'astreinte avec SIM_SWAP, billing, network exchange et EMA termination)

### 8. Nagios

Surveiller les alertes Nagios :
```
http://digimqmon05/nagios/cgi-bin/status.cgi?hostgroup=Application
```

Verifier :
- Pas d'alerte CRITICAL sur les serveurs PNM/MOBI
- Les services sont en etat OK ou WARNING (WARNING peut etre temporaire)

### 9. Tickets RT en attente

Traiter les tickets urgents (priorite High) dans la file APPLICATIONS.
Les tickets Low peuvent attendre le lundi sauf indication contraire.

## Modification crontab pour jours feries

Quand un jour ferie tombe en semaine, la crontab de production doit etre modifiee pour exclure ce jour des traitements PNM.

**Serveur :** vmqproportasync01

**Avant le ferie :**
```bash
su - root
vi /etc/crontab
# Changer tous les "* * 1-5" en "* * 1,2,3,5" (si le ferie est un jeudi = jour 4)
```

**Scripts concernes :**
- PnmDataManager.sh (3 vacations : 10h, 14h, 19h)
- TraitementBascule.sh (09h)
- TraitementValorisation.sh (09h01)
- PnmSyncManager (dimanche 23h)
- PnmDataAckGenerator.sh (11h15, 15h15, 20h15)
- check_envoi_vacation.sh
- porta_check.sh
- Purge logs EMM/EMA (mardi 03h)

**Apres le ferie :**
```bash
su - root
vi /etc/crontab
# Remettre "* * 1-5" pour toutes les entrees
```

> **Attention :** Ne pas oublier de remettre la crontab apres le ferie ! Deleguer a un collegue si necessaire (ex: Steeven remet "1-5" pendant que Frederic modifie avant le ferie).

(Voir ticket #276246 — modification crontab pour jour ferie du 12/03/2026)

## Cloture de l'astreinte

En fin de semaine d'astreinte, mettre a jour le ticket RT d'astreinte avec un resume structure :

```
Samedi JJ/MM :
- X Change resource SIM_SWAP problem -> Y retry OK, Z escalade @DEV
- X createNetworkExchange_1=408 -> Retry OK
- X Termination on EMA failed -> Retry OK

Dimanche JJ/MM :
- X Change resource SIM_SWAP problem -> Retry OK
- RAS (si rien a signaler)
```

Puis fermer le ticket (statut : resolu).
