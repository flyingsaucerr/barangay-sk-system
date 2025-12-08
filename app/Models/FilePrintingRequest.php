<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FilePrintingRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'file_printing_requests';

    protected $fillable = [
        'tracking_number',
        'requester_name',
        'contact_number',
        'email',
        'notes',
        'copies',
        'status',
        'files',
        'admin_notes',
        'submitted_at',
        'processed_at',
        'ready_at',
        'completed_at',
        'processed_by'
    ];

    protected $casts = [
        'files' => 'array',
        'submitted_at' => 'datetime',
        'processed_at' => 'datetime',
        'ready_at' => 'datetime',
        'completed_at' => 'datetime',
        'copies' => 'integer'
    ];

    protected $attributes = [
        'status' => 'pending',
        'copies' => 1
    ];

    /**
     * Get the user who processed this request.
     */
    public function processor()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Generate a unique tracking number.
     */
    public static function generateTrackingNumber()
    {
        $prefix = 'PRINT-';
        $year = date('Y');
        $month = date('m');
        
        do {
            $random = strtoupper(substr(md5(uniqid()), 0, 8));
            $number = "{$prefix}{$year}{$month}-{$random}";
        } while (static::where('tracking_number', $number)->exists());
        
        return $number;
    }

    /**
     * Get status with color for UI.
     */
    public function getStatusColorAttribute()
    {
        $colors = [
            'pending' => 'bg-yellow-100 text-yellow-800',
            'processing' => 'bg-blue-100 text-blue-800',
            'ready' => 'bg-green-100 text-green-800',
            'completed' => 'bg-gray-100 text-gray-800',
            'cancelled' => 'bg-red-100 text-red-800'
        ];
        
        return $colors[$this->status] ?? 'bg-gray-100 text-gray-800';
    }

    /**
     * Get status display text.
     */
    public function getStatusDisplayAttribute()
    {
        $statuses = [
            'pending' => 'Pending',
            'processing' => 'Processing',
            'ready' => 'Ready for Pickup',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled'
        ];
        
        return $statuses[$this->status] ?? ucfirst($this->status);
    }
}