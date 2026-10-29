import * as THREE from 'three';
import { ModelSettings, LayerSettings } from '../../types';

export interface CloudSystem3D {
  group: THREE.Group;
  shadowGroup: THREE.Group;
  getAccumulatedTime: () => number;
  update: (
    deltaSeconds: number,
    sunPos: THREE.Vector3,
    moonPos: THREE.Vector3,
    moonIllumPct: number,
    settings: ModelSettings,
    layers: LayerSettings,
    camera?: THREE.Camera,
    isHuman?: boolean,
    obsGround?: { x: number; z: number },
    sunSkyPos?: THREE.Vector3,
    moonSkyPos?: THREE.Vector3,
    humanDaylightFactor?: number,
    timeSpeedMultiplier?: number
  ) => void;
  dispose: () => void;
}

/**
 * PHOTOREALISTIC SATELLITE & VOLUMETRIC 3D CLOUD SYSTEM FOR PLANAR EARTH:
 * 1. Global Planar Mode (Vista Orbital / Satélite):
 *    - Uses the exact same continuous 3D Domain-Warped FBM Shader as the Spherical Globe Simulator!
 *    - Zero artificial floating cotton-ball billboards: continuous NASA Blue Marble satellite meteorology
 *      with swirling mid-latitude cyclones, ITCZ trade-wind cloud bands, cellular marine stratocumulus,
 *      jet-stream cirrus filaments, golden sunset twilight scattering, and soft lunar/nocturnal glow.
 *    - Multi-tier continuous atmospheric cloud decks (Low Cumulus/Stratocumulus, Mid Altocumulus/Frontal,
 *      High Cirrus/Jet Stream) + real-time projected ground shadows across the continents and oceans.
 * 2. Human 1st-Person Mode (Visão Humana em Terra):
 *    - Seamless 360° Volumetric Sky Cloud Canopy overhead with realistic silver-lining Mie forward scattering
 *      near the Sun & Moon, sunlit white tops, volumetric slate-blue cloud bellies, and golden-crimson sunset glow.
 */
