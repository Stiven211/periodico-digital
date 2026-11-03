# -*- coding: utf-8 -*-
from pathlib import Path

from docx import Document
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

BASE = Path(r"C:\Users\HP\Desktop\Periodico")
OUT = BASE / "templates"
OUT.mkdir(exist_ok=True, parents=True)

AZUL = RGBColor(0x1D, 0x4E, 0xD8)
OSCURO = RGBColor(0x0F, 0x2A, 0x4A)
GRIS = RGBColor(0x6B, 0x72, 0x80)
TEXTO = RGBColor(0x1F, 0x29, 0x37)

PPR_AFTER_PBDR = (
    "w:shd", "w:tabs", "w:suppressAutoHyphens", "w:kinsoku", "w:wordWrap",
    "w:overflowPunct", "w:topLinePunct", "w:autoSpaceDE", "w:autoSpaceDN",
    "w:bidi", "w:adjustRightInd", "w:snapToGrid", "w:spacing", "w:ind",
    "w:contextualSpacing", "w:mirrorIndents", "w:suppressOverlap", "w:jc",
    "w:textDirection", "w:textAlignment", "w:textboxTightWrap", "w:outlineLvl",
    "w:divId", "w:cnfStyle", "w:rPr", "w:sectPr", "w:pPrChange",
)
PPR_AFTER_SHD = PPR_AFTER_PBDR[1:]


def set_run(run, bold=None, italic=None, color=None, size=None, font="Arial"):
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic
    if color is not None:
        run.font.color.rgb = color
    if size is not None:
        run.font.size = Pt(size)
    run.font.name = font
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.append(rFonts)
    for attr in ("w:ascii", "w:hAnsi", "w:eastAsia", "w:cs"):
        rFonts.set(qn(attr), font)
    return run


def shade(paragraph, fill="F8FAFC"):
    pPr = paragraph._p.get_or_add_pPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), fill)
    pPr.insert_element_before(shd, *PPR_AFTER_SHD)


def left_border(paragraph, color="1D4ED8", size=18):
    pPr = paragraph._p.get_or_add_pPr()
    pbdr = OxmlElement("w:pBdr")
    left = OxmlElement("w:left")
    left.set(qn("w:val"), "single")
    left.set(qn("w:sz"), str(size))
    left.set(qn("w:space"), "8")
    left.set(qn("w:color"), color)
    pbdr.append(left)
    pPr.insert_element_before(pbdr, *PPR_AFTER_PBDR)


def dashed_box(paragraph, color="CBD5E1", size=8):
    pPr = paragraph._p.get_or_add_pPr()
    pbdr = OxmlElement("w:pBdr")
    for edge in ("top", "left", "bottom", "right"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "dashed")
        el.set(qn("w:sz"), str(size))
        el.set(qn("w:space"), "8")
        el.set(qn("w:color"), color)
        pbdr.append(el)
    pPr.insert_element_before(pbdr, *PPR_AFTER_PBDR)


def set_lang(style, lang="es-CO"):
    rPr = style.element.get_or_add_rPr()
    for existing in rPr.findall(qn("w:lang")):
        rPr.remove(existing)
    el = OxmlElement("w:lang")
    el.set(qn("w:val"), lang)
    rPr.append(el)


