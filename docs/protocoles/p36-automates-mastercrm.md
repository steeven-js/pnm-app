# P36 — Automates Back Office MasterCRM

**Categorie :** Supervision / Exploitation
**Serveur :** Serveur Back Office MasterCRM
**Ordonnanceur :** WATCHER
**Declencheur :** Execution automatique quotidienne
**Rapport :** Email quotidien "[PROD] Rapport d'activite automates" envoye par supervision@digicelgroup.fr
**Destinataires rapport :** Frederick Vernon, FWI_PNM_SI, Judes Honore, Jean-Marc Lamin

---

## Contexte

Le Back Office MasterCRM execute quotidiennement plusieurs automates orchestres par le WATCHER. Chaque automate a un role specifique dans la gestion des lignes, ressources, logistique et provisioning. Un rapport d'activite est envoye chaque jour par email avec 3 pieces jointes : un CSV synthetique, un CSV detaille, et un log complet.

## Automates

### WATCHER

Ordonnanceur principal des automates du Back Office MasterCRM. Il planifie et lance l'execution de tous les autres automates dans l'ordre defini.

### BASCULE_IN

Automate charge de faire la bascule des lignes.

- **Frequence :** Une fois par jour a partir de 00h15
- **Traitement :** Actions de changement d'offre, changement de titulaire, ajout/suppression d'option a date de cycle, et quelques autres actions CCARE programmees a date de cycle (du 1er au 28)
- **Particularite :** Les journees du 29/30/31, l'automate effectue peu de modifications car pas de date de cycle de facturation

**Exemple d'execution :**
```
Dossier        : BASCULE_IN
Date Bascule   : 16/04/2026 MODE : NORMAL
Heure Debut    : 00:15:30
Heure Fin      : 02:42:42
Statut         : SUCCESS
```

### EXPLOIT

Automate en charge de la liberation des ressources quotidiennement.

- **Frequence :** Quotidienne, apres BASCULE_IN
- **Traitement :**
  - Liberation des ressources (IMEI, SIM, MSISDN)
  - Archivage de certaines transactions
  - Nettoyage des Communautes (CUG ajoutes sur les lignes Flotte Entreprise)

**Exemple d'execution :**
```
Dossier        : EXPLOIT
Heure Debut    : 02:43:44
Heure Fin      : 02:57:17
Statut         : SUCCESS
```

### LOGISTIQUE

Fait l'interface entre le SIT (Outil Logistique de la PFL — Plateforme Logistique Geodis) et les bases de donnees de MasterCRM/MasterLogistique.

- **Frequence :** Plusieurs fois par jour (executions repetees)
- **Traitement :**
  - Reception des ordres de transfert internes
  - Reception/livraison des commandes client et fournisseur traitees a la PFL

**Particularite :** Cet automate s'execute plusieurs fois par jour (6-7 fois). Chaque execution dure environ 40-50 minutes.

**Exemple d'execution :**
```
Dossier        : LOGISTIQUE
Heure Debut    : 08:15:22
Heure Fin      : 09:06:22
Statut         : SUCCESS
```

### RATP_OLN

Automate effectuant le rattrapage automatique des lignes en echec d'activation.

- **Frequence :** Quotidienne
- **Traitement :** Relance automatique des activations qui ont echoue (statut technique "Activation Rejetee")

> **Lien avec les tickets :** Quand un CDC signale une "activation rejetee" (statut technique 23), l'automate RATP_OLN tente un rattrapage automatique. Si le rattrapage echoue, une intervention manuelle est necessaire (voir ticket type #277014, #277038).

### TRACE

Automate charge de mettre a jour les traces CCARE de l'environnement fonctionnel.

- **Frequence :** Quotidienne
- **Traitement :** Mise a jour des traces des actions CCARE dans l'historique des lignes

## Ordre d'execution quotidien

| Ordre | Automate | Heure debut typique | Duree moyenne |
|-------|----------|---------------------|---------------|
| 1 | BASCULE_IN | 00:15 | ~2h30 |
| 2 | EXPLOIT | ~02:45 | ~15 min |
| 3 | LOGISTIQUE | ~08:15 | ~40-50 min (x6-7/jour) |
| 4 | RATP_OLN | Variable | Variable |
| 5 | TRACE | Variable | Variable |

## Supervision

Le rapport quotidien envoye par `supervision@digicelgroup.fr` contient :

| Piece jointe | Contenu |
|-------------|---------|
| automates_activity_YYYY-MM-DD.csv | CSV synthetique (resume) |
| automates_detail_YYYY-MM-DD.csv | CSV detaille (chaque execution) |
| mgrntlog_global_YYYYMMDD.log | Log complet |

### Statuts possibles

| Statut | Signification | Action |
|--------|--------------|--------|
| SUCCESS | Execution terminee sans erreur | Rien a faire |
| A VERIFIER SI EN COURS | Execution en cours ou bloquee | Verifier si l'automate est encore actif |
| ERREUR / ECHEC | Execution echouee | Analyser les logs, escalader si necessaire |

### Que verifier

1. Tous les automates sont en **SUCCESS** dans le rapport
2. BASCULE_IN a termine avant 06h00 (sinon impact sur les activations du matin)
3. LOGISTIQUE s'execute bien plusieurs fois dans la journee
4. RATP_OLN a bien tourne (important pour les rattrapages d'activation)

## Escalade

En cas d'echec d'un automate :
- Verifier les logs dans la piece jointe du rapport
- Contacter Sarah Mogade (responsable automates MasterCRM)
- Si impact client immediat (BASCULE_IN, RATP_OLN) : escalader en urgence
