import { create } from 'zustand';
import { AstroId, AtmosphereLayerId, CameraMode, LayerSettings, ModelSettings, SimulationState, TheoryMode } from '../types';
import { formatUtcOffsetString, getLocationCurrentWallClockDate, getLocationUtcOffsetHours } from '../data/cities';

interface SimulationStore extends SimulationState {
  isSystemLoading: boolean;
  loadingTitle: string;
  loadingSubtitle: string;
  loadingDurationMs: number;
  loadingRunId: number;
  triggerSystemLoading: (title: string, subtitle?: string, durationMs?: number, onReadySwitch?: () => void) => void;
  finishSystemLoading: () => void;
  setTheoryMode: (mode: TheoryMode) => void;
  setDate: (date: Date) => void;
  addTime: (seconds: number) => void;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
  setCameraMode: (mode: CameraMode) => void;
  selectAstro: (id: AstroId | null) => void;
  followAstro: (id: AstroId | null) => void;
  setShowLightingPanel: (show: boolean) => void;
  toggleLightingPanel: () => void;
  setActiveTab: (tab: SimulationState['activeTab']) => void;
  setActiveSidebarTool: (tool: SimulationState['activeSidebarTool']) => void;
  setSelectedCloud: (id: string | null) => void;
  setSelectedAtmosphereLayer: (layer: AtmosphereLayerId | null) => void;
  setAtmosphereOpacity: (opacity: number) => void;
  setAtmosphereObjectsSpeed: (speed: number) => void;
  setMapColorTheme: (theme: 'satellite' | 'hypsometric') => void;
  setMountainDisplacementScale: (scale: number) => void;
  toggleLayer: (key: keyof LayerSettings) => void;
  setLayer: (key: keyof LayerSettings, val: any) => void;
  setAllLayers: (val: boolean) => void;
  updateSettings: (partial: Partial<ModelSettings>) => void;
  toggleSunLight: () => void;
  toggleMoonLight: () => void;
  toggleMapOnlyMode: () => void;
  setMapOnlyMode: (val: boolean) => void;
  isLandingPortalOpen: boolean;
  setIsLandingPortalOpen: (open: boolean) => void;
  resetToNow: () => void;
}

const DEFAULT_LAYERS: LayerSettings = {
  showSpaceBackground: true,  // Abóbada Celeste (Firmamento de Estrelas & Polaris) ativada por padrão
  showPlanets: true,
  showOrbits: false,          // Iniciar o sistema sem órbitas conforme solicitado
  showAstroNames: false,      // Nomes dos astros desligados
  showAstroAltitudes: false,  // Linhas de altitude dos astros desligadas
  showGridLines: false,       // Linhas de grade desligadas
  showConstellations: false,  // Constelações desligadas
  showNebulae: false,         // Nebulosas desligadas
  showExtraLands: false,      // Terras Extras desativadas e removidas
  showSolarFocus: false,      // Iniciar com Foco do Sol desativado conforme solicitado
  showDynamicShadows: true,
  showRealisticWater: true,
  showAtmosphere: false,      // Iniciar sem os anéis/camadas da atmosfera conforme solicitado
  showAtmosphereLayers: false,
  showTroposphere: false,
  showStratosphere: false,
  showMesosphere: false,
  showThermosphere: false,
  showExosphere: false,
  showAtmosphereObjects: false,
  showAtmosphereLabels: false, // Começar SEM NOME para não poluir a imagem da Terra conforme solicitado
  atmosphereObjectsFixed: true, // Começar FIXO NO CÉU conforme solicitado ("eles não deveriam ficar fixos no céu?")
  atmosphereObjectsSpeed: 0.0, // Padrão 0.0 = fixo no céu
  selectedAtmosphereLayer: null,
  atmosphereOpacity: 0.85,
  showClouds3D: true,         // Manter nuvens ligadas no início do sistema conforme solicitado
  showCloudsHigh: true,
  showCloudsMiddle: true,
  showCloudsLow: true,
  showCloudsVertical: true,
  selectedCloudId: null,
  showLiveWeather: false,
  showLivePrecipitation: false,
  showCoordinates: false,     // Iniciar sem o marcador/etiqueta de localização no mapa conforme solicitado
  showCityLights: false,      // Iniciar com Luzes das Cidades desativado conforme solicitado
  showWorldCities: false,
  showZodiacBelt: false,      // Cinturão do zodíaco desligado
  showMountainRelief3D: true, // Relevo 3D físico das montanhas ativo
  showMountainPeaks: false,   // Começar sem os nomes e marcadores de montanhas conforme solicitado
  mapColorTheme: 'satellite', // 'satellite' ou 'hypsometric'
  mountainDisplacementScale: 1.2, // Altura vertical do relevo equilibrada
  showOceanRoutes: false,     // Linhas de corrente de vento e rotas marítimas desativadas
  showConstellationLines: true, // Quando ativado, exibir as linhas conectoras das constelações
  showConstellationLabels: true, // Exibir os nomes e placas das constelações
  constellationLineColor: 'cyan', // Cor padrão: ciano celeste luminoso
  constellationLineOpacity: 0.85, // Opacidade 85%
  selectedConstellation: null, // Nenhuma constelação filtrada inicialmente
  showOceanWaves: true, // Ondas e arrebentação costeira ativadas por padrão
  oceanAgitationMode: 'dynamic', // 'dynamic': tempestades e ondas que surgem e passam naturalmente
};

