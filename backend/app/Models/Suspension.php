<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Suspension extends Model
{
    use HasFactory;

    protected $fillable = [
        'tournament_id',
        'player_id',
        'reason',
        'triggered_by_match_id',
        'matches_suspended',
        'status',
    ];

    protected $casts = [
        'matches_suspended' => 'integer',
    ];

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function player()
    {
        return $this->belongsTo(User::class, 'player_id');
    }

    public function triggeredByMatch()
    {
        return $this->belongsTo(TournamentMatch::class, 'triggered_by_match_id');
    }
}
