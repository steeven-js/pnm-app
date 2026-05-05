# P09 — Verification Acquittements PNMDATA

**Categorie :** Portabilite
**Serveur :** vmqproportasync01
**Utilisateur :** porta_pnmv3
**Script :** PnmDataAckGenerator.sh (automatique)
**Declencheur :** Verification après chaque vacation (11H15, 15H15, 20H15)

---

## Contexte

Apres chaque vacation (10H, 14H, 19H), Digicel généré des fichiers PNMDATA contenant les tickets de portabilité a transmettre aux autres opérateurs. Les opérateurs doivent ensuite envoyer un **fichier d'acquittement** (.ACR) confirmant la bonne réception du fichier PNMDATA.

Le script `PnmDataAckGenerator.sh` vérifié automatiquement la presence de ces acquittements a 11H15, 15H15 et 20H15 (soit environ 1H15 après chaque vacation).

## Operateurs a vérifier

| Code | Operateur | Fichier attendu |
|------|-----------|-----------------|
| 01 | Orange Caraibe | PNMDATA.02.01.YYYYMMDD.VX.ACR |
| 03 | Outremer Telecom / SFR | PNMDATA.02.03.YYYYMMDD.VX.ACR |
| 04 | Dauphin Telecom | PNMDATA.02.04.YYYYMMDD.VX.ACR |
| 05 | UTS Caraibe | PNMDATA.02.05.YYYYMMDD.VX.ACR |
| 06 | Free Caraibes | PNMDATA.02.06.YYYYMMDD.VX.ACR |

(VX = numéro de vacation : V1, V2, V3)

## Etapes

### 1. Consulter le log PnmAckManager

```bash
ssh porta_pnmv3@vmqproportasync01
tail -50 /home/porta_pnmv3/PortaSync/log/PnmAckManager.log
```

### 2. Verifier chaque opérateur

Chaque opérateur doit afficher `Check success` dans le log :

```
[INFO] Operateur 01 (Orange Caraibe) : Check success
[INFO] Operateur 03 (SFR/OMT)        : Check success
[INFO] Operateur 04 (Dauphin Telecom) : Check success
[INFO] Operateur 05 (UTS Caraibe)     : Check success
[INFO] Operateur 06 (Free Caraibes)   : Check success
[INFO] Fin de Traitement
```

La mention "Fin de Traitement" doit etre presente a la fin.

### 3. En cas de NOT FOUND

Si un fichier ACR n'est pas trouve :

1. **Verifier sur le serveur** que le fichier .ACR a ete reçu :
   ```bash
   # Fichiers reçus de Orange (01)
   ls -lrt /home/porta_pnmv3/PortaSync/pnmdata/01/recv/
   # Fichiers reçus de SFR (03)
   ls -lrt /home/porta_pnmv3/PortaSync/pnmdata/03/recv/
   # etc. pour 04, 05, 06
   ```

   Ou vérifier directement sur le sFTP :
   ```bash
   sftp pnm_02@193.251.160.208
   ls -la /home/pnm_02/in/
   ```

2. **Verifier les erreurs** dans le log PnmAckManager

3. **Relancer manuellement** si le fichier est present sur le sFTP mais n'a pas ete traite :
   ```bash
   ssh porta_pnmv3@vmqproportasync01
   cd /home/porta_pnmv3/PortaSync/
   # Relancer le check d'acquittement
   ```

4. **Contacter l'opérateur** si le fichier .ACR n'a pas ete déposé :
   - Orange : oag.pnm-si@orange.com
   - SFR : pnm@outremer-telecom.fr
   - Dauphin : latifa.annachachibi@dauphintelecom.com
   - UTS : uts-french-portability@cwc.com
   - Free : (contacter via GPMAG)

### 4. Fichiers .ERR

Si un fichier .ERR est present sur le sFTP au lieu d'un .ACR, cela signifie que l'opérateur a rejete le fichier PNMDATA. Analyser le contenu du .ERR pour identifier le code erreur (voir docs/reglementaire/annexes-inter-opérateurs.md pour les codes E000-E999).

## Notes opérationnelles

- Les acquittements sont verifies 3 fois par jour (après chaque vacation).
- Dauphin Telecom est l'opérateur le plus susceptible d'avoir des retards d'acquittement.
- Si un opérateur ne repond pas après 2 vacations, escalader vers fwi_pnm_si.
