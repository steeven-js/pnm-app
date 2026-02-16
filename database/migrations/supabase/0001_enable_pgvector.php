<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    protected $connection = 'supabase';

    public function up(): void
    {
        DB::connection('supabase')->statement('CREATE EXTENSION IF NOT EXISTS vector');
    }

    public function down(): void
    {
        DB::connection('supabase')->statement('DROP EXTENSION IF EXISTS vector');
    }
};
