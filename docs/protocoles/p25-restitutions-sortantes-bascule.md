# P25 — Restitutions sortantes (bascule)

**Categorie :** Portabilite
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Script :** Pnm-Restitutions-Sortantes-Bascule.sh
**Planification :** Jeudi 11H00

---

## Contexte

Une restitution sortante = un numero qui quitte Digicel pour retourner chez son operateur d'origine. Lors de la bascule, le statut du MSISDN dans MOBI doit etre mis a jour pour refleter le depart.

## Logique

### 1. Extraction depuis PortaDB

```sql
SELECT DISTINCT(DATA.msisdn) FROM PortaDB.PORTAGE, PortaDB.DATA
WHERE PORTAGE.etat_id_actuel IN (56)           -- saisi
AND PORTAGE.id_portage = DATA.id_portage
AND DATA.date_creation_ticket >= CURDATE()
AND DATA.date_creation_ticket < CURDATE() + 1
AND DATA.code_ticket = 3400                     -- ticket restitution
AND DATA.OPR = 2;                               -- Digicel est l'operateur receveur
```

### 2. Mise a jour dans MOBI (Oracle)

```sql
UPDATE MSISDN
SET ST_MSISDN_ID = '7',
    MSISDN_STATUS = '0',
    MSISDN_CHANGE = TRUNC(SYSDATE)
WHERE msisdn_no IN (...);
COMMIT;
```

Le numero passe en statut 7 (disponible/restitue).

## Execution manuelle

```bash
ssh porta_pnmv3@vmqproportawebdb01
cd /home/porta_pnmv3/Scripts/
./Pnm-Restitutions-Sortantes-Bascule.sh
```
