# P12 — Export PortaDB vers CSV (MIS)

**Categorie :** Exploitation
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Script :** PortaDB-export-csv.sh
**Declencheur :** Export quotidien automatique (crontab 00H00)

---

## Contexte

Export quotidien automatique de 16 tables PortaDB en CSV vers le serveur EMM pour le reporting MIS (Management Information System). Cet export alimente les tableaux de bord de suivi de la portabilite.

## Tables exportees (16)

| Table | Description |
|-------|-------------|
| ACK | Acquittements fichiers PNMDATA |
| CODE_REPONSE | Codes reponse (acceptation, refus, annulation) |
| CODE_TICKET | Types de tickets (1110, 1210, 1410, etc.) |
| DATA | Donnees des tickets de portabilite |
| DOSSIER | Dossiers de portage |
| ETAT | Etats des portages (machine a etats) |
| FERRYDAY | Jours feries (exclusion crontab) |
| FICHIER | Fichiers PNMDATA/PNMSYNC echanges |
| MSISDN | Numeros et operateur actuel |
| MSISDN_HISTORIQUE | Historique des changements d'operateur |
| OPERATEUR | Operateurs du GPMAG (6 operateurs) |
| PORTAGE | Portages en cours et termines |
| PORTAGE_DATA | Donnees detaillees des portages |
| PORTAGE_HISTORIQUE | Historique des portages |
| TRANCHE | Tranches de numeros par operateur |
| TRANSITION | Transitions d'etat possibles |

## Execution automatique

Le script s'execute tous les jours a 00H00 via crontab sur vmqproportawebdb01.

## Execution manuelle

En cas d'echec du cron, relancer manuellement :

```bash
ssh porta_pnmv3@vmqproportawebdb01
cd ~/scripts/
./PortaDB-export-csv.sh
```

## Verification sur le serveur EMM

Les fichiers CSV sont copies vers le serveur EMM (mediation) :

```bash
ssh pnm@172.24.27.144
ls -lrth /mediation/DIGICEL/input/PORTA/
```

Verifier :
- Les 16 fichiers CSV sont presents
- Les dates de modification correspondent au jour courant
- Les tailles de fichier sont coherentes (pas de fichier vide)

## Notes operationnelles

- L'export est **quotidien** (y compris week-end et jours feries).
- Les fichiers CSV sont ecrases chaque jour (pas d'historique cumule sur EMM).
- Si le serveur EMM est inaccessible, l'export est perdu pour la journee — relancer manuellement apres retablissement.
