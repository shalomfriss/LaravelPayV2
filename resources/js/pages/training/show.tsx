import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle2, ChevronDown, PenLine } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type Module = {
    id: number | string;
    name: string;
    description?: string;
    modname?: string;
    url?: string;
    contents?: Array<{
        type: string;
        filename: string;
        fileurl: string;
        mimetype?: string;
    }>;
};

type Section = {
    id: number | string;
    name: string;
    summary?: string;
    modules?: Module[];
};

type CourseShowProps = {
    courseId: string;
    sections: Section[];
    hasSigned: boolean;
};

export default function CourseShow({
    courseId,
    sections,
    hasSigned,
}: CourseShowProps) {
    const page = usePage();
    const teamSlug = page.props.currentTeam?.slug;
    const userId = page.props.auth.user?.id;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [openSections, setOpenSections] = useState<string[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [signed, setSigned] = useState(hasSigned);
    const [message, setMessage] = useState<string | null>(null);

    const toggleSection = (id: string) => {
        setOpenSections((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id],
        );
    };

    const getCoordinates = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY,
        };
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

        const { x, y } = getCoordinates(event);
        context.lineWidth = 2;
        context.lineCap = 'round';
        context.strokeStyle = '#111827';
        context.lineTo(x, y);
        context.stroke();
    };

    const begin = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if (!canvas || !context) {
            return;
        }

        const { x, y } = getCoordinates(event);
        context.beginPath();
        context.moveTo(x, y);
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

        const response = await fetch(
            `/${teamSlug}/training/register-signature`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document.querySelector<HTMLMetaElement>(
                            'meta[name="csrf-token"]',
                        )?.content ?? '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    user_id: String(userId),
                    course_number: courseId,
                    signature: canvas.toDataURL('image/png'),
                }),
            },
        );

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
                    <p className="mt-1 text-sm text-muted-foreground">
                        Review each section, then sign when complete.
                    </p>
                </div>

                {sections.map((section) => {
                    const sectionId = String(section.id);
                    const isOpen = openSections.includes(sectionId);

                    return (
                        <section
                            key={sectionId}
                            className="rounded-lg border bg-card"
                        >
                            <button
                                type="button"
                                onClick={() => toggleSection(sectionId)}
                                className="flex w-full items-center justify-between gap-4 p-4 text-left"
                            >
                                <span className="font-semibold">
                                    {section.name}
                                </span>
                                <ChevronDown
                                    className={`size-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {isOpen ? (
                                <div className="space-y-4 border-t p-4">
                                    {(section.modules ?? []).map((module) => (
                                        <article
                                            key={String(module.id)}
                                            className="rounded-md border p-4"
                                        >
                                            <Link
                                                href={
                                                    teamSlug
                                                        ? `/${teamSlug}/training/${sectionId}/topic/${module.id}`
                                                        : '#'
                                                }
                                                className="text-lg font-medium text-primary hover:underline"
                                            >
                                                {module.name}
                                            </Link>
                                            {module.description ? (
                                                <div
                                                    className="prose prose-sm dark:prose-invert mt-3 max-w-none"
                                                    dangerouslySetInnerHTML={{
                                                        __html: module.description,
                                                    }}
                                                />
                                            ) : null}

                                            {module.contents &&
                                                module.contents.length > 0 && (
                                                    <div className="mt-4 flex flex-col gap-3">
                                                        {module.contents.map(
                                                            (content, idx) => {
                                                                if (
                                                                    content.type ===
                                                                    'url' ||
                                                                    module.modname ===
                                                                    'url'
                                                                ) {
                                                                    return (
                                                                        <a
                                                                            key={
                                                                                idx
                                                                            }
                                                                            href={
                                                                                content.fileurl
                                                                            }
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                                                                        >
                                                                            View:{' '}
                                                                            {content.filename ||
                                                                                content.fileurl}
                                                                        </a>
                                                                    );
                                                                }
                                                                if (
                                                                    content.type ===
                                                                    'file'
                                                                ) {
                                                                    if (
                                                                        content.mimetype?.startsWith(
                                                                            'video/',
                                                                        )
                                                                    ) {
                                                                        return (
                                                                            <video
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                controls
                                                                                className="mt-2 w-full max-w-3xl rounded-lg border bg-black shadow-sm"
                                                                            >
                                                                                <source
                                                                                    src={
                                                                                        content.fileurl
                                                                                    }
                                                                                    type={
                                                                                        content.mimetype
                                                                                    }
                                                                                />
                                                                                Your
                                                                                browser
                                                                                does
                                                                                not
                                                                                support
                                                                                the
                                                                                video
                                                                                tag.
                                                                            </video>
                                                                        );
                                                                    }
                                                                    if (
                                                                        content.mimetype?.startsWith(
                                                                            'image/',
                                                                        )
                                                                    ) {
                                                                        return (
                                                                            <img
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                src={
                                                                                    content.fileurl
                                                                                }
                                                                                alt={
                                                                                    content.filename
                                                                                }
                                                                                className="mt-2 max-w-xl rounded-lg border shadow-sm"
                                                                            />
                                                                        );
                                                                    }
                                                                    return (
                                                                        <a
                                                                            key={
                                                                                idx
                                                                            }
                                                                            href={
                                                                                content.fileurl
                                                                            }
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                                                                        >
                                                                            Download:{' '}
                                                                            {
                                                                                content.filename
                                                                            }
                                                                        </a>
                                                                    );
                                                                }
                                                                return null;
                                                            },
                                                        )}
                                                    </div>
                                                )}
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
                                <h2 className="font-semibold">
                                    Sign Completion
                                </h2>
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
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={clear}
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                    )}
                    {message ? (
                        <p className="mt-3 text-sm text-muted-foreground">
                            {message}
                        </p>
                    ) : null}
                </section>
            </div>
        </>
    );
}

CourseShow.layout = () => ({
    breadcrumbs: [{ title: 'Training', href: '/training' }],
});
