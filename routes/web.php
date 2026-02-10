<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GlossaryController;
use App\Http\Controllers\KnowledgeDomainController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // Onboarding
    Route::get('onboarding', [OnboardingController::class, 'index'])->name('onboarding');
    Route::post('onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');

    // Knowledge domains & articles
    Route::get('knowledge', [KnowledgeDomainController::class, 'index'])->name('knowledge.index');
    Route::get('knowledge/{domain:slug}', [KnowledgeDomainController::class, 'show'])->name('knowledge.domain');
    Route::get('knowledge/{domain:slug}/{article:slug}', [ArticleController::class, 'show'])->name('knowledge.article')->scopeBindings();
    Route::post('articles/{article}/mark-read', [ArticleController::class, 'markRead'])->name('articles.mark-read');

    // Glossary
    Route::get('glossary', [GlossaryController::class, 'index'])->name('glossary.index');

    // Search API (JSON, not Inertia)
    Route::get('api/search', SearchController::class)->name('api.search');

    // Progress
    Route::get('progress', ProgressController::class)->name('progress');
});

require __DIR__.'/settings.php';
