Add-Type -AssemblyName System.Drawing
$srcPath = 'C:\큐라\public\branding\curi-sheet.png'
$img = [System.Drawing.Image]::FromFile($srcPath)
$w = $img.Width
$h = $img.Height
Write-Host "sheet $w x $h"

$boxes = @{
  'curi-main.png'    = @(0.26, 0.05, 0.54, 0.50)
  'curi-wink.png'    = @(0.70, 0.125, 0.88, 0.275)
  'curi-think.png'   = @(0.70, 0.30, 0.88, 0.45)
  'curi-search.png'  = @(0.04, 0.555, 0.21, 0.755)
  'curi-laptop.png'  = @(0.24, 0.555, 0.41, 0.755)
  'curi-present.png' = @(0.44, 0.555, 0.64, 0.755)
  'curi-idea.png'    = @(0.68, 0.555, 0.86, 0.755)
}

function Save-Crop([string]$name, [double[]]$r) {
  $x = [int]($w * $r[0])
  $y = [int]($h * $r[1])
  $cw = [int]($w * ($r[2] - $r[0]))
  $ch = [int]($h * ($r[3] - $r[1]))
  $rect = New-Object System.Drawing.Rectangle $x, $y, $cw, $ch
  $bmp = New-Object System.Drawing.Bitmap $cw, $ch
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.DrawImage($img, (New-Object System.Drawing.Rectangle 0,0,$cw,$ch), $rect, [System.Drawing.GraphicsUnit]::Pixel)
  $out = Join-Path 'C:\큐라\public\branding' $name
  $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
  Write-Host "saved $name ${cw}x${ch}"
}

foreach ($k in $boxes.Keys) { Save-Crop $k $boxes[$k] }
$img.Dispose()
