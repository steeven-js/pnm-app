# P34 — Desactivation / Suppression Point de Vente (PDV)

**Categorie :** Exploitation
**Serveur :** vmqprostdb01
**Utilisateur :** oracle (puis script sous /dbs01/bcd/production/script/)
**Script :** Del_profil_Mobi_ss_validation.sh
**Declencheur :** Ticket RT — Demande de desactivation code agence

---

## Contexte

Quand un point de vente (PDV / boutique Digicel) ferme ou est desactive, il faut supprimer son profil dans la base MOBI (MasterCRM). Le script supprime les droits (items_right, package_right, group_users) associes au code agence.

## Ticket de reference

- 276775 : DEMANDE DE DESACTIVATION CODE AGENCE MARIGOT 7140003

## Prerequis

- Acces SSH au serveur vmqprostdb01 (utilisateur oracle)
- Code agence du PDV a desactiver (ex: 7140003)
- Numero de ticket RT

## Etapes

### 1. Connexion au serveur

```bash
ssh oracle@vmqprostdb01
```

### 2. Acceder au repertoire du script

```bash
cd /dbs01/bcd/production/script/
```

Scripts disponibles :
- `Del_profil_Mobi_ss_validation.sh` — Suppression **sans validation** interactive (recommande)
- `Del_profil_Mobi.sh` — Version avec validation (plus recente, sept 2023)
- `Desactiver_compte.sh` — Desactivation de compte (aout 2019)

### 3. Executer le script de suppression

```bash
./Del_profil_Mobi_ss_validation.sh <Code_PDV> <NUM_RT>
```

Exemple :

```bash
./Del_profil_Mobi_ss_validation.sh 7140003 276775
```

### 4. Verifier les informations affichees

Le script affiche les verifications suivantes avant suppression :

**a) USERS MOBI PDV** — Identite du point de vente :
```
USER_CODE       USR_NAME                         USR_SURNAME        USER_PROFI
7140003         BOUTIQUE DIGICEL MARIGOT          BOUTIQUE DIGICEL   DESACTIVE
```

**b) CS_GROUP_USERS PDV** — Groupes associes :
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

**f) USERS CRM PDV** — Verification utilisateurs CRM (doit etre vide si desactive).

### 5. Suppression automatique

Apres les verifications, le script execute automatiquement :
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
    +-- Desactiver_compte.sh              <- desactivation compte
    +-- log/                              <- logs d'execution
```

## Points d'attention

- Le script `Del_profil_Mobi_ss_validation.sh` supprime **sans demander confirmation**. Verifier le code agence avant execution.
- Si le SPOOL echoue (`SP2-0606`), le script continue mais le log ne sera pas cree dans `/u/home/bcd/production/script/log/`. Ce n'est pas bloquant.
- Verifier que le USER_PROFI est bien "DESACTIVE" avant de supprimer. Si le PDV est encore actif, ne pas supprimer sans confirmation du demandeur.
- La suppression des ITEMS_RIGHT peut prendre plusieurs minutes si le PDV a beaucoup d'items (ex: 8347 items).
