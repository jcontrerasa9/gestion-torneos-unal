<?php

namespace App\Http\Controllers\Enrollment;

use App\Http\Controllers\Controller;
use App\Http\Requests\TournamentTeam\DeleteTournamentTeamRequest;
use App\Http\Requests\TournamentTeam\ShowTournamentTeamRequest;
use App\Http\Requests\TournamentTeam\StoreTournamentTeamRequest;
use App\Http\Requests\TournamentTeam\UpdateTournamentTeamRequest;
use App\Models\TournamentTeam;
use Illuminate\Http\JsonResponse;

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

    public function store(StoreTournamentTeamRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['status'] = 'pendiente';
        $data['request_date'] = now()->toDateString();
        $data['approval_date'] = null;

        $tournamentTeam = TournamentTeam::create($data);

        return response()->json([
            'message' => 'Tournament team request created successfully',
            'data' => $tournamentTeam->load(['tournament', 'team']),
        ], 201);
    }

    public function show(ShowTournamentTeamRequest $request, TournamentTeam $tournamentTeam): JsonResponse
    {
        return response()->json([
            'message' => 'Tournament team request retrieved successfully',
            'data' => $tournamentTeam->load(['tournament', 'team']),
        ]);
    }

    public function update(UpdateTournamentTeamRequest $request, TournamentTeam $tournamentTeam): JsonResponse
    {
        $data = $request->validated();

        if (array_key_exists('status', $data)) {
            $data['approval_date'] = $data['status'] === 'aprobada' ? now()->toDateString() : null;
        }

        $tournamentTeam->update($data);

        return response()->json([
            'message' => 'Tournament team request updated successfully',
            'data' => $tournamentTeam->fresh(['tournament', 'team']),
        ]);
    }

    public function destroy(DeleteTournamentTeamRequest $request, TournamentTeam $tournamentTeam): JsonResponse
    {
        $tournamentTeam->delete();

        return response()->json(['message' => 'Tournament team request deleted successfully'], 200);
    }
}
