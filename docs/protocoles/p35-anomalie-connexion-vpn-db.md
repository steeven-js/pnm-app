# P35 — Anomalie connexion VPN a la base de donnees PortaDB (PROVISOIRE)

**Categorie :** Debug / Diagnostic
**Serveur :** vmqproportawebdb01 (172.24.119.68)
**Utilisateur :** root (via su depuis porta_pnmv3)
**Declencheur :** Erreur "Cannot Connect to Database Server" depuis MySQL Workbench en VPN
**Ticket RT :** 276887 — [APP-OCS] Anomalie lors de la connexion en VPN sur la base de donnee DAPI
**Statut :** PROVISOIRE — ticket en cours de resolution

---

## Contexte

Lors de la connexion en VPN a la base PortaDB (MariaDB) via MySQL Workbench,
l'erreur suivante apparait :

```
Cannot Connect to Database Server
Your connection attempt failed for user 'exploit' from your host to
server at 172.24.119.68:3306:
Lost connection to MySQL server at 'reading initial communication packet',
system error: 0
```

Cette erreur est causee par un depassement du nombre de connexions echouees
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

### 3. Se connecter a MariaDB

```bash
mysql
```

### 4. Executer flush hosts

```sql
flush hosts;
```

Resultat attendu :
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

Le parametre `max_connect_errors` de MariaDB est atteint.
Quand un host depasse ce nombre de connexions echouees, MariaDB
bloque toutes les connexions depuis ce host.

Le `flush hosts` reinitialise le compteur de connexions echouees
pour tous les hosts.

## Verifications complementaires

```sql
-- Verifier la valeur de max_connect_errors
SHOW VARIABLES LIKE 'max_connect_errors';

-- Verifier les hosts bloques
SELECT * FROM performance_schema.host_cache WHERE SUM_CONNECT_ERRORS > 0;
```

## Solution definitive (a faire dans le ticket 276887)

Augmenter la valeur de `max_connect_errors` dans la configuration MariaDB :

```
# Dans /etc/mysql/mariadb.conf.d/50-server.cnf
[mysqld]
max_connect_errors = 100000
```

Puis redemarrer MariaDB :
```bash
systemctl restart mariadb
```

> **Attention :** Le redemarrage de MariaDB coupe temporairement toutes
> les connexions a PortaDB (scripts PNM inclus). A faire en dehors
> des heures de vacation.

## Notes

- Ce protocole est PROVISOIRE. La solution definitive sera implementee
  via le ticket RT 276887.
- Le `flush hosts` est une solution temporaire qui doit etre refaite
  a chaque fois que le probleme se reproduit.
- Le probleme survient principalement en VPN car les connexions sont
  moins stables et generent plus de tentatives echouees.