def setup_document(title, subject, header_text, footer_text):
    doc = Document()
    sec = doc.sections[0]
    sec.page_width = Cm(21)
    sec.page_height = Cm(29.7)
    sec.left_margin = Cm(2.2)
    sec.right_margin = Cm(2.2)
    sec.top_margin = Cm(2.0)
    sec.bottom_margin = Cm(2.0)

    normal = doc.styles["Normal"]
    normal.font.name = "Arial"
    normal.font.size = Pt(11)
    normal.font.color.rgb = TEXTO
    normal.paragraph_format.line_spacing = 1.15
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    rPr = normal.element.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.append(rFonts)
    for attr in ("w:ascii", "w:hAnsi", "w:eastAsia", "w:cs"):
        rFonts.set(qn(attr), "Arial")
    set_lang(normal)

    title_style = doc.styles["Title"]
    title_style.font.name = "Arial"
    title_style.font.size = Pt(26)
    title_style.font.bold = True
    title_style.font.color.rgb = OSCURO
    title_style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_style.paragraph_format.space_before = Pt(0)
    title_style.paragraph_format.space_after = Pt(4)
    pPr = title_style.element.get_or_add_pPr()
    for pbdr in pPr.findall(qn("w:pBdr")):
        pPr.remove(pbdr)

    if any(s.name == "Subtitle" for s in doc.styles):
        subtitle = doc.styles["Subtitle"]
    else:
        subtitle = doc.styles.add_style("Subtitle", WD_STYLE_TYPE.PARAGRAPH)
        subtitle.base_style = normal
    subtitle.font.name = "Arial"
    subtitle.font.size = Pt(13)
    subtitle.font.italic = True
    subtitle.font.color.rgb = RGBColor(0x47, 0x55, 0x69)
    subtitle.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle.paragraph_format.space_after = Pt(12)

    heading2 = doc.styles["Heading 2"]
    heading2.font.name = "Arial"
    heading2.font.size = Pt(15)
    heading2.font.bold = True
    heading2.font.color.rgb = AZUL
    heading2.paragraph_format.space_before = Pt(14)
    heading2.paragraph_format.space_after = Pt(5)
    heading2.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    heading2.paragraph_format.keep_with_next = True

    if any(s.name == "Pie de foto" for s in doc.styles):
        caption = doc.styles["Pie de foto"]
    else:
        caption = doc.styles.add_style("Pie de foto", WD_STYLE_TYPE.PARAGRAPH)
    caption.base_style = normal
    caption.font.name = "Arial"
    caption.font.size = Pt(9.5)
    caption.font.bold = True
    caption.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    caption.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    caption.paragraph_format.space_before = Pt(4)
    caption.paragraph_format.space_after = Pt(0)

    if any(s.name == "Credito" for s in doc.styles):
        credit = doc.styles["Credito"]
    else:
        credit = doc.styles.add_style("Credito", WD_STYLE_TYPE.PARAGRAPH)
    credit.base_style = normal
    credit.font.name = "Arial"
    credit.font.size = Pt(8.5)
    credit.font.italic = True
    credit.font.color.rgb = GRIS
    credit.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    credit.paragraph_format.space_before = Pt(0)
    credit.paragraph_format.space_after = Pt(10)

    header = sec.header
    hp = header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_run(hp.add_run(header_text), size=8, color=GRIS)
    footer = sec.footer
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_run(fp.add_run(footer_text), size=8, color=GRIS)

    doc.core_properties.title = title
    doc.core_properties.subject = subject
    doc.core_properties.author = "Área de Tecnología e Informática"
    doc.core_properties.language = "es-CO"
    return doc


def add_title(doc, text, size=26):
    p = doc.add_paragraph(style="Title")
    set_run(p.add_run(text), size=size, bold=True, color=OSCURO)
    return p


def add_subtitle(doc, text):
    p = doc.add_paragraph(style="Subtitle")
    set_run(p.add_run(text), size=13, italic=True, color=RGBColor(0x47, 0x55, 0x69))
    return p


def add_meta(doc, label, value="", last=False):
    p = doc.add_paragraph(style="Normal")
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(10 if last else 0)
    p.paragraph_format.line_spacing = 1.0
    p.paragraph_format.left_indent = Cm(0.15)
    shade(p)
    left_border(p)
    set_run(p.add_run(label), bold=True, size=10.5, color=OSCURO)
    if value:
        set_run(p.add_run(value), size=10.5, color=RGBColor(0x33, 0x41, 0x55))
    return p


def add_body(doc, text, size=11):
    p = doc.add_paragraph(style="Normal")
    set_run(p.add_run(text), size=size)
    return p


