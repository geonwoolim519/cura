from pathlib import Path
from PIL import Image

src = Path(r"C:\큐라\public\branding\curi-sheet.png")
im = Image.open(src)
w, h = im.size
print("sheet", w, h, im.mode)

# Layout of the provided character sheet (measured from the composition):
# hero owl with tablet sits left-of-center; expression grid on the right;
# four full-body poses along the lower band.
boxes = {
    "curi-main.png": (int(w * 0.24), int(h * 0.04), int(w * 0.58), int(h * 0.52)),
    "curi-wink.png": (int(w * 0.72), int(h * 0.12), int(w * 0.92), int(h * 0.28)),
    "curi-smile.png": (int(w * 0.84), int(h * 0.12), int(w * 0.99), int(h * 0.28)),
    "curi-think.png": (int(w * 0.72), int(h * 0.29), int(w * 0.86), int(h * 0.45)),
    "curi-search.png": (int(w * 0.03), int(h * 0.55), int(w * 0.22), int(h * 0.76)),
    "curi-laptop.png": (int(w * 0.23), int(h * 0.55), int(w * 0.42), int(h * 0.76)),
    "curi-present.png": (int(w * 0.43), int(h * 0.55), int(w * 0.66), int(h * 0.76)),
    "curi-idea.png": (int(w * 0.68), int(h * 0.55), int(w * 0.88), int(h * 0.76)),
}

out = Path(r"C:\큐라\public\branding")
for name, box in boxes.items():
    crop = im.crop(box)
    dest = out / name
    crop.save(dest, "PNG")
    print(name, crop.size)
