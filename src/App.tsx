import React, { useEffect, useState } from 'react';
import { Eye, Map, RotateCcw } from 'lucide-react';
import { PlanarCanvas } from './components/3D/PlanarCanvas';
import { GlobeCanvas, GlobeViewConfig } from './components/3D/GlobeCanvas';
import { GlobeSimUI } from './components/UI/GlobeSimUI';
import { LeftSidebar } from './components/UI/LeftSidebar';
import { CameraToolbar } from './components/UI/CameraToolbar';
import { LightingExplainer } from './components/UI/LightingExplainer';
import { AstroInfoCard } from './components/UI/AstroInfoCard';
import { TimeController } from './components/UI/TimeController';
import { SideAltitudeOverlay } from './components/UI/SideAltitudeOverlay';
import { HumanObserverHUD } from './components/UI/HumanObserverHUD';
import { LayersModal } from './components/UI/LayersModal';
import { SettingsModal } from './components/UI/SettingsModal';
import { LocationModal } from './components/UI/LocationModal';
import { DateTimeModal } from './components/UI/DateTimeModal';
import { MeasureModal } from './components/UI/MeasureModal';
import { CompareModal } from './components/UI/CompareModal';
import { AstroListModal } from './components/UI/AstroListModal';
import { CalendarModal } from './components/UI/CalendarModal';
import { FavoritesModal } from './components/UI/FavoritesModal';
import { CloudAltitudeModal } from './components/UI/CloudAltitudeModal';
import { WeatherModal } from './components/UI/WeatherModal';
import { MountainsModal } from './components/UI/MountainsModal';
import { AtmosphereModal } from './components/UI/AtmosphereModal';
import { ConstellationsModal } from './components/UI/ConstellationsModal';
import { FeedbackModal } from './components/UI/FeedbackModal';
import { SolaLoadingScreen } from './components/UI/SolaLoadingScreen';
import { SimulatorLandingPortal } from './components/UI/SimulatorLandingPortal';
import { useSimulationStore } from './store/simulationStore';

