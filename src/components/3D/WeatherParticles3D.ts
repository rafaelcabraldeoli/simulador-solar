import * as THREE from 'three';
import { geoToPlanarCoords } from '../../utils/astronomy';
import { LiveWeatherData } from '../../services/weatherService';
import { LayerSettings, ModelSettings } from '../../types';

export interface WeatherSystem3D {
  group: THREE.Group;
  updateWeatherData: (stations: LiveWeatherData[]) => void;
  update: (
    deltaSeconds: number,
    sunPos: THREE.Vector3,
    settings: ModelSettings,
    layers: LayerSettings
  ) => void;
  dispose: () => void;
}

interface ActiveWeatherCell {
  data: LiveWeatherData;
  worldX: number;
  worldZ: number;
  radius: number;
  cloudGroup?: THREE.Group;
  rainGroup?: THREE.Points;
  snowGroup?: THREE.Points;
  lightningLight?: THREE.PointLight;
  lightningTimer?: number;
  badgeSprite?: THREE.Sprite;
  rainVelocities?: Float32Array;
  snowVelocities?: Float32Array;
}

/**
 * Procedurally generates a realistic dark storm cloud texture (dense dark slate base, soft wisps)
 */
function createStormCloudTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  
  // Dark charcoal slate gradient with bottom shading
  const grad = ctx.createRadialGradient(128, 80, 10, 128, 64, 115);
  grad.addColorStop(0.0, 'rgba(25, 33, 46, 0.98)');   // Heavy storm core
  grad.addColorStop(0.35, 'rgba(45, 58, 76, 0.92)');  // Slate dark belly
  grad.addColorStop(0.70, 'rgba(75, 92, 115, 0.60)');  // Mid gray
  grad.addColorStop(0.92, 'rgba(125, 145, 170, 0.15)');
  grad.addColorStop(1.0, 'rgba(125, 145, 170, 0.0)');
  
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(128, 64, 122, 54, 0, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  return tex;
}

/**
 * Procedurally generates an overcast stratus cloud texture
 */
function createOvercastCloudTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  
  const grad = ctx.createRadialGradient(128, 72, 8, 128, 64, 118);
  grad.addColorStop(0.0, 'rgba(70, 84, 104, 0.90)');
  grad.addColorStop(0.40, 'rgba(110, 126, 148, 0.75)');
  grad.addColorStop(0.75, 'rgba(180, 198, 220, 0.35)');
  grad.addColorStop(1.0, 'rgba(200, 220, 240, 0.0)');
  
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(128, 64, 124, 52, 0, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  return tex;
}

/**
 * Procedurally generates a raindrop particle texture (elongated droplet with soft trail)
 */
function createRainTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  
  const grad = ctx.createLinearGradient(16, 0, 16, 128);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.0)');
  grad.addColorStop(0.3, 'rgba(186, 230, 253, 0.35)');
  grad.addColorStop(0.85, 'rgba(125, 211, 252, 0.85)');
  grad.addColorStop(1.0, 'rgba(224, 242, 254, 0.95)');
  
  ctx.fillStyle = grad;
  ctx.fillRect(10, 0, 12, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  return tex;
}

/**
 * Procedurally generates a soft snowflake particle texture
 */
function createSnowTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.4, 'rgba(240, 249, 255, 0.8)');
  grad.addColorStop(0.8, 'rgba(224, 242, 254, 0.2)');
  grad.addColorStop(1.0, 'rgba(224, 242, 254, 0.0)');
  
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(32, 32, 30, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  return tex;
}

/**
 * Creates 3D Real-time Weather Precipitation, Dense Storm Clouds, Lightning & Live Station Markers
 */
