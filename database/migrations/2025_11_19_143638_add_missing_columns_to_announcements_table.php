<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->text('full_content')->after('content')->nullable();
            $table->date('date')->after('full_content')->default(now());
            $table->string('author')->after('date')->nullable();
            $table->enum('priority', ['low', 'medium', 'high'])->after('author')->default('medium');
        });
    }

    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->dropColumn(['full_content', 'date', 'author', 'priority']);
        });
    }
};