# P41 — Création / modification d'un script PNM

**Catégorie :** Exploitation / Maintenance
**Déclencheur :** Besoin de créer un nouveau script PNM ou de modifier un script existant (ex. : ticket #277336 — création de `Pnm_1510_1520_reporting_mensuel.sh`)
**Serveur :** `vmqproportawebdb01` (où vivent la plupart des scripts cron PORTA PNMV3)
**Utilisateur :** `porta_pnmv3` (script), `root` (modification `/etc/crontab` uniquement)
**Temps moyen :** 30 min à 2h selon complexité

---

## Contexte

Les scripts PNM sont stockés dans `/home/porta_pnmv3/Scripts/` et planifiés dans `/etc/crontab` (crontab système, pas de crontab utilisateur pour `porta_pnmv3`). La connexion à PortaDB se fait via les credentials par défaut (`mysql -e`) ou explicites pour le heredoc qui produit le fichier de reporting (`mysql -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB`).

Avant tout déploiement, **créer un ticket RT** dans la file APPLICATIONS pour tracer les actions (Type Ticket : `Information` ou `Operation de Maintenance Planifiee`).

## Pré-requis

- Accès SSH à `vmqproportawebdb01` avec l'utilisateur `porta_pnmv3`
- Accès `sudo` ou `root` (pour modifier `/etc/crontab`)
- Filezilla (ou WinSCP / SCP) pour téléverser depuis Windows
- Script développé et testé en local sur un jeu de données connu

---

## Commandes de base (cheatsheet)

### Connexion et navigation

```bash
ssh porta_pnmv3@vmqproportawebdb01     # se connecter au serveur
cd /home/porta_pnmv3/Scripts            # aller dans le dossier des scripts
cd /home/porta_pnmv3/Log                # aller dans le dossier des logs
pwd                                     # afficher le chemin courant
exit                                    # se déconnecter
```

### Bascule en root (pour `/etc/crontab` uniquement)

```bash
su - root                               # passer en root (mot de passe demandé)
exit                                    # revenir à l'utilisateur précédent
```

### Lister, vérifier, lire

```bash
ls -rtl                                 # lister, du plus ancien au plus récent
ls -rtl | grep Pnm_<NOM>.sh             # filtrer
cat /home/porta_pnmv3/Scripts/Pnm_<NOM>.sh   # afficher le contenu
tail -f /home/porta_pnmv3/Log/Pnm_<NOM>.log  # suivre les logs en direct
```

### Permissions

```bash
chmod 755 Pnm_<NOM>.sh                  # rendre exécutable (rwxr-xr-x)
chmod +x Pnm_<NOM>.sh                   # alternative simple : ajouter +x
ls -l Pnm_<NOM>.sh                      # vérifier les droits
```

### Copies et sauvegardes

```bash
cp Pnm_<NOM>.sh Pnm_<NOM>.sh.bak.$(date +%Y%m%d)        # backup datée
sudo cp /etc/crontab /etc/crontab.bak.$(date +%Y%m%d)   # backup crontab
```

### Téléversement depuis Windows

```bash
# depuis le poste Windows (Git Bash) :
scp Pnm_<NOM>.sh porta_pnmv3@vmqproportawebdb01:/home/porta_pnmv3/Scripts/
```

Ou via Filezilla : connexion SFTP, glisser-déposer dans `/home/porta_pnmv3/Scripts/`.

### Édition `/etc/crontab` avec `vi`

```bash
sudo vi /etc/crontab                    # ouvrir
# i      -> mode insertion
# Esc    -> sortir du mode insertion
# :wq    -> sauvegarder et quitter
# :q!    -> quitter SANS sauvegarder
# /Pnm_  -> rechercher "Pnm_" dans le fichier
# dd     -> supprimer la ligne courante
# u      -> annuler la dernière action
```

### Test du script et logs

```bash
./Pnm_<NOM>.sh -v                       # exécution manuelle (verbose)
echo $?                                 # code retour (0 = OK)
tail -100 /home/porta_pnmv3/Log/Pnm_<NOM>.log  # 100 dernières lignes
```

### Test mail rapide

```bash
echo "test" | mutt -s "test PNM" -F /tmp/expediteur.txt -- steeven.jacques@digicelgroup.fr
```

---

## 1. Création d'un nouveau script

### 1.1 Développer en local

- Suivre le pattern d'un script existant éprouvé (ex. : `Pnm_Facturation_Mensuelle_PSO.sh`, `Pnm_1210_awaiting.sh`)
- Connexion DB : `mysql -N -e "SELECT ... FROM PortaDB.DATA WHERE ..."` (qualifier `PortaDB.<table>` car `mysql -e` ne sélectionne pas de base par défaut)
- Heredoc avec credentials explicites uniquement pour la génération du fichier de reporting
- Variables expéditeur / destinataires en haut du script
- Header de commentaires (auteur, date, objectif, planification)

### 1.2 Téléverser sur le serveur

Via **Filezilla** (le plus pratique) ou SCP :

```bash
scp Pnm_<NOM_SCRIPT>.sh porta_pnmv3@vmqproportawebdb01:/home/porta_pnmv3/Scripts/
```

### 1.3 Vérifier le téléversement

```bash
ssh porta_pnmv3@vmqproportawebdb01
cd /home/porta_pnmv3/Scripts
ls -rtl | grep Pnm_<NOM_SCRIPT>.sh
```

### 1.4 Vérifier le contenu

```bash
cat /home/porta_pnmv3/Scripts/Pnm_<NOM_SCRIPT>.sh
```

### 1.5 Modifier les droits (rendre exécutable)

```bash
chmod 755 /home/porta_pnmv3/Scripts/Pnm_<NOM_SCRIPT>.sh
```

### 1.6 Vérifier les droits

```bash
ls -rtl | grep Pnm_<NOM_SCRIPT>.sh
# Attendu : -rwxr-xr-x 1 porta_pnmv3 dba ...
```

### 1.7 Test manuel

```bash
./Pnm_<NOM_SCRIPT>.sh -v
```

Vérifier :

- Exécution sans erreur
- Email reçu dans la boîte du destinataire (`[EXTERNAL] [PNM] ...`)
- Fichier `.xls` généré dans `/home/porta_pnmv3/Log/`
- Logs sans warning critique

### 1.8 Planifier dans `/etc/crontab` (si exécution récurrente)

Sauvegarde **obligatoire** d'abord :

```bash
sudo cp /etc/crontab /etc/crontab.bak.$(date +%Y%m%d)
```

Édition :

```bash
su - root
vi /etc/crontab
```

En `vi` :

- `i` — passer en mode insertion
- Coller la nouvelle ligne au bon endroit (regrouper avec les autres lignes PORTA PNMV3) :

```
# PORTA PNMV3 - <Description courte>
<min> <h> <jour-mois> <mois> <jour-semaine> porta_pnmv3 /home/porta_pnmv3/Scripts/Pnm_<NOM_SCRIPT>.sh -v >> /home/porta_pnmv3/Log/Pnm_<NOM_SCRIPT>.log 2>&1
```

- `Esc` — sortir du mode insertion
- `:wq` — sauvegarder et quitter
- (`:q!` — quitter **sans** sauvegarder en cas d'erreur)
- `exit` — sortir de la session root

### 1.9 Vérifier la planification

```bash
sudo cat /etc/crontab | grep Pnm_<NOM_SCRIPT>
```

Attendre la prochaine occurrence prévue, vérifier que l'email arrive et que le `.log` se remplit.

---

## 2. Modification d'un script existant

### 2.1 Sauvegarde du script existant

```bash
ssh porta_pnmv3@vmqproportawebdb01
cd /home/porta_pnmv3/Scripts
cp Pnm_<NOM_SCRIPT>.sh Pnm_<NOM_SCRIPT>.sh.bak.$(date +%Y%m%d)
```

### 2.2 Sauvegarde de la crontab (si la planification change)

```bash
sudo cp /etc/crontab /etc/crontab.bak.$(date +%Y%m%d)
```

### 2.3 Téléverser la nouvelle version

Filezilla ou :

```bash
scp Pnm_<NOM_SCRIPT>.sh porta_pnmv3@vmqproportawebdb01:/home/porta_pnmv3/Scripts/
```

### 2.4 Vérifier les droits (au cas où ils auraient été perdus au transfert)

```bash
ls -rtl | grep Pnm_<NOM_SCRIPT>.sh
chmod 755 Pnm_<NOM_SCRIPT>.sh   # si necessaire
```

### 2.5 Test manuel

```bash
./Pnm_<NOM_SCRIPT>.sh -v
```

### 2.6 Modifier `/etc/crontab` si la planification change

Voir étape 1.8.

### 2.7 Surveiller la prochaine exécution automatique

```bash
tail -f /home/porta_pnmv3/Log/Pnm_<NOM_SCRIPT>.log
```

### 2.8 En cas de régression — rollback

```bash
cd /home/porta_pnmv3/Scripts
cp Pnm_<NOM_SCRIPT>.sh.bak.YYYYMMDD Pnm_<NOM_SCRIPT>.sh
chmod 755 Pnm_<NOM_SCRIPT>.sh
```

Pour la crontab :

```bash
sudo cp /etc/crontab.bak.YYYYMMDD /etc/crontab
```

---

## 3. Rappels de bonnes pratiques

| Règle | Pourquoi |
|-------|----------|
| Toujours qualifier les tables : `PortaDB.DATA`, `PortaDB.PORTAGE` | `mysql -e` n'a pas de base par défaut |
| Utiliser `mysql -N` pour les comptages | Évite l'en-tête de colonne dans la valeur capturée |
| Préférer `echo "$var" \| mysql ...` au heredoc | Évite les pièges du délimiteur (whitespace, CRLF) |
| `cd /home/porta_pnmv3/Log` avant `touch` | Permet d'utiliser des chemins relatifs dans `mutt -a` |
| Expéditeur mail : `porta_pnmv3@fwi.digicelgroup.local` | Adresse acceptée par le MTA Digicel |
| Sauvegarder `/etc/crontab` avant chaque modif | Rollback rapide en cas d'erreur |
| Tester manuellement avant de planifier | Évite de planifier un script cassé |
| Tracer les actions dans un ticket RT | Historique pour audit / réversion |

## 4. Tracer dans le ticket RT

Pour chaque action importante, ajouter un courrier dans le ticket RT correspondant. Exemple de format (extrait du ticket #277336) :

```
==> Téléversement avec Filezilla
==> Vérification du téléversement
porta_pnmv3@vmqproportawebdb01:~$ ls -rtl
...
==> Modification des droits
porta_pnmv3@vmqproportawebdb01:~/Scripts$ chmod 755 Pnm_<NOM_SCRIPT>.sh
==> Test du script
porta_pnmv3@vmqproportawebdb01:~/Scripts$ ./Pnm_<NOM_SCRIPT>.sh -v
==> Email reçu dans ma boite
[EXTERNAL] [PNM] ... -- 2026-March
```

Une fois la planification en place et la première exécution automatique réussie, **passer le statut du ticket à `résolu`**.

## 5. Tickets de référence

- **#277336** — Création du script `Pnm_1510_1520_reporting_mensuel.sh` (cas d'école : développement → téléversement → chmod → test → ajout crontab le 1er du mois à 00h15)

## Notes opérationnelles

- Les jours fériés ne sont pas exclus automatiquement par cron — gérer dans le script (`FERRYDAY` table) ou en désactivant manuellement la ligne avec `#` (voir P17)
- Pour un script de **reporting mensuel**, la planification standard est `<mm> 00 1 * * porta_pnmv3 ...` (le 1er du mois à 00h<mm>)
- Pour un script **quotidien**, planifier après la bascule de 9h (typiquement à partir de 11h00 pour laisser la bascule + restitutions sortantes se terminer)
- La règle `BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH) AND CURRENT_DATE - 1` donne un **rolling 30 jours**, pas le mois calendaire précédent. Pour le mois calendaire précédent, préférer `>= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01') AND < DATE_FORMAT(CURDATE(), '%Y-%m-01')`
