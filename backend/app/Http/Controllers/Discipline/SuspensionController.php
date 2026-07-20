<?php

namespace App\Http\Controllers\Discipline;

use App\Http\Controllers\Controller;
use App\Http\Requests\Suspension\DeleteSuspensionRequest;
use App\Http\Requests\Suspension\StoreSuspensionRequest;
use App\Models\Suspension;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SuspensionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Suspension::with(['player', 'tournament', 'triggeredByMatch']);

        if ($request->has('tournament_id')) {
            $query->where('tournament_id', $request->input('tournament_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $suspensions = $query->latest()->paginate(15);

        return response()->json([
            'message' => 'Suspensions retrieved successfully',
            'data' => $suspensions,
        ]);
    }

    public function store(StoreSuspensionRequest $request): JsonResponse
    {
        $suspension = Suspension::create([
            'tournament_id' => $request->input('tournament_id'),
            'player_id' => $request->input('player_id'),
            'reason' => $request->input('reason'),
            'matches_suspended' => $request->input('matches_suspended'),
            'status' => 'activa',
        ]);

        return response()->json([
            'message' => 'Suspension created successfully',
            'data' => $suspension->load(['player', 'tournament']),
        ], 201);
    }

    public function destroy(DeleteSuspensionRequest $request, Suspension $suspension): JsonResponse
    {
        $suspension->update(['status' => 'cancelada']);

        return response()->json([
            'message' => 'Suspension cancelled successfully',
            'data' => $suspension->fresh(['player', 'tournament']),
        ]);
    }
}
