# P06 — MAJ Fidelisation / Reengagement (APP_OCS 11561)

**Categorie :** Exploitation
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Declencheur :** Ticket RT — mise a jour date fidelisation, reengagement, ou report de mois
**Temps moyen :** 5 a 15 min
**Frequence :** Elevee (~124 tickets/an categorie "Fidelisation" + partie "Reengagement")

---

## Contexte

Mettre a jour la date de fidelisation ou reengager une ligne via APP_OCS requete 11561. Cette operation couvre plusieurs cas d'usage :

| Cas d'usage | Type de trace | Description |
|-------------|---------------|-------------|
| Reengagement 24 mois | MAJ_date_engagement | Reengager une ligne pour 24 mois en echange d'une remise |
| Report de mois FID | MAJ_date_engagement_et_FID | Transferer les mois de fidelisation d'un ancien dossier vers un nouveau |
| MAJ date FID seule | MAJ_date_FID | Mise a jour date eligibilite fidelisation apres reactivation |

## Champs mis a jour par APP_OCS 11561

| Champ | Description | Exemple |
|-------|-------------|---------|
| `date_fin_abo` | Date de fin d'abonnement (engagement) | 18/03/2028 (+24 mois) |
| `date_ref_anciennete` | Date de reference anciennete client | 15/05/2024 |
| `date_eligible_fid` | Date a laquelle le client sera eligible a la fidelisation | 09/12/2025 |

## Deux methodes disponibles

Il existe deux manieres d'executer cette operation :

| Methode | Outil | Quand l'utiliser |
|---------|-------|-----------------|
| **A — Script shell** | `Reengagement_whiptail_V2.sh` sur vmqprostdb01 | Methode principale, en ligne de commande via mRemoteNG |
| **B — Interface web** | APP_OCS supervision (navigateur) | Alternative si acces web disponible |

Les deux methodes executent la meme requete 11561 et produisent le meme resultat (MAJ en base + trace automatique sur le ticket RT).

---

## Methode A — Script shell (recommandee)

### 1. Connexion au serveur

Se connecter via mRemoteNG (en root) sur vmqprostdb01, puis basculer vers oracle.

```bash
su - oracle
```

### 2. Acceder au repertoire

```bash
cd /home/oracle/script/MAJ_DATE_ENGAGEMENT
```

Contenu du repertoire :
```
Reengagement.sh                  # ancienne version
Reengagement_whiptail_V2.sh      # version actuelle (interface whiptail)
MSISDN.log                       # log des MSISDN traites
MSISDN_MAJ.log                   # log des MAJ effectuees
log/                             # repertoire de logs
```

### 3. Lancer le script

```bash
./Reengagement_whiptail_V2.sh
```

Le script demande successivement (interface whiptail) :

| Etape | Champ | Exemple |
|-------|-------|---------|
| 1 | Saisie du premier MSISDN | 0690082299 |
| 2 | Saisie des autres MSISDN (optionnel) | — |
| 3 | Date d'engagement (date_fin_abo) | 02/04/2028 |
| 4 | Date d'anciennete (date_ref_anciennete) | 15/05/2024 |
| 5 | Date eligibilite FID (date_eligible_fid) | 09/12/2025 |
| 6 | Numero de ticket RT | 276770 |
| 7 | Libelle (type de trace) | MAJ_date_engagement_et_FID |
| 8 | Code utilisateur | SJ623255 |
| 9 | Type de requete | Mise a jour des trois dates |

### 4. Verification

Le script execute la procedure PL/SQL et affiche :
```
Procedure PL/SQL terminee avec succes.
```

Un mail est automatiquement envoye en commentaire sur le ticket RT avec la trace + PJ `Trace_actions_bd_user.log`.

**Regles de calcul des dates :**
- **Reengagement 24 mois** : `date_fin_abo` = date du jour + 24 mois
- **Report de mois** : reporter les dates de l'ancien dossier vers le nouveau
- **MAJ FID seule** : seule `date_eligible_fid` est modifiee, `date_fin_abo` laissee vide

---

## Methode B — Interface web APP_OCS

### 1. Acceder a APP_OCS

Ouvrir l'interface web APP_OCS supervision dans un navigateur.

```
http://172.24.114.165/OCS/supervision/index.php
```

### 2. Executer la requete 11561

Renseigner les champs suivants :
- **MSISDN** du client
- **Numero de ticket RT**
- **Type de trace** : selon le cas d'usage (voir tableau ci-dessus)
- **code_user_trace** : code utilisateur du demandeur (ex: BM615558)

### 3. Verifier la trace automatique

APP_OCS envoie automatiquement un commentaire sur le ticket RT avec la trace complete :

```
msisdn = '069XXXXXXX',
date_fin_abo = DD/MM/YYYY,
date_ref_anciennete = DD/MM/YYYY,
date_eligible_fid = DD/MM/YYYY,
numero_rt = XXXXXX,
type_trace = MAJ_date_engagement_et_FID,
code_user_trace = XXXXXXXX,
code requete : 11561
```

PJ : `Trace_actions_bd_user.log`

---

## Fermer le ticket RT

```
Bonjour,
La mise a jour a été effectuée.
Je ferme donc le ticket.
--
Cdt,
[Prénom NOM]
Équipe Application
```

## Exemples concrets

### Exemple 1 : Reengagement 24 mois (ticket #276434)

Client 1299542, reduction 5EUR a vie accordee en echange d'un reengagement :
- msisdn = '0690082299'
- date_fin_abo = 18/03/2028 (date du jour + 24 mois)
- type_trace = MAJ_date_engagement
- code_user_trace = BM615558

Reponse : "La ligne a ete reengagee jusqu'au 18/03/2028."

### Exemple 2 : Report de mois de fidelisation (ticket #276432)

Client dont la ligne a ete resiliee puis reattribuee sur un nouveau dossier suite a un incident de prelevement :
- msisdn = '0696770464'
- date_fin_abo = 14/05/2025
- date_ref_anciennete = 15/05/2024
- date_eligible_fid = 14/05/2025
- type_trace = MAJ_date_engagement_et_FID
- code_user_trace = JJ608576

### Exemple 3 : MAJ FID apres reactivation forfait (ticket #276492)

Apres reactivation d'un forfait bloque, mise a jour des dates de fidelisation :
- msisdn = '0690077091'
- date_fin_abo = null (pas de reengagement)
- date_ref_anciennete = 10/12/2024
- date_eligible_fid = 09/12/2025
- type_trace = MAJ_date_FID

### Exemple 4 : Reattribution points FID apres changement materiel (ticket #276770)

Suite au ticket #276682 (liberation IMEI + changement materiel), reattribution des points de fidelite :
- Script : `./Reengagement_whiptail_V2.sh`
- Choix : "Mise a jour des trois dates"
- code_user_trace = SJ623255

## Notes operationnelles

- Le code requete **11561** est utilise pour les mises a jour de fidelisation (ajout/report). Pour les **annulations** de fidelisation, utiliser le code **11605** (voir protocole P07).
- Le `code_user_trace` est le code employe du demandeur (format XX + 6 chiffres, ex: BM615558, SJ623255).
- Le script shell et l'interface web produisent le **meme resultat** : MAJ en base + trace automatique postee sur le ticket RT.
- APP_OCS poste automatiquement la trace en commentaire + PJ sur le ticket RT.
- Le script `Reengagement_whiptail_V2.sh` permet de traiter **plusieurs MSISDN** en une seule execution.
