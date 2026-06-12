# P47 — Simulation d'une portabilité entrante externe en INT (Orange → Wizzee)

**Catégorie :** Portabilité / Tests
**Environnement :** INT (PortaWebUi intégration — ne jamais dérouler en production)
**Rôles :** Digicel/Wizzee = OPR (02), Orange Caraïbe = OPD (01)
**Suivi :** [Tâche Asana](https://app.asana.com/1/47891937635079/project/1215516595243835/task/1215516595577185?focus=true)
**Créé le :** 12/06/2026

---

## Contexte

Tester en intégration le flux complet d'une portabilité entrante externe vers Wizzee : un abonné Orange porte son numéro chez Wizzee. Orange n'étant pas raccordé à l'environnement INT, **on joue le côté Orange à la main** : la demande (1110) est saisie normalement dans PortaWebUi INT, puis la réponse d'acceptation d'Orange (1210) est fabriquée et injectée manuellement (même principe que le mode dégradé P37/P21, mais en entrée).

## Principe — machine à états attendue

```
[Saisi] ──1110──> [En cours] ──1210 simulé──> [Accepté] ──1410──> [Diffusé]
                                                            ──bascule 9h──> [Basculé] ──1430──> [Confirmé/Clôturé]
```

Seul le **1210 est simulé**. Une fois le portage en état *Accepté*, la chaîne Porta (1410, bascule, 1430) se déroule d'elle-même côté Digicel/Wizzee.

---

## Étape 1 — Choisir un MSISDN Orange (tranche attributaire = 01)

Le MSISDN doit appartenir à une **tranche Orange** (OPA = 01) et ne pas être déjà connu de la table `MSISDN` (jamais porté, donc toujours réputé Orange).

```sql
-- Tranches Orange actives
SELECT id, debut, fin
FROM TRANCHE
WHERE operateur_id = 1 AND is_active = 1
ORDER BY debut;

-- Vérifier qu'un candidat pris dans une tranche est inconnu de PortaDB
SELECT * FROM MSISDN WHERE msisdn = '069XXXXXXX';
-- (aucune ligne = OK ; si une ligne existe, vérifier operateur_id_actuel = 1 et portage_id_actuel IS NULL)
```

> Contrôle croisé possible avec P14 (vérification appartenance numéro).

## Étape 2 — Générer le faux RIO Orange

Structure : `OOTRRRRRRCCC` → `01` (Orange) + `P` (particulier) + 6 caractères de référence client + 3 caractères de contrôle.

La référence client (6 caractères) est **arbitraire** : c'est le numéro de dossier interne Orange, que seul Orange pourrait vérifier. En INT, seuls le **format** et la **clé CCC** doivent être cohérents avec le MSISDN.

### Algorithme CCC (validé contre `RIO - tool_v3 For 2025.xlsx`)

- Chaîne d'entrée (19 caractères) : `CodeOp(2) + Type(1) + Ref(6) + MSISDN(10)`
- Table de conversion : `A=0 … Z=25, 0=26 … 9=35, +=36`
- Init `R1=R2=R3=0`, puis pour chaque caractère (valeur X) :
  `R1=(X+R1) mod 37`, `R2=(X+2·R2) mod 37`, `R3=(X+4·R3) mod 37`
- CCC = reconversion de R1, R2, R3 en caractères.

```python
ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+"  # A=0..Z=25, 0=26..9=35, +=36

def rio(op, typ, ref6, msisdn10):
    s = f"{op}{typ}{ref6}{msisdn10}".upper()
    assert len(s) == 19
    r1 = r2 = r3 = 0
    for ch in s:
        x = ALPHA.index(ch)
        r1, r2, r3 = (x + r1) % 37, (x + 2*r2) % 37, (x + 4*r3) % 37
    return f"{op}{typ}{ref6}{ALPHA[r1]}{ALPHA[r2]}{ALPHA[r3]}"

# Exemple de contrôle (outil Excel) : rio("02","P","131780","0696100152") == "02P131780R0W"
```

> Le validateur de format est aussi disponible dans pnm-app (*Outils → RioValidator*), et l'outil Excel de référence est `OneDrive\Documents\Porta_Steeven\RIO\RIO - tool_v3 For 2025.xlsx`.

## Étape 3 — Saisir la demande (1110) dans PortaWebUi INT

1. PortaWebUi INT → création portage entrant particulier (`CreatePortaParticulier`).
2. Renseigner : MSISDN Orange (étape 1), RIO généré (étape 2), date de portage souhaitée (J+2 ouvrés min).
3. Vérifier en base INT : portage créé, état **En cours (3)**, et noter l'**`id_portage`** (MD5) :

```sql
SELECT P.id_portage, P.etat_id_actuel, P.date_portage, D.msisdn
FROM PORTAGE P JOIN DATA D ON P.id_portage = D.id_portage
WHERE D.msisdn = '069XXXXXXX';
```

4. Le 1110 part dans le fichier `PNMDATA.02.01.<horodatage>.<seq>` à la vacation suivante (10H/14H/19H). En INT, il n'est lu par personne — c'est normal.

## Étape 4 — Simuler le 1210 d'Orange

Fabriquer un fichier **`PNMDATA.01.02.AAAAMMJJHHMMSS.ZZZ`** (émetteur 01 → destinataire 02) contenant :

| Ligne | Contenu |
|-------|---------|
| Header | `0123456789` + nom-fichier + émetteur `01` + date-début (AAAAMMJJHHMMSS) |
| Ticket 1210 | voir champs ci-dessous |
| Footer | `9876543210` + émetteur `01` + date-fin + nombre-de-lignes `000001` |

Champs du ticket 1210 (RP Accept, OPD → OPR) :

| Champ | Valeur |
|-------|--------|
| code-ticket | `1210` |
| opérateur-origine / destination | `01` / `02` |
| OPR / OPD | `02` / `01` |
| date-souscription | celle du 1110 |
| msisdn | MSISDN Orange du test |
| **id-portage** | **le même MD5 que le 1110** (étape 3 — sinon le ticket ne raccroche pas au portage) |
| numéro-de-ligne | séquentiel |
| code-acceptation-ou-refus | `A001` (demande éligible) |
| date-création-ticket | horodatage du fichier |

> Le générateur **pnm-app → Outils → PnmDataGenerator** construit ce fichier (header/footer, MD5 id-portage selon Annexe 4).

**Injection :** déposer le fichier dans le répertoire de réception PortaSync INT (équivalent INT de `PortaSync/pnmdata/01/`), puis lancer le traitement de réception (PnmDataManager) ou attendre la vacation.

**Pièges connus :**
- **E008 « fichier déjà reçu »** : la dédup se fait sur émetteur + date du header (pas la séquence). Changer l'horodatage si on réinjecte (cf. mémo Ack dégradé PNM).
- Séquence `ZZZ` : doit être cohérente avec la table `FICHIER` INT pour l'émetteur 01.
- Pour tester un **refus**, même fichier avec `code-ticket 1220` et `code-acceptation-ou-refus = Rnnn` (ex. `R123` RIO incorrect) → état attendu *Refusé*.

## Étape 5 — Vérifications

1. Après ingestion du 1210 : portage en état **Accepté** ; `PNMDATA` contient le ticket 1210 rattaché à l'`id_portage`.
2. Vacation suivante : génération du **1410** (`PNMDATA.02.00...`, diffusion à tous) → état *Diffusé*.
3. Bascule 9H le jour J : état *Basculé* — vérifier les actions provisioning côté Wizzee/CRM (ChangeMsisdn, NotifyPortage(ACCEPTE), FNR si câblé en INT).
4. Clôture sur réception des 1430 (à simuler de la même façon que le 1210 si le test doit aller jusqu'à *Clôturé*).

```sql
-- Suivi de l'état
SELECT P.id_portage, E.nom AS etat, P.date_portage
FROM PORTAGE P JOIN ETAT E ON P.etat_id_actuel = E.id
WHERE P.id_portage = '<MD5>';
```

## Références

- `docs/pnm/pnm-porta-body.md` — structures fichiers/tickets, diagrammes d'état (§4.1 entrante)
- `docs/reglementaire/annexes-inter-operateurs.md` — codes A/R/E, Annexe 4 (id-portage MD5)
- P37 / P21 — création manuelle de PNMDATA (mode dégradé), P22 — 1210 en attente, P14 — appartenance numéro
- [Tâche Asana de suivi](https://app.asana.com/1/47891937635079/project/1215516595243835/task/1215516595577185?focus=true)
