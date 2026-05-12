# P43 — PSO non résiliée suite au bug PortaWs (E610)

**Catégorie :** Portabilité / Debug
**Serveur :** vmqproportawebdb01 (PortaDB), vmqprostdb01 (MOBI)
**Utilisateur :** porta_pnmv3 (PortaDB), oracle (MOBI)
**Déclencheur :** Réclamation CDC — ligne portée chez un autre opérateur mais toujours active/facturée chez Digicel
**Origine :** Anomalie PortaWs du 01/04/2026 — bug auto-annulation

---

## Contexte

Suite à une opération de maintenance sur la plateforme PortaWs fin mars 2026, un défaut de déduplication des flux entrants `1410` a entraîné l'auto-annulation parasite (`1510 AP`) de portabilités sortantes (PSO) Digicel → Orange Caraïbe, alors que :

- Le workflow PNM côté Orange s'était déroulé normalement (`1110 in`, `1210 out`, `1410 in`)
- Les fichiers de vacation avaient été envoyés manuellement à Orange en mode dégradé
- Orange a effectivement basculé les lignes à la date prévue (02/04/2026)

**Conséquence :** la ligne reste active simultanément chez Digicel et chez Orange → double facturation cliente, réclamations CDC.

## Détection

### Symptômes côté CDC / client

- Le client porte sa ligne vers Orange avec son code RIO
- Orange confirme l'activation
- Mais Digicel continue de facturer la ligne (encore active dans MOBI)
- La ligne apparaît active chez les deux opérateurs

### Cas confirmés (incident du 01/04/2026)

| MSISDN | Département | Statut |
|---|---|---|
| 0696701813 | Martinique | ✅ Traité 11/05/2026 |
| 0690152968 | Guadeloupe | ✅ Traité 12/05/2026 |
| 0694243002 | Guyane (RT 277560 Wizzee) | ✅ Traité 12/05/2026 |
| 0694257800 | Guyane | ✅ Traité 12/05/2026 |

Tous PSO Digicel → OC (OPD=2, OPR=1). **Incident clos côté résiliation manuelle ; bug applicatif à corriger côté DEV (PILMEDIA).**

## Pré-requis : Vérifier dans PortaDB

```bash
ssh porta_pnmv3@vmqproportawebdb01
```

```sql
SELECT code_ticket, source, OPR, OPD,
       DATE_FORMAT(date_creation_ticket, '%d/%m/%Y %H:%i:%s') AS DATE_TICKET
FROM DATA
WHERE msisdn = '069XXXXXXX'
ORDER BY date_creation_ticket;
```

Le pattern qui confirme le bug E610 :

```
1110 in   <date>                                  ← demande OC reçue
1210 out  <date> (parfois en doublon)             ← éligibilité confirmée
1410 in   <date>                                  ← acceptation finale OC
7000 in   <date> "FLUX NON ATTENDU DANS LA PROCEDURE"
7000 internal <date> cancelPorta                   ← auto-annulation parasite
```

> **Sans ce pattern, il ne s'agit pas du même bug — utiliser P11 (résiliation manuelle PSO standard) à la place.**

## Vérification de l'opérateur actuel via FNR

URL : http://172.24.2.21/apis/porta/fnr-get-info.html

Saisir le MSISDN au format international :
- `590<msisdn sans 0>` pour Guadeloupe
- `594<msisdn sans 0>` pour Guyane
- `596<msisdn sans 0>` pour Martinique

Résultat attendu : `<MSISDN> est chez ORANGE <DEPARTEMENT>` — confirme que le portage a bien eu lieu côté OC.

## Étapes

### 1. Confirmer l'état dans Oracle MOBI

```bash
ssh oracle@vmqprostdb01
sqlplus pb/gaston@MCST50A.BTC.COM
```

```sql
SELECT LINE_NO, LINE_MSISDN_ACTIVE, LINE_STATUS
FROM LINE WHERE LINE_MSISDN_ACTIVE = '069XXXXXXX';
```

