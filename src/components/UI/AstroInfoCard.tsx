import React from 'react';
import { X, Eye, Orbit } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { calculateAstroPositions } from '../../utils/astronomy';
import { CELESTIAL_BODIES } from '../../data/celestialBodies';
import { DraggableFloatingCard } from './DraggableFloatingCard';

export const AstroInfoCard: React.FC = () => {
  const {
    currentDate,
    settings,
    selectedAstroId,
    selectAstro,
    followAstro,
    followAstroId,
    setCameraMode,
  } = useSimulationStore();

  if (!selectedAstroId) return null;

  const bodyData = CELESTIAL_BODIES[selectedAstroId];
  if (!bodyData) return null;

  const positions = calculateAstroPositions(currentDate, settings);
  const astroState = positions[selectedAstroId];
  const isFollowing = followAstroId === selectedAstroId;

  return (
    <DraggableFloatingCard
      id={`drag-astro-info-${selectedAstroId}`}
      dragTitle={`Astro: ${bodyData.name}`}
      className="absolute bottom-20 sm:bottom-32 left-2.5 sm:left-4 z-40 w-[calc(100vw-20px)] sm:w-96 max-w-sm"
    >
      <div
        id={`astro-info-card-${selectedAstroId}`}
        className="bg-slate-950/95 backdrop-blur-md border border-slate-800/90 rounded-b-2xl p-3 sm:p-4 shadow-2xl shadow-black/80 transition max-h-[calc(100vh-180px)] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg border border-slate-700/60"
              style={{ backgroundColor: bodyData.color }}
            >
              <span className="text-xs font-bold text-slate-950">
                {bodyData.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-100">{bodyData.name}</h4>
              <span className="text-xs text-sky-400 font-mono">
                Camada {bodyData.altitudeLevel} • Nível de Altitude
              </span>
            </div>
          </div>

          <button
            onClick={() => selectAstro(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grid of Astro Properties */}
        <div className="grid grid-cols-2 gap-2.5 my-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">
              Sentido de Rotação
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 font-mono">
              <span>↻</span> Horário (Leste → Oeste)
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">
              Rotação Diurna
            </span>
            <span className="text-xs font-semibold text-amber-300 font-mono">
              {bodyData.diurnalRotationHours}h por volta
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">
              Ciclo no Zodíaco
            </span>
            <span className="text-xs font-semibold text-sky-300">
              {bodyData.zodiacTransitPeriod}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">
              Regência / Domicílio
            </span>
            <span className="text-xs font-semibold text-purple-300">
              {bodyData.rulingSign}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">
              Tempo por Signo
            </span>
            <span className="text-xs font-semibold text-slate-200">
              {bodyData.timePerZodiacSign}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">
              Altitude / Azimute
            </span>
            <span className="text-xs font-semibold text-slate-200 font-mono">
              {astroState ? `${astroState.altitudeDeg}° / ${astroState.azimuthDeg}°` : '--'}
            </span>
          </div>

          {astroState?.phaseName && (
            <div className="col-span-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Fase Lunar</span>
              <span className="text-xs font-semibold text-slate-200">
                {astroState.phaseName} ({astroState.illuminatedPct}%)
              </span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-3.5 line-clamp-2">
          {bodyData.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              id="btn-follow-astro"
              onClick={() => followAstro(isFollowing ? null : selectedAstroId)}
              className={`flex-1 py-2 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition ${
                isFollowing
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30'
                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isFollowing ? 'Acompanhando' : 'Observar / Rastrear'}</span>
            </button>

            <button
              id="btn-view-side-profile"
              onClick={() => setCameraMode('side')}
              className="py-2 px-3 rounded-xl font-medium text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition"
              title="Ver perfil de altitudes na Visão Lateral"
            >
              <Orbit className="w-3.5 h-3.5 text-sky-400" />
              <span>Visão Lateral</span>
            </button>
          </div>
        </div>
      </div>
    </DraggableFloatingCard>
  );
};

