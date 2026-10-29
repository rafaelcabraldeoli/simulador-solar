import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/simulationStore';
import {
  generateFlatEarthTexture,
  generateHypsometricPhysicalTexture,
  generateElevationDisplacementMap,
  generateNightCityLightsTexture,
  generateSunTexture,
  generateSunSparkleTexture,
  generateSolarCoronaTexture,
  generateMoonTexture,
  generateStarSparkleTexture,
} from '../../utils/textureGenerator';
import { getDayOfYear, findMatchingCatalogEclipse } from '../../utils/astronomy';
import {
  calculateLunarOrbitWithNodalPrecession,
  getContinuousEarthOrbitAngleRad,
} from '../../utils/lunarNodalPrecession';
import { WORLD_CITIES, findNearestCity, getLocationUtcOffsetHours } from '../../data/cities';
import {
  applyHumanCameraQuaternion,
  applyHumanLookDrag,
  broadcastHumanCameraAngles,
  clampHumanFov,
  clampHumanPitch,
  getDefaultHumanFov,
} from '../../utils/humanCameraController';
import { CelestialSphere3D } from './CelestialSphere3D';
import { ObserverEnvironment3D } from './ObserverEnvironment3D';

export type SolarSystemTargetId =
  | 'solar_system'
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'moon'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune';

export interface GlobeViewConfig {
  showAxialTilt: boolean;
  axialTiltDeg: number;
  lunarInclinationDeg: number;
  showLunarNodes?: boolean;
  showSphericalGrid: boolean;
  showTropicsAndCircles: boolean;
  showTerminatorRing: boolean;
  showAtmosphereHalo: boolean;
  showClouds3D?: boolean;
  showAurora?: boolean;
  showObserverPin: boolean;
  showObserverHorizonPlane: boolean;
  showPlanetOrbits: boolean;
  showPlanetLabels: boolean;
  showAsteroidBelt: boolean;
  lockCameraToEarthRotation: boolean;
  focusedBody: SolarSystemTargetId;
  globeCameraPreset:
    | 'solar_system'
    | 'earth_and_sun'
    | 'orbit'
    | 'tilt_side'
    | 'north_pole'
    | 'south_pole'
    | 'observer_close'
    | 'human_surface';
}

interface GlobeCanvasProps {
  globeConfig: GlobeViewConfig;
  onSelectBody?: (id: SolarSystemTargetId) => void;
}

/**
 * CALIBRAÇÃO ASTRONÔMICA OFICIAL (UAI / NASA):
 * 1 Unidade Astronômica (1,0000 UA = 149.597.870,7 km) = 260 unidades 3D.
 * Os planetas rochosos internos (Mercúrio 0,387 UA, Vênus 0,723 UA, Terra 1,000 UA, Marte 1,524 UA)
 * seguem rigorosamente a proporção linear 1:1 em Unidades Astronômicas para que a geometria angular,
 * elongação máxima de Vênus (47°) e distância Sol-Terra sejam matematicamente fiéis.
 */
export const AU_TO_UNITS = 260.0;
export const EARTH_DIAMETER_KM = 12742.0;
export const EARTH_RADIUS_KM = 6371.0;
export const MOON_DIAMETER_KM = 3474.8;
export const MOON_DISTANCE_KM = 384400.0; // 0,00257 UA (108x menor que a distância Terra-Vênus de 41,4 milhões de km!)
export const GLOBE_RADIUS = 1.0; // 1.000 unidade 3D = 1 Raio Terrestre (6.371 km)
export const MOON_RADIUS_3D = GLOBE_RADIUS * (MOON_DIAMETER_KM / EARTH_DIAMETER_KM); // 0.2727 unidades = 27,27% da Terra
// Na escala orbital do Sistema Solar (onde Terra = 260 un e Vênus = 188,1 un, separadas por 71,9 un),
// a órbita da Lua fica colada gravitacionalmente à Terra (6.0 un = 8,3% da distância até Vênus),
// jamais chegando perto de Vênus ou Mercúrio!
export const MOON_ORBIT_RADIUS = 6.0;
export const EARTH_ORBIT_RADIUS = 1.0 * AU_TO_UNITS; // 260.0 unidades = 149,6 milhões de km (1,000 UA)

export interface PlanetOrbitalSpec {
  id: SolarSystemTargetId;
  namePt: string;
  orbitRadius: number;
  radius3D: number; // Calculado rigorosamente por: GLOBE_RADIUS * (realDiameterKm / 12742)
  earthSizeRatio: number; // Proporção exata em relação ao diâmetro da Terra (Terra = 1.00)
  orbitalPeriodDays: number;
  rotationPeriodHours: number;
  orbitalInclinationDeg: number;
  axialTiltDeg: number;
  initialMeanLongitudeDeg: number;
  distanceAU: number;
  distanceMillionKm: number;
  realDiameterKm: number;
  apparentAngleFromEarth: string;
  colorHex: string;
}

export interface PlanetaryMoonSpec {
  id: string;
  namePt: string;
  realDiameterKm: number;
  realDistanceKm: number;
  orbitalPeriodDays: number; // Negative for retrograde orbit (e.g. Triton)
  inclinationDeg: number;
  orbitRadiusMult: number;   // Multiplier of parent planet's 3D radius
  radius3D: number;          // 3D sphere radius
  colorHex: string;
  secondaryColorHex: string;
  descriptionPt: string;
}

export const PLANETARY_MOONS_CATALOG: Record<string, PlanetaryMoonSpec[]> = {
  mercury: [],
  venus: [],
  earth: [
    {
      id: 'moon',
      namePt: 'Lua (Selene)',
      realDiameterKm: 3474.8,
      realDistanceKm: 384400,
      orbitalPeriodDays: 27.322,
      inclinationDeg: 5.145,
      orbitRadiusMult: 6.0,
      radius3D: MOON_RADIUS_3D,
      colorHex: '#e2e8f0',
      secondaryColorHex: '#64748b',
      descriptionPt: '5ª maior lua do Sistema Solar • Precessão Nodal 18,6 anos',
    },
  ],
  mars: [
    {
      id: 'phobos',
      namePt: 'Fobos',
      realDiameterKm: 22.2,
      realDistanceKm: 9376,
      orbitalPeriodDays: 0.3189, // 7h 39m (orbita mais rápido que a rotação de Marte!)
      inclinationDeg: 1.09,
      orbitRadiusMult: 2.15,
      radius3D: 0.085,
      colorHex: '#a8a29e',
      secondaryColorHex: '#57534e',
      descriptionPt: 'Cratera Stickney • Orbita em apenas 7h 39min',
    },
    {
      id: 'deimos',
      namePt: 'Deimos',
      realDiameterKm: 12.6,
      realDistanceKm: 23463,
      orbitalPeriodDays: 1.263, // 30,3h
      inclinationDeg: 1.79,
      orbitRadiusMult: 3.35,
      radius3D: 0.065,
      colorHex: '#d6d3d1',
      secondaryColorHex: '#78716c',
      descriptionPt: 'Satélite externo capturado • Órbita de 30,3h',
    },
  ],
  jupiter: [
    {
      id: 'io',
      namePt: 'Io',
      realDiameterKm: 3643.2,
      realDistanceKm: 421700,
      orbitalPeriodDays: 1.769,
      inclinationDeg: 0.05,
      orbitRadiusMult: 1.62,
      radius3D: GLOBE_RADIUS * (3643.2 / EARTH_DIAMETER_KM), // 0.286x Terra
      colorHex: '#facc15',
      secondaryColorHex: '#ea580c',
      descriptionPt: 'Corpo mais vulcanicamente ativo do Sistema Solar (Ressonância 1:2:4)',
    },
    {
      id: 'europa',
      namePt: 'Europa',
      realDiameterKm: 3121.6,
      realDistanceKm: 671034,
      orbitalPeriodDays: 3.551,
      inclinationDeg: 0.47,
      orbitRadiusMult: 2.08,
      radius3D: GLOBE_RADIUS * (3121.6 / EARTH_DIAMETER_KM), // 0.245x Terra
      colorHex: '#f8fafc',
      secondaryColorHex: '#b45309',
      descriptionPt: 'Crosta de gelo estriada sobre um vasto oceano líquido subsuperficial',
    },
    {
      id: 'ganymede',
      namePt: 'Ganimedes',
      realDiameterKm: 5268.2,
      realDistanceKm: 1070412,
      orbitalPeriodDays: 7.155,
      inclinationDeg: 0.20,
      orbitRadiusMult: 2.65,
      radius3D: GLOBE_RADIUS * (5268.2 / EARTH_DIAMETER_KM), // 0.413x Terra (Maior que Mercúrio!)
      colorHex: '#cbd5e1',
      secondaryColorHex: '#475569',
      descriptionPt: 'Maior lua do Sistema Solar (maior que Mercúrio) com magnetosfera própria',
    },
    {
      id: 'callisto',
      namePt: 'Calisto',
      realDiameterKm: 4820.6,
      realDistanceKm: 1882709,
      orbitalPeriodDays: 16.689,
      inclinationDeg: 0.19,
      orbitRadiusMult: 3.35,
      radius3D: GLOBE_RADIUS * (4820.6 / EARTH_DIAMETER_KM), // 0.378x Terra
      colorHex: '#94a3b8',
      secondaryColorHex: '#334155',
      descriptionPt: 'Superfície antiga saturada de crateras brilhantes (Valhalla)',
    },
  ],
  saturn: [
    {
      id: 'mimas',
      namePt: 'Mimas',
      realDiameterKm: 396.4,
      realDistanceKm: 185539,
      orbitalPeriodDays: 0.942,
      inclinationDeg: 1.57,
      orbitRadiusMult: 2.62,
      radius3D: 0.10,
      colorHex: '#cbd5e1',
      secondaryColorHex: '#64748b',
      descriptionPt: 'Cratera gigante Herschel • Limpa a Divisão de Cassini por ressonância',
    },
    {
      id: 'enceladus',
      namePt: 'Encélado',
      realDiameterKm: 504.2,
      realDistanceKm: 237948,
      orbitalPeriodDays: 1.370,
      inclinationDeg: 0.02,
      orbitRadiusMult: 2.86,
      radius3D: 0.12,
      colorHex: '#ffffff',
      secondaryColorHex: '#bae6fd',
      descriptionPt: 'Gêiseres criovulcânicos no polo sul e maior albedo do Sistema Solar',
    },
    {
      id: 'tethys',
      namePt: 'Tétis',
      realDiameterKm: 1062.2,
      realDistanceKm: 294619,
      orbitalPeriodDays: 1.888,
      inclinationDeg: 1.12,
      orbitRadiusMult: 3.12,
      radius3D: 0.14,
      colorHex: '#e2e8f0',
      secondaryColorHex: '#94a3b8',
      descriptionPt: 'Cânion gigante Ithaca Chasma e cratera Odysseus',
    },
    {
      id: 'dione',
      namePt: 'Dione',
      realDiameterKm: 1122.8,
      realDistanceKm: 377396,
      orbitalPeriodDays: 2.737,
      inclinationDeg: 0.02,
      orbitRadiusMult: 3.40,
      radius3D: 0.15,
      colorHex: '#f1f5f9',
      secondaryColorHex: '#64748b',
      descriptionPt: 'Penhascos de gelo brilhantes (wispy terrain)',
    },
    {
      id: 'rhea',
      namePt: 'Reia',
      realDiameterKm: 1527.6,
      realDistanceKm: 527108,
      orbitalPeriodDays: 4.518,
      inclinationDeg: 0.35,
      orbitRadiusMult: 3.75,
      radius3D: 0.17,
      colorHex: '#cbd5e1',
      secondaryColorHex: '#475569',
      descriptionPt: '2ª maior lua de Saturno • Corpo gelado densamente craterizado',
    },
    {
      id: 'titan',
      namePt: 'Titã',
      realDiameterKm: 5149.5,
      realDistanceKm: 1221870,
      orbitalPeriodDays: 15.945,
      inclinationDeg: 0.35,
      orbitRadiusMult: 4.35,
      radius3D: GLOBE_RADIUS * (5149.5 / EARTH_DIAMETER_KM), // 0.404x Terra (Maior que Mercúrio!)
      colorHex: '#f59e0b',
      secondaryColorHex: '#b45309',
      descriptionPt: '2ª maior lua do Sistema Solar • Densa atmosfera dourada de nitrogênio e mares de metano',
    },
    {
      id: 'iapetus',
      namePt: 'Jápeto',
      realDiameterKm: 1469.0,
      realDistanceKm: 3560820,
      orbitalPeriodDays: 79.321,
      inclinationDeg: 15.47,
      orbitRadiusMult: 5.15,
      radius3D: 0.16,
      colorHex: '#f8fafc',
      secondaryColorHex: '#292524',
      descriptionPt: 'Contraste bicolor Yin-Yang (um hemisfério negro e outro branco de gelo) e crista equatorial',
    },
  ],
  uranus: [
    {
      id: 'miranda',
      namePt: 'Miranda',
      realDiameterKm: 471.6,
      realDistanceKm: 129390,
      orbitalPeriodDays: 1.413,
      inclinationDeg: 4.23,
      orbitRadiusMult: 1.95,
      radius3D: 0.10,
      colorHex: '#cbd5e1',
      secondaryColorHex: '#64748b',
      descriptionPt: 'Verona Rupes (maior penhasco do Sistema Solar com 20 km de altura)',
    },
    {
      id: 'ariel',
      namePt: 'Ariel',
      realDiameterKm: 1157.8,
      realDistanceKm: 191020,
      orbitalPeriodDays: 2.520,
      inclinationDeg: 0.26,
      orbitRadiusMult: 2.35,
      radius3D: 0.14,
      colorHex: '#e2e8f0',
      secondaryColorHex: '#94a3b8',
      descriptionPt: 'Mais brilhante das luas de Urano, cortada por cânions tectônicos',
    },
    {
      id: 'umbriel',
      namePt: 'Umbriel',
      realDiameterKm: 1169.4,
      realDistanceKm: 266000,
      orbitalPeriodDays: 4.144,
      inclinationDeg: 0.13,
      orbitRadiusMult: 2.75,
      radius3D: 0.14,
      colorHex: '#64748b',
      secondaryColorHex: '#334155',
      descriptionPt: 'Lua escura com o misterioso anel brilhante da cratera Wunda',
    },
    {
      id: 'titania',
      namePt: 'Titânia',
      realDiameterKm: 1576.8,
      realDistanceKm: 435910,
      orbitalPeriodDays: 8.706,
      inclinationDeg: 0.34,
      orbitRadiusMult: 3.22,
      radius3D: 0.18,
      colorHex: '#cbd5e1',
      secondaryColorHex: '#64748b',
      descriptionPt: 'Maior lua de Urano • Grandes falhas geológicas (Messina Chasmata)',
    },
    {
      id: 'oberon',
      namePt: 'Oberon',
      realDiameterKm: 1522.8,
      realDistanceKm: 583520,
      orbitalPeriodDays: 13.463,
      inclinationDeg: 0.06,
      orbitRadiusMult: 3.72,
      radius3D: 0.17,
      colorHex: '#94a3b8',
      secondaryColorHex: '#475569',
      descriptionPt: 'Lua externa antiga com montanha de 11 km de altura',
    },
  ],
  neptune: [
    {
      id: 'proteus',
      namePt: 'Proteu',
      realDiameterKm: 420.0,
      realDistanceKm: 117647,
      orbitalPeriodDays: 1.122,
      inclinationDeg: 0.52,
      orbitRadiusMult: 1.95,
      radius3D: 0.11,
      colorHex: '#64748b',
      secondaryColorHex: '#334155',
      descriptionPt: '2ª maior lua de Netuno • Corpo irregular escuro com a grande cratera Pharos',
    },
    {
      id: 'triton',
      namePt: 'Tritão',
      realDiameterKm: 2706.8,
      realDistanceKm: 354759,
      orbitalPeriodDays: -5.877, // Órbita retrógrada real!
      inclinationDeg: 23.0,
      orbitRadiusMult: 2.75,
      radius3D: GLOBE_RADIUS * (2706.8 / EARTH_DIAMETER_KM), // 0.212x Terra
      colorHex: '#fbcfe8',
      secondaryColorHex: '#93c5fd',
      descriptionPt: 'Maior lua em órbita RETRÓGRADA • Gêiseres de nitrogênio e terreno cantalupo',
    },
  ],
};

export const SOLAR_SYSTEM_PLANETS: PlanetOrbitalSpec[] = [
  {
    id: 'mercury',
    namePt: 'Mercúrio',
    orbitRadius: Number((0.3871 * AU_TO_UNITS).toFixed(1)), // 100.6 un (0,3871 UA)
    radius3D: GLOBE_RADIUS * (4879.4 / EARTH_DIAMETER_KM), // 0.3829x Terra
    earthSizeRatio: Number((4879.4 / EARTH_DIAMETER_KM).toFixed(3)),
    orbitalPeriodDays: 87.969,
    rotationPeriodHours: 1407.6,
    orbitalInclinationDeg: 7.0,
    axialTiltDeg: 0.03,
    initialMeanLongitudeDeg: 252.25,
    distanceAU: 0.387,
    distanceMillionKm: 57.91,
    realDiameterKm: 4879,
    apparentAngleFromEarth: '0,001° a 0,003° (Estrela pontual)',
    colorHex: '#cbd5e1',
  },
  {
    id: 'venus',
    namePt: 'Vênus',
    orbitRadius: Number((0.7233 * AU_TO_UNITS).toFixed(1)), // 188.1 un (0,7233 UA)
    radius3D: GLOBE_RADIUS * (12103.6 / EARTH_DIAMETER_KM), // 0.9499x Terra (quase gêmeo da Terra)
    earthSizeRatio: Number((12103.6 / EARTH_DIAMETER_KM).toFixed(3)),
    orbitalPeriodDays: 224.701,
    rotationPeriodHours: -5832.5, // Rotação retrógrada (Leste -> Oeste)
    orbitalInclinationDeg: 3.39,
    axialTiltDeg: 177.36,
    initialMeanLongitudeDeg: 181.98,
    distanceAU: 0.723,
    distanceMillionKm: 108.21,
    realDiameterKm: 12104,
    apparentAngleFromEarth: '0,003° a 0,018° (Estrela d’Alva)',
    colorHex: '#fde68a',
  },
  {
    id: 'earth',
    namePt: 'Terra',
    orbitRadius: EARTH_ORBIT_RADIUS, // 260.0 un (1,0000 UA)
    radius3D: GLOBE_RADIUS, // 1.0000x Terra
    earthSizeRatio: 1.0,
    orbitalPeriodDays: 365.256,
    rotationPeriodHours: 24.0,
    orbitalInclinationDeg: 0.0,
    axialTiltDeg: 23.44,
    initialMeanLongitudeDeg: 100.46,
    distanceAU: 1.0,
    distanceMillionKm: 149.6,
    realDiameterKm: 12742,
    apparentAngleFromEarth: '1,00x (Referência Base)',
    colorHex: '#38bdf8',
  },
  {
    id: 'mars',
    namePt: 'Marte',
    orbitRadius: Number((1.5237 * AU_TO_UNITS).toFixed(1)), // 396.2 un (1,5237 UA)
    radius3D: GLOBE_RADIUS * (6779.0 / EARTH_DIAMETER_KM), // 0.5320x Terra
    earthSizeRatio: Number((6779.0 / EARTH_DIAMETER_KM).toFixed(3)),
    orbitalPeriodDays: 686.98,
    rotationPeriodHours: 24.62,
    orbitalInclinationDeg: 1.85,
    axialTiltDeg: 25.19,
    initialMeanLongitudeDeg: 355.45,
    distanceAU: 1.524,
    distanceMillionKm: 227.94,
    realDiameterKm: 6779,
    apparentAngleFromEarth: '0,001° a 0,007° (Ponto avermelhado)',
    colorHex: '#f97316',
  },
  {
    id: 'jupiter',
    namePt: 'Júpiter',
    orbitRadius: 780.0, // 5,204 UA (778,5 milhões km)
    radius3D: GLOBE_RADIUS * (139820.0 / EARTH_DIAMETER_KM), // 10.973x Terra!
    earthSizeRatio: Number((139820.0 / EARTH_DIAMETER_KM).toFixed(2)),
    orbitalPeriodDays: 4332.59,
    rotationPeriodHours: 9.93,
    orbitalInclinationDeg: 1.31,
    axialTiltDeg: 3.13,
    initialMeanLongitudeDeg: 34.4,
    distanceAU: 5.204,
    distanceMillionKm: 778.48,
    realDiameterKm: 139820,
    apparentAngleFromEarth: '0,008° a 0,014° (10,97x maior que a Terra)',
    colorHex: '#fdba74',
  },
  {
    id: 'saturn',
    namePt: 'Saturno',
    orbitRadius: 1180.0, // 9,582 UA (1,433 bilhão km)
    radius3D: GLOBE_RADIUS * (116460.0 / EARTH_DIAMETER_KM), // 9.140x Terra!
    earthSizeRatio: Number((116460.0 / EARTH_DIAMETER_KM).toFixed(2)),
    orbitalPeriodDays: 10759.22,
    rotationPeriodHours: 10.7,
    orbitalInclinationDeg: 2.49,
    axialTiltDeg: 26.73,
    initialMeanLongitudeDeg: 49.94,
    distanceAU: 9.582,
    distanceMillionKm: 1433.53,
    realDiameterKm: 116460,
    apparentAngleFromEarth: '0,004° a 0,006° (9,14x maior que a Terra)',
    colorHex: '#fde047',
  },
  {
    id: 'uranus',
    namePt: 'Urano',
    orbitRadius: 1650.0, // 19,218 UA (2,871 bilhões km)
    radius3D: GLOBE_RADIUS * (50724.0 / EARTH_DIAMETER_KM), // 3.981x Terra!
    earthSizeRatio: Number((50724.0 / EARTH_DIAMETER_KM).toFixed(2)),
    orbitalPeriodDays: 30685.4,
    rotationPeriodHours: -17.24,
    orbitalInclinationDeg: 0.77,
    axialTiltDeg: 97.77,
    initialMeanLongitudeDeg: 313.23,
    distanceAU: 19.218,
    distanceMillionKm: 2870.97,
    realDiameterKm: 50724,
    apparentAngleFromEarth: '0,001° (3,98x maior que a Terra)',
    colorHex: '#67e8f9',
  },
  {
    id: 'neptune',
    namePt: 'Netuno',
    orbitRadius: 2120.0, // 30,110 UA (4,503 bilhões km)
    radius3D: GLOBE_RADIUS * (49244.0 / EARTH_DIAMETER_KM), // 3.865x Terra!
    earthSizeRatio: Number((49244.0 / EARTH_DIAMETER_KM).toFixed(2)),
    orbitalPeriodDays: 60189.0,
    rotationPeriodHours: 16.11,
    orbitalInclinationDeg: 1.77,
    axialTiltDeg: 28.32,
    initialMeanLongitudeDeg: 304.88,
    distanceAU: 30.11,
    distanceMillionKm: 4503.44,
    realDiameterKm: 49244,
    apparentAngleFromEarth: '0,0006° (3,86x maior que a Terra)',
    colorHex: '#60a5fa',
  },
];

