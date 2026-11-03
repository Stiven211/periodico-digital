import { useState } from "react"
import NewspaperCard from "../components/NewspaperCard"
import { newspapers } from "../data"
import type { Grade, Category } from "../data"
import type { NavState } from "../App"
import {
  formatPublicationDate,
  publicationMedia,
  useDriveIndex,
} from "../lib/publications"

interface HomeProps {
  navigate: (state: NavState) => void
}

type GradeFilter = Grade | "all"
type CategoryFilter = Category | "all"

const fallbackPublication = {
  slug: "el-reto-de-ser-estudiante",
  title: "El reto de ser estudiante",
  tag: "Ejemplo procesado",
  cover: publicationMedia("el-reto-de-ser-estudiante", "media-2.jpg"),
}

const stats = [
  { label: "Periódicos publicados", value: "6", icon: "📰" },
  { label: "Estudiantes redactores", value: "18", icon: "✍️" },
  { label: "Ediciones completadas", value: "17", icon: "📚" },
  { label: "Lecturas totales", value: "1,242", icon: "👁️" },
]

export default function Home({ navigate }: HomeProps) {
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("all")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")
  const { published } = useDriveIndex()
  const latest = published[0] ?? null

  const featured = latest
    ? {
        slug: latest.slug,
        title: latest.title,
        tag: `Publicado · ${formatPublicationDate(latest.publishedAt ?? latest.date)}`,
        cover: latest.cover
          ? publicationMedia(latest.slug, latest.cover)
          : null,
      }
    : fallbackPublication

  const filtered = newspapers.filter((n) => {
    if (n.status !== "published") return false
    if (gradeFilter !== "all" && n.grade !== gradeFilter) return false
    if (categoryFilter !== "all" && n.category !== categoryFilter) return false
    return true
  })

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: "100svh" }}
      >
        {/* Imagen estudiantil */}
        <img
          src="https://images.unsplash.com/photo-1758270705172-07b53627dfcb?w=1920&h=1080&fit=crop&auto=format"
          alt="Estudiantes trabajando con tecnología"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay oscuro fuerte para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900" />
        {/* Tono azul sutil */}
        <div className="absolute inset-0 bg-blue-950/30" />

        <div
          className="relative z-10 text-center px-5 w-full max-w-4xl mx-auto"
          style={{ paddingTop: "80px", paddingBottom: "60px" }}
        >
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 glass">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-slate-300 font-medium">
              Área de Informática · 2024
            </span>
          </div>

          <h1 className="font-display font-bold text-slate-50 leading-tight mb-4">
            <span className="block text-4xl sm:text-6xl lg:text-7xl">
              Periódico Digital
            </span>
            <span className="block text-4xl sm:text-6xl lg:text-7xl text-blue-400 mt-1">
              Informática
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed">
            La voz estudiantil de los grados 11-1, 11-2 y 11-3. Noticias,
            tecnología, cultura y deporte creados por nosotros.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() =>
                navigate({ page: "category", category: "general" })
              }
              className="w-full sm:w-auto px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl transition-all hover:shadow-[0_0_24px_rgba(245,158,11,0.4)] font-display text-sm"
            >
              📰 Periódicos Generales
            </button>
            <button
              onClick={() =>
                navigate({ page: "category", category: "tecnologico" })
              }
              className="w-full sm:w-auto px-7 py-3.5 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition-all hover:shadow-[0_0_24px_rgba(59,130,246,0.4)] font-display text-sm"
            >
              💻 Periódicos Tecnológicos
            </button>
          </div>
        </div>

        {/* Scroll indicator — only on larger screens */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block">
          <div className="w-5 h-8 border-2 border-slate-600 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-blue-400 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Nuevo sistema editorial */}
      <section className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-slate-800 via-slate-800/70 to-slate-900">
            <div className="grid md:grid-cols-[1.25fr_1fr]">
              <div className="p-6 sm:p-8">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                  <span className="font-mono-code text-[10px] font-medium uppercase tracking-[0.18em] text-amber-300">
                    Nuevo sistema editorial
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold leading-tight text-slate-50 sm:text-3xl">
                  Del DOCX a una publicación profesional
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-400">
                  El nuevo lector interpreta la estructura del documento, valida
                  imágenes, pies de foto, fuentes y la declaración de IA.{" "}
                  {latest
                    ? "La última publicación aprobada por el docente aparece aquí."
                    : "Este es el primer artículo procesado con el sistema."}
                </p>
                <button
                  onClick={() =>
                    navigate({ page: "publication", slug: featured.slug })
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-display text-sm font-semibold text-slate-900 transition-colors hover:bg-amber-400"
                >
                  {latest ? "Leer la última publicación" : "Leer el ejemplo"}
                  <span aria-hidden>→</span>
                </button>
              </div>
              <button
                onClick={() =>
                  navigate({ page: "publication", slug: featured.slug })
                }
                className="group relative min-h-[200px] overflow-hidden text-left md:min-h-full"
              >
                {featured.cover ? (
                  <img
                    src={featured.cover}
                    alt={`Portada del artículo ${featured.title}`}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-mono-code text-[10px] uppercase tracking-[0.18em] text-amber-300">
                    {featured.tag}
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-white">
                    {featured.title}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center py-1">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="font-display text-2xl sm:text-3xl font-bold text-slate-50 mb-0.5">
                  {s.value}
                </div>
                <div className="text-xs text-slate-400 leading-tight">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newspapers section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-6">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-50">
            Todas las Publicaciones
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {filtered.length} periódico{filtered.length !== 1 ? "s" : ""}{" "}
            encontrado
            {filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Filters — scroll horizontal en móvil */}
        <div className="mb-7 space-y-3">
          {/* Categoría */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium whitespace-nowrap shrink-0">
              Categoría:
            </span>
            {(["all", "general", "tecnologico"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  categoryFilter === c
                    ? c === "all"
                      ? "bg-blue-500 text-white"
                      : c === "general"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                        : "bg-green-500/20 text-green-400 border border-green-500/50"
                    : "bg-slate-800 text-slate-400 hover:text-slate-300 border border-slate-700"
                }`}
              >
                {c === "all"
                  ? "Todos"
                  : c === "general"
                    ? "📰 General"
                    : "💻 Tecnológico"}
              </button>
            ))}
          </div>

          {/* Grado */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium whitespace-nowrap shrink-0">
              Grado:
            </span>
            {(["all", "11-1", "11-2", "11-3"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGradeFilter(g)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  gradeFilter === g
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                    : "bg-slate-800 text-slate-400 hover:text-slate-300 border border-slate-700"
                }`}
              >
                {g === "all" ? "Todos" : `Grado ${g}`}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((n) => (
              <NewspaperCard key={n.id} newspaper={n} navigate={navigate} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-slate-400 text-sm">
              No hay periódicos con esos filtros.
            </p>
            <button
              onClick={() => {
                setGradeFilter("all")
                setCategoryFilter("all")
              }}
              className="mt-3 text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </section>

      {/* About section */}
      <section className="border-t border-slate-800 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium mb-4">
                Sobre el Proyecto
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-50 mb-4 leading-tight">
                Un espacio para la voz
                <span className="text-blue-400"> estudiantil</span>
              </h2>
              <p className="text-slate-400 leading-relaxed mb-3 text-sm sm:text-base">
                El Proyecto Periódico Digital nace como iniciativa del Área de
                Informática para que los estudiantes de grado once desarrollen
                competencias digitales, periodísticas y creativas a través de
                publicaciones propias.
              </p>
              <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
                Cada edición es creada íntegramente por los estudiantes:
                redacción, diseño, fotografía y edición. Un producto auténtico
                que refleja la mirada joven sobre temas que importan.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  title: "Competencias digitales",
                  desc: "Diseño, edición y publicación digital.",
                  icon: "💡",
                  color: "border-blue-500/30 bg-blue-500/5",
                },
                {
                  title: "Trabajo en equipo",
                  desc: "Editor, diseñador y redactores.",
                  icon: "🤝",
                  color: "border-green-500/30 bg-green-500/5",
                },
                {
                  title: "Pensamiento crítico",
                  desc: "Investigación y escritura periodística.",
                  icon: "🧠",
                  color: "border-amber-500/30 bg-amber-500/5",
                },
                {
                  title: "Identidad escolar",
                  desc: "Documentar la vida institucional.",
                  icon: "🏫",
                  color: "border-blue-500/30 bg-blue-500/5",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`p-4 rounded-xl border ${item.color}`}
                >
                  <div className="text-xl mb-2">{item.icon}</div>
                  <h3 className="font-display font-semibold text-slate-100 text-sm mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
