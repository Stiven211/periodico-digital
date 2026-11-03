# -*- coding: utf-8 -*-
"""Sincroniza la carpeta publica de Drive y prepara vistas previas.

Flujo:
  1. Lee la carpeta publica de Drive (sin credenciales).
  2. Descarga los archivos a imports/drive/.
  3. Convierte cada DOCX en public/publications/<slug>/publication.json.
  4. Genera una vista previa de los PDF (no son publicables).
  5. Escribe public/publications/index.json para el panel del docente.

Uso:
  python tools/sync_drive.py
  python tools/sync_drive.py --refresh
"""
from __future__ import annotations

import argparse
import html
import io
import json
import re
import subprocess
import sys
import unicodedata
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
PUBLIC = BASE / "public" / "publications"
IMPORTS = BASE / "imports" / "drive"
INDEX = PUBLIC / "index.json"
BUILD = BASE / "tools" / "build_publication.py"
FOLDER_ID = "1QxwnwwBwSMhnNNp8DIU97AYSLa0eU2uo"
FOLDER_URL = f"https://drive.google.com/drive/folders/{FOLDER_ID}"
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)


def log(message: str) -> None:
    print(message, flush=True)


def fetch(url: str, timeout: int = 120, data: bytes | None = None) -> bytes:
    request = urllib.request.Request(
        url,
        data=data,
        headers={
            "User-Agent": UA,
            "Accept-Language": "es-CO,es;q=0.9,en;q=0.8",
        },
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read()


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text[:70] or "publicacion"


def list_folder() -> list[dict[str, str]]:
    raw = fetch(f"{FOLDER_URL}?usp=sharing")
    page = raw.decode("utf-8", errors="replace")
    pattern = re.compile(r'aria-label="([^"]+)"[\s\S]{0,600}?data-id="([^"]+)"')
    files: dict[str, dict[str, str]] = {}

    for match in pattern.finditer(page):
        label, drive_id = match.group(1), match.group(2)
        if " Microsoft Word " in label:
            name = label.split(" Microsoft Word ")[0]
            kind = "docx"
        elif " PDF " in label:
            name = label.split(" PDF ")[0]
            kind = "pdf"
        else:
            continue
        files.setdefault(
            drive_id,
            {"drive_id": drive_id, "name": name.strip(), "kind": kind},
        )

    return sorted(files.values(), key=lambda item: item["name"])


def confirm_download(url: str, drive_id: str, first: bytes) -> bytes:
    page = first.decode("utf-8", errors="replace")
    form = re.search(r"<form[^>]+action=\"([^\"]+)\"", page, re.I)
    action = html.unescape(form.group(1)) if form else url
    inputs = {
        html.unescape(name): html.unescape(value)
        for name, value in re.findall(
            r'<input[^>]+name="([^"]+)"[^>]+value="([^"]*)"', page, re.I
        )
    }
    inputs.setdefault("id", drive_id)
    inputs.setdefault("export", "download")
    body = urllib.parse.urlencode(inputs).encode()
    return fetch(action, data=body)


def download(item: dict[str, str], refresh: bool) -> Path:
    IMPORTS.mkdir(parents=True, exist_ok=True)
    suffix = ".docx" if item["kind"] == "docx" else ".pdf"
    target = IMPORTS / f"{item['drive_id']}{suffix}"

    if target.exists() and target.stat().st_size > 0 and not refresh:
        log(f"  cache {target.name}")
        return target

    url = f"https://drive.google.com/uc?export=download&id={item['drive_id']}"
    data = fetch(url)

    magic_ok = data[:2] == b"PK" if item["kind"] == "docx" else data[:4] == b"%PDF"
    if not magic_ok:
        data = confirm_download(url, item["drive_id"], data)
        magic_ok = data[:2] == b"PK" if item["kind"] == "docx" else data[:4] == b"%PDF"
    if not magic_ok:
        raise RuntimeError(f"La descarga de {item['name']} no devolvio un archivo valido.")

    target.write_bytes(data)
    log(f"  bajado {target.name} ({len(data) // 1024} KB)")
    return target


def clean_title(name: str) -> str:
    stem = Path(name).stem
    stem = re.sub(r"^\s*\d+\s*[.)-]?\s*", "", stem)
    stem = re.sub(r"\s*[-–]\s*$", "", stem)
    return stem.strip()


def unique_slug(base: str, used: set[str]) -> str:
    slug = base
    counter = 2
    while slug in used:
        slug = f"{base}-{counter}"
        counter += 1
    used.add(slug)
    return slug


def build_docx(path: Path, slug: str) -> dict:
    result = subprocess.run(
        [sys.executable, str(BUILD), str(path), "--slug", slug],
        cwd=str(BASE),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=900,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip() or "Error del parser")
    for line in result.stdout.splitlines():
        if line.strip().startswith(("OK", "    [")):
            log(f"  {line.strip()}")
    return json.loads((PUBLIC / slug / "publication.json").read_text(encoding="utf-8"))


def build_pdf(path: Path, slug: str, display_name: str) -> dict:
    try:
        import fitz
    except ImportError as exc:
        raise RuntimeError("Falta PyMuPDF (pip install pymupdf) para previsualizar PDF.") from exc

    out_dir = PUBLIC / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    for old in out_dir.glob("page-*"):
        old.unlink(missing_ok=True)

    document = fitz.open(path)
    page = document[0]
    pixmap = page.get_pixmap(matrix=fitz.Matrix(1.4, 1.4), alpha=False)
    pixmap.save(str(out_dir / "page-1.jpg"))
    text = re.sub(r"\s+", " ", page.get_text("text")).strip()
    pages = len(document)
    document.close()

    title = clean_title(display_name)
    words = len(re.findall(r"\b\w+\b", text))
    modified = datetime.fromtimestamp(
        path.stat().st_mtime, tz=timezone.utc
    ).isoformat()
    date = datetime.fromtimestamp(path.stat().st_mtime).date().isoformat()

    return {
        "id": slug,
        "slug": slug,
        "title": title,
        "subtitle": "",
        "date": date,
        "dateSource": "file",
        "status": "rejected",
        "excerpt": text[:220] or "Archivo PDF recibido. No es publicable en el sistema.",
        "readingMinutes": max(1, (words + 199) // 200),
        "wordCount": words,
        "cover": {
            "src": "page-1.jpg",
            "alt": f"Primera página de {title}",
            "caption": "Página 1 del PDF recibido.",
            "credit": "",
            "width": pixmap.width,
            "height": pixmap.height,
        },
        "blocks": [
            {
                "type": "image",
                "src": "page-1.jpg",
                "alt": f"Primera página de {title}",
                "caption": "Página 1 del PDF recibido.",
                "credit": "",
            }
        ],
        "sources": [],
        "media": [
            {
                "id": "page-1",
                "src": "page-1.jpg",
                "width": pixmap.width,
                "height": pixmap.height,
                "status": "cover",
                "reason": "formato PDF no permitido",
                "watermark": [],
                "caption": "Página 1 del PDF recibido.",
                "credit": "",
            }
        ],
        "checks": [
            {
                "id": "format",
                "label": "Formato",
                "status": "fail",
                "detail": "PDF no permitido: se requiere DOCX estructurado.",
            },
            {
                "id": "pages",
                "label": "Páginas",
                "status": "warn",
                "detail": f"{pages} páginas recibidas como imagen.",
            },
        ],
        "warnings": [
            {
                "code": "pdf_not_allowed",
                "severity": "error",
                "message": "El archivo es un PDF. El periódico solo publica DOCX estructurados: rehazlo con la plantilla.",
            }
        ],
        "source": {
            "filename": display_name,
            "format": "pdf",
            "profile": "pdf-preview",
            "sizeBytes": path.stat().st_size,
            "modifiedAt": modified,
        },
        "createdAt": datetime.now(tz=timezone.utc).isoformat(),
        "publishedAt": None,
    }


def index_entry(item: dict[str, str], publication: dict, cover: str | None) -> dict:
    warnings = publication.get("warnings", [])
    checks = publication.get("checks", [])
    errors = [warning for warning in warnings if warning.get("severity") == "error"]
    failed = [check for check in checks if check.get("status") == "fail"]
    status = "blocked" if errors or failed else ("review" if warnings else "ready")

    return {
        "id": publication["id"],
        "name": item["name"],
        "driveId": item["drive_id"],
        "driveUrl": f"https://drive.google.com/file/d/{item['drive_id']}/view",
        "kind": item["kind"],
        "sizeBytes": publication["source"]["sizeBytes"],
        "modifiedAt": publication["source"]["modifiedAt"],
        "slug": publication["slug"],
        "status": status,
        "title": publication["title"],
        "cover": cover,
        "errorCount": len(errors),
        "warningCount": len(warnings),
        "checks": checks,
        "warnings": warnings,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--refresh", action="store_true", help="Vuelve a descargar todo")
    args = parser.parse_args()

    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    log(f"Carpeta: {FOLDER_URL}")
    items = list_folder()
    log(f"Archivos encontrados: {len(items)}")

    PUBLIC.mkdir(parents=True, exist_ok=True)
    used_slugs: set[str] = set()
    entries: list[dict] = []

    for item in items:
        log(f"\n- {item['name']} ({item['kind']})")
        path = download(item, args.refresh)
        slug = unique_slug(slugify(clean_title(item["name"])), used_slugs)

        if item["kind"] == "docx":
            publication = build_docx(path, slug)
            publication["source"]["filename"] = item["name"]
            (PUBLIC / slug / "publication.json").write_text(
                json.dumps(publication, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
        else:
            publication = build_pdf(path, slug, item["name"])
            (PUBLIC / slug / "publication.json").write_text(
                json.dumps(publication, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            log(f"  vista previa PDF: {slug}")

        cover = publication["cover"]["src"] if publication.get("cover") else None
        entries.append(index_entry(item, publication, cover))

    entries.sort(key=lambda entry: entry["name"].lower())
    index = {
        "folderUrl": FOLDER_URL,
        "syncedAt": datetime.now(tz=timezone.utc).isoformat(),
        "files": entries,
    }
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")

    log("\nResumen:")
    for entry in entries:
        log(
            f"  {entry['status']:8} {entry['name']} "
            f"({entry['errorCount']} errores, {entry['warningCount']} avisos)"
        )
    log(f"\nOK  {INDEX}")


if __name__ == "__main__":
    main()
