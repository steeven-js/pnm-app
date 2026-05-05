# P08 — Verification Bascule Porta / MOBI

**Categorie :** Portabilite
**Serveur :** vmqproportawebdb01 / vmqproportasync01
**Utilisateur :** porta_pnmv3
**Script :** Pnm-Verif-Bascule-MOBI.sh (automatique) / Pnm-Verif-Bascule-MOBI_CCA.sh (version legere)
**Declencheur :** Verification quotidienne après bascule PNM (9H00 jours ouvrés)

---

## Contexte

La bascule PNM est l'operation quotidienne qui applique les portabilités du jour dans MOBI (MasterCRM). Elle s'exécute a 9H00 chaque jour ouvre et comprend trois traitements :

1. **EmaExtracter** : bascule les numéros dans MOBI + généré le fichier FNR
2. **EmmExtracter** : envoie le fichier MSISDN portes vers EMM
3. **fnr_action_v3.bh** : commandes NPSUB envoyées sur EMA pour mise a jour du routage réseau

Le script `Pnm-Verif-Bascule-MOBI.sh` vérifié automatiquement que tout s'est bien passe et envoie un rapport par email.

## Emails de vérification

Deux emails sont envoyés après la bascule :

### Email 1 : Rapport de bascule
**Objet :** `[PNMV3] Verification Bascule Porta MOBI`
**Destinataire :** fwi_pnm_si

Contenu a vérifier :
- **EmaExtracter** : tous les opérateurs OK (entrantes)
  - Orange Caraibe (01) : OK / KO
  - SFR/OMT (03) : OK / KO
  - Dauphin Telecom (04) : OK / KO
  - UTS (05) : OK / KO
  - Free Caraibes (06) : OK / KO
- **EmmExtracter** : tous les opérateurs OK (sortantes)
- Aucune bascule KO
- "Fin de traitement" present

### Email 2 : Confirmation FIN
**Objet :** `[PNMV3] Verification Bascule Porta MOBI : FIN`

Contenu a vérifier :
- **Rapport RL** : X/X OK
- **Fichier fnr_action_v3.bh** : present sur EMA
- **Commandes OK** : pourcentage acceptable (> 50%)

## Etapes

### 1. Verifier l'email de bascule

A 9H30 environ, vérifier la boite email `fwi_pnm_si` pour les deux emails de bascule.

### 2. Analyser le rapport

Pour chaque opérateur, vérifier que le statut est OK dans EmaExtracter et EmmExtracter.

### 3. Verifier les logs manuellement (si email absent)

```bash
ssh porta_pnmv3@vmqproportasync01
tail -100 /home/porta_pnmv3/PortaSync/log/EmaExtracter.log
```

Chercher :
- `Fin de traitement` present ? Si non, le script a plante.
- Nombre d'opérateurs traites (doit etre 5 : OC, SFR, DT, UTS, FREE).

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
4. Corriger manuellement si nécessaire
5. Si problème systemique → voir protocole P16 (Rollback DAPI)
6. Escalader si le problème persiste

### 5. Version legere CCA

Le script `Pnm-Verif-Bascule-MOBI_CCA.sh` est une version allegee de la vérification, destinee aux CCA (Charges de Clientele Avances). Il effectue les memes vérifications mais avec un rapport simplifie.

## Connexions du script

| Systeme | Serveur | Connexion |
|---------|---------|-----------|
| PortaDB | vmqproportawebdb01 | MySQL local |
| MOBI | vmqprostdb01 | Oracle `pb/gaston@MCST50A.BTC.COM` |
| EMA | EMA15-Digicel | SSH `batchuser@EMA15-Digicel` |

## Notes opérationnelles

- La bascule s'exécute **uniquement les jours ouvrés** (lundi-vendredi). Les jours fériés sont exclus via la crontab (voir P17).
- Si la bascule échoué complètement, le routage réseau sera désynchronisé avec PortaDB → voir P16 pour le rollback.
- Le fichier FNR (`fnr_action_v3.bh`) est critique : sans lui, les numéros portes ne seront pas joignables.
