<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KagawadActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'kagawad_id',
        'title',
        'date',
        'description'
    ];

    protected $casts = [
        'date' => 'date'
    ];

    public function kagawad()
    {
        return $this->belongsTo(Kagawad::class);
    }
}