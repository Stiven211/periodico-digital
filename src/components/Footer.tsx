export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                PD
              </div>
              <span className="font-display font-semibold text-slate-100">Periódico Digital</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              La voz estudiantil de los grados 11-1, 11-2 y 11-3. Un proyecto del Área de
              Informática.
            </p>
          </div>

          {/* Categorías */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Categorías
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Periódicos Generales
                </span>
              </li>
              <li>
                <span className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Periódicos Tecnológicos
                </span>
              </li>
            </ul>
          </div>

          {/* Grados */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Grados participantes
            </h4>
            <ul className="space-y-2">
              {['Grado 11-1', 'Grado 11-2', 'Grado 11-3'].map((g) => (
                <li key={g} className="text-sm text-slate-400">
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            © 2024 Área de Informática · Institución Educativa
          </p>
          <p className="text-xs text-slate-600 font-mono-code">
            Proyecto Periódico Digital · Grado 11
          </p>
        </div>
      </div>
    </footer>
  );
}