def add_h2(doc, text):
    p = doc.add_paragraph(style="Heading 2")
    set_run(p.add_run(text), size=15, bold=True, color=AZUL)
    return p


def add_image_box(doc, number):
    p = doc.add_paragraph(style="Normal")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.4
    shade(p, "F1F5F9")
    dashed_box(p)
    r = p.add_run(f"\n[INSERTAR IMAGEN {number} AQUÍ]\nen línea · sin marca de agua\n")
    set_run(r, size=10, color=GRIS, italic=True)
    return p


def add_caption(doc, text):
    p = doc.add_paragraph(style="Pie de foto")
    set_run(p.add_run(text), size=9.5, bold=True, color=RGBColor(0x33, 0x41, 0x55))
    return p


def add_credit(doc, text):
    p = doc.add_paragraph(style="Credito")
    set_run(p.add_run(text), size=8.5, italic=True, color=GRIS)
    return p


def add_bullet(doc, text, size=10.5):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.space_after = Pt(2)
    set_run(p.add_run(text), size=size)
    return p


def add_check(doc, text):
    p = doc.add_paragraph(style="Normal")
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.left_indent = Cm(0.5)
    p.paragraph_format.first_line_indent = Cm(-0.5)
    set_run(p.add_run("□  "), size=10.5, bold=True, color=AZUL)
    set_run(p.add_run(text), size=10.5)
    return p


def build_template():
    doc = setup_document(
        "Plantilla - Periódico Digital 2026",
        "Plantilla oficial para estudiantes",
        "PERIÓDICO DIGITAL · Plantilla oficial 2026 · Reemplaza los textos entre corchetes",
        "Área de Tecnología e Informática · I.E. José Celestino Mutis",
    )
    add_title(doc, "[Escribe aquí el título del artículo]")
    add_subtitle(doc, "[Opcional: subtítulo de una línea. Si no lo necesitas, bórralo.]")

    add_meta(doc, "Fecha: ", "[día] de [mes] de 2026", last=True)

    add_body(
        doc,
        "[Escribe el párrafo de entrada: qué pasó, cuándo, dónde y por qué es importante. 3 a 5 líneas.]",
    )

    add_image_box(doc, 1)
    add_caption(doc, "Pie de foto: [Describe la escena o el hecho. No expliques quiénes aparecen ni uses nombres.]")
    add_credit(doc, "Crédito: [Autor o fuente. Si es IA, escribe la herramienta.]")

    add_h2(doc, "[Subtítulo de sección opcional]")
    add_body(doc, "[Escribe aquí el primer párrafo de la sección.]")
    add_body(doc, "[Escribe aquí el segundo párrafo de la sección.]")

    add_body(doc, "[Continúa el artículo. Puedes usar más subtítulos o no: el formato de secciones es libre.]")
    add_image_box(doc, 2)
    add_caption(doc, "Pie de foto: [Describe la escena o el hecho. No expliques quiénes aparecen ni uses nombres.]")
    add_credit(doc, "Crédito: [Autor o fuente. Si es IA, escribe la herramienta.]")
    add_body(doc, "[Escribe aquí el siguiente párrafo.]")

    add_h2(doc, "[Otro subtítulo opcional]")
    add_body(doc, "[Escribe aquí el primer párrafo de la sección.]")
    add_body(doc, "[Escribe aquí el segundo párrafo de la sección.]")

    add_body(doc, "[Escribe aquí el párrafo de cierre o la conclusión del artículo.]")

    add_h2(doc, "Fuentes")
    add_bullet(doc, "[Título de la fuente]. [Medio]. [URL como hipervínculo]")
    add_bullet(doc, "[Título de la fuente]. [Medio]. [URL como hipervínculo]")

    add_h2(doc, "Declaración de uso de IA")
    add_body(
        doc,
        "[Escribe qué herramienta de IA se usó, para qué y qué revisó el equipo. Si no se usó, escribe: \"No se utilizó inteligencia artificial\".]",
    )

    path = OUT / "Plantilla_Periodico_Digital_2026.docx"
    doc.save(path)
    return path


