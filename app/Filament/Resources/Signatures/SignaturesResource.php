<?php

namespace App\Filament\Resources\Signatures;

use App\Filament\Resources\Signatures\Pages\CreateSignatures;
use App\Filament\Resources\Signatures\Pages\EditSignatures;
use App\Filament\Resources\Signatures\Pages\ListSignatures;
use App\Filament\Resources\Signatures\Schemas\SignaturesForm;
use App\Filament\Resources\Signatures\Tables\SignaturesTable;
use App\Models\Signatures;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class SignaturesResource extends Resource
{
    protected static ?string $model = Signatures::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return SignaturesForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SignaturesTable::configure($table);
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
            'index' => ListSignatures::route('/'),
            'create' => CreateSignatures::route('/create'),
            'edit' => EditSignatures::route('/{record}/edit'),
        ];
    }
}
