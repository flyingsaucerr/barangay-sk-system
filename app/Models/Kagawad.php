<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kagawad extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'position',
        'photo',
        'bio',
        'contact',
        'email',
        'address',
        'date_started',
        'is_featured'
    ];

    protected $casts = [
        'is_featured' => 'boolean'
    ];

    public function activities()
    {
        return $this->hasMany(KagawadActivity::class);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}