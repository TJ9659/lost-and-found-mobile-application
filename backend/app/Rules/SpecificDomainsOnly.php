<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class SpecificDomainsOnly implements ValidationRule
{
    protected $allowedDomains = [
        '1utar.my',
        'utar.edu.my',
    ];

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $domain = substr(strrchr($value, "@"), 1);
        if (!in_array(strtolower($domain), $this->allowedDomains)) {
            $fail($this->message());
        }
    }

    public function message()
    {
        return 'We appreciate your interest in joining, however at the moment we only offer this service to those in UTAR.';
    }
}
