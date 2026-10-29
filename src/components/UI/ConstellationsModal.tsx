import React, { useState } from 'react';
import {
  Sparkles,
  Eye,
  EyeOff,
  Compass,
  Globe,
  User,
  Sliders,
  Check,
  X,
  Search,
  Filter,
  Star,
  Layers,
  ChevronRight,
  Maximize2,
  Palette,
  Sun,
  RotateCcw,
} from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { CONSTELLATIONS_CATALOG, ConstellationData } from '../../data/constellations';

export const ConstellationsModal: React.FC = () => {
  const {
    activeSidebarTool,
    setActiveSidebarTool,
    layers,
    toggleLayer,
    setLayer,
    cameraMode,
    setCameraMode,
  } = useSimulationStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (activeSidebarTool !== 'constellations') return null;

  const categories = [
    { id: 'todas', label: 'Todas', count: CONSTELLATIONS_CATALOG.length },
    { id: 'zodiaco', label: 'Zodíaco', count: CONSTELLATIONS_CATALOG.filter(c => c.category === 'zodiaco').length },
    { id: 'norte', label: 'Hemisfério Norte', count: CONSTELLATIONS_CATALOG.filter(c => c.category === 'norte').length },
    { id: 'sul', label: 'Hemisfério Sul', count: CONSTELLATIONS_CATALOG.filter(c => c.category === 'sul').length },
    { id: 'equatorial', label: 'Equatoriais', count: CONSTELLATIONS_CATALOG.filter(c => c.category === 'equatorial').length },
  ];

  const colorOptions: { id: 'cyan' | 'gold' | 'white' | 'magenta'; label: string; bgClass: string; hex: string }[] = [
    { id: 'cyan', label: 'Ciano Celeste', bgClass: 'bg-cyan-400', hex: '#38bdf8' },
    { id: 'gold', label: 'Dourado Estelar', bgClass: 'bg-amber-400', hex: '#fbbf24' },
    { id: 'white', label: 'Branco Diamante', bgClass: 'bg-slate-100', hex: '#f8fafc' },
    { id: 'magenta', label: 'Magenta Cósmico', bgClass: 'bg-pink-400', hex: '#f472b6' },
  ];

  const filteredConstellations = CONSTELLATIONS_CATALOG.filter((c) => {
    const matchesCat = selectedCategory === 'todas' || c.category === selectedCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.latinName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.brightestStar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.points.some(p => p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const isLinesActive = Boolean(layers.showConstellations) && Boolean(layers.showConstellationLines);
  const isMasterActive = Boolean(layers.showConstellations);

  const handleToggleMaster = () => {
    if (!layers.showConstellations) {
      setLayer('showConstellations', true);
      setLayer('showConstellationLines', true);
    } else {
      setLayer('showConstellations', false);
    }
  };

  const handleToggleLines = () => {
    if (!layers.showConstellations) {
      setLayer('showConstellations', true);
      setLayer('showConstellationLines', true);
    } else {
      setLayer('showConstellationLines', !layers.showConstellationLines);
    }
  };

  const handleSelectConstellation = (id: string) => {
    if (layers.selectedConstellation === id) {
      setLayer('selectedConstellation', null);
    } else {
      // Garantir que as constelações e linhas estejam ligadas ao focar em uma
      setLayer('showConstellations', true);
      setLayer('showConstellationLines', true);
      setLayer('selectedConstellation', id);
    }
  };

  return (
    <div
      id="constellations-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setActiveSidebarTool(null)}
    >
      <div
        id="constellations-modal-container"
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= MODAL HEADER ================= */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-md shadow-cyan-950/50">
              <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Constelações & Linhas no Céu
                </h2>
                <span className="px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                  {CONSTELLATIONS_CATALOG.length} Figuras Celestes
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Alterne a visualização de traçados, linhas conectoras e nomes sobre a cúpula celeste
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveSidebarTool(null)}
            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fechar Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= HERO CONTROLS: ALTERNADORES PRINCIPAIS DE LINHAS ================= */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-b border-slate-800/80 space-y-3">
          {/* Linha 1: Toggles Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            {/* Toggle 1: Constelações Gerais */}
            <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isMasterActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Constelações no Céu</div>
                  <div className="text-[10px] text-slate-400">Exibir estrelas das figuras</div>
                </div>
              </div>
              <button
                id="btn-toggle-master-constellations"
                onClick={handleToggleMaster}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isMasterActive ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isMasterActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Linhas das Constelações (SOLICITADO) */}
            <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isLinesActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Linhas & Traçados</div>
                  <div className="text-[10px] text-slate-400">Ligar linhas entre as estrelas</div>
                </div>
              </div>
              <button
                id="btn-toggle-constellation-lines"
                onClick={handleToggleLines}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isLinesActive ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isLinesActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Nomes & Rótulos */}
            <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${layers.showConstellationLabels ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Rótulos dos Nomes</div>
                  <div className="text-[10px] text-slate-400">Placas 3D com nomes</div>
                </div>
              </div>
              <button
                id="btn-toggle-constellation-labels"
                onClick={() => setLayer('showConstellationLabels', !layers.showConstellationLabels)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  layers.showConstellationLabels ? 'bg-indigo-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    layers.showConstellationLabels ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Linha 2: Personalização de Cor, Opacidade e Atalhos de Visão */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Paleta de Cores das Linhas */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                Cor das Linhas:
              </span>
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setLayer('constellationLineColor', opt.id)}
                    title={opt.label}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium transition ${
                      layers.constellationLineColor === opt.id
                        ? 'bg-slate-800 text-white border border-slate-600 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${opt.bgClass} shadow-sm`} />
                    <span className="hidden sm:inline">{opt.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Slider de Opacidade */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400">Opacidade:</span>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={layers.constellationLineOpacity ?? 0.85}
                onChange={(e) => setLayer('constellationLineOpacity', parseFloat(e.target.value))}
                className="w-20 sm:w-28 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[11px] font-mono text-cyan-300 w-8">
                {Math.round((layers.constellationLineOpacity ?? 0.85) * 100)}%
              </span>
            </div>

            {/* Atalhos Rápidos de Câmera para Ver o Céu */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 hidden md:inline">Câmera:</span>
              <button
                onClick={() => setCameraMode(cameraMode === 'sky' ? 'earth' : 'sky')}
                title="Apontar câmera diretamente para cima (Visão Zênite)"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
                  cameraMode === 'sky'
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-md shadow-cyan-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Visão do Céu (Zênite)</span>
              </button>
              <button
                onClick={() => setCameraMode(cameraMode === 'human' ? 'earth' : 'human')}
                title="Ver a partir do solo em primeira pessoa (360°)"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
                  cameraMode === 'human'
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>1ª Pessoa (Solo)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= BARRA DE FILTROS E BUSCA ================= */}
        <div className="px-4 py-2.5 bg-slate-900/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          {/* Categorias */}
          <div className="flex flex-wrap items-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* Campo de Busca & Limpar Filtro */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar constelação ou estrela..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {layers.selectedConstellation && (
              <button
                onClick={() => setLayer('selectedConstellation', null)}
                title="Desmarcar constelação isolada e mostrar todas"
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-semibold hover:bg-amber-500/30 transition shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Mostrar Todas</span>
              </button>
            )}
          </div>
        </div>

        {/* ================= LISTA DE CARDS DE CONSTELAÇÕES ================= */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[55vh] custom-scrollbar">
          {filteredConstellations.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Star className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm">Nenhuma constelação encontrada com o termo "{searchTerm}".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredConstellations.map((c) => {
                const isSelected = layers.selectedConstellation === c.id;
                const isExpanded = expandedId === c.id;

                return (
                  <div
                    key={c.id}
                    id={`constellation-card-${c.id}`}
                    className={`rounded-xl border transition-all duration-200 p-3.5 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-950/60'
                        : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Header do Card */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                              {c.name}
                              {isSelected && (
                                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                              )}
                            </h3>
                            <span className="text-xs text-slate-400 italic">({c.latinName})</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
                              {c.category === 'zodiaco'
                                ? 'Zodíaco'
                                : c.category === 'norte'
                                ? 'Boreal (Norte)'
                                : c.category === 'sul'
                                ? 'Austral (Sul)'
                                : 'Equatorial'}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 bg-slate-800/80">
                              {c.season}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {c.points.length} estrelas • {c.lines.length} traços
                            </span>
                          </div>
                        </div>

                        {/* Botão de Destaque no Céu */}
                        <button
                          onClick={() => handleSelectConstellation(c.id)}
                          title={isSelected ? 'Desmarcar destaque' : 'Destacar esta constelação no céu'}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 border flex items-center gap-1 ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-bold'
                              : 'bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 border-slate-700'
                          }`}
                        >
                          <Star className={`w-3 h-3 ${isSelected ? 'fill-slate-950' : ''}`} />
                          <span>{isSelected ? 'Em Destaque' : 'Destacar'}</span>
                        </button>
                      </div>

                      {/* Estrela Principal e Coordenadas */}
                      <div className="mt-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="text-slate-400">Estrela Alfa: </span>
                          <span className="text-amber-300 font-semibold">{c.brightestStar}</span>
                        </div>
                        <div className="text-slate-400 font-mono text-[10px]">
                          RA {c.labelPos.ra.toFixed(1)}h • Dec {c.labelPos.dec > 0 ? `+${c.labelPos.dec.toFixed(0)}°` : `${c.labelPos.dec.toFixed(0)}°`}
                        </div>
                      </div>

                      {/* Descrição */}
                      <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                        {c.description}
                      </p>

                      {/* Mitologia expansível */}
                      {isExpanded && (
                        <div className="mt-2 p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 animate-in fade-in duration-150">
                          <span className="font-bold text-indigo-300 block mb-0.5">Mitologia & Tradição:</span>
                          {c.mythology}
                        </div>
                      )}
                    </div>

                    {/* Rodapé do Card: Mitologia Toggle & Olhar para o Zênite */}
                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : c.id)}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-0.5"
                      >
                        <span>{isExpanded ? 'Ocultar mitologia' : 'Ver história mítica'}</span>
                        <ChevronRight className={`w-3 h-3 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      <button
                        onClick={() => {
                          handleSelectConstellation(c.id);
                          setCameraMode('sky');
                        }}
                        className="text-slate-400 hover:text-white flex items-center gap-1 font-medium transition"
                        title="Focar na constelação e apontar visão para o alto"
                      >
                        <Compass className="w-3 h-3 text-cyan-400" />
                        <span>Ver no Céu</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= MODAL FOOTER ================= */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Firmamento Sideral Ativo • Período 23h 56m 04s • Coordenadas Equatoriais & Azimutais
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setLayer('showConstellations', true);
                setLayer('showConstellationLines', true);
                setLayer('showConstellationLabels', true);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
            >
              Ativar Todas as Linhas
            </button>
            <button
              onClick={() => setActiveSidebarTool(null)}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-md shadow-cyan-950"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
