# Architecture CRM MOBI / MasterCRM — Digicel Antilles-Guyane

> Document de reference pour le domaine MOBI/MasterCRM.
> Distille a partir de la session BMAD du 2026-03-13 (analyse morphologique, 61 sous-elements).
> Ce document sera enrichi au fur et a mesure de l'apprentissage.

---

## 1. Vue d'ensemble

### 1.1 Qu'est-ce que MOBI / MasterCRM ?

MOBI est le systeme CRM (Customer Relationship Management) de Digicel. MasterCRM est la base de donnees et l'application backend qui gere les informations clients, lignes, facturation et provisioning. Dans le contexte PNM, MOBI est le systeme qui recoit les notifications de portabilite (bascule, resiliation, changement MSISDN) via les microservices et les web services SOAP.

### 1.2 Architecture en 4 couches

```
Applications Clientes (Bill Pay, IVR, WebStore, SelfCare, USSD, MasterCRM UI)
        |
        v
DataPower Proxy (Spring Boot) — aiguilleur/routeur
  vmqprotodapi01/02
        |
        v
Microservices (MSLine, MSPorta, MSCustomer, DCAPI, eSIF, MSBilling, MSProvisioning, MSNotif)
  vmqpromsbox01/02 — port :3002, :3003, etc.
        |
        v
Backends (MasterCRM DB, Charging Gateway, ESB, systemes facturation)
  vmqprombdb01
```

### 1.3 Lien avec PNM/DAPI

DAPI (Digicel Application Portability Interface) communique avec MOBI via :
- **MSLine** (:3002) — `checkEligibility` : verification RIO pour eligibilite au portage
- **MSPorta** (:3003) — `notifyPorta` : notification quand portabilite sortante acceptee ou cloturee

---

## 2. Architecture technique

| # | Composant | Role | Statut connaissance |
|---|-----------|------|:---:|
| 2.1 | DataPower Proxy (Spring Boot) | Aiguilleur : routage requetes vers le bon microservice, config, logs | Partiellement connu |
| 2.2 | XToolWS (Java/Glassfish) | Intermediaire, logs via Graylog | Inconnu |
| 2.3 | Protocole REST/JSON | Utilise par certaines apps clientes | Partiellement connu |
| 2.4 | Protocole SOAP/XML | Utilise par les backends, structure WSDL, enveloppes | Partiellement connu |
| 2.5 | Flux de routage complet | App → Proxy → MS → Backend | Partiellement connu |
| 2.6 | Graylog / Logs | Centralisation logs, interface web | Inconnu |
| 2.7 | VIP / Load Balancing (f5-vip-kong) | Haute disponibilite | Inconnu |

---

## 3. Microservices

Deployes sur **vmqpromsbox01** et **vmqpromsbox02**.

| # | Service | Endpoint | Role | Statut |
|---|---------|----------|------|:---:|
| 3.1 | MSLine | :3002 | checkEligibility (verification RIO) | Connu |
| 3.2 | MSPorta | :3003 | notifyPorta (notification portabilite) | Connu |
| 3.3 | MSCustomer | ? | Acces SQL BDD CRM, donnees client | Inconnu |
| 3.4 | DCAPI | ? | API donnees client (difference avec MSCustomer a clarifier) | Inconnu |
| 3.5 | eSIF | ? | Info facturation, tables accedees | Inconnu |
| 3.6 | MSBilling | ? | Lien ESB-Billing WS, flux facturation | Inconnu |
| 3.7 | MSProvisioning | ? | Charging Gateway, activation/desactivation | Inconnu |
| 3.8 | MSNotif | ? | Envoi SMS/notifications | Inconnu |

### Deploiement et administration
- Serveurs : vmqpromsbox01, vmqpromsbox02
- Procedure deploiement, redemarrage : **Inconnu**
- Logs par microservice : **Inconnu**
- Health check (UP/DOWN) : **Inconnu**

---

## 4. Web Services SOAP

