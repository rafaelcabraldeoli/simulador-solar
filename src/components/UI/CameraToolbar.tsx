import React from 'react';
import {
  Globe,
  ArrowDown,
  Eye,
  AlignJustify,
  Grid2X2,
  RotateCcw,
  Sun,
  Sparkles,
  User,
  SunMedium,
  Map,
  Orbit,
  Calendar,
  Star,
  MoreHorizontal,
  Sliders,
  Compass,
  MessageSquarePlus,
} from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { CameraMode } from '../../types';

export const CameraToolbar: React.FC = () => {
  const {
    theoryMode,
    setTheoryMode,
    cameraMode,
    setCameraMode,
    followAstro,
    followAstroId,
    settings,
    toggleSunLight,
    toggleMapOnlyMode,
    showLightingPanel,
    setShowLightingPanel,
    activeTab,
    setActiveTab,
    activeSidebarTool,
    setActiveSidebarTool,
    setIsLandingPortalOpen,
  } = useSimulationStore();

  const navTabs = [
    { id: 'system', label: 'Ajustes', icon: Sliders },
    { id: 'astros', label: 'Astros', icon: Orbit },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'favorites', label: 'Favoritos', icon: Star },
    { id: 'feedback', label: 'Sugestões', icon: MessageSquarePlus },
    { id: 'more', label: 'Mais', icon: MoreHorizontal },
  ];

  const cameraModes: { id: CameraMode; label: string; shortLabel: string; icon: any }[] = [
    { id: 'earth', label: 'Visão Global', shortLabel: 'Global', icon: Globe },
    { id: 'human', label: 'Visão Humana', shortLabel: 'Humana', icon: User },
    { id: 'top', label: 'Visão de Cima', shortLabel: 'Cima', icon: ArrowDown },
    { id: 'sky', label: 'Visão do Céu', shortLabel: 'Céu', icon: Eye },
    { id: 'side', label: 'Visão Lateral', shortLabel: 'Lateral', icon: AlignJustify },
    { id: 'compare', label: 'Comparar Horários', shortLabel: 'Comparar', icon: Grid2X2 },
  ];

  const isSunLit = settings.sunLightEnabled !== false;

  return (
    <div
      id="camera-toolbar"
      className="absolute top-[max(0.5rem,env(safe-area-inset-top))] sm:top-2.5 left-1/2 -translate-x-1/2 z-30 flex flex-wrap items-center justify-center gap-1 bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-2xl px-2 py-1 shadow-2xl shadow-black/70 pointer-events-auto w-max max-w-[calc(100vw-16px)]"
    >
      {/* 0. Seletor Principal de Modelo: Teoria Planar vs Teoria Terra Redonda + Início */}
      <div className="flex items-center gap-0.5 bg-slate-900/95 border border-slate-700/80 rounded-full p-0.5 shrink-0">
        <button
          id="btn-open-portal"
          onClick={() => setIsLandingPortalOpen(true)}
          title="Abrir Página Inicial / Menu de Simuladores & Monetização"
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-300 hover:text-amber-200 hover:bg-amber-500/20 border border-amber-500/30 transition duration-200 shrink-0 whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Início</span>
        </button>

        <button
          id="btn-theory-planar"
          onClick={() => setTheoryMode('planar')}
          title="Alternar para o Simulador Plano (Modelo da Terra Plana 3D)"
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition duration-200 shrink-0 whitespace-nowrap ${
            theoryMode === 'planar'
              ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-md shadow-sky-950 border border-sky-300/60'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent'
          }`}
        >
          <Compass className="w-3.5 h-3.5 shrink-0" />
          <span>Simulador Plano</span>
        </button>

        <button
          id="btn-theory-globe"
          onClick={() => setTheoryMode('globe')}
          title="Alternar para o Simulador Esférico (Modelo do Globo 3D)"
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition duration-200 shrink-0 whitespace-nowrap ${
            theoryMode === 'globe'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-950 border border-indigo-300/60'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent'
          }`}
        >
          <Globe className="w-3.5 h-3.5 shrink-0" />
          <span>Simulador Esférico</span>
        </button>
      </div>

      <div className="h-3.5 w-px bg-slate-800 mx-0.5 shrink-0 hidden sm:block" />

      {/* 1. System Navigation Tabs (Unificado na parte superior) */}
      <div className="flex items-center gap-0.5 shrink-0">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === 'system' ? activeSidebarTool === 'settings' : activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`btn-nav-tab-${tab.id}`}
              onClick={() => {
                if (tab.id === 'system') {
                  setActiveSidebarTool(activeSidebarTool === 'settings' ? null : 'settings');
                  setActiveTab('system');
                } else {
                  setActiveTab(tab.id as any);
                }
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition duration-200 shrink-0 whitespace-nowrap ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-950 border border-sky-400/60 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="h-3.5 w-px bg-slate-800 mx-0.5 shrink-0 hidden sm:block" />

      {/* 2. Camera View Modes */}
      <div className="flex items-center gap-0.5 shrink-0">
        {cameraModes.map((mode) => {
          const Icon = mode.icon;
          const isActive = cameraMode === mode.id;

          return (
            <button
              key={mode.id}
              id={`btn-cam-mode-${mode.id}`}
              onClick={() => {
                followAstro(null);
                setCameraMode(mode.id);
              }}
              title={mode.label}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition duration-200 shrink-0 whitespace-nowrap ${
                isActive
                  ? 'bg-sky-600/40 text-sky-200 border border-sky-400 font-semibold shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{mode.shortLabel}</span>
            </button>
          );
        })}
      </div>

      <div className="h-3.5 w-px bg-slate-800 mx-0.5 shrink-0 hidden sm:block" />

      {/* 3. Sun Lighting On/Off Toggle */}
      <button
        id="btn-toggle-sun-light"
        onClick={() => toggleSunLight()}
        title={isSunLit ? 'Apagar a luz do Sol (deixar o plano no escuro total)' : 'Ligar a luz do Sol novamente'}
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition duration-200 border shrink-0 whitespace-nowrap ${
          isSunLit
            ? 'bg-slate-900 hover:bg-slate-850 text-amber-300 hover:text-amber-200 border-amber-500/40 hover:border-amber-400'
            : 'bg-red-950/70 text-red-300 border-red-500/70 hover:bg-red-900/70 font-bold animate-pulse'
        }`}
      >
        {isSunLit ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Apagar Sol</span>
          </>
        ) : (
          <>
            <SunMedium className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>Ligar Sol</span>
          </>
        )}
      </button>

      {/* 4. Lighting Panel Toggle */}
      <button
        id="btn-toggle-lighting-panel"
        onClick={() => setShowLightingPanel(!showLightingPanel)}
        title="Abrir painel de iluminação e sombras"
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition duration-200 border shrink-0 whitespace-nowrap ${
          showLightingPanel
            ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-md font-bold'
            : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-700/80 hover:text-amber-300'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Iluminação</span>
      </button>

      <div className="h-3.5 w-px bg-slate-800 mx-0.5 shrink-0 hidden sm:block" />

      {/* 5. Somente Mapa (100% Clean Mode) */}
      <button
        id="btn-toggle-map-only"
        onClick={() => toggleMapOnlyMode()}
        title="Ver Somente o Mapa (Oculta todos os painéis e botões)"
        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition duration-200 border shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/80 shadow-md shadow-emerald-950/60 whitespace-nowrap"
      >
        <Map className="w-3.5 h-3.5 text-emerald-100 shrink-0" />
        <span>Somente Mapa</span>
      </button>

      {/* 6. Unfollow Astro button (if active) */}
      {followAstroId && (
        <button
          onClick={() => followAstro(null)}
          title="Parar de seguir astro"
          className="ml-0.5 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[11px] font-semibold flex items-center gap-1 hover:bg-amber-500/30 transition shrink-0 whitespace-nowrap"
        >
          <RotateCcw className="w-3 h-3 shrink-0" />
          <span>Livre</span>
        </button>
      )}
    </div>
  );
};
