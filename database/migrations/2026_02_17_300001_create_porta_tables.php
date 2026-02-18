<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ──────────────────────────────────────────────
        // Référentiels
        // ──────────────────────────────────────────────

        Schema::create('porta_operateur', function (Blueprint $table) {
            $table->string('code', 10)->primary();
            $table->string('nom', 100);
            $table->boolean('is_active')->default(true);
            $table->string('contact', 100)->nullable();
            $table->string('email', 100)->nullable();
        });

        Schema::create('porta_code_ticket', function (Blueprint $table) {
            $table->string('code', 10)->primary();
            $table->string('name', 50);
            $table->string('label', 200);
            $table->text('description')->nullable();
        });

        Schema::create('porta_code_reponse', function (Blueprint $table) {
            $table->string('code', 10)->primary();
            $table->string('type', 30); // erreur, annulation, eligibilite
            $table->string('label', 200);
        });

        Schema::create('porta_etat', function (Blueprint $table) {
            $table->id();
            $table->string('type', 30);       // normal, inverse, restitution
            $table->string('direction', 30);   // entrante, sortante, etrangere
            $table->string('classe', 30);      // saisi, encours, bascule, cloture, refuse, annule
            $table->string('label', 100);
            $table->boolean('is_begin')->default(false);
            $table->boolean('is_end')->default(false);
        });

        Schema::create('porta_transition', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etat_id_from')->constrained('porta_etat');
            $table->foreignId('etat_id_to')->constrained('porta_etat');
            $table->string('evenement', 100);
            $table->string('ticket_id_evenement', 10)->nullable();

            $table->foreign('ticket_id_evenement')->references('code')->on('porta_code_ticket');
        });

        Schema::create('porta_tranche', function (Blueprint $table) {
            $table->id();
            $table->string('operateur_id', 10);
            $table->string('debut', 15);
            $table->string('fin', 15);

            $table->foreign('operateur_id')->references('code')->on('porta_operateur');
        });

        Schema::create('porta_ferryday', function (Blueprint $table) {
            $table->date('ferryday')->primary();
            $table->boolean('is_active')->default(true);
        });

        // ──────────────────────────────────────────────
        // Données opérationnelles
        // ──────────────────────────────────────────────

        Schema::create('porta_dossier', function (Blueprint $table) {
            $table->id();
            $table->string('id_portage_multiple', 50)->nullable();
            $table->foreignId('etat_id_actuel')->nullable()->constrained('porta_etat');
            $table->string('operateur_id_origine', 10);
            $table->string('operateur_id_destination', 10);
            $table->timestamps();

            $table->foreign('operateur_id_origine')->references('code')->on('porta_operateur');
            $table->foreign('operateur_id_destination')->references('code')->on('porta_operateur');
        });

        Schema::create('porta_portage', function (Blueprint $table) {
            $table->id();
            $table->string('id_portage', 32)->unique(); // MD5
            $table->string('msisdn', 15);
            $table->foreignId('dossier_id')->constrained('porta_dossier');
            $table->date('date_portage');
            $table->foreignId('etat_id_actuel')->nullable()->constrained('porta_etat');
            $table->timestamps();
        });

        Schema::create('porta_msisdn', function (Blueprint $table) {
            $table->string('msisdn', 15)->primary();
            $table->foreignId('tranche_id')->nullable()->constrained('porta_tranche');
            $table->foreignId('portage_id_actuel')->nullable()->constrained('porta_portage');
            $table->string('operateur_id_actuel', 10);

            $table->foreign('operateur_id_actuel')->references('code')->on('porta_operateur');
        });

        Schema::create('porta_msisdn_historique', function (Blueprint $table) {
            $table->id();
            $table->string('msisdn', 15);
            $table->string('operateur_id', 10);
            $table->date('date_debut');
            $table->date('date_fin')->nullable();
            $table->foreignId('portage_id')->nullable()->constrained('porta_portage');

            $table->foreign('msisdn')->references('msisdn')->on('porta_msisdn');
            $table->foreign('operateur_id')->references('code')->on('porta_operateur');
        });

        Schema::create('porta_portage_historique', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portage_id')->constrained('porta_portage');
            $table->foreignId('transition_id')->nullable()->constrained('porta_transition');
            $table->foreignId('etat_id_from')->nullable()->constrained('porta_etat');
            $table->timestamp('date_debut');
            $table->timestamp('date_fin')->nullable();
        });

        Schema::create('porta_portage_data', function (Blueprint $table) {
            $table->foreignId('portage_id')->primary()->constrained('porta_portage');
            $table->string('temporary_msisdn', 15)->nullable();
            $table->timestamp('creation_date');
            $table->timestamp('change_date')->nullable();
        });

        Schema::create('porta_fichier', function (Blueprint $table) {
            $table->id();
            $table->string('filename', 200);
            $table->string('expediteur', 10);
            $table->string('destinataire', 10);
            $table->string('direction', 20); // entrant, sortant
            $table->string('type', 10);      // data, sync
            $table->date('date');
            $table->integer('sequence')->default(1);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('expediteur')->references('code')->on('porta_operateur');
            $table->foreign('destinataire')->references('code')->on('porta_operateur');
        });

        Schema::create('porta_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fichier_id')->constrained('porta_fichier');
            $table->string('code_ticket', 10);
            $table->string('msisdn', 15);
            $table->string('rio', 12)->nullable();
            $table->string('id_portage', 32)->nullable();
            $table->string('code_motif', 10)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('code_ticket')->references('code')->on('porta_code_ticket');
            $table->foreign('code_motif')->references('code')->on('porta_code_reponse');
        });

        Schema::create('porta_ack', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fichier_id')->constrained('porta_fichier');
            $table->string('code_erreur', 10)->nullable();
            $table->text('commentaire')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('code_erreur')->references('code')->on('porta_code_reponse');
        });

        Schema::create('porta_sync', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fichier_id')->constrained('porta_fichier');
            $table->string('operateur_receveur', 10);
            $table->string('msisdn', 15);
            $table->date('date_portage');

            $table->foreign('operateur_receveur')->references('code')->on('porta_operateur');
        });

        Schema::create('porta_sync_status', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sync_id')->constrained('porta_sync');
            $table->boolean('is_conflict')->default(false);
            $table->text('commentaire')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('porta_sync_status');
        Schema::dropIfExists('porta_sync');
        Schema::dropIfExists('porta_ack');
        Schema::dropIfExists('porta_data');
        Schema::dropIfExists('porta_fichier');
        Schema::dropIfExists('porta_portage_data');
        Schema::dropIfExists('porta_portage_historique');
        Schema::dropIfExists('porta_msisdn_historique');
        Schema::dropIfExists('porta_msisdn');
        Schema::dropIfExists('porta_portage');
        Schema::dropIfExists('porta_dossier');
        Schema::dropIfExists('porta_ferryday');
        Schema::dropIfExists('porta_tranche');
        Schema::dropIfExists('porta_transition');
        Schema::dropIfExists('porta_etat');
        Schema::dropIfExists('porta_code_reponse');
        Schema::dropIfExists('porta_code_ticket');
        Schema::dropIfExists('porta_operateur');
    }
};
