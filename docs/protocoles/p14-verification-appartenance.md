# P14 — Verification appartenance d'un numéro

**Categorie :** Debug / Diagnostic
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Declencheur :** Besoin de vérifier chez quel opérateur se trouve un MSISDN

---

## Contexte

Verifier chez quel opérateur se trouve un MSISDN dans PortaDB. Cette vérification est un pre-requis pour de nombreuses operations (libération MSISDN, portabilité, restitution, debug).

## Etapes

### 1. Se connecter a PortaDB

```bash
ssh porta_pnmv3@vmqproportawebdb01
```

### 2. Requete de vérification

Interroger la table MSISDN pour connaitre l'opérateur actuel.

```bash
mysql -e "SELECT M.msisdn, M.operateur_id_actuel, O.nom
FROM PortaDB.MSISDN M
INNER JOIN PortaDB.OPERATEUR O ON M.operateur_id_actuel = O.code
WHERE M.msisdn = '069XXXXXXX';"
```

### 3. Interpreter le résultat

| Code | Operateur | Observation |
|------|-----------|-------------|
| 1 | Orange Caraibe | |
| 2 | Digicel AFG | Operateur "maison" |
| 3 | Outremer Telecom / SFR | |
| 4 | Dauphin Telecom | |
| 5 | UTS Caraibe | Mode dégradé (pas de PNMDATA standard) |
| 6 | Free Caraibes | Attention B2B si RIO commence par 02E |

### 4. Verification etendue (optionnel)

Pour avoir plus de détails sur l'historique du numéro :

```sql
-- Verifier si un portage est en cours
mysql -e "SELECT msisdn, etat_id_actuel, date_portage, date_fin
FROM PortaDB.PORTAGE
WHERE msisdn = '069XXXXXXX'
ORDER BY date_portage DESC
LIMIT 5;"
```

```sql
-- Verifier la tranche d'origine du numéro
mysql -e "SELECT M.msisdn, M.operateur_id_actuel, T.operateur_id, T.début, T.fin
FROM PortaDB.MSISDN M
INNER JOIN PortaDB.TRANCHE T ON M.msisdn BETWEEN T.début AND T.fin
WHERE M.msisdn = '069XXXXXXX';"
```

La tranche indique l'**opérateur d'origine** du numéro (celui qui possede la plage de numéros), tandis que `operateur_id_actuel` indique l'opérateur **actuel** (après portage eventuel).

## Cas d'usage

| Situation | Ce qu'on cherche |
|-----------|-----------------|
| Libération MSISDN (P02) | Verifier operateur_id_actuel = 2 (Digicel) avant de liberer |
| Debug "numéro non attribue" | Verifier si le numéro est porte et chez quel opérateur |
| Demande CDC | "Est-ce que ce numéro est bien chez nous ?" |
| Pre-portabilité | Verifier l'opérateur donneur avant demande |

## Notes opérationnelles

- Cette vérification est un **pre-requis** pour le protocole P02 (Libération MSISDN).
- Si le numéro n'existe pas dans PortaDB, il n'a jamais ete enregistré dans le système de portabilité — vérifier la tranche pour connaitre l'opérateur d'origine.
