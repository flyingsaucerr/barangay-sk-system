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
        'file_path',
        'file_name',
        'file_type',
        'file_size',
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
        'upload_date' => 'datetime',
        'file_size' => 'integer'
    ];

    protected $appends = ['has_file'];

    public function getHasFileAttribute()
    {
        return !is_null($this->file_path);
    }
}