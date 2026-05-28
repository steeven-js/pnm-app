# P35 — Anomalie connexion VPN à la base de données PortaDB (PROVISOIRE)

**Catégorie :** Debug / Diagnostic
**Serveur :** vmqproportawebdb01 (172.24.119.68)
**Utilisateur :** root (via su depuis porta_pnmv3)
**Déclencheur :** Erreur "Cannot Connect to Database Server" depuis MySQL Workbench en VPN
**Ticket RT :** 276887 — [APP-OCS] Anomalie lors de la connexion en VPN sur la base de donnée DAPI
**Statut :** PROVISOIRE — ticket en cours de résolution

---

## Contexte

Lors de la connexion en VPN à la base PortaDB (MariaDB) via MySQL Workbench,
l'erreur suivante apparaît :

```
Cannot Connect to Database Server
Your connection attempt failed for user 'exploit' from your host to
server at 172.24.119.68:3306:
Lost connection to MySQL server at 'reading initial communication packet',
system error: 0
```

Cette erreur est causée par un dépassement du nombre de connexions échouées
depuis un host. MariaDB bloque temporairement les connexions de ce host.

## Solution temporaire : flush hosts

### 1. Se connecter au serveur

```bash
ssh porta_pnmv3@vmqproportawebdb01
```

### 2. Passer en root

```bash
su - root
```

### 3. Se connecter à MariaDB

```bash
mysql
```

### 4. Exécuter flush hosts

```sql
flush hosts;
```

Résultat attendu :
```
Query OK, 0 rows affected (0.008 sec)
```

### 5. Quitter MariaDB

```sql
exit
```

### 6. Retester la connexion

Retenter la connexion depuis MySQL Workbench :
- Host : 172.24.119.68
- Port : 3306
- User : exploit

## Cause probable

Le paramètre `max_connect_errors` de MariaDB est atteint.
Quand un host dépasse ce nombre de connexions échouées, MariaDB
bloque toutes les connexions depuis ce host.

Le `flush hosts` réinitialise le compteur de connexions échouées
pour tous les hosts.

## Vérifications complémentaires

```sql
-- Verifier la valeur de max_connect_errors
SHOW VARIABLES LIKE 'max_connect_errors';

-- Verifier les hosts bloqués
SELECT * FROM performance_schema.host_cache WHERE SUM_CONNECT_ERRORS > 0;
```

## Solution définitive (à faire dans le ticket 276887)

Augmenter la valeur de `max_connect_errors` dans la configuration MariaDB :

```
# Dans /etc/mysql/mariadb.conf.d/50-server.cnf
[mysqld]
max_connect_errors = 100000
```

Puis redémarrer MariaDB :
```bash
systemctl restart mariadb
```

> **Attention :** Le redémarrage de MariaDB coupe temporairement toutes
> les connexions à PortaDB (scripts PNM inclus). À faire en dehors
> des heures de vacation.

## Notes

- Ce protocole est PROVISOIRE. La solution définitive sera implémentée
  via le ticket RT 276887.
- Le `flush hosts` est une solution temporaire qui doit être refaite
  à chaque fois que le problème se reproduit.
- Le problème survient principalement en VPN car les connexions sont
  moins stables et génèrent plus de tentatives échouées.
