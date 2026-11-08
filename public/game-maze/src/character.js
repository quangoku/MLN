import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Creates the stylized female explorer character.
 * Supports procedural animations, Mixamo GLTF loading,
 * and preserves body ground shadow in first-person mode.
 */
export function createCharacter(scene) {
  const root = new THREE.Group();
  root.position.set(0, 0, 6.0);
  root.rotation.y = Math.PI; // Face portal

  const shirtMat = new THREE.MeshStandardMaterial({
    color: 0xedf1f5,
    roughness: 0.8,
    metalness: 0.05
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x2b3d2e,
    roughness: 0.85,
    metalness: 0.08
  });

  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x1f1b18,
    roughness: 0.65,
    metalness: 0.2
  });

  const backpackMat = new THREE.MeshStandardMaterial({
    color: 0x18181a,
    roughness: 0.8,
    metalness: 0.1
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xe5ba9d,
    roughness: 0.75,
    metalness: 0.0
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x141212,
    roughness: 0.9,
    metalness: 0.05
  });

  const primitiveGroup = new THREE.Group();
  root.add(primitiveGroup);

  // Pelvis / Hips
  const hips = new THREE.Group();
  hips.position.set(0, 0.92, 0);
  primitiveGroup.add(hips);

  const pelvisMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.2, 12), pantsMat);
  pelvisMesh.castShadow = true;
  pelvisMesh.receiveShadow = true;
  hips.add(pelvisMesh);

  // Belt & Utility Pouch
  const beltMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.208, 0.208, 0.06, 12), leatherMat);
  beltMesh.position.set(0, 0.07, 0);
  hips.add(beltMesh);

  const pouchMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.1), leatherMat);
  pouchMesh.position.set(0.21, 0.02, 0.02);
  pouchMesh.rotation.z = -0.1;
  pouchMesh.castShadow = true;
  hips.add(pouchMesh);

  // Torso / Spine
  const spine = new THREE.Group();
  spine.position.set(0, 0.1, 0);
  hips.add(spine);

  const chestMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.19, 0.38, 12), shirtMat);
  chestMesh.position.set(0, 0.22, 0);
  chestMesh.castShadow = true;
  chestMesh.receiveShadow = true;
  spine.add(chestMesh);

  const collarMesh = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 8, 16), shirtMat);
  collarMesh.rotation.x = Math.PI / 2;
  collarMesh.position.set(0, 0.42, 0.01);
  spine.add(collarMesh);

  // Backpack
  const backpack = new THREE.Group();
  backpack.position.set(0, 0.24, -0.16);
  spine.add(backpack);

  const backpackBody = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.34, 0.15), backpackMat);
  backpackBody.castShadow = true;
  backpack.add(backpackBody);

  const backpackFlap = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.1, 0.16), backpackMat);
  backpackFlap.position.set(0, 0.12, 0.01);
  backpack.add(backpackFlap);

  // Neck & Head
  const neck = new THREE.Group();
  neck.position.set(0, 0.44, 0);
  spine.add(neck);

  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.12, 10), skinMat);
  neckMesh.position.set(0, 0.06, 0);
  neckMesh.castShadow = true;
  neck.add(neckMesh);

  const head = new THREE.Group();
  head.position.set(0, 0.15, 0);
  neck.add(head);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), skinMat);
  headMesh.scale.set(0.9, 1.05, 0.95);
  headMesh.castShadow = true;
  head.add(headMesh);

  const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.136, 16, 16), hairMat);
  hairBase.position.set(0, 0.02, -0.02);
  hairBase.scale.set(0.95, 1.06, 0.98);
  head.add(hairBase);

  const bunMesh = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), hairMat);
  bunMesh.position.set(0, 0.08, -0.15);
  bunMesh.scale.set(0.9, 1.2, 0.9);
  head.add(bunMesh);

  // Left Arm
  const leftShoulder = new THREE.Group();
  leftShoulder.position.set(-0.25, 0.36, 0);
  spine.add(leftShoulder);

  const leftUpperArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.22, 10), shirtMat);
  leftUpperArmMesh.position.set(0, -0.11, 0);
  leftUpperArmMesh.castShadow = true;
  leftShoulder.add(leftUpperArmMesh);

  const leftForearm = new THREE.Group();
  leftForearm.position.set(0, -0.22, 0);
  leftShoulder.add(leftForearm);

  const leftForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.048, 0.22, 10), skinMat);
  leftForearmMesh.position.set(0, -0.11, 0);
  leftForearmMesh.castShadow = true;
  leftForearm.add(leftForearmMesh);

  const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.04), leatherMat);
  leftHand.position.set(0, -0.25, 0);
  leftForearm.add(leftHand);

  // Right Arm
  const rightShoulder = new THREE.Group();
  rightShoulder.position.set(0.25, 0.36, 0);
  spine.add(rightShoulder);

  const rightUpperArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.22, 10), shirtMat);
  rightUpperArmMesh.position.set(0, -0.11, 0);
  rightUpperArmMesh.castShadow = true;
  rightShoulder.add(rightUpperArmMesh);

  const rightForearm = new THREE.Group();
  rightForearm.position.set(0, -0.22, 0);
  rightShoulder.add(rightForearm);

  const rightForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.048, 0.22, 10), skinMat);
  rightForearmMesh.position.set(0, -0.11, 0);
  rightForearmMesh.castShadow = true;
  rightForearm.add(rightForearmMesh);

  const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.04), leatherMat);
  rightHand.position.set(0, -0.25, 0);
  rightForearm.add(rightHand);

  // Legs
  const leftHip = new THREE.Group();
  leftHip.position.set(-0.11, -0.05, 0);
  hips.add(leftHip);

  const leftThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.08, 0.42, 10), pantsMat);
  leftThighMesh.position.set(0, -0.21, 0);
  leftThighMesh.castShadow = true;
  leftHip.add(leftThighMesh);

  const leftKnee = new THREE.Group();
  leftKnee.position.set(0, -0.42, 0);
  leftHip.add(leftKnee);

  const leftShinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.068, 0.42, 10), pantsMat);
  leftShinMesh.position.set(0, -0.21, 0);
  leftShinMesh.castShadow = true;
  leftKnee.add(leftShinMesh);

  const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.2), leatherMat);
  leftBoot.position.set(0, -0.44, 0.04);
  leftBoot.castShadow = true;
  leftKnee.add(leftBoot);

  const rightHip = new THREE.Group();
  rightHip.position.set(0.11, -0.05, 0);
  hips.add(rightHip);

  const rightThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.08, 0.42, 10), pantsMat);
  rightThighMesh.position.set(0, -0.21, 0);
  rightThighMesh.castShadow = true;
  rightHip.add(rightThighMesh);

  const rightKnee = new THREE.Group();
  rightKnee.position.set(0, -0.42, 0);
  rightHip.add(rightKnee);

  const rightShinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.068, 0.42, 10), pantsMat);
  rightShinMesh.position.set(0, -0.21, 0);
  rightShinMesh.castShadow = true;
  rightKnee.add(rightShinMesh);

  const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.2), leatherMat);
  rightBoot.position.set(0, -0.44, 0.04);
  rightBoot.castShadow = true;
  rightKnee.add(rightBoot);

  scene.add(root);

  let gltfModel = null;
  let mixer = null;
  let animations = {};

  async function loadCharacter(url) {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          primitiveGroup.visible = false;
          gltfModel = gltf.scene;
          gltfModel.scale.setScalar(1.0);
          gltfModel.traverse((c) => {
            if (c.isMesh) {
              c.castShadow = true;
              c.receiveShadow = true;
            }
          });
          root.add(gltfModel);

          if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(gltfModel);
            for (const clip of gltf.animations) {
              animations[clip.name.toLowerCase()] = mixer.clipAction(clip);
            }
            const first = Object.values(animations)[0];
            if (first) first.play();
          }
          resolve(gltfModel);
        },
        undefined,
        reject
      );
    });
  }

  let animTimer = 0;

  function update(delta, state = 'idle', speed = 0, isGrounded = true) {
    if (mixer) {
      mixer.update(delta);
      return;
    }

    animTimer += delta;

    if (!isGrounded) {
      hips.position.y = THREE.MathUtils.lerp(hips.position.y, 0.96, 0.2);
      leftHip.rotation.x = THREE.MathUtils.lerp(leftHip.rotation.x, -0.4, 0.2);
      rightHip.rotation.x = THREE.MathUtils.lerp(rightHip.rotation.x, 0.2, 0.2);
      leftKnee.rotation.x = THREE.MathUtils.lerp(leftKnee.rotation.x, 0.6, 0.2);
      rightKnee.rotation.x = THREE.MathUtils.lerp(rightKnee.rotation.x, 0.4, 0.2);
      leftShoulder.rotation.x = THREE.MathUtils.lerp(leftShoulder.rotation.x, -0.6, 0.2);
      rightShoulder.rotation.x = THREE.MathUtils.lerp(rightShoulder.rotation.x, -0.6, 0.2);
      return;
    }

    if (state === 'walk' || state === 'run') {
      const isRunning = state === 'run';
      const strideFreq = isRunning ? 13.0 : 8.5;
      const legAmplitude = isRunning ? 0.75 : 0.48;
      const armAmplitude = isRunning ? 0.65 : 0.40;

      const cycle = animTimer * strideFreq;
      const legSwing = Math.sin(cycle);

      hips.position.y = 0.92 + Math.abs(Math.sin(cycle)) * (isRunning ? 0.06 : 0.035);
      hips.rotation.y = Math.sin(cycle) * 0.08;
      spine.rotation.x = isRunning ? 0.22 : 0.08;

      leftHip.rotation.x = legSwing * legAmplitude;
      rightHip.rotation.x = -legSwing * legAmplitude;
      leftKnee.rotation.x = legSwing < 0 ? Math.abs(legSwing) * (isRunning ? 0.85 : 0.55) : 0.05;
      rightKnee.rotation.x = legSwing > 0 ? Math.abs(legSwing) * (isRunning ? 0.85 : 0.55) : 0.05;

      leftShoulder.rotation.x = -legSwing * armAmplitude;
      rightShoulder.rotation.x = legSwing * armAmplitude;
      leftForearm.rotation.x = -0.3 + (legSwing > 0 ? 0.2 : 0.0);
      rightForearm.rotation.x = -0.3 + (legSwing < 0 ? 0.2 : 0.0);
      head.rotation.x = -spine.rotation.x * 0.7;
    } else {
      const breath = Math.sin(animTimer * 2.2);
      hips.position.y = 0.92 + breath * 0.008;
      spine.rotation.x = breath * 0.02;

      leftShoulder.rotation.x = THREE.MathUtils.lerp(leftShoulder.rotation.x, 0.05, 0.1);
      leftShoulder.rotation.z = THREE.MathUtils.lerp(leftShoulder.rotation.z, 0.08 + breath * 0.01, 0.1);
      rightShoulder.rotation.x = THREE.MathUtils.lerp(rightShoulder.rotation.x, 0.05, 0.1);
      rightShoulder.rotation.z = THREE.MathUtils.lerp(rightShoulder.rotation.z, -0.08 - breath * 0.01, 0.1);

      leftForearm.rotation.x = -0.15;
      rightForearm.rotation.x = -0.15;
      leftHip.rotation.set(0, 0, -0.04);
      rightHip.rotation.set(0, 0, 0.04);
      leftKnee.rotation.set(0, 0, 0);
      rightKnee.rotation.set(0, 0, 0);
      head.rotation.set(0, 0, 0);
    }
  }

  /**
   * In first person: hide head to avoid camera obstruction,
   * but KEEP the body visible so it casts shadows on the floor/grass!
   */
  function setFirstPersonMode(isFirstPerson) {
    head.visible = !isFirstPerson;
    neck.visible = !isFirstPerson;

    // Body casts ground shadow in 1st person
    chestMesh.castShadow = true;
    pelvisMesh.castShadow = true;
    leftThighMesh.castShadow = true;
    rightThighMesh.castShadow = true;
  }

  return {
    root,
    head,
    getPosition: () => root.position,
    getRotation: () => root.rotation,
    update,
    setFirstPersonMode,
    loadCharacter
  };
}
