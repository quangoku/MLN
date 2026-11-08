import * as THREE from 'three';
import { CONFIG } from './config.js';

/**
 * Controller xử lý input bàn phím, chuột, camera TPS/FPS,
 * phím chỉnh độ sáng [ và ], Escape (Settings), I (Túi đồ), J (Nhiệm vụ).
 */
export function createControls(camera, character, domElement, onExposureChange, viewmodel, uiCallbacks = {}) {
  const keys = {
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    ShiftLeft: false,
    ShiftRight: false,
    Space: false
  };

  let isFirstPerson = false;
  let yaw = Math.PI;
  let pitch = 0.08;
  const minPitch = -Math.PI * 0.28;
  const maxPitch = Math.PI * 0.25;

  const thirdPersonOffset = new THREE.Vector3(0.35, 1.75, 3.2);
  const firstPersonOffset = new THREE.Vector3(0, 1.62, 0);

  let isPointerLocked = false;
  let interactionRequested = false;

  function onMouseMove(e) {
    if (!isPointerLocked) return;
    const sens = 0.0022;
    yaw -= e.movementX * sens;
    pitch -= e.movementY * sens;
    pitch = THREE.MathUtils.clamp(pitch, minPitch, maxPitch);
  }

  function onKeyDown(e) {
    if (keys[e.code] !== undefined) {
      keys[e.code] = true;
    }
    if (e.code === 'KeyV') {
      toggleCameraMode();
    }
    if (e.code === 'KeyE') {
      interactionRequested = true;
      if (viewmodel && isFirstPerson) {
        viewmodel.triggerInteract();
      }
    }
    // Chỉnh nhanh độ sáng bằng [ và ]
    if (e.code === 'BracketLeft') {
      onExposureChange(-CONFIG.renderer.exposureStep);
    }
    if (e.code === 'BracketRight') {
      onExposureChange(CONFIG.renderer.exposureStep);
    }
    // Phím I: Mở túi đồ
    if (e.code === 'KeyI') {
      if (uiCallbacks.toggleInventory) uiCallbacks.toggleInventory();
    }
    // Phím J: Mở tab nhiệm vụ
    if (e.code === 'KeyJ') {
      if (uiCallbacks.toggleQuests) uiCallbacks.toggleQuests();
    }
    // Phím Escape: Mở Settings
    if (e.code === 'Escape') {
      if (uiCallbacks.toggleSettings) uiCallbacks.toggleSettings();
    }
  }

  function onKeyUp(e) {
    if (keys[e.code] !== undefined) {
      keys[e.code] = false;
    }
  }

  function toggleCameraMode() {
    isFirstPerson = !isFirstPerson;
    character.setFirstPersonMode(isFirstPerson);
  }

  function lockPointer() {
    try {
      const p = domElement.requestPointerLock?.();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
    } catch (e) {}
  }

  function unlockPointer() {
    if (document.exitPointerLock) document.exitPointerLock();
  }

  document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === domElement;
  });

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('mousemove', onMouseMove);

  function computeThirdPersonCameraPos(targetPos) {
    const horizontalDist = thirdPersonOffset.z * Math.cos(pitch);
    const camX = targetPos.x + Math.sin(yaw) * horizontalDist + Math.cos(yaw) * thirdPersonOffset.x;
    const camY = targetPos.y + thirdPersonOffset.y + Math.sin(pitch) * thirdPersonOffset.z;
    const camZ = targetPos.z + Math.cos(yaw) * horizontalDist - Math.sin(yaw) * thirdPersonOffset.x;

    const idealPos = new THREE.Vector3(camX, camY, camZ);
    const lookTarget = new THREE.Vector3(
      targetPos.x + Math.cos(yaw) * thirdPersonOffset.x * 0.5,
      targetPos.y + thirdPersonOffset.y * 0.9,
      targetPos.z
    );

    return { camPos: idealPos, lookTarget };
  }

  function update(delta, physics) {
    const charPos = character.getPosition();
    const charRot = character.getRotation();

    const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

    const moveDir = new THREE.Vector3(0, 0, 0);

    if (keys.KeyW) moveDir.add(forward);
    if (keys.KeyS) moveDir.sub(forward);
    if (keys.KeyD) moveDir.add(right);
    if (keys.KeyA) moveDir.sub(right);

    const isMoving = moveDir.lengthSq() > 0.001;
    const isRunning = keys.ShiftLeft || keys.ShiftRight;
    const speed = isRunning ? 6.2 : 3.2;

    let moveDelta = new THREE.Vector3(0, 0, 0);
    if (isMoving) {
      moveDir.normalize();
      moveDelta.copy(moveDir).multiplyScalar(speed * delta);

      if (!isFirstPerson) {
        const targetRotY = Math.atan2(moveDir.x, moveDir.z);
        let diff = targetRotY - charRot.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        charRot.y += diff * 12.0 * delta;
      }
    }

    if (isFirstPerson) {
      charRot.y = yaw + Math.PI;
    }

    const doJump = keys.Space;
    const physResult = physics.update(charPos, moveDelta, doJump, delta);

    let animState = 'idle';
    if (!physResult.isGrounded) {
      animState = 'jump';
    } else if (isMoving) {
      animState = isRunning ? 'run' : 'walk';
    }
    character.update(delta, animState, speed, physResult.isGrounded);

    // Cập nhật Camera
    if (isFirstPerson) {
      camera.position.set(
        charPos.x + firstPersonOffset.x,
        charPos.y + firstPersonOffset.y,
        charPos.z + firstPersonOffset.z
      );
      const lookDir = new THREE.Vector3(
        -Math.sin(yaw) * Math.cos(pitch),
        Math.sin(pitch),
        -Math.cos(yaw) * Math.cos(pitch)
      );
      camera.lookAt(camera.position.clone().add(lookDir));

      if (viewmodel) {
        viewmodel.update(delta, isMoving, isRunning, physResult.isGrounded, camera.rotation);
      }
    } else {
      const { camPos, lookTarget } = computeThirdPersonCameraPos(charPos);
      camera.position.lerp(camPos, 0.15);
      camera.lookAt(lookTarget);
    }

    const interacted = interactionRequested;
    interactionRequested = false;

    return {
      interacted,
      isFirstPerson,
      yaw,
      isMoving,
      isRunning,
      isGrounded: physResult.isGrounded
    };
  }

  return {
    update,
    lockPointer,
    unlockPointer,
    toggleCameraMode,
    isLocked: () => isPointerLocked,
    getYaw: () => yaw
  };
}
