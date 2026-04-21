# P31 — Rattrapage de ligne (appels entrants KO)

**Categorie :** Debug / Diagnostic
**Serveur :** vmqprostdb01 (MOBI) / vmqproportawebdb01 (PortaDB)
**Utilisateur :** oracle / porta_pnmv3
**Declencheur :** Ticket RT — client injoignable sur appels entrants
**Temps moyen :** 30 min a 1h

---

## Contexte

Apres un changement de MSISDN rejete, un incident de portabilite, ou un rattrapage de ligne echoue, un client peut ne plus recevoir d'appels entrants. Le terminal fonctionne en sortant mais les appels entrants n'aboutissent pas (message "numero non attribue" pour les appelants).

Le "rattrapage" consiste a resynchroniser la ligne entre le CRM (MasterCRM) et le reseau pour retablir les appels entrants.

> **Attention :** Un rattrapage mal effectue peut lui-meme provoquer un effet de bord ("activation rejetee", ligne bloquee). Voir section "Effets de bord" ci-dessous.

## Symptomes

- Client injoignable sur appels entrants
- Appels sortants fonctionnent normalement
- Message "numero non attribue" quand on appelle le client
- Souvent suite a :
  - Changement MSISDN rejete (statut "rejete" dans l'historique CRM)
  - Incident de portabilite entrante
  - Rattrapage de ligne precedent echoue

## Tickets de reference

| Ticket | Contexte | Resolution |
|--------|----------|------------|
| #276534 | Anomalie appel entrant apres changement MSISDN rejete | Rattrapage ligne + relance terminal |
| #276148 | Incident lie a un rattrapage de ligne (activation rejetee) | Neutralisation action bloquante |
| #275894 | Incident de rattrapage CCARE | Rattrapage + verification |

## Etapes

### 1. Diagnostic — Verifier l'etat dans MOBI

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

Verifier :
- `LINE_STATUS` : doit etre actif. Si "activation rejetee" → voir section Effets de bord.
- `LINE_SIM_NO` : la SIM est-elle bien associee ?
- `LINE_PACK_CODE` : l'offre est-elle correcte ?

### 2. Diagnostic — Verifier l'historique des actions sur la ligne

```sql
-- Verifier les actions recentes sur la ligne (changement MSISDN, rattrapage, etc.)
SELECT LINE_NO, LINE_MSISDN_ACTIVE, LINE_STATUS, LINE_CHANGE
FROM LINE
WHERE LI_CUSTOMER_NO = XXXXXXX
ORDER BY LINE_CHANGE DESC;
```

> **Note :** La table `MSISDN_CHANGE_HISTORY` n'existe pas dans Oracle MOBI. L'historique des changements se consulte via la table `LINE` et les logs MasterCRM.

Si la ligne est en statut "activation rejetee" : le rattrapage precedent a echoue et la ligne est bloquee.

### 3. Diagnostic — Verifier dans PortaDB

```bash
ssh porta_pnmv3@vmqproportawebdb01
```

```sql
-- Verifier si un portage est en cours ou recent
mysql -e "SELECT msisdn, operateur_id_actuel, portage_id_actuel
FROM PortaDB.MSISDN
WHERE msisdn = '069XXXXXXX';"
```

Si `operateur_id_actuel != 2` (Digicel), le numero n'est plus chez Digicel — c'est un probleme de portabilite, pas de rattrapage.

### 4. Effectuer le rattrapage

Le rattrapage de la ligne est effectue cote reseau via MasterCRM. C'est une operation de re-provisioning qui resynchronise la ligne entre le CRM et le reseau.

Apres le rattrapage :
- Demander au client de **redemarrer son terminal** (eteindre/rallumer) pour forcer la reinscription sur le reseau
- Verifier que les appels entrants fonctionnent

### 5. Effets de bord possibles

Un rattrapage peut provoquer des effets de bord :

| Effet de bord | Description | Solution |
|---------------|-------------|----------|
| Activation rejetee | La ligne passe en statut "activation rejetee" apres le rattrapage | Neutraliser l'action bloquante dans MasterCRM |
| Ligne bloquee | La ligne ne repond plus du tout (ni entrant ni sortant) | Neutraliser l'action bloquante + relance terminal |

**Procedure de neutralisation :**
Quand la ligne passe en "activation rejetee" suite au rattrapage, il faut "neutraliser l'action bloquante" dans MasterCRM pour debloquer la ligne.

(Voir tickets #276148 et #276406 — activation rejetee apres rattrapage/manipulation)

### 6. Cas particulier : Resiliation forcee necessaire

Si la ligne est en "activation rejetee" et qu'une resiliation est necessaire pour reaffecter sur le bon dossier :
1. Forcer la resiliation de la ligne dans MasterCRM
2. Reaffecter le MSISDN sur le bon dossier
3. Informer le CDC : "La ligne est desormais resiliee."

(Voir ticket #276406 — activation rejetee + resiliation forcee pour client B2B)

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

## Notes operationnelles

- Le terme "rattrapage" designe la re-synchronisation de la ligne entre le CRM et le reseau (re-provisioning).
- Toujours demander au client de redemarrer son terminal apres un rattrapage.
- Les rattrapages de ligne peuvent provoquer des effets de bord — toujours verifier le statut de la ligne apres l'operation.
- Si le probleme persiste apres rattrapage + redemarrage terminal, escalader vers l'equipe reseau.
