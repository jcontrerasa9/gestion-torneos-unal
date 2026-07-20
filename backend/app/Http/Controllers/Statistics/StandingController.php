<?php

namespace App\Http\Controllers\Statistics;

use App\Http\Controllers\Controller;
use App\Models\Standing;
use App\Models\Tournament;
use App\Models\TournamentTeam;
use App\Services\StandingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StandingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tournamentId = $request->query('tournament_id');

        if ($tournamentId) {
            $tournament = Tournament::findOrFail($tournamentId);
            app(StandingService::class)->refreshForTournament($tournament);
        } else {
            foreach (Tournament::query()->get() as $tournament) {
                app(StandingService::class)->refreshForTournament($tournament);
            }
        }

        $standings = Standing::query()
            ->when($tournamentId, fn ($query) => $query->where('tournament_id', $tournamentId))
            ->with(['tournament', 'tournamentTeam.team'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'message' => 'Standings retrieved successfully',
            'data' => $standings,
        ]);
    }

    public function show(Tournament $tournament): JsonResponse
    {
        app(StandingService::class)->refreshForTournament($tournament);

        foreach (TournamentTeam::where('tournament_id', $tournament->id)->get() as $tt) {
            Standing::firstOrCreate(
                ['tournament_id' => $tournament->id, 'tournament_team_id' => $tt->id],
                [
                    'matches_played' => 0, 'wins' => 0, 'draws' => 0, 'losses' => 0,
                    'goals_for' => 0, 'goals_against' => 0, 'goal_difference' => 0, 'points' => 0,
                ]
            );
        }

        $standings = Standing::where('tournament_id', $tournament->id)
            ->with(['tournament', 'tournamentTeam.team'])
            ->orderByDesc('points')
            ->orderByDesc('goal_difference')
            ->orderByDesc('goals_for')
            ->get();

        return response()->json([
            'message' => 'Standings retrieved successfully',
            'data' => $standings,
        ]);
    }
}
