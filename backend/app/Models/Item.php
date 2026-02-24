<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Claim;

class Item extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'non_claimable',
        'status',
        'building',
        'floor',
        'location',
        'category_id',
        'image_path',
        'tags',
        'image_text',
        'in_transaction',
        'is_claimed',
        'claimed_by',
        'is_exchanged',
    ];

    protected $casts = [
        'tags' => 'array',
    ];

    // Original relationship for mobile API
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Alias for admin panel clarity
    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function claims()
    {
        return $this->hasMany(Claim::class);
    }


    // Admin-friendly accessors
    public function getOwnerNameAttribute()
    {
        return $this->owner->name ?? 'N/A';
    }

    public function getStatusLabelAttribute()
    {
        return ucfirst($this->status);
    }

    public function getTransactionLabelAttribute()
    {
        if ($this->is_exchanged) return 'Exchanged';
        if ($this->is_claimed) return 'Claimed';
        if ($this->in_transaction) return 'In Transaction';
        return 'Available';
    }

    public function getTransactionBadgeAttribute()
    {
        if ($this->is_exchanged) return 'danger';
        if ($this->is_claimed) return 'warning';
        if ($this->in_transaction) return 'info';
        return 'success';
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
