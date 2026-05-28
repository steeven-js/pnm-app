# P27 — Contrôle FNR post-bascule

**Catégorie :** Portabilité
**Serveur EMA :** EMA15-Digicel (connexion via batchuser)
**Script :** Pnm-FNR_presence_V3.sh (exécuté depuis vmqprostdb01 par oracle)
**Planification :** Quotidien (après bascule)

---

## Contexte

Après la bascule quotidienne, le fichier `fnr_action_v3.bh` contenant les commandes NPSUB est envoyé sur EMA pour mettre à jour le FNR (routage réseau). Ce script vérifie que le fichier est présent et que les commandes ont été exécutées correctement.

## Connexion au serveur EMA

```bash
ssh batchuser@EMA15-Digicel
```

Répertoire de travail :
```bash
pwd
/var/sog/BatchHandler/Users/batchuser
```

Arborescence :
```
/var/sog/BatchHandler/Users/batchuser/
├── BatchJob/       ← fichier fnr_action_v3.bh (commandes NPSUB)
├── LogFiles/       ← logs d'exécution (.log, .nok)
├── ErrorFiles/     ← fichiers en erreur
├── script/         ← scripts utilitaires
└── VerifiedFiles/  ← fichiers déjà traites
```

## Email

`[PNM] Presence batchhandler FNR_V3 sur EMA` → frederick.vernon (cc: sarah.mogade, frederic.arduin)

## Logique du script

### 1. Vérification présence fichier fnr_action_v3.bh

Se connecter à EMA puis exécuter (sans guillemets autour de la commande) :

```bash
ssh batchuser@EMA15-Digicel
find /var/sog/BatchHandler/Users/batchuser/BatchJob -name 'fnr_action_v3.bh' -type f -mtime 0
```

> **Note :** Si pas de résultat = le fichier a déjà été traité et supprimé par le BatchHandler. C'est normal. Vérifier le log du jour à l'étape 2.

Le script Pnm-FNR_presence_V3.sh retente 15 fois (toutes les 30 secondes) si le fichier n'est pas encore présent.

### 2. Vérifier le log d'exécution

Lister les derniers logs FNR (méthode recommandée) :

```bash
ls -lrt /var/sog/BatchHandler/Users/batchuser/LogFiles/*fnr_action* | tail -5
```

> **Note :** Ne pas utiliser `$(date +%Y-%m-%d)` car le shell EMA peut ne pas l'évaluer. Utiliser `tail -5` pour voir les derniers logs et vérifier que la date du jour est présente.

### 3. Calcul du pourcentage de commandes OK

Copier le nom du log du jour affiché à l'étape 2 et l'utiliser dans la commande :

```bash
# Reperer le nom du log du jour dans le résultat de l'étape 2 :
# Exemple : 2026-04-09_09.10.06_fnr_action_v3.bh.log
#
# Puis copier-coller le nom dans la commande :
cat XXXX-XX-XX_XX.XX.XX_fnr_action_v3.bh.log | grep Totally
```

Exemple réel :
```bash
cat 2026-04-09_09.10.06_fnr_action_v3.bh.log | grep Totally
```

Le résultat affiche 2 lignes "Totally" :
- Ligne 1 : nombre de commandes OK
- Ligne 2 : nombre de commandes KO

```
pourcentage_ok = (OK * 100) / (OK + KO)
```

### 4. Lire le détail des commandes CAI exécutées

Le log contient les commandes CAI (CREATE, SET, DELETE) avec les MSISDN :

```bash
# Lire le log complet du jour (copier-coller le nom du log de l'étape 2)
cat XXXX-XX-XX_XX.XX.XX_fnr_action_v3.bh.log
```

> **Note :** Le fichier `fnr_action_v3.bh` original n'est PAS archivé.
> Il est supprimé après exécution. Le log est le seul endroit où
> le contenu des commandes est conservé.

Format des commandes dans le log :

```
CREATE:NPSUB:MSISDN,590XXXXXXXXX:NP,XXXXX;   ← Portabilite ENTRANTE (numéro arrive)
RESP:0;                                         ← Succes

SET:NPSUB:MSISDN,590XXXXXXXXX:NP,XXXXX;       ← MODIFICATION routage
RESP:0;

DELETE:NPSUB:MSISDN,590XXXXXXXXX;              ← Portabilite SORTANTE (numéro repart)
RESP:0;
```

Codes NP (préfixe de routage) — MAJ 08/04/2026 :

Orange Caraïbe (nouveaux préfixes actifs depuis le 08/04/2026) :
- `52303` = Orange Caraïbe Guadeloupe
- `52313` = Orange Caraïbe Martinique
- `52333` = Orange Caraïbe Guyane

Digicel (anciens préfixes, migration en stand-by) :
- `52301` = Digicel Guadeloupe (nouveau, pas encore actif)
- `52311` = Digicel Martinique (nouveau, pas encore actif)
- `52331` = Digicel Guyane (nouveau, pas encore actif)
- `60042` = Digicel (ancien préfixe, toujours actif)

