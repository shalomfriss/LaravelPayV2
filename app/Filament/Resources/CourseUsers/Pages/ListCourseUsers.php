<?php

namespace App\Filament\Resources\CourseUsers\Pages;

use App\Filament\Resources\CourseUsers\CourseUserResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListCourseUsers extends ListRecords
{
    protected static string $resource = CourseUserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
