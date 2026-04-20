import { Head, useForm } from '@inertiajs/react';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Plan = {
    slug: string;
    price: number;
    duration_in_days: number;
};

type PaymentPlatform = {
    id: number;
    name: string;
    image: string;
};

type SubscribeProps = {
    plans: Plan[];
    paymentPlatforms: PaymentPlatform[];
};

export default function Subscribe({ plans, paymentPlatforms }: SubscribeProps) {
    const { data, setData, post, processing, errors } = useForm({
        plan: '',
        payment_platform: '',
        payment_method: '',
    });

    const selectedPlatform = paymentPlatforms.find((platform) => String(platform.id) === data.payment_platform);
    const needsPaymentMethod = selectedPlatform?.name.toLowerCase() === 'stripe';

    return (
        <>
            <Head title="Subscribe" />
            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4">
                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-3">
                        <CreditCard className="size-5 text-primary" />
                        <div>
                            <h1 className="text-xl font-semibold">Subscribe</h1>
                            <p className="text-sm text-muted-foreground">Choose a plan and payment provider.</p>
                        </div>
                    </div>
                </div>

                <form
                    className="space-y-6 rounded-lg border bg-card p-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        post('/subscribe');
                    }}
                >
                    <section>
                        <h2 className="mb-3 font-semibold">Plan</h2>
                        <div className="grid gap-3 md:grid-cols-2">
                            {plans.map((plan) => (
                                <label key={plan.slug} className="cursor-pointer rounded-lg border p-4">
                                    <input
                                        type="radio"
                                        name="plan"
                                        className="mr-3"
                                        value={plan.slug}
                                        checked={data.plan === plan.slug}
                                        onChange={(event) => setData('plan', event.target.value)}
                                    />
                                    <span className="font-medium capitalize">{plan.slug}</span>
                                    <span className="ml-2 text-muted-foreground">${(plan.price / 100).toFixed(2)}</span>
                                </label>
                            ))}
                        </div>
                        {errors.plan ? <p className="mt-2 text-sm text-destructive">{errors.plan}</p> : null}
                    </section>

                    <section>
                        <h2 className="mb-3 font-semibold">Payment Platform</h2>
                        <div className="grid gap-3 md:grid-cols-2">
                            {paymentPlatforms.map((platform) => (
                                <label key={platform.id} className="cursor-pointer rounded-lg border p-4">
                                    <input
                                        type="radio"
                                        name="payment_platform"
                                        className="mr-3"
                                        value={String(platform.id)}
                                        checked={data.payment_platform === String(platform.id)}
                                        onChange={(event) => setData('payment_platform', event.target.value)}
                                    />
                                    <img src={`/${platform.image}`} alt={platform.name} className="inline h-10 rounded border bg-white object-contain" />
                                    <span className="ml-3 font-medium">{platform.name}</span>
                                </label>
                            ))}
                        </div>
                        {errors.payment_platform ? <p className="mt-2 text-sm text-destructive">{errors.payment_platform}</p> : null}
                    </section>

                    {needsPaymentMethod ? (
                        <label className="block space-y-2">
                            <span className="text-sm font-medium">Stripe payment method ID</span>
                            <input
                                className="w-full rounded-md border bg-background px-3 py-2"
                                value={data.payment_method}
                                onChange={(event) => setData('payment_method', event.target.value)}
                                placeholder="pm_..."
                            />
                            {errors.payment_method ? <span className="text-sm text-destructive">{errors.payment_method}</span> : null}
                        </label>
                    ) : null}

                    <Button type="submit" disabled={processing || !data.plan || !data.payment_platform}>
                        Pay
                    </Button>
                </form>
            </div>
        </>
    );
}

Subscribe.layout = () => ({
    breadcrumbs: [{ title: 'Subscribe', href: '/subscribe' }],
});
