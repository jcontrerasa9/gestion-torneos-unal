<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlayerRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'tournament_team_id',
        'player_id',
        'jersey_number',
        'position',
        'status',
        'request_date',
        'approval_date',
    ];

    protected $casts = [
        'request_date' => 'date',
        'approval_date' => 'date',
    ];

    public function tournamentTeam()
    {
        return $this->belongsTo(TournamentTeam::class);
    }

    public function player()
    {
        return $this->belongsTo(User::class, 'player_id');
    }
}
