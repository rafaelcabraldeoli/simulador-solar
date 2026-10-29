import React, { useState } from 'react';
import { AlignJustify, Eye, X, Wind, Sparkles } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { AstroId, AtmosphereLayerId } from '../../types';
import { ATMOSPHERIC_LAYERS } from '../../data/atmosphericLayers';
import { DraggableFloatingCard } from './DraggableFloatingCard';

export const SideAltitudeOverlay: React.FC = () => {
  const {
    cameraMode,
    selectedAstroId,
    selectAstro,
    followAstro,
    followAstroId,
    settings,
    layers,
    setSelectedAtmosphereLayer,
    setActiveSidebarTool,
    setLayer,
  } = useSimulationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'astros' | 'atmosphere'>('atmosphere');

  if (cameraMode !== 'side') return null;

  if (!isOpen) {
    return (
      <button
        id="btn-reopen-side-ladder"
        onClick={() => setIsOpen(true)}
        className="absolute top-16 right-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-sky-500/50 text-sky-300 hover:text-white hover:bg-sky-950/80 shadow-xl shadow-black/80 text-xs font-semibold transition pointer-events-auto"
        title="Abrir Escala Vertical de Altitudes"
      >
        <AlignJustify className="w-3.5 h-3.5 text-sky-400" />
        <span>Escala de Altitudes</span>
      </button>
    );
  }

  const altitudeLadder = [
    { id: 'neptune', name: 'Netuno', dist: '4.498.000 km', color: '#3b82f6' },
    { id: 'uranus', name: 'Urano', dist: '2.872.000 km', color: '#38bdf8' },
    { id: 'saturn', name: 'Saturno', dist: '1.429.000 km', color: '#facc15' },
    { id: 'jupiter', name: 'Júpiter', dist: '778.000 km', color: '#fb923c' },
    { id: 'mars', name: 'Marte', dist: '225.000 km', color: '#ef4444' },
    { id: 'venus', name: 'Vênus', dist: '108.000 km', color: '#fde047' },
    { id: 'mercury', name: 'Mercúrio', dist: '58.000 km', color: '#94a3b8' },
    { id: 'moon', name: 'Lua', dist: `${settings.moonDistanceKm.toLocaleString()} km`, color: '#e2e8f0' },
    { id: 'sun', name: 'Sol', dist: `${settings.sunDistanceKm.toLocaleString()} km`, color: '#fbbf24' },
  ];

  return (
    <DraggableFloatingCard
      id="drag-side-altitude"
      dragTitle="Escala Vertical de Altitudes"
      className="absolute top-16 right-3 sm:right-4 z-30 w-[calc(100vw-24px)] sm:w-80 max-w-xs"
    >
      <div
        id="side-altitude-ladder"
        className="max-h-[calc(100vh-160px)] overflow-y-auto scrollbar-thin bg-slate-950/95 backdrop-blur-xl border border-sky-500/30 rounded-b-2xl p-4 shadow-2xl shadow-black/80"
      >
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AlignJustify className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Escala Vertical
            </h4>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 transition"
            title="Fechar escala"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab Switcher: Atmosfera vs Astros */}
        <div className="flex items-center p-0.5 my-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('atmosphere')}
            className={`flex-1 py-1 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'atmosphere'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>5 Camadas</span>
          </button>
          <button
            onClick={() => setActiveTab('astros')}
            className={`flex-1 py-1 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'astros'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Astros</span>
          </button>
        </div>

        {activeTab === 'atmosphere' ? (
          /* 5 Camadas da Atmosfera View */
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Estratificação 0 a 10.000 km</span>
              <button
                onClick={() => setActiveSidebarTool('atmosphere')}
                className="text-sky-400 hover:text-sky-200 underline text-[10px] font-semibold"
              >
                Abrir Painel Completo
              </button>
            </div>

            <div className="relative pl-6 border-l-2 border-dashed border-sky-500/40 space-y-2 my-2">
              {/* Top Ceiling: Firmamento & Abóbada Celeste */}
              <div
                onClick={() => setLayer('showSpaceBackground', !layers.showSpaceBackground)}
                className={`relative p-2 rounded-lg cursor-pointer transition ${
                  layers.showSpaceBackground !== false
                    ? 'bg-cyan-600/30 border border-cyan-400 text-white'
                    : 'bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 text-slate-300'
                }`}
              >
                <div className="absolute -left-[31px] w-2.5 h-2.5 rounded-full bg-cyan-400 border border-slate-950 shadow-sm" />
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold">✨ Abóbada & Firmamento Cósmico</span>
                  <span className="text-[10px] font-mono font-semibold text-cyan-300">
                    Cúpula Celeste
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 mt-1 line-clamp-2">
                  Firmamento de estrelas e rotação sideral no topo da cúpula celeste.
                </div>
              </div>

              {/* Top marker: Exosphere */}
              {ATMOSPHERIC_LAYERS.slice().reverse().map((layer) => {
                const isSelected = layers.selectedAtmosphereLayer === layer.id;
                return (
                  <div
                    key={layer.id}
                    onClick={() => {
                      setSelectedAtmosphereLayer(isSelected ? null : layer.id);
                      setLayer('showAtmosphere', true);
                      setLayer('showAtmosphereLayers', true);
                    }}
                    className={`relative p-2 rounded-lg cursor-pointer transition ${
                      isSelected
                        ? 'bg-sky-600/30 border border-sky-400 text-white'
                        : 'bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 text-slate-300'
                    }`}
                  >
                    {/* Tick marker on dashed line */}
                    <div
                      className="absolute -left-[31px] w-2.5 h-2.5 rounded-full border border-slate-950 shadow-sm"
                      style={{ backgroundColor: layer.colorHex }}
                    />

                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold">{layer.name}</span>
                      <span className="text-[10px] font-mono font-semibold text-amber-300">
                        {layer.altitudeLabel}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-1 italic">
                      "{layer.userDescription}"
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[9px] font-mono text-slate-500">
                      <span>{layer.tempRange}</span>
                      <span className="text-sky-400 font-sans">Clique para destacar</span>
                    </div>
                  </div>
                );
              })}

              {/* Base Ground */}
              <div className="relative pt-1">
                <div className="absolute -left-[32px] w-3 h-3 rounded-sm bg-sky-400 border border-slate-950" />
                <div className="p-1.5 bg-sky-950/60 border border-sky-800/60 rounded-lg text-center">
                  <span className="text-xs font-bold text-sky-200">
                    0 km • Planície Terrestre & Oceanos
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Astros Ladder View */
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400 my-1">
              Estratificação dos corpos celestes acima do plano:
            </p>

            <div className="relative pl-6 border-l-2 border-dashed border-sky-500/30 space-y-1.5 my-2">
              {altitudeLadder.map((item) => {
                const isSelected = selectedAstroId === item.id;
                const isFollowing = followAstroId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => selectAstro(item.id as AstroId)}
                    className={`relative flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition ${
                      isSelected
                        ? 'bg-sky-600/30 border border-sky-400 text-white'
                        : 'bg-slate-900/60 hover:bg-slate-900 border border-transparent text-slate-300'
                    }`}
                  >
                    <div
                      className="absolute -left-[31px] w-2.5 h-2.5 rounded-full border border-slate-950 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{item.name}</span>
                      {isFollowing && <Eye className="w-3 h-3 text-amber-400 animate-pulse" />}
                    </div>

                    <span className="text-[11px] font-mono text-amber-300 font-semibold">
                      {item.dist}
                    </span>
                  </div>
                );
              })}

              {/* Base Earth Level */}
              <div className="relative pt-1">
                <div className="absolute -left-[32px] w-3 h-3 rounded-sm bg-sky-400 border border-slate-950" />
                <div className="p-1.5 bg-sky-950/60 border border-sky-800/60 rounded-lg text-center">
                  <span className="text-xs font-bold text-sky-200">
                    0 km • Planície Terrestre & Oceanos
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DraggableFloatingCard>
  );
};


