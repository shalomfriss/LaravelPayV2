<?php

namespace App\Filament\Resources\PaymentPlatforms;

use App\Filament\Resources\PaymentPlatforms\Pages\CreatePaymentPlatform;
use App\Filament\Resources\PaymentPlatforms\Pages\EditPaymentPlatform;
use App\Filament\Resources\PaymentPlatforms\Pages\ListPaymentPlatforms;
use App\Filament\Resources\PaymentPlatforms\Schemas\PaymentPlatformForm;
use App\Filament\Resources\PaymentPlatforms\Tables\PaymentPlatformsTable;
use App\Models\PaymentPlatform;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PaymentPlatformResource extends Resource
{
    protected static ?string $model = PaymentPlatform::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return PaymentPlatformForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PaymentPlatformsTable::configure($table);
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
            'index' => ListPaymentPlatforms::route('/'),
            'create' => CreatePaymentPlatform::route('/create'),
            'edit' => EditPaymentPlatform::route('/{record}/edit'),
        ];
    }
}
