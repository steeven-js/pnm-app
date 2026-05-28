# P37 — Traitement des attentes de tickets opérateurs (mode dégradé)

**Catégorie :** Portabilité
**Déclencheur :** Email "[PNM] INCIDENT : Les attentes de tickets" d'un opérateur
**Serveur :** vmqproportasync01 (fichiers), vmqprotool01 (SQL MOBI), 172.24.2.21 (FNR), 172.24.119.72 (PortaWs)
**Temps moyen :** 1h à 2h (selon nombre de MSISDN et complexité)
**Fréquence :** Occasionnelle

---

## Contexte

Un opérateur (généralement Orange Caraibe) envoie un email signalant des tickets en attente (1430, 3430, etc.) qu'il n'a pas reçus. Cela arrive quand :
- Un portage a été annulé (OPD) mais le ticket de confirmation n'a pas été émis
- Des erreurs E610 ("ID portage existe déjà mais réception d'un flux non attendu") ont bloqué le traitement
- Le système n'a pas pu générer automatiquement les tickets attendus

Il faut alors créer manuellement un fichier PNMDATA en mode dégradé contenant les tickets manquants.

## Étapes

### 1. Analyser les attentes

Ouvrir la pièce jointe Excel de l'email et vérifier chaque MSISDN dans Admin-Portal :
- Type de ticket attendu (1430, 3430, etc.)
- Statut du portage (Annulé, Clôturé, En cours)
- Historique des tickets émis/reçus
- Présence d'erreurs E610

### 2. Vérifier les MSISDN dans MOBI (vmqprotool01)

```sql
SELECT operation_id, msisdn_no, ST_MSISDN_ID, MSISDN_STATUS, MS_CLASS, MSISDN_CHANGE
FROM MSISDN
WHERE MSISDN_no IN ('069XXXXXXX', '069XXXXXXX');
```

Vérifier le statut des lignes :
- MSISDN_STATUS = 1 : Actif (ligne encore active, résiliation peut-être nécessaire)
- MSISDN_STATUS = 7 : Réaffectable
- OPERATION_ID : 1 = Digicel GP, 2 = Digicel MQ, 217 = Wizzee

### 3. Créer le fichier PNMDATA en mode dégradé

Utiliser un fichier PNMDATA récent avec des tickets du même type comme modèle.

**Structure du fichier :**

```
0123456789|PNMDATA.02.XX.YYYYMMDDHHMMSS.NNN|02|YYYYMMDDHHMMSS
[tickets]
9876543210|02|YYYYMMDDHHMMSS|NNNNNN
```

**En-tête :**
- `0123456789` : marqueur début
- `PNMDATA.02.XX` : 02 = Digicel (source), XX = opérateur destinataire
- `YYYYMMDDHHMMSS` : timestamp du fichier
- `.NNN` : numéro de séquence (incrémenter après le dernier fichier émis)

**Tickets (exemple 1430) :**
```
1430|02|01|01|02|YYYYMMDDHHMMSS|MSISDN|HASH_MD5|NNNN|YYYYMMDDHHMMSS|YYYYMMDDHHMMSS|
```
- Col.1 : Code ticket (1430, 3430, etc.)
- Col.2 : OPX (02 = Digicel)
- Col.3 : Résultat (01 = OK)
- Col.4 : OPR (opérateur receveur)
- Col.5 : OPD (opérateur donneur, 02 = Digicel)
- Col.6 : Date du portage d'origine
- Col.7 : MSISDN
- Col.8 : Hash MD5 (ID portage — récupérer depuis Admin-Portal)
- Col.9 : Séquence dans le fichier (0001, 0002, etc.)
- Col.10 : Date de sync
- Col.11 : Date cible

**Pied de page :**
- `9876543210` : marqueur fin
- `02` : code opérateur
- `YYYYMMDDHHMMSS` : timestamp
- `NNNNNN` : nombre total de lignes dans le fichier (en-tête + tickets + pied = N+2)

### 4. Conserver le fichier pour envoi par email

Le fichier PNMDATA généré en mode dégradé n'est **pas** déposé dans send/.
Il est envoyé en **pièce jointe** du mail de réponse à l'opérateur (voir étape 8).
C'est l'opérateur qui l'intégrera de son côté.

### 5. Mettre à jour le FNR

Si les MSISDN ont été portés (portabilité sortante annulée mais bascule effectuée) :

