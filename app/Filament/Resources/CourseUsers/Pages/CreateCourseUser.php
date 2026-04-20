<?php

namespace App\Filament\Resources\CourseUsers\Pages;

use App\Filament\Resources\CourseUsers\CourseUserResource;
use Filament\Resources\Pages\CreateRecord;

class CreateCourseUser extends CreateRecord
{
    protected static string $resource = CourseUserResource::class;
}
