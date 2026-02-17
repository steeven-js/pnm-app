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

        $fileLevelErrors = [
            ['code' => 'E000', 'label' => 'Fichier OK', 'description' => 'Aucune erreur détectée dans le fichier.', 'probable_cause' => null, 'recommended_action' => null, 'severity' => 'info', 'subcategory' => 'Fichier'],
            ['code' => 'E001', 'label' => 'En-tête de fichier invalide', 'description' => 'L\'en-tête du fichier PNMDATA ne correspond pas au format attendu.', 'probable_cause' => 'Fichier corrompu lors du transfert sFTP ou erreur de génération.', 'recommended_action' => 'Vérifier le fichier source. Contacter l\'opérateur émetteur pour retransmission.', 'severity' => 'error', 'subcategory' => 'Fichier'],
            ['code' => 'E002', 'label' => 'Fin de fichier invalide', 'description' => 'Le footer du fichier ne correspond pas au format attendu.', 'probable_cause' => 'Transfert sFTP interrompu ou fichier tronqué.', 'recommended_action' => 'Vérifier l\'extension .tmp. Demander retransmission.', 'severity' => 'error', 'subcategory' => 'Fichier'],
            ['code' => 'E003', 'label' => 'Code opérateur non référencé', 'description' => 'Le code opérateur dans le nom du fichier n\'est pas reconnu.', 'probable_cause' => 'Erreur dans le nom du fichier.', 'recommended_action' => 'Vérifier la convention de nommage.', 'severity' => 'error', 'subcategory' => 'Fichier'],
        ];

        foreach ($fileLevelErrors as $e) {
            PnmCode::create([...$e, 'category' => 'Erreur technique', 'sort_order' => ++$order]);
        }

        $refusalCodes = [
            ['code' => 'A001', 'label' => 'Demande éligible', 'description' => 'La demande de portage est acceptée.', 'probable_cause' => null, 'recommended_action' => null, 'severity' => 'info', 'subcategory' => 'Acceptation'],
            ['code' => 'R123', 'label' => 'RIO incorrect', 'description' => 'Le RIO fourni ne correspond pas au numéro porté.', 'probable_cause' => 'Erreur de saisie du RIO.', 'recommended_action' => 'Demander au client de redemander son RIO (3179).', 'severity' => 'error', 'subcategory' => 'Nouveau PNM V3'],
            ['code' => 'R210', 'label' => 'Erreur destinataire de la demande', 'description' => 'La demande a été envoyée au mauvais opérateur donneur.', 'probable_cause' => 'Erreur d\'identification de l\'OPD.', 'recommended_action' => 'Vérifier l\'opérateur actuel via le RIO.', 'severity' => 'error', 'subcategory' => 'Données demande'],
            ['code' => 'R220', 'label' => 'Autre portage en cours', 'description' => 'Un autre portage est déjà en cours pour ce numéro.', 'probable_cause' => 'Demande concurrente.', 'recommended_action' => 'Attendre la clôture du portage en cours.', 'severity' => 'error', 'subcategory' => 'Numéro'],
        ];

        foreach ($refusalCodes as $e) {
            PnmCode::create([...$e, 'category' => 'Refus / Éligibilité', 'sort_order' => ++$order]);
        }

        $ticketCodes = [
            ['code' => '1110', 'label' => 'Demande de portage particulier (DP)', 'description' => 'L\'OPR envoie une demande de portage pour un particulier à l\'OPD.', 'probable_cause' => null, 'recommended_action' => null, 'severity' => 'info', 'subcategory' => 'Standard'],
            ['code' => '1210', 'label' => 'Réponse acceptation (RP+)', 'description' => 'L\'OPD accepte la demande de portage.', 'probable_cause' => null, 'recommended_action' => null, 'severity' => 'info', 'subcategory' => 'Standard'],
            ['code' => '1220', 'label' => 'Réponse refus (RP-)', 'description' => 'L\'OPD refuse la demande de portage.', 'probable_cause' => null, 'recommended_action' => 'Analyser le code de refus.', 'severity' => 'warning', 'subcategory' => 'Standard'],
            ['code' => '1410', 'label' => 'Envoi données de portage (EP)', 'description' => 'L\'OPR envoie les données de portage.', 'probable_cause' => null, 'recommended_action' => 'Annulation impossible après envoi.', 'severity' => 'info', 'subcategory' => 'Standard'],
            ['code' => '1430', 'label' => 'Confirmation de portage (CP)', 'description' => 'Confirmation de la bonne exécution du portage.', 'probable_cause' => null, 'recommended_action' => null, 'severity' => 'info', 'subcategory' => 'Standard'],
        ];

        foreach ($ticketCodes as $e) {
            PnmCode::create([...$e, 'category' => 'Ticket', 'sort_order' => ++$order]);
        }

        $operatorCodes = [
            ['code' => 'OP01', 'label' => 'Orange Caraïbe', 'description' => 'Opérateur historique de la zone Antilles-Guyane.', 'probable_cause' => null, 'recommended_action' => null, 'severity' => 'info', 'subcategory' => null],
            ['code' => 'OP02', 'label' => 'Digicel Antilles Françaises - Guyane', 'description' => 'Notre opérateur. Code PNMDATA : 02.', 'probable_cause' => null, 'recommended_action' => null, 'severity' => 'info', 'subcategory' => null],
            ['code' => 'OP03', 'label' => 'Outremer Telecom / SFR Caraïbe', 'description' => 'Opérateur SFR zone Antilles-Guyane.', 'probable_cause' => null, 'recommended_action' => null, 'severity' => 'info', 'subcategory' => null],
            ['code' => 'OP06', 'label' => 'Free Caraïbes', 'description' => 'Opérateur Free pour les Antilles-Guyane.', 'probable_cause' => null, 'recommended_action' => null, 'severity' => 'info', 'subcategory' => null],
        ];

        foreach ($operatorCodes as $e) {
            PnmCode::create([...$e, 'category' => 'Opérateur', 'sort_order' => ++$order]);
        }
    }

    private function seedDecisionTrees(): void
    {
        $treeMeta = [
            ['title' => 'Portabilité normale entrante bloquée', 'slug' => 'normale-entrante-bloquee', 'description' => 'Diagnostic d\'un portage entrant qui ne progresse pas.', 'icon' => 'solar:inbox-in-bold-duotone', 'sort_order' => 1],
            ['title' => 'Portabilité normale sortante bloquée', 'slug' => 'normale-sortante-bloquee', 'description' => 'Diagnostic d\'un portage sortant qui ne progresse pas.', 'icon' => 'solar:inbox-out-bold-duotone', 'sort_order' => 2],
            ['title' => 'Rejet opérateur — analyser le code', 'slug' => 'rejet-operateur', 'description' => 'Identifier la cause d\'un rejet.', 'icon' => 'solar:close-circle-bold-duotone', 'sort_order' => 3],
            ['title' => 'ACK manquant après vacation', 'slug' => 'ack-manquant', 'description' => 'ACR non reçu après envoi PNMDATA.', 'icon' => 'solar:clock-circle-bold-duotone', 'sort_order' => 4],
            ['title' => 'RIO invalide — diagnostic', 'slug' => 'rio-invalide', 'description' => 'Le RIO fourni est rejeté.', 'icon' => 'solar:key-bold-duotone', 'sort_order' => 5],
            ['title' => 'Mode dégradé SFTP', 'slug' => 'mode-degrade-sftp', 'description' => 'Liaison SFTP en panne.', 'icon' => 'solar:settings-bold-duotone', 'sort_order' => 6],
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
            $treeData = file_exists($jsonPath) ? json_decode(file_get_contents($jsonPath), true) : [];
            DecisionTree::create([...$meta, 'tree_data' => $treeData]);
        }
    }
}
