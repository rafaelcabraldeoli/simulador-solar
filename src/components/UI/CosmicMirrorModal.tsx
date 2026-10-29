import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles, Compass, Eye, Orbit, Layers, Radio } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { COSMIC_WORLD_SPECS, CosmicDiscWorldId, CosmicWorldSpec } from '../3D/CosmicMirrorWorlds3D';
import { AstroId } from '../../types';

/**
 * High-Resolution Interactive 2D Canvas Renderer for a "Terra Extra" Fluid Disc:
 * Renders the exact visual from the user's reference photos:
 * - Outer neon pink/magenta + cyan/blue Antarctica containment barrier rings
 * - Swirling fluid atmosphere (Silver-Grey for Mercury, Pure Gold for Venus, Copper-Red over Black Water for Mars,
 *   Blue-Green for Earth, Amber-Cream for Jupiter/Saturn)
 * - Dark central polar vortex eye + illuminated continental archipelagos
 * - Internal organic Sun & Moon rotating and mixing inside the fluid atmosphere!
 */
const FluidWorldDiscCanvas: React.FC<{
  spec: CosmicWorldSpec;
  size?: number;
}> = ({ spec, size = 280 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const startTime = performance.now();

    const draw = (now: number) => {
      const t = (now - startTime) * 0.001;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxR = w * 0.44;

      ctx.clearRect(0, 0, w, h);

      // 1. Deep void background inside disc
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
      ctx.clip();

      const bgGrad = ctx.createRadialGradient(cx, cy, maxR * 0.05, cx, cy, maxR);
      if (spec.id === 'mercury') {
        bgGrad.addColorStop(0, '#05070a');
        bgGrad.addColorStop(0.22, '#1e242b');
        bgGrad.addColorStop(0.65, '#475569');
        bgGrad.addColorStop(0.92, '#1e293b');
        bgGrad.addColorStop(1, '#090d14');
      } else if (spec.id === 'venus') {
        bgGrad.addColorStop(0, '#120d02');
        bgGrad.addColorStop(0.22, '#714e06');
        bgGrad.addColorStop(0.62, '#eab308');
        bgGrad.addColorStop(0.90, '#854d0e');
        bgGrad.addColorStop(1, '#1c1204');
      } else if (spec.id === 'mars') {
        bgGrad.addColorStop(0, '#140502');
        bgGrad.addColorStop(0.22, '#5c1909');
        bgGrad.addColorStop(0.62, '#c2410c');
        bgGrad.addColorStop(0.90, '#6c1c0b');
        bgGrad.addColorStop(1, '#1a0603');
      } else if (spec.id === 'earth') {
        bgGrad.addColorStop(0, '#030b1c');
        bgGrad.addColorStop(0.22, '#074173');
        bgGrad.addColorStop(0.62, '#0284c7');
        bgGrad.addColorStop(0.90, '#065f46');
        bgGrad.addColorStop(1, '#041226');
      } else {
        bgGrad.addColorStop(0, '#170c03');
        bgGrad.addColorStop(0.22, '#78350f');
        bgGrad.addColorStop(0.62, '#d97706');
        bgGrad.addColorStop(0.90, '#92400e');
        bgGrad.addColorStop(1, '#1c0f05');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Swirling concentric fluid atmosphere currents
      const numBands = 32;
      for (let i = 0; i < numBands; i++) {
        const frac = 0.20 + (i / numBands) * 0.72;
        const rBand = maxR * frac;
        const rot = -t * (0.28 + (1.0 - frac) * 0.35) + i * 0.45;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        ctx.beginPath();
        const arcLen = Math.PI * (0.85 + 0.55 * Math.sin(i * 1.7));
        ctx.arc(0, 0, rBand, 0, arcLen);

        if (spec.id === 'mercury') {
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(226, 232, 240, 0.24)' : 'rgba(100, 116, 139, 0.28)';
        } else if (spec.id === 'venus') {
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(254, 240, 138, 0.32)' : 'rgba(202, 138, 4, 0.28)';
        } else if (spec.id === 'mars') {
          ctx.strokeStyle = i % 3 === 0 ? 'rgba(12, 8, 8, 0.52)' : i % 2 === 0 ? 'rgba(251, 146, 60, 0.30)' : 'rgba(185, 28, 28, 0.30)';
        } else if (spec.id === 'earth') {
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(240, 249, 255, 0.32)' : 'rgba(16, 185, 129, 0.26)';
        } else {
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(254, 243, 199, 0.32)' : 'rgba(217, 119, 6, 0.28)';
        }

        ctx.lineWidth = (3.5 + (i % 4) * 2.5) * (w / 280);
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();
      }

      // 3. Continental Landmasses & Archipelagos around the central vortex eye
      const continentCount = 18;
      for (let c = 0; c < continentCount; c++) {
        const cAngle = (c / continentCount) * Math.PI * 2 + 0.4;
        const cDist = maxR * (0.24 + (c % 5) * 0.065);
        const lx = cx + Math.cos(cAngle) * cDist;
        const ly = cy + Math.sin(cAngle) * cDist;
        const lSize = maxR * (0.04 + (c % 4) * 0.025);

        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(cAngle + 0.8);
        ctx.beginPath();
        ctx.ellipse(0, 0, lSize * 1.4, lSize * 0.7, 0, 0, Math.PI * 2);
        if (spec.id === 'mercury') {
          ctx.fillStyle = c % 2 === 0 ? 'rgba(203, 213, 225, 0.65)' : 'rgba(71, 85, 105, 0.75)';
        } else if (spec.id === 'venus') {
          ctx.fillStyle = c % 2 === 0 ? 'rgba(253, 224, 71, 0.70)' : 'rgba(180, 83, 9, 0.65)';
        } else if (spec.id === 'mars') {
          ctx.fillStyle = c % 2 === 0 ? 'rgba(251, 146, 60, 0.68)' : 'rgba(124, 45, 18, 0.75)';
        } else if (spec.id === 'earth') {
          ctx.fillStyle = c % 2 === 0 ? 'rgba(16, 185, 129, 0.72)' : 'rgba(5, 150, 105, 0.68)';
        } else {
          ctx.fillStyle = c % 2 === 0 ? 'rgba(253, 230, 138, 0.70)' : 'rgba(180, 83, 9, 0.68)';
        }
        ctx.fill();
        ctx.restore();
      }

      // 4. Dark Central Polar Vortex Eye
      const eyeGrad = ctx.createRadialGradient(cx, cy, 1, cx, cy, maxR * 0.21);
      eyeGrad.addColorStop(0, 'rgba(2, 4, 8, 0.98)');
      eyeGrad.addColorStop(0.65, 'rgba(5, 8, 15, 0.88)');
      eyeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = eyeGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * 0.21, 0, Math.PI * 2);
      ctx.fill();

      // 5. Internal Sun & Internal Moon rotating organically inside the fluid atmosphere
      const sunAngle = -t * 0.55 * spec.sunSpeed - 1.75;
      const sunR = maxR * spec.sunOrbitRadius;
      const sunX = cx + Math.cos(sunAngle) * sunR;
      const sunY = cy + Math.sin(sunAngle) * sunR;

      // Apply Day/Night Solar Terminator Mask (Only the side where the local Sun passes is bright; the rest is dark night!)
      ctx.save();
      ctx.globalCompositeOperation = 'source-atop';
      const nightMask = ctx.createRadialGradient(sunX, sunY, maxR * 0.12, sunX, sunY, maxR * 0.92);
      nightMask.addColorStop(0, 'rgba(0, 0, 0, 0)');
      nightMask.addColorStop(0.58, 'rgba(2, 4, 10, 0.25)');
      nightMask.addColorStop(0.85, 'rgba(2, 4, 10, 0.86)');
      nightMask.addColorStop(1, 'rgba(1, 2, 6, 0.95)');
      ctx.fillStyle = nightMask;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      const sunGlow = ctx.createRadialGradient(sunX, sunY, 1, sunX, sunY, maxR * 0.34);
      sunGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
      sunGlow.addColorStop(0.22, 'rgba(255, 250, 215, 0.92)');
      sunGlow.addColorStop(0.55, 'rgba(253, 224, 71, 0.35)');
      sunGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, maxR * 0.34, 0, Math.PI * 2);
      ctx.fill();

      // Internal Moon
      const moonAngle = sunAngle + 2.2;
      const moonR = maxR * spec.moonOrbitRadius;
      const moonX = cx + Math.cos(moonAngle) * moonR;
      const moonY = cy + Math.sin(moonAngle) * moonR;

      const moonGlow = ctx.createRadialGradient(moonX, moonY, 0.5, moonX, moonY, maxR * 0.11);
      moonGlow.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
      moonGlow.addColorStop(0.4, 'rgba(224, 242, 254, 0.70)');
      moonGlow.addColorStop(1, 'rgba(224, 242, 254, 0)');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, maxR * 0.11, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 6. Outer Antarctic Ice Wall Border Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * 1.01, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.75)';
      ctx.lineWidth = 4.2 * (w / 280);
      ctx.shadowColor = 'rgba(186, 230, 253, 0.45)';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [spec]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-full shadow-2xl bg-black border border-slate-800/80 shrink-0"
    />
  );
};

