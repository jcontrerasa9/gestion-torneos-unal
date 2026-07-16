<?php

namespace App\Http\Controllers\TournamentMatch;

use App\Http\Controllers\Controller;
use App\Http\Requests\TournamentMatch\DeleteTournamentMatchRequest;
use App\Http\Requests\TournamentMatch\StoreTournamentMatchRequest;
use App\Http\Requests\TournamentMatch\UpdateMatchResultsRequest;
use App\Http\Requests\TournamentMatch\UpdateTournamentMatchRequest;
use App\Models\TournamentMatch;
use Illuminate\Http\JsonResponse;

class TournamentMatchController extends Controller
{
    public function index(): JsonResponse
    {
        $matches = TournamentMatch::with(['tournament', 'homeTeam', 'awayTeam', 'referee'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'message' => 'Tournament matches retrieved successfully',
            'data' => $matches,
        ]);
    }

    public function store(StoreTournamentMatchRequest $request): JsonResponse
    {
        $match = TournamentMatch::create($request->validated());

        return response()->json([
            'message' => 'Tournament match created successfully',
            'data' => $match->load(['tournament', 'homeTeam', 'awayTeam', 'referee']),
        ], 201);
    }

    public function show(TournamentMatch $match): JsonResponse
    {
        return response()->json([
            'message' => 'Tournament match retrieved successfully',
            'data' => $match->load(['tournament', 'homeTeam', 'awayTeam', 'referee', 'events']),
        ]);
    }

    public function update(UpdateTournamentMatchRequest $request, TournamentMatch $match): JsonResponse
    {
        $match->update($request->validated());

        return response()->json([
            'message' => 'Tournament match updated successfully',
            'data' => $match->fresh(['tournament', 'homeTeam', 'awayTeam', 'referee']),
        ]);
    }

    public function destroy(DeleteTournamentMatchRequest $request, TournamentMatch $match): JsonResponse
    {
        $match->delete();

        return response()->json(['message' => 'Tournament match deleted successfully']);
    }

    public function updateResults(UpdateMatchResultsRequest $request, TournamentMatch $match): JsonResponse
    {
        $match->update($request->validated());

        return response()->json([
            'message' => 'Match results updated successfully',
            'data' => $match->fresh(['tournament', 'homeTeam', 'awayTeam', 'referee']),
        ]);
    }
}
