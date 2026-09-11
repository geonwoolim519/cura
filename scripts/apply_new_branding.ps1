Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public static class CuraBrand2026 {
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

  static void FloodClear(byte[] px, int w, int h, int stride, Func<int,int,int,int,bool> isBg) {
    bool[] vis = new bool[w * h];
    var q = new Queue<int>();
    Action<int,int> enq = (x, y) => {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      int k = y * w + x;
      if (vis[k]) return;
      int i = y * stride + x * 4;
      if (px[i + 3] == 0) { vis[k] = true; return; }
      if (!isBg(px[i], px[i + 1], px[i + 2], px[i + 3])) return;
      vis[k] = true;
      q.Enqueue(k);
    };
    for (int x = 0; x < w; x++) { enq(x, 0); enq(x, h - 1); }
    for (int y = 0; y < h; y++) { enq(0, y); enq(w - 1, y); }
    int[] dx = { 1, -1, 0, 0 };
    int[] dy = { 0, 0, 1, -1 };
    while (q.Count > 0) {
      int k = q.Dequeue();
      int x = k % w, y = k / w;
      for (int t = 0; t < 4; t++) enq(x + dx[t], y + dy[t]);
    }
    for (int y = 0; y < h; y++) {
      for (int x = 0; x < w; x++) {
        if (!vis[y * w + x]) continue;
        px[y * stride + x * 4 + 3] = 0;
      }
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
    int cx = box.X + box.Width / 5;
    int cy = box.Y + box.Height / 2;
    int i = cy * stride + cx * 4;
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

  static Bitmap SquareIcon(Bitmap src, int size, Color fill) {
    var dst = new Bitmap(size, size, PixelFormat.Format32bppArgb);
    using (var g = Graphics.FromImage(dst)) {
      g.Clear(fill);
      g.CompositingQuality = CompositingQuality.HighQuality;
      g.InterpolationMode = InterpolationMode.HighQualityBicubic;
      g.PixelOffsetMode = PixelOffsetMode.HighQuality;
      g.SmoothingMode = SmoothingMode.HighQuality;
      g.DrawImage(src, new Rectangle(0, 0, size, size));
    }
    return dst;
  }

  public static void Run(string logoSrc, string curiSrc, string brandingDir, string appleOut) {
    using (var logoImg = Image.FromFile(logoSrc))
    using (var logo = To32(logoImg)) {
      BitmapData data; int stride;
      byte[] px = Lock(logo, out data, out stride);
          FloodClear(px, logo.Width, logo.Height, stride, (b, gch, r, a) => {
        int mx = Math.Max(r, Math.Max(gch, b));
        double lum = 0.299 * r + 0.587 * gch + 0.114 * b;
        return mx < 36 && (b - r) < 18 && lum < 28;
      });
      Rectangle box = OpaqueBounds(px, logo.Width, logo.Height, stride, 18);
      Color navy = Color.FromArgb(255, 11, 33, 83);
      Unlock(logo, data, px);

      using (var cropped = Crop(logo, box)) {
        cropped.Save(System.IO.Path.Combine(brandingDir, "logo.png"), ImageFormat.Png);
        int[] sizes = { 32, 180, 192, 512 };
        string[] names = { "favicon-32.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png" };
        for (int i = 0; i < sizes.Length; i++) {
          using (var icon = SquareIcon(cropped, sizes[i], navy)) {
            string dest = sizes[i] == 180
              ? appleOut
              : System.IO.Path.Combine(brandingDir, names[i]);
            icon.Save(dest, ImageFormat.Png);
            if (sizes[i] == 180) {
              icon.Save(System.IO.Path.Combine(brandingDir, "apple-touch-icon.png"), ImageFormat.Png);
            }
          }
        }
        using (var maskable = SquareIcon(cropped, 512, navy)) {
          maskable.Save(System.IO.Path.Combine(brandingDir, "icon-512-maskable.png"), ImageFormat.Png);
        }
      }
    }

    using (var curiImg = Image.FromFile(curiSrc))
    using (var curi = To32(curiImg)) {
      BitmapData data; int stride;
      byte[] px = Lock(curi, out data, out stride);
      FloodClear(px, curi.Width, curi.Height, stride, (b, gch, r, a) => {
        int mx = Math.Max(r, Math.Max(gch, b));
        int mn = Math.Min(r, Math.Min(gch, b));
        double lum = 0.299 * r + 0.587 * gch + 0.114 * b;
        return lum >= 236 && (mx - mn) < 18 && mn >= 220;
      });
      Unlock(curi, data, px);
      curi.Save(System.IO.Path.Combine(brandingDir, "curi.png"), ImageFormat.Png);
    }
  }
}
"@

$tmp = "C:\Users\geony\AppData\Local\Temp\cura-brand"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null

$srcLogo = "C:\Users\geony\.cursor\projects\c\assets\c__Users_geony_AppData_Roaming_Cursor_User_workspaceStorage_4cf07cc1b73934aa596214d2c1d19c23_images_ChatGPT_Image_2026__9__11_____04_34_42-0d15639e-3c86-4bfc-a791-4dec3c52c804.png"
$srcCuri = "C:\Users\geony\.cursor\projects\c\assets\c__Users_geony_AppData_Roaming_Cursor_User_workspaceStorage_4cf07cc1b73934aa596214d2c1d19c23_images_ChatGPT_Image_2026__9__11_____04_37_15-0a8777eb-6701-4412-843e-68e87749db4e.jpg"

Copy-Item -LiteralPath $srcLogo -Destination "$tmp\logo-src.png" -Force
Copy-Item -LiteralPath $srcCuri -Destination "$tmp\curi-src.jpg" -Force

$branding = "C:\Users\geony\AppData\Local\Temp\cura-brand-out"
New-Item -ItemType Directory -Force -Path $branding | Out-Null
$apple = "$tmp\apple-touch-icon.png"

[CuraBrand2026]::Run("$tmp\logo-src.png", "$tmp\curi-src.jpg", $branding, $apple)

$dest = Join-Path (Get-Location) "public\branding"
Get-ChildItem $branding -File | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $dest $_.Name) -Force
}
Copy-Item -LiteralPath $apple -Destination (Join-Path (Get-Location) "public\apple-touch-icon.png") -Force
Get-ChildItem $dest | Select-Object Name, Length
Get-Item (Join-Path (Get-Location) "public\apple-touch-icon.png") | Select-Object Name, Length
