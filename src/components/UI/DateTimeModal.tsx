import React from 'react';
import { X, Calendar as CalendarIcon, Clock, Sparkles } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';

export const DateTimeModal: React.FC = () => {
  const { activeSidebarTool, setActiveSidebarTool, currentDate, setDate, addTime, resetToNow } =
    useSimulationStore();

  if (activeSidebarTool !== 'datetime') return null;

  const quickSteps = [
    { label: '- 1 hora', seconds: -3600 },
    { label: '+ 1 hora', seconds: 3600 },
    { label: '- 1 dia', seconds: -86400 },
    { label: '+ 1 dia', seconds: 86400 },
    { label: '- 1 mês', seconds: -86400 * 30 },
    { label: '+ 1 mês', seconds: 86400 * 30 },
    { label: '- 1 ano', seconds: -86400 * 365 },
    { label: '+ 1 ano', seconds: 86400 * 365 },
  ];

  const astronomicalEvents = [
    { name: 'Solstício de Junho (Trópico de Câncer)', month: 5, day: 21, hour: 12 },
    { name: 'Equinócio de Setembro (Equador)', month: 8, day: 22, hour: 12 },
    { name: 'Solstício de Dezembro (Trópico de Capricórnio)', month: 11, day: 21, hour: 12 },
    { name: 'Equinócio de Março (Equador)', month: 2, day: 20, hour: 12 },
  ];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [year, month, day] = e.target.value.split('-').map(Number);
    const d = new Date(currentDate);
    d.setFullYear(year, month - 1, day);
    setDate(d);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [h, m] = e.target.value.split(':').map(Number);
    const d = new Date(currentDate);
    d.setHours(h, m, 0, 0);
    setDate(d);
  };

  const dateInputStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(currentDate.getDate()).padStart(2, '0')}`;

  const timeInputStr = `${String(currentDate.getHours()).padStart(2, '0')}:${String(
    currentDate.getMinutes()
  ).padStart(2, '0')}`;

  return (
    <div
      id="modal-datetime"
      className="fixed md:absolute top-14 md:top-24 left-2 sm:left-20 right-2 sm:right-auto z-40 w-auto sm:w-[380px] max-w-[calc(100vw-16px)] max-h-[85vh] overflow-y-auto bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-2xl shadow-black/80 animate-in fade-in duration-150"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Controle de Data e Hora
          </h3>
        </div>
        <button
          onClick={() => setActiveSidebarTool(null)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Direct Pickers */}
      <div className="grid grid-cols-2 gap-2.5 my-3">
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Data</label>
          <input
            type="date"
            value={dateInputStr}
            onChange={handleDateChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Horário</label>
          <input
            type="time"
            value={timeInputStr}
            onChange={handleTimeChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Quick Step Buttons Grid */}
      <div className="my-3">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
          Ajuste Rápido
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {quickSteps.map((step) => (
            <button
              key={step.label}
              onClick={() => addTime(step.seconds)}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-xs text-slate-300 font-mono transition"
            >
              {step.label}
            </button>
          ))}
        </div>
      </div>

      {/* Astronomical Season Jumpers */}
      <div className="mt-3 pt-3 border-t border-slate-800">
        <span className="text-[10px] text-sky-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>Efemérides / Posição dos Trópicos</span>
        </span>
        <div className="space-y-1">
          {astronomicalEvents.map((ev) => (
            <button
              key={ev.name}
              onClick={() => {
                const d = new Date(currentDate);
                d.setMonth(ev.month, ev.day);
                d.setHours(ev.hour, 0, 0, 0);
                setDate(d);
              }}
              className="w-full text-left text-xs p-2 rounded-lg bg-slate-900/60 hover:bg-sky-950/40 border border-slate-800 hover:border-sky-800/60 text-slate-300 transition"
            >
              {ev.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
