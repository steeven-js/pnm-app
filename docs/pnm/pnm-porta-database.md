# Schema Base de Donnees PortaDB — Porta v3.0.15

> Converti depuis Porta-v3.0.15 Database.pdf (diagramme schema BDD)
> Auteur original : Willy.Laurencine@pil-medias.com
> Serveur : vmqproportawebdb01

---

## Vue d'ensemble

PortaDB est la base de donnees centrale du systeme de portabilite PNM. Elle stocke les tickets de portage, les dossiers, les fichiers echanges, les etats, les transitions et l'historique complet des MSISDN portes.

### Relations principales

```
PNMDATA ──> FICHIER (fichier_id)
PNMDATA ──> CODE_TICKET (code_ticket)
PNMDATA ──> OPERATEUR (operateur_origine, operateur_destination, OPR, OPD, OPA)
PNMDATA ──> CODE_REPONSE (code_motif)

PORTAGE ──> PNMDATA (id_portage)
PORTAGE ──> MSISDN (msisdn)
PORTAGE ──> DOSSIER (dossier_id)
PORTAGE ──> ETAT (etat_id_actuel)

MSISDN ──> TRANCHE (tranche_id)
MSISDN ──> PORTAGE (portage_id_actuel)
MSISDN ──> OPERATEUR (operateur_id_actuel)

DOSSIER ──> ETAT (etat_id_actuel)
DOSSIER ──> OPERATEUR (operateur_id_origine, operateur_id_destination)

PORTAGE_HISTORIQUE ──> PORTAGE (portage_id)
PORTAGE_HISTORIQUE ──> ETAT (etat_id_from)
PORTAGE_HISTORIQUE ──> TRANSITION (transition_id)
PORTAGE_HISTORIQUE ──> DATA (data_id_transition)

TRANSITION ──> ETAT (etat_id_from, etat_id_to)
TRANSITION ──> CODE_TICKET (ticket_id_evenement)

FICHIER ──> OPERATEUR (header_emetteur, expediteur, destinataire)

SYNC ──> FICHIER (fichier_id)
SYNC ──> OPERATEUR (operateur_receveur)

ACK ──> FICHIER (fichier_id)
ACK ──> CODE_REPONSE (code_erreur)

MSISDN_HISTORIQUE ──> MSISDN (msisdn)
MSISDN_HISTORIQUE ──> OPERATEUR (operateur_id)
MSISDN_HISTORIQUE ──> PORTAGE (portage_id)
```

---

## Tables

### PNMDATA — Tickets de portage

Table centrale contenant tous les tickets echanges entre operateurs.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | Integer | PK, AUTO | Identifiant unique |
| fichier_id | Integer | FK → FICHIER | Fichier source du ticket |
| source | Byte[1] | NOT NULL, enum | `ticket_in`, `ticket_out`, `internal` |
| code_ticket | String[4] | FK → CODE_TICKET | Type de ticket (1110, 1210, etc.) |
| operateur_origine | Integer[2] | FK → OPERATEUR | Operateur emetteur |
| operateur_destination | Integer[2] | FK → OPERATEUR | Operateur destinataire |
| OPR | Integer[2] | FK → OPERATEUR | Operateur Receveur |
| OPD | Integer[2] | FK → OPERATEUR | Operateur Donneur |
| OPA | Integer[2] | FK → OPERATEUR | Operateur Attributaire |
| date_creation_ticket | Date[14] | | AAAAMMJJHHMMSS |
| date_souscription | Date[14] | | AAAAMMJJHHMMSS |
| date_demande | Date[14] | | AAAAMMJJHHMMSS |
| date_demande_portage | Date[14] | | AAAAMMJJHHMMSS |
| date_portage | Date[14] | | AAAAMMJJHHMMSS |
| date_restitution | Date[14] | | AAAAMMJJHHMMSS |
| msisdn | String[10] | | Format 06nnnnnnnn |
| rio | String[12] | | Format OOTRRRRRRCCC |
| id_portage | String[32] | | Hash MD5 unique du portage |
| id_portage_parent | String[32] | | MD5 du portage parent |
| id_portage_multiple | String[32] | | MD5 pour portages groupes |
| id_portage_multiple_parent | String[32] | | MD5 parent portage multiple |
| nb_lignes_portage_multiple | Integer[3] | | Nombre de lignes dans portage multiple |
| numero_de_ligne | Integer[4] | | Numero sequentiel |
| code_postal_emetteur | String[5] | | Code postal |
| code_motif | String[4] | FK → CODE_REPONSE | Code acceptation/refus/annulation |
| commentaire | String[150] | | Commentaire libre |
| code_transaction | String[4] | | Code transaction |
| position_erreur | Integer[2] | | Position de l'erreur dans le ticket |

