import * as THREE from 'three';
import satelliteMapHD from '../assets/images/gleason_satellite_hd_1787672155271.jpg';
import { WORLD_CITIES } from '../data/cities';
import { WORLD_OCEAN_CURRENTS } from '../data/oceanCurrentsData';
import { GLEASON_MAP_ANGLE_OFFSET_DEG } from './astronomy';

// Photographic Satellite Map Angular Calibration:
// 0.0° provides 1:1 true alignment between the Azimuthal Equidistant satellite imagery and mathematical GPS coordinates
const SATELLITE_IMG_ROTATION_RAD = 0.0;

// Shared preloaded satellite image singleton to ensure instant photographic satellite map rendering on boot
let sharedSatelliteImg: HTMLImageElement | null = null;
const satelliteImgCallbacks: Array<(img: HTMLImageElement) => void> = [];

function getOrLoadSatelliteImage(callback: (img: HTMLImageElement) => void): HTMLImageElement | null {
  if (typeof window === 'undefined') return null;
  if (!sharedSatelliteImg) {
    sharedSatelliteImg = new Image();
    sharedSatelliteImg.crossOrigin = 'anonymous';
    sharedSatelliteImg.src = satelliteMapHD;
    sharedSatelliteImg.onload = () => {
      const img = sharedSatelliteImg!;
      const cbs = [...satelliteImgCallbacks];
      satelliteImgCallbacks.length = 0;
      cbs.forEach((cb) => {
        try {
          cb(img);
        } catch (err) {
          console.error('Error in satellite callback:', err);
        }
      });
    };
  }
  if (sharedSatelliteImg.complete && sharedSatelliteImg.naturalWidth > 0) {
    const img = sharedSatelliteImg;
    // Always defer execution to microtask so callers complete variable assignment before callback runs
    queueMicrotask(() => {
      try {
        callback(img);
      } catch (err) {
        console.error('Error in satellite microtask callback:', err);
      }
    });
    return sharedSatelliteImg;
  }
  satelliteImgCallbacks.push(callback);
  return null;
}

// Start immediate eager download & decode of satellite image
if (typeof window !== 'undefined') {
  getOrLoadSatelliteImage(() => {});
}

/**
 * Authentic Glaciological Crevasse / Fissure Model (Trincas e Fendas Antárticas)
 * Each crevasse is completely UNIQUE and ASYMMETRICAL:
 * - Different positions, lengths, penetration depths, shear angles, zigzag frequencies, and branching patterns
 * - Glacial colors: pure white firn snow crests, crystalline cyan/turquoise ice walls, deep glacial azure
 * - Strictly ZERO black paint/ink (#000000 banned) and ZERO water holes cutting the ice!
 */
export interface RealisticIceCrack {
  id: string;
  name: string;
  angle: number;           // Polar angle in radians around Antarctica (irregularly distributed)
  startFrac: number;       // Where crevasse begins across wall thickness (0.0 = inner coast, 1.0 = outer ocean cliff)
  endFrac: number;         // Where crevasse terminates across wall thickness
  tangentialDrift: number; // Tangential slant (diagonal shear fracture vs radial)
  waveFreq1: number;       // Primary zigzag frequency
  waveAmp1: number;        // Primary zigzag amplitude (in radians)
  waveFreq2: number;       // Micro-fracture roughness frequency
  waveAmp2: number;        // Micro-fracture roughness amplitude
  sharpness: number;       // Fracture angularity
  lineWidth: number;       // Crevasse width in pixels (narrow realistic scale)
  hasBranch?: boolean;     // Whether crevasse forks into a secondary branch
  branchFrac?: number;     // Point along crevasse where fork occurs
  branchAngle?: number;    // Angular deviation of branch
  branchLen?: number;      // Length fraction of branch
}

export const REALISTIC_ICE_CRACKS: RealisticIceCrack[] = [
  // 1. Weddell Sea Sinuous Fissure (Atlantic Sector) - Enters from inner coast, forks near mid-shelf
  {
    id: 'weddell',
    name: 'Fissura de Weddell',
    angle: -0.74, // ~ -42°
    startFrac: 0.0,
    endFrac: 0.48,
    tangentialDrift: 0.12,
    waveFreq1: 0.09,
    waveAmp1: 0.016,
    waveFreq2: 0.28,
    waveAmp2: 0.007,
    sharpness: 2.2,
    lineWidth: 2.2,
    hasBranch: true,
    branchFrac: 0.35,
    branchAngle: -0.024,
    branchLen: 0.22,
  },
  // 2. Ross Sea Diagonal Shear Fault (South Pacific) - Grand diagonal fault across mid-plateau
  {
    id: 'ross',
    name: 'Grande Fenda Diagonal de Ross',
    angle: 2.68, // ~ +154°
    startFrac: 0.22, // Starts deep in interior ice sheet
    endFrac: 0.82,
    tangentialDrift: -0.32, // Strong diagonal shear line across glacial plateau
    waveFreq1: 0.06,
    waveAmp1: 0.012,
    waveFreq2: 0.18,
    waveAmp2: 0.005,
    sharpness: 3.2,
    lineWidth: 2.6,
    hasBranch: false,
  },
  // 3. Amery Ocean Crevasse (Indian Ocean Sector) - Penetrates inward from the outer ocean cliff face
  {
    id: 'amery',
    name: 'Canal Glacial de Amery',
    angle: 1.25, // ~ +72°
    startFrac: 1.0,  // Originates at outer ocean cliff face!
    endFrac: 0.58,   // Tapers to a point entering the continent
    tangentialDrift: -0.07,
    waveFreq1: 0.12,
    waveAmp1: 0.015,
    waveFreq2: 0.34,
    waveAmp2: 0.006,
    sharpness: 1.8,
    lineWidth: 2.4,
    hasBranch: true,
    branchFrac: 0.42,
    branchAngle: 0.028,
    branchLen: 0.20,
  },
  // 4. Marie Byrd S-Curve Rift (South Pacific) - Meandering, curved tectonic fissure
  {
    id: 'marie_byrd',
    name: 'Fissura Meandro de Marie Byrd',
    angle: -2.32, // ~ -133°
    startFrac: 0.06,
    endFrac: 0.60,
    tangentialDrift: 0.18,
    waveFreq1: 0.14,
    waveAmp1: 0.022,
    waveFreq2: 0.40,
    waveAmp2: 0.009,
    sharpness: 1.5,
    lineWidth: 1.9,
    hasBranch: false,
  },
  // 5. Queen Maud Y-Bifurcated Crevasse (South Atlantic) - True Y-shaped fracture
  {
    id: 'queen_maud',
    name: 'Fenda em Y da Terra da Rainha Maud',
    angle: -0.16, // ~ -9°
    startFrac: 0.0,
    endFrac: 0.66,
    tangentialDrift: -0.05,
    waveFreq1: 0.08,
    waveAmp1: 0.010,
    waveFreq2: 0.22,
    waveAmp2: 0.005,
    sharpness: 2.0,
    lineWidth: 2.1,
    hasBranch: true,
    branchFrac: 0.32,
    branchAngle: 0.035,
    branchLen: 0.30,
  },
  // 6. Wilkes Smooth Arc Fissure (Southern Ocean) - Sweeping curved glacial arc
  {
    id: 'wilkes',
    name: 'Arco Glacial de Wilkes',
    angle: 1.90, // ~ +109°
    startFrac: 0.30,
    endFrac: 0.74,
    tangentialDrift: 0.35, // Sweeping curved circular contour
    waveFreq1: 0.05,
    waveAmp1: 0.008,
    waveFreq2: 0.15,
    waveAmp2: 0.004,
    sharpness: 1.2,
    lineWidth: 1.7,
    hasBranch: false,
  },
  // 7. Enderby Stepped Jagged Fracture (Indian Sector) - Angular staircase shear
  {
    id: 'enderby',
    name: 'Trinca Escalonada de Enderby',
    angle: 0.52, // ~ +30°
    startFrac: 0.0,
    endFrac: 0.50,
    tangentialDrift: -0.15,
    waveFreq1: 0.20,
    waveAmp1: 0.025,
    waveFreq2: 0.52,
    waveAmp2: 0.011,
    sharpness: 4.2, // Very sharp jagged angles
    lineWidth: 2.0,
    hasBranch: false,
  },
  // 8. Bellingshausen Hairline Crevasse (Antarctic Peninsula) - Fine coastal tension crack
  {
    id: 'bellingshausen',
    name: 'Micro-Fissura de Bellingshausen',
    angle: -1.22, // ~ -70°
    startFrac: 0.38,
    endFrac: 0.94,
    tangentialDrift: 0.08,
    waveFreq1: 0.16,
    waveAmp1: 0.014,
    waveFreq2: 0.45,
    waveAmp2: 0.006,
    sharpness: 2.0,
    lineWidth: 1.4,
    hasBranch: false,
  },
];

// Backwards-compatibility export
export const ICE_WALL_CRACK_ANGLES = REALISTIC_ICE_CRACKS.map((c) => c.angle);

/**
 * Computes organic, natural undulating inner and outer radii for the Antarctic Ice Wall.
 * Wide, monumental ice shelf extending significantly outwards without any gaps or water holes.
 */
export function getIceWallRadii(angle: number, baseInnerR: number, baseThickness: number): { startR: number; endR: number } {
  // Multi-scale natural glacial coastlines (Ross & Ronne bays, Amery lobe, capes)
  const f1 = Math.sin(angle * 2.0 + 0.35) * 12.0;
  const f2 = Math.cos(angle * 5.0 - 1.10) * 8.0;
  const f3 = Math.sin(angle * 11.0 + 2.15) * 4.5;
  const f4 = Math.cos(angle * 19.0 + 0.85) * 2.5;

  const t1 = Math.cos(angle * 3.0 + 1.2) * 5.0;
  const t2 = Math.sin(angle * 8.0 - 0.6) * 3.0;

  const startR = baseInnerR - 4 + (f1 + f2 + f3 + f4);
  // Guarantee the ice wall extends continuously and fully outwards beyond the map boundary (100% preenchido, SEM lacunas ou partes vazias!)
  const endR = Math.max(startR + baseThickness + (t1 + t2), baseInnerR + baseThickness + 24);

  return { startR, endR };
}

/**
 * Calculates crevasse proximity factor: 0.0 = deep in crevasse, 1.0 = solid undisturbed ice.
 * Evaluates proximity to the 8 unique, irregular glacial rifts.
 */
export function getIceWallCrackFactor(dist: number, angle: number, startR: number, endR: number): number {
  const wallWidth = Math.max(1, endR - startR);
  const wallFrac = (dist - startR) / wallWidth;

  if (wallFrac < -0.05 || wallFrac > 1.05) return 1.0;

  let minFactor = 1.0;

  for (let i = 0; i < REALISTIC_ICE_CRACKS.length; i++) {
    const crack = REALISTIC_ICE_CRACKS[i];
    const minFrac = Math.min(crack.startFrac, crack.endFrac);
    const maxFrac = Math.max(crack.startFrac, crack.endFrac);

    // If point is outside the radial extent of this specific crevasse, skip
    if (wallFrac < minFrac - 0.04 || wallFrac > maxFrac + 0.04) continue;

    const t = (wallFrac - crack.startFrac) / Math.max(0.001, Math.abs(crack.endFrac - crack.startFrac));
    const relDist = (dist - startR);

    // Multi-frequency organic meandering along this specific crevasse
    const meander =
      Math.sin(relDist * crack.waveFreq1) * crack.waveAmp1 +
      Math.cos(relDist * crack.waveFreq2) * crack.waveAmp2 +
      crack.tangentialDrift * (wallFrac - crack.startFrac);

    const crackAngle = crack.angle + meander;
    let diff = Math.abs(angle - crackAngle);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;

    // Converted to approximate linear pixel distance
    const linDist = diff * dist;
    const halfWidth = crack.lineWidth * 0.75;
    const fadeWidth = crack.lineWidth * 1.5;

    if (linDist < halfWidth + fadeWidth) {
      const factor = Math.min(1.0, Math.max(0.0, (linDist - halfWidth) / fadeWidth));
      if (factor < minFactor) minFactor = factor;
    }

    // Check secondary branch if applicable
    if (crack.hasBranch && crack.branchFrac !== undefined && crack.branchAngle !== undefined) {
      if (wallFrac >= crack.branchFrac - 0.03 && wallFrac <= crack.branchFrac + (crack.branchLen || 0.2) + 0.03) {
        const branchT = (wallFrac - crack.branchFrac) / Math.max(0.001, crack.branchLen || 0.2);
        const branchAngleTarget = crackAngle + crack.branchAngle * branchT;
        let bDiff = Math.abs(angle - branchAngleTarget);
        if (bDiff > Math.PI) bDiff = 2 * Math.PI - bDiff;
        const bLinDist = bDiff * dist;
        if (bLinDist < halfWidth * 0.8 + fadeWidth * 0.8) {
          const factor = Math.min(1.0, Math.max(0.0, (bLinDist - halfWidth * 0.8) / (fadeWidth * 0.8)));
          if (factor < minFactor) minFactor = factor;
        }
      }
    }
  }

  return minFactor;
}

/**
 * Draws a photorealistic Antarctic Ice Wall barrier:
 * - Thick, wide, monumental glacial continent extending significantly outwards
 * - Solid, 100% continuous ice sheet (NO gaps, NO holes, NO water between the ice)
 * - Authentic glaciology: pure white firn snow, sastrugi wind lines, cyan/turquoise ice walls, glacial azure shadows
 * - Strictly ZERO black paint or black ink lines
 * - 8 completely unique, asymmetrical crevasses (different positions, lengths, angles, branches)
 */
