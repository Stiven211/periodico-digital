import { useMemo, useState } from "react"
import type { NavState } from "../App"
import type { DriveFile, DriveStatus } from "../types/drive"
import {
  formatPublicationDate,
  publicationMedia,
  useDriveIndex,
} from "../lib/publications"

const statusMeta: Record<DriveStatus, {
  label: string
  badge: string
  dot: string
}> = {
  ready: {
    label: "Listo",
    badge: "bg-green-500/15 text-green-400 border-green-500/30",
    dot: "bg-green-400",
  },
  review: {
    label: "Con avisos",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    dot: "bg-amber-400",
  },
  blocked: {
    label: "Bloqueado",
    badge: "bg-red-500/15 text-red-400 border-red-500/30",
    dot: "bg-red-400",
  },
  published: {
    label: "Publicado",
    badge: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    dot: "bg-blue-400",
  },
}

function formatTimestamp(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function coverUrl(file: DriveFile) {
  return file.cover ? publicationMedia(file.slug, file.cover) : null
}

function issueCount(file: DriveFile) {
  const errors = file.warnings.filter(
    (item) => item.severity === "error",
  ).length
  const warnings = file.warnings.filter(
    (item) => item.severity === "warning",
  ).length
  return { errors, warnings }
}

function PublishDialog({
  file,
  busy,
  error,
  onCancel,
  onConfirm,
}: {
  file: DriveFile
  busy: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => Promise<void>
}) {
  const [acknowledged, setAcknowledged] = useState(false)
  const { errors, warnings } = issueCount(file)
  const blocked = errors > 0
  const today = new Date().toISOString()

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/75 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="border-b border-slate-800 p-5">
          <p className="font-mono-code text-[10px] uppercase tracking-[0.18em] text-slate-500">
            Publicar en el periódico
          </p>
          <h2 className="mt-1 font-display text-lg font-bold text-slate-50">
            {file.title}
          </h2>
          <p className="mt-1 truncate text-xs text-slate-400">{file.name}</p>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-5">
          <dl className="grid grid-cols-2 gap-3 rounded-xl border border-slate-700 bg-slate-800/60 p-4">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                Fecha del artículo
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-100">
                {formatPublicationDate(file.date)}
                {file.dateSource === "file" && (
                  <span className="ml-1 text-[10px] font-normal text-slate-500">
                    (estimada)
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                Fecha de publicación
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-100">
                {formatPublicationDate(today)}
              </dd>
            </div>
          </dl>

          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            La fecha del artículo no cambia. La fecha de publicación será la de
            hoy, cuando el docente apruebe el archivo.
          </p>

          <div
            className={`mt-4 rounded-xl border p-4 ${
              blocked
                ? "border-red-500/30 bg-red-500/10"
                : warnings > 0
                  ? "border-amber-500/30 bg-amber-500/10"
                  : "border-green-500/30 bg-green-500/10"
            }`}
          >
            <p
              className={`text-xs font-semibold ${
                blocked
                  ? "text-red-300"
                  : warnings > 0
                    ? "text-amber-300"
                    : "text-green-300"
              }`}
            >
              {blocked
                ? `${errors} error${
                    errors === 1 ? "" : "es"
                  } y ${warnings} aviso${warnings === 1 ? "" : "s"}`
                : warnings > 0
                  ? `${warnings} aviso${warnings === 1 ? "" : "s"} editorial${
                      warnings === 1 ? "" : "es"
                    }`
                  : "Sin observaciones editoriales"}
            </p>

            {file.warnings.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {file.warnings.map((warning) => (
                  <li
                    key={warning.code + warning.message}
                    className={`text-[11px] leading-relaxed ${
                      warning.severity === "error"
                        ? "text-red-200/90"
                        : "text-amber-100/80"
                    }`}
                  >
                    {warning.message}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {blocked && (
            <label className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-slate-800/60 p-3 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.target.checked)}
                disabled={busy}
                className="mt-0.5 h-4 w-4 shrink-0 accent-red-500"
              />
              <span>
                Entiendo las observaciones y asumo la publicación de este
                archivo.
              </span>
            </label>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs leading-relaxed text-red-200">
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-800 p-5 sm:flex-row sm:justify-end">
          <button
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-slate-500 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={busy || (blocked && !acknowledged)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all ${
              blocked
                ? "bg-red-600 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                : "bg-blue-500 hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
            }`}
          >
            {busy
              ? "Publicando…"
              : blocked
                ? "Publicar de todos modos"
                : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DriveInbox({
  navigate,
}: {
  navigate: (state: NavState) => void
}) {
  const {
    files,
    loading,
    error,
    publishingError,
    reload,
    publish,
    index,
  } = useDriveIndex()
  const [filter, setFilter] = useState<"all" | DriveStatus>("all")
  const [publishing, setPublishing] = useState<DriveFile | null>(null)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const counts = useMemo(
    () => ({
      all: files.length,
      published: files.filter((file) => file.status === "published").length,
      review: files.filter((file) => file.status === "review").length,
      blocked: files.filter((file) => file.status === "blocked").length,
    }),
    [files],
  )

  const visible =
    filter === "all" ? files : files.filter((file) => file.status === filter)

  const openPublish = (file: DriveFile) => {
    setPublishError(null)
    setPublishing(file)
  }

  const confirmPublish = async () => {
    if (!publishing || submitting) {
      return
    }

    setSubmitting(true)
    setPublishError(null)
    try {
      await publish(publishing.slug)
      setNotice(
        `«${publishing.title}» quedó publicado. La fecha del artículo se conserva y la fecha de publicación es la de hoy.`,
      )
      setPublishing(null)
    } catch (err) {
      setPublishError(
        err instanceof Error ? err.message : "No se pudo publicar el archivo.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-slate-50 sm:text-2xl">
            Bandeja de Drive
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Archivos de la carpeta compartida, convertidos a vista previa
            editorial.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => {
              setNotice(null)
              void reload()
            }}
            disabled={loading}
            className="rounded-xl bg-slate-700 px-3 py-2 text-xs font-medium text-slate-200 transition-all hover:bg-slate-600 disabled:opacity-50"
          >
            {loading ? "Recargando…" : "Recargar"}
          </button>
          {index?.folderUrl && (
            <a
              href={index.folderUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition-all hover:border-slate-500 hover:text-slate-100"
            >
              Abrir carpeta
            </a>
          )}
        </div>
      </div>

      {index && (
        <p className="mb-5 text-xs text-slate-500">
          Última sincronización: {formatTimestamp(index.syncedAt)}
        </p>
      )}

      {notice && (
        <div className="mb-5 flex items-start justify-between gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
          <p className="text-sm leading-relaxed text-green-200">{notice}</p>
          <button
            onClick={() => setNotice(null)}
            className="shrink-0 text-xs text-green-300/70 hover:text-green-200"
          >
            Cerrar
          </button>
        </div>
      )}

      {publishingError && (
        <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-xs font-semibold text-red-300">
            No se pudo cargar el estado de publicaciones
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-red-200/80">
            {publishingError}
          </p>
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {([
          {
            key: "all",
            label: "Archivos",
            value: counts.all,
            color: "text-slate-100",
          },
          {
            key: "published",
            label: "Publicados",
            value: counts.published,
            color: "text-blue-400",
          },
          {
            key: "review",
            label: "Con avisos",
            value: counts.review,
            color: "text-amber-400",
          },
          {
            key: "blocked",
            label: "Bloqueados",
            value: counts.blocked,
            color: "text-red-400",
          },
        ] as const).map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`rounded-2xl border p-4 text-left transition-all ${
              filter === item.key
                ? "border-blue-500/40 bg-blue-500/10"
                : "border-slate-700 bg-slate-800 hover:border-slate-600"
            }`}
          >
            <div className={`font-display text-2xl font-bold ${item.color}`}>
              {item.value}
            </div>
            <div className="text-xs text-slate-400">{item.label}</div>
          </button>
        ))}
      </div>

      {loading && !index && (
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl border border-slate-700 bg-slate-800"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-8 text-center">
          <p className="text-sm font-medium text-slate-200">
            No hay archivos en este filtro.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            La carpeta se sincroniza con el comando del proyecto.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {visible.map((file) => {
          const meta = statusMeta[file.status]
          const cover = coverUrl(file)
          const firstWarning = file.warnings[0]
          const lastCheck = file.checks.find((check) => check.status !== "pass")
          const isPublished = file.status === "published"
          const isPdf = file.kind === "pdf"
          const { errors, warnings } = issueCount(file)

          return (
            <article
              key={file.id}
              className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800"
            >
              <div className="flex flex-col gap-4 p-4 sm:flex-row">
                <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl bg-slate-900 sm:h-28 sm:w-40">
                  {cover ? (
                    <img
                      src={cover}
                      alt={file.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-500">
                      Sin portada
                    </div>
                  )}
                  <span className="absolute left-2 top-2 rounded-full bg-slate-950/80 px-2 py-0.5 font-mono-code text-[10px] font-bold uppercase text-slate-300">
                    {file.kind}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-display text-sm font-semibold text-slate-100">
                      {file.title}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.badge}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${meta.dot}`}
                      />
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-400">
                    {file.name}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Artículo: {formatPublicationDate(file.date)}
                    {file.dateSource === "file" && " (estimada)"} ·{" "}
                    {Math.round(file.sizeBytes / 1024)} KB
                    {isPublished && file.publishedAt && (
                      <span className="text-blue-300/80">
                        {" "}
                        · Publicado el {formatPublicationDate(file.publishedAt)}
                      </span>
                    )}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {file.checks.map((check) => (
                      <span
                        key={check.id}
                        title={check.detail}
                        className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                          check.status === "pass"
                            ? "bg-green-500/10 text-green-300"
                            : check.status === "warn"
                              ? "bg-amber-500/10 text-amber-300"
                              : "bg-red-500/10 text-red-300"
                        }`}
                      >
                        {check.label}
                      </span>
                    ))}
                  </div>

                  {(firstWarning || lastCheck) && (
                    <p className="mt-2 line-clamp-2 text-[11px] text-slate-400">
                      {firstWarning?.message ?? lastCheck?.detail}
                      {(warnings > 0 || errors > 0) && (
                        <span className="text-slate-500">
                          {" "}
                          (
                          {errors > 0 &&
                            `${errors} error${errors === 1 ? "" : "es"}, `}
                          {warnings} aviso{warnings === 1 ? "" : "s"})
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap items-start gap-2 sm:flex-col">
                  {isPublished ? (
                    <button
                      onClick={() =>
                        navigate({ page: "publication", slug: file.slug })
                      }
                      className="rounded-xl bg-blue-500 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-blue-400"
                    >
                      Ver publicación
                    </button>
                  ) : isPdf ? (
                    <button
                      disabled
                      title="Los PDF no se pueden publicar. El archivo debe ser un DOCX estructurado."
                      className="cursor-not-allowed rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300/70"
                    >
                      PDF no publicable
                    </button>
                  ) : (
                    <button
                      onClick={() => openPublish(file)}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold text-white transition-all ${
                        errors > 0
                          ? "bg-amber-600 hover:bg-amber-500"
                          : "bg-blue-500 hover:bg-blue-400"
                      }`}
                    >
                      Publicar
                    </button>
                  )}
                  <button
                    onClick={() =>
                      navigate({ page: "publication", slug: file.slug })
                    }
                    className="rounded-xl border border-slate-600 px-3 py-2 text-xs font-medium text-slate-200 transition-all hover:border-slate-400 hover:text-white"
                  >
                    Vista previa
                  </button>
                  <a
                    href={file.driveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:border-slate-500 hover:text-slate-200"
                  >
                    Original
                  </a>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {publishing && (
        <PublishDialog
          file={publishing}
          busy={submitting}
          error={publishError}
          onCancel={() => setPublishing(null)}
          onConfirm={confirmPublish}
        />
      )}
    </div>
  )
}
