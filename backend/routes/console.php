<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('matches:update-statuses')->everyMinute();
