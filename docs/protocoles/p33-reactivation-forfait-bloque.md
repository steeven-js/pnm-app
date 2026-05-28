# P33 — Réactivation forfait bloqué SM

**Catégorie :** Exploitation
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Déclencheur :** Ticket RT — forfait bloqué SM[24] ou similaire
**Temps moyen :** 2h à 1 jour (processus multi-étapes avec interaction CDC)
**Fréquence :** Modérée (~242 tickets/an catégorie "Réengagement / Réactivation")

---

## Contexte

Un forfait peut être bloqué avec le code SM[24] (Souscription Minimale 24 mois), SM[12] ou autre code SM. Le client ne peut plus utiliser son forfait normalement. La réactivation est un processus en **plusieurs étapes** impliquant :

1. Restriction des droits et libération de l'offre (SQL)
2. Libération de l'IMEI (APP_OCS)
3. Réactivation de la ligne par le CDC
4. Mise à jour des dates de fidélisation (APP_OCS 11561)

## Symptômes

- Forfait affiché comme "bloqué" dans MasterCRM
- Code blocage SM[24], SM[12], etc.
- Client ne bénéficie plus de son forfait

## Tickets de référence

| Ticket | Forfait | Client | Pack_id |
|--------|---------|--------|---------|
| #276492 | LIFE Premium 50Go Bloque AM 12 mois | 1988854 | 13291 |
| #275916 | LIFE Premium 100Go Bloque SM[24] | 2315747 | — |

## Étapes

### 1. Vérifier l'état du forfait dans MOBI

```bash
su - oracle
sqlplus pb/gaston@MCST50A.BTC.COM
```

```sql
SELECT LINE_NO, LINE_MSISDN_ACTIVE, LINE_STATUS, LINE_PACK_CODE
FROM LINE
WHERE LINE_MSISDN_ACTIVE = '069XXXXXXX';
```

Identifier le `pack_id` de l'offre bloquée :
```sql
SELECT PACK_ID, PACK_CODE, PACK_DESCRIPTION, PACK_START_ACTIVATION, PACK_END_ACTIVATION
FROM CUSTOMER_PACKAGE
WHERE LI_CUSTOMER_NO = XXXXXXX
AND PACK_END_ACTIVATION IS NULL;
```

### 2. Restriction des droits (package_right)

Supprimer les droits du package pour permettre la mise à disposition de l'offre en réaffectation.

```sql
DELETE package_right
WHERE pack_id IN (XXXXX)
AND pack_level_point NOT IN (0, 1, 2, 3, 5999996, 5999997, 5999998, 5999999);
COMMIT;
```

> **Attention :** Les `pack_level_point` préservés (0, 1, 2, 3, 5999996-5999999) sont les niveaux de base du système. Ne JAMAIS les supprimer.

### 3. Mise à disposition de l'offre

```sql
UPDATE customer_package
SET pack_end_activation = 'JJ/MM/AAAA'  -- date du lendemain
WHERE pack_id IN ('XXXXX');
COMMIT;
```

### 4. Libération IMEI

Libérer l'IMEI du client via APP_OCS (voir protocole P01 — Libération IMEI).

### 5. Informer le CDC

```
Bonjour,
L'offre est disponible et l'IMEI a été libéré.
Avertis-nous quand la ligne aura été activée.
--
Cdt,
[Prénom NOM]
Équipe Application
```

### 6. Attendre activation par le CDC

Le CDC réactive la ligne du client dans MasterCRM/Hub. Attendre sa confirmation.

### 7. MAJ dates fidélisation via APP_OCS 11561

Après confirmation de l'activation par le CDC, mettre à jour les dates de fidélisation.

Accéder à APP_OCS :
```
http://172.24.114.165/OCS/supervision/index.php
```

Exécuter la requête **11561** (MAJ_date_FID) :
- MSISDN du client
- Numéro de ticket RT
- Type : MAJ_date_FID
- date_fin_abo : null (sauf si réengagement)
- date_ref_anciennete : date d'origine du contrat
- date_eligible_fid : date d'éligibilité calculée

APP_OCS met à jour automatiquement :
- `date_fin_abo`
- `date_ref_anciennete`
- `date_eligible_fid`

### 8. Vérifier la trace APP_OCS

Un commentaire automatique est posté sur le ticket RT :

```
msisdn = '069XXXXXXX', date_fin_abo = null, date_ref_anciennete = DD/MM/YYYY,
date_eligible_fid = DD/MM/YYYY, numero_rt = XXXXXX,
type_trace = MAJ_date_FID, code_user_trace = BMXXXXXX,
code requête : 11561
```

PJ : `Trace_actions_bd_user.log`

### 9. Fermer le ticket RT

```
Bonjour,
La mise a jour a été effectuée.
Je ferme donc le ticket.
--
Cdt,
[Prénom NOM]
Équipe Application
```

## Exemple complet (ticket #276492)

Client CHARLES CHRISTELLE, 1988854, MSISDN 0690077091, IMEI 351199557969685
Forfait : LIFE Premium 50Go Bloque AM 12 mois (pack_id 13291)

| Étape | Action | SQL/Outil |
|-------|--------|-----------|
| 1 | Restriction droits | `DELETE package_right WHERE pack_id IN (13291) AND pack_level_point NOT IN (0,1,2,3,5999996,5999997,5999998,5999999)` |
| 2 | Libération offre | `UPDATE customer_package SET pack_end_activation = '21/03/2026' WHERE pack_id IN ('13291')` |
| 3 | Libération IMEI | APP_OCS script oracle (liberation_imei_info_*.txt) |
| 4 | Réponse CDC | "L'offre est disponible et l'IMEI a été libéré." |
| 5 | Attente | CDC réactive la ligne |
| 6 | MAJ FID | APP_OCS 11561 : msisdn='0690077091', date_ref_anciennete=10/12/2024, date_eligible_fid=09/12/2025, type=MAJ_date_FID |

## Tables impliquées

| Table | Role |
|-------|------|
| `CUSTOMER_PACKAGE` | Offres attribuées. `pack_end_activation` NULL = active. |
| `PACKAGE_RIGHT` | Droits/niveaux de service du package. Suppression nécessaire avant libération. |
| `LINE` | Lignes clients. Lien MSISDN ↔ LI_CUSTOMER_NO. |

## Notes opérationnelles

- Ce processus est **multi-étapes** avec interaction CDC — prévoir 2h minimum, jusqu'à 1 jour.
- La restriction des droits (`package_right`) est **obligatoire** avant la libération de l'offre pour les forfaits bloqués.
- Si le CDC ne confirme pas l'activation rapidement, le ticket reste ouvert en attente.
- Le code SM[24] signifie "Souscription Minimale 24 mois" — le forfait est engagé pour 24 mois minimum.
