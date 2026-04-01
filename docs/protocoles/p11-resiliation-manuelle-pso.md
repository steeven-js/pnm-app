# P11 — Resiliation manuelle PSO (SoapUI)

**Categorie :** Portabilite
**Serveur :** vmqproportaweb01 (DAPI)
**Utilisateur :** porta_pnmv3
**Declencheur :** MSISDN en portabilite sortante non resilie automatiquement

---

## Contexte

Effectuer manuellement la resiliation d'un MSISDN en portabilite sortante non resilie automatiquement.

## Etapes

### 1. Identifier les MSISDN non resilies

Le script Pnm_pso_lignes_non_resiliees.sh ou le monitoring PNM App detecte les MSISDN PSO non resilies.

### 2. Ouvrir SoapUI

Ouvrir SoapUI et se connecter au DAPI (PortaWs).
URL : http://172.24.119.72:8080/PortaWs/

### 3. Executer la resiliation

Appeler le Web Service de resiliation pour chaque MSISDN concerne.
Voir Cas Pratique #18 pour la procedure detaillee SoapUI.

> **Attention :** Verifier dans PortaDB que le portage sortant est bien confirme avant de resilier.

### 4. Verifier dans MOBI

Confirmer que la ligne est bien resiliee dans MasterCRM apres l'appel WS.
