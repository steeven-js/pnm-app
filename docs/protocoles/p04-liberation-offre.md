# P04 — Liberation Offre (customer_package)

**Categorie :** Liberation
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Declencheur :** Ticket RT — offre bloquee empechant un changement d'offre

---

## Contexte

Liberer une offre bloquee dans customer_package pour permettre un changement d'offre.

## Etapes

### 1. Connexion a Oracle MOBI

Se connecter au serveur puis a la base Oracle.

```bash
ssh oracle@vmqprostdb01
sqlplus pb/gaston@MCST50A.BTC.COM
```

### 2. Identifier le pack_id bloque

Rechercher les packages actifs du client.

```sql
SELECT PACK_ID, PACK_CODE, PACK_START_ACTIVATION, PACK_END_ACTIVATION
FROM CUSTOMER_PACKAGE
WHERE LI_CUSTOMER_NO = XXXXXXX
AND PACK_END_ACTIVATION IS NULL;
```

### 3. Forcer la date de fin d'activation

Mettre a jour pack_end_activation pour liberer l'offre.

```sql
UPDATE CUSTOMER_PACKAGE
SET PACK_END_ACTIVATION = TRUNC(SYSDATE)
WHERE PACK_ID IN ('XXXX');
COMMIT;
```

> **Attention :** Verifier le PACK_ID avant de mettre a jour. Ne pas liberer un package actif legitime.

### 4. Fermer le ticket RT

"Bonjour,
L'offre a ete liberee. Le changement d'offre peut maintenant etre effectue.
Je ferme le ticket.
--
Cdt,
[Prenom NOM]
Equipe Application"
