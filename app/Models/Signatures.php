<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Signatures extends Model
{
    use HasFactory;

    protected $table = 'signatures';

    protected $fillable = [
        'user_id',
        'course_id',
        'signature',
    ];

    protected $casts = [
        'user_id' => 'string',
        'course_id' => 'string',
        'signature' => 'string',
    ];
}
