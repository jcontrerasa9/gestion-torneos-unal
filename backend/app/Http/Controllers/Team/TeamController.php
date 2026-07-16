<?php

namespace App\Http\Controllers\Team;

use App\Http\Controllers\Controller;
use App\Http\Requests\Team\DeleteTeamRequest;
use App\Http\Requests\Team\StoreTeamRequest;
use App\Http\Requests\Team\UpdateTeamRequest;
use App\Models\Team;
use Illuminate\Http\JsonResponse;

class TeamController extends Controller
{
    public function index(): JsonResponse
    {
        $teams = Team::latest()->paginate(15);

        return response()->json([
            'message' => 'Teams retrieved successfully',
            'data' => $teams,
        ]);
    }

    public function store(StoreTeamRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->user()->role->name === 'captain') {
            $data['captain_id'] = $request->user()->id;
        }

        $team = Team::create($data);

        return response()->json([
            'message' => 'Team created successfully',
            'data' => $team->load('captain'),
        ], 201);
    }

    public function show(Team $team): JsonResponse
    {
        return response()->json([
            'message' => 'Team retrieved successfully',
            'data' => $team->load('captain'),
        ]);
    }

    public function update(UpdateTeamRequest $request, Team $team): JsonResponse
    {
        $team->update($request->validated());

        return response()->json([
            'message' => 'Team updated successfully',
            'data' => $team->fresh('captain'),
        ]);
    }

    public function destroy(DeleteTeamRequest $request, Team $team): JsonResponse
    {
        $hasActiveTournament = $team->tournamentTeams()
            ->whereHas('tournament', fn ($q) => $q->whereIn('status', ['pendiente', 'en_curso']))
            ->exists();

        if ($hasActiveTournament) {
            return response()->json(['message' => 'Team is enrolled in an active tournament.'], 422);
        }

        $team->delete();

        return response()->json(['message' => 'Team deleted successfully'], 200);
    }
}
