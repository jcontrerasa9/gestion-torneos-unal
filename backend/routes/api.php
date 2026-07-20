<?php

use App\Http\Controllers\Enrollment\PlayerRequestController;
use App\Http\Controllers\Enrollment\TournamentTeamController;
use App\Http\Controllers\Enrollment\TournamentTeamPlayerController;
use App\Http\Controllers\Match\MatchEventController;
use App\Http\Controllers\Match\TournamentMatchController;
use App\Http\Controllers\Statistics\StandingController;
use App\Http\Controllers\Team\TeamController;
use App\Http\Controllers\Tournament\TournamentController;
use App\Http\Controllers\User\AuthController;
use App\Http\Controllers\User\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/referees', [UserController::class, 'referees'])->middleware('role:admin');
    Route::get('/captains', [UserController::class, 'captains'])->middleware('role:admin');

    // Teams
    Route::apiResource('teams', TeamController::class)->only(['index', 'show']);

    Route::middleware('role:captain,admin')->group(function () {
        Route::post('/teams', [TeamController::class, 'store'])->name('teams.store');
        Route::put('/teams/{team}', [TeamController::class, 'update'])->name('teams.update');
        Route::delete('/teams/{team}', [TeamController::class, 'destroy'])->name('teams.destroy');
    });

    // Player requests
    Route::apiResource('player-requests', PlayerRequestController::class)->only(['index', 'show']);

    Route::middleware('role:player')->group(function () {
        Route::post('/player-requests', [PlayerRequestController::class, 'store'])->name('player-requests.store');
    });

    Route::middleware('role:player,captain,admin')->group(function () {
        Route::put('/player-requests/{playerRequest}', [PlayerRequestController::class, 'update'])->name('player-requests.update');
    });

    Route::middleware('role:admin')->group(function () {
        Route::delete('/player-requests/{playerRequest}', [PlayerRequestController::class, 'destroy'])->name('player-requests.destroy');
    });

    Route::middleware('role:admin,captain')->group(function () {
        Route::patch('/player-requests/{playerRequest}/approve', [PlayerRequestController::class, 'approve'])->name('player-requests.approve');
        Route::patch('/player-requests/{playerRequest}/reject', [PlayerRequestController::class, 'reject'])->name('player-requests.reject');
    });

    // Tournament Team Players
    Route::apiResource('tournament-team-players', TournamentTeamPlayerController::class)->only(['index', 'show']);

    Route::middleware('role:admin,captain')->group(function () {
        Route::patch('/tournament-team-players/{enrollment}/toggle-status', [TournamentTeamPlayerController::class, 'toggleStatus'])->name('tournament-team-players.toggle-status');
    });

    Route::middleware('role:admin')->group(function () {
        Route::delete('/tournament-team-players/{enrollment}', [TournamentTeamPlayerController::class, 'destroy'])->name('tournament-team-players.destroy');
    });

    // Tournament Team requests
    Route::middleware('role:admin,captain')->group(function () {
        Route::get('/tournament-teams', [TournamentTeamController::class, 'index'])->name('tournament-teams.index');
        Route::post('/tournament-teams', [TournamentTeamController::class, 'store'])->name('tournament-teams.store');
        Route::get('/tournament-teams/{tournamentTeam}', [TournamentTeamController::class, 'show'])->name('tournament-teams.show');
        Route::put('/tournament-teams/{tournamentTeam}', [TournamentTeamController::class, 'update'])->name('tournament-teams.update');
        Route::delete('/tournament-teams/{tournamentTeam}', [TournamentTeamController::class, 'destroy'])->name('tournament-teams.destroy');
    });

    // Standings
    Route::get('/standings', [StandingController::class, 'index'])->name('standings.index');
    Route::get('/standings/tournament/{tournament}', [StandingController::class, 'show'])->name('standings.show');
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

    // Match Events
    Route::apiResource('match-events', MatchEventController::class)->only(['index', 'show']);

    Route::middleware('role:admin,referee')->group(function () {
        Route::post('/match-events', [MatchEventController::class, 'store'])->name('match-events.store');
        Route::put('/match-events/{event}', [MatchEventController::class, 'update'])->name('match-events.update');
        Route::delete('/match-events/{event}', [MatchEventController::class, 'destroy'])->name('match-events.destroy');
    });
});
