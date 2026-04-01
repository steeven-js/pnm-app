# P21 — Tickets 1110 DC vers UTS (mode degrade)

**Categorie :** Portabilite
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Script :** Pnm_1110_DC_vers_UTS.sh
**Declencheur :** Post-vacation (automatique)

---

## Contexte

UTS (operateur 05) ne gere pas les tickets de portabilite par fichier PNMDATA de maniere standard. Quand Digicel transmet un ticket 1110 (demande de portage entrante) a UTS, il faut intervenir manuellement pour creer le fichier de vacation contenant le ticket 1210 (reponse d'acceptation) d'UTS. C'est le **mode degrade**.

Ce script detecte automatiquement les tickets 1110 transmis a UTS et envoie une alerte par email pour declencher l'intervention manuelle.

## Email d'alerte

**Objet :** `[PNM] Ticket(s) 1110 transmis a UTS -> fichier a creer avec le(s) ticket(s) 1210 d'UTS`
**Destinataire :** fwi_pnm_si

## Requete de detection

Le script detecte les tickets 1110 Digicel → UTS emis dans les 2 dernieres heures :

```sql
SELECT msisdn FROM PortaDB.DATA
WHERE code_ticket = 1110
AND operateur_origine = 2          -- Digicel (emetteur)
AND operateur_destination = 5      -- UTS (destinataire)
AND source = 'out'
AND date_creation_ticket BETWEEN DATE_ADD(NOW(), INTERVAL -2 HOUR) AND NOW();
```

## Action requise

Quand l'alerte est recue :

### 1. Identifier les MSISDN concernes

Lire l'email d'alerte qui liste les MSISDN avec des tickets 1110 transmis a UTS.

### 2. Contacter UTS

Contacter UTS pour obtenir leur reponse (acceptation 1210 ou refus 1220) :
- **Contact :** winifred.tjinasioe@cwc.com / martin.paquette@libertycaribbean.com
- **Adresse portabilite :** uts-french-portability@cwc.com

### 3. Generer le fichier de vacation manuellement

Creer un fichier PNMDATA contenant le ticket 1210 d'UTS et le deposer sur le sFTP pour integration.

### 4. Integrer en mode degrade

Le fichier cree est integre manuellement dans le systeme de portabilite pour permettre la poursuite du processus de portage.

## Notes operationnelles

- UTS est le seul operateur fonctionnant en **mode degrade** — tous les autres (OC, SFR, DT, Free) echangent des fichiers PNMDATA de maniere standard.
- Le delai de reponse d'UTS peut etre plus long que les autres operateurs en raison du mode degrade.
- Le script se declenche apres chaque vacation (post 10H, 14H, 19H).
- Si UTS ne repond pas dans les delais reglementaires (J+2), le portage est reporte.