Si `LINE_STATUS` indique que la ligne est **active**, elle n'a pas été résiliée → procéder à la résiliation manuelle.

### 2. Résiliation manuelle PSO via SoapUI

Endpoint : `http://172.24.119.72:8080/PortaWs/DigicelFwiPortaWs4Esb`

Opération : `ExecuteResiliationPs`

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:mob="http://mobimaster/">
  <soapenv:Header/>
  <soapenv:Body>
    <mob:ExecuteResiliationPs>
      <mob:CodeAction>ResiliationPs</mob:CodeAction>
      <mob:MSISDN>069XXXXXXX</mob:MSISDN>
      <mob:DateEffet>2026-04-02T08:30:00</mob:DateEffet>
      <mob:Utilisateur>PORTA</mob:Utilisateur>
      <mob:Origine>PORTA</mob:Origine>
    </mob:ExecuteResiliationPs>
  </soapenv:Body>
</soapenv:Envelope>
```

> **IMPORTANT** : `DateEffet` = date du **portage effectif côté Orange**, pas la date du jour. Pour l'incident du 01/04, c'est `2026-04-02T08:30:00` (heure standard ARCEP de bascule). Adapter pour d'autres incidents similaires.

### 3. Vérifications post-résiliation

```sql
-- Oracle MOBI : LINE_STATUS doit passer à "résilié"
SELECT LINE_NO, LINE_MSISDN_ACTIVE, LINE_STATUS
FROM LINE WHERE LINE_MSISDN_ACTIVE = '069XXXXXXX';

-- PortaDB : operateur_id_actuel doit être 1 (OC)
SELECT msisdn, operateur_id_actuel
FROM PortaDB.MSISDN WHERE msisdn = '069XXXXXXX';
```

### 4. Commentaire interne à ajouter dans le ticket RT

```
Bug PortaWs nouvelle version (MEP fin mars 2026) :
- Workflow PSO 069XXXXXXX propre jusqu'au 31/03 (1110/1210/1410)
- Re-traitement du 1410 le 01/04 → erreur E610 "FLUX NON ATTENDU"
  → auto-annulation parasite (1510 AP)
- Aucun 1510 émis vers OC → portage effectif côté OC le 02/04
- FNR confirme : 59X<MSISDN sans 0> chez Orange <département>
- Ligne restée active côté Digicel → double facturation

Action :
- Résiliation manuelle PSO via SoapUI/PortaWs
  DateEffet : 02/04/2026 08:30:00
- Vérification Oracle MOBI + PortaDB : OK

À traiter éventuellement avec la même procédure :
liste des 4 MSISDN identifiés dans PNMDATA.01.02.20260401100000.001
```

### 5. Réponse au demandeur / CDC

```
Bonjour <Nom CDC>,

La ligne 069XXXXXXX a été résiliée côté Digicel avec effet au
02/04/2026 (date du portage effectif chez Orange).

Merci de te rapprocher de la facturation pour la régularisation
des factures émises depuis cette date.

--
Cordialement,
Steeven JACQUES - Chargé d'application
```

### 6. Mail à la facturation pour régularisation

Une fois toutes les résiliations effectuées, prévenir l'équipe Facturation pour qu'elle vérifie les facturations indues sur la période concernée.

**Destinataires types** : Teddy Moravie, Linda Haustant, Audrey Dorwling-Carter (Facturation) — Cc : Richard Delice, FWI_PNM_SI.

**Exemple réel envoyé le 12/05/2026 (Outlook)** :

```
Objet : [PNM] Lignes en porta sortante non résiliées à la date de portage

Bonjour,

Suite à un incident le 01 Avril 2026, certains portages ont pris du
retard, et nous avons constaté qu'ils n'ont pas été résiliés à la
date de portage.

