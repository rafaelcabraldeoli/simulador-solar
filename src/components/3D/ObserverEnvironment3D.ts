import * as THREE from 'three';

export type ObserverBiomeType =
  | 'field'
  | 'mountain'
  | 'tropical'
  | 'andes'
  | 'forest'
  | 'beach'
  | 'city';

// =====================================================================
// PROCEDURAL TEXTURE GENERATORS FOR ULTRA-REALISTIC TERRAIN & VEGETATION
// =====================================================================

/**
 * Procedural Lush Grass & Wildflower Ground Texture
 */
function createGrassTileTexture(
  theme: 'lush' | 'tropical' | 'golden_alpine' | 'forest_moss' = 'lush'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Base Soil & Turf Underlayer
  if (theme === 'lush') {
    ctx.fillStyle = '#264b1a';
  } else if (theme === 'tropical') {
    ctx.fillStyle = '#1c3e16';
  } else if (theme === 'golden_alpine') {
    ctx.fillStyle = '#61481c';
  } else {
    ctx.fillStyle = '#1e3818';
  }
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. Multi-tone Earth and Humus Blending (Fine organic soil gradient without repeating ripple rings)
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const rx = 15 + Math.random() * 35;
    const ry = 10 + Math.random() * 25;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
    if (theme === 'golden_alpine') {
      grad.addColorStop(0, 'rgba(110, 80, 25, 0.20)');
      grad.addColorStop(1, 'rgba(60, 45, 15, 0)');
    } else {
      grad.addColorStop(0, 'rgba(35, 65, 20, 0.22)');
      grad.addColorStop(1, 'rgba(20, 40, 15, 0)');
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Dense Grass Blades (Mato Realista)
  const bladeCount = 75000;
  for (let i = 0; i < bladeCount; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const len = 3 + Math.random() * 8;
    const angle = (Math.random() - 0.5) * 0.7;

    const shade = Math.random();
    if (theme === 'golden_alpine') {
      // Warm golden/amber alpine tussock grass (like Andes/Puna)
      ctx.strokeStyle =
        shade > 0.7
          ? '#d4a341'
          : shade > 0.4
          ? '#b58328'
          : shade > 0.15
          ? '#8f681a'
          : '#5c4515';
    } else if (theme === 'tropical') {
      // Emerald / Rainforest lush green grass
      ctx.strokeStyle =
        shade > 0.7
          ? '#22c55e'
          : shade > 0.4
          ? '#15803d'
          : shade > 0.15
          ? '#166534'
          : '#14532d';
    } else if (theme === 'forest_moss') {
      // Deep mossy forest undergrowth
      ctx.strokeStyle =
        shade > 0.7
          ? '#4ade80'
          : shade > 0.4
          ? '#2e7d32'
          : shade > 0.15
          ? '#1b5e20'
          : '#0f3a14';
    } else {
      // Meadow green with natural vibrance
      ctx.strokeStyle =
        shade > 0.75
          ? '#4ade80'
          : shade > 0.45
          ? '#22c55e'
          : shade > 0.2
          ? '#16a34a'
          : '#15803d';
    }

    ctx.lineWidth = 0.8 + Math.random() * 1.4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.sin(angle) * len, y - Math.cos(angle) * len);
    ctx.stroke();
  }

  // 4. Subtle Micro-flora Specks (Delicate natural accents, no repeating circular foam rings)
  const flowerCount = 60;
  for (let i = 0; i < flowerCount; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.45)' : 'rgba(240, 220, 130, 0.40)';
    ctx.beginPath();
    ctx.arc(x, y, 0.8 + Math.random() * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

/**
 * Procedural Mountain Rock & Snow Cliff Texture
 */
function createMountainRockTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Dark slate granite base
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 0, 1024, 1024);

  // Vertical rock fissures & striations
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const h = 40 + Math.random() * 160;
    const shade = Math.random();
    ctx.strokeStyle = shade > 0.6 ? '#475569' : shade > 0.3 ? '#1e293b' : '#64748b';
    ctx.lineWidth = 1 + Math.random() * 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 20, y + h);
    ctx.stroke();
  }

  // Snow accumulation at higher vertical coordinates
  for (let y = 0; y < 400; y++) {
    const snowProb = 1.0 - y / 400;
    for (let x = 0; x < 1024; x += 3) {
      if (Math.random() < snowProb * 0.75) {
        ctx.fillStyle = Math.random() > 0.3 ? '#f8fafc' : '#e2e8f0';
        ctx.fillRect(x, y, 3, 3);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 4);
  return texture;
}

/**
 * Procedural Tree Bark Texture
 */
function createTreeBarkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3b2819';
  ctx.fillRect(0, 0, 256, 512);

  // Bark vertical ridges & crevices
  for (let x = 0; x < 256; x += 3) {
    const shade = Math.random();
    ctx.fillStyle = shade > 0.6 ? '#4a3320' : shade > 0.3 ? '#2c1e13' : '#573d26';
    ctx.fillRect(x, 0, 3, 512);
  }

  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 512;
    ctx.strokeStyle = Math.random() > 0.5 ? '#1f140c' : '#5c3e24';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 10 + Math.random() * 30);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Procedural Foliage Leaf Cluster Texture with Transparency
 */
