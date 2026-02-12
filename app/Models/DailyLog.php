<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DailyLog extends Model
{
    protected $fillable = ['date', 'user_id'];

    protected $casts = [
        'date' => 'date',
    ];


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke LogItem (One to Many)
     */
    public function items(): HasMany
    {
        return $this->hasMany(LogItem::class, 'daily_log_id');
    }
}
