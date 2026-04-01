# P13 — Facturation mensuelle PEN / PSO

**Categorie :** Facturation
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Scripts :** Pnm_Facturation_Mensuelle_PEN.sh / Pnm_Facturation_Mensuelle_PSO.sh
**Declencheur :** Execution mensuelle automatique (crontab)

---

## Contexte

Generation automatique des rapports de facturation mensuels pour les portabilites :
- **PEN** (Portabilite Entrante) : numeros portes VERS Digicel — ticket 1410
- **PSO** (Portabilite Sortante) : numeros portes DEPUIS Digicel — ticket 1210

Ces rapports sont envoyes a l'equipe comptabilite pour la facturation inter-operateurs.

## Destinataires

Les emails sont envoyes a :
- fwi_pnm_si (equipe PNM)
- Comptabilite Digicel

## Contenu du rapport

Le rapport ventile les portabilites par operateur :

| Operateur | Code |
|-----------|------|
| OC | Orange Caraibe |
| SFRC | SFR Caraibe |
| DT | Dauphin Telecom |
| UTS | UTS Caraibe |
| FREEC | Free Caraibes |

Pour chaque operateur :
- Type de mandat : **simple** (1 numero) ou **multiple** (plusieurs numeros sur un meme mandat)
- ID portage
- Date mandat / transaction
- Nombre de lignes
- Premier numero eligible

### Distinction mandats simples / multiples

```sql
-- Mandats simples : id_portage = id_portage_multiple
-- Mandats multiples : id_portage != id_portage_multiple
```

Les mandats multiples sont comptes une seule fois par `id_portage_multiple` (et non par numero individuel).

## Execution automatique

Les scripts s'executent mensuellement via crontab sur vmqproportawebdb01.

## Execution manuelle

Si le rapport n'a pas ete envoye, relancer manuellement :

```bash
ssh porta_pnmv3@vmqproportawebdb01
cd ~/scripts/
./Pnm_Facturation_Mensuelle_PEN.sh
./Pnm_Facturation_Mensuelle_PSO.sh
```

## Notes operationnelles

- Verifier en debut de mois que les rapports du mois precedent ont bien ete envoyes.
- Les rapports sont en format XLS envoyes en piece jointe de l'email.
- Pour le bilan annuel, voir protocole P30 (Facturation annuelle PEN).
