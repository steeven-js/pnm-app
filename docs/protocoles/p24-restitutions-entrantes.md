# P24 — Restitutions entrantes (bascule J-21)

**Categorie :** Portabilite
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Script :** Pnm-Restitutions-Entrantes-Bascule.sh
**Planification :** Jours ouvrés, 21H00

---

## Contexte

Une restitution entrante = un numéro qui revient chez Digicel après avoir ete porte chez un autre opérateur. Le delai est de J-21 (21 jours après la date de portage) pour laisser le temps a tous les opérateurs de confirmer.

## Execution automatique

Le script s'exécute chaque jour ouvre a 21H00 via crontab.

## Logique

### 1. Extraction depuis PortaDB

```sql
SELECT DISTINCT(DATA.msisdn) FROM PortaDB.PORTAGE, PortaDB.DATA
WHERE PORTAGE.etat_id_actuel = 55              -- cloture
AND DATE(PORTAGE.date_portage) = DATE_SUB(CURDATE(), INTERVAL 21 DAY)
AND PORTAGE.id_portage = DATA.id_portage
AND CONCAT(DATA.code_ticket, DATA.operateur_origine) IN
    ('34301','34303','34304','34305','34306')   -- ticket 3430 de chaque opérateur
GROUP BY DATA.msisdn
HAVING COUNT(DISTINCT(CONCAT(DATA.code_ticket, DATA.operateur_origine))) = 5;
```

La condition `HAVING ... = 5` garantit que les 5 opérateurs ont confirme la restitution.

### 2. Mise a jour dans MOBI (Oracle)

```sql
UPDATE MSISDN
SET ST_MSISDN_ID = '0',
    MSISDN_STATUS = '0',
    MSISDN_CHANGE = TRUNC(SYSDATE)
WHERE msisdn_no IN (...)
AND ST_MSISDN_ID = '7'
AND MSISDN_STATUS IN ('0','1')
AND OPERATION_ID IN ('1','2','3');
COMMIT;
```

Le numéro passe de statut 7 (disponible chez l'autre opérateur) a statut 0 (inactif, de retour chez Digicel).

### 3. Securite

Le script ne s'exécute que sur le serveur de production (IP 172.24.119.68). Sur tout autre serveur, il affiche "No Mobi update from Porta Perf System".

## Connexions

- PortaDB : MySQL local
- MOBI : Oracle `pb/gaston@MCST50A.BTC.COM`
