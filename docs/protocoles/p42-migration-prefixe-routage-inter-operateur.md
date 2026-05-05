# P42 — Migration d'un préfixe de routage inter-opérateur

**Catégorie :** Coordination inter-opérateurs / Réseau
**Déclencheur :** Évolution ARCEP nécessitant une migration de RN entre Digicel et un opérateur partenaire (Orange, SFR, DT, UTS, Free)
**Acteurs :** CORE Network (Digicel + partenaire), Application (PNM), VAS, Carriers (BICS, Orange IC...)
**Durée :** 4 à 8 semaines (préparation → décommissionnement)

---

## Contexte

Le passage de l'ancien RN unique (`60041` Orange / `60042` Digicel / `60043` DT / `60044` SFRC / `60045` UTS / `60048` Free) aux nouveaux RN territorialisés ARCEP (`5230x` / `5231x` / `5233x`) impose une **coordination bilatérale** stricte entre les opérateurs et leurs carriers.

Une migration mal coordonnée provoque des **incidents de routage SMS** (cf. cas Orange du 31/03/2026 : 13+ tickets RT clients, 5 semaines de résolution).

Voir [rn-routage-prefixes.md](../operations/gpmag/rn-routage-prefixes.md) pour la liste des RN par opérateur et territoire.

## Cas d'école : incident Orange du 31/03/2026

**3 erreurs à ne pas reproduire** :

1. **Migration carrier non coordonnée** : Orange IC a migré son routage interne le 31/03 sans annoncer à Digicel ni à BICS → l'ancien RN `60042` a perdu son chemin entre Orange IC et BICS
2. **Pas de phase pilote / test progressif** : passage brutal sans observation préalable
3. **Pas de période de chevauchement** : ancien RN devenu silencieusement non routable, SMS perdus

→ Voir le diagnostic complet : [sms-portes-orange-diagnostic.md](../operations/gpmag/sms-portes-orange-diagnostic.md)

---

## Phase 1 — Préparation (J-30)

### Objectif

Cadrer la migration avec l'opérateur partenaire et identifier tous les acteurs.

### Actions

- [ ] **Réunion de cadrage bilatérale** avec l'opérateur partenaire :
  - Calendrier validé des 2 côtés (provisioning + migration historique)
  - Contacts CORE et SI des deux côtés
  - Carriers communs identifiés (BICS, Orange IC, Tata Communications...)
- [ ] **Création d'un ticket RT** dans la file APPLICATIONS (Type Ticket : `Operation de Maintenance Planifiee`) pour tracer toutes les actions
- [ ] **Documenter les anciens et nouveaux RN** dans `docs/operations/gpmag/rn-routage-prefixes.md`
- [ ] **Lister les MSISDN concernés** (extraction PortaDB/FNR) :
  - Volume PEN (entrants Digicel) avec cet opérateur
  - Volume PSO (sortants Digicel) avec cet opérateur
- [ ] **Constituer la liste de diffusion** : CORE Network Digicel, CORE partenaire, VAS Digicel, Application Digicel, FWI_PNM_SI, contacts carriers

---

## Phase 2 — Provisioning des nouveaux portages (J-15)

### Objectif

Provisionner le nouveau RN uniquement pour les **nouveaux portages**, valider sur un échantillon avant le bulk historique.

### Actions

- [ ] **Phase pilote** : provisioning des nouveaux portages avec le nouveau RN dans `FNR_CONFIG` (côté Digicel)
- [ ] **Côté opérateur partenaire** : provisioning équivalent dans leur FNR
- [ ] **Période d'observation : 7 à 14 jours minimum** sur ces nouveaux portages
- [ ] **Tests SMS et appels** sur quelques MSISDN pilotes :
  - SMS P2P (Digicel ↔ partenaire)
  - SMS A2P (Certicode banque, OTP, Wizzee)
  - Appels entrants
  - Vérification routage via [P15 — Interrogation FNR](p15-interrogation-fnr.md)
- [ ] **Vérifier les logs SRI for SM côté HLR** pour confirmer le routage avec le nouveau RN
- [ ] **Mail d'avancement** envoyé à la chaîne d'acteurs (cf. modèle email Phase 1 du cas Orange : Steeven → Christophe Decaris du 09/04/2026)

---

## Phase 3 — Coordination des carriers (J-7)

### Objectif

S'assurer que **les deux carriers** (le nôtre et celui du partenaire) prennent en compte le nouveau RN avant la migration de masse.

### Actions

- [ ] **Mail officiel à BICS** (notre carrier) avec X jours d'avance, contenant :
  - Le nouveau RN à supporter
  - La date de bascule prévue
  - Le périmètre concerné
  - Demande de confirmation écrite
- [ ] **L'opérateur partenaire** envoie un mail équivalent à son propre carrier
- [ ] **Échange de preuves techniques entre carriers** :
  - Trace SS7 / capture PCAP montrant que le carrier route bien le nouveau RN
  - Confirmation que le DPC (Destination Point Code) est correctement configuré
- [ ] **Test de bout en bout** avant la migration : SRI for SM avec nouveau RN, vérifier que la réponse arrive bien

> ⚠️ **Point clé du cas Orange** : c'est précisément cette étape qui a manqué le 31/03/2026. Orange IC a migré son routage interne sans informer BICS, et le RN `60042` est devenu silencieusement non routable.

---

## Phase 4 — Migration historique en masse (jour J)

### Objectif

Migrer les portages historiques vers le nouveau RN, en gardant l'ancien en parallèle.

### Actions

