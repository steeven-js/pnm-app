<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_chunks', function (Blueprint $table) {
            $table->id();
            $table->string('source_file');
            $table->string('source_type')->nullable();
            $table->integer('chunk_index')->default(0);
            $table->string('heading')->nullable();
            $table->text('content');
            $table->timestamps();
        });

        // PostgreSQL-only: tsvector, GIN index, and trigger for full-text search
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE document_chunks ADD COLUMN searchable tsvector");
            DB::statement("CREATE INDEX document_chunks_searchable_idx ON document_chunks USING GIN(searchable)");

            DB::statement("
                CREATE OR REPLACE FUNCTION document_chunks_searchable_update() RETURNS trigger AS \$\$
                BEGIN
                    NEW.searchable := to_tsvector('french', coalesce(NEW.heading, '') || ' ' || coalesce(NEW.content, ''));
                    RETURN NEW;
                END
                \$\$ LANGUAGE plpgsql;
            ");

            DB::statement("
                DROP TRIGGER IF EXISTS document_chunks_searchable_trigger ON document_chunks;
            ");
            DB::statement("
                CREATE TRIGGER document_chunks_searchable_trigger
                BEFORE INSERT OR UPDATE ON document_chunks
                FOR EACH ROW EXECUTE FUNCTION document_chunks_searchable_update();
            ");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('DROP TRIGGER IF EXISTS document_chunks_searchable_trigger ON document_chunks');
            DB::statement('DROP FUNCTION IF EXISTS document_chunks_searchable_update()');
        }
        Schema::dropIfExists('document_chunks');
    }
};
