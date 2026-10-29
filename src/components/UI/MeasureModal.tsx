import React, { useState } from 'react';
import { X, Ruler, User, Compass, Globe } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';

export const MeasureModal: React.FC = () => {
  const { activeSidebarTool, setActiveSidebarTool } = useSimulationStore();
  const [activeTab, setActiveTab] = useState<'radial' | 'human_scale'>('human_scale');
  const [pointA, setPointA] = useState('Polo Norte Central');
  const [pointB, setPointB] = useState('Trópico de Capricórnio');

  if (activeSidebarTool !== 'measure') return null;

  const points: Record<string, { distFromCenterKm: number; desc: string }> = {
    'Polo Norte Central': { distFromCenterKm: 0, desc: 'Centro Geométrico (0 km)' },
    'Trópico de Câncer': { distFromCenterKm: 6670, desc: 'Raio de Solstício Boreal (~6.670 km)' },
    'Linha do Equador': { distFromCenterKm: 10000, desc: 'Equidistância Média (~10.000 km)' },
    'Trópico de Capricórnio': { distFromCenterKm: 13340, desc: 'Raio de Solstício Austral (~13.340 km)' },
    'Borda da Antártica (Parede de Gelo)': { distFromCenterKm: 20000, desc: 'Perímetro Polar Sul (~20.000 km)' },
    'Terras Extras (Continente Lemuria)': { distFromCenterKm: 25000, desc: 'Região Exterior Além da Borda (~25.000 km)' },
    'Borda Exterior do Firmamento': { distFromCenterKm: 30000, desc: 'Limite Máximo da Cúpula (~30.000 km)' },
  };

  const distKm = Math.abs(points[pointA].distFromCenterKm - points[pointB].distFromCenterKm);

  return (
    <div
      id="modal-measure"
      className="fixed md:absolute top-14 md:top-20 left-2 sm:left-20 right-2 sm:right-auto z-40 w-auto sm:w-[420px] max-w-[calc(100vw-16px)] max-h-[85vh] overflow-y-auto bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-2xl shadow-black/80 animate-in fade-in duration-150"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
            <Ruler className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Régua e Escala de Medidas
          </h3>
        </div>
        <button
          onClick={() => setActiveSidebarTool(null)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 mt-3 mb-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('human_scale')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'human_scale'
              ? 'bg-sky-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Escala Humana & Equador</span>
        </button>
        <button
          onClick={() => setActiveTab('radial')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'radial'
              ? 'bg-sky-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Distâncias Radiais</span>
        </button>
      </div>

      {activeTab === 'human_scale' ? (
        <div className="space-y-3 my-2 text-xs">
          {/* Brazil Equator Info Card */}
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
            <div className="flex items-center justify-between text-emerald-300 font-bold mb-1">
              <span className="flex items-center gap-1">
                <span>🇧🇷</span> Linha do Equador no Brasil:
              </span>
              <span className="font-mono text-emerald-200 text-sm">~2.850 km</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              O trecho da Linha do Equador que atravessa o território brasileiro (Estados do <strong>Amazonas, Roraima, Pará e Amapá/Macapá</strong>) mede aproximadamente <strong>2.800 a 3.000 km</strong>.
            </p>
          </div>

          {/* Human Size & 5 km Visual Horizon Box */}
          <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/60">
            <div className="flex items-center justify-between text-sky-300 font-bold mb-1">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Tamanho do Ser Humano:
              </span>
              <span className="font-mono text-amber-300 text-sm">1,75 m (0,00175 km)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-sky-800/40 text-[11px]">
              <div className="bg-slate-900/80 p-2 rounded-lg">
                <div className="text-slate-400 font-medium">Alcance da Visão:</div>
                <div className="text-sky-300 font-bold font-mono mt-0.5">~5,0 km</div>
                <div className="text-[10px] text-slate-500">Linha do horizonte ao nível do solo</div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg">
                <div className="text-slate-400 font-medium">Proporção Humano:</div>
                <div className="text-amber-300 font-bold font-mono mt-0.5">1 : 2.857</div>
                <div className="text-[10px] text-slate-500">Humano vs. 5 km de horizonte</div>
              </div>
            </div>
          </div>

          {/* Sun apparent trajectory note */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
            <div className="flex items-center gap-1 text-amber-400 font-bold mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Trajetória Aparente do Sol no Céu Local:</span>
            </div>
            <p>
              Para o observador no solo dentro de seu campo visual de <strong>5 km</strong>, o Sol nasce no <strong>Leste (90°)</strong>, atinge o zênite/meridiano ao meio-dia e põe-se no <strong>Oeste (270°)</strong>.
            </p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-300 my-2.5">
            Calcule distâncias radiais e lineares na geometria planar:
          </p>

          <div className="space-y-3 my-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Ponto de Origem (A)</label>
              <select
                value={pointA}
                onChange={(e) => setPointA(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
              >
                {Object.keys(points).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Ponto de Destino (B)</label>
              <select
                value={pointB}
                onChange={(e) => setPointB(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
              >
                {Object.keys(points).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result box */}
          <div className="p-3.5 rounded-xl bg-sky-950/60 border border-sky-800/60 my-3 text-center">
            <span className="text-[10px] text-sky-300 uppercase tracking-wider block mb-1">
              Distância Linear Radial
            </span>
            <div className="text-2xl font-bold font-mono text-amber-300">
              {distKm.toLocaleString()} km
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Raio A: {points[pointA].distFromCenterKm.toLocaleString()} km • Raio B:{' '}
              {points[pointB].distFromCenterKm.toLocaleString()} km
            </span>
          </div>
        </>
      )}
    </div>
  );
};
