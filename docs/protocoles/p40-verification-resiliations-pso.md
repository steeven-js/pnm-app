# P40 — Vérification des résiliations PSO non effectives

**Catégorie :** Portabilité
**Déclencheur :** Email automatique "[PNM] Verification des résiliations pour PSO du JJ/MM/AAAA" de oracle@vmqprostdb01
**Serveur :** vmqproportaweb01 (SoapUI), vmqproportawebdb01 (PortaDB), vmqprostdb01 (Oracle MOBI)
**Temps moyen :** 10 à 30 min (selon nombre de MSISDN)
**Fréquence :** Extrêmement rare

---

## Contexte

Lors d'une portabilité sortante (PSO), la résiliation de la ligne chez Digicel s'effectue automatiquement après la bascule. Un script de vérification (`Pnm_pso_lignes_non_resiliees.sh`) tourne sur vmqprostdb01 et envoie un email automatique s'il détecte des MSISDN qui n'ont pas été résiliés.

L'email est envoyé à rt-appli@ticket.digicelgroup.fr et crée automatiquement un ticket RT dans la file APPLICATIONS.

Si les MSISDN ne sont pas résiliés rapidement, ils restent actifs chez Digicel alors qu'ils sont déjà portés chez un autre opérateur, ce qui peut générer des facturations indues.

## Format de l'email

```
Bonjour,

Il y a N résiliation(s) non effective(s) pour la bascule du JJ/MM/AAAA.

Veuillez trouver ci-dessous le(s) MSISDN concerne(s):

069XXXXXXX
069XXXXXXX

Cordialement,
APP-OCS
```

## Étapes

### 1. Vérifier le portage dans PortaDB

Pour chaque MSISDN listé dans l'email, confirmer que le portage sortant est bien clôturé :

```sql
SELECT P.msisdn, P.etat_id_actuel, P.date_portage, M.operateur_id_actuel
FROM PortaDB.PORTAGE P
INNER JOIN PortaDB.MSISDN M ON P.msisdn = M.msisdn
WHERE P.msisdn IN ('069XXXXXXX', '069XXXXXXX')
AND P.date_fin IS NULL
ORDER BY P.date_portage DESC;
```

Vérifier :
- `etat_id_actuel` : doit être en état clôturé (portage effectué)
- `operateur_id_actuel` : doit être != 2 (le numéro n'est plus chez Digicel)

> **Attention :** Ne JAMAIS résilier un MSISDN dont le portage n'est pas confirmé dans PortaDB.

### 2. Vérifier le FNR

Confirmer dans le FNR que les MSISDN sont bien chez l'autre opérateur :

http://172.24.2.21/apis/porta/fnr-get-info.html

Si le MSISDN est toujours chez Digicel dans le FNR, il y a une incohérence — ne pas résilier et escalader à l'équipe PNM.

### 3. Vérifier le statut dans MOBI

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

Si `LINE_STATUS` indique que la ligne est encore active, la résiliation automatique a bien échoué et une résiliation manuelle est nécessaire.

### 4. Résilier manuellement via SoapUI

Suivre le protocole P11 (Résiliation manuelle PSO) pour chaque MSISDN :

1. Ouvrir SoapUI sur votre poste
2. Utiliser l'endpoint : `http://172.24.119.72:8080/PortaWs/DigicelFwiPortaWs4Esb`
3. Exécuter `ExecuteResiliationPs` pour chaque MSISDN :

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

### 5. Vérifier la résiliation dans MOBI

Après chaque appel SoapUI, vérifier que la ligne est bien résiliée :

```sql
SELECT LINE_NO, LINE_MSISDN_ACTIVE, LINE_STATUS
FROM LINE
WHERE LINE_MSISDN_ACTIVE IN ('069XXXXXXX', '069XXXXXXX');
```

Le `LINE_STATUS` doit indiquer "résilié".

### 6. Cas particulier : MSISDN Wizzee (MS_CLASS = 80)

Vérifier si le MSISDN est une ligne Wizzee :

```sql
SELECT operation_id, msisdn_no, MS_CLASS
FROM MSISDN
WHERE MSISDN_no IN ('069XXXXXXX', '069XXXXXXX');
```

Si `OPERATION_ID = 217` ou `MS_CLASS = 80` : ne pas résilier via SoapUI. Transmettre à l'équipe Wizzee par email pour la résiliation.

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

## Exemple réel — Email du 23/02/2026

**MSISDN concernés :**
- 0696869984
- 0696976911

Bascule du 23/02/2026 — 2 résiliations non effectives détectées par le script automatique. Résiliation manuelle effectuée via SoapUI (P11).

## Notes opérationnelles

- Cet email est extrêmement rare — la plupart du temps la résiliation automatique fonctionne
- Le script de détection tourne sur vmqprostdb01 (oracle) : `Pnm_pso_lignes_non_resiliees.sh`
- Toujours vérifier PortaDB et FNR AVANT de résilier — ne jamais résilier un MSISDN dont le portage n'est pas confirmé
- Voir P11 pour la procédure détaillée SoapUI avec captures d'écran
- Voir P37 pour le cas où la résiliation est nécessaire après un traitement d'attentes de tickets opérateurs
