import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { getStoneTexture } from './textures.js';
import { getTerrainHeight } from './terrain.js';

/**
 * Thị Trấn Giao Thương — Zone 6 (Bắc: 0, -200)
 * Quảng trường chợ, 8+ quầy hàng, 20+ NPC spawn points, đài phun nước
 */
export function createTradeTown(scene) {
  const stoneTex = getStoneTexture();
  const stoneMat = new THREE.MeshStandardMaterial({
    map: stoneTex, roughness: 0.82, metalness: 0.1,
    emissive: new THREE.Color(0x0f2a1a), emissiveIntensity: 0.18
  });

  const BASE_X = 0, BASE_Z = -200;
  const baseY = getTerrainHeight(BASE_X, BASE_Z);

  // ── QUẢNG TRƯỜNG ĐÁ LÁT ──
  const squareMat = new THREE.MeshStandardMaterial({
    color: 0x5a5040, roughness: 0.88, metalness: 0.05,
    map: stoneTex
  });
  const square = new THREE.Mesh(
    new THREE.BoxGeometry(50, 0.25, 50), squareMat
  );
  square.position.set(BASE_X, baseY + 0.12, BASE_Z);
  square.receiveShadow = true;
  scene.add(square);

  // ── ĐÀI PHUN NƯỚC TRUNG TÂM ──
  const fountainGroup = new THREE.Group();
  fountainGroup.position.set(BASE_X, baseY + 0.25, BASE_Z);

  const fountainBase = new THREE.Mesh(
    new THREE.CylinderGeometry(4.0, 4.4, 0.65, 16), stoneMat
  );
  fountainBase.position.y = 0.33;
  fountainGroup.add(fountainBase);

  const fountainTier2 = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.4, 0.5, 12), stoneMat
  );
  fountainTier2.position.y = 1.1;
  fountainGroup.add(fountainTier2);

  const fountainTop = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 1.2, 8), stoneMat
  );
  fountainTop.position.y = 1.9;
  fountainGroup.add(fountainTop);

  scene.add(fountainGroup);

  // Hạt nước phun
  const waterParticleCount = 180;
  const waterGeom = new THREE.BufferGeometry();
  const waterPos = new Float32Array(waterParticleCount * 3);
  const waterVel = new Float32Array(waterParticleCount * 3);

  for (let w = 0; w < waterParticleCount; w++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.5;
    waterPos[w * 3]     = BASE_X + Math.cos(angle) * r;
    waterPos[w * 3 + 1] = baseY + 2.0 + Math.random() * 1.5;
    waterPos[w * 3 + 2] = BASE_Z + Math.sin(angle) * r;
    const spd = Math.random() * 1.5 + 0.5;
    waterVel[w * 3]     = Math.cos(angle) * spd;
    waterVel[w * 3 + 1] = Math.random() * 2.5 + 1.0;
    waterVel[w * 3 + 2] = Math.sin(angle) * spd;
  }

  waterGeom.setAttribute('position', new THREE.BufferAttribute(waterPos, 3));
  const waterMat = new THREE.PointsMaterial({
    color: 0x88ddff, size: 0.2, transparent: true, opacity: 0.75,
    blending: THREE.AdditiveBlending
  });
  const fountainWater = new THREE.Points(waterGeom, waterMat);
  scene.add(fountainWater);

  // Ánh sáng cyan cho đài phun
  const fountainLight = new THREE.PointLight(0x44aaff, 20.0, 40, 2);
  fountainLight.position.set(BASE_X, baseY + 4, BASE_Z);
  scene.add(fountainLight);

  // ── CỔng VÀO THỊ TRẤN ──
  const gateGroup = new THREE.Group();
  gateGroup.position.set(BASE_X, baseY, BASE_Z + 32);
  const gateL = new THREE.Mesh(new THREE.BoxGeometry(1.4, 7.5, 1.4), stoneMat);
  gateL.position.set(-4.5, 3.75, 0);
  gateL.castShadow = true;
  gateGroup.add(gateL);
  const gateR = gateL.clone(); gateR.position.set(4.5, 3.75, 0); gateGroup.add(gateR);
  const gateH = new THREE.Mesh(new THREE.BoxGeometry(10.5, 1.5, 1.6), stoneMat);
  gateH.position.set(0, 7.75, 0);
  gateGroup.add(gateH);
  // Đèn cổng
  for (let g = 0; g < 2; g++) {
    const gl = new THREE.PointLight(0xffcc44, 12, 20, 2);
    gl.position.set(g === 0 ? -4.5 : 4.5, 8.5, 0);
    gateGroup.add(gl);
  }
  scene.add(gateGroup);

  // ── 8 QUẦY HÀNG (xung quanh quảng trường) ──
  const stallColors = [
    0xff4444, 0x44ff44, 0x4444ff, 0xffaa44,
    0xaa44ff, 0xff44aa, 0x44ffaa, 0xffff44
  ];

  const merchantStalls = [];
  for (let s = 0; s < 8; s++) {
    const angle = (s / 8) * Math.PI * 2;
    const sx = BASE_X + Math.cos(angle) * 18;
    const sz = BASE_Z + Math.sin(angle) * 18;
    const sy = getTerrainHeight(sx, sz) + 0.25;

    const stallGroup = new THREE.Group();
    stallGroup.position.set(sx, sy, sz);
    stallGroup.rotation.y = angle + Math.PI;

    // Bàn
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.6, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.9 })
    );
    table.position.y = 0.8;
    table.castShadow = true;
    stallGroup.add(table);

    // Mái che (màu khác nhau)
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 0.12, 2.0),
      new THREE.MeshStandardMaterial({ color: stallColors[s], roughness: 0.8 })
    );
    awning.position.set(0, 2.5, -0.3);
    stallGroup.add(awning);

    // Trụ đỡ mái
    for (let p = 0; p < 2; p++) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.4, 6), stoneMat);
      pole.position.set(p === 0 ? -1.8 : 1.8, 1.2, -1.1);
      stallGroup.add(pole);
    }

    // Đèn lồng vàng
    const stallLight = new THREE.PointLight(0xffbb44, 8.0, 15, 2);
    stallLight.position.set(0, 3.0, 0);
    stallGroup.add(stallLight);

    scene.add(stallGroup);

    merchantStalls.push({
      id: s,
      pos: new THREE.Vector3(sx, sy, sz),
      name: ['Thương Nhân Kim Khí', 'Thảo Dược Viên', 'Trang Bị Thợ Săn',
             'Hàng Nông Sản', 'Đồ Cổ Huyền Bí', 'Vũ Khí Thủ Công',
             'Hàng Vải Lụa', 'Hàng Tinh Thể'][s]
    });
  }

  // ── BẢNG THÔNG BÁO (Bulletin Board) ──
  const boardY = getTerrainHeight(BASE_X + 12, BASE_Z - 10) + 0.25;
  const boardGroup = new THREE.Group();
  boardGroup.position.set(BASE_X + 12, boardY, BASE_Z - 10);

  const boardPost = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 2.5, 6), stoneMat);
  boardPost.position.y = 1.25;
  boardGroup.add(boardPost);

  const boardFace = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.2, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x5a3a0a, roughness: 0.9 })
  );
  boardFace.position.y = 2.6;
  boardGroup.add(boardFace);
  scene.add(boardGroup);

  // ── 20 VỊ TRÍ SPAWN NPC ──
  const npcSpawnPositions = [];
  for (let n = 0; n < 20; n++) {
    const angle = (n / 20) * Math.PI * 2;
    const r = THREE.MathUtils.randFloat(5, 22);
    const nx = BASE_X + Math.cos(angle) * r;
    const nz = BASE_Z + Math.sin(angle) * r;
    npcSpawnPositions.push(new THREE.Vector3(nx, getTerrainHeight(nx, nz), nz));
  }

  // ── ĐÈN LỒNG TRANG TRÍ ──
  for (let l = 0; l < 12; l++) {
    const angle = (l / 12) * Math.PI * 2;
    const lx = BASE_X + Math.cos(angle) * 24;
    const lz = BASE_Z + Math.sin(angle) * 24;
    const ly = getTerrainHeight(lx, lz);

    const lanternPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.12, 3.5, 6),
      stoneMat
    );
    lanternPost.position.set(lx, ly + 1.75, lz);
    scene.add(lanternPost);

    const lanternLight = new THREE.PointLight(0xffcc44, 6.0, 20, 2);
    lanternLight.position.set(lx, ly + 3.8, lz);
    scene.add(lanternLight);
  }

  return {
    merchantStalls,
    npcSpawnPositions,
    basePos: new THREE.Vector3(BASE_X, baseY, BASE_Z),
    fountainWater,
    waterPos,
    waterVel,
    waterParticleCount,
    update: (time, delta) => {
      // Animate đài phun nước
      for (let w = 0; w < waterParticleCount; w++) {
        waterPos[w * 3]     += waterVel[w * 3] * delta * 0.5;
        waterPos[w * 3 + 1] += waterVel[w * 3 + 1] * delta;
        waterPos[w * 3 + 2] += waterVel[w * 3 + 2] * delta * 0.5;
        waterVel[w * 3 + 1] -= 9.8 * delta; // Trọng lực

        if (waterPos[w * 3 + 1] < baseY + 0.5) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * 0.5;
          waterPos[w * 3]     = BASE_X + Math.cos(angle) * r;
          waterPos[w * 3 + 1] = baseY + 2.0;
          waterPos[w * 3 + 2] = BASE_Z + Math.sin(angle) * r;
          const spd = Math.random() * 1.5 + 0.5;
          waterVel[w * 3]     = Math.cos(angle) * spd;
          waterVel[w * 3 + 1] = Math.random() * 2.5 + 1.5;
          waterVel[w * 3 + 2] = Math.sin(angle) * spd;
        }
      }
      waterGeom.attributes.position.needsUpdate = true;

      // Nhấp nháy ánh sáng đài phun
      fountainLight.intensity = 20.0 + Math.sin(time * 2.0) * 5.0;
    }
  };
}

