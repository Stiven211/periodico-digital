import { useState } from 'react';
import NewspaperCard from '../components/NewspaperCard';
import { newspapers } from '../data';
import type { Category, Grade } from '../data';
import type { NavState } from '../App';

interface CategoryPageProps {
  category: Category;
  navigate: (state: NavState) => void;
}

type GradeFilter = Grade | 'all';

const categoryConfig = {
  general: {
    label: 'Periódicos Generales',
    description:
      'Publicaciones sobre cultura, deporte, medio ambiente y vida institucional de nuestra comunidad educativa.',
    accentColor: 'text-amber-400',
    bgAccent: 'bg-amber-500/10',
    borderAccent: 'border-amber-500/30',
    gradientFrom: 'from-amber-900/30',
    dot: 'bg-amber-500',
    icon: '📰',
    heroImage:
      'https://images.unsplash.com/photo-1652305500057-0fcb348b62aa?w=1600&h=600&fit=crop&auto=format',
  },
  tecnologico: {
    label: 'Periódicos Tecnológicos',
    description:
      'Publicaciones sobre inteligencia artificial, ciberseguridad, desarrollo web y las últimas tendencias digitales.',
    accentColor: 'text-green-400',
    bgAccent: 'bg-green-500/10',
    borderAccent: 'border-green-500/30',
    gradientFrom: 'from-green-900/30',
    dot: 'bg-green-500',
    icon: '💻',
    heroImage:
      'https://images.unsplash.com/photo-1719159381981-1327b22aff9b?w=1600&h=600&fit=crop&auto=format',
  },
};

export default function CategoryPage({ category, navigate }: CategoryPageProps) {
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('all');
  const cfg = categoryConfig[category];

  const filtered = newspapers.filter((n) => {
    if (n.status !== 'published') return false;
    if (n.category !== category) return false;
    if (gradeFilter !== 'all' && n.grade !== gradeFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 pt-16">
      {/* Category hero */}
      <section className="relative h-72 flex items-end overflow-hidden">
        <img
          src={cfg.heroImage}
          alt={cfg.label}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${cfg.gradientFrom} to-slate-900/90`} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-8 w-full">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <button
              onClick={() => navigate({ page: 'home' })}
              className="hover:text-slate-300 transition-colors"
            >
              Inicio
            </button>
            <span>/</span>
            <span className={cfg.accentColor}>{cfg.label}</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${cfg.bgAccent} ${cfg.borderAccent} border`}
            >
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              <span className={`text-xs font-medium ${cfg.accentColor}`}>{cfg.label}</span>
            </div>
            <span className="text-xs text-slate-500">{filtered.length} publicaciones</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-50 mb-2">
            {cfg.icon} {cfg.label}
          </h1>
          <p className="text-slate-300 max-w-xl text-sm">{cfg.description}</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Grade filters */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
            Filtrar por grado:
          </span>
          {(['all', '11-1', '11-2', '11-3'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGradeFilter(g)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                gradeFilter === g
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-300 border border-slate-700'
              }`}
            >
              {g === 'all' ? 'Todos los grados' : `Grado ${g}`}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((n) => (
              <NewspaperCard key={n.id} newspaper={n} navigate={navigate} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-slate-400">No hay periódicos publicados para el grado seleccionado.</p>
            <button
              onClick={() => setGradeFilter('all')}
              className="mt-4 text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Ver todos los grados
            </button>
          </div>
        )}

        {/* Switch category banner */}
        <div className="mt-16 p-6 rounded-2xl border border-slate-700 bg-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">¿Buscas otro tipo de contenido?</p>
            <p className="font-display font-semibold text-slate-100">
              {category === 'general'
                ? 'Explora los Periódicos Tecnológicos'
                : 'Explora los Periódicos Generales'}
            </p>
          </div>
          <button
            onClick={() =>
              navigate({
                page: 'category',
                category: category === 'general' ? 'tecnologico' : 'general',
              })
            }
            className={`shrink-0 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              category === 'general'
                ? 'bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            {category === 'general' ? '💻 Ver Tecnológicos' : '📰 Ver Generales'}
          </button>
        </div>
      </section>
    </div>
  );
}
