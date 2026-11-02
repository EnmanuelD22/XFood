param([int]$ApiPort = 7294, [int]$WebPort = 3002, [switch]$SkipBuild)
$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$webRoot = Join-Path $repoRoot 'web'
$localRoot = Join-Path $repoRoot '.local'
$statePath = Join-Path $localRoot 'processes.json'
if ($ApiPort -eq $WebPort -or $ApiPort -lt 1024 -or $WebPort -lt 1024 -or $ApiPort -gt 65535 -or $WebPort -gt 65535) { throw 'Puertos no válidos.' }
foreach ($port in @($ApiPort, $WebPort)) {
    if (Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue) { throw "El puerto $port está ocupado. Usa otros puertos o detén la ejecución anterior con scripts/Stop-XFood.ps1." }
}
if (Test-Path $statePath) { throw 'Existe una ejecución registrada. Ejecuta scripts/Stop-XFood.ps1 antes de iniciar otra.' }
New-Item -ItemType Directory -Force -Path (Join-Path $localRoot 'certs') | Out-Null
Push-Location $repoRoot
try {
    $nodeMajor = [int]((node --version).TrimStart('v').Split('.')[0])
    if ($nodeMajor -lt 24) { throw 'Se requiere Node.js 24 o posterior.' }
    dotnet dev-certs https --check --trust | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Primero ejecuta: dotnet dev-certs https --trust' }
    $certificate = Join-Path $localRoot 'certs/localhost.pem'
    $key = Join-Path $localRoot 'certs/localhost.key'
    dotnet dev-certs https --export-path $certificate --format Pem --no-password | Out-Null
    if ($LASTEXITCODE -ne 0 -or !(Test-Path $key)) { throw 'No se pudo exportar el certificado HTTPS de desarrollo.' }
    if (!(Test-Path (Join-Path $webRoot 'node_modules'))) {
        npm ci --prefix $webRoot --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw 'Falló npm ci.' }
    }
    if (!$SkipBuild) {
        dotnet build XFood.slnx -m:1 --nologo
        if ($LASTEXITCODE -ne 0) { throw 'Falló la compilación .NET.' }
        npm run build --prefix $webRoot
        if ($LASTEXITCODE -ne 0) { throw 'Falló la compilación web.' }
    }
    $apiOrigin = "https://localhost:$ApiPort"
    $webOrigin = "https://localhost:$WebPort"
    $apiDll = Join-Path $repoRoot 'src/XFood.Api/bin/Debug/net10.0/XFood.Api.dll'
    if (!(Test-Path $apiDll)) { throw 'Falta compilar la API.' }
    $names = @('ASPNETCORE_ENVIRONMENT','ASPNETCORE_URLS','Cors__PanelOrigins__0','Security__ApiOrigins__0','XFOOD_API_BASE_URL','NODE_EXTRA_CA_CERTS','ConnectionStrings__XFood','XFOOD_WEB_PORT','XFOOD_HTTPS_CERT','XFOOD_HTTPS_KEY')
    $previous = @{}
    foreach ($name in $names) { $previous[$name] = [Environment]::GetEnvironmentVariable($name, 'Process') }
    $owned = @()
    try {
        $settingsPath = Join-Path $localRoot 'settings.json'
        if (!$env:ConnectionStrings__XFood -and (Test-Path $settingsPath)) {
            $settings = Get-Content -LiteralPath $settingsPath -Raw | ConvertFrom-Json
            if ($settings.ConnectionStrings.XFood) { $env:ConnectionStrings__XFood = $settings.ConnectionStrings.XFood }
        }
        $env:ASPNETCORE_ENVIRONMENT = 'Development'
        $env:ASPNETCORE_URLS = $apiOrigin
        $env:Cors__PanelOrigins__0 = $webOrigin
        $env:Security__ApiOrigins__0 = $webOrigin
        $env:XFOOD_API_BASE_URL = "$apiOrigin/api/v1"
        $env:NODE_EXTRA_CA_CERTS = $certificate
        $env:XFOOD_WEB_PORT = $WebPort
        $env:XFOOD_HTTPS_CERT = $certificate
        $env:XFOOD_HTTPS_KEY = $key
        $api = Start-Process dotnet -ArgumentList @('"' + $apiDll + '"') -WorkingDirectory (Join-Path $repoRoot 'src/XFood.Api') -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $localRoot 'api.log') -RedirectStandardError (Join-Path $localRoot 'api-error.log')
        $owned += @{ Id = $api.Id; Started = $api.StartTime.ToUniversalTime().Ticks }
        @{ Processes = $owned; Api = $apiOrigin; Web = $webOrigin } | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $statePath
        $next = Join-Path $webRoot 'scripts/serve-https.mjs'
        $web = Start-Process node -ArgumentList @('"' + $next + '"') -WorkingDirectory $webRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $localRoot 'web.log') -RedirectStandardError (Join-Path $localRoot 'web-error.log')
        $owned += @{ Id = $web.Id; Started = $web.StartTime.ToUniversalTime().Ticks }
        @{ Processes = $owned; Api = $apiOrigin; Web = $webOrigin } | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $statePath
    } finally {
        foreach ($name in $names) { [Environment]::SetEnvironmentVariable($name, $previous[$name], 'Process') }
    }
    $ready = $false
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        try {
            $response = Invoke-WebRequest "$webOrigin/api/v1/categories" -TimeoutSec 1 -UseBasicParsing
            if ($response.StatusCode -eq 200) { $ready = $true; break }
        } catch { Start-Sleep -Milliseconds 500 }
    }
    if (!$ready) { throw 'No se pudo iniciar la web y consultar la base. Revisa .local/*.log, la conexión y las migraciones.' }
    if (@($response.Content | ConvertFrom-Json).Count -eq 0) { Write-Warning 'El catálogo está vacío. Verifica las migraciones antes de crear publicaciones.' }
    Write-Host "API: $apiOrigin/api/v1"
    Write-Host "Web: $webOrigin/login"
    Write-Host 'API, web y catálogo disponibles. No se aplican migraciones automáticamente.'
} catch {
    $failure = $_
    if (Test-Path $statePath) {
        try { & (Join-Path $PSScriptRoot 'Stop-XFood.ps1') } catch { Write-Warning 'Revisa los procesos registrados en .local/processes.json.' }
    }
    throw $failure
} finally { Pop-Location }
