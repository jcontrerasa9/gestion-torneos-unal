<?php

namespace App\Http\Controllers\Team;

use App\Http\Controllers\Controller;
use App\Http\Requests\Team\DeleteTeamRequest;
use App\Http\Requests\Team\StoreTeamRequest;
use App\Http\Requests\Team\UpdateTeamRequest;
use App\Models\Role;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class TeamController extends Controller
{
    public function index(): JsonResponse
    {
        $teams = Team::with('captain')->latest()->paginate(15);

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

        if ($request->user()->role->name === 'admin' && ! empty($data['captain_id'])) {
            $captain = User::find($data['captain_id']);
            if ($captain && $captain->role->name !== 'captain') {
                $captainRole = Role::where('name', 'captain')->first();
                if ($captainRole) {
                    $captain->update(['role_id' => $captainRole->id]);
                }
            }
        }

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
        $data = $request->validated();
        $team->update($data);

        if ($request->user()->role->name === 'admin' && ! empty($data['captain_id'])) {
            $captain = User::find($data['captain_id']);
            if ($captain && $captain->role->name !== 'captain') {
                $captainRole = Role::where('name', 'captain')->first();
                if ($captainRole) {
                    $captain->update(['role_id' => $captainRole->id]);
                }
            }
        }

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
