from pathlib import Path
import json
import re
import zipfile
from collections import Counter

import fitz
import docx

SAMPLES = Path(r"C:\Users\HP\Desktop\Periodico\samples")
OUT = SAMPLES / "_analysis"
OUT.mkdir(exist_ok=True)
(OUT / "text").mkdir(exist_ok=True)
(OUT / "previews").mkdir(exist_ok=True)


def analyze_pdf(path: Path):
    doc = fitz.open(path)
    pages = []
    all_text = []
    total_images = 0
    total_links = 0
    sizes = Counter()

    for i, page in enumerate(doc):
        text = page.get_text("text")
        all_text.append(text)
        blocks = page.get_text("blocks")
        images = page.get_images(full=True)
        links = page.get_links()
        total_images += len(images)
        total_links += len(links)
        d = page.get_text("dict")
        for b in d["blocks"]:
            for line in b.get("lines", []):
                for span in line.get("spans", []):
                    if span["text"].strip():
                        sizes[round(span["size"], 1)] += len(span["text"])
        pages.append(
            {
                "page": i + 1,
                "chars": len(text),
                "blocks": len(blocks),
                "images": len(images),
                "links": len(links),
                "preview": re.sub(r"\s+", " ", text)[:220],
            }
        )

    full = "\n".join(all_text)
    (OUT / "text" / (path.stem + ".txt")).write_text(full, encoding="utf-8")
    for idx in sorted(set([0, 1, len(doc) - 1])):
        if 0 <= idx < len(doc):
            pix = doc[idx].get_pixmap(dpi=85)
            pix.save(str(OUT / "previews" / f"{path.stem}_p{idx + 1}.png"))

    return {
        "file": path.name,
        "type": "pdf",
        "pages": len(doc),
        "chars": len(full),
        "chars_per_page": round(len(full) / max(1, len(doc))),
        "images": total_images,
        "links": total_links,
        "likely_scanned": len(full) / max(1, len(doc)) < 120,
        "top_font_sizes": sizes.most_common(6),
        "metadata": {k: v for k, v in (doc.metadata or {}).items() if v},
        "pages_detail": pages,
        "first_600": re.sub(r"\s+", " ", full)[:600],
    }


def open_docx_tolerant(path: Path):
    try:
        return docx.Document(path)
    except zipfile.BadZipFile:
        original = zipfile.ZipExtFile._update_crc

        def skip_crc(self, newdata):
            return None

        zipfile.ZipExtFile._update_crc = skip_crc
        try:
            return docx.Document(path)
        finally:
            zipfile.ZipExtFile._update_crc = original


def analyze_docx(path: Path):
    d = open_docx_tolerant(path)
    paras = [p for p in d.paragraphs if p.text.strip()]
    styles = Counter(p.style.name for p in paras)
    headings = [
        p.text.strip()
        for p in paras
        if p.style.name.lower().startswith("heading") or p.style.name.lower().startswith("título")
    ]
    bold_short = [
        p.text.strip()
        for p in paras
        if p.runs and all(r.bold for r in p.runs if r.text.strip()) and len(p.text.strip()) < 120
    ]
    links = []
    for rel in d.part.rels.values():
        if "hyperlink" in rel.reltype:
            links.append(rel.target_ref)
    text = "\n".join(p.text for p in d.paragraphs)
    (OUT / "text" / (path.stem + ".txt")).write_text(text, encoding="utf-8")

    return {
        "file": path.name,
        "type": "docx",
        "pages": None,
        "paragraphs": len(paras),
        "chars": len(text),
        "images": len(d.inline_shapes),
        "links": len(links),
        "link_targets": links[:20],
        "tables": len(d.tables),
        "styles": styles.most_common(8),
        "headings": headings[:15],
        "bold_short": bold_short[:15],
        "first_600": re.sub(r"\s+", " ", text)[:600],
    }


def main():
    results = []
    for path in sorted(SAMPLES.iterdir()):
        if path.suffix.lower() not in (".pdf", ".docx"):
            continue
        try:
            if path.suffix.lower() == ".pdf":
                results.append(analyze_pdf(path))
            else:
                results.append(analyze_docx(path))
        except Exception as exc:
            print(f"ERROR en {path.name}: {type(exc).__name__}: {exc}")
            results.append({"file": path.name, "type": path.suffix[1:], "error": str(exc)})
    (OUT / "report.json").write_text(
        json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"{'ARCHIVO':<58} {'TIPO':<5} {'PAG':>4} {'CHARS':>7} {'IMG':>4} {'LINKS':>5}  ESTADO")
    for r in results:
        if r.get("error"):
            print(f"{r['file'][:57]:<58} {r['type']:<5} {'-':>4} {'-':>7} {'-':>4} {'-':>5}  ERROR")
            continue
        status = "ESCANEADO?" if r.get("likely_scanned") else "texto"
        pages = r.get("pages") or r.get("paragraphs") or 0
        print(
            f"{r['file'][:57]:<58} {r['type']:<5} {pages:>4} {r['chars']:>7} "
            f"{r['images']:>4} {r['links']:>5}  {status}"
        )


if __name__ == "__main__":
    main()
