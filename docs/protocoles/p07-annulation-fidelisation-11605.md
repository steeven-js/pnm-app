# P07 — Annulation Fidelisation (APP_OCS 11605)

**Categorie :** Exploitation
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Declencheur :** Ticket RT — annulation fidelisation avant liberation IMEI ou changement de terminal
**Temps moyen :** 2-3 jours (processus multi-etapes avec allers-retours CDC)
**Frequence :** Moderee

---

## Contexte

Annuler une fidelisation en cours via APP_OCS requete 11605, generalement avant une liberation IMEI pour un changement de terminal. C'est un processus **multi-etapes sur 2-3 jours** qui necessite des interactions avec le CDC (Customer Care) entre chaque etape.

La difference avec la requete 11561 :
- **11561** = MAJ/ajout de dates de fidelisation (reengagement, report de mois)
- **11605** = Annulation de la fidelisation en cours (remise a zero)

## Processus multi-etapes

Le processus complet suit ce deroulement type :

```
Ticket 1 (ex: #276682) :
  Jour 1 : Annulation FID via APP_OCS 11605
           → Liberation ancien IMEI (P01)
           → Informer le CDC
  Jour 2 : CDC effectue le changement de terminal
           → CDC confirme : "Le changement de materiel a ete fait"
  Jour 3 : Liberation nouvel IMEI (P01)
           → Fermeture ticket 1

Ticket 2 (ex: #276770) — suite du ticket 1 :
  Jour 3+ : Reattribution des points de fidelite
           → MAJ dates FID via script Reengagement_whiptail_V2.sh (P06)
           → Fermeture ticket 2
```

## Etapes

### 1. Connexion au serveur

Se connecter via mRemoteNG (en root) sur vmqprostdb01, puis basculer vers oracle.

```bash
su - oracle
```

### 2. Etape 1 — Annulation FID via APP_OCS 11605

**Methode A — Interface web :**

Ouvrir l'interface web APP_OCS supervision :
```
http://172.24.114.165/OCS/supervision/index.php
```

Executer la requete 11605 pour annuler la fidelisation :
- **MSISDN** du client
- **Numero de ticket RT**
- **type_trace** : MAJ_suite_annulation_fid
- **code requete** : 11605

**Methode B — Script shell :**

```bash
cd /home/oracle/script/MAJ_DATE_ENGAGEMENT
./Reengagement_whiptail_V2.sh
```

Renseigner les champs via l'interface whiptail (voir P06 pour le detail des etapes).

### 3. Etape 2 — Liberer l'ancien IMEI

Proceder a la liberation de l'ancien terminal (voir protocole P01 — Liberation IMEI).

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

### 4. Etape 3 — Attendre confirmation CDC

Le CDC effectue le changement de terminal dans MasterCRM/Hub. Attendre sa confirmation : "Le changement de materiel a ete fait."

### 5. Etape 4 — Liberer le nouvel IMEI

Apres confirmation du CDC, liberer le nouvel IMEI (protocole P01).

### 6. Etape 5 — Reattribuer les points de fidelite (P06)

Une fois le changement de materiel confirme, reattribuer les points de fidelite via le script Reengagement :

```bash
su - oracle
cd /home/oracle/script/MAJ_DATE_ENGAGEMENT
./Reengagement_whiptail_V2.sh
```

Renseigner :
- MSISDN du client
- Date d'engagement : nouvelle date calculee
- Date d'anciennete : date d'origine du contrat
- Date eligibilite FID : nouvelle date calculee
- Numero RT : numero du ticket en cours
- Libelle : MAJ_suite_annulation_fid
- Code utilisateur : votre code (ex: SJ623255, DD617299)
- Type de requete : **Mise a jour des trois dates**

Le script execute la procedure PL/SQL et envoie un mail automatique sur le ticket RT.

### 7. Verifier la trace

Dans l'historique APP_OCS du client, la trace apparait :

```
Question : RT276682 - MAJ_suite_annulation_fid - Code DD617299 - Line_no 7314800
Reponse  : Ancienne date : 29/03/28 Nouvelle date : 17/01/2027
```

La ligne "APP - Correction FID par Admin" apparait dans l'historique des requetes du client avec le statut "Traite".

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
| ~31/03 | #276682 | Annulation FID + liberation IMEI. CDC informe pour changement materiel. |
| ~01/04 | #276682 | CDC confirme le changement de materiel. Liberation nouvel IMEI. Ticket ferme. |
| 02/04 | #276770 | Reattribution points FID via `Reengagement_whiptail_V2.sh` : MAJ_suite_annulation_fid, code DD617299. Ancienne date 29/03/28 → Nouvelle date 17/01/2027. |

## Exemple concret 2 (ticket #276399)

Client 295393, MSISDN 0690833916 — annulation fidelisation + changement terminal :

| Jour | Action |
|------|--------|
| 17/03 | Ticket recu. Liberation ancien IMEI via APP_OCS |
| 18/03 | CDC informe, en attente du changement de terminal |
| 19/03 | CDC confirme : "Le changement de materiel a ete fait" |
| 20/03 | Liberation nouvel IMEI + MAJ via APP_OCS 11605 : msisdn='0690833916', date_fin_abo=31/08/2025, date_ref_anciennete=10/09/2022, date_eligible_fid=10/09/2023 |

## Exemple concret 3 (ticket #277081) — Annulation FID simple

Client 2184709, MSISDN 0690979069 — annulation fidelisation sans changement de terminal.
Demandeur : Sylvia GANOT. Repositionnement IMEI deja fait par le CDC.

| Jour | Action |
|------|--------|
| 17/04 | Ticket recu. Sylvia demande annulation FID, date fin engagement initiale : 10/02/2025 |
| 20/04 | Execution `Reengagement_whiptail_V2.sh` sur vmqprostdb01 : |

Trace du script :
```
msisdn = '0690979069', date_fin_abo = 10/02/2025,
date_ref_anciennete = 11/02/2023, date_eligible_fid = 10/02/2025,
numero_rt = 277081, type_trace = MAJ_suite_a_une_annulation_FID,
code_user_trace = SGANOT, code requete : 11605
```

> **Cas simple :** Quand le CDC a deja repositionne l'IMEI de depart et que seule l'annulation FID est demandee, le processus se fait en une seule etape sans allers-retours CDC.

## Notes operationnelles

- Ce protocole est toujours couple a au moins une liberation IMEI (P01) et une MAJ FID (P06).
- Le processus genere souvent **2 tickets RT** : un pour l'annulation FID + liberation IMEI, un second pour la reattribution des points apres changement materiel.
- Les allers-retours CDC allongent le delai — prevoir 2-3 jours au minimum.
- Le code 11605 est specifique aux annulations. Ne pas confondre avec 11561 (ajout/MAJ).
- Le libelle de trace pour ce workflow est `MAJ_suite_annulation_fid`.
- Si le CDC ne repond pas apres 2 jours, relancer par commentaire sur le ticket RT.
