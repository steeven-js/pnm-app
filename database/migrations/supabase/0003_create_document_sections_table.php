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
        Schema::connection('supabase')->create('document_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->integer('section_index');
            $table->string('title')->nullable();
            $table->text('content');
            $table->jsonb('metadata')->default('{}');
            $table->timestamps();
        });

        // Add vector column (not supported by Laravel schema builder)
        DB::connection('supabase')->statement('ALTER TABLE document_sections ADD COLUMN embedding vector(1536)');

        // Create IVFFlat index for cosine similarity search
        DB::connection('supabase')->statement('CREATE INDEX document_sections_embedding_idx ON document_sections USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)');
    }

    public function down(): void
    {
        Schema::connection('supabase')->dropIfExists('document_sections');
    }
};
