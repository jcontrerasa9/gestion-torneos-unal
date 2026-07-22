<?php

namespace App\Console\Commands;

use App\Services\MatchStatusService;
use Illuminate\Console\Command;

class UpdateMatchStatuses extends Command
{
    protected $signature = 'matches:update-statuses';

    protected $description = 'Activate scheduled matches whose date and time have already arrived';

    public function handle(MatchStatusService $service): int
    {
        $updated = $service->activateScheduledMatches();

        $this->info("Updated {$updated} matches to en_juego.");

        return Command::SUCCESS;
    }
}
