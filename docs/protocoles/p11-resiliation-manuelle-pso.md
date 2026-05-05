# P11 — Resiliation manuelle PSO (SoapUI)

**Categorie :** Portabilite
**Serveur :** vmqproportaweb01 (DAPI)
**Utilisateur :** porta_pnmv3
**Declencheur :** MSISDN en portabilité sortante non résilié automatiquement
**Script détection :** Pnm_pso_lignes_non_resiliees.sh

---

## Contexte

Lors d'une portabilité sortante (PSO), la résiliation de la ligne chez Digicel doit s'effectuer automatiquement après la bascule. Si le processus automatique échoué, le MSISDN reste actif chez Digicel alors qu'il est déjà porte chez un autre opérateur. La résiliation doit alors etre effectuee manuellement via SoapUI en appelant le Web Service DAPI.

## Detection

Le script `Pnm_pso_lignes_non_resiliees.sh` détecté automatiquement les MSISDN PSO non resilies et envoie une alerte par email. Le monitoring de l'application PNM App peut egalement les signaler.

## Pre-requis : Verifier dans PortaDB

Avant de resilier, vérifier que le portage sortant est bien confirme :

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
- `etat_id_actuel` : doit etre en etat 9 (portage effectue) ou supérieur
- `operateur_id_actuel` : doit etre != 2 (le numéro n'est plus chez Digicel)

> **Attention :** Ne JAMAIS resilier un MSISDN dont le portage n'est pas confirme dans PortaDB.

## Etapes

### 1. Ouvrir SoapUI

Ouvrir SoapUI sur votre poste et charger le projet DAPI/PortaWs.

### 2. Configurer l'endpoint

URL du Web Service DAPI :
```
http://172.24.119.72:8080/PortaWs/DigicelFwiPortaWs4Esb
```

### 3. Preparer la requête de résiliation

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

### 4. Executer la résiliation

Envoyer la requête SOAP pour chaque MSISDN PSO non résilié.

Verifier la reponse : le code retour doit confirmer la résiliation.

### 5. Verifier dans MOBI

Apres l'appel WS, confirmer que la ligne est bien résiliée dans MasterCRM :

```bash
su - oracle
sqlplus pb/gaston@MCST50A.BTC.COM
```

```sql
SELECT LINE_NO, LINE_MSISDN_ACTIVE, LINE_STATUS
FROM LINE
WHERE LINE_MSISDN_ACTIVE = '069XXXXXXX';
```

Le `LINE_STATUS` doit indiquer "résilié".

### 6. Documenter

Si la résiliation a ete effectuee pendant l'astreinte ou suite a un ticket :
- Mettre a jour le ticket RT d'astreinte ou créer un ticket RT spécifique
- Indiquer le(s) MSISDN résilié(s) et la raison

## Reference

- Voir Cas Pratique #18 dans l'application PNM App pour la procédure détaillée SoapUI avec captures d'ecran.
- Image de reference : `public/images/soapui-exécute-résiliation-ps.png`

## Notes opérationnelles

- La résiliation manuelle est nécessaire quand le processus automatique échoué (erreur WS, timeout, etc.).
- Verifier dans la file APPLICATIONS s'il y a un ticket de vérification PSO associe : `[PNM] Verification des résiliations pour PSO du JJ/MM/AAAA`.
- Les MSISDN PSO non resilies sont critiques : ils consomment des ressources et peuvent generer des facturations indues.
