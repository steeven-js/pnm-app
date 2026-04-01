# P30 — Facturation annuelle PEN

**Categorie :** Facturation
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Script :** Pnm_Facturation_Annuelle_PEN.sh
**Planification :** Annuel

---

## Contexte

Bilan annuel des portabilites entrantes (PEN) facturees a Digicel, ventile par operateur donneur. Utilise pour le reporting financier de la portabilite.

## Email

`[PNMV3] Facturation PEN globale sur l'annee YYYY` → fwi_pnm_si

## Requete

```sql
SELECT OPERATEUR_DONNEUR, SUM(NOMBRE) AS NOMBRE FROM (
    -- Mandats simples
    SELECT CASE OPD
        WHEN 1 THEN 'OC' WHEN 3 THEN 'SFRC'
        WHEN 4 THEN 'DT' WHEN 5 THEN 'UTS'
        WHEN 6 THEN 'FREEC'
    END AS OPERATEUR_DONNEUR,
    COUNT(DISTINCT(id_portage)) AS NOMBRE
    FROM DATA
    WHERE code_ticket = '1410'        -- ticket portage effectif
    AND OPD IN (1,3,4,5,6)
    AND OPR = 2                        -- Digicel est receveur
    AND DATE(date_creation_ticket) BETWEEN
        SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 YEAR) AND CURRENT_DATE
    AND id_portage = id_portage_multiple
    GROUP BY OPD

    UNION

    -- Mandats multiples
    SELECT CASE OPD
        WHEN 1 THEN 'OC' WHEN 3 THEN 'SFRC'
        WHEN 4 THEN 'DT' WHEN 5 THEN 'UTS'
        WHEN 6 THEN 'FREEC'
    END AS OPERATEUR_DONNEUR,
    COUNT(DISTINCT(id_portage_multiple)) AS NOMBRE
    FROM DATA
    WHERE code_ticket = '1410'
    AND OPD IN (1,3,4,5,6) AND OPR = 2
    AND DATE(date_creation_ticket) BETWEEN
        SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 YEAR) AND CURRENT_DATE
    AND id_portage != id_portage_multiple
    GROUP BY OPD
) t
GROUP BY OPERATEUR_DONNEUR
ORDER BY NOMBRE DESC;
```

## Execution manuelle

```bash
ssh porta_pnmv3@vmqproportawebdb01
cd ~/scripts/
./Pnm_Facturation_Annuelle_PEN.sh
```
