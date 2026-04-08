# P18 — Verification SIM_SWAP WIZZEE (Astreinte)

**Categorie :** Debug / Diagnostic
**Serveur :** EMA (digimqema01)
**Utilisateur :** batchusr
**Declencheur :** Astreinte hebdomadaire (week-end)

---

## Contexte

Les SIM_SWAP WIZZEE peuvent rester en statut "retry" ou "failed" dans EMA suite a des echecs de traitement. Ces cas doivent etre verifies quotidiennement pendant l'astreinte du week-end et relances manuellement si necessaire.

WIZZEE est le systeme de facturation/echange qui gere les operations de provisioning (SIM swap, billing, network exchange, resiliation). Les erreurs les plus courantes sont temporaires et se resolvent par un simple retry.

## Types d'erreurs WIZZEE

| Code erreur | Type | Description | Action standard |
|-------------|------|-------------|-----------------|
| Change resource SIM_SWAP problem | Provisioning | Echec du changement de ressource SIM | Retry (max 2). Si persiste → ticket @DEV |
| createChargesAndDueBalances_1=204 | Billing | Erreur de creation de charges WIZZEE | Checker avec team WIZZEE. Noter le `billingAccountOuid` |
| createNetworkExchange_1=408 | Network | Timeout sur l'echange reseau | Retry — generalement OK au 2e essai |
| Termination on EMA failed | Resiliation | Echec de la resiliation dans EMA | Retry — generalement OK au 2e essai |

## Etapes

### 1. Se connecter a EMA

```bash
ssh batchuser@EMA15-Digicel
```

### 2. Verifier les operations en erreur

Consulter le dashboard EMA ou les logs pour identifier les operations WIZZEE en erreur/retry :

```bash
# Rechercher les SIM_SWAP en erreur dans les logs du jour
find /var/sog/BatchHandler/Users/batchuser/LogFiles -name '*.log' -type f -mtime 0 | \
  xargs grep -l "SIM_SWAP\|WIZZEE"
```

### 3. Identifier chaque cas en echec

Pour chaque erreur :
- Noter le MSISDN concerne
- Noter le type d'erreur (SIM_SWAP, billing, network, termination)
- Noter le motif d'echec dans le log
- Pour les erreurs billing : noter le `billingAccountOuid` (ex: `9854D04DFDD1A0106A35D32AF0C911A7`)

### 4. Relancer les cas en echec (Retry)

Relancer manuellement les operations WIZZEE en echec via EMA :
1. Cliquer sur "Retry" pour chaque cas
2. Verifier que le retry a abouti (statut passe a OK)
3. Si echec apres 2 retries :
   - **SIM_SWAP** : creer un ticket @DEV (ex: ticket #270436)
   - **Billing** : escalader vers team WIZZEE avec le `billingAccountOuid`
   - **Network/Termination** : re-tenter une derniere fois, sinon escalader

### 5. Documenter dans le ticket d'astreinte

Ajouter un commentaire structure dans le ticket RT d'astreinte :

```
Samedi JJ/MM :
- 3 Change resource SIM_SWAP problem -> 2 retry OK, 1 ticket cree chez @DEV (#XXXXXX)
- 1 createChargesAndDueBalances_1=204 -> a checker avec team WIZZEE (billingAccountOuid: XXXX)
- 3 createNetworkExchange_1=408 -> Retry OK
- 1 Termination on EMA failed -> Retry OK

Dimanche JJ/MM :
- 2 Change resource SIM_SWAP problem -> Retry OK
```

(Voir ticket #276367 — exemple reel d'astreinte WIZZEE)

## Escalade

| Niveau | Condition | Destinataire |
|--------|-----------|--------------|
| 1 | Retry echoue 2 fois (SIM_SWAP) | Ticket @DEV |
| 2 | Erreur billing persistante | Team WIZZEE |
| 3 | Probleme systemique (> 5 erreurs meme type) | fwi_pnm_si + management |

## Notes operationnelles

- La majorite des erreurs WIZZEE sont **temporaires** et se resolvent par un retry.
- Les erreurs SIM_SWAP sont les plus frequentes et les plus susceptibles de necessiter une escalade @DEV.
- Le check WIZZEE se fait quotidiennement pendant le week-end d'astreinte (samedi + dimanche).
- Toujours documenter les actions dans le ticket d'astreinte pour tracabilite.
