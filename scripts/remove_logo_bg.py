from collections import deque
from pathlib import Path

from PIL import Image

src = Path(r"C:\Users\geony\AppData\Local\Temp\cura-logo-in.png")
dst = Path(r"C:\Users\geony\AppData\Local\Temp\cura-logo-out.png")

img = Image.open(src).convert("RGBA")
w, h = img.size
px = img.load()

def is_background(r, g, b, a):
    if a == 0:
        return True
    # White canvas and the soft grey drop-shadow around the squircle.
    mn = min(r, g, b)
    mx = max(r, g, b)
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    low_chroma = (mx - mn) < 28
    return lum >= 205 and low_chroma and mn >= 175

visited = [[False] * w for _ in range(h)]
q = deque()

def try_enqueue(x, y):
    if x < 0 or y < 0 or x >= w or y >= h or visited[y][x]:
        return
    r, g, b, a = px[x, y]
    if not is_background(r, g, b, a):
        return
    visited[y][x] = True
    q.append((x, y))

for x in range(w):
    try_enqueue(x, 0)
    try_enqueue(x, h - 1)
for y in range(h):
    try_enqueue(0, y)
    try_enqueue(w - 1, y)

while q:
    x, y = q.popleft()
    try_enqueue(x + 1, y)
    try_enqueue(x - 1, y)
    try_enqueue(x, y + 1)
    try_enqueue(x, y - 1)

for y in range(h):
    for x in range(w):
        if visited[y][x]:
            r, g, b, _ = px[x, y]
            px[x, y] = (r, g, b, 0)

img.save(dst, "PNG")
print(f"saved {dst} {w}x{h}")
