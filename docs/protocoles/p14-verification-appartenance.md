# P14 — Verification appartenance d'un numero

**Categorie :** Debug / Diagnostic
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Declencheur :** Besoin de verifier chez quel operateur se trouve un MSISDN

---

## Contexte

Verifier chez quel operateur se trouve un MSISDN dans PortaDB.

## Etapes

### 1. Se connecter a PortaDB

Se connecter en SSH et interroger MySQL.

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

Codes operateurs :
- 1 = Orange Caraibe
- 2 = Digicel AFG
- 3 = Outremer Telecom / SFR
- 4 = Dauphin Telecom
- 5 = UTS Caraibe
- 6 = Free Caraibes
