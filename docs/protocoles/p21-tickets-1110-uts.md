# P21 — Tickets 1110 DC vers UTS (mode degrade)

**Categorie :** Portabilite
**Serveur :** vmqproportawebdb01
**Utilisateur :** porta_pnmv3
**Script :** Pnm_1110_DC_vers_UTS.sh
**Declencheur :** Post-vacation (automatique)

---

## Contexte

UTS ne gere pas les tickets de portabilite par fichier PNMDATA de maniere standard. Quand Digicel transmet un ticket 1110 (demande de portage entrante) a UTS, il faut creer manuellement le fichier de vacation contenant le ticket 1210 (reponse) d'UTS et le lui transmettre. C'est le "mode degrade".

## Execution automatique

Le script detecte les tickets 1110 transmis a UTS dans les 2 dernieres heures :

Email envoye : `[PNM] Ticket(s) 1110 transmis a UTS -> fichier a creer avec le(s) ticket(s) 1210 d'UTS`

## Requete de detection

```sql
-- Tickets 1110 Digicel → UTS dans les 2 dernieres heures
SELECT msisdn FROM PortaDB.DATA
WHERE code_ticket = 1110
AND operateur_origine = 2          -- Digicel
AND operateur_destination = 5      -- UTS
AND source = 'out'
AND date_creation_ticket BETWEEN DATE_ADD(NOW(), INTERVAL -2 HOUR) AND NOW();
```

## Action requise

Quand l'alerte est recue :
1. Generer un fichier de vacation contenant le ticket 1210 d'UTS
2. Transmettre le fichier cree a UTS
3. Integrer manuellement en mode degrade
