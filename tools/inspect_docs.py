from pathlib import Path
import zipfile
import re
import xml.etree.ElementTree as ET
import json

import fitz
from PIL import Image
import io

zipfile.ZipExtFile._update_crc = lambda self, newdata: None

SAMPLES = Path(r"C:\Users\HP\Desktop\Periodico\samples")
OUT = SAMPLES / "_analysis"
IMAGES = OUT / "images"
MEDIA = OUT / "media"
IMAGES.mkdir(exist_ok=True)
MEDIA.mkdir(exist_ok=True)

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def docx_xml_text(path: Path):
    with zipfile.ZipFile(path) as z:
        xml = z.read("word/document.xml")
        media = [
            (n, z.getinfo(n).file_size)
            for n in z.namelist()
            if n.startswith("word/media/")
        ]
    root = ET.fromstring(xml)
    chunks = []
    for node in root.iter():
        if node.tag == W + "t" and node.text:
            chunks.append(node.text)
        elif node.tag == W + "tab":
            chunks.append("\t")
        elif node.tag == W + "br":
            chunks.append("\n")
    text = "".join(chunks)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text, media


def pdf_blocks(path: Path, max_pages=2):
    doc = fitz.open(path)
    out = []
    for pno in range(min(max_pages, len(doc))):
        page = doc[pno]
        d = page.get_text("dict")
        blocks = []
        for b in d["blocks"]:
            if b.get("type") != 0:
                continue
            spans = [
                s
                for line in b.get("lines", [])
                for s in line.get("spans", [])
                if s["text"].strip()
            ]
            if not spans:
                continue
            text = " ".join(s["text"].strip() for s in spans)
            size = round(max(s["size"] for s in spans), 1)
            color = spans[0].get("color")
            blocks.append(
                {
                    "bbox": [round(v, 1) for v in b["bbox"]],
                    "size": size,
                    "color": f"#{color:06x}" if isinstance(color, int) else None,
                    "text": re.sub(r"\s+", " ", text)[:180],
                }
            )
        blocks.sort(key=lambda b: (round(b["bbox"][1] / 10), b["bbox"][0]))
        out.append({"page": pno + 1, "blocks": blocks})
    return out, len(doc)


def extract_pdf_images(path: Path, max_images=8):
    doc = fitz.open(path)
    seen = set()
    saved = []
    for page in doc:
        for img in page.get_images(full=True):
            xref = img[0]
            if xref in seen:
                continue
            seen.add(xref)
            try:
                data = doc.extract_image(xref)
            except Exception:
                continue
            w, h = data.get("width", 0), data.get("height", 0)
            if w < 120 or h < 120:
                continue
            ext = data.get("ext", "png")
            name = f"{path.stem[:40]}_x{xref}.{ext}"
            target = IMAGES / re.sub(r'[<>:"/\\|?*]', "_", name)
            target.write_bytes(data["image"])
            saved.append({"file": target.name, "w": w, "h": h, "bytes": len(data["image"])})
            if len(saved) >= max_images:
                return saved
    return saved


def docx_export_media(path: Path):
    saved = []
    with zipfile.ZipFile(path) as z:
        for n in z.namelist():
            if n.startswith("word/media/"):
                data = z.read(n)
                target = MEDIA / re.sub(r'[<>:"/\\|?*]', "_", f"{path.stem[:35]}_{Path(n).name}")
                target.write_bytes(data)
                try:
                    im = Image.open(io.BytesIO(data))
                    saved.append({"file": target.name, "w": im.width, "h": im.height, "bytes": len(data)})
                except Exception:
                    saved.append({"file": target.name, "bytes": len(data)})
    return saved


def main():
    report = {}
    for path in sorted(SAMPLES.iterdir()):
        if path.suffix.lower() == ".docx":
            text, media = docx_xml_text(path)
            media_saved = docx_export_media(path)
            report[path.name] = {
                "type": "docx",
                "xml_text_chars": len(text),
                "xml_text": text[:1200],
                "media": media_saved,
            }
        elif path.suffix.lower() == ".pdf":
            blocks, page_count = pdf_blocks(path)
            imgs = extract_pdf_images(path)
            report[path.name] = {
                "type": "pdf",
                "pages": page_count,
                "blocks": blocks,
                "images_saved": imgs,
            }
    (OUT / "inspect.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print("OK ->", OUT / "inspect.json")


if __name__ == "__main__":
    main()
