# Scripts de Production PNM — Inventaire et Documentation

**Source :** `vmqproportawebdb01:/home/porta_pnmv3/scripts/` (+ `oracle@vmqprostdb01`)
**Utilisateur :** `porta_pnmv3` (sauf mention contraire)
**Serveur principal :** vmqproportawebdb01 (172.24.119.68)
**Derniere MAJ :** 27/03/2026

---

## Resume

| # | Script | Categorie | Planification | Description courte |
|---|--------|-----------|---------------|-------------------|
| 1 | Pnm-Verif-Bascule-MOBI.sh | Bascule | Jours ouvres, post-bascule | Verification bascule Porta/MOBI — email complet |
| 2 | Pnm-Verif-Bascule-MOBI_CCA.sh | Bascule | Jours ouvres, post-bascule | Version allegee pour CCA |
| 3 | Pnm-FNR_presence_V3.sh | Bascule | Quotidien | Verifie presence fichier fnr_action_v3.bh sur EMA |
| 4 | Pnm-Restitutions-Entrantes-Bascule.sh | Restitutions | Jours ouvres, 21h00 | MAJ MOBI pour restitutions entrantes (J-21) |
| 5 | Pnm-Restitutions-Sortantes-Bascule.sh | Restitutions | Jeudi 11h00 | MAJ MOBI pour restitutions sortantes saisies |
| 6 | Pnm-Restitutions-Sortantes-Tickets.sh | Restitutions | Lundi 06h00 | Creation tickets 3400 restitutions sortantes via WS |
| 7 | Pnm-Restitutions-Sortantes-Tickets-ratp.sh | Restitutions | Lundi 06h00 | Variante RATP des restitutions sortantes |
| 8 | Pnm_1110_DC_vers_UTS.sh | Tickets PNM | Post-vacation | Detection tickets 1110 DC→UTS pour mode degrade |
| 9 | Pnm_1210_awaiting.sh | Tickets PNM | Post 1ere vacation | Portages J+1 sans ticket 1210 |
| 10 | Pnm_tickets_awaiting.sh | Tickets PNM | Quotidien | Tickets 1210/1430/3430 en attente tous operateurs |
| 11 | Pnm_pso_lignes_non_resiliees.sh | PSO | Quotidien | Verification resiliations PSO non effectuees |
| 12 | Pnm_Facturation_Mensuelle_PEN.sh | Facturation | Mensuel | Facturation porta entrantes (PEN) par operateur |
| 13 | Pnm_Facturation_Mensuelle_PSO.sh | Facturation | Mensuel | Facturation porta sortantes (PSO) par operateur |
| 14 | Pnm_Facturation_Annuelle_PEN.sh | Facturation | Annuel | Bilan annuel PEN par operateur donneur |
| 15 | Pnm_Stats_Bascule_ESB.sh | Stats/Reporting | Quotidien | Stats ESB (appels WS Porta) du jour |
| 16 | PortaDB-export-csv.sh | Export | Quotidien 00h00 | Export tables PortaDB en CSV vers EMM (MIS) |
| 17 | check_refus_porta_rio_incorrect.sh | Reporting | Jours ouvres | Reporting refus porta motif RIO incorrect (R123) |
| 18 | find_temporary_msisdn.sh | Utilitaire | Manuel | Extraction MSISDN temporaires (erreur E610) |
| 19 | refus_porta_free_b2b.sh | Gestion | Automatique | Blocage porta B2B vers Free (RIO 02E*) |

---

## 1. Pnm-Verif-Bascule-MOBI.sh

**Categorie :** Bascule / Verification
**Auteur :** Frederick Vernon, David Aymeric
**Version :** 2.2 (19/01/2017)
**Planification :** Jours ouvres, apres bascule
**Serveur :** vmqproportawebdb01

**Description :**
Script principal de verification post-bascule. Compare les donnees PortaDB (MySQL) avec MOBI (Oracle) pour s'assurer que les portabilites ont ete correctement basculees dans le CRM.

**Operations :**
- Extraction portages prevus du jour depuis PortaDB
- Comparaison EmaExtracter (entrantes) et EmmExtracter (sortantes) avec MOBI Oracle
- Verification des bascules KO et prevues J+1
- Gestion MSISDN temporaires
- Envoi email HTML complet avec resultats

**Connexions :**
- MySQL PortaDB (local)
- Oracle MOBI : `pb/gaston@MCST50A.BTC.COM`

