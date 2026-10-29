import * as THREE from 'three';
import { LayerSettings, AtmosphereLayerId } from '../../types';
import { ATMOSPHERIC_LAYERS } from '../../data/atmosphericLayers';

export interface AtmosphereLayersSystem3D {
  group: THREE.Group;
  update: (
    deltaSeconds: number,
    sunPos: THREE.Vector3,
    moonPos: THREE.Vector3,
    layers: LayerSettings,
    camera?: THREE.Camera,
    isHuman?: boolean
  ) => void;
  dispose: () => void;
}

// 3D Altitude Mapping:
// Earth Surface = Y 0.05
// Troposfera (0 - 10 km)   => Y 0.05 to 0.90
// Estratosfera (10 - 50 km) => Y 0.90 to 2.30  (Ozônio @ Y 1.55, Avião @ Y 1.02)
// Mesosfera (50 - 85 km)   => Y 2.30 to 3.90  (Meteoros 85km -> 50km)
// Termosfera (85 - 500 km) => Y 3.90 to 7.20  (Auroras @ Y 4.4 - 5.6, ISS @ Y 6.5)
// Exosfera (500 - 10k km)  => Y 7.20 to 11.50 (GPS Satélite @ Y 10.2)

interface LayerShellMesh {
  id: AtmosphereLayerId;
  group: THREE.Group;
  volumeMesh: THREE.Mesh;
  boundaryRing: THREE.LineSegments;
  labelSprite: THREE.Sprite;
  yMin: number;
  yMax: number;
  mat: THREE.ShaderMaterial;
}

