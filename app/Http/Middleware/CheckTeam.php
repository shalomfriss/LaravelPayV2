<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// check that the request user is in the current users team.  This is used in conjunction with isAdmin to view user profiles.
//  Generally users should not be able to see other users profiles.
class CheckTeam
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $currentUserTeamId = auth()->user()->current_team_id ?? null;
        if ($currentUserTeamId == null) {
            return redirect()->route('home');
        }

        $requestedUserId = $request->route('user')->id ?? null;
        if ($requestedUserId == null) {
            return redirect()->route('home');
        }

        $requestedUserTeamIds = User::find($requestedUserId)->teams()->pluck('teams.id')->toArray();
        if (! in_array($currentUserTeamId, $requestedUserTeamIds)) {
            return redirect()->route('home');
        }

        return $next($request);
    }
}
