<?php

namespace App\Filament\Resources\PaymentPlatforms\Pages;

use App\Filament\Resources\PaymentPlatforms\PaymentPlatformResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPaymentPlatform extends EditRecord
{
    protected static string $resource = PaymentPlatformResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
