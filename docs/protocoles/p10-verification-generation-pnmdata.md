# P10 — Verification Generation PNMDATA

**Categorie :** Portabilite
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Declencheur :** Verification aux horaires de vacation (10h, 14h, 19h)

---

## Contexte

Verifier la generation des fichiers PNMDATA pour chaque vacation.

## Etapes

### 1. Consulter le log PnmDataManager

Le PnmDataManager genere les fichiers PNMDATA aux horaires de vacation (10h, 14h, 19h).

```bash
ssh porta_pnmv3@vmqproportawebdb01
tail -50 /home/porta_pnmv3/PortaSync/log/PnmDataManager.log
```

### 2. Verifier la generation par operateur

Pour chaque operateur (01, 03, 04, 05, 06), verifier :
- "Generation du fichier PNMDATA.02.XX..." avec le nombre de tickets
- "Fin de Traitement" sans erreur

### 3. Verifier les fichiers sur le sFTP

Les fichiers sont deposes sur le sFTP inter-operateurs.

```bash
sftp pnm_02@193.251.160.208
ls -la /home/pnm_02/out/
```