Autres opérateurs (anciens préfixes, migration en stand-by) :
- `60043` = Dauphin Telecom (ancien) / `52304` = DT Guadeloupe (nouveau)
- `60044` = SFR / Outremer Telecom (ancien) / `52300/52310/52330` = SFRC (nouveau)
- `60045` = UTS Caraïbe
- `60048` = Free Caraïbes

`RESP:0` = commande OK. Toute autre valeur = erreur.

### 5. Vérification du fichier .nok (commandes en échec)

```bash
ls -lrt /var/sog/BatchHandler/Users/batchuser/LogFiles/*fnr_action*.nok | tail -5
```

### 5. Résultat

- **> 50% OK** : email normal avec pourcentage et lien vers le log
- **< 50% OK** : email d'alerte + fichier .nok en pièce jointe
- **Fichier absent** : email d'alerte demandant de vérifier le transfert

## Vérification manuelle sur EMA

```bash
# Se connecter
ssh batchuser@EMA15-Digicel

# Aller dans le repertoire LogFiles
cd /var/sog/BatchHandler/Users/batchuser/LogFiles
```

### Vérifier si le fichier FNR du jour a été traité

Le fichier `fnr_action_v3.bh` est **supprimé de BatchJob/** après exécution par le BatchHandler.
Il n'est donc plus présent si tout s'est bien passé. Le seul moyen de confirmer l'exécution
est de vérifier la présence du log du jour dans `LogFiles/`.

```bash
# Verifier dans BatchJob (present = pas encore traite)
ls -la /var/sog/BatchHandler/Users/batchuser/BatchJob/fnr_action_v3.bh

# Si absent de BatchJob, vérifier le log du jour dans LogFiles
# Format : YYYY-MM-DD_HH.MM.SS_fnr_action_v3.bh.log
ls -lrt /var/sog/BatchHandler/Users/batchuser/LogFiles/*fnr_action*$(date +%Y-%m-%d)*
```

### Lire le log du jour pour vérifier le pourcentage OK

```bash
# Exemple pour le 08/04/2026
cat 2026-04-08_09.10.06_fnr_action_v3.bh.log | grep Totally
```

### Vérifier s'il y a eu des commandes en échec (.nok)

```bash
# Lister les derniers .nok (s'il en existe)
ls -lrt /var/sog/BatchHandler/Users/batchuser/LogFiles/*fnr_action*.nok | tail -5

# Lire le contenu du .nok (MSISDN en erreur)
# Copier-coller le nom du fichier .nok dans la commande :
cat XXXX-XX-XX_XX.XX.XX_fnr_action_v3.bh.nok
```

### Nommage des fichiers logs

```
Format : YYYY-MM-DD_HH.MM.SS_fnr_action_v3.bh.log
         YYYY-MM-DD_HH.MM.SS_fnr_action_v3.bh.nok  (si erreurs)

Exemples reels :
  2026-04-08_09.10.06_fnr_action_v3.bh.log  (11 Ko — normal)
  2026-03-24_09.10.06_fnr_action_v3.bh.nok  (44 octets — erreur)
  2026-04-01_10.27.55_fnr_action_v3.bh.log  (exécute a 10h27 au lieu de 9h10)
```

> **Note :** L'exécution normale est à 09:10. Si l'heure est différente (ex: 10:27 le 01/04), cela signifie que le fichier FNR a été généré en retard par EmaExtracter.

## Scripts utilitaires disponibles sur EMA

```bash
ls /var/sog/BatchHandler/Users/batchuser/*.sh
```

| Script | Usage |
|--------|-------|
| verif_synchro.sh | Vérification synchronisation générique |
| verif_synchro_imsi.sh | Vérification synchro IMSI |
| verif_synchro_msisdn.sh | Vérification synchro MSISDN |
| verif_synchro_msisdn_porta.sh | Vérification synchro MSISDN portabilité |
| verif_hss_msisdn.sh | Vérification HSS par MSISDN |
| verify_hss.sh | Vérification HSS générique |
| verify_hss_msisdn.sh | Vérification HSS par MSISDN (v2) |
| delete_hss.sh | Suppression entrée HSS |
| delete_hlr.sh | Suppression entrée HLR |
| delete_hlr_imsi.sh | Suppression HLR par IMSI |
| rattrapage_hlr_caw.sh | Rattrapage HLR/CAW |
| verif_hlr_caw.sh | Vérification HLR/CAW |
| verif_np.sh | Vérification Number Portability |

## En cas de problème

1. Vérifier que EmaExtracter a bien généré le fichier FNR (log sur vmqproportasync01)
2. Vérifier la connexion SSH vers EMA15-Digicel
3. Si commandes KO élevées, analyser le fichier .nok pour identifier les MSISDN en erreur
4. Corriger manuellement via les interfaces FNR DAPI (voir protocole P15)
5. Pour les rattrapages massifs, utiliser `rattrapage_hlr_caw.sh` sur EMA

## Notes

- L'ancien nom du serveur EMA était `digimqema01` — le nom actuel est `EMA15-Digicel`
- L'utilisateur est `batchuser` (avec un 'e') et non `batchusr`
- Le home directory est `/var/sog/BatchHandler/Users/batchuser/` (et non `/global/var/sog/...`)
