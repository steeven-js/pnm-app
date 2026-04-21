# P39 — Deblocage actions bloquantes en statut "Envoye" (send_actions)

**Categorie :** Debug / Diagnostic
**Declencheur :** Ticket RT — Client ne peut pas utiliser sa ligne, actions techniques bloquees en statut "Envoye"
**Serveur :** vmqprotool01 (Toad for Oracle, PB@MCST)
**Temps moyen :** 15 min (+ attente rattrapage RATP_OLN)
**Frequence :** Occasionnelle
**Source :** Procedure Sarah Mogade

---

## Contexte

Il arrive qu'une action technique reste bloquee en statut "Envoye" (execution_status = 1) dans la table `send_actions`. Cette action bloquante empeche les actions suivantes de s'executer, ce qui laisse la ligne dans un etat inutilisable (pas d'appels, pas de data, etc.).

Ce cas se produit typiquement apres :
- Une portabilite entrante (changement de MSISDN)
- Un changement de SIM
- Un changement d'offre

La solution consiste a passer l'action bloquante en statut "Echec" pour debloquer la file, puis laisser l'automate RATP_OLN (voir P36) relancer les actions deposees.

## Symptomes

- Client ne peut pas utiliser sa ligne (appels, data, SMS)
- MasterCRM : Ligne Active mais actions techniques en statut "Envoyee" depuis longtemps (pas de progression)
- Les actions suivantes restent en statut "Deposee" car bloquees par l'action "Envoyee"

## Statuts de la table send_actions

| execution_status | Signification |
|-----------------|---------------|
| 0 | Deposee (en attente) |
| 1 | **Envoyee** (en cours d'envoi — si bloquee, c'est le probleme) |
| 5 | En echec |
| 10 | Terminee |

| folow_up_status | Signification |
|----------------|---------------|
| 14 | Rejetee (force manuellement) |

## Etapes

### 1. Identifier le LINE_NO

Dans MasterCRM, ouvrir la fiche client et noter le **LINE_NO** de la ligne concernee (visible dans l'onglet Informations ou Techniques).

### 2. Rechercher les actions bloquantes

Sur vmqprotool01 (Toad for Oracle, base PB@MCST) :

```sql
-- Recuperation des actions en statut "Envoye" (bloquantes)
SELECT *
FROM send_actions
WHERE line_no = #LINE_NO
AND execution_status IN (1);
```

Noter le(s) `record_no` des actions bloquantes.

### 3. Passer les actions en echec

```sql
-- Passage en statut echec pour debloquer la file
UPDATE send_actions
SET execution_status = 5, folow_up_status = 14
WHERE record_no IN (#RECORD_NO)
AND line_no = #LINE_NO
AND execution_status IN (1);
COMMIT;
```

> **Attention :** Ne modifier que les actions identifiees en statut 1 (Envoyee). Ne pas toucher aux actions en statut 0 (Deposee) ou 10 (Terminee).

### 4. Verifier dans MasterCRM

Apres l'UPDATE, verifier dans l'onglet Techniques de MasterCRM :
- L'action bloquante doit apparaitre en **"Rejetee"**
- Les actions en attente (Deposee) doivent rester en l'etat

### 5. Attendre le rattrapage RATP_OLN

L'automate RATP_OLN (voir P36) va automatiquement relancer les actions deposees maintenant que l'action bloquante a ete retiree de la file.

Si le rattrapage ne se fait pas dans les 2h, verifier :
- Que RATP_OLN a bien tourne (rapport automates quotidien)
- Si necessaire, relancer manuellement les actions depuis MasterCRM (bouton "Renvoyer l'action")

### 6. Repondre au demandeur

**En attente de rattrapage :**
```
Bonjour,

L'action bloquante a ete identifiee et corrigee.
Le rattrapage automatique est en cours, la ligne devrait
etre pleinement fonctionnelle sous peu.

Cdt,
[Prenom NOM]
Equipe Application
```

**Apres resolution :**
```
Bonjour,

La ligne [MSISDN] est retablie.
Le client peut tester ses appels et sa data.

Cdt,
[Prenom NOM]
Equipe Application
```

## Difference avec P38

- **P38** : Actions en statut **"Rejetee"** apres changement de SIM → renvoi ou escalade MOBI
- **P39** : Action en statut **"Envoyee"** bloquee indefiniment → passage force en echec via SQL pour debloquer la file

## Notes operationnelles

- Cette procedure a ete fournie par Sarah Mogade
- Le champ s'appelle bien `folow_up_status` (un seul L) dans la table
- Toujours verifier que l'action est bien bloquee (en statut 1 depuis longtemps) avant de la forcer en echec
- Si plusieurs actions sont en statut 1, les passer toutes en echec
- Le rattrapage RATP_OLN se fait automatiquement, pas besoin d'intervention manuelle dans la plupart des cas
