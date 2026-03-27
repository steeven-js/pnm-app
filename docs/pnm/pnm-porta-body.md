# Architecture Applicative Porta — Body v3.0.15

> Converti depuis Porta-v3.0.15 Body.pdf (pages 2-10 : APIs, fichiers, diagrammes d'etat)
> Auteur original : Willy.Laurencine@pil-medias.com

---

## 1. Web Services — Interfaces applicatives

### 1.1 DigicelFwiEsbWs4Porta — Interface ESB vers DAPI

Interface appelee par DAPI pour communiquer avec le SI Digicel (ESB/MOBI).

| Operation | Parametres entree | Retour | Description |
|-----------|-------------------|--------|-------------|
| **ChangeMsisdn** | msisdn, newMsisdn | Boolean | Changement de MSISDN dans le CRM (bascule) |
| **TerminateLine** | msisdn | Boolean | Resiliation de ligne (portage sortant) |
| **UpdateMsisdn** | msisdn, newOperator, newStatus | Boolean | Mise a jour operateur/statut MSISDN |
| **SendSmsNotification** | msisdn, message | Boolean | Envoi notification SMS a l'abonne |
| **CheckEligibility** | msisdnRio (MsisdnRio), dateSouscription (Date), datePortage (Date) | Boolean | Verification eligibilite portage via RIO |
| **NotifyPortage** | idPortageMultiple (String/md5), msisdn (String), status (enum: ACCEPTE, REFUSE, ANNULE) | void | Notification d'evenement de portage |
| **NotifyDossier** | idPortageMultiple (String/md5), status (enum: TERMINE) | void | Notification de cloture de dossier |

---

### 1.2 DigicelFwiPortaWs4Esb — Interface DAPI pour le SI

Interface exposee par DAPI, appelee par le SI (PortaWebUi, WebStore, etc.).

| Operation | Parametres entree | Retour | Description |
|-----------|-------------------|--------|-------------|
| **CreatePortaParticulier** | opd, msisdnRio[], dateSouscription, datePortage, codePostal | OutputPortaId | Creer portage particulier |
| **CreatePortaEntreprise** | opd, msisdnRio[], dateSouscription, datePortage, codePostal | OutputPortaId | Creer portage entreprise |
| **CreatePortaInverse** | opd, msisdn[], dateDemande, datePortage, ancienIdPortage, ancienIdPortageParentId, commentaire | OutputPortaId | Creer portage inverse |
| **CreatePortaRestitution** | opa, msisdn[], dateDemande, datePortage, ancienIdPortage, ancienIdPortageMultiple, commentaire | OutputPortaId | Creer restitution |
| **BindPorta** | portaId (!), bindContext (!) | OutputStatus | Lier un portage a un contexte |
| **CancelPorta** | portaId | OutputStatus | Annuler un portage |
| **UpdatePorta** | portaId, msisdn (String[10]), motifUpdate | OutputStatus | Mettre a jour un portage |
| **GetPorta** | portaId | OutputInformations | Recuperer infos portage |
| **CreateRio** | msisdn (!String[10]), opd, isEntreprise (!Boolean), numeroClient (!String[6]) | OutputRio | Generer un RIO |

---

### 1.3 DigicelFwiPortaWs4PortaSync — Interface pour PortaSync

Interface exposee par DAPI, utilisee par les scripts PortaSync pour la gestion des fichiers.

| Operation | Parametres entree | Retour | Description |
|-----------|-------------------|--------|-------------|
| **InitSession** | session_type (enum: ACK, DATA, SYNC, ANY), operateur (Integer[2]) | SessionInformations | Initialiser session d'echange |
| **CommitSession** | session_id | void | Valider la session |
| **RollbackSession** | session_id | void | Annuler la session |
| **GetSyncTickets** | session_id, origine, destination, begin_date, end_date | Tickets | Recuperer tickets synchro |
| **GetDataTickets** | session_id, origine, destination, plan_date | Tickets | Recuperer tickets vacation |
| **GetAckTickets** | session_id, origine, destination, timeout | Tickets | Recuperer tickets acquittement |
| **Notify** | session_id, action (notifyAction) | void | Notifier action |

---

## 2. Structure des fichiers PNMDATA / PNMSYNC

### 2.1 Nommage

| Type | Format | Exemple |
|------|--------|---------|
| PNMDATA | `PNMDATA.XX.YY.AAAAMMJJHHMMSS.ZZZ` | PNMDATA.02.01.20260105100001.001 |
| PNMSYNC | `PNMSYNC.XX.YY.AAAAMMJJHHMMSS.ZZZ` | PNMSYNC.02.01.20260105230001.001 |
| Acquittement | `PNMDATA.XX.YY.AAAAMMJJHHMMSS.ZZZ.ACR` | (acquittement OK) |
| Erreur | `PNMDATA.XX.YY.AAAAMMJJHHMMSS.ZZZ.ERR` | (acquittement erreur) |

### 2.2 Structure Header

| Champ | Type | Description |
|-------|------|-------------|
| code-ticket | String[10] | Identifiant header : `0123456789` |
| nom-fichier | String[32] | Nom complet du fichier |
| emetteur | Integer[2] | Code operateur emetteur (01-06) |
| date-debut-fichier | Date[14] | AAAAMMJJHHMMSS |

### 2.3 Structure Footer

| Champ | Type | Description |
|-------|------|-------------|
| code-ticket | String[10] | Identifiant footer : `9876543210` |
| emetteur | Integer[2] | Code operateur emetteur |
| date-fin-fichier | Date[14] | AAAAMMJJHHMMSS |
| nombre-de-lignes | Integer[6] | Nombre de tickets dans le fichier |

### 2.4 Structure Body — Acquittements (code 0000)

| Champ | Type | Description |
|-------|------|-------------|
| code-ticket | `0000` | Code acquittement |
| date-creation-ticket | Date[14] | AAAAMMJJHHMMSS |
| code-erreur | String[4] | `E000` = OK, `E001..E999` = erreur |
| nombre-de-lignes | Integer[6] | Nombre de lignes traitees |
| commentaire | String[150] | Commentaire (si erreur) |

### 2.5 Structure Body — Synchronisation (PNMSYNC)

| Champ | Type | Description |
|-------|------|-------------|
| operateur-receveur | Integer[2] | Code operateur receveur |
| msisdn | String[10] | Numero mobile porte |
| date-portage | Date[14] | Date du portage |

---

## 3. Structure des tickets par type

### 3.1 Tickets Normaux (serie 1XXX)

#### Base commune ticket normal

| Champ | Type | Description |
|-------|------|-------------|
| code-ticket | Integer[4] | 1nnn |
| operateur-origine | Integer[2] | 01-99 |
| operateur-destination | Integer[2] | 01-99 |
| OPR | Integer[2] | Operateur Receveur |
| OPD | Integer[2] | Operateur Donneur |
| date-souscription | Date[14] | AAAAMMJJHHMMSS |
| msisdn | String[10] | 06nnnnnnnn |
| id-portage | String[32] | MD5 |
| numero-de-ligne | Integer[6] | Sequentiel |

#### DP (1110) — Demande portage particulier

Emetteur : OPR → Destinataire : OPD

| Champ supplementaire | Type |
|---------------------|------|
| rio | String[12] (OOTRRRRRRCCC) |
| date-creation-ticket | Date[14] |
| date-portage | Date[14] |
| id-portage-multiple | String[32] |
| nb-lignes-portage-multiple | Integer[3] |
| code-postal-emetteur | Integer[5] |
| date-demande-portage | Date[8] (AAAAMMJJ) |

#### DE (1120) — Demande portage entreprise
Meme structure que DP (1110).

#### RP Accept (1210) — Reponse acceptation

Emetteur : OPD → Destinataire : OPR

| Champ supplementaire | Type |
|---------------------|------|
| code-acceptation-ou-refus | String[4] (Annn) |
| date-creation-ticket | Date[14] |
| id-portage-multiple | String[32] |
| commentaire | String[150] |

#### RP Refus (1220) — Reponse refus

Meme structure que 1210 avec `code-acceptation-ou-refus = Rnnn`.

#### EP (1410) — Envoi donnees portage (a tous)

Emetteur : OPR → Destinataire : 00 (tous)

| Champ supplementaire | Type |
|---------------------|------|
| date-creation-ticket | Date[14] |
| date-portage | Date[14] |
| id-portage-multiple | String[32] |

#### CP (1430) — Confirmation portage (de tous)

Emetteur : nn (chaque OP) → Destinataire : OPR

#### AP (1510) — Annulation OPR

Emetteur : OPR → Destinataire : OPD

| Champ supplementaire | Type |
|---------------------|------|
| date-creation-ticket | Date[14] |
| id-portage-multiple | String[32] |
| code-motif-annulation | String[4] (C001) |

#### AN (1520) — Annulation OPD

Emetteur : OPD → Destinataire : OPR. Code motif : C002/C003.

#### CA (1530) — Confirmation annulation

Emetteur : OPD/OPR → Destinataire : OPR/OPD. Code motif : C001/C002/C003.

---

### 3.2 Tickets Inverse (serie 2XXX)

#### Base commune ticket inverse

| Champ | Type | Description |
|-------|------|-------------|
| code-ticket | Integer[4] | 2nnn |
| OPR-initial | Integer[2] | OPR du portage initial |
| OPD-initial | Integer[2] | OPD du portage initial |
| ancien-id-portage | String[32] | MD5 portage initial |
| ancien-id-portage-multiple | String[32] | MD5 portage multiple initial |

| Ticket | Code | Emetteur | Destinataire |
|--------|------|----------|-------------|
| BI | 2400 | OPR | OPD |
| PI | 2410 | OPD | 00 (tous) |
| DI | 2420 | nn | OPD |
| CI | 2430 | nn | OPD |

---

### 3.3 Tickets Restitution (serie 3XXX)

#### Base commune ticket restitution

| Champ | Type | Description |
|-------|------|-------------|
| code-ticket | Integer[4] | 3nnn |
| OPR | Integer[2] | Operateur Receveur |
| OPA | Integer[2] | Operateur Attributaire |
| date-restitution | Date[14] | Date de restitution |

| Ticket | Code | Emetteur | Destinataire |
|--------|------|----------|-------------|
| BR | 3400 | OPR | OPA |
| RN | 3410 | OPA | 00 (tous) |
| RS | 3420 | nn | OPA |
| RC | 3430 | nn | OPA |

---

### 3.4 Ticket Erreur (7000)

| Champ | Type | Description |
|-------|------|-------------|
| code-ticket | 7000 | Erreur/dysfonctionnement |
| code-erreur | String[4] (Ennn) | Code erreur |
| position-erreur | Integer[2] | Position dans le ticket |
| code-transaction-origine | String[4] | Transaction d'origine |
| commentaire | String[150] | Description erreur |

---

## 4. Diagrammes d'etat — Machine a etats des portages

### 4.1 Portage Normal Entrante (Digicel = OPR)

```
[Saisi] ──1110/1120──> [En cours] ──1210──> [Accepte]
   │(CreatePortaParticulier       │              │
    /CreatePortaEntreprise)       │              ├──1410──> [Diffuse] ──bascule 9h──> [Bascule] ──1430──> [Confirme] ──1430 de tous──> [Cloture]
                                  │              │                                                          (is_end)
                                  │              │
                                  │         1220─┘──> [Refuse] (is_end)
                                  │                   NotifyPortage(REFUSE)
                                  │                   SendSmsNotification(refus)
                                  │
                                  ├──1520──> [Annule OPD] ──1530──> (is_end)
                                  │           NotifyPortage(ANNULE)
                                  │
                                  └──1510──> [Annule OPR] ──1530──> (is_end)
                                              CancelPorta() avant EP

Actions a la bascule :
- ChangeMsisdn() → changement MSISDN dans CRM
- UpdateMsisdn() → mise a jour statut
- NotifyPortage(ACCEPTE) a l'acceptation
- SendSmsNotification(CLOTURE) a la cloture
- NotifyDossier(TERMINE) quand tous les numeros du dossier sont traites
```

### 4.2 Portage Normal Sortante (Digicel = OPD)

```
[En cours] ──1110/1120──> [Attente OPD]
   │(is_begin)                    │
                                  ├──1210──> [Accepte] ──1410──> [Diffuse] ──bascule 9h──> [Bascule] ──1430──> [Confirme] ──1430──> [Cloture]
                                  │                                                                              (is_end)
                                  │           Actions bascule :
                                  │           - TerminateLine()
                                  │           - UpdateMsisdn()
                                  │
                                  ├──refus──> [Refuse] (is_end)
                                  │
                                  ├──1520──> [Annule OPD] ──1530──> (is_end)
                                  │
                                  └──1510──> [Annule OPR] ──1530──> (is_end)
```

### 4.3 Portage Normal Etrangere (Digicel = ni OPR ni OPD)

```
[Diffuse] ──1410──> [Bascule] ──bascule 9h──> [Confirme] ──1430──> [Cloture]
 (is_begin)                                                          (is_end)

Action bascule : UpdateMsisdn()
```

### 4.4 Portage Inverse (serie 2400)

```
SORTANTE (Digicel = OPR) :
[Saisi] ──2400──> [En cours] ──2410──> [Accepte] ──2420──> [Diffuse] ──bascule 9h──> [Bascule] ──2430──> [Confirme] ──2430──> [Cloture]
 CreatePortaInverse()                                                                  TerminateLine()       (is_end)

ENTRANTE (Digicel = OPD) :
[En cours] ──2400──> [Accepte] ──2410──> [Diffuse] ──bascule 9h──> [Bascule] ──2430──> [Confirme] ──2430──> [Cloture]
 (is_begin)                                                          UpdateMsisdn()      (is_end)

ETRANGERE :
[Accepte] ──2410──> [Diffuse] ──bascule 9h──> [Bascule] ──2430──> [Confirme] ──2430──> [Cloture]
 (is_begin)                                     UpdateMsisdn()      (is_end)
```

### 4.5 Restitution (serie 3400)

```
SORTANTE (Digicel = OPR) :
[Saisi] ──3400──> [En cours] ──3410──> [Accepte] ──3420──> [Diffuse] ──bascule 9h──> [Bascule] ──3430──> [Confirme] ──3430──> [Cloture]
 CreatePortaRestitution()                                                                           (is_end)

ENTRANTE (Digicel = OPA) :
[En cours] ──3400──> [Accepte] ──3410──> [Diffuse] ──bascule 9h──> [Bascule] ──3430──> [Confirme] ──3430──> [Cloture]
 (is_begin)                                                          UpdateMsisdn()      (is_end)

ETRANGERE :
[Accepte] ──3410──> [Diffuse] ──bascule 9h──> [Bascule] ──3430──> [Confirme] ──3430──> [Cloture]
 (is_begin)                                     UpdateMsisdn()      (is_end)
```

---

## 5. Resume des appels WS par type de portage

| Evenement | WS appele | Direction |
|-----------|-----------|-----------|
| Bascule entrante | ChangeMsisdn() | DAPI → ESB → CRM |
| Bascule sortante | TerminateLine() | DAPI → ESB → CRM |
| Bascule etrangere | UpdateMsisdn() | DAPI → ESB → CRM |
| Portage accepte | NotifyPortage(ACCEPTE) | DAPI → ESB |
| Portage refuse | NotifyPortage(REFUSE) + SendSmsNotification | DAPI → ESB |
| Portage annule | NotifyPortage(ANNULE) + SendSmsNotification | DAPI → ESB |
| Dossier termine | NotifyDossier(TERMINE) | DAPI → ESB |
| Verification eligibilite | CheckEligibility() | ESB → DAPI |
