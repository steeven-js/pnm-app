# P03 — Libération SIM (Carte SIM)

**Catégorie :** Libération
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Déclencheur :** Ticket RT — carte SIM à détacher pour réaffectation
**Temps moyen :** 10 à 15 min

---

## Contexte

Détacher une carte SIM d'une ligne ou d'un stock pour permettre sa réaffectation. L'opération se fait directement en SQL sur la base Oracle MOBI.

Le format ICCID Digicel est : `8959620XXXXXXXXXXXX` (19-20 chiffres, préfixe 8959620).

## Étapes

### 1. Connexion au serveur

Se connecter en SSH au serveur de production via mRemoteNG (en root), basculer vers oracle, puis ouvrir Oracle MOBI.


```bash
su - oracle
sqlplus pb/gaston@MCST50A.BTC.COM
```

### 2. Vérifier l'état de la SIM

```sql
SELECT SIM_NO, SIM_STATUS, ST_SIM_ID, SIM_STOCK_CODE, SIM_CHANGE
FROM SIM
WHERE SIM_NO = '8959620XXXXXXXXXXXX';
```

**Interprétation des champs :**

| Champ | Valeur | Signification |
|-------|--------|---------------|
| SIM_STATUS | 0 | Disponible |
| SIM_STATUS | 7 | Active (sur une ligne) |
| ST_SIM_ID | 0 | Libre |
| ST_SIM_ID | 7 | Attribuée |
| SIM_STOCK_CODE | — | Stock actuel de la SIM |

### 3. Vérifier que la SIM n'est pas sur une ligne active

**Important : ne PAS libérer une SIM associée à une ligne active.**

```sql
SELECT LINE_NO, LINE_MSISDN_ACTIVE, LINE_STATUS
FROM LINE
WHERE LINE_SIM_NO = '8959620XXXXXXXXXXXX';
```

> **Attention :** Si une ligne active est associée, NE PAS libérer. Informer le demandeur : "La SIM est encore rattachée à une ligne active (069XXXXXXX). Merci de confirmer la résiliation avant libération."

### 4. Libérer la SIM

Remettre la SIM en stock disponible.

```sql
UPDATE SIM
SET SIM_STATUS = '0',
    ST_SIM_ID = '0',
    SIM_CHANGE = TRUNC(SYSDATE)
WHERE SIM_NO = '8959620XXXXXXXXXXXX';
COMMIT;
```

### 5. Vérifier la libération

```sql
SELECT SIM_NO, SIM_STATUS, ST_SIM_ID, SIM_CHANGE
FROM SIM
WHERE SIM_NO = '8959620XXXXXXXXXXXX';
```

Confirmer que `SIM_STATUS = 0` et `ST_SIM_ID = 0`.

### 6. Fermer le ticket RT

```
Bonjour,
La carte SIM a été libérée.
Je ferme le ticket.
--
Cdt,
[Prénom NOM]
Équipe Application
```

## Notes opérationnelles

- Toujours vérifier qu'aucune ligne active n'est associée à la SIM avant libération.
- Le préfixe ICCID Digicel est `8959620` — si le format est différent, vérifier qu'il s'agit bien d'une SIM Digicel.
- La libération SIM est moins fréquente que la libération IMEI ou MSISDN.
