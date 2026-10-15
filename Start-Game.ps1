$projectDirectory = Join-Path $PSScriptRoot 'prototype'
$connection = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue
if (-not $connection) { Start-Process -FilePath 'node' -ArgumentList ('"' + (Join-Path $projectDirectory 'server.cjs') + '"') -WorkingDirectory $projectDirectory -WindowStyle Hidden; Start-Sleep -Seconds 2 }
Start-Process 'http://127.0.0.1:4173'
