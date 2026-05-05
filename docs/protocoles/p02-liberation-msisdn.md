# P02 — Libération MSISDN (Reaffectation numéro)

**Categorie :** Libération
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Declencheur :** Ticket RT — MSISDN a remettre en disponibilite
**Temps moyen :** 10 min a 3h (selon vérification nécessaire)
**Frequence :** Elevee (~248 tickets/an catégorie "Recuperation Numero")

---

## Contexte

Remettre un numéro MSISDN en disponibilite (statut 7) pour reaffectation. Le CDC ne trouve pas le numéro dans la liste des numéros reaffectables, ou le numéro est bloqué après résiliation/portabilité. L'operation se fait soit par script automatisé, soit par requête SQL manuelle sur la base Oracle MOBI.

## Pre-requis : Verification PortaDB

**Avant toute action**, vérifier que le numéro est bien chez Digicel dans PortaDB :

```bash
ssh porta_pnmv3@vmqproportawebdb01
mysql -e "SELECT msisdn, operateur_id_actuel FROM PortaDB.MSISDN WHERE msisdn = '069XXXXXXX';"
```

| operateur_id_actuel | Signification |
|---------------------|---------------|
| 2 | Digicel — OK, on peut proceder |
| 1, 3, 4, 5, 6 | Autre opérateur — NE PAS liberer, informer le demandeur |

> **Attention :** Si operateur_id_actuel != 2, le numéro n'est plus chez Digicel. Informer le demandeur : "Le numéro ne fait pas partie des numéros reaffectables car il n'est plus chez Digicel."

## Etapes

### 1. Connexion au serveur

Se connecter en SSH au serveur de production via mRemoteNG (en root), puis basculer vers l'utilisateur oracle.

```bash
su - oracle
```

### 2. Option A — Script automatisé

Naviguer vers le repertoire et lancer le script.

```bash
cd ~/script/LIBERATION/
./liberation_MSISDN.sh -v
```

### 3. Option B — SQL manuel : Verifier l'etat

Se connecter a Oracle MOBI et vérifier l'etat du MSISDN.

```sql
sqlplus pb/gaston@MCST50A.BTC.COM

SELECT MSISDN_NO, ST_MSISDN_ID, MSISDN_STATUS, MS_CLASS, MSISDN_CHANGE
FROM MSISDN
WHERE MSISDN_NO = '069XXXXXXX';
```

**Interpretation des champs :**

| Champ | Valeur | Signification |
|-------|--------|---------------|
| ST_MSISDN_ID | 0 | Disponible |
| ST_MSISDN_ID | 7 | Porte (chez un autre opérateur) |
| MSISDN_STATUS | 7 | Reaffectable |
| MSISDN_STATUS | 0 ou 1 | Inactif / Actif |
| MS_CLASS | 0 | Classe normale (client Digicel standard) |
| MS_CLASS | 72 | Classe numéro or (masque dans MasterCRM) |
| MS_CLASS | 73 | Classe collaborateur (interne Digicel) |

### 4. Option B — SQL manuel : Remettre en disponibilite

Passer le MSISDN en statut 7 (disponible) avec classe normale.

```sql
UPDATE MSISDN
SET ST_MSISDN_ID = '0',
    MSISDN_STATUS = '7',
    MS_CLASS = '0'
WHERE MSISDN_NO = '069XXXXXXX';
COMMIT;
```

> **Attention MS_CLASS :** Avant la mise a jour, vérifier la valeur actuelle de MS_CLASS. Si le MSISDN est un numéro collaborateur (MS_CLASS = 73), conserver cette valeur au lieu de mettre 0. Exemple pour un collaborateur :
> ```sql
> UPDATE MSISDN
> SET ST_MSISDN_ID = '0', MSISDN_STATUS = '7'
> WHERE MSISDN_NO = '069XXXXXXX';
> COMMIT;
> ```

### 5. Cas particulier : MSISDN collaborateur (interne Digicel)

Pour un MSISDN interne Digicel (demande interne, ex: mail de la direction) :

**Etape 1** — Passage en statut reaffectable avec classe normale (pour que le CDC puisse l'affecter) :
```sql
UPDATE MSISDN
SET ST_MSISDN_ID = '0', MSISDN_STATUS = '7', MS_CLASS = '0'
WHERE MSISDN_NO IN ('069XXXXXXX');
COMMIT;
```

**Etape 2** — Repondre au demandeur : "Le MSISDN est disponible en reaffectation"

**Etape 3** — Apres activation de la ligne par le CDC, remettre la classe collaborateur :
```sql
UPDATE MSISDN
SET MS_CLASS = '73'
WHERE MSISDN_NO IN ('069XXXXXXX');
COMMIT;
```

(Voir ticket #276549 — demande interne Digicel, MS_CLASS 73)

### 6. Cas particulier : Numero or (MS_CLASS = 72)

Les numéros or (MS_CLASS = 72) n'apparaissent pas dans la liste des MSISDN reaffectables sur MasterCRM. Il faut temporairement changer la classe pour permettre au CDC de faire la manipulation, puis la restaurer.

**Etape 1** — Passer MS_CLASS de 72 a 0 pour rendre le numéro visible dans MasterCRM :
```sql
UPDATE MSISDN
SET ST_MSISDN_ID = '0', MSISDN_STATUS = '7', MS_CLASS = '0'
WHERE MSISDN_NO = '069XXXXXXX';
COMMIT;
```

**Etape 2** — Informer le CDC : "Le MSISDN est disponible en reaffectation dans le stock 211. Tu peux proceder."

**Etape 3** — Une fois que le CDC a effectue sa tâche, remettre MS_CLASS a 72 :
```sql
UPDATE MSISDN
SET MS_CLASS = '72'
WHERE MSISDN_NO = '069XXXXXXX';
COMMIT;
```

> **Important :** Ne pas oublier de remettre MS_CLASS a 72 après l'intervention du CDC, sinon le numéro perd son statut de numéro or.

(Voir ticket #276942 — SARL CAV ISLE, client 2222173)

### 7. Cas particulier : Erreur de portabilité

Quand le MSISDN est bloqué suite a une erreur de portabilité (mauvais numéro provisoire saisi sur le HUB) :
1. Passer le MSISDN porte en statut reaffectable (meme requête étape 4)
2. Informer le CDC : "Le MSISDN est disponible en reaffectation. Tu peux proceder au changement de MSISDN."
3. Le CDC effectue le changement de MSISDN vers le bon numéro provisoire

(Voir ticket #276089 — erreur de saisie PDV sur le HUB)

### 8. Le "stock 211"

Quand un MSISDN est remis en disponibilite, il apparait dans le **stock 211** de MasterCRM. C'est le stock de numéros reaffectables visible par le CDC.

Pour une libération combinee IMEI + MSISDN, répondre :
```
Les ressources ont été libérées.
Le MSISDN est disponible en réaffectation dans le stock 211.
```

(Voir ticket #276421)

### 9. Fermer le ticket RT

```
Bonjour,
Le numéro a été remis en disponibilité.
Le commercial peut procéder a l'activation.
Je ferme le ticket.
--
Cdt,
[Prénom NOM]
Équipe Application
```

Puis fermer le ticket (statut : résolu).
