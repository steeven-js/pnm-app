# GPMAG — Évolutions ARCEP : restant à faire

**Date :** 20/04/2026 (MAJ 27/04/2026)

**Référence :** Décisions ARCEP 2022-2023
**Source :** `APP-OCS_EvolutionsARCEP.pptx` (25/01/2024)
**Dossier :** `S:\DRSI\DSI\APPLICATION\Domaines\Portabilité\04_Projet Portabilite PNMv3\01_Documentation\ARCEP\decisions arcep\2022-2024`

---

## Décisions ARCEP impactantes

| Décision | Sujet |
|----------|-------|
| 22-1583 | Plan national de numérotation et règles de gestion |
| 22-2148 | Modalités conservation des numéros (fixes, mobiles, SVA) |
| 2023-2499 | Numéros polyvalents / échanges plateforme technique |
| 2023-2748 | Préfixe de portabilité |
| 2023-2769 | MSRN |

## 8 fonctionnalités nouvelles

- Application : 7 évolutions
- Core : 3 évolutions
- VAS : 1 évolution

## Impacts budgétaires identifiés

| Domaine | Évolution | Estimation |
|---------|-----------|------------|
| Portabilité/DAPI | MSISDN longueur étendue | 3 jours |
| Portabilité/DAPI | Reporting ARCEP | À estimer |
| CRM | Stockage du RIO | À estimer |
| CRM | MSISDN longueur étendue | À estimer |
| API | Refus porta, RIO, message OADC | À estimer (Delivery) |
| VAS | SVI : 70% avancé, MEP prévue | En cours |
| Core | MSRN, préfixes de routage | En cours |

---

## 1. Migration des nouveaux préfixes de routage

**Statut :** EN COURS

### Côté Digicel

- Provisioning des nouveaux préfixes OC en base : FAIT (08/04/2026)
- Bascules quotidiennes avec nouveaux préfixes : OK
- Logs FNR post-bascule : OK sur les 3 territoires

| Territoire | Ancien préfixe | Nouveau préfixe OC |
|------------|----------------|--------------------|
| Guadeloupe | 60042 | 52303 |
| Guyane | 60042 | 52333 |
| Martinique | 60042 | 52313 |

### Côté Orange

- Migration réseau/carrier autour du 31/03/2026
- Problème de routage SMS identifié depuis le 31/03 (SRI for SM avec ancien RN 60042 ne parvient plus à Digicel)
- Ticket Orange IC : `TT 2604Z42280`
- Ticket BICS (carrier Digicel) : `SC5148552`

### Restant à faire

- [ ] Résolution du problème SMS avec ancien RN (entre Orange IC et BICS)
- [ ] Migration des anciens portages vers les nouveaux préfixes (actuellement seuls les nouveaux portages sont concernés)
- [ ] Vérifier les préfixes de routage Digicel (nos propres RN)
- [ ] Confirmer la date de bascule complète ancien → nouveau RN
- [ ] Coordonner avec tous les opérateurs la fin de support de l'ancien RN

### Planification migration des anciens portages (échange 27/04/2026)

- **Complexité côté Digicel :** faible
- **Durée :** dépend du nombre de lignes à updater
- **Point d'attention :** monitoring post-op en cas de problème service

**Calendrier retenu :**

- Bascule du 30/04/2026 : 9h00 (jours ouvrés, `EmaExtracter.sh`)
- Extraction : juste après la bascule du 30/04 (pas de modif prévue entre le 30/04 et le 04/05)
- Migration : dans la nuit du dimanche 03/05 au lundi 04/05 (Sarah dimanche soir → effectif disponible lundi matin pour monitoring)
- Périmètre : les 3 départements (Guadeloupe, Guyane, Martinique)
- Réalisation : Sarah Mogade

**Contexte :** long week-end du 01/05, astreinte uniquement disponible — d'où le choix de la nuit dimanche/lundi.

### Demande Kevin Renciot (CORE — 27/04/2026)

