<?php

use App\Http\Controllers\Team\TeamController;
use App\Http\Controllers\Tournament\TournamentController;
use App\Http\Controllers\Match\TournamentMatchController;
use App\Http\Controllers\User\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Teams
    Route::apiResource('teams', TeamController::class)->only(['index', 'show']);

    Route::middleware('role:captain,admin')->group(function () {
        Route::post('/teams', [TeamController::class, 'store'])->name('teams.store');
        Route::put('/teams/{team}', [TeamController::class, 'update'])->name('teams.update');
        Route::delete('/teams/{team}', [TeamController::class, 'destroy'])->name('teams.destroy');
    });

    // Tournaments
    Route::apiResource('tournaments', TournamentController::class)->only(['index', 'show']);

    Route::middleware('role:admin')->group(function () {
        Route::post('/tournaments', [TournamentController::class, 'store'])->name('tournaments.store');
        Route::put('/tournaments/{tournament}', [TournamentController::class, 'update'])->name('tournaments.update');
        Route::delete('/tournaments/{tournament}', [TournamentController::class, 'destroy'])->name('tournaments.destroy');
    });

    // Tournament Matches
    Route::apiResource('tournament-matches', TournamentMatchController::class)->only(['index', 'show']);

    Route::middleware('role:admin')->group(function () {
        Route::post('/tournament-matches', [TournamentMatchController::class, 'store'])->name('tournament-matches.store');
        Route::put('/tournament-matches/{match}', [TournamentMatchController::class, 'update'])->name('tournament-matches.update');
        Route::delete('/tournament-matches/{match}', [TournamentMatchController::class, 'destroy'])->name('tournament-matches.destroy');
    });

    Route::middleware('role:referee')->group(function () {
        Route::patch('/tournament-matches/{match}/results', [TournamentMatchController::class, 'updateResults'])->name('tournament-matches.results');
    });
});