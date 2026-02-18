<?php

use Database\Seeders\PortaSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\App;

return new class extends Migration
{
    public function up(): void
    {
        // Seed porta tables with training data for SQL Playground
        (new PortaSeeder)->run();
    }

    public function down(): void
    {
        // Data will be dropped with porta tables (cascade)
    }
};
