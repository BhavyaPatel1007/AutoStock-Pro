import { useState } from 'react';

const SILHOUETTES = {
  sedan: 'M12 96c0-4 4-8 8-8h24l8-16h108l8 16h20c4 0 8 4 8 8v12c0 4-4 8-8 8h-12a10 10 0 0 1-20 0H52a10 10 0 0 1-20 0H20c-4 0-8-4-8-8V96Z',
  suv: 'M12 100c0-6 6-10 12-10h20l10-20h104l10 20h16c6 0 12 4 12 10v12c0 6-6 10-12 10h-14a10 10 0 0 1-20 0H48a10 10 0 0 1-20 0H24c-6 0-12-4-12-10v-12Z',
  truck: 'M16 96V72l24-28h52l4 8h68l12 16v28c0 4-4 8-8 8h-16a10 10 0 0 1-20 0H48a10 10 0 0 1-20 0H24c-4 0-8-4-8-8Z',
  coupe: 'M12 92c0-4 4-8 8-8h28l12-20h100l16 20h16c4 0 8 4 8 8v10c0 4-4 8-8 8h-12a10 10 0 0 1-20 0H52a10 10 0 0 1-20 0H20c-4 0-8-4-8-8v-10Z',
  convertible: 'M12 88c0-4 4-8 8-8h24l6-12q6-12 12-12h84q6 0 12 12l6 12h24c4 0 8 4 8 8v8c0 4-4 8-8 8h-12a10 10 0 0 1-20 0H52a10 10 0 0 1-20 0H20c-4 0-8-4-8-8v-8Z',
  hatchback: 'M12 96c0-4 4-8 8-8h12l8-16h104l16 16h16c4 0 8 4 8 8v12c0 4-4 8-8 8h-14a10 10 0 0 1-20 0H54a10 10 0 0 1-20 0H20c-4 0-8-4-8-8V96Z',
  van: 'M12 104c0-6 6-10 12-10h12l6-18h132l6 18h8c6 0 12 4 12 10v8c0 6-6 10-12 10h-16a10 10 0 0 1-20 0H48a10 10 0 0 1-20 0H24c-6 0-12-4-12-10v-8Z',
  wagon: 'M12 96c0-4 4-8 8-8h8l8-16h116l8 16h28c4 0 8 4 8 8v12c0 4-4 8-8 8h-12a10 10 0 0 1-20 0H52a10 10 0 0 1-20 0H20c-4 0-8-4-8-8V96Z',
  electric: 'M12 92c0-4 4-8 8-8h24l8-16h104l8 16h24c4 0 8 4 8 8v12c0 4-4 8-8 8h-14a10 10 0 0 1-20 0H54a10 10 0 0 1-20 0H20c-4 0-8-4-8-8V92Z',
  hybrid: 'M12 96c0-4 4-8 8-8h16l8-16h104l8 16h24c4 0 8 4 8 8v12c0 4-4 8-8 8h-14a10 10 0 0 1-20 0H54a10 10 0 0 1-20 0H20c-4 0-8-4-8-8V96Z',
};

