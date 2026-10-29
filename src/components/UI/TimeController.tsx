import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Clock,
  Calendar,
  FastForward,
  Rewind,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';

export const TimeController: React.FC = () => {
  const {
    currentDate,
    isPlaying,
    playbackSpeed,
    togglePlay,
    setSpeed,
    setDate,
    addTime,
    resetToNow,
  } = useSimulationStore();

  const [isMobileCompact, setIsMobileCompact] = useState(false);

  // Speed presets
  const speedPresets = [
    { label: '1x', val: 1 },
    { label: '10x', val: 10 },
    { label: '100x', val: 100 },
    { label: '1.000x', val: 1000 },
    { label: '2.000x', val: 2000 },
    { label: '1 dia/s', val: 86400 },
    { label: '1 mês/s', val: 2592000 },
    { label: '1 ano/s', val: 31536000 },
  ];

  // Format date parts
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');
  const timeFormatted = `${hours}:${minutes}:${seconds}`;

  const day = String(currentDate.getDate()).padStart(2, '0');
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const year = currentDate.getFullYear();
  const dateFormatted = `${day} / ${month} / ${year}`;

  const weekdayNames = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];
  const weekday = weekdayNames[currentDate.getDay()];

  // Timeline year calculation (1900 to 2200 range)
  const currentEpochYear = currentDate.getFullYear() + currentDate.getMonth() / 12;

  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valYear = parseFloat(e.target.value);
    const wholeYear = Math.floor(valYear);
    const fractionMonth = Math.floor((valYear - wholeYear) * 12);
    const newD = new Date(currentDate);
    newD.setFullYear(wholeYear, fractionMonth, 15);
    setDate(newD);
  };

  return (
    <div
      id="time-control-deck"
      className="absolute bottom-[max(0.5rem,env(safe-area-inset-bottom))] sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 z-20 bg-slate-950/95 md:bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-2xl p-2 sm:p-3 shadow-2xl shadow-black/80 pointer-events-auto transition-all duration-200"
    >
      {/* ========================================================================= */}
      {/* 1. MOBILE & TABLET LAYOUT (< lg)                                          */}
      {/* Designed to fit perfectly on any phone screen without clipping            */}
      {/* ========================================================================= */}
      <div className="flex lg:hidden flex-col gap-2 w-full">
        {/* Row 1: Quadro de Tempo Principal (Data, Hora, Dia, Botão AGORA e Modo) */}
        <div
          id="mobile-quadro-de-tempo"
          className="flex items-center justify-between gap-2 bg-slate-900/95 border border-slate-800/90 rounded-xl px-3 py-1.5 shadow-inner w-full"
        >
          {/* Relógio e Data */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-base font-mono font-bold text-slate-100 tracking-wider">
                {timeFormatted}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-300">
                {dateFormatted}
              </span>
            </div>
            <span className="text-[10px] text-sky-400 font-medium">
              {weekday}
            </span>
          </div>

          {/* Ações Rápidas: AGORA + Toggle Controles */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="btn-mobile-reset-now"
              onClick={resetToNow}
              title="Voltar para o momento atual"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-950/80 border border-sky-800/70 text-[11px] font-bold text-sky-300 hover:bg-sky-900 active:scale-95 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>AGORA</span>
            </button>

            <button
              id="btn-mobile-toggle-compact"
              onClick={() => setIsMobileCompact(!isMobileCompact)}
              title={isMobileCompact ? 'Expandir velocidade e linha do tempo' : 'Recolher detalhes'}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-750 text-[11px] font-semibold text-slate-300 hover:text-white transition active:scale-95"
            >
              <span className="text-amber-400 font-mono font-bold">
                {speedPresets.find(p => p.val === playbackSpeed)?.label || `${playbackSpeed}x`}
              </span>
              {isMobileCompact ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Row 2: Media Playback Buttons (Centrados, amplos e fáceis de tocar) */}
        <div className="flex items-center justify-between sm:justify-center gap-1.5 bg-slate-900/80 border border-slate-800/80 rounded-xl p-1 shadow-inner w-full">
          <button
            id="btn-mobile-step-back-day"
            onClick={() => addTime(-86400)}
            title="-1 dia"
            className="flex-1 sm:flex-initial flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white active:bg-slate-800 transition"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            id="btn-mobile-step-back-hour"
            onClick={() => addTime(-3600)}
            title="-1 hora"
            className="flex-1 sm:flex-initial flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white active:bg-slate-800 transition"
          >
            <Rewind className="w-4 h-4" />
          </button>

          <button
            id="btn-mobile-toggle-play"
            onClick={togglePlay}
            className={`flex-2 sm:flex-initial px-5 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition shadow-lg ${
              isPlaying
                ? 'bg-sky-600 active:bg-sky-500 text-white shadow-sky-600/30'
                : 'bg-amber-500 active:bg-amber-400 text-slate-950 shadow-amber-500/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span className="text-xs font-bold tracking-wide">PAUSAR</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span className="text-xs font-bold tracking-wide">INICIAR</span>
              </>
            )}
          </button>

          <button
            id="btn-mobile-step-fwd-hour"
            onClick={() => addTime(3600)}
            title="+1 hora"
            className="flex-1 sm:flex-initial flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white active:bg-slate-800 transition"
          >
            <FastForward className="w-4 h-4" />
          </button>

          <button
            id="btn-mobile-step-fwd-day"
            onClick={() => addTime(86400)}
            title="+1 dia"
            className="flex-1 sm:flex-initial flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white active:bg-slate-800 transition"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Row 3 & 4: Velocidades e Linha do Tempo (Visíveis por padrão, recolhíveis se desejar) */}
        {!isMobileCompact && (
          <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/80">
            {/* Speed Presets */}
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1 max-w-full overflow-x-auto scrollbar-none whitespace-nowrap">
              {speedPresets.map((preset) => {
                const active = playbackSpeed === preset.val;
                return (
                  <button
                    key={preset.label}
                    id={`btn-mobile-speed-${preset.label.replace('/', '-')}`}
                    onClick={() => setSpeed(preset.val)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
                      active
                        ? 'bg-sky-600 text-white font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Historical Timeline Slider */}
            <div className="w-full flex flex-col gap-1 px-0.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="font-semibold text-slate-300">LINHA DO TEMPO</span>
                <span className="text-amber-300 font-semibold px-2 py-0.5 bg-slate-900 rounded border border-slate-800 text-[10px]">
                  {currentDate.toLocaleDateString('pt-BR')} {timeFormatted}
                </span>
              </div>

              <input
                id="mobile-timeline-year-slider"
                type="range"
                min="1900"
                max="2200"
                step="0.05"
                value={currentEpochYear}
                onChange={handleTimelineChange}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 py-1"
              />

              <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                <span>1900</span>
                <span>1950</span>
                <span>2000</span>
                <span className="text-sky-400 font-bold">2026</span>
                <span>2050</span>
                <span>2100</span>
                <span>2200</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP LAYOUT (lg:flex)                                               */}
      {/* Sleek single horizontal row identical to reference image                   */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex items-center justify-between gap-3 xl:gap-4 w-full">
        {/* Box 1 & 2: Media Buttons + Speed Presets */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Media Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl p-1 shadow-inner">
            <button
              id="btn-step-back-day"
              onClick={() => addTime(-86400)}
              title="-1 dia"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              id="btn-step-back-hour"
              onClick={() => addTime(-3600)}
              title="-1 hora"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <Rewind className="w-4 h-4" />
            </button>

            <button
              id="btn-toggle-play"
              onClick={togglePlay}
              className={`p-2.5 rounded-xl font-bold flex items-center justify-center transition shadow-lg ${
                isPlaying
                  ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/30'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              id="btn-step-fwd-hour"
              onClick={() => addTime(3600)}
              title="+1 hora"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <FastForward className="w-4 h-4" />
            </button>

            <button
              id="btn-step-fwd-day"
              onClick={() => addTime(86400)}
              title="+1 dia"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Presets */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1 whitespace-nowrap">
            {speedPresets.map((preset) => {
              const active = playbackSpeed === preset.val;
              return (
                <button
                  key={preset.label}
                  id={`btn-speed-${preset.label.replace('/', '-')}`}
                  onClick={() => setSpeed(preset.val)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
                    active
                      ? 'bg-sky-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Box 3: QUADRO DE TEMPO (Central Display Card) */}
        <div
          id="desktop-quadro-de-tempo"
          className="flex items-center justify-center gap-4 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 text-center shadow-inner shrink-0"
        >
          <div className="text-left">
            <div className="text-xl font-mono font-bold text-slate-100 tracking-wider">
              {timeFormatted}
            </div>
            <div className="text-xs font-semibold text-slate-300 font-mono tracking-wide">
              {dateFormatted}
            </div>
            <div className="text-[11px] text-sky-400 font-medium">
              {weekday}
            </div>
          </div>

          <button
            id="btn-reset-now"
            onClick={resetToNow}
            title="Voltar para o momento atual"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-950/70 border border-sky-800/60 text-xs font-semibold text-sky-300 hover:bg-sky-900/60 hover:text-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>AGORA</span>
          </button>
        </div>

        {/* Box 4: HISTORICAL TIMELINE SLIDER (1900 - 2200) */}
        <div className="flex-1 max-w-md xl:max-w-lg flex flex-col gap-1 shrink-0">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="font-semibold text-slate-300">LINHA DO TEMPO</span>
            <span className="text-amber-300 font-semibold px-2 py-0.5 bg-slate-900 rounded border border-slate-800 text-[11px]">
              {currentDate.toLocaleDateString('pt-BR')} {timeFormatted}
            </span>
          </div>

          <input
            id="timeline-year-slider"
            type="range"
            min="1900"
            max="2200"
            step="0.05"
            value={currentEpochYear}
            onChange={handleTimelineChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 py-1"
          />

          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
            <span>1900</span>
            <span>1950</span>
            <span>2000</span>
            <span className="text-sky-400 font-bold">2026</span>
            <span>2050</span>
            <span>2100</span>
            <span>2200</span>
          </div>
        </div>
      </div>
    </div>
  );
};
