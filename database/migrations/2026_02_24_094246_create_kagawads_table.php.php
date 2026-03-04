<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('kagawads', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('position');
            $table->string('photo')->nullable();
            $table->text('bio')->nullable();
            $table->string('contact')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->string('date_started')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
        });

        Schema::create('kagawad_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kagawad_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->date('date');
            $table->text('description');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('kagawad_activities');
        Schema::dropIfExists('kagawads');
    }
};