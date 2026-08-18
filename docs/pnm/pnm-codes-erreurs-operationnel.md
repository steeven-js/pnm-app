# Codes E — lecture opérationnelle

La liste normative complète (E001→E617, cadre GPMAG) est dans [`reglementaire/annexes-inter-operateurs.md`](../reglementaire/annexes-inter-operateurs.md). Ce document-ci ne la répète pas : il dit **ce qu'on voit réellement dans nos logs**, ce que ça veut dire chez nous, et quoi en faire.

⚠️ **Point le plus important à retenir :** notre web service **ne respecte pas toujours le sens normatif du code**. E006 et E011 sont surchargés et portent chacun plusieurs significations sans rapport entre elles. C'est la première cause de mauvais diagnostic.

---

## Le tri en une phrase

| Ce qu'on voit | Est-ce un incident ? |
|---|---|
| `E000` | Non, c'est le succès |
| `E011` sortant, le lundi matin, vers DT ou UTS | Non, faux positif hebdomadaire connu |
| `E008` qui se répète sur le même fichier | Le fichier est intégré ; c'est l'accusé qui a échoué avant |
| `E006` à l'heure d'une vacation | Oui, un fichier n'est pas parti ou un accusé n'a pas été généré |
| `E610` / `E600` reçus d'un partenaire | Côté partenaire, désynchronisation |

---

## E000 — succès

Sur un accusé reçu, le partenaire a bien intégré notre fichier. Sur un accusé qu'on émet, on a intégré le sien. Le 6ᵉ champ de l'accusé est le **nombre de lignes** du fichier acquitté, pas le nombre de transactions.

## E003 — code opérateur non référencé

Norme : le code opérateur du nom de fichier n'est pas reconnu.

**Chez nous**, on le rencontre surtout quand un PNMDATA reçu contient un **ticket destiné à un autre opérateur** (3ᵉ champ de la ligne ≠ opérateur destinataire du fichier). Le WS lève alors E003 puis une NullPointerException, le fichier n'est pas archivé, et on part en boucle E008.

## E006 — attention, trois sens différents

Norme : nom de fichier invalide. Dans nos logs, **trois situations sans rapport** :

**1. Le vrai cas — nom de fichier non reconnu**
```
[E006:0] filename=PNMDATA.02.04.20260817100035.001.tmp.ACR,
         le nom de fichier n'est pas reconnu
```
Arrive quand un partenaire nous renvoie un accusé nommé d'après un fichier `.tmp` qu'il a ramassé chez nous. L'accusé est définitivement irrecevable et reboucle dans `recv/` jusqu'à ce qu'on le sorte à la main. Demande **#5265**.

**2. `multiple points`** — `NumberFormatException` Java (un `Double.parseDouble` sur une chaîne à plusieurs points). Rien à voir avec un nom de fichier.

**3. `For input string: ""`** — `NumberFormatException` également (un `Integer.parseInt` sur une chaîne vide).

Les cas 2 et 3 font échouer soit la **génération d'un fichier sortant**, soit la **génération de l'accusé** d'un fichier reçu. Demande **#5263**.

Relevé au 18/08/2026 : 5 échecs de génération en 2026, **tous sur Orange**, tous à 14h ou 19h — 16/06, 19/06, 29/07, 13/08, 18/08.

## E008 — fichier déjà reçu

Le code est **exact** : on notifie au WS un fichier qu'il connaît déjà. Mais c'est presque toujours un **symptôme**, pas la cause.

Enchaînement typique : le WS commite le fichier et tous ses tickets, puis échoue en générant l'accusé. Le fichier n'est donc pas archivé, il reste dans `recv/`, et chaque passage suivant le renotifie — d'où un E008 toutes les 10 minutes, indéfiniment.

**Réflexe :** chercher le vrai incident à l'heure de réception du fichier, pas à l'heure du E008. Puis vérifier si l'accusé existe dans `arch_send/<op>/`. Si le métier est complet (nombre de tickets en base = lignes du pied − 2), il suffit de sortir le fichier de `recv/` vers `arch_recv/`.

## E010 — contrôle du nombre de lignes

Norme : incohérence entre le pied de page et le contenu réel.

**Chez nous**, c'est ce que renvoie un opérateur qui a ramassé notre fichier temporaire `.tmp` — il traite un fichier au nom invalide et le rejette. Observé chez Dauphin les 05/07 et 19/07/2026.

## E011 — deux sens opposés

**Sortant, émis par nous** : « AR non-reçu … envoyé depuis plus de 60 minutes ». On relance un partenaire qui n'a pas accusé. Le seuil est bien calibré — 898 de nos fichiers sur 901 sont acquittés en moins d'une heure.
⚠️ **Faux positif systématique** chaque lundi matin vers Dauphin et UTS, qui n'acquittent que le dimanche soir suivant.

**Entrant, refus de notre WS** :
```
[E011:0] Ack reçu pour un fichier non-enregistré, Ack=...
```
L'accusé du partenaire arrive pour un fichier qui n'a **pas de ligne `FICHIER`** en base — parce que son enregistrement avait échoué à la génération. L'accusé est irrecevable et reboucle. Même geste que pour le E006 cas 1 : le sortir de `recv/`.

## E600 et E610 — fonctionnels, côté partenaire

`E600` = date de portage dépassée. `E610` = l'ID portage existe déjà mais le flux reçu n'est pas attendu à ce stade de la procédure.

Un E610 isolé n'est pas alarmant, mais un flux continu signale une **désynchronisation des référentiels** entre nous et le partenaire — c'est ce qu'a produit l'arrêt du PNMSYNC (anomalie #5239). En simulation, un E610 apparaît aussi quand on dépose un 1210 alors que le portage est encore en *Saisi DP* (voir [P47](../protocoles/p47-simulation-portabilite-entrante-int.md)).

---

## Où lire quoi

| Fichier de log | Contenu |
|---|---|
| `~/PortaSync/log/PnmDataManager.log` | génération des fichiers sortants (vacations 10h, 14h, 19h) |
| `~/PortaSync/log/PnmAckManager.log` | accusés — c'est ici qu'écrit `PnmDataAckManager.php`, pas dans un fichier à son nom |
| `~/PortaSync/log/PnmDataAckGenerator.log` | génération des `.ERR` (E011 sortants), à 11h15, 15h15 et 20h15 |

Pour retrouver un échec de génération :
```bash
grep -a -B6 "Tentative de notification echoue" ~/PortaSync/log/PnmDataManager.log
```
