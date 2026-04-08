# P32 — CTO / Changement Tarifaire d'Offre

**Categorie :** Exploitation
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Declencheur :** Ticket RT — erreur CTO "L'offre selectionnee n'est pas permise pour un changement de type d'offre"
**Temps moyen :** 30 min a 3 jours (selon clarification offres)
**Frequence :** Moderee (~264 tickets/an categorie "Offre / Forfait")

---

## Contexte

Le CTO (Changement Tarifaire d'Offre) permet de changer l'offre d'un client sans resiliation. Quand le CDC tente un CTO dans MasterCRM, il peut obtenir l'erreur : *"L'offre selectionnee n'est pas permise pour un changement de type d'offre... Veuillez en choisir une autre !"*

Cela signifie que l'**item de transition** (item CTO) entre l'offre source et l'offre cible n'existe pas dans la base. Il faut le creer manuellement via un script SQL.

## Regle metier importante

> **Pas de CTO cross-territoire : Antilles ↔ Guyane est interdit.**
>
> Un client ne peut pas passer d'une offre Antilles vers une offre Guyane (et inversement). Si le CDC demande un tel CTO, l'informer : "Attention, pas de CTO d'offre Antilles vers offre Guyane."

Exemples d'identifiants territoriaux dans les noms d'offres :
- **AM** = Antilles-Martinique
- **GUYIDN** ou **G/IDN** = Guyane/Iles du Nord
- **GP** = Guadeloupe

(Voir ticket #276330 — regle cross-territoire bloquant un CTO)

## Tickets de reference

| Ticket | Offre source | Offre cible | Client |
|--------|-------------|-------------|--------|
| #276514 | 13429 (LIFE Pro 240Go Bloque G/IDN AM 24) | 13091 (LIFE PRO 1h-1Go Bloque GUYIDN AM 24) | B2B 2157497 |
| #276330 | 13429 (LIFE Pro 240Go Bloque G/IDN AM 24) | 13092 (LIFE PRO 1h-1Go Bloque GUYIDN SM 24) | B2B 2157497 |

## Etapes

### 1. Clarifier les offres source et cible

Avant toute intervention, verifier avec le CDC :
- Le **pack_code** ou nom exact de l'offre source
- Le **pack_code** ou nom exact de l'offre cible
- Le territoire (Antilles vs Guyane)

> **Attention :** Les captures d'ecran du CDC peuvent etre illisibles. Demander les codes offres exacts si necessaire.

### 2. Connexion a Oracle MOBI

```bash
su - oracle
sqlplus pb/gaston@MCST50A.BTC.COM
```

### 3. Identifier les offres dans la base

```sql
-- Rechercher l'offre source
SELECT PACK_ID, PACK_CODE, PACK_DESCRIPTION
FROM CUSTOMER_PACKAGE
WHERE LI_CUSTOMER_NO = XXXXXXX
AND PACK_END_ACTIVATION IS NULL;

-- Rechercher l'offre cible par nom (dans CUSTOMER_PACKAGE d'un client existant)
SELECT DISTINCT PACK_CODE, PACK_DESCRIPTION
FROM CUSTOMER_PACKAGE
WHERE PACK_DESCRIPTION LIKE '%LIFE PRO%1h-1Go%';
```

> **Note :** La table `PACKAGE_DEF` n'existe pas dans Oracle MOBI. Rechercher les offres via `CUSTOMER_PACKAGE`.

### 4. Verifier l'historique CTO du client

```sql
-- Verifier les CTO deja effectues pour ce client
SELECT CTO_CUSTOMER_NO, CTO_LINE_NO, CTO_OFFRE, CTO_DATE, CTO_COMMENTAIRE, CTO_NO
FROM TRACE_CTO
WHERE CTO_CUSTOMER_NO = XXXXXXX
ORDER BY CTO_DATE DESC;
```

> **Note :** La table de trace CTO est `TRACE_CTO` (pas `CTO_TRANSITION` qui n'existe pas).

### 5. Creer l'item CTO

Le script SQL de creation est **specifique a chaque cas** et generalement fourni en piece jointe du ticket RT.

Format de nommage du script SQL : `RT#XXXXXX-CTO_[source]_vers_[cible].sql`

Exemple : `RT#276514-CTO_LP72M24 vers L1BAMG2.sql`

Forme generale de la creation :
```sql
-- Creation de l'item de transition CTO
-- Offre source : XXXX (description)
-- Offre cible  : YYYY (description)
INSERT INTO CTO_TRANSITION (PACK_SOURCE, PACK_CIBLE, ...)
VALUES ('XXXX', 'YYYY', ...);
COMMIT;
```

> **Attention :** Chaque CTO est unique. Utiliser le script SQL joint au ticket RT ou le generer selon les specifications du cas.

### 6. Cas particulier : CTO bloque (item actif)

Si le CTO est deja configure mais bloque (item CTO actif dans `customer_package`) :

```sql
-- Liberer l'item CTO bloque
UPDATE CUSTOMER_PACKAGE
SET PACK_END_ACTIVATION = TRUNC(SYSDATE)
WHERE PACK_ID IN ('XXXX');
COMMIT;
```

### 7. Confirmer au CDC

```
Bonjour,
Le CTO est desormais possible vers l'offre [NOM_OFFRE_CIBLE].
Tu peux proceder a la programmation.
--
Cdt,
[Prenom NOM]
Equipe Application
```

### 8. Fermer le ticket RT

Fermer le ticket (statut : resolu).

## Notes operationnelles

- **Delai** : le CTO peut prendre 1-3 jours si les offres doivent etre clarifiees avec le CDC (captures illisibles, noms d'offres ambigus).
- **Clients B2B** : les CTO B2B sont plus frequents car les entreprises changent souvent de forfait pour plusieurs lignes.
- **Script SQL en PJ** : le script SQL de creation de l'item CTO est souvent genere et attache en PJ du ticket RT. Toujours le verifier avant execution.
- **Meme client, plusieurs lignes** : un meme client B2B peut demander le CTO sur plusieurs lignes simultanement. Creer les items CTO pour toutes les transitions necessaires en une seule intervention.
