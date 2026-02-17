<?php

namespace App\Http\Controllers;

use App\Models\KnowledgeDomain;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KnowledgeDomainController extends Controller
{
    public function index(): Response
    {
        $domains = KnowledgeDomain::orderBy('sort_order')
            ->withCount(['publishedArticles as articles_count'])
            ->get();

        return Inertia::render('Knowledge/Index', [
            'domains' => $domains,
        ]);
    }

    public function show(Request $request, KnowledgeDomain $domain): Response
    {
        $domain->loadCount(['publishedArticles as articles_count']);

        $articles = $domain->rootArticles()
            ->with(['children' => function ($query) {
                $query->where('is_published', true)->orderBy('sort_order');
            }])
            ->get();

        $user = $request->user();
        $readArticleIds = $user->articleProgress()
            ->where('is_read', true)
            ->pluck('article_id')
            ->toArray();

        return Inertia::render('Knowledge/Domain', [
            'domain' => $domain,
            'articles' => $articles,
            'readArticleIds' => $readArticleIds,
        ]);
    }
}
