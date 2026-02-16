<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'supabase';

    public function up(): void
    {
        Schema::connection('supabase')->table('documents', function (Blueprint $table) {
            $table->text('description')->nullable()->after('title');
            $table->string('document_type')->default('document')->after('source_type');
        });

        Schema::connection('supabase')->table('document_sections', function (Blueprint $table) {
            $table->integer('level')->default(0)->after('section_index');
            $table->foreignId('parent_section_id')->nullable()->after('level')
                ->constrained('document_sections')->nullOnDelete();
            $table->string('section_path')->nullable()->after('parent_section_id');
        });

        Schema::connection('supabase')->table('article_sections', function (Blueprint $table) {
            $table->integer('level')->default(0)->after('article_id');
            $table->string('section_path')->nullable()->after('level');
        });
    }

    public function down(): void
    {
        Schema::connection('supabase')->table('article_sections', function (Blueprint $table) {
            $table->dropColumn(['level', 'section_path']);
        });

        Schema::connection('supabase')->table('document_sections', function (Blueprint $table) {
            $table->dropForeign(['parent_section_id']);
            $table->dropColumn(['level', 'parent_section_id', 'section_path']);
        });

        Schema::connection('supabase')->table('documents', function (Blueprint $table) {
            $table->dropColumn(['description', 'document_type']);
        });
    }
};
