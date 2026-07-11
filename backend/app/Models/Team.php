<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'captain_id',
        'name',
        'logo',
    ];

    public function captain()
    {
        return $this->belongsTo(User::class, 'captain_id');
    }

    public function tournamentTeams()
    {
        return $this->hasMany(TournamentTeam::class);
    }
}
