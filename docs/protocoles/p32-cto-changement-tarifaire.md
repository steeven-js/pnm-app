# P32 — CTO / Changement tarifaire offre bloque

**Categorie :** Exploitation
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Declencheur :** Ticket RT — offre bloquee lors changement tarifaire

---

## Contexte

Lors d'un CTO (Changement Tarifaire Offre), l'item CTO peut rester bloque empechant la mise en disponibilite de l'offre. Le SQL de correction force la transition de l'item CTO.

## Symptomes

- Client ne peut pas changer d'offre
- Item CTO actif dans customer_package
- Erreur lors de la transition tarifaire

## Ticket de reference

- 276514 : Mise en disponibilite offre / CTO item transition

## Etapes

### 1. Connexion a Oracle MOBI

```bash
ssh oracle@vmqprostdb01
sqlplus pb/gaston@MCST50A.BTC.COM
```

### 2. Identifier le CTO bloque

```sql
SELECT PACK_ID, PACK_CODE, PACK_START_ACTIVATION, PACK_END_ACTIVATION
FROM CUSTOMER_PACKAGE
WHERE LI_CUSTOMER_NO = XXXXXXX
AND PACK_END_ACTIVATION IS NULL;
```

### 3. Corriger le CTO

Le SQL de correction est specifique a chaque cas et generalement attache en PJ du ticket RT original. Verifier le ticket pour le script exact.

Forme generale :

```sql
UPDATE CUSTOMER_PACKAGE
SET PACK_END_ACTIVATION = TRUNC(SYSDATE)
WHERE PACK_ID IN ('XXXX');
COMMIT;
```

### 4. Fermer le ticket RT

"Bonjour,
L'offre a ete liberee suite a la correction du CTO.
Je ferme le ticket.
--
Cdt,
[Prenom NOM]
Equipe Application"
