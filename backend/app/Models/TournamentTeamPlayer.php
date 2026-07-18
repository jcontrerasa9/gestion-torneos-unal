<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TournamentTeamPlayer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tournament_id',
        'tournament_team_id',
        'player_id',
        'jersey_number',
        'position',
        'joined_at',
        'is_active',
    ];

    protected $attributes = [
        'is_active' => true,
    ];

    protected $casts = [
        'joined_at' => 'date',
        'is_active' => 'boolean',
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
