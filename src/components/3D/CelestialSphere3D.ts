import * as THREE from 'three';
import { generateStarSparkleTexture } from '../../utils/textureGenerator';
import { CONSTELLATIONS_CATALOG, ConstellationData } from '../../data/constellations';

export type { ConstellationData };

/**
 * Planar Firmament & High-Fidelity Celestial Vault:
 * 1. Global Mode:
 *    - Swirling galaxy disc positioned directly above the Earth disc (0, 0, 0)
 *    - Radius 1 to 42, height 6.8 to 24.5, with central Polaris (0, 24.5, 0)
 *    - Perfect for overhead/space view of the flat Earth simulation.
 * 2. Human Observer Mode:
 *    - True 360° spherical celestial firmament (Radius 120.0) centered at observer's eyes.
 *    - ZERO empty patches: Uniform solid-angle distribution across all 360° of azimuth & -90° to +90° declination.
 *    - Distance: Stars at radius 120.0 are far in the background behind all astros (Planets at 45.0, Sun/Moon at 40.0).
 *      Astros NEVER collide or clip with stars!
 *    - Constant angular rotation: All stars share the exact same sphere radius (120.0), rotating in unison
 *      at 15.04°/hour, perfectly synchronized with Sun, Moon & planetary astros.
 *    - Star size & luminescence: 50% smaller than planetary astros, rendered as crisp white stellar planets
 *      with luminous emissive cores and diamond sparkle diffraction.
 *    - Daytime atmospheric occlusion: Hidden during daylight; fully visible at night & during solar eclipse.
 */
const STELLAR_COLORS = [
  new THREE.Color('#ffffff'), // Diamond White (A0V - Vega/Sirius)
  new THREE.Color('#ffffff'), // Diamond White
  new THREE.Color('#f0f9ff'), // Pure Star White
  new THREE.Color('#e0f2fe'), // Radiant Azure-White (B8V - Rigel)
  new THREE.Color('#fef08a'), // Warm Solar Gold (G2V - Alpha Centauri)
  new THREE.Color('#fed7aa'), // Luminous Amber (K5V - Aldebaran)
  new THREE.Color('#bae6fd'), // Ice Cyan-White (F5V - Procyon)
];

export class CelestialSphere3D {
  public group: THREE.Group;

  // Global Mode elements (swirling planar galaxy disc over Earth disc)
  private globalGroup: THREE.Group;
  private globalVaultGroup: THREE.Group;
  private globalPolarisGroup: THREE.Group | null = null;
  private globalInstancedStars: THREE.InstancedMesh | null = null;
  private globalSparklePoints: THREE.Points | null = null;
  private globalConstellationsGroup: THREE.Group | null = null;
  private globalConstellationLinesGroup: THREE.Group | null = null;
  private globalConstellationLabelsGroup: THREE.Group | null = null;
  private globalConstellationLineMat: THREE.LineBasicMaterial | null = null;
  private globalNebulaeGroup: THREE.Group | null = null;

  // Human Observer Mode elements (full 360° spherical celestial sphere at radius 120.0)
  private humanGroup: THREE.Group;
  private humanVaultGroup: THREE.Group;
  private humanPolarisGroup: THREE.Group | null = null;
  private humanInstancedStars: THREE.InstancedMesh | null = null;
  private humanSparklePoints: THREE.Points | null = null;
  private humanConstellationsGroup: THREE.Group | null = null;
  private humanConstellationLinesGroup: THREE.Group | null = null;
  private humanConstellationLabelsGroup: THREE.Group | null = null;
  private humanConstellationLineMat: THREE.LineBasicMaterial | null = null;
  private humanNebulaeGroup: THREE.Group | null = null;
  private sphericalPolarisGroup: THREE.Group | null = null;
  private sphericalInstancedStars: THREE.InstancedMesh | null = null;
  private sphericalConstellationsGroup: THREE.Group | null = null;
  private sphericalConstellationLinesGroup: THREE.Group | null = null;
  private sphericalConstellationLabelsGroup: THREE.Group | null = null;
  private sphericalConstellationLineMat: THREE.LineBasicMaterial | null = null;
  private constellationItemMap: Map<string, {
    globalLines?: THREE.LineSegments;
    humanLines?: THREE.LineSegments;
    sphericalLines?: THREE.LineSegments;
    globalStars?: THREE.Group;
    humanStars?: THREE.Group;
    sphericalStars?: THREE.Group;
    globalLabel?: THREE.Sprite;
    humanLabel?: THREE.Sprite;
    sphericalLabel?: THREE.Sprite;
  }> = new Map();

  // Night Atmosphere Scattering Dome (Rayleigh/Mie moonlight scattering in deep navy blue)
  private humanAtmosphereGroup: THREE.Group;
  private humanAtmosphereDomeMesh: THREE.Mesh | null = null;
  private humanAtmosphereMat: THREE.ShaderMaterial | null = null;

  private static readonly HUMAN_SPHERE_RADIUS = 120.0;

  // Separate Full-Sphere (-90° to +90°) Celestial Vault strictly for Spherical Globe Mode (Teoria Terra Redonda)
  // so Planar Mode (Teoria Planar) remains 100% untouched with its original hemisphere vault above the flat plane!
  private sphericalHumanGroup: THREE.Group;
  private sphericalHumanVaultGroup: THREE.Group;
  private sphericalHumanSparklePoints: THREE.Points | null = null;
  private lastSphericalConstellationKey = '';

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'CelestialSphere3D_Root';

    // 1. Build Global Mode System
    this.globalGroup = new THREE.Group();
    this.globalGroup.name = 'Global_Firmament_Group';
    this.globalVaultGroup = new THREE.Group();
    this.globalGroup.add(this.globalVaultGroup);
    this.group.add(this.globalGroup);

    this.buildGlobalPolaris();
    this.buildGlobalGalaxyDisc();
    this.buildGlobalConstellations();
    this.buildGlobalNebulae();

    // 2. Build Planar Human Observer Mode System (Original Hemisphere Vault above Planar Ground)
    this.humanGroup = new THREE.Group();
    this.humanGroup.name = 'Human_Celestial_Sphere_Group';
    this.humanVaultGroup = new THREE.Group();
    this.humanGroup.add(this.humanVaultGroup);
    this.group.add(this.humanGroup);

    // 2B. Build Spherical Globe Human Observer Mode System (Full -90° to +90° Sphere for Teoria Terra Redonda)
    this.sphericalHumanGroup = new THREE.Group();
    this.sphericalHumanGroup.name = 'Spherical_Globe_Human_Celestial_Group';
    this.sphericalHumanGroup.visible = false;
    this.sphericalHumanVaultGroup = new THREE.Group();
    this.sphericalHumanGroup.add(this.sphericalHumanVaultGroup);
    this.group.add(this.sphericalHumanGroup);

    // 3. Build Night Atmosphere Scattering Dome
    this.humanAtmosphereGroup = new THREE.Group();
    this.humanAtmosphereGroup.name = 'Human_Atmosphere_NightSky_Group';
    this.group.add(this.humanAtmosphereGroup);

