# P48 — Création / clonage des droits d'un Point de Vente (PDV)

**Catégorie :** Exploitation / Administration
**Serveur :** vmqprostdb01
**Utilisateur :** oracle (via `su - oracle` depuis `exploit`)
**Script :** `Creation_compte_CRM_PDV_COM_MAJ2.sh` (répertoire `~/script/CRM_PDV_COM/`)
**Déclencheur :** Ticket RT — demande de création d'un code PDV / droits d'accès pour un point de vente (commerciaux)
**Ticket de référence :** 278277 — `[COM] Création code PDV - Commerciaux 202606` (PDV `1751008` AGENCE CLIENT DIGICEL GALLERIA, droits identiques à `1751005`)

> Document de cadrage destiné à la présentation équipe : il recense **les variantes** de ce type de demande (comme la matrice des FID) avant toute automatisation OCS.

---

## 1. Contexte

Quand l'Administration des Ventes ouvre/équipe un point de vente, le **code PDV** (entité distributeur) est créé dans MOBI (« Gestion des Distributeurs »). Il faut ensuite lui créer son **compte d'accès CRM** et ses **droits**, en général **à l'identique d'un PDV modèle existant** (« mêmes droits que le PDV X »).

Le script clone, depuis un PDV **source**, l'ensemble du périmètre **CRM** vers le PDV **cible**.

## 2. Ce que clone le script (périmètre CRM)

| # | Étape (afficher_trace) | Table MasterCRM | Origine |
|---|------------------------|-----------------|---------|
| 1 | Création du compte mastercrm | `users` (mot de passe `DIGICEL123`) | copié de la source |
| 2 | Insertion du profil | `users.user_profile` ← `PDV_ODL` **ou** `IC` | **choix au prompt** |
| 3 | Droits groupes requêtes CCARE | `CS_GROUP_USERS` | copié de la source |
| 4 | Droits d'accès client | `customer_access` | copié de la source |
| 5 | Groupes d'utilisateurs | `GROUP_USERS` | copié de la source |
| 6 | Droits sur les items | `item_right` | copié de la source |
| 7 | Droits sur les offres | `package_right` | copié de la source |

> ⚠️ Seul `user_profile` dépend du prompt `PDV_ODL/IC`. **Tout le reste vient de la source** → le choix du **PDV source** est le paramètre le plus important (mauvaise source = mauvais droits).

Connexion DB du script : `sqlplus pb/gaston@MCST50A` (MasterCRM **PROD**). Trace : `~/script/CRM_PDV_COM/log/Trace_actions_bd.log`, postée automatiquement sur le ticket RT (APP_OCS).

## 3. Matrice des cas (≈ comme les FID)

| Cas | Comment le reconnaître | Approche | Garde-fou |
|-----|------------------------|----------|-----------|
| **A. Clonage unitaire PDV (CRM)** — *cas standard* | 1 code PDV cible, « mêmes droits que PDV X » | `Creation_compte_CRM_PDV_COM_MAJ2.sh SOURCE CIBLE RT NOM PRENOM`, profil = celui de la source | Source active + bon profil |
| **B. Compte collaborateur (≠ PDV)** | Compte personne, code ≤ 10 (ex. `FR624431`) | `Creation_compte_CRM_USER.sh` (voir **P45**) | Ne pas confondre avec un PDV (code ≤ 8) |
| **C. Profil PDV_ODL vs IC** | Type de PDV (agence Digicel vs canal indépendant) | Répondre le bon profil au prompt = celui de la source | Vérifier `user_profile` de la source |
| **D. Cible déjà existante** | Le code a déjà une ligne `users` | **NE PAS** relancer la création (INSERT → doublon/erreur) → clonage de droits seul / vérif | `SELECT count(*) FROM users WHERE user_code='CIBLE'` doit = 0 |
| **E. Création multiple** | Plusieurs PDV/comptes d'un coup | `CREATION_PLUSIEURS_COMPTES(_MAJ).sh` + `comptes_a_creer.txt` | Format du fichier d'entrée |
| **F. Demande CRM + DAPI** | Le ticket mentionne « CRM **et** DAPI » | CRM via le script ; **DAPI = étape séparée** (hors scripts Oracle) | Ne pas clôturer sans la partie DAPI |
| **G. Désactivation / fermeture PDV** | PDV qui ferme | **P34** (`Del_profil_Mobi`) — supprime items/packages/groups | Vérifier `USER_PROFI = DESACTIVE` |
| **H. Réactivation PDV** | PDV rouvert après désactivation | *À confirmer* — pas de script identifié à ce jour | — |
| **I. PDV B2B / groupes spéciaux** | Groupe type « 2G SUNSET B2B » (vu en P34) | Choisir une **source du même type** (les groupes sont clonés de la source) | Contrôler `CS_GROUP_USERS`/`GROUP_USERS` de la source |

