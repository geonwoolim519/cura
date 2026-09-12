Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public static class CuraHomeIcon {
  static byte[] Lock(Bitmap bmp, out BitmapData data, out int stride) {
    data = bmp.LockBits(new Rectangle(0, 0, bmp.Width, bmp.Height), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
    stride = data.Stride;
    byte[] px = new byte[Math.Abs(stride) * bmp.Height];
    Marshal.Copy(data.Scan0, px, 0, px.Length);
    return px;
  }

  static void Unlock(Bitmap bmp, BitmapData data, byte[] px) {
    Marshal.Copy(px, 0, data.Scan0, px.Length);
    bmp.UnlockBits(data);
  }

  static Bitmap To32(Image src) {
    var bmp = new Bitmap(src.Width, src.Height, PixelFormat.Format32bppArgb);
    using (var g = Graphics.FromImage(bmp)) {
      g.CompositingMode = CompositingMode.SourceCopy;
      g.DrawImage(src, 0, 0, src.Width, src.Height);
    }
    return bmp;
  }

  static bool IsOuterBg(int b, int gch, int r, int a) {
    if (a < 8) return true;
    int mx = Math.Max(r, Math.Max(gch, b));
    int mn = Math.Min(r, Math.Min(gch, b));
    double lum = 0.299 * r + 0.587 * gch + 0.114 * b;
    if (lum <= 38 && (mx - mn) <= 28) return true;
    if (lum >= 210 && (mx - mn) <= 36 && mn >= 180) return true;
    return false;
  }

  static void FloodClear(byte[] px, int w, int h, int stride) {
    bool[] vis = new bool[w * h];
    var q = new Queue<int>();
    Action<int,int> enq = (x, y) => {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      int k = y * w + x;
      if (vis[k]) return;
      int i = y * stride + x * 4;
      if (!IsOuterBg(px[i], px[i + 1], px[i + 2], px[i + 3])) return;
      vis[k] = true;
      q.Enqueue(k);
    };
    for (int x = 0; x < w; x++) { enq(x, 0); enq(x, h - 1); }
    for (int y = 0; y < h; y++) { enq(0, y); enq(w - 1, y); }
    int[] dx = { 1, -1, 0, 0, 1, 1, -1, -1 };
    int[] dy = { 0, 0, 1, -1, 1, -1, 1, -1 };
    while (q.Count > 0) {
      int k = q.Dequeue();
      int x = k % w, y = k / w;
      for (int t = 0; t < 8; t++) enq(x + dx[t], y + dy[t]);
    }
    for (int y = 0; y < h; y++) {
      for (int x = 0; x < w; x++) {
        if (!vis[y * w + x]) continue;
        px[y * stride + x * 4 + 3] = 0;
      }
    }
  }

  static void EatFringe(byte[] px, int w, int h, int stride) {
    bool[] drop = new bool[w * h];
    int[] dx = { 1, -1, 0, 0, 1, 1, -1, -1 };
    int[] dy = { 0, 0, 1, -1, 1, -1, 1, -1 };
    for (int y = 1; y < h - 1; y++) {
      for (int x = 1; x < w - 1; x++) {
        int i = y * stride + x * 4;
        int a = px[i + 3];
        if (a == 0) continue;
        bool nearClear = false;
        for (int t = 0; t < 8; t++) {
          int ni = (y + dy[t]) * stride + (x + dx[t]) * 4;
          if (px[ni + 3] < 16) { nearClear = true; break; }
        }
        if (!nearClear) continue;
        int b = px[i], gch = px[i + 1], r = px[i + 2];
        double lum = 0.299 * r + 0.587 * gch + 0.114 * b;
        if (a < 230 || lum < 70) drop[y * w + x] = true;
      }
    }
    for (int k = 0; k < drop.Length; k++) {
      if (!drop[k]) continue;
      int x = k % w, y = k / w;
      px[y * stride + x * 4 + 3] = 0;
    }
  }

  static Rectangle OpaqueBounds(byte[] px, int w, int h, int stride, byte minA) {
    int minX = w, minY = h, maxX = -1, maxY = -1;
    for (int y = 0; y < h; y++) {
      for (int x = 0; x < w; x++) {
        if (px[y * stride + x * 4 + 3] < minA) continue;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
    if (maxX < 0) return new Rectangle(0, 0, w, h);
    return Rectangle.FromLTRB(minX, minY, maxX + 1, maxY + 1);
  }

  static Color SampleNavy(byte[] px, int stride, Rectangle box) {
    int x = box.X + box.Width / 2;
    int y = box.Y + Math.Max(8, box.Height / 12);
    int i = y * stride + x * 4;
    return Color.FromArgb(255, px[i + 2], px[i + 1], px[i]);
  }

  static Bitmap Crop(Bitmap src, Rectangle box) {
    var dst = new Bitmap(box.Width, box.Height, PixelFormat.Format32bppArgb);
    using (var g = Graphics.FromImage(dst)) {
      g.CompositingMode = CompositingMode.SourceCopy;
      g.DrawImage(src, new Rectangle(0, 0, box.Width, box.Height), box, GraphicsUnit.Pixel);
    }
    return dst;
  }

  static Bitmap FullBleed(Bitmap src, int size, Color navy, float pad) {
    var dst = new Bitmap(size, size, PixelFormat.Format32bppArgb);
    using (var g = Graphics.FromImage(dst)) {
      g.Clear(navy);
      g.CompositingMode = CompositingMode.SourceOver;
      g.CompositingQuality = CompositingQuality.HighQuality;
      g.InterpolationMode = InterpolationMode.HighQualityBicubic;
      g.PixelOffsetMode = PixelOffsetMode.HighQuality;
      g.SmoothingMode = SmoothingMode.HighQuality;
      int inset = (int)Math.Round(size * pad);
      g.DrawImage(src, new Rectangle(inset, inset, size - inset * 2, size - inset * 2));
    }
    return dst;
  }

  public static void Run(string srcPath, string brandingDir, string appleOut) {
    using (var srcImg = Image.FromFile(srcPath))
    using (var src = To32(srcImg)) {
      BitmapData data; int stride;
      byte[] px = Lock(src, out data, out stride);
      FloodClear(px, src.Width, src.Height, stride);
      EatFringe(px, src.Width, src.Height, stride);
      Rectangle box = OpaqueBounds(px, src.Width, src.Height, stride, 24);
      Color navy = SampleNavy(px, stride, box);
      Unlock(src, data, px);

      using (var cropped = Crop(src, box)) {
        using (var fav = FullBleed(cropped, 32, navy, 0f))
          fav.Save(System.IO.Path.Combine(brandingDir, "favicon-32.png"), ImageFormat.Png);
        using (var i192 = FullBleed(cropped, 192, navy, 0f))
          i192.Save(System.IO.Path.Combine(brandingDir, "icon-192.png"), ImageFormat.Png);
        using (var i512 = FullBleed(cropped, 512, navy, 0f))
          i512.Save(System.IO.Path.Combine(brandingDir, "icon-512.png"), ImageFormat.Png);
        using (var mask = FullBleed(cropped, 512, navy, 0.08f))
          mask.Save(System.IO.Path.Combine(brandingDir, "icon-512-maskable.png"), ImageFormat.Png);
        using (var apple = FullBleed(cropped, 180, navy, 0f)) {
          apple.Save(appleOut, ImageFormat.Png);
          apple.Save(System.IO.Path.Combine(brandingDir, "apple-touch-icon.png"), ImageFormat.Png);
        }
      }
    }
  }
}
"@

$tmp = "C:\Users\geony\AppData\Local\Temp\cura-home-icon"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$out = Join-Path $tmp "out"
New-Item -ItemType Directory -Force -Path $out | Out-Null

$src = "C:\Users\geony\.cursor\projects\c\assets\c__Users_geony_AppData_Roaming_Cursor_User_workspaceStorage_4cf07cc1b73934aa596214d2c1d19c23_images_ChatGPT_Image_2026__9__11_____04_34_42-0f940fef-3c9b-4785-b405-599270ffa39d.png"
Copy-Item -LiteralPath $src -Destination "$tmp\src.png" -Force

$apple = Join-Path $tmp "apple-touch-icon.png"
[CuraHomeIcon]::Run("$tmp\src.png", $out, $apple)

$root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $root "public\branding"))) {
  $root = (Get-Location).Path
}
$branding = Join-Path $root "public\branding"
Get-ChildItem $out -File | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $branding $_.Name) -Force
}
Copy-Item -LiteralPath $apple -Destination (Join-Path $root "public\apple-touch-icon.png") -Force
Get-ChildItem $branding -File | Where-Object { $_.Name -match "icon|favicon|apple" } | Select-Object Name, Length
Get-Item (Join-Path $root "public\apple-touch-icon.png") | Select-Object FullName, Length
