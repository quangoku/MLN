 import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { getTerrainHeight } from '../scene/terrain.js';

/**
 * Hệ thống NPC Data-Driven:
 * - 8 loại NPC với model primitive
 * - Patrol waypoint, nhận diện người chơi
 * - Tên & icon nhiệm vụ hiển thị trên đầu
 * - Đóng băng AI khi > 80m
 */

// Định nghĩa 8 loại NPC
const NPC_TYPES = {
  villager: {
    name: 'Dân Làng',
    bodyColor: 0xc8945a,
    shirtColor: 0xd4aa77,
    pantsColor: 0x445522,
    height: 1.6
  },
  farmer: {
    name: 'Nông Dân',
    bodyColor: 0xc07040,
    shirtColor: 0x88aa44,
    pantsColor: 0x553311,
    height: 1.65
  },
  merchant: {
    name: 'Thương Nhân',
    bodyColor: 0xc8945a,
    shirtColor: 0xaa6611,
    pantsColor: 0x332211,
    height: 1.7
  },
  guard: {
    name: 'Lính Canh',
    bodyColor: 0x8a7060,
    shirtColor: 0x445566,
    pantsColor: 0x334455,
    height: 1.8
  },
  scholar: {
    name: 'Học Giả',
    bodyColor: 0xd4aa88,
    shirtColor: 0x334488,
    pantsColor: 0x223366,
    height: 1.65
  },
  hunter: {
    name: 'Thợ Săn',
    bodyColor: 0x9a7050,
    shirtColor: 0x336622,
    pantsColor: 0x442211,
    height: 1.72
  },
  child: {
    name: 'Trẻ Em',
    bodyColor: 0xffccaa,
    shirtColor: 0xff8844,
    pantsColor: 0x3366aa,
    height: 1.1
  },
  elder: {
    name: 'Trưởng Lão',
    bodyColor: 0xb89a80,
    shirtColor: 0x886644,
    pantsColor: 0x554433,
    height: 1.6
  }
};

/**
 * Tạo model NPC từ primitives
 */
function buildNPCModel(type) {
  const def = NPC_TYPES[type];
  const group = new THREE.Group();
  const scale = def.height / 1.7;

  // Thân
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.22 * scale, 0.6 * scale, 4, 8),
    new THREE.MeshStandardMaterial({ color: def.shirtColor, roughness: 0.8 })
  );
  body.position.y = 0.9 * scale;
  body.castShadow = true;
  group.add(body);

  // Đầu
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.2 * scale, 8, 8),
    new THREE.MeshStandardMaterial({ color: def.bodyColor, roughness: 0.75 })
  );
  head.position.y = 1.5 * scale;
  head.castShadow = true;
  group.add(head);

  // Chân trái & phải
  const legMat = new THREE.MeshStandardMaterial({ color: def.pantsColor, roughness: 0.9 });
  const legGeoL = new THREE.CapsuleGeometry(0.1 * scale, 0.5 * scale, 4, 6);
  const legL = new THREE.Mesh(legGeoL, legMat);
  legL.position.set(-0.14 * scale, 0.3 * scale, 0);
  legL.castShadow = true;
  group.add(legL);
  const legR = legL.clone();
  legR.position.set(0.14 * scale, 0.3 * scale, 0);
  group.add(legR);

  // Tay trái & phải
  const armMat = new THREE.MeshStandardMaterial({ color: def.shirtColor, roughness: 0.8 });
  const armGeom = new THREE.CapsuleGeometry(0.08 * scale, 0.4 * scale, 4, 6);
  const armL = new THREE.Mesh(armGeom, armMat);
  armL.position.set(-0.35 * scale, 0.9 * scale, 0);
  armL.castShadow = true;
  group.add(armL);
  const armR = armL.clone();
  armR.position.set(0.35 * scale, 0.9 * scale, 0);
  group.add(armR);

  // Bàn tay
  const handMat = new THREE.MeshStandardMaterial({ color: def.bodyColor, roughness: 0.7 });
  const handGeom = new THREE.SphereGeometry(0.09 * scale, 6, 6);
  const handL = new THREE.Mesh(handGeom, handMat);
  handL.position.set(-0.35 * scale, 0.6 * scale, 0);
  group.add(handL);
  const handR = handL.clone();
  handR.position.set(0.35 * scale, 0.6 * scale, 0);
  group.add(handR);

  return { group, legL, legR, armL, armR, head, scale };
}

/**
 * Tạo label tên NPC và icon nhiệm vụ bằng canvas sprite
 */
