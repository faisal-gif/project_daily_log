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
        Schema::create('log_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('daily_log_id')
                ->constrained('daily_logs')
                ->onDelete('cascade');
            $table->time('time');
            $table->text('description');
            $table->text('notes')->nullable();
            $table->text('photo_url')->nullable();
            $table->text('photo_name')->nullable();
            $table->timestamps();

            $table->index('daily_log_id', 'idx_log_items_daily_log');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('log_items');
    }
};
