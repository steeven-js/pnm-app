# Contexte PNM - Portabilite des Numeros Mobiles chez Digicel

> Document de reference pour le projet pnm-app.
> Consolide a partir des ressources du dossier Porta_Steeven (fevrier 2026).
> Ce fichier contient toute la logique, le raisonnement et les procedures de fonctionnement de la portabilite PNM chez Digicel zone Antilles-Guyane.

---

## 1. Vue d'ensemble

### 1.1 Qu'est-ce que la PNM ?

La **Portabilite des Numeros Mobiles (PNM)** permet a un abonne mobile de changer d'operateur tout en conservant son numero de telephone. Dans la zone **Antilles-Guyane**, ce processus est regi par le **GPMAG** (Groupe Portabilite Mobile Antilles Guyane) et encadre par les decisions ARCEP.

### 1.2 Version actuelle : PNM V3

La version V3 (depuis 2012) introduit :
- Le **Guichet Unique** : l'abonne effectue toutes les demarches aupres de l'operateur receveur (OPR) uniquement
- Le **RIO** (Releve d'Identite Operateur) : code unique identifiant l'abonne chez son operateur
- Le **delai de portage reduit** : JD+2 jours ouvres (au lieu de 10 jours auparavant)
- Base reglementaire : Decision ARCEP n2012-0576 du 10 Mai 2012

### 1.3 Operateurs du GPMAG

| Code | Operateur | Code FNR (ancien) | Nouveaux prefixes 2024 (par territoire) |
|------|-----------|-------------------|----------------------------------------|
| 01 | Orange Caraibe | ~~60041~~ | **52303** (GP) / **52313** (MQ) / **52333** (GY) — actif 08/04/2026 |
| 02 | Digicel AFG | 60042 | 52301 (GP) / 52311 (MQ) / 52331 (GY) — stand-by |
| 03 | Outremer Telecom / SFR | 60044 | 52300 (GP) / 52310 (MQ) / 52330 (GY) — stand-by |
| 04 | Dauphin Telecom | 60043 | 52304 (GP) — stand-by |
| 05 | UTS Caraibe | 60045 | — |
| 06 | Free Caraibes | 60048 | — |

### 1.4 Contacts GPMAG

- **Orange Caraibe** : gerard.chenevier@orange.com / oag.pnm-si@orange.com
- **SFR Caraibe** : g.honore@outremer-telecom.fr / pnm@outremer-telecom.fr
- **Dauphin Telecom** : latifa.annachachibi@dauphintelecom.com / daniel.saintfleur@dauphintelecom.com
- **UTS** : winifred.tjinasioe@cwc.com / martin.paquette@libertycaribbean.com / uts-french-portability@cwc.com
- **Free Caraibe** : fmerleremond@iliad-free.fr / pan@fm.proxad.net

---

## 2. Lexique et definitions

| Terme | Definition |
|-------|-----------|
| **PNM** | Portabilite des Numeros Mobiles |
| **MNP** | Mobile Number Portability (equivalent anglais) |
| **DAPI** | Digicel Application Portability Interface |
| **GPMAG** | Groupe Portabilite Mobile Antilles Guyane |
| **OPR** | Operateur Receveur - celui vers qui le numero est porte |
| **OPD** | Operateur Donneur - celui qui perd le numero |
| **OPA** | Operateur Attributaire - a qui appartient la tranche du MSISDN |
| **RIO** | Releve d'Identite Operateur |
| **MSISDN** | Numero mobile porte |
| **GU** | Guichet Unique |
| **FNR** | Fichier National de Routage |
| **CRM** | Customer Relationship Management |
| **ESB** | Enterprise Service Bus |
| **BdP SI** | Base de donnees de portage SI |
| **BdP reseau** | Base de donnees de portage reseau (pour le routage des appels) |
| **Bascule SIM** | Changement de l'ancienne carte SIM (OPD) par la nouvelle (OPR) |
| **Jour ouvre (JD)** | Jour de la semaine travaille (hors samedi, dimanche et jours feries) |
| **Heures ouvrees** | De 9H a 18H, du lundi au vendredi (hors jours feries nationaux et DOM) |
| **Flotte** | Entreprise/association avec demande de portage > 20 numeros |
| **Vacation** | Creneau d'echange de fichiers inter-operateurs |

---

## 3. Processus client - Parcours en 4 phases

### Phase 1 : Acces a l'information prealable
- L'abonne demande son **RIO** a son operateur actuel (OPD)
- Le RIO est un code alphanumerique de 12 caracteres (ex: `02P131780R0W`)
- Il est compose de : code operateur + type client + 6 chars du numero client + CCC (3 chars de controle)

### Phase 2 : Souscription avec demande de conservation du numero
- L'abonne se presente chez le nouvel operateur (OPR)
- Il fournit son **RIO**, signe le **Mandat de portage et de resiliation**
- L'OPR verifie l'eligibilite via le RIO (CheckEligibility)
- L'OPR transmet la demande de portage a l'OPD

### Phase 3 : Suivi de la demande
- L'OPD repond : acceptation (ticket RP/1210) ou refus (ticket RP/1220)
- En cas d'acceptation, l'OPR confirme l'envoi des donnees de portage (ticket EP/1410)
- L'OPD confirme l'operation (ticket CP/1430)

### Phase 4 : Bascule
- La bascule SIM est realisee le jour JP (JD+2 jours ouvres)
- L'ancienne SIM est desactivee, la nouvelle est activee
- Les mises a jour reseau sont propagees a tous les operateurs

---

## 4. Echanges inter-operateurs

### 4.1 Architecture globale

- Communication par **envoi de fichiers en sFTP** a chacun des autres operateurs
- Integration des fichiers recus dans le SI
- Architecture distribuee : chaque operateur maintient sa propre BdP SI

### 4.2 Vacations et calendrier

**3 vacations journalieres** par jour ouvre + 1 synchro le dimanche :

| Vacation | Horaires |
|----------|----------|
| Vacation 1 | 10H - 11H |
| Vacation 2 | 14H - 15H |
| Vacation 3 | 19H - 20H |
| Synchronisation | Dimanche 22H - 24H |

### 4.3 Fichiers echanges

#### Nommage
- **PNMDATA** : fichiers de vacation (portage)
  - Format : `PNMDATA.{emetteur}.{destinataire}.{YYYYMMDDhhmmss}.{version}`
  - Exemple : `PNMDATA.02.01.20260105100001.001` (Digicel -> Orange)
- **PNMSYNC** : fichiers de synchronisation
  - Format : `PNMSYNC.{emetteur}.{destinataire}.{YYYYMMDDhhmmss}.{version}`

#### Types de transfert
- sFTP sur le port 22
- Connexion : `sftp -oPort=22 pnm_02@193.251.160.208`
- Mode debug : `sftp -oLoglevel=DEBUG3 -oPort=22 pnm_02@193.251.160.208`

### 4.4 Definition des tickets de portage

| Code | BU | Description |
|------|----|-------------|
| **DP** | 1110 | Demande de portage pour un particulier |
| **DE** | 1120 | Demande de portage pour une personne morale |
| **RP** | 1210 | Reponse : acceptation de la demande |
| **RP** | 1220 | Reponse : refus de la demande |
| **EP** | 1410 | Envoi des donnees de portage |
| **CP** | 1430 | Confirmation de l'operation de portage |
| **AP** | 1510 | Annulation OPR d'une demande avant information des operateurs |
| **AN** | 1520 | Annulation OPD d'un numero d'une demande |
| **CA** | 1530 | Confirmation d'annulation (OPR) ou d'un numero (OPD) |
| **BI** | 2400 | Bon accord pour portage inverse |
| **PI** | 2410 | Envoi des donnees de portage inverse |
| **DI** | 2420 | Confirmation prise en compte et date de portage inverse |
| **CI** | 2430 | Confirmation portage inverse |
| **BR** | 3400 | Bon accord pour restitution |
| **RN** | 3410 | Envoi des donnees de restitution a tous les operateurs |
| **RS** | 3420 | Prise en compte des donnees de restitution |
| **RC** | 3430 | Confirmation de la mise a jour de chacun des operateurs |
| **ER** | 7000 | Erreurs et dysfonctionnements |

### 4.5 Diagramme de sequence simplifie

```
Abonne -> OPR : Demande de portage (RIO + mandat)
OPR -> OPD : Ticket DP/DE (demande)
OPD -> OPR : Ticket RP (acceptation ou refus)
  [Si accepte]
OPR -> OPD : Ticket EP (envoi donnees)
OPD -> OPR : Ticket CP (confirmation)
  [Bascule SIM a JP = JD+2]
OPR -> Tous : Mise a jour reseau (PNMDATA)
```

---

## 5. Architecture technique Digicel

### 5.1 Composants principaux

```
                  +------------------+
                  |   PortaWebUi     |  (Interface utilisateur web)
                  | vmqproportaweb01 |
                  +--------+---------+
                           |
                  +--------v---------+
                  |      DAPI        |  (Digicel Application Portability Interface)
                  | vmqproportaweb01 |
                  +--------+---------+
                           |
              +------------+------------+
              |                         |
     +--------v---------+    +---------v--------+
     |    PortaSync      |    |       ESB        |
     | vmqproportasync01 |    |  (DataPower)     |
     +-------------------+    +------------------+
              |                         |
     +--------v---------+    +---------v--------+
     |    PortaDB        |    |   SI Digicel     |
     | vmqproportawebdb01|    | (CRM, MOBI, etc) |
     +-------------------+    +------------------+
```

### 5.2 Serveurs

| Serveur | Role |
|---------|------|
| **vmqproportasync01** | Scripts PortaSync, bascule, valorisation |
| **vmqproportawebdb01** | Base PortaDB, scripts de restitution, exports CSV |
| **vmqproportaweb01** | PortaWebUi (interface web), DAPI |
| **BTCTF** | Synchronisation sFTP inter-operateurs |

### 5.3 Interfaces (Web Services)

| WS | Heberge sur | URL | Utilise par |
|----|-------------|-----|-------------|
| DigicelFwiEsbWs4Porta | ESB | http://172.24.5.42:80/services/DigicelFwiEsbWs4Porta?wsdl | DAPI |
| DigicelFwiPortaWs4Esb | DAPI | http://172.24.119.72:8080/PortaWs/DigicelFwiPortaWs4Esb?wsdl | PortaWebUi |
| DigicelFwiPortaWs4PortaSync | DAPI | http://172.24.119.72:8080/PortaWs/DigicelFwiPortaWs4PortaSync?wsdl | PortaSync |
| DigicelFwiPortaUiWs4Esb | DAPI | http://172.24.119.71:8080/PortaWebUi/DigicelFwiPortaUiWs4Esb?wsdl | WebStore |

- DAPI transmet les evenements de portabilite a l'ESB via `DigicelFwiEsbWs4Porta.wsdl`
- Configuration dans la base : `PortaDB.web_config.code = 'esb.wsdlLocation'`
- URL ESB : http://172.24.116.76:8000

### 5.4 Micro-services

#### MSLine
- **CheckEligibility** : verification du RIO pour eligibilite au portage
- **Remplacement du ESB.getLineInformations()** : recuperation des nom/prenom associes au numero provisoire lors de la saisie dans PortaWebUi

#### MSPorta
- **NotifyPorta** quand porta sortante est acceptee
- **NotifyPorta** quand porta sortante/entrante est cloturee

---

## 6. Scripts et planification

### 6.1 Scripts PortaSync (vmqproportasync01)

Utilisateur : `porta_pnmv3`
Dossier : `/home/porta_pnmv3/PortaSync`

| Script | Action | Planification |
|--------|--------|---------------|
| **EmaExtracter.sh** | Traitement bascule + generation fichier routage FNR + envoi via EMA | Lun-Ven a 9H00 |
| **EmmExtracter.sh** | Generation + envoi fichier MSISDN portes vers EMM | Lun-Ven a 9H00 |
| **PnmDataManager.sh** | Generation des fichiers de vacation PNMDATA | Lun-Ven 10H, 14H, 19H |
| **PnmDataAckManager.sh** | Integration fichiers PNMDATA + generation acquittements | Via synchro-pnmv3.sh |
| **PnmDataAckGenerator.sh** | Verification acquittements + generation fichiers erreur | Via synchro-pnmv3.sh |
| **PnmSyncManager.sh** | Generation fichiers de synchronisation PNMSYNC | Dimanche 23H |
| **PnmSyncAckManager.sh** | Integration fichiers PNMSYNC + generation acquittements | Via synchro-pnmv3.sh |
| **PnmMerger.sh** | Merge de fichier (non utilise) | - |
| **PnmSpliter.sh** | Split de fichier (non utilise) | - |

### 6.2 Script de synchronisation sFTP (BTCTF)

| Script | Action | Planification |
|--------|--------|---------------|
| **synchro-pnmv3.sh** | Integration (copie recv + PnmAckManager) + Envoi/archivage (send -> arch_send) | Lun-Ven toutes les 10 min [10h-12h] [14h-16h] [19h-21h] + Dimanche [22h-24h] |

### 6.3 Scripts base de donnees (vmqproportawebdb01)

| Script | Action | Planification |
|--------|--------|---------------|
| **PortaDB-export-csv.sh** | Export tables PortaDB en CSV pour MIS | Tous les jours a 00H00 |
| **Pnm-Verif-Bascule-MOBI** | Validation mise a jour MSISDN/resiliations dans MOBI vs bascules PortaDB | Apres la bascule |
| **Pnm-Restitutions-Sortantes-Tickets.sh** | Extract resiliations hors tranche MOBI + creation tickets 3400 | Jeudis a 10H45 (resiliations S-4) |
| **Pnm-Restitutions-Sortantes-Bascule.sh** | Extract restitutions sortantes + Update MOBI (msisdn_status, st_msisdn_id) | Jeudis a 11H00 |
| **Pnm-Restitutions-Entrantes-Bascule.sh** | Extract restitutions entrantes + Update MOBI | Lun-Ven a 21H25 |

### 6.4 Arborescence fichiers PortaSync

```
/home/porta_pnmv3/PortaSync/
  |-- log/                     # Logs des scripts
  |     |-- EmaExtracter.log
  |     |-- EmmExtracter.log
  |     |-- PnmDataManager.log
  |     |-- PnmAckManager.log
  |     |-- PnmSyncAckManager.log
  |-- pnmdata/
  |     |-- 01/                # Orange Caraibe
  |     |     |-- recv/        # Fichiers recus
  |     |     |-- send/        # Fichiers a envoyer
  |     |     |-- arch_recv/   # Archives reception
  |     |     |-- arch_send/   # Archives envoi
  |     |-- 03/                # OMT/SFR
  |     |-- 04/                # Dauphin
  |     |-- 05/                # UTS
  |     |-- 06/                # Free
```

---

## 7. Procedures d'exploitation quotidiennes

### 7.1 A 9H - Verification de la bascule

1. Se connecter a `vmqproportasync01` en tant que `porta_pnmv3`
2. Verifier le log de bascule :
   ```bash
   tail -n 12 /home/porta_pnmv3/PortaSync/log/EmaExtracter.log
   ```
   Attendu : tous les operateurs en `Check success` + nombre de bascules
3. Verifier le log de valorisation :
   ```bash
   tail -n 12 /home/porta_pnmv3/PortaSync/log/EmmExtracter.log
   ```
   Attendu : tous les operateurs en `Check success`

### 7.2 Avant 10H - Verification des tickets en attente (portages entrantes)

> A effectuer avant la 1ere vacation. Particulierement important pour **Dauphin Telecom** qui a des delais de reponse plus longs.

**Objectif :** Identifier les portages entrantes "En cours" en attente de reponse de l'operateur donneur (ticket 1210 manquant). Ces portages risquent d'etre en retard si l'OPD ne repond pas avant la vacation.

**1. Verifier le mail automatique :**
- Objet : `[EXTERNAL] [PNM] Ticket(s) en attente`
- Expediteur : `porta_pnmv3 <fwi_pnm_si@digicelgroup.com>`
- Contient en PJ un fichier `PNM_DT_Tickets-{date}.xls` avec les colonnes : `msisdn`, `id_portage`, `date_portage`, `ticket_manquant`
- Le ticket manquant est generalement le **1210** (reponse acceptation/refus de l'OPD)
- Ce mail est envoye automatiquement a FWI_PNM_SI et au contact de l'operateur concerne

**2. Verifier sur le portail Admin Portal :**
- URL : http://172.24.119.72:8080/PortaWs/index.jsp?m=listPortage
- Filtrer : `En cours` = coche, `Etat` = `3-entrante-En cours`
- Identifier les portages dont la date de portage est depassee ou imminente
- Verifier en priorite les portages en provenance de **Dauphin Telecom** (code operateur 04)

**3. Actions correctives :**
- Relancer l'operateur donneur par mail pour obtenir une reponse (ticket 1210)
- Contacts Dauphin Telecom : `latifa.annachachibi@dauphintelecom.com` / `daniel.saintfleur@dauphintelecom.com`
- Si le retard persiste, escalader en interne via le mail `FWI_PNM_SI@digicelgroup.fr`

### 7.3 A 10H15 - Verification 1ere vacation

1. Verifier la generation des fichiers PNMDATA :
   ```bash
   tail -n 14 /home/porta_pnmv3/PortaSync/log/PnmDataManager.log
   ```
   Attendu : un fichier genere par operateur avec le nombre de tickets

### 7.4 A 11H15 - Verification acquittements

1. Verifier les acquittements des fichiers recus :
   ```bash
   tail -f /home/porta_pnmv3/PortaSync/log/PnmAckManager.log
   ```
   Attendu : `Aucune notification d'AR SYNC non-recu` pour chaque operateur

### 7.5 Portages entrants en cours

1. Verifier sur le portail PortaWs : http://172.24.119.72:8080/PortaWs/
2. Si un portage est bloque "En cours", relancer l'operateur donneur par mail

### 7.6 Mails a surveiller

**Internes :**
- `[PNM] Controle fichier batchhandler FNR_V3 sur EMA`
- `[PNM] 1ere vacation`
- `[PNM] 2eme vacation`
- `[PNM] 3eme vacation`
- `[PNM][INCIDENT]`
- `[PNMV3] Verification Bascule Porta MOBI`
- `[PNMV3] Verification Bascule Porta MOBI : FIN`
- `[PNM] Verification des resiliations pour PSO`

**Externes :**
- `[PNM] Ticket(s) en attente` (tickets en attente de reponse OPD, surtout Dauphin Telecom)
- `PNM INCIDENT : Numeros en ecart dans le fichier de synchronisation`

---

## 8. RIO - Releve d'Identite Operateur

### 8.1 Structure du RIO

Le RIO est un code de **12 caracteres alphanumeriques** :

```
[CodeOp][TypeClient][6charsClient][CCC]
  2 car    1 car       6 car       3 car
```

- **CodeOp** : code operateur (ex: `02` pour Digicel)
- **TypeClient** : `P` = Particulier, `E` = Entreprise
- **6charsClient** : 6 derniers caracteres du numero client (directive)
- **CCC** : 3 caracteres de controle calcules par algorithme

Exemple : `02P131780R0W` = Digicel, Particulier, client 131780, controle R0W

### 8.2 Algorithme de calcul du CCC

**Table de conversion :**

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | + |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 |

**Algorithme :**
1. Concatener (CodeOp, TypeClient, 6charsClient, NumeroTelephone)
2. Traduire chaque caractere selon la table de conversion -> X1 a X19
3. Calculer iterativement pour i = 1 a 19 :
   - `Res1(i) = RESTE[(Res1(i-1) + Xi) / 37]`
   - `Res2(i) = RESTE[(Res2(i-1) + Xi) / 37]`
   - `Res3(i) = RESTE[(Res3(i-1) + Xi) / 37]`
   - Avec `Res1(0) = Res2(0) = Res3(0) = 26`
4. Les 3 derniers resultats (Res1, Res2, Res3) sont reconvertis en caracteres = CCC

---

## 9. Commandes FNR

Le FNR (Fichier National de Routage) est mis a jour via les commandes **NPSUB** :

```
# Verifier un numero porte
GET:NPSUB:MSISDN,590690XXXXXX;

# Creer une entree de portage
CREATE:NPSUB:MSISDN,590690XXXXXX;

# Affecter a un operateur
SET:NPSUB:MSISDN,590690XXXXXX:NP,6004X;

# Supprimer une entree
DELETE:NPSUB:MSISDN,590690XXXXXX;
```

Codes operateurs FNR (MAJ 08/04/2026) :
- Orange : `52303` (GP) / `52313` (MQ) / `52333` (GY) — nouveaux prefixes actifs depuis 08/04/2026
- Digicel : `60042` (ancien, toujours actif)
- Dauphin : `60043`
- OMT : `60044`
- UTS : `60045`
- Free : `60048`

---

## 10. Flux de donnees : PNMDATA → PortaDB → FNR

### 10.1 Vue d'ensemble

Trois systemes distincts interviennent dans la portabilite. Ils ont chacun un role different et sont alimentes par des sources differentes :

```
+------------------+     +------------------+     +------------------+
|    PNMDATA       |     |     PortaDB      |     |       FNR        |
|  (fichiers)      |---->|   (base MySQL)   |---->|  (routage reseau)|
+------------------+     +------------------+     +------------------+
  Fichiers echanges        Reference admin         Routage des appels
  entre operateurs         "qui detient quel       "ou envoyer l'appel
  via sFTP                  numero"                 vers un porte"
```

### 10.2 Les 3 systemes en detail

| Systeme | Type | Role | Contenu |
|---------|------|------|---------|
| **PNMDATA / PNMSYNC** | Fichiers texte (sFTP) | Vehiculer les tickets de portage entre operateurs | Demandes (1110), reponses (1210), confirmations (1410), etc. |
| **PortaDB (table MSISDN)** | Base MySQL (vmqproportawebdb01) | Reference administrative de la portabilite | Tous les MSISDN connus du systeme, avec leur operateur actuel et leur tranche d'origine |
| **FNR** | Fichier National de Routage (reseau) | Router les appels vers les numeros portes | Commandes NPSUB : CREATE, SET, DELETE pour chaque MSISDN porte |

### 10.3 Comment la table MSISDN de PortaDB est alimentee

La table MSISDN n'est **pas** alimentee par le FNR. Elle est alimentee par **3 sources** :

**Source 1 — TRANCHE (attribution initiale ARCEP)**

Avant tout portage, chaque MSISDN est rattache a une tranche. La tranche definit l'operateur **attributaire d'origine** (celui a qui l'ARCEP a attribue le bloc de numeros).

```
Table TRANCHE : operateur_id = operateur attributaire d'origine
Table MSISDN  : operateur_id_actuel = operateur qui detient le numero MAINTENANT
```

Au depart, `operateur_id_actuel` = `tranche.operateur_id`. Apres un portage, seul `operateur_id_actuel` change. La tranche ne change jamais.

**Source 2 — PNMDATA (tickets de portage)**

Quand un portage est complete (bascule), le processus met a jour `operateur_id_actuel` dans la table MSISDN :

```
Exemple : 0690431001 porte de Digicel vers Orange

Avant bascule : operateur_id_actuel = 2 (Digicel)
Apres bascule : operateur_id_actuel = 1 (Orange)

La tranche reste : operateur_id = 2 (Digicel)
→ C'est un numero PORTE (operateur actuel != operateur tranche)
```

Le flux de mise a jour :
1. Ticket 1110 (demande) recu dans PNMDATA
2. Ticket 1210 (acceptation) echange
3. Ticket 1410 (envoi donnees portage) echange
4. **Bascule** : script `EmaExtracter.sh` met a jour PortaDB + MOBI
5. `operateur_id_actuel` est mis a jour dans la table MSISDN

**Source 3 — PNMSYNC (synchronisation hebdomadaire)**

Chaque dimanche a 22H, les fichiers PNMSYNC sont echanges entre tous les operateurs. Ils servent a **reconcilier** les bases de portabilite :

- Si un operateur a un ecart dans sa base, PNMSYNC le corrige
- Script : `PnmSyncManager.sh` (generation) + `PnmSyncAckManager.sh` (integration)
- En cas d'ecart, une alerte est envoyee : `PNM INCIDENT : Numeros en ecart dans le fichier de synchronisation`

### 10.4 Comment le FNR est mis a jour

Le FNR est mis a jour **apres la bascule** par un processus separe :

```
Bascule (9H00 jours ouvres)
    |
    v
EmaExtracter.sh
    |
    +---> MAJ PortaDB (table MSISDN.operateur_id_actuel)
    |
    +---> Generation fichier fnr_action_v3.bh
          (commandes NPSUB : CREATE/SET/DELETE)
              |
              v
          Envoi vers EMA (digimqema01)
              |
              v
          BatchHandler execute les commandes FNR
              |
              v
          FNR mis a jour (routage reseau actif)
```

Le script `Pnm-FNR_presence_V3.sh` verifie chaque jour :
1. Que le fichier `fnr_action_v3.bh` est present sur EMA
2. Que le fichier log a ete cree (execution confirmee)
3. Que le pourcentage de commandes OK est > 50%

### 10.5 Difference entre PortaDB et FNR

| | PortaDB (table MSISDN) | FNR |
|---|---|---|
| **Role** | Reference administrative | Routage reseau |
| **Question** | "Chez quel operateur est ce numero ?" | "Ou router l'appel vers ce numero ?" |
| **Type** | Base de donnees MySQL | Fichier de routage reseau |
| **Serveur** | vmqproportawebdb01 | Reseau (via EMA) |
| **MAJ par** | PNMDATA + PNMSYNC + bascule | fnr_action_v3.bh (commandes NPSUB) |
| **Contient** | Tous les MSISDN (tous operateurs) | Uniquement les MSISDN portes |
| **Interrogation** | `mysql -e "SELECT ... FROM PortaDB.MSISDN"` | `GET:NPSUB:MSISDN,590690XXXXXX;` ou http://172.24.2.21/apis/porta/fnr-get-info.html |

**Point cle :** Un numero natif (jamais porte) est dans PortaDB mais **pas** dans le FNR. Le FNR ne contient que les numeros qui ont change d'operateur, car seuls ceux-la ont besoin d'un reroutage.

---

## 11. Connexions et acces

### 11.1 Serveur PNM (sFTP)

```bash
# Mode normal
sftp -oPort=22 pnm_02@193.251.160.208

# Mode debug
sftp -oLoglevel=DEBUG3 -oPort=22 pnm_02@193.251.160.208

# Envoi fichier
echo "put nomdufichier.extension" | sftp -oPort=22 pnm_02@193.251.160.208

# Exemple d'envoi avec chemin complet
sftp_put pnm_01@94.198.176.178 /opt/pkg/expl/PNM/tmp/PNMDATA.02.01.20151104095843.001.ACR /home/pnm_01/datapnm/RECV
```

### 11.2 Portail PortaWs
- URL : http://172.24.119.72:8080/PortaWs/

### 11.3 Liens utiles
- Procedures sur SharePoint : https://digicelja.sharepoint.com/sites/fwi_IT_Application/APP-VENTES/SitePages/Procedures%20portabilit%C3%A9.aspx
- Serveur fichiers : `\\mqfiles002.digicelgroup.local\Services\DRSI\DSI\APPLICATION\Domaines\Portabilite`

---

## 11. Processus speciaux

### 11.1 Portage inverse (tickets BI/PI/DI/CI serie 2400)

Un portage inverse est le retour d'un numero porte vers l'operateur attributaire (OPA). Il suit un processus specifique avec des tickets dedies (BI=bon accord, PI=envoi donnees, DI=confirmation, CI=confirmation finale).

### 11.2 Restitution (tickets BR/RN/RS/RC serie 3400)

La restitution concerne les numeros resilies hors tranche. Processus :
1. Extraction des resiliations dans MOBI datant de S-4 (jeudi 10H45)
2. Creation des tickets 3400 dans PortaDB
3. Envoi des donnees de restitution a tous les operateurs (ticket RN/3410)
4. Chaque operateur confirme la prise en compte (RS/3420 puis RC/3430)
5. Mise a jour de MOBI (msisdn_status, st_msisdn_id)

### 11.3 Gestion des erreurs (ticket ER/7000)

Les erreurs et dysfonctionnements sont signales via le ticket ER (code BU 7000).

---

## 12. Documents sources

| Document | Description | Date |
|----------|-------------|------|
| PNMV3-Transfert de co SI App-v4.0_2026.pptx | Presentation transfert de connaissances SI-Application | 2026 |
| Manuel exploitation PORTA.docx | Procedures d'exploitation quotidiennes DAPI/PortaSync | 2026 |
| Interfaces_DAP_SI.docx | Interfaces web services DAPI <-> SI Digicel | 2026 |
| Commandes_FNR.xlsx | Commandes NPSUB pour le FNR | 2012 |
| RIO - tool_v3 For 2025.xlsx | Outil de generation RIO (unitaire + masse) | 2025 |
| Porta-v3.0.15 Body.pdf | Documentation corps applicatif Porta v3.0.15 | 2012 |
| Porta-v3.0.15 Database.pdf | Documentation base de donnees Porta v3.0.15 | 2012 |
| ANNEXE 1 - Processus Client Guichet Unique GPMAG-PNMV3 | Processus client inter-operateurs | 2012 |
| ANNEXE 4 - Specifications interface technique inter-operateurs | Architecture distribuee, fichiers PNMDATA/PNMSYNC, sFTP | 2013 |
| ANNEXE 5 - Cadrage et organisation inter-operateurs | Organisation inter-operateurs | 2013 |
| ANNEXE 7 - Specification Besoins Systeme Echange | Specification du systeme d'echange inter-operateurs | 2013 |