function createFoliageTexture(colorHex: string = '#22c55e'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 256, 256);

  // Draw organic cluster of leaves
  const center = 128;
  for (let i = 0; i < 800; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.pow(Math.random(), 0.6) * 110;
    const x = center + Math.cos(angle) * dist;
    const y = center + Math.sin(angle) * dist;

    const shade = Math.random();
    ctx.fillStyle = shade > 0.6 ? colorHex : shade > 0.3 ? '#166534' : '#15803d';
    ctx.beginPath();
    ctx.ellipse(x, y, 4 + Math.random() * 4, 8 + Math.random() * 6, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Procedural Grass Blade Quad Texture
 */
function createGrassTuftTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 256, 256);

  // Draw multiple arching grass blades originating from bottom center
  const originX = 128;
  const originY = 250;

  for (let i = 0; i < 35; i++) {
    const spread = (Math.random() - 0.5) * 180;
    const tipY = 20 + Math.random() * 120;
    const tipX = originX + spread;
    const ctrlX = originX + spread * 0.4 + (Math.random() - 0.5) * 30;
    const ctrlY = originY - 80 - Math.random() * 40;

    const shade = Math.random();
    ctx.strokeStyle = shade > 0.7 ? '#4ade80' : shade > 0.4 ? '#22c55e' : '#15803d';
    ctx.lineWidth = 2 + Math.random() * 2.5;
    ctx.beginPath();
    ctx.moveTo(originX + (Math.random() - 0.5) * 20, originY);
    ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
    ctx.stroke();
  }

  // Add 2 tiny wildflowers on the grass tuft
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(80, 70, 4, 0, Math.PI * 2);
  ctx.arc(175, 95, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(80, 70, 2, 0, Math.PI * 2);
  ctx.arc(175, 95, 2, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * City Rooftop paver texture
 */
function createCityRooftopTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 512);

  const tileSize = 64;
  for (let x = 0; x < 512; x += tileSize) {
    for (let y = 0; y < 512; y += tileSize) {
      const shade = 30 + (Math.random() - 0.5) * 8;
      ctx.fillStyle = `rgb(${shade}, ${shade + 4}, ${shade + 12})`;
      ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

/**
 * Beach Sand Texture
 */
function createSandTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#d4b278';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 30000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const shade = Math.random();
    ctx.fillStyle = shade > 0.6 ? '#e6c88f' : shade > 0.3 ? '#be9b60' : '#f5deb3';
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 10);
  return texture;
}

// =====================================================================
// 3D PROCEDURAL TREE GENERATOR (Pines, Oaks, Tropical Palms & Rainforest)
// All proportions calibrated to Human Observer Scale (Eye Height = 0.04 = 1.75m)
// =====================================================================

export class TreeFactory {
  private static barkMat = new THREE.MeshStandardMaterial({
    map: createTreeBarkTexture(),
    roughness: 0.9,
    metalness: 0.05,
  });

  private static pineMat = new THREE.MeshStandardMaterial({
    color: 0x14532d,
    roughness: 0.75,
    metalness: 0.1,
  });

  private static oakMat = new THREE.MeshStandardMaterial({
    color: 0x16a34a,
    roughness: 0.7,
    metalness: 0.05,
  });

  private static tropicalMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    roughness: 0.65,
    metalness: 0.05,
  });

  private static goldenAlpineMat = new THREE.MeshStandardMaterial({
    color: 0xb58328,
    roughness: 0.8,
    metalness: 0.05,
  });

  /**
   * Create realistic Pine / Fir tree (proportional to 0.00008 grain of sand eye level)
   */
  public static createPineTree(scale = 1.0): THREE.Group {
    const tree = new THREE.Group();
    const s = scale * 0.00008; // Proporcional ao grão de areia (-90%)
    tree.scale.set(s, s, s);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.14, 0.32, 3.8, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.barkMat);
    trunk.position.y = 1.9;
    tree.add(trunk);

    // Conical tiered needle branches
    const tiers = 5;
    for (let t = 0; t < tiers; t++) {
      const radius = 1.7 - t * 0.28;
      const height = 1.4 - t * 0.14;
      const coneGeo = new THREE.ConeGeometry(radius, height, 8);
      const foliage = new THREE.Mesh(coneGeo, this.pineMat);
      foliage.position.y = 1.8 + t * 0.80;
      foliage.rotation.y = t * 0.55;
      tree.add(foliage);
    }

    return tree;
  }

  /**
   * Create realistic Deciduous Oak tree (proportional to 0.00008 grain of sand eye level)
   */
  public static createOakTree(scale = 1.0, theme: 'lush' | 'golden' = 'lush'): THREE.Group {
    const tree = new THREE.Group();
    const s = scale * 0.00008; // Proporcional ao grão de areia (-90%)
    tree.scale.set(s, s, s);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.38, 3.2, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.barkMat);
    trunk.position.y = 1.6;
    tree.add(trunk);

    // Multi-cluster leafy canopy
    const mat = theme === 'golden' ? this.goldenAlpineMat : this.oakMat;
    const canopyCenters = [
      { x: 0, y: 3.4, z: 0, r: 1.5, sx: 1.2, sy: 1.0, sz: 1.2 },
      { x: 0.7, y: 3.0, z: 0.4, r: 1.1, sx: 1.0, sy: 0.9, sz: 1.1 },
      { x: -0.6, y: 3.2, z: -0.4, r: 1.2, sx: 1.1, sy: 0.9, sz: 1.0 },
      { x: 0.2, y: 4.0, z: -0.2, r: 1.0, sx: 1.0, sy: 0.85, sz: 1.0 },
      { x: -0.4, y: 2.8, z: 0.6, r: 1.0, sx: 1.0, sy: 0.8, sz: 1.0 },
    ];

    canopyCenters.forEach(c => {
      const geo = new THREE.DodecahedronGeometry(c.r, 1);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(c.x, c.y, c.z);
      mesh.scale.set(c.sx, c.sy, c.sz);
      mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      tree.add(mesh);
    });

    return tree;
  }

  /**
   * Create realistic Tropical Rainforest Tree (~10m - 12m real height)
   */
  public static createTropicalTree(scale = 1.0): THREE.Group {
    const tree = new THREE.Group();
    const s = scale * 0.00008; // Proporcional ao grão de areia (-90%)
    tree.scale.set(s, s, s);

    // Slender jungle trunk
    const trunkGeo = new THREE.CylinderGeometry(0.14, 0.42, 4.8, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.barkMat);
    trunk.position.y = 2.4;
    tree.add(trunk);

    // Umbrella canopy
    const domeGeo = new THREE.CylinderGeometry(2.2, 0.5, 1.2, 10);
    const dome = new THREE.Mesh(domeGeo, this.tropicalMat);
    dome.position.y = 4.8;
    tree.add(dome);

    const topSphereGeo = new THREE.SphereGeometry(1.4, 8, 8);
    const topSphere = new THREE.Mesh(topSphereGeo, this.tropicalMat);
    topSphere.position.y = 5.2;
    topSphere.scale.set(1.3, 0.65, 1.3);
    tree.add(topSphere);

    return tree;
  }

  /**
   * Create tropical palm tree (~6m - 9m real height)
   */
  public static createPalmTree(scale = 1.0): THREE.Group {
    const tree = new THREE.Group();
    const s = scale * 0.00008; // Proporcional ao grão de areia (-90%)
    tree.scale.set(s, s, s);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.22, 3.6, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.barkMat);
    trunk.position.y = 1.8;
    trunk.rotation.z = 0.10;
    tree.add(trunk);

    // Palm fronds
    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });

    for (let f = 0; f < 8; f++) {
      const frondAngle = (f / 8) * Math.PI * 2;
      const frondGeo = new THREE.ConeGeometry(0.65, 2.2, 4);
      const frond = new THREE.Mesh(frondGeo, frondMat);
      frond.position.set(0.18, 3.5, 0);
      frond.rotation.y = frondAngle;
      frond.rotation.x = 0.92;
      tree.add(frond);
    }

    return tree;
  }

  /**
   * Create Wild Shrub / Bush
   */
  public static createBush(scale = 1.0, colorHex = 0x22c55e): THREE.Group {
    const bush = new THREE.Group();
    const s = scale * 0.00006; // Proporcional ao grão de areia (-90%)
    bush.scale.set(s, s, s);

    const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.8 });
    const sphere1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 1), mat);
    sphere1.position.set(0, 0.32, 0);
    bush.add(sphere1);

    const sphere2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 1), mat);
    sphere2.position.set(0.25, 0.25, 0.18);
    bush.add(sphere2);

    const sphere3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 1), mat);
    sphere3.position.set(-0.22, 0.26, -0.12);
    bush.add(sphere3);

    return bush;
  }
}

// =====================================================================
// 3D MOUNTAIN BUILDER (Alpine Peaks, Granite Ranges & Rolling Hills)
// Calibrated to Horizon Panorama (Height = 1.2 - 2.2 units, Distance = 22 - 38 units)
// =====================================================================

export class MountainRangeBuilder {
  public static mountainMats: THREE.MeshStandardMaterial[] = [];

  /**
   * Helper to evaluate directional envelope for opening the West horizon (Lagoon & Sunset)
   * - North (0°): 1.0 (Alpine cordillera)
   * - East (90°): 1.0 (Lush mountains)
   * - South (180°): 1.0 (Soft rolling hills)
   * - South-West (180° -> 230°): Graceful Hermite falloff from 1.0 down to 0.0 (rolling foothills to plain)
   * - West (230° -> 310°): 0.0 (Completely flat open horizon, zero elevation, unobstructed lagoon view)
   * - North-West (310° -> 355°): Graceful Hermite rise from 0.0 up to 1.0 (foothills rising to alpine peaks)
   * - 355° -> 360° (0°): 1.0
   * 100% continuous C^1 function across [0, 2*PI] with zero seams or tears.
   */
  private static getDirectionalEnvelope(angle: number): number {
    let a = angle % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;
    const deg = (a * 180) / Math.PI;

    if (deg >= 0 && deg <= 185) {
      return 1.0;
    } else if (deg > 185 && deg < 230) {
      const t = (deg - 185) / 45;
      return 1.0 - (3 * t * t - 2 * t * t * t);
    } else if (deg >= 230 && deg <= 310) {
      return 0.0;
    } else if (deg > 310 && deg < 355) {
      const t = (deg - 310) / 45;
      return 3 * t * t - 2 * t * t * t;
    } else {
      return 1.0;
    }
  }

