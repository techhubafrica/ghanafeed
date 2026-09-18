Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\pc\.gemini\antigravity\brain\1ef29725-d451-4fc1-b763-86dc27b3079f\.user_uploaded\media_1789722651362.png"
$publicDir = "c:\Users\pc\Downloads\ghanafeed\public"
$distClientDir = "c:\Users\pc\Downloads\ghanafeed\dist\client"
$androidAssetsDir = "c:\Users\pc\Downloads\ghanafeed\android\app\src\main\assets\public"

# Copy original 1024 to public
Copy-Item -Path $sourcePath -Destination (Join-Path $publicDir "icon-1024.png") -Force
Write-Host "Updated public/icon-1024.png"

$srcImage = [System.Drawing.Image]::FromFile($sourcePath)

function Resize-Image([System.Drawing.Image]$src, [int]$size, [string]$outPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($src, 0, 0, $size, $size)
    $g.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Generated: $outPath ($size x $size)"
}

Resize-Image $srcImage 512 (Join-Path $publicDir "icon-512.png")
Resize-Image $srcImage 192 (Join-Path $publicDir "icon-192.png")
Resize-Image $srcImage 180 (Join-Path $publicDir "apple-touch-icon.png")
Resize-Image $srcImage 64  (Join-Path $publicDir "favicon.png")

$srcImage.Dispose()

# Now run the existing android mipmap icon generator script
& (Join-Path $PSScriptRoot "generate-icons.ps1")

# If android assets exist, copy the web icons there too
if (Test-Path $androidAssetsDir) {
    Copy-Item (Join-Path $publicDir "icon-1024.png") (Join-Path $androidAssetsDir "icon-1024.png") -Force
    Copy-Item (Join-Path $publicDir "icon-512.png") (Join-Path $androidAssetsDir "icon-512.png") -Force
    Copy-Item (Join-Path $publicDir "icon-192.png") (Join-Path $androidAssetsDir "icon-192.png") -Force
    Copy-Item (Join-Path $publicDir "apple-touch-icon.png") (Join-Path $androidAssetsDir "apple-touch-icon.png") -Force
    Copy-Item (Join-Path $publicDir "favicon.png") (Join-Path $androidAssetsDir "favicon.png") -Force
    Write-Host "Synced to android assets"
}

Write-Host "All icons successfully updated!"
