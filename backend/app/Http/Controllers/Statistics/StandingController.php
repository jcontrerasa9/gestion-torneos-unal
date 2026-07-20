<?php

namespace App\Http\Controllers\Statistics;

use App\Http\Controllers\Controller;
use App\Models\Standing;
use Illuminate\Http\JsonResponse;

class StandingController extends Controller
{
    public function index(): JsonResponse
    {
        $standings = Standing::query()
            ->with(['tournament', 'tournamentTeam.team'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'message' => 'Standings retrieved successfully',
            'data' => $standings,
        ]);
    }

    public function show(Standing $standing): JsonResponse
    {
        $standing->load(['tournament', 'tournamentTeam.team']);

        return response()->json([
            'message' => 'Standing retrieved successfully',
            'data' => $standing,
        ]);
    }
}
