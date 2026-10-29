export type TheoryMode = 'planar' | 'globe';

export type CameraMode = 'earth' | 'human' | 'top' | 'sky' | 'side' | 'compare';

export type AstroId = 
  | 'sun' 
  | 'moon' 
  | 'rahu'
  | 'ketu'
  | 'mercury' 
  | 'venus' 
  | 'mars' 
  | 'jupiter' 
  | 'saturn' 
  | 'uranus' 
  | 'neptune';

export interface CelestialBodyData {
  id: AstroId;
  name: string;
  distanceKm: number; // Configurable model height/distance
  diameterKm: number;
  apparentSize: number; // 3D render radius
  color: string;
  orbitalPeriodDays: number; // orbital / zodiac period in days
  baseRadius: number; // Distance from polar center in 3D units
  altitudeLevel: number; // Layer order (1 to 10)
  magnitude: number;
  description: string;
  iconName: string;
  // Astrological & Rotational properties
  diurnalRotationHours: number; // Daily rotation cycle in hours
  zodiacTransitPeriod: string; // Time to traverse the 12 signs of the Zodiac
  timePerZodiacSign: string; // Average time in each astrological sign
  rulingSign: string; // Astrological rulership / domicile
  element: 'Fogo' | 'Terra' | 'Ar' | 'Água' | 'Luminar' | 'Transpessoal' | 'Ocultador';
  rotationDirection: 'Horário (Leste → Oeste)';
}

export interface AstroCalculatedState {
  id: AstroId;
  x: number;
  y: number; // height
  z: number;
  altitudeDeg: number; // observer horizon elevation
  azimuthDeg: number; // observer compass angle 0-360
  apparentRadius: number;
  phase?: number; // 0 to 1 for Moon
  phaseName?: string;
  illuminatedPct?: number;
}

export type AtmosphereLayerId =
  | 'troposphere'
  | 'stratosphere'
  | 'mesosphere'
  | 'thermosphere'
  | 'exosphere';

export interface LayerSettings {
  showSpaceBackground: boolean; // Abóbada Celeste (Firmamento de Estrelas & Polaris)
  showPlanets: boolean;
  showOrbits: boolean;
  showAstroNames: boolean;
  showAstroAltitudes: boolean;
  showGridLines: boolean;
  showConstellations: boolean;
  showNebulae: boolean;
  showExtraLands: boolean;
  showSolarFocus: boolean;
  showDynamicShadows: boolean;
  showRealisticWater: boolean;
  showAtmosphere: boolean;
  showAtmosphereLayers: boolean; // Estratificação visual 3D das 5 Camadas da Atmosfera
  showTroposphere: boolean; // 0 - 10 km
  showStratosphere: boolean; // 10 - 50 km
  showMesosphere: boolean; // 50 - 85 km
  showThermosphere: boolean; // 85 - 500 km
  showExosphere: boolean; // 500 - 10.000 km
  showAtmosphereObjects: boolean; // Avião comercial, Meteoros, ISS / EEI, Camada de Ozônio e Auroras
  showAtmosphereLabels: boolean; // Exibir nomes e rótulos dos objetos no céu (false = sem nome para não poluir a imagem da Terra)
  atmosphereObjectsFixed: boolean; // Manter estação espacial, satélites e aeronaves fixos/estacionários no céu
  atmosphereObjectsSpeed: number; // Multiplicador de velocidade quando em movimento (0.0 a 1.0, 0 = fixo)
  selectedAtmosphereLayer: AtmosphereLayerId | null;
  atmosphereOpacity: number; // 0.1 a 1.0 (transparência dos domos e halos)
  showClouds3D: boolean;
  showCloudsHigh: boolean;      // Cirrus, Cirrostratus, Cirrocumulus (6-13 km)
  showCloudsMiddle: boolean;    // Altocumulus, Altostratus, Nimbostratus (2-7 km)
  showCloudsLow: boolean;       // Cumulus, Stratocumulus, Stratus (0-2 km)
  showCloudsVertical: boolean;  // Cumulonimbus storm towers (0.5-14 km)
  selectedCloudId: string | null;
  showLiveWeather: boolean;     // Real-time Global Weather API overlay
  showLivePrecipitation: boolean; // 3D Live rain, snow & thunderstorm particles
  showCoordinates: boolean;
  showCityLights: boolean;
  showWorldCities: boolean;
  showZodiacBelt: boolean;
  showMountainRelief3D: boolean;     // Relevo topográfico 3D das montanhas elevando-se no plano
  showMountainPeaks: boolean;        // Marcadores tridimensionais dos picos culminantes (Everest, Aconcágua, etc.)
  mapColorTheme: 'satellite' | 'hypsometric'; // 'satellite': satélite HD natural; 'hypsometric': cores do mapa físico (verde=planície, amarelo=planalto, vermelho=montanhas altas)
  mountainDisplacementScale: number; // Escala vertical do relevo (1.0x a 4.0x)
  showOceanRoutes: boolean; // Setas nos oceanos mostrando a rota de nuvens e correntes marítimas no plano
  showConstellationLines: boolean; // Linhas conectoras das constelações (ligar/desligar)
  showConstellationLabels: boolean; // Nomes e rótulos das constelações
  constellationLineColor: 'cyan' | 'gold' | 'white' | 'magenta'; // Tonalidade das linhas celestes
  constellationLineOpacity: number; // Opacidade das linhas (0.2 a 1.0)
  selectedConstellation: string | null; // ID da constelação em destaque
  showOceanWaves: boolean; // Ondas em alto mar e arrebentação batendo na costa dos continentes
  oceanAgitationMode: 'dynamic' | 'calm' | 'storm'; // 'dynamic': agitação natural cíclica; 'calm': mar manso; 'storm': mar agitado contínuo
}

