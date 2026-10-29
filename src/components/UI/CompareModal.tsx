import React from 'react';
import { X, Grid2X2, Sun, Clock, Check } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';

export const CompareModal: React.FC = () => {
  const { cameraMode, setCameraMode, setDate, currentDate } = useSimulationStore();

  if (cameraMode !== 'compare') return null;

  const quadrants = [
    {
      hour: 6,
      title: '06:00 — Amanhecer / Alvorada',
      desc: 'O Sol atinge o quadrante leste, projetando o feixe sobre a Eurásia e África Oriental.',
      sunPos: 'Leste',
      bgGrad: 'from-amber-950/40 via-slate-950 to-slate-950',
      lightStyle: 'left-8 top-12 w-24 h-24 bg-amber-400/50',
    },
    {
      hour: 12,
      title: '12:00 — Zênite Solar / Meio-dia',
      desc: 'Incidência solar direta máxima sobre os meridianos centrais com menor ângulo de dispersão.',
      sunPos: 'Norte-Centro',
      bgGrad: 'from-amber-900/40 via-slate-950 to-slate-950',
      lightStyle: 'left-1/2 -translate-x-1/2 top-8 w-28 h-28 bg-amber-300/70',
    },
    {
      hour: 18,
      title: '18:00 — Entardecer / Crepúsculo',
      desc: 'O foco solar se desloca para o quadrante oeste, iluminando as Américas e o Oceano Pacífico.',
      sunPos: 'Oeste',
      bgGrad: 'from-orange-950/40 via-slate-950 to-slate-950',
      lightStyle: 'right-8 top-12 w-24 h-24 bg-orange-400/50',
    },
    {
      hour: 0,
      title: '00:00 — Meia-noite / Noite Polar',
      desc: 'O Sol transita pelo lado oposto do disco, deixando o quadrante de referência em escuridão e estrelas.',
      sunPos: 'Norte Distante',
      bgGrad: 'from-blue-950/40 via-slate-950 to-slate-950',
      lightStyle: 'bottom-4 left-1/2 -translate-x-1/2 w-20 h-20 bg-amber-500/30',
    },
  ];

  const handleApplyHour = (hour: number) => {
    const d = new Date(currentDate);
    d.setHours(hour, 0, 0, 0);
    setDate(d);
    setCameraMode('top');
  };

  return (
    <div
      id="compare-modal-overlay"
      className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-xl p-4 sm:p-8 flex flex-col pointer-events-auto overflow-y-auto"
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-600/30 border border-sky-400 text-sky-300">
            <Grid2X2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 uppercase tracking-wider">
              Comparação da Iluminação em 4 Horários Chave
            </h2>
            <p className="text-xs text-slate-400">
              Observe a evolução da mancha solar sobre o mapa planar em 06:00, 12:00, 18:00 e 00:00
            </p>
          </div>
        </div>

        <button
          onClick={() => setCameraMode('earth')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <X className="w-4 h-4" />
          <span>Fechar Comparação</span>
        </button>
      </div>

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 flex-1">
        {quadrants.map((q) => {
          const isSelected = currentDate.getHours() === q.hour;

          return (
            <div
              key={q.hour}
              onClick={() => handleApplyHour(q.hour)}
              className={`group relative rounded-2xl border p-5 flex flex-col justify-between cursor-pointer transition duration-200 overflow-hidden bg-gradient-to-b ${q.bgGrad} ${
                isSelected
                  ? 'border-amber-400 shadow-xl shadow-amber-950/50 ring-1 ring-amber-400'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>{q.title}</span>
                  </h3>
                  {isSelected && (
                    <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      Ativo
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{q.desc}</p>
              </div>

              {/* Graphic Schematic of Flat Earth with dynamic spot */}
              <div className="relative w-full h-36 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-center overflow-hidden">
                {/* Concentric grid rings */}
                <div className="w-28 h-28 rounded-full border border-dashed border-sky-800/40" />
                <div className="absolute w-20 h-20 rounded-full border border-amber-500/20" />
                <div className="absolute w-10 h-10 rounded-full border border-sky-400/30" />

                {/* Simulated Solar spotlight on the map */}
                <div className={`absolute rounded-full blur-[12px] ${q.lightStyle}`} />
                <div className="absolute w-3 h-3 rounded-full bg-amber-300 shadow-md shadow-amber-400 z-10 animate-pulse" />

                {/* Center North marker */}
                <span className="absolute text-[9px] font-bold text-sky-400 top-2">N</span>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Posição do Sol: <strong className="text-amber-300">{q.sunPos}</strong></span>
                <span className="text-sky-400 font-semibold group-hover:translate-x-0.5 transition">
                  Aplicar na Câmera Superior →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
