# P03 — Liberation SIM (Carte SIM)

**Categorie :** Liberation
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Declencheur :** Ticket RT — carte SIM a detacher pour reaffectation

---

## Contexte

Detacher une carte SIM d'une ligne ou d'un stock pour permettre sa reaffectation.

## Etapes

### 1. Connexion au serveur

Se connecter en SSH au serveur de production.

```bash
ssh oracle@vmqprostdb01
```

### 2. Acceder au repertoire

Naviguer vers le repertoire de liberation SIM.

```bash
cd ~/script/LIBERATION/SIM/
```

### 3. Verifier l'etat de la SIM

Se connecter a Oracle MOBI et verifier l'etat actuel.
Format ICCID Digicel : 8959620XXXXXXXXXXXX (19-20 chiffres).

```sql
sqlplus pb/gaston@MCST50A.BTC.COM

SELECT SIM_NO, SIM_STATUS, ST_SIM_ID, SIM_STOCK_CODE, SIM_CHANGE
FROM SIM
WHERE SIM_NO = '8959620XXXXXXXXXXXX';
```

### 4. Verifier que la SIM n'est pas sur une ligne active

Important : ne PAS liberer une SIM associee a une ligne active.

```sql
SELECT LINE_NO, LINE_MSISDN_ACTIVE, LINE_STATUS
FROM LINE
WHERE LINE_SIM_NO = '8959620XXXXXXXXXXXX';
```

> **Attention :** Si une ligne active est associee, NE PAS liberer. Informer le demandeur.

### 5. Liberer la SIM

Remettre la SIM en stock disponible.

```sql
UPDATE SIM
SET SIM_STATUS = '0',
    ST_SIM_ID = '0',
    SIM_CHANGE = TRUNC(SYSDATE)
WHERE SIM_NO = '8959620XXXXXXXXXXXX';
COMMIT;
```

### 6. Fermer le ticket RT

"Bonjour,
La carte SIM a ete liberee.
Je ferme le ticket.
--
Cdt,
[Prenom NOM]
Equipe Application"
