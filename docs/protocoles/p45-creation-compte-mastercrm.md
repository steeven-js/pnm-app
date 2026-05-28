# P45 — Création d'un compte MasterCRM (nouveau collaborateur)

**Catégorie :** Exploitation / Administration
**Serveur :** vmqprostdb01
**Utilisateur :** oracle (via `su - oracle` depuis `exploit`)
**Script :** `Creation_compte_CRM_USER.sh`
**Déclencheur :** Ticket RT — demande d'accès / création de compte MasterCRM pour un nouveau collaborateur
**Temps moyen :** ~5 min

---

## Contexte

Lorsqu'un nouveau collaborateur arrive, son responsable (ou l'équipe RH/Obligations Légales) ouvre un ticket pour demander la création d'un compte d'accès à MasterCRM. La création se fait en **clonant le profil d'un compte source existant** (un collègue ayant déjà le bon profil / les bons droits, typiquement de la même équipe).

Le script `Creation_compte_CRM_USER.sh` automatise toute la chaîne : création du compte, récupération du profil source, ajout des droits (groupes requêtes, accès client, groupes utilisateurs, items, tables).

## Pré-requis — informations à récupérer du ticket

| Donnée | Description | Exemple (RT 277428) |
|--------|-------------|---------------------|
| COMPTE_SOURCE | Compte existant à cloner (même profil/équipe que le nouveau) | `MS613336` (Marina Sevestre, OBL) |
| COMPTE_CIBLE | Identifiant du nouveau compte à créer | `FR624431` (Franck Raffort) |
| NUM_RT | Numéro du ticket | `277428` |
| NOM | Nom du collaborateur | `Raffort` |
| PRENOM | Prénom du collaborateur | `Franck` |

**Convention de nommage du compte** : `[Initiale prénom][Initiale nom][matricule]`
(ex. Franck Raffort → `FR` + `624431` = `FR624431`).

> Le **COMPTE_SOURCE** est crucial : il détermine tous les droits hérités. Choisir un compte de référence ayant exactement le profil voulu (même rôle / même équipe). Dans le cas RT 277428, le demandeur (Marina, OBL) a servi de modèle pour son nouveau collègue de la même équipe (profil SIEGE_DG).

## Étapes

### 1. Connexion au serveur

```bash
ssh exploit@vmqprostdb01
su - oracle
# (saisir le mot de passe oracle)
cd script/CRM_PDV_COM
```

### 2. Lancer le script

Usage :

```
./Creation_compte_CRM_USER.sh COMPTE_SOURCE COMPTE_CIBLE NUM_RT NOM PRENOM
```

Exemple réel (RT 277428) :

```bash
./Creation_compte_CRM_USER.sh MS613336 FR624431 277428 Raffort Franck
```

Le script affiche un récapitulatif puis demande confirmation :

```
compte_source = MS613336, compte_cible = FR624431, numero_rt = 277428, nom = Raffort et prenom = Franck
Voulez-vous continuer ? [O/N]
```

### 3. Confirmer chaque étape avec « O » MAJUSCULE

> ⚠️ **Piège** : répondre avec un **O majuscule**. Un « o » minuscule est interprété comme un refus et termine le script (« Fin script ») sans rien faire.

Le script enchaîne les étapes, chacune demandant une confirmation :

```
Creation du compte mastercrm
Recuperation du profil source
Ajout des droits sur les groupes requetes CCARE
Ajout des droits d'acces client
Ajout des groupes d'utilisateurs
Ajout des droits sur les items
Ajout des droits sur les tables
Fin script
```

Répondre `O` à chaque « Voulez-vous continuer ? [O/N] » jusqu'à « Fin script ».

### 4. Vérifier la trace

Le script génère un fichier `Trace_actions_bd_user.log` qui récapitule toutes les actions en base. Ce fichier est **automatiquement posté en commentaire sur le ticket RT** (via APP_OCS), avec la mention du compte créé, du profil et du compte source.

### 5. Vérifier dans MasterCRM

Ouvrir MasterCRM et contrôler que le nouveau compte (ex. `FR624431`) :
- existe et est actif
- a bien hérité du profil du compte source
- a les bons droits (groupes, items, tables, accès client)

## Clôture du ticket RT

```
Bonjour,

Le compte MasterCRM [COMPTE_CIBLE] a été créé pour [PRENOM NOM],
basé sur le profil du compte [COMPTE_SOURCE].
La trace des actions est jointe à ce ticket.

Je ferme le ticket.

Cordialement,
[Prénom NOM]
Équipe Application
```

## Notes opérationnelles

- Le script se trouve dans `/home/oracle/script/CRM_PDV_COM/` sur vmqprostdb01.
- Pour créer **plusieurs comptes** en une fois, voir les variantes `CREATION_PLUSIEURS_COMPTES.sh` / `CREATION_PLUSIEURS_COMPTES_MAJ.sh` (fichier d'entrée `comptes_a_creer.txt`) dans le même répertoire.
- Une version mise à jour `Creation_compte_CRM_PDV_COM_MAJ2.sh` existe également (à privilégier si indiquée par l'équipe BSS).
- Les logs d'exécution sont conservés dans le sous-répertoire `log/`.
- Toujours valider le **COMPTE_SOURCE** : un mauvais compte modèle = mauvais droits hérités.
