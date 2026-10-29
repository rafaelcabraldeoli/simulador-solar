import React from 'react';
import { Sun, Moon, Sparkles, Clock, CheckCircle, X, Power, SunMedium } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { calculateAstroPositions } from '../../utils/astronomy';
import { DraggableFloatingCard } from './DraggableFloatingCard';

export const LightingExplainer: React.FC = () => {
  const {
    currentDate,
    settings,
    setDate,
    selectAstro,
    selectedAstroId,
    updateSettings,
    toggleSunLight,
    showLightingPanel,
    setShowLightingPanel,
  } = useSimulationStore();
  const positions = calculateAstroPositions(currentDate, settings);

  const isSunLit = settings.sunLightEnabled !== false;

  const gradientSteps = [
    { pct: '100%', label: 'Iluminação Máxima', color: 'bg-amber-300', ring: 'border-amber-300' },
    { pct: '70%', label: 'Iluminação Forte', color: 'bg-amber-400', ring: 'border-amber-400' },
    { pct: '50%', label: 'Iluminação Média', color: 'bg-orange-400', ring: 'border-orange-400' },
    { pct: '30%', label: 'Iluminação Fraca', color: 'bg-amber-700', ring: 'border-amber-700' },
    { pct: '10%', label: 'Penumbra', color: 'bg-slate-600', ring: 'border-slate-500' },
    { pct: '0%', label: 'Escuridão', color: 'bg-slate-950', ring: 'border-slate-800' },
  ];

  // 4 Time presets
  const timePresets = [
    { timeStr: '06:00', hour: 6, label: 'Alvorada (Leste)', lightAngle: 'left-1/4 top-1/2' },
    { timeStr: '12:00', hour: 12, label: 'Zênite / Meio-dia', lightAngle: 'left-1/2 top-1/3' },
    { timeStr: '18:00', hour: 18, label: 'Crepúsculo (Oeste)', lightAngle: 'right-1/4 top-1/2' },
    { timeStr: '00:00', hour: 0, label: 'Meia-noite Polar', lightAngle: 'bottom-1/4 left-1/2' },
  ];

  const handleSetHour = (hour: number) => {
    const d = new Date(currentDate);
    d.setHours(hour, 0, 0, 0);
    setDate(d);
  };

  // If panel is closed, return null (the toggle button is integrated directly into the central camera toolbar)
  if (!showLightingPanel) {
    return null;
  }

  return (
    <DraggableFloatingCard
      id="drag-lighting-explainer"
      dragTitle="Iluminação do Mapa"
      className="fixed md:absolute top-14 md:top-16 left-2 sm:left-auto right-2 sm:right-3 z-30 w-auto sm:w-96 max-w-[calc(100vw-16px)]"
    >
      <div
        id="lighting-explainer-panel"
        className="flex flex-col gap-3 w-full max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 p-1"
      >
        {/* 1. HOW LIGHTING WORKS CARD */}
        <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 shadow-2xl shadow-black/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold tracking-wider text-slate-100 uppercase">
                Modo de Iluminação do Mapa
              </h3>
            </div>

            {/* Close button for the panel */}
            <button
              id="btn-close-lighting-panel"
              onClick={() => setShowLightingPanel(false)}
              title="Fechar quadro de iluminação"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 active:bg-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Sun Light On/Off Button */}
          <div className="mb-3">
            <button
              id="btn-panel-toggle-sun-light"
              onClick={() => toggleSunLight()}
              className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-between transition group shadow-md ${
                isSunLit
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-200 shadow-amber-950/40'
                  : 'bg-red-950/60 hover:bg-red-900/60 border-red-500/60 text-red-200 shadow-red-950/50 animate-pulse'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-lg border ${
                    isSunLit ? 'bg-amber-500/30 border-amber-400 text-amber-300' : 'bg-red-500/30 border-red-400 text-red-300'
                  }`}
                >
                  {isSunLit ? <Sun className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">
                    {isSunLit ? 'Luz do Sol: LIGADA' : 'Luz do Sol: APAGADA (Escuro)'}
                  </div>
                  <div className="text-[10px] text-slate-300">
                    {isSunLit ? 'Clique para apagar a luz do Sol' : 'Clique para acender a luz do Sol'}
                  </div>
                </div>
              </div>

              <span
                className={`text-[11px] font-bold px-2 py-1 rounded-lg border ${
                  isSunLit
                    ? 'bg-slate-900/80 border-amber-500/40 text-amber-300 group-hover:bg-amber-500 group-hover:text-slate-950'
                    : 'bg-red-900 border-red-400 text-white group-hover:bg-emerald-600'
                } transition`}
              >
                {isSunLit ? 'Apagar Luz' : 'Ligar Luz'}
              </span>
            </button>
          </div>

          {/* Lighting Mode Selector */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            <button
              onClick={() => updateSettings({ mapLightingMode: 'spotlight', ambientBrightness: 0.0 })}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border text-center transition ${
                settings.mapLightingMode === 'spotlight' && settings.ambientBrightness === 0.0
                  ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-sm font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              ☀️ Só Sol
            </button>
            <button
              onClick={() => updateSettings({ mapLightingMode: 'balanced', ambientBrightness: 0.35 })}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border text-center transition ${
                settings.mapLightingMode === 'balanced'
                  ? 'bg-sky-600/30 border-sky-400 text-sky-200 shadow-sm font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Equilibrado
            </button>
            <button
              onClick={() => updateSettings({ mapLightingMode: 'full_daylight', ambientBrightness: 0.9 })}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border text-center transition ${
                settings.mapLightingMode === 'full_daylight'
                  ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-sm font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Claro 100%
            </button>
          </div>

          {/* Ambient Brightness Slider */}
          <div className="mb-3 p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 text-[11px]">Iluminação de Fundo do Plano:</span>
              <span className="font-mono text-sky-400 font-bold text-xs">
                {settings.ambientBrightness === 0 ? '0% (Totalmente Apagado)' : `${Math.round(settings.ambientBrightness * 100)}%`}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={settings.ambientBrightness}
              onChange={(e) => updateSettings({ ambientBrightness: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span className="text-amber-300">0% (Só o Sol)</span>
              <span>50%</span>
              <span>100% (Claro)</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            O Sol emite luz em um <strong className="text-amber-300 font-semibold">foco cônico suave</strong>. No centro do
            foco a luz é máxima. À medida que se afasta do zênite solar, o gradiente decai progressivamente.
          </p>

          {/* Diagram Graphic of Triangular Light Projection */}
          <div className="relative w-full h-24 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col items-center justify-between p-2 overflow-hidden mb-3">
            {/* Sun icon at top */}
            <div className="flex items-center gap-1 text-amber-300 text-[11px] font-semibold z-10">
              <Sun className="w-4 h-4 animate-spin-slow text-amber-400" />
              <span>SOL ({settings.sunDistanceKm.toLocaleString()} km)</span>
            </div>

            {/* Light cone representation */}
            <div
              className="absolute top-5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-b-[60px] border-b-amber-400/20 pointer-events-none"
            />
            <div
              className="absolute top-5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[35px] border-l-transparent border-r-[35px] border-r-transparent border-b-[60px] border-b-amber-300/35 pointer-events-none"
            />

            {/* Ground Plane line */}
            <div className="w-full h-2 bg-gradient-to-r from-slate-900 via-sky-900 to-slate-900 rounded-full border-t border-sky-500/50 flex items-center justify-center relative">
              <div className="w-20 h-1.5 bg-amber-300/80 rounded-full blur-[1px]" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">PLANÍCIE TERRESTRE HD</span>
          </div>

          {/* Gradient Intensity Scale */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            {gradientSteps.map((step) => (
              <div
                key={step.pct}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-900/70 border border-slate-800/80"
              >
                <div className={`w-3 h-3 rounded-full ${step.color} border ${step.ring} shrink-0`} />
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-slate-200 text-xs">{step.pct}</span>
                  <span className="text-[9px] text-slate-400 truncate">{step.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. EXAMPLES AT DIFFERENT HOURS */}
        <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 shadow-2xl shadow-black/80">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold tracking-wider text-slate-100 uppercase flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Exemplos em Diferentes Horários</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {timePresets.map((preset) => {
              const isCurrent = currentDate.getHours() === preset.hour;
              return (
                <button
                  key={preset.timeStr}
                  id={`btn-time-preset-${preset.timeStr.replace(':', '')}`}
                  onClick={() => handleSetHour(preset.hour)}
                  className={`group relative flex flex-col items-center p-2 rounded-xl border transition text-left overflow-hidden ${
                    isCurrent
                      ? 'bg-amber-500/15 border-amber-400/80 shadow-md shadow-amber-950/40'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  {/* Mini flat earth representation with lighting blob */}
                  <div className="w-16 h-10 rounded-full bg-slate-950 border border-slate-800 relative overflow-hidden my-1 flex items-center justify-center">
                    <div className="absolute inset-0.5 rounded-full border border-sky-900/40" />
                    {/* Dynamic simulated spotlight position */}
                    {preset.hour === 6 && (
                      <div className="absolute left-1 top-2 w-7 h-7 rounded-full bg-amber-400/70 blur-[4px]" />
                    )}
                    {preset.hour === 12 && (
                      <div className="absolute left-4 top-1 w-8 h-8 rounded-full bg-amber-300/85 blur-[4px]" />
                    )}
                    {preset.hour === 18 && (
                      <div className="absolute right-1 top-2 w-7 h-7 rounded-full bg-amber-400/70 blur-[4px]" />
                    )}
                    {preset.hour === 0 && (
                      <div className="absolute bottom-1 left-4 w-6 h-6 rounded-full bg-amber-500/40 blur-[5px]" />
                    )}
                    {/* Sun dot */}
                    <div className="w-2 h-2 rounded-full bg-amber-200 z-10 shadow-sm shadow-amber-300" />
                  </div>

                  <div className="flex items-center justify-between w-full mt-1">
                    <span className="text-xs font-bold text-slate-100">{preset.timeStr}</span>
                    {isCurrent && <CheckCircle className="w-3 h-3 text-amber-400" />}
                  </div>
                  <span className="text-[9px] text-slate-400 text-center">{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. LIVE POSITION SUMMARY CARD */}
        <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 shadow-2xl shadow-black/80">
          <h3 className="text-xs font-bold tracking-wider text-slate-100 uppercase mb-2.5 flex items-center justify-between">
            <span>Informações dos Astros</span>
            <span className="text-[10px] text-sky-400 font-mono">Tempo Real</span>
          </h3>

          {/* Sun Row */}
          <div
            onClick={() => selectAstro('sun')}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition mb-1.5 ${
              selectedAstroId === 'sun' ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-slate-900/60 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-semibold text-slate-200">Sol</div>
                <div className="text-[10px] text-slate-400">{settings.sunDistanceKm.toLocaleString()} km</div>
              </div>
            </div>
            <div className="text-right text-[11px]">
              <div className="text-slate-300">Alt: <span className="text-amber-300 font-mono">{positions.sun.altitudeDeg}°</span></div>
              <div className="text-slate-400">Az: <span className="text-sky-300 font-mono">{positions.sun.azimuthDeg}°</span></div>
            </div>
          </div>

          {/* Moon Row */}
          <div
            onClick={() => selectAstro('moon')}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
              selectedAstroId === 'moon' ? 'bg-sky-500/20 border border-sky-500/40' : 'bg-slate-900/60 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-slate-200" />
              <div>
                <div className="text-xs font-semibold text-slate-200">Lua</div>
                <div className="text-[10px] text-slate-400">{settings.moonDistanceKm.toLocaleString()} km</div>
              </div>
            </div>
            <div className="text-right text-[11px]">
              <div className="text-slate-300">Alt: <span className="text-slate-200 font-mono">{positions.moon.altitudeDeg}°</span></div>
              <div className="text-slate-400">Az: <span className="text-sky-300 font-mono">{positions.moon.azimuthDeg}°</span></div>
            </div>
          </div>

          {/* Model Tag */}
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Modelo:</span>
            <span className="text-sky-400 font-medium px-2 py-0.5 bg-sky-950/60 rounded border border-sky-800/50">
              Personalizado
            </span>
          </div>
        </div>
      </div>
    </DraggableFloatingCard>
  );
};