## 4. Procédure standard (cas A)

### Pré-contrôles (MasterCRM)
```sql
-- source active + son profil (= ce qu'on choisira au prompt)
SELECT user_code, user_profile, user_actif FROM users WHERE user_code = 'SOURCE';
-- cible ne doit PAS déjà exister
SELECT count(*) FROM users WHERE user_code = 'CIBLE';   -- doit = 0
```

### Exécution
```bash
ssh exploit@vmqprostdb01
su - oracle
cd ~/script/CRM_PDV_COM
./Creation_compte_CRM_PDV_COM_MAJ2.sh SOURCE CIBLE NUM_RT "NOM" "PRENOM"
```
Exemple (ticket 278277) :
```bash
./Creation_compte_CRM_PDV_COM_MAJ2.sh 1751005 1751008 278277 "AGENCE CLIENT DIGICEL GALLERIA" "AGENCE CLIENT DIGICEL"
```
- Au prompt `Quel profil ? [PDV_ODL/IC]` → répondre le profil de la **source** (ici `PDV_ODL`).
- À chaque `Voulez-vous continuer ? [O/N]` → **`O` MAJUSCULE** (un `o` minuscule = « Fin script »).
- La trace est postée sur le ticket ; vérifier dans MasterCRM que la cible a hérité des droits.

## 5. CRM vs DAPI — point d'attention majeur

`grep -ril dapi ~/script` côté `oracle` = **aucun résultat** : les droits **DAPI** d'un PDV ne sont **pas** gérés par cette chaîne Oracle/MasterCRM. C'est un **système distinct** (portail DAPI, Tomcat/MySQL — cf. **P46**). Tant que ce périmètre n'est pas localisé, la partie DAPI d'une demande « CRM + DAPI » reste **manuelle** et **doit être traitée séparément avant clôture**.

## 6. Points ouverts (à trancher avec la BSS / l'équipe)

- **DAPI** : où et comment se créent les droits DAPI d'un PDV (base/table/portail) ? Existe-t-il un INT ?
- **PDV_ODL vs IC** : définition métier exacte de chaque profil et règle de choix.
- **Réactivation** (cas H) : procédure dédiée ou re-création ?
- **`AJS_PDV`** : dossier `~/script/AJS_PDV` à explorer (variante de création PDV ?).
- **`Comm_import_fichiers.sh`** / `Liste_fichier_comm.txt` : lien éventuel avec la rubrique « Commissionnement » de l'OCS.

## 7. Pistes d'automatisation OCS (faisabilité)

- L'OCS a déjà : connecteur Oracle générique `runOracleSql($sql,$config,$prefix)` (`include/oracle_helper.php`), feature `liberation.php` avec **bascule INT/PROD** (`LIBERATION_INT_` → MasterCRM INT `MCSTINT2` sur `vmqintmbdb02`) et **blocage écriture PROD depuis DEV**, post RT par mail.
- Donc on peut **rejouer les 7 requêtes de clonage** en **INT** (sans risque) puis, plus tard, exposer un panneau « Création PDV » sous la rubrique **Commissionnement**.
- Périmètre v1 conseillé : **cas A** (clonage unitaire PDV_ODL, CRM) avec pré-contrôles (cas D) ; les autres cas en garde-fous (« cas non couvert → procédure manuelle »).

## 8. Références
- **P34** — Désactivation / suppression PDV (le cas inverse).
- **P45** — Création compte MasterCRM collaborateur (même famille, script `_USER`).
- **P46** — DAPI : portails indisponibles (contexte système DAPI).
