# P46 — DAPI : Portail(s) indisponible(s) (PortaWebUi / PortaWs)

**Catégorie :** Maintenance / Exploitation
**Serveurs :** vmqproportaweb01 (PortaWebUi) — vmqproportaws01 (PortaWs) — vmqproportawebdb01 (MySQL PortaDB)
**Utilisateur :** porta_pnmv3 (puis root via `su -`)
**Déclencheur :** Alerte supervision, mail CDC, ou constat manuel d'inaccessibilité
**Temps moyen :** 5 à 15 min (selon que le rechargement web suffit ou qu'il faut un redémarrage CLI)

---

## Contexte

L'un des deux portails web de portabilité (ou les deux) est inaccessible. Symptôme typique : page blanche, timeout HTTP, erreur 500/502/503 sur les URLs des portails.

Ce protocole décrit trois niveaux d'intervention, du plus léger au plus lourd :

1. **Rechargement applicatif** via le Manager Tomcat (web)
2. **Redémarrage du service Tomcat** en CLI
3. **Redémarrage MySQL** si la base est aussi inaccessible

## Portails concernés

| Portail | URL PROD | Serveur |
|---------|----------|---------|
| PortaWebUi | http://172.24.119.71:8080/ | vmqproportaweb01 |
| PortaWs | http://172.24.119.72:8080/ | vmqproportaws01 |

## Étapes

### 1. Rechargement applicatif via Manager Tomcat (à tenter en premier)

Se connecter via l'interface web Tomcat au serveur concerné :

- **PortaWebUi :** http://172.24.119.71:8080/
- **PortaWs :** http://172.24.119.72:8080/

Dans le menu de droite, cliquer sur **« Manager App »**, puis sur **« Recharger »** en face de l'application concernée.

> Si la page Manager elle-même est inaccessible, passer directement à l'étape 2.

### 2. Redémarrage du service Tomcat en CLI

À utiliser si l'interface web Manager est inaccessible.

Sur le serveur correspondant au portail en panne :

```bash
ssh porta_pnmv3@vmqproportaweb01   # ou vmqproportaws01 pour PortaWs
su -                                # passer root

systemctl stop tomcat
systemctl start tomcat

# Vérification
systemctl status tomcat
```

Attendre 1 à 2 minutes que Tomcat redémarre complètement, puis re-tester l'URL du portail dans le navigateur.

### 3. Redémarrage MySQL si la base est aussi inaccessible

À utiliser si le redémarrage Tomcat ne suffit pas et que les logs Tomcat (ou le portail une fois remonté) signalent des erreurs de connexion à PortaDB.

```bash
ssh porta_pnmv3@vmqproportawebdb01
su -                                # passer root

/etc/init.d/mysql stop
/etc/init.d/mysql start

# Vérification
/etc/init.d/mysql status
```

Puis redémarrer aussi Tomcat (étape 2) pour que les portails se reconnectent à la base.

## Escalade

Si le problème persiste après ces trois étapes :

- Escalader à l'équipe **SYS/BASES** pour redémarrage matériel du serveur et/ou intervention CLI plus poussée
- Joindre les logs Tomcat (`/var/log/tomcat/catalina.out` ou équivalent) et MySQL si pertinent

## Notes opérationnelles

- Le rechargement Manager (étape 1) recharge l'application **sans redémarrer la JVM** : plus rapide, moins intrusif.
- Le `systemctl stop/start tomcat` (étape 2) coupe complètement la JVM : à privilégier si l'application est dans un état incohérent.
- Le redémarrage MySQL (étape 3) impacte **toutes les applications connectées à PortaDB** (PnmDataAckManager, PortaWebUi, PortaWs, exports). À faire hors fenêtre de vacation PNM (avant 10h ou après 21h) si possible.
- Toujours tester les deux portails après une intervention : le redémarrage de l'un n'impacte pas l'autre, mais une panne réseau ou DB peut affecter les deux.

## Réponse type au demandeur

```
Bonjour,

Le portail [PortaWebUi / PortaWs] a été redémarré et est de nouveau accessible.

Cordialement,
[Prénom NOM]
Équipe Application
```
