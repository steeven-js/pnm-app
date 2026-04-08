# P20 — Gestion portabilite B2B vers Free

**Categorie :** Portabilite
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Script :** refus_porta_free_b2b.sh
**Declencheur :** Automatique

---

## Contexte

Les demandes de portabilite B2B (entreprise) vers Free Caraibe sont identifiees par un RIO commencant par `02E`. Ces demandes doivent etre bloquees automatiquement dans PortaDB (etat 15 → 17).

## Execution automatique

Le script detecte les nouvelles demandes et les bloque :

```bash
ssh porta_pnmv3@vmqproportawebdb01
cd /home/porta_pnmv3/Scripts/
./refus_porta_free_b2b.sh
```

Email envoye : `[PNM] Gestion des portabilites B2B vers Free Caraibe`
Destinataires : fwi_pnm_si + elisabeth.ozierlafontaine

## Logique du script

### Detection

```sql
SELECT msisdn FROM PortaDB.PORTAGE
WHERE id_portage IN (
    SELECT id_portage FROM PortaDB.DATA
    WHERE source = 'in'
    AND code_ticket IN ('1110','1120')
    AND operateur_origine = 6       -- Free
    AND rio LIKE '02E%'             -- RIO B2B Digicel
)
AND etat_id_actuel = 15             -- en attente
AND date_fin IS NULL;
```

### Blocage

```sql
UPDATE PortaDB.PORTAGE SET etat_id_actuel = 17
WHERE id_portage IN (...)
AND etat_id_actuel = 15
AND date_fin IS NULL;
COMMIT;
```

## Interpretation

- `rio LIKE '02E%'` : les RIO commencant par 02E sont des lignes B2B Digicel
- `etat_id_actuel = 15` : portage en attente de traitement
- `etat_id_actuel = 17` : portage bloque
- `operateur_origine = 6` : Free Caraibes
