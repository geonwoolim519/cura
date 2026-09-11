Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public static class CuraLogoBg {
  public static void Run(string src, string dst) {
    using (var srcImg = Image.FromFile(src))
    using (var bmp = new Bitmap(srcImg.Width, srcImg.Height, PixelFormat.Format32bppArgb))
    using (var g = Graphics.FromImage(bmp)) {
      g.DrawImage(srcImg, 0, 0, srcImg.Width, srcImg.Height);
      var rect = new Rectangle(0, 0, bmp.Width, bmp.Height);
      var data = bmp.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
      int w = bmp.Width, h = bmp.Height, stride = data.Stride;
      byte[] px = new byte[Math.Abs(stride) * h];
      Marshal.Copy(data.Scan0, px, 0, px.Length);

      Func<int,int,bool> isBg = (x, y) => {
        int i = y * stride + x * 4;
        int b = px[i], gch = px[i+1], r = px[i+2], a = px[i+3];
        if (a == 0) return true;
        int mn = Math.Min(r, Math.Min(gch, b));
        int mx = Math.Max(r, Math.Max(gch, b));
        double lum = 0.299 * r + 0.587 * gch + 0.114 * b;
        return lum >= 198 && (mx - mn) < 32 && mn >= 165;
      };

      bool[] vis = new bool[w * h];
      var q = new Queue<int>();
      Action<int,int> enq = (x, y) => {
        if (x < 0 || y < 0 || x >= w || y >= h) return;
        int k = y * w + x;
        if (vis[k] || !isBg(x, y)) return;
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
          int i = y * stride + x * 4;
          px[i + 3] = 0;
        }
      }

      Marshal.Copy(px, 0, data.Scan0, px.Length);
      bmp.UnlockBits(data);
      bmp.Save(dst, ImageFormat.Png);
    }
  }
}
"@

$in = "C:\Users\geony\AppData\Local\Temp\cura-logo-in.png"
$out = "C:\Users\geony\AppData\Local\Temp\cura-logo-out.png"
Copy-Item -LiteralPath "C:\큐라\public\branding\logo.png" -Destination $in -Force
[CuraLogoBg]::Run($in, $out)
Copy-Item -LiteralPath $out -Destination "C:\큐라\public\branding\logo.png" -Force
Write-Host "logo updated" (Get-Item $out).Length
