import React from 'react';
import {
  X,
  Wind,
  Shield,
  Plane,
  Sparkles,
  Orbit,
  Zap,
  Check,
  Eye,
  EyeOff,
  Layers,
  Thermometer,
  Compass,
  Radio,
  Sliders,
  Maximize2,
  Anchor,
} from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { ATMOSPHERIC_LAYERS, AtmosphericLayerData } from '../../data/atmosphericLayers';
import { AtmosphereLayerId } from '../../types';

export const AtmosphereModal: React.FC = () => {
  const {
    activeSidebarTool,
    setActiveSidebarTool,
    layers,
    setLayer,
    setSelectedAtmosphereLayer,
    setAtmosphereOpacity,
    setAtmosphereObjectsSpeed,
    setCameraMode,
  } = useSimulationStore();

  if (activeSidebarTool !== 'atmosphere') return null;

  const getLayerVisibility = (id: AtmosphereLayerId): boolean => {
    switch (id) {
      case 'troposphere':
        return layers.showTroposphere;
      case 'stratosphere':
        return layers.showStratosphere;
      case 'mesosphere':
        return layers.showMesosphere;
      case 'thermosphere':
        return layers.showThermosphere;
      case 'exosphere':
        return layers.showExosphere;
      default:
        return true;
    }
  };

  const toggleLayerVisibility = (id: AtmosphereLayerId) => {
    switch (id) {
      case 'troposphere':
        setLayer('showTroposphere', !layers.showTroposphere);
        break;
      case 'stratosphere':
        setLayer('showStratosphere', !layers.showStratosphere);
        break;
      case 'mesosphere':
        setLayer('showMesosphere', !layers.showMesosphere);
        break;
      case 'thermosphere':
        setLayer('showThermosphere', !layers.showThermosphere);
        break;
      case 'exosphere':
        setLayer('showExosphere', !layers.showExosphere);
        break;
    }
  };

  const handleSelectLayer = (id: AtmosphereLayerId) => {
    if (layers.selectedAtmosphereLayer === id) {
      setSelectedAtmosphereLayer(null);
    } else {
      setSelectedAtmosphereLayer(id);
      if (!getLayerVisibility(id)) {
        toggleLayerVisibility(id);
      }
    }
  };

  const handleViewInSidePerspective = () => {
    setCameraMode('side');
    setLayer('showAtmosphereLayers', true);
  };

  return (
    <div
      id="modal-atmosphere"
      className="fixed md:absolute top-14 md:top-20 left-2 sm:left-20 right-2 sm:right-auto z-40 w-auto sm:w-[540px] max-w-[calc(100vw-16px)] max-h-[88vh] overflow-y-auto bg-slate-950/95 backdrop-blur-2xl border border-sky-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/90 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>As 5 Camadas da Atmosfera</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                0 a 10.000 km
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Estratificação aerológica completa, fenômenos e altitude no modelo 3D
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveSidebarTool(null)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Fechar painel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Gerenciamento Visual & Limpeza da Imagem da Terra */}
      <div className="my-3.5 p-3.5 rounded-xl bg-slate-900/90 border border-sky-500/30 space-y-3.5 shadow-lg shadow-black/40">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Gerenciamento Visual no Céu
            </span>
          </div>
          <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            {layers.showAtmosphereLabels ? 'Rótulos Ativos' : 'Terra Limpa (Sem Nomes)'}
          </span>
        </div>

        {/* 1. Nomes dos Objetos no Céu (Sem Nome por padrão para não poluir a Terra) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex-1">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <span>Nomes dos Objetos no Céu</span>
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              {layers.showAtmosphereLabels
                ? 'Exibindo etiquetas de texto sobre a Terra'
                : 'Sem nomes nos objetos para não poluir a imagem da Terra'}
            </div>
          </div>

          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              onClick={() => setLayer('showAtmosphereLabels', false)}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition ${
                !layers.showAtmosphereLabels
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Ocultar nomes dos objetos para visualização limpa e realista"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Sem Nome (Padrão)</span>
            </button>
            <button
              onClick={() => setLayer('showAtmosphereLabels', true)}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition ${
                layers.showAtmosphereLabels
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Exibir rótulos e nomes dos objetos no céu"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Aparecer Nome</span>
            </button>
          </div>
        </div>

        {/* 2. Movimento dos Objetos no Céu (Fixos no Céu por padrão) */}
        <div className="pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex-1">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Anchor className="w-3.5 h-3.5 text-sky-400" />
              <span>Posição da Estação Espacial & Objetos</span>
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              {layers.atmosphereObjectsFixed
                ? 'Objetos fixos no céu (estacionários, sem rodar rápido)'
                : 'Objetos orbitando no céu com velocidade ajustável'}
            </div>
          </div>

          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              onClick={() => {
                setLayer('atmosphereObjectsFixed', true);
                setAtmosphereObjectsSpeed(0);
              }}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition ${
                layers.atmosphereObjectsFixed
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Fixar estação espacial e satélites no céu"
            >
              <Check className="w-3 h-3" />
              <span>Fixos no Céu (Padrão)</span>
            </button>
            <button
              onClick={() => {
                setLayer('atmosphereObjectsFixed', false);
                setAtmosphereObjectsSpeed(0.2);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                !layers.atmosphereObjectsFixed
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Permitir rotação suave dos objetos orbitais"
            >
              <span>Em Movimento</span>
            </button>
          </div>
        </div>

        {/* Velocidade de Órbita se em movimento */}
        {!layers.atmosphereObjectsFixed && (
          <div className="flex items-center gap-2 pt-1 px-1">
            <span className="text-[11px] text-slate-400">Velocidade orbital:</span>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={layers.atmosphereObjectsSpeed ?? 0.2}
              onChange={(e) => setAtmosphereObjectsSpeed(parseFloat(e.target.value))}
              className="flex-1 accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] font-mono text-sky-400 w-10 text-right">
              {Math.round((layers.atmosphereObjectsSpeed ?? 0.2) * 100)}%
            </span>
          </div>
        )}

        {/* Visibility Toggles */}
        <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={layers.showAtmosphereLayers}
              onChange={(e) => {
                setLayer('showAtmosphereLayers', e.target.checked);
              }}
              className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
            />
            <span className="font-semibold text-slate-200">Exibir Estratificação 3D</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={layers.showAtmosphereObjects}
              onChange={(e) => setLayer('showAtmosphereObjects', e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
            />
            <span className="text-slate-300">Modelos 3D (Avião, ISS, Meteoros, Ozônio)</span>
          </label>
        </div>

        {/* Opacity Slider & Side Camera button */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400">Opacidade:</span>
            <input
              type="range"
              min="0.15"
              max="1.0"
              step="0.05"
              value={layers.atmosphereOpacity ?? 0.85}
              onChange={(e) => setAtmosphereOpacity(parseFloat(e.target.value))}
              className="flex-1 accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] font-mono text-sky-400 w-8 text-right">
              {Math.round((layers.atmosphereOpacity ?? 0.85) * 100)}%
            </span>
          </div>

          <button
            onClick={handleViewInSidePerspective}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 text-sky-200 text-xs font-semibold transition group"
            title="Alternar para visão lateral com a régua de altitude graduada"
          >
            <Maximize2 className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
            <span>Ver em Perfil Lateral</span>
          </button>
        </div>
      </div>

      {/* Layer Cards */}
      <div className="space-y-3.5 max-h-[56vh] overflow-y-auto pr-1">
        {ATMOSPHERIC_LAYERS.map((layer: AtmosphericLayerData) => {
          const isVisible = getLayerVisibility(layer.id);
          const isSelected = layers.selectedAtmosphereLayer === layer.id;

          return (
            <div
              key={layer.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isSelected
                  ? `${layer.borderClass} bg-slate-900 shadow-lg shadow-black/60 ring-1 ring-sky-400/40`
                  : 'border-slate-800/80 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              {/* Card Header */}
              <div className="p-3 sm:p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: layer.colorHex }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white tracking-tight">
                          {layer.name}
                        </h4>
                        <span className="text-[11px] font-mono font-bold text-amber-300 px-2 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                          {layer.altitudeLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Thermometer className="w-3 h-3 text-rose-400" />
                          <span className="font-mono text-slate-300">{layer.tempRange}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Toggle & Inspect */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleSelectLayer(layer.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition ${
                        isSelected
                          ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/30'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={isSelected ? 'Desmarcar foco' : 'Destacar em 3D no modelo'}
                    >
                      <Eye className="w-3 h-3" />
                      <span>{isSelected ? 'Foco Ativo' : 'Destacar'}</span>
                    </button>

                    <button
                      onClick={() => toggleLayerVisibility(layer.id)}
                      className={`p-1.5 rounded-lg border transition ${
                        isVisible
                          ? 'bg-sky-600/30 border-sky-500/50 text-sky-300 hover:bg-sky-600/50'
                          : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                      title={isVisible ? 'Ocultar esta camada no 3D' : 'Exibir esta camada no 3D'}
                    >
                      <Check className={`w-3.5 h-3.5 stroke-[2.5] ${isVisible ? 'opacity-100' : 'opacity-20'}`} />
                    </button>
                  </div>
                </div>

                {/* User Prompt Text verbatim in highlight callout */}
                <div className="my-2.5 p-2.5 rounded-lg bg-sky-950/40 border border-sky-500/30 text-xs text-sky-100/90 leading-relaxed font-sans">
                  <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Wind className="w-3 h-3" />
                    <span>Definição & Características</span>
                  </div>
                  <p className="italic font-medium">"{layer.userDescription}"</p>
                </div>

                {/* Key Objects & Hallmarks Pills */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Fenômenos & Objetos Presentes:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {layer.keyObjects.map((obj) => (
                      <div
                        key={obj.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs group hover:border-sky-500/40 transition"
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded bg-slate-800 text-sky-400">
                            {obj.category === 'aircraft' && <Plane className="w-3 h-3" />}
                            {obj.category === 'meteor' && <Sparkles className="w-3 h-3 text-amber-400" />}
                            {obj.category === 'space' && <Orbit className="w-3 h-3 text-pink-400" />}
                            {obj.category === 'shield' && <Shield className="w-3 h-3 text-cyan-400" />}
                            {obj.category === 'phenomenon' && <Zap className="w-3 h-3 text-emerald-400" />}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200 text-xs">{obj.name}</div>
                            <div className="text-[10px] text-slate-400 leading-tight">{obj.description}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40 flex-shrink-0">
                          {obj.altitudeLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scientific footnote details */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono">
                  <div>
                    <span className="text-slate-500">Gases: </span>
                    <span className="text-slate-300">{layer.gases}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Pressão: </span>
                    <span className="text-slate-300">{layer.pressure}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Quick Controls */}
      <div className="pt-3 mt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[11px] text-slate-400 font-mono">
          5 de 5 camadas modeladas em 3D
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setLayer('showTroposphere', true);
              setLayer('showStratosphere', true);
              setLayer('showMesosphere', true);
              setLayer('showThermosphere', true);
              setLayer('showExosphere', true);
              setLayer('showAtmosphere', true);
              setLayer('showAtmosphereLayers', true);
              setLayer('showAtmosphereObjects', true);
            }}
            className="px-2.5 py-1 rounded-lg bg-sky-600/30 border border-sky-500/50 text-[11px] text-sky-300 hover:text-white hover:bg-sky-600/50 transition font-medium"
          >
            Ligar Todas as 5
          </button>
          <button
            onClick={() => {
              setSelectedAtmosphereLayer(null);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-300 hover:text-white hover:bg-slate-800 transition font-medium"
          >
            Limpar Foco
          </button>
        </div>
      </div>
    </div>
  );
};
