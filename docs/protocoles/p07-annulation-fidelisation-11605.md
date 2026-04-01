# P07 — Annulation Fidelisation (APP_OCS 11605)

**Categorie :** Exploitation
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Declencheur :** Ticket RT — annulation fidelisation avant liberation IMEI

---

## Contexte

Annuler une fidelisation avant liberation IMEI, via APP_OCS requete 11605.

## Etapes

### 1. Acceder a APP_OCS

Ouvrir l'interface web APP_OCS supervision.

```
http://172.24.114.165/OCS/supervision/index.php
```

### 2. Executer la requete 11605

APP_OCS 11605 annule la fidelisation en cours.
Renseigner le MSISDN et le numero de ticket RT.

> **Attention :** Procedure multi-etapes sur 3 jours. Etape 1 : annulation FID (11605), puis liberation IMEI apres confirmation.

### 3. Liberer l'IMEI

Apres annulation FID confirmee, proceder a la liberation IMEI (voir protocole P01 — Liberation IMEI).

### 4. Fermer le ticket RT

Fermer le ticket apres toutes les etapes completees.
