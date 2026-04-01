# P12 — Export PortaDB vers CSV (MIS)

**Categorie :** Exploitation
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Declencheur :** Export quotidien automatique (crontab 00h00)

---

## Contexte

Export quotidien automatique de 16 tables PortaDB en CSV vers le serveur EMM pour le reporting MIS.

## Etapes

### 1. Execution automatique

Le script PortaDB-export-csv.sh s'execute tous les jours a 00h00 via crontab.

16 tables exportees : ACK, CODE_REPONSE, CODE_TICKET, DATA, DOSSIER, ETAT, FERRYDAY, FICHIER, MSISDN, MSISDN_HISTORIQUE, OPERATEUR, PORTAGE, PORTAGE_DATA, PORTAGE_HISTORIQUE, TRANCHE, TRANSITION.

### 2. Execution manuelle si necessaire

En cas d'echec, relancer manuellement.

```bash
ssh porta_pnmv3@vmqproportawebdb01
cd ~/scripts/
./PortaDB-export-csv.sh
```

### 3. Verifier sur le serveur EMM

Les fichiers CSV sont copies vers le serveur EMM.

```bash
ssh pnm@172.24.27.144
ls -lrth /mediation/DIGICEL/input/PORTA/
```
