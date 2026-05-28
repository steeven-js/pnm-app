# P06 — MAJ Fidélisation / Réengagement (APP_OCS 11561)

**Catégorie :** Exploitation
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Déclencheur :** Ticket RT — mise à jour date fidélisation, réengagement, ou report de mois
**Temps moyen :** 5 à 15 min
**Fréquence :** Élevée (~124 tickets/an catégorie "Fidélisation" + partie "Réengagement")

---

## Contexte

Mettre à jour la date de fidélisation ou réengager une ligne via APP_OCS requête 11561. Cette opération couvre plusieurs cas d'usage :

| Cas d'usage | Type de trace | Description |
|-------------|---------------|-------------|
| Réengagement 24 mois | MAJ_date_engagement | Réengager une ligne pour 24 mois en échange d'une remise |
| Report de mois FID | MAJ_date_engagement_et_FID | Transférer les mois de fidélisation d'un ancien dossier vers un nouveau |
| MAJ date FID seule | MAJ_date_FID | Mise à jour date éligibilité fidélisation après réactivation |

## Champs mis à jour par APP_OCS 11561

| Champ | Description | Exemple |
|-------|-------------|---------|
| `date_fin_abo` | Date de fin d'abonnement (engagement) | 18/03/2028 (+24 mois) |
| `date_ref_anciennete` | Date de référence ancienneté client | 15/05/2024 |
| `date_eligible_fid` | Date à laquelle le client sera éligible à la fidélisation | 09/12/2025 |

## Deux méthodes disponibles

Il existe deux manières d'exécuter cette opération :

| Méthode | Outil | Quand l'utiliser |
|---------|-------|-----------------|
| **A — Script shell** | `Reengagement_whiptail_V2.sh` sur vmqprostdb01 | Méthode principale, en ligne de commande via mRemoteNG |
| **B — Interface web** | APP_OCS supervision (navigateur) | Alternative si accès web disponible |

Les deux méthodes exécutent la même requête 11561 et produisent le même résultat (MAJ en base + trace automatique sur le ticket RT).

---

## Méthode A — Script shell (recommandée)

### 1. Connexion au serveur

Se connecter via mRemoteNG (en root) sur vmqprostdb01, puis basculer vers oracle.

```bash
su - oracle
```

### 2. Accéder au répertoire

```bash
cd /home/oracle/script/MAJ_DATE_ENGAGEMENT
```

Contenu du répertoire :
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

| Étape | Champ | Exemple |
|-------|-------|---------|
| 1 | Saisie du premier MSISDN | 0690082299 |
| 2 | Saisie des autres MSISDN (optionnel) | — |
| 3 | Date d'engagement (date_fin_abo) | 02/04/2028 |
| 4 | Date d'ancienneté (date_ref_anciennete) | 15/05/2024 |
| 5 | Date éligibilité FID (date_eligible_fid) | 09/12/2025 |
| 6 | Numéro de ticket RT | 276770 |
| 7 | Libellé (type de trace) | MAJ_date_engagement_et_FID |
| 8 | Code utilisateur | SJ623255 |
| 9 | Type de requête | Mise à jour des trois dates |

### 4. Vérification

Le script exécute la procédure PL/SQL et affiche :
```
Procedure PL/SQL terminee avec succès.
```

Un mail est automatiquement envoyé en commentaire sur le ticket RT avec la trace + PJ `Trace_actions_bd_user.log`.

**Règles de calcul des dates :**
- **Réengagement 24 mois** : `date_fin_abo` = date du jour + 24 mois
- **Report de mois** : reporter les dates de l'ancien dossier vers le nouveau
- **MAJ FID seule** : seule `date_eligible_fid` est modifiée, `date_fin_abo` laissée vide

---

## Méthode B — Interface web APP_OCS

### 1. Accéder à APP_OCS

Ouvrir l'interface web APP_OCS supervision dans un navigateur.

```
http://172.24.114.165/OCS/supervision/index.php
```

### 2. Exécuter la requête 11561

Renseigner les champs suivants :
- **MSISDN** du client
- **Numéro de ticket RT**
- **Type de trace** : selon le cas d'usage (voir tableau ci-dessus)
- **code_user_trace** : code utilisateur du demandeur (ex: BM615558)

### 3. Vérifier la trace automatique

APP_OCS envoie automatiquement un commentaire sur le ticket RT avec la trace complète :

```
msisdn = '069XXXXXXX',
date_fin_abo = DD/MM/YYYY,
date_ref_anciennete = DD/MM/YYYY,
date_eligible_fid = DD/MM/YYYY,
numero_rt = XXXXXX,
type_trace = MAJ_date_engagement_et_FID,
code_user_trace = XXXXXXXX,
code requête : 11561
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

### Exemple 1 : Réengagement 24 mois (ticket #276434)

Client 1299542, réduction 5EUR à vie accordée en échange d'un réengagement :
- msisdn = '0690082299'
- date_fin_abo = 18/03/2028 (date du jour + 24 mois)
- type_trace = MAJ_date_engagement
- code_user_trace = BM615558

Réponse : "La ligne a été réengagée jusqu'au 18/03/2028."

### Exemple 2 : Report de mois de fidélisation (ticket #276432)

Client dont la ligne a été résiliée puis réattribuée sur un nouveau dossier suite à un incident de prélèvement :
- msisdn = '0696770464'
- date_fin_abo = 14/05/2025
- date_ref_anciennete = 15/05/2024
- date_eligible_fid = 14/05/2025
- type_trace = MAJ_date_engagement_et_FID
- code_user_trace = JJ608576

### Exemple 3 : MAJ FID après réactivation forfait (ticket #276492)

Après réactivation d'un forfait bloqué, mise à jour des dates de fidélisation :
- msisdn = '0690077091'
- date_fin_abo = null (pas de réengagement)
- date_ref_anciennete = 10/12/2024
- date_eligible_fid = 09/12/2025
- type_trace = MAJ_date_FID

### Exemple 4 : Réattribution points FID après changement matériel (ticket #276770)

Suite au ticket #276682 (libération IMEI + changement matériel), réattribution des points de fidélité :
- Script : `./Reengagement_whiptail_V2.sh`
- Choix : "Mise à jour des trois dates"
- code_user_trace = SJ623255

## Notes opérationnelles

- Le code requête **11561** est utilisé pour les mises à jour de fidélisation (ajout/report). Pour les **annulations** de fidélisation, utiliser le code **11605** (voir protocole P07).
- Le `code_user_trace` est le code employé du demandeur (format XX + 6 chiffres, ex: BM615558, SJ623255).
- Le script shell et l'interface web produisent le **même résultat** : MAJ en base + trace automatique postée sur le ticket RT.
- APP_OCS poste automatiquement la trace en commentaire + PJ sur le ticket RT.
- Le script `Reengagement_whiptail_V2.sh` permet de traiter **plusieurs MSISDN** en une seule exécution.
