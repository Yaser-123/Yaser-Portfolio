# Script to create a junction from local external-frames to an external folder
# This allows the website to use images from any external location without hardcoding paths

param(
    [Parameter(Mandatory=$true)]
    [string]$ExternalPath
)

# Create the junction only if the target path exists
if (Test-Path -Path $ExternalPath) {
    # Remove existing junction if it exists
    if (Test-Path -Path ".\external-frames") {
        Remove-Item -Path ".\external-frames" -Force
    }

    # Create the junction
    New-Item -ItemType Junction -Path ".\external-frames" -Target $ExternalPath
    Write-Host "Junction created successfully from .\external-frames to $ExternalPath"

    # Update the script.js to use this junction
    $scriptContent = Get-Content -Path ".\script.js" -Raw
    $newContent = $scriptContent -replace "const FRAMES_PATH = './pv2-unscreen'", "const FRAMES_PATH = './external-frames'"
    $newContent | Set-Content -Path ".\script.js" -NoNewline

    Write-Host "script.js updated to use the external-frames junction"
} else {
    Write-Error "External path '$ExternalPath' does not exist. Junction not created."
}