export const CosmicMirrorModal: React.FC = () => {
  const {
    activeSidebarTool,
    setActiveSidebarTool,
    layers,
    toggleLayer,
    selectAstro,
    followAstro,
    setCameraMode,
    settings,
    updateSettings,
  } = useSimulationStore();

  const [selectedWorldId, setSelectedWorldId] = useState<CosmicDiscWorldId>(
    settings.activePlanarWorld || 'venus'
  );

  if (activeSidebarTool !== 'notes') return null;

  const worldList = Object.values(COSMIC_WORLD_SPECS);
  const currentSpec = COSMIC_WORLD_SPECS[selectedWorldId];

  const handleObserveIn3D = (id: CosmicDiscWorldId) => {
    updateSettings({ activePlanarWorld: id });
    if (id === 'earth') {
      followAstro(null);
      setCameraMode('earth');
      setActiveSidebarTool(null);
    } else {
      selectAstro(id as AstroId);
      followAstro(id as AstroId);
      setCameraMode('earth');
      setActiveSidebarTool(null);
    }
  };

  const handleTravelObserverToWorld = (id: CosmicDiscWorldId) => {
    updateSettings({
      activePlanarWorld: id,
      observerLocationName:
        id === 'earth'
          ? 'São Paulo, Brasil'
          : `Superfície de ${COSMIC_WORLD_SPECS[id].name.split(' ')[0]}`,
    });
    followAstro(null);
    setCameraMode('human');
    setActiveSidebarTool(null);
    setTimeout(() => {
      // Automatically aim camera up at Earth's blurred blue-white star projection in the sky mirror when arriving on Venus/Mars!
      window.dispatchEvent(
        new CustomEvent('human-look-at-mirror-world', {
          detail: { targetWorldId: id === 'earth' ? 'venus' : 'earth' },
        })
      );
    }, 120);
  };

  const handleAnimatedOceanVoyage = (id: CosmicDiscWorldId) => {
    if (layers.showExtraLands === false) {
      toggleLayer('showExtraLands');
    }
    if (layers.showSpaceBackground === false) {
      toggleLayer('showSpaceBackground');
    }
    followAstro(null);
    selectAstro(id === 'earth' ? 'venus' : (id as AstroId));
    setCameraMode('earth');
    setActiveSidebarTool(null);
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('planar-camera-jump', {
          detail: { radius: 175, phi: 0.92, theta: 0.45 },
        })
      );
      window.dispatchEvent(
        new CustomEvent('planar-start-ocean-voyage', {
          detail: { targetWorldId: id },
        })
      );
    }, 80);
  };

  return (
    <div
      id="modal-cosmic-mirror-worlds"
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl p-3 sm:p-6 flex flex-col pointer-events-auto overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/25 to-fuchsia-500/25 border border-fuchsia-400/50 text-fuchsia-300 shadow-lg shadow-fuchsia-950/50">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-lg font-bold text-white uppercase tracking-wider">
                Cosmologia Viva de Fluidos, Espelho Primordial & Terras Extras
              </h2>
              <span className="hidden sm:inline-block text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-300">
                Teto de Vidro a 1 Trilhão de km
              </span>
            </div>
            <p className="text-xs text-slate-400">
              O Céu como o Maior Mapa Geográfico do Universo • Vitral de Atmosferas em Tempo Real
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              followAstro(null);
              setCameraMode('sky');
              setActiveSidebarTool(null);
            }}
            className="px-3 py-2 rounded-xl text-xs font-bold border bg-cyan-600/30 hover:bg-cyan-600 border-cyan-400 text-cyan-100 hover:text-white flex items-center gap-1.5 shadow-lg shadow-cyan-950/60 transition"
            title="Olhar para o Céu como Espelho/Oceano Primordial (Terra no centro como Estrela Polar + Sistemas Solares Vizinhos)"
          >
            <Orbit className="w-4 h-4" />
            <span>Visão do Céu (Espelho do Oceano Primordial)</span>
          </button>

          <button
            onClick={() => {
              followAstro(null);
              setActiveSidebarTool(null);
              window.dispatchEvent(
                new CustomEvent('planar-camera-jump', {
                  detail: { radius: 260, phi: 0.18, theta: Math.PI / 4 },
                })
              );
            }}
            className="px-3 py-2 rounded-xl text-xs font-bold border bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200 flex items-center gap-1.5 transition"
            title="Ver os discos das Terras Extras de perto"
          >
            <Eye className="w-4 h-4 text-fuchsia-400" />
            <span>Ver Terras Extras de Perto</span>
          </button>

          <button
            onClick={() => toggleLayer('showExtraLands')}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
              layers.showExtraLands
                ? 'bg-fuchsia-600 border-fuchsia-400 text-white shadow-lg shadow-fuchsia-950/60'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{layers.showExtraLands ? 'Terras Extras: ATIVAS' : 'Ativar Terras Extras'}</span>
          </button>

          <button
            onClick={() => setActiveSidebarTool(null)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <X className="w-4 h-4" />
            <span>Voltar ao Simulador 3D</span>
          </button>
        </div>
      </div>

      {/* 4 Pillars Summary Cards */}
      <div className="my-3 p-3.5 rounded-2xl bg-gradient-to-r from-sky-950/90 via-slate-900 to-fuchsia-950/80 border border-sky-400/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/50 flex items-center justify-center text-xl shrink-0">
            🚢
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>Travessia Animada pelo Oceano Escuro (Terra ➔ Antártida ➔ Outros Mundos)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/30 border border-sky-400/50 text-sky-200 font-mono">
                Rota Marítima + Atlas do Céu
              </span>
            </div>
            <p className="text-[11px] text-sky-200/90">
              Clique abaixo para navegar com a embarcação luminosa cruzando a borda de gelo da Antártida pelo oceano escuro até o sistema solar vizinho:
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end shrink-0">
          <button
            onClick={() => handleAnimatedOceanVoyage('venus')}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-950/60 transition hover:scale-105"
          >
            <span>🚢 Navegar até Vênus</span>
          </button>
          <button
            onClick={() => handleAnimatedOceanVoyage('mars')}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-950/60 transition hover:scale-105"
          >
            <span>🚢 Navegar até Marte</span>
          </button>
          <button
            onClick={() => handleAnimatedOceanVoyage(currentSpec.id === 'earth' ? 'jupiter' : currentSpec.id)}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-sky-950/60 transition hover:scale-105"
          >
            <span>
              🚢 Navegar até {currentSpec.id === 'earth' ? 'Júpiter' : currentSpec.name.split(' ')[0]}
            </span>
          </button>
          <button
            onClick={() => handleAnimatedOceanVoyage('earth')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <span>🌍 Voltar à Terra</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-2">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/30">
          <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1">
            1. Água e Óleo (Densidades)
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Sem vácuo morto: nossa atmosfera leve funciona como um &ldquo;óleo&rdquo; protetor no fundo de uma grande bolha. A borda da Antártida (anéis neon ciano/rosa) é a zona de transição magnética para cruzar rumo a outros mundos como Vênus.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-fuchsia-500/30">
          <div className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-1">
            2. O Espelho Primordial
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            A 1 trilhão de km de altura, a superfície de um oceano primordial forma um teto de vidro líquido com tensão superficial perfeita, refletindo a luz dos mundos instantaneamente em tempo real, sem atraso.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30">
          <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
            3. Terra = Estrela Polar Central
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            No teto de vidro, o reflexo do nosso próprio planeta fica fixo no ponto mais alto: nós somos a Estrela Polar. O movimento do nosso mundo faz o espelho projetar o resto da galáxia como um caleidoscópio em rotação.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/30">
          <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
            4. Vitral de Atmosferas & Luz Própria
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Estrelas e planetas são discos planos de pura luz projetados no espelho d&rsquo;água. Cada &ldquo;Terra Extra&rdquo; possui seu próprio Sol e sua própria Lua girando dentro de sua atmosfera fluida.
          </p>
        </div>
      </div>

      {/* Main Interactive Vitral Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-2 flex-1">
        {/* Left: World Selector List */}
        <div className="lg:col-span-5 flex flex-col gap-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Selecione um Mundo no Espelho Primordial:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            {worldList.map((w) => {
              const active = w.id === selectedWorldId;
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedWorldId(w.id)}
                  className={`p-3 rounded-2xl border text-left transition flex items-center justify-between gap-3 ${
                    active
                      ? 'bg-gradient-to-r from-slate-900 via-fuchsia-950/40 to-cyan-950/40 border-fuchsia-400 shadow-lg shadow-fuchsia-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full shrink-0 border-2 shadow-md"
                      style={{
                        backgroundColor: w.primaryColorHex,
                        borderColor: w.rimNeonOuterHex,
                        boxShadow: `0 0 10px ${w.rimNeonInnerHex}`,
                      }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{w.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{w.subtitle}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full shrink-0">
                    {w.id === 'earth' ? 'Centro (Polaris +90°)' : 'Mapa Celeste'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Live Fluid Disc Preview & Details */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <FluidWorldDiscCanvas spec={currentSpec} size={270} />
            <span className="text-[10px] font-mono text-fuchsia-300">
              ● Sol & Lua internos girando na atmosfera fluida + Anel Neon da Fronteira
            </span>
          </div>

          <div className="flex-1 space-y-3 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/40 text-fuchsia-300 text-[10px] font-bold uppercase tracking-wider">
              <Radio className="w-3 h-3" />
              <span>Projeção Instantânea em Tempo Real</span>
            </div>

            <h3 className="text-lg font-bold text-white">{currentSpec.name}</h3>
            <div className="text-xs font-semibold text-cyan-300">{currentSpec.atmosphereSignature}</div>

            <p className="text-xs text-slate-300 leading-relaxed">{currentSpec.description}</p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Ecossistema Interno</span>
                <span className="text-xs font-bold text-amber-300">Sol & Lua Próprios</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Fronteira Magnética</span>
                <span className="text-xs font-bold text-fuchsia-300">Anel Neon Ciano / Rosa</span>
              </div>
            </div>

            <div className="pt-3 flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleTravelObserverToWorld(currentSpec.id)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 transition"
                >
                  <Compass className="w-4 h-4" />
                  <span>
                    {currentSpec.id === 'earth'
                      ? 'Pousar na Terra (Ver Vênus no Espelho do Céu)'
                      : `Viajar para ${currentSpec.name.split(' ')[0]} (Ver a Terra como Estrela Azul no Céu)`}
                  </span>
                </button>

                <button
                  onClick={() => handleObserveIn3D(currentSpec.id)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-fuchsia-600 hover:from-cyan-500 hover:to-fuchsia-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-950/60 transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>
                    {currentSpec.id === 'earth'
                      ? 'Ver Reflexo Polar & Terra no 3D'
                      : `Inspecionar Disco de ${currentSpec.name.split(' ')[0]} e Rota no 3D`}
                  </span>
                </button>
              </div>

              <button
                onClick={() => handleAnimatedOceanVoyage(currentSpec.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-950/90 hover:bg-sky-900 border border-sky-400/50 text-sky-200 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
              >
                <Orbit className="w-4 h-4 text-sky-400" />
                <span>
                  🚢 Navegar pelo Oceano Escuro até {currentSpec.name.split(' ')[0]} (Travessia Animada entre Bordas de Gelo)
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