| # | Service | Detail | Statut |
|---|---------|--------|:---:|
| 4.1 | WSMobiMaster - WSProvisioning | 22 operations, binding | Connu |
| 4.2 | ExecuteChangeMSISDNPe | Requete/reponse, parametres, codes retour — operation critique PNM | A creuser |
| 4.3 | ExecuteResiliationPs | Requete/reponse, parametres, codes retour — operation critique PNM | A creuser |
| 4.4 | InfoLine | Structure reponse, usage diagnostic | A creuser |
| 4.5 | WSDL MOBI INT / PROD | Contenu, endpoints, differences | Inconnu |
| 4.6 | Bindings Porta SoapUI | Role de chacun | Partiellement connu |
| 4.7 | Codes erreur WS | Interpretation | Inconnu |

### Endpoints connus
- **WSDL MOBI PROD :** 172.24.4.136
- **MSLine :** 172.24.119.36:3002
- **MSPorta :** 172.24.119.36:3003

---

## 5. Base de donnees MasterCRM

| # | Element | Detail | Statut |
|---|---------|--------|:---:|
| 5.1 | Serveur | vmqprombdb01 — type BDD, connexion, acces | Inconnu |
| 5.2 | Tables portabilite | Tables liees aux operations de portage | Inconnu |
| 5.3 | Tables client/ligne | Structure donnees client | Inconnu |
| 5.4 | Tables facturation | Structure donnees facturation | Inconnu |
| 5.5 | Requetes diagnostiques | Requetes SQL pour diagnostic | Inconnu |
| 5.6 | Requetes de correction | Requetes SQL pour corrections manuelles | Inconnu |
| 5.7 | Relation PortaDB / MasterCRM | Lien direct ou via WS ? | Partiellement connu |

---

## 6. Interactions DAPI — MOBI

