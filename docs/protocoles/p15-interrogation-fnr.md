# P15 — Interrogation / Gestion FNR

**Catégorie :** Debug / Diagnostic
**Serveur :** digimqapi01 (172.24.2.21) — serveur VAS géré par le pôle CORE
**Utilisateur :** N/A (interface web) — pas de SSH nécessaire
**Déclencheur :** Besoin de vérifier ou modifier le routage FNR d'un MSISDN

---

## Contexte

Le FNR (Forward Number Routing) est le fichier national de routage qui contient **uniquement les numéros portés**. Il détermine vers quel réseau un appel est acheminé. Si un numéro est absent du FNR, l'appel est routé vers l'opérateur d'origine (celui qui possède la tranche de numéros).

Les opérations FNR sont nécessaires dans plusieurs situations :
- Vérification du routage d'un numéro (debug appels entrants KO)
- Correction manuelle après une bascule KO (voir P16)
- Ajout/suppression manuelle après portabilité/restitution

Le FNR utilise des commandes **NPSUB** envoyées sur EMA via le fichier `fnr_action_v3.bh`.

## Codes réseau FNR — MAJ 08/04/2026

Orange Caraibe — nouveaux préfixes actifs depuis le 08/04/2026 :

| Code FNR | Opérateur | Territoire |
|----------|-----------|------------|
| 52303 | Orange Caraibe | Guadeloupe |
| 52313 | Orange Caraibe | Martinique |
| 52333 | Orange Caraibe | Guyane |

Autres opérateurs (anciens préfixes, toujours actifs) :

| Code FNR | Opérateur |
|----------|-----------|
| 60042 | Digicel AFG |
| 60043 | Dauphin Telecom |
| 60044 | Outremer Telecom / SFR |
| 60045 | UTS Caraibe |
| 60048 | Free Caraibes |

## Interfaces DAPI

### 1. Interroger un MSISDN dans le FNR

Vérifier le routage actuel d'un numéro.

```
http://172.24.2.21/apis/porta/fnr-get-info.html
```

Renseigner le MSISDN au format international (ex: 590690XXXXXX) ou national (069XXXXXXX).

**Résultat :**
- Si le numéro est dans le FNR : affiche le code réseau de routage (60041, 60042, etc.)
- Si le numéro n'est PAS dans le FNR : le numéro est routé par défaut vers l'opérateur de la tranche

### 2. Créer un MSISDN dans le FNR

Ajouter un nouveau numéro au FNR (après portabilité entrante, si la bascule automatique a échoué).

```
http://172.24.2.21/apis/porta/fnr-create.php
```

Renseigner :
- MSISDN
- Code réseau de destination (ex: 60042 pour Digicel)

### 3. Changer le réseau d'un MSISDN

Modifier le routage réseau d'un numéro existant dans le FNR.

```
http://172.24.2.21/apis/porta/fnr-update.php
```

### 4. Supprimer un MSISDN du FNR

Retirer un numéro du FNR (après portabilité sortante / restitution : le numéro revient chez l'opérateur d'origine).

```
http://172.24.2.21/apis/porta/fnr-delete.html
```

## Cas d'usage fréquents

| Situation | Action FNR | Interface |
|-----------|------------|-----------|
| Client injoignable après portabilité entrante | Vérifier si le numéro est dans le FNR avec le bon code réseau | fnr-get-info → fnr-create/update |
| Bascule KO (voir P16) | Créer ou corriger le routage des numéros en erreur | fnr-create / fnr-update |
| Restitution : numéro revient chez l'opérateur d'origine | Supprimer le numéro du FNR | fnr-delete |
| Debug "numéro non attribué" | Vérifier le routage actuel | fnr-get-info |

## Cohérence FNR / PortaDB

Après toute modification manuelle du FNR, vérifier la cohérence avec PortaDB :

```bash
ssh porta_pnmv3@vmqproportawebdb01
mysql -e "SELECT msisdn, operateur_id_actuel FROM PortaDB.MSISDN WHERE msisdn = '069XXXXXXX';"
```

Le routage FNR doit correspondre a l'opérateur actuel dans PortaDB :
- operateur_id_actuel = 1 (Orange) → FNR code 52303 (GP) / 52313 (MQ) / 52333 (GY) — depuis le 08/04/2026
- operateur_id_actuel = 2 (Digicel) → FNR code 60042 (ou absent si numéro d'origine Digicel)
- operateur_id_actuel = 3 (SFR) → FNR code 60044
- operateur_id_actuel = 4 (Dauphin) → FNR code 60043
- operateur_id_actuel = 5 (UTS) → FNR code 60045
- operateur_id_actuel = 6 (Free) → FNR code 60048

## Notes opérationnelles

- Le FNR ne contient que les numéros **portés**. Un numéro Digicel qui n'a jamais été porté n'est pas dans le FNR.
- Les modifications manuelles du FNR sont rares (la bascule automatique gère 95%+ des cas).
- Pour des corrections en masse, utiliser le rollback via P16 plutôt que les interfaces individuelles.
