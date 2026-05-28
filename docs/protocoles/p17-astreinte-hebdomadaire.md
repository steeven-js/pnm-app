# P17 — Astreinte hebdomadaire

**Catégorie :** Exploitation
**Serveur :** Tous serveurs PNM/MOBI
**Utilisateur :** porta_pnmv3 / oracle
**Déclencheur :** Semaine d'astreinte assignée
**Fréquence :** ~499 tickets/an catégorie "Astreinte"

---

## Contexte

L'astreinte couvre la surveillance des systèmes PNM et MOBI en dehors des heures ouvrables. Un ticket RT d'astreinte est ouvert en début de semaine avec le format : `[AST] - Astreinte [NOM] - Semaine du XX/XX/XXXX au XX/XX/XXXX`.

Le ticket sert de **journal de bord** : chaque action effectuée pendant l'astreinte est documentée comme commentaire (date, heure, action, résultat).

## Vérifications quotidiennes (jours ouvrés)

### 1. Bascule (9H00)

- Vérifier l'email `[PNMV3] Verification Bascule Porta MOBI`
- Tous les opérateurs OK (EmaExtracter + EmmExtracter) ?
- Fin de traitement confirmée ?
- Si KO → voir protocole P16 (Rollback DAPI)

### 2. FNR (après bascule)

- Vérifier l'email `[PNM] Presence batchhandler FNR_V3 sur EMA`
- Fichier présent ? Commandes OK > 50% ?
- Si KO → voir protocole P27 (Contrôle FNR)

### 3. Génération PNMDATA (10H, 14H, 19H)

- Vérifier les logs PnmDataManager
- 5 opérateurs générés (01, 03, 04, 05, 06) ?
- Voir protocole P10

### 4. Acquittements (après chaque vacation)

- Vérifier les logs PnmAckManager
- Tous les opérateurs "Check success" ?
- Voir protocole P09

### 5. Vacations (11H35, 15H35, 20H35)

- Vérifier les fichiers échangés sur le sFTP
- Pas de fichier .ERR ?

### 6. PSO — Résiliations

- Vérifier si des MSISDN PSO non résiliés
- Si oui → voir protocole P11 (Résiliation manuelle)

## Vérifications spécifiques astreinte (week-end)

### 7. Check WIZZEE quotidien

Le check WIZZEE est la tâche principale du week-end. Il consiste à relever les erreurs WIZZEE et les adresser aux équipes concernées.

> **Important :** L'équipe Application n'intervient **pas directement** sur la plateforme WIZZEE. On relève les erreurs et on les transmet à l'équipe VAS ou DEV.

**Types d'erreurs et équipes à contacter :**

| Erreur | Description | Équipe |
|--------|-------------|--------|
| Change resource SIM_SWAP problem | Échec du changement de SIM | Équipe DEV (ticket) |
| createChargesAndDueBalances_1=204 | Erreur de facturation WIZZEE | Équipe VAS |
| createNetworkExchange_1=408 | Timeout échange réseau | Équipe VAS |
| Termination on EMA failed | Échec résiliation sur EMA | Équipe VAS |

**Procédure :**
1. Relever les erreurs WIZZEE (alertes/emails)
2. Identifier le type d'erreur et le MSISDN concerné
3. Adresser à l'équipe VAS ou créer un ticket @DEV selon le type
4. Documenter chaque action dans le ticket RT d'astreinte

(Voir ticket #276367 — exemple d'astreinte avec SIM_SWAP, billing, network exchange et EMA termination)

### 8. Nagios

Surveiller les alertes Nagios :
```
http://digimqmon05/nagios/cgi-bin/status.cgi?hostgroup=Application
```

Vérifier :
- Pas d'alerte CRITICAL sur les serveurs PNM/MOBI
- Les services sont en état OK ou WARNING (WARNING peut être temporaire)

### 9. Tickets RT en attente

Traiter les tickets urgents (priorité High) dans la file APPLICATIONS.
Les tickets Low peuvent attendre le lundi sauf indication contraire.

## Modification crontab pour jours fériés

Quand un jour férié tombe en semaine, la crontab de production doit être modifiée pour exclure ce jour des traitements PNM.

**Serveur :** vmqproportasync01

**Avant le férié :**
```bash
su - root
vi /etc/crontab
# Changer tous les "* * 1-5" en "* * 1,2,3,5" (si le férié est un jeudi = jour 4)
```

**Scripts concernés :**
- PnmDataManager.sh (3 vacations : 10h, 14h, 19h)
- TraitementBascule.sh (09h)
- TraitementValorisation.sh (09h01)
- PnmSyncManager (dimanche 23h)
- PnmDataAckGenerator.sh (11h15, 15h15, 20h15)
- check_envoi_vacation.sh
- porta_check.sh
- Purge logs EMM/EMA (mardi 03h)

**Apres le férié :**
```bash
su - root
vi /etc/crontab
# Remettre "* * 1-5" pour toutes les entrees
```

> **Attention :** Ne pas oublier de remettre la crontab après le férié ! Déléguer à un collègue si nécessaire (ex: Steeven remet "1-5" pendant que Frederic modifie avant le férié).

(Voir ticket #276246 — modification crontab pour jour férié du 12/03/2026)

## Clôture de l'astreinte

En fin de semaine d'astreinte, mettre à jour le ticket RT d'astreinte avec un résumé structuré :

```
Samedi JJ/MM :
- X Change resource SIM_SWAP problem -> Y retry OK, Z escalade @DEV
- X createNetworkExchange_1=408 -> Retry OK
- X Termination on EMA failed -> Retry OK

Dimanche JJ/MM :
- X Change resource SIM_SWAP problem -> Retry OK
- RAS (si rien a signaler)
```

Puis fermer le ticket (statut : résolu).
