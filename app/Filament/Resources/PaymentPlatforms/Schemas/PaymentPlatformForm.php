<?php

namespace App\Filament\Resources\PaymentPlatforms\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class PaymentPlatformForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required()
                    ->maxLength(50),
                TextInput::make('image')
                    ->required()
                    ->maxLength(255),
                Toggle::make('subscriptions_enabled'),
            ]);
    }
}
