# P38 — Echec actions techniques apres changement de SIM

**Categorie :** Debug / Diagnostic
**Declencheur :** Ticket RT — Client ne peut plus utiliser sa ligne apres changement de SIM
**Serveur :** MasterCRM (vmqprotool01)
**Temps moyen :** 15 min a 1h (selon nombre d'actions en echec)
**Frequence :** Reguliere (~2-3 tickets/semaine)

---

## Contexte

Apres un changement de carte SIM en boutique (PDV), certaines actions techniques peuvent echouer lors du reprovisioning de la ligne sur le reseau. La ligne apparait comme "Active" dans MasterCRM mais les services ne fonctionnent pas (appels, data, roaming, etc.).

Le rattrapage automatique (automate RATP_OLN, voir P36) tente de relancer les actions echouees. Si le rattrapage echoue egalement, une intervention manuelle est necessaire.

## Symptomes

- Client ne peut plus utiliser sa ligne apres changement de SIM
- MasterCRM : Ligne Active mais actions techniques en statut "Rejetee"
- Actions concernees typiquement :
  - **ODL USIM illimite** : Rejetee
  - **Activation RoamingVoyage** : Rejetee
  - **Activation Double appel** : Terminee ou Rejetee
  - **Ajout CUG niveau Client** : Rejetee (normal pour les clients B2B avec CUG flotte)
  - **Reset du profil client TOTAL** : Terminee

## Etapes

### 1. Verifier l'historique des actions techniques dans MasterCRM

Dans la fiche client MasterCRM :
- Onglet **Techniques** → **Historique du statut**
- Identifier les actions en statut **Rejetee**
- Verifier si l'automate RATP_OLN a tente un rattrapage (plusieurs series d'actions a quelques minutes d'intervalle)

### 2. Identifier le type de client

| Type | Indicateur | Particularite |
|------|-----------|---------------|
| Grand public (GP) | Categorie client Defaut | Actions standard |
| B2B / Entreprise | Categorie B2B, CUG_XXXX | Ajout CUG rejetee = **normal** (CUG flotte necessite config reseau specifique) |
| Wizzee | OPERATION_ID = 217, MS_CLASS = 80 | Transmettre equipe Wizzee |

### 3. Tenter un renvoi des actions echouees

Dans MasterCRM, sur chaque action en statut "Rejetee" :
1. Selectionner l'action
2. Cliquer sur **"Renvoyer l'action"**
3. Verifier le retour dans **"Detail action"**

> **Attention CUG :** Pour les clients B2B avec CUG, ne pas renvoyer l'action "Ajout CUG niveau Client". Le CUG doit etre configure specifiquement par l'equipe reseau/MOBI.

### 4. Si le renvoi echoue : escalader a MOBI

Si les actions restent en "Rejetee" apres renvoi, transferer a l'equipe MOBI (Sarah Mogade) pour reprovisioning manuel :

```
Bonjour Sarah,

Suite a un changement de SIM sur la ligne [MSISDN] (client [NOM], [N° CLIENT]),
les actions techniques suivantes restent en échec après rattrapage RATP_OLN
et renvoi manuel :

- [Liste des actions rejetées]

Peux-tu vérifier le provisioning réseau ?

Cdt,
[Prénom NOM]
Équipe Application
```

### 5. Repondre au demandeur

**En attente d'intervention MOBI :**
```
Bonjour,

Suite au changement de SIM du [DATE], certaines actions techniques
sont en échec. Le rattrapage a été effectué mais des actions réseau
n'ont pas abouti.

Nous avons escaladé a l'équipe réseau pour le reprovisioning.
Le ticket sera mis a jour dès résolution.

Cdt,
[Prénom NOM]
Équipe Application
```

**Apres resolution :**
```
Bonjour,

Le reprovisioning de la ligne [MSISDN] a été effectué.
Le client peut tester sa ligne.

Cdt,
[Prénom NOM]
Équipe Application
```

## Cas particulier : Client B2B avec CUG

Pour les clients B2B (flotte entreprise), l'action "Ajout CUG niveau Client" est systematiquement rejetee lors d'un changement de SIM. C'est un comportement connu :
- Le CUG (Closed User Group) est un groupe de numeros ferme pour les flottes entreprise
- La configuration CUG necessite une intervention specifique de l'equipe MOBI/reseau
- L'automate EXPLOIT (voir P36) gere le nettoyage des CUG mais pas leur reconfiguration apres changement de SIM

## Exemple reel — Ticket du 20/04/2026

**Client :** SARL J 2 (2016796) — B2B CUG_9352, Baie Mahault
**MSISDN :** 0690201376
**Ligne :** 7043049 — LIFE PRO 20Go Bloque ANT SM 24
**Changement SIM :** 15/04/2026
**Demandeur :** Stephanie Laday

Actions techniques du 16/04/2026 (rattrapage RATP_OLN x2) :

| Action | 14:45 | 14:50 |
|--------|-------|-------|
| Reset du profil client TOTAL | Terminee | Terminee |
| ODL USIM illimite | Rejetee | Rejetee |
| Activation Double appel | Terminee | Terminee |
| Activation RoamingVoyage | Rejetee | Rejetee |
| Ajout CUG niveau Client | Rejetee | Rejetee |

Ligne passee en "Active" a 14:55:47 mais services incomplets.
→ Escalade equipe MOBI pour reprovisioning ODL USIM + RoamingVoyage + CUG.

## Notes operationnelles

- Le changement de SIM declenche automatiquement un reprovisioning complet de la ligne
- L'automate RATP_OLN tente le rattrapage sous 24h (voir P36)
- Si apres 2 tentatives RATP_OLN les actions sont toujours rejetees, le rattrapage automatique ne suffira pas
- Les tickets lies : #277038 (activation rejetee apres changement SIM), SARL J 2 (20/04/2026)
- Demandeurs frequents : CDC boutique, equipes Business
