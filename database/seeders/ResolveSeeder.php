<?php

namespace Database\Seeders;

use App\Models\DecisionTree;
use App\Models\PnmCode;
use Illuminate\Database\Seeder;

class ResolveSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedPnmCodes();
        $this->seedDecisionTrees();
    }

    private function seedPnmCodes(): void
    {
        $order = 0;

        // ── File-Level Error Codes (E001-E011) ──
        $fileLevelErrors = [
            ['code' => 'E000', 'label' => 'Fichier OK', 'description' => 'Aucune erreur détectée dans le fichier.', 'probable_cause' => null, 'recommended_action' => null, 'severity' => 'info', 'subcategory' => 'Fichier'],
            ['code' => 'E001', 'label' => 'En-tête de fichier invalide', 'description' => 'L\'en-tête du fichier PNMDATA ne correspond pas au format attendu (doit commencer par 0123456789).', 'probable_cause' => 'Fichier corrompu lors du transfert sFTP ou erreur de génération côté émetteur.', 'recommended_action' => 'Vérifier le fichier source. Contacter l\'opérateur émetteur pour retransmission.', 'severity' => 'error', 'subcategory' => 'Fichier'],
            ['code' => 'E002', 'label' => 'Fin de fichier invalide', 'description' => 'Le footer du fichier ne correspond pas au format attendu (doit commencer par 9876543210).', 'probable_cause' => 'Transfert sFTP interrompu ou fichier tronqué.', 'recommended_action' => 'Vérifier si le fichier a l\'extension .tmp (transfert incomplet). Demander retransmission.', 'severity' => 'error', 'subcategory' => 'Fichier'],
            ['code' => 'E003', 'label' => 'Code opérateur non référencé', 'description' => 'Le code opérateur dans le nom du fichier n\'est pas reconnu dans le système.', 'probable_cause' => 'Erreur dans le nom du fichier ou nouvel opérateur non encore configuré.', 'recommended_action' => 'Vérifier la convention de nommage PNMDATA.XX.YY.TIMESTAMP.ZZZ. Codes valides : 01-06.', 'severity' => 'error', 'subcategory' => 'Fichier'],
            ['code' => 'E004', 'label' => 'Opérateur source et destination identiques', 'description' => 'Le fichier indique le même opérateur comme source et destination.', 'probable_cause' => 'Erreur de configuration du script de génération de fichiers.', 'recommended_action' => 'Signaler l\'anomalie à l\'opérateur émetteur.', 'severity' => 'error', 'subcategory' => 'Fichier'],
            ['code' => 'E005', 'label' => 'Date invalide', 'description' => 'La date dans le fichier n\'est pas au format attendu ou est incohérente.', 'probable_cause' => 'Erreur de formatage dans le timestamp du fichier.', 'recommended_action' => 'Vérifier le format AAAAMMJJHHMMSS dans le nom du fichier.', 'severity' => 'warning', 'subcategory' => 'Fichier'],
            ['code' => 'E006', 'label' => 'Nom de fichier invalide', 'description' => 'Le nom du fichier ne respecte pas la convention de nommage PNMDATA.', 'probable_cause' => 'Erreur dans le script de génération ou renommage manuel incorrect.', 'recommended_action' => 'Le fichier doit faire exactement 32 caractères (hors extension) : PNMDATA.XX.YY.AAAAMMJJHHMMSS.ZZZ.', 'severity' => 'error', 'subcategory' => 'Fichier'],
            ['code' => 'E007', 'label' => 'Erreur de séquence', 'description' => 'Un numéro de séquence est manquant dans la série de fichiers reçus.', 'probable_cause' => 'Fichier perdu lors du transfert ou non envoyé par l\'opérateur.', 'recommended_action' => 'Identifier le fichier manquant et demander retransmission. Vérifier les logs sFTP.', 'severity' => 'error', 'subcategory' => 'Fichier'],
            ['code' => 'E008', 'label' => 'Fichier déjà reçu (doublon)', 'description' => 'Un fichier avec le même identifiant a déjà été traité.', 'probable_cause' => 'Retransmission en mode dégradé sans nouvelle séquence ou erreur de script.', 'recommended_action' => 'Vérifier si le fichier est une retransmission légitime. Ignorer si doublon confirmé.', 'severity' => 'warning', 'subcategory' => 'Fichier'],
            ['code' => 'E009', 'label' => 'Fichier incomplet', 'description' => 'Le fichier ne contient pas toutes les données attendues.', 'probable_cause' => 'Transfert sFTP interrompu. Vérifier si l\'extension .tmp est encore présente.', 'recommended_action' => 'Attendre la fin du transfert ou demander retransmission.', 'severity' => 'error', 'subcategory' => 'Fichier'],
            ['code' => 'E010', 'label' => 'Contrôle nombre de lignes', 'description' => 'Le nombre de lignes indiqué en fin de fichier ne correspond pas au nombre réel de lignes.', 'probable_cause' => 'Fichier tronqué ou erreur dans le calcul du footer.', 'recommended_action' => 'Comparer le nombre de lignes réel avec la valeur du footer. Demander retransmission.', 'severity' => 'error', 'subcategory' => 'Fichier'],
            ['code' => 'E011', 'label' => 'Accusé de réception non reçu', 'description' => 'L\'ACR attendu pour un fichier PNMDATA n\'a pas été reçu dans le délai imparti (1 heure).', 'probable_cause' => 'Problème sFTP chez l\'opérateur destinataire ou erreur de traitement du fichier.', 'recommended_action' => 'Contacter l\'opérateur par mail. Si pas de réponse avant la prochaine vacation, ouvrir un ticket d\'incident.', 'severity' => 'warning', 'subcategory' => 'Fichier'],
        ];

        foreach ($fileLevelErrors as $e) {
            PnmCode::create([...$e, 'category' => 'Erreur technique', 'sort_order' => ++$order]);
        }

        // ── Ticket-Level Syntax Error Codes (E200-E206) ──
        $syntaxErrors = [
            ['code' => 'E200', 'label' => 'Non utilisé (réservé)', 'description' => 'Code réservé pour usage futur.', 'probable_cause' => null, 'recommended_action' => null, 'severity' => 'info', 'subcategory' => 'Syntaxe'],
            ['code' => 'E201', 'label' => 'Code transaction inconnu', 'description' => 'Le code de transaction dans le ticket n\'est pas reconnu.', 'probable_cause' => 'Ticket avec un type de transaction non référencé dans le système.', 'recommended_action' => 'Vérifier que le code transaction est dans la liste : 1110, 1120, 1210, 1220, 1410, 1430, etc.', 'severity' => 'error', 'subcategory' => 'Syntaxe'],
            ['code' => 'E202', 'label' => 'Transaction inattendue', 'description' => 'La transaction reçue n\'est pas attendue dans l\'état actuel du processus.', 'probable_cause' => 'Désynchronisation entre les opérateurs ou envoi dans le mauvais ordre.', 'recommended_action' => 'Vérifier l\'état du portage dans PortaDB et comparer avec le ticket reçu.', 'severity' => 'error', 'subcategory' => 'Syntaxe'],
            ['code' => 'E203', 'label' => 'Longueur de champ incorrecte', 'description' => 'Un champ du ticket a une longueur qui ne respecte pas la spécification.', 'probable_cause' => 'Erreur de formatage dans le système émetteur.', 'recommended_action' => 'Identifier le champ fautif et signaler à l\'opérateur. Le ticket est rejeté à la première erreur.', 'severity' => 'error', 'subcategory' => 'Syntaxe'],
            ['code' => 'E204', 'label' => 'Type de champ invalide', 'description' => 'Le type de données d\'un champ ne correspond pas au type attendu.', 'probable_cause' => 'Données non-numériques dans un champ numérique, ou caractères spéciaux non autorisés.', 'recommended_action' => 'Rappel : seuls ASCII, A-Z majuscules et 0-9 sont autorisés (sauf checksums MD5).', 'severity' => 'error', 'subcategory' => 'Syntaxe'],
            ['code' => 'E205', 'label' => 'Champ obligatoire non renseigné', 'description' => 'Un champ obligatoire du ticket est vide ou absent.', 'probable_cause' => 'Données manquantes dans le système émetteur.', 'recommended_action' => 'Identifier le champ manquant et contacter l\'opérateur pour correction.', 'severity' => 'error', 'subcategory' => 'Syntaxe'],
            ['code' => 'E206', 'label' => 'Nombre de champs incorrect', 'description' => 'Le nombre de champs séparés par le pipe (|) ne correspond pas au nombre attendu pour ce type de ticket.', 'probable_cause' => 'Erreur de formatage ou version de spécification incompatible.', 'recommended_action' => 'Comparer avec la spécification du ticket attendu. Vérifier la cohérence des séparateurs |.', 'severity' => 'error', 'subcategory' => 'Syntaxe'],
        ];

        foreach ($syntaxErrors as $e) {
            PnmCode::create([...$e, 'category' => 'Erreur syntaxique', 'sort_order' => ++$order]);
        }

        // ── Functional Error Codes (E600-E617) ──
        $functionalErrors = [
            ['code' => 'E600', 'label' => 'Date de portage dépassée', 'description' => 'La date de portage demandée est dans le passé.', 'probable_cause' => 'Retard dans le traitement de la demande ou erreur de saisie de date.', 'recommended_action' => 'Vérifier la date de portage. Si légitime, créer une nouvelle demande avec une date valide.', 'severity' => 'warning', 'subcategory' => 'Fonctionnel'],
            ['code' => 'E601', 'label' => 'Valeur réservée', 'description' => 'Code réservé pour un usage futur.', 'probable_cause' => null, 'recommended_action' => null, 'severity' => 'info', 'subcategory' => 'Fonctionnel'],
            ['code' => 'E602', 'label' => 'Numéro porté inconnu', 'description' => 'Le MSISDN indiqué comme porté n\'est pas trouvé dans la base de numéros portés.', 'probable_cause' => 'Le numéro n\'a jamais été porté ou a été restitué.', 'recommended_action' => 'Vérifier le statut du numéro dans PortaDB et le fichier PNMSYNC.', 'severity' => 'error', 'subcategory' => 'Fonctionnel'],
            ['code' => 'E603', 'label' => 'Date de portage trop éloignée', 'description' => 'La date de portage demandée est trop loin dans le futur.', 'probable_cause' => 'Erreur de saisie de la date de portage.', 'recommended_action' => 'Corriger la date. Rappel : JP = JD + 2 jours ouvrés en standard.', 'severity' => 'warning', 'subcategory' => 'Fonctionnel'],
            ['code' => 'E604', 'label' => 'Donnée de référence inter-opérateur inconnue', 'description' => 'Une valeur de référence utilisée dans l\'échange inter-opérateur n\'est pas reconnue.', 'probable_cause' => 'Identifiant de portage ou référence opérateur incorrect.', 'recommended_action' => 'Vérifier l\'ID portage (MD5) et les codes opérateurs utilisés.', 'severity' => 'error', 'subcategory' => 'Fonctionnel'],
            ['code' => 'E605', 'label' => 'Opérateur destinataire incorrect', 'description' => 'L\'opérateur destinataire de la transaction n\'est pas le bon.', 'probable_cause' => 'Erreur d\'adressage dans le routage du fichier PNMDATA.', 'recommended_action' => 'Vérifier les codes opérateurs source (XX) et destination (YY) dans le nom du fichier.', 'severity' => 'error', 'subcategory' => 'Fonctionnel'],
            ['code' => 'E606', 'label' => 'Nombre de lignes incohérent', 'description' => 'Le nombre de lignes à porter est incohérent avec le nombre de tickets reçus.', 'probable_cause' => 'Demande multiple avec tickets manquants ou en trop.', 'recommended_action' => 'Comparer le nombre de MSISDN déclarés avec les tickets effectivement reçus.', 'severity' => 'error', 'subcategory' => 'Fonctionnel'],
            ['code' => 'E607', 'label' => 'Date chômée', 'description' => 'La date de portage tombe un jour férié. Le portage ne peut pas être exécuté ce jour.', 'probable_cause' => 'La date sélectionnée correspond à un jour férié ou non ouvré.', 'recommended_action' => 'Replanifier le portage sur le prochain jour ouvré. Fenêtre de bascule : 08h30-10h00 jours ouvrés uniquement.', 'severity' => 'warning', 'subcategory' => 'Fonctionnel'],
            ['code' => 'E608', 'label' => 'Date postérieure à la date du jour', 'description' => 'La date de demande (souscription) est postérieure à la date du jour.', 'probable_cause' => 'Erreur de saisie ou décalage horaire dans le système.', 'recommended_action' => 'Corriger la date de souscription pour qu\'elle soit antérieure ou égale à la date du jour.', 'severity' => 'warning', 'subcategory' => 'Fonctionnel'],
            ['code' => 'E609', 'label' => 'Demande inconnue', 'description' => 'L\'identifiant de portage (simple ou multiple) n\'existe pas encore dans le système.', 'probable_cause' => 'Ticket reçu pour un portage non encore créé ou ID portage (MD5) incorrect.', 'recommended_action' => 'Vérifier l\'ID portage : MD5(OPR + OPD + Date_souscription + MSISDN). Rechercher dans PortaDB.', 'severity' => 'error', 'subcategory' => 'Fonctionnel'],
            ['code' => 'E610', 'label' => 'Flux non attendu dans la procédure', 'description' => 'L\'ID portage existe mais le ticket reçu n\'est pas attendu dans l\'état actuel (ex: acquittement avant ordre).', 'probable_cause' => 'Désynchronisation entre opérateurs ou envoi prématuré de ticket.', 'recommended_action' => 'Vérifier l\'état du portage dans PortaDB (etatPorta). Comparer avec le flux attendu.', 'severity' => 'error', 'subcategory' => 'Fonctionnel'],
            ['code' => 'E611', 'label' => 'Nombre max de MSISDN dépassé', 'description' => 'Le nombre maximum de numéros autorisés dans une demande multiple est dépassé (>3 particulier, >20 entreprise).', 'probable_cause' => 'Demande de portage groupée avec trop de numéros.', 'recommended_action' => 'Diviser la demande en plusieurs portages respectant les limites : 3 max (particulier), 20 max (entreprise).', 'severity' => 'warning', 'subcategory' => 'Fonctionnel'],
            ['code' => 'E612', 'label' => 'Doublon MSISDN dans demande multiple', 'description' => 'Le même numéro MSISDN apparaît plusieurs fois dans une même demande de portabilité multiple.', 'probable_cause' => 'Erreur de saisie ou bug dans le système de l\'OPR.', 'recommended_action' => 'Supprimer le doublon et renvoyer la demande.', 'severity' => 'error', 'subcategory' => 'Fonctionnel'],
            ['code' => 'E613', 'label' => 'MSISDN présent dans un autre dossier', 'description' => 'Le numéro est déjà en cours de traitement dans un autre dossier (portage inverse, tiers ou restitution).', 'probable_cause' => 'Portage concurrent sur le même numéro. Similaire à R220 mais pour portage inverse/tiers/restitution.', 'recommended_action' => 'Attendre la clôture du dossier en cours avant de relancer.', 'severity' => 'error', 'subcategory' => 'Fonctionnel'],
            ['code' => 'E614', 'label' => 'MSISDN absent du dossier initial', 'description' => 'Pour un portage inverse (BI) ou tiers (PI), le MSISDN ne figure pas dans le dossier d\'origine.', 'probable_cause' => 'Erreur de référencement du dossier initial.', 'recommended_action' => 'Vérifier l\'ancien ID portage et les MSISDN du dossier d\'origine.', 'severity' => 'error', 'subcategory' => 'Fonctionnel'],
            ['code' => 'E615', 'label' => 'Numéro à restituer non porté', 'description' => 'Le numéro désigné pour restitution n\'est pas actuellement dans la base des numéros portés.', 'probable_cause' => 'Le numéro a déjà été restitué ou n\'a jamais été porté.', 'recommended_action' => 'Vérifier le statut du numéro dans PNMSYNC et PortaDB.', 'severity' => 'error', 'subcategory' => 'Fonctionnel'],
            ['code' => 'E616', 'label' => 'OPA invalide pour restitution', 'description' => 'Le pilotage de la restitution doit être fait par l\'OPA (opérateur attributaire) du numéro.', 'probable_cause' => 'L\'opérateur qui initie la restitution n\'est pas l\'OPA du numéro.', 'recommended_action' => 'Vérifier l\'OPA du numéro et faire initier la restitution par le bon opérateur.', 'severity' => 'error', 'subcategory' => 'Fonctionnel'],
            ['code' => 'E617', 'label' => 'MSISDN manquant dans réponse d\'éligibilité', 'description' => 'Le nombre de lignes du fichier est OK mais un numéro de la demande initiale est absent de la réponse d\'éligibilité.', 'probable_cause' => 'L\'OPD n\'a pas traité tous les MSISDN de la demande.', 'recommended_action' => 'Contacter l\'OPD pour obtenir la réponse complète pour tous les MSISDN.', 'severity' => 'error', 'subcategory' => 'Fonctionnel'],
        ];

        foreach ($functionalErrors as $e) {
            PnmCode::create([...$e, 'category' => 'Erreur fonctionnelle', 'sort_order' => ++$order]);
        }

        // ── Refusal Codes (R* and A001) ──
        $refusalCodes = [
            ['code' => 'A001', 'label' => 'Demande éligible', 'description' => 'La demande de portage est acceptée. Au moins un MSISDN est éligible.', 'probable_cause' => null, 'recommended_action' => null, 'severity' => 'info', 'subcategory' => 'Acceptation'],
            ['code' => 'R120', 'label' => 'Données d\'identité incorrectes', 'description' => 'Les données d\'identité du demandeur ne correspondent pas.', 'probable_cause' => 'Informations client erronées.', 'recommended_action' => 'Obsolète en PNM V3. Si reçu, signaler l\'anomalie.', 'severity' => 'warning', 'subcategory' => 'Obsolète PNM V3'],
            ['code' => 'R121', 'label' => 'Numéro d\'immatriculation incorrect', 'description' => 'Le numéro d\'immatriculation fourni ne correspond pas.', 'probable_cause' => 'Erreur de saisie.', 'recommended_action' => 'Obsolète en PNM V3. Si reçu, signaler l\'anomalie.', 'severity' => 'warning', 'subcategory' => 'Obsolète PNM V3'],
            ['code' => 'R122', 'label' => 'Non transmission du document d\'enregistrement', 'description' => 'Le document d\'enregistrement pour une entreprise en cours d\'immatriculation n\'a pas été transmis.', 'probable_cause' => 'Document manquant.', 'recommended_action' => 'Obsolète en PNM V3. Si reçu, signaler l\'anomalie.', 'severity' => 'warning', 'subcategory' => 'Obsolète PNM V3'],
            ['code' => 'R123', 'label' => 'RIO incorrect', 'description' => 'Le Relevé d\'Identité Opérateur fourni ne correspond pas au numéro porté.', 'probable_cause' => 'Erreur de saisie du RIO par le client ou l\'OPR. Le RIO a peut-être expiré.', 'recommended_action' => 'Demander au client de redemander son RIO (3179). Vérifier le format : OO-Q-RRRRRR-CCC.', 'severity' => 'error', 'subcategory' => 'Nouveau PNM V3'],
            ['code' => 'R210', 'label' => 'Erreur destinataire de la demande', 'description' => 'La demande de portage a été envoyée au mauvais opérateur donneur.', 'probable_cause' => 'Erreur d\'identification de l\'OPD. Le client n\'est pas chez cet opérateur.', 'recommended_action' => 'Vérifier l\'opérateur actuel du numéro via le RIO ou la base PNMSYNC.', 'severity' => 'error', 'subcategory' => 'Données demande'],
            ['code' => 'R211', 'label' => 'Date de traitement dépassée', 'description' => 'La date limite de traitement du portage est dépassée.', 'probable_cause' => 'Retard dans le traitement de la demande.', 'recommended_action' => 'Recréer la demande avec une nouvelle date de portage.', 'severity' => 'warning', 'subcategory' => 'Données demande'],
            ['code' => 'R212', 'label' => 'Date de portage non valide', 'description' => 'La date de portage demandée n\'est pas valide (jour non ouvré, délai incorrect).', 'probable_cause' => 'JP ne respecte pas JD+2 jours ouvrés ou tombe un week-end/férié.', 'recommended_action' => 'Recalculer JP = JD + 2 jours ouvrés. Exclure samedis, dimanches et jours fériés.', 'severity' => 'warning', 'subcategory' => 'Données demande'],
            ['code' => 'R213', 'label' => 'Nombre de numéros dépassé', 'description' => 'Cas simple/complexe avec nombre de numéros supérieur à la limite (3 pour particulier, 20 pour entreprise).', 'probable_cause' => 'Demande de portage groupée avec trop de numéros.', 'recommended_action' => 'Diviser la demande. Max 3 numéros pour particulier, 20 pour entreprise.', 'severity' => 'warning', 'subcategory' => 'Données demande'],
            ['code' => 'R215', 'label' => 'Acte de portage non transmis', 'description' => 'L\'acte de portage n\'a pas été transmis dans le cadre d\'une procédure alternative.', 'probable_cause' => 'L\'OPR n\'a pas envoyé le mandat de portabilité requis par l\'OPD.', 'recommended_action' => 'Transmettre l\'acte de portage signé par le client.', 'severity' => 'error', 'subcategory' => 'Données demande'],
            ['code' => 'R220', 'label' => 'Autre portage en cours', 'description' => 'Un autre portage est déjà en cours pour ce numéro.', 'probable_cause' => 'Demande concurrente d\'un autre OPR ou portage précédent non clôturé.', 'recommended_action' => 'Attendre la clôture du portage en cours. Vérifier dans PortaDB l\'état du dossier existant.', 'severity' => 'error', 'subcategory' => 'Numéro'],
            ['code' => 'R221', 'label' => 'Numéro hors département d\'attribution', 'description' => 'Le numéro n\'appartient pas au département géographique de l\'opérateur destinataire.', 'probable_cause' => 'Erreur d\'identification de la zone du numéro.', 'recommended_action' => 'Vérifier le préfixe MSISDN et la zone de couverture.', 'severity' => 'error', 'subcategory' => 'Numéro'],
            ['code' => 'R222', 'label' => 'Destinataire n\'est pas l\'opérateur de souscription', 'description' => 'Le destinataire de la demande n\'est pas l\'opérateur actuel du numéro.', 'probable_cause' => 'Le numéro a déjà été porté vers un autre opérateur.', 'recommended_action' => 'Vérifier l\'opérateur hébergeant actuel via PNMSYNC.', 'severity' => 'error', 'subcategory' => 'Numéro'],
            ['code' => 'R322', 'label' => 'Ligne résiliée (hors demande de portage)', 'description' => 'La ligne a été résiliée en dehors de la demande de portabilité en cours.', 'probable_cause' => 'Le client a demandé la résiliation de sa ligne indépendamment du portage.', 'recommended_action' => 'La ligne étant résiliée, le portage ne peut pas aboutir. Contacter le client.', 'severity' => 'error', 'subcategory' => 'Numéro inactif'],
            ['code' => 'R323', 'label' => 'Ligne résiliée depuis moins de 10 jours', 'description' => 'La ligne a été résiliée à la demande du client depuis moins de 10 jours calendaires.', 'probable_cause' => 'Résiliation récente par le client avant la demande de portage.', 'recommended_action' => 'Proposer au client de contacter l\'OPD pour réactivation de la ligne avant de relancer le portage.', 'severity' => 'warning', 'subcategory' => 'Nouveau PNM V3'],
            ['code' => 'R340', 'label' => 'Numéro non contractuel', 'description' => 'Le numéro n\'est pas un numéro contractuel (ex: fax, data).', 'probable_cause' => 'Le numéro est associé à un service non-voix.', 'recommended_action' => 'Vérifier le type de ligne associé au MSISDN.', 'severity' => 'warning', 'subcategory' => 'Numéro'],
        ];

        foreach ($refusalCodes as $e) {
            PnmCode::create([...$e, 'category' => 'Refus / Éligibilité', 'sort_order' => ++$order]);
        }

        // ── Cancellation Codes (C*) ──
        $cancellationCodes = [
            ['code' => 'C001', 'label' => 'Annulation par le demandeur', 'description' => 'Le client (via l\'OPR) annule sa demande de portage.', 'probable_cause' => 'Le client change d\'avis ou a résolu son problème avec son opérateur actuel.', 'recommended_action' => 'Délai standard (JP=JD+2) : annulation possible uniquement le jour JD. Délai étendu : possible jusqu\'à JP-2.', 'severity' => 'info', 'subcategory' => null],
            ['code' => 'C002', 'label' => 'Perte d\'éligibilité', 'description' => 'L\'OPD annule le portage car le numéro n\'est plus éligible après avoir été accepté.', 'probable_cause' => 'Changement de situation du client (résiliation, impayé, fraude détectée).', 'recommended_action' => 'ATTENTION : si le ticket 1410 a déjà été envoyé, l\'annulation est impossible. Il faudra un portage inverse après bascule.', 'severity' => 'warning', 'subcategory' => null],
            ['code' => 'C003', 'label' => 'Résiliation de moins de 10 jours', 'description' => 'Annulation pour résiliation effective depuis moins de 10 jours calendaires.', 'probable_cause' => 'La ligne a été résiliée récemment.', 'recommended_action' => 'Vérifier la date de résiliation effective. Le client peut demander la réactivation auprès de l\'OPD.', 'severity' => 'warning', 'subcategory' => null],
        ];

        foreach ($cancellationCodes as $e) {
            PnmCode::create([...$e, 'category' => 'Annulation', 'sort_order' => ++$order]);
        }

        // ── Ticket Codes (Transaction Types) ──
        $ticketCodes = [
            ['code' => '1110', 'label' => 'Demande de portage particulier (DP)', 'description' => 'L\'OPR envoie une demande de portage pour un particulier à l\'OPD.', 'probable_cause' => null, 'recommended_action' => 'Envoyé entre la V10 et la V19 de JD. L\'OPD doit répondre (1210/1220) au plus tard JD+1 à la V10.', 'severity' => 'info', 'subcategory' => 'Standard'],
            ['code' => '1120', 'label' => 'Demande de portage entreprise (DE)', 'description' => 'L\'OPR envoie une demande de portage pour une personne morale à l\'OPD.', 'probable_cause' => null, 'recommended_action' => 'Même processus que 1110 mais pour les entreprises. Limite de 20 MSISDN par demande.', 'severity' => 'info', 'subcategory' => 'Standard'],
            ['code' => '1210', 'label' => 'Réponse acceptation (RP+)', 'description' => 'L\'OPD accepte la demande de portage (au moins 1 MSISDN éligible).', 'probable_cause' => null, 'recommended_action' => 'L\'OPR doit ensuite envoyer le ticket 1410 (EP) pour planifier le portage.', 'severity' => 'info', 'subcategory' => 'Standard'],
            ['code' => '1220', 'label' => 'Réponse refus (RP-)', 'description' => 'L\'OPD refuse la demande de portage (tous les MSISDN non éligibles).', 'probable_cause' => 'Voir les codes R* pour les motifs détaillés.', 'recommended_action' => 'Analyser le code de refus, corriger le problème, et relancer la demande si possible.', 'severity' => 'warning', 'subcategory' => 'Standard'],
            ['code' => '1410', 'label' => 'Envoi données de portage (EP)', 'description' => 'L\'OPR envoie les données de portage à TOUS les opérateurs pour planifier la bascule.', 'probable_cause' => null, 'recommended_action' => 'IMPORTANT : une fois le 1410 envoyé, l\'annulation n\'est plus possible. Bascule à JP 08h30-10h00.', 'severity' => 'info', 'subcategory' => 'Standard'],
            ['code' => '1430', 'label' => 'Confirmation de portage (CP)', 'description' => 'Tous les opérateurs confirment la bonne exécution du portage.', 'probable_cause' => null, 'recommended_action' => 'Ticket de clôture. Si non reçu : vérifier que la bascule a bien eu lieu dans PortaDB et MOBI.', 'severity' => 'info', 'subcategory' => 'Standard'],
            ['code' => '1510', 'label' => 'Annulation OPR (AP)', 'description' => 'L\'OPR annule une demande de portabilité avant information des opérateurs (avant 1410).', 'probable_cause' => 'Demande d\'annulation du client.', 'recommended_action' => 'L\'OPD doit confirmer par un ticket 1530 (CA).', 'severity' => 'warning', 'subcategory' => 'Standard'],
            ['code' => '1520', 'label' => 'Annulation OPD (AN)', 'description' => 'L\'OPD annule un numéro d\'une demande de portabilité (perte d\'éligibilité).', 'probable_cause' => 'Perte d\'éligibilité détectée par l\'OPD après acceptation.', 'recommended_action' => 'L\'OPR doit confirmer par un ticket 1530 (CA). Impossible après envoi du 1410.', 'severity' => 'warning', 'subcategory' => 'Standard'],
            ['code' => '1530', 'label' => 'Confirmation d\'annulation (CA)', 'description' => 'Confirmation d\'annulation d\'une demande ou d\'un numéro.', 'probable_cause' => null, 'recommended_action' => 'Clôture le processus d\'annulation. Vérifier que l\'état passe bien à "Annulé" dans PortaDB.', 'severity' => 'info', 'subcategory' => 'Standard'],
            ['code' => '2400', 'label' => 'Bon accord portage inverse (BI)', 'description' => 'Accord pour un portage inverse (retour du numéro à l\'ancien opérateur après bascule).', 'probable_cause' => 'Fraude, erreur SI, ou portage non autorisé détecté après bascule.', 'recommended_action' => 'Délai : 6h ouvrées accord, 18h ouvrées bascule SIM. Total max 32h ouvrées.', 'severity' => 'critical', 'subcategory' => 'Inverse'],
            ['code' => '2410', 'label' => 'Envoi données portage inverse (PI)', 'description' => 'L\'OPD initial envoie les données de portage inverse à tous les opérateurs.', 'probable_cause' => null, 'recommended_action' => 'Suivi urgent : le portage inverse est prioritaire. Vérifier la bonne réception par tous les opérateurs.', 'severity' => 'critical', 'subcategory' => 'Inverse'],
            ['code' => '2420', 'label' => 'Prise en compte portage inverse (DI)', 'description' => 'Confirmation de prise en compte et date de portage inverse par les opérateurs.', 'probable_cause' => null, 'recommended_action' => 'Vérifier que tous les opérateurs ont confirmé la prise en compte.', 'severity' => 'warning', 'subcategory' => 'Inverse'],
            ['code' => '2430', 'label' => 'Confirmation portage inverse (CI)', 'description' => 'Confirmation de l\'exécution du portage inverse par tous les opérateurs.', 'probable_cause' => null, 'recommended_action' => 'Ticket de clôture du portage inverse. Vérifier la mise à jour dans PortaDB et le routage réseau.', 'severity' => 'info', 'subcategory' => 'Inverse'],
            ['code' => '3400', 'label' => 'Bon accord restitution (BR)', 'description' => 'L\'OPR initie une restitution du numéro à l\'OPA.', 'probable_cause' => 'Le client a résilié sa ligne. L\'OPR restitue après 15 jours calendaires.', 'recommended_action' => 'L\'OPA doit traiter la restitution. Bascule prévue sous 24h ouvrées max.', 'severity' => 'info', 'subcategory' => 'Restitution'],
            ['code' => '3410', 'label' => 'Envoi données restitution (RN)', 'description' => 'L\'OPA envoie les données de restitution à tous les opérateurs.', 'probable_cause' => null, 'recommended_action' => 'Vérifier la bonne réception par tous les opérateurs.', 'severity' => 'info', 'subcategory' => 'Restitution'],
            ['code' => '3420', 'label' => 'Prise en compte restitution (RS)', 'description' => 'Tous les opérateurs confirment la prise en compte des données de restitution.', 'probable_cause' => null, 'recommended_action' => 'Délai de confirmation : 6h ouvrées, max 8h ouvrées.', 'severity' => 'info', 'subcategory' => 'Restitution'],
            ['code' => '3430', 'label' => 'Confirmation restitution (RC)', 'description' => 'Confirmation de la mise à jour par chacun des opérateurs après restitution.', 'probable_cause' => null, 'recommended_action' => 'Ticket de clôture de la restitution. Le numéro retourne à l\'OPA.', 'severity' => 'info', 'subcategory' => 'Restitution'],
            ['code' => '7000', 'label' => 'Erreurs et dysfonctionnements (ER)', 'description' => 'Ticket de signalement d\'erreurs et dysfonctionnements entre opérateurs.', 'probable_cause' => 'Erreur technique ou fonctionnelle détectée lors du traitement inter-opérateur.', 'recommended_action' => 'IMPORTANT : un 7000 avec code erreur sur un MSISDN ne clôture PAS les échanges pour ce numéro.', 'severity' => 'error', 'subcategory' => 'Erreur'],
        ];

        foreach ($ticketCodes as $e) {
            PnmCode::create([...$e, 'category' => 'Ticket', 'sort_order' => ++$order]);
        }

        // ── Operator Codes ──
        $operatorCodes = [
            ['code' => 'OP01', 'label' => 'Orange Caraïbe', 'description' => 'Opérateur historique de la zone Antilles-Guyane. Contact PNM : oag.pnm-si@orange.com.', 'probable_cause' => null, 'recommended_action' => null, 'severity' => 'info', 'subcategory' => null],
            ['code' => 'OP02', 'label' => 'Digicel Antilles Françaises - Guyane', 'description' => 'Notre opérateur. Code PNMDATA : 02. FNR NP : 60042.', 'probable_cause' => null, 'recommended_action' => null, 'severity' => 'info', 'subcategory' => null],
            ['code' => 'OP03', 'label' => 'Outremer Telecom / SFR Caraïbe', 'description' => 'Opérateur SFR zone Antilles-Guyane. Contact PNM : pnm@outremer-telecom.fr.', 'probable_cause' => null, 'recommended_action' => null, 'severity' => 'info', 'subcategory' => null],
            ['code' => 'OP04', 'label' => 'Dauphin Telecom', 'description' => 'Opérateur Dauphin Telecom, actif sur Saint-Martin et Saint-Barthélemy.', 'probable_cause' => null, 'recommended_action' => null, 'severity' => 'info', 'subcategory' => null],
            ['code' => 'OP05', 'label' => 'UTS Caraïbe', 'description' => 'Opérateur UTS, filiale de Liberty Latin America. Contact : uts-french-portability@cwc.com.', 'probable_cause' => null, 'recommended_action' => null, 'severity' => 'info', 'subcategory' => null],
            ['code' => 'OP06', 'label' => 'Free Caraïbes', 'description' => 'Opérateur Free pour les Antilles-Guyane. Contact PNM : pan@fm.proxad.net.', 'probable_cause' => null, 'recommended_action' => null, 'severity' => 'info', 'subcategory' => null],
        ];

        foreach ($operatorCodes as $e) {
            PnmCode::create([...$e, 'category' => 'Opérateur', 'sort_order' => ++$order]);
        }
    }

    private function seedDecisionTrees(): void
    {
        $treeMeta = [
            ['title' => 'Portabilité normale entrante bloquée', 'slug' => 'normale-entrante-bloquee', 'description' => 'Diagnostic d\'un portage entrant (Digicel reçoit) qui ne progresse pas.', 'icon' => '📥', 'sort_order' => 1],
            ['title' => 'Portabilité normale sortante bloquée', 'slug' => 'normale-sortante-bloquee', 'description' => 'Diagnostic d\'un portage sortant (client quitte Digicel) qui ne progresse pas.', 'icon' => '📤', 'sort_order' => 2],
            ['title' => 'Rejet opérateur — analyser le code', 'slug' => 'rejet-operateur', 'description' => 'Un opérateur a rejeté une demande. Identifier la cause et l\'action corrective.', 'icon' => '🚫', 'sort_order' => 3],
            ['title' => 'ACK manquant après vacation', 'slug' => 'ack-manquant', 'description' => 'Un accusé de réception n\'a pas été reçu après l\'envoi d\'un fichier PNMDATA.', 'icon' => '⏳', 'sort_order' => 4],
            ['title' => 'RIO invalide — diagnostic', 'slug' => 'rio-invalide', 'description' => 'Le RIO fourni est rejeté. Identifier la cause exacte.', 'icon' => '🔑', 'sort_order' => 5],
            ['title' => 'Mode dégradé SFTP', 'slug' => 'mode-degrade-sftp', 'description' => 'La liaison SFTP inter-opérateurs est en panne. Procédure de mode dégradé.', 'icon' => '🔧', 'sort_order' => 6],
        ];

        $treeJsonFiles = [
            'normale-entrante-bloquee',
            'normale-sortante-bloquee',
            'rejet-operateur',
            'ack-manquant',
            'rio-invalide',
            'mode-degrade-sftp',
        ];

        foreach ($treeMeta as $i => $meta) {
            $jsonPath = database_path("seeders/data/trees/{$treeJsonFiles[$i]}.json");
            $treeData = json_decode(file_get_contents($jsonPath), true);
            DecisionTree::create([...$meta, 'tree_data' => $treeData]);
        }
    }
}
