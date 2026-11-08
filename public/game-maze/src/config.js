import * as THREE from 'three';

/**
 * Global Configuration for Ancient Temple & Exploration World.
 * Chỉnh sửa tất cả hằng số tại đây để tinh chỉnh mà không cần đọc code game.
 */
export const CONFIG = {
  // ── 1. RENDERER & EXPOSURE ──
  renderer: {
    exposure: 2.0,             // Độ phơi sáng cơ bản (chỉnh bằng [ và ] in-game)
    minExposure: 0.8,          // Tối thiểu
    maxExposure: 3.5,          // Tối đa
    exposureStep: 0.1,         // Bước mỗi lần nhấn [ hoặc ]
    toneMapping: THREE.ACESFilmicToneMapping,
    outputColorSpace: THREE.SRGBColorSpace,
    pixelRatioLimit: 2.0,      // Giới hạn pixel ratio để không quá nặng
    shadowMapSize: 2048        // Kích thước shadow map (1024 nếu FPS thấp)
  },

  // ── 2. LIGHTING (BAN NGÀY TƯƠI SÁNG) ──
  lighting: {
    // HemisphereLight: bầu trời ban ngày xanh mát, mặt đất phản xạ ấm
    hemiSkyColor: 0x98ddf5,    // Bầu trời xanh ban ngày
    hemiGroundColor: 0x7cb36b, // Mặt đất cỏ phản xạ ấm
    hemiIntensity: 2.8,        // Cường độ ánh sáng vòm trời

    // AmbientLight: ánh sáng môi trường ban ngày phủ khắp không gian (trong đền sáng rõ)
    ambientColor: 0xffffff,    // Trắng ban ngày
    ambientIntensity: 1.8,     // Sáng rõ không gian và chi tiết

    // DirectionalLight: Ánh nắng mặt trời ban ngày rực rỡ
    moonColor: 0xfff6dc,       // Nắng vàng ấm tự nhiên
    moonIntensity: 3.0,        // Cường độ ánh nắng
    moonPosition: [75, 160, 55],

    // Portal PointLight: phát sáng cyan mạnh
    portalLightColor: 0x00ffcc,
    portalLightIntensity: 85.0,
    portalLightDistance: 30.0,
    portalLightDecay: 2.0,

    // 2 PointLight cột đền: chiếu sáng mặt trong cột
    pillarLightColor: 0x00e5c8,
    pillarLightIntensity: 24.0,
    pillarLightDistance: 16.0
  },

  // ── 3. FOG (BẦU TRỜI BAN NGÀY RỘNG MỞ) ──
  fog: {
    color: 0x98ddf5,           // Trời xanh ban ngày (Sky Blue)
    density: 0.0025            // Mỏng, tầm nhìn xa rõ nét cảnh quan
  },

  // ── 4. BLOOM & POST-PROCESSING ──
  bloom: {
    strength: 0.45,            // Mức bloom vừa phải, trong trẻo
    radius: 0.4,
    threshold: 0.88            // Chỉ phần phát sáng mới bloom
  },
  colorGrading: {
    vignetteDarkness: 0.18,    // Rất nhẹ, góc màn hình không bị tối
    vignetteOffset: 1.1,
    tealShadowTint: 0x000000   // Bóng tự nhiên, không ám đen/teal
  },

  // ── 5. GRASS & MATERIALS ──
  grass: {
    baseColor: 0x145c35,
    tipColor: 0x5fe0a0,
    cyanRimColor: 0x4ff5d0,
    count: 38000,
    bladeHeight: 0.65
  },
  stone: {
    roughness: 0.75,
    metalness: 0.10,
    emissiveColor: 0x243336,   // Đá sáng màu, hoa văn vân đá nổi bật
    emissiveIntensity: 0.35    // Sáng rõ chi tiết
  },

  // ── 6. CAMERAS & FOV ──
  camera: {
    worldFov: 75,
    viewmodelFov: 60,          // FPS tay: FOV riêng để không méo
    near: 0.1,
    far: 600.0                 // Tăng far plane cho thế giới 1000m
  },

  // ── 7. WORLD & TERRAIN ──
  world: {
    size: 1000,                // 1000x1000m terrain
    templeRadius: 28.0,        // Vùng phẳng quanh đền
    maxSlopeClimb: 0.72,       // Độ dốc tối đa leo được
    cullingDistance: 100.0,    // Khoảng cách render foliage
    boundaryRadius: 485.0      // Giới hạn đi (núi biên giới)
  },

  // ── 8. GAMEPLAY ──
  gameplay: {
    requiredRunes: 3,
    totalCrystals: 30,         // Tăng lên 30 tinh thể
    storageKey: 'PHILOVERSE_ANCIENT_TEMPLE_SAVE',
    exposureKey: 'PHILOVERSE_EXPOSURE',
    goldKey: 'PHILOVERSE_GOLD',
    inventoryKey: 'PHILOVERSE_INVENTORY',
    questKey: 'PHILOVERSE_QUESTS',
    farmKey: 'PHILOVERSE_FARM'
  },

  // ── 9. NPC SYSTEM ──
  npc: {
    activationRadius: 80.0,    // Bán kính kích hoạt AI
    interactRadius: 4.0,       // Khoảng cách bắt đầu hội thoại
    walkSpeed: 1.5,            // Tốc độ NPC đi bộ
    patrolWaitTime: 2.5        // Thời gian đứng chờ ở waypoint
  },

  // ── 10. ECONOMY ──
  economy: {
    startingGold: 50,          // Vàng ban đầu
    maxInventorySlots: 20
  },

  // ── 11. FARMING ──
  farming: {
    cropGrowthTime: {          // Thời gian trồng (ms)
      carrot: 180000,          // 3 phút
      rice: 300000,            // 5 phút
      pumpkin: 480000,         // 8 phút
      cyanFlower: 120000,      // 2 phút
      cyanMushroom: 240000     // 4 phút
    }
  }
};
