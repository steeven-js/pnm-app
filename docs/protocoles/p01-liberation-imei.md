# P01 — Liberation IMEI

**Categorie :** Liberation
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Declencheur :** Ticket RT — IMEI verrouille dans APP_OCS
**Temps moyen :** 5 a 30 min (simple), jusqu'a 1h (multiple/quarantaine)
**Frequence :** Tres elevee (~4-5 tickets/semaine, 315 tickets/an historiquement)

---

## Contexte

Debloquer un IMEI verrouille dans APP_OCS pour permettre une nouvelle affectation. C'est l'une des operations les plus frequentes de l'equipe Application. L'IMEI peut etre verrouille pour plusieurs raisons : vente, resiliation, manipulation echouee dans MasterCRM, ou quarantaine.

Le processus est semi-automatise : un script Oracle (`oracle@digicelgroup.fr`) effectue la liberation et genere un fichier de trace (`liberation_imei_info_YYYYMMDD_HHMM.txt`) qui est poste automatiquement en piece jointe sur le ticket RT.

## Cas d'usage courants

| Cas | Description | Exemple ticket |
|-----|-------------|----------------|
| Liberation standard | IMEI verrouille sur une ligne, CDC demande liberation pour reaffectation | #276521, #276138 |
| Post-resiliation | IMEI reste verrouille apres resiliation de la ligne (le Hub ne libere pas automatiquement) | #276392 |
| Quarantaine | IMEI en quarantaine suite a manipulation echouee dans MasterCRM/Hub. Non rattache a aucun numero. | #276110, #276354, #276390 |
| IMEI fictif | L'IMEI generique `100000000000528` utilise pour les activations sans terminal doit etre libere apres usage | #276243, #276515 |
| Liberation multiple | Plusieurs IMEI a liberer pour un meme client (souvent B2B) | #276515, #276462, #276242 |
| Combinee FID | Liberation IMEI + annulation fidelisation (multi-etapes sur 2-3 jours) | #276399 |

## Etapes

### 1. Connexion au serveur

Se connecter en SSH au serveur de production via mRemoteNG (en root), puis basculer vers l'utilisateur oracle.

```bash
su - oracle
```

### 2. Acceder au repertoire

Naviguer vers le repertoire de liberation IMEI.

```bash
cd ~/script/LIBERATION/IMEI/
```

### 3. Lancer le script

Executer le script en mode verbose. Il demande le numero de ticket RT puis le ou les IMEI.

```bash
./liberation_IMEI.sh -v
```

Le script :
1. Demande le numero de ticket RT
2. Demande le(s) IMEI a liberer (un par un)
3. Affiche les informations de chaque IMEI pour verification
4. Execute la liberation
5. Envoie un mail automatique en commentaire sur le ticket RT

### 4. Controle visuel

Le script affiche les informations de l'IMEI :

| Champ | Description | Exemple |
|-------|-------------|---------|
| HD_IMEI_NUMBER | Numero IMEI | 356278283835314 |
| HA_INTERNAL_NAME | Modele terminal | Samsung Galaxy S25 Ultra |
| STATUS | Statut actuel (7 = vendu) | 7 |
| LAST_STOCK | Dernier stock | STOCK_GP |
| LINE_NO | Numero de ligne associee | 7324403 |
| LINE_MSISDN_ACT | MSISDN associe | 0696912909 |

Verifier les informations puis appuyer sur "Sortir" pour valider.

> **Attention :** Pour un IMEI en quarantaine (non rattache a aucun numero), les champs LINE_NO et LINE_MSISDN_ACT seront vides. C'est normal.

### 5. Verifier le resultat

Le script affiche "Mail envoye en commentaire sur le ticket XXXXXX". Un fichier `liberation_imei_info_YYYYMMDD_HHMM.txt` est poste automatiquement en PJ sur le ticket RT.

Verifier dans le ticket RT que la PJ est bien presente avant de fermer.

### 6. Cas particulier : Liberation IMEI + MSISDN

Quand le CDC demande simultanement la liberation de l'IMEI ET du MSISDN :
1. Liberer l'IMEI via ce protocole (P01)
2. Liberer le MSISDN via le protocole P02
3. Informer le CDC : "Les ressources ont ete liberees. Le MSISDN est disponible en reaffectation dans le stock 211."

