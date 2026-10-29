import React, { useState } from 'react';
import {
  Mountain,
  Layers,
  MapPin,
  Eye,
  Sliders,
  Compass,
  ArrowRight,
  Sparkles,
  Info,
  X,
  ChevronRight,
} from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import {
  WORLD_MOUNTAIN_PEAKS,
  WORLD_MOUNTAIN_RANGES,
  HYPSOMETRIC_COLOR_SCALE,
  MountainPeak,
} from '../../data/mountains';

export const MountainsModal: React.FC = () => {
  const {
    activeSidebarTool,
    setActiveSidebarTool,
    layers,
    setLayer,
    setMapColorTheme,
    setMountainDisplacementScale,
    updateSettings,
    setCameraMode,
  } = useSimulationStore();

  const [selectedContinent, setSelectedContinent] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'peaks' | 'ranges' | 'profiles' | 'legend'>('peaks');

  if (activeSidebarTool !== 'mountains') return null;

  const continents = ['Todos', 'Ásia', 'América do Sul', 'América do Norte', 'Europa', 'África', 'Brasil', 'Oceania'];

  const filteredPeaks = WORLD_MOUNTAIN_PEAKS.filter((peak) => {
    const matchesContinent =
      selectedContinent === 'Todos' ||
      (selectedContinent === 'Brasil' ? peak.country.includes('Brasil') : peak.continent.includes(selectedContinent));
    const matchesSearch =
      peak.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      peak.mountainRange.toLowerCase().includes(searchTerm.toLowerCase()) ||
      peak.country.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesContinent && matchesSearch;
  });

  const handleTeleportToMountain = (peak: MountainPeak, inFirstPerson: boolean = false) => {
    updateSettings({
      observerLat: peak.lat,
      observerLng: peak.lng,
      observerLocationName: `${peak.name} (${peak.elevationMeters}m)`,
      observerBiome: peak.biome,
    });

    if (inFirstPerson) {
      setCameraMode('human');
    } else {
      setCameraMode('earth');
    }
  };

  return (
    <div
      id="mountains-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={() => setActiveSidebarTool(null)}
    >
      <div
        id="mountains-modal-container"
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Mountain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Montanhas & Relevo Topográfico 3D
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-600/30 border border-red-500/40 text-red-300">
                  Simulador Hipsométrico
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Modelo físico das cordilheiras, planaltos e planícies globais em relevo tridimensional
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveSidebarTool(null)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fechar painel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Control Bar: 3D Relief & Color Scheme */}
        <div className="px-5 py-3.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLayer('showMountainRelief3D', !layers.showMountainRelief3D)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                layers.showMountainRelief3D
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Mountain className="w-4 h-4" />
              Relevo 3D: {layers.showMountainRelief3D ? 'Ativado' : 'Plano'}
            </button>

            <button
              onClick={() => setLayer('showMountainPeaks', !layers.showMountainPeaks)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                layers.showMountainPeaks
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Picos 3D: {layers.showMountainPeaks ? 'Visíveis' : 'Ocultos'}
            </button>
          </div>

          {/* Map Color Theme Switcher */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setMapColorTheme('satellite')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                layers.mapColorTheme === 'satellite'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🛰️ Satélite HD
            </button>
            <button
              onClick={() => setMapColorTheme('hypsometric')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
                layers.mapColorTheme === 'hypsometric'
                  ? 'bg-gradient-to-r from-emerald-600 via-yellow-500 to-red-600 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🗺️ Mapa Físico (Hipsometria)
            </button>
          </div>

          {/* Exaggeration Slider */}
          <div className="flex items-center gap-2 min-w-[170px]">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 whitespace-nowrap">Exagero:</span>
            <input
              type="range"
              min="0.4"
              max="2.5"
              step="0.1"
              value={layers.mountainDisplacementScale}
              onChange={(e) => setMountainDisplacementScale(parseFloat(e.target.value))}
              className="w-24 accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
            <span className="text-xs font-mono text-amber-400 font-bold">
              {layers.mountainDisplacementScale.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-5">
          <button
            onClick={() => setActiveTab('peaks')}
            className={`py-2.5 px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'peaks'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mountain className="w-4 h-4" />
            Picos Culminantes ({WORLD_MOUNTAIN_PEAKS.length})
          </button>
          <button
            onClick={() => setActiveTab('ranges')}
            className={`py-2.5 px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'ranges'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Grandes Cordilheiras ({WORLD_MOUNTAIN_RANGES.length})
          </button>
          <button
            onClick={() => setActiveTab('legend')}
            className={`py-2.5 px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'legend'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-4 h-4" />
            Cores do Mapa Físico (Hipsometria)
          </button>
          <button
            onClick={() => setActiveTab('profiles')}
            className={`py-2.5 px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'profiles'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            Perfis Topográficos (Cortes)
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
          {/* TAB 1: PEAKS */}
          {activeTab === 'peaks' && (
            <div className="space-y-4">
              {/* Filter bar */}
              <div className="flex flex-col sm:flex-row gap-2.5 justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {continents.map((cont) => (
                    <button
                      key={cont}
                      onClick={() => setSelectedContinent(cont)}
                      className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                        selectedContinent === cont
                          ? 'bg-amber-600 text-white font-medium'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {cont}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Buscar montanha, cordilheira ou país..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 sm:w-64"
                />
              </div>

              {/* Peaks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredPeaks.map((peak) => {
                  const isEverestOrExtreme = peak.elevationMeters >= 6000;
                  const isHigh = peak.elevationMeters >= 4000;
                  const isMedium = peak.elevationMeters >= 2000;

                  return (
                    <div
                      key={peak.id}
                      className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                              {peak.elevationMeters >= 8000 ? '👑 ' : '🏔️ '}
                              {peak.name}
                            </h3>
                            <p className="text-xs text-slate-400">
                              {peak.mountainRange} • {peak.country}
                            </p>
                          </div>
                          <div className="text-right whitespace-nowrap">
                            <span
                              className={`inline-block px-2 py-0.5 text-xs font-mono font-bold rounded-md ${
                                isEverestOrExtreme
                                  ? 'bg-white text-slate-950 shadow'
                                  : isHigh
                                  ? 'bg-red-950 text-red-200 border border-red-800/60'
                                  : isMedium
                                  ? 'bg-red-600/30 text-red-300 border border-red-500/30'
                                  : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                              }`}
                            >
                              {peak.elevationMeters.toLocaleString('pt-BR')} m
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {peak.elevationFeet.toLocaleString('en-US')} ft
                            </div>
                          </div>
                        </div>

                        <p className="mt-2 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {peak.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          {peak.lat.toFixed(2)}°, {peak.lng.toFixed(2)}°
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleTeleportToMountain(peak, false)}
                            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-amber-600 text-slate-200 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-medium"
                            title="Ver montanha na órbita 3D do plano"
                          >
                            <Eye className="w-3 h-3" />
                            Ver 3D
                          </button>
                          <button
                            onClick={() => handleTeleportToMountain(peak, true)}
                            className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center gap-1 text-[11px] font-semibold shadow-sm"
                            title="Teleportar observador para o cume em 1ª pessoa"
                          >
                            <Compass className="w-3 h-3" />
                            Cume 1ª Pessoa
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: RANGES */}
          {activeTab === 'ranges' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Grandes sistemas montanhosos e cadeias tectônicas representados no relevo tridimensional da Terra Plana:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {WORLD_MOUNTAIN_RANGES.map((range) => (
                  <div
                    key={range.id}
                    className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Mountain className="w-4 h-4 text-amber-400" />
                          {range.name}
                        </h3>
                        <p className="text-xs text-slate-400">{range.continent}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded ${range.colorClass}`}>
                        Até {range.maxElevationMeters.toLocaleString('pt-BR')} m
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-400">Extensão:</span>{' '}
                        <strong className="text-white">{range.lengthKm.toLocaleString('pt-BR')} km</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Ponto Culminante:</span>{' '}
                        <strong className="text-amber-300">{range.highestPeak}</strong>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{range.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: HYPSOMETRIC COLOR LEGEND */}
          {activeTab === 'legend' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Convenção das Cores do Mapa Físico (Topografia & Hipsometria)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Conforme a convenção cartográfica física internacional (visível no mapa-múndi fornecido), a altitude do relevo terrestre é rigorosamente codificada por faixas altimétricas cromáticas:
                </p>
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-700/60 flex items-center gap-3">
                  <span className="text-xs font-bold text-amber-300">Dica:</span>
                  <span className="text-xs text-slate-200">
                    Ative o botão <strong>"🗺️ Mapa Físico (Hipsometria)"</strong> no topo para pintar o disco 3D diretamente com essas cores exatas, ou mantenha <strong>"🛰️ Satélite HD"</strong> para o relevo fotográfico natural!
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {HYPSOMETRIC_COLOR_SCALE.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-850 border border-slate-800/80 gap-2 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg border border-slate-700/60 shrink-0 shadow-inner flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: item.colorHex }}
                      />
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                          <span>{item.range}</span>
                          <span className="text-xs text-slate-400 font-normal">({item.zone})</span>
                        </div>
                        <div className="text-xs text-amber-300/90">{item.label}</div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 sm:text-right max-w-sm">
                      <span className="text-slate-400">Exemplos:</span>{' '}
                      <span className="text-slate-200">{item.examples}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TOPOGRAPHIC CROSS-SECTION PROFILES */}
          {activeTab === 'profiles' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  Perfis Topográficos Transversais da Terra
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cortes verticais esquemáticos revelando o perfil de relevo continental e oceânico ao longo dos paralelos terrestres, idênticos aos ilustrados na base do mapa físico de referência:
                </p>
              </div>

              {/* Profile 1: Paralelo 40° N */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                    Corte no Paralelo 40° Norte (América do Norte → Europa → Ásia)
                  </h4>
                  <span className="text-xs font-mono text-slate-400">Lat 40° N</span>
                </div>

                {/* ASCII / Visual Elevation Graph */}
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto space-y-1">
                  <div className="text-amber-400 font-bold mb-1">
                    [Oceano Pacífico] ──▲ Montanhas Rochosas (4.400m) ───\ Bacia do Mississipi (140m) ─── [Oceano Atlântico] ──▲ Alpes (4.800m) ──▲ Cáucaso (5.600m) ──▲▲ Himalaia / Tibete (8.848m) ─── [Oceano Pacífico]
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Oeste (120° W)</span>
                    <span>Mississipi (90° W)</span>
                    <span>Atlântico (30° W)</span>
                    <span>Europa (10° E)</span>
                    <span>Ásia Central (80° E)</span>
                    <span>Leste (140° E)</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300">
                  Destaca o contraste entre as muralhas íngremes das Rochosas, as vastas planícies centrais norte-americanas, a bacia atlântica, as pontas glaciais dos Alpes e a colossal muralha himalaia.
                </p>
              </div>

              {/* Profile 2: Paralelo 14° S */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                    Corte no Paralelo 14° Sul (Andes → Planalto Brasileiro → África → Austrália)
                  </h4>
                  <span className="text-xs font-mono text-slate-400">Lat 14° S</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto space-y-1">
                  <div className="text-red-400 font-bold mb-1">
                    [Pacífico] ──▲▲ Andes / Altiplano (6.000m) ──\ Planalto Central Brasileiro (1.100m) ─── [Atlântico Sul] ──▲ Planalto Africano (1.500m) ─── [Índico] ─── Planalto Australiano (600m)
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Costa Peruana (77° W)</span>
                    <span>Brasília / Goiás (48° W)</span>
                    <span>Atlântico Sul (15° W)</span>
                    <span>Angola / Zâmbia (25° E)</span>
                    <span>Oceano Índico (70° E)</span>
                    <span>Austrália (130° E)</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300">
                  Mostra a ascensão vertiginosa da Cordilheira dos Andes a partir do Pacífico, a transição para o Planalto Central Brasileiro e a descida para a bacia oceânica atlântica.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Topografia calibrada em tempo real com o motor 3D
          </div>
          <button
            onClick={() => setActiveSidebarTool(null)}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};
