import * as THREE from 'three';
import { getTerrainHeight } from './scene/terrain.js';
import { CONFIG } from './config.js';

/**
 * Kinematic character physics engine supporting:
 * - Smooth stair climbing inside the temple
 * - Procedural terrain height across the 400x400m exploration world
 * - Steep slope slide detection & physics gravity/jumping
 * - Solid obstacle collision resolution
 */
export function createPhysics(colliders = []) {
  const playerRadius = 0.35;
  const playerHeight = 1.8;
  const gravity = -18.0;
  const jumpVelocity = 6.8;

  let velocityY = 0;
  let isGrounded = true;

  /**
   * Determine exact ground height at (x, z) combining temple steps/dais and outdoor terrain
   */
  function getGroundHeightAt(x, z) {
    // 1. Inside temple sanctuary bounds (|x| < 9.0 && z between -12.0 and 16.2)
    if (Math.abs(x) < 9.0 && z >= -12.0 && z <= 16.2) {
      let templeY = 0.02; // Sàn đền ở y = 0.02
      for (const c of colliders) {
        if (c.type === 'step') {
          if (x >= c.min[0] && x <= c.max[0] && z >= c.min[2] && z <= c.max[2]) {
            if (c.height > templeY) {
              templeY = c.height;
            }
          }
        } else if (c.type === 'box') {
          if (x >= c.min[0] && x <= c.max[0] && z >= c.min[2] && z <= c.max[2]) {
            const topY = c.max[1];
            if (topY <= 1.25 && topY > templeY) {
              templeY = topY;
            }
          }
        }
      }
      return templeY;
    }

    // 2. Outdoor terrain across 400x400m world
    return getTerrainHeight(x, z);
  }

  /**
   * Calculate terrain slope steepness at (x, z)
   */
  function getTerrainSlope(x, z) {
    const delta = 0.4;
    const hCenter = getTerrainHeight(x, z);
    const hX = getTerrainHeight(x + delta, z);
    const hZ = getTerrainHeight(x, z + delta);

    const slopeX = (hX - hCenter) / delta;
    const slopeZ = (hZ - hCenter) / delta;

    return {
      steepness: Math.hypot(slopeX, slopeZ),
      normal: new THREE.Vector3(-slopeX, 1, -slopeZ).normalize()
    };
  }

  /**
   * Resolves obstacle collision (temple walls, columns, rocks)
   */
  function resolveObstacleCollisions(pos) {
    let px = pos.x;
    let pz = pos.z;
    const py = pos.y;

    for (const c of colliders) {
      if (c.type === 'box') {
        const boxMinY = c.min[1];
        const boxMaxY = c.max[1];

        if (py >= boxMaxY - 0.1) continue;
        if (py + playerHeight < boxMinY) continue;

        const minX = c.min[0] - playerRadius;
        const maxX = c.max[0] + playerRadius;
        const minZ = c.min[2] - playerRadius;
        const maxZ = c.max[2] + playerRadius;

        if (px > minX && px < maxX && pz > minZ && pz < maxZ) {
          const dLeft = px - minX;
          const dRight = maxX - px;
          const dBack = pz - minZ;
          const dFront = maxZ - pz;

          const minD = Math.min(dLeft, dRight, dBack, dFront);
          if (minD === dLeft) px = minX;
          else if (minD === dRight) px = maxX;
          else if (minD === dBack) pz = minZ;
          else if (minD === dFront) pz = maxZ;
        }
      } else if (c.type === 'sphere') {
        const [cx, cy, cz] = c.center;
        const rad = c.radius + playerRadius;
        const dist = Math.hypot(px - cx, pz - cz);
        if (dist < rad && dist > 0.0001) {
          const push = (rad - dist) / dist;
          px += (px - cx) * push;
          pz += (pz - cz) * push;
        }
      }
    }

    // Outer world boundary clamp (radius 485m for 1000x1000m world)
    const distFromOrigin = Math.hypot(px, pz);
    if (distFromOrigin > CONFIG.world.boundaryRadius) {
      const scale = CONFIG.world.boundaryRadius / distFromOrigin;
      px *= scale;
      pz *= scale;
    }

    pos.x = px;
    pos.z = pz;
  }

  /**
   * Main physics update step
   */
  function update(pos, moveDelta, doJump, delta) {
    const targetX = pos.x + moveDelta.x;
    const targetZ = pos.z + moveDelta.z;

    // Check step & slope in advance
    const currentGroundY = getGroundHeightAt(pos.x, pos.z);
    const targetGroundY = getGroundHeightAt(targetX, targetZ);
    const stepDiff = targetGroundY - currentGroundY;

    // Steep slope sliding
    const slope = getTerrainSlope(targetX, targetZ);
    if (slope.steepness > CONFIG.world.maxSlopeClimb && Math.hypot(targetX, targetZ) > 30) {
      // Slide back along slope normal
      moveDelta.x += slope.normal.x * 4.5 * delta;
      moveDelta.z += slope.normal.z * 4.5 * delta;
    }

    // Smooth stair climbing: up to 0.28m per step
    if (stepDiff > 0 && stepDiff <= 0.28) {
      pos.y = THREE.MathUtils.lerp(pos.y, targetGroundY, 0.45);
    }

    pos.x += moveDelta.x;
    pos.z += moveDelta.z;

    resolveObstacleCollisions(pos);

    const effectiveGroundY = getGroundHeightAt(pos.x, pos.z);

    if (doJump && isGrounded) {
      velocityY = jumpVelocity;
      isGrounded = false;
    }

    if (!isGrounded) {
      velocityY += gravity * delta;
      pos.y += velocityY * delta;

      if (pos.y <= effectiveGroundY) {
        pos.y = effectiveGroundY;
        velocityY = 0;
        isGrounded = true;
      }
    } else {
      pos.y = THREE.MathUtils.lerp(pos.y, effectiveGroundY, 0.35);
      if (Math.abs(pos.y - effectiveGroundY) < 0.01) {
        pos.y = effectiveGroundY;
      }
    }

    return {
      isGrounded,
      groundY: effectiveGroundY
    };
  }

  return {
    update,
    getGroundHeightAt
  };
}
