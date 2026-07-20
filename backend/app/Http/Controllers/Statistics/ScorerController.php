<?php

namespace App\Http\Controllers\Statistics;

use App\Http\Controllers\Controller;
use App\Models\Scorer;
use App\Models\TournamentTeamPlayer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScorerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if ($request->has('tournament_id')) {
            $tid = (int) $request->input('tournament_id');
            foreach (TournamentTeamPlayer::where('tournament_id', $tid)->get()->unique('player_id') as $ttp) {
                Scorer::firstOrCreate(
                    ['tournament_id' => $tid, 'player_id' => $ttp->player_id],
                    ['goals' => 0]
                );
            }
        }

        $query = Scorer::with(['player', 'tournament'])
            ->orderByDesc('goals');

        if ($request->has('tournament_id')) {
            $query->where('tournament_id', $request->input('tournament_id'));
        }

        $scorers = $query->paginate(15);

        return response()->json([
            'message' => 'Scorers retrieved successfully',
            'data' => $scorers,
        ]);
    }
}
