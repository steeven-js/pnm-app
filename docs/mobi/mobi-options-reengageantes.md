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
2. **Ajout de l'option réengageante** sur la ligne, via un **`OPTION_ID`** dans MasterCRM (déclenché par appel **WS** → opération **`InsertOption`**).
3. Génération du **PDF légal (avenant)** avec les nouveaux termes.
4. **Envoi de l'email = avenant** au client.

```
Flytect (campagne) ──> WS InsertOption ──> MasterCRM (ajout OPTION_ID) ──> PDF avenant ──> Email = avenant au client
   [marketing]            [────────── périmètre Steeven : étape WS <-> DB en INT ──────────]            [légal]
```

## 4. Périmètre de Steeven

- **Partie TEST** du projet.
- **Livrable technique en INT :** la **première étape entre les WS et la base MasterCRM** — l'opération **`InsertOption`** qui, sur appel WS, **ajoute l'`OPTION_ID`** dans MasterCRM.
- *(À confirmer)* jusqu'où va le périmètre côté **génération PDF / envoi email**.

## 5. Environnement

> ⚠️ **INT UNIQUEMENT.** On travaille exclusivement sur l'environnement d'intégration (projet SoapUI **`WSDL MOBI - INT`**). **Jamais la PROD** — plusieurs opérations **écrivent** (`InsertOption`, `DeleteOption`, `OfferChange`, `SIMChange`…), une erreur sur la prod serait critique.

| Élément | Valeur |
|--------|--------|
| **WS provisioning INT** (endpoint SOAP) | **`http://172.24.114.210/WSMobiMaster/WSProvisioning.svc`** |
| Binding | `BasicHttpBinding_Provisioning` |
| Base **MasterCRM INT** | **`172.24.114.205`** (instance `MCSTINT`) |
| Connexion DB | **mot de passe LDAP** (compte Steeven) |
| Outil de test | **SoapUI 5.6.0** — projet `WSDL MOBI - INT` |
| Prod (référence — **NE PAS TOUCHER**) | WS prod + DB `MCST50A` |

→ Architecture : **WS (`.210`) ↔ DB MasterCRM (`.205`)**. L'étape de Steeven est ce maillon.

## 6. Web services (WSDL MOBI INT)

### 6.1 Opérations utiles
| Opération | Rôle pour le projet |
|-----------|---------------------|
| **`InsertOption`** | 🎯 **ajout de l'option** (`OptionId`) sur une ligne (`LineId`) — le cœur de la tâche |
| `DeleteOption` | retrait d'option (tests / nettoyage) |
| `InfoLine` | **lecture** ligne (`MSISDN_NAT` / `LINE_NO`) — *idéal pour valider connectivité + auth sans écrire* |
| `OfferChange` | changement d'offre |
| `AddItem` / `RemoveItem` / `InfosOfferItems` | gestion des items d'offre |

*(Autres opérations du binding : CreateLineGP, Execute, ExecuteResiliationPs, SIMChange, TransferLineGP, UpdateLineDates, UpdateLineTerminal, Search/Insert/DeleteToken…)*

### 6.2 Requête cible — `InsertOption`
Namespaces : `mob = http://mobimaster/` · `wsp = http://schemas.datacontract.org/2004/07/WSProvisioning`

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:mob="http://mobimaster/"
                  xmlns:wsp="http://schemas.datacontract.org/2004/07/WSProvisioning">
  <soapenv:Header/>
  <soapenv:Body>
    <mob:InsertOption>
      <mob:aPointOfSales>
        <wsp:SalesPoint>...</wsp:SalesPoint>                    <!-- point de vente / PDV -->
        <wsp:UserLogin>...</wsp:UserLogin>                       <!-- login opérateur -->
        <wsp:TransactionIdWstore>...</wsp:TransactionIdWstore>   <!-- optionnel -->
      </mob:aPointOfSales>
      <mob:aInfoLineForAddLineOption>
        <wsp:LineId>...</wsp:LineId>                             <!-- identifiant de la ligne cible -->
        <wsp:OptionId>...</wsp:OptionId>                         <!-- l'OPTION_ID à ajouter -->
      </mob:aInfoLineForAddLineOption>
    </mob:InsertOption>
  </soapenv:Body>