  /**
   * Build the Directional Horizon Panorama for the Field Biome:
   * Unified, seamless, multi-row 3D mountain range with zero vertical cuts or tears.
   */
  public static buildDirectionalHorizonPanorama(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'DirectionalHorizonPanorama3D';

    // Layer 1: Main Horizon Mountain Chain (High-detail multi-row sloped terrain)
    const segments = 240;
    const numRows = 6;
    const geo1 = new THREE.BufferGeometry();
    const positions1: number[] = [];
    const uvs1: number[] = [];
    const colors1: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const env = this.getDirectionalEnvelope(angle);

      // Base directional height profile:
      // North (0): ~3.1m, East (PI/2): ~2.2m, South (PI): ~0.85m
      const b = 1.95 + 1.15 * Math.cos(angle) + 0.25 * Math.sin(angle);

      // Organic ridge variations using STRICTLY integer periodic frequencies
      const d1 = Math.sin(angle * 2 + 0.6) * 0.38;
      const d2 = Math.cos(angle * 4 - 0.5) * 0.24;
      const d3 = Math.sin(angle * 6 + 1.3) * 0.15;
      const d4 = Math.cos(angle * 8 + 0.3) * 0.09;
      const d5 = Math.sin(angle * 12 - 0.7) * 0.05;
      const rawH = Math.max(0.35, b + d1 + d2 + d3 + d4 + d5);
      const h = rawH * env;

      // Distance radius with gentle organic modulation
      const rBase = 20.5 + 2.5 * Math.cos(angle) + 0.6 * Math.sin(angle * 2);
      const rNoise = (Math.sin(angle * 4 + 0.7) * 0.35 + Math.cos(angle * 8) * 0.18) * env;
      const R = rBase + rNoise;

      // 6 Rows across the mountain cross-section
      const rowOffsets = [
        { r: -3.2, yFrac: 0.0, u: 0.0 },  // 0: Valley floor / inner footing
        { r: -1.8, yFrac: 0.22, u: 0.2 }, // 1: Lower foothills
        { r: -0.7, yFrac: 0.60, u: 0.4 }, // 2: Mid-mountain slopes
        { r: 0.0, yFrac: 1.0, u: 0.6 },   // 3: Mountain ridge summit crest
        { r: 1.3, yFrac: 0.48, u: 0.8 },  // 4: Outer shoulder
        { r: 2.8, yFrac: 0.0, u: 1.0 },   // 5: Outer horizon footing
      ];

      for (let j = 0; j < numRows; j++) {
        const row = rowOffsets[j];
        const rPos = R + row.r;
        const yPos = 0.0001 + h * row.yFrac;

        positions1.push(cosA * rPos, yPos, sinA * rPos);
        uvs1.push(i / segments, row.u);

        // Directional and altitudinal vertex coloring
        const col = new THREE.Color();
        if (env < 0.02 || h < 0.02) {
          // Flat meadow grass matching the ground
          col.setRGB(0.082, 0.420, 0.180);
        } else if (cosA > 0.2) {
          // North quadrant: Alpine snow peaks & granite rock
          if (yPos > 2.2) {
            // Snow-capped summit
            const snowBlend = Math.min(1.0, (yPos - 2.2) / 0.8);
            col.setRGB(0.90 + 0.08 * snowBlend, 0.93 + 0.05 * snowBlend, 0.96 + 0.04 * snowBlend);
          } else if (yPos > 1.0) {
            // Granite slate
            col.setRGB(0.28, 0.33, 0.41);
          } else {
            // Alpine pine green
            col.setRGB(0.09, 0.24, 0.17);
          }
        } else if (sinA > 0.2) {
          // East quadrant: Lush green mountains
          if (row.yFrac > 0.7) {
            // Sunlit emerald crest
            col.setRGB(0.13, 0.77, 0.37);
          } else if (row.yFrac > 0.3) {
            // Forest green slope
            col.setRGB(0.08, 0.58, 0.26);
          } else {
            // Meadow footing
            col.setRGB(0.08, 0.40, 0.18);
          }
        } else {
          // South quadrant: Soft rolling green hills
          if (row.yFrac > 0.7) {
            // Sunny light green knoll
            col.setRGB(0.35, 0.85, 0.48);
          } else {
            col.setRGB(0.12, 0.60, 0.28);
          }
        }

        colors1.push(col.r, col.g, col.b);
      }
    }

