<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('campaigns:close-ended')->everyFiveMinutes()->withoutOverlapping();
Schedule::command('payments:reconcile --fail-on-stale')->everyTenMinutes()->withoutOverlapping();
