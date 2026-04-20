<?php

namespace App\Filament\Resources\CourseUsers\Pages;

use App\Filament\Resources\CourseUsers\CourseUserResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCourseUser extends EditRecord
{
    protected static string $resource = CourseUserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
