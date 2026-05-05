# Base de Connaissances Digicel — Index

> Table des matières de la documentation architecture Digicel Antilles-Guyane.
> Pour orienter Claude automatiquement, voir `/CLAUDE.md` en racine du projet.

---

## PNM — Portabilité des Numéros Mobiles

| Document | Description |
|----------|-------------|
| [pnm-context-portabilité.md](pnm/pnm-context-portabilite.md) | Document principal : processus PNM, architecture technique (DAPI, ESB, PortaSync, PortaDB), échanges inter-opérateurs, procédures exploitation quotidiennes, RIO, FNR, connexions |
| [pnm-crontab-scripts.md](pnm/pnm-crontab-scripts.md) | Documentation exhaustive des 13 tâches cron PORTA PNMV3 (vmqproportawebdb01), planification horaire, arborescence serveur |
| pnm-porta-database.md | *(à créer)* Schéma et modèle de données Porta v3.0.15 |
| pnm-porta-body.md | *(à créer)* Architecture applicative Porta v3.0.15 |

## MOBI / MasterCRM

| Document | Description |
|----------|-------------|
| mobi-architecture.md | *(à créer)* Architecture CRM MOBI : microservices, WS SOAP, BDD MasterCRM, interactions DAPI-MOBI, infrastructure — base : matrice 61 éléments session BMAD 03-13 |
| mobi-cas-pratiques.md | *(futur)* Cas pratiques MOBI/MasterCRM : scénarios opérationnels, workflows métier |
| mobi-sql-queries.md | *(futur)* Requêtes SQL diagnostiques MasterCRM |

## Réglementaire

| Document | Description |
|----------|-------------|
| annexes-inter-opérateurs.md | *(à créer)* Cadre GPMAG/ARCEP : Guichet Unique, spécifications interfaces, organisation inter-opérateurs, système d'échange — consolidé des 4 annexes |

## Opérations

| Document | Description |
|----------|-------------|
| [operations/index.md](operations/index.md) | **Index Opérations en cours** — dossiers actifs (GPMAG, PILMEDIA) |
| [operations/gpmag/gpmag-évolutions-arcep.md](operations/gpmag/gpmag-evolutions-arcep.md) | Suivi des évolutions ARCEP / migration préfixes routage Orange / dump FNR |
| [operations/gpmag/sms-portes-orange-diagnostic.md](operations/gpmag/sms-portes-orange-diagnostic.md) | Diagnostic SMS non reçus par les MSISDN Orange portés chez Digicel |
| [operations/pilmedia/points-actuels.md](operations/pilmedia/points-actuels.md) | Points en cours PILMEDIA / Max Morawski |
| debug-patterns.md | *(futur)* Patterns de debug et troubleshooting : erreurs fréquentes, diagnostics, résolutions |
| tickets-rt-knowledge-base.md | *(futur)* Base de connaissances tickets RT (historique Frederic Arduin, 7742 tickets) |

---

## Sources de référence (non converties)

Fichiers bruts dans `C:/Users/SJ623255/OneDrive - Digicel Caribbean Ltd/Bureau/Porta_Steeven/` :

| Fichier | Statut |
|---------|--------|
| Porta-v3.0.15 Database.pdf | À convertir → pnm/pnm-porta-database.md |
| Porta-v3.0.15 Body.pdf | À convertir → pnm/pnm-porta-body.md |
| Annexes/ (4 documents .doc) | À consolider → reglementaire/annexes-inter-opérateurs.md |
| Interfaces_DAP_SI.docx | ~70% déjà dans pnm-context-portabilité.md |
| Manuel exploitation PORTA.docx | ~80% déjà dans pnm-context-portabilité.md |
| PNMV3-Transfert de co SI App-v4.0_2026.pptx | Partiellement dans pnm-context-portabilité.md |
| Commandes_FNR.xlsx | 100% dans pnm-context-portabilité.md |
| test de connexion new server pnm oc.txt | 100% dans pnm-context-portabilité.md |
