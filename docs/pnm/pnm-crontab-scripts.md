# Documentation des Scripts Crontab - PORTA PNMV3

> Serveur : `vmqproportawebdb01`
> Utilisateur systeme : `porta_pnmv3`
> Repertoire scripts : `/home/porta_pnmv3/Scripts/`
> Repertoire logs : `/home/porta_pnmv3/Log/`
> Source : `/etc/crontab`

---

## Vue d'ensemble

Les taches cron du projet PORTA PNMV3 assurent l'automatisation des operations de portabilite des numeros mobiles : export de donnees, verification des bascules, gestion des restitutions, facturation et controles divers.

---

## Taches actives

### 1. Export CSV de PortaDB vers EMM/MIS

| Parametre | Valeur |
|-----------|--------|
| **Script** | `PortaDB-export-csv.sh` |
| **Planification** | Tous les jours a 00h00 |
| **Cron** | `00 00 * * 1-7` |
| **Utilisateur** | `porta_pnmv3` |
| **Log** | `PortaDB-export-csv.log` |
| **Description** | Export des tables de la base PortaDB au format CSV sur le serveur EMM pour alimentation du systeme MIS (Management Information System). |

---

### 2. Verification Bascule Porta MOBI

Verification que les bascules de portabilite mobile se sont correctement executees.

#### 2a. Execution du lundi

| Parametre | Valeur |
|-----------|--------|
| **Script** | `Pnm-Verif-Bascule-MOBI.sh` |
| **Planification** | Lundi a 09h55 |
| **Cron** | `55 09 * * 1` |
| **Utilisateur** | `root` |
| **Log** | `Pnm-Verif-Bascule-MOBI.sh.log` |
| **Description** | Verification des bascules du week-end. Horaire decale (09h55 au lieu de 09h15) pour laisser le temps au traitement des bascules accumulees. |

#### 2b. Execution mardi a vendredi - matin

| Parametre | Valeur |
|-----------|--------|
| **Script** | `Pnm-Verif-Bascule-MOBI.sh` |
| **Planification** | Mardi a vendredi a 09h15 |
| **Cron** | `15 09 * * 2-5` |
| **Utilisateur** | `root` |
| **Log** | `Pnm-Verif-Bascule-MOBI.sh.log` |
| **Description** | Premiere verification quotidienne des bascules du matin. |

#### 2c. Execution mardi a vendredi - fin de matinee

| Parametre | Valeur |
|-----------|--------|
| **Script** | `Pnm-Verif-Bascule-MOBI.sh` |
| **Planification** | Mardi a vendredi a 10h54 |
| **Cron** | `54 10 * * 2-5` |
| **Utilisateur** | `root` |
| **Log** | `Pnm-Verif-Bascule-MOBI.sh.log` |
| **Description** | Seconde verification quotidienne des bascules. Permet de detecter les bascules traitees apres la premiere verification. |

---

### 3. Bascule des Restitutions Sortantes

| Parametre | Valeur |
|-----------|--------|
| **Script** | `Pnm-Restitutions-Sortantes-Bascule.sh` |
| **Planification** | Lundi a vendredi a 12h30 |
| **Cron** | `30 12 * * 1-5` |
| **Utilisateur** | `porta_pnmv3` |
| **Log** | `Pnm-Restitutions-Sortantes-Bascule.sh.log` |
| **Description** | Bascule des restitutions sortantes (statut Saisi vers Dossier de restitution initie). Concerne les numeros que Digicel restitue a un autre operateur. |

---

### 4. Bascule des Restitutions Entrantes

| Parametre | Valeur |
|-----------|--------|
| **Script** | `Pnm-Restitutions-Entrantes-Bascule.sh` |
| **Planification** | Lundi a vendredi a 21h25 |
| **Cron** | `25 21 * * 1-5` |
| **Utilisateur** | `porta_pnmv3` |
| **Log** | `Pnm-Restitutions-Entrantes-Bascule.sh.log` |
| **Description** | Bascule des restitutions entrantes. Concerne les numeros restitues a Digicel par un autre operateur. Execution en soiree pour integration nocturne. |

---

### 5. Generation des tickets Restitutions Sortantes

| Parametre | Valeur |
|-----------|--------|
| **Script** | `Pnm-Restitutions-Sortantes-Tickets.sh` |
| **Planification** | Lundi a vendredi a 11h15 |
| **Cron** | `15 11 * * 1-5` |
| **Utilisateur** | `porta_pnmv3` |
| **Log** | `Pnm-Restitutions-Sortantes-Tickets.sh.log` |
| **Description** | Generation des tickets de restitution sortante pour les dossiers en cours. |

---

### 6. Facturation mensuelle PEN inter-operateurs

