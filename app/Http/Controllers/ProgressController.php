<?php

namespace App\Http\Controllers;

use App\Models\KnowledgeDomain;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProgressController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $domains = KnowledgeDomain::orderBy('sort_order')
            ->withCount(['publishedArticles as articles_count'])
            ->get();

        $domainProgress = $user->domainProgress()
            ->get()
            ->keyBy('domain_id');

        $recentlyRead = $user->articleProgress()
            ->where('is_read', true)
            ->with('article:id,title,slug,domain_id,reading_time_minutes', 'article.domain:id,slug,name,color')
            ->orderByDesc('read_at')
            ->limit(10)
            ->get();

        $totalArticles = \App\Models\Article::where('is_published', true)->count();
        $totalRead = $user->articleProgress()->where('is_read', true)->count();

        return Inertia::render('progress/index', [
            'domains' => $domains,
            'domainProgress' => $domainProgress,
            'recentlyRead' => $recentlyRead,
            'stats' => [
                'totalArticles' => $totalArticles,
                'totalRead' => $totalRead,
                'completionPercentage' => $totalArticles > 0 ? round(($totalRead / $totalArticles) * 100, 1) : 0,
                'level' => $user->level,
            ],
        ]);
    }
}
