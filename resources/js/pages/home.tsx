import { Head, Link, useForm } from '@inertiajs/react';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Currency = {
    iso: string;
};

type PaymentPlatform = {
    id: number;
    name: string;
    image: string;
};

type HomeProps = {
    currencies: Currency[];
    paymentPlatforms: PaymentPlatform[];
    hasActiveSubscription: boolean;
};

export default function Home({ currencies, paymentPlatforms, hasActiveSubscription }: HomeProps) {
    const { data, setData, post, processing, errors } = useForm({
        value: '25.00',
        currency: currencies[0]?.iso ?? 'usd',
        payment_platform: '',
        payment_method: '',
    });

    const selectedPlatform = paymentPlatforms.find((platform) => String(platform.id) === data.payment_platform);
    const needsPaymentMethod = selectedPlatform?.name.toLowerCase() === 'stripe';

    return (
        <>
            <Head title="Make a Payment" />
            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4">
                <section className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-3">
                        <CreditCard className="size-5 text-primary" />
                        <div>
                            <h1 className="text-xl font-semibold">Make a Payment</h1>
                            <p className="text-sm text-muted-foreground">One-time payments use your selected payment provider.</p>
                        </div>
                    </div>
                </section>

                <form
                    className="space-y-6 rounded-lg border bg-card p-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        post('/payments/pay');
                    }}
                >
                    <div className="grid gap-4 md:grid-cols-[1fr_160px]">
                        <label className="space-y-2">
                            <span className="text-sm font-medium">Amount</span>
                            <input
                                type="number"
                                min="5"
                                step="0.01"
                                className="w-full rounded-md border bg-background px-3 py-2"
                                value={data.value}
                                onChange={(event) => setData('value', event.target.value)}
                                required
                            />
                            {errors.value ? <span className="text-sm text-destructive">{errors.value}</span> : null}
                        </label>
                        <label className="space-y-2">
                            <span className="text-sm font-medium">Currency</span>
                            <select
                                className="w-full rounded-md border bg-background px-3 py-2"
                                value={data.currency}
                                onChange={(event) => setData('currency', event.target.value)}
                                required
                            >
                                {currencies.map((currency) => (
                                    <option key={currency.iso} value={currency.iso}>
                                        {currency.iso.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                            {errors.currency ? <span className="text-sm text-destructive">{errors.currency}</span> : null}
                        </label>
                    </div>

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

                    <p className="rounded-md border bg-muted p-3 text-sm">
                        {hasActiveSubscription ? (
                            <>Your 10% subscription discount will be applied during checkout.</>
                        ) : (
                            <>
                                Subscribe for a recurring discount. <Link href="/subscribe" className="font-medium underline">View plans</Link>
                            </>
                        )}
                    </p>

                    <Button type="submit" disabled={processing || !data.payment_platform}>
                        Pay
                    </Button>
                </form>
            </div>
        </>
    );
}

Home.layout = () => ({
    breadcrumbs: [{ title: 'Make a Payment', href: '/home' }],
});
