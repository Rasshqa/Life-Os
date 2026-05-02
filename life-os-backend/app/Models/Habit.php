<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Habit extends Model
{
    /** @use HasFactory<\Database\Factories\HabitFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'streak_count',
        'last_completed_date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
