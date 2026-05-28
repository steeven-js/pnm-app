# P13 — Facturation mensuelle PEN / PSO

**Catégorie :** Facturation
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Scripts :** Pnm_Facturation_Mensuelle_PEN.sh / Pnm_Facturation_Mensuelle_PSO.sh
**Déclencheur :** Exécution mensuelle automatique (crontab)

---

## Contexte

Génération automatique des rapports de facturation mensuels pour les portabilités :
- **PEN** (Portabilité Entrante) : numéros portés VERS Digicel — ticket 1410
- **PSO** (Portabilité Sortante) : numéros portés DEPUIS Digicel — ticket 1210

Ces rapports sont envoyés à l'équipe comptabilité pour la facturation inter-opérateurs.

## Destinataires

Les emails sont envoyés à :
- fwi_pnm_si (équipe PNM)
- Comptabilité Digicel

## Contenu du rapport

Le rapport ventile les portabilités par opérateur :

| Opérateur | Code |
|-----------|------|
| OC | Orange Caraibe |
| SFRC | SFR Caraibe |
| DT | Dauphin Telecom |
| UTS | UTS Caraibe |
| FREEC | Free Caraibes |

Pour chaque opérateur :
- Type de mandat : **simple** (1 numéro) ou **multiple** (plusieurs numéros sur un même mandat)
- ID portage
- Date mandat / transaction
- Nombre de lignes
- Premier numéro éligible

### Distinction mandats simples / multiples

```sql
-- Mandats simples : id_portage = id_portage_multiple
-- Mandats multiples : id_portage != id_portage_multiple
```

Les mandats multiples sont comptés une seule fois par `id_portage_multiple` (et non par numéro individuel).

## Exécution automatique

Les scripts s'exécutent mensuellement via crontab sur vmqproportawebdb01.

## Exécution manuelle

Si le rapport n'a pas été envoyé, relancer manuellement :

```bash
ssh porta_pnmv3@vmqproportawebdb01
cd /home/porta_pnmv3/Scripts/
./Pnm_Facturation_Mensuelle_PEN.sh
./Pnm_Facturation_Mensuelle_PSO.sh
```

## Notes opérationnelles

- Vérifier en début de mois que les rapports du mois précédent ont bien été envoyés.
- Les rapports sont en format XLS envoyés en pièce jointe de l'email.
- Pour le bilan annuel, voir protocole P30 (Facturation annuelle PEN).
