# P13 — Facturation mensuelle PEN / PSO

**Categorie :** Facturation
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Declencheur :** Execution mensuelle automatique (crontab)

---

## Contexte

Generation automatique des rapports de facturation mensuels pour les portabilites entrantes (PEN) et sortantes (PSO).

## Etapes

### 1. Execution automatique

Les scripts s'executent mensuellement via crontab :
- Pnm_Facturation_Mensuelle_PEN.sh — portabilites entrantes (ticket 1410)
- Pnm_Facturation_Mensuelle_PSO.sh — portabilites sortantes (ticket 1210)

Emails envoyes a fwi_pnm_si + comptabilite.

### 2. Contenu du rapport

Par operateur (OC, SFRC, DT, UTS, FREEC) :
- Type de mandat : simple ou multiple
- ID portage
- Date mandat / transaction
- Nombre de lignes
- Premier numero eligible

### 3. Execution manuelle

Si le rapport n'a pas ete envoye, relancer manuellement.

```bash
ssh porta_pnmv3@vmqproportawebdb01
cd ~/scripts/
./Pnm_Facturation_Mensuelle_PEN.sh
./Pnm_Facturation_Mensuelle_PSO.sh
```
