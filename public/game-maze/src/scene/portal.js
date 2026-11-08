import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { getArmillaryTexture } from './textures.js';

/**
 * Creates the Celestial Armillary Sphere Portal with high-intensity cyan point light,
 * rotating concentric rings, dynamic energy core, and floating fireflies.
 */
export function createPortal(scene) {
  const portalGroup = new THREE.Group();
  portalGroup.position.set(0, 2.7, -8.3);

  // 1. Armillary Rings
  const armillaryTex = getArmillaryTexture();
  const ringMaterial = new THREE.MeshStandardMaterial({
    map: armillaryTex,
    roughness: 0.35,
    metalness: 0.8,
    emissive: new THREE.Color(0x00484d),
    emissiveIntensity: 0.85
  });

  const outerRingGeom = new THREE.TorusGeometry(2.1, 0.1, 16, 64);
  const outerRing = new THREE.Mesh(outerRingGeom, ringMaterial);
  portalGroup.add(outerRing);

  const middleRingGeom = new THREE.TorusGeometry(1.85, 0.08, 16, 64);
  const middleRing = new THREE.Mesh(middleRingGeom, ringMaterial);
  middleRing.rotation.x = Math.PI * 0.2;
  portalGroup.add(middleRing);

  const innerRingGeom = new THREE.TorusGeometry(1.6, 0.07, 16, 64);
  const innerRing = new THREE.Mesh(innerRingGeom, ringMaterial);
  innerRing.rotation.z = -Math.PI * 0.25;
  portalGroup.add(innerRing);

  const baseGeom = new THREE.CylinderGeometry(0.5, 0.7, 0.5, 12);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x111e24, roughness: 0.9 });
  const baseMount = new THREE.Mesh(baseGeom, baseMat);
  baseMount.position.set(0, -2.1, 0);
  portalGroup.add(baseMount);

  // 2. Glowing Energy Core
  const coreGeom = new THREE.SphereGeometry(1.0, 32, 32);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x00f7ff,
    transparent: true,
    opacity: 0.95
  });
  const coreMesh = new THREE.Mesh(coreGeom, coreMat);
  portalGroup.add(coreMesh);

  const innerCoreGeom = new THREE.SphereGeometry(0.65, 24, 24);
  const innerCoreMat = new THREE.MeshBasicMaterial({
    color: 0xdfffff,
    transparent: true,
    opacity: 0.92
  });
  const innerCore = new THREE.Mesh(innerCoreGeom, innerCoreMat);
  portalGroup.add(innerCore);

  const wireGeom = new THREE.IcosahedronGeometry(1.18, 2);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x33ffff,
    wireframe: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending
  });
  const energyWire = new THREE.Mesh(wireGeom, wireMat);
  portalGroup.add(energyWire);

  const haloGeom = new THREE.SphereGeometry(1.4, 24, 24);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x00b4a4,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });
  const energyHalo = new THREE.Mesh(haloGeom, haloMat);
  portalGroup.add(energyHalo);

  // 3. Primary PointLight at Portal (Intensity ~60-80)
  const portalLight = new THREE.PointLight(
    CONFIG.lighting.portalLightColor,
    CONFIG.lighting.portalLightIntensity, // ~75.0
    CONFIG.lighting.portalLightDistance,  // 28m
    CONFIG.lighting.portalLightDecay      // 2.0
  );
  portalLight.position.set(0, 0, 0.2);
  portalLight.castShadow = true;
  portalLight.shadow.mapSize.width = 2048;
  portalLight.shadow.mapSize.height = 2048;
  portalLight.shadow.camera.near = 0.5;
  portalLight.shadow.camera.far = 30.0;
  portalLight.shadow.bias = -0.0015;
  portalGroup.add(portalLight);

  // Green rim light behind portal
  const rimLight = new THREE.PointLight(0x00ff88, 12.0, 16.0, 2.0);
  rimLight.position.set(0, 0.5, -1.8);
  portalGroup.add(rimLight);

  // 4. Floating Fireflies (Points)
  const particleCount = 320;
  const particleGeom = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleSpeeds = new Float32Array(particleCount * 3);
  const particleBaseCoords = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const r = THREE.MathUtils.randFloat(0.5, 4.5);
    const theta = Math.random() * Math.PI * 2;
    const y = THREE.MathUtils.randFloat(-1.5, 3.5);

    const px = Math.cos(theta) * r;
    const py = y;
    const pz = Math.sin(theta) * r;

    particlePositions[i * 3] = px;
    particlePositions[i * 3 + 1] = py;
    particlePositions[i * 3 + 2] = pz;

    particleBaseCoords[i * 3] = px;
    particleBaseCoords[i * 3 + 1] = py;
    particleBaseCoords[i * 3 + 2] = pz;

    particleSpeeds[i * 3] = THREE.MathUtils.randFloat(0.3, 1.2);
    particleSpeeds[i * 3 + 1] = THREE.MathUtils.randFloat(0.2, 0.8);
    particleSpeeds[i * 3 + 2] = THREE.MathUtils.randFloat(0.3, 1.2);
  }

  particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const moteCanvas = document.createElement('canvas');
  moteCanvas.width = 64;
  moteCanvas.height = 64;
  const mctx = moteCanvas.getContext('2d');
  const mgrad = mctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  mgrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  mgrad.addColorStop(0.3, 'rgba(0, 255, 220, 0.85)');
  mgrad.addColorStop(0.7, 'rgba(0, 180, 150, 0.3)');
  mgrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  mctx.fillStyle = mgrad;
  mctx.fillRect(0, 0, 64, 64);
  const moteTex = new THREE.CanvasTexture(moteCanvas);

  const particleMat = new THREE.PointsMaterial({
    size: 0.15,
    map: moteTex,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const fireflies = new THREE.Points(particleGeom, particleMat);
  portalGroup.add(fireflies);

  scene.add(portalGroup);

  let isActivated = false;
  let activationProgress = 0;
  let spinSpeed = 0.5;

  return {
    group: portalGroup,
    light: portalLight,
    getPosition: () => portalGroup.position,

    activate: () => {
      if (isActivated) return false;
      isActivated = true;
      return true;
    },

    isActivated: () => isActivated,

    update: (time, delta) => {
      if (isActivated && activationProgress < 1.0) {
        activationProgress = Math.min(1.0, activationProgress + delta * 0.8);
      }

      const activeFactor = activationProgress;
      spinSpeed = THREE.MathUtils.lerp(0.6, 5.5, activeFactor);

      outerRing.rotation.y = Math.sin(time * 0.3) * 0.15;
      middleRing.rotation.y += delta * spinSpeed;
      middleRing.rotation.x = Math.PI * 0.2 + Math.sin(time * 0.5) * 0.1;

      innerRing.rotation.y -= delta * (spinSpeed * 1.3);
      innerRing.rotation.z = -Math.PI * 0.25 + Math.cos(time * 0.6) * 0.1;

      energyWire.rotation.x += delta * 1.8;
      energyWire.rotation.y -= delta * 1.4;

      const pulseScale = 1.0 + Math.sin(time * (3.5 + activeFactor * 6.0)) * (0.05 + activeFactor * 0.12);
      coreMesh.scale.setScalar(pulseScale);
      innerCore.scale.setScalar(pulseScale * 0.95);
      energyHalo.scale.setScalar(pulseScale * 1.08 + Math.cos(time * 2.0) * 0.04);

      const baseIntensity = THREE.MathUtils.lerp(CONFIG.lighting.portalLightIntensity, 140.0, activeFactor);
      portalLight.intensity = baseIntensity + Math.sin(time * 6.0) * (3.0 + activeFactor * 12.0);

      const positions = particleGeom.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const speed = particleSpeeds[i3];

        const curAngle = time * (0.2 + speed * 0.3) + i;
        const rad = Math.hypot(particleBaseCoords[i3], particleBaseCoords[i3 + 2]) + Math.sin(time * speed + i) * 0.3;

        positions[i3] = Math.cos(curAngle) * rad;
        positions[i3 + 1] = particleBaseCoords[i3 + 1] + Math.sin(time * (1.2 + speed)) * 0.45;
        positions[i3 + 2] = Math.sin(curAngle) * rad;

        if (activeFactor > 0) {
          positions[i3] *= (1.0 + activeFactor * 0.4);
          positions[i3 + 1] += activeFactor * Math.sin(time * 4.0 + i) * 0.2;
          positions[i3 + 2] *= (1.0 + activeFactor * 0.4);
        }
      }
      particleGeom.attributes.position.needsUpdate = true;
    }
  };
}