const DEFAULT_SETTINGS: ModelSettings = {
  oceanWaveHeight: 1.0, // Altura das ondas do mar normal calibrada
  sunDistanceKm: 4000,
  moonDistanceKm: 8750,
  solarFocusAngleDeg: 68,
  solarIntensity: 2.0,
  sunLightEnabled: true, // true = Sol aceso / iluminando o plano; false = Luz do Sol apagada (escuridão total)
  moonLightEnabled: true, // true = Luar ativo refletindo luz solar; false = Luar apagado
  moonIntensity: 1.0, // Intensidade luminosa do luar (padrão: 1.0x)
  moonFocusAngleDeg: 39, // Abertura do foco cônico lunar (padrão: 39°)
  cloudSpeed: 0.45, // Velocidade reduzida e suave conforme solicitado pelo usuário
  cloudAltitude: 2.7, // Descida de 25% na altitude das nuvens (anteriormente 3.6 km)
  cloudScale: 0.10, // 90% menores conforme solicitado pelo usuário
  cloudDensity: 1.9, // 90% a mais de unidades
  cloudStretch: 1.5, // 50% mais esticadas conforme solicitado pelo usuário
  mapLightingMode: 'balanced', // 'balanced': daylight illuminated by direct sunlight spotlight + subtle nocturnal ambient visibility so satellite imagery of Earth is always clearly visible!
  ambientBrightness: 0.35, // Balanced ambient illumination displaying authentic NASA satellite photography
  visualScale: true,
  timeZone: 'UTC-03:00',
  distanceUnit: 'km',
  coordinateSystem: 'Plano (Azimutal)',
  observerLat: -23.5505, // São Paulo, Brasil (23.55° S)
  observerLng: -46.6333, // São Paulo, Brasil (46.63° W)
  observerLocationName: 'São Paulo, Brasil',
  observerBiome: 'tropical',
  sunTrajectoryMode: 'linear_horizon_5km', // Straight line 5km human vision
  eclipseTheory: 'moon_eclipses_sun',
  language: 'pt-BR',
  activePlanarWorld: 'earth',
};

// Start the simulation with the exact current real-time clock of the initial observer location
const INITIAL_DATE = getLocationCurrentWallClockDate(DEFAULT_SETTINGS.observerLat, DEFAULT_SETTINGS.observerLng);

