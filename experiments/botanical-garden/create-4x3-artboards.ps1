Add-Type -AssemblyName System.Drawing

function New-Artboard([string]$inputPath,[string]$outputPath,[int]$canvasWidth,[int]$canvasHeight) {
    $source = [System.Drawing.Image]::FromFile($inputPath)
    $canvas = New-Object System.Drawing.Bitmap($canvasWidth,$canvasHeight)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.Clear([System.Drawing.ColorTranslator]::FromHtml('#F2E9D8'))
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    # The panorama stays perfectly proportional inside the new 4:3 artboard.
    $scale = [Math]::Min($canvasWidth / $source.Width, $canvasHeight / $source.Height)
    $drawWidth = [int]($source.Width * $scale)
    $drawHeight = [int]($source.Height * $scale)
    $x = [int](($canvasWidth - $drawWidth) / 2)
    $y = [int](($canvasHeight - $drawHeight) / 2)
    $g.DrawImage($source,(New-Object System.Drawing.Rectangle($x,$y,$drawWidth,$drawHeight)))
    $canvas.Save($outputPath,[System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $canvas.Dispose(); $source.Dispose()
}

$root = Split-Path -Parent $PSScriptRoot
$art = Join-Path $PSScriptRoot 'art'
New-Artboard (Join-Path $art 'outline.png') (Join-Path $art 'outline-4x3.png') 1600 1200
New-Artboard (Join-Path $art 'colour.png') (Join-Path $art 'colour-4x3.png') 1600 1200
