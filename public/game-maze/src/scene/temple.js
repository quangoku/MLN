import * as THREE from 'three';
import { CONFIG } from '../config.js';
import {
  getStoneTexture,
  getPillarTexture,
  getBannerTexture,
  getRuneDiscTexture,
  getIvyTexture
} from './textures.js';

/**
 * Builds the ancient stone temple hall with tuned lighting, emissive edge accents,
 * 2 inner column pointlights, and prominent celestial god-ray cone.
 */
export function createTemple(scene) {
  const colliders = [];

  const stoneTex = getStoneTexture();
  const pillarTex = getPillarTexture();
  const bannerTex = getBannerTexture();
  const runeDiscTex = getRuneDiscTexture();
  const ivyTex = getIvyTexture();

  // Primary materials with soft emissive so stone is crisp and never drowned in black
  const wallMaterial = new THREE.MeshStandardMaterial({
    map: stoneTex,
    roughness: CONFIG.stone.roughness,
    metalness: CONFIG.stone.metalness,
    emissive: new THREE.Color(CONFIG.stone.emissiveColor),
    emissiveIntensity: CONFIG.stone.emissiveIntensity
  });
  stoneTex.repeat.set(4, 3);

  const pillarMaterial = new THREE.MeshStandardMaterial({
    map: pillarTex,
    roughness: CONFIG.stone.roughness,
    metalness: CONFIG.stone.metalness,
    emissive: new THREE.Color(CONFIG.stone.emissiveColor),
    emissiveIntensity: CONFIG.stone.emissiveIntensity
  });

  const bannerMaterial = new THREE.MeshStandardMaterial({
    map: bannerTex,
    transparent: true,
    roughness: 0.4,
    metalness: 0.1,
    emissive: new THREE.Color(0x00ff88),
    emissiveIntensity: 0.85,
    side: THREE.DoubleSide
  });

  const runeDiscMaterial = new THREE.MeshStandardMaterial({
    map: runeDiscTex,
    roughness: 0.5,
    metalness: 0.2,
    emissive: new THREE.Color(0x00f5ff),
    emissiveIntensity: 1.4
  });

  const ivyMaterial = new THREE.MeshStandardMaterial({
    map: ivyTex,
    transparent: true,
    alphaTest: 0.25,
    roughness: 0.75,
    metalness: 0.05,
    side: THREE.DoubleSide
  });

  // ── 1. FLOOR (EARTH & SOIL BASE UNDER GRASS) ──
  const floorGeom = new THREE.PlaneGeometry(18, 30);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x3d4e46,           // Sàn nền đá rêu sáng màu sạch sẽ
    roughness: 0.85,
    metalness: 0.08,
    emissive: new THREE.Color(0x1a2622),
    emissiveIntensity: 0.28
  });
  const floor = new THREE.Mesh(floorGeom, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 3);
  floor.receiveShadow = true;
  scene.add(floor);

  // ── 2. TEMPLE WALLS ──
  // Back Wall (behind portal and dais)
  const backWallGeom = new THREE.BoxGeometry(18, 12, 1.5);
  const backWall = new THREE.Mesh(backWallGeom, wallMaterial);
  backWall.position.set(0, 5, -10.5);
  backWall.receiveShadow = true;
  backWall.castShadow = true;
  scene.add(backWall);
  colliders.push({ type: 'box', min: [-9, 0, -11.2], max: [9, 12, -9.8] });

  // Left Wall
  const leftWallGeom = new THREE.BoxGeometry(1.5, 12, 30);
  const leftWall = new THREE.Mesh(leftWallGeom, wallMaterial);
  leftWall.position.set(-8.5, 5, 3);
  leftWall.receiveShadow = true;
  scene.add(leftWall);
  colliders.push({ type: 'box', min: [-9.5, 0, -12], max: [-7.8, 12, 18] });

  // Right Wall
  const rightWallGeom = new THREE.BoxGeometry(1.5, 12, 30);
  const rightWall = new THREE.Mesh(rightWallGeom, wallMaterial);
  rightWall.position.set(8.5, 5, 3);
  rightWall.receiveShadow = true;
  scene.add(rightWall);
  colliders.push({ type: 'box', min: [7.8, 0, -12], max: [9.5, 12, 18] });

  // Front Wall Pilasters (open entrance arch allowing exploration into world)
  const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(4.5, 12, 1.5), wallMaterial);
  frontWallLeft.position.set(-6.2, 5, 15.5);
  frontWallLeft.receiveShadow = true;
  scene.add(frontWallLeft);
  colliders.push({ type: 'box', min: [-8.5, 0, 14.8], max: [-3.8, 12, 16.2] });

  const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(4.5, 12, 1.5), wallMaterial);
  frontWallRight.position.set(6.2, 5, 15.5);
  frontWallRight.receiveShadow = true;
  scene.add(frontWallRight);
  colliders.push({ type: 'box', min: [3.8, 0, 14.8], max: [8.5, 12, 16.2] });

  // ── 3. CEILING WITH GEOMETRIC RECESSED COFFERS ──
  const ceilingGroup = new THREE.Group();
  const ceilingY = 9.8;

  const mainCeilingGeom = new THREE.BoxGeometry(18, 1.2, 30);
  const mainCeiling = new THREE.Mesh(mainCeilingGeom, wallMaterial);
  mainCeiling.position.set(0, ceilingY + 0.6, 3);
  ceilingGroup.add(mainCeiling);

  // Recessed geometric stone coffer blocks
  const cofferGeomOuter = new THREE.BoxGeometry(2.4, 0.4, 2.4);
  const cofferGeomInner = new THREE.BoxGeometry(1.6, 0.4, 1.6);
  const cofferMat = new THREE.MeshStandardMaterial({
    color: 0x30424a,
    roughness: 0.85,
    metalness: 0.1,
    emissive: new THREE.Color(0x1a2830),
    emissiveIntensity: 0.28
  });

  for (let cx = -6; cx <= 6; cx += 3.0) {
    for (let cz = -8; cz <= 12; cz += 3.2) {
      const cofferOuter = new THREE.Mesh(cofferGeomOuter, cofferMat);
      cofferOuter.position.set(cx, ceilingY - 0.2, cz);
      cofferOuter.receiveShadow = true;
      ceilingGroup.add(cofferOuter);

      const cofferInner = new THREE.Mesh(cofferGeomInner, wallMaterial);
      cofferInner.position.set(cx, ceilingY - 0.45, cz);
      cofferInner.receiveShadow = true;
      ceilingGroup.add(cofferInner);
    }
  }

  // Transverse support beams
  const beamGeom = new THREE.BoxGeometry(18, 0.8, 1.4);
  for (let bz of [-5.5, 2.0, 9.5]) {
    const beam = new THREE.Mesh(beamGeom, wallMaterial);
    beam.position.set(0, ceilingY - 0.4, bz);
    beam.receiveShadow = true;
    ceilingGroup.add(beam);
  }
  scene.add(ceilingGroup);

  // ── 4. DANGLING CEILING VINES ──
  const vineStripGeom = new THREE.PlaneGeometry(0.5, 3.4);
  const vinePositions = [
    [-4.2, ceilingY - 1.6, 1.8],
    [-4.7, ceilingY - 1.4, 2.4],
    [4.2, ceilingY - 1.6, 1.8],
    [4.8, ceilingY - 1.4, 2.3],
    [-2.2, ceilingY - 1.8, -6.5],
    [2.2, ceilingY - 1.8, -6.5],
    [0.0, ceilingY - 2.0, -8.0],
    [-6.8, ceilingY - 1.5, -2.0],
    [6.8, ceilingY - 1.5, -2.0]
  ];

  for (const vp of vinePositions) {
    const vine = new THREE.Mesh(vineStripGeom, ivyMaterial);
    vine.position.set(vp[0], vp[1], vp[2]);
    vine.rotation.y = (Math.random() - 0.5) * 1.5;
    vine.scale.set(1.0, THREE.MathUtils.randFloat(0.85, 1.4), 1.0);
    scene.add(vine);

    const vineCross = new THREE.Mesh(vineStripGeom, ivyMaterial);
    vineCross.position.copy(vine.position);
    vineCross.rotation.y = vine.rotation.y + Math.PI / 2;
    vineCross.scale.copy(vine.scale);
    scene.add(vineCross);
  }

  // ── 5. THE TWO GIANT FOREGROUND PILLARS & ACCENT LIGHTS ──
  function buildPillar(x, z, hasBanner = true) {
    const pillarGroup = new THREE.Group();
    pillarGroup.position.set(x, 0, z);

    // Stepped plinths
    const base1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 2.4), wallMaterial);
    base1.position.set(0, 0.225, 0);
    base1.receiveShadow = true;
    base1.castShadow = true;
    pillarGroup.add(base1);

    const base2 = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.55, 1.95), wallMaterial);
    base2.position.set(0, 0.725, 0);
    base2.receiveShadow = true;
    base2.castShadow = true;
    pillarGroup.add(base2);

    const base3 = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.35, 1.65), wallMaterial);
    base3.position.set(0, 1.175, 0);
    base3.receiveShadow = true;
    base3.castShadow = true;
    pillarGroup.add(base3);

    // Shaft
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(1.4, 7.2, 1.4), pillarMaterial);
    shaft.position.set(0, 4.95, 0);
    shaft.receiveShadow = true;
    shaft.castShadow = true;
    pillarGroup.add(shaft);

    // Corner beveled mini-columns
    const cornerGeom = new THREE.BoxGeometry(0.35, 7.2, 0.35);
    const cornerOffsets = [
      [-0.65, -0.65], [0.65, -0.65], [-0.65, 0.65], [0.65, 0.65]
    ];
    for (const [cx, cz] of cornerOffsets) {
      const cornerCol = new THREE.Mesh(cornerGeom, pillarMaterial);
      cornerCol.position.set(cx, 4.95, cz);
      cornerCol.receiveShadow = true;
      cornerCol.castShadow = true;
      pillarGroup.add(cornerCol);
    }

    // Capital
    const cap1 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.4, 1.7), wallMaterial);
    cap1.position.set(0, 8.75, 0);
    pillarGroup.add(cap1);

    const cap2 = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.5, 2.1), wallMaterial);
    cap2.position.set(0, 9.2, 0);
    pillarGroup.add(cap2);

    // Glowing green ribbon / banner
    if (hasBanner) {
      const bannerGeom = new THREE.PlaneGeometry(0.58, 4.0);
      const banner = new THREE.Mesh(bannerGeom, bannerMaterial);
      banner.position.set(0, 5.2, 0.86);
      pillarGroup.add(banner);
    }

    // Creeping ivy
    const ivyPlane1 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.4), ivyMaterial);
    ivyPlane1.position.set(0, 1.8, 0.98);
    pillarGroup.add(ivyPlane1);

    const ivyPlane2 = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.0), ivyMaterial);
    ivyPlane2.position.set(0.98, 1.5, 0);
    ivyPlane2.rotation.y = Math.PI / 2;
    pillarGroup.add(ivyPlane2);

    scene.add(pillarGroup);

    colliders.push({
      type: 'box',
      min: [x - 1.15, 0, z - 1.15],
      max: [x + 1.15, 9.8, z + 1.15]
    });
  }

  buildPillar(-4.5, 2.0, true);
  buildPillar(4.5, 2.0, true);
  buildPillar(-6.5, -4.5, false);
  buildPillar(6.5, -4.5, false);

  // ── TWO ACCENT LIGHTS ILLUMINATING INNER COLUMN FACES ──
  const pillarLightL = new THREE.PointLight(
    CONFIG.lighting.pillarLightColor,
    CONFIG.lighting.pillarLightIntensity,
    CONFIG.lighting.pillarLightDistance,
    2.0
  );
  pillarLightL.position.set(-3.6, 3.8, 2.0);
  scene.add(pillarLightL);

  const pillarLightR = new THREE.PointLight(
    CONFIG.lighting.pillarLightColor,
    CONFIG.lighting.pillarLightIntensity,
    CONFIG.lighting.pillarLightDistance,
    2.0
  );
  pillarLightR.position.set(3.6, 3.8, 2.0);
  scene.add(pillarLightR);

  // ── 6. ALTAR DAIS & STAIRS ──
  const daisGeom = new THREE.BoxGeometry(8.0, 1.2, 5.5);
  const dais = new THREE.Mesh(daisGeom, wallMaterial);
  dais.position.set(0, 0.6, -8.3);
  dais.receiveShadow = true;
  dais.castShadow = true;
  scene.add(dais);
  colliders.push({ type: 'box', min: [-4.0, 0, -11.0], max: [4.0, 1.2, -5.6] });

  // 6 Stone Steps
  const stepCount = 6;
  const stepWidth = 3.6;
  const stepHeight = 0.2;
  const stepDepth = 0.48;
  const stairStartZ = -3.2;

  for (let s = 0; s < stepCount; s++) {
    const sy = s * stepHeight + stepHeight * 0.5;
    const sz = stairStartZ - s * stepDepth;

    const stepGeom = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth + 0.05);
    const stepMesh = new THREE.Mesh(stepGeom, wallMaterial);
    stepMesh.position.set(0, sy, sz);
    stepMesh.receiveShadow = true;
    stepMesh.castShadow = true;
    scene.add(stepMesh);

    colliders.push({
      type: 'step',
      index: s,
      height: (s + 1) * stepHeight,
      min: [-stepWidth * 0.5, 0, sz - stepDepth * 0.5],
      max: [stepWidth * 0.5, (s + 1) * stepHeight, sz + stepDepth * 0.5]
    });

    if (s % 2 === 0) {
      const stairIvy = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.5), ivyMaterial);
      stairIvy.rotation.x = -Math.PI / 2;
      stairIvy.position.set((s % 4 === 0 ? 1 : -1) * 1.5, sy + 0.11, sz);
      scene.add(stairIvy);
    }
  }

  // Flanking balustrades
  const balustradeGeom = new THREE.BoxGeometry(0.8, 1.5, 3.2);
  const balustradeLeft = new THREE.Mesh(balustradeGeom, wallMaterial);
  balustradeLeft.position.set(-2.25, 0.75, -4.5);
  balustradeLeft.receiveShadow = true;
  balustradeLeft.castShadow = true;
  scene.add(balustradeLeft);
  colliders.push({ type: 'box', min: [-2.7, 0, -6.1], max: [-1.8, 1.5, -2.9] });

  const balustradeRight = new THREE.Mesh(balustradeGeom, wallMaterial);
  balustradeRight.position.set(2.25, 0.75, -4.5);
  balustradeRight.receiveShadow = true;
  balustradeRight.castShadow = true;
  scene.add(balustradeRight);
  colliders.push({ type: 'box', min: [1.8, 0, -6.1], max: [2.7, 1.5, -2.9] });

  // ── 7. CELESTIAL SPIRAL DISC & PROMINENT CONICAL GOD-RAY ──
  const runeDisc = new THREE.Mesh(new THREE.CircleGeometry(0.95, 32), runeDiscMaterial);
  runeDisc.position.set(0, 6.2, -9.7);
  scene.add(runeDisc);

  const discRingGeom = new THREE.TorusGeometry(0.96, 0.12, 12, 32);
  const discRing = new THREE.Mesh(discRingGeom, wallMaterial);
  discRing.position.set(0, 6.2, -9.68);
  scene.add(discRing);

  // Volumetric Conical God-Ray with Additive Blending (~0.25 opacity)
  const rayHeight = 4.0;
  const rayConeGeom = new THREE.ConeGeometry(0.48, rayHeight, 20, 1, true);
  rayConeGeom.rotateX(Math.PI); // Point down towards rune disc

  const rayConeMat = new THREE.MeshBasicMaterial({
    color: 0x99ffff,
    transparent: true,
    opacity: 0.26,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const godRay = new THREE.Mesh(rayConeGeom, rayConeMat);
  godRay.position.set(0, 6.2 + rayHeight * 0.5, -9.65);
  scene.add(godRay);

  // Inner beam core
  const coreRay = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.14, rayHeight, 16, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  coreRay.position.copy(godRay.position);
  scene.add(coreRay);

  // ── 8. SCATTERED BOULDERS ──
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x1d3036,
    roughness: 0.88,
    metalness: 0.1,
    emissive: new THREE.Color(0x0a2226),
    emissiveIntensity: 0.15
  });

  const rockPlacements = [
    { x: -3.0, z: -2.4, s: 0.65 },
    { x: 3.2, z: -2.2, s: 0.55 },
    { x: -4.8, z: 0.2, s: 0.8 },
    { x: 4.8, z: 0.5, s: 0.75 },
    { x: -2.8, z: 4.2, s: 0.5 },
    { x: 3.5, z: 5.5, s: 0.6 }
  ];

  for (const rp of rockPlacements) {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rp.s, 1), rockMaterial);
    rock.position.set(rp.x, rp.s * 0.45, rp.z);
    rock.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
    rock.scale.set(1.2, 0.75, 1.1);
    rock.receiveShadow = true;
    rock.castShadow = true;
    scene.add(rock);

    colliders.push({
      type: 'sphere',
      center: [rp.x, rp.s * 0.45, rp.z],
      radius: rp.s * 0.85
    });
  }

  return {
    colliders,
    godRay,
    runeDisc,
    update: (time) => {
      rayConeMat.opacity = 0.24 + Math.sin(time * 3.0) * 0.05;
      coreRay.material.opacity = 0.42 + Math.cos(time * 2.5) * 0.08;
    }
  };
}
