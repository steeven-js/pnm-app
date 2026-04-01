# P15 — Interrogation / Gestion FNR

**Categorie :** Debug / Diagnostic
**Serveur :** DAPI (172.24.2.21)
**Utilisateur :** N/A (interface web)
**Declencheur :** Besoin de verifier ou modifier le routage FNR d'un MSISDN

---

## Contexte

Interroger, creer, modifier ou supprimer un MSISDN dans le FNR (Forward Number Routing).

## Etapes

### 1. Interroger un MSISDN dans le FNR

Verifier le routage actuel d'un numero.

```
http://172.24.2.21/apis/porta/fnr-get-info.html
```

### 2. Creer un MSISDN dans le FNR

Ajouter un nouveau numero au FNR (apres portabilite entrante).

```
http://172.24.2.21/apis/porta/fnr-create.php
```

### 3. Changer le reseau d'un MSISDN

Modifier le routage reseau d'un numero existant.

```
http://172.24.2.21/apis/porta/fnr-update.php
```

### 4. Supprimer un MSISDN du FNR

Retirer un numero du FNR (apres portabilite sortante / restitution).

```
http://172.24.2.21/apis/porta/fnr-delete.html
```
