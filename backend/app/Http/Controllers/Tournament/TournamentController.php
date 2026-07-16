<?php

namespace App\Http\Controllers\Tournament;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tournament\DeleteTournamentRequest;
use App\Http\Requests\Tournament\StoreTournamentRequest;
use App\Http\Requests\Tournament\UpdateTournamentRequest;
use App\Models\Tournament;
use Illuminate\Http\JsonResponse;

class TournamentController extends Controller
{
    public function index(): JsonResponse
    {
        $tournaments = Tournament::latest()->paginate(15);

        return response()->json([
            'message' => 'Tournaments retrieved successfully',
            'data' => $tournaments,
        ]);
    }

    public function store(StoreTournamentRequest $request): JsonResponse
    {
        $tournament = Tournament::create($request->validated());

        return response()->json([
            'message' => 'Tournament created successfully',
            'data' => $tournament,
        ], 201);
    }

    public function show(Tournament $tournament): JsonResponse
    {
        return response()->json([
            'message' => 'Tournament retrieved successfully',
            'data' => $tournament->load('tournamentTeams.team'),
        ]);
    }

    public function update(UpdateTournamentRequest $request, Tournament $tournament): JsonResponse
    {
        $tournament->update($request->validated());

        return response()->json([
            'message' => 'Tournament updated successfully',
            'data' => $tournament->fresh('tournamentTeams.team'),
        ]);
    }

    public function destroy(DeleteTournamentRequest $request, Tournament $tournament): JsonResponse
    {
        $hasMatches = $tournament->matches()->exists();

        if ($hasMatches) {
            return response()->json(['message' => 'Tournament has matches. Cannot delete.'], 422);
        }

        $tournament->delete();

        return response()->json(['message' => 'Tournament deleted successfully']);
    }
}
