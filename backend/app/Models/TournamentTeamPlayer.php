<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TournamentTeamPlayer extends Model
{
    use HasFactory;

    protected $fillable = [
        'tournament_id',
        'tournament_team_id',
        'player_id',
        'jersey_number',
        'position',
        'joined_at',
    ];

    protected $casts = [
        'joined_at' => 'date',
    ];

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function tournamentTeam()
    {
        return $this->belongsTo(TournamentTeam::class);
    }

    public function player()
    {
        return $this->belongsTo(User::class, 'player_id');
    }
}
