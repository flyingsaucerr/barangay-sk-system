<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Accomplishment extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'location',
        'date_completed',
        'photo',
        'is_published'
    ];

    protected $casts = [
        'date_completed' => 'date',
        'is_published' => 'boolean'
    ];
}