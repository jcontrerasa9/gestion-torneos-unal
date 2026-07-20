<?php

namespace App\Http\Controllers\Statistics;

use App\Http\Controllers\Controller;
use App\Models\Scorer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScorerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
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