**Email :** `[PNMV3] Verification Bascule Porta MOBI` → fwi_pnm_si

---

## 2. Pnm-Verif-Bascule-MOBI_CCA.sh

**Categorie :** Bascule / Verification
**Auteur :** Frederick Vernon, David Aymeric
**Planification :** Jours ouvres, post-bascule

**Description :**
Version allegee du script de verification bascule, destinee au CCA (Customer Care). Memes verifications mais avec un format de sortie adapte.

---

## 3. Pnm-FNR_presence_V3.sh

**Categorie :** Bascule / Controle
**Serveur :** oracle@vmqprostdb01
**Planification :** Quotidien

**Description :**
Verifie la presence du fichier `fnr_action_v3.bh` sur le serveur EMA (`digimqema01`). Le fichier contient les commandes FNR (Forward Number Routing) generees par la bascule.

**Operations :**
1. SSH vers `batchusr@digimqema01` pour chercher `fnr_action_v3.bh` (retry 15x toutes les 30s)
2. Attend le fichier log `fnr_action_v3.bh.log`
3. Calcule le pourcentage de commandes OK
4. Envoie email avec resultat + fichier .nok en PJ si erreurs

**Email :** `[PNM] Presence batchhandler FNR_V3 sur EMA` → frederick.vernon

---

## 4. Pnm-Restitutions-Entrantes-Bascule.sh

**Categorie :** Restitutions
**Auteur :** David Aymeric
**Version :** 1.1 (26/10/2015)
**Planification :** Jours ouvres, 21h00

**Description :**
Gere les restitutions entrantes (numeros qui reviennent chez Digicel apres portage sortant). Extrait de PortaDB les MSISDN en etat 55 (cloture) a J-21 et met a jour leur statut dans MOBI Oracle.

**Requete cle (PortaDB) :**
```sql
SELECT DISTINCT(DATA.msisdn) FROM PORTAGE, DATA
WHERE PORTAGE.etat_id_actuel = 55
AND date(PORTAGE.date_portage) = date_rest  -- J-21
AND concat(DATA.code_ticket, DATA.operateur_origine) IN ('34301','34303','34304','34305','34306')
GROUP BY DATA.msisdn HAVING count(DISTINCT(...)) = 5;
```

**MAJ MOBI :**
```sql
UPDATE MSISDN SET ST_MSISDN_ID='0', MSISDN_STATUS='0', MSISDN_CHANGE=TRUNC(SYSDATE)
WHERE msisdn_no IN (...) AND ST_MSISDN_ID='7' AND MSISDN_STATUS IN ('0','1');
```

---

## 5. Pnm-Restitutions-Sortantes-Bascule.sh

**Categorie :** Restitutions
**Auteur :** David Aymeric, Marc Mavinga
**Version :** 2.0 (28/08/2014)
**Planification :** Jeudi 11h00

**Description :**
Gere les restitutions sortantes lors de la bascule. Extrait les MSISDN en etat 56 (saisi) avec ticket 3400 et met a jour leur statut dans MOBI (ST_MSISDN_ID='7').

**MAJ MOBI :**
```sql
UPDATE MSISDN SET ST_MSISDN_ID='7', MSISDN_STATUS='0', MSISDN_CHANGE=TRUNC(SYSDATE)
WHERE msisdn_no IN (...);
```

---

## 6. Pnm-Restitutions-Sortantes-Tickets.sh

**Categorie :** Restitutions
**Auteur :** David Aymeric
**Planification :** Lundi 06h00

**Description :**
Cree les tickets de restitution sortante (3400) dans PortaDB via appel SOAP au Web Service Porta. Extrait les MSISDN a restituer depuis MOBI Oracle, calcule les dates (demande + portage J+4 ouvres), et appelle `CreatePortaRestitution` pour chaque MSISDN.

**Web Service :**
- URL : `http://172.24.119.72:8080/PortaWs/DigicelFwiPortaWs4Esb`
- Action : `urn:CreatePortaRestitution`

**Mapping operateurs MOBI→Porta :**
| Code MOBI | Operateur | Code Porta |
|-----------|-----------|------------|
| 211/215/217 | Orange | 01 |
| 212 | Dauphin | 04 |
| 213/216/218 | OMT/SFR | 03 |
| 214 | UTS | 05 |
| 219/220/221 | Free | 06 |

---

## 7. Pnm-Restitutions-Sortantes-Tickets-ratp.sh

