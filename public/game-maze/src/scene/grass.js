import * as THREE from 'three';

/**
 * Thảm cỏ và hoa trong sảnh đền cổ đã được gỡ bỏ hoàn toàn
 * để giải phóng 38.000 InstancedMesh, tối ưu hóa hiệu năng tối đa (hết giật lag).
 */
export function createGrassField(scene) {
  return {
    mesh: new THREE.Group(),
    update: () => {}
  };
}
