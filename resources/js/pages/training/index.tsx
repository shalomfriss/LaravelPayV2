import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, CheckCircle2, Send, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

type Course = {
    id: number | string;
    displayname: string;
};

type Category = {
    courses?: Course[];
};

type TeamUser = {
    id: number;
    name: string;
    email: string;
};

type AssignedCourse = {
    id: number;
    user_name?: string;
    course_number: string;
    course_title: string;
    status: string;
    updated_at?: string;
};

type MyCourse = {
    id: number;
    course_number: string;
    course_title: string;
    status: string;
    created_at?: string;
};

type TrainingProps = {
    categories: Record<string, Category>;
    teamUsers: TeamUser[];
    assignedCourses: AssignedCourse[];
    myCourses: MyCourse[];
    canAssignTraining: boolean;
    hasCurrentTeam: boolean;
};

export default function TrainingIndex({
    categories,
    teamUsers,
    assignedCourses,
    myCourses,
    canAssignTraining,
    hasCurrentTeam,
}: TrainingProps) {
    const page = usePage();
    const teamSlug = page.props.currentTeam?.slug;
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [isAssigning, setIsAssigning] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const courseCount = useMemo(
        () => Object.values(categories).reduce((total, category) => total + (category.courses?.length ?? 0), 0),
        [categories],
    );

    const toggleCourse = (courseId: string) => {
        setSelectedCourses((current) =>
            current.includes(courseId) ? current.filter((id) => id !== courseId) : [...current, courseId],
        );
    };

    const toggleUser = (userId: number) => {
        setSelectedUsers((current) =>
            current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
        );
    };

    const assignTraining = async () => {
        if (!teamSlug || selectedCourses.length === 0 || selectedUsers.length === 0) {
            return;
        }

        setIsAssigning(true);
        setMessage(null);

        const response = await fetch(`/${teamSlug}/training/assign-training`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                course_numbers: selectedCourses,
                user_ids: selectedUsers,
            }),
        });

        setIsAssigning(false);

        if (!response.ok) {
            setMessage('Training could not be assigned. Check the selected users and courses.');

            return;
        }

        setSelectedCourses([]);
        setSelectedUsers([]);
        setMessage('Training assigned successfully.');
    };

    return (
        <>
            <Head title="Training" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-card p-4 text-card-foreground">
                        <div className="flex items-center gap-3">
                            <BookOpen className="size-5 text-primary" />
                            <div>
                                <p className="text-2xl font-semibold">{courseCount}</p>
                                <p className="text-sm text-muted-foreground">Moodle courses</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4 text-card-foreground">
                        <div className="flex items-center gap-3">
                            <Users className="size-5 text-primary" />
                            <div>
                                <p className="text-2xl font-semibold">{teamUsers.length}</p>
                                <p className="text-sm text-muted-foreground">Team members</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4 text-card-foreground">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="size-5 text-primary" />
                            <div>
                                <p className="text-2xl font-semibold">{myCourses.length}</p>
                                <p className="text-sm text-muted-foreground">My assigned courses</p>
                            </div>
                        </div>
                    </div>
                </div>

                {canAssignTraining && !hasCurrentTeam ? (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                        Create or switch to a team before assigning training.
                    </div>
                ) : null}

                {message ? <div className="rounded-lg border bg-card p-4 text-sm">{message}</div> : null}

                <div className="grid gap-6 xl:grid-cols-[minmax(280px,360px)_1fr]">
                    <section className="rounded-lg border bg-card p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h1 className="text-lg font-semibold">Course Catalog</h1>
                            {canAssignTraining ? (
                                <Button
                                    type="button"
                                    size="sm"
                                    disabled={selectedCourses.length === 0 || selectedUsers.length === 0 || isAssigning}
                                    onClick={assignTraining}
                                >
                                    <Send className="size-4" />
                                    Assign
                                </Button>
                            ) : null}
                        </div>

                        <div className="space-y-5">
                            {Object.entries(categories).map(([category, details]) => (
                                <div key={category}>
                                    <h2 className="mb-2 text-sm font-medium text-muted-foreground">{category}</h2>
                                    <div className="space-y-2">
                                        {(details.courses ?? []).map((course) => {
                                            const courseId = String(course.id);

                                            return (
                                                <div key={courseId} className="flex items-start gap-3 rounded-md border p-3">
                                                    {canAssignTraining ? (
                                                        <Checkbox
                                                            checked={selectedCourses.includes(courseId)}
                                                            onCheckedChange={() => toggleCourse(courseId)}
                                                            aria-label={`Select ${course.displayname}`}
                                                        />
                                                    ) : null}
                                                    <Link
                                                        href={teamSlug ? `/${teamSlug}/training/${course.id}` : '#'}
                                                        className="text-sm font-medium hover:underline"
                                                    >
                                                        {course.displayname}
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="space-y-6">
                        {canAssignTraining ? (
                            <section className="rounded-lg border bg-card p-4">
                                <h2 className="mb-3 text-lg font-semibold">Assign To</h2>
                                <div className="grid gap-2 md:grid-cols-2">
                                    {teamUsers.map((user) => (
                                        <label key={user.id} className="flex items-center gap-3 rounded-md border p-3 text-sm">
                                            <Checkbox
                                                checked={selectedUsers.includes(user.id)}
                                                onCheckedChange={() => toggleUser(user.id)}
                                            />
                                            <span>
                                                <span className="block font-medium">{user.name}</span>
                                                <span className="text-muted-foreground">{user.email}</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </section>
                        ) : null}

                        {canAssignTraining ? (
                            <CourseTable title="Assigned Courses" courses={assignedCourses} showUser />
                        ) : null}

                        <CourseTable title="My Courses" courses={myCourses} />
                    </div>
                </div>
            </div>
        </>
    );
}

function CourseTable({
    title,
    courses,
    showUser = false,
}: {
    title: string;
    courses: Array<AssignedCourse | MyCourse>;
    showUser?: boolean;
}) {
    return (
        <section className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-lg font-semibold">{title}</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b text-muted-foreground">
                        <tr>
                            {showUser ? <th className="py-2 pr-4 font-medium">User</th> : null}
                            <th className="py-2 pr-4 font-medium">Course</th>
                            <th className="py-2 pr-4 font-medium">Status</th>
                            <th className="py-2 font-medium">Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course) => (
                            <tr key={course.id} className="border-b last:border-0">
                                {showUser ? <td className="py-3 pr-4">{(course as AssignedCourse).user_name}</td> : null}
                                <td className="py-3 pr-4 font-medium">{course.course_title}</td>
                                <td className="py-3 pr-4 capitalize">{course.status}</td>
                                <td className="py-3 text-muted-foreground">
                                    {new Date(('updated_at' in course ? course.updated_at : (course as MyCourse).created_at) ?? '').toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {courses.length === 0 ? (
                            <tr>
                                <td colSpan={showUser ? 4 : 3} className="py-6 text-center text-muted-foreground">
                                    No courses yet.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

TrainingIndex.layout = () => ({
    breadcrumbs: [{ title: 'Training', href: '/training' }],
});
