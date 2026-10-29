import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Orbit, Globe, Cpu, Layers, Zap } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import solaLogoUrl from '../../assets/images/sola_logo_splash_1791571615625.jpg';

interface PulseRipple {
  id: number;
  x: number;
  y: number;
}

const LOADING_STEPS = [
  { id: 'webgl', label: 'Motor Gráfico 3D WebGL', icon: Cpu },
  { id: 'textures', label: 'Mapas & Relevo Satélite HD', icon: Globe },
  { id: 'orbits', label: 'Efemérides & Órbitas Planetárias', icon: Orbit },
  { id: 'atmosphere', label: 'Atmosfera & Camadas Visuais', icon: Layers },
];

const COSMIC_TIPS = [
  'Interaja com a logo SOLA para impulsionar o pulso orbital durante o carregamento.',
  'Use os seletores no topo para alternar entre o Simulador Plano e o Simulador Esférico.',
  'Ative a Visão Humana em 1ª Pessoa para observar o horizonte local, o Sol, a Lua e as constelações.',
  'Explore as 5 camadas da atmosfera de 0 a 10.000 km de altitude em tempo real.',
];

export const SolaLoadingScreen: React.FC = () => {
  const {
    isSystemLoading,
    loadingTitle,
    loadingSubtitle,
    loadingDurationMs,
    loadingRunId,
    finishSystemLoading,
  } = useSimulationStore();

  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, glareX: 50, glareY: 50 });
  const [boostCount, setBoostCount] = useState(0);
  const [ripples, setRipples] = useState<PulseRipple[]>([]);
  const [tipIndex, setTipIndex] = useState(0);

  const boostAccumulatorRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSystemLoading) {
      setIsFadingOut(false);
      return;
    }

    setProgress(4);
    setIsFadingOut(false);
    setBoostCount(0);
    boostAccumulatorRef.current = 0;
    setTipIndex((prev) => (prev + 1) % COSMIC_TIPS.length);

    const startTime = performance.now();
    const targetDuration = Math.max(650, loadingDurationMs || 1200);
    let animId: number;
    let fadeTimer: number | undefined;

    const tick = (now: number) => {
      const elapsed = now - startTime + boostAccumulatorRef.current;
      const rawRatio = Math.min(1, elapsed / targetDuration);
      // Smooth cubic ease-out curve for responsive visual feedback
      const eased = 1 - Math.pow(1 - rawRatio, 2.4);
      const currentPct = Math.min(100, Math.round(eased * 100));

      setProgress(currentPct);

      if (rawRatio < 1) {
        animId = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        setIsFadingOut(true);
        fadeTimer = window.setTimeout(() => {
          finishSystemLoading();
        }, 280);
      }
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, [isSystemLoading, loadingRunId, loadingDurationMs, finishSystemLoading]);

  if (!isSystemLoading) return null;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width; // 0 to 1
    const ny = (e.clientY - rect.top) / rect.height; // 0 to 1
    const ry = (nx - 0.5) * 16;
    const rx = (0.5 - ny) * 14;
    setTilt({
      rx,
      ry,
      glareX: nx * 100,
      glareY: ny * 100,
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0, glareX: 50, glareY: 50 });
  };

  const handleInteractiveBoost = (e: React.MouseEvent<HTMLDivElement>) => {
    boostAccumulatorRef.current += 220;
    setBoostCount((c) => c + 1);
    setTipIndex((prev) => (prev + 1) % COSMIC_TIPS.length);

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple: PulseRipple = { id: Date.now() + Math.random(), x, y };
      setRipples((prev) => [...prev.slice(-4), newRipple]);
    }
  };

  const activeStepIndex = Math.min(
    LOADING_STEPS.length - 1,
    Math.floor((progress / 100) * LOADING_STEPS.length)
  );

  return (
    <div
      id="sola-loading-screen"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl select-none overflow-hidden transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
    >
      {/* Ambient Cosmic Radial Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] sm:w-[760px] h-[380px] sm:h-[520px] rounded-full blur-[110px] opacity-45 transition-transform duration-500"
          style={{
            background:
              'radial-gradient(circle, rgba(14,165,233,0.48) 0%, rgba(245,158,11,0.28) 45%, rgba(0,0,0,0) 75%)',
            transform: `translate(-50%, -50%) scale(${1 + boostCount * 0.04})`,
          }}
        />
        {/* Rotating Orbital Ring Overlay in Background */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[580px] h-[340px] sm:h-[580px] rounded-full border border-sky-500/20 pointer-events-none"
          style={{
            transform: `translate(-50%, -50%) rotateX(68deg) rotateZ(${progress * 3.6 + boostCount * 45}deg)`,
            boxShadow: '0 0 40px rgba(56, 189, 248, 0.18)',
          }}
        >
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_14px_#38bdf8]" />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_14px_#fbbf24]" />
        </div>
      </div>

      {/* Main Interactive Container */}
      <div className="relative z-10 w-full max-w-2xl px-4 flex flex-col items-center">
        {/* Interactive 3D Logo Showcase Card */}
        <div
          ref={cardRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onClick={handleInteractiveBoost}
          title="Clique ou mova o cursor para interagir e impulsionar o carregamento"
          className="group relative w-full max-w-[540px] rounded-3xl p-1.5 cursor-pointer transition-transform duration-150 ease-out"
          style={{
            transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${
              boostCount > 0 ? 1.015 : 1
            })`,
          }}
        >
          {/* Neon Cyan Outer Frame Border matching the SOLA oval */}
          <div
            className="relative rounded-3xl overflow-hidden bg-black border-2 border-sky-400/60 shadow-[0_0_50px_rgba(14,165,233,0.45)] group-hover:border-cyan-300 transition-colors"
          >
            {/* SOLA Official Logo Image */}
            <img
              src={solaLogoUrl}
              alt="SOLA - Simulador do Sistema Solar"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-contain block select-none pointer-events-none"
            />

            {/* Dynamic Interactive Specular Glare Overlay */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-200"
              style={{
                background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(56, 189, 248, 0.24) 0%, rgba(251, 191, 36, 0.12) 28%, transparent 65%)`,
              }}
            />

            {/* Animated Scanning Light Beam across the Logo */}
            <div
              className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent -skew-x-12 pointer-events-none"
              style={{
                left: `${(progress * 1.35) % 120 - 10}%`,
                transition: 'left 80ms linear',
              }}
            />

            {/* Interactive Click Ripples */}
            {ripples.map((r) => (
              <span
                key={r.id}
                style={{ left: r.x, top: r.y }}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-cyan-300/80 bg-sky-400/15 animate-ping pointer-events-none"
              />
            ))}

            {/* Interactive Badge in top-right corner of the logo frame */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 border border-sky-400/50 text-[10px] font-semibold text-sky-200 shadow-lg backdrop-blur-md">
              <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>Toque na Logo para Impulsionar</span>
              {boostCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 font-mono">
                  +{boostCount}x
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Loading Telemetry & Interactive Progress Bar Panel */}
        <div className="w-full max-w-[540px] mt-4 bg-slate-950/90 border border-sky-500/40 rounded-2xl p-4 shadow-2xl shadow-sky-950/50 backdrop-blur-xl">
          {/* Title & Percentage Header */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
                <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase truncate">
                  {loadingTitle}
                </h2>
              </div>
              <p className="text-[11px] text-sky-300/85 truncate mt-0.5">
                {loadingSubtitle}
              </p>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <span className="text-lg sm:text-xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-200 to-amber-300">
                {progress}%
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-sky-400">
                {progress < 100 ? 'Sincronizando' : 'Pronto'}
              </span>
            </div>
          </div>

          {/* Glowing Sci-Fi Progress Bar */}
          <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700/90 p-0.5 mb-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-600 via-cyan-400 to-amber-400 transition-all duration-75 relative"
              style={{
                width: `${progress}%`,
                boxShadow: '0 0 16px rgba(56, 189, 248, 0.85)',
              }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/80 rounded-full blur-[2px]" />
            </div>
          </div>

          {/* 4 Subsystem Status Modules */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {LOADING_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isDone = idx < activeStepIndex || progress >= 100;
              const isCurrent = idx === activeStepIndex && progress < 100;

              return (
                <div
                  key={step.id}
                  onClick={handleInteractiveBoost}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-medium cursor-pointer transition ${
                    isDone
                      ? 'bg-sky-950/70 border-sky-400/60 text-sky-200'
                      : isCurrent
                      ? 'bg-amber-950/50 border-amber-400/70 text-amber-200 animate-pulse'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isDone ? 'text-cyan-400' : isCurrent ? 'text-amber-400' : 'text-slate-600'
                    }`}
                  />
                  <span className="truncate leading-tight">{step.label}</span>
                </div>
              );
            })}
          </div>

          {/* Interactive Tip Footer */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[10px] text-slate-400">
            <span className="truncate">{COSMIC_TIPS[tipIndex]}</span>
            <button
              type="button"
              onClick={() => finishSystemLoading()}
              className="shrink-0 px-2.5 py-0.5 rounded-md bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/40 text-sky-200 font-semibold transition"
            >
              Entrar Agora →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
