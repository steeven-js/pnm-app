<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
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
