<?php

namespace App\Filament\Resources\CourseUsers\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class CourseUserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->relationship('user', 'email')
                    ->required(),
                TextInput::make('course_number')
                    ->required()
                    ->maxLength(255),
                Select::make('status')
                    ->options([
                        'assigned' => 'Assigned',
                        'completed' => 'Completed',
                    ])
                    ->required(),
            ]);
    }
}
