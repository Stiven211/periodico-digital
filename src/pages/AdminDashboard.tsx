import { useState } from 'react';
import { newspapers as initialNewspapers } from '../data';
import type { Newspaper, AdminSection, Category, Grade } from '../data';
import type { NavState } from '../App';
import DriveInbox from '../components/DriveInbox';

interface AdminDashboardProps {
  section: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  onLogout: () => void;
  navigate: (state: NavState) => void;
}

const navItems: { id: AdminSection; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'upload', label: 'Subir', icon: '↑' },
  { id: 'manage', label: 'Gestionar', icon: '≡' },
  { id: 'drive', label: 'Drive', icon: '◎' },
];

/* ─── Sidebar (desktop) ────────────────────────────────────────── */
function Sidebar({
  section,
  onSectionChange,
  onLogout,
  navigate,
  onClose,
  mobile,
}: {
  section: AdminSection;
  onSectionChange: (s: AdminSection) => void;
  onLogout: () => void;
  navigate: (state: NavState) => void;
  onClose?: () => void;
  mobile?: boolean;
}) {
  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 flex flex-col ${
        mobile ? 'w-72 h-full' : 'w-64 h-screen sticky top-0'
      }`}
    >
      {/* Logo */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-[0_0_12px_rgba(59,130,246,0.4)]">
            PD
          </div>
          <div>
            <p className="font-display font-semibold text-slate-100 text-sm leading-tight">
              Periódico Digital
            </p>
            <p className="text-[11px] text-slate-500">Panel Admin</p>
          </div>
        </div>
        {mobile && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onSectionChange(item.id);
              onClose?.();
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              section === item.id
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label === 'Subir' ? 'Subir Periódico' : item.label}</span>
          </button>
        ))}

        <div className="pt-4 border-t border-slate-800 mt-4">
          <button
            onClick={() => { navigate({ page: 'home' }); onClose?.(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <span className="text-base">🌐</span>
            Ver sitio público
          </button>
        </div>
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm shrink-0">
            👨‍🏫
          </div>
          <div className="min-w-0">
            <p className="text-sm text-slate-200 font-medium leading-tight">Profesor</p>
            <p className="text-xs text-slate-500 truncate">Área de Informática</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all border border-transparent hover:border-red-500/30"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

/* ─── Dashboard home ────────────────────────────────────────────── */
function DashboardHome({
  papers,
  onSectionChange,
  navigate,
}: {
  papers: Newspaper[];
  onSectionChange: (s: AdminSection) => void;
  navigate: (state: NavState) => void;
}) {
  const published = papers.filter((p) => p.status === 'published');
  const totalViews = papers.reduce((sum, p) => sum + p.views, 0);
  const techCount = papers.filter((p) => p.category === 'tecnologico').length;
  const generalCount = papers.filter((p) => p.category === 'general').length;

  const statCards = [
    { label: 'Publicados', value: published.length, icon: '📰', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
    { label: 'Vistas', value: totalViews.toLocaleString('es-CO'), icon: '👁️', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
    { label: 'Tecnológicos', value: techCount, icon: '💻', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
    { label: 'Generales', value: generalCount, icon: '📝', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  ];

  const recent = [...papers]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-6">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-50">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-0.5">Resumen general del Periódico Digital</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className={`p-4 rounded-2xl border ${s.bg}`}>
            <div className="text-xl mb-2">{s.icon}</div>
            <div className={`font-display text-2xl sm:text-3xl font-bold ${s.color} mb-0.5`}>{s.value}</div>
            <div className="text-xs text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-slate-100 text-sm">Publicaciones recientes</h2>
          <button onClick={() => onSectionChange('manage')} className="text-xs text-blue-400 hover:text-blue-300">
            Ver todas →
          </button>
        </div>
        <div className="space-y-3">
          {recent.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate({ page: 'newspaper', id: p.id })}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-700/50 transition-all text-left"
            >
              <img src={p.coverImage} alt={p.title} className="w-10 h-10 rounded-lg object-cover shrink-0 bg-slate-700" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-100 text-sm truncate">{p.title}</p>
                <p className="text-xs text-slate-400 truncate">{p.grade} · {p.category === 'tecnologico' ? 'Tecnológico' : 'General'}</p>
              </div>
              <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${p.status === 'published' ? 'bg-green-500/15 text-green-400' : 'bg-slate-600/40 text-slate-400'}`}>
                {p.status === 'published' ? 'Pub.' : 'Draft'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
        <h2 className="font-display font-semibold text-slate-100 text-sm mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { label: 'Subir nuevo periódico', icon: '⬆️', action: () => onSectionChange('upload'), primary: true },
            { label: 'Gestionar publicaciones', icon: '📋', action: () => onSectionChange('manage'), primary: false },
            { label: 'Ver sitio público', icon: '🌐', action: () => navigate({ page: 'home' }), primary: false },
          ].map((a) => (
            <button
              key={a.label}
              onClick={a.action}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                a.primary
                  ? 'bg-blue-500 text-white hover:bg-blue-400'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
            >
              <span>{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Upload form ───────────────────────────────────────────────── */
function UploadForm({ onSuccess }: { onSuccess: (paper: Newspaper) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    grade: '11-1' as Grade,
    category: 'general' as Category,
    editor: '',
    designer: '',
    reporters: '',
    excerpt: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setFileName(file.name);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;
    setSubmitting(true);
    setTimeout(() => {
      const newPaper: Newspaper = {
        id: `custom-${Date.now()}`,
        title: form.title,
        subtitle: form.subtitle,
        grade: form.grade,
        category: form.category,
        date: form.date,
        coverImage:
          form.category === 'tecnologico'
            ? 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop&auto=format'
            : 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=600&h=400&fit=crop&auto=format',
        status: 'published',
        excerpt: form.excerpt,
        views: 0,
        edition: 1,
        pages: 4,
        team: [
          { role: 'Editor', name: form.editor },
          { role: 'Diseñador', name: form.designer },
          ...form.reporters.split(',').map((r) => r.trim()).filter(Boolean).map((name) => ({ role: 'Redactor', name })),
        ],
        sections: [{ title: form.subtitle || form.title, content: form.excerpt }],
      };
      onSuccess(newPaper);
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="p-5 sm:p-8 flex items-center justify-center min-h-64">
        <div className="text-center max-w-xs">
          <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4 text-2xl">
            ✅
          </div>
          <h2 className="font-display text-lg font-bold text-slate-50 mb-2">¡Publicado!</h2>
          <p className="text-slate-400 text-sm mb-5">
            <strong className="text-slate-200">{form.title}</strong> ya es visible en el sitio público.
          </p>
          <button
            onClick={() => { setSubmitted(false); setFileName(''); setForm({ title: '', subtitle: '', grade: '11-1', category: 'general', editor: '', designer: '', reporters: '', excerpt: '', date: new Date().toISOString().split('T')[0] }); }}
            className="px-5 py-2.5 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-400 transition-all"
          >
            Subir otro periódico
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-6">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-50">Subir Periódico</h1>
        <p className="text-slate-400 text-sm mt-0.5">Importa un PDF o Word y completa los datos.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        {/* Dropzone */}
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
            dragOver ? 'border-blue-400 bg-blue-500/10' : fileName ? 'border-green-500/60 bg-green-500/5' : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
          }`}
        >
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileInput} className="hidden" />
          {fileName ? (
            <div className="text-center px-4">
              <div className="text-2xl mb-1">📄</div>
              <p className="text-sm font-medium text-green-400 truncate max-w-full">{fileName}</p>
              <p className="text-xs text-slate-400 mt-0.5">Cargado · Click para cambiar</p>
            </div>
          ) : (
            <div className="text-center px-4">
              <div className="text-3xl mb-2">☁️</div>
              <p className="text-sm text-slate-300">
                Arrastra aquí o <span className="text-blue-400 underline">busca el archivo</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">PDF, DOC, DOCX · Máx. 50 MB</p>
            </div>
          )}
        </label>

        {/* Title & subtitle */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Título *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej: TechLab News" required className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Subtítulo</label>
            <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Ej: Inteligencia Artificial" className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm transition-all" />
          </div>
        </div>

        {/* Category & grade */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Categoría *</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-blue-500 text-sm transition-all">
              <option value="general">📰 General</option>
              <option value="tecnologico">💻 Tecnológico</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Grado *</label>
            <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value as Grade })} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-blue-500 text-sm transition-all">
              <option value="11-1">Grado 11-1</option>
              <option value="11-2">Grado 11-2</option>
              <option value="11-3">Grado 11-3</option>
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Fecha de publicación</label>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-blue-500 text-sm transition-all" />
        </div>

        {/* Team */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Equipo editorial</label>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <input value={form.editor} onChange={(e) => setForm({ ...form, editor: e.target.value })} placeholder="Editor principal" required className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm transition-all" />
            <input value={form.designer} onChange={(e) => setForm({ ...form, designer: e.target.value })} placeholder="Diseñador" className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm transition-all" />
          </div>
          <input value={form.reporters} onChange={(e) => setForm({ ...form, reporters: e.target.value })} placeholder="Redactores (separados por coma)" className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm transition-all" />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Descripción</label>
          <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Breve descripción del contenido..." rows={3} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm transition-all resize-none" />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            type="submit"
            disabled={!fileName || !form.title || !form.editor || submitting}
            className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed font-display"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Publicando...
              </>
            ) : (
              '⬆️ Publicar periódico'
            )}
          </button>
          <button type="button" className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm transition-all">
            Guardar borrador
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Manage list ───────────────────────────────────────────────── */
function ManageList({ papers, onDelete, navigate }: { papers: Newspaper[]; onDelete: (id: string) => void; navigate: (state: NavState) => void }) {
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = papers.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.grade.includes(search) ||
      p.category.includes(search.toLowerCase())
  );

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-50">Gestionar</h1>
          <p className="text-slate-400 text-sm mt-0.5">{papers.length} publicaciones</p>
        </div>
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm transition-all" />
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        {/* Mobile: card list */}
        <div className="sm:hidden divide-y divide-slate-700">
          {filtered.map((p) => (
            <div key={p.id} className="p-4 flex items-start gap-3">
              <img src={p.coverImage} alt={p.title} className="w-12 h-12 rounded-lg object-cover bg-slate-700 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-100 text-sm truncate">{p.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">Grado {p.grade} · {p.category === 'tecnologico' ? 'Tecnológico' : 'General'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${p.status === 'published' ? 'bg-green-500/15 text-green-400' : 'bg-slate-600/40 text-slate-400'}`}>
                    {p.status === 'published' ? 'Publicado' : 'Borrador'}
                  </span>
                  <span className="text-xs text-slate-500">{p.views} vistas</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => navigate({ page: 'newspaper', id: p.id })} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                {confirmDelete === p.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => { onDelete(p.id); setConfirmDelete(null); }} className="text-[10px] px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30">Sí</button>
                    <button onClick={() => setConfirmDelete(null)} className="text-[10px] px-2 py-1 rounded bg-slate-700 text-slate-300">No</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(p.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: table */}
        <table className="hidden sm:table w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Periódico</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Grado</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Fecha</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Estado</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vistas</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-700/30 transition-all group">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <img src={p.coverImage} alt={p.title} className="w-10 h-10 rounded-lg object-cover bg-slate-700 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-100 truncate">{p.title}</p>
                      <p className="text-xs text-slate-500 truncate">{p.subtitle}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-xs border border-blue-500/30">{p.grade}</span>
                </td>
                <td className="px-3 py-4 text-slate-400 text-xs hidden lg:table-cell">
                  {new Date(p.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="px-3 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'published' ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-slate-600/40 text-slate-400 border border-slate-600'}`}>
                    {p.status === 'published' ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td className="px-3 py-4 text-slate-400 text-sm">{p.views.toLocaleString()}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => navigate({ page: 'newspaper', id: p.id })} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    {confirmDelete === p.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => { onDelete(p.id); setConfirmDelete(null); }} className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30">Sí, eliminar</button>
                        <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 rounded text-xs bg-slate-700 text-slate-300">Cancelar</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(p.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm">No se encontraron periódicos.</div>
        )}
      </div>
    </div>
  );
}

/* ─── Main AdminDashboard ───────────────────────────────────────── */
export default function AdminDashboard({ section, onSectionChange, onLogout, navigate }: AdminDashboardProps) {
  const [papers, setPapers] = useState<Newspaper[]>(initialNewspapers);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleUploadSuccess = (paper: Newspaper) => {
    setPapers((prev) => [paper, ...prev]);
    onSectionChange('manage');
  };

  const handleDelete = (id: string) => {
    setPapers((prev) => prev.filter((p) => p.id !== id));
  };

  const currentLabel = navItems.find((n) => n.id === section)?.label ?? 'Dashboard';
  const currentIcon = navItems.find((n) => n.id === section)?.icon ?? '📊';

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar section={section} onSectionChange={onSectionChange} onLogout={onLogout} navigate={navigate} />
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative z-10 h-full">
            <Sidebar section={section} onSectionChange={onSectionChange} onLogout={onLogout} navigate={navigate} onClose={() => setDrawerOpen(false)} mobile />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-slate-800 bg-slate-900 shrink-0">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-bold">PD</div>
            <span className="font-display font-semibold text-slate-100 text-sm">
              {currentIcon} {currentLabel}
            </span>
          </div>
          <button onClick={onLogout} className="ml-auto text-xs text-slate-400 hover:text-slate-200 transition-colors">
            Salir
          </button>
        </div>

        {/* Mobile bottom tab bar */}
        <div className="md:hidden flex border-t border-slate-800 bg-slate-900 shrink-0 order-last">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-all ${
                section === item.id ? 'text-blue-400 bg-blue-500/5' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          {section === 'dashboard' && <DashboardHome papers={papers} onSectionChange={onSectionChange} navigate={navigate} />}
          {section === 'upload' && <UploadForm onSuccess={handleUploadSuccess} />}
          {section === 'manage' && <ManageList papers={papers} onDelete={handleDelete} navigate={navigate} />}
          {section === 'drive' && <DriveInbox navigate={navigate} />}
        </main>
      </div>
    </div>
  );
}