    const indices1: number[] = [];
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < numRows - 1; j++) {
        const c0 = i * numRows + j;
        const c1 = (i + 1) * numRows + j;
        const c2 = (i + 1) * numRows + (j + 1);
        const c3 = i * numRows + (j + 1);
        indices1.push(c0, c1, c3);
        indices1.push(c1, c2, c3);
      }
    }

    geo1.setAttribute('position', new THREE.Float32BufferAttribute(positions1, 3));
    geo1.setAttribute('uv', new THREE.Float32BufferAttribute(uvs1, 2));
    geo1.setAttribute('color', new THREE.Float32BufferAttribute(colors1, 3));
    geo1.setIndex(indices1);
    geo1.computeVertexNormals();

    // Weld normals across angle 0 and 2*PI boundary for seamless continuity
    const normAttr1 = geo1.getAttribute('normal') as THREE.BufferAttribute;
    for (let j = 0; j < numRows; j++) {
      const idx0 = j;
      const idxEnd = segments * numRows + j;
      const nx = (normAttr1.getX(idx0) + normAttr1.getX(idxEnd)) * 0.5;
      const ny = (normAttr1.getY(idx0) + normAttr1.getY(idxEnd)) * 0.5;
      const nz = (normAttr1.getZ(idx0) + normAttr1.getZ(idxEnd)) * 0.5;
      const len = Math.hypot(nx, ny, nz) || 1;
      normAttr1.setXYZ(idx0, nx / len, ny / len, nz / len);
      normAttr1.setXYZ(idxEnd, nx / len, ny / len, nz / len);
    }
    normAttr1.needsUpdate = true;

    const mat1 = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.04,
      side: THREE.DoubleSide,
    });
    this.mountainMats.push(mat1);

    const mesh1 = new THREE.Mesh(geo1, mat1);
    mesh1.castShadow = true;
    mesh1.receiveShadow = true;
    group.add(mesh1);

    // Layer 2: Distant Atmospheric Horizon Silhouette (Radius ~32.5m, atmospheric blue-slate)
    const distSegments = 160;
    const geo2 = new THREE.BufferGeometry();
    const positions2: number[] = [];
    const uvs2: number[] = [];
    const colors2: number[] = [];

    for (let i = 0; i <= distSegments; i++) {
      const angle = (i / distSegments) * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const env = this.getDirectionalEnvelope(angle);
      const bDist = 1.6 + 0.8 * Math.cos(angle);
      const nDist = Math.sin(angle * 2 + 1.0) * 0.3 + Math.cos(angle * 4) * 0.15;
      const hDist = Math.max(0.2, bDist + nDist) * env * 0.85;

      const RDist = 32.5 + 3.0 * Math.cos(angle) + Math.sin(angle * 3) * 0.4 * env;

      const distRows = [
        { r: -4.0, yFrac: 0.0 },
        { r: -1.5, yFrac: 0.5 },
        { r: 0.0, yFrac: 1.0 },
        { r: 3.5, yFrac: 0.0 },
      ];

      for (let j = 0; j < 4; j++) {
        const dRow = distRows[j];
        const rPos = RDist + dRow.r;
        const yPos = 0.0001 + hDist * dRow.yFrac;

        positions2.push(cosA * rPos, yPos, sinA * rPos);
        uvs2.push(i / distSegments, j / 3);

        const col = new THREE.Color();
        if (env < 0.02) {
          col.setRGB(0.082, 0.420, 0.180);
        } else if (cosA > 0.3 && dRow.yFrac > 0.8) {
          // Distant snow mist on high northern peaks
          col.setRGB(0.70, 0.76, 0.84);
        } else {
          // Atmospheric haze mountain silhouette
          col.setRGB(0.20 + 0.08 * dRow.yFrac, 0.28 + 0.10 * dRow.yFrac, 0.36 + 0.12 * dRow.yFrac);
        }
        colors2.push(col.r, col.g, col.b);
      }
    }

    const indices2: number[] = [];
    for (let i = 0; i < distSegments; i++) {
      for (let j = 0; j < 3; j++) {
        const c0 = i * 4 + j;
        const c1 = (i + 1) * 4 + j;
        const c2 = (i + 1) * 4 + (j + 1);
        const c3 = i * 4 + (j + 1);
        indices2.push(c0, c1, c3);
        indices2.push(c1, c2, c3);
      }
    }

    geo2.setAttribute('position', new THREE.Float32BufferAttribute(positions2, 3));
    geo2.setAttribute('uv', new THREE.Float32BufferAttribute(uvs2, 2));
    geo2.setAttribute('color', new THREE.Float32BufferAttribute(colors2, 3));
    geo2.setIndex(indices2);
    geo2.computeVertexNormals();

    const normAttr2 = geo2.getAttribute('normal') as THREE.BufferAttribute;
    for (let j = 0; j < 4; j++) {
      const idx0 = j;
      const idxEnd = distSegments * 4 + j;
      const nx = (normAttr2.getX(idx0) + normAttr2.getX(idxEnd)) * 0.5;
      const ny = (normAttr2.getY(idx0) + normAttr2.getY(idxEnd)) * 0.5;
      const nz = (normAttr2.getZ(idx0) + normAttr2.getZ(idxEnd)) * 0.5;
      const len = Math.hypot(nx, ny, nz) || 1;
      normAttr2.setXYZ(idx0, nx / len, ny / len, nz / len);
      normAttr2.setXYZ(idxEnd, nx / len, ny / len, nz / len);
    }
    normAttr2.needsUpdate = true;

    const mat2 = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
    this.mountainMats.push(mat2);

    const mesh2 = new THREE.Mesh(geo2, mat2);
    mesh2.castShadow = true;
    mesh2.receiveShadow = true;
    group.add(mesh2);

    return group;
  }

  /**
   * Build a 360° panoramic 3D mountain range with smooth rolling hills
   * and lush vegetation matching the specific biome theme.
   */
  public static buildMountainPanorama(
    theme: 'alpine_snow' | 'tropical_peaks' | 'andes_rock' = 'alpine_snow'
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'MountainPanorama3D';

    // Layer 1: Distant Majestic Mountain Range (Far Horizon)
    const distantGroup = this.createMountainRing(160, 24.0, 1.8, 3.0, theme, true);
    group.add(distantGroup);

    // Layer 2: Closer Mountain Silhouette
    const closeGroup = this.createMountainRing(160, 16.5, 1.2, 2.0, theme, false);
    group.add(closeGroup);

    return group;
  }

  /**
   * Build a directional 3D sloped mountain arc for specific compass quadrants
   * with genuine front-facing and back-facing slopes. Guaranteed smooth tapering
   * to zero elevation at both boundaries so no vertical cliffs or cuts occur.
   */
  public static buildMountainArc(
    startAngle: number,
    endAngle: number,
    segments: number,
    radius: number,
    baseHeight: number,
    peakAmplitude: number,
    baseColor: THREE.Color,
    peakColor: THREE.Color
  ): THREE.Mesh {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];
    const colors: number[] = [];

    const ringSegments = Math.max(segments, 64);
    for (let i = 0; i <= ringSegments; i++) {
      const t = i / ringSegments;
      const angle = startAngle + t * (endAngle - startAngle);
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Smooth envelope tapering to 0 at both arc ends to prevent open cliff faces
      const arcEnv = Math.sin(Math.PI * t);

      // Multi-octave natural ridge height variations (strictly integer relative frequencies)
      const noise1 = Math.sin(angle * 2 + 1.2) * 0.40;
      const noise2 = Math.cos(angle * 4 - 0.4) * 0.25;
      const noise3 = Math.sin(angle * 6 + 2.1) * 0.15;
      const heightFactor = Math.max(0.12, (noise1 + noise2 + noise3 + 1.0) / 2.0);

      const h = (baseHeight + heightFactor * peakAmplitude) * arcEnv;
      const rNoise = Math.sin(angle * 4 + 0.8) * 0.35 * arcEnv;
      const rInner = radius - 2.2;
      const rPeak = radius + rNoise;
      const rOuter = radius + 2.4;

      // Vertex 0: Inner Footing (Valley floor facing observer)
      positions.push(cosA * rInner, 0.0001, sinA * rInner);
      uvs.push(t, 0.0);
      colors.push(baseColor.r, baseColor.g, baseColor.b);

      // Vertex 1: Peak Ridge Crest
      positions.push(cosA * rPeak, 0.0001 + h, sinA * rPeak);
      uvs.push(t, 0.5);
      colors.push(peakColor.r, peakColor.g, peakColor.b);

      // Vertex 2: Outer Footing (Back side facing horizon perimeter)
      positions.push(cosA * rOuter, 0.0001, sinA * rOuter);
      uvs.push(t, 1.0);
      colors.push(baseColor.r * 0.85, baseColor.g * 0.85, baseColor.b * 0.85);
    }

    const indices: number[] = [];
    for (let i = 0; i < ringSegments; i++) {
      const i0 = i * 3;
      const i1 = (i + 1) * 3;

      // Front slope (facing observer / valley)
      indices.push(i0, i1, i0 + 1);
      indices.push(i1, i1 + 1, i0 + 1);

      // Back slope (facing away / outer perimeter)
      indices.push(i0 + 1, i1 + 1, i0 + 2);
      indices.push(i1 + 1, i1 + 2, i0 + 2);
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.04,
      side: THREE.DoubleSide,
    });
    this.mountainMats.push(mat);

    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.userData.isMountainRing = true;
    return mesh;
  }

  private static createMountainRing(
    segments: number,
    radius: number,
    baseHeight: number,
    peakAmplitude: number,
    theme: 'alpine_snow' | 'tropical_peaks' | 'andes_rock' = 'alpine_snow',
    isDistant = false
  ): THREE.Mesh {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];
    const colors: number[] = [];

    const ringSegments = Math.max(segments, 160);
    const numRows = 6;

    for (let i = 0; i <= ringSegments; i++) {
      const angle = (i / ringSegments) * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Smooth multi-octave rolling mountain profile with STRICTLY integer frequencies
      const noise1 = Math.sin(angle * 2 + 1.2) * 0.40;
      const noise2 = Math.cos(angle * 4 - 0.4) * 0.25;
      const noise3 = Math.sin(angle * 6 + 2.1) * 0.15;
      const noise4 = Math.cos(angle * 8 - 1.0) * 0.10;
      const noise5 = Math.sin(angle * 12 + 0.5) * 0.06;
      const heightFactor = Math.max(0.15, (noise1 + noise2 + noise3 + noise4 + noise5 + 1.0) / 2.0);

      const h = baseHeight + heightFactor * peakAmplitude;
      const rNoise = Math.sin(angle * 4 + 0.8) * 0.35 + Math.cos(angle * 8) * 0.18;
      const R = radius + rNoise;

      const rowOffsets = [
        { r: -3.0, yFrac: 0.0, u: 0.0 },
        { r: -1.6, yFrac: 0.25, u: 0.2 },
        { r: -0.6, yFrac: 0.65, u: 0.4 },
        { r: 0.0, yFrac: 1.0, u: 0.6 },
        { r: 1.2, yFrac: 0.50, u: 0.8 },
        { r: 2.6, yFrac: 0.0, u: 1.0 },
      ];

      for (let j = 0; j < numRows; j++) {
        const row = rowOffsets[j];
        const rPos = R + row.r;
        const yPos = 0.0001 + h * row.yFrac;

        positions.push(cosA * rPos, yPos, sinA * rPos);
        uvs.push(i / ringSegments, row.u);

        const col = new THREE.Color();
        if (theme === 'alpine_snow') {
          if (row.yFrac > 0.8 && yPos > 2.0) {
            // White snow cap
            col.setRGB(0.92, 0.95, 0.98);
          } else if (row.yFrac > 0.4) {
            // Granite rock
            col.setRGB(0.28, 0.33, 0.41);
          } else {
            // Pine alpine forest
            col.setRGB(0.09, 0.24, 0.17);
          }
        } else if (theme === 'tropical_peaks') {
          if (row.yFrac > 0.75) {
            // Sunlit emerald peak
            col.setRGB(0.13, 0.77, 0.37);
          } else if (row.yFrac > 0.3) {
            // Vibrant rainforest slope
            col.setRGB(0.08, 0.58, 0.26);
          } else {
            // Deep forest base
            col.setRGB(0.08, 0.35, 0.16);
          }
        } else {
          // Andes / Rock
          if (row.yFrac > 0.75) {
            // Bronze slate summits
            col.setRGB(0.66, 0.64, 0.62);
          } else if (row.yFrac > 0.35) {
            // Terracotta / Volcanic rock
            col.setRGB(0.47, 0.21, 0.06);
          } else {
            // Golden alpine tussock turf
            col.setRGB(0.38, 0.28, 0.11);
          }
        }

        if (isDistant) {
          // Atmospheric haze blend
          col.lerp(new THREE.Color(0x334155), 0.45);
        }

        colors.push(col.r, col.g, col.b);
      }
    }

    const indices: number[] = [];
    for (let i = 0; i < ringSegments; i++) {
      for (let j = 0; j < numRows - 1; j++) {
        const c0 = i * numRows + j;
        const c1 = (i + 1) * numRows + j;
        const c2 = (i + 1) * numRows + (j + 1);
        const c3 = i * numRows + (j + 1);
        indices.push(c0, c1, c3);
        indices.push(c1, c2, c3);
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    // Weld normals at 0 and 2*PI boundary
    const normAttr = geo.getAttribute('normal') as THREE.BufferAttribute;
    for (let j = 0; j < numRows; j++) {
      const idx0 = j;
      const idxEnd = ringSegments * numRows + j;
      const nx = (normAttr.getX(idx0) + normAttr.getX(idxEnd)) * 0.5;
      const ny = (normAttr.getY(idx0) + normAttr.getY(idxEnd)) * 0.5;
      const nz = (normAttr.getZ(idx0) + normAttr.getZ(idxEnd)) * 0.5;
      const len = Math.hypot(nx, ny, nz) || 1;
      normAttr.setXYZ(idx0, nx / len, ny / len, nz / len);
      normAttr.setXYZ(idxEnd, nx / len, ny / len, nz / len);
    }
    normAttr.needsUpdate = true;

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.04,
      side: THREE.DoubleSide,
    });
    this.mountainMats.push(mat);

    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.userData.isMountainRing = true;
    return mesh;
  }
}

