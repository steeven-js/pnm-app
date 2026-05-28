# P01 — Libération IMEI

**Catégorie :** Libération
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Déclencheur :** Ticket RT — IMEI verrouillé dans APP_OCS
**Temps moyen :** 5 à 30 min (simple), jusqu'à 1h (multiple/quarantaine)
**Fréquence :** Très élevée (~4-5 tickets/semaine, 315 tickets/an historiquement)

---

## Contexte

Débloquer un IMEI verrouillé dans APP_OCS pour permettre une nouvelle affectation. C'est l'une des opérations les plus fréquentes de l'équipe Application. L'IMEI peut être verrouillé pour plusieurs raisons : vente, résiliation, manipulation échouée dans MasterCRM, ou quarantaine.

Le processus est semi-automatisé : un script Oracle (`oracle@digicelgroup.fr`) effectue la libération et génère un fichier de trace (`liberation_imei_info_YYYYMMDD_HHMM.txt`) qui est posté automatiquement en pièce jointe sur le ticket RT.

## Cas d'usage courants

| Cas | Description | Exemple ticket |
|-----|-------------|----------------|
| Libération standard | IMEI verrouillé sur une ligne, CDC demande libération pour réaffectation | #276521, #276138 |
| Post-résiliation | IMEI reste verrouillé après résiliation de la ligne (le Hub ne libère pas automatiquement) | #276392 |
| Quarantaine | IMEI en quarantaine suite à manipulation échouée dans MasterCRM/Hub. Non rattaché à aucun numéro. | #276110, #276354, #276390 |
| IMEI fictif | L'IMEI générique `100000000000528` utilisé pour les activations sans terminal doit être libéré après usage | #276243, #276515 |
| Libération multiple | Plusieurs IMEI à libérer pour un même client (souvent B2B) | #276515, #276462, #276242 |
| Combinée FID | Libération IMEI + annulation fidélisation (multi-étapes sur 2-3 jours) | #276399 |

## Étapes

### 1. Connexion au serveur

Se connecter en SSH au serveur de production via mRemoteNG (en root), puis basculer vers l'utilisateur oracle.

```bash
su - oracle
```

### 2. Accéder au répertoire

Naviguer vers le répertoire de libération IMEI.

```bash
cd ~/script/LIBERATION/IMEI/
```

### 3. Lancer le script

Exécuter le script en mode verbose. Il demande le numéro de ticket RT puis le ou les IMEI.

```bash
./liberation_IMEI.sh -v
```

Le script :
1. Demande le numéro de ticket RT
2. Demande le(s) IMEI à libérer (un par un)
3. Affiche les informations de chaque IMEI pour vérification
4. Exécute la libération
5. Envoie un mail automatique en commentaire sur le ticket RT

### 4. Contrôle visuel

Le script affiche les informations de l'IMEI :

| Champ | Description | Exemple |
|-------|-------------|---------|
| HD_IMEI_NUMBER | Numéro IMEI | 356278283835314 |
| HA_INTERNAL_NAME | Modèle terminal | Samsung Galaxy S25 Ultra |
| STATUS | Statut actuel (7 = vendu) | 7 |
| LAST_STOCK | Dernier stock | STOCK_GP |
| LINE_NO | Numéro de ligne associée | 7324403 |
| LINE_MSISDN_ACT | MSISDN associé | 0696912909 |

Vérifier les informations puis appuyer sur "Sortir" pour valider.

> **Attention :** Pour un IMEI en quarantaine (non rattaché à aucun numéro), les champs LINE_NO et LINE_MSISDN_ACT seront vides. C'est normal.

### 5. Vérifier le résultat

Le script affiche "Mail envoyé en commentaire sur le ticket XXXXXX". Un fichier `liberation_imei_info_YYYYMMDD_HHMM.txt` est posté automatiquement en PJ sur le ticket RT.

Vérifier dans le ticket RT que la PJ est bien présente avant de fermer.

### 6. Cas particulier : Libération IMEI + MSISDN

Quand le CDC demande simultanément la libération de l'IMEI ET du MSISDN :
1. Libérer l'IMEI via ce protocole (P01)
2. Libérer le MSISDN via le protocole P02
3. Informer le CDC : "Les ressources ont été libérées. Le MSISDN est disponible en réaffectation dans le stock 211."

