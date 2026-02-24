<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'faculty',
        'profile_pic'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function sendEmailVerificationNotification()
    {
        $this->notify(new class extends VerifyEmail {
            protected function verificationUrl($notifiable)
            {
                return URL::temporarySignedRoute(
                    'api.verification.verify', // points to API route
                    Carbon::now()->addMinutes(60),
                    [
                        'id' => $notifiable->getKey(),
                        'hash' => sha1($notifiable->email),
                    ]
                );
            }
        });
    }


    public function reportedItems()
    {
        return $this->hasMany(Item::class, 'user_id');
    }

    public function claims()
    {
        return $this->hasMany(Claim::class, 'claimer_id');
    }
    public function getRoleLabelAttribute()
    {
        return ucfirst($this->role); // Admin / User
    }
}
