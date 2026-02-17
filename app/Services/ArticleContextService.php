<?php

namespace App\Services;

use App\Models\Article;
use Illuminate\Support\Facades\Cache;

class ArticleContextService
{
    /**
     * Build a text context from all published articles for the system prompt.
     */
    public function buildContext(): string
    {
        return Cache::remember('chat:article_context', 3600, function () {
            $articles = Article::where('is_published', true)
                ->with('domain:id,name')
                ->orderBy('domain_id')
                ->orderBy('sort_order')
                ->get(['id', 'domain_id', 'title', 'content']);

            $context = '';

            foreach ($articles as $article) {
                $domainName = $article->domain?->name ?? 'Général';
                $plainContent = strip_tags($article->content ?? '');
                $plainContent = preg_replace('/\s+/', ' ', $plainContent);
                $plainContent = trim($plainContent);

                if (empty($plainContent)) {
                    continue;
                }

                $context .= "## [{$domainName}] {$article->title}\n";
                $context .= "{$plainContent}\n\n";
            }

            return $context;
        });
    }

    /**
     * Clear the cached article context.
     */
    public function clearCache(): void
    {
        Cache::forget('chat:article_context');
    }
}
