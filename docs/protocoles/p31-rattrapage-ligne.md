# P31 — Rattrapage de ligne (appels entrants KO)

**Categorie :** Debug / Diagnostic
**Serveur :** Reseau / MOBI
**Declencheur :** Ticket RT — client injoignable sur appels entrants

---

## Contexte

Apres un changement de MSISDN rejete ou un incident de portabilite, un client peut ne plus recevoir d'appels entrants. Le terminal fonctionne en sortant mais les appels entrants n'aboutissent pas. Un rattrapage de la ligne cote reseau est necessaire.

## Symptomes

- Client injoignable sur appels entrants
- Appels sortants fonctionnent normalement
- Souvent suite a un changement MSISDN rejete ou un incident de portabilite

## Tickets de reference

- 276534 : Anomalie appel entrant apres changement MSISDN rejete
- 275894 : Incident de rattrapage
- 276148 : Incident lie a un rattrapage de ligne

## Etapes

### 1. Verifier l'etat dans MOBI

```sql
-- Verifier le statut de la ligne
SELECT LINE_NO, LINE_MSISDN_ACTIVE, LINE_STATUS, LINE_SIM_NO
FROM LINE
WHERE LINE_MSISDN_ACTIVE = '069XXXXXXX';
```

### 2. Verifier dans PortaDB

```sql
-- Verifier si un portage est en cours ou recent
SELECT msisdn, operateur_id_actuel, portage_id_actuel
FROM PortaDB.MSISDN
WHERE msisdn = '069XXXXXXX';
```

### 3. Effectuer le rattrapage

Le rattrapage de la ligne est effectue cote reseau. Apres correction, le client doit redemarrer son terminal pour forcer la reinscription sur le reseau.

### 4. Fermer le ticket RT

"Bonjour,
Rattrapage de la ligne effectue cote reseau.
Le client doit relancer son terminal (redemarrage).
Je ferme le ticket.
--
Cdt,
[Prenom NOM]
Equipe Application"
