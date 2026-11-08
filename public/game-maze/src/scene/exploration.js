import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { getStoneTexture } from './textures.js';
import { getTerrainHeight } from './terrain.js';

/**
 * Hệ thống thế giới khám phá mở rộng:
 * - 10 khu vực khám phá (tăng từ 5)
 * - 30 tinh thể (tăng từ 15)
 * - 3 Đá Cổ Ngữ (phân bổ lại ở khu xa)
 * - Trụ dịch chuyển nhanh ở mỗi khu
 * - Hoa rải rác (vàng/tím/hồng)
 * - Đom đóm, đèn lồng
 */
export function createExplorationWorld(scene) {
  const stoneTex = getStoneTexture();
  const stoneMat = new THREE.MeshStandardMaterial({
    map: stoneTex,
    roughness: CONFIG.stone.roughness,
    metalness: CONFIG.stone.metalness,
    emissive: new THREE.Color(CONFIG.stone.emissiveColor),
    emissiveIntensity: CONFIG.stone.emissiveIntensity
  });

  // ── LOAD SAVE ──
  let savedData = { runes: [false, false, false], crystals: [], zones: [] };
  try {
    const raw = localStorage.getItem(CONFIG.gameplay.storageKey);
    if (raw) savedData = JSON.parse(raw);
  } catch (e) {
    savedData = { runes: [false, false, false], crystals: [], zones: [] };
  }
  const runeActiveStates = savedData.runes || [false, false, false];
  const collectedCrystals = new Set(savedData.crystals || []);
  const visitedZones = new Set(savedData.zones || []);

  function saveProgress() {
    let existing = {};
    try {
      existing = JSON.parse(localStorage.getItem(CONFIG.gameplay.storageKey) || '{}');
    } catch (e) {
      existing = {};
    }
    localStorage.setItem(CONFIG.gameplay.storageKey, JSON.stringify({
      ...existing,
      runes: runeActiveStates,
      crystals: Array.from(collectedCrystals),
      zones: Array.from(visitedZones)
    }));
  }

  // ── ZONE REGISTRY ──
  const zoneData = [
    { id: 0, name: 'Rừng Rậm Phát Sáng',      pos: [-250, -250], radius: 60 },
    { id: 1, name: 'Hồ Nước Linh Thiêng',       pos: [ 230, -230], radius: 55 },
    { id: 2, name: 'Tàn Tích Đổ Nát',           pos: [ 260,  260], radius: 60 },
    { id: 3, name: 'Hang Động Tinh Thể',         pos: [-280,  280], radius: 60 },
    { id: 4, name: 'Đài Quan Sát Đỉnh Đồi',     pos: [   0,  300], radius: 50 },
    { id: 5, name: 'Làng Nông Trại',             pos: [-220,    0], radius: 65 },
    { id: 6, name: 'Thị Trấn Giao Thương',       pos: [   0, -200], radius: 65 },
    { id: 7, name: 'Thung Lũng Hoa Gió',         pos: [ 350,    0], radius: 70 },
    { id: 8, name: 'Đầm Lầy Sương Mù',          pos: [-350,  350], radius: 70 },
    { id: 9, name: 'Vách Thác Nước',             pos: [ 300, -300], radius: 65 }
  ];

  // HUD thông báo khu vực
  let zoneNameTimeout = null;
  function showZoneName(name) {
    let el = document.getElementById('zone-name-banner');
    if (!el) return;
    el.textContent = name;
    el.classList.remove('hidden', 'fade-out');
    el.classList.add('visible');
    clearTimeout(zoneNameTimeout);
    zoneNameTimeout = setTimeout(() => {
      el.classList.add('fade-out');
      setTimeout(() => el.classList.add('hidden'), 1200);
    }, 3200);
  }

  // ── 1. ĐÁ CỔ NGỮ (phân bổ lại ở 3 khu xa) ──
  const runePositions = [
    { id: 0, name: 'Rừng Rậm Phát Sáng', x: -250, z: -250, color: 0x00ffcc },
    { id: 1, name: 'Tàn Tích Đổ Nát',    x:  260, z:  260, color: 0x27e39a },
    { id: 2, name: 'Vách Thác Nước',      x:  300, z: -300, color: 0x33e5ff }
  ];

  const runeObjects = [];

  for (const rd of runePositions) {
    const groundY = getTerrainHeight(rd.x, rd.z);
    const group = new THREE.Group();
    group.position.set(rd.x, groundY, rd.z);

    // Bệ tròn
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.0, 0.65, 16), stoneMat);
    plinth.position.y = 0.33;
    plinth.receiveShadow = true;
    group.add(plinth);

    // Mộc bài hình tứ diện
    const obeliskGeom = new THREE.CylinderGeometry(0.5, 1.0, 4.5, 4);
    obeliskGeom.rotateY(Math.PI / 4);
    const runeMat = new THREE.MeshStandardMaterial({
      map: stoneTex,
      roughness: 0.65,
      metalness: 0.25,
      emissive: new THREE.Color(runeActiveStates[rd.id] ? rd.color : 0x051a1a),
      emissiveIntensity: runeActiveStates[rd.id] ? 1.6 : 0.2
    });
    const obelisk = new THREE.Mesh(obeliskGeom, runeMat);
    obelisk.position.y = 2.5;
    obelisk.castShadow = true;
    group.add(obelisk);

    // Tinh thể nổi trên đỉnh
    const diamondGeom = new THREE.OctahedronGeometry(0.5);
    const diamondMat = new THREE.MeshBasicMaterial({
      color: runeActiveStates[rd.id] ? rd.color : 0x4fa8a0,
      wireframe: !runeActiveStates[rd.id]
    });
    const diamond = new THREE.Mesh(diamondGeom, diamondMat);
    diamond.position.y = 5.2;
    group.add(diamond);

    // Ánh sáng điểm
    const runeLight = new THREE.PointLight(rd.color,
      runeActiveStates[rd.id] ? 28.0 : 5.0, 20.0, 2.0);
    runeLight.position.set(0, 4.8, 0);
    group.add(runeLight);

    // Tia sáng bầu trời
    const beamH = 55.0;
    const skyBeamMat = new THREE.MeshBasicMaterial({
      color: rd.color, transparent: true,
      opacity: runeActiveStates[rd.id] ? 0.65 : 0.0,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false
    });
    const skyBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.5, beamH, 12, 1, true), skyBeamMat);
    skyBeam.position.set(0, beamH * 0.5 + 5.0, 0);
    group.add(skyBeam);

    // Đường năng lượng về đền
    const linePoints = [
      new THREE.Vector3(rd.x, groundY + 0.12, rd.z),
      new THREE.Vector3(rd.x * 0.5, getTerrainHeight(rd.x * 0.5, rd.z * 0.5) + 0.18, rd.z * 0.5),
      new THREE.Vector3(0, 0.22, 16)
    ];
    const energyCurve = new THREE.CatmullRomCurve3(linePoints);
    const energyLineMat = new THREE.MeshBasicMaterial({
      color: rd.color, transparent: true,
      opacity: runeActiveStates[rd.id] ? 0.75 : 0.06,
      blending: THREE.AdditiveBlending
    });
    const energyLine = new THREE.Mesh(
      new THREE.TubeGeometry(energyCurve, 48, 0.12, 8, false),
      energyLineMat
    );
    scene.add(energyLine);
    scene.add(group);

    runeObjects.push({
      id: rd.id, name: rd.name,
      pos: new THREE.Vector3(rd.x, groundY, rd.z),
      diamond, runeMat, runeLight, skyBeamMat, energyLineMat,
      isActivated: () => runeActiveStates[rd.id],
      activate: () => {
        if (runeActiveStates[rd.id]) return false;
        runeActiveStates[rd.id] = true;
        runeMat.emissive.setHex(rd.color);
        runeMat.emissiveIntensity = 1.8;
        diamondMat.color.setHex(rd.color);
        diamondMat.wireframe = false;
        runeLight.intensity = 35.0;
        skyBeamMat.opacity = 0.75;
        energyLineMat.opacity = 0.85;
        saveProgress();
        return true;
      }
    });
  }

  // ── 2. RỪNG PHÁT SÁNG (Tây Bắc: -250, -250) ──
  const forestCenter = new THREE.Vector3(-250, 0, -250);

  for (let i = 0; i < 35; i++) {
    const angle = (i / 35) * Math.PI * 2;
    const r = THREE.MathUtils.randFloat(15, 55);
    const tx = forestCenter.x + Math.cos(angle) * r;
    const tz = forestCenter.z + Math.sin(angle) * r;
    const ty = getTerrainHeight(tx, tz);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 1.3, 11, 7),
      new THREE.MeshStandardMaterial({ color: 0x0e1510, roughness: 0.95 })
    );
    trunk.position.set(tx, ty + 5.5, tz);
    trunk.castShadow = true;
    scene.add(trunk);

    const isCyan = i % 3 === 0;
    const foliage = new THREE.Mesh(
      new THREE.SphereGeometry(isCyan ? 4.5 : 3.8, 8, 8),
      new THREE.MeshStandardMaterial({
        color: isCyan ? 0x0a3d2e : 0x0d2a1a,
        emissive: new THREE.Color(isCyan ? 0x003320 : 0x000a08),
        emissiveIntensity: 0.4,
        roughness: 0.8
      })
    );
    foliage.position.set(tx, ty + 12.5, tz);
    foliage.scale.set(1.5, 0.95, 1.5);
    scene.add(foliage);
  }

  // Nấm phát sáng
  for (let m = 0; m < 18; m++) {
    const mx = forestCenter.x + (Math.random() - 0.5) * 60;
    const mz = forestCenter.z + (Math.random() - 0.5) * 60;
    const my = getTerrainHeight(mx, mz);
    const mColor = m % 2 === 0 ? 0x00ffcc : 0xcc44ff;

    const mGroup = new THREE.Group();
    mGroup.position.set(mx, my, mz);
    const mStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.26, 2.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e3830 })
    );
    mStem.position.set(0, 1.2, 0);
    mGroup.add(mStem);
    const cap = new THREE.Mesh(
      new THREE.ConeGeometry(1.3, 0.85, 12),
      new THREE.MeshStandardMaterial({
        color: mColor, emissive: new THREE.Color(mColor),
        emissiveIntensity: 0.9, roughness: 0.28
      })
    );
    cap.position.y = 2.4;
    mGroup.add(cap);
    scene.add(mGroup);
  }

  // ── 3. TÀN TÍCH ĐỔ NÁT (Đông Nam: 260, 260) ──
  const ruinsCenter = new THREE.Vector3(260, 0, 260);
  for (let c = 0; c < 16; c++) {
    const cx = ruinsCenter.x + (Math.random() - 0.5) * 50;
    const cz = ruinsCenter.z + (Math.random() - 0.5) * 50;
    const cy = getTerrainHeight(cx, cz);
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, THREE.MathUtils.randFloat(3, 7), 8),
      stoneMat
    );
    col.position.set(cx, cy + 2.0, cz);
    if (c % 3 === 0) { col.rotation.z = Math.PI * 0.46; col.position.y = cy + 0.6; }
    col.castShadow = true;
    col.receiveShadow = true;
    scene.add(col);
  }

  // Vòm đá lớn
  const archGroup = new THREE.Group();
  archGroup.position.set(ruinsCenter.x, getTerrainHeight(ruinsCenter.x, ruinsCenter.z), ruinsCenter.z - 10);
  const archL = new THREE.Mesh(new THREE.BoxGeometry(1.4, 7, 1.4), stoneMat);
  archL.position.set(-3.5, 3.5, 0);
  archGroup.add(archL);
  const archR = archL.clone(); archR.position.set(3.5, 3.5, 0); archGroup.add(archR);
  const archH = new THREE.Mesh(new THREE.BoxGeometry(9, 1.2, 1.5), stoneMat);
  archH.position.set(0, 7.2, 0); archGroup.add(archH);
  scene.add(archGroup);

  // ── 4. HANG ĐỘNG TINH THỂ (Tây Nam: -280, 280) ──
  const caveCenter = new THREE.Vector3(-280, 0, 280);
  const caveGroundY = getTerrainHeight(caveCenter.x, caveCenter.z);

  const caveArch = new THREE.Mesh(
    new THREE.TorusGeometry(5, 1.3, 8, 18, Math.PI),
    stoneMat
  );
  caveArch.position.set(caveCenter.x, caveGroundY + 1.3, caveCenter.z);
  caveArch.rotation.y = Math.PI * 0.5;
  scene.add(caveArch);

  const caveLight = new THREE.PointLight(0x00ffff, 25, 50, 2);
  caveLight.position.set(caveCenter.x, caveGroundY + 8, caveCenter.z);
  scene.add(caveLight);

  const crystalColors = [0x00ffff, 0xbb44ff, 0x27e39a, 0x55eeff];
  const crystalSpikes = [];
  for (let k = 0; k < 14; k++) {
    const kx = caveCenter.x + (Math.random() - 0.5) * 10;
    const kz = caveCenter.z + (Math.random() - 0.5) * 10;
    const ky = getTerrainHeight(kx, kz);
    const cMat = new THREE.MeshStandardMaterial({
      color: crystalColors[k % 4],
      emissive: new THREE.Color(crystalColors[k % 4]),
      emissiveIntensity: 1.3, roughness: 0.18, metalness: 0.3
    });
    const spike = new THREE.Mesh(
      new THREE.ConeGeometry(0.38, THREE.MathUtils.randFloat(2, 3.5), 6),
      cMat
    );
    spike.position.set(kx, ky + 1.2, kz);
    spike.rotation.set((Math.random() - 0.5) * 0.5, Math.random() * 2, (Math.random() - 0.5) * 0.5);
    scene.add(spike);
    crystalSpikes.push(spike);
  }

  // ── 5. ĐÀI QUAN SÁT ĐỈNH ĐỒI (Nam: 0, 300) ──
  const overlookY = getTerrainHeight(0, 300);
  const pavilion = new THREE.Group();
  pavilion.position.set(0, overlookY, 300);
  const pavPlinth = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.8, 0.85, 16), stoneMat);
  pavPlinth.position.y = 0.43;
  pavilion.add(pavPlinth);
  const railing = new THREE.Mesh(
    new THREE.TorusGeometry(5.0, 0.22, 8, 24, Math.PI * 1.6), stoneMat
  );
  railing.rotation.x = Math.PI / 2; railing.position.y = 1.4;
  pavilion.add(railing);
  scene.add(pavilion);

  const overlookLight = new THREE.PointLight(0x88aaff, 15, 60, 2);
  overlookLight.position.set(0, overlookY + 10, 300);
  scene.add(overlookLight);

  // ── 6. THUNG LŨNG HOA GIÓ (Đông: 350, 0) — Cối xay gió ──
  const windX = 350, windZ = 0;
  const windY = getTerrainHeight(windX, windZ);

  const millGroup = new THREE.Group();
  millGroup.position.set(windX, windY, windZ);

  // Thân cối xay
  const millBody = new THREE.Mesh(
    new THREE.CylinderGeometry(2.5, 3.0, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xd0c8a0, roughness: 0.9 })
  );
  millBody.position.y = 5;
  millBody.castShadow = true;
  millGroup.add(millBody);

  // Cánh quạt (4 cánh)
  const bladeGroup = new THREE.Group();
  bladeGroup.position.set(0, 10, 2.8);

  for (let b = 0; b < 4; b++) {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 7, 0.15),
      new THREE.MeshStandardMaterial({ color: 0xb8c090 })
    );
    blade.position.y = 3.5;
    blade.rotation.z = (b / 4) * Math.PI * 2;
    bladeGroup.add(blade);
  }
  millGroup.add(bladeGroup);
  scene.add(millGroup);

  // Hoa màu sắc rải rác quanh thung lũng
  _createFlowerField(scene, windX, windZ, 80);

  // ── 7. ĐẦM LẦY (Tây Nam: -350, 350) ──
  const swampX = -350, swampZ = 350;
  const swampY = getTerrainHeight(swampX, swampZ);

  // Mặt nước đầm: màu nâu xanh tối
  const swampWaterGeom = new THREE.CircleGeometry(55, 36);
  swampWaterGeom.rotateX(-Math.PI / 2);
  const swampWater = new THREE.Mesh(swampWaterGeom, new THREE.MeshStandardMaterial({
    color: 0x1a3025, roughness: 0.05, metalness: 0.7,
    transparent: true, opacity: 0.78
  }));
  swampWater.position.set(swampX, swampY - 0.3, swampZ);
  scene.add(swampWater);

  // Cây khô
  for (let d = 0; d < 12; d++) {
    const dx = swampX + (Math.random() - 0.5) * 70;
    const dz = swampZ + (Math.random() - 0.5) * 70;
    const dy = getTerrainHeight(dx, dz);
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.4, THREE.MathUtils.randFloat(5, 9), 6),
      new THREE.MeshStandardMaterial({ color: 0x1a1a14, roughness: 1.0 })
    );
    trunk.position.set(dx, dy + 3.5, dz);
    trunk.rotation.z = (Math.random() - 0.5) * 0.3;
    trunk.castShadow = true;
    scene.add(trunk);
  }

  // Đường gỗ qua đầm
  const swampBridgeMat = new THREE.MeshStandardMaterial({ color: 0x3d2a1a, roughness: 0.95 });
  for (let p = 0; p < 8; p++) {
    const plankMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.12, 2.5), swampBridgeMat
    );
    plankMesh.position.set(swampX - 10 + p * 3, swampY + 0.1, swampZ);
    plankMesh.receiveShadow = true;
    scene.add(plankMesh);
  }

  // Đom đóm đầm lầy
  const fireflyCount = 120;
  const fireflyGeom = new THREE.BufferGeometry();
  const ffPos = new Float32Array(fireflyCount * 3);
  for (let f = 0; f < fireflyCount; f++) {
    ffPos[f * 3]     = swampX + (Math.random() - 0.5) * 80;
    ffPos[f * 3 + 1] = swampY + Math.random() * 5 + 0.5;
    ffPos[f * 3 + 2] = swampZ + (Math.random() - 0.5) * 80;
  }
  fireflyGeom.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));
  const fireflyMat = new THREE.PointsMaterial({
    color: 0x88ff44, size: 0.35, transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending
  });
  const fireflies = new THREE.Points(fireflyGeom, fireflyMat);
  scene.add(fireflies);

  // ── 8. THÁC NƯỚC (Đông Bắc xa: 300, -300) ──
  const waterfallX = 300, waterfallZ = -300;
  const waterfallY = getTerrainHeight(waterfallX, waterfallZ);

  // Vách đá thác
  const cliffMesh = new THREE.Mesh(
    new THREE.BoxGeometry(20, 28, 8),
    new THREE.MeshStandardMaterial({
      map: stoneTex, roughness: 0.9, metalness: 0.1,
      emissive: new THREE.Color(0x0a1f1f), emissiveIntensity: 0.2
    })
  );
  cliffMesh.position.set(waterfallX, waterfallY + 14, waterfallZ - 4);
  cliffMesh.castShadow = true;
  scene.add(cliffMesh);

  // Dòng nước (hạt particle)
  const wfParticleCount = 400;
  const wfGeom = new THREE.BufferGeometry();
  const wfPos = new Float32Array(wfParticleCount * 3);
  for (let w = 0; w < wfParticleCount; w++) {
    wfPos[w * 3]     = waterfallX + (Math.random() - 0.5) * 6;
    wfPos[w * 3 + 1] = waterfallY + Math.random() * 25;
    wfPos[w * 3 + 2] = waterfallZ + (Math.random() - 0.5) * 2;
  }
  wfGeom.setAttribute('position', new THREE.BufferAttribute(wfPos, 3));
  const wfMat = new THREE.PointsMaterial({
    color: 0x88ddff, size: 0.3, transparent: true, opacity: 0.72,
    blending: THREE.AdditiveBlending
  });
  const waterfallParticles = new THREE.Points(wfGeom, wfMat);
  scene.add(waterfallParticles);

  // Ánh sáng thác
  const wfLight = new THREE.PointLight(0x55aaff, 20, 60, 2);
  wfLight.position.set(waterfallX, waterfallY + 8, waterfallZ);
  scene.add(wfLight);

  // ── 9. HỒ LINH THIÊNG — Hoa sen phát sáng ──
  for (let ls = 0; ls < 8; ls++) {
    const angle = (ls / 8) * Math.PI * 2;
    const r = THREE.MathUtils.randFloat(15, 35);
    const lx = 230 + Math.cos(angle) * r;
    const lz = -230 + Math.sin(angle) * r;
    const lotusMat = new THREE.MeshBasicMaterial({ color: 0xff88cc });
    const lotus = new THREE.Mesh(new THREE.CircleGeometry(0.4, 8), lotusMat);
    lotus.rotation.x = -Math.PI / 2;
    lotus.position.set(lx, getTerrainHeight(230, -230) - 0.2, lz);
    scene.add(lotus);
  }

  // ── 10. 30 TINH THỂ PHÁT SÁNG ──
  const crystalCoords = [
    // Rừng Phát Sáng (0)
    [-220, -220], [-260, -210], [-240, -260], [-280, -245], [-210, -255],
    // Hồ Linh Thiêng (1)
    [ 200, -200], [ 240, -200], [ 260, -240], [ 215, -255], [ 245, -265],
    // Tàn Tích (2)
    [ 240,  240], [ 265,  255], [ 280,  280], [ 250,  280],
    // Hang Động (3)
    [-255,  260], [-285,  265], [-275,  290],
    // Đài Quan Sát (4)
    [  10,  280], [ -15,  310],
    // Làng Nông Trại (5)
    [-200,   10], [-235,  -15],
    // Thị Trấn (6)
    [  15, -180], [ -15, -215],
    // Thung Lũng Hoa Gió (7)
    [ 320,   15], [ 355,  -20],
    // Đầm Lầy (8)
    [-330,  330], [-360,  355],
    // Thác Nước (9)
    [ 285, -285], [ 315, -310]
  ];

  const crystals = [];
  const crystalItemGeom = new THREE.OctahedronGeometry(0.38);

  crystalCoords.forEach((coord, idx) => {
    const cx = coord[0];
    const cz = coord[1];
    const cy = getTerrainHeight(cx, cz) + 0.95;
    const isCollected = collectedCrystals.has(idx);

    const cItemMat = new THREE.MeshStandardMaterial({
      color: 0x00f7ff,
      emissive: new THREE.Color(0x00f7ff),
      emissiveIntensity: 1.3,
      roughness: 0.12,
      metalness: 0.25,
      transparent: true,
      opacity: isCollected ? 0.0 : 0.95
    });

    const cMesh = new THREE.Mesh(crystalItemGeom, cItemMat);
    cMesh.position.set(cx, cy, cz);
    if (!isCollected) scene.add(cMesh);

    crystals.push({
      id: idx,
      pos: new THREE.Vector3(cx, cy, cz),
      mesh: cMesh, mat: cItemMat,
      isCollected: () => collectedCrystals.has(idx),
      collect: () => {
        if (collectedCrystals.has(idx)) return false;
        collectedCrystals.add(idx);
        cItemMat.opacity = 0.0;
        saveProgress();
        return true;
      }
    });
  });

  // ── 11. TRỤ DỊCH CHUYỂN NHANH (Fast-Travel Pillars) ──
  const fastTravelPillars = [];
  for (const zone of zoneData) {
    const px = zone.pos[0] + 8;
    const pz = zone.pos[1] + 8;
    const py = getTerrainHeight(px, pz);

    const pillarGroup = new THREE.Group();
    pillarGroup.position.set(px, py, pz);

    const pillarBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.5, 2.8, 6),
      new THREE.MeshStandardMaterial({
        color: 0x1a3a3a, emissive: new THREE.Color(visitedZones.has(zone.id) ? 0x00e5cc : 0x001a1a),
        emissiveIntensity: visitedZones.has(zone.id) ? 1.0 : 0.3,
        roughness: 0.5, metalness: 0.3, map: stoneTex
      })
    );
    pillarBody.position.y = 1.4;
    pillarBody.castShadow = true;
    pillarGroup.add(pillarBody);

    const pillarCap = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.3),
      new THREE.MeshBasicMaterial({
        color: visitedZones.has(zone.id) ? 0x00ffcc : 0x334444
      })
    );
    pillarCap.position.y = 3.2;
    pillarGroup.add(pillarCap);

    const pillarLight = new THREE.PointLight(
      0x00ffcc, visitedZones.has(zone.id) ? 8.0 : 1.0, 12, 2
    );
    pillarLight.position.y = 3.5;
    pillarGroup.add(pillarLight);

    scene.add(pillarGroup);

    fastTravelPillars.push({
      zoneId: zone.id,
      zoneName: zone.name,
      pos: new THREE.Vector3(px, py, pz),
      pillarCap,
      pillarLight,
      pillarBody,
      isUnlocked: () => visitedZones.has(zone.id),
      unlock: () => {
        visitedZones.add(zone.id);
        pillarCap.material.color.setHex(0x00ffcc);
        pillarBody.material.emissive.setHex(0x00e5cc);
        pillarBody.material.emissiveIntensity = 1.0;
        pillarLight.intensity = 8.0;
        saveProgress();
      }
    });
  }

  // ── 12. ĐÈN LỒNG THẮP SÁNG KHI ĐẾN GẦN ──
  const lanternPositions = [
    [0, 20], [-30, 12], [30, 12],
    [-100, -100], [100, -100], [140, -140],
    [120, 120], [-140, 140],
    [0, -100], [-100, 0]
  ];

  const lanterns = [];
  for (const lp of lanternPositions) {
    const lx = lp[0], lz = lp[1];
    const ly = getTerrainHeight(lx, lz);

    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.17, 2.4, 8), stoneMat
    );
    post.position.set(lx, ly + 1.2, lz);
    scene.add(post);

    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.2 })
    );
    flame.position.set(lx, ly + 2.5, lz);
    scene.add(flame);

    const lanternLight = new THREE.PointLight(0x00ffcc, 0.0, 12.0, 2.0);
    lanternLight.position.copy(flame.position);
    scene.add(lanternLight);

    lanterns.push({ pos: post.position, flame, light: lanternLight });
  }

  // ── 13. HẠT BỤI PHÁT SÁNG QUANH ĐỀN ──
  const dustCount = 300;
  const dustGeom = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  const dustVel = new Float32Array(dustCount * 3);
  for (let d = 0; d < dustCount; d++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 20;
    dustPos[d * 3]     = Math.cos(angle) * r;
    dustPos[d * 3 + 1] = Math.random() * 8 + 0.5;
    dustPos[d * 3 + 2] = Math.sin(angle) * r + 10;
    dustVel[d * 3]     = (Math.random() - 0.5) * 0.3;
    dustVel[d * 3 + 1] = Math.random() * 0.2 + 0.05;
    dustVel[d * 3 + 2] = (Math.random() - 0.5) * 0.3;
  }
  dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0x88ffee, size: 0.12, transparent: true, opacity: 0.65,
    blending: THREE.AdditiveBlending
  });
  const dustParticles = new THREE.Points(dustGeom, dustMat);
  scene.add(dustParticles);

  // Cối xay gió bladeGroup tham chiếu để animate
  let millBladeGroup = null;
  scene.traverse(o => {
    if (o.type === 'Group' && Math.abs(o.position.x - 350) < 2 && Math.abs(o.position.z) < 2) {
      o.children.forEach(c => {
        if (c.type === 'Group') millBladeGroup = c;
      });
    }
  });

  // ── UPDATE ──
  return {
    runes: runeObjects,
    crystals,
    fastTravelPillars,
    zoneData,

    allRunesActive: () => runeObjects.every(r => r.isActivated()),
    getActiveRuneCount: () => runeObjects.filter(r => r.isActivated()).length,
    getCrystalCount: () => collectedCrystals.size,
    getTotalCrystals: () => crystalCoords.length,

    checkZoneEntry: (playerPos) => {
      for (const zone of zoneData) {
        const dist = Math.hypot(playerPos.x - zone.pos[0], playerPos.z - zone.pos[1]);
        if (dist < zone.radius && !visitedZones.has(zone.id)) {
          visitedZones.add(zone.id);
          saveProgress();
          showZoneName(`✦ ${zone.name}`);
          // Mở khóa trụ dịch chuyển
          const pillar = fastTravelPillars.find(p => p.zoneId === zone.id);
          if (pillar) pillar.unlock();
          return zone.name;
        }
      }
      return null;
    },

    getFastTravelPillarNear: (playerPos, radius = 3.5) => {
      for (const p of fastTravelPillars) {
        if (playerPos.distanceTo(p.pos) < radius && p.isUnlocked()) {
          return p;
        }
      }
      return null;
    },

    update: (time, delta, playerPos) => {
      // Animate rune diamonds
      for (const r of runeObjects) {
        r.diamond.rotation.y += delta * 1.5;
        r.diamond.position.y = 5.2 + Math.sin(time * 2.5 + r.id) * 0.18;
      }

      // Animate tinh thể
      for (const c of crystals) {
        if (!c.isCollected()) {
          c.mesh.rotation.y += delta * 1.9;
          c.mesh.rotation.x = Math.sin(time * 2.0 + c.id) * 0.22;
          c.mesh.position.y = (getTerrainHeight(c.pos.x, c.pos.z) + 0.95) + Math.sin(time * 3.2 + c.id) * 0.14;
          if (playerPos.distanceTo(c.mesh.position) < 2.0) {
            c.collect();
          }
        }
      }

      // Thắp đèn lồng
      for (const l of lanterns) {
        const dist = playerPos.distanceTo(l.pos);
        if (dist < 8.0) {
          l.light.intensity = THREE.MathUtils.lerp(l.light.intensity, 10.0, 0.08);
          l.flame.material.opacity = 0.95;
        } else {
          l.light.intensity = THREE.MathUtils.lerp(l.light.intensity, 0.0, 0.04);
          l.flame.material.opacity = 0.2;
        }
      }

      // Nhấp nháy trụ fast-travel
      for (const p of fastTravelPillars) {
        if (p.isUnlocked()) {
          p.pillarCap.rotation.y += delta * 1.2;
          p.pillarLight.intensity = 8.0 + Math.sin(time * 3.0 + p.zoneId) * 2.0;
        }
      }

      // Hạt bụi quanh đền
      const dp = dustGeom.attributes.position.array;
      for (let d = 0; d < dustCount; d++) {
        dp[d * 3]     += dustVel[d * 3] * delta;
        dp[d * 3 + 1] += dustVel[d * 3 + 1] * delta;
        dp[d * 3 + 2] += dustVel[d * 3 + 2] * delta;
        if (dp[d * 3 + 1] > 10 || Math.hypot(dp[d * 3], dp[d * 3 + 2] - 10) > 22) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * 20;
          dp[d * 3]     = Math.cos(angle) * r;
          dp[d * 3 + 1] = 0.5;
          dp[d * 3 + 2] = Math.sin(angle) * r + 10;
        }
      }
      dustGeom.attributes.position.needsUpdate = true;

      // Đom đóm đầm lầy nhấp nháy
      fireflyMat.opacity = 0.6 + Math.sin(time * 4.0) * 0.3;

      // Cối xay gió quay
      if (millBladeGroup) millBladeGroup.rotation.z += delta * 0.4;

      // Particle thác nước rơi
      const wfArr = wfGeom.attributes.position.array;
      for (let w = 0; w < wfParticleCount; w++) {
        wfArr[w * 3 + 1] -= delta * 8.0;
        if (wfArr[w * 3 + 1] < waterfallY) {
          wfArr[w * 3 + 1] = waterfallY + 24;
        }
      }
      wfGeom.attributes.position.needsUpdate = true;
    }
  };
}

/**
 * Helper: tạo đồng hoa màu sắc rải rác
 */
function _createFlowerField(scene, cx, cz, radius) {
  const flowerColors = [0xffee44, 0xdd44ff, 0xff66aa, 0x88ffcc, 0xff8844];
  const flowerCount = 200;

  for (let f = 0; f < flowerCount; f++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * radius;
    const fx = cx + Math.cos(angle) * r;
    const fz = cz + Math.sin(angle) * r;
    const fy = getTerrainHeight(fx, fz);

    const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
    const petal = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 5, 5),
      new THREE.MeshBasicMaterial({ color })
    );
    petal.position.set(fx, fy + 0.35, fz);
    scene.add(petal);
  }
}
