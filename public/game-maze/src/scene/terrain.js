import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { getStoneTexture } from './textures.js';

/**
 * Hàm tính chiều cao địa hình tại (x,z) cho thế giới 1000x1000m.
 * Thuần toán học O(1), dùng được ở mọi nơi không cần array.
 */
export function getTerrainHeight(x, z) {
  const distFromCenter = Math.hypot(x, z);

  // 1. Vùng phẳng quanh đền trung tâm (bán kính 28m)
  if (distFromCenter < 26.0) {
    return 0.0;
  }

  // 2. Núi biên giới bảo vệ (bán kính > 420m → cao dần đến 70m)
  if (distFromCenter > 420.0) {
    const cliffFactor = Math.min((distFromCenter - 420.0) / 65.0, 1.0);
    const jagged = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 6.0;
    return 70.0 * cliffFactor + jagged;
  }

  // Địa hình đồi nhấp nhô tự nhiên: đa tần số
  let h = Math.sin(x * 0.018 + z * 0.012) * 5.0
        + Math.cos(x * 0.012 - z * 0.016) * 6.0
        + Math.sin(x * 0.038 + 1.5) * Math.cos(z * 0.038) * 2.5
        + Math.cos(x * 0.055 - z * 0.055) * 1.8;

  // 3. Hồ Nước Linh Thiêng (Đông Bắc: X~230, Z~-230)
  const distToLake = Math.hypot(x - 230, z - (-230));
  if (distToLake < 55.0) {
    const lakeBlend = distToLake / 55.0;
    const lakeDepression = Math.cos(lakeBlend * Math.PI * 0.5) * 4.5;
    h -= lakeDepression;
  }

  // 4. Đài Quan Sát Đỉnh Đồi (Nam: X~0, Z~300)
  const distToOverlook = Math.hypot(x - 0, z - 300);
  if (distToOverlook < 55.0) {
    const hillRise = Math.cos((distToOverlook / 55.0) * Math.PI * 0.5) * 20.0;
    h += hillRise;
  }

  // 5. Vách Đá & Hang Động (Tây Nam: X~-280, Z~280)
  const distToCave = Math.hypot(x - (-280), z - 280);
  if (distToCave < 60.0) {
    const canyonRise = Math.cos((distToCave / 60.0) * Math.PI * 0.5) * 14.0;
    h += canyonRise;
  }

  // 6. Vách Thác Nước (Đông Bắc xa: X~300, Z~-300)
  const distToWaterfall = Math.hypot(x - 300, z - (-300));
  if (distToWaterfall < 65.0) {
    const waterfallRise = Math.cos((distToWaterfall / 65.0) * Math.PI * 0.5) * 25.0;
    h += waterfallRise;
  }

  // 7. Đầm Lầy (Tây Nam xa: X~-350, Z~350) — vùng thấp
  const distToSwamp = Math.hypot(x - (-350), z - 350);
  if (distToSwamp < 70.0) {
    const swampDepression = Math.cos((distToSwamp / 70.0) * Math.PI * 0.5) * 2.5;
    h -= swampDepression;
  }

  // Làm mịn vùng chuyển tiếp quanh đền (26m–42m)
  if (distFromCenter < 42.0) {
    const blend = (distFromCenter - 26.0) / 16.0;
    h *= blend;
  }

  return h;
}

/**
 * Tạo terrain mesh 1000x1000m, hồ thiêng, đường mòn, bầu trời đêm.
 */
