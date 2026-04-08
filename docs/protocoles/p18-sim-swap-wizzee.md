# P18 — Verification SIM_SWAP WIZZEE (Astreinte)

**Categorie :** Debug / Diagnostic
**Serveur :** Aucune intervention directe sur la plateforme
**Declencheur :** Astreinte hebdomadaire (week-end)

---

## Contexte

WIZZEE est le systeme de facturation/echange qui gere les operations de provisioning (SIM swap, billing, network exchange, resiliation). Pendant l'astreinte du week-end, l'equipe Application releve les codes erreurs WIZZEE et les transmet aux equipes concernees.

> **Important :** L'equipe Application n'a **pas d'action directe** sur la plateforme WIZZEE. On identifie les erreurs et on les adresse a l'equipe VAS ou a l'equipe DEV.

## Types d'erreurs WIZZEE

| Code erreur | Type | Description | Equipe a contacter |
|-------------|------|-------------|-------------------|
| Change resource SIM_SWAP problem | Provisioning | Echec du changement de ressource SIM | Equipe DEV |
| createChargesAndDueBalances_1=204 | Billing | Erreur de creation de charges WIZZEE | Equipe VAS |
| createNetworkExchange_1=408 | Network | Timeout sur l'echange reseau | Equipe VAS |
| Termination on EMA failed | Resiliation | Echec de la resiliation dans EMA | Equipe VAS |

## Etapes

### 1. Relever les erreurs WIZZEE

Consulter les alertes/emails recus pendant le week-end pour identifier les erreurs WIZZEE.

### 2. Identifier chaque cas en erreur

Pour chaque erreur, noter :
- Le MSISDN concerne
- Le type d'erreur (SIM_SWAP, billing, network, termination)
- Le code erreur exact
- Pour les erreurs billing : le `billingAccountOuid` si disponible

### 3. Adresser aux equipes concernees

| Type d'erreur | Action |
|---------------|--------|
| SIM_SWAP | Creer un ticket pour l'equipe DEV |
| Billing / Network / Termination | Remonter a l'equipe VAS |

### 4. Documenter dans le ticket d'astreinte

Ajouter un commentaire structure dans le ticket RT d'astreinte :

```
Samedi JJ/MM :
- 3 Change resource SIM_SWAP problem -> adresse a @DEV (ticket #XXXXXX)
- 1 createChargesAndDueBalances_1=204 -> adresse a equipe VAS
- 3 createNetworkExchange_1=408 -> adresse a equipe VAS
- 1 Termination on EMA failed -> adresse a equipe VAS

Dimanche JJ/MM :
- 2 Change resource SIM_SWAP problem -> adresse a @DEV
- RAS (si rien a signaler)
```

(Voir ticket #276367 — exemple reel d'astreinte WIZZEE)

## Escalade

| Condition | Destinataire |
|-----------|--------------|
| Erreurs SIM_SWAP | Equipe DEV (ticket) |
| Erreurs billing / network / termination | Equipe VAS |
| Probleme systemique (> 5 erreurs meme type) | fwi_pnm_si + management |

## Notes operationnelles

- L'equipe Application **n'intervient pas** directement sur la plateforme WIZZEE.
- Notre role est de **relever et adresser** les erreurs aux bonnes equipes (VAS ou DEV).
- Le check WIZZEE se fait quotidiennement pendant le week-end d'astreinte.
- Toujours documenter les actions dans le ticket d'astreinte pour tracabilite.