export function drawAntarcticIceWallRealistic(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  innerRadius: number,
  maxRadius: number
) {
  ctx.save();

  // Thick, majestic Antarctic glacial plateau extending outwards to maxRadius
  const baseThickness = maxRadius - innerRadius;
  const numSteps = 512;

  // 1. Precalculate organic inner and outer boundary points
  const innerPts: { x: number; y: number; r: number; a: number }[] = [];
  const outerPts: { x: number; y: number; r: number; a: number }[] = [];

  for (let i = 0; i <= numSteps; i++) {
    const a = (i / numSteps) * Math.PI * 2;
    const { startR, endR } = getIceWallRadii(a, innerRadius, baseThickness);
    // Outer edge conforms cleanly to and beyond outer boundary (100% preenchido sem lacunas!)
    const clampedEndR = Math.max(maxRadius + 16, endR);
    innerPts.push({ x: cx + Math.cos(a) * startR, y: cy + Math.sin(a) * startR, r: startR, a });
    outerPts.push({ x: cx + Math.cos(a) * clampedEndR, y: cy + Math.sin(a) * clampedEndR, r: clampedEndR, a });
  }

  // 2. Main Solid Glacial Ice Shelf Body (100% continuous ice, no water holes or unfilled gaps!)
  ctx.beginPath();
  for (let i = 0; i <= numSteps; i++) {
    if (i === 0) ctx.moveTo(innerPts[i].x, innerPts[i].y);
    else ctx.lineTo(innerPts[i].x, innerPts[i].y);
  }
  for (let i = numSteps; i >= 0; i--) {
    ctx.lineTo(outerPts[i].x, outerPts[i].y);
  }
  ctx.closePath();

  // Photorealistic Glacial Ice & Firn Snow Gradient:
  // Authentic continental ice sheet: dazzling pure white firn snow, ZERO blue paint, ZERO blue stripes!
  const avgInnerR = innerRadius - 4;
  const avgOuterR = maxRadius + 16;
  const iceGrad = ctx.createRadialGradient(cx, cy, avgInnerR, cx, cy, avgOuterR);
  iceGrad.addColorStop(0.00, 'rgba(255, 255, 255, 0.70)'); // Translucent inner ice shelf margin in ocean
  iceGrad.addColorStop(0.05, '#f8fafc');                    // Clean compacted firn snow coastline
  iceGrad.addColorStop(0.12, '#ffffff');                    // Brilliant eternal white continental snow
  iceGrad.addColorStop(0.50, '#ffffff');                    // Vast high-altitude polar plateau
  iceGrad.addColorStop(0.85, '#ffffff');                    // Outer continental snowfields
  iceGrad.addColorStop(0.96, '#f8fafc');                    // Outer firn rim
  iceGrad.addColorStop(1.00, '#ffffff');                    // Pure white outer barrier boundary (all the way out)
  ctx.fillStyle = iceGrad;
  ctx.fill();

  // 3. Realistic Wind-Blown Polar Sastrugi (Gentle white & pale firn drifts, zero blue, zero black)
  ctx.lineWidth = 1.1;
  for (let s = 0; s < 220; s++) {
    const sAngle = (s / 220) * Math.PI * 2 + (s % 5) * 0.004;
    const { startR, endR } = getIceWallRadii(sAngle, innerRadius, baseThickness);
    const clampedEndR = Math.max(maxRadius + 8, endR);
    const r1 = startR + (clampedEndR - startR) * (0.08 + (s % 7) * 0.03);
    const r2 = startR + (clampedEndR - startR) * (0.85 + (s % 5) * 0.02);
    ctx.strokeStyle = s % 2 === 0 ? 'rgba(255, 255, 255, 0.45)' : 'rgba(241, 245, 249, 0.30)';
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(sAngle) * r1, cy + Math.sin(sAngle) * r1);
    const wave = Math.sin(s * 0.6) * 0.006;
    ctx.lineTo(cx + Math.cos(sAngle + wave) * r2, cy + Math.sin(sAngle + wave) * r2);
    ctx.stroke();
  }

  // 4. Calved Ice Floes & Tabular Icebergs along Coastlines (Pure white floating ice)
  ctx.fillStyle = '#ffffff';
  for (let b = 0; b < 160; b++) {
    const bAngle = (b / 160) * Math.PI * 2 + Math.sin(b * 1.7) * 0.02;
    const { startR } = getIceWallRadii(bAngle, innerRadius, baseThickness);
    // Inner sea-ice floes near the coast
    const inDist = startR - 3 - (b % 6) * 2.0;
    const inSize = 1.0 + (b % 3) * 0.8;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(bAngle) * inDist, cy + Math.sin(bAngle) * inDist, inSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Draw 8 COMPLETELY UNIQUE Glacial Crevasses (Trincas e Fendas)
  // 100% SEM TINTA PRETA e SEM BURACO OU AGUA ENTRE OS GELOS!
  for (let i = 0; i < REALISTIC_ICE_CRACKS.length; i++) {
    const crack = REALISTIC_ICE_CRACKS[i];
    const { startR, endR } = getIceWallRadii(crack.angle, innerRadius, baseThickness);
    const wallW = Math.max(1, endR - startR);

    // Compute path points for this unique crevasse
    const rStart = startR + wallW * crack.startFrac;
    const rEnd = startR + wallW * crack.endFrac;
    const steps = 36;
    const pts: { x: number; y: number; r: number; a: number }[] = [];

    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const r = rStart + (rEnd - rStart) * t;
      const relD = r - startR;
      const wallFrac = (r - startR) / wallW;

      const meander =
        Math.sin(relD * crack.waveFreq1) * crack.waveAmp1 +
        Math.cos(relD * crack.waveFreq2) * crack.waveAmp2 +
        crack.tangentialDrift * (wallFrac - crack.startFrac);

      const a = crack.angle + meander;
      pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, r, a });
    }

    const drawCrevassePath = () => {
      ctx.beginPath();
      for (let s = 0; s < pts.length; s++) {
        if (s === 0) ctx.moveTo(pts[s].x, pts[s].y);
        else ctx.lineTo(pts[s].x, pts[s].y);
      }
    };

    // Layer A: Brilliant snow white lip highlight on both edges of the fracture
    drawCrevassePath();
    ctx.lineWidth = crack.lineWidth + 3.8;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Layer B: Subtle natural firn snow shadow (natural depth shading in snow, ZERO blue paint!)
    drawCrevassePath();
    ctx.lineWidth = crack.lineWidth + 2.0;
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();

    // Layer C: Compacted crystalline white firn snow bed filling the crevasse
    drawCrevassePath();
    ctx.lineWidth = crack.lineWidth + 1.0;
    ctx.strokeStyle = '#f1f5f9';
    ctx.stroke();

    // Layer D: Glistening white ice core & snow crust inside the fissure (100% GELO E NEVE BRANCA)
    drawCrevassePath();
    ctx.lineWidth = Math.max(1.1, crack.lineWidth * 0.55);
    ctx.strokeStyle = '#f8fafc';
    ctx.stroke();

    // Layer D2: Pure crystalline frost highlight spine down the ice core
    drawCrevassePath();
    ctx.lineWidth = Math.max(0.7, crack.lineWidth * 0.28);
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Layer E: Frozen ice nodules, ice chunks & snow bridges wedged directly inside the crevasse
    for (let s = 3; s < pts.length - 2; s += 4) {
      const pt = pts[s];
      const iceSize = 1.0 + ((s + i) % 3) * 0.6;
      
      // Ice crystal halo (soft white firn)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, iceSize + 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Solid white ice block / snow bridge
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, iceSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Layer F: Secondary branch if this crevasse forks (e.g. Weddell, Amery, Queen Maud)
    if (crack.hasBranch && crack.branchFrac !== undefined && crack.branchAngle !== undefined) {
      const forkIdx = Math.floor(steps * (crack.branchFrac - crack.startFrac) / Math.max(0.01, crack.endFrac - crack.startFrac));
      if (forkIdx >= 0 && forkIdx < pts.length) {
        const rootPt = pts[forkIdx];
        const branchSteps = 16;
        const branchPts: { x: number; y: number }[] = [rootPt];

        for (let bs = 1; bs <= branchSteps; bs++) {
          const bt = bs / branchSteps;
          const brR = rootPt.r + wallW * (crack.branchLen || 0.22) * bt;
          const brA = rootPt.a + crack.branchAngle * bt + Math.sin(bs * 0.8) * 0.003;
          branchPts.push({ x: cx + Math.cos(brA) * brR, y: cy + Math.sin(brA) * brR });
        }

        const drawBranch = () => {
          ctx.beginPath();
          for (let bs = 0; bs < branchPts.length; bs++) {
            if (bs === 0) ctx.moveTo(branchPts[bs].x, branchPts[bs].y);
            else ctx.lineTo(branchPts[bs].x, branchPts[bs].y);
          }
        };

        // Branch snow lip
        drawBranch();
        ctx.lineWidth = crack.lineWidth + 2.8;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Branch firn snow shadow (natural depth shading, zero blue)
        drawBranch();
        ctx.lineWidth = crack.lineWidth + 1.4;
        ctx.strokeStyle = '#e2e8f0';
        ctx.stroke();

        // Branch compacted white ice bed
        drawBranch();
        ctx.lineWidth = crack.lineWidth + 0.6;
        ctx.strokeStyle = '#f1f5f9';
        ctx.stroke();

        // Branch glistening white ice core
        drawBranch();
        ctx.lineWidth = Math.max(0.8, crack.lineWidth * 0.35);
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Branch ice chunks
        for (let bs = 4; bs < branchPts.length - 1; bs += 4) {
          const bpt = branchPts[bs];
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(bpt.x, bpt.y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Layer G: Delicate radiating tension hairline cracks in crystalline white & pale cyan frost
    for (let tc = 0; tc < 3; tc++) {
      const tcIdx = Math.floor(steps * (0.25 + tc * 0.25));
      if (tcIdx < pts.length) {
        const tcPt = pts[tcIdx];
        const tcDir = (tc + i) % 2 === 0 ? 0.015 : -0.015;
        ctx.beginPath();
        ctx.moveTo(tcPt.x, tcPt.y);
        for (let seg = 1; seg <= 6; seg++) {
          const sR = tcPt.r + (seg * 2.2) * (tcDir > 0 ? 1 : -0.7);
          const sA = tcPt.a + tcDir * (seg / 6) * 1.2 + Math.sin(seg * 1.4) * 0.002;
          ctx.lineTo(cx + Math.cos(sA) * sR, cy + Math.sin(sA) * sR);
        }
        ctx.lineWidth = 0.9;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}

/**
 * Generates ultra high-detail planar map texture with real NASA satellite imagery (Gleason projection),
 * organic coastlines, realistic ocean bathymetry, crisp tropical/equatorial graticules,
 * and Antarctica ice wall.
 */
export function generateFlatEarthTexture(
  showExtraLands = true,
  onLoaded?: (texture: THREE.CanvasTexture) => void,
  includeGraticule = true
): THREE.CanvasTexture {
  const size = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { alpha: true })!;

  const cx = size / 2;
  const cy = size / 2;
  // World continental disc radius is 58.0, Ice Wall (Lat -90) begins at radius 36.0
  // Expanding the ice wall thickness outward across the polar perimeter
  const maxRadius = size / 2;
  const innerRadius = maxRadius * (36.0 / 58.0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;

  const redrawFullScene = (satelliteImg?: HTMLImageElement) => {
    // 1. Clear transparent background - no square borders
    ctx.clearRect(0, 0, size, size);

    // 2. Base canvas background filled with deep oceanic marine tones
    ctx.fillStyle = '#0a203d';
    ctx.fillRect(0, 0, size, size);

    if (satelliteImg && satelliteImg.complete && satelliteImg.naturalWidth > 0) {
      // 2A. Real Satellite Photographic Map Rendering with calibrated 1:1 alignment
      ctx.save();
      ctx.beginPath();
      // Clip strictly to circular disc inside outer ice boundary
      ctx.arc(cx, cy, innerRadius * 1.02, 0, Math.PI * 2);
      ctx.clip();
      
      // Draw photographic satellite image fitting the circular planar world with exact geographic alignment
      const imgSize = innerRadius / 0.4258;
      ctx.drawImage(satelliteImg, cx - imgSize / 2, cy - imgSize / 2, imgSize, imgSize);
      ctx.restore();
    } else {
      // 2B. Procedural High-Definition Photorealistic Fallback (Organic Curves & Terrain)
      const oceanGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerRadius);
      oceanGrad.addColorStop(0, '#0d2a52');
      oceanGrad.addColorStop(0.5, '#0a203d');
      oceanGrad.addColorStop(1.0, '#07172e');
      ctx.fillStyle = oceanGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw Organic Continents with High-Definition Coastlines & Shading
      drawContinentsHD(ctx, cx, cy, innerRadius);
    }

    // 3. Draw Graticules & Astronomical Tropic Lines (only when requested for Planar Map!)
    if (includeGraticule) {
      drawGraticuleLines(ctx, cx, cy, innerRadius);
    }

    // 3B. Draw Daytime World Cities & Geographic Labels
    drawWorldCitiesOnTexture(ctx, cx, cy, innerRadius);

    // 4. Draw Photorealistic Antarctic Ice Wall Barrier, Sastrugi, Nunataks, Calved Icebergs & Natural Chasms (Trincas)
    drawAntarcticIceWallRealistic(ctx, cx, cy, innerRadius, maxRadius);

    texture.needsUpdate = true;
  };

  // Initial draw: if already preloaded, render with satellite image immediately!
  const readyImg = (sharedSatelliteImg && sharedSatelliteImg.complete && sharedSatelliteImg.naturalWidth > 0)
    ? sharedSatelliteImg
    : undefined;
  redrawFullScene(readyImg);

  // When satellite image is loaded/ready, re-render with authentic satellite photography
  getOrLoadSatelliteImage((img) => {
    redrawFullScene(img);
    if (onLoaded) onLoaded(texture);
  });

  return texture;
}

let cachedElevationBuffer: Uint8Array | null = null;

/**
 * High-Precision Physical Hypsometric Elevation Model
 * Calibrated against the Official Physical Topographic World Map:
 * - Depressões (< 0m): Mar Morto (-430m), Depressão de Qattara (-133m), Mar Cáspio (-28m)
 * - Planícies (0 - 500m): Bacia Amazônica (30-150m), Planície da Sibéria Ocidental (40-120m),
 *   Planície do Leste Europeu (20-150m), Bacia do Mississipi (20-220m), Congo (300-420m), Pampas (10-150m)
 * - Planaltos Médios (500 - 1000m): Planalto Central Brasileiro (600-1200m), Planalto do Decão (500-900m),
 *   Planalto Ocidental Australiano (400-800m)
 * - Planaltos Elevados e Serras (1000 - 2000m): Planalto Mexicano (1500-2400m), Highveld Sul-Africano (1000-1800m),
 *   Montes Urais (800-1895m), Grande Cordilheira Divisória (1000-2229m - Kosciuszko)
 * - Cordilheiras Altas (2000 - 4000m): Montanhas Rochosas (2000-4401m), Atlas (1800-4167m - Toubkal),
 *   Pireneus (1800-3404m - Aneto), Balcãs (1500-2925m), Tian Shan / Altai (2500-7439m)
 * - Picos e Cordilheiras Extremas (> 4000m - até 8848m):
 *   - Himalaias & Planalto do Tibete: Monte Everest (8848m), K2 (8611m), Kangchenjunga (8586m)
 *   - Cordilheira dos Andes: Monte Aconcágua (6960m), Huascarán (6768m), Chimborazo (6263m), Altiplano (3800m)
 *   - Cadeia do Alasca / Pacífico Norte: Monte McKinley / Denali (6194m), Monte Logan (6050m)
 *   - África Oriental: Monte Quilimanjaro (5895m), Monte Quênia (5199m)
 *   - Cáucaso: Monte Elbrus (5642m)
 *   - Ilhas da Sonda / Nova Guiné: Puncak Jaya / Pico Java (5029m)
 *   - Alpes Europeus: Monte Branco (4807m), Matterhorn (4478m)
 *   - Austrália: Monte Kosciuszko (2229m)
 */
export function getGeographicElevationMeters(lat: number, lng: number): number {
  // Normalize longitude to [-180, 180]
  let l = lng;
  while (l > 180) l -= 360;
  while (l < -180) l += 360;

  // 1. Antarctica Ice Wall Ring (Lat < -75°)
  if (lat <= -75) {
    const rel = Math.min(1.0, Math.max(0.0, (-75 - lat) / 15));
    return Math.round(1800 + rel * 1400); // 1800m to 3200m ice rampart
  }

  // 2. North Pole Arctic Sea Ice (Lat > 85°)
  if (lat >= 85) {
    return 15; // Sea level pack ice
  }

  // Distance helper in lat/lng space
  const distTo = (tLat: number, tLng: number) => {
    const dLat = lat - tLat;
    let dLng = Math.abs(l - tLng);
    if (dLng > 180) dLng = 360 - dLng;
    // Account for longitude convergence with latitude
    const cosLat = Math.cos((lat * Math.PI) / 180);
    return Math.sqrt(dLat * dLat + (dLng * cosLat) * (dLng * cosLat));
  };

  // Distance to a line segment (representing a mountain ridge axis)
  const distToSegment = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const cosLat = Math.cos(((lat1 + lat2) * 0.5 * Math.PI) / 180);
    const px = (l - lng1) * cosLat;
    const py = lat - lat1;
    const dx = (lng2 - lng1) * cosLat;
    const dy = lat2 - lat1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return distTo(lat1, lng1);
    const t = Math.max(0, Math.min(1, (px * dx + py * dy) / lenSq));
    const projX = lng1 * cosLat + t * dx;
    const projY = lat1 + t * dy;
    const dX = (l * cosLat) - projX;
    const dY = lat - projY;
    return Math.sqrt(dX * dX + dY * dY);
  };

  let maxElev = 40; // Default low continental datum

  // --- HIGHEST MOUNTAIN CHAINS & ICONIC PEAKS (> 4000m) ---

  // A. HIMALAYAS & TIBETAN PLATEAU (Everest 8848m)
  // Tibetan High Plateau (Lat 28° to 36°N, Lng 78° to 100°E)
  if (lat >= 28 && lat <= 36 && l >= 78 && l <= 101) {
    const plateauBase = 4500;
    maxElev = Math.max(maxElev, plateauBase);
  }
  // Himalayan Frontal Ridge (Everest 8848m, K2, Kangchenjunga)
  const dHimalaya = distToSegment(27.5, 76.0, 31.0, 95.0);
  if (dHimalaya < 4.5) {
    const peakEverestDist = distTo(27.9881, 86.9250);
    const peakFactor = peakEverestDist < 1.5 ? Math.max(0, 1.0 - peakEverestDist / 1.5) : 0;
    const ridgeElev = 6500 * Math.max(0, 1.0 - dHimalaya / 4.5) + peakFactor * 2348;
    maxElev = Math.max(maxElev, Math.min(8848, ridgeElev));
  }
  // Karakoram & K2 (Lat 35.88, Lng 76.51)
  const dKarakoram = distTo(35.88, 76.51);
  if (dKarakoram < 3.0) {
    maxElev = Math.max(maxElev, 8611 * Math.max(0, 1.0 - dKarakoram / 3.0));
  }

  // B. ANDES MOUNTAIN RANGE (Aconcagua 6960m)
  // Continuous Western Spine of South America from Colombia/Ecuador down to Patagonia
  const dAndesNorth = distToSegment(8.0, -74.0, -14.0, -72.0);
  const dAndesCentral = distToSegment(-14.0, -72.0, -34.0, -70.0);
  const dAndesSouth = distToSegment(-34.0, -70.0, -54.0, -71.0);
  const dAndes = Math.min(dAndesNorth, dAndesCentral, dAndesSouth);
  if (dAndes < 3.8) {
    const dAconcagua = distTo(-32.6532, -70.0109);
    const aconcaguaFactor = dAconcagua < 1.2 ? Math.max(0, 1.0 - dAconcagua / 1.2) : 0;
    // Bolivian/Peruvian Altiplano baseline
    const altiplano = (lat <= -13 && lat >= -24 && l >= -71 && l <= -65) ? 3800 : 2500;
    const andesRidge = altiplano + (5000 - altiplano) * Math.max(0, 1.0 - dAndes / 3.8) + aconcaguaFactor * 1960;
    maxElev = Math.max(maxElev, Math.min(6960, andesRidge));
  }

  // C. ALASKA RANGE & SAINT ELIAS (McKinley/Denali 6194m, Logan 6050m)
  const dAlaska = distToSegment(59.0, -137.0, 64.0, -153.0);
  if (dAlaska < 3.5) {
    const dDenali = distTo(63.0692, -151.0070);
    const dLogan = distTo(60.5672, -140.4053);
    const denaliFactor = dDenali < 1.2 ? Math.max(0, 1.0 - dDenali / 1.2) : 0;
    const loganFactor = dLogan < 1.2 ? Math.max(0, 1.0 - dLogan / 1.2) : 0;
    const alaskaRidge = 3800 * Math.max(0, 1.0 - dAlaska / 3.5) + denaliFactor * 2394 + loganFactor * 2250;
    maxElev = Math.max(maxElev, Math.min(6194, alaskaRidge));
  }

  // D. CAUCASUS (Mount Elbrus 5642m)
  const dCaucasus = distToSegment(41.8, 40.0, 43.5, 48.0);
  if (dCaucasus < 2.5) {
    const dElbrus = distTo(43.3499, 42.4453);
    const elbrusFactor = dElbrus < 1.0 ? Math.max(0, 1.0 - dElbrus / 1.0) : 0;
    const caucRidge = 3600 * Math.max(0, 1.0 - dCaucasus / 2.5) + elbrusFactor * 2042;
    maxElev = Math.max(maxElev, Math.min(5642, caucRidge));
  }

  // E. EAST AFRICAN HIGHLANDS & KILIMANJARO (5895m)
  const dKilimanjaro = distTo(-3.0674, 37.3556);
  if (dKilimanjaro < 2.0) {
    maxElev = Math.max(maxElev, 1800 + 4095 * Math.max(0, 1.0 - dKilimanjaro / 2.0));
  }
  const dRiftPlateau = distToSegment(6.0, 36.0, -8.0, 35.0);
  if (dRiftPlateau < 3.0) {
    maxElev = Math.max(maxElev, 2200 * Math.max(0, 1.0 - dRiftPlateau / 3.0));
  }

  // F. SUNDA ARC & PUNCAK JAYA / JAVA (5029m)
  const dPuncakJaya = distTo(-4.0847, 137.1866);
  if (dPuncakJaya < 2.5) {
    maxElev = Math.max(maxElev, 5029 * Math.max(0, 1.0 - dPuncakJaya / 2.5));
  }
  const dJavaRidge = distToSegment(-6.5, 106.0, -8.5, 115.0);
  if (dJavaRidge < 1.5) {
    maxElev = Math.max(maxElev, 3400 * Math.max(0, 1.0 - dJavaRidge / 1.5));
  }

  // G. EUROPEAN ALPS (Mont Blanc 4807m)
  const dAlps = distToSegment(44.0, 6.0, 47.5, 14.5);
  if (dAlps < 2.5) {
    const dMontBlanc = distTo(45.8326, 6.8652);
    const mbFactor = dMontBlanc < 0.9 ? Math.max(0, 1.0 - dMontBlanc / 0.9) : 0;
    const alpsRidge = 3200 * Math.max(0, 1.0 - dAlps / 2.5) + mbFactor * 1607;
    maxElev = Math.max(maxElev, Math.min(4807, alpsRidge));
  }

  // H. ROCKY MOUNTAINS & PACIFIC RANGES (4401m)
  const dRockies = distToSegment(33.0, -106.0, 56.0, -122.0);
  if (dRockies < 4.0) {
    const dElbert = distTo(39.1178, -106.4454);
    const dRainier = distTo(46.8523, -121.7603);
    const elbertFactor = dElbert < 1.5 ? Math.max(0, 1.0 - dElbert / 1.5) : 0;
    const rainierFactor = dRainier < 1.2 ? Math.max(0, 1.0 - dRainier / 1.2) : 0;
    const rockiesRidge = 3200 * Math.max(0, 1.0 - dRockies / 4.0) + elbertFactor * 1201 + rainierFactor * 1192;
    maxElev = Math.max(maxElev, Math.min(4401, rockiesRidge));
  }

  // I. TIAN SHAN, PAMIR & ALTAI (2500m - 7439m)
  const dTianShan = distToSegment(40.0, 72.0, 45.0, 88.0);
  if (dTianShan < 3.5) {
    maxElev = Math.max(maxElev, 5500 * Math.max(0, 1.0 - dTianShan / 3.5));
  }

  // J. ATLAS MOUNTAINS (Toubkal 4167m)
  const dAtlas = distToSegment(30.5, -9.0, 35.5, 5.0);
  if (dAtlas < 2.5) {
    const dToubkal = distTo(31.0594, -7.9147);
    const toubkalFactor = dToubkal < 1.0 ? Math.max(0, 1.0 - dToubkal / 1.0) : 0;
    const atlasRidge = 2600 * Math.max(0, 1.0 - dAtlas / 2.5) + toubkalFactor * 1567;
    maxElev = Math.max(maxElev, Math.min(4167, atlasRidge));
  }

  // K. URAL MOUNTAINS (1895m)
  const dUrals = distToSegment(52.0, 58.0, 66.0, 60.0);
  if (dUrals < 2.2) {
    maxElev = Math.max(maxElev, 1895 * Math.max(0, 1.0 - dUrals / 2.2));
  }

  // L. PYRENEES & BALKANS
  const dPyrenees = distToSegment(42.5, -1.0, 42.8, 2.5);
  if (dPyrenees < 1.5) {
    maxElev = Math.max(maxElev, 3404 * Math.max(0, 1.0 - dPyrenees / 1.5));
  }
  const dBalkans = distToSegment(41.5, 21.0, 43.5, 25.5);
  if (dBalkans < 2.0) {
    maxElev = Math.max(maxElev, 2925 * Math.max(0, 1.0 - dBalkans / 2.0));
  }

  // M. GREAT DIVIDING RANGE (Austrália - Kosciuszko 2229m)
  const dAustraliaRange = distToSegment(-17.0, 145.0, -37.5, 148.5);
  if (dAustraliaRange < 2.5) {
    const dKosciuszko = distTo(-36.4559, 148.2636);
    const kosFactor = dKosciuszko < 1.0 ? Math.max(0, 1.0 - dKosciuszko / 1.0) : 0;
    const ausRidge = 1400 * Math.max(0, 1.0 - dAustraliaRange / 2.5) + kosFactor * 829;
    maxElev = Math.max(maxElev, Math.min(2229, ausRidge));
  }

  // N. SERRA DO MAR, MANTIQUEIRA & PLANALTO BRASILEIRO
  const dMantiqueira = distToSegment(-19.5, -42.0, -23.5, -46.5);
  if (dMantiqueira < 2.0) {
    const dPicoBandeira = distTo(-20.4347, -41.7958);
    const banFactor = dPicoBandeira < 0.8 ? Math.max(0, 1.0 - dPicoBandeira / 0.8) : 0;
    const manRidge = 1600 * Math.max(0, 1.0 - dMantiqueira / 2.0) + banFactor * 1292;
    maxElev = Math.max(maxElev, Math.min(2892, manRidge));
  }
  // Pico da Neblina (2995m)
  const dNeblina = distTo(0.8039, -66.0042);
  if (dNeblina < 1.2) {
    maxElev = Math.max(maxElev, 2995 * Math.max(0, 1.0 - dNeblina / 1.2));
  }

  // --- PLATEAUS & HIGHLANDS (500 - 2000m) ---
  // Planalto Central Brasileiro (Brasília / Centro-Oeste)
  if (lat <= -12 && lat >= -22 && l >= -56 && l <= -44) {
    maxElev = Math.max(maxElev, 1100);
  }
  // Planalto Mexicano
  if (lat >= 19 && lat <= 28 && l >= -106 && l <= -98) {
    maxElev = Math.max(maxElev, 1900);
  }
  // Highveld / Planalto Sul-Africano
  if (lat <= -22 && lat >= -32 && l >= 22 && l <= 31) {
    maxElev = Math.max(maxElev, 1600);
  }
  // Planalto Ocidental Australiano
  if (lat <= -20 && lat >= -32 && l >= 116 && l <= 135) {
    maxElev = Math.max(maxElev, 600);
  }
  // Planalto do Decão (Índia)
  if (lat >= 13 && lat <= 21 && l >= 74 && l <= 80) {
    maxElev = Math.max(maxElev, 750);
  }

  // --- MAJOR FLAT LOWLANDS & RIVER BASINS (0 - 500m) ---
  // Bacia Amazônica (Superplana)
  if (lat <= 4 && lat >= -11 && l >= -73 && l <= -50) {
    maxElev = Math.min(maxElev, 65);
  }
  // Planície da Sibéria Ocidental (Superplana)
  if (lat >= 55 && lat <= 68 && l >= 66 && l <= 85) {
    maxElev = Math.min(maxElev, 75);
  }
  // Planície do Leste Europeu
  if (lat >= 49 && lat <= 58 && l >= 18 && l <= 45) {
    maxElev = Math.min(maxElev, 120);
  }
  // Bacia do Rio Mississipi / Planícies Centrais
  if (lat >= 30 && lat <= 42 && l >= -95 && l <= -86) {
    maxElev = Math.min(maxElev, 140);
  }
  // Bacia do Rio da Prata / Pampas
  if (lat <= -28 && lat >= -38 && l >= -64 && l <= -57) {
    maxElev = Math.min(maxElev, 80);
  }

  return Math.round(maxElev);
}

/**
 * Returns normalized elevation in [0.0, 1.0] where 1.0 = Mount Everest (8848m)
 */
export function getGeographicElevationNormalized(lat: number, lng: number): number {
  const meters = getGeographicElevationMeters(lat, lng);
  return Math.max(0.0, Math.min(1.0, meters / 8848.0));
}

export function sampleTerrainElevationNormalized(x: number, z: number): number {
  if (cachedElevationBuffer) {
    const u = (x / 58.0) * 0.5 + 0.5;
    const v = (-z / 58.0) * 0.5 + 0.5;
    if (u >= 0 && u <= 1 && v >= 0 && v <= 1) {
      const px = Math.min(1023, Math.max(0, Math.floor(u * 1024)));
      const py = Math.min(1023, Math.max(0, Math.floor((1.0 - v) * 1024)));
      const idx = (py * 1024 + px) * 4;
      const val = cachedElevationBuffer[idx] / 255.0;
      if (val > 0) return val;
    }
  }

  // Fallback to analytical hypsometric model
  const radius = Math.sqrt(x * x + z * z);
  const normalizedLat = Math.min(1.2, radius / 36.0);
  const lat = Math.max(-90, Math.min(90, 90 - normalizedLat * 180));
  const angleRad = Math.atan2(z, x);
  let angleDeg = (angleRad * 180) / Math.PI;
  if (angleDeg < 0) angleDeg += 360;
  let lng = 90 + GLEASON_MAP_ANGLE_OFFSET_DEG - angleDeg;
  while (lng > 180) lng -= 360;
  while (lng < -180) lng += 360;

  return getGeographicElevationNormalized(lat, lng);
}

/**
 * Generates high-detail elevation displacement and bump texture (Heightmap)
 * calibrated directly to the Official Physical Topographic World Map:
 * - High mountains (Himalayas, Andes, Rockies, Alps, Kilimanjaro, Caucasus, Denali) tower with majestic relief
 * - Plateaus (Brazilian, Mexican, South African, Deccan) rise moderately
 * - Flat plains (Amazon, West Siberia, Northern Europe, Mississippi, Pampas) remain authentically flat
 * - Oceans remain strictly 0 elevation.
 */
export function generateElevationDisplacementMap(onLoaded?: (texture: THREE.CanvasTexture) => void): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size / 2;
  const innerRadius = maxRadius * (36.0 / 58.0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;

  const renderDisplacement = (satelliteImg?: HTMLImageElement) => {
    // 1. Reset canvas to pure black (ocean = 0 elevation)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);

    if (satelliteImg && satelliteImg.complete && satelliteImg.naturalWidth > 0) {
      // 2. Draw satellite image into working buffer with identical geographic alignment to sample authentic colors
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius * 1.05, 0, Math.PI * 2);
      ctx.clip();
      const imgSize = innerRadius / 0.4258;
      ctx.drawImage(satelliteImg, cx - imgSize / 2, cy - imgSize / 2, imgSize, imgSize);
      ctx.restore();

      const imgData = ctx.getImageData(0, 0, size, size);
      const data = imgData.data;

      const wallThickness = maxRadius - innerRadius;
      const wallStartR = innerRadius - 4;
      const wallEndR = maxRadius;

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const angle = Math.atan2(dy, dx);
          const { startR } = getIceWallRadii(angle, innerRadius, wallThickness);

          // Beyond Antarctica Ice Wall (Outer oceans beyond maxRadius = strictly 0 elevation, identical sea level)
          if (dist > maxRadius) {
            data[idx] = 0;
            data[idx + 1] = 0;
            data[idx + 2] = 0;
            continue;
          }

          // Antarctica Ice Wall - Thick, massive, continuous solid glacial plateau (100% PREENCHIDO ATÉ A BORDA, SEM BURACOS OU AGUA)
          if (dist >= startR && dist <= maxRadius) {
            const crackFactor = getIceWallCrackFactor(dist, angle, startR, maxRadius);
            const wallRel = (dist - startR) / Math.max(1, maxRadius - startR);
            // Glaciological elevation profile: towering outer ice barrier and inland plateau
            const cliffProfile = Math.sin(Math.pow(wallRel, 0.65) * Math.PI);
            const noise1 = Math.sin(angle * 12.0 + dist * 0.10) * 18.0;
            const noise2 = Math.cos(angle * 24.0 - dist * 0.20) * 12.0;
            const rawElev = (195 + noise1 + noise2) * Math.pow(cliffProfile, 0.32);
            // Crevasse surface depression: realistic surface fissure dipping by only ~8% into solid ice
            // Packed with dense glacier ice (>= 165 byte elevation), solid ice barrier throughout!
            const crevasseDip = 1.0 - 0.08 * (1.0 - crackFactor);
            const wallElev = Math.max(165, Math.min(245, Math.round(rawElev * crevasseDip)));
            data[idx] = wallElev;
            data[idx + 1] = wallElev;
            data[idx + 2] = wallElev;
            continue;
          }

          // Arctic Center (North Pole region): Sea ice elevation
          if (dist < innerRadius * 0.12) {
            const arcticElev = (r > 150 && g > 150 && b > 150) ? 30 : 0;
            data[idx] = arcticElev;
            data[idx + 1] = arcticElev;
            data[idx + 2] = arcticElev;
            continue;
          }

          // Robust Land vs Ocean Discrimination:
          // In satellite imagery:
          // Ocean is deep dark blue/cyan: b is dominant or color is very dark blue
          const isOceanColor = (b > r * 1.18 && b > 40) || (b > 65 && r < 35 && g < 55) || (r < 22 && g < 35 && b < 50);
          
          const isVegetation = (g > b * 1.08 && g > r * 0.88 && g > 25);
          const isAridOrRock = (r > b * 1.10 && r > 32 && (r + g) > 65);
          const isSnowIce = (r > 155 && g > 155 && b > 155);

          const isLand = (!isOceanColor || isVegetation || isAridOrRock || isSnowIce) && (dist <= innerRadius * 0.99);

          if (!isLand) {
            // Marine waters: strictly flat 0 elevation
            data[idx] = 0;
            data[idx + 1] = 0;
            data[idx + 2] = 0;
          } else {
            // Convert polar (dx, dy) to geographic latitude and longitude
            const normalizedLat = dist / innerRadius;
            const lat = 90 - normalizedLat * 180;
            const angleRad = Math.atan2(dy, dx);
            let angleDeg = (angleRad * 180) / Math.PI;
            if (angleDeg < 0) angleDeg += 360;
            let lng = 90 + GLEASON_MAP_ANGLE_OFFSET_DEG - angleDeg;
            while (lng > 180) lng -= 360;
            while (lng < -180) lng += 360;

            // Sample physical altitude from the calibrated Hypsometric Topography model
            const physicalMeters = getGeographicElevationMeters(lat, lng);
            // Normalized physical height (0 to 255 byte value; Everest 8848m -> ~235)
            const physicalByte = (physicalMeters / 8848.0) * 225;

            // Modulate with photographic satellite relief details (snow crests, rocky ridges, valleys)
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            let textureMod = 0;

            if (isSnowIce) {
              // High snow caps add sharp micro-ridge peak details
              textureMod = (brightness - 155) * 0.28;
            } else if (isAridOrRock) {
              // Arid rock shading defines sharp canyons & gorges
              const ridgeContrast = (r - b) * 0.20;
              textureMod = ridgeContrast;
            }

            // Continental base baseline ensures all dry land is distinctly above sea level
            const finalElev = Math.min(255, Math.max(22, Math.round(20 + physicalByte + textureMod)));

            data[idx] = finalElev;
            data[idx + 1] = finalElev;
            data[idx + 2] = finalElev;
          }
        }
      }

      // Smooth 3x3 box blur filter on displacement map to eliminate single-pixel spikes and produce smooth natural slopes
      const smoothed = new Uint8ClampedArray(data.length);
      for (let y = 1; y < size - 1; y++) {
        for (let x = 1; x < size - 1; x++) {
          const idx = (y * size + x) * 4;
          // If center is pure ocean (0), keep it 0 unless surrounded by land
          let sum = 0;
          let count = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nIdx = ((y + dy) * size + (x + dx)) * 4;
              sum += data[nIdx];
              count++;
            }
          }
          const avg = Math.round(sum / count);
          smoothed[idx] = avg;
          smoothed[idx + 1] = avg;
          smoothed[idx + 2] = avg;
          smoothed[idx + 3] = 255;
        }
      }

      for (let i = 0; i < data.length; i++) {
        data[i] = smoothed[i];
      }

      ctx.putImageData(imgData, 0, 0);
      cachedElevationBuffer = new Uint8Array(data);
    } else {
      // Fallback procedural map
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, size, size);
      cachedElevationBuffer = new Uint8Array(size * size * 4);
    }

    texture.needsUpdate = true;
  };

  // Initial draw: if already preloaded, render with satellite image immediately!
  const readyImg = (sharedSatelliteImg && sharedSatelliteImg.complete && sharedSatelliteImg.naturalWidth > 0)
    ? sharedSatelliteImg
    : undefined;
  renderDisplacement(readyImg);

  // When satellite image is loaded/ready, refine elevation mask
  getOrLoadSatelliteImage((img) => {
    renderDisplacement(img);
    if (onLoaded) onLoaded(texture);
  });

  return texture;
}

