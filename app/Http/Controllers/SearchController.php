<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\GlossaryTerm;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $query = $request->get('q', '');

        if (strlen($query) < 2) {
            return response()->json(['articles' => [], 'glossary' => []]);
        }

        $articles = Article::where('is_published', true)
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                    ->orWhere('excerpt', 'like', "%{$query}%");
            })
            ->with('domain:id,slug,name,color')
            ->limit(8)
            ->get(['id', 'domain_id', 'title', 'slug', 'excerpt', 'level']);

        $glossary = GlossaryTerm::where(function ($q) use ($query) {
            $q->where('term', 'like', "%{$query}%")
                ->orWhere('abbreviation', 'like', "%{$query}%")
                ->orWhere('definition', 'like', "%{$query}%");
        })
            ->limit(5)
            ->get(['id', 'term', 'slug', 'abbreviation', 'definition', 'category']);

        return response()->json([
            'articles' => $articles,
            'glossary' => $glossary,
        ]);
    }
}
