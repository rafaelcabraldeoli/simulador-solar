import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/simulationStore';
import {
  calculateAstroPositions,
  calculateApparentCelestialSkyVector,
  getDynamicHorizonDistance,
  geoToPlanarCoords,
  planarCoordsToGeo,
  getLocalCompassVectors,
  getDayOfYear,
  getEclipseInfo,
  findMatchingCatalogEclipse,
} from '../../utils/astronomy';
import {
  generateFlatEarthTexture,
  generateNightCityLightsTexture,
  generateElevationDisplacementMap,
  generateHypsometricPhysicalTexture,
  sampleTerrainElevationNormalized,
  generateMoonTexture,
  generateMoonGlowTexture,
  generateSunTexture,
  generateSunSparkleTexture,
  generateSolarCoronaTexture,
  generateSmokyCloudTexture,
  generateStarfieldTexture,
  generateStarSparkleTexture,
} from '../../utils/textureGenerator';
import { AstroId, CelestialBodyData } from '../../types';
import { CELESTIAL_BODIES } from '../../data/celestialBodies';
import { WORLD_CITIES, findNearestCity } from '../../data/cities';
import { WORLD_MOUNTAIN_PEAKS } from '../../data/mountains';
import { createAtmosphereLayers3D, AtmosphereLayersSystem3D } from './AtmosphereLayers3D';
import { createAtmosphericClouds3D, CloudSystem3D } from './CloudLayer3D';
import { createWeatherSystem3D, WeatherSystem3D } from './WeatherParticles3D';
import { ObserverEnvironment3D } from './ObserverEnvironment3D';
import { CelestialSphere3D } from './CelestialSphere3D';
import { fetchGlobalWeatherBatch, GLOBAL_WEATHER_STATIONS } from '../../services/weatherService';
import {
  applyHumanCameraQuaternion,
  applyHumanLookDrag,
  broadcastHumanCameraAngles,
  clampHumanFov,
  clampHumanPitch,
  getDefaultHumanFov,
} from '../../utils/humanCameraController';
// Reusable persistent math objects for render loop (avoids 4000+ GC object allocations per second)
const _vNorth = new THREE.Vector3();
const _vEast = new THREE.Vector3();
const _vUp = new THREE.Vector3(0, 1, 0);
const _vSouth = new THREE.Vector3();
const _vNorthAxis = new THREE.Vector3();
const _vPolePerp = new THREE.Vector3();
const _mPoleBasis = new THREE.Matrix4();
const _qCelestialPole = new THREE.Quaternion();
const _vEyePos = new THREE.Vector3();
const _vSunDirLocal = new THREE.Vector3();
const _vMoonDirLocal = new THREE.Vector3();
const _qIdentity = new THREE.Quaternion();
const _vSunPosForDome = new THREE.Vector3();
const _vMoonPosForDome = new THREE.Vector3();
const _vSunWorld = new THREE.Vector3();
const _vObsWorld = new THREE.Vector3();
const _vMoonWorld = new THREE.Vector3();
const _vKetuWorld = new THREE.Vector3();
const _vSunView = new THREE.Vector3();
const _vObsView = new THREE.Vector3();
const _vMoonView = new THREE.Vector3();
const _vKetuView = new THREE.Vector3();
const _vToSun = new THREE.Vector3();
const _vSunDir = new THREE.Vector3();
const _vTransit = new THREE.Vector3();
const _vMoonEyePos = new THREE.Vector3();

