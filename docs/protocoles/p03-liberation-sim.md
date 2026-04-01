# P03 — Liberation SIM (Carte SIM)

**Categorie :** Liberation
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Declencheur :** Ticket RT — carte SIM a detacher pour reaffectation
**Temps moyen :** 10 a 15 min

---

## Contexte

Detacher une carte SIM d'une ligne ou d'un stock pour permettre sa reaffectation. L'operation se fait directement en SQL sur la base Oracle MOBI.

Le format ICCID Digicel est : `8959620XXXXXXXXXXXX` (19-20 chiffres, prefixe 8959620).

## Etapes

### 1. Connexion au serveur

Se connecter en SSH au serveur de production puis a Oracle MOBI.

```bash
ssh oracle@vmqprostdb01
sqlplus pb/gaston@MCST50A.BTC.COM
```

### 2. Verifier l'etat de la SIM

```sql
SELECT SIM_NO, SIM_STATUS, ST_SIM_ID, SIM_STOCK_CODE, SIM_CHANGE
FROM SIM
WHERE SIM_NO = '8959620XXXXXXXXXXXX';
```

**Interpretation des champs :**

| Champ | Valeur | Signification |
|-------|--------|---------------|
| SIM_STATUS | 0 | Disponible |
| SIM_STATUS | 7 | Active (sur une ligne) |
| ST_SIM_ID | 0 | Libre |
| ST_SIM_ID | 7 | Attribuee |
| SIM_STOCK_CODE | — | Stock actuel de la SIM |

### 3. Verifier que la SIM n'est pas sur une ligne active

**Important : ne PAS liberer une SIM associee a une ligne active.**

```sql
SELECT LINE_NO, LINE_MSISDN_ACTIVE, LINE_STATUS
FROM LINE
WHERE LINE_SIM_NO = '8959620XXXXXXXXXXXX';
```

> **Attention :** Si une ligne active est associee, NE PAS liberer. Informer le demandeur : "La SIM est encore rattachee a une ligne active (069XXXXXXX). Merci de confirmer la resiliation avant liberation."

### 4. Liberer la SIM

Remettre la SIM en stock disponible.

```sql
UPDATE SIM
SET SIM_STATUS = '0',
    ST_SIM_ID = '0',
    SIM_CHANGE = TRUNC(SYSDATE)
WHERE SIM_NO = '8959620XXXXXXXXXXXX';
COMMIT;
```

### 5. Verifier la liberation

```sql
SELECT SIM_NO, SIM_STATUS, ST_SIM_ID, SIM_CHANGE
FROM SIM
WHERE SIM_NO = '8959620XXXXXXXXXXXX';
```

Confirmer que `SIM_STATUS = 0` et `ST_SIM_ID = 0`.

### 6. Fermer le ticket RT

```
Bonjour,
La carte SIM a ete liberee.
Je ferme le ticket.
--
Cdt,
[Prenom NOM]
Equipe Application
```

## Notes operationnelles

- Toujours verifier qu'aucune ligne active n'est associee a la SIM avant liberation.
- Le prefixe ICCID Digicel est `8959620` — si le format est different, verifier qu'il s'agit bien d'une SIM Digicel.
- La liberation SIM est moins frequente que la liberation IMEI ou MSISDN.