export function createAtmosphericClouds3D(scene: THREE.Scene): CloudSystem3D {
  const group = new THREE.Group();
  group.name = 'PlanarPhotorealisticClouds_Group';

  const shadowGroup = new THREE.Group();
  shadowGroup.name = 'PlanarPhotorealisticCloudShadows_Group';

  const sharedNoiseGLSL = `
    const float PI = 3.141592653589793;

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

    float fbm(vec3 p) {
      float v = 0.0;
      float a = 0.52;
      for (int i = 0; i < 5; i++) {
        v += a * noise3D(p);
        p = p * 2.12 + vec3(1.7, 9.2, 3.4);
        a *= 0.48;
      }
      return v;
    }

    // Maps Planar Disc coordinates (x, z) with radius 0..48 cleanly onto the unit meteorological sphere
    // so the Planar Earth shares the EXACT same 3D cyclone swirls, ITCZ belt, and storm tracks as the Globe!
    vec3 planarXZToSphereDir(vec2 xz) {
      float r = length(xz);
      // r = 0 -> North Pole (+90°), r = 18 -> Equator (0°), r = 36 -> Antarctica (-90°)
      float latDeg = 90.0 - (r / 36.0) * 180.0;
      float latRad = clamp(latDeg, -89.8, 89.8) * PI / 180.0;
      float lonRad = atan(xz.x, xz.y);
      float cosLat = cos(latRad);
      return normalize(vec3(cosLat * sin(lonRad), sin(latRad), cosLat * cos(lonRad)));
    }
  `;

  // ===========================================================================
  // 1. GLOBAL PLANAR SATELLITE CLOUD DECKS (3 Stratified Continuous Shaders)
  // ===========================================================================
  interface GlobalCloudDeckEntry {
    tier: 'low' | 'middle' | 'high';
    mesh: THREE.Mesh;
    uniforms: Record<string, THREE.IUniform>;
    baseY: number;
  }

  const globalDecks: GlobalCloudDeckEntry[] = [];
  const deckSpecs: {
    tier: 'low' | 'middle' | 'high';
    baseY: number;
    freqMult: number;
    driftSpeed: number;
    seedOffset: THREE.Vector3;
    opacityMult: number;
  }[] = [
    {
      tier: 'low',
      baseY: 1.52, // Above maximum 3D mountain peaks (1.36) so clouds never clip or z-fight with terrain
      freqMult: 1.0,
      driftSpeed: 0.0028,
      seedOffset: new THREE.Vector3(0.0, 0.0, 0.0),
      opacityMult: 0.88,
    },
    {
      tier: 'middle',
      baseY: 2.15,
      freqMult: 1.32,
      driftSpeed: -0.0036,
      seedOffset: new THREE.Vector3(4.2, 1.9, 7.3),
      opacityMult: 0.72,
    },
    {
      tier: 'high',
      baseY: 2.85,
      freqMult: 1.75,
      driftSpeed: 0.0048,
      seedOffset: new THREE.Vector3(8.7, 5.4, 2.1),
      opacityMult: 0.56,
    },
  ];

  const sharedDiscGeo = new THREE.RingGeometry(0.001, 46.8, 256, 160);
  sharedDiscGeo.rotateX(-Math.PI / 2);

  deckSpecs.forEach((spec, idx) => {
    const uniforms: Record<string, THREE.IUniform> = {
      uTime: { value: 0.0 },
      uSunPos: { value: new THREE.Vector3(0, 7.5, 0) },
      uSunRadius: { value: 21.5 },
      uSunIntensity: { value: 1.0 },
      uSunLightEnabled: { value: 1.0 },
      uMoonPos: { value: new THREE.Vector3(0, 6.5, 0) },
      uMoonRadius: { value: 16.0 },
      uMoonIntensity: { value: 0.4 },
      uAmbientNight: { value: 0.04 },
      uFullDaylight: { value: 0.0 },
      uFreqMult: { value: spec.freqMult },
      uDriftSpeed: { value: spec.driftSpeed },
      uSeedOffset: { value: spec.seedOffset },
      uOpacityMult: { value: spec.opacityMult },
      uTierId: { value: idx === 0 ? 0.0 : idx === 1 ? 1.0 : 2.0 },
      uCloudScale: { value: 1.0 },
      uWorldTheme: { value: 0.0 },
    };

    const mat = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2 - idx,
      polygonOffsetUnits: -2 - idx,
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vLocalPos;
        void main() {
          vLocalPos = position;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPosition = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uSunPos;
        uniform float uSunRadius;
        uniform float uSunIntensity;
        uniform float uSunLightEnabled;
        uniform vec3 uMoonPos;
        uniform float uMoonRadius;
        uniform float uMoonIntensity;
        uniform float uAmbientNight;
        uniform float uFullDaylight;
        uniform float uFreqMult;
        uniform float uDriftSpeed;
        uniform vec3 uSeedOffset;
        uniform float uOpacityMult;
        uniform float uTierId;
        uniform float uCloudScale;
        uniform float uWorldTheme;

        varying vec3 vWorldPosition;
        varying vec3 vLocalPos;

        ${sharedNoiseGLSL}

        void main() {
          float rPlanar = length(vLocalPos.xz);
          if (rPlanar > 46.5) discard;

          // Smooth outer edge fade near the Antarctic ice rim and subtle polar eye fade
          float outerFade = 1.0 - smoothstep(41.5, 46.5, rPlanar);
          float poleFade = smoothstep(0.15, 1.6, rPlanar);

          vec3 nSphere = planarXZToSphereDir(vLocalPos.xz);

          // Differential atmospheric circulation rotation (Trade winds & Westerlies)
          float drift = uTime * uDriftSpeed;
          mat3 rotY = mat3(
            cos(drift), 0.0, sin(drift),
            0.0, 1.0, 0.0,
            -sin(drift), 0.0, cos(drift)
          );
          vec3 p = (rotY * nSphere) * (uFreqMult / max(0.45, uCloudScale)) + uSeedOffset;

          // Multi-stage domain warping for authentic satellite cyclone spirals & frontal bands
          vec3 q = vec3(
            fbm(p * 3.2 + vec3(0.0, uTime * 0.0012, 0.0)),
            fbm(p * 3.2 + vec3(5.2, 1.3, 2.8)),
            fbm(p * 3.2 + vec3(1.7, 8.4, 4.1))
          );
          vec3 rWarp = vec3(
            fbm(p * 4.2 + q * 1.55 + vec3(1.7, 9.2, 0.8)),
            fbm(p * 4.2 + q * 1.55 + vec3(8.3, 2.8, 4.3)),
            fbm(p * 4.2 + q * 1.55 + vec3(3.1, 6.4, 7.9))
          );
          float rawCloud = fbm(p * 4.6 + q * 1.25 + rWarp * 0.65);

          // Fine billowy cumulus & cellular micro-detail
          float microDetail = fbm(p * 13.5 + q * 2.2);
          float combinedCloud = rawCloud * 0.78 + microDetail * 0.22;

          // Climatic latitude belts: ITCZ equatorial belt (r ~ 18) + mid-latitude cyclone tracks
          float lat = asin(clamp(nSphere.y, -1.0, 1.0));
          float itcz = exp(-pow(lat / 0.16, 2.0)) * 0.16;
          float stormBelts = exp(-pow((abs(lat) - 0.82) / 0.30, 2.0)) * 0.15;

          float thresholdLow = uTierId < 0.5 ? 0.44 : (uTierId < 1.5 ? 0.48 : 0.52);
          float thresholdHigh = uTierId < 0.5 ? 0.73 : (uTierId < 1.5 ? 0.76 : 0.79);
          float density = smoothstep(thresholdLow, thresholdHigh, combinedCloud + itcz + stormBelts);
          density *= outerFade * poleFade;
          if (density < 0.01) discard;

          // Physical planar solar & lunar illumination:
          float distToSun = length(vWorldPosition.xz - uSunPos.xz);
          float normSunDist = distToSun / max(1.0, uSunRadius);
          float dayCloud = pow(smoothstep(1.14, 0.35, normSunDist), 0.90) * uSunLightEnabled;
          if (uFullDaylight > 0.5 && uSunLightEnabled > 0.5) {
            dayCloud = 1.0;
          }

          float whiteCoreMask = 1.0 - smoothstep(0.60, 0.84, normSunDist);
          float twilightCloud = smoothstep(1.09, 0.98, normSunDist) * (1.0 - smoothstep(0.02, 0.14, 1.0 - normSunDist)) * (1.0 - whiteCoreMask) * uSunLightEnabled * (1.0 - uFullDaylight);

          // Lunar illumination on the night side
          float distToMoon = length(vWorldPosition.xz - uMoonPos.xz);
          float normMoonDist = distToMoon / max(1.0, uMoonRadius);
          float moonLit = pow(smoothstep(1.05, 0.10, normMoonDist), 1.3) * uMoonIntensity;

          // Volumetric 3D self-shadowing & sunlit cloud-top relief
          vec3 toSunDir = normalize(uSunPos - vWorldPosition);
          float ridgeHighlight = smoothstep(0.42, 0.82, combinedCloud + microDetail * 0.18);
          float forwardScatter = pow(max(0.0, dot(normalize(cameraPosition - vWorldPosition), -toSunDir)), 4.0) * dayCloud * 0.35;

          // World-specific cloud tint (Earth = pure white; neighbor planets = 50% real planet color, never white!)
          vec3 cloudShadowTint = vec3(0.82, 0.89, 0.96);
          vec3 cloudBrightTint = vec3(1.0, 1.0, 1.0);
          if (uWorldTheme > 0.5) {
            vec3 planetRealColor = vec3(0.52, 0.58, 0.66); // Mercúrio
            if (uWorldTheme > 1.5 && uWorldTheme < 2.5) {
              planetRealColor = vec3(0.96, 0.74, 0.06); // Vênus (Amarelo-Ouro)
            } else if (uWorldTheme > 2.5 && uWorldTheme < 3.5) {
              planetRealColor = vec3(0.88, 0.24, 0.08); // Marte (Vermelho-Ferrugem)
            } else if (uWorldTheme > 3.5 && uWorldTheme < 4.5) {
              planetRealColor = vec3(0.92, 0.46, 0.10); // Júpiter (Laranja-Âmbar)
            } else if (uWorldTheme > 4.5 && uWorldTheme < 5.5) {
              planetRealColor = vec3(0.88, 0.68, 0.18); // Saturno (Dourado-Ocre)
            } else if (uWorldTheme > 5.5 && uWorldTheme < 6.5) {
              planetRealColor = vec3(0.08, 0.76, 0.88); // Urano (Ciano-Turquesa)
            } else if (uWorldTheme > 6.5) {
              planetRealColor = vec3(0.16, 0.42, 0.92); // Netuno (Azul-Cobalto)
            }
            cloudBrightTint = mix(vec3(0.84, 0.85, 0.87), planetRealColor, 0.55);
            cloudShadowTint = mix(vec3(0.46, 0.48, 0.52), planetRealColor * 0.68, 0.60);
          }

          vec3 pureWhiteCloud = mix(cloudShadowTint, cloudBrightTint, clamp(ridgeHighlight + whiteCoreMask * 0.28, 0.0, 1.0));

          // No escuro (lado noturno do plano), nuvens ficam pretas, sem borda artificial
          vec3 moonCloudCol = vec3(0.08, 0.14, 0.22) * moonLit * 0.45;
          vec3 nightCloud = vec3(0.0, 0.0, 0.0) + moonCloudCol;

          vec3 dayLitCol = pureWhiteCloud * (0.80 + 0.35 * dayCloud + forwardScatter) * min(1.35, max(0.7, uSunIntensity));
          // Transição suave e natural da luz do dia diretamente para o preto no escuro
          vec3 col = mix(nightCloud, dayLitCol, dayCloud);

          // Smooth grazing-angle fade
          vec3 V = normalize(cameraPosition - vWorldPosition);
          float viewFacing = smoothstep(0.02, 0.16, abs(V.y));

          float visFactor = mix(max(0.04, moonLit * 0.5 + uAmbientNight * 1.5), 0.95, dayCloud);
          float alpha = density * uOpacityMult * viewFacing * visFactor;
          if (alpha < 0.008) discard;

          gl_FragColor = vec4(col, alpha);
        }
      `,
    });

    const mesh = new THREE.Mesh(sharedDiscGeo, mat);
    mesh.position.y = spec.baseY;
    mesh.renderOrder = 4 + idx;
    group.add(mesh);

    globalDecks.push({
      tier: spec.tier,
      mesh,
      uniforms,
      baseY: spec.baseY,
    });
  });

  // ===========================================================================
  // 2. CONTINUOUS GROUND CLOUD SHADOW SHADER (Projected on Land & Ocean)
  // ===========================================================================
  const shadowGeo = new THREE.RingGeometry(0.001, 46.8, 200, 128);
  shadowGeo.rotateX(-Math.PI / 2);

  const shadowUniforms: Record<string, THREE.IUniform> = {
    uTime: { value: 0.0 },
    uSunPos: { value: new THREE.Vector3(0, 7.5, 0) },
    uSunRadius: { value: 21.5 },
    uSunLightEnabled: { value: 1.0 },
    uFullDaylight: { value: 0.0 },
    uCloudScale: { value: 1.0 },
  };

  const shadowMat = new THREE.ShaderMaterial({
    uniforms: shadowUniforms,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPosition = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uSunPos;
      uniform float uSunRadius;
      uniform float uSunLightEnabled;
      uniform float uFullDaylight;
      uniform float uCloudScale;

      varying vec3 vWorldPosition;

      ${sharedNoiseGLSL}

      void main() {
        float rPlanar = length(vWorldPosition.xz);
        if (rPlanar > 46.2) discard;

        float distToSun = length(vWorldPosition.xz - uSunPos.xz);
        float normSunDist = distToSun / max(1.0, uSunRadius);
        float dayFactor = pow(smoothstep(1.05, 0.12, normSunDist), 1.2) * uSunLightEnabled;
        if (uFullDaylight > 0.5 && uSunLightEnabled > 0.5) dayFactor = 1.0;
        if (dayFactor < 0.02) discard;

        // Offset sample position towards the Sun so cloud shadows are cast away from the Sun
        vec2 toSunXZ = uSunPos.xz - vWorldPosition.xz;
        vec2 sampleXZ = vWorldPosition.xz + normalize(toSunXZ + vec2(0.0001)) * 0.42;

        vec3 nSphere = planarXZToSphereDir(sampleXZ);
        float drift = uTime * 0.0028;
        mat3 rotY = mat3(
          cos(drift), 0.0, sin(drift),
          0.0, 1.0, 0.0,
          -sin(drift), 0.0, cos(drift)
        );
        vec3 p = (rotY * nSphere) / max(0.45, uCloudScale);
        vec3 q = vec3(
          fbm(p * 3.2 + vec3(0.0, uTime * 0.0012, 0.0)),
          fbm(p * 3.2 + vec3(5.2, 1.3, 2.8)),
          fbm(p * 3.2 + vec3(1.7, 8.4, 4.1))
        );
        float rawCloud = fbm(p * 4.6 + q * 1.35);
        float lat = asin(clamp(nSphere.y, -1.0, 1.0));
        float itcz = exp(-pow(lat / 0.16, 2.0)) * 0.16;
        float stormBelts = exp(-pow((abs(lat) - 0.82) / 0.30, 2.0)) * 0.14;

        float outerFade = 1.0 - smoothstep(41.5, 46.2, rPlanar);
        float shadowDens = smoothstep(0.45, 0.74, rawCloud + itcz + stormBelts) * outerFade;
        float alpha = shadowDens * dayFactor * 0.42;
        if (alpha < 0.008) discard;

        gl_FragColor = vec4(0.0, 0.01, 0.03, alpha);
      }
    `,
  });

  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.y = 0.09;
  shadowMesh.renderOrder = 2;
  shadowGroup.add(shadowMesh);

  // ===========================================================================
  // 3. HUMAN 1ST-PERSON VOLUMETRIC SKY DOME CLOUDS & GROUND SHADOW PROJECTION
  // ===========================================================================
  const humanCloudDomeGeo = new THREE.SphereGeometry(92.0, 96, 48, 0, Math.PI * 2, 0, Math.PI * 0.49);
  const humanCloudUniforms: Record<string, THREE.IUniform> = {
    uTime: { value: 0.0 },
    uSunWorldPos: { value: new THREE.Vector3(0, 20, 0) },
    uMoonWorldPos: { value: new THREE.Vector3(0, 20, 0) },
    uDaylight: { value: 1.0 },
    uMoonIllum: { value: 0.5 },
    uSunLightEnabled: { value: 1.0 },
    uObserverXZ: { value: new THREE.Vector2(0, 18) },
    uShowLow: { value: 1.0 },
    uShowMid: { value: 1.0 },
    uShowHigh: { value: 1.0 },
    uWorldTheme: { value: 0.0 },
  };

  const humanCloudMat = new THREE.ShaderMaterial({
    uniforms: humanCloudUniforms,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.BackSide,
    vertexShader: `
      varying vec3 vLocalDir;
      varying vec3 vWorldPos;
      void main() {
        vLocalDir = normalize(position);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uSunWorldPos;
      uniform vec3 uMoonWorldPos;
      uniform float uDaylight;
      uniform float uMoonIllum;
      uniform float uSunLightEnabled;
      uniform vec2 uObserverXZ;
      uniform float uShowLow;
      uniform float uShowMid;
      uniform float uShowHigh;
      uniform float uWorldTheme;

      varying vec3 vLocalDir;
      varying vec3 vWorldPos;

      ${sharedNoiseGLSL}

      float sampleCloudDensity(vec2 skyCoord, vec2 windDrift) {
        vec3 p = vec3(skyCoord * 0.85 + windDrift + uObserverXZ * 0.12, uTime * 0.0010);
        vec3 q = vec3(
          fbm(p * 1.4 + vec3(0.0, 0.0, uTime * 0.0012)),
          fbm(p * 1.4 + vec3(5.2, 1.3, 2.8)),
          fbm(p * 1.4 + vec3(1.7, 8.4, 4.1))
        );
        float lowCumulus = fbm(p * 2.1 + q * 1.25) * uShowLow;
        float midAlto = fbm(p * 3.4 - q * 0.85 + vec3(4.1, 2.3, 1.0)) * uShowMid;
        float highCirrus = fbm(vec3(skyCoord * 1.6 + windDrift * 1.45, uTime * 0.0016)) * uShowHigh;

        float dLow = smoothstep(0.47, 0.76, lowCumulus);
        float dMid = smoothstep(0.52, 0.79, midAlto) * 0.65;
        float dHigh = smoothstep(0.58, 0.84, highCirrus) * 0.42;
        return clamp(dLow + dMid + dHigh, 0.0, 1.0);
      }

      void main() {
        vec3 dir = normalize(vLocalDir);
        // Smooth horizon fade so clouds blend into the distant atmospheric horizon haze
        float elev = dir.y;
        if (elev < 0.025) discard;
        float horizonFade = smoothstep(0.025, 0.17, elev);

        // Project sky ray onto planar atmospheric cloud sheet at altitude H = 4.2:
        // skyCoord = dir.xz / (elev + 0.14)
        vec2 skyCoord = dir.xz / (elev + 0.14);
        vec2 windDrift = vec2(uTime * 0.0022, -uTime * 0.0014);
        vec3 p = vec3(skyCoord * 0.85 + windDrift + uObserverXZ * 0.12, uTime * 0.0010);

        // Domain warping for natural billowy cumulus & stratocumulus formations
        vec3 q = vec3(
          fbm(p * 1.4 + vec3(0.0, 0.0, uTime * 0.0012)),
          fbm(p * 1.4 + vec3(5.2, 1.3, 2.8)),
          fbm(p * 1.4 + vec3(1.7, 8.4, 4.1))
        );

        float lowCumulus = fbm(p * 2.1 + q * 1.25) * uShowLow;
        float midAlto = fbm(p * 3.4 - q * 0.85 + vec3(4.1, 2.3, 1.0)) * uShowMid;
        float highCirrus = fbm(vec3(skyCoord * 1.6 + windDrift * 1.45, uTime * 0.0016)) * uShowHigh;

        float densityLow = smoothstep(0.47, 0.76, lowCumulus);
        float densityMid = smoothstep(0.52, 0.79, midAlto) * 0.65;
        float densityHigh = smoothstep(0.58, 0.84, highCirrus) * 0.42;

        float density = clamp(densityLow + densityMid + densityHigh, 0.0, 1.0) * horizonFade;
        if (density < 0.01) discard;

        vec3 rayDir = normalize(vWorldPos - cameraPosition);
        vec3 sunDir = normalize(uSunWorldPos - cameraPosition);
        vec3 moonDir = normalize(uMoonWorldPos - cameraPosition);

        // Strictly ONE light source during the day (the Sun):
        // Directional Solar Self-Shadowing samples the cloud sheet strictly along the vector towards the Sun!
        vec2 sunSkyCoord = sunDir.xz / (max(0.05, sunDir.y) + 0.14);
        vec2 toSunSkyDir = normalize(sunSkyCoord - skyCoord + vec2(0.0001));
        float densityTowardsSun = sampleCloudDensity(skyCoord + toSunSkyDir * 0.24, windDrift);
        // Only the face of the cloud turned towards the Sun receives direct bright sunlight;
        // the side opposite the Sun and the cloud base are shaded!
        float directionalSunLit = clamp(1.0 - (densityTowardsSun - density * 0.45) * 1.55, 0.08, 1.0);

        float cloudLighting = directionalSunLit;

        // Henyey-Greenstein / Mie forward scattering ("Silver Lining" strictly around the Sun)
        float cosSun = clamp(dot(rayDir, sunDir), -1.0, 1.0);
        float posCosSun = max(0.0, cosSun);
        float silverLining = (pow(posCosSun, 12.0) * 1.55 + pow(posCosSun, 3.0) * 0.45) * (1.0 - density * 0.52) * uSunLightEnabled;

        // Solar white-cloud arc calibrated (-20% from previous wide arc):
        // Clouds beneath and around the Sun stay crisp white, while clouds further away transition to golden-yellow.
        float sunProximityArc = smoothstep(0.08, 0.68, cosSun);
        float farFromSunMask = 1.0 - smoothstep(0.26, 0.76, cosSun);

        // Suppress lunar halo completely during daytime so the Sun is the ONLY light source in the sky during the day
        float nightOnlyMask = 1.0 - smoothstep(0.0, 0.12, uDaylight);
        float cosMoon = clamp(dot(rayDir, moonDir), 0.0, 1.0);
        float moonHalo = pow(cosMoon, 8.0) * 0.85 * uMoonIllum * nightOnlyMask;

        // Day, Golden Sunset, and Nighttime Cloud Palette with high-contrast sunlit face & shadowed base
        float baseSunsetFactor = clamp(1.0 - abs(uDaylight - 0.24) / 0.22, 0.0, 1.0) * uSunLightEnabled;
        float yellowDistFactor = clamp(baseSunsetFactor * (0.15 + 0.55 * farFromSunMask) + (1.0 - sunProximityArc) * 0.16 * clamp(uDaylight * 1.2, 0.0, 1.0) * (1.0 - smoothstep(0.42, 0.78, uDaylight)), 0.0, 1.0);

        vec3 dayTop = vec3(1.0, 1.0, 1.0);
        vec3 dayBelly = mix(vec3(0.46, 0.56, 0.70), vec3(0.75, 0.82, 0.91), sunProximityArc * 0.45);
        if (uWorldTheme > 0.5) {
          vec3 planetRealColor = vec3(0.52, 0.58, 0.66); // Mercúrio
          if (uWorldTheme > 1.5 && uWorldTheme < 2.5) {
            planetRealColor = vec3(0.96, 0.74, 0.06); // Vênus (Amarelo-Ouro)
          } else if (uWorldTheme > 2.5 && uWorldTheme < 3.5) {
            planetRealColor = vec3(0.88, 0.24, 0.08); // Marte (Vermelho-Ferrugem)
          } else if (uWorldTheme > 3.5 && uWorldTheme < 4.5) {
            planetRealColor = vec3(0.92, 0.46, 0.10); // Júpiter (Laranja-Âmbar)
          } else if (uWorldTheme > 4.5 && uWorldTheme < 5.5) {
            planetRealColor = vec3(0.88, 0.68, 0.18); // Saturno (Dourado-Ocre)
          } else if (uWorldTheme > 5.5 && uWorldTheme < 6.5) {
            planetRealColor = vec3(0.08, 0.76, 0.88); // Urano (Ciano-Turquesa)
          } else if (uWorldTheme > 6.5) {
            planetRealColor = vec3(0.16, 0.42, 0.92); // Netuno (Azul-Cobalto)
          }
          dayTop = mix(vec3(0.84, 0.85, 0.87), planetRealColor, 0.55);
          dayBelly = mix(vec3(0.42, 0.44, 0.48), planetRealColor * 0.68, 0.60);
        }
        float whiteBoost = clamp(cloudLighting + sunProximityArc * 0.22, 0.0, 1.0);
        vec3 dayCloudCol = mix(dayBelly, dayTop, whiteBoost) + dayTop * silverLining;

        // No escuro, as nuvens ficam pretas (sem bordas artificiais)
        vec3 nightCloudCol = vec3(0.0, 0.0, 0.0) + vec3(0.12, 0.18, 0.28) * moonHalo;

        vec3 litCloud = mix(nightCloudCol, dayCloudCol, clamp(uDaylight * 1.25, 0.0, 1.0));

        float alpha = density * mix(0.55, 0.92, clamp(uDaylight + uMoonIllum * 0.5 * nightOnlyMask, 0.0, 1.0));
        if (alpha < 0.008) discard;

        gl_FragColor = vec4(litCloud, alpha);
      }
    `,
  });

  const humanCloudDomeMesh = new THREE.Mesh(humanCloudDomeGeo, humanCloudMat);
  humanCloudDomeMesh.renderOrder = -4; // In front of background sky dome (-10) and stars, behind Sun/Moon
  humanCloudDomeMesh.visible = false;
  group.add(humanCloudDomeMesh);

  // 4. HUMAN 1ST-PERSON GROUND CLOUD SHADOW DISC (Projects moving cloud shadows strictly along the Sun->Cloud->Ground ray!)
  const humanGroundShadowGeo = new THREE.CircleGeometry(38.0, 64);
  humanGroundShadowGeo.rotateX(-Math.PI / 2);

  const humanGroundShadowMat = new THREE.ShaderMaterial({
    uniforms: humanCloudUniforms,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    vertexShader: `
      varying vec3 vWorldPos;
      varying vec2 vLocalXZ;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        vLocalXZ = position.xz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uSunWorldPos;
      uniform float uDaylight;
      uniform float uSunLightEnabled;
      uniform vec2 uObserverXZ;
      uniform float uShowLow;
      uniform float uShowMid;
      uniform float uShowHigh;

      varying vec3 vWorldPos;
      varying vec2 vLocalXZ;

      ${sharedNoiseGLSL}

      void main() {
        if (uSunLightEnabled < 0.5 || uDaylight < 0.04) discard;

        float distFromObs = length(vLocalXZ);
        if (distFromObs > 37.5) discard;

        // Exact Collinear Ray-Cast from ground point (vLocalXZ, 0) up along the Sun's incident light vector (sunDir)
        // to the overhead cloud layer at height H = 4.2:
        // The point on the cloud sheet at height H is P_cloud = vLocalXZ + sunDir.xz * (H / sunDir.y).
        // In the sky dome shader, a cloud at P_cloud has skyCoord = P_cloud / H = (vLocalXZ / H) + (sunDir.xz / sunDir.y)!
        // This guarantees 100% geometric alignment: a shadow on the ground is cast ONLY by the exact cloud blocking the Sun!
        vec3 sunRel = uSunWorldPos - cameraPosition;
        vec3 sunDir = normalize(sunRel);
        if (sunDir.y <= 0.01) discard;

        float cloudHeight = 4.2;
        vec2 sunSkyCoord = sunDir.xz / (max(0.05, sunDir.y) + 0.14);
        vec2 cloudInterceptXZ = (vLocalXZ / cloudHeight) + sunSkyCoord;

        vec2 windDrift = vec2(uTime * 0.0022, -uTime * 0.0014);
        vec3 p = vec3(cloudInterceptXZ * 0.85 + windDrift + uObserverXZ * 0.12, uTime * 0.0010);

        vec3 q = vec3(
          fbm(p * 1.4 + vec3(0.0, 0.0, uTime * 0.0012)),
          fbm(p * 1.4 + vec3(5.2, 1.3, 2.8)),
          fbm(p * 1.4 + vec3(1.7, 8.4, 4.1))
        );

        float lowCumulus = fbm(p * 2.1 + q * 1.25) * uShowLow;
        float midAlto = fbm(p * 3.4 - q * 0.85 + vec3(4.1, 2.3, 1.0)) * uShowMid;
        float highCirrus = fbm(vec3(cloudInterceptXZ * 1.6 + windDrift * 1.45, uTime * 0.0016)) * uShowHigh;

        float densityLow = smoothstep(0.45, 0.74, lowCumulus);
        float densityMid = smoothstep(0.50, 0.78, midAlto) * 0.65;
        float densityHigh = smoothstep(0.58, 0.84, highCirrus) * 0.30;

        float cloudShadowDensity = clamp(densityLow + densityMid + densityHigh, 0.0, 1.0);
        float edgeFade = 1.0 - smoothstep(28.0, 37.5, distFromObs);

        float shadowAlpha = cloudShadowDensity * edgeFade * clamp(uDaylight * 1.2, 0.0, 1.0) * 0.56;
        if (shadowAlpha < 0.008) discard;

        gl_FragColor = vec4(0.01, 0.03, 0.07, shadowAlpha);
      }
    `,
  });

  const humanGroundShadowMesh = new THREE.Mesh(humanGroundShadowGeo, humanGroundShadowMat);
  humanGroundShadowMesh.renderOrder = 3;
  humanGroundShadowMesh.visible = false;
  shadowGroup.add(humanGroundShadowMesh);

  scene.add(group);
  scene.add(shadowGroup);

  let accumulatedTime = 0;

  return {
    group,
    shadowGroup,
    getAccumulatedTime: () => accumulatedTime,
    update: (
      deltaSeconds: number,
      sunPos: THREE.Vector3,
      moonPos: THREE.Vector3,
      moonIllumPct: number,
      settings: ModelSettings,
      layers: LayerSettings,
      camera?: THREE.Camera,
      isHuman?: boolean,
      obsGround?: { x: number; z: number },
      sunSkyPos?: THREE.Vector3,
      moonSkyPos?: THREE.Vector3,
      humanDaylightFactor?: number,
      timeSpeedMultiplier: number = 1.0
    ) => {
      const speedMult = settings.cloudSpeed !== undefined ? settings.cloudSpeed : 0.45;
      accumulatedTime += deltaSeconds * (0.4 + speedMult * 1.35) * timeSpeedMultiplier;

      const isOverallVisible = layers.showClouds3D;
      group.visible = isOverallVisible;
      shadowGroup.visible = isOverallVisible && !isHuman && layers.showDynamicShadows !== false;

      if (!isOverallVisible) return;

      const isSunLit = settings.sunLightEnabled !== false;
      const isFullDaylight = settings.mapLightingMode === 'full_daylight';
      const isBalanced = settings.mapLightingMode === 'balanced';
      const angleRad = ((settings.solarFocusAngleDeg || 55) * Math.PI) / 180;
      const baseConeRadius = Math.max(sunPos.y || 7.5, 4.0) * Math.tan(angleRad) * 1.5;
      const sunMaxRadius = isFullDaylight
        ? 120.0
        : isBalanced
        ? baseConeRadius * 1.25
        : baseConeRadius;

      const moonIllumFrac = Math.max(0.0, Math.min(1.0, (moonIllumPct ?? 50) / 100.0));
      const altitudeFactor = settings.cloudAltitude !== undefined ? settings.cloudAltitude / 2.7 : 1.0;
      const cloudScaleFactor = settings.cloudScale !== undefined ? THREE.MathUtils.clamp(settings.cloudScale / 0.1, 0.65, 1.8) : 1.0;
      const worldThemeMap: Record<string, number> = {
        earth: 0,
        mercury: 1,
        venus: 2,
        mars: 3,
        jupiter: 4,
        saturn: 5,
        uranus: 6,
        neptune: 7,
      };
      const activeThemeId = worldThemeMap[settings.activePlanarWorld || 'earth'] ?? 0;

      if (isHuman) {
        // Human 1st-person sky canopy (Ground shadows are rendered seamlessly on terrain & mountains by ObserverEnvironment3D)
        globalDecks.forEach((d) => {
          d.mesh.visible = false;
        });
        shadowMesh.visible = false;
        humanCloudDomeMesh.visible = true;
        humanGroundShadowMesh.visible = false;

        if (camera) {
          humanCloudDomeMesh.position.copy(camera.position);
        } else if (obsGround) {
          humanCloudDomeMesh.position.set(obsGround.x, 0.09, obsGround.z);
        }
        if (obsGround) {
          humanGroundShadowMesh.position.set(obsGround.x, 0.0504, obsGround.z);
        } else if (camera) {
          humanGroundShadowMesh.position.set(camera.position.x, 0.0504, camera.position.z);
        }

        humanCloudUniforms.uTime.value = accumulatedTime;
        if (sunSkyPos) {
          humanCloudUniforms.uSunWorldPos.value.copy(sunSkyPos);
        } else {
          humanCloudUniforms.uSunWorldPos.value.copy(sunPos);
        }
        if (moonSkyPos) {
          humanCloudUniforms.uMoonWorldPos.value.copy(moonSkyPos);
        } else {
          humanCloudUniforms.uMoonWorldPos.value.copy(moonPos);
        }
        humanCloudUniforms.uDaylight.value =
          humanDaylightFactor !== undefined ? humanDaylightFactor : isSunLit ? 1.0 : 0.0;
        humanCloudUniforms.uMoonIllum.value = moonIllumFrac;
        humanCloudUniforms.uSunLightEnabled.value = isSunLit ? 1.0 : 0.0;
        if (obsGround) {
          humanCloudUniforms.uObserverXZ.value.set(obsGround.x, obsGround.z);
        }
        humanCloudUniforms.uShowLow.value = layers.showCloudsLow !== false ? 1.0 : 0.0;
        humanCloudUniforms.uShowMid.value = layers.showCloudsMiddle !== false ? 1.0 : 0.0;
        humanCloudUniforms.uShowHigh.value = layers.showCloudsHigh !== false ? 1.0 : 0.0;
        humanCloudUniforms.uWorldTheme.value = activeThemeId;
      } else {
        // Global Planar Satellite Clouds
        humanCloudDomeMesh.visible = false;
        humanGroundShadowMesh.visible = false;
        shadowMesh.visible = layers.showDynamicShadows !== false;

        globalDecks.forEach((deck) => {
          let tierVisible = true;
          if (deck.tier === 'low' && layers.showCloudsLow === false) tierVisible = false;
          if (deck.tier === 'middle' && layers.showCloudsMiddle === false) tierVisible = false;
          if (deck.tier === 'high' && layers.showCloudsHigh === false) tierVisible = false;

          deck.mesh.visible = tierVisible;
          if (!tierVisible) return;

          deck.mesh.position.y = Math.max(1.42, deck.baseY * altitudeFactor);
          const u = deck.uniforms;
          u.uTime.value = accumulatedTime;
          u.uSunPos.value.copy(sunPos);
          u.uSunRadius.value = sunMaxRadius;
          u.uSunIntensity.value = settings.solarIntensity;
          u.uSunLightEnabled.value = isSunLit ? 1.0 : 0.0;
          u.uMoonPos.value.copy(moonPos);
          u.uMoonIntensity.value = (settings.moonIntensity ?? 1.0) * moonIllumFrac * 0.55;
          u.uAmbientNight.value = settings.ambientBrightness * 0.04;
          u.uFullDaylight.value = isFullDaylight ? 1.0 : 0.0;
          u.uCloudScale.value = cloudScaleFactor;
          u.uWorldTheme.value = 0.0; // Earth's own global cloud decks stay pure white
        });

        shadowUniforms.uTime.value = accumulatedTime;
        shadowUniforms.uSunPos.value.copy(sunPos);
        shadowUniforms.uSunRadius.value = sunMaxRadius;
        shadowUniforms.uSunLightEnabled.value = isSunLit ? 1.0 : 0.0;
        shadowUniforms.uFullDaylight.value = isFullDaylight ? 1.0 : 0.0;
        shadowUniforms.uCloudScale.value = cloudScaleFactor;
      }
    },
    dispose: () => {
      scene.remove(group);
      scene.remove(shadowGroup);
      sharedDiscGeo.dispose();
      shadowGeo.dispose();
      humanCloudDomeGeo.dispose();
      humanGroundShadowGeo.dispose();
      globalDecks.forEach((d) => (d.mesh.material as THREE.Material).dispose());
      shadowMat.dispose();
      humanCloudMat.dispose();
      humanGroundShadowMat.dispose();
    },
  };
}
