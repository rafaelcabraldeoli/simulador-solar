import React, { useState } from 'react';
import {
  Compass,
  Eye,
  Sun,
  Moon,
  Sparkles,
  MapPin,
  X,
  Sliders,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import {
  calculateAstroPositions,
  geoToPlanarCoords,
  getDynamicHorizonDistance,
  calculateApparentCelestialSkyVector,
  getEclipseInfo,
} from '../../utils/astronomy';
import { sampleTerrainElevationNormalized, getGeographicElevationMeters } from '../../utils/textureGenerator';
import { AstroId } from '../../types';
import { ECLIPSE_CATALOG, EclipseEvent, findMatchingCatalogEclipse } from '../../data/eclipses';
import { GlobeViewConfig } from '../3D/GlobeCanvas';
import { getLocationUtcOffsetHours } from '../../data/cities';

interface HumanObserverHUDProps {
  isGlobeMode?: boolean;
  globeConfig?: GlobeViewConfig;
}

export const HumanObserverHUD: React.FC<HumanObserverHUDProps> = ({ isGlobeMode = false, globeConfig }) => {
  const {
    cameraMode,
    currentDate,
    setDate,
    settings,
    updateSettings,
    selectAstro,
    layers,
    toggleLayer,
    setActiveSidebarTool,
    activeSidebarTool,
    setCameraMode,
  } = useSimulationStore();

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const [showCompassBar, setShowCompassBar] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showTeleportBar, setShowTeleportBar] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentAzimuthDeg, setCurrentAzimuthDeg] = useState(0);
  const [currentPitchDeg, setCurrentPitchDeg] = useState(14);
  const [currentFov, setCurrentFov] = useState(44);
  const [eyeHeightMode, setEyeHeightMode] = useState<'ground' | 'high'>('ground');
  const [showAllEclipsesModal, setShowAllEclipsesModal] = useState(false);
  const [eclipseModalFilter, setEclipseModalFilter] = useState<'all' | 'solar' | 'lunar'>('all');
  const [teleportToast, setTeleportToast] = useState<{ message: string; sub: string; flag: string } | null>(null);

  React.useEffect(() => {
    const onSyncAngles = (e: Event) => {
      const detail = (e as CustomEvent<{ azimuthDeg?: number; pitchDeg?: number }>).detail;
      if (detail) {
        if (typeof detail.azimuthDeg === 'number') setCurrentAzimuthDeg(detail.azimuthDeg);
        if (typeof detail.pitchDeg === 'number') setCurrentPitchDeg(detail.pitchDeg);
      }
    };
    window.addEventListener('human-camera-angles-sync', onSyncAngles);
    return () => window.removeEventListener('human-camera-angles-sync', onSyncAngles);
  }, []);

  // Key cities and mountain/plain landmarks for quick teleport
  const featuredCities = [
    { name: 'São Paulo, Brasil', lat: -23.5505, lng: -46.6333, flag: '🇧🇷' },
    { name: 'Brasília, Brasil', lat: -15.7975, lng: -47.8919, flag: '🇧🇷' },
    { name: 'Monte Everest (Himalaias)', lat: 27.9881, lng: 86.9250, flag: '🏔️' },
    { name: 'Monte Aconcágua (Andes)', lat: -32.6532, lng: -70.0109, flag: '⛰️' },
    { name: 'Monte Branco (Alpes)', lat: 45.8326, lng: 6.8652, flag: '🏔️' },
    { name: 'Monte Quilimanjaro (África)', lat: -3.0674, lng: 37.3556, flag: '🌋' },
    { name: 'Monte Denali (Alasca)', lat: 63.0692, lng: -151.0070, flag: '❄️' },
    { name: 'Planície Amazônica (Manaus)', lat: -3.1190, lng: -60.0217, flag: '🌳' },
    { name: 'Quito (Andes / Equador)', lat: -0.1807, lng: -78.4678, flag: '🇪🇨' },
    { name: 'Nova York, EUA', lat: 40.7128, lng: -74.006, flag: '🇺🇸' },
    { name: 'Londres, Reino Unido', lat: 51.5074, lng: -0.1278, flag: '🇬🇧' },
    { name: 'Cairo, Egito', lat: 30.0444, lng: 31.2357, flag: '🇪🇬' },
    { name: 'Tóquio, Japão', lat: 35.6762, lng: 139.6503, flag: '🇯🇵' },
    { name: 'Sydney, Austrália', lat: -33.8688, lng: 151.2093, flag: '🇦🇺' },
    { name: 'Polo Norte (Ártico)', lat: 89.9, lng: 0.0, flag: '❄️' },
  ];

  const isHumanActive = isGlobeMode
    ? globeConfig?.globeCameraPreset === 'human_surface'
    : cameraMode === 'human';

  if (!isHumanActive) {
    return null;
  }

  // Calculate local astronomical status
  const positions = calculateAstroPositions(currentDate, settings);
  const sunState = positions.sun;
  const moonState = positions.moon;
  const rahuState = positions.rahu;
  const ketuState = positions.ketu;
  const eclipseInfo = getEclipseInfo(
    sunState,
    moonState,
    rahuState,
    ketuState,
    isGlobeMode ? 'moon_eclipses_sun' : settings.eclipseTheory,
    currentDate,
    settings.observerLat,
    settings.observerLng
  );

  const obsGround = geoToPlanarCoords(settings.observerLat, settings.observerLng);
  const approxMetersElev = getGeographicElevationMeters(settings.observerLat, settings.observerLng);

  const horizonGeo = getDynamicHorizonDistance(settings.observerLat, settings.observerLng, currentDate);
  const sunSky = calculateApparentCelestialSkyVector(
    sunState,
    obsGround,
    40.0,
    horizonGeo.horizonDist,
    horizonGeo.maxCulminationDeg,
    horizonGeo.haRad
  );
  const isMoonEclipsingSun = (isGlobeMode || settings.eclipseTheory === 'moon_eclipses_sun') && eclipseInfo.isSolarEclipseActive;
  const moonMaxCulm = isMoonEclipsingSun ? horizonGeo.maxCulminationDeg : 65.0;
  const moonSky = calculateApparentCelestialSkyVector(
    moonState,
    obsGround,
    isMoonEclipsingSun ? 39.2 : 40.0,
    horizonGeo.horizonDist,
    moonMaxCulm,
    horizonGeo.haRad,
    isMoonEclipsingSun ? true : false
  );

  // In Spherical Globe Theory, compute exact spherical solar & lunar elevation from latitude, declination, and hour angle
  let sunElevDeg = sunSky.altitudeDeg;
  let moonElevDeg = isMoonEclipsingSun ? sunElevDeg : moonSky.altitudeDeg;

  if (isGlobeMode) {
    const startOfYear = Date.UTC(currentDate.getUTCFullYear(), 0, 0);
    const dayOfYr = (currentDate.getTime() - startOfYear) / 86400000;
    const tiltDeg = globeConfig?.axialTiltDeg ?? 23.44;
    const tiltRad = (tiltDeg * Math.PI) / 180;
    const decRad = Math.asin(Math.sin(tiltRad) * Math.cos(((dayOfYr - 172) / 365.25) * Math.PI * 2));
    const obsUtcOffsetHrs = getLocationUtcOffsetHours(settings.observerLat, settings.observerLng);
    const localClockHrs =
      currentDate.getHours() +
      currentDate.getMinutes() / 60 +
      currentDate.getSeconds() / 3600 +
      currentDate.getMilliseconds() / 3600000;
    const utcHrs = ((localClockHrs - obsUtcOffsetHrs) % 24 + 24) % 24;
    const subsolarLngDeg = (12.0 - utcHrs) * 15.0;
    const haRad = ((settings.observerLng - subsolarLngDeg) * Math.PI) / 180;
    const latRad = (settings.observerLat * Math.PI) / 180;
    const sinSunAlt = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
    sunElevDeg = (Math.asin(Math.max(-1, Math.min(1, sinSunAlt))) * 180) / Math.PI;

    // Exact 3D Lunar elevation matching GlobeCanvas Human Surface View
    const solsticeRefMs = Date.UTC(2026, 11, 21, 0, 0, 0);
    const earthOrbitAngle = ((currentDate.getTime() - solsticeRefMs) / (86400000 * 365.256363)) * Math.PI * 2;
    const earthX = Math.cos(earthOrbitAngle) * 260.0;
    const earthZ = -Math.sin(earthOrbitAngle) * 260.0;
    const angleEarthToSun = Math.atan2(-earthX, -earthZ);
    const spinRotY = angleEarthToSun - (subsolarLngDeg * Math.PI) / 180;

    // Observer normal in world space (after spin Y and axial tilt Z = -tiltRad)
    const cosLat = Math.cos(latRad);
    const sinLat = Math.sin(latRad);
    const lngRad = (settings.observerLng * Math.PI) / 180;
    const localX = cosLat * Math.sin(lngRad);
    const localY = sinLat;
    const localZ = cosLat * Math.cos(lngRad);

    // Apply spinRotY around Y
    const cosSpin = Math.cos(spinRotY);
    const sinSpin = Math.sin(spinRotY);
    const spunX = localX * cosSpin + localZ * sinSpin;
    const spunY = localY;
    const spunZ = -localX * sinSpin + localZ * cosSpin;

    // Apply tilt around Z (-tiltRad)
    const cosTilt = Math.cos(-tiltRad);
    const sinTilt = Math.sin(-tiltRad);
    const normX = spunX * cosTilt - spunY * sinTilt;
    const normY = spunX * sinTilt + spunY * cosTilt;
    const normZ = spunZ;

    // Moon geocentric unit vector from lunarNodalPrecession
    const refEclipseMs = Date.UTC(2026, 7, 12, 17, 47, 0);
    const deltaDays = (currentDate.getTime() - refEclipseMs) / 86400000;
    const synodicDays = 29.530588853;
    const synodicProgress = ((deltaDays % synodicDays) + synodicDays) % synodicDays;
    const synodicPhaseRad = (synodicProgress / synodicDays) * Math.PI * 2;
    const sunGeoLonRad = earthOrbitAngle + Math.PI;
    const moonGeoLonRad = sunGeoLonRad + synodicPhaseRad;
    const refEarthAngle = ((refEclipseMs - solsticeRefMs) / (86400000 * 365.256363)) * Math.PI * 2;
    const omegaRad = refEarthAngle + Math.PI + ((deltaDays * (-19.3414 / 365.25)) * Math.PI) / 180;
    const uRad = moonGeoLonRad - omegaRad;
    const incRad = ((globeConfig?.lunarInclinationDeg ?? 5.14) * Math.PI) / 180;

    // Local orbital coords rotated by -incRad around X and omegaRad around Y
    const lx = Math.cos(uRad);
    const ly = Math.sin(uRad) * Math.sin(incRad);
    const lz = -Math.sin(uRad) * Math.cos(incRad);
    const mx = lx * Math.cos(omegaRad) + lz * Math.sin(omegaRad);
    const my = ly;
    const mz = -lx * Math.sin(omegaRad) + lz * Math.cos(omegaRad);

    const sinMoonAlt = normX * mx + normY * my + normZ * mz;
    moonElevDeg = (Math.asin(Math.max(-1, Math.min(1, sinMoonAlt))) * 180) / Math.PI;

    // In Spherical Globe Mode, if an active solar eclipse is occurring for this observer,
    // the Moon transits across the Sun so its altitude matches the Sun!
    const catalogEclipse = findMatchingCatalogEclipse(currentDate);
    if (catalogEclipse?.type === 'solar') {
      const diffSec = (currentDate.getTime() - catalogEclipse.date.getTime()) / 1000;
      const dLatRad = (settings.observerLat - catalogEclipse.lat) * (Math.PI / 180);
      const dLngRad = (settings.observerLng - catalogEclipse.lng) * (Math.PI / 180);
      const cLat1 = Math.cos(settings.observerLat * (Math.PI / 180));
      const cLat2 = Math.cos(catalogEclipse.lat * (Math.PI / 180));
      const hav = Math.sin(dLatRad / 2) ** 2 + cLat1 * cLat2 * Math.sin(dLngRad / 2) ** 2;
      const geoDistDeg = 2 * Math.asin(Math.sqrt(Math.min(1.0, hav))) * (180 / Math.PI);
      if (Math.abs(diffSec) <= 4500 && geoDistDeg <= 35.0) {
        moonElevDeg = sunElevDeg;
      }
    }
  }

  // Daylight state based on apparent solar altitude
  const isDaylight = sunElevDeg > 0;
  const isTwilight = sunElevDeg <= 0 && sunElevDeg >= -6.0;

  const handleLookAtAstro = (astroId: AstroId) => {
    selectAstro(astroId);
    window.dispatchEvent(new CustomEvent('human-look-at-astro', { detail: { astroId } }));
    window.dispatchEvent(new CustomEvent('globe-human-look-at-astro', { detail: { astroId } }));
  };

  const handleTeleportToEclipse = (eclipse: EclipseEvent) => {
    if (!eclipse) return;

    // 1. Pause playback so the simulation doesn't immediately advance away from totality
    useSimulationStore.setState({ isPlaying: false });

    // 2. Set observer coordinates and biome
    updateSettings({
      observerLat: eclipse.lat,
      observerLng: eclipse.lng,
      observerLocationName: `${eclipse.locationName}`,
      observerBiome: eclipse.biome || 'field',
    });

    // 3. Set the date accurately from eclipse.date
    setDate(new Date(eclipse.date.getTime()));

    // 4. Ensure Human mode is active
    if (isGlobeMode) {
      window.dispatchEvent(
        new CustomEvent('globe-set-camera-preset', {
          detail: { preset: 'human_surface' },
        })
      );
    } else {
      setCameraMode('human');
    }
    
    // 5. Toast feedback
    setTeleportToast({
      message: `Teletransportado para ${eclipse.locationName} (${eclipse.flag})`,
      sub: `${eclipse.dateFormatted} às ${eclipse.timeFormatted} • Câmera focando no ${eclipse.type === 'solar' ? 'Sol Eclipsado' : 'na Lua de Sangue'}!`,
      flag: eclipse.flag,
    });

    const targetAstro = eclipse.type === 'solar' ? 'sun' : 'moon';

    // 6. Look directly at the eclipsed astro (immediate and with settle passes)
    handleLookAtAstro(targetAstro);

    setTimeout(() => {
      handleLookAtAstro(targetAstro);
    }, 150);

    setTimeout(() => {
      handleLookAtAstro(targetAstro);
    }, 450);

    setTimeout(() => {
      setTeleportToast(null);
    }, 6000);
  };

  const handleSimulateSolarEclipse = () => {
    // Teleport directly to the 2026 Spain/Norway Total Solar Eclipse or 2024 Great Eclipse
    const target = ECLIPSE_CATALOG.find((e) => e.id === 'solar-2026-spain-norway') || ECLIPSE_CATALOG[0];
    handleTeleportToEclipse(target);
  };

  const handleSimulateLunarEclipse = () => {
    // Teleport directly to the nocturnal Blood Moon Eclipse (Brasil 2025 at 03:30 night)
    const target = ECLIPSE_CATALOG.find((e) => e.id === 'lunar-2025-brasil-night') || ECLIPSE_CATALOG.find((e) => e.type === 'lunar') || ECLIPSE_CATALOG[0];
    handleTeleportToEclipse(target);
  };

  const handleSetHeading = (headingDeg: number, pitchDeg: number = 14) => {
    const azRad = (headingDeg * Math.PI) / 180;
    const pitchRad = (pitchDeg * Math.PI) / 180;
    setCurrentAzimuthDeg(headingDeg);
    setCurrentPitchDeg(pitchDeg);
    window.dispatchEvent(new CustomEvent('human-look-angles', { detail: { azimuth: azRad, pitch: pitchRad } }));
    window.dispatchEvent(new CustomEvent('globe-human-look-angles', { detail: { azimuth: azRad, pitch: pitchRad } }));
  };

  const handleSetEyeHeight = (mode: 'ground' | 'high') => {
    setEyeHeightMode(mode);
    // In Planar Mode, the ground environment uses 0.00018 (1.75m solo) and 0.0009 (mirante alto)
    // In Globe Mode, the spherical surface uses 0.04 (1.75m solo) and 0.09 (mirante alto)
    const planarHeight = mode === 'high' ? 0.0009 : 0.00018;
    const globeHeight = mode === 'high' ? 0.09 : 0.04;
    window.dispatchEvent(new CustomEvent('human-set-eye-height', { detail: { height: planarHeight } }));
    window.dispatchEvent(new CustomEvent('globe-human-set-eye-height', { detail: { height: globeHeight } }));
  };

  const handleSetFov = (fov: number) => {
    setCurrentFov(fov);
    window.dispatchEvent(new CustomEvent('human-set-fov', { detail: { fov } }));
    window.dispatchEvent(new CustomEvent('globe-human-set-fov', { detail: { fov } }));
  };

  return (
    <div
      id="human-observer-hud"
      className="absolute inset-0 pointer-events-none z-20 select-none overflow-hidden"
    >
      {/* 1. TOP COMPASS & CARDINAL HEADING BAR (Closed by default on start, toggleable) */}
      {showCompassBar ? (
        <div
          id="hud-compass-bar"
          className="absolute top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex flex-col shadow-2xl shadow-black/80 rounded-2xl border border-sky-500/40 bg-slate-950/95 backdrop-blur-md overflow-hidden max-w-[calc(100vw-32px)]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3 py-1 bg-slate-900/90 border-b border-slate-800/80 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            <div className="flex items-center gap-1.5 text-cyan-400/90">
              <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>BÚSSOLA & ORIENTAÇÃO</span>
            </div>
            <button
              onClick={() => setShowCompassBar(false)}
              className="text-slate-400 hover:text-rose-300 p-0.5 rounded-lg hover:bg-rose-950/50 transition"
              title="Ocultar Bússola"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex items-center gap-2 px-3 py-1.5 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold text-xs shrink-0">
              <span>Bússola Local:</span>
            </div>

            <div className="flex items-center gap-1 text-xs shrink-0">
              <button
                onClick={() => handleSetHeading(0, currentPitchDeg)}
                className="px-2 py-0.5 rounded-lg bg-slate-900/90 hover:bg-sky-600/30 hover:text-sky-300 text-slate-300 border border-slate-700/60 font-mono transition"
                title="Olhar para o Norte (0°)"
              >
                N (0°)
              </button>
              <button
                onClick={() => handleSetHeading(90, currentPitchDeg)}
                className="px-2 py-0.5 rounded-lg bg-slate-900/90 hover:bg-sky-600/30 hover:text-sky-300 text-slate-300 border border-slate-700/60 font-mono transition"
                title="Olhar para o Leste (90°)"
              >
                L (90°)
              </button>
              <button
                onClick={() => handleSetHeading(180, currentPitchDeg)}
                className="px-2 py-0.5 rounded-lg bg-slate-900/90 hover:bg-sky-600/30 hover:text-sky-300 text-slate-300 border border-slate-700/60 font-mono transition"
                title="Olhar para o Sul (180°)"
              >
                S (180°)
              </button>
              <button
                onClick={() => handleSetHeading(270, currentPitchDeg)}
                className="px-2 py-0.5 rounded-lg bg-slate-900/90 hover:bg-sky-600/30 hover:text-sky-300 text-slate-300 border border-slate-700/60 font-mono transition"
                title="Olhar para o Oeste (270°)"
              >
                O (270°)
              </button>
            </div>

            <div className="h-3.5 w-px bg-slate-800 shrink-0" />

            {/* Quick Pitch Presets */}
            <div className="flex items-center gap-1 text-xs shrink-0">
              <button
                onClick={() => handleSetHeading(currentAzimuthDeg, 85)}
                className="px-2 py-0.5 rounded-lg bg-sky-950/60 hover:bg-sky-700/40 text-sky-200 border border-sky-600/40 text-[11px] font-medium transition"
                title="Olhar para o topo do céu (Zênite 90°)"
              >
                🌌 Zênite (Céu)
              </button>
              <button
                onClick={() => handleSetHeading(currentAzimuthDeg, 2)}
                className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-[11px] font-medium transition"
                title="Nivelar visão com a linha do horizonte"
              >
                👁️ Horizonte
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-1.5">
          <button
            id="btn-reopen-compass-bar"
            onClick={() => setShowCompassBar(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 text-cyan-300 hover:text-white hover:bg-cyan-950/70 shadow-xl shadow-black/80 text-xs font-semibold transition"
            title="Abrir Bússola & Orientação"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Bússola</span>
          </button>
        </div>
      )}

      {/* 2. LEFT OBSERVER STATUS CARD (Shifted +1% to the right/center) */}
      {showLeftPanel ? (
        <div
          id="hud-observer-panel"
          className="absolute top-14 left-2.5 sm:left-[calc(4rem+1%)] z-20 pointer-events-auto bg-slate-950/95 backdrop-blur-md border border-slate-800/90 rounded-2xl shadow-2xl shadow-black/80 w-[calc(100vw-20px)] sm:w-80 max-w-sm max-h-[calc(100vh-140px)] md:max-h-[calc(100vh-220px)] overflow-hidden flex flex-col"
        >
          {/* Top Panel Title Bar */}
          <div className="flex items-center justify-between px-3 py-1 bg-slate-900/90 border-b border-slate-800/80 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            <div className="flex items-center gap-1.5 text-cyan-400/90">
              <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>OBSERVADOR HUMANO</span>
            </div>
          </div>

          <div className="p-3.5 overflow-y-auto scrollbar-thin flex flex-col">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isDaylight ? 'bg-amber-400' : isTwilight ? 'bg-orange-400' : 'bg-indigo-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isDaylight ? 'bg-amber-500' : isTwilight ? 'bg-orange-500' : 'bg-indigo-500'
                  }`} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Observador Humano
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-900 transition"
                  title={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                >
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                <button
                  id="btn-close-observer-panel"
                  onClick={() => setShowLeftPanel(false)}
                  className="text-slate-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-950/50 hover:border-rose-800/60 border border-transparent transition"
                  title="Fechar quadro do Observador"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-sky-400 font-medium mb-1.5">
              <button
                onClick={() => setActiveSidebarTool(activeSidebarTool === 'location' ? null : 'location')}
                className="flex items-center gap-1.5 truncate hover:text-sky-200 transition group text-left"
                title="Clique para abrir o GPS / Seletor de Cidade e Coordenadas"
              >
                <MapPin className="w-3.5 h-3.5 shrink-0 text-rose-400 group-hover:scale-110 transition" />
                <span className="truncate underline decoration-sky-500/40 underline-offset-2">
                  {settings.observerLocationName || 'Posição Personalizada'}
                </span>
              </button>
              <span className="text-[10px] bg-slate-900 border border-slate-700/70 text-emerald-400 px-1.5 py-0.5 rounded font-mono shrink-0 ml-1">
                ⛰️ {approxMetersElev}m alt
              </span>
            </div>

            {/* GPS Coordinates & Quick Location / Pin Controls */}
            <div className="flex items-center justify-between gap-1.5 bg-slate-900/90 border border-slate-800/90 rounded-xl px-2.5 py-1.5 mb-2 text-[10px]">
              <span className="font-mono text-slate-300 truncate">
                GPS: {settings.observerLat.toFixed(2)}°, {settings.observerLng.toFixed(2)}°
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setActiveSidebarTool(activeSidebarTool === 'location' ? null : 'location')}
                  className="px-2 py-0.5 rounded bg-sky-600/30 hover:bg-sky-600/50 border border-sky-400/50 text-sky-200 font-semibold transition"
                  title="Abrir modal de GPS e Cidades"
                >
                  📍 Mudar GPS
                </button>
                {!isGlobeMode && (
                  <button
                    onClick={() => toggleLayer('showCoordinates')}
                    className={`px-1.5 py-0.5 rounded border font-semibold transition ${
                      layers.showCoordinates
                        ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title="Mostrar/Ocultar Pino GPS 3D no Mapa Planar"
                  >
                    Pino 3D
                  </button>
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="space-y-2 text-xs">
                {/* Active Eclipse Alert Badge */}
                {(eclipseInfo.isSolarEclipseActive || eclipseInfo.isLunarEclipseActive) && (
                  <div className={`p-2 rounded-xl border flex items-center gap-2 animate-pulse ${
                    eclipseInfo.isSolarEclipseActive
                      ? (eclipseInfo.eclipseType === 'solar_total'
                          ? 'bg-purple-950/90 border-purple-500/80 text-purple-100'
                          : 'bg-amber-950/85 border-amber-500/80 text-amber-200')
                      : 'bg-rose-950/85 border-rose-500/80 text-rose-200'
                  }`}>
                    <span className="text-base">
                      {eclipseInfo.isSolarEclipseActive
                        ? (eclipseInfo.eclipseType === 'solar_total' ? '👑' : (eclipseInfo.eclipsingBody === 'ketu' ? '⭕' : '🌑'))
                        : '🩸'}
                    </span>
                    <div>
                      <div className="font-bold text-[11px]">
                        {eclipseInfo.isSolarEclipseActive
                          ? (eclipseInfo.eclipseType === 'solar_total'
                              ? 'Eclipse Solar Total (Totalidade • Coroa Solar)'
                              : (eclipseInfo.eclipseType === 'solar_annular'
                                  ? 'Eclipse Solar Anular (Anel de Fogo)'
                                  : (eclipseInfo.solarEclipseMagnitude >= 0.40 && eclipseInfo.solarEclipseMagnitude <= 0.60
                                      ? `Eclipse Solar Parcial (Fase Meio Sol • ${(eclipseInfo.solarEclipseMagnitude * 100).toFixed(0)}%)`
                                      : `Eclipse Solar Parcial (${(eclipseInfo.solarEclipseMagnitude * 100).toFixed(0)}%)`)))
                          : 'Eclipse Lunar • Lua de Sangue!'}
                      </div>
                      <div className="text-[10px] opacity-90">
                        {eclipseInfo.isSolarEclipseActive
                          ? (eclipseInfo.eclipsingBody === 'moon'
                              ? `A Lua transita pelo Sol (${(eclipseInfo.solarEclipseMagnitude * 100).toFixed(0)}% de cobertura) • Transparente na atmosfera diurna ao entrar e sair`
                              : `${eclipseInfo.eclipsingBody === 'rahu' ? 'Rahu ☊ (Maior que o Sol • 108%)' : 'Ketu ☋ (Menor que o Sol • 76%)'} ocultando o Sol gradualmente (${(eclipseInfo.solarEclipseMagnitude * 100).toFixed(0)}% de cobertura)`)
                          : (settings.eclipseTheory === 'moon_eclipses_sun'
                              ? `Lua em oposição avermelhada / refração (${(eclipseInfo.lunarEclipseMagnitude * 100).toFixed(0)}%)`
                              : `Ketu ☋ na oposição lunar (${(eclipseInfo.lunarEclipseMagnitude * 100).toFixed(0)}%)`)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sky condition indicator */}
                <div className={`p-2 rounded-xl border flex items-center gap-2.5 ${
                  isDaylight
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                    : isTwilight
                    ? 'bg-orange-500/15 border-orange-500/40 text-orange-200'
                    : 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200'
                }`}>
                  {isDaylight ? (
                    <Sun className="w-5 h-5 text-amber-400 animate-spin-slow shrink-0" />
                  ) : isTwilight ? (
                    <Sparkles className="w-5 h-5 text-orange-400 shrink-0" />
                  ) : (
                    <Moon className="w-5 h-5 text-indigo-300 shrink-0" />
                  )}
                  <div>
                    <div className="font-bold">
                      {isDaylight
                        ? '☀️ Dia Pleno'
                        : isTwilight
                        ? '🌅 Crepúsculo (Poente/Aurora)'
                        : '🌌 Noite Estrelada'}
                    </div>
                    <div className="text-[11px] opacity-85">
                      {isDaylight
                        ? 'Sol visível com céu azul e nuvens'
                        : isTwilight
                        ? 'Céu em tons dourados no horizonte'
                        : 'Estrelas, planetas e lua brilhando'}
                    </div>
                  </div>
                </div>

                {/* Sun & Moon Elevations */}
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <div className="text-slate-400 flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-400" />
                      <span>Sol</span>
                    </div>
                    <div className="font-semibold text-slate-200 mt-0.5">
                      {sunElevDeg >= 0 ? `+${sunElevDeg.toFixed(1)}°` : `${sunElevDeg.toFixed(1)}°`}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {sunElevDeg >= 0 ? 'Acima do horizonte' : 'Abaixo do horizonte'}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <div className="text-slate-400 flex items-center gap-1">
                      <Moon className="w-3 h-3 text-sky-300" />
                      <span>Lua</span>
                    </div>
                    <div className="font-semibold text-slate-200 mt-0.5">
                      {moonElevDeg >= 0 ? `+${moonElevDeg.toFixed(1)}°` : `${moonElevDeg.toFixed(1)}°`}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {moonState.illuminatedPct ? `${moonState.illuminatedPct.toFixed(0)}% Iluminada` : 'Fase Lunar'}
                    </div>
                  </div>
                </div>

                {/* Human Horizon Explanation Note */}
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 text-[10px] text-slate-300 leading-relaxed space-y-1.5">
                  <div>
                    <span className="text-sky-300 font-semibold">👁️ Visão Humana (~5 km):</span> Ao nível do solo (1,75 m), o ponto de fuga e o horizonte visual do ser humano limitam-se a aproximadamente <strong>5 km</strong> de raio.
                  </div>
                  <div>
                    <span className="text-amber-300 font-semibold">☀️ Trajetória Aparente:</span> Dentro dessa janela visual humana, o Sol surge no <strong>Leste (90°)</strong>, atinge a culminação no topo do céu e desce em direção ao <strong>Oeste (270°)</strong>.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Reopen button for left panel */
        <button
          id="btn-reopen-observer-panel"
          onClick={() => {
            setShowLeftPanel(true);
            if (isMobile) setShowRightPanel(false);
          }}
          className="absolute top-14 left-24 sm:left-[calc(4rem+1%)] z-20 pointer-events-auto flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-sky-500/50 text-sky-300 hover:text-white hover:bg-sky-950/70 shadow-xl shadow-black/80 text-xs font-semibold transition"
          title="Abrir quadro do Observador Humano"
        >
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          <span>Observador</span>
        </button>
      )}

      {/* 3. RIGHT CONTROLS & SCENE CARD (Fixed Right-Side matching Image 2) */}
      {showRightPanel ? (
        <div
          id="hud-controls-panel"
          className="absolute top-14 right-2.5 sm:right-4 z-20 pointer-events-auto bg-slate-950/95 backdrop-blur-md border border-slate-800/90 rounded-2xl shadow-2xl shadow-black/80 w-[calc(100vw-20px)] sm:w-72 max-w-sm max-h-[calc(100vh-140px)] md:max-h-[calc(100vh-220px)] overflow-hidden flex flex-col"
        >
          {/* Top Panel Title Bar */}
          <div className="flex items-center justify-between px-3 py-1 bg-slate-900/90 border-b border-slate-800/80 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            <div className="flex items-center gap-1.5 text-cyan-400/90">
              <Sliders className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>CONTROLES & CENÁRIO</span>
            </div>
          </div>

          <div className="p-3 overflow-y-auto scrollbar-thin flex flex-col gap-2">
            {/* Header with Close button */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Controles & Cenário</span>
              </div>
              <button
                id="btn-close-controls-panel"
                onClick={() => setShowRightPanel(false)}
                className="text-slate-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-950/50 hover:border-rose-800/60 border border-transparent transition"
                title="Fechar quadro de Controles"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mt-0.5">
              Olhar Rápido:
            </div>

            <button
              id="btn-look-sun"
              onClick={() => handleLookAtAstro('sun')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition"
            >
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Olhar para o Sol ({sunElevDeg >= 0 ? `+${sunElevDeg.toFixed(0)}°` : 'Oculto'})</span>
            </button>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                id="btn-look-east"
                onClick={() => handleSetHeading(90, 10)}
                className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 border border-amber-600/40 text-[11px] font-semibold transition"
                title="Olhar diretamente para o Leste (90°) onde o Sol nasce"
              >
                <span>🌅</span>
                <span>Leste (Nascente)</span>
              </button>
              <button
                id="btn-look-west"
                onClick={() => handleSetHeading(270, 10)}
                className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl bg-orange-950/40 hover:bg-orange-900/60 text-orange-200 border border-orange-600/40 text-[11px] font-semibold transition"
                title="Olhar diretamente para o Oeste (270°) onde o Sol se põe"
              >
                <span>🌇</span>
                <span>Oeste (Poente)</span>
              </button>
            </div>

            <button
              id="btn-look-moon"
              onClick={() => handleLookAtAstro('moon')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                isMoonEclipsingSun
                  ? 'bg-amber-950/70 hover:bg-amber-900/80 border-amber-400 text-amber-200 shadow-md shadow-amber-950 animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700/80'
              }`}
            >
              <Moon className={`w-4 h-4 ${isMoonEclipsingSun ? 'text-amber-300' : 'text-sky-300'}`} />
              <span>
                {isMoonEclipsingSun 
                  ? `Olhar para a Lua (${moonElevDeg >= 0 ? `+${moonElevDeg.toFixed(0)}°` : 'Oculta'} • Eclipsando o Sol!)` 
                  : `Olhar para a Lua (${moonElevDeg >= 0 ? `+${moonElevDeg.toFixed(0)}°` : 'Oculta'})`}
              </span>
            </button>

            {!isGlobeMode && settings.eclipseTheory !== 'moon_eclipses_sun' && (
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  id="btn-look-rahu"
                  onClick={() => handleLookAtAstro('rahu')}
                  className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl border text-[11px] font-semibold transition ${
                    eclipseInfo.isSolarEclipseActive
                      ? 'bg-amber-950/70 hover:bg-amber-900/80 border-amber-400 text-amber-200 shadow-md shadow-amber-950 animate-pulse'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                  title="Rahu: Nódulo Norte ☊ (Ocultador do Eclipse Solar)"
                >
                  <span>🌑</span>
                  <span>Rahu ☊ {eclipseInfo.isSolarEclipseActive ? '(Eclipse!)' : ''}</span>
                </button>

                <button
                  id="btn-look-ketu"
                  onClick={() => handleLookAtAstro('ketu')}
                  className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl border text-[11px] font-semibold transition ${
                    eclipseInfo.isLunarEclipseActive
                      ? 'bg-rose-950/70 hover:bg-rose-900/80 border-rose-400 text-rose-200 shadow-md shadow-rose-950 animate-pulse'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                  title="Ketu: Nódulo Sul ☋ (Ocultador do Eclipse Lunar / Lua de Sangue)"
                >
                  <span>🩸</span>
                  <span>Ketu ☋ {eclipseInfo.isLunarEclipseActive ? '(Lua Sangue)' : ''}</span>
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-1 pt-0.5">
              <button
                onClick={() => handleLookAtAstro('venus')}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800 font-medium transition text-center"
              >
                🪐 Vênus
              </button>
              <button
                onClick={() => handleLookAtAstro('jupiter')}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800 font-medium transition text-center"
              >
                🪐 Júpiter
              </button>
            </div>

            {/* Simular Eclipses no Céu com Teletransporte de Local e Hora Exatos */}
            <div className="border-t border-slate-800/80 pt-2 mt-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>🌑</span>
                  <span>Teletransporte de Eclipses:</span>
                </span>
                <span className="text-[9px] text-sky-400 font-medium">Lugar & Hora Exatos</span>
              </div>

              <div className="space-y-1.5">
                {/* 1. Nocturnal Blood Moon Eclipse - Brasil 2025 */}
                <button
                  id="btn-teleport-bloodmoon-night"
                  onClick={() => {
                    const ec = ECLIPSE_CATALOG.find((e) => e.id === 'lunar-2025-brasil-night') || ECLIPSE_CATALOG.find((e) => e.type === 'lunar') || ECLIPSE_CATALOG[0];
                    handleTeleportToEclipse(ec);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/60 text-rose-200 text-xs font-semibold transition group shadow-md shadow-rose-950/30"
                  title="Teletransportar para o Brasil na madrugada de 14/03/2025 às 03:30 (Céu Noturno Estrelado • Lua de Sangue no alto do céu)"
                >
                  <div className="flex items-center gap-1.5 text-left truncate">
                    <span className="text-sm shrink-0">🇧🇷 🩸</span>
                    <div className="truncate">
                      <div className="truncate text-[11px] font-bold text-rose-200">Lua de Sangue (Brasil • Noite)</div>
                      <div className="text-[9px] text-rose-300/80 font-mono">14/03/2025 • 03:30 Madrugada</div>
                    </div>
                  </div>
                  <span className="text-[9px] bg-rose-950/90 text-rose-300 border border-rose-600/50 px-1.5 py-0.5 rounded shrink-0 group-hover:bg-rose-600 group-hover:text-white transition font-medium">
                    Viajar
                  </span>
                </button>

                {/* 2. Spain / Iceland Total Solar Eclipse 2026 */}
                <button
                  id="btn-teleport-spain-solareclipse"
                  onClick={() => {
                    const ec = ECLIPSE_CATALOG.find((e) => e.id === 'solar-2026-spain-norway') || ECLIPSE_CATALOG[0];
                    handleTeleportToEclipse(ec);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/50 text-amber-200 text-xs font-semibold transition group"
                  title="Teletransportar para Espanha às 19:45 do dia 12/08/2026 durante o Eclipse Solar Total"
                >
                  <div className="flex items-center gap-1.5 text-left truncate">
                    <span className="text-sm shrink-0">🇪🇸 🌑</span>
                    <div className="truncate">
                      <div className="truncate text-[11px] font-bold">Solar Total (Espanha)</div>
                      <div className="text-[9px] text-amber-300/80">12/08/2026 • 19:45 La Coruña</div>
                    </div>
                  </div>
                  <span className="text-[9px] bg-amber-950/80 text-amber-300 border border-amber-600/40 px-1.5 py-0.5 rounded shrink-0 group-hover:bg-amber-600 group-hover:text-black transition">
                    Viajar
                  </span>
                </button>

                {/* 3. Luxor Egypt Eclipse of the Century 2027 */}
                <button
                  id="btn-teleport-egypt-solareclipse"
                  onClick={() => {
                    const ec = ECLIPSE_CATALOG.find((e) => e.id === 'solar-2027-egypt-luxor' || e.id === 'solar-2027-egypt') || ECLIPSE_CATALOG[1];
                    handleTeleportToEclipse(ec);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/50 text-amber-200 text-xs font-semibold transition group"
                  title="Teletransportar para Luxor, Egito às 12:05 do dia 02/08/2027 (Eclipse do Século 6m23s)"
                >
                  <div className="flex items-center gap-1.5 text-left truncate">
                    <span className="text-sm shrink-0">🇪🇬 👑</span>
                    <div className="truncate">
                      <div className="truncate text-[11px] font-bold">Eclipse do Século (Egito)</div>
                      <div className="text-[9px] text-amber-300/80">02/08/2027 • 12:05 Luxor (6m23s)</div>
                    </div>
                  </div>
                  <span className="text-[9px] bg-amber-950/80 text-amber-300 border border-amber-600/40 px-1.5 py-0.5 rounded shrink-0 group-hover:bg-amber-600 group-hover:text-black transition">
                    Viajar
                  </span>
                </button>

                {/* 4. Svalbard Norway Arctic Solar Eclipse 2015 */}
                <button
                  id="btn-teleport-svalbard-solareclipse"
                  onClick={() => {
                    const ec = ECLIPSE_CATALOG.find((e) => e.id === 'solar-2015-svalbard-norway') || ECLIPSE_CATALOG[8];
                    handleTeleportToEclipse(ec);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/50 text-cyan-200 text-xs font-semibold transition group"
                  title="Teletransportar para Svalbard, Noruega às 11:10 do dia 20/03/2015 (Eclipse Solar no Gelo Ártico)"
                >
                  <div className="flex items-center gap-1.5 text-left truncate">
                    <span className="text-sm shrink-0">🇳🇴 ❄️</span>
                    <div className="truncate">
                      <div className="truncate text-[11px] font-bold">Solar Ártico (Svalbard/Noruega)</div>
                      <div className="text-[9px] text-cyan-300/80">20/03/2015 • 11:10 Longyearbyen</div>
                    </div>
                  </div>
                  <span className="text-[9px] bg-cyan-950/80 text-cyan-300 border border-cyan-600/40 px-1.5 py-0.5 rounded shrink-0 group-hover:bg-cyan-600 group-hover:text-black transition">
                    Viajar
                  </span>
                </button>

                {/* 5. Button to Open Full Eclipse Catalog */}
                <button
                  id="btn-open-all-eclipses-modal"
                  onClick={() => setShowAllEclipsesModal(true)}
                  className="w-full mt-1 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-sky-600/30 to-indigo-600/30 hover:from-sky-600/50 hover:to-indigo-600/50 border border-sky-400/40 text-sky-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                  <span>Ver Todos os 11 Eclipses (Catálogo)</span>
                </button>
              </div>
            </div>

            {/* Sun Trajectory Explanation */}
            <div className="border-t border-slate-800/80 pt-2 mt-1">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2 text-[11px] text-amber-200">
                <div className="font-bold flex items-center gap-1 text-amber-300 mb-0.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Perspectiva Real no Solo:</span>
                </div>
                <div className="text-[10px] text-amber-200/90 leading-tight">
                  O Sol surge no horizonte <strong>Leste (90°)</strong>, passa por cima da sua região ao meio-dia (culminação) e desce suavemente até o horizonte <strong>Oeste (270°)</strong> onde se põe e some.
                </div>
              </div>
            </div>

            {/* Biome / Environment Ground Scene Selector */}
            <div className="border-t border-slate-800/80 pt-2 mt-1">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  🌿 Cenário & Montanhas:
                </span>
                <span className="text-[10px] text-sky-400 font-medium truncate ml-1">
                  {settings.observerBiome === 'tropical'
                    ? '⛰️ Pico da Neblina'
                    : settings.observerBiome === 'andes'
                    ? '🏔️ Cordilheira Andes'
                    : settings.observerBiome === 'mountain'
                    ? '🏔️ Picos Alpinos'
                    : settings.observerBiome === 'forest'
                    ? '🌲 Floresta'
                    : settings.observerBiome === 'beach'
                    ? '🏖️ Praia'
                    : settings.observerBiome === 'city'
                    ? '🏙️ Cidade'
                    : '🌾 Campo & Montanhas'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <button
                  onClick={() => updateSettings({ observerBiome: 'field' })}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition ${
                    (settings.observerBiome || 'field') === 'field'
                      ? 'bg-emerald-600/30 text-emerald-200 border-emerald-500 font-semibold'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                  title="Campo aberto com gramado, flores, colinas e cordilheira no horizonte"
                >
                  <span>🌾</span>
                  <span className="truncate">Campo & Montanhas</span>
                </button>

                <button
                  onClick={() => updateSettings({ observerBiome: 'tropical' })}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition ${
                    settings.observerBiome === 'tropical'
                      ? 'bg-emerald-600/30 text-emerald-200 border-emerald-500 font-semibold'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                  title="Pico da Neblina / Mata Tropical com árvores tropicais e picos de granito"
                >
                  <span>⛰️</span>
                  <span className="truncate">Pico Tropical</span>
                </button>

                <button
                  onClick={() => updateSettings({ observerBiome: 'andes' })}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition ${
                    settings.observerBiome === 'andes'
                      ? 'bg-amber-600/30 text-amber-200 border-amber-500 font-semibold'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                  title="Cordilheira dos Andes / Aconcágua com relva dourada e cumes rochosos"
                >
                  <span>🏔️</span>
                  <span className="truncate">Andes / Aconcágua</span>
                </button>

                <button
                  onClick={() => updateSettings({ observerBiome: 'forest' })}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition ${
                    settings.observerBiome === 'forest'
                      ? 'bg-emerald-700/30 text-emerald-200 border-emerald-500 font-semibold'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                  title="Clareira de floresta densa rodeada por pinheiros e carvalhos 3D"
                >
                  <span>🌲</span>
                  <span className="truncate">Floresta</span>
                </button>

                <button
                  onClick={() => updateSettings({ observerBiome: 'beach' })}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition ${
                    settings.observerBiome === 'beach'
                      ? 'bg-amber-600/30 text-amber-200 border-amber-500 font-semibold'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                  title="Orla de praia com areia, pier e coqueiros"
                >
                  <span>🏖️</span>
                  <span className="truncate">Praia / Litoral</span>
                </button>

                <button
                  onClick={() => updateSettings({ observerBiome: 'city' })}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition ${
                    settings.observerBiome === 'city'
                      ? 'bg-sky-600/30 text-sky-200 border-sky-500 font-semibold'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                  title="Terraço de observação urbano com skyline de edifícios e iluminação"
                >
                  <span>🏙️</span>
                  <span className="truncate">Mirante Urbano</span>
                </button>
              </div>
            </div>

            {/* Zoom / Field of View (FOV) & Optical Telescope */}
            <div className="border-t border-slate-800/80 pt-2 mt-1 flex flex-col gap-1.5 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  🔭 Telescópio de Zoom Óptico (Bola Borrada):
                </span>
                <span className="text-[10px] font-mono text-sky-300">FOV {currentFov.toFixed(0)}°</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => handleSetFov(46)}
                  className={`px-2 py-1 rounded-lg text-[10px] border transition ${
                    currentFov >= 35
                      ? 'bg-sky-600 text-white border-sky-400 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                  title="Visão a olho nu (1x)"
                >
                  👁️ 1x (Olho Nu)
                </button>
                <button
                  onClick={() => handleSetFov(18)}
                  className={`px-2 py-1 rounded-lg text-[10px] border transition ${
                    currentFov < 35 && currentFov > 11
                      ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                  title="Zoom óptico 50x na projeção do espelho"
                >
                  🔭 50x Zoom
                </button>
                <button
                  onClick={() => handleSetFov(8)}
                  className={`px-2 py-1 rounded-lg text-[10px] border transition ${
                    currentFov <= 11
                      ? 'bg-fuchsia-600 text-white border-fuchsia-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                  title="Zoom máximo 200x: mostra a estrela como uma bola brilhante borrada com luz no espelho líquido"
                >
                  ✨ 200x (Borrada)
                </button>
              </div>
            </div>

            {/* Eye Height & Vertical Ascent through Liquid Density Layers up to Oil-Water Mirror Line (Y = 68) */}
            <div className="border-t border-slate-800/80 pt-2 mt-1 flex flex-col gap-1.5 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  💧 Subida pelas Camadas de Densidade Líquida:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      handleSetEyeHeight('ground');
                      window.dispatchEvent(new CustomEvent('planar-set-density-altitude', { detail: { targetY: 0 } }));
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] border transition ${
                      eyeHeightMode === 'ground'
                        ? 'bg-sky-600 text-white border-sky-400 font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    🚶 Solo
                  </button>
                  <button
                    onClick={() => {
                      handleSetEyeHeight('high');
                      window.dispatchEvent(new CustomEvent('planar-set-density-altitude', { detail: { targetY: 0 } }));
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] border transition ${
                      eyeHeightMode === 'high'
                        ? 'bg-emerald-600 text-white border-emerald-400 font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    🦅 Mirante
                  </button>
                </div>
              </div>

              {!isGlobeMode && (
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() =>
                      window.dispatchEvent(new CustomEvent('planar-set-density-altitude', { detail: { targetY: 22 } }))
                    }
                    className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950/70 border border-cyan-500/30 text-[10px] text-cyan-200 font-medium transition"
                    title="Subir ao Estrato Líquido Denso (Y = 22)"
                  >
                    🌊 Líquido Denso (Y=22)
                  </button>
                  <button
                    onClick={() =>
                      window.dispatchEvent(new CustomEvent('planar-set-density-altitude', { detail: { targetY: 38 } }))
                    }
                    className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950/70 border border-cyan-500/30 text-[10px] text-cyan-200 font-medium transition"
                    title="Subir ao Estrato Líquido Médio (Y = 38)"
                  >
                    💧 Líquido Médio (Y=38)
                  </button>
                  <button
                    onClick={() =>
                      window.dispatchEvent(new CustomEvent('planar-set-density-altitude', { detail: { targetY: 54 } }))
                    }
                    className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-indigo-950/70 border border-indigo-500/40 text-[10px] text-indigo-200 font-medium transition"
                    title="Subir ao Estrato Líquido Leve (Y = 54)"
                  >
                    🫧 Líquido Leve (Y=54)
                  </button>
                  <button
                    onClick={() =>
                      window.dispatchEvent(new CustomEvent('planar-set-density-altitude', { detail: { targetY: 64 } }))
                    }
                    className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/60 text-[10px] text-amber-200 font-bold transition"
                    title="Subir até a Linha Plana de Água e Óleo (Espelho Cósmico Y = 68)"
                  >
                    🪞 Linha Água/Óleo (Y=68)
                  </button>
                </div>
              )}

              {/* Botões Diretos de Travessia Animada pelo Oceano Escuro */}
              {!isGlobeMode && (
                <div className="border-t border-slate-800/80 pt-2 mt-1 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                    🚢 Travessia pelo Oceano Escuro (Entre Bordas de Gelo):
                  </span>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => {
                        setCameraMode('earth');
                        setTimeout(() => {
                          window.dispatchEvent(
                            new CustomEvent('planar-camera-jump', {
                              detail: { radius: 175, phi: 0.92, theta: 0.45 },
                            })
                          );
                          window.dispatchEvent(
                            new CustomEvent('planar-start-ocean-voyage', {
                              detail: { targetWorldId: 'venus' },
                            })
                          );
                        }, 80);
                      }}
                      className="px-2 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/60 text-[10px] text-amber-200 font-bold transition flex items-center justify-center gap-1"
                    >
                      <span>🚢 Ir a Vênus</span>
                    </button>
                    <button
                      onClick={() => {
                        setCameraMode('earth');
                        setTimeout(() => {
                          window.dispatchEvent(
                            new CustomEvent('planar-camera-jump', {
                              detail: { radius: 175, phi: 0.92, theta: 0.45 },
                            })
                          );
                          window.dispatchEvent(
                            new CustomEvent('planar-start-ocean-voyage', {
                              detail: { targetWorldId: 'mars' },
                            })
                          );
                        }, 80);
                      }}
                      className="px-2 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/60 text-[10px] text-rose-200 font-bold transition flex items-center justify-center gap-1"
                    >
                      <span>🚢 Ir a Marte</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Reopen button for right panel */
        <button
          id="btn-reopen-controls-panel"
          onClick={() => {
            setShowRightPanel(true);
            if (isMobile) setShowLeftPanel(false);
          }}
          className="absolute top-14 right-2.5 sm:right-4 z-20 pointer-events-auto flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-emerald-500/50 text-emerald-300 hover:text-white hover:bg-emerald-950/70 shadow-xl shadow-black/80 text-xs font-semibold transition"
          title="Abrir quadro de Controles & Cenário"
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>Controles & Cenário</span>
        </button>
      )}

      {/* 4. QUICK CITY TELEPORT BAR (Centered on mobile, shifted -8% left on md+) */}
      {showTeleportBar ? (
        <div
          id="hud-teleport-bar"
          className="absolute bottom-[calc(68px+3%)] sm:bottom-[calc(96px+5%)] left-1/2 md:left-[42%] -translate-x-1/2 z-20 pointer-events-auto w-[calc(100%-1rem)] max-w-4xl bg-slate-950/95 backdrop-blur-md border border-slate-800/95 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col"
        >
          {/* Top Panel Title Bar */}
          <div className="flex items-center justify-between px-3 py-1 bg-slate-900/90 border-b border-slate-800/80 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            <div className="flex items-center gap-1.5 text-cyan-400/90">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>TELETRANSPORTE DO OBSERVADOR</span>
            </div>
          </div>

          <div className="p-2.5 flex flex-col">
            <div className="flex items-center justify-between gap-2 px-1.5 mb-1.5">
              <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                Teletransportar Observador Humano para:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  Arraste a tela para girar a visão 360°
                </span>
                <button
                  id="btn-close-teleport-bar"
                  onClick={() => setShowTeleportBar(false)}
                  className="text-slate-400 hover:text-white p-0.5 rounded-lg hover:bg-slate-800 transition"
                  title="Ocultar quadro de teletransporte"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
              {featuredCities.map((city) => {
                const isSelected =
                  Math.abs(settings.observerLat - city.lat) < 1.0 &&
                  Math.abs(settings.observerLng - city.lng) < 1.0;

                return (
                  <button
                    key={city.name}
                    onClick={() => {
                      updateSettings({
                        observerLat: city.lat,
                        observerLng: city.lng,
                        observerLocationName: city.name,
                      });
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-950 font-semibold'
                        : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <span>{city.flag}</span>
                    <span>{city.name.split(',')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Reopen teleport button */
        <div className="absolute bottom-[calc(68px+3%)] sm:bottom-[calc(96px+5%)] left-1/2 md:left-[42%] -translate-x-1/2 pointer-events-auto z-20">
          <button
            id="btn-reopen-teleport-bar"
            onClick={() => setShowTeleportBar(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/95 backdrop-blur-md border border-sky-500/50 text-sky-300 hover:text-white hover:bg-sky-950/80 shadow-xl shadow-black/80 text-xs font-semibold transition hover:scale-105"
            title="Abrir locais de teletransporte"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>Locais de Teletransporte</span>
          </button>
        </div>
      )}
      {/* Toast Notification for Instant Teleportation */}
      {teleportToast && (
        <div
          id="hud-teleport-toast"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto bg-slate-950/95 border border-sky-400/80 rounded-2xl p-4 shadow-2xl shadow-sky-950/60 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300 max-w-md w-[calc(100vw-32px)] flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400 flex items-center justify-center text-2xl shrink-0">
              {teleportToast.flag}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>{teleportToast.message}</span>
              </div>
              <div className="text-[11px] text-sky-200 mt-0.5">{teleportToast.sub}</div>
            </div>
          </div>
          <button
            onClick={() => setTeleportToast(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal / Overlay: Explorador Completo de Eclipses com Teletransporte */}
      {showAllEclipsesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">
                  🌑
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>Catálogo de Eclipses & Teletransporte</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Selecione qualquer evento histórico ou futuro para teletransportar para o lugar exato e hora exata
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAllEclipsesModal(false)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter tabs */}
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/30 flex items-center gap-2">
              <button
                onClick={() => setEclipseModalFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  eclipseModalFilter === 'all'
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                }`}
              >
                Todos ({ECLIPSE_CATALOG.length})
              </button>
              <button
                onClick={() => setEclipseModalFilter('solar')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  eclipseModalFilter === 'solar'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>🌑</span> Solares Totais ({ECLIPSE_CATALOG.filter((e) => e.type === 'solar').length})
              </button>
              <button
                onClick={() => setEclipseModalFilter('lunar')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  eclipseModalFilter === 'lunar'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>🩸</span> Luas de Sangue ({ECLIPSE_CATALOG.filter((e) => e.type === 'lunar').length})
              </button>
            </div>

            {/* Content List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
              {ECLIPSE_CATALOG.filter((e) => eclipseModalFilter === 'all' || e.type === eclipseModalFilter).map(
                (eclipse) => {
                  const isSolar = eclipse.type === 'solar';
                  return (
                    <div
                      key={eclipse.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSolar
                          ? 'bg-gradient-to-r from-amber-950/20 via-slate-900/90 to-slate-900/90 border-amber-500/30 hover:border-amber-400'
                          : 'bg-gradient-to-r from-rose-950/20 via-slate-900/90 to-slate-900/90 border-rose-500/30 hover:border-rose-400'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg shrink-0 ${
                            isSolar
                              ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
                              : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                          }`}
                        >
                          {eclipse.flag}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                isSolar
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              }`}
                            >
                              {isSolar ? '🌑 Solar Total' : '🩸 Lua de Sangue'}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-200">
                              {eclipse.dateFormatted} às {eclipse.timeFormatted}
                            </span>
                            <span className="text-[10px] text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800">
                              Duração: {eclipse.totalityDuration}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white">{eclipse.name}</div>
                          <div className="text-[11px] text-slate-300 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            <span>{eclipse.locationName}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug pt-0.5">{eclipse.description}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setShowAllEclipsesModal(false);
                          handleTeleportToEclipse(eclipse);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center justify-center gap-1.5 transition duration-150 hover:scale-105 active:scale-95 ${
                          isSolar
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                            : 'bg-rose-600 hover:bg-rose-500 text-white'
                        }`}
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Teletransportar</span>
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

