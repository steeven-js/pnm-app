<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'supabase';

    public function up(): void
    {
        Schema::connection('supabase')->create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('source_file')->unique();
            $table->string('source_type');
            $table->integer('total_sections')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('supabase')->dropIfExists('documents');
    }
};
