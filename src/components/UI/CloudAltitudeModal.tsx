import React, { useState } from 'react';
import { X, Cloud, CloudRain, CloudLightning, Eye, Wind, Thermometer, Compass, Sparkles, Check, ChevronRight, Layers } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { CLOUD_CLASSIFICATIONS, CloudTier, CloudTypeInfo } from '../../data/cloudTypes';

export const CloudAltitudeModal: React.FC = () => {
  const {
    activeSidebarTool,
    setActiveSidebarTool,
    layers,
    toggleLayer,
    setLayer,
    setSelectedCloud,
    setCameraMode,
    settings,
    updateSettings,
  } = useSimulationStore();

  const [selectedCloudState, setSelectedCloudState] = useState<CloudTypeInfo>(
    CLOUD_CLASSIFICATIONS.find((c) => c.id === 'cumulus') || CLOUD_CLASSIFICATIONS[0]
  );
  const [activeTierFilter, setActiveTierFilter] = useState<'all' | CloudTier>('all');

  if (activeSidebarTool !== 'clouds') return null;

  const handleSelectCloud = (cloud: CloudTypeInfo) => {
    setSelectedCloudState(cloud);
    setSelectedCloud(cloud.id);
  };

  const handleClearSelection = () => {
    setSelectedCloud(null);
  };

  const filteredClouds = activeTierFilter === 'all'
    ? CLOUD_CLASSIFICATIONS
    : CLOUD_CLASSIFICATIONS.filter((c) => c.tier === activeTierFilter);

  return (
    <div
      id="modal-cloud-altitude"
      className="fixed md:absolute top-14 md:top-20 left-2 sm:left-20 right-2 sm:right-auto z-40 w-auto sm:w-[580px] lg:w-[680px] max-w-[calc(100vw-16px)] max-h-[85vh] bg-slate-950/95 backdrop-blur-2xl border border-sky-500/40 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xl shadow-black/90 flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
    >
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-100 flex items-center gap-2">
              Estratificação & Altitudes das Nuvens
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-700/50">
                0 a 14+ km
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Classificação atmosférica por andares de altitude e física de condensação
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setActiveSidebarTool(null);
            setSelectedCloud(null);
          }}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto pr-1 my-3 space-y-4 text-slate-200 divide-y divide-slate-800/60">
        
        {/* A. 3D Cloud Toggles & Quick Master Controls */}
        <div className="space-y-2.5 pb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" /> Camadas Ativas no Simulador 3D
            </span>
            <button
              onClick={() => {
                setLayer('showClouds3D', true);
                setLayer('showCloudsHigh', true);
                setLayer('showCloudsMiddle', true);
                setLayer('showCloudsLow', true);
                setLayer('showCloudsVertical', true);
                handleClearSelection();
              }}
              className="text-[11px] text-sky-400 hover:text-sky-300 font-medium"
            >
              Ativar Todas
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* High Clouds */}
            <button
              onClick={() => toggleLayer('showCloudsHigh')}
              className={`p-2.5 rounded-xl border flex flex-col text-left transition ${
                layers.showCloudsHigh && layers.showClouds3D
                  ? 'bg-sky-950/60 border-sky-500/50 text-white'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[11px] font-bold text-sky-300">Altas (High)</span>
                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${layers.showCloudsHigh ? 'bg-sky-500 text-white' : 'bg-slate-800'}`}>
                  {layers.showCloudsHigh && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400">6 - 13 km</span>
              <span className="text-[9px] text-slate-500 mt-0.5 truncate">Cirrus, Cs, Cc</span>
            </button>

            {/* Middle Clouds */}
            <button
              onClick={() => toggleLayer('showCloudsMiddle')}
              className={`p-2.5 rounded-xl border flex flex-col text-left transition ${
                layers.showCloudsMiddle && layers.showClouds3D
                  ? 'bg-slate-800/80 border-slate-500 text-white'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[11px] font-bold text-slate-300">Médias (Mid)</span>
                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${layers.showCloudsMiddle ? 'bg-sky-500 text-white' : 'bg-slate-800'}`}>
                  {layers.showCloudsMiddle && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400">2 - 7 km</span>
              <span className="text-[9px] text-slate-500 mt-0.5 truncate">Altocumulus, As, Ns</span>
            </button>

            {/* Low Clouds */}
            <button
              onClick={() => toggleLayer('showCloudsLow')}
              className={`p-2.5 rounded-xl border flex flex-col text-left transition ${
                layers.showCloudsLow && layers.showClouds3D
                  ? 'bg-cyan-950/60 border-cyan-500/50 text-white'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[11px] font-bold text-cyan-300">Baixas (Low)</span>
                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${layers.showCloudsLow ? 'bg-sky-500 text-white' : 'bg-slate-800'}`}>
                  {layers.showCloudsLow && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400">0 - 2 km</span>
              <span className="text-[9px] text-slate-500 mt-0.5 truncate">Cumulus, Sc, Stratus</span>
            </button>

            {/* Cumulonimbus */}
            <button
              onClick={() => toggleLayer('showCloudsVertical')}
              className={`p-2.5 rounded-xl border flex flex-col text-left transition ${
                layers.showCloudsVertical && layers.showClouds3D
                  ? 'bg-amber-950/60 border-amber-500/50 text-white'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[11px] font-bold text-amber-300">Vertical</span>
                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${layers.showCloudsVertical ? 'bg-amber-500 text-white' : 'bg-slate-800'}`}>
                  {layers.showCloudsVertical && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400">0.5 - 14+ km</span>
              <span className="text-[9px] text-slate-500 mt-0.5 truncate">Cumulonimbus</span>
            </button>
          </div>
        </div>

        {/* B. Simulação Satelital: Nuvens 90% Menores, Densidade +90% e Setas Oceânicas */}
        <div className="pt-3 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-cyan-400" /> Simulação Satelital & Morfologia HD
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/50">
              Alta Densidade HD
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-gradient-to-r from-sky-950/50 via-slate-900/70 to-slate-950 border border-sky-500/30 space-y-3">
            {/* 1. Cloud Scale Slider (90% smaller by default) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Tamanho das Células de Nuvens:</span>
                <span className="font-mono text-cyan-300 font-bold text-[11px]">
                  {Math.round(((settings.cloudScale ?? 0.10) / 0.10) * 100)}% do modo HD (90% menor)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.04"
                  max="0.30"
                  step="0.01"
                  value={settings.cloudScale ?? 0.10}
                  onChange={(e) => updateSettings({ cloudScale: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <button
                  onClick={() => updateSettings({ cloudScale: 0.10 })}
                  className="px-2 py-0.5 rounded text-[10px] bg-sky-900/60 border border-sky-600/40 text-sky-200 hover:bg-sky-800 transition whitespace-nowrap"
                  title="Resetar para 90% menor padrão"
                >
                  90% menor
                </button>
              </div>
            </div>

            {/* 3. Cloud Stretch Slider (+50% esticadas por padrão) */}
            <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Alongamento das Nuvens (Estiramento):</span>
                <span className="font-mono text-amber-300 font-bold text-[11px]">
                  {Math.round((settings.cloudStretch ?? 1.5) * 100)}% ({Math.round(((settings.cloudStretch ?? 1.5) - 1.0) * 100) >= 0 ? `+${Math.round(((settings.cloudStretch ?? 1.5) - 1.0) * 100)}% mais esticadas` : `${Math.round(((settings.cloudStretch ?? 1.5) - 1.0) * 100)}%`})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.8"
                  max="2.5"
                  step="0.05"
                  value={settings.cloudStretch ?? 1.5}
                  onChange={(e) => updateSettings({ cloudStretch: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <button
                  onClick={() => updateSettings({ cloudStretch: 1.5 })}
                  className="px-2 py-0.5 rounded text-[10px] bg-amber-950/70 border border-amber-600/40 text-amber-200 hover:bg-amber-900 transition whitespace-nowrap"
                  title="Resetar para +50% esticadas"
                >
                  +50% esticadas
                </button>
              </div>
            </div>

            {/* 4. Cloud Altitude Slider (-25% mais baixa por padrão) */}
            <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Altitude Geral das Nuvens (Teto):</span>
                <span className="font-mono text-emerald-300 font-bold text-[11px]">
                  {settings.cloudAltitude.toFixed(1)} km (-25% mais baixa)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1.2"
                  max="5.5"
                  step="0.1"
                  value={settings.cloudAltitude}
                  onChange={(e) => updateSettings({ cloudAltitude: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <button
                  onClick={() => updateSettings({ cloudAltitude: 2.7 })}
                  className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/70 border border-emerald-600/40 text-emerald-200 hover:bg-emerald-900 transition whitespace-nowrap"
                  title="Resetar para 25% mais baixa (2.7 km)"
                >
                  -25% (2.7 km)
                </button>
              </div>
            </div>

            {/* 5. Cloud Whirlwind Speed Slider */}
            <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Velocidade do Redemoinho (Giro & Deriva):</span>
                <span className="font-mono text-cyan-300 font-bold text-[11px]">
                  {((settings.cloudSpeed ?? 0.45)).toFixed(2)}x (Velocidade Lenta)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.05"
                  value={settings.cloudSpeed ?? 0.45}
                  onChange={(e) => updateSettings({ cloudSpeed: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <button
                  onClick={() => updateSettings({ cloudSpeed: 0.45 })}
                  className="px-2 py-0.5 rounded text-[10px] bg-cyan-950/70 border border-cyan-600/40 text-cyan-200 hover:bg-cyan-900 transition whitespace-nowrap"
                  title="Resetar para velocidade lenta de redemoinho (0.45x)"
                >
                  Lento (0.45x)
                </button>
              </div>
            </div>

            {/* 6. Units & Cyclone Preset */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <strong className="text-slate-200">+90% Unidades:</strong> Redemoinho e formas distintas
              </span>
              <button
                onClick={() => {
                  const vortex = CLOUD_CLASSIFICATIONS.find((c) => c.id === 'marine_vortex');
                  if (vortex) {
                    handleSelectCloud(vortex);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-sky-950 border border-sky-600/50 text-sky-300 hover:bg-sky-900 hover:text-white transition font-medium flex items-center gap-1"
              >
                Inspecionar Vórtice Ciclônico (Satélite)
              </button>
            </div>
          </div>
        </div>

        {/* C. Visual Stratification Chart (Matching the exact uploaded diagram) */}
        <div className="pt-3 pb-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" /> Diagrama Visual de Estratificação
            </span>
            <span className="text-[10px] text-slate-400">Clique para inspecionar</span>
          </div>

          <div className="relative border border-sky-900/40 rounded-2xl bg-gradient-to-b from-sky-950/40 via-slate-900/60 to-slate-950 p-3 space-y-2 overflow-hidden shadow-inner">
            
            {/* 1. High Tier Bar */}
            <div className="relative border-b border-sky-500/30 pb-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-sky-200 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Nuvens Altas (High) • 6 a 13+ km
                </span>
                <span className="font-mono text-[10px] text-sky-400">-35°C a -60°C • Cristais de Gelo</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {CLOUD_CLASSIFICATIONS.filter((c) => c.tier === 'high').map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCloud(c)}
                    className={`px-2 py-1.5 rounded-lg text-left transition border ${
                      selectedCloudState.id === c.id
                        ? 'bg-sky-600/40 border-sky-400 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-[11px] font-bold">{c.name}</div>
                    <div className="text-[9px] text-slate-400 truncate">{c.altitudeKm}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Middle Tier Bar */}
            <div className="relative border-b border-slate-700/50 pb-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-200 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Nuvens Médias (Middle) • 2 a 7 km
                </span>
                <span className="font-mono text-[10px] text-slate-400">0°C a -30°C • Mista (Gotas + Gelo)</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {CLOUD_CLASSIFICATIONS.filter((c) => c.tier === 'middle').map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCloud(c)}
                    className={`px-2 py-1.5 rounded-lg text-left transition border ${
                      selectedCloudState.id === c.id
                        ? 'bg-sky-600/40 border-sky-400 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-[11px] font-bold">{c.name}</div>
                    <div className="text-[9px] text-slate-400 truncate">{c.altitudeKm}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Low Tier Bar + Cumulonimbus Tower */}
            <div className="relative">
              <div className="flex items-center justify-between text-[11px] font-bold text-cyan-200 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Nuvens Baixas (Low) & Torre Convectiva
                </span>
                <span className="font-mono text-[10px] text-cyan-400">+2°C a +20°C • Gotículas Líquidas</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {CLOUD_CLASSIFICATIONS.filter((c) => c.tier === 'low').map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCloud(c)}
                    className={`px-2 py-1.5 rounded-lg text-left transition border ${
                      selectedCloudState.id === c.id
                        ? 'bg-sky-600/40 border-sky-400 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-[11px] font-bold">{c.name}</div>
                    <div className="text-[9px] text-slate-400 truncate">{c.altitudeKm}</div>
                  </button>
                ))}

                {/* Cumulonimbus button */}
                {CLOUD_CLASSIFICATIONS.filter((c) => c.tier === 'vertical').map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCloud(c)}
                    className={`px-2 py-1.5 rounded-lg text-left transition border ${
                      selectedCloudState.id === c.id
                        ? 'bg-amber-600/40 border-amber-400 text-white shadow-sm'
                        : 'bg-amber-950/40 border-amber-900/60 text-amber-200 hover:bg-amber-900/60'
                    }`}
                  >
                    <div className="text-[11px] font-bold flex items-center gap-1 text-amber-300">
                      <CloudLightning className="w-3 h-3" /> Cb
                    </div>
                    <div className="text-[9px] text-amber-400/80 truncate">0.6 - 14 km</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Base Terrain Reference */}
            <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-emerald-400 border-t border-slate-800">
              <span>0 km • Superfície Terrestre & Oceanos (Geração Térmica)</span>
              <span>100% Umidade = Ponto de Orvalho</span>
            </div>
          </div>
        </div>

        {/* C. Selected Cloud Type Deep Inspection Card */}
        {selectedCloudState && (
          <div className="pt-3 pb-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white">
                  {selectedCloudState.name}
                </span>
                <span className="text-xs font-mono text-sky-400">
                  {selectedCloudState.latinName}
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-700/50">
                {selectedCloudState.tierLabel}
              </span>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Compass className="w-3 h-3 text-sky-400" /> Altitude
                </div>
                <div className="font-bold text-sky-300 mt-0.5">{selectedCloudState.altitudeKm}</div>
                <div className="text-[9px] text-slate-500">{selectedCloudState.altitudeFeet}</div>
              </div>

              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-rose-400" /> Temperatura
                </div>
                <div className="font-bold text-slate-200 mt-0.5">{selectedCloudState.temperatureC}</div>
              </div>

              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Composição
                </div>
                <div className="font-bold text-slate-200 mt-0.5 truncate">{selectedCloudState.composition}</div>
              </div>

              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <CloudRain className="w-3 h-3 text-cyan-400" /> Precipitação
                </div>
                <div className="font-bold text-slate-200 mt-0.5 truncate">{selectedCloudState.precipitation}</div>
              </div>
            </div>

            {/* Visual Description & Formation Physics */}
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-2xl border border-slate-800/80">
              <div>
                <span className="font-bold text-slate-200">Aparência Visual: </span>
                {selectedCloudState.visualAppearance}
              </div>
              <div>
                <span className="font-bold text-amber-300">Fenômenos Ópticos: </span>
                {selectedCloudState.opticalPhenomena}
              </div>
              <div>
                <span className="font-bold text-sky-300">Física de Formação: </span>
                {selectedCloudState.formationDetails}
              </div>
            </div>
          </div>
        )}

        {/* D. Atmospheric Physics Core Principles */}
        <div className="pt-3 space-y-2 text-xs">
          <h4 className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-cyan-400" /> O que decide a altitude das nuvens?
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-sky-400 block mb-0.5">1. Nível de Condensação (NCL)</span>
              O ar quente sobe e resfria adiabaticamente (9,8°C / 1.000 m). A nuvem nasce onde a temperatura atinge o Ponto de Orvalho.
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-cyan-400 block mb-0.5">2. Umidade e Pressão</span>
              Ar muito úmido condensa em baixas altitudes (0-2 km); ar seco exige subida até altitudes muito maiores e frias.
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-amber-400 block mb-0.5">3. Núcleos de Condensação (CCN)</span>
              Micropartículas de sais marinhos e poeira servem de ancoragem para as gotículas se aglutinarem no ar.
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-rose-400 block mb-0.5">4. Correntes Convectivas</span>
              Forte aquecimento solar cria correntes verticais rápidas que geram as colossais torres de Cumulonimbus até 14 km.
            </div>
          </div>
        </div>

      </div>

      {/* 3. Footer Action Controls */}
      <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCameraMode('sky');
              setActiveSidebarTool(null);
            }}
            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-sky-950"
          >
            <Eye className="w-3.5 h-3.5" /> Visão do Solo (Modo Humano)
          </button>

          {layers.selectedCloudId && (
            <button
              onClick={handleClearSelection}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
            >
              Mostrar Todas as Nuvens
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Velocidade:</span>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.2"
            value={settings.cloudSpeed || 1.0}
            onChange={(e) => updateSettings({ cloudSpeed: parseFloat(e.target.value) })}
            className="w-20 accent-sky-400 cursor-pointer"
          />
          <span className="font-mono text-sky-300 w-8">{(settings.cloudSpeed || 1.0).toFixed(1)}x</span>
        </div>
      </div>
    </div>
  );
};
