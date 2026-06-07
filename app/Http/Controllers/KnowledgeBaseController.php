<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KnowledgeBaseController extends Controller
{
    /**
     * Display the Knowledge Base page.
     */
    public function index(string $current_team, Request $request): Response
    {
        $user = $request->user();

        $team = Team::where('slug', $current_team)->firstOrFail();

        abort_unless($user->canAccessKnowledgeBase($team), 403, __('You do not have access to the Knowledge Base.'));

        return Inertia::render('knowledge-base/index', [
            'team' => [
                'id' => $team->id,
                'name' => $team->name,
                'slug' => $team->slug,
            ],
        ]);
    }
}