- Vérifier le FNR : http://172.24.2.21/apis/porta/fnr-get-info.html
- Créer une entrée FNR si nécessaire : http://172.24.2.21/apis/porta/fnr-create.php
- Mettre à jour le FNR : http://172.24.2.21/apis/porta/fnr-update.php

### 6. Mettre à jour PortaWs

Modifier l'opérateur associé au MSISDN si nécessaire :

http://172.24.119.72:8080/PortaWs/index.jsp?m=updateMsisdn

### 7. Vérifier les tickets 3430 dans PortaWs

Si l'opérateur signale aussi des 3430 en attente, vérifier dans Admin-Portal (PortaWs)
que les tickets 3430 ont bien été générés et dans quel fichier PNMDATA ils se trouvent.
Noter le nom du fichier pour l'inclure dans le mail de réponse.

### 8. Envoyer l'email de réponse

Joindre le fichier PNMDATA généré en mode dégradé en pièce jointe.
Dans le corps du mail, préciser le nom du fichier PNMDATA contenant les 3430
(si concernés) après vérification dans PortaWs.

```
Bonjour,

Suite a une incohérence, nous n'avons pas pu générer les tickets [CODE].
Nous avons donc généré le fichier ci-joint en mode dégradé.

[Si 3430 concernés :]
Concernant les tickets 3430, ils sont bien présents dans le fichier
PNMDATA.02.01.YYYYMMDDHHMMSS.NNN.

Nous nous excusons de la gêne occasionnée.

Cordialement,
Steeven JACQUES
Équipe Application
```

> **Important :** Le fichier PNMDATA en mode dégradé est envoyé en PJ du mail,
> pas déposé dans send/. C'est l'opérateur qui l'intégrera de son côté.

### 9. Résilier les lignes (si portabilité sortante)

Attendre le retour de l'opérateur confirmant la réception du fichier, puis :

**Pour les lignes Digicel (OPERATION_ID = 1 ou 2) :**
- Résilier via SoapUI (voir protocole P11 — Résiliation manuelle PSO)

**Pour les lignes Wizzee (OPERATION_ID = 217) :**
- Avertir l'équipe Wizzee par email pour la résiliation des MSISDN Wizzee

> **Attention MS_CLASS = 80 :** Les MSISDN avec MS_CLASS = 80 sont des lignes Wizzee.
> Ne pas résilier directement, transmettre à l'équipe Wizzee.

### 10. Fermer le dossier

- Vérifier que l'opérateur a bien reçu et traité le fichier
- Vérifier que les lignes sont résiliées
- Vérifier la cohérence FNR / PortaDB / MOBI

## Exemple réel — Ticket du 20/04/2026 (Orange Caraibe)

Orange signale 6 tickets en attente dont 4 x 1430 (portages annulés OPD).

**MSISDN concernés :**

| MSISDN | OPERATION_ID | MS_CLASS | Action |
|--------|-------------|----------|--------|
| 0696701813 | 1 (Digicel GP) | 0 | Résiliation SoapUI |
| 0694243002 | 217 (Wizzee) | 80 | Transmettre équipe Wizzee |
| 0694257800 | 217 (Wizzee) | 0 | Résiliation SoapUI |
| 0690152968 | 2 (Digicel MQ) | 0 | Résiliation SoapUI |

**Fichier généré :**
```
0123456789|PNMDATA.02.01.20260420210000.005|02|20260420210000
1430|02|01|01|02|20260330175900|0696701813|e634394504e907524f15b6cbd966da88|0001|20260420210000|20260420083000|
1430|02|01|01|02|20260330175900|0694243002|46d37389caf249b0f27d176876bc6a40|0002|20260420210000|20260420083000|
1430|02|01|01|02|20260330175900|0694257800|1278fdeabbebaec68ba79de3f07cb19b|0003|20260420210000|20260420083000|
1430|02|01|01|02|20260330175900|0690152968|4313136f0fe35c943bdf6c1a0632596c|0004|20260420210000|20260420083000|
9876543210|02|20260420210000|000006
```

## Notes opérationnelles

- Toujours utiliser un fichier PNMDATA récent comme modèle pour le format
- Le numéro de séquence (.005, .006, etc.) doit être supérieur au dernier fichier émis
- Le nombre total de lignes dans le pied de page inclut l'en-tête et le pied (tickets + 2)
- Vérifier la cohérence des hash MD5 (ID portage) avec Admin-Portal
- Les tickets 3430 (restitution) sont différents des 1430 (portage) — vérifier le contexte
