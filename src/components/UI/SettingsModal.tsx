import React from 'react';
import {
  X,
  Settings as SettingsIcon,
  Sliders,
  Info,
  ShieldAlert,
  RotateCcw,
  Sun,
  Moon,
  Power,
  Cloud,
  Mountain,
  Layers,
  Sparkles,
  Waves,
} from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';

export const SettingsModal: React.FC = () => {
  const {
    activeSidebarTool,
    setActiveSidebarTool,
    settings,
    updateSettings,
    toggleSunLight,
    toggleMoonLight,
    layers,
    toggleLayer,
    setLayer,
  } = useSimulationStore();

  if (activeSidebarTool !== 'settings') return null;

  const isSunLit = settings.sunLightEnabled !== false;
  const isMoonLit = settings.moonLightEnabled !== false;

  return (
    <div
      id="modal-settings"
      className="fixed md:absolute top-14 md:top-20 inset-x-2 sm:inset-x-auto sm:left-20 sm:right-auto z-40 w-auto sm:w-[450px] max-w-[calc(100vw-16px)] bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/80 animate-in fade-in duration-150 max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Ajustes do Modelo & Simulação
            </h3>
            <p className="text-[10px] text-slate-400">
              Controles de distâncias, alturas, luz e atmosfera
            </p>
          </div>
        </div>
        <button
          id="btn-close-settings-modal"
          onClick={() => setActiveSidebarTool(null)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Fechar Ajustes"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Jump Adjustment Categories */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-2 border-b border-slate-800/80">
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider shrink-0 mr-0.5">
          Outros Ajustes:
        </span>
        <button
          onClick={() => setActiveSidebarTool('clouds')}
          className="px-2.5 py-1 rounded-lg bg-sky-950/70 hover:bg-sky-900 border border-sky-600/40 text-sky-200 text-xs font-medium whitespace-nowrap flex items-center gap-1 transition"
          title="Abrir ajustes de altitude e redemoinho das nuvens"
        >
          <Cloud className="w-3 h-3 text-cyan-400" />
          <span>Nuvens & Redemoinho</span>
        </button>
        <button
          onClick={() => setActiveSidebarTool('mountains')}
          className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/40 text-emerald-200 text-xs font-medium whitespace-nowrap flex items-center gap-1 transition"
          title="Abrir relevo 3D das montanhas"
        >
          <Mountain className="w-3 h-3 text-emerald-400" />
          <span>Montanhas 3D</span>
        </button>
        <button
          onClick={() => setActiveSidebarTool('layers')}
          className="px-2.5 py-1 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-600/40 text-indigo-200 text-xs font-medium whitespace-nowrap flex items-center gap-1 transition"
          title="Abrir camadas do mapa"
        >
          <Layers className="w-3 h-3 text-indigo-400" />
          <span>Camadas</span>
        </button>
      </div>

      {/* Model Disclaimer Notice */}
      <div className="my-3 p-3 rounded-xl bg-sky-950/40 border border-sky-800/40 text-xs text-sky-200/90 leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-sky-300 block font-semibold mb-0.5">Modelo Personalizado de Simulação</strong>
          Este sistema simula a dinâmica com distâncias e alturas configuradas pelo usuário. Não substitui dados astronômicos reais, mantendo clara distinção conceitual.
        </div>
      </div>

      {/* Sliders & Parameters Section */}
      <div className="space-y-4 my-4">
        {/* 0. Sun Light State Switch */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg border ${
                isSunLit ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-red-500/20 border-red-500/40 text-red-400'
              }`}
            >
              {isSunLit ? <Sun className="w-4 h-4" /> : <Power className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">
                {isSunLit ? 'Luz Solar Ativa (Dia / Noite)' : 'Luz do Sol Apagada (Escuridão)'}
              </div>
              <div className="text-[10px] text-slate-400">
                {isSunLit ? 'O Sol ilumina a superfície terrestre' : 'Todo o plano fica 100% no escuro'}
              </div>
            </div>
          </div>
          <button
            id="btn-settings-toggle-sunlight"
            onClick={() => toggleSunLight()}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
              isSunLit
                ? 'bg-slate-900 border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950'
                : 'bg-red-900/80 border-red-500 text-red-200 hover:bg-emerald-600 hover:border-emerald-400 hover:text-white'
            }`}
          >
            {isSunLit ? 'Apagar Luz do Sol' : 'Ligar Luz do Sol'}
          </button>
        </div>

        {/* 1. Sun Distance */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Distância / Altura do Sol</span>
            <span className="text-amber-300 font-mono font-bold">
              {settings.sunDistanceKm.toLocaleString()} km
            </span>
          </div>
          <input
            id="slider-sun-distance"
            type="range"
            min="2000"
            max="12000"
            step="250"
            value={settings.sunDistanceKm}
            onChange={(e) => updateSettings({ sunDistanceKm: Number(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>2.000 km</span>
            <span className="text-amber-400">Padrão: 4.000 km</span>
            <span>12.000 km</span>
          </div>
        </div>

        {/* 2. Moon Distance */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Distância / Altura da Lua</span>
            <span className="text-slate-200 font-mono font-bold">
              {settings.moonDistanceKm.toLocaleString()} km
            </span>
          </div>
          <input
            id="slider-moon-distance"
            type="range"
            min="3000"
            max="18000"
            step="250"
            value={settings.moonDistanceKm}
            onChange={(e) => updateSettings({ moonDistanceKm: Number(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>3.000 km</span>
            <span className="text-sky-300">Padrão: 8.750 km</span>
            <span>18.000 km</span>
          </div>
        </div>

        {/* 2.1 Moon Illumination (Luar Refletido) Panel */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-lg border ${
                  isMoonLit ? 'bg-sky-500/20 border-sky-500/40 text-sky-300' : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
              >
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">
                  {isMoonLit ? 'Iluminação da Lua (Luar Ativo)' : 'Luz da Lua Desativada'}
                </div>
                <div className="text-[10px] text-slate-400">
                  A Lua reflete a luz do Sol na área por onde passa
                </div>
              </div>
            </div>
            <button
              id="btn-settings-toggle-moonlight"
              onClick={() => toggleMoonLight()}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                isMoonLit
                  ? 'bg-slate-900 border-sky-500/40 text-sky-300 hover:bg-sky-500 hover:text-slate-950'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-sky-600 hover:border-sky-400 hover:text-white'
              }`}
            >
              {isMoonLit ? 'Desligar Luar' : 'Ligar Luar'}
            </button>
          </div>

          {isMoonLit && (
            <div className="space-y-2.5 pt-1 border-t border-slate-800/80">
              {/* Moon Light Intensity */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Intensidade do Luar (Reflexo)</span>
                  <span className="text-sky-300 font-mono font-bold">
                    {(settings.moonIntensity ?? 1.0).toFixed(1)}x
                  </span>
                </div>
                <input
                  id="slider-moon-intensity"
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={settings.moonIntensity ?? 1.0}
                  onChange={(e) => updateSettings({ moonIntensity: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.1x (Muito Suave)</span>
                  <span className="text-sky-300">1.0x (Padrão)</span>
                  <span>3.0x (Intenso)</span>
                </div>
              </div>

              {/* Moon Focus Angle */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Abertura do Feixe do Luar</span>
                  <span className="text-sky-300 font-mono font-bold">
                    {settings.moonFocusAngleDeg ?? 39}°
                  </span>
                </div>
                <input
                  id="slider-moon-focus-angle"
                  type="range"
                  min="20"
                  max="85"
                  step="1"
                  value={settings.moonFocusAngleDeg ?? 39}
                  onChange={(e) => updateSettings({ moonFocusAngleDeg: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>20° (Foco Restrito)</span>
                  <span className="text-sky-300">39° (Padrão)</span>
                  <span>85° (Amplo)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Solar Focus Angle */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Abertura do Foco Solar (Feixe Cônico)</span>
            <span className="text-amber-300 font-mono font-bold">
              {settings.solarFocusAngleDeg}°
            </span>
          </div>
          <input
            id="slider-focus-angle"
            type="range"
            min="20"
            max="75"
            step="1"
            value={settings.solarFocusAngleDeg}
            onChange={(e) => updateSettings({ solarFocusAngleDeg: Number(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>20° (Foco Estreito)</span>
            <span className="text-amber-400">45° (Equilibrado)</span>
            <span>75° (Amplo)</span>
          </div>
        </div>

        {/* 4. Solar Intensity */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Intensidade Luminosa do Sol</span>
            <span className="text-amber-300 font-mono font-bold">
              {settings.solarIntensity.toFixed(1)}x
            </span>
          </div>
          <input
            id="slider-solar-intensity"
            type="range"
            min="0.5"
            max="4.0"
            step="0.1"
            value={settings.solarIntensity}
            onChange={(e) => updateSettings({ solarIntensity: Number(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* 5. 3D Clouds Altitude & Speed */}
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-sky-300 flex items-center gap-1.5">
            <span>Nuvens 3D na Atmosfera</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Altitude das Nuvens 3D</span>
              <span className="text-sky-300 font-mono font-bold">{settings.cloudAltitude.toFixed(1)} km</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="5.5"
              step="0.1"
              value={settings.cloudAltitude}
              onChange={(e) => updateSettings({ cloudAltitude: Number(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Velocidade dos Ventos / Deriva</span>
              <span className="text-sky-300 font-mono font-bold">{settings.cloudSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="3.0"
              step="0.2"
              value={settings.cloudSpeed}
              onChange={(e) => updateSettings({ cloudSpeed: Number(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>
        </div>

        {/* Teoria de Eclipses */}
        <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>🌑</span>
              <span>Teoria & Mecanismo dos Eclipses</span>
            </label>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
              {settings.eclipseTheory === 'moon_eclipses_sun' ? 'Lua Ocultadora' : 'Rahu & Ketu'}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Escolha qual teoria rege os eclipses solares e lunares na simulação:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              id="btn-theory-rahu-ketu"
              onClick={() => updateSettings({ eclipseTheory: 'rahu_ketu' })}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 ${
                settings.eclipseTheory !== 'moon_eclipses_sun'
                  ? 'bg-sky-950/70 border-sky-400 text-white shadow-md shadow-sky-950/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300">
                <span>☊ ☋</span>
                <span>Rahu & Ketu</span>
              </div>
              <span className="text-[10px] leading-tight opacity-85">
                Nódulos celestes orbitais: Rahu eclipsa o Sol (totalidade) e Ketu eclipsa a Lua (Lua de Sangue).
              </span>
            </button>

            <button
              type="button"
              id="btn-theory-moon-eclipses-sun"
              onClick={() => updateSettings({ eclipseTheory: 'moon_eclipses_sun' })}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 ${
                settings.eclipseTheory === 'moon_eclipses_sun'
                  ? 'bg-amber-950/70 border-amber-400 text-white shadow-md shadow-amber-950/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <span>🌑 ☀️</span>
                <span>Lua Eclipsa o Sol</span>
              </div>
              <span className="text-[10px] leading-tight opacity-85">
                A própria Lua transita diretamente na frente do disco solar para produzir os eclipses solares.
              </span>
            </button>
          </div>
        </div>

        {/* 4.5. Dynamic Ocean Waves & Coastal Breakers */}
        <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Waves className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  Ondas em Alto Mar & Arrebentação Costeira
                </h4>
                <p className="text-[10px] text-slate-400">
                  Agitação marítima dinâmica e arrebentação nos continentes
                </p>
              </div>
            </div>
            <button
              id="btn-toggle-ocean-waves"
              onClick={() => toggleLayer('showOceanWaves')}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                layers.showOceanWaves !== false
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-cyan-600 hover:border-cyan-400 hover:text-white'
              }`}
            >
              {layers.showOceanWaves !== false ? 'Ondas Ativas' : 'Desativado'}
            </button>
          </div>

          {layers.showOceanWaves !== false && (
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              {/* Ocean Agitation Mode Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-slate-300 font-medium">
                    Regime de Agitação do Mar:
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                    {layers.oceanAgitationMode === 'storm'
                      ? '⚡ Ressaca Contínua'
                      : layers.oceanAgitationMode === 'calm'
                      ? '🪞 Mar Calmo'
                      : '🌊 Dinâmico / Cíclico'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLayer('oceanAgitationMode', 'dynamic')}
                    className={`p-2 rounded-lg border text-left transition flex flex-col gap-0.5 ${
                      layers.oceanAgitationMode !== 'storm' && layers.oceanAgitationMode !== 'calm'
                        ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold text-cyan-300">🌊 Dinâmico</span>
                    <span className="text-[9px] leading-tight text-slate-400">
                      Tempestades periódicas no Atlântico, Pacífico e Antártida
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLayer('oceanAgitationMode', 'storm')}
                    className={`p-2 rounded-lg border text-left transition flex flex-col gap-0.5 ${
                      layers.oceanAgitationMode === 'storm'
                        ? 'bg-blue-950/70 border-blue-400 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold text-blue-300">⚡ Agitado</span>
                    <span className="text-[9px] leading-tight text-slate-400">
                      Ondas altas e carneirinhos de espuma constantes
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLayer('oceanAgitationMode', 'calm')}
                    className={`p-2 rounded-lg border text-left transition flex flex-col gap-0.5 ${
                      layers.oceanAgitationMode === 'calm'
                        ? 'bg-emerald-950/70 border-emerald-400 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold text-emerald-300">🪞 Manso</span>
                    <span className="text-[9px] leading-tight text-slate-400">
                      Águas tranquilas, brisa suave e mar espelhado
                    </span>
                  </button>
                </div>
              </div>

              {/* Wave Height / Intensity Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Altura & Força das Ondas</span>
                  <span className="text-cyan-300 font-mono font-bold">
                    {(settings.oceanWaveHeight ?? 1.0).toFixed(1)}x
                  </span>
                </div>
                <input
                  id="slider-ocean-wave-height"
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={settings.oceanWaveHeight ?? 1.0}
                  onChange={(e) => updateSettings({ oceanWaveHeight: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.2x (Suave)</span>
                  <span className="text-cyan-400">1.0x (Calibrado)</span>
                  <span>2.5x (Ondas Fortes)</span>
                </div>
              </div>

              {/* Explainer Notice */}
              <p className="text-[10px] text-slate-400 leading-relaxed bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                <span className="text-cyan-300 font-semibold">Física Marinha 3D:</span> Gera ondulações físicas em alto mar com focos móveis de vento e tempestades, além de arrebentação rítmica com cristas brancas de espuma que quebram contra a costa de todos os continentes e praias.
              </p>
            </div>
          )}
        </div>

        {/* 5. Units & Coordinate Systems */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Unidade de Distância</label>
            <select
              value={settings.distanceUnit}
              onChange={(e) => updateSettings({ distanceUnit: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
            >
              <option value="km">Quilômetros (km)</option>
              <option value="au">Unidades Astronômicas (AU)</option>
              <option value="milhas">Milhas Terrestres</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Sistema de Coordenadas</label>
            <select
              value={settings.coordinateSystem}
              onChange={(e) => updateSettings({ coordinateSystem: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
            >
              <option value="Plano (Azimutal)">Plano (Azimutal)</option>
              <option value="Equatorial">Equatorial Celeste</option>
              <option value="Eclíptico">Eclíptico</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Fuso Horário</label>
            <select
              value={settings.timeZone}
              onChange={(e) => updateSettings({ timeZone: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
            >
              <option value="UTC-03:00">UTC-03:00 (Brasília)</option>
              <option value="UTC+00:00">UTC+00:00 (GMT/Londres)</option>
              <option value="UTC-05:00">UTC-05:00 (Nova York)</option>
              <option value="UTC+09:00">UTC+09:00 (Tóquio)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Escala Visual dos Astros</label>
            <select
              value={settings.visualScale ? 'visual' : 'proportional'}
              onChange={(e) => updateSettings({ visualScale: e.target.value === 'visual' })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
            >
              <option value="visual">Escala Visual (Otimizada)</option>
              <option value="proportional">Escala Proporcional</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reset Defaults Button */}
      <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
        <button
          onClick={() =>
            updateSettings({
              sunDistanceKm: 5000,
              moonDistanceKm: 7000,
              solarFocusAngleDeg: 45,
              solarIntensity: 1.0,
              visualScale: true,
            })
          }
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Padrões</span>
        </button>

        <button
          onClick={() => setActiveSidebarTool(null)}
          className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-sky-950"
        >
          Concluído
        </button>
      </div>
    </div>
  );
};
