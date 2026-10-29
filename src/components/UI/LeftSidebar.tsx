import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Layers,
  Cloud,
  CloudRain,
  Compass,
  Ruler,
  Sliders,
  Settings,
  Map,
  Mountain,
  X,
  Sparkles,
  Wind,
  MessageSquarePlus,
} from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';

export const LeftSidebar: React.FC = () => {
  const { activeSidebarTool, setActiveSidebarTool, setCameraMode, cameraMode, toggleMapOnlyMode, setActiveTab } = useSimulationStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const tools = [
    {
      id: 'settings',
      label: 'Ajustes',
      fullLabel: 'Ajustes do Modelo',
      desc: 'Sol, Lua, eclipses, luz e escalas',
      icon: Sliders,
      isPrimary: true,
    },
    {
      id: 'clouds',
      label: 'Nuvens & Alt.',
      fullLabel: 'Nuvens & Redemoinho',
      desc: 'Altitude, vórtice e morfologia',
      icon: Cloud,
    },
    {
      id: 'atmosphere',
      label: 'Atmosfera',
      fullLabel: 'As 5 Camadas da Atmosfera',
      desc: 'Troposfera a Exosfera (0 a 10.000 km)',
      icon: Wind,
      isPrimary: true,
    },
    {
      id: 'mountains',
      label: 'Montanhas 3D',
      fullLabel: 'Montanhas & Relevo 3D',
      desc: 'Picos e elevação do terreno',
      icon: Mountain,
    },
    {
      id: 'constellations',
      label: 'Constelações',
      fullLabel: 'Constelações & Linhas',
      desc: 'Linhas no céu, figuras e estrelas',
      icon: Sparkles,
      isPrimary: true,
    },
    {
      id: 'layers',
      label: 'Camadas',
      fullLabel: 'Camadas do Mapa',
      desc: 'Atmosfera, cidades e grade',
      icon: Layers,
    },
    {
      id: 'weather',
      label: 'Clima Real',
      fullLabel: 'Clima & Satélite',
      desc: 'Chuva e dados meteorológicos',
      icon: CloudRain,
    },
    {
      id: 'location',
      label: 'Localização',
      fullLabel: 'Localização & Cidades',
      desc: 'Ponto do observador no mapa',
      icon: MapPin,
    },
    {
      id: 'datetime',
      label: 'Data e Hora',
      fullLabel: 'Data & Horário',
      desc: 'Ajuste manual do calendário',
      icon: Calendar,
    },
    {
      id: 'skyview',
      label: 'Visão do Céu',
      fullLabel: 'Visão do Céu / Zênite',
      desc: 'Câmera voltada para o alto',
      icon: Compass,
      onClick: () => setCameraMode(cameraMode === 'sky' ? 'earth' : 'sky'),
      isActive: cameraMode === 'sky',
    },
    {
      id: 'measure',
      label: 'Medidas',
      fullLabel: 'Régua & Medidas',
      desc: 'Distâncias radiais e km',
      icon: Ruler,
    },
    {
      id: 'feedback',
      label: 'Sugestões',
      fullLabel: 'Sugestões dos Usuários',
      desc: 'Envie ideias para melhorar o app',
      icon: MessageSquarePlus,
      onClick: () => setActiveTab('feedback'),
      isPrimary: true,
    },
    {
      id: 'maponly',
      label: 'Somente Mapa',
      fullLabel: 'Modo Somente Mapa',
      desc: 'Oculta painéis para tela limpa',
      icon: Map,
      onClick: () => toggleMapOnlyMode(),
      isSpecial: true,
    },
  ];

  const handleToolClick = (tool: typeof tools[0]) => {
    if (tool.onClick) {
      tool.onClick();
    } else {
      setActiveSidebarTool(tool.id as any);
    }
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* 1. Mobile Floating Quick-Bar (Visible on mobile when menu is closed) */}
      {!isMobileOpen && (
        <div className="md:hidden absolute top-[max(3.5rem,calc(env(safe-area-inset-top)+2.5rem))] left-2.5 z-30 flex items-center gap-1 bg-slate-950/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-1 shadow-2xl shadow-black/80">
          {/* Menu Button */}
          <button
            id="btn-mobile-open-sidebar"
            onClick={() => setIsMobileOpen(true)}
            title="Abrir Menu de Ferramentas"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-700/60 text-sky-300 rounded-xl text-xs font-semibold active:scale-95 transition"
          >
            <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Menu</span>
          </button>

          {/* Direct "Ajustes" Button on Mobile */}
          <button
            id="btn-mobile-open-adjustments"
            onClick={() => setActiveSidebarTool(activeSidebarTool === 'settings' ? null : 'settings')}
            title="Abrir Ajustes do Modelo (Sol, Lua, Nuvens, Eclipses)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition active:scale-95 ${
              activeSidebarTool === 'settings'
                ? 'bg-sky-600 border-sky-400 text-white font-bold shadow-md shadow-sky-950'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Ajustes</span>
          </button>
        </div>
      )}

      {/* 2. Mobile Responsive Grid Drawer (Replaces the cramped cut-off column) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-start items-center p-3 pt-14 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-950/98 border border-slate-800 rounded-3xl p-4 shadow-2xl shadow-black max-h-[82vh] overflow-y-auto overflow-x-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-sky-500/20 text-sky-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                    Menu & Ferramentas
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Selecione um painel ou ajuste
                  </p>
                </div>
              </div>
              <button
                id="btn-mobile-close-sidebar"
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Featured Primary Card: AJUSTES DO MODELO */}
            <button
              id="btn-mobile-drawer-settings"
              onClick={() => {
                setActiveSidebarTool('settings');
                setIsMobileOpen(false);
              }}
              className={`w-full mb-3 p-3 rounded-2xl border flex items-center justify-between transition ${
                activeSidebarTool === 'settings'
                  ? 'bg-sky-600/30 border-sky-400 text-sky-100 shadow-lg shadow-sky-950'
                  : 'bg-gradient-to-r from-amber-950/30 via-slate-900 to-sky-950/30 border-amber-500/40 text-slate-200 hover:border-amber-400'
              }`}
            >
              <div className="flex items-center gap-3 text-left">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Ajustes & Configurações</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/30 text-amber-300 font-semibold uppercase">
                      Sliders
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Alturas, Sol, Lua, nuvens, eclipses e luz
                  </div>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 ml-2" />
            </button>

            {/* 2-Column Grid of all tools */}
            <div className="grid grid-cols-2 gap-2">
              {tools
                .filter((t) => t.id !== 'settings')
                .map((tool) => {
                  const Icon = tool.icon;
                  const active = tool.isActive ?? activeSidebarTool === tool.id;

                  return (
                    <button
                      key={tool.id}
                      id={`btn-mobile-tool-${tool.id}`}
                      onClick={() => handleToolClick(tool)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition ${
                        active
                          ? 'bg-sky-600/30 border-sky-400 text-sky-200 shadow-md'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-slate-800/80 shrink-0">
                        <Icon className="w-4 h-4 text-sky-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate text-slate-200">
                          {tool.label}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate">
                          {tool.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Desktop Vertical Sidebar (hidden on mobile, sleek on md+) */}
      <aside
        id="left-tool-sidebar"
        className="hidden md:flex absolute top-16 left-3 z-30 flex-col gap-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-2xl p-2 shadow-2xl shadow-black/70 max-h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden scrollbar-thin transition-all duration-200"
      >
        {tools.map((tool) => {
          const Icon = tool.icon;
          const active = tool.isActive ?? activeSidebarTool === tool.id;

          return (
            <button
              key={tool.id}
              id={`btn-sidebar-tool-${tool.id}`}
              onClick={() => {
                if (tool.onClick) {
                  tool.onClick();
                } else {
                  setActiveSidebarTool(tool.id as any);
                }
              }}
              title={tool.fullLabel}
              className={`group relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition duration-200 shrink-0 ${
                active
                  ? 'bg-sky-600/30 border border-sky-400/80 text-sky-200 shadow-md shadow-sky-950'
                  : tool.isPrimary
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-slate-900/60 border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Icon className="w-5 h-5 transition-transform group-hover:scale-110 shrink-0" />
              <span className="text-[9px] font-medium mt-0.5 tracking-tight text-center leading-tight truncate max-w-[44px]">
                {tool.label.split(' ')[0]}
              </span>

              {/* Hover Tooltip (desktop) */}
              <div className="hidden md:block absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-100 rounded-md whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition duration-150 z-50">
                {tool.fullLabel}
              </div>
            </button>
          );
        })}
      </aside>
    </>
  );
};

