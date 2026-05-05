# P21 — Tickets 1110 DC vers UTS (mode dégradé)

**Categorie :** Portabilite
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Script :** Pnm_1110_DC_vers_UTS.sh
**Declencheur :** Post-vacation (automatique)

---

## Contexte

UTS (opérateur 05) ne gere pas les tickets de portabilité par fichier PNMDATA de maniere standard. Quand Digicel transmet un ticket 1110 (demande de portage entrante) a UTS, il faut intervenir manuellement pour créer le fichier de vacation contenant le ticket 1210 (reponse d'acceptation) d'UTS. C'est le **mode dégradé**.

Ce script détecté automatiquement les tickets 1110 transmis a UTS et envoie une alerte par email pour declencher l'intervention manuelle.

## Email d'alerte

**Objet :** `[PNM] Ticket(s) 1110 transmis a UTS -> fichier a créer avec le(s) ticket(s) 1210 d'UTS`
**Destinataire :** fwi_pnm_si

## Requete de détection

Le script détecté les tickets 1110 Digicel → UTS émis dans les 2 dernières heures :

```sql
SELECT msisdn FROM PortaDB.DATA
WHERE code_ticket = 1110
AND operateur_origine = 2          -- Digicel (émetteur)
AND operateur_destination = 5      -- UTS (destinataire)
AND source = 'out'
AND date_creation_ticket BETWEEN DATE_ADD(NOW(), INTERVAL -2 HOUR) AND NOW();
```

## Action requise

Quand l'alerte est reçue :

### 1. Identifier les MSISDN concernes

Lire l'email d'alerte qui liste les MSISDN avec des tickets 1110 transmis a UTS.

### 2. Contacter UTS

Contacter UTS pour obtenir leur reponse (acceptation 1210 ou refus 1220) :
- **Contact :** winifred.tjinasioe@cwc.com / martin.paquette@libertycaribbean.com
- **Adresse portabilité :** uts-french-portability@cwc.com

### 3. Generer le fichier de vacation manuellement

Creer un fichier PNMDATA contenant le ticket 1210 d'UTS et le déposer sur le sFTP pour intégration.

### 4. Integrer en mode dégradé

Le fichier créé est intégré manuellement dans le système de portabilité pour permettre la poursuite du processus de portage.

## Notes opérationnelles

- UTS est le seul opérateur fonctionnant en **mode dégradé** — tous les autres (OC, SFR, DT, Free) echangent des fichiers PNMDATA de maniere standard.
- Le delai de reponse d'UTS peut etre plus long que les autres opérateurs en raison du mode dégradé.
- Le script se declenche après chaque vacation (post 10H, 14H, 19H).
- Si UTS ne repond pas dans les delais reglementaires (J+2), le portage est reporte.
