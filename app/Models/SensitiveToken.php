<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SensitiveToken extends Model
{
    protected $fillable = [
        'token',
        'real_value',
        'category',
        'description',
    ];
}
