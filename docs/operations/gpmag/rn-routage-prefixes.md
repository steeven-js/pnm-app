# Préfixes de routage (RN) — Référence

**Dernière MAJ :** 05/05/2026

Document de référence sur les **Routing Numbers (RN)** utilisés pour le routage des numéros portés entre opérateurs des Antilles-Guyane.

---

## Contexte

Quand un MSISDN est porté d'un opérateur A vers un opérateur B, le **FNR** (Fichier National de Routage) de l'opérateur attributaire stocke un RN indiquant chez quel opérateur se trouve actuellement le numéro. Lors d'un appel ou d'un SMS, le HLR/SMSC interrogé ce FNR pour router vers la bonne destination.

**Évolution ARCEP 2024** : passage d'un RN unique par opérateur à un RN **par opérateur ET par territoire** (Guadeloupe, Guyane, Martinique), pour améliorer le routage SMS A2P, la lutte contre la fraude, et la traçabilité.

---

## Anciens RN (avant migration)

Un seul code RN par opérateur, tous territoires confondus.

| Opérateur | Ancien RN |
|-----------|-----------|
| Orange Caraïbe (OC) | `60041` |
| **Digicel** | **`60042`** |
| Dauphin Telecom (DT) | `60043` |
| SFR Caraïbe / Outremer Telecom (OMT) | `60044` |
| UTS Caraïbe | `60045` |
| Free Caraïbes | `60048` |

**Source :** définition historique dans le code PHP API Digicel (`/var/www/api.fwi.digicelgroup.local/htdocs/core/`).

---

## Nouveaux RN (post-migration ARCEP)

Un RN distinct par opérateur **et par territoire**.

### Orange Caraïbe (OC)

| Territoire | Nouveau RN |
|------------|-----------|
| Guadeloupe | `52303` |
| Guyane | `52333` |
| Martinique | `52313` |

**Provisioning côté Digicel :** 08/04/2026
**Migration historique côté Digicel :** 04/05/2026 22h (Kevin Renciot — 71 684 MSISDN + 86 tranches)

### Digicel

| Territoire | Nouveau RN |
|------------|-----------|
| Guadeloupe | `52301` |
| Guyane | `52331` |
| Martinique | `52311` |

**Provisioning côté Orange :** 13/04/2026
**Migration historique côté Orange :** à partir du 11/05/2026 (Christophe Decaris)

### Autres opérateurs (à compléter)

| Opérateur | Guadeloupe | Guyane | Martinique | Statut migration |
|-----------|------------|--------|------------|------------------|
| Dauphin Telecom (DT) | *(à confirmer)* | *(à confirmer)* | *(à confirmer)* | *(à coordonner)* |
| SFR Caraïbe (OMT) | *(à confirmer)* | *(à confirmer)* | *(à confirmer)* | *(à coordonner)* |
| UTS Caraïbe | *(à confirmer)* | *(à confirmer)* | *(à confirmer)* | *(à coordonner)* |
| Free Caraïbes | *(à confirmer)* | *(à confirmer)* | *(à confirmer)* | *(à coordonner)* |

---

## Logique de routage — qui voit quoi

Principe : **chaque opérateur stocke le RN de l'autre** dans son FNR pour router les MSISDN sortis de chez lui.

### Sens du portage : Orange → Digicel (PEN pour Digicel)

| Opérateur | Vue dans son FNR |
|-----------|------------------|
| **Orange** (donneur — OPD) | Stocke le **RN Digicel** : `60042` (ancien) ou `52301`/`52311`/`52331` (nouveau, selon territoire) |
| **Digicel** (receveur — OPR) | Numéro local — pas de RN externe |

Quand un appelant tiers compose le numéro :
1. Le SMSC/HLR de l'appelant interrogé le FNR Orange (numéro de tranche Orange)
2. Le FNR Orange répond : « routé vers RN Digicel »
3. Le routage SS7 dirige l'appel/SMS vers Digicel via le RN

### Sens du portage : Digicel → Orange (PSO pour Digicel)

