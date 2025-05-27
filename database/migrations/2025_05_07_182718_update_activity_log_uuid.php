<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        if (DB::getDriverName() !== 'sqlite') {
            // Compatible avec MySQL, PostgreSQL
            Schema::table('activity_log', function (Blueprint $table) {
                $table->dropColumn('subject_id');
            });

            Schema::table('activity_log', function (Blueprint $table) {
                $table->uuid('subject_id')->nullable();
            });
        } else {
            // SQLite ne supporte pas dropColumn directement
            // Tu devrais recréer la table manuellement ici si nécessaire
            // ou utiliser doctrine/dbal avec une migration plus complexe
            // Pour l'instant, on saute
            echo "❗ Skip subject_id modification on SQLite (incompatible with dropColumn)\n";
        }
    }

    public function down()
    {
        if (DB::getDriverName() !== 'sqlite') {
            Schema::table('activity_log', function (Blueprint $table) {
                $table->dropColumn('subject_id');
            });

            Schema::table('activity_log', function (Blueprint $table) {
                $table->bigInteger('subject_id')->nullable();
            });
        } else {
            echo "❗ Skip rollback for subject_id on SQLite\n";
        }
    }
};
