$ErrorActionPreference = 'Stop'

Write-Host 'Create initial Hashti user' -ForegroundColor Cyan
Write-Host 'Run this script from the project root containing docker-compose.yml.'

$mobile = (Read-Host 'Mobile number (11 digits, e.g. 09123456789)').Trim()
$firstName = (Read-Host 'First name').Trim()
$lastName = (Read-Host 'Last name').Trim()
$securePassword = Read-Host 'Initial password (minimum 8 characters)' -AsSecureString
$bstr = [IntPtr]::Zero
$password = $null
$json = $null
$payloadBase64 = $null
$exitCode = 1

try {
    if ($mobile -notmatch '^09\d{9}$') {
        throw 'Mobile number must be 11 digits and start with 09.'
    }
    if ([string]::IsNullOrWhiteSpace($firstName) -or [string]::IsNullOrWhiteSpace($lastName)) {
        throw 'First name and last name are required.'
    }

    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    if ($password.Length -lt 8) {
        throw 'Password must contain at least 8 characters.'
    }

    $payloadObject = [ordered]@{
        mobile = $mobile
        firstName = $firstName
        lastName = $lastName
        password = $password
    }

    $json = ConvertTo-Json -InputObject $payloadObject -Compress
    $payloadBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($json))

    $projectRoot = Get-Location
    if (-not (Test-Path (Join-Path $projectRoot 'docker-compose.yml')) -and
        -not (Test-Path (Join-Path $projectRoot 'compose.yml'))) {
        throw 'docker-compose.yml or compose.yml was not found. Run this script from the project root.'
    }

    $nodeSource = Join-Path $PSScriptRoot 'create-hashti-user.cjs'
    if (-not (Test-Path $nodeSource)) {
        throw 'The companion file create-hashti-user.cjs must be in the same folder as this script.'
    }

    docker compose cp $nodeSource 'backend:/app/node_modules/.cache/create-hashti-user.cjs'
    if ($LASTEXITCODE -ne 0) { throw 'Could not copy the temporary account-creation script into the backend container.' }

    $payloadBase64 | docker compose exec -T backend node /app/node_modules/.cache/create-hashti-user.cjs
    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0) { throw 'Account creation failed. Review the error above.' }
}
finally {
    if ($bstr -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
    $securePassword.Dispose()
    $password = $null
    $json = $null
    $payloadBase64 = $null
    $payloadObject = $null
}

if ($exitCode -eq 0) {
    Write-Host 'Finished. The password was not printed.' -ForegroundColor Green
}
