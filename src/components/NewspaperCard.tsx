import type { Newspaper } from '../data';
import type { NavState } from '../App';

interface NewspaperCardProps {
  newspaper: Newspaper;
  navigate: (state: NavState) => void;
}

const categoryConfig = {
  general: {
    label: 'General',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
    glow: 'hover:shadow-[0_0_24px_rgba(245,158,11,0.2)]',
    accent: 'group-hover:border-amber-500/50',
  },
  tecnologico: {
    label: 'Tecnológico',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    dot: 'bg-green-500',
    glow: 'hover:shadow-[0_0_24px_rgba(34,197,94,0.2)]',
    accent: 'group-hover:border-green-500/50',
  },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function NewspaperCard({ newspaper, navigate }: NewspaperCardProps) {
  const cfg = categoryConfig[newspaper.category];

  return (
    <button
      onClick={() => navigate({ page: 'newspaper', id: newspaper.id })}
      className={`group text-left bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${cfg.glow} ${cfg.accent} cursor-pointer w-full`}
    >
      {/* Cover image */}
      <div className="relative h-48 bg-slate-700 overflow-hidden">
        <img
          src={newspaper.coverImage}
          alt={newspaper.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

        {/* Category badge */}
        <div
          className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.border} border backdrop-blur-sm`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
        </div>

        {/* Edition badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-slate-900/70 backdrop-blur-sm border border-slate-700">
          <span className="text-xs text-slate-300 font-mono-code">Ed. {newspaper.edition}</span>
        </div>

        {/* Grade badge bottom */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-xs text-blue-300 font-medium">
            Grado {newspaper.grade}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-semibold text-slate-50 text-lg leading-tight mb-1 group-hover:text-white transition-colors">
          {newspaper.title}
        </h3>
        <p className={`text-sm font-medium mb-2 ${cfg.color}`}>{newspaper.subtitle}</p>
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-4">
          {newspaper.excerpt}
        </p>

        {/* Footer meta */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
          <span className="text-xs text-slate-500">{formatDate(newspaper.date)}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {newspaper.views}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {newspaper.pages} págs.
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
