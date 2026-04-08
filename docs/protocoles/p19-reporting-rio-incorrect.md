# P19 — Reporting RIO incorrect (Refus R123)

**Categorie :** Debug / Diagnostic
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Script :** check_refus_porta_rio_incorrect.sh
**Declencheur :** Automatique (jours ouvres) + suspicion de fraude

---

## Contexte

Le code motif R123 = "RIO incorrect". Un nombre eleve de refus R123 peut indiquer une tentative de fraude en masse (portabilite avec des RIO falsifies).

## Execution automatique

Le script s'execute chaque jour ouvre et envoie un email :
`[PNM] Reporting sur les cas de refus avec motif RIO incorrect`

Destinataires : fwi_pnm_si + equipe fraude (linda.haustant, karine.bidoyet, audrey.dorwling-carter, teddy.moravie)

## Execution manuelle

```bash
ssh porta_pnmv3@vmqproportawebdb01
cd /home/porta_pnmv3/Scripts/
./check_refus_porta_rio_incorrect.sh
```

## Requetes detaillees

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

### Detail par operateur

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

### Identification des MSISDN provisoires concernes

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

## Interpretation

- Lundi : le script verifie J-3 (couvre le week-end)
- Autres jours : le script verifie J-1
- Si nb_refus eleve → alerter l'equipe fraude pour investigation
