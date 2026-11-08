import * as THREE from 'three';
import { CONFIG } from './config.js';

/**
 * FPS Viewmodel Hands System.
 * Renders dedicated first-person arms and hands with separate FOV (60)
 * and clearDepth to prevent clipping through walls and pillars.
 */
export function createViewmodel(domElement) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    CONFIG.camera.viewmodelFov,
    window.innerWidth / window.innerHeight,
    0.05,
    15
  );

  // Viewmodel lighting (Ambient + Cyan Accent matching the temple atmosphere)
  const hemiLight = new THREE.HemisphereLight(0x52b8af, 0x0f2b20, 1.4);
  scene.add(hemiLight);

  const viewmodelCyanLight = new THREE.PointLight(0x00ffcc, 8.0, 5.0, 1.8);
  viewmodelCyanLight.position.set(0, 0.4, -0.6);
  scene.add(viewmodelCyanLight);

  // Materials
  const shirtMat = new THREE.MeshStandardMaterial({
    color: 0xedf1f5,
    roughness: 0.8,
    metalness: 0.05
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xe5ba9d,
    roughness: 0.75,
    metalness: 0.0
  });

  const gloveMat = new THREE.MeshStandardMaterial({
    color: 0x181716,
    roughness: 0.6,
    metalness: 0.2
  });

  // Root group for all arms attached to camera
  const rig = new THREE.Group();
  scene.add(rig);

  // ── BUILD LEFT & RIGHT HANDS / ARMS ──
  function buildArm(isLeft = true) {
    const armGroup = new THREE.Group();
    const sign = isLeft ? -1 : 1;

    // Base position relative to camera eye
    armGroup.position.set(sign * 0.28, -0.28, -0.52);
    armGroup.rotation.y = sign * 0.12;

    // Rolled-up white sleeve
    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.062, 0.058, 0.24, 12),
      shirtMat
    );
    sleeve.position.set(0, -0.06, 0);
    sleeve.rotation.x = Math.PI * 0.35;
    armGroup.add(sleeve);

    // Bare forearm (light skin)
    const forearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.052, 0.044, 0.22, 12),
      skinMat
    );
    forearm.position.set(0, -0.16, 0.1);
    forearm.rotation.x = Math.PI * 0.42;
    armGroup.add(forearm);

    // Hand wrist & palm with black leather glove
    const palm = new THREE.Mesh(
      new THREE.BoxGeometry(0.065, 0.09, 0.04),
      gloveMat
    );
    palm.position.set(0, -0.24, 0.22);
    palm.rotation.x = Math.PI * 0.45;
    palm.rotation.z = sign * 0.15;
    armGroup.add(palm);

    // Four fingers (gloved)
    const fingerGeom = new THREE.BoxGeometry(0.013, 0.055, 0.015);
    for (let f = 0; f < 4; f++) {
      const finger = new THREE.Mesh(fingerGeom, gloveMat);
      finger.position.set(
        palm.position.x + (f - 1.5) * 0.014 * sign,
        palm.position.y - 0.045,
        palm.position.z + 0.025
      );
      finger.rotation.x = Math.PI * 0.58;
      armGroup.add(finger);
    }

    // Thumb
    const thumb = new THREE.Mesh(
      new THREE.BoxGeometry(0.014, 0.045, 0.016),
      gloveMat
    );
    thumb.position.set(
      palm.position.x - 0.038 * sign,
      palm.position.y - 0.02,
      palm.position.z + 0.01
    );
    thumb.rotation.z = sign * 0.45;
    thumb.rotation.x = Math.PI * 0.4;
    armGroup.add(thumb);

    return armGroup;
  }

  const leftArm = buildArm(true);
  const rightArm = buildArm(false);
  rig.add(leftArm);
  rig.add(rightArm);

  // Animation variables
  let mouseSwayX = 0;
  let mouseSwayY = 0;
  let animTime = 0;
  let interactTime = 0;
  let isInteracting = false;

  // Listen to mouse delta for weapon/hand sway
  window.addEventListener('mousemove', (e) => {
    const swayAmount = 0.0008;
    mouseSwayX += e.movementX * swayAmount;
    mouseSwayY += e.movementY * swayAmount;

    mouseSwayX = THREE.MathUtils.clamp(mouseSwayX, -0.06, 0.06);
    mouseSwayY = THREE.MathUtils.clamp(mouseSwayY, -0.05, 0.05);
  });

  function triggerInteract() {
    isInteracting = true;
    interactTime = 0;
  }

  function update(delta, isMoving, isRunning, isGrounded, mainCameraRot) {
    animTime += delta;

    // Mouse sway decay (spring back to center)
    mouseSwayX = THREE.MathUtils.lerp(mouseSwayX, 0, 10.0 * delta);
    mouseSwayY = THREE.MathUtils.lerp(mouseSwayY, 0, 10.0 * delta);

    rig.position.x = -mouseSwayX;
    rig.position.y = mouseSwayY;

    // Interaction reaching animation (E key)
    if (isInteracting) {
      interactTime += delta * 3.5;
      const reach = Math.sin(Math.min(interactTime, Math.PI));
      rightArm.position.z = -0.52 + reach * 0.28;
      rightArm.position.y = -0.28 + reach * 0.12;
      rightArm.rotation.x = -reach * 0.4;

      if (interactTime >= Math.PI) {
        isInteracting = false;
        rightArm.position.z = -0.52;
        rightArm.position.y = -0.28;
        rightArm.rotation.x = 0;
      }
    }

    if (!isGrounded) {
      // Jumping pose: arms swing slightly upward
      leftArm.position.y = THREE.MathUtils.lerp(leftArm.position.y, -0.24, 0.15);
      if (!isInteracting) {
        rightArm.position.y = THREE.MathUtils.lerp(rightArm.position.y, -0.24, 0.15);
      }
      return;
    }

    if (isMoving) {
      // Hand-bob and step cadence
      const speed = isRunning ? 13.0 : 8.5;
      const bobAmount = isRunning ? 0.035 : 0.018;
      const cycle = animTime * speed;

      const bobY = Math.abs(Math.sin(cycle)) * bobAmount;
      const bobX = Math.cos(cycle) * bobAmount * 0.6;

      leftArm.position.y = -0.28 + bobY + Math.sin(cycle) * 0.015;
      leftArm.position.x = -0.28 + bobX;
      leftArm.rotation.z = Math.sin(cycle) * 0.08;

      if (!isInteracting) {
        rightArm.position.y = -0.28 + bobY - Math.sin(cycle) * 0.015;
        rightArm.position.x = 0.28 + bobX;
        rightArm.rotation.z = -Math.sin(cycle) * 0.08;
      }

      // Forward tilt when running
      const tilt = isRunning ? 0.12 : 0.04;
      leftArm.rotation.x = tilt;
      if (!isInteracting) rightArm.rotation.x = tilt;
    } else {
      // Idle natural breathing bob
      const breath = Math.sin(animTime * 2.2);
      leftArm.position.y = -0.28 + breath * 0.006;
      leftArm.position.x = THREE.MathUtils.lerp(leftArm.position.x, -0.28, 0.1);
      leftArm.rotation.set(0, -0.12, 0);

      if (!isInteracting) {
        rightArm.position.y = -0.28 + breath * 0.006;
        rightArm.position.x = THREE.MathUtils.lerp(rightArm.position.x, 0.28, 0.1);
        rightArm.rotation.set(0, 0.12, 0);
      }
    }
  }

  function setSize(w, h) {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function render(renderer) {
    // Clear depth buffer so arms render ON TOP of world geometry without clipping!
    renderer.clearDepth();
    renderer.render(scene, camera);
  }

  return {
    scene,
    camera,
    update,
    render,
    setSize,
    triggerInteract
  };
}

