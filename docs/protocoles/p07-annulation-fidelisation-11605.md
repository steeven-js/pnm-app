# P07 — Annulation Fidélisation (APP_OCS 11605)

**Catégorie :** Exploitation
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Déclencheur :** Ticket RT — annulation fidélisation avant libération IMEI ou changement de terminal
**Temps moyen :** 2-3 jours (processus multi-étapes avec allers-retours CDC)
**Fréquence :** Modérée

---

## Contexte

Annuler une fidélisation en cours via APP_OCS requête 11605, généralement avant une libération IMEI pour un changement de terminal. C'est un processus **multi-étapes sur 2-3 jours** qui nécessite des interactions avec le CDC (Customer Care) entre chaque étape.

La différence avec la requête 11561 :
- **11561** = MAJ/ajout de dates de fidélisation (réengagement, report de mois)
- **11605** = Annulation de la fidélisation en cours (remise à zéro)

## Processus multi-étapes

Le processus complet suit ce déroulement type :

```
Ticket 1 (ex: #276682) :
  Jour 1 : Annulation FID via APP_OCS 11605
           → Libération ancien IMEI (P01)
           → Informer le CDC
  Jour 2 : CDC effectue le changement de terminal
           → CDC confirme : "Le changement de materiel a ete fait"
  Jour 3 : Libération nouvel IMEI (P01)
           → Fermeture ticket 1

Ticket 2 (ex: #276770) — suite du ticket 1 :
  Jour 3+ : Reattribution des points de fidelite
           → MAJ dates FID via script Reengagement_whiptail_V2.sh (P06)
           → Fermeture ticket 2
```

## Étapes

### 1. Connexion au serveur

Se connecter via mRemoteNG (en root) sur vmqprostdb01, puis basculer vers oracle.

```bash
su - oracle
```

### 2. Étape 1 — Annulation FID via APP_OCS 11605

**Méthode A — Interface web :**

Ouvrir l'interface web APP_OCS supervision :
```
http://172.24.114.165/OCS/supervision/index.php
```

Exécuter la requête 11605 pour annuler la fidélisation :
- **MSISDN** du client
- **Numéro de ticket RT**
- **type_trace** : MAJ_suite_annulation_fid
- **code requête** : 11605

**Méthode B — Script shell :**

```bash
cd /home/oracle/script/MAJ_DATE_ENGAGEMENT
./Reengagement_whiptail_V2.sh
```

Renseigner les champs via l'interface whiptail (voir P06 pour le détail des étapes).

### 3. Étape 2 — Libérer l'ancien IMEI

Procéder à la libération de l'ancien terminal (voir protocole P01 — Libération IMEI).

```bash
cd ~/script/LIBERATION/IMEI/
./liberation_IMEI.sh -v
```

Informer le CDC :
```
L'ancien IMEI a été libéré.
Tu peux procéder au changement de terminal.
Merci de confirmer quand ce sera fait.
```

### 4. Étape 3 — Attendre confirmation CDC

Le CDC effectue le changement de terminal dans MasterCRM/Hub. Attendre sa confirmation : "Le changement de matériel a été fait."

### 5. Étape 4 — Libérer le nouvel IMEI

Après confirmation du CDC, libérer le nouvel IMEI (protocole P01).

### 6. Étape 5 — Réattribuer les points de fidélité (P06)

Une fois le changement de matériel confirmé, réattribuer les points de fidélité via le script Reengagement :

```bash
su - oracle
cd /home/oracle/script/MAJ_DATE_ENGAGEMENT
./Reengagement_whiptail_V2.sh
```

Renseigner :
- MSISDN du client
- Date d'engagement : nouvelle date calculée
- Date d'ancienneté : date d'origine du contrat
- Date éligibilité FID : nouvelle date calculée
- Numéro RT : numéro du ticket en cours
- Libellé : MAJ_suite_annulation_fid
- Code utilisateur : votre code (ex: SJ623255, DD617299)
- Type de requête : **Mise à jour des trois dates**

