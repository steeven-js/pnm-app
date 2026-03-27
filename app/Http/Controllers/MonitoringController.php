<?php

namespace App\Http\Controllers;

use App\Models\MonitoringEvent;
use App\Services\HolidayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class MonitoringController extends Controller
{
    public function __construct(
        private readonly HolidayService $holidayService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'sometimes|date_format:Y-m-d',
        ]);

        $date = $request->has('date')
            ? Carbon::parse($request->input('date'))
            : Carbon::now('America/Martinique')->startOfDay();

        $events = MonitoringEvent::where('user_id', $request->user()->id)
            ->forDate($date)
            ->get();

        return response()->json([
            'events' => $events,
            'is_holiday' => $this->holidayService->isHolidayAnywhere($date),
            'holiday_details' => $this->holidayService->getHolidaysForDate($date),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_type' => 'required|string|max:50',
            'event_date' => 'required|date_format:Y-m-d',
            'status' => 'required|string|in:pending,verified,issue,skipped',
            'notes' => 'nullable|string|max:2000',
            'checked_items' => 'nullable|array',
            'checked_items.*' => 'string|max:255',
            'metadata' => 'nullable|array',
        ]);

        $data = [
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
            'checked_items' => $validated['checked_items'] ?? null,
            'verified_at' => $validated['status'] === 'verified' ? now() : null,
        ];

        // Auto-add metadata column if missing (migration may not have run)
        if (isset($validated['metadata'])) {
            if (!Schema::hasColumn('monitoring_events', 'metadata')) {
                Schema::table('monitoring_events', function ($table) {
                    $table->json('metadata')->nullable()->after('checked_items');
                });
            }
            $data['metadata'] = $validated['metadata'];
        }

        $event = MonitoringEvent::updateOrCreate(
            [
                'event_type' => $validated['event_type'],
                'event_date' => $validated['event_date'],
                'user_id' => $request->user()->id,
            ],
            $data,
        );

        return response()->json($event);
    }

    /**
     * Get previous day's porta_prevues metadata for PSO comparison.
     */
    public function previsions(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'sometimes|date_format:Y-m-d',
        ]);

        $date = $request->has('date')
            ? Carbon::parse($request->input('date'))
            : Carbon::now('America/Martinique')->startOfDay();

        // Look for porta_prevues from previous working day (skip weekends and holidays)
        $lookback = $date->copy()->subDay();
        $maxLookback = 5; // max 5 days back (handles long weekends)
        $event = null;

        for ($i = 0; $i < $maxLookback; $i++) {
            // Skip weekends (Saturday=6, Sunday=0)
            if ($lookback->isSaturday() || $lookback->isSunday()) {
                $lookback->subDay();
                continue;
            }

            // Skip holidays
            if ($this->holidayService->isHolidayAnywhere($lookback)) {
                $lookback->subDay();
                continue;
            }

            // Auto-add metadata column if missing
            if (!Schema::hasColumn('monitoring_events', 'metadata')) {
                Schema::table('monitoring_events', function ($table) {
                    $table->json('metadata')->nullable()->after('checked_items');
                });
            }

            $event = MonitoringEvent::where('user_id', $request->user()->id)
                ->where('event_type', 'porta_prevues')
                ->forDate($lookback)
                ->first();

            if ($event?->metadata) break;
            $lookback->subDay();
        }

        return response()->json([
            'previsions' => $event?->metadata,
            'previsions_date' => $lookback->format('Y-m-d'),
            'event_status' => $event?->status,
        ]);
    }

    /**
     * Generate daily report from all monitoring events.
     */
    public function report(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'sometimes|date_format:Y-m-d',
        ]);

        $date = $request->has('date')
            ? Carbon::parse($request->input('date'))
            : Carbon::now('America/Martinique')->startOfDay();

        $events = MonitoringEvent::where('user_id', $request->user()->id)
            ->forDate($date)
            ->get()
            ->keyBy('event_type');

        // Get previous day's previsions for PSO comparison
        $yesterday = $date->copy()->subDay();
        $previsions = MonitoringEvent::where('user_id', $request->user()->id)
            ->where('event_type', 'porta_prevues')
            ->forDate($yesterday)
            ->first();

        // Build report data
        $totalEvents = $events->count();
        $verified = $events->where('status', 'verified')->count();
        $issues = $events->where('status', 'issue')->count();
        $skipped = $events->where('status', 'skipped')->count();
        $pending = $events->where('status', 'pending')->count();

        // Timeline detail per event
        $timeline = [];
        $warnings = [];
        $comparisons = [];

        foreach ($events as $type => $event) {
            $meta = $event->metadata ?? [];
            $entry = [
                'event_type' => $type,
                'status' => $event->status,
                'verified_at' => $event->verified_at?->format('H:i'),
                'notes' => $event->notes,
                'metadata' => $meta,
                'checked_items' => $event->checked_items ?? [],
            ];
            $timeline[] = $entry;

            // Collect warnings from metadata
            if ($event->status === 'issue') {
                $warnings[] = [
                    'event_type' => $type,
                    'details' => $event->notes,
                ];
            }

            // Check for specific issues in metadata
            if (isset($meta['total_incidents']) && $meta['total_incidents'] > 0) {
                $warnings[] = [
                    'event_type' => $type,
                    'details' => sprintf(
                        '%d incident(s) : %d refus, %d AR non-reçu, %d erreurs fichier',
                        $meta['total_incidents'],
                        $meta['refusals'] ?? 0,
                        $meta['ar_non_recu'] ?? 0,
                        $meta['file_errors'] ?? 0,
                    ),
                ];
            }

            if (isset($meta['total_refus']) && $meta['total_refus'] > 0) {
                $warnings[] = [
                    'event_type' => $type,
                    'details' => sprintf('%d refus RIO à traiter', $meta['total_refus']),
                ];
            }

            if (isset($meta['not_found_count']) && $meta['not_found_count'] > 0) {
                $warnings[] = [
                    'event_type' => $type,
                    'details' => sprintf('%d fichier(s) NOT FOUND dans les acquittements', $meta['not_found_count']),
                ];
            }
        }

        // PSO vs Previsions comparison
        $psoEvent = $events->get('pso_jour');
        if ($psoEvent && $previsions?->metadata) {
            $psoMeta = $psoEvent->metadata ?? [];
            $prevMeta = $previsions->metadata ?? [];

            $psoTotal = ($psoMeta['pso_gpmag'] ?? 0) + ($psoMeta['pso_wizzee'] ?? 0);
            $prevTotal = ($prevMeta['digicel_out'] ?? 0) + ($prevMeta['wizzee_out'] ?? 0);

            $ecart = $prevTotal > 0 ? abs($psoTotal - $prevTotal) / $prevTotal * 100 : 0;

            $comparisons[] = [
                'type' => 'pso_vs_previsions',
                'label' => 'PSO réel vs Prévisions veille',
                'actual' => $psoTotal,
                'expected' => $prevTotal,
                'ecart_pct' => round($ecart, 1),
                'ok' => $ecart <= 20,
                'detail' => [
                    'pso_gpmag' => $psoMeta['pso_gpmag'] ?? 0,
                    'pso_wizzee' => $psoMeta['pso_wizzee'] ?? 0,
                    'prev_digicel_out' => $prevMeta['digicel_out'] ?? 0,
                    'prev_wizzee_out' => $prevMeta['wizzee_out'] ?? 0,
                ],
            ];
        }

        // Vacation comparisons
        $vac1 = $events->get('vacation_1');
        $vac2 = $events->get('vacation_2');
        $vac3 = $events->get('vacation_3');

        if ($vac1 && $vac2 && $vac1->metadata && $vac2->metadata) {
            $comparisons[] = [
                'type' => 'vacation_1_vs_2',
                'label' => 'Vacation 1 vs Vacation 2',
                'vac1_files' => ($vac1->metadata['files_exchanged'] ?? 0) . '/' . ($vac1->metadata['files_expected'] ?? 0),
                'vac2_files' => ($vac2->metadata['files_exchanged'] ?? 0) . '/' . ($vac2->metadata['files_expected'] ?? 0),
                'vac1_err' => $vac1->metadata['has_err'] ?? false,
                'vac2_err' => $vac2->metadata['has_err'] ?? false,
            ];
        }

        return response()->json([
            'date' => $date->format('Y-m-d'),
            'date_formatted' => $date->translatedFormat('l j F Y'),
            'user' => $request->user()->name,
            'summary' => [
                'total_events' => $totalEvents,
                'verified' => $verified,
                'issues' => $issues,
                'skipped' => $skipped,
                'pending' => $pending,
                'completion_pct' => $totalEvents > 0 ? round(($verified + $issues + $skipped) / $totalEvents * 100) : 0,
            ],
            'timeline' => $timeline,
            'warnings' => $warnings,
            'comparisons' => $comparisons,
            'is_holiday' => $this->holidayService->isHolidayAnywhere($date),
        ]);
    }
}
