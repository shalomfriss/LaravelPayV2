<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;

test('guests are redirected to login', function () {
    $team = Team::factory()->create();

    $response = $this->get(route('knowledge-base', ['current_team' => $team->slug]));

    $response->assertRedirect(route('login'));
});

test('owners can access the knowledge base by default', function () {
    $owner = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $owner->switchTeam($team);

    $response = $this
        ->actingAs($owner)
        ->get(route('knowledge-base', ['current_team' => $team->slug]));

    $response->assertOk();
});

test('admins can access the knowledge base by default', function () {
    $owner = User::factory()->create();
    $admin = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($admin, ['role' => TeamRole::Admin->value]);
    $admin->switchTeam($team);

    $response = $this
        ->actingAs($admin)
        ->get(route('knowledge-base', ['current_team' => $team->slug]));

    $response->assertOk();
});

test('members cannot access the knowledge base by default', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($team);

    $response = $this
        ->actingAs($member)
        ->get(route('knowledge-base', ['current_team' => $team->slug]));

    $response->assertForbidden();
});

test('members with allow_knowledge_base permission can access the knowledge base', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, [
        'role' => TeamRole::Member->value,
        'allow_knowledge_base' => true,
    ]);
    $member->switchTeam($team);

    $response = $this
        ->actingAs($member)
        ->get(route('knowledge-base', ['current_team' => $team->slug]));

    $response->assertOk();
});

test('owners can update a members allow_knowledge_base permission', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, [
        'role' => TeamRole::Member->value,
        'allow_knowledge_base' => false,
    ]);

    $response = $this
        ->actingAs($owner)
        ->patch(route('teams.members.update', [$team, $member]), [
            'allow_knowledge_base' => true,
        ]);

    $response->assertRedirect(route('teams.edit', $team));

    expect($team->members()->where('user_id', $member->id)->first()->pivot->allow_knowledge_base)->toBeTrue();
});