**Categorie :** Restitutions
**Planification :** Lundi 06h00

**Description :**
Variante RATP du script de restitutions sortantes. Utilise un fichier SQL different (`MOBI-Extract-Restitutions_Sortantes-ratp.sql`) pour la selection des MSISDN. Meme logique WS que le script standard.

---

## 8. Pnm_1110_DC_vers_UTS.sh

**Categorie :** Tickets PNM / Mode degrade
**Planification :** Post-vacation (apres echanges fichiers)

**Description :**
Detecte les tickets 1110 (demande portabilite entrante) transmis a UTS dans les 2 dernieres heures. UTS ne gere pas les tickets par fichier PNMDATA — il faut creer manuellement le fichier de vacation avec le ticket 1210.

**Requete :** Tickets 1110 avec OPO=2 (Digicel) et OPD=5 (UTS), source='out', crees dans les 2h.

**Email :** `[PNM] Ticket(s) 1110 transmis a UTS` → fwi_pnm_si

---

## 9. Pnm_1210_awaiting.sh

**Categorie :** Tickets PNM / Surveillance
**Planification :** Apres 1ere vacation

**Description :**
Verifie les portages prevus a J+1 qui n'ont pas encore recu de ticket 1210 (acceptation). Alerte par operateur (OC, SFRC, DT, UTS, FREEC). Gere le cas du vendredi (J+3 au lieu de J+1).

**Email :** `[PNM] Ticket(s) 1210 en attente` → fwi_pnm_si

---

## 10. Pnm_tickets_awaiting.sh

**Categorie :** Tickets PNM / Surveillance
**Planification :** Quotidien

**Description :**
Script complet de surveillance des tickets en attente : 1210 (acceptation J+1), 1430 (confirmation portage), 3430 (confirmation restitution) pour tous les operateurs. Envoie un rapport detaille par operateur.

**Email :** `[PNM] Ticket(s) en attente` → fwi_pnm_si

---

## 11. Pnm_pso_lignes_non_resiliees.sh

**Categorie :** PSO / Controle
**Planification :** Quotidien

**Description :**
Identique au script `Pnm_1110_DC_vers_UTS.sh` dans sa structure. Verifie les lignes PSO (portabilite sortante) dont la resiliation n'a pas ete effectuee dans MOBI. Alerte pour action manuelle via SoapUI (Cas Pratique #18).

---

## 12. Pnm_Facturation_Mensuelle_PEN.sh

**Categorie :** Facturation
**Planification :** Mensuel

**Description :**
Genere le rapport de facturation mensuelle pour les portabilites entrantes (PEN). Extrait les tickets 1410 (portage effectif) par operateur donneur (OC, SFRC, DT, UTS, FREEC) pour le mois ecoule. Distingue mandats simples et multiples.

**Destinataires :** fwi_pnm_si + jessy.lacaste + maeva.morgar + comptafournisseurs

---

## 13. Pnm_Facturation_Mensuelle_PSO.sh

**Categorie :** Facturation
**Planification :** Mensuel

**Description :**
Genere le rapport de facturation mensuelle pour les portabilites sortantes (PSO). Extrait les tickets 1210 par operateur receveur. Meme structure que PEN mais cote sortant.

**Destinataires :** fwi_pnm_si + jessy.lacaste + maeva.morgar + compta.clients

---

## 14. Pnm_Facturation_Annuelle_PEN.sh

**Categorie :** Facturation
**Planification :** Annuel

**Description :**
Bilan annuel des portabilites entrantes facturees a Digicel, par operateur donneur. Somme des mandats simples et multiples sur l'annee ecoulee.

**Email :** `[PNMV3] Facturation PEN globale sur l'annee YYYY` → fwi_pnm_si

---

## 15. Pnm_Stats_Bascule_ESB.sh

**Categorie :** Stats / Reporting
**Planification :** Quotidien

**Description :**
Collecte les statistiques ESB (appels Web Services Porta) du jour depuis la base LOGGER sur le serveur ESB (172.24.5.48). Genere un fichier XLS avec les actions WS, succes/echecs. Gere les jours feries.

**Connexion ESB :** `application/application@172.24.5.48:LOGGER`

**Email :** `[PNMV3] Stats ESB Porta` → fwi_pnm_si

---

## 16. PortaDB-export-csv.sh

**Categorie :** Export / MIS
**Auteur :** David Aymeric
**Version :** 1.1 (11/01/2013)
**Planification :** Quotidien 00h00

