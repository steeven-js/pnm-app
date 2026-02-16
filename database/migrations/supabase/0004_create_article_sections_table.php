<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'supabase';

    public function up(): void
    {
        Schema::connection('supabase')->create('article_sections', function (Blueprint $table) {
            $table->id();
            $table->integer('article_id');
            $table->string('domain_name');
            $table->string('title');
            $table->text('content');
            $table->timestamps();
        });

        // Add vector column
        DB::connection('supabase')->statement('ALTER TABLE article_sections ADD COLUMN embedding vector(1536)');

        // Create IVFFlat index for cosine similarity search
        DB::connection('supabase')->statement('CREATE INDEX article_sections_embedding_idx ON article_sections USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)');
    }

    public function down(): void
    {
        Schema::connection('supabase')->dropIfExists('article_sections');
    }
};
