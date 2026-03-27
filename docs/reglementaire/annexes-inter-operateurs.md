# Annexes Reglementaires Inter-Operateurs GPMAG — PNM V3

> Consolide depuis les 4 annexes du dossier Porta_Steeven (2012-2013).
> Ce document ne reprend que les elements NON deja couverts dans pnm-context-portabilite.md.
> Pour les processus generaux, tickets, architecture : voir docs/pnm/pnm-context-portabilite.md

---

## Sources

| Annexe | Titre | Date |
|--------|-------|------|
| Annexe 1 Ter | Processus Client Guichet Unique GPMAG-PNMV3 | 20/12/2012 |
| Annexe 4 Ter | Specifications Interface Technique Inter-Operateurs | 05/02/2013 |
| Annexe 5 Ter | Cadrage et Organisation Inter-Operateurs | 17/04/2013 |
| Annexe 7 Ter | Specification Besoins Systeme Echange Inter-Operateurs | 05/02/2013 |

---

## 1. Cadre reglementaire

### References ARCEP

| Reference | Date | Objet |
|-----------|------|-------|
| Decision n°02-549 | 11/07/2002 | Lignes directrices PNM |
| Decision n°04-1126 | 21/12/2004 | Modification lignes directrices PNM |
| Avis n°05-0197 | 22/03/2005 | Demande ministre sur la portabilite |
| Decision n°2007-0193 | 05/04/2007 | Modalites PNM Guadeloupe, Martinique, Guyane, Saint-Martin, Saint-Barthelemy |
| Ordonnance | 24/08/2011 | Transposition directives europeennes — simple guichet |
| Decision n°2012-0576 | 10/05/2012 | Modalites PNM — delai 2 jours ouvres |
| Decret n°2012-488 | 13/04/2012 | Obligations operateurs — portabilite |

