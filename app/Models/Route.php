<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Route extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'from_name',
        'to_name',
        'from_lat',
        'from_lng',
        'to_lat',
        'to_lng',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
