<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TournamentTeam extends Model
{
    use HasFactory;

    protected $fillable = [
        'tournament_id',
        'team_id',
        'status',
        'request_date',
        'approval_date',
    ];

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function playerRequests()
    {
        return $this->hasMany(PlayerRequest::class);
    }

    public function players()
    {
        return $this->hasMany(TournamentTeamPlayer::class);
    }

    public function standings()
    {
        return $this->hasOne(Standing::class);
    }
}
