#!/usr/bin/env python3
"""Generate the brand Open Graph image for Ruvicode.

Produces public/og/ruvicode-default.png (1200x630) using the existing
public/ruvicode-logo.webp so the social card stays on-brand. Run from the
ruvicode-web repo root:

    python scripts/gen-og.py

Requires Pillow. Fonts fall back from Segoe UI -> Arial on Windows.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os

W, H = 1200, 630

BG = (15, 15, 14)         # #0F0F0E warm near-black
CLAY = (211, 111, 70)     # brand accent
IVORY = (250, 249, 245)   # #FAF9F5
MUTED = (176, 174, 165)   # #B0AEA5

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO = os.path.join(ROOT, "public", "ruvicode-logo.webp")
OUT = os.path.join(ROOT, "public", "og", "ruvicode-default.png")

FONT_DIRS = [
    os.path.expandvars(r"%WINDIR%\Fonts"),
    "/c/Windows/Fonts",
    "/usr/share/fonts/truetype/dejavu",
    "/System/Library/Fonts",
]


def font_path(*names):
    for d in FONT_DIRS:
        for n in names:
            p = os.path.join(d, n)
            if os.path.exists(p):
                return p
    raise FileNotFoundError("no usable font found (tried %s)" % (names,))


def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)

    # Brand background with a soft clay glow.
    canvas = Image.new("RGBA", (W, H), BG + (255,))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(glow)
    d.ellipse([300 - 380, 180, 900 + 380, 180 + 760], fill=CLAY + (40,))
    glow = glow.filter(ImageFilter.GaussianBlur(200))
    canvas = Image.alpha_composite(canvas, glow)

    draw = ImageDraw.Draw(canvas)

    def centered_text(y, text, size, color, bold=False):
        fam = "segoeuib.ttf" if bold else "segoeui.ttf"
        try:
            f = ImageFont.truetype(font_path(fam, "arialbd.ttf" if bold else "arial.ttf"), size)
        except FileNotFoundError:
            f = ImageFont.truetype("/c/Windows/Fonts/" + ("arialbd.ttf" if bold else "arial.ttf"), size)
        w = draw.textlength(text, font=f)
        draw.text(((W - w) / 2, y), text, font=f, fill=color + (255,))

    # Logo mark (rounded, transparent PNG).
    logo = Image.open(LOGO).convert("RGBA")
    icon_size = 130
    logo = logo.resize((icon_size, icon_size), Image.LANCZOS)
    canvas.alpha_composite(logo, (int((W - icon_size) / 2), 120))

    centered_text(290, "Ruvicode", 76, IVORY, bold=True)
    centered_text(400, "One API Key. Every AI Model.", 34, IVORY)
    centered_text(448, "Transparent Pricing.", 34, IVORY)
    centered_text(560, "ruvicode.com", 24, MUTED)

    canvas.convert("RGB").save(OUT, "PNG")
    print("wrote", OUT)


if __name__ == "__main__":
    main()
