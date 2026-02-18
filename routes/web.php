<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MonitoringController;
use App\Http\Controllers\DecisionTreeController;
use App\Http\Controllers\DiagramController;
use App\Http\Controllers\GlossaryController;
use App\Http\Controllers\KnowledgeDomainController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\PnmCodeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\ResolveController;
use App\Http\Controllers\ResolveToolController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SqlPlaygroundController;
use App\Http\Controllers\VerifyController;
use App\Http\Controllers\VerifyToolController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    // Onboarding
    Route::get('/onboarding', [OnboardingController::class, 'index'])->name('onboarding');
    Route::post('/onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');

    // Knowledge domains & articles
    Route::get('/knowledge', [KnowledgeDomainController::class, 'index'])->name('knowledge.index');
    Route::get('/knowledge/{domain:slug}', [KnowledgeDomainController::class, 'show'])->name('knowledge.domain');
    Route::get('/knowledge/{domain:slug}/{article:slug}', [ArticleController::class, 'show'])->name('knowledge.article')->scopeBindings();
    Route::post('/articles/{article}/mark-read', [ArticleController::class, 'markRead'])->name('articles.mark-read');

    // Glossary
    Route::get('/glossary', [GlossaryController::class, 'index'])->name('glossary.index');

    // Search API (JSON, not Inertia)
    Route::get('/api/search', SearchController::class)->name('api.search');

    // Progress
    Route::get('/progress', ProgressController::class)->name('progress');

    // Diagrams
    Route::get('/diagrams', DiagramController::class)->name('diagrams');

    // Resolve
    Route::get('/resolve', ResolveController::class)->name('resolve');
    Route::get('/resolve/codes', [PnmCodeController::class, 'index'])->name('resolve.codes.index');
    Route::get('/resolve/codes/{code}', [PnmCodeController::class, 'show'])->name('resolve.codes.show');
    Route::get('/resolve/incidents', [ResolveToolController::class, 'incidents'])->name('resolve.incidents');
    Route::get('/resolve/decision-trees', [DecisionTreeController::class, 'index'])->name('resolve.trees.index');
    Route::get('/resolve/decision-trees/{tree:slug}', [DecisionTreeController::class, 'show'])->name('resolve.trees.show');

    // Verify
    Route::get('/verify', VerifyController::class)->name('verify');
    Route::get('/verify/date-calculator', [VerifyToolController::class, 'dateCalculator'])->name('verify.date-calculator');
    Route::get('/verify/rio-validator', [VerifyToolController::class, 'rioValidator'])->name('verify.rio-validator');
    Route::get('/verify/filename-decoder', [VerifyToolController::class, 'filenameDecoder'])->name('verify.filename-decoder');
    Route::get('/verify/portage-id', [VerifyToolController::class, 'portageIdCalculator'])->name('verify.portage-id');
    Route::get('/verify/msisdn-checker', [VerifyToolController::class, 'msisdnChecker'])->name('verify.msisdn-checker');

    // Profile (Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // SQL Playground
    Route::get('/sql-playground', [SqlPlaygroundController::class, 'index'])->name('sql-playground');
    Route::get('/sql-playground/{level}', [SqlPlaygroundController::class, 'scenarios'])->name('sql-playground.scenarios');
    Route::post('/api/sql-playground', [SqlPlaygroundController::class, 'execute'])->name('api.sql-playground');

    // Monitoring API (JSON)
    Route::get('/api/monitoring', [MonitoringController::class, 'index'])->name('api.monitoring.index');
    Route::post('/api/monitoring', [MonitoringController::class, 'store'])->name('api.monitoring.store');

    // Chat IA (JSON API, not Inertia)
    Route::get('api/chat/conversations', [ChatController::class, 'index'])->name('api.chat.index');
    Route::get('api/chat/conversations/{conversation}', [ChatController::class, 'show'])->name('api.chat.show');
    Route::post('api/chat/stream', [ChatController::class, 'stream'])->name('api.chat.stream');
    Route::delete('api/chat/conversations/{conversation}', [ChatController::class, 'destroy'])->name('api.chat.destroy');
});

// Dev login route (local only)
if (app()->environment('local')) {
    Route::post('/dev-login', function () {
        $user = User::firstOrCreate(
            ['email' => 'dev@pnm.local'],
            [
                'name' => 'Dev User',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'level' => 'maitrise',
                'onboarding_completed' => true,
            ]
        );

        Auth::login($user);
        request()->session()->regenerate();

        return redirect()->intended('/dashboard');
    })->name('dev-login');
}

require __DIR__.'/auth.php';
