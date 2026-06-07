<?php

namespace App\Http\Controllers;

use App\Models\CourseUser;
use App\Models\Signatures;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class TrainingController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user === null) {
            return redirect()->route('login');
        }

        $coursesByCategory = $this->coursesByCategory();
        $allCourses = collect($coursesByCategory)
            ->flatMap(fn (array $category): array => $category['courses'] ?? [])
            ->values();

        $teamUsers = $user->currentTeam?->members()
            ->select(['users.id', 'users.name', 'users.email'])
            ->orderBy('users.name')
            ->get() ?? collect();

        $assignedCourses = collect();

        if ($user->isTeamAdmin() && $teamUsers->isNotEmpty()) {
            $assignedCourses = CourseUser::query()
                ->with('user:id,name,email')
                ->whereIn('user_id', $teamUsers->pluck('id'))
                ->latest('updated_at')
                ->get()
                ->map(fn (CourseUser $courseUser): array => [
                    'id' => $courseUser->id,
                    'user_id' => $courseUser->user_id,
                    'user_name' => $courseUser->user?->name,
                    'course_number' => $courseUser->course_number,
                    'course_title' => $allCourses->firstWhere('id', (int) $courseUser->course_number)['displayname'] ?? $courseUser->course_number,
                    'status' => $courseUser->status,
                    'updated_at' => $courseUser->updated_at?->toISOString(),
                ]);
        }

        $myCourses = CourseUser::query()
            ->where('user_id', $user->id)
            ->latest('updated_at')
            ->get()
            ->map(fn (CourseUser $courseUser): array => [
                'id' => $courseUser->id,
                'course_number' => $courseUser->course_number,
                'course_title' => $allCourses->firstWhere('id', (int) $courseUser->course_number)['displayname'] ?? $courseUser->course_number,
                'status' => $courseUser->status,
                'created_at' => $courseUser->created_at?->toISOString(),
            ]);

        return Inertia::render('training/index', [
            'categories' => $coursesByCategory,
            'teamUsers' => $teamUsers,
            'assignedCourses' => $assignedCourses,
            'myCourses' => $myCourses,
            'canAssignTraining' => $user->isTeamAdmin(),
            'hasCurrentTeam' => $user->currentTeam !== null,
        ]);
    }

    public function show(string $current_team, string $course): Response
    {
        $courseDetails = $this->appendTokenToMoodleImages(
            $this->moodleRequest('core_course_get_contents', ['courseid' => $course]),
        );

        // dd($course);
        $hasSigned = Signatures::query()
            ->where('user_id', auth()->id())
            ->where('course_id', $course)
            ->exists();

        return Inertia::render('training/show', [
            'courseId' => $course,
            'sections' => $courseDetails,
            'hasSigned' => $hasSigned,
        ]);
    }

    public function showTopic(string $current_team, string $course, string $topic): Response
    {
        return Inertia::render('training/topic', [
            'courseId' => $course,
            'topic' => $this->appendTokenToMoodleImages(
                $this->moodleRequest('core_course_get_course_module', ['cmid' => $topic]),
            ),
        ]);
    }

    public function assignTraining(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_ids' => ['required', 'array'],
            'user_ids.*' => ['integer', 'exists:users,id'],
            'course_numbers' => ['required', 'array'],
            'course_numbers.*' => ['string'],
        ]);

        foreach ($validated['user_ids'] as $userId) {
            foreach ($validated['course_numbers'] as $courseNumber) {
                CourseUser::firstOrCreate(
                    ['user_id' => $userId, 'course_number' => $courseNumber],
                    ['status' => 'assigned'],
                );
            }
        }

        return response()->json(['message' => 'Course assigned successfully']);
    }

    public function completeCourse(string $current_team, int $userId, string $courseNumber): JsonResponse
    {
        $courseUser = CourseUser::query()
            ->where('user_id', $userId)
            ->where('course_number', $courseNumber)
            ->firstOrFail();

        $courseUser->update(['status' => 'completed']);

        return response()->json(['message' => 'Course marked as completed']);
    }

    public function getUserCourses(string $current_team, int $userId): JsonResponse
    {
        $user = User::with('courses')->findOrFail($userId);

        return response()->json($user->courses);
    }

    public function registerSignature(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'string'],
            'course_number' => ['required', 'string'],
            'signature' => ['required', 'string'],
        ]);

        if (Signatures::where('user_id', $validated['user_id'])->where('course_id', $validated['course_number'])->exists()) {
            return response()->json(['message' => 'Signature already exists for this course and user'], 400);
        }

        $signature = Signatures::create([
            'user_id' => $validated['user_id'],
            'course_id' => $validated['course_number'],
            'signature' => $validated['signature'],
        ]);

        CourseUser::query()
            ->where('user_id', $validated['user_id'])
            ->where('course_number', $validated['course_number'])
            ->update(['status' => 'completed']);

        return response()->json([
            'message' => 'Course signed and marked as completed',
            'signature_id' => $signature->id,
        ]);
    }

    public function hasSignedCourse(int $userId, string $courseId): JsonResponse
    {
        $hasSignature = Signatures::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->exists();

        return response()->json(['signed' => $hasSignature]);
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function coursesByCategory(): array
    {
        $categories = $this->moodleRequest('core_course_get_categories');

        return collect($categories)
            ->reject(fn (array $category): bool => array_key_exists('exception', $category))
            ->mapWithKeys(fn (array $category): array => [
                $category['name'] => $this->moodleRequest('core_course_get_courses_by_field', [
                    'field' => 'category',
                    'value' => $category['id'],
                ]),
            ])
            ->toArray();
    }

    /**
     * @param  array<string, mixed>  $parameters
     * @return array<string, mixed>|array<int, mixed>
     */
    private function moodleRequest(string $function, array $parameters = []): array
    {
        $baseUrl = rtrim((string) env('MOODLE_URL'), '/').'/webservice/rest/server.php';

        if (blank(env('MOODLE_URL')) || blank(env('MOODLE_TOKEN'))) {
            return [];
        }

        $response = Http::get($baseUrl, [
            'wstoken' => env('MOODLE_TOKEN'),
            'wsfunction' => $function,
            'moodlewsrestformat' => 'json',
            ...$parameters,
        ]);

        if (! $response->successful()) {
            return [];
        }

        $json = $response->json() ?? [];

        if (isset($json['exception'])) {
            // Log the exception if needed: \Log::error('Moodle API Error', $json);
            return [];
        }

        return $json;
    }

    /**
     * @param  array<string, mixed>|array<int, mixed>  $data
     * @return array<string, mixed>|array<int, mixed>
     */
    private function appendTokenToMoodleImages(array $data): array
    {
        $token = env('MOODLE_TOKEN');

        array_walk_recursive($data, function (mixed &$item) use ($token): void {
            if (! is_string($item) || ! str_contains($item, 'webservice/pluginfile.php')) {
                return;
            }

            $item = preg_replace_callback(
                '/(https?:\/\/[^\s"\'<>]+webservice\/pluginfile\.php[^\s"\'<>]*)/i',
                function (array $matches) use ($token): string {
                    $separator = str_contains($matches[1], '?') ? '&' : '?';

                    return $matches[1].$separator.'token='.$token;
                },
                $item,
            );
        });

        return Arr::wrap($data);
    }
}
