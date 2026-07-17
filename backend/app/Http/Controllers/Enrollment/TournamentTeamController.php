<?php

namespace App\Http\Controllers\Enrollment;

use App\Http\Controllers\Controller;
use App\Models\TournamentTeam;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TournamentTeamController extends Controller
{
    public function index(): JsonResponse
    {
        $requests = TournamentTeam::latest()->paginate(15);

        return response()->json([
            'message' => 'Tournament team requests retrieved successfully',
            'data' => $requests,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Tournament team request created successfully',
            'data' => []
        ], 201);
    }

    public function show(TournamentTeam $tournamentTeam): JsonResponse
    {
        return response()->json([
            'message' => 'Tournament team request retrieved successfully',
            'data' => $tournamentTeam,
        ]);
    }

    public function update(Request $request, TournamentTeam $tournamentTeam): JsonResponse
    {
        return response()->json([
            'message' => 'Tournament team request updated successfully',
            'data' => $tournamentTeam,
        ]);
    }

    public function destroy(TournamentTeam $tournamentTeam): JsonResponse
    {
        $tournamentTeam->delete();

        return response()->json(['message' => 'Tournament team request deleted successfully'], 200);
    }
}
