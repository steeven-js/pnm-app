<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\KnowledgeDomain;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiagramController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $articles = Article::where('is_published', true)
            ->whereNotNull('content')
            ->where('content', 'like', '%<pre class="mermaid">%')
            ->with('domain:id,name,slug,color')
            ->get(['id', 'title', 'slug', 'domain_id', 'content']);

        $diagrams = [];
        $diagramId = 0;

        foreach ($articles as $article) {
            $doc = new \DOMDocument();
            libxml_use_internal_errors(true);
            $doc->loadHTML('<?xml encoding="UTF-8">' . $article->content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
            libxml_clear_errors();

            $pres = $doc->getElementsByTagName('pre');

            foreach ($pres as $pre) {
                if ($pre->getAttribute('class') !== 'mermaid') {
                    continue;
                }

                // Walk backwards through siblings to find the nearest heading
                $title = 'Diagramme sans titre';
                $sibling = $pre->previousSibling;
                while ($sibling) {
                    if ($sibling->nodeType === XML_ELEMENT_NODE) {
                        if (in_array($sibling->nodeName, ['h2', 'h3', 'h4'])) {
                            $title = trim($sibling->textContent);
                            break;
                        }
                    }
                    $sibling = $sibling->previousSibling;
                }

                $diagrams[] = [
                    'id' => ++$diagramId,
                    'title' => $title,
                    'mermaid_source' => trim($pre->textContent),
                    'article' => [
                        'id' => $article->id,
                        'title' => $article->title,
                        'slug' => $article->slug,
                    ],
                    'domain' => [
                        'id' => $article->domain->id,
                        'name' => $article->domain->name,
                        'slug' => $article->domain->slug,
                        'color' => $article->domain->color,
                    ],
                ];
            }
        }

        $domains = KnowledgeDomain::orderBy('sort_order')
            ->whereHas('publishedArticles', fn ($q) => $q->where('content', 'like', '%<pre class="mermaid">%'))
            ->get(['id', 'name', 'slug', 'color']);

        return Inertia::render('diagrams/index', [
            'diagrams' => $diagrams,
            'domains' => $domains,
        ]);
    }
}