### Principes PNM V3 (depuis 2012)
- Processus client en simple guichet (toutes demarches aupres de l'OPR)
- Mise en place du RIO (Releve d'Identite Operateur)
- Numero unique 3179 (SVI) ou #3179# (serveur USSD) pour obtenir le RIO
- Delai global : 2 jours ouvres (au lieu de 10 jours auparavant)
- Delai maximum a la demande du client : 60 jours calendaires

---

## 2. Delais de portage detailles

### Delai standard (JP = JD + 2 jours ouvres)

| Phase | Delai mini | Delai max |
|-------|-----------|-----------|
| Etape 5 : Envoi demande OPR → OPD | JD (vacation la plus proche) | JD a 20H (80% le jour meme) |
| Etape 7 : Reponse eligibilite OPD → OPR | JD a 14H | JD+1 a 11H |
| Bascule SIM | JP = JD+2 a 8H30 | JP = JD+2 a 10H |
| Etape 11 : Confirmation tous → OPR (ticket 1430) | JP = JD+2 a 10H | JP = JD+2 a 20H |

### Delai specifique (JP = JD + N, N > 2 jours ouvres)

| Phase | Delai mini | Delai max |
|-------|-----------|-----------|
| Etape 7 : Reponse eligibilite OPD → OPR | JD a 14H | JD+2 a 11H |
| Bascule SIM | JP = JD+N a 8H30 | JP = JD+N a 10H |
| Confirmation tous → OPR | JP a 10H | JP a 20H |

### Fenetre de bascule SIM
- Duree maximale : **1h30**
- Horaires : **08h30 a 10h00** (jours ouvres uniquement)
- Interruption de service maximale toleree : **4 heures**
- Aucune bascule le samedi, dimanche ou jour ferie

### Delais d'annulation

| Cause | Standard (JP=JD+2) | Specifique (JP=JD+N) |
|-------|-------------------|---------------------|
| Annulation client OPR (ticket 1510) | JD a 14H → JD a 20H | JD a 14H → JP-2 a 20H |
| Confirmation OPD (ticket 1530) | JD a 19H → JD+1 a 11H | JD a 19H → JP-1 a 11H |
| Annulation perte eligibilite OPD (ticket 1520+1530) | N/A (pas le temps) | JD+1 a 14H → JP-2 a 20H |

### Delai de portage inverse
- 1ere etape (echange accord) : 6 heures ouvrees (max 8h)
- 2eme etape (phase 4 portage nominal) : 18 heures ouvrees (max 24h)
- **Delai global : 24 heures ouvrees (max 32 heures ouvrees)**

---

## 3. Motifs de refus d'eligibilite (codes R/A)

### Codification

Format : `Xnnn` ou X = A (acceptation) ou R (refus)
- 1er chiffre : motif ARCEP (1=incapacite personne, 2=donnees erronees, 3=numero inactif)
- 2eme chiffre : niveau controle (1=demande, 2=numero)
- 3eme chiffre : cause precise

### Table des codes

| Code | Libelle | Notes |
|------|---------|-------|
| **A001** | Demande eligible | Acceptation |
| R120 | Donnees d'identite incorrectes | Non utilise en PNM v3 |
| R121 | Numero d'immatriculation incorrect | Non utilise en PNM v3 |
| R122 | Non transmission document d'enregistrement | Non utilise en PNM v3 |
| **R123** | **RIO incorrect** | Nouveau PNM v3 — tres frequent |
| R140 | Valeur reservee | |
| R150 | Valeur reservee | |
| R160 | Valeur reservee | |
| **R210** | **Erreur destinataire de la demande** | Mauvais OPD |
| **R211** | **Date de traitement du portage depasse** | |
| **R212** | **Date de portage non valide** | |
| **R213** | **Nombre de numeros depasse** | >3 particulier, >20 entreprise |
| R215 | Non transmission acte de portage (procedure alternative) | |
| **R220** | **Autre portage en cours** | Doublon |
| **R221** | **Numero hors departement d'attribution** | |
| **R222** | **Destinataire n'est pas OPD du numero** | |
| R260 | Valeur reservee | |
| R270 | Valeur reservee | |
| **R322** | **Resiliation effective hors demande de portabilite** | Ligne resiliee |
| **R323** | **Resiliation depuis moins de 10 jours** | OPD doit reactiver si demande client |
| R340 | Numero non contractuel (fax, data) | |
| R350 | Valeur reservee | |

---

## 4. Motifs d'annulation (codes C)

| Code | Libelle | Ticket |
|------|---------|--------|
| **C001** | Annulation du demandeur | AP (1510) par OPR |
| **C002** | Perte d'eligibilite | AN (1520) par OPD |
| **C003** | Resiliation moins de 10 jours | AN (1520) par OPD |

---

## 5. Codes d'erreurs fichiers inter-operateurs (codes E)

### Erreurs techniques fichier (E001 - E199)

| Code | Libelle |
|------|---------|
| **E000** | **Fichier OK** (pas d'erreur) |
| E001 | En-tete de fichier invalide |
| E002 | Fin de fichier invalide |
| E003 | Code operateur non reference dans le nom de fichier |
| E004 | Operateur source et destination identiques |
| E005 | Date invalide |
| E006 | Nom de fichier invalide |
| E007 | Erreur de sequence (manque un numero de sequence) |
| E008 | Fichier deja recu |
| E009 | Fichier incomplet |
| E010 | Controle nombre de lignes (footer vs reel) |
| E011 | AR non recu |

### Erreurs syntaxiques ticket (E200 - E599)

| Code | Libelle |
|------|---------|
| E200 | Non utilise |
| E201 | Code inconnu |
| E202 | Transaction inattendue |
| E203 | Longueur de champ incorrecte |
| E204 | Type de champ invalide |
| E205 | Champ obligatoire non renseigne |
| E206 | Nombre de champs incorrect |

### Erreurs fonctionnelles (E600 - E999)

| Code | Libelle |
|------|---------|
| E600 | Date de portage demandee est depassee |
| E601 | Valeur reservee |
| E602 | Numero porte inconnu |
| E603 | Date de portage trop eloignee |
| E604 | Valeur inconnue (donnee reference inter-OP non connue) |
| E605 | Valeur inattendue (mauvais operateur destinataire) |
| E606 | Valeur invalide (nombre lignes incohérent avec tickets recus) |
| E607 | Date chomee |
| E608 | Date posterieure a la date du jour |
| E609 | Demande inconnue (ID portage n'existe pas encore) |
| E610 | ID portage existe deja mais flux non attendu |
| E611 | Nombre max MSISDN depasse (portage inverse, bascule) |
| E612 | Doublon MSISDN dans une meme demande |
| E613 | MSISDN present dans un autre dossier (equiv R220 pour inverse/restitution) |
| E614 | MSISDN absent du dossier initial (portage inverse) |
| E615 | Numero a restituer invalide (non porte) |
| E616 | OPA invalide (pilotage restitution par OPA) |
| E617 | MSISDN eligible manquant dans la reponse |

---

## 6. Qualite de service

### RIO
- Envoi SMS apres consultation SVI/USSD : **2 minutes** dans 90% des cas, **5 minutes** dans 99% des cas
- RIO genere au plus tard le lendemain de l'activation du numero
- Accessible via 3179 (SVI) ou #3179# (USSD), 24H/24, 7J/7, gratuit

### Delais de traitement
- OPR transmet demande a l'OPD : **le jour meme dans 80% des cas**
- OPD confirme eligibilite : **vacation suivante dans 80% des cas**

### Volumetrie
- Capacite de traitement estimee : **280 bascules/jour** (2011)
- Max par mandat : 3 lignes (particulier), 20 lignes (entreprise)
- Flotte (>20 lignes) : traitement particulier

---

## 7. Traitements speciaux

### Portage inverse
- Decide d'un commun accord OPR/OPD apres ticket d'incident
- Raisons : fraude (usurpation), erreur administrative/SI
- Pas d'examen d'eligibilite
- L'OPD initial pilote le portage inverse
- Formalise par "bon pour accord" (ticket BI/2400)

### Resiliation en amont de la demande de portage
- Si ligne resiliee depuis moins de 10 jours : OPD refuse avec code R323
- OPR propose au client de se rapprocher de l'OPD pour reactiver
- OPD a l'obligation de reactiver sur demande motivee du client

### Requisitions judiciaires (RJ)
- Demandes RJ transmises a l'operateur attributaire (OPA)
- Si numero porte : OPA redirige vers l'operateur de souscription actuel
- Obligation de tracer les portages pour repondre aux RJ sur toute la periode

### Vente a distance / en ligne
- Delai de portage commence apres expiration du droit de retractation
- Activation SIM par l'abonne sur internet apres reception

---

## 8. Gestion des incidents inter-operateurs (Annexe 5)

### Processus d'incident
1. Detection du dysfonctionnement
2. Ouverture ticket d'incident par l'operateur detecteur
3. Qualification : Critique / Majeur / Mineur
4. Traitement par l'operateur responsable
5. Cloture et reporting

### Qualification des incidents

| Niveau | Description | Delai resolution |
|--------|-------------|-----------------|
| Critique | Blocage total des echanges inter-operateurs | Immediat |
| Majeur | Dysfonctionnement impactant les portages | 4 heures ouvrees |
| Mineur | Anomalie sans impact client direct | 1 jour ouvre |

### Procedure d'escalade
1. Niveau 1 : Equipes techniques operationnelles
2. Niveau 2 : Responsables PNM (contacts GPMAG)
3. Niveau 3 : Direction — reunion extraordinaire GPMAG

### Interlocuteurs PNM par operateur
- **Orange Caraibe :** gerard.chenevier@orange.com / oag.pnm-si@orange.com
- **Digicel :** FWI_PNM_SI@digicelgroup.fr
- **SFR/OMT :** g.honore@outremer-telecom.fr / pnm@outremer-telecom.fr
- **Dauphin Telecom :** latifa.annachachibi@dauphintelecom.com / daniel.saintfleur@dauphintelecom.com
- **UTS :** winifred.tjinasioe@cwc.com / uts-french-portability@cwc.com
- **Free Caraibe :** fmerleremond@iliad-free.fr / pan@fm.proxad.net

---

## 9. Securite des echanges sFTP (Annexe 4)

### Authentification
- Cles SSH de type DSA (paire publique/privee)
- Chaque operateur fournit sa cle publique aux autres
- Cle publique copiee dans `/ssh/authorized_keys2` cote serveur

### Procedure d'echange de cles SSH
1. Operateur A genere paire de cles DSA
2. Operateur A diffuse sa cle publique (id_dsa.pub) a l'operateur B
3. Operateur B installe la cle dans authorized_keys2
4. Validation du process d'authentification

### Nommage fichiers en cours de transfert
- Extension `.tmp` ajoutee pendant le transfert
- Renommage sans `.tmp` une fois le transfert complet
- Exemple : `PNMDATA.02.01.20260105100001.001.tmp` → `PNMDATA.02.01.20260105100001.001`

---

## 10. Tests inter-operateurs (Annexe 5)

### Organisation des tests
- Tests de bout en bout entre chaque paire d'operateurs
- Validation des echanges sFTP, integration tickets, acquittements
- Tests des scenarios nominaux, annulations, portages inverses, restitutions
- Tests de charge : validation de la volumetrie cible

### Qualification des anomalies
- **Bloquante :** empeche la mise en production
- **Majeure :** contournement possible mais correction obligatoire
- **Mineure :** amelioration, correction planifiable
