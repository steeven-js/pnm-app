# P26 — Restitutions sortantes (tickets WS)

**Categorie :** Portabilite
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Script :** Pnm-Restitutions-Sortantes-Tickets.sh
**Planification :** Lundi 06H00

---

## Contexte

Ce script cree les tickets de restitution sortante (3400) dans PortaDB en appelant le Web Service Porta `CreatePortaRestitution`. Il extrait les MSISDN a restituer depuis MOBI Oracle, calcule les dates, et effectue un appel SOAP pour chaque numero.

## Web Service

- URL : `http://172.24.119.72:8080/PortaWs/DigicelFwiPortaWs4Esb`
- Action SOAP : `urn:CreatePortaRestitution`

## Logique

### 1. Calcul des dates

- **date_demande** : aujourd'hui (ou prochain jour ouvre si jour ferie)
- **date_portage** : date_demande + 4 jours ouvres

Les jours feries sont verifies dans la table `PortaDB.FERRYDAY`.

### 2. Extraction MSISDN depuis MOBI

Le fichier SQL `~/Sql/MOBI-Extract-Restitutions_Sortantes.sql` extrait les MSISDN a restituer avec leur code operateur.

### 3. Mapping operateurs MOBI → Porta

| Code MOBI | Operateur | Code Porta |
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
3. Sinon, valeur par defaut : `62b6c108bea0c972d0bbace581beb924`

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

## Execution manuelle

```bash
ssh porta_pnmv3@vmqproportawebdb01
cd ~/scripts/
./Pnm-Restitutions-Sortantes-Tickets.sh
```
