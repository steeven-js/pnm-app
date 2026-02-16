<?php

namespace App\Http\Controllers;

use App\Models\DecisionTree;
use Inertia\Inertia;
use Inertia\Response;

class DecisionTreeController extends Controller
{
    public function index(): Response
    {
        $trees = DecisionTree::orderBy('sort_order')->get(['id', 'title', 'slug', 'description', 'icon']);

        return Inertia::render('resolve/decision-trees/index', [
            'trees' => $trees,
        ]);
    }

    public function show(DecisionTree $tree): Response
    {
        return Inertia::render('resolve/decision-trees/show', [
            'tree' => $tree,
        ]);
    }
}
