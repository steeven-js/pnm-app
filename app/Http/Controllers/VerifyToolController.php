<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class VerifyToolController extends Controller
{
    public function dateCalculator(): Response
    {
        return Inertia::render('verify/date-calculator');
    }

    public function rioValidator(): Response
    {
        return Inertia::render('verify/rio-validator');
    }

    public function filenameDecoder(): Response
    {
        return Inertia::render('verify/filename-decoder');
    }

    public function portageIdCalculator(): Response
    {
        return Inertia::render('verify/portage-id');
    }

    public function msisdnChecker(): Response
    {
        return Inertia::render('verify/msisdn-checker');
    }
}
