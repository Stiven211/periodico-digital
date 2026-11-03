import { useState } from 'react';
import type { NavState } from '../App';

interface HeaderProps {
  nav: NavState;
  navigate: (state: NavState) => void;
  isAuthenticated: boolean;
}

export default function Header({ nav, navigate, isAuthenticated }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (page: string, category?: string) => {
    if (page === 'home') return nav.page === 'home';
    if (page === 'category' && nav.page === 'category')
      return category ? nav.category === category : true;
    return false;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => navigate({ page: 'home' })}
          className="flex items-center gap-3 group shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-bold group-hover:bg-blue-400 transition-colors group-hover:glow-blue">
            PD
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-semibold text-slate-50 leading-tight font-display">
              Periódico Digital
            </div>
            <div className="text-[11px] text-slate-400 leading-tight">Área de Informática</div>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => navigate({ page: 'home' })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('home')
                ? 'bg-slate-800 text-slate-50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => navigate({ page: 'category', category: 'general' })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              isActive('category', 'general')
                ? 'bg-slate-800 text-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Generales
          </button>
          <button
            onClick={() => navigate({ page: 'category', category: 'tecnologico' })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              isActive('category', 'tecnologico')
                ? 'bg-slate-800 text-green-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Tecnológicos
          </button>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() =>
              navigate(
                isAuthenticated
                  ? { page: 'admin', section: 'dashboard' }
                  : { page: 'admin-login' }
              )
            }
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-sm text-slate-300 hover:border-blue-500 hover:text-blue-400 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Admin
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 flex flex-col gap-1">
          {[
            { label: 'Inicio', state: { page: 'home' } as NavState },
            {
              label: 'Periódicos Generales',
              state: { page: 'category', category: 'general' } as NavState,
            },
            {
              label: 'Periódicos Tecnológicos',
              state: { page: 'category', category: 'tecnologico' } as NavState,
            },
            {
              label: 'Panel Admin',
              state: (isAuthenticated
                ? { page: 'admin', section: 'dashboard' }
                : { page: 'admin-login' }) as NavState,
            },
          ].map(({ label, state }) => (
            <button
              key={label}
              onClick={() => {
                navigate(state);
                setMenuOpen(false);
              }}
              className="text-left px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-50 transition-all"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
