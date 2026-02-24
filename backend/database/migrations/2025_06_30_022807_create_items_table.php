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
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('non_claimable')->default(false);
            $table->enum('status', ['lost', 'found']);
            $table->enum('building', ['KA', 'KB']);
            $table->string('location');
            $table->string('floor');
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('image_path');
            $table->json('tags')->nullable(); // AI tags like ["bottle", "red"]
            $table->boolean('in_transaction')->default(false);
            $table->boolean('is_claimed')->default(false);
            $table->integer('claimed_by')->nullable();
            $table->boolean('is_exchanged')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
