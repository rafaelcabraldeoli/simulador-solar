import React from 'react';
import { X, Layers, Check, Wind, Eye, EyeOff, Anchor } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { LayerSettings } from '../../types';

export const LayersModal: React.FC = () => {
  const { activeSidebarTool, setActiveSidebarTool, layers, toggleLayer, setLayer, setAtmosphereObjectsSpeed } = useSimulationStore();

  if (activeSidebarTool !== 'layers') return null;

  const layerItems: { key: keyof LayerSettings; label: string; desc: string }[] = [
    { key: 'showSpaceBackground', label: 'Abóbada Celeste (Firmamento de Estrelas & Polaris)', desc: 'Cúpula estelar esférica 360° com rotação diurna ao redor de Polaris, difração estelar e perspectiva perfeita' },
    { key: 'showPlanets', label: 'Planetas (Discos de Luz 2D no Espelho)', desc: 'Discos planos 2D projetados no espelho primordial com atmosfera fluida e Sol/Lua próprios' },
    { key: 'showOrbits', label: 'Órbitas', desc: 'Trajetórias orbitais circulares concêntricas' },
    { key: 'showAstroNames', label: 'Nomes dos Astros', desc: 'Rótulos visuais de identificação' },
    { key: 'showAstroAltitudes', label: 'Altitude dos Astros', desc: 'Linhas verticais pontilhadas até o solo' },
    { key: 'showGridLines', label: 'Linhas de Grade', desc: 'Círculos de latitude e meridianos radiais' },
    { key: 'showCoordinates', label: 'Coordenadas e Bússola', desc: 'Pontos cardeais N, S, L, O e eixos' },
    { key: 'showWorldCities', label: 'Cidades do Mundo', desc: 'Rótulos, capitais e marcadores urbanos detalhados' },
    { key: 'showCityLights', label: 'Luzes Urbanas Noturnas', desc: 'Pontos de luz dourada nas metrópoles no lado escuro' },
    { key: 'showZodiacBelt', label: 'Cinturão do Zodíaco', desc: 'Faixa com símbolos astrológicos ao longo do firmamento' },
    { key: 'showConstellations', label: 'Constelações', desc: 'Traçados estelares na cúpula celeste' },
    { key: 'showNebulae', label: 'Nebulosas', desc: 'Nuvens de poeira cósmica no firmamento' },
    { key: 'showSolarFocus', label: 'Foco Solar & Feixe', desc: 'Cone volumétrico translúcido da luz solar' },
    { key: 'showDynamicShadows', label: 'Sombras Dinâmicas', desc: 'Penumbra e escuridão noturna na superfície' },
    { key: 'showMountainRelief3D', label: 'Relevo 3D das Montanhas', desc: 'Elevação física tridimensional das cordilheiras e planaltos continentais' },
    { key: 'showRealisticWater', label: 'Águas e Óptica dos Oceanos (Sunglint & Fresnel)', desc: 'Reflexo specular do Sol e da Lua, reflexão de Fresnel e tonalidades abissais' },
    { key: 'showOceanWaves', label: 'Ondas em Alto Mar & Arrebentação na Costa', desc: 'Agitação dinâmica regional em alto mar e ondas quebrando ritmicamente na costa continental' },
    { key: 'showLiveWeather', label: 'Clima & Satélites em Tempo Real', desc: 'Badges com temperatura, Sol e chuva em estações pelo mundo' },
    { key: 'showLivePrecipitation', label: 'Precipitação 3D (Chuva / Neve)', desc: 'Partículas 3D de chuva, tempestades e neve sobre as regiões ativas' },
    { key: 'showClouds3D', label: 'Nuvens 3D Gerais', desc: 'Camadas de nuvens volumétricas estratificadas' },
    { key: 'showCloudsHigh', label: '• Nuvens Altas (6-13 km)', desc: 'Cirrus, Cirrostratus e Cirrocumulus (Cristais de Gelo)' },
    { key: 'showCloudsMiddle', label: '• Nuvens Médias (2-7 km)', desc: 'Altocumulus, Altostratus e Nimbostratus' },
    { key: 'showCloudsLow', label: '• Nuvens Baixas (0-2 km)', desc: 'Cumulus de algodão, Stratocumulus e Stratus' },
    { key: 'showCloudsVertical', label: '• Cumulonimbus (0.5-14 km)', desc: 'Torres de tempestade com bigorna na tropopausa' },
    { key: 'showAtmosphere', label: 'Atmosfera Terrestre (Geral)', desc: 'Brilho volumétrico e domo difuso planar' },
    { key: 'showAtmosphereLayers', label: 'As 5 Camadas da Atmosfera (3D)', desc: 'Estratificação completa de 0 a 10.000 km com altitudes' },
    { key: 'showAtmosphereLabels', label: 'Nomes dos Objetos no Céu (Rótulos)', desc: 'Aparecer com nome ou sem nome para não poluir a imagem da Terra' },
    { key: 'atmosphereObjectsFixed', label: 'Fixar Objetos no Céu (Sem Rodar)', desc: 'Manter estação espacial (ISS), satélites e aeronaves fixos/estacionários' },
    { key: 'showTroposphere', label: '• Troposfera (0-10 km)', desc: 'Clima, nuvens, chuva e 80% do ar respirável' },
    { key: 'showStratosphere', label: '• Estratosfera (10-50 km)', desc: 'Camada de ozônio (O₃) protetora e voo de aviões a jato' },
    { key: 'showMesosphere', label: '• Mesosfera (50-85 km)', desc: 'Camada mais fria (-100°C) onde meteoros viram estrelas cadentes' },
    { key: 'showThermosphere', label: '• Termosfera (85-500 km)', desc: 'Camada mais quente (+1500°C), órbita da ISS e Auroras' },
    { key: 'showExosphere', label: '• Exosfera (500-10.000 km)', desc: 'Transição cósmica com hidrogênio e hélio para o espaço' },
    { key: 'showAtmosphereObjects', label: '• Modelos 3D das Camadas', desc: 'Avião comercial, ISS, meteoros, auroras e escudo de ozônio' },
  ];

  return (
    <div
      id="modal-layers"
      className="fixed md:absolute top-14 md:top-24 left-2 sm:left-20 right-2 sm:right-auto z-40 w-auto sm:w-96 max-w-[calc(100vw-16px)] max-h-[85vh] overflow-y-auto bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-2xl shadow-black/80 animate-in fade-in duration-150"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Camadas Visuais</h3>
        </div>
        <button
          onClick={() => setActiveSidebarTool(null)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Painel Rápido: Gerenciamento dos Objetos no Céu (Nomes & Movimento) */}
      <div className="my-2.5 p-3 rounded-xl bg-slate-900/90 border border-sky-500/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200">Objetos no Céu & Terra Limpa</span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            {layers.showAtmosphereLabels ? 'Com Nomes' : 'Sem Nomes'}
          </span>
        </div>

        {/* Nomes: Sem Nome vs Com Nome */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-300">Rótulos/Nomes:</span>
          <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px]">
            <button
              onClick={() => setLayer('showAtmosphereLabels', false)}
              className={`px-2 py-1 rounded font-semibold transition ${
                !layers.showAtmosphereLabels
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Sem nomes para não poluir a imagem da Terra"
            >
              Sem Nome (Padrão)
            </button>
            <button
              onClick={() => setLayer('showAtmosphereLabels', true)}
              className={`px-2 py-1 rounded font-semibold transition ${
                layers.showAtmosphereLabels
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Aparecer nomes dos objetos"
            >
              Aparecer Nome
            </button>
          </div>
        </div>

        {/* Posição: Fixos vs Movimento */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-300">Estação & Satélites:</span>
          <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px]">
            <button
              onClick={() => {
                setLayer('atmosphereObjectsFixed', true);
                setAtmosphereObjectsSpeed(0);
              }}
              className={`px-2 py-1 rounded font-semibold transition ${
                layers.atmosphereObjectsFixed
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Fixos no céu sem rodar rápido"
            >
              Fixos no Céu
            </button>
            <button
              onClick={() => {
                setLayer('atmosphereObjectsFixed', false);
                setAtmosphereObjectsSpeed(0.2);
              }}
              className={`px-2 py-1 rounded font-semibold transition ${
                !layers.atmosphereObjectsFixed
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Em movimento orbital"
            >
              Em Movimento
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => setActiveSidebarTool('atmosphere')}
        className="w-full my-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-950/80 to-blue-950/80 hover:from-sky-900/80 hover:to-blue-900/80 border border-sky-500/40 text-sky-200 text-xs font-semibold flex items-center justify-between transition group shadow-md shadow-sky-950/40"
      >
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-sky-400 group-hover:rotate-12 transition-transform" />
          <div className="text-left">
            <div>As 5 Camadas da Atmosfera</div>
            <div className="text-[10px] text-sky-300/80 font-normal">Troposfera, Estratosfera, Mesosfera, Termosfera, Exosfera</div>
          </div>
        </div>
        <span className="text-[10px] text-white font-mono bg-sky-600 px-2 py-0.5 rounded-full group-hover:bg-sky-500 transition">
          Ver 3D →
        </span>
      </button>

      <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-800/60 my-2 pr-1">
        {layerItems.map((item) => {
          const isChecked = Boolean(layers[item.key]);
          const handleItemClick = () => {
            if (item.key === 'atmosphereObjectsFixed') {
              const nextFixed = !layers.atmosphereObjectsFixed;
              setLayer('atmosphereObjectsFixed', nextFixed);
              setAtmosphereObjectsSpeed(nextFixed ? 0 : 0.2);
            } else {
              toggleLayer(item.key);
            }
          };

          return (
            <button
              type="button"
              key={item.key}
              onClick={handleItemClick}
              className="w-full text-left flex items-start gap-3 py-2.5 px-2.5 rounded-xl hover:bg-slate-900/80 active:bg-slate-900 cursor-pointer transition select-none group"
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center border transition ${
                  isChecked
                    ? 'bg-sky-600 border-sky-400 text-white shadow-sm shadow-sky-500/30'
                    : 'bg-slate-900 border-slate-700 text-transparent group-hover:border-slate-500'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-semibold transition ${isChecked ? 'text-sky-200' : 'text-slate-200 group-hover:text-white'}`}>
                  {item.label}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{item.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
        <span className="text-[11px] text-slate-400 font-mono">
          {layerItems.filter((it) => layers[it.key]).length}/{layerItems.length} ativas
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const store = useSimulationStore.getState();
              store.setAllLayers(false);
            }}
            className="px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-[11px] text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition font-medium"
          >
            Desligar Todas
          </button>
          <button
            onClick={() => {
              const store = useSimulationStore.getState();
              store.setAllLayers(true);
            }}
            className="px-2 py-1 rounded-md bg-sky-600/30 border border-sky-500/50 text-[11px] text-sky-300 hover:text-sky-100 hover:bg-sky-600/50 transition font-medium"
          >
            Ligar Todas
          </button>
        </div>
      </div>
    </div>
  );
};