export function createAtmosphereLayers3D(scene: THREE.Scene): AtmosphereLayersSystem3D {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'AtmosphereLayers3D_Root';

  const discRadius = 46.0;

  // -------------------------------------------------------------
  // 1. LAYER STRATA CONFIGURATION & PROCEDURAL VOLUMES
  // -------------------------------------------------------------
  const strataConfigs: {
    id: AtmosphereLayerId;
    name: string;
    yMin: number;
    yMax: number;
    color: THREE.Color;
    baseOpacity: number;
    labelKm: string;
  }[] = [
    {
      id: 'troposphere',
      name: 'Troposfera (0-10 km)',
      yMin: 0.05,
      yMax: 0.90,
      color: new THREE.Color(0x1d4ed8), // Deep Royal Blue
      baseOpacity: 0.24,
      labelKm: 'Troposfera • 0 a 10 km',
    },
    {
      id: 'stratosphere',
      name: 'Estratosfera (10-50 km)',
      yMin: 0.90,
      yMax: 2.30,
      color: new THREE.Color(0x2563eb), // Sapphire Blue
      baseOpacity: 0.20,
      labelKm: 'Estratosfera • 10 a 50 km',
    },
    {
      id: 'mesosphere',
      name: 'Mesosfera (50-85 km)',
      yMin: 2.30,
      yMax: 3.90,
      color: new THREE.Color(0x3b82f6), // Cobalt Blue
      baseOpacity: 0.17,
      labelKm: 'Mesosfera • 50 a 85 km (-100°C)',
    },
    {
      id: 'thermosphere',
      name: 'Termosfera (85-500 km)',
      yMin: 3.90,
      yMax: 7.20,
      color: new THREE.Color(0x4f46e5), // Deep Indigo-Blue
      baseOpacity: 0.14,
      labelKm: 'Termosfera • 85 a 500 km (+1500°C)',
    },
    {
      id: 'exosphere',
      name: 'Exosfera (500-10.000 km)',
      yMin: 7.20,
      yMax: 11.50,
      color: new THREE.Color(0x6366f1), // Cosmic Indigo-Violet
      baseOpacity: 0.10,
      labelKm: 'Exosfera • 500 a 10.000 km (Espaço)',
    },
  ];

  // Helper for generating text sprites
  const createTextBadge = (text: string, colorHex: string, bgHex: string): THREE.Sprite => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Rounded pill
    ctx.fillStyle = bgHex;
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(8, 16, 496, 96, 24);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.font = 'bold 36px "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(6.5, 1.625, 1.0);
    return sprite;
  };

  const layerShells: LayerShellMesh[] = [];

  strataConfigs.forEach((cfg) => {
    const layerGroup = new THREE.Group();
    layerGroup.name = `Layer_${cfg.id}`;

    const height = cfg.yMax - cfg.yMin;
    const yCenter = (cfg.yMin + cfg.yMax) / 2;

    // Open cylinder representing atmospheric shell volume
    const cylGeo = new THREE.CylinderGeometry(discRadius, discRadius, height, 64, 4, true);

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: cfg.color },
        uBaseOpacity: { value: cfg.baseOpacity },
        uGlobalOpacity: { value: 1.0 },
        uIsSelected: { value: 0.0 },
        uSunPos: { value: new THREE.Vector3(0, 10, 0) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uBaseOpacity;
        uniform float uGlobalOpacity;
        uniform float uIsSelected;
        uniform float uTime;
        uniform vec3 uSunPos;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying vec2 vUv;

        void main() {
          // Atmospheric limb Fresnel edge glow
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float fresnel = 1.0 - abs(dot(viewDir, vNormal));
          fresnel = pow(fresnel, 2.2);

          // Sunlight day-side illumination factor
          vec3 sunDir = normalize(uSunPos - vWorldPos);
          float sunDot = max(0.1, dot(vNormal, sunDir) * 0.5 + 0.5);

          // Soft vertical gradient from bottom to top
          float vertFade = sin(vUv.y * 3.14159);

          // Pulse highlight if selected
          float pulse = uIsSelected > 0.5 ? 0.35 + 0.15 * sin(uTime * 4.0) : 0.0;
          float alpha = (uBaseOpacity * (0.3 + 0.7 * fresnel) * (0.6 + 0.4 * vertFade) + pulse) * uGlobalOpacity;

          vec3 finalColor = uColor * (0.8 + 0.4 * sunDot) + vec3(pulse * 0.3);
          gl_FragColor = vec4(finalColor, clamp(alpha, 0.0, 0.95));
        }
      `,
    });

    const mesh = new THREE.Mesh(cylGeo, mat);
    mesh.position.y = yCenter;
    layerGroup.add(mesh);

    // Boundary ring line at top edge of the layer
    const ringRadius = discRadius;
    const ringSegments = 128;
    const ringPositions = new Float32Array((ringSegments + 1) * 3);
    for (let i = 0; i <= ringSegments; i++) {
      const theta = (i / ringSegments) * Math.PI * 2;
      ringPositions[i * 3] = ringRadius * Math.cos(theta);
      ringPositions[i * 3 + 1] = 0;
      ringPositions[i * 3 + 2] = ringRadius * Math.sin(theta);
    }
    const ringGeo = new THREE.BufferGeometry();
    ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
    const ringMat = new THREE.LineBasicMaterial({
      color: cfg.color,
      transparent: true,
      opacity: 0.45,
    });
    const boundaryLine = new THREE.Line(ringGeo, ringMat);
    boundaryLine.position.y = cfg.yMax;
    boundaryLine.visible = false;
    layerGroup.add(boundaryLine);

    // Floating text label sprite on the edge of the stratum
    const labelSprite = createTextBadge(
      cfg.labelKm,
      `#${cfg.color.getHexString()}`,
      'rgba(2, 6, 23, 0.85)'
    );
    labelSprite.position.set(discRadius * 0.96, cfg.yMax, discRadius * 0.28);
    layerGroup.add(labelSprite);

    rootGroup.add(layerGroup);

    layerShells.push({
      id: cfg.id,
      group: layerGroup,
      volumeMesh: mesh,
      boundaryRing: boundaryLine as any,
      labelSprite,
      yMin: cfg.yMin,
      yMax: cfg.yMax,
      mat,
    });
  });

  // -------------------------------------------------------------
  // 2. KEY ATMOSPHERIC OBJECTS: ESTRATOSFERA
  // -------------------------------------------------------------
  // A) Camada de Ozônio (O3) - Soft glowing turquoise/golden toroidal stratum (Y 1.45 to 1.70, ~25 km)
  const ozoneGroup = new THREE.Group();
  ozoneGroup.name = 'OzoneLayer_Group';

  const ozoneGeo = new THREE.RingGeometry(2.0, discRadius * 0.98, 96, 8);
  ozoneGeo.rotateX(-Math.PI / 2);
  const ozoneMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uSunPos: { value: new THREE.Vector3(0, 10, 0) },
      uActive: { value: 1.0 },
    },
    vertexShader: `
      varying vec3 vWorldPos;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uSunPos;
      uniform float uActive;
      varying vec3 vWorldPos;
      varying vec2 vUv;

      void main() {
        if (uActive < 0.01) discard;
        float distToCenter = length(vWorldPos.xz);
        float rFrac = distToCenter / 45.0;
        
        // Solar UV absorption shimmer (deep sapphire-azure blue sheen instead of greenish turquoise)
        vec3 ozoneColor = vec3(0.08, 0.42, 0.96); // Rich Sapphire Blue
        float distToSun = length(vWorldPos.xz - uSunPos.xz);
        float solarGlow = clamp(1.0 - (distToSun / 30.0), 0.0, 1.0);
        vec3 uvAbsorptionGlow = vec3(0.28, 0.65, 1.0) * pow(solarGlow, 1.8) * 0.55;

        float ripple = sin(rFrac * 24.0 - uTime * 1.5) * 0.06;
        float alpha = (0.14 + ripple + solarGlow * 0.14) * smoothstep(0.0, 0.2, rFrac) * smoothstep(1.0, 0.85, rFrac);

        gl_FragColor = vec4(ozoneColor + uvAbsorptionGlow, clamp(alpha, 0.0, 0.58));
      }
    `,
  });
  const ozoneMesh = new THREE.Mesh(ozoneGeo, ozoneMat);
  ozoneMesh.position.y = 1.55; // 25 km altitude in 3D
  ozoneGroup.add(ozoneMesh);

  // Ozone layer label
  const ozoneLabel = createTextBadge(
    'Camada de Ozônio (O₃) • 25 km • Escudo UV',
    '#38bdf8',
    'rgba(2, 44, 74, 0.85)'
  );
  ozoneLabel.position.set(-18, 1.62, 14);
  ozoneLabel.scale.set(7.5, 1.875, 1.0);
  ozoneGroup.add(ozoneLabel);
  rootGroup.add(ozoneGroup);

  // B) Avião Comercial a Jato na Estratosfera (11 km, Y = 1.02)
  const jetGroup = new THREE.Group();
  jetGroup.name = 'CommercialJet_Group';

  // Build clean low-poly airliner model
  const jetFuselageGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.85, 12);
  jetFuselageGeo.rotateZ(Math.PI / 2);
  const jetFuselageMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // Pure airliner white
    roughness: 0.25,
    metalness: 0.3,
  });
  const jetFuselage = new THREE.Mesh(jetFuselageGeo, jetFuselageMat);
  jetGroup.add(jetFuselage);

  // Nose cone
  const noseGeo = new THREE.ConeGeometry(0.07, 0.22, 12);
  noseGeo.rotateZ(-Math.PI / 2);
  const noseMesh = new THREE.Mesh(noseGeo, jetFuselageMat);
  noseMesh.position.x = 0.52;
  jetGroup.add(noseMesh);

  // Wings (Swept back)
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0.15, 0);
  wingShape.lineTo(-0.15, -0.95);
  wingShape.lineTo(-0.35, -0.95);
  wingShape.lineTo(-0.10, 0);
  wingShape.lineTo(-0.35, 0.95);
  wingShape.lineTo(-0.15, 0.95);
  wingShape.closePath();
  const wingGeo = new THREE.ShapeGeometry(wingShape);
  wingGeo.rotateX(-Math.PI / 2);
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.3,
    metalness: 0.2,
    side: THREE.DoubleSide,
  });
  const wingsMesh = new THREE.Mesh(wingGeo, wingMat);
  jetGroup.add(wingsMesh);

  // Tail vertical fin
  const finGeo = new THREE.BoxGeometry(0.22, 0.28, 0.02);
  finGeo.translate(-0.32, 0.16, 0);
  const finMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
  const finMesh = new THREE.Mesh(finGeo, finMat);
  jetGroup.add(finMesh);

  // Navigation lights (Red port, Green starboard, White tail strobe)
  const lightGeo = new THREE.SphereGeometry(0.03, 8, 8);
  const redLightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const greenLightMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
  const whiteLightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const portLight = new THREE.Mesh(lightGeo, redLightMat);
  portLight.position.set(-0.25, 0, 0.95);
  jetGroup.add(portLight);

  const starLight = new THREE.Mesh(lightGeo, greenLightMat);
  starLight.position.set(-0.25, 0, -0.95);
  jetGroup.add(starLight);

  const tailLight = new THREE.Mesh(lightGeo, whiteLightMat);
  tailLight.position.set(-0.45, 0.25, 0);
  jetGroup.add(tailLight);

  // Jet Contrails (Condensation trail particles / line)
  const contrailGeo = new THREE.BufferGeometry();
  const contrailCount = 40;
  const contrailPositions = new Float32Array(contrailCount * 3);
  contrailGeo.setAttribute('position', new THREE.BufferAttribute(contrailPositions, 3));
  const contrailMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.65,
    linewidth: 2,
  });
  const contrailLine = new THREE.Line(contrailGeo, contrailMat);
  rootGroup.add(contrailLine);

  // Aircraft label sprite
  const jetLabel = createTextBadge(
    '✈️ Voo Comercial • 11 km (Estratosfera)',
    '#38bdf8',
    'rgba(15, 23, 42, 0.9)'
  );
  jetLabel.scale.set(5.5, 1.375, 1.0);
  jetGroup.add(jetLabel);
  jetLabel.position.set(0, 0.45, 0);

  rootGroup.add(jetGroup);

  // -------------------------------------------------------------
  // 3. KEY ATMOSPHERIC OBJECTS: MESOSFERA
  // -------------------------------------------------------------
  // A) Chuva de Meteoros / Estrelas Cadentes (Shooting stars disintegrating 85km -> 50km)
  const meteorsCount = 18;
  interface MeteorParticle {
    headMesh: THREE.Mesh;
    trailLine: THREE.Line;
    active: boolean;
    progress: number;
    speed: number;
    startX: number;
    startZ: number;
    startY: number;
    dirX: number;
    dirZ: number;
    timer: number;
  }
  const meteors: MeteorParticle[] = [];
  const meteorsGroup = new THREE.Group();
  meteorsGroup.name = 'MesosphereMeteors_Group';

  const meteorHeadGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const meteorHeadMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });

  for (let i = 0; i < meteorsCount; i++) {
    const head = new THREE.Mesh(meteorHeadGeo, meteorHeadMat);
    const trailPositions = new Float32Array(16 * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.LineBasicMaterial({
      color: 0xf59e0b, // Incandescent plasma gold-orange
      transparent: true,
      opacity: 0.8,
    });
    const trail = new THREE.Line(trailGeo, trailMat);

    meteorsGroup.add(head);
    meteorsGroup.add(trail);

    meteors.push({
      headMesh: head,
      trailLine: trail,
      active: false,
      progress: 0,
      speed: 1.8 + Math.random() * 1.5,
      startX: 0,
      startZ: 0,
      startY: 3.85, // 85 km (Top of Mesosphere)
      dirX: 0,
      dirZ: 0,
      timer: Math.random() * 4.0, // Stagger initial spawn
    });
  }
  rootGroup.add(meteorsGroup);

  // Mesosphere phenomenon tag
  const meteorLabel = createTextBadge(
    '☄️ Desintegração de Meteoros • 80 km (Mesosfera)',
    '#fbbf24',
    'rgba(30, 27, 75, 0.9)'
  );
  meteorLabel.position.set(12, 3.75, -22);
  meteorLabel.scale.set(7.5, 1.875, 1.0);
  rootGroup.add(meteorLabel);

  // -------------------------------------------------------------
  // 4. KEY ATMOSPHERIC OBJECTS: TERMOSFERA
  // -------------------------------------------------------------
  // A) Estação Espacial Internacional (ISS / EEI, 400 km, Y ~ 6.5)
  const issGroup = new THREE.Group();
  issGroup.name = 'ISS_SpaceStation_Group';

  // Central pressurized cylindrical module & truss
  const issTrussGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8);
  issTrussGeo.rotateZ(Math.PI / 2);
  const issTrussMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.7,
    roughness: 0.3,
  });
  const issTruss = new THREE.Mesh(issTrussGeo, issTrussMat);
  issGroup.add(issTruss);

  const issModuleGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.75, 12);
  const issModuleMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.5,
    roughness: 0.2,
  });
  const issModule = new THREE.Mesh(issModuleGeo, issModuleMat);
  issGroup.add(issModule);

  // Solar Panel Wings (Pair on each side, reflective golden photovoltaic arrays)
  const solarPanelGeo = new THREE.BoxGeometry(0.48, 0.015, 0.22);
  const solarPanelMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Deep golden amber solar cells
    roughness: 0.15,
    metalness: 0.85,
    emissive: 0x78350f,
    emissiveIntensity: 0.3,
  });

  const wingPositions = [
    { x: -0.65, z: 0.18 },
    { x: -0.65, z: -0.18 },
    { x: 0.65, z: 0.18 },
    { x: 0.65, z: -0.18 },
  ];
  wingPositions.forEach((wp) => {
    const sp = new THREE.Mesh(solarPanelGeo, solarPanelMat);
    sp.position.set(wp.x, 0, wp.z);
    issGroup.add(sp);
  });

  // ISS Label
  const issLabel = createTextBadge(
    '🛰️ Estação Espacial Internacional (ISS) • 408 km',
    '#ec4899',
    'rgba(80, 7, 36, 0.9)'
  );
  issLabel.position.set(0, 0.65, 0);
  issLabel.scale.set(7.5, 1.875, 1.0);
  issGroup.add(issLabel);

  rootGroup.add(issGroup);

  // B) Aurora Boreal (100 - 300 km, Y ~ 4.5 to 5.8) com sua cor autêntica verde-esmeralda e violeta
  const auroraGroup = new THREE.Group();
  auroraGroup.name = 'Auroras_Group';

  // Undulating curtain geometry for Arctic (North) Aurora Borealis
  const northAuroraGeo = new THREE.CylinderGeometry(10.5, 8.5, 1.4, 64, 4, true);
  const auroraMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(0x00ff88) }, // Verde-esmeralda autêntico da Aurora Boreal
      uColor2: { value: new THREE.Color(0xd946ef) }, // Magenta / Violeta no topo
      uActive: { value: 1.0 },
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vec3 p = position;
        // Waving curtain ripples
        float wave = sin(p.x * 0.4 + uTime * 1.8) * cos(p.z * 0.4 + uTime * 1.2) * 0.35;
        p.x += wave;
        p.z += wave * 0.8;
        vec4 wp = modelMatrix * vec4(p, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform float uActive;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      void main() {
        if (uActive < 0.01) discard;
        // Vertical ray curtains
        float ray = sin(vUv.x * 64.0 + uTime * 2.5) * 0.5 + 0.5;
        ray = pow(ray, 2.0);

        // Vertical gradient: Green at base, magenta at top
        vec3 col = mix(uColor1, uColor2, smoothstep(0.3, 0.95, vUv.y));
        float alpha = (0.25 + 0.45 * ray) * sin(vUv.y * 3.14159) * 0.75;

        gl_FragColor = vec4(col * (0.8 + 0.4 * ray), clamp(alpha, 0.0, 0.85));
      }
    `,
  });
  const northAuroraMesh = new THREE.Mesh(northAuroraGeo, auroraMat);
  northAuroraMesh.position.set(0, 4.9, 0); // Arctic center (Aurora Borealis)
  auroraGroup.add(northAuroraMesh);

  // Antarctic Aurora Australis (Perimeter ring on the border)
  const southAuroraGeo = new THREE.CylinderGeometry(34.0, 32.5, 1.3, 96, 4, true);
  const southAuroraMesh = new THREE.Mesh(southAuroraGeo, auroraMat);
  southAuroraMesh.position.set(0, 4.9, 0);
  auroraGroup.add(southAuroraMesh);

  // Aurora Label
  const auroraLabel = createTextBadge(
    '✨ Auroras Polares (Boreal & Austral) • 150 km',
    '#10b981',
    'rgba(6, 78, 59, 0.9)'
  );
  auroraLabel.position.set(0, 5.8, -12);
  auroraLabel.scale.set(7.5, 1.875, 1.0);
  auroraGroup.add(auroraLabel);

  rootGroup.add(auroraGroup);

  // -------------------------------------------------------------
  // 5. KEY ATMOSPHERIC OBJECTS: EXOSFERA
  // -------------------------------------------------------------
  // Satélite de Alta Órbita (GPS/GNSS, 20.200 km, Y ~ 10.2)
  const gpsSatGroup = new THREE.Group();
  gpsSatGroup.name = 'Exosphere_GPSSatellite_Group';

  const satBodyGeo = new THREE.BoxGeometry(0.35, 0.35, 0.45);
  const satBodyMat = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    metalness: 0.8,
    roughness: 0.2,
  });
  const satBody = new THREE.Mesh(satBodyGeo, satBodyMat);
  gpsSatGroup.add(satBody);

  // Solar Wings
  const satWingGeo = new THREE.BoxGeometry(0.85, 0.02, 0.28);
  const satWingMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    metalness: 0.9,
    roughness: 0.1,
  });
  const satWing1 = new THREE.Mesh(satWingGeo, satWingMat);
  satWing1.position.x = 0.65;
  gpsSatGroup.add(satWing1);
  const satWing2 = new THREE.Mesh(satWingGeo, satWingMat);
  satWing2.position.x = -0.65;
  gpsSatGroup.add(satWing2);

  const satLabel = createTextBadge(
    '🛰️ Satélite de Alta Órbita (GPS) • 20.200 km',
    '#a855f7',
    'rgba(59, 7, 100, 0.9)'
  );
  satLabel.position.set(0, 0.7, 0);
  satLabel.scale.set(7.5, 1.875, 1.0);
  gpsSatGroup.add(satLabel);

  rootGroup.add(gpsSatGroup);

  scene.add(rootGroup);

  // -------------------------------------------------------------
  // 6. UPDATE LOOP & KINEMATICS
  // -------------------------------------------------------------
  let elapsedTime = 0;
  let jetAngle = Math.PI * 0.35;
  let issAngle = Math.PI * 0.72;
  let satAngle = Math.PI * 1.25;

  const contrailHistory: THREE.Vector3[] = [];
  const jetRadius = 22.0;
  for (let i = 0; i < contrailCount; i++) {
    const historicalAngle = jetAngle - (i * 0.015);
    contrailHistory.push(new THREE.Vector3(
      jetRadius * Math.cos(historicalAngle),
      1.02,
      jetRadius * Math.sin(historicalAngle)
    ));
  }
  const initPosArr = contrailGeo.attributes.position.array as Float32Array;
  for (let i = 0; i < contrailCount; i++) {
    const p = contrailHistory[i];
    initPosArr[i * 3] = p.x;
    initPosArr[i * 3 + 1] = p.y;
    initPosArr[i * 3 + 2] = p.z;
  }
  contrailGeo.attributes.position.needsUpdate = true;

  const update = (
    deltaSeconds: number,
    sunPos: THREE.Vector3,
    _moonPos: THREE.Vector3,
    layers: LayerSettings,
    camera?: THREE.Camera,
    isHuman?: boolean
  ) => {
    elapsedTime += deltaSeconds;

    const anyShellActive =
      Boolean(layers.showAtmosphereLayers) &&
      Boolean(
        layers.showTroposphere ||
          layers.showStratosphere ||
          layers.showMesosphere ||
          layers.showThermosphere ||
          layers.showExosphere
      );
    const showObjects = Boolean(layers.showAtmosphereObjects);
    const showLabels = Boolean(layers.showAtmosphereLabels);

    // Master visibility: active whenever any stratum shell, 3D atmospheric object, or sky object label is enabled
    const masterShow = anyShellActive || showObjects || showLabels;
    rootGroup.visible = masterShow;
    if (!masterShow) return;

    const selectedId = layers.selectedAtmosphereLayer;
    const globalOpacity = typeof layers.atmosphereOpacity === 'number' ? layers.atmosphereOpacity : 0.85;
    const isFixed = layers.atmosphereObjectsFixed !== false; // Padrão: true (fixos no céu sem rodar rápido)
    const speedMult = isFixed ? 0.0 : (typeof layers.atmosphereObjectsSpeed === 'number' ? layers.atmosphereObjectsSpeed : 0.2);

    // 1. Update Strata Shells (Ocultos em visão humana para não formar um anel cilíndrico gigante na cabeça do observador)
    layerShells.forEach((shell) => {
      let isEnabled = !isHuman && anyShellActive;
      if (isEnabled) {
        if (shell.id === 'troposphere') isEnabled = Boolean(layers.showTroposphere);
        else if (shell.id === 'stratosphere') isEnabled = Boolean(layers.showStratosphere);
        else if (shell.id === 'mesosphere') isEnabled = Boolean(layers.showMesosphere);
        else if (shell.id === 'thermosphere') isEnabled = Boolean(layers.showThermosphere);
        else if (shell.id === 'exosphere') isEnabled = Boolean(layers.showExosphere);
      }

      shell.group.visible = isEnabled;
      shell.boundaryRing.visible = isEnabled;
      if (!isEnabled) return;

      const isSelected = selectedId === shell.id;
      shell.mat.uniforms.uTime.value = elapsedTime;
      shell.mat.uniforms.uSunPos.value.copy(sunPos);
      shell.mat.uniforms.uIsSelected.value = isSelected ? 1.0 : 0.0;

      // Dim unselected if one is selected
      const targetOpacity = selectedId
        ? isSelected
          ? globalOpacity * 1.35
          : globalOpacity * 0.35
        : globalOpacity;
      shell.mat.uniforms.uGlobalOpacity.value = targetOpacity;

      // Show altitude stratum label when the 3D layer shell is active
      shell.labelSprite.visible = true;
      if (camera) {
        shell.labelSprite.quaternion.copy(camera.quaternion);
      }
    });

    // 2. Update Objects Visibility & Labels
    // If any stratum shell is active, filter objects by their stratum toggle; if shells are off, show all objects when showAtmosphereObjects is enabled
    const stratActive = anyShellActive ? Boolean(layers.showStratosphere) : true;
    const mesoActive = anyShellActive ? Boolean(layers.showMesosphere) : true;
    const thermoActive = anyShellActive ? Boolean(layers.showThermosphere) : true;
    const exoActive = anyShellActive ? Boolean(layers.showExosphere) : true;

    ozoneGroup.visible = showObjects && stratActive && !isHuman;
    ozoneLabel.visible = showLabels && !isHuman;

    jetGroup.visible = showObjects && stratActive;
    jetLabel.visible = showLabels;
    contrailLine.visible = showObjects && stratActive && !isHuman;

    meteorsGroup.visible = showObjects && mesoActive && !isHuman;
    meteorLabel.visible = showObjects && mesoActive && showLabels && !isHuman;

    issGroup.visible = showObjects && thermoActive;
    issLabel.visible = showLabels;
    auroraGroup.visible = showObjects && thermoActive && !isHuman;
    auroraLabel.visible = showLabels && !isHuman;

    gpsSatGroup.visible = showObjects && exoActive;
    satLabel.visible = showLabels;

    // Escalas proporcionais na perspectiva humana vs global
    if (isHuman) {
      jetGroup.scale.set(0.04, 0.04, 0.04);
      issGroup.scale.set(0.08, 0.08, 0.08);
      gpsSatGroup.scale.set(0.08, 0.08, 0.08);
    } else {
      jetGroup.scale.set(1.25, 1.25, 1.25);
      issGroup.scale.set(1.35, 1.35, 1.35);
      gpsSatGroup.scale.set(1.35, 1.35, 1.35);
    }

    if (!showObjects) return;

    // 3. Jet Aircraft Orbit & Contrail (Fixo no céu por padrão ou com velocidade ajustada)
    if (stratActive) {
      if (!isFixed && speedMult > 0) {
        jetAngle += deltaSeconds * 0.08 * speedMult;
      }
      const jx = jetRadius * Math.cos(jetAngle);
      const jz = jetRadius * Math.sin(jetAngle);
      const jy = 1.02; // 11 km altitude in 3D

      jetGroup.position.set(jx, jy, jz);
      // Tangent forward direction
      const forwardAngle = jetAngle + Math.PI / 2;
      jetGroup.rotation.y = -forwardAngle;

      if (!isFixed && speedMult > 0) {
        const tailDist = (isHuman ? 0.04 : 1.25) * 0.45;
        const tailPos = new THREE.Vector3(
          jx - tailDist * Math.cos(forwardAngle),
          jy,
          jz - tailDist * Math.sin(forwardAngle)
        );
        contrailHistory.unshift(tailPos);
        contrailHistory.pop();

        const posArr = contrailGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < contrailCount; i++) {
          const p = contrailHistory[i];
          posArr[i * 3] = p.x;
          posArr[i * 3 + 1] = p.y;
          posArr[i * 3 + 2] = p.z;
        }
        contrailGeo.attributes.position.needsUpdate = true;
      }

      // Strobe blinking
      const blink = Math.sin(elapsedTime * 6.0) > 0.2;
      portLight.visible = blink;
      starLight.visible = blink;
      tailLight.visible = blink;
    }

    // 4. Ozone Layer Shaders
    if (stratActive) {
      ozoneMat.uniforms.uTime.value = elapsedTime;
      ozoneMat.uniforms.uSunPos.value.copy(sunPos);
    }

    // 5. Mesosphere Shooting Stars (Meteors)
    if (mesoActive) {
      meteors.forEach((m, idx) => {
        if (!m.active) {
          m.timer -= deltaSeconds;
          if (m.timer <= 0 || idx < 6) {
            // Spawn shooting star
            m.active = true;
            m.progress = (idx * 0.17) % 0.85;
            m.speed = 0.8 + (idx % 4) * 0.35;
            const ang = ((idx / meteors.length) * Math.PI * 2) + elapsedTime * 0.05;
            const r = 10 + (idx % 5) * 5.2;
            m.startX = r * Math.cos(ang);
            m.startZ = r * Math.sin(ang);
            m.startY = 3.85; // 85 km
            m.dirX = Math.cos(ang + 1.2) * 1.1;
            m.dirZ = Math.sin(ang + 1.2) * 1.1;
            m.headMesh.visible = true;
            m.trailLine.visible = true;
          }
        } else {
          if (!isFixed || speedMult > 0) {
            m.progress += deltaSeconds * m.speed * Math.max(0.35, speedMult * 2.5);
          } else {
            m.progress += deltaSeconds * 0.45;
          }
          const currentY = m.startY - m.progress * 1.50; // Drops towards 50 km (Y 2.35)
          const currentX = m.startX + m.dirX * m.progress * 1.5;
          const currentZ = m.startZ + m.dirZ * m.progress * 1.5;

          m.headMesh.position.set(currentX, currentY, currentZ);

          // Update trail line vertices (decaying tail)
          const trailArr = m.trailLine.geometry.attributes.position.array as Float32Array;
          for (let seg = 0; seg < 16; seg++) {
            const t = seg / 15;
            trailArr[seg * 3] = currentX - m.dirX * t * 1.1;
            trailArr[seg * 3 + 1] = currentY + t * 0.85;
            trailArr[seg * 3 + 2] = currentZ - m.dirZ * t * 1.1;
          }
          m.trailLine.geometry.attributes.position.needsUpdate = true;

          // Burnout & disintegration at bottom of mesosphere (~50 km)
          if (currentY <= 2.35 || m.progress >= 1.0) {
            m.active = false;
            m.headMesh.visible = false;
            m.trailLine.visible = false;
            m.timer = 0.4 + Math.random() * 1.5;
          }
        }
      });
    }

    // 6. Termosfera ISS Orbit & Auroras (Estação Espacial Fixa no céu por padrão ou suave)
    if (thermoActive) {
      if (!isFixed && speedMult > 0) {
        issAngle += deltaSeconds * 0.06 * speedMult;
      }
      const issRadius = 17.5;
      const ix = issRadius * Math.cos(issAngle);
      const iz = issRadius * Math.sin(issAngle);
      const iy = 6.45; // 400 km in 3D

      issGroup.position.set(ix, iy, iz);
      issGroup.rotation.y = -issAngle;

      // Animate Auroras
      auroraMat.uniforms.uTime.value = elapsedTime;
    }

    // 7. Exosfera GPS Satellite Orbit (Satélite Fixo no céu por padrão ou suave)
    if (exoActive) {
      if (!isFixed && speedMult > 0) {
        satAngle += deltaSeconds * 0.04 * speedMult;
      }
      const satRadius = 26.0;
      gpsSatGroup.position.set(
        satRadius * Math.cos(satAngle),
        10.2, // ~20.000 km altitude
        satRadius * Math.sin(satAngle)
      );
      gpsSatGroup.rotation.y = -satAngle;
    }

    // Billboard all active sprites towards camera
    if (camera && showLabels) {
      ozoneLabel.quaternion.copy(camera.quaternion);
      jetLabel.quaternion.copy(camera.quaternion);
      meteorLabel.quaternion.copy(camera.quaternion);
      issLabel.quaternion.copy(camera.quaternion);
      auroraLabel.quaternion.copy(camera.quaternion);
      satLabel.quaternion.copy(camera.quaternion);
    }
  };

  const dispose = () => {
    scene.remove(rootGroup);
    // Recursively dispose geometries and materials
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
    contrailGeo.dispose();
    contrailMat.dispose();
  };

  return {
    group: rootGroup,
    update,
    dispose,
  };
}
