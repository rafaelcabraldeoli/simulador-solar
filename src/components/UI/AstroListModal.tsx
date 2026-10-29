import React from 'react';
import { X, Orbit, Eye, Sparkles } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { CELESTIAL_BODIES } from '../../data/celestialBodies';
import { calculateAstroPositions } from '../../utils/astronomy';
import { AstroId } from '../../types';

export const AstroListModal: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedAstroId,
    selectAstro,
    followAstro,
    followAstroId,
    currentDate,
    settings,
  } = useSimulationStore();

  if (activeTab !== 'astros') return null;

  const positions = calculateAstroPositions(currentDate, settings);
  const astros = Object.values(CELESTIAL_BODIES);
  const moonState = positions.moon;

  // Render authentic SVG Lunar Phase dynamically determined by the solar angle
  const renderMoonSvg = () => {
    const phaseFrac = moonState?.phase ?? 0.5;
    const illPct = moonState?.illuminatedPct ?? 50;
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
      <svg className="w-14 h-14 shrink-0 drop-shadow-md" viewBox="0 0 48 48">
        <defs>
          <clipPath id="modal-lunar-disc-clip">
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
          {d && (
            <clipPath id="modal-lunar-lit-phase-clip">
              <path d={d} />
            </clipPath>
          )}
          <radialGradient id="modal-lunar-surface-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="70%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </radialGradient>
          <radialGradient id="modal-lunar-dark-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
        </defs>

        <circle cx={cx} cy={cy} r={r} fill="url(#modal-lunar-dark-bg)" stroke="#334155" strokeWidth="0.8" />

        {d && (
          <g clipPath="url(#modal-lunar-lit-phase-clip)">
            <circle cx={cx} cy={cy} r={r} fill="url(#modal-lunar-surface-bg)" />
            <g opacity="0.48" fill="#475569">
              <ellipse cx={cx - 5.5} cy={cy - 1.5} rx={5.2} ry={6.8} transform={`rotate(-15 ${cx - 5.5} ${cy - 1.5})`} />
              <circle cx={cx - 3.2} cy={cy - 4.5} r={3.8} />
              <ellipse cx={cx + 3.0} cy={cy - 3.5} rx={2.8} ry={2.5} />
              <ellipse cx={cx + 4.5} cy={cy - 0.5} rx={3.2} ry={2.8} />
              <ellipse cx={cx + 8.5} cy={cy - 2.0} rx={1.8} ry={2.2} />
              <ellipse cx={cx + 6.2} cy={cy + 3.5} rx={2.6} ry={3.0} />
              <ellipse cx={cx + 3.8} cy={cy + 4.8} rx={1.8} ry={1.6} />
              <ellipse cx={cx - 2.5} cy={cy + 5.0} rx={3.0} ry={2.6} />
              <ellipse cx={cx - 6.5} cy={cy + 4.5} rx={1.8} ry={1.6} />
            </g>
            <circle cx={cx - 1.0} cy={cy + 8.5} r={0.9} fill="#ffffff" />
            <path
              d={`M ${cx - 1.0} ${cy + 8.5} L ${cx - 8} ${cy + 3} M ${cx - 1.0} ${cy + 8.5} L ${cx + 7} ${cy + 2} M ${cx - 1.0} ${cy + 8.5} L ${cx - 3} ${cy - 2}`}
              stroke="#ffffff"
              strokeWidth="0.5"
              opacity="0.6"
            />
            <circle cx={cx - 2.5} cy={cy - 1.2} r={0.8} fill="#ffffff" />
          </g>
        )}

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
    <div
      id="modal-astros-full"
      className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-xl p-4 sm:p-8 flex flex-col pointer-events-auto overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-600/30 border border-sky-400 text-sky-300">
            <Orbit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 uppercase tracking-wider">
              Catálogo de Astros do Modelo Planar
            </h2>
            <p className="text-xs text-slate-400">
              Corpos celestes independentes estratificados em camadas de altitude e órbitas autônomas
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('system')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <X className="w-4 h-4" />
          <span>Voltar ao Mapa 3D</span>
        </button>
      </div>

      {/* Featured Lunar & Quick Navigation Banner */}
      <div className="my-5 p-4 rounded-2xl bg-slate-900/80 border border-sky-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          {renderMoonSvg()}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Fase da Lua Atual</span>
              <span className="text-xs text-amber-300 font-mono font-bold">({moonState?.illuminatedPct ?? 94.5}% Iluminada)</span>
            </div>
            <h3 className="text-base font-bold text-slate-100">{moonState?.phaseName || 'Crescente Gibosa'}</h3>
            <p className="text-xs text-slate-400">
              Distância da Planície: <span className="text-amber-300 font-mono font-semibold">{settings.moonDistanceKm.toLocaleString()} km</span> • Ciclo Lunar: 29.53 dias
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              selectAstro('moon');
              setActiveTab('system');
            }}
            className="flex-1 md:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            Selecionar Lua no 3D
          </button>
          <button
            onClick={() => {
              selectAstro('moon');
              followAstro(followAstroId === 'moon' ? null : 'moon');
              setActiveTab('system');
            }}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              followAstroId === 'moon' ? 'bg-amber-500 text-slate-950' : 'bg-sky-600 hover:bg-sky-500 text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{followAstroId === 'moon' ? 'Rastreando Lua' : 'Acompanhar Lua'}</span>
          </button>
        </div>
      </div>

      {/* Grid of all celestial bodies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
        {astros.map((astro) => {
          const st = positions[astro.id];
          const isSelected = selectedAstroId === astro.id;
          const isFollowing = followAstroId === astro.id;

          return (
            <div
              key={astro.id}
              className={`rounded-2xl border p-4 flex flex-col justify-between transition ${
                isSelected
                  ? 'bg-sky-950/40 border-sky-400 shadow-xl shadow-sky-950/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-950 shadow-md border border-slate-700"
                      style={{ backgroundColor: astro.color }}
                    >
                      {astro.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{astro.name}</h3>
                      <span className="text-[10px] text-sky-400 font-mono">
                        Camada {astro.altitudeLevel} • Nível Celeste
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold font-mono text-amber-300 px-2 py-1 bg-slate-950 rounded-lg border border-slate-800">
                    {astro.distanceKm.toLocaleString()} km
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">{astro.description}</p>

                {/* Properties grid with Astrological and Rotational properties */}
                <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[9px] text-slate-400 uppercase block">Volta Diária (Céu)</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1 font-mono">
                      <span>↻</span> {astro.diurnalRotationHours}h (Leste → Oeste)
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[9px] text-slate-400 uppercase block">Ciclo no Zodíaco</span>
                    <span className="font-semibold text-amber-300 font-mono truncate block" title={astro.zodiacTransitPeriod}>
                      {astro.zodiacTransitPeriod}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[9px] text-slate-400 uppercase block">Regência Astrológica</span>
                    <span className="font-semibold text-purple-300 truncate block">
                      {astro.rulingSign}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[9px] text-slate-400 uppercase block">Tempo por Signo</span>
                    <span className="font-semibold text-sky-300 truncate block">
                      {astro.timePerZodiacSign}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[9px] text-slate-400 uppercase block">Altitude Local</span>
                    <span className="font-semibold text-amber-300 font-mono">
                      {st ? `${st.altitudeDeg}°` : '--'}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[9px] text-slate-400 uppercase block">Azimute Local</span>
                    <span className="font-semibold text-sky-300 font-mono">
                      {st ? `${st.azimuthDeg}°` : '--'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    selectAstro(astro.id);
                    setActiveTab('system');
                  }}
                  className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                >
                  Selecionar no 3D
                </button>
                <button
                  onClick={() => {
                    selectAstro(astro.id);
                    followAstro(isFollowing ? null : astro.id);
                    setActiveTab('system');
                  }}
                  className={`flex items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                    isFollowing
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-sky-600 hover:bg-sky-500 text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isFollowing ? 'Acompanhando' : 'Observar'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
