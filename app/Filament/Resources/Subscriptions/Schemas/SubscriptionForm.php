<?php

namespace App\Filament\Resources\Subscriptions\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Schemas\Schema;

class SubscriptionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                DateTimePicker::make('active_until')
                    ->required(),
                Select::make('user_id')
                    ->relationship('user', 'email')
                    ->required(),
                Select::make('plan_id')
                    ->relationship('plan', 'slug')
                    ->required(),
            ]);
    }
}
