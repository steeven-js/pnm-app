# Base de Connaissances Digicel — Index

> Table des matieres de la documentation architecture Digicel Antilles-Guyane.
> Pour orienter Claude automatiquement, voir `/CLAUDE.md` en racine du projet.

---

## PNM — Portabilite des Numeros Mobiles

| Document | Description |
|----------|-------------|
| [pnm-context-portabilite.md](pnm/pnm-context-portabilite.md) | Document principal : processus PNM, architecture technique (DAPI, ESB, PortaSync, PortaDB), echanges inter-operateurs, procedures exploitation quotidiennes, RIO, FNR, connexions |
| [pnm-crontab-scripts.md](pnm/pnm-crontab-scripts.md) | Documentation exhaustive des 13 taches cron PORTA PNMV3 (vmqproportawebdb01), planification horaire, arborescence serveur |
| pnm-porta-database.md | *(a creer)* Schema et modele de donnees Porta v3.0.15 |
| pnm-porta-body.md | *(a creer)* Architecture applicative Porta v3.0.15 |

## MOBI / MasterCRM

| Document | Description |
|----------|-------------|
| mobi-architecture.md | *(a creer)* Architecture CRM MOBI : microservices, WS SOAP, BDD MasterCRM, interactions DAPI-MOBI, infrastructure — base : matrice 61 elements session BMAD 03-13 |
| mobi-cas-pratiques.md | *(futur)* Cas pratiques MOBI/MasterCRM : scenarios operationnels, workflows metier |
| mobi-sql-queries.md | *(futur)* Requetes SQL diagnostiques MasterCRM |

## Reglementaire

| Document | Description |
|----------|-------------|
| annexes-inter-operateurs.md | *(a creer)* Cadre GPMAG/ARCEP : Guichet Unique, specifications interfaces, organisation inter-operateurs, systeme d'echange — consolide des 4 annexes |

## Operations

| Document | Description |
|----------|-------------|
| debug-patterns.md | *(futur)* Patterns de debug et troubleshooting : erreurs frequentes, diagnostics, resolutions |
| tickets-rt-knowledge-base.md | *(futur)* Base de connaissances tickets RT (historique Frederic Arduin, 7742 tickets) |

---

## Sources de reference (non converties)

Fichiers bruts dans `C:/Users/SJ623255/OneDrive - Digicel Caribbean Ltd/Bureau/Porta_Steeven/` :

| Fichier | Statut |
|---------|--------|
| Porta-v3.0.15 Database.pdf | A convertir → pnm/pnm-porta-database.md |
| Porta-v3.0.15 Body.pdf | A convertir → pnm/pnm-porta-body.md |
| Annexes/ (4 documents .doc) | A consolider → reglementaire/annexes-inter-operateurs.md |
| Interfaces_DAP_SI.docx | ~70% deja dans pnm-context-portabilite.md |
| Manuel exploitation PORTA.docx | ~80% deja dans pnm-context-portabilite.md |
| PNMV3-Transfert de co SI App-v4.0_2026.pptx | Partiellement dans pnm-context-portabilite.md |
| Commandes_FNR.xlsx | 100% dans pnm-context-portabilite.md |
| test de connexion new server pnm oc.txt | 100% dans pnm-context-portabilite.md |
