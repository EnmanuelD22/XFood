$ErrorActionPreference = 'Stop'
$repoPath = Split-Path $PSScriptRoot -Parent
Push-Location $repoPath
$previousConnection = $env:ConnectionStrings__XFood
try {
    # Read the configured server/credentials without printing them. Always override the database.
    $projectXml = [xml](Get-Content src/XFood.Api/XFood.Api.csproj -Raw)
    $secretFile = Join-Path $env:APPDATA ('Microsoft\UserSecrets\' + $projectXml.Project.PropertyGroup.UserSecretsId + '\secrets.json')
    $settings = Get-Content -LiteralPath $secretFile -Raw | ConvertFrom-Json
    $sourceConnection = $settings.'ConnectionStrings:XFood'
    if (-not $sourceConnection) { $sourceConnection = $settings.ConnectionStrings.XFood }
    if (-not $sourceConnection) { throw 'Missing local User Secrets connection.' }
    $builder = [System.Data.SqlClient.SqlConnectionStringBuilder]::new([string]$sourceConnection)
    $validationDatabase = 'XFood_Validation_' + [DateTime]::UtcNow.ToString('yyyyMMdd_HHmmss') + '_' + [Guid]::NewGuid().ToString('N').Substring(0,8)
    if ($validationDatabase -eq 'XFoodDB' -or $validationDatabase -notmatch '^XFood_Validation_[0-9]{8}_[0-9]{6}_[a-f0-9]{8}$') { throw 'Invalid isolated database name.' }
    $builder.set_InitialCatalog('master')
    $master = [System.Data.SqlClient.SqlConnection]::new($builder.get_ConnectionString())
    try {
        $master.Open()
        $check = $master.CreateCommand()
        $check.CommandText = 'SELECT DB_ID(@database);'
        [void]$check.Parameters.AddWithValue('@database', $validationDatabase)
        if ($check.ExecuteScalar() -isnot [DBNull]) { throw 'Validation database must be new.' }
    } finally { $master.Dispose() }
    $builder.set_InitialCatalog($validationDatabase)
    $env:ConnectionStrings__XFood = $builder.get_ConnectionString()
    Write-Output ('Isolated database: ' + $validationDatabase)
    dotnet tool run dotnet-ef database update AddV1DataModel --project src/XFood.Infrastructure --startup-project src/XFood.Api --context XFoodDbContext
    if ($LASTEXITCODE -ne 0) { throw 'Isolated migration application failed.' }
    $connection = [System.Data.SqlClient.SqlConnection]::new($builder.get_ConnectionString())
    try {
        $connection.Open()
        $command = $connection.CreateCommand()
        $command.CommandText = Get-Content tests/SqlServerSmoke.sql -Raw
        $command.CommandTimeout = 60
        $reader = $command.ExecuteReader()
        do { while ($reader.Read()) { Write-Output $reader.GetString(0) } } while ($reader.NextResult())
        $reader.Close()
    } finally { $connection.Dispose() }
    Write-Output 'Migration and SQL checks passed. Database retained; fixture transaction rolled back.'
} finally {
    $env:ConnectionStrings__XFood = $previousConnection
    Pop-Location
}
