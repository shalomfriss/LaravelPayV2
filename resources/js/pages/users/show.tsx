import { Head } from '@inertiajs/react';

type Member = {
    id: number;
    name: string;
    email: string;
};

type Course = {
    id: number;
    course_number: string;
    status: string;
    updated_at?: string;
};

type UsersShowProps = {
    member: Member;
    courses: Course[];
    subscription?: {
        active_until?: string;
        plan?: {
            slug: string;
        };
    } | null;
};

export default function UsersShow({ member, courses, subscription }: UsersShowProps) {
    return (
        <>
            <Head title={member.name} />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <section className="rounded-lg border bg-card p-4">
                    <h1 className="text-xl font-semibold">{member.name}</h1>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <p className="mt-3 text-sm">
                        Subscription:{' '}
                        {subscription ? (
                            <span className="font-medium">
                                {subscription.plan?.slug ?? 'active'} through {subscription.active_until}
                            </span>
                        ) : (
                            <span className="text-muted-foreground">None</span>
                        )}
                    </p>
                </section>

                <section className="rounded-lg border bg-card p-4">
                    <h2 className="mb-3 text-lg font-semibold">Courses</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b text-muted-foreground">
                                <tr>
                                    <th className="py-2 pr-4 font-medium">Course</th>
                                    <th className="py-2 pr-4 font-medium">Status</th>
                                    <th className="py-2 font-medium">Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course) => (
                                    <tr key={course.id} className="border-b last:border-0">
                                        <td className="py-3 pr-4">{course.course_number}</td>
                                        <td className="py-3 pr-4 capitalize">{course.status}</td>
                                        <td className="py-3 text-muted-foreground">
                                            {course.updated_at ? new Date(course.updated_at).toLocaleString() : ''}
                                        </td>
                                    </tr>
                                ))}
                                {courses.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="py-6 text-center text-muted-foreground">
                                            No assigned courses.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </>
    );
}

UsersShow.layout = () => ({
    breadcrumbs: [{ title: 'Users', href: '/users' }],
});
