# P05 — Remise offre famille non appliquee

**Categorie :** Debug / Diagnostic
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Declencheur :** Ticket RT — remise offre famille absente sur la facture

---

## Contexte

Corriger une remise offre famille (item 3920854) qui n'apparait pas sur la facture malgre l'activation.

## Etapes

### 1. Connexion a Oracle MOBI

Se connecter au serveur puis a la base Oracle.

```bash
ssh oracle@vmqprostdb01
sqlplus pb/gaston@MCST50A.BTC.COM
```

### 2. Supprimer l'item existant (nettoyage)

Inserer une demande de suppression dans RATP_ITEM puis executer la procedure.

```sql
-- Suppression item existant
INSERT INTO RATP_ITEM
SELECT li_customer_no, dossier_no, line_no, 3920854, 'I',
       TO_DATE(sysdate,'DD/MM/YYYY'), ' ', 0, 'SUPPRESSION'
FROM LINE
WHERE line_msisdn_active IN ('069XXXXXXX');
COMMIT;

-- Execution procedure de suppression
BEGIN
  PB.SUPP_ITEM_MASSE;
  COMMIT;
END;
```

### 3. Reinserer l'item offre famille

Inserer l'item et executer la procedure d'insertion.

```sql
-- Ajout item offre famille
INSERT INTO RATP_ITEM
SELECT li.li_CUSTOMER_NO, li.DOSSIER_NO, li.LINE_NO, 3920854, 'I',
       TO_DATE(sysdate,'DD/MM/YYYY'), ' ', 1, 'AJOUT'
FROM LINE li
WHERE li.line_msisdn_active IN ('069XXXXXXX');
COMMIT;

-- Execution procedure d'insertion dans la LAI
BEGIN
  PB.RATP_ITEM_MANQUANT_2;
  COMMIT;
END;
```

### 4. Mettre a jour les dates dans line_active_item

Mettre les dates de fin a 31/12/2050 pour que la remise reste active.

```sql
UPDATE LINE_ACTIVE_ITEM
SET LI_END_BILL_DATE = '31/12/2050',
    LI_END_LINKAFTER = '31/12/2050'
WHERE LINE_NO = 'XXXXXXX'     -- le line_no du client
AND ITEM_CODE = '3920854';     -- l'item offre famille
COMMIT;
```

> **Attention :** Recuperer le LINE_NO correct avant d'executer. Verifier avec : `SELECT LINE_NO FROM LINE WHERE LINE_MSISDN_ACTIVE = '069XXXXXXX';`

### 5. Fermer le ticket RT

"Bonjour,
La remise a ete inseree.
Je ferme donc le ticket.
--
Cdt,
[Prenom NOM]
Equipe Application"