export default function App() {
  const { theoryMode, mapOnlyMode, setMapOnlyMode, activeTab, setActiveTab } = useSimulationStore();
  const [canvasReadyToMount, setCanvasReadyToMount] = useState(false);

  const [globeConfig, setGlobeConfig] = useState<GlobeViewConfig>({
    showAxialTilt: false,
    axialTiltDeg: 23.44,
    lunarInclinationDeg: 5.14,
    showLunarNodes: false,
    showSphericalGrid: false,
    showTropicsAndCircles: false,
    showTerminatorRing: false,
    showAtmosphereHalo: true,
    showClouds3D: true,
    showAurora: true,
    showObserverPin: false,
    showObserverHorizonPlane: false,
    showPlanetOrbits: true,
    showPlanetLabels: false,
    showAsteroidBelt: true,
    lockCameraToEarthRotation: false,
    focusedBody: 'solar_system',
    globeCameraPreset: 'solar_system',
  });

  // Paint the SOLA loading screen first before running heavy 3D procedural texture generation
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCanvasReadyToMount(true);
    }, 90);
    return () => clearTimeout(timer);
  }, []);

  // Press ESC to exit "Somente Mapa" mode or close feedback modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mapOnlyMode) {
          setMapOnlyMode(false);
        } else if (activeTab === 'feedback') {
          setActiveTab('system');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mapOnlyMode, setMapOnlyMode, activeTab, setActiveTab]);

  // Synchronize globeCameraPreset from global events (e.g. teleport to eclipse in human surface mode)
  useEffect(() => {
    const handlePresetChange = (e: Event) => {
      const detail = (e as CustomEvent<{ preset?: any }>).detail;
      if (detail?.preset) {
        setGlobeConfig((prev) => ({
          ...prev,
          globeCameraPreset: detail.preset,
          focusedBody: detail.preset === 'solar_system' ? 'solar_system' : 'earth',
        }));
      }
    };
    window.addEventListener('globe-set-camera-preset', handlePresetChange);
    return () => window.removeEventListener('globe-set-camera-preset', handlePresetChange);
  }, []);

  return (
    <main className="fixed inset-0 w-full h-full h-[100dvh] overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      {/* Interactive SOLA Splash & Screen Transition Loading Overlay */}
      <SolaLoadingScreen />

      {/* Página Inicial / Portal de Seleção de Simulador & Monetização */}
      <SimulatorLandingPortal />

      {canvasReadyToMount && (
        <>
          {theoryMode === 'planar' ? (
            <>
              {/* ================= SISTEMA 1: TEORIA DA TERRA PLANAR (100% PRESERVADO) ================= */}
              <PlanarCanvas />

              {mapOnlyMode ? (
                <div className="absolute top-5 right-5 z-50 flex items-center gap-2 animate-in fade-in duration-300">
                  <button
                    id="btn-exit-map-only-mode"
                    onClick={() => setMapOnlyMode(false)}
                    title="Voltar à interface normal e exibir todos os menus (ou pressione ESC)"
                    className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-950/90 hover:bg-sky-600 border border-sky-500/50 hover:border-sky-400 text-white rounded-full shadow-2xl backdrop-blur-md text-xs font-bold transition-all duration-200 group hover:scale-105"
                  >
                    <Eye className="w-4 h-4 text-sky-400 group-hover:text-white transition" />
                    <span>Sair do Modo Somente Mapa</span>
                    <span className="text-[10px] bg-slate-800 group-hover:bg-sky-700 px-2 py-0.5 rounded-full border border-slate-700 text-slate-300 group-hover:text-white font-mono">
                      ESC
                    </span>
                  </button>
                </div>
              ) : (
                <>
                  <CameraToolbar />
                  <LeftSidebar />
                  <LightingExplainer />
                  <SideAltitudeOverlay />
                  <HumanObserverHUD />
                  <AstroInfoCard />
                  <TimeController />
                  <LayersModal />
                  <CloudAltitudeModal />
                  <WeatherModal />
                  <SettingsModal />
                  <LocationModal />
                  <DateTimeModal />
                  <MeasureModal />
                  <CompareModal />
                  <AstroListModal />
                  <CalendarModal />
                  <FavoritesModal />
                  <MountainsModal />
                  <AtmosphereModal />
                  <ConstellationsModal />
                </>
              )}
            </>
          ) : (
            <>
              {/* ================= SISTEMA 2: TEORIA DA TERRA REDONDA (GLOBO ESFÉRICO) ================= */}
              <GlobeCanvas globeConfig={globeConfig} />

              {mapOnlyMode ? (
                <div className="absolute top-5 right-5 z-50 flex items-center gap-2 animate-in fade-in duration-300">
                  <button
                    id="btn-exit-map-only-mode-globe"
                    onClick={() => setMapOnlyMode(false)}
                    title="Voltar à interface normal e exibir todos os menus (ou pressione ESC)"
                    className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-950/90 hover:bg-indigo-600 border border-indigo-500/50 hover:border-indigo-400 text-white rounded-full shadow-2xl backdrop-blur-md text-xs font-bold transition-all duration-200 group hover:scale-105"
                  >
                    <Eye className="w-4 h-4 text-indigo-400 group-hover:text-white transition" />
                    <span>Sair do Modo Somente Mapa</span>
                    <span className="text-[10px] bg-slate-800 group-hover:bg-indigo-700 px-2 py-0.5 rounded-full border border-slate-700 text-slate-300 group-hover:text-white font-mono">
                      ESC
                    </span>
                  </button>
                </div>
              ) : (
                <>
                  <GlobeSimUI globeConfig={globeConfig} setGlobeConfig={setGlobeConfig} />
                  <HumanObserverHUD isGlobeMode={true} globeConfig={globeConfig} />
                  <TimeController />
                  <LocationModal />
                  <DateTimeModal />
                  <ConstellationsModal />
                  <CalendarModal />
                </>
              )}
            </>
          )}
        </>
      )}

      {/* Aba de Mensagens & Sugestões de Usuários para Melhorar o App */}
      <FeedbackModal />
    </main>
  );
}

