<?php

namespace App\Http\Controllers;

use App\Models\PnmCode;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PnmCodeController extends Controller
{
    public function index(Request $request): Response
    {
        $query = PnmCode::query()->orderBy('sort_order')->orderBy('code');

        if ($search = $request->get('q')) {
            $query->search($search);
        }

        if ($category = $request->get('category')) {
            $query->category($category);
        }

        if ($severity = $request->get('severity')) {
            $query->where('severity', $severity);
        }

        $codes = $query->get();
        $categories = PnmCode::distinct()->pluck('category')->sort()->values();
        $severities = PnmCode::distinct()->pluck('severity')->sort()->values();

        return Inertia::render('Resolve/Codes/Index', [
            'codes' => $codes,
            'categories' => $categories,
            'severities' => $severities,
            'filters' => [
                'q' => $search,
                'category' => $category,
                'severity' => $severity,
            ],
        ]);
    }

    public function show(PnmCode $code): Response
    {
        return Inertia::render('Resolve/Codes/Show', [
            'code' => $code,
        ]);
    }
}
