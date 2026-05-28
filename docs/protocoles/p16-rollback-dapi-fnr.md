# P16 — Rollback DAPI suite Traitement FNR/EMA/EMM KO

**Catégorie :** Debug / Diagnostic
**Serveur :** vmqproportaweb01 (DAPI), vmqproportasync01, vmqproportawebdb01, digimqema01 (EMA)
**Utilisateur :** porta_pnmv3 / oracle / batchusr
**Déclencheur :** Échec du traitement FNR ou bascule EMA/EMM KO

---

## Contexte

Après la bascule quotidienne (9H00), trois traitements s'exécutent en séquence :

| Ordre | Traitement | Serveur | Rôle |
|-------|-----------|---------|------|
| 1 | **EmaExtracter** | vmqproportasync01 | Bascule dans MOBI + génération fichier FNR |
| 2 | **fnr_action_v3.bh** | digimqema01 (EMA) | Commandes NPSUB pour mise à jour du routage réseau |
| 3 | **EmmExtracter** | vmqproportasync01 | Envoi fichier MSISDN portés vers EMM |

Si l'un de ces traitements échoue, le routage réseau est désynchronisé avec PortaDB. Les numéros portés peuvent devenir injoignables. Un rollback est nécessaire.

## Identification du problème

### Emails à vérifier

| Email | Problème si... |
|-------|----------------|
| `[PNMV3] Verification Bascule Porta MOBI` | KO, incomplet, ou absent |
| `[PNM] Presence batchhandler FNR_V3 sur EMA` | Fichier absent ou % KO élevé |

## Étapes

### 1. Vérifier le log EmaExtracter

```bash
ssh porta_pnmv3@vmqproportasync01
tail -100 /home/porta_pnmv3/PortaSync/log/EmaExtracter.log
```

Chercher :
- `Fin de traitement` présent ? Si non, le script a planté
- Nombre d'opérateurs traités (doit être 5 : OC, SFR, DT, UTS, FREE)
- Erreurs spécifiques dans le log

### 2. Vérifier le fichier FNR sur EMA

```bash
ssh batchuser@EMA15-Digicel
ls -la /var/sog/BatchHandler/Users/batchuser/BatchJob/fnr_action_v3.bh
```

Si le fichier est absent = déjà traité et supprimé (normal), ou pas encore généré. Vérifier le log à l'étape 3.

### 3. Vérifier le log FNR

```bash
ls -lrt /var/sog/BatchHandler/Users/batchuser/LogFiles/*fnr_action* | tail -5
```

Vérifier le pourcentage de commandes OK :
- **> 50%** : acceptable, vérifier les quelques KO individuellement
- **< 50%** : problème majeur, analyser le fichier .nok

### 4. Analyser les commandes KO

Si un fichier `.nok` existe, il contient les commandes NPSUB qui ont échoué :

```bash
ssh batchuser@EMA15-Digicel
ls -lrt /var/sog/BatchHandler/Users/batchuser/LogFiles/*fnr_action*.nok | tail -5

# Copier-coller le nom du fichier .nok dans la commande :
cat XXXX-XX-XX_XX.XX.XX_fnr_action_v3.bh.nok
```

Chaque ligne contient un MSISDN dont le routage n'a pas été mis à jour.

### 5. Correction — Option A : Relancer le traitement FNR

Régénérer le fichier fnr_action_v3.bh et le renvoyer sur EMA :

```bash
ssh porta_pnmv3@vmqproportasync01
cd /home/porta_pnmv3/PortaSync/
./EmaExtracter.sh
```

### 6. Correction — Option B : Correction manuelle via DAPI

Pour des numéros spécifiques, utiliser les interfaces FNR individuelles (voir protocole P15) :

| Action | Interface |
|--------|-----------|
| Interroger | http://172.24.2.21/apis/porta/fnr-get-info.html |
| Créer | http://172.24.2.21/apis/porta/fnr-create.php |
| Modifier | http://172.24.2.21/apis/porta/fnr-update.php |
| Supprimer | http://172.24.2.21/apis/porta/fnr-delete.html |

### 7. Vérifier la cohérence PortaDB / FNR

Après correction, vérifier que les numéros basculés sont cohérents :

```bash
# Dans PortaDB
ssh porta_pnmv3@vmqproportawebdb01
mysql -e "SELECT msisdn, operateur_id_actuel FROM PortaDB.MSISDN WHERE msisdn = '069XXXXXXX';"
```

Puis interroger le FNR via http://172.24.2.21/apis/porta/fnr-get-info.html pour le même numéro et comparer :
- operateur_id_actuel = 1 (Orange) → FNR doit afficher 52303 (GP) / 52313 (MQ) / 52333 (GY) — depuis le 08/04/2026
- operateur_id_actuel = 2 (Digicel) → FNR doit afficher 60042 (ou absent si numéro d'origine Digicel)
- operateur_id_actuel = 3 (SFR) → FNR doit afficher 60044
- operateur_id_actuel = 4 (Dauphin) → FNR doit afficher 60043
- operateur_id_actuel = 5 (UTS) → FNR doit afficher 60045
- operateur_id_actuel = 6 (Free) → FNR doit afficher 60048

### 8. Alerter si nécessaire

Si le problème est systémique (plusieurs numéros KO, traitement complètement échoué) :
- Alerter fwi_pnm_si par email
- Escalader vers l'équipe infrastructure si le problème est réseau (SSH EMA inaccessible, etc.)
- Documenter l'incident dans le ticket RT d'astreinte

## Arbre de décision

```
Email de bascule KO ?
├── EmaExtracter KO → Verifier log EmaExtracter → Relancer EmaExtracter.sh
├── Fichier FNR absent sur EMA → Verifier transfert SSH → Relancer EmaExtracter.sh
├── FNR % OK < 50% → Analyser .nok → Correction manuelle DAPI (P15)
└── EmmExtracter KO → Verifier log EmmExtracter → Relancer EmmExtracter
```

## Notes opérationnelles

- Le rollback est une opération **critique** — les numéros portés peuvent être injoignables tant que le FNR n'est pas corrigé.
- Toujours vérifier la cohérence PortaDB/FNR après correction.
- Le fichier FNR est généré par EmaExtracter, pas par un script séparé — il faut relancer EmaExtracter pour régénérer le FNR.
- Le pourcentage de commandes OK dans le log FNR est le principal indicateur de santé de la bascule.
