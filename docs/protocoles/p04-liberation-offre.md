# P04 — Liberation Offre (customer_package)

**Categorie :** Liberation
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Declencheur :** Ticket RT — offre bloquee empechant un changement d'offre ou une reaffectation
**Temps moyen :** 5 a 30 min
**Frequence :** Moderee (~61 tickets/an categorie "Liberation Offre")

---

## Contexte

Liberer une offre bloquee dans la table `customer_package` de la base Oracle MOBI pour permettre un changement d'offre ou une reaffectation. Tant que la date `pack_end_activation` n'est pas depassee, l'offre reste active et ne peut pas etre reaffectee a un autre client.

Deux types de demandes :
1. **Liberation simple** : mettre a jour `pack_end_activation` pour rendre l'offre disponible
2. **Liberation avec restriction** : supprimer les droits du package (`package_right`) avant de liberer, necessaire pour les reactivations de forfait

## Etapes

### 1. Connexion a Oracle MOBI

Se connecter au serveur via mRemoteNG (en root), basculer vers oracle, puis ouvrir Oracle MOBI.

```bash
su - oracle
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

Ou rechercher par MSISDN :
```sql
SELECT CP.PACK_ID, CP.PACK_CODE, CP.PACK_START_ACTIVATION, CP.PACK_END_ACTIVATION
FROM CUSTOMER_PACKAGE CP
INNER JOIN LINE L ON CP.LI_CUSTOMER_NO = L.LI_CUSTOMER_NO
WHERE L.LINE_MSISDN_ACTIVE = '069XXXXXXX'
AND CP.PACK_END_ACTIVATION IS NULL;
```

> **Attention :** Verifier le PACK_ID avant de mettre a jour. Ne pas liberer un package actif legitime.

### 3a. Liberation simple — Forcer la date de fin d'activation

Mettre a jour `pack_end_activation` pour liberer l'offre. Utiliser la date du jour ou du lendemain.

```sql
UPDATE CUSTOMER_PACKAGE
SET PACK_END_ACTIVATION = TRUNC(SYSDATE)
WHERE PACK_ID IN ('XXXX');
COMMIT;
```

Exemples de pack_id rencontres :
- `13246` : Box 4G Illimitee GUYIDN 24M (ticket #276537)
- `13018` : Life 40Go Debloque AM 54.90EUR (ticket #276470)
- `13291` : LIFE Premium 50Go Bloque AM 12 mois (ticket #276492)

### 3b. Liberation avec restriction de droits (reactivation forfait)

Pour les demandes de reactivation d'un forfait bloque, il faut d'abord supprimer les droits du package avant de liberer l'offre :

```sql
-- Etape 1 : Restriction des droits pour mise a disposition
DELETE package_right
WHERE pack_id IN (XXXX)
AND pack_level_point NOT IN (0, 1, 2, 3, 5999996, 5999997, 5999998, 5999999);
COMMIT;

-- Etape 2 : Mise a disposition de l'offre
UPDATE customer_package
SET pack_end_activation = 'JJ/MM/AAAA'
WHERE pack_id IN ('XXXX');
COMMIT;
```

> **Attention :** Les `pack_level_point` preserves (0, 1, 2, 3, 5999996-5999999) sont les niveaux de base. Ne PAS les supprimer.

(Voir ticket #276492 — reactivation LIFE Premium 50Go)

### 4. Cas particulier : Retractation client

Quand un client souhaite se retracter d'une offre (ex: forfait bloque ne permettant pas les appels internationaux) :
1. Liberer l'offre actuelle (etape 3a)
2. Liberer l'IMEI si demande (protocole P01)
3. Le CDC pourra ensuite affecter la nouvelle offre

(Voir ticket #276470 — retractation forfait bloque vers offre debloquee)

### 5. Fermer le ticket RT

Pour une liberation simple :
```
Bonjour,
L'offre a été libérée. Le changement d'offre peut maintenant être effectué.
Je ferme le ticket.
--
Cdt,
[Prénom NOM]
Équipe Application
```

Pour une liberation combinee (offre + IMEI) :
```
Bonjour,
L'offre est disponible et l'IMEI a été libéré.
Avertis-nous quand la ligne aura été activée.
--
Cdt,
[Prénom NOM]
Équipe Application
```

Puis fermer le ticket (statut : resolu).

## Tables impliquees

| Table | Role |
|-------|------|
| `CUSTOMER_PACKAGE` | Packages (offres) attribues aux clients. `pack_end_activation` = date de fin. NULL = actif. |
| `PACKAGE_RIGHT` | Droits associes a un package (niveaux de service). A supprimer avant reactivation. |
| `LINE` | Lignes clients. Lien via `LI_CUSTOMER_NO`. |
