import * as THREE from 'three';

export interface PrimordialUpperOceanSystem3D {
  group: THREE.Group;
  update: (
    timeSeconds: number,
    sunPos: THREE.Vector3,
    moonPos: THREE.Vector3,
    camera: THREE.Camera | null,
    isHuman: boolean,
    visible: boolean
  ) => void;
  dispose: () => void;
}

/**
 * Oceano Superior Primordial ("Águas Acima do Firmamento" / Teto de Água Líquida)
 * Situado a 1 trilhão de km (1.000.000.000.000 km) de altura acima do plano terrestre.
 * Renderiza uma camada oceânica 3D translúcida, com ondas suaves de tensão superficial,
 * refração cáustica, brilho especular do Sol e da Lua abaixo, e marcador visual da altitude
 * de 1.000.000.000.000 km (1 Trilhão de km).
 */
export function createPrimordialUpperOcean3D(scene: THREE.Scene): PrimordialUpperOceanSystem3D {
  const group = new THREE.Group();
  group.name = 'PrimordialUpperOcean_1TrillionKm_Group';

  // Altura visual representativa acima do plano na cena 3D (acima do Sol/Lua e camadas atmosféricas)
  const OCEAN_CEILING_Y = 38.0;
  const OCEAN_RADIUS = 64.0;

  // 1. Superfície Líquida do Oceano Superior (Disco de Água Primordial com Ondas e Cáusticas)
  const oceanGeo = new THREE.CircleGeometry(OCEAN_RADIUS, 128);
  oceanGeo.rotateX(-Math.PI / 2);

  const oceanUniforms = {
    uTime: { value: 0.0 },
    uSunPos: { value: new THREE.Vector3(0, 14, 0) },
    uMoonPos: { value: new THREE.Vector3(0, 12, 0) },
    uOceanRadius: { value: OCEAN_RADIUS },
  };

  const oceanMat = new THREE.ShaderMaterial({
    uniforms: oceanUniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: `
      uniform float uTime;
      varying vec3 vWorldPos;
      varying vec2 vUv;
      varying float vWaveHeight;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Ondas suaves de tensão superficial do Oceano a 1 Trilhão de km
        float r = length(pos.xz);
        float w1 = sin(pos.x * 0.22 + uTime * 0.9) * cos(pos.z * 0.22 + uTime * 0.7);
        float w2 = sin(r * 0.35 - uTime * 1.1) * 0.5;
        float wave = (w1 * 0.6 + w2 * 0.4) * smoothstep(64.0, 10.0, r) * 0.32;
        pos.y += wave;
        vWaveHeight = wave;

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uSunPos;
      uniform vec3 uMoonPos;
      uniform float uOceanRadius;

      varying vec3 vWorldPos;
      varying vec2 vUv;
      varying float vWaveHeight;

      // Gerador de ondulações e cáusticas líquidas sem costuras
      float causticPattern(vec2 p, float t) {
        vec2 p1 = p * 0.18 + vec2(t * 0.08, -t * 0.06);
        vec2 p2 = vec2(p.x * 0.866 - p.y * 0.5, p.x * 0.5 + p.y * 0.866) * 0.24 - vec2(t * 0.07, t * 0.09);
        float c1 = sin(p1.x * 3.14159) * cos(p1.y * 3.14159);
        float c2 = sin(p2.x * 3.14159) * cos(p2.y * 3.14159);
        return smoothstep(0.15, 0.88, (c1 + c2) * 0.5 + 0.5);
      }

      void main() {
        float r = length(vWorldPos.xz);
        if (r > uOceanRadius) discard;

        float edgeFade = smoothstep(uOceanRadius, uOceanRadius - 6.5, r);

        // Padrão de ondas e cáusticas oceânicas
        float caustics1 = causticPattern(vWorldPos.xz, uTime * 1.2);
        float caustics2 = causticPattern(vWorldPos.xz * 1.65 + vec2(12.4, 7.8), -uTime * 0.95);
        float combinedCaustics = (caustics1 * 0.6 + caustics2 * 0.4);

        // Cores de oceano profundo azul-celeste e safira cristalina
        vec3 deepOceanBlue = vec3(0.02, 0.18, 0.44);
        vec3 midAquaBlue = vec3(0.06, 0.45, 0.82);
        vec3 crestCyan = vec3(0.38, 0.78, 1.0);

        vec3 waterCol = mix(deepOceanBlue, midAquaBlue, combinedCaustics * 0.75 + 0.25);
        waterCol = mix(waterCol, crestCyan, pow(combinedCaustics, 3.0) * 0.55);

        // Reflexo especular da luz do Sol e da Lua na superfície inferior/superior do oceano
        float distToSunXZ = length(vWorldPos.xz - uSunPos.xz);
        float sunGlow = exp(-pow(distToSunXZ / 18.0, 2.0)) * 0.65;
        float sunCore = exp(-pow(distToSunXZ / 6.5, 2.0)) * 0.85;

        float distToMoonXZ = length(vWorldPos.xz - uMoonPos.xz);
        float moonGlow = exp(-pow(distToMoonXZ / 14.0, 2.0)) * 0.30;

        waterCol += vec3(1.0, 0.95, 0.78) * (sunGlow * 0.35 + sunCore * 0.45 * (0.6 + 0.4 * combinedCaustics));
        waterCol += vec3(0.70, 0.88, 1.0) * moonGlow * 0.35;

        // Borda cristalina do oceano superior
        float rimBand = exp(-pow((r - (uOceanRadius - 1.2)) / 0.85, 2.0));
        waterCol += vec3(0.28, 0.74, 1.0) * rimBand * 0.75;

        // Transparência calibrada para ver o oceano no topo e ainda enxergar o plano terrestre abaixo
        float baseAlpha = (0.34 + combinedCaustics * 0.16 + rimBand * 0.32) * edgeFade;

        gl_FragColor = vec4(waterCol, clamp(baseAlpha, 0.0, 0.78));
      }
    `,
  });

  const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
  oceanMesh.position.y = OCEAN_CEILING_Y;
  oceanMesh.renderOrder = 4;
  group.add(oceanMesh);

  // 2. Anel de Contenção Cristalina na Borda do Oceano de 1 Trilhão de km
  const rimGeo = new THREE.RingGeometry(OCEAN_RADIUS - 1.4, OCEAN_RADIUS, 128);
  rimGeo.rotateX(-Math.PI / 2);
  const rimMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  rimMesh.position.y = OCEAN_CEILING_Y + 0.04;
  rimMesh.renderOrder = 5;
  group.add(rimMesh);

  // 3. Volume D'Água Translúcido (Espessura lateral da lâmina oceânica superior)
  const wallHeight = 2.4;
  const cylinderWallGeo = new THREE.CylinderGeometry(
    OCEAN_RADIUS - 0.7,
    OCEAN_RADIUS - 0.7,
    wallHeight,
    128,
    1,
    true
  );
  const cylinderWallMat = new THREE.MeshBasicMaterial({
    color: 0x0ea5e9,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const cylinderWallMesh = new THREE.Mesh(cylinderWallGeo, cylinderWallMat);
  cylinderWallMesh.position.y = OCEAN_CEILING_Y + wallHeight * 0.5;
  cylinderWallMesh.renderOrder = 4;
  group.add(cylinderWallMesh);

  // Superfície superior da lâmina oceânica
  const topSurfaceGeo = new THREE.RingGeometry(0.1, OCEAN_RADIUS - 0.7, 128);
  topSurfaceGeo.rotateX(-Math.PI / 2);
  const topSurfaceMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.14,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const topSurfaceMesh = new THREE.Mesh(topSurfaceGeo, topSurfaceMat);
  topSurfaceMesh.position.y = OCEAN_CEILING_Y + wallHeight;
  topSurfaceMesh.renderOrder = 4;
  group.add(topSurfaceMesh);

  // 4. Pilares Pontilhados de Escala Vertical (Conectando a borda do Plano até o Oceano a 1 Trilhão de km)
  const guideGroup = new THREE.Group();
  const cardinalAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  cardinalAngles.forEach((ang) => {
    const gx = Math.cos(ang) * 48.0;
    const gz = Math.sin(ang) * 48.0;
    const pts = [new THREE.Vector3(gx, 0.1, gz), new THREE.Vector3(gx, OCEAN_CEILING_Y, gz)];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const lineMat = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      dashSize: 1.2,
      gapSize: 0.8,
      transparent: true,
      opacity: 0.35,
    });
    const line = new THREE.Line(lineGeo, lineMat);
    line.computeLineDistances();
    guideGroup.add(line);
  });
  group.add(guideGroup);

  // 5. Placa/Etiqueta 3D Flutuante indicando "OCEANO SUPERIOR • 1 TRILHÃO DE KM DE ALTURA"
  const createOceanLabelSprite = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(7, 22, 48, 0.88)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(8, 8, 752, 144, 24);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 32px sans-serif';
      ctx.fillStyle = '#e0f2fe';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌊 OCEANO SUPERIOR (ÁGUAS ACIMA)', 384, 54);

      ctx.font = 'bold 26px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('ALTURA: 1 TRILHÃO DE KM (1.000.000.000.000 km)', 384, 108);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(16.5, 3.4, 1);
    sprite.position.set(0, OCEAN_CEILING_Y + wallHeight + 2.8, -OCEAN_RADIUS * 0.62);
    sprite.renderOrder = 10;
    return sprite;
  };

  const labelSprite = createOceanLabelSprite();
  group.add(labelSprite);

  scene.add(group);

  return {
    group,
    update: (
      timeSeconds: number,
      sunPos: THREE.Vector3,
      moonPos: THREE.Vector3,
      _camera: THREE.Camera | null,
      isHuman: boolean,
      visible: boolean
    ) => {
      group.visible = visible && !isHuman;
      if (!group.visible) return;

      oceanUniforms.uTime.value = timeSeconds;
      oceanUniforms.uSunPos.value.copy(sunPos);
      oceanUniforms.uMoonPos.value.copy(moonPos);
    },
    dispose: () => {
      scene.remove(group);
      oceanGeo.dispose();
      oceanMat.dispose();
      rimGeo.dispose();
      rimMat.dispose();
      cylinderWallGeo.dispose();
      cylinderWallMat.dispose();
      topSurfaceGeo.dispose();
      topSurfaceMat.dispose();
    },
  };
}