def build_guide():
    doc = setup_document(
        "Guía de entrega - Periódico Digital 2026",
        "Instrucciones para estudiantes",
        "PERIÓDICO DIGITAL 2026 · Guía de entrega para estudiantes",
        "Área de Tecnología e Informática · I.E. José Celestino Mutis",
    )
    add_title(doc, "Guía de entrega para estudiantes", size=24)
    add_subtitle(doc, "Periódico Digital 2026")

    p = doc.add_paragraph(style="Normal")
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(10)
    p.paragraph_format.left_indent = Cm(0.15)
    shade(p)
    left_border(p)
    set_run(p.add_run("Un solo archivo por artículo. "), bold=True, size=10.5, color=OSCURO)
    set_run(
        p.add_run("La publicación la hace el docente después de revisar. No se publica automáticamente."),
        size=10.5,
        color=RGBColor(0x33, 0x41, 0x55),
    )

    add_h2(doc, "1. Formato del archivo")
    add_bullet(doc, "Google Docs nativo (recomendado) o archivo .docx. No PDF.")
    add_bullet(doc, "Nombre del archivo: Titulo-Corto.docx.")
    add_bullet(doc, "Prohibido: PDF, Canva exportado, JPG/PNG de la página, capturas de pantalla.")
    add_bullet(doc, "No uses tablas, columnas, cuadros de texto ni saltos de línea para maquetar.")
    add_bullet(doc, "Usa los estilos de la plantilla: Título (Title) para el titular y Normal para los párrafos.")
    add_bullet(doc, "Los subtítulos de sección son opcionales y de formato libre: puedes usar Encabezado 2 o no.")

    add_h2(doc, "2. Imágenes")
    add_bullet(doc, "Máximo 4 imágenes, insertadas en línea (no flotantes).")
    add_bullet(doc, "Mínimo 1200 px de ancho.")
    add_bullet(doc, "Sin marca de agua: Unsplash+, Shutterstock, Getty, Freepik, Adobe Stock u otras.")
    add_bullet(doc, "Sin capturas de pantalla y sin texto dentro de la imagen.")
    add_bullet(doc, "Cada imagen lleva pie de foto y crédito. Si es IA, indica la herramienta.")
    add_bullet(doc, "El pie de foto describe la escena o el hecho. No explica quiénes aparecen ni usa nombres.")

    add_h2(doc, "3. Contenido obligatorio")
    add_bullet(doc, "Título. El subtítulo es opcional.")
    add_bullet(doc, "Fecha de entrega.")
    add_bullet(doc, "Cuerpo entre 400 y 700 palabras.")
    add_bullet(doc, "Mínimo 2 fuentes con hipervínculo real.")
    add_bullet(doc, "Declaración de uso de IA.")

    add_h2(doc, "4. Antes de entregar")
    for item in (
        "Reemplacé todos los textos entre corchetes.",
        "Cambié las imágenes de ejemplo por las mías, sin marca de agua.",
        "Cada imagen tiene pie de foto y crédito.",
        "Los pies de foto no describen quiénes aparecen.",
        "Las fuentes son enlaces reales, no texto pegado.",
        "Escribí la declaración de IA.",
        "El archivo tiene un nombre corto y claro.",
        "No hay tablas, columnas ni cuadros de texto.",
    ):
        add_check(doc, item)

    add_h2(doc, "5. Revisión y publicación")
    add_body(
        doc,
        "El docente revisa, pide ajustes, aplaza o rechaza. La publicación no es automática. "
        "Entrega en: [link de Classroom / carpeta / formulario].",
        size=10.5,
    )

    path = OUT / "Guia_Entrega_Estudiantes_2026.docx"
    doc.save(path)
    return path


if __name__ == "__main__":
    print(build_template())
    print(build_guide())