const CAMERA_MODE_LOADING_LABELS: Record<CameraMode, { title: string; subtitle: string; durationMs: number }> = {
  earth: {
    title: 'Carregando Visão Global 3D',
    subtitle: 'Posicionando câmera orbital sobre o mapa terrestre e sincronizando astros...',
    durationMs: 850,
  },
  human: {
    title: 'Carregando Visão Humana em 1ª Pessoa',
    subtitle: 'Construindo horizonte local, bioma terrestre 3D e domo celeste do observador...',
    durationMs: 1150,
  },
  top: {
    title: 'Carregando Visão Zenital de Cima',
    subtitle: 'Alinhando projeção azimutal equidistante perpendicular ao Polo Norte...',
    durationMs: 800,
  },
  sky: {
    title: 'Carregando Visão do Céu (Zênite)',
    subtitle: 'Projetando abóbada estelar 360°, constelações e rotação ao redor de Polaris...',
    durationMs: 900,
  },
  side: {
    title: 'Carregando Visão Lateral de Altitudes',
    subtitle: 'Nivelando perfil vertical de camadas atmosféricas, nuvens e órbitas...',
    durationMs: 850,
  },
  compare: {
    title: 'Carregando Comparador Multi-Horários',
    subtitle: 'Sincronizando painéis simultâneos de iluminação solar em 4 horários...',
    durationMs: 1100,
  },
};

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  isSystemLoading: true,
  loadingTitle: 'Inicializando SOLA — Simulador do Sistema Solar',
  loadingSubtitle: 'Carregando motor gráfico 3D WebGL, mapas de satélite HD e efemérides astronômicas...',
  loadingDurationMs: 2100,
  loadingRunId: 1,
  theoryMode: 'planar',
  currentDate: INITIAL_DATE,
  isPlaying: true,
  playbackSpeed: 1, // 1x real-time clock speed on start
  cameraMode: 'earth',
  selectedAstroId: null, // Quadro do astro fechado na inicialização
  followAstroId: null,
  showLightingPanel: false,
  activeTab: 'system',
  activeSidebarTool: null, // Clean initial view with no modal overlay
  mapOnlyMode: false,
  isLandingPortalOpen: true,
  layers: DEFAULT_LAYERS,
  settings: {
    ...DEFAULT_SETTINGS,
    timeZone: formatUtcOffsetString(getLocationUtcOffsetHours(DEFAULT_SETTINGS.observerLat, DEFAULT_SETTINGS.observerLng)),
  },

  triggerSystemLoading: (title, subtitle, durationMs = 1000, onReadySwitch) => {
    set((state) => ({
      isSystemLoading: true,
      loadingTitle: title,
      loadingSubtitle:
        subtitle || 'Sincronizando motor gráfico 3D, texturas e cálculos orbitais em tempo real...',
      loadingDurationMs: durationMs,
      loadingRunId: state.loadingRunId + 1,
    }));
    if (onReadySwitch) {
      window.setTimeout(() => {
        onReadySwitch();
      }, 85);
    }
  },

  finishSystemLoading: () => set({ isSystemLoading: false }),

  setTheoryMode: (theoryMode: TheoryMode) => {
    const current = get().theoryMode;
    if (current === theoryMode) return;
    get().triggerSystemLoading(
      theoryMode === 'globe'
        ? 'Carregando Simulador da Terra Redonda (Sistema Solar 3D)'
        : 'Carregando Simulador da Terra Planar (3D)',
      theoryMode === 'globe'
        ? 'Construindo Sistema Solar Heliocêntrico, 8 planetas, luas e precessão nodal...'
        : 'Construindo disco terrestre azimutal, relevo 3D, domo celeste e camadas atmosféricas...',
      1450,
      () => set({ theoryMode })
    );
  },

  setDate: (date: Date) => set({ currentDate: new Date(date) }),
  
  addTime: (seconds: number) =>
    set((state) => ({
      currentDate: new Date(state.currentDate.getTime() + seconds * 1000),
    })),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setSpeed: (playbackSpeed: number) => set({ playbackSpeed }),

  setCameraMode: (cameraMode: CameraMode) => {
    const current = get().cameraMode;
    if (current === cameraMode) return;
    const info = CAMERA_MODE_LOADING_LABELS[cameraMode];
    get().triggerSystemLoading(
      info.title,
      info.subtitle,
      info.durationMs,
      () => set({ cameraMode })
    );
  },

  selectAstro: (selectedAstroId: AstroId | null) => set({ selectedAstroId }),

  followAstro: (followAstroId: AstroId | null) => set({ followAstroId }),

  setShowLightingPanel: (showLightingPanel: boolean) => set({ showLightingPanel }),

  toggleLightingPanel: () => set((state) => ({ showLightingPanel: !state.showLightingPanel })),

  setActiveTab: (activeTab) => set({ activeTab }),

  setActiveSidebarTool: (activeSidebarTool) =>
    set((state) => ({
      activeSidebarTool: state.activeSidebarTool === activeSidebarTool ? null : activeSidebarTool,
    })),

  setSelectedCloud: (id: string | null) =>
    set((state) => ({
      layers: { ...state.layers, selectedCloudId: id },
    })),

  setSelectedAtmosphereLayer: (layer: AtmosphereLayerId | null) =>
    set((state) => ({
      layers: { ...state.layers, selectedAtmosphereLayer: layer },
    })),

  setAtmosphereOpacity: (opacity: number) =>
    set((state) => ({
      layers: { ...state.layers, atmosphereOpacity: opacity },
    })),

  setAtmosphereObjectsSpeed: (speed: number) =>
    set((state) => ({
      layers: {
        ...state.layers,
        atmosphereObjectsSpeed: speed,
        atmosphereObjectsFixed: speed <= 0.001,
      },
    })),

  setMapColorTheme: (theme: 'satellite' | 'hypsometric') => {
    const current = get().layers.mapColorTheme;
    if (current === theme) return;
    get().triggerSystemLoading(
      theme === 'hypsometric'
        ? 'Aplicando Mapa Físico Hipsométrico 3D'
        : 'Aplicando Mapa de Satélite NASA HD',
      'Atualizando shaders de relevo continental e batimetria oceânica...',
      850,
      () =>
        set((state) => ({
          layers: { ...state.layers, mapColorTheme: theme },
        }))
    );
  },

  setMountainDisplacementScale: (scale: number) =>
    set((state) => ({
      layers: { ...state.layers, mountainDisplacementScale: scale },
    })),

  toggleLayer: (key: keyof LayerSettings) =>
    set((state) => {
      const nextVal = !state.layers[key];
      const nextLayers: LayerSettings = { ...state.layers, [key]: nextVal };

      if (key === 'showAtmosphereLayers') {
        nextLayers.showTroposphere = nextVal;
        nextLayers.showStratosphere = nextVal;
        nextLayers.showMesosphere = nextVal;
        nextLayers.showThermosphere = nextVal;
        nextLayers.showExosphere = nextVal;
        if (nextVal) {
          nextLayers.showAtmosphereObjects = true;
        }
      } else if (
        key === 'showTroposphere' ||
        key === 'showStratosphere' ||
        key === 'showMesosphere' ||
        key === 'showThermosphere' ||
        key === 'showExosphere'
      ) {
        nextLayers.showAtmosphereLayers =
          nextLayers.showTroposphere ||
          nextLayers.showStratosphere ||
          nextLayers.showMesosphere ||
          nextLayers.showThermosphere ||
          nextLayers.showExosphere;
      } else if (key === 'showAtmosphereLabels' && nextVal) {
        if (!nextLayers.showAtmosphereObjects && !nextLayers.showAtmosphereLayers) {
          nextLayers.showAtmosphereObjects = true;
        }
      } else if (key === 'showClouds3D') {
        if (nextVal && !nextLayers.showCloudsHigh && !nextLayers.showCloudsMiddle && !nextLayers.showCloudsLow && !nextLayers.showCloudsVertical) {
          nextLayers.showCloudsHigh = true;
          nextLayers.showCloudsMiddle = true;
          nextLayers.showCloudsLow = true;
          nextLayers.showCloudsVertical = true;
        }
      } else if (
        (key === 'showCloudsHigh' || key === 'showCloudsMiddle' || key === 'showCloudsLow' || key === 'showCloudsVertical') &&
        nextVal
      ) {
        nextLayers.showClouds3D = true;
      } else if (key === 'showConstellationLines' && nextVal) {
        nextLayers.showConstellations = true;
      }

      return { layers: nextLayers };
    }),

  setLayer: (key: keyof LayerSettings, val: any) =>
    set((state) => {
      const nextLayers: LayerSettings = { ...state.layers, [key]: val };

      if (key === 'showConstellationLines' && val) {
        nextLayers.showConstellations = true;
      } else if (key === 'showAtmosphereLayers') {
        nextLayers.showTroposphere = val;
        nextLayers.showStratosphere = val;
        nextLayers.showMesosphere = val;
        nextLayers.showThermosphere = val;
        nextLayers.showExosphere = val;
        if (val) {
          nextLayers.showAtmosphereObjects = true;
        }
      } else if (
        key === 'showTroposphere' ||
        key === 'showStratosphere' ||
        key === 'showMesosphere' ||
        key === 'showThermosphere' ||
        key === 'showExosphere'
      ) {
        nextLayers.showAtmosphereLayers =
          nextLayers.showTroposphere ||
          nextLayers.showStratosphere ||
          nextLayers.showMesosphere ||
          nextLayers.showThermosphere ||
          nextLayers.showExosphere;
      } else if (key === 'showAtmosphereLabels' && val) {
        if (!nextLayers.showAtmosphereObjects && !nextLayers.showAtmosphereLayers) {
          nextLayers.showAtmosphereObjects = true;
        }
      }

      return { layers: nextLayers };
    }),

  setAllLayers: (val: boolean) =>
    set((state) => {
      const nonToggleKeys = new Set<keyof LayerSettings>([
        'selectedCloudId',
        'selectedAtmosphereLayer',
        'atmosphereOpacity',
        'atmosphereObjectsSpeed',
        'atmosphereObjectsFixed',
        'mapColorTheme',
        'mountainDisplacementScale',
        'showExtraLands',
        'constellationLineColor',
        'constellationLineOpacity',
        'selectedConstellation',
      ]);
      const updated: Partial<LayerSettings> = {};
      (Object.keys(state.layers) as (keyof LayerSettings)[]).forEach((k) => {
        if (!nonToggleKeys.has(k) && typeof state.layers[k] === 'boolean') {
          (updated as any)[k] = val;
        }
      });
      return { layers: { ...state.layers, ...updated } };
    }),

  updateSettings: (partial: Partial<ModelSettings>) =>
    set((state) => {
      const nextSettings = { ...state.settings, ...partial };
      const locationChanged =
        (partial.observerLat !== undefined && Math.abs(partial.observerLat - state.settings.observerLat) > 1e-5) ||
        (partial.observerLng !== undefined && Math.abs(partial.observerLng - state.settings.observerLng) > 1e-5);

      if (locationChanged) {
        const offsetHrs = getLocationUtcOffsetHours(nextSettings.observerLat, nextSettings.observerLng);
        nextSettings.timeZone = formatUtcOffsetString(offsetHrs);
      }

      return {
        settings: nextSettings,
      };
    }),

  toggleSunLight: () =>
    set((state) => ({
      settings: {
        ...state.settings,
        sunLightEnabled: state.settings.sunLightEnabled === false ? true : false,
      },
    })),

  toggleMoonLight: () =>
    set((state) => ({
      settings: {
        ...state.settings,
        moonLightEnabled: state.settings.moonLightEnabled === false ? true : false,
      },
    })),

  toggleMapOnlyMode: () =>
    set((state) => ({
      mapOnlyMode: !state.mapOnlyMode,
      activeSidebarTool: null,
      selectedAstroId: null,
      showLightingPanel: false,
    })),

  setMapOnlyMode: (val: boolean) =>
    set(() => ({
      mapOnlyMode: val,
      activeSidebarTool: null,
      selectedAstroId: null,
      showLightingPanel: false,
    })),

  setIsLandingPortalOpen: (isLandingPortalOpen: boolean) =>
    set(() => ({ isLandingPortalOpen })),

  resetToNow: () =>
    set((state) => ({
      currentDate: getLocationCurrentWallClockDate(state.settings.observerLat, state.settings.observerLng),
    })),
}));
