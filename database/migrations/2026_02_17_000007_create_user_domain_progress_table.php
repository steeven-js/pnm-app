<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_domain_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('domain_id')->constrained('knowledge_domains')->cascadeOnDelete();
            $table->integer('articles_read')->default(0);
            $table->integer('articles_total')->default(0);
            $table->decimal('completion_percentage', 5, 2)->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'domain_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_domain_progress');
    }
};
