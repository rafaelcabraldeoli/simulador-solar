import * as THREE from 'three';
import { LayerSettings, AtmosphereLayerId } from '../../types';

export interface GlobeAtmosphereLayersSystem3D {
  group: THREE.Group;
  update: (
    deltaSeconds: number,
    nowSec: number,
    sunWorldPos: THREE.Vector3,
    layers: LayerSettings,
    showAuroraOverride: boolean,
    showNasaCloudsOverride: boolean,
    showStrataShellsOverride: boolean,
    showSatelliteOrbitsOverride: boolean,
    isHumanSurface: boolean,
    camera?: THREE.Camera
  ) => void;
  dispose: () => void;
}

/**
 * Generates an ultra-detailed NASA Blue Marble / MODIS-inspired global cloud cover texture
 * in Equirectangular projection (2048x1024), featuring delicate wispy filamentary weather fronts,
 * comma clouds, tropical cyclones, and trade-wind cumulus bands just like NASA Eyes on the Solar System.
 */
export function generateNasaGlobalCloudsTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, width, height);

  let seed = 9876543;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const drawWispyCloudCell = (x: number, y: number, rx: number, ry: number, alpha: number, angle = 0) => {
    const drawAt = (cx: number) => {
      ctx.save();
      ctx.translate(cx, y);
      ctx.rotate(angle);
      ctx.scale(1, ry / Math.max(1, rx));
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      grad.addColorStop(0.0, `rgba(255, 255, 255, ${alpha})`);
      grad.addColorStop(0.40, `rgba(250, 253, 255, ${alpha * 0.72})`);
      grad.addColorStop(0.75, `rgba(242, 249, 255, ${alpha * 0.26})`);
      grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    drawAt(x);
    if (x - rx < 0) drawAt(x + width);
    if (x + rx > width) drawAt(x - width);
  };

  // 1. Delicate Sweeping Frontal Filaments (NASA Eyes on the Solar System signature look)
  const drawSweepingWeatherFront = (
    startX: number,
    startY: number,
    dx: number,
    dy: number,
    len: number,
    arch: number,
    baseAlpha: number
  ) => {
    const steps = 68;
    for (let s = 0; s < steps; s++) {
      const t = s / (steps - 1);
      const curve = Math.sin(t * Math.PI) * arch;
      const cx = (startX + dx * len * t + width) % width;
      const cy = startY + dy * len * t + curve;
      const widthBand = (1.0 - t * 0.5) * 20;

      for (let k = 0; k < 6; k++) {
        const px = (cx + (rand() - 0.5) * widthBand * 2.1 + width) % width;
        const py = cy + (rand() - 0.5) * widthBand * 0.9;
        const rx = 8 + rand() * 24 * (1.1 - t * 0.45);
        const ry = 3 + rand() * 9;
        const localAngle = Math.atan2(dy + (Math.cos(t * Math.PI) * arch) / len, dx) + (rand() - 0.5) * 0.25;
        drawWispyCloudCell(px, py, rx, ry, baseAlpha * (0.35 + rand() * 0.65) * Math.sin(t * Math.PI), localAngle);
      }
    }
  };

  // North America / Atlantic / Pacific sweeping frontal streaks
  for (let i = 0; i < 26; i++) {
    const sx = rand() * width;
    const sy = height * (0.14 + rand() * 0.24);
    drawSweepingWeatherFront(sx, sy, 0.9, -0.35, 220 + rand() * 240, 26 + rand() * 38, 0.45);
  }

  // Southern Ocean & South America / South Atlantic frontal streaks
  for (let i = 0; i < 32; i++) {
    const sx = (i / 32) * width + (rand() - 0.5) * 50;
    const sy = height * (0.64 + rand() * 0.22);
    drawSweepingWeatherFront(sx, sy, 0.92, 0.34, 240 + rand() * 240, -28 - rand() * 38, 0.48);
  }

  // 2. Intertropical Convergence Zone (ITCZ) - Fine granular equatorial convective clusters
  const eqY = height * 0.47;
  for (let i = 0; i < 680; i++) {
    const u = i / 680;
    const x = u * width + (rand() - 0.5) * 24;
    const waveY =
      Math.sin(u * Math.PI * 6.0) * 24 +
      Math.cos(u * Math.PI * 14.0) * 12 +
      (rand() - 0.5) * 32;
    const y = eqY + waveY;
    const rx = 7 + rand() * 22;
    const ry = 4 + rand() * 11;
    drawWispyCloudCell(x, y, rx, ry, 0.22 + rand() * 0.42, (rand() - 0.5) * 0.6);
  }

  // 3. Spiral Cyclonic Systems (Comma lows & Tropical cyclones)
  const drawSpiralVortex = (cx: number, cy: number, maxR: number, chirality: number, strength: number) => {
    const arms = 4;
    for (let arm = 0; arm < arms; arm++) {
      const offset = (arm / arms) * Math.PI * 2;
      for (let i = 0; i < 48; i++) {
        const t = i / 47;
        const r = 4 + t * maxR;
        const theta = offset + chirality * t * Math.PI * 2.5;
        const px = (cx + Math.cos(theta) * r * 1.3 + width) % width;
        const py = cy + Math.sin(theta) * r;
        const rx = (5 + (1.0 - t) * 14) * (0.75 + rand() * 0.5);
        const ry = rx * 0.45;
        const alpha = (1.0 - t * 0.68) * strength * (0.3 + rand() * 0.45);
        drawWispyCloudCell(px, py, rx, ry, alpha, theta + Math.PI / 2);
      }
    }
  };

  drawSpiralVortex(width * 0.29, height * 0.23, 82, 1, 0.85);
  drawSpiralVortex(width * 0.79, height * 0.30, 68, 1, 0.90);
  drawSpiralVortex(width * 0.16, height * 0.34, 54, 1, 0.76);
  drawSpiralVortex(width * 0.66, height * 0.66, 78, -1, 0.82);
  drawSpiralVortex(width * 0.42, height * 0.76, 92, -1, 0.88);
  drawSpiralVortex(width * 0.86, height * 0.74, 88, -1, 0.85);

  // 4. Fine Trade-Wind Cumulus & Marine Stratocumulus Fields
  for (let i = 0; i < 950; i++) {
    const x = rand() * width;
    const y = height * (0.12 + rand() * 0.76);
    const rx = 5 + rand() * 16;
    const ry = 3 + rand() * 8;
    drawWispyCloudCell(x, y, rx, ry, 0.12 + rand() * 0.25, (rand() - 0.5) * 0.9);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Creates the NASA Eyes on the Solar System style Earth Atmosphere:
 * 1. High-definition NASA Global Clouds (r = 1.012)
 * 2. Delicate, Crisp White/Silver-Blue NASA Satellite Orbital Trajectories (Hubble, ISS, Landsat-8, Aqua, Aura, Sentinel-6B, CYGNSS, Jason-3)
 * 3. Polar Auroras (Aurora Borealis & Aurora Australis) in the polar regions
 * 4. Optional 5 Concentric Spherical Atmospheric Layers (Troposphere -> Exosphere) when the user inspects the 5 layers
 */
export function createGlobeAtmosphereLayers3D(globeRadius = 1.0): GlobeAtmosphereLayersSystem3D {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'GlobeAtmosphereLayers3D_Root';

  const createBadgeSprite = (text: string, borderHex: string, bgHex: string): THREE.Sprite => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 88;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = bgHex;
    ctx.strokeStyle = borderHex;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 68, 18);
    ctx.fill();
    ctx.stroke();

    ctx.font = '600 25px "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 44);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      sizeAttenuation: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(0.10, 0.019, 1);
    return sprite;
  };

  // =========================================================================
  // 1. CAMADA DE NUVENS GLOBAIS DA NASA (MODIS / BLUE MARBLE CLOUDS)
  // =========================================================================
  const nasaCloudsTex = generateNasaGlobalCloudsTexture();

  const cloudsUniforms = {
    uCloudsMap: { value: nasaCloudsTex },
    uSunWorldPosition: { value: new THREE.Vector3(0, 0, 0) },
    uSunLightEnabled: { value: 1.0 },
    uTime: { value: 0.0 },
    uOpacity: { value: 0.90 },
  };

  const cloudsGeo = new THREE.SphereGeometry(globeRadius * 1.012, 128, 128);
  const cloudsMat = new THREE.ShaderMaterial({
    uniforms: cloudsUniforms,
    transparent: true,
    depthWrite: false,
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
      uniform sampler2D uCloudsMap;
      uniform vec3 uSunWorldPosition;
      uniform float uSunLightEnabled;
      uniform float uTime;
      uniform float uOpacity;

      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;

      void main() {
        vec2 animatedUv = vec2(fract(vUv.x - uTime * 0.0018), vUv.y);
        vec4 cloudSample = texture2D(uCloudsMap, animatedUv);
        float density = cloudSample.a;
        if (density < 0.015) discard;

        vec3 N = normalize(vWorldNormal);
        vec3 L = normalize(uSunWorldPosition - vWorldPosition);
        vec3 V = normalize(cameraPosition - vWorldPosition);

        float ndotl = dot(N, L);
        float dayFactor = smoothstep(-0.08, 0.22, ndotl) * uSunLightEnabled;
        float twilightFactor = smoothstep(-0.12, 0.04, ndotl) * (1.0 - smoothstep(0.04, 0.25, ndotl)) * uSunLightEnabled;

        // Pure crisp white NASA Blue Marble clouds on day side, soft atmospheric blue-white near limb
        vec3 dayCloudCol = vec3(0.98, 0.99, 1.0) * (0.42 + 0.68 * max(0.0, ndotl));
        vec3 sunsetCloudCol = vec3(0.95, 0.65, 0.45) * 0.85;
        vec3 nightCloudCol = vec3(0.04, 0.07, 0.14) * 0.22;

        vec3 col = mix(nightCloudCol, dayCloudCol, dayFactor);
        col = mix(col, sunsetCloudCol, twilightFactor * 0.45);

        float rim = pow(1.0 - max(0.0, dot(N, V)), 2.6);
        col += vec3(0.55, 0.78, 1.0) * rim * dayFactor * 0.32;

        float alpha = density * uOpacity * (0.18 + 0.82 * max(dayFactor, twilightFactor * 0.6));
        gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.95));
      }
    `,
  });
  const nasaCloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
  nasaCloudsMesh.name = 'NASA_BlueMarble_Clouds';
  rootGroup.add(nasaCloudsMesh);

  // =========================================================================
  // 2. MALHA DE ÓRBITAS DE SATÉLITES DA NASA (ESTILO "EYES ON THE SOLAR SYSTEM")
  // =========================================================================
  // Crisp, ultra-thin white/silver-blue orbital rings (ISS, Hubble, Landsat 8, Aqua, Aura, Sentinel-6B, Jason-3, CYGNSS)
  const nasaSatellitesGroup = new THREE.Group();
  nasaSatellitesGroup.name = 'NASA_Eyes_Satellites_Group';

  interface NasaSatTrack {
    name: string;
    radius: number;
    inclinationDeg: number;
    raanDeg: number;
    speed: number;
    phase: number;
    marker: THREE.Mesh;
    label: THREE.Sprite;
    orbitPlane: THREE.Group;
  }

  const satSpecs = [
    { name: 'Estação Espacial Internacional (ISS)', r: 1.065, inc: 51.6, raan: 18, speed: 0.42, phase: 0.4, opacity: 0.72 },
    { name: 'Telescópio Espacial Hubble', r: 1.082, inc: 28.5, raan: 74, speed: 0.38, phase: 1.8, opacity: 0.55 },
    { name: 'Landsat 8', r: 1.105, inc: 98.2, raan: 128, speed: 0.34, phase: 2.9, opacity: 0.62 },
    { name: 'Aqua', r: 1.112, inc: 98.2, raan: 148, speed: 0.33, phase: 4.1, opacity: 0.58 },
    { name: 'Aura', r: 1.118, inc: 98.2, raan: 162, speed: 0.32, phase: 0.9, opacity: 0.52 },
    { name: 'Sentinel-6B', r: 1.155, inc: 66.0, raan: 215, speed: 0.28, phase: 3.5, opacity: 0.55 },
    { name: 'Jason-3', r: 1.162, inc: 66.0, raan: 235, speed: 0.27, phase: 5.1, opacity: 0.48 },
    { name: 'CYGNSS', r: 1.075, inc: 35.0, raan: 310, speed: 0.40, phase: 2.2, opacity: 0.48 },
  ];

  const nasaSatTracks: NasaSatTrack[] = [];

  satSpecs.forEach((s) => {
    const orbitPlane = new THREE.Group();
    const qRaan = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (s.raan * Math.PI) / 180);
    const qInc = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), (s.inc * Math.PI) / 180);
    orbitPlane.quaternion.multiplyQuaternions(qRaan, qInc);

    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * s.r, 0, Math.sin(a) * s.r));
    }
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: s.opacity,
    });
    const orbitLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat);
    orbitPlane.add(orbitLine);

    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.012, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    orbitPlane.add(marker);

    const label = createBadgeSprite(s.name, 'rgba(148, 163, 184, 0.6)', 'rgba(15, 23, 42, 0.82)');
    orbitPlane.add(label);

    nasaSatellitesGroup.add(orbitPlane);

    nasaSatTracks.push({
      name: s.name,
      radius: s.r,
      inclinationDeg: s.inc,
      raanDeg: s.raan,
      speed: s.speed,
      phase: s.phase,
      marker,
      label,
      orbitPlane,
    });
  });

  rootGroup.add(nasaSatellitesGroup);

  // =========================================================================
  // 3. AURORA BOREAL (POLO NORTE) & AURORA AUSTRAL (POLO SUL) EM 3D
  // =========================================================================
  const auroraGroup = new THREE.Group();
  auroraGroup.name = 'Globe_Polar_Auroras_Group';

  const auroraUniforms = {
    uTime: { value: 0.0 },
    uSunWorldPosition: { value: new THREE.Vector3(0, 0, 0) },
    uActive: { value: 1.0 },
  };

  const buildAuroralOvalCurtain = (isNorth: boolean, latCenterDeg: number, rBase: number, curtainHeight: number): THREE.Mesh => {
    const radialSegs = 128;
    const heightSegs = 16;
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    const sign = isNorth ? 1.0 : -1.0;
    const baseLatRad = (latCenterDeg * Math.PI) / 180;

    for (let iy = 0; iy <= heightSegs; iy++) {
      const v = iy / heightSegs;
      const r = rBase + v * curtainHeight;

      for (let ix = 0; ix <= radialSegs; ix++) {
        const u = ix / radialSegs;
        const lon = u * Math.PI * 2;

        const ovalWarp =
          Math.sin(lon * 3.0) * 0.028 +
          Math.cos(lon * 5.0) * 0.015;
        const lat = sign * (baseLatRad + ovalWarp);

        const y = r * Math.sin(lat);
        const rHoriz = r * Math.cos(lat);
        const x = rHoriz * Math.sin(lon);
        const z = rHoriz * Math.cos(lon);

        positions.push(x, y, z);
        uvs.push(u, v);

        const nx = Math.cos(lat) * Math.sin(lon);
        const ny = Math.sin(lat);
        const nz = Math.cos(lat) * Math.cos(lon);
        normals.push(nx, ny, nz);
      }
    }

    for (let iy = 0; iy < heightSegs; iy++) {
      for (let ix = 0; ix < radialSegs; ix++) {
        const a = iy * (radialSegs + 1) + ix;
        const b = a + 1;
        const c = (iy + 1) * (radialSegs + 1) + ix;
        const d = c + 1;
        indices.push(a, b, d);
        indices.push(a, d, c);
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setIndex(indices);

    const mat = new THREE.ShaderMaterial({
      uniforms: auroraUniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying vec3 vWorldNormal;

        void main() {
          vUv = uv;
          vec3 p = position;
          float angle = uv.x * 6.2831853;
          float wave1 = sin(angle * 7.0 + uTime * 2.0 + uv.y * 2.5) * 0.012;
          float wave2 = cos(angle * 13.0 - uTime * 1.5) * 0.008;
          vec3 radialDir = normalize(vec3(p.x, 0.0, p.z));
          p += radialDir * (wave1 + wave2) * (0.3 + 0.7 * uv.y);

          vec4 wp = modelMatrix * vec4(p, 1.0);
          vWorldPos = wp.xyz;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uSunWorldPosition;
        uniform float uActive;
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying vec3 vWorldNormal;

        void main() {
          if (uActive < 0.01) discard;

          float lonAngle = vUv.x * 6.2831853;
          float ray1 = sin(lonAngle * 28.0 + uTime * 2.5) * 0.5 + 0.5;
          float ray2 = sin(lonAngle * 52.0 - uTime * 3.2 + vUv.y * 3.0) * 0.5 + 0.5;
          float rayPattern = pow(ray1 * 0.55 + ray2 * 0.45, 1.8);

          vec3 lowerEmerald = vec3(0.05, 0.98, 0.58);
          vec3 midCyan = vec3(0.12, 0.90, 0.85);
          vec3 upperViolet = vec3(0.75, 0.25, 0.95);

          vec3 col = mix(lowerEmerald, midCyan, smoothstep(0.15, 0.55, vUv.y));
          col = mix(col, upperViolet, smoothstep(0.60, 0.95, vUv.y));

          float verticalProfile = smoothstep(0.0, 0.16, vUv.y) * pow(1.0 - vUv.y, 1.35);

          vec3 L = normalize(uSunWorldPosition - vWorldPos);
          float sunDot = dot(normalize(vWorldNormal), L);
          float nightBoost = mix(0.95, 0.42, smoothstep(-0.15, 0.35, sunDot));

          float alpha = verticalProfile * (0.22 + 0.65 * rayPattern) * nightBoost * uActive;
          gl_FragColor = vec4(col * (0.85 + 0.45 * rayPattern), clamp(alpha, 0.0, 0.82));
        }
      `,
    });

    return new THREE.Mesh(geo, mat);
  };

  auroraGroup.add(buildAuroralOvalCurtain(true, 69.5, globeRadius * 1.022, 0.065));
  auroraGroup.add(buildAuroralOvalCurtain(false, 69.5, globeRadius * 1.022, 0.065));

  const auroraBorealLabel = createBadgeSprite(
    '✨ Aurora Boreal (Termosfera • 100 a 300 km)',
    '#10b981',
    'rgba(6, 78, 59, 0.90)'
  );
  auroraBorealLabel.position.set(0, globeRadius * 1.12, 0.28);
  auroraGroup.add(auroraBorealLabel);

  const auroraAustralLabel = createBadgeSprite(
    '✨ Aurora Austral (Polo Sul • 100 a 300 km)',
    '#10b981',
    'rgba(6, 78, 59, 0.90)'
  );
  auroraAustralLabel.position.set(0, -globeRadius * 1.12, 0.28);
  auroraGroup.add(auroraAustralLabel);

  rootGroup.add(auroraGroup);

  // =========================================================================
  // 4. AS 5 CAMADAS ATMOSFÉRICAS ESFÉRICAS CONCÊNTRICAS (MODO RAIO-X / INSPEÇÃO)
  // =========================================================================
  interface SphericalShellEntry {
    id: AtmosphereLayerId;
    group: THREE.Group;
    shellMat: THREE.ShaderMaterial;
    equatorRing: THREE.Line;
    labelSprite: THREE.Sprite;
  }

  const strataSpecs: {
    id: AtmosphereLayerId;
    radius: number;
    color: THREE.Color;
    baseOpacity: number;
    label: string;
    labelAngle: number;
  }[] = [
    {
      id: 'troposphere',
      radius: globeRadius * 1.045,
      color: new THREE.Color(0x38bdf8),
      baseOpacity: 0.16,
      label: '1. Troposfera • 0 a 10 km (Nuvens & Clima)',
      labelAngle: 0.24,
    },
    {
      id: 'stratosphere',
      radius: globeRadius * 1.10,
      color: new THREE.Color(0x60a5fa),
      baseOpacity: 0.14,
      label: '2. Estratosfera • 10 a 50 km (Ozônio O₃ & Jatos)',
      labelAngle: 0.50,
    },
    {
      id: 'mesosphere',
      radius: globeRadius * 1.17,
      color: new THREE.Color(0x818cf8),
      baseOpacity: 0.12,
      label: '3. Mesosfera • 50 a 85 km (Meteoros • -100°C)',
      labelAngle: 0.76,
    },
    {
      id: 'thermosphere',
      radius: globeRadius * 1.26,
      color: new THREE.Color(0xc084fc),
      baseOpacity: 0.10,
      label: '4. Termosfera • 85 a 500 km (Auroras & ISS)',
      labelAngle: 1.02,
    },
    {
      id: 'exosphere',
      radius: globeRadius * 1.38,
      color: new THREE.Color(0xe879f9),
      baseOpacity: 0.08,
      label: '5. Exosfera • 500 a 10.000 km (Satélites)',
      labelAngle: 1.26,
    },
  ];

  const sphericalShells: SphericalShellEntry[] = [];

  strataSpecs.forEach((spec) => {
    const layerGroup = new THREE.Group();
    layerGroup.name = `Globe_Layer_${spec.id}`;

    const shellGeo = new THREE.SphereGeometry(spec.radius, 64, 48, 0, Math.PI * 1.65, 0, Math.PI);
    const shellMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: spec.color },
        uBaseOpacity: { value: spec.baseOpacity },
        uGlobalOpacity: { value: 0.85 },
        uIsSelected: { value: 0.0 },
        uTime: { value: 0.0 },
        uSunWorldPosition: { value: new THREE.Vector3(0, 0, 0) },
      },
      vertexShader: `
        varying vec3 vWorldNormal;
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uBaseOpacity;
        uniform float uGlobalOpacity;
        uniform float uIsSelected;
        uniform float uTime;
        uniform vec3 uSunWorldPosition;

        varying vec3 vWorldNormal;
        varying vec3 vWorldPos;

        void main() {
          vec3 V = normalize(cameraPosition - vWorldPos);
          vec3 N = normalize(vWorldNormal);
          float fresnel = pow(1.0 - abs(dot(V, N)), 2.4);

          vec3 L = normalize(uSunWorldPosition - vWorldPos);
          float sunFactor = 0.55 + 0.45 * max(0.0, dot(N, L));

          float pulse = uIsSelected > 0.5 ? (0.22 + 0.12 * sin(uTime * 4.0)) : 0.0;
          float alpha = (uBaseOpacity * fresnel + pulse) * uGlobalOpacity;

          vec3 col = uColor * sunFactor + vec3(pulse * 0.25);
          gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.78));
        }
      `,
    });

    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    layerGroup.add(shellMesh);

    const eqPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      eqPts.push(new THREE.Vector3(Math.cos(a) * spec.radius, 0, Math.sin(a) * spec.radius));
    }
    const ringMat = new THREE.LineBasicMaterial({
      color: spec.color,
      transparent: true,
      opacity: 0.38,
    });
    const equatorRing = new THREE.Line(new THREE.BufferGeometry().setFromPoints(eqPts), ringMat);
    layerGroup.add(equatorRing);

    const labelSprite = createBadgeSprite(
      spec.label,
      `#${spec.color.getHexString()}`,
      'rgba(2, 6, 23, 0.88)'
    );
    labelSprite.position.set(
      Math.cos(spec.labelAngle) * spec.radius,
      Math.sin(spec.labelAngle) * spec.radius,
      0
    );
    layerGroup.add(labelSprite);

    rootGroup.add(layerGroup);

    sphericalShells.push({
      id: spec.id,
      group: layerGroup,
      shellMat,
      equatorRing,
      labelSprite,
    });
  });

  // =========================================================================
  // 5. UPDATE LOOP
  // =========================================================================
  const update = (
    deltaSeconds: number,
    nowSec: number,
    sunWorldPos: THREE.Vector3,
    layers: LayerSettings,
    showAuroraOverride: boolean,
    showNasaCloudsOverride: boolean,
    showStrataShellsOverride: boolean,
    showSatelliteOrbitsOverride: boolean,
    isHumanSurface: boolean,
    _camera?: THREE.Camera
  ) => {
    rootGroup.visible = !isHumanSurface;
    if (isHumanSurface) return;

    const showLabels = layers.showAtmosphereLabels === true;

    // 1. Update NASA Blue Marble Global Clouds
    const cloudsVisible = showNasaCloudsOverride;
    nasaCloudsMesh.visible = cloudsVisible;
    if (cloudsVisible) {
      cloudsUniforms.uSunWorldPosition.value.copy(sunWorldPos);
      cloudsUniforms.uTime.value = nowSec;
    }

    // 2. Update NASA Eyes Satellite Orbits (ISS, Hubble, Landsat 8, Aqua, Aura, Sentinel-6B, Jason-3)
    nasaSatellitesGroup.visible = showSatelliteOrbitsOverride;
    if (showSatelliteOrbitsOverride) {
      nasaSatTracks.forEach((sat) => {
        sat.phase += deltaSeconds * sat.speed;
        const x = Math.cos(sat.phase) * sat.radius;
        const z = Math.sin(sat.phase) * sat.radius;
        sat.marker.position.set(x, 0, z);
        sat.label.position.set(x, 0.045, z);
        sat.label.visible = showLabels;
      });
    }

    // 3. Update Polar Auroras (Aurora Borealis & Aurora Australis)
    const aurorasVisible = showAuroraOverride && (layers.showThermosphere !== false);
    auroraGroup.visible = aurorasVisible;
    if (aurorasVisible) {
      auroraUniforms.uTime.value = nowSec;
      auroraUniforms.uSunWorldPosition.value.copy(sunWorldPos);
      auroraBorealLabel.visible = showLabels;
      auroraAustralLabel.visible = showLabels;
    }

    // 4. Update 5 Concentric Spherical Atmospheric Shells (Diagnostic Cutaway View)
    const selectedId = layers.selectedAtmosphereLayer;
    const masterShellsVisible = (showStrataShellsOverride || selectedId !== null) && layers.showAtmosphere;
    const globalOpacity = layers.atmosphereOpacity ?? 0.85;

    sphericalShells.forEach((shell) => {
      let enabled = masterShellsVisible;
      if (enabled) {
        if (shell.id === 'troposphere') enabled = layers.showTroposphere;
        else if (shell.id === 'stratosphere') enabled = layers.showStratosphere;
        else if (shell.id === 'mesosphere') enabled = layers.showMesosphere;
        else if (shell.id === 'thermosphere') enabled = layers.showThermosphere;
        else if (shell.id === 'exosphere') enabled = layers.showExosphere;
      }

      shell.group.visible = enabled;
      if (!enabled) return;

      const isSelected = selectedId === shell.id;
      shell.shellMat.uniforms.uTime.value = nowSec;
      shell.shellMat.uniforms.uSunWorldPosition.value.copy(sunWorldPos);
      shell.shellMat.uniforms.uIsSelected.value = isSelected ? 1.0 : 0.0;
      shell.shellMat.uniforms.uGlobalOpacity.value = selectedId
        ? isSelected
          ? globalOpacity * 1.35
          : globalOpacity * 0.35
        : globalOpacity;

      shell.labelSprite.visible = showLabels || isSelected;
    });
  };

  const dispose = () => {
    rootGroup.traverse((obj: any) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m: any) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    nasaCloudsTex.dispose();
  };

  return {
    group: rootGroup,
    update,
    dispose,
  };
}
