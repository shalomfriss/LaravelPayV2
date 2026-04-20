import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle2, ChevronDown, PenLine } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type Module = {
    id: number | string;
    name: string;
    description?: string;
};

type Section = {
    id: number | string;
    name: string;
    modules?: Module[];
};

type CourseShowProps = {
    courseId: string;
    sections: Section[];
    hasSigned: boolean;
};

export default function CourseShow({ courseId, sections, hasSigned }: CourseShowProps) {
    const page = usePage();
    const teamSlug = page.props.currentTeam?.slug;
    const userId = page.props.auth.user?.id;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [openSections, setOpenSections] = useState<string[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [signed, setSigned] = useState(hasSigned);
    const [message, setMessage] = useState<string | null>(null);

    const toggleSection = (id: string) => {
        setOpenSections((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    };

    const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing) {
            return;
        }

        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if (!canvas || !context) {
            return;
        }

        const rect = canvas.getBoundingClientRect();
        context.lineWidth = 2;
        context.lineCap = 'round';
        context.strokeStyle = '#111827';
        context.lineTo(event.clientX - rect.left, event.clientY - rect.top);
        context.stroke();
    };

    const begin = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if (!canvas || !context) {
            return;
        }

        const rect = canvas.getBoundingClientRect();
        context.beginPath();
        context.moveTo(event.clientX - rect.left, event.clientY - rect.top);
        setIsDrawing(true);
    };

    const clear = () => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if (canvas && context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const submitSignature = async () => {
        const canvas = canvasRef.current;

        if (!teamSlug || !userId || !canvas) {
            return;
        }

        const response = await fetch(`/${teamSlug}/training/register-signature`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                user_id: String(userId),
                course_number: courseId,
                signature: canvas.toDataURL('image/png'),
            }),
        });

        if (!response.ok) {
            setMessage('Signature could not be saved.');

            return;
        }

        setSigned(true);
        setMessage('Course signed and marked complete.');
    };

    return (
        <>
            <Head title="Course Content" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="rounded-lg border bg-card p-4">
                    <h1 className="text-xl font-semibold">Course Content</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Review each section, then sign when complete.</p>
                </div>

                {sections.map((section) => {
                    const sectionId = String(section.id);
                    const isOpen = openSections.includes(sectionId);

                    return (
                        <section key={sectionId} className="rounded-lg border bg-card">
                            <button
                                type="button"
                                onClick={() => toggleSection(sectionId)}
                                className="flex w-full items-center justify-between gap-4 p-4 text-left"
                            >
                                <span className="font-semibold">{section.name}</span>
                                <ChevronDown className={`size-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isOpen ? (
                                <div className="space-y-4 border-t p-4">
                                    {(section.modules ?? []).map((module) => (
                                        <article key={String(module.id)} className="rounded-md border p-4">
                                            <Link
                                                href={teamSlug ? `/${teamSlug}/training/${section.id}/topic/${module.id}` : '#'}
                                                className="font-medium hover:underline"
                                            >
                                                {module.name}
                                            </Link>
                                            {module.description ? (
                                                <div
                                                    className="prose prose-sm mt-2 max-w-none dark:prose-invert"
                                                    dangerouslySetInnerHTML={{ __html: module.description }}
                                                />
                                            ) : null}
                                        </article>
                                    ))}
                                </div>
                            ) : null}
                        </section>
                    );
                })}

                <section className="rounded-lg border bg-card p-4">
                    {signed ? (
                        <div className="flex items-center gap-3 text-sm font-medium text-green-600">
                            <CheckCircle2 className="size-5" />
                            You have already signed for this course.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <PenLine className="size-5 text-primary" />
                                <h2 className="font-semibold">Sign Completion</h2>
                            </div>
                            <canvas
                                ref={canvasRef}
                                width={760}
                                height={220}
                                className="h-56 w-full touch-none rounded-md border bg-white"
                                onPointerDown={begin}
                                onPointerMove={draw}
                                onPointerUp={() => setIsDrawing(false)}
                                onPointerLeave={() => setIsDrawing(false)}
                            />
                            <div className="flex gap-2">
                                <Button type="button" onClick={submitSignature}>
                                    Save Signature
                                </Button>
                                <Button type="button" variant="outline" onClick={clear}>
                                    Clear
                                </Button>
                            </div>
                        </div>
                    )}
                    {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
                </section>
            </div>
        </>
    );
}

CourseShow.layout = () => ({
    breadcrumbs: [{ title: 'Training', href: '/training' }],
});