Client 1   0690152968   date de portage le 02/04/2026
N° Client MasterCRM: 1531793   Cycle: 09
N° Dossier MasterCRM: 2203682
Ligne 7021104 - Offre 13293 LIFE Premium 50Go bloqué SM[24]
  => Résiliée le 12/05/2026

Client 2   0694243002 (Client Wizzee)
Email: xiongalice@yahoo.fr, MSISDN 0694243002 - Mode Off
Résiliation demandée : RT 277560

Client 3   0694257800   date de portage le 02/04/2026
N° Client MasterCRM: 2170731   Cycle: 26
N° Dossier MasterCRM: 2665924
Ligne 7002846 - Offre 13293 LIFE Premium 50Go bloqué SM[24]
  => Résiliée le 12/05/2026

Pouvez-vous vérifier si ces clients ont été facturés à tort
du mois en cours ?

Cordialement,
Steeven JACQUES
Chargé d'applications (DSI) | Application Team
Digicel Antilles-Guyane
+596 696 307 631
```

**Informations à inclure pour chaque client** :
- MSISDN
- Date du portage effectif (pour calcul de la période litigieuse)
- N° Client + N° Dossier MasterCRM (pour la Facturation)
- N° Ligne MOBI + offre souscrite
- Date de résiliation effective Digicel
- Pour les clients Wizzee : email + statut + référence RT


## Prévention et amélioration

### Détection proactive en base PortaDB

Identifier tous les portages avec cycle complet `1110/1210/1410` suivis d'une erreur `7000` sur une période :

```sql
SELECT DISTINCT d.id_portage, d.msisdn, d.OPR, d.OPD
FROM DATA d
WHERE d.id_portage IN (
    SELECT id_portage FROM DATA
    WHERE code_ticket = 7000
      AND DATE(date_creation_ticket) BETWEEN '2026-03-30' AND '2026-04-02'
)
  AND d.code_ticket IN (1110, 1210, 1410)
GROUP BY d.id_portage, d.msisdn, d.OPR, d.OPD
HAVING COUNT(DISTINCT d.code_ticket) >= 3;
```

À lancer **après chaque MEP/incident PortaWs** pour identifier proactivement les MSISDN impactés avant les réclamations CDC.

### Action immédiate suite à MEP PortaWs

Après chaque MEP de la plateforme PortaWs :

1. Surveiller le log `PnmDataManager.log` pour erreurs `E610`
2. Lancer la requête de détection ci-dessus le lendemain
3. Communiquer aux CDC concernés proactivement

### À éviter

Ne pas tenter de générer un `1510` en dégradé via fichier PNMDATA — c'est inutile, OC a déjà basculé la ligne. Seule la résiliation côté MOBI/PortaWs est nécessaire.

### Suivi PILMEDIA

Bug PortaWs 31/03-01/04 à faire corriger en profondeur côté DEV (Max / équipe PILMEDIA) : le moteur ne doit pas auto-annuler sur un `1410` déjà reçu.

## Références

- Ticket RT **277558** — PNM Lignes porta sortante non résiliées - Anomalie 01/04/2026
- Ticket RT **277560** — Wizzee Résiliation PSO non effectuée - 0694243002
- Fichier source incident : `PNMDATA.01.02.20260401100000.001`
- Protocole connexe : [P11 — Résiliation manuelle PSO (cas standard)](p11-resiliation-manuelle-pso.md)
- Protocole connexe : [P40 — Vérification résiliations PSO non effectives](p40-verification-resiliations-pso.md)

## Notes opérationnelles

- Cette procédure est **spécifique au bug E610 du 01/04/2026** — pour les autres cas de résiliation PSO non automatique, utiliser P11.
- `DateEffet` doit toujours correspondre à la date de portage effectif chez l'opérateur receveur (pas la date d'intervention).
- Vérifier impérativement le pattern E610 en base avant d'agir — l'absence de `7000` en `internal` après `1410 in` invalide ce protocole.
