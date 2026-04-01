# P18 — Verification SIM_SWAP WIZZEE (Astreinte)

**Categorie :** Debug / Diagnostic
**Serveur :** EMA (digimqema01)
**Utilisateur :** porta_pnmv3
**Declencheur :** Astreinte hebdomadaire

---

## Contexte

Les SIM_SWAP WIZZEE peuvent rester en statut "retry" dans EMA suite a des echecs de traitement. Ces cas doivent etre verifies et relances manuellement si necessaire.

## Etapes

### 1. Verifier les SIM_SWAP en retry

```bash
ssh batchusr@digimqema01
# Rechercher les SIM_SWAP en retry dans les logs EMA
```

### 2. Identifier les cas en echec

Pour chaque SIM_SWAP en retry :
- Verifier le MSISDN concerne
- Verifier le motif d'echec dans le log

### 3. Relancer les cas en echec

Relancer manuellement les SIM_SWAP WIZZEE en echec via EMA.

### 4. Documenter

Mettre a jour le ticket RT d'astreinte avec les SIM_SWAP traites.