---

### PORTAGE — Portages actifs

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | Integer | PK, AUTO, NOT NULL | Identifiant unique |
| id_portage | String | FK → PNMDATA.id_portage | Lien vers ticket PNMDATA |
| msisdn | MSISDN | FK, NOT NULL | Numero porte |
| dossier_id | Integer | FK → DOSSIER, NOT NULL | Dossier de portage |
| date_portage | Date | NOT NULL | Date de portage prevue |
| date_debut | Date | NOT NULL | Date debut portage |
| date_fin | Date | | Date fin portage (NULL si en cours) |
| etat_id_actuel | Integer | FK → ETAT | Etat actuel du portage |

---

### MSISDN — Numeros mobiles

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| msisdn | String[10] | NOT NULL | Format 06nnnnnnnn |
| tranche_id | Integer | FK → TRANCHE | Tranche de numeros |
| portage_id_actuel | Integer | FK → PORTAGE | Portage en cours (NULL si aucun) |
| operateur_id_actuel | Integer | FK → OPERATEUR, NOT NULL | Operateur actuel du numero |

---

### DOSSIER — Dossiers de portage

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | Integer | PK, AUTO, NOT NULL | Identifiant unique |
| id_portage_multiple | String | FK → PNMDATA | Lien portage multiple |
| date_souscription | Date | | Date souscription |
| date_ouverture | Date | NOT NULL | Date ouverture dossier |
| date_cloture | Date | | Date cloture (NULL si ouvert) |
| etat_id_actuel | Integer | FK → ETAT | Etat actuel du dossier |
| operateur_id_origine | Integer | FK → OPERATEUR, NOT NULL | Operateur d'origine |
| operateur_id_destination | Integer | FK → OPERATEUR, NOT NULL | Operateur destination |

---

### OPERATEUR — Operateurs du GPMAG

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| code | Integer[2] | PK, NOT NULL | Code operateur (01-06) |
| is_active | Boolean | NOT NULL | Operateur actif |
| is_actor | Boolean | NOT NULL | Acteur dans le systeme |
| nom | String[32] | NOT NULL | Nom operateur |
| contact | String | | Contact principal |
| email | String | | Email |
| fax | String | | Fax |
| directory | String | | Repertoire sFTP |
| comment | String | | Commentaire |

---

### ETAT — Etats des portages

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | Integer | PK, AUTO, NOT NULL | Identifiant unique |
| is_active | Boolean | NOT NULL | Etat actif |
| type | Byte[1] | NOT NULL | enum: normal, inverse, restitution |
| direction | Byte[1] | NOT NULL | enum: entrante, sortante, etrangere |
| classe | Byte[1] | NOT NULL | enum: saisi, encours, bascule, cloture, refuse, annule |
| numero | Integer[1] | NOT NULL | Numero sequentiel |
| label | String[150] | | Libelle |
| description | String[150] | | Description |
| is_begin | Boolean | NOT NULL, default: no | Etat initial |
| is_end | Boolean | NOT NULL, default: no | Etat final |

---

### CODE_TICKET — Types de tickets

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| code | Integer[4] | PK, NOT NULL | Code ticket (1110, 1210, etc.) |
| is_active | Boolean | NOT NULL | Ticket actif |
| name | String[2] | NOT NULL | Nom court (DP, RP, EP, etc.) |
| label | String[150] | | Libelle |
| description | String[150] | | Description |

---

### CODE_REPONSE — Codes de reponse (acceptation/refus/annulation)

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| code | String[4] | PK, NOT NULL | Format Xnnn (Annn=acceptation, Rnnn=refus, Cnnn=annulation, Ennn=erreur) |
| is_active | Boolean | NOT NULL | Code actif |
| type | Byte[1] | NOT NULL | enum: erreur, annulation, eligibilite |
| label | String[150] | | Libelle |

---

### TRANSITION — Machine a etats (transitions)

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | Integer[4] | PK, AUTO, NOT NULL | Identifiant unique |
| is_active | Boolean | NOT NULL | Transition active |
| is_for_all | Boolean | NOT NULL | Applicable a tous |
| etat_id_from | Integer | FK → ETAT, UNIQUE | Etat source |
| etat_id_to | Integer | FK → ETAT | Etat destination |
| evenement | Byte[1] | NOT NULL | enum: ticket_in, ticket_out, internal |
| context_evenement | String | | Contexte additionnel |
| ticket_id_evenement | Integer | FK → CODE_TICKET, UNIQUE | Ticket declencheur |
| label | String[150] | | Libelle |

---