| Opérateur | Vue dans son FNR |
|-----------|------------------|
| **Digicel** (donneur — OPD) | Stocke le **RN Orange** : `60041` (ancien) ou `52303`/`52313`/`52333` (nouveau, selon territoire) |
| **Orange** (receveur — OPR) | Numéro local — pas de RN externe |

Symétrique du cas précédent.

---

## Lecture du problème SMS du 31/03/2026

Avant la migration, lorsqu'un MSISDN Orange était porté chez Digicel, le carrier Orange IC routait les SMS via `RN=60042` (ancien RN Digicel) :

```
SCCP CdPA : 59060042690766867
            ─── ─────  ─────────
            CC  RN     NDC + SN
            590 60042  690766867
```

À la suite de la migration réseau du carrier Orange IC autour du 31/03, le routage de `60042` vers Digicel via BICS s'est cassé → SMS non délivrés.

**Résolution** : passage progressif aux nouveaux RN territorialisés (52301/52311/52331 côté Digicel). La migration historique du 04/05/2026 a basculé tous les anciens portages encore actifs vers les nouveaux RN.

---

## États de migration bilatérale Orange ↔ Digicel

| # | Étape | Date | Côté | État |
|---|-------|------|------|------|
| 1 | Provisioning RN OC nouveaux portages dans FNR Digicel | 08/04/2026 | Digicel | ✅ Fait |
| 2 | Provisioning RN Digicel nouveaux portages dans FNR Orange | 13/04/2026 | Orange | ✅ Fait |
| 3 | Migration RN OC historiques dans FNR Digicel (71 684 MSISDN) | 04/05/2026 22h | Digicel (Kevin Renciot) | ✅ Fait |
| 4 | Migration RN Digicel historiques dans FNR Orange | À partir du 11/05/2026 | Orange (Christophe Decaris) | ⏳ Planifié |
| 5 | Coordonner SFR / DT / UTS / Free pour fin de support de l'ancien `60042` | À cadrer | Tous | ⏳ À faire |

---

## Localisation technique

### Côté Digicel — table `FNR_CONFIG` (PortaDB)

```sql
SELECT * FROM FNR_CONFIG WHERE operateur_id = 1;
-- Résultat : entrées par territoire avec le code_fnr correspondant
```

Exemples de mises à jour réalisées le 07/04/2026 (ticket #276845) :

```sql
UPDATE PortaDB.FNR_CONFIG SET code_fnr='52303' WHERE idFNR_CONFIG='6';
UPDATE PortaDB.FNR_CONFIG SET code_fnr='52303' WHERE idFNR_CONFIG='7';
UPDATE PortaDB.FNR_CONFIG SET code_fnr='52313' WHERE idFNR_CONFIG='9';
UPDATE PortaDB.FNR_CONFIG SET code_fnr='52313' WHERE idFNR_CONFIG='10';
UPDATE PortaDB.FNR_CONFIG SET code_fnr='52333' WHERE idFNR_CONFIG='8';
```

### Pages de consultation FNR

- Interface web : http://172.24.2.21/apis/porta/fnr-get-info.html
- API PHP : `/var/www/.../htdocs/core/fnr-get-info.php` (sur digimqapi01)

### Tickets associés

- **#276845** — [PNM] Mise à jour des nouveaux préfixes de routage Orange Caraïbe (statut : en cours, à clôturer après migration OAG)

---

## Documents liés

- [gpmag-évolutions-arcep.md](gpmag-evolutions-arcep.md) — Suivi global des évolutions ARCEP, planning de migration
- [sms-portes-orange-diagnostic.md](sms-portes-orange-diagnostic.md) — Diagnostic complet du problème SMS résolu suite à la migration
- [P15 — Interrogation FNR](../../protocoles/p15-interrogation-fnr.md) — Comment interroger / mettre à jour le FNR
- [P16 — Rollback DAPI suite FNR EMA EMM KO](../../protocoles/p16-rollback-dapi-fnr.md) — Procédure de rollback
