# Cadrage — Dockerisation des MEP Porta (PortaWs / PortaSync)

> Note de cadrage — Steeven Jacques. Initiative portée par **Willy (CEO PIL-média)** : faire évoluer l'application Porta vers Docker pour **fiabiliser et simplifier les livraisons (MEP)**.
> Hypothétique à ce stade (la mise en œuvre côté PIL-média n'est pas figée). Document vivant.

---

## 1. Objectif

Packager le runtime **avec** le livrable pour rendre les MEP **reproductibles, simples et sans erreur d'environnement** (déploiement = `pull` + `up`, rollback = tag précédent).

**Déclencheur :** la MEP PortaWs-3 du 07/04/2026 a régressé car l'extension **`php-curl` avait été oubliée** côté serveur (→ `Call to undefined function curl_init()`), et le **PNMSYNC** (non testé) est tombé en panne (anomalie #5239). Avec Docker, l'extension est **dans l'image** → ce type d'erreur devient **impossible**.

## 2. Périmètre à conteneuriser

| Brique | Aujourd'hui | Cible Docker |
|--------|-------------|--------------|
| **PortaWs** | `.war` Java dans Tomcat (`vmqproportaws01`) | Image `tomcat + jdk` + `.war`, taggée `portaws:3.0.x` |
| **PortaSync** | Scripts PHP 7.3 + **cron** (`vmqproportasync01`) | Image `php:7.3-cli` avec **extensions dans le Dockerfile** (`curl`, `soap`, `mysqli`…) ; cron interne ou orchestré |
| **PortaDB / PortaWebDB** | MariaDB 10.3 (`vmqproportawebdb01`) | À garder hors conteneur au début (données critiques) ; sinon conteneur + volume persistant |

## 3. Principe de fonctionnement

- Chaque livrable = **image taguée** poussée dans un **registre** (candidat : Gitea interne Digicel).
- **MEP** = `docker pull` + `docker compose up -d` (ou rollout) → fini les étapes manuelles (activer une extension, redémarrer Tomcat, créer une table). **Rollback** = redéployer le tag précédent.
- **Config externalisée** en variables d'environnement / fichiers montés (endpoints WS, accès DB, chemins `pnmdata`, clés sFTP) — **jamais en dur** dans l'image.
- Orchestration : **docker-compose** (suffisant) ou **Kubernetes** (si visée plus large).

## 4. Bénéfices attendus

- **Parité d'environnement** garantie (PHP + extensions, Tomcat, timezone, locales, encodage) entre INT et PROD.
- **Plus d'oubli de dépendance** runtime (cf. #5239).
- **MEP & rollback** rapides et déterministes.
- **Traçabilité** par tag d'image (qui/quoi/quand).

## 5. Actions côté Digicel (périmètre Steeven : test & ops)

**Cadrage / dépendances**
- Cartographier les dépendances runtime de chaque brique (versions + **toutes** les extensions PHP, Java/Tomcat, timezone, locales).
- Lister les intégrations externes à garder joignables : **MariaDB**, **sFTP inter-op** (193.251.160.208), **FNR/EMA (NPSUB)**, endpoints **WS**, MasterCRM.
- Recenser les **données persistantes** à monter en volumes : `pnmdata/<op>/` (send/recv/arch_*), **logs**, `config_inc.php`, **clés sFTP/SSH**, crontab.

**Tests / validation (cœur du rôle)**
- Bâtir une **checklist de validation MEP exhaustive** couvrant **tous les flux**, et y **ajouter le PNMSYNC hebdo** (la lacune à l'origine de #5239) : vacations V1/V2/V3, bascule, valorisation, Ema/EmmExtracter, MAJ FNR, **PNMSYNC**, réception/ACR, ack dégradé E008.
- **Valider l'image en INT** avant toute prod (rejeu de scénarios).
- Vérifier la **parité de config** image ↔ prod.

**Ops / persistance / sécurité**
- Accès réseau (DB, sFTP, WS) + **gestion propre des secrets** (montés/injectés, pas en dur).
- **Volumes persistants** pour `pnmdata` et logs (sinon perte de fichiers PNM en cours au redéploiement).
- **Plan de rollback** + sauvegarde avant bascule ; **monitoring** des conteneurs (santé + logs).

**Process / doc**
- Cadrer le **qui livre quoi** : PIL-média livre l'image → Digicel valide en INT → déploie en PROD.
- **Documenter la nouvelle procédure de MEP** (remplace la checklist manuelle actuelle).

## 6. Points à clarifier avec PIL-média / Willy

1. MariaDB conteneurisée ou laissée telle quelle ?
2. Cron interne au conteneur PortaSync ou orchestré (CronJob) ?
3. docker-compose ou Kubernetes ?
4. Quel registre d'images (Gitea Digicel ?) et accès ?
5. Montage du sFTP inter-op et des clés ?
6. Un conteneur par brique, ou regroupement ?

## 7. Lien avec l'incident déclencheur (#5239)

La régression PNMSYNC vient de la **MEP PortaWs-3 du 07/04** (RT 276709) : refactor des scripts (migration `postRequest`/JSON-curl, table `MSISDN_INTERNATIONAUX`), **extension `php-curl` oubliée**, et **PNMSYNC non inclus dans la validation**. Docker + une checklist de MEP complète **adressent directement** les deux causes.

---
*Statut : cadrage initial, à enrichir selon la proposition de PIL-média.*
