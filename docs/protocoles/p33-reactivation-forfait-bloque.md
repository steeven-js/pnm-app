# P33 — Reactivation forfait bloque SM

**Categorie :** Exploitation
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Declencheur :** Ticket RT — forfait bloque SM[24] ou similaire

---

## Contexte

Un forfait peut etre bloque avec le code SM[24] (ou autre code SM). Le client ne peut plus utiliser son forfait normalement. La reactivation passe par APP_OCS pour mettre a jour les dates de fidelisation et/ou reactiver le forfait.

## Symptomes

- Forfait affiche comme "bloque" dans MasterCRM
- Code blocage SM[24], SM[12], etc.
- Client ne beneficie plus de son forfait

## Tickets de reference

- 275916 : Reactivation forfait LIFE Premium 100Go bloque SM[24]
- 276492 : Reactivation forfait LIFE Premium 50Go bloque

## Etapes

### 1. Verifier l'etat du forfait dans MOBI

```bash
ssh oracle@vmqprostdb01
sqlplus pb/gaston@MCST50A.BTC.COM
```

```sql
SELECT LINE_NO, LINE_MSISDN_ACTIVE, LINE_STATUS, LINE_PACK_CODE
FROM LINE
WHERE LINE_MSISDN_ACTIVE = '069XXXXXXX';
```

### 2. Reactiver via APP_OCS

Acceder a APP_OCS : http://172.24.114.165/OCS/supervision/index.php

Executer la requete **11561** (MAJ_date_FID) :
- MSISDN du client
- Numero de ticket RT
- Type : MAJ_date_FID

APP_OCS met a jour :
- date_fin_abo
- date_ref_anciennete
- date_eligible_fid

### 3. Verifier la trace APP_OCS

Un commentaire automatique est poste sur le ticket RT :

```
msisdn = '069XXXXXXX', date_fin_abo = null, date_ref_anciennete = null,
date_eligible_fid = DD/MM/YYYY, numero_rt = XXXXXX,
type_trace = MAJ_date_FID, code_user_trace = BMXXXXXX,
code requete : 11561
```

PJ : `Trace_actions_bd_user.log`

### 4. Confirmer avec le demandeur

Attendre que le demandeur confirme que la ligne est active, puis si necessaire ajouter les mois de fidelite (engagement 24 mois).

### 5. Fermer le ticket RT

"Bonjour,
La mise a jour a ete effectuee.
Je ferme donc le ticket.
--
Cdt,
[Prenom NOM]
Equipe Application"
