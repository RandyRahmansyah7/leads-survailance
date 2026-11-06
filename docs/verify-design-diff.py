#!/usr/bin/env python3
"""Bandingkan render aplikasi (screenshot) dengan design1-3.jpeg.

Pemakaian:
  1. Jalankan app:        npm run dev
  2. Screenshot viewport: google-chrome --headless=new --disable-gpu --hide-scrollbars \
        --force-device-scale-factor=1 --virtual-time-budget=6000 \
        --window-size=1004,625 --screenshot=/tmp/render-d2.png http://localhost:3000
  3. Jalankan script ini: python3 docs/verify-design-diff.py

Output: angka kemiripan (match% dengan toleransi selisih channel 24, MAE),
plus gambar side-by-side (desain | render | heatmap) di /tmp/opencode/diff/.
Butuh: python3 + pillow + numpy.
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = Path("/tmp/opencode/diff")
OUT.mkdir(parents=True, exist_ok=True)

# (nama, file design, crop area aplikasi di design, file render)
PAIRS = [
    ("d1", "design1.jpeg", (0, 55, 1003, 679), "/tmp/opencode/shots/render-d1.png"),
    ("d2", "design2.jpeg", (3, 54, 1007, 679), "/tmp/opencode/shots/render-d2.png"),
    ("d3", "design3.jpeg", (4, 79, 1076, 704), "/tmp/opencode/shots/render-d3.png"),
]

TOLERANCE = 24  # selisih channel maksimum yang dianggap "mirip"


def best_offset(design: np.ndarray, render: np.ndarray, box, rng=6, step=4):
    x0, y0, x1, y1 = box
    best = None
    for dy in range(-rng, rng + 1):
        for dx in range(-rng, rng + 1):
            crop = design[y0 + dy : y1 + dy, x0 + dx : x1 + dx]
            if crop.shape != render.shape:
                continue
            mae = np.abs(
                crop[::step, ::step].astype(np.float32)
                - render[::step, ::step].astype(np.float32)
            ).mean()
            if best is None or mae < best[0]:
                best = (mae, dx, dy)
    return best


for name, design_file, box, render_file in PAIRS:
    design = np.asarray(Image.open(ROOT / design_file).convert("RGB"), dtype=np.uint8)
    render_img = Image.open(render_file).convert("RGB")
    render = np.asarray(render_img, dtype=np.uint8)

    _, dx, dy = best_offset(design, render, box)
    x0, y0, x1, y1 = box
    crop = Image.fromarray(design[y0 + dy : y1 + dy, x0 + dx : x1 + dx])

    per_px = np.abs(render.astype(np.int16) - np.asarray(crop, dtype=np.int16)).max(axis=2)
    H, W = per_px.shape
    map_mask = np.zeros((H, W), dtype=bool)
    map_mask[53 : H - 50, 248:] = True  # area peta yang sengaja dikosongkan
    ui_mask = ~map_mask

    print(
        f"{name}: dx={dx} dy={dy} | match<= {TOLERANCE}: "
        f"overall {(per_px <= TOLERANCE).mean() * 100:.1f}% | "
        f"non-map(UI) {(per_px[ui_mask] <= TOLERANCE).mean() * 100:.1f}% | "
        f"MAE {per_px.mean():.1f}"
    )

    heat = np.zeros((H, W, 3), dtype=np.uint8)
    heat[..., 0] = np.clip(per_px * 3, 0, 255)
    heat[..., 1] = np.clip(255 - per_px * 3, 0, 255) // 3
    sbs = Image.new("RGB", (W, H * 3 + 8), (255, 255, 255))
    sbs.paste(crop, (0, 0))
    sbs.paste(render_img, (0, H + 4))
    sbs.paste(Image.fromarray(heat), (0, 2 * H + 8))
    sbs.save(OUT / f"sbs-{name}.png")