/**
 * Generates the Official Physical Topographic Map (Hipsometria & Relevo)
 * matching the user's reference physical world map:
 * - Green (0 - 500m): Lowlands & River Basins (Amazon, Siberia, Mississippi, Pampas)
 * - Yellow (500 - 1000m): Plateaus (Brazilian Highlands, Deccan, Australian Plateau)
 * - Orange (1000 - 2000m): High Plateaus & Highlands (Mexican Plateau, Urals, Mantiqueira)
 * - Red (2000 - 4000m): High Mountain Chains (Rockies, Alps, Atlas, Caucasus, Neblina)
 * - Burgundy / Wine (4000 - 6000m): Extreme Ranges & High Altiplanos (Tibetan Plateau, Andes, Kilimanjaro, Elbrus, Mont Blanc)
 * - Pure White (> 6000m): Glacial Summits & Eternal Snow (Everest, K2, Aconcagua, Denali, Chimborazo)
 */
export function generateHypsometricPhysicalTexture(
  onLoaded?: (texture: THREE.CanvasTexture) => void,
  includeGraticule = true
): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size / 2;
  const innerRadius = maxRadius * (36.0 / 58.0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;

  const renderHypsometric = (satelliteImg?: HTMLImageElement) => {
    // 1. Reset canvas with deep ocean navy
    ctx.fillStyle = '#0a1729';
    ctx.fillRect(0, 0, size, size);

    if (satelliteImg && satelliteImg.complete && satelliteImg.naturalWidth > 0) {
      // 2. Draw satellite image into working buffer to sample land mask and micro-relief
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius * 1.05, 0, Math.PI * 2);
      ctx.clip();
      const imgSize = innerRadius / 0.4258;
      ctx.drawImage(satelliteImg, cx - imgSize / 2, cy - imgSize / 2, imgSize, imgSize);
      ctx.restore();

      const imgData = ctx.getImageData(0, 0, size, size);
      const data = imgData.data;

      const wallThickness = maxRadius - innerRadius;
      const wallStartR = innerRadius - 4;
      const wallEndR = maxRadius;

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const angle = Math.atan2(dy, dx);
          const { startR } = getIceWallRadii(angle, innerRadius, wallThickness);

          // Beyond Antarctica Ice Wall (Outer oceans beyond maxRadius = deep ocean navy)
          if (dist > maxRadius) {
            data[idx] = 10;
            data[idx + 1] = 23;
            data[idx + 2] = 41;
            continue;
          }

          // Antarctica Ice Wall perimeter ring - thick, solid, continuous glacial shelf (100% PREENCHIDO ATÉ A BORDA, ZERO TINTA AZUL)
          if (dist >= startR && dist <= maxRadius) {
            const crackFactor = getIceWallCrackFactor(dist, angle, startR, maxRadius);
            const wallRel = (dist - startR) / Math.max(1, maxRadius - startR);
            const baseBright = 245 + 10 * Math.sin(wallRel * Math.PI);
            // Glacial crevasse tones: pure crystalline firn snow and snowpack (ZERO TINTA AZUL!)
            const rVal = Math.round(baseBright * crackFactor + 238 * (1.0 - crackFactor));
            const gVal = Math.round(baseBright * crackFactor + 242 * (1.0 - crackFactor));
            const bVal = Math.round(baseBright * crackFactor + 248 * (1.0 - crackFactor));
            data[idx] = Math.min(255, rVal);
            data[idx + 1] = Math.min(255, gVal);
            data[idx + 2] = Math.min(255, bVal);
            continue;
          }

          // Arctic Center (North Pole region): Sea ice
          if (dist < innerRadius * 0.12) {
            if (r > 140 && g > 140 && b > 140) {
              data[idx] = 240;
              data[idx + 1] = 248;
              data[idx + 2] = 255;
            } else {
              data[idx] = 14;
              data[idx + 1] = 36;
              data[idx + 2] = 65;
            }
            continue;
          }

          // Land vs Ocean discrimination
          const isOceanColor = (b > r * 1.18 && b > 40) || (b > 65 && r < 35 && g < 55) || (r < 22 && g < 35 && b < 50);
          const isVegetation = (g > b * 1.08 && g > r * 0.88 && g > 25);
          const isAridOrRock = (r > b * 1.10 && r > 32 && (r + g) > 65);
          const isSnowIce = (r > 155 && g > 155 && b > 155);

          const isLand = (!isOceanColor || isVegetation || isAridOrRock || isSnowIce) && (dist <= innerRadius * 0.99);

          if (!isLand) {
            // Marine waters
            data[idx] = 10;
            data[idx + 1] = 23;
            data[idx + 2] = 41;
          } else {
            // Convert polar (dx, dy) to geographic latitude and longitude
            const normalizedLat = dist / innerRadius;
            const lat = 90 - normalizedLat * 180;
            const angleRad = Math.atan2(dy, dx);
            let angleDeg = (angleRad * 180) / Math.PI;
            if (angleDeg < 0) angleDeg += 360;
            let lng = 90 + GLEASON_MAP_ANGLE_OFFSET_DEG - angleDeg;
            while (lng > 180) lng -= 360;
            while (lng < -180) lng += 360;

            const meters = getGeographicElevationMeters(lat, lng);

            // Shading factor from photographic relief
            const reliefShade = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
            const shadeMult = 0.85 + reliefShade * 0.30;

            let cr = 0, cg = 0, cb = 0;

            if (meters >= 6000) {
              // Glacial Summits / Eternal Snow (White)
              cr = 255; cg = 255; cb = 255;
            } else if (meters >= 4000) {
              // Extreme Ranges / High Tibetan & Andean Plateaus (Burgundy / Dark Wine)
              const t = (meters - 4000) / 2000;
              cr = Math.round(150 + t * 85);
              cg = Math.round(25 + t * 40);
              cb = Math.round(35 + t * 55);
            } else if (meters >= 2000) {
              // High Mountain Chains (Red - Carmine / Vermelho)
              const t = (meters - 2000) / 2000;
              cr = Math.round(225 - t * 40);
              cg = Math.round(45 - t * 15);
              cb = Math.round(30 + t * 10);
            } else if (meters >= 1000) {
              // Highlands & Serras (Warm Orange - Laranja)
              const t = (meters - 1000) / 1000;
              cr = Math.round(245 - t * 20);
              cg = Math.round(140 - t * 85);
              cb = Math.round(25 + t * 10);
            } else if (meters >= 500) {
              // Plateaus (Yellow - Amarelo / Planaltos)
              const t = (meters - 500) / 500;
              cr = Math.round(235 + t * 10);
              cg = Math.round(200 - t * 55);
              cb = Math.round(25);
            } else if (meters >= 200) {
              // Low Plateaus & Hills (Lime / Verde Claro)
              const t = (meters - 200) / 300;
              cr = Math.round(90 + t * 140);
              cg = Math.round(175 + t * 25);
              cb = Math.round(30 - t * 5);
            } else {
              // Plains & Basins (Dark Emerald Green - Verde Escuro / Planícies)
              const t = Math.max(0, meters / 200);
              cr = Math.round(21 + t * 50);
              cg = Math.round(128 + t * 40);
              cb = Math.round(61 - t * 25);
            }

            data[idx] = Math.min(255, Math.round(cr * shadeMult));
            data[idx + 1] = Math.min(255, Math.round(cg * shadeMult));
            data[idx + 2] = Math.min(255, Math.round(cb * shadeMult));
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Graticule Lines (only when requested for Planar Map!)
      if (includeGraticule) {
        drawGraticuleLines(ctx, cx, cy, innerRadius);
      }

      // Draw Photorealistic Antarctic Ice Wall Barrier with realistic ice-filled crevasses
      drawAntarcticIceWallRealistic(ctx, cx, cy, innerRadius, maxRadius);
    }

    texture.needsUpdate = true;
  };

  // Initial draw: if already preloaded, render with satellite image immediately!
  const readyImg = (sharedSatelliteImg && sharedSatelliteImg.complete && sharedSatelliteImg.naturalWidth > 0)
    ? sharedSatelliteImg
    : undefined;
  renderHypsometric(readyImg);

  // When satellite image is loaded/ready, re-render hypsometric map
  getOrLoadSatelliteImage((img) => {
    renderHypsometric(img);
    if (onLoaded) onLoaded(texture);
  });

  return texture;
}

