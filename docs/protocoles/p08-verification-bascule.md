# P08 — Verification Bascule Porta / MOBI

**Categorie :** Portabilite
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Declencheur :** Verification quotidienne apres bascule PNM

---

## Contexte

Verifier quotidiennement que les bascules PNM ont ete correctement appliquees dans MOBI.

## Etapes

### 1. Le script s'execute automatiquement

Le script Pnm-Verif-Bascule-MOBI.sh est planifie par crontab sur vmqproportawebdb01.
Il s'execute chaque jour ouvre apres la bascule.

### 2. Verifier l'email de bascule

Un email "[PNMV3] Verification Bascule Porta MOBI" est envoye a fwi_pnm_si.

Verifier :
- EmaExtracter : tous les operateurs OK (entrantes)
- EmmExtracter : tous les operateurs OK (sortantes)
- Aucune bascule KO
- Fin de traitement confirmee

### 3. Verifier l'email FIN

Un second email "[PNMV3] Verification Bascule Porta MOBI : FIN" confirme la fin complete.

Verifier :
- Rapport RL : X/X OK
- Fichier fnr_action_v3.bh : present
- Commandes OK : pourcentage acceptable (> 50%)

### 4. En cas de bascule KO

Si des MSISDN sont en erreur :
1. Identifier les MSISDN KO dans l'email
2. Verifier leur etat dans PortaDB et MOBI
3. Corriger manuellement si necessaire
4. Escalader si probleme systemique
