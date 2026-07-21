<?php

namespace App\Http\Controllers\Match;

use App\Http\Controllers\Controller;
use App\Http\Requests\MatchEvent\DeleteMatchEventRequest;
use App\Http\Requests\MatchEvent\StoreMatchEventRequest;
use App\Http\Requests\MatchEvent\UpdateMatchEventRequest;
use App\Models\MatchEvent;
use App\Services\ScorerService;
use App\Services\SuspensionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class MatchEventController extends Controller
{
    public function index(): JsonResponse
    {
        $events = MatchEvent::with(['match.tournament', 'match.homeTeam', 'match.awayTeam', 'player'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'message' => 'Match events retrieved successfully',
            'data' => $events,
        ]);
    }

    public function store(StoreMatchEventRequest $request): JsonResponse
    {
        $event = DB::transaction(function () use ($request): MatchEvent {
            $event = MatchEvent::create($request->validated());

            app(ScorerService::class)->updateForEvent($event);
            app(SuspensionService::class)->updateForEvent($event);

            return $event;
        });

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
        $matchEvent = DB::transaction(function () use ($request, $matchEvent): MatchEvent {
            $matchEvent->update($request->validated());

            app(ScorerService::class)->updateForEvent($matchEvent);
            app(SuspensionService::class)->updateForEvent($matchEvent);

            return $matchEvent;
        });

        return response()->json([
            'message' => 'Match event updated successfully',
            'data' => $matchEvent->fresh(['match.tournament', 'player']),
        ]);
    }

    public function destroy(DeleteMatchEventRequest $request, MatchEvent $matchEvent): JsonResponse
    {
        DB::transaction(function () use ($matchEvent): void {
            app(ScorerService::class)->removeForEvent($matchEvent);
            app(SuspensionService::class)->removeForEvent($matchEvent);

            $matchEvent->delete();
        });

        return response()->json(['message' => 'Match event deleted successfully']);
    }
}
