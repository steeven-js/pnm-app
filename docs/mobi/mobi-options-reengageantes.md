# Projet « Options réengageantes » — MasterCRM

> Document de travail — porté par Steeven Jacques (partie **TEST**). Démarrage semaine du 08/06/2026.
> Document vivant : **constamment mis à jour** au fil du cadrage (Sarah N+2 / Benoit N+1) et des découvertes techniques.

---

## 1. Objectif

Réduire le **churn** en proposant aux clients **en fin d'engagement** une **option réengageante** (qui prolonge l'engagement en échange d'un avantage).

## 2. Contrainte légale (point central)

Démarcher un client pour le réengager est **interdit**, **SAUF** si on lui transmet un **nouveau contrat PDF (avenant)** reprenant les **nouveaux termes**.

→ **L'email envoyé au client = l'avenant au contrat** : il a **valeur contractuelle**. Pas d'avenant PDF = pas de réengagement possible.

## 3. Chaîne fonctionnelle (bout en bout)

1. **Flytect** (outil de **campagne marketing**) sélectionne les clients en fin d'engagement à partir d'**éléments de la base MasterCRM**. → *Hors périmètre Steeven* (marketing ; pas d'accès, mais bon à savoir).
2. **Ajout de l'option réengageante** sur la ligne, via un **`OPTION_ID`** dans MasterCRM (déclenché par appel **WS**).
3. Génération du **PDF légal (avenant)** avec les nouveaux termes.
4. **Envoi de l'email = avenant** au client.

```
Flytect (campagne) ──> WS ──> MasterCRM (ajout OPTION_ID) ──> PDF avenant ──> Email = avenant au client
   [marketing]          [────── périmètre Steeven : étape WS <-> DB en INT ──────]        [légal]
```

## 4. Périmètre de Steeven

- **Partie TEST** du projet.
- **Livrable technique en INT :** la **première étape entre les WS et la base MasterCRM** — le maillon qui, sur appel **WS**, **ajoute l'`OPTION_ID`** dans MasterCRM.
- *(À confirmer)* jusqu'où va le périmètre côté **génération PDF / envoi email**.

## 5. Environnement

| Élément | Valeur |
|--------|--------|
| MasterCRM **INT** (intégration) | **172.24.114.205** |
| Connexion | **mot de passe LDAP** (compte Steeven) |
| Instance | `MCSTINT` (croisée dans les DB links MasterCRM) |
| Prod (référence) | MasterCRM `MCST50A` (schémas PB / DIGIMOBI / API) |

## 6. Matrice de scénarios de test *(à affiner selon la spec WS↔DB)*

### A. Nominal
- **A1** — Appel WS avec ligne **éligible (fin d'engagement)** + `OPTION_ID` valide → option **bien insérée** en base (bonne table, statut, dates), réponse WS **OK**.
- **A2** — Bout en bout : ajout option → **avenant PDF généré** → **email envoyé**, le tout cohérent.

### B. Éligibilité
- **B1** — Ligne **en fin d'engagement** → autorisé.
- **B2** — Ligne **PAS en fin d'engagement** → comportement attendu (rejet / hors cible ?).
- **B3** — Ligne **inactive / résiliée** → **rejet**.

### C. Idempotence / doublon
- **C1** — Option **déjà présente** sur la ligne → **pas de doublon**, message approprié.
- **C2** — Double appel WS identique → un seul ajout.

### D. Données invalides
- **D1** — `OPTION_ID` **inexistant / invalide** → rejet propre.
- **D2** — **MSISDN inexistant** → rejet.
- **D3** — Option **incompatible** avec l'offre / forfait actuel → rejet.

### E. Intégrité / cohérence
- **E1** — L'ajout met bien à jour ce qu'il faut (engagement, dates, lien vers l'avenant).
- **E2** — En cas d'échec en aval (**PDF non généré / email KO**) → **pas d'option orpheline** (rollback ou réconciliation).

### F. Légal (critique)
- **F1** — L'**avenant PDF** est généré, **rattaché au bon contrat/client**, daté, avec les **nouveaux termes**.
- **F2** — **Traçabilité** de l'envoi (email = avenant) côté MasterCRM.

### G. Campagne / volumétrie
- **G1** — Traitement d'un **lot** (plusieurs lignes) issu de Flytect → tous traités, comptage cohérent.

## 7. Questions ouvertes (à cadrer)

1. **Livrable exact « étape WS↔DB »** : endpoint WS qui écrit l'`OPTION_ID` ? procédure stockée appelée par le WS ? mapping requête → tables d'options ?
2. **Table(s) cible MasterCRM** pour l'ajout d'option (où vit `OPTION_ID` ? table des options de ligne).
3. **Périmètre PDF/email** : Steeven le déclenche/teste, ou autre équipe ?
4. **Définition « fin d'engagement »** : seuil (ex. ≤ X mois restants) qui rend un client cible.
5. **Acceptation client** : l'avenant nécessite-t-il une action/acceptation, ou l'envoi suffit ?
6. **Jeu de données de test en INT** : lignes/clients représentatifs (éligibles, non éligibles, B2B, inactifs).
7. **Critères de succès / KPI** des tests.

---

*Statut : cadrage en cours. Sections et matrice de test à compléter au fil du projet.*
