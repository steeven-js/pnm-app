# P17 — Astreinte hebdomadaire

**Categorie :** Exploitation
**Serveur :** Tous serveurs PNM/MOBI
**Utilisateur :** porta_pnmv3 / oracle
**Declencheur :** Semaine d'astreinte assignee

---

## Contexte

L'astreinte couvre la surveillance des systemes PNM et MOBI en dehors des heures ouvrables. Un ticket RT d'astreinte est ouvert en debut de semaine (ex: `[AST] - Astreinte FARDUIN - Semaine du XX/XX/XXXX`).

## Verifications quotidiennes

### 1. Bascule (9H00 jours ouvres)

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

## Verifications specifiques astreinte

### 7. SIM_SWAP WIZZEE

Verifier les SIM_SWAP WIZZEE en retry dans EMA :

```bash
# Voir protocole P18 pour le detail
```

### 8. Nagios

Surveiller les alertes Nagios :
- http://digimqmon05/nagios/cgi-bin/status.cgi?hostgroup=Application

### 9. Tickets RT en attente

Traiter les tickets urgents dans la file APPLICATIONS.

## Cloture

En fin de semaine d'astreinte, mettre a jour le ticket RT d'astreinte avec un resume des evenements de la semaine, puis le fermer.
