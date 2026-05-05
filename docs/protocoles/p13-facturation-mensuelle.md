# P13 — Facturation mensuelle PEN / PSO

**Categorie :** Facturation
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Scripts :** Pnm_Facturation_Mensuelle_PEN.sh / Pnm_Facturation_Mensuelle_PSO.sh
**Declencheur :** Execution mensuelle automatique (crontab)

---

## Contexte

Generation automatique des rapports de facturation mensuels pour les portabilités :
- **PEN** (Portabilite Entrante) : numéros portes VERS Digicel — ticket 1410
- **PSO** (Portabilite Sortante) : numéros portes DEPUIS Digicel — ticket 1210

Ces rapports sont envoyés a l'equipe comptabilite pour la facturation inter-opérateurs.

## Destinataires

Les emails sont envoyés a :
- fwi_pnm_si (equipe PNM)
- Comptabilite Digicel

## Contenu du rapport

Le rapport ventile les portabilités par opérateur :

| Operateur | Code |
|-----------|------|
| OC | Orange Caraibe |
| SFRC | SFR Caraibe |
| DT | Dauphin Telecom |
| UTS | UTS Caraibe |
| FREEC | Free Caraibes |

Pour chaque opérateur :
- Type de mandat : **simple** (1 numéro) ou **multiple** (plusieurs numéros sur un meme mandat)
- ID portage
- Date mandat / transaction
- Nombre de lignes
- Premier numéro eligible

### Distinction mandats simples / multiples

```sql
-- Mandats simples : id_portage = id_portage_multiple
-- Mandats multiples : id_portage != id_portage_multiple
```

Les mandats multiples sont comptes une seule fois par `id_portage_multiple` (et non par numéro individuel).

## Execution automatique

Les scripts s'executent mensuellement via crontab sur vmqproportawebdb01.

## Execution manuelle

Si le rapport n'a pas ete envoyé, relancer manuellement :

```bash
ssh porta_pnmv3@vmqproportawebdb01
cd /home/porta_pnmv3/Scripts/
./Pnm_Facturation_Mensuelle_PEN.sh
./Pnm_Facturation_Mensuelle_PSO.sh
```

## Notes opérationnelles

- Verifier en début de mois que les rapports du mois precedent ont bien ete envoyés.
- Les rapports sont en format XLS envoyés en piece jointe de l'email.
- Pour le bilan annuel, voir protocole P30 (Facturation annuelle PEN).
