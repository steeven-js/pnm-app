# P06 — MAJ Fidelisation / Reengagement (APP_OCS 11561)

**Categorie :** Exploitation
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Declencheur :** Ticket RT — mise a jour date fidelisation ou reengagement

---

## Contexte

Mettre a jour la date de fidelisation ou reengager une ligne via APP_OCS requete 11561.

## Etapes

### 1. Acceder a APP_OCS

Ouvrir l'interface web APP_OCS supervision.

```
http://172.24.114.165/OCS/supervision/index.php
```

### 2. Executer la requete 11561

APP_OCS 11561 permet de mettre a jour :
- date_fin_abo : date de fin d'abonnement
- date_ref_anciennete : date de reference anciennete
- date_eligible_fid : date eligibilite fidelisation

Renseigner :
- MSISDN du client
- Numero de ticket RT
- Type de trace : MAJ_date_FID ou MAJ_date_engagement_et_FID

### 3. Verifier la trace automatique

APP_OCS envoie automatiquement un commentaire sur le ticket RT avec la trace :
msisdn, date_fin_abo, date_ref_anciennete, date_eligible_fid, numero_rt, type_trace, code_user_trace, code requete : 11561

PJ : Trace_actions_bd_user.log

### 4. Fermer le ticket RT

"Bonjour,
La mise a jour a ete effectuee.
Je ferme donc le ticket.
--
Cdt,
[Prenom NOM]
Equipe Application"
