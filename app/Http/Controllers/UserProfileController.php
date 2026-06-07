<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class UserProfileController extends Controller
{
    public function show(string $current_team, User $user): Response
    {
        return Inertia::render('users/show', [
            'member' => $user->only(['id', 'name', 'email']),
            'courses' => $user->courses()->latest('updated_at')->get(),
            'subscription' => $user->subscription?->load('plan'),
        ]);
    }
}
