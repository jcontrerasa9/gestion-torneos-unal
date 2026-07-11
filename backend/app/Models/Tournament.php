<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tournament extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'modality',
        'description',
        'start_date',
        'end_date',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function tournamentTeams()
    {
        return $this->hasMany(TournamentTeam::class);
    }

    public function matches()
    {
        return $this->hasMany(TournamentMatch::class);
    }

    public function suspensions()
    {
        return $this->hasMany(Suspension::class);
    }

    public function standings()
    {
        return $this->hasMany(Standing::class);
    }

    public function scorers()
    {
        return $this->hasMany(Scorer::class);
    }
}
