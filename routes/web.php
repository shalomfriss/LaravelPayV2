<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\KnowledgeBaseController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Controllers\TrainingController;
use App\Http\Controllers\UserProfileController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::inertia('dashboard', 'dashboard')->name('dashboard');

        Route::get('knowledge-base', [KnowledgeBaseController::class, 'index'])->name('knowledge-base');

        Route::get('training', [TrainingController::class, 'index'])->name('training');
        Route::get('training/{course}', [TrainingController::class, 'show'])->name('training.show');
        Route::get('training/{course}/topic/{topic}', [TrainingController::class, 'showTopic'])->name('training.showTopic');
        Route::post('training/assign-training', [TrainingController::class, 'assignTraining'])
            ->middleware('isAdmin')
            ->name('training.assign');
        Route::post('training/register-signature', [TrainingController::class, 'registerSignature'])->name('training.signature');
        Route::get('training/users/{user}/courses', [TrainingController::class, 'getUserCourses'])
            ->middleware('isAdmin')
            ->name('training.users.courses');
        Route::post('training/users/{user}/courses/{courseNumber}/complete', [TrainingController::class, 'completeCourse'])
            ->middleware('isAdmin')
            ->name('training.complete');

        Route::get('users/{user}', [UserProfileController::class, 'show'])
            ->middleware('isAdmin')
            ->name('users.show');
    });

Route::middleware(['auth'])->group(function () {
    Route::get('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::get('/home', [HomeController::class, 'index'])->name('payment.home');

    Route::post('/payments/pay', [PaymentController::class, 'pay'])->name('pay');
    Route::get('/payments/approval', [PaymentController::class, 'approval'])->name('approval');
    Route::get('/payments/cancelled', [PaymentController::class, 'cancelled'])->name('cancelled');
});

Route::middleware(['auth', 'verified', 'isAdmin', 'unsubscribed'])->group(function () {
    Route::prefix('subscribe')
        ->name('subscribe.')
        ->group(function () {
            Route::get('/', [SubscriptionController::class, 'show'])->name('show');
            Route::post('/', [SubscriptionController::class, 'store'])->name('store');
            Route::get('/approval', [SubscriptionController::class, 'approval'])->name('approval');
            Route::get('/cancelled', [SubscriptionController::class, 'cancelled'])->name('cancelled');
        });
});

require __DIR__.'/settings.php';
