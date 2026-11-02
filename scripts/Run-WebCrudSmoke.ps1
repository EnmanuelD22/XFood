param([string]$Server = 'localhost')
$ErrorActionPreference = 'Stop'
if ($Server -notmatch '^[a-zA-Z0-9_.\\,:()\-]+$') { throw 'Nombre de instancia no válido.' }
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$localRoot = Join-Path $repoRoot '.local'
if (Test-Path (Join-Path $localRoot 'processes.json')) { throw 'Detén antes la ejecución local con scripts/Stop-XFood.ps1.' }
$database = 'XFood_WebTests_' + [guid]::NewGuid().ToString('N')
if ($database -notmatch '^XFood_WebTests_[a-f0-9]{32}$' -or $database -eq 'XFoodDB') { throw 'Base de pruebas no válida.' }
$oldConnection = $env:ConnectionStrings__XFood
$oldUrl = $env:XFOOD_REAL_WEB_URL
$oldDatabase = $env:XFOOD_REAL_TEST_DATABASE
$created = $false
$started = $false
New-Item -ItemType Directory -Force -Path $localRoot | Out-Null
Push-Location $repoRoot
try {
    sqlcmd -S $Server -E -C -b -Q "IF DB_ID(N'$database') IS NOT NULL THROW 50000, 'La base de prueba ya existe.', 1; CREATE DATABASE [$database];"
    if ($LASTEXITCODE -ne 0) { throw 'No se creó la base aislada.' }
    $created = $true
    Write-Host "Base de pruebas: $database; servidor: $Server"
    $env:ConnectionStrings__XFood = "Server=$Server;Database=$database;Integrated Security=True;Encrypt=True;TrustServerCertificate=True"
    dotnet tool restore | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Falló la restauración de dotnet-ef.' }
    dotnet tool run dotnet-ef database update --project src/XFood.Infrastructure --startup-project src/XFood.Api --context XFoodDbContext --no-build *> (Join-Path $localRoot 'smoke-migrations.log')
    if ($LASTEXITCODE -ne 0) { throw 'Falló la migración aislada; consulta .local/smoke-migrations.log.' }
    & (Join-Path $PSScriptRoot 'Start-XFood.ps1') -ApiPort 7296 -WebPort 3003 -SkipBuild
    $started = $true
    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        try {
            $response = Invoke-WebRequest 'https://localhost:3003/api/v1/categories' -SkipCertificateCheck -TimeoutSec 2
            if ($response.StatusCode -eq 200) { $ready = $true; break }
        } catch { Start-Sleep -Milliseconds 500 }
    }
    if (!$ready) { throw 'La web y la API de pruebas no están listas; consulta .local/*.log.' }
    $env:XFOOD_REAL_WEB_URL = 'https://localhost:3003'
    $env:XFOOD_REAL_TEST_DATABASE = $database
    Push-Location (Join-Path $repoRoot 'web')
    try {
        npx playwright test --config playwright.real.config.ts
        if ($LASTEXITCODE -ne 0) { throw 'Falló el recorrido CRUD real.' }
    } finally { Pop-Location }
} finally {
    if ($started) { & (Join-Path $PSScriptRoot 'Stop-XFood.ps1') }
    if ($created) {
        if ($database -notmatch '^XFood_WebTests_[a-f0-9]{32}$') { throw 'No se autoriza eliminar esta base.' }
        sqlcmd -S $Server -E -C -b -Q "IF DB_ID(N'$database') IS NOT NULL BEGIN ALTER DATABASE [$database] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [$database]; END;"
        if ($LASTEXITCODE -ne 0) { Write-Warning "No se pudo limpiar $database; revisa la instancia." }
    }
    $env:ConnectionStrings__XFood = $oldConnection
    $env:XFOOD_REAL_WEB_URL = $oldUrl
    $env:XFOOD_REAL_TEST_DATABASE = $oldDatabase
    Pop-Location
}