</soapenv:Envelope>
```

| Champ | Description |
|-------|-------------|
| `aPointOfSales.SalesPoint` | code point de vente (contexte d'origine) |
| `aPointOfSales.UserLogin` | login de l'opérateur qui déclenche l'action |
| `aPointOfSales.TransactionIdWstore` | id transaction Wstore (**optionnel**) |
| `aInfoLineForAddLineOption.LineId` | identifiant de la **ligne** cible |
| `aInfoLineForAddLineOption.OptionId` | 🎯 l'**option** (`OPTION_ID`) à ajouter |

### 6.3 Exemple `InfoLine` (lecture, pour test de connexion)
```xml
<mob:InfoLine>
  <mob:MSISDN_NAT>0696905633</mob:MSISDN_NAT>
  <mob:LINE_NO>7303882</mob:LINE_NO>
</mob:InfoLine>
```

## 7. Matrice de scénarios de test *(à affiner)*

### A. Nominal
- **A1** — `InsertOption` avec ligne **éligible** + `OptionId` valide → option **bien insérée** en base (bonne table, statut, dates), réponse WS **OK**.
- **A2** — Bout en bout : ajout option → **avenant PDF généré** → **email envoyé**, cohérent.

### B. Éligibilité
- **B1** — Ligne **en fin d'engagement** → autorisé.
- **B2** — Ligne **PAS en fin d'engagement** → comportement attendu (rejet / hors cible ?).
- **B3** — Ligne **inactive / résiliée** → **rejet**.

### C. Idempotence / doublon
- **C1** — `OptionId` **déjà présent** sur la ligne → **pas de doublon**, message approprié.
- **C2** — Double appel `InsertOption` identique → un seul ajout.

### D. Données invalides
- **D1** — `OptionId` **inexistant / invalide** → rejet propre.
- **D2** — `LineId` / MSISDN **inexistant** → rejet.
- **D3** — Option **incompatible** avec l'offre / forfait actuel → rejet.
- **D4** — `aPointOfSales` (SalesPoint / UserLogin) **manquant ou invalide** → rejet.

### E. Intégrité / cohérence
- **E1** — L'ajout met bien à jour ce qu'il faut (engagement, dates, lien vers l'avenant).
- **E2** — Échec en aval (**PDF non généré / email KO**) → **pas d'option orpheline** (rollback ou réconciliation).

### F. Légal (critique)
- **F1** — L'**avenant PDF** est généré, **rattaché au bon contrat/client**, daté, avec les **nouveaux termes**.
- **F2** — **Traçabilité** de l'envoi (email = avenant) côté MasterCRM.

### G. Campagne / volumétrie
- **G1** — Traitement d'un **lot** (plusieurs lignes) issu de Flytect → tous traités, comptage cohérent.

## 8. Questions ouvertes (à cadrer)

1. ~~Livrable exact « étape WS↔DB »~~ → **opération `InsertOption`** du WSDL MOBI INT. *(reste : règles métier appliquées côté DB)*
2. **Table(s) cible MasterCRM** : où atterrit l'`OptionId` après `InsertOption` ? (table des options de ligne — à identifier en base INT/PROD).
3. **Valeurs de test** : quels `SalesPoint` / `UserLogin` valides en INT ? quel `OptionId` correspond à l'**option réengageante** ?
4. **Périmètre PDF/email** : Steeven le déclenche/teste, ou autre équipe ?
5. **Définition « fin d'engagement »** : seuil (ex. ≤ X mois restants) qui rend un client cible.
6. **Acceptation client** : l'avenant nécessite-t-il une action/acceptation, ou l'envoi suffit ?
7. **Jeu de données de test en INT** : lignes/clients représentatifs (éligibles, non éligibles, B2B, inactifs).
8. **Critères de succès / KPI** des tests.

---

*Statut : cadrage en cours. Spec WS `InsertOption` connue ; reste à identifier la table cible de l'`OptionId` et les valeurs de test (SalesPoint/UserLogin/OptionId).*
