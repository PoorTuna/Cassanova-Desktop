"""Generate 1024x1024 icon master from build/icon-square.png.

Pads source to square, upscales 4x via Real-ESRGAN ncnn (anime model),
downscales to 1024 with Lanczos. Path to the upscaler exe is passed in.
"""
import argparse
import subprocess
import sys
import tempfile
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "build" / "icon-square.png"
DST = ROOT / "build" / "icon.png"
TARGET = 1024
MODEL = "realesrgan-x4plus-anime"


def pad_square(src: Path, out: Path) -> int:
    img = Image.open(src).convert("RGBA")
    side = max(img.size)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(img, ((side - img.width) // 2, (side - img.height) // 2))
    square.save(out, format="PNG")
    return side


def upscale(exe: Path, model_dir: Path, src: Path, dst: Path, tile: int) -> None:
    subprocess.run(
        [str(exe), "-i", str(src), "-o", str(dst),
         "-n", MODEL, "-s", "4", "-m", str(model_dir),
         "-t", str(tile)],
        check=True,
    )


def downscale(src: Path, dst: Path, size: int) -> None:
    img = Image.open(src).convert("RGBA")
    img.resize((size, size), Image.LANCZOS).save(dst, format="PNG", optimize=True)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--exe", required=True, type=Path)
    ap.add_argument("--models", required=True, type=Path)
    ap.add_argument("--tile", type=int, default=128)
    args = ap.parse_args()

    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        padded = tmp / "padded.png"
        upscaled = tmp / "upscaled.png"
        side = pad_square(SRC, padded)
        upscale(args.exe, args.models, padded, upscaled, args.tile)
        downscale(upscaled, DST, TARGET)
        print(f"wrote {DST} (input {side}x{side} -> 4x -> {TARGET}x{TARGET})")


if __name__ == "__main__":
    sys.exit(main())
