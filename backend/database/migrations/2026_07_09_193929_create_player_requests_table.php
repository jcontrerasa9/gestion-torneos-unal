<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('player_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_team_id')->constrained('tournament_teams')->cascadeOnDelete();
            $table->foreignId('player_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('jersey_number')->nullable();
            $table->string('position')->nullable();
            $table->string('status');
            $table->date('request_date');
            $table->date('approval_date')->nullable();
            $table->timestamps();

            $table->unique(['tournament_team_id', 'player_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('player_requests');
    }
};
