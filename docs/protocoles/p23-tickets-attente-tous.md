# P23 — Tickets en attente (tous opérateurs)

**Catégorie :** Portabilité
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Script :** Pnm_tickets_awaiting.sh
**Déclencheur :** Quotidien (automatique)

---

## Contexte

Script complet de surveillance des tickets en attente pour tous les opérateurs. Vérifie 3 types de tickets :
- **1210** : acceptation portage (J+1)
- **1430** : confirmation portage (S-1)
- **3430** : confirmation restitution

## Email

`[PNM] Ticket(s) en attente` → fwi_pnm_si

## Opérateurs vérifiés

- Orange Caraïbe (OPD = 1)
- Outremer Telecom / SFR (OPD = 3)
- Dauphin Telecom (OPD = 4)
- UTS Caraïbe (OPD = 5)
- Free Caraïbes (OPD = 6)

## Tickets surveillés

### 1210 — Acceptation en attente

Portages en état 3 avec date_portage à J+1 sans ticket 1210 reçu.

### 1430 — Confirmation en attente

Portages en état 9 (portage effectué) entre S-1 et J-3 sans ticket 1430 reçu.

```sql
-- Exemple : portages OC sans 1430
SELECT DISTINCT(P.msisdn), P.id_portage, DATE_FORMAT(P.date_portage, '%d-%m-%Y')
FROM PORTAGE P
WHERE P.etat_id_actuel = 9
AND DATE(P.date_portage) BETWEEN DATE(NOW() - INTERVAL 1 WEEK) AND DATE(NOW() - INTERVAL 3 DAY)
AND P.msisdn NOT IN (
    SELECT DISTINCT(D.msisdn) FROM PORTAGE P2, DATA D
    WHERE P2.etat_id_actuel = 9
    AND P2.id_portage = D.id_portage
    AND CONCAT(D.code_ticket, D.operateur_origine) = '14301'  -- 1430 de OC
);
```

### 3430 — Confirmation restitution en attente

Restitutions en attente de confirmation.

## Action requise

Si des tickets sont en attente :
1. Identifier l'opérateur concerné
2. Vérifier si le ticket a été envoyé dans le dernier fichier PNMDATA
3. Si non reçu après 2 vacations, contacter l'opérateur
