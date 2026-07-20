<?php

namespace App\Services;

use App\Models\MatchEvent;
use App\Models\Suspension;
use App\Models\TournamentMatch;

class SuspensionService
{
    public function updateForEvent(MatchEvent $event): void
    {
        $match = TournamentMatch::find($event->match_id);

        if (! $match) {
            return;
        }

        $this->recalculateAutomaticSuspension($event->player_id, $match->tournament_id);
        $this->refreshStatuses($match->tournament_id, $event->player_id);
    }

    public function removeForEvent(MatchEvent $event): void
    {
        $match = TournamentMatch::find($event->match_id);

        if (! $match) {
            return;
        }

        $this->recalculateAutomaticSuspension($event->player_id, $match->tournament_id);
        $this->refreshStatuses($match->tournament_id, $event->player_id);
    }

    protected function recalculateAutomaticSuspension(int $playerId, int $tournamentId): void
    {
        $yellowCards = MatchEvent::where('event_type', 'tarjeta_amarilla')
            ->where('player_id', $playerId)
            ->whereHas('match', function ($q) use ($tournamentId): void {
                $q->where('tournament_id', $tournamentId);
            })
            ->count();

        $redCards = MatchEvent::where('event_type', 'tarjeta_roja')
            ->where('player_id', $playerId)
            ->whereHas('match', function ($q) use ($tournamentId): void {
                $q->where('tournament_id', $tournamentId);
            })
            ->count();

        $existingSuspension = Suspension::where('tournament_id', $tournamentId)
            ->where('player_id', $playerId)
            ->where('status', 'activa')
            ->whereNotNull('triggered_by_match_id')
            ->first();

        if ($yellowCards >= 3) {
            $triggerMatch = MatchEvent::where('event_type', 'tarjeta_amarilla')
                ->where('player_id', $playerId)
                ->whereHas('match', function ($q) use ($tournamentId): void {
                    $q->where('tournament_id', $tournamentId);
                })
                ->orderByDesc('id')
                ->first();

            if ($triggerMatch) {
                $this->upsertAutomaticSuspension(
                    $tournamentId,
                    $playerId,
                    $triggerMatch->match_id,
                    1,
                    '3 amarillas acumuladas en el torneo',
                    $existingSuspension
                );
            }
        } elseif ($redCards > 0) {
            $triggerMatch = MatchEvent::where('event_type', 'tarjeta_roja')
                ->where('player_id', $playerId)
                ->whereHas('match', function ($q) use ($tournamentId): void {
                    $q->where('tournament_id', $tournamentId);
                })
                ->orderByDesc('id')
                ->first();

            if ($triggerMatch) {
                $this->upsertAutomaticSuspension(
                    $tournamentId,
                    $playerId,
                    $triggerMatch->match_id,
                    2,
                    'Tarjeta roja directa',
                    $existingSuspension
                );
            }
        } else {
            Suspension::where('tournament_id', $tournamentId)
                ->where('player_id', $playerId)
                ->where('status', 'activa')
                ->whereNotNull('triggered_by_match_id')
                ->update(['status' => 'cancelada']);
        }
    }

    protected function upsertAutomaticSuspension(
        int $tournamentId,
        int $playerId,
        int $matchId,
        int $matchesSuspended,
        string $reason,
        ?Suspension $existing
    ): void {
        if ($existing && $existing->triggered_by_match_id === $matchId) {
            return;
        }

        if ($existing) {
            $existing->update(['status' => 'cancelada']);
        }

        Suspension::create([
            'tournament_id' => $tournamentId,
            'player_id' => $playerId,
            'reason' => $reason,
            'triggered_by_match_id' => $matchId,
            'matches_suspended' => $matchesSuspended,
            'status' => 'activa',
        ]);
    }

    public function refreshStatuses(int $tournamentId, int $playerId): void
    {
        $activeSuspensions = Suspension::where('tournament_id', $tournamentId)
            ->where('player_id', $playerId)
            ->where('status', 'activa')
            ->whereNotNull('triggered_by_match_id')
            ->get();

        foreach ($activeSuspensions as $suspension) {
            $triggerMatch = TournamentMatch::find($suspension->triggered_by_match_id);

            if (! $triggerMatch) {
                continue;
            }

            $completedMatches = TournamentMatch::where('tournament_id', $tournamentId)
                ->where('match_date', '>', $triggerMatch->match_date)
                ->where('status', 'finalizado')
                ->count();

            if ($completedMatches >= $suspension->matches_suspended) {
                $suspension->update(['status' => 'cumplida']);
            }
        }
    }
}
