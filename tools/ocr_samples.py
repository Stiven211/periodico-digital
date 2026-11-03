from pathlib import Path
import subprocess
import re

import fitz

SAMPLES = Path(r"C:\Users\HP\Desktop\Periodico\samples")
OUT = SAMPLES / "_analysis"
OCR_IN = OUT / "ocr_input"
OCR_OUT = OUT / "ocr"
TESSDATA = Path(r"C:\Users\HP\Desktop\Periodico\tools\tessdata")
TESSERACT = Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe")

OCR_IN.mkdir(exist_ok=True)
OCR_OUT.mkdir(exist_ok=True)


def render_pdf(path: Path, dpi=300):
    doc = fitz.open(path)
    page = doc[0]
    pix = page.get_pixmap(dpi=dpi)
    target = OCR_IN / (path.stem[:60] + ".png")
    pix.save(str(target))
    return target


def run_ocr(image: Path):
    target = OCR_OUT / (image.stem[:60] + ".txt")
    cmd = [
        str(TESSERACT),
        str(image),
        str(target.with_suffix("")),
        "-l",
        "spa",
        "--tessdata-dir",
        str(TESSDATA),
        "--psm",
        "3",
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    text = target.read_text(encoding="utf-8", errors="replace")
    return re.sub(r"\n{3,}", "\n\n", text)


def main():
    jobs = []
    jobs.append(("Grupo 3 _Precomisión hablando hoy p_image1.png", OUT / "media" / "Grupo 3 _Precomisión hablando hoy p_image1.png"))
    jobs.append(("Grupo 6 La presidenta de la asociac_image1.jpg", OUT / "media" / "Grupo 6 La presidenta de la asociac_image1.jpg"))

    for pdf in SAMPLES.glob("*.pdf"):
        if pdf.name.startswith("Grupo 4") or pdf.name.startswith("Grupo 5"):
            jobs.append((pdf.stem + ".png", render_pdf(pdf)))

    for label, image in jobs:
        if not image.exists():
            print("FALTA:", image)
            continue
        text = run_ocr(image)
        print("=" * 90)
        print(label)
        print("chars:", len(text))
        print(text[:900])
        print()


if __name__ == "__main__":
    main()