- [ ] **Créneau nocturne** (typiquement 22h, comme pour Orange le 04/05/2026) pour limiter l'impact
- [ ] **Maintenir l'ancien RN actif** pendant la transition (double routage) — décommissionnement uniquement en Phase 5
- [ ] **Migration côté Digicel** par CORE (équivalent de Kevin Renciot pour le cas Orange)
- [ ] **Migration côté partenaire** par leur équipe CORE — coordination horaire
- [ ] **Volume cible** : tous les portages clôturés actifs entre Digicel et le partenaire (cf. extraction préparée en Phase 1)

### Monitoring J+1 matin

- [ ] **Email auto de bascule** à 9h30 reçu et OK ([P08 — Vérification bascule](p08-verification-bascule.md))
- [ ] **Tickets RT clients** (file APPLICATIONS, filtre date du jour) — surveiller :
  - Plaintes SMS non reçus
  - Plaintes appels non aboutis
  - Tickets FNR / routage
- [ ] **Logs FNR / SS7** monitorés en temps réel
- [ ] **VAS en standby** pour SMS A2P (Certicode, banques, etc.)
- [ ] **Test FNR direct** sur quelques MSISDN portés via http://172.24.2.21/apis/porta/fnr-get-info.html
- [ ] **Comptage SQL** PEN/PSO portés vs partenaire pour vérifier la cohérence des volumes

### Plan de rollback

Si problème détecté :

- [ ] Restaurer l'ancien `FNR_CONFIG` (sauvegarde Phase 1)
- [ ] Voir [P16 — Rollback DAPI FNR](p16-rollback-dapi-fnr.md) pour la procédure complète
- [ ] Sauvegarde de `/etc/crontab` non concernée par cette migration (RN ≠ scripts cron)

---

## Phase 5 — Décommissionnement de l'ancien RN (J+30 minimum)

### Objectif

Retirer l'ancien RN après validation complète, et propager l'info aux autres opérateurs GPMAG.

### Actions

- [ ] **Validation bilatérale** que les nouveaux RN routent à 100% (Digicel + partenaire)
- [ ] **Réunion bilatérale** avant décommissionnement
- [ ] **Période de stabilité de 4 à 6 semaines minimum** observée avant retrait
- [ ] **Décommissionnement de l'ancien RN dans `FNR_CONFIG`** (UPDATE des valeurs)
- [ ] **Sauvegarde et trace** dans le ticket RT
- [ ] **Communication GPMAG** à tous les opérateurs (Orange, SFR, DT, UTS, Free) :
  - L'ancien RN n'est plus supporté à partir de [date]
  - Demande de retirer cet ancien RN de leurs FNR respectifs
- [ ] **Mise à jour finale** de la doc `docs/operations/gpmag/rn-routage-prefixes.md` (statut "ancien RN décommissionné")

---

## Points d'attention spécifiques par opérateur

| Opérateur | Particularité | Contact |
|-----------|---------------|---------|
| **Orange Caraïbe (OC)** | Migration faite (08/04/2026 + 04/05/2026 historiques) | Christophe Decaris, Gérard Chenevier |
| **Dauphin Telecom (DT)** | Petit opérateur, peu de portages, monitoring allégé possible | Latifa Annachachibi, Daniel Saint Fleur |
| **SFR Caraïbe (OMT)** | Volume moyen, carrier identique probable (BICS) | À identifier |
| **UTS Caraïbe** | Mode dégradé sur les 1110 (cf. P21), procédure spécifique | Martin Paquette, Raymond Marten |
| **Free Caraïbes** | Volume moyen, attention aux tickets B2B (cf. P20) | À identifier |

## Modèles d'emails (réutilisables)

### Mail Phase 2 — Annonce du provisioning

Voir le mail Steeven Jacques du 09/04/2026 à Christophe Decaris (cas Orange) — confirmer côté partenaire que les nouveaux préfixes sont bien provisionnés.

### Mail Phase 3 — Coordination carrier

Inspiré du modèle Antoine Martin → BICS du 15/04/2026 (cas Orange).

### Mail Phase 5 — Décommissionnement

À rédiger lors de la première migration complète.

## Documents liés

- [Cas d'école Orange — Diagnostic SMS portés](../operations/gpmag/sms-portes-orange-diagnostic.md)
- [Référence RN par opérateur et territoire](../operations/gpmag/rn-routage-prefixes.md)
- [FNR — périmètre, visibilité et fonctionnement](../operations/gpmag/fnr-perimetre-visibilite.md)
- [GPMAG évolutions ARCEP — suivi global](../operations/gpmag/gpmag-evolutions-arcep.md)
- [P08 — Vérification bascule](p08-verification-bascule.md)
- [P15 — Interrogation FNR](p15-interrogation-fnr.md)
- [P16 — Rollback DAPI FNR](p16-rollback-dapi-fnr.md)

## Tickets de référence

- **#276845** — [PNM] Mise à jour des nouveaux préfixes de routage Orange Caraïbe (cas d'école Phase 1 à 4 réalisé)

## Notes opérationnelles

- **Toujours documenter** chaque étape dans le ticket RT correspondant
- **Tracer les UPDATE SQL** sur `FNR_CONFIG` (cf. ticket #276845 du 07/04/2026 pour le format)
- **Conserver les sauvegardes** de `FNR_CONFIG` avant chaque modification (rollback)
- **Le décommissionnement** est l'étape la plus risquée : une fois l'ancien RN supprimé, il n'y a plus de fallback en cas de problème détecté tardivement
- **Communication client interne** : prévenir l'équipe support et les CDC avant la migration de masse
