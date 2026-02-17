<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\KnowledgeDomain;
use App\Models\UserArticleProgress;
use App\Models\UserDomainProgress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function show(Request $request, KnowledgeDomain $domain, Article $article): Response
    {
        $article->load(['glossaryTerms', 'children', 'parent']);

        $user = $request->user();
        $isRead = $user->hasReadArticle($article->id);

        // Get prev/next articles in same domain
        $domainArticles = $domain->publishedArticles()->get(['id', 'title', 'slug']);
        $currentIndex = $domainArticles->search(fn ($a) => $a->id === $article->id);
        $prevArticle = $currentIndex > 0 ? $domainArticles[$currentIndex - 1] : null;
        $nextArticle = $currentIndex < $domainArticles->count() - 1 ? $domainArticles[$currentIndex + 1] : null;

        return Inertia::render('Knowledge/Article', [
            'domain' => $domain,
            'article' => $article,
            'isRead' => $isRead,
            'prevArticle' => $prevArticle,
            'nextArticle' => $nextArticle,
        ]);
    }

    public function markRead(Request $request, Article $article): RedirectResponse
    {
        $user = $request->user();

        UserArticleProgress::updateOrCreate(
            ['user_id' => $user->id, 'article_id' => $article->id],
            ['is_read' => true, 'read_at' => now()],
        );

        // Update domain progress
        $domain = $article->domain;
        $totalArticles = $domain->publishedArticles()->count();
        $readArticles = UserArticleProgress::where('user_id', $user->id)
            ->where('is_read', true)
            ->whereHas('article', fn ($q) => $q->where('domain_id', $domain->id))
            ->count();

        UserDomainProgress::updateOrCreate(
            ['user_id' => $user->id, 'domain_id' => $domain->id],
            [
                'articles_read' => $readArticles,
                'articles_total' => $totalArticles,
                'completion_percentage' => $totalArticles > 0 ? round(($readArticles / $totalArticles) * 100, 2) : 0,
            ],
        );

        return back();
    }
}