export function createTerrain(scene) {
  const size = CONFIG.world.size; // 1000
  const segments = 200;          // Đủ chi tiết cho đồi nhấp nhô

  const geom = new THREE.PlaneGeometry(size, size, segments, segments);
  geom.rotateX(-Math.PI / 2);

  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, getTerrainHeight(x, z));
  }
  geom.computeVertexNormals();

  // Terrain màu xanh rêu đậm, đủ sáng để nhìn rõ
  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x1a3d2a,           // Xanh rêu sáng hơn trước (+40%)
    roughness: 0.88,
    metalness: 0.08,
    flatShading: false
  });

  const terrainMesh = new THREE.Mesh(geom, terrainMat);
  terrainMesh.receiveShadow = true;
  scene.add(terrainMesh);

  // ── 1. ĐƯỜNG MÒN ĐÁ DẪN ĐẾN 10 KHU VỰC ──
  const pathMat = new THREE.MeshStandardMaterial({
    map: getStoneTexture(),
    roughness: 0.82,
    metalness: 0.1,
    color: 0x3d4a3a            // Đá xám xanh rêu
  });

  function createPath(points, width = 2.6) {
    const curve = new THREE.CatmullRomCurve3(points);
    const curvePoints = curve.getPoints(80);
    const positions = [];
    const uvs = [];

    for (let i = 0; i < curvePoints.length - 1; i++) {
      const p1 = curvePoints[i];
      const p2 = curvePoints[i + 1];
      const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
      const normal = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(width * 0.5);
      const y1 = getTerrainHeight(p1.x, p1.z) + 0.07;
      const y2 = getTerrainHeight(p2.x, p2.z) + 0.07;

      positions.push(
        p1.x - normal.x, y1, p1.z - normal.z,
        p1.x + normal.x, y1, p1.z + normal.z,
        p2.x - normal.x, y2, p2.z - normal.z,
        p1.x + normal.x, y1, p1.z + normal.z,
        p2.x + normal.x, y2, p2.z + normal.z,
        p2.x - normal.x, y2, p2.z - normal.z
      );

      const u = i / curvePoints.length;
      uvs.push(0, u, 1, u, 0, u + 0.025, 1, u, 1, u + 0.025, 0, u + 0.025);
    }

    const pathGeom = new THREE.BufferGeometry();
    pathGeom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    pathGeom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    pathGeom.computeVertexNormals();
    const mesh = new THREE.Mesh(pathGeom, pathMat);
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  // Trung tâm → Rừng Phát Sáng (Tây Bắc ~-250, -250)
  createPath([
    new THREE.Vector3(0, 0, 16),
    new THREE.Vector3(-60, 0, -20),
    new THREE.Vector3(-140, 0, -120),
    new THREE.Vector3(-250, 0, -250)
  ]);
  // Trung tâm → Hồ Linh Thiêng (Đông Bắc ~230, -230)
  createPath([
    new THREE.Vector3(0, 0, 16),
    new THREE.Vector3(60, 0, -20),
    new THREE.Vector3(140, 0, -120),
    new THREE.Vector3(230, 0, -230)
  ]);
  // Trung tâm → Tàn Tích (Đông Nam ~260, 260)
  createPath([
    new THREE.Vector3(0, 0, 16),
    new THREE.Vector3(60, 0, 80),
    new THREE.Vector3(150, 0, 170),
    new THREE.Vector3(260, 0, 260)
  ]);
  // Trung tâm → Hang Động Tinh Thể (Tây Nam ~-280, 280)
  createPath([
    new THREE.Vector3(0, 0, 16),
    new THREE.Vector3(-60, 0, 80),
    new THREE.Vector3(-160, 0, 180),
    new THREE.Vector3(-280, 0, 280)
  ]);
  // Trung tâm → Đài Quan Sát (Nam ~0, 300)
  createPath([
    new THREE.Vector3(0, 0, 16),
    new THREE.Vector3(0, 0, 100),
    new THREE.Vector3(0, 0, 200),
    new THREE.Vector3(0, 0, 300)
  ]);
  // Trung tâm → Làng Nông Trại (Tây ~-220, 0)
  createPath([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-80, 0, -20),
    new THREE.Vector3(-160, 0, 0),
    new THREE.Vector3(-220, 0, 0)
  ]);
  // Trung tâm → Thị Trấn (Bắc ~0, -200)
  createPath([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -80),
    new THREE.Vector3(0, 0, -150),
    new THREE.Vector3(0, 0, -200)
  ]);
  // Trung tâm → Thung Lũng Hoa Gió (Đông ~350, 0)
  createPath([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(120, 0, 20),
    new THREE.Vector3(240, 0, 10),
    new THREE.Vector3(350, 0, 0)
  ]);
  // Trung tâm → Đầm Lầy (Tây Nam xa ~-350, 350)
  createPath([
    new THREE.Vector3(-220, 0, 0),
    new THREE.Vector3(-280, 0, 160),
    new THREE.Vector3(-330, 0, 280),
    new THREE.Vector3(-350, 0, 350)
  ]);
  // Trung tâm → Thác Nước (Đông Bắc xa ~300, -300)
  createPath([
    new THREE.Vector3(230, 0, -230),
    new THREE.Vector3(265, 0, -265),
    new THREE.Vector3(300, 0, -300)
  ]);

  // ── 2. HỒ NƯỚC LINH THIÊNG (Đông Bắc) ──
  const lakeCenter = new THREE.Vector3(230, -0.5, -230);
  const lakeGeom = new THREE.CircleGeometry(50, 56);
  lakeGeom.rotateX(-Math.PI / 2);

  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0a4455,
    roughness: 0.08,
    metalness: 0.90,
    transparent: true,
    opacity: 0.85,
    envMapIntensity: 1.5
  });

  const lakeMesh = new THREE.Mesh(lakeGeom, waterMat);
  lakeMesh.position.copy(lakeCenter);
  scene.add(lakeMesh);

  // Cầu đá bắc qua hồ
  const bridgeGroup = new THREE.Group();
  bridgeGroup.position.set(230, getTerrainHeight(230, -230) + 0.5, -230);
  const stoneMat = new THREE.MeshStandardMaterial({ map: getStoneTexture(), roughness: 0.85 });
  const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.4, 24), stoneMat);
  bridgeDeck.castShadow = true;
  bridgeDeck.receiveShadow = true;
  bridgeGroup.add(bridgeDeck);
  const railL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.75, 24), stoneMat);
  railL.position.set(-1.3, 0.45, 0);
  bridgeGroup.add(railL);
  const railR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.75, 24), stoneMat);
  railR.position.set(1.3, 0.45, 0);
  bridgeGroup.add(railR);
  scene.add(bridgeGroup);

  // Ánh sáng cyan cho hồ
  const lakeLight = new THREE.PointLight(0x00e5ff, 12.0, 80, 2);
  lakeLight.position.set(230, 4, -230);
  scene.add(lakeLight);

  // ── 3. BẦU TRỜI ĐÊM: SAO, TRĂNG, DẢI NGÂN HÀ ──

  // Trăng
  const moonGroup = new THREE.Group();
  moonGroup.position.set(180, 260, -360);

  const moonMesh = new THREE.Mesh(
    new THREE.SphereGeometry(22, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xd8f4ff })
  );
  moonGroup.add(moonMesh);

  const moonHalo = new THREE.Mesh(
    new THREE.SphereGeometry(30, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0x5fc0d8,
      transparent: true,
      opacity: 0.32,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    })
  );
  moonGroup.add(moonHalo);
  scene.add(moonGroup);

  // 3600 ngôi sao (tăng mật độ)
  const starCount = 3600;
  const starGeom = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloat(0.08, 1.0));
    const r = THREE.MathUtils.randFloat(450, 580);

    starPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.cos(phi);
    starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

    // Màu sao: trắng → xanh lam nhạt → teal
    const rnd = Math.random();
    starColors[i * 3]     = rnd > 0.7 ? 0.7 : 1.0;
    starColors[i * 3 + 1] = rnd > 0.7 ? 0.9 : 1.0;
    starColors[i * 3 + 2] = 1.0;
  }

  starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeom.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 1.0,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    sizeAttenuation: true
  });

  const starfield = new THREE.Points(starGeom, starMat);
  scene.add(starfield);

  // Dải Ngân Hà: vòng đai sao dày hơn, hơi tím xanh
  const milkyCount = 1800;
  const milkyGeom = new THREE.BufferGeometry();
  const milkyPos = new Float32Array(milkyCount * 3);

  for (let i = 0; i < milkyCount; i++) {
    // Phân bố dọc theo mặt phẳng nghiêng (dải ngân hà)
    const angle = (i / milkyCount) * Math.PI * 2;
    const spread = (Math.random() - 0.5) * 0.6;
    const r = THREE.MathUtils.randFloat(380, 480);
    const phi = Math.PI * 0.5 + spread;

    // Nghiêng 25 độ
    const sinTilt = Math.sin(0.44);
    const cosTilt = Math.cos(0.44);

    const x0 = r * Math.sin(phi) * Math.cos(angle);
    const y0 = r * Math.cos(phi) + (Math.random() - 0.5) * 60;
    const z0 = r * Math.sin(phi) * Math.sin(angle);

    milkyPos[i * 3]     = x0;
    milkyPos[i * 3 + 1] = y0 * cosTilt - z0 * sinTilt;
    milkyPos[i * 3 + 2] = y0 * sinTilt + z0 * cosTilt;
  }

  milkyGeom.setAttribute('position', new THREE.BufferAttribute(milkyPos, 3));

  const milkyMat = new THREE.PointsMaterial({
    color: 0xaab0ff,           // Màu tím xanh của dải ngân hà
    size: 0.6,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  const milkyWay = new THREE.Points(milkyGeom, milkyMat);
  scene.add(milkyWay);

  return {
    terrainMesh,
    waterMesh: lakeMesh,
    update: (time) => {
      // Gợn sóng hồ nhẹ
      lakeMesh.position.y = lakeCenter.y + Math.sin(time * 1.2) * 0.05;
      // Nhấp nháy sao
      starMat.opacity = 0.85 + Math.sin(time * 1.8) * 0.12;
    }
  };
}
