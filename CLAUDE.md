# PNM-App — Base de Connaissances Architecture Digicel

## Projet

Application interne de gestion des connaissances pour l'architecture Digicel Antilles-Guyane (Portabilite des Numeros Mobiles, CRM MOBI/MasterCRM). Sert de hub de travail pour le debug, l'architecture, les operations et la documentation.

**Stack :** Laravel 12 + Inertia.js + React/TypeScript + SQLite
**Utilisateur principal :** Charge d'application Digicel, zone Antilles-Guyane

## Base de connaissances (docs/)

Quand on te pose une question sur l'architecture Digicel, les operations PNM, le CRM MOBI ou le debug, consulte ces fichiers :

### PNM — Portabilite des Numeros Mobiles
- `docs/pnm/pnm-context-portabilite.md` — **Document principal.** Vue complete PNM : processus client, echanges inter-operateurs (vacations, tickets, PNMDATA/PNMSYNC), architecture technique (DAPI, ESB, PortaSync, PortaDB), serveurs, web services, scripts, procedures d'exploitation quotidiennes, RIO, commandes FNR, connexions/acces.
- `docs/pnm/pnm-crontab-scripts.md` — Documentation exhaustive de tous les crontabs PORTA PNMV3 sur vmqproportawebdb01 (13 taches actives, planification horaire, arborescence serveur).
- `docs/pnm/pnm-porta-database.md` — Schema complet BDD PortaDB v3.0.15 : 15 tables (PNMDATA, PORTAGE, MSISDN, DOSSIER, OPERATEUR, ETAT, CODE_TICKET, CODE_REPONSE, TRANSITION, PORTAGE_HISTORIQUE, FICHIER, SYNC, ACK, TRANCHE, MSISDN_HISTORIQUE) avec colonnes, types, FK et relations.
- `docs/pnm/pnm-porta-body.md` — Architecture applicative Porta v3.0.15 : 3 interfaces WS (DigicelFwiEsbWs4Porta, DigicelFwiPortaWs4Esb, DigicelFwiPortaWs4PortaSync), structure fichiers PNMDATA/PNMSYNC, structure tickets par type (1XXX/2XXX/3XXX/7000), 5 diagrammes d'etat (entrante/sortante/etrangere/inverse/restitution).

### MOBI / MasterCRM
- `docs/mobi/mobi-architecture.md` — Architecture CRM MOBI : 8 dimensions (architecture technique, microservices, WS SOAP, BDD MasterCRM, interactions DAPI-MOBI, applications clientes, infrastructure, procedures). Matrice de 61 sous-elements avec statuts connu/inconnu. Roadmap d'apprentissage 3 niveaux.

### Reglementaire
- `docs/reglementaire/annexes-inter-operateurs.md` — Cadre GPMAG/ARCEP consolide (4 annexes) : references ARCEP, delais detailles, motifs refus (codes R/A), motifs annulation (codes C), codes erreurs fichiers (E000-E999), qualite de service, gestion incidents inter-OP, securite sFTP/SSH, tests.

## Architecture de l'application

### Backend (Laravel)
- `app/Models/` — Eloquent models (Article, KnowledgeDomain, GlossaryTerm, PnmCode, etc.)
- `app/Services/` — Services metier (ChatService, SqlPlaygroundService, VectorSearchService, EmbeddingService)
- `app/Http/Controllers/` — Controllers Inertia
- `routes/web.php` — Routes principales

### Frontend (React/TypeScript via Inertia)
Pages principales dans `resources/js/pages/` :
- **Operations PNM :** OperationsGuide, CrontabScripts, ScriptsPnm, RequetesPnm, SqlPlayground, SqlScenarios
- **MOBI/CRM :** MobiCrm, MobiCasPratiques, MobiOperations, MobiSqlQueries
- **Knowledge Base :** Knowledge/ (Domain, Article, Index), Glossary/, TicketsKnowledge
- **Outils :** PnmDataGenerator, Contacts, Diagrams/, CasPratiques, Investigations/
- **Suivi :** Dashboard, Progress/, Onboarding/, Changelog

### Base de donnees
- SQLite (`database/database.sqlite`)
- Migrations dans `database/migrations/`

## Contexte operationnel cle

- **Operateurs GPMAG :** Orange (01), Digicel (02), SFR/OMT (03), Dauphin (04), UTS (05), Free (06)
- **Serveurs PORTA :** vmqproportasync01 (PortaSync), vmqproportawebdb01 (PortaDB), vmqproportaweb01 (PortaWebUi/DAPI)
- **Serveurs MOBI :** vmqpromsbox01/02 (microservices), vmqprombdb01 (BDD MasterCRM)
- **3 vacations quotidiennes :** 10H, 14H, 19H (lun-ven) + synchro dimanche 22H
- **sFTP inter-operateurs :** pnm_02@193.251.160.208 (port 22)
- **Portail DAPI :** http://172.24.119.72:8080/PortaWs/

## Sessions BMAD (archives de reflexion)

Les sessions de brainstorming sont dans `_bmad-output/brainstorming/`. Elles contiennent le processus de reflexion, pas la connaissance consolidee (celle-ci est dans docs/).
- `brainstorming-session-2026-02-27.md` — Session initiale sauvegarde PNM
- `brainstorming-session-2026-03-13.md` — Plan documentation MOBI/CRM (matrice 61 elements, 45 questions, roadmap 3 niveaux)
- `brainstorming-session-2026-03-25.md` — Base de connaissances tickets RT (7742 tickets)
- `brainstorming-session-2026-03-27.md` — Organisation KB Digicel (ce plan)
