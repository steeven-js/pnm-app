# P28 — Extraction MSISDN temporaires (erreur E610)

**Catégorie :** Debug / Diagnostic
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Script :** find_temporary_msisdn.sh
**Déclencheur :** Manuel (après erreur E610)

---

## Contexte

L'erreur E610 = "flux non attendu". Elle survient quand un MSISDN temporaire a été attribué lors du portage mais que le flux n'a pas abouti. Ce script permet de retrouver le MSISDN temporaire associé à un portage en erreur en parcourant les logs Glassfish (DAPI).

## Prérequis

Alimenter le fichier d'entrée avec les id_portage à rechercher :

```bash
ssh porta_pnmv3@vmqproportawebdb01
cd /home/porta_pnmv3/Scripts/
vi Id_portage.txt
# Ajouter un id_portage par ligne
```

## Exécution

```bash
./find_temporary_msisdn.sh
```

## Logique

Pour chaque id_portage dans `Id_portage.txt` :

1. Recherche dans les logs Glassfish : `grep "R220.*$ID_PORTAGE\|E610.*$ID_PORTAGE"`
2. Identification du fichier log et du numéro de ligne
3. Extraction du MSISDN temporaire dans les 100 lignes suivantes (balise `<msisdn>`)
4. Conversion format international → national : `590690XXXXXX` → `0690XXXXXX`

## Résultat

Fichier de sortie : `Result_msisdn_maj.txt`

```
========================
MSISDN        / MSISDN_TEMP
========================
069XXXXXXX / 069YYYYYYY
```

## Logs Glassfish

Emplacement : `/usr/glassfish4/glassfish/domains/domain1/logs/` sur vmqproportaweb01 (DAPI)
