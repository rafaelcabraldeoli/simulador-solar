import React from 'react';
import { X, Star, Bookmark, Info, Sparkles, Compass } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';

export const FavoritesModal: React.FC = () => {
  const { activeTab, setActiveTab, setDate, setCameraMode, selectAstro } = useSimulationStore();

  if (activeTab !== 'favorites' && activeTab !== 'more') return null;

  const favoritePresets = [
    {
      title: 'Solstício de Verão Austral (21/12 12:00)',
      desc: 'Sol no raio máximo (~13.340 km), próximo à Antártica, com iluminação ampla sobre o Trópico de Capricórnio.',
      d: new Date(2026, 11, 21, 12, 0),
      cam: 'top',
      astro: 'sun',
    },
    {
      title: 'Solstício de Verão Boreal (21/06 12:00)',
      desc: 'Sol no raio mínimo (~6.670 km), centro Ártico com 24h contínuas de iluminação (Sol da Meia-noite).',
      d: new Date(2026, 5, 21, 12, 0),
      cam: 'top',
      astro: 'sun',
    },
    {
      title: 'Alinhamento dos Planetas e Lua Cheia',
      desc: 'Visualização noturna das camadas celestes de altitude com Lua Cheia e os 7 planetas.',
      d: new Date(2026, 7, 28, 22, 0),
      cam: 'side',
      astro: 'moon',
    },
    {
      title: 'Transição Crepuscular das 18:00',
      desc: 'Projeção do feixe cônico solar sobre o Oceano Pacífico e Américas.',
      d: new Date(2026, 7, 25, 18, 0),
      cam: 'earth',
      astro: 'sun',
    },
  ];

  return (
    <div
      id="modal-favorites-full"
      className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-xl p-4 sm:p-8 flex flex-col pointer-events-auto overflow-y-auto"
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 uppercase tracking-wider">
              {activeTab === 'favorites' ? 'Cenários Favoritos & Salvos' : 'Sobre o Simulador Astronômico'}
            </h2>
            <p className="text-xs text-slate-400">
              {activeTab === 'favorites'
                ? 'Configurações de data, hora e câmera salvas para análise astronômica rápida'
                : 'Informações arquiteturais e especificações técnicas da simulação planar'}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        {favoritePresets.map((fav) => (
          <div
            key={fav.title}
            className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 flex flex-col justify-between transition"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">{fav.title}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">{fav.desc}</p>
            </div>

            <button
              onClick={() => {
                setDate(fav.d);
                setCameraMode(fav.cam as any);
                selectAstro(fav.astro as any);
                setActiveTab('system');
              }}
              className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-sky-950"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Carregar Cenário no 3D</span>
            </button>
          </div>
        ))}
      </div>

      {activeTab === 'more' && (
        <div className="mt-4 p-5 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-2">
          <h4 className="text-sm font-bold text-slate-200">Especificações da Arquitetura</h4>
          <p>
            • <strong>Motor de Iluminação:</strong> Fragment shader GLSL em tempo real com cálculo dinâmico de atenuação cônica, gradiente contínuo e penumbra.
          </p>
          <p>
            • <strong>Estrutura de Terras Extras:</strong> Continentes e relevos externos integrados fisicamente na mesma malha geométrica 3D além da borda da Antártica.
          </p>
          <p>
            • <strong>Modelo Celeste:</strong> 9 corpos celestes estratificados em camadas altimétricas autônomas, impedindo interseções visuais.
          </p>
        </div>
      )}
    </div>
  );
};
