<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PortaSeeder extends Seeder
{
    /**
     * 30 jours d'activité PNM simulée avec anomalies volontaires.
     */
    public function run(): void
    {
        $this->seedOperateurs();
        $this->seedCodeTickets();
        $this->seedCodeReponses();
        $this->seedEtats();
        $this->seedTransitions();
        $this->seedTranches();
        $this->seedFerrydays();
        $this->seedMsisdns();
        $this->seedDossiers();
        $this->seedFichiers();
        $this->seedSync();
    }

    // ──────────────────────────────────────────────
    // Référentiels
    // ──────────────────────────────────────────────

    private function seedOperateurs(): void
    {
        $ops = [
            ['code' => '01', 'nom' => 'Orange Caraïbe', 'is_active' => true, 'contact' => 'Jean DUPONT', 'email' => 'pnm@orangecaraibe.com'],
            ['code' => '02', 'nom' => 'Digicel', 'is_active' => true, 'contact' => 'Marie JOSEPH', 'email' => 'pnm@digicelgroup.com'],
            ['code' => '03', 'nom' => 'SFR Caraïbe', 'is_active' => true, 'contact' => 'Paul LARIVIÈRE', 'email' => 'pnm@sfrcaraibe.fr'],
            ['code' => '04', 'nom' => 'Dauphin Telecom', 'is_active' => true, 'contact' => 'Anne BELMONT', 'email' => 'pnm@dauphin.gp'],
            ['code' => '05', 'nom' => 'UTS Caraïbe', 'is_active' => true, 'contact' => 'Pierre ELISE', 'email' => 'pnm@uts.sx'],
            ['code' => '06', 'nom' => 'Free Caraïbe', 'is_active' => true, 'contact' => 'Luc MONTROSE', 'email' => 'pnm@free.gp'],
        ];

        DB::table('porta_operateur')->insert($ops);
    }

    private function seedCodeTickets(): void
    {
        $tickets = [
            ['code' => '1110', 'name' => 'DEMANDE', 'label' => 'Demande de portage simple entrante', 'description' => 'Ticket initial envoyé par l\'OPR à l\'OPD pour demander le portage d\'un numéro.'],
            ['code' => '1120', 'name' => 'DEMANDE_MULTI', 'label' => 'Demande de portage multi-lignes', 'description' => 'Demande groupée pour plusieurs numéros d\'un même client.'],
            ['code' => '1210', 'name' => 'REPONSE_OK', 'label' => 'Réponse positive à la demande', 'description' => 'L\'OPD confirme l\'éligibilité du numéro au portage.'],
            ['code' => '1220', 'name' => 'REPONSE_KO', 'label' => 'Réponse négative (refus)', 'description' => 'L\'OPD refuse le portage pour un motif précis (RIO invalide, résiliation, etc.).'],
            ['code' => '1410', 'name' => 'BASCULE', 'label' => 'Notification de bascule', 'description' => 'L\'OPR notifie l\'OPD que la bascule technique a été effectuée.'],
            ['code' => '1430', 'name' => 'CONFIRM_BASCULE', 'label' => 'Confirmation de bascule', 'description' => 'L\'OPD confirme la prise en compte de la bascule.'],
            ['code' => '1510', 'name' => 'ANNULATION_OPR', 'label' => 'Annulation par l\'OPR', 'description' => 'L\'opérateur receveur annule sa demande de portage.'],
            ['code' => '1520', 'name' => 'ANNULATION_OPD', 'label' => 'Annulation par l\'OPD', 'description' => 'L\'opérateur donneur annule le portage.'],
            ['code' => '1530', 'name' => 'ANNULATION_CLIENT', 'label' => 'Annulation par le client', 'description' => 'Le client se rétracte et annule sa demande.'],
            ['code' => '2410', 'name' => 'BASCULE_INV', 'label' => 'Bascule inverse (restitution)', 'description' => 'Bascule dans le sens inverse en cas d\'erreur.'],
            ['code' => '2420', 'name' => 'CONFIRM_INV', 'label' => 'Confirmation bascule inverse', 'description' => null],
            ['code' => '2430', 'name' => 'REJECT_INV', 'label' => 'Rejet bascule inverse', 'description' => null],
            ['code' => '3400', 'name' => 'CHANGE_MSISDN', 'label' => 'Changement de MSISDN', 'description' => 'Modification du numéro attribué lors d\'un portage.'],
            ['code' => '3410', 'name' => 'CONFIRM_CHANGE', 'label' => 'Confirmation changement MSISDN', 'description' => null],
            ['code' => '3420', 'name' => 'REJECT_CHANGE', 'label' => 'Rejet changement MSISDN', 'description' => null],
            ['code' => '3430', 'name' => 'CANCEL_CHANGE', 'label' => 'Annulation changement MSISDN', 'description' => null],
            ['code' => '7000', 'name' => 'ERREUR', 'label' => 'Erreur technique sur ticket', 'description' => 'Champ obligatoire manquant ou invalide dans un ticket.'],
        ];

        DB::table('porta_code_ticket')->insert($tickets);
    }

    private function seedCodeReponses(): void
    {
        $codes = [
            // Erreurs fichier
            ['code' => 'E601', 'type' => 'erreur', 'label' => 'Fichier corrompu ou illisible'],
            ['code' => 'E602', 'type' => 'erreur', 'label' => 'Séquence de fichier incorrecte'],
            ['code' => 'E603', 'type' => 'erreur', 'label' => 'Opérateur inconnu dans l\'en-tête'],
            ['code' => 'E604', 'type' => 'erreur', 'label' => 'Nombre de tickets incorrect'],
            ['code' => 'E605', 'type' => 'erreur', 'label' => 'Format de date invalide'],
            ['code' => 'E610', 'type' => 'erreur', 'label' => 'Erreur générique de traitement'],
            // Motifs de refus (éligibilité)
            ['code' => 'R100', 'type' => 'eligibilite', 'label' => 'RIO invalide ou ne correspondant pas au MSISDN'],
            ['code' => 'R110', 'type' => 'eligibilite', 'label' => 'RIO expiré'],
            ['code' => 'R200', 'type' => 'eligibilite', 'label' => 'Numéro déjà en cours de portage'],
            ['code' => 'R210', 'type' => 'eligibilite', 'label' => 'Numéro résilié'],
            ['code' => 'R220', 'type' => 'eligibilite', 'label' => 'Numéro suspendu ou bloqué'],
            ['code' => 'R300', 'type' => 'eligibilite', 'label' => 'Engagement contractuel en cours'],
            ['code' => 'R310', 'type' => 'eligibilite', 'label' => 'Opposition du titulaire'],
            ['code' => 'R400', 'type' => 'eligibilite', 'label' => 'Portage impossible — numéro entreprise multi-lignes'],
            // Motifs d'annulation
            ['code' => 'A100', 'type' => 'annulation', 'label' => 'Annulation volontaire du client'],
            ['code' => 'A200', 'type' => 'annulation', 'label' => 'Rétractation dans le délai légal'],
            ['code' => 'A300', 'type' => 'annulation', 'label' => 'Échec technique de la bascule'],
            ['code' => 'A400', 'type' => 'annulation', 'label' => 'Annulation administrative'],
        ];

        DB::table('porta_code_reponse')->insert($codes);
    }

    private function seedEtats(): void
    {
        $etats = [
            // Normal entrante
            ['id' => 1, 'type' => 'normal', 'direction' => 'entrante', 'classe' => 'saisi', 'label' => 'Saisi entrante', 'is_begin' => true, 'is_end' => false],
            ['id' => 2, 'type' => 'normal', 'direction' => 'entrante', 'classe' => 'encours', 'label' => 'En cours entrante', 'is_begin' => false, 'is_end' => false],
            ['id' => 3, 'type' => 'normal', 'direction' => 'entrante', 'classe' => 'bascule', 'label' => 'Bascule entrante', 'is_begin' => false, 'is_end' => false],
            ['id' => 4, 'type' => 'normal', 'direction' => 'entrante', 'classe' => 'cloture', 'label' => 'Clôturé entrante', 'is_begin' => false, 'is_end' => true],
            ['id' => 5, 'type' => 'normal', 'direction' => 'entrante', 'classe' => 'refuse', 'label' => 'Refusé entrante', 'is_begin' => false, 'is_end' => true],
            ['id' => 6, 'type' => 'normal', 'direction' => 'entrante', 'classe' => 'annule', 'label' => 'Annulé entrante', 'is_begin' => false, 'is_end' => true],
            // Normal sortante
            ['id' => 7, 'type' => 'normal', 'direction' => 'sortante', 'classe' => 'saisi', 'label' => 'Saisi sortante', 'is_begin' => true, 'is_end' => false],
            ['id' => 8, 'type' => 'normal', 'direction' => 'sortante', 'classe' => 'encours', 'label' => 'En cours sortante', 'is_begin' => false, 'is_end' => false],
            ['id' => 9, 'type' => 'normal', 'direction' => 'sortante', 'classe' => 'bascule', 'label' => 'Bascule sortante', 'is_begin' => false, 'is_end' => false],
            ['id' => 10, 'type' => 'normal', 'direction' => 'sortante', 'classe' => 'cloture', 'label' => 'Clôturé sortante', 'is_begin' => false, 'is_end' => true],
            ['id' => 11, 'type' => 'normal', 'direction' => 'sortante', 'classe' => 'refuse', 'label' => 'Refusé sortante', 'is_begin' => false, 'is_end' => true],
            ['id' => 12, 'type' => 'normal', 'direction' => 'sortante', 'classe' => 'annule', 'label' => 'Annulé sortante', 'is_begin' => false, 'is_end' => true],
            // Inverse
            ['id' => 13, 'type' => 'inverse', 'direction' => 'entrante', 'classe' => 'saisi', 'label' => 'Restitution saisi', 'is_begin' => true, 'is_end' => false],
            ['id' => 14, 'type' => 'inverse', 'direction' => 'entrante', 'classe' => 'bascule', 'label' => 'Restitution bascule', 'is_begin' => false, 'is_end' => false],
            ['id' => 15, 'type' => 'inverse', 'direction' => 'entrante', 'classe' => 'cloture', 'label' => 'Restitution clôturé', 'is_begin' => false, 'is_end' => true],
        ];

        DB::table('porta_etat')->insert($etats);
    }

    private function seedTransitions(): void
    {
        $transitions = [
            // Normal entrante workflow
            ['etat_id_from' => 1, 'etat_id_to' => 2, 'evenement' => 'Réponse positive OPD', 'ticket_id_evenement' => '1210'],
            ['etat_id_from' => 1, 'etat_id_to' => 5, 'evenement' => 'Refus OPD', 'ticket_id_evenement' => '1220'],
            ['etat_id_from' => 1, 'etat_id_to' => 6, 'evenement' => 'Annulation OPR', 'ticket_id_evenement' => '1510'],
            ['etat_id_from' => 2, 'etat_id_to' => 3, 'evenement' => 'Bascule technique effectuée', 'ticket_id_evenement' => '1410'],
            ['etat_id_from' => 2, 'etat_id_to' => 6, 'evenement' => 'Annulation avant bascule', 'ticket_id_evenement' => '1510'],
            ['etat_id_from' => 3, 'etat_id_to' => 4, 'evenement' => 'Confirmation bascule OPD', 'ticket_id_evenement' => '1430'],
            // Normal sortante workflow
            ['etat_id_from' => 7, 'etat_id_to' => 8, 'evenement' => 'Réponse positive envoyée', 'ticket_id_evenement' => '1210'],
            ['etat_id_from' => 7, 'etat_id_to' => 11, 'evenement' => 'Refus envoyé', 'ticket_id_evenement' => '1220'],
            ['etat_id_from' => 8, 'etat_id_to' => 9, 'evenement' => 'Bascule reçue', 'ticket_id_evenement' => '1410'],
            ['etat_id_from' => 9, 'etat_id_to' => 10, 'evenement' => 'Confirmation bascule envoyée', 'ticket_id_evenement' => '1430'],
            // Inverse
            ['etat_id_from' => 13, 'etat_id_to' => 14, 'evenement' => 'Bascule inverse', 'ticket_id_evenement' => '2410'],
            ['etat_id_from' => 14, 'etat_id_to' => 15, 'evenement' => 'Confirmation bascule inverse', 'ticket_id_evenement' => '2420'],
        ];

        DB::table('porta_transition')->insert($transitions);
    }

    private function seedTranches(): void
    {
        $tranches = [
            // Orange Caraïbe
            ['operateur_id' => '01', 'debut' => '0690000000', 'fin' => '0690499999'],
            ['operateur_id' => '01', 'debut' => '0590000000', 'fin' => '0590499999'],
            // Digicel
            ['operateur_id' => '02', 'debut' => '0690500000', 'fin' => '0690999999'],
            ['operateur_id' => '02', 'debut' => '0694000000', 'fin' => '0694499999'],
            // SFR Caraïbe
            ['operateur_id' => '03', 'debut' => '0694500000', 'fin' => '0694999999'],
            // Dauphin Telecom
            ['operateur_id' => '04', 'debut' => '0690200000', 'fin' => '0690209999'],
            // UTS
            ['operateur_id' => '05', 'debut' => '0690300000', 'fin' => '0690309999'],
            // Free Caraïbe
            ['operateur_id' => '06', 'debut' => '0696000000', 'fin' => '0696499999'],
        ];

        DB::table('porta_tranche')->insert($tranches);
    }

    private function seedFerrydays(): void
    {
        // Jours fériés GPMAG 2026
        $holidays = [
            '2026-01-01', // Jour de l'An
            '2026-02-17', // Mardi Gras
            '2026-02-18', // Mercredi des Cendres
            '2026-03-12', // Mi-Carême
            '2026-04-03', // Vendredi Saint
            '2026-04-06', // Lundi de Pâques
            '2026-05-01', // Fête du Travail
            '2026-05-08', // Victoire 1945
            '2026-05-14', // Ascension
            '2026-05-22', // Abolition (Martinique)
            '2026-05-25', // Lundi de Pentecôte
            '2026-05-27', // Abolition (Guadeloupe)
            '2026-05-28', // Abolition (Saint-Martin)
            '2026-06-10', // Abolition (Guyane)
            '2026-07-14', // Fête nationale
            '2026-08-15', // Assomption
            '2026-10-09', // Abolition (Saint-Barthélemy)
            '2026-11-01', // Toussaint
            '2026-11-02', // Jour des Défunts
            '2026-11-11', // Armistice
            '2026-12-25', // Noël
        ];

        foreach ($holidays as $date) {
            DB::table('porta_ferryday')->insert(['ferryday' => $date, 'is_active' => true]);
        }
    }

    // ──────────────────────────────────────────────
    // Données opérationnelles (30 jours)
    // ──────────────────────────────────────────────

    private array $msisdnList = [];

    private array $portageIds = [];

    private array $dossierIds = [];

    /** id_portage values for portages stuck in bascule (must NOT have ticket 1430) */
    private array $basculeAnomalyPortageIds = [];

    private function seedMsisdns(): void
    {
        $trancheMap = DB::table('porta_tranche')->get()->keyBy('id');
        $operators = ['01', '02', '03', '04', '05', '06'];

        // ~100 MSISDNs répartis entre opérateurs
        $numbers = [];
        $prefixes = [
            '01' => ['0690'],
            '02' => ['0690', '0694'],
            '03' => ['0694'],
            '04' => ['0690'],
            '05' => ['0690'],
            '06' => ['0696'],
        ];

        foreach ($operators as $op) {
            $count = match ($op) {
                '01' => 25,
                '02' => 30,
                '03' => 20,
                '06' => 15,
                default => 5,
            };

            for ($i = 0; $i < $count; $i++) {
                $prefix = $prefixes[$op][array_rand($prefixes[$op])];
                $number = $prefix.str_pad((string) mt_rand(100000, 999999), 6, '0', STR_PAD_LEFT);

                // Ensure uniqueness
                while (in_array($number, array_column($numbers, 'msisdn'))) {
                    $number = $prefix.str_pad((string) mt_rand(100000, 999999), 6, '0', STR_PAD_LEFT);
                }

                $numbers[] = [
                    'msisdn' => $number,
                    'tranche_id' => null,
                    'portage_id_actuel' => null,
                    'operateur_id_actuel' => $op,
                ];
            }
        }

        DB::table('porta_msisdn')->insert($numbers);
        $this->msisdnList = array_column($numbers, 'msisdn');
    }

    private function seedDossiers(): void
    {
        $startDate = Carbon::parse('2026-01-18');
        $endDate = Carbon::parse('2026-02-17');
        $operators = ['01', '02', '03', '06'];

        $dossiers = [];
        $portages = [];
        $portageHistorique = [];
        $msisdnHistorique = [];
        $portageIndex = 0;

        // ~60 dossiers sur 30 jours
        for ($day = 0; $day < 30; $day++) {
            $date = $startDate->copy()->addDays($day);

            // Skip weekends
            if ($date->isWeekend()) {
                continue;
            }

            // 2-3 dossiers par jour ouvré
            $dossiersPerDay = mt_rand(2, 3);

            for ($d = 0; $d < $dossiersPerDay; $d++) {
                $origine = $operators[array_rand($operators)];
                $destination = $operators[array_rand($operators)];
                while ($destination === $origine) {
                    $destination = $operators[array_rand($operators)];
                }

                // Determine final state based on date age
                $daysAgo = Carbon::now()->diffInDays($date);
                $etatActuel = $this->determineEtatForAge($daysAgo, $day, $portageIndex);

                $dossierId = count($dossiers) + 1;

                $dossiers[] = [
                    'id_portage_multiple' => null,
                    'etat_id_actuel' => $etatActuel,
                    'operateur_id_origine' => $origine,
                    'operateur_id_destination' => $destination,
                    'created_at' => $date->copy()->setTime(9, mt_rand(0, 30)),
                    'updated_at' => $date->copy()->setTime(9, mt_rand(31, 59)),
                ];

                // Create 1-2 portages per dossier
                $numPortages = mt_rand(1, 2) === 1 ? 1 : 1; // mostly single
                if ($d === 0 && $day % 7 === 0) {
                    $numPortages = 2; // occasional multi-line
                    $dossiers[count($dossiers) - 1]['id_portage_multiple'] = 'MULTI-'.strtoupper(Str::random(6));
                }

                for ($p = 0; $p < $numPortages; $p++) {
                    if ($portageIndex >= count($this->msisdnList)) {
                        break;
                    }

                    $msisdn = $this->msisdnList[$portageIndex];
                    $idPortage = md5($msisdn.$date->format('Ymd').$portageIndex);
                    $datePortage = $date->copy()->addWeekdays(2); // JP = JD+2

                    $portages[] = [
                        'id_portage' => $idPortage,
                        'msisdn' => $msisdn,
                        'dossier_id' => $dossierId,
                        'date_portage' => $datePortage,
                        'etat_id_actuel' => $etatActuel,
                        'created_at' => $date->copy()->setTime(9, mt_rand(0, 59)),
                        'updated_at' => Carbon::now(),
                    ];

                    $this->portageIds[] = $idPortage;

                    // Create historique entries
                    $portageHistorique = array_merge(
                        $portageHistorique,
                        $this->buildHistorique(count($portages), $etatActuel, $date, $datePortage)
                    );

                    // MSISDN historique
                    $msisdnHistorique[] = [
                        'msisdn' => $msisdn,
                        'operateur_id' => $origine,
                        'date_debut' => $date->copy()->subYears(mt_rand(1, 3)),
                        'date_fin' => $etatActuel === 4 || $etatActuel === 10 ? $datePortage : null,
                        'portage_id' => null, // Will link later
                    ];

                    if ($etatActuel === 4 || $etatActuel === 10) {
                        $msisdnHistorique[] = [
                            'msisdn' => $msisdn,
                            'operateur_id' => $destination,
                            'date_debut' => $datePortage,
                            'date_fin' => null,
                            'portage_id' => null,
                        ];
                    }

                    $portageIndex++;
                }
            }
        }

        // ── ANOMALIES VOLONTAIRES ──

        // Anomalie: 4 portages bloqués en "encours" depuis > 5 jours
        for ($i = 0; $i < 4 && $i < count($portages); $i++) {
            $idx = mt_rand(10, min(20, count($portages) - 1));
            $portages[$idx]['etat_id_actuel'] = 2; // encours
            $portages[$idx]['date_portage'] = Carbon::now()->subDays(mt_rand(6, 12));
        }

        // Anomalie: 3 portages en "bascule" sans ticket 1430 (bascule non confirmée)
        for ($i = 0; $i < 3; $i++) {
            $idx = mt_rand(25, min(40, count($portages) - 1));
            if (isset($portages[$idx])) {
                $portages[$idx]['etat_id_actuel'] = 3; // bascule
                $portages[$idx]['date_portage'] = Carbon::now()->subDays(mt_rand(2, 4));
                $this->basculeAnomalyPortageIds[] = $portages[$idx]['id_portage'];
            }
        }

        // Anomalie: 1 portage avec date_portage = jour férié
        if (count($portages) > 45) {
            $portages[45]['date_portage'] = Carbon::parse('2026-02-17'); // Mardi Gras
        }

        // Anomalie: 2 portages incomplets (bascule sans clôture — "mon numéro ne marche pas")
        for ($i = 0; $i < 2; $i++) {
            $idx = mt_rand(50, min(55, count($portages) - 1));
            if (isset($portages[$idx])) {
                $portages[$idx]['etat_id_actuel'] = 3; // stuck in bascule
                $portages[$idx]['date_portage'] = Carbon::now()->subDays(mt_rand(3, 7));
            }
        }

        // Anomalie: 5 tickets en attente > 3 jours
        for ($i = 0; $i < 5; $i++) {
            $idx = mt_rand(30, min(45, count($portages) - 1));
            if (isset($portages[$idx])) {
                $portages[$idx]['etat_id_actuel'] = 1; // saisi (waiting)
                $portages[$idx]['created_at'] = Carbon::now()->subDays(mt_rand(4, 8));
            }
        }

        // Insert dossiers
        foreach (array_chunk($dossiers, 50) as $chunk) {
            DB::table('porta_dossier')->insert($chunk);
        }
        $this->dossierIds = range(1, count($dossiers));

        // Insert portages
        foreach (array_chunk($portages, 50) as $chunk) {
            DB::table('porta_portage')->insert($chunk);
        }

        // Insert portage historique
        if (! empty($portageHistorique)) {
            foreach (array_chunk($portageHistorique, 50) as $chunk) {
                DB::table('porta_portage_historique')->insert($chunk);
            }
        }

        // Insert MSISDN historique
        // Anomalie: 1 numéro avec 2 entrées actives (conflit)
        if (count($msisdnHistorique) > 10) {
            $conflictMsisdn = $msisdnHistorique[5]['msisdn'];
            $msisdnHistorique[] = [
                'msisdn' => $conflictMsisdn,
                'operateur_id' => '03',
                'date_debut' => Carbon::now()->subDays(5),
                'date_fin' => null,
                'portage_id' => null,
            ];
        }

        if (! empty($msisdnHistorique)) {
            foreach (array_chunk($msisdnHistorique, 50) as $chunk) {
                DB::table('porta_msisdn_historique')->insert($chunk);
            }
        }
    }

    private function determineEtatForAge(int $daysAgo, int $dayIndex, int $portageIndex): int
    {
        if ($daysAgo > 15) {
            // Old ones are mostly clôturés
            return mt_rand(1, 10) <= 8 ? 4 : 5; // 80% clôturé, 20% refusé
        }
        if ($daysAgo > 7) {
            return match (mt_rand(1, 10)) {
                1, 2, 3, 4, 5, 6 => 4,  // 60% clôturé
                7, 8 => 3,              // 20% bascule
                9 => 5,                 // 10% refusé
                default => 2,           // 10% encours
            };
        }
        if ($daysAgo > 3) {
            return match (mt_rand(1, 6)) {
                1, 2, 3 => 2,  // en cours
                4, 5 => 3,     // bascule
                default => 4,  // clôturé
            };
        }

        // Recent (last 3 days)
        return match (mt_rand(1, 4)) {
            1, 2 => 1,  // saisi
            3 => 2,     // en cours
            default => 1,
        };
    }

    private function buildHistorique(int $portageId, int $etatFinal, Carbon $dateCreation, Carbon $datePortage): array
    {
        $historique = [];
        $transitions = [1 => 2, 2 => 3, 3 => 4]; // saisi→encours→bascule→clôturé

        $currentEtat = 1;
        $currentDate = $dateCreation->copy();

        while ($currentEtat < $etatFinal && isset($transitions[$currentEtat])) {
            $nextEtat = $transitions[$currentEtat];
            $nextDate = $currentDate->copy()->addHours(mt_rand(2, 48));

            $historique[] = [
                'portage_id' => $portageId,
                'transition_id' => null,
                'etat_id_from' => $currentEtat,
                'date_debut' => $currentDate,
                'date_fin' => $nextDate,
            ];

            $currentEtat = $nextEtat;
            $currentDate = $nextDate;
        }

        // Final state (open-ended)
        $historique[] = [
            'portage_id' => $portageId,
            'transition_id' => null,
            'etat_id_from' => $etatFinal,
            'date_debut' => $currentDate,
            'date_fin' => null,
        ];

        return $historique;
    }

    private function seedFichiers(): void
    {
        $operators = ['01', '02', '03', '06'];
        $startDate = Carbon::parse('2026-01-18');
        $fichiers = [];
        $dataRows = [];
        $ackRows = [];
        $missingAckFichierIndices = [];

        for ($day = 0; $day < 30; $day++) {
            $date = $startDate->copy()->addDays($day);

            if ($date->isWeekend()) {
                continue;
            }

            // 3 vacations per day (V10, V14, V19)
            $vacations = [10, 14, 19];

            foreach ($vacations as $vacation) {
                foreach ($operators as $exp) {
                    foreach ($operators as $dest) {
                        if ($exp === $dest) {
                            continue;
                        }

                        // Not all pairs exchange every vacation
                        if (mt_rand(1, 3) > 2) {
                            continue;
                        }

                        $sequence = count($fichiers) + 1;
                        $filename = sprintf(
                            'PNMDATA_%s_%s_%s_V%02d_%04d.txt',
                            $exp,
                            $dest,
                            $date->format('Ymd'),
                            $vacation,
                            $sequence % 10000
                        );

                        $fichiers[] = [
                            'filename' => $filename,
                            'expediteur' => $exp,
                            'destinataire' => $dest,
                            'direction' => 'entrant',
                            'type' => 'data',
                            'date' => $date,
                            'sequence' => $sequence,
                            'created_at' => $date->copy()->setTime($vacation, mt_rand(0, 15)),
                        ];
                    }
                }
            }
        }

        // Insert fichiers
        foreach (array_chunk($fichiers, 50) as $chunk) {
            DB::table('porta_fichier')->insert($chunk);
        }

        $totalFichiers = count($fichiers);

        // ── Generate DATA rows (tickets) ──
        $ticketCodes = ['1110', '1210', '1220', '1410', '1430'];
        $msisdns = $this->msisdnList;

        for ($i = 0; $i < $totalFichiers && $i < 200; $i++) {
            $fichierId = $i + 1;
            $ticketsInFile = mt_rand(1, 5);

            for ($t = 0; $t < $ticketsInFile; $t++) {
                $code = $ticketCodes[array_rand($ticketCodes)];
                $msisdn = $msisdns[array_rand($msisdns)];
                $idPortage = ! empty($this->portageIds)
                    ? $this->portageIds[array_rand($this->portageIds)]
                    : md5($msisdn.mt_rand());

                $codeMotif = null;
                if ($code === '1220') {
                    // Refus: ajouter un code motif
                    $motifs = ['R100', 'R110', 'R200', 'R210', 'R220', 'R300'];
                    $codeMotif = $motifs[array_rand($motifs)];
                }

                $dataRows[] = [
                    'fichier_id' => $fichierId,
                    'code_ticket' => $code,
                    'msisdn' => $msisdn,
                    'rio' => $this->generateRio($msisdn),
                    'id_portage' => $idPortage,
                    'code_motif' => $codeMotif,
                    'created_at' => $fichiers[$i]['created_at'],
                ];
            }
        }

        // Anomalie: 8 tickets avec code_motif R100/R110 (RIO incorrect)
        for ($i = 0; $i < 8; $i++) {
            $msisdn = $msisdns[array_rand($msisdns)];
            $dataRows[] = [
                'fichier_id' => mt_rand(1, min($totalFichiers, 200)),
                'code_ticket' => '1220',
                'msisdn' => $msisdn,
                'rio' => 'XX0000000000', // Invalid RIO
                'id_portage' => md5($msisdn.'refus'.$i),
                'code_motif' => $i < 5 ? 'R100' : 'R110',
                'created_at' => Carbon::now()->subDays(mt_rand(1, 15)),
            ];
        }

        // Anomalie: 3 tickets avec code 7000 (erreur technique)
        for ($i = 0; $i < 3; $i++) {
            $msisdn = $msisdns[array_rand($msisdns)];
            $dataRows[] = [
                'fichier_id' => mt_rand(1, min($totalFichiers, 200)),
                'code_ticket' => '7000',
                'msisdn' => $msisdn,
                'rio' => null,
                'id_portage' => md5($msisdn.'err7000'.$i),
                'code_motif' => null,
                'created_at' => Carbon::now()->subDays(mt_rand(1, 10)),
            ];
        }

        // Insert data rows
        foreach (array_chunk($dataRows, 50) as $chunk) {
            DB::table('porta_data')->insert($chunk);
        }

        // Clean up: remove any accidental 1430 tickets for bascule anomaly portages
        if (! empty($this->basculeAnomalyPortageIds)) {
            DB::table('porta_data')
                ->where('code_ticket', '1430')
                ->whereIn('id_portage', $this->basculeAnomalyPortageIds)
                ->delete();
        }

        // ── Generate ACK rows ──
        // Most files get an ACK, but we intentionally skip 5 (anomalie: ACR manquant)
        $missingAckIndices = [];
        while (count($missingAckIndices) < 5) {
            $idx = mt_rand(max(1, $totalFichiers - 30), $totalFichiers);
            $missingAckIndices[$idx] = true;
        }

        for ($i = 1; $i <= min($totalFichiers, 200); $i++) {
            if (isset($missingAckIndices[$i])) {
                continue; // Anomalie: pas d'ACK pour ce fichier
            }

            $ackRows[] = [
                'fichier_id' => $i,
                'code_erreur' => mt_rand(1, 20) === 1 ? 'E610' : null, // 5% erreurs
                'commentaire' => null,
                'created_at' => Carbon::parse($fichiers[$i - 1]['created_at'])->addMinutes(mt_rand(5, 45)),
            ];
        }

        if (! empty($ackRows)) {
            foreach (array_chunk($ackRows, 50) as $chunk) {
                DB::table('porta_ack')->insert($chunk);
            }
        }
    }

    private function seedSync(): void
    {
        $operators = ['01', '02', '03', '06'];
        $msisdns = $this->msisdnList;
        $syncRows = [];
        $syncStatusRows = [];

        // 4 dimanches de SYNC sur 30 jours
        $sundays = [
            Carbon::parse('2026-01-18'),
            Carbon::parse('2026-01-25'),
            Carbon::parse('2026-02-01'),
            Carbon::parse('2026-02-08'),
        ];

        $syncFichierId = DB::table('porta_fichier')->max('id') ?? 0;

        foreach ($sundays as $sunday) {
            foreach ($operators as $exp) {
                foreach ($operators as $dest) {
                    if ($exp === $dest) {
                        continue;
                    }

                    $syncFichierId++;
                    $filename = sprintf(
                        'PNMSYNC_%s_%s_%s.txt',
                        $exp,
                        $dest,
                        $sunday->format('Ymd')
                    );

                    DB::table('porta_fichier')->insert([
                        'filename' => $filename,
                        'expediteur' => $exp,
                        'destinataire' => $dest,
                        'direction' => 'entrant',
                        'type' => 'sync',
                        'date' => $sunday,
                        'sequence' => 1,
                        'created_at' => $sunday->copy()->setTime(2, 0),
                    ]);

                    // 5-10 MSISDNs per sync file
                    $syncCount = mt_rand(5, 10);
                    for ($s = 0; $s < $syncCount; $s++) {
                        $msisdn = $msisdns[array_rand($msisdns)];

                        $syncRows[] = [
                            'fichier_id' => $syncFichierId,
                            'operateur_receveur' => $dest,
                            'msisdn' => $msisdn,
                            'date_portage' => $sunday->copy()->subDays(mt_rand(1, 60)),
                        ];
                    }
                }
            }
        }

        if (! empty($syncRows)) {
            foreach (array_chunk($syncRows, 50) as $chunk) {
                DB::table('porta_sync')->insert($chunk);
            }
        }

        // Generate SYNC_STATUS — including 3 open conflicts (anomalie)
        $totalSync = DB::table('porta_sync')->count();
        $conflictCount = 0;

        for ($i = 1; $i <= $totalSync; $i++) {
            $isConflict = false;

            // Anomalie: 3 conflits ouverts non résolus
            if ($conflictCount < 3 && mt_rand(1, max(1, $totalSync / 3)) === 1) {
                $isConflict = true;
                $conflictCount++;
            }

            if ($isConflict || mt_rand(1, 5) === 1) { // ~20% get a status entry
                $syncStatusRows[] = [
                    'sync_id' => $i,
                    'is_conflict' => $isConflict,
                    'commentaire' => $isConflict
                        ? 'Conflit détecté : MSISDN présent chez deux opérateurs'
                        : 'Synchronisation OK',
                    'created_at' => Carbon::now()->subDays(mt_rand(0, 30)),
                ];
            }
        }

        if (! empty($syncStatusRows)) {
            foreach (array_chunk($syncStatusRows, 50) as $chunk) {
                DB::table('porta_sync_status')->insert($chunk);
            }
        }
    }

    private function generateRio(string $msisdn): string
    {
        // Format RIO: OO-Q-RRRRRR-CCC (12 chars)
        $opCode = substr($msisdn, 3, 2) === '69' ? '02' : '01';
        $qualifier = 'M';
        $random = str_pad((string) mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $check = str_pad((string) mt_rand(0, 999), 3, '0', STR_PAD_LEFT);

        return $opCode.$qualifier.$random.$check;
    }
}
