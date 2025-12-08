<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kkid_profiles', function (Blueprint $table) {
            // Check if columns don't exist before adding
            if (!Schema::hasColumn('kkid_profiles', 'created_by')) {
                $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null')->after('approved_date');
            }
            
            if (!Schema::hasColumn('kkid_profiles', 'updated_by')) {
                $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null')->after('created_by');
            }
            
            if (!Schema::hasColumn('kkid_profiles', 'deleted_at')) {
                $table->softDeletes(); // Adds deleted_at column
            }
            
            // Update column lengths if needed
            $table->string('emergency_contact_number', 20)->nullable()->change();
            $table->string('emergency_contact_relationship', 100)->nullable()->change();
            $table->string('contact_number', 20)->nullable()->change();
            $table->string('precinct_number', 50)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('kkid_profiles', function (Blueprint $table) {
            // Drop foreign keys first
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
            
            // Then drop columns
            $table->dropColumn(['created_by', 'updated_by', 'deleted_at']);
            
            // Revert column lengths (optional)
            $table->string('emergency_contact_number')->change();
            $table->string('emergency_contact_relationship')->change();
            $table->string('contact_number')->change();
            $table->string('precinct_number')->change();
        });
    }
};