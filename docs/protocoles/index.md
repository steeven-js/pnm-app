# Protocoles — Index

**Total :** 35 protocoles | **Derniere MAJ :** 09/04/2026
**Source :** Documentation PNM, scripts production, 30 tickets documentes de Frederic Arduin (2026)

> Chaque protocole contient : contexte, etapes detaillees, requetes SQL, commandes, cas particuliers, exemples concrets issus des tickets RT, et message de fermeture type.

## Liberation (4)

- [P01 — Liberation IMEI](p01-liberation-imei.md) — Script APP_OCS, cas quarantaine/fictif/multiple/post-resiliation
- [P02 — Liberation MSISDN](p02-liberation-msisdn.md) — SQL MOBI, MS_CLASS 0/73, stock 211, verification PortaDB
- [P03 — Liberation SIM](p03-liberation-sim.md) — SQL MOBI, verification ligne active, format ICCID
- [P04 — Liberation Offre](p04-liberation-offre.md) — customer_package + package_right, liberation simple/avec restriction

## Exploitation (8)

- [P06 — MAJ Fidelisation APP_OCS 11561](p06-maj-fidelisation-11561.md) — Reengagement 24 mois, report mois FID, MAJ date
- [P07 — Annulation Fidelisation APP_OCS 11605](p07-annulation-fidelisation-11605.md) — Multi-etapes 2-3 jours, interaction CDC
- [P12 — Export PortaDB CSV](p12-export-portadb-csv.md) — 16 tables, cron 00H00, serveur EMM
- [P17 — Astreinte hebdomadaire](p17-astreinte-hebdomadaire.md) — Checklist quotidien, WIZZEE week-end, crontab jours feries
- [P29 — Stats ESB Porta](p29-stats-esb-porta.md) — Statistiques WS, base LOGGER, jours feries
- [P32 — CTO Changement tarifaire bloque](p32-cto-changement-tarifaire.md) — Item CTO, regle cross-territoire Antilles/Guyane
- [P33 — Reactivation forfait bloque SM](p33-reactivation-forfait-bloque.md) — Multi-etapes : restriction droits + liberation + FID
- [P34 — Desactivation suppression Point de Vente](p34-desactivation-pdv.md) — Del_profil_Mobi, suppression items/packages/groups PDV

## Portabilite (12)

- [P08 — Verification Bascule Porta MOBI](p08-verification-bascule.md) — EmaExtracter/EmmExtracter, emails verification, version CCA
- [P09 — Verification Acquittements](p09-verification-acquittements.md) — PnmAckManager, fichiers .ACR, contacts operateurs
- [P10 — Verification Generation PNMDATA](p10-verification-generation-pnmdata.md) — 3 vacations, format fichiers, sFTP
- [P11 — Resiliation manuelle PSO](p11-resiliation-manuelle-pso.md) — SoapUI, WS ExecuteResiliationPs, verification PortaDB
- [P21 — Tickets 1110 DC vers UTS](p21-tickets-1110-uts.md) — Mode degrade UTS, creation fichier manuelle
- [P22 — Tickets 1210 en attente](p22-tickets-1210-attente.md) — Detection J+1, vendredi = J+3
- [P23 — Tickets en attente tous operateurs](p23-tickets-attente-tous.md) — 1210/1430/3430, 5 operateurs
- [P24 — Restitutions entrantes bascule](p24-restitutions-entrantes.md) — J-21, 5 confirmations, SQL MOBI
- [P25 — Restitutions sortantes bascule](p25-restitutions-sortantes-bascule.md) — Jeudi 11H00, statut 7
- [P26 — Restitutions sortantes tickets WS](p26-restitutions-sortantes-ws.md) — SOAP CreatePortaRestitution, mapping codes MOBI/Porta
- [P27 — Controle FNR post-bascule](p27-controle-fnr.md) — fnr_action_v3.bh, EMA, % commandes OK
- [P20 — Gestion portabilite B2B vers Free](p20-porta-b2b-free.md) — RIO 02E%, blocage etat 15→17

## Facturation (2)

- [P13 — Facturation mensuelle PEN PSO](p13-facturation-mensuelle.md) — Mandats simples/multiples, ventilation operateurs
- [P30 — Facturation annuelle PEN](p30-facturation-annuelle-pen.md) — Bilan annuel, UNION simples/multiples

## Debug / Diagnostic (8)

- [P05 — Remise offre famille non appliquee](p05-remise-offre-famille.md) — RATP_ITEM, PB.RATP_ITEM_MANQUANT_2, cas CTI
- [P14 — Verification appartenance numero](p14-verification-appartenance.md) — PortaDB MSISDN, operateur actuel vs tranche
- [P15 — Interrogation gestion FNR](p15-interrogation-fnr.md) — 4 interfaces DAPI, codes reseau, coherence PortaDB
- [P16 — Rollback DAPI suite FNR EMA EMM KO](p16-rollback-dapi-fnr.md) — Arbre decision, relance EmaExtracter, correction manuelle
- [P19 — Reporting RIO incorrect](p19-reporting-rio-incorrect.md) — Refus R123, detection fraude, requetes PortaDB
- [P28 — Extraction MSISDN temporaires E610](p28-extraction-msisdn-temporaires.md) — Logs Glassfish, conversion format
- [P31 — Rattrapage de ligne appels entrants KO](p31-rattrapage-ligne.md) — Diagnostic MOBI/PortaDB, effets de bord, neutralisation
- [P18 — Verification SIM SWAP WIZZEE](p18-sim-swap-wizzee.md) — Types erreurs, procedure retry, escalade @DEV
- [P35 — Anomalie connexion VPN a la DB](p35-anomalie-connexion-vpn-db.md) — PROVISOIRE — flush hosts MariaDB, ticket 276887
