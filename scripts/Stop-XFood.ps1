$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$statePath = Join-Path $repoRoot '.local/processes.json'
if (!(Test-Path $statePath)) { Write-Host 'No hay una ejecución registrada.'; return }
$state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
function Stop-OwnedTree([int]$processId) {
    Get-CimInstance Win32_Process -Filter "ParentProcessId=$processId" | ForEach-Object { Stop-OwnedTree $_.ProcessId }
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}
foreach ($entry in $state.Processes) {
    $process = Get-Process -Id $entry.Id -ErrorAction SilentlyContinue
    if ($process -and $process.StartTime.ToUniversalTime().Ticks -eq $entry.Started) {
        $command = (Get-CimInstance Win32_Process -Filter "ProcessId=$($entry.Id)").CommandLine
        if ($command -notlike "*$repoRoot*") { throw 'El proceso registrado no pertenece a esta copia del proyecto.' }
        Stop-OwnedTree $entry.Id
    }
}
Remove-Item -LiteralPath $statePath
Write-Host 'API y web de esta ejecución detenidas.'
