<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monitoring_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('event_type', 50);
            $table->date('event_date');
            $table->string('status', 20)->default('pending');
            $table->text('notes')->nullable();
            $table->json('checked_items')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->unique(['event_type', 'event_date', 'user_id']);
            $table->index('event_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monitoring_events');
    }
};
