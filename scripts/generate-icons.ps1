Add-Type -AssemblyName System.Drawing

$srcPath = Join-Path $PSScriptRoot "..\public\icon-1024.png"
if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found at $srcPath"
    exit 1
}

$srcImage = [System.Drawing.Image]::FromFile((Resolve-Path $srcPath))
Write-Host "Source image loaded: $($srcImage.Width) x $($srcImage.Height)"

$resDir = Join-Path $PSScriptRoot "..\android\app\src\main\res"

$densities = @(
    @{ Name = "mipmap-mdpi";    LauncherSize = 48;  FgSize = 108; SafeSize = 72 },
    @{ Name = "mipmap-hdpi";    LauncherSize = 72;  FgSize = 162; SafeSize = 108 },
    @{ Name = "mipmap-xhdpi";   LauncherSize = 96;  FgSize = 216; SafeSize = 144 },
    @{ Name = "mipmap-xxhdpi";  LauncherSize = 144; FgSize = 324; SafeSize = 216 },
    @{ Name = "mipmap-xxxhdpi"; LauncherSize = 192; FgSize = 432; SafeSize = 288 }
)

function Save-ResizedSquare([System.Drawing.Image]$source, [int]$size, [string]$outPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($source, 0, 0, $size, $size)
    $g.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

function Save-ResizedRound([System.Drawing.Image]$source, [int]$size, [string]$outPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(0, 0, $size, $size)
    $g.SetClip($path)
    $g.DrawImage($source, 0, 0, $size, $size)
    $path.Dispose()
    $g.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

function Save-AdaptiveForeground([System.Drawing.Image]$source, [int]$canvasSize, [int]$iconSize, [string]$outPath) {
    $bmp = New-Object System.Drawing.Bitmap($canvasSize, $canvasSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $offset = [int](($canvasSize - $iconSize) / 2)
    $g.DrawImage($source, $offset, $offset, $iconSize, $iconSize)
    $g.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

foreach ($d in $densities) {
    $targetFolder = Join-Path $resDir $d.Name
    if (-not (Test-Path $targetFolder)) {
        New-Item -ItemType Directory -Path $targetFolder -Force | Out-Null
    }

    $launcherPng = Join-Path $targetFolder "ic_launcher.png"
    $roundPng    = Join-Path $targetFolder "ic_launcher_round.png"
    $fgPng       = Join-Path $targetFolder "ic_launcher_foreground.png"

    Save-ResizedSquare $srcImage $d.LauncherSize $launcherPng
    Save-ResizedRound  $srcImage $d.LauncherSize $roundPng
    Save-AdaptiveForeground $srcImage $d.FgSize $d.SafeSize $fgPng

    Write-Host "Generated: $($d.Name) [Launcher: $($d.LauncherSize)x$($d.LauncherSize), Fg: $($d.FgSize)x$($d.FgSize)]"
}

$srcImage.Dispose()
Write-Host "All Android launcher icons successfully generated!"
