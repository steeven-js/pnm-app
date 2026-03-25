<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class VerifyToolController extends Controller
{
    public function dateCalculator(): Response
    {
        return Inertia::render('Verify/DateCalculator');
    }

    public function rioValidator(): Response
    {
        return Inertia::render('Verify/RioValidator');
    }

    public function filenameDecoder(): Response
    {
        return Inertia::render('Verify/FilenameDecoder');
    }

    public function portageIdCalculator(): Response
    {
        return Inertia::render('Verify/PortageId');
    }

    public function msisdnChecker(): Response
    {
        return Inertia::render('Verify/MsisdnChecker');
    }

    public function latifaMailGenerator(): Response
    {
        return Inertia::render('Verify/LatifaMailGenerator');
    }
}
