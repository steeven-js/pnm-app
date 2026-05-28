# P38 — Échec actions techniques après changement de SIM

**Catégorie :** Debug / Diagnostic
**Déclencheur :** Ticket RT — Client ne peut plus utiliser sa ligne après changement de SIM
**Serveur :** MasterCRM (vmqprotool01)
**Temps moyen :** 15 min à 1h (selon nombre d'actions en échec)
**Fréquence :** Régulière (~2-3 tickets/semaine)

---

## Contexte

Après un changement de carte SIM en boutique (PDV), certaines actions techniques peuvent échouer lors du reprovisioning de la ligne sur le réseau. La ligne apparaît comme "Active" dans MasterCRM mais les services ne fonctionnent pas (appels, data, roaming, etc.).

Le rattrapage automatique (automate RATP_OLN, voir P36) tente de relancer les actions échouées. Si le rattrapage échoue également, une intervention manuelle est nécessaire.

## Symptômes

- Client ne peut plus utiliser sa ligne après changement de SIM
- MasterCRM : Ligne Active mais actions techniques en statut "Rejetée"
- Actions concernées typiquement :
  - **ODL USIM illimité** : Rejetée
  - **Activation RoamingVoyage** : Rejetée
  - **Activation Double appel** : Terminée ou Rejetée
  - **Ajout CUG niveau Client** : Rejetée (normal pour les clients B2B avec CUG flotte)
  - **Reset du profil client TOTAL** : Terminée

## Étapes

### 1. Vérifier l'historique des actions techniques dans MasterCRM

Dans la fiche client MasterCRM :
- Onglet **Techniques** → **Historique du statut**
- Identifier les actions en statut **Rejetée**
- Vérifier si l'automate RATP_OLN a tenté un rattrapage (plusieurs séries d'actions à quelques minutes d'intervalle)

### 2. Identifier le type de client

| Type | Indicateur | Particularité |
|------|-----------|---------------|
| Grand public (GP) | Catégorie client Défaut | Actions standard |
| B2B / Entreprise | Catégorie B2B, CUG_XXXX | Ajout CUG rejetée = **normal** (CUG flotte nécessite config réseau spécifique) |
| Wizzee | OPERATION_ID = 217, MS_CLASS = 80 | Transmettre équipe Wizzee |

### 3. Identifier et débloquer les actions via SQL (méthode préférée)

Utiliser Toad for Oracle sur vmqprotool01 (base PB@MCST). Script : `Mise_en statut_rejeté_action_bloquée.sql`.

**Étape 1 : Récupérer le LINE_NO** dans MasterCRM (onglet Informations ou Techniques).

**Étape 2 : Rechercher les actions bloquées** (statut "Envoyée" = 1 ou autre statut bloquant) :

```sql
SELECT record_no, action_code, line_no, execution_status, folow_up_status, log_date
FROM send_actions
WHERE line_no = #LINE_NO
AND execution_status IN (1);
```

Colonnes utiles dans le résultat :

| Colonne | Description |
|---------|-------------|
| `record_no` | Identifiant unique de l'action (pour l'UPDATE) |
| `action_code` | Type d'action (ROAM = RoamingVoyage, USIM = ODL USIM, etc.) |
| `execution_status` | 0 = Déposée, 1 = Envoyée (bloquée), 2 = Programmée (date d'exécution future, normal), 5 = Échec, 10 = Terminée |
| `folow_up_status` | 14 = Rejetée (un seul L dans le nom du champ) |
| `log_date` | Date de l'action — si ancienne, l'action est bloquée |

**Étape 3 : Passer les actions bloquantes en échec** :

```sql
UPDATE send_actions
SET execution_status = 5, folow_up_status = 14
WHERE record_no IN (#RECORD_NO)
AND line_no = #LINE_NO
AND execution_status IN (1);
COMMIT;
```

> **Attention CUG :** Pour les clients B2B avec CUG, ne pas renvoyer l'action "Ajout CUG niveau Client". Le CUG doit être configuré spécifiquement par l'équipe réseau/MOBI.

**Étape 4 : Attendre le rattrapage RATP_OLN** qui relancera automatiquement les actions déposées.

### 4. Si le rattrapage échoue : escalader à MOBI

Si les actions restent en "Rejetée" après renvoi, transférer à l'équipe MOBI (Sarah Mogade) pour reprovisioning manuel :

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

### 5. Répondre au demandeur

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

**Après résolution :**
```
Bonjour,

Le reprovisioning de la ligne [MSISDN] a été effectué.
Le client peut tester sa ligne.

Cdt,
[Prénom NOM]
Équipe Application
```

## Cas particulier : Client B2B avec CUG

Pour les clients B2B (flotte entreprise), l'action "Ajout CUG niveau Client" est systématiquement rejetée lors d'un changement de SIM. C'est un comportement connu :
- Le CUG (Closed User Group) est un groupe de numéros fermé pour les flottes entreprise
- La configuration CUG nécessite une intervention spécifique de l'équipe MOBI/réseau
- L'automate EXPLOIT (voir P36) gère le nettoyage des CUG mais pas leur reconfiguration après changement de SIM

## Exemple réel — Ticket du 20/04/2026

**Client :** SARL J 2 (2016796) — B2B CUG_9352, Baie Mahault
**MSISDN :** 0690201376
**Ligne :** 7043049 — LIFE PRO 20Go Bloqué ANT SM 24
**Changement SIM :** 15/04/2026
**Demandeur :** Stéphanie Laday

Actions techniques du 16/04/2026 (rattrapage RATP_OLN x2) :

| Action | 14:45 | 14:50 |
|--------|-------|-------|
| Reset du profil client TOTAL | Terminée | Terminée |
| ODL USIM illimité | Rejetée | Rejetée |
| Activation Double appel | Terminée | Terminée |
| Activation RoamingVoyage | Rejetée | Rejetée |
| Ajout CUG niveau Client | Rejetée | Rejetée |

Ligne passée en "Active" à 14:55:47 mais services incomplets.
→ Escalade équipe MOBI pour reprovisioning ODL USIM + RoamingVoyage + CUG.

## Notes opérationnelles

- Le changement de SIM déclenche automatiquement un reprovisioning complet de la ligne
- L'automate RATP_OLN tente le rattrapage sous 24h (voir P36)
- Si après 2 tentatives RATP_OLN les actions sont toujours rejetées, le rattrapage automatique ne suffira pas
- Les tickets liés : #277038 (activation rejetée après changement SIM), SARL J 2 (20/04/2026)
- Demandeurs fréquents : CDC boutique, équipes Business
