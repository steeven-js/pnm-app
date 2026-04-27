# Ticket #277086 — Numéro non attribué / SMS non reçus

**MSISDN :** 0690870251
**Portage :** porté IN depuis UTS
**Date :** 18/04/2026

**Demandeur :** Aneesa Hardat (aneesa.hardat@digicelgroup.fr)
**CC :** Bioule Mendy (bioule.mendy@digicelgroup.com)
**Transfert :** Jean-Philippe Victoire (VAS) → Équipe Application (20/04)

## Problème

- Cliente ne reçoit pas les SMS (bancaires + normaux)
- Application Banque Postale : *« numéro de téléphone n'est pas attribué »*
- Certicode (authentification bancaire) ne fonctionne pas
- Tests croisés effectués sans succès

## Diagnostic

- Numéro porté IN depuis UTS (confirmé par JP Victoire)
- Problème de routage SMS côté UTS pour les numéros portés chez Digicel
- Même type de problème que les SMS Orange — voir [sms-portes-orange-diagnostic.md](sms-portes-orange-diagnostic.md)
- UTS doit vérifier / mettre à jour son routage pour ce MSISDN

## Mail à envoyer à UTS (en anglais)

```
To: Martin.Paquette@libertycaribbean.com,
    Raymond.Marten@libertycaribbean.com
Cc: Winifred.TjinASioe@libertycaribbean.com,
    FWI_PNM_SI@digicelgroup.fr,
    FlowDClegal-regulatory@cwc.com

Subject: [PNM] Routing issue — SMS not delivered to ported-in number 0690870251

Hello Martin, Raymond,

We have a customer complaint regarding the MSISDN 0690870251, which was
ported from UTS to Digicel.

The customer is unable to receive any SMS (both P2P and A2P), including
banking authentication messages (Certicode from La Banque Postale).
Callers and SMS senders receive a "number not assigned" message.

The number is correctly ported and active on our network. The issue
appears to be on the routing side — SMS sent to this ported number are
not being delivered to Digicel.

Could you please verify the routing configuration for this MSISDN on
your platform and confirm that SMS traffic for ported-out numbers is
correctly forwarded to Digicel?

Best regards,

Steeven JACQUES
Application Engineer (IT) | Application Team
Digicel Antilles-Guyane
+596 696 307 631
```

## Réponse ticket RT

```
Bonjour,

Le 0690870251 est un numéro porté depuis UTS, actif chez Digicel.

Le problème de non réception des SMS est lié au routage côté UTS.
Nous avons contacté UTS pour vérifier leur configuration de routage.

Le ticket sera mis à jour dès retour d'UTS.

Cdt,
Steeven JACQUES
Equipe Application
```
