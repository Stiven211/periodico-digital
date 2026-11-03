import { useEffect, useState } from "react"
import type { NavState } from "../App"
import type {
  CheckStatus,
  Publication,
  PublicationBlock,
} from "../types/publication"
import {
  formatPublicationDate,
  usePublishedArticle,
} from "../lib/publications"

interface PublicationReaderProps {
  slug: string
  navigate: (state: NavState) => void
  isAuthenticated: boolean
}

function isHeading(
  block: PublicationBlock,
): block is Extract<PublicationBlock, { type: "heading" }> {
  return block.type === "heading"
}

function CheckMark({ status }: { status: CheckStatus }) {
  const styles =
    status === "pass"
      ? "bg-green-500/15 text-green-300"
      : status === "warn"
        ? "bg-amber-500/15 text-amber-300"
        : "bg-red-500/15 text-red-300"

  return (
    <span
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${styles}`}
    >
      {status === "pass" ? "✓" : status === "warn" ? "!" : "×"}
    </span>
  )
}

interface ArticleBlockProps {
  block: PublicationBlock
  isFirstParagraph: boolean
  headingNumber?: number
  mediaUrl: (src: string) => string
  containImages?: boolean
}

function ArticleBlockView({
  block,
  isFirstParagraph,
  headingNumber,
  mediaUrl,
  containImages,
}: ArticleBlockProps) {
  switch (block.type) {
    case "heading":
      return (
        <section
          id={`seccion-${headingNumber ?? 0}`}
          className="mt-12 scroll-mt-24 first:mt-0"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="font-mono-code text-[10px] font-medium uppercase tracking-[0.22em] text-amber-700">
              Sección {String(headingNumber ?? 0).padStart(2, "0")}
            </span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">
            {block.text}
          </h2>
        </section>
      )

    case "paragraph":
      return (
        <p
          className={
            isFirstParagraph
              ? "mt-6 font-serif-editorial text-[1.18rem] leading-[1.85] text-slate-800 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[4.6rem] first-letter:font-bold first-letter:leading-[0.72] first-letter:text-blue-800"
              : "mt-5 font-serif-editorial text-[1.06rem] leading-[1.9] text-slate-700"
          }
        >
          {block.text}
        </p>
      )

    case "image":
      return (
        <figure className="my-10 -mx-5 sm:-mx-8 lg:-mx-12">
          <div className="overflow-hidden bg-slate-100 sm:rounded-2xl">
            <img
              src={mediaUrl(block.src)}
              alt={block.alt}
              loading="lazy"
              className={
                containImages
                  ? "w-full bg-white object-contain"
                  : "max-h-[560px] w-full object-cover"
              }
            />
          </div>
          <figcaption className="mt-3 px-5 sm:px-8 lg:px-12">
            {block.caption && (
              <p className="text-sm leading-relaxed text-slate-600">
                {block.caption}
              </p>
            )}
            {block.credit && (
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                {block.credit}
              </p>
            )}
          </figcaption>
        </figure>
      )

    case "ai-disclosure":
      return (
        <aside className="mt-12 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 sm:p-6">
          <div className="mb-2.5 flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 font-mono-code text-[10px] font-bold text-amber-800">
              IA
            </span>
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-amber-900">
              Declaración de uso de IA
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-amber-950/80">
            {block.text}
          </p>
        </aside>
      )

    case "quote":
      return (
        <blockquote className="my-8 border-l-4 border-blue-700 pl-5">
          <p className="font-serif-editorial text-xl italic leading-relaxed text-slate-800">
            {block.text}
          </p>
          {block.attribution && (
            <footer className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
              {block.attribution}
            </footer>
          )}
        </blockquote>
      )

    case "list":
      return (
        <ul className="mt-5 space-y-2">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 font-serif-editorial text-[1.06rem] leading-[1.8] text-slate-700"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-700" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )

    default:
      return null
  }
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-slate-700/60 pb-2 last:border-0 last:pb-0">
      <dt className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
        {label}
      </dt>
      <dd className="text-right text-sm font-medium text-slate-200">{value}</dd>
    </div>
  )
}

export default function PublicationReader({
  slug,
  navigate,
  isAuthenticated,
}: PublicationReaderProps) {
  const [publication, setPublication] = useState<Publication | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const { publishedAt } = usePublishedArticle(slug)

  useEffect(() => {
    let cancelled = false
    setPublication(null)
    setError(null)

    const base = import.meta.env.BASE_URL.endsWith("/")
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`

    fetch(`${base}publications/${slug}/publication.json`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `No se pudo cargar la publicación (${response.status}).`,
          )
        }
        return (await response.json()) as Publication
      })
      .then((data) => {
        if (!cancelled) setPublication(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar la publicación.",
          )
        }
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      setProgress(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [publication])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 pt-16">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
            !
          </div>
          <h1 className="font-display text-2xl font-bold text-white">
            Publicación no disponible
          </h1>
          <p className="mt-2 text-sm text-slate-400">{error}</p>
          <button
            onClick={() => navigate({ page: "home" })}
            className="mt-6 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-400"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  if (!publication) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 pt-16">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-blue-400" />
          <p className="text-sm text-slate-400">Cargando publicación…</p>
        </div>
      </div>
    )
  }

  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
  const mediaUrl = (src: string) => `${base}publications/${slug}/${src}`
  const isPdf = publication.source.format === "pdf"
  const isPublished = Boolean(publishedAt)

  const firstParagraphIndex = publication.blocks.findIndex(
    (block) => block.type === "paragraph",
  )

  const headingNumbers = new Map<number, number>()
  let headingCount = 0
  publication.blocks.forEach((block, index) => {
    if (block.type === "heading") {
      headingCount += 1
      headingNumbers.set(index, headingCount)
    }
  })

  const sections = publication.blocks
    .map((block, index) => ({ block, index }))
    .filter(
      (item): item is {
        block: Extract<PublicationBlock, { type: "heading" }>
        index: number
      } => isHeading(item.block),
    )

  const passed = publication.checks.filter(
    (check) => check.status === "pass",
  ).length
  const total = publication.checks.length

  return (
    <div className="min-h-screen bg-slate-900 pt-16">
      <div
        className="fixed left-0 right-0 top-16 z-40 h-0.5 bg-slate-800"
        aria-hidden
      >
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-blue-500 transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <section className="relative flex min-h-[620px] items-end overflow-hidden sm:min-h-[700px]">
        {publication.cover && !isPdf ? (
          <img
            src={mediaUrl(publication.cover.src)}
            alt={publication.cover.alt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-blue-800/40 via-slate-950/55 to-slate-950/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-12 pt-28 sm:px-6 sm:pb-16">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-white/60">
            <button
              onClick={() => navigate({ page: "home" })}
              className="transition-colors hover:text-white"
            >
              Inicio
            </button>
            <span>/</span>
            <span>Artículo</span>
            <span>/</span>
            <span className="max-w-[220px] truncate text-white/80">
              {publication.title}
            </span>
          </nav>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            {isPublished ? (
              <span className="rounded-full border border-blue-300/30 bg-blue-400/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-blue-200 backdrop-blur">
                Publicado
              </span>
            ) : (
              <span className="rounded-full border border-amber-300/30 bg-amber-400/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-amber-200 backdrop-blur">
                Vista previa editorial
              </span>
            )}
          </div>

          <h1 className="max-w-5xl font-display text-4xl font-bold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {publication.title}
          </h1>

          {publication.subtitle.trim() && (
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-200 sm:text-xl">
              {publication.subtitle}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
            <span>
              Fecha del artículo: {formatPublicationDate(publication.date)}
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:block" />
            <span>{publication.readingMinutes} min de lectura</span>
            <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:block" />
            <span>{publication.wordCount} palabras</span>
            {isPublished && publishedAt && (
              <>
                <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:block" />
                <span className="text-blue-200">
                  Publicado el {formatPublicationDate(publishedAt)}
                </span>
              </>
            )}
          </div>

          {publication.cover?.credit && (
            <p className="mt-8 text-[10px] uppercase tracking-[0.18em] text-white/40">
              {publication.cover.credit}
            </p>
          )}
        </div>
      </section>

      <div className="relative z-20 mx-auto -mt-6 max-w-7xl px-4 pb-20 sm:px-6 lg:-mt-10">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          <article className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[#fbfaf7] shadow-2xl shadow-black/40">
            <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
              <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Fecha del artículo
                  </p>
                  <p className="mt-1 font-display text-sm font-semibold text-slate-800">
                    {formatPublicationDate(publication.date)}
                  </p>
                  {isPublished && publishedAt && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Publicado el {formatPublicationDate(publishedAt)}
                    </p>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {publication.readingMinutes} min de lectura
                </p>
              </div>

              {publication.status === "rejected" && (
                <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5">
                  <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-red-700">
                    Formato no permitido
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-red-900/80">
                    Este archivo se subió como PDF. El sistema solo publica
                    documentos DOCX estructurados: rehazlo con la plantilla y
                    vuelve a subirlo.
                  </p>
                </div>
              )}

              {publication.blocks.map((block, index) => (
                <ArticleBlockView
                  key={index}
                  block={block}
                  isFirstParagraph={index === firstParagraphIndex}
                  headingNumber={headingNumbers.get(index)}
                  mediaUrl={mediaUrl}
                  containImages={isPdf}
                />
              ))}

              {publication.sources.length > 0 && (
                <section className="mt-12 border-t border-slate-200 pt-8">
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    Fuentes
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {publication.sources.map((source, index) => (
                      <li
                        key={index}
                        className="text-sm leading-relaxed text-slate-600"
                      >
                        {source.url ? (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
                          >
                            {source.label}
                          </a>
                        ) : (
                          source.label
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
                <p className="text-xs text-slate-400">
                  Periódico Digital · Lectura editorial
                </p>
                <button
                  onClick={() => navigate({ page: "home" })}
                  className="text-sm font-medium text-blue-700 transition-colors hover:text-blue-900"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          </article>

          <aside className="min-w-0 space-y-5">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5 backdrop-blur">
              <h2 className="font-display text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Ficha de la publicación
              </h2>
              <dl className="mt-4 space-y-3">
                <MetaRow
                  label="Estado"
                  value={isPublished ? "Publicado" : "Vista previa"}
                />
                <MetaRow
                  label="Fecha del artículo"
                  value={formatPublicationDate(publication.date)}
                />
                {isPublished && publishedAt && (
                  <MetaRow
                    label="Publicado el"
                    value={formatPublicationDate(publishedAt)}
                  />
                )}
                <MetaRow
                  label="Lectura"
                  value={`${publication.readingMinutes} min`}
                />
                <MetaRow
                  label="Formato"
                  value={
                    publication.source.format === "pdf"
                      ? "PDF (no permitido)"
                      : "DOCX estructurado"
                  }
                />
                <MetaRow
                  label="Palabras"
                  value={String(publication.wordCount)}
                />
              </dl>
            </div>

            {isAuthenticated && (
              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                    Revisión del docente
                  </h2>
                  <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                    {passed}/{total} OK
                  </span>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-green-400"
                    style={{ width: `${total ? (passed / total) * 100 : 0}%` }}
                  />
                </div>

                <ul className="mt-4 space-y-2.5">
                  {publication.checks.map((check) => (
                    <li key={check.id} className="flex items-start gap-2.5">
                      <CheckMark status={check.status} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-200">
                          {check.label}
                        </p>
                        <p
                          className="truncate text-[11px] text-slate-500"
                          title={check.detail}
                        >
                          {check.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                {publication.warnings.length > 0 && (
                  <div className="mt-4 border-t border-amber-500/20 pt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300/80">
                      Alertas ({publication.warnings.length})
                    </p>
                    <ul className="scrollbar-none mt-2 max-h-56 space-y-2 overflow-y-auto pr-1">
                      {publication.warnings.map((warning, index) => (
                        <li
                          key={`${warning.code}-${index}`}
                          className={`text-[11px] leading-relaxed ${
                            warning.severity === "error"
                              ? "text-red-300"
                              : "text-amber-200/80"
                          }`}
                        >
                          {warning.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="mt-4 text-[10px] leading-relaxed text-slate-500">
                  {isPublished && publishedAt
                    ? `Publicado el ${formatPublicationDate(publishedAt)}.`
                    : "El docente puede aprobar este archivo desde la bandeja de Drive."}
                </p>
              </div>
            )}

            {sections.length > 0 && (
              <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
                <h2 className="font-display text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Contenido
                </h2>
                <ol className="mt-4 space-y-2.5">
                  {sections.map(({ block, index }) => (
                    <li key={index}>
                      <a
                        href={`#seccion-${headingNumbers.get(index) ?? 0}`}
                        className="group flex items-start gap-3 text-sm text-slate-400 transition-colors hover:text-slate-100"
                      >
                        <span className="font-mono-code text-[10px] text-slate-600 group-hover:text-amber-300">
                          {String(headingNumbers.get(index) ?? 0).padStart(
                            2,
                            "0",
                          )}
                        </span>
                        <span className="leading-snug">{block.text}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
              <h2 className="font-display text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Documento original
              </h2>
              <p className="mt-2 break-words text-xs text-slate-300">
                {publication.source.filename}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                {publication.source.format.toUpperCase()} ·{" "}
                {Math.round(publication.source.sizeBytes / 1024)} KB
              </p>
              <button
                disabled
                className="mt-4 w-full cursor-not-allowed rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-xs font-medium text-slate-500"
              >
                Descarga disponible en el panel
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
