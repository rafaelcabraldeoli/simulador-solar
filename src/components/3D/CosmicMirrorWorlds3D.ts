import * as THREE from 'three';
import {
  generateMoonTexture,
  generateMoonGlowTexture,
  generateSunSparkleTexture,
} from '../../utils/textureGenerator';

export type CosmicDiscWorldId =
  | 'earth'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune';

export interface CosmicWorldSpec {
  id: CosmicDiscWorldId;
  name: string;
  subtitle: string;
  atmosphereSignature: string;
  description: string;
  primaryColorHex: string;
  secondaryColorHex: string;
  rimNeonInnerHex: string;
  rimNeonOuterHex: string;
  themeId: number;
  discScale: number;
  sunOrbitRadius: number;
  moonOrbitRadius: number;
  sunSpeed: number;
  moonSpeed: number;
}

export const COSMIC_WORLD_SPECS: Record<CosmicDiscWorldId, CosmicWorldSpec> = {
  earth: {
    id: 'earth',
    name: 'Terra (Estrela Polar Central)',
    subtitle: 'Disco Azul-Esmeralda • Anel Neon Ciano & Rosa/Roxo',
    atmosphereSignature: 'Atmosfera Leve de Oxigênio/Nitrogênio ("Óleo" Protetor)',
    description:
      'No ponto mais alto do Teto de Vidro Líquido (a 1 trilhão de km), o reflexo do nosso próprio mundo permanece fixo no centro como a Estrela Polar. Possui mares azuis profundos, continentes verdes e correntes de nuvens brancas cercadas pela fronteira magnética neon da Antártida.',
    primaryColorHex: '#38bdf8',
    secondaryColorHex: '#10b981',
    rimNeonInnerHex: '#38bdf8',
    rimNeonOuterHex: '#ec4899',
    themeId: 0,
    discScale: 1.0,
    sunOrbitRadius: 0.42,
    moonOrbitRadius: 0.56,
    sunSpeed: 1.0,
    moonSpeed: 0.96,
  },
  mercury: {
    id: 'mercury',
    name: 'Mercúrio (Terra Extra Prateada)',
    subtitle: 'Disco Cinza-Prateado & Grafite • Anel Neon Ciano & Magenta',
    atmosphereSignature: 'Atmosfera Fluida Cinza-Prateada com Nuances Metálicas e Oceanos Negros',
    description:
      'Um disco plano de pura luz e atmosfera cinza-prateada em turbilhão sobre águas escuras espelhadas, com continentes prateados iluminados pelo seu próprio Sol radiante e sua própria Lua em rotação harmônica.',
    primaryColorHex: '#cbd5e1',
    secondaryColorHex: '#64748b',
    rimNeonInnerHex: '#38bdf8',
    rimNeonOuterHex: '#e879f9',
    themeId: 1,
    discScale: 0.85,
    sunOrbitRadius: 0.40,
    moonOrbitRadius: 0.54,
    sunSpeed: 1.35,
    moonSpeed: 1.15,
  },
  venus: {
    id: 'venus',
    name: 'Vênus (Terra Extra Dourada)',
    subtitle: 'Disco Puramente Amarelo & Ouro Líquido • Anel Neon Ciano & Rosa',
    atmosphereSignature: 'Atmosfera Densa de Vapor Áureo e Correntes Douradas',
    description:
      'Alcançável ao cruzar as barreiras de densidade e correntes magnéticas além da Antártida. Sua assinatura no espelho cósmico é um disco puramente amarelo e dourado, onde redemoinhos de nuvens áureas envolvem terras douradas sob seu próprio Sol e Lua.',
    primaryColorHex: '#facc15',
    secondaryColorHex: '#ca8a04',
    rimNeonInnerHex: '#38bdf8',
    rimNeonOuterHex: '#f472b6',
    themeId: 2,
    discScale: 1.08,
    sunOrbitRadius: 0.40,
    moonOrbitRadius: 0.54,
    sunSpeed: 1.12,
    moonSpeed: 0.98,
  },
  mars: {
    id: 'mars',
    name: 'Marte (Terra Extra Acobreada)',
    subtitle: 'Disco Vermelho-Acobreado & Oceanos de Água Preta • Anel Neon',
    atmosphereSignature: 'Nuvens Vermelhas Flutuantes sobre Solo de Cobre e Oceanos Negros',
    description:
      'Um disco artístico vermelho-acobreado onde espirais de nuvens carmesim e cobre flutuam organicamente, deixando transparecer continentes ocre-dourados e profundos oceanos de água preta sob a luz do seu próprio Sol e da sua Lua.',
    primaryColorHex: '#ea580c',
    secondaryColorHex: '#991b1b',
    rimNeonInnerHex: '#38bdf8',
    rimNeonOuterHex: '#e879f9',
    themeId: 3,
    discScale: 0.96,
    sunOrbitRadius: 0.40,
    moonOrbitRadius: 0.54,
    sunSpeed: 0.95,
    moonSpeed: 0.88,
  },
  jupiter: {
    id: 'jupiter',
    name: 'Júpiter (Gigante Âmbar & Creme)',
    subtitle: 'Disco Gigante em Tons de Âmbar, Laranja e Creme • Anel Neon',
    atmosphereSignature: 'Vórtices Majestosos de Fluido Âmbar, Creme Imperial e Ouro Antigo',
    description:
      'Um vasto mundo vizinho refletido no espelho primordial com faixas ciclônicas em tons de âmbar, laranja-dourado e creme luminoso, abrigando ecossistemas e civilizações pacíficas iluminadas por seu próprio par de luminárias.',
    primaryColorHex: '#f59e0b',
    secondaryColorHex: '#fef3c7',
    rimNeonInnerHex: '#38bdf8',
    rimNeonOuterHex: '#ec4899',
    themeId: 4,
    discScale: 1.38,
    sunOrbitRadius: 0.40,
    moonOrbitRadius: 0.54,
    sunSpeed: 0.82,
    moonSpeed: 0.76,
  },
  saturn: {
    id: 'saturn',
    name: 'Saturno (Coroa de Ouro & Creme)',
    subtitle: 'Disco em Tons de Creme, Âmbar Suave e Anéis de Luz • Anel Neon',
    atmosphereSignature: 'Atmosfera Fluida em Tons de Creme Dourado, Âmbar e Halos Concêntricos',
    description:
      'Projetado no espelho d’água a 1 trilhão de km como um disco real em tons de creme, âmbar e dourado suave, cercado por anéis concêntricos de tensão superficial e iluminado internamente por seu próprio Sol e Lua.',
    primaryColorHex: '#fde047',
    secondaryColorHex: '#d97706',
    rimNeonInnerHex: '#38bdf8',
    rimNeonOuterHex: '#f472b6',
    themeId: 5,
    discScale: 1.28,
    sunOrbitRadius: 0.40,
    moonOrbitRadius: 0.54,
    sunSpeed: 0.78,
    moonSpeed: 0.72,
  },
  uranus: {
    id: 'uranus',
    name: 'Urano (Terra Extra Ciano-Glacial)',
    subtitle: 'Disco Azul-Celeste & Turquesa Fluido • Anel Neon Ciano & Violeta',
    atmosphereSignature: 'Atmosfera Fluida de Cristal Turquesa e Mares Profundos',
    description:
      'Um disco luminoso de atmosfera ciano-turquesa e safira refletido instantaneamente no teto de vidro líquido, com seu próprio Sol e Lua girando dentro de sua bolha atmosférica.',
    primaryColorHex: '#22d3ee',
    secondaryColorHex: '#0284c7',
    rimNeonInnerHex: '#38bdf8',
    rimNeonOuterHex: '#c084fc',
    themeId: 6,
    discScale: 1.12,
    sunOrbitRadius: 0.40,
    moonOrbitRadius: 0.54,
    sunSpeed: 0.70,
    moonSpeed: 0.65,
  },
  neptune: {
    id: 'neptune',
    name: 'Netuno (Terra Extra Azul-Abissal)',
    subtitle: 'Disco Índigo & Cobalto Bioluminescente • Anel Neon Azul & Rosa',
    atmosphereSignature: 'Correntes de Fluido Azul-Cobalto e Espirais Violeta',
    description:
      'Nas regiões externas do vitral de atmosferas, Netuno brilha como um disco de fluido azul-cobalto profundo com redemoinhos prateados e seu próprio sistema solar interno.',
    primaryColorHex: '#3b82f6',
    secondaryColorHex: '#1d4ed8',
    rimNeonInnerHex: '#38bdf8',
    rimNeonOuterHex: '#f472b6',
    themeId: 7,
    discScale: 1.10,
    sunOrbitRadius: 0.40,
    moonOrbitRadius: 0.54,
    sunSpeed: 0.66,
    moonSpeed: 0.60,
  },
};

/**
 * Shared GLSL Shader that renders each "Terra Extra" (or Earth's Polaris reflection)
 * identically to the user's reference artwork:
 * - Concentric neon outer border rings: glowing pink/magenta outer ring + electric cyan/blue inner ring
 * - Dark central polar vortex eye surrounded by golden/silver/copper illuminated continental landmasses & archipelagos
 * - Swirling fluid atmospheric cloud bands (Silver-Grey for Mercury, Pure Gold for Venus, Copper-Red over Black Water for Mars,
 *   Blue-Green for Earth, Amber-Cream for Jupiter/Saturn)
 * - Internal organic Sun (bright glowing white-gold orb with sunlit cloud halo) and internal Moon + secondary luminaire points
 *   orbiting inside the fluid atmosphere!
 */
