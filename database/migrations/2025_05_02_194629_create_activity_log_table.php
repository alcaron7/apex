<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateActivityLogTable extends Migration
{
    public function up()
    {
        $connection = config('activitylog.database_connection');
        $tableName = config('activitylog.table_name');

        if (!Schema::connection($connection)->hasTable($tableName)) {
            Schema::connection($connection)->create($tableName, function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('log_name')->nullable();
                $table->text('description')->nullable();

                // Use UUIDs for morphs
                $table->uuid('subject_id')->nullable();
                $table->string('subject_type')->nullable();
                $table->uuid('causer_id')->nullable();
                $table->string('causer_type')->nullable();

                $table->json('properties')->nullable();

                if (!Schema::hasColumn($table->getTable(), 'batch_uuid')) {
                    $table->uuid('batch_uuid')->nullable();
                }

                $table->timestamps();

                $table->index('log_name');
                $table->index(['subject_id', 'subject_type']);
                $table->index(['causer_id', 'causer_type']);
            });
        }
    }

    public function down()
    {
        Schema::connection(config('activitylog.database_connection'))
            ->dropIfExists(config('activitylog.table_name'));
    }
}
