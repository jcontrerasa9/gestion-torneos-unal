<?php

namespace App\Http\Controllers\Enrollment;

use App\Http\Controllers\Controller;
use App\Http\Requests\PlayerRequest\DeletePlayerRequestRequest;
use App\Http\Requests\PlayerRequest\StorePlayerRequestRequest;
use App\Http\Requests\PlayerRequest\UpdatePlayerRequestRequest;
use App\Models\PlayerRequest;
use Illuminate\Http\JsonResponse;

class PlayerRequestController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $query = PlayerRequest::query();

        if ($user->role->name === 'player') {
            $query->where('player_id', $user->id);
        } elseif ($user->role->name === 'captain') {
            $query->whereHas('tournamentTeam.team', function ($q) use ($user): void {
                $q->where('captain_id', $user->id);
            });
        }

        $requests = $query->latest()->paginate(15);

        return response()->json([
            'message' => 'Player requests retrieved successfully',
            'data' => $requests,
        ]);
    }

    public function store(StorePlayerRequestRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['request_date'] = now()->toDateString();
        $data['status'] = $data['status'] ?? 'pendiente';

        $playerRequest = PlayerRequest::create($data);

        return response()->json([
            'message' => 'Player request created successfully',
            'data' => $playerRequest->load(['tournamentTeam.team', 'player']),
        ], 201);
    }

    public function show(ShowPlayerRequestRequest $request, PlayerRequest $playerRequest): JsonResponse
    {
        return response()->json([
            'message' => 'Player request retrieved successfully',
            'data' => $playerRequest->load(['tournamentTeam.team', 'player']),
        ]);
    }

    public function update(UpdatePlayerRequestRequest $request, PlayerRequest $playerRequest): JsonResponse
    {
        $playerRequest->update($request->validated());

        return response()->json([
            'message' => 'Player request updated successfully',
            'data' => $playerRequest->fresh(['tournamentTeam.team', 'player']),
        ]);
    }

    public function destroy(DeletePlayerRequestRequest $request, PlayerRequest $playerRequest): JsonResponse
    {
        $playerRequest->delete();

        return response()->json(['message' => 'Player request deleted successfully'], 200);
    }
}
