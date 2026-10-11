$ErrorActionPreference = 'Stop'
$workspace = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $workspace

if (-not (Test-Path -LiteralPath '.env')) {
    throw 'Missing .env. Run .\scripts\bootstrap.ps1 first.'
}

$dockerStatus = docker desktop status 2>$null | Out-String
if ($LASTEXITCODE -ne 0 -or $dockerStatus -notmatch 'Status\s+running') { throw 'Docker Desktop is not running.' }
docker compose up --build
if ($LASTEXITCODE -ne 0) { throw 'PitchPond services stopped with an error.' }
