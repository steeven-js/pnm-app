# P44 — PSO clôturée mais ligne fantôme côté opérateur receveur

**Catégorie :** Portabilité / Coordination inter-opérateurs
**Serveur :** vmqproportawebdb01 (PortaDB)
**Utilisateur :** porta_pnmv3
**Déclencheur :** CDC remonte qu'un client n'a pas accès à sa ligne après portabilité sortante, alors que le cycle PNM est clôturé côté Digicel

---

## Contexte

Cas où une portabilité sortante (PSO) Digicel → opérateur tiers s'est déroulée techniquement sans incident côté PNM (cycle 1110/1210/1410/1430 complet, statut « Clôturé »), **mais le client n'obtient jamais sa ligne** chez l'opérateur receveur. Symptôme typique remonté par le CDC :

> « Quand on appelle le numéro, on entend la tonalité [opérateur receveur] mais un automate indique que le numéro n'est pas attribué. »

Cela indique que la **bascule réseau** a bien eu lieu (FNR routé vers l'opérateur receveur) mais que le **provisioning client** a échoué chez le receveur. La responsabilité est entièrement côté opérateur receveur — Digicel ne peut pas résoudre seul.

> **Règle générale :** un MSISDN porté chez un autre opérateur ne peut **pas** être libéré ni réaffecté par Digicel. Cf. [Cas Pratique #19 dans l'app PNM](../../resources/js/Pages/CasPratiques.tsx).

## Détection

### Symptômes côté CDC / client

- Le client a fait une portabilité vers l'opérateur X
- L'opérateur X ne provisionne pas la ligne (le client n'a pas de service)
- À l'appel du numéro : tonalité de l'opérateur X + automate « non attribué »
- Le CDC ouvre un ticket type « Demande de récupération de numéro »

### Pattern technique PortaDB

```
1110 in   <date>       (demande reçue de l'opérateur receveur)
1210 out  <date> A001  (notre éligibilité OK)
1410 in   <date>       (acceptation finale de l'opérateur receveur)
1430 out  <date>       (notre acquittement)
Statut : Clôturé
```

→ **Le cycle est complet côté Digicel et il n'y a aucun signal d'erreur PNM.** L'anomalie est purement côté opérateur receveur.

## Pré-requis

### 1. Vérifier le cycle PNM dans PortaDB

```sql
SELECT code_ticket, source, OPR, OPD,
       DATE_FORMAT(date_creation_ticket, '%d/%m/%Y %H:%i:%s') AS DATE_TICKET
FROM DATA
WHERE msisdn = '069XXXXXXX'
ORDER BY date_creation_ticket;
```

Confirmer la séquence 1110 → 1210 → 1410 → 1430 sans erreur 7000 ni 1510. Si le cycle est incomplet ou cassé, c'est un autre cas (cf. [P11](p11-resiliation-manuelle-pso.md) ou [P43](p43-pso-non-resiliee-e610.md)).

### 2. Vérifier le routage FNR

http://172.24.2.21/apis/porta/fnr-get-info.html

MSISDN au format international :
- `590<msisdn sans 0>` Guadeloupe
- `594<msisdn sans 0>` Guyane
- `596<msisdn sans 0>` Martinique

Le FNR doit confirmer que le numéro est routé vers l'opérateur receveur (code NP attendu : 60044 SFR, 60042 OC/Digicel, 60043 DT, 60045 UTS, 60048 Free — adapter selon les dernières migrations de préfixes).

## Étapes

### 1. Confirmer côté Digicel

Avec les deux vérifications pré-requises, on peut affirmer au CDC que :
- Le portage est techniquement terminé côté Digicel
- Le routage réseau est en place vers l'opérateur receveur
- L'anomalie est côté opérateur receveur (provisioning)

### 2. Contacter l'opérateur receveur

Mail type pour solliciter une vérification côté opérateur receveur :

```
Objet : [PNM] Vérification statut MSISDN 069XXXXXXX après portabilité

Bonjour,

Nous nous permettons de revenir vers vous au sujet du MSISDN
069XXXXXXX ayant fait l'objet d'une portabilité sortante de
Digicel vers [Opérateur receveur] en [Mois/Année].

Notre cliente nous remonte un dysfonctionnement : lorsqu'on appelle
le numéro, la tonalité [Opérateur] est bien présente mais un automate
indique « numéro non attribué ».

Pourriez-vous, s'il vous plaît, vérifier de votre côté :

  - Le routage FNR du MSISDN 069XXXXXXX
  - L'état général de la ligne dans votre système

Nous restons à votre disposition pour tout complément d'information.

Cordialement,

Steeven JACQUES
Chargé d'applications (DSI) | Application Team
Digicel Antilles-Guyane
+596 696 307 631
```

**Destinataires** : contact PNM / technique de l'opérateur receveur.
**Cc** : `FWI_PNM_SI@digicelgroup.fr` + le CDC demandeur.

### 3. Répondre au CDC dans le ticket

```
Bonjour <Nom CDC>,

Vérification effectuée — côté Digicel, la portabilité sortante du
069XXXXXXX vers [Opérateur receveur] a été clôturée proprement le
JJ/MM/AAAA.

Je viens de contacter [Opérateur receveur] pour leur demander de
vérifier le routage FNR et l'état de la ligne dans leur système.

Je te tiens informé dès que j'ai un retour.

--
Cordialement,
Steeven JACQUES - Chargé d'application
```

### 4. Suivre la réponse de l'opérateur receveur

Trois issues possibles après leur retour :

| Réponse opérateur receveur | Action côté Digicel |
|---|---|
| « Ligne finalisée chez nous » | Informer le CDC, le client peut utiliser sa ligne |
| « Problème identifié, correction en cours » | Attendre, relancer si pas de retour sous 48-72h |
| « Ligne non active sur nos plateformes » | Demander une **restitution du numéro vers Digicel** (cf. étape 5) |

### 5. Demander la restitution du numéro

Si l'opérateur receveur confirme que la ligne n'est pas active chez eux, demander la restitution du MSISDN vers Digicel pour pouvoir le remettre à disposition.

> **Note réglementaire (interne, ne pas mentionner dans le mail)** : avant **40 jours** suivant la date de portabilité, l'opérateur receveur n'est **pas obligé** de procéder à la restitution. La demande est alors une **restitution de bon vouloir** — formuler poliment et ne pas insister sur le caractère obligatoire.

Mail type à envoyer (en réponse au fil existant avec l'opérateur receveur) :

```
Bonjour <Prénom>,

Merci pour ton retour rapide.

Étant donné que le numéro n'est plus actif sur vos plateformes,
la cliente souhaiterait pouvoir le récupérer chez Digicel.

Serait-il possible de procéder à une restitution du MSISDN
069XXXXXXX vers Digicel afin que nous puissions le remettre
à disposition ?

Merci d'avance pour ton aide.

Cordialement,

Steeven JACQUES
Chargé d'applications (DSI) | Application Team
Digicel Antilles-Guyane
+596 696 307 631
```

Une fois la restitution effectuée par l'opérateur receveur (visible dans le FNR via DELETE NPSUB du MSISDN), procéder à la libération côté MOBI selon le protocole [P02](p02-liberation-msisdn.md).

### 6. Fermer le ticket

Une fois la situation résolue côté opérateur receveur (ou restitution effectuée), fermer le ticket avec un message de clôture explicitant l'action prise.

## Ne PAS faire

- ❌ **Ne pas libérer le MSISDN** dans MOBI tant que le numéro est routé vers un autre opérateur dans le FNR. Cela créerait une incohérence inter-opérateur et générerait des erreurs réseau.
- ❌ **Ne pas tenter une résiliation manuelle PSO** via SoapUI — la résiliation est déjà effective côté Digicel (le mandat est clôturé). Cf. [P11](p11-resiliation-manuelle-pso.md) qui ne s'applique pas ici.
- ❌ **Ne pas générer de 1510 ou 1220 en dégradé** — il n'y a aucun ticket manquant côté PNM, le workflow est complet.

## Cas réel — Ticket RT 277587 (13/05/2026)

- **MSISDN** : 0690446343
- **Client MOBI** : 1383601 (demandeur Nicolas Pohl)
- **Opérateur receveur** : SFR Caraïbe (OPR 03)
- **Cycle PNM** :
  ```
  1110 in   27/04/2026 13:40:55  PNMDATA.03.02.20260427134012.001
  1210 out  27/04/2026 14:00:22  A001 Demande eligible
  1410 in   27/04/2026 18:40:39  PNMDATA.03.02.20260427184010.002
  1430 out  29/04/2026 10:00:19  PNMDATA.02.03.20260429100017.001
  Clôturé   29/04/2026
  ```
- **Diagnostic** : provisioning échoué côté SFR
- **Action 1** : mail SFR pour vérification routage FNR + état ligne (13/05/2026 14:47)
- **Réponse SFR** (Gilles HONORE, 13/05/2026 15:12) : *« Ce numéro n'est plus actif sur nos plateformes. »*
- **Action 2** : demande de **restitution anticipée** à SFR pour récupérer le MSISDN, **avant le délai réglementaire de 40 jours** (portabilité du 29/04, demande le 13/05 = J+14). Restitution de bon vouloir formulée sans mention du délai.
- **Décision** : validée avec Sarah Mogade (lead Application)

## Références

- [Cas Pratique #19](../../resources/js/Pages/CasPratiques.tsx) — Demande de libération d'un MSISDN porté chez un autre opérateur (règle générale)
- [P02 — Libération MSISDN](p02-liberation-msisdn.md) — Pré-requis vérification PortaDB, refus si opérateur ≠ Digicel
- [P11 — Résiliation manuelle PSO](p11-resiliation-manuelle-pso.md) — Cas où la résiliation côté Digicel n'est pas effective
- [P15 — Interrogation FNR](p15-interrogation-fnr.md) — Interfaces DAPI pour le FNR
- [P43 — PSO non résiliée suite au bug PortaWs (E610)](p43-pso-non-resiliee-e610.md) — Cas distinct où la résiliation côté Digicel a échoué

## Notes opérationnelles

- Ce cas est **rare** mais récurrent : les opérateurs receveurs peuvent avoir des bugs de provisioning post-portabilité.
- La règle absolue : Digicel ne doit jamais agir unilatéralement sur un MSISDN routé chez un autre opérateur dans le FNR.
- Documenter chaque cas dans le RT et noter le délai de réponse de l'opérateur receveur pour suivre les tendances.
- En cas de réponse silencieuse de l'opérateur receveur > 1 semaine, escalader auprès de leur Legal & Regulatory team.

### Délai réglementaire de restitution (40 jours)

- En cas de demande de restitution **avant 40 jours** suivant la date de portabilité, l'opérateur receveur n'est **pas obligé** d'accepter — c'est une **restitution de bon vouloir**.
- Au-delà de 40 jours, la restitution devient opposable (GPMAG / ARCEP).
- **Dans tous les cas**, ne jamais mentionner ce délai dans le mail à l'opérateur — formuler la demande comme une suite logique du constat de ligne inactive chez eux.
