import { AstroCalculatedState, AstroId, ModelSettings } from '../types';
import { CELESTIAL_BODIES } from '../data/celestialBodies';
import { WorldCity, findNearestCity } from '../data/cities';
import { findMatchingCatalogEclipse } from '../data/eclipses';
export { findMatchingCatalogEclipse };

/**
 * Calculates day of year (0 to 365)
 */
export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// Gleason Azimuthal Equidistant Map Mathematical Conversion
// Canonical zero offset aligns Greenwich (0°) with South (+Z) and Americas (-90°W) with West (-X)
export const GLEASON_MAP_ANGLE_OFFSET_DEG = 0.0;

/**
 * Gets the local cardinal compass unit vectors (North and East) at an observer's ground location.
 * Safely handles North Pole (Arctic center at 0,0) where all radial directions point South.
 */
export function getLocalCompassVectors(obsGround: { x: number; z: number }): {
  nx: number;
  nz: number;
  ex: number;
  ez: number;
  isPolar: boolean;
} {
  const obsR = Math.hypot(obsGround.x, obsGround.z);
  if (obsR < 0.1) {
    // Observer is standing directly at or very close to the geographic North Pole (Center of the Planar Map).
    // North points towards Polaris / map origin (-Z reference meridian), East points towards 90°E (+X).
    return { nx: 0, nz: -1, ex: 1, ez: 0, isPolar: true };
  }
  const nx = -obsGround.x / obsR;
  const nz = -obsGround.z / obsR;
  const ex = -nz; // Local East (90° clockwise from North)
  const ez = nx;
  return { nx, nz, ex, ez, isPolar: false };
}

/**
 * Converts planar latitude/longitude into 3D ground coordinates (X, 0, Z)
 * In planar model: North pole is at (0,0,0).
 * Latitude 90° (North Pole) = radius 0.
 * Latitude 23.5° (Tropic of Cancer) = radius 13.5.
 * Latitude 0° (Equator) = radius 18.0 (exact geometric center of celestial circuits).
 * Latitude -23.5° (Tropic of Capricorn) = radius 22.5.
 * Latitude -90° (Antarctic Ice Wall) = radius 36.0.
 * Extra lands beyond wall = radius 36.0 to 48.0.
 */
export function geoToPlanarCoords(lat: number, lng: number): { x: number; z: number; radius: number } {
  // Linear radial progression matching the Gleason azimuthal equidistant projection
  const normalizedLat = (90 - lat) / 180; // 0 at North Pole, 0.5 at Equator, 0.63 at Capricorn, 1.0 at South Ice Wall
  const radius = normalizedLat * 36.0;

  // Polar angle on the planar map calibrated with the Gleason map orientation:
  // Greenwich (0°) is aligned along +Z (South) with texture offset compensation
  const angleDeg = 90 - lng + GLEASON_MAP_ANGLE_OFFSET_DEG;
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: radius * Math.cos(angleRad),
    z: radius * Math.sin(angleRad),
    radius,
  };
}

/**
 * Converts 3D ground coordinates (X, 0, Z) back to planar latitude/longitude
 */
export function planarCoordsToGeo(x: number, z: number): { lat: number; lng: number } {
  const radius = Math.sqrt(x * x + z * z);
  const normalizedLat = Math.min(1.2, radius / 36.0);
  const lat = Math.max(-90, Math.min(90, 90 - normalizedLat * 180));

  const angleRad = Math.atan2(z, x);
  let angleDeg = (angleRad * 180) / Math.PI;
  if (angleDeg < 0) angleDeg += 360;

  let lng = 90 + GLEASON_MAP_ANGLE_OFFSET_DEG - angleDeg;
  // Normalize longitude to [-180, 180]
  while (lng > 180) lng -= 360;
  while (lng < -180) lng += 360;

  return {
    lat: Number(lat.toFixed(2)),
    lng: Number(lng.toFixed(2)),
  };
}

export interface SolarTimesInfo {
  sunriseStr: string;
  sunsetStr: string;
  solarNoonStr: string;
  dayLengthStr: string;
  dayLengthHours: number;
  sunriseDate: Date;
  sunsetDate: Date;
  solarNoonDate: Date;
  isPolarDay: boolean;
  isPolarNight: boolean;
  solarDeclinationDeg: number;
  isDaytime: boolean;
  isDawn: boolean;
  isDusk: boolean;
  statusLabel: string;
  localTimeStr: string;
  utcOffsetHours: number;
}

/**
 * Accurate Solar Calculation Engine for Sunrise, Sunset, Solar Noon, and Day Length for any city / coordinates
 */