Le script exécute la procédure PL/SQL et envoie un mail automatique sur le ticket RT.

### 7. Vérifier la trace

Dans l'historique APP_OCS du client, la trace apparaît :

```
Question : RT276682 - MAJ_suite_annulation_fid - Code DD617299 - Line_no 7314800
Reponse  : Ancienne date : 29/03/28 Nouvelle date : 17/01/2027
```

La ligne "APP - Correction FID par Admin" apparaît dans l'historique des requêtes du client avec le statut "Traité".

### 8. Fermer le ticket RT

```
Bonjour,
La mise a jour de la fidélisation a été effectuée suite au changement de matériel.
Je ferme donc le ticket.
--
Cdt,
[Prénom NOM]
Équipe Application
```

## Exemple concret 1 (tickets #276682 + #276770)

Client PIERRE MAX SAMUEL, MSISDN 0690450331, Line_no 7314800 :

| Jour | Ticket | Action |
|------|--------|--------|
| ~31/03 | #276682 | Annulation FID + libération IMEI. CDC informé pour changement matériel. |
| ~01/04 | #276682 | CDC confirme le changement de matériel. Libération nouvel IMEI. Ticket fermé. |
| 02/04 | #276770 | Réattribution points FID via `Reengagement_whiptail_V2.sh` : MAJ_suite_annulation_fid, code DD617299. Ancienne date 29/03/28 → Nouvelle date 17/01/2027. |

## Exemple concret 2 (ticket #276399)

Client 295393, MSISDN 0690833916 — annulation fidélisation + changement terminal :

| Jour | Action |
|------|--------|
| 17/03 | Ticket reçu. Libération ancien IMEI via APP_OCS |
| 18/03 | CDC informé, en attente du changement de terminal |
| 19/03 | CDC confirme : "Le changement de matériel a été fait" |
| 20/03 | Libération nouvel IMEI + MAJ via APP_OCS 11605 : msisdn='0690833916', date_fin_abo=31/08/2025, date_ref_anciennete=10/09/2022, date_eligible_fid=10/09/2023 |

## Exemple concret 3 (ticket #277081) — Annulation FID simple

Client 2184709, MSISDN 0690979069 — annulation fidélisation sans changement de terminal.
Demandeur : Sylvia GANOT. Repositionnement IMEI déjà fait par le CDC.

| Jour | Action |
|------|--------|
| 17/04 | Ticket reçu. Sylvia demande annulation FID, date fin engagement initiale : 10/02/2025 |
| 20/04 | Exécution `Reengagement_whiptail_V2.sh` sur vmqprostdb01 : |

Trace du script :
```
msisdn = '0690979069', date_fin_abo = 10/02/2025,
date_ref_anciennete = 11/02/2023, date_eligible_fid = 10/02/2025,
numero_rt = 277081, type_trace = MAJ_suite_a_une_annulation_FID,
code_user_trace = SGANOT, code requête : 11605
```

> **Cas simple :** Quand le CDC a déjà repositionné l'IMEI de départ et que seule l'annulation FID est demandée, le processus se fait en une seule étape sans allers-retours CDC.

## Notes opérationnelles

- Ce protocole est toujours couplé à au moins une libération IMEI (P01) et une MAJ FID (P06).
- Le processus génère souvent **2 tickets RT** : un pour l'annulation FID + libération IMEI, un second pour la réattribution des points après changement matériel.
- Les allers-retours CDC allongent le délai — prévoir 2-3 jours au minimum.
- Le code 11605 est spécifique aux annulations. Ne pas confondre avec 11561 (ajout/MAJ).
- Le libellé de trace pour ce workflow est `MAJ_suite_annulation_fid`.
- Si le CDC ne répond pas après 2 jours, relancer par commentaire sur le ticket RT.
