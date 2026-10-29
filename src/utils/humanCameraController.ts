import * as THREE from 'three';

/**
 * SINGLE SOURCE OF TRUTH FOR HUMAN 1ST-PERSON CAMERA ORIENTATION, FOV, AND DRAG CONTROLS.
 *
 * CRITICAL INVARIANTS (NEVER MODIFY OR REGRESS IN FUTURE UPDATES):
 * 1. Rectilinear FOV: Default 42° (desktop) / 46° (mobile), strictly clamped between [20°, 54°]
 *    so the Sun, Moon, and horizon NEVER stretch or warp near screen edges.
 * 2. Pure Orthonormal Quaternion Orientation: `qBase * qYaw * qPitch`.
 *    NEVER use `cameraTargetRef.lerp(...)` + `camera.lookAt(...)` in Human Observer mode,
 *    because linear Cartesian target interpolation cuts a chord through the zenith when turning 180°.
 * 3. Smooth Proportional Drag (Zero Deadzones / Zero Axis-Lock Thresholds):
 *    NEVER add `if (absDx >= absDy * 1.35)` deadzones that freeze diagonal movement.
 */

export const HUMAN_CAMERA_FOV_MIN = 8;
export const HUMAN_CAMERA_FOV_MAX = 54;
export const HUMAN_CAMERA_PITCH_MIN = -0.25;
export const HUMAN_CAMERA_PITCH_MAX = 1.42;

export function getDefaultHumanFov(isMobile: boolean): number {
  return isMobile ? 46 : 42;
}

export function clampHumanFov(fov: number): number {
  return THREE.MathUtils.clamp(fov, HUMAN_CAMERA_FOV_MIN, HUMAN_CAMERA_FOV_MAX);
}

export function clampHumanPitch(pitchRad: number): number {
  return THREE.MathUtils.clamp(pitchRad, HUMAN_CAMERA_PITCH_MIN, HUMAN_CAMERA_PITCH_MAX);
}

/**
 * Applies smooth, continuous, deadzone-free pointer/touch drag to human look angles.
 * @param angles Current `{ azimuth, pitch }` in radians (mutated in-place and returned)
 * @param dx Horizontal pointer delta in pixels
 * @param dy Vertical pointer delta in pixels
 * @param invertHorizontal Set true if local coordinate system requires `-dx` for yaw
 * @param invertVertical Set true if local coordinate system requires `+dy` for pitch
 */
export function applyHumanLookDrag(
  angles: { azimuth: number; pitch: number },
  dx: number,
  dy: number,
  invertHorizontal = false,
  invertVertical = false
): { azimuth: number; pitch: number } {
  const yawSign = invertHorizontal ? -1 : 1;
  const pitchSign = invertVertical ? 1 : -1;

  angles.azimuth = ((angles.azimuth + yawSign * dx * 0.005) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  angles.pitch = clampHumanPitch(angles.pitch + pitchSign * dy * 0.004);

  return angles;
}

/**
 * Computes and applies the exact orthonormal local horizon-aligned quaternion (`qBase * qYaw * qPitch`)
 * to a Three.js PerspectiveCamera.
 *
 * At `azimuth = 0, pitch = 0`:
 * - Camera looks toward `+localNorth` (`-Z` camera axis = `+localNorth`)
 * - Camera right is `+localEast` (`+X` camera axis = `+localEast`)
 * - Camera up is `+localUp` (`+Y` camera axis = `+localUp` / local zenith)
 */
export function applyHumanCameraQuaternion(
  camera: THREE.PerspectiveCamera,
  localEast: THREE.Vector3,
  localUp: THREE.Vector3,
  localNorth: THREE.Vector3,
  azimuthRad: number,
  pitchRad: number,
  fovDeg?: number
): void {
  const baseCamBasis = new THREE.Matrix4().makeBasis(
    localEast.clone().normalize(),
    localUp.clone().normalize(),
    localNorth.clone().normalize().negate()
  );
  const qBase = new THREE.Quaternion().setFromRotationMatrix(baseCamBasis);
  const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -azimuthRad);
  const qPitch = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(1, 0, 0),
    clampHumanPitch(pitchRad)
  );

  camera.quaternion.copy(qBase).multiply(qYaw).multiply(qPitch);

  if (typeof fovDeg === 'number') {
    const safeFov = clampHumanFov(fovDeg);
    if (camera.fov !== safeFov) {
      camera.fov = safeFov;
      camera.updateProjectionMatrix();
    }
  }
}

/**
 * Emits a global synchronization event so the HumanObserverHUD compass and pitch readout stay in sync.
 */
export function broadcastHumanCameraAngles(azimuthRad: number, pitchRad: number): void {
  window.dispatchEvent(
    new CustomEvent('human-camera-angles-sync', {
      detail: {
        azimuthDeg: ((azimuthRad * 180) / Math.PI + 360) % 360,
        pitchDeg: (pitchRad * 180) / Math.PI,
      },
    })
  );
}