// =====================================================================
// MAIN 3D OBSERVER ENVIRONMENT CONTROLLER
// =====================================================================

export class ObserverEnvironment3D {
  public group: THREE.Group;
  private currentBiome: ObserverBiomeType = 'field';
  private biomeGroups: Map<ObserverBiomeType, THREE.Group> = new Map();
  private buildingWindowsMats: THREE.MeshStandardMaterial[] = [];
  private mountainGroups: THREE.Group[] = [];
  private atmosphericMistGroup: THREE.Group | null = null;
  private mistShaderMaterials: THREE.ShaderMaterial[] = [];
  private cloudShadowUniforms = {
    uTime: { value: 0.0 },
    uDaylight: { value: 1.0 },
    uSunDir: { value: new THREE.Vector3(0.4, 0.7, 0.4) },
    uObserverXZ: { value: new THREE.Vector2(0, 18) },
    uCloudShadowsEnabled: { value: 1.0 },
  };
  private mistWispSprites: {
    sprite: THREE.Sprite;
    baseAngle: number;
    radius: number;
    baseY: number;
    speed: number;
    phase: number;
    baseOpacity: number;
  }[] = [];
  private mistTintColor = new THREE.Color();
  private mistColorBlue = new THREE.Color(0x68a8f8);
  private mistColorLight = new THREE.Color(0xc4e0ff);
  private mountainMatsInitialized = false;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'ObserverEnvironment3D';

    // Build all realistic biomes
    const fieldGroup = this.buildFieldBiome();
    const mountainGroup = this.buildMountainBiome();
    const tropicalGroup = this.buildTropicalBiome();
    const andesGroup = this.buildAndesBiome();
    const forestGroup = this.buildForestBiome();
    const beachGroup = this.buildBeachBiome();
    const cityGroup = this.buildCityBiome();

    this.biomeGroups.set('field', fieldGroup);
    this.biomeGroups.set('mountain', mountainGroup);
    this.biomeGroups.set('tropical', tropicalGroup);
    this.biomeGroups.set('andes', andesGroup);
    this.biomeGroups.set('forest', forestGroup);
    this.biomeGroups.set('beach', beachGroup);
    this.biomeGroups.set('city', cityGroup);

    this.group.add(fieldGroup);
    this.group.add(mountainGroup);
    this.group.add(tropicalGroup);
    this.group.add(andesGroup);
    this.group.add(forestGroup);
    this.group.add(beachGroup);
    this.group.add(cityGroup);

    // Enable castShadow and receiveShadow on ground/local objects (NOT distant mountain perimeter rings)
    // and inject real-time cloud shadows ONLY on ground surfaces that are directly sunlit when the Sun is high!
    const sharedCloudUniforms = this.cloudShadowUniforms;
    const patchedMaterials = new Set<THREE.Material>();