export interface ModelSettings {
  oceanWaveHeight?: number; // Multiplicador de altura das ondas e arrebentação (0.0 a 3.0x, padrão 1.0x)
  sunDistanceKm: number;
  moonDistanceKm: number;
  solarFocusAngleDeg: number;
  solarIntensity: number;
  sunLightEnabled: boolean; // true = Sol aceso / iluminando o plano; false = Luz do Sol apagada (escuridão total)
  moonLightEnabled: boolean; // true = Luar ativo refletindo luz solar; false = Luar apagado
  moonIntensity: number; // Intensidade luminosa do luar (0.0x a 3.0x, padrão: 0.8x)
  moonFocusAngleDeg: number; // Abertura do foco cônico lunar (padrão: 65°)
  cloudSpeed: number; // Cloud drift speed multiplier
  cloudAltitude: number; // Cloud layer altitude
  cloudScale?: number; // Escala individual de cada unidade de nuvem (padrão: 0.10 = 90% menor)
  cloudDensity?: number; // Densidade/número de unidades (+90% unidades)
  cloudStretch?: number; // Alongamento horizontal das nuvens (padrão: 1.5 = 50% mais esticadas)
  mapLightingMode: 'spotlight' | 'full_daylight' | 'balanced';
  ambientBrightness: number; // 0.2 to 1.0
  visualScale: boolean; // true = enlarged for visual clarity, false = proportional
  timeZone: string;
  distanceUnit: 'km' | 'au' | 'milhas';
  coordinateSystem: 'Plano (Azimutal)' | 'Equatorial' | 'Eclíptico';
  observerLat: number; // degrees (90=North Pole, 0=Equator, -90=Antarctic edge)
  observerLng: number; // degrees
  observerLocationName: string;
  observerBiome: 'field' | 'mountain' | 'tropical' | 'andes' | 'forest' | 'beach' | 'city';
  activePlanarWorld?: 'earth' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune';
  sunTrajectoryMode?: 'linear_horizon_5km' | 'perspective_arc'; // linear_horizon_5km: straight horizontal line crossing at 5km human visual radius
  eclipseTheory: 'rahu_ketu' | 'moon_eclipses_sun'; // 'rahu_ketu': Nódulos celestes Rahu e Ketu; 'moon_eclipses_sun': A própria Lua eclipsa o Sol
  language: 'pt-BR' | 'en' | 'es';
}

export interface SimulationState {
  theoryMode: TheoryMode;
  currentDate: Date;
  isPlaying: boolean;
  playbackSpeed: number; // 1, 10, 100, 1000, 86400 (1 day/s), 31536000 (1 year/s)
  cameraMode: CameraMode;
  selectedAstroId: AstroId | null;
  followAstroId: AstroId | null;
  showLightingPanel: boolean;
  activeTab: 'system' | 'astros' | 'calendar' | 'favorites' | 'more' | 'feedback';
  activeSidebarTool: 'location' | 'datetime' | 'notes' | 'layers' | 'clouds' | 'weather' | 'mountains' | 'atmosphere' | 'skyview' | 'measure' | 'settings' | 'constellations' | null;
  mapOnlyMode: boolean; // true = Modo Somente Mapa (oculta todos os painéis, menus, cartas e botões)
  layers: LayerSettings;
  settings: ModelSettings;
}
