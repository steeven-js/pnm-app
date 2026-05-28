# P05 — Remise offre famille non appliquée

**Catégorie :** Debug / Diagnostic
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Déclencheur :** Ticket RT — remise offre famille absente sur la facture
**Temps moyen :** 15 à 30 min
**Fréquence :** Modérée

---

## Contexte

Corriger une remise offre famille qui n'apparaît pas sur la facture malgré l'activation. Cela concerne les items de remise (ex: 3920854 pour offre famille, 3807700 pour remise -10,01EUR/mois) qui sont absents de la table `LINE_ACTIVE_ITEM`.

Ce problème survient fréquemment dans deux situations :
1. **Remise non propagée** : l'item est dans `RATP_ITEM` mais n'a pas été propagé dans la LAI (Ligne Active Item)
2. **Remise annulée suite à un changement de titulaire (CTI)** : lors d'un CTI, les remises de la ligne source sont automatiquement supprimées et doivent être réinsérées manuellement

## Items de remise courants

| Code item | Description | Montant |
|-----------|-------------|---------|
| 3920854 | Remise offre famille | Variable |
| 3807700 | Remise -10,01EUR/mois à VIE | -10,01 EUR/mois |

## Étapes

### 1. Connexion à Oracle MOBI

Se connecter au serveur via mRemoteNG (en root), basculer vers oracle, puis ouvrir Oracle MOBI.

```bash
su - oracle
sqlplus pb/gaston@MCST50A.BTC.COM
```

### 2. Récupérer le LINE_NO du client

```sql
SELECT LINE_NO, LINE_MSISDN_ACTIVE, LI_CUSTOMER_NO
FROM LINE
WHERE LINE_MSISDN_ACTIVE = '069XXXXXXX';
```

> **Attention :** Noter le LINE_NO, il sera nécessaire pour l'étape 4.

### 3. Vérifier si l'item est déjà présent dans LINE_ACTIVE_ITEM

```sql
SELECT LINE_NO, ITEM_CODE, LI_START_BILL_DATE, LI_END_BILL_DATE
FROM LINE_ACTIVE_ITEM
WHERE LINE_NO = 'XXXXXXX'
AND ITEM_CODE = '3920854';
```

Si aucun résultat : l'item est absent, il faut le réinsérer.
Si présent avec LI_END_BILL_DATE dans le passé : l'item a expiré, il faut le réinitialiser.

### 4. Supprimer l'item existant (nettoyage)

Insérer une demande de suppression dans RATP_ITEM puis exécuter la procédure.

```sql
-- Suppression item existant
INSERT INTO RATP_ITEM
SELECT li_customer_no, dossier_no, line_no, 3920854, 'I',
       TO_DATE(sysdate,'DD/MM/YYYY'), ' ', 0, 'SUPPRESSION'
FROM LINE
WHERE line_msisdn_active IN ('069XXXXXXX');
COMMIT;

-- Execution procédure de suppression
BEGIN
  PB.SUPP_ITEM_MASSE;
  COMMIT;
END;
```

### 5. Réinsérer l'item offre famille

Insérer l'item et exécuter la procédure d'insertion dans la LAI.

```sql
-- Ajout item offre famille
INSERT INTO RATP_ITEM
SELECT li.li_CUSTOMER_NO, li.DOSSIER_NO, li.LINE_NO, 3920854, 'I',
       TO_DATE(sysdate,'DD/MM/YYYY'), ' ', 1, 'AJOUT'
FROM LINE li
WHERE li.line_msisdn_active IN ('069XXXXXXX');
COMMIT;

-- Execution procédure d'insertion dans la LAI
BEGIN
  PB.RATP_ITEM_MANQUANT_2;
  COMMIT;
END;
```

**Procédures stockées :**
- `PB.SUPP_ITEM_MASSE` : supprime les items marqués 'SUPPRESSION' dans RATP_ITEM
- `PB.RATP_ITEM_MANQUANT_2` : propage les items marqués 'AJOUT' depuis RATP_ITEM vers LINE_ACTIVE_ITEM (la LAI)

### 6. Mettre à jour les dates dans LINE_ACTIVE_ITEM

Mettre les dates de fin à 31/12/2050 pour que la remise reste active indéfiniment.

```sql
UPDATE LINE_ACTIVE_ITEM
SET LI_END_BILL_DATE = '31/12/2050',
    LI_END_LINKAFTER = '31/12/2050'
WHERE LINE_NO = 'XXXXXXX'     -- le line_no du client (étape 2)
AND ITEM_CODE = '3920854';     -- l'item offre famille
COMMIT;
```

> **Attention :** Récupérer le LINE_NO correct à l'étape 2 avant d'exécuter.

### 7. Cas particulier : Remise perdue suite à un changement de titulaire (CTI)

Lors d'un CTI (changement de titulaire), les remises sont automatiquement annulées. Pour les réinsérer :

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

Puis mettre à jour les dates de fin (étape 6) avec le bon ITEM_CODE (3807700 au lieu de 3920854).

(Voir ticket #276220 — remise annulée suite CTI, client 2318525)

### 8. Fermer le ticket RT

```
Bonjour,
La remise a été insérée.
Je ferme donc le ticket.
--
Cdt,
[Prénom NOM]
Équipe Application
```

## Tables impliquées

| Table | Rôle |
|-------|------|
| `RATP_ITEM` | File d'attente des modifications d'items (ajout/suppression). Traitée par les procédures PB. |
| `LINE_ACTIVE_ITEM` | Items actifs sur chaque ligne. Contient les remises, options, services. |
| `LINE` | Lignes clients. Lien entre MSISDN et LINE_NO/DOSSIER_NO/LI_CUSTOMER_NO. |
