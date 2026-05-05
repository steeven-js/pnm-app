# P10 — Verification Generation PNMDATA

**Categorie :** Portabilite
**Serveur :** vmqproportawebdb01 / vmqproportasync01
**Utilisateur :** porta_pnmv3
**Script :** PnmDataManager.sh (automatique)
**Declencheur :** Verification aux horaires de vacation (10H, 14H, 19H)

---

## Contexte

Le PnmDataManager généré les fichiers PNMDATA contenant les tickets de portabilité a transmettre aux autres opérateurs du GPMAG. Les fichiers sont generes a chaque vacation (10H, 14H, 19H) et déposés sur le sFTP inter-opérateurs.

Chaque fichier contient les tickets de portabilité (1110, 1210, 1410, 1430, etc.) a destination d'un opérateur spécifique.

## Horaires des vacations

| Vacation | Heure génération | Heure envoi sFTP | Heure check |
|----------|-----------------|-------------------|-------------|
| V1 | 10H00 | ~10H15 | 11H35 |
| V2 | 14H00 | ~14H15 | 15H35 |
| V3 | 19H00 | ~19H15 | 20H35 |

## Format des fichiers PNMDATA

```
PNMDATA.02.XX.YYYYMMDD.VN
```
- `02` : code Digicel (émetteur)
- `XX` : code opérateur destinataire (01, 03, 04, 05, 06)
- `YYYYMMDD` : date du jour
- `VN` : numéro de vacation (V1, V2, V3)

## Etapes

### 1. Consulter le log PnmDataManager

```bash
ssh porta_pnmv3@vmqproportawebdb01
tail -50 /home/porta_pnmv3/PortaSync/log/PnmDataManager.log
```

### 2. Verifier la génération par opérateur

Pour chaque opérateur (01, 03, 04, 05, 06), vérifier :
- `Generation du fichier PNMDATA.02.XX.YYYYMMDD.VN` avec le nombre de tickets
- `Fin de Traitement` sans erreur

Exemple de log normal :
```
[INFO] Generation du fichier PNMDATA.02.01.20260401.V1 : 3 tickets
[INFO] Generation du fichier PNMDATA.02.03.20260401.V1 : 1 ticket
[INFO] Generation du fichier PNMDATA.02.04.20260401.V1 : 0 tickets
[INFO] Generation du fichier PNMDATA.02.05.20260401.V1 : 0 tickets
[INFO] Generation du fichier PNMDATA.02.06.20260401.V1 : 2 tickets
[INFO] Fin de Traitement
```

> **Note :** 0 tickets pour un opérateur est normal si aucune portabilité n'est en cours avec cet opérateur.

### 3. Verifier les fichiers generes sur le serveur

Les fichiers PNMDATA sont stockes dans l'arborescence suivante sur vmqproportasync01 :

```
/home/porta_pnmv3/PortaSync/pnmdata/
├── 01/          (Orange Caraibe)
│   ├── send/        ← fichiers PNMDATA a envoyer
│   ├── recv/        ← fichiers PNMDATA reçus
│   ├── arch_send/   ← archives des fichiers envoyés
│   └── arch_recv/   ← archives des fichiers reçus
├── 02/          (Digicel — fichiers internes)
├── 03/          (SFR)
├── 04/          (Dauphin Telecom)
├── 05/          (UTS)
├── 06/          (Free Caraibes)
└── extract/     (extractions)
```

```bash
# Verifier les fichiers du jour envoyés a Orange (01)
ls -lrt /home/porta_pnmv3/PortaSync/pnmdata/01/send/

# Verifier les archives du jour
ls -lrt /home/porta_pnmv3/PortaSync/pnmdata/01/arch_send/ | tail -5

# Verifier les fichiers reçus d'Orange
ls -lrt /home/porta_pnmv3/PortaSync/pnmdata/01/recv/
```

### 4. Verifier les fichiers sur le sFTP inter-opérateurs

```bash
sftp pnm_02@193.251.160.208
ls -la /home/pnm_02/out/
```

Verifier que les fichiers PNMDATA du jour sont bien presents pour la vacation en cours.

### 4. En cas d'erreur de génération

Si le PnmDataManager n'a pas généré les fichiers :

1. Verifier le log pour identifier l'erreur :
   ```bash
   tail -100 /home/porta_pnmv3/PortaSync/log/PnmDataManager.log
   ```

2. Verifier la connexion a PortaDB :
   ```bash
   mysql -e "SELECT 1;"
   ```

3. Relancer manuellement si nécessaire :
   ```bash
   ssh porta_pnmv3@vmqproportasync01
   cd /home/porta_pnmv3/PortaSync/
   ./PnmDataManager.sh
   ```

4. Verifier le check_envoi_vacation pour confirmer que les fichiers ont ete envoyés sur le sFTP

## Regle de cutoff — Affectation des demandes aux vacations

Les demandes de portabilité reçues sont affectees a la prochaine vacation disponible :

| Heure de réception | Vacation | Jour |
|---|---|---|
| Avant 10H | V1 (10H) | Meme jour |
| 10H - 14H | V2 (14H) | Meme jour |
| 14H - 19H | V3 (19H) | Meme jour |
| **Apres 19H** | **V1 (10H)** | **Jour ouvre suivant** |

> Les demandes du week-end s'accumulent et sont traitees le lundi matin a 10H (V1).

## Notes opérationnelles

- Les fichiers PNMDATA sont generes **uniquement les jours ouvrés** (lundi-vendredi).
- Le PnmDataManager est planifié dans la crontab de vmqproportasync01 (voir pnm-crontab-scripts.md).
- Apres la génération, le script check_envoi_vacation vérifié que les fichiers ont bien ete envoyés sur le sFTP.
- Les jours fériés sont exclus via modification de la crontab (voir P17).
