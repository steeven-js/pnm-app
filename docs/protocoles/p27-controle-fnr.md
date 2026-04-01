# P27 — Controle FNR post-bascule

**Categorie :** Portabilite
**Serveur :** oracle@vmqprostdb01 → digimqema01 (EMA)
**Script :** Pnm-FNR_presence_V3.sh
**Planification :** Quotidien (apres bascule)

---

## Contexte

Apres la bascule quotidienne, le fichier `fnr_action_v3.bh` contenant les commandes NPSUB est envoye sur EMA pour mettre a jour le FNR (routage reseau). Ce script verifie que le fichier est present et que les commandes ont ete executees correctement.

## Email

`[PNM] Presence batchhandler FNR_V3 sur EMA` → frederick.vernon (cc: sarah.mogade, frederic.arduin)

## Logique du script

### 1. Verification presence fichier

```bash
ssh batchusr@digimqema01 "find /global/var/sog/BatchHandler/Users/batchusr/BatchJob \
  -name 'fnr_action_v3.bh' -type f -mtime 0"
```

Le script retente 15 fois (toutes les 30 secondes) si le fichier n'est pas encore present.

### 2. Attente du log d'execution

```bash
ssh batchusr@digimqema01 "find /global/var/sog/BatchHandler/Users/batchusr/LogFiles \
  -name '*fnr_action_v3.bh.log' -type f -mtime 0"
```

### 3. Calcul du pourcentage de commandes OK

Le log contient 2 lignes "Totally" :
- Ligne 1 : nombre de commandes OK
- Ligne 2 : nombre de commandes KO

```
pourcentage_ok = (OK * 100) / (OK + KO)
```

### 4. Resultat

- **> 50% OK** : email normal avec pourcentage et lien vers le log
- **< 50% OK** : email d'alerte + fichier .nok en piece jointe
- **Fichier absent** : email d'alerte demandant de verifier le transfert

## En cas de probleme

1. Verifier que EmaExtracter a bien genere le fichier FNR
2. Verifier la connexion SSH vers digimqema01
3. Si commandes KO elevees, analyser le fichier .nok pour identifier les MSISDN en erreur
4. Corriger manuellement via les interfaces FNR DAPI (voir protocole P15)