const STELLAR_COLORS = [
  new THREE.Color('#ffffff'),
  new THREE.Color('#ffffff'),
  new THREE.Color('#f0f9ff'),
  new THREE.Color('#e0f2fe'),
  new THREE.Color('#fef08a'),
  new THREE.Color('#fed7aa'),
  new THREE.Color('#bae6fd'),
];

export function latLngToSphereVector(latDeg: number, lngDeg: number, radius: number = GLOBE_RADIUS): THREE.Vector3 {
  const latRad = (latDeg * Math.PI) / 180;
  const lngRad = (lngDeg * Math.PI) / 180;
  const cosLat = Math.cos(latRad);
  const x = radius * cosLat * Math.sin(lngRad);
  const y = radius * Math.sin(latRad);
  const z = radius * cosLat * Math.cos(lngRad);
  return new THREE.Vector3(x, y, z);
}

export function sphereVectorToLatLng(localVec: THREE.Vector3): { lat: number; lng: number } {
  const r = localVec.length() || 1;
  const ny = THREE.MathUtils.clamp(localVec.y / r, -1.0, 1.0);
  const lat = (Math.asin(ny) * 180) / Math.PI;
  const lng = (Math.atan2(localVec.x, localVec.z) * 180) / Math.PI;
  return {
    lat: Number(lat.toFixed(4)),
    lng: Number(lng.toFixed(4)),
  };
}

function createMoonSurfaceTexture(moonSpec: PlanetaryMoonSpec): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = moonSpec.colorHex;
  ctx.fillRect(0, 0, 256, 128);

  if (moonSpec.id === 'io') {
    // Volcanic sulfur yellow-orange mottling & Loki Patera lava calderas
    for (let i = 0; i < 65; i++) {
      const x = (i * 41) % 256;
      const y = (i * 29) % 128;
      const r = 6 + (i % 14);
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, i % 4 === 0 ? '#7c2d12' : '#ea580c');
      grad.addColorStop(0.5, '#facc15');
      grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (moonSpec.id === 'europa') {
    // Icy white shell crisscrossed by reddish-brown mineral lineae cracks
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.55)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 28; i++) {
      ctx.beginPath();
      ctx.moveTo((i * 23) % 256, (i * 17) % 128);
      ctx.bezierCurveTo(
        (i * 53) % 256,
        (i * 41) % 128,
        (i * 89) % 256,
        (i * 67) % 128,
        (i * 113) % 256,
        (i * 97) % 128
      );
      ctx.stroke();
    }
  } else if (moonSpec.id === 'titan') {
    // Dense golden-orange nitrogen/methane haze with subtle polar hood
    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, '#b45309');
    grad.addColorStop(0.25, '#f59e0b');
    grad.addColorStop(0.5, '#fbbf24');
    grad.addColorStop(0.75, '#f59e0b');
    grad.addColorStop(1, '#d97706');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 128);
  } else if (moonSpec.id === 'iapetus') {
    // Famous Yin-Yang two-tone hemisphere (Cassini Regio dark leading side vs Roncevaux bright ice)
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.ellipse(90, 64, 68, 52, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Natural craters & regolith mottled patches
    for (let i = 0; i < 48; i++) {
      const x = (i * 37) % 256;
      const y = (i * 23) % 128;
      const r = 2 + (i % 8);
      ctx.fillStyle = i % 2 === 0 ? moonSpec.secondaryColorHex : 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

function createPlanetSurfaceTexture(planetId: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  if (planetId === 'mercury') {
    ctx.fillStyle = '#78716c';
    ctx.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 450; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const r = 1.5 + Math.random() * 14;
      const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
      g.addColorStop(0, '#57534e');
      g.addColorStop(0.75, '#a8a29e');
      g.addColorStop(1, 'rgba(120,113,108,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (planetId === 'venus') {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#d97706');
    grad.addColorStop(0.25, '#fbbf24');
    grad.addColorStop(0.5, '#fde68a');
    grad.addColorStop(0.75, '#f59e0b');
    grad.addColorStop(1, '#b45309');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);
    for (let y = 0; y < 256; y += 3) {
      ctx.fillStyle = `rgba(255, 251, 235, ${0.06 + 0.08 * Math.sin(y * 0.12)})`;
      ctx.fillRect(0, y, 512, 2);
    }
  } else if (planetId === 'mars') {
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * 512;
      const y = 25 + Math.random() * 206;
      const r = 6 + Math.random() * 35;
      ctx.fillStyle = Math.random() > 0.45 ? 'rgba(124, 45, 18, 0.35)' : 'rgba(251, 146, 60, 0.28)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 14);
    ctx.fillRect(0, 242, 512, 14);
  } else if (planetId === 'jupiter') {
    const bands = [
      '#78350f', '#d97706', '#fef3c7', '#b45309', '#fde68a',
      '#9a3412', '#fffbeb', '#c2410c', '#fcd34d', '#78350f',
    ];
    const bh = 256 / bands.length;
    bands.forEach((col, idx) => {
      ctx.fillStyle = col;
      ctx.fillRect(0, idx * bh, 512, bh + 2);
    });
    const grs = ctx.createRadialGradient(310, 168, 4, 310, 168, 28);
    grs.addColorStop(0, '#ef4444');
    grs.addColorStop(0.6, '#b91c1c');
    grs.addColorStop(1, 'rgba(185, 28, 28, 0)');
    ctx.fillStyle = grs;
    ctx.beginPath();
    ctx.ellipse(310, 168, 32, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (planetId === 'saturn') {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#a16207');
    grad.addColorStop(0.2, '#eab308');
    grad.addColorStop(0.4, '#fef08a');
    grad.addColorStop(0.5, '#ca8a04');
    grad.addColorStop(0.65, '#fef9c3');
    grad.addColorStop(0.85, '#eab308');
    grad.addColorStop(1, '#854d0e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);
  } else if (planetId === 'uranus') {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#0891b2');
    grad.addColorStop(0.5, '#67e8f9');
    grad.addColorStop(1, '#0e7490');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#1e3a8a');
    grad.addColorStop(0.35, '#2563eb');
    grad.addColorStop(0.65, '#3b82f6');
    grad.addColorStop(1, '#172554');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function createPlanetLabelSprite(text: string, colorHex: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 280;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(8, 8, 264, 48, 24);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 22px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 140, 33);

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    sizeAttenuation: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.11, 0.025, 1);
  return sprite;
}

function createSpaceSphericalStarVault(radius: number = 3800.0) {
  const group = new THREE.Group();
  group.name = 'SpaceSphericalStarVault';

  const domeGeo = new THREE.SphereGeometry(radius + 80.0, 48, 32);
  const domeMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uVoidBlack: { value: new THREE.Color(0x010206) },
      uMidnightBlue: { value: new THREE.Color(0x040d24) },
      uDeepNavyColor: { value: new THREE.Color(0x07193e) },
    },
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uVoidBlack;
      uniform vec3 uMidnightBlue;
      uniform vec3 uDeepNavyColor;
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        float band = exp(-pow(d.y * 2.2, 2.0));
        vec3 col = mix(uVoidBlack, uMidnightBlue, band * 0.65);
        col = mix(col, uDeepNavyColor, band * 0.25);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  group.add(new THREE.Mesh(domeGeo, domeMat));

  const starCount = 2400;
  const baseSphereGeo = new THREE.SphereGeometry(1.8, 8, 8);
  const starSphereMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xffffff),
    toneMapped: false,
  });

  const instancedStars = new THREE.InstancedMesh(baseSphereGeo, starSphereMat, starCount);
  const sparklePositions = new Float32Array(starCount * 3);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < starCount; i++) {
    let decRad: number;
    let raRad: number;

    const isGalacticBand = Math.random() < 0.28;
    if (isGalacticBand) {
      const gLon = Math.random() * 2 * Math.PI;
      const gLat = (Math.random() + Math.random() - 1.0) * 0.22;
      const inc = (62.9 * Math.PI) / 180;
      const node = (282.25 * Math.PI) / 180;
      const sinDec = Math.cos(gLat) * Math.sin(inc) * Math.sin(gLon) + Math.sin(gLat) * Math.cos(inc);
      decRad = Math.asin(Math.max(-0.999, Math.min(0.999, sinDec)));
      const yRA = Math.cos(gLat) * Math.cos(inc) * Math.sin(gLon) - Math.sin(gLat) * Math.sin(inc);
      const xRA = Math.cos(gLat) * Math.cos(gLon);
      raRad = (Math.atan2(yRA, xRA) + node) % (2 * Math.PI);
      if (raRad < 0) raRad += 2 * Math.PI;
    } else {
      const u = Math.random() * 2.0 - 1.0;
      decRad = Math.asin(u);
      raRad = Math.random() * 2 * Math.PI;
    }

    const y = radius * Math.sin(decRad);
    const rHoriz = radius * Math.cos(decRad);
    const x = rHoriz * Math.cos(raRad);
    const z = rHoriz * Math.sin(raRad);

    const isBright = Math.random() < 0.1;
    const scaleMult = isBright ? 1.35 + Math.random() * 0.35 : 0.7 + Math.random() * 0.35;

    dummy.position.set(x, y, z);
    dummy.scale.set(scaleMult, scaleMult, scaleMult);
    dummy.updateMatrix();

    instancedStars.setMatrixAt(i, dummy.matrix);
    instancedStars.setColorAt(i, STELLAR_COLORS[i % STELLAR_COLORS.length]);

    sparklePositions[i * 3] = x;
    sparklePositions[i * 3 + 1] = y;
    sparklePositions[i * 3 + 2] = z;
  }

  instancedStars.instanceMatrix.needsUpdate = true;
  if (instancedStars.instanceColor) {
    instancedStars.instanceColor.needsUpdate = true;
  }
  group.add(instancedStars);

  const sparkleGeo = new THREE.BufferGeometry();
  sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));

  const sparkleTex = generateStarSparkleTexture('#ffffff');
  const sparkleMat = new THREE.PointsMaterial({
    size: 22.0,
    map: sparkleTex,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
    opacity: 0.9,
  });

  const sparklePoints = new THREE.Points(sparkleGeo, sparkleMat);
  group.add(sparklePoints);

  return { group, sparkleMat };
}

