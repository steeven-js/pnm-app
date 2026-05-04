# P41 — Création / modification d'un script PNM

**Catégorie :** Exploitation / Maintenance
**Déclencheur :** Création d'un nouveau script ou modification d'un script existant
**Serveur :** `vmqproportawebdb01`
**Utilisateur :** `porta_pnmv3` (script), `root` (modification `/etc/crontab`)

---

## Étapes

### 1. Téléversement avec Filezilla

Déposer le script dans `/home/porta_pnmv3/Scripts/`.

### 2. Vérification du téléversement

```bash
ssh porta_pnmv3@vmqproportawebdb01
cd Scripts
ls -rtl | grep Pnm_<NOM_SCRIPT>.sh
```

### 3. Modification des droits

```bash
chmod 755 Pnm_<NOM_SCRIPT>.sh
```

### 4. Vérification des droits

```bash
ls -rtl | grep Pnm_<NOM_SCRIPT>.sh
```

### 5. Test du script

```bash
./Pnm_<NOM_SCRIPT>.sh -v
```

### 6. Vérification de l'email reçu

Vérifier dans la boîte mail la réception de `[EXTERNAL] [PNM] ...`.

### 7. Se connecter en root

```bash
su - root
```

### 8. Vérification du fichier

```bash
cat /home/porta_pnmv3/Scripts/Pnm_<NOM_SCRIPT>.sh
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
<min> <h> <jour-mois> <mois> <jour-semaine> porta_pnmv3 /home/porta_pnmv3/Scripts/Pnm_<NOM_SCRIPT>.sh -v
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

- Ticket #277336 — Création du script `Pnm_1510_1520_reporting_mensuel.sh` (cas d'école)
