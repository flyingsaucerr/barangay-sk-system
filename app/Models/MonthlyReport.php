<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonthlyReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'content',
        'month',
        'year',
        'category',
        'author',
        'upload_date',
        'tags',
        'status'
    ];

    protected $casts = [
        'tags' => 'array',
        'upload_date' => 'date',
        'year' => 'integer',
    ];

    protected $attributes = [
        'status' => 'published',
    ];
}