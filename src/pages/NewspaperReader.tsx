import { newspapers } from '../data';
import type { NavState } from '../App';

interface NewspaperReaderProps {
  id: string;
  navigate: (state: NavState) => void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const categoryConfig = {
  general: {
    label: 'General',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
  },
  tecnologico: {
    label: 'Tecnológico',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    dot: 'bg-green-500',
  },
};

const roleIcons: Record<string, string> = {
  Editor: '✍️',
  Diseñador: '🎨',
  Redactor: '📝',
};

export default function NewspaperReader({ id, navigate }: NewspaperReaderProps) {
  const newspaper = newspapers.find((n) => n.id === id);

  if (!newspaper) {
    return (
      <div className="min-h-screen bg-slate-900 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-slate-400 mb-4">Periódico no encontrado.</p>
          <button
            onClick={() => navigate({ page: 'home' })}
            className="text-blue-400 hover:text-blue-300 underline text-sm"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const cfg = categoryConfig[newspaper.category];

  return (
    <div className="min-h-screen bg-slate-900 pt-16">
      {/* Cover hero */}
      <section className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
        <img
          src={newspaper.coverImage}
          alt={newspaper.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/20" />

        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8 w-full">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
              <button
                onClick={() => navigate({ page: 'home' })}
                className="hover:text-slate-300 transition-colors"
              >
                Inicio
              </button>
              <span>/</span>
              <button
                onClick={() =>
                  navigate({ page: 'category', category: newspaper.category })
                }
                className="hover:text-slate-300 transition-colors"
              >
                {cfg.label}
              </button>
              <span>/</span>
              <span className="text-slate-400">{newspaper.title}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.border} border`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-xs text-blue-300">
                Grado {newspaper.grade}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-700/80 text-xs text-slate-300 font-mono-code">
                Ed. {newspaper.edition} · {newspaper.pages} págs.
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-bold text-slate-50 leading-tight mb-1">
              {newspaper.title}
            </h1>
            <p className={`text-lg ${cfg.color} font-medium`}>{newspaper.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-[1fr_320px] gap-10">
          {/* Article body */}
          <main>
            {/* Excerpt */}
            <div className="p-5 rounded-xl border-l-4 border-blue-500 bg-blue-500/5 mb-8">
              <p className="text-slate-200 text-lg leading-relaxed italic">{newspaper.excerpt}</p>
            </div>

            {/* Sections */}
            <div className="space-y-12">
              {newspaper.sections.map((section, i) => (
                <article key={i}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono-code text-xs text-slate-500 w-6">
                      0{i + 1}
                    </span>
                    <div className="h-px flex-1 bg-slate-700" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-slate-50 mb-4 leading-tight">
                    {section.title}
                  </h2>
                  {section.image && (
                    <div className="rounded-xl overflow-hidden mb-5 bg-slate-800">
                      <img
                        src={section.image}
                        alt={section.title}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}
                  <p className="text-slate-300 leading-relaxed text-base">{section.content}</p>
                </article>
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate({ page: 'category', category: newspaper.category })}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-700 text-slate-300 hover:border-slate-600 hover:text-slate-100 transition-all text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Volver a {cfg.label}s
              </button>
              <button
                onClick={() => navigate({ page: 'home' })}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-700 text-slate-300 hover:border-slate-600 hover:text-slate-100 transition-all text-sm"
              >
                Ver todas las publicaciones
              </button>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Meta info */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <h3 className="font-display font-semibold text-slate-200 text-sm mb-4 uppercase tracking-wider">
                Información
              </h3>
              <dl className="space-y-3">
                {[
                  { label: 'Grado', value: `${newspaper.grade}` },
                  { label: 'Categoría', value: cfg.label },
                  { label: 'Publicación', value: formatDate(newspaper.date) },
                  { label: 'Edición', value: `N° ${newspaper.edition}` },
                  { label: 'Páginas', value: `${newspaper.pages} páginas` },
                  { label: 'Lecturas', value: `${newspaper.views} vistas` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-baseline gap-2">
                    <dt className="text-xs text-slate-500">{label}</dt>
                    <dd className="text-sm text-slate-200 font-medium text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Team */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <h3 className="font-display font-semibold text-slate-200 text-sm mb-4 uppercase tracking-wider">
                Equipo Editorial
              </h3>
              <ul className="space-y-3">
                {newspaper.team.map((member, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm shrink-0">
                      {roleIcons[member.role] || '👤'}
                    </div>
                    <div>
                      <p className="text-sm text-slate-200 font-medium leading-tight">
                        {member.name}
                      </p>
                      <p className="text-xs text-slate-500">{member.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Download */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <h3 className="font-display font-semibold text-slate-200 text-sm mb-3 uppercase tracking-wider">
                Descargar
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Descarga el archivo original en formato PDF para verlo completo sin conexión.
              </p>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold text-sm transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Descargar PDF
              </button>
              <button className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                Descargar Word
              </button>
            </div>

            {/* Sections index */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <h3 className="font-display font-semibold text-slate-200 text-sm mb-4 uppercase tracking-wider">
                Contenido
              </h3>
              <ol className="space-y-2">
                {newspaper.sections.map((section, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <span className="font-mono-code text-xs text-slate-600 mt-0.5 shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="leading-snug">{section.title}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
