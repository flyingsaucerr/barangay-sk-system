<?php
// database/migrations/xxxx_add_project_id_to_accomplishments_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddProjectIdToAccomplishmentsTable extends Migration
{
    public function up()
    {
        Schema::table('accomplishments', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable()->constrained()->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('accomplishments', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropColumn('project_id');
        });
    }
}