import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { getStoneTexture } from './textures.js';

/**
 * Hàm tính chiều cao địa hình tại (x,z) cho thế giới 1000x1000m.
 * Thuần toán học O(1), dùng được ở mọi nơi không cần array.
 */
export function getTerrainHeight(x, z) {
  // 0. Hạ thấp địa hình dưới sàn đền cổ (-0.2m) để triệt tiêu hoàn toàn Z-fighting với sàn đá
  if (Math.abs(x) < 9.2 && z >= -12.0 && z <= 16.5) {
    return -0.2;
  }

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
  const segments = 120;          // 120x120 đủ chi tiết đồi núi mượt mà, giảm 65% số đa giác tam giác

  const geom = new THREE.PlaneGeometry(size, size, segments, segments);
  geom.rotateX(-Math.PI / 2);

  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, getTerrainHeight(x, z));
  }
  geom.computeVertexNormals();

  // Terrain màu cỏ xanh tươi ban ngày, sáng rõ cảnh quan
  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x3d7e42,           // Cỏ xanh ban ngày tươi sáng
    roughness: 0.85,
    metalness: 0.05,
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
    color: 0x6e7568            // Đá đường mòn tự nhiên sáng màu
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
    color: 0x1f88a8,           // Nước hồ trong xanh ban ngày
    roughness: 0.08,
    metalness: 0.85,
    transparent: true,
    opacity: 0.88,
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

  // ── 3. BẦU TRỜI BAN NGÀY: MẶT TRỜI VÀ HÀO QUANG NẮNG ẤM ──
  const sunGroup = new THREE.Group();
  sunGroup.position.set(200, 280, -360);

  const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(30, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xfffae0 })
  );
  sunGroup.add(sunMesh);

  const sunHalo = new THREE.Mesh(
    new THREE.SphereGeometry(52, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xffe680,
      transparent: true,
      opacity: 0.45,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    })
  );
  sunGroup.add(sunHalo);
  scene.add(sunGroup);

  return {
    terrainMesh,
    waterMesh: lakeMesh,
    update: (time) => {
      // Gợn sóng hồ nhẹ
      lakeMesh.position.y = lakeCenter.y + Math.sin(time * 1.2) * 0.05;
    }
  };
}
