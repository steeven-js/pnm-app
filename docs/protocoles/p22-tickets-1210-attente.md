# P22 — Tickets 1210 en attente

**Catégorie :** Portabilité
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Script :** Pnm_1210_awaiting.sh
**Déclencheur :** Après 1ère vacation (automatique)

---

## Contexte

Le ticket 1210 est la réponse d'acceptation de l'opérateur donneur. Si un portage est prévu à J+1 et que le 1210 n'a pas été reçu, il y a un risque de blocage de la portabilité. Le script alerte par opérateur.

## Email

`[PNM] Ticket(s) 1210 en attente` → fwi_pnm_si

## Logique

Le script vérifie les portages en état 3 (en cours) avec date_portage = J+1 (ou J+3 le vendredi) pour chaque opérateur donneur (OC, SFRC, DT, UTS, FREEC).

### Requête type (Orange Caraïbe)

```sql
SELECT DISTINCT(D.msisdn), P.id_portage,
    DATE_FORMAT(P.date_portage, '%d-%m-%Y') AS date_portage,
    '1210' AS ticket_manquant
FROM PORTAGE P, DATA D
WHERE P.etat_id_actuel = 3
AND DATE(P.date_portage) = DATE(NOW() + INTERVAL 1 DAY)
AND P.id_portage = D.id_portage
AND D.OPD = '1';    -- Orange Caraibe
```

Le vendredi, `INTERVAL 1 DAY` devient `INTERVAL 3 DAY` (pour couvrir le lundi).

## Action requise

Si des tickets 1210 sont en attente :
1. Contacter l'opérateur donneur concerné
2. Relancer la demande si nécessaire
3. Si pas de réponse, le portage sera reporté