function createNameLabel(name, hasQuest = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 48;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 256, 48);

  if (hasQuest) {
    ctx.fillStyle = '#ffdd00';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('!', 128, 20);
  }

  ctx.fillStyle = 'rgba(0,10,16,0.75)';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(20, 24, 216, 22, 6);
  } else {
    ctx.rect(20, 24, 216, 22);
  }
  ctx.fill();

  ctx.fillStyle = '#c8f8f0';
  ctx.font = '13px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(name, 128, 40);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.6, 0.4, 1.0);
  return sprite;
}

/**
 * Tạo một NPC
 */
function createNPC(scene, options) {
  const {
    type = 'villager',
    position = new THREE.Vector3(0, 0, 0),
    name,
    waypoints = [],
    hasQuest = false,
    dialogueId = null
  } = options;

  const def = NPC_TYPES[type];
  const displayName = name || def.name;

  const { group, legL, legR, armL, armR, head, scale } = buildNPCModel(type);
  group.position.copy(position);
  group.position.y = getTerrainHeight(position.x, position.z);
  scene.add(group);

  // Label tên
  const label = createNameLabel(displayName, hasQuest);
  label.position.set(0, 2.0 * scale, 0);
  group.add(label);

  // State
  let currentWaypointIdx = 0;
  let waitTimer = 0;
  let isWaiting = false;
  let isTalkingToPlayer = false;
  let animTime = 0;

  const patrolWaypoints = waypoints.length > 0 ? waypoints : [position.clone()];

  return {
    type,
    displayName,
    hasQuest,
    dialogueId,
    group,
    pos: group.position,

    isNearPlayer: (playerPos) =>
      playerPos.distanceTo(group.position) < CONFIG.npc.interactRadius,

    update: (delta, playerPos, time) => {
      const distToPlayer = playerPos.distanceTo(group.position);

      // Đóng băng AI khi xa
      if (distToPlayer > CONFIG.npc.activationRadius) return;

      animTime += delta;

      if (distToPlayer < CONFIG.npc.interactRadius) {
        // Quay về phía người chơi
        isTalkingToPlayer = true;
        const dx = playerPos.x - group.position.x;
        const dz = playerPos.z - group.position.z;
        const targetYaw = Math.atan2(dx, dz);
        group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetYaw, 0.1);
        // Idle animation: lắc đầu nhẹ
        head.rotation.y = Math.sin(animTime * 1.5) * 0.08;
        armL.rotation.z = Math.sin(animTime * 1.2) * 0.1 + 0.15;
        armR.rotation.z = -Math.sin(animTime * 1.2) * 0.1 - 0.15;
        return;
      }

      isTalkingToPlayer = false;

      if (patrolWaypoints.length <= 1) {
        // Idle animation
        armL.rotation.z = Math.sin(animTime * 0.8) * 0.08 + 0.15;
        armR.rotation.z = -Math.sin(animTime * 0.8) * 0.08 - 0.15;
        return;
      }

      if (isWaiting) {
        waitTimer -= delta;
        if (waitTimer <= 0) {
          isWaiting = false;
          currentWaypointIdx = (currentWaypointIdx + 1) % patrolWaypoints.length;
        }
        return;
      }

      // Di chuyển đến waypoint tiếp theo
      const target = patrolWaypoints[currentWaypointIdx];
      const dx = target.x - group.position.x;
      const dz = target.z - group.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 0.6) {
        isWaiting = true;
        waitTimer = CONFIG.npc.patrolWaitTime;
      } else {
        const moveSpeed = CONFIG.npc.walkSpeed * delta;
        group.position.x += (dx / dist) * moveSpeed;
        group.position.z += (dz / dist) * moveSpeed;
        group.position.y = getTerrainHeight(group.position.x, group.position.z);
        group.rotation.y = Math.atan2(dx, dz);

        // Walk animation
        const walkPhase = animTime * 4.0;
        legL.rotation.x = Math.sin(walkPhase) * 0.5;
        legR.rotation.x = -Math.sin(walkPhase) * 0.5;
        armL.rotation.x = -Math.sin(walkPhase) * 0.4;
        armR.rotation.x = Math.sin(walkPhase) * 0.4;
      }
    }
  };
}

/**
 * Hệ thống NPC toàn bộ thế giới
 */
