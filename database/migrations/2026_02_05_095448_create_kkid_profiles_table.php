<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kkid_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->text('address');
            $table->date('birthday');
            $table->enum('gender', ['Male', 'Female', 'Other']);
            $table->string('emergency_contact_name');
            $table->text('emergency_contact_address');
            $table->date('emergency_contact_birthday');
            $table->string('emergency_contact_number');
            $table->string('emergency_contact_relationship');
            $table->enum('civil_status', ['Single', 'Married', 'Widowed', 'Separated']);
            $table->string('kkid_number')->unique();
            $table->date('validity_date');
            $table->string('youth_organization')->nullable();
            $table->string('email')->nullable();
            $table->string('facebook_account')->nullable();
            $table->string('contact_number');
            $table->boolean('is_voter')->default(false);
            $table->string('precinct_number')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->date('application_date');
            $table->date('approved_date')->nullable();
            $table->string('photo_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kkid_profiles');
    }
};