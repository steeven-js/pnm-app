# P20 — Gestion portabilité B2B vers Free

**Catégorie :** Portabilité
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Script :** refus_porta_free_b2b.sh
**Déclencheur :** Automatique

---

## Contexte

Les demandes de portabilité B2B (entreprise) vers Free Caraïbe sont identifiées par un RIO commençant par `02E`. Ces demandes doivent être bloquées automatiquement dans PortaDB (état 15 → 17).

## Exécution automatique

Le script détecte les nouvelles demandes et les bloque :

```bash
ssh porta_pnmv3@vmqproportawebdb01
cd /home/porta_pnmv3/Scripts/
./refus_porta_free_b2b.sh
```

Email envoyé : `[PNM] Gestion des portabilités B2B vers Free Caraibe`
Destinataires : fwi_pnm_si + elisabeth.ozierlafontaine

## Logique du script

### Détection

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

## Interprétation

- `rio LIKE '02E%'` : les RIO commençant par 02E sont des lignes B2B Digicel
- `etat_id_actuel = 15` : portage en attente de traitement
- `etat_id_actuel = 17` : portage bloqué
- `operateur_origine = 6` : Free Caraïbes
