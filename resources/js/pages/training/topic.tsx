import { Head } from '@inertiajs/react';

type TopicProps = {
    topic: Record<string, unknown>;
};

export default function Topic({ topic }: TopicProps) {
    return (
        <>
            <Head title="Training Topic" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="rounded-lg border bg-card p-4">
                    <h1 className="text-xl font-semibold">{String(topic.name ?? 'Training Topic')}</h1>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    {'description' in topic && typeof topic.description === 'string' ? (
                        <div className="prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: topic.description }} />
                    ) : (
                        <pre className="overflow-auto rounded-md bg-muted p-4 text-sm">{JSON.stringify(topic, null, 2)}</pre>
                    )}
                </div>
            </div>
        </>
    );
}

Topic.layout = () => ({
    breadcrumbs: [{ title: 'Training', href: '/training' }],
});
