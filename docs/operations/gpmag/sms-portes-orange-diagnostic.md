# Diagnostic — SMS non reçus par les MSISDN Orange portés chez Digicel

**Période :** depuis le 31/03/2026
**Dernière MAJ :** 17/04/2026

## Problème

Les MSISDN Orange portés chez Digicel ne reçoivent plus les SMS (P2P et A2P) depuis le 31/03/2026 (~2h-3h du matin).

## Chronologie

| Date | Événement |
|------|-----------|
| 31/03/2026 | Début du problème (rupture SRI for SM avec ancien RN) |
| 09/04/2026 | Signalement initial à Gérard Chenevier (Orange) |
| 10/04/2026 | Relance — Gérard a relancé ses équipes |
| 10/04/2026 | Pascal Bastaraud (Orange) confirme le problème : SMS P2P et A2P en échec, SRI for SM envoyés aux IGP sans réponse du HLR Digicel. Trace SS7 fournie : `59060042690766867` (CC=590, RN=60042, NDC+SN=690766867) |
| 13/04/2026 | Antoine Martin (Digicel) : SRI for SM non reçus depuis le 31/03 — demande si changement côté Orange (nouveaux RN ?) |
| 13/04/2026 | JP Victoire (VAS) demande escalade côté Orange |
| 14/04/2026 | Pascal Bastaraud demande à Christophe Decaris (Orange) de vérifier le lien avec la migration des nouveaux RN |
| 14/04/2026 | Christophe Decaris identifie 3 types de SRI for SM (voir ci-dessous) |
| 15/04/2026 | Antoine Martin (Digicel) : SRI sans RN OK / SRI avec nouveau RN pas de trace côté Digicel / SRI avec ancien RN plus rien depuis le 31/03. Josy-Anne Leno ouvre ticket Orange IC : `TT 2604Z42280` |
| 15/04/2026 | Antoine Martin sollicite BICS (carrier Digicel) |
| 16/04/2026 | BICS : *« received no SMS related messages »* — demande trace Orange IC. Ticket BICS : `SC5148552` |
| 16/04/2026 | Josy-Anne Leno fournit trace PCAP : SMS to `590690510561`, timestamp 15/04 08:47:57 GMT-4. SCCP CdPA : `59060042690510561`, DPC `6231` (Digicel) |

## Analyse technique

**SRI for SM** = *Send Routing Info for Short Message*. Quand Orange veut envoyer un SMS à un numéro porté chez Digicel, son SMSC interroge le HLR Digicel via SRI for SM pour localiser l'abonné et router le SMS.

### 3 types de SRI for SM identifiés

| Type | RN | Statut |
|------|----|----|
| Sans RN | Aucun | OK (attributaires Digicel) |
| Avec NOUVEAU RN | Nouveau | Ack OK côté Orange, non vu côté Digicel |
| Avec ANCIEN RN (60042) | 60042 | KO depuis le 31/03 |

### Cause racine probable

Migration des nouveaux préfixes de routage de portabilité.

- Orange a migré côté réseau/carrier autour du 31/03/2026
- Digicel a provisionné les nouveaux préfixes en base le 08/04/2026

Cette migration a cassé le routage des SRI for SM avec l'ancien RN (60042) vers Digicel via le carrier (Orange IC → BICS).

Le problème se situe entre Orange IC et BICS :

- Orange IC dit envoyer les SRI au DPC `6231` (Digicel)
- BICS dit ne rien recevoir
- → Problème de routage/transit entre les deux carriers

**Lien avec le GPMAG :** sujet #1 « Migration des nouveaux préfixes de routage » — voir [gpmag-evolutions-arcep.md](gpmag-evolutions-arcep.md).

### Migration des préfixes — état côté Digicel (08/04/2026)

| Territoire | Nouveau préfixe OC |
|------------|---------------------|
| Guadeloupe | 52303 |
| Guyane | 52333 |
| Martinique | 52313 |

- Provisioning en base effectué le 08/04/2026
- Bascules quotidiennes intègrent les nouveaux préfixes
- Logs FNR post-bascule confirment le bon fonctionnement
- Seuls les nouveaux portages sont concernés pour l'instant

## Contacts impliqués

### Digicel

| Nom | Rôle | Contact |
|-----|------|---------|
| Antoine Martin | CORE Network | antoine.martin@digicelgroup.fr |
| David Auguste | CORE Network | david.auguste@digicelgroup.fr |
| William Berisson | — | william.berisson@digicelgroup.fr |
| Marie Lyne Tin | — | marie-lyne.tin@digicelgroup.fr |
| Jean-Philippe Victoire | VAS | — |
| Steeven Jacques | PNM/Application | steeven.jacques@digicelgroup.fr |

Distributions : `FWI_CORE_NETWORK`, `FWI_IT_VAS`, `FWI_PNM_SI`.

### Orange

| Nom | Rôle | Contact |
|-----|------|---------|
| Pascal Bastaraud | Resp. Plateformes Services | pascal.bastaraud@orange.com |
| Gérard Chenevier | — | gerard.chenevier@orange.com |
| Christophe Decaris | RN / Ingénierie | christophe.decaris@orange.com |
| Josy-Anne Leno | Technical Roaming Expert | josyanne.leno@orange.com |

Distributions : `oca.sys-vas@orange.com`, `oca.cn-ingenierie@orange.com`.

### Carriers

| Carrier | Ticket |
|---------|--------|
| Orange IC | `TT 2604Z42280` |
| BICS (carrier Digicel) | `SC5148552` |

## Tickets RT clients (team VAS) — 13 tickets

Voir [sms-portes-orange-tickets.md](sms-portes-orange-tickets.md).

## Actions en cours

- Orange IC doit fournir trace montrant le forwarding depuis leur réseau
- BICS attend cette trace pour investiguer de leur côté
- Antoine Martin a demandé l'escalade côté Orange

## Résolution attendue

Correction du routage SRI for SM avec ancien RN (60042) entre Orange IC et BICS, ou migration complète vers le nouveau RN.
