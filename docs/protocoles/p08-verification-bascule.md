# P08 — Verification Bascule Porta / MOBI

**Categorie :** Portabilite
**Serveur :** vmqproportawebdb01 / vmqproportasync01
**Utilisateur :** porta_pnmv3
**Script :** Pnm-Verif-Bascule-MOBI.sh (automatique) / Pnm-Verif-Bascule-MOBI_CCA.sh (version legere)
**Declencheur :** Verification quotidienne apres bascule PNM (9H00 jours ouvres)

---

## Contexte

La bascule PNM est l'operation quotidienne qui applique les portabilites du jour dans MOBI (MasterCRM). Elle s'execute a 9H00 chaque jour ouvre et comprend trois traitements :

1. **EmaExtracter** : bascule les numeros dans MOBI + genere le fichier FNR
2. **EmmExtracter** : envoie le fichier MSISDN portes vers EMM
3. **fnr_action_v3.bh** : commandes NPSUB envoyees sur EMA pour mise a jour du routage reseau

Le script `Pnm-Verif-Bascule-MOBI.sh` verifie automatiquement que tout s'est bien passe et envoie un rapport par email.

## Emails de verification

Deux emails sont envoyes apres la bascule :

### Email 1 : Rapport de bascule
**Objet :** `[PNMV3] Verification Bascule Porta MOBI`
**Destinataire :** fwi_pnm_si

Contenu a verifier :
- **EmaExtracter** : tous les operateurs OK (entrantes)
  - Orange Caraibe (01) : OK / KO
  - SFR/OMT (03) : OK / KO
  - Dauphin Telecom (04) : OK / KO
  - UTS (05) : OK / KO
  - Free Caraibes (06) : OK / KO
- **EmmExtracter** : tous les operateurs OK (sortantes)
- Aucune bascule KO
- "Fin de traitement" present

### Email 2 : Confirmation FIN
**Objet :** `[PNMV3] Verification Bascule Porta MOBI : FIN`

Contenu a verifier :
- **Rapport RL** : X/X OK
- **Fichier fnr_action_v3.bh** : present sur EMA
- **Commandes OK** : pourcentage acceptable (> 50%)

## Etapes

### 1. Verifier l'email de bascule

A 9H30 environ, verifier la boite email `fwi_pnm_si` pour les deux emails de bascule.

### 2. Analyser le rapport

Pour chaque operateur, verifier que le statut est OK dans EmaExtracter et EmmExtracter.

### 3. Verifier les logs manuellement (si email absent)

```bash
ssh porta_pnmv3@vmqproportasync01
tail -100 /home/porta_pnmv3/PortaSync/log/EmaExtracter.log
```

Chercher :
- `Fin de traitement` present ? Si non, le script a plante.
- Nombre d'operateurs traites (doit etre 5 : OC, SFR, DT, UTS, FREE).

### 4. En cas de bascule KO

Si des MSISDN sont en erreur :
1. Identifier les MSISDN KO dans l'email
2. Verifier leur etat dans PortaDB :
   ```sql
   mysql -e "SELECT msisdn, operateur_id_actuel, etat_id_actuel
   FROM PortaDB.PORTAGE P
   INNER JOIN PortaDB.MSISDN M ON P.msisdn = M.msisdn
   WHERE M.msisdn = '069XXXXXXX';"
   ```
3. Verifier dans MOBI :
   ```sql
   SELECT LINE_MSISDN_ACTIVE, LINE_STATUS
   FROM LINE
   WHERE LINE_MSISDN_ACTIVE = '069XXXXXXX';
   ```
4. Corriger manuellement si necessaire
5. Si probleme systemique → voir protocole P16 (Rollback DAPI)
6. Escalader si le probleme persiste

### 5. Version legere CCA

Le script `Pnm-Verif-Bascule-MOBI_CCA.sh` est une version allegee de la verification, destinee aux CCA (Charges de Clientele Avances). Il effectue les memes verifications mais avec un rapport simplifie.

## Connexions du script

| Systeme | Serveur | Connexion |
|---------|---------|-----------|
| PortaDB | vmqproportawebdb01 | MySQL local |
| MOBI | vmqprostdb01 | Oracle `pb/gaston@MCST50A.BTC.COM` |
| EMA | digimqema01 | SSH `batchusr@digimqema01` |

## Notes operationnelles

- La bascule s'execute **uniquement les jours ouvres** (lundi-vendredi). Les jours feries sont exclus via la crontab (voir P17).
- Si la bascule echoue completement, le routage reseau sera desynchronise avec PortaDB → voir P16 pour le rollback.
- Le fichier FNR (`fnr_action_v3.bh`) est critique : sans lui, les numeros portes ne seront pas joignables.
