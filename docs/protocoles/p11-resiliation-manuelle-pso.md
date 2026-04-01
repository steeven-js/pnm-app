# P11 — Resiliation manuelle PSO (SoapUI)

**Categorie :** Portabilite
**Serveur :** vmqproportaweb01 (DAPI)
**Utilisateur :** porta_pnmv3
**Declencheur :** MSISDN en portabilite sortante non resilie automatiquement
**Script detection :** Pnm_pso_lignes_non_resiliees.sh

---

## Contexte

Lors d'une portabilite sortante (PSO), la resiliation de la ligne chez Digicel doit s'effectuer automatiquement apres la bascule. Si le processus automatique echoue, le MSISDN reste actif chez Digicel alors qu'il est deja porte chez un autre operateur. La resiliation doit alors etre effectuee manuellement via SoapUI en appelant le Web Service DAPI.

## Detection

Le script `Pnm_pso_lignes_non_resiliees.sh` detecte automatiquement les MSISDN PSO non resilies et envoie une alerte par email. Le monitoring de l'application PNM App peut egalement les signaler.

## Pre-requis : Verifier dans PortaDB

Avant de resilier, verifier que le portage sortant est bien confirme :

```bash
ssh porta_pnmv3@vmqproportawebdb01
```

```sql
mysql -e "SELECT P.msisdn, P.etat_id_actuel, P.date_portage, M.operateur_id_actuel
FROM PortaDB.PORTAGE P
INNER JOIN PortaDB.MSISDN M ON P.msisdn = M.msisdn
WHERE P.msisdn = '069XXXXXXX'
AND P.date_fin IS NULL
ORDER BY P.date_portage DESC
LIMIT 1;"
```

Verifier :
- `etat_id_actuel` : doit etre en etat 9 (portage effectue) ou superieur
- `operateur_id_actuel` : doit etre != 2 (le numero n'est plus chez Digicel)

> **Attention :** Ne JAMAIS resilier un MSISDN dont le portage n'est pas confirme dans PortaDB.

## Etapes

### 1. Ouvrir SoapUI

Ouvrir SoapUI sur votre poste et charger le projet DAPI/PortaWs.

### 2. Configurer l'endpoint

URL du Web Service DAPI :
```
http://172.24.119.72:8080/PortaWs/DigicelFwiPortaWs4Esb
```

### 3. Preparer la requete de resiliation

Utiliser l'operation `ExecuteResiliationPs` du Web Service :

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:por="http://service.digicel.fr/porta/">
  <soapenv:Body>
    <por:ExecuteResiliationPsInput>
      <por:msisdn>069XXXXXXX</por:msisdn>
    </por:ExecuteResiliationPsInput>
  </soapenv:Body>
</soapenv:Envelope>
```

### 4. Executer la resiliation

Envoyer la requete SOAP pour chaque MSISDN PSO non resilie.

Verifier la reponse : le code retour doit confirmer la resiliation.

### 5. Verifier dans MOBI

Apres l'appel WS, confirmer que la ligne est bien resiliee dans MasterCRM :

```bash
su - oracle
sqlplus pb/gaston@MCST50A.BTC.COM
```

```sql
SELECT LINE_NO, LINE_MSISDN_ACTIVE, LINE_STATUS
FROM LINE
WHERE LINE_MSISDN_ACTIVE = '069XXXXXXX';
```

Le `LINE_STATUS` doit indiquer "resilie".

### 6. Documenter

Si la resiliation a ete effectuee pendant l'astreinte ou suite a un ticket :
- Mettre a jour le ticket RT d'astreinte ou creer un ticket RT specifique
- Indiquer le(s) MSISDN resilie(s) et la raison

## Reference

- Voir Cas Pratique #18 dans l'application PNM App pour la procedure detaillee SoapUI avec captures d'ecran.
- Image de reference : `public/images/soapui-execute-resiliation-ps.png`

## Notes operationnelles

- La resiliation manuelle est necessaire quand le processus automatique echoue (erreur WS, timeout, etc.).
- Verifier dans la file APPLICATIONS s'il y a un ticket de verification PSO associe : `[PNM] Verification des resiliations pour PSO du JJ/MM/AAAA`.
- Les MSISDN PSO non resilies sont critiques : ils consomment des ressources et peuvent generer des facturations indues.
