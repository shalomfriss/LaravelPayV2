<?php

namespace App\Http\Controllers;

use App\Models\Currency;
use App\Models\PaymentPlatform;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('home', [
            'currencies' => Currency::orderBy('iso')->get(),
            'paymentPlatforms' => PaymentPlatform::orderBy('name')->get(),
            'hasActiveSubscription' => $request->user()?->hasActiveSubscription() ?? false,
        ]);
    }
}