export function createExtraLandDiscShaderMaterial(
  themeId: number,
  initialPhase = 0.0,
  sunSpeed = 1.0,
  discRadius = 21.0
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: false,
    depthWrite: true,
    depthTest: true,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    side: THREE.DoubleSide,
    toneMapped: false,
    uniforms: {
      uTime: { value: 0.0 },
      uThemeId: { value: themeId },
      uPhaseOffset: { value: initialPhase },
      uOpacity: { value: 1.0 },
      uShowNeonRim: { value: 0.0 },
      uSunSpeed: { value: sunSpeed },
      uMountainScale: { value: 1.0 },
      uDiscRadius: { value: discRadius },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uPhaseOffset;
      uniform float uMountainScale;

      varying vec2 vUv;
      varying vec3 vLocalPos;
      varying vec3 vWorldPos;
      varying vec3 vSlopeNormal;
      varying float vElev;
      varying float vIceWallMask;

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise2D(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash21(i);
        float b = hash21(i + vec2(1.0, 0.0));
        float c = hash21(i + vec2(0.0, 1.0));
        float d = hash21(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.52;
        mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
        for (int i = 0; i < 4; i++) {
          v += a * noise2D(p);
          p = rot * p * 2.08 + vec2(1.7, 9.2);
          a *= 0.48;
        }
        return v;
      }

      // Fast 2-octave height sampler for finite-difference vertex slope normals
      float sampleWorldHeightFast(vec2 uvCoord) {
        vec2 p = (uvCoord - 0.5) * 2.0;
        float r = length(p);
        float angle = atan(p.y, p.x);
        float iceWallBand = smoothstep(0.81, 0.865, r) * (1.0 - smoothstep(0.96, 0.995, r));
        float iceHeight = iceWallBand * 0.68;

        vec2 baseCoord = vec2(cos(angle + uPhaseOffset * 0.6), sin(angle + uPhaseOffset * 0.6)) * (r * 3.5);
        float contNoise = noise2D(baseCoord * 1.55 + vec2(uPhaseOffset, uPhaseOffset * 0.7)) * 0.65
                        + noise2D(baseCoord * 3.2 - vec2(uPhaseOffset)) * 0.35;
        float ridgeDetail = 1.0 - abs(noise2D(baseCoord * 5.2) * 2.0 - 1.0);
        float radialZone = smoothstep(0.06, 0.14, r) * (1.0 - smoothstep(0.65, 0.80, r));
        float rawLand = (contNoise * 0.76 + ridgeDetail * 0.24) * radialZone;

        float landHeight = 0.0;
        if (rawLand > 0.41) {
          float normLand = (rawLand - 0.41) / 0.59;
          landHeight = pow(normLand, 1.35) * 0.85;
        }
        return max(landHeight, iceHeight);
      }

      float sampleWorldHeight(vec2 uvCoord, out float iceMaskOut) {
        vec2 p = (uvCoord - 0.5) * 2.0;
        float r = length(p);
        float angle = atan(p.y, p.x);

        // 1. 3D Antarctic-style Ice Wall Continent & Rim around the world (r = 0.82 .. 0.99)
        float iceWallBand = smoothstep(0.81, 0.865, r) * (1.0 - smoothstep(0.96, 0.995, r));
        float iceCrags = fbm(vec2(angle * 12.0, r * 24.0 + uPhaseOffset));
        float iceHeight = iceWallBand * (0.48 + 0.52 * iceCrags) * 0.88;
        iceMaskOut = iceWallBand;

        // 2. Photorealistic 3D Continental Landmasses, Peninsulas, Archipelagos & Mountain Cordilleras (r = 0.07 .. 0.79)
        vec2 baseCoord = vec2(cos(angle + uPhaseOffset * 0.6), sin(angle + uPhaseOffset * 0.6)) * (r * 3.5);
        vec2 warp = vec2(
          fbm(baseCoord * 1.4 + vec2(uPhaseOffset, 2.3)),
          fbm(baseCoord * 1.4 + vec2(5.1, -uPhaseOffset))
        );
        float contNoise = fbm(baseCoord * 1.55 + warp * 0.65 + vec2(uPhaseOffset, uPhaseOffset * 0.7));
        float ridgeDetail = 1.0 - abs(noise2D(baseCoord * 5.2 + warp * 1.2) * 2.0 - 1.0);
        float radialZone = smoothstep(0.06, 0.14, r) * (1.0 - smoothstep(0.65, 0.80, r));
        float rawLand = (contNoise * 0.76 + ridgeDetail * 0.24) * radialZone;

        float landHeight = 0.0;
        if (rawLand > 0.41) {
          float normLand = (rawLand - 0.41) / 0.59;
          float tectonicChain = pow(ridgeDetail, 2.2) * smoothstep(0.18, 0.65, normLand);
          landHeight = (pow(normLand, 1.35) * 0.75 + tectonicChain * 0.55);
        }

        return max(landHeight, iceHeight);
      }

      void main() {
        vUv = uv;
        vec3 pos = position;

        float iceMask = 0.0;
        float h = sampleWorldHeight(uv, iceMask);
        vElev = h;
        vIceWallMask = iceMask;

        // Physical 3D vertex elevation along Y axis (matching Earth's 3D terrain relief)
        pos.y += h * uMountainScale;

        // Fast finite-difference 3D slope normals for realistic directional sunlight on mountains & ice cliffs
        float eps = 0.008;
        float hL = sampleWorldHeightFast(uv - vec2(eps, 0.0));
        float hR = sampleWorldHeightFast(uv + vec2(eps, 0.0));
        float hD = sampleWorldHeightFast(uv - vec2(0.0, eps));
        float hU = sampleWorldHeightFast(uv + vec2(0.0, eps));

        vec3 localNormal = normalize(vec3((hL - hR) * 3.4, 1.0, (hD - hU) * 3.4));
        vSlopeNormal = normalize(mat3(modelMatrix) * localNormal);

        vLocalPos = pos;
        vec4 wp = modelMatrix * vec4(pos, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uThemeId;
      uniform float uPhaseOffset;
      uniform float uOpacity;
      uniform float uShowNeonRim;
      uniform float uSunSpeed;
      uniform float uDiscRadius;

      varying vec2 vUv;
      varying vec3 vLocalPos;
      varying vec3 vWorldPos;
      varying vec3 vSlopeNormal;
      varying float vElev;
      varying float vIceWallMask;

      const float PI = 3.141592653589793;

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise2D(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash21(i);
        float b = hash21(i + vec2(1.0, 0.0));
        float c = hash21(i + vec2(0.0, 1.0));
        float d = hash21(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.52;
        mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
        for (int i = 0; i < 4; i++) {
          v += a * noise2D(p);
          p = rot * p * 2.08 + vec2(1.7, 9.2);
          a *= 0.48;
        }
        return v;
      }

      // Stable, flicker-free ocean wave normal generator (calibrated frequencies to eliminate sub-pixel moiré/shimmering at distance)
      vec3 calculateWaterSurface(vec2 p, float time) {
        float t = time * 0.45;
        vec2 p1 = p * 9.5;
        vec2 p2 = vec2(p.x * 0.866 - p.y * 0.5, p.x * 0.5 + p.y * 0.866) * 15.0;
        vec2 p3 = vec2(-p.x * 0.38 + p.y * 0.92, -p.x * 0.92 - p.y * 0.38) * 23.0;

        float ph1 = dot(p1, vec2(0.707, 0.707)) + t * 1.1;
        float ph2 = dot(p2, vec2(0.894, -0.447)) - t * 1.3;
        float ph3 = dot(p3, vec2(-0.555, 0.832)) + t * 1.6;

        vec2 grad = vec2(0.707, 0.707) * cos(ph1) * 0.018
                  + vec2(0.894, -0.447) * cos(ph2) * 0.012
                  + vec2(-0.555, 0.832) * cos(ph3) * 0.007;

        return normalize(vec3(-grad.x, 1.0, -grad.y));
      }

      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float r = length(p);
        if (r > 0.995) discard;

        float t = uTime * 0.25 + uPhaseOffset;

        // 1. LOCAL 3D SUN & MOON POSITION IN NORMALIZED DISC COORDINATES
        float sunAngle = t * 0.85 * uSunSpeed + 1.65;
        vec2 sunPos = vec2(cos(sunAngle), sin(sunAngle)) * 0.40;
        float distToInternalSun = length(p - sunPos);

        float moonAngle = sunAngle - 2.35;
        vec2 moonPos = vec2(cos(moonAngle), sin(moonAngle)) * 0.54;
        float distToInternalMoon = length(p - moonPos);

        // CALIBRATED LOCAL SOLAR ILLUMINATION FOR NEIGHBOR PLANETS:
        // Constrained solar radius (0.64 of normalized disc radius) so the local Sun only illuminates
        // the region where it is passing (~45% of the disc), leaving the rest of the planet's plane in realistic nocturnal darkness!
        float sunRadiusNorm = 0.64;
        float daylight = 0.0;
        if (distToInternalSun < sunRadiusNorm) {
          float normDist = distToInternalSun / sunRadiusNorm;
          daylight = pow(smoothstep(1.0, 0.14, normDist), 1.45);
        }

        // Subtle local Moonlight on the nocturnal hemisphere
        float moonRadiusNorm = 0.44;
        float effectiveMoonlight = 0.0;
        if (distToInternalMoon < moonRadiusNorm) {
          float normDistMoon = distToInternalMoon / moonRadiusNorm;
          effectiveMoonlight = pow(smoothstep(1.0, 0.12, normDistMoon), 1.45) * 0.65;
        }

        // 2. LAND / OCEAN / COASTAL SHELF / MOUNTAIN ELEVATION CLASSIFICATION
        float isIceWall = smoothstep(0.12, 0.42, vIceWallMask);
        float isLand = smoothstep(0.012, 0.055, vElev) * (1.0 - isIceWall);
        float isWater = (1.0 - isLand) * (1.0 - isIceWall);
        float coastalShelf = smoothstep(0.0, 0.015, vElev) * isWater;
        float mountainPeakFactor = smoothstep(0.32, 0.82, vElev) * isLand;

        vec2 detailCoord = p * 7.5 + vec2(uPhaseOffset, -uPhaseOffset);
        float detailNoise = fbm(detailCoord);
        float fineBiomeNoise = fbm(p * 18.0 + vec2(3.1, 7.4));

        // 3. PHOTOREALISTIC NASA SATELLITE PALETTES (Natural Earth-like realism while preserving each world's signature)
        // Note: As requested by the user ("as nuvens e o gelo não podem ser brancas!"), the Antarctic Ice Wall and Mountain Summits
        // of each neighbor planet are colored in the planet's real chromatic mineral/glacial tone (NOT white!).
        vec3 abyssalOcean = vec3(0.018, 0.075, 0.175);
        vec3 shelfOcean = vec3(0.04, 0.28, 0.52);
        vec3 coastalLagoon = vec3(0.08, 0.48, 0.68);
        vec3 lushBiome = vec3(0.11, 0.34, 0.14);
        vec3 plainsBiome = vec3(0.36, 0.44, 0.22);
        vec3 aridBiome = vec3(0.64, 0.53, 0.36);
        vec3 rockMountain = vec3(0.42, 0.37, 0.33);
        vec3 snowSummit = vec3(0.72, 0.78, 0.86);
        vec3 iceWallBase = vec3(0.42, 0.56, 0.74);
        vec3 iceWallCrest = vec3(0.62, 0.76, 0.90);
        vec3 reflectedSkyTone = vec3(0.24, 0.48, 0.78);

        if (uThemeId < 1.5) {
          // 1: MERCÚRIO — Gelo e picos em cinza-prata metálico / chumbo (sem branco!)
          abyssalOcean = vec3(0.025, 0.065, 0.125);
          shelfOcean = vec3(0.08, 0.18, 0.28);
          coastalLagoon = vec3(0.18, 0.32, 0.44);
          lushBiome = vec3(0.24, 0.28, 0.32);
          plainsBiome = vec3(0.38, 0.42, 0.47);
          aridBiome = vec3(0.54, 0.58, 0.64);
          rockMountain = vec3(0.42, 0.46, 0.52);
          snowSummit = vec3(0.64, 0.69, 0.76);
          iceWallBase = vec3(0.38, 0.43, 0.50);
          iceWallCrest = vec3(0.58, 0.64, 0.72);
          reflectedSkyTone = vec3(0.45, 0.54, 0.66);
        } else if (uThemeId < 2.5) {
          // 2: VÊNUS — Gelo e picos em amarelo-ouro / âmbar cristalino (sem branco!)
          abyssalOcean = vec3(0.025, 0.095, 0.135);
          shelfOcean = vec3(0.07, 0.26, 0.30);
          coastalLagoon = vec3(0.18, 0.46, 0.42);
          lushBiome = vec3(0.22, 0.36, 0.12);
          plainsBiome = vec3(0.48, 0.44, 0.16);
          aridBiome = vec3(0.76, 0.60, 0.24);
          rockMountain = vec3(0.52, 0.42, 0.14);
          snowSummit = vec3(0.90, 0.74, 0.18);
          iceWallBase = vec3(0.62, 0.48, 0.08);
          iceWallCrest = vec3(0.88, 0.70, 0.16);
          reflectedSkyTone = vec3(0.68, 0.58, 0.24);
        } else if (uThemeId < 3.5) {
          // 3: MARTE — Gelo e picos em vermelho-rubi / terracota congelado (sem branco!)
          abyssalOcean = vec3(0.022, 0.052, 0.105);
          shelfOcean = vec3(0.07, 0.16, 0.24);
          coastalLagoon = vec3(0.16, 0.28, 0.34);
          lushBiome = vec3(0.28, 0.22, 0.14);
          plainsBiome = vec3(0.54, 0.26, 0.14);
          aridBiome = vec3(0.76, 0.36, 0.20);
          rockMountain = vec3(0.48, 0.20, 0.12);
          snowSummit = vec3(0.86, 0.34, 0.20);
          iceWallBase = vec3(0.54, 0.16, 0.10);
          iceWallCrest = vec3(0.82, 0.30, 0.18);
          reflectedSkyTone = vec3(0.66, 0.28, 0.20);
        } else if (uThemeId < 4.5) {
          // 4: JÚPITER — Gelo e picos em laranja-âmbar / cobre glacial (sem branco!)
          abyssalOcean = vec3(0.020, 0.070, 0.145);
          shelfOcean = vec3(0.06, 0.22, 0.34);
          coastalLagoon = vec3(0.16, 0.38, 0.46);
          lushBiome = vec3(0.24, 0.32, 0.14);
          plainsBiome = vec3(0.52, 0.36, 0.18);
          aridBiome = vec3(0.78, 0.50, 0.26);
          rockMountain = vec3(0.50, 0.30, 0.16);
          snowSummit = vec3(0.88, 0.54, 0.22);
          iceWallBase = vec3(0.58, 0.32, 0.12);
          iceWallCrest = vec3(0.84, 0.50, 0.20);
          reflectedSkyTone = vec3(0.68, 0.46, 0.26);
        } else if (uThemeId < 5.5) {
          // 5: SATURNO — Gelo e picos em ouro-ocre / bronze solar (sem branco!)
          abyssalOcean = vec3(0.020, 0.082, 0.155);
          shelfOcean = vec3(0.06, 0.25, 0.36);
          coastalLagoon = vec3(0.16, 0.44, 0.48);
          lushBiome = vec3(0.20, 0.35, 0.15);
          plainsBiome = vec3(0.48, 0.42, 0.22);
          aridBiome = vec3(0.76, 0.66, 0.38);
          rockMountain = vec3(0.52, 0.44, 0.22);
          snowSummit = vec3(0.86, 0.72, 0.30);
          iceWallBase = vec3(0.56, 0.46, 0.16);
          iceWallCrest = vec3(0.82, 0.68, 0.28);
          reflectedSkyTone = vec3(0.66, 0.58, 0.32);
        } else if (uThemeId < 6.5) {
          // 6: URANO — Gelo e picos em ciano-turquesa profundo (sem branco!)
          abyssalOcean = vec3(0.014, 0.085, 0.185);
          shelfOcean = vec3(0.04, 0.28, 0.46);
          coastalLagoon = vec3(0.10, 0.54, 0.68);
          lushBiome = vec3(0.10, 0.34, 0.26);
          plainsBiome = vec3(0.22, 0.46, 0.42);
          aridBiome = vec3(0.44, 0.64, 0.68);
          rockMountain = vec3(0.18, 0.46, 0.54);
          snowSummit = vec3(0.22, 0.78, 0.88);
          iceWallBase = vec3(0.10, 0.50, 0.62);
          iceWallCrest = vec3(0.20, 0.76, 0.86);
          reflectedSkyTone = vec3(0.24, 0.62, 0.78);
        } else if (uThemeId > 6.5) {
          // 7: NETUNO — Gelo e picos em azul-cobalto / safira glacial (sem branco!)
          abyssalOcean = vec3(0.012, 0.055, 0.205);
          shelfOcean = vec3(0.04, 0.20, 0.50);
          coastalLagoon = vec3(0.08, 0.40, 0.74);
          lushBiome = vec3(0.10, 0.28, 0.24);
          plainsBiome = vec3(0.20, 0.36, 0.44);
          aridBiome = vec3(0.38, 0.52, 0.70);
          rockMountain = vec3(0.18, 0.34, 0.62);
          snowSummit = vec3(0.28, 0.56, 0.92);
          iceWallBase = vec3(0.14, 0.34, 0.68);
          iceWallCrest = vec3(0.26, 0.54, 0.90);
          reflectedSkyTone = vec3(0.22, 0.44, 0.84);
        }

        // Compose realistic bathymetric ocean depth (Abyssal -> Continental Shelf -> Turquoise Coastal Lagoons)
        float oceanDepthMix = smoothstep(0.15, 0.85, detailNoise);
        vec3 oceanColor = mix(abyssalOcean, shelfOcean, oceanDepthMix);
        oceanColor = mix(oceanColor, coastalLagoon, coastalShelf * 0.55);

        // Compose realistic multi-biome continental land (Forests/Lowlands -> Plains -> Arid Interiors -> Rocky Ridges -> Colored Summits)
        float latFactor = clamp(r / 0.82, 0.0, 1.0);
        float aridity = smoothstep(0.32, 0.74, detailNoise + fineBiomeNoise * 0.25 - (1.0 - latFactor) * 0.15);
        vec3 lowBiome = mix(lushBiome, plainsBiome, smoothstep(0.25, 0.65, fineBiomeNoise));
        vec3 baseLand = mix(lowBiome, aridBiome, aridity);
        vec3 elevatedLand = mix(baseLand, rockMountain, smoothstep(0.14, 0.48, vElev));
        vec3 landColor = mix(elevatedLand, snowSummit, mountainPeakFactor * 0.85);

        // Real solar directional lighting on 3D mountain slopes and Antarctic ice cliffs (matching Earth lines 595-599)
        vec3 localSunWorldPos = vec3(
          vWorldPos.x + (sunPos.x - p.x) * uDiscRadius,
          vWorldPos.y + 3.2,
          vWorldPos.z + (sunPos.y - p.y) * uDiscRadius
        );
        vec3 sunDir = normalize(localSunWorldPos - vWorldPos);
        float slopeDot = max(0.12, dot(normalize(vSlopeNormal), sunDir));
        if (vElev > 0.02 && daylight > 0.001) {
          landColor *= mix(1.0, 0.65 + 0.50 * slopeDot, daylight);
        }

        // Colored 3D Glacial Wall around the edge of each neighbor world (colored by the planet's real hue, NOT white!)
        vec3 iceWallCol = mix(iceWallBase, iceWallCrest, detailNoise * 0.7 + 0.3);
        iceWallCol *= mix(1.0, 0.68 + 0.46 * slopeDot, daylight);

        vec3 dayColor = oceanColor * isWater + landColor * isLand + iceWallCol * isIceWall;

        // 4. EXACT EARTH DAY / NIGHT / MOONLIGHT / CITY LIGHTS BLENDING (PlanarCanvas.tsx lines 610-650)
        vec3 baseNightTerrain = vec3(0.0);
        if (isWater > 0.01) {
          vec3 nightWater = vec3(0.004, 0.012, 0.030) * 0.015;
          baseNightTerrain = mix(baseNightTerrain, nightWater, isWater);
        }

        vec3 moonlightColor = vec3(0.42, 0.58, 0.85);
        vec3 moonlightDirect = dayColor * moonlightColor * (effectiveMoonlight * 0.038);
        vec3 illuminatedNightTerrain = baseNightTerrain + moonlightDirect;

        // Neighbor planets have NO lit city lights on their nocturnal side (pure natural dark hemisphere)
        vec3 sunlitTerrain = dayColor * (0.85 + 0.35 * daylight);
        vec3 finalColor = mix(illuminatedNightTerrain, sunlitTerrain, daylight);

        // 5. STEADY PHYSICAL OCEAN FLUID OPTICS (Smooth Sunglint, Fresnel & Subsurface Scattering without flickering)
        if (isWater > 0.01) {
          vec3 waterNormal = calculateWaterSurface(vWorldPos.xz, uTime);
          vec3 viewDir = normalize(cameraPosition - vWorldPos);

          if (daylight > 0.001) {
            vec3 halfVec = normalize(sunDir + viewDir);
            float NdotH = max(0.0, dot(waterNormal, halfVec));

            float broadGlint = pow(NdotH, 14.0) * 0.28;
            float coreGlint = pow(NdotH, 42.0) * 0.75;
            float microFacet = pow(NdotH, 24.0) * 0.30;

            float glintTotal = (broadGlint + coreGlint + microFacet) * daylight * isWater;
            finalColor += vec3(1.0, 0.98, 0.92) * glintTotal;

            float NdotV = clamp(dot(waterNormal, viewDir), 0.0, 1.0);
            float fresnel = 0.025 + 0.975 * pow(1.0 - NdotV, 4.0);

            vec3 reflectedSky = mix(vec3(0.01, 0.02, 0.05), reflectedSkyTone, daylight);
            float sunFacing = max(0.0, dot(viewDir, sunDir));
            reflectedSky += vec3(0.6, 0.55, 0.4) * pow(sunFacing, 6.0) * daylight * 0.3;

            finalColor += reflectedSky * fresnel * 0.52 * isWater;

            float fwdScatter = max(0.0, dot(viewDir, -sunDir + vec3(0.0, 0.35, 0.0)));
            finalColor += coastalLagoon * 0.35 * pow(fwdScatter, 4.0) * daylight * isWater;
          }

          if (effectiveMoonlight > 0.001) {
            vec3 localMoonWorldPos = vec3(
              vWorldPos.x + (moonPos.x - p.x) * uDiscRadius,
              vWorldPos.y + 2.8,
              vWorldPos.z + (moonPos.y - p.y) * uDiscRadius
            );
            vec3 moonLightDir = normalize(localMoonWorldPos - vWorldPos);
            vec3 halfMoonVec = normalize(moonLightDir + viewDir);
            float NdotHMoon = max(0.0, dot(waterNormal, halfMoonVec));

            float moonGlint = (pow(NdotHMoon, 18.0) * 0.22 + pow(NdotHMoon, 45.0) * 0.65) * effectiveMoonlight * 0.05 * isWater;
            finalColor += vec3(0.55, 0.75, 1.0) * moonGlint;
          }
        }

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  });
}

/**
 * Creates a Photorealistic NASA Blue-Marble 3D Cloud Deck for each neighbor world:
 * - Uses the EXACT same 3D spherical domain-warped FBM meteorology as Earth's CloudLayer3D.ts
 *   (trade winds, mid-latitude cyclones, ITCZ equatorial cloud belt, cellular cumulus micro-detail)
 * - White clouds naturally pulled toward the planet's characteristic atmospheric color
 *   (yellowish-white on Venus, reddish-white on Mars, silver-white on Mercury, amber-cream on Jupiter/Saturn, cyan-blue on Uranus/Neptune)
 * - Smooth natural day/night illumination matching Earth's clouds!
 */
export function createNeighborWorldCloudDeckMaterial(
  themeId: number,
  initialPhase = 0.0,
  sunSpeed = 1.0,
  tierId = 0.0
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2 - tierId,
    polygonOffsetUnits: -2 - tierId,
    uniforms: {
      uTime: { value: 0.0 },
      uThemeId: { value: themeId },
      uPhaseOffset: { value: initialPhase },
      uSunSpeed: { value: sunSpeed },
      uTierId: { value: tierId },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uThemeId;
      uniform float uPhaseOffset;
      uniform float uSunSpeed;
      uniform float uTierId;

      varying vec2 vUv;
      varying vec3 vWorldPos;

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
        float a = 0.54;
        for (int i = 0; i < 3; i++) {
          v += a * noise3D(p);
          p = p * 2.15 + vec3(1.7, 9.2, 3.4);
          a *= 0.48;
        }
        return v;
      }

      // Maps normalized disc coordinates [-1..1] onto the unit meteorological sphere (identical to Earth's CloudLayer3D.ts!)
      vec3 normalizedDiscToSphereDir(vec2 pNorm) {
        float r = length(pNorm);
        float latDeg = 90.0 - (r / 0.75) * 180.0;
        float latRad = clamp(latDeg, -89.8, 89.8) * PI / 180.0;
        float lonRad = atan(pNorm.x, pNorm.y);
        float cosLat = cos(latRad);
        return normalize(vec3(cosLat * sin(lonRad), sin(latRad), cosLat * cos(lonRad)));
      }

      void main() {
        vec2 pNorm = (vUv - 0.5) * 2.0;
        float r = length(pNorm);
        if (r > 0.96) discard;

        // Smooth outer edge fade near the Antarctic ice rim and subtle polar eye fade (matching Earth)
        float outerFade = 1.0 - smoothstep(0.84, 0.96, r);
        float poleFade = smoothstep(0.015, 0.06, r);

        vec3 nSphere = normalizedDiscToSphereDir(pNorm);

        float driftSpeed = uTierId < 0.5 ? 0.012 : -0.016;
        float freqMult = uTierId < 0.5 ? 1.05 : 1.42;
        float drift = uTime * driftSpeed + uPhaseOffset;
        mat3 rotY = mat3(
          cos(drift), 0.0, sin(drift),
          0.0, 1.0, 0.0,
          -sin(drift), 0.0, cos(drift)
        );
        vec3 seedOffset = uTierId < 0.5 ? vec3(uPhaseOffset) : vec3(4.2 + uPhaseOffset, 1.9, 7.3);
        vec3 p = (rotY * nSphere) * freqMult + seedOffset;

        // High-efficiency 3D cyclonic domain warping (cuts 75% of 3D noise calls to prevent GPU lag!)
        vec3 q = vec3(
          fbm(p * 3.2 + vec3(0.0, uTime * 0.005, 0.0)),
          fbm(p * 3.2 + vec3(5.2, 1.3, 2.8)),
          fbm(p * 3.2 + vec3(1.7, 8.4, 4.1))
        );
        float rawCloud = fbm(p * 4.6 + q * 1.45);
        float microDetail = noise3D(p * 13.5 + q * 2.2);
        float combinedCloud = rawCloud * 0.78 + microDetail * 0.22;

        float lat = asin(clamp(nSphere.y, -1.0, 1.0));
        float itcz = exp(-pow(lat / 0.16, 2.0)) * 0.16;
        float stormBelts = exp(-pow((abs(lat) - 0.82) / 0.30, 2.0)) * 0.15;

        float thresholdLow = uTierId < 0.5 ? 0.44 : 0.49;
        float thresholdHigh = uTierId < 0.5 ? 0.73 : 0.77;
        float density = smoothstep(thresholdLow, thresholdHigh, combinedCloud + itcz + stormBelts);
        density *= outerFade * poleFade;
        if (density < 0.01) discard;

        // Calibrated Cloud Day/Night & Twilight Illumination matching the planet's 0.64 solar radius
        // so clouds on the opposite side of the planet stay dark in the nocturnal shadow!
        float t = uTime * 0.25 + uPhaseOffset;
        float sunAngle = t * 0.85 * uSunSpeed + 1.65;
        vec2 sunPos = vec2(cos(sunAngle), sin(sunAngle)) * 0.40;
        float normSunDist = length(pNorm - sunPos) / 0.64;
        float dayCloud = pow(smoothstep(1.08, 0.22, normSunDist), 1.25);

        float whiteCoreMask = 1.0 - smoothstep(0.45, 0.72, normSunDist);
        float twilightCloud = smoothstep(1.05, 0.88, normSunDist) * (1.0 - smoothstep(0.02, 0.18, 1.0 - normSunDist)) * (1.0 - whiteCoreMask);

        float moonAngle = sunAngle - 2.35;
        vec2 moonPos = vec2(cos(moonAngle), sin(moonAngle)) * 0.54;
        float normMoonDist = length(pNorm - moonPos) / 0.44;
        float moonLit = pow(smoothstep(1.0, 0.12, normMoonDist), 1.35) * 0.35;

        float ridgeHighlight = smoothstep(0.42, 0.82, combinedCloud + microDetail * 0.18);

        // As requested ("as nuvens não podem ser brancas! as nuvens devem ser 50% igual à cor real do planeta"):
        // Each planet's clouds are a rich 50% blend with the planet's real signature color (zero pure white!).
        vec3 planetRealColor = vec3(0.25, 0.58, 0.95);
        if (uThemeId > 0.5 && uThemeId < 1.5) {
          // Mercúrio: cor real cinza-prata metálico / ardósia
          planetRealColor = vec3(0.52, 0.58, 0.66);
        } else if (uThemeId > 1.5 && uThemeId < 2.5) {
          // Vênus: cor real amarelo-ouro solar intenso
          planetRealColor = vec3(0.96, 0.74, 0.06);
        } else if (uThemeId > 2.5 && uThemeId < 3.5) {
          // Marte: cor real vermelho-ferrugem / carmesim marciano
          planetRealColor = vec3(0.88, 0.24, 0.08);
        } else if (uThemeId > 3.5 && uThemeId < 4.5) {
          // Júpiter: cor real laranja-âmbar imperial
          planetRealColor = vec3(0.92, 0.46, 0.10);
        } else if (uThemeId > 4.5 && uThemeId < 5.5) {
          // Saturno: cor real ouro-ocre / dourado
          planetRealColor = vec3(0.88, 0.68, 0.18);
        } else if (uThemeId > 5.5 && uThemeId < 6.5) {
          // Urano: cor real ciano-turquesa
          planetRealColor = vec3(0.08, 0.76, 0.88);
        } else if (uThemeId > 6.5) {
          // Netuno: cor real azul-cobalto profundo
          planetRealColor = vec3(0.16, 0.42, 0.92);
        }

        // Exact 50% planet real color + 50% neutral cloud body so clouds are NEVER white,
        // clearly showing 50% of the planet's true chromatic identity!
        vec3 neutralCloudLight = vec3(0.84, 0.85, 0.87);
        vec3 neutralCloudShadow = vec3(0.46, 0.48, 0.52);
        vec3 cloudBrightTint = mix(neutralCloudLight, planetRealColor, 0.55);
        vec3 cloudShadowTint = mix(neutralCloudShadow, planetRealColor * 0.68, 0.60);

        vec3 planetTintedCloud = mix(cloudShadowTint, cloudBrightTint, clamp(ridgeHighlight + whiteCoreMask * 0.20, 0.0, 1.0));
        vec3 sunsetCloud = mix(planetRealColor * 0.75, mix(vec3(0.95, 0.52, 0.20), planetRealColor, 0.5), ridgeHighlight);
        vec3 moonCloudCol = mix(vec3(0.45, 0.62, 0.85), planetRealColor, 0.5) * moonLit * 0.50;
        vec3 nightCloud = vec3(0.012, 0.020, 0.040) * 0.45 + moonCloudCol;

        vec3 dayLitCol = planetTintedCloud * (0.78 + 0.26 * dayCloud);
        vec3 col = mix(nightCloud, dayLitCol, dayCloud);
        col = mix(col, sunsetCloud, twilightCloud * 0.42);

        float opacityMult = uTierId < 0.5 ? 0.86 : 0.64;
        float visFactor = mix(max(0.16, moonLit * 0.65), 0.92, max(dayCloud, twilightCloud * 0.45));
        float alpha = density * opacityMult * visFactor;
        if (alpha < 0.008) discard;

        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
}

/**
 * Creates a Ground Cloud Shadow Shader projected onto each neighbor world's continents and oceans
 * (matching Earth's PlanarPhotorealisticCloudShadows_Group in CloudLayer3D.ts)
 */
export function createNeighborWorldCloudShadowMaterial(
  initialPhase = 0.0,
  sunSpeed = 1.0
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    uniforms: {
      uTime: { value: 0.0 },
      uPhaseOffset: { value: initialPhase },
      uSunSpeed: { value: sunSpeed },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uPhaseOffset;
      uniform float uSunSpeed;
      varying vec2 vUv;

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
        float a = 0.55;
        for (int i = 0; i < 2; i++) {
          v += a * noise3D(p);
          p = p * 2.15 + vec3(1.7, 9.2, 3.4);
          a *= 0.48;
        }
        return v;
      }

      vec3 normalizedDiscToSphereDir(vec2 pNorm) {
        float r = length(pNorm);
        float latDeg = 90.0 - (r / 0.75) * 180.0;
        float latRad = clamp(latDeg, -89.8, 89.8) * PI / 180.0;
        float lonRad = atan(pNorm.x, pNorm.y);
        float cosLat = cos(latRad);
        return normalize(vec3(cosLat * sin(lonRad), sin(latRad), cosLat * cos(lonRad)));
      }

      void main() {
        vec2 pNorm = (vUv - 0.5) * 2.0;
        float r = length(pNorm);
        if (r > 0.94) discard;

        float t = uTime * 0.25 + uPhaseOffset;
        float sunAngle = t * 0.85 * uSunSpeed + 1.65;
        vec2 sunPos = vec2(cos(sunAngle), sin(sunAngle)) * 0.40;
        float normSunDist = length(pNorm - sunPos) / 0.64;
        float dayFactor = pow(smoothstep(1.0, 0.14, normSunDist), 1.35);
        if (dayFactor < 0.02) discard;

        vec2 toSun = normalize(sunPos - pNorm + vec2(0.0001));
        vec2 sampleNorm = pNorm + toSun * 0.022;
        vec3 nSphere = normalizedDiscToSphereDir(sampleNorm);

        float drift = uTime * 0.012 + uPhaseOffset;
        mat3 rotY = mat3(
          cos(drift), 0.0, sin(drift),
          0.0, 1.0, 0.0,
          -sin(drift), 0.0, cos(drift)
        );
        vec3 p = (rotY * nSphere) * 1.05 + vec3(uPhaseOffset);
        vec3 q = vec3(
          fbm(p * 3.2 + vec3(0.0, uTime * 0.005, 0.0)),
          fbm(p * 3.2 + vec3(5.2, 1.3, 2.8)),
          fbm(p * 3.2 + vec3(1.7, 8.4, 4.1))
        );
        float rawCloud = fbm(p * 4.6 + q * 1.25);
        float shadowDensity = smoothstep(0.46, 0.76, rawCloud) * (1.0 - smoothstep(0.82, 0.94, r));
        float alpha = shadowDensity * dayFactor * 0.34;
        if (alpha < 0.01) discard;

        gl_FragColor = vec4(0.01, 0.02, 0.05, alpha);
      }
    `,
  });
}

/**
 * Creates a 3D Over-Arching Solar Dust/Cloud Rainbow-Band Material ("arco de cima para baixo como se o Sol rodasse
 * e jogasse a poeira para cima formando arcos paralelos de uma ponta à outra sobre o planeta"):
 * - Matches the user's exact sketch: parallel luminous cloud/dust arches rising from one side of the planet's plane,
 *   arching high over the local Sun, and descending to the opposite side of the planet!
 * - From above (top view), it looks like parallel ring bands crossing over the sunlit side of the planet;
 *   from the side/global view, it forms a multi-stranded rainbow-like dome arch of planet-colored cloud dust!
 */
export function createSolarVerticalDustTrailArcMaterial(
  themeId: number,
  initialPhase = 0.0,
  sunSpeed = 1.0,
  ringIntensity = 1.0
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    toneMapped: false,
    uniforms: {
      uTime: { value: 0.0 },
      uThemeId: { value: themeId },
      uPhaseOffset: { value: initialPhase },
      uSunSpeed: { value: sunSpeed },
      uRingIntensity: { value: ringIntensity },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vLocalPos;
      varying float vBandId;

      void main() {
        vUv = uv;
        vLocalPos = position;
        // Encode band index from vertex Z offset or UV
        vBandId = uv.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uThemeId;
      uniform float uPhaseOffset;
      uniform float uSunSpeed;
      uniform float uRingIntensity;

      varying vec2 vUv;
      varying vec3 vLocalPos;
      varying float vBandId;

      const float PI = 3.141592653589793;

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise2D(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash21(i);
        float b = hash21(i + vec2(1.0, 0.0));
        float c = hash21(i + vec2(0.0, 1.0));
        float d = hash21(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.52;
        mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
        for (int i = 0; i < 5; i++) {
          v += a * noise2D(p);
          p = rot * p * 2.06 + vec2(1.7, 9.2);
          a *= 0.48;
        }
        return v;
      }

      void main() {
        // vUv.x in [0..1] runs along the wide dome-arch from one side (0.0) over the top of the Sun (0.5) to the other side (1.0)
        // vUv.y in [0..1] runs vertically from the bottom glow zone (0.0, near the Sun/cloud deck) up to the single thin arch line at the top (0.86..0.95)
        // ("usar somente um risco ao invés de um risco abaixo do outro, e criar uma luz debaixo do risco")
        float uArc = vUv.x;
        float vHeightFrac = vUv.y;

        // Smooth fade where the two ends of the cupola arch touch the planet's cloud deck
        float endFade = smoothstep(0.0, 0.14, uArc) * (1.0 - smoothstep(0.86, 1.0, uArc));

        // 1. ONLY ONE THIN ARCH LINE AT THE TOP CREST (around vHeightFrac = 0.88)
        float singleTopRim = exp(-pow((vHeightFrac - 0.88) / 0.052, 2.0));

        // 2. INTENSE RADIANT LIGHT VEIL UNDERNEATH THE SINGLE ARCH ("aumente mais a intensidade dessa luz debaixo do risco")
        // Strongly illuminates the entire cupola space underneath the arch (vHeightFrac = 0.0 .. 0.88) down to the local Sun!
        // Also leaves a soft inner window around the Sun sphere (at uArc=0.5, vHeightFrac~0.35) so the glowing 3D Sun is 100% visible!
        float distFromApex = abs(uArc - 0.5) * 2.0; // 0 at top directly above the Sun, 1 at the outer ends
        float distFromSunOrb = length(vec2(distFromApex * 2.2, (vHeightFrac - 0.32) * 2.6));
        float sunClearWindow = smoothstep(0.08, 0.32, distFromSunOrb);

        float underArchMask = smoothstep(0.0, 0.16, vHeightFrac) * (1.0 - smoothstep(0.86, 0.94, vHeightFrac)) * (0.42 + 0.58 * sunClearWindow);
        float underLightGradient = (0.38 + 0.62 * pow(clamp(vHeightFrac / 0.88, 0.0, 1.0), 0.85)) * 1.15;

        // Animated solar dust/cloud flow thrown upward from the spinning Sun along the cupola arch
        float flowCoord = distFromApex * 4.2 - uTime * 0.48;
        float cloudNoise = fbm(vec2(flowCoord, vHeightFrac * 3.0 + uPhaseOffset));
        float wispyDetail = fbm(vec2(distFromApex * 8.0 - uTime * 0.75, vHeightFrac * 5.0 - uPhaseOffset));
        float cloudBody = smoothstep(0.16, 0.78, cloudNoise * 0.65 + wispyDetail * 0.35);

        // Strong solar glow concentration underneath the arch directly around the spinning Sun
        float sunUnderGlow = exp(-pow(distFromApex / 0.75, 2.0));
        float apexBoost = 0.92 + 0.65 * sunUnderGlow;

        // REAL-LIFE NASA TELESCOPE PALETTES FOR EACH PLANET (matching the user's reference photo of Jupiter & Saturn!)
        vec3 underLightColor = vec3(0.92, 0.80, 0.55);
        vec3 mainRimColor = vec3(1.0, 0.92, 0.70);

        if (uThemeId > 3.5 && uThemeId < 4.5) {
          // JÚPITER na vida real: luz inferior em âmbar-terracota/ocre intenso e risco superior em creme-dourado real de Júpiter
          underLightColor = mix(vec3(0.86, 0.52, 0.30), vec3(0.96, 0.76, 0.50), vHeightFrac);
          mainRimColor = vec3(1.0, 0.92, 0.76);
        } else if (uThemeId > 4.5 && uThemeId < 5.5) {
          // SATURNO na vida real: luz inferior em ouro-areia/creme radiante e risco superior em creme-amanteigado brilhante
          underLightColor = mix(vec3(0.84, 0.72, 0.48), vec3(0.96, 0.84, 0.58), vHeightFrac);
          mainRimColor = vec3(1.0, 0.94, 0.72);
        } else if (uThemeId > 5.5 && uThemeId < 6.5) {
          // URANO na vida real: luz inferior em ciano-água luminoso e risco superior em azul-gelo cristalino
          underLightColor = mix(vec3(0.42, 0.76, 0.86), vec3(0.64, 0.90, 0.96), vHeightFrac);
          mainRimColor = vec3(0.82, 0.97, 1.0);
        } else if (uThemeId > 6.5) {
          // NETUNO na vida real: luz inferior em azul-cobalto intenso e risco superior em safira-celeste brilhante
          underLightColor = mix(vec3(0.26, 0.52, 0.92), vec3(0.42, 0.68, 0.98), vHeightFrac);
          mainRimColor = vec3(0.62, 0.84, 1.0);
        }

        // Combine the intense glowing light underneath with the single crisp arch line on top
        vec3 baseCol = mix(underLightColor * 1.28, mainRimColor * 1.42, singleTopRim);
        vec3 sunlitCrestColor = mix(baseCol, vec3(1.0, 0.98, 0.90) * 1.35, 0.38 * singleTopRim + 0.32 * sunUnderGlow);

        float rimContribution = singleTopRim * (0.78 + 0.22 * cloudBody) * 1.25;
        float underLightContribution = underArchMask * underLightGradient * (0.72 + 0.28 * cloudNoise) * (0.70 + 0.50 * sunUnderGlow);

        float combinedProfile = clamp(rimContribution + underLightContribution, 0.0, 1.0);
        float alpha = endFade * combinedProfile * apexBoost * uRingIntensity * 0.95;
        alpha = clamp(alpha, 0.0, 0.96);
        if (alpha < 0.006) discard;

        gl_FragColor = vec4(sunlitCrestColor, alpha);
      }
    `,
  });
}

/**
 * Creates the Antarctica Fluid & Magnetic Neon Containment Barrier Rings around our Planar Earth
 * AND the Outer Extra Lands Worlds ("Terras Extras" beyond Antarctica when the explorer crosses the barrier)
 * AND the Primordial Liquid Glass Mirror Ceiling ("Teto de Vidro Líquido") at the top of the firmament!
 */
export interface NeighborWorldEntry {
  id: CosmicDiscWorldId;
  name: string;
  x: number;
  z: number;
  orbitRadius: number;
  angleDeg: number;
  discRadius: number;
  sunOrbitRadius: number;
  moonOrbitRadius: number;
  sunSpeed: number;
  moonSpeed: number;
  phaseOffset: number;
  primaryColorHex: string;
  secondaryColorHex: string;
  group: THREE.Group;
  discMat: THREE.ShaderMaterial;
  cloudMat: THREE.ShaderMaterial;
  cloudMidMat: THREE.ShaderMaterial;
  cloudShadowMat: THREE.ShaderMaterial;
  sunTrailArchMat?: THREE.ShaderMaterial;
  sunOverArchGroup?: THREE.Group;
  moonMat: THREE.ShaderMaterial;
  localSunGroup: THREE.Group;
  localMoonGroup: THREE.Group;
  mirrorOrbGroup: THREE.Group;
  mirrorBeamLine: THREE.Line;
}

/**
 * Mathematical Constants of the Planar Mirror-Atlas Cosmology:
 * - MIRROR_CEILING_HEIGHT_Y = 1360.0 (Elevated 20x higher above the planar ocean, from 68.0 to 1360.0; Earth's local Sun/Moon are at Y ~ 7-8)
 * - Every world i centered at (X_i, 0, Z_i) in the pitch-black infinite ocean projects its light vertically up
 *   through the stratified liquid-density layers to the oil-water mirror boundary at (X_i, MIRROR_CEILING_HEIGHT_Y, Z_i).
 * - Earth at (0, 0, 0) projects straight up to (0, 1360.0, 0) = Polaris (fixed blurred blue-white star).
 */
export const MIRROR_CEILING_HEIGHT_Y = 1360.0;

/**
 * True Realistic Sky-Map Layout of the Neighboring Planar Worlds around Earth (Polaris / Estrela Polar at 0,0):
 * - In the real sky, Polaris (Earth's reflection at +90° North Celestial Pole, center 0,0) sits isolated at the pole,
 *   surrounded ONLY by circumpolar stars (Ursa Minor, Draco, Cepheus, Cassiopeia, Ursa Major).
 * - NO planet ever passes near Polaris! Mars, Jupiter, Saturn, Venus, Mercury, Uranus, and Neptune travel strictly
 *   along the distant Ecliptic / Zodiac belt (+23.5° to -23.5° Declination, i.e., 66.5° to 113.5° angular distance away from Polaris!).
 * - Therefore, the planetary discs and their sky-mirror reflections are placed far out in the Zodiac ring (orbitRadius 380 to 560),
 *   leaving the entire central polar sky around Polaris 100% clean and faithful to real astrophotography:
 *   • Jupiter (Taurus / Touro, Dec +22° N): orbitRadius = 385.0, angleDeg = 335°
 *   • Mars (Gemini / Cancer, Dec +23° N): orbitRadius = 395.0, angleDeg = 28°
 *   • Uranus (Aries / Triangulum, Dec +18° N): orbitRadius = 425.0, angleDeg = 305°
 *   • Venus (Leo / Leão, Dec +14° N): orbitRadius = 445.0, angleDeg = 72°
 *   • Mercury (Hydra / Sextans, Dec -06° S): orbitRadius = 485.0, angleDeg = 125°
 *   • Neptune (Pisces / Cetus, Dec -08° S): orbitRadius = 510.0, angleDeg = 245°
 *   • Saturn (Puppis / Aquarius-Pisces ecliptic south, Dec -24° S): orbitRadius = 550.0, angleDeg = 178°
 */
export const NEIGHBOR_SOLAR_SYSTEMS_LAYOUT: {
  id: CosmicDiscWorldId;
  orbitRadius: number;
  angleDeg: number;
  discRadius: number;
  skyConstellation: string;
  raLabel: string;
  decLabel: string;
}[] = [
  { id: 'jupiter', orbitRadius: 385.0, angleDeg: 335, discRadius: 26.0, skyConstellation: 'Taurus (Touro)', raLabel: '04h 45m', decLabel: '+22° N (68° de Polaris)' },
  { id: 'mars', orbitRadius: 395.0, angleDeg: 28, discRadius: 19.5, skyConstellation: 'Gemini / Cancer', raLabel: '07h 45m', decLabel: '+23° N (67° de Polaris)' },
  { id: 'uranus', orbitRadius: 425.0, angleDeg: 305, discRadius: 21.0, skyConstellation: 'Aries / Triangulum', raLabel: '03h 15m', decLabel: '+18° N (72° de Polaris)' },
  { id: 'venus', orbitRadius: 445.0, angleDeg: 72, discRadius: 21.0, skyConstellation: 'Leo (Leão)', raLabel: '10h 15m', decLabel: '+14° N (76° de Polaris)' },
  { id: 'mercury', orbitRadius: 485.0, angleDeg: 125, discRadius: 16.0, skyConstellation: 'Hydra / Sextans', raLabel: '11h 30m', decLabel: '-06° S (96° de Polaris)' },
  { id: 'neptune', orbitRadius: 510.0, angleDeg: 245, discRadius: 21.0, skyConstellation: 'Pisces / Cetus', raLabel: '01h 50m', decLabel: '-08° S (98° de Polaris)' },
  { id: 'saturn', orbitRadius: 550.0, angleDeg: 178, discRadius: 25.0, skyConstellation: 'Aquarius / Eclíptica Sul', raLabel: '07h 10m', decLabel: '-24° S (114° de Polaris)' },
];

export function getWorldCenterCoords(worldId: CosmicDiscWorldId = 'earth'): {
  x: number;
  z: number;
  discRadius: number;
  orbitRadius: number;
  angleDeg: number;
} {
  if (!worldId || worldId === 'earth') {
    return { x: 0, z: 0, discRadius: 48.0, orbitRadius: 0, angleDeg: 0 };
  }
  const found = NEIGHBOR_SOLAR_SYSTEMS_LAYOUT.find((w) => w.id === worldId);
  if (!found) {
    return { x: 0, z: 0, discRadius: 48.0, orbitRadius: 0, angleDeg: 0 };
  }
  const rad = (found.angleDeg * Math.PI) / 180;
  return {
    x: Math.cos(rad) * found.orbitRadius,
    z: Math.sin(rad) * found.orbitRadius,
    discRadius: found.discRadius,
    orbitRadius: found.orbitRadius,
    angleDeg: found.angleDeg,
  };
}

/**
 * Generates a soft, radially blurred glowing orb texture ("bola borrada com luz"):
 * Even under maximum zoom, the reflection in the liquid mirror is a blurred luminous sphere
 * with the chromatic signature of its solar system (blue-white for Earth, yellow-gold for Venus, red for Mars).
 */
export function generateBlurredMirrorProjectionTexture(
  coreColorHex: string,
  haloColorHex: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 256, 256);

  const grad = ctx.createRadialGradient(128, 128, 2, 128, 128, 124);
  grad.addColorStop(0.0, '#ffffff');
  grad.addColorStop(0.18, coreColorHex);
  grad.addColorStop(0.45, haloColorHex);
  grad.addColorStop(0.75, `${haloColorHex}44`);
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

export interface CosmicMirrorSystem3D {
  antarcticaNeonBarrierGroup: THREE.Group;
  outerExtraWorldsGroup: THREE.Group;
  liquidGlassMirrorGroup: THREE.Group;
  neighborWorlds: NeighborWorldEntry[];
  update: (
    timeSeconds: number,
    showExtraLands: boolean,
    showSpaceBackground: boolean,
    isHuman: boolean,
    isSky?: boolean,
    observerPos?: THREE.Vector3,
    daylightFactor?: number,
    activePlanarWorld?: CosmicDiscWorldId,
    selectedAstroId?: string | null
  ) => void;
  dispose: () => void;
}

export function createCosmicMirrorSystem3D(scene: THREE.Scene): CosmicMirrorSystem3D {
  // 1. ANTARCTICA NEON FLUID & MAGNETIC BOUNDARY RINGS (Around Earth Disc at r = 46.8 .. 48.2)
  const antarcticaNeonBarrierGroup = new THREE.Group();
  antarcticaNeonBarrierGroup.name = 'AntarcticaNeonFluidBarrier_Group';

  const barrierGeo = new THREE.RingGeometry(45.2, 49.4, 256, 1);
  barrierGeo.rotateX(-Math.PI / 2);

  const barrierUniforms = {
    uTime: { value: 0.0 },
  };

  const barrierMat = new THREE.ShaderMaterial({
    uniforms: barrierUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
    vertexShader: `
      varying vec3 vLocalPos;
      void main() {
        vLocalPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec3 vLocalPos;

      void main() {
        float r = length(vLocalPos.xz);
        float angle = atan(vLocalPos.z, vLocalPos.x);

        // Inner Electric Cyan-Blue Ring (r = 46.85) + Outer Neon Pink-Purple Ring (r = 48.05)
        float dCyan = abs(r - 46.85);
        float dPink = abs(r - 48.05);

        float pulse = 0.92 + 0.08 * sin(uTime * 1.5 + angle * 4.0);
        float cyanGlow = (exp(-pow(dCyan / 0.22, 2.0)) * 1.35 + exp(-pow(dCyan / 0.65, 2.0)) * 0.45) * pulse;
        float pinkGlow = (exp(-pow(dPink / 0.26, 2.0)) * 1.45 + exp(-pow(dPink / 0.85, 2.0)) * 0.55) * pulse;

        vec3 col = vec3(0.20, 0.80, 1.0) * cyanGlow + vec3(0.96, 0.22, 0.82) * pinkGlow;
        float alpha = clamp((cyanGlow + pinkGlow) * 0.85, 0.0, 1.0);
        if (alpha < 0.01) discard;

        gl_FragColor = vec4(col, alpha);
      }
    `,
  });

  const barrierMesh = new THREE.Mesh(barrierGeo, barrierMat);
  barrierMesh.position.y = 0.14;
  barrierMesh.renderOrder = 6;
  antarcticaNeonBarrierGroup.add(barrierMesh);
  scene.add(antarcticaNeonBarrierGroup);

  // 2. OUTER NEIGHBORING SOLAR SYSTEMS IN THE PITCH-BLACK INFINITE OCEAN
  // Each neighbor world (Venus, Mars, Mercury, Jupiter, Saturn, Uranus, Neptune + hundreds of distant star-worlds)
  // is a flat planar disc ("como uma pizza") with its own Ice Wall border, its own colored atmosphere,
  // and its own 3D Sun & Moon orbiting above its disc and reflecting on its ocean!
  const outerExtraWorldsGroup = new THREE.Group();
  outerExtraWorldsGroup.name = 'OuterExtraWorldsBeyondAntarctica_Group';

  // High Oil-Water Mirror Ceiling Group at Y = MIRROR_CEILING_HEIGHT_Y (68.0)
  const globalMirrorCeilingGroup = new THREE.Group();
  globalMirrorCeilingGroup.name = 'GlobalOilWaterMirrorCeiling_Group';
  outerExtraWorldsGroup.add(globalMirrorCeilingGroup);

  // A. The Stratified Liquid-Oil Interface Plane ("linha plana onde a água não se mistura com o óleo") at Y = 1360.0
  const mirrorSheetGeo = new THREE.RingGeometry(0.01, 880.0, 128, 32);
  mirrorSheetGeo.rotateX(-Math.PI / 2);
  const mirrorSheetUniforms = {
    uTime: { value: 0.0 },
  };
  const mirrorSheetMat = new THREE.ShaderMaterial({
    uniforms: mirrorSheetUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec3 vWorldPos;
      void main() {
        float r = length(vWorldPos.xz);
        if (r > 875.0) discard;
        float angle = atan(vWorldPos.z, vWorldPos.x);

        // Subtle liquid-oil surface tension ripples on the mirror ceiling at Y = 1360.0
        float ripple1 = sin(r * 0.14 - uTime * 0.45) * 0.5 + 0.5;
        float ripple2 = cos(angle * 12.0 + r * 0.08 + uTime * 0.25) * 0.5 + 0.5;
        float radialFade = (1.0 - smoothstep(560.0, 875.0, r));

        // Concentric atlas navigation rings on the liquid mirror ceiling
        float atlasRing = exp(-pow(sin(r * 0.065), 2.0) / 0.008) * 0.18;

        vec3 oilWaterTint = mix(vec3(0.04, 0.16, 0.38), vec3(0.08, 0.28, 0.56), ripple1 * ripple2);
        float alpha = (0.038 + 0.025 * ripple1 * ripple2 + atlasRing * 0.08) * radialFade;
        if (alpha < 0.002) discard;

        gl_FragColor = vec4(oilWaterTint, alpha);
      }
    `,
  });
  const mirrorSheetMesh = new THREE.Mesh(mirrorSheetGeo, mirrorSheetMat);
  mirrorSheetMesh.position.y = MIRROR_CEILING_HEIGHT_Y;
  mirrorSheetMesh.renderOrder = 2;
  globalMirrorCeilingGroup.add(mirrorSheetMesh);

  // B. Translucent Fluid Density Strata Shells between Y = 240 and Y = 1360 ("líquidos com densidades diferentes até a linha de óleo")
  const densityLevels = [
    { y: 440.0, color: 0x0a2463, alpha: 0.018 },
    { y: 760.0, color: 0x1e3a8a, alpha: 0.022 },
    { y: 1080.0, color: 0x1d4ed8, alpha: 0.026 },
  ];
  densityLevels.forEach((lvl) => {
    const stratumGeo = new THREE.RingGeometry(0.1, 720.0, 96, 1);
    stratumGeo.rotateX(-Math.PI / 2);
    const stratumMat = new THREE.MeshBasicMaterial({
      color: lvl.color,
      transparent: true,
      opacity: lvl.alpha,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const stratumMesh = new THREE.Mesh(stratumGeo, stratumMat);
    stratumMesh.position.y = lvl.y;
    globalMirrorCeilingGroup.add(stratumMesh);
  });

  // C. EARTH'S OWN MIRROR PROJECTION AT POLARIS (0, MIRROR_CEILING_HEIGHT_Y, 0):
  // "A Terra é a Estrela Polar já que ela é fixa no céu; se eu olhar para ela vejo uma bola brilhante borrada azul com branco!"
  const earthPolarisMirrorGroup = new THREE.Group();
  earthPolarisMirrorGroup.position.set(0, MIRROR_CEILING_HEIGHT_Y, 0);
  const earthBlurredTex = generateBlurredMirrorProjectionTexture('#60a5fa', '#1d4ed8');
  const earthMirrorSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: earthBlurredTex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
      toneMapped: false,
    })
  );
  earthMirrorSprite.scale.set(28.0, 28.0, 1.0);
  earthPolarisMirrorGroup.add(earthMirrorSprite);

  // Inner blurred blue-white core sphere for Earth's Polaris projection
  const earthCoreGeo = new THREE.SphereGeometry(2.4, 24, 24);
  const earthCoreMat = new THREE.MeshBasicMaterial({
    color: 0xdbeafe,
    transparent: true,
    opacity: 0.92,
    toneMapped: false,
  });
  earthPolarisMirrorGroup.add(new THREE.Mesh(earthCoreGeo, earthCoreMat));

  // Vertical optical reflection beam from Earth (0,0,0) up to Polaris (0, 68, 0)
  const earthBeamGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.2, 0),
    new THREE.Vector3(0, MIRROR_CEILING_HEIGHT_Y, 0),
  ]);
  const earthBeamMat = new THREE.LineDashedMaterial({
    color: 0x60a5fa,
    dashSize: 1.5,
    gapSize: 1.0,
    transparent: true,
    opacity: 0.32,
  });
  const earthBeamLine = new THREE.Line(earthBeamGeo, earthBeamMat);
  earthBeamLine.computeLineDistances();
  globalMirrorCeilingGroup.add(earthBeamLine);
  globalMirrorCeilingGroup.add(earthPolarisMirrorGroup);

  // D. BUILD NEIGHBORING PLANETARY SOLAR SYSTEMS ON THE DARK OCEAN + THEIR EXACT MIRROR PROJECTIONS AT Y = 68.0
  const neighborWorlds: NeighborWorldEntry[] = [];
  const sharedSunGeo = new THREE.SphereGeometry(0.32, 32, 32);
  const sharedMoonGeo = new THREE.SphereGeometry(0.26, 32, 32);
  const sunSparkleTex = generateSunSparkleTexture();
  const moonTex = generateMoonTexture();
  const moonHaloTex = generateMoonGlowTexture();

  NEIGHBOR_SOLAR_SYSTEMS_LAYOUT.forEach((item, idx) => {
    const spec = COSMIC_WORLD_SPECS[item.id];
    const wGroup = new THREE.Group();
    const angleRad = (item.angleDeg * Math.PI) / 180;
    const wx = Math.cos(angleRad) * item.orbitRadius;
    const wz = Math.sin(angleRad) * item.orbitRadius;
    wGroup.position.set(wx, 0.14, wz);

    // 1. True 3D Planar World Disc with Volumetric 3D Mountains, Continents, 3D Antarctic Ice Wall Cliff, and Natural Day/Night Illumination (Just like 3D Earth!)
    const discGeo = new THREE.RingGeometry(0.001, item.discRadius, 88, 48);
    discGeo.rotateX(-Math.PI / 2);
    const posAttr = discGeo.attributes.position;
    const uvAttr = discGeo.attributes.uv;
    for (let vi = 0; vi < posAttr.count; vi++) {
      const vx = posAttr.getX(vi);
      const vz = posAttr.getZ(vi);
      uvAttr.setXY(
        vi,
        vx / (item.discRadius * 2.0) + 0.5,
        vz / (item.discRadius * 2.0) + 0.5
      );
    }
    uvAttr.needsUpdate = true;

    const phaseOffset = idx * 1.3;
    const discMat = createExtraLandDiscShaderMaterial(
      spec.themeId,
      phaseOffset,
      spec.sunSpeed,
      item.discRadius
    );
    const discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.renderOrder = 3;
    wGroup.add(discMesh);

    // 1B. 3D Outer Glacial Cliff Skirt around the planet's Antarctic Ice Wall (gives true vertical 3D thickness like Earth's ice wall)
    const iceSkirtHeight = 1.15;
    const iceSkirtGeo = new THREE.CylinderGeometry(
      item.discRadius * 0.992,
      item.discRadius * 1.015,
      iceSkirtHeight,
      96,
      1,
      true
    );
    const iceSkirtMat = new THREE.MeshBasicMaterial({
      color: 0x0b1528,
      side: THREE.DoubleSide,
    });
    const iceSkirtMesh = new THREE.Mesh(iceSkirtGeo, iceSkirtMat);
    iceSkirtMesh.position.y = iceSkirtHeight * 0.36;
    wGroup.add(iceSkirtMesh);

    // 1C. Photorealistic Ground Cloud Shadows + 2 Stratified 3D Volumetric Cloud Decks (Low Cumulus + Mid/High Cyclonic Swirls)
    // Exact same spherical domain-warped FBM meteorology as Earth, with white clouds subtly pulled toward the planet's color!
    const cloudGeo = new THREE.RingGeometry(0.001, item.discRadius * 0.96, 64, 32);
    cloudGeo.rotateX(-Math.PI / 2);
    const cPosAttr = cloudGeo.attributes.position;
    const cUvAttr = cloudGeo.attributes.uv;
    for (let vi = 0; vi < cPosAttr.count; vi++) {
      const vx = cPosAttr.getX(vi);
      const vz = cPosAttr.getZ(vi);
      cUvAttr.setXY(
        vi,
        vx / (item.discRadius * 2.0) + 0.5,
        vz / (item.discRadius * 2.0) + 0.5
      );
    }
    cUvAttr.needsUpdate = true;

    const cloudShadowMat = createNeighborWorldCloudShadowMaterial(phaseOffset, spec.sunSpeed);
    const cloudShadowMesh = new THREE.Mesh(cloudGeo, cloudShadowMat);
    cloudShadowMesh.position.y = 0.08;
    cloudShadowMesh.renderOrder = 3;
    wGroup.add(cloudShadowMesh);

    const cloudMat = createNeighborWorldCloudDeckMaterial(spec.themeId, phaseOffset, spec.sunSpeed, 0.0);
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    cloudMesh.position.y = 0.88;
    cloudMesh.renderOrder = 4;
    wGroup.add(cloudMesh);

    const cloudMidMat = createNeighborWorldCloudDeckMaterial(spec.themeId, phaseOffset, spec.sunSpeed, 1.0);
    const cloudMidMesh = new THREE.Mesh(cloudGeo, cloudMidMat);
    cloudMidMesh.position.y = 1.25;
    cloudMidMesh.renderOrder = 5;
    wGroup.add(cloudMidMesh);

    // 2. Photorealistic Local 3D Sun (Identical to Earth's Sun: incandescent photosphere + natural sun sparkle rays, NO artificial spotlight cone!)
    const localSunGroup = new THREE.Group();
    const localSunMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
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
          vec3 coreWhite = vec3(1.0, 1.0, 0.96);
          vec3 limbGold = vec3(1.0, 0.92, 0.55);
          vec3 sunBase = mix(limbGold, coreWhite, pow(facing, 0.45));
          float alpha = smoothstep(0.0, 0.42, facing);
          gl_FragColor = vec4(sunBase, alpha);
        }
      `,
    });
    const localSunMesh = new THREE.Mesh(sharedSunGeo, localSunMat);
    localSunMesh.renderOrder = 10;
    localSunGroup.add(localSunMesh);

    const localSunSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: sunSparkleTex,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.98,
        depthWrite: false,
        toneMapped: false,
      })
    );
    localSunSprite.scale.set(2.6, 2.6, 1.0);
    localSunSprite.renderOrder = 11;
    localSunGroup.add(localSunSprite);
    wGroup.add(localSunGroup);

    // 2B. OVER-ARCHING 3D SOLAR DUST/CLOUD RAINBOW-DOME BANDS FOR RINGED PLANETS (Saturn, Uranus, Jupiter, Neptune):
    // Matches the user's exact drawing:
    // - Viewed from the side: 4-5 parallel luminous cloud/dust arches rising from one side of the planet's disc,
    //   arching high over the local Sun (Y = 6..9), and descending to the opposite side of the planet!
    // - Viewed from above: parallel ring bands crossing over the sunlit side of the planet as if the spinning Sun
    //   is throwing a wide arch of dust/clouds upward!
    let sunTrailArchMat: THREE.ShaderMaterial | undefined;
    let sunOverArchGroup: THREE.Group | undefined;
    const isRingedPlanet =
      item.id === 'saturn' ||
      item.id === 'uranus' ||
      item.id === 'jupiter' ||
      item.id === 'neptune';

    if (isRingedPlanet) {
      sunOverArchGroup = new THREE.Group();
      const ringIntensity =
        item.id === 'saturn'
          ? 1.15
          : item.id === 'uranus'
          ? 0.95
          : item.id === 'jupiter'
          ? 0.80
          : 0.72;

      sunTrailArchMat = createSolarVerticalDustTrailArcMaterial(
        spec.themeId,
        phaseOffset,
        spec.sunSpeed,
        ringIntensity
      );

      // Build a perfectly straight vertical cupola arch curtain ("em linha reta, sem ficar torto ou barrigudo"):
      // Strictly flat in the vertical plane (pz = 0.0) so it never looks crooked or bulged from any angle,
      // with a clean straight bottom edge at the cloud deck (y = 0.55) and a smooth arch on top (v = 1.0)!
      const archSpanX = item.discRadius * 0.90;
      const topPeakY = item.id === 'saturn' ? 8.8 : item.id === 'uranus' ? 7.8 : 7.2;

      const archGeo = new THREE.PlaneGeometry(2.0, 1.0, 96, 32);
      const aPos = archGeo.attributes.position;
      const aUv = archGeo.attributes.uv;
      for (let vi = 0; vi < aPos.count; vi++) {
        const u = aUv.getX(vi); // 0..1 along the arch from left (-archSpanX) to right (+archSpanX)
        const v = aUv.getY(vi); // 0..1 vertically from the flat planet base (0.0) up to the top arch rim (1.0)
        const normX = (u - 0.5) * 2.0; // -1..1

        const px = normX * archSpanX;
        const domeCurve = Math.max(0.0, 1.0 - normX * normX);
        const archTopY = Math.pow(domeCurve, 0.78) * topPeakY;
        const py = 0.55 + v * archTopY;
        const pz = 0.0; // 100% straight line in Z — zero belly or tilt!

        aPos.setXYZ(vi, px, py, pz);
      }
      aPos.needsUpdate = true;
      archGeo.computeVertexNormals();

      const archMesh = new THREE.Mesh(archGeo, sunTrailArchMat);
      archMesh.renderOrder = 6;
      sunOverArchGroup.add(archMesh);

      wGroup.add(sunOverArchGroup);
    }

    // 3. Photorealistic Local 3D Moon (Identical to Earth's Moon: real lunar regolith texture + dynamic phase shading oriented toward the local Sun!)
    const localMoonGroup = new THREE.Group();
    const moonMat = new THREE.ShaderMaterial({
      uniforms: {
        uMoonTexture: { value: moonTex },
        uLocalSunPos: { value: new THREE.Vector3(0, 3.4, 0) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform sampler2D uMoonTexture;
        uniform vec3 uLocalSunPos;
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPos;
        void main() {
          vec4 texColor = texture2D(uMoonTexture, vUv);
          vec3 sunDir = normalize(uLocalSunPos - vWorldPos);
          vec3 norm = normalize(vWorldNormal);
          float NdotL = dot(norm, sunDir);
          float directSunlight = smoothstep(-0.02, 0.04, NdotL);
          float regolith = pow(clamp(NdotL + 0.08, 0.0, 1.0), 0.72) * 1.35;
          vec3 litColor = texColor.rgb * (vec3(1.08, 1.10, 1.14) + regolith * 0.38);
          vec3 darkSide = texColor.rgb * vec3(0.04, 0.045, 0.06);
          gl_FragColor = vec4(mix(darkSide, litColor, directSunlight), 1.0);
        }
      `,
    });
    const localMoonMesh = new THREE.Mesh(sharedMoonGeo, moonMat);
    localMoonGroup.add(localMoonMesh);

    const localMoonSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: moonHaloTex,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
      })
    );
    localMoonSprite.scale.set(1.6, 1.6, 1.0);
    localMoonGroup.add(localMoonSprite);
    wGroup.add(localMoonGroup);

    outerExtraWorldsGroup.add(wGroup);

    // 5. Mathematical Mirror Projection at (wx, MIRROR_CEILING_HEIGHT_Y, wz):
    // The light of this world's Sun & ocean reflects on the oil-water mirror ceiling directly overhead!
    // Even if zoomed in, it is a blurred glowing sphere ("bola borrada com luz") of the world's color!
    const mirrorOrbGroup = new THREE.Group();
    mirrorOrbGroup.position.set(wx, MIRROR_CEILING_HEIGHT_Y, wz);

    const orbTex = generateBlurredMirrorProjectionTexture(spec.primaryColorHex, spec.secondaryColorHex);
    const orbSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: orbTex,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        toneMapped: false,
      })
    );
    const orbSize = 22.0 * spec.discScale;
    orbSprite.scale.set(orbSize, orbSize, 1.0);
    mirrorOrbGroup.add(orbSprite);

    const blurredCoreMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.8 * spec.discScale, 20, 20),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(spec.primaryColorHex),
        transparent: true,
        opacity: 0.90,
        toneMapped: false,
      })
    );
    mirrorOrbGroup.add(blurredCoreMesh);
    globalMirrorCeilingGroup.add(mirrorOrbGroup);

    // Vertical reflection ray connecting the neighbor world on the ocean (wx, 0, wz) to its mirror star (wx, 68, wz)
    const beamGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(wx, 0.2, wz),
      new THREE.Vector3(wx, MIRROR_CEILING_HEIGHT_Y, wz),
    ]);
    const beamMat = new THREE.LineDashedMaterial({
      color: new THREE.Color(spec.primaryColorHex),
      dashSize: 1.4,
      gapSize: 1.0,
      transparent: true,
      opacity: 0.28,
    });
    const mirrorBeamLine = new THREE.Line(beamGeo, beamMat);
    mirrorBeamLine.computeLineDistances();
    globalMirrorCeilingGroup.add(mirrorBeamLine);

    neighborWorlds.push({
      id: item.id,
      name: spec.name,
      x: wx,
      z: wz,
      orbitRadius: item.orbitRadius,
      angleDeg: item.angleDeg,
      discRadius: item.discRadius,
      sunOrbitRadius: item.discRadius * spec.sunOrbitRadius,
      moonOrbitRadius: item.discRadius * spec.moonOrbitRadius,
      sunSpeed: spec.sunSpeed,
      moonSpeed: spec.moonSpeed,
      phaseOffset,
      primaryColorHex: spec.primaryColorHex,
      secondaryColorHex: spec.secondaryColorHex,
      group: wGroup,
      discMat,
      cloudMat,
      cloudMidMat,
      cloudShadowMat,
      sunTrailArchMat,
      sunOverArchGroup,
      moonMat,
      localSunGroup,
      localMoonGroup,
      mirrorOrbGroup,
      mirrorBeamLine,
    });
  });

  // Clean dark ocean & mirror ceiling: removed the hundreds of artificial glowing points/stars
  // and polygonal rings so only Earth and the real 3D neighbor planets (with their mirror reflections) are displayed!
  scene.add(outerExtraWorldsGroup);

  // 3. O CÉU COMO UM ESPELHO PRIMORDIAL / OCEANO DE TENSÃO SUPERFICIAL (Reflete SOMENTE A LUZ de cada sistema solar!)
  // "Preciso que o céu somente mostre a luz de cada sistema solar ou reflita a luz de cada sistema solar e não criar outra
  // imagem de cada sistema solar no céu!"
  // "Devido à distância colossal de 1 trilhão de quilômetros, não conseguimos enxergar detalhes microscópicos. A distância
  // mistura a luz e mantém o céu noturno firme, sutil, majestoso e estável."
  const liquidGlassMirrorGroup = new THREE.Group();
  liquidGlassMirrorGroup.name = 'PrimordialOceanMirrorSky_Group';

  const observerSkyMirrorGroup = new THREE.Group();
  observerSkyMirrorGroup.name = 'ObserverPrimordialOceanSky_Group';

  // Superfície de Espelho Plano do Céu (O Céu como um Espelho Real da Luz de Cada Sistema Solar lá embaixo no plano):
  // - NÃO gira em torno do observador!
  // - NÃO cria luzes em posições inventadas!
  // - Calcula matematicamente o ponto de impacto do olhar no Espelho do Céu (worldHitXZ) e reflete diretamente
  //   a luz de cada sistema solar na sua coordenada exata (X, Z) do plano terrestre:
  //   • Terra no centro exato (0, 0)
  //   • Vênus em (70.45, 49.33)  [Raio 86, 35°]
  //   • Marte em (-38.88, 83.38) [Raio 92, 115°]
  //   • Mercúrio em (-75.34, -20.19) [Raio 78, 195°]
  //   • Júpiter em (-10.28, -117.55) [Raio 118, 265°]
  //   • Saturno em (103.21, -72.27)  [Raio 126, 325°]
  const oceanSkyDomeGeo = new THREE.SphereGeometry(1700.0, 96, 64, 0, Math.PI * 2, 0, Math.PI * 0.52);
  const oceanSkyUniforms = {
    uTime: { value: 0.0 },
    uDaylight: { value: 0.0 },
    uObserverXZ: { value: new THREE.Vector2(0, 0) },
  };
  const oceanSkyDomeMat = new THREE.ShaderMaterial({
    uniforms: oceanSkyUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    vertexShader: `
      varying vec3 vLocalDir;
      void main() {
        vLocalDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uDaylight;
      uniform vec2 uObserverXZ;
      varying vec3 vLocalDir;

      // Calcula o reflexo espelhado real da luz de um sistema solar situado na posição (worldCenterXZ, worldRadius) lá embaixo no plano!
      vec3 reflectGroundSolarSystemLight(
        vec2 mirrorXZ,
        vec2 worldCenterXZ,
        float worldDiscRadius,
        float sunOrbitFrac,
        float sunSpeed,
        float phaseOffset,
        vec3 atmGlowColor,
        vec3 sunCoreColor,
        vec3 neonRimColor
      ) {
        vec2 dVec = mirrorXZ - worldCenterXZ;
        float dist = length(dVec);
        float normR = dist / worldDiscRadius;

        // 1. Brilho difuso da atmosfera fluida do sistema solar refletida no espelho do céu
        float atmGlow = exp(-pow(normR * 1.15, 2.0)) * 0.75 + exp(-normR * 2.2) * 0.35;

        // 2. Reflexo do Anel Neon de contenção da borda de cada sistema solar
        float rimGlow = exp(-pow((normR - 0.96) / 0.14, 2.0)) * 0.45;

        // 3. Reflexo do Sol próprio e da Lua própria que iluminam cada sistema solar lá embaixo
        float sunAngle = -uTime * 0.55 * sunSpeed - 1.75 + phaseOffset;
        vec2 sunPosXZ = worldCenterXZ + vec2(cos(sunAngle), sin(sunAngle)) * (worldDiscRadius * sunOrbitFrac);
        float distToInternalSun = length(mirrorXZ - sunPosXZ) / worldDiscRadius;
        float internalSunReflection = exp(-pow(distToInternalSun / 0.24, 2.0)) * 1.35 + exp(-distToInternalSun / 0.55) * 0.50;

        float moonAngle = sunAngle + 2.2;
        vec2 moonPosXZ = worldCenterXZ + vec2(cos(moonAngle), sin(moonAngle)) * (worldDiscRadius * (sunOrbitFrac + 0.14));
        float distToInternalMoon = length(mirrorXZ - moonPosXZ) / worldDiscRadius;
        float internalMoonReflection = exp(-pow(distToInternalMoon / 0.12, 2.0)) * 0.55;

        return atmGlowColor * atmGlow
             + neonRimColor * rimGlow
             + sunCoreColor * internalSunReflection
             + vec3(0.85, 0.94, 1.0) * internalMoonReflection;
      }

      void main() {
        float elev = clamp(vLocalDir.y, 0.0, 1.0);
        if (elev <= 0.01) discard;

        vec3 rayDir = normalize(vLocalDir);

        // Lei da Reflexão de um Espelho Plano Horizontal situado a altura H_mirror acima do plano oceânico:
        // O raio visual que sobe na direção rayDir a partir do observador em uObserverXZ intercepta o espelho líquido!
        // Se estivermos na Terra (0,0), a projeção da Terra (bola borrada azul com branco) fica no zênite/Polaris e Vênus fica a 35°.
        // Se viajarmos para Vênus (86.01, 60.23), Vênus fica sobre nós e a TERRA aparece lá longe no céu como uma estrela (bola brilhante borrada azul com branco)!
        float mirrorHeight = 420.0;
        vec2 mirrorXZ = uObserverXZ + (rayDir.xz / (elev + 0.22)) * mirrorHeight;

        vec3 totalReflectedLight = vec3(0.0);

        // =====================================================================
        // 1. PROJEÇÃO ESPELHADA DA TERRA NO CÉU (Centro Exato do Plano: X = 0.0, Z = 0.0)
        // "A Estrela Polar fica isolada no centro cercada apenas pelas estrelas polares!"
        // =====================================================================
        totalReflectedLight += reflectGroundSolarSystemLight(
          mirrorXZ,
          vec2(0.0, 0.0),
          22.0,
          0.42,
          1.0,
          0.0,
          vec3(0.28, 0.68, 1.0),  // Bola brilhante borrada azul celeste com núcleo branco
          vec3(0.95, 0.99, 1.0),  // Núcleo branco-azulado radiante da Terra no espelho
          vec3(0.38, 0.82, 1.0)   // Halo da borda de gelo da Terra
        );

        // =====================================================================
        // 2. ESPELHO DA LUZ DOS SISTEMAS SOLARES VIZINHOS (Afastados na Faixa Real da Eclíptica / Zodíaco, longe da Estrela Polar!)
        // =====================================================================

        // Júpiter (Touro / Taurus, Raio 385.0, Ângulo 335° -> (348.93, -162.71), Disco 26.0)
        totalReflectedLight += reflectGroundSolarSystemLight(
          mirrorXZ,
          vec2(348.93, -162.71),
          26.0,
          0.40,
          0.82,
          0.0,
          vec3(0.95, 0.55, 0.12), // Luz âmbar e laranja de Júpiter
          vec3(1.0, 0.95, 0.80),
          vec3(0.92, 0.24, 0.82)
        );

        // Marte (Gêmeos / Câncer, Raio 395.0, Ângulo 28° -> (348.76, 185.44), Disco 19.5)
        totalReflectedLight += reflectGroundSolarSystemLight(
          mirrorXZ,
          vec2(348.76, 185.44),
          19.5,
          0.40,
          0.95,
          1.3,
          vec3(0.90, 0.28, 0.08), // Luz vermelho-acobreada de Marte
          vec3(1.0, 0.85, 0.68),
          vec3(0.92, 0.28, 0.85)
        );

        // Urano (Áries / Triangulum, Raio 425.0, Ângulo 305° -> (243.77, -348.14), Disco 21.0)
        totalReflectedLight += reflectGroundSolarSystemLight(
          mirrorXZ,
          vec2(243.77, -348.14),
          21.0,
          0.40,
          0.70,
          2.6,
          vec3(0.14, 0.82, 0.94), // Luz ciano-turquesa de Urano
          vec3(0.92, 0.99, 1.0),
          vec3(0.22, 0.78, 1.0)
        );

        // Vênus (Leão / Leo, Raio 445.0, Ângulo 72° -> (137.51, 423.22), Disco 21.0)
        totalReflectedLight += reflectGroundSolarSystemLight(
          mirrorXZ,
          vec2(137.51, 423.22),
          21.0,
          0.40,
          1.12,
          3.9,
          vec3(0.98, 0.78, 0.10), // Luz amarela e dourada de Vênus
          vec3(1.0, 0.96, 0.75),
          vec3(0.22, 0.78, 1.0)
        );

        // Mercúrio (Hydra / Sextans, Raio 485.0, Ângulo 125° -> (-278.18, 397.29), Disco 16.0)
        totalReflectedLight += reflectGroundSolarSystemLight(
          mirrorXZ,
          vec2(-278.18, 397.29),
          16.0,
          0.40,
          1.35,
          5.2,
          vec3(0.68, 0.76, 0.88), // Luz cinza-prateada de Mercúrio
          vec3(0.96, 0.98, 1.0),
          vec3(0.22, 0.78, 1.0)
        );

        // Netuno (Peixes / Cetus, Raio 510.0, Ângulo 245° -> (-215.54, -462.22), Disco 21.0)
        totalReflectedLight += reflectGroundSolarSystemLight(
          mirrorXZ,
          vec2(-215.54, -462.22),
          21.0,
          0.40,
          0.66,
          6.5,
          vec3(0.23, 0.51, 0.96), // Luz azul-cobalto de Netuno
          vec3(0.90, 0.96, 1.0),
          vec3(0.22, 0.78, 1.0)
        );

        // Saturno (Eclíptica Sul / Aquarius, Raio 550.0, Ângulo 178° -> (-549.66, 19.20), Disco 25.0)
        totalReflectedLight += reflectGroundSolarSystemLight(
          mirrorXZ,
          vec2(-549.66, 19.20),
          25.0,
          0.40,
          0.78,
          7.8,
          vec3(0.92, 0.74, 0.28), // Luz creme e ouro de Saturno
          vec3(1.0, 0.96, 0.82),
          vec3(0.22, 0.78, 1.0)
        );

        // =====================================================================
        // 3. REFLEXO DOS MEGA-SISTEMAS DO ZODÍACO E VIA LÁCTEA NO ESPELHO LÍQUIDO
        // =====================================================================
        float rMirror = length(mirrorXZ);
        float aMirror = atan(mirrorXZ.y, mirrorXZ.x);
        float zodiacRingGlow = exp(-pow((rMirror - 580.0) / 65.0, 2.0)) * (0.14 + 0.08 * sin(aMirror * 12.0));
        totalReflectedLight += vec3(0.28, 0.55, 0.95) * zodiacRingGlow;

        float horizonFade = smoothstep(0.01, 0.12, elev);
        float visibility = mix(0.95, 0.35, uDaylight * 0.70);
        gl_FragColor = vec4(totalReflectedLight, horizonFade * visibility);
      }
    `,
  });
  const oceanSkyDomeMesh = new THREE.Mesh(oceanSkyDomeGeo, oceanSkyDomeMat);
  oceanSkyDomeMesh.renderOrder = 1;
  observerSkyMirrorGroup.add(oceanSkyDomeMesh);

  liquidGlassMirrorGroup.add(observerSkyMirrorGroup);

  // C. ROTA DE NAVEGAÇÃO DO ATLAS UNIVERSAL NO OCEANO ESCURO + NAVIO/SONDA DE TRAVESSIA:
  // "O céu será um atlas, um mapa universal onde navegadores mapeiam o céu para chegar em um outro mundo!"
  const atlasNavigationGroup = new THREE.Group();
  atlasNavigationGroup.name = 'UniversalSkyAtlasNavigation_Group';
  const initialTargetCoords = getWorldCenterCoords('jupiter');
  const atlasOceanRouteGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.35, 0),
    new THREE.Vector3(initialTargetCoords.x, 0.35, initialTargetCoords.z),
  ]);
  const atlasOceanRouteMat = new THREE.LineDashedMaterial({
    color: 0x38bdf8,
    dashSize: 2.2,
    gapSize: 1.1,
    transparent: true,
    opacity: 0.90,
  });
  const atlasOceanRouteLine = new THREE.Line(atlasOceanRouteGeo, atlasOceanRouteMat);
  atlasOceanRouteLine.computeLineDistances();
  atlasNavigationGroup.add(atlasOceanRouteLine);

  const atlasSkySightGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.35, 0),
    new THREE.Vector3(initialTargetCoords.x, MIRROR_CEILING_HEIGHT_Y, initialTargetCoords.z),
  ]);
  const atlasSkySightMat = new THREE.LineDashedMaterial({
    color: 0xfacc15,
    dashSize: 1.8,
    gapSize: 1.0,
    transparent: true,
    opacity: 0.75,
  });
  const atlasSkySightLine = new THREE.Line(atlasSkySightGeo, atlasSkySightMat);
  atlasSkySightLine.computeLineDistances();
  atlasNavigationGroup.add(atlasSkySightLine);

  // Marcador Luminoso do Navegador / Expedição no Oceano Escuro (Navegando entre as Bordas de Gelo)
  const explorerVesselGroup = new THREE.Group();
  const vesselCoreMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.85, 2.6, 16),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, toneMapped: false })
  );
  vesselCoreMesh.rotation.x = Math.PI / 2;
  explorerVesselGroup.add(vesselCoreMesh);

  const vesselGlowSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: generateBlurredMirrorProjectionTexture('#38bdf8', '#facc15'),
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      toneMapped: false,
    })
  );
  vesselGlowSprite.scale.set(4.5, 4.5, 1.0);
  explorerVesselGroup.add(vesselGlowSprite);
  atlasNavigationGroup.add(explorerVesselGroup);

  outerExtraWorldsGroup.add(atlasNavigationGroup);

  // B. PITCH-BLACK ABYSSAL OCEAN BETWEEN SOLAR SYSTEMS:
  // "O que separa a Terra de Vênus é apenas um oceano escuro pois não chega a luz do Sol no oceano para que ele fique azul, vermelho ou amarelo."
  const infiniteOceanMirrorGeo = new THREE.PlaneGeometry(10000, 10000);
  infiniteOceanMirrorGeo.rotateX(-Math.PI / 2);
  const infiniteOceanMirrorUniforms = {
    uTime: { value: 0.0 },
  };
  const infiniteOceanMirrorMat = new THREE.ShaderMaterial({
    uniforms: infiniteOceanMirrorUniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec3 vWorldPos;
      void main() {
        float r = length(vWorldPos.xz);
        if (r < 48.4) discard;
        // Pitch-black unlit ocean water between worlds (no sunlight reaches here)
        gl_FragColor = vec4(0.002, 0.003, 0.006, 0.96);
      }
    `,
  });
  const infiniteOceanMirrorMesh = new THREE.Mesh(infiniteOceanMirrorGeo, infiniteOceanMirrorMat);
  infiniteOceanMirrorMesh.position.y = -0.25;
  infiniteOceanMirrorMesh.visible = false; // Earth's oceanGeo already renders the dark ocean floor at Y=0.05; hiding duplicate plane eliminates all ocean Z-fighting!
  outerExtraWorldsGroup.add(infiniteOceanMirrorMesh);

  scene.add(liquidGlassMirrorGroup);

  let lastRouteKey = '';

  return {
    antarcticaNeonBarrierGroup,
    outerExtraWorldsGroup,
    liquidGlassMirrorGroup,
    neighborWorlds,
    update: (
      timeSeconds: number,
      showExtraLands: boolean,
      showSpaceBackground: boolean,
      isHuman: boolean,
      isSky = false,
      observerPos?: THREE.Vector3,
      daylightFactor = 0.0,
      activePlanarWorld: CosmicDiscWorldId = 'earth',
      selectedAstroId: string | null = null
    ) => {
      barrierUniforms.uTime.value = timeSeconds;
      mirrorSheetUniforms.uTime.value = timeSeconds;
      // Círculo rosa e azul em volta da Terra removido conforme solicitado:
      antarcticaNeonBarrierGroup.visible = false;

      // Na visão Global / Cima / Lateral: mostra a Terra no centro, os sistemas solares vizinhos (Vênus, Marte, etc.)
      // no oceano escuro com seus próprios Sóis e Luas 3D girando, e a projeção espelhada lá no alto em Y = 68.0!
      outerExtraWorldsGroup.visible = (showExtraLands || showSpaceBackground) && !isHuman && !isSky;
      globalMirrorCeilingGroup.visible = showSpaceBackground && !isHuman && !isSky;

      if (outerExtraWorldsGroup.visible) {
        infiniteOceanMirrorUniforms.uTime.value = timeSeconds;
        neighborWorlds.forEach((entry) => {
          entry.group.visible = showExtraLands;
          entry.discMat.uniforms.uTime.value = timeSeconds;
          entry.cloudMat.uniforms.uTime.value = timeSeconds;
          entry.cloudMidMat.uniforms.uTime.value = timeSeconds;
          entry.cloudShadowMat.uniforms.uTime.value = timeSeconds;
          if (entry.sunTrailArchMat) {
            entry.sunTrailArchMat.uniforms.uTime.value = timeSeconds;
          }

          // Mathematical circular orbit of each neighbor world's own Sun & Moon above its disc:
          const t = timeSeconds * 0.25 + entry.phaseOffset;
          const sunAngle = t * 0.85 * entry.sunSpeed + 1.65;
          const moonAngle = sunAngle - 2.35;

          const sunY = 3.2;
          const moonY = 2.8;
          const sunLocalX = Math.cos(sunAngle) * entry.sunOrbitRadius;
          const sunLocalZ = Math.sin(sunAngle) * entry.sunOrbitRadius;
          entry.localSunGroup.position.set(sunLocalX, sunY, sunLocalZ);
          if (entry.sunOverArchGroup) {
            // Center the cupola arch directly above the local Sun (sunLocalX, 0, sunLocalZ)
            // so the Sun sits exactly underneath the apex of the thin dome arch!
            entry.sunOverArchGroup.position.set(sunLocalX, 0.0, sunLocalZ);
            entry.sunOverArchGroup.rotation.y = -sunAngle + Math.PI * 0.5;
          }
          entry.localMoonGroup.position.set(
            Math.cos(moonAngle) * entry.moonOrbitRadius,
            moonY,
            Math.sin(moonAngle) * entry.moonOrbitRadius
          );
          // Update local Moon phase shader with the world-space position of this planet's own Sun
          entry.moonMat.uniforms.uLocalSunPos.value.set(
            entry.x + sunLocalX,
            0.05 + sunY,
            entry.z + sunLocalZ
          );
        });

        // Update Universal Sky Atlas Navigation Triangle (Observer -> Mirror Star at Y=68 -> Target World in Dark Ocean)
        const targetWorldId: CosmicDiscWorldId | null =
          selectedAstroId && selectedAstroId in COSMIC_WORLD_SPECS
            ? (selectedAstroId as CosmicDiscWorldId)
            : activePlanarWorld !== 'earth'
            ? activePlanarWorld
            : null;

        if (targetWorldId && showExtraLands) {
          const destCoords = getWorldCenterCoords(targetWorldId);
          const originCoords =
            activePlanarWorld !== 'earth' && targetWorldId !== activePlanarWorld
              ? getWorldCenterCoords(activePlanarWorld)
              : { x: 0, z: 0 };

          const routeKey = `${originCoords.x}_${originCoords.z}_${destCoords.x}_${destCoords.z}`;
          if (routeKey !== lastRouteKey) {
            lastRouteKey = routeKey;
            atlasOceanRouteLine.geometry.setFromPoints([
              new THREE.Vector3(originCoords.x, 0.35, originCoords.z),
              new THREE.Vector3(destCoords.x, 0.35, destCoords.z),
            ]);
            atlasOceanRouteLine.computeLineDistances();

            atlasSkySightLine.geometry.setFromPoints([
              new THREE.Vector3(originCoords.x, 0.35, originCoords.z),
              new THREE.Vector3(destCoords.x, MIRROR_CEILING_HEIGHT_Y, destCoords.z),
            ]);
            atlasSkySightLine.computeLineDistances();
          }

          // Animate the expedition vessel moving across the dark ocean between the two ice walls
          const sailFrac = (timeSeconds * 0.12) % 1.0;
          const vx = originCoords.x + (destCoords.x - originCoords.x) * sailFrac;
          const vz = originCoords.z + (destCoords.z - originCoords.z) * sailFrac;
          explorerVesselGroup.position.set(vx, 0.55, vz);
          explorerVesselGroup.lookAt(destCoords.x, 0.55, destCoords.z);

          atlasNavigationGroup.visible = true;
        } else {
          atlasNavigationGroup.visible = false;
        }
      }

      // Na Visão do Céu ('sky') e na Visão Humana ('human'):
      // O observador olha para o Espelho Líquido lá no alto e vê a projeção borrada e brilhante de cada sistema solar
      // (Terra = Estrela Polar azul-esbranquiçada, Vênus = estrela amarela borrada, Marte = estrela vermelha borrada, etc.)
      const showSkyMirror = (isSky || isHuman) && (showExtraLands || showSpaceBackground);
      liquidGlassMirrorGroup.visible = showSkyMirror;
      if (showSkyMirror) {
        if (observerPos) {
          observerSkyMirrorGroup.position.set(observerPos.x, 0.05, observerPos.z);
          oceanSkyUniforms.uObserverXZ.value.set(observerPos.x, observerPos.z);
        }
        oceanSkyUniforms.uTime.value = timeSeconds;
        oceanSkyUniforms.uDaylight.value = isSky ? 0.0 : daylightFactor;
      }
    },
    dispose: () => {
      scene.remove(antarcticaNeonBarrierGroup);
      scene.remove(outerExtraWorldsGroup);
      scene.remove(liquidGlassMirrorGroup);
      barrierGeo.dispose();
      barrierMat.dispose();
      mirrorSheetGeo.dispose();
      mirrorSheetMat.dispose();
      oceanSkyDomeGeo.dispose();
      oceanSkyDomeMat.dispose();
      infiniteOceanMirrorGeo.dispose();
      infiniteOceanMirrorMat.dispose();
    },
  };
}
