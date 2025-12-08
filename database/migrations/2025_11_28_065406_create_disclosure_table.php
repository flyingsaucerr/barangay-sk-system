<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('disclosures', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('date'); // Can be "January 2024", "Updated Monthly", "2024-2026", etc.
            $table->string('category'); // Governance, Operations, Youth Development, etc.
            $table->text('full_details'); // Full content for the detailed view
            $table->boolean('is_published')->default(true); // Control visibility on public side
            $table->timestamps();
        });

        // Optional: Add indexes for better performance
        Schema::table('disclosures', function (Blueprint $table) {
            $table->index('category');
            $table->index('is_published');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disclosures');
    }
};