| # | Flux | Detail | Statut |
|---|------|--------|:---:|
| 6.1 | Bascule entrante | Sequence complete | Connu |
| 6.2 | Bascule sortante | Sequence complete | Connu |
| 6.3 | Incident CRM | Detection bascules non traitees (CP#6), relance | Connu |
| 6.4 | checkEligibility | Qui appelle, quand, contexte | Inconnu |
| 6.5 | notifyPorta | Payload exact, sequence complete | Inconnu |
| 6.6 | Gestion des erreurs | Retry, timeout, alertes | Inconnu |
| 6.7 | Logs d'interaction | Ou voir les traces (PortaSync, MOBI, Graylog) | Inconnu |

---

## 7. Applications clientes

Applications qui passent par le DataPower Proxy pour acceder aux services MOBI :

| # | Application | Protocole | Statut |
|---|-------------|-----------|:---:|
| 7.1 | Bill Pay Now / MDA | REST/JSON | Schema pptx seulement |
| 7.2 | IVR Payment / IVR TopUp | REST/JSON | Schema pptx seulement |
| 7.3 | Payment Terminal | REST/JSON | Schema pptx seulement |
| 7.4 | SelfCare (Data) | REST/JSON | Schema pptx seulement |
| 7.5 | WebStore | REST/JSON | Schema pptx seulement |
| 7.6 | USSD — GetRioInformation | ? | Schema pptx seulement |
| 7.7 | SINGLEVIEW — ServiceProvisioning | ? | Schema pptx seulement |
| 7.8 | MasterCRM (app) | Interface utilisateur | Inconnu |

---

## 8. Infrastructure / Serveurs

| # | Serveur | Role | Statut |
|---|---------|------|:---:|
| 8.1 | vmqpromsbox01/02 | Microservices MOBI | Inconnu |
| 8.2 | vmqprombdb01 | BDD MasterCRM | Inconnu |
| 8.3 | vmqprotodapi01/02 | DataPower Proxy | Inconnu |
| 8.4 | DigimobillmobiI0 | FrontEnd Soap | Inconnu |
| 8.5 | 172.24.4.136 | WSDL MOBI PROD | Connu (SoapUI) |
| 8.6 | 172.24.119.36 | MSLine :3002 + MSPorta :3003 | Connu |
| 8.7 | Graylog | Centralisation logs, acces, interface | Inconnu |
| 8.8 | Supervision / Monitoring | Outils, dashboards | Inconnu |

---

## 9. Procedures et Incidents

| # | Procedure | Detail | Statut |
|---|-----------|--------|:---:|
| 9.1 | Incident CRM — bascules non traitees | Detection CP#6, relance | Connu |
| 9.2 | Relance manuelle traitements CRM | Procedure exacte | Inconnu |
| 9.3 | Diagnostic ligne client apres bascule | Verification BDD + WS | Inconnu |
| 9.4 | Escalade equipe MOBI | Contacts, infos a fournir | Partiellement connu |
| 9.5 | Incidents SoapUI / WS down | Detection, contournement | Inconnu |
| 9.6 | Incidents microservices | Restart, logs, diagnostic | Inconnu |
| 9.7 | Procedure de provisioning | Activation/desactivation services | Inconnu |
| 9.8 | Flashinfo / Communication incidents | Canaux, processus | Partiellement connu |

---

## 10. Bilan des connaissances

| Dimension | Total | Connu | A creuser | Inconnu |
|-----------|:---:|:---:|:---:|:---:|
| Architecture technique | 7 | 0 | 3 | 4 |
| Microservices | 9 | 2 | 0 | 7 |
| Web Services SOAP | 7 | 1 | 3 | 3 |
| BDD MasterCRM | 7 | 0 | 0 | 6 |
| Interactions DAPI-MOBI | 7 | 3 | 0 | 4 |
| Applications clientes | 8 | 0 | 0 | 1 |
| Infrastructure | 8 | 2 | 0 | 6 |
| Procedures & Incidents | 8 | 1 | 0 | 5 |
| **TOTAL** | **61** | **9** | **6** | **36** |

> **15% connu, 10% a creuser, 59% inconnu, 16% schema pptx seulement**
> Zones les plus critiques a combler : BDD MasterCRM, microservices, infrastructure

---

## 11. Roadmap d'apprentissage

### Niveau 1 — Fondations
- Suivre une portabilite entrante de bout en bout (DAPI → MOBI → BDD)
- Comprendre l'architecture 4 couches (Apps → Proxy → MS → Backend)
- Maitriser les 2 operations critiques PNM : ExecuteChangeMSISDNPe + ExecuteResiliationPs
- Savoir ou trouver les logs (PNM, MOBI, Graylog)

### Niveau 2 — Approfondissement
- BDD MasterCRM : type, connexion, tables, requetes diagnostiques
- Microservices en detail : MSLine, MSPorta, MSCustomer, DCAPI, etc.
- Web Services SOAP : WSDL, requetes/reponses, codes erreur
- Gestion des erreurs : retry, timeout, detection ecarts

### Niveau 3 — Maitrise
- Procedures de relance CRM (manuelle, SoapUI, equipe MOBI)
- Infrastructure & Monitoring (Graylog, supervision, HA)
- Applications clientes (impact portabilite sur chaque app)
- Cas pratiques MOBI (incidents, diagnostics, corrections)

---

## 12. Questions ouvertes prioritaires

### BDD MasterCRM
1. Type de BDD ? (Oracle, SQL Server, PostgreSQL)
2. Comment se connecter a vmqprombdb01 ?
3. Table principale d'une "ligne" client ?
4. Tables modifiees par ExecuteChangeMSISDNPe ?
5. Tables modifiees par ExecuteResiliationPs ?
6. Relation PortaDB ↔ MasterCRM : lien direct ou via WS ?

### Microservices
7. Comment acceder aux microservices sur vmqpromsbox01/02 ?
8. Comment verifier si un microservice est UP/DOWN ?
9. Comment redemarrer un microservice individuel ?
10. MSCustomer vs DCAPI — quelle difference ?

### Interactions DAPI-MOBI
11. notifyPorta (:3003) — payload exact ?
12. checkEligibility (:3002) — qui l'appelle, quand ?
13. Si MSPorta repond en erreur, retry automatique ?
14. Ou voir les traces des appels DAPI → MOBI ?

### Infrastructure
15. URL et acces Graylog ?
16. Filtres Graylog pour appels DAPI → MOBI ?
17. Si vmqpromsbox01 tombe, failover automatique ?
18. Monitoring existant (Nagios, Zabbix, Prometheus) ?
