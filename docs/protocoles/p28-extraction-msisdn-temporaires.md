# P28 — Extraction MSISDN temporaires (erreur E610)

**Categorie :** Debug / Diagnostic
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Script :** find_temporary_msisdn.sh
**Declencheur :** Manuel (apres erreur E610)

---

## Contexte

L'erreur E610 = "flux non attendu". Elle survient quand un MSISDN temporaire a ete attribue lors du portage mais que le flux n'a pas abouti. Ce script permet de retrouver le MSISDN temporaire associe a un portage en erreur en parcourant les logs Glassfish (DAPI).

## Prerequis

Alimenter le fichier d'entree avec les id_portage a rechercher :

```bash
ssh porta_pnmv3@vmqproportawebdb01
cd ~/scripts/
vi Id_portage.txt
# Ajouter un id_portage par ligne
```

## Execution

```bash
./find_temporary_msisdn.sh
```

## Logique

Pour chaque id_portage dans `Id_portage.txt` :

1. Recherche dans les logs Glassfish : `grep "R220.*$ID_PORTAGE\|E610.*$ID_PORTAGE"`
2. Identification du fichier log et du numero de ligne
3. Extraction du MSISDN temporaire dans les 100 lignes suivantes (balise `<msisdn>`)
4. Conversion format international → national : `590690XXXXXX` → `0690XXXXXX`

## Resultat

Fichier de sortie : `Result_msisdn_maj.txt`

```
========================
MSISDN        / MSISDN_TEMP
========================
069XXXXXXX / 069YYYYYYY
```

## Logs Glassfish

Emplacement : `/usr/glassfish4/glassfish/domains/domain1/logs/` sur vmqproportaweb01 (DAPI)
