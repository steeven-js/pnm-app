# P01 — Liberation IMEI

**Categorie :** Liberation
**Serveur :** vmqprostdb01
**Utilisateur :** oracle
**Declencheur :** Ticket RT — IMEI verrouille dans APP_OCS

---

## Contexte

Debloquer un IMEI verrouille dans APP_OCS pour permettre une nouvelle affectation.

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

### 4. Controle visuel

Le script affiche les informations de l'IMEI :
- HD_IMEI_NUMBER : numero IMEI
- HA_INTERNAL_NAME : modele terminal (ex: Samsung Galaxy A17 5G)
- STATUS : statut actuel (7 = vendu)
- LAST_STOCK : dernier stock
- LINE_NO / LINE_MSISDN_ACT : ligne associee

Verifier les informations puis appuyer sur "Sortir" pour valider.

### 5. Verifier le resultat

Le script affiche "Mail envoye en commentaire sur le ticket XXXXXX". Un fichier liberation_imei_info_*.txt est poste automatiquement en PJ sur le ticket RT.

### 6. Fermer le ticket RT

"Bonjour,
L'IMEI a ete libere.
Je ferme donc le ticket.
--
Cdt,
[Prenom NOM]
Equipe Application"

Puis fermer le ticket (statut : resolu).