    this.buildHumanPolaris();
    this.buildHumanSphericalVault();
    this.buildHumanConstellations();
    this.buildHumanNebulae();
    this.buildSphericalGlobeHumanVault();
    this.buildHumanAtmosphericSkyDome();
  }

  // =========================================================================
  // GLOBAL MODE IMPLEMENTATION (Overhead planar galaxy disc above Earth disc)
  // =========================================================================

  public static raDecToPlanarVector3(raHours: number, decDeg: number): THREE.Vector3 {
    const raRad = (raHours / 24) * 2 * Math.PI;
    const decClamped = Math.max(-89.9, Math.min(89.9, decDeg));
    const normDec = (decClamped + 90.0) / 180.0;

    const radius = 39.5 * Math.pow(1.0 - normDec, 0.92);
    const y = 6.8 + 17.7 * Math.pow(normDec, 0.78);

    const x = radius * Math.cos(raRad);
    const z = radius * Math.sin(raRad);

    return new THREE.Vector3(x, y, z);
  }

  private buildGlobalPolaris() {
    this.globalPolarisGroup = new THREE.Group();
    this.globalPolarisGroup.position.set(0, 24.5, 0);

    // Estrela Polaris: Menor, elegante e com luz própria radiante
    const starGeo = new THREE.SphereGeometry(0.08, 20, 20);
    const starMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xffffff),
      toneMapped: false,
    });
    const starMesh = new THREE.Mesh(starGeo, starMat);
    this.globalPolarisGroup.add(starMesh);

    const light = new THREE.PointLight(0xffffff, 2.8, 45, 1.5);
    this.globalPolarisGroup.add(light);

    const sparkleTex = generateStarSparkleTexture('#ffffff');
    const sparkleMat = new THREE.SpriteMaterial({
      map: sparkleTex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      toneMapped: false,
    });
    const sparkleSprite = new THREE.Sprite(sparkleMat);
    sparkleSprite.scale.set(1.0, 1.0, 1);
    this.globalPolarisGroup.add(sparkleSprite);

    this.globalGroup.add(this.globalPolarisGroup);
  }

  private buildGlobalGalaxyDisc() {
    // Reduzido para 1.200 estrelas (céu limpo, nobre e sem aglomerações)
    const starCount = 1200;
    // Tamanho reduzido: esferas diminutas e pontuais (luz própria de alta emissão)
    const baseSphereGeo = new THREE.SphereGeometry(0.022, 8, 8);
    const planetWhiteMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xffffff),
      toneMapped: false,
    });

    this.globalInstancedStars = new THREE.InstancedMesh(baseSphereGeo, planetWhiteMat, starCount);
    const sparklePositions = new Float32Array(starCount * 3);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < starCount; i++) {
      let r: number;
      let theta: number;

      const isSpiralStream = Math.random() < 0.40;
      if (isSpiralStream) {
        r = 1.0 + Math.pow(Math.random(), 0.75) * 39.5;
        const mainStreamAngle = (r / 40.0) * 3.5;
        const scatter = (Math.random() + Math.random() - 1.0) * 0.95;
        theta = mainStreamAngle + scatter + (Math.random() < 0.5 ? 0 : Math.PI);
      } else {
        r = Math.sqrt(Math.random()) * 40.5;
        theta = Math.random() * 2 * Math.PI;
      }

      const jitterX = (Math.random() - 0.5) * 0.6;
      const jitterZ = (Math.random() - 0.5) * 0.6;
      const x = r * Math.cos(theta) + jitterX;
      const z = r * Math.sin(theta) + jitterZ;

      const currentR = Math.hypot(x, z);
      const normDec = 1.0 - Math.min(1.0, currentR / 41.5);
      const domeY = 6.8 + 17.7 * Math.pow(normDec, 0.78);
      const y = domeY + (Math.random() - 0.5) * (0.3 + (currentR / 40.0) * 1.2);

      const isBright = Math.random() < 0.08;
      const scaleMult = isBright ? 1.25 : 0.8;

      dummy.position.set(x, y, z);
      dummy.scale.set(scaleMult, scaleMult, scaleMult);
      dummy.updateMatrix();

      this.globalInstancedStars.setMatrixAt(i, dummy.matrix);
      // Luz própria com tonalidades estelares autênticas
      this.globalInstancedStars.setColorAt(i, STELLAR_COLORS[i % STELLAR_COLORS.length]);

      sparklePositions[i * 3] = x;
      sparklePositions[i * 3 + 1] = y;
      sparklePositions[i * 3 + 2] = z;
    }

    this.globalInstancedStars.instanceMatrix.needsUpdate = true;
    if (this.globalInstancedStars.instanceColor) {
      this.globalInstancedStars.instanceColor.needsUpdate = true;
    }
    this.globalVaultGroup.add(this.globalInstancedStars);

    const sparkleGeo = new THREE.BufferGeometry();
    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));

    const sparkleTex = generateStarSparkleTexture('#ffffff');
    const sparkleMat = new THREE.PointsMaterial({
      size: 0.26, // Pontos luminosos menores e mais finos
      map: sparkleTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      opacity: 0.90,
    });

    this.globalSparklePoints = new THREE.Points(sparkleGeo, sparkleMat);
    this.globalVaultGroup.add(this.globalSparklePoints);
  }

  private createConstellationLabelSprite(name: string, latinName: string, scale = 3.8): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 76;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(2, 6, 23, 0.78)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(6, 6, 308, 64, 14);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#e0f2fe';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`✦ ${name}`, 160, 29);

    ctx.font = 'italic 16px serif';
    ctx.fillStyle = '#7dd3fc';
    ctx.fillText(latinName, 160, 52);

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(scale, scale * 0.24, 1);
    return sprite;
  }

  private createNebulaCloudTexture(innerHex: string, midHex: string, outerHex: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Multi-lobe organic cosmic dust cloud
    const lobes = [
      { cx: 128, cy: 128, rx: 112, ry: 88, color: innerHex, alpha: 0.75 },
      { cx: 102, cy: 114, rx: 84, ry: 72, color: midHex, alpha: 0.55 },
      { cx: 152, cy: 138, rx: 92, ry: 68, color: outerHex, alpha: 0.50 },
      { cx: 124, cy: 146, rx: 70, ry: 64, color: innerHex, alpha: 0.45 },
    ];

    ctx.globalCompositeOperation = 'lighter';
    lobes.forEach((l) => {
      const grad = ctx.createRadialGradient(l.cx, l.cy, 2, l.cx, l.cy, l.rx);
      grad.addColorStop(0, l.color);
      grad.addColorStop(0.38, midHex);
      grad.addColorStop(0.72, outerHex);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(l.cx, l.cy, l.rx, 0, Math.PI * 2);
      ctx.fill();
    });

    // Embedded newborn star pinpoints inside the nebula
    ctx.fillStyle = '#ffffff';
    const stars = [
      [128, 128, 2.6],
      [114, 118, 1.8],
      [142, 134, 2.0],
      [122, 142, 1.5],
      [136, 112, 1.6],
    ];
    stars.forEach(([sx, sy, sr]) => {
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }

  private getNebulaeCatalog() {
    return [
      {
        name: 'Nebulosa de Órion (M42)',
        ra: 5.59,
        dec: -5.39,
        inner: 'rgba(244, 114, 182, 0.90)',
        mid: 'rgba(168, 85, 247, 0.55)',
        outer: 'rgba(56, 189, 248, 0.18)',
        sizeGlobal: 7.5,
        sizeHuman: 18.0,
      },
      {
        name: 'Nebulosa da Carina (NGC 3372)',
        ra: 10.75,
        dec: -59.86,
        inner: 'rgba(251, 146, 60, 0.90)',
        mid: 'rgba(225, 29, 72, 0.55)',
        outer: 'rgba(147, 51, 234, 0.18)',
        sizeGlobal: 8.5,
        sizeHuman: 20.0,
      },
      {
        name: 'Nebulosa da Lagoa (M8)',
        ra: 18.06,
        dec: -24.38,
        inner: 'rgba(236, 72, 153, 0.88)',
        mid: 'rgba(192, 132, 252, 0.50)',
        outer: 'rgba(59, 130, 246, 0.16)',
        sizeGlobal: 7.0,
        sizeHuman: 16.5,
      },
      {
        name: 'Nebulosa Águia • Pilares da Criação (M16)',
        ra: 18.31,
        dec: -13.79,
        inner: 'rgba(52, 211, 153, 0.85)',
        mid: 'rgba(14, 165, 233, 0.52)',
        outer: 'rgba(99, 102, 241, 0.16)',
        sizeGlobal: 6.8,
        sizeHuman: 16.0,
      },
      {
        name: 'Nebulosa do Véu (Cygnus)',
        ra: 20.76,
        dec: 30.71,
        inner: 'rgba(56, 189, 248, 0.88)',
        mid: 'rgba(236, 72, 153, 0.50)',
        outer: 'rgba(124, 58, 237, 0.16)',
        sizeGlobal: 7.2,
        sizeHuman: 17.0,
      },
      {
        name: 'Galáxia de Andrômeda (M31)',
        ra: 0.71,
        dec: 41.27,
        inner: 'rgba(254, 243, 199, 0.92)',
        mid: 'rgba(147, 197, 253, 0.52)',
        outer: 'rgba(99, 102, 241, 0.18)',
        sizeGlobal: 8.2,
        sizeHuman: 19.0,
      },
      {
        name: 'Grande Nuvem de Magalhães',
        ra: 5.39,
        dec: -69.75,
        inner: 'rgba(125, 211, 252, 0.85)',
        mid: 'rgba(167, 139, 250, 0.50)',
        outer: 'rgba(244, 114, 182, 0.16)',
        sizeGlobal: 9.0,
        sizeHuman: 21.0,
      },
      {
        name: 'Nebulosa da Roseta (NGC 2237)',
        ra: 6.53,
        dec: 4.95,
        inner: 'rgba(251, 113, 133, 0.88)',
        mid: 'rgba(217, 70, 239, 0.50)',
        outer: 'rgba(59, 130, 246, 0.15)',
        sizeGlobal: 6.8,
        sizeHuman: 15.5,
      },
    ];
  }

  private buildGlobalNebulae() {
    this.globalNebulaeGroup = new THREE.Group();
    this.globalNebulaeGroup.visible = false;

    const catalog = this.getNebulaeCatalog();
    catalog.forEach((neb) => {
      const pos = CelestialSphere3D.raDecToPlanarVector3(neb.ra, neb.dec);
      const nGroup = new THREE.Group();
      nGroup.position.copy(pos);

      const tex = this.createNebulaCloudTexture(neb.inner, neb.mid, neb.outer);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
        toneMapped: false,
      });
      const cloudSprite = new THREE.Sprite(mat);
      cloudSprite.scale.set(neb.sizeGlobal, neb.sizeGlobal * 0.78, 1);
      nGroup.add(cloudSprite);

      const labelSprite = this.createConstellationLabelSprite(neb.name, 'Nebulosa Cósmica', 4.6);
      labelSprite.position.set(0, 1.35, 0);
      nGroup.add(labelSprite);

      this.globalNebulaeGroup?.add(nGroup);
    });

    this.globalVaultGroup.add(this.globalNebulaeGroup);
  }

  private buildHumanNebulae() {
    this.humanNebulaeGroup = new THREE.Group();
    this.humanNebulaeGroup.visible = false;

    const catalog = this.getNebulaeCatalog();
    catalog.forEach((neb) => {
      const pos = CelestialSphere3D.raDecToSphereVector3(neb.ra, neb.dec);
      const nGroup = new THREE.Group();
      nGroup.position.copy(pos);

      const tex = this.createNebulaCloudTexture(neb.inner, neb.mid, neb.outer);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.90,
        depthWrite: false,
        toneMapped: false,
      });
      const cloudSprite = new THREE.Sprite(mat);
      cloudSprite.scale.set(neb.sizeHuman, neb.sizeHuman * 0.78, 1);
      nGroup.add(cloudSprite);

      const labelSprite = this.createConstellationLabelSprite(neb.name, 'Nebulosa Cósmica', 9.5);
      labelSprite.position.set(0, 3.2, 0);
      nGroup.add(labelSprite);

      this.humanNebulaeGroup?.add(nGroup);
    });

    this.humanVaultGroup.add(this.humanNebulaeGroup);
  }

  private buildGlobalConstellations() {
    this.globalConstellationsGroup = new THREE.Group();
    this.globalConstellationsGroup.visible = false;

    this.globalConstellationLinesGroup = new THREE.Group();
    this.globalConstellationLabelsGroup = new THREE.Group();
    this.globalConstellationsGroup.add(this.globalConstellationLinesGroup);
    this.globalConstellationsGroup.add(this.globalConstellationLabelsGroup);

    const constellations = this.getConstellationsData();

    const starMeshGeo = new THREE.SphereGeometry(0.065, 12, 12);
    const starMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x7dd3fc),
      toneMapped: false,
    });

    const sparkleTex = generateStarSparkleTexture('#38bdf8');
    const sparkleMat = new THREE.SpriteMaterial({
      map: sparkleTex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
      toneMapped: false,
    });

    this.globalConstellationLineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    constellations.forEach((c) => {
      const cStarsGroup = new THREE.Group();
      const pts3D: THREE.Vector3[] = [];
      c.points.forEach((p) => {
        const vec = CelestialSphere3D.raDecToPlanarVector3(p.ra, p.dec);
        pts3D.push(vec);
        const pGroup = new THREE.Group();
        pGroup.position.copy(vec);

        const mesh = new THREE.Mesh(starMeshGeo, starMat);
        pGroup.add(mesh);

        const sprite = new THREE.Sprite(sparkleMat);
        sprite.scale.set(0.75, 0.75, 1);
        pGroup.add(sprite);

        cStarsGroup.add(pGroup);
      });
      this.globalConstellationsGroup?.add(cStarsGroup);

      // Draw constellation connecting lines (traçados estelares)
      let lineSegments: THREE.LineSegments | undefined;
      const pairs = c.lines || c.points.slice(0, -1).map((_, idx) => [idx, idx + 1] as [number, number]);
      const lineVerts: THREE.Vector3[] = [];
      pairs.forEach(([a, b]) => {
        if (pts3D[a] && pts3D[b]) {
          lineVerts.push(pts3D[a], pts3D[b]);
        }
      });
      if (lineVerts.length >= 2) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints(lineVerts);
        lineSegments = new THREE.LineSegments(lineGeo, this.globalConstellationLineMat!);
        this.globalConstellationLinesGroup?.add(lineSegments);
      }

      // Constellation name badge
      const labelVec = CelestialSphere3D.raDecToPlanarVector3(c.labelPos.ra, c.labelPos.dec);
      const labelSprite = this.createConstellationLabelSprite(c.name, c.latinName, 4.0);
      labelSprite.position.set(labelVec.x, labelVec.y + 0.9, labelVec.z);
      this.globalConstellationLabelsGroup?.add(labelSprite);

      const entry = this.constellationItemMap.get(c.id) || {};
      entry.globalStars = cStarsGroup;
      entry.globalLines = lineSegments;
      entry.globalLabel = labelSprite;
      this.constellationItemMap.set(c.id, entry);
    });

    this.globalVaultGroup.add(this.globalConstellationsGroup);
  }

  // =========================================================================
  // HUMAN OBSERVER MODE IMPLEMENTATION (True 360° Spherical Vault R = 120.0)
  // =========================================================================

  /**
   * Planar Human Mode: Converts Astronomical Equatorial Coordinates (RA hours, Dec degrees)
   * into a 3D position vector on the planar observer's upper celestial hemisphere (radius 120.0).
   */
  public static raDecToSphereVector3(raHours: number, decDeg: number, radius = CelestialSphere3D.HUMAN_SPHERE_RADIUS): THREE.Vector3 {
    const raRad = (raHours / 24) * 2 * Math.PI;
    const decClamped = Math.max(-89.9, Math.min(89.9, decDeg));
    const normDec = (decClamped + 90.0) / 180.0;
    const elevRad = (0.12 + 0.85 * normDec) * (Math.PI / 2);

    const y = radius * Math.sin(elevRad);
    const rHoriz = radius * Math.cos(elevRad);
    const x = rHoriz * Math.cos(raRad);
    const z = rHoriz * Math.sin(raRad);

    return new THREE.Vector3(x, y, z);
  }

  /**
   * Spherical Globe Mode: Converts Astronomical Equatorial Coordinates (RA hours, Dec degrees)
   * into a 3D position vector on the full -90° to +90° celestial sphere.
   */
  public static raDecToFullSphereVector3(raHours: number, decDeg: number, radius = CelestialSphere3D.HUMAN_SPHERE_RADIUS): THREE.Vector3 {
    const raRad = (raHours / 24) * 2 * Math.PI;
    const decRad = (THREE.MathUtils.clamp(decDeg, -89.9, 89.9) * Math.PI) / 180.0;

    const y = radius * Math.sin(decRad);
    const rHoriz = radius * Math.cos(decRad);
    const x = rHoriz * Math.cos(raRad);
    const z = rHoriz * Math.sin(raRad);

    return new THREE.Vector3(x, y, z);
  }

  private buildHumanPolaris() {
    this.humanPolarisGroup = new THREE.Group();
    // In humanGroup local coordinates, Local Y is the polar axis pointing directly towards Polaris
    this.humanPolarisGroup.position.set(0, CelestialSphere3D.HUMAN_SPHERE_RADIUS, 0);

    const starGeo = new THREE.SphereGeometry(0.18, 20, 20); // Menor e delicada
    const starMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xffffff),
      toneMapped: false,
    });
    const starMesh = new THREE.Mesh(starGeo, starMat);
    this.humanPolarisGroup.add(starMesh);

    const sparkleTex = generateStarSparkleTexture('#ffffff');
    const sparkleMat = new THREE.SpriteMaterial({
      map: sparkleTex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      toneMapped: false,
    });
    const sparkleSprite = new THREE.Sprite(sparkleMat);
    sparkleSprite.scale.set(1.8, 1.8, 1); // Reduzido de 3.2 para 1.8
    this.humanPolarisGroup.add(sparkleSprite);

    this.humanGroup.add(this.humanPolarisGroup);
  }

  /**
   * Planar Mode Human Observer Vault (100% preserved upper hemisphere for Teoria Planar)
   */
  private buildHumanSphericalVault() {
    const starCount = 1500;
    const R = CelestialSphere3D.HUMAN_SPHERE_RADIUS;

    // Tamanho reduzido: raio 0.09 (estrelas pontuais e nítidas)
    const baseSphereGeo = new THREE.SphereGeometry(0.09, 8, 8);
    const planetWhiteMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xffffff),
      toneMapped: false, // Luz própria 100% emissiva
    });

    this.humanInstancedStars = new THREE.InstancedMesh(baseSphereGeo, planetWhiteMat, starCount);
    const sparklePositions = new Float32Array(starCount * 3);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < starCount; i++) {
      let decRad: number;
      let raRad: number;

      const isGalacticBand = Math.random() < 0.25;
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

      const elevRad = (0.10 + 0.88 * Math.abs(Math.sin(decRad))) * (Math.PI / 2);
      const y = R * Math.sin(elevRad);
      const rHoriz = R * Math.cos(elevRad);
      const x = rHoriz * Math.cos(raRad);
      const z = rHoriz * Math.sin(raRad);

      const isBright = Math.random() < 0.08;
      const scaleMult = isBright ? (1.3 + Math.random() * 0.3) : (0.7 + Math.random() * 0.35);

      dummy.position.set(x, y, z);
      dummy.scale.set(scaleMult, scaleMult, scaleMult);
      dummy.updateMatrix();

      this.humanInstancedStars.setMatrixAt(i, dummy.matrix);
      // Luz própria com cores estelares naturais
      this.humanInstancedStars.setColorAt(i, STELLAR_COLORS[i % STELLAR_COLORS.length]);

      sparklePositions[i * 3] = x;
      sparklePositions[i * 3 + 1] = y;
      sparklePositions[i * 3 + 2] = z;
    }

    this.humanInstancedStars.instanceMatrix.needsUpdate = true;
    if (this.humanInstancedStars.instanceColor) {
      this.humanInstancedStars.instanceColor.needsUpdate = true;
    }
    this.humanVaultGroup.add(this.humanInstancedStars);

    const sparkleGeo = new THREE.BufferGeometry();
    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));

    const sparkleTex = generateStarSparkleTexture('#ffffff');
    const sparkleMat = new THREE.PointsMaterial({
      size: 0.85, // Reduzido de 1.85 para 0.85 (difração pontual e cristalina)
      map: sparkleTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      opacity: 0.88,
    });

    this.humanSparklePoints = new THREE.Points(sparkleGeo, sparkleMat);
    this.humanVaultGroup.add(this.humanSparklePoints);
  }

  private buildHumanConstellations() {
    this.humanConstellationsGroup = new THREE.Group();
    this.humanConstellationsGroup.visible = false;

    this.humanConstellationLinesGroup = new THREE.Group();
    this.humanConstellationLabelsGroup = new THREE.Group();
    this.humanConstellationsGroup.add(this.humanConstellationLinesGroup);
    this.humanConstellationsGroup.add(this.humanConstellationLabelsGroup);

    const constellations = this.getConstellationsData();

    const starMeshGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const starMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x7dd3fc),
      toneMapped: false,
    });

    const sparkleTex = generateStarSparkleTexture('#38bdf8');
    const sparkleMat = new THREE.SpriteMaterial({
      map: sparkleTex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      toneMapped: false,
    });

    this.humanConstellationLineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    constellations.forEach(c => {
      const cStarsGroup = new THREE.Group();
      const pts3D: THREE.Vector3[] = [];
      c.points.forEach(p => {
        const vec = CelestialSphere3D.raDecToSphereVector3(p.ra, p.dec);
        pts3D.push(vec);
        const pGroup = new THREE.Group();
        pGroup.position.copy(vec);

        const mesh = new THREE.Mesh(starMeshGeo, starMat);
        pGroup.add(mesh);

        const sprite = new THREE.Sprite(sparkleMat);
        sprite.scale.set(1.6, 1.6, 1);
        pGroup.add(sprite);

        cStarsGroup.add(pGroup);
      });
      this.humanConstellationsGroup?.add(cStarsGroup);

      let lineSegments: THREE.LineSegments | undefined;
      const pairs = c.lines || c.points.slice(0, -1).map((_, idx) => [idx, idx + 1] as [number, number]);
      const lineVerts: THREE.Vector3[] = [];
      pairs.forEach(([a, b]) => {
        if (pts3D[a] && pts3D[b]) {
          lineVerts.push(pts3D[a], pts3D[b]);
        }
      });
      if (lineVerts.length >= 2) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints(lineVerts);
        lineSegments = new THREE.LineSegments(lineGeo, this.humanConstellationLineMat!);
        this.humanConstellationLinesGroup?.add(lineSegments);
      }

      const labelVec = CelestialSphere3D.raDecToSphereVector3(c.labelPos.ra, c.labelPos.dec);
      const labelSprite = this.createConstellationLabelSprite(c.name, c.latinName, 8.8);
      labelSprite.position.set(labelVec.x, labelVec.y + 2.2, labelVec.z);
      this.humanConstellationLabelsGroup?.add(labelSprite);

      const entry = this.constellationItemMap.get(c.id) || {};
      entry.humanStars = cStarsGroup;
      entry.humanLines = lineSegments;
      entry.humanLabel = labelSprite;
      this.constellationItemMap.set(c.id, entry);
    });

    this.humanVaultGroup.add(this.humanConstellationsGroup);
  }

  /**
   * Dedicated Full-Sphere (-90° to +90°) Starry Vault strictly for Teoria Terra Redonda (Globe Mode):
   * - Covers both Northern and Southern celestial hemispheres uniformly so no side of the sky is empty.
   */
  private buildSphericalGlobeHumanVault() {
    const starCount = 2600;
    const R = CelestialSphere3D.HUMAN_SPHERE_RADIUS;

    const polarisGroup = new THREE.Group();
    polarisGroup.position.set(0, R, 0);
    polarisGroup.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })
      )
    );
    const sparkleTex = generateStarSparkleTexture('#ffffff');
    const polarisSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: sparkleTex,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        toneMapped: false,
      })
    );
    polarisSprite.scale.set(1.8, 1.8, 1);
    polarisGroup.add(polarisSprite);
    this.sphericalPolarisGroup = polarisGroup;
    this.sphericalHumanGroup.add(this.sphericalPolarisGroup);

    const baseSphereGeo = new THREE.SphereGeometry(0.09, 8, 8);
    const planetWhiteMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xffffff),
      toneMapped: false,
    });

    const instanced = new THREE.InstancedMesh(baseSphereGeo, planetWhiteMat, starCount);
    const sparklePositions = new Float32Array(starCount * 3);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < starCount; i++) {
      let decRad: number;
      let raRad: number;

      const isGalacticBand = Math.random() < 0.25;
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

      const y = R * Math.sin(decRad);
      const rHoriz = R * Math.cos(decRad);
      const x = rHoriz * Math.cos(raRad);
      const z = rHoriz * Math.sin(raRad);

      const isBright = Math.random() < 0.08;
      const scaleMult = isBright ? 1.3 + Math.random() * 0.3 : 0.7 + Math.random() * 0.35;

      dummy.position.set(x, y, z);
      dummy.scale.set(scaleMult, scaleMult, scaleMult);
      dummy.updateMatrix();

      instanced.setMatrixAt(i, dummy.matrix);
      instanced.setColorAt(i, STELLAR_COLORS[i % STELLAR_COLORS.length]);

      sparklePositions[i * 3] = x;
      sparklePositions[i * 3 + 1] = y;
      sparklePositions[i * 3 + 2] = z;
    }

    instanced.instanceMatrix.needsUpdate = true;
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
    this.sphericalInstancedStars = instanced;
    this.sphericalHumanVaultGroup.add(this.sphericalInstancedStars);

    const sparkleGeo = new THREE.BufferGeometry();
    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
    const sparkleMat = new THREE.PointsMaterial({
      size: 0.85,
      map: sparkleTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      opacity: 0.88,
    });
    this.sphericalHumanSparklePoints = new THREE.Points(sparkleGeo, sparkleMat);
    this.sphericalHumanVaultGroup.add(this.sphericalHumanSparklePoints);

    // Constellations on full -90° to +90° sphere
    this.sphericalConstellationsGroup = new THREE.Group();
    this.sphericalConstellationLinesGroup = new THREE.Group();
    this.sphericalConstellationLabelsGroup = new THREE.Group();
    this.sphericalConstellationsGroup.add(this.sphericalConstellationLinesGroup);
    this.sphericalConstellationsGroup.add(this.sphericalConstellationLabelsGroup);

    this.sphericalConstellationLineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const constellations = this.getConstellationsData();
    const starMeshGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    const cSparkleMat = new THREE.SpriteMaterial({
      map: sparkleTex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      toneMapped: false,
    });
    constellations.forEach((c) => {
      const cStarsGroup = new THREE.Group();
      const pts3D: THREE.Vector3[] = [];
      c.points.forEach((p) => {
        const vec = CelestialSphere3D.raDecToFullSphereVector3(p.ra, p.dec);
        pts3D.push(vec);
        const pGroup = new THREE.Group();
        pGroup.position.copy(vec);
        pGroup.add(new THREE.Mesh(starMeshGeo, starMat));
        const sprite = new THREE.Sprite(cSparkleMat);
        sprite.scale.set(1.2, 1.2, 1);
        pGroup.add(sprite);
        cStarsGroup.add(pGroup);
      });
      this.sphericalConstellationsGroup?.add(cStarsGroup);

      let lineSegments: THREE.LineSegments | undefined;
      const pairs = c.lines || c.points.slice(0, -1).map((_, idx) => [idx, idx + 1] as [number, number]);
      const lineVerts: THREE.Vector3[] = [];
      pairs.forEach(([a, b]) => {
        if (pts3D[a] && pts3D[b]) {
          lineVerts.push(pts3D[a], pts3D[b]);
        }
      });
      if (lineVerts.length >= 2) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints(lineVerts);
        lineSegments = new THREE.LineSegments(lineGeo, this.sphericalConstellationLineMat!);
        this.sphericalConstellationLinesGroup?.add(lineSegments);
      }

      const labelVec = CelestialSphere3D.raDecToFullSphereVector3(c.labelPos.ra, c.labelPos.dec);
      const labelSprite = this.createConstellationLabelSprite(c.name, c.latinName, 8.8);
      labelSprite.position.set(labelVec.x, labelVec.y + 2.2, labelVec.z);
      this.sphericalConstellationLabelsGroup?.add(labelSprite);

      const entry = this.constellationItemMap.get(c.id) || {};
      entry.sphericalStars = cStarsGroup;
      entry.sphericalLines = lineSegments;
      entry.sphericalLabel = labelSprite;
      this.constellationItemMap.set(c.id, entry);
    });

    this.sphericalHumanVaultGroup.add(this.sphericalConstellationsGroup);
  }

  /**
   * Build Night Atmosphere Scattering Dome:
   * - Cúpula hemisférica invertida de 360° com scattering atmosférico noturno Rayleigh/Mie.
   * - Onde a Lua estiver localizada, o céu é banhado por um tom profundo de azul marinho ("azul marinho bem forte"),
   *   exatamente proporcional à iluminação e altitude da Lua.
   * - As demais regiões do firmamento transitam suavemente para o escuro cósmico profundo,
   *   com um suave airglow natural rente ao horizonte.
   */
  private buildHumanAtmosphericSkyDome() {
    const domeGeo = new THREE.SphereGeometry(CelestialSphere3D.HUMAN_SPHERE_RADIUS - 0.6, 48, 32);

    this.humanAtmosphereMat = new THREE.ShaderMaterial({
      uniforms: {
        uMoonDirection: { value: new THREE.Vector3(0, 0.707, 0.707) },
        uMoonLight: { value: 0.5 },
        uMoonAltitude: { value: 0.5 },
        uSunDirection: { value: new THREE.Vector3(0, -1, 0) },
        uDaylight: { value: 0.0 },
        // Azul marinho real e vibrante fiel à fotografia de referência
        uDeepNavyColor: { value: new THREE.Color(0x0a265c) },   // #0a265c - Azul marinho profundo e vibrante
        uMidnightBlue: { value: new THREE.Color(0x040d24) },    // #040d24 - Índigo de transição da meia-noite
        uVoidBlack: { value: new THREE.Color(0x010206) },       // #010206 - Escuridão estelar cósmica
        uHorizonAirglow: { value: new THREE.Color(0x06142a) },  // #06142a - Brilho atmosférico sutil no horizonte
        uTime: { value: 0.0 },
        uShowAtmosphereClouds: { value: 0.0 },
      },
      vertexShader: `
        varying vec3 vRayDirection;
        void main() {
          vRayDirection = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uMoonDirection;
        uniform float uMoonLight;
        uniform float uMoonAltitude;
        uniform vec3 uSunDirection;
        uniform float uDaylight;
        uniform vec3 uDeepNavyColor;
        uniform vec3 uMidnightBlue;
        uniform vec3 uVoidBlack;
        uniform vec3 uHorizonAirglow;
        uniform float uTime;
        uniform float uShowAtmosphereClouds;

        varying vec3 vRayDirection;

        float hashAtmo(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }
        float noiseAtmo(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hashAtmo(i), hashAtmo(i + vec2(1.0, 0.0)), f.x),
            mix(hashAtmo(i + vec2(0.0, 1.0)), hashAtmo(i + vec2(1.0, 1.0)), f.x),
            f.y
          );
        }
        float fbmAtmo(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 4; i++) {
            v += a * noiseAtmo(p);
            p = p * 2.02 + vec2(3.1, 5.7);
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec3 dir = normalize(vRayDirection);

          // Elevação acima do horizonte (0.0 = horizonte, 1.0 = zênite no topo)
          float elevation = clamp(dir.y, 0.0, 1.0);

          // 1. Céu noturno base com gradiente de horizonte (airglow sutil na base, vácuo escuro no alto)
          vec3 baseNightSky = mix(uHorizonAirglow, uVoidBlack, pow(elevation, 0.45));

          // 2. Foco de Luz Proporcional em Volta da Lua (Direcional conforme a Iluminação do Sol)
          // Distância angular exata em radianos entre o ponto do céu e a posição da Lua
          float moonCos = clamp(dot(dir, uMoonDirection), -1.0, 1.0);
          float angleRad = acos(moonCos);

          // Vetores projetados no plano tangente da abóbada celeste ao redor da Lua
          vec3 toSkyFromMoon = dir - uMoonDirection * moonCos;
          vec3 toSunFromMoon = uSunDirection - uMoonDirection * dot(uSunDirection, uMoonDirection);
          float lenSky = length(toSkyFromMoon);
          float lenSun = length(toSunFromMoon);
          float moonSunAlignment = (lenSky > 0.0005 && lenSun > 0.0005) ? dot(toSkyFromMoon, toSunFromMoon) / (lenSky * lenSun) : 1.0;

          // O lado escuro / preto da Lua NÃO PODE ter luz, brilho ou halo no céu ao seu redor:
          // A luz e o halo circumlunar só emanam do lado iluminado (apontado para o Sol)!
          // uMoonLight varia de 0.0 (Nova) a 1.0 (Cheia):
          float phaseThresh = (0.5 - uMoonLight) * 2.2;
          float atmoDirMask = smoothstep(phaseThresh - 0.25, phaseThresh + 0.35, moonSunAlignment);
          float atmoFullBlend = smoothstep(0.88, 0.98, uMoonLight);
          float lunarSideFactor = mix(atmoDirMask, 1.0, atmoFullBlend);

          // Foco concêntrico estritamente no lado iluminado:
          // - Núcleo radiante luminoso imediatamente ao redor do disco lunar (0° a 8°)
          float coreFocus = exp(-angleRad * 9.5) * lunarSideFactor;
          // - Halo circumlunar em azul marinho vibrante e rico (8° a 28°)
          float haloNavyFocus = exp(-angleRad * 3.8) * mix(0.08, 1.0, lunarSideFactor);
          // - Difusão atmosférica suave de transição (28° a 65°)
          float wideTransition = exp(-angleRad * 1.6) * 0.45 * mix(0.25, 1.0, lunarSideFactor);

          // Intensidade do foco de luz da Lua (desligado durante o dia para que o Sol seja a única fonte de luz diurna!)
          float nightOnlyFactor = 1.0 - smoothstep(0.0, 0.14, uDaylight);
          float effectiveLunarLight = uMoonLight * nightOnlyFactor;
          float totalLunarFocus = (coreFocus * 0.85 + haloNavyFocus * 0.95 + wideTransition) * effectiveLunarLight;

          // Densidade do ar: mais denso nas camadas inferiores, afinando no zênite
          float airDensity = 1.0 - elevation * 0.35;
          totalLunarFocus *= airDensity;

          // Mescla para o tom azul marinho rico e profundo fiel à foto (#0a265c)
          vec3 navyAtmosphere = mix(uMidnightBlue, uDeepNavyColor, clamp(totalLunarFocus * 1.45, 0.0, 1.0));

          // Mistura suave do foco de luz da Lua com o céu noturno escuro estrelado
          vec3 finalSky = mix(baseNightSky, navyAtmosphere, clamp(totalLunarFocus * 1.55, 0.0, 1.0));

          // Destaque adicional de luz radiante no foco imediato ao redor da Lua (prateado-azulado)
          // Estritamente presente no lado iluminado; zero no lado escuro!
          vec3 lunarCoreLight = vec3(0.12, 0.28, 0.58);
          finalSky += lunarCoreLight * (coreFocus * 0.65 * effectiveLunarLight);

          // Transição realista para Pôr do Sol e Dia com Espalhamento Rayleigh e Mie
          if (uDaylight > 0.005) {
            float sunCos = clamp(dot(dir, uSunDirection), -1.0, 1.0);
            float sunAngleRad = acos(sunCos);
            float sunElevation = uSunDirection.y;

            // Céu de pleno dia: gradiente atmosférico mais puxado para o azul celeste/safira rico do horizonte até o zênite
            vec3 middayZenith = vec3(0.03, 0.28, 0.88);
            vec3 middayHorizon = vec3(0.24, 0.58, 0.96);
            vec3 middaySky = mix(middayHorizon, middayZenith, pow(elevation, 0.52));
            // Auréola e brilho de luz solar radiante no domo celeste (proporcional ao tamanho do disco da Lua)
            float coreGlare = exp(-sunAngleRad * 65.0) * 0.72;
            float aureoleGlare = exp(-pow(sunAngleRad * 18.0, 1.35)) * 0.36;
            float wideGlare = exp(-pow(sunAngleRad * 5.0, 1.4)) * 0.12;

            vec3 innerGold = vec3(1.0, 0.94, 0.55);
            vec3 outerAmber = vec3(1.0, 0.72, 0.22);
            vec3 solarAureoleColor = mix(outerAmber, innerGold, clamp(coreGlare * 1.5 + aureoleGlare * 0.6, 0.0, 1.0));
            solarAureoleColor = mix(solarAureoleColor, vec3(1.0, 0.99, 0.92), clamp(coreGlare * 1.8, 0.0, 1.0));

            float aureoleIntensity = (coreGlare + aureoleGlare + wideGlare) * 0.65;
            middaySky = mix(middaySky, solarAureoleColor, clamp(aureoleIntensity, 0.0, 0.85));
            middaySky += solarAureoleColor * (coreGlare * 0.35);

            // Céu de Pôr do Sol / Crepúsculo (com zênite e transição mais azulados)
            vec3 sunsetFire = vec3(1.0, 0.46, 0.08);
            vec3 sunsetGold = vec3(1.0, 0.76, 0.28);
            vec3 sunsetDusk = vec3(0.52, 0.32, 0.68);
            vec3 sunsetPurple = vec3(0.14, 0.26, 0.66);
            vec3 sunsetZenith = vec3(0.04, 0.18, 0.54);

            float sunsetCorona = exp(-sunAngleRad * 4.3);
            float sunsetHalo = exp(-sunAngleRad * 1.45);

            vec3 sunsetGradient = mix(sunsetDusk, sunsetPurple, pow(elevation, 0.45));
            sunsetGradient = mix(sunsetGradient, sunsetZenith, pow(elevation, 1.1));

            vec3 sunsetFacingSun = mix(sunsetFire, sunsetGold, clamp(sunsetCorona * 1.5, 0.0, 1.0));
            vec3 sunsetSky = mix(sunsetGradient, sunsetFacingSun, clamp((sunsetHalo * 0.85 + sunsetCorona * 1.2) * (1.0 - elevation * 0.7), 0.0, 1.0));

            // Cinturão de Vênus no horizonte oposto
            float antiSunAlign = max(0.0, -sunCos);
            float sunsetFactor = clamp(1.0 - abs(uDaylight - 0.35) / 0.35, 0.0, 1.0);
            vec3 beltOfVenus = vec3(0.42, 0.44, 0.76);
            sunsetSky = mix(sunsetSky, beltOfVenus, antiSunAlign * (1.0 - elevation) * 0.45 * sunsetFactor);

            // Transição contínua entre pôr do sol e pleno dia (atinge o azul puro mais cedo)
            float dayProgress = clamp((uDaylight - 0.08) / 0.45, 0.0, 1.0);
            vec3 sunlitSky = mix(sunsetSky, middaySky, dayProgress);

            finalSky = mix(finalSky, sunlitSky, clamp(uDaylight * 1.05, 0.0, 1.0));
          }

          // 3. Nuvens Volumétricas 3D Fotorealistas no Domo Celeste (ativas no modo Esférico; no modo Planar usa CloudLayer3D unificado):
          if (uShowAtmosphereClouds > 0.5 && elevation > 0.0) {
            float cloudHorizonFade = smoothstep(0.0, 0.15, elevation);
            vec2 skyPlaneUV = dir.xz / (elevation + 0.14);
            vec2 windDrift = vec2(uTime * 0.0022, -uTime * 0.0014);

            vec2 w1 = vec2(
              fbmAtmo(skyPlaneUV * 1.20 + windDrift),
              fbmAtmo(skyPlaneUV * 1.20 + windDrift + vec2(5.2, 1.3))
            );
            float cumulusRaw = fbmAtmo(skyPlaneUV * 1.90 + w1 * 1.20 + windDrift * 1.15);
            float detailRaw = fbmAtmo(skyPlaneUV * 4.20 - w1 * 0.80 + windDrift * 1.40);
            float cirrusRaw = fbmAtmo(skyPlaneUV * 1.40 + vec2(w1.y, -w1.x) * 1.50 + windDrift * 1.60);

            float cumulusDens = smoothstep(0.47, 0.75, cumulusRaw * 0.76 + detailRaw * 0.24);
            float cirrusDens = smoothstep(0.58, 0.84, cirrusRaw) * 0.35;
            float totalCloudDens = clamp(cumulusDens + cirrusDens, 0.0, 1.0) * cloudHorizonFade;

            if (totalCloudDens > 0.005) {
              // Directional sunlight self-shadowing: sample cloud density strictly towards the Sun
              vec2 sunSkyUV = uSunDirection.xz / (max(0.05, uSunDirection.y) + 0.14);
              vec2 toSunUV = normalize(sunSkyUV - skyPlaneUV + vec2(0.0001));
              float sunSideRaw = fbmAtmo((skyPlaneUV + toSunUV * 0.24) * 1.90 + w1 * 1.20 + windDrift * 1.15);
              float sunSideDens = smoothstep(0.47, 0.75, sunSideRaw);
              float sunFacingLit = clamp(1.0 - (sunSideDens - totalCloudDens * 0.45) * 1.55, 0.08, 1.0);

              float cloudTopBright = sunFacingLit;
              float rawSunDot = clamp(dot(dir, uSunDirection), -1.0, 1.0);
              float sunDotRay = max(0.0, rawSunDot);
              float silverLining = (pow(sunDotRay, 12.0) * 1.50 + pow(sunDotRay, 3.0) * 0.42) * (1.0 - totalCloudDens * 0.50);
              float moonSilver = pow(max(0.0, moonCos), 8.0) * 0.80 * effectiveLunarLight;

              // Arco calibrado (-20%) de nuvens brancas abaixo e ao redor do Sol:
              // Nuvens sob o arco solar ficam brancas; nuvens mais afastadas mantêm o tom amarelo/dourado!
              float sunWhiteArc = smoothstep(0.08, 0.68, rawSunDot);
              float farFromSunArc = 1.0 - smoothstep(0.26, 0.76, rawSunDot);

              vec3 dayCloudTop = vec3(1.0, 1.0, 1.0);
              vec3 dayCloudBase = mix(vec3(0.46, 0.56, 0.70), vec3(0.76, 0.83, 0.92), sunWhiteArc * 0.45);
              float boostedBright = clamp(cloudTopBright + sunWhiteArc * 0.22, 0.0, 1.0);
              vec3 dayCloudCol = mix(dayCloudBase, dayCloudTop, boostedBright) + vec3(1.0, 0.99, 0.96) * silverLining;

              // No escuro, as nuvens ficam pretas (sem bordas artificiais)
              vec3 nightCloudCol = vec3(0.0, 0.0, 0.0) + vec3(0.12, 0.18, 0.28) * moonSilver;

              vec3 finalCloudCol = mix(nightCloudCol, dayCloudCol, clamp(uDaylight * 1.25, 0.0, 1.0));

              float cloudVisAlpha = totalCloudDens * mix(0.55, 0.86, clamp(uDaylight + uMoonLight * 0.55, 0.0, 1.0));
              finalSky = mix(finalSky, finalCloudCol, clamp(cloudVisAlpha, 0.0, 0.90));
            }
          }

          gl_FragColor = vec4(finalSky, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: true,
      transparent: true,
    });

    this.humanAtmosphereDomeMesh = new THREE.Mesh(domeGeo, this.humanAtmosphereMat);
    this.humanAtmosphereDomeMesh.renderOrder = -10; // Renderizado como pano de fundo do céu
    this.humanAtmosphereGroup.add(this.humanAtmosphereDomeMesh);
  }

  // =========================================================================
  // ASTRONOMICAL CONSTELLATIONS DATA (Pure Stars Without Connecting Lines)
  // =========================================================================

  private getConstellationsData(): ConstellationData[] {
    return CONSTELLATIONS_CATALOG;
  }

  // =========================================================================
  // UPDATE LOOP (Diurnal sidereal rotation & atmospheric day/night gating)
  // =========================================================================

  public update(
    date: Date,
    daylightFactor: number,
    sunWorldPos: THREE.Vector3,
    observerPos: THREE.Vector3,
    isHumanMode: boolean,
    observerLat: number = 35.0,
    showConstellations = false,
    showSpaceBackground = true,
    solarEclipseFactor = 0.0,
    time = 0,
    moonWorldPos?: THREE.Vector3,
    moonLightFactor = 0.5,
    moonAltitudeDeg = 30.0,
    showNebulae = false,
    showConstellationLines = true,
    showConstellationLabels = true,
    constellationLineColor: 'cyan' | 'gold' | 'white' | 'magenta' = 'cyan',
    constellationLineOpacity = 0.85,
    selectedConstellation: string | null = null
  ) {
    const anyCelestialActive = showSpaceBackground || showConstellations || showNebulae;
    if (!anyCelestialActive) {
      this.group.visible = false;
      this.globalGroup.visible = false;
      this.humanGroup.visible = false;
      this.sphericalHumanGroup.visible = false;
      this.humanAtmosphereGroup.visible = false;
      return;
    }
    this.group.visible = true;

    // Toggle individual sub-layers (background stars, constellations, nebulae)
    if (this.globalInstancedStars) this.globalInstancedStars.visible = showSpaceBackground;
    if (this.globalSparklePoints) this.globalSparklePoints.visible = showSpaceBackground;
    if (this.globalPolarisGroup) this.globalPolarisGroup.visible = showSpaceBackground;
    if (this.globalConstellationsGroup) this.globalConstellationsGroup.visible = showConstellations;
    if (this.globalNebulaeGroup) this.globalNebulaeGroup.visible = showNebulae;

    if (this.humanInstancedStars) this.humanInstancedStars.visible = showSpaceBackground;
    if (this.humanSparklePoints) this.humanSparklePoints.visible = showSpaceBackground;
    if (this.humanPolarisGroup) this.humanPolarisGroup.visible = showSpaceBackground;
    if (this.humanConstellationsGroup) this.humanConstellationsGroup.visible = showConstellations;
    if (this.humanNebulaeGroup) this.humanNebulaeGroup.visible = showNebulae;

    if (this.sphericalInstancedStars) this.sphericalInstancedStars.visible = showSpaceBackground;
    if (this.sphericalPolarisGroup) this.sphericalPolarisGroup.visible = showSpaceBackground;
    if (this.sphericalConstellationsGroup) this.sphericalConstellationsGroup.visible = showConstellations;

    // Dynamic line styling & color palette
    const COLOR_MAP: Record<string, number> = {
      cyan: 0x38bdf8,
      gold: 0xfbbf24,
      white: 0xf8fafc,
      magenta: 0xf472b6,
    };
    const colorHex = COLOR_MAP[constellationLineColor] ?? 0x38bdf8;
    const lineOpacity = THREE.MathUtils.clamp(constellationLineOpacity, 0.15, 1.0);

    if (this.globalConstellationLineMat) {
      this.globalConstellationLineMat.color.setHex(colorHex);
      this.globalConstellationLineMat.opacity = lineOpacity;
    }
    if (this.humanConstellationLineMat) {
      this.humanConstellationLineMat.color.setHex(colorHex);
      this.humanConstellationLineMat.opacity = lineOpacity;
    }
    if (this.sphericalConstellationLineMat) {
      this.sphericalConstellationLineMat.color.setHex(colorHex);
      this.sphericalConstellationLineMat.opacity = lineOpacity;
    }

    if (this.globalConstellationLinesGroup) {
      this.globalConstellationLinesGroup.visible = showConstellations && showConstellationLines;
    }
    if (this.globalConstellationLabelsGroup) {
      this.globalConstellationLabelsGroup.visible = showConstellations && showConstellationLabels;
    }
    if (this.humanConstellationLinesGroup) {
      this.humanConstellationLinesGroup.visible = showConstellations && showConstellationLines;
    }
    if (this.humanConstellationLabelsGroup) {
      this.humanConstellationLabelsGroup.visible = showConstellations && showConstellationLabels;
    }
    if (this.sphericalConstellationLinesGroup) {
      this.sphericalConstellationLinesGroup.visible = showConstellations && showConstellationLines;
    }
    if (this.sphericalConstellationLabelsGroup) {
      this.sphericalConstellationLabelsGroup.visible = showConstellations && showConstellationLabels;
    }

    // Filter or highlight selected constellation
    this.constellationItemMap.forEach((entry, id) => {
      const isTarget = selectedConstellation ? id === selectedConstellation : true;
      if (entry.globalLines) entry.globalLines.visible = showConstellations && showConstellationLines && isTarget;
      if (entry.humanLines) entry.humanLines.visible = showConstellations && showConstellationLines && isTarget;
      if (entry.sphericalLines) entry.sphericalLines.visible = showConstellations && showConstellationLines && isTarget;
      if (entry.globalLabel) entry.globalLabel.visible = showConstellations && showConstellationLabels && isTarget;
      if (entry.humanLabel) entry.humanLabel.visible = showConstellations && showConstellationLabels && isTarget;
      if (entry.sphericalLabel) entry.sphericalLabel.visible = showConstellations && showConstellationLabels && isTarget;
      if (entry.globalStars) entry.globalStars.visible = showConstellations && isTarget;
      if (entry.humanStars) entry.humanStars.visible = showConstellations && isTarget;
      if (entry.sphericalStars) entry.sphericalStars.visible = showConstellations && isTarget;
    });

    // Cintilação harmônica suave das estrelas (luz própria viva com pulsação estelar)
    if (time > 0) {
      if (this.sphericalHumanSparklePoints) {
        const mat = this.sphericalHumanSparklePoints.material as THREE.PointsMaterial;
        mat.opacity = (showSpaceBackground ? 0.80 : 0.0) + 0.18 * (Math.sin(time * 0.0035) * 0.5 + 0.5);
      }
      if (this.humanSparklePoints) {
        const mat = this.humanSparklePoints.material as THREE.PointsMaterial;
        mat.opacity = 0.80 + 0.18 * (Math.sin(time * 0.0035) * 0.5 + 0.5);
      }
      if (this.globalSparklePoints) {
        const mat = this.globalSparklePoints.material as THREE.PointsMaterial;
        mat.opacity = 0.82 + 0.16 * (Math.sin(time * 0.0028) * 0.5 + 0.5);
      }
    }

    // Sidereal Day Progress (23h 56m 04s period = 0.997269566 solar days)
    const epochDays = date.getTime() / (1000 * 60 * 60 * 24);
    const siderealDayProgress = (epochDays % 0.997269566) / 0.997269566;
    const siderealRotationAngle = -(siderealDayProgress * 2 * Math.PI);

    if (isHumanMode) {
      // 1. Activate Planar Mode Sky Firmament & Human Atmospheric Dome
      this.sphericalHumanGroup.visible = false;
      this.humanGroup.visible = false;
      this.humanAtmosphereGroup.visible = true;
      this.humanAtmosphereGroup.position.set(observerPos.x, observerPos.y, observerPos.z);
      this.humanAtmosphereGroup.quaternion.identity();

      // Atualiza os parâmetros do espalhamento atmosférico do luar (Rayleigh & Mie)
      if (this.humanAtmosphereMat) {
        if (moonWorldPos) {
          const mDir = new THREE.Vector3().subVectors(moonWorldPos, observerPos).normalize();
          this.humanAtmosphereMat.uniforms.uMoonDirection.value.copy(mDir);
        }
        this.humanAtmosphereMat.uniforms.uMoonLight.value = moonLightFactor;
        this.humanAtmosphereMat.uniforms.uMoonAltitude.value = (moonAltitudeDeg * Math.PI) / 180.0;
        this.humanAtmosphereMat.uniforms.uDaylight.value = daylightFactor;
        this.humanAtmosphereMat.uniforms.uTime.value = time * 0.001;
        this.humanAtmosphereMat.uniforms.uShowAtmosphereClouds.value = 0.0;

        if (sunWorldPos) {
          const sDir = new THREE.Vector3().subVectors(sunWorldPos, observerPos).normalize();
          this.humanAtmosphereMat.uniforms.uSunDirection.value.copy(sDir);
        }
      }

      // Daylight scattering completely conceals stars during the day (daylightFactor >= 0.10)
      // Stars emerge strictly during night or total solar eclipse
      const effectiveDaylight = daylightFactor * (1.0 - solarEclipseFactor * 0.94);
      const isVisibleAtNight = effectiveDaylight < 0.10;

      // No Modelo Planar (Teoria da Terra Plana):
      // A abóbada celeste é o domo estelar sobre todo o plano terrestre, centralizado no Polo Norte (0, 0, 0),
      // onde a Estrela Polaris fica fixa no centro do domo (0, 24.5, 0) acima do Polo Norte.
      // - Um observador em Belo Horizonte (Hemisfério Sul) vê Polaris em direção ao NORTE, baixa no horizonte norte.
      //   Polaris NUNCA fica no zênite (acima da cabeça) de quem está em Belo Horizonte. Acima de BH fica o Cruzeiro do Sul!
      // - Todos os corpos celestes (Estrelas, Sol e Lua) giram no MESMO sentido e no MESMO plano horizontal
      //   ao redor do eixo vertical central Y (eixo polar norte), 100% sincronizados sem rotações angulares oblíquas!
      this.globalGroup.visible = isVisibleAtNight;
      this.globalGroup.position.set(0, 0, 0);
      this.globalGroup.quaternion.identity();
      this.globalGroup.scale.set(1.0, 1.0, 1.0);

      this.globalVaultGroup.rotation.set(0, 0, 0);
      this.globalVaultGroup.rotation.y = siderealRotationAngle;
    } else {
      // 2. Activate Global Orbit Mode Galaxy Disc & Hide Human Vault
      this.humanGroup.visible = false;
      this.sphericalHumanGroup.visible = false;
      this.humanAtmosphereGroup.visible = false;
      this.globalGroup.visible = true;

      this.globalGroup.position.set(0, 0, 0);
      this.globalGroup.quaternion.identity();
      this.globalGroup.scale.set(1.0, 1.0, 1.0);

      this.globalVaultGroup.rotation.set(0, 0, 0);
      this.globalVaultGroup.rotation.y = siderealRotationAngle;
    }
  }

  /**
   * Dedicated Spherical Earth Human Observer Update:
   * - Aligns the Atmospheric Sky Dome (Rayleigh/Mie blue day sky, sunset, and navy moonlight)
   *   with the observer's spherical tangent plane (East, Up=Normal, South=-North).
   * - Aligns the Celestial Star Vault with the Earth's North Celestial Pole (so Polaris sits at altitude = Latitude!).
   */
  public updateSphericalHumanObserver(
    date: Date,
    daylightFactor: number,
    localSunDir: THREE.Vector3,
    localMoonDir: THREE.Vector3,
    observerPos: THREE.Vector3,
    tangentBasisQuat: THREE.Quaternion,
    celestialPoleQuat: THREE.Quaternion,
    time = 0,
    moonLightFactor = 0.5,
    moonAltitudeDeg = 30.0,
    showConstellations = false,
    showConstellationLines = true,
    showConstellationLabels = true,
    constellationLineColor: 'cyan' | 'gold' | 'white' | 'magenta' = 'cyan',
    constellationLineOpacity = 0.85,
    selectedConstellation: string | null = null
  ) {
    this.group.visible = true;
    this.globalGroup.visible = false;
    this.humanGroup.visible = false;

    if (time > 0 && this.sphericalHumanSparklePoints) {
      const mat = this.sphericalHumanSparklePoints.material as THREE.PointsMaterial;
      mat.opacity = 0.80 + 0.18 * (Math.sin(time * 0.0035) * 0.5 + 0.5);
    }

    this.humanAtmosphereGroup.visible = true;
    this.humanAtmosphereGroup.position.copy(observerPos);
    this.humanAtmosphereGroup.quaternion.copy(tangentBasisQuat);

    if (this.humanAtmosphereMat) {
      this.humanAtmosphereMat.uniforms.uSunDirection.value.copy(localSunDir);
      this.humanAtmosphereMat.uniforms.uMoonDirection.value.copy(localMoonDir);
      this.humanAtmosphereMat.uniforms.uDaylight.value = daylightFactor;
      this.humanAtmosphereMat.uniforms.uMoonLight.value = moonLightFactor;
      this.humanAtmosphereMat.uniforms.uMoonAltitude.value = (moonAltitudeDeg * Math.PI) / 180.0;
      this.humanAtmosphereMat.uniforms.uTime.value = time * 0.001;
      this.humanAtmosphereMat.uniforms.uShowAtmosphereClouds.value = 1.0;
    }

    if (this.sphericalConstellationsGroup) {
      this.sphericalConstellationsGroup.visible = showConstellations;
    }

    const COLOR_MAP: Record<string, number> = {
      cyan: 0x38bdf8,
      gold: 0xfbbf24,
      white: 0xf8fafc,
      magenta: 0xf472b6,
    };
    const colorHex = COLOR_MAP[constellationLineColor] ?? 0x38bdf8;
    const lineOpacity = THREE.MathUtils.clamp(constellationLineOpacity, 0.15, 1.0);

    const constKey = `${showConstellations}_${showConstellationLines}_${showConstellationLabels}_${selectedConstellation}_${constellationLineColor}_${lineOpacity}`;
    if (this.lastSphericalConstellationKey !== constKey) {
      this.lastSphericalConstellationKey = constKey;

      if (this.sphericalConstellationLineMat) {
        this.sphericalConstellationLineMat.color.setHex(colorHex);
        this.sphericalConstellationLineMat.opacity = lineOpacity;
      }
      if (this.sphericalConstellationLinesGroup) {
        this.sphericalConstellationLinesGroup.visible = showConstellations && showConstellationLines;
      }
      if (this.sphericalConstellationLabelsGroup) {
        this.sphericalConstellationLabelsGroup.visible = showConstellations && showConstellationLabels;
      }

      this.constellationItemMap.forEach((entry, id) => {
        const isTarget = selectedConstellation ? id === selectedConstellation : true;
        if (entry.sphericalLines) entry.sphericalLines.visible = showConstellations && showConstellationLines && isTarget;
        if (entry.sphericalLabel) entry.sphericalLabel.visible = showConstellations && showConstellationLabels && isTarget;
        if (entry.sphericalStars) entry.sphericalStars.visible = showConstellations && isTarget;
      });
    }

    const isVisibleAtNight = daylightFactor < 0.25;
    this.sphericalHumanGroup.visible = isVisibleAtNight;
    if (isVisibleAtNight) {
      this.sphericalHumanGroup.position.copy(observerPos);
      this.sphericalHumanGroup.scale.set(1.0, 1.0, 1.0);
      this.sphericalHumanGroup.quaternion.copy(celestialPoleQuat);

      const epochDays = date.getTime() / (1000 * 60 * 60 * 24);
      const siderealDayProgress = (epochDays % 0.997269566) / 0.997269566;
      this.sphericalHumanVaultGroup.rotation.set(0, -(siderealDayProgress * 2 * Math.PI), 0);
    }
  }

  public dispose() {
    this.group.traverse(obj => {
      if ((obj as THREE.Mesh).geometry) {
        (obj as THREE.Mesh).geometry.dispose();
      }
      if ((obj as THREE.Mesh).material) {
        const mat = (obj as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach(m => m.dispose());
        else mat.dispose();
      }
    });
  }
}
