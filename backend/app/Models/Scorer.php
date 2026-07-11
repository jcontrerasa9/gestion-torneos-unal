<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Scorer extends Model
{
    use HasFactory;

    protected $fillable = [
        'tournament_id',
        'player_id',
        'goals',
    ];

    protected $casts = [
        'goals' => 'integer',
    ];

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function player()
    {
        return $this->belongsTo(User::class, 'player_id');
    }
}