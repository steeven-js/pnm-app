<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PortaSeeder extends Seeder
{
    /**
     * 30 jours d'activité PNM simulée avec anomalies volontaires.
     */
    public function run(): void
    {
        $this->seedSyncStatus();
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

    private function seedSyncStatus(): void
    {
        DB::table('porta_sync_status')->insert([
            ['id' => 1, 'statut_name' => 'LOCKED', 'statut_code' => 'LCK', 'is_active' => true, 'commentaire' => 'Verrouillé — conflit détecté'],
            ['id' => 2, 'statut_name' => 'UPDATED', 'statut_code' => 'UPD', 'is_active' => true, 'commentaire' => 'Mis à jour avec succès'],
            ['id' => 3, 'statut_name' => 'ERROR', 'statut_code' => 'ERR', 'is_active' => true, 'commentaire' => 'Erreur de synchronisation'],
        ]);
    }

    private function seedOperateurs(): void
    {
        DB::table('porta_operateur')->insert([
            ['code' => 0,  'is_active' => true, 'is_actor' => false, 'nom' => 'Tous les Operateurs', 'contact' => null, 'email' => null, 'fax' => null, 'directory' => null, 'comment' => null],
            ['code' => 1,  'is_active' => true, 'is_actor' => true,  'nom' => 'Orange Caraibe',      'contact' => 'Jean DUPONT',      'email' => 'pnm@orangecaraibe.com',  'fax' => null, 'directory' => '01', 'comment' => null],
            ['code' => 2,  'is_active' => true, 'is_actor' => true,  'nom' => 'Digicel AFG',          'contact' => 'Marie JOSEPH',     'email' => 'FWI_PNM_SI@digicelgroup.fr', 'fax' => null, 'directory' => '02', 'comment' => null],
            ['code' => 3,  'is_active' => true, 'is_actor' => true,  'nom' => 'Outremer Telecom',     'contact' => 'Paul LARIVIERE',   'email' => 'pnm@sfrcaraibe.fr',      'fax' => null, 'directory' => '03', 'comment' => null],
            ['code' => 4,  'is_active' => true, 'is_actor' => true,  'nom' => 'Dauphin Telecom',      'contact' => 'Anne BELMONT',     'email' => 'pnm@dauphin.gp',         'fax' => null, 'directory' => '04', 'comment' => null],
            ['code' => 5,  'is_active' => true, 'is_actor' => true,  'nom' => 'UTS Caraibe',          'contact' => 'Pierre ELISE',     'email' => 'pnm@uts.sx',             'fax' => null, 'directory' => '05', 'comment' => null],
            ['code' => 6,  'is_active' => true, 'is_actor' => true,  'nom' => 'Free Caraibes',        'contact' => 'Luc MONTROSE',     'email' => 'pnm@free.gp',            'fax' => null, 'directory' => '06', 'comment' => null],
            ['code' => 10, 'is_active' => true, 'is_actor' => false, 'nom' => 'sans objet',           'contact' => null, 'email' => null, 'fax' => null, 'directory' => null, 'comment' => 'cas de restitution'],
        ]);
    }

    private function seedCodeTickets(): void
    {
        DB::table('porta_code_ticket')->insert([
            ['code' => 100, 'description' => 'Envoi de portage de donnees'],
            ['code' => 110, 'description' => 'Portage — actualisation de la demande'],
            ['code' => 200, 'description' => 'Accord du portage des donnees'],
            ['code' => 300, 'description' => 'Ecrire des donnees de portage'],
            ['code' => 310, 'description' => 'Ecrire les donnees de portage (V2)'],
            ['code' => 400, 'description' => 'Annulation GPS (en cours d\'annulation)'],
            ['code' => 500, 'description' => 'Refus du portage'],
            ['code' => 600, 'description' => 'Confirmation portage'],
            ['code' => 700, 'description' => 'Activation portage termine'],
            ['code' => 710, 'description' => 'Envoi des donnees de notification a tous les opr'],
            ['code' => 720, 'description' => 'Confirmation de la notification'],
            ['code' => 730, 'description' => 'Restitution'],
            ['code' => 800, 'description' => 'Restitution des donnees'],
            ['code' => 810, 'description' => 'Repondu des echanges'],
        ]);
    }

    private function seedCodeReponses(): void
    {
        DB::table('porta_code_reponse')->insert([
            ['code' => 0,  'procedure' => 'annulation',  'description' => 'Annulation de demande'],
            ['code' => 1,  'procedure' => 'production',  'description' => 'Activation du numero'],
            ['code' => 2,  'procedure' => 'production',  'description' => 'Re-direction en code'],
            ['code' => 3,  'procedure' => 'production',  'description' => 'Refus de portage'],
            ['code' => 10, 'procedure' => 'eligibilite', 'description' => 'Delai trop court — la demande depasse'],
            ['code' => 11, 'procedure' => 'eligibilite', 'description' => 'Erreur de depassement (delai passe)'],
            ['code' => 20, 'procedure' => 'erreur',      'description' => 'Erreur format'],
            ['code' => 30, 'procedure' => 'facturation', 'description' => 'Erreur facturation'],
            ['code' => 40, 'procedure' => 'eligibilite', 'description' => 'Le numero n\'est pas sur le type guichet'],
        ]);
    }

    private function seedEtats(): void
    {
        DB::table('porta_etat')->insert([
            ['id' => 1, 'etat_name' => 'initial',  'etat_code' => 'INI'],
            ['id' => 2, 'etat_name' => 'enCours',  'etat_code' => 'ENC'],
            ['id' => 3, 'etat_name' => 'diffuse',  'etat_code' => 'DIF'],
            ['id' => 4, 'etat_name' => 'accepte',  'etat_code' => 'ACC'],
            ['id' => 5, 'etat_name' => 'refuse',   'etat_code' => 'REF'],
            ['id' => 6, 'etat_name' => 'annule',   'etat_code' => 'ANN'],
            ['id' => 7, 'etat_name' => 'termine',  'etat_code' => 'TER'],
            ['id' => 8, 'etat_name' => 'Defaut',   'etat_code' => 'DEF'],
            ['id' => 9, 'etat_name' => 'EnPanne',  'etat_code' => 'PAN'],
        ]);
    }

    private function seedTransitions(): void
    {
        DB::table('porta_transition')->insert([
            ['code' => 100,  'etat_initial' => 'initial',  'etat_final' => 'enCours',  'description' => 'Demande de portage envoyee'],
            ['code' => 200,  'etat_initial' => 'enCours',  'etat_final' => 'diffuse',  'description' => 'Reponse positive OPD — portage diffuse'],
            ['code' => 300,  'etat_initial' => 'diffuse',  'etat_final' => 'accepte',  'description' => 'Bascule technique effectuee'],
            ['code' => 500,  'etat_initial' => 'enCours',  'etat_final' => 'refuse',   'description' => 'Refus OPD'],
            ['code' => 600,  'etat_initial' => 'accepte',  'etat_final' => 'termine',  'description' => 'Confirmation de bascule — portage termine'],
            ['code' => 400,  'etat_initial' => 'enCours',  'etat_final' => 'annule',   'description' => 'Annulation OPR avant bascule'],
            ['code' => 700,  'etat_initial' => 'diffuse',  'etat_final' => 'annule',   'description' => 'Annulation apres diffusion'],
            ['code' => 730,  'etat_initial' => 'termine',  'etat_final' => 'initial',  'description' => 'Restitution du numero'],
            ['code' => 800,  'etat_initial' => 'initial',  'etat_final' => 'refuse',   'description' => 'Refus immediat'],
        ]);
    }

    private function seedTranches(): void
    {
        DB::table('porta_tranche')->insert([
            ['is_active' => true, 'operateur_id' => 1, 'debut' => '0690000000', 'fin' => '0690499999'],
            ['is_active' => true, 'operateur_id' => 1, 'debut' => '0590000000', 'fin' => '0590499999'],
            ['is_active' => true, 'operateur_id' => 2, 'debut' => '0690500000', 'fin' => '0690999999'],
            ['is_active' => true, 'operateur_id' => 2, 'debut' => '0694000000', 'fin' => '0694499999'],
            ['is_active' => true, 'operateur_id' => 3, 'debut' => '0694500000', 'fin' => '0694999999'],
            ['is_active' => true, 'operateur_id' => 4, 'debut' => '0690200000', 'fin' => '0690209999'],
            ['is_active' => true, 'operateur_id' => 5, 'debut' => '0690300000', 'fin' => '0690309999'],
            ['is_active' => true, 'operateur_id' => 6, 'debut' => '0696000000', 'fin' => '0696499999'],
        ]);
    }

    private function seedFerrydays(): void
    {
        $holidays = [
            '2026-01-01', '2026-02-17', '2026-02-18', '2026-03-12',
            '2026-04-03', '2026-04-06', '2026-05-01', '2026-05-08',
            '2026-05-14', '2026-05-22', '2026-05-25', '2026-05-27',
            '2026-05-28', '2026-06-10', '2026-07-14', '2026-08-15',
            '2026-10-09', '2026-11-01', '2026-11-02', '2026-11-11',
            '2026-12-25',
        ];

        foreach ($holidays as $date) {
            DB::table('porta_ferryday')->insert([
                'ferryday' => $date,
                'creation' => Carbon::now(),
                'is_active' => true,
            ]);
        }
    }

    // ──────────────────────────────────────────────
    // Données opérationnelles (30 jours)
    // ──────────────────────────────────────────────

    private array $msisdnList = [];

    private array $portageDbIds = [];

    private array $dossierIds = [];

    private array $accepteAnomalyPortageDbIds = [];

    private function seedMsisdns(): void
    {
        $operators = [1, 2, 3, 4, 5, 6];
        $prefixes = [
            1 => ['0690'], 2 => ['0690', '0694'], 3 => ['0694'],
            4 => ['0690'], 5 => ['0690'], 6 => ['0696'],
        ];

        $numbers = [];
        foreach ($operators as $op) {
            $count = match ($op) { 1 => 25, 2 => 30, 3 => 20, 6 => 15, default => 5 };

            for ($i = 0; $i < $count; $i++) {
                $prefix = $prefixes[$op][array_rand($prefixes[$op])];
                $number = $prefix . str_pad((string) mt_rand(100000, 999999), 6, '0', STR_PAD_LEFT);
                while (in_array($number, array_column($numbers, 'msisdn'))) {
                    $number = $prefix . str_pad((string) mt_rand(100000, 999999), 6, '0', STR_PAD_LEFT);
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
        $operators = [1, 2, 3, 6];
        $noms = ['DUPONT', 'JOSEPH', 'LARIVIERE', 'BELMONT', 'ELISE', 'MONTROSE', 'MARIE', 'PIERRE'];
        $prenoms = ['Jean', 'Marie', 'Paul', 'Anne', 'Luc', 'Claire', 'Marc', 'Sophie'];

        $dossiers = [];
        $portages = [];
        $portageHistorique = [];
        $portageIndex = 0;

        for ($day = 0; $day < 30; $day++) {
            $date = $startDate->copy()->addDays($day);
            if ($date->isWeekend()) {
                continue;
            }

            $dossiersPerDay = mt_rand(2, 3);

            for ($d = 0; $d < $dossiersPerDay; $d++) {
                $origine = $operators[array_rand($operators)];
                $destination = $operators[array_rand($operators)];
                while ($destination === $origine) {
                    $destination = $operators[array_rand($operators)];
                }

                $daysAgo = Carbon::now()->diffInDays($date);
                $etatActuel = $this->determineEtatForAge($daysAgo);

                if ($portageIndex >= count($this->msisdnList)) {
                    break;
                }

                $msisdn = $this->msisdnList[$portageIndex];
                $nom = $noms[array_rand($noms)];
                $prenom = $prenoms[array_rand($prenoms)];
                $rio = $this->generateRio($msisdn);
                $datePortage = $date->copy()->addWeekdays(2);

                $dossiers[] = [
                    'portage_msisdn' => $msisdn,
                    'portage_rio' => $rio,
                    'portage_nom' => $nom,
                    'portage_prenom' => $prenom,
                    'portage_type_demande' => 'simple',
                    'portage_date_souhaitee' => $datePortage,
                    'portage_etat' => $etatActuel,
                    'portage_date_creation' => $date->copy()->setTime(9, mt_rand(0, 30)),
                    'opr_e_actuel' => $origine,
                    'opr_e_d_attribution' => $destination,
                    'operateur_id_donneur' => $origine,
                    'operateur_id_receveur' => $destination,
                    'remarque' => null,
                ];

                $dossierId = count($dossiers);

                $portages[] = [
                    'portage_msisdn' => $msisdn,
                    'portage_rio' => $rio,
                    'portage_nom' => $nom,
                    'portage_prenom' => $prenom,
                    'portage_type_demande' => 'simple',
                    'portage_date_souhaitee' => $datePortage,
                    'portage_etat' => $etatActuel,
                    'portage_date_creation' => $date->copy()->setTime(9, mt_rand(0, 59)),
                    'opr_e_actuel' => $origine,
                    'opr_e_d_attribution' => $destination,
                    'dossier_id' => $dossierId,
                ];

                $portageHistorique = array_merge(
                    $portageHistorique,
                    $this->buildHistorique(count($portages), $etatActuel, $date, $datePortage)
                );

                $portageIndex++;
            }
        }

        // ── ANOMALIES VOLONTAIRES ──

        // 4 portages bloqués en "enCours" depuis > 5 jours
        for ($i = 0; $i < 4 && $i < count($portages); $i++) {
            $idx = mt_rand(10, min(20, count($portages) - 1));
            $portages[$idx]['portage_etat'] = 2; // enCours
            $portages[$idx]['portage_date_souhaitee'] = Carbon::now()->subDays(mt_rand(6, 12));
        }

        // 3 portages en "accepte" sans ticket 600 (confirmation manquante)
        for ($i = 0; $i < 3; $i++) {
            $idx = mt_rand(25, min(40, count($portages) - 1));
            if (isset($portages[$idx])) {
                $portages[$idx]['portage_etat'] = 4; // accepte
                $portages[$idx]['portage_date_souhaitee'] = Carbon::now()->subDays(mt_rand(2, 4));
                $this->accepteAnomalyPortageDbIds[] = $idx + 1; // 1-based DB id
            }
        }

        // 1 portage avec date_portage = jour férié
        if (count($portages) > 45) {
            $portages[45]['portage_date_souhaitee'] = Carbon::parse('2026-02-17');
        }

        // 5 tickets en attente > 3 jours
        for ($i = 0; $i < 5; $i++) {
            $idx = mt_rand(30, min(45, count($portages) - 1));
            if (isset($portages[$idx])) {
                $portages[$idx]['portage_etat'] = 1; // initial
                $portages[$idx]['portage_date_creation'] = Carbon::now()->subDays(mt_rand(4, 8));
            }
        }

        // Insert
        foreach (array_chunk($dossiers, 50) as $chunk) {
            DB::table('porta_dossier')->insert($chunk);
        }
        $this->dossierIds = range(1, count($dossiers));

        foreach (array_chunk($portages, 50) as $chunk) {
            DB::table('porta_portage')->insert($chunk);
        }
        $this->portageDbIds = range(1, count($portages));

        if (! empty($portageHistorique)) {
            foreach (array_chunk($portageHistorique, 50) as $chunk) {
                DB::table('porta_portage_historique')->insert($chunk);
            }
        }

        // MSISDN historique (simple: msisdn + date)
        $msisdnHist = [];
        foreach ($portages as $p) {
            $msisdnHist[] = [
                'msisdn' => $p['portage_msisdn'],
                'date' => $p['portage_date_creation'],
            ];
        }
        if (! empty($msisdnHist)) {
            foreach (array_chunk($msisdnHist, 50) as $chunk) {
                DB::table('porta_msisdn_historique')->insert($chunk);
            }
        }
    }

    private function determineEtatForAge(int $daysAgo): int
    {
        if ($daysAgo > 15) {
            return mt_rand(1, 10) <= 8 ? 7 : 5; // 80% termine, 20% refuse
        }
        if ($daysAgo > 7) {
            return match (mt_rand(1, 10)) {
                1, 2, 3, 4, 5, 6 => 7,  // 60% termine
                7, 8 => 4,              // 20% accepte
                9 => 5,                 // 10% refuse
                default => 2,           // 10% enCours
            };
        }
        if ($daysAgo > 3) {
            return match (mt_rand(1, 6)) {
                1, 2, 3 => 2,  // enCours
                4, 5 => 4,     // accepte
                default => 7,  // termine
            };
        }

        return match (mt_rand(1, 4)) {
            1, 2 => 1,     // initial
            3 => 2,        // enCours
            default => 1,
        };
    }

    private function buildHistorique(int $portageId, int $etatFinal, Carbon $dateCreation, Carbon $datePortage): array
    {
        $historique = [];
        $etatNames = [1 => 'initial', 2 => 'enCours', 3 => 'diffuse', 4 => 'accepte', 7 => 'termine'];
        $flow = [1, 2, 3, 4, 7]; // initial → enCours → diffuse → accepte → termine

        $currentDate = $dateCreation->copy();
        $targetIndex = array_search($etatFinal, $flow);
        if ($targetIndex === false) {
            $targetIndex = 0;
        }

        for ($i = 0; $i <= $targetIndex; $i++) {
            $etatId = $flow[$i];
            $nextDate = $currentDate->copy()->addHours(mt_rand(2, 48));

            $historique[] = [
                'id_portage' => $portageId,
                'etat' => $etatNames[$etatId] ?? 'initial',
                'date' => $currentDate,
                'commentaire' => null,
            ];

            $currentDate = $nextDate;
        }

        return $historique;
    }

    private function seedFichiers(): void
    {
        $operators = [1, 2, 3, 6];
        $startDate = Carbon::parse('2026-01-18');
        $fichiers = [];
        $portageDataRows = [];
        $ackRows = [];

        for ($day = 0; $day < 30; $day++) {
            $date = $startDate->copy()->addDays($day);
            if ($date->isWeekend()) {
                continue;
            }

            $vacations = [10, 14, 19];
            foreach ($vacations as $vacation) {
                foreach ($operators as $exp) {
                    foreach ($operators as $dest) {
                        if ($exp === $dest || mt_rand(1, 3) > 2) {
                            continue;
                        }

                        $sequence = count($fichiers) + 1;
                        $filename = sprintf(
                            'PNMDATA_%d_%d_%s_V%02d_%04d.txt',
                            $exp, $dest, $date->format('Ymd'), $vacation, $sequence % 10000
                        );

                        $fichiers[] = [
                            'nom' => $filename,
                            'type' => 'data',
                            'date_creation' => $date->copy()->setTime($vacation, mt_rand(0, 15)),
                            'date_import' => $date->copy()->setTime($vacation, mt_rand(16, 30)),
                            'taille' => mt_rand(1024, 65536),
                            'checksum' => md5($filename),
                            'repertoire' => sprintf('/data/pnm/%02d/', $exp),
                            'expediteur' => $exp,
                            'destinataire' => $dest,
                        ];
                    }
                }
            }
        }

        foreach (array_chunk($fichiers, 50) as $chunk) {
            DB::table('porta_fichier')->insert($chunk);
        }

        $totalFichiers = count($fichiers);

        // ── Generate PORTAGE_DATA rows (ticket échanges) ──
        $ticketCodes = [100, 200, 500, 300, 600];
        $portageIds = $this->portageDbIds;

        for ($i = 0; $i < min($totalFichiers, 200); $i++) {
            $ticketsInFile = mt_rand(1, 5);
            for ($t = 0; $t < $ticketsInFile; $t++) {
                $code = $ticketCodes[array_rand($ticketCodes)];
                $portageId = ! empty($portageIds)
                    ? $portageIds[array_rand($portageIds)]
                    : 1;

                $codeReponse = null;
                if ($code === 500) {
                    $motifs = [3, 10, 20, 30, 40];
                    $codeReponse = $motifs[array_rand($motifs)];
                }

                $portageDataRows[] = [
                    'id_portage' => $portageId,
                    'code_ticket' => $code,
                    'code_reponse' => $codeReponse,
                    'date' => $fichiers[$i]['date_creation'],
                    'date_traitement' => Carbon::parse($fichiers[$i]['date_creation'])->addMinutes(mt_rand(5, 120)),
                    'commentaire' => null,
                    'etat' => match ($code) { 600 => 'termine', 500 => 'refuse', default => 'enCours' },
                    'operateur_emetteur' => $fichiers[$i]['expediteur'],
                    'operateur_recepteur' => $fichiers[$i]['destinataire'],
                    'transition_id' => null,
                    'remarque' => null,
                ];
            }
        }

        // Anomalie: 8 tickets de refus avec motifs 10/20 (RIO/format)
        for ($i = 0; $i < 8; $i++) {
            $portageId = ! empty($portageIds)
                ? $portageIds[array_rand($portageIds)]
                : 1;

            $portageDataRows[] = [
                'id_portage' => $portageId,
                'code_ticket' => 500,
                'code_reponse' => $i < 5 ? 10 : 20,
                'date' => Carbon::now()->subDays(mt_rand(1, 15)),
                'date_traitement' => Carbon::now()->subDays(mt_rand(1, 15))->addMinutes(mt_rand(5, 60)),
                'commentaire' => null,
                'etat' => 'refuse',
                'operateur_emetteur' => $operators[array_rand($operators)],
                'operateur_recepteur' => $operators[array_rand($operators)],
                'transition_id' => null,
                'remarque' => null,
            ];
        }

        // Anomalie: 3 tickets erreur (code_reponse = 20, erreur format)
        for ($i = 0; $i < 3; $i++) {
            $portageId = ! empty($portageIds)
                ? $portageIds[array_rand($portageIds)]
                : 1;

            $portageDataRows[] = [
                'id_portage' => $portageId,
                'code_ticket' => 100,
                'code_reponse' => 20,
                'date' => Carbon::now()->subDays(mt_rand(1, 10)),
                'date_traitement' => null,
                'commentaire' => 'Erreur technique lors du traitement',
                'etat' => 'Defaut',
                'operateur_emetteur' => $operators[array_rand($operators)],
                'operateur_recepteur' => $operators[array_rand($operators)],
                'transition_id' => null,
                'remarque' => 'Erreur format detectee',
            ];
        }

        // Remove code_ticket 600 for accepte anomaly portages
        $portageDataRows = array_filter($portageDataRows, function ($row) {
            return ! ($row['code_ticket'] === 600 && in_array($row['id_portage'], $this->accepteAnomalyPortageDbIds));
        });
        $portageDataRows = array_values($portageDataRows);

        foreach (array_chunk($portageDataRows, 50) as $chunk) {
            DB::table('porta_portage_data')->insert($chunk);
        }

        // ── Generate DATA rows (résumé portage) ──
        $dataRows = [];
        $portages = DB::table('porta_portage')->get();
        foreach ($portages as $p) {
            $dataRows[] = [
                'msisdn' => $p->portage_msisdn,
                'rio' => $p->portage_rio,
                'nom' => $p->portage_nom,
                'prenom' => $p->portage_prenom,
                'date_demande' => $p->portage_date_creation,
                'date_demande_portage' => $p->portage_date_souhaitee,
                'date_bascule_portage' => $p->portage_etat === 7 ? $p->portage_date_souhaitee : null,
                'date_verification' => null,
                'id_portage_fini' => $p->portage_etat === 7 ? $p->id : null,
            ];
        }
        if (! empty($dataRows)) {
            foreach (array_chunk($dataRows, 50) as $chunk) {
                DB::table('porta_data')->insert($chunk);
            }
        }

        // ── Generate ACK rows ──
        $missingAckIndices = [];
        while (count($missingAckIndices) < 5) {
            $idx = mt_rand(max(1, $totalFichiers - 30), $totalFichiers);
            $missingAckIndices[$idx] = true;
        }

        for ($i = 0; $i < min($totalFichiers, 200); $i++) {
            if (isset($missingAckIndices[$i + 1])) {
                continue;
            }

            $ackRows[] = [
                'date' => Carbon::parse($fichiers[$i]['date_creation'])->addMinutes(mt_rand(5, 45)),
                'type' => mt_rand(1, 20) === 1 ? 'AR-envoi' : 'AR-recep',
                'file_name' => $fichiers[$i]['nom'],
                'content' => null,
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
        $operators = [1, 2, 3, 6];
        $msisdns = $this->msisdnList;
        $syncRows = [];

        $sundays = [
            Carbon::parse('2026-01-18'),
            Carbon::parse('2026-01-25'),
            Carbon::parse('2026-02-01'),
            Carbon::parse('2026-02-08'),
        ];

        // Insert SYNC fichiers
        foreach ($sundays as $sunday) {
            foreach ($operators as $exp) {
                foreach ($operators as $dest) {
                    if ($exp === $dest) {
                        continue;
                    }

                    $filename = sprintf('PNMSYNC_%d_%d_%s.txt', $exp, $dest, $sunday->format('Ymd'));

                    DB::table('porta_fichier')->insert([
                        'nom' => $filename,
                        'type' => 'sync',
                        'date_creation' => $sunday->copy()->setTime(2, 0),
                        'date_import' => $sunday->copy()->setTime(2, 15),
                        'taille' => mt_rand(512, 4096),
                        'checksum' => md5($filename),
                        'repertoire' => sprintf('/data/pnm/%02d/', $exp),
                        'expediteur' => $exp,
                        'destinataire' => $dest,
                    ]);

                    $syncCount = mt_rand(5, 10);
                    for ($s = 0; $s < $syncCount; $s++) {
                        $msisdn = $msisdns[array_rand($msisdns)];

                        // 5% LOCKED, 90% UPDATED, 5% ERROR
                        $status = match (mt_rand(1, 20)) {
                            1 => 1,  // LOCKED
                            20 => 3, // ERROR
                            default => 2, // UPDATED
                        };

                        $syncRows[] = [
                            'msisdn' => $msisdn,
                            'date' => $sunday->copy()->setTime(2, mt_rand(0, 59)),
                            'operateur_id' => $dest,
                            'sync_status' => $status,
                            'date_portage' => $sunday->copy()->subDays(mt_rand(1, 60)),
                        ];
                    }
                }
            }
        }

        // Force 3 LOCKED conflicts
        $lockCount = 0;
        for ($i = 0; $i < count($syncRows) && $lockCount < 3; $i++) {
            if ($syncRows[$i]['sync_status'] !== 1) {
                $syncRows[$i]['sync_status'] = 1;
                $lockCount++;
            }
        }

        if (! empty($syncRows)) {
            foreach (array_chunk($syncRows, 50) as $chunk) {
                DB::table('porta_sync')->insert($chunk);
            }
        }
    }

    private function generateRio(string $msisdn): string
    {
        $opCode = substr($msisdn, 3, 2) === '69' ? '02' : '01';
        $qualifier = 'M';
        $random = str_pad((string) mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $check = str_pad((string) mt_rand(0, 999), 3, '0', STR_PAD_LEFT);

        return $opCode . $qualifier . $random . $check;
    }
}