const BRAND_THEMES = {
  bmw: { bg: 'from-blue-900 via-blue-800 to-slate-900', glow: 'from-blue-400/15 via-transparent to-transparent', accent: 'blue', textAccent: 'text-blue-300', badge: 'bg-blue-500/20 text-blue-200 border-blue-400/30', button: 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25', initial: 'BM', labelColor: 'text-blue-300', ring: 'ring-blue-400/30' },
  'mercedes-benz': { bg: 'from-slate-600 via-slate-700 to-slate-900', glow: 'from-white/10 via-transparent to-transparent', accent: 'slate', textAccent: 'text-slate-200', badge: 'bg-slate-500/20 text-slate-200 border-slate-400/30', button: 'bg-slate-400 hover:bg-slate-300 text-slate-900 shadow-lg shadow-slate-400/25', initial: 'MB', labelColor: 'text-slate-300', ring: 'ring-slate-400/30' },
  audi: { bg: 'from-zinc-800 via-zinc-900 to-black', glow: 'from-red-500/10 via-transparent to-transparent', accent: 'red', textAccent: 'text-red-300', badge: 'bg-red-500/20 text-red-200 border-red-400/30', button: 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/25', initial: 'AU', labelColor: 'text-red-300', ring: 'ring-red-400/30' },
  toyota: { bg: 'from-red-800 via-red-900 to-slate-900', glow: 'from-red-400/15 via-transparent to-transparent', accent: 'red', textAccent: 'text-red-300', badge: 'bg-red-500/20 text-red-200 border-red-400/30', button: 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/25', initial: 'TO', labelColor: 'text-red-300', ring: 'ring-red-400/30' },
  honda: { bg: 'from-blue-800 via-blue-900 to-slate-900', glow: 'from-blue-400/15 via-transparent to-transparent', accent: 'blue', textAccent: 'text-blue-300', badge: 'bg-blue-500/20 text-blue-200 border-blue-400/30', button: 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25', initial: 'HO', labelColor: 'text-blue-300', ring: 'ring-blue-400/30' },
  hyundai: { bg: 'from-sky-700 via-blue-800 to-slate-900', glow: 'from-sky-400/15 via-transparent to-transparent', accent: 'sky', textAccent: 'text-sky-300', badge: 'bg-sky-500/20 text-sky-200 border-sky-400/30', button: 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25', initial: 'HD', labelColor: 'text-sky-300', ring: 'ring-sky-400/30' },
  kia: { bg: 'from-rose-800 via-rose-900 to-slate-900', glow: 'from-rose-400/15 via-transparent to-transparent', accent: 'rose', textAccent: 'text-rose-300', badge: 'bg-rose-500/20 text-rose-200 border-rose-400/30', button: 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/25', initial: 'KI', labelColor: 'text-rose-300', ring: 'ring-rose-400/30' },
  mahindra: { bg: 'from-red-900 via-red-950 to-slate-900', glow: 'from-red-400/10 via-transparent to-transparent', accent: 'red', textAccent: 'text-red-300', badge: 'bg-red-500/20 text-red-200 border-red-400/30', button: 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/25', initial: 'MA', labelColor: 'text-red-300', ring: 'ring-red-400/30' },
  tata: { bg: 'from-cyan-800 via-blue-900 to-slate-900', glow: 'from-cyan-400/15 via-transparent to-transparent', accent: 'cyan', textAccent: 'text-cyan-300', badge: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30', button: 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/25', initial: 'TA', labelColor: 'text-cyan-300', ring: 'ring-cyan-400/30' },
  volkswagen: { bg: 'from-blue-950 via-indigo-950 to-slate-900', glow: 'from-blue-400/10 via-transparent to-transparent', accent: 'indigo', textAccent: 'text-indigo-300', badge: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30', button: 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25', initial: 'VW', labelColor: 'text-indigo-300', ring: 'ring-indigo-400/30' },
  skoda: { bg: 'from-emerald-800 via-emerald-900 to-slate-900', glow: 'from-emerald-400/15 via-transparent to-transparent', accent: 'emerald', textAccent: 'text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30', button: 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25', initial: 'SK', labelColor: 'text-emerald-300', ring: 'ring-emerald-400/30' },
  ford: { bg: 'from-blue-800 via-indigo-800 to-slate-900', glow: 'from-blue-400/15 via-transparent to-transparent', accent: 'blue', textAccent: 'text-blue-300', badge: 'bg-blue-500/20 text-blue-200 border-blue-400/30', button: 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25', initial: 'FO', labelColor: 'text-blue-300', ring: 'ring-blue-400/30' },
  chevrolet: { bg: 'from-yellow-800 via-yellow-900 to-slate-900', glow: 'from-yellow-400/15 via-transparent to-transparent', accent: 'yellow', textAccent: 'text-yellow-300', badge: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30', button: 'bg-yellow-500 hover:bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-500/25', initial: 'CH', labelColor: 'text-yellow-300', ring: 'ring-yellow-400/30' },
  nissan: { bg: 'from-red-800 via-rose-900 to-slate-900', glow: 'from-red-400/15 via-transparent to-transparent', accent: 'red', textAccent: 'text-red-300', badge: 'bg-red-500/20 text-red-200 border-red-400/30', button: 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/25', initial: 'NI', labelColor: 'text-red-300', ring: 'ring-red-400/30' },
  jeep: { bg: 'from-lime-800 via-lime-900 to-slate-900', glow: 'from-lime-400/15 via-transparent to-transparent', accent: 'lime', textAccent: 'text-lime-300', badge: 'bg-lime-500/20 text-lime-200 border-lime-400/30', button: 'bg-lime-500 hover:bg-lime-400 text-white shadow-lg shadow-lime-500/25', initial: 'JE', labelColor: 'text-lime-300', ring: 'ring-lime-400/30' },
  lexus: { bg: 'from-zinc-700 via-zinc-800 to-slate-900', glow: 'from-white/10 via-transparent to-transparent', accent: 'zinc', textAccent: 'text-zinc-300', badge: 'bg-zinc-500/20 text-zinc-200 border-zinc-400/30', button: 'bg-zinc-400 hover:bg-zinc-300 text-slate-900 shadow-lg shadow-zinc-400/25', initial: 'LX', labelColor: 'text-zinc-300', ring: 'ring-zinc-400/30' },
  volvo: { bg: 'from-sky-800 via-blue-900 to-slate-900', glow: 'from-sky-400/15 via-transparent to-transparent', accent: 'sky', textAccent: 'text-sky-300', badge: 'bg-sky-500/20 text-sky-200 border-sky-400/30', button: 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25', initial: 'VO', labelColor: 'text-sky-300', ring: 'ring-sky-400/30' },
  porsche: { bg: 'from-amber-800 via-yellow-900 to-slate-900', glow: 'from-amber-400/20 via-transparent to-transparent', accent: 'amber', textAccent: 'text-amber-300', badge: 'bg-amber-500/20 text-amber-200 border-amber-400/30', button: 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/25', initial: 'PO', labelColor: 'text-amber-300', ring: 'ring-amber-400/30' },
  ferrari: { bg: 'from-red-600 via-red-700 to-slate-900', glow: 'from-red-400/20 via-transparent to-transparent', accent: 'red', textAccent: 'text-red-200', badge: 'bg-red-500/20 text-red-200 border-red-400/30', button: 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/25', initial: 'FE', labelColor: 'text-red-200', ring: 'ring-red-400/30' },
  lamborghini: { bg: 'from-amber-600 via-yellow-700 to-slate-900', glow: 'from-yellow-400/20 via-transparent to-transparent', accent: 'yellow', textAccent: 'text-yellow-200', badge: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30', button: 'bg-yellow-500 hover:bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-500/25', initial: 'LM', labelColor: 'text-yellow-200', ring: 'ring-yellow-400/30' },
  mclaren: { bg: 'from-orange-700 via-orange-800 to-slate-900', glow: 'from-orange-400/20 via-transparent to-transparent', accent: 'orange', textAccent: 'text-orange-200', badge: 'bg-orange-500/20 text-orange-200 border-orange-400/30', button: 'bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/25', initial: 'MC', labelColor: 'text-orange-200', ring: 'ring-orange-400/30' },
  tesla: { bg: 'from-slate-800 via-slate-900 to-black', glow: 'from-white/10 via-transparent to-transparent', accent: 'white', textAccent: 'text-white', badge: 'bg-white/20 text-white border-white/30', button: 'bg-white hover:bg-slate-200 text-slate-900 shadow-lg shadow-white/25', initial: 'TE', labelColor: 'text-white', ring: 'ring-white/30' },
  byd: { bg: 'from-red-800 via-rose-900 to-slate-900', glow: 'from-rose-400/15 via-transparent to-transparent', accent: 'rose', textAccent: 'text-rose-300', badge: 'bg-rose-500/20 text-rose-200 border-rose-400/30', button: 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/25', initial: 'BY', labelColor: 'text-rose-300', ring: 'ring-rose-400/30' },
  mg: { bg: 'from-red-700 via-red-800 to-slate-900', glow: 'from-red-400/15 via-transparent to-transparent', accent: 'red', textAccent: 'text-red-300', badge: 'bg-red-500/20 text-red-200 border-red-400/30', button: 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/25', initial: 'MG', labelColor: 'text-red-300', ring: 'ring-red-400/30' },
  mazda: { bg: 'from-rose-700 via-rose-800 to-slate-900', glow: 'from-rose-400/15 via-transparent to-transparent', accent: 'rose', textAccent: 'text-rose-300', badge: 'bg-rose-500/20 text-rose-200 border-rose-400/30', button: 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/25', initial: 'MZ', labelColor: 'text-rose-300', ring: 'ring-rose-400/30' },
  subaru: { bg: 'from-blue-800 via-sky-900 to-slate-900', glow: 'from-sky-400/15 via-transparent to-transparent', accent: 'sky', textAccent: 'text-sky-300', badge: 'bg-sky-500/20 text-sky-200 border-sky-400/30', button: 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25', initial: 'SU', labelColor: 'text-sky-300', ring: 'ring-sky-400/30' },
  ram: { bg: 'from-stone-700 via-stone-800 to-slate-900', glow: 'from-white/10 via-transparent to-transparent', accent: 'stone', textAccent: 'text-stone-300', badge: 'bg-stone-500/20 text-stone-200 border-stone-400/30', button: 'bg-stone-400 hover:bg-stone-300 text-slate-900 shadow-lg shadow-stone-400/25', initial: 'RA', labelColor: 'text-stone-300', ring: 'ring-stone-400/30' },
  fiat: { bg: 'from-red-600 via-rose-700 to-slate-900', glow: 'from-red-400/15 via-transparent to-transparent', accent: 'red', textAccent: 'text-red-200', badge: 'bg-red-500/20 text-red-200 border-red-400/30', button: 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/25', initial: 'FI', labelColor: 'text-red-200', ring: 'ring-red-400/30' },
};

const DEFAULT_THEME = {
  bg: 'from-slate-700 via-slate-800 to-slate-900', glow: 'from-white/10 via-transparent to-transparent', accent: 'slate', textAccent: 'text-slate-200', badge: 'bg-slate-500/20 text-slate-200 border-slate-400/30', button: 'bg-slate-400 hover:bg-slate-300 text-slate-900 shadow-lg shadow-slate-400/25', initial: '--', labelColor: 'text-slate-300', ring: 'ring-slate-400/30',
};

function getTheme(make) {
  const key = (make || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return BRAND_THEMES[key] || DEFAULT_THEME;
}

function getSilhouette(category) {
  return SILHOUETTES[(category || '').toLowerCase()] || SILHOUETTES.sedan;
}

export default function VehicleCard({ vehicle, onPurchase, purchasing, adminActions }) {
  const [hovered, setHovered] = useState(false);
  const v = vehicle;
  const theme = getTheme(v?.make);
  const silhouette = getSilhouette(v?.category);

  const stockLabel = v?.quantity <= 0 ? 'Out of Stock' : v?.quantity <= 2 ? `${v.quantity} left` : `${v.quantity} in stock`;
  const stockStyle = v?.quantity <= 0
    ? 'bg-red-500/30 text-red-200 border-red-400/30'
    : v?.quantity <= 2
    ? 'bg-amber-500/30 text-amber-200 border-amber-400/30'
    : 'bg-emerald-500/30 text-emerald-200 border-emerald-400/30';

  return (
    <div
      className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Brand gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg}`} />

      {/* Hover glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

      {/* Ambient glow behind silhouette on hover */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 rounded-full ${theme.accent === 'white' ? 'bg-white/5' : `bg-${theme.accent}-500/10`} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

      {/* Glassmorphism surface */}
      <div className="relative backdrop-blur-xl bg-white/[0.07] border border-white/[0.10] h-full rounded-2xl">

        {/* Top visual area */}
        <div className="relative h-44 flex items-center justify-center overflow-hidden">
          {/* Category badge */}
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider shadow-sm backdrop-blur-sm border ${theme.badge}`}>
            {v?.category || 'N/A'}
          </div>

          {/* Stock badge */}
          <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider shadow-sm backdrop-blur-sm border ${stockStyle}`}>
            {stockLabel}
          </div>

          {/* Silhouette */}
          <svg
            className={`w-32 h-24 transition-all duration-700 ${hovered ? 'scale-110 translate-y-[-4px]' : 'scale-100 translate-y-0'}`}
            viewBox="0 0 200 120"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={silhouette} className="text-white/30 transition-colors duration-500 group-hover:text-white/40" />
            {/* Ground line */}
            <line x1="10" y1="116" x2="190" y2="116" className="text-white/10" strokeWidth="0.8" />
          </svg>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/[0.08] to-transparent pointer-events-none" />
        </div>

        {/* Info area */}
        <div className="px-5 pb-5 pt-4">
          {/* Brand badge + make/model */}
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold tracking-wider uppercase shadow-lg ${theme.button}`}>
              {theme.initial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{v?.make || 'Unknown'}</p>
              <p className={`text-xs ${theme.labelColor} truncate opacity-80`}>{v?.model || ''}</p>
            </div>
          </div>

          {/* Price and purchase */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div>
              <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Price</p>
              <p className={`text-lg font-bold ${theme.textAccent}`}>
                ${(v?.price || 0)?.toLocaleString()}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onPurchase?.(v?.id); }}
              disabled={v?.quantity <= 0 || purchasing}
              className={`relative overflow-hidden px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-95 ${theme.button}`}
            >
              {purchasing ? (
                <span className="flex items-center gap-1.5">
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Buying...
                </span>
              ) : v?.quantity <= 0 ? 'Out of Stock' : 'Purchase'}
            </button>
          </div>

          {/* Admin actions */}
          {adminActions && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
              {adminActions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
