<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudyNote extends Model
{
    /** @use HasFactory<\Database\Factories\StudyNoteFactory> */
    use HasFactory;

    protected $fillable = [
        'topic',
        'content',
        'tags',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
