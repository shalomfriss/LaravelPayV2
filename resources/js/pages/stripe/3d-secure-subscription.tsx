import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

type SecureSubscriptionProps = {
    clientSecret: string;
    plan: string;
    subscriptionId: string;
};

export default function ThreeDSecureSubscription({ clientSecret, plan, subscriptionId }: SecureSubscriptionProps) {
    return (
        <>
            <Head title="3D Secure Subscription" />
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
                <section className="rounded-lg border bg-card p-4">
                    <h1 className="text-xl font-semibold">Additional subscription authentication required</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Stripe returned a 3D Secure challenge. Complete authentication with this client secret, then continue.
                    </p>
                    <pre className="mt-4 overflow-auto rounded-md bg-muted p-3 text-xs">{clientSecret}</pre>
                    <Button asChild className="mt-4">
                        <Link href={`/subscribe/approval?plan=${encodeURIComponent(plan)}&subscription_id=${encodeURIComponent(subscriptionId)}`}>
                            Continue
                        </Link>
                    </Button>
                </section>
            </div>
        </>
    );
}