| Parametre | Valeur |
|-----------|--------|
| **Script** | `Pnm_Facturation_Mensuelle_PEN.sh` |
| **Planification** | Le 1er de chaque mois a 00h05 |
| **Cron** | `05 00 1 * *` |
| **Utilisateur** | `porta_pnmv3` |
| **Log** | Sortie standard (pas de redirection) |
| **Description** | Generation des fichiers de facturation mensuelle pour les portages entrants (PEN) inter-operateurs. **Execution obligatoire le 1er de chaque mois.** |

---

### 7. Facturation mensuelle PSO inter-operateurs

| Parametre | Valeur |
|-----------|--------|
| **Script** | `Pnm_Facturation_Mensuelle_PSO.sh` |
| **Planification** | Le 1er de chaque mois a 00h10 |
| **Cron** | `10 00 1 * *` |
| **Utilisateur** | `porta_pnmv3` |
| **Log** | Sortie standard (pas de redirection) |
| **Description** | Generation des fichiers de facturation mensuelle pour les portages sortants (PSO) inter-operateurs. **Execution obligatoire le 1er de chaque mois.** |

---

### 8. Verification tickets 1210 - portages a J+1 (mardi a vendredi)

| Parametre | Valeur |
|-----------|--------|
| **Script** | `Pnm_1210_awaiting.sh` |
| **Planification** | Mardi a vendredi a 11h30 |
| **Cron** | `30 11 * * 2-5` |
| **Utilisateur** | `porta_pnmv3` |
| **Log** | `Pnm_1210_awaiting.log` |
| **Description** | Verification des tickets de type 1210 recus pour les portages prevus a J+1. Le ticket 1210 correspond a l'accuse de reception de la demande de portage. |

---

### 9. Verification tickets 1210 + 1430 + 3430 (lundi)

| Parametre | Valeur |
|-----------|--------|
| **Script** | `Pnm_tickets_awaiting.sh` |
| **Planification** | Lundi a 11h30 |
| **Cron** | `30 11 * * 1` |
| **Utilisateur** | `porta_pnmv3` |
| **Log** | `Pnm_tickets_awaiting.log` |
| **Description** | Verification elargie du lundi : tickets 1210 pour portages a J+1 et tickets 1430/3430 recus a S-1 (semaine precedente). Couvre le rattrapage du week-end. |

---

### 10. Verification tickets 1110 transmis a UTS (mode degrade)

| Parametre | Valeur |
|-----------|--------|
| **Script** | `Pnm_1110_DC_vers_UTS.sh` |
| **Planification** | Lundi a vendredi a 11h30, 15h30 et 20h30 |
| **Cron** | `30 11,15,20 * * 1-5` |
| **Utilisateur** | `porta_pnmv3` |
| **Log** | `Pnm_1110_DC_vers_UTS.log` |
| **Description** | Verification des tickets 1110 transmis a l'operateur UTS. Detecte les cas necessitant la creation d'un ticket 1210 a integrer en mode degrade (procedure de secours). Trois executions par jour pour un suivi rapproche. |

---

### 11. Gestion portabilites B2B vers Free Caraibe

| Parametre | Valeur |
|-----------|--------|
| **Script** | `refus_porta_free_b2b.sh` |
| **Planification** | Lundi a vendredi a 09h30, 11h30, 15h30 et 20h30 |
| **Cron** | `30 09,11,15,20 * * 1-5` |
| **Utilisateur** | `porta_pnmv3` |
| **Log** | `refus_porta_free_b2b.log` |
| **Description** | Gestion des cas de portabilite B2B (Business to Business) vers Free Caraibe. Quatre executions quotidiennes pour traiter les demandes en temps quasi-reel. |

---

### 12. Reporting refus de portabilite - RIO incorrect

| Parametre | Valeur |
|-----------|--------|
| **Script** | `check_refus_porta_rio_incorrect.sh` |
| **Planification** | Lundi a vendredi a 09h00 |
| **Cron** | `00 09 * * 1-5` |
| **Utilisateur** | `porta_pnmv3` |
| **Log** | `check_refus_porta_rio_incorrect.log` |
| **Description** | Generation d'un rapport sur les cas de refus de portabilite avec motif "RIO incorrect". Permet de detecter les problemes de saisie ou de synchronisation des RIO. |

---

### 13. Facturation annuelle PEN inter-operateurs

| Parametre | Valeur |
|-----------|--------|
| **Script** | `Pnm_Facturation_Annuelle_PEN.sh` |
| **Planification** | Le 1er janvier de chaque annee |
| **Cron** | `@yearly` |
| **Utilisateur** | `porta_pnmv3` |
| **Log** | Sortie standard (pas de redirection) |
| **Description** | Generation du mail de facturation annuelle pour les portages entrants (PEN) inter-operateurs. **Execution automatique une fois par an.** |

---

## Taches desactivees (commentees)

Les taches suivantes sont presentes dans le crontab mais desactivees :

