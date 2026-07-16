<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TournamentMatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'tournament_id',
        'home_team_id',
        'away_team_id',
        'referee_id',
        'match_date',
        'match_time',
        'status',
        'home_score',
        'away_score',
        'observations',
    ];

    protected $attributes = [
        'status' => 'programado',
    ];

    protected $casts = [
        'match_date' => 'date',
        'match_time' => 'datetime:H:i',
    ];

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function homeTeam()
    {
        return $this->belongsTo(Team::class, 'home_team_id');
    }

    public function awayTeam()
    {
        return $this->belongsTo(Team::class, 'away_team_id');
    }

    public function referee()
    {
        return $this->belongsTo(User::class, 'referee_id');
    }

    public function events()
    {
        return $this->hasMany(MatchEvent::class, 'match_id');
    }
}
