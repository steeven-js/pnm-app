# P07 — Annulation Fidelisation (APP_OCS 11605)

**Categorie :** Exploitation
**Serveur :** vmqprostdb01 (APP_OCS)
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
Jour 1 : Liberation ancien IMEI
         → Informer le CDC
Jour 2 : CDC effectue le changement de terminal
         → CDC confirme : "Le changement de materiel a ete fait"
Jour 3 : Liberation nouvel IMEI
         → MAJ dates engagement/FID via APP_OCS 11605
         → Fermeture ticket
```

## Etapes

### 1. Acceder a APP_OCS

Ouvrir l'interface web APP_OCS supervision.

```
http://172.24.114.165/OCS/supervision/index.php
```

### 2. Etape 1 — Liberer l'ancien IMEI

Proceder a la liberation de l'ancien terminal (voir protocole P01 — Liberation IMEI).

Informer le CDC :
```
L'ancien IMEI a ete libere.
Tu peux proceder au changement de terminal.
Merci de confirmer quand ce sera fait.
```

### 3. Etape 2 — Attendre confirmation CDC

Le CDC effectue le changement de terminal dans MasterCRM/Hub. Attendre sa confirmation : "Le changement de materiel a ete fait."

### 4. Etape 3 — Liberer le nouvel IMEI

Apres confirmation du CDC, liberer le nouvel IMEI (protocole P01).

### 5. Etape 4 — Executer la requete 11605

Dans APP_OCS, executer la requete 11605 pour annuler la fidelisation :

Renseigner :
- **MSISDN** du client
- **Numero de ticket RT**
- **date_fin_abo** : date souhaitee (generalement dans le passe)
- **date_ref_anciennete** : date de reference anciennete
- **date_eligible_fid** : date eligibilite fidelisation
- **type_trace** : MAJ_date_engagement_et_FID
- **code requete** : 11605

### 6. Verifier la trace automatique

APP_OCS envoie automatiquement un commentaire sur le ticket RT avec la trace :

```
msisdn = '069XXXXXXX',
date_fin_abo = DD/MM/YYYY,
date_ref_anciennete = DD/MM/YYYY,
date_eligible_fid = DD/MM/YYYY,
numero_rt = XXXXXX,
type_trace = MAJ_date_engagement_et_FID,
code requete : 11605
```

### 7. Fermer le ticket RT

Fermer le ticket apres toutes les etapes completees.

```
Bonjour,
L'annulation de la fidelisation a ete effectuee et les IMEI ont ete liberes.
Je ferme donc le ticket.
--
Cdt,
[Prenom NOM]
Equipe Application
```

## Exemple concret (ticket #276399)

Client 295393, MSISDN 0690833916 — annulation fidelisation + changement terminal :

| Jour | Action |
|------|--------|
| 17/03 | Ticket recu. Liberation ancien IMEI via APP_OCS |
| 18/03 | CDC informe, en attente du changement de terminal |
| 19/03 | CDC confirme : "Le changement de materiel a ete fait" |
| 20/03 | Liberation nouvel IMEI + MAJ via APP_OCS 11605 : msisdn='0690833916', date_fin_abo=31/08/2025, date_ref_anciennete=10/09/2022, date_eligible_fid=10/09/2023 |

## Notes operationnelles

- Ce protocole est toujours couple a au moins une liberation IMEI (P01).
- Les allers-retours CDC allongent le delai — prevoir 2-3 jours au minimum.
- Le code 11605 est specifique aux annulations. Ne pas confondre avec 11561 (ajout/MAJ).
- Si le CDC ne repond pas apres 2 jours, relancer par commentaire sur le ticket RT.