(Voir ticket #276421)

### 7. Cas particulier : Liberation combinee avec FID

Quand le CDC demande liberation IMEI + annulation fidelisation :
1. Liberer l'ancien IMEI (P01)
2. Attendre confirmation du CDC pour le changement de terminal
3. Liberer le nouvel IMEI (P01)
4. MAJ dates engagement/FID via APP_OCS 11605 (voir protocole P07)

Ce processus prend generalement 2-3 jours avec des allers-retours CDC.
(Voir ticket #276399)

### 8. Cas particulier : IMEI sans MSISDN rattache (ligne resiliee, changement d'avis)

Il arrive qu'un IMEI soit verrouille dans APP_OCS mais ne soit rattache a aucun MSISDN. Cela se produit quand :
- Le client a demande une ouverture de ligne puis a change d'avis et demande la resiliation
- La ligne a ete resiliee mais l'IMEI n'a pas ete libere automatiquement
- Le MSISDN a ete detache avant la liberation de l'IMEI

Dans MasterCRM, la fiche client montre le champ MSISDN vide et le statut technique en "Ligne resiliee".

**Procedure** : La liberation se fait normalement via le script (etapes 1 a 5). Le script affichera les champs LINE_NO et LINE_MSISDN_ACT vides, comme pour un IMEI en quarantaine. C'est normal dans ce cas.

(Voir ticket #276942 — SARL CAV ISLE, client 2222173 — ouverture puis resiliation immediate, IMEI sans MSISDN)

### 9. Fermer le ticket RT

```
Bonjour,
L'IMEI a été libéré.
Je ferme donc le ticket.
--
Cdt,
[Prénom NOM]
Équipe Application
```

Pour liberation multiple :
```
Bonjour,
Les IMEI ont été libérés.
Je ferme donc le ticket.
--
Cdt,
[Prénom NOM]
Équipe Application
```

Puis fermer le ticket (statut : resolu).

## Reference : Statuts IMEI (HARD_STOCK_DETAIL)

Table `HARD_STOCK_DETAIL` sur vmqprotool02 (base PB@MCST).

### STATUS

| Code | Signification | Description |
|------|--------------|-------------|
| 1 | En stock | Terminal neuf en stock, pas encore vendu |
| 2 | Vendu/Affecte | En cours d'utilisation, affecte a un client |
| 3 | Disponible | Libere, pret a la vente/reaffectation |
| 5 | Retour/Transit | Terminal en transit ou retour |
| 7 | Vendu/Verrouille | Lie a une ligne (c'est ce statut qu'on libere) |
| 8 | Bloque/Quarantaine | Bloque suite a manipulation echouee ou fraude |
| 99 | Supprime | Hors service |

### RECONDI

| Code | Signification |
|------|--------------|
| 0 | Terminal neuf |
| 1 | Terminal reconditionne |

### Requete de verification

```sql
-- Verification basique
SELECT HD_SERIAL_NUMBER, SALE_TO_CUSTOMER, SALE_TO_LINKCODE,
       SALE_TO_LINKTYPE, SALE_TO_DATE, HD_ORIGINE, STATUS, RECONDI
FROM HARD_STOCK_DETAIL
WHERE HD_SERIAL_NUMBER IN ('IMEI_ICI');

-- Verification detaillee avec ligne associee
SELECT SALE_TO_CUSTOMER, hd.HD_IMEI_NUMBER, HA_INTERNAL_NAME,
       SALE_TO_DATE, SALE_TO_LINKCODE, TO_CHAR(STATUS), LAST_STOCK,
       LINE_NO, l.LINE_MSISDN_ACTIVE, TO_CHAR(l.LINE_STATUS)
FROM HARD_STOCK_DETAIL hd
JOIN LINE l ON hd.SALE_TO_LINKCODE = TO_CHAR(l.LINE_NO)
WHERE hd.HD_IMEI_NUMBER IN ('IMEI_ICI');
```

> **Interpretation :** Un IMEI a liberer est generalement en STATUS = 7 (verrouille) avec une LINE_STATUS = 37 (ligne resiliee). Apres liberation via le script, il passe en STATUS = 3 (disponible).

## Notes operationnelles

- **IMEI fictif** : Le numero `100000000000528` est un IMEI generique utilise pour les activations sans terminal. Il apparait regulierement et doit etre libere apres chaque usage pour etre reutilise.
- **Quarantaine** : Pattern recurrent — IMEI en quarantaine apres manipulation echouee sur le Hub. Le Hub ne gere pas automatiquement la liberation. Solution : toujours passer par APP_OCS.
- **Post-resiliation** : Le Hub ne libere pas automatiquement l'IMEI lors de la resiliation. Il faut le faire manuellement via APP_OCS.
- **Tickets crees le week-end** : Les tickets crees samedi/dimanche sont traites le lundi matin a l'ouverture.
- **Demandeurs frequents** : CDC (Customer Care), equipes Business (clients B2B), points de vente.
