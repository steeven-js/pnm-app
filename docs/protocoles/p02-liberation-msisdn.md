# P02 — Libération MSISDN (Réaffectation numéro)

**Catégorie :** Libération
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Déclencheur :** Ticket RT — MSISDN à remettre en disponibilité
**Temps moyen :** 10 min à 3h (selon vérification nécessaire)
**Fréquence :** Élevée (~248 tickets/an catégorie "Récupération Numéro")

---

## Contexte

Remettre un numéro MSISDN en disponibilité (statut 7) pour réaffectation. Le CDC ne trouve pas le numéro dans la liste des numéros réaffectables, ou le numéro est bloqué après résiliation/portabilité. L'opération se fait soit par script automatisé, soit par requête SQL manuelle sur la base Oracle MOBI.

## Pré-requis : Vérification PortaDB

**Avant toute action**, vérifier que le numéro est bien chez Digicel dans PortaDB :

```bash
ssh porta_pnmv3@vmqproportawebdb01
mysql -e "SELECT msisdn, operateur_id_actuel FROM PortaDB.MSISDN WHERE msisdn = '069XXXXXXX';"
```

| operateur_id_actuel | Signification |
|---------------------|---------------|
| 2 | Digicel — OK, on peut procéder |
| 1, 3, 4, 5, 6 | Autre opérateur — NE PAS libérer, informer le demandeur |

> **Attention :** Si operateur_id_actuel != 2, le numéro n'est plus chez Digicel. Informer le demandeur : "Le numéro ne fait pas partie des numéros réaffectables car il n'est plus chez Digicel."

## Étapes

### 1. Connexion au serveur

Se connecter en SSH au serveur de production via mRemoteNG (en root), puis basculer vers l'utilisateur oracle.

```bash
su - oracle
```

### 2. Option A — Script automatisé

Naviguer vers le répertoire et lancer le script.

```bash
cd ~/script/LIBERATION/
./liberation_MSISDN.sh -v
```

### 3. Option B — SQL manuel : Vérifier l'état

Se connecter à Oracle MOBI et vérifier l'état du MSISDN.

```sql
sqlplus pb/gaston@MCST50A.BTC.COM

SELECT MSISDN_NO, ST_MSISDN_ID, MSISDN_STATUS, MS_CLASS, MSISDN_CHANGE
FROM MSISDN
WHERE MSISDN_NO = '069XXXXXXX';
```

**Interprétation des champs :**

| Champ | Valeur | Signification |
|-------|--------|---------------|
| ST_MSISDN_ID | 0 | Disponible |
| ST_MSISDN_ID | 7 | Porté (chez un autre opérateur) |
| MSISDN_STATUS | 7 | Réaffectable |
| MSISDN_STATUS | 0 ou 1 | Inactif / Actif |
| MS_CLASS | 0 | Classe normale (client Digicel standard) |
| MS_CLASS | 72 | Classe numéro or (masqué dans MasterCRM) |
| MS_CLASS | 73 | Classe collaborateur (interne Digicel) |

### 4. Option B — SQL manuel : Remettre en disponibilité

Passer le MSISDN en statut 7 (disponible) avec classe normale.

```sql
UPDATE MSISDN
SET ST_MSISDN_ID = '0',
    MSISDN_STATUS = '7',
    MS_CLASS = '0'
WHERE MSISDN_NO = '069XXXXXXX';
COMMIT;
```

> **Attention MS_CLASS :** Avant la mise à jour, vérifier la valeur actuelle de MS_CLASS. Si le MSISDN est un numéro collaborateur (MS_CLASS = 73), conserver cette valeur au lieu de mettre 0. Exemple pour un collaborateur :
> ```sql
> UPDATE MSISDN
> SET ST_MSISDN_ID = '0', MSISDN_STATUS = '7'
> WHERE MSISDN_NO = '069XXXXXXX';
> COMMIT;
> ```

### 5. Cas particulier : MSISDN collaborateur (interne Digicel)

Pour un MSISDN interne Digicel (demande interne, ex: mail de la direction) :

**Étape 1** — Passage en statut réaffectable avec classe normale (pour que le CDC puisse l'affecter) :
```sql
UPDATE MSISDN
SET ST_MSISDN_ID = '0', MSISDN_STATUS = '7', MS_CLASS = '0'
WHERE MSISDN_NO IN ('069XXXXXXX');
COMMIT;
```

**Étape 2** — Répondre au demandeur : "Le MSISDN est disponible en réaffectation"

**Étape 3** — Après activation de la ligne par le CDC, remettre la classe collaborateur :
```sql
UPDATE MSISDN
SET MS_CLASS = '73'
WHERE MSISDN_NO IN ('069XXXXXXX');
COMMIT;
```

(Voir ticket #276549 — demande interne Digicel, MS_CLASS 73)

### 6. Cas particulier : Numéro or (MS_CLASS = 72)

Les numéros or (MS_CLASS = 72) n'apparaissent pas dans la liste des MSISDN réaffectables sur MasterCRM. Il faut temporairement changer la classe pour permettre au CDC de faire la manipulation, puis la restaurer.

**Étape 1** — Passer MS_CLASS de 72 à 0 pour rendre le numéro visible dans MasterCRM :
```sql
UPDATE MSISDN
SET ST_MSISDN_ID = '0', MSISDN_STATUS = '7', MS_CLASS = '0'
WHERE MSISDN_NO = '069XXXXXXX';
COMMIT;
```

**Étape 2** — Informer le CDC : "Le MSISDN est disponible en réaffectation dans le stock 211. Tu peux procéder."

**Étape 3** — Une fois que le CDC a effectué sa tâche, remettre MS_CLASS à 72 :
```sql
UPDATE MSISDN
SET MS_CLASS = '72'
WHERE MSISDN_NO = '069XXXXXXX';
COMMIT;
```

> **Important :** Ne pas oublier de remettre MS_CLASS à 72 après l'intervention du CDC, sinon le numéro perd son statut de numéro or.

(Voir ticket #276942 — SARL CAV ISLE, client 2222173)

### 7. Cas particulier : Erreur de portabilité

Quand le MSISDN est bloqué suite à une erreur de portabilité (mauvais numéro provisoire saisi sur le HUB) :
1. Passer le MSISDN porté en statut réaffectable (même requête étape 4)
2. Informer le CDC : "Le MSISDN est disponible en réaffectation. Tu peux procéder au changement de MSISDN."
3. Le CDC effectue le changement de MSISDN vers le bon numéro provisoire

(Voir ticket #276089 — erreur de saisie PDV sur le HUB)

### 8. Le "stock 211"

Quand un MSISDN est remis en disponibilité, il apparaît dans le **stock 211** de MasterCRM. C'est le stock de numéros réaffectables visible par le CDC.

Pour une libération combinée IMEI + MSISDN, répondre :
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
