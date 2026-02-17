<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('domain_id')->constrained('knowledge_domains')->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('articles')->nullOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable();
            $table->string('level')->default('decouverte');
            $table->integer('sort_order')->default(0);
            $table->integer('reading_time_minutes')->default(5);
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            $table->unique(['domain_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
