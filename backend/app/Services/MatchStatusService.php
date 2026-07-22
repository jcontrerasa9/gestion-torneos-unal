<?php

namespace App\Services;

use App\Models\TournamentMatch;

class MatchStatusService
{
    public function activateScheduledMatches(): int
    {
        $now = now();

        return TournamentMatch::where('status', 'programado')
            ->whereRaw('CONCAT(match_date, " ", match_time) <= ?', [$now->format('Y-m-d H:i:s')])
            ->update(['status' => 'en_juego']);
    }
}
