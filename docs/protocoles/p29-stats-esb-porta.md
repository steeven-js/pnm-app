# P29 — Stats ESB Porta

**Categorie :** Exploitation
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Script :** Pnm_Stats_Bascule_ESB.sh
**Planification :** Quotidien

---

## Contexte

Collecte quotidienne des statistiques d'appels Web Services Porta sur l'ESB. Le rapport indique le nombre d'appels par action WS et leur statut (succès/échec).

## Email

`[PNMV3] Stats ESB Porta` → fwi_pnm_si

## Logique

### Requete sur la base ESB LOGGER

```sql
SELECT PWS_ACTION, IS_SUCCESS, COUNT(*) AS "NB CALL"
FROM LOGGER.LOG_ITEM
WHERE CREATION_DATE > SUBSTRING(NOW(),1,10)
AND TYPE LIKE 'nativeFrontend'
AND PWS_SYSTEM LIKE 'PORTA'
GROUP BY PWS_ACTION, IS_SUCCESS;
```

### Connexion ESB

- Serveur : 172.24.5.48
- Base : LOGGER
- User : application / application

### Fichier de sortie

`Log/Pnm_Stats_ESB_YYYYMMDD.xls` envoyé en piece jointe de l'email.

## Jours fériés

Le script détecté les jours fériés via :

```sql
SELECT COUNT(*) FROM PortaDB.FERRYDAY WHERE ferryday = CURDATE();
```

Si jour férié, l'email le mentionne : "il s'agit d'un jour férié, il n'y aura donc pas de portabilité."

## Execution manuelle

```bash
ssh porta_pnmv3@vmqproportawebdb01
cd /home/porta_pnmv3/Scripts/
./Pnm_Stats_Bascule_ESB.sh
```