    this.group.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        const isMountain = !!child.userData.isMountainRing;
        if (!isMountain) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (mat && mat.isMeshStandardMaterial && !isMountain && !patchedMaterials.has(mat)) {
          patchedMaterials.add(mat);
          mat.onBeforeCompile = (shader) => {
            shader.uniforms.uCloudTime = sharedCloudUniforms.uTime;
            shader.uniforms.uCloudDaylight = sharedCloudUniforms.uDaylight;
            shader.uniforms.uCloudSunDir = sharedCloudUniforms.uSunDir;
            shader.uniforms.uCloudObsXZ = sharedCloudUniforms.uObserverXZ;
            shader.uniforms.uCloudShadowsEnabled = sharedCloudUniforms.uCloudShadowsEnabled;

            shader.vertexShader = shader.vertexShader
              .replace(
                '#include <common>',
                `#include <common>\nvarying vec3 vEnvWorldPos;\nvarying vec3 vEnvWorldNormal;`
              )
              .replace(
                '#include <worldpos_vertex>',
                `#include <worldpos_vertex>\nvEnvWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvEnvWorldNormal = normalize(mat3(modelMatrix) * objectNormal);`
              );

            shader.fragmentShader = shader.fragmentShader
              .replace(
                '#include <common>',
                `#include <common>
                uniform float uCloudTime;
                uniform float uCloudDaylight;
                uniform vec3 uCloudSunDir;
                uniform vec2 uCloudObsXZ;
                uniform float uCloudShadowsEnabled;
                varying vec3 vEnvWorldPos;
                varying vec3 vEnvWorldNormal;

                float envHash31(vec3 p) {
                  p = fract(p * 0.3183099 + 0.1);
                  p *= 17.0;
                  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
                }
                float envNoise3D(vec3 x) {
                  vec3 i = floor(x);
                  vec3 f = fract(x);
                  f = f * f * (3.0 - 2.0 * f);
                  return mix(
                    mix(mix(envHash31(i + vec3(0,0,0)), envHash31(i + vec3(1,0,0)), f.x),
                        mix(envHash31(i + vec3(0,1,0)), envHash31(i + vec3(1,1,0)), f.x), f.y),
                    mix(mix(envHash31(i + vec3(0,0,1)), envHash31(i + vec3(1,0,1)), f.x),
                        mix(envHash31(i + vec3(0,1,1)), envHash31(i + vec3(1,1,1)), f.x), f.y), f.z);
                }
                float envFbm3D(vec3 p) {
                  float v = 0.0;
                  float a = 0.52;
                  for (int i = 0; i < 4; i++) {
                    v += a * envNoise3D(p);
                    p = p * 2.12 + vec3(1.7, 9.2, 3.4);
                    a *= 0.48;
                  }
                  return v;
                }`
              )
              .replace(
                '#include <dithering_fragment>',
                `if (uCloudShadowsEnabled > 0.5 && uCloudDaylight > 0.15 && uCloudSunDir.y > 0.30) {
                  // Only cast cloud shadows when the Sun is high in the sky (altitude > ~17.5°, well above the mountains & horizon)
                  // AND only on surfaces directly facing the Sun (sunFacing > 0)!
                  float highSunFade = smoothstep(0.30, 0.52, uCloudSunDir.y);
                  float sunFacing = smoothstep(0.05, 0.35, dot(normalize(vEnvWorldNormal), normalize(uCloudSunDir)));
                  vec3 relPos = vEnvWorldPos - cameraPosition;
                  float distFade = 1.0 - smoothstep(10.0, 17.5, length(relPos.xz));
                  if (highSunFade * sunFacing * distFade > 0.01) {
                    float cloudDeckH = 5.5;
                    vec2 sunSkyCoord = uCloudSunDir.xz / (max(0.05, uCloudSunDir.y) + 0.14);
                    vec2 cloudInterceptXZ = (relPos.xz / cloudDeckH) + sunSkyCoord;

                    vec2 windDrift = vec2(uCloudTime * 0.0022, -uCloudTime * 0.0014);
                    vec3 p = vec3(cloudInterceptXZ * 0.85 + windDrift + uCloudObsXZ * 0.12, uCloudTime * 0.0010);
                    vec3 q = vec3(
                      envFbm3D(p * 1.4 + vec3(0.0, 0.0, uCloudTime * 0.0012)),
                      envFbm3D(p * 1.4 + vec3(5.2, 1.3, 2.8)),
                      envFbm3D(p * 1.4 + vec3(1.7, 8.4, 4.1))
                    );
                    float lowCumulus = envFbm3D(p * 2.1 + q * 1.25);
                    float midAlto = envFbm3D(p * 3.4 - q * 0.85 + vec3(4.1, 2.3, 1.0));
                    float dLow = smoothstep(0.47, 0.76, lowCumulus);
                    float dMid = smoothstep(0.52, 0.79, midAlto) * 0.65;
                    float cloudShadow = clamp(dLow + dMid, 0.0, 1.0);
                    float shadowStrength = cloudShadow * highSunFade * sunFacing * distFade * clamp(uCloudDaylight * 1.2, 0.0, 1.0) * 0.46;
                    gl_FragColor.rgb *= (1.0 - shadowStrength);
                  }
                }
                #include <dithering_fragment>`
              );
          };
          mat.needsUpdate = true;
        }
      }
    });

    // Build ultra-natural, nearly invisible white atmospheric mist / horizon air veil
    this.buildAtmosphericMistLayers();

    this.setBiome('field');
  }

  /**
   * Builds a delicate, almost imperceptible white atmospheric mist & horizon vapor veil
   * ("fumaça branca bem natural quase invisível") that gives depth between the observer,
   * the valley floor, and the distant mountain ridges.
   */
  private buildAtmosphericMistLayers() {
    const mistGroup = new THREE.Group();
    mistGroup.name = 'HumanAtmosphericMistVeil';

    // 1. Multi-layered concentric FBM vapor veil cylinders (at r = 8.5, 14.5, 21.0)
    // Softly blends the base of the mountains and horizon with a translucent white air haze
    const layerRadii = [
      { radius: 8.5, height: 2.2, baseAlpha: 0.042, speed: 0.018 },
      { radius: 14.8, height: 3.6, baseAlpha: 0.058, speed: -0.012 },
      { radius: 21.5, height: 5.2, baseAlpha: 0.068, speed: 0.009 },
    ];

    layerRadii.forEach((spec, idx) => {
      const cylGeo = new THREE.CylinderGeometry(spec.radius, spec.radius, spec.height, 64, 1, true);
      cylGeo.translate(0, spec.height * 0.44, 0);

      const mistMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uDaylight: { value: 1.0 },
          uBaseAlpha: { value: spec.baseAlpha },
          uSpeed: { value: spec.speed },
          uSeed: { value: idx * 3.17 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vLocalPos;
          void main() {
            vUv = uv;
            vLocalPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uDaylight;
          uniform float uBaseAlpha;
          uniform float uSpeed;
          uniform float uSeed;
          varying vec2 vUv;
          varying vec3 vLocalPos;

          // Smooth organic procedural vapor noise
          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
          }
          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
          }
          float fbm(vec2 p) {
            float v = 0.0;
            float amp = 0.5;
            for (int i = 0; i < 4; i++) {
              v += amp * noise(p);
              p = p * 2.03 + vec2(1.7, 9.2);
              amp *= 0.5;
            }
            return v;
          }

          void main() {
            // Seamless circular angle around the horizon
            float angle = atan(vLocalPos.z, vLocalPos.x);
            float u = angle * 1.5 + uTime * uSpeed + uSeed;
            float v = vUv.y * 2.4 - uTime * 0.006;

            float n1 = fbm(vec2(u * 2.0, v * 1.8));
            float n2 = fbm(vec2(u * 3.5 - uTime * 0.015, v * 2.8 + n1 * 0.65));
            float vapor = smoothstep(0.22, 0.82, n1 * 0.55 + n2 * 0.45);

            // Soft vertical fade: zero at ground contact, gentle peak in lower atmosphere, zero at top
            float vertEnv = smoothstep(0.0, 0.28, vUv.y) * (1.0 - smoothstep(0.32, 1.0, vUv.y));

            // Natural blue-tinted atmospheric haze/mist: soft azure-blue in daylight, deep sapphire-blue at night
            vec3 dayMistColor = vec3(0.76, 0.88, 1.0);
            vec3 nightMistColor = vec3(0.45, 0.68, 0.96);
            vec3 mistColor = mix(nightMistColor, dayMistColor, clamp(uDaylight * 1.15, 0.0, 1.0));

            // Slightly softer visibility at night so it never looks artificial
            float lightVis = mix(0.45, 1.0, clamp(uDaylight, 0.0, 1.0));
            float alpha = uBaseAlpha * vapor * vertEnv * lightVis;

            if (alpha < 0.002) discard;
            gl_FragColor = vec4(mistColor, alpha);
          }
        `,
      });

      const mesh = new THREE.Mesh(cylGeo, mistMat);
      mesh.renderOrder = 4;
      mistGroup.add(mesh);
      this.mistShaderMaterials.push(mistMat);
    });

    // 2. Soft Gossamer Wisp Sprites floating gently over the valley and foothills
    const wispCanvas = document.createElement('canvas');
    wispCanvas.width = 256;
    wispCanvas.height = 128;
    const wCtx = wispCanvas.getContext('2d')!;
    wCtx.clearRect(0, 0, 256, 128);
    for (let i = 0; i < 28; i++) {
      const cx = 50 + Math.random() * 156;
      const cy = 36 + Math.random() * 56;
      const rx = 28 + Math.random() * 48;
      const ry = 12 + Math.random() * 22;
      const grad = wCtx.createRadialGradient(cx, cy, 0, cx, cy, rx);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
      grad.addColorStop(0.5, 'rgba(248, 252, 255, 0.06)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
      wCtx.save();
      wCtx.translate(cx, cy);
      wCtx.scale(1.0, ry / rx);
      wCtx.fillStyle = grad;
      wCtx.beginPath();
      wCtx.arc(0, 0, rx, 0, Math.PI * 2);
      wCtx.fill();
      wCtx.restore();
    }
    const wispTex = new THREE.CanvasTexture(wispCanvas);

    const wispCount = 24;
    for (let i = 0; i < wispCount; i++) {
      const baseAngle = (i / wispCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
      const radius = 5.5 + Math.random() * 15.5;
      const baseY = 0.25 + Math.random() * 1.45;
      const baseOpacity = 0.045 + Math.random() * 0.045; // Nearly invisible (4.5% to 9% max opacity!)

      const sMat = new THREE.SpriteMaterial({
        map: wispTex,
        color: 0xffffff,
        transparent: true,
        opacity: baseOpacity,
        depthWrite: false,
        depthTest: true,
      });
      const sprite = new THREE.Sprite(sMat);
      const scaleW = 4.5 + Math.random() * 5.0;
      const scaleH = 1.1 + Math.random() * 1.4;
      sprite.scale.set(scaleW, scaleH, 1);
      sprite.position.set(Math.cos(baseAngle) * radius, baseY, Math.sin(baseAngle) * radius);
      sprite.renderOrder = 5;
      mistGroup.add(sprite);

      this.mistWispSprites.push({
        sprite,
        baseAngle,
        radius,
        baseY,
        speed: (0.008 + Math.random() * 0.012) * (i % 2 === 0 ? 1 : -1),
        phase: Math.random() * Math.PI * 2,
        baseOpacity,
      });
    }

    this.atmosphericMistGroup = mistGroup;
    this.group.add(mistGroup);
  }

  public setBiome(biome: ObserverBiomeType) {
    if (this.currentBiome === biome) return;
    this.currentBiome = biome;
    this.biomeGroups.forEach((grp, key) => {
      grp.visible = key === biome;
    });
  }

  public setVisible(visible: boolean) {
    this.group.visible = visible;
  }

  public setPosition(x: number, y: number, z: number) {
    this.group.position.set(x, y, z);
    this.cloudShadowUniforms.uObserverXZ.value.set(x, z);
  }

  public setRotation(rotY: number) {
    this.group.rotation.y = rotY;
  }

  public updateTime(
    daylightFactor: number,
    timeSec?: number,
    showAtmosphere = true,
    sunDirection?: THREE.Vector3,
    showCloudShadows = true
  ) {
    const t = timeSec !== undefined ? timeSec : performance.now() * 0.001;

    this.cloudShadowUniforms.uTime.value = t;
    this.cloudShadowUniforms.uDaylight.value = daylightFactor;
    this.cloudShadowUniforms.uCloudShadowsEnabled.value = showCloudShadows ? 1.0 : 0.0;
    if (sunDirection) {
      this.cloudShadowUniforms.uSunDir.value.copy(sunDirection).normalize();
    }

    // Glow city building windows at dusk & night
    const windowEmissive = Math.max(0, 1.0 - daylightFactor);
    this.buildingWindowsMats.forEach(mat => {
      mat.emissiveIntensity = 0.85 * windowEmissive;
    });

    // Mountains use pure physically based lighting and shadows (initialize once)
    if (!this.mountainMatsInitialized) {
      this.mountainMatsInitialized = true;
      MountainRangeBuilder.mountainMats.forEach(mat => {
        mat.emissive.setRGB(0, 0, 0);
        mat.emissiveIntensity = 0.0;
      });
    }

    // Animate the subtle, nearly invisible white atmospheric mist & valley haze
    if (this.atmosphericMistGroup) {
      this.atmosphericMistGroup.visible = showAtmosphere;
      if (showAtmosphere) {
        this.mistShaderMaterials.forEach(mat => {
          mat.uniforms.uTime.value = t;
          mat.uniforms.uDaylight.value = daylightFactor;
        });

        const lightVis = 0.42 + 0.58 * Math.min(1.0, Math.max(0.0, daylightFactor));
        this.mistTintColor.copy(this.mistColorBlue).lerp(this.mistColorLight, Math.min(1.0, daylightFactor * 1.2));

        this.mistWispSprites.forEach(w => {
          const curAngle = w.baseAngle + t * w.speed;
          const yBob = Math.sin(t * 0.35 + w.phase) * 0.08;
          const breath = 0.78 + 0.22 * Math.sin(t * 0.45 + w.phase);
          w.sprite.position.set(
            Math.cos(curAngle) * w.radius,
            w.baseY + yBob,
            Math.sin(curAngle) * w.radius
          );
          const sMat = w.sprite.material as THREE.SpriteMaterial;
          sMat.color.copy(this.mistTintColor);
          sMat.opacity = w.baseOpacity * breath * lightVis;
        });
      }
    }
  }

  /**
   * Helper to create 3D Grass Tufts & Wildflower Clusters scattered near observer (Grain of Sand scale)
   */
  private scatterGrassTufts(parent: THREE.Group, count = 70, minRadius = 0.008, maxRadius = 0.08) {
    const tuftTex = createGrassTuftTexture();
    const tuftMat = new THREE.MeshStandardMaterial({
      map: tuftTex,
      transparent: true,
      alphaTest: 0.35,
      side: THREE.DoubleSide,
      roughness: 0.8,
    });

    const quadGeo = new THREE.PlaneGeometry(0.0008, 0.0006);
    quadGeo.translate(0, 0.0003, 0);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = minRadius + Math.random() * (maxRadius - minRadius);
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const scale = 0.8 + Math.random() * 0.5;

      const tuft = new THREE.Group();
      tuft.position.set(x, 0.0002, z);
      tuft.scale.set(scale, scale, scale);

      // Cross-quad planes for full 3D grass volume
      const p1 = new THREE.Mesh(quadGeo, tuftMat);
      p1.rotation.y = Math.random() * Math.PI;
      const p2 = new THREE.Mesh(quadGeo, tuftMat);
      p2.rotation.y = p1.rotation.y + Math.PI / 2;

      tuft.add(p1);
      tuft.add(p2);
      parent.add(tuft);
    }
  }

  /**
   * Helper to create scattered mossy river stones and boulders (Grain of Sand scale)
   */
  private scatterRocks(parent: THREE.Group, count = 14, minRadius = 0.012, maxRadius = 0.085) {
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.95,
      metalness: 0.1,
    });

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = minRadius + Math.random() * (maxRadius - minRadius);
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const size = 0.0002 + Math.random() * 0.00035;

      const geo = new THREE.DodecahedronGeometry(size, 1);
      const rock = new THREE.Mesh(geo, rockMat);
      rock.position.set(x, size * 0.45, z);
      rock.scale.set(1 + Math.random() * 0.5, 0.6 + Math.random() * 0.4, 1 + Math.random() * 0.5);
      rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      parent.add(rock);
    }
  }

  /**
   * Helper to create winding river stream through the valley (Grain of Sand scale)
   */
  private createStream(parent: THREE.Group) {
    const streamGeo = new THREE.PlaneGeometry(0.24, 0.035, 20, 2);
    streamGeo.rotateX(-Math.PI / 2);

    const streamMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.75,
    });

    const streamMesh = new THREE.Mesh(streamGeo, streamMat);
    streamMesh.position.set(0, 0.0003, 0.035);
    parent.add(streamMesh);
  }

  /**
   * Helper to create scenic Lagoon / Lake on the West side
   */
  private createLagoon(group: THREE.Group) {
    const lagoonGroup = new THREE.Group();
    // Water surface on West side open plain
    const waterGeo = new THREE.CircleGeometry(0.045, 32);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.12,
      metalness: 0.85,
      transparent: true,
      opacity: 0.9,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(-0.065, 0.0002, 0.0);
    lagoonGroup.add(waterMesh);

    // Reeds / Cattails around lagoon bank
    const reedMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const rx = -0.065 + Math.cos(angle) * 0.048;
      const rz = Math.sin(angle) * 0.048;
      const reedGeo = new THREE.CylinderGeometry(0.0004, 0.0007, 0.008, 5);
      const reed = new THREE.Mesh(reedGeo, reedMat);
      reed.position.set(rx, 0.004, rz);
      lagoonGroup.add(reed);
    }

    group.add(lagoonGroup);
  }

  // -------------------------------------------------------------
  // BIOME 1: CAMPO COM PAISAGEM DIRECIONAL SOLICITADA
  // (Leste: Montanhas, Oeste: Plano com Lagoa, Sul: Poucas Colinas, Norte: Picos Altos)
  // -------------------------------------------------------------
  private buildFieldBiome(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'FieldBiome';

    // 1. Lush Green Grass Base Disc
    const grassTex = createGrassTileTexture('lush');
    grassTex.repeat.set(32, 32);
    const groundGeo = new THREE.CircleGeometry(26.0, 48);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.88,
      metalness: 0.04,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = 0.0001;
    groundMesh.receiveShadow = true;
    groundMesh.visible = true;
    group.add(groundMesh);

    // 2. Directional Horizon Panorama (Continuous, multi-row, seamless mountains):
    // - North: Majestic alpine peaks & snow summits
    // - East: Lush rolling emerald mountains
    // - South: Soft rolling green hills
    // - South-West: Gracefully sloping down into rolling foothills
    // - West: Open flat horizon & lagoon (zero elevation, completely unobstructed)
    // - North-West: Foothills smoothly rising back to the northern alpine range
    const fieldMountains = MountainRangeBuilder.buildDirectionalHorizonPanorama();
    group.add(fieldMountains);
    this.mountainGroups.push(fieldMountains as any);

    // 3. Scenic Lagoon on the West side
    this.createLagoon(group);

    // 4. 3D Grass Tufts & Wildflowers
    this.scatterGrassTufts(group, 70, 0.008, 0.08);

    // 5. Scattered Rocks & Boulders
    this.scatterRocks(group, 14, 0.012, 0.08);

    // 6. Winding mountain stream
    this.createStream(group);

    // 7. Realistic 3D Trees (Pines and Deciduous Oaks around clearing perimeter)
    const treePositions = [
      { x: -0.038, z: -0.042, type: 'pine', scale: 1.0 },
      { x: -0.052, z: -0.030, type: 'oak', scale: 1.1 },
      { x: -0.035, z: -0.060, type: 'pine', scale: 1.2 },
      { x: 0.044, z: -0.046, type: 'oak', scale: 1.0 },
      { x: 0.056, z: -0.032, type: 'pine', scale: 1.1 },
      { x: 0.038, z: -0.068, type: 'pine', scale: 1.3 },
      { x: -0.058, z: 0.052, type: 'pine', scale: 1.1 },
      { x: -0.046, z: 0.068, type: 'oak', scale: 0.9 },
      { x: 0.050, z: 0.058, type: 'oak', scale: 1.1 },
      { x: 0.068, z: 0.042, type: 'pine', scale: 1.2 },
      { x: -0.075, z: 0.008, type: 'pine', scale: 1.3 },
      { x: 0.078, z: -0.010, type: 'oak', scale: 1.2 },
    ];

    treePositions.forEach(tp => {
      const tree =
        tp.type === 'pine'
          ? TreeFactory.createPineTree(tp.scale)
          : TreeFactory.createOakTree(tp.scale, 'lush');
      tree.position.set(tp.x, 0, tp.z);
      group.add(tree);
    });

    // 8. Wild Flowering Bushes
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.014 + Math.random() * 0.045;
      const bush = TreeFactory.createBush(0.8 + Math.random() * 0.5, 0x16a34a);
      bush.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      group.add(bush);
    }

    return group;
  }

  // -------------------------------------------------------------
  // BIOME 2: CORDILLERA & PICOS ALPINOS (EVEREST / ALPS / HIGH PEAKS)
  // -------------------------------------------------------------
  private buildMountainBiome(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'MountainBiome';

    const grassTex = createGrassTileTexture('lush');
    grassTex.repeat.set(32, 32);
    const groundGeo = new THREE.CircleGeometry(26.0, 48);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.9 });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = 0.0001;
    groundMesh.receiveShadow = true;
    groundMesh.visible = true;
    group.add(groundMesh);

    const mountains = MountainRangeBuilder.buildMountainPanorama('alpine_snow');
    group.add(mountains);

    this.scatterGrassTufts(group, 70, 0.008, 0.08);
    this.scatterRocks(group, 20, 0.012, 0.08);
    this.createStream(group);

    // Mountain Pines around clearing
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const dist = 0.036 + Math.random() * 0.050;
      const pine = TreeFactory.createPineTree(0.85 + Math.random() * 0.5);
      pine.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      group.add(pine);
    }

    return group;
  }

  // -------------------------------------------------------------
  // BIOME 3: PICO & MATA TROPICAL (PICO DA NEBLINA / MATA ATLÂNTICA)
  // -------------------------------------------------------------
  private buildTropicalBiome(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'TropicalBiome';

    const grassTex = createGrassTileTexture('tropical');
    grassTex.repeat.set(32, 32);
    const groundGeo = new THREE.CircleGeometry(26.0, 48);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.85 });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = 0.0001;
    groundMesh.receiveShadow = true;
    groundMesh.visible = true;
    group.add(groundMesh);

    const mountains = MountainRangeBuilder.buildMountainPanorama('tropical_peaks');
    group.add(mountains);

    this.scatterGrassTufts(group, 70, 0.008, 0.08);
    this.scatterRocks(group, 14, 0.012, 0.08);
    this.createStream(group);

    // Tropical Rainforest Trees & Palms
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const dist = 0.035 + Math.random() * 0.052;
      const isPalm = i % 3 === 0;
      const tree = isPalm
        ? TreeFactory.createPalmTree(0.9 + Math.random() * 0.35)
        : TreeFactory.createTropicalTree(0.85 + Math.random() * 0.45);
      tree.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      group.add(tree);
    }

    return group;
  }

  // -------------------------------------------------------------
  // BIOME 4: ANDES & PUNA DOURADA (ACONCÁGUA / TUNDRA ANDINA)
  // -------------------------------------------------------------
  private buildAndesBiome(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'AndesBiome';

    const grassTex = createGrassTileTexture('golden_alpine');
    grassTex.repeat.set(32, 32);
    const groundGeo = new THREE.CircleGeometry(26.0, 48);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.9 });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = 0.0001;
    groundMesh.receiveShadow = true;
    groundMesh.visible = true;
    group.add(groundMesh);

    const mountains = MountainRangeBuilder.buildMountainPanorama('andes_rock');
    group.add(mountains);

    this.scatterGrassTufts(group, 70, 0.008, 0.08);
    this.scatterRocks(group, 22, 0.012, 0.08);

    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const dist = 0.038 + Math.random() * 0.048;
      const oak = TreeFactory.createOakTree(0.8 + Math.random() * 0.4, 'golden');
      oak.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      group.add(oak);
    }

    return group;
  }

  // -------------------------------------------------------------
  // BIOME 5: FLORESTA & BOSQUE (FOREST CLEARING)
  // -------------------------------------------------------------
  private buildForestBiome(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'ForestBiome';

    const grassTex = createGrassTileTexture('forest_moss');
    grassTex.repeat.set(32, 32);
    const groundGeo = new THREE.CircleGeometry(26.0, 48);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({ map: grassTex, color: 0x3b6e36, roughness: 0.9 });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = 0.0001;
    groundMesh.receiveShadow = true;
    groundMesh.visible = true;
    group.add(groundMesh);

    const mountains = MountainRangeBuilder.buildMountainPanorama('alpine_snow');
    group.add(mountains);

    this.scatterGrassTufts(group, 70, 0.008, 0.08);
    this.scatterRocks(group, 16, 0.012, 0.08);

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
      const dist = 0.036 + Math.random() * 0.052;
      const treeScale = 0.85 + Math.random() * 0.45;

      const tree =
        i % 2 === 0
          ? TreeFactory.createPineTree(treeScale)
          : TreeFactory.createOakTree(treeScale, 'lush');
      tree.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      group.add(tree);
    }

    return group;
  }

  // -------------------------------------------------------------
  // BIOME 6: PRAIA / LITORAL (OCEAN COAST & BEACH)
  // -------------------------------------------------------------
  private buildBeachBiome(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'BeachBiome';

    const sandTex = createSandTexture();
    sandTex.repeat.set(32, 32);
    const sandGeo = new THREE.CircleGeometry(26.0, 48);
    sandGeo.rotateX(-Math.PI / 2);
    const sandMat = new THREE.MeshStandardMaterial({ map: sandTex, roughness: 0.9 });
    const sandMesh = new THREE.Mesh(sandGeo, sandMat);
    sandMesh.position.y = 0.0001;
    sandMesh.receiveShadow = true;
    sandMesh.visible = true;
    group.add(sandMesh);

    const mountains = MountainRangeBuilder.buildMountainPanorama('tropical_peaks');
    group.add(mountains);

    // Wooden Boardwalk Pier
    const woodGeo = new THREE.BoxGeometry(0.042, 0.0012, 0.18);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x785a3a, roughness: 0.7 });
    const pier = new THREE.Mesh(woodGeo, woodMat);
    pier.position.set(0, 0.0006, 0.05);
    group.add(pier);

    // Palm trees
    for (let p = 0; p < 8; p++) {
      const angle = (p / 8) * Math.PI * 1.2 - 0.6;
      const dist = 0.02 + Math.random() * 0.035;
      const palm = TreeFactory.createPalmTree(0.85 + Math.random() * 0.35);
      palm.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      group.add(palm);
    }

    return group;
  }

  // -------------------------------------------------------------
  // BIOME 7: CIDADE / TERRAÇO URBANO (CITY SKYLINE & ROOFTOP)
  // -------------------------------------------------------------
  private buildCityBiome(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'CityBiome';

    const mountains = MountainRangeBuilder.buildMountainPanorama('alpine_snow');
    group.add(mountains);

    // Rooftop Platform
    const roofTex = createCityRooftopTileTexture();
    const roofGeo = new THREE.CircleGeometry(0.085, 32);
    roofGeo.rotateX(-Math.PI / 2);
    const roofMat = new THREE.MeshStandardMaterial({
      map: roofTex,
      roughness: 0.6,
      metalness: 0.25,
    });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.y = 0.0003;
    group.add(roofMesh);

    // Railing
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35, roughness: 0.1 });

    const railGeo = new THREE.TorusGeometry(0.082, 0.0004, 8, 48);
    railGeo.rotateX(Math.PI / 2);
    const topRail = new THREE.Mesh(railGeo, railMat);
    topRail.position.y = 0.0028;
    group.add(topRail);

    const glassPanelsGeo = new THREE.CylinderGeometry(0.081, 0.081, 0.0022, 32, 1, true);
    const glassPanels = new THREE.Mesh(glassPanelsGeo, glassMat);
    glassPanels.position.y = 0.0014;
    group.add(glassPanels);

    // Skyline Buildings on Mid-Distance Horizon
    const bldgMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const windowMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.8, roughness: 0.3 });
    this.buildingWindowsMats.push(windowMat);

    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + (Math.random() - 0.5) * 0.1;
      const dist = 0.055 + Math.random() * 0.04;
      const width = 0.025 + Math.random() * 0.04;
      const height = 0.035 + Math.random() * 0.075;
      const depth = 0.025 + Math.random() * 0.04;

      const bldgGeo = new THREE.BoxGeometry(width, height, depth);
      const bldg = new THREE.Mesh(bldgGeo, bldgMat);
      bldg.position.set(Math.cos(angle) * dist, height / 2, Math.sin(angle) * dist);
      bldg.lookAt(0, bldg.position.y, 0);
      group.add(bldg);

      const winGeo = new THREE.PlaneGeometry(width * 0.75, height * 0.65);
      const winMesh = new THREE.Mesh(winGeo, windowMat);
      winMesh.position.set(0, 0, depth / 2 + 0.0005);
      bldg.add(winMesh);
    }

    return group;
  }
}
