$ErrorActionPreference = 'Stop'
$workspace = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $workspace

$dockerStatus = docker desktop status 2>$null | Out-String
if ($LASTEXITCODE -ne 0 -or $dockerStatus -notmatch 'Status\s+running') { throw 'Docker Desktop is not running.' }
docker compose run --rm api php artisan test
if ($LASTEXITCODE -ne 0) { throw 'API tests failed.' }
docker compose run --rm web npm run test
if ($LASTEXITCODE -ne 0) { throw 'Web tests failed.' }
docker compose run --rm web npm run lint
if ($LASTEXITCODE -ne 0) { throw 'Web lint failed.' }
docker compose run --rm web npm run build
if ($LASTEXITCODE -ne 0) { throw 'Web production build failed.' }