**Description :**
Export quotidien de 16 tables PortaDB en fichiers CSV vers le serveur EMM (172.24.27.144) pour les besoins MIS (reporting). Export MySQL → CSV, SCP vers EMM, renommage .tmp → .csv.

**Tables exportees :** ACK, CODE_REPONSE, CODE_TICKET, DATA, DOSSIER, ETAT, FERRYDAY, FICHIER, MSISDN, MSISDN_HISTORIQUE, OPERATEUR, PORTAGE, PORTAGE_DATA, PORTAGE_HISTORIQUE, TRANCHE, TRANSITION

**Serveur EMM :** `pnm@172.24.27.144:/mediation/DIGICEL/input/PORTA/`

---

## 17. check_refus_porta_rio_incorrect.sh

**Categorie :** Reporting / Fraude
**Planification :** Jours ouvres (J-1, ou J-3 le lundi)

**Description :**
Reporting quotidien sur les refus de portabilite avec motif RIO incorrect (code R123). Suspicion de fraude en masse. Compte les refus entrantes et sortantes, identifie les MSISDN provisoires.

**Email :** `[PNM] Reporting sur les cas de refus avec motif RIO incorrect` → fwi_pnm_si + equipe fraude

---

## 18. find_temporary_msisdn.sh

**Categorie :** Utilitaire / Debug
**Auteur :** FAR-FVE (10/01/2017)
**Planification :** Manuel

**Description :**
Recherche les MSISDN temporaires associes a des portages ayant declenche une erreur E610 (flux non attendu). Parcourt les logs Glassfish pour retrouver le MSISDN temporaire attribue.

**Usage :** Alimentation manuelle du fichier `Id_portage.txt`, execution, resultat dans `Result_msisdn_maj.txt`.

---

## 19. refus_porta_free_b2b.sh

**Categorie :** Gestion / Blocage
**Planification :** Automatique

**Description :**
Detecte et bloque les demandes de portabilite B2B vers Free Caraibe (RIO commencant par `02E`). Met a jour l'etat du portage de 15 a 17 (bloque) dans PortaDB.

**Logique :**
```sql
-- Detection
SELECT msisdn FROM PORTAGE WHERE id_portage IN (
  SELECT id_portage FROM DATA WHERE source='in' AND code_ticket IN ('1110','1120')
  AND operateur_origine=6 AND rio LIKE '02E%'
) AND etat_id_actuel=15 AND date_fin IS NULL;

-- Blocage
UPDATE PORTAGE SET etat_id_actuel=17 WHERE ...;
```

**Email :** `[PNM] Gestion des portabilites B2B vers Free Caraibe` → fwi_pnm_si + elisabeth.ozierlafontaine

---

## Connexions utilisees

| Systeme | Host | User | Base | Usage |
|---------|------|------|------|-------|
| PortaDB (MySQL) | localhost (172.24.119.68) | exploit/mdpalc03 | PortaDB | Tous scripts |
| MOBI (Oracle) | MCST50A.BTC.COM | pb/gaston | MasterCRM | Bascule, Restitutions |
| ESB (MySQL) | 172.24.5.48 | application/application | LOGGER | Stats ESB |
| EMA | digimqema01 | batchusr | — | FNR batchhandler |
| EMM | 172.24.27.144 | pnm | — | Export CSV MIS |

## Emails automatiques

| Script | Objet email | Destinataires principaux |
|--------|------------|-------------------------|
| Verif-Bascule-MOBI | [PNMV3] Verification Bascule Porta MOBI | fwi_pnm_si |
| FNR_presence | [PNM] Presence batchhandler FNR_V3 sur EMA | frederick.vernon |
| 1110_DC_vers_UTS | [PNM] Ticket(s) 1110 transmis a UTS | fwi_pnm_si |
| 1210_awaiting | [PNM] Ticket(s) 1210 en attente | fwi_pnm_si |
| tickets_awaiting | [PNM] Ticket(s) en attente | fwi_pnm_si |
| Facturation PEN | [PNMV3] Facturation PEN | fwi_pnm_si + compta |
| Facturation PSO | [PNMV3] Facturation PSO | fwi_pnm_si + compta |
| Stats ESB | [PNMV3] Stats ESB Porta | fwi_pnm_si |
| Refus RIO | [PNM] Reporting refus RIO incorrect | fwi_pnm_si + fraude |
| Free B2B | [PNM] Gestion porta B2B vers Free | fwi_pnm_si |
