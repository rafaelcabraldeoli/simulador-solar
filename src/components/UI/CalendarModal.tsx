import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Sparkles, Moon, Sun, MapPin, Compass, Clock, ArrowRight, Filter } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { ECLIPSE_CATALOG, EclipseEvent } from '../../data/eclipses';

export const CalendarModal: React.FC = () => {
  const { activeTab, setActiveTab, setDate, currentDate, updateSettings, setCameraMode, selectAstro } = useSimulationStore();
  const [eclipseFilter, setEclipseFilter] = useState<'all' | 'solar' | 'lunar' | 'future' | 'past'>('all');

  if (activeTab !== 'calendar') return null;

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handleTeleportToEclipse = (eclipse: EclipseEvent) => {
    if (!eclipse) return;

    // Pause simulation so time does not immediately advance away from the eclipse totality
    useSimulationStore.setState({ isPlaying: false });

    updateSettings({
      observerLat: eclipse.lat,
      observerLng: eclipse.lng,
      observerLocationName: `${eclipse.locationName}`,
      observerBiome: eclipse.biome || 'field',
    });
    setDate(new Date(eclipse.date.getTime()));
    setActiveTab('system');

    const store = useSimulationStore.getState();
    if (store.theoryMode === 'globe') {
      window.dispatchEvent(
        new CustomEvent('globe-set-camera-preset', {
          detail: { preset: 'human_surface' },
        })
      );
    } else {
      setCameraMode('human');
    }

    const targetAstro = eclipse.type === 'solar' ? 'sun' : 'moon';

    setTimeout(() => {
      selectAstro(targetAstro);
      window.dispatchEvent(new CustomEvent('human-look-at-astro', { detail: { astroId: targetAstro } }));
      window.dispatchEvent(new CustomEvent('globe-human-look-at-astro', { detail: { astroId: targetAstro } }));
    }, 150);

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('human-look-at-astro', { detail: { astroId: targetAstro } }));
      window.dispatchEvent(new CustomEvent('globe-human-look-at-astro', { detail: { astroId: targetAstro } }));
    }, 450);
  };

  const filteredEclipses = ECLIPSE_CATALOG.filter((e) => {
    if (eclipseFilter === 'solar') return e.type === 'solar';
    if (eclipseFilter === 'lunar') return e.type === 'lunar';
    if (eclipseFilter === 'future') return e.category === 'future';
    if (eclipseFilter === 'past') return e.category === 'past';
    return true;
  });

  const seasonalEvents = [
    {
      title: 'Equinócio de Outono (Hemisfério Sul) / Primavera (Norte)',
      dateStr: `20/03/${currentYear}`,
      desc: 'O Sol transita exatamente sobre a Linha do Equador com raio médio de 10.000 km.',
      d: new Date(currentYear, 2, 20, 12, 0),
      icon: Sun,
      color: 'text-amber-400',
    },
    {
      title: 'Solstício de Inverno (Sul) / Verão (Norte) — Trópico de Câncer',
      dateStr: `21/06/${currentYear}`,
      desc: 'O Sol atinge seu raio mais interno (~6.670 km do Polo Norte), iluminando o círculo ártico.',
      d: new Date(currentYear, 5, 21, 12, 0),
      icon: Sun,
      color: 'text-amber-300',
    },
    {
      title: 'Equinócio de Primavera (Sul) / Outono (Norte)',
      dateStr: `22/09/${currentYear}`,
      desc: 'O Sol retorna ao raio intermediário do Equador com 12 horas iguais de iluminação.',
      d: new Date(currentYear, 8, 22, 12, 0),
      icon: Sun,
      color: 'text-amber-400',
    },
    {
      title: 'Solstício de Verão (Sul) / Inverno (Norte) — Trópico de Capricórnio',
      dateStr: `21/12/${currentYear}`,
      desc: 'O Sol atinge seu raio mais externo (~13.340 km), passando mais próximo da borda da Antártica.',
      d: new Date(currentYear, 11, 21, 12, 0),
      icon: Sun,
      color: 'text-orange-400',
    },
  ];

  const moonPhasesThisMonth = [
    { name: 'Lua Nova', day: 4, pct: 0 },
    { name: 'Quarto Crescente', day: 12, pct: 50 },
    { name: 'Lua Cheia', day: 19, pct: 100 },
    { name: 'Quarto Minguante', day: 27, pct: 50 },
  ];

  return (
    <div
      id="modal-calendar-full"
      className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-xl p-4 sm:p-8 flex flex-col pointer-events-auto overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-600/30 border border-sky-400 text-sky-300">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 uppercase tracking-wider">
              Efemérides, Eclipses e Teletransporte Espaço-Temporal
            </h2>
            <p className="text-xs text-slate-400">
              Teletransporte imediato para o local exato e hora exata de eclipses solares e luas de sangue no futuro e passado
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('system')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <X className="w-4 h-4" />
          <span>Voltar ao Mapa 3D</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
        
        {/* Left 2 Cols: Eclipses Catalog with Instant Teleporter */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <span>🌑</span>
                <span>Grandes Eclipses Solares & Luas de Sangue</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Clique em <strong>"Teletransportar"</strong> para viajar instantaneamente para a latitude, longitude e horário exatos da totalidade com câmera apontada para o astro.
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setEclipseFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  eclipseFilter === 'all'
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setEclipseFilter('solar')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                  eclipseFilter === 'solar'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <span>🌑</span> Solares Totais
              </button>
              <button
                onClick={() => setEclipseFilter('lunar')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                  eclipseFilter === 'lunar'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <span>🩸</span> Luas de Sangue
              </button>
              <button
                onClick={() => setEclipseFilter('future')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  eclipseFilter === 'future'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Futuros
              </button>
              <button
                onClick={() => setEclipseFilter('past')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  eclipseFilter === 'past'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Históricos
              </button>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {filteredEclipses.map((eclipse) => {
              const isSolar = eclipse.type === 'solar';
              return (
                <div
                  key={eclipse.id}
                  className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isSolar
                      ? 'bg-gradient-to-r from-amber-950/20 via-slate-900/80 to-slate-900/80 border-amber-500/30 hover:border-amber-400'
                      : 'bg-gradient-to-r from-rose-950/20 via-slate-900/80 to-slate-900/80 border-rose-500/30 hover:border-rose-400'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-xl shrink-0 ${
                        isSolar
                          ? 'bg-amber-950/60 border-amber-500/50 shadow-md shadow-amber-950'
                          : 'bg-rose-950/60 border-rose-500/50 shadow-md shadow-rose-950'
                      }`}
                    >
                      {eclipse.flag}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                            isSolar
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {isSolar ? '🌑 Eclipse Solar Total' : '🩸 Lua de Sangue Total'}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-200 px-2 py-0.5 bg-slate-950 rounded border border-slate-800">
                          {eclipse.dateFormatted} às {eclipse.timeFormatted}
                        </span>
                        <span className="text-[11px] text-sky-400 font-mono bg-sky-950/60 border border-sky-800 px-1.5 py-0.5 rounded">
                          Duração: {eclipse.totalityDuration}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-100">{eclipse.name}</h4>

                      <div className="flex items-center gap-3 text-xs text-slate-300">
                        <span className="flex items-center gap-1 font-medium text-amber-200">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          {eclipse.locationName}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 font-mono">
                          {eclipse.lat > 0 ? `${eclipse.lat.toFixed(2)}°N` : `${Math.abs(eclipse.lat).toFixed(2)}°S`},{' '}
                          {eclipse.lng > 0 ? `${eclipse.lng.toFixed(2)}°E` : `${Math.abs(eclipse.lng).toFixed(2)}°W`}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed pt-0.5">{eclipse.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTeleportToEclipse(eclipse)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 flex items-center justify-center gap-2 shadow-lg transition duration-150 hover:scale-105 active:scale-95 ${
                      isSolar
                        ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-amber-950'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950'
                    }`}
                    title={`Teletransportar para ${eclipse.locationName} em ${eclipse.dateFormatted} ${eclipse.timeFormatted}`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>Teletransportar Agora</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Sazonal Solstices, Equinoxes & Moon Phases */}
        <div className="space-y-4">
          {/* Sazonal Solstices and Equinoxes */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Eventos Sazonais ({currentYear})</span>
            </h3>

            <div className="space-y-2.5">
              {seasonalEvents.map((ev) => (
                <div
                  key={ev.title}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-2 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <ev.icon className={`w-4 h-4 ${ev.color} shrink-0`} />
                    <div>
                      <div className="text-xs font-bold text-slate-200">{ev.title.split('—')[0]}</div>
                      <div className="text-[11px] font-mono text-amber-300">{ev.dateStr}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setDate(ev.d);
                      setActiveTab('system');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-sky-600/30 hover:bg-sky-600 border border-sky-500/50 text-sky-200 hover:text-white text-xs font-semibold shrink-0 transition"
                  >
                    Simular
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Moon Phase Highlights for Month */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Moon className="w-4 h-4 text-sky-400" />
              <span>Fases Lunares do Mês ({currentMonth + 1}/{currentYear})</span>
            </h3>

            <div className="space-y-2">
              {moonPhasesThisMonth.map((phase) => (
                <div
                  key={phase.name}
                  onClick={() => {
                    const d = new Date(currentDate);
                    d.setDate(phase.day);
                    setDate(d);
                    setActiveTab('system');
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-sky-500/40 cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-300" />
                    <span className="text-xs font-semibold text-slate-200">{phase.name}</span>
                  </div>
                  <span className="text-xs font-mono text-amber-300">
                    Dia {phase.day}/{currentMonth + 1}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800">
              Ciclo sinódico completo: <strong>29,53 dias</strong>.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

