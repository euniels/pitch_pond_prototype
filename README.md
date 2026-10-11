# PitchPond

PitchPond is a mobile-first donation and reward crowdfunding platform for verified Filipino founders and communities. This repository contains the production-oriented closed-beta foundation:

- `apps/web` — Next.js 16, TypeScript, bilingual UI, accessible design system
- `apps/api` — Laravel 13, Sanctum sessions, PostgreSQL domain model, queues and scheduled controls
- `docker-compose.yml` — PostgreSQL, Redis, MinIO, Mailpit, API, worker, scheduler, and web app

Equity and investment campaigns are deliberately disabled. The application does not describe payment handling as escrow.

## Quick start on Windows

Requirements: Docker Desktop with Docker Compose and PowerShell 5.1 or newer.

```powershell
cd C:\Users\Gershan\pitch_pond_prototype
Copy-Item .env.example .env
.\scripts\bootstrap.ps1
.\scripts\dev.ps1
```

Open:

- Web app: http://localhost:3000
- API health: http://localhost:8000/up
- API status: http://localhost:8000/api/v1/status
- Mailpit: http://localhost:8025
- MinIO console: http://localhost:9001

The bootstrap script creates a random local `APP_KEY`, builds the containers, migrates PostgreSQL, and loads development fixtures.

### Local development accounts

All use password `PitchPondDemo!2026` and exist only after development seeding:

- `founder@pitchpond.local`
- `backer@pitchpond.local`
- `admin@pitchpond.local`

The default invite code is `pond-beta-2026`. Change it in `.env` before sharing a beta environment.

## Run without Docker

The checked-in API `.env` uses SQLite, so the project can also be run with the locally installed PHP and Node runtimes:

```powershell
cd apps\api
composer install
php artisan migrate:fresh --seed
php artisan serve --port=8000
```

In a second terminal:

```powershell
cd apps\web
npm ci
$env:NEXT_PUBLIC_API_URL='http://localhost:8000'
$env:NEXT_PUBLIC_SHOW_DEV_ACCOUNTS='true'
npm run dev
```

## Verification

```powershell
.\scripts\test.ps1
```

Or run checks directly:

```powershell
cd apps\api
php artisan test
vendor\bin\pint --test

cd ..\web
npm run test
npm run lint
npm run typecheck
npm run build
```

## Implemented beta controls

- Donation/reward-only API validation and an immutable disabled equity feature gate
- Campaign and pledge state enums, all-or-nothing deadline processing, and refund records
- Founder organizations, verification cases, payout accounts, campaign drafts, reward inventory, pledges, payments, subscriptions, payouts, disputes, webhooks, and audit events
- PayMongo checkout adapter, signed webhook verification, duplicate-event protection, and a local simulated provider
- Sumsub access-token adapter that stores provider references rather than copied raw IDs
- Sanctum cookie sessions, CSRF protection, login throttling, role middleware, and admin review routes
- Basic Founder (5%), Pro Founder at ₱1,499/month (3%), and Backer Plus at ₱299/month
- English/Filipino switch, light/dark themes, reduced motion, keyboard focus, responsive layouts, and honest risk/funding language
- Queue worker, campaign deadline scheduler, payment reconciliation command, PostgreSQL, Redis, private MinIO bucket, and local email capture

## External services

The local default is `PAYMENT_DRIVER=simulated`. Real payments remain blocked until PayMongo approves the campaign balance, delayed-transfer, refund, and sub-merchant structure. To exercise PayMongo sandbox checkout, set `PAYMENT_DRIVER=paymongo`, configure test credentials, and register `/api/v1/webhooks/paymongo` as the webhook URL.

Sumsub identity verification requires `SUMSUB_APP_TOKEN` and `SUMSUB_SECRET_KEY`. Business-document policy and final review remain an operational responsibility even when IDV/KYB automation is enabled.

Never commit `.env`, production credentials, identity files, webhook payload exports, or database backups.

## API and operating documents

- [OpenAPI contract](apps/api/openapi.yaml)
- [Security and incident response](docs/security-and-incidents.md)
- [Closed-beta operating gates](docs/launch-gates.md)
- [AWS deployment blueprint](docs/aws-deployment.md)

## Important limitations

This repository provides the technical closed-beta foundation, not legal authorization to operate a financial or payment service. Counsel, the payment provider, identity provider, insurer/accountant, privacy officer, and support operators must approve their respective launch gates before live money is enabled.
