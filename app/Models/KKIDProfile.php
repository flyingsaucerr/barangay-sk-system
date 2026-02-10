<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class KKIDProfile extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'kkid_profiles';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'full_name',
        'address',
        'birthday',
        'gender',
        'emergency_contact_name',
        'emergency_contact_address',
        'emergency_contact_birthday',
        'emergency_contact_number',
        'emergency_contact_relationship',
        'civil_status',
        'kkid_number',
        'validity_date',
        'youth_organization',
        'email',
        'facebook_account',
        'contact_number',
        'is_voter',
        'precinct_number',
        'status',
        'application_date',
        'approved_date',
        'created_by',
        'updated_by',
        'photo_url'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'deleted_at'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'birthday' => 'date',
        'emergency_contact_birthday' => 'date',
        'validity_date' => 'date',
        'application_date' => 'date',
        'approved_date' => 'date',
        'is_voter' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    /**
     * The model's default values for attributes.
     *
     * @var array
     */
    protected $attributes = [
        'status' => 'pending',
        'is_voter' => false
    ];

    /**
     * Get the user who created this profile.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this profile.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}