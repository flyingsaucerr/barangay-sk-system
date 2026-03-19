<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFileFieldsToMonthlyReportsTable extends Migration
{
    public function up()
    {
        Schema::table('monthly_reports', function (Blueprint $table) {
            $table->string('title')->nullable()->change();
            $table->longText('content')->nullable()->change();

            $table->string('file_path')->nullable()->after('content');
            $table->string('file_name')->nullable()->after('file_path');
            $table->string('file_type')->nullable()->after('file_name');
            $table->integer('file_size')->nullable()->after('file_type');
        });
    }

    public function down()
    {
        Schema::table('monthly_reports', function (Blueprint $table) {
            $table->string('title')->nullable(false)->change();
            $table->longText('content')->nullable(false)->change();
            
            $table->dropColumn(['file_path', 'file_name', 'file_type', 'file_size']);
        });
    }
}