export function createWeatherSystem3D(scene: THREE.Scene): WeatherSystem3D {
  const group = new THREE.Group();
  scene.add(group);

  const rainTex = createRainTexture();
  const snowTex = createSnowTexture();
  const stormCloudTex = createStormCloudTexture();
  const overcastCloudTex = createOvercastCloudTexture();

  let activeCells: ActiveWeatherCell[] = [];

  const updateWeatherData = (stations: LiveWeatherData[]) => {
    // Clear previous dynamic cell objects
    activeCells.forEach((cell) => {
      if (cell.cloudGroup) group.remove(cell.cloudGroup);
      if (cell.rainGroup) group.remove(cell.rainGroup);
      if (cell.snowGroup) group.remove(cell.snowGroup);
      if (cell.lightningLight) group.remove(cell.lightningLight);
      if (cell.badgeSprite) group.remove(cell.badgeSprite);
    });
    activeCells = [];

    stations.forEach((station) => {
      const pos = geoToPlanarCoords(station.latitude, station.longitude);
      const isRain = station.weatherCategory === 'rain' || station.weatherCategory === 'drizzle' || station.weatherCategory === 'thunderstorm';
      const isSnow = station.weatherCategory === 'snow';
      const isStorm = station.weatherCategory === 'thunderstorm';
      const isCloudy = station.weatherCategory === 'cloudy' || station.weatherCategory === 'fog' || station.cloudCover > 55;
      
      // Scaled realistically to localized city/metropolitan boundary (doesn't bleed into neighbouring states)
      const cellRadius = isStorm ? 0.65 : isRain ? 0.45 : 0.35;
      const cell: ActiveWeatherCell = {
        data: station,
        worldX: pos.x,
        worldZ: pos.z,
        radius: cellRadius,
      };

      // 1. CREATE DENSE 3D STORM / OVERCAST CLOUDS DIRECTLY OVER THE STATION
      if (isRain || isSnow || isCloudy) {
        const cloudGroup = new THREE.Group();
        const puffCount = isStorm ? 6 : isRain ? 4 : 3;
        const baseTex = (isRain || isStorm) ? stormCloudTex : overcastCloudTex;
        const cloudTint = isStorm ? 0x334155 : isRain ? 0x475569 : 0x94a3b8;
        const baseAltitude = isStorm ? 1.55 : isRain ? 1.45 : 1.35;

        for (let i = 0; i < puffCount; i++) {
          const mat = new THREE.SpriteMaterial({
            map: baseTex,
            transparent: true,
            opacity: (isStorm ? 0.90 : isRain ? 0.85 : 0.72) + Math.random() * 0.08,
            color: new THREE.Color(cloudTint),
            depthWrite: false,
          });

          const sprite = new THREE.Sprite(mat);
          const r = Math.random() * cellRadius * 0.45;
          const theta = Math.random() * Math.PI * 2;
          const puffX = pos.x + Math.cos(theta) * r;
          const puffZ = pos.z + Math.sin(theta) * r;
          const puffY = baseAltitude + (Math.random() - 0.5) * 0.20;

          sprite.position.set(puffX, puffY, puffZ);
          
          // Realistic localized proportional aspect ratio
          const scaleW = (cellRadius * (0.95 + Math.random() * 0.3)) * 1.25;
          const scaleH = (cellRadius * (0.8 + Math.random() * 0.3)) * 0.35;
          sprite.scale.set(scaleW, scaleH, 1);

          cloudGroup.add(sprite);
        }

        group.add(cloudGroup);
        cell.cloudGroup = cloudGroup;
      }

      // 2. CREATE RAIN PARTICLES FALLING FROM THE DENSE CLOUD UNDERSIDE (Y = 1.45 -> 0.08)
      if (isRain) {
        const count = isStorm ? 180 : station.weatherCategory === 'drizzle' ? 60 : 110;
        const rainGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count);

        for (let i = 0; i < count; i++) {
          const r = Math.random() * cell.radius;
          const theta = Math.random() * Math.PI * 2;
          positions[i * 3 + 0] = pos.x + Math.cos(theta) * r;
          positions[i * 3 + 1] = 0.08 + Math.random() * 1.5; // Altitude from ground up to bottom of clouds
          positions[i * 3 + 2] = pos.z + Math.sin(theta) * r;
          velocities[i] = 7.5 + Math.random() * 4.5; // Realistic falling velocity
        }

        rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const rainMat = new THREE.PointsMaterial({
          map: rainTex,
          size: 0.18,
          color: 0x93c5fd,
          transparent: true,
          opacity: isStorm ? 0.95 : 0.82,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });

        const rainPoints = new THREE.Points(rainGeo, rainMat);
        group.add(rainPoints);
        cell.rainGroup = rainPoints;
        cell.rainVelocities = velocities;
      }

      // 3. CREATE SNOW PARTICLES FALLING FROM CLOUD BASE
      if (isSnow) {
        const count = 120;
        const snowGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count);

        for (let i = 0; i < count; i++) {
          const r = Math.random() * cell.radius;
          const theta = Math.random() * Math.PI * 2;
          positions[i * 3 + 0] = pos.x + Math.cos(theta) * r;
          positions[i * 3 + 1] = 0.08 + Math.random() * 1.4;
          positions[i * 3 + 2] = pos.z + Math.sin(theta) * r;
          velocities[i] = 1.2 + Math.random() * 1.5;
        }

        snowGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const snowMat = new THREE.PointsMaterial({
          map: snowTex,
          size: 0.18,
          color: 0xffffff,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });

        const snowPoints = new THREE.Points(snowGeo, snowMat);
        group.add(snowPoints);
        cell.snowGroup = snowPoints;
        cell.snowVelocities = velocities;
      }

      // 4. CREATE LIGHTNING LIGHT INSIDE THUNDERSTORMS
      if (isStorm) {
        const lightningLight = new THREE.PointLight(0xa5f3fc, 0, 8);
        lightningLight.position.set(pos.x, 1.5, pos.z);
        group.add(lightningLight);
        cell.lightningLight = lightningLight;
        cell.lightningTimer = 1.5 + Math.random() * 4.0;
      }

      // 5. CREATE 3D FLOATING WEATHER BADGE (Positioned above clouds at Y = 2.1)
      const badgeCanvas = document.createElement('canvas');
      badgeCanvas.width = 256;
      badgeCanvas.height = 96;
      const bCtx = badgeCanvas.getContext('2d')!;

      // Rounded background pill
      bCtx.fillStyle = 'rgba(15, 23, 42, 0.90)';
      bCtx.strokeStyle = isStorm ? 'rgba(239, 68, 68, 0.8)' : isRain ? 'rgba(56, 189, 248, 0.8)' : 'rgba(250, 204, 21, 0.8)';
      bCtx.lineWidth = 4;
      bCtx.beginPath();
      bCtx.roundRect(6, 6, 244, 84, 18);
      bCtx.fill();
      bCtx.stroke();

      // Weather Icon & Temp
      bCtx.font = '32px sans-serif';
      bCtx.textAlign = 'left';
      bCtx.textBaseline = 'middle';
      bCtx.fillText(station.icon, 20, 48);

      bCtx.font = 'bold 26px sans-serif';
      bCtx.fillStyle = '#f8fafc';
      bCtx.fillText(`${Math.round(station.temperature)}°C`, 76, 36);

      bCtx.font = '16px sans-serif';
      bCtx.fillStyle = '#94a3b8';
      const cityLabel = station.cityName ? (station.cityName.length > 13 ? station.cityName.slice(0, 12) + '…' : station.cityName) : 'Local';
      bCtx.fillText(cityLabel, 76, 64);

      const badgeTex = new THREE.CanvasTexture(badgeCanvas);
      badgeTex.minFilter = THREE.LinearFilter;
      const badgeMat = new THREE.SpriteMaterial({
        map: badgeTex,
        transparent: true,
        depthWrite: false,
      });

      const badgeSprite = new THREE.Sprite(badgeMat);
      badgeSprite.position.set(pos.x, 2.1, pos.z);
      badgeSprite.scale.set(1.4, 0.52, 1);
      group.add(badgeSprite);
      cell.badgeSprite = badgeSprite;

      activeCells.push(cell);
    });
  };

  return {
    group,
    updateWeatherData,
    update: (
      deltaSeconds: number,
      sunPos: THREE.Vector3,
      settings: ModelSettings,
      layers: LayerSettings,
      isHuman: boolean = false
    ) => {
      const isWeatherActive = layers.showLiveWeather !== false || layers.showLivePrecipitation !== false;
      group.visible = isWeatherActive;

      if (!isWeatherActive || activeCells.length === 0) return;

      activeCells.forEach((cell) => {
        if (cell.badgeSprite) {
          cell.badgeSprite.visible = layers.showLiveWeather !== false && !isHuman;
        }

        const showPrecip = layers.showLivePrecipitation !== false;
        if (cell.rainGroup) cell.rainGroup.visible = showPrecip;
        if (cell.snowGroup) cell.snowGroup.visible = showPrecip;
        if (cell.cloudGroup) cell.cloudGroup.visible = isWeatherActive;

        // A. Animate Falling Rain
        if (cell.rainGroup && cell.rainVelocities && showPrecip) {
          const posAttr = cell.rainGroup.geometry.attributes.position as THREE.BufferAttribute;
          const posArray = posAttr.array as Float32Array;
          const count = posAttr.count;

          for (let i = 0; i < count; i++) {
            const v = cell.rainVelocities[i];
            posArray[i * 3 + 1] -= v * deltaSeconds;

            // Reset raindrop back to cloud base (Y = 1.45) once it hits the ground
            if (posArray[i * 3 + 1] <= 0.08) {
              posArray[i * 3 + 1] = 1.40 + Math.random() * 0.15;
              const r = Math.random() * cell.radius;
              const theta = Math.random() * Math.PI * 2;
              posArray[i * 3 + 0] = cell.worldX + Math.cos(theta) * r;
              posArray[i * 3 + 2] = cell.worldZ + Math.sin(theta) * r;
            }
          }
          posAttr.needsUpdate = true;
        }

        // B. Animate Falling Snow
        if (cell.snowGroup && cell.snowVelocities) {
          const posAttr = cell.snowGroup.geometry.attributes.position as THREE.BufferAttribute;
          const posArray = posAttr.array as Float32Array;
          const count = posAttr.count;

          for (let i = 0; i < count; i++) {
            const v = cell.snowVelocities[i];
            posArray[i * 3 + 1] -= v * deltaSeconds;
            // Gentle lateral drift in the wind
            posArray[i * 3 + 0] += Math.sin(posArray[i * 3 + 1] * 2 + deltaSeconds) * 0.008;

            if (posArray[i * 3 + 1] <= 0.08) {
              posArray[i * 3 + 1] = 1.35 + Math.random() * 0.15;
            }
          }
          posAttr.needsUpdate = true;
        }

        // C. Animate Storm Lightning
        if (cell.lightningLight) {
          cell.lightningTimer = (cell.lightningTimer || 3) - deltaSeconds;
          if (cell.lightningTimer <= 0) {
            cell.lightningLight.intensity = 10.0 + Math.random() * 12.0;
            cell.lightningTimer = 2.5 + Math.random() * 5.0;
          } else if (cell.lightningLight.intensity > 0) {
            cell.lightningLight.intensity = Math.max(0, cell.lightningLight.intensity - deltaSeconds * 22);
          }
        }
      });
    },
    dispose: () => {
      scene.remove(group);
      activeCells.forEach((cell) => {
        if (cell.cloudGroup) {
          cell.cloudGroup.children.forEach((child) => {
            if (child instanceof THREE.Sprite) {
              (child.material as THREE.Material).dispose();
            }
          });
        }
        if (cell.rainGroup) {
          cell.rainGroup.geometry.dispose();
          (cell.rainGroup.material as THREE.Material).dispose();
        }
        if (cell.snowGroup) {
          cell.snowGroup.geometry.dispose();
          (cell.snowGroup.material as THREE.Material).dispose();
        }
      });
      rainTex.dispose();
      snowTex.dispose();
      stormCloudTex.dispose();
      overcastCloudTex.dispose();
    },
  };
}
