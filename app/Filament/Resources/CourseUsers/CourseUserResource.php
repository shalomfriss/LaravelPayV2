<?php

namespace App\Filament\Resources\CourseUsers;

use App\Filament\Resources\CourseUsers\Pages\CreateCourseUser;
use App\Filament\Resources\CourseUsers\Pages\EditCourseUser;
use App\Filament\Resources\CourseUsers\Pages\ListCourseUsers;
use App\Filament\Resources\CourseUsers\Schemas\CourseUserForm;
use App\Filament\Resources\CourseUsers\Tables\CourseUsersTable;
use App\Models\CourseUser;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class CourseUserResource extends Resource
{
    protected static ?string $model = CourseUser::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return CourseUserForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CourseUsersTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListCourseUsers::route('/'),
            'create' => CreateCourseUser::route('/create'),
            'edit' => EditCourseUser::route('/{record}/edit'),
        ];
    }
}
