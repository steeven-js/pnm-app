# P34 — Désactivation / Suppression Point de Vente (PDV)

**Catégorie :** Exploitation
**Serveur :** vmqprostdb01
**Utilisateur :** oracle (puis script sous /dbs01/bcd/production/script/)
**Script :** Del_profil_Mobi_ss_validation.sh
**Déclencheur :** Ticket RT — Demande de désactivation code agence

---

## Contexte

Quand un point de vente (PDV / boutique Digicel) ferme ou est désactivé, il faut supprimer son profil dans la base MOBI (MasterCRM). Le script supprime les droits (items_right, package_right, group_users) associés au code agence.

## Ticket de référence

- 276775 : DEMANDE DE DESACTIVATION CODE AGENCE MARIGOT 7140003

## Prérequis

- Accès SSH au serveur vmqprostdb01 (utilisateur oracle)
- Code agence du PDV à désactiver (ex: 7140003)
- Numéro de ticket RT

## Étapes

### 1. Connexion au serveur

```bash
ssh oracle@vmqprostdb01
```

### 2. Accéder au répertoire du script

```bash
cd /dbs01/bcd/production/script/
```

Scripts disponibles :
- `Del_profil_Mobi_ss_validation.sh` — Suppression **sans validation** interactive (recommandé)
- `Del_profil_Mobi.sh` — Version avec validation (plus récente, sept 2023)
- `Desactiver_compte.sh` — Désactivation de compte (août 2019)

### 3. Exécuter le script de suppression

```bash
./Del_profil_Mobi_ss_validation.sh <Code_PDV> <NUM_RT>
```

Exemple :

```bash
./Del_profil_Mobi_ss_validation.sh 7140003 276775
```

### 4. Vérifier les informations affichées

Le script affiche les vérifications suivantes avant suppression :

**a) USERS MOBI PDV** — Identité du point de vente :
```
USER_CODE       USR_NAME                         USR_SURNAME        USER_PROFI
7140003         BOUTIQUE DIGICEL MARIGOT          BOUTIQUE DIGICEL   DESACTIVE
```

**b) CS_GROUP_USERS PDV** — Groupes associés :
```
GU_GROUP        GU_USER
2G SUNSET B2B   7140003
PDV             7140003
```

**c) GROUP_USERS PDV** — Groupes utilisateur :
```
US_GROUP        US_USER
PDV             7140003
```

**d) PACKAGE_RIGHT PDV** — Nombre de droits packages :
```
PACK_LEVEL_POINT = 7140003  (ex: 273 packages)
```

**e) ITEMS_RIGHT PDV** — Nombre de droits items :
```
ITEM_LEVEL_POINT = 7140003  COUNT = 8347
```

**f) USERS CRM PDV** — Vérification utilisateurs CRM (doit être vide si désactivé).

### 5. Suppression automatique

Après les vérifications, le script exécute automatiquement :
- Suppression des ITEMS_RIGHT du PDV
- Suppression des PACKAGE_RIGHT du PDV
- Suppression des GROUP_USERS du PDV

Le script se termine par :
```
INFO_SCRIPT : SUPPRESSION DES ITEMS_RIGHT PDV
INFO_SCRIPT : Fin script
```

### 6. Fermer le ticket RT

```
Bonjour,
Le profil du point de vente [NOM PDV] (code agence [CODE]) a été désactivé et supprimé.
Je ferme le ticket.
--
Cdt,
[Prénom NOM]
Équipe Application
```

## Arborescence serveur

```
vmqprostdb01 (oracle)
|
+-- /dbs01/bcd/production/script/
    +-- Del_profil_Mobi_ss_validation.sh  <- suppression sans validation
    +-- Del_profil_Mobi.sh                <- suppression avec validation
    +-- Desactiver_compte.sh              <- désactivation compte
    +-- log/                              <- logs d'exécution
```

## Points d'attention

- Le script `Del_profil_Mobi_ss_validation.sh` supprime **sans demander confirmation**. Vérifier le code agence avant exécution.
- Si le SPOOL échoue (`SP2-0606`), le script continue mais le log ne sera pas créé dans `/u/home/bcd/production/script/log/`. Ce n'est pas bloquant.
- Vérifier que le USER_PROFI est bien "DESACTIVE" avant de supprimer. Si le PDV est encore actif, ne pas supprimer sans confirmation du demandeur.
- La suppression des ITEMS_RIGHT peut prendre plusieurs minutes si le PDV a beaucoup d'items (ex: 8347 items).
