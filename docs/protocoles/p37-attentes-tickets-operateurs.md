# P37 — Traitement des attentes de tickets operateurs (mode degrade)

**Categorie :** Portabilite
**Declencheur :** Email "[PNM] INCIDENT : Les attentes de tickets" d'un operateur
**Serveur :** vmqproportasync01 (fichiers), vmqprotool01 (SQL MOBI), 172.24.2.21 (FNR), 172.24.119.72 (PortaWs)
**Temps moyen :** 1h a 2h (selon nombre de MSISDN et complexite)
**Frequence :** Occasionnelle

---

## Contexte

Un operateur (generalement Orange Caraibe) envoie un email signalant des tickets en attente (1430, 3430, etc.) qu'il n'a pas recus. Cela arrive quand :
- Un portage a ete annule (OPD) mais le ticket de confirmation n'a pas ete emis
- Des erreurs E610 ("ID portage existe deja mais reception d'un flux non attendu") ont bloque le traitement
- Le systeme n'a pas pu generer automatiquement les tickets attendus

Il faut alors creer manuellement un fichier PNMDATA en mode degrade contenant les tickets manquants.

## Etapes

### 1. Analyser les attentes

Ouvrir la piece jointe Excel de l'email et verifier chaque MSISDN dans Admin-Portal :
- Type de ticket attendu (1430, 3430, etc.)
- Statut du portage (Annule, Cloture, En cours)
- Historique des tickets emis/recus
- Presence d'erreurs E610

### 2. Verifier les MSISDN dans MOBI (vmqprotool01)

```sql
SELECT operation_id, msisdn_no, ST_MSISDN_ID, MSISDN_STATUS, MS_CLASS, MSISDN_CHANGE
FROM MSISDN
WHERE MSISDN_no IN ('069XXXXXXX', '069XXXXXXX');
```

Verifier le statut des lignes :
- MSISDN_STATUS = 1 : Actif (ligne encore active, resiliation peut-etre necessaire)
- MSISDN_STATUS = 7 : Reaffectable
- OPERATION_ID : 1 = Digicel GP, 2 = Digicel MQ, 217 = Wizzee

### 3. Creer le fichier PNMDATA en mode degrade

Utiliser un fichier PNMDATA recent avec des tickets du meme type comme modele.

**Structure du fichier :**

```
0123456789|PNMDATA.02.XX.YYYYMMDDHHMMSS.NNN|02|YYYYMMDDHHMMSS
[tickets]
9876543210|02|YYYYMMDDHHMMSS|NNNNNN
```

**En-tete :**
- `0123456789` : marqueur debut
- `PNMDATA.02.XX` : 02 = Digicel (source), XX = operateur destinataire
- `YYYYMMDDHHMMSS` : timestamp du fichier
- `.NNN` : numero de sequence (incrementer apres le dernier fichier emis)

**Tickets (exemple 1430) :**
```
1430|02|01|01|02|YYYYMMDDHHMMSS|MSISDN|HASH_MD5|NNNN|YYYYMMDDHHMMSS|YYYYMMDDHHMMSS|
```
- Col.1 : Code ticket (1430, 3430, etc.)
- Col.2 : OPX (02 = Digicel)
- Col.3 : Resultat (01 = OK)
- Col.4 : OPR (operateur receveur)
- Col.5 : OPD (operateur donneur, 02 = Digicel)
- Col.6 : Date du portage d'origine
- Col.7 : MSISDN
- Col.8 : Hash MD5 (ID portage — recuperer depuis Admin-Portal)
- Col.9 : Sequence dans le fichier (0001, 0002, etc.)
- Col.10 : Date de sync
- Col.11 : Date cible

**Pied de page :**
- `9876543210` : marqueur fin
- `02` : code operateur
- `YYYYMMDDHHMMSS` : timestamp
- `NNNNNN` : nombre total de lignes dans le fichier (en-tete + tickets + pied = N+2)

### 4. Conserver le fichier pour envoi par email

Le fichier PNMDATA genere en mode degrade n'est **pas** depose dans send/.
Il est envoye en **piece jointe** du mail de reponse a l'operateur (voir etape 8).
C'est l'operateur qui l'integrera de son cote.

### 5. Mettre a jour le FNR

Si les MSISDN ont ete portes (portabilite sortante annulee mais bascule effectuee) :

