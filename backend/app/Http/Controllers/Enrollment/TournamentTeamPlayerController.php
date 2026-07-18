<?php

namespace App\Http\Controllers\Enrollment;

use App\Http\Controllers\Controller;
use App\Http\Requests\TournamentTeamPlayer\DeleteTournamentTeamPlayerRequest;
use App\Http\Requests\TournamentTeamPlayer\ToggleTournamentTeamPlayerRequest;
use App\Models\TournamentTeamPlayer;
use Illuminate\Http\JsonResponse;

class TournamentTeamPlayerController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $query = TournamentTeamPlayer::with(['tournament', 'tournamentTeam.team', 'player']);

        if ($user->role->name === 'player') {
            $query->where('player_id', $user->id);
        } elseif ($user->role->name === 'captain') {
            $query->whereHas('tournamentTeam.team', function ($q) use ($user): void {
                $q->where('captain_id', $user->id);
            });
        }

        $enrollments = $query->latest()->paginate(15);

        return response()->json([
            'message' => 'Tournament team players retrieved successfully',
            'data' => $enrollments,
        ]);
    }

    public function show(TournamentTeamPlayer $tournamentTeamPlayer): JsonResponse
    {
        return response()->json([
            'message' => 'Tournament team player retrieved successfully',
            'data' => $tournamentTeamPlayer->load(['tournament', 'tournamentTeam.team', 'player']),
        ]);
    }

    public function toggleStatus(ToggleTournamentTeamPlayerRequest $request, TournamentTeamPlayer $tournamentTeamPlayer): JsonResponse
    {
        $tournamentTeamPlayer->update([
            'is_active' => ! $tournamentTeamPlayer->is_active,
        ]);

        $status = $tournamentTeamPlayer->fresh()->is_active ? 'activated' : 'deactivated';

        return response()->json([
            'message' => "Player {$status} successfully",
            'data' => $tournamentTeamPlayer->fresh(['tournament', 'tournamentTeam.team', 'player']),
        ]);
    }

    public function destroy(DeleteTournamentTeamPlayerRequest $request, TournamentTeamPlayer $tournamentTeamPlayer): JsonResponse
    {
        $tournamentTeamPlayer->delete();

        return response()->json(['message' => 'Tournament team player removed successfully']);
    }
}