export const PlanarCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // 3D Visual Object references
  const earthDiscMeshRef = useRef<THREE.Mesh | null>(null);
  const earthDiscUniformsRef = useRef<Record<string, THREE.IUniform> | null>(null);
  const atmosphere3DRef = useRef<AtmosphereLayersSystem3D | null>(null);
  const clouds3DRef = useRef<CloudSystem3D | null>(null);
  const weather3DRef = useRef<WeatherSystem3D | null>(null);
  const observerEnv3DRef = useRef<ObserverEnvironment3D | null>(null);
  const celestialSphere3DRef = useRef<CelestialSphere3D | null>(null);
  const sunMeshRef = useRef<THREE.Group | null>(null);
  const sunSparkleSpriteRef = useRef<THREE.Sprite | null>(null);
  const sunCoronaSpriteRef = useRef<THREE.Sprite | null>(null);
  const sunPhotosphereMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const sunSpotLightRef = useRef<THREE.SpotLight | null>(null);
  const sunSpotTargetRef = useRef<THREE.Object3D | null>(null);
  const sunPointLightRef = useRef<THREE.PointLight | null>(null);
  const humanSunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const humanSunBeamRef = useRef<THREE.Mesh | null>(null);
  const humanSunBeamMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const humanMoonLightRef = useRef<THREE.DirectionalLight | null>(null);
  const humanMoonBeamRef = useRef<THREE.Mesh | null>(null);
  const humanMoonBeamMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const humanSkyLightRef = useRef<THREE.HemisphereLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const moonMeshRef = useRef<THREE.Group | null>(null);
  const moonHaloMeshRef = useRef<THREE.Mesh | null>(null);
  const moonHaloMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const moonShaderMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const moonSpotLightRef = useRef<THREE.SpotLight | null>(null);
  const moonSpotTargetRef = useRef<THREE.Object3D | null>(null);
  const rahuMeshRef = useRef<THREE.Group | null>(null);
  const rahuLiveOrbitRef = useRef<THREE.Line | null>(null);
  const ketuMeshRef = useRef<THREE.Group | null>(null);
  const ketuLiveOrbitRef = useRef<THREE.Line | null>(null);
  const ketuMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const ketuSpriteMatRef = useRef<THREE.SpriteMaterial | null>(null);
  const planetMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const planetSparklesRef = useRef<Map<string, { sprite: THREE.Sprite; baseScale: number; phase: number }>>(new Map());
  const orbitLinesGroupRef = useRef<THREE.Group | null>(null);
  const sunLiveOrbitRef = useRef<THREE.Line | null>(null);
  const moonLiveOrbitRef = useRef<THREE.Line | null>(null);
  const planetLiveOrbitsRef = useRef<Map<string, THREE.Line>>(new Map());
  const astroLabelsGroupRef = useRef<THREE.Group | null>(null);
  const astroLabelSpritesRef = useRef<Map<string, THREE.Sprite>>(new Map());
  const gridLinesGroupRef = useRef<THREE.Group | null>(null);
  const compassGroupRef = useRef<THREE.Group | null>(null);
  const zodiacBeltGroupRef = useRef<THREE.Group | null>(null);
  const atmosphereGlowRef = useRef<THREE.Mesh | null>(null);
  const atmosphereGlowMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const solarFocusConeRef = useRef<THREE.Mesh | null>(null);
  const solarFocusConeMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const altitudeRodsGroupRef = useRef<THREE.Group | null>(null);
  const observerGroupRef = useRef<THREE.Group | null>(null);
  const observerRippleMeshRef = useRef<THREE.Mesh | null>(null);
  const observerTagSpriteRef = useRef<THREE.Sprite | null>(null);
  const citiesGroupRef = useRef<THREE.Group | null>(null);
  const cityMarkersListRef = useRef<{ pin: THREE.Mesh; sprite: THREE.Sprite; px: number; pz: number; normElev: number }[]>([]);
  const mountainPeaksGroupRef = useRef<THREE.Group | null>(null);
  const mountainMarkersListRef = useRef<{ beacon: THREE.Mesh; sprite: THREE.Sprite; baseElevMeters: number; px: number; pz: number }[]>([]);
  const lastObserverKeyRef = useRef<string>('');

  // Interactive Orbit Camera state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const isMobileInit = typeof window !== 'undefined' && window.innerWidth < 768;
  const cameraSphericalRef = useRef({
    radius: isMobileInit ? 112 : 90,
    theta: Math.PI / 4,
    phi: Math.PI / 3.2,
  });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 2, 0));
  const skyLookAnglesRef = useRef({ azimuth: 0, pitch: 0.15 });
  const humanLookAnglesRef = useRef({ azimuth: 0, pitch: 0.14 });
  const humanEyeHeightRef = useRef(0.04); // Altura normal dos olhos humanos
  const humanFovRef = useRef(getDefaultHumanFov(isMobileInit)); // Lente rectilínea tele-normal (42°-46°) com zero estiramento de perspectiva nas bordas

  // Mobile Touch Gestures state (Pinch zoom, tap selection, smooth look)
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);

  const { selectAstro } = useSimulationStore();

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any previous children in container
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.2, 9000);
    camera.position.set(0, 48, 76);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const isMobileDevice = typeof window !== 'undefined' && (window.innerWidth < 768 || 'ontouchstart' in window);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileDevice ? 1.75 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Global & Observer Lighting
    // The sun itself provides the true real lighting on the earth plane
    const ambientLight = new THREE.AmbientLight(0x0f172a, 0.0);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // Direct Solar Light for Human 1st-person ground view (illuminates grass, trees, mountains with dynamic sunset and shadows)
    const humanSunLight = new THREE.DirectionalLight(0xfffaed, 3.5);
    humanSunLight.castShadow = true;
    humanSunLight.shadow.mapSize.width = 2048;
    humanSunLight.shadow.mapSize.height = 2048;
    humanSunLight.shadow.camera.near = 0.1;
    humanSunLight.shadow.camera.far = 100.0;
    humanSunLight.shadow.camera.left = -22;
    humanSunLight.shadow.camera.right = 22;
    humanSunLight.shadow.camera.top = 22;
    humanSunLight.shadow.camera.bottom = -22;
    humanSunLight.shadow.bias = 0.0005;
    humanSunLight.shadow.normalBias = 0.02;
    scene.add(humanSunLight);
    humanSunLightRef.current = humanSunLight;

    // Direct Lunar Light for Human 1st-person ground view (clareia a terra suavemente e projeta sombras como o sol)
    const humanMoonLight = new THREE.DirectionalLight(0xbad6f8, 0.35);
    humanMoonLight.castShadow = true;
    humanMoonLight.shadow.mapSize.width = 1024;
    humanMoonLight.shadow.mapSize.height = 1024;
    humanMoonLight.shadow.camera.near = 0.1;
    humanMoonLight.shadow.camera.far = 100.0;
    humanMoonLight.shadow.camera.left = -22;
    humanMoonLight.shadow.camera.right = 22;
    humanMoonLight.shadow.camera.top = 22;
    humanMoonLight.shadow.camera.bottom = -22;
    humanMoonLight.shadow.bias = 0.0005;
    humanMoonLight.shadow.normalBias = 0.02;
    scene.add(humanMoonLight);
    humanMoonLightRef.current = humanMoonLight;

    // Volumetric Atmospheric Solar Light Beam for Human View (Feixe de Luz do Sol reduzido em 50%)
    const sunBeamGeo = new THREE.CylinderGeometry(0.42, 8.25, 1.0, 32, 8, true);
    sunBeamGeo.rotateX(Math.PI / 2);
    sunBeamGeo.translate(0, 0, 0.5);
    const sunBeamMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xfffaea) },
        uIntensity: { value: 0.0 },
        uTime: { value: 0.0 },
        uSunsetFactor: { value: 0.0 },
        uDirectLookFade: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vViewDir;
        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          vViewDir = normalize(cameraPosition - worldPos.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        uniform float uTime;
        uniform float uSunsetFactor;
        uniform float uDirectLookFade;
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vViewDir;

        void main() {
          if (uIntensity < 0.001 || uDirectLookFade < 0.001) discard;
          // Atenuação suave longitudinal nas extremidades
          float topFade = smoothstep(0.0, 0.16, vUv.y);
          float bottomFade = smoothstep(1.0, 0.70, vUv.y);
          float longitudinal = (1.0 - vUv.y * 0.60) * topFade * bottomFade;

          // Queda radial física perfeita: começa com brilho no centro e diminui suavemente até zero na ponta/borda
          float centerFactor = clamp(abs(dot(vWorldNormal, vViewDir)), 0.0, 1.0);
          float radialFalloff = smoothstep(0.02, 0.85, centerFactor) * pow(centerFactor, 1.4);

          // Luz solar estável e contínua sem pulsação periódica
          float alpha = uIntensity * longitudinal * radialFalloff * uDirectLookFade;
          if (alpha < 0.002) discard;

          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const sunBeamMesh = new THREE.Mesh(sunBeamGeo, sunBeamMat);
    sunBeamMesh.renderOrder = -2;
    scene.add(sunBeamMesh);
    humanSunBeamRef.current = sunBeamMesh;
    humanSunBeamMatRef.current = sunBeamMat;

    // Volumetric Atmospheric Moon Light Beam for Human View (Feixe de Luz da Lua)
    const moonBeamGeo = new THREE.CylinderGeometry(0.55, 9.5, 1.0, 32, 8, true);
    moonBeamGeo.rotateX(Math.PI / 2);
    moonBeamGeo.translate(0, 0, 0.5);
    const moonBeamMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xb0d8ff) },
        uIntensity: { value: 0.0 },
        uTime: { value: 0.0 },
        uDirectLookFade: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vViewDir;
        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          vViewDir = normalize(cameraPosition - worldPos.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        uniform float uTime;
        uniform float uDirectLookFade;
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vViewDir;

        void main() {
          if (uIntensity < 0.001 || uDirectLookFade < 0.001) discard;
          float topFade = smoothstep(0.0, 0.16, vUv.y);
          float bottomFade = smoothstep(1.0, 0.72, vUv.y);
          float longitudinal = (1.0 - vUv.y * 0.58) * topFade * bottomFade;

          float centerFactor = clamp(abs(dot(vWorldNormal, vViewDir)), 0.0, 1.0);
          float radialFalloff = smoothstep(0.02, 0.85, centerFactor) * pow(centerFactor, 1.4);

          float alpha = uIntensity * longitudinal * radialFalloff * uDirectLookFade;
          if (alpha < 0.002) discard;

          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const moonBeamMesh = new THREE.Mesh(moonBeamGeo, moonBeamMat);
    moonBeamMesh.renderOrder = -2;
    scene.add(moonBeamMesh);
    humanMoonBeamRef.current = moonBeamMesh;
    humanMoonBeamMatRef.current = moonBeamMat;

    // Atmospheric Hemisphere Light for Human ground environment (sky light vs ground bounce)
    const humanSkyLight = new THREE.HemisphereLight(0x93c5fd, 0x1e3a1e, 0.6);
    scene.add(humanSkyLight);
    humanSkyLightRef.current = humanSkyLight;

    // 5. Build Celestial Sphere 3D (Photorealistic Firmament rotating around Polaris)
    const celestialSphere3D = new CelestialSphere3D();
    scene.add(celestialSphere3D.group);
    celestialSphere3DRef.current = celestialSphere3D;

    // 6. Build Flat Earth Disc with Dynamic Day/Night Shader & 3D Mountain Elevation
    const nightCitiesTexture = generateNightCityLightsTexture();
    nightCitiesTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    let earthTexture: THREE.CanvasTexture;
    earthTexture = generateFlatEarthTexture(true, (tex) => {
      if (earthDiscUniformsRef.current) {
        earthDiscUniformsRef.current.uDayTexture.value = tex || earthTexture;
      }
    });
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    earthTexture.minFilter = THREE.LinearMipmapLinearFilter;
    earthTexture.magFilter = THREE.LinearFilter;

    // Hypsometric Physical World Map Texture (green lowlands, yellow plateaus, red high mountains)
    let hypsometricTexture: THREE.CanvasTexture;
    hypsometricTexture = generateHypsometricPhysicalTexture((tex) => {
      if (earthDiscUniformsRef.current) {
        earthDiscUniformsRef.current.uHypsometricTexture.value = tex || hypsometricTexture;
      }
    });
    hypsometricTexture.colorSpace = THREE.SRGBColorSpace;
    hypsometricTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    hypsometricTexture.minFilter = THREE.LinearMipmapLinearFilter;
    hypsometricTexture.magFilter = THREE.LinearFilter;

    // Elevation Displacement & Bump map for realistic 3D continental mountain chains
    let elevationTexture: THREE.CanvasTexture;
    elevationTexture = generateElevationDisplacementMap((tex) => {
      if (earthDiscUniformsRef.current) {
        earthDiscUniformsRef.current.uDisplacementMap.value = tex || elevationTexture;
      }
    });
    elevationTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    elevationTexture.minFilter = THREE.LinearMipmapLinearFilter;
    elevationTexture.magFilter = THREE.LinearFilter;

    const WORLD_DISC_RADIUS = 58.0;
    // 1. High-Density Continental Geometry (Radius 0.001 to 58.0)
    // 720 angular sectors x 240 concentric rings = ultra-dense vertex grid resolving thick Antarctic ice plateau, summits, and crevasses
    const continentalGeo = new THREE.RingGeometry(0.001, WORLD_DISC_RADIUS, 720, 240);
    const contPosAttr = continentalGeo.attributes.position;
    const contUvAttr = continentalGeo.attributes.uv;
    for (let i = 0; i < contPosAttr.count; i++) {
      const x = contPosAttr.getX(i);
      const y = contPosAttr.getY(i);
      contUvAttr.setXY(i, (x / WORLD_DISC_RADIUS) * 0.5 + 0.5, (y / WORLD_DISC_RADIUS) * 0.5 + 0.5);
    }
    contUvAttr.needsUpdate = true;
    continentalGeo.rotateX(-Math.PI / 2);
    continentalGeo.computeVertexNormals();

    // 2. Vast Outer Ocean Geometry (Radius 58.0 to 8000.0 - expansive flat ocean plane at identical sea level)
    const oceanGeo = new THREE.RingGeometry(WORLD_DISC_RADIUS, 8000.0, 256, 32);
    const oceanPosAttr = oceanGeo.attributes.position;
    const oceanUvAttr = oceanGeo.attributes.uv;
    for (let i = 0; i < oceanPosAttr.count; i++) {
      const x = oceanPosAttr.getX(i);
      const y = oceanPosAttr.getY(i);
      oceanUvAttr.setXY(i, (x / WORLD_DISC_RADIUS) * 0.5 + 0.5, (y / WORLD_DISC_RADIUS) * 0.5 + 0.5);
    }
    oceanUvAttr.needsUpdate = true;
    oceanGeo.rotateX(-Math.PI / 2);
    oceanGeo.computeVertexNormals();

    const earthDiscUniforms: Record<string, THREE.IUniform> = {
      uTime: { value: 0 },
      uDayTexture: { value: earthTexture },
      uHypsometricTexture: { value: hypsometricTexture },
      uMapColorMode: { value: 0.0 }, // 0.0 = Satellite, 1.0 = Hypsometric Physical Map
      uNightCitiesTexture: { value: nightCitiesTexture },
      uDisplacementMap: { value: elevationTexture },
      uDisplacementScale: { value: 1.0 },
      uShowMountainRelief: { value: 1.0 },
      uShowRealisticWater: { value: 1.0 },
      uShowOceanWaves: { value: 1.0 },
      uOceanWaveHeight: { value: 1.0 },
      uOceanAgitationMode: { value: 1.0 }, // 0.0 = calm, 1.0 = dynamic, 2.0 = storm
      uSunPos: { value: new THREE.Vector3(0, 7.5, 0) },
      uSunRadius: { value: 21.5 },
      uSunIntensity: { value: 1.0 },
      uMoonPos: { value: new THREE.Vector3(0, 6.5, 0) },
      uMoonRadius: { value: 25.0 },
      uMoonIntensity: { value: 0.8 },
      uMoonPhaseFrac: { value: 0.5 },
      uAmbientNight: { value: 0.04 },
      uShowCityLights: { value: 0.0 },
      uDynamicShadows: { value: 1.0 },
      uIsHuman: { value: 0.0 },
      uHumanDaylightFactor: { value: 0.0 },
      uIsMoonAboveHorizon: { value: 0.0 },
      uMaxRadius: { value: 8000.0 },
    };
    earthDiscUniformsRef.current = earthDiscUniforms;

    const discMat = new THREE.ShaderMaterial({
      uniforms: earthDiscUniforms,
      vertexShader: `
        uniform sampler2D uDisplacementMap;
        uniform float uDisplacementScale;
        uniform float uShowMountainRelief;
        uniform float uTime;
        uniform float uShowOceanWaves;
        uniform float uOceanWaveHeight;
        uniform float uOceanAgitationMode;

        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying float vElevation;

        // Smooth 3D Physical Ocean Waves (Gerstner / Harmonic 3D Waveform)
        struct Wave3D {
          float height;
          vec2 grad;
        };

        Wave3D getPhysical3DWaves(vec2 p, vec2 uv, float elev, float time, float agitationMode, float waveHeightSetting, sampler2D dispMap) {
          Wave3D w;
          w.height = 0.0;
          w.grad = vec2(0.0);

          float dist = length(p);
          float waveFade = clamp(1.0 - dist / 500.0, 0.0, 1.0);
          if (waveFade <= 0.001) return w;

          // Smooth shoreline attenuation: wave height strictly softens to 0 before touching continental landmass
          // This ensures waves never spill over beaches or climb onto soil!
          float shoreAtten = smoothstep(0.024, 0.008, elev);
          if (shoreAtten <= 0.0001) return w;

          float t = time * 0.85;

          // Regional Wandering Storm Agitation ("de vez em quando em certas partes do oceano")
          vec2 c1 = vec2(sin(t * 0.04) * 20.0 - 6.0, cos(t * 0.03) * 16.0 + 14.0);
          float storm1 = exp(-dot(p - c1, p - c1) / 360.0);

          float antarcticBelt = smoothstep(36.0, 46.0, dist) * smoothstep(56.0, 50.0, dist) * (0.65 + 0.35 * sin(atan(p.y, p.x) * 3.0 + t * 0.5));

          vec2 c3 = vec2(cos(t * 0.045) * 24.0 - 16.0, sin(t * 0.035) * 18.0 - 10.0);
          float storm3 = exp(-dot(p - c3, p - c3) / 480.0);

          float outerSwell = smoothstep(58.0, 140.0, dist) * (0.5 + 0.5 * sin(p.x * 0.02 + p.y * 0.02 + t * 0.6));

          float regionalAgitation = clamp(storm1 * 0.95 + antarcticBelt * 0.85 + storm3 * 0.90 + outerSwell * 0.75, 0.0, 1.0);
          if (agitationMode > 1.5) regionalAgitation = 1.0;
          else if (agitationMode < 0.5) regionalAgitation = 0.15;

          // Base amplitude for physical 3D wave height (tuned so waves are clearly 3D and undulating, but smooth and natural)
          float baseAmp = (0.045 + regionalAgitation * 0.065) * waveHeightSetting * waveFade * shoreAtten;

          // 3 harmonic wave trains with wavelengths 5.2, 3.8, 2.6 units (each spans 12-22 vertices -> perfectly smooth!)
          vec2 d1 = vec2(0.707, 0.707);
          vec2 d2 = vec2(-0.800, 0.600);
          vec2 d3 = vec2(0.500, -0.866);

          float k1 = 1.20;
          float k2 = 1.65;
          float k3 = 2.40;

          float ph1 = dot(p, d1) * k1 + t * 1.5;
          float ph2 = dot(p, d2) * k2 - t * 1.9;
          float ph3 = dot(p, d3) * k3 + t * 2.4;

          // Trochoidal / peaked crest shaping: sharp ocean crests and broad, natural troughs
          float s1 = sin(ph1);
          float s2 = sin(ph2);
          float s3 = sin(ph3);

          float crest1 = (exp(s1) - 1.0) / 1.718;
          float crest2 = (exp(s2) - 1.0) / 1.718;
          float crest3 = (exp(s3) - 1.0) / 1.718;

          float a1 = baseAmp * 0.50;
          float a2 = baseAmp * 0.32;
          float a3 = baseAmp * 0.18;

          // Waves undulate strictly at or below sea level (<= 0.0)
          w.height = min((a1 * crest1 + a2 * crest2 + a3 * crest3) - baseAmp * 0.40, 0.0);

          // Analytical derivatives for precise physical normal
          float c1_der = cos(ph1) * (exp(s1) / 1.718);
          float c2_der = cos(ph2) * (exp(s2) / 1.718);
          float c3_der = cos(ph3) * (exp(s3) / 1.718);

          w.grad = d1 * (a1 * k1 * c1_der)
                 + d2 * (a2 * k2 * c2_der)
                 + d3 * (a3 * k3 * c3_der);

          // Incoming 3D Coastal Swell rolling toward continental shorelines
          if (dist <= 58.0) {
            vec2 texel = vec2(1.0 / 1024.0, 1.0 / 1024.0);
            float hL = texture2D(dispMap, uv - vec2(texel.x * 2.5, 0.0)).r;
            float hR = texture2D(dispMap, uv + vec2(texel.x * 2.5, 0.0)).r;
            float hD = texture2D(dispMap, uv - vec2(0.0, texel.y * 2.5)).r;
            float hU = texture2D(dispMap, uv + vec2(0.0, texel.y * 2.5)).r;

            float maxNeigh = max(max(hR, hL), max(hU, hD));
            float coastZone = smoothstep(0.010, 0.022, maxNeigh) * smoothstep(0.024, 0.008, elev);

            if (coastZone > 0.01) {
              vec2 toCoast = vec2(hR - hL, hU - hD);
              float gradLen = length(toCoast);
              if (gradLen > 0.0002) {
                vec2 dirToShore = toCoast / gradLen;
                float coastK = 2.1;
                float coastPh = dot(p, dirToShore) * coastK - t * 2.2;
                float coastCrest = (exp(sin(coastPh)) - 1.0) / 1.718;
                float coastAmp = baseAmp * 0.50 * coastZone;

                w.height = min(w.height + coastAmp * (coastCrest - 0.40), 0.0);
                w.grad += dirToShore * (coastAmp * coastK * cos(coastPh) * (exp(sin(coastPh)) / 1.718));
              }
            }
          }

          return w;
        }

        void main() {
          vUv = uv;
          vec3 pos = position;

          float elev = texture2D(uDisplacementMap, uv).r;
          vElevation = elev;

          vec2 texel = vec2(1.0 / 1024.0, 1.0 / 1024.0);
          float hL = texture2D(uDisplacementMap, uv - vec2(texel.x, 0.0)).r;
          float hR = texture2D(uDisplacementMap, uv + vec2(texel.x, 0.0)).r;
          float hD = texture2D(uDisplacementMap, uv - vec2(0.0, texel.y)).r;
          float hU = texture2D(uDisplacementMap, uv + vec2(0.0, texel.y)).r;

          // 1. Continental terrain elevation displacement
          if (elev > 0.028) {
            float normH = (elev - 0.028) / 0.972;
            float h = pow(normH, 1.15) * uDisplacementScale * uShowMountainRelief * 1.3125;
            pos.y += h;

            float slopeFactor = uDisplacementScale * uShowMountainRelief * 13.5;
            vec3 slopeNorm = normalize(vec3((hL - hR) * slopeFactor, 1.0, (hD - hU) * slopeFactor));
            vNormal = normalize(mat3(modelMatrix) * slopeNorm);
          } 
          // 2. Real 3D Physical Ocean Waves (Undulating surface with smooth crests and analytical normals)
          else {
            if (uShowOceanWaves > 0.5) {
              Wave3D wave = getPhysical3DWaves(pos.xz, uv, elev, uTime, uOceanAgitationMode, uOceanWaveHeight, uDisplacementMap);
              pos.y = min(pos.y + wave.height, 0.0);

              vec3 waterSlopeNorm = normalize(vec3(-wave.grad.x, 1.0, -wave.grad.y));
              vNormal = normalize(mat3(modelMatrix) * waterSlopeNorm);
            } else {
              vNormal = normalize(mat3(modelMatrix) * vec3(0.0, 1.0, 0.0));
            }
          }

          vec4 worldPos = modelMatrix * vec4(pos, 1.0);
          vWorldPosition = worldPos.xyz;

          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform sampler2D uDayTexture;
        uniform sampler2D uHypsometricTexture;
        uniform float uMapColorMode;
        uniform sampler2D uNightCitiesTexture;
        uniform sampler2D uDisplacementMap;
        uniform float uDisplacementScale;
        uniform float uShowRealisticWater;
        uniform float uShowOceanWaves;
        uniform float uOceanWaveHeight;
        uniform float uOceanAgitationMode;
        uniform vec3 uSunPos;
        uniform float uSunRadius;
        uniform float uSunIntensity;
        uniform vec3 uMoonPos;
        uniform float uMoonRadius;
        uniform float uMoonIntensity;
        uniform float uMoonPhaseFrac;
        uniform float uAmbientNight;
        uniform float uShowCityLights;
        uniform float uDynamicShadows;
        uniform float uIsHuman;
        uniform float uHumanDaylightFactor;
        uniform float uIsMoonAboveHorizon;
        uniform float uMaxRadius;

        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying float vElevation;

        // Realistic Gentle Fluid Ocean Waves
        vec3 calculateRealisticOceanNormal(vec2 p, float time, float agitationMode, float waveHeightSetting) {
          float dist = length(p);
          float waveFade = clamp(1.0 - dist / 800.0, 0.0, 1.0);
          if (waveFade <= 0.001) return vec3(0.0, 1.0, 0.0);

          float t = time * 0.80;

          // Regional Wandering Storm Agitation ("de vez em quando em certas partes do oceano")
          // Smooth wandering centers that create natural ocean agitation zones
          vec2 c1 = vec2(sin(t * 0.04) * 20.0 - 6.0, cos(t * 0.03) * 16.0 + 14.0);
          float storm1 = exp(-dot(p - c1, p - c1) / 360.0);

          // Roaring Forties / Southern Ocean circumpolar wave belt
          float antarcticBelt = smoothstep(36.0, 46.0, dist) * smoothstep(56.0, 50.0, dist) * (0.65 + 0.35 * sin(atan(p.y, p.x) * 3.0 + t * 0.5));

          // Pacific migrating swell
          vec2 c3 = vec2(cos(t * 0.045) * 24.0 - 16.0, sin(t * 0.035) * 18.0 - 10.0);
          float storm3 = exp(-dot(p - c3, p - c3) / 480.0);

          // Outer ocean swell
          float outerSwell = smoothstep(58.0, 140.0, dist) * (0.5 + 0.5 * sin(p.x * 0.02 + p.y * 0.02 + t * 0.6));

          float regionalAgitation = clamp(storm1 * 0.9 + antarcticBelt * 0.8 + storm3 * 0.85 + outerSwell * 0.7, 0.0, 1.0);
          if (agitationMode > 1.5) regionalAgitation = 1.0;
          else if (agitationMode < 0.5) regionalAgitation = 0.15;

          // Calibrated ocean scale (disc radius is 58.0):
          // Swells have natural wavelengths around 2.0 to 6.0 world units, NOT microscopic grain!
          vec2 d1 = vec2(0.707, 0.707);
          vec2 d2 = vec2(-0.866, 0.500);
          vec2 d3 = vec2(0.500, -0.866);
          vec2 d4 = vec2(-0.382, -0.924);

          float ph1 = dot(p, d1) * 1.85 + t * 1.4;
          float ph2 = dot(p, d2) * 2.90 - t * 1.8;
          float ph3 = dot(p, d3) * 4.60 + t * 2.3;
          float ph4 = dot(p, d4) * 7.20 - t * 3.1;

          // Base amplitude is very subtle and silky-smooth (prevents any harsh facet look)
          float amp = (0.012 + regionalAgitation * 0.026) * waveHeightSetting * waveFade;

          vec2 grad = d1 * cos(ph1) * (amp * 1.0)
                    + d2 * cos(ph2) * (amp * 0.7)
                    + d3 * cos(ph3) * (amp * 0.45)
                    + d4 * cos(ph4) * (amp * 0.25);

          return normalize(vec3(-grad.x, 1.0, -grad.y));
        }

        // Gentle Coastal Shelf & Translucent Beach Surf
        struct CoastalOptics {
          float shelfProximity; // 0.0 = deep ocean, 1.0 = right at shore
          float gentleSurfFoam; // Soft translucent white foam right at the shoreline edge
          vec3 shallowColor;    // Beautiful Caribbean/Bahamas shallow turquoise tint
        };

        CoastalOptics calculateCoastalOptics(vec2 uv, float time, sampler2D dispMap) {
          CoastalOptics opt;
          opt.shelfProximity = 0.0;
          opt.gentleSurfFoam = 0.0;
          opt.shallowColor = vec3(0.04, 0.24, 0.35); // Shallow coastal turquoise

          vec2 texel = vec2(1.0 / 1024.0, 1.0 / 1024.0);
          float hC = texture2D(dispMap, uv).r;
          if (hC > 0.024) return opt; // On land

          // Sample neighbors to detect continental shelf distance
          float hR = texture2D(dispMap, uv + vec2(texel.x * 3.0, 0.0)).r;
          float hL = texture2D(dispMap, uv - vec2(texel.x * 3.0, 0.0)).r;
          float hU = texture2D(dispMap, uv + vec2(0.0, texel.y * 3.0)).r;
          float hD = texture2D(dispMap, uv - vec2(0.0, texel.y * 3.0)).r;
          float maxNeigh = max(max(hR, hL), max(hU, hD));

          // Continental shelf proximity (0.0 in open ocean, up to 1.0 touching shore)
          float prox = smoothstep(0.010, 0.022, maxNeigh) * smoothstep(0.024, 0.008, hC);
          if (prox <= 0.005) return opt;

          opt.shelfProximity = prox;

          // Soft tidal rhythm at the beach edge (slow 7-second oceanic surge)
          float tide = sin(time * 0.9 + dot(uv, vec2(18.0, 22.0))) * 0.5 + 0.5;
          // Thin, delicate translucent foam rim ONLY along the exact waterline where surf meets sand
          float waterLine = smoothstep(0.016, 0.023, hC + tide * 0.004);
          opt.gentleSurfFoam = waterLine * prox * 0.25;

          return opt;
        }

        void main() {
          float r = length(vWorldPosition.xz);
          if (r > uMaxRadius) {
            discard;
          }

          // Distance on the plane to the Sun's projection
          float distToSun = length(vWorldPosition.xz - uSunPos.xz);

          // Realistic daylight factor:
          float daylight = 0.0;
          if (uIsHuman > 0.5) {
            // IN HUMAN MODE: Daylight follows local solar altitude.
            // When the sun sets below the horizon (<= 0°), daylight smoothly and completely extinguishes to 0.0!
            daylight = uHumanDaylightFactor;
          } else {
            // IN GLOBAL PLANAR MODE: Daylight is the moving solar spotlight cone on the planar disc
            float rawDaylight = 0.0;
            if (distToSun < uSunRadius) {
              float normDist = distToSun / uSunRadius;
              rawDaylight = pow(smoothstep(1.0, 0.10, normDist), 1.25);
            }
            daylight = mix(1.0, rawDaylight, uDynamicShadows);
          }

          vec4 dayColor;
          vec4 nightCity = vec4(0.0);
          float isWater = 0.0;
          float beachFoam = 0.0;

          // Water normal simulation (combining real 3D physical wave slopes with fine micro-facets)
          vec3 waterNormal = vec3(0.0, 1.0, 0.0);
          if (uShowRealisticWater > 0.5) {
            vec3 microNormal = calculateRealisticOceanNormal(vWorldPosition.xz, uTime, uOceanAgitationMode, uOceanWaveHeight);
            waterNormal = normalize(vNormal * 0.72 + microNormal * 0.28);
          }

          // Inner world map & Antarctic ice disc is circular with radius up to 58.0
          if (r <= 58.0) {
            vec4 satColor = texture2D(uDayTexture, vUv);
            vec4 hypColor = texture2D(uHypsometricTexture, vUv);
            dayColor = mix(satColor, hypColor, uMapColorMode);

            nightCity = texture2D(uNightCitiesTexture, vUv);
            float dispVal = texture2D(uDisplacementMap, vUv).r;
            // Water detector: heightmap near 0.0 is ocean
            isWater = smoothstep(0.025, 0.008, dispVal);

            if (isWater > 0.01) {
              // Preserve authentic high-resolution satellite imagery ocean depth enhancement
              vec3 satWater = satColor.rgb;
              float luma = dot(satWater, vec3(0.299, 0.587, 0.114));
              vec3 deepOcean = vec3(0.018, 0.075, 0.175);
              vec3 enhancedWater = mix(deepOcean, satWater * vec3(0.85, 1.05, 1.20), smoothstep(0.02, 0.22, luma));

              // Natural shallow continental shelf turquoise along the coast
              CoastalOptics coast = calculateCoastalOptics(vUv, uTime, uDisplacementMap);
              beachFoam = coast.gentleSurfFoam;

              // Blend shallow coastal turquoise naturally where depth decreases
              enhancedWater = mix(enhancedWater, coast.shallowColor, coast.shelfProximity * 0.45);

              dayColor.rgb = mix(dayColor.rgb, enhancedWater, isWater * 0.85);
            } else {
              // Real solar directional lighting on mountain slopes and ridges (only under active daylight)
              if (vElevation > 0.06 && uDisplacementScale > 0.05 && daylight > 0.001) {
                vec3 sunDir = normalize(uSunPos - vWorldPosition);
                float slopeDot = max(0.12, dot(vNormal, sunDir));
                dayColor.rgb *= mix(1.0, 0.65 + 0.50 * slopeDot, daylight);
              }
            }
          } 
          // Continuous vast ocean beyond Antarctica with matching marine water tone & optics
          else {
            vec3 outerOceanColor = vec3(0.018, 0.075, 0.175);
            dayColor = vec4(outerOceanColor, 1.0);
            nightCity = vec4(0.0);
            isWater = 1.0;
          }

          // 1. Base dark nocturnal terrain & nocturnal water (completely dark when ambient is zero)
          vec3 baseNightTerrain = dayColor.rgb * uAmbientNight;
          if (isWater > 0.01) {
            vec3 nightWater = vec3(0.004, 0.012, 0.030) * (uAmbientNight * 1.2 + 0.01);
            baseNightTerrain = mix(baseNightTerrain, nightWater, isWater);
          }

          // 2. Dynamic Realistic Moonlight (Subtle reflected sunlight, never bright daylight)
          float effectiveMoonlight = 0.0;
          if (uIsHuman > 0.5) {
            // In Human Mode: The Moon ONLY illuminates the ground if it is physically ABOVE the horizon!
            if (uIsMoonAboveHorizon > 0.5) {
              effectiveMoonlight = uMoonIntensity * uMoonPhaseFrac;
            }
          } else {
            // In Global Mode: Moon illumination cone on the night-time side of the plane
            float distToMoon = length(vWorldPosition.xz - uMoonPos.xz);
            if (distToMoon < uMoonRadius) {
              float normDistMoon = distToMoon / uMoonRadius;
              float rawMoonlight = pow(smoothstep(1.0, 0.10, normDistMoon), 1.35);
              effectiveMoonlight = rawMoonlight * uMoonIntensity * uMoonPhaseFrac;
            }
          }

          // Realistic subtle nocturnal moonlight tone (gentle, cold silvery-blue • preserves deep night darkness)
          vec3 moonlightColor = vec3(0.42, 0.58, 0.85);
          vec3 moonlightDirect = dayColor.rgb * moonlightColor * (effectiveMoonlight * 0.035);

          // Illuminated nocturnal terrain with moonlight (or pitch-black if moon is absent/below horizon)
          vec3 illuminatedNightTerrain = baseNightTerrain + moonlightDirect;

          // 3. Photorealistic NASA Black Marble city lights in nighttime
          float nightTerminator = (1.0 - smoothstep(0.0, 0.08, daylight)) * uShowCityLights;
          vec3 activeCityLights = nightCity.rgb * (nightTerminator * 1.35);

          // 4. Daytime terrain under real solar sunlight spotlight
          // Balanced, calibrated albedo to prevent any blown-out overexposure or whiteout
          vec3 sunlitTerrain = dayColor.rgb * (0.85 + 0.35 * daylight) * min(uSunIntensity, 1.25);

          // Blend between dark plane (with nocturnal moonlight) and daytime under the moving sun
          vec3 finalColor = mix(illuminatedNightTerrain + activeCityLights, sunlitTerrain, daylight);

          // 5. Authentic Physical Ocean Fluid Optics (NASA-style Sunglint & Fresnel)
          if (isWater > 0.01 && uShowRealisticWater > 0.5) {
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);
            vec3 sunDir = normalize(uSunPos - vWorldPosition);

            // Sun specular reflection (Sunglint) & Fresnel under daylight
            if (daylight > 0.001 && uSunIntensity > 0.001) {
              // Half-vector for Blinn-Phong specular
              vec3 halfVec = normalize(sunDir + viewDir);
              float NdotH = max(0.0, dot(waterNormal, halfVec));

              // Calibrated natural Sunglint: Soft dual-lobe distribution without harsh blown-out spots
              float broadGlint = pow(NdotH, 24.0) * 0.22;
              float coreGlint = pow(NdotH, 88.0) * 0.85;

              float glintTotal = (broadGlint + coreGlint) * daylight * min(uSunIntensity, 1.25) * isWater;
              vec3 sunReflection = vec3(1.0, 0.97, 0.90) * glintTotal;
              finalColor += sunReflection;

              // Physical Fresnel reflectance (Schlick's approximation for water n = 1.333)
              float NdotV = clamp(dot(waterNormal, viewDir), 0.0, 1.0);
              float fresnel = 0.02 + 0.98 * pow(1.0 - NdotV, 4.0);

              // Reflected sky / atmospheric ambient tone
              vec3 reflectedSky = mix(vec3(0.01, 0.03, 0.07), vec3(0.20, 0.45, 0.72), daylight);
              vec3 fresnelSheen = reflectedSky * (fresnel * 0.45) * isWater;
              finalColor += fresnelSheen;

              // Subtle Subsurface Oceanic Glow
              float fwdScatter = max(0.0, dot(viewDir, -sunDir + vec3(0.0, 0.35, 0.0)));
              vec3 subSurface = vec3(0.02, 0.14, 0.22) * pow(fwdScatter, 4.0) * daylight * min(uSunIntensity, 1.25) * isWater;
              finalColor += subSurface;
            }

            // Moon lunar glint on nocturnal ocean surface (only when moon is actively illuminating)
            if (effectiveMoonlight > 0.001) {
              vec3 moonLightDir = normalize(uMoonPos - vWorldPosition);
              vec3 halfMoonVec = normalize(moonLightDir + viewDir);
              float NdotHMoon = max(0.0, dot(waterNormal, halfMoonVec));

              float moonGlint = (pow(NdotHMoon, 20.0) * 0.18 + pow(NdotHMoon, 75.0) * 0.65) * effectiveMoonlight * 0.05 * isWater;
              vec3 moonReflection = vec3(0.60, 0.80, 1.0) * moonGlint;
              finalColor += moonReflection;

              float NdotVMoon = clamp(dot(waterNormal, viewDir), 0.0, 1.0);
              float moonFresnel = 0.02 + 0.98 * pow(1.0 - NdotVMoon, 4.0);
              finalColor += vec3(0.04, 0.08, 0.15) * moonFresnel * effectiveMoonlight * 0.05 * isWater;
            }

            // Soft natural beach surf foam (delicate translucent foam only along the waterline touching the coast)
            if (beachFoam > 0.01 && uShowOceanWaves > 0.5) {
              vec3 foamTint = vec3(0.92, 0.97, 1.0);
              float foamIllum = uAmbientNight * 0.4 + daylight * 0.95 * min(uSunIntensity, 1.25) + effectiveMoonlight * 0.15 + 0.08;
              finalColor = mix(finalColor, foamTint * foamIllum, beachFoam * (0.35 + daylight * 0.25));
            }
          } else if (isWater <= 0.01) {
            // Authentic glacial ice & firn snow crystalline micro-sheen on the Antarctic Ice Wall & summits
            if (vElevation > 0.10 && daylight > 0.005) {
              vec3 viewDir = normalize(cameraPosition - vWorldPosition);
              vec3 sunDir = normalize(uSunPos - vWorldPosition);
              vec3 halfVec = normalize(sunDir + viewDir);
              float NdotH = max(0.0, dot(vNormal, halfVec));
              float snowSheen = pow(NdotH, 18.0) * 0.18 + pow(NdotH, 72.0) * 0.32;
              vec3 iceColor = vec3(0.92, 0.97, 1.0);
              finalColor += iceColor * snowSheen * daylight * min(uSunIntensity, 1.25);
            }

            // Terrestrial sun core bloom on land (only in global view under high noon sun, never in human view)
            if (uIsHuman < 0.5 && daylight > 0.05 && uSunIntensity > 0.05) {
              float sunCore = clamp(1.0 - (distToSun / (uSunRadius * 0.38)), 0.0, 1.0);
              finalColor += vec3(1.0, 0.96, 0.85) * pow(sunCore, 2.8) * 0.10 * uSunIntensity * daylight;
            }
          }

          // Gentle distant atmospheric cosmic fade at the far perimeter of the plane (avoids any harsh or curved cut)
          if (r > 4200.0) {
            float edgeFade = clamp((8000.0 - r) / 3800.0, 0.0, 1.0);
            finalColor *= (edgeFade * edgeFade);
          }

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });
    const earthGroup = new THREE.Group();
    earthGroup.position.y = 0.05;

    const continentalMesh = new THREE.Mesh(continentalGeo, discMat);
    earthGroup.add(continentalMesh);

    const oceanMesh = new THREE.Mesh(oceanGeo, discMat);
    earthGroup.add(oceanMesh);

    scene.add(earthGroup);
    earthDiscMeshRef.current = continentalMesh;

    // 7. Sun 3D Object & Solar Dynamic Spotlights (Photorealistic, No Artificial Light Contours or Shells)
    const sunGroup = new THREE.Group();

    // Photorealistic Solar Photosphere Sphere (Brilliant Yellow) with Real-Time Progressive Eclipse Occultation Shader
    const sunTex = generateSunTexture();
    const sunGeo = new THREE.SphereGeometry(0.52, 64, 64);
    const sunMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uMap: { value: sunTex },
        uSunColor: { value: new THREE.Color(1.0, 0.97, 0.76) },
        uEclipseActive: { value: 0.0 },
        uObscurerOffset: { value: new THREE.Vector2(999.0, 999.0) },
        uObscurerRadius: { value: 1.08 },
        uIsAnnular: { value: 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vViewNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;
          vViewNormal = normalize(normalMatrix * normal);
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPosition = wp.xyz;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform sampler2D uMap;
        uniform vec3 uSunColor;
        uniform float uEclipseActive;
        uniform vec2 uObscurerOffset;
        uniform float uObscurerRadius;
        uniform float uIsAnnular;

        varying vec2 vUv;
        varying vec3 vViewNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          // Centro incandescente branco-dourado usando o raio real câmera->Sol para nunca distorcer ao girar a câmera!
          vec3 N = normalize(vWorldNormal);
          vec3 V = normalize(cameraPosition - vWorldPosition);
          float facing = clamp(dot(N, V), 0.0, 1.0);
          vec3 coreWhite = vec3(1.0, 1.0, 0.98);
          vec3 limbGold = vec3(1.0, 0.86, 0.38);
          vec3 sunBase = mix(limbGold, coreWhite, pow(facing, 0.40));
          float alpha = 1.0;

          if (uEclipseActive > 0.5) {
            // Coordinate on the sun disk facing the camera:
            // vViewNormal.xy maps directly to the unit disk facing the viewer (-1.0 to +1.0)
            vec2 diskPos = vViewNormal.xy;

            // Offset to the center of the obscuring body (Lua ou corpo eclipsante)
            vec2 diff = diskPos - uObscurerOffset;
            float distToObs = length(diff);

            // Progressive coverage edge (crisp anti-aliased astronomical silhouette)
            float edgeWidth = 0.025;
            float coverage = 1.0 - smoothstep(uObscurerRadius - edgeWidth, uObscurerRadius + edgeWidth, distToObs);

            if (coverage > 0.001) {
              if (uIsAnnular > 0.5) {
                // Eclipse Solar Anular (Anel de Fogo):
                // A parte interna que faz o eclipse (corpo ocultador) é 100% escura e sem nenhum brilho sobre ela
                vec3 darkCore = vec3(0.0, 0.0, 0.0);
                float ringGlow = smoothstep(uObscurerRadius - 0.02, uObscurerRadius, distToObs) * 
                                 (1.0 - smoothstep(uObscurerRadius, uObscurerRadius + 0.02, distToObs));
                vec3 fieryRim = vec3(1.0, 0.6, 0.15) * ringGlow * 0.5;
                vec3 eclipsedColor = darkCore + fieryRim;
                sunBase = mix(sunBase, eclipsedColor, coverage);
              } else {
                // Eclipse Solar Total / Parcial (A Lua ou corpo eclipsante cobre o Sol):
                // Silhueta 100% preta, nítida e opaca, sem clarão nem ofuscamento sobre o corpo eclipsante
                vec3 darkCore = vec3(0.0, 0.0, 0.0);
                sunBase = mix(sunBase, darkCore, coverage);
              }
            }
          }

          gl_FragColor = vec4(sunBase, alpha);
        }
      `,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.renderOrder = 0;
    sunGroup.add(sunMesh);
    sunPhotosphereMatRef.current = sunMat;

    // Halo da Coroa e Cromosfera Solar (Additive Blending para luz pura ao redor do bordo solar)
    const planarCoronaHaloGeo = new THREE.SphereGeometry(0.52 * 1.06, 48, 32);
    const planarCoronaHaloMat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      side: THREE.BackSide,
      toneMapped: false,
      vertexShader: `
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPosition = wp.xyz;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main() {
          vec3 N = normalize(vWorldNormal);
          vec3 V = normalize(cameraPosition - vWorldPosition);
          float rim = 1.0 - abs(dot(N, V));
          float halo = pow(rim, 1.6);
          vec3 coronaCol = mix(vec3(1.0, 0.90, 0.52), vec3(1.0, 0.65, 0.18), rim);
          gl_FragColor = vec4(coronaCol * halo * 1.5, halo);
        }
      `,
    });
    const planarCoronaHaloMesh = new THREE.Mesh(planarCoronaHaloGeo, planarCoronaHaloMat);
    planarCoronaHaloMesh.renderOrder = 0;
    sunGroup.add(planarCoronaHaloMesh);

    // Solar Corona (Coroa Solar) Sprite for Total Solar Eclipse Totality
    const sunCoronaTex = generateSolarCoronaTexture();
    const sunCoronaMat = new THREE.SpriteMaterial({
      map: sunCoronaTex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      depthTest: true,
    });
    const sunCoronaSprite = new THREE.Sprite(sunCoronaMat);
    sunCoronaSprite.renderOrder = 0;
    const sunCoronaBaseScale = 4.8;
    sunCoronaSprite.scale.set(sunCoronaBaseScale, sunCoronaBaseScale, 1);
    sunGroup.add(sunCoronaSprite);
    sunCoronaSpriteRef.current = sunCoronaSprite;

    // Bright Yellow Sun Sparkle Glint with Shimmering Rays (Pure radiant solar light)
    const sunSparkleTex = generateSunSparkleTexture();
    const sunSparkleMat = new THREE.SpriteMaterial({
      map: sunSparkleTex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.98,
      depthWrite: false,
      depthTest: true,
      toneMapped: false,
    });
    const sunSparkleSprite = new THREE.Sprite(sunSparkleMat);
    sunSparkleSprite.renderOrder = 0;
    const sunSparkleBaseScale = 4.5;
    sunSparkleSprite.scale.set(sunSparkleBaseScale, sunSparkleBaseScale, 1);
    sunGroup.add(sunSparkleSprite);
    sunSparkleSpriteRef.current = sunSparkleSprite;

    scene.add(sunGroup);
    sunMeshRef.current = sunGroup;

    // Sun SpotLight shining directly down onto the planar surface with smooth fading penumbra
    const sunSpotLight = new THREE.SpotLight(0xfff6dc, 6.0, 45, THREE.MathUtils.degToRad(45), 0.75, 1.2);
    const spotTarget = new THREE.Object3D();
    scene.add(spotTarget);
    sunSpotLight.target = spotTarget;
    scene.add(sunSpotLight);
    sunSpotLightRef.current = sunSpotLight;
    sunSpotTargetRef.current = spotTarget;

    // Sun PointLight for local ambient glow strictly around the sun celestial sphere
    const sunPointLight = new THREE.PointLight(0xffebb0, 2.8, 8.0, 1.4);
    sunGroup.add(sunPointLight);
    sunPointLightRef.current = sunPointLight;

    // 8. Moon 3D Object & Solar-Illuminated Lunar Phase Shader (Photorealistic, Real Lunar Regolith & Selenography)
    const moonGroup = new THREE.Group();
    const moonGeo = new THREE.SphereGeometry(0.68, 64, 64);
    const moonTex = generateMoonTexture();

    // Shader Material for physically-accurate dynamic solar illumination, lunar phases & progressive Lunar Eclipse (Blood Moon)
    const moonShaderMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: true,
      depthTest: true,
      uniforms: {
        uMoonTexture: { value: moonTex },
        uSunWorldPosition: { value: new THREE.Vector3(0, 9, 0) },
        uEarthshine: { value: 0.06 },
        uSunlightIntensity: { value: 1.85 },
        uDaylightFactor: { value: 0.0 },
        uIsHuman: { value: 0.0 },
        uBloodMoonFactor: { value: 0.0 },
        uLunarEclipseActive: { value: 0.0 },
        uIsSolarEclipsing: { value: 0.0 },
        uSunAngularRadius: { value: 0.0150 },
        uLunarObscurerOffset: { value: new THREE.Vector2(999.0, 999.0) },
        uLunarObscurerRadius: { value: 1.15 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        varying vec3 vViewNormal;

        void main() {
          vUv = uv;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          vViewNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D uMoonTexture;
        uniform vec3 uSunWorldPosition;
        uniform float uEarthshine;
        uniform float uSunlightIntensity;
        uniform float uDaylightFactor;
        uniform float uIsHuman;
        uniform float uBloodMoonFactor;
        uniform float uLunarEclipseActive;
        uniform float uIsSolarEclipsing;
        uniform float uSunAngularRadius;
        uniform vec2 uLunarObscurerOffset;
        uniform float uLunarObscurerRadius;

        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        varying vec3 vViewNormal;

        void main() {
          // Quando a Lua transita na frente do Sol (Eclipse Solar):
          // A Lua é o corpo celeste físico que passa diretamente na frente do Sol.
          if (uIsSolarEclipsing > 0.5) {
            if (uIsHuman > 0.5) {
              // No modo de observador humano terrestre:
              // O observador olha através da atmosfera. Pelo espalhamento Rayleigh diurno,
              // a face escura da Lua Nova fora do Sol fica transparente/invisível no céu azul ao entrar e ao sair.
              // Mas qualquer fração da Lua projetada sobre o disco brilhante do Sol bloqueia a luz como silhueta negra nítida.
              vec3 rayToFrag = normalize(vWorldPosition - cameraPosition);
              vec3 rayToSun = normalize(uSunWorldPosition - cameraPosition);
              float cosTheta = dot(rayToFrag, rayToSun);

              // Raio angular dinâmico do Sol na abóbada celeste
              float minCos = cos(uSunAngularRadius);

              if (cosTheta < minCos) {
                // Fora do disco solar no céu diurno:
                if (uDaylightFactor > 0.08) {
                  discard;
                }
              }

              // Sobre o Sol (ou durante totalidade com céu escuro):
              gl_FragColor = vec4(vec3(0.0, 0.0, 0.0), 1.0);
              return;
            } else {
              // Em visão orbital global (espaço cósmico 3D):
              // A Lua é uma esfera 3D real posicionada na frente do Sol entre a Terra e o Sol!
              // Sua face voltada para o Sol recebe luz direta; sua face voltada para a Terra exibe
              // sombreamento suave, textura lunar e relevo esférico, permitindo ver nitidamente a Lua na frente do Sol.
              vec4 texColor = texture2D(uMoonTexture, vUv);
              vec3 sunDir = normalize(uSunWorldPosition - vWorldPosition);
              vec3 norm = normalize(vWorldNormal);
              float NdotL = dot(norm, sunDir);
              float directSunlight = smoothstep(-0.015, 0.035, NdotL);
              vec3 mineralLitColor = texColor.rgb * vec3(1.10, 1.12, 1.15);
              vec3 darkSide = texColor.rgb * vec3(0.05, 0.05, 0.06) + vec3(0.020, 0.022, 0.026);
              vec3 finalColor = mix(darkSide, mineralLitColor, directSunlight);
              gl_FragColor = vec4(finalColor, 1.0);
              return;
            }
          }

          vec4 texColor = texture2D(uMoonTexture, vUv);

          // Solar photon incident vector from Moon surface point towards the Sun
          vec3 sunDir = normalize(uSunWorldPosition - vWorldPosition);
          vec3 norm = normalize(vWorldNormal);

          // Lunar surface luminescence and crater maria structure
          float lum = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);

          // Lambertian & Hapke lunar regolith backscatter illumination
          float NdotL = dot(norm, sunDir);
          
          // Realistic sharp lunar terminator (Moon lacks atmosphere)
          float directSunlight = smoothstep(-0.015, 0.035, NdotL);

          // Hapke/Oren-Nayar regolith retro-reflection curve
          float regolithBrilliance = pow(clamp(NdotL + 0.08, 0.0, 1.0), 0.72) * 1.35 * uSunlightIntensity;

          // Normal lit hemisphere: Silvery-white mineral moonscape at night, chalky alabaster pale-white in daytime blue sky
          float ndotv = max(0.0, dot(norm, viewDir));
          float lommelSeeliger = max(0.0, NdotL) / max(0.14, max(0.0, NdotL) + ndotv * 0.65);
          float flatLimbBrilliance = mix(regolithBrilliance, lommelSeeliger * 1.45 * uSunlightIntensity, 0.58);

          vec3 nightLitColor = texColor.rgb * (vec3(1.08, 1.10, 1.14) + flatLimbBrilliance * 0.42);
          // Lua realista no céu diurno: preserva o contraste de mares/crateras e nunca satura como um segundo sol
          vec3 dayChalkWhite = mix(vec3(0.66, 0.78, 0.92), vec3(0.88, 0.92, 0.96), 0.35 + 0.65 * lum);
          vec3 dayLitColor = dayChalkWhite * (0.65 + 0.35 * clamp(flatLimbBrilliance * 0.45, 0.0, 1.0));
          vec3 mineralLitColor = mix(nightLitColor, dayLitColor, uDaylightFactor * uIsHuman);

          // Shaded hemisphere (à noite: 100% escuro, sem nenhuma luz ou brilho próprio; de dia: lado escuro 100% transparente)
          vec3 normalDarkSide = vec3(0.0005, 0.0005, 0.001);
          vec3 effectiveDarkSide = mix(normalDarkSide, vec3(0.0), uDaylightFactor * uIsHuman);

          // Renderização da fase lunar autêntica: lado iluminado tem luz mineral, lado escuro é totalmente preto à noite e transparente de dia
          vec3 finalColor = mix(effectiveDarkSide, mineralLitColor, directSunlight);

          // Opacity handling: à noite é 100% opaco (alpha = 1.0) para que o lado escuro nunca deixe luz ou halo de trás transparecer!
          // No céu diurno, o lado não iluminado é 100% transparente para mostrar o céu azul sem borda preta.
          float dayFactor = clamp(uDaylightFactor * uIsHuman, 0.0, 1.0);
          float darkSideOpacity = (1.0 - dayFactor) * (1.0 - smoothstep(0.0, 0.25, uDaylightFactor));
          float dayLitMaxAlpha = mix(1.0, 0.75, dayFactor);
          float alpha = mix(darkSideOpacity, dayLitMaxAlpha * smoothstep(-0.01, 0.06, directSunlight), directSunlight);

          // PROGRESSIVE LUNAR ECLIPSE / BLOOD MOON OCCULTATION:
          // Just like solar eclipse eats into the Sun disk, the Earth's umbral shadow (Ketu)
          // sweeps across the Moon disk: starts turning red from one edge -> covers half of the Moon ->
          // closes completely until 100% of the Moon glows in intense blood-red!
          if (uLunarEclipseActive > 0.5) {
            // Normalized coordinate on the Moon disk facing the camera (-1.0 to +1.0)
            vec2 diskPos = vViewNormal.xy;
            vec2 diff = diskPos - uLunarObscurerOffset;
            float distToObs = length(diff);

            // Progressive shadow boundary (soft penumbral transition)
            float penumbraWidth = 0.16;
            float shadowCoverage = 1.0 - smoothstep(uLunarObscurerRadius - penumbraWidth, uLunarObscurerRadius + 0.03, distToObs);

            if (shadowCoverage > 0.001) {
              // BLOOD MOON (Lua de Sangue) Realistic Chromatic Palette:
              // Rayleigh-scattered sunlight through Earth's atmosphere casts deep ruby, copper, and amber-crimson.
              vec3 bloodCoreColor = vec3(0.88, 0.15, 0.03) * (texColor.rgb * 1.65 + vec3(0.12, 0.02, 0.01));
              vec3 bloodLimbColor = vec3(1.45, 0.40, 0.10) * (texColor.rgb * 1.85 + vec3(0.24, 0.07, 0.02));
              
              // Radial disk gradient
              float diskGrad = length(diskPos);
              vec3 bloodEclipseColor = mix(bloodCoreColor, bloodLimbColor, clamp(diskGrad * 0.85, 0.0, 1.0));
              bloodEclipseColor *= (0.78 + regolithBrilliance * 0.50);

              // Advancing penumbral contact rim (amber/warm edge at boundary)
              float rimEdge = smoothstep(uLunarObscurerRadius - 0.22, uLunarObscurerRadius, distToObs) * 
                              (1.0 - smoothstep(uLunarObscurerRadius, uLunarObscurerRadius + 0.06, distToObs));
              vec3 rimGlow = vec3(1.05, 0.52, 0.14) * rimEdge * 1.35;
              vec3 eclipsedMoonColor = bloodEclipseColor + rimGlow;

              // Progressively cover the Moon: from normal moon -> glowing blood red
              finalColor = mix(finalColor, eclipsedMoonColor, shadowCoverage);

              // During eclipse, the covered parts remain glowing and clearly visible
              alpha = max(alpha, shadowCoverage * 0.98);
            }
          }

          if (alpha < 0.01) {
            discard;
          }

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
    });
    moonShaderMatRef.current = moonShaderMat;

    const moonMesh = new THREE.Mesh(moonGeo, moonShaderMat);
    moonMesh.renderOrder = 10;
    moonGroup.add(moonMesh);

    // Foco de Luz da Lua: Halo e coroa atmosférica proporcional DIRECIONAL
    // A luz e o halo só existem do lado iluminado pelo Sol. O lado escuro / preto NÃO TEM NENHUMA LUZ!
    const moonHaloGeo = new THREE.PlaneGeometry(1, 1);
    const moonHaloMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      toneMapped: false,
      uniforms: {
        uSunDir2D: { value: new THREE.Vector2(1.0, 0.0) },
        uMoonPhase: { value: 0.5 },
        uOpacity: { value: 0.82 },
        uColor: { value: new THREE.Color(0x3870cc) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec2 uSunDir2D;
        uniform float uMoonPhase;
        uniform float uOpacity;
        uniform vec3 uColor;
        varying vec2 vUv;

        void main() {
          vec2 p = vUv * 2.0 - 1.0;
          float r = length(p);
          // Disco interior da esfera lunar (raio 0.68 em escala total de halo ~ 4.2 -> r ~ 0.28)
          if (r > 1.0 || r < 0.28) {
            discard;
          }

          // Gradiente radial natural de dispersão de luz
          float radFalloff = smoothstep(0.28, 0.44, r) * pow(1.0 - smoothstep(0.38, 1.0, r), 1.6);

          // Mascaramento direcional astronômico rigoroso:
          // A luz e o halo só emanam do lado iluminado pelo Sol!
          // No lado escuro / preto da Lua, o halo é 100% CORTADO (ZERO LUZ):
          vec2 pDir = p / max(0.001, r);
          float cosTheta = dot(pDir, uSunDir2D);

          float phaseThreshold = (0.5 - uMoonPhase) * 2.2;
          float dirMask = smoothstep(phaseThreshold - 0.25, phaseThreshold + 0.35, cosTheta);

          // Transição suave para Lua Cheia (quando uMoonPhase > 0.88)
          float fullMoonBlend = smoothstep(0.85, 0.98, uMoonPhase);
          float finalMask = mix(dirMask, 1.0, fullMoonBlend);

          float intensity = uOpacity * finalMask * radFalloff * smoothstep(0.02, 0.14, uMoonPhase);
          if (intensity < 0.002) {
            discard;
          }

          // Cor da luz: centro prateado-azulado brilhante transitando para azul marinho atmosférico
          vec3 coreCol = vec3(0.92, 0.96, 1.0);
          vec3 haloCol = mix(coreCol, uColor, smoothstep(0.32, 0.72, r));

          gl_FragColor = vec4(haloCol * intensity, intensity);
        }
      `,
    });
    const moonHaloMesh = new THREE.Mesh(moonHaloGeo, moonHaloMat);
    moonHaloMesh.renderOrder = 5;
    moonGroup.add(moonHaloMesh);
    moonHaloMeshRef.current = moonHaloMesh;
    moonHaloMatRef.current = moonHaloMat;

    scene.add(moonGroup);
    moonMeshRef.current = moonGroup;

    // Moon SpotLight shining directly down onto planar surface
    const moonSpotLight = new THREE.SpotLight(0xcfd8dc, 1.2, 50, THREE.MathUtils.degToRad(55), 0.85, 1.3);
    const moonSpotTarget = new THREE.Object3D();
    scene.add(moonSpotTarget);
    moonSpotLight.target = moonSpotTarget;
    scene.add(moonSpotLight);
    moonSpotLightRef.current = moonSpotLight;
    moonSpotTargetRef.current = moonSpotTarget;

    // 9. Rahu & Ketu (Astros Ocultadores dos Eclipses - Eixo Nodal ☊ e ☋)
    // Conforme instrução: Não são rochas/pedras sólidas nem pretas por si só.
    // São nuvens/fumaças cósmicas circulares e translúcidas (quase transparentes),
    // que apenas ao transitar pelo Sol escurecem o disco solar.
    // Rahu: MAIOR que o Sol (raio 0.54 vs Sol 0.52) -> Causa o Eclipse Solar Total.
    // Ketu: MENOR que o Sol (raio 0.38 vs Sol 0.52) -> Causa o Eclipse Parcial/Anular e a Lua de Sangue.

    // Rahu (Nódulo Norte / Eclipse Solar Total)
    const rahuGroup = new THREE.Group();
    const rahuSmokeTex = generateSmokyCloudTexture('rahu');
    const rahuGeo = new THREE.SphereGeometry(0.54, 32, 32);
    const rahuMat = new THREE.MeshBasicMaterial({
      map: rahuSmokeTex,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    });
    const rahuMesh = new THREE.Mesh(rahuGeo, rahuMat);
    rahuMesh.renderOrder = 10;
    rahuGroup.add(rahuMesh);

    // Sprite billboard frontal de fumaça cósmica suave
    const rahuSpriteMat = new THREE.SpriteMaterial({
      map: rahuSmokeTex,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    });
    const rahuSprite = new THREE.Sprite(rahuSpriteMat);
    rahuSprite.renderOrder = 10;
    rahuSprite.scale.set(1.22, 1.22, 1);
    rahuGroup.add(rahuSprite);

    scene.add(rahuGroup);
    rahuMeshRef.current = rahuGroup;

    // Ketu (Nódulo Sul / Eclipse Parcial & Anular / Lua de Sangue - Aumentado em 100%)
    const ketuGroup = new THREE.Group();
    const ketuSmokeTex = generateSmokyCloudTexture('ketu');
    const ketuGeo = new THREE.SphereGeometry(0.76, 32, 32); // Aumentado em 100% (o dobro de 0.38)
    const ketuMat = new THREE.MeshBasicMaterial({
      map: ketuSmokeTex,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    });
    ketuMatRef.current = ketuMat;
    const ketuMesh = new THREE.Mesh(ketuGeo, ketuMat);
    ketuMesh.renderOrder = 10;
    ketuGroup.add(ketuMesh);

    // Sprite billboard frontal de fumaça cósmica avermelhada suave (aumentado em 100%)
    const ketuSpriteMat = new THREE.SpriteMaterial({
      map: ketuSmokeTex,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    });
    ketuSpriteMatRef.current = ketuSpriteMat;
    const ketuSprite = new THREE.Sprite(ketuSpriteMat);
    ketuSprite.renderOrder = 10;
    ketuSprite.scale.set(1.72, 1.72, 1); // Aumentado em 100% (o dobro de 0.86)
    ketuGroup.add(ketuSprite);

    scene.add(ketuGroup);
    ketuMeshRef.current = ketuGroup;

    // 10. Planets 3D Objects & Star-Sparkle Caustic Glints
    const planetMeshes = new Map<string, THREE.Group>();
    const planetSparkles = new Map<string, { sprite: THREE.Sprite; baseScale: number; phase: number }>();

    const planetList = [
      CELESTIAL_BODIES.mercury,
      CELESTIAL_BODIES.venus,
      CELESTIAL_BODIES.mars,
      CELESTIAL_BODIES.jupiter,
      CELESTIAL_BODIES.saturn,
      CELESTIAL_BODIES.uranus,
      CELESTIAL_BODIES.neptune,
    ];

    const planetPhaseOffsets: Record<string, number> = {
      mercury: 0.5,
      venus: 1.8,
      mars: 3.2,
      jupiter: 4.7,
      saturn: 2.1,
      uranus: 5.4,
      neptune: 0.9,
    };

    planetList.forEach(p => {
      const pGroup = new THREE.Group();
      const pGeo = new THREE.SphereGeometry(p.apparentSize, 24, 24);
      const pMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(p.color),
        emissive: new THREE.Color(p.color),
        emissiveIntensity: 0.42,
        roughness: 0.3,
        metalness: 0.2,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pGroup.add(pMesh);

      // Saturn Rings
      if (p.id === 'saturn') {
        const ringGeo = new THREE.RingGeometry(p.apparentSize * 1.5, p.apparentSize * 2.6, 32);
        ringGeo.rotateX(Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xfde047,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.65,
        });
        pGroup.add(new THREE.Mesh(ringGeo, ringMat));
      }

      // Star-Sparkle Diffraction Glint Sprite (Water reflection shimmer - reduced 50%)
      const sparkleTex = generateStarSparkleTexture(p.color);
      const sparkleMat = new THREE.SpriteMaterial({
        map: sparkleTex,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      });
      const sparkleSprite = new THREE.Sprite(sparkleMat);
      const baseScale = Math.max(0.9, p.apparentSize * 10);
      sparkleSprite.scale.set(baseScale, baseScale, 1);
      pGroup.add(sparkleSprite);

      planetSparkles.set(p.id, {
        sprite: sparkleSprite,
        baseScale,
        phase: planetPhaseOffsets[p.id] || Math.random() * 6.28,
      });

      scene.add(pGroup);
      planetMeshes.set(p.id, pGroup);
    });
    planetMeshesRef.current = planetMeshes;
    planetSparklesRef.current = planetSparkles;

    // 11. Orbit Lines Group (Tropics, Equator, Planetary Orbits & Live Tracks)
    const orbitGroup = new THREE.Group();
    orbitGroup.visible = false;
    scene.add(orbitGroup);
    orbitLinesGroupRef.current = orbitGroup;

    // Helper to create circle line
    const createCircleLine = (radius: number, color: number, opacity: number, y = 0.12) => {
      const ringPoints: THREE.Vector3[] = [];
      const segments = 128;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        ringPoints.push(new THREE.Vector3(radius * Math.sin(theta), y, radius * Math.cos(theta)));
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
      const lineMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
      });
      return new THREE.Line(lineGeo, lineMat);
    };

    // A. Reference Static Tropical Lines (Cancer 13.5, Equator 18.0 - Exact Center, Capricorn 22.5)
    // 1. Tropic of Cancer (23.5° N - Raio 13.5)
    const cancerLine = createCircleLine(13.5, 0xfde047, 0.45);
    orbitGroup.add(cancerLine);

    // 2. Linha do Equador (0° - Centro Exato do Trajeto Solar/Lunar - Raio 18.0)
    const equatorLine = createCircleLine(18.0, 0xf59e0b, 0.75);
    orbitGroup.add(equatorLine);

    // 3. Tropic of Capricorn (23.5° S - Raio 22.5)
    const capricornLine = createCircleLine(22.5, 0xf87171, 0.45);
    orbitGroup.add(capricornLine);

    // B. Unit circle template for dynamic tracking
    const unitRingPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const theta = (i / 128) * Math.PI * 2;
      unitRingPoints.push(new THREE.Vector3(Math.sin(theta), 0, Math.cos(theta)));
    }
    const unitGeo = new THREE.BufferGeometry().setFromPoints(unitRingPoints);

    // C. Dynamic Live Sun and Moon Active Trajectory Rings
    // Live Sun ring (tracks sunRadius and sunY)
    const sunLiveMat = new THREE.LineBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.85,
    });
    const sunLiveOrbit = new THREE.Line(unitGeo.clone(), sunLiveMat);
    orbitGroup.add(sunLiveOrbit);
    sunLiveOrbitRef.current = sunLiveOrbit;

    // Live Moon ring (tracks moonRadius and moonY)
    const moonLiveMat = new THREE.LineBasicMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.80,
    });
    const moonLiveOrbit = new THREE.Line(unitGeo.clone(), moonLiveMat);
    orbitGroup.add(moonLiveOrbit);
    moonLiveOrbitRef.current = moonLiveOrbit;

    // Live Rahu ring (tracks rahuRadius and rahuY)
    const rahuLiveMat = new THREE.LineBasicMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.70,
    });
    const rahuLiveOrbit = new THREE.Line(unitGeo.clone(), rahuLiveMat);
    orbitGroup.add(rahuLiveOrbit);
    rahuLiveOrbitRef.current = rahuLiveOrbit;

    // Live Ketu ring (tracks ketuRadius and ketuY)
    const ketuLiveMat = new THREE.LineBasicMaterial({
      color: 0x991b1b,
      transparent: true,
      opacity: 0.70,
    });
    const ketuLiveOrbit = new THREE.Line(unitGeo.clone(), ketuLiveMat);
    orbitGroup.add(ketuLiveOrbit);
    ketuLiveOrbitRef.current = ketuLiveOrbit;

    // D. Dynamic Live Planet Active Trajectory Rings (oscillating within tropical corridor)
    const planetLiveMap = new Map<string, THREE.Line>();
    const planetsList = (Object.values(CELESTIAL_BODIES) as CelestialBodyData[]).filter(
      b => b.id !== 'sun' && b.id !== 'moon'
    );
    planetsList.forEach(p => {
      const pLiveMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(p.color).getHex(),
        transparent: true,
        opacity: 0.35,
      });
      const pLiveOrbit = new THREE.Line(unitGeo.clone(), pLiveMat);
      orbitGroup.add(pLiveOrbit);
      planetLiveMap.set(p.id, pLiveOrbit);
    });
    planetLiveOrbitsRef.current = planetLiveMap;

    // 12. Altitude Rods Group
    const rodsGroup = new THREE.Group();
    scene.add(rodsGroup);
    altitudeRodsGroupRef.current = rodsGroup;

    // 13. Observer 3D Pin & Zenith Alignment Guide
    const observerGroup = new THREE.Group();

    // A. Ground base anchor ring
    const obsBaseGeo = new THREE.RingGeometry(0.3, 0.65, 32);
    obsBaseGeo.rotateX(-Math.PI / 2);
    const obsBaseMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const obsBaseMesh = new THREE.Mesh(obsBaseGeo, obsBaseMat);
    obsBaseMesh.position.y = 0.04;
    observerGroup.add(obsBaseMesh);

    // B. Pulsing radar ripple
    const rippleGeo = new THREE.RingGeometry(0.4, 1.6, 32);
    rippleGeo.rotateX(-Math.PI / 2);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const rippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
    rippleMesh.position.y = 0.05;
    observerGroup.add(rippleMesh);
    observerRippleMeshRef.current = rippleMesh;

    // C. 3D Pin Head (Cone + Sphere in Cyan/White)
    const pinConeGeo = new THREE.ConeGeometry(0.35, 1.2, 16);
    pinConeGeo.rotateX(Math.PI);
    pinConeGeo.translate(0, 0.6, 0);
    const pinConeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.2,
    });
    const pinConeMesh = new THREE.Mesh(pinConeGeo, pinConeMat);
    observerGroup.add(pinConeMesh);

    const pinSphereGeo = new THREE.SphereGeometry(0.35, 16, 16);
    pinSphereGeo.translate(0, 1.2, 0);
    const pinSphereMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0xe0f2fe,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const pinSphereMesh = new THREE.Mesh(pinSphereGeo, pinSphereMat);
    observerGroup.add(pinSphereMesh);

    // D. Vertical Zenith Guide Line (Points straight up to the celestial vault)
    const zenithPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 24, 0)];
    const zenithGeo = new THREE.BufferGeometry().setFromPoints(zenithPoints);
    const zenithMat = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      dashSize: 0.6,
      gapSize: 0.3,
      transparent: true,
      opacity: 0.65,
    });
    const zenithLine = new THREE.Line(zenithGeo, zenithMat);
    zenithLine.computeLineDistances();
    observerGroup.add(zenithLine);

    // E. Floating Billboard Location Label
    const tagCanvas = document.createElement('canvas');
    tagCanvas.width = 512;
    tagCanvas.height = 140;
    const tagTexture = new THREE.CanvasTexture(tagCanvas);
    tagTexture.minFilter = THREE.LinearFilter;
    const tagSpriteMat = new THREE.SpriteMaterial({
      map: tagTexture,
      transparent: true,
      depthWrite: false,
    });
    const tagSprite = new THREE.Sprite(tagSpriteMat);
    tagSprite.position.set(0, 2.6, 0);
    tagSprite.scale.set(6.4, 1.75, 1);
    observerGroup.add(tagSprite);
    observerTagSpriteRef.current = tagSprite;

    scene.add(observerGroup);
    observerGroupRef.current = observerGroup;

    // 14. 3D World Cities Reference Group (Rótulos, capitais e marcadores urbanos detalhados)
    const citiesGroup = new THREE.Group();
    citiesGroup.visible = false;
    const cityMarkersList: { pin: THREE.Mesh; sprite: THREE.Sprite; px: number; pz: number; normElev: number }[] = [];
    const cityPinGeo = new THREE.SphereGeometry(0.16, 12, 12);
    const capitalPinGeo = new THREE.OctahedronGeometry(0.22, 0);
    const capitalPinMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const majorCityPinMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const mountainPeakIds = new Set([
      'everest',
      'aconcagua',
      'denali',
      'logan',
      'kilimanjaro',
      'elbrus',
      'puncak_jaya',
      'mont_blanc',
      'kosciuszko',
      'pico_da_neblina',
      'pico_da_bandeira',
    ]);

    WORLD_CITIES.forEach((city) => {
      if (mountainPeakIds.has(city.id)) return;
      const coords = geoToPlanarCoords(city.lat, city.lng);
      const px = coords.x;
      const pz = coords.z;
      const normElev = sampleTerrainElevationNormalized(px, pz);

      const isCap = Boolean(city.isCapital);
      const pinMesh = new THREE.Mesh(isCap ? capitalPinGeo : cityPinGeo, isCap ? capitalPinMat : majorCityPinMat);
      pinMesh.position.set(px, 0.22, pz);
      citiesGroup.add(pinMesh);

      const cCanvas = document.createElement('canvas');
      cCanvas.width = 340;
      cCanvas.height = 84;
      const cctx = cCanvas.getContext('2d');
      if (cctx) {
        cctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
        cctx.strokeStyle = isCap ? '#fbbf24' : '#38bdf8';
        cctx.lineWidth = 2.5;
        cctx.beginPath();
        cctx.roundRect(4, 4, 332, 76, 14);
        cctx.fill();
        cctx.stroke();

        cctx.font = 'bold 22px sans-serif';
        cctx.fillStyle = isCap ? '#fef08a' : '#f8fafc';
        cctx.textAlign = 'center';
        cctx.textBaseline = 'middle';
        cctx.fillText(`${isCap ? '★ ' : '• '}${city.namePt}`, 170, 29);

        cctx.font = 'bold 16px monospace';
        cctx.fillStyle = isCap ? '#fbbf24' : '#7dd3fc';
        cctx.fillText(`${city.countryPt}${city.timezoneName ? ' • ' + city.timezoneName : ''}`, 170, 56);
      }

      const cTex = new THREE.CanvasTexture(cCanvas);
      cTex.minFilter = THREE.LinearFilter;
      const cSpriteMat = new THREE.SpriteMaterial({
        map: cTex,
        transparent: true,
        depthWrite: false,
      });
      const cSprite = new THREE.Sprite(cSpriteMat);
      cSprite.position.set(px, 0.68, pz);
      cSprite.scale.set(isCap ? 2.9 : 2.5, isCap ? 0.72 : 0.62, 1);
      citiesGroup.add(cSprite);

      cityMarkersList.push({ pin: pinMesh, sprite: cSprite, px, pz, normElev });
    });

    scene.add(citiesGroup);
    citiesGroupRef.current = citiesGroup;
    cityMarkersListRef.current = cityMarkersList;

    // 14A.1. Nomes dos Astros (Rótulos visuais de identificação 3D)
    const astroLabelsGroup = new THREE.Group();
    astroLabelsGroup.visible = false;
    const astroSpritesMap = new Map<string, THREE.Sprite>();
    const astroSymbols: Record<string, string> = {
      sun: '☀️',
      moon: '🌙',
      mercury: '☿',
      venus: '♀',
      mars: '♂',
      jupiter: '♃',
      saturn: '♄',
      uranus: '♅',
      neptune: '♆',
      rahu: '☊',
      ketu: '☋',
    };

    (Object.values(CELESTIAL_BODIES) as CelestialBodyData[]).forEach((body) => {
      const aCanvas = document.createElement('canvas');
      aCanvas.width = 360;
      aCanvas.height = 92;
      const actx = aCanvas.getContext('2d');
      if (actx) {
        actx.fillStyle = 'rgba(2, 6, 23, 0.90)';
        actx.strokeStyle = body.color || '#38bdf8';
        actx.lineWidth = 3.5;
        actx.beginPath();
        actx.roundRect(6, 6, 348, 80, 18);
        actx.fill();
        actx.stroke();

        const shortName = body.name.split(' (')[0];
        const sym = astroSymbols[body.id] || '✦';
        actx.font = 'bold 26px sans-serif';
        actx.fillStyle = '#ffffff';
        actx.textAlign = 'center';
        actx.textBaseline = 'middle';
        actx.fillText(`${sym} ${shortName}`, 180, 32);

        actx.font = 'bold 17px monospace';
        actx.fillStyle = body.color || '#7dd3fc';
        actx.fillText(`${body.rulingSign} • ${body.distanceKm.toLocaleString('pt-BR')} km`, 180, 62);
      }
      const aTex = new THREE.CanvasTexture(aCanvas);
      aTex.minFilter = THREE.LinearFilter;
      const aMat = new THREE.SpriteMaterial({
        map: aTex,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      });
      const aSprite = new THREE.Sprite(aMat);
      aSprite.scale.set(4.4, 1.12, 1);
      astroLabelsGroup.add(aSprite);
      astroSpritesMap.set(body.id, aSprite);
    });
    scene.add(astroLabelsGroup);
    astroLabelsGroupRef.current = astroLabelsGroup;
    astroLabelSpritesRef.current = astroSpritesMap;

    // 14A.2. Linhas de Grade (Círculos de latitude e meridianos radiais)
    const gridLinesGroup = new THREE.Group();
    gridLinesGroup.visible = false;

    const createGridTextBadge = (text: string, borderColor: string, scale = 2.4): THREE.Sprite => {
      const gCanvas = document.createElement('canvas');
      gCanvas.width = 220;
      gCanvas.height = 56;
      const gctx = gCanvas.getContext('2d')!;
      gctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
      gctx.strokeStyle = borderColor;
      gctx.lineWidth = 2.5;
      gctx.beginPath();
      gctx.roundRect(4, 4, 212, 48, 12);
      gctx.fill();
      gctx.stroke();
      gctx.font = 'bold 20px monospace';
      gctx.fillStyle = '#f8fafc';
      gctx.textAlign = 'center';
      gctx.textBaseline = 'middle';
      gctx.fillText(text, 110, 28);
      const gTex = new THREE.CanvasTexture(gCanvas);
      gTex.minFilter = THREE.LinearFilter;
      const gMat = new THREE.SpriteMaterial({
        map: gTex,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      });
      const sp = new THREE.Sprite(gMat);
      sp.scale.set(scale, scale * 0.26, 1);
      return sp;
    };

    const latCircles: { lat: number; label?: string; color: number; opacity: number }[] = [
      { lat: 75, color: 0x38bdf8, opacity: 0.35 },
      { lat: 66.5, label: '66.5°N Ártico', color: 0x7dd3fc, opacity: 0.65 },
      { lat: 60, label: '60°N', color: 0x38bdf8, opacity: 0.45 },
      { lat: 45, color: 0x38bdf8, opacity: 0.35 },
      { lat: 30, label: '30°N', color: 0x38bdf8, opacity: 0.45 },
      { lat: 23.5, label: '23.5°N Câncer', color: 0xfbbf24, opacity: 0.78 },
      { lat: 15, color: 0x38bdf8, opacity: 0.35 },
      { lat: 0, label: '0° Equador', color: 0x22d3ee, opacity: 0.90 },
      { lat: -15, color: 0x38bdf8, opacity: 0.35 },
      { lat: -23.5, label: '23.5°S Capricórnio', color: 0xf87171, opacity: 0.78 },
      { lat: -30, label: '30°S', color: 0x38bdf8, opacity: 0.45 },
      { lat: -45, color: 0x38bdf8, opacity: 0.35 },
      { lat: -60, label: '60°S', color: 0x38bdf8, opacity: 0.45 },
      { lat: -66.5, label: '66.5°S Antártico', color: 0x7dd3fc, opacity: 0.65 },
      { lat: -75, color: 0x38bdf8, opacity: 0.35 },
      { lat: -90, label: '90°S Borda Antártica', color: 0xe2e8f0, opacity: 0.75 },
    ];

    latCircles.forEach((lc) => {
      const r = ((90 - lc.lat) / 180) * 36.0;
      const segs = 128;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= segs; i++) {
        const th = (i / segs) * Math.PI * 2;
        const gx = r * Math.sin(th);
        const gz = r * Math.cos(th);
        pts.push(new THREE.Vector3(gx, 0.25, gz));
      }
      const lGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const lMat = new THREE.LineBasicMaterial({
        color: lc.color,
        transparent: true,
        opacity: lc.opacity,
        depthTest: false,
      });
      const line = new THREE.Line(lGeo, lMat);
      line.renderOrder = 4;
      gridLinesGroup.add(line);

      if (lc.label) {
        const hexStr = '#' + new THREE.Color(lc.color).getHexString();
        const badge = createGridTextBadge(lc.label, hexStr, 2.7);
        badge.position.set(0, 0.55, r);
        gridLinesGroup.add(badge);
      }
    });

    // 24 Radial Longitude Meridians (every 15°)
    for (let deg = 0; deg < 360; deg += 15) {
      const rad = (deg * Math.PI) / 180;
      const isCardinal = deg % 90 === 0;
      const rStart = 1.2;
      const rEnd = 36.0;
      const mPts: THREE.Vector3[] = [
        new THREE.Vector3(rStart * Math.sin(rad), 0.25, rStart * Math.cos(rad)),
        new THREE.Vector3(rEnd * Math.sin(rad), 0.25, rEnd * Math.cos(rad)),
      ];
      const mGeo = new THREE.BufferGeometry().setFromPoints(mPts);
      const mMat = new THREE.LineBasicMaterial({
        color: deg === 0 ? 0xfbbf24 : isCardinal ? 0x38bdf8 : 0x0284c7,
        transparent: true,
        opacity: deg === 0 ? 0.85 : isCardinal ? 0.60 : 0.35,
        depthTest: false,
      });
      const mLine = new THREE.Line(mGeo, mMat);
      mLine.renderOrder = 4;
      gridLinesGroup.add(mLine);

      if (deg % 45 === 0) {
        const lngVal = deg <= 180 ? deg : deg - 360;
        const lngText =
          lngVal === 0
            ? '0° GMT'
            : lngVal === 180
              ? '180° IDL'
              : lngVal > 0
                ? `${lngVal}° L`
                : `${Math.abs(lngVal)}° O`;
        const mBadge = createGridTextBadge(lngText, deg === 0 ? '#fbbf24' : '#38bdf8', 2.2);
        mBadge.position.set(37.6 * Math.sin(rad), 0.55, 37.6 * Math.cos(rad));
        gridLinesGroup.add(mBadge);
      }
    }

    scene.add(gridLinesGroup);
    gridLinesGroupRef.current = gridLinesGroup;

    // 14A.3. Coordenadas e Bússola Cardinal Global (N, S, L, O e Eixos)
    const compassGroup = new THREE.Group();
    compassGroup.visible = false;
    const cardinalPoints = [
      { label: 'NORTE (Polo Central 90°N)', x: 0, y: 1.8, z: 0, color: '#38bdf8' },
      { label: 'SUL (0° Meridiano)', x: 0, y: 0.9, z: 39.5, color: '#f87171' },
      { label: 'LESTE (90° L)', x: 39.5, y: 0.9, z: 0, color: '#fbbf24' },
      { label: 'OESTE (90° O)', x: -39.5, y: 0.9, z: 0, color: '#34d399' },
      { label: 'SUL (180° Antimeridiano)', x: 0, y: 0.9, z: -39.5, color: '#f87171' },
    ];
    cardinalPoints.forEach((cp) => {
      const sp = createGridTextBadge(cp.label, cp.color, 3.6);
      sp.position.set(cp.x, cp.y, cp.z);
      compassGroup.add(sp);
    });
    scene.add(compassGroup);
    compassGroupRef.current = compassGroup;

    // 14A.4. Cinturão do Zodíaco 3D (Faixa com os 12 símbolos astrológicos ao longo do firmamento)
    const zodiacBeltGroup = new THREE.Group();
    zodiacBeltGroup.visible = false;
    const zodiacRadius = 28.5;
    const zodiacHeight = 3.2;
    const zodiacY = 12.2;

    const zodiacBandGeo = new THREE.CylinderGeometry(zodiacRadius, zodiacRadius, zodiacHeight, 96, 1, true);
    const zodiacBandMat = new THREE.MeshBasicMaterial({
      color: 0x4f46e5,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const zodiacBandMesh = new THREE.Mesh(zodiacBandGeo, zodiacBandMat);
    zodiacBandMesh.position.y = zodiacY;
    zodiacBeltGroup.add(zodiacBandMesh);

    // Top, middle (ecliptic), and bottom golden rings of the Zodiac Belt
    const topZRing = createCircleLine(zodiacRadius, 0xfbbf24, 0.65, zodiacY + zodiacHeight / 2);
    const midZRing = createCircleLine(zodiacRadius, 0xfde047, 0.35, zodiacY);
    const botZRing = createCircleLine(zodiacRadius, 0xfbbf24, 0.65, zodiacY - zodiacHeight / 2);
    zodiacBeltGroup.add(topZRing, midZRing, botZRing);

    const ZODIAC_SIGNS = [
      { glyph: '♈', name: 'ÁRIES', element: 'Fogo', color: '#f97316' },
      { glyph: '♉', name: 'TOURO', element: 'Terra', color: '#10b981' },
      { glyph: '♊', name: 'GÊMEOS', element: 'Ar', color: '#38bdf8' },
      { glyph: '♋', name: 'CÂNCER', element: 'Água', color: '#818cf8' },
      { glyph: '♌', name: 'LEÃO', element: 'Fogo', color: '#fbbf24' },
      { glyph: '♍', name: 'VIRGEM', element: 'Terra', color: '#34d399' },
      { glyph: '♎', name: 'LIBRA', element: 'Ar', color: '#7dd3fc' },
      { glyph: '♏', name: 'ESCORPIÃO', element: 'Água', color: '#c084fc' },
      { glyph: '♐', name: 'SAGITÁRIO', element: 'Fogo', color: '#fb923c' },
      { glyph: '♑', name: 'CAPRICÓRNIO', element: 'Terra', color: '#2dd4bf' },
      { glyph: '♒', name: 'AQUÁRIO', element: 'Ar', color: '#60a5fa' },
      { glyph: '♓', name: 'PEIXES', element: 'Água', color: '#a78bfa' },
    ];

    ZODIAC_SIGNS.forEach((sign, idx) => {
      // Divider line at start of 30° house
      const divAngle = (idx * 30 * Math.PI) / 180;
      const divPts = [
        new THREE.Vector3(
          zodiacRadius * Math.cos(divAngle),
          zodiacY - zodiacHeight / 2,
          zodiacRadius * Math.sin(divAngle)
        ),
        new THREE.Vector3(
          zodiacRadius * Math.cos(divAngle),
          zodiacY + zodiacHeight / 2,
          zodiacRadius * Math.sin(divAngle)
        ),
      ];
      const divLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(divPts),
        new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.50 })
      );
      zodiacBeltGroup.add(divLine);

      // Sign glyph + name badge at center of 30° house (+15°)
      const midAngle = ((idx * 30 + 15) * Math.PI) / 180;
      const zCanvas = document.createElement('canvas');
      zCanvas.width = 280;
      zCanvas.height = 104;
      const zctx = zCanvas.getContext('2d')!;
      zctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
      zctx.strokeStyle = sign.color;
      zctx.lineWidth = 3.5;
      zctx.beginPath();
      zctx.roundRect(6, 6, 268, 92, 18);
      zctx.fill();
      zctx.stroke();

      zctx.font = 'bold 34px sans-serif';
      zctx.fillStyle = sign.color;
      zctx.textAlign = 'center';
      zctx.textBaseline = 'middle';
      zctx.fillText(`${sign.glyph} ${sign.name}`, 140, 38);

      zctx.font = 'bold 18px monospace';
      zctx.fillStyle = '#e2e8f0';
      zctx.fillText(`${idx * 30}° - ${(idx + 1) * 30}° • ${sign.element}`, 140, 74);

      const zTex = new THREE.CanvasTexture(zCanvas);
      zTex.minFilter = THREE.LinearFilter;
      const zSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: zTex,
          transparent: true,
          depthWrite: false,
        })
      );
      zSprite.position.set(zodiacRadius * Math.cos(midAngle), zodiacY, zodiacRadius * Math.sin(midAngle));
      zSprite.scale.set(4.5, 1.68, 1);
      zodiacBeltGroup.add(zSprite);
    });

    scene.add(zodiacBeltGroup);
    zodiacBeltGroupRef.current = zodiacBeltGroup;

    // 14A.5. Foco Solar & Feixe (Cone Volumétrico Translúcido da Luz Solar em Modo Global)
    const solarConeGeo = new THREE.CylinderGeometry(0.03, 1.0, 1.0, 64, 16, true);
    solarConeGeo.translate(0, 0.5, 0);
    const solarConeMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0.0 },
        uIntensity: { value: 1.0 },
        uColor: { value: new THREE.Color(0xffe88a) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          vNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uIntensity;
        uniform vec3 uColor;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          if (uIntensity < 0.01) discard;
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float edgeSoft = pow(clamp(abs(dot(vNormal, viewDir)), 0.0, 1.0), 0.75);
          // vUv.y = 1.0 at top (Sun), 0.0 at bottom (Earth ground)
          float vertGrad = pow(vUv.y, 0.55) * smoothstep(0.0, 0.14, vUv.y);
          float rayShimmer = 0.88 + 0.12 * sin(vUv.x * 37.699 + uTime * 1.5);
          float alpha = 0.24 * vertGrad * edgeSoft * rayShimmer * uIntensity;
          vec3 beamCol = mix(uColor, vec3(1.0, 0.99, 0.92), pow(vUv.y, 1.8));
          gl_FragColor = vec4(beamCol, clamp(alpha, 0.0, 0.55));
        }
      `,
    });
    const solarConeMesh = new THREE.Mesh(solarConeGeo, solarConeMat);
    solarConeMesh.visible = false;
    solarConeMesh.renderOrder = 2;
    scene.add(solarConeMesh);
    solarFocusConeRef.current = solarConeMesh;
    solarFocusConeMatRef.current = solarConeMat;

    // 14A.6. Atmosfera Terrestre (Geral) - Domo Difuso Planar & Brilho Volumétrico Rayleigh
    const atmoDomeGeo = new THREE.SphereGeometry(46.2, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    atmoDomeGeo.scale(1.0, 0.30, 1.0);
    const atmoDomeMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uSunPos: { value: new THREE.Vector3(0, 8, 0) },
        uOpacity: { value: 0.85 },
        uTime: { value: 0.0 },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          vNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 uSunPos;
        uniform float uOpacity;
        uniform float uTime;
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float fresnel = pow(1.0 - clamp(abs(dot(viewDir, vNormal)), 0.0, 1.0), 1.65);
          float distToSun = length(vWorldPos.xz - uSunPos.xz);
          float dayFactor = smoothstep(32.0, 4.0, distToSun);
          float twilightFactor = smoothstep(36.0, 20.0, distToSun) * (1.0 - smoothstep(18.0, 8.0, distToSun));

          vec3 dayAzure = vec3(0.14, 0.56, 1.0);
          vec3 twilightGold = vec3(0.98, 0.58, 0.22);
          vec3 nightSapphire = vec3(0.05, 0.18, 0.48);

          vec3 col = mix(nightSapphire, dayAzure, dayFactor);
          col = mix(col, twilightGold, twilightFactor * 0.55);

          float heightFade = smoothstep(0.0, 1.2, vWorldPos.y);
          float alpha = (0.14 + 0.34 * fresnel + 0.16 * dayFactor) * heightFade * uOpacity;
          gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.68));
        }
      `,
    });
    const atmoDomeMesh = new THREE.Mesh(atmoDomeGeo, atmoDomeMat);
    atmoDomeMesh.position.y = 0.05;
    atmoDomeMesh.visible = false;
    atmoDomeMesh.renderOrder = 1;
    scene.add(atmoDomeMesh);
    atmosphereGlowRef.current = atmoDomeMesh;
    atmosphereGlowMatRef.current = atmoDomeMat;

    // 14B. 3D World Mountain Peaks & Mountain Ranges Group
    const mountainPeaksGroup = new THREE.Group();
    const mountainMarkersList: { beacon: THREE.Mesh; sprite: THREE.Sprite; baseElevMeters: number; px: number; pz: number }[] = [];

    const peakPyramidGeo = new THREE.ConeGeometry(0.24, 0.55, 4);
    peakPyramidGeo.rotateX(Math.PI); // Point apex upwards

    WORLD_MOUNTAIN_PEAKS.forEach((peak) => {
      const coords = geoToPlanarCoords(peak.lat, peak.lng);
      const px = coords.x;
      const pz = coords.z;

      const peakItem = new THREE.Group();

      const isGlacial = peak.elevationMeters >= 6000;
      const isExtreme = peak.elevationMeters >= 4000;
      const isHigh = peak.elevationMeters >= 2000;
      const beaconColor = isGlacial ? 0xffffff : (isExtreme ? 0x991b1b : (isHigh ? 0xef4444 : 0xeab308));

      const beaconMat = new THREE.MeshStandardMaterial({
        color: beaconColor,
        emissive: beaconColor,
        emissiveIntensity: 0.55,
        roughness: 0.25,
        metalness: 0.6,
      });
      const beaconMesh = new THREE.Mesh(peakPyramidGeo, beaconMat);
      beaconMesh.position.set(px, 0.35, pz);
      peakItem.add(beaconMesh);

      // Summit Label Sprite with elevation badge
      const spriteCanvas = document.createElement('canvas');
      spriteCanvas.width = 380;
      spriteCanvas.height = 96;
      const sctx = spriteCanvas.getContext('2d');
      if (sctx) {
        sctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
        sctx.strokeStyle = isGlacial ? '#ffffff' : (isExtreme ? '#f87171' : (isHigh ? '#fb923c' : '#facc15'));
        sctx.lineWidth = 3;
        sctx.beginPath();
        sctx.roundRect(4, 4, 372, 88, 16);
        sctx.fill();
        sctx.stroke();

        sctx.font = 'bold 24px sans-serif';
        sctx.fillStyle = '#ffffff';
        sctx.textAlign = 'center';
        sctx.textBaseline = 'middle';
        sctx.fillText(`▲ ${peak.name}`, 190, 32);

        sctx.font = 'bold 20px monospace';
        sctx.fillStyle = isGlacial ? '#f8fafc' : (isExtreme ? '#fca5a5' : (isHigh ? '#fdba74' : '#fef08a'));
        sctx.fillText(`${peak.elevationMeters.toLocaleString('pt-BR')}m • ${peak.mountainRange}`, 190, 64);
      }

      const spriteTex = new THREE.CanvasTexture(spriteCanvas);
      spriteTex.minFilter = THREE.LinearFilter;
      const spriteMat = new THREE.SpriteMaterial({
        map: spriteTex,
        transparent: true,
        depthWrite: false,
      });
      const labelSprite = new THREE.Sprite(spriteMat);
      labelSprite.position.set(px, 0.95, pz);
      labelSprite.scale.set(3.4, 0.86, 1);
      peakItem.add(labelSprite);

      mountainPeaksGroup.add(peakItem);
      mountainMarkersList.push({
        beacon: beaconMesh,
        sprite: labelSprite,
        baseElevMeters: peak.elevationMeters,
        px,
        pz,
      });
    });

    scene.add(mountainPeaksGroup);
    mountainPeaksGroupRef.current = mountainPeaksGroup;
    mountainMarkersListRef.current = mountainMarkersList;

    // 14. As 5 Camadas da Atmosfera (0 a 10.000 km) 3D System
    const atmosphere3D = createAtmosphereLayers3D(scene);
    atmosphere3DRef.current = atmosphere3D;

    // 15. Atmospheric 3D Volumetric Cloud System
    const clouds3D = createAtmosphericClouds3D(scene);
    clouds3DRef.current = clouds3D;

    // 17. Real-Time Global Weather Precipitation & Badges 3D System
    const weather3D = createWeatherSystem3D(scene);
    weather3DRef.current = weather3D;
    fetchGlobalWeatherBatch(GLOBAL_WEATHER_STATIONS)
      .then((stations) => {
        weather3D.updateWeatherData(stations);
      })
      .catch((err) => {
        console.warn('Initial weather stations load:', err);
      });

    // 18. Human Observer 3D Ground Environment (Biomes: Field / City / Forest / Beach)
    const observerEnv3D = new ObserverEnvironment3D();
    scene.add(observerEnv3D.group);
    observerEnv3DRef.current = observerEnv3D;

    // Responsive Resize Handler with ResizeObserver
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
          const isMobileNow = w < 768 || ('ontouchstart' in window);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileNow ? 1.75 : 2));
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    // 13. Dynamic Render Loop
    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const store = useSimulationStore.getState();

      if (store.isPlaying) {
        store.addTime(delta * store.playbackSpeed);
      }

      const positions = calculateAstroPositions(store.currentDate, store.settings);

      // A. Observer Geometry & Daylight Factor for Local Sky Perspective
      const obsGround = geoToPlanarCoords(store.settings.observerLat, store.settings.observerLng);
      const isHuman = store.cameraMode === 'human';
      const isSky = store.cameraMode === 'sky';
      const isObserverView = isHuman || isSky;

      const sunState = positions.sun;
      const moonState = positions.moon;

      const dxSun = sunState.x - obsGround.x;
      const dzSun = sunState.z - obsGround.z;
      const distToSun = Math.sqrt(dxSun * dxSun + dzSun * dzSun);

      // Dynamic Horizon Geometry for accurate sunrise, culmination and sunset
      const horizonGeo = getDynamicHorizonDistance(store.settings.observerLat, store.settings.observerLng, store.currentDate);

      const dayOfYear = getDayOfYear(store.currentDate);
      const seasonalFactor = Math.cos((2 * Math.PI * (dayOfYear - 172)) / 365.25);
      const totalDaysEpoch = (store.currentDate.getTime() / (1000 * 60 * 60 * 24));
      const moonNodalFactor = Math.sin((totalDaysEpoch / 27.32) * 2 * Math.PI);

      // Eclipse calculations and dynamic visual effects (Rahu & Ketu or Moon eclipsing Sun based on eclipseTheory)
      const eclipseInfo = getEclipseInfo(
        positions.sun,
        positions.moon,
        positions.rahu,
        positions.ketu,
        store.settings.eclipseTheory,
        store.currentDate,
        store.settings.observerLat,
        store.settings.observerLng
      );
      const isEclipseDimmed = eclipseInfo.isSolarEclipseActive && eclipseInfo.solarEclipseMagnitude > 0.04;
      // Rahu / Moon (Total): drops ground/sky light down to 0.02 (deep nocturnal twilight during totality)
      // Ketu / Anular: drops light down to ~0.28 (leaving the soft golden ring of fire illumination)
      const eclipseSolarFactor = isEclipseDimmed 
        ? (eclipseInfo.eclipsingBody === 'ketu' || eclipseInfo.eclipseType === 'solar_annular'
            ? Math.max(0.28, 1.0 - eclipseInfo.solarEclipseMagnitude * 0.72)
            : Math.max(0.02, 1.0 - eclipseInfo.solarEclipseMagnitude * 1.05)) 
        : 1.0;

      // Calculate apparent celestial vectors in observer's dome
      const skyRadius = 40.0;
      const sunSky = calculateApparentCelestialSkyVector(
        sunState,
        obsGround,
        skyRadius,
        horizonGeo.horizonDist,
        horizonGeo.maxCulminationDeg,
        horizonGeo.haRad,
        true,
        seasonalFactor
      );

      // Cálculo da posição aparente da Lua na abóbada celeste:
      const moonMaxCulm = Math.max(15.0, Math.min(90.0, 90.0 - Math.abs(store.settings.observerLat - (23.44 * moonNodalFactor))));
      const moonHaRad = Math.PI / 2;
      const moonSkyRad = skyRadius;
      const moonIsSolar = false;
      const moonFactor = moonNodalFactor;

      const normalMoonSky = calculateApparentCelestialSkyVector(
        moonState,
        obsGround,
        moonSkyRad,
        horizonGeo.horizonDist,
        moonMaxCulm,
        moonHaRad,
        moonIsSolar,
        moonFactor
      );

      // Trânsito orbital contínuo e suave da Lua na frente do Sol durante eclipses solares:
      const catalogMatch = findMatchingCatalogEclipse(store.currentDate);
      let isCatalogSolarEclipseTransit = false;
      let transitProgress = 0;
      let eclipseBlend = 0;

      if (store.settings.eclipseTheory === 'moon_eclipses_sun' && catalogMatch && catalogMatch.type === 'solar') {
        const diffHours = (store.currentDate.getTime() - catalogMatch.date.getTime()) / (1000 * 3600);
        const absDiff = Math.abs(diffHours);
        if (absDiff <= 2.5) {
          isCatalogSolarEclipseTransit = true;
          transitProgress = diffHours / 1.25; // -2.0 a +2.0 ao longo de ±2.5 horas
          eclipseBlend = Math.cos((absDiff / 2.5) * (Math.PI / 2)) ** 2;
        }
      }

      const isMoonEclipsingSun = (store.settings.eclipseTheory === 'moon_eclipses_sun') && (eclipseInfo.isSolarEclipseActive || isCatalogSolarEclipseTransit);

      let moonSky: {
        position: { x: number; y: number; z: number };
        altitudeDeg: number;
        azimuthDeg: number;
        isAboveHorizon: boolean;
        distToObserver: number;
      };

      if (isCatalogSolarEclipseTransit && eclipseBlend > 0.001) {
        const eyeY = 0.05 + Math.max(0.00004, humanEyeHeightRef.current);
        _vToSun.set(
          sunSky.position.x - obsGround.x,
          sunSky.position.y - eyeY,
          sunSky.position.z - obsGround.z
        );
        const distToSunVec = Math.max(0.1, _vToSun.length());
        _vSunDir.copy(_vToSun).normalize();

        // Vetor de trânsito orbital perpendicular no plano horizontal
        _vTransit.crossVectors(_vSunDir, _vUp).normalize();

        const sunWorldRad = 0.52;
        const skyTransitOffset = transitProgress * (sunWorldRad * 2.10);

        _vMoonEyePos.set(obsGround.x, eyeY, obsGround.z)
          .addScaledVector(_vSunDir, distToSunVec - 0.35)
          .addScaledVector(_vTransit, skyTransitOffset);

        moonSky = {
          position: {
            x: THREE.MathUtils.lerp(normalMoonSky.position.x, _vMoonEyePos.x, eclipseBlend),
            y: THREE.MathUtils.lerp(normalMoonSky.position.y, _vMoonEyePos.y, eclipseBlend),
            z: THREE.MathUtils.lerp(normalMoonSky.position.z, _vMoonEyePos.z, eclipseBlend),
          },
          altitudeDeg: THREE.MathUtils.lerp(normalMoonSky.altitudeDeg, sunSky.altitudeDeg, eclipseBlend),
          azimuthDeg: THREE.MathUtils.lerp(normalMoonSky.azimuthDeg, sunSky.azimuthDeg, eclipseBlend),
          isAboveHorizon: sunSky.isAboveHorizon,
          distToObserver: distToSunVec - 0.35,
        };
      } else {
        moonSky = normalMoonSky;
      }

      // Sun Light On/Off status (Apagar Luz do Sol)
      const isSunLit = store.settings.sunLightEnabled !== false;
      const effectiveSolarIntensity = isSunLit ? store.settings.solarIntensity : 0.0;

      // True daylight factors factoring in solar eclipse darkening:
      const rawHumanDaylightFactor = THREE.MathUtils.clamp(sunSky.altitudeDeg / 5.0, 0.0, 1.0);
      const humanDaylightFactor = (isSunLit && sunSky.isAboveHorizon && sunSky.altitudeDeg > 0.0) 
        ? rawHumanDaylightFactor * eclipseSolarFactor 
        : 0.0;
      const rawGlobalDaylightFactor = THREE.MathUtils.clamp((horizonGeo.horizonDist + 2.5 - distToSun) / 8.0, 0.0, 1.0);
      const globalDaylightFactor = (isSunLit && sunSky.altitudeDeg > 0.0) 
        ? rawGlobalDaylightFactor * eclipseSolarFactor 
        : 0.0;
      const daylightFactor = isObserverView ? humanDaylightFactor : globalDaylightFactor;

      // 1. Update Sun 3D Position
      if (sunMeshRef.current) {
        if (isHuman) {
          sunMeshRef.current.position.set(sunSky.position.x, sunSky.position.y, sunSky.position.z);
          sunMeshRef.current.scale.set(1.0, 1.0, 1.0);
          const isSunVisibleInHuman = sunSky.isAboveHorizon && sunSky.altitudeDeg >= -0.85;
          // Na totalidade de eclipse solar (> 0.94), oculta a fotosfera brilhante amarela para que apenas a Coroa resplandeça
          const isPhotosphereHiddenByTotality = eclipseInfo.isSolarEclipseActive && eclipseInfo.solarEclipseMagnitude > 0.94;
          sunMeshRef.current.visible = isSunVisibleInHuman && isSunLit && !isPhotosphereHiddenByTotality;
        } else {
          sunMeshRef.current.position.set(sunState.x, sunState.y, sunState.z);
          sunMeshRef.current.scale.set(1.0, 1.0, 1.0);
          sunMeshRef.current.visible = true;
        }
      }

      // 1C. Solar Corona (Coroa Solar) for Total Solar Eclipse
      // Durante o eclipse total por Rahu ou pela Lua, a Coroa Solar resplandece ao redor do disco escurecido na totalidade
      if (sunCoronaSpriteRef.current) {
        if (eclipseInfo.isSolarEclipseActive && eclipseInfo.solarEclipseMagnitude > 0.45) {
          const mag = eclipseInfo.solarEclipseMagnitude;
          if (eclipseInfo.eclipsingBody === 'rahu' || (eclipseInfo.eclipsingBody === 'moon' && (eclipseInfo.eclipseType === 'solar_total' || mag > 0.85))) {
            const coronaAlpha = THREE.MathUtils.clamp((mag - 0.50) / 0.45, 0.0, 1.0);
            const shimmer = 1.0;
            sunCoronaSpriteRef.current.material.opacity = coronaAlpha * shimmer * 0.96;
            const coronaScale = isHuman ? 1.25 : 3.2;
            sunCoronaSpriteRef.current.scale.set(coronaScale, coronaScale, 1);
            sunCoronaSpriteRef.current.visible = coronaAlpha > 0.01;
          } else {
            // Ketu / Anular: brilho suave ofuscado pelo anel de fogo
            sunCoronaSpriteRef.current.material.opacity = 0.14;
            sunCoronaSpriteRef.current.visible = true;
          }
        } else if (isHuman && sunSky.altitudeDeg < 14.0 && sunSky.altitudeDeg >= 0.0 && isSunLit) {
          // Pôr do Sol: Halo e coroa solar poente compacta (tamanho constante proporcional à Lua)
          const sunAlt = sunSky.altitudeDeg;
          const sunsetFac = THREE.MathUtils.clamp(1.0 - Math.abs(sunAlt - 3.0) / 9.0, 0.0, 1.0);
          const sunsetHorizonFade = THREE.MathUtils.clamp((sunAlt + 0.1) / 2.2, 0.0, 1.0);
          sunCoronaSpriteRef.current.material.color.setHex(0xff7722);
          sunCoronaSpriteRef.current.material.opacity = 0.45 * sunsetFac * sunsetHorizonFade;
          const cScale = 2.0;
          sunCoronaSpriteRef.current.scale.set(cScale, cScale, 1);
          sunCoronaSpriteRef.current.visible = sunsetFac > 0.01 && sunsetHorizonFade > 0.01;
        } else {
          sunCoronaSpriteRef.current.material.opacity = 0.0;
          sunCoronaSpriteRef.current.visible = false;
        }
      }

      // Animate Sun Sparkle Glint / Feixe Solar (Luz estável sem pulsação)
      // Quando o Sol é eclipsado, perde o brilho total ou parcial
      if (sunSparkleSpriteRef.current) {
        if (isSunLit) {
          sunSparkleSpriteRef.current.material.rotation = 0;

          let beamFactor = 1.0;
          if (eclipseInfo.isSolarEclipseActive) {
            // Em qualquer eclipse solar (Lua, Rahu, Ketu), o feixe de brilho ofuscante apaga totalmente
            // para que a silhueta da Lua/corpo eclipsante fique perfeitamente nítida, escura e sem clarão/ofuscamento sobre ela!
            beamFactor = 0.0;
          }

          const baseScale = isHuman ? 1.85 : 3.0;
          const currentScale = baseScale * beamFactor;
          sunSparkleSpriteRef.current.scale.set(currentScale, currentScale, 1);
          sunSparkleSpriteRef.current.material.opacity = 0.85 * beamFactor;
          const isSparkleVisible = isHuman 
            ? (sunSky.altitudeDeg > 0.2 && daylightFactor > 0.01) 
            : true;
          sunSparkleSpriteRef.current.visible = isSparkleVisible && beamFactor > 0.001 && store.layers.showSolarFocus !== false && !eclipseInfo.isSolarEclipseActive;
        } else {
          sunSparkleSpriteRef.current.material.opacity = 0.0;
          sunSparkleSpriteRef.current.visible = false;
        }
      }

      const angleRad = ((store.settings.solarFocusAngleDeg || 55) * Math.PI) / 180;
      const baseConeRadius = Math.max(sunState.y, 4.0) * Math.tan(angleRad) * 1.5;
      const isFullDaylight = store.settings.mapLightingMode === 'full_daylight';
      const isBalanced = store.settings.mapLightingMode === 'balanced';
      // In planar mode, calibrate solar spotlight radius so it does not spill far into the night side
      const maxSolarHorizonRadius = horizonGeo ? horizonGeo.horizonDist * 1.05 : 19.5;
      const dynamicSunRadius = isFullDaylight 
        ? 120.0 
        : (isBalanced ? Math.min(baseConeRadius * 1.2, maxSolarHorizonRadius * 1.15) : Math.min(baseConeRadius, maxSolarHorizonRadius));

      if (sunSpotLightRef.current && sunSpotTargetRef.current) {
        sunSpotLightRef.current.position.set(sunState.x, sunState.y, sunState.z);
        sunSpotTargetRef.current.position.set(sunState.x, 0, sunState.z);
        sunSpotLightRef.current.angle = THREE.MathUtils.clamp(angleRad * 0.95, 0.2, 1.45);
        sunSpotLightRef.current.intensity =
          store.settings.mapLightingMode === 'full_daylight' || !isSunLit ? 0 : (isHuman ? 0 : effectiveSolarIntensity * 6.875 * eclipseSolarFactor);
      }

      if (sunPointLightRef.current) {
        const humanSunPointFactor = isHuman ? (sunSky.altitudeDeg >= -0.85 ? THREE.MathUtils.clamp((sunSky.altitudeDeg + 0.85) / 3.0, 0.0, 1.0) : 0.0) : 1.0;
        sunPointLightRef.current.intensity = isSunLit ? effectiveSolarIntensity * 3.125 * eclipseSolarFactor * humanSunPointFactor : 0;
      }

      // Direct Sun & Sky Lighting for Human Ground View (com pôr do sol glorioso e sombras dinâmicas)
      if (humanSunLightRef.current) {
        const isSunAboveHorizon = isSunLit && sunSky.altitudeDeg >= -0.85;
        if (isHuman && isSunAboveHorizon) {
          humanSunLightRef.current.position.set(
            sunSky.position.x,
            Math.max(0.6, sunSky.position.y),
            sunSky.position.z
          );
          humanSunLightRef.current.target.position.set(obsGround.x, 0, obsGround.z);
          humanSunLightRef.current.target.updateMatrixWorld();

          // Transição de cor do Sol ao longo do dia e Pôr do Sol:
          // Pleno dia: Branco solar quente (0xfffaed)
          // Meio da tarde: Âmbar dourado (0xffc466)
          // Pôr do Sol (0° a 8°): Laranja ardente e carmim (0xff7022 / 0xde3818)
          const sunAlt = sunSky.altitudeDeg;
          const sunColor = new THREE.Color(0xfffaed);
          if (sunAlt < 14.0) {
            const sunsetFac = THREE.MathUtils.clamp((14.0 - sunAlt) / 14.0, 0.0, 1.0);
            const sunsetWarm = new THREE.Color(0xff8c28);
            const duskRed = new THREE.Color(0xeb481a);
            sunColor.lerp(sunsetWarm, sunsetFac * 0.82).lerp(duskRed, sunsetFac * 0.28);
          }
          humanSunLightRef.current.color.copy(sunColor);

          const altFactor = THREE.MathUtils.clamp((sunAlt + 0.85) / 5.0, 0.0, 1.0);
          const sunIntensity = (isFullDaylight 
            ? 3.5 
            : effectiveSolarIntensity * 3.625 * altFactor) * eclipseSolarFactor;
          humanSunLightRef.current.intensity = sunIntensity;
          humanSunLightRef.current.visible = sunIntensity > 0.01;
          humanSunLightRef.current.castShadow = sunIntensity > 0.04;
        } else {
          humanSunLightRef.current.intensity = 0;
          humanSunLightRef.current.visible = false;
          humanSunLightRef.current.castShadow = false;
        }
      }

      const surfaceElevation = sampleTerrainElevationNormalized(obsGround.x, obsGround.z);
      const dispScale = earthDiscUniformsRef.current ? earthDiscUniformsRef.current.uDisplacementScale.value : 0.45;
      const eyeLevelY = isHuman 
        ? (0.05 + Math.max(0.00004, humanEyeHeightRef.current)) 
        : (0.05 + surfaceElevation * dispScale);

      // Feixe de Luz Volumétrico do Sol na Visualização Humana (Atmospheric Crepuscular Solar Beam)
      if (humanSunBeamRef.current && humanSunBeamMatRef.current) {
        const isSunAboveHorizon = isSunLit && sunSky.altitudeDeg >= -0.85;
        if (isHuman && isSunAboveHorizon) {
          const distToSun = Math.hypot(
            sunSky.position.x - obsGround.x,
            sunSky.position.y,
            sunSky.position.z - obsGround.z
          );
          humanSunBeamRef.current.position.set(sunSky.position.x, sunSky.position.y, sunSky.position.z);
          humanSunBeamRef.current.lookAt(obsGround.x, 0, obsGround.z);
          humanSunBeamRef.current.scale.set(1, 1, Math.max(1.0, distToSun));

          const sunAlt = sunSky.altitudeDeg;
          const sunsetFactor = THREE.MathUtils.clamp(1.0 - Math.abs(sunAlt - 3.5) / 7.5, 0.0, 1.0);
          const middayBeamCol = new THREE.Color(0xfff5c6);
          const sunsetBeamCol = new THREE.Color(0xff8a24);
          const duskBeamCol = new THREE.Color(0xff4c14);
          const currentBeamColor = middayBeamCol.clone().lerp(sunsetBeamCol, sunsetFactor * 0.85).lerp(duskBeamCol, sunsetFactor * 0.25);

          humanSunBeamMatRef.current.uniforms.uColor.value.copy(currentBeamColor);
          humanSunBeamMatRef.current.uniforms.uTime.value = time * 0.001;
          humanSunBeamMatRef.current.uniforms.uSunsetFactor.value = sunsetFactor;

          _vToSun.set(
            sunSky.position.x - obsGround.x,
            sunSky.position.y - eyeLevelY,
            sunSky.position.z - obsGround.z
          ).normalize();
          if (cameraRef.current) {
            cameraRef.current.getWorldDirection(_vSunDir);
          }
          const lookAtSunDot = _vSunDir.dot(_vToSun);
          // Quando o observador olha diretamente para cima no zênite em direção ao Sol,
          // atenua o cilindro para que a bolha de luz não crie nenhuma borda circular na visão,
          // permitindo que o brilho atmosférico suave e gradual do céu assuma com perfeição
          const directLookFade = 1.0 - THREE.MathUtils.clamp((lookAtSunDot - 0.15) / 0.55, 0.0, 1.0);
          humanSunBeamMatRef.current.uniforms.uDirectLookFade.value = directLookFade;

          const mountainHorizonFade = THREE.MathUtils.clamp((sunAlt - 4.2) / 3.5, 0.0, 1.0);
          const beamIntensity = (0.525 + 0.475 * sunsetFactor) * mountainHorizonFade * effectiveSolarIntensity * eclipseSolarFactor;
          humanSunBeamMatRef.current.uniforms.uIntensity.value = beamIntensity;
          humanSunBeamRef.current.visible = store.layers.showSolarFocus !== false && beamIntensity > 0.002 && directLookFade > 0.005;
        } else {
          humanSunBeamMatRef.current.uniforms.uIntensity.value = 0.0;
          humanSunBeamRef.current.visible = false;
        }
      }

      // Feixe e Cone Volumétrico do Sol em Modo Global Planar (showSolarFocus)
      if (solarFocusConeRef.current && solarFocusConeMatRef.current) {
        const showCone = Boolean(store.layers.showSolarFocus) && isSunLit && !isHuman && !isFullDaylight;
        solarFocusConeRef.current.visible = showCone;
        if (showCone) {
          const coneRadius = Math.max(4.5, dynamicSunRadius * 0.88);
          const coneHeight = Math.max(1.0, sunState.y - 0.05);
          solarFocusConeRef.current.position.set(sunState.x, 0.05, sunState.z);
          solarFocusConeRef.current.scale.set(coneRadius, coneHeight, coneRadius);
          solarFocusConeMatRef.current.uniforms.uTime.value = time * 0.001;
          solarFocusConeMatRef.current.uniforms.uIntensity.value =
            Math.min(1.6, effectiveSolarIntensity) * eclipseSolarFactor;
        }
      }

      // Atmosfera Terrestre (Geral) - Domo Difuso Planar & Brilho Rayleigh (showAtmosphere)
      if (atmosphereGlowRef.current && atmosphereGlowMatRef.current) {
        const showAtmoDome = Boolean(store.layers.showAtmosphere) && !isHuman;
        atmosphereGlowRef.current.visible = showAtmoDome;
        if (showAtmoDome) {
          atmosphereGlowMatRef.current.uniforms.uSunPos.value.set(sunState.x, sunState.y, sunState.z);
          atmosphereGlowMatRef.current.uniforms.uOpacity.value = store.layers.atmosphereOpacity ?? 0.85;
          atmosphereGlowMatRef.current.uniforms.uTime.value = time * 0.001;
        }
      }

      // Moon Lighting (Reflected Sunlight) calculations
      const rawMoonPhase = (moonState.illuminatedPct ?? 50) / 100.0;
      const moonAngleRad = (((store.settings.moonFocusAngleDeg || 39) * Math.PI) / 180);
      const dynamicMoonRadius = Math.min(Math.max(moonState.y, 4.0) * Math.tan(moonAngleRad) * 1.25, 12.0);
      const isMoonLit = store.settings.moonLightEnabled !== false;
      const baseMoonIntensity = store.settings.moonIntensity ?? 1.0;
      const effectiveMoonIntensity = isMoonLit ? baseMoonIntensity : 0.0;

      // Direct Moon Light for Human Ground View (Ativa ESTRITAMENTE à noite quando o Sol se pôs; durante o dia = 0 para que o Sol seja a única fonte de luz!)
      if (humanMoonLightRef.current) {
        const isNightForMoonLight = !isSunLit || sunSky.altitudeDeg <= 0.0;
        const isMoonAboveHorizon = isMoonLit && isNightForMoonLight && moonSky.isAboveHorizon && moonSky.altitudeDeg >= -0.5;
        if (isHuman && isMoonAboveHorizon) {
          humanMoonLightRef.current.position.set(
            moonSky.position.x,
            Math.max(0.6, moonSky.position.y),
            moonSky.position.z
          );
          humanMoonLightRef.current.target.position.set(obsGround.x, 0, obsGround.z);
          humanMoonLightRef.current.target.updateMatrixWorld();

          // Luz prateada/azulada da Lua; vira vermelho-cobre no eclipse lunar
          const moonColor = new THREE.Color(0xbad6f8);
          if (eclipseInfo.isLunarEclipseActive && eclipseInfo.lunarEclipseMagnitude > 0.05) {
            moonColor.lerp(new THREE.Color(0xc23a22), eclipseInfo.lunarEclipseMagnitude);
          }
          humanMoonLightRef.current.color.copy(moonColor);

          const moonAltFactor = THREE.MathUtils.clamp((moonSky.altitudeDeg + 0.5) / 8.0, 0.0, 1.0);
          const moonIntensity = 0.36 * Math.max(0.12, rawMoonPhase) * effectiveMoonIntensity * moonAltFactor;
          humanMoonLightRef.current.intensity = moonIntensity;
          humanMoonLightRef.current.visible = moonIntensity > 0.005;
          // Projeta sombras noturnas nos objetos (árvores, rochas, montanhas e solo) igual ao sol
          humanMoonLightRef.current.castShadow = moonIntensity > 0.01;
        } else {
          humanMoonLightRef.current.intensity = 0;
          humanMoonLightRef.current.visible = false;
          humanMoonLightRef.current.castShadow = false;
        }
      }

      // Feixe de Luz Volumétrico da Lua (Ethereal Moonlight Beam)
      if (humanMoonBeamRef.current && humanMoonBeamMatRef.current) {
        const isMoonAboveHorizon = isMoonLit && moonSky.isAboveHorizon && moonSky.altitudeDeg >= -0.5;
        if (isHuman && isMoonAboveHorizon) {
          const distToMoon = Math.hypot(
            moonSky.position.x - obsGround.x,
            moonSky.position.y,
            moonSky.position.z - obsGround.z
          );
          humanMoonBeamRef.current.position.set(moonSky.position.x, moonSky.position.y, moonSky.position.z);
          humanMoonBeamRef.current.lookAt(obsGround.x, 0, obsGround.z);
          humanMoonBeamRef.current.scale.set(1, 1, Math.max(1.0, distToMoon));

          const moonBeamColor = new THREE.Color(0x9cc8f8);
          if (eclipseInfo.isLunarEclipseActive && eclipseInfo.lunarEclipseMagnitude > 0.05) {
            moonBeamColor.lerp(new THREE.Color(0xbf3a20), eclipseInfo.lunarEclipseMagnitude);
          }
          humanMoonBeamMatRef.current.uniforms.uColor.value.copy(moonBeamColor);
          humanMoonBeamMatRef.current.uniforms.uTime.value = time * 0.001;

          _vToSun.set(
            moonSky.position.x - obsGround.x,
            moonSky.position.y - eyeLevelY,
            moonSky.position.z - obsGround.z
          ).normalize();
          if (cameraRef.current) {
            cameraRef.current.getWorldDirection(_vSunDir);
          }
          const lookAtMoonDot = _vSunDir.dot(_vToSun);
          const directLookFadeM = 1.0 - THREE.MathUtils.clamp((lookAtMoonDot - 0.15) / 0.55, 0.0, 1.0);
          humanMoonBeamMatRef.current.uniforms.uDirectLookFade.value = directLookFadeM;

          const moonAltFactor = THREE.MathUtils.clamp((moonSky.altitudeDeg + 0.5) / 8.0, 0.0, 1.0);
          const beamIntensity = 0.22 * Math.max(0.12, rawMoonPhase) * effectiveMoonIntensity * moonAltFactor;
          humanMoonBeamMatRef.current.uniforms.uIntensity.value = beamIntensity;
          humanMoonBeamRef.current.visible = beamIntensity > 0.002 && directLookFadeM > 0.005 && (sunSky.altitudeDeg < 2.5);
        } else {
          humanMoonBeamMatRef.current.uniforms.uIntensity.value = 0.0;
          humanMoonBeamRef.current.visible = false;
        }
      }

      if (humanSkyLightRef.current) {
        if (isHuman) {
          const isDayOrSunset = isSunLit && sunSky.altitudeDeg > -0.85;
          if (isDayOrSunset) {
            const sunAlt = sunSky.altitudeDeg;
            const sunsetFac = THREE.MathUtils.clamp(1.0 - Math.abs(sunAlt - 3.0) / 8.0, 0.0, 1.0);
            const daySkyCol = new THREE.Color(0x93c5fd);
            const sunsetSkyCol = new THREE.Color(0xff8855);
            humanSkyLightRef.current.color.copy(daySkyCol.lerp(sunsetSkyCol, sunsetFac * 0.85));
            const dayGndCol = new THREE.Color(0x1e3a1e);
            const sunsetGndCol = new THREE.Color(0x3a2215);
            humanSkyLightRef.current.groundColor.copy(dayGndCol.lerp(sunsetGndCol, sunsetFac * 0.7));
            const baseSkyLight = isFullDaylight ? 1.5 : (0.3125 + humanDaylightFactor * 1.1875);
            humanSkyLightRef.current.intensity = baseSkyLight * (isEclipseDimmed ? Math.max(0.12, 1.0 - eclipseInfo.solarEclipseMagnitude * 0.85) : 1.0);
          } else {
            // Céu noturno: reflexo atmosférico azul marinho do luar
            const isMoonUp = isMoonLit && moonSky.isAboveHorizon && moonSky.altitudeDeg > 0;
            const moonGlowFactor = isMoonUp ? (0.05 + 0.16 * rawMoonPhase) : 0.02;
            humanSkyLightRef.current.color.setHex(isMoonUp ? 0x0a265c : 0x040e24);
            humanSkyLightRef.current.groundColor.setHex(0x02060c);
            humanSkyLightRef.current.intensity = moonGlowFactor;
          }
          humanSkyLightRef.current.position.set(obsGround.x, 10, obsGround.z);
          humanSkyLightRef.current.visible = true;
        } else {
          humanSkyLightRef.current.intensity = 0;
          humanSkyLightRef.current.visible = false;
        }
      }

      if (moonSpotLightRef.current && moonSpotTargetRef.current) {
        moonSpotLightRef.current.position.set(moonState.x, moonState.y, moonState.z);
        moonSpotTargetRef.current.position.set(moonState.x, 0, moonState.z);
        moonSpotLightRef.current.angle = THREE.MathUtils.clamp(moonAngleRad * 0.95, 0.2, 1.45);
        moonSpotLightRef.current.intensity =
          !isMoonLit || isFullDaylight || isHuman
            ? 0
            : effectiveMoonIntensity * Math.max(0.05, rawMoonPhase) * 1.5;

        // In Lunar Eclipse, ground moonlight shifts into reddish copper hue
        if (eclipseInfo.isLunarEclipseActive && eclipseInfo.lunarEclipseMagnitude > 0.05) {
          const bloodColor = new THREE.Color(0xcfd8dc).lerp(new THREE.Color(0xb83a24), eclipseInfo.lunarEclipseMagnitude);
          moonSpotLightRef.current.color.copy(bloodColor);
        } else {
          moonSpotLightRef.current.color.setHex(0xcfd8dc);
        }
      }

      // Update Earth Disc Day/Night Shader Uniforms
      if (earthDiscUniformsRef.current) {
        earthDiscUniformsRef.current.uTime.value = time * 0.001;
        earthDiscUniformsRef.current.uSunPos.value.set(sunState.x, sunState.y, sunState.z);
        earthDiscUniformsRef.current.uSunRadius.value = dynamicSunRadius;
        earthDiscUniformsRef.current.uSunIntensity.value = (!isSunLit)
          ? 0.0
          : (isFullDaylight ? 1.5 : effectiveSolarIntensity * 1.6);

        // Dynamic Lunar Illumination (Moon reflects solar light on the surface below)
        earthDiscUniformsRef.current.uMoonPos.value.set(moonState.x, moonState.y, moonState.z);
        earthDiscUniformsRef.current.uMoonRadius.value = dynamicMoonRadius;
        earthDiscUniformsRef.current.uMoonIntensity.value = effectiveMoonIntensity;
        earthDiscUniformsRef.current.uMoonPhaseFrac.value = isFullDaylight ? 0.0 : Math.max(0.05, rawMoonPhase);

        // Coupling to observer view and realistic nocturnal darkness
        earthDiscUniformsRef.current.uIsHuman.value = isHuman ? 1.0 : 0.0;
        earthDiscUniformsRef.current.uHumanDaylightFactor.value = humanDaylightFactor;
        earthDiscUniformsRef.current.uIsMoonAboveHorizon.value = (isHuman
          ? (moonSky.isAboveHorizon && moonSky.altitudeDeg > 0.0 ? 1.0 : 0.0)
          : (moonState.altitudeDeg > 0 ? 1.0 : 0.0));

        // Authentic nocturnal satellite terrain visibility:
        // In full daylight mode, the whole disc is fully illuminated.
        // In balanced mode, subtle ambient light (0.28) ensures satellite imagery and continents are clearly visible at night.
        // In spotlight mode, it scales smoothly with store.settings.ambientBrightness.
        earthDiscUniformsRef.current.uAmbientNight.value = isFullDaylight 
          ? 0.95 
          : (isBalanced ? 0.28 : (store.settings.ambientBrightness > 0 ? store.settings.ambientBrightness * 0.25 : 0.0));
        earthDiscUniformsRef.current.uShowCityLights.value = store.layers.showCityLights ? 1.0 : 0.0;
        earthDiscUniformsRef.current.uMapColorMode.value = store.layers.mapColorTheme === 'hypsometric' ? 1.0 : 0.0;
        earthDiscUniformsRef.current.uShowMountainRelief.value = store.layers.showMountainRelief3D !== false ? 1.0 : 0.0;
        earthDiscUniformsRef.current.uShowRealisticWater.value = store.layers.showRealisticWater !== false ? 1.0 : 0.0;
        earthDiscUniformsRef.current.uDynamicShadows.value = store.layers.showDynamicShadows !== false ? 1.0 : 0.0;
        earthDiscUniformsRef.current.uShowOceanWaves.value = store.layers.showOceanWaves !== false ? 1.0 : 0.0;
        earthDiscUniformsRef.current.uOceanWaveHeight.value = store.settings.oceanWaveHeight ?? 1.0;
        earthDiscUniformsRef.current.uOceanAgitationMode.value = 
          store.layers.oceanAgitationMode === 'storm' ? 2.0 : (store.layers.oceanAgitationMode === 'calm' ? 0.0 : 1.0);
      }

      // Ambient Light for celestial dome & local human environment
      if (ambientLightRef.current) {
        if (isHuman) {
          // In Human 1st-person view, ambient light reflects local daytime sky illumination for grass, trees, and mountains
          ambientLightRef.current.intensity = isFullDaylight
            ? 2.0
            : (daylightFactor > 0.001 ? 0.02 + daylightFactor * 1.98 : 0.005);
        } else {
          // Global planar view: 0.0 when ambientBrightness is 0 so the unlit portion of the disc is completely dark
          const globalAmbient = isFullDaylight ? 1.5 : (isBalanced ? daylightFactor * 0.18 : daylightFactor * store.settings.ambientBrightness * 0.10);
          ambientLightRef.current.intensity = Math.max(0.005, globalAmbient);
        }
      }

      // Smoothly scale continental mountain terrain displacement according to user exaggeration and relief toggle
      if (earthDiscUniformsRef.current) {
        const userDispScale = store.layers.mountainDisplacementScale ?? 1.0;
        const reliefActive = store.layers.showMountainRelief3D !== false ? 1.0 : 0.0;
        const targetDisp = isHuman ? 0.0 : (userDispScale * reliefActive);
        earthDiscUniformsRef.current.uDisplacementScale.value = THREE.MathUtils.lerp(
          earthDiscUniformsRef.current.uDisplacementScale.value,
          targetDisp,
          0.25
        );
      }

      // C. Update Moon 3D Position, Solar Illumination & Dynamic Phases
      if (moonMeshRef.current) {
        if (isHuman) {
          moonMeshRef.current.position.set(moonSky.position.x, moonSky.position.y, moonSky.position.z);
          if (isMoonEclipsingSun) {
            // Ajuste óptico exato para eclipsar o Sol perfeitamente:
            // Sol tem geometria de raio 0.52. Lua tem geometria de raio 0.68.
            // Para totalidade: escala 0.79 * 0.68 = 0.537 (103% do disco do Sol, permitindo totalidade e coroa solar perfeita)
            // Para anular: escala 0.73 * 0.68 = 0.496 (95% do disco do Sol, criando o anel de fogo)
            const eclipseScale = eclipseInfo.eclipseType === 'solar_annular' ? 0.73 : 0.79;
            moonMeshRef.current.scale.set(eclipseScale, eclipseScale, eclipseScale);
            moonMeshRef.current.visible = true;
          } else {
            // A Lua mantém exatamente o mesmo tamanho ao se pôr no horizonte (escala fixa 1.0)
            moonMeshRef.current.scale.set(1.0, 1.0, 1.0);
            const isMoonVisibleInHuman = moonSky.altitudeDeg >= -0.85 && (moonSky.isAboveHorizon || moonSky.altitudeDeg >= -0.5);
            moonMeshRef.current.visible = isMoonVisibleInHuman;
          }
        } else {
          moonMeshRef.current.position.set(moonState.x, moonState.y, moonState.z);
          if (isMoonEclipsingSun) {
            const globalEclipseScale = eclipseInfo.eclipseType === 'solar_annular' ? 0.74 : 0.80;
            moonMeshRef.current.scale.set(globalEclipseScale, globalEclipseScale, globalEclipseScale);
          } else {
            moonMeshRef.current.scale.set(1.0, 1.0, 1.0);
          }
          moonMeshRef.current.visible = true;
        }
      }

      // Atualiza o Foco de Luz Proporcional em Volta da Lua (Lunar Glow & Atmospheric Halo)
      if (moonHaloMeshRef.current && moonHaloMatRef.current) {
        const moonIllumRatio = (moonState?.illuminatedPct ?? 50) / 100.0;
        const moonAltDeg = isHuman ? moonSky.altitudeDeg : 20.0;
        const horizonFactor = THREE.MathUtils.clamp((moonAltDeg + 2.0) / 6.0, 0.0, 1.0);
        const isEclipse = isMoonEclipsingSun || eclipseInfo.isSolarEclipseActive;

        if (isEclipse) {
          moonHaloMeshRef.current.visible = false;
        } else {
          // Escala do foco de luz cresce com a proporção de iluminação da Lua (Lua Cheia = foco amplo e radiante)
          const baseScale = isHuman ? 4.2 : 3.4;
          const dynamicScale = baseScale * (0.60 + 0.60 * moonIllumRatio);
          moonHaloMeshRef.current.scale.set(dynamicScale, dynamicScale, 1);

          // Sempre virado frontalmente para a câmera em modo billboard
          if (cameraRef.current) {
            moonHaloMeshRef.current.quaternion.copy(cameraRef.current.quaternion);

            // Calcula o vetor 2D direcional exato apontando para o Sol no plano da tela:
            const sunTarget = isHuman ? sunSky.position : sunState;
            const moonTarget = isHuman ? moonSky.position : moonState;
            _vToSun.set(
              sunTarget.x - moonTarget.x,
              sunTarget.y - moonTarget.y,
              sunTarget.z - moonTarget.z
            ).normalize();

            const rightX = cameraRef.current.matrixWorld.elements[0];
            const rightY = cameraRef.current.matrixWorld.elements[1];
            const rightZ = cameraRef.current.matrixWorld.elements[2];

            const upX = cameraRef.current.matrixWorld.elements[4];
            const upY = cameraRef.current.matrixWorld.elements[5];
            const upZ = cameraRef.current.matrixWorld.elements[6];

            const sunScrX = _vToSun.x * rightX + _vToSun.y * rightY + _vToSun.z * rightZ;
            const sunScrY = _vToSun.x * upX + _vToSun.y * upY + _vToSun.z * upZ;
            const lenScr = Math.hypot(sunScrX, sunScrY);
            if (lenScr > 0.001) {
              moonHaloMatRef.current.uniforms.uSunDir2D.value.set(sunScrX / lenScr, sunScrY / lenScr);
            }
          }

          moonHaloMatRef.current.uniforms.uMoonPhase.value = moonIllumRatio;

          // Na Lua de Sangue (eclipse lunar), o halo fica cobre-avermelhado
          if (eclipseInfo.isLunarEclipseActive && eclipseInfo.lunarEclipseMagnitude > 0.05) {
            const bloodColor = new THREE.Color(0x3870cc).lerp(new THREE.Color(0xb83a24), eclipseInfo.lunarEclipseMagnitude);
            moonHaloMatRef.current.uniforms.uColor.value.copy(bloodColor);
          } else {
            moonHaloMatRef.current.uniforms.uColor.value.set(0x3870cc);
          }

          // Intensidade luminosa estritamente proporcional à luz refletida pela Lua, suprimida de dia para não parecer um segundo sol
          const daylightSuppression = 1.0 - THREE.MathUtils.clamp((daylightFactor - 0.02) / 0.12, 0.0, 1.0);
          const targetOpacity = Math.min(0.85, (0.15 + 0.70 * moonIllumRatio) * horizonFactor * daylightSuppression);
          moonHaloMatRef.current.uniforms.uOpacity.value = targetOpacity;

          const isMoonVisibleInHuman = moonSky.altitudeDeg >= -0.85 && (moonSky.isAboveHorizon || moonSky.altitudeDeg >= -0.5);
          moonHaloMeshRef.current.visible = isHuman ? (isMoonVisibleInHuman && targetOpacity > 0.01) : (targetOpacity > 0.01);
        }
      }

      // Update Moon Solar-Illumination Shader with real-time Sun position & atmospheric transparency
      if (moonShaderMatRef.current) {
        if (isHuman) {
          moonShaderMatRef.current.uniforms.uSunWorldPosition.value.set(
            sunSky.position.x,
            sunSky.position.y,
            sunSky.position.z
          );
          const sunWorldRad = 0.52;
          const distToSunVec = Math.max(0.1, Math.hypot(
            sunSky.position.x - obsGround.x,
            sunSky.position.y - eyeLevelY,
            sunSky.position.z - obsGround.z
          ));
          moonShaderMatRef.current.uniforms.uSunAngularRadius.value = (sunWorldRad * 1.05) / distToSunVec;
        } else {
          moonShaderMatRef.current.uniforms.uSunWorldPosition.value.set(
            sunState.x,
            sunState.y,
            sunState.z
          );
          moonShaderMatRef.current.uniforms.uSunAngularRadius.value = 0.015;
        }
        moonShaderMatRef.current.uniforms.uDaylightFactor.value = daylightFactor;
        moonShaderMatRef.current.uniforms.uIsHuman.value = isHuman ? 1.0 : 0.0;
        moonShaderMatRef.current.uniforms.uBloodMoonFactor.value = eclipseInfo.lunarEclipseMagnitude;
        moonShaderMatRef.current.uniforms.uIsSolarEclipsing.value = isMoonEclipsingSun ? 1.0 : 0.0;
      }

      const isRahuKetuEnabled = store.settings.eclipseTheory !== 'moon_eclipses_sun';

      // C2. Update Rahu (Nódulo Norte / Eclipse Solar) 3D Position & Transits
      if (rahuMeshRef.current && positions.rahu) {
        if (!isRahuKetuEnabled) {
          rahuMeshRef.current.visible = false;
        } else if (isHuman) {
          // Render Rahu directly in front of the Sun (radius 39.2 vs Sun at 40.0)
          const rahuSky = calculateApparentCelestialSkyVector(
            positions.rahu,
            obsGround,
            39.2,
            horizonGeo.horizonDist,
            horizonGeo.maxCulminationDeg,
            horizonGeo.haRad
          );
          rahuMeshRef.current.position.set(rahuSky.position.x, rahuSky.position.y, rahuSky.position.z);
          // Rahu always looks towards camera in human mode so its cosmic smoke cloud faces observer
          if (cameraRef.current) rahuMeshRef.current.lookAt(cameraRef.current.position);
          const isAstroVisibleInSky = rahuSky.isAboveHorizon && store.layers.showPlanets && !eclipseInfo.isSolarEclipseActive;
          rahuMeshRef.current.visible = isAstroVisibleInSky;
          // Scale: Rahu is larger than the Sun disc (0.54 vs 0.52), covering 100% of the Sun during totality
          const rahuScale = (eclipseInfo.isSolarEclipseActive && eclipseInfo.eclipsingBody === 'rahu') ? 1.08 : 1.0;
          rahuMeshRef.current.scale.set(rahuScale, rahuScale, rahuScale);
        } else {
          rahuMeshRef.current.position.set(positions.rahu.x, positions.rahu.y, positions.rahu.z);
          rahuMeshRef.current.visible = store.layers.showPlanets;
          rahuMeshRef.current.scale.set(1.0, 1.0, 1.0);
        }
      }

      if (rahuLiveOrbitRef.current && positions.rahu) {
        if (!isRahuKetuEnabled) {
          rahuLiveOrbitRef.current.visible = false;
        } else {
          const rahuRadiusNow = Math.sqrt(positions.rahu.x * positions.rahu.x + positions.rahu.z * positions.rahu.z);
          rahuLiveOrbitRef.current.scale.set(rahuRadiusNow, 1, rahuRadiusNow);
          rahuLiveOrbitRef.current.position.y = positions.rahu.y;
          rahuLiveOrbitRef.current.visible = true;
        }
      }

      // C3. Update Ketu (Nódulo Sul / Eclipse Lunar / Lua de Sangue & Eclipse Solar Parcial) 3D Position & Transits
      if (ketuMeshRef.current && positions.ketu) {
        if (!isRahuKetuEnabled) {
          ketuMeshRef.current.visible = false;
        } else if (isHuman) {
          const isLunar = eclipseInfo.isLunarEclipseActive;
          const ketuMaxCulm = isLunar
            ? Math.max(15.0, Math.min(90.0, 90.0 - Math.abs(store.settings.observerLat - (23.44 * moonNodalFactor))))
            : (eclipseInfo.isSolarEclipseActive ? horizonGeo.maxCulminationDeg : 65.0);
          const ketuSky = calculateApparentCelestialSkyVector(
            positions.ketu,
            obsGround,
            39.2,
            horizonGeo.horizonDist,
            ketuMaxCulm,
            isLunar ? Math.PI / 2 : horizonGeo.haRad,
            !isLunar,
            isLunar ? moonNodalFactor : seasonalFactor
          );
          ketuMeshRef.current.position.set(
            ketuSky.position.x,
            Math.max(eyeLevelY + 0.8, ketuSky.position.y),
            ketuSky.position.z
          );
          if (cameraRef.current) ketuMeshRef.current.lookAt(cameraRef.current.position);

          // Ketu fica nítido e visível durante o eclipse lunar (Lua de Sangue), eclipse solar, quando selecionado ou com camadas ativas
          const isAstroVisibleInSky = ketuSky.isAboveHorizon && ketuSky.altitudeDeg > -0.5 && (
            eclipseInfo.isLunarEclipseActive ||
            (eclipseInfo.isSolarEclipseActive && eclipseInfo.eclipsingBody === 'ketu') ||
            store.layers.showPlanets ||
            store.selectedAstroId === 'ketu'
          );
          ketuMeshRef.current.visible = isAstroVisibleInSky;

          // Scale: Ketu aumentado em 100% (o dobro do tamanho original)
          const ketuScale = eclipseInfo.isLunarEclipseActive 
            ? 2.3 
            : ((eclipseInfo.isSolarEclipseActive && eclipseInfo.eclipsingBody === 'ketu') ? 2.0 : 1.8);
          ketuMeshRef.current.scale.set(ketuScale, ketuScale, ketuScale);

          // Ajuste de opacidade dinâmico para garantir que Ketu seja inconfundivelmente visível na Lua de Sangue
          if (ketuMatRef.current && ketuSpriteMatRef.current) {
            if (eclipseInfo.isLunarEclipseActive) {
              const bloodMag = Math.max(0.35, eclipseInfo.lunarEclipseMagnitude);
              ketuMatRef.current.opacity = 0.48 * bloodMag;
              ketuSpriteMatRef.current.opacity = 0.70 * bloodMag;
            } else if (store.selectedAstroId === 'ketu') {
              ketuMatRef.current.opacity = 0.50;
              ketuSpriteMatRef.current.opacity = 0.70;
            } else {
              ketuMatRef.current.opacity = 0.28;
              ketuSpriteMatRef.current.opacity = 0.42;
            }
          }
        } else {
          ketuMeshRef.current.position.set(positions.ketu.x, positions.ketu.y, positions.ketu.z);
          ketuMeshRef.current.visible = store.layers.showPlanets || store.selectedAstroId === 'ketu';
          ketuMeshRef.current.scale.set(2.0, 2.0, 2.0); // Aumentado em 100% (2x)
        }
      }

      if (ketuLiveOrbitRef.current && positions.ketu) {
        if (!isRahuKetuEnabled) {
          ketuLiveOrbitRef.current.visible = false;
        } else {
          const ketuRadiusNow = Math.sqrt(positions.ketu.x * positions.ketu.x + positions.ketu.z * positions.ketu.z);
          ketuLiveOrbitRef.current.scale.set(ketuRadiusNow, 1, ketuRadiusNow);
          ketuLiveOrbitRef.current.position.y = positions.ketu.y;
          ketuLiveOrbitRef.current.visible = true;
        }
      }

      // C4. Update Sun Photosphere Eclipse Occultation (Progressivo: Sol se tornando meio sol até fechar por completo)
      if (sunPhotosphereMatRef.current) {
        const mat = sunPhotosphereMatRef.current;
        if (eclipseInfo.isSolarEclipseActive) {
          const isKetu = eclipseInfo.eclipsingBody === 'ketu';
          const isMoon = eclipseInfo.eclipsingBody === 'moon';
          const eclipsingMesh = isKetu ? ketuMeshRef.current : (isMoon ? moonMeshRef.current : rahuMeshRef.current);
          const obsRadiusRel = isKetu ? 0.76 : (isMoon ? 1.02 : 1.08);

          mat.uniforms.uEclipseActive.value = 1.0;
          mat.uniforms.uIsAnnular.value = isKetu ? 1.0 : 0.0;
          mat.uniforms.uObscurerRadius.value = obsRadiusRel;

          let ox = 999.0;
          let oy = 999.0;

          if (cameraRef.current && sunMeshRef.current && eclipsingMesh) {
            cameraRef.current.updateMatrixWorld();
            sunMeshRef.current.updateMatrixWorld();
            eclipsingMesh.updateMatrixWorld();

            sunMeshRef.current.getWorldPosition(_vSunWorld);
            eclipsingMesh.getWorldPosition(_vObsWorld);

            _vSunView.copy(_vSunWorld).applyMatrix4(cameraRef.current.matrixWorldInverse);
            _vObsView.copy(_vObsWorld).applyMatrix4(cameraRef.current.matrixWorldInverse);

            // Both Sun and eclipsing body in front of camera
            if (_vSunView.z < -0.05 && _vObsView.z < -0.05) {
              const zSun = -_vSunView.z;
              const zObs = -_vObsView.z;

              const dxScreen = (_vObsView.x / zObs) - (_vSunView.x / zSun);
              const dyScreen = (_vObsView.y / zObs) - (_vSunView.y / zSun);

              const sunWorldRadius = 0.52 * sunMeshRef.current.scale.x;
              const sunRadiusScreen = sunWorldRadius / zSun;

              ox = dxScreen / Math.max(0.0001, sunRadiusScreen);
              oy = dyScreen / Math.max(0.0001, sunRadiusScreen);
            }
          }

          // Fallback if camera is looking in another direction or top/side orbit view
          if (isNaN(ox) || isNaN(oy) || Math.abs(ox) > 6.0 || Math.abs(oy) > 6.0) {
            const separation = (1.0 - eclipseInfo.solarEclipseMagnitude) * (1.0 + obsRadiusRel);
            ox = separation;
            oy = 0.0;
          }

          mat.uniforms.uObscurerOffset.value.set(ox, oy);
        } else {
          mat.uniforms.uEclipseActive.value = 0.0;
          mat.uniforms.uObscurerOffset.value.set(999.0, 999.0);
        }
      }

      // C5. Update Moon Lunar Eclipse Occultation (Progressivo: Lua começando a ficar vermelha até a metade e fechando até 100% vermelha)
      if (moonShaderMatRef.current) {
        const moonMat = moonShaderMatRef.current;
        if (eclipseInfo.isLunarEclipseActive) {
          const obsRadiusRel = 1.65; // Raio da umbra projetada proporcional a Ketu 100% ampliado

          moonMat.uniforms.uLunarEclipseActive.value = 1.0;
          moonMat.uniforms.uLunarObscurerRadius.value = obsRadiusRel;
          moonMat.uniforms.uBloodMoonFactor.value = eclipseInfo.lunarEclipseMagnitude;

          let ox = 999.0;
          let oy = 999.0;

          if (store.settings.eclipseTheory === 'moon_eclipses_sun') {
            ox = 0.0;
            oy = 0.0;
          } else if (cameraRef.current && moonMeshRef.current && ketuMeshRef.current) {
            cameraRef.current.updateMatrixWorld();
            moonMeshRef.current.updateMatrixWorld();
            ketuMeshRef.current.updateMatrixWorld();

            moonMeshRef.current.getWorldPosition(_vMoonWorld);
            ketuMeshRef.current.getWorldPosition(_vKetuWorld);

            _vMoonView.copy(_vMoonWorld).applyMatrix4(cameraRef.current.matrixWorldInverse);
            _vKetuView.copy(_vKetuWorld).applyMatrix4(cameraRef.current.matrixWorldInverse);

            // Both Moon and eclipsing body in front of camera
            if (_vMoonView.z < -0.05 && _vKetuView.z < -0.05) {
              const zMoon = -_vMoonView.z;
              const zKetu = -_vKetuView.z;

              const dxScreen = (_vKetuView.x / zKetu) - (_vMoonView.x / zMoon);
              const dyScreen = (_vKetuView.y / zKetu) - (_vMoonView.y / zMoon);

              const moonWorldRadius = 0.68 * moonMeshRef.current.scale.x;
              const moonRadiusScreen = moonWorldRadius / zMoon;

              ox = dxScreen / Math.max(0.0001, moonRadiusScreen);
              oy = dyScreen / Math.max(0.0001, moonRadiusScreen);
            }
          }

          // Fallback if camera is looking in another direction or top/side orbit view
          if (isNaN(ox) || isNaN(oy) || Math.abs(ox) > 6.0 || Math.abs(oy) > 6.0) {
            const catalogMatch = findMatchingCatalogEclipse(store.currentDate);
            let sign = 1.0;
            if (catalogMatch) {
              const diffMs = store.currentDate.getTime() - catalogMatch.date.getTime();
              sign = diffMs >= 0 ? 1.0 : -1.0;
            }
            const separation = (1.0 - eclipseInfo.lunarEclipseMagnitude) * (1.0 + obsRadiusRel);
            ox = sign * separation;
            oy = 0.0;
          }

          moonMat.uniforms.uLunarObscurerOffset.value.set(ox, oy);
        } else {
          moonMat.uniforms.uLunarEclipseActive.value = 0.0;
          moonMat.uniforms.uBloodMoonFactor.value = 0.0;
          moonMat.uniforms.uLunarObscurerOffset.value.set(999.0, 999.0);
        }
      }

      // Multiplicador de velocidade das nuvens sincronizado com a aceleração do tempo
      const absPlaybackSpeed = Math.abs(store.playbackSpeed || 1);
      const timeCloudMultiplier = store.isPlaying
        ? (absPlaybackSpeed <= 1
            ? 1.0
            : Math.min(80.0, 1.0 + Math.pow(absPlaybackSpeed, 0.36) * 1.15))
        : 0.15;
      if (!(window as any).__planarCloudAccumSec) {
        (window as any).__planarCloudAccumSec = time * 0.001;
      }
      (window as any).__planarCloudAccumSec += delta * timeCloudMultiplier;
      const cloudAccumSec = (window as any).__planarCloudAccumSec as number;
      const cloudAccumMs = cloudAccumSec * 1000.0;

      // Ground Scene Environment (Biomes: Field, City, Forest, Beach)
      if (observerEnv3DRef.current) {
        observerEnv3DRef.current.setVisible(isHuman);
        if (isHuman) {
          observerEnv3DRef.current.setPosition(obsGround.x, 0.05, obsGround.z);
          // Rotate environment base and compass inlay to align with Local North
          const northAngle = Math.atan2(-obsGround.x, -obsGround.z);
          observerEnv3DRef.current.setRotation(northAngle);
          observerEnv3DRef.current.setBiome(store.settings.observerBiome || 'field');
          _vSunDirLocal.set(
            sunSky.position.x - obsGround.x,
            sunSky.position.y - eyeLevelY,
            sunSky.position.z - obsGround.z
          ).normalize();
          const exactCloudTime = clouds3DRef.current ? clouds3DRef.current.getAccumulatedTime() : cloudAccumSec;
          observerEnv3DRef.current.updateTime(
            daylightFactor,
            exactCloudTime,
            store.layers.showAtmosphere !== false,
            _vSunDirLocal,
            store.layers.showClouds3D !== false && store.layers.showDynamicShadows !== false && isSunLit && sunSky.altitudeDeg > 0.0
          );
        }
      }

      // D. Update Planets & Star-Sparkle Caustic Reflections
      // In human mode:
      // 1. Daylight scattering hides all planets completely during the day (daylightFactor > 0.08)
      // 2. At night, planets above horizon are visible as starry points
      planetMeshesRef.current.forEach((mesh, id) => {
        const pState = positions[id as AstroId];
        if (pState) {
          if (isHuman) {
            const pSky = calculateApparentCelestialSkyVector(
              pState,
              obsGround,
              45.0,
              horizonGeo.horizonDist,
              horizonGeo.maxCulminationDeg,
              horizonGeo.haRad
            );
            mesh.position.set(pSky.position.x, pSky.position.y, pSky.position.z);
            const isNightAtObserver = daylightFactor <= 0.08;
            const isVisible = store.layers.showPlanets && isNightAtObserver && pSky.isAboveHorizon;
            mesh.visible = isVisible;
            mesh.scale.set(0.18, 0.18, 0.18); // Realistic pinpoint star in night sky
          } else {
            mesh.position.set(pState.x, pState.y, pState.z);
            mesh.visible = store.layers.showPlanets;
            mesh.scale.set(1.0, 1.0, 1.0);
          }
        }
      });

      // Animate starry water-reflection shimmer glints
      planetSparklesRef.current.forEach((item, id) => {
        const mesh = planetMeshesRef.current.get(id);
        const isParentVisible = mesh ? mesh.visible : false;
        item.sprite.visible = isParentVisible;

        if (isParentVisible) {
          const s1 = Math.sin(time * 0.0035 + item.phase) * 0.5 + 0.5;
          const s2 = Math.cos(time * 0.0058 + item.phase * 1.7) * 0.5 + 0.5;
          const s3 = Math.sin(time * 0.0092 + item.phase * 2.9) * 0.5 + 0.5;
          const ripple = 0.65 + 0.55 * (s1 * 0.45 + s2 * 0.35 + s3 * 0.20);
          
          item.sprite.material.rotation = Math.sin(time * 0.0014 + item.phase) * 0.45;
          const scaleMult = isHuman ? 0.25 : 1.0;
          item.sprite.scale.set(item.baseScale * ripple * scaleMult, item.baseScale * ripple * scaleMult, 1);
          item.sprite.material.opacity = Math.min(0.55, 0.36 + 0.16 * ripple);
        }
      });

      // E. Update Orbit Lines (Hidden in Human Observer mode to maintain realistic sky)
      if (orbitLinesGroupRef.current) {
        orbitLinesGroupRef.current.visible = store.layers.showOrbits && !isHuman;
      }

      if (sunLiveOrbitRef.current) {
        const sunRadiusNow = Math.sqrt(sunState.x * sunState.x + sunState.z * sunState.z);
        sunLiveOrbitRef.current.scale.set(sunRadiusNow, 1, sunRadiusNow);
        sunLiveOrbitRef.current.position.y = sunState.y;
      }

      if (moonLiveOrbitRef.current) {
        const moonRadiusNow = Math.sqrt(moonState.x * moonState.x + moonState.z * moonState.z);
        moonLiveOrbitRef.current.scale.set(moonRadiusNow, 1, moonRadiusNow);
        moonLiveOrbitRef.current.position.y = moonState.y;
      }

      planetLiveOrbitsRef.current.forEach((orbitLine, planetId) => {
        const pState = positions[planetId as AstroId];
        if (pState) {
          const pRadiusNow = Math.sqrt(pState.x * pState.x + pState.z * pState.z);
          orbitLine.scale.set(pRadiusNow, 1, pRadiusNow);
          orbitLine.position.y = pState.y;
        }
      });

      // F. Update Celestial Sphere (Rotating around Polaris)
      if (sceneRef.current) {
        const targetBg = store.layers.showSpaceBackground ? 0x050b14 : 0x000000;
        if ((sceneRef.current.background as THREE.Color)?.getHex() !== targetBg) {
          sceneRef.current.background = new THREE.Color(targetBg);
        }
      }

      if (celestialSphere3DRef.current) {
        const showAnyVaultLayer = Boolean(
          store.layers.showSpaceBackground || store.layers.showConstellations || store.layers.showNebulae
        );
        celestialSphere3DRef.current.group.visible = showAnyVaultLayer;
        if (showAnyVaultLayer) {
          const sunPosForDome = isHuman 
            ? _vSunPosForDome.set(sunSky.position.x, sunSky.position.y, sunSky.position.z)
            : _vSunPosForDome.set(sunState.x, sunState.y, sunState.z);

          const moonPosForDome = isHuman && moonSky
            ? _vMoonPosForDome.set(moonSky.position.x, moonSky.position.y, moonSky.position.z)
            : _vMoonPosForDome.set(moonState.x, moonState.y, moonState.z);

          const moonIllumPct = moonState?.illuminatedPct ?? 50;
          const moonAltDeg = isHuman && moonSky ? moonSky.altitudeDeg : 25.0;
          // A luz da Lua atinge seu espalhamento atmosférico pleno no céu noturno com transição suave ao poente
          const moonHorizonFactor = THREE.MathUtils.clamp((moonAltDeg + 4.0) / 8.0, 0.0, 1.0);
          const effectiveMoonLight = (moonIllumPct / 100.0) * moonHorizonFactor;
          
          if (isHuman) {
            // Local compass basis at observer ground location:
            const compass = getLocalCompassVectors(obsGround);
            _vNorth.set(compass.nx, 0, compass.nz);
            _vEast.set(compass.ex, 0, compass.ez);
            _vSouth.copy(_vNorth).negate();

            // True North Celestial Pole orientation: tilted by observer latitude above local North:
            // For São Paulo (lat = -23.55° S), the North Celestial Pole (Polaris) is 23.55° BELOW the northern horizon (invisible)!
            // The celestial vault accurately displays the southern constellations (Cruzeiro do Sul) overhead, exactly as seen from São Paulo!
            const latRad = (store.settings.observerLat * Math.PI) / 180.0;
            _vNorthAxis.copy(_vNorth).multiplyScalar(Math.cos(latRad)).addScaledVector(_vUp, Math.sin(latRad)).normalize();
            _vPolePerp.crossVectors(_vEast, _vNorthAxis).normalize();
            _mPoleBasis.makeBasis(_vEast, _vNorthAxis, _vPolePerp);
            _qCelestialPole.setFromRotationMatrix(_mPoleBasis);

            _vEyePos.set(obsGround.x, eyeLevelY, obsGround.z);
            _vSunDirLocal.set(
              sunSky.position.x - obsGround.x,
              sunSky.position.y - eyeLevelY,
              sunSky.position.z - obsGround.z
            ).normalize();
            if (moonSky && moonMeshRef.current) {
              _vMoonDirLocal.set(
                moonSky.position.x - obsGround.x,
                moonSky.position.y - eyeLevelY,
                moonSky.position.z - obsGround.z
              ).normalize();
            } else {
              _vMoonDirLocal.set(0, 1, 0);
            }

            celestialSphere3DRef.current.updateSphericalHumanObserver(
              store.currentDate,
              daylightFactor,
              _vSunDirLocal,
              _vMoonDirLocal,
              _vEyePos,
              _qIdentity,
              _qCelestialPole,
              cloudAccumMs,
              effectiveMoonLight,
              moonAltDeg,
              Boolean(store.layers.showConstellations),
              Boolean(store.layers.showConstellationLines),
              Boolean(store.layers.showConstellationLabels),
              store.layers.constellationLineColor || 'cyan',
              store.layers.constellationLineOpacity ?? 0.85,
              store.layers.selectedConstellation
            );
          } else {
            celestialSphere3DRef.current.update(
              store.currentDate,
              daylightFactor,
              sunPosForDome,
              _vEyePos.set(obsGround.x, eyeLevelY, obsGround.z),
              false,
              store.settings.observerLat,
              Boolean(store.layers.showConstellations),
              Boolean(store.layers.showSpaceBackground),
              eclipseInfo.isSolarEclipseActive ? eclipseInfo.solarEclipseMagnitude : 0.0,
              cloudAccumMs,
              moonPosForDome,
              effectiveMoonLight,
              moonAltDeg,
              Boolean(store.layers.showNebulae),
              Boolean(store.layers.showConstellationLines),
              Boolean(store.layers.showConstellationLabels),
              store.layers.constellationLineColor || 'cyan',
              store.layers.constellationLineOpacity ?? 0.85,
              store.layers.selectedConstellation
            );
          }
        }
      }

      // F2. Update Nomes dos Astros (showAstroNames)
      if (astroLabelsGroupRef.current) {
        const showNames = Boolean(store.layers.showAstroNames);
        astroLabelsGroupRef.current.visible = showNames;
        if (showNames) {
          astroLabelSpritesRef.current.forEach((sprite, id) => {
            if (id === 'sun' && sunMeshRef.current) {
              sprite.visible = sunMeshRef.current.visible;
              sprite.position.set(
                sunMeshRef.current.position.x,
                sunMeshRef.current.position.y + 1.35,
                sunMeshRef.current.position.z
              );
              const sc = isHuman ? 2.6 : 4.6;
              sprite.scale.set(sc, sc * 0.255, 1);
            } else if (id === 'moon' && moonMeshRef.current) {
              sprite.visible = moonMeshRef.current.visible;
              sprite.position.set(
                moonMeshRef.current.position.x,
                moonMeshRef.current.position.y + 1.35,
                moonMeshRef.current.position.z
              );
              const sc = isHuman ? 2.6 : 4.6;
              sprite.scale.set(sc, sc * 0.255, 1);
            } else if (id === 'rahu' && rahuMeshRef.current) {
              sprite.visible = isRahuKetuEnabled && rahuMeshRef.current.visible;
              sprite.position.set(
                rahuMeshRef.current.position.x,
                rahuMeshRef.current.position.y + 1.25,
                rahuMeshRef.current.position.z
              );
              const sc = isHuman ? 2.4 : 4.2;
              sprite.scale.set(sc, sc * 0.255, 1);
            } else if (id === 'ketu' && ketuMeshRef.current) {
              sprite.visible = isRahuKetuEnabled && ketuMeshRef.current.visible;
              sprite.position.set(
                ketuMeshRef.current.position.x,
                ketuMeshRef.current.position.y + 1.35,
                ketuMeshRef.current.position.z
              );
              const sc = isHuman ? 2.4 : 4.2;
              sprite.scale.set(sc, sc * 0.255, 1);
            } else {
              const pMesh = planetMeshesRef.current.get(id);
              if (pMesh) {
                sprite.visible = pMesh.visible;
                sprite.position.set(pMesh.position.x, pMesh.position.y + 0.95, pMesh.position.z);
                const sc = isHuman ? 2.2 : 3.8;
                sprite.scale.set(sc, sc * 0.255, 1);
              } else {
                sprite.visible = false;
              }
            }
          });
        }
      }

      // F3. Update Linhas de Grade (showGridLines) & Bússola Cardinal (showCoordinates)
      if (gridLinesGroupRef.current) {
        gridLinesGroupRef.current.visible = Boolean(store.layers.showGridLines) && !isHuman;
      }
      if (compassGroupRef.current) {
        compassGroupRef.current.visible = Boolean(store.layers.showCoordinates) && !isHuman;
      }

      // F4. Update Cinturão do Zodíaco (showZodiacBelt)
      if (zodiacBeltGroupRef.current) {
        const showZodiac = Boolean(store.layers.showZodiacBelt) && !isHuman;
        zodiacBeltGroupRef.current.visible = showZodiac;
        if (showZodiac) {
          const epochDaysZ = store.currentDate.getTime() / (1000 * 60 * 60 * 24);
          const siderealProgressZ = (epochDaysZ % 0.997269566) / 0.997269566;
          zodiacBeltGroupRef.current.rotation.y = -(siderealProgressZ * 2 * Math.PI);
          zodiacBeltGroupRef.current.position.set(0, 0, 0);
        }
      }

      // G. Update Altitude Vertical Rods (Hidden in Human 1st-person view)
      if (altitudeRodsGroupRef.current) {
        const rods = altitudeRodsGroupRef.current;
        rods.visible = store.layers.showAstroAltitudes && !isHuman;

        if (store.layers.showAstroAltitudes && !isHuman) {
          while (rods.children.length > 0) {
            rods.remove(rods.children[0]);
          }

          const astros = ['sun', 'moon', 'mars', 'jupiter', 'saturn'];
          astros.forEach(id => {
            const st = positions[id as AstroId];
            if (!st) return;
            const pts = [new THREE.Vector3(st.x, 0, st.z), new THREE.Vector3(st.x, st.y, st.z)];
            const rodGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const rodMat = new THREE.LineDashedMaterial({
              color: id === 'sun' ? 0xfbbf24 : id === 'moon' ? 0xe2e8f0 : 0x38bdf8,
              dashSize: 0.8,
              gapSize: 0.4,
              transparent: true,
              opacity: 0.45,
            });
            const rodLine = new THREE.Line(rodGeo, rodMat);
            rodLine.computeLineDistances();
            rods.add(rodLine);
          });
        }
      }

      // H. Update Observer 3D Pin, Radar Ripple & Floating Tag
      if (observerGroupRef.current) {
        observerGroupRef.current.position.set(obsGround.x, (isHuman ? 0.05 : eyeLevelY) + 0.04, obsGround.z);
        // Hide observer pin in 1st person human mode so it doesn't block the camera
        observerGroupRef.current.visible = !isHuman && store.layers.showCoordinates;

        // Animate radar ripple
        if (observerRippleMeshRef.current) {
          const pulse = (time * 0.0018) % 1;
          observerRippleMeshRef.current.scale.set(1 + pulse * 1.5, 1 + pulse * 1.5, 1);
          const mat = observerRippleMeshRef.current.material as THREE.MeshBasicMaterial;
          if (mat) {
            mat.opacity = (1 - pulse) * 0.7;
          }
        }

        // Update tag texture when location changes
        const obsKey = `${store.settings.observerLocationName}_${store.settings.observerLat}_${store.settings.observerLng}`;
        if (obsKey !== lastObserverKeyRef.current && observerTagSpriteRef.current) {
          lastObserverKeyRef.current = obsKey;
          const tagCanvas = document.createElement('canvas');
          tagCanvas.width = 512;
          tagCanvas.height = 140;
          const ctx = tagCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.roundRect(8, 8, 496, 124, 20);
            ctx.fill();
            ctx.stroke();

            ctx.font = 'bold 30px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`📍 ${store.settings.observerLocationName || 'Observador'}`, 256, 46);

            const latStr = store.settings.observerLat >= 0 ? `${store.settings.observerLat.toFixed(1)}° N` : `${Math.abs(store.settings.observerLat).toFixed(1)}° S`;
            const lngStr = store.settings.observerLng >= 0 ? `${store.settings.observerLng.toFixed(1)}° E` : `${Math.abs(store.settings.observerLng).toFixed(1)}° W`;
            ctx.font = 'bold 20px monospace';
            ctx.fillStyle = '#38bdf8';
            ctx.fillText(`${latStr}, ${lngStr} • Zênite Solar 12:00`, 256, 92);

            const newTex = new THREE.CanvasTexture(tagCanvas);
            newTex.minFilter = THREE.LinearFilter;
            observerTagSpriteRef.current.material.map = newTex;
            observerTagSpriteRef.current.material.needsUpdate = true;
          }
        }
      }

      // G2. World Cities 3D Layer Visibility & Terrain Elevation Sync
      if (citiesGroupRef.current) {
        const showCities = Boolean(store.layers.showWorldCities) && !isHuman;
        citiesGroupRef.current.visible = showCities;
        if (showCities) {
          const currentDispScale = earthDiscUniformsRef.current
            ? earthDiscUniformsRef.current.uDisplacementScale.value
            : 1.0;
          const show3DRelief = store.layers.showMountainRelief3D !== false ? 1.0 : 0.0;
          cityMarkersListRef.current.forEach((cm) => {
            const hOffset =
              cm.normElev > 0.045
                ? Math.pow((cm.normElev - 0.045) / 0.955, 1.15) * currentDispScale * show3DRelief * 1.3125
                : 0;
            cm.pin.position.y = hOffset + 0.22;
            cm.sprite.position.y = hOffset + 0.68;
          });
        }
      }

      // G2.5. World Mountain Peaks 3D Layer & Dynamic Summit Elevation
      if (mountainPeaksGroupRef.current) {
        const showPeaks = store.layers.showMountainPeaks && !isHuman;
        mountainPeaksGroupRef.current.visible = showPeaks;
        if (showPeaks) {
          const currentDispScale = earthDiscUniformsRef.current ? earthDiscUniformsRef.current.uDisplacementScale.value : 1.0;
          const show3DRelief = store.layers.showMountainRelief3D !== false ? 1.0 : 0.0;

          mountainMarkersListRef.current.forEach((m) => {
            const elevFrac = m.baseElevMeters / 8848.0;
            const yOffset = elevFrac * 1.3125 * currentDispScale * show3DRelief;
            m.beacon.position.y = yOffset + 0.28;
            m.sprite.position.y = yOffset + 0.78;
          });
        }
      }

      // G3. 3D Atmospheric Clouds System Update (Photorealistic Satellite FBM Clouds & Human Sky Dome Clouds)
      if (clouds3DRef.current) {
        clouds3DRef.current.update(
          delta,
          new THREE.Vector3(sunState.x, sunState.y, sunState.z),
          new THREE.Vector3(moonState.x, moonState.y, moonState.z),
          moonState.illuminatedPct ?? 50,
          store.settings,
          store.layers,
          cameraRef.current ?? undefined,
          isHuman,
          obsGround,
          new THREE.Vector3(sunSky.position.x, sunSky.position.y, sunSky.position.z),
          new THREE.Vector3(moonSky.position.x, moonSky.position.y, moonSky.position.z),
          humanDaylightFactor,
          timeCloudMultiplier
        );
      }

      // G5. Real-Time 3D Weather System Update (Precipitation, Rain, Snow, Lightning & Live Badges)
      if (weather3DRef.current) {
        weather3DRef.current.update(
          delta,
          new THREE.Vector3(sunState.x, sunState.y, sunState.z),
          store.settings,
          store.layers,
          isHuman
        );
      }

      // G6. As 5 Camadas da Atmosfera 3D System Update (Troposfera a Exosfera, Objetos e Fenômenos)
      if (atmosphere3DRef.current) {
        atmosphere3DRef.current.update(
          delta,
          new THREE.Vector3(sunState.x, sunState.y, sunState.z),
          new THREE.Vector3(moonState.x, moonState.y, moonState.z),
          store.layers,
          cameraRef.current,
          isHuman
        );
      }

      // Ensure crystal clear sky visibility without murky fog
      if (sceneRef.current) {
        if (sceneRef.current.fog) {
          sceneRef.current.fog = null;
        }
        if (isHuman) {
          // Na visão humana, o domo atmosférico e abóbada celeste preenchem 360° do horizonte sem corte abrupto
          sceneRef.current.background = null;
        } else {
          // In Global view (space), background is deep space black to showcase the rotating Milky Way galaxy and stars
          if (!sceneRef.current.background) {
            sceneRef.current.background = new THREE.Color(0x010206);
          }
        }
      }

      if (cameraRef.current) {
        const cam = cameraRef.current;
        const mode = store.cameraMode;

        if (mode === 'human') {
          // Human Observer 1st-Person Perspective (Positioned strictly on top of local planar ground)
          const obsX = obsGround.x;
          const obsZ = obsGround.z;

          cam.position.set(obsX, eyeLevelY, obsZ);

          // Local compass reference vectors at observer location:
          const compass = getLocalCompassVectors(obsGround);
          const { nx, nz, ex, ez } = compass;

          // Delegate to centralized humanCameraController (Zero chord-shortcut through zenith, rectilinear FOV)
          applyHumanCameraQuaternion(
            cam,
            _vEast.set(ex, 0, ez),
            _vUp,
            _vNorth.set(nx, 0, nz),
            humanLookAnglesRef.current.azimuth,
            humanLookAnglesRef.current.pitch,
            humanFovRef.current
          );

          if (cam.near !== 0.05) {
            cam.near = 0.05;
            cam.updateProjectionMatrix();
          }

          // In human view, adjust the sun sparkle & glare with sunset crepuscular flares and eclipse
          if (sunSparkleSpriteRef.current) {
            let beamFactor = 1.0;
            if (eclipseInfo.isSolarEclipseActive) {
              beamFactor = 0.0;
            }
            const sunAlt = sunSky.altitudeDeg;
            const sunsetFac = THREE.MathUtils.clamp(1.0 - Math.abs(sunAlt - 3.5) / 8.0, 0.0, 1.0);
            // Escala compacta do brilho na visualização humana para que o Sol tenha praticamente o tamanho da Lua
            const sparkleScale = 1.85 * beamFactor;
            sunSparkleSpriteRef.current.scale.set(sparkleScale, sparkleScale, 1);
            
            const sparkleMat = sunSparkleSpriteRef.current.material as THREE.SpriteMaterial;
            if (sunAlt < 14.0) {
              const sunsetColor = new THREE.Color(0xfff5cc).lerp(new THREE.Color(0xff8822), sunsetFac);
              sparkleMat.color.copy(sunsetColor);
            } else {
              sparkleMat.color.setHex(0xffffff);
            }
            // Fade sparkle smoothly as the sun sets behind mountains & horizon (completely fades when setting)
            const horizonFade = THREE.MathUtils.clamp((sunAlt + 0.1) / 2.2, 0.0, 1.0);
            sparkleMat.opacity = Math.min(0.85, (daylightFactor * 0.85 + sunsetFac * 0.30)) * beamFactor * horizonFade;
            sunSparkleSpriteRef.current.visible = (sunSky.altitudeDeg >= 0.0) && beamFactor > 0.001 && horizonFade > 0.01 && !eclipseInfo.isSolarEclipseActive;
          }
        } else {
          if (cam.near !== 0.2) {
            cam.near = 0.2;
            cam.updateProjectionMatrix();
          }

          if (cam.fov !== 45) {
            cam.fov = 45;
            cam.updateProjectionMatrix();
          }

          if (sunSparkleSpriteRef.current) {
            let beamFactor = 1.0;
            if (eclipseInfo.isSolarEclipseActive) {
              beamFactor = 0.0;
            }
            const currentScale = 3.0 * beamFactor;
            sunSparkleSpriteRef.current.scale.set(currentScale, currentScale, 1);
            (sunSparkleSpriteRef.current.material as THREE.SpriteMaterial).opacity = 0.85 * beamFactor;
            sunSparkleSpriteRef.current.visible = beamFactor > 0.001 && store.layers.showSolarFocus !== false && !eclipseInfo.isSolarEclipseActive;
          }

          if (store.followAstroId && positions[store.followAstroId]) {
            const target = positions[store.followAstroId];
            cameraTargetRef.current.lerp(new THREE.Vector3(target.x, target.y, target.z), 0.08);
            cam.position.lerp(new THREE.Vector3(target.x + 12, target.y + 6, target.z + 18), 0.08);
            cam.lookAt(cameraTargetRef.current);
          } else if (mode === 'top') {
            // Zenital Top-Down View
            cam.position.lerp(new THREE.Vector3(0, 95, 0.01), 0.08);
            cameraTargetRef.current.lerp(new THREE.Vector3(0, 0, 0), 0.08);
            cam.lookAt(cameraTargetRef.current);
          } else if (mode === 'side') {
            // Side Altitude Profile View
            cam.position.lerp(new THREE.Vector3(0, 22, 105), 0.08);
            cameraTargetRef.current.lerp(new THREE.Vector3(0, 18, 0), 0.08);
            cam.lookAt(cameraTargetRef.current);
          } else if (mode === 'sky') {
            // Observer on ground looking around at the sky & horizon (also using pure quaternion orientation)
            const obsX = obsGround.x;
            const obsZ = obsGround.z;

            cam.position.set(obsX, 0.9, obsZ);
            const compass = getLocalCompassVectors(obsGround);
            applyHumanCameraQuaternion(
              cam,
              _vEast.set(compass.ex, 0, compass.ez),
              _vUp,
              _vNorth.set(compass.nx, 0, compass.nz),
              skyLookAnglesRef.current.azimuth,
              skyLookAnglesRef.current.pitch,
              humanFovRef.current
            );
          } else {
            // Earth Perspective (Interactive 3D Orbit)
            const sph = cameraSphericalRef.current;
            const targetX = sph.radius * Math.sin(sph.phi) * Math.sin(sph.theta);
            const targetY = sph.radius * Math.cos(sph.phi);
            const targetZ = sph.radius * Math.sin(sph.phi) * Math.cos(sph.theta);

            cam.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.1);
            cameraTargetRef.current.lerp(new THREE.Vector3(0, 2, 0), 0.1);
            cam.lookAt(cameraTargetRef.current);
          }
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    // Custom Event Listeners for Human Observer HUD Controls
    const onHumanLookAtAstro = (e: Event) => {
      const customEv = e as CustomEvent<{ astroId: AstroId }>;
      const targetId = customEv.detail?.astroId;
      if (!targetId) return;

      const store = useSimulationStore.getState();
      const positions = calculateAstroPositions(store.currentDate, store.settings);
      const obsGround = geoToPlanarCoords(store.settings.observerLat, store.settings.observerLng);
      const horizonGeo = getDynamicHorizonDistance(store.settings.observerLat, store.settings.observerLng, store.currentDate);

      const targetPos = positions[targetId] || positions.sun;
      let maxCulm = 65.0;
      let haRad = horizonGeo.haRad;
      let isSun = false;
      let nodalFac = 0;

      const eclipseInfo = getEclipseInfo(
        positions.sun,
        positions.moon,
        positions.rahu,
        positions.ketu,
        store.settings.eclipseTheory,
        store.currentDate,
        store.settings.observerLat,
        store.settings.observerLng
      );
      const isMoonEclipsing = (targetId === 'moon') && (store.settings.eclipseTheory === 'moon_eclipses_sun') && eclipseInfo.isSolarEclipseActive;

      if (targetId === 'sun' || targetId === 'rahu' || isMoonEclipsing) {
        maxCulm = horizonGeo.maxCulminationDeg;
        haRad = horizonGeo.haRad;
        isSun = true;
      } else if (targetId === 'moon' || targetId === 'ketu') {
        const totalDaysEpoch = (store.currentDate.getTime() / (1000 * 60 * 60 * 24));
        nodalFac = Math.sin((totalDaysEpoch / 27.32) * 2 * Math.PI);
        maxCulm = Math.max(15.0, Math.min(90.0, 90.0 - Math.abs(store.settings.observerLat - (23.44 * nodalFac))));
        haRad = Math.PI / 2;
        isSun = false;
      }

      const targetSky = calculateApparentCelestialSkyVector(
        targetPos,
        obsGround,
        39.2,
        horizonGeo.horizonDist,
        maxCulm,
        haRad,
        isSun,
        nodalFac
      );

      const compass = getLocalCompassVectors(obsGround);
      const dx = targetSky.position.x - obsGround.x;
      const dy = targetSky.position.y - 0.05;
      const dz = targetSky.position.z - obsGround.z;

      const localNorth = dx * compass.nx + dz * compass.nz;
      const localEast = dx * compass.ex + dz * compass.ez;
      let azRad = Math.atan2(localEast, localNorth);
      if (azRad < 0) azRad += 2 * Math.PI;

      const horizDist = Math.hypot(localNorth, localEast);
      const pitchRad = Math.atan2(dy, horizDist);

      humanLookAnglesRef.current.azimuth = azRad;
      // Always look up towards the celestial vault when focusing on an astro
      humanLookAnglesRef.current.pitch = clampHumanPitch(Math.max(0.08, pitchRad));
      broadcastHumanCameraAngles(humanLookAnglesRef.current.azimuth, humanLookAnglesRef.current.pitch);
    };

    const onHumanLookAngles = (e: Event) => {
      const customEv = e as CustomEvent<{ azimuth: number; pitch: number }>;
      if (customEv.detail) {
        if (typeof customEv.detail.azimuth === 'number') {
          humanLookAnglesRef.current.azimuth = customEv.detail.azimuth;
        }
        if (typeof customEv.detail.pitch === 'number') {
          humanLookAnglesRef.current.pitch = clampHumanPitch(customEv.detail.pitch);
        }
      }
    };

    const onHumanSetEyeHeight = (e: Event) => {
      const customEv = e as CustomEvent<{ height: number }>;
      if (typeof customEv.detail?.height === 'number') {
        humanEyeHeightRef.current = customEv.detail.height;
      }
    };

    const onHumanSetFov = (e: Event) => {
      const customEv = e as CustomEvent<{ fov: number }>;
      if (typeof customEv.detail?.fov === 'number') {
        humanFovRef.current = clampHumanFov(customEv.detail.fov);
        if (cameraRef.current) {
          cameraRef.current.fov = humanFovRef.current;
          cameraRef.current.updateProjectionMatrix();
        }
      }
    };

    window.addEventListener('human-look-at-astro', onHumanLookAtAstro);
    window.addEventListener('human-look-angles', onHumanLookAngles);
    window.addEventListener('human-set-eye-height', onHumanSetEyeHeight);
    window.addEventListener('human-set-fov', onHumanSetFov);

    return () => {
      window.removeEventListener('human-look-at-astro', onHumanLookAtAstro);
      window.removeEventListener('human-look-angles', onHumanLookAngles);
      window.removeEventListener('human-set-eye-height', onHumanSetEyeHeight);
      window.removeEventListener('human-set-fov', onHumanSetFov);
      resizeObserver.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (atmosphere3DRef.current) atmosphere3DRef.current.dispose();
      if (clouds3DRef.current) clouds3DRef.current.dispose();
      if (weather3DRef.current) weather3DRef.current.dispose();
      if (celestialSphere3DRef.current) celestialSphere3DRef.current.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Mouse & Touch Orbit / Sky / Human Look Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevMousePosRef.current.x;
    const dy = e.clientY - prevMousePosRef.current.y;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };

    const store = useSimulationStore.getState();
    if (store.cameraMode === 'human' || store.cameraMode === 'sky') {
      const angles = store.cameraMode === 'human' ? humanLookAnglesRef.current : skyLookAnglesRef.current;
      applyHumanLookDrag(angles, dx, dy, false, false);
      if (store.cameraMode === 'human') {
        broadcastHumanCameraAngles(angles.azimuth, angles.pitch);
      }
    } else {
      const sph = cameraSphericalRef.current;
      sph.theta -= dx * 0.006;
      sph.phi = Math.max(0.12, Math.min(Math.PI / 2.05, sph.phi - dy * 0.006));
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Helper to Raycast & Select Astro from screen coordinates (Mouse Click & Mobile Tap)
  const raycastAstroAt = (clientX: number, clientY: number): boolean => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return false;

    const store = useSimulationStore.getState();
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const candidates: { id: AstroId; obj: THREE.Object3D }[] = [];
    if (sunMeshRef.current) candidates.push({ id: 'sun', obj: sunMeshRef.current });
    if (moonMeshRef.current) candidates.push({ id: 'moon', obj: moonMeshRef.current });
    if (store.settings.eclipseTheory !== 'moon_eclipses_sun') {
      if (rahuMeshRef.current) candidates.push({ id: 'rahu', obj: rahuMeshRef.current });
      if (ketuMeshRef.current) candidates.push({ id: 'ketu', obj: ketuMeshRef.current });
    }
    planetMeshesRef.current.forEach((obj, id) => candidates.push({ id: id as AstroId, obj }));

    for (const c of candidates) {
      const intersects = raycaster.intersectObjects(c.obj.children, true);
      if (intersects.length > 0) {
        selectAstro(c.id);
        return true;
      }
    }
    return false;
  };

  // Helper to place Observer Pin on Double Click or Double Tap on Ground
  const placeObserverAtPoint = (clientX: number, clientY: number) => {
    if (!containerRef.current || !cameraRef.current || !earthDiscMeshRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObject(earthDiscMeshRef.current, false);
    if (intersects.length > 0) {
      const pt = intersects[0].point;
      const geo = planarCoordsToGeo(pt.x, pt.z);
      const nearest = findNearestCity(geo.lat, geo.lng);
      
      const locName = nearest
        ? `${nearest.namePt}, ${nearest.countryPt}`
        : `Posição (${geo.lat > 0 ? geo.lat + '° N' : Math.abs(geo.lat) + '° S'}, ${geo.lng > 0 ? geo.lng + '° L' : Math.abs(geo.lng) + '° O'})`;

      const store = useSimulationStore.getState();
      store.updateSettings({
        observerLat: geo.lat,
        observerLng: geo.lng,
        observerLocationName: locName,
      });
    }
  };

  // Mobile Touch Event Handlers (Single finger look/pan, Two fingers pinch-zoom, Tap-to-select, Double-tap pin)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      const touch = e.touches[0];
      prevMousePosRef.current = { x: touch.clientX, y: touch.clientY };
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
      touchStartTimeRef.current = Date.now();
      touchStartDistRef.current = null;
    } else if (e.touches.length === 2) {
      isDraggingRef.current = false;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // 1. Two-finger Pinch to Zoom (FOV in human mode, radius in orbit mode)
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const deltaDist = currentDist - touchStartDistRef.current;
      touchStartDistRef.current = currentDist;

      const store = useSimulationStore.getState();
      if (store.cameraMode === 'human' || store.cameraMode === 'sky') {
        // Pinch out (deltaDist > 0) = zoom in (lower FOV), Pinch in (deltaDist < 0) = zoom out (clamped by clampHumanFov)
        humanFovRef.current = clampHumanFov(humanFovRef.current - deltaDist * 0.14);
        if (cameraRef.current) {
          cameraRef.current.fov = humanFovRef.current;
          cameraRef.current.updateProjectionMatrix();
        }
      } else {
        // If user pinches in 'top' or 'side' fixed preset, switch smoothly to interactive 'earth' orbit so they can zoom freely
        if (store.cameraMode === 'top' || store.cameraMode === 'side') {
          store.setCameraMode('earth');
        }
        const sph = cameraSphericalRef.current;
        const zoomFactor = Math.exp(-deltaDist * 0.0065);
        sph.radius = Math.max(8, Math.min(480, sph.radius * zoomFactor));
      }
      return;
    }

    // 2. Single-finger Look / Orbit
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - prevMousePosRef.current.x;
    const dy = touch.clientY - prevMousePosRef.current.y;
    prevMousePosRef.current = { x: touch.clientX, y: touch.clientY };

    const store = useSimulationStore.getState();
    if (store.cameraMode === 'human' || store.cameraMode === 'sky') {
      const angles = store.cameraMode === 'human' ? humanLookAnglesRef.current : skyLookAnglesRef.current;
      applyHumanLookDrag(angles, dx, dy, false, false);
      if (store.cameraMode === 'human') {
        broadcastHumanCameraAngles(angles.azimuth, angles.pitch);
      }
    } else {
      const sph = cameraSphericalRef.current;
      sph.theta -= dx * 0.006;
      sph.phi = Math.max(0.12, Math.min(Math.PI / 2.05, sph.phi - dy * 0.006));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      isDraggingRef.current = false;
      touchStartDistRef.current = null;

      // Detect clean tap without dragging (< 14px movement, < 350ms duration)
      if (touchStartPosRef.current) {
        const touchDuration = Date.now() - touchStartTimeRef.current;
        const totalMoved = Math.hypot(
          prevMousePosRef.current.x - touchStartPosRef.current.x,
          prevMousePosRef.current.y - touchStartPosRef.current.y
        );

        if (totalMoved < 14 && touchDuration < 350) {
          const now = Date.now();
          const timeSinceLastTap = now - lastTapTimeRef.current;
          
          if (timeSinceLastTap < 320) {
            // Double-tap on mobile: place observer pin
            placeObserverAtPoint(touchStartPosRef.current.x, touchStartPosRef.current.y);
            lastTapTimeRef.current = 0;
          } else {
            // Single tap: select astro
            lastTapTimeRef.current = now;
            raycastAstroAt(touchStartPosRef.current.x, touchStartPosRef.current.y);
          }
        }
      }
    } else if (e.touches.length === 1) {
      // Transition from 2-finger pinch back to 1-finger drag
      touchStartDistRef.current = null;
      prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const store = useSimulationStore.getState();
    if (store.cameraMode === 'human' || store.cameraMode === 'sky') {
      humanFovRef.current = clampHumanFov(humanFovRef.current + e.deltaY * 0.035);
      if (cameraRef.current) {
        cameraRef.current.fov = humanFovRef.current;
        cameraRef.current.updateProjectionMatrix();
      }
    } else {
      if (store.cameraMode === 'top' || store.cameraMode === 'side') {
        store.setCameraMode('earth');
      }
      const sph = cameraSphericalRef.current;
      sph.radius = Math.max(8, Math.min(480, sph.radius + e.deltaY * 0.065));
    }
  };

  // Click on Canvas to Raycast & Select Astro
  const handleCanvasClick = (e: React.MouseEvent) => {
    raycastAstroAt(e.clientX, e.clientY);
  };

  // Double Click on Map Ground Disc to Place Observer Pin
  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    placeObserverAtPoint(e.clientX, e.clientY);
  };

  return (
    <div
      ref={containerRef}
      id="planar-canvas-container"
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      onClick={handleCanvasClick}
      onDoubleClick={handleCanvasDoubleClick}
    />
  );
};
