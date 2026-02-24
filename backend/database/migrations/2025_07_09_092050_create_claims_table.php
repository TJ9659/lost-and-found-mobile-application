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
        Schema::create('claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')
                ->constrained()
                ->onDelete('cascade');
            $table->foreignId('claimer_id')
                ->constrained('users')
                ->onDelete('cascade');
            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->text('message');
            $table->string('location_detail');
            $table->dateTime('datetime_detail');
            $table->string('proof_image_path')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'rolled_back'])->default('pending');
            $table->boolean('exchanged')->default(false);
            $table->dateTime('exchanged_at')->nullable();
            $table->dateTime('approved_at')->nullable();
            $table->dateTime('rejected_at')->nullable();
            $table->dateTime('meetup_confirmed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('claims');
    }
};
