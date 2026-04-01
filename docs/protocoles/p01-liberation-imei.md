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

Se connecter en SSH au serveur de production.

```bash
ssh oracle@vmqprostdb01
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

### 8. Fermer le ticket RT

```
Bonjour,
L'IMEI a ete libere.
Je ferme donc le ticket.
--
Cdt,
[Prenom NOM]
Equipe Application
```

Pour liberation multiple :
```
Bonjour,
Les IMEI ont ete liberes.
Je ferme donc le ticket.
--
Cdt,
[Prenom NOM]
Equipe Application
```

Puis fermer le ticket (statut : resolu).

## Notes operationnelles

- **IMEI fictif** : Le numero `100000000000528` est un IMEI generique utilise pour les activations sans terminal. Il apparait regulierement et doit etre libere apres chaque usage pour etre reutilise.
- **Quarantaine** : Pattern recurrent — IMEI en quarantaine apres manipulation echouee sur le Hub. Le Hub ne gere pas automatiquement la liberation. Solution : toujours passer par APP_OCS.
- **Post-resiliation** : Le Hub ne libere pas automatiquement l'IMEI lors de la resiliation. Il faut le faire manuellement via APP_OCS.
- **Tickets crees le week-end** : Les tickets crees samedi/dimanche sont traites le lundi matin a l'ouverture.
- **Demandeurs frequents** : CDC (Customer Care), equipes Business (clients B2B), points de vente.
