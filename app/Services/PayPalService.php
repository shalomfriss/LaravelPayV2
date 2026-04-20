<?php

namespace App\Services;

use App\Traits\ConsumesExternalServices;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PayPalService
{
    use ConsumesExternalServices;

    protected $baseUri;

    protected $clientId;

    protected $clientSecret;

    protected $plans;

    public function __construct()
    {
        $this->baseUri = config('services.paypal.base_uri');
        $this->clientId = config('services.paypal.client_id');
        $this->clientSecret = config('services.paypal.client_secret');
        $this->plans = config('services.paypal.plans');
    }

    protected ?string $accessToken = null;

    public function resolveAuthorization(&$queryParams, &$formParams, &$headers)
    {
        $headers['Authorization'] = $this->resolveAccessToken();
    }

    public function decodeResponse($response)
    {
        return json_decode($response);
    }

    public function resolveAccessToken()
    {
        $this->assertConfigured();

        if ($this->accessToken !== null) {
            return "Bearer {$this->accessToken}";
        }

        $credentials = base64_encode("{$this->clientId}:{$this->clientSecret}");
        $client = new Client([
            'base_uri' => $this->baseUri,
        ]);

        $response = $client->request('POST', '/v1/oauth2/token', [
            'headers' => [
                'Authorization' => "Basic {$credentials}",
                'Accept' => 'application/json',
            ],
            'form_params' => [
                'grant_type' => 'client_credentials',
            ],
        ]);

        $payload = json_decode($response->getBody()->getContents());
        $this->accessToken = $payload->access_token ?? null;

        if ($this->accessToken === null) {
            throw ValidationException::withMessages([
                'payment_platform' => 'PayPal did not return an access token. Check the configured sandbox credentials.',
            ]);
        }

        return "Bearer {$this->accessToken}";
    }

    public function handlePayment(Request $request)
    {
        $this->assertConfigured();

        $order = $this->createOrder($request->value, $request->currency);

        $orderLinks = collect($order->links);
        $approve = $orderLinks->where('rel', 'approve')->first();

        session()->put('approvalId', $order->id);

        return Inertia::location($approve->href);
    }

    public function handleApproval()
    {
        if (session()->has('approvalId')) {
            $approvalId = session()->get('approvalId');

            $payment = $this->capturePayment($approvalId);

            $name = $payment->payer->name->given_name;
            $payment = $payment->purchase_units[0]->payments->captures[0]->amount;
            $amount = $payment->value;
            $currency = $payment->currency_code;

            return redirect()
                ->route('home')
                ->withSuccess(['payment' => "Thanks {$name}. we received your {$amount}{$currency} payment."]);
        }

        return redirect()
            ->route('home')
            ->withErrors('We cannot capture the paypent. Please try again.');
    }

    public function handleSubscription(Request $request)
    {
        $this->assertConfigured($request->plan);

        $subscription = $this->createSubscription(
            $request->plan,
            $request->user()->name,
            $request->user()->email
        );

        $subscriptionLinks = collect($subscription->links);
        $approve = $subscriptionLinks->where('rel', 'approve')->first();
        session()->put('subscriptionId', $subscription->id);

        return Inertia::location($approve->href);
    }

    public function validateSubscription(Request $request)
    {
        if (session()->has('subscriptionId')) {
            $subscriptionId = session()->get('subscriptionId');

            session()->forget('subscriptionId');

            return $request->subscription_id == $subscriptionId;
        }

        return false;
    }

    public function createOrder($value, $currency)
    {
        return $this->makeRequest(
            'POST',
            '/v2/checkout/orders',
            [],
            [
                'intent' => 'CAPTURE',
                'purchase_units' => [
                    0 => [
                        'amount' => [
                            'currency_code' => strtoupper($currency),
                            'value' => round($value * $factor = $this->resolveFactor($currency)) / $factor,
                        ],
                    ],
                ],
                'application_context' => [
                    'brand_name' => config('app.name'),
                    'shipping_preference' => 'NO_SHIPPING',
                    'user_action' => 'PAY_NOW',
                    'return_url' => route('approval'),
                    'cancel_url' => route('cancelled'),
                ],
            ],
            [],
            $isJsonrequest = true,
        );
    }

    public function capturePayment($approvalId)
    {
        return $this->makeRequest(
            'POST',
            "/v2/checkout/orders/{$approvalId}/capture",
            [],
            [],
            [
                'Content-Type' => 'application/json',
            ],
        );
    }

    // We're using the slug because we can resolve the plan id from the slug
    public function createSubscription($planSlug, $name, $email)
    {
        return $this->makeRequest(
            'POST',
            '/v1/billing/subscriptions',
            [],
            [
                'plan_id' => $this->plans[$planSlug],
                'subscriber' => [
                    'name' => [
                        'given_name' => $name,
                    ],
                    'email_address' => $email,
                ],
                'application_context' => [
                    'brand_name' => config('app.name'),
                    'shipping_preference' => 'NO_SHIPPING',
                    'user_action' => 'SUBSCRIBE_NOW',
                    'return_url' => route('subscribe.approval', ['plan' => $planSlug]),
                    'cancel_url' => route('subscribe.cancelled'),
                ],
            ],
            [],
            $isJsonrequest = true,
        );
    }

    public function resolveFactor($currency)
    {
        $zeroDecimalCurrencies = ['JPY'];

        if (in_array(strtoupper($currency), $zeroDecimalCurrencies)) {
            return 1;
        }

        return 100;
    }

    protected function assertConfigured(?string $planSlug = null): void
    {
        $messages = [];

        if (blank($this->baseUri)) {
            $messages['payment_platform'] = 'PayPal base URI is not configured.';
        }

        if (blank($this->clientId) || blank($this->clientSecret)) {
            $messages['payment_platform'] = 'PayPal credentials are not configured.';
        }

        if ($planSlug !== null && blank($this->plans[$planSlug] ?? null)) {
            $messages['plan'] = "PayPal plan ID is not configured for [{$planSlug}].";
        }

        if ($messages !== []) {
            throw ValidationException::withMessages($messages);
        }
    }
}
