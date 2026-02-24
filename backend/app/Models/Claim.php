<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Item;

class Claim extends Model
{
    use HasFactory;
    protected $fillable = [
        'item_id',
        'claimer_id',
        'message',
        'location_detail',
        'datetime_detail',
        'proof_image_path',
        'status',
        'exchanged',
        'approved_by',
        'approved_at',
        'rejected_at',
        'meetup_confirmed_at',
    ];

    protected $casts = [
        'datetime_detail' => 'datetime',
    ];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function claimer()
    {
        return $this->belongsTo(User::class, 'claimer_id');
    }

    public function approvedByUser()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Admin-friendly accessors
    public function getStatusLabelAttribute()
    {
        return ucfirst($this->status);
    }

    public function getTransactionLabelAttribute()
    {
        if ($this->status === 'claimed') {
            return 'Completed';
        }

        if ($this->non_claimable) {
            return 'Admin Held (In-Person Only)';
        }

        return $this->claims()->exists() ? 'Claim Pending' : 'Available';
    }

    public function getExchangeBadgeAttribute()
    {
        return $this->exchanged ? 'success' : 'secondary';
    }
}