Kevin a besoin de fichiers historiques juste après la bascule du 30/04 pour préparer son côté (pas le fichier de bascule qui n'a pas tous les numéros).

Fichiers à fournir (Steeven) :

- [ ] Fichier des MSISDN portés IN Digicel, depuis Orange (historique des portages entrants OC → Digicel)
- [ ] Fichier des MSISDN portés OUT Digicel vers Orange (historique des portages sortants Digicel → OC)

Antoine Martin (CORE Network) ajouté à la conversation Teams par Kevin pour suivi.

### Point routage 27/04/2026 (Sarah / Frédéric / Kevin / Steeven)

**Décision :** on travaillera avec le **FNR** plutôt qu'avec une extraction PortaDB.

**Justification :**

- FNR plus précis (état routage réel)
- Les anciens numéros (avant DAPI) étaient générés avec **Pomme** → ils ne sont pas tous présents en base PortaDB
- FNR contient l'historique complet, y compris les portages pré-DAPI

**Implication :**

- L'extraction SQL préparée (`extraction_portes_orange_kevin.sql`) reste disponible mais n'est plus la source retenue
- Source retenue : **dump FNR** (172.24.2.21)

**Action retenue :**

- [ ] **Dump FNR** complet → réalisé par l'équipe **CORE**
  - Date génération : Jeudi 30/04/2026 (après la bascule de 9h)
  - Disponibilité : Vendredi 01/05/2026 — FNR « frais » (état du routage post-bascule du jeudi)
  - Périmètre : ensemble du routage FNR (3 départements)
- [ ] **Retraitement des données** → équipe **MIS**
  - Objectif : identifier les écarts, réconciliation possible entre FNR (état routage réel) et PortaDB (état PNM)

---

## 2. Preuve d'identité pour les portabilités

**Statut :** À DÉFINIR

**Décision ARCEP :** 22-2148 (Modalités conservation des numéros)
Sujet discuté au GPMAG du 16/04/2026.

### Restant à faire

- [ ] Définir les exigences de preuve d'identité
- [ ] Déterminer l'impact sur le processus de portabilité (ticket 1110)
- [ ] Identifier les modifications nécessaires côté Admin-Portal / PortaWS
- [ ] Planifier la mise en œuvre

---

## 3. Problème SMS numéros portés (lié au point 1)

**Statut :** EN COURS — CRITIQUE

### Impact

- SMS P2P et A2P non reçus par les MSISDN Orange portés chez Digicel
- 13 tickets clients (team VAS) + 6 MSISDN signalés initialement
- Problème identifié aussi avec UTS (ticket #277086)
- Nombreuses plaintes clients (SMS bancaires, Certicode, etc.)

Voir :

- [Diagnostic SMS portés Orange](sms-portes-orange-diagnostic.md)
- [Tickets SMS portés Orange](sms-portes-orange-tickets.md)
- [Ticket #277086 SMS UTS](ticket-277086-sms-uts.md)

### Restant à faire

- [ ] Orange IC doit fournir trace de forwarding à BICS
- [ ] BICS doit confirmer réception et routage
- [ ] Correction du routage SRI for SM ancien RN
- [ ] Vérifier le routage UTS pour les numéros portés
- [ ] Tester la réception SMS après correction

---

## 4. MSISDN étendu

**Statut :** À DÉFINIR

**Décision ARCEP :** 2024-0273 (Tranches à longueur étendue)
Sujet discuté au GPMAG — extension de la numérotation MSISDN.

### Impacts identifiés

Source : `APP-OCS_EvolutionsARCEP.pptx`.

- Portabilité/DAPI : 3 jours estimés
- CRM : évolution MSISDN longueur étendue
- API : évolution des API (charge à estimer avec Delivery)

### Restant à faire

- [ ] Définir le périmètre (nouvelles tranches, format étendu)
- [ ] Identifier l'impact sur les systèmes PNM (PortaDB, Admin-Portal, PNMDATA, FNR, PNMSYNC)
- [ ] Identifier l'impact sur les systèmes CRM (MasterCRM, base MSISDN)
- [ ] Évolution des API (refus porta, RIO, message OADC)
- [ ] Coordonner avec tous les opérateurs du GPMAG
- [ ] Planifier les développements et la mise en œuvre

### Documents de référence

- `2024-0273 Tranches a longueur etendue.pdf`
- `PNM_DecisionsArcep 2023.xlsx`
- `PNM_DecisionsArcep_Impacts_Fev2024.xlsx`

---

## Contacts clés

### Digicel

| Nom | Rôle | Contact |
|-----|------|---------|
| Antoine Martin | CORE Network | antoine.martin@digicelgroup.fr |
| Steeven Jacques | Application | steeven.jacques@digicelgroup.fr |
| Jean-Philippe Victoire | VAS | — |

### Orange

| Nom | Contact |
|-----|---------|
| Gérard Chenevier | gerard.chenevier@orange.com |
| Christophe Decaris | christophe.decaris@orange.com |
| Pascal Bastaraud | pascal.bastaraud@orange.com |
| Josy-Anne Leno | josyanne.leno@orange.com |

### UTS / FLOW

| Nom | Contact |
|-----|---------|
| Martin Paquette | Martin.Paquette@libertycaribbean.com |
| Raymond Marten | Raymond.Marten@libertycaribbean.com |