export function createNPCSystem(scene, explorationWorld) {
  const npcs = [];

  // ── NPC TẠI LÀNG NÔNG TRẠI (Zone 5) ──
  const farmBase = new THREE.Vector3(-220, 0, 0);
  npcs.push(createNPC(scene, {
    type: 'farmer',
    position: new THREE.Vector3(-222, 0, 5),
    name: 'Lão Nông Tiên',
    hasQuest: true,
    dialogueId: 'farmer_intro',
    waypoints: [
      new THREE.Vector3(-222, 0, 5),
      new THREE.Vector3(-230, 0, 10),
      new THREE.Vector3(-215, 0, 15)
    ]
  }));

  npcs.push(createNPC(scene, {
    type: 'villager',
    position: new THREE.Vector3(-210, 0, -5),
    name: 'Bà Nội Làng',
    dialogueId: 'villager_elder'
  }));

  npcs.push(createNPC(scene, {
    type: 'child',
    position: new THREE.Vector3(-225, 0, -8),
    name: 'Bé An',
    dialogueId: 'child_crystal_hint',
    waypoints: [
      new THREE.Vector3(-225, 0, -8),
      new THREE.Vector3(-218, 0, -12),
      new THREE.Vector3(-228, 0, -14),
      new THREE.Vector3(-220, 0, -6)
    ]
  }));

  // ── NPC TẠI THỊ TRẤN GIAO THƯƠNG (Zone 6) ──
  const townBase = new THREE.Vector3(0, 0, -200);
  const townNPCTypes = [
    { type: 'merchant', name: 'Hào Phú Lương', quest: true, dlg: 'merchant_buy_sell' },
    { type: 'guard',    name: 'Lính Canh Minh', quest: false, dlg: 'guard_rune_hint' },
    { type: 'scholar',  name: 'Học Giả Vân',    quest: true, dlg: 'scholar_lore' },
    { type: 'villager', name: 'Dân Phố Hòa',    quest: false, dlg: 'villager_market' },
    { type: 'merchant', name: 'Tiểu Thương Hải', quest: false, dlg: 'merchant_potions' },
    { type: 'villager', name: 'Bà Thị Kim',      quest: false, dlg: 'villager_gossip' },
    { type: 'hunter',   name: 'Thợ Săn Dũng',    quest: true, dlg: 'hunter_quest' },
    { type: 'elder',    name: 'Trưởng Lão Bình',  quest: false, dlg: 'elder_wisdom' }
  ];

  for (let n = 0; n < townNPCTypes.length; n++) {
    const nDef = townNPCTypes[n];
    const angle = (n / townNPCTypes.length) * Math.PI * 2;
    const r = THREE.MathUtils.randFloat(8, 20);
    const nx = 0 + Math.cos(angle) * r;
    const nz = -200 + Math.sin(angle) * r;
    const wp1 = new THREE.Vector3(nx, 0, nz);
    const wp2 = new THREE.Vector3(nx + (Math.random() - 0.5) * 10, 0, nz + (Math.random() - 0.5) * 10);

    npcs.push(createNPC(scene, {
      type: nDef.type,
      position: wp1,
      name: nDef.name,
      hasQuest: nDef.quest,
      dialogueId: nDef.dlg,
      waypoints: [wp1, wp2]
    }));
  }

  // ── NPC CANH GÁC ĐỀN ──
  npcs.push(createNPC(scene, {
    type: 'guard',
    position: new THREE.Vector3(-6, 0, 20),
    name: 'Linh Vệ Cổ Đền',
    dialogueId: 'guard_temple',
    waypoints: [
      new THREE.Vector3(-6, 0, 20),
      new THREE.Vector3(6, 0, 20)
    ]
  }));

  // ── NPC HỌC GIẢ TẠI ĐÀI QUAN SÁT ──
  npcs.push(createNPC(scene, {
    type: 'scholar',
    position: new THREE.Vector3(5, 0, 302),
    name: 'Thiên Văn Học Sĩ',
    hasQuest: true,
    dialogueId: 'scholar_observatory'
  }));

  // ── NPC THỢ SĂN TẠI RỪNG PHÁT SÁNG ──
  npcs.push(createNPC(scene, {
    type: 'hunter',
    position: new THREE.Vector3(-245, 0, -248),
    name: 'Liệt Sĩ Rừng',
    dialogueId: 'hunter_forest',
    waypoints: [
      new THREE.Vector3(-245, 0, -248),
      new THREE.Vector3(-255, 0, -255),
      new THREE.Vector3(-240, 0, -260)
    ]
  }));

  return {
    npcs,
    update: (delta, playerPos, time) => {
      for (const npc of npcs) {
        npc.update(delta, playerPos, time);
      }
    },
    getNearbyNPC: (playerPos) => {
      for (const npc of npcs) {
        if (playerPos.distanceTo(npc.pos) < CONFIG.npc.interactRadius) {
          return npc;
        }
      }
      return null;
    }
  };
}

