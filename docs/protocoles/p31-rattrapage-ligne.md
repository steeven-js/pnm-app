# P31 — Rattrapage de ligne (appels entrants KO)

**Catégorie :** Debug / Diagnostic
**Serveur :** vmqprostdb01 (MOBI) / vmqproportawebdb01 (PortaDB)
**Utilisateur :** oracle / porta_pnmv3
**Déclencheur :** Ticket RT — client injoignable sur appels entrants
**Temps moyen :** 30 min à 1h

---

## Contexte

Après un changement de MSISDN rejeté, un incident de portabilité, ou un rattrapage de ligne échoué, un client peut ne plus recevoir d'appels entrants. Le terminal fonctionne en sortant mais les appels entrants n'aboutissent pas (message "numéro non attribué" pour les appelants).

Le "rattrapage" consiste à resynchroniser la ligne entre le CRM (MasterCRM) et le réseau pour rétablir les appels entrants.

> **Attention :** Un rattrapage mal effectué peut lui-même provoquer un effet de bord ("activation rejetée", ligne bloquée). Voir section "Effets de bord" ci-dessous.

## Symptômes

- Client injoignable sur appels entrants
- Appels sortants fonctionnent normalement
- Message "numéro non attribué" quand on appelle le client
- Souvent suite à :
  - Changement MSISDN rejeté (statut "rejeté" dans l'historique CRM)
  - Incident de portabilité entrante
  - Rattrapage de ligne précédent échoué

## Tickets de référence

| Ticket | Contexte | Résolution |
|--------|----------|------------|
| #276534 | Anomalie appel entrant après changement MSISDN rejeté | Rattrapage ligne + relance terminal |
| #276148 | Incident lié à un rattrapage de ligne (activation rejetée) | Neutralisation action bloquante |
| #275894 | Incident de rattrapage CCARE | Rattrapage + vérification |

## Étapes

### 1. Diagnostic — Vérifier l'état dans MOBI

```bash
su - oracle
sqlplus pb/gaston@MCST50A.BTC.COM
```

```sql
-- Verifier le statut de la ligne
SELECT LINE_NO, LINE_MSISDN_ACTIVE, LINE_STATUS, LINE_SIM_NO,
       LI_CUSTOMER_NO, LINE_PACK_CODE
FROM LINE
WHERE LINE_MSISDN_ACTIVE = '069XXXXXXX';
```

Vérifier :
- `LINE_STATUS` : doit être actif. Si "activation rejetée" → voir section Effets de bord.
- `LINE_SIM_NO` : la SIM est-elle bien associée ?
- `LINE_PACK_CODE` : l'offre est-elle correcte ?

### 2. Diagnostic — Vérifier l'historique des actions sur la ligne

```sql
-- Verifier les actions recentes sur la ligne (changement MSISDN, rattrapage, etc.)
SELECT LINE_NO, LINE_MSISDN_ACTIVE, LINE_STATUS, LINE_CHANGE
FROM LINE
WHERE LI_CUSTOMER_NO = XXXXXXX
ORDER BY LINE_CHANGE DESC;
```

> **Note :** La table `MSISDN_CHANGE_HISTORY` n'existe pas dans Oracle MOBI. L'historique des changements se consulte via la table `LINE` et les logs MasterCRM.

Si la ligne est en statut "activation rejetée" : le rattrapage précédent a échoué et la ligne est bloquée.

### 3. Diagnostic — Vérifier dans PortaDB

```bash
ssh porta_pnmv3@vmqproportawebdb01
```

```sql
-- Verifier si un portage est en cours ou recent
mysql -e "SELECT msisdn, operateur_id_actuel, portage_id_actuel
FROM PortaDB.MSISDN
WHERE msisdn = '069XXXXXXX';"
```

Si `operateur_id_actuel != 2` (Digicel), le numéro n'est plus chez Digicel — c'est un problème de portabilité, pas de rattrapage.

### 4. Effectuer le rattrapage

Le rattrapage de la ligne est effectué côté réseau via MasterCRM. C'est une opération de re-provisioning qui resynchronise la ligne entre le CRM et le réseau.

Après le rattrapage :
- Demander au client de **redémarrer son terminal** (éteindre/rallumer) pour forcer la réinscription sur le réseau
- Vérifier que les appels entrants fonctionnent

### 5. Effets de bord possibles

Un rattrapage peut provoquer des effets de bord :

| Effet de bord | Description | Solution |
|---------------|-------------|----------|
| Activation rejetée | La ligne passe en statut "activation rejetée" après le rattrapage | Neutraliser l'action bloquante dans MasterCRM |
| Ligne bloquée | La ligne ne répond plus du tout (ni entrant ni sortant) | Neutraliser l'action bloquante + relance terminal |

**Procédure de neutralisation :**
Quand la ligne passe en "activation rejetée" suite au rattrapage, il faut "neutraliser l'action bloquante" dans MasterCRM pour débloquer la ligne.

(Voir tickets #276148 et #276406 — activation rejetée après rattrapage/manipulation)

### 6. Cas particulier : Résiliation forcée nécessaire

Si la ligne est en "activation rejetée" et qu'une résiliation est nécessaire pour réaffecter sur le bon dossier :
1. Forcer la résiliation de la ligne dans MasterCRM
2. Réaffecter le MSISDN sur le bon dossier
3. Informer le CDC : "La ligne est désormais résiliée."

(Voir ticket #276406 — activation rejetée + résiliation forcée pour client B2B)

### 7. Fermer le ticket RT

```
Bonjour,
Rattrapage de la ligne effectué côté réseau.
Le client doit relancer son terminal (redémarrage).
Je ferme le ticket.
--
Cdt,
[Prénom NOM]
Équipe Application
```

## Notes opérationnelles

- Le terme "rattrapage" désigne la re-synchronisation de la ligne entre le CRM et le réseau (re-provisioning).
- Toujours demander au client de redémarrer son terminal après un rattrapage.
- Les rattrapages de ligne peuvent provoquer des effets de bord — toujours vérifier le statut de la ligne après l'opération.
- Si le problème persiste après rattrapage + redémarrage terminal, escalader vers l'équipe réseau.
