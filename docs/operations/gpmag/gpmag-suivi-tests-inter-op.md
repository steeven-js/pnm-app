# GPMAG — Suivi des tests inter-opérateurs

**Source** : `Suivi_et_resultats_des_tests_GPMAG_v2.7.xlsx`
**Périmètre** : tests de portabilité et routage entre les 6 opérateurs Antilles-Guyane (Free Caraïbes, Dauphin Telecom, OMT/SFR, Orange Caraïbe, UTS, Digicel)
**Dernière MAJ** : 13/05/2026

---

## État global des couples d'opérateurs

15 couples (toutes les paires possibles), 19 feuilles dans le fichier de suivi (1 vue d'ensemble + 1 protocole générique + 15 feuilles par couple + 1 versioning + 1 feuille « 1 » résiduelle).

| Couple A/B | Statut tests | Commentaires | Migration partielle 2×2 | Migration totale |
|---|---|---|---|---|
| Free Caraïbes / Dauphin | ✅ Ok | À planifier | À planifier (MaJ Dauphin en cours) | — |
| Free Caraïbes / Orange | ✅ Ok | RAS | 09/03/2026 (nouveaux portages uniquement) | 25-26/03/2026 |
| Free Caraïbes / OMT | ❌ Non commencés | À planifier (nouvelle config OMT en cours) | À planifier (test PNM interco) | — |
| Free Caraïbes / UTS | 🟡 En cours | En attente UTS pour test SMS/Voix | — | — |
| Free Caraïbes / Digicel | ✅ Ok | RAS | À planifier (MaJ Dauphin en cours) | — |
| Dauphin / OMT | ❌ Non commencés | À planifier (config en cours) | — | — |
| Dauphin / Orange | ✅ Ok | RAS | À planifier (MaJ Dauphin en cours) | — |
| Dauphin / UTS | ❌ Non commencés | À planifier | — | — |
| Dauphin / Digicel | ✅ Ok | — | À planifier (MaJ Dauphin en cours) | — |
| Orange / OMT | 🟡 En cours | Tests à refaire suite MaJ réseau | — | — |
| **Orange / Digicel** | ✅ **Ok** | — | **14/04/2026** | À planifier |
| Orange / UTS | 🟡 En cours | À finaliser | — | — |
| OMT / Digicel | ❌ Non commencés | À planifier (nouvelle config OMT en cours) | — | — |
| OMT / UTS | ❌ Non commencés | À planifier (nouvelle config OMT en cours) | — | — |
| Digicel / UTS | ❌ Non commencés | À planifier (nouvelle config OMT en cours) | — | — |

### Synthèse

| Statut | Couples | Volumétrie |
|---|---|---|
| ✅ Ok | Free-Dauphin, Free-Orange, Free-Digicel, Dauphin-Orange, Dauphin-Digicel, Orange-Digicel | **6/15** |
| 🟡 En cours | Free-UTS, Orange-OMT, Orange-UTS | **3/15** |
| ❌ Non commencés | Free-OMT, Dauphin-OMT, Dauphin-UTS, OMT-Digicel, OMT-UTS, Digicel-UTS | **6/15** |

**Observations** :
- **OMT est le maillon faible** : 5 des 6 couples non commencés sont bloqués par « nouvelle config OMT en cours ».
- **Dauphin** : 4 couples ✅ Ok mais migrations partielles bloquées par « MaJ Dauphin en cours ».
- **Migration totale tous opérateurs planifiée pour S1 2026** (en cours).

### Migration one-shot (bas du document)

| Opérateur | Statut |
|---|---|
| MIGRATION ONE SHOT ORANGE | TdB (tableau de bord à suivre) |
| MIGRATION ONE SHOT OMT | — |
| MIGRATION ONE SHOT DIGICEL | — |
| **MIGRATION TOUS OP** | **S1 2026** |

---

## Protocole de test générique (feuille « Prot. de test entre op A et B »)

### Pré-requis

- Chaque opérateur prépare **3 SIM de test**
- Chaque opérateur prépare **1 MSISDN par île** (+590 GLP, +596 MTQ, +594 GUY)

### Étape 1 — Mise en place de l'environnement de test

Pour tests entre opérateurs A et B :

1. **A attribue les MSISDN de B sur ses SIM de test**
2. **B attribue les MSISDN de A sur ses SIM de test**
3. A et B **provisionnent leurs bases de portabilité** avec les six MSISDN impliqués en leur appliquant les nouveaux préfixes
4. A et B donnent leurs **GO pour commencer les tests** de routage voix et SMS

### Étape 2 — Validation technique

A et B valident que les appels/SMS vers les MSISDN de test sont :

- **Lignes portées OUT** : remis respectivement à B et A sur la bonne interco (et sur la route de débordement si un tel dispositif existe entre A et B), avec le bon préfixe.
- **Lignes portées IN** : routés correctement en interne.

A et B valident le bon déroulement des tests et complètent l'onglet de suivi (feuille du couple correspondant).

### Étape 3 — Réinitialisation de l'environnement de test

1. A attribue à ses SIM de test leurs MSISDN initiaux
2. B attribue à ses SIM de test leurs MSISDN initiaux
3. A et B suppriment les MSISDN de test de leurs bases de portabilité

---

## Structure d'une feuille de couple (ex: « OMT - Digicel »)

Chaque feuille de paire d'opérateurs contient :

### Section 1 — Configuration des MSISDN de test

| Opérateur A | Identifiant n° test | Numéro | Préfixe attribué |
|---|---|---|---|
| A renseigner | A1 | — | — |
| | A2 | — | — |
| | A3 | — | — |

| Opérateur B | Identifiant n° test | Numéro | Préfixe attribué |
|---|---|---|---|
| A renseigner | B1 | — | — |
| | B2 | — | — |
| | B3 | — | — |

### Section 2 — Plan de tests

Plusieurs blocs de tests par opérateur :

| Bloc | Description |
|---|---|
| **Service voix — Porta OUT** | 9 tests : 3 îles × 3 numéros (PORTA-OUT-01A/01B/01C, 02A/B/C, 03A/B/C) |
| **Service voix — Porta IN** | 9 tests symétriques (PORTA-IN-01A à 03C) |
| **Service voix — Route de débordement (optionnel)** | 18 tests (DEBOR-PORTA-OUT/IN-*) |
| **Service SMS — Porta OUT/IN** | (suite — non détaillée ici) |

Chaque ligne de test contient : `Titre | Description | Timestamp | Calling | Called | Statut | Observations`

---

## Points d'attention pour Digicel

### Couples impliquant Digicel — état au 13/05/2026

| Couple | Statut | Note |
|---|---|---|
| **Free Caraïbes / Digicel** | ✅ Ok | RAS |
| **Dauphin / Digicel** | ✅ Ok | Migration partielle à planifier (MaJ Dauphin) |
| **Orange / Digicel** | ✅ Ok | Migration partielle 14/04/2026 effectuée, migration totale à planifier |
| **OMT / Digicel** | ❌ Non commencés | Bloqué par « nouvelle config OMT en cours » |
| **Digicel / UTS** | ❌ Non commencés | Bloqué par « nouvelle config OMT en cours » (lien indirect) |

### Actions Digicel restantes

1. **Planifier les tests OMT/Digicel** dès que la nouvelle config OMT est finalisée
2. **Planifier les tests Digicel/UTS**
3. **Finaliser la migration totale Orange/Digicel** (date à planifier)
4. **Suivre les migrations partielles** des couples Dauphin/* dépendantes de la MaJ Dauphin

---

## Fichier source

Localisation locale : `Attachments/Suivi_et_resultats_des_tests_GPMAG_v2.7.xlsx`

Pour mettre à jour ce document :
1. Récupérer la dernière version du fichier Excel (envoyée régulièrement par le GPMAG)
2. Extraire les feuilles via Excel + COM PowerShell ou Excel natif
3. Mettre à jour ce `.md` avec les nouveaux statuts

---

## Références

- [GPMAG — Évolutions ARCEP](gpmag-evolutions-arcep.md)
- [Comptes-rendus GPMAG 2026-04-16](cr-gpmag-2026-04-16.md)
- [RN Routage Préfixes](rn-routage-prefixes.md)
- [FNR Périmètre Visibilité](fnr-perimetre-visibilite.md)
