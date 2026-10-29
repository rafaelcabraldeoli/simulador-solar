import React from 'react';
import { Eye } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { calculateAstroPositions } from '../../utils/astronomy';
import { CELESTIAL_BODIES } from '../../data/celestialBodies';
import { AstroId } from '../../types';

export const TopHeader: React.FC = () => {
  const { currentDate, settings, selectedAstroId, selectAstro, followAstro, followAstroId } = useSimulationStore();
  const positions = calculateAstroPositions(currentDate, settings);
  const moonState = positions.moon;

  // Render authentic SVG Lunar Phase dynamically determined by the solar angle
  const renderMoonSvg = () => {
    const phaseFrac = moonState.phase ?? 0.5;
    const illPct = moonState.illuminatedPct ?? 50;
    const phaseAngle = phaseFrac * 2 * Math.PI;
    const isWaxing = phaseAngle <= Math.PI;
    const cx = 24;
    const cy = 24;
    const r = 18;
    const cosA = Math.cos(phaseAngle);
    const rx = Math.max(0.1, Math.abs(r * cosA));
    const sweep = isWaxing ? (cosA < 0 ? 1 : 0) : (cosA < 0 ? 0 : 1);

    let d = '';
    if (illPct >= 99) {
      d = `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
    } else if (illPct <= 1) {
      d = '';
    } else if (isWaxing) {
      d = `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${rx} ${r} 0 0 ${sweep} ${cx} ${cy - r} Z`;
    } else {
      d = `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} A ${rx} ${r} 0 0 ${sweep} ${cx} ${cy - r} Z`;
    }

    return (
      <svg className="w-12 h-12 shrink-0 drop-shadow-md" viewBox="0 0 48 48">
        <defs>
          <clipPath id="lunar-disc-clip">
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
          {d && (
            <clipPath id="lunar-lit-phase-clip">
              <path d={d} />
            </clipPath>
          )}
          <radialGradient id="lunar-surface-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="70%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </radialGradient>
          <radialGradient id="lunar-dark-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
        </defs>

        {/* 1. Base Lunar Disc (Earthshine nocturnal shadow) */}
        <circle cx={cx} cy={cy} r={r} fill="url(#lunar-dark-bg)" stroke="#334155" strokeWidth="0.8" />

        {/* 2. Lit Lunar Hemisphere with Authentic Lunar Maria (Basaltic Seas) */}
        {d && (
          <g clipPath="url(#lunar-lit-phase-clip)">
            {/* Bright Anorthositic Lunar Highlands surface */}
            <circle cx={cx} cy={cy} r={r} fill="url(#lunar-surface-bg)" />

            {/* Authentic Lunar Maria Silhouettes (Oceanus Procellarum, Imbrium, Serenitatis, Tranquillitatis, Crisium) */}
            <g opacity="0.48" fill="#475569">
              {/* Oceanus Procellarum (West) */}
              <ellipse cx={cx - 5.5} cy={cy - 1.5} rx={5.2} ry={6.8} transform={`rotate(-15 ${cx - 5.5} ${cy - 1.5})`} />
              {/* Mare Imbrium (North-West) */}
              <circle cx={cx - 3.2} cy={cy - 4.5} r={3.8} />
              {/* Mare Serenitatis & Tranquillitatis (North-East & East) */}
              <ellipse cx={cx + 3.0} cy={cy - 3.5} rx={2.8} ry={2.5} />
              <ellipse cx={cx + 4.5} cy={cy - 0.5} rx={3.2} ry={2.8} />
              {/* Mare Crisium (Isolated East) */}
              <ellipse cx={cx + 8.5} cy={cy - 2.0} rx={1.8} ry={2.2} />
              {/* Mare Fecunditatis & Nectaris (South-East) */}
              <ellipse cx={cx + 6.2} cy={cy + 3.5} rx={2.6} ry={3.0} />
              <ellipse cx={cx + 3.8} cy={cy + 4.8} rx={1.8} ry={1.6} />
              {/* Mare Nubium & Humorum (South-West) */}
              <ellipse cx={cx - 2.5} cy={cy + 5.0} rx={3.0} ry={2.6} />
              <ellipse cx={cx - 6.5} cy={cy + 4.5} rx={1.8} ry={1.6} />
            </g>

            {/* Tycho Crater Bright Ray Star (South) */}
            <circle cx={cx - 1.0} cy={cy + 8.5} r={0.9} fill="#ffffff" />
            <path
              d={`M ${cx - 1.0} ${cy + 8.5} L ${cx - 8} ${cy + 3} M ${cx - 1.0} ${cy + 8.5} L ${cx + 7} ${cy + 2} M ${cx - 1.0} ${cy + 8.5} L ${cx - 3} ${cy - 2}`}
              stroke="#ffffff"
              strokeWidth="0.5"
              opacity="0.6"
            />
            {/* Copernicus Bright Ray Crater */}
            <circle cx={cx - 2.5} cy={cy - 1.2} r={0.8} fill="#ffffff" />
          </g>
        )}

        {/* 3. Dynamic Silver/Golden Corona Glow */}
        <circle
          cx={cx}
          cy={cy}
          r={r + 0.8}
          fill="none"
          stroke="#fef08a"
          strokeWidth="1.0"
          opacity={Math.max(0.12, (illPct / 100) * 0.55)}
        />
      </svg>
    );
  };

  return (
    <header className="absolute top-3 left-3 right-3 z-30 flex flex-wrap gap-3 pointer-events-none">
      {/* 1. LUA TOP PANEL */}
      <div
        id="moon-top-panel"
        className="pointer-events-auto flex items-center gap-3 bg-slate-950/80 backdrop-blur-md border border-sky-500/20 rounded-xl px-4 py-2.5 shadow-xl shadow-black/40 hover:border-sky-500/40 transition"
      >
        {/* Real-time Dynamic Moon Phase Icon */}
        {renderMoonSvg()}

        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold tracking-wider text-sky-400 uppercase">LUA</span>
            <span className="text-[10px] text-amber-300 font-mono font-bold">({moonState.illuminatedPct ?? 94.5}%)</span>
          </div>
          <div className="text-sm font-medium text-slate-100">{moonState.phaseName || 'Crescente Gibosa'}</div>
          <div className="text-[11px] text-slate-400">
            Distância: <span className="text-amber-300 font-mono">{settings.moonDistanceKm.toLocaleString()} km</span>
          </div>
        </div>

        <button
          id="btn-inspect-moon"
          onClick={() => {
            selectAstro('moon');
            followAstro(followAstroId === 'moon' ? null : 'moon');
          }}
          title="Inspecionar e centralizar Lua"
          className={`ml-1 p-2 rounded-lg border transition ${
            selectedAstroId === 'moon'
              ? 'bg-sky-500/30 border-sky-400 text-sky-200'
              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
