# P05 — Remise offre famille non appliquee

**Categorie :** Debug / Diagnostic
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Declencheur :** Ticket RT — remise offre famille absente sur la facture
**Temps moyen :** 15 a 30 min
**Frequence :** Moderee

---

## Contexte

Corriger une remise offre famille qui n'apparait pas sur la facture malgre l'activation. Cela concerne les items de remise (ex: 3920854 pour offre famille, 3807700 pour remise -10,01EUR/mois) qui sont absents de la table `LINE_ACTIVE_ITEM`.

Ce probleme survient frequemment dans deux situations :
1. **Remise non propagee** : l'item est dans `RATP_ITEM` mais n'a pas ete propage dans la LAI (Ligne Active Item)
2. **Remise annulee suite a un changement de titulaire (CTI)** : lors d'un CTI, les remises de la ligne source sont automatiquement supprimees et doivent etre reinserees manuellement

## Items de remise courants

| Code item | Description | Montant |
|-----------|-------------|---------|
| 3920854 | Remise offre famille | Variable |
| 3807700 | Remise -10,01EUR/mois a VIE | -10,01 EUR/mois |

## Etapes

### 1. Connexion a Oracle MOBI

Se connecter au serveur via mRemoteNG (en root), basculer vers oracle, puis ouvrir Oracle MOBI.

```bash
su - oracle
sqlplus pb/gaston@MCST50A.BTC.COM
```

### 2. Recuperer le LINE_NO du client

```sql
SELECT LINE_NO, LINE_MSISDN_ACTIVE, LI_CUSTOMER_NO
FROM LINE
WHERE LINE_MSISDN_ACTIVE = '069XXXXXXX';
```

> **Attention :** Noter le LINE_NO, il sera necessaire pour l'etape 4.

### 3. Verifier si l'item est deja present dans LINE_ACTIVE_ITEM

```sql
SELECT LINE_NO, ITEM_CODE, LI_START_BILL_DATE, LI_END_BILL_DATE
FROM LINE_ACTIVE_ITEM
WHERE LINE_NO = 'XXXXXXX'
AND ITEM_CODE = '3920854';
```

Si aucun resultat : l'item est absent, il faut le reinserer.
Si present avec LI_END_BILL_DATE dans le passe : l'item a expire, il faut le reinitialiser.

### 4. Supprimer l'item existant (nettoyage)

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

### 5. Reinserer l'item offre famille

Inserer l'item et executer la procedure d'insertion dans la LAI.

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

**Procedures stockees :**
- `PB.SUPP_ITEM_MASSE` : supprime les items marques 'SUPPRESSION' dans RATP_ITEM
- `PB.RATP_ITEM_MANQUANT_2` : propage les items marques 'AJOUT' depuis RATP_ITEM vers LINE_ACTIVE_ITEM (la LAI)

### 6. Mettre a jour les dates dans LINE_ACTIVE_ITEM

Mettre les dates de fin a 31/12/2050 pour que la remise reste active indefiniment.

```sql
UPDATE LINE_ACTIVE_ITEM
SET LI_END_BILL_DATE = '31/12/2050',
    LI_END_LINKAFTER = '31/12/2050'
WHERE LINE_NO = 'XXXXXXX'     -- le line_no du client (etape 2)
AND ITEM_CODE = '3920854';     -- l'item offre famille
COMMIT;
```

> **Attention :** Recuperer le LINE_NO correct a l'etape 2 avant d'executer.

### 7. Cas particulier : Remise perdue suite a un changement de titulaire (CTI)

Lors d'un CTI (changement de titulaire), les remises sont automatiquement annulees. Pour les reinserer :

```sql
-- Insertion remise -10,01EUR/mois (code item 3807700)
INSERT INTO RATP_ITEM
SELECT li.li_CUSTOMER_NO, li.DOSSIER_NO, li.LINE_NO,
       3807700, 'I', TO_DATE(sysdate,'DD/MM/YYYY'), ' ', 1, 'AJOUT'
FROM LINE li
WHERE li.line_msisdn_active IN ('069XXXXXXX');
COMMIT;

-- Propagation dans la LAI
BEGIN
  PB.RATP_ITEM_MANQUANT_2;
  COMMIT;
END;
```

Puis mettre a jour les dates de fin (etape 6) avec le bon ITEM_CODE (3807700 au lieu de 3920854).

(Voir ticket #276220 — remise annulee suite CTI, client 2318525)

### 8. Fermer le ticket RT

```
Bonjour,
La remise a ete inseree.
Je ferme donc le ticket.
--
Cdt,
[Prenom NOM]
Equipe Application
```

## Tables impliquees

| Table | Role |
|-------|------|
| `RATP_ITEM` | File d'attente des modifications d'items (ajout/suppression). Traitee par les procedures PB. |
| `LINE_ACTIVE_ITEM` | Items actifs sur chaque ligne. Contient les remises, options, services. |
| `LINE` | Lignes clients. Lien entre MSISDN et LINE_NO/DOSSIER_NO/LI_CUSTOMER_NO. |
