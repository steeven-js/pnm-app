<?php

namespace App\Http\Controllers;

use App\Models\MonitoringEvent;
use App\Services\HolidayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
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

        // Only include metadata if the column exists (migration may not have run yet)
        if (isset($validated['metadata']) && Schema::hasColumn('monitoring_events', 'metadata')) {
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

        // Look for porta_prevues from yesterday
        $yesterday = $date->copy()->subDay();

        // Check if metadata column exists before querying
        if (!Schema::hasColumn('monitoring_events', 'metadata')) {
            return response()->json([
                'previsions' => null,
                'previsions_date' => $yesterday->format('Y-m-d'),
                'event_status' => null,
            ]);
        }

        $event = MonitoringEvent::where('user_id', $request->user()->id)
            ->where('event_type', 'porta_prevues')
            ->forDate($yesterday)
            ->first();

        return response()->json([
            'previsions' => $event?->metadata,
            'previsions_date' => $yesterday->format('Y-m-d'),
            'event_status' => $event?->status,
        ]);
    }
}
