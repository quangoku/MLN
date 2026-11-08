import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { getStoneTexture } from './textures.js';
import { getTerrainHeight } from './terrain.js';

/**
 * Làng Nông Trại — Zone 5 (Tây: -220, 0)
 * Nhà dân, kho thóc, giếng, hàng rào, 10 ô ruộng, 5 loại cây
 */
export function createFarmingVillage(scene) {
  const stoneTex = getStoneTexture();
  const stoneMat = new THREE.MeshStandardMaterial({
    map: stoneTex, roughness: 0.88, metalness: 0.08,
    emissive: new THREE.Color(0x0f2a1a), emissiveIntensity: 0.15
  });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.95 });
  const thatchMat = new THREE.MeshStandardMaterial({ color: 0x8a7a3a, roughness: 0.9 });

  const BASE_X = -220, BASE_Z = 0;
  const baseY = getTerrainHeight(BASE_X, BASE_Z);

  // ── NHÀ DÂN ──
  function buildHouse(x, z, angle = 0) {
    const y = getTerrainHeight(x, z);
    const hGroup = new THREE.Group();
    hGroup.position.set(x, y, z);
    hGroup.rotation.y = angle;

    // Tường
    const walls = new THREE.Mesh(new THREE.BoxGeometry(5, 3.5, 6), woodMat);
    walls.position.y = 1.75;
    walls.castShadow = true; walls.receiveShadow = true;
    hGroup.add(walls);

    // Mái (hình nêm)
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(4.5, 2.5, 4),
      thatchMat
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 4.75;
    roof.castShadow = true;
    hGroup.add(roof);

    // Cửa
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 2.0, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x3d2010 })
    );
    door.position.set(0, 1.0, 3.05);
    hGroup.add(door);

    // Đèn lồng vàng
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffcc44 })
    );
    lantern.position.set(0.8, 3.2, 3.1);
    hGroup.add(lantern);
    const lanternLight = new THREE.PointLight(0xffcc44, 8.0, 15, 2);
    lanternLight.position.copy(lantern.position);
    hGroup.add(lanternLight);

    scene.add(hGroup);
    return hGroup;
  }

  // 4 ngôi nhà
  buildHouse(BASE_X - 15, BASE_Z - 15, 0.3);
  buildHouse(BASE_X + 15, BASE_Z - 12, -0.4);
  buildHouse(BASE_X - 18, BASE_Z + 15, 0.1);
  buildHouse(BASE_X + 12, BASE_Z + 18, -0.2);

  // ── KHO THÓC ──
  const barnY = getTerrainHeight(BASE_X, BASE_Z - 25);
  const barn = new THREE.Group();
  barn.position.set(BASE_X, barnY, BASE_Z - 25);
  const barnWall = new THREE.Mesh(new THREE.BoxGeometry(10, 5.5, 8), woodMat);
  barnWall.position.y = 2.75;
  barnWall.castShadow = true;
  barn.add(barnWall);
  const barnRoof = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 6.5, 2.5, 4),
    thatchMat
  );
  barnRoof.position.y = 6.5;
  barnRoof.rotation.y = Math.PI / 4;
  barn.add(barnRoof);
  scene.add(barn);

  // ── GIẾNG ──
  const wellY = getTerrainHeight(BASE_X + 5, BASE_Z);
  const wellGroup = new THREE.Group();
  wellGroup.position.set(BASE_X + 5, wellY, BASE_Z);
  const wellBase = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.5, 0.9, 12), stoneMat);
  wellBase.position.y = 0.45;
  wellGroup.add(wellBase);
  const wellWall = new THREE.Mesh(
    new THREE.TorusGeometry(1.4, 0.2, 8, 16),
    stoneMat
  );
  wellWall.rotation.x = Math.PI / 2;
  wellWall.position.y = 0.9;
  wellGroup.add(wellWall);
  // Trụ trên
  for (let w = 0; w < 2; w++) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.0, 6), woodMat);
    post.position.set(w === 0 ? -1.3 : 1.3, 1.9, 0);
    wellGroup.add(post);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.15, 0.15), woodMat);
  beam.position.y = 2.9;
  wellGroup.add(beam);
  scene.add(wellGroup);

  // ── HÀNG RÀO ──
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0x6b4a22, roughness: 0.95 });
  for (let f = 0; f < 24; f++) {
    const angle = (f / 24) * Math.PI * 2;
    const r = 32;
    const fx = BASE_X + Math.cos(angle) * r;
    const fz = BASE_Z + Math.sin(angle) * r;
    const fy = getTerrainHeight(fx, fz);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.6, 0.18), fenceMat);
    post.position.set(fx, fy + 0.8, fz);
    post.castShadow = true;
    scene.add(post);
  }

  // ── 10 Ô RUỘNG (2x5 lưới) ──
  const farmKey = CONFIG.gameplay.farmKey;
  const savedFarm = JSON.parse(localStorage.getItem(farmKey) || '{}');

  // Định nghĩa cây trồng
  const cropDefs = {
    carrot:      { name: 'Cà rốt',       color: 0xff7700, emissive: 0x441500, time: CONFIG.farming.cropGrowthTime.carrot },
    rice:        { name: 'Lúa',           color: 0xc8e040, emissive: 0x1a1800, time: CONFIG.farming.cropGrowthTime.rice },
    pumpkin:     { name: 'Bí ngô',        color: 0xff8c00, emissive: 0x200800, time: CONFIG.farming.cropGrowthTime.pumpkin },
    cyanFlower:  { name: 'Hoa Thủy Tinh', color: 0x00ffcc, emissive: 0x00aa66, time: CONFIG.farming.cropGrowthTime.cyanFlower },
    cyanMushroom:{ name: 'Nấm Phát Sáng', color: 0x00ffff, emissive: 0x005555, time: CONFIG.farming.cropGrowthTime.cyanMushroom }
  };
  const cropKeys = Object.keys(cropDefs);

  const plots = [];
  const plotMeshes = [];

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 5; col++) {
      const plotIdx = row * 5 + col;
      const px = BASE_X - 25 + col * 7;
      const pz = BASE_Z + 15 + row * 7;
      const py = getTerrainHeight(px, pz);

      // Nền ô ruộng
      const plotBase = new THREE.Mesh(
        new THREE.BoxGeometry(5.5, 0.18, 5.5),
        new THREE.MeshStandardMaterial({ color: 0x3d2a0a, roughness: 1.0 })
      );
      plotBase.position.set(px, py + 0.09, pz);
      plotBase.receiveShadow = true;
      scene.add(plotBase);

      // Khôi phục state từ localStorage
      const savedPlot = savedFarm[plotIdx] || { state: 'idle', cropType: null, plantedAt: null };
      let currentState = savedPlot.state;
      let cropType = savedPlot.cropType;
      let plantedAt = savedPlot.plantedAt;

      // Mesh cây trồng (placeholder, cập nhật theo state)
      let cropMesh = null;

      function buildCropMesh(state, cType) {
        if (cropMesh) { scene.remove(cropMesh); cropMesh = null; }
        if (state !== 'growing' && state !== 'harvestable') return;
        if (!cType || !cropDefs[cType]) return;
        const def = cropDefs[cType];
        const growFraction = state === 'harvestable' ? 1.0 : 0.5;
        const height = growFraction * 0.9 + 0.2;
        cropMesh = new THREE.Mesh(
          new THREE.SphereGeometry(growFraction * 0.4 + 0.1, 6, 6),
          new THREE.MeshStandardMaterial({
            color: def.color,
            emissive: new THREE.Color(def.emissive),
            emissiveIntensity: state === 'harvestable' ? 0.9 : 0.4,
            roughness: 0.5
          })
        );
        cropMesh.position.set(px, py + height, pz);
        scene.add(cropMesh);
      }

      buildCropMesh(currentState, cropType);

      function savePlot() {
        const farm = JSON.parse(localStorage.getItem(farmKey) || '{}');
        farm[plotIdx] = { state: currentState, cropType, plantedAt };
        localStorage.setItem(farmKey, JSON.stringify(farm));
      }

      plots.push({
        idx: plotIdx,
        pos: new THREE.Vector3(px, py, pz),
        getState: () => currentState,
        getCropType: () => cropType,
        isHarvestable: () => currentState === 'harvestable',
        interact: () => {
          if (currentState === 'idle') {
            // Trồng cây ngẫu nhiên
            cropType = cropKeys[Math.floor(Math.random() * cropKeys.length)];
            currentState = 'growing';
            plantedAt = Date.now();
            buildCropMesh('growing', cropType);
            savePlot();
            return `Đã trồng ${cropDefs[cropType].name}!`;
          } else if (currentState === 'harvestable') {
            const result = `Thu hoạch ${cropDefs[cropType].name}!`;
            currentState = 'idle';
            cropType = null;
            plantedAt = null;
            buildCropMesh('idle', null);
            savePlot();
            return result;
          }
          return null;
        },
        update: () => {
          if (currentState === 'growing' && plantedAt && cropType && cropDefs[cropType]) {
            const elapsed = Date.now() - plantedAt;
            const growTime = cropDefs[cropType].time;
            if (elapsed >= growTime) {
              currentState = 'harvestable';
              buildCropMesh('harvestable', cropType);
              savePlot();
            }
          }
        }
      });
    }
  }

  // ── NPC NÔNG DÂN ──
  // Sẽ được tạo bởi NPCSystem

  return {
    plots,
    basePos: new THREE.Vector3(BASE_X, baseY, BASE_Z),
    update: () => {
      for (const p of plots) p.update();
    }
  };
}

