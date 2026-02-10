<?php

namespace App\Http\Controllers;

use App\Models\GlossaryTerm;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GlossaryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = GlossaryTerm::query()->orderBy('term');

        if ($search = $request->get('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('term', 'like', "%{$search}%")
                    ->orWhere('abbreviation', 'like', "%{$search}%")
                    ->orWhere('definition', 'like', "%{$search}%");
            });
        }

        if ($category = $request->get('category')) {
            $query->where('category', $category);
        }

        $terms = $query->get();
        $categories = GlossaryTerm::distinct()->whereNotNull('category')->pluck('category')->sort()->values();

        return Inertia::render('glossary/index', [
            'terms' => $terms,
            'categories' => $categories,
            'filters' => [
                'q' => $search,
                'category' => $category,
            ],
        ]);
    }
}
