<?php

namespace App\Http\Controllers;

use App\Models\KnowledgeDomain;
use App\Models\MonitoringEvent;
use App\Services\HolidayService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, HolidayService $holidayService): Response
    {
        $user = $request->user();

        if (! $user->onboarding_completed) {
            return Inertia::render('Onboarding/Index');
        }

        $domains = KnowledgeDomain::orderBy('sort_order')
            ->withCount(['publishedArticles as articles_count'])
            ->get();

        $domainProgress = $user->domainProgress()
            ->get()
            ->keyBy('domain_id');

        // Calculate level dynamically from overall progress
        $totalArticles = $domains->sum('articles_count');
        $totalRead = $domainProgress->sum('articles_read');
        $overallPercent = $totalArticles > 0 ? ($totalRead / $totalArticles) * 100 : 0;

        $level = match (true) {
            $overallPercent >= 75 => 'maitrise',
            $overallPercent >= 30 => 'comprehension',
            default => 'decouverte',
        };

        $today = Carbon::now('America/Martinique')->startOfDay();

        return Inertia::render('Dashboard', [
            'domains' => $domains,
            'domainProgress' => $domainProgress,
            'user' => [
                ...$user->only('id', 'name', 'role', 'onboarding_completed'),
                'level' => $level,
            ],
            'monitoring' => [
                'events' => MonitoringEvent::where('user_id', $user->id)
                    ->forDate($today)
                    ->get(),
                'isHoliday' => $holidayService->isHolidayAnywhere($today),
                'holidayDetails' => $holidayService->getHolidaysForDate($today),
            ],
        ]);
    }
}
