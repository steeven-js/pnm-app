<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class ResolveToolController extends Controller
{
    public function incidents(): Response
    {
        return Inertia::render('Resolve/Incidents');
    }
}