| Script | Ancienne planification | Description | Raison probable |
|--------|----------------------|-------------|-----------------|
| `PortaDB-export-csv.sh` | 12h00, tous les jours | Second export CSV quotidien | Doublon - un seul export a minuit est suffisant |
| `Pnm-Verif-Bascule-MOBI_CCA.sh` | 10h30, lun-ven | Verification bascule - envoi CCARE | Fonctionnalite transferee ou obsolete |
| `Pnm-Restitutions-Sortantes-Tickets-ratp.sh` | 12h00, lun-ven | Tickets restitutions sortantes RATP en masse | Traitement ponctuel (RT#254708) termine |
| `Pnm_Stats_Bascule_ESB.sh` | 09h55, lun-ven | Rapports statistiques ESB du jour | Reporting ESB desactive |

---

## Planification horaire recapitulative

### Jours ouvres (lundi a vendredi)

| Heure | Script | Frequence |
|-------|--------|-----------|
| 00:00 | `PortaDB-export-csv.sh` | Tous les jours |
| 00:05 | `Pnm_Facturation_Mensuelle_PEN.sh` | 1er du mois |
| 00:10 | `Pnm_Facturation_Mensuelle_PSO.sh` | 1er du mois |
| 09:00 | `check_refus_porta_rio_incorrect.sh` | Lun-ven |
| 09:15 | `Pnm-Verif-Bascule-MOBI.sh` | Mar-ven |
| 09:30 | `refus_porta_free_b2b.sh` | Lun-ven |
| 09:55 | `Pnm-Verif-Bascule-MOBI.sh` | Lundi uniquement |
| 10:54 | `Pnm-Verif-Bascule-MOBI.sh` | Mar-ven |
| 11:15 | `Pnm-Restitutions-Sortantes-Tickets.sh` | Lun-ven |
| 11:30 | `Pnm_1210_awaiting.sh` | Mar-ven |
| 11:30 | `Pnm_tickets_awaiting.sh` | Lundi uniquement |
| 11:30 | `Pnm_1110_DC_vers_UTS.sh` | Lun-ven |
| 11:30 | `refus_porta_free_b2b.sh` | Lun-ven |
| 12:30 | `Pnm-Restitutions-Sortantes-Bascule.sh` | Lun-ven |
| 15:30 | `Pnm_1110_DC_vers_UTS.sh` | Lun-ven |
| 15:30 | `refus_porta_free_b2b.sh` | Lun-ven |
| 20:30 | `Pnm_1110_DC_vers_UTS.sh` | Lun-ven |
| 20:30 | `refus_porta_free_b2b.sh` | Lun-ven |
| 21:25 | `Pnm-Restitutions-Entrantes-Bascule.sh` | Lun-ven |

### Week-end (samedi et dimanche)

| Heure | Script |
|-------|--------|
| 00:00 | `PortaDB-export-csv.sh` |

---

## Arborescence sur le serveur

```
/home/porta_pnmv3/
├── Scripts/
│   ├── PortaDB-export-csv.sh
│   ├── Pnm-Verif-Bascule-MOBI.sh
│   ├── Pnm-Restitutions-Sortantes-Bascule.sh
│   ├── Pnm-Restitutions-Entrantes-Bascule.sh
│   ├── Pnm-Restitutions-Sortantes-Tickets.sh
│   ├── Pnm_Facturation_Mensuelle_PEN.sh
│   ├── Pnm_Facturation_Mensuelle_PSO.sh
│   ├── Pnm_Facturation_Annuelle_PEN.sh
│   ├── Pnm_1210_awaiting.sh
│   ├── Pnm_tickets_awaiting.sh
│   ├── Pnm_1110_DC_vers_UTS.sh
│   ├── refus_porta_free_b2b.sh
│   └── check_refus_porta_rio_incorrect.sh
└── Log/
    ├── PortaDB-export-csv.log
    ├── Pnm-Verif-Bascule-MOBI.sh.log
    ├── Pnm-Restitutions-Sortantes-Bascule.sh.log
    ├── Pnm-Restitutions-Entrantes-Bascule.sh.log
    ├── Pnm-Restitutions-Sortantes-Tickets.sh.log
    ├── Pnm_1210_awaiting.log
    ├── Pnm_tickets_awaiting.log
    ├── Pnm_1110_DC_vers_UTS.log
    ├── refus_porta_free_b2b.log
    └── check_refus_porta_rio_incorrect.log
```

---

## Notes operationnelles

- **Tous les scripts actifs** utilisent l'option `-v` (mode verbose) pour un suivi detaille dans les logs.
- **Les logs** sont en mode append (`>>`) : ils grossissent continuellement et doivent etre purges regulierement (rotation de logs recommandee).
- **Les scripts de facturation** (PEN et PSO mensuels) n'ont pas de redirection de log explicite - verifier si les scripts gerent eux-memes leur sortie.
- **Les verifications de bascule** tournent sous l'utilisateur `root` (necessite des privileges eleves), tandis que la plupart des autres scripts tournent sous `porta_pnmv3`.
- **Ordre d'execution critique** : les tickets de restitution sortante (11h15) sont generes avant la bascule (12h30), ce qui est coherent avec le workflow.
