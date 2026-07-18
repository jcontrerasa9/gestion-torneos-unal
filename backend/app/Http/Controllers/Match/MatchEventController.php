<?php

namespace App\Http\Controllers\Match;

use App\Http\Controllers\Controller;
use App\Http\Requests\MatchEvent\DeleteMatchEventRequest;
use App\Http\Requests\MatchEvent\StoreMatchEventRequest;
use App\Http\Requests\MatchEvent\UpdateMatchEventRequest;
use App\Models\MatchEvent;
use Illuminate\Http\JsonResponse;

class MatchEventController extends Controller
{
    public function index(): JsonResponse
    {
        $events = MatchEvent::with(['match.tournament', 'player'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'message' => 'Match events retrieved successfully',
            'data' => $events,
        ]);
    }

    public function store(StoreMatchEventRequest $request): JsonResponse
    {
        $event = MatchEvent::create($request->validated());

        return response()->json([
            'message' => 'Match event created successfully',
            'data' => $event->load(['match.tournament', 'player']),
        ], 201);
    }

    public function show(MatchEvent $matchEvent): JsonResponse
    {
        return response()->json([
            'message' => 'Match event retrieved successfully',
            'data' => $matchEvent->load(['match.tournament', 'player']),
        ]);
    }

    public function update(UpdateMatchEventRequest $request, MatchEvent $matchEvent): JsonResponse
    {
        $matchEvent->update($request->validated());

        return response()->json([
            'message' => 'Match event updated successfully',
            'data' => $matchEvent->fresh(['match.tournament', 'player']),
        ]);
    }

    public function destroy(DeleteMatchEventRequest $request, MatchEvent $matchEvent): JsonResponse
    {
        $matchEvent->delete();

        return response()->json(['message' => 'Match event deleted successfully']);
    }
}
