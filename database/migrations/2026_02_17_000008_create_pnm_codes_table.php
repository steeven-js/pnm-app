<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pnm_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('category');
            $table->string('subcategory')->nullable();
            $table->string('label');
            $table->text('description');
            $table->text('probable_cause')->nullable();
            $table->text('recommended_action')->nullable();
            $table->string('severity')->default('info');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pnm_codes');
    }
};
