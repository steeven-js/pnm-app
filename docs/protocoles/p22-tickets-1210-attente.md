# P22 — Tickets 1210 en attente

**Categorie :** Portabilite
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Script :** Pnm_1210_awaiting.sh
**Declencheur :** Apres 1ere vacation (automatique)

---

## Contexte

Le ticket 1210 est la reponse d'acceptation de l'operateur donneur. Si un portage est prevu a J+1 et que le 1210 n'a pas ete recu, il y a un risque de blocage de la portabilite. Le script alerte par operateur.

## Email

`[PNM] Ticket(s) 1210 en attente` → fwi_pnm_si

## Logique

Le script verifie les portages en etat 3 (en cours) avec date_portage = J+1 (ou J+3 le vendredi) pour chaque operateur donneur (OC, SFRC, DT, UTS, FREEC).

### Requete type (Orange Caraibe)

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
1. Contacter l'operateur donneur concerne
2. Relancer la demande si necessaire
3. Si pas de reponse, le portage sera reporte
