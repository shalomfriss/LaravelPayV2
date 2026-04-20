<?php

namespace App\Filament\Resources\PaymentPlatforms\Pages;

use App\Filament\Resources\PaymentPlatforms\PaymentPlatformResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPaymentPlatforms extends ListRecords
{
    protected static string $resource = PaymentPlatformResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
