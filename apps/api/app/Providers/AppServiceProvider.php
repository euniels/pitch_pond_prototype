<?php

namespace App\Providers;

use App\Contracts\PaymentGateway;
use App\Services\Payments\PayMongoPaymentGateway;
use App\Services\Payments\SimulatedPaymentGateway;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(PaymentGateway::class, function ($app) {
            return config('pitchpond.payment_driver') === 'paymongo'
                ? $app->make(PayMongoPaymentGateway::class)
                : $app->make(SimulatedPaymentGateway::class);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