### PORTAGE_HISTORIQUE — Historique des transitions

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | Integer | PK, AUTO, NOT NULL | Identifiant unique |
| portage_id | Integer | FK → PORTAGE, NOT NULL | Portage concerne |
| transition_id | Integer | FK → TRANSITION | Transition executee |
| context_transition | String | | Contexte additionnel |
| data_id_transition | Integer | FK → DATA | Donnee associee |
| etat_id_from | Integer | FK → ETAT, NOT NULL | Etat avant transition |
| date_debut | Date | | Date debut |
| date_fin | Date | | Date fin |

---

### FICHIER — Fichiers PNMDATA/PNMSYNC echanges

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | Integer | PK, AUTO | Identifiant unique |
| header_nom_fichier | String[32] | NOT NULL | Nom du fichier |
| header_emetteur | Integer[2] | FK → OPERATEUR, NOT NULL | Code emetteur (01-06) |
| header_date_debut_fichier | Date[14] | | AAAAMMJJHHMMSS |
| footer_date_fin_fichier | Date[14] | | AAAAMMJJHHMMSS |
| footer_nombre_de_lignes | Integer[4] | NOT NULL | Nombre de lignes (1-9999) |
| source | Byte | NOT NULL | enum: ssh, mail, admin |
| direction | Byte[1] | | enum: send, recv |
| type | Byte[1] | NOT NULL | enum: data, sync |
| filename | String[32] | NOT NULL | Nom fichier complet |
| extension | String[3] | | ACR ou ERR |
| expediteur | Integer[2] | FK → OPERATEUR, NOT NULL | Code expediteur |
| destinataire | Integer[2] | FK → OPERATEUR, NOT NULL | Code destinataire |
| date | Date[14] | NOT NULL | AAAAMMJJHHMMSS |
| sequence | Integer[3] | NOT NULL | Sequence (001-999) |

---

### SYNC — Donnees de synchronisation

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | Integer | PK, AUTO | Identifiant unique |
| fichier_id | Integer | FK → FICHIER, NOT NULL | Fichier source |
| operateur_receveur | Integer[2] | FK → OPERATEUR, NOT NULL | Operateur receveur |
| msisdn | Integer[10] | NOT NULL | Format 06nnnnnnnn |
| date_portage | Date[14] | NOT NULL | AAAAMMJJHHMMSS |

---

### SYNC_STATUS — Statut synchronisation

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | Integer | PK, AUTO, NOT NULL | Identifiant unique |
| date | Date | | Date |
| is_conflict | Boolean | NOT NULL, default: no | Conflit detecte |
| sync_id | Integer | FK → SYNC, NOT NULL | Synchronisation concernee |
| msisdn_historique_id_conflit | Integer | FK → MSISDN_HISTORIQUE | Historique en conflit |
| msisdn_historique_id_resolution | Integer | FK → MSISDN_HISTORIQUE | Resolution du conflit |
| commentaire | String[150] | | Commentaire |

---

### ACK — Acquittements

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | Integer | PK, AUTO | Identifiant unique |
| fichier_id | Integer | FK → FICHIER, NOT NULL | Fichier acquitte |
| date_creation_ticket | Date[14] | | AAAAMMJJHHMMSS |
| code_erreur | String[4] | FK → CODE_REPONSE | Code erreur (Ennn) |
| commentaire | String[150] | | Commentaire |

---

### TRANCHE — Tranches de numeros

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | Integer | PK, AUTO, NOT NULL | Identifiant unique |
| is_active | Boolean | NOT NULL | Tranche active |
| operateur_id | Integer | FK → OPERATEUR (OPA) | Operateur attributaire |
| debut | String[10] | NOT NULL | Debut tranche (06nnnnnnnn) |
| fin | String[10] | NOT NULL | Fin tranche (06nnnnnnnn) |

---

### FERRYDAY — Jours feries

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| ferryday | Date | NOT NULL | Format AAAAMMJJ |
| creation | Date | | AAAAMMJJHHMMSS |
| is_active | Boolean | NOT NULL, default: 1 | Jour ferie actif |

---

### PORTAGE_DATA — Donnees portage par MSISDN

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| portage_id | Integer | FK → PORTAGE | Portage associe |
| creation_date | Date | default: CURRENT_TIMESTAMP | Date creation |
| temporary_msisdn | String | | MSISDN temporaire (06nnnnnnnn) |
| change_date | Date | default: NULL | Date changement |

---

### MSISDN_HISTORIQUE — Historique des numeros

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | Integer | PK, AUTO, NOT NULL | Identifiant unique |
| msisdn | String[10] | FK → MSISDN, NOT NULL | Numero concerne |
| operateur_id | Integer | FK → OPERATEUR, NOT NULL | Operateur |
| date_debut | Date | NOT NULL | Date debut |
| date_fin | Date | | Date fin (NULL si actuel) |
| portage_id | Integer | FK → PORTAGE | Portage associe |
