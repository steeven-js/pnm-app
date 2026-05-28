# P18 — Vérification SIM_SWAP WIZZEE (Astreinte)

**Catégorie :** Debug / Diagnostic
**Serveur :** Aucune intervention directe sur la plateforme
**Déclencheur :** Astreinte hebdomadaire (week-end)

---

## Contexte

WIZZEE est le système de facturation/échange qui gère les opérations de provisioning (SIM swap, billing, network exchange, résiliation). Pendant l'astreinte du week-end, l'équipe Application relève les codes erreurs WIZZEE et les transmet aux équipes concernées.

> **Important :** L'équipe Application n'a **pas d'action directe** sur la plateforme WIZZEE. On identifie les erreurs et on les adresse à l'équipe VAS ou à l'équipe DEV.

## Types d'erreurs WIZZEE

| Code erreur | Type | Description | Équipe à contacter |
|-------------|------|-------------|-------------------|
| Change resource SIM_SWAP problem | Provisioning | Échec du changement de ressource SIM | Équipe DEV |
| createChargesAndDueBalances_1=204 | Billing | Erreur de création de charges WIZZEE | Équipe VAS |
| createNetworkExchange_1=408 | Network | Timeout sur l'échange réseau | Équipe VAS |
| Termination on EMA failed | Résiliation | Échec de la résiliation dans EMA | Équipe VAS |

## Étapes

### 1. Relever les erreurs WIZZEE

Consulter les alertes/emails reçus pendant le week-end pour identifier les erreurs WIZZEE.

### 2. Identifier chaque cas en erreur

Pour chaque erreur, noter :
- Le MSISDN concerné
- Le type d'erreur (SIM_SWAP, billing, network, termination)
- Le code erreur exact
- Pour les erreurs billing : le `billingAccountOuid` si disponible

### 3. Adresser aux équipes concernées

| Type d'erreur | Action |
|---------------|--------|
| SIM_SWAP | Créer un ticket pour l'équipe DEV |
| Billing / Network / Termination | Remonter à l'équipe VAS |

### 4. Documenter dans le ticket d'astreinte

Ajouter un commentaire structuré dans le ticket RT d'astreinte :

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
| Erreurs SIM_SWAP | Équipe DEV (ticket) |
| Erreurs billing / network / termination | Équipe VAS |
| Problème systémique (> 5 erreurs même type) | fwi_pnm_si + management |

## Notes opérationnelles

- L'équipe Application **n'intervient pas** directement sur la plateforme WIZZEE.
- Notre rôle est de **relever et adresser** les erreurs aux bonnes équipes (VAS ou DEV).
- Le check WIZZEE se fait quotidiennement pendant le week-end d'astreinte.
- Toujours documenter les actions dans le ticket d'astreinte pour traçabilité.
