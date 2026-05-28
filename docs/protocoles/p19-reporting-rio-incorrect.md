# P19 — Reporting RIO incorrect (Refus R123)

**Catégorie :** Debug / Diagnostic
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Script :** check_refus_porta_rio_incorrect.sh
**Déclencheur :** Automatique (jours ouvrés) + suspicion de fraude

---

## Contexte

Le code motif R123 = "RIO incorrect". Un nombre élevé de refus R123 peut indiquer une tentative de fraude en masse (portabilité avec des RIO falsifiés).

## Exécution automatique

Le script s'exécute chaque jour ouvré et envoie un email :
`[PNM] Reporting sur les cas de refus avec motif RIO incorrect`

Destinataires : fwi_pnm_si + équipe fraude (linda.haustant, karine.bidoyet, audrey.dorwling-carter, teddy.moravie)

## Exécution manuelle

```bash
ssh porta_pnmv3@vmqproportawebdb01
cd /home/porta_pnmv3/Scripts/
./check_refus_porta_rio_incorrect.sh
```

## Requêtes détaillées

### Comptage refus porta entrante (R123)

```sql
SELECT count(*)
FROM PortaDB.DATA D, PortaDB.OPERATEUR O
WHERE D.operateur_origine = O.code
AND code_ticket = '1220'
AND source = 'in'
AND date(date_creation_ticket) = 'YYYY-MM-DD'
AND code_motif = 'R123';
```

### Détail par opérateur

```sql
SELECT upper(D.source), O.nom, count(*)
FROM PortaDB.DATA D, PortaDB.OPERATEUR O
WHERE D.operateur_origine = O.code
AND code_ticket = '1220'
AND source = 'in'
AND date(date_creation_ticket) = 'YYYY-MM-DD'
AND code_motif = 'R123'
GROUP BY source, operateur_origine;
```

### Identification des MSISDN provisoires concernés

```sql
SELECT PD.temporary_msisdn AS msisdn_provisoire, P.msisdn AS msisdn_a_porter
FROM PortaDB.PORTAGE_DATA PD
INNER JOIN PortaDB.PORTAGE P ON P.id = PD.portage_id
AND P.id_portage IN (
    SELECT D.id_portage
    FROM PortaDB.DATA D
    WHERE code_ticket = '1220' AND source = 'in'
    AND date(date_creation_ticket) = 'YYYY-MM-DD'
    AND code_motif = 'R123'
    GROUP BY D.id_portage
)
AND PD.temporary_msisdn IS NOT NULL;
```

## Interprétation

- Lundi : le script vérifie J-3 (couvre le week-end)
- Autres jours : le script vérifie J-1
- Si nb_refus élevé → alerter l'équipe fraude pour investigation
