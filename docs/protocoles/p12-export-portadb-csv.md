# P12 — Export PortaDB vers CSV (MIS)

**Catégorie :** Exploitation
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Script :** PortaDB-export-csv.sh
**Déclencheur :** Export quotidien automatique (crontab 00H00)

---

## Contexte

Export quotidien automatique de 16 tables PortaDB en CSV vers le serveur EMM pour le reporting MIS (Management Information System). Cet export alimente les tableaux de bord de suivi de la portabilité.

## Tables exportées (16)

| Table | Description |
|-------|-------------|
| ACK | Acquittements fichiers PNMDATA |
| CODE_REPONSE | Codes réponse (acceptation, refus, annulation) |
| CODE_TICKET | Types de tickets (1110, 1210, 1410, etc.) |
| DATA | Données des tickets de portabilité |
| DOSSIER | Dossiers de portage |
| ETAT | États des portages (machine à états) |
| FERRYDAY | Jours fériés (exclusion crontab) |
| FICHIER | Fichiers PNMDATA/PNMSYNC échangés |
| MSISDN | Numéros et opérateur actuel |
| MSISDN_HISTORIQUE | Historique des changements d'opérateur |
| OPERATEUR | Opérateurs du GPMAG (6 opérateurs) |
| PORTAGE | Portages en cours et terminés |
| PORTAGE_DATA | Données détaillées des portages |
| PORTAGE_HISTORIQUE | Historique des portages |
| TRANCHE | Tranches de numéros par opérateur |
| TRANSITION | Transitions d'état possibles |

## Exécution automatique

Le script s'exécute tous les jours à 00H00 via crontab sur vmqproportawebdb01.

## Exécution manuelle

En cas d'échec du cron, relancer manuellement :

```bash
ssh porta_pnmv3@vmqproportawebdb01
cd /home/porta_pnmv3/Scripts/
./PortaDB-export-csv.sh
```

## Vérification sur le serveur EMM

Les fichiers CSV sont copiés vers le serveur EMM (mediation) :

```bash
ssh pnm@172.24.27.144
ls -lrth /mediation/DIGICEL/input/PORTA/
```

Vérifier :
- Les 16 fichiers CSV sont présents
- Les dates de modification correspondent au jour courant
- Les tailles de fichier sont cohérentes (pas de fichier vide)

## Notes opérationnelles

- L'export est **quotidien** (y compris week-end et jours fériés).
- Les fichiers CSV sont écrasés chaque jour (pas d'historique cumulé sur EMM).
- Si le serveur EMM est inaccessible, l'export est perdu pour la journée — relancer manuellement après rétablissement.
