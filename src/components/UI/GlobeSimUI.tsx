import React, { useState } from 'react';
import {
  Globe,
  Compass,
  Sun,
  SunMedium,
  Map,
  MapPin,
  Orbit,
  User,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Lock,
  Unlock,
  MessageSquarePlus,
} from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import {
  GlobeViewConfig,
  SOLAR_SYSTEM_PLANETS,
  PLANETARY_MOONS_CATALOG,
  SolarSystemTargetId,
} from '../3D/GlobeCanvas';
import { getDayOfYear } from '../../utils/astronomy';
import {
  calculateLunarOrbitWithNodalPrecession,
  computeAnnualEclipsesForYear,
  getContinuousEarthOrbitAngleRad,
  NODAL_PRECESSION_RATE_DEG_PER_YEAR,
} from '../../utils/lunarNodalPrecession';

interface GlobeSimUIProps {
  globeConfig: GlobeViewConfig;
  setGlobeConfig: React.Dispatch<React.SetStateAction<GlobeViewConfig>>;
}

export const GlobeSimUI: React.FC<GlobeSimUIProps> = ({ globeConfig, setGlobeConfig }) => {
  const {
    theoryMode,
    setTheoryMode,
    currentDate,
    settings,
    layers,
    toggleSunLight,
    toggleMapOnlyMode,
    toggleLayer,
    setMapColorTheme,
    updateSettings,
    setActiveSidebarTool,
    activeSidebarTool,
    triggerSystemLoading,
    setIsLandingPortalOpen,
    setActiveTab,
  } = useSimulationStore();

  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  const isSunLit = settings.sunLightEnabled !== false;
  const isFullDaylight = settings.mapLightingMode === 'full_daylight';

  // Calculate real-time spherical astronomy metrics
  const dayOfYear = getDayOfYear(currentDate);
  const seasonalAngle = ((dayOfYear - 172) / 365.25) * Math.PI * 2;
  const tiltRad = ((globeConfig.axialTiltDeg ?? 23.44) * Math.PI) / 180;
  const solarDeclinationDeg = (Math.asin(Math.sin(tiltRad) * Math.cos(seasonalAngle)) * 180) / Math.PI;

  const utcHours =
    currentDate.getUTCHours() +
    currentDate.getUTCMinutes() / 60 +
    currentDate.getUTCSeconds() / 3600;
  let subsolarLng = (12.0 - utcHours) * 15.0;
  if (subsolarLng > 180) subsolarLng -= 360;
  if (subsolarLng < -180) subsolarLng += 360;

  const equatorialSpeedKmh = 1674.4;
  const observerLatRad = (settings.observerLat * Math.PI) / 180;
  const observerRotationSpeedKmh = Math.round(equatorialSpeedKmh * Math.cos(observerLatRad));

  // Real-time Lunar Nodal Precession & Annual Eclipse Season Telemetry (4 to 7 eclipses/year)
  const earthOrbitAngle = getContinuousEarthOrbitAngleRad(currentDate);
  const lunarTelemetry = calculateLunarOrbitWithNodalPrecession(
    currentDate,
    earthOrbitAngle,
    60.336,
    globeConfig.lunarInclinationDeg ?? 5.14
  );
  const currentYear = currentDate.getUTCFullYear();
  const annualEclipses = computeAnnualEclipsesForYear(currentYear, globeConfig.lunarInclinationDeg ?? 5.14);

  const cameraPresets: { id: GlobeViewConfig['globeCameraPreset']; label: string; shortLabel: string }[] = [
    { id: 'solar_system', label: 'Sistema Solar 3D', shortLabel: 'Sist. Solar' },
    { id: 'earth_and_sun', label: 'Terra + Sol', shortLabel: 'Terra+Sol' },
    { id: 'orbit', label: 'Globo Terrestre', shortLabel: 'Terra 3D' },
    { id: 'tilt_side', label: 'Inclinação 23,4°', shortLabel: 'Eixo 23,4°' },
    { id: 'observer_close', label: 'Focar GPS', shortLabel: 'GPS' },
    { id: 'human_surface', label: 'Visão Humana', shortLabel: 'Humana' },
    { id: 'north_pole', label: 'Polo Norte', shortLabel: 'P. Norte' },
    { id: 'south_pole', label: 'Polo Sul (Antártida)', shortLabel: 'P. Sul' },
  ];

  const solarSystemTargets: { id: SolarSystemTargetId; label: string; badge: string }[] = [
    { id: 'solar_system', label: 'Sistema Solar', badge: '🌌' },
    { id: 'sun', label: 'Sol (Centro)', badge: '☀️' },
    { id: 'mercury', label: 'Mercúrio', badge: '🪨' },
    { id: 'venus', label: 'Vênus', badge: '🟡' },
    { id: 'earth', label: 'Terra', badge: '🌍' },
    { id: 'moon', label: 'Lua', badge: '🌙' },
    { id: 'mars', label: 'Marte', badge: '🔴' },
    { id: 'jupiter', label: 'Júpiter', badge: '🟠' },
    { id: 'saturn', label: 'Saturno', badge: '🪐' },
    { id: 'uranus', label: 'Urano', badge: '🔵' },
    { id: 'neptune', label: 'Netuno', badge: '🔷' },
  ];

  const selectedPlanetSpec = SOLAR_SYSTEM_PLANETS.find((p) => p.id === globeConfig.focusedBody);

  return (
    <>
      {/* 1. Top Toolbar with Theory Mode Switcher & Globe Camera Presets */}
      <div
        id="globe-camera-toolbar"
        className="absolute top-[max(0.5rem,env(safe-area-inset-top))] sm:top-2.5 left-1/2 -translate-x-1/2 z-30 flex flex-wrap items-center justify-center gap-1 bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-2xl px-2 py-1 shadow-2xl shadow-black/70 pointer-events-auto w-max max-w-[calc(100vw-16px)]"
      >
        {/* 0. Seletor Principal de Modelo: Teoria Planar vs Teoria Terra Redonda + Início */}
        <div className="flex items-center gap-0.5 bg-slate-900/95 border border-slate-700/80 rounded-full p-0.5 shrink-0">
          <button
            id="btn-open-portal-globe"
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
            title="Voltar para o Simulador Plano (Modelo da Terra Plana 3D)"
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
            title="Simulador Esférico (Modelo Heliocêntrico 3D)"
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

        {/* 1. Globe & Solar System Camera Presets */}
        <div className="flex items-center gap-0.5 shrink-0">
          {cameraPresets.map((preset) => {
            const isActive = globeConfig.globeCameraPreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  if (globeConfig.globeCameraPreset === preset.id) return;
                  triggerSystemLoading(
                    `Carregando ${preset.label} (Simulador Esférico)`,
                    preset.id === 'human_surface'
                      ? 'Construindo horizonte tangente esférico e bioma em 1ª pessoa...'
                      : 'Reposicionando câmera astronômica e órbitas heliocêntricas...',
                    preset.id === 'human_surface' || globeConfig.globeCameraPreset === 'human_surface' ? 1100 : 800,
                    () =>
                      setGlobeConfig((prev) => ({
                        ...prev,
                        globeCameraPreset: preset.id,
                        focusedBody: preset.id === 'solar_system' ? 'solar_system' : 'earth',
                      }))
                  );
                }}
                title={preset.label}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition duration-200 shrink-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600/40 text-indigo-200 border border-indigo-400 font-semibold shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                {preset.id === 'human_surface' ? (
                  <User className="w-3.5 h-3.5 shrink-0" />
                ) : preset.id === 'observer_close' ? (
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                ) : preset.id === 'solar_system' ? (
                  <Orbit className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                ) : (
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{preset.shortLabel}</span>
              </button>
            );
          })}
        </div>

        <div className="h-3.5 w-px bg-slate-800 mx-0.5 shrink-0 hidden sm:block" />

        {/* 2. Lock Camera to Earth Rotation */}
        <button
          onClick={() =>
            setGlobeConfig((prev) => ({
              ...prev,
              lockCameraToEarthRotation: !prev.lockCameraToEarthRotation,
            }))
          }
          title="Travar câmera para girar junto com a rotação da Terra ou manter câmera livre vendo a Terra girar"
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition duration-200 border shrink-0 whitespace-nowrap ${
            globeConfig.lockCameraToEarthRotation
              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 font-bold'
              : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-700/80'
          }`}
        >
          {globeConfig.lockCameraToEarthRotation ? (
            <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          ) : (
            <Unlock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          <span>
            {globeConfig.lockCameraToEarthRotation ? 'Gira c/ Terra' : 'Ver Girar'}
          </span>
        </button>

        {/* 3. Sun Light On/Off */}
        <button
          onClick={() => toggleSunLight()}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition duration-200 border shrink-0 whitespace-nowrap ${
            isSunLit
              ? 'bg-slate-900 hover:bg-slate-850 text-amber-300 border-amber-500/40'
              : 'bg-red-950/70 text-red-300 border-red-500/70 font-bold'
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

        {/* 4. Full Daylight vs Terminator 50/50 */}
        <button
          onClick={() =>
            updateSettings({
              mapLightingMode: isFullDaylight ? 'spotlight' : 'full_daylight',
            })
          }
          title="Alternar entre Iluminação Realista 50% Dia / 50% Noite ou Globo 100% Iluminado"
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition duration-200 border shrink-0 whitespace-nowrap ${
            isFullDaylight
              ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold'
              : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-700/80'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{isFullDaylight ? '100% Claro' : 'Dia/Noite 50%'}</span>
        </button>

        <div className="h-3.5 w-px bg-slate-800 mx-0.5 shrink-0 hidden sm:block" />

        {/* 5. Somente Mapa */}
        <button
          onClick={() => toggleMapOnlyMode()}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition duration-200 border shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/80 shadow-md whitespace-nowrap"
        >
          <Map className="w-3.5 h-3.5 text-emerald-100 shrink-0" />
          <span>Somente Mapa</span>
        </button>

        {/* 6. Sugestões de Usuários */}
        <button
          onClick={() => setActiveTab('feedback')}
          title="Aba de Mensagens & Sugestões para Melhorar o App"
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition duration-200 border shrink-0 bg-sky-600/30 hover:bg-sky-600 text-sky-200 hover:text-white border-sky-400/60 shadow-md whitespace-nowrap"
        >
          <MessageSquarePlus className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>Sugestões</span>
        </button>
      </div>

      {/* 1B. Floating Quick Selector Bar & Panels (Hidden in Human Surface View) */}
      {globeConfig.globeCameraPreset !== 'human_surface' && (
        <>
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-full px-2 py-1 shadow-xl pointer-events-auto max-w-[calc(100vw-24px)] overflow-x-auto scrollbar-none">
            {solarSystemTargets.map((t) => {
              const isSelected = globeConfig.focusedBody === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() =>
                    setGlobeConfig((prev) => ({
                      ...prev,
                      focusedBody: t.id,
                      globeCameraPreset: t.id === 'solar_system' ? 'solar_system' : 'orbit',
                    }))
                  }
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition shrink-0 whitespace-nowrap ${
                    isSelected
                      ? 'bg-amber-500/25 border border-amber-400 text-amber-200 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <span>{t.badge}</span>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* 2. Left Controls Panel for Globe Earth & Solar System Theory (Hidden in Human Surface View) */}
          <div className="absolute top-28 left-3.5 z-20 flex items-start gap-2 pointer-events-auto">
        {leftPanelOpen ? (
          <div className="w-80 max-h-[calc(100dvh-13rem)] overflow-y-auto bg-slate-950/90 backdrop-blur-md border border-indigo-500/40 rounded-2xl p-4 shadow-2xl text-xs space-y-3.5 scrollbar-thin">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-indigo-300" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white leading-tight">Sistema Solar Heliocêntrico</h2>
                  <p className="text-[10px] text-indigo-300 font-medium">Sol no Centro • 8 Planetas em Órbita</p>
                </div>
              </div>
              <button
                onClick={() => setLeftPanelOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title="Recolher painel"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* GPS Location Selector Button */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  Observador na Terra:
                </span>
                <button
                  onClick={() => setActiveSidebarTool(activeSidebarTool === 'location' ? null : 'location')}
                  className="px-2 py-0.5 rounded-md bg-sky-600/30 hover:bg-sky-600/50 border border-sky-400/50 text-sky-200 text-[10px] font-bold transition"
                >
                  Trocar Cidade
                </button>
              </div>
              <div className="text-xs font-bold text-white truncate">
                📍 {settings.observerLocationName || 'São Paulo, Brasil'}
              </div>
              <div className="text-[10px] font-mono text-sky-400">
                Lat: {settings.observerLat.toFixed(4)}° • Lng: {settings.observerLng.toFixed(4)}°
              </div>
            </div>

            {/* Axial Tilt Control (23.44°) & Visual Axis Rod Toggle */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">Inclinação Axial da Terra</span>
                <span className="font-mono text-indigo-300 font-bold">
                  {`${globeConfig.axialTiltDeg.toFixed(2)}°`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={45}
                step={0.01}
                value={globeConfig.axialTiltDeg}
                onChange={(e) =>
                  setGlobeConfig((prev) => ({
                    ...prev,
                    axialTiltDeg: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex items-center justify-between gap-1 pt-0.5">
                <button
                  onClick={() => setGlobeConfig((prev) => ({ ...prev, axialTiltDeg: 23.44 }))}
                  className="px-2 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-indigo-200 text-[10px] font-semibold transition"
                >
                  Padrão 23,44°
                </button>
                <button
                  onClick={() => setGlobeConfig((prev) => ({ ...prev, axialTiltDeg: 0 }))}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition"
                >
                  Eixo Reto (0°)
                </button>
                <button
                  onClick={() => setGlobeConfig((prev) => ({ ...prev, showAxialTilt: !prev.showAxialTilt }))}
                  className={`px-2 py-1 rounded border text-[10px] font-bold transition ${
                    globeConfig.showAxialTilt
                      ? 'bg-sky-500/30 border-sky-400 text-sky-200'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400'
                  }`}
                  title="Ligar ou desligar a seta/haste visual 3D do eixo nos polos da Terra"
                >
                  {globeConfig.showAxialTilt ? 'Seta Eixo: ON' : 'Seta Eixo: OFF'}
                </button>
              </div>
            </div>

            {/* Solar Brightness & Light Reach Control (Strong near Sun -> Weaker at Neptune) */}
            <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-200 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Claridade e Alcance do Sol
                </span>
                <span className="font-mono text-amber-300 font-bold">
                  {Math.round(((settings.solarIntensity || 2.0) / 2.0) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.8}
                max={4.0}
                step={0.1}
                value={settings.solarIntensity || 2.0}
                onChange={(e) => updateSettings({ solarIntensity: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="text-[10px] text-slate-400 leading-snug">
                Luz intensa em Mercúrio/Vênus/Terra e atenuação gradual até Netuno (30,1 UA).
              </div>
            </div>

            {/* Lunar Orbit Inclination (5.14°) & Nodal Precession (-19.34°/yr • 18.6 yrs -> 4 to 7 Eclipses/yr) */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">Inclinação Orbital da Lua</span>
                <span className="font-mono text-amber-300 font-bold">
                  {(globeConfig.lunarInclinationDeg ?? 5.14).toFixed(2)}°
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                step={0.01}
                value={globeConfig.lunarInclinationDeg ?? 5.14}
                onChange={(e) =>
                  setGlobeConfig((prev) => ({
                    ...prev,
                    lunarInclinationDeg: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex items-center justify-between gap-1 pt-0.5">
                <button
                  onClick={() => setGlobeConfig((prev) => ({ ...prev, lunarInclinationDeg: 5.14 }))}
                  className="px-2 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 border border-amber-400/40 text-amber-200 text-[10px] font-semibold transition"
                >
                  Real 5,14°
                </button>
                <button
                  onClick={() =>
                    setGlobeConfig((prev) => ({
                      ...prev,
                      lunarInclinationDeg: 0,
                      focusedBody: 'moon',
                      globeCameraPreset: 'orbit',
                    }))
                  }
                  title="Alinhar plano orbital em 0° para que a Terra bloqueie 100% da luz do Sol na Lua Cheia"
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold transition"
                >
                  Alinhar (0°)
                </button>
                <button
                  onClick={() => setGlobeConfig((prev) => ({ ...prev, showLunarNodes: !prev.showLunarNodes }))}
                  className={`px-2 py-1 rounded border text-[10px] font-bold transition ${
                    globeConfig.showLunarNodes
                      ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400'
                  }`}
                  title="Ligar ou desligar a visualização dos Nodos Lunares (pontos verde e rosa, linha dos nodos e anel da eclíptica)"
                >
                  {globeConfig.showLunarNodes ? 'Nodos: ON' : 'Nodos: OFF'}
                </button>
              </div>

              {/* Nodal Precession Live Telemetry Box */}
              <div className="mt-1.5 pt-2 border-t border-slate-800/90 space-y-1.5 text-[10px]">
                <div className="flex items-center justify-between text-emerald-300 font-semibold">
                  <span>☊ Precessão Nodal (Verde/Rosa):</span>
                  <span className="font-mono">-{NODAL_PRECESSION_RATE_DEG_PER_YEAR.toFixed(2)}°/ano (18,6 anos)</span>
                </div>
                <div className="text-[9px] text-slate-400 leading-tight bg-slate-950/50 px-2 py-1 rounded border border-slate-800/70">
                  • <strong>Lua (Branca):</strong> 1 volta a cada <strong>27,3 dias</strong> (+13,2°/dia)<br />
                  • <strong>Nodos (Verde/Rosa):</strong> 1 volta inversa a cada <strong>18,6 anos</strong> (-0,053°/dia • 250x mais lento)
                </div>
                <div className="grid grid-cols-2 gap-1 bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/80 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[9px]">Nodo ☊ (Ω):</span>
                    <span className="text-emerald-300 font-bold">{lunarTelemetry.ascendingNodeLongitudeDeg.toFixed(1)}°</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Lat. Eclíptica (β):</span>
                    <span className="text-sky-300 font-bold">
                      {lunarTelemetry.eclipticLatitudeDeg >= 0 ? `+${lunarTelemetry.eclipticLatitudeDeg.toFixed(2)}°` : `${lunarTelemetry.eclipticLatitudeDeg.toFixed(2)}°`}
                    </span>
                  </div>
                </div>

                <div className={`px-2 py-1 rounded-lg border flex items-center justify-between ${
                  lunarTelemetry.isInEclipseSeason
                    ? 'bg-amber-950/70 border-amber-500/60 text-amber-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}>
                  <span>Distância Sol–Nodo: <strong>{lunarTelemetry.sunNodeSeparationDeg.toFixed(1)}°</strong></span>
                  <span className="font-bold">
                    {lunarTelemetry.isInEclipseSeason ? '🌑 Temporada Ativa!' : 'Fora da Janela'}
                  </span>
                </div>

                {/* Annual Eclipses Generated by the 5.14° + 19.34°/yr Engine */}
                <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-800/90 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-indigo-200">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const prevYr = new Date(currentDate);
                          prevYr.setUTCFullYear(currentYear - 1);
                          useSimulationStore.getState().setDate(prevYr);
                        }}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] font-mono"
                        title="Recuar 1 ano para ver a Linha dos Nodos girar +19,34° e as datas dos eclipses mudarem"
                      >
                        ◀ {currentYear - 1}
                      </button>
                      <span>{currentYear}</span>
                      <button
                        onClick={() => {
                          const nextYr = new Date(currentDate);
                          nextYr.setUTCFullYear(currentYear + 1);
                          useSimulationStore.getState().setDate(nextYr);
                        }}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] font-mono"
                        title="Avançar 1 ano para ver a Linha dos Nodos regredir -19,34° e as temporadas de eclipse recuarem ~19 dias"
                      >
                        {currentYear + 1} ▶
                      </button>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-600/30 border border-indigo-400/40 text-indigo-200 font-mono text-[9px]">
                      {annualEclipses.length} eclipses
                    </span>
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-0.5 scrollbar-thin">
                    {annualEclipses.map((ec, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          useSimulationStore.getState().setDate(ec.date);
                          setGlobeConfig((prev) => ({
                            ...prev,
                            focusedBody: ec.type === 'solar' ? 'earth' : 'moon',
                            globeCameraPreset: 'orbit',
                          }));
                        }}
                        className="w-full flex items-center justify-between px-1.5 py-1 rounded bg-slate-900 hover:bg-indigo-950/80 border border-slate-800 hover:border-indigo-500/50 text-left transition"
                        title="Clique para saltar para a data exata deste eclipse gerado pela precessão nodal"
                      >
                        <span className="truncate font-medium text-slate-200">
                          {ec.type === 'solar' ? '☀️ Solar' : '🩸 Lunar'} ({ec.subtype})
                        </span>
                        <span className="font-mono text-[9px] text-amber-300 shrink-0 ml-1">
                          {ec.dateFormatted || `${String(ec.date.getUTCDate()).padStart(2, '0')}-${String(ec.date.getUTCMonth() + 1).padStart(2, '0')}-${ec.date.getUTCFullYear()}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Solar System & Earth Toggles */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Sistema Solar e Geometria Esférica
              </div>

              {[
                {
                  key: 'showClouds3D',
                  label: '☁️ Nuvens Dinâmicas Reais 3D + Sombras',
                  active: globeConfig.showClouds3D !== false,
                  onClick: () => setGlobeConfig((p) => ({ ...p, showClouds3D: p.showClouds3D === false })),
                },
                {
                  key: 'showAurora',
                  label: '🌌 Aurora Boreal & Austral (Ovais Polares)',
                  active: globeConfig.showAurora !== false,
                  onClick: () => setGlobeConfig((p) => ({ ...p, showAurora: p.showAurora === false })),
                },
                {
                  key: 'showAtmosphereHalo',
                  label: '💙 Atmosfera Azul Profunda (Rayleigh)',
                  active: globeConfig.showAtmosphereHalo,
                  onClick: () => setGlobeConfig((p) => ({ ...p, showAtmosphereHalo: !p.showAtmosphereHalo })),
                },
                {
                  key: 'showPlanetOrbits',
                  label: 'Órbitas Heliocêntricas dos 8 Planetas',
                  active: globeConfig.showPlanetOrbits,
                  onClick: () => setGlobeConfig((p) => ({ ...p, showPlanetOrbits: !p.showPlanetOrbits })),
                },
                {
                  key: 'showPlanetLabels',
                  label: 'Nomes do Sol e dos Planetas',
                  active: globeConfig.showPlanetLabels,
                  onClick: () => setGlobeConfig((p) => ({ ...p, showPlanetLabels: !p.showPlanetLabels })),
                },
                {
                  key: 'showAsteroidBelt',
                  label: 'Cinturão de Asteroides (Marte/Júpiter)',
                  active: globeConfig.showAsteroidBelt,
                  onClick: () => setGlobeConfig((p) => ({ ...p, showAsteroidBelt: !p.showAsteroidBelt })),
                },
                {
                  key: 'showTerminatorRing',
                  label: 'Círculo do Terminador (Dia / Noite)',
                  active: globeConfig.showTerminatorRing,
                  onClick: () => setGlobeConfig((p) => ({ ...p, showTerminatorRing: !p.showTerminatorRing })),
                },
                {
                  key: 'showLunarNodes',
                  label: '☊ Nodos Lunares (Verde/Rosa) e Linha Nodal',
                  active: Boolean(globeConfig.showLunarNodes),
                  onClick: () => setGlobeConfig((p) => ({ ...p, showLunarNodes: !p.showLunarNodes })),
                },
                {
                  key: 'showAxialTilt',
                  label: 'Eixo Polar da Terra (23,44°)',
                  active: globeConfig.showAxialTilt,
                  onClick: () => setGlobeConfig((p) => ({ ...p, showAxialTilt: !p.showAxialTilt })),
                },
                {
                  key: 'showTropicsAndCircles',
                  label: 'Equador, Trópicos e Círculos Polares',
                  active: globeConfig.showTropicsAndCircles,
                  onClick: () => setGlobeConfig((p) => ({ ...p, showTropicsAndCircles: !p.showTropicsAndCircles })),
                },
                {
                  key: 'showSphericalGrid',
                  label: 'Grade Esférica (Meridianos/Paralelos)',
                  active: globeConfig.showSphericalGrid,
                  onClick: () => setGlobeConfig((p) => ({ ...p, showSphericalGrid: !p.showSphericalGrid })),
                },
                {
                  key: 'showObserverPin',
                  label: 'Pino GPS e Vetor Zênite Radial',
                  active: globeConfig.showObserverPin,
                  onClick: () => setGlobeConfig((p) => ({ ...p, showObserverPin: !p.showObserverPin })),
                },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={item.onClick}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-left transition ${
                    item.active
                      ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-100 font-semibold'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      item.active ? 'bg-indigo-400 shadow-sm shadow-indigo-400' : 'bg-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Surface Layers */}
            <div className="space-y-1.5 pt-1 border-t border-slate-800">
              <button
                onClick={() => toggleLayer('showCityLights')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-left transition ${
                  layers.showCityLights
                    ? 'bg-amber-950/50 border-amber-500/50 text-amber-200 font-semibold'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                }`}
              >
                <span>Luzes Noturnas das Cidades</span>
                <span className={`w-2.5 h-2.5 rounded-full ${layers.showCityLights ? 'bg-amber-400' : 'bg-slate-700'}`} />
              </button>

              <button
                onClick={() => setMapColorTheme(layers.mapColorTheme === 'satellite' ? 'hypsometric' : 'satellite')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl border bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800 transition font-medium"
              >
                <span>Textura da Terra:</span>
                <span className="text-indigo-300 font-bold">
                  {layers.mapColorTheme === 'satellite' ? 'Satélite NASA HD' : 'Físico Hipsométrico'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setLeftPanelOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-950/90 border border-indigo-500/50 text-indigo-200 text-xs font-bold shadow-xl hover:bg-slate-900 transition"
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Controles Sistema Solar</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3. Right Telemetry Panel: Solar System & Spherical Earth Physical Parameters */}
      <div className="absolute top-28 right-3.5 z-20 flex items-start gap-2 pointer-events-auto">
        {rightPanelOpen ? (
          <div className="w-76 bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 shadow-2xl text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-indigo-300 uppercase tracking-wider text-[11px]">
                {globeConfig.focusedBody === 'moon'
                  ? 'Dados • Lua (Escala Real)'
                  : selectedPlanetSpec
                    ? `Dados • ${selectedPlanetSpec.namePt}`
                    : 'Dados • Sistema Solar & Terra'}
              </span>
              <button
                onClick={() => setRightPanelOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title="Ocultar telemetria"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {globeConfig.focusedBody === 'moon' ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400">Diâmetro da Lua</div>
                    <div className="text-sm font-bold text-white font-mono">3.474,8 km</div>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400">Escala vs Terra</div>
                    <div className="text-sm font-bold text-emerald-300 font-mono">0,2727x Terra</div>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400">Distância Terra-Lua</div>
                    <div className="text-sm font-bold text-amber-300 font-mono">384.400 km</div>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400">Em Raios da Terra</div>
                    <div className="text-sm font-bold text-sky-300 font-mono">60,34 R⊕ (30,17 Ø)</div>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2 col-span-2">
                    <div className="text-[10px] text-slate-400">Inclinação Orbital • Diâmetro Aparente</div>
                    <div className="text-xs font-bold text-indigo-300 font-mono">
                      {(globeConfig.lunarInclinationDeg ?? 5.14).toFixed(2)}° • 0,518° no Céu da Terra
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedPlanetSpec && selectedPlanetSpec.id !== 'earth' ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400">Distância ao Sol</div>
                    <div className="text-sm font-bold text-amber-300 font-mono">{selectedPlanetSpec.distanceAU} UA</div>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400">Diâmetro Real</div>
                    <div className="text-sm font-bold text-white font-mono">
                      {selectedPlanetSpec.realDiameterKm.toLocaleString('pt-BR')} km
                    </div>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400">Escala vs Terra</div>
                    <div className="text-sm font-bold text-emerald-300 font-mono">
                      {selectedPlanetSpec.earthSizeRatio.toLocaleString('pt-BR')}x Terra
                    </div>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400">Ano Orbital</div>
                    <div className="text-sm font-bold text-sky-300 font-mono">
                      {selectedPlanetSpec.orbitalPeriodDays.toFixed(1)} d
                    </div>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2 col-span-2">
                    <div className="text-[10px] text-slate-400">Inclinação Axial • Visão da Terra</div>
                    <div className="text-xs font-bold text-indigo-300 font-mono">
                      {selectedPlanetSpec.axialTiltDeg}° • {selectedPlanetSpec.apparentAngleFromEarth}
                    </div>
                  </div>
                </div>

                {/* Natural Moons of the Selected Planet */}
                <div className="bg-slate-900/95 border border-indigo-500/30 rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                      Luas em Órbita 3D ({(PLANETARY_MOONS_CATALOG[selectedPlanetSpec.id] || []).length})
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      {selectedPlanetSpec.id === 'mercury' || selectedPlanetSpec.id === 'venus'
                        ? '0 satélites naturais'
                        : 'Iluminadas pelo Sol'}
                    </span>
                  </div>
                  {(PLANETARY_MOONS_CATALOG[selectedPlanetSpec.id] || []).length === 0 ? (
                    <div className="text-[10px] text-slate-400 py-1">
                      {selectedPlanetSpec.namePt} não possui luas naturais no Sistema Solar (devido à forte gravidade solar próxima).
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                      {(PLANETARY_MOONS_CATALOG[selectedPlanetSpec.id] || []).map((moon) => (
                        <div
                          key={moon.id}
                          className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-1.5 space-y-0.5"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: moon.colorHex }}
                              />
                              {moon.namePt}
                            </span>
                            <span className="font-mono text-amber-300 text-[9px]">
                              Ø {moon.realDiameterKm.toLocaleString('pt-BR')} km •{' '}
                              {Math.abs(moon.orbitalPeriodDays).toFixed(2)} d
                              {moon.orbitalPeriodDays < 0 ? ' (Retrógrada)' : ''}
                            </span>
                          </div>
                          <div className="text-[9px] text-slate-400 leading-tight">{moon.descriptionPt}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400">Distância Sol-Terra</div>
                    <div className="text-sm font-bold text-amber-300 font-mono">149,6 mi km</div>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400">Translação Orbital</div>
                    <div className="text-sm font-bold text-emerald-300 font-mono">107.200 km/h</div>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400">Giro no Equador</div>
                    <div className="text-sm font-bold text-white font-mono">1.674 km/h</div>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400">Giro no GPS Atual</div>
                    <div className="text-sm font-bold text-sky-300 font-mono">{observerRotationSpeedKmh} km/h</div>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Declinação Solar:</span>
                    <span className="font-mono font-bold text-amber-300">
                      {solarDeclinationDeg >= 0
                        ? `${solarDeclinationDeg.toFixed(1)}° N`
                        : `${Math.abs(solarDeclinationDeg).toFixed(1)}° S`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Meio-Dia Solar:</span>
                    <span className="font-mono font-bold text-sky-300">
                      {subsolarLng >= 0 ? `${subsolarLng.toFixed(1)}° L` : `${Math.abs(subsolarLng).toFixed(1)}° O`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Tamanho Aparente Sol/Lua:</span>
                    <span className="font-mono font-bold text-amber-200">0,53° / 0,52°</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Vênus Visto da Terra:</span>
                    <span className="font-mono font-bold text-indigo-300">0,003° a 0,018°</span>
                  </div>
                </div>

                {/* Tabela Oficial de Tamanhos e Distâncias Reais (NASA / UAI) */}
                <div className="bg-slate-900/95 border border-indigo-500/30 rounded-xl p-2.5 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 border-b border-slate-800 pb-1">
                    Diâmetro Real (D/Terra) & Distância (UA)
                  </div>
                  <div className="max-h-44 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                    {SOLAR_SYSTEM_PLANETS.map((p) => (
                      <div
                        key={p.id}
                        onClick={() =>
                          setGlobeConfig((prev) => ({
                            ...prev,
                            focusedBody: p.id,
                            globeCameraPreset: 'orbit',
                          }))
                        }
                        className="flex items-center justify-between text-[10px] py-1 px-1.5 rounded hover:bg-slate-800/80 cursor-pointer transition border-b border-slate-800/40 last:border-b-0"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-100">{p.namePt}</span>
                          <span className="font-mono text-[9px] text-emerald-300">
                            Ø {p.realDiameterKm.toLocaleString('pt-BR')} km ({p.earthSizeRatio.toLocaleString('pt-BR')}x 🌍)
                          </span>
                        </div>
                        <div className="text-right font-mono">
                          <div className="text-amber-300 font-semibold">{p.distanceAU.toFixed(3)} UA</div>
                          <div className="text-[9px] text-slate-400">
                            {p.distanceMillionKm.toLocaleString('pt-BR')} mi km
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => setRightPanelOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-950/90 border border-slate-800 text-slate-300 text-xs font-bold shadow-xl hover:bg-slate-900 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Dados do Sistema Solar</span>
          </button>
        )}
      </div>
        </>
      )}
    </>
  );
};
