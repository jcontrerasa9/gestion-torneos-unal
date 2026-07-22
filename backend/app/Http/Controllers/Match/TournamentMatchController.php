<?php

namespace App\Http\Controllers\Match;

use App\Http\Controllers\Controller;
use App\Http\Requests\TournamentMatch\DeleteTournamentMatchRequest;
use App\Http\Requests\TournamentMatch\StoreTournamentMatchRequest;
use App\Http\Requests\TournamentMatch\UpdateMatchResultsRequest;
use App\Http\Requests\TournamentMatch\UpdateTournamentMatchRequest;
use App\Models\TournamentMatch;
use App\Services\StandingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

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

    public function refereeMatches(): JsonResponse
    {
        $matches = TournamentMatch::with(['tournament', 'homeTeam', 'awayTeam', 'events.player'])
            ->where('referee_id', auth()->id())
            ->whereIn('status', ['programado', 'en_juego'])
            ->latest()
            ->get();

        return response()->json(['data' => $matches]);
    }

    public function destroy(DeleteTournamentMatchRequest $request, TournamentMatch $match): JsonResponse
    {
        $match->delete();

        return response()->json(['message' => 'Tournament match deleted successfully']);
    }

    public function updateResults(UpdateMatchResultsRequest $request, TournamentMatch $match): JsonResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $match): void {
            $match->update($data);

            if (($data['status'] ?? $match->status) === 'finalizado') {
                app(StandingService::class)->updateFromMatch($match);
            }
        });

        $updatedMatch = $match->fresh();

        return response()->json([
            'message' => 'Match results updated successfully',
            'data' => $updatedMatch->load(['tournament', 'homeTeam', 'awayTeam', 'referee']),
        ]);
    }
}
