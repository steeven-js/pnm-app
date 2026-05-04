# P41 — Création / modification d'un script PNM

**Catégorie :** Exploitation / Maintenance
**Déclencheur :** Création d'un nouveau script ou modification d'un script existant
**Servers :** `vmqproportawebdb01` (scripts PNM cron) et `digimqapi01` (scripts PHP / shell API FNR-HLR)

---

## Cibles connues

| Serveur | Utilisateur | Chemin scripts | Type |
|---------|-------------|----------------|------|
| `vmqproportawebdb01` | `porta_pnmv3` | `/home/porta_pnmv3/Scripts/` | Shell, planifié `/etc/crontab` |
| `digimqapi01` | `application` | `/var/www/api.fwi.digicelgroup.local/htdocs/core/` | PHP / Shell, exposé HTTP |

> **digimqapi01** : Debian 5 / i686 (32 bits), connexion SSH legacy → ajouter `-o HostKeyAlgorithms=+ssh-rsa` ou config `~/.ssh/config`. Cursor Remote-SSH **non supporté** sur cette archi.

---

## Étapes

### 1. Téléversement avec Filezilla

Déposer le script dans le dossier cible :

- `vmqproportawebdb01` → `/home/porta_pnmv3/Scripts/`
- `digimqapi01` → `/var/www/api.fwi.digicelgroup.local/htdocs/core/`

### 2. Vérification du téléversement

```bash
# vmqproportawebdb01
ssh porta_pnmv3@vmqproportawebdb01
cd Scripts
ls -rtl | grep <NOM_FICHIER>

# digimqapi01
ssh application@digimqapi01
cd /var/www/api.fwi.digicelgroup.local/htdocs/core
ls -rtl | grep <NOM_FICHIER>
```

### 3. Modification des droits

```bash
chmod 755 <NOM_FICHIER>
```

### 4. Vérification des droits

```bash
ls -rtl | grep <NOM_FICHIER>
```

### 5. Test du script

```bash
# Shell
./<NOM_FICHIER>.sh -v

# PHP en CLI
php <NOM_FICHIER>.php

# PHP via HTTP (digimqapi01)
curl http://api.fwi.digicelgroup.local/core/<NOM_FICHIER>.php
```

### 6. Vérification du résultat

Selon le script :

- Email reçu (`[EXTERNAL] [PNM] ...`)
- Fichier généré dans `/home/porta_pnmv3/Log/`
- Réponse HTTP / log applicatif

---

## Planification automatique (vmqproportawebdb01 uniquement)

### 7. Se connecter en root

```bash
su - root
```

### 8. Vérification du fichier

```bash
cat /home/porta_pnmv3/Scripts/<NOM_FICHIER>.sh
```

### 9. Lancer le mode édition

```bash
vi /etc/crontab
```

### 10. Lancer le mode insertion

```
i
```

### 11. Ajouter la ligne crontab

```
# PORTA PNMV3 - <Description courte>
<min> <h> <jour-mois> <mois> <jour-semaine> porta_pnmv3 /home/porta_pnmv3/Scripts/<NOM_FICHIER>.sh -v
```

### 12. Sauvegarder et quitter

```
:wq
```

Pour **quitter sans sauvegarder** :

```
:q!
```

### 13. Sortir de la session root

```bash
exit
```

---

## Référence

- Ticket #277336 — Création de `Pnm_1510_1520_reporting_mensuel.sh` sur `vmqproportawebdb01` (cas d'école shell + crontab)
- `digimqapi01` : scripts PHP FNR-HLR (ex. `fnr-get-info.php`, `fnr-list-networkop.php`, `porta-check-v3-post.php`) — pas de planification cron, exposés via HTTP
