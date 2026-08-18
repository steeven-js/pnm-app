# P26 — Restitutions sortantes (tickets WS)

**Catégorie :** Portabilité
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Script :** Pnm-Restitutions-Sortantes-Tickets.sh
**Planification :** Lundi 06H00

---

## Contexte

Ce script crée les tickets de restitution sortante (3400) dans PortaDB en appelant le Web Service Porta `CreatePortaRestitution`. Il extrait les MSISDN à restituer depuis MOBI Oracle, calcule les dates, et effectue un appel SOAP pour chaque numéro.

## Web Service

- URL : `http://172.24.119.72:8080/PortaWs/DigicelFwiPortaWs4Esb`
- Action SOAP : `urn:CreatePortaRestitution`

## Logique

### 1. Calcul des dates

- **date_demande** : aujourd'hui (ou prochain jour ouvré si jour férié)
- **date_portage** : date_demande + 4 jours ouvrés

Les jours fériés sont vérifiés dans la table `PortaDB.FERRYDAY`.

> ⚠️ La `datePortage` envoyée est **indicative** : Porta la recale sur le prochain **jeudi** (créneau de bascule de la tâche p25). Voir l'exemple validé en bas de page.

### 2. Extraction MSISDN depuis MOBI

Le fichier SQL `~/Sql/MOBI-Extract-Restitutions_Sortantes.sql` extrait les MSISDN à restituer avec leur code opérateur.

### 3. Mapping opérateurs MOBI → Porta

| Code MOBI | Opérateur | Code Porta |
|-----------|-----------|------------|
| 211, 215, 217 | Orange | 01 |
| 212 | Dauphin | 04 |
| 213, 216, 218 | OMT/SFR | 03 |
| 214 | UTS | 05 |
| 219, 220, 221 | Free | 06 |

### 4. Recherche ancien ID portage

Pour chaque MSISDN, le script recherche l'ancien id_portage :
1. D'abord dans PNMV3 (`PortaDB.PORTAGE`)
2. Puis dans POM V2 (`PortaDB.HIST_POM_PORTAGE`)
3. Sinon, valeur par défaut : `62b6c108bea0c972d0bbace581beb924`

### 5. Appel SOAP

```xml
<soapenv:Envelope xmlns:por="http://service.digicel.fr/porta/">
  <soapenv:Body>
    <por:CreatePortaRestitutionInput>
      <por:opa>01</por:opa>
      <por:msisdn>069XXXXXXX</por:msisdn>
      <por:dateDemande>2026-04-01T10:00:00</por:dateDemande>
      <por:datePortage>2026-04-07T00:00:00</por:datePortage>
      <por:ancienIdPortage>XXXXXXXXXXXXXXXX</por:ancienIdPortage>
      <por:commentaire>RESTITUTION</por:commentaire>
    </por:CreatePortaRestitutionInput>
  </soapenv:Body>
</soapenv:Envelope>
```

## Exécution manuelle

```bash
ssh porta_pnmv3@vmqproportawebdb01
cd /home/porta_pnmv3/Scripts/
./Pnm-Restitutions-Sortantes-Tickets.sh
```

---

## Exemple validé (2026-06-23) — restitution 0690661540 → Dauphin (04)

Cas réel : numéro porté **Dauphin (04) → Digicel (02)** en août 2022, puis résilié → restitué à son attributaire **Dauphin**.

**Récupération de `ancienIdPortage`** dans PNMV3 (avant l'appel) :
```sql
SELECT id_portage FROM PortaDB.DATA
WHERE msisdn = '0690661540' ORDER BY date_creation_ticket;
-- => a4eab2a2fa9517af0fac98ad58958b29   (etat PORTAGE.etat_id_actuel = 9)
```
`opa` = **04** = OPD (opérateur donneur) du portage d'origine.

### Requête

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:por="http://service.digicel.fr/porta/">
   <soapenv:Body>
      <por:CreatePortaRestitutionInput>
         <por:opa>04</por:opa>
         <por:msisdn>0690661540</por:msisdn>
         <por:dateDemande>2026-06-23T16:15:00</por:dateDemande>
         <por:datePortage>2026-06-29T08:00:00</por:datePortage>
         <por:ancienIdPortage>a4eab2a2fa9517af0fac98ad58958b29</por:ancienIdPortage>
         <por:commentaire>RESTITUTION</por:commentaire>
      </por:CreatePortaRestitutionInput>
   </soapenv:Body>
</soapenv:Envelope>
```

### Réponse (succès)

```xml
<CreatePortaRestitutionOutput xmlns="http://service.digicel.fr/porta/">
   <portaId>33189584591c660c09fda9ab8c2eaab4</portaId>
   <code>E000</code>
</CreatePortaRestitutionOutput>
```

`code = E000` = succès (ticket 3400 créé). Le `portaId` retourné identifie le portage de restitution.

### Résultat dans PortaWebUi

- Portabilité **sortante** du 23/06/2026 — **portage le 25/06/2026** — receveur Digicel AFG / donneur Dauphin Telecom — **Restitution simple** (0690661540) — statut **Saisi**
- Ticket **3400 / internal**, créé en interne le mardi 23 juin 2026 à 16:18:36 — commentaire RESTITUTION

> ⚠️ **Date de portage recalée par Porta.** La requête demandait `datePortage = 2026-06-29`, mais le portage a été créé au **25/06/2026 (jeudi)**. Porta cale la bascule sur le prochain **jeudi**, créneau de la tâche **p25** (`Pnm-Restitutions-Sortantes-Bascule.sh`, jeudi 11h). La `datePortage` envoyée est donc indicative : c'est le prochain jeudi de bascule qui fait foi.