/**
 * Generates City Lights / Night lights glow texture for cities when in shadow
 */
export function generateCityLightsTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2 - 24) * 0.68;

  // Draw authentic city lights cluster centered on each world city's exact planar coordinates
  WORLD_CITIES.forEach((city) => {
    const normalizedLat = (90 - city.lat) / 180;
    const cityR = normalizedLat * r;
    const angleDeg = 90 - city.lng + GLEASON_MAP_ANGLE_OFFSET_DEG;
    const angleRad = (angleDeg * Math.PI) / 180;
    const px = cx + cityR * Math.cos(angleRad);
    const py = cy + cityR * Math.sin(angleRad);

    const count = city.importance === 1 ? 16 : 8;
    const spread = city.importance === 1 ? 12 : 6;

    // Center bright core
    const coreGlow = ctx.createRadialGradient(px, py, 0, px, py, spread * 1.5);
    coreGlow.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
    coreGlow.addColorStop(0.4, 'rgba(245, 158, 11, 0.6)');
    coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(px, py, spread * 1.5, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < count; i++) {
      const ox = px + (Math.random() - 0.5) * spread;
      const oy = py + (Math.random() - 0.5) * spread;
      ctx.fillStyle = Math.random() > 0.5 ? '#fef08a' : '#fed7aa';
      ctx.beginPath();
      ctx.arc(ox, oy, 0.8 + Math.random() * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Draws geographic meridian and tropical reference graticules cleanly
 */
export function drawWorldCitiesOnTexture(
  _ctx: CanvasRenderingContext2D,
  _cx: number,
  _cy: number,
  _innerRadius: number
) {
  // Kept clean so the photographic satellite map and Black Marble night lights remain 100% authentic and uncluttered
}

/**
 * Generates an ultra high-detail, photorealistic Night City Lights Texture (2048x2048).
 * Modeled after real NASA "Black Marble" nighttime satellite imagery:
 * - Fine organic micro-point clusters (0.5px - 1.5px)
 * - Authentic metropolitan sprawl following coastlines, river corridors, and highway webs
 * - Natural blend of warm amber sodium-vapor lights and cool-white LED urban cores
 * - Zero artificial geometric discs, oversized gradients, or text clutter
 */
export function generateNightCityLightsTexture(): THREE.CanvasTexture {
  const size = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { alpha: true })!;

  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size / 2;
  const innerRadius = maxRadius * 0.75;

  // Clear transparent background (pure nocturnal darkness)
  ctx.clearRect(0, 0, size, size);

  // Deterministic pseudo-random generator so city lights never shift between reloads
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // Helper to get canvas XY from Lat/Lng
  const getCityPos = (lat: number, lng: number) => {
    const normalizedLat = (90 - lat) / 180;
    const r = normalizedLat * innerRadius;
    const angleDeg = 90 - lng + GLEASON_MAP_ANGLE_OFFSET_DEG;
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  };

  ctx.save();

  // 1. Dense Regional & Coastal Population Corridors (NASA VIIRS Black Marble style)
  // Defines major inhabited corridors: US East/West Coast, Midwest, Europe, Nile River & Delta,
  // Ganges Valley & Indian Coast, Eastern China, Japan, Java, Southeast Brazil & Rio de la Plata
  const populationCorridors: [number, number, number, number, number, number][] = [
    // [lat1, lng1, lat2, lng2, density, spreadDeg]
    // South America
    [-23.5, -46.6, -22.9, -43.2, 160, 1.4], // São Paulo - Rio de Janeiro Megalopolis
    [-23.5, -46.6, -25.4, -49.2, 110, 1.5], // SP - Curitiba
    [-25.4, -49.2, -30.0, -51.2, 120, 1.8], // Curitiba - Porto Alegre
    [-23.5, -46.6, -19.9, -43.9, 130, 1.8], // SP - Belo Horizonte
    [-19.9, -43.9, -15.8, -47.9, 95, 2.0],  // BH - Brasília - Goiânia
    [-12.9, -38.5, -8.0, -34.9, 130, 1.1],  // Salvador - Recife coastal belt
    [-8.0, -34.9, -3.7, -38.5, 110, 1.2],   // Recife - Fortaleza coastal belt
    [-34.6, -58.4, -31.4, -64.2, 140, 2.0], // Buenos Aires - Rosario - Córdoba
    [-33.4, -70.6, -36.8, -73.0, 90, 1.1],  // Central Chile valley
    [4.7, -74.1, 6.2, -75.6, 95, 1.3],      // Bogotá - Medellín - Cali Andean corridor
    // North America
    [38.9, -77.0, 42.3, -71.0, 240, 1.5],   // BosWash Megalopolis (DC - Baltimore - Philly - NYC - Boston)
    [40.7, -74.0, 41.8, -87.6, 200, 2.8],   // NYC - Great Lakes - Chicago
    [43.6, -79.4, 45.5, -73.5, 130, 1.4],   // Toronto - Ottawa - Montreal (St. Lawrence)
    [41.8, -87.6, 38.6, -90.2, 150, 2.6],   // Midwest heartland
    [34.0, -118.2, 37.7, -122.4, 170, 1.3], // California LA - Bay Area
    [34.0, -118.2, 32.7, -117.1, 120, 0.9], // LA - San Diego
    [29.7, -95.3, 32.7, -96.8, 150, 2.2],   // Texas Triangle (Houston - Dallas - San Antonio)
    [25.7, -80.2, 28.5, -81.4, 140, 1.1],   // Florida Peninsula
    [19.4, -99.1, 20.6, -103.3, 160, 1.6],  // Central Mexico Bajío belt
    // Europe
    [51.5, -0.1, 53.5, -2.2, 190, 1.4],     // England (London - Birmingham - Manchester)
    [48.8, 2.3, 52.3, 4.9, 220, 1.8],       // Paris - Brussels - Randstad (Amsterdam)
    [50.9, 6.9, 45.4, 9.2, 240, 1.9],       // Blue Banana (Rhine-Ruhr - Frankfurt - Zürich - Milan)
    [45.4, 9.2, 45.4, 12.3, 160, 1.1],      // Po Valley (Turin - Milan - Venice)
    [52.5, 13.4, 50.0, 19.9, 170, 2.2],     // Berlin - Saxony - southern Poland
    [40.4, -3.7, 41.3, 2.1, 110, 1.8],      // Iberian Peninsula
    [41.9, 12.5, 40.8, 14.2, 120, 1.0],     // Rome - Naples coast
    [55.7, 37.6, 59.9, 30.3, 140, 2.2],     // Moscow metropolitan web & St. Petersburg
    // Africa & Middle East
    [30.0, 31.2, 31.2, 29.9, 180, 0.9],     // Nile Delta (Cairo - Alexandria ultra-dense fan)
    [30.0, 31.2, 24.1, 32.9, 160, 0.35],    // Nile River Ribbon (unmistakable glowing serpent!)
    [33.5, -7.6, 36.8, 10.2, 120, 1.1],     // Maghreb Mediterranean coast
    [6.5, 3.4, 5.6, -0.2, 110, 1.2],        // Gulf of Guinea (Lagos - Accra)
    [-26.2, 28.0, -25.7, 28.2, 110, 1.4],   // Gauteng (Johannesburg - Pretoria)
    [32.0, 34.8, 33.9, 35.5, 110, 0.8],     // Levant coast
    [24.4, 54.4, 25.3, 55.3, 120, 0.8],     // Persian Gulf (Abu Dhabi - Dubai - Doha)
    // Asia & Oceania
    [31.1, 74.3, 22.5, 88.3, 320, 2.1],     // Indo-Gangetic Plain (Lahore - Delhi - Varanasi - Kolkata)
    [19.0, 72.8, 12.9, 77.6, 210, 2.2],     // Western & Southern India (Mumbai - Pune - Bangalore)
    [13.0, 80.2, 17.4, 78.5, 160, 1.8],     // Chennai - Hyderabad
    [39.9, 116.4, 31.2, 121.5, 340, 2.8],   // North China Plain (Beijing - Tianjin - Jinan - Shanghai)
    [31.2, 121.5, 23.1, 113.2, 260, 2.2],   // East/South China coast & Pearl River Delta (Guangzhou - Shenzhen - HK)
    [30.6, 104.1, 29.5, 106.5, 160, 1.6],   // Sichuan Basin (Chengdu - Chongqing)
    [35.6, 139.7, 34.7, 135.5, 260, 1.0],   // Japanese Taiheiyō Belt (Tokyo - Nagoya - Osaka - Hiroshima)
    [37.5, 127.0, 35.1, 129.0, 170, 0.9],   // South Korea (Seoul - Busan)
    [25.0, 121.5, 22.6, 120.3, 130, 0.6],   // Western Taiwan coast
    [-6.2, 106.8, -7.2, 112.7, 200, 0.7],   // Java Island (Jakarta - Surabaya ultra-dense island)
    [13.7, 100.5, 3.1, 101.7, 130, 1.4],    // Bangkok - Malay Peninsula - Singapore
    [-33.8, 151.2, -37.8, 144.9, 95, 1.2],  // SE Australia coast (Sydney - Melbourne)
  ];

  // Draw fine, pinpoint corridor micro-towns and highway webs
  populationCorridors.forEach(([lat1, lng1, lat2, lng2, count, spreadDeg]) => {
    for (let i = 0; i < count; i++) {
      const t = rand();
      // Concentrated along the spine with Gaussian-like falloff
      const perp = (rand() + rand() + rand() - 1.5) * spreadDeg;
      const along = (rand() - 0.5) * spreadDeg * 0.5;
      const lat = lat1 + (lat2 - lat1) * t + perp * 0.7 + along * 0.3;
      const lng = lng1 + (lng2 - lng1) * t + perp * 0.7 - along * 0.3;

      const pos = getCityPos(lat, lng);
      const distFromSpine = Math.abs(perp) / spreadDeg;
      const dotR = distFromSpine < 0.25 ? 0.45 + rand() * 0.55 : 0.3 + rand() * 0.35;

      const cRoll = rand();
      if (distFromSpine < 0.18 && cRoll > 0.55) {
        ctx.fillStyle = 'rgba(255, 252, 232, 0.92)'; // Bright white-gold urban hub
      } else if (cRoll > 0.45) {
        ctx.fillStyle = 'rgba(254, 215, 102, 0.80)'; // Warm sodium gold
      } else {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.62)';  // Deep amber town
      }
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 2. Delicate Highway & Railway Inter-City Filaments
  const highwayConnections: [string, string][] = [
    ['sao_paulo', 'rio_de_janeiro'],
    ['sao_paulo', 'curitiba'],
    ['curitiba', 'porto_alegre'],
    ['sao_paulo', 'belo_horizonte'],
    ['belo_horizonte', 'brasilia'],
    ['brasilia', 'goiania'],
    ['salvador', 'recife'],
    ['recife', 'fortaleza'],
    ['buenos_aires', 'cordoba'],
    ['buenos_aires', 'montevideo'],
    ['santiago', 'mendoza'],
    ['bogota', 'medellin'],
    ['washington', 'new_york'],
    ['new_york', 'boston'],
    ['new_york', 'chicago'],
    ['chicago', 'toronto'],
    ['toronto', 'montreal'],
    ['toronto', 'ottawa'],
    ['san_francisco', 'los_angeles'],
    ['los_angeles', 'san_diego'],
    ['houston', 'dallas'],
    ['miami', 'orlando'],
    ['seattle', 'vancouver'],
    ['mexico_city', 'guadalajara'],
    ['london', 'paris'],
    ['paris', 'brussels'],
    ['brussels', 'amsterdam'],
    ['amsterdam', 'berlin'],
    ['berlin', 'warsaw'],
    ['warsaw', 'kyiv'],
    ['kyiv', 'moscow'],
    ['moscow', 'st_petersburg'],
    ['madrid', 'barcelona'],
    ['madrid', 'lisbon'],
    ['rome', 'milan'],
    ['vienna', 'bern'],
    ['athens', 'istanbul'],
    ['tokyo', 'osaka'],
    ['beijing', 'shanghai'],
    ['shanghai', 'hong_kong'],
    ['guangzhou', 'hong_kong'],
    ['mumbai', 'delhi'],
    ['mumbai', 'bangalore'],
    ['cairo', 'alexandria'],
    ['dubai', 'abu_dhabi'],
    ['dubai', 'riyadh'],
    ['singapore', 'kuala_lumpur'],
    ['sydney', 'melbourne'],
    ['sydney', 'brisbane'],
  ];

  highwayConnections.forEach(([idA, idB]) => {
    const cityA = WORLD_CITIES.find((c) => c.id === idA);
    const cityB = WORLD_CITIES.find((c) => c.id === idB);
    if (!cityA || !cityB) return;

    const pA = getCityPos(cityA.lat, cityA.lng);
    const pB = getCityPos(cityB.lat, cityB.lng);

    const dist = Math.hypot(pB.x - pA.x, pB.y - pA.y);
    const steps = Math.max(8, Math.floor(dist / 2.2));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const curve = Math.sin(t * Math.PI) * 1.4;
      const px = pA.x + (pB.x - pA.x) * t + Math.sin(i * 1.9) * 0.55 + curve * 0.3;
      const py = pA.y + (pB.y - pA.y) * t + Math.cos(i * 2.3) * 0.55 - curve * 0.3;

      ctx.fillStyle = i % 3 === 0 ? 'rgba(254, 240, 138, 0.55)' : 'rgba(245, 158, 11, 0.40)';
      ctx.beginPath();
      ctx.arc(px, py, 0.35 + (i % 2) * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 3. High-Definition Metropolitan Webs & Pinpoint Street-Grid Sprawl for Each World City
  WORLD_CITIES.forEach((city) => {
    const pos = getCityPos(city.lat, city.lng);
    const isMega = city.importance === 1;
    const isMajor = city.importance === 2;

    const particleCount = isMega ? 110 : isMajor ? 55 : 28;
    const maxRadiusSpread = isMega ? 7.5 : isMajor ? 4.8 : 2.8;

    // A. Very tight, subtle atmospheric amber bloom right at the downtown center (no giant circular blobs!)
    const coreGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, maxRadiusSpread * 0.75);
    coreGrad.addColorStop(0, isMega ? 'rgba(255, 250, 220, 0.65)' : 'rgba(254, 230, 138, 0.50)');
    coreGrad.addColorStop(0.35, 'rgba(251, 191, 36, 0.25)');
    coreGrad.addColorStop(0.75, 'rgba(217, 119, 6, 0.08)');
    coreGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, maxRadiusSpread * 0.75, 0, Math.PI * 2);
    ctx.fill();

    // B. Radiating arterial highway tendrils (4 to 7 tendrils branching out from each city)
    const numArteries = isMega ? 7 : isMajor ? 5 : 3;
    const baseAngleOffset = rand() * Math.PI * 2;
    for (let a = 0; a < numArteries; a++) {
      const arteryAngle = baseAngleOffset + (a / numArteries) * Math.PI * 2 + (rand() - 0.5) * 0.4;
      const arteryLen = maxRadiusSpread * (0.9 + rand() * 0.7);
      const dotsInArtery = isMega ? 12 : 7;
      for (let s = 1; s <= dotsInArtery; s++) {
        const frac = s / dotsInArtery;
        const rDist = frac * arteryLen;
        const wiggle = Math.sin(s * 1.4) * 0.45;
        const ax = pos.x + Math.cos(arteryAngle + wiggle * 0.15) * rDist;
        const ay = pos.y + Math.sin(arteryAngle + wiggle * 0.15) * rDist;

        ctx.fillStyle = frac < 0.4 ? 'rgba(255, 248, 210, 0.85)' : 'rgba(245, 158, 11, 0.55)';
        ctx.beginPath();
        ctx.arc(ax, ay, Math.max(0.28, (1.0 - frac * 0.6) * 0.55), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // C. Organic Pinpoint Pixels & Satellite Suburbs
    for (let i = 0; i < particleCount; i++) {
      const u = rand();
      const rDist = Math.pow(u, 2.1) * maxRadiusSpread;
      const angle = rand() * Math.PI * 2;

      const px = pos.x + Math.cos(angle) * rDist;
      const py = pos.y + Math.sin(angle) * rDist;

      // Tiny crisp pinpoint dots (0.28px to 0.75px) so it looks like real satellite photography from orbit!
      const radius = rDist < 1.4 ? 0.50 + rand() * 0.35 : 0.25 + rand() * 0.32;

      const colorSeed = rand();
      if (rDist < 1.5 && colorSeed > 0.35) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.96)'; // White-hot metropolitan core
      } else if (colorSeed > 0.55) {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.88)'; // Warm golden sodium-vapor
      } else if (colorSeed > 0.22) {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.78)';  // Rich amber street grid
      } else {
        ctx.fillStyle = 'rgba(234, 88, 12, 0.62)';   // Deep orange suburban edge
      }

      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  return texture;
}

/**
 * Draws high-definition continents on the azimuthal projection
 */
function drawContinentsHD(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const drawComplexLand = (
    coords: [number, number][],
    baseColor: string,
    strokeColor = 'rgba(110, 231, 183, 0.75)',
    label?: { text: string; x: number; y: number; font?: string; color?: string }
  ) => {
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    coords.forEach(([dx, dy], idx) => {
      const px = cx + dx * r;
      const py = cy + dy * r;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();

    // Coastline highlight
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Label if present
    if (label) {
      ctx.fillStyle = label.color || '#f8fafc';
      ctx.font = label.font || 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 8;
      ctx.fillText(label.text, cx + label.x * r, cy + label.y * r);
      ctx.shadowBlur = 0;
    }
  };

  // 1. Arctic Center (North Pole Ice Cap)
  const polarIceGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.1);
  polarIceGrad.addColorStop(0, '#ffffff');
  polarIceGrad.addColorStop(0.7, '#f0fdf4');
  polarIceGrad.addColorStop(1.0, '#f1f5f9');
  ctx.fillStyle = polarIceGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 2. Greenland
  drawComplexLand([
    [-0.04, -0.32], [-0.10, -0.38], [-0.12, -0.46], [-0.06, -0.48],
    [0.01, -0.42], [-0.01, -0.34]
  ], '#e2e8f0', 'rgba(255, 255, 255, 0.9)', { text: 'Groenlândia', x: -0.05, y: -0.40, font: 'bold 12px sans-serif' });

  // 3. North America (Detailed Silhouette: Canada, US, Mexico, Alaska)
  drawComplexLand([
    [-0.14, -0.15], [-0.20, -0.13], [-0.28, -0.15], [-0.36, -0.18], [-0.46, -0.22],
    [-0.56, -0.32], [-0.58, -0.42], [-0.50, -0.50], [-0.38, -0.54], [-0.22, -0.52],
    [-0.14, -0.44], [-0.10, -0.36], [-0.12, -0.24]
  ], '#2d6a4f', 'rgba(167, 243, 208, 0.85)', { text: 'AMÉRICA DO NORTE', x: -0.34, y: -0.34, font: 'bold 15px sans-serif' });

  // Great Lakes
  ctx.fillStyle = '#0c3b64';
  ctx.beginPath();
  ctx.arc(cx - 0.28 * r, cy - 0.35 * r, 6, 0, Math.PI * 2);
  ctx.arc(cx - 0.32 * r, cy - 0.33 * r, 5, 0, Math.PI * 2);
  ctx.fill();

  // 4. Central & South America (Brazil, Argentina, Andes, Amazon, Patagonia)
  drawComplexLand([
    [-0.26, 0.02], [-0.32, 0.08], [-0.42, 0.10], [-0.50, 0.14],
    [-0.58, 0.22], [-0.68, 0.32], [-0.72, 0.44], [-0.66, 0.54],
    [-0.56, 0.58], [-0.46, 0.52], [-0.36, 0.48], [-0.28, 0.38],
    [-0.24, 0.28], [-0.24, 0.14], [-0.22, 0.06]
  ], '#1b4332', 'rgba(110, 231, 183, 0.9)', { text: 'AMÉRICA DO SUL', x: -0.50, y: 0.30, font: 'bold 15px sans-serif' });

  // Brazil highlight & Amazon lush forest (SE Brazil, SP, Rio, Amazon, Northeast)
  drawComplexLand([
    [-0.28, 0.18], [-0.36, 0.24], [-0.46, 0.30], [-0.52, 0.40],
    [-0.48, 0.48], [-0.38, 0.46], [-0.30, 0.38], [-0.26, 0.28]
  ], '#2d6a4f', 'rgba(110, 231, 183, 0.65)', { text: 'BRASIL', x: -0.38, y: 0.34, font: 'bold 13px sans-serif', color: '#fef08a' });

  // Andes mountain ridge line along the Pacific west coast
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(cx - 0.44 * r, cy + 0.12 * r);
  ctx.lineTo(cx - 0.58 * r, cy + 0.26 * r);
  ctx.lineTo(cx - 0.68 * r, cy + 0.46 * r);
  ctx.stroke();

  // 5. Eurasia (Europe & Asia)
  drawComplexLand([
    [0.02, -0.24], [0.06, -0.36], [0.14, -0.42], [0.22, -0.38],
    [0.20, -0.24], [0.12, -0.18], [0.04, -0.18]
  ], '#386641', 'rgba(167, 243, 208, 0.8)', { text: 'EUROPA', x: 0.10, y: -0.28, font: 'bold 14px sans-serif' });

  drawComplexLand([
    [0.18, -0.24], [0.28, -0.44], [0.46, -0.46], [0.60, -0.32],
    [0.58, -0.12], [0.44, -0.06], [0.32, -0.12], [0.22, -0.18]
  ], '#40916c', 'rgba(167, 243, 208, 0.85)', { text: 'ÁSIA', x: 0.40, y: -0.26, font: 'bold 16px sans-serif' });

  // Middle East Desert
  drawComplexLand([
    [0.14, -0.14], [0.22, -0.12], [0.25, -0.02], [0.18, 0.02], [0.12, -0.04]
  ], '#b08968', 'rgba(253, 230, 138, 0.7)', { text: 'Oriente Médio', x: 0.18, y: -0.06, font: 'bold 11px sans-serif' });

  // India
  drawComplexLand([
    [0.26, -0.10], [0.32, -0.08], [0.30, 0.06], [0.24, 0.02]
  ], '#7f5539', 'rgba(253, 230, 138, 0.7)', { text: 'ÍNDIA', x: 0.28, y: -0.02, font: 'bold 12px sans-serif' });

  // Himalayas snow peak
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx + 0.26 * r, cy - 0.12 * r);
  ctx.lineTo(cx + 0.36 * r, cy - 0.10 * r);
  ctx.stroke();

  // 6. Africa & Madagascar
  drawComplexLand([
    [0.01, -0.12], [0.14, -0.14], [0.22, 0.02], [0.18, 0.28],
    [0.10, 0.48], [-0.01, 0.44], [-0.06, 0.16], [-0.02, 0.02]
  ], '#588157', 'rgba(167, 243, 208, 0.85)', { text: 'ÁFRICA', x: 0.08, y: 0.18, font: 'bold 15px sans-serif' });

  // Sahara Desert
  drawComplexLand([
    [0.02, -0.10], [0.16, -0.12], [0.18, 0.04], [-0.02, 0.06]
  ], '#cca43b', 'rgba(254, 240, 138, 0.6)', { text: 'Saara', x: 0.08, y: -0.03, font: 'bold 12px sans-serif', color: '#fef08a' });

  // Madagascar
  drawComplexLand([
    [0.22, 0.28], [0.25, 0.30], [0.23, 0.42], [0.20, 0.38]
  ], '#588157', 'rgba(167, 243, 208, 0.8)', { text: 'Madagascar', x: 0.24, y: 0.44, font: '10px sans-serif' });

  // 7. Australia & Oceania
  drawComplexLand([
    [0.40, 0.16], [0.55, 0.12], [0.62, 0.26], [0.52, 0.44], [0.38, 0.36]
  ], '#9c6644', 'rgba(254, 215, 170, 0.85)', { text: 'AUSTRÁLIA', x: 0.48, y: 0.26, font: 'bold 14px sans-serif' });

  // Australian Outback Red Center
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.arc(cx + 0.48 * r, cy + 0.26 * r, 12, 0, Math.PI * 2);
  ctx.fill();

  // Ocean Name Labels
  const oceanLabels = [
    { text: 'OCEANO ATLÂNTICO', x: -0.12, y: 0.22 },
    { text: 'OCEANO PACÍFICO', x: -0.64, y: 0.08 },
    { text: 'OCEANO PACÍFICO NORTE', x: -0.48, y: -0.12 },
    { text: 'OCEANO ÍNDICO', x: 0.30, y: 0.20 },
    { text: 'OCEANO ÁRTICO', x: 0.0, y: -0.16 },
  ];

  ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
  ctx.font = 'italic bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 6;
  oceanLabels.forEach(lbl => {
    ctx.fillText(lbl.text, cx + lbl.x * r, cy + lbl.y * r);
  });
  ctx.shadowBlur = 0;
}

/**
 * Draws Graticule lines (Equator, Tropics, Polar Circles, Meridians) cleanly and without clutter
 */
function drawGraticuleLines(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Polar circle (66.5° N)
  ctx.strokeStyle = 'rgba(147, 197, 253, 0.35)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.16, 0, Math.PI * 2);
  ctx.stroke();

  // Tropic of Cancer (23.5° N) - Raio 13.5 (r * 0.375)
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.375, 0, Math.PI * 2);
  ctx.stroke();

  // Linha do Equador (0°) - Centro Exato do Trajeto Solar/Lunar (Raio 18.0 / r * 0.500)
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.95)';
  ctx.lineWidth = 2.4;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.50, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Tropic of Capricorn (23.5° S) - Raio 22.5 (r * 0.625)
  ctx.strokeStyle = 'rgba(249, 115, 22, 0.85)';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.625, 0, Math.PI * 2);
  ctx.stroke();

  // 12 Radial Meridians - clean, subtle and non-intrusive
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
  ctx.lineWidth = 0.8;
  ctx.setLineDash([4, 4]);
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI * 2) / 12;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * (r * 0.16), cy + Math.sin(angle) * (r * 0.16));
    ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Labels for the rings with clear geographical & astronomical markings
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 6;

  ctx.fillStyle = '#fde047';
  ctx.fillText('TRÓPICO DE CÂNCER (23.5° N - Solstício Jun)', cx + 12, cy - r * 0.375);

  ctx.fillStyle = '#fb923c';
  ctx.fillText('LINHA DO EQUADOR (0° - Centro do Trajeto)', cx + 12, cy - r * 0.50);

  ctx.fillStyle = '#f87171';
  ctx.fillText('TRÓPICO DE CAPRICÓRNIO (23.5° S - Solstício Dez)', cx + 12, cy - r * 0.625);
  ctx.shadowBlur = 0;
}

/**
 * Draws vast open marine waters beyond the Antarctic Ice Wall matching the exact inner ocean color
 */
function drawBeyondIceWallOceans(ctx: CanvasRenderingContext2D, cx: number, cy: number, startR: number, endR: number) {
  // Rich, uniform marine waters beyond the ice wall matching the exact inner ocean color and level
  ctx.fillStyle = '#0a203d';
  ctx.beginPath();
  ctx.arc(cx, cy, endR * 1.5, 0, Math.PI * 2);
  ctx.arc(cx, cy, startR, 0, Math.PI * 2, true);
  ctx.fill();
}

/**
 * Draws Ocean Currents & Atmospheric Cloud Conveyor Routes with directional arrows (warm in red, cold in blue)
 * faithfully recreating the routes shown in the Physical World Map (Mapa-Múndi Físico).
 */
export function drawOceanCurrentsAndRoutesOnTexture(
  _ctx: CanvasRenderingContext2D,
  _cx: number,
  _cy: number,
  _innerRadius: number
) {
  // Desativado conforme solicitado: linhas de corrente de vento e rotas marítimas removidas do plano
  return;
}

/**
 * Procedural Photorealistic Sun Surface Texture
 * Generates an authentic solar photosphere with granulation cells,
 * dynamic solar flare turbulence, and natural limb darkening
 */
export function generateSunTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Sol Puro e Luminoso: Disco uniforme com tom amarelo solar natural (#fff8cb)
  ctx.fillStyle = '#fff8cb';
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Ultra-Realistic Procedural Lunar Surface Map (Equirectangular 1024x512)
 * Accurately models real Lunar Selenography:
 * - Real Lunar Maria (Oceanus Procellarum, Mare Imbrium, Serenitatis, Tranquillitatis, Crisium, Nubium, etc.)
 * - Authentic Tycho & Copernicus bright crater ray systems (ejecta blankets)
 * - Multi-octave Anorthositic Highlands regolith noise and thousands of micro-craters
 * - Authentic titanium basalt shades, crater rims, central peaks, and real lunar albedo
 */
export function generateMoonTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  // 1. Base Anorthositic Lunar Highlands (Lighter gray-white silicate regolith)
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  // Simple, fast multi-octave pseudo-noise generator for natural regolith grain
  const pseudoNoise = (x: number, y: number, seed: number) => {
    const s = Math.sin(x * 12.9898 + y * 78.233 + seed * 43758.5453) * 43758.5453;
    return s - Math.floor(s);
  };

  const smoothNoise = (x: number, y: number, scale: number, seed: number) => {
    const nx = x / scale;
    const ny = y / scale;
    const ix = Math.floor(nx);
    const iy = Math.floor(ny);
    const fx = nx - ix;
    const fy = ny - iy;
    // Smoothstep interpolation
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);

    const n00 = pseudoNoise(ix, iy, seed);
    const n10 = pseudoNoise(ix + 1, iy, seed);
    const n01 = pseudoNoise(ix, iy + 1, seed);
    const n11 = pseudoNoise(ix + 1, iy + 1, seed);

    const nx0 = n00 * (1 - sx) + n10 * sx;
    const nx1 = n01 * (1 - sx) + n11 * sx;
    return nx0 * (1 - sy) + nx1 * sy;
  };

  const fbm = (x: number, y: number, seed: number) => {
    let val = 0;
    let amp = 0.55;
    let scale = 180;
    for (let o = 0; o < 6; o++) {
      val += smoothNoise(x, y, scale, seed + o * 13) * amp;
      scale *= 0.48;
      amp *= 0.52;
    }
    return val;
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const n = fbm(x, y, 42);
      // Highlands albedo: natural bright anorthositic regolith (178 - 235)
      const baseGray = Math.min(242, 178 + Math.floor(n * 58));
      data[idx] = baseGray;
      data[idx + 1] = Math.min(255, baseGray + 2); // subtle cool mineral tint
      data[idx + 2] = Math.min(255, baseGray + 5);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Scale all 1024x512 coordinates by 2x for 2048x1024 HD resolution!
  ctx.save();
  ctx.scale(2.0, 2.0);

  // 2. Real Lunar Maria (Dark Iron & Titanium-Rich Basaltic Lava Plains on Near Side)
  // Mapping Near Side (x: 256 to 768, centered at x=512, y=256)
  const mariaBasins: {
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    darkness: number;
    roughness: number;
    name: string;
  }[] = [
    // Oceanus Procellarum (Vast Western Plain)
    { cx: 380, cy: 225, rx: 112, ry: 132, darkness: 0.72, roughness: 0.8, name: 'Oceanus Procellarum' },
    { cx: 330, cy: 260, rx: 78, ry: 92, darkness: 0.75, roughness: 0.7, name: 'Procellarum South' },
    // Mare Imbrium (Sea of Rains)
    { cx: 440, cy: 175, rx: 72, ry: 66, darkness: 0.78, roughness: 0.5, name: 'Mare Imbrium' },
    // Sinus Iridum (Bay of Rainbows)
    { cx: 405, cy: 145, rx: 26, ry: 23, darkness: 0.80, roughness: 0.4, name: 'Sinus Iridum' },
    // Mare Serenitatis (Sea of Serenity)
    { cx: 545, cy: 185, rx: 50, ry: 46, darkness: 0.78, roughness: 0.45, name: 'Mare Serenitatis' },
    // Mare Tranquillitatis (Sea of Tranquility - Dark Titanium Basalt)
    { cx: 580, cy: 235, rx: 56, ry: 52, darkness: 0.82, roughness: 0.6, name: 'Mare Tranquillitatis' },
    // Mare Crisium (Isolated Oval Sea)
    { cx: 665, cy: 205, rx: 38, ry: 34, darkness: 0.84, roughness: 0.35, name: 'Mare Crisium' },
    // Mare Fecunditatis
    { cx: 640, cy: 270, rx: 50, ry: 56, darkness: 0.74, roughness: 0.6, name: 'Mare Fecunditatis' },
    // Mare Nectaris
    { cx: 585, cy: 295, rx: 34, ry: 32, darkness: 0.78, roughness: 0.4, name: 'Mare Nectaris' },
    // Mare Nubium
    { cx: 465, cy: 305, rx: 56, ry: 52, darkness: 0.74, roughness: 0.65, name: 'Mare Nubium' },
    // Mare Humorum
    { cx: 395, cy: 315, rx: 34, ry: 32, darkness: 0.78, roughness: 0.4, name: 'Mare Humorum' },
    // Mare Vaporum & Sinus Medii (Central Bays)
    { cx: 510, cy: 230, rx: 32, ry: 26, darkness: 0.72, roughness: 0.5, name: 'Mare Vaporum' },
    // Mare Frigoris (Northern Long Arc)
    { cx: 500, cy: 120, rx: 132, ry: 20, darkness: 0.68, roughness: 0.7, name: 'Mare Frigoris' },
    // Far-side sparse basins: Mare Moscoviense & South Pole-Aitken subtle shade
    { cx: 890, cy: 180, rx: 28, ry: 24, darkness: 0.62, roughness: 0.4, name: 'Mare Moscoviense' },
    { cx: 512, cy: 450, rx: 140, ry: 45, darkness: 0.45, roughness: 0.8, name: 'South Pole-Aitken' },
  ];

  mariaBasins.forEach(m => {
    ctx.save();
    // Draw organic basaltic basin with fractal feathering
    const grad = ctx.createRadialGradient(m.cx, m.cy, 0, m.cx, m.cy, Math.max(m.rx, m.ry));
    const alpha = m.darkness;
    grad.addColorStop(0.0, `rgba(32, 38, 48, ${alpha})`);
    grad.addColorStop(0.55, `rgba(48, 56, 68, ${alpha * 0.88})`);
    grad.addColorStop(0.85, `rgba(78, 88, 102, ${alpha * 0.48})`);
    grad.addColorStop(1.0, 'rgba(120, 130, 145, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();

    // Generate natural non-circular jagged coastal outline for the lunar mare
    const numPoints = 48;
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const noise = 1.0 + (Math.sin(angle * 4 + m.cx) * 0.18 + Math.cos(angle * 7 + m.cy) * 0.12) * m.roughness;
      const px = m.cx + Math.cos(angle) * m.rx * noise;
      const py = m.cy + Math.sin(angle) * m.ry * noise;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  // 3. Prominent Lunar Impact Craters & Magnificent Bright Ray Systems (Tycho, Copernicus, Kepler, Aristarchus)
  const majorCraters: {
    x: number;
    y: number;
    r: number;
    rayCount: number;
    rayLength: number;
    bright: boolean;
    name: string;
  }[] = [
    // Tycho (Southern Highlands, ~43°S, 11°W) - The most prominent ray crater on the Moon
    { x: 495, cy: 375, r: 10, rayCount: 36, rayLength: 265, bright: true, name: 'Tycho' } as any,
    // Copernicus (Oceanus Procellarum / Imbrium boundary, ~10°N, 20°W)
    { x: 455, cy: 228, r: 12, rayCount: 28, rayLength: 165, bright: true, name: 'Copernicus' } as any,
    // Kepler (Western Procellarum)
    { x: 405, cy: 232, r: 7, rayCount: 18, rayLength: 98, bright: true, name: 'Kepler' } as any,
    // Aristarchus (Brightest feature on the Moon)
    { x: 380, cy: 190, r: 8, rayCount: 16, rayLength: 88, bright: true, name: 'Aristarchus' } as any,
    // Plato (Dark Lava Floor on North rim of Imbrium)
    { x: 485, cy: 135, r: 9, rayCount: 0, rayLength: 0, bright: false, name: 'Plato' } as any,
    // Langrenus (East)
    { x: 675, cy: 275, r: 11, rayCount: 14, rayLength: 75, bright: true, name: 'Langrenus' } as any,
    // Stevinus & Furnerius
    { x: 660, cy: 345, r: 8, rayCount: 12, rayLength: 92, bright: true, name: 'Stevinus' } as any,
    // Byrgius A (Western rays)
    { x: 325, cy: 320, r: 6, rayCount: 12, rayLength: 110, bright: true, name: 'Byrgius' } as any,
    // Clavius (Massive ancient southern walled plain)
    { x: 475, cy: 410, r: 16, rayCount: 0, rayLength: 0, bright: false, name: 'Clavius' } as any,
  ];

  majorCraters.forEach(c => {
    const cy = (c as any).cy || c.y;

    // A. Draw radiating ejecta rays (bright wispy filaments extending thousands of km across lunar terrain)
    if (c.rayCount > 0 && c.bright) {
      ctx.save();
      for (let i = 0; i < c.rayCount; i++) {
        const baseAngle = (i / c.rayCount) * Math.PI * 2;
        const jitter = (Math.sin(i * 3.7) * 0.15);
        const angle = baseAngle + jitter;
        const length = c.rayLength * (0.6 + Math.random() * 0.6);

        const endX = c.x + Math.cos(angle) * length;
        const endY = cy + Math.sin(angle) * length;

        const rayGrad = ctx.createLinearGradient(c.x, cy, endX, endY);
        rayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
        rayGrad.addColorStop(0.2, 'rgba(242, 247, 255, 0.45)');
        rayGrad.addColorStop(0.6, 'rgba(220, 230, 245, 0.18)');
        rayGrad.addColorStop(1.0, 'rgba(200, 210, 225, 0)');

        ctx.strokeStyle = rayGrad;
        ctx.lineWidth = 0.8 + Math.random() * 1.8;
        ctx.beginPath();
        ctx.moveTo(c.x, cy);
        // Slight organic curve to ray
        const midX = (c.x + endX) * 0.5 + Math.sin(i * 5) * 4;
        const midY = (cy + endY) * 0.5 + Math.cos(i * 5) * 4;
        ctx.quadraticCurveTo(midX, midY, endX, endY);
        ctx.stroke();
      }
      ctx.restore();
    }

    // B. Draw Crater Rim & Terraces
    ctx.save();
    if (c.bright) {
      // Brilliant ejecta blanket halo
      const haloGrad = ctx.createRadialGradient(c.x, cy, c.r * 0.5, c.x, cy, c.r * 2.8);
      haloGrad.addColorStop(0, 'rgba(255, 255, 255, 0.88)');
      haloGrad.addColorStop(0.5, 'rgba(235, 240, 250, 0.58)');
      haloGrad.addColorStop(1, 'rgba(200, 215, 230, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(c.x, cy, c.r * 2.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sunlit bright rim (illuminated from upper-right)
    ctx.strokeStyle = c.bright ? '#ffffff' : '#dbeafe';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(c.x, cy, c.r, 0, Math.PI * 2);
    ctx.stroke();

    // Dark crater interior floor
    const floorColor = c.name === 'Plato' ? '#283548' : c.bright ? '#cbd5e1' : '#3e4c5e';
    ctx.fillStyle = floorColor;
    ctx.beginPath();
    ctx.arc(c.x, cy, c.r * 0.75, 0, Math.PI * 2);
    ctx.fill();

    // Central peak highlight if diameter > 8
    if (c.r >= 8 && c.name !== 'Plato') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(c.x - 0.5, cy - 0.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  // 4. Thousands of organic micro-craters across both Highlands and Maria
  for (let i = 0; i < 650; i++) {
    const cx = Math.random() * 1024;
    const cy = Math.random() * 512;
    const cr = 0.8 + Math.random() * 4.2;
    const isFarSide = cx < 200 || cx > 820;

    ctx.save();
    // Shadow interior
    ctx.fillStyle = isFarSide ? 'rgba(45, 55, 70, 0.65)' : 'rgba(30, 38, 50, 0.58)';
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();

    // Sunlit rim crescent
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, Math.PI * 0.1, Math.PI * 1.1, false);
    ctx.stroke();
    ctx.restore();
  }

  // 5. Subtle Montes Apenninus mountain range curve along Mare Imbrium
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.62)';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(495, 215);
  ctx.quadraticCurveTo(480, 245, 440, 240);
  ctx.stroke();
  ctx.restore();

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Procedural Photorealistic Starfield & Deep Space Sky Texture
 * Features 8000+ realistic pinpoint stars with stellar spectral colors,
 * soft Milky Way interstellar dust lanes, and glowing nebulae with zero artificial text.
 */
export function generateStarfieldTexture(): THREE.CanvasTexture {
  const size = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Deep cosmic background
  ctx.fillStyle = '#010206';
  ctx.fillRect(0, 0, size, size);

  // 1. Rich Milky Way Galactic Band & Multi-Color Cosmic Nebulae Dust Lanes
  const drawNebula = (x: number, y: number, r: number, color1: string, color2: string) => {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, color1);
    grad.addColorStop(0.4, color2);
    grad.addColorStop(0.8, color2.replace(/[\d.]+\)$/, '0.04)'));
    grad.addColorStop(1.0, 'rgba(1, 2, 6, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  // Complex multi-colored Milky Way arms and vibrant cosmic dust clouds
  drawNebula(size * 0.30, size * 0.35, 750, 'rgba(14, 116, 144, 0.25)', 'rgba(56, 189, 248, 0.14)');
  drawNebula(size * 0.70, size * 0.45, 800, 'rgba(126, 34, 206, 0.24)', 'rgba(192, 132, 252, 0.14)');
  drawNebula(size * 0.50, size * 0.55, 950, 'rgba(15, 23, 42, 0.50)', 'rgba(30, 58, 138, 0.28)');
  drawNebula(size * 0.25, size * 0.70, 700, 'rgba(225, 29, 72, 0.16)', 'rgba(251, 113, 133, 0.09)');
  drawNebula(size * 0.85, size * 0.25, 650, 'rgba(217, 119, 6, 0.18)', 'rgba(252, 211, 77, 0.10)');
  drawNebula(size * 0.55, size * 0.25, 750, 'rgba(6, 182, 212, 0.20)', 'rgba(45, 212, 191, 0.10)');

  // 2. Ultra-Dense Photorealistic Starfield (16,000+ stars with authentic stellar spectra)
  const spectralColors = [
    '#ffffff', // Diamond White (Class A)
    '#eff6ff', // Bright Blue-White (Class B)
    '#60a5fa', // Vivid Electric Blue (Class O)
    '#fef08a', // Solar Yellow-Cream (Class G)
    '#fde047', // Golden Yellow (Class F)
    '#fb923c', // Warm Orange (Class K Giant)
    '#f87171', // Ruby Red Supergiant (Class M)
  ];

  for (let i = 0; i < 16000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const mag = Math.random();

    let r: number;
    let alpha: number;
    let color: string;

    if (mag > 0.992) {
      // 1st magnitude navigational brilliant stars with optical halo
      r = 2.8 + Math.random() * 1.6;
      alpha = 0.98;
      color = spectralColors[Math.floor(Math.random() * spectralColors.length)];

      const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 4.2);
      halo.addColorStop(0, color);
      halo.addColorStop(0.35, 'rgba(255, 255, 255, 0.45)');
      halo.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, r * 4.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (mag > 0.94) {
      r = 1.6 + Math.random() * 1.0;
      alpha = 0.90;
      color = spectralColors[Math.floor(Math.random() * 5)];
    } else if (mag > 0.75) {
      r = 1.0 + Math.random() * 0.6;
      alpha = 0.75;
      color = '#e2e8f0';
    } else {
      r = 0.5 + Math.random() * 0.4;
      alpha = 0.40 + Math.random() * 0.35;
      color = '#cbd5e1';
    }

    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  // 3. Central Polaris (North Star Beacon - Radiant celestial pole beacon)
  const px = size / 2;
  const py = size * 0.15;
  const polarisGlow = ctx.createRadialGradient(px, py, 0, px, py, 55);
  polarisGlow.addColorStop(0, '#ffffff');
  polarisGlow.addColorStop(0.2, '#fef08a');
  polarisGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.35)');
  polarisGlow.addColorStop(1.0, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = polarisGlow;
  ctx.beginPath();
  ctx.arc(px, py, 55, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(px, py, 4.2, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Procedural Star Sparkle & Caustic Water-Reflection Glint Texture
 * Generates an optical starburst with diffraction spikes, vibrant core, and shimmering caustic rings
 */
export function generateStarSparkleTexture(hexColor: string): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;

  ctx.clearRect(0, 0, size, size);

  // 1. Outer diffuse glow
  const diffuseGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.45);
  diffuseGrad.addColorStop(0, hexColor);
  diffuseGrad.addColorStop(0.3, hexColor);
  diffuseGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.15)');
  diffuseGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = diffuseGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // 2. Caustic Water Ripple Concentric Halo Rings
  for (let r = 18; r <= 80; r += 14) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 3. Primary 4-Point Long Diffraction Spikes (Star Cross)
  const drawSpike = (angle: number, length: number, thickness: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const spikeGrad = ctx.createLinearGradient(0, 0, length, 0);
    spikeGrad.addColorStop(0, '#ffffff');
    spikeGrad.addColorStop(0.2, hexColor);
    spikeGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.4)');
    spikeGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = spikeGrad;

    // Diamond polygon spike (both sides)
    ctx.beginPath();
    ctx.moveTo(0, thickness);
    ctx.lineTo(length, 0);
    ctx.lineTo(0, -thickness);
    ctx.lineTo(-length, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // Main cardinal spikes
  drawSpike(0, size * 0.48, 4.5);
  drawSpike(Math.PI / 2, size * 0.48, 4.5);

  // Secondary diagonal shimmer spikes
  drawSpike(Math.PI / 4, size * 0.30, 2.5);
  drawSpike(-Math.PI / 4, size * 0.30, 2.5);

  // 4. Ultra-bright Pure White Central Core
  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.5, '#ffffff');
  coreGrad.addColorStop(0.85, hexColor);
  coreGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Procedural Bright Yellow Sun Sparkle Texture with Short Shimmering Rays
 * Mimics water-reflection caustic glints with short, crisp solar rays and ripples
 */
export function generateSunSparkleTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;

  ctx.clearRect(0, 0, size, size);

  // 1. Wide Radiant Solar Bloom & Glare (envolve e dissolve a borda da esfera em luz pura)
  const diffuseGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.48);
  diffuseGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  diffuseGrad.addColorStop(0.14, 'rgba(255, 253, 230, 0.95)');
  diffuseGrad.addColorStop(0.28, 'rgba(255, 240, 150, 0.75)');
  diffuseGrad.addColorStop(0.48, 'rgba(255, 210, 45, 0.40)');  // radiant golden yellow
  diffuseGrad.addColorStop(0.72, 'rgba(255, 155, 20, 0.14)');  // warm golden amber
  diffuseGrad.addColorStop(1.0, 'rgba(255, 90, 0, 0.0)');      // seamless transparency
  ctx.fillStyle = diffuseGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.48, 0, Math.PI * 2);
  ctx.fill();

  // 2. Luminous Solar Diffraction Rays (feixes radiantes de luz solar)
  const drawShortRay = (angle: number, length: number, thickness: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const spikeGrad = ctx.createLinearGradient(0, 0, length, 0);
    spikeGrad.addColorStop(0.0, '#ffffff');
    spikeGrad.addColorStop(0.30, '#fff9db');
    spikeGrad.addColorStop(0.60, 'rgba(255, 212, 59, 0.75)');
    spikeGrad.addColorStop(0.85, 'rgba(255, 155, 43, 0.25)');
    spikeGrad.addColorStop(1.0, 'rgba(255, 107, 0, 0)');

    const spikeGradNeg = ctx.createLinearGradient(0, 0, -length, 0);
    spikeGradNeg.addColorStop(0.0, '#ffffff');
    spikeGradNeg.addColorStop(0.30, '#fff9db');
    spikeGradNeg.addColorStop(0.60, 'rgba(255, 212, 59, 0.75)');
    spikeGradNeg.addColorStop(0.85, 'rgba(255, 155, 43, 0.25)');
    spikeGradNeg.addColorStop(1.0, 'rgba(255, 107, 0, 0)');

    // Positive half-ray
    ctx.fillStyle = spikeGrad;
    ctx.beginPath();
    ctx.moveTo(0, thickness);
    ctx.lineTo(length, 0);
    ctx.lineTo(0, -thickness);
    ctx.closePath();
    ctx.fill();

    // Negative half-ray
    ctx.fillStyle = spikeGradNeg;
    ctx.beginPath();
    ctx.moveTo(0, thickness);
    ctx.lineTo(-length, 0);
    ctx.lineTo(0, -thickness);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // Primary cardinal solar rays
  const mainRayLen = size * 0.46;
  drawShortRay(0, mainRayLen, 6.5);
  drawShortRay(Math.PI / 2, mainRayLen, 6.5);

  // Secondary diagonal solar rays
  const diagRayLen = size * 0.36;
  drawShortRay(Math.PI / 4, diagRayLen, 5.0);
  drawShortRay(-Math.PI / 4, diagRayLen, 5.0);

  // Intermediate starburst rays
  const microRayLen = size * 0.26;
  drawShortRay(Math.PI / 8, microRayLen, 3.2);
  drawShortRay(3 * Math.PI / 8, microRayLen, 3.2);
  drawShortRay(-Math.PI / 8, microRayLen, 3.2);
  drawShortRay(-3 * Math.PI / 8, microRayLen, 3.2);

  // 3. Brilliant Incandescent White-Hot Central Core
  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.22);
  coreGrad.addColorStop(0.0, '#ffffff');
  coreGrad.addColorStop(0.45, '#ffffff');
  coreGrad.addColorStop(0.75, 'rgba(255, 250, 205, 0.85)');
  coreGrad.addColorStop(1.0, 'rgba(253, 224, 71, 0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates photorealistic Solar Corona (Coroa Solar) texture for Solar Eclipse totality.
 * Features a delicate, thin, and authentic arc of light (K-Corona rim) hugging the Moon
 * with rapid natural exponential falloff and subtle, silky magnetic streamers.
 */
export function generateSolarCoronaTexture(): THREE.CanvasTexture {
  const size = 1024; // High resolution for silky smooth gradients without banding
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;
  // Calibrated for sprite scale 1.25: Moon disk sits at ~0.163 * size
  const solarRadius = size * 0.160;

  ctx.clearRect(0, 0, size, size);

  // 1. Delicate outer coronal halo with rapid natural falloff (thin & elegant, not a giant bloated bulb)
  const outerGrad = ctx.createRadialGradient(cx, cy, solarRadius * 0.95, cx, cy, size * 0.36);
  outerGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.85)');
  outerGrad.addColorStop(0.08, 'rgba(255, 253, 248, 0.55)');
  outerGrad.addColorStop(0.18, 'rgba(240, 248, 255, 0.22)');
  outerGrad.addColorStop(0.35, 'rgba(210, 230, 255, 0.06)');
  outerGrad.addColorStop(0.60, 'rgba(170, 205, 255, 0.01)');
  outerGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = outerGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.36, 0, Math.PI * 2);
  ctx.fill();

  // 2. Subtle natural equatorial helmet streamers (slight East-West magnetic elongation)
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1.30, 0.88);
  const eqGrad = ctx.createRadialGradient(0, 0, solarRadius * 0.90, 0, 0, size * 0.28);
  eqGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.35)');
  eqGrad.addColorStop(0.25, 'rgba(240, 248, 255, 0.15)');
  eqGrad.addColorStop(0.55, 'rgba(205, 230, 255, 0.03)');
  eqGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = eqGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Crisp, thin inner K-Corona rim (the refined pearlescent arc of light hugging the lunar limb)
  // Rapid decay ensures a thin, beautiful celestial ring rather than a thick donut
  const innerRimGrad = ctx.createRadialGradient(cx, cy, solarRadius * 0.92, cx, cy, solarRadius * 1.32);
  innerRimGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  innerRimGrad.addColorStop(0.20, 'rgba(255, 255, 255, 0.92)');
  innerRimGrad.addColorStop(0.45, 'rgba(250, 252, 255, 0.50)');
  innerRimGrad.addColorStop(0.75, 'rgba(235, 245, 255, 0.15)');
  innerRimGrad.addColorStop(1.0, 'rgba(210, 235, 255, 0.0)');
  ctx.fillStyle = innerRimGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, solarRadius * 1.32, 0, Math.PI * 2);
  ctx.fill();

  // 4. Fine silky magnetic micro-streamers (delicate, low-contrast wisps)
  const filamentCount = 180;
  for (let i = 0; i < filamentCount; i++) {
    const angle = (i / filamentCount) * Math.PI * 2;
    const cosA = Math.cos(angle);
    const dipoleLen = Math.pow(Math.abs(cosA), 1.8) * (size * 0.08);
    const ripple = Math.sin(angle * 9.0) * (size * 0.012);
    const len = solarRadius + (size * 0.04) + dipoleLen + ripple;

    const grad = ctx.createLinearGradient(
      cx + Math.cos(angle) * solarRadius,
      cy + Math.sin(angle) * solarRadius,
      cx + Math.cos(angle) * len,
      cy + Math.sin(angle) * len
    );
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.12)');
    grad.addColorStop(0.35, 'rgba(240, 248, 255, 0.04)');
    grad.addColorStop(1.0, 'rgba(200, 230, 255, 0.0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * solarRadius, cy + Math.sin(angle) * solarRadius);
    ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a purely spherical, translucent cosmic smoke/cloud texture for Rahu & Ketu.
 * Soft organic falloff (no hard edges), highly transparent, non-rocky.
 */
export function generateSmokyCloudTexture(type: 'rahu' | 'ketu'): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.46;

  ctx.clearRect(0, 0, size, size);

  // Soft spherical volumetric falloff (cubic smoothstep to zero at edges)
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  if (type === 'rahu') {
    // Smoky charcoal / translucent obsidian cosmic smoke (quase transparente)
    grad.addColorStop(0.0, 'rgba(25, 32, 45, 0.16)');
    grad.addColorStop(0.35, 'rgba(28, 36, 50, 0.12)');
    grad.addColorStop(0.65, 'rgba(32, 40, 58, 0.07)');
    grad.addColorStop(0.88, 'rgba(38, 48, 68, 0.025)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  } else {
    // Smoky dark crimson / copper translucent cosmic smoke (quase transparente)
    grad.addColorStop(0.0, 'rgba(85, 24, 18, 0.16)');
    grad.addColorStop(0.35, 'rgba(72, 20, 15, 0.12)');
    grad.addColorStop(0.65, 'rgba(58, 16, 12, 0.07)');
    grad.addColorStop(0.88, 'rgba(48, 14, 10, 0.025)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  }

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Subtle organic wisps and swirls of smoke inside the spherical cloud
  ctx.save();
  for (let i = 0; i < 16; i++) {
    const wispAngle = (i / 16) * Math.PI * 2 + Math.sin(i * 1.8) * 0.4;
    const wispDist = radius * (0.18 + 0.42 * Math.sin(i * 2.3));
    const wx = cx + Math.cos(wispAngle) * wispDist;
    const wy = cy + Math.sin(wispAngle) * wispDist;
    const wispR = radius * (0.18 + 0.15 * Math.cos(i * 3.1));

    const wispGrad = ctx.createRadialGradient(wx, wy, 0, wx, wy, wispR);
    if (type === 'rahu') {
      wispGrad.addColorStop(0.0, 'rgba(20, 26, 38, 0.08)');
      wispGrad.addColorStop(1.0, 'rgba(20, 26, 38, 0)');
    } else {
      wispGrad.addColorStop(0.0, 'rgba(65, 18, 14, 0.08)');
      wispGrad.addColorStop(1.0, 'rgba(65, 18, 14, 0)');
    }
    ctx.fillStyle = wispGrad;
    ctx.beginPath();
    ctx.arc(wx, wy, wispR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Procedural Lunar Atmospheric Halo & Light Focus Texture
 * Smooth radial glow with luminous silvery-blue core and deep royal navy falloff
 */
export function generateMoonGlowTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;

  ctx.clearRect(0, 0, size, size);

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
  grad.addColorStop(0.0, 'rgba(235, 248, 255, 0.95)');  // Silvery-white lunar core
  grad.addColorStop(0.12, 'rgba(180, 220, 255, 0.65)'); // Soft lunar corona
  grad.addColorStop(0.30, 'rgba(35, 95, 205, 0.40)');   // Navy blue atmospheric scatter
  grad.addColorStop(0.55, 'rgba(12, 38, 105, 0.22)');   // Deep navy blue falloff
  grad.addColorStop(0.80, 'rgba(6, 18, 55, 0.08)');     // Midnight indigo transition
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');           // Seamless transparency

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}


