<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('file_printing_requests', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_number')->unique();
            $table->string('requester_name');
            $table->string('contact_number');
            $table->string('email')->nullable();
            $table->text('notes')->nullable();
            $table->integer('copies')->default(1);
            $table->enum('status', ['pending', 'processing', 'ready', 'completed', 'cancelled'])->default('pending');
            $table->text('files')->nullable(); // JSON array of file info
            $table->text('admin_notes')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('ready_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes
            $table->index('tracking_number');
            $table->index('status');
            $table->index('requester_name');
            $table->index('contact_number');
            $table->index('submitted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('file_printing_requests');
    }
};