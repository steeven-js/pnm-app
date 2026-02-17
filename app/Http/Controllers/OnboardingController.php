<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Onboarding/Index');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'role' => 'required|string|in:charge_application,developpeur,reseau,support,manager',
        ]);

        $request->user()->update([
            'role' => $validated['role'],
            'onboarding_completed' => true,
        ]);

        return redirect()->route('dashboard');
    }
}
