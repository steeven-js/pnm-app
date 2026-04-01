# P14 — Verification appartenance d'un numero

**Categorie :** Debug / Diagnostic
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Declencheur :** Besoin de verifier chez quel operateur se trouve un MSISDN

---

## Contexte

Verifier chez quel operateur se trouve un MSISDN dans PortaDB. Cette verification est un pre-requis pour de nombreuses operations (liberation MSISDN, portabilite, restitution, debug).

## Etapes

### 1. Se connecter a PortaDB

```bash
ssh porta_pnmv3@vmqproportawebdb01
```

### 2. Requete de verification

Interroger la table MSISDN pour connaitre l'operateur actuel.

```bash
mysql -e "SELECT M.msisdn, M.operateur_id_actuel, O.nom
FROM PortaDB.MSISDN M
INNER JOIN PortaDB.OPERATEUR O ON M.operateur_id_actuel = O.code
WHERE M.msisdn = '069XXXXXXX';"
```

### 3. Interpreter le resultat

| Code | Operateur | Observation |
|------|-----------|-------------|
| 1 | Orange Caraibe | |
| 2 | Digicel AFG | Operateur "maison" |
| 3 | Outremer Telecom / SFR | |
| 4 | Dauphin Telecom | |
| 5 | UTS Caraibe | Mode degrade (pas de PNMDATA standard) |
| 6 | Free Caraibes | Attention B2B si RIO commence par 02E |

### 4. Verification etendue (optionnel)

Pour avoir plus de details sur l'historique du numero :

```sql
-- Verifier si un portage est en cours
mysql -e "SELECT msisdn, etat_id_actuel, date_portage, date_fin
FROM PortaDB.PORTAGE
WHERE msisdn = '069XXXXXXX'
ORDER BY date_portage DESC
LIMIT 5;"
```

```sql
-- Verifier la tranche d'origine du numero
mysql -e "SELECT M.msisdn, M.operateur_id_actuel, T.operateur_id, T.debut, T.fin
FROM PortaDB.MSISDN M
INNER JOIN PortaDB.TRANCHE T ON M.msisdn BETWEEN T.debut AND T.fin
WHERE M.msisdn = '069XXXXXXX';"
```

La tranche indique l'**operateur d'origine** du numero (celui qui possede la plage de numeros), tandis que `operateur_id_actuel` indique l'operateur **actuel** (apres portage eventuel).

## Cas d'usage

| Situation | Ce qu'on cherche |
|-----------|-----------------|
| Liberation MSISDN (P02) | Verifier operateur_id_actuel = 2 (Digicel) avant de liberer |
| Debug "numero non attribue" | Verifier si le numero est porte et chez quel operateur |
| Demande CDC | "Est-ce que ce numero est bien chez nous ?" |
| Pre-portabilite | Verifier l'operateur donneur avant demande |

## Notes operationnelles

- Cette verification est un **pre-requis** pour le protocole P02 (Liberation MSISDN).
- Si le numero n'existe pas dans PortaDB, il n'a jamais ete enregistre dans le systeme de portabilite — verifier la tranche pour connaitre l'operateur d'origine.
