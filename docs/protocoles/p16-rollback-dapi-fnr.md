# P16 — Rollback DAPI suite Traitement FNR/EMA/EMM KO

**Categorie :** Debug / Diagnostic
**Serveur :** vmqproportaweb01 (DAPI), vmqproportawebdb01, digimqema01 (EMA)
**Utilisateur :** porta_pnmv3 / oracle
**Declencheur :** Echec du traitement FNR ou bascule EMA/EMM KO

---

## Contexte

Apres la bascule quotidienne (9H00), trois traitements s'executent :
- **EmaExtracter** : bascule dans MOBI + generation fichier FNR
- **fnr_action_v3.bh** : commandes NPSUB envoyees sur EMA pour mise a jour du routage
- **EmmExtracter** : envoi fichier MSISDN portes vers EMM

Si l'un de ces traitements echoue, le routage reseau est desynchronise avec PortaDB. Un rollback est necessaire.

## Etapes

### 1. Identifier le probleme

Verifier les emails de bascule :
- `[PNMV3] Verification Bascule Porta MOBI` — KO ou incomplet ?
- `[PNM] Presence batchhandler FNR_V3 sur EMA` — fichier absent ou % KO eleve ?

### 2. Verifier le log EmaExtracter

```bash
ssh porta_pnmv3@vmqproportasync01
tail -100 /home/porta_pnmv3/PortaSync/log/EmaExtracter.log
```

Chercher :
- `Fin de traitement` present ? Si non, le script a plante
- Nombre d'operateurs traites (doit etre 5 : OC, SFR, DT, UTS, FREE)

### 3. Verifier le fichier FNR sur EMA

```bash
ssh batchusr@digimqema01
find /global/var/sog/BatchHandler/Users/batchusr/BatchJob -name 'fnr_action_v3.bh' -type f -mtime 0
```

Si le fichier est absent : EmaExtracter n'a pas genere le FNR.

### 4. Verifier le log FNR

```bash
ssh batchusr@digimqema01
find /global/var/sog/BatchHandler/Users/batchusr/LogFiles -name '*fnr_action_v3.bh.log' -type f -mtime 0
```

Verifier le pourcentage de commandes OK dans le log :
- > 50% : acceptable
- < 50% : probleme majeur, verifier le fichier .nok

### 5. Si FNR KO — Rollback

**Option A : Relancer le traitement FNR**

Regenerer le fichier fnr_action_v3.bh et le renvoyer sur EMA :

```bash
ssh porta_pnmv3@vmqproportasync01
cd /home/porta_pnmv3/PortaSync/
# Relancer EmaExtracter manuellement
./EmaExtracter.sh
```

**Option B : Correction manuelle via DAPI**

Pour des numeros specifiques, utiliser les interfaces FNR :
- Interroger : http://172.24.2.21/apis/porta/fnr-get-info.html
- Creer : http://172.24.2.21/apis/porta/fnr-create.php
- Modifier : http://172.24.2.21/apis/porta/fnr-update.php
- Supprimer : http://172.24.2.21/apis/porta/fnr-delete.html

### 6. Verifier la coherence PortaDB / FNR

Apres correction, verifier que les numeros bascules sont coherents :

```bash
# Dans PortaDB
mysql -e "SELECT msisdn, operateur_id_actuel FROM PortaDB.MSISDN WHERE msisdn = '069XXXXXXX';"
```

Puis interroger le FNR pour le meme numero et comparer.

### 7. Alerter si necessaire

Si le probleme est systemique (plusieurs numeros KO), alerter fwi_pnm_si et escalader.
