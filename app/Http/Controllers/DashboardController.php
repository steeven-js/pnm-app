<?php

namespace App\Http\Controllers;

use App\Models\KnowledgeDomain;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        if (! $user->onboarding_completed) {
            return Inertia::render('onboarding/index');
        }

        $domains = KnowledgeDomain::orderBy('sort_order')
            ->withCount(['publishedArticles as articles_count'])
            ->get();

        $domainProgress = $user->domainProgress()
            ->get()
            ->keyBy('domain_id');

        return Inertia::render('dashboard', [
            'domains' => $domains,
            'domainProgress' => $domainProgress,
            'user' => $user->only('id', 'name', 'role', 'level', 'onboarding_completed'),
        ]);
    }
}