- Verifier le FNR : http://172.24.2.21/apis/porta/fnr-get-info.html
- Creer une entree FNR si necessaire : http://172.24.2.21/apis/porta/fnr-create.php
- Mettre a jour le FNR : http://172.24.2.21/apis/porta/fnr-update.php

### 6. Mettre a jour PortaWs

Modifier l'operateur associe au MSISDN si necessaire :

http://172.24.119.72:8080/PortaWs/index.jsp?m=updateMsisdn

### 7. Verifier les tickets 3430 dans PortaWs

Si l'operateur signale aussi des 3430 en attente, verifier dans Admin-Portal (PortaWs)
que les tickets 3430 ont bien ete generes et dans quel fichier PNMDATA ils se trouvent.
Noter le nom du fichier pour l'inclure dans le mail de reponse.

### 8. Envoyer l'email de reponse

Joindre le fichier PNMDATA genere en mode degrade en piece jointe.
Dans le corps du mail, preciser le nom du fichier PNMDATA contenant les 3430
(si concernes) apres verification dans PortaWs.

```
Bonjour,

Suite a une incoherence, nous n'avons pas pu generer les tickets [CODE].
Nous avons donc genere le fichier ci-joint en mode degrade.

[Si 3430 concernes :]
Concernant les tickets 3430, ils sont bien presents dans le fichier
PNMDATA.02.01.YYYYMMDDHHMMSS.NNN.

Nous nous excusons de la gene occasionnee.

Cordialement,
Steeven JACQUES
Equipe Application
```

> **Important :** Le fichier PNMDATA en mode degrade est envoye en PJ du mail,
> pas depose dans send/. C'est l'operateur qui l'integrera de son cote.

### 9. Resilier les lignes (si portabilite sortante)

Attendre le retour de l'operateur confirmant la reception du fichier, puis :

**Pour les lignes Digicel (OPERATION_ID = 1 ou 2) :**
- Resilier via SoapUI (voir protocole P11 — Resiliation manuelle PSO)

**Pour les lignes Wizzee (OPERATION_ID = 217) :**
- Avertir l'equipe Wizzee par email pour la resiliation des MSISDN Wizzee

> **Attention MS_CLASS = 80 :** Les MSISDN avec MS_CLASS = 80 sont des lignes Wizzee.
> Ne pas resilier directement, transmettre a l'equipe Wizzee.

### 10. Fermer le dossier

- Verifier que l'operateur a bien recu et traite le fichier
- Verifier que les lignes sont resiliees
- Verifier la coherence FNR / PortaDB / MOBI

## Exemple reel — Ticket du 20/04/2026 (Orange Caraibe)

Orange signale 6 tickets en attente dont 4 x 1430 (portages annules OPD).

**MSISDN concernes :**

| MSISDN | OPERATION_ID | MS_CLASS | Action |
|--------|-------------|----------|--------|
| 0696701813 | 1 (Digicel GP) | 0 | Resiliation SoapUI |
| 0694243002 | 217 (Wizzee) | 80 | Transmettre equipe Wizzee |
| 0694257800 | 217 (Wizzee) | 0 | Resiliation SoapUI |
| 0690152968 | 2 (Digicel MQ) | 0 | Resiliation SoapUI |

**Fichier genere :**
```
0123456789|PNMDATA.02.01.20260420210000.005|02|20260420210000
1430|02|01|01|02|20260330175900|0696701813|e634394504e907524f15b6cbd966da88|0001|20260420210000|20260420083000|
1430|02|01|01|02|20260330175900|0694243002|46d37389caf249b0f27d176876bc6a40|0002|20260420210000|20260420083000|
1430|02|01|01|02|20260330175900|0694257800|1278fdeabbebaec68ba79de3f07cb19b|0003|20260420210000|20260420083000|
1430|02|01|01|02|20260330175900|0690152968|4313136f0fe35c943bdf6c1a0632596c|0004|20260420210000|20260420083000|
9876543210|02|20260420210000|000006
```

## Notes operationnelles

- Toujours utiliser un fichier PNMDATA recent comme modele pour le format
- Le numero de sequence (.005, .006, etc.) doit etre superieur au dernier fichier emis
- Le nombre total de lignes dans le pied de page inclut l'en-tete et le pied (tickets + 2)
- Verifier la coherence des hash MD5 (ID portage) avec Admin-Portal
- Les tickets 3430 (restitution) sont differents des 1430 (portage) — verifier le contexte