(Voir ticket #276421)

### 7. Cas particulier : Libération combinée avec FID

Quand le CDC demande libération IMEI + annulation fidélisation :
1. Libérer l'ancien IMEI (P01)
2. Attendre confirmation du CDC pour le changement de terminal
3. Libérer le nouvel IMEI (P01)
4. MAJ dates engagement/FID via APP_OCS 11605 (voir protocole P07)

Ce processus prend généralement 2-3 jours avec des allers-retours CDC.
(Voir ticket #276399)

### 8. Cas particulier : IMEI sans MSISDN rattaché (ligne résiliée, changement d'avis)

Il arrive qu'un IMEI soit verrouillé dans APP_OCS mais ne soit rattaché à aucun MSISDN. Cela se produit quand :
- Le client a demandé une ouverture de ligne puis a changé d'avis et demande la résiliation
- La ligne a été résiliée mais l'IMEI n'a pas été libéré automatiquement
- Le MSISDN a été détaché avant la libération de l'IMEI

Dans MasterCRM, la fiche client montre le champ MSISDN vide et le statut technique en "Ligne résiliée".

**Procédure** : La libération se fait normalement via le script (étapes 1 à 5). Le script affichera les champs LINE_NO et LINE_MSISDN_ACT vides, comme pour un IMEI en quarantaine. C'est normal dans ce cas.

(Voir ticket #276942 — SARL CAV ISLE, client 2222173 — ouverture puis résiliation immédiate, IMEI sans MSISDN)

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

Pour libération multiple :
```
Bonjour,
Les IMEI ont été libérés.
Je ferme donc le ticket.
--
Cdt,
[Prénom NOM]
Équipe Application
```

Puis fermer le ticket (statut : résolu).

## Référence : Statuts IMEI (HARD_STOCK_DETAIL)

Table `HARD_STOCK_DETAIL` sur vmqprotool02 (base PB@MCST).

### STATUS

| Code | Signification | Description |
|------|--------------|-------------|
| 1 | En stock | Terminal neuf en stock, pas encore vendu |
| 2 | Vendu/Affecté | En cours d'utilisation, affecté à un client |
| 3 | Disponible | Libéré, prêt à la vente/réaffectation |
| 5 | Retour/Transit | Terminal en transit ou retour |
| 7 | Vendu/Verrouillé | Lié à une ligne (c'est ce statut qu'on libère) |
| 8 | Bloqué/Quarantaine | Bloqué suite à manipulation échouée ou fraude |
| 99 | Supprimé | Hors service |

### RECONDI

| Code | Signification |
|------|--------------|
| 0 | Terminal neuf |
| 1 | Terminal reconditionné |

### Requête de vérification

```sql
-- Verification basique
SELECT HD_SERIAL_NUMBER, SALE_TO_CUSTOMER, SALE_TO_LINKCODE,
       SALE_TO_LINKTYPE, SALE_TO_DATE, HD_ORIGINE, STATUS, RECONDI
FROM HARD_STOCK_DETAIL
WHERE HD_SERIAL_NUMBER IN ('IMEI_ICI');

-- Verification détaillée avec ligne associee
SELECT SALE_TO_CUSTOMER, hd.HD_IMEI_NUMBER, HA_INTERNAL_NAME,
       SALE_TO_DATE, SALE_TO_LINKCODE, TO_CHAR(STATUS), LAST_STOCK,
       LINE_NO, l.LINE_MSISDN_ACTIVE, TO_CHAR(l.LINE_STATUS)
FROM HARD_STOCK_DETAIL hd
JOIN LINE l ON hd.SALE_TO_LINKCODE = TO_CHAR(l.LINE_NO)
WHERE hd.HD_IMEI_NUMBER IN ('IMEI_ICI');
```

> **Interprétation :** Un IMEI à libérer est généralement en STATUS = 7 (verrouillé) avec une LINE_STATUS = 37 (ligne résiliée). Après libération via le script, il passe en STATUS = 3 (disponible).

## Notes opérationnelles

- **IMEI fictif** : Le numéro `100000000000528` est un IMEI générique utilisé pour les activations sans terminal. Il apparaît régulièrement et doit être libéré après chaque usage pour être réutilisé.
- **Quarantaine** : Pattern récurrent — IMEI en quarantaine après manipulation échouée sur le Hub. Le Hub ne gère pas automatiquement la libération. Solution : toujours passer par APP_OCS.
- **Post-résiliation** : Le Hub ne libère pas automatiquement l'IMEI lors de la résiliation. Il faut le faire manuellement via APP_OCS.
- **Tickets créés le week-end** : Les tickets créés samedi/dimanche sont traités le lundi matin à l'ouverture.
- **Demandeurs fréquents** : CDC (Customer Care), équipes Business (clients B2B), points de vente.
