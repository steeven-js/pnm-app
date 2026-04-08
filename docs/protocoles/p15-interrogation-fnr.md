# P15 — Interrogation / Gestion FNR

**Categorie :** Debug / Diagnostic
**Serveur :** digimqapi01 (172.24.2.21) — serveur VAS gere par le pole CORE
**Utilisateur :** N/A (interface web) — pas de SSH necessaire
**Declencheur :** Besoin de verifier ou modifier le routage FNR d'un MSISDN

---

## Contexte

Le FNR (Forward Number Routing) est le fichier national de routage qui contient **uniquement les numeros portes**. Il determine vers quel reseau un appel est achemine. Si un numero est absent du FNR, l'appel est route vers l'operateur d'origine (celui qui possede la tranche de numeros).

Les operations FNR sont necessaires dans plusieurs situations :
- Verification du routage d'un numero (debug appels entrants KO)
- Correction manuelle apres une bascule KO (voir P16)
- Ajout/suppression manuelle apres portabilite/restitution

Le FNR utilise des commandes **NPSUB** envoyees sur EMA via le fichier `fnr_action_v3.bh`.

## Codes reseau FNR

| Code FNR | Operateur |
|----------|-----------|
| 60041 | Orange Caraibe |
| 60042 | Digicel AFG |
| 60043 | Dauphin Telecom |
| 60044 | Outremer Telecom / SFR |
| 60045 | UTS Caraibe |
| 60048 | Free Caraibes |

## Interfaces DAPI

### 1. Interroger un MSISDN dans le FNR

Verifier le routage actuel d'un numero.

```
http://172.24.2.21/apis/porta/fnr-get-info.html
```

Renseigner le MSISDN au format international (ex: 590690XXXXXX) ou national (069XXXXXXX).

**Resultat :**
- Si le numero est dans le FNR : affiche le code reseau de routage (60041, 60042, etc.)
- Si le numero n'est PAS dans le FNR : le numero est route par defaut vers l'operateur de la tranche

### 2. Creer un MSISDN dans le FNR

Ajouter un nouveau numero au FNR (apres portabilite entrante, si la bascule automatique a echoue).

```
http://172.24.2.21/apis/porta/fnr-create.php
```

Renseigner :
- MSISDN
- Code reseau de destination (ex: 60042 pour Digicel)

### 3. Changer le reseau d'un MSISDN

Modifier le routage reseau d'un numero existant dans le FNR.

```
http://172.24.2.21/apis/porta/fnr-update.php
```

### 4. Supprimer un MSISDN du FNR

Retirer un numero du FNR (apres portabilite sortante / restitution : le numero revient chez l'operateur d'origine).

```
http://172.24.2.21/apis/porta/fnr-delete.html
```

## Cas d'usage frequents

| Situation | Action FNR | Interface |
|-----------|------------|-----------|
| Client injoignable apres portabilite entrante | Verifier si le numero est dans le FNR avec le bon code reseau | fnr-get-info → fnr-create/update |
| Bascule KO (voir P16) | Creer ou corriger le routage des numeros en erreur | fnr-create / fnr-update |
| Restitution : numero revient chez l'operateur d'origine | Supprimer le numero du FNR | fnr-delete |
| Debug "numero non attribue" | Verifier le routage actuel | fnr-get-info |

## Coherence FNR / PortaDB

Apres toute modification manuelle du FNR, verifier la coherence avec PortaDB :

```bash
ssh porta_pnmv3@vmqproportawebdb01
mysql -e "SELECT msisdn, operateur_id_actuel FROM PortaDB.MSISDN WHERE msisdn = '069XXXXXXX';"
```

Le routage FNR doit correspondre a l'operateur actuel dans PortaDB :
- operateur_id_actuel = 1 (Orange) → FNR code 60041
- operateur_id_actuel = 2 (Digicel) → FNR code 60042 (ou absent si numero d'origine Digicel)
- operateur_id_actuel = 3 (SFR) → FNR code 60044
- operateur_id_actuel = 4 (Dauphin) → FNR code 60043
- operateur_id_actuel = 5 (UTS) → FNR code 60045
- operateur_id_actuel = 6 (Free) → FNR code 60048

## Notes operationnelles

- Le FNR ne contient que les numeros **portes**. Un numero Digicel qui n'a jamais ete porte n'est pas dans le FNR.
- Les modifications manuelles du FNR sont rares (la bascule automatique gere 95%+ des cas).
- Pour des corrections en masse, utiliser le rollback via P16 plutot que les interfaces individuelles.
