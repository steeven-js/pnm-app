<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\GlossaryTerm;
use App\Models\PnmCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $query = $request->get('q', '');

        if (strlen($query) < 2) {
            return response()->json(['articles' => [], 'glossary' => [], 'pnmCodes' => []]);
        }

        $articles = Article::where('is_published', true)
            ->where(function ($q) use ($query) {
                $q->where('title', 'ILIKE', "%{$query}%")
                    ->orWhere('excerpt', 'ILIKE', "%{$query}%");
            })
            ->with('domain:id,slug,name,color')
            ->limit(8)
            ->get(['id', 'domain_id', 'title', 'slug', 'excerpt', 'level']);

        $glossary = GlossaryTerm::where(function ($q) use ($query) {
            $q->where('term', 'ILIKE', "%{$query}%")
                ->orWhere('abbreviation', 'ILIKE', "%{$query}%")
                ->orWhere('definition', 'ILIKE', "%{$query}%");
        })
            ->limit(5)
            ->get(['id', 'term', 'slug', 'abbreviation', 'definition', 'category']);

        $pnmCodes = PnmCode::search($query)
            ->limit(5)
            ->get(['id', 'code', 'label', 'category', 'severity']);

        return response()->json([
            'articles' => $articles,
            'glossary' => $glossary,
            'pnmCodes' => $pnmCodes,
        ]);
    }
}
