import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

type SecureProps = {
    clientSecret: string;
};

export default function ThreeDSecure({ clientSecret }: SecureProps) {
    return (
        <>
            <Head title="3D Secure" />
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
                <section className="rounded-lg border bg-card p-4">
                    <h1 className="text-xl font-semibold">Additional card authentication required</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Stripe returned a 3D Secure challenge. Use the client secret below with your Stripe publishable key to complete
                        authentication, then return to the approval URL.
                    </p>
                    <pre className="mt-4 overflow-auto rounded-md bg-muted p-3 text-xs">{clientSecret}</pre>
                    <Button asChild className="mt-4">
                        <Link href="/payments/approval">Continue</Link>
                    </Button>
                </section>
            </div>
        </>
    );
}