export const GlobeCanvas: React.FC<GlobeCanvasProps> = ({ globeConfig }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeConfigRef = useRef<GlobeViewConfig>(globeConfig);
  globeConfigRef.current = globeConfig;

  const lastPresetRef = useRef<string>(globeConfig.globeCameraPreset);
  const lastFocusedBodyRef = useRef<string>(globeConfig.focusedBody);

  // Starts showing the Inner & Middle Solar System with true AU spacing (Earth at 260 units from Sun!)
  const isMobileInit = typeof window !== 'undefined' && window.innerWidth < 768;
  const orbitAnglesRef = useRef({
    theta: 0.58,
    phi: 1.06,
    distance: isMobileInit ? 680.0 : 540.0,
  });

  const humanLookRef = useRef({
    azimuth: Math.PI * 0.5,
    pitch: 0.14,
    fov: getDefaultHumanFov(isMobileInit),
    eyeHeight: 0.04,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010206);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.005, 18000);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. 360° Twinkling Starry Sky Vault
    const spaceStarVault = createSpaceSphericalStarVault(8500.0);
    scene.add(spaceStarVault.group);

    // 2B. Human Observer Celestial Sphere + 3D Ground Environment on the Spherical Earth
    const humanCelestialSphere = new CelestialSphere3D();
    scene.add(humanCelestialSphere.group);

    const humanObserverEnv = new ObserverEnvironment3D();
    humanObserverEnv.setVisible(false);
    scene.add(humanObserverEnv.group);

    // =========================================================================
    // 3. CENTRAL 3D SUN AT (0, 0, 0) — PROPORTIONAL & COMPACT SO IT NEVER SWALLOWS PLANETS
    // =========================================================================
    const sunGroup = new THREE.Group();
    sunGroup.position.set(0, 0, 0);
    scene.add(sunGroup);

    const sunRadius = 7.5; // Tamanho ideal e proporcional (harmônico com o sistema solar, sem ofuscar as órbitas)
    const sunSphereGeo = new THREE.SphereGeometry(sunRadius, 64, 64);
    const sunTex = generateSunTexture();
    // 1. Fotosfera Solar com Efeito Dinâmico de Fogo e Plasma Convectivo (Simplex Noise 3D com Warping)
    const sunPhotosphereMat = new THREE.ShaderMaterial({
      transparent: false,
      depthWrite: true,
      toneMapped: false,
      uniforms: {
        uBaseTexture: { value: sunTex },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main() {
          vUv = uv;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPosition = wp.xyz;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform sampler2D uBaseTexture;
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        // Ruído Simplex 3D procedural de alta performance para fluxo de plasma e fogo solar
        vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
          i = mod(i, 289.0);
          vec4 p = permute(permute(permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3  ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        float fireFbm(vec3 p) {
          float f = 0.0;
          float amp = 0.5;
          float freq = 1.0;
          for (int i = 0; i < 4; i++) {
            f += amp * snoise(p * freq);
            freq *= 2.08;
            amp *= 0.50;
          }
          return f;
        }

        void main() {
          vec3 N = normalize(vWorldNormal);
          vec3 V = normalize(cameraPosition - vWorldPosition);
          float mu = clamp(dot(N, V), 0.0, 1.0);

          // Turbulência de fogo e plasma 3D com deformação de domínio (convecção viva)
          vec3 pos = N * 3.4;
          float t = uTime * 0.35;
          vec3 q = vec3(
            fireFbm(pos + vec3(0.0, t * 0.7, 0.0)),
            fireFbm(pos + vec3(4.3, -t * 0.5, 2.1)),
            fireFbm(pos + vec3(1.7, t * 0.4, 5.8))
          );
          vec3 r = vec3(
            fireFbm(pos + 2.5 * q + vec3(1.2, t * 0.6, 0.5)),
            fireFbm(pos + 2.5 * q + vec3(6.3, -t * 0.7, 3.2)),
            fireFbm(pos + 2.5 * q + vec3(2.8, t * 0.5, 7.1))
          );
          float firePlasma = fireFbm(pos + 3.0 * r);
          float normFire = clamp(firePlasma * 0.5 + 0.5, 0.0, 1.0);

          // Paleta cromática autêntica de fogo solar nuclear:
          vec3 cWhite    = vec3(1.0, 1.0, 0.98); // Núcleo incandescente branco (>15.000.000 K)
          vec3 cGold     = vec3(1.0, 0.88, 0.20); // Plasma termonuclear dourado vivo
          vec3 cOrange   = vec3(1.0, 0.45, 0.02); // Fogo e labaredas solares alaranjadas
          vec3 cCrimson  = vec3(0.85, 0.12, 0.01); // Filamentos de plasma e cromosfera rubra
          vec3 cDarkFire = vec3(0.42, 0.05, 0.01); // Manchas solares e nós magnéticos

          vec3 fireCol;
          if (normFire < 0.25) {
            fireCol = mix(cDarkFire, cCrimson, normFire / 0.25);
          } else if (normFire < 0.55) {
            fireCol = mix(cCrimson, cOrange, (normFire - 0.25) / 0.30);
          } else if (normFire < 0.80) {
            fireCol = mix(cOrange, cGold, (normFire - 0.55) / 0.25);
          } else {
            fireCol = mix(cGold, cWhite, (normFire - 0.80) / 0.20);
          }

          // Profundidade óptica natural: olhando de frente vemos as camadas incandescentes brancas-douradas;
          // no bordo apreciamos o fogo em erupção e plasma vivo. ZERO borda preta!
          vec3 sunCol = mix(fireCol, cGold, pow(mu, 0.65) * 0.4);
          sunCol = mix(sunCol, cWhite, pow(mu, 1.5) * 0.7);

          // Erupções brilhantes de plasma
          float flareSpot = pow(normFire, 3.5) * 0.6;
          sunCol += flareSpot * cWhite;

          // 100% Opaco, luminoso e sem contornos escuros
          gl_FragColor = vec4(sunCol, 1.0);
        }
      `,
    });
    const sunMesh = new THREE.Mesh(sunSphereGeo, sunPhotosphereMat);
    sunMesh.renderOrder = 1;
    sunGroup.add(sunMesh);

    // 2. Proeminências Solares e Labaredas de Fogo no Bordo (Additive Blending para arcos magnéticos que saltam no espaço)
    const sunProminencesGeo = new THREE.SphereGeometry(sunRadius * 1.042, 64, 48);
    const sunProminencesMat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      toneMapped: false,
      uniforms: {
        uTime: { value: 0 },
      },
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
        uniform float uTime;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
          i = mod(i, 289.0);
          vec4 p = permute(permute(permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3  ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          vec3 N = normalize(vWorldNormal);
          vec3 V = normalize(cameraPosition - vWorldPosition);
          float rim = 1.0 - abs(dot(N, V)); // Proeminências destacadas no bordo da esfera

          vec3 pos = N * 7.0;
          float t = uTime * 0.65;
          float f1 = snoise(pos + vec3(0.0, t * 1.1, 0.0));
          float f2 = snoise(pos * 2.2 + vec3(t * 0.7, -t * 0.9, t * 0.5));
          float flameNoise = (f1 * 0.62 + f2 * 0.38) * 0.5 + 0.5;

          // Erupções de labaredas e arcos magnéticos de plasma que lambem o espaço
          float flareMask = pow(flameNoise, 2.2);
          float prominenceIntensity = pow(rim, 1.5) * flareMask * 3.5;

          vec3 flameCol = mix(
            vec3(1.0, 0.20, 0.01), // Base de fogo rubro
            vec3(1.0, 0.88, 0.18), // Pontas douradas incandescentes
            flareMask
          );

          float alpha = clamp(prominenceIntensity, 0.0, 1.0);
          gl_FragColor = vec4(flameCol * prominenceIntensity * 1.6, alpha);
        }
      `,
    });
    const sunProminencesMesh = new THREE.Mesh(sunProminencesGeo, sunProminencesMat);
    sunProminencesMesh.renderOrder = 2;
    sunGroup.add(sunProminencesMesh);

    // 3. Coroa Solar e Vento Ardente 3D (Luz pura em Additive Blending com raios e ondulações solares)
    const sunCoronaHaloGeo = new THREE.SphereGeometry(sunRadius * 1.15, 64, 48);
    const sunCoronaHaloMat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      side: THREE.BackSide,
      toneMapped: false,
      uniforms: {
        uTime: { value: 0 },
      },
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
        uniform float uTime;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main() {
          vec3 N = normalize(vWorldNormal);
          vec3 V = normalize(cameraPosition - vWorldPosition);
          float rim = 1.0 - abs(dot(N, V));

          // Feixes e ondas de vento solar ardente que ondulam no espaço
          float angle = atan(vWorldNormal.y, vWorldNormal.x);
          float streamers = sin(angle * 14.0 + uTime * 0.5) * cos(angle * 7.0 - uTime * 0.4);
          float rayFactor = (streamers * 0.5 + 0.5);

          float halo = pow(rim, 1.8) * (0.8 + 0.35 * rayFactor);
          vec3 coronaCol = mix(vec3(1.0, 0.36, 0.03), vec3(1.0, 0.88, 0.25), rim);
          gl_FragColor = vec4(coronaCol * halo * 1.7, halo);
        }
      `,
    });
    const sunCoronaHaloMesh = new THREE.Mesh(sunCoronaHaloGeo, sunCoronaHaloMat);
    sunCoronaHaloMesh.renderOrder = 3;
    sunGroup.add(sunCoronaHaloMesh);

    const sunSparkleSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: generateSunSparkleTexture(),
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.98,
        depthWrite: false,
        depthTest: false,
        toneMapped: false,
      })
    );
    sunSparkleSprite.renderOrder = 10;
    sunSparkleSprite.scale.set(24.0, 24.0, 1);
    sunGroup.add(sunSparkleSprite);

    // 3B. Pure 3D Volumetric Spherical Golden-Yellow Solar Irradiance Field (0 -> 2350 units / Neptune)
    // ZERO 2D flat disc — 100% 3D concentric spherical shells so it NEVER cuts the Earth or Moon in half!
    const solarReachRadius = 2350.0;
    const occluderPositions = Array.from({ length: 9 }, () => new THREE.Vector3(99999, 0, 99999));
    const occluderRadii = [
      GLOBE_RADIUS * (4879.4 / EARTH_DIAMETER_KM),  // 0: Mercury
      GLOBE_RADIUS * (12103.6 / EARTH_DIAMETER_KM), // 1: Venus
      GLOBE_RADIUS,                                 // 2: Earth
      GLOBE_RADIUS * (3474.8 / EARTH_DIAMETER_KM),  // 3: Moon
      GLOBE_RADIUS * (6779.0 / EARTH_DIAMETER_KM),  // 4: Mars
      GLOBE_RADIUS * (139820.0 / EARTH_DIAMETER_KM),// 5: Jupiter
      GLOBE_RADIUS * (116460.0 / EARTH_DIAMETER_KM),// 6: Saturn
      GLOBE_RADIUS * (50724.0 / EARTH_DIAMETER_KM), // 7: Uranus
      GLOBE_RADIUS * (49244.0 / EARTH_DIAMETER_KM), // 8: Neptune
    ];

    const solar3DVolumeGroup = new THREE.Group();
    sunGroup.add(solar3DVolumeGroup);
    const volumeRadii = [34, 60, 102, 165, 255, 385, 580, 860, 1250, 1720, 2250];
    const volumeAlphas = [0.24, 0.19, 0.15, 0.12, 0.095, 0.072, 0.054, 0.038, 0.026, 0.017, 0.010];
    const solarVolumeMats: THREE.ShaderMaterial[] = [];

    volumeRadii.forEach((rVol, idx) => {
      const volGeo = new THREE.SphereGeometry(rVol, 64, 48);
      const normR = rVol / solarReachRadius;
      const volMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        toneMapped: false,
        uniforms: {
          uBaseAlpha: { value: volumeAlphas[idx] },
          uNormR: { value: normR },
          uIntensity: { value: 1.0 },
          uOccluderPos: { value: occluderPositions },
          uOccluderRad: { value: occluderRadii },
        },
        vertexShader: `
          varying vec3 vViewNormal;
          varying vec3 vWorldPos;
          void main() {
            vViewNormal = normalize(normalMatrix * normal);
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorldPos = wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: `
          uniform float uBaseAlpha;
          uniform float uNormR;
          uniform float uIntensity;
          uniform vec3 uOccluderPos[9];
          uniform float uOccluderRad[9];
          varying vec3 vViewNormal;
          varying vec3 vWorldPos;
          void main() {
            float dist = length(vWorldPos);
            vec3 rayDir = vWorldPos / max(dist, 0.0001);

            // 1. Radial 3D Shadow Wake behind planets on the spherical shell
            float shadowFactor = 1.0;
            // 2. Uniform Full-Screen Eclipse Darkening when the Camera itself is behind a planet (inside its shadow cone!)
            float cameraInShadowDarkening = 1.0;

            for (int i = 0; i < 9; i++) {
              vec3 bodyPos = uOccluderPos[i];
              float bodyRad = uOccluderRad[i];
              float proj = dot(bodyPos, rayDir);
              if (proj > 0.0 && dist > proj) {
                vec3 closestPt = rayDir * proj;
                float perpDist = length(bodyPos - closestPt);
                float wakeLength = 2400.0;
                float distBehind = dist - proj;
                if (distBehind < wakeLength) {
                  float wakeFade = 1.0 - clamp(distBehind / wakeLength, 0.0, 1.0);
                  float inUmbra = 1.0 - smoothstep(bodyRad * 0.85, bodyRad * 1.45, perpDist);
                  shadowFactor *= (1.0 - inUmbra * wakeFade * 0.96);
                }
              }

              // Check if the camera is positioned behind this planet (in its anti-solar shadow wake):
              // Instead of cutting the screen diagonally, darken the entire solar glare uniformly across the whole screen!
              float dBody = length(bodyPos);
              if (dBody > 1.0) {
                vec3 shadowAxis = bodyPos / dBody;
                vec3 camOffset = cameraPosition - bodyPos;
                float camAlongAxis = dot(camOffset, shadowAxis);
                if (camAlongAxis > 0.0 && camAlongAxis < 320.0) {
                  float camPerpDist = length(camOffset - shadowAxis * camAlongAxis);
                  float umbraRadiusAtCam = bodyRad * (1.15 + camAlongAxis * 0.015);
                  float camInCone = 1.0 - smoothstep(umbraRadiusAtCam * 0.55, umbraRadiusAtCam * 1.85, camPerpDist);
                  float distFade = 1.0 - clamp(camAlongAxis / 320.0, 0.0, 1.0);
                  cameraInShadowDarkening *= (1.0 - camInCone * distFade * 0.82);
                }
              }
            }

            // Soft 3D spherical volume falloff towards the edges of each shell
            float mu = abs(vViewNormal.z);
            float softSphere = pow(mu, 1.75);
            vec3 nearCol = vec3(1.0, 0.90, 0.38);
            vec3 farCol = vec3(0.95, 0.66, 0.18);
            vec3 col = mix(nearCol, farCol, clamp(uNormR * 1.35, 0.0, 1.0));
            float alpha = uBaseAlpha * softSphere * uIntensity * shadowFactor * cameraInShadowDarkening;
            if (alpha < 0.001) discard;
            gl_FragColor = vec4(col, alpha);
          }
        `,
      });
      solarVolumeMats.push(volMat);
      const volMesh = new THREE.Mesh(volGeo, volMat);
      volMesh.renderOrder = 2;
      solar3DVolumeGroup.add(volMesh);
    });

    // Helper to create a 3D Cylindrical/Conical Umbra Shadow projected behind any planet/Moon away from the Sun
    // Uses FrontSide + smooth grazing-angle fade so it NEVER slices the screen in half when the camera enters the shadow behind a planet!
    const createBodyShadowCone = (bodyRadius: number, shadowLength: number) => {
      const sGeo = new THREE.CylinderGeometry(bodyRadius * 0.18, bodyRadius * 0.99, shadowLength, 64, 1, true);
      sGeo.rotateX(Math.PI / 2);
      sGeo.translate(0, 0, shadowLength * 0.5);
      const sMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.FrontSide,
        uniforms: {
          uLength: { value: shadowLength },
          uEnabled: { value: 1.0 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vViewNormal;
          void main() {
            vUv = uv;
            vViewNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uEnabled;
          varying vec2 vUv;
          varying vec3 vViewNormal;
          void main() {
            // vUv.y = 0.0 at the planet's dark hemisphere, vUv.y = 1.0 at the far shadow tip!
            float distFromPlanet = vUv.y;
            float fadeAlong = pow(clamp(1.0 - distFromPlanet, 0.0, 1.0), 1.35) * (1.0 - smoothstep(0.82, 1.0, distFromPlanet));
            // Smoothly fade out cylinder walls at grazing/head-on angles (vViewNormal.z -> 0) so there is ZERO hard diagonal line on screen!
            float edgeSoft = smoothstep(0.08, 0.55, vViewNormal.z);
            float alpha = 0.88 * fadeAlong * edgeSoft * uEnabled;
            if (alpha < 0.002) discard;
            gl_FragColor = vec4(0.0, 0.0, 0.012, alpha);
          }
        `,
      });
      const shadowMesh = new THREE.Mesh(sGeo, sMat);
      shadowMesh.renderOrder = 10;
      return { mesh: shadowMesh, mat: sMat };
    };

    const sunLabel = createPlanetLabelSprite('☀️ Sol (109,3x Terra)', '#facc15');
    sunLabel.position.set(0, sunRadius + 3.0, 0);
    sunGroup.add(sunLabel);

    const sunPointLight = new THREE.PointLight(0xfffbeb, 10.0, 4500, 0.35);
    sunGroup.add(sunPointLight);

    // =========================================================================
    // 5. EARTH HELIOCENTRIC ORBIT CARRIAGE (r = 260.0 = 1.000 AU = 149.6M km)
    // =========================================================================
    const earthSystemGroup = new THREE.Group();
    scene.add(earthSystemGroup);

    const earthTiltGroup = new THREE.Group();
    earthSystemGroup.add(earthTiltGroup);

    const earthSpinGroup = new THREE.Group();
    earthTiltGroup.add(earthSpinGroup);

    const earthGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 192, 192);
    const dayTex = generateFlatEarthTexture(false, undefined, false);
    const hypsometricTex = generateHypsometricPhysicalTexture(undefined, false);
    const elevationTex = generateElevationDisplacementMap();
    const nightLightsTex = generateNightCityLightsTexture();

    const earthUniforms: Record<string, THREE.IUniform> = {
      uDayTexture: { value: dayTex },
      uHypsometricTexture: { value: hypsometricTex },
      uElevationMap: { value: elevationTex },
      uNightLightsMap: { value: nightLightsTex },
      uSunWorldPosition: { value: new THREE.Vector3(0, 0, 0) },
      uMoonWorldPosition: { value: new THREE.Vector3(0, 0, 0) },
      uMoonRadius: { value: GLOBE_RADIUS * (3474.8 / EARTH_DIAMETER_KM) },
      uSunIntensity: { value: 2.15 },
      uSunLightEnabled: { value: 1.0 },
      uShowCityLights: { value: 1.0 },
      uMapColorMode: { value: 0.0 },
      uDisplacementScale: { value: 0.12 },
      uShowRealisticWater: { value: 1.0 },
      uShowClouds: { value: 1.0 },
      uFullDaylight: { value: 0.0 },
      uTime: { value: 0.0 },
      uOccluderPos: { value: occluderPositions },
      uOccluderRad: { value: occluderRadii },
    };

    const earthShaderMat = new THREE.ShaderMaterial({
      uniforms: earthUniforms,
      vertexShader: `
        uniform sampler2D uElevationMap;
        uniform float uDisplacementScale;

        varying vec3 vLocalNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        const float PI = 3.141592653589793;

        vec2 sphereDirToPlanarUV(vec3 dir) {
          vec3 n = normalize(dir);
          float latDeg = asin(clamp(n.y, -1.0, 1.0)) * 180.0 / PI;
          float lngDeg = atan(n.x, n.z) * 180.0 / PI;
          float normLat = (90.0 - latDeg) / 180.0;
          float angleRad = (90.0 - lngDeg) * PI / 180.0;
          float rUV = normLat * 0.375;
          return vec2(0.5 + rUV * cos(angleRad), 0.5 - rUV * sin(angleRad));
        }

        void main() {
          vec3 nLocal = normalize(position);
          vLocalNormal = nLocal;

          vec2 pUV = sphereDirToPlanarUV(nLocal);
          float elev = texture2D(uElevationMap, pUV).r;

          vec3 displacedPos = position + normal * (elev * uDisplacementScale);
          vec4 worldPos = modelMatrix * vec4(displacedPos, 1.0);
          vWorldPosition = worldPos.xyz;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);

          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D uDayTexture;
        uniform sampler2D uHypsometricTexture;
        uniform sampler2D uElevationMap;
        uniform sampler2D uNightLightsMap;
        uniform vec3 uSunWorldPosition;
        uniform vec3 uMoonWorldPosition;
        uniform float uMoonRadius;
        uniform float uSunIntensity;
        uniform float uSunLightEnabled;
        uniform float uShowCityLights;
        uniform float uMapColorMode;
        uniform float uShowRealisticWater;
        uniform float uShowClouds;
        uniform float uFullDaylight;
        uniform float uTime;
        uniform vec3 uOccluderPos[9];
        uniform float uOccluderRad[9];

        varying vec3 vLocalNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        const float PI = 3.141592653589793;

        // 3D Procedural Value Noise & FBM for Cloud Shadows on Earth Surface
        float hash31(vec3 p) {
          p = fract(p * 0.3183099 + 0.1);
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }

        float noise3D(vec3 x) {
          vec3 i = floor(x);
          vec3 f = fract(x);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(mix(hash31(i + vec3(0,0,0)), hash31(i + vec3(1,0,0)), f.x),
                mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
            mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
                mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y), f.z);
        }

        float fbmClouds(vec3 p) {
          float v = 0.0;
          float a = 0.52;
          for (int i = 0; i < 4; i++) {
            v += a * noise3D(p);
            p = p * 2.12 + vec3(1.7, 9.2, 3.4);
            a *= 0.48;
          }
          return v;
        }

        float computeGlobalCloudDensity(vec3 nSphere, float t) {
          float drift = t * 0.0025;
          mat3 rotY = mat3(
            cos(drift), 0.0, sin(drift),
            0.0, 1.0, 0.0,
            -sin(drift), 0.0, cos(drift)
          );
          vec3 p = rotY * nSphere;
          // Domain warping for authentic cyclone & trade-wind swirls
          vec3 q = vec3(
            fbmClouds(p * 3.2 + vec3(0.0, t * 0.0012, 0.0)),
            fbmClouds(p * 3.2 + vec3(5.2, 1.3, 2.8)),
            fbmClouds(p * 3.2 + vec3(1.7, 8.4, 4.1))
          );
          float base = fbmClouds(p * 4.5 + q * 1.45);
          // Climatic latitude belts: ITCZ equatorial belt + mid-latitude storm tracks
          float lat = asin(clamp(nSphere.y, -1.0, 1.0));
          float itcz = exp(-pow(lat / 0.16, 2.0)) * 0.16;
          float stormBelts = (exp(-pow((abs(lat) - 0.82) / 0.30, 2.0))) * 0.14;
          return smoothstep(0.46, 0.72, base + itcz + stormBelts);
        }

        vec2 sphereDirToPlanarUV(vec3 dir) {
          vec3 n = normalize(dir);
          float latDeg = asin(clamp(n.y, -1.0, 1.0)) * 180.0 / PI;
          float lngDeg = atan(n.x, n.z) * 180.0 / PI;
          float normLat = (90.0 - latDeg) / 180.0;
          float angleRad = (90.0 - lngDeg) * PI / 180.0;
          float rUV = normLat * 0.375;
          return vec2(0.5 + rUV * cos(angleRad), 0.5 - rUV * sin(angleRad));
        }

        void main() {
          vec3 nLocal = normalize(vLocalNormal);
          vec2 pUV = sphereDirToPlanarUV(nLocal);

          vec3 satColor = texture2D(uDayTexture, pUV).rgb;
          vec3 hypColor = texture2D(uHypsometricTexture, pUV).rgb;
          vec3 baseMapColor = mix(satColor, hypColor, uMapColorMode);

          float elev = texture2D(uElevationMap, pUV).r;
          float isOcean = 1.0 - smoothstep(0.01, 0.05, elev);

          // Deepen ocean bathymetry into authentic NASA Blue Marble sapphire-cobalt tones
          if (uMapColorMode < 0.5 && isOcean > 0.05) {
            vec3 deepOceanBlue = vec3(0.025, 0.14, 0.38);
            vec3 shallowTurquoise = vec3(0.05, 0.34, 0.62);
            float coastFactor = smoothstep(0.0, 0.018, elev);
            vec3 richOcean = mix(deepOceanBlue, shallowTurquoise, coastFactor * 0.55);
            baseMapColor = mix(baseMapColor, mix(baseMapColor, richOcean, 0.52), isOcean);
          }

          float latDeg = asin(clamp(nLocal.y, -1.0, 1.0)) * 180.0 / PI;
          if (latDeg < -72.0) {
            float iceFactor = smoothstep(-72.0, -82.0, latDeg);
            baseMapColor = mix(baseMapColor, vec3(0.91, 0.96, 1.0), iceFactor * 0.85);
          }

          vec3 N = normalize(vWorldNormal);
          vec3 L = normalize(uSunWorldPosition - vWorldPosition);
          vec3 V = normalize(cameraPosition - vWorldPosition);

          float ndotl = dot(N, L);

          // Check if the Moon or an inner planet (Mercury, Venus) is between the Sun and this point on Earth
          float distToSun = length(uSunWorldPosition - vWorldPosition);
          vec3 toMoon = uMoonWorldPosition - vWorldPosition;
          float projMoon = dot(toMoon, L);
          float moonShadowFactor = 1.0;
          if (projMoon > 0.0 && projMoon < distToSun) {
            vec3 closestMoonPt = vWorldPosition + L * projMoon;
            float perpDistToMoon = length(uMoonWorldPosition - closestMoonPt);
            // Authentic astronomical solar eclipse shadow on Earth:
            // Umbra radius = ~0.038 (240 km totality zone)
            // Penumbra radius = ~0.30 (1900 km partial eclipse zone)
            float umbraRad = 0.038;
            float penumbraRad = 0.30;
            if (perpDistToMoon < penumbraRad) {
              float penumbra = smoothstep(umbraRad, penumbraRad, perpDistToMoon);
              float umbra = smoothstep(0.0, umbraRad, perpDistToMoon);
              moonShadowFactor = mix(0.02, 0.65 + 0.35 * penumbra, umbra);
            }
          }

          // Check if Mercury (index 0) or Venus (index 1) passes directly in front of the Sun relative to Earth
          for (int i = 0; i < 2; i++) {
            vec3 toPlanet = uOccluderPos[i] - vWorldPosition;
            float projP = dot(toPlanet, L);
            if (projP > 0.0 && projP < distToSun) {
              vec3 closestPt = vWorldPosition + L * projP;
              float perpDist = length(uOccluderPos[i] - closestPt);
              float pRad = uOccluderRad[i];
              float pShadow = smoothstep(pRad * 0.65, pRad * 1.55, perpDist);
              moonShadowFactor *= pShadow;
            }
          }

          // Strict day/night hemisphere cutoff: night side where sunlight does not reach has ZERO light (0.0)
          float dayFactor = smoothstep(0.0, 0.12, ndotl) * uSunLightEnabled * moonShadowFactor;
          if (uFullDaylight > 0.5 && uSunLightEnabled > 0.5) {
            dayFactor = 1.0;
          }

          // Subtle Cloud Shadow cast onto land & ocean slightly offset away from the Sun
          float cloudShadow = 1.0;
          if (uShowClouds > 0.5 && dayFactor > 0.02) {
            vec3 shadowSampleDir = normalize(nLocal + vec3(0.012, -0.008, 0.012));
            float cShadowDens = computeGlobalCloudDensity(shadowSampleDir, uTime);
            cloudShadow = 1.0 - cShadowDens * 0.36;
          }

          float twilightBand = smoothstep(0.0, 0.04, ndotl) * (1.0 - smoothstep(0.04, 0.18, ndotl)) * uSunLightEnabled * (1.0 - uFullDaylight);

          float diffuse = pow(max(0.0, ndotl), 0.78);
          vec3 dayLit = baseMapColor * (diffuse * uSunIntensity * 0.92 * dayFactor * cloudShadow);

          // Aerial Rayleigh atmospheric blue perspective across the sunlit Earth surface (stronger towards the limb!)
          float viewAngle = max(0.0, dot(N, V));
          float rayleighSurfaceHaze = pow(1.0 - viewAngle, 1.85) * dayFactor;
          vec3 trueAtmosphericBlue = vec3(0.14, 0.52, 0.98);
          dayLit = mix(dayLit, trueAtmosphericBlue * (0.65 + 0.35 * diffuse), rayleighSurfaceHaze * 0.52);

          vec3 twilightColor = baseMapColor * vec3(1.38, 0.58, 0.22) * 1.15;
          vec3 finalColor = mix(dayLit, twilightColor, twilightBand * 0.65);

          if (uShowRealisticWater > 0.5 && isOcean > 0.1 && dayFactor > 0.05) {
            vec3 H = normalize(L + V);
            float spec = pow(max(0.0, dot(N, H)), 56.0);
            float fresnelWater = pow(1.0 - viewAngle, 3.2);
            finalColor += vec3(0.95, 0.96, 1.0) * spec * isOcean * dayFactor * cloudShadow * 0.48;
            finalColor += vec3(0.10, 0.45, 0.92) * fresnelWater * isOcean * dayFactor * 0.28;
          }

          if (uShowCityLights > 0.5 && dayFactor < 0.72 && uSunLightEnabled > 0.5) {
            float nightMask = pow(clamp(1.0 - dayFactor * 1.45, 0.0, 1.0), 1.35);

            // 1. Subtle nocturnal airglow & starlight contrast between dark continents and deep night oceans
            // (Just like the reference Black Marble photograph where coastlines are subtly discernible at night!)
            vec3 nightOceanTone = vec3(0.004, 0.014, 0.036);
            vec3 nightLandTone = vec3(0.008, 0.018, 0.032) + baseMapColor * 0.025;
            vec3 ambientNightSurface = mix(nightLandTone, nightOceanTone, isOcean);
            finalColor += ambientNightSurface * nightMask;

            // 2. Sample high-resolution Night City Lights map ( strictly masked to dry land! )
            float landMask = 1.0 - smoothstep(0.002, 0.018, elev);
            float dryLand = 1.0 - isOcean * 0.92;
            vec3 nightMapSample = texture2D(uNightLightsMap, pUV).rgb * dryLand;
            float cityIntensity = max(nightMapSample.r, max(nightMapSample.g, nightMapSample.b));

            if (cityIntensity > 0.005) {
              // 3. Procedural Ultra-Fine Street-Grid Micro-Sparkle (simulates thousands of individual street lamps & highways)
              vec3 pGrid1 = nLocal * 420.0;
              vec3 pGrid2 = nLocal * 1150.0;
              float microSparkle1 = noise3D(pGrid1);
              float microSparkle2 = noise3D(pGrid2);

              // Sharp pinpoint city blocks & highway filaments
              float pinpointWeb = smoothstep(0.28, 0.82, microSparkle1 * 0.55 + microSparkle2 * 0.45);
              float superBrightCore = smoothstep(0.52, 0.92, cityIntensity) * smoothstep(0.45, 0.88, microSparkle2);

              // Authentic Sodium-Vapor Amber -> Golden Yellow -> Incandescent White-Hot Downtown Core
              vec3 deepAmberOuter = vec3(0.95, 0.42, 0.08);
              vec3 goldenSodiumMid = vec3(1.0, 0.76, 0.28);
              vec3 whiteHotCore = vec3(1.0, 0.97, 0.86);

              // Soft atmospheric scatter halo around major metropolitan areas (diffused by clouds if overcast)
              float cloudDiffuser = (uShowClouds > 0.5) ? computeGlobalCloudDensity(nLocal, uTime) : 0.0;
              vec3 urbanGlow = deepAmberOuter * pow(cityIntensity, 1.35) * (0.65 + cloudDiffuser * 0.75);

              // Crisp micro-point street network
              vec3 streetPoints = mix(deepAmberOuter, goldenSodiumMid, clamp(cityIntensity * 1.3, 0.0, 1.0))
                                * pow(cityIntensity, 0.85) * (0.45 + 1.45 * pinpointWeb);

              // Brilliant white-gold metropolitan centers
              vec3 downtownCores = whiteHotCore * superBrightCore * 1.95;

              // Attenuate slightly under very thick storm clouds while letting the warm glow diffuse through
              float cloudAtten = 1.0 - cloudDiffuser * 0.35;
              vec3 totalCityLight = (urbanGlow + streetPoints * cloudAtten + downtownCores * cloudAtten) * nightMask;

              finalColor += totalCityLight;
            }
          }

          // Vibrant NASA Blue Marble Fresnel Atmospheric Rim on Earth's surface
          float rim = 1.0 - viewAngle;
          float rimPow = pow(rim, 2.35);
          vec3 deepRayleighRim = mix(vec3(0.16, 0.56, 1.0), vec3(0.38, 0.78, 1.0), pow(rim, 4.0));
          vec3 rimCol = mix(vec3(0.01, 0.04, 0.12), deepRayleighRim, dayFactor);
          rimCol = mix(rimCol, vec3(1.0, 0.48, 0.18), twilightBand * 0.75);
          finalColor += rimCol * rimPow * 0.68;

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });

    const earthMesh = new THREE.Mesh(earthGeo, earthShaderMat);
    earthSpinGroup.add(earthMesh);

    const earthLabel = createPlanetLabelSprite('🌍 Terra (1,00 UA)', '#38bdf8');
    earthLabel.position.set(0, GLOBE_RADIUS + 2.4, 0);
    earthSystemGroup.add(earthLabel);

    // 3D Shadow Cone (Umbra) projected behind the Earth opposite to the Sun (reaching past the Moon's orbit at 6.0 un!)
    const earthShadowCone = createBodyShadowCone(GLOBE_RADIUS, 14.0);
    earthSystemGroup.add(earthShadowCone.mesh);

    // =========================================================================
    // 5B. REALISTIC 3D GLOBAL CLOUD SPHERE (Dynamic Cyclones, Trade Winds & Sunset Tint)
    // =========================================================================
    // Raised to 1.045 R_Earth (well above the max 3D mountain relief so it NEVER clips or z-fights!)
    const cloudSphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.045, 128, 128);
    const cloudSphereUniforms = {
      uSunWorldPosition: { value: new THREE.Vector3(0, 0, 0) },
      uMoonWorldPosition: { value: new THREE.Vector3(0, 0, 0) },
      uMoonRadius: { value: GLOBE_RADIUS * (3474.8 / EARTH_DIAMETER_KM) },
      uSunLightEnabled: { value: 1.0 },
      uFullDaylight: { value: 0.0 },
      uTime: { value: 0.0 },
    };
    const cloudSphereMat = new THREE.ShaderMaterial({
      uniforms: cloudSphereUniforms,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: THREE.FrontSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
      vertexShader: `
        varying vec3 vLocalNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main() {
          vLocalNormal = normalize(position);
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPosition = wp.xyz;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 uSunWorldPosition;
        uniform vec3 uMoonWorldPosition;
        uniform float uMoonRadius;
        uniform float uSunLightEnabled;
        uniform float uFullDaylight;
        uniform float uTime;

        varying vec3 vLocalNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        float hash31(vec3 p) {
          p = fract(p * 0.3183099 + 0.1);
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y * p.z));
        }

        float noise3D(vec3 x) {
          vec3 i = floor(x);
          vec3 f = fract(x);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(mix(hash31(i + vec3(0,0,0)), hash31(i + vec3(1,0,0)), f.x),
                mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
            mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
                mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y), f.z);
        }

        float fbm(vec3 p) {
          float v = 0.0;
          float a = 0.52;
          for (int i = 0; i < 4; i++) {
            v += a * noise3D(p);
            p = p * 2.12 + vec3(1.7, 9.2, 3.4);
            a *= 0.48;
          }
          return v;
        }

        void main() {
          vec3 N = normalize(vWorldNormal);
          vec3 V = normalize(cameraPosition - vWorldPosition);
          // Smooth limb fade so clouds never flicker or alias at grazing horizon angles
          float viewFacing = smoothstep(0.02, 0.18, dot(N, V));
          if (viewFacing < 0.01) discard;

          vec3 nSphere = normalize(vLocalNormal);
          float drift = uTime * 0.0025;
          mat3 rotY = mat3(
            cos(drift), 0.0, sin(drift),
            0.0, 1.0, 0.0,
            -sin(drift), 0.0, cos(drift)
          );
          vec3 p = rotY * nSphere;

          // Domain-warped fluid turbulence for realistic cloud bands & cyclone spirals
          vec3 q = vec3(
            fbm(p * 3.2 + vec3(0.0, uTime * 0.0012, 0.0)),
            fbm(p * 3.2 + vec3(5.2, 1.3, 2.8)),
            fbm(p * 3.2 + vec3(1.7, 8.4, 4.1))
          );
          float rawCloud = fbm(p * 4.5 + q * 1.45);

          float lat = asin(clamp(nSphere.y, -1.0, 1.0));
          float itcz = exp(-pow(lat / 0.16, 2.0)) * 0.16;
          float stormBelts = exp(-pow((abs(lat) - 0.82) / 0.30, 2.0)) * 0.14;
          float density = smoothstep(0.45, 0.74, rawCloud + itcz + stormBelts);
          if (density < 0.01) discard;

          vec3 L = normalize(uSunWorldPosition - vWorldPosition);
          float ndotl = dot(N, L);

          // Solar eclipse shadow on clouds
          vec3 toMoon = uMoonWorldPosition - vWorldPosition;
          float projMoon = dot(toMoon, L);
          float moonShadow = 1.0;
          if (projMoon > 0.0) {
            vec3 closestMoonPt = vWorldPosition + L * projMoon;
            float perpDist = length(uMoonWorldPosition - closestMoonPt);
            float umbraRad = 0.038;
            float penumbraRad = 0.30;
            if (perpDist < penumbraRad) {
              float penumbra = smoothstep(umbraRad, penumbraRad, perpDist);
              float umbra = smoothstep(0.0, umbraRad, perpDist);
              moonShadow = mix(0.02, 0.65 + 0.35 * penumbra, umbra);
            }
          }

          float dayCloud = smoothstep(-0.04, 0.14, ndotl) * uSunLightEnabled * moonShadow;
          if (uFullDaylight > 0.5 && uSunLightEnabled > 0.5) dayCloud = 1.0;

          // Calibrated pure-white cloud arc under the Sun (-20% from previous wide arc)
          float whiteSunArc = smoothstep(0.14, 0.46, ndotl);
          float twilightCloud = smoothstep(-0.06, 0.04, ndotl) * (1.0 - smoothstep(0.04, 0.20, ndotl)) * (1.0 - whiteSunArc) * uSunLightEnabled * (1.0 - uFullDaylight);

          // Self-shadowing thickness inside cloud tops
          float topHighlight = smoothstep(0.43, 0.81, rawCloud + 0.13 + whiteSunArc * 0.14);
          vec3 pureWhiteCloud = mix(vec3(0.82, 0.89, 0.96), vec3(1.0, 1.0, 1.0), topHighlight);
          vec3 sunsetCloud = vec3(1.0, 0.56, 0.28);
          vec3 nightCloud = vec3(0.02, 0.04, 0.09);

          vec3 col = mix(nightCloud, pureWhiteCloud * (0.74 + 0.36 * max(0.0, ndotl)), dayCloud);
          col = mix(col, sunsetCloud, twilightCloud * 0.82);

          float alpha = density * viewFacing * mix(0.16, 0.84, max(dayCloud, twilightCloud * 0.8));
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
    const cloudSphereMesh = new THREE.Mesh(cloudSphereGeo, cloudSphereMat);
    cloudSphereMesh.renderOrder = 3;
    earthSpinGroup.add(cloudSphereMesh);

    // =========================================================================
    // 5C. REALISTIC 3D AURORA BOREALIS (NORTH) & AURORA AUSTRALIS (SOUTH) CURTAINS
    // =========================================================================
    // Geomagnetic Auroral Ovals (~66°–72° magnetic latitude) raised cleanly above the cloud layer at 1.058 R_Earth
    const auroraGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.058, 128, 96);
    const auroraUniforms = {
      uSunWorldPosition: { value: new THREE.Vector3(0, 0, 0) },
      uTime: { value: 0.0 },
    };
    const auroraMat = new THREE.ShaderMaterial({
      uniforms: auroraUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      vertexShader: `
        varying vec3 vLocalPos;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main() {
          vLocalPos = normalize(position);
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPosition = wp.xyz;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 uSunWorldPosition;
        uniform float uTime;
        varying vec3 vLocalPos;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec3 n = normalize(vLocalPos);
          vec3 N = normalize(vWorldNormal);
          vec3 V = normalize(cameraPosition - vWorldPosition);
          float viewFacing = smoothstep(0.02, 0.20, dot(N, V));
          if (viewFacing < 0.01) discard;

          float absLat = abs(asin(clamp(n.y, -1.0, 1.0))) * 57.2957795;

          // Auroral Oval ring centered around 67.5° North (Aurora Boreal) & 67.5° South (Aurora Austral)
          float lon = atan(n.x, n.z);
          float ovalWave = sin(lon * 3.0 + uTime * 0.45) * 2.2 + cos(lon * 5.0 - uTime * 0.65) * 1.4;
          float targetLat = 67.5 + ovalWave;
          float distFromOval = abs(absLat - targetLat);

          // Main curtain band + secondary inner arc
          float band1 = exp(-pow(distFromOval / 2.6, 2.0));
          float band2 = exp(-pow(abs(absLat - (targetLat + 3.2)) / 1.8, 2.0)) * 0.65;
          float ovalMask = band1 + band2;
          if (ovalMask < 0.015) discard;

          // Animated vertical solar-wind magnetic field curtains & shimmering folds
          float curtain1 = sin(lon * 24.0 + uTime * 1.4 + sin(lon * 7.0 - uTime * 0.5) * 2.5) * 0.5 + 0.5;
          float curtain2 = sin(lon * 42.0 - uTime * 2.1 + cos(lon * 11.0 + uTime * 0.8) * 2.0) * 0.5 + 0.5;
          float rays = pow(curtain1 * 0.65 + curtain2 * 0.35, 1.6) * 1.35 + 0.25;

          // Stronger visibility on the night & twilight side of the polar regions, subtle glow on day side
          vec3 L = normalize(uSunWorldPosition - vWorldPosition);
          float sunDot = dot(N, L);
          float nightBoost = mix(1.0, 0.38, smoothstep(-0.15, 0.35, sunDot));

          // Authentic Oxygen & Nitrogen emission spectrum:
          // Lower edge: electric emerald-cyan (557.7 nm) -> Upper edge: magenta-violet (427.8 / 630.0 nm)
          vec3 emeraldGreen = vec3(0.05, 0.98, 0.52);
          vec3 cyanTeal = vec3(0.08, 0.85, 0.95);
          vec3 violetCrimson = vec3(0.75, 0.18, 0.92);

          float colorMix = clamp((absLat - 65.0) / 7.5, 0.0, 1.0);
          vec3 auroraColor = mix(emeraldGreen, cyanTeal, curtain2 * 0.5);
          auroraColor = mix(auroraColor, violetCrimson, pow(colorMix, 1.5) * 0.72);

          float alpha = ovalMask * rays * nightBoost * viewFacing * 0.85;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(auroraColor * 1.35, alpha);
        }
      `,
    });
    const auroraMesh = new THREE.Mesh(auroraGeo, auroraMat);
    auroraMesh.renderOrder = 4;
    earthSpinGroup.add(auroraMesh);

    // =========================================================================
    // 5D. DEEP BLUE RAYLEIGH ATMOSPHERE HALO (True NASA Blue Marble Outer Glow)
    // =========================================================================
    const atmoGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.072, 96, 96);
    const atmoUniforms = {
      uSunWorldPosition: { value: new THREE.Vector3(0, 0, 0) },
      uSunLightEnabled: { value: 1.0 },
    };
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: atmoUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      vertexShader: `
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uSunWorldPosition;
        uniform float uSunLightEnabled;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec3 N = normalize(vWorldNormal);
          vec3 V = normalize(cameraPosition - vWorldPosition);
          vec3 L = normalize(uSunWorldPosition - vWorldPosition);

          float viewDot = dot(N, -V);
          float intensity = pow(clamp(0.76 - viewDot, 0.0, 1.0), 2.1);

          float sunDot = dot(N, L);
          float dayAtmo = smoothstep(-0.08, 0.35, sunDot) * uSunLightEnabled;
          float twilightAtmo = smoothstep(-0.06, 0.06, sunDot) * (1.0 - smoothstep(0.06, 0.28, sunDot)) * uSunLightEnabled;
          float nightAtmo = (1.0 - dayAtmo) * 0.14 * uSunLightEnabled;

          // Rich Sapphire & Electric Cyan-Blue Rayleigh Scattering
          vec3 deepSapphire = vec3(0.08, 0.42, 0.98);
          vec3 brightCyanBlue = vec3(0.28, 0.72, 1.0);
          vec3 dayBlue = mix(deepSapphire, brightCyanBlue, clamp(intensity * 1.25, 0.0, 1.0));
          vec3 sunsetOrange = vec3(1.0, 0.46, 0.16);

          vec3 col = dayBlue * (dayAtmo + nightAtmo);
          col = mix(col, sunsetOrange, twilightAtmo * 0.68);

          float alpha = intensity * (dayAtmo * 0.95 + twilightAtmo * 0.55 + nightAtmo);
          gl_FragColor = vec4(col * 1.25, alpha);
        }
      `,
    });
    const atmoHaloMesh = new THREE.Mesh(atmoGeo, atmoMat);
    atmoHaloMesh.renderOrder = 5;
    earthTiltGroup.add(atmoHaloMesh);

    // Axial Rotation Axis Rod (23.44°)
    const axisGroup = new THREE.Group();
    const axisPts = [new THREE.Vector3(0, -GLOBE_RADIUS * 1.45, 0), new THREE.Vector3(0, GLOBE_RADIUS * 1.45, 0)];
    axisGroup.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(axisPts),
        new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
      )
    );
    const poleCapGeo = new THREE.ConeGeometry(0.065, 0.22, 20);
    const northCone = new THREE.Mesh(poleCapGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    northCone.position.set(0, GLOBE_RADIUS * 1.45, 0);
    axisGroup.add(northCone);
    const southCone = new THREE.Mesh(poleCapGeo, new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
    southCone.rotation.x = Math.PI;
    southCone.position.set(0, -GLOBE_RADIUS * 1.45, 0);
    axisGroup.add(southCone);
    earthTiltGroup.add(axisGroup);

    // Spherical Graticule Grid & Tropics on Earth
    const sphericalGridGroup = new THREE.Group();
    const tropicsGroup = new THREE.Group();

    const buildParallelCircle = (latDeg: number, colorHex: number, opacity: number, radiusOffset = 0.02) => {
      const rSphere = GLOBE_RADIUS + radiusOffset;
      const latRad = (latDeg * Math.PI) / 180;
      const y = rSphere * Math.sin(latRad);
      const rRing = rSphere * Math.cos(latRad);
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * rRing, y, Math.sin(a) * rRing));
      }
      return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: colorHex, transparent: true, opacity })
      );
    };

    for (let lat = -75; lat <= 75; lat += 15) {
      if (lat === 0) continue;
      sphericalGridGroup.add(buildParallelCircle(lat, 0x94a3b8, 0.22, 0.052));
    }

    for (let lng = 0; lng < 180; lng += 30) {
      const lngRad = (lng * Math.PI) / 180;
      const rSphere = GLOBE_RADIUS + 0.052;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * Math.PI * 2;
        const y = Math.sin(a) * rSphere;
        const rHoriz = Math.cos(a) * rSphere;
        pts.push(new THREE.Vector3(rHoriz * Math.sin(lngRad), y, rHoriz * Math.cos(lngRad)));
      }
      const isPrime = lng === 0;
      sphericalGridGroup.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.LineBasicMaterial({
            color: isPrime ? 0x38bdf8 : 0x94a3b8,
            transparent: true,
            opacity: isPrime ? 0.55 : 0.22,
          })
        )
      );
    }

    tropicsGroup.add(buildParallelCircle(0, 0x38bdf8, 0.85, 0.055));
    tropicsGroup.add(buildParallelCircle(23.44, 0xf59e0b, 0.8, 0.055));
    tropicsGroup.add(buildParallelCircle(-23.44, 0xf59e0b, 0.8, 0.055));
    tropicsGroup.add(buildParallelCircle(66.56, 0x818cf8, 0.75, 0.055));
    tropicsGroup.add(buildParallelCircle(-66.56, 0x818cf8, 0.75, 0.055));

    // Straight, horizontal, non-warping 3D Billboard Labels for the Tropics and Equator (visible when showTropicsAndCircles is enabled)
    const createStraightTropicBadge = (text: string, colorHex: string, latDeg: number) => {
      const sp = createPlanetLabelSprite(text, colorHex);
      const rBadge = GLOBE_RADIUS + 0.08;
      const latRad = (latDeg * Math.PI) / 180;
      sp.position.set(0, rBadge * Math.sin(latRad), rBadge * Math.cos(latRad));
      sp.scale.set(0.115, 0.024, 1);
      return sp;
    };
    tropicsGroup.add(createStraightTropicBadge('Trópico de Câncer (23,44° N)', '#fde047', 23.44));
    tropicsGroup.add(createStraightTropicBadge('Linha do Equador (0°)', '#38bdf8', 0));
    tropicsGroup.add(createStraightTropicBadge('Trópico de Capricórnio (23,44° S)', '#fb923c', -23.44));

    earthTiltGroup.add(tropicsGroup);
    earthSpinGroup.add(sphericalGridGroup);

    // GPS Observer Pin on Earth
    const observerPinGroup = new THREE.Group();
    earthSpinGroup.add(observerPinGroup);

    const pinConeGeo = new THREE.ConeGeometry(0.10, 0.36, 16);
    pinConeGeo.rotateX(Math.PI);
    pinConeGeo.translate(0, 0.18, 0);
    observerPinGroup.add(new THREE.Mesh(pinConeGeo, new THREE.MeshBasicMaterial({ color: 0x0ea5e9 })));

    const pinHeadGeo = new THREE.SphereGeometry(0.10, 16, 16);
    pinHeadGeo.translate(0, 0.38, 0);
    observerPinGroup.add(new THREE.Mesh(pinHeadGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8 })));

    const zenithLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 2.2, 0)]),
      new THREE.LineDashedMaterial({ color: 0x38bdf8, dashSize: 0.15, gapSize: 0.08, transparent: true, opacity: 0.85 })
    );
    zenithLine.computeLineDistances();
    observerPinGroup.add(zenithLine);

    const tangentHorizonGroup = new THREE.Group();
    const horizonDiscGeo = new THREE.CircleGeometry(1.0, 48);
    horizonDiscGeo.rotateX(-Math.PI / 2);
    tangentHorizonGroup.add(
      new THREE.Mesh(
        horizonDiscGeo,
        new THREE.MeshBasicMaterial({
          color: 0x10b981,
          transparent: true,
          opacity: 0.22,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      )
    );
    observerPinGroup.add(tangentHorizonGroup);

    // World Cities 3D Dots on Earth (kept hidden so the high-resolution Black Marble shader lights look 100% real and never like yellow balls)
    const citiesGlobeGroup = new THREE.Group();
    citiesGlobeGroup.visible = false;
    earthSpinGroup.add(citiesGlobeGroup);

    // Day/Night Terminator Ring around Earth
    const terminatorGroup = new THREE.Group();
    const termPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      termPts.push(new THREE.Vector3(Math.cos(a) * (GLOBE_RADIUS + 0.04), Math.sin(a) * (GLOBE_RADIUS + 0.04), 0));
    }
    terminatorGroup.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(termPts),
        new THREE.LineBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.9 })
      )
    );
    earthSystemGroup.add(terminatorGroup);

    // Orbiting 3D Moon around the Earth:
    // - Size: Exact 0.2727x Earth diameter (3,474.8 km / 12,742 km)
    // - Distance: Exact 60.336 Earth Radii = 30.168 Earth Diameters (384,400 km / 6,371 km)
    const moonOrbitRadius = MOON_ORBIT_RADIUS; // 60.336 unidades (384.400 km)
    const moonRadius3D = MOON_RADIUS_3D; // 0.2727 unidades (1.737,4 km de raio)
    const moonGroup = new THREE.Group();
    const moonGeo = new THREE.SphereGeometry(moonRadius3D, 48, 48);
    const moonTex = generateMoonTexture();
    const moonUniforms = {
      uMoonTexture: { value: moonTex },
      uSunWorldPosition: { value: new THREE.Vector3(0, 0, 0) },
      uEarthWorldPosition: { value: new THREE.Vector3(0, 0, 0) },
      uEarthRadius: { value: GLOBE_RADIUS },
      uSunLightEnabled: { value: 1.0 },
    };
    const moonMat = new THREE.ShaderMaterial({
      uniforms: moonUniforms,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main() {
          vUv = uv;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPosition = wp.xyz;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform sampler2D uMoonTexture;
        uniform vec3 uSunWorldPosition;
        uniform vec3 uEarthWorldPosition;
        uniform float uEarthRadius;
        uniform float uSunLightEnabled;
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main() {
          vec3 tex = texture2D(uMoonTexture, vUv).rgb;
          vec3 toSun = uSunWorldPosition - vWorldPosition;
          float distToSun = length(toSun);
          vec3 L = toSun / max(distToSun, 0.0001);

          // 1. Directional Illumination strictly from the Central Sun (0,0,0):
          // Only the hemisphere facing the Sun (ndotl > 0) receives light; the opposite face has 0.0 light.
          float ndotl = dot(normalize(vWorldNormal), L);
          float lit = smoothstep(0.0, 0.08, ndotl) * uSunLightEnabled;

          // 2. Ray-Sphere Occlusion by Earth:
          // If the Earth is positioned between the Sun and the Moon, the Earth blocks the Sun's rays
          // and the Moon receives ZERO light (0.0) inside Earth's shadow cone!
          vec3 toEarth = uEarthWorldPosition - vWorldPosition;
          float projOnSunRay = dot(toEarth, L);
          float earthOcclusion = 1.0;
          if (projOnSunRay > 0.0 && projOnSunRay < distToSun) {
            vec3 closestPointOnRay = vWorldPosition + L * projOnSunRay;
            float perpDistToEarthCenter = length(uEarthWorldPosition - closestPointOnRay);
            // Inside Earth's shadow radius (<= uEarthRadius), earthOcclusion = 0.0 (zero light!)
            earthOcclusion = smoothstep(uEarthRadius * 0.98, uEarthRadius * 1.08, perpDistToEarthCenter);
          }

          vec3 col = tex * (pow(max(0.0, ndotl), 0.8) * 1.75 * lit * earthOcclusion);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonGroup.add(moonMesh);

    const moonLabel = createPlanetLabelSprite('🌙 Lua (0,273x Terra • 384.400 km)', '#e2e8f0');
    moonLabel.position.set(0, moonRadius3D + 1.4, 0);
    moonGroup.add(moonLabel);

    // 3D Shadow Cone (Umbra) projected behind the Moon opposite to the Sun
    const moonShadowCone = createBodyShadowCone(moonRadius3D, 8.5);
    moonGroup.add(moonShadowCone.mesh);

    earthSystemGroup.add(moonGroup);

    const moonOrbitGroup = new THREE.Group();
    const moonOrbitPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      moonOrbitPts.push(new THREE.Vector3(Math.cos(a) * moonOrbitRadius, 0, Math.sin(a) * moonOrbitRadius));
    }
    const moonOrbitLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(moonOrbitPts),
      new THREE.LineBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.55 })
    );
    moonOrbitGroup.add(moonOrbitLine);

    // 3D Line of Nodes (Linha dos Nodos: ☊ Nodo Ascendente em +X, ☋ Nodo Descendente em -X)
    // Precesses retrograde at -19.34°/year (18.6-year nodal cycle)
    const nodeLinePts = [
      new THREE.Vector3(-moonOrbitRadius, 0, 0),
      new THREE.Vector3(moonOrbitRadius, 0, 0),
    ];
    const nodeLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(nodeLinePts),
      new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.45 })
    );
    moonOrbitGroup.add(nodeLine);

    const ascNodeMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    ascNodeMarker.position.set(moonOrbitRadius, 0, 0);
    moonOrbitGroup.add(ascNodeMarker);

    const ascNodeLabel = createPlanetLabelSprite('☊ Nodo Ascendente (-19,34°/ano)', '#34d399');
    ascNodeLabel.position.set(moonOrbitRadius, 1.2, 0);
    moonOrbitGroup.add(ascNodeLabel);

    const descNodeMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xf43f5e })
    );
    descNodeMarker.position.set(-moonOrbitRadius, 0, 0);
    moonOrbitGroup.add(descNodeMarker);

    const descNodeLabel = createPlanetLabelSprite('☋ Nodo Descendente (18,6 anos)', '#fb7185');
    descNodeLabel.position.set(-moonOrbitRadius, 1.2, 0);
    moonOrbitGroup.add(descNodeLabel);

    // Reference Ecliptic Ring (Plano Horizontal do Vetor de Luz do Sol Y=0) at Moon's orbital distance
    // Allows clearly seeing the Moon's orbital plane tilted relative to the Sun's light & Earth's shadow cone!
    const eclipticRefPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      eclipticRefPts.push(new THREE.Vector3(Math.cos(a) * moonOrbitRadius, 0, Math.sin(a) * moonOrbitRadius));
    }
    const eclipticRefRing = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(eclipticRefPts),
      new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.22 })
    );
    earthSystemGroup.add(eclipticRefRing);

    earthSystemGroup.add(moonOrbitGroup);

    // =========================================================================
    // 6. ALL OTHER SOLAR SYSTEM PLANETS AT TRUE AU PROPORTIONS
    // =========================================================================
    const planetOrbitsGroup = new THREE.Group();
    scene.add(planetOrbitsGroup);

    interface PlanetMoonRenderEntry {
      moonSpec: PlanetaryMoonSpec;
      orbitGroup: THREE.Group;
      moonMesh: THREE.Mesh;
      shadowCone: { mesh: THREE.Mesh; mat: THREE.ShaderMaterial };
      orbitLine: THREE.Line;
      labelSprite: THREE.Sprite;
      uniforms: {
        uSunWorldPosition: { value: THREE.Vector3 };
        uSunLightEnabled: { value: number };
        uPlanetWorldPosition: { value: THREE.Vector3 };
        uPlanetRadius: { value: number };
      };
      orbitRadius3D: number;
      initialPhaseRad: number;
    }

    interface PlanetRenderEntry {
      spec: PlanetOrbitalSpec;
      systemGroup: THREE.Group;
      spinMesh: THREE.Mesh;
      uniforms: {
        uSunWorldPosition: { value: THREE.Vector3 };
        uSunLightEnabled: { value: number };
        uMoonCount: { value: number };
        uMoonWorldPositions: { value: THREE.Vector3[] };
        uMoonRadii: { value: number[] };
      };
      ringUniforms?: { uSunLightEnabled: { value: number }; uPlanetCenter?: { value: THREE.Vector3 } };
      shadowCone: { mesh: THREE.Mesh; mat: THREE.ShaderMaterial };
      labelSprite: THREE.Sprite;
      moons: PlanetMoonRenderEntry[];
    }

    const otherPlanetsMap = new Map<SolarSystemTargetId, PlanetRenderEntry>();

    SOLAR_SYSTEM_PLANETS.forEach((spec) => {
      const orbitPts: THREE.Vector3[] = [];
      const incRad = (spec.orbitalInclinationDeg * Math.PI) / 180;
      for (let i = 0; i <= 240; i++) {
        const a = (i / 240) * Math.PI * 2;
        const ox = Math.cos(a) * spec.orbitRadius;
        const oz = -Math.sin(a) * spec.orbitRadius;
        const oy = Math.sin(a) * Math.sin(incRad) * spec.orbitRadius;
        orbitPts.push(new THREE.Vector3(ox, oy, oz));
      }
      const isEarthOrbit = spec.id === 'earth';
      const orbitLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(orbitPts),
        new THREE.LineBasicMaterial({
          color: isEarthOrbit ? 0x38bdf8 : new THREE.Color(spec.colorHex),
          transparent: true,
          opacity: isEarthOrbit ? 0.55 : 0.30,
        })
      );
      planetOrbitsGroup.add(orbitLine);

      if (spec.id === 'earth') return;

      const sysGroup = new THREE.Group();
      scene.add(sysGroup);

      const pTex = createPlanetSurfaceTexture(spec.id);
      const pMoonPositions = [
        new THREE.Vector3(99999, 99999, 99999),
        new THREE.Vector3(99999, 99999, 99999),
        new THREE.Vector3(99999, 99999, 99999),
        new THREE.Vector3(99999, 99999, 99999),
      ];
      const pMoonRadii = [0.0, 0.0, 0.0, 0.0];

      const pUniforms = {
        uSurfaceTex: { value: pTex },
        uSunWorldPosition: { value: new THREE.Vector3(0, 0, 0) },
        uSunLightEnabled: { value: 1.0 },
        uMoonCount: { value: 0 },
        uMoonWorldPositions: { value: pMoonPositions },
        uMoonRadii: { value: pMoonRadii },
        uOccluderPos: { value: occluderPositions },
        uOccluderRad: { value: occluderRadii },
        uSelfRadius: { value: spec.radius3D },
        uHasRings: { value: spec.id === 'saturn' ? 1.0 : 0.0 },
        uAxialTiltRad: { value: (spec.axialTiltDeg * Math.PI) / 180 },
      };
      const pMat = new THREE.ShaderMaterial({
        uniforms: pUniforms,
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vWorldNormal;
          varying vec3 vWorldPosition;
          void main() {
            vUv = uv;
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorldPosition = wp.xyz;
            vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: `
          uniform sampler2D uSurfaceTex;
          uniform vec3 uSunWorldPosition;
          uniform float uSunLightEnabled;
          uniform int uMoonCount;
          uniform vec3 uMoonWorldPositions[4];
          uniform float uMoonRadii[4];
          uniform vec3 uOccluderPos[9];
          uniform float uOccluderRad[9];
          uniform float uSelfRadius;
          uniform float uHasRings;
          uniform float uAxialTiltRad;
          varying vec2 vUv;
          varying vec3 vWorldNormal;
          varying vec3 vWorldPosition;
          void main() {
            vec3 tex = texture2D(uSurfaceTex, vUv).rgb;
            vec3 N = normalize(vWorldNormal);
            vec3 toSun = uSunWorldPosition - vWorldPosition;
            float distToSun = length(toSun);
            vec3 L = toSun / max(distToSun, 0.0001);
            float ndotl = dot(N, L);

            // Distance-based Solar Irradiance Falloff:
            // Very strong near the Sun (Mercury = 100.6 un -> ~2.65x, Venus = 188 un -> ~2.15x, Earth = 260 un -> ~1.90x)
            // and progressively weaker as sunlight travels out to Saturn (1180 un), Uranus (1650 un), and Neptune (2120 un -> ~0.68x)!
            float distanceBrightness = clamp(pow(260.0 / max(distToSun, 85.0), 0.45) * 1.90, 0.65, 2.75);

            // 1. Real-Time Moon Transit Shadow Casting (Umbra & Penumbra) onto the Planet's Day Side!
            float shadowFactor = 1.0;
            if (ndotl > -0.02) {
              for (int i = 0; i < 4; i++) {
                if (i < uMoonCount) {
                  vec3 toMoon = uMoonWorldPositions[i] - vWorldPosition;
                  float projOnSunRay = dot(toMoon, L);
                  if (projOnSunRay > 0.0 && projOnSunRay < distToSun) {
                    vec3 closestPoint = vWorldPosition + L * projOnSunRay;
                    float perpDist = length(uMoonWorldPositions[i] - closestPoint);
                    float mRad = uMoonRadii[i];
                    // Dark circular umbra core + soft penumbra ring cast on the planet surface
                    float umbra = 1.0 - smoothstep(mRad * 0.45, mRad * 1.05, perpDist);
                    float penumbra = 1.0 - smoothstep(mRad * 1.05, mRad * 1.75, perpDist);
                    float shadowDepth = clamp(umbra * 0.96 + penumbra * 0.45, 0.0, 0.97);
                    shadowFactor *= (1.0 - shadowDepth);
                  }
                }
              }

              // 2. Interplanetary Transit Shadow: If ANY closer planet passes in front of the Sun, it casts its shadow!
              for (int j = 0; j < 9; j++) {
                vec3 toOcc = uOccluderPos[j] - vWorldPosition;
                float distToOcc = length(toOcc);
                // Skip self (where distance to planet center is ~uSelfRadius)
                if (distToOcc > uSelfRadius * 2.5) {
                  float projOcc = dot(toOcc, L);
                  if (projOcc > 0.0 && projOcc < distToSun) {
                    vec3 closestOccPt = vWorldPosition + L * projOcc;
                    float perpOccDist = length(uOccluderPos[j] - closestOccPt);
                    float occRad = uOccluderRad[j];
                    float occUmbra = 1.0 - smoothstep(occRad * 0.55, occRad * 1.35, perpOccDist);
                    shadowFactor *= (1.0 - occUmbra * 0.96);
                  }
                }
              }
            }

            // Strict physical terminator: where sunlight does not reach (ndotl <= 0), light is 0.0 (complete darkness)
            float lit = smoothstep(0.0, 0.10, ndotl) * uSunLightEnabled * shadowFactor;
            vec3 col = tex * (pow(max(0.0, ndotl), 0.78) * distanceBrightness * lit);
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      });

      const pMesh = new THREE.Mesh(new THREE.SphereGeometry(spec.radius3D, 48, 48), pMat);
      pMesh.rotation.z = (spec.axialTiltDeg * Math.PI) / 180;
      sysGroup.add(pMesh);

      let ringUniforms: { uSunLightEnabled: { value: number }; uPlanetCenter?: { value: THREE.Vector3 } } | undefined;

      if (spec.id === 'saturn') {
        const ringGeo = new THREE.RingGeometry(spec.radius3D * 1.35, spec.radius3D * 2.45, 96);
        ringGeo.rotateX(Math.PI / 2);
        ringUniforms = {
          uSunLightEnabled: { value: 1.0 },
          uPlanetCenter: { value: new THREE.Vector3(0, 0, 0) },
        };
        const ringMat = new THREE.ShaderMaterial({
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
          uniforms: {
            uInnerRadius: { value: spec.radius3D * 1.35 },
            uOuterRadius: { value: spec.radius3D * 2.45 },
            uPlanetRadius: { value: spec.radius3D },
            uPlanetCenter: ringUniforms.uPlanetCenter,
            uSunLightEnabled: ringUniforms.uSunLightEnabled,
          },
          vertexShader: `
            varying vec3 vLocalPos;
            varying vec3 vWorldPosition;
            void main() {
              vLocalPos = position;
              vec4 wp = modelMatrix * vec4(position, 1.0);
              vWorldPosition = wp.xyz;
              gl_Position = projectionMatrix * viewMatrix * wp;
            }
          `,
          fragmentShader: `
            uniform float uInnerRadius;
            uniform float uOuterRadius;
            uniform float uPlanetRadius;
            uniform vec3 uPlanetCenter;
            uniform float uSunLightEnabled;
            varying vec3 vLocalPos;
            varying vec3 vWorldPosition;
            void main() {
              float r = length(vLocalPos.xz);
              float t = clamp((r - uInnerRadius) / (uOuterRadius - uInnerRadius), 0.0, 1.0);
              float cassini = 1.0 - 0.85 * exp(-pow((t - 0.66) * 28.0, 2.0));
              float bands = 0.75 + 0.25 * sin(t * 60.0);
              float distToSun = length(vWorldPosition);
              vec3 L = -vWorldPosition / max(distToSun, 0.0001);

              // Real-Time Shadow of Saturn's Globe cast onto the back of Saturn's Rings!
              vec3 toPlanet = uPlanetCenter - vWorldPosition;
              float projOnSun = dot(toPlanet, L);
              float planetShadowOnRing = 1.0;
              if (projOnSun > 0.0 && projOnSun < distToSun) {
                vec3 closestPt = vWorldPosition + L * projOnSun;
                float perpDist = length(uPlanetCenter - closestPt);
                float inUmbra = 1.0 - smoothstep(uPlanetRadius * 0.90, uPlanetRadius * 1.08, perpDist);
                planetShadowOnRing = 1.0 - inUmbra * 0.96;
              }

              float distAtten = clamp(pow(260.0 / max(distToSun, 85.0), 0.45), 0.45, 1.5);
              vec3 col = mix(vec3(0.85, 0.75, 0.52), vec3(0.98, 0.90, 0.70), bands) * distAtten * uSunLightEnabled * planetShadowOnRing;
              float alpha = (0.82 * cassini) * smoothstep(0.0, 0.08, t) * (1.0 - smoothstep(0.92, 1.0, t)) * uSunLightEnabled;
              gl_FragColor = vec4(col, alpha);
            }
          `,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.z = (spec.axialTiltDeg * Math.PI) / 180;
        sysGroup.add(ringMesh);
      }

      if (spec.id === 'uranus') {
        const uRingGeo = new THREE.RingGeometry(spec.radius3D * 1.4, spec.radius3D * 1.65, 64);
        ringUniforms = { uSunLightEnabled: { value: 1.0 } };
        const uRingMat = new THREE.ShaderMaterial({
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
          uniforms: {
            uSunLightEnabled: ringUniforms.uSunLightEnabled,
          },
          vertexShader: `
            void main() {
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform float uSunLightEnabled;
            void main() {
              gl_FragColor = vec4(vec3(0.40, 0.91, 0.98) * uSunLightEnabled, 0.35 * uSunLightEnabled);
            }
          `,
        });
        sysGroup.add(new THREE.Mesh(uRingGeo, uRingMat));
      }

      const label = createPlanetLabelSprite(`${spec.namePt} (${spec.earthSizeRatio}x Terra)`, spec.colorHex);
      label.position.set(0, spec.radius3D + 2.8, 0);
      sysGroup.add(label);

      // 3D Shadow Cone (Umbra) projected behind each planet opposite to the Sun
      const shadowCone = createBodyShadowCone(spec.radius3D, Math.max(12.0, spec.radius3D * 14.0));
      sysGroup.add(shadowCone.mesh);

      // Build Natural Moons (Satélites Naturais) for Mars, Jupiter, Saturn, Uranus, and Neptune!
      const planetMoonsList = PLANETARY_MOONS_CATALOG[spec.id] || [];
      const moonEntries: PlanetMoonRenderEntry[] = [];
      const planetTiltRad = (spec.axialTiltDeg * Math.PI) / 180;

      planetMoonsList.forEach((mSpec, mIdx) => {
        const mOrbitGroup = new THREE.Group();
        const mIncRad = (mSpec.inclinationDeg * Math.PI) / 180;
        // Align moon orbital plane with the parent planet's equatorial tilt + moon's orbital inclination
        mOrbitGroup.rotation.z = planetTiltRad * 0.35 + mIncRad;
        mOrbitGroup.rotation.x = Math.sin(mIdx * 2.1) * mIncRad;
        sysGroup.add(mOrbitGroup);

        const orbitRadius3D = spec.radius3D * mSpec.orbitRadiusMult;
        const mOrbitPts: THREE.Vector3[] = [];
        for (let i = 0; i <= 72; i++) {
          const a = (i / 72) * Math.PI * 2;
          mOrbitPts.push(new THREE.Vector3(Math.cos(a) * orbitRadius3D, 0, Math.sin(a) * orbitRadius3D));
        }
        const mOrbitLine = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(mOrbitPts),
          new THREE.LineBasicMaterial({
            color: new THREE.Color(mSpec.colorHex),
            transparent: true,
            opacity: 0.32,
          })
        );
        mOrbitGroup.add(mOrbitLine);

        const mTex = createMoonSurfaceTexture(mSpec);
        const mUniforms = {
          uSurfaceTex: { value: mTex },
          uSunWorldPosition: { value: new THREE.Vector3(0, 0, 0) },
          uSunLightEnabled: { value: 1.0 },
          uPlanetWorldPosition: { value: new THREE.Vector3(0, 0, 0) },
          uPlanetRadius: { value: spec.radius3D },
        };
        const mMat = new THREE.ShaderMaterial({
          uniforms: mUniforms,
          vertexShader: `
            varying vec2 vUv;
            varying vec3 vWorldNormal;
            varying vec3 vWorldPosition;
            void main() {
              vUv = uv;
              vec4 wp = modelMatrix * vec4(position, 1.0);
              vWorldPosition = wp.xyz;
              vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
              gl_Position = projectionMatrix * viewMatrix * wp;
            }
          `,
          fragmentShader: `
            uniform sampler2D uSurfaceTex;
            uniform vec3 uSunWorldPosition;
            uniform float uSunLightEnabled;
            uniform vec3 uPlanetWorldPosition;
            uniform float uPlanetRadius;
            varying vec2 vUv;
            varying vec3 vWorldNormal;
            varying vec3 vWorldPosition;
            void main() {
              vec3 tex = texture2D(uSurfaceTex, vUv).rgb;
              vec3 N = normalize(vWorldNormal);
              vec3 toSun = uSunWorldPosition - vWorldPosition;
              float distToSun = length(toSun);
              vec3 L = toSun / max(distToSun, 0.0001);
              float ndotl = dot(N, L);
              float distanceBrightness = clamp(pow(260.0 / max(distToSun, 85.0), 0.42) * 1.95, 0.72, 2.65);

              // Real-Time Parent Planet Umbra Shadow Occlusion:
              // When the moon passes behind its parent planet relative to the Sun, it enters the planet's dark shadow cone!
              float planetShadowFactor = 1.0;
              vec3 toPlanet = uPlanetWorldPosition - vWorldPosition;
              float projOnSunRay = dot(toPlanet, L);
              if (projOnSunRay > 0.0 && projOnSunRay < distToSun) {
                vec3 closestPoint = vWorldPosition + L * projOnSunRay;
                float perpDist = length(uPlanetWorldPosition - closestPoint);
                float umbra = 1.0 - smoothstep(uPlanetRadius * 0.82, uPlanetRadius * 1.15, perpDist);
                planetShadowFactor = 1.0 - umbra * 0.97;
              }

              float lit = smoothstep(-0.02, 0.10, ndotl) * uSunLightEnabled * planetShadowFactor;
              vec3 col = tex * (pow(max(0.0, ndotl), 0.75) * distanceBrightness * lit);
              gl_FragColor = vec4(col, 1.0);
            }
          `,
        });

        const mGeo = new THREE.SphereGeometry(mSpec.radius3D, 24, 24);
        // Phobos & Deimos are slightly Potato/Triaxial Ellipsoid shaped!
        if (mSpec.id === 'phobos' || mSpec.id === 'deimos') {
          mGeo.scale(1.28, 0.86, 0.94);
        }
        const mMesh = new THREE.Mesh(mGeo, mMat);
        mOrbitGroup.add(mMesh);

        // 3D Shadow Cone (Umbra) projected behind each planetary moon opposite to the Sun
        const mShadowCone = createBodyShadowCone(mSpec.radius3D, Math.max(2.5, orbitRadius3D * 1.15));
        mMesh.add(mShadowCone.mesh);

        // Titan's golden atmospheric halo glow!
        if (mSpec.id === 'titan') {
          const titanHalo = new THREE.Mesh(
            new THREE.SphereGeometry(mSpec.radius3D * 1.14, 24, 24),
            new THREE.MeshBasicMaterial({
              color: 0xf59e0b,
              transparent: true,
              opacity: 0.25,
              side: THREE.BackSide,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            })
          );
          mMesh.add(titanHalo);
        }

        const mLabel = createPlanetLabelSprite(`🌕 ${mSpec.namePt}`, mSpec.colorHex);
        mLabel.scale.set(0.075, 0.017, 1);
        mOrbitGroup.add(mLabel);

        moonEntries.push({
          moonSpec: mSpec,
          orbitGroup: mOrbitGroup,
          moonMesh: mMesh,
          shadowCone: mShadowCone,
          orbitLine: mOrbitLine,
          labelSprite: mLabel,
          uniforms: mUniforms,
          orbitRadius3D,
          initialPhaseRad: mIdx * 1.65 + 0.4,
        });
      });

      pUniforms.uMoonCount.value = moonEntries.length;
      moonEntries.forEach((mEntry, idx) => {
        if (idx < 4) {
          pUniforms.uMoonRadii.value[idx] = mEntry.moonSpec.radius3D;
        }
      });

      otherPlanetsMap.set(spec.id, {
        spec,
        systemGroup: sysGroup,
        spinMesh: pMesh,
        uniforms: pUniforms,
        ringUniforms,
        shadowCone,
        labelSprite: label,
        moons: moonEntries,
      });
    });

    // Asteroid Belt between Mars (396 un) and Jupiter (780 un) — lit strictly by the Central Sun
    // with 50% day / 50% night terminator AND individual 3D Umbra Shadow Cones projected away from the Sun!
    const asteroidCount = 700;
    const asteroidGeo = new THREE.DodecahedronGeometry(0.62, 0);
    const asteroidUniforms = {
      uSunLightEnabled: { value: 1.0 },
      uSunOcclusionRadius: { value: 28.0 },
    };
    const asteroidMat = new THREE.ShaderMaterial({
      uniforms: asteroidUniforms,
      vertexShader: `
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main() {
          vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
          vWorldPosition = wp.xyz;
          vWorldNormal = normalize((modelMatrix * instanceMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform float uSunLightEnabled;
        uniform float uSunOcclusionRadius;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main() {
          // Oclusão geométrica pelo Sol Central: Se o asteroide estiver ATRÁS do Sol na linha de visão, ele é ocultado
          vec3 rayDir = normalize(vWorldPosition - cameraPosition);
          float distToAst = length(vWorldPosition - cameraPosition);
          float projSun = dot(-cameraPosition, rayDir);

          if (projSun > 0.0 && distToAst > projSun) {
            vec3 closestPoint = cameraPosition + rayDir * projSun;
            float perpDist = length(closestPoint);
            // Raio de oclusão do Sol (fotosfera de 15 un + brilho intenso da coroa até ~28-36 un)
            if (perpDist < uSunOcclusionRadius) {
              discard;
            } else if (perpDist < uSunOcclusionRadius + 8.0) {
              float edgeGlare = smoothstep(uSunOcclusionRadius, uSunOcclusionRadius + 8.0, perpDist);
              if (edgeGlare < 0.02) discard;
            }
          }

          vec3 N = normalize(vWorldNormal);
          vec3 L = normalize(-vWorldPosition); // Central Sun is at (0,0,0)
          float ndotl = dot(N, L);
          // Strict terminator: sunlit inner face (toward Sun) is bright rocky grey-brown, outer face (away from Sun) is in deep shadow
          float lit = smoothstep(-0.05, 0.15, ndotl) * uSunLightEnabled;
          vec3 rockLit = vec3(0.76, 0.73, 0.68);
          vec3 rockDark = vec3(0.03, 0.035, 0.05);
          vec3 col = mix(rockDark, rockLit * (0.35 + 0.85 * max(0.0, ndotl)), lit);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    const asteroidBeltMesh = new THREE.InstancedMesh(asteroidGeo, asteroidMat, asteroidCount);

    // Instanced 3D Shadow Cones behind each asteroid (pointing radially away from the Central Sun at 0,0,0)
    const astShadowLen = 8.5;
    const astShadowGeo = new THREE.CylinderGeometry(0.10, 0.58, astShadowLen, 12, 1, true);
    astShadowGeo.rotateX(Math.PI / 2);
    astShadowGeo.translate(0, 0, astShadowLen * 0.5);
    const astShadowMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uSunLightEnabled: asteroidUniforms.uSunLightEnabled,
        uSunOcclusionRadius: asteroidUniforms.uSunOcclusionRadius,
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        void main() {
          vUv = uv;
          vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
          vWorldPosition = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform float uSunLightEnabled;
        uniform float uSunOcclusionRadius;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        void main() {
          // Oclusão pelo Sol Central se a sombra estiver atrás do Sol
          vec3 rayDir = normalize(vWorldPosition - cameraPosition);
          float distToShadow = length(vWorldPosition - cameraPosition);
          float projSun = dot(-cameraPosition, rayDir);
          if (projSun > 0.0 && distToShadow > projSun) {
            vec3 closestPoint = cameraPosition + rayDir * projSun;
            if (length(closestPoint) < uSunOcclusionRadius + 6.0) {
              discard;
            }
          }

          float distFromRock = vUv.y;
          float fadeAlong = pow(clamp(1.0 - distFromRock, 0.0, 1.0), 1.4);
          float alpha = 0.72 * fadeAlong * uSunLightEnabled;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(0.0, 0.0, 0.015, alpha);
        }
      `,
    });
    const asteroidShadowsMesh = new THREE.InstancedMesh(astShadowGeo, astShadowMat, asteroidCount);
    asteroidShadowsMesh.renderOrder = 0;

    const astDummy = new THREE.Object3D();
    const shadowDummy = new THREE.Object3D();
    for (let i = 0; i < asteroidCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 540.0 + (Math.random() - 0.5) * 90.0;
      const y = (Math.random() - 0.5) * 14.0;
      const px = Math.cos(a) * r;
      const pz = -Math.sin(a) * r;

      astDummy.position.set(px, y, pz);
      const s = 0.55 + Math.random() * 1.45;
      astDummy.scale.set(s, s * 0.82, s);
      astDummy.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      astDummy.updateMatrix();
      asteroidBeltMesh.setMatrixAt(i, astDummy.matrix);

      // Orient each asteroid's shadow cone strictly away from the Sun (0,0,0) -> (px * 2, y * 2, pz * 2)
      shadowDummy.position.set(px, y, pz);
      shadowDummy.scale.set(s, s * 0.82, s);
      shadowDummy.lookAt(px * 2.0, y * 2.0, pz * 2.0);
      shadowDummy.updateMatrix();
      asteroidShadowsMesh.setMatrixAt(i, shadowDummy.matrix);
    }
    asteroidBeltMesh.instanceMatrix.needsUpdate = true;
    asteroidShadowsMesh.instanceMatrix.needsUpdate = true;

    const asteroidBeltGroup = new THREE.Group();
    asteroidBeltGroup.add(asteroidBeltMesh);
    asteroidBeltGroup.add(asteroidShadowsMesh);
    scene.add(asteroidBeltGroup);

    // Local Ambient & Directional Sun Light for Human Surface View on the Globe
    const humanAmbientLight = new THREE.AmbientLight(0xffffff, 0.0);
    scene.add(humanAmbientLight);
    const humanDirLight = new THREE.DirectionalLight(0xfffaed, 0.0);
    scene.add(humanDirLight);

    // Dedicated Local Sun, Moon & Starry Planets Sky Discs at r = 40.0..45.0 around the Human Observer (inside the 119.4 Atmospheric Sky Dome!)
    const humanSunSkyGroup = new THREE.Group();
    const humanSunMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: true,
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
          float facing = clamp(dot(N, V), 0.0, 1.0);
          vec3 coreWhite = vec3(1.0, 1.0, 0.98);
          vec3 limbGold = vec3(1.0, 0.86, 0.38);
          vec3 sunBase = mix(limbGold, coreWhite, pow(facing, 0.40));
          gl_FragColor = vec4(sunBase, 1.0);
        }
      `,
    });
    const humanSunMesh = new THREE.Mesh(new THREE.SphereGeometry(0.19, 48, 48), humanSunMat);
    humanSunMesh.renderOrder = 2;
    humanSunSkyGroup.add(humanSunMesh);

    const humanSunCoronaSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: generateSolarCoronaTexture(),
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
        depthTest: true,
      })
    );
    humanSunCoronaSprite.renderOrder = 2;
    humanSunCoronaSprite.scale.set(1.25, 1.25, 1);
    humanSunSkyGroup.add(humanSunCoronaSprite);

    const humanSunSparkle = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: generateSunSparkleTexture(),
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.96,
        depthWrite: false,
        depthTest: true,
        toneMapped: false,
      })
    );
    humanSunSparkle.renderOrder = 3;
    humanSunSparkle.scale.set(1.85, 1.85, 1);
    humanSunSkyGroup.add(humanSunSparkle);
    humanSunSkyGroup.visible = false;
    scene.add(humanSunSkyGroup);

    // Realistic Human Sky Moon with True Astronomical Phase Direction (from Central Sun to Real Moon) + Zero Dark-Side Light Bleed
    const humanMoonSkyGroup = new THREE.Group();
    const humanMoonUniforms = {
      uMoonTexture: { value: moonTex },
      uSunLightDir: { value: new THREE.Vector3(1, 0, 0) },
      uEarthShadowOcclusion: { value: 1.0 },
      uDaylightFactor: { value: 0.0 },
      uLunarEclipseActive: { value: 0.0 },
      uBloodMoonFactor: { value: 0.0 },
      uSolarEclipseFactor: { value: 0.0 },
      uSunLightEnabled: { value: 1.0 },
    };
    const humanMoonMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: true,
      uniforms: humanMoonUniforms,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main() {
          vUv = uv;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPosition = wp.xyz;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform sampler2D uMoonTexture;
        uniform vec3 uSunLightDir;
        uniform float uEarthShadowOcclusion;
        uniform float uDaylightFactor;
        uniform float uLunarEclipseActive;
        uniform float uBloodMoonFactor;
        uniform float uSolarEclipseFactor;
        uniform float uSunLightEnabled;
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main() {
          vec3 tex = texture2D(uMoonTexture, vUv).rgb;
          vec3 N = normalize(vWorldNormal);
          vec3 L = normalize(uSunLightDir);
          vec3 V = normalize(cameraPosition - vWorldPosition);

          float ndotl = dot(N, L);
          float ndotv = max(0.0, dot(N, V));

          // 1. Soft, natural lunar terminator (eliminates any black fringe!)
          float directSunlight = smoothstep(-0.02, 0.14, ndotl) * uSunLightEnabled * uEarthShadowOcclusion;

          // 2. Authentic Hapke / Lommel-Seeliger Lunar Regolith Reflectance:
          // Unlike a shiny plastic ball, the real Moon's porous dust scatters light uniformly right out to its outer limb!
          float lommelSeeliger = max(0.0, ndotl) / max(0.14, max(0.0, ndotl) + ndotv * 0.65);
          float regolithAlbedo = mix(pow(max(0.0, ndotl), 0.55), lommelSeeliger * 1.45, 0.62);

          // Subtle topographic contrast between dark basaltic Maria and bright anorthositic Highlands
          float luma = dot(tex, vec3(0.299, 0.587, 0.114));
          vec3 crispMoonTex = mix(vec3(luma), tex, 0.65);
          crispMoonTex = smoothstep(0.12, 0.92, crispMoonTex);

          // Nighttime Moon: brilliant pearlescent silver-white
          vec3 nightMoonCol = (vec3(0.28, 0.30, 0.34) + crispMoonTex * 0.85) * (0.35 + 1.45 * regolithAlbedo) * vec3(0.98, 0.99, 1.04);

          // Daytime Moon in the Blue Sky (exact match to real daytime photography):
          // Atmospheric Rayleigh blue sky light sits IN FRONT of the Moon, so the Moon's dark side is 100% sky-blue,
          // and the sunlit crescent appears as a chalky, alabaster pale-white floating in the blue sky!
          vec3 dayChalkWhite = mix(vec3(0.68, 0.82, 0.98), vec3(0.96, 0.98, 1.0), 0.45 + 0.55 * crispMoonTex.r);
          vec3 dayMoonCol = dayChalkWhite * (0.55 + 0.65 * regolithAlbedo);

          vec3 litColor = mix(nightMoonCol, dayMoonCol, uDaylightFactor);

          // In standard daytime, unlit side dissolves into atmosphere sky blue:
          float nightShadowAlpha = (1.0 - smoothstep(0.02, 0.20, uDaylightFactor)) * 0.96;
          vec3 nightDarkEarthshine = crispMoonTex * vec3(0.018, 0.024, 0.038);

          vec3 finalColor = mix(mix(nightDarkEarthshine, litColor, uDaylightFactor), litColor, directSunlight);
          float dayLitMaxAlpha = mix(1.0, 0.78, uDaylightFactor);
          float alpha = mix(nightShadowAlpha, dayLitMaxAlpha * directSunlight, directSunlight);

          // Soft anti-aliased outer circular limb of the Moon sphere
          float limbSoftness = smoothstep(0.0, 0.16, ndotv);
          alpha *= limbSoftness;

          // LUNAR ECLIPSE (Blood Moon): deep crimson projection into Earth's umbra
          if (uLunarEclipseActive > 0.5) {
            vec3 bloodCol = vec3(1.05, 0.20, 0.04) * (tex * 1.65 + vec3(0.14, 0.02, 0.01));
            finalColor = mix(finalColor, bloodCol, uBloodMoonFactor);
            alpha = max(alpha, uBloodMoonFactor * 0.98 * limbSoftness);
          }

          // SOLAR ECLIPSE OCCULTATION:
          // In authentic solar eclipse astronomy and human visual perception,
          // the Moon silhouette is 100% pitch black (vec3(0.0)), perfectly opaque,
          // with zero crater rays, zero texture highlights, zero specks, and zero transparency.
          if (uSolarEclipseFactor > 0.001) {
            float eclipseBlend = smoothstep(0.001, 0.25, uSolarEclipseFactor);
            finalColor = mix(finalColor, vec3(0.0, 0.0, 0.0), eclipseBlend);
            alpha = mix(alpha, 1.0, eclipseBlend);
          }

          if (alpha < 0.005) discard;
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
    });
    const humanMoonMesh = new THREE.Mesh(new THREE.SphereGeometry(0.202, 64, 64), humanMoonMat);
    humanMoonMesh.renderOrder = 4;
    humanMoonSkyGroup.add(humanMoonMesh);
    humanMoonSkyGroup.visible = false;
    scene.add(humanMoonSkyGroup);

    // Dedicated Local Sky Planet Points at r = 45.0 for Human Surface View (so they sit inside the r=119.4 sky dome!)
    const humanSkyPlanetsMap = new Map<
      SolarSystemTargetId,
      { group: THREE.Group; dotMat: THREE.MeshBasicMaterial; sparkle: THREE.Sprite; label: THREE.Sprite }
    >();
    SOLAR_SYSTEM_PLANETS.forEach((spec) => {
      if (spec.id === 'earth') return;
      const g = new THREE.Group();
      // Mathematically calibrated apparent size in the sky dome (r = 45.0):
      // Planet discs are stellar pinpoints to the human naked eye (~10-50 arcseconds = 0.003° - 0.014°).
      // Radius 0.012 to 0.018 represents a crisp, delicate pinpoint star (NOT a giant second Sun)!
      const isBrilliant = spec.id === 'venus' || spec.id === 'jupiter';
      const dotRadius = spec.id === 'venus' ? 0.018 : spec.id === 'jupiter' ? 0.014 : 0.010;
      const dotMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(spec.colorHex),
        transparent: true,
        opacity: 1.0,
      });
      const dotMesh = new THREE.Mesh(new THREE.SphereGeometry(dotRadius, 16, 16), dotMat);
      g.add(dotMesh);

      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: generateStarSparkleTexture(spec.id === 'venus' ? '#fffdf0' : spec.colorHex),
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: isBrilliant ? 0.75 : 0.55,
          depthWrite: false,
          toneMapped: false,
        })
      );
      // Subtle optical diffraction twinkle (scaled down by 8x so it looks like a real distant planet)
      const spScale = spec.id === 'venus' ? 0.22 : spec.id === 'jupiter' ? 0.17 : 0.11;
      sp.scale.set(spScale, spScale, 1);
      g.add(sp);

      const lbl = createPlanetLabelSprite(
        spec.id === 'venus' ? `✦ Vênus` : `✦ ${spec.namePt}`,
        spec.colorHex
      );
      lbl.scale.set(1.4, 0.35, 1);
      lbl.position.set(0, 0.20, 0);
      g.add(lbl);

      g.visible = false;
      scene.add(g);
      humanSkyPlanetsMap.set(spec.id, { group: g, dotMat, sparkle: sp, label: lbl });
    });

    // Custom events for Human Surface HUD controls (Compass N/E/S/W, Look at Sun/Moon/Planets, Eye Height, FOV)
    let requestLookAtTarget: string | null = null;
    const handleHumanLookAngles = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        if (typeof detail.azimuth === 'number') humanLookRef.current.azimuth = detail.azimuth;
        if (typeof detail.pitch === 'number') humanLookRef.current.pitch = clampHumanPitch(detail.pitch);
      }
    };
    const handleHumanLookAtAstro = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.astroId) {
        requestLookAtTarget = detail.astroId;
      }
    };
    const handleHumanSetFov = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail?.fov === 'number') {
        humanLookRef.current.fov = clampHumanFov(detail.fov);
        camera.fov = humanLookRef.current.fov;
        camera.updateProjectionMatrix();
      }
    };
    const handleHumanSetEyeHeight = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail?.height === 'number') {
        humanLookRef.current.eyeHeight = THREE.MathUtils.clamp(detail.height, 0.01, 0.25);
      }
    };
    const handleGlobeSetPreset = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.preset) {
        globeConfigRef.current.globeCameraPreset = detail.preset;
      }
    };
    window.addEventListener('globe-human-look-angles', handleHumanLookAngles);
    window.addEventListener('globe-human-look-at-astro', handleHumanLookAtAstro);
    window.addEventListener('globe-human-set-fov', handleHumanSetFov);
    window.addEventListener('globe-human-set-eye-height', handleHumanSetEyeHeight);
    window.addEventListener('globe-set-camera-preset', handleGlobeSetPreset);

    // =========================================================================
    // 7. POINTER & MULTI-TOUCH PINCH-TO-ZOOM INTERACTION
    // =========================================================================
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let pointerDownX = 0;
    let pointerDownY = 0;
    const activePointers = new Map<number, { x: number; y: number }>();
    let lastPinchDist: number | null = null;
    const raycaster = new THREE.Raycaster();

    const handlePointerDown = (e: PointerEvent) => {
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.size === 2) {
        isDragging = false;
        const pts = Array.from(activePointers.values());
        lastPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        return;
      }

      if (activePointers.size === 1) {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        pointerDownX = e.clientX;
        pointerDownY = e.clientY;
        lastPinchDist = null;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (activePointers.has(e.pointerId)) {
        activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      // 1. Two-finger Pinch-to-Zoom on Mobile / Touchscreens
      if (activePointers.size === 2) {
        const pts = Array.from(activePointers.values());
        const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (lastPinchDist !== null && lastPinchDist > 5 && currentDist > 5) {
          const deltaDist = currentDist - lastPinchDist;
          if (globeConfigRef.current.globeCameraPreset === 'human_surface') {
            // Pinch out (deltaDist > 0) = zoom in (lower FOV); Pinch in (deltaDist < 0) = zoom out (clamped by clampHumanFov)
            humanLookRef.current.fov = clampHumanFov(humanLookRef.current.fov - deltaDist * 0.14);
            camera.fov = humanLookRef.current.fov;
            camera.updateProjectionMatrix();
          } else {
            // Proportional exponential zoom across Solar System (up to 7800) and close Earth/Moon orbit (down to 1.4)
            const zoomFactor = Math.exp(-deltaDist * 0.0068);
            orbitAnglesRef.current.distance = THREE.MathUtils.clamp(
              orbitAnglesRef.current.distance * zoomFactor,
              1.4,
              7800.0
            );
          }
        }
        lastPinchDist = currentDist;
        return;
      }

      // 2. Single-finger / Mouse Orbit & Look
      if (!isDragging || activePointers.size > 1) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      if (globeConfigRef.current.globeCameraPreset === 'human_surface') {
        applyHumanLookDrag(humanLookRef.current, dx, dy, true, true);
        broadcastHumanCameraAngles(humanLookRef.current.azimuth, humanLookRef.current.pitch);
      } else {
        orbitAnglesRef.current.theta -= dx * 0.0065;
        orbitAnglesRef.current.phi = THREE.MathUtils.clamp(
          orbitAnglesRef.current.phi - dy * 0.0065,
          0.08,
          Math.PI - 0.08
        );
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      const wasSingleTouch = activePointers.size === 1 && isDragging;
      activePointers.delete(e.pointerId);

      if (activePointers.size < 2) {
        lastPinchDist = null;
      }

      if (activePointers.size === 1) {
        // Smoothly transition from 2 fingers back to 1 finger without jumping
        const remaining = Array.from(activePointers.values())[0];
        dragStartX = remaining.x;
        dragStartY = remaining.y;
        isDragging = true;
        return;
      }

      if (!wasSingleTouch) {
        isDragging = false;
        return;
      }
      isDragging = false;

      const moveDist = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
      if (moveDist < 5 && globeConfigRef.current.globeCameraPreset !== 'human_surface') {
        const rect = renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObject(earthMesh, false);
        if (hits.length > 0) {
          const worldHit = hits[0].point.clone();
          const localHit = earthSpinGroup.worldToLocal(worldHit);
          const geo = sphereVectorToLatLng(localHit);
          const nearest = findNearestCity(geo.lat, geo.lng, 350);
          const store = useSimulationStore.getState();
          store.updateSettings({
            observerLat: geo.lat,
            observerLng: geo.lng,
            observerLocationName: nearest
              ? `${nearest.namePt || nearest.name}, ${nearest.countryPt || nearest.country}`
              : `Coordenada (${geo.lat.toFixed(2)}°, ${geo.lng.toFixed(2)}°)`,
          });
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (globeConfigRef.current.globeCameraPreset === 'human_surface') {
        humanLookRef.current.fov = clampHumanFov(humanLookRef.current.fov + e.deltaY * 0.035);
        camera.fov = humanLookRef.current.fov;
        camera.updateProjectionMatrix();
      } else {
        orbitAnglesRef.current.distance = THREE.MathUtils.clamp(
          orbitAnglesRef.current.distance * (1 + e.deltaY * 0.0014),
          1.4,
          7800.0
        );
      }
    };

    const domElem = renderer.domElement;
    domElem.style.touchAction = 'none';
    domElem.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    domElem.addEventListener('wheel', handleWheel, { passive: false });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // =========================================================================
    // 8. MAIN ANIMATION LOOP
    // =========================================================================
    let lastTime = performance.now();
    let accumulatedCloudTime = 0;
    let animId = 0;

    const J2026_MS = Date.UTC(2026, 0, 1, 0, 0, 0);

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const store = useSimulationStore.getState();
      if (store.isPlaying) {
        store.addTime(dt * store.playbackSpeed);
      }

      const absPlaybackSpeed = Math.abs(store.playbackSpeed || 1);
      const timeCloudMultiplier = store.isPlaying
        ? (absPlaybackSpeed <= 1
            ? 1.0
            : Math.min(80.0, 1.0 + Math.pow(absPlaybackSpeed, 0.36) * 1.15))
        : 0.15;
      accumulatedCloudTime += dt * timeCloudMultiplier;

      const cfg = globeConfigRef.current;
      const currentDate = store.currentDate;
      const isHumanSurface = cfg.globeCameraPreset === 'human_surface';
      const isSunLit = store.settings.sunLightEnabled !== false;

      const daysSinceEpoch = (currentDate.getTime() - J2026_MS) / (1000 * 86400);

      // 1. Update Central 3D Sun at (0, 0, 0)
      sunGroup.position.set(0, 0, 0);
      sunGroup.visible = isSunLit;
      const solarIntensityMult = (store.settings.solarIntensity || 2.0) / 2.0;
      sunPointLight.intensity = isSunLit ? 10.0 * solarIntensityMult : 0.0;
      sunPhotosphereMat.uniforms.uTime.value = now * 0.001;
      sunProminencesMat.uniforms.uTime.value = now * 0.001;
      sunCoronaHaloMat.uniforms.uTime.value = now * 0.001;
      solar3DVolumeGroup.visible = isSunLit && !isHumanSurface;
      solarVolumeMats.forEach((m) => {
        m.uniforms.uIntensity.value = isSunLit ? solarIntensityMult : 0.0;
      });
      sunLabel.visible = cfg.showPlanetLabels && !isHumanSurface;

      const pulse1 = Math.sin(now * 0.0022) * 0.5 + 0.5;
      const pulse2 = Math.cos(now * 0.0037) * 0.5 + 0.5;
      // In Human Surface View, scale the Sun at distance 260 so its apparent angular diameter is exact 0.53°!
      if (isHumanSurface) {
        sunGroup.scale.setScalar(1.2025 / sunRadius); // Mantém diâmetro angular exato de 0.53° na visão da superfície
      } else {
        sunGroup.scale.setScalar(1.0);
      }
      const sunScale = 24.0 * (0.94 + 0.12 * (pulse1 * 0.6 + pulse2 * 0.4));
      sunSparkleSprite.scale.set(sunScale, sunScale, 1);

      // 2. Update Earth's Heliocentric Orbital Position around the Central Sun (r = 260.0 = 1.000 AU)
      const earthOrbitAngle = getContinuousEarthOrbitAngleRad(currentDate);
      const earthX = Math.cos(earthOrbitAngle) * EARTH_ORBIT_RADIUS;
      const earthZ = -Math.sin(earthOrbitAngle) * EARTH_ORBIT_RADIUS;
      earthSystemGroup.position.set(earthX, 0, earthZ);

      const effectiveTiltDeg = cfg.axialTiltDeg ?? 23.44;
      const tiltRad = (effectiveTiltDeg * Math.PI) / 180;
      earthTiltGroup.rotation.set(0, 0, -tiltRad);

      // Compute true UTC hours from the simulation's local wall-clock time (currentDate.getHours())
      // using the observer's timezone offset (getLocationUtcOffsetHours), so teleporting to any city
      // displays that city's local clock AND positions the 3D Sun/Earth at the exact matching solar angle!
      const obsUtcOffsetHrs = getLocationUtcOffsetHours(
        store.settings.observerLat,
        store.settings.observerLng
      );
      const localClockHours =
        currentDate.getHours() +
        currentDate.getMinutes() / 60 +
        currentDate.getSeconds() / 3600 +
        currentDate.getMilliseconds() / 3600000;
      const utcHours = ((localClockHours - obsUtcOffsetHrs) % 24 + 24) % 24;
      const subsolarLngDeg = (12.0 - utcHours) * 15.0;
      const subsolarLngRad = (subsolarLngDeg * Math.PI) / 180;

      const angleEarthToSun = Math.atan2(-earthX, -earthZ);
      earthSpinGroup.rotation.y = angleEarthToSun - subsolarLngRad;

      // 3. Update Terminator Ring & Earth 3D Shadow Cone (pointing strictly away from the Sun)
      terminatorGroup.lookAt(0, 0, 0);
      terminatorGroup.visible = cfg.showTerminatorRing && isSunLit && !isHumanSurface;

      const earthAntiSunTarget = earthSystemGroup.position.clone().multiplyScalar(2.0);
      earthShadowCone.mesh.lookAt(earthAntiSunTarget);
      earthShadowCone.mesh.visible = isSunLit && !isHumanSurface;
      earthShadowCone.mat.uniforms.uEnabled.value = isSunLit ? 1.0 : 0.0;
      occluderPositions[2].copy(earthSystemGroup.position);

      // 4. Update Earth Shader Uniforms
      earthUniforms.uSunWorldPosition.value.set(0, 0, 0);
      earthUniforms.uSunIntensity.value = store.settings.solarIntensity || 2.0;
      earthUniforms.uSunLightEnabled.value = isSunLit ? 1.0 : 0.0;
      earthUniforms.uShowCityLights.value = store.layers.showCityLights ? 1.0 : 0.0;
      earthUniforms.uMapColorMode.value = store.layers.mapColorTheme === 'hypsometric' ? 1.0 : 0.0;
      earthUniforms.uDisplacementScale.value =
        store.layers.showMountainRelief3D !== false ? (store.layers.mountainDisplacementScale || 1.2) * 0.018 : 0.0;
      earthUniforms.uShowRealisticWater.value = store.layers.showRealisticWater !== false ? 1.0 : 0.0;
      const showCloudsNow = cfg.showClouds3D !== false;
      earthUniforms.uShowClouds.value = showCloudsNow ? 1.0 : 0.0;
      earthUniforms.uFullDaylight.value = store.settings.mapLightingMode === 'full_daylight' ? 1.0 : 0.0;
      earthUniforms.uTime.value = accumulatedCloudTime;

      atmoUniforms.uSunWorldPosition.value.set(0, 0, 0);
      atmoUniforms.uSunLightEnabled.value = isSunLit ? 1.0 : 0.0;
      atmoHaloMesh.visible = cfg.showAtmosphereHalo && store.layers.showAtmosphere && !isHumanSurface;

      cloudSphereUniforms.uSunWorldPosition.value.set(0, 0, 0);
      cloudSphereUniforms.uSunLightEnabled.value = isSunLit ? 1.0 : 0.0;
      cloudSphereUniforms.uFullDaylight.value = store.settings.mapLightingMode === 'full_daylight' ? 1.0 : 0.0;
      cloudSphereUniforms.uTime.value = accumulatedCloudTime;
      cloudSphereMesh.visible = showCloudsNow && !isHumanSurface;

      auroraUniforms.uSunWorldPosition.value.set(0, 0, 0);
      auroraUniforms.uTime.value = now * 0.001;
      auroraMesh.visible = cfg.showAurora !== false && !isHumanSurface;

      // 5. Update Moon Orbiting the Earth with 5.14° Ecliptic Inclination & 19.34°/yr Retrograde Nodal Precession (18.6-yr cycle)
      // Generates the true astronomical behavior: 4 to 7 eclipses per year (only during Eclipse Seasons when Sun aligns with ☊ or ☋)
      const moonInclDeg = cfg.lunarInclinationDeg ?? 5.14;
      const lunarTelemetry = calculateLunarOrbitWithNodalPrecession(
        currentDate,
        earthOrbitAngle,
        moonOrbitRadius,
        moonInclDeg
      );
      const lunarPhaseAngle = lunarTelemetry.synodicPhaseRad;

      moonGroup.position.copy(lunarTelemetry.position3D);

      // Pinpoint shadow projection on the Earth globe during catalog solar/lunar eclipses
      const macroCatalogEclipse = findMatchingCatalogEclipse(currentDate);
      if (macroCatalogEclipse) {
        const diffSec = (currentDate.getTime() - macroCatalogEclipse.date.getTime()) / 1000;
        if (Math.abs(diffSec) <= 5400) {
          const blendWeight = Math.cos((diffSec / 5400.0) * (Math.PI / 2)) ** 2;
          if (macroCatalogEclipse.type === 'solar') {
            const surfaceLocalPos = latLngToSphereVector(
              macroCatalogEclipse.lat,
              macroCatalogEclipse.lng,
              GLOBE_RADIUS
            );
            const eclipseSpotWorld = surfaceLocalPos.clone().applyMatrix4(earthSpinGroup.matrixWorld);
            // Ray from the eclipse location on Earth towards the central Sun (0, 0, 0)
            const dirSpotToSun = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), eclipseSpotWorld).normalize();
            const v = new THREE.Vector3().subVectors(eclipseSpotWorld, earthSystemGroup.position);
            const vDotU = v.dot(dirSpotToSun);
            // Exact distance d from observer along dirSpotToSun where |v + dirSpotToSun * d| = moonOrbitRadius (6.0)
            const d = -vDotU + Math.sqrt(vDotU * vDotU + (moonOrbitRadius * moonOrbitRadius - 1.0));
            const moonAtTotalityWorld = eclipseSpotWorld.clone().addScaledVector(dirSpotToSun, d);
            const alignedMoonPos = moonAtTotalityWorld.clone().sub(earthSystemGroup.position);

            const northAxis = new THREE.Vector3(0, 1, 0).applyQuaternion(earthTiltGroup.quaternion).normalize();
            const orbitTangent = new THREE.Vector3().crossVectors(northAxis, dirSpotToSun).normalize();
            const transitProgress = diffSec / 4500.0;
            alignedMoonPos.addScaledVector(orbitTangent, transitProgress * 0.32);
            moonGroup.position.lerp(alignedMoonPos, blendWeight);
          } else if (macroCatalogEclipse.type === 'lunar') {
            const dirEarthAntiSun = earthSystemGroup.position.clone().normalize();
            const alignedMoonPos = dirEarthAntiSun.clone().multiplyScalar(moonOrbitRadius);
            const northAxis = new THREE.Vector3(0, 1, 0).applyQuaternion(earthTiltGroup.quaternion).normalize();
            const orbitTangent = new THREE.Vector3().crossVectors(northAxis, dirEarthAntiSun).normalize();
            alignedMoonPos.addScaledVector(orbitTangent, (diffSec / 5400.0) * 0.35);
            moonGroup.position.lerp(alignedMoonPos, blendWeight);
          }
        }
      }

      moonOrbitGroup.quaternion.copy(lunarTelemetry.orbitPlaneQuaternion);
      const showNodesNow = Boolean(cfg.showLunarNodes) && !isHumanSurface;
      nodeLine.visible = showNodesNow;
      ascNodeMarker.visible = showNodesNow;
      descNodeMarker.visible = showNodesNow;
      ascNodeLabel.visible = showNodesNow && cfg.showPlanetLabels;
      descNodeLabel.visible = showNodesNow && cfg.showPlanetLabels;
      eclipticRefRing.visible = showNodesNow;

      // Tidal locking: Moon always keeps the same face towards the Earth
      moonMesh.rotation.y = lunarTelemetry.tidalLockRotationY;

      // In Human Surface View, scale the Moon at distance 6.0 so its apparent angular diameter is exact 0.518° (just like 384,400 km / 60.34 R_Earth)!
      moonGroup.scale.setScalar(isHumanSurface ? 0.0995 : 1.0);
      moonLabel.visible = cfg.showPlanetLabels && !isHumanSurface;

      earthSystemGroup.updateMatrixWorld(true);
      const moonWorldPosVec = new THREE.Vector3();
      moonGroup.getWorldPosition(moonWorldPosVec);

      moonUniforms.uSunWorldPosition.value.set(0, 0, 0);
      moonUniforms.uEarthWorldPosition.value.copy(earthSystemGroup.position);
      moonUniforms.uEarthRadius.value = GLOBE_RADIUS;
      moonUniforms.uSunLightEnabled.value = isSunLit ? 1.0 : 0.0;

      earthUniforms.uMoonWorldPosition.value.copy(moonWorldPosVec);
      cloudSphereUniforms.uMoonWorldPosition.value.copy(moonWorldPosVec);
      occluderPositions[3].copy(moonWorldPosVec);

      const moonAntiSunTarget = moonWorldPosVec.clone().multiplyScalar(2.0);
      moonShadowCone.mesh.lookAt(moonAntiSunTarget);
      moonShadowCone.mesh.visible = isSunLit && !isHumanSurface;
      moonShadowCone.mat.uniforms.uEnabled.value = isSunLit ? 1.0 : 0.0;

      moonGroup.visible = store.layers.showPlanets;
      moonOrbitGroup.visible = cfg.showPlanetOrbits && !isHumanSurface;

      // 6. Update All Other Planets in Keplerian Orbits around the Central Sun
      const occluderIndexMap: Record<string, number> = {
        mercury: 0,
        venus: 1,
        mars: 4,
        jupiter: 5,
        saturn: 6,
        uranus: 7,
        neptune: 8,
      };
      otherPlanetsMap.forEach((entry) => {
        const { spec, systemGroup, spinMesh, uniforms, ringUniforms, shadowCone, labelSprite, moons } = entry;
        const meanAngleRad =
          ((spec.initialMeanLongitudeDeg * Math.PI) / 180) +
          (daysSinceEpoch / spec.orbitalPeriodDays) * Math.PI * 2;
        const incRad = (spec.orbitalInclinationDeg * Math.PI) / 180;

        const px = Math.cos(meanAngleRad) * spec.orbitRadius;
        const pz = -Math.sin(meanAngleRad) * spec.orbitRadius;
        const py = Math.sin(meanAngleRad) * Math.sin(incRad) * spec.orbitRadius;

        systemGroup.position.set(px, py, pz);

        const occIdx = occluderIndexMap[spec.id];
        if (occIdx !== undefined) {
          occluderPositions[occIdx].set(px, py, pz);
        }

        // Orient 3D Shadow Cone strictly away from the Central Sun (0,0,0) behind the planet!
        shadowCone.mesh.lookAt(px * 2.0, py * 2.0, pz * 2.0);
        shadowCone.mesh.visible = isSunLit && !isHumanSurface;
        shadowCone.mat.uniforms.uEnabled.value = isSunLit ? 1.0 : 0.0;

        // In Human Surface View, planets are tens/hundreds of millions of km away:
        // they NEVER look like big spheres crossing the sky — they are pinpoint stars hidden in daytime!
        if (isHumanSurface) {
          systemGroup.scale.setScalar(0.06);
        } else {
          systemGroup.scale.setScalar(1.0);
        }
        systemGroup.visible = store.layers.showPlanets;

        const rotDays = spec.rotationPeriodHours / 24.0;
        spinMesh.rotation.y = (daysSinceEpoch / rotDays) * Math.PI * 2;

        uniforms.uSunWorldPosition.value.set(0, 0, 0);
        uniforms.uSunLightEnabled.value = isSunLit ? 1.0 : 0.0;
        if (ringUniforms) {
          ringUniforms.uSunLightEnabled.value = isSunLit ? 1.0 : 0.0;
          if (ringUniforms.uPlanetCenter) {
            ringUniforms.uPlanetCenter.value.set(px, py, pz);
          }
        }
        labelSprite.visible = cfg.showPlanetLabels && !isHumanSurface;

        // Update all natural moons orbiting this planet in real time!
        systemGroup.updateMatrixWorld(true);
        const tempMoonWorldPos = new THREE.Vector3();
        moons.forEach((mEntry, mIdx) => {
          const moonAngle =
            mEntry.initialPhaseRad + (daysSinceEpoch / mEntry.moonSpec.orbitalPeriodDays) * Math.PI * 2;
          const mx = Math.cos(moonAngle) * mEntry.orbitRadius3D;
          const mz = -Math.sin(moonAngle) * mEntry.orbitRadius3D;
          mEntry.moonMesh.position.set(mx, 0, mz);
          // Tidally locked to parent planet
          mEntry.moonMesh.rotation.y = moonAngle + Math.PI;
          mEntry.moonMesh.updateMatrixWorld(true);
          mEntry.moonMesh.getWorldPosition(tempMoonWorldPos);

          // Feed moon world position to parent planet shader so it casts real transit shadows on the planet!
          if (mIdx < 4) {
            uniforms.uMoonWorldPositions.value[mIdx].copy(tempMoonWorldPos);
            uniforms.uMoonRadii.value[mIdx] = mEntry.moonSpec.radius3D;
          }

          // Orient the moon's 3D shadow cone strictly away from the Central Sun (0,0,0)
          mEntry.shadowCone.mesh.lookAt(
            tempMoonWorldPos.x * 2.0,
            tempMoonWorldPos.y * 2.0,
            tempMoonWorldPos.z * 2.0
          );
          mEntry.shadowCone.mesh.visible = isSunLit && !isHumanSurface;
          mEntry.shadowCone.mat.uniforms.uEnabled.value = isSunLit ? 1.0 : 0.0;

          mEntry.labelSprite.position.set(mx, mEntry.moonSpec.radius3D + 0.45, mz);
          mEntry.labelSprite.visible = cfg.showPlanetLabels && !isHumanSurface;
          mEntry.orbitLine.visible = cfg.showPlanetOrbits && !isHumanSurface;
          mEntry.orbitGroup.visible = !isHumanSurface;
          mEntry.uniforms.uSunWorldPosition.value.set(0, 0, 0);
          mEntry.uniforms.uSunLightEnabled.value = isSunLit ? 1.0 : 0.0;
          mEntry.uniforms.uPlanetWorldPosition.value.set(px, py, pz);
          mEntry.uniforms.uPlanetRadius.value = spec.radius3D;
        });
      });

      planetOrbitsGroup.visible = cfg.showPlanetOrbits && !isHumanSurface;
      asteroidBeltGroup.visible = cfg.showAsteroidBelt && !isHumanSurface;
      asteroidBeltGroup.rotation.y = daysSinceEpoch * 0.0008;
      asteroidUniforms.uSunLightEnabled.value = isSunLit ? 1.0 : 0.0;
      earthLabel.visible = cfg.showPlanetLabels && !isHumanSurface;

      // 7. Update Earth Overlays & GPS Observer Pin
      axisGroup.visible = cfg.showAxialTilt && !isHumanSurface;
      sphericalGridGroup.visible = cfg.showSphericalGrid && !isHumanSurface;
      tropicsGroup.visible = cfg.showTropicsAndCircles && !isHumanSurface;
      citiesGlobeGroup.visible = false;

      const obsLocalPos = latLngToSphereVector(
        store.settings.observerLat,
        store.settings.observerLng,
        GLOBE_RADIUS + 0.02
      );
      observerPinGroup.position.copy(obsLocalPos);
      const obsNormalLocal = obsLocalPos.clone().normalize();
      observerPinGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), obsNormalLocal);
      observerPinGroup.visible = cfg.showObserverPin && !isHumanSurface;
      tangentHorizonGroup.visible = cfg.showObserverHorizonPlane && !isHumanSurface;

      // 8. Camera Presets & Focused Planet Target
      if (
        lastPresetRef.current !== cfg.globeCameraPreset ||
        lastFocusedBodyRef.current !== cfg.focusedBody
      ) {
        const presetChanged = lastPresetRef.current !== cfg.globeCameraPreset;
        lastPresetRef.current = cfg.globeCameraPreset;
        lastFocusedBodyRef.current = cfg.focusedBody;

        if (presetChanged) {
          const mobScale = window.innerWidth < 768 ? 1.28 : 1.0;
          if (cfg.globeCameraPreset === 'solar_system') {
            orbitAnglesRef.current.phi = 1.02;
            orbitAnglesRef.current.distance = 580.0 * mobScale;
          } else if (cfg.globeCameraPreset === 'earth_and_sun') {
            orbitAnglesRef.current.theta = Math.atan2(earthX, earthZ) + 0.22;
            orbitAnglesRef.current.phi = 1.36;
            orbitAnglesRef.current.distance = 6.0 * mobScale;
          } else if (cfg.globeCameraPreset === 'orbit') {
            orbitAnglesRef.current.distance = 4.5 * mobScale;
          } else if (cfg.globeCameraPreset === 'tilt_side') {
            orbitAnglesRef.current.theta = Math.atan2(earthX, earthZ) + Math.PI / 2;
            orbitAnglesRef.current.phi = Math.PI / 2;
            orbitAnglesRef.current.distance = 4.5 * mobScale;
          } else if (cfg.globeCameraPreset === 'north_pole') {
            orbitAnglesRef.current.phi = 0.12;
            orbitAnglesRef.current.distance = 4.2 * mobScale;
          } else if (cfg.globeCameraPreset === 'south_pole') {
            orbitAnglesRef.current.phi = Math.PI - 0.12;
            orbitAnglesRef.current.distance = 4.2 * mobScale;
          } else if (cfg.globeCameraPreset === 'observer_close') {
            orbitAnglesRef.current.distance = 3.0 * mobScale;
          }
        } else {
          const mobScale = window.innerWidth < 768 ? 1.28 : 1.0;
          if (cfg.focusedBody === 'solar_system') {
            orbitAnglesRef.current.distance = 580.0 * mobScale;
          } else if (cfg.focusedBody === 'sun') {
            orbitAnglesRef.current.distance = 72.0 * mobScale;
          } else if (cfg.focusedBody === 'earth') {
            orbitAnglesRef.current.distance = 4.5 * mobScale;
          } else if (cfg.focusedBody === 'moon') {
            orbitAnglesRef.current.distance = 2.1 * mobScale;
          } else {
            const pEntry = otherPlanetsMap.get(cfg.focusedBody);
            if (pEntry) {
              orbitAnglesRef.current.distance = Math.max(2.5, pEntry.spec.radius3D * 4.4) * mobScale;
            }
          }
        }
      }

      earthSystemGroup.updateMatrixWorld(true);

      // 9. Update Twinkling Stars & Camera Positioning
      spaceStarVault.sparkleMat.opacity = 0.82 + 0.16 * (Math.sin(now * 0.0035) * 0.5 + 0.5);

      if (isHumanSurface) {
        // Hide the macroscopic 3D Earth sphere & space objects so we render the ultra-realistic 1st-person Ground + Sky Dome
        earthMesh.visible = false;
        atmoHaloMesh.visible = false;
        sunGroup.visible = false;
        moonGroup.visible = false;
        scene.background = null;

        // Exact surface point on the rotating spherical Earth (radius = GLOBE_RADIUS)
        const surfaceLocalPos = latLngToSphereVector(
          store.settings.observerLat,
          store.settings.observerLng,
          GLOBE_RADIUS
        );
        const obsWorldPos = surfaceLocalPos.clone().applyMatrix4(earthSpinGroup.matrixWorld);
        const obsWorldNormal = obsWorldPos.clone().sub(earthSystemGroup.position).normalize();

        const northAxisWorld = new THREE.Vector3(0, 1, 0).applyQuaternion(earthTiltGroup.quaternion).normalize();
        let localEast = new THREE.Vector3().crossVectors(northAxisWorld, obsWorldNormal);
        if (localEast.lengthSq() < 1e-6) {
          localEast.set(1, 0, 0);
        } else {
          localEast.normalize();
        }
        const localNorth = new THREE.Vector3().crossVectors(obsWorldNormal, localEast).normalize();
        const localWest = localEast.clone().negate();
        const localSouth = localNorth.clone().negate();

        // Position 3D Ground Biome (Field/Trees/Mountains/Beach/City) tangent to the spherical surface at the observer's GPS point!
        // Note: ObserverEnvironment3D is built with local +X = North, +Y = Up (Zenith), +Z = East!
        humanObserverEnv.setVisible(true);
        humanObserverEnv.group.position.copy(obsWorldPos);
        const envBasis = new THREE.Matrix4().makeBasis(localNorth, obsWorldNormal, localEast);
        humanObserverEnv.group.quaternion.setFromRotationMatrix(envBasis);
        humanObserverEnv.setBiome(store.settings.observerBiome || 'field');

        // Atmospheric Sky Dome orientation: local +X = East, +Y = Up (Zenith), +Z = South
        const skyDomeBasis = new THREE.Matrix4().makeBasis(localEast, obsWorldNormal, localSouth);
        const tangentBasisQuat = new THREE.Quaternion().setFromRotationMatrix(skyDomeBasis);

        // Celestial Pole orientation: North Celestial Pole tilted at angle = observerLatitude above local North!
        const polePerp = new THREE.Vector3().crossVectors(localEast, northAxisWorld).normalize();
        const poleBasis = new THREE.Matrix4().makeBasis(localEast, northAxisWorld, polePerp);
        const celestialPoleQuat = new THREE.Quaternion().setFromRotationMatrix(poleBasis);

        // Eye height above ground (0.0018 = 1.75m human eye level in soil scale; 0.012 = high lookout over trees!)
        const isHighLookout = (humanLookRef.current.eyeHeight || 0.04) >= 0.07;
        const eyeOffsetAboveGround = isHighLookout ? 0.012 : 0.0018;
        const eyePos = obsWorldPos.clone().addScaledVector(obsWorldNormal, eyeOffsetAboveGround);
        camera.position.copy(eyePos);
        camera.up.copy(obsWorldNormal);
        if (camera.near !== 0.0002) {
          camera.near = 0.0002;
          camera.updateProjectionMatrix();
        }
        if (camera.fov !== humanLookRef.current.fov) {
          camera.fov = humanLookRef.current.fov;
          camera.updateProjectionMatrix();
        }

        // Local Sun direction in observer's spherical tangent frame (X=East, Y=Up/Zenith, Z=South)
        const toSunWorld = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), eyePos).normalize();
        const localSunDir = new THREE.Vector3(
          toSunWorld.dot(localEast),
          toSunWorld.dot(obsWorldNormal),
          toSunWorld.dot(localSouth)
        ).normalize();
        const sunAltDeg = (Math.asin(THREE.MathUtils.clamp(localSunDir.y, -1.0, 1.0)) * 180) / Math.PI;
        const sunAzDeg = ((Math.atan2(localSunDir.x, -localSunDir.z) * 180) / Math.PI + 360) % 360;

        // Local Moon direction in observer's spherical tangent frame using exact macroscopic moonWorldPosVec
        const toMoonWorld = new THREE.Vector3().subVectors(moonWorldPosVec, eyePos).normalize();
        const localMoonDir = new THREE.Vector3(
          toMoonWorld.dot(localEast),
          toMoonWorld.dot(obsWorldNormal),
          toMoonWorld.dot(localSouth)
        ).normalize();
        let moonAltDeg = (Math.asin(THREE.MathUtils.clamp(localMoonDir.y, -1.0, 1.0)) * 180) / Math.PI;
        let moonAzDeg = ((Math.atan2(localMoonDir.x, -localMoonDir.z) * 180) / Math.PI + 360) % 360;

        // Check if a catalog Solar or Lunar Eclipse is active at currentDate
        const catalogEclipse = findMatchingCatalogEclipse(currentDate);
        const isSolarEclipseNow = catalogEclipse?.type === 'solar';
        const isLunarEclipseNow = catalogEclipse?.type === 'lunar';

        // PURE PHYSICAL ASTRONOMICAL PERSPECTIVE:
        // Sightlines to the Sun and Moon in world space directly from observer's eye
        const cosSep = THREE.MathUtils.clamp(toSunWorld.dot(toMoonWorld), -1.0, 1.0);
        const sepAngleDeg = Math.acos(cosSep) * (180 / Math.PI);
        const sunAngularRadiusDeg = 0.53 / 2.0; // 0.265 deg
        const sunMoonDist = sepAngleDeg / sunAngularRadiusDeg;

        // An eclipse occurs if and only if the Moon is physically passing between the observer and the Sun!
        const isRealSolarEclipseActive = sunMoonDist < 2.05 && sunAltDeg > -3.5;
        const solarTotalityFactor = isRealSolarEclipseActive
          ? 1.0 - THREE.MathUtils.smoothstep(sunMoonDist, 0.0, 1.02)
          : 0.0;

        // Place Local 3D Sun & Moon Sky Discs at r = 40.0 around the observer (inside the r=119.4 sky dome and behind the r=20..32 mountains!)
        const sunSkyWorldPos = eyePos.clone().addScaledVector(toSunWorld, 40.0);
        humanSunSkyGroup.position.copy(sunSkyWorldPos);
        humanSunSkyGroup.visible = isSunLit && sunAltDeg > -3.5;

        if (isRealSolarEclipseActive) {
          // Solar Corona blazes into view as totality approaches
          const coronaVisibility = THREE.MathUtils.smoothstep(solarTotalityFactor, 0.35, 0.96);
          (humanSunCoronaSprite.material as THREE.SpriteMaterial).opacity = coronaVisibility * 1.0;

          // Glare and sparkle fades away as the Sun is blocked
          const sparkleVisibility = Math.max(0.0, 1.0 - solarTotalityFactor);
          (humanSunSparkle.material as THREE.SpriteMaterial).opacity = 0.92 * (sparkleVisibility ** 2.2);

          // In peak totality (> 0.92), the Moon completely covers the solar photosphere:
          // hide the golden Sun disc so no crescent sliver peeks out during 100% totality
          humanSunMesh.visible = solarTotalityFactor <= 0.92;

          // Moon becomes an opaque black silhouette
          humanMoonUniforms.uSolarEclipseFactor.value = THREE.MathUtils.clamp(2.05 - sunMoonDist, 0.0, 1.0);
        } else {
          humanSunMesh.visible = true;
          (humanSunCoronaSprite.material as THREE.SpriteMaterial).opacity = 0.0;
          humanMoonUniforms.uSolarEclipseFactor.value = 0.0;

          const sunsetFac = THREE.MathUtils.clamp(1.0 - Math.abs(sunAltDeg - 3.5) / 8.0, 0.0, 1.0);
          const spMat = humanSunSparkle.material as THREE.SpriteMaterial;
          if (sunAltDeg < 14.0) {
            spMat.color.copy(new THREE.Color(0xfff5cc).lerp(new THREE.Color(0xff8822), sunsetFac));
          } else {
            spMat.color.setHex(0xffffff);
          }
          spMat.opacity = 0.92;
        }

        // Moon sky disc sits at distance 39.75 (closer to camera than the Sun at 40.0)
        const moonSkyWorldPos = eyePos.clone().addScaledVector(toMoonWorld, 39.75);
        humanMoonSkyGroup.position.copy(moonSkyWorldPos);
        // Tidal locking orientation with celestial North Pole up so the Moon's Maria & craters are properly oriented!
        humanMoonMesh.up.copy(northAxisWorld);
        humanMoonMesh.lookAt(eyePos);
        humanMoonSkyGroup.visible = (isRealSolarEclipseActive || store.layers.showPlanets !== false) && moonAltDeg > -3.5;

        let rawDaylight = isSunLit ? THREE.MathUtils.clamp((sunAltDeg + 3.0) / 12.0, 0.0, 1.0) : 0.0;
        const humanDaylightFactor = isRealSolarEclipseActive
          ? rawDaylight * (0.012 + 0.988 * (1.0 - solarTotalityFactor))
          : rawDaylight;

        // Compute visual phase direction on the local sky sphere so the lit crescent of the Moon
        // always points toward the Sun in the sky with a realistic visible crescent thickness!
        const realMoonToSunDir = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), moonWorldPosVec).normalize();
        const skyMoonToSunVec = new THREE.Vector3().subVectors(sunSkyWorldPos, moonSkyWorldPos).normalize();
        // Blend between true 3D orbital phase and sky-sphere vector so even near young/old crescent phases
        // the Moon shows a crisp, photographic crescent instead of a paper-thin sliver
        const viewFromObsToMoon = toMoonWorld.clone();
        const rawCosPhase = realMoonToSunDir.dot(viewFromObsToMoon.clone().negate());
        let effectiveMoonLightDir = realMoonToSunDir.clone();
        if (rawCosPhase < -0.65 && !isRealSolarEclipseActive) {
          // Ensure a graceful minimum crescent illumination in daytime when looking at the Moon near the Sun
          const tangentTowardsSun = skyMoonToSunVec
            .clone()
            .addScaledVector(viewFromObsToMoon, -skyMoonToSunVec.dot(viewFromObsToMoon))
            .normalize();
          effectiveMoonLightDir = viewFromObsToMoon
            .clone()
            .negate()
            .multiplyScalar(-0.45)
            .addScaledVector(tangentTowardsSun, 0.89)
            .normalize();
        }
        humanMoonUniforms.uSunLightDir.value.copy(effectiveMoonLightDir);
        humanMoonUniforms.uDaylightFactor.value = humanDaylightFactor;
        humanMoonUniforms.uSunLightEnabled.value = isSunLit ? 1.0 : 0.0;

        // Compute true 3D Earth-Moon-Sun shadow occlusion for the Moon
        const moonToEarthVec = new THREE.Vector3().subVectors(earthSystemGroup.position, moonWorldPosVec);
        const projOnSunRay = moonToEarthVec.dot(realMoonToSunDir);
        let earthShadowOcc = 1.0;
        if (projOnSunRay > 0.0) {
          const closestPt = moonWorldPosVec.clone().addScaledVector(realMoonToSunDir, projOnSunRay);
          const perpDist = earthSystemGroup.position.distanceTo(closestPt);
          earthShadowOcc = THREE.MathUtils.smoothstep(perpDist, GLOBE_RADIUS * 0.96, GLOBE_RADIUS * 1.12);
        }
        humanMoonUniforms.uEarthShadowOcclusion.value = earthShadowOcc;

        if (isLunarEclipseNow) {
          const diffSec = (currentDate.getTime() - catalogEclipse.date.getTime()) / 1000;
          const absDiff = Math.abs(diffSec);
          if (absDiff <= 7200) {
            const bloodIntensity = 1.0 - (absDiff / 7200.0) * 0.45;
            humanMoonUniforms.uLunarEclipseActive.value = 1.0;
            humanMoonUniforms.uBloodMoonFactor.value = bloodIntensity;
          } else {
            humanMoonUniforms.uLunarEclipseActive.value = 0.0;
            humanMoonUniforms.uBloodMoonFactor.value = 0.0;
          }
        } else {
          humanMoonUniforms.uLunarEclipseActive.value = 0.0;
          humanMoonUniforms.uBloodMoonFactor.value = 0.0;
        }

        // Lunar illumination factor (0 = New Moon, 1 = Full Moon) reduced by Earth shadow occlusion
        const moonIllumFactor = 0.5 * (1.0 - Math.cos(lunarPhaseAngle)) * earthShadowOcc;

        humanObserverEnv.updateTime(
          humanDaylightFactor,
          accumulatedCloudTime,
          cfg.showAtmosphereHalo !== false && store.layers.showAtmosphere !== false,
          localSunDir,
          cfg.showClouds3D !== false && store.layers.showDynamicShadows !== false && isSunLit
        );
        humanAmbientLight.intensity = 0.14 + humanDaylightFactor * 1.65;
        humanDirLight.intensity = humanDaylightFactor * 2.5;
        humanDirLight.position.copy(sunSkyWorldPos);

        // Position starry planets at r = 45.0 inside the local sky dome so they shine strictly by REFLECTING SUNLIGHT!
        const planetaryAlbedos: Record<string, number> = {
          mercury: 0.14,
          venus: 0.68,
          mars: 0.17,
          jupiter: 0.52,
          saturn: 0.47,
          uranus: 0.51,
          neptune: 0.41,
        };

        otherPlanetsMap.forEach((entry) => {
          entry.systemGroup.visible = false; // Hide heliocentric macro planet mesh
          const skyPlanet = humanSkyPlanetsMap.get(entry.spec.id);
          if (skyPlanet) {
            const planetPosWorld = entry.systemGroup.position;
            const toPlanet = new THREE.Vector3().subVectors(planetPosWorld, eyePos).normalize();
            const pSinAlt = toPlanet.dot(obsWorldNormal);
            skyPlanet.group.position.copy(eyePos).addScaledVector(toPlanet, 45.0);

            // REAL PHYSICAL SOLAR REFLECTION:
            // Planets have NO self-illumination! They shine only by reflecting sunlight from the Sun at (0, 0, 0).
            const toPlanetFromSun = planetPosWorld.clone().normalize();
            const rSunAU = Math.max(0.2, planetPosWorld.length() / AU_TO_UNITS);
            const deltaEarthAU = Math.max(0.2, planetPosWorld.distanceTo(eyePos) / AU_TO_UNITS);

            // Phase angle alpha at planet: angle between direction towards Sun and towards observer
            const cosPhaseAngle = THREE.MathUtils.clamp(
              toPlanetFromSun.clone().negate().dot(toPlanet.clone().negate()),
              -1.0,
              1.0
            );
            // Illuminated fraction facing Earth (Lambertian phase function)
            const phaseFraction = 0.5 * (1.0 + cosPhaseAngle);

            // Solar flux at planet falls as 1 / rSunAU^2
            const solarFluxAtPlanet = 1.0 / (rSunAU * rSunAU);
            const albedo = planetaryAlbedos[entry.spec.id] ?? 0.35;

            // Reflected flux received at Earth (inverse-square law + phase fraction)
            const reflectedFlux = (albedo * solarFluxAtPlanet * Math.max(0.015, phaseFraction)) / (deltaEarthAU * deltaEarthAU);
            const apparentReflectedFactor = THREE.MathUtils.clamp(reflectedFlux * 0.45, 0.02, 1.0);

            // Visibility threshold: Venus is visible up to daylight factor 0.60, Jupiter up to 0.32, others up to 0.15
            const maxDaylightForPlanet =
              entry.spec.id === 'venus' ? 0.60 : entry.spec.id === 'jupiter' ? 0.32 : 0.15;
            const planetVis =
              store.layers.showPlanets &&
              pSinAlt > -0.02 &&
              humanDaylightFactor < maxDaylightForPlanet;

            skyPlanet.group.visible = planetVis;
            if (planetVis) {
              const fadeAlpha = THREE.MathUtils.clamp(
                1.0 - humanDaylightFactor / maxDaylightForPlanet,
                0.12,
                1.0
              );
              const finalIntensity = fadeAlpha * apparentReflectedFactor;
              skyPlanet.dotMat.opacity = finalIntensity;
              (skyPlanet.sparkle.material as THREE.SpriteMaterial).opacity = finalIntensity * 0.70;
              skyPlanet.label.visible = cfg.showPlanetLabels;
            }
          }
        });

        // Handle "Olhar para o Sol / Lua / Planeta" button requests from the HUD
        if (requestLookAtTarget === 'sun') {
          humanLookRef.current.azimuth = (sunAzDeg * Math.PI) / 180;
          humanLookRef.current.pitch = clampHumanPitch((sunAltDeg * Math.PI) / 180);
          broadcastHumanCameraAngles(humanLookRef.current.azimuth, humanLookRef.current.pitch);
          requestLookAtTarget = null;
        } else if (requestLookAtTarget === 'moon') {
          humanLookRef.current.azimuth = (moonAzDeg * Math.PI) / 180;
          humanLookRef.current.pitch = clampHumanPitch((moonAltDeg * Math.PI) / 180);
          broadcastHumanCameraAngles(humanLookRef.current.azimuth, humanLookRef.current.pitch);
          requestLookAtTarget = null;
        } else if (requestLookAtTarget && otherPlanetsMap.has(requestLookAtTarget as SolarSystemTargetId)) {
          const pEntry = otherPlanetsMap.get(requestLookAtTarget as SolarSystemTargetId)!;
          const toP = new THREE.Vector3().subVectors(pEntry.systemGroup.position, eyePos).normalize();
          const pLocal = new THREE.Vector3(toP.dot(localEast), toP.dot(obsWorldNormal), toP.dot(localSouth)).normalize();
          const pAlt = Math.asin(THREE.MathUtils.clamp(pLocal.y, -1.0, 1.0));
          const pAz = (Math.atan2(pLocal.x, -pLocal.z) + Math.PI * 2) % (Math.PI * 2);
          humanLookRef.current.azimuth = pAz;
          humanLookRef.current.pitch = clampHumanPitch(pAlt);
          broadcastHumanCameraAngles(humanLookRef.current.azimuth, humanLookRef.current.pitch);
          requestLookAtTarget = null;
        }

        spaceStarVault.group.visible = false; // CelestialSphere3D provides the full oriented starry vault + atmospheric dome

        const moonHorizonGate = THREE.MathUtils.clamp((moonAltDeg + 4.0) / 8.0, 0.0, 1.0);

        humanCelestialSphere.updateSphericalHumanObserver(
          currentDate,
          humanDaylightFactor,
          localSunDir,
          localMoonDir,
          eyePos,
          tangentBasisQuat,
          celestialPoleQuat,
          accumulatedCloudTime * 1000.0,
          moonIllumFactor * moonHorizonGate,
          moonAltDeg,
          Boolean(store.layers.showConstellations),
          Boolean(store.layers.showConstellationLines),
          Boolean(store.layers.showConstellationLabels),
          store.layers.constellationLineColor || 'cyan',
          store.layers.constellationLineOpacity ?? 0.85,
          store.layers.selectedConstellation
        );

        // Delegate to centralized humanCameraController (Zero chord-shortcut through zenith, rectilinear FOV)
        applyHumanCameraQuaternion(
          camera,
          localEast,
          obsWorldNormal,
          localNorth,
          humanLookRef.current.azimuth,
          humanLookRef.current.pitch,
          humanLookRef.current.fov
        );
      } else {
        earthMesh.visible = true;
        humanSunSkyGroup.visible = false;
        humanMoonSkyGroup.visible = false;
        humanSkyPlanetsMap.forEach((sp) => {
          sp.group.visible = false;
        });
        humanObserverEnv.setVisible(false);
        humanAmbientLight.intensity = 0.0;
        humanDirLight.intensity = 0.0;
        humanCelestialSphere.group.visible = false;
        scene.background = new THREE.Color(0x010206);
        spaceStarVault.group.visible = store.layers.showSpaceBackground !== false;

        camera.up.set(0, 1, 0);
        if (camera.near !== 0.005) {
          camera.near = 0.005;
          camera.updateProjectionMatrix();
        }
        if (camera.fov !== 45) {
          camera.fov = 45;
          camera.updateProjectionMatrix();
        }

        const targetCenter = new THREE.Vector3(0, 0, 0);
        if (cfg.globeCameraPreset === 'solar_system' && cfg.focusedBody === 'solar_system') {
          targetCenter.set(0, 0, 0);
        } else if (cfg.focusedBody === 'sun') {
          targetCenter.set(0, 0, 0);
        } else if (cfg.focusedBody === 'moon') {
          moonGroup.getWorldPosition(targetCenter);
        } else if (otherPlanetsMap.has(cfg.focusedBody)) {
          const pEntry = otherPlanetsMap.get(cfg.focusedBody)!;
          pEntry.systemGroup.getWorldPosition(targetCenter);
        } else {
          targetCenter.copy(earthSystemGroup.position);
        }

        spaceStarVault.group.position.copy(targetCenter);

        const { theta, phi, distance } = orbitAnglesRef.current;
        const effectiveTheta =
          cfg.lockCameraToEarthRotation && (cfg.focusedBody === 'earth' || cfg.focusedBody === 'solar_system')
            ? theta + earthSpinGroup.rotation.y
            : theta;

        const cx = targetCenter.x + distance * Math.sin(phi) * Math.sin(effectiveTheta);
        const cy = targetCenter.y + distance * Math.cos(phi);
        const cz = targetCenter.z + distance * Math.sin(phi) * Math.cos(effectiveTheta);
        camera.position.set(cx, cy, cz);
        camera.lookAt(targetCenter);
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      domElem.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('globe-human-look-angles', handleHumanLookAngles);
      window.removeEventListener('globe-human-look-at-astro', handleHumanLookAtAstro);
      window.removeEventListener('globe-human-set-fov', handleHumanSetFov);
      window.removeEventListener('globe-human-set-eye-height', handleHumanSetEyeHeight);
      window.removeEventListener('globe-set-camera-preset', handleGlobeSetPreset);
      domElem.removeEventListener('wheel', handleWheel);
      humanCelestialSphere.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden touch-none select-none" />;
};
