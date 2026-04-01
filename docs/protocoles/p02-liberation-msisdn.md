# P02 — Liberation MSISDN (Reaffectation numero)

**Categorie :** Liberation
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Declencheur :** Ticket RT — MSISDN a remettre en disponibilite

---

## Contexte

Remettre un numero MSISDN en disponibilite (statut 7) pour reaffectation.

## Etapes

### 1. Connexion au serveur

Se connecter en SSH au serveur de production.

```bash
ssh oracle@vmqprostdb01
```

### 2. Option A — Script automatise

Naviguer vers le repertoire et lancer le script.

```bash
cd ~/script/LIBERATION/
./liberation_MSISDN.sh -v
```

### 3. Option B — SQL manuel : Verifier l'etat

Se connecter a Oracle MOBI et verifier l'etat du MSISDN.

```sql
sqlplus pb/gaston@MCST50A.BTC.COM

SELECT MSISDN_NO, ST_MSISDN_ID, MSISDN_STATUS, MS_CLASS, MSISDN_CHANGE
FROM MSISDN
WHERE MSISDN_NO = '069XXXXXXX';
```

### 4. Option B — SQL manuel : Remettre en disponibilite

Passer le MSISDN en statut 7 (disponible).

```sql
UPDATE MSISDN
SET ST_MSISDN_ID = '0',
    MSISDN_STATUS = '7',
    MS_CLASS = '0'
WHERE MSISDN_NO = '069XXXXXXX';
COMMIT;
```

> **Attention :** Apres activation par le commercial, mettre a jour MS_CLASS : `UPDATE MSISDN SET MS_CLASS='73' WHERE MSISDN_NO='069XXXXXXX'; COMMIT;`

### 5. Verifier dans PortaDB

Avant toute action, verifier que le numero est bien chez Digicel (operateur_id_actuel = 2).

```bash
mysql -e "SELECT msisdn, operateur_id_actuel FROM PortaDB.MSISDN WHERE msisdn = '069XXXXXXX';"
```

> **Attention :** Si operateur_id_actuel != 2, le numero n'est plus chez Digicel. Informer le demandeur.

### 6. Fermer le ticket RT

"Bonjour,
Le numero a ete remis en disponibilite.
Le commercial peut proceder a l'activation.
Je ferme le ticket.
--
Cdt,
[Prenom NOM]
Equipe Application"
