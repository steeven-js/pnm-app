# P40 — Verification des resiliations PSO non effectives

**Categorie :** Portabilite
**Declencheur :** Email automatique "[PNM] Verification des resiliations pour PSO du JJ/MM/AAAA" de oracle@vmqprostdb01
**Serveur :** vmqproportaweb01 (SoapUI), vmqproportawebdb01 (PortaDB), vmqprostdb01 (Oracle MOBI)
**Temps moyen :** 10 a 30 min (selon nombre de MSISDN)
**Frequence :** Extremement rare

---

## Contexte

Lors d'une portabilite sortante (PSO), la resiliation de la ligne chez Digicel s'effectue automatiquement apres la bascule. Un script de verification (`Pnm_pso_lignes_non_resiliees.sh`) tourne sur vmqprostdb01 et envoie un email automatique s'il detecte des MSISDN qui n'ont pas ete resilies.

L'email est envoye a rt-appli@ticket.digicelgroup.fr et cree automatiquement un ticket RT dans la file APPLICATIONS.

Si les MSISDN ne sont pas resilies rapidement, ils restent actifs chez Digicel alors qu'ils sont deja portes chez un autre operateur, ce qui peut generer des facturations indues.

## Format de l'email

```
Bonjour,

Il y a N resiliation(s) non effective(s) pour la bascule du JJ/MM/AAAA.

Veuillez trouver ci-dessous le(s) MSISDN concerne(s):

069XXXXXXX
069XXXXXXX

Cordialement,
APP-OCS
```

## Etapes

### 1. Verifier le portage dans PortaDB

Pour chaque MSISDN liste dans l'email, confirmer que le portage sortant est bien cloture :

```sql
SELECT P.msisdn, P.etat_id_actuel, P.date_portage, M.operateur_id_actuel
FROM PortaDB.PORTAGE P
INNER JOIN PortaDB.MSISDN M ON P.msisdn = M.msisdn
WHERE P.msisdn IN ('069XXXXXXX', '069XXXXXXX')
AND P.date_fin IS NULL
ORDER BY P.date_portage DESC;
```

Verifier :
- `etat_id_actuel` : doit etre en etat cloture (portage effectue)
- `operateur_id_actuel` : doit etre != 2 (le numero n'est plus chez Digicel)

> **Attention :** Ne JAMAIS resilier un MSISDN dont le portage n'est pas confirme dans PortaDB.

### 2. Verifier le FNR

Confirmer dans le FNR que les MSISDN sont bien chez l'autre operateur :

http://172.24.2.21/apis/porta/fnr-get-info.html

Si le MSISDN est toujours chez Digicel dans le FNR, il y a une incoherence — ne pas resilier et escalader a l'equipe PNM.

### 3. Verifier le statut dans MOBI

Sur vmqprostdb01 (Oracle MOBI) :

```bash
su - oracle
sqlplus pb/gaston@MCST50A.BTC.COM
```

```sql
SELECT LINE_NO, LINE_MSISDN_ACTIVE, LINE_STATUS
FROM LINE
WHERE LINE_MSISDN_ACTIVE IN ('069XXXXXXX', '069XXXXXXX');
```

Si `LINE_STATUS` indique que la ligne est encore active, la resiliation automatique a bien echoue et une resiliation manuelle est necessaire.

### 4. Resilier manuellement via SoapUI

Suivre le protocole P11 (Resiliation manuelle PSO) pour chaque MSISDN :

1. Ouvrir SoapUI sur votre poste
2. Utiliser l'endpoint : `http://172.24.119.72:8080/PortaWs/DigicelFwiPortaWs4Esb`
3. Executer `ExecuteResiliationPs` pour chaque MSISDN :

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

### 5. Verifier la resiliation dans MOBI

Apres chaque appel SoapUI, verifier que la ligne est bien resiliee :

```sql
SELECT LINE_NO, LINE_MSISDN_ACTIVE, LINE_STATUS
FROM LINE
WHERE LINE_MSISDN_ACTIVE IN ('069XXXXXXX', '069XXXXXXX');
```

Le `LINE_STATUS` doit indiquer "resilie".

### 6. Cas particulier : MSISDN Wizzee (MS_CLASS = 80)

Verifier si le MSISDN est une ligne Wizzee :

```sql
SELECT operation_id, msisdn_no, MS_CLASS
FROM MSISDN
WHERE MSISDN_no IN ('069XXXXXXX', '069XXXXXXX');
```

Si `OPERATION_ID = 217` ou `MS_CLASS = 80` : ne pas resilier via SoapUI. Transmettre a l'equipe Wizzee par email pour la resiliation.

### 7. Fermer le ticket RT

```
Bonjour,

Les MSISDN suivants ont été résiliés manuellement suite à l'échec
de la résiliation automatique PSO :

- 069XXXXXXX
- 069XXXXXXX

La résiliation a été vérifiée dans MOBI.

Cdt,
[Prénom NOM]
Équipe Application
```

## Exemple reel — Email du 23/02/2026

**MSISDN concernes :**
- 0696869984
- 0696976911

Bascule du 23/02/2026 — 2 resiliations non effectives detectees par le script automatique. Resiliation manuelle effectuee via SoapUI (P11).

## Notes operationnelles

- Cet email est extremement rare — la plupart du temps la resiliation automatique fonctionne
- Le script de detection tourne sur vmqprostdb01 (oracle) : `Pnm_pso_lignes_non_resiliees.sh`
- Toujours verifier PortaDB et FNR AVANT de resilier — ne jamais resilier un MSISDN dont le portage n'est pas confirme
- Voir P11 pour la procedure detaillee SoapUI avec captures d'ecran
- Voir P37 pour le cas ou la resiliation est necessaire apres un traitement d'attentes de tickets operateurs
