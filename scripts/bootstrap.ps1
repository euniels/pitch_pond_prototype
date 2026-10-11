$ErrorActionPreference = 'Stop'
$workspace = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $workspace

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw 'Docker Desktop is required. Install or start Docker, then run this script again.'
}

$dockerStatus = docker desktop status 2>$null | Out-String
if ($LASTEXITCODE -ne 0 -or $dockerStatus -notmatch 'Status\s+running') {
    throw 'Docker Desktop is installed but its Linux engine is not running. Start Docker Desktop and retry.'
}

if (-not (Test-Path -LiteralPath '.env')) {
    Copy-Item -LiteralPath '.env.example' -Destination '.env'
}

$envContent = Get-Content -LiteralPath '.env' -Raw
if ($envContent -match '(?m)^APP_KEY=$') {
    $bytes = New-Object byte[] 32
    $random = [Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $random.GetBytes($bytes)
    }
    finally {
        $random.Dispose()
    }
    $key = 'base64:' + [Convert]::ToBase64String($bytes)
    $envContent = $envContent -replace '(?m)^APP_KEY=$', "APP_KEY=$key"
    Set-Content -LiteralPath '.env' -Value $envContent -NoNewline -Encoding utf8
}

docker compose build
if ($LASTEXITCODE -ne 0) { throw 'Docker image build failed.' }
docker compose up -d postgres redis minio minio-init mailpit
if ($LASTEXITCODE -ne 0) { throw 'Infrastructure startup failed.' }
docker compose run --rm api php artisan migrate --seed --force
if ($LASTEXITCODE -ne 0) { throw 'Database migration or seed failed.' }

Write-Host ''
Write-Host 'PitchPond is initialized.' -ForegroundColor Green
Write-Host 'Run .\scripts\dev.ps1 to start the web app, API, and queue worker.'
