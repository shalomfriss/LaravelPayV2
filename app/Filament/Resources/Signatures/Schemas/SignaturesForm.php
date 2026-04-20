<?php

namespace App\Filament\Resources\Signatures\Schemas;

use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class SignaturesForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('user_id'),
                TextInput::make('course_id'),
                Textarea::make('signature')
                    ->columnSpanFull(),
            ]);
    }
}
