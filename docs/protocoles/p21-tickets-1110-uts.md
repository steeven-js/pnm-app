# P21 — Tickets 1110 DC vers UTS (mode dégradé)

**Catégorie :** Portabilité
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Script :** Pnm_1110_DC_vers_UTS.sh
**Déclencheur :** Post-vacation (automatique)

---

## Contexte

UTS (opérateur 05) ne gère pas les tickets de portabilité par fichier PNMDATA de manière standard. Quand Digicel transmet un ticket 1110 (demande de portage entrante) à UTS, il faut intervenir manuellement pour créer le fichier de vacation contenant le ticket 1210 (réponse d'acceptation) d'UTS. C'est le **mode dégradé**.

Ce script détecte automatiquement les tickets 1110 transmis à UTS et envoie une alerte par email pour déclencher l'intervention manuelle.

## Email d'alerte

**Objet :** `[PNM] Ticket(s) 1110 transmis a UTS -> fichier a créer avec le(s) ticket(s) 1210 d'UTS`
**Destinataire :** fwi_pnm_si

## Requête de détection

Le script détecte les tickets 1110 Digicel → UTS émis dans les 2 dernières heures :

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

### 1. Identifier les MSISDN concernés

Lire l'email d'alerte qui liste les MSISDN avec des tickets 1110 transmis à UTS.

### 2. Contacter UTS

Contacter UTS pour obtenir leur réponse (acceptation 1210 ou refus 1220) :
- **Contact :** winifred.tjinasioe@cwc.com / martin.paquette@libertycaribbean.com
- **Adresse portabilité :** uts-french-portability@cwc.com

### 3. Générer le fichier de vacation manuellement

Créer un fichier PNMDATA contenant le ticket 1210 d'UTS et le déposer sur le sFTP pour intégration.

### 4. Intégrer en mode dégradé

Le fichier créé est intégré manuellement dans le système de portabilité pour permettre la poursuite du processus de portage.

## Notes opérationnelles

- UTS est le seul opérateur fonctionnant en **mode dégradé** — tous les autres (OC, SFR, DT, Free) échangent des fichiers PNMDATA de manière standard.
- Le délai de réponse d'UTS peut être plus long que les autres opérateurs en raison du mode dégradé.
- Le script se déclenche après chaque vacation (post 10H, 14H, 19H).
- Si UTS ne répond pas dans les délais réglementaires (J+2), le portage est reporté.
