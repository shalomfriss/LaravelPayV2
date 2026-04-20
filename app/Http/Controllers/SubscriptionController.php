<?php

namespace App\Http\Controllers;

use App\Models\PaymentPlatform;
use App\Models\Plan;
use App\Models\Subscription;
use App\Resolvers\PaymentPlatformResolver;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class SubscriptionController extends Controller
{
    public function __construct(protected PaymentPlatformResolver $paymentPlatformResolver)
    {
        //
    }

    public function show(): Response
    {
        return Inertia::render('subscribe', [
            'plans' => Plan::all(),
            'paymentPlatforms' => PaymentPlatform::where('subscriptions_enabled', true)->get(),
            'stripeKey' => config('services.stripe.key'),
        ]);
    }

    public function store(Request $request): SymfonyResponse
    {
        $request->validate([
            'plan' => ['required', 'exists:plans,slug'],
            'payment_platform' => ['required', 'exists:payment_platforms,id'],
        ]);

        $paymentPlatform = $this->paymentPlatformResolver->resolveService($request->payment_platform);

        session()->put('subscriptionPlatformId', $request->payment_platform);

        return $paymentPlatform->handleSubscription($request);
    }

    public function approval(Request $request): RedirectResponse
    {
        $request->validate([
            'plan' => ['required', 'exists:plans,slug'],
        ]);

        if (! session()->has('subscriptionPlatformId')) {
            return redirect()
                ->route('subscribe.show')
                ->withErrors('We cannot retrieve your payment platform. Try again please.');
        }

        $paymentPlatform = $this->paymentPlatformResolver->resolveService(session()->get('subscriptionPlatformId'));

        if (! $paymentPlatform->validateSubscription($request)) {
            return redirect()
                ->route('subscribe.show')
                ->withErrors('We cannot check your subscription. Try again.');
        }

        $plan = Plan::where('slug', $request->plan)->firstOrFail();
        $user = $request->user();

        Subscription::updateOrCreate(
            ['user_id' => $user->id],
            [
                'active_until' => now()->addDays($plan->duration_in_days),
                'plan_id' => $plan->id,
            ],
        );

        return redirect()
            ->route('home')
            ->with('success', "Thanks, {$user->name}. You have a {$plan->slug} subscription.");
    }

    public function cancelled(): RedirectResponse
    {
        return redirect()->route('subscribe.show')->withErrors('You cancelled. Come back when you are ready.');
    }
}
