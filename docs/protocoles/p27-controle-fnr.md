# P27 — Controle FNR post-bascule

**Categorie :** Portabilite
**Serveur EMA :** EMA15-Digicel (connexion via batchuser)
**Script :** Pnm-FNR_presence_V3.sh (execute depuis vmqprostdb01 par oracle)
**Planification :** Quotidien (apres bascule)

---

## Contexte

Apres la bascule quotidienne, le fichier `fnr_action_v3.bh` contenant les commandes NPSUB est envoye sur EMA pour mettre a jour le FNR (routage reseau). Ce script verifie que le fichier est present et que les commandes ont ete executees correctement.

## Connexion au serveur EMA

```bash
ssh batchuser@EMA15-Digicel
```

Repertoire de travail :
```bash
pwd
/var/sog/BatchHandler/Users/batchuser
```

Arborescence :
```
/var/sog/BatchHandler/Users/batchuser/
├── BatchJob/       ← fichier fnr_action_v3.bh (commandes NPSUB)
├── LogFiles/       ← logs d'execution (.log, .nok)
├── ErrorFiles/     ← fichiers en erreur
├── script/         ← scripts utilitaires
└── VerifiedFiles/  ← fichiers deja traites
```

## Email

`[PNM] Presence batchhandler FNR_V3 sur EMA` → frederick.vernon (cc: sarah.mogade, frederic.arduin)

## Logique du script

### 1. Verification presence fichier fnr_action_v3.bh

```bash
ssh batchuser@EMA15-Digicel "find /var/sog/BatchHandler/Users/batchuser/BatchJob \
  -name 'fnr_action_v3.bh' -type f -mtime 0"
```

Le script retente 15 fois (toutes les 30 secondes) si le fichier n'est pas encore present.

### 2. Attente du log d'execution

```bash
ssh batchuser@EMA15-Digicel "find /var/sog/BatchHandler/Users/batchuser/LogFiles \
  -name '*fnr_action_v3.bh.log' -type f -mtime 0"
```

### 3. Calcul du pourcentage de commandes OK

Le log contient 2 lignes "Totally" :
- Ligne 1 : nombre de commandes OK
- Ligne 2 : nombre de commandes KO

```
pourcentage_ok = (OK * 100) / (OK + KO)
```

### 4. Verification du fichier .nok (commandes en echec)

```bash
ssh batchuser@EMA15-Digicel "find /var/sog/BatchHandler/Users/batchuser/LogFiles \
  -name '*fnr_action_v3.bh.nok' -type f -mtime 0"
```

### 5. Resultat

- **> 50% OK** : email normal avec pourcentage et lien vers le log
- **< 50% OK** : email d'alerte + fichier .nok en piece jointe
- **Fichier absent** : email d'alerte demandant de verifier le transfert

## Verification manuelle sur EMA

```bash
# Se connecter
ssh batchuser@EMA15-Digicel

# Verifier si le fichier FNR du jour est present
ls -la /var/sog/BatchHandler/Users/batchuser/BatchJob/fnr_action_v3.bh

# Verifier les logs du jour
ls -lrt /var/sog/BatchHandler/Users/batchuser/LogFiles/*fnr_action*

# Lire le log pour verifier le pourcentage OK
cat /var/sog/BatchHandler/Users/batchuser/LogFiles/*fnr_action_v3.bh.log | grep Totally

# Si .nok existe, lister les MSISDN en erreur
cat /var/sog/BatchHandler/Users/batchuser/LogFiles/*fnr_action_v3.bh.nok
```

## Scripts utilitaires disponibles sur EMA

```bash
ls /var/sog/BatchHandler/Users/batchuser/*.sh
```

| Script | Usage |
|--------|-------|
| verif_synchro.sh | Verification synchronisation generique |
| verif_synchro_imsi.sh | Verification synchro IMSI |
| verif_synchro_msisdn.sh | Verification synchro MSISDN |
| verif_synchro_msisdn_porta.sh | Verification synchro MSISDN portabilite |
| verif_hss_msisdn.sh | Verification HSS par MSISDN |
| verify_hss.sh | Verification HSS generique |
| verify_hss_msisdn.sh | Verification HSS par MSISDN (v2) |
| delete_hss.sh | Suppression entree HSS |
| delete_hlr.sh | Suppression entree HLR |
| delete_hlr_imsi.sh | Suppression HLR par IMSI |
| rattrapage_hlr_caw.sh | Rattrapage HLR/CAW |
| verif_hlr_caw.sh | Verification HLR/CAW |
| verif_np.sh | Verification Number Portability |

## En cas de probleme

1. Verifier que EmaExtracter a bien genere le fichier FNR (log sur vmqproportasync01)
2. Verifier la connexion SSH vers EMA15-Digicel
3. Si commandes KO elevees, analyser le fichier .nok pour identifier les MSISDN en erreur
4. Corriger manuellement via les interfaces FNR DAPI (voir protocole P15)
5. Pour les rattrapages massifs, utiliser `rattrapage_hlr_caw.sh` sur EMA

## Notes

- L'ancien nom du serveur EMA etait `digimqema01` — le nom actuel est `EMA15-Digicel`
- L'utilisateur est `batchuser` (avec un 'e') et non `batchusr`
- Le home directory est `/var/sog/BatchHandler/Users/batchuser/` (et non `/global/var/sog/...`)
