<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogItem extends Model
{
    protected $fillable = [
        'daily_log_id',
        'time',
        'description',
        'notes',
        'photo_url',
        'photo_name'
    ];

    /**
     * Relasi balik ke DailyLog (Many to One)
     */
    public function dailyLog(): BelongsTo
    {
        return $this->belongsTo(DailyLog::class, 'daily_log_id');
    }
}
