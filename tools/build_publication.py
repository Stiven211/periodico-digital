# -*- coding: utf-8 -*-
"""Convierte un DOCX estructurado en una publicacion JSON + medios.

Uso:
  python tools/build_publication.py "samples/Grupo 6 El reto de ser estudiante.docx"
  python tools/build_publication.py archivo.docx --slug mi-articulo
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import math
import re
import shutil
import subprocess
import tempfile
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from docx import Document
from docx.oxml.ns import qn
from PIL import Image, ImageEnhance, ImageOps

BASE = Path(__file__).resolve().parent.parent
DEFAULT_OUT = BASE / "public" / "publications"
WATERMARK_CACHE = BASE / ".cache" / "watermarks.json"
TESSERACT = Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe")
VML_IMAGEDATA = "{urn:schemas-microsoft-com:vml}imagedata"

WATERMARK_BRANDS = (
    "unsplash",
    "shutterstock",
    "gettyimages",
    "freepik",
    "adobestock",
    "dreamstime",
    "alamy",
    "istock",
    "depositphotos",
    "123rf",
)

MONTHS = {
    "enero": 1,
    "febrero": 2,
    "marzo": 3,
    "abril": 4,
    "mayo": 5,
    "junio": 6,
    "julio": 7,
    "agosto": 8,
    "septiembre": 9,
    "setiembre": 9,
    "octubre": 10,
    "noviembre": 11,
    "diciembre": 12,
}


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text[:70] or "publicacion"


def norm(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def is_caption(text: str) -> bool:
    return bool(
        re.match(
            r"^(ilustraci[oó]n|imagen|foto|figura|gr[aá]fico|tabla)\s*\d*\s*[.:\-–(]",
            text,
            re.I,
        )
    )


def split_caption_credit(text: str) -> tuple[str, str]:
    match = re.search(
        r"[.,;]?\s*(cr[eé]ditos?|autor(?:ía)?|fotograf[ií]a|foto)\s*:\s*(.+)$",
        text,
        re.I,
    )
    if not match:
        return text, ""
    caption = text[: match.start()].rstrip(" .,;")
    credit = f"Crédito: {match.group(2).strip()}"
    return caption or text, credit


def is_credit(text: str) -> bool:
    return bool(
        re.match(
            r"^(cr[eé]dito|autor|autora|fotograf[ií]a|foto)\s*:",
            text,
            re.I,
        )
    )


def is_ai_text(text: str) -> bool:
    if len(text) < 60:
        return False
    tool = re.search(
        r"(chat\s*gpt|chatgpt|inteligencia artificial|\bia\b|gemini|copilot|midjourney|dall[\s-]?e)",
        text,
        re.I,
    )
    action = re.search(
        r"(utiliz|uso|apoyo|revis|generad|herramienta|asistencia|apoy)", text, re.I
    )
    return bool(tool and action)


def detect_watermark(blob: bytes) -> list[str]:
    if not TESSERACT.exists():
        return []
    digest = hashlib.sha1(blob).hexdigest()
    cache = load_watermark_cache()
    if digest in cache:
        return cache[digest]
    result = ocr_watermark(blob)
    if result is None:
        return []
    cache[digest] = result
    save_watermark_cache(cache)
    return result


def load_watermark_cache() -> dict[str, list[str]]:
    try:
        return json.loads(WATERMARK_CACHE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def save_watermark_cache(cache: dict[str, list[str]]) -> None:
    try:
        WATERMARK_CACHE.parent.mkdir(parents=True, exist_ok=True)
        WATERMARK_CACHE.write_text(
            json.dumps(cache, ensure_ascii=False, indent=1), encoding="utf-8"
        )
    except OSError:
        pass


def ocr_watermark(blob: bytes) -> list[str] | None:
    try:
        im = Image.open(io.BytesIO(blob)).convert("L")
        im = ImageOps.autocontrast(im)
        im = ImageEnhance.Contrast(im).enhance(2.0)
        im = im.resize((im.width * 2, im.height * 2))
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp_path = Path(tmp.name)
        im.save(tmp_path)
        try:
            result = subprocess.run(
                [str(TESSERACT), str(tmp_path), "stdout", "-l", "eng", "--psm", "11"],
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="ignore",
                timeout=45,
            )
            text = (result.stdout or "").lower()
        finally:
            tmp_path.unlink(missing_ok=True)
        compact = re.sub(r"\s+", "", text)
        hits = []
        for brand in WATERMARK_BRANDS:
            if brand in compact:
                hits.append(brand)
        if "nsp" in compact and "plash" in compact and "unsplash" not in hits:
            hits.append("unsplash")
        return sorted(set(hits))
    except Exception:
        return None


def image_size(blob: bytes) -> tuple[int, int]:
    try:
        with Image.open(io.BytesIO(blob)) as im:
            return im.width, im.height
    except Exception:
        return 0, 0


def extract_date(text: str) -> str | None:
    m = re.search(
        r"(\d{1,2})\s+de\s+(" + "|".join(MONTHS) + r")(?:\s+de\s+(\d{4}))?",
        text,
        re.I,
    )
    if m:
        day = int(m.group(1))
        month = MONTHS[m.group(2).lower()]
        year = int(m.group(3)) if m.group(3) else datetime.now().year
        try:
            return datetime(year, month, day).date().isoformat()
        except ValueError:
            pass
    m = re.search(r"\b(\d{1,2})/(\d{1,2})/(\d{4})\b", text)
    if m:
        day, month, year = map(int, m.groups())
        try:
            return datetime(year, month, day).date().isoformat()
        except ValueError:
            pass
    m = re.search(r"\b(\d{4})-(\d{2})-(\d{2})\b", text)
    if m:
        return m.group(0)
    return None


def make_excerpt(text: str, max_len: int = 220) -> str:
    text = norm(text)
    if len(text) <= max_len:
        return text
    cut = text[:max_len]
    last_period = cut.rfind(". ")
    if last_period >= 140:
        return cut[: last_period + 1]
    return cut.rsplit(" ", 1)[0].rstrip(".,;:") + "…"


def run() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("docx", type=Path)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--slug", default=None)
    parser.add_argument("--date", default=None)
    args = parser.parse_args()

    docx_path: Path = args.docx
    if not docx_path.exists():
        raise SystemExit(f"No existe: {docx_path}")

    doc = Document(docx_path)
    paragraphs = doc.paragraphs

    # ---------- Imagenes ----------
    images: list[dict[str, Any]] = []
    image_para_indices: dict[int, list[dict[str, Any]]] = {}
    seen_hashes: dict[str, str] = {}

    for idx, para in enumerate(paragraphs):
        if not para._p.findall(".//" + qn("w:drawing")) and not para._p.findall(
            ".//" + VML_IMAGEDATA
        ):
            continue
        refs: list[str] = []
        for blip in para._p.findall(".//" + qn("a:blip")):
            rid = blip.get(qn("r:embed"))
            if rid:
                refs.append(rid)
        for imgdata in para._p.findall(".//" + VML_IMAGEDATA):
            rid = imgdata.get(qn("r:id"))
            if rid:
                refs.append(rid)
        for rid in refs:
            try:
                part = doc.part.related_parts[rid]
                blob = part.blob
            except Exception:
                continue
            digest = hashlib.sha1(blob).hexdigest()
            if digest in seen_hashes:
                existing = next(i for i in images if i["sha1"] == digest)
                existing["occurrences"].append(idx)
                image_para_indices.setdefault(idx, []).append(existing)
                continue
            width, height = image_size(blob)
            ext = Path(str(part.partname)).suffix.lower() or ".jpg"
            if ext not in (".jpg", ".jpeg", ".png", ".webp", ".gif"):
                ext = ".jpg"
            item = {
                "id": f"media-{len(images) + 1}",
                "sha1": digest,
                "blob": blob,
                "ext": ext,
                "width": width,
                "height": height,
                "occurrences": [idx],
                "watermark": detect_watermark(blob),
                "caption": "",
                "credit": "",
                "status": "unused",
                "reason": "",
            }
            images.append(item)
            seen_hashes[digest] = item["id"]
            image_para_indices.setdefault(idx, []).append(item)

    # ---------- Captions / creditos por imagen ----------
    consumed: set[int] = set()
    for img in images:
        first_idx = img["occurrences"][0]
        j = first_idx + 1
        skipped = 0
        while j < len(paragraphs) and skipped < 4:
            text = norm(paragraphs[j].text)
            if not text:
                j += 1
                skipped += 1
                continue
            if not img["caption"] and is_caption(text):
                caption, credit = split_caption_credit(text)
                img["caption"] = caption
                if credit and not img["credit"]:
                    img["credit"] = credit
                consumed.add(j)
                j += 1
                skipped += 1
                continue
            if not img["credit"] and is_credit(text):
                img["credit"] = text
                consumed.add(j)
                j += 1
                skipped += 1
                continue
            break

    # ---------- Titulo y subtitulo ----------
    title_idx = None
    for idx, para in enumerate(paragraphs):
        if para.style.name == "Title" and norm(para.text):
            title_idx = idx
            break
    if title_idx is None:
        for idx, para in enumerate(paragraphs):
            text = norm(para.text)
            if not text:
                continue
            sizes = [r.font.size.pt for r in para.runs if r.font.size]
            if sizes and max(sizes) >= 20 and para.alignment == 1:
                title_idx = idx
                break
    title = norm(paragraphs[title_idx].text) if title_idx is not None else ""

    subtitle_idx = None
    if title_idx is not None:
        for j in range(title_idx + 1, min(title_idx + 4, len(paragraphs))):
            text = norm(paragraphs[j].text)
            if not text:
                continue
            sizes = [r.font.size.pt for r in paragraphs[j].runs if r.font.size]
            italic = any(bool(r.italic) for r in paragraphs[j].runs)
            if paragraphs[j].alignment == 1 and sizes and 10 <= max(sizes) <= 18 and italic:
                subtitle_idx = j
                break
    subtitle = norm(paragraphs[subtitle_idx].text) if subtitle_idx is not None else ""

    # ---------- Declaracion IA ----------
    ai_idx = None
    for idx in range(len(paragraphs) - 1, -1, -1):
        if idx in consumed:
            continue
        text = norm(paragraphs[idx].text)
        if is_ai_text(text):
            ai_idx = idx
            break

    # ---------- Fuentes ----------
    sources: list[dict[str, str]] = []
    source_indices: set[int] = set()
    source_heading_idx = None
    for idx, para in enumerate(paragraphs):
        text = norm(para.text)
        if re.match(r"^(fuentes|referencias|bibliograf[ií]a|webgraf[ií]a)$", text, re.I):
            source_heading_idx = idx
            break
    if source_heading_idx is not None:
        source_indices.add(source_heading_idx)
        for j in range(source_heading_idx + 1, len(paragraphs)):
            text = norm(paragraphs[j].text)
            if not text:
                continue
            if paragraphs[j].style.name.startswith("Heading"):
                break
            urls = re.findall(r"https?://\S+", text)
            if urls:
                for url in urls:
                    label = text.replace(url, "").strip(" .-–|") or url
                    sources.append({"label": label, "url": url.rstrip(".,;)")})
            else:
                sources.append({"label": text, "url": ""})
            source_indices.add(j)

    # ---------- Cuerpo ----------
    skip: set[int] = set()
    skip.update(consumed)
    skip.update(source_indices)
    if title_idx is not None:
        skip.add(title_idx)
    if subtitle_idx is not None:
        skip.add(subtitle_idx)
    if ai_idx is not None:
        skip.add(ai_idx)
    for idx in list(image_para_indices.keys()):
        skip.add(idx)

    body_texts: list[str] = []
    blocks: list[dict[str, Any]] = []
    first_body_paragraph = ""

    for idx, para in enumerate(paragraphs):
        if idx in image_para_indices:
            for img in image_para_indices[idx]:
                if img["status"] == "rejected":
                    continue
                block = {
                    "type": "image",
                    "src": f"{img['id']}{img['ext']}",
                    "alt": re.sub(
                        r"^(ilustraci[oó]n|imagen|foto|figura)\s*\d*\s*[.:\-–]\s*",
                        "",
                        img["caption"],
                        flags=re.I,
                    )
                    or "Imagen del artículo",
                    "caption": img["caption"],
                    "credit": img["credit"],
                }
                if blocks and blocks[-1].get("type") == "image" and blocks[-1].get(
                    "src"
                ) == block["src"]:
                    continue
                blocks.append(block)
            continue

        if idx in skip:
            continue
        text = norm(para.text)
        if not text:
            continue
        if re.match(
            r"^(categor[ií]a|grado|grupo|grado y grupo|fecha|editor|editora|redactor|redactores|"
            r"dise[nñ]ador|dise[nñ]adora|equipo editorial|autores)\s*:",
            text,
            re.I,
        ):
            continue
        if re.match(r"^(equipo editorial|grupo)\s*\d*\s*$", text, re.I):
            continue

        sizes = [r.font.size.pt for r in para.runs if r.font.size]
        runs_with_text = [r for r in para.runs if r.text.strip()]
        all_bold = bool(runs_with_text) and all(bool(r.bold) for r in runs_with_text)
        is_heading = para.style.name.startswith("Heading") or (
            all_bold and sizes and max(sizes) >= 13.5 and len(text) <= 110
        )
        if is_heading:
            blocks.append({"type": "heading", "text": text})
            continue

        blocks.append({"type": "paragraph", "text": text})
        body_texts.append(text)
        if not first_body_paragraph:
            first_body_paragraph = text

    if ai_idx is not None:
        blocks.append({"type": "ai-disclosure", "text": norm(paragraphs[ai_idx].text)})

    # ---------- Estado de imagenes y portada ----------
    warnings: list[dict[str, str]] = []
    valid_images: list[dict[str, Any]] = []
    for img in images:
        reasons = []
        if img["watermark"]:
            reasons.append("marca de agua: " + ", ".join(img["watermark"]))
        if img["width"] < 1000 or img["height"] < 600:
            reasons.append(f"resolución baja: {img['width']}x{img['height']}")
        if not img["caption"]:
            reasons.append("sin pie de foto")
        if not img["credit"]:
            reasons.append("sin crédito")
        if reasons:
            # La marca de agua o la baja resolucion invalidan la imagen.
            blocking = [r for r in reasons if r.startswith(("marca", "resoluci"))]
            if blocking:
                img["status"] = "rejected"
                img["reason"] = "; ".join(blocking)
                warnings.append(
                    {
                        "code": "image_rejected",
                        "severity": "error",
                        "message": f"{img['id']}: {img['reason']}. Reemplázala antes de publicar.",
                    }
                )
            else:
                img["status"] = "usable_with_warning"
                img["reason"] = "; ".join(reasons)
                warnings.append(
                    {
                        "code": "image_metadata",
                        "severity": "warning",
                        "message": f"{img['id']}: {img['reason']}.",
                    }
                )
                valid_images.append(img)
        else:
            img["status"] = "used"
            valid_images.append(img)

    if not valid_images:
        warnings.append(
            {
                "code": "no_valid_cover",
                "severity": "error",
                "message": "No hay imágenes válidas para la portada.",
            }
        )
        cover = None
    else:
        cover_img = valid_images[0]
        cover_img["status"] = "cover"
        cover = {
            "src": f"{cover_img['id']}{cover_img['ext']}",
            "alt": re.sub(
                r"^(ilustraci[oó]n|imagen|foto|figura)\s*\d*\s*[.:\-–]\s*",
                "",
                cover_img["caption"],
                flags=re.I,
            )
            or "Portada del artículo",
            "caption": cover_img["caption"],
            "credit": cover_img["credit"],
            "width": cover_img["width"],
            "height": cover_img["height"],
        }

    rejected_srcs = {
        f"{img['id']}{img['ext']}" for img in images if img["status"] == "rejected"
    }
    if rejected_srcs:
        blocks = [
            b
            for b in blocks
            if not (b.get("type") == "image" and b.get("src") in rejected_srcs)
        ]

    # ---------- Metadatos ----------
    full_text = "\n".join(norm(p.text) for p in paragraphs if norm(p.text))

    date = args.date or extract_date(full_text)
    date_source = "document"
    if not date:
        date = datetime.fromtimestamp(docx_path.stat().st_mtime).date().isoformat()
        date_source = "file"
        warnings.append(
            {
                "code": "date_inferred",
                "severity": "warning",
                "message": "No hay fecha en el documento; se usó la fecha del archivo. Confírmala antes de publicar.",
            }
        )

    if not sources:
        warnings.append(
            {
                "code": "sources_missing",
                "severity": "warning",
                "message": "No se encontraron fuentes con hipervínculo. Agrega al menos dos.",
            }
        )

    if ai_idx is None:
        warnings.append(
            {
                "code": "ai_missing",
                "severity": "warning",
                "message": "No se encontró declaración de uso de IA.",
            }
        )
    else:
        ai_text = norm(paragraphs[ai_idx].text).lower()
        if "imagen" in ai_text and not any(
            k in ai_text
            for k in (
                "texto",
                "redacción",
                "redaccion",
                "párrafo",
                "parrafo",
                "borrador",
                "ideas",
                "generación de texto",
                "generacion de texto",
            )
        ):
            warnings.append(
                {
                    "code": "ai_inconsistent",
                    "severity": "warning",
                    "message": "La declaración de IA solo menciona una imagen. Verifica el uso real de IA y los derechos de las imágenes.",
                }
            )

    if any(
        re.search(
            r"(chat\s*gpt|chatgpt|inteligencia artificial|\bia\b|gemini|midjourney|dall)",
            (img.get("credit") or ""),
            re.I,
        )
        for img in images
    ):
        warnings.append(
            {
                "code": "ai_image_rights",
                "severity": "warning",
                "message": "Los créditos indican imágenes generadas con IA. Confirma la herramienta, la autoría y los derechos de uso.",
            }
        )

    if any(re.search(r"\[|\binsertar imagen\b|\bescribe aquí\b", b.get("text", ""), re.I) for b in blocks):
        warnings.append(
            {
                "code": "placeholders",
                "severity": "error",
                "message": "El documento todavía contiene textos de plantilla entre corchetes.",
            }
        )

    word_count = sum(len(re.findall(r"\b\w+\b", t)) for t in body_texts)
    reading_minutes = max(1, math.ceil(word_count / 200))
    excerpt = make_excerpt(first_body_paragraph)
    slug = args.slug or slugify(title)

    # ---------- Guardar medios ----------
    out_dir = args.out / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    for old in out_dir.glob("media-*"):
        old.unlink(missing_ok=True)
    for img in images:
        target = out_dir / f"{img['id']}{img['ext']}"
        target.write_bytes(img["blob"])

    # ---------- Checks ----------
    checks: list[dict[str, str]] = []

    def check(id_: str, label: str, ok: bool, detail: str = "", warn_only: bool = False):
        checks.append(
            {
                "id": id_,
                "label": label,
                "status": "pass" if ok else ("warn" if warn_only else "fail"),
                "detail": detail,
            }
        )

    check("title", "Título", bool(title), title)
    check("date", "Fecha", date_source == "document", date, warn_only=True)
    check(
        "images",
        "Imágenes",
        bool(cover) and len(valid_images) == len(images),
        f"{len(valid_images)} de {len(images)} válidas",
        warn_only=True,
    )
    captions_ok = bool(valid_images) and all(i["caption"] for i in valid_images)
    credits_ok = bool(valid_images) and all(i["credit"] for i in valid_images)
    check(
        "captions",
        "Pies de foto",
        captions_ok,
        "Todas las imágenes usadas tienen pie."
        if captions_ok
        else ("Sin imágenes." if not valid_images else "Hay imágenes sin pie de foto."),
        warn_only=True,
    )
    check(
        "credits",
        "Créditos",
        credits_ok,
        "Todas las imágenes usadas tienen crédito."
        if credits_ok
        else ("Sin imágenes." if not valid_images else "Hay imágenes sin crédito."),
        warn_only=True,
    )
    check("sources", "Fuentes", bool(sources), f"{len(sources)} fuentes", warn_only=True)
    check("ai", "Declaración de IA", ai_idx is not None, "Declaración encontrada." if ai_idx is not None else "Falta.", warn_only=True)

    publication = {
        "id": slug,
        "slug": slug,
        "title": title,
        "subtitle": subtitle,
        "date": date,
        "dateSource": date_source,
        "status": "in_review",
        "excerpt": excerpt,
        "readingMinutes": reading_minutes,
        "wordCount": word_count,
        "cover": cover,
        "blocks": blocks,
        "sources": sources,
        "media": [
            {
                "id": img["id"],
                "src": f"{img['id']}{img['ext']}",
                "width": img["width"],
                "height": img["height"],
                "status": img["status"],
                "reason": img["reason"],
                "watermark": img["watermark"],
                "caption": img["caption"],
                "credit": img["credit"],
            }
            for img in images
        ],
        "checks": checks,
        "warnings": warnings,
        "source": {
            "filename": docx_path.name,
            "format": docx_path.suffix.lower().lstrip("."),
            "profile": "docx-structured",
            "sizeBytes": docx_path.stat().st_size,
            "modifiedAt": datetime.fromtimestamp(
                docx_path.stat().st_mtime, tz=timezone.utc
            ).isoformat(),
        },
        "createdAt": datetime.now(tz=timezone.utc).isoformat(),
        "publishedAt": None,
    }

    json_path = out_dir / "publication.json"
    json_path.write_text(
        json.dumps(publication, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"OK  {json_path}")
    print(f"    {title or '(sin título)'}")
    print(f"    {len(blocks)} bloques · {word_count} palabras · {reading_minutes} min")
    print(f"    portada: {cover['src'] if cover else 'sin portada'}")
    for w in warnings:
        print(f"    [{w['severity']}] {w['code']}: {w['message']}")


if __name__ == "__main__":
    run()

