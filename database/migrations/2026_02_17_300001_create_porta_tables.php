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
            $table->integer('code')->primary();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_actor')->default(true);
            $table->string('nom', 32);
            $table->string('contact', 150)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('fax', 10)->nullable();
            $table->string('directory', 255)->nullable();
            $table->text('comment')->nullable();
        });

        Schema::create('porta_code_ticket', function (Blueprint $table) {
            $table->integer('code')->primary();
            $table->string('description', 255);
        });

        Schema::create('porta_code_reponse', function (Blueprint $table) {
            $table->integer('code')->primary();
            $table->string('procedure', 255);
            $table->string('description', 255);
        });

        Schema::create('porta_etat', function (Blueprint $table) {
            $table->integer('id')->primary();
            $table->string('etat_name', 45);
            $table->string('etat_code', 45)->nullable();
        });

        Schema::create('porta_transition', function (Blueprint $table) {
            $table->id();
            $table->integer('code');
            $table->string('etat_initial', 45);
            $table->string('etat_final', 45);
            $table->string('description', 255);
        });

        Schema::create('porta_tranche', function (Blueprint $table) {
            $table->id();
            $table->boolean('is_active')->default(true);
            $table->integer('operateur_id');
            $table->string('debut', 10);
            $table->string('fin', 10);

            $table->foreign('operateur_id')->references('code')->on('porta_operateur');
        });

        Schema::create('porta_ferryday', function (Blueprint $table) {
            $table->date('ferryday')->primary();
            $table->timestamp('creation')->useCurrent();
            $table->boolean('is_active')->default(true);
        });

        // ──────────────────────────────────────────────
        // Données opérationnelles
        // ──────────────────────────────────────────────

        Schema::create('porta_dossier', function (Blueprint $table) {
            $table->id();
            $table->string('portage_msisdn', 45)->nullable();
            $table->string('portage_rio', 45)->nullable();
            $table->string('portage_nom', 45)->nullable();
            $table->string('portage_prenom', 45)->nullable();
            $table->string('portage_type_demande', 45)->nullable();
            $table->dateTime('portage_date_souhaitee')->nullable();
            $table->integer('portage_etat')->nullable();
            $table->dateTime('portage_date_creation')->nullable();
            $table->integer('opr_e_actuel')->nullable();
            $table->integer('opr_e_d_attribution')->nullable();
            $table->integer('operateur_id_donneur');
            $table->integer('operateur_id_receveur');
            $table->text('remarque')->nullable();

            $table->foreign('portage_etat')->references('id')->on('porta_etat');
            $table->foreign('operateur_id_donneur')->references('code')->on('porta_operateur');
            $table->foreign('operateur_id_receveur')->references('code')->on('porta_operateur');
        });

        Schema::create('porta_portage', function (Blueprint $table) {
            $table->id();
            $table->string('portage_msisdn', 45);
            $table->string('portage_rio', 45)->nullable();
            $table->string('portage_nom', 45)->nullable();
            $table->string('portage_prenom', 45)->nullable();
            $table->string('portage_type_demande', 45)->nullable();
            $table->dateTime('portage_date_souhaitee');
            $table->integer('portage_etat')->nullable();
            $table->dateTime('portage_date_creation');
            $table->integer('opr_e_actuel');
            $table->integer('opr_e_d_attribution')->nullable();
            $table->foreignId('dossier_id')->nullable()->constrained('porta_dossier');

            $table->foreign('portage_etat')->references('id')->on('porta_etat');
            $table->foreign('opr_e_actuel')->references('code')->on('porta_operateur');
        });

        Schema::create('porta_msisdn', function (Blueprint $table) {
            $table->string('msisdn', 10)->primary();
            $table->foreignId('tranche_id')->nullable()->constrained('porta_tranche');
            $table->foreignId('portage_id_actuel')->nullable()->constrained('porta_portage');
            $table->integer('operateur_id_actuel');

            $table->foreign('operateur_id_actuel')->references('code')->on('porta_operateur');
        });

        Schema::create('porta_msisdn_historique', function (Blueprint $table) {
            $table->id();
            $table->string('msisdn', 10);
            $table->dateTime('date');

            $table->foreign('msisdn')->references('msisdn')->on('porta_msisdn');
        });

        Schema::create('porta_portage_historique', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_portage')->constrained('porta_portage');
            $table->string('etat', 45);
            $table->dateTime('date');
            $table->string('commentaire', 255)->nullable();
        });

        Schema::create('porta_portage_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_portage')->constrained('porta_portage');
            $table->integer('code_ticket');
            $table->integer('code_reponse')->nullable();
            $table->dateTime('date');
            $table->dateTime('date_traitement')->nullable();
            $table->text('commentaire')->nullable();
            $table->string('etat', 45)->nullable();
            $table->integer('operateur_emetteur')->nullable();
            $table->integer('operateur_recepteur')->nullable();
            $table->integer('transition_id')->nullable();
            $table->text('remarque')->nullable();

            $table->foreign('code_ticket')->references('code')->on('porta_code_ticket');
            $table->foreign('code_reponse')->references('code')->on('porta_code_reponse');
        });

        Schema::create('porta_fichier', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 255);
            $table->string('type', 45);
            $table->dateTime('date_creation');
            $table->dateTime('date_import')->nullable();
            $table->integer('taille')->nullable();
            $table->string('checksum', 255)->nullable();
            $table->string('repertoire', 255)->nullable();
            $table->integer('expediteur');
            $table->integer('destinataire');

            $table->foreign('expediteur')->references('code')->on('porta_operateur');
            $table->foreign('destinataire')->references('code')->on('porta_operateur');
        });

        Schema::create('porta_data', function (Blueprint $table) {
            $table->id();
            $table->string('msisdn', 10);
            $table->string('rio', 20)->nullable();
            $table->string('nom', 255)->nullable();
            $table->string('prenom', 255)->nullable();
            $table->dateTime('date_demande')->nullable();
            $table->dateTime('date_demande_portage')->nullable();
            $table->dateTime('date_bascule_portage')->nullable();
            $table->dateTime('date_verification')->nullable();
            $table->integer('id_portage_fini')->nullable();
        });

        Schema::create('porta_ack', function (Blueprint $table) {
            $table->id();
            $table->dateTime('date');
            $table->string('type', 45)->nullable();
            $table->string('file_name', 255);
            $table->text('content')->nullable();
        });

        Schema::create('porta_sync', function (Blueprint $table) {
            $table->id();
            $table->string('msisdn', 45);
            $table->dateTime('date');
            $table->integer('operateur_id');
            $table->integer('sync_status')->nullable();
            $table->dateTime('date_portage')->nullable();

            $table->foreign('operateur_id')->references('code')->on('porta_operateur');
        });

        Schema::create('porta_sync_status', function (Blueprint $table) {
            $table->id();
            $table->string('statut_name', 45);
            $table->string('statut_code', 45)->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('commentaire', 255)->nullable();
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
