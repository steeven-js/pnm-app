# GPMAG — Évolutions ARCEP : restant à faire

**Date :** 20/04/2026 (MAJ 27/04/2026)

**Référence :** Décisions ARCEP 2022-2023
**Source :** `APP-OCS_EvolutionsARCEP.pptx` (25/01/2024)
**Dossier :** `S:\DRSI\DSI\APPLICATION\Domaines\Portabilité\04_Projet Portabilite PNMv3\01_Documentation\ARCEP\décisions arcep\2022-2024`

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

- [x] Résolution du problème SMS avec ancien RN (entre Orange IC et BICS) — **résolu**
- [x] Migration des anciens portages vers les nouveaux préfixes — **côté Digicel réalisée le 04/05/2026 22h** par Kevin Renciot (71 684 MSISDN + 86 tranches MSISDN_SERIES). Côté OAG à partir du 11/05.
- [ ] Vérifier les préfixes de routage Digicel (nos propres RN)
- [ ] Confirmer la date de bascule complète ancien → nouveau RN
- [ ] Coordonner avec tous les opérateurs (SFR, DT, UTS, Free) la fin de support de l'ancien RN 60042

### Dump FNR (réalisé)

- [x] **Dump FNR** complet → réalisé par l'équipe **CORE**
  - Généré le 30/04/2026 après la bascule de 9h
  - Disponibilité : 01/05/2026 — FNR post-bascule
  - Périmètre : ensemble du routage FNR (3 départements)
- [x] **Retraitement des données** → équipe **MIS** (réconciliation FNR vs PortaDB)

### Planification migration des anciens portages (replanifications successives)

- **Complexité côté Digicel :** faible
- **Durée :** dépend du nombre de lignes à updater
- **Point d'attention :** monitoring post-op en cas de problème service

**Historique des replanifications :**

| Date | Événement |
|------|-----------|
| 25/03 | Proposition initiale Christophe Decaris (OAG) — 01/04, 07-08/04 |
| 25/03 | Frédéric Arduin signale que SI Porta pas encore prête (correctif PIL-MEDIA en attente) |
| 30/03 | Kevin pousse à 08/04 / 28-29/04 (S16-S17 absent) |
| 08/04 | **Provisioning Digicel des nouveaux préfixes : FAIT** |
| 10/04 | Gérard Chenevier (OAG) demande de planifier les actions |
| 13/04 | **Provisioning OAG des nouveaux préfixes : OPÉRATIONNEL** |
| 20/04 | Steeven confirme à Christophe les préfixes Digicel (52301 / 52311 / 52331) — OK pour les nouveaux portages |
| 27/04 | Kevin annonce migration historiques dimanche 03/05 22h |
| 04/05 matin | Opération 03/05 non effectuée. Report annoncé au 10/05 22h |
| 04/05 fin journée | **Retournement** : SI valide migration lundi 04/05 ~22h |
| **04/05 22h00** | **Migration côté Digicel réalisée par Kevin Renciot** (71 684 MSISDN + 86 tranches) |

**Calendrier final :**

| Date | Événement | État |
|------|-----------|------|
| 04/05/2026 22h00 | Migration côté Digicel | ✅ **RÉALISÉE** |
| 05/05/2026 matin | Monitoring de la montée en charge | ✅ **RÉALISÉ** |
| À partir du 11/05/2026 | Migration côté OAG par Christophe Decaris | Planifié |
| Mi-mai 2026 | Clôture du ticket #276845 | À faire |

### Demande Kevin Renciot (CORE — 27/04/2026)

Kevin avait besoin de fichiers historiques pour préparer la migration. **Décision finale** : utilisation directe du **dump FNR** plutôt qu'une extraction PortaDB.

### Point routage 27/04/2026 (Sarah / Frédéric / Kevin / Steeven)

**Décision :** on travaille avec le **FNR** plutôt qu'avec une extraction PortaDB.

**Justification :**

- FNR plus précis (état routage réel)
- Les anciens numéros (avant DAPI) étaient générés avec **Pomme** → ils ne sont pas tous présents en base PortaDB
- FNR contient l'historique complet, y compris les portages pré-DAPI

**Implication :**

- L'extraction SQL préparée (`extraction_portes_orange_kevin.sql`) reste disponible mais n'est plus la source retenue
- Source retenue : **dump FNR** (172.24.2.21)

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

**Statut :** RÉSOLU

### Impact (historique)

- SMS P2P et A2P non reçus par les MSISDN Orange portés chez Digicel
- 13 tickets clients (team VAS) + 6 MSISDN signalés initialement
- Problème identifié aussi avec UTS (ticket #277086)
- Nombreuses plaintes clients (SMS bancaires, Certicode, etc.)

### Résolution

Routage SRI for SM corrigé entre Orange IC et BICS suite à la coordination des migrations de préfixes. Les SMS arrivent à nouveau correctement aux MSISDN portés.

Voir :

- [Diagnostic SMS portés Orange](sms-portes-orange-diagnostic.md)
- [Tickets SMS portés Orange](sms-portes-orange-tickets.md)
- [Ticket #277086 SMS UTS](ticket-277086-sms-uts.md)

### Actions menées (closes)

- [x] Orange IC a fourni trace de forwarding à BICS
- [x] BICS a confirmé réception et routage
- [x] Correction du routage SRI for SM ancien RN
- [x] Vérification du routage UTS pour les numéros portés
- [x] Réception SMS testée et confirmée OK

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