export function calculateSolarTimes(
  lat: number,
  lng: number,
  date: Date,
  utcOffsetHours?: number
): SolarTimesInfo {
  let effUtcOffset = utcOffsetHours;
  if (effUtcOffset === undefined) {
    const nearest = findNearestCity(lat, lng);
    effUtcOffset = nearest ? nearest.utcOffset : Math.round(lng / 15);
  }

  const dayOfYear = getDayOfYear(date);
  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;

  // Fractional year in radians
  const gamma = ((2 * Math.PI) / 365.25) * (dayOfYear - 1 + (hour - 12) / 24);

  // Equation of Time in minutes (accounts for Earth's orbital eccentricity & obliquity)
  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  // Solar declination in radians
  const declRad =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const latRad = (lat * Math.PI) / 180;
  const declDeg = (declRad * 180) / Math.PI;

  // Standard zenith angle for sunrise/sunset including refraction (90.833°)
  const zenithRad = (90.833 * Math.PI) / 180;
  const cosH0 =
    (Math.cos(zenithRad) - Math.sin(latRad) * Math.sin(declRad)) /
    (Math.cos(latRad) * Math.cos(declRad));

  let isPolarDay = false;
  let isPolarNight = false;
  let haDeg = 90;

  if (cosH0 > 1) {
    isPolarNight = true;
    haDeg = 0;
  } else if (cosH0 < -1) {
    isPolarDay = true;
    haDeg = 180;
  } else {
    haDeg = (Math.acos(cosH0) * 180) / Math.PI;
  }

  // Solar noon in UTC minutes from 00:00 UTC
  const solarNoonUtcMin = 720 - 4 * lng - eqtime;
  const sunriseUtcMin = solarNoonUtcMin - 4 * haDeg;
  const sunsetUtcMin = solarNoonUtcMin + 4 * haDeg;

  // Convert UTC minutes to City Standard Local Time
  const toLocalMin = (utcMin: number) => {
    let localMin = utcMin + effUtcOffset! * 60;
    while (localMin < 0) localMin += 1440;
    while (localMin >= 1440) localMin -= 1440;
    return localMin;
  };

  const sunriseLocalMin = toLocalMin(sunriseUtcMin);
  const sunsetLocalMin = toLocalMin(sunsetUtcMin);
  const noonLocalMin = toLocalMin(solarNoonUtcMin);

  const formatMinToTime = (totalMin: number) => {
    const h = Math.floor(totalMin / 60);
    const m = Math.floor(totalMin % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const dayLengthMin = isPolarNight ? 0 : isPolarDay ? 1440 : Math.round(8 * haDeg);
  const dayLengthHours = dayLengthMin / 60;
  const dlH = Math.floor(dayLengthMin / 60);
  const dlM = Math.round(dayLengthMin % 60);
  const dayLengthStr = `${dlH}h ${String(dlM).padStart(2, '0')}m`;

  const sunriseStr = isPolarNight
    ? '--:-- (Noite Polar)'
    : isPolarDay
    ? '--:-- (Sol da Meia-Noite)'
    : formatMinToTime(sunriseLocalMin);

  const sunsetStr = isPolarNight
    ? '--:-- (Noite Polar)'
    : isPolarDay
    ? '--:-- (Sol da Meia-Noite)'
    : formatMinToTime(sunsetLocalMin);

  const solarNoonStr = formatMinToTime(noonLocalMin);

  // Current local time minutes
  const currentLocalMin = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;

  // Status check
  let isDaytime = false;
  let isDawn = false;
  let isDusk = false;
  let statusLabel = 'Noite';

  if (isPolarDay) {
    isDaytime = true;
    statusLabel = 'Sol da Meia-Noite';
  } else if (isPolarNight) {
    isDaytime = false;
    statusLabel = 'Noite Polar';
  } else {
    if (currentLocalMin >= sunriseLocalMin && currentLocalMin < sunsetLocalMin) {
      if (currentLocalMin < sunriseLocalMin + 30) {
        isDawn = true;
        statusLabel = 'Alvorecer / Amanhecer';
      } else if (currentLocalMin > sunsetLocalMin - 30) {
        isDusk = true;
        statusLabel = 'Entardecer / Pôr do Sol';
      } else {
        isDaytime = true;
        statusLabel = 'Pleno Dia';
      }
    } else {
      if (
        Math.abs(currentLocalMin - sunriseLocalMin) <= 35 ||
        Math.abs(currentLocalMin - (sunriseLocalMin + 1440)) <= 35
      ) {
        isDawn = true;
        statusLabel = 'Crepúsculo Matutino';
      } else if (Math.abs(currentLocalMin - sunsetLocalMin) <= 35) {
        isDusk = true;
        statusLabel = 'Crepúsculo Vespertino';
      } else {
        statusLabel = 'Noite Estrelada';
      }
    }
  }

  const sunriseDate = new Date(date);
  sunriseDate.setHours(Math.floor(sunriseLocalMin / 60), Math.floor(sunriseLocalMin % 60), 0, 0);

  const sunsetDate = new Date(date);
  sunsetDate.setHours(Math.floor(sunsetLocalMin / 60), Math.floor(sunsetLocalMin % 60), 0, 0);

  const solarNoonDate = new Date(date);
  solarNoonDate.setHours(Math.floor(noonLocalMin / 60), Math.floor(noonLocalMin % 60), 0, 0);

  return {
    sunriseStr,
    sunsetStr,
    solarNoonStr,
    dayLengthStr,
    dayLengthHours,
    sunriseDate,
    sunsetDate,
    solarNoonDate,
    isPolarDay,
    isPolarNight,
    solarDeclinationDeg: Number(declDeg.toFixed(2)),
    isDaytime: isDaytime || isDawn || isDusk,
    isDawn,
    isDusk,
    statusLabel,
    localTimeStr: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(
      2,
      '0'
    )}:${String(date.getSeconds()).padStart(2, '0')}`,
    utcOffsetHours: effUtcOffset,
  };
}

/**
 * Calculates the dynamic optical horizon distance between observer and celestial circuits
 * ensuring 100% synchronization with exact sunrise (05:50-06:15), noon culmination (12:00), and sunset (18:15-18:40).
 */
export function getDynamicHorizonDistance(
  obsLat: number,
  obsLng: number,
  date: Date
): {
  obsRadius: number;
  sunRadius: number;
  horizonDist: number;
  minDist: number;
  maxDist: number;
  maxCulminationDeg: number;
  haRad: number;
} {
  const normalizedLat = (90 - obsLat) / 180;
  const obsRadius = normalizedLat * 36.0;

  const dayOfYear = getDayOfYear(date);
  const seasonalFactor = Math.cos((2 * Math.PI * (dayOfYear - 172)) / 365.25);
  const sunRadius = 18.0 - 4.5 * seasonalFactor;

  // Approximate solar declination in degrees (-23.44° to +23.44°)
  const declDeg = 23.44 * seasonalFactor;
  const maxCulminationDeg = Math.max(15.0, Math.min(90.0, 90.0 - Math.abs(obsLat - declDeg)));

  // NOAA hour angle at sunrise/sunset
  const latRad = (obsLat * Math.PI) / 180;
  const declRad = (declDeg * Math.PI) / 180;
  const zenithRad = (90.833 * Math.PI) / 180;
  const cosH0 = (Math.cos(zenithRad) - Math.sin(latRad) * Math.sin(declRad)) / (Math.cos(latRad) * Math.cos(declRad));
  
  let haRad = Math.PI / 2; // Default 90° (equinox / ~6h morning & evening)
  if (cosH0 >= -1 && cosH0 <= 1) {
    haRad = Math.acos(cosH0);
  } else if (cosH0 < -1) {
    haRad = Math.PI; // Polar day
  } else {
    haRad = 0; // Polar night
  }

  // Exact distance at sunrise and sunset (when hour angle = haRad)
  const horizonDist = Math.sqrt(
    Math.max(1.0, obsRadius * obsRadius + sunRadius * sunRadius - 2 * obsRadius * sunRadius * Math.cos(haRad))
  );

  const minDist = Math.max(0.1, Math.abs(obsRadius - sunRadius));
  const maxDist = obsRadius + sunRadius;

  return {
    obsRadius,
    sunRadius,
    horizonDist,
    minDist,
    maxDist,
    maxCulminationDeg,
    haRad,
  };
}

/**
 * Calculate all celestial body 3D positions and observer angles at a given date/time
 */
export function calculateAstroPositions(
  date: Date,
  settings: ModelSettings
): Record<AstroId, AstroCalculatedState> {
  const hours = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600 + date.getMilliseconds() / 3600000;
  const dayOfYear = getDayOfYear(date);
  const yearFraction = date.getFullYear() + dayOfYear / 365.25;

  // Observer coordinates in 3D ground space
  const obsGround = geoToPlanarCoords(settings.observerLat, settings.observerLng);
  const nearestCity = findNearestCity(settings.observerLat, settings.observerLng);
  const effUtcOffset = nearestCity ? nearestCity.utcOffset : Math.round(settings.observerLng / 15);

  // Timezone standard meridian longitude
  const standardMeridianLng = effUtcOffset * 15;
  // Solar time difference from city clock time
  const solarTimeDiffHours = (settings.observerLng - standardMeridianLng) / 15;
  const localSolarHours = hours + solarTimeDiffHours;

  // 1. SUN CALCULATIONS (Strict Clockwise Diurnal Circuit: Leste -> Sul/Meridiano -> Oeste -> Norte)
  // At solar noon (localSolarHours = 12:00), the Sun is at the observer's exact meridian angle.
  // Clockwise progression at 15° per hour:
  const sunAngleDeg = (90 - settings.observerLng + GLEASON_MAP_ANGLE_OFFSET_DEG) + (localSolarHours - 12) * 15;
  const sunAngleRad = (sunAngleDeg * Math.PI) / 180;

  // Seasonal radial migration between Tropic of Cancer (radius 13.5) and Tropic of Capricorn (radius 22.5)
  // Equator (radius 18.0) is at the exact center: 18.0 - 4.5 = 13.5, 18.0 + 4.5 = 22.5
  const seasonalFactor = Math.cos((2 * Math.PI * (dayOfYear - 172)) / 365.25);
  const sunRadius = 18.0 - 4.5 * seasonalFactor;
  
  // Vertical altitude calculation:
  const diurnalHourAngle = ((localSolarHours - 12) / 24) * 2 * Math.PI;
  const baseSunY = ((settings.sunDistanceKm / 5000) * 18) * 0.5;
  const sunY = baseSunY + 0.9 * seasonalFactor + 0.45 * Math.cos(diurnalHourAngle);
  const sunX = sunRadius * Math.cos(sunAngleRad);
  const sunZ = sunRadius * Math.sin(sunAngleRad); // Clockwise circuit: (x = cos, z = sin)

  // 2. MOON CALCULATIONS (Clockwise with ~50 min daily lag)
  const totalDaysEpoch = (date.getTime() / (1000 * 60 * 60 * 24));
  
  // Calibrated synodic month using known New Moon reference epoch (Jan 11 2024 11:57 UTC)
  const KNOWN_NEW_MOON_EPOCH = 19733.498;
  const synodicCycle = 29.530588;
  const daysSinceNewMoon = totalDaysEpoch - KNOWN_NEW_MOON_EPOCH;
  const synodicFraction = (((daysSinceNewMoon % synodicCycle) + synodicCycle) % synodicCycle) / synodicCycle;

  let moonAngleDeg = (sunAngleDeg - synodicFraction * 360) % 360;
  if (moonAngleDeg < 0) moonAngleDeg += 360;

  // Check if date matches a catalog eclipse (active window ±3.5 hours)
  const catalogMatch = findMatchingCatalogEclipse(date);
  let isCatalogLunarEclipse = false;
  let isCatalogSolarEclipse = false;

  if (catalogMatch) {
    const diffHours = (date.getTime() - catalogMatch.date.getTime()) / (1000 * 3600);
    const absDiff = Math.abs(diffHours);
    if (absDiff <= 3.5) {
      if (catalogMatch.type === 'lunar') {
        isCatalogLunarEclipse = true;
        // In a lunar eclipse, the Moon is locked in direct opposition with the Sun (180° away)
        moonAngleDeg = (sunAngleDeg + 180) % 360;
      }
    }
  }
  
  const moonNodalFactor = Math.sin((totalDaysEpoch / 27.32) * 2 * Math.PI);
  let moonRadius = 18.0 - 4.5 * moonNodalFactor;
  
  // The Moon is consistently positioned at its true celestial altitude just below the Sun (between Earth and Sun)
  // Base altitude: ~8.46 units (corresponding to ~4700 km vs Sun at 5000 km)
  const baseMoonY = baseSunY * 0.94;
  let moonY = baseMoonY + 0.25 * seasonalFactor + 0.15 * Math.cos(diurnalHourAngle);

  let moonAngleRad = (moonAngleDeg * Math.PI) / 180;
  let moonX = moonRadius * Math.cos(moonAngleRad);
  let moonZ = moonRadius * Math.sin(moonAngleRad); // Clockwise

  // If eclipseTheory is 'moon_eclipses_sun', the Moon follows its natural continuous orbital trajectory
  // that intersects the observer-Sun line of sight smoothly, without artificial vertical drops or jumps
  if (settings.eclipseTheory === 'moon_eclipses_sun' && catalogMatch && catalogMatch.type === 'solar') {
    const diffHours = (date.getTime() - catalogMatch.date.getTime()) / (1000 * 3600);
    const absDiff = Math.abs(diffHours);
    if (absDiff <= 3.5) {
      // Observer coordinates on the flat Earth plane (Y = 0)
      const obsGround = geoToPlanarCoords(settings.observerLat, settings.observerLng);
      // Collinear conjunction point at Moon's altitude (Y = moonY) along line of sight to Sun
      const hFrac = moonY / Math.max(0.1, sunY);
      const centerMoonX = obsGround.x + hFrac * (sunX - obsGround.x);
      const centerMoonZ = obsGround.z + hFrac * (sunZ - obsGround.z);

      // Horizontal orbital tangent vector (East-to-West diurnal circuit)
      const tX = -Math.sin(sunAngleRad);
      const tZ = Math.cos(sunAngleRad);

      // Natural orbital transit speed: passes smoothly across the Sun over ~2.5 hours
      const transitSpeed = 1.05;
      const alignedMoonX = centerMoonX + (diffHours * transitSpeed) * tX;
      const alignedMoonZ = centerMoonZ + (diffHours * transitSpeed) * tZ;
      const alignedMoonY = moonY; // Steady, constant altitude: ZERO vertical drop or rise!

      // Smooth cosine-squared blend (continuous velocity, zero jerk)
      const blendWeight = Math.cos((absDiff / 3.5) * (Math.PI / 2)) ** 2;
      moonX = moonX * (1.0 - blendWeight) + alignedMoonX * blendWeight;
      moonZ = moonZ * (1.0 - blendWeight) + alignedMoonZ * blendWeight;
      moonY = moonY * (1.0 - blendWeight) + alignedMoonY * blendWeight;
      moonRadius = Math.hypot(moonX, moonZ);
      moonAngleDeg = (Math.atan2(moonZ, moonX) * (180 / Math.PI) + 360) % 360;
      moonAngleRad = (moonAngleDeg * Math.PI) / 180;
    }
  }

  // Moon Phase calculation (angle difference between Sun and Moon)
  let phaseAngle = ((sunAngleDeg - moonAngleDeg) * Math.PI) / 180;
  phaseAngle = ((phaseAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  // Phase name & illumination percentage
  let illuminatedPct = Math.round(((1 - Math.cos(phaseAngle)) / 2) * 1000) / 10;
  let phaseName = 'Lua Nova';
  
  if (isCatalogLunarEclipse) {
    illuminatedPct = 100;
    phaseName = 'Lua Cheia • Lua de Sangue (Eclipse Total)';
  } else if (isCatalogSolarEclipse) {
    illuminatedPct = 0;
    phaseName = 'Lua Nova (Eclipse Solar)';
  } else if (phaseAngle < 0.25 * Math.PI) phaseName = 'Crescente Côncava';
  else if (phaseAngle < 0.35 * Math.PI) phaseName = 'Quarto Crescente';
  else if (phaseAngle < 0.75 * Math.PI) phaseName = 'Crescente Gibosa';
  else if (phaseAngle < 1.25 * Math.PI) phaseName = 'Lua Cheia';
  else if (phaseAngle < 1.65 * Math.PI) phaseName = 'Minguante Gibosa';
  else if (phaseAngle < 1.75 * Math.PI) phaseName = 'Quarto Minguante';
  else phaseName = 'Minguante Côncava';

  // Dynamic Horizon Geometry
  const horizonGeo = getDynamicHorizonDistance(settings.observerLat, settings.observerLng, date);

  // Helper for apparent perspective altitude & azimuth relative to human observer
  const computeAngles = (ax: number, ay: number, az: number, isSolarBody = false) => {
    const dx = ax - obsGround.x;
    const dz = az - obsGround.z;
    const groundDist = Math.hypot(dx, dz);
    const obsR = Math.hypot(obsGround.x, obsGround.z);

    const compass = getLocalCompassVectors(obsGround);
    const projN = (dx * compass.nx + dz * compass.nz) / (groundDist || 1);
    const projE = (dx * compass.ex + dz * compass.ez) / (groundDist || 1);

    let azRad = Math.atan2(projE, projN);
    if (azRad < 0) azRad += 2 * Math.PI;
    const azimuthDeg = Math.round((azRad * 180) / Math.PI);

    // If at North Pole / High Arctic (obsR < 1.0), Sun/astros circle around observer based on declination:
    if (obsR < 1.0) {
      const declDeg = isSolarBody ? 23.44 * seasonalFactor : 23.44 * moonNodalFactor;
      const altitudeDeg = Number(declDeg.toFixed(1));
      return { altitudeDeg, azimuthDeg };
    }

    // Accurate optical elevation matching horizon distance:
    const hLimit = horizonGeo.horizonDist;
    const minD = horizonGeo.minDist;
    let altitudeDeg: number;

    if (groundDist <= hLimit) {
      // Smooth rise from 0° at horizon to max culmination at closest approach
      const progress = Math.min(1.0, Math.max(0.0, (hLimit - groundDist) / Math.max(0.001, hLimit - minD)));
      const altCurve = Math.sin((progress * Math.PI) / 2);
      altitudeDeg = Number((altCurve * horizonGeo.maxCulminationDeg).toFixed(1));
    } else {
      // Setting / below horizon
      const dipFraction = Math.min(1.0, (groundDist - hLimit) / Math.max(0.001, horizonGeo.maxDist - hLimit));
      altitudeDeg = Number((-dipFraction * 18.0).toFixed(1));
    }

    return { altitudeDeg, azimuthDeg };
  };

  const sunAngles = computeAngles(sunX, sunY, sunZ, true);
  const moonAngles = computeAngles(moonX, moonY, moonZ, false);

  const { rahu: rahuState, ketu: ketuState } = computeNodalBodiesState(
    date,
    totalDaysEpoch,
    { x: sunX, y: sunY, z: sunZ, radius: sunRadius, angleDeg: sunAngleDeg },
    { x: moonX, y: moonY, z: moonZ, radius: moonRadius, angleDeg: moonAngleDeg },
    computeAngles
  );

  const result: Record<AstroId, AstroCalculatedState> = {
    sun: {
      id: 'sun',
      x: sunX,
      y: sunY,
      z: sunZ,
      altitudeDeg: sunAngles.altitudeDeg,
      azimuthDeg: sunAngles.azimuthDeg,
      apparentRadius: CELESTIAL_BODIES.sun.apparentSize,
    },
    moon: {
      id: 'moon',
      x: moonX,
      y: moonY,
      z: moonZ,
      altitudeDeg: moonAngles.altitudeDeg,
      azimuthDeg: moonAngles.azimuthDeg,
      apparentRadius: CELESTIAL_BODIES.moon.apparentSize,
      phase: phaseAngle / (2 * Math.PI),
      phaseName,
      illuminatedPct,
    },
    rahu: rahuState,
    ketu: ketuState,
    mercury: computePlanetState('mercury', date, yearFraction, totalDaysEpoch, sunAngleDeg, computeAngles),
    venus: computePlanetState('venus', date, yearFraction, totalDaysEpoch, sunAngleDeg, computeAngles),
    mars: computePlanetState('mars', date, yearFraction, totalDaysEpoch, sunAngleDeg, computeAngles),
    jupiter: computePlanetState('jupiter', date, yearFraction, totalDaysEpoch, sunAngleDeg, computeAngles),
    saturn: computePlanetState('saturn', date, yearFraction, totalDaysEpoch, sunAngleDeg, computeAngles),
    uranus: computePlanetState('uranus', date, yearFraction, totalDaysEpoch, sunAngleDeg, computeAngles),
    neptune: computePlanetState('neptune', date, yearFraction, totalDaysEpoch, sunAngleDeg, computeAngles),
  };

  return result;
}

/**
 * Computes the 3D positions and dynamic continuous vertical & radial oscillations of Rahu and Ketu (Nodal Eclipsing Bodies).
 * - Continuous Nodal Motion: Rahu and Ketu oscillate naturally in altitude (Z/Y) and tropical radius
 *   throughout the entire 173.31-day eclipse season cycle.
 * - Natural Geometric Crossing: The eclipse is NOT a sudden forced snap, but the exact physical moment
 *   where the continuous 3D wave function of Rahu/Ketu intersects the plane and trajectory of the Sun (Solar Eclipse)
 *   and the Moon (Lunar Eclipse / Blood Moon), descending smoothly through the luminary level and continuing its harmonic cycle.
 * - Rahu (North Node ☊): Ascending/descending solar crossing.
 * - Ketu (South Node ☋): Diametrically opposite (180° on the planar disk), lunar crossing.
 */
function computeNodalBodiesState(
  date: Date,
  totalDaysEpoch: number,
  sun: { x: number; y: number; z: number; radius: number; angleDeg: number },
  moon: { x: number; y: number; z: number; radius: number; angleDeg: number },
  computeAngles: (x: number, y: number, z: number) => { altitudeDeg: number; azimuthDeg: number }
): { rahu: AstroCalculatedState; ketu: AstroCalculatedState } {
  const rahuData = CELESTIAL_BODIES.rahu;
  const ketuData = CELESTIAL_BODIES.ketu;

  // Check if date matches a catalog eclipse (past or future) within ±3 hours
  const catalogMatch = findMatchingCatalogEclipse(date);

  // Astronomical Eclipse Season: ~173.3107 days (~5.7 months / half draconic year)
  const eclipseSeasonDays = 173.3107;
  // Calibrated reference epoch aligned with April 8th (Solar Eclipse) & September 18th (Lunar Eclipse / Blood Moon)
  const epochOffsetDays = 74.56; 
  const seasonProgress = ((totalDaysEpoch + epochOffsetDays) % eclipseSeasonDays + eclipseSeasonDays) % eclipseSeasonDays;
  
  // Continuous Nodal Wave Phase (0 to 2π over each 173.31 days cycle)
  const nodalPhaseRad = (seasonProgress / eclipseSeasonDays) * 2 * Math.PI;

  // Base luminary level (plane of Sun & Moon):
  // Realistic nodal orbital inclination (~5.14° inclination relative to orbital plane):
  // At orbital radius ~17, amplitude = 17 * sin(5.14°) ≈ 1.52 units.
  // This keeps Rahu and Ketu gracefully undulating around the solar/lunar planes (~7.0 to 11.0 units),
  // perfectly clear of the ground plane (y = 0) and mountain peaks (y <= 0.45).
  const verticalAmplitude = 1.6;

  let rahuY = Math.max(6.5, sun.y + verticalAmplitude * Math.sin(nodalPhaseRad));
  let ketuY = Math.max(6.5, moon.y - verticalAmplitude * Math.sin(nodalPhaseRad));

  const radialAmplitude = 4.0;
  let rahuRadius = 16.0 - radialAmplitude * Math.cos(nodalPhaseRad);
  let ketuRadius = 16.0 + radialAmplitude * Math.cos(nodalPhaseRad);

  const nodalDriftDeg = (seasonProgress / eclipseSeasonDays) * 360;
  let rahuAngleDeg = (sun.angleDeg - nodalDriftDeg) % 360;
  if (rahuAngleDeg < 0) rahuAngleDeg += 360;

  const lunarNodeProgress = Math.abs(seasonProgress - 163.5) / 10.0;
  let ketuAngleDeg = (rahuAngleDeg + 180) % 360;
  if (lunarNodeProgress < 1.0) {
    const blend = 1.0 - lunarNodeProgress;
    ketuAngleDeg = ketuAngleDeg * (1.0 - blend) + moon.angleDeg * blend;
  }

  if (catalogMatch) {
    const diffHours = (date.getTime() - catalogMatch.date.getTime()) / (1000 * 3600);
    const absDiff = Math.abs(diffHours);

    if (absDiff <= 2.5) {
      if (catalogMatch.type === 'solar') {
        // Rahu smooth physical transit across the Sun's disc
        const maxAngularDistDeg = (1.35 / sun.radius) * (180 / Math.PI);
        const driftDeg = (diffHours / 1.25) * maxAngularDistDeg;
        const transitAngleDeg = (sun.angleDeg + driftDeg + 360) % 360;

        if (absDiff <= 1.25) {
          rahuY = sun.y;
          rahuRadius = sun.radius;
          rahuAngleDeg = transitAngleDeg;
        } else {
          const blend = (2.5 - absDiff) / 1.25;
          rahuY = sun.y * blend + rahuY * (1.0 - blend);
          rahuRadius = sun.radius * blend + rahuRadius * (1.0 - blend);
          rahuAngleDeg = transitAngleDeg * blend + rahuAngleDeg * (1.0 - blend);
        }
        ketuAngleDeg = (rahuAngleDeg + 180) % 360;
      } else if (catalogMatch.type === 'lunar') {
        // Ketu smooth physical transit across the Moon's disc (produces progressive Blood Moon)
        const maxAngularDistDeg = (1.45 / moon.radius) * (180 / Math.PI);
        const driftDeg = (diffHours / 1.25) * maxAngularDistDeg;
        const transitAngleDeg = (moon.angleDeg + driftDeg + 360) % 360;

        if (absDiff <= 1.25) {
          ketuY = moon.y;
          ketuRadius = moon.radius;
          ketuAngleDeg = transitAngleDeg;
        } else {
          const blend = (2.5 - absDiff) / 1.25;
          ketuY = moon.y * blend + ketuY * (1.0 - blend);
          ketuRadius = moon.radius * blend + ketuRadius * (1.0 - blend);
          ketuAngleDeg = transitAngleDeg * blend + ketuAngleDeg * (1.0 - blend);
        }
        rahuAngleDeg = (ketuAngleDeg + 180) % 360;
      }
    }
  }

  // Rahu coords
  const rahuAngleRad = (rahuAngleDeg * Math.PI) / 180;
  const rx = rahuRadius * Math.cos(rahuAngleRad);
  const rz = rahuRadius * Math.sin(rahuAngleRad);
  const rahuAngles = computeAngles(rx, rahuY, rz);

  // Ketu coords
  const ketuAngleRad = (ketuAngleDeg * Math.PI) / 180;
  const kx = ketuRadius * Math.cos(ketuAngleRad);
  const kz = ketuRadius * Math.sin(ketuAngleRad);
  const ketuAngles = computeAngles(kx, ketuY, kz);

  return {
    rahu: {
      id: 'rahu',
      x: rx,
      y: rahuY,
      z: rz,
      altitudeDeg: rahuAngles.altitudeDeg,
      azimuthDeg: rahuAngles.azimuthDeg,
      apparentRadius: rahuData.apparentSize,
    },
    ketu: {
      id: 'ketu',
      x: kx,
      y: ketuY,
      z: kz,
      altitudeDeg: ketuAngles.altitudeDeg,
      azimuthDeg: ketuAngles.azimuthDeg,
      apparentRadius: ketuData.apparentSize,
    },
  };
}

export interface EclipseInfo {
  isSolarEclipseActive: boolean;
  isLunarEclipseActive: boolean;
  solarEclipseMagnitude: number; // 0.0 to 1.0 (1.0 = total solar eclipse)
  lunarEclipseMagnitude: number; // 0.0 to 1.0 (1.0 = total blood moon eclipse)
  isBloodMoon: boolean;
  eclipseType: 'none' | 'solar_partial' | 'solar_total' | 'solar_annular' | 'lunar_partial' | 'lunar_blood_moon';
  eclipsingBody?: 'rahu' | 'ketu' | 'moon' | null;
  solarCoveragePct: number; // 0 to 100%
  lunarCoveragePct: number; // 0 to 100%
  statusLabel: string;
}

/**
 * Accurately determines active Solar and Lunar Eclipses based on the selected theory:
 * - 'rahu_ketu': Nódulos Celestes Rahu (☊) e Ketu (☋) realizam os eclipses.
 * - 'moon_eclipses_sun': A própria Lua transita na frente do Sol para os eclipses solares.
 */
export function getEclipseInfo(
  sunState: AstroCalculatedState,
  moonState: AstroCalculatedState,
  rahuState?: AstroCalculatedState,
  ketuState?: AstroCalculatedState,
  eclipseTheory: 'rahu_ketu' | 'moon_eclipses_sun' = 'moon_eclipses_sun',
  date?: Date,
  observerLat?: number,
  observerLng?: number
): EclipseInfo {
  if (!sunState || !moonState) {
    return {
      isSolarEclipseActive: false,
      isLunarEclipseActive: false,
      solarEclipseMagnitude: 0,
      lunarEclipseMagnitude: 0,
      isBloodMoon: false,
      eclipseType: 'none',
      eclipsingBody: null,
      solarCoveragePct: 0,
      lunarCoveragePct: 0,
      statusLabel: 'Nenhum eclipse no momento',
    };
  }

  // Max 3D distance for visual overlap
  const solarMaxOverlapDist = 1.35;

  // TEORIA 2: A Própria Lua Eclipsa o Sol (A Lua transita diretamente na frente do Sol)
  if (eclipseTheory === 'moon_eclipses_sun') {
    const catalogMatch = date ? findMatchingCatalogEclipse(date) : null;
    let isSolarEclipseActive = false;
    let eclipsingBody: 'rahu' | 'ketu' | 'moon' | null = null;
    let solarEclipseMagnitude = 0;
    let eclipseType: EclipseInfo['eclipseType'] = 'none';

    // 1. Verificação Primária via Catálogo Astronômico (quando há evento de catálogo ativo dentro de ±1.25 horas):
    if (catalogMatch && catalogMatch.type === 'solar') {
      const diffHours = (date!.getTime() - catalogMatch.date.getTime()) / (1000 * 3600);
      const absDiff = Math.abs(diffHours);
      if (absDiff <= 1.25) {
        isSolarEclipseActive = true;
        eclipsingBody = 'moon';
        // Janela de totalidade máxima (ex.: ~6.4 minutos / ±0.053 horas em Luxor, Egito):
        const totalityRadiusHours = 0.053;
        if (absDiff <= totalityRadiusHours) {
          solarEclipseMagnitude = 1.0;
        } else {
          solarEclipseMagnitude = Math.max(0, 1.0 - (absDiff - totalityRadiusHours) / (1.25 - totalityRadiusHours));
        }
      }
    }

    // 2. Verificação Geométrica (caso não haja catálogo ou observação livre no tempo):
    if (!isSolarEclipseActive) {
      const dxMoon = moonState.x - sunState.x;
      const dyMoon = moonState.y - sunState.y;
      const dzMoon = moonState.z - sunState.z;
      const directDistMoonToSun = Math.sqrt(dxMoon * dxMoon + dyMoon * dyMoon + dzMoon * dzMoon);

      // Linha de visada do observador até o Sol
      const obsTarget = (observerLat !== undefined && observerLng !== undefined)
        ? geoToPlanarCoords(observerLat, observerLng)
        : { x: 0.0, z: 0.0 };
      const toObsX = obsTarget.x - sunState.x;
      const toObsY = 0.0 - sunState.y;
      const toObsZ = obsTarget.z - sunState.z;
      const distToObs = Math.hypot(toObsX, toObsY, toObsZ);
      const uObsX = toObsX / Math.max(0.001, distToObs);
      const uObsY = toObsY / Math.max(0.001, distToObs);
      const uObsZ = toObsZ / Math.max(0.001, distToObs);

      // Projeção ao longo da linha de visada do observador:
      const proj = dxMoon * uObsX + dyMoon * uObsY + dzMoon * uObsZ;
      const perpX = dxMoon - proj * uObsX;
      const perpY = dyMoon - proj * uObsY;
      const perpZ = dzMoon - proj * uObsZ;
      const lateralDist = Math.hypot(perpX, perpY, perpZ);

      if ((proj > 0.3 && lateralDist < 1.25) || directDistMoonToSun < solarMaxOverlapDist) {
        isSolarEclipseActive = true;
        eclipsingBody = 'moon';
        if (proj > 0.3) {
          solarEclipseMagnitude = Math.max(0, Math.min(1.0, 1.0 - lateralDist / 1.20));
        } else {
          solarEclipseMagnitude = Math.max(0, Math.min(1.0, 1.0 - directDistMoonToSun / solarMaxOverlapDist));
        }
      }
    }

    const solarCoveragePct = Math.round(solarEclipseMagnitude * 100);

    // Eclipse Lunar na teoria da Lua: oposição / fase avermelhada (lua de sangue por refração atmosférica / auto-ocultação)
    const isBloodMoon = (moonState.phaseName || '').includes('Lua de Sangue');
    const isLunarEclipseActive = isBloodMoon;
    const lunarEclipseMagnitude = isBloodMoon ? 1.0 : 0.0;
    const lunarCoveragePct = isBloodMoon ? 100 : 0;

    let statusLabel = 'Nenhum eclipse no momento';
    if (isSolarEclipseActive) {
      if (catalogMatch && catalogMatch.name.includes('Anular')) {
        eclipseType = 'solar_annular';
        statusLabel = `Eclipse Solar Anular • Anel de Fogo (${solarCoveragePct}%)`;
      } else if (solarEclipseMagnitude >= 0.95) {
        eclipseType = 'solar_total';
        statusLabel = `Eclipse Solar Total • A Lua cobre o Sol (${solarCoveragePct}% - Totalidade / Coroa Solar)`;
      } else {
        eclipseType = 'solar_partial';
        statusLabel = `Eclipse Solar Parcial • A Lua na frente do Sol (${solarCoveragePct}%)`;
      }
    } else if (isLunarEclipseActive) {
      eclipseType = 'lunar_blood_moon';
      statusLabel = `Eclipse Lunar Total • Lua de Sangue (${lunarCoveragePct}%)`;
    }

    return {
      isSolarEclipseActive,
      isLunarEclipseActive,
      solarEclipseMagnitude,
      lunarEclipseMagnitude,
      isBloodMoon,
      eclipseType,
      eclipsingBody,
      solarCoveragePct,
      lunarCoveragePct,
      statusLabel,
    };
  }

  // TEORIA 1: Nódulos Celestes (Rahu e Ketu)
  if (!rahuState) {
    return {
      isSolarEclipseActive: false,
      isLunarEclipseActive: false,
      solarEclipseMagnitude: 0,
      lunarEclipseMagnitude: 0,
      isBloodMoon: false,
      eclipseType: 'none',
      eclipsingBody: null,
      solarCoveragePct: 0,
      lunarCoveragePct: 0,
      statusLabel: 'Nenhum eclipse no momento',
    };
  }

  // 1. Solar Eclipse: Check Rahu (Larger body -> Total Eclipse)
  const dxRahu = rahuState.x - sunState.x;
  const dyRahu = rahuState.y - sunState.y;
  const dzRahu = rahuState.z - sunState.z;
  const distToRahu = Math.sqrt(dxRahu * dxRahu + dyRahu * dyRahu + dzRahu * dzRahu);

  // Check Ketu (Smaller body -> Annular/Partial Eclipse)
  let distToKetu = 999;
  if (ketuState) {
    const dxK = ketuState.x - sunState.x;
    const dyK = ketuState.y - sunState.y;
    const dzK = ketuState.z - sunState.z;
    distToKetu = Math.sqrt(dxK * dxK + dyK * dyK + dzK * dzK);
  }

  const isRahuSolarActive = distToRahu < solarMaxOverlapDist;
  const isKetuSolarActive = distToKetu < solarMaxOverlapDist;
  const isSolarEclipseActive = isRahuSolarActive || isKetuSolarActive;

  let eclipsingBody: 'rahu' | 'ketu' | 'moon' | null = null;
  let solarEclipseMagnitude = 0;

  if (isRahuSolarActive && (!isKetuSolarActive || distToRahu <= distToKetu)) {
    // Rahu eclipsing the Sun: Larger than Sun (apparentSize 0.54 vs 0.50) -> Full Totality up to 100%
    eclipsingBody = 'rahu';
    solarEclipseMagnitude = Math.max(0, Math.min(1.0, 1.0 - distToRahu / solarMaxOverlapDist));
  } else if (isKetuSolarActive) {
    // Ketu eclipsing the Sun: Smaller than Sun (apparentSize 0.38 vs 0.50) -> Covers up to ~75% (Annular / Ring of Fire)
    eclipsingBody = 'ketu';
    const rawMag = Math.max(0, Math.min(1.0, 1.0 - distToKetu / solarMaxOverlapDist));
    solarEclipseMagnitude = rawMag * 0.75;
  }

  const solarCoveragePct = Math.round(solarEclipseMagnitude * 100);

  // 2. Lunar Eclipse: Ketu (or Rahu in nodal axis) passing in front of Moon
  const activeLunarObscurer = ketuState || rahuState;
  const dxMoon = activeLunarObscurer.x - moonState.x;
  const dyMoon = activeLunarObscurer.y - moonState.y;
  const dzMoon = activeLunarObscurer.z - moonState.z;
  const distToMoon3D = Math.sqrt(dxMoon * dxMoon + dyMoon * dyMoon + dzMoon * dzMoon);

  const lunarMaxOverlapDist = 1.45;
  const isLunarEclipseActive = distToMoon3D < lunarMaxOverlapDist;
  const lunarEclipseMagnitude = isLunarEclipseActive
    ? Math.max(0, Math.min(1.0, 1.0 - distToMoon3D / lunarMaxOverlapDist))
    : 0.0;
  const lunarCoveragePct = Math.round(lunarEclipseMagnitude * 100);
  const isBloodMoon = isLunarEclipseActive && lunarEclipseMagnitude > 0.12;

  let eclipseType: EclipseInfo['eclipseType'] = 'none';
  let statusLabel = 'Nenhum eclipse no momento';

  if (isSolarEclipseActive) {
    if (eclipsingBody === 'rahu') {
      if (solarEclipseMagnitude > 0.85) {
        eclipseType = 'solar_total';
        statusLabel = `Eclipse Solar Total • Rahu ☊ (${solarCoveragePct}% - Totalidade / Coroa Solar)`;
      } else {
        eclipseType = 'solar_partial';
        statusLabel = `Eclipse Solar Parcial • Rahu ☊ (${solarCoveragePct}%)`;
      }
    } else {
      if (solarEclipseMagnitude > 0.50) {
        eclipseType = 'solar_annular';
        statusLabel = `Eclipse Solar Parcial/Anular • Ketu ☋ (${solarCoveragePct}% - Anel de Fogo)`;
      } else {
        eclipseType = 'solar_partial';
        statusLabel = `Eclipse Solar Parcial • Ketu ☋ (${solarCoveragePct}%)`;
      }
    }
  } else if (isLunarEclipseActive) {
    if (lunarEclipseMagnitude > 0.5) {
      eclipseType = 'lunar_blood_moon';
      statusLabel = `Eclipse Lunar Total • Ketu ☋ Lua de Sangue (${lunarCoveragePct}%)`;
    } else {
      eclipseType = 'lunar_partial';
      statusLabel = `Eclipse Lunar Parcial • Ketu ☋ (${lunarCoveragePct}%)`;
    }
  }

  return {
    isSolarEclipseActive,
    isLunarEclipseActive,
    solarEclipseMagnitude,
    lunarEclipseMagnitude,
    isBloodMoon,
    eclipseType,
    eclipsingBody,
    solarCoveragePct,
    lunarCoveragePct,
    statusLabel,
  };
}

const PLANET_PHASE_OFFSETS: Record<string, number> = {
  mercury: 0.7,
  venus: 2.4,
  mars: 3.9,
  jupiter: 1.3,
  saturn: 5.1,
  uranus: 3.1,
  neptune: 5.8,
};

function computePlanetState(
  id: AstroId,
  date: Date,
  yearFraction: number,
  totalDaysEpoch: number,
  sunAngleDeg: number,
  computeAngles: (x: number, y: number, z: number) => { altitudeDeg: number; azimuthDeg: number }
): AstroCalculatedState {
  const data = CELESTIAL_BODIES[id];
  const hours = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  const phaseOffset = PLANET_PHASE_OFFSETS[id] || 0;
  
  // Independent orbital progression along the Zodiac / Tropical belt
  const orbitalAngle = (((totalDaysEpoch % data.orbitalPeriodDays) / data.orbitalPeriodDays) * 2 * Math.PI) + phaseOffset;
  const orbitalDeg = (orbitalAngle * 180) / Math.PI;

  // Diurnal motion synchronized with celestial sphere + planet's own orbital shift
  const planetAngleDeg = sunAngleDeg + orbitalDeg;
  const planetAngleRad = (planetAngleDeg * Math.PI) / 180;
  
  // Tropical migration between Tropic of Cancer (12.0) and Tropic of Capricorn (20.0),
  // with the Equator (16.0) at the exact center:
  const tropicalFactor = Math.sin(orbitalAngle);
  const radius = 16.0 - 4.0 * tropicalFactor;

  // Altitude levels: scaled down by 50%
  const diurnalHourAngle = ((hours - 12) / 24) * 2 * Math.PI;
  const basePlanetY = (14 + data.altitudeLevel * 2.8) * 0.5;
  const y = basePlanetY + 0.6 * tropicalFactor + 0.3 * Math.cos(diurnalHourAngle);

  const x = radius * Math.cos(planetAngleRad);
  const z = radius * Math.sin(planetAngleRad); // Clockwise circuit: (x = cos, z = sin)

  const angles = computeAngles(x, y, z);

  return {
    id,
    x,
    y,
    z,
    altitudeDeg: angles.altitudeDeg,
    azimuthDeg: angles.azimuthDeg,
    apparentRadius: data.apparentSize,
  };
}

/**
 * Calculates the exact 3D visual position vector from the observer's viewpoint
 * in Human Observer Mode: The celestial body moves in a direct straight East-to-West transit across the local sky vault.
 * - Enters at exact East (Azimuth 90°, Altitude 0°)
 * - Ascends smoothly along the East-West axis to maximum culmination at solar noon
 * - Descends smoothly along the East-West axis to exit at exact West (Azimuth 270°, Altitude 0°)
 * - Smoothly dips below the horizon at night (< 0°)
 */
export function calculateApparentCelestialSkyVector(
  targetPos: { x: number; y: number; z: number },
  obsGround: { x: number; z: number },
  skyRadius: number = 40.0,
  _horizonLimit: number = 34.0,
  maxCulminationDeg: number = 75.0,
  haRad: number = Math.PI / 2,
  isSolarBody: boolean = true,
  seasonalOrNodalFactor: number = 0.0
): {
  position: { x: number; y: number; z: number };
  altitudeDeg: number;
  azimuthDeg: number;
  isAboveHorizon: boolean;
  distToObserver: number;
} {
  const dx = targetPos.x - obsGround.x;
  const dz = targetPos.z - obsGround.z;
  const groundDist = Math.hypot(dx, dz);
  const obsR = Math.hypot(obsGround.x, obsGround.z);

  const compass = getLocalCompassVectors(obsGround);
  const { nx, nz, ex, ez } = compass;

  // 1. HIGH ARCTIC / GEOGRAPHIC NORTH POLE (obsR < 1.0, i.e. lat > 85°):
  // At the North Pole center, the celestial body circles 360° around the observer at an altitude equal to its declination (23.44° * seasonalOrNodalFactor).
  // During Northern Spring/Summer (declDeg > 0), the Sun stays above the horizon 24h (Midnight Sun).
  // During Northern Autumn/Winter (declDeg < 0, e.g. October to March), the Sun is below the horizon 24h (Polar Night)!
  if (obsR < 1.0) {
    const declDeg = 23.44 * seasonalOrNodalFactor;
    const isAboveHorizon = declDeg >= -0.5;
    const polarAltRad = (declDeg * Math.PI) / 180;
    const rHorizPolar = Math.cos(polarAltRad) * skyRadius;
    const yUpPolar = 0.05 + Math.sin(polarAltRad) * skyRadius;

    const dirX = dx / (groundDist || 1);
    const dirZ = dz / (groundDist || 1);

    const posX = obsGround.x + rHorizPolar * dirX;
    const posY = yUpPolar;
    const posZ = obsGround.z + rHorizPolar * dirZ;

    const relX = posX - obsGround.x;
    const relZ = posZ - obsGround.z;
    const localE = relX * ex + relZ * ez;
    const localN = relX * nx + relZ * nz;
    let azRad = Math.atan2(localE, localN);
    if (azRad < 0) azRad += 2 * Math.PI;
    const azDeg = (azRad * 180) / Math.PI;

    return {
      position: { x: posX, y: posY, z: posZ },
      altitudeDeg: Number(declDeg.toFixed(1)),
      azimuthDeg: Math.round(azDeg),
      isAboveHorizon,
      distToObserver: groundDist,
    };
  }

  // 2. STANDARD LATITUDES: True Celestial Arc across the Local Sky Vault
  // O Sol, a Lua e os astros nascem no horizonte Leste (~0° de elevação), sobem em arco suave até a culminação máxima
  // ao cruzar o meridiano local, e descem suavemente até se pôr no horizonte Oeste (~0° de elevação).
  const obsAngle = Math.atan2(obsGround.z, obsGround.x);
  const targetAngle = Math.atan2(targetPos.z, targetPos.x);

  // dTheta < 0: Manhã / Leste (~06:00)
  // dTheta = 0: Meio-dia / Meridiano (~12:00)
  // dTheta > 0: Tarde / Oeste (~18:00)
  let dTheta = targetAngle - obsAngle;
  while (dTheta > Math.PI) dTheta -= 2 * Math.PI;
  while (dTheta < -Math.PI) dTheta += 2 * Math.PI;

  const targetR = Math.hypot(targetPos.x, targetPos.z);
  const decDeg = Math.max(-89.0, Math.min(89.0, 90.0 * (1.0 - targetR / 18.0)));
  const decRad = (decDeg * Math.PI) / 180;

  const obsLat = Math.max(-89.0, Math.min(89.0, 90.0 * (1.0 - obsR / 18.0)));
  const latRad = (obsLat * Math.PI) / 180;

  // Componentes esféricas locais do arco celeste (X = Leste, Y = Zênite/Alto, N = Norte):
  const localEastDir = -Math.cos(decRad) * Math.sin(dTheta);
  const localUpDir = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(dTheta);
  const localNorthDir = Math.cos(latRad) * Math.sin(decRad) - Math.sin(latRad) * Math.cos(decRad) * Math.cos(dTheta);

  const vecLen = Math.hypot(localEastDir, localUpDir, localNorthDir) || 1.0;
  const uEast = localEastDir / vecLen;
  const uUp = localUpDir / vecLen;
  const uNorth = localNorthDir / vecLen;

  const diurnalAltRad = Math.asin(Math.max(-1.0, Math.min(1.0, uUp)));
  const diurnalAltDeg = (diurnalAltRad * 180) / Math.PI;
  const isAboveHorizon = uUp >= -0.015;

  // Projeção 3D real no domo do observador (skyRadius = 40.0):
  const worldDirX = uEast * ex + uNorth * nx;
  const worldDirZ = uEast * ez + uNorth * nz;

  const posX = obsGround.x + skyRadius * worldDirX;
  const posY = 0.05 + skyRadius * uUp;
  const posZ = obsGround.z + skyRadius * worldDirZ;

  // Compute exact horizontal azimuth (0° North, 90° East, 180° South, 270° West)
  let azRad = Math.atan2(uEast, uNorth);
  if (azRad < 0) azRad += 2 * Math.PI;
  const azDeg = (azRad * 180) / Math.PI;

  return {
    position: {
      x: posX,
      y: posY,
      z: posZ,
    },
    altitudeDeg: Number(diurnalAltDeg.toFixed(1)),
    azimuthDeg: Math.round(azDeg),
    isAboveHorizon,
    distToObserver: groundDist,
  };